// Self-test for Gate 1: proves tools/validate.mjs catches real defects.
// It copies the course to a temporary folder, injects one defect at a time into
// topic 01, runs the validator on the copy, and expects a specific failure.
//
// Usage, from the course root:
//   node tools/self-test.mjs
//
// The course itself is never modified.

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const course = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(path.join(os.tmpdir(), "ts-course-self-test-"));

cpSync(course, work, {
  recursive: true,
  filter: (source) => !source.includes(".tmp") && !source.includes(".notebook-check"),
});

const lessonSrc = path.join(work, "tools/sources/01_introduction/lesson.src.md");
const solutionsSrc = path.join(work, "tools/sources/01_introduction/solutions.src.md");
const lessonNb = path.join(work, "01_introduction/lesson.ipynb");
const solutionsNb = path.join(work, "01_introduction/solutions.ipynb");
const topic3LessonSrc = path.join(work, "tools/sources/03_how_typescript_works/lesson.src.md");
const topic3LessonNb = path.join(work, "03_how_typescript_works/lesson.ipynb");
const topic3SolutionsNb = path.join(work, "03_how_typescript_works/solutions.ipynb");
const originals = new Map(
  [lessonSrc, solutionsSrc, lessonNb, solutionsNb, topic3LessonSrc, topic3LessonNb, topic3SolutionsNb].map((file) => [
    file,
    readFileSync(file, "utf8"),
  ]),
);

// Replaces the FIRST occurrence only. Every pattern targets LESSON 1, which always comes
// first in topic 01, so later lessons reusing the same text don't break the test.
function replaceOnce(file, from, to) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(from)) throw new Error(`pattern not found in ${path.basename(file)}: ${from}`);
  writeFileSync(file, text.replace(from, to));
}

const mutations = [
  {
    name: "wrong solution (forgets shipping)",
    apply: () => replaceOnce(solutionsSrc, "return price * quantity + shipping;", "return price * quantity;"),
    expect: "do not all pass against the solution",
  },
  {
    name: "starter already solves the exercise",
    apply: () => {
      replaceOnce(
        lessonSrc,
        "// TODO: return the cost of all the items plus shipping\n  return 0;",
        "return price * quantity + shipping;",
      );
      replaceOnce(lessonSrc, "const l1Total = 0;", "const l1Total = l1OrderTotal(24.5, 2, 4.5);");
    },
    expect: "do not fail against the untouched starter",
  },
  {
    name: "demo cell no longer has a type error",
    apply: () =>
      replaceOnce(
        lessonSrc,
        "console.log(l1AddShipping(l1PriceFromForm, l1Shipping));",
        "console.log(l1AddShipping(Number(l1PriceFromForm), l1Shipping));",
      ),
    expect: "has no type error",
  },
  {
    name: "missing Key Notes section",
    apply: () => replaceOnce(lessonSrc, "### Key Notes\n", ""),
    expect: "sections must be",
  },
  {
    name: "omission ... in example code",
    apply: () => replaceOnce(lessonSrc, "// The fix: turn", "// ...\n// The fix: turn"),
    expect: "used as an omission",
  },
  {
    name: "notebook edited by hand (out of sync with source)",
    build: false,
    apply: () => writeFileSync(lessonNb, `${originals.get(lessonNb)}\n`),
    expect: "is out of date",
  },
  {
    name: "unexpected type error in example",
    apply: () => replaceOnce(lessonSrc, "// The fix: turn", 'const l1Bad: number = "x";\n// The fix: turn'),
    expect: "types: ",
  },
  {
    name: "verification differs between lesson and solutions",
    apply: () =>
      replaceOnce(
        solutionsSrc,
        '["free items, shipping only", l1OrderTotal(0, 5, 4), 4],',
        '["free items, shipping only", l1OrderTotal(0, 6, 4), 4],',
      ),
    expect: "must be identical in lesson and solutions",
  },
  {
    name: "type-error-exercise starter already has no type errors",
    topic: "03_how_typescript_works",
    apply: () =>
      replaceOnce(
        topic3LessonSrc,
        "function l8MonthlyPayment(loanAmount, months) {",
        "function l8MonthlyPayment(loanAmount: number, months: number) {",
      ),
    expect: "has no type error to fix",
  },
  {
    name: "runtime error in example",
    apply: () => replaceOnce(lessonSrc, "// The fix: turn", 'throw new Error("boom");\n// The fix: turn'),
    expect: "threw",
  },
];

let missed = 0;
try {
  for (const mutation of mutations) {
    for (const [file, text] of originals) writeFileSync(file, text);
    mutation.apply();
    const topic = mutation.topic ?? "01_introduction";
    if (mutation.build !== false) {
      const build = spawnSync(process.execPath, ["tools/build-notebooks.mjs", topic], {
        cwd: work,
        encoding: "utf8",
      });
      if (build.status !== 0) throw new Error(`build failed: ${build.stderr}`);
    }
    const result = spawnSync(process.execPath, ["tools/validate.mjs", topic], {
      cwd: work,
      encoding: "utf8",
    });
    const caught = result.status !== 0 && result.stdout.includes(mutation.expect);
    console.log(`${caught ? "CAUGHT" : "MISSED"}  ${mutation.name}`);
    if (!caught) {
      missed += 1;
      console.log(result.stdout, result.stderr);
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(`\n${mutations.length - missed}/${mutations.length} mutations caught.`);
process.exit(missed === 0 ? 0 : 1);
