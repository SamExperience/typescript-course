// Gate 1 — automated, objective checks for one mini-project folder.
//
// Usage, from the course root:
//   node tools/validate-project.mjs 06_mini_project_1_currency_converter
//
// Passing this script does NOT approve a mini-project. Gate 2 (a private reference
// implementation plus the review recorded in TASKS.md) is always required as well.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { courseRoot } from "./build-notebooks.mjs";

const REQUIRED_FILES = ["mini-project.md", "ai-prompt.txt", "review-prompt.txt"];
const REQUIRED_SECTIONS = [
  "Scenario",
  "Objective",
  "Core requirements",
  "Constraints",
  "Starter data",
  "Done when",
  "Suggested commit history",
  "Bonus",
];

const problems = [];
const fail = (message) => problems.push(message);

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: node tools/validate-project.mjs <mini-project folder>");
  process.exit(2);
}
const projectDir = path.join(courseRoot, folder);

// 1. Required files, not empty
for (const file of REQUIRED_FILES) {
  const full = path.join(projectDir, file);
  if (!existsSync(full)) fail(`files: missing ${folder}/${file}`);
  else if (readFileSync(full, "utf8").trim() === "") fail(`files: ${folder}/${file} is empty`);
}

if (problems.length === 0) {
  const brief = readFileSync(path.join(projectDir, "mini-project.md"), "utf8").replace(/\r\n/g, "\n");

  // 2. Brief structure
  if (!/^# Mini-project \d+ — .+/m.test(brief)) fail("brief: missing '# Mini-project N — Title' heading");
  if (!brief.includes("**Prerequisites:**")) fail("brief: missing **Prerequisites:** line");
  if (!brief.includes("**Repository to create:**")) fail("brief: missing **Repository to create:** line");
  const sections = [...brief.matchAll(/^## (.+?)\s*$/gm)].map((match) => match[1]);
  if (sections.join("|") !== REQUIRED_SECTIONS.join("|")) {
    fail(`brief: sections must be [${REQUIRED_SECTIONS.join(", ")}], found [${sections.join(", ")}]`);
  }
  const core = brief.split("## Core requirements")[1]?.split("\n## ")[0] ?? "";
  if ((core.match(/^- \[ \] /gm) ?? []).length < 3) fail("brief: Core requirements need a checklist (- [ ] items)");
  const doneWhen = brief.split("## Done when")[1]?.split("\n## ")[0] ?? "";
  if ((doneWhen.match(/^- \[ \] /gm) ?? []).length < 3) fail("brief: Done when needs a checklist (- [ ] items)");

  // 3. Code blocks: no omissions; typescript blocks must type-check
  const fences = [...brief.matchAll(/^```(\w*)\n([\s\S]*?)^```/gm)].map((match) => ({ lang: match[1], code: match[2] }));
  for (const fence of fences) {
    if (/\.\.\.(?![\w$[({"'`])|…/.test(fence.code)) fail(`brief: a ${fence.lang || "text"} code block uses "..." as an omission`);
  }
  const tsBlocks = fences.filter((fence) => fence.lang === "typescript");
  if (tsBlocks.length > 0) {
    const workDir = path.join(courseRoot, "tools", ".tmp", "projects", folder);
    rmSync(workDir, { recursive: true, force: true });
    mkdirSync(workDir, { recursive: true });
    tsBlocks.forEach((block, index) => writeFileSync(path.join(workDir, `block-${index + 1}.ts`), `${block.code}\nexport {};\n`));
    const tsc = path.join(courseRoot, "playground", "node_modules", "typescript", "lib", "tsc.js");
    const files = tsBlocks.map((_, index) => `block-${index + 1}.ts`);
    const result = spawnSync(process.execPath, [tsc, "--noEmit", "--strict", "--target", "es2022", "--pretty", "false", ...files], {
      cwd: workDir,
      encoding: "utf8",
    });
    if (result.status !== 0) fail(`brief: typescript code blocks don't type-check:\n${result.stdout}${result.stderr}`);
    else console.log(`info: ${tsBlocks.length} typescript code block(s) type-check with the pinned compiler`);
  }

  // 4. Prompts
  const review = readFileSync(path.join(projectDir, "review-prompt.txt"), "utf8");
  for (const marker of ["WHAT I HAVE BEEN TAUGHT", "WHAT I HAVE NOT BEEN TAUGHT", "REVIEW IN THIS ORDER", "HOW TO BEHAVE"]) {
    if (!review.includes(marker)) fail(`review-prompt.txt: missing "${marker}"`);
  }
  const tutor = readFileSync(path.join(projectDir, "ai-prompt.txt"), "utf8");
  for (const marker of ["WHAT I HAVE BEEN TAUGHT", "WHAT I HAVE NOT BEEN TAUGHT"]) {
    if (!tutor.includes(marker)) fail(`ai-prompt.txt: missing "${marker}"`);
  }

  // 5. Folder numbering is consistent with the course
  if (!/^\d{2}_mini_project_\d+_/.test(folder)) fail(`folder: "${folder}" should look like NN_mini_project_K_name`);
}

console.log("");
if (problems.length === 0) {
  console.log(`Gate 1 (automated) PASSED for ${folder}.`);
  console.log("Reminder: Gate 2 (reference implementation + review) is still required before approval.");
  process.exit(0);
}
for (const message of problems) console.log(`FAIL: ${message}`);
console.log(`\nGate 1 (automated) FAILED for ${folder}: ${problems.length} problem(s).`);
process.exit(1);
