// Type-checks the code cells of a course notebook with this playground's
// pinned TypeScript compiler.
//
// Why this exists: the Deno notebook kernel RUNS TypeScript, but it does not
// REPORT type errors. This script shows you the errors the real compiler finds.
//
// Usage, from the playground folder:
//   npm run check:nb -- ../04_basic_types/lesson.ipynb

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const playgroundDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const typescriptDir = path.join(playgroundDir, "node_modules", "typescript");
const tscPath = path.join(typescriptDir, "lib", "tsc.js");

export function typescriptVersion() {
  const packageJson = readFileSync(path.join(typescriptDir, "package.json"), "utf8");
  return JSON.parse(packageJson).version;
}

function cellText(cell) {
  const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source;
  return source.replace(/\r\n/g, "\n");
}

// Tracks the most recent "## LESSON N" and "### Section" headings,
// so errors can be reported as "LESSON 3 › Exercise".
function followHeadings(markdown, position) {
  let inFence = false;
  for (const line of markdown.split("\n")) {
    // Backtick fences only: `tsc --pretty` output contains "~~~~~~" underlines.
    const isFence = /^\s*```/.test(line);
    if (!inFence && !isFence) {
      const lesson = line.match(/^## LESSON (\d+)\b/);
      const section = line.match(/^### (.+?)\s*$/);
      if (lesson) {
        position.lesson = `LESSON ${lesson[1]}`;
        position.section = "";
      } else if (section) {
        position.section = section[1];
      }
    }
    if (isFence) inFence = !inFence;
  }
}

export function checkNotebook(notebookPath) {
  const absolutePath = path.resolve(notebookPath);
  const notebook = JSON.parse(readFileSync(absolutePath, "utf8"));
  const position = { lesson: "", section: "" };

  // All code cells are joined into one TypeScript file, in notebook order.
  // lineMap[i] describes line i + 1 of that file.
  const lines = ["export {};"];
  const lineMap = [null];
  const codeCells = [];

  for (const cell of notebook.cells) {
    const text = cellText(cell);
    if (cell.cell_type === "markdown") {
      followHeadings(text, position);
      continue;
    }
    if (cell.cell_type !== "code") continue;

    const tags = cell.metadata?.tags ?? [];
    const info = {
      lesson: position.lesson,
      section: position.section,
      isDemo: tags.includes("type-error-demo"),
      isExercise: tags.includes("type-error-exercise"),
      errors: [],
    };
    codeCells.push(info);
    text.split("\n").forEach((code, index) => {
      lines.push(code);
      lineMap.push({ cell: info, line: index + 1, code });
    });
    // An empty statement between cells stops one cell's last line
    // from joining the next cell's first line.
    lines.push(";");
    lineMap.push(null);
  }

  const folderName = path.basename(path.dirname(absolutePath));
  const workDir = path.join(
    playgroundDir,
    ".notebook-check",
    `${folderName}-${path.basename(absolutePath, ".ipynb")}`,
  );
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });
  writeFileSync(path.join(workDir, "notebook.ts"), `${lines.join("\n")}\n`);
  writeFileSync(
    path.join(workDir, "tsconfig.json"),
    JSON.stringify(
      {
        extends: "../../tsconfig.json",
        compilerOptions: { noEmit: true, rootDir: "." },
        include: ["notebook.ts"],
      },
      null,
      2,
    ),
  );

  const result = spawnSync(process.execPath, [tscPath, "-p", "tsconfig.json", "--pretty", "false"], {
    cwd: workDir,
    encoding: "utf8",
  });
  if (result.error) throw result.error;

  const errors = [];
  for (const raw of `${result.stdout}${result.stderr}`.split(/\r?\n/)) {
    const match = raw.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
    if (match) {
      const inNotebook = match[1].endsWith("notebook.ts");
      const location = inNotebook ? lineMap[Number(match[2]) - 1] : null;
      const error = { code: match[4], message: match[5], location };
      if (location) location.cell.errors.push(error);
      errors.push(error);
    } else if (raw.startsWith(" ") && errors.length > 0) {
      errors[errors.length - 1].message += `\n${raw}`;
    } else if (raw.trim() !== "") {
      errors.push({ code: "", message: raw, location: null });
    }
  }

  return {
    notebookPath: absolutePath,
    codeCellCount: codeCells.length,
    // Errors in demo cells are there for you to study.
    expected: errors.filter((error) => error.location?.cell.isDemo),
    // Errors in exercise cells are there for you to fix.
    toFix: errors.filter((error) => error.location?.cell.isExercise),
    unexpected: errors.filter((error) => !error.location?.cell.isDemo && !error.location?.cell.isExercise),
    silentDemoCells: codeCells.filter((cell) => cell.isDemo && cell.errors.length === 0),
    silentExerciseCells: codeCells.filter((cell) => cell.isExercise && cell.errors.length === 0),
  };
}

export function describeError(error) {
  if (!error.location) return error.message;
  const { cell, line, code } = error.location;
  const where = [cell.lesson, cell.section].filter(Boolean).join(" > ") || "Notebook";
  return `${where}, line ${line}: ${error.message} (${error.code})\n      ${code.trim()}`;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: npm run check:nb -- <path to a notebook, e.g. ../04_basic_types/lesson.ipynb>");
    process.exit(2);
  }

  const report = checkNotebook(target);
  console.log(
    `Checked ${report.codeCellCount} code cells in ${path.relative(process.cwd(), report.notebookPath)}` +
      ` with TypeScript ${typescriptVersion()}.\n`,
  );
  for (const error of report.expected) {
    console.log(`[expected] ${describeError(error)}`);
  }
  for (const cell of report.silentDemoCells) {
    console.log(`[note] The demo cell in ${cell.lesson} > ${cell.section} should show a type error, but it has none.`);
  }
  for (const error of report.toFix) {
    console.log(`[to fix] ${describeError(error)}`);
  }
  for (const error of report.unexpected) {
    console.log(`[error] ${describeError(error)}`);
  }
  const remaining = report.toFix.length + report.unexpected.length;
  if (remaining === 0) {
    console.log("[ok] No type errors left to fix.");
  } else {
    console.log(`\n${remaining} type error(s) to fix.`);
  }
  process.exit(remaining === 0 ? 0 : 1);
}
