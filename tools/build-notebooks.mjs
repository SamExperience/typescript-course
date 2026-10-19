// Builds course notebooks from their authoring sources.
//
//   tools/sources/<topic>/lesson.src.md     -> <topic>/lesson.ipynb
//   tools/sources/<topic>/solutions.src.md  -> <topic>/solutions.ipynb
//
// Usage, from the course root:
//   node tools/build-notebooks.mjs 01_introduction [02_environment_setup ...]
//
// Source format: a line "<!-- cell: markdown -->" or "<!-- cell: code <tag> -->"
// starts a new cell. Every code cell needs exactly one tag (see CODE_TAGS).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const courseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const sourcesRoot = path.join(courseRoot, "tools", "sources");

export const CODE_TAGS = [
  "setup",
  "example",
  "type-error-demo",
  "starter",
  "type-error-exercise",
  "verification",
  "challenge",
  "solution",
  "challenge-solution",
];

const CELL_MARKER = /^<!-- cell: (markdown|code)(?: ([a-z-]+))? -->\s*$/;

const NOTEBOOK_METADATA = {
  kernelspec: { display_name: "Deno", language: "typescript", name: "deno" },
  language_info: {
    codemirror_mode: "typescript",
    file_extension: ".ts",
    mimetype: "text/x.typescript",
    name: "typescript",
    nbconvert_exporter: "script",
    pygments_lexer: "typescript",
    version: "6.0.3",
  },
};

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start += 1;
  while (end > start && lines[end - 1].trim() === "") end -= 1;
  return lines.slice(start, end);
}

export function parseSource(text, fileLabel) {
  const cells = [];
  let current = null;
  text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((line, index) => {
      const marker = line.match(CELL_MARKER);
      if (marker) {
        const [, type, tag] = marker;
        if (type === "code" && !CODE_TAGS.includes(tag)) {
          throw new Error(`${fileLabel}:${index + 1}: code cell needs one of these tags: ${CODE_TAGS.join(", ")}`);
        }
        if (type === "markdown" && tag) {
          throw new Error(`${fileLabel}:${index + 1}: markdown cells take no tag`);
        }
        if (current) cells.push(current);
        current = { type, tag, lines: [] };
      } else if (current) {
        current.lines.push(line);
      } else if (line.trim() !== "") {
        throw new Error(`${fileLabel}:${index + 1}: text before the first cell marker`);
      }
    });
  if (current) cells.push(current);
  return cells.map(({ type, tag, lines }) => ({ type, tag, text: trimBlankLines(lines).join("\n") }));
}

function toSourceArray(text) {
  if (text === "") return [];
  const lines = text.split("\n");
  return lines.map((line, index) => (index < lines.length - 1 ? `${line}\n` : line));
}

export function renderNotebook(cells, idPrefix) {
  const notebook = {
    cells: cells.map((cell, index) => {
      const id = `${idPrefix}-${String(index + 1).padStart(3, "0")}`;
      if (cell.type === "markdown") {
        return { cell_type: "markdown", id, metadata: {}, source: toSourceArray(cell.text) };
      }
      return {
        cell_type: "code",
        execution_count: null,
        id,
        metadata: { tags: [cell.tag] },
        outputs: [],
        source: toSourceArray(cell.text),
      };
    }),
    metadata: NOTEBOOK_METADATA,
    nbformat: 4,
    nbformat_minor: 5,
  };
  return `${JSON.stringify(notebook, null, 1)}\n`;
}

// Returns [{ name, sourcePath, outputPath, content }] for a topic.
export function buildTopic(topic) {
  const results = [];
  for (const name of ["lesson", "solutions"]) {
    const sourcePath = path.join(sourcesRoot, topic, `${name}.src.md`);
    if (!existsSync(sourcePath)) {
      throw new Error(`Missing source: ${path.relative(courseRoot, sourcePath)}`);
    }
    const cells = parseSource(readFileSync(sourcePath, "utf8"), path.relative(courseRoot, sourcePath));
    results.push({
      name,
      sourcePath,
      outputPath: path.join(courseRoot, topic, `${name}.ipynb`),
      content: renderNotebook(cells, name),
    });
  }
  return results;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const topics = process.argv.slice(2);
  if (topics.length === 0) {
    console.error("Usage: node tools/build-notebooks.mjs <topic folder> [more topic folders]");
    process.exit(2);
  }
  for (const topic of topics) {
    if (!existsSync(path.join(courseRoot, topic))) {
      console.error(`Topic folder not found: ${topic}`);
      process.exit(1);
    }
    for (const built of buildTopic(topic)) {
      writeFileSync(built.outputPath, built.content);
      console.log(`built ${path.relative(courseRoot, built.outputPath)}`);
    }
  }
}
