// Counts every unit in the course, so the README never states a number by hand.
// Usage: node tools/course-stats.mjs        (human-readable)
//        node tools/course-stats.mjs --json (machine-readable)

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const folders = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d\d_/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

function lessonsIn(folder) {
  const file = path.join(root, folder, "lesson.ipynb");
  if (!fs.existsSync(file)) return [];
  const notebook = JSON.parse(fs.readFileSync(file, "utf8"));
  const numbers = [];
  for (const cell of notebook.cells) {
    const text = Array.isArray(cell.source) ? cell.source.join("") : cell.source;
    for (const match of text.matchAll(/^## LESSON (\d+) — (.+?)\s*$/gm)) {
      numbers.push({ number: Number(match[1]), title: match[2] });
    }
  }
  return numbers;
}

const topics = folders.map((folder) => {
  const lessons = lessonsIn(folder);
  return {
    folder,
    isMiniProject: /_mini_project_/.test(folder),
    isOptional: /_optional_/.test(folder),
    lessons,
    first: lessons.length > 0 ? lessons[0].number : null,
    last: lessons.length > 0 ? lessons[lessons.length - 1].number : null,
    hasAiPrompt: fs.existsSync(path.join(root, folder, "ai-prompt.txt")),
    hasReviewPrompt: fs.existsSync(path.join(root, folder, "review-prompt.txt")),
    hasBrief: fs.existsSync(path.join(root, folder, "mini-project.md")),
    hasSolutions: fs.existsSync(path.join(root, folder, "solutions.ipynb")),
  };
});

const all = topics.flatMap((topic) => topic.lessons.map((lesson) => lesson.number));
all.sort((a, b) => a - b);

const gaps = [];
for (let i = 1; i <= all.length; i += 1) {
  if (all[i - 1] !== i) gaps.push(i);
}

const stats = {
  folders: topics.length,
  lessonTopics: topics.filter((topic) => !topic.isMiniProject).length,
  miniProjects: topics.filter((topic) => topic.isMiniProject).length,
  optionalTopics: topics.filter((topic) => topic.isOptional).length,
  lessons: all.length,
  firstLesson: all[0] ?? null,
  lastLesson: all[all.length - 1] ?? null,
  contiguous: gaps.length === 0,
  gaps,
  notebooks: topics.filter((topic) => topic.lessons.length > 0).length * 2,
  aiPrompts: topics.filter((topic) => topic.hasAiPrompt).length,
  reviewPrompts: topics.filter((topic) => topic.hasReviewPrompt).length,
  briefs: topics.filter((topic) => topic.hasBrief).length,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ stats, topics }, null, 2));
} else {
  console.log(`folders            ${stats.folders}`);
  console.log(`lesson topics      ${stats.lessonTopics}`);
  console.log(`mini-projects      ${stats.miniProjects} (briefs: ${stats.briefs})`);
  console.log(`optional topics    ${stats.optionalTopics}`);
  console.log(`lessons            ${stats.lessons} (LESSON ${stats.firstLesson}-${stats.lastLesson})`);
  console.log(`numbering          ${stats.contiguous ? "contiguous" : `GAPS: ${stats.gaps.join(", ")}`}`);
  console.log(`notebooks          ${stats.notebooks}`);
  console.log(`ai-prompt.txt      ${stats.aiPrompts}`);
  console.log(`review-prompt.txt  ${stats.reviewPrompts}`);
  console.log("");
  for (const topic of topics) {
    const range = topic.lessons.length > 0 ? `LESSON ${topic.first}-${topic.last}` : "mini-project";
    console.log(`  ${topic.folder.padEnd(44)} ${range}`);
  }
}
