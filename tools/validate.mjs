// Gate 1 — automated, objective checks for one topic folder.
//
// Usage, from the course root:
//   node tools/validate.mjs 01_introduction
//
// Passing this script does NOT approve a lesson. Gate 2 (the semantic and
// pedagogical review recorded in TASKS.md) is always required as well.
//
// Requires: playground dependencies installed (npm install in playground/),
// and Jupyter with the Deno kernel for notebook execution.

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { buildTopic, courseRoot } from "./build-notebooks.mjs";
import { checkNotebook, describeError, typescriptVersion } from "../playground/scripts/check-notebook.mjs";

const PINNED_TYPESCRIPT = "6.0.3";
const LESSON_SECTIONS = ["Explanation", "Key Notes", "Example", "Exercise", "Verification", "Mini Challenge"];
const SOLUTION_SECTIONS = ["Exercise", "Verification", "Mini Challenge"];
const EXERCISE_NOTICE = "Don't open `solutions.ipynb` until you've genuinely tried.";
// A section whose practice happens in a terminal project (not the notebook) carries this
// marker; it waives that section's required code cell, and Verification PASS/FAIL checks.
const PLAYGROUND_PRACTICE = "<!-- practice: terminal -->";

// Which code-cell tags each section may contain, and which one it must contain.
const LESSON_TAG_RULES = {
  Explanation: { allowed: ["example", "type-error-demo"], required: null },
  "Key Notes": { allowed: [], required: null },
  Example: { allowed: ["example", "type-error-demo"], required: "example" },
  Exercise: { allowed: ["starter", "type-error-exercise"], required: ["starter", "type-error-exercise"] },
  Verification: { allowed: ["verification"], required: "verification" },
  "Mini Challenge": { allowed: ["challenge", "type-error-exercise"], required: ["challenge", "type-error-exercise"] },
};
const SOLUTION_TAG_RULES = {
  Exercise: { allowed: ["solution"], required: "solution" },
  Verification: { allowed: ["verification"], required: "verification" },
  "Mini Challenge": { allowed: ["challenge-solution"], required: "challenge-solution" },
};

const problems = [];
const warnings = [];
let totalLessons = 0;
const fail = (message) => problems.push(message);
const warn = (message) => warnings.push(message);

const cellText = (cell) => (Array.isArray(cell.source) ? cell.source.join("") : cell.source).replace(/\r\n/g, "\n");

function readNotebook(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

// Splits a notebook into topic title, lessons and sections.
function outline(notebook, label) {
  const result = { title: null, lessons: [] };
  let lesson = null;
  let section = null;

  notebook.cells.forEach((cell, index) => {
    const text = cellText(cell);
    if (cell.cell_type === "markdown") {
      let inFence = false;
      for (const line of text.split("\n")) {
        // Course sources always use backtick fences. Tilde lines are not fences here, because
      // `tsc --pretty` output contains "~~~~~~" underlines inside fenced blocks.
      const isFence = /^\s*```/.test(line);
        if (!inFence && !isFence) {
          const title = line.match(/^# TypeScript — (.+?)\s*$/);
          const lessonHeading = line.match(/^## LESSON (\d+) — (.+?)\s*$/);
          const sectionHeading = line.match(/^### (.+?)\s*$/);
          if (title) {
            if (index !== 0) fail(`${label}: the "# TypeScript — ..." title must be in the first cell`);
            result.title = title[1];
            continue;
          }
          if (lessonHeading) {
            lesson = { number: Number(lessonHeading[1]), title: lessonHeading[2], sections: [] };
            result.lessons.push(lesson);
            section = null;
            continue;
          }
          if (/^#{1,2} /.test(line)) fail(`${label}: unexpected heading "${line}"`);
          if (sectionHeading) {
            if (!lesson) {
              fail(`${label}: section "${sectionHeading[1]}" appears before any LESSON heading`);
            } else {
              section = { name: sectionHeading[1], markdown: "", code: [] };
              lesson.sections.push(section);
            }
            continue;
          }
          if (/^#{4,} /.test(line)) fail(`${label}: headings deeper than ### are not used ("${line}")`);
        }
        if (isFence) inFence = !inFence;
        if (section) section.markdown += `${line}\n`;
      }
    } else if (cell.cell_type === "code") {
      const tags = cell.metadata?.tags ?? [];
      if (tags.length !== 1) fail(`${label}: code cell ${index + 1} must have exactly one tag`);
      const tag = tags[0];
      if (!section) {
        if (tag !== "setup" || lesson) fail(`${label}: code cell ${index + 1} is outside a lesson section`);
      } else {
        section.code.push({ tag, text, index });
      }
    }
  });
  if (!result.title) fail(`${label}: missing "# TypeScript — <Topic>" title`);
  return result;
}

function checkSections(parsed, expectedSections, tagRules, label) {
  for (const lesson of parsed.lessons) {
    const where = `${label} LESSON ${lesson.number}`;
    const names = lesson.sections.map((section) => section.name);
    if (names.join("|") !== expectedSections.join("|")) {
      fail(`${where}: sections must be [${expectedSections.join(", ")}], found [${names.join(", ")}]`);
    }
    for (const section of lesson.sections) {
      const rule = tagRules[section.name];
      if (!rule) continue;
      for (const cell of section.code) {
        if (!rule.allowed.includes(cell.tag)) {
          fail(`${where} > ${section.name}: code cell tagged "${cell.tag}" is not allowed here`);
        }
      }
      const terminalPractice = section.markdown.includes(PLAYGROUND_PRACTICE);
      const required = [].concat(rule.required ?? []);
      if (required.length > 0 && !terminalPractice && !section.code.some((cell) => required.includes(cell.tag))) {
        fail(`${where} > ${section.name}: needs a code cell tagged ${required.map((tag) => `"${tag}"`).join(" or ")}`);
      }
    }
  }
}

function fencedCode(markdown) {
  const blocks = [];
  let current = null;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      if (current === null) {
        current = [];
      } else {
        blocks.push(current.join("\n"));
        current = null;
      }
    } else if (current !== null) {
      current.push(line);
    }
  }
  return blocks;
}

// The Deno kernel can drop stdout lines when a cell prints many of them quickly
// (QUALITY_ISSUES QI-009). Keep each cell to a few console.log calls.
const MAX_CONSOLE_LOGS_PER_CELL = 3;
function checkConsoleLogs(parsed, label) {
  for (const lesson of parsed.lessons) {
    for (const section of lesson.sections) {
      for (const cell of section.code) {
        const count = (cell.text.match(/console\.log\(/g) ?? []).length;
        if (count > MAX_CONSOLE_LOGS_PER_CELL) {
          fail(`${label} LESSON ${lesson.number} > ${section.name}: a code cell has ${count} console.log calls (max ${MAX_CONSOLE_LOGS_PER_CELL}; see QI-009)`);
        }
        if (/\b(for|while)\s*\([^)]*\)[^\n]*console\.log|forEach\([^\n]*console\.log/.test(cell.text)) {
          fail(`${label} LESSON ${lesson.number} > ${section.name}: console.log inside a loop can lose output lines (QI-009)`);
        }
      }
    }
  }
}

// "..." is only allowed as spread/rest syntax, never as "code omitted here".
function checkNoOmissions(parsed, label) {
  const omission = /\.\.\.(?![\w$[({"'`])|…/;
  for (const lesson of parsed.lessons) {
    for (const section of lesson.sections) {
      const snippets = [...section.code.map((cell) => cell.text), ...fencedCode(section.markdown)];
      if (snippets.some((snippet) => omission.test(snippet))) {
        fail(`${label} LESSON ${lesson.number} > ${section.name}: code contains "..." used as an omission`);
      }
    }
  }
}

function sectionOf(lesson, name) {
  return lesson.sections.find((section) => section.name === name);
}

function readingWords(lesson) {
  let words = 0;
  for (const name of ["Explanation", "Key Notes", "Example", "Exercise", "Verification", "Mini Challenge"]) {
    const section = sectionOf(lesson, name);
    if (!section) continue;
    words += section.markdown.split(/\s+/).filter(Boolean).length;
    if (name === "Example") {
      words += section.code.reduce((sum, cell) => sum + cell.text.split(/\s+/).filter(Boolean).length, 0);
    }
  }
  return words;
}

function courseWideNumbering() {
  const folders = readdirSync(courseRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{2}_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  folders.forEach((folder, index) => {
    const expected = String(index + 1).padStart(2, "0");
    if (!folder.startsWith(`${expected}_`)) fail(`course: folder "${folder}" should be numbered ${expected}`);
  });

  const numbers = [];
  for (const folder of folders) {
    const lessonFile = path.join(courseRoot, folder, "lesson.ipynb");
    if (!existsSync(lessonFile)) continue;
    const parsed = outline(readNotebook(lessonFile), `${folder}/lesson.ipynb`);
    numbers.push(...parsed.lessons.map((lesson) => lesson.number));
  }
  numbers.forEach((number, index) => {
    if (number !== index + 1) fail(`course: LESSON numbers must run 1..N with no gaps; position ${index + 1} is LESSON ${number}`);
  });
  return numbers.length;
}

function executeNotebook(file, outputDir) {
  mkdirSync(outputDir, { recursive: true });
  const name = path.basename(file, ".ipynb");
  const result = spawnSync(
    "jupyter",
    [
      "nbconvert",
      "--to",
      "notebook",
      "--execute",
      "--allow-errors",
      "--ExecutePreprocessor.kernel_name=deno",
      "--ExecutePreprocessor.timeout=180",
      "--output-dir",
      outputDir,
      "--output",
      name,
      file,
    ],
    { encoding: "utf8" },
  );
  if (result.error || result.status !== 0) {
    fail(`execution: nbconvert failed for ${path.relative(courseRoot, file)}\n${result.error ?? result.stderr}`);
    return null;
  }
  return readNotebook(path.join(outputDir, `${name}.ipynb`));
}

// Returns { lessonNumber: "stdout of its verification cells" } and flags runtime errors.
function inspectExecution(executed, label) {
  const verificationOutput = {};
  let currentLesson = null;
  executed.cells.forEach((cell, index) => {
    if (cell.cell_type === "markdown") {
      const match = cellText(cell).match(/^## LESSON (\d+) — /m);
      if (match) currentLesson = Number(match[1]);
      return;
    }
    if (cell.cell_type !== "code") return;
    const outputs = cell.outputs ?? [];
    for (const output of outputs) {
      if (output.output_type === "error") {
        fail(`${label}: code cell ${index + 1} threw ${output.ename}: ${output.evalue}`);
      }
      if (output.output_type === "stream" && output.name === "stderr") {
        fail(`${label}: code cell ${index + 1} wrote to stderr: ${[].concat(output.text).join("")}`);
      }
    }
    if ((cell.metadata?.tags ?? []).includes("verification") && currentLesson !== null) {
      const text = outputs
        .filter((output) => output.output_type === "stream" && output.name === "stdout")
        .map((output) => [].concat(output.text).join(""))
        .join("");
      verificationOutput[currentLesson] = (verificationOutput[currentLesson] ?? "") + text;
    }
  });
  return verificationOutput;
}

// ---------------------------------------------------------------------------

const topic = process.argv[2];
if (!topic) {
  console.error("Usage: node tools/validate.mjs <topic folder>");
  process.exit(2);
}
const topicDir = path.join(courseRoot, topic);
const lessonFile = path.join(topicDir, "lesson.ipynb");
const solutionsFile = path.join(topicDir, "solutions.ipynb");
const promptFile = path.join(topicDir, "ai-prompt.txt");

// 1. Required files
for (const file of [lessonFile, solutionsFile, promptFile]) {
  if (!existsSync(file)) fail(`files: missing ${path.relative(courseRoot, file)}`);
}
if (problems.length > 0) {
  report();
}

// 2. Notebooks are in sync with their sources
for (const built of buildTopic(topic)) {
  if (readFileSync(built.outputPath, "utf8") !== built.content) {
    fail(`sources: ${path.relative(courseRoot, built.outputPath)} is out of date — run node tools/build-notebooks.mjs ${topic}`);
  }
}

// 3. Structure
const lesson = outline(readNotebook(lessonFile), `${topic}/lesson.ipynb`);
const solutions = outline(readNotebook(solutionsFile), `${topic}/solutions.ipynb`);
if (lesson.lessons.length === 0) fail(`${topic}/lesson.ipynb: no lessons found`);
if (lesson.title !== solutions.title) fail(`structure: lesson and solutions titles differ`);
const lessonIds = lesson.lessons.map((item) => `${item.number} — ${item.title}`);
const solutionIds = solutions.lessons.map((item) => `${item.number} — ${item.title}`);
if (lessonIds.join("|") !== solutionIds.join("|")) {
  fail(`structure: solutions must list the same lessons in the same order\n  lesson:    ${lessonIds.join(" / ")}\n  solutions: ${solutionIds.join(" / ")}`);
}
checkSections(lesson, LESSON_SECTIONS, LESSON_TAG_RULES, `${topic}/lesson.ipynb`);
checkSections(solutions, SOLUTION_SECTIONS, SOLUTION_TAG_RULES, `${topic}/solutions.ipynb`);
checkNoOmissions(lesson, `${topic}/lesson.ipynb`);
checkNoOmissions(solutions, `${topic}/solutions.ipynb`);
checkConsoleLogs(lesson, `${topic}/lesson.ipynb`);
checkConsoleLogs(solutions, `${topic}/solutions.ipynb`);

const playgroundVerified = new Set();
for (const item of lesson.lessons) {
  const exercise = sectionOf(item, "Exercise");
  if (exercise && !exercise.markdown.includes(EXERCISE_NOTICE)) {
    fail(`${topic} LESSON ${item.number} > Exercise: missing the notice "${EXERCISE_NOTICE}"`);
  }
  const verification = sectionOf(item, "Verification");
  if (verification?.markdown.includes(PLAYGROUND_PRACTICE)) playgroundVerified.add(item.number);

  const match = solutions.lessons.find((candidate) => candidate.number === item.number);
  const solutionVerification = match && sectionOf(match, "Verification");
  if (verification && solutionVerification) {
    const lessonChecks = verification.code.map((cell) => cell.text).join("\n");
    const solutionChecks = solutionVerification.code.map((cell) => cell.text).join("\n");
    if (lessonChecks !== solutionChecks) {
      fail(`${topic} LESSON ${item.number} > Verification: the check cells must be identical in lesson and solutions`);
    }
  }
  if (match && !match.sections.some((section) => /\*\*Common mistakes\*\*/.test(section.markdown))) {
    fail(`${topic}/solutions.ipynb LESSON ${item.number}: missing a "**Common mistakes**" note`);
  }

  const words = readingWords(item);
  if (words > 800) warn(`${topic} LESSON ${item.number}: ${words} words — too long for the concise style (aim ≤ ~700)`);
  if (words < 150) warn(`${topic} LESSON ${item.number}: only ${words} words — check the lesson is complete`);
  console.log(`info: LESSON ${item.number} reading size ≈ ${words} words`);
}

// 4. AI tutor prompt covers every lesson in the topic.
// The "DO NOT INTRODUCE YET" block names later lessons, so a mention there doesn't count:
// the prompt must describe each lesson of this topic in the teaching part above it.
if (existsSync(promptFile)) {
  const prompt = readFileSync(promptFile, "utf8");
  const taught = prompt.split("DO NOT INTRODUCE YET")[0];
  for (const item of lesson.lessons) {
    if (!new RegExp(`LESSON ${item.number}\\b`).test(taught)) {
      fail(`${topic}/ai-prompt.txt: does not describe LESSON ${item.number} (a mention under "DO NOT INTRODUCE YET" does not count)`);
    }
  }
}

// 5. Course-wide numbering
totalLessons = courseWideNumbering();

// 6. Type checking with the pinned compiler (both notebooks)
const installedTypescript = typescriptVersion();
if (installedTypescript !== PINNED_TYPESCRIPT) {
  fail(`typescript: playground has ${installedTypescript}, but the course is pinned to ${PINNED_TYPESCRIPT}`);
}
for (const file of [lessonFile, solutionsFile]) {
  const result = checkNotebook(file);
  const label = path.relative(courseRoot, file);
  for (const error of result.unexpected) fail(`types: ${label}: ${describeError(error)}`);
  for (const cell of result.silentDemoCells) {
    fail(`types: ${label}: demo cell in ${cell.lesson} > ${cell.section} is tagged type-error-demo but has no type error`);
  }
  for (const cell of result.silentExerciseCells) {
    fail(`types: ${label}: exercise cell in ${cell.lesson} > ${cell.section} is tagged type-error-exercise but has no type error to fix`);
  }
  console.log(`info: ${label} — ${result.codeCellCount} code cells type-checked, ${result.expected.length} expected demo error(s)`);
}

// 7. Execution in the Deno kernel + meaningful verification
const outputDir = path.join(courseRoot, "tools", ".tmp", "executed", topic);
const executedLesson = executeNotebook(lessonFile, outputDir);
const executedSolutions = executeNotebook(solutionsFile, outputDir);
if (executedLesson && executedSolutions) {
  const lessonChecks = inspectExecution(executedLesson, `${topic}/lesson.ipynb (executed)`);
  const solutionChecks = inspectExecution(executedSolutions, `${topic}/solutions.ipynb (executed)`);
  for (const item of lesson.lessons) {
    if (playgroundVerified.has(item.number)) continue;
    const onStarter = lessonChecks[item.number] ?? "";
    const onSolution = solutionChecks[item.number] ?? "";
    if (!onStarter.includes("FAIL")) {
      fail(`verification: LESSON ${item.number} checks do not fail against the untouched starter code`);
    }
    if (!onSolution.includes("PASS") || onSolution.includes("FAIL")) {
      fail(`verification: LESSON ${item.number} checks do not all pass against the solution\n${onSolution}`);
    }
  }
}

report();

function report() {
  console.log("");
  for (const message of warnings) console.log(`warning: ${message}`);
  if (problems.length === 0) {
    console.log(`Gate 1 (automated) PASSED for ${topic}. Course lessons so far: ${totalLessons}.`);
    console.log("Reminder: Gate 2 (semantic and pedagogical review) is still required before approval.");
    process.exit(0);
  }
  for (const message of problems) console.log(`FAIL: ${message}`);
  console.log(`\nGate 1 (automated) FAILED for ${topic}: ${problems.length} problem(s).`);
  process.exit(1);
}
