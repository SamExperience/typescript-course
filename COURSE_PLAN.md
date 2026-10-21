# COURSE_PLAN — TypeScript course

This file is the **approved source of truth** for building the course. Read it first in
every new session, then read `TASKS.md`.

## 0. Resume procedure (after a new session or context reset)

1. Read this file completely.
2. Read `TASKS.md`: the "Current state" block, then the section of the current task.
   Read `QUALITY_ISSUES.md` (at least its prevention checklist) before starting any unit.
3. Inspect the repository (`ls` the course root, open the current topic's source files in
   `tools/sources/`).
4. Find the latest unit marked `[x]` and the first `[~]` or `[ ]` task after it.
5. Continue from there with the workflow in §7. Never skip a gate.

## 1. Course identity

- **Subject:** TypeScript, from beginner to strong beginner-intermediate.
- **Location:** `C:\Sam\Progetti IT\typescript-course\` (sibling of `js-vanilla-course` and
  `react-complete course`, whose house style it follows).
- **Prerequisite:** `js-vanilla-course` finished. JavaScript is assumed (functions, objects,
  arrays and array methods, destructuring, spread, classes, modules, promises/async, errors).
  Only TypeScript is taught. A JavaScript feature may get a one-line reminder the first time
  a lesson relies on it.
- **Language of all material:** simple, natural, precise English written for international
  learners. Code comments in English.

## 2. Approved roadmap (verbatim structure, source of truth)

### LEVEL 1 — FUNDAMENTALS
- **Lesson 1: Introduction to TypeScript** — what TypeScript is; why it exists; TypeScript
  vs JavaScript; benefits and limitations; when TypeScript is useful; TypeScript in modern
  web development.
- **Lesson 2: Environment Setup** — Node.js and npm; installing TypeScript; the compiler
  (`tsc`); running TypeScript files; basic project structure; `tsconfig.json`.
- **Lesson 3: How TypeScript Works** — type annotations; type inference; static type
  checking; compile-time vs runtime; TypeScript → JavaScript; what TypeScript does and does
  not protect against.
- **Lesson 4: Basic Types** — `string`; `number`; `boolean`; `null`; `undefined`; type
  annotations; type inference; basic type checking.
- **Lesson 5: Objects, Arrays and Tuples** — object types; optional properties; arrays;
  typed arrays; tuples; readonly tuples; practical data modeling.
- **MINI-PROJECT 1 — Currency Converter & Account Balance.** Model a customer profile with
  a typed object; store financial values in typed arrays; represent fixed exchange data with
  tuples; convert an amount between supported currencies; check whether the balance is
  sufficient; display the resulting balance and conversion information. Constraints: only
  Lessons 1–5; no classes, interfaces, enums, union types, generics, external libraries;
  intentionally small. Separate public GitHub repository.

### LEVEL 2 — TYPE MODELING AND FUNCTIONS
- **Lesson 6: Type Composition and Narrowing** — `any`; `unknown`; why `unknown` is safer
  than `any`; union types; literal types; type aliases; custom types; enums; basic type
  narrowing; discriminated data.
- **Lesson 7: Functions** — function parameters; parameter types; return types; optional
  parameters; default parameters; function expressions; arrow functions; function types;
  type-safe function design.
- **MINI-PROJECT 2 — Banking Transaction Validator.** Model different transaction types;
  custom types and union types for transaction data; an enum for status or category;
  validate transaction data; filter by criteria; calculate totals; handle unknown input
  safely. Constraints: only Lessons 1–7; no classes, interfaces, generics, decorators,
  external libraries; small domain. Separate public repository.

### LEVEL 3 — COMPILER, CLASSES AND INTERFACES
- **Lesson 8: The TypeScript Compiler and `tsconfig.json`** — `tsc`; type checking;
  compilation; `target`; `module`; `rootDir`; `outDir`; strict mode; important compiler
  options; development workflow; compilation errors.
- **Lesson 9: Classes** — class syntax; properties; constructors; methods; access modifiers
  (`public`, `private`, `protected`); `readonly`; parameter properties; `static`; getters and
  setters; inheritance (`extends`, `super`); abstract classes; composition vs inheritance.
- **Lesson 10: Interfaces** — interface syntax; object contracts; optional properties;
  readonly properties; method definitions; extending interfaces; implementing interfaces;
  interface vs type alias; choosing between them.
- **MINI-PROJECT 3 — Banking Accounts & Loans Management System.** Interfaces for common
  financial contracts; classes for savings/deposit accounts, credit cards, loans; basic
  account operations; basic interest; appropriate access modifiers; inheritance or
  composition where appropriate; shared behaviour through interfaces. Constraints: only
  Lessons 1–10; no database, backend, external libraries, advanced architecture; small
  domain; not a real banking service. Separate public repository.

### LEVEL 4 — ADVANCED PRACTICAL TYPESCRIPT
- **Lesson 11: Generics** — why generics exist; generic functions; generic types; generic
  interfaces; generic classes; generic constraints; `keyof`; practical generic patterns; when
  generics are useful; avoiding unnecessary generics.
- **Lesson 12: Utility Types** — `Partial`; `Required`; `Readonly`; `Pick`; `Omit`;
  `Record`; `Exclude`; `Extract`; `ReturnType`; `Parameters`; combining utility types with
  custom types.
- **Lesson 13: Advanced Type Narrowing** — `typeof`; `instanceof`; `in`; discriminated
  unions; type guards; user-defined type guards; exhaustive checking; `never`.
- **Lesson 14: Modules and Project Organization** — `export`; `import`; named exports;
  default exports; type-only imports (`import type`); module organization; separating types
  from implementation; organizing an application into multiple files; practical project
  structure.
- **MINI-PROJECT 4 — Trading Portfolio & Transaction Engine.** Model different asset types;
  a generic `Portfolio` structure; add and remove assets; basic buy/sell transactions; simple
  portfolio totals; validate transactions; modules separating domain types and logic;
  discriminated unions or type guards where appropriate; utility types where they clearly
  help. Constraints: only Lessons 1–14; simple trading model; no real financial APIs,
  database, authentication, external services, production architecture, real trading,
  complex financial calculations, or untaught technologies. Separate public repository.

### OPTIONAL ADVANCED SECTION (not required by any mini-project)
- **Optional Lesson 15: Decorators** — what decorators are; why they exist; syntax; the
  modern TypeScript decorator model; a simple practical example; common use cases; when
  they are useful; when to avoid them.
- **Optional Lesson 16: Advanced Type-Level Programming** — conditional types; mapped
  types; `infer`; template literal types; practical examples; combining features; when it
  is useful; when it becomes unnecessary complexity. An introduction, not exhaustive.

### Project progression rule
Lessons 1–5 → MP1 · Lessons 6–7 → MP2 · Lessons 8–10 → MP3 · Lessons 11–14 → MP4.
Each project is strictly limited to concepts already taught. Financial narrative:
currency/balance → transaction validation → banking domain model → trading portfolio.
Educational projects, never presented as production banking or trading systems.

## 3. Course architecture

```
typescript-course/
├── README.md                 (written last; counts generated by script)
├── COURSE_PLAN.md            (this file)
├── TASKS.md                  (task list and current state)
├── PUBLISHING_GUIDE.md       (written with MP1)
├── LICENSE  .gitignore
├── playground/               supporting Node + TypeScript project (see §5)
├── tools/                    authoring and validation scripts (see §6)
│   └── sources/<topic>/      lesson.src.md, solutions.src.md  (authoritative sources)
├── NN_topic/                 lesson.ipynb, solutions.ipynb, ai-prompt.txt
└── NN_mini_project_K_name/   mini-project.md, ai-prompt.txt, review-prompt.txt
```

### Topic → lesson mapping (micro-lesson split of the roadmap; order unchanged)

| Folder | Roadmap | LESSONs |
|---|---|---|
| 01_introduction | L1 | 1-3: what TypeScript is and why it exists (TS vs JS) · benefits, limits, and when TypeScript is useful · TypeScript in modern web development |
| 02_environment_setup | L2 | 4-7: Node/npm and installing TypeScript · `tsc` and running files · basic project structure · a first `tsconfig.json` |
| 03_how_typescript_works | L3 | 8-11: annotations and inference · static type checking · compile time vs runtime, TS → JS · what TypeScript does and does not protect against |
| 04_basic_types | L4 | 12-15: `string`, `number`, `boolean` · `null` and `undefined` · annotate or infer · basic type checking: reading type errors |
| 05_objects_arrays_tuples | L5 | 16-20: object types · optional properties · typed arrays · tuples and readonly tuples · practical data modeling |
| 06_mini_project_1_currency_converter | MP1 | — |
| 07_type_composition_narrowing | L6 | 21-27: `any` vs `unknown` · union types · literal types · type aliases and custom types · enums · basic narrowing · discriminated data |
| 08_functions | L7 | 28-32: parameter and return types · optional and default parameters · function expressions and arrow functions · function types · type-safe function design |
| 09_mini_project_2_transaction_validator | MP2 | — |
| 10_compiler_tsconfig | L8 | 33-37: `tsc` — type checking vs compilation · `target` and `module` · `rootDir` and `outDir` · strict mode and important options · development workflow and compilation errors |
| 11_classes | L9 | 38-45: syntax, properties, constructors, methods · `public`/`private`/`protected` · `readonly` and parameter properties · `static` · getters and setters · `extends` and `super` · abstract classes · composition vs inheritance |
| 12_interfaces | L10 | 46-50: syntax, optional and readonly properties · method definitions · extending interfaces · implementing interfaces · interface vs type alias |
| 13_mini_project_3_banking_accounts_loans | MP3 | — |
| 14_generics | L11 | 51-55: why generics exist, generic functions · generic types and interfaces · generic classes · constraints and `keyof` · practical patterns and avoiding unnecessary generics |
| 15_utility_types | L12 | 56-61: `Partial`/`Required`/`Readonly` · `Pick`/`Omit` · `Record` · `Exclude`/`Extract` · `ReturnType`/`Parameters` · combining utility types |
| 16_advanced_narrowing | L13 | 62-66: `typeof` and `instanceof` · `in` · discriminated unions · user-defined type guards · exhaustive checking and `never` |
| 17_modules_organization | L14 | 67-70: named and default exports/imports · `import type` · separating types from implementation · multi-file project structure |
| 18_mini_project_4_trading_portfolio | MP4 | — |
| 19_optional_decorators | Opt L15 | 71-73: what, why and syntax (modern model) · a practical example · when to use and when to avoid |
| 20_optional_type_level | Opt L16 | 74-78: conditional types · mapped types · `infer` · template literal types · combining features, and when it is too much |

Lesson numbers are provisional until each topic is built; a split change inside a topic is
allowed only if it keeps roadmap order and is recorded in §10.

## 4. Pedagogical rules

- **Teaching quality > technical sophistication.** A correct but hard-to-follow explanation
  fails and is rewritten.
- One concept (or one tight group) per micro-lesson. ~5 minutes is a **maximum**, not a
  target to fill. Exercises 10–30 min.
- **Concise style (user requirement, 2026-09-15):** explain each idea once, then move to
  code. Short paragraphs, clear examples, easy to scan. No background that doesn't help the
  exercise. No long explanations of concepts taught later (one-line forward reference at
  most). Don't re-explain JavaScript. Key Notes are ≤ 5 short bullets that restate, never
  extend. Infrastructure detail lives only in the notebook header. Aim ≤ ~700 words per
  lesson (validator warns above 800).
- For each important concept the student must understand: what it is, why it exists, what
  problem it solves, how it works, when to use it, and (when useful) when not to. Concrete
  example before formal terminology. These are an internal standard, not visible headings.
- No history lessons, no academic language, short sentences, explain new terms on first use.
- Exercise mix across the course: ≈70% guided, ≈20% reasoning, ≈10% open-ended.
- Exercises never just rename the example. Realistic scenarios (the course uses small
  shop/banking/finance contexts, consistent with the project narrative).
- Mini-projects describe *what* to build, never *how*. Concepts are used only where they
  genuinely fit; complexity comes from growing knowledge, not requirement inflation.

### Lesson notebook structure (`lesson.ipynb`)

Cell 1: `# TypeScript — <Topic>` plus a short "how this notebook works" note.
Cell 2 (from the first topic with verification cells): the `setup` cell defining `check`.
Then, for each lesson, in this exact order:

1. `## LESSON N — Title` followed by `### Explanation`
2. `### Key Notes`
3. `### Example` — runnable `example` cell(s); optional `type-error-demo` cells
4. `### Exercise` — task text, a `starter` cell, and the notice
   "Don't open `solutions.ipynb` until you've genuinely tried."
5. `### Verification` — a `verification` cell using `check(...)`, which the student runs
   after the exercise.

**Terminal-practice lessons** (only where a notebook cannot do the job: installing,
compiling, `tsconfig.json`, multi-file modules): a section whose practice happens in the
student's `ts-scratch` project carries `<!-- practice: terminal -->`. That waives the
section's required code cell (in lesson and solutions) and, for Verification, the PASS/FAIL
execution check. The Verification text then states the exact command and expected output,
and that output is verified by actually running it during Gate 2.
6. `### Mini Challenge` — reasoning variation plus a `challenge` cell

Learning cycle: Explanation → Example → Student Practice → Verification → Mini Challenge.

### Solutions notebook structure (`solutions.ipynb`)

Same title, same setup cell, same `## LESSON N — Title` headings in the same order, each with
`### Exercise` (`solution` cell + short why), `### Verification` (identical `verification`
cell), `### Mini Challenge` (`challenge-solution` cell + explanation). Each lesson includes a
`**Common mistakes**` note. Solutions introduce no new concepts.

### Code-cell categories (cell metadata tag)

| Tag | Meaning | Automated requirement |
|---|---|---|
| `setup` | course helper (`check`) | runs, type-checks |
| `example` | teaching code | runs in Deno, type-checks with pinned `tsc` |
| `type-error-demo` | intentional type error | runs in Deno (no runtime crash), and **must** produce a `tsc` error |
| `starter` | technically valid starting point (placeholders like `return 0` allowed) | runs, type-checks. Says nothing about pedagogical correctness |
| `verification` | tests the real required behaviour | type-checks; prints at least one `FAIL` against the untouched starter, and only `PASS` against the solution |
| `type-error-exercise` | a starter (Exercise or Mini Challenge) whose type errors ARE the task, e.g. missing annotations. First line: `// This cell has type errors on purpose. Fix them.` | runs in Deno; **must** produce ≥ 1 `tsc` error; the solution must produce none. `check:nb` shows these as `[to fix]` |
| `challenge` | Mini Challenge workspace | runs, type-checks |
| `solution` / `challenge-solution` | complete reference answers | run, type-check |

`checkAll([[label, actual, expected], ...])` compares each case with `JSON.stringify` and
prints all `PASS  label` / `FAIL  label — expected X, got Y` lines in **one** `console.log`.
All verification cells use it (uniform convention). One print per call matters: the Deno
kernel can drop output lines when a cell prints many lines quickly (QI-009), so every code
cell has at most 3 `console.log` calls and none inside a loop (enforced by the validator).

## 5. Environments and tooling decisions

- **Jupyter + Deno kernel is the primary learning and practice environment.**
- **Verified 2026-09-15:** the Deno kernel (Deno 2.9.6, bundled TypeScript 6.0.3) *runs*
  TypeScript but does **not report type errors** (`const n: number = "hello"` runs and
  prints). It also allows redeclaring `let`, `const` and functions in a later cell (verified),
  so students can safely re-run exercise cells after editing them. Consequences:
  - students see type errors with `npm run check:nb -- ../<topic>/lesson.ipynb` in
    `playground/` (pinned compiler, errors reported as "LESSON N > Section, line L");
  - example identifiers use an `lN` prefix (`l12Price`) so the combined notebook type-checks
    without redeclaration clashes;
  - lessons state plainly that running a cell is not type checking.
- **Pinned compiler:** `playground/package.json` → `typescript` **6.0.3** (exact, same as
  Deno's bundled TS) and `@types/node` **24.13.4**. The global `tsc` (7.0.2 on this machine)
  is never used for validation. Examples avoid features newer than TypeScript 6.0.
- **Playground tsconfig:** `target`/`lib` ES2022, `module`/`moduleResolution` NodeNext,
  `types: ["node"]`, `rootDir: src`, `outDir: dist`, `strict: true`, `skipLibCheck`,
  `forceConsistentCasingInFileNames`. Scripts: `check`, `build`, `start`, `check:nb`.
- **Playground role:** technical support only (real `tsc`, `tsconfig.json`, compiler
  behaviour, multi-file modules, Node execution, notebook type checking). No lessons,
  explanations or parallel exercises are duplicated there. Not a per-lesson requirement,
  except that lessons may suggest `check:nb` to see type errors.
- **Exercise placeholder fences** use `typescript`, not `javascript` (deviation from the
  generic prompt template, because the course language is TypeScript).

## 6. Validation tooling (`tools/`)

- `node tools/build-notebooks.mjs <topic>` — builds `lesson.ipynb` and `solutions.ipynb` from
  `tools/sources/<topic>/*.src.md`. Sources are authoritative; never hand-edit notebooks.
  Source format: `<!-- cell: markdown -->` or `<!-- cell: code <tag> -->` starts a cell.
  **Code fences in notebook sources always use backticks**, never `~~~`: the tools treat only
  backtick lines as fences, because `tsc --pretty` output contains `~~~~~~` underlines.
- `node tools/validate.mjs <topic>` — **Gate 1 (objective checks only):**
  required files; notebooks in sync with sources; title; LESSON headings identical in both
  notebooks; exact six sections (lesson) and three sections (solutions); tag rules per
  section; exercise notice; identical verification cells; `**Common mistakes**` present;
  no `...` used as omission in code; ai-prompt mentions every LESSON; course-wide folder and
  LESSON numbering contiguous; pinned TypeScript version; `tsc` check of all code cells of
  **both** notebooks (demo cells must error, nothing else may); Deno execution of both
  notebooks with no runtime errors or stderr; verification prints FAIL on the starter and
  only PASS on the solution; reading-size warning (>1100 or <250 words).
- `node tools/self-test.mjs` — proves Gate 1 has teeth: copies the course to a temp folder,
  injects 10 known defects one at a time (9 in topic 01, plus a `type-error-exercise` cell
  with nothing left to fix in topic 03), and expects each to be caught. Re-run
  it after any change to `validate.mjs` or `check-notebook.mjs`.
- `node tools/validate-project.mjs <mini-project folder>` — **Gate 1 for mini-projects:**
  required files (`mini-project.md`, `ai-prompt.txt`, `review-prompt.txt`), required brief
  sections, no `...` omissions in code blocks, every `typescript` code block in the brief
  type-checks with the pinned compiler, the review prompt has taught/not-taught lists, the
  tutor prompt has a "DO NOT INTRODUCE" list. Gate 2 additionally requires a **private
  reference implementation** (scratchpad only, never committed) that satisfies every Core
  requirement using only the concepts allowed at that checkpoint, verified with
  `npm run check`, `npm run build` and `npm start`.
- Dependencies: Node 20+, playground `npm install`, Jupyter with the `deno` kernelspec.
- Passing Gate 1 never approves a lesson.

## 7. Workflow and quality gates

`BUILD → CHECK → FIX → RECHECK → APPROVE → NEXT`, one LESSON at a time.

1. BUILD: write the lesson cells and solution cells in `tools/sources/<topic>/`, update the
   topic's `ai-prompt.txt`, run the builder.
2. CHECK: Gate 1 (`validate.mjs`) and Gate 2 (review below).
3. FIX every issue; RECHECK both gates.
4. APPROVE: mark the LESSON `[x]` in `TASKS.md` with both gate results and the concepts
   added to the ledger (§8). Only then start the next LESSON.

**Gate 2 — semantic and pedagogical review (every lesson):**
A. roadmap and scope (alignment, numbering, no additions/omissions, nothing early) ·
B. prerequisites (ledger; JS knowledge assumed) ·
C. teaching quality (what/why/problem/how/when/when-not; simple before formal) ·
D. Feynman test (the student could explain it simply afterwards) ·
E. examples (runnable, complete, small, on-concept, useful English comments) ·
F. immediate hands-on practice (real cell, fair starter, relevant, achievable) ·
G. progression and difficulty (no jumps; guided → independent; mix) ·
H. solutions (correct, readable, taught concepts only, same order) ·
I. TypeScript correctness (types, compiler behaviour, compile time vs runtime accurate,
   demo errors documented) ·
J. **native-English review** as a native English-speaking technical educator (grammar,
   punctuation, natural sentence structure, terminology, collocations, clarity for
   international learners, nothing that sounds translated; simple, natural, precise — not
   more advanced) ·
K. consistency (terminology, style, structure, conventions, no contradictions) ·
L. length and focus (~5-minute read, nothing added just because it is interesting) ·
plus: the example clarifies the explanation; the exercise genuinely practises the concept
and cannot be satisfied by the placeholder or by renaming the example; the verification
tests the important behaviour and would fail for a meaningful wrong implementation; the
Mini Challenge adds reasoning, not repetition; no hidden knowledge is needed.

**Mini-project gate:** scope (achievable with taught concepts only, nothing external, small),
requirements (clear, consistent, no hidden requirements, what not how), learning value
(reinforces preceding lessons, real reasons for each concept, independent decisions left),
complexity discipline, review-prompt coverage (correctness, requirements, taught vs untaught,
unnecessary complexity, readability, bugs, scope; no redesign), native-English review of the
brief, requirements and prompts. Gate passes before the next block starts.

**Final QA:** a whole-course re-run of the same checks (no new standards), plus README counts
generated by script and a playground `npm run check && npm run build && npm start`.

## 8. Prerequisite ledger

TypeScript concepts the student may use, by the LESSON that introduced them. Updated only
when a lesson is approved. Anything not listed here is not yet taught.

| LESSON | Concepts introduced (usable from the next cell onwards) |
|---|---|
| — | JavaScript from `js-vanilla-course` (assumed) |
| 1 | What a type is; the TypeScript compiler checks code before it runs; types are removed before runtime; READING a parameter annotation (`price: number`) and calling annotated functions correctly (writing annotations is taught in LESSON 8); running a notebook cell is not type checking; `npm run check:nb`; the `checkAll` helper and PASS/FAIL verification |
| 2 | The compiler catches type mistakes (wrong types, missing arguments, misspelled properties) but not logic mistakes; runtime data isn't checked automatically; when TypeScript pays off. Seen but not explained: the compiler knows an object literal's properties (inference, LESSON 8) |
| 3 | TypeScript across front end, back end and libraries; type definitions and `@types/...` packages; fast tools run TypeScript without checking; the type check is a separate step |
| 4 | Node.js 24+; the `typescript` npm package and `tsc`; `npm install --save-dev --save-exact typescript@6.0.3`; `npx tsc --version`; `ts-scratch` project beside the course |
| 5 | `npx tsc file.ts` (writes `.js` even with errors), `npx tsc --noEmit file.ts`, `node file.ts` (runs without checking); reading `file(line,column): error TSxxxx: message` |
| 6 | `src/` and `dist/`; `--outDir`; `.gitignore` for `node_modules` and `dist`; npm scripts `build` and `start` |
| 7 | Minimal `tsconfig.json` (`include`, `rootDir`, `outDir`, `strict: true`); `npx tsc` without file names; scripts `build: tsc`, `check: tsc --noEmit`, `start`; TS5112; strict mode rejects an unannotated parameter (TS7006); without modules, files in `src/` share one scope (duplicate names clash) |
| 8 | Writing annotations `name: type` on variables and parameters (`string`, `number` used informally); inference from starting values and from what a function returns; types can't change after declaration; annotate parameters, let inference handle initialized variables. Return-type annotations NOT yet (LESSON 28) |
| 9 | Static checking reads code without running it and checks every branch; it knows types, not values; string methods on a number are reported (TS2339) |
| 10 | Compile time vs runtime; `tsc` removes annotations, keeps logic, adds `"use strict";`; compiled JavaScript contains no type checks; `typeof` inspects values at runtime |
| 11 | TypeScript protects code it can see, not outside data or logic; an annotation on `JSON.parse` output is trusted, not checked (the `any` behind it is LESSON 21); runtime checks with `Number`, `Number.isInteger`, comparisons |
| 12 | `string`, `number`, `boolean` formally (lowercase, not wrapper objects); `number` includes decimals and `NaN`; methods depend on type; look-alike values; truthiness reminder (`Boolean("false")`) |
| 13 | `null` (empty on purpose) vs `undefined` (not set); strict mode keeps them out of other types; a missing return on some path gives `undefined`, reported as "possibly 'undefined'" (TS18048/TS2532) or "possibly 'null'" (TS2531); "used before being assigned" (TS2454). `string \| null` syntax NOT yet (LESSON 22) |
| 14 | An unannotated `let` without a starting value accepts any assignment silently; annotate it; an annotation moves the error to where a wrong value is created; decision table for annotate vs infer |
| 15 | Reading messages: not assignable (have vs expected), argument of type, property does not exist (TS2339/TS2551), expected N arguments (TS2554), cannot find name (TS2304), possibly undefined; fix the first error first, fix the value not the annotation |
| 16 | Inline object types `{ a: string; b: number }` on variables and parameters; missing (TS2741), unknown (TS2353/TS2561), wrongly typed and misspelled (TS2339) properties; inferred object literal types; `object` is not a useful parameter type |
| 17 | Optional properties `name?: type`; reading one is "possibly 'undefined'"; handle with `!== undefined` or `??` (JS); `(a ?? 0)` precedence; only mark truly optional data |
| 18 | Typed arrays `number[]`, `string[]`, `{...}[]`; wrong elements reported; array literal inference; annotate empty arrays; typed results of `map`/`filter`/`reduce`; `find` possibly `undefined`; index past the end not caught. Seen in a message but not taught: `(string \| number)[]` (explained in plain words) |
| 19 | Tuples `[string, string, number]` (fixed length, type per position; wrong order/length and out-of-range index reported); annotate tuples; destructuring; `readonly [...]` blocks assignment and `push` (plain tuples allow `push`); arrays of readonly tuples `(readonly [...])[]`; tuple vs object choice |
| 20 | Data modeling process: list things, object type per thing, structure per property (primitive/object/array/tuple/optional), nesting, typed sample data. No new syntax |
| 21 | `any` (checking off, spreads, `JSON.parse` returns it) vs `unknown` (blocks use until checked, TS18046); `typeof value === "number"/"string"` checks on `unknown` primitives; use `unknown` for outside data |
| 22 | Union types `A \| B`, `string \| null`; only shared members usable until checked; `typeof`/`=== null` checks; `(A \| B)[]` arrays; inferred union return types; intentional unions in results |
| 23 | Literal types (`"paid"`, `3`, `true`); literal unions as allowed-value lists; typos and impossible comparisons (TS2367) reported; `const` keeps literal types, `let` and object properties widen; annotate objects to keep literal unions. `as const` NOT taught |
| 24 | Type aliases `type Name = ...` for objects, unions, literal unions, tuples, arrays; aliases composed from aliases; messages show alias names; structural compatibility; types don't exist at runtime (TS2693); build results in a typed variable to keep literal unions |
| 25 | String and numeric enums; only members accepted; enums exist at runtime (`Object.values`); `node file.ts` rejects enums, compile with tsc; enum vs literal union decision |
| 26 | Narrowing with `typeof`, `=== null`, `!== undefined`, truthiness, `===` literal, `switch`; `else` branch; early return; union restored after an `if` without return/else; truthiness unsafe for numbers. `instanceof`/`in`/type guards/`never` NOT yet |
| 27 | Discriminated data: variant object types joined with `\|`, shared literal discriminant (`kind`), narrowing by `if`/`switch` on it, shared vs variant-only properties, discriminant must be literal; forgotten case → `undefined` in the result type (exhaustiveness is LESSON 66) |
| 28 | Return type annotations; errors at the wrong `return` (TS2322) and missing return (TS2366); `void`; honest `T \| undefined` results; typed destructured parameters; returned object literals keep literal unions with an annotated return type; when to annotate returns |
| 29 | Optional parameters `p?: T`; default parameters `p = value` (inferred type); order after required (TS1016); no `?` with a default (TS1015); only `undefined` triggers a default; skipping with `undefined`; same-type optional parameters can be mixed up silently |
| 30 | Function expressions and arrow functions typed like declarations; contextual typing of callbacks; standalone arrows need parameter types; `=> ({ ... })`; const arrows not usable before declaration (TS2448) |
| 31 | Function types `(a: T) => R` via aliases, for callback parameters, variables and object properties; inferred parameters from the type; fewer parameters fit, extra required ones don't; names are labels |
| 32 | Design habits: precise parameter types, options objects, result types `{ ok: true; ... } \| { ok: false; ... }` (boolean literal discriminant), validate at the edge. No new syntax |
| 33 | `tsc --noEmit` vs `tsc`; errors don't stop emit by default; `"noEmitOnError": true`; exit codes for build servers; `--watch` |
| 34 | `target` (emitted JavaScript version + available built-in APIs; older target rewrites syntax; TS2550 suggests a newer `lib`; `ES5` deprecated) and `module` (`commonjs` → `require`, `nodenext` follows `package.json`'s `type`); Node default ES2022 + nodenext. Writing imports is LESSON 67 |
| 35 | `include` vs `rootDir` vs `outDir`; mirrored structure; missing `outDir` writes next to sources; missing `rootDir` shifts the output; TS6059 for files outside `rootDir`; `outDir` auto-excluded |
| 36 | `strict` as a bundle (`noImplicitAny`, `strictNullChecks`); opt-in `noUncheckedIndexedAccess` (TS2532/TS2345), `noUnusedLocals`/`noUnusedParameters` (TS6133, locals only), `noImplicitReturns`; keep strict on |
| 37 | Workflow: editor → `--watch` → `npm run check` before commit → build/start; one cause often means several errors (fix the first, re-check); reading long messages top-down; `--pretty` code frame |
| 38 | Class syntax: typed property declarations, a constructor that assigns them, methods typed like functions; strict mode requires every declared property to be assigned (TS2564) or to have a starting value; `this.` for properties (TS2663 suggests the instance member); deleting declarations gives TS2339 on every `this.x`; the class name is also the type of its instances; `new` calls checked like calls (TS2554); class vs plain object type |
| 39 | `public` (default), `private` (TS2341), `protected` (TS2445, "and its subclasses"; only *used* from LESSON 43); `private` is per class, so another instance of the same class is reachable; modifiers are compile-time only (the property is still in the object, `JSON.stringify` prints it); a private property also makes an object literal incompatible with the class type; hide first, expose the smallest surface, keep rules inside methods |
| 40 | `readonly` properties (assignable in the declaration and the constructor only, TS2540 elsewhere; they lock the property, not the contents of an array — `readonly string[]` blocks `push` with TS2339); parameter properties: a modifier (`public`/`private`/`protected`/`readonly`) on a constructor parameter declares and assigns the property, no modifier means no property (TS2339 on every `this.x`); plain and property parameters can be mixed; non-parameter properties keep their declaration with a starting value |
| 41 | `static` members belong to the class (`ClassName.member`): `public static readonly` constants, `private static` shared data such as a counter, helpers that need no instance; in a static method `this` is the class (TS2339 on `typeof C`); TS2576 through an instance, TS2662 without the class name; a counter cannot be `static readonly` (TS2540 even in the constructor); an all-static class should be plain functions |
| 42 | Getters (`get name(): T`, read as `obj.name`) and setters (`set name(value: T)`, run on assignment); the stored property needs a different name, by convention `_name` (TS2300 otherwise); a getter with no setter is read-only (TS2540, and the assignment throws at runtime); getters for derived values, setters for a rule applied before storing; accessors stay as cheap as a property read; getter vs method |
| 43 | `extends`: a subclass gets everything the base class has; the derived constructor calls `super(...)` before `this` (TS2377, TS17009), subclass parameters (including parameter properties) come after the base ones; overriding = redeclaring with a compatible type (TS2416); `super.method()` reuses the base version; subclasses reach `protected` but not `private` (TS2341); a subclass instance fits the base type (base-typed array, TS2339 for subclass-only members) while calls still run the subclass version |
| 44 | `abstract class` (cannot be instantiated, TS2511) and `abstract` members without a body that every concrete subclass must implement (TS2654 for several, TS2515 for one); abstract properties; an implementation must fit the declared type (TS2416) and can't be reached with `super` (TS2513); an abstract class still holds shared state and finished methods and is still a type; `abstract` instead of a default when no default is right |
| 45 | Composition vs inheritance (no new syntax): "is a" vs "has a"; a class holds another object as a property and delegates to it; inheritance couples a subclass to the base's protected surface, brings everything, is fixed at creation, and only one class can be extended; composition picks the part at creation and is shareable between unrelated classes; a plain field when only a value differs; ask the part, never reach into its private data |
| 46 | `interface Name { property: type }` names an object shape (same job as an object type alias); `?` for a property that may be missing (TS18048 when read unchecked), `readonly` for one that can't change after creation (TS2540, compile-time only); structural, so any object of the right shape fits; object literals get the excess property check (TS2353, TS2561 with a suggestion) but the same object through a variable passes; an interface is a type only (TS2693) |
| 47 | Method definitions in interfaces: `method(arg: T): R;` and `method: (arg: T) => R;`; any object with matching functions fits, including a class instance that never names the interface; parameter types in a matching literal come from the interface; missing method TS2741, wrong signature TS2322, wrong call TS2554; optional methods (`m?()`) need a check before the call (TS2722, `!== undefined` or `?.()`); an interface is how composition says what a part must do |
| 48 | `interface B extends A` (everything A declares, `readonly` and `?` included); an interface may extend several at once; a B value fits wherever an A is expected and through A only A's properties are visible (TS2339); missing inherited properties TS2739 / TS2741; an extension may narrow an inherited property but not contradict it (TS2430); a literal `kind` per extension gives a discriminated union |
| 49 | `class C implements I`: a check on the class, not inheritance — nothing is added; missing or private members are reported on the class line (TS2420), a wrong signature as TS2416 (the same message as a bad override); a getter satisfies a `readonly` property; a class may implement several interfaces and extend a class at once; an object literal can satisfy an interface but not a class type with private members (TS2739) |
| 50 | Interface vs type alias: interchangeable for object shapes and freely mixed (an interface may extend an object alias, a class may implement one); only an alias names unions, tuples, function types and primitives; interfaces with the same name merge, repeated aliases are reported (TS2300 on both); rule of thumb — `interface` for shapes other code depends on or classes implement, `type` for the rest, consistency first |
| 51 | Why generics exist (one function per type, `unknown[]` losing the type, a union widening it) and generic functions: `function f<T>(items: T[]): T | undefined`; `T` inferred from the argument, explicit `<string>` checked too (TS2345); inside, `T` promises nothing (TS2339 on any member, TS2322 with "'T' could be instantiated with an arbitrary type"); `T` flows into callback parameters; when a generic earns its place |
| 52 | Generic types and interfaces: `type Result<T> = ...`, `interface Page<T> { ... }`, `type Mapper<T, R> = (item: T) => R`; the argument is part of the name (TS2314); annotations state it, calls infer it; narrowing a generic union works as in LESSON 27 (TS2339 for the other branch); one generic shape replaces a row of named types |
| 53 | Generic classes: `class Ledger<T>`, argument fixed at `new` (explicit or inferred from a constructor argument); the bare name is not a type (TS2314) and two instantiations are unrelated (TS2322); statics cannot mention `T` (TS2302); a subclass may fill the argument in; containers yes, classes with rules about their content no |
| 54 | Constraints `<T extends Shape>` (the body may read `Shape`'s members, the caller keeps its own type; TS2345 names the missing part; an interface works as a constraint) and `keyof T` / `T[K]` (read a property by name with its own type; a wrong key is TS2345 against `keyof T`); constrain to what the body reads |
| 55 | Generic patterns (container, result box, transformer `<T, R>`, constrained reader) and the "appears at least twice" test: a type parameter that appears once links nothing and is replaced by its constraint; one parameter per job; a concrete type gives better errors than a `T` that never varies. No new syntax |
| 56 | `Partial<T>` / `Required<T>` / `Readonly<T>`: build a new type, leave the original alone; a `Partial<T>` is not a `T` (TS2345); reading a `Partial` property needs an `undefined` check (TS18048); `Required` reports a missing formerly-optional property (TS2741); `Readonly` reports assignment (TS2540) but is compile-time only; all three are shallow |
| 57 | `Pick<T, K>` keeps named properties, `Omit<T, K>` removes them, carrying over types, `?` and `readonly`; a bad key is TS2344 for `Pick` and **silently ignored** by `Omit`; TS2353 for an extra property in a literal, while a full value fits where the smaller type is expected; `Pick` for a short list, `Omit` for a removal |
| 58 | `Record<K, V>` for tables: a literal key union makes a missing entry TS2741 and an unknown one TS2353, so adding a key reports every table; `Record<string, V>` accepts any key and types absent reads as `V` (runtime `undefined`; `noUncheckedIndexedAccess` changes that); indexing a record with a plain `string` (e.g. from `Object.keys`) is reported |
| 59 | `Exclude<T, U>` / `Extract<T, U>` on unions, including discriminated ones (`Extract<Movement, { kind: "card" }>` names one variant, `Exclude` names the others); a value outside the result is TS2322; removing a member that isn't there is silently accepted; an empty `Extract` is `never`; `filter` does not narrow its result type (LESSON 64) |
| 60 | `ReturnType<F>` and `Parameters<F>`, with `typeof fn` in a **type position** to name a function's type (TS2749 without it); `Parameters<F>` is a tuple, `Parameters<F>[0]` one parameter; both need something callable (TS2344); derive from the function when the function is the source of truth |
| 61 | Combining utility types (no new syntax): `Partial<Pick<T, K>>` (a patch limited to certain fields), `Record<K, Omit<V, "x">>`, `Readonly<Record<K, V>>`; read from the inside out, name the steps, stop at two levels; messages expand aliases, so quoted ones must be copied |
| 62 | `typeof null` is `"object"` (narrow `null` by comparing with `null`, TS18047 otherwise); `instanceof C` narrows to a class and its right side must exist at runtime (TS2693 for a type); before a check only shared members are available (TS2339 with the variant named), inside it the other variant's are not; `Array.isArray` for arrays; a shared member needs no narrowing |
| 63 | `"property" in value` narrows unions of plain object types both ways; the property name is not checked against the union (a name no variant has compiles, types the property `unknown`, never matches); an optional property shared by variants is a poor discriminator, but `in` is the right question for "was this optional property set?" |
| 64 | Discriminated unions: the same field with a different **literal** value in every variant; `switch` narrows every branch including `default`; a `case` outside the union is TS2678 (the check a `kind: string` removes — though one loose variant still narrows); only shared fields are available outside the switch |
| 65 | User-defined type guards `function f(x: T): x is U`: narrow at every call site and make `filter` return `U[]`; TS 6.0.3 infers the same for a short **unannotated** callback but not for one annotated `: boolean` or with several statements; guards turn `unknown` into typed data; the compiler trusts the annotation, so a wrong guard is silent |
| 66 | `never` has no values: `const impossible: never = value` in a `default` proves every variant is handled, and a new variant is reported in every switch that forgot it (TS2322, naming it); `: never` also marks a function that never returns (TS2534), which is not `void`; an empty `Extract` is `never` too |
| 67 | Modules: `export` shares a declaration, everything else stays private to the file; `import { a } from "./file.js"` (TS2305 for a name that isn't exported, TS2459 for one that exists but isn't); `export default` and why named exports are the habit; relative paths end in `.js` (TS2835); each module has its own scope |
| 68 | `import type` / `export type`: values exist at runtime, types are erased; a value imported with `import type` can't be used (TS1361) while a type alias is refused anyway (TS2693); type-only lines vanish from the output and a types-only file still emits `export {};`; a class is both a value and a type |
| 69 | Where types live: one user → keep it in the module; several → a leaf module that imports nothing back; a **value** cycle compiles and fails at runtime (`ReferenceError: Cannot access 'x' before initialization`), a **type** cycle is erased and safe; types at the bottom, `index.ts` at the top |
| 70 | Multi-file layout: one thing per file, an entry point that only wires things together, a folder speaking through its own `index.ts` (`export {}` for values, `export type {}` for types); `dist` mirrors `src`; a barrel costs a hop and a cycle risk; split a file when its name needs an "and" |
| 71 | (optional) Decorators: `@name` above a member wraps it with a function that runs once, when the class is defined; TS 6.0.3 uses the **standard TC39 model** (no `experimentalDecorators`) and the Deno kernel runs it; a method decorator takes `(target, context)` — `context.name`, `context.kind` — and what it returns replaces the member; the generic `<This, Args extends unknown[], Return>` signature keeps it typed, and a loose one is reported at the `@` (TS1241, TS1270) |
| 72 | (optional) A decorator with options is a factory you call (`@rounded(2)`); forgetting the call makes the factory the decorator (TS1241) and at runtime replaces the method with a function; a narrowed `target` type restricts which methods it fits; order — factories top to bottom, decorators applied bottom-up, wrappers entered outside in and unwound in reverse |
| 73 | (optional) When to use decorators: a uniform concern over many members, or a framework built on them; the cost is invisibility at the call site, definition-time behavior, fiddly types, hard testing; a higher-order function or composition is usually clearer; no new syntax |
| 74 | (optional) Conditional types: `T extends U ? X : Y`, where `extends` means "is assignable to" and the compiler evaluates it while checking; a union handed to a **bare** type parameter distributes member by member and the results are joined; a `never` branch disappears, which is all `Exclude<T, U> = T extends U ? never : T` is; `[T] extends [U]` compares the union as a whole, and `[T] extends [never]` is the only way to ask whether a type is empty; inside a generic function `T` is still open, so a conditional type is the whole union of its branches and no property of it can be read (TS2339) |
| 75 | (optional) Mapped types: `{ [K in keyof T]: X }` walks the keys of `T` and `T[K]` is the original value type; **a mapped key keeps the `readonly` and `?` it had** unless the mapping changes them (verified: a plain boolean mapping still refuses an assignment to a readonly key, TS2540, and leaves an optional key optional), which is why a modifier can be removed with `-readonly` or `-?` as well as added; `Partial`, `Readonly`, `Required` and `Record` are all mapped types, and `Partial<T>` differs from `{ -readonly [K in keyof T]?: T[K] }` only in keeping `readonly`; any union of keys can be mapped, not only `keyof T` |
| 76 | (optional) `infer` names a blank inside a conditional type's `extends` and nowhere else: `T extends (infer U)[] ? U : never` is the element type of `T`, and the same pattern reaches into a function type — which is what the library's `ReturnType` and `Parameters` are (both written with `any`; `(...args: never[]) => infer R` is the `any`-free equivalent, because a function of two parameters is not assignable to `() => R`); patterns are structural and may hold several blanks (`[infer F, ...unknown[]]`); a pattern that misses takes the false branch silently, and the resulting `never` is reported only where something reads from it |
| 77 | (optional) Template literal types: `` `IT${string}` `` describes a string's shape, and a union inside the template multiplies out (two unions of two give four members; a near-miss is TS2820 listing them all with a "Did you mean" suggestion); `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` change case; an `as` clause in a mapped type renames keys — `` [K in keyof T as `get${Capitalize<K & string>}`] ``, with `& string` because `keyof T` is `string | number | symbol` (TS2344 without it) — and a key renamed to `never` is **dropped**, so `as` filters as well as renames; the cost is that the combinations multiply |
| 78 | (optional) Combining the four features (no new syntax): one worthwhile combination is `` { [K in keyof T as `send${Capitalize<K & string>}`]: (input: T[K]) => string } `` — mapped type, template literal, case helper and indexed access in one line, and its parameters get their types by contextual typing; a derived type pays when the source changes, when there are many members, or when the code described is not yours to edit, and should be written out by hand when it cannot be said in one sentence, does more than one job, or reports its errors far from the mistake; compute a type when you cannot edit the source, edit the source when you can |

Hard limits: MP1 ≤ LESSON 20 and no classes/interfaces/enums/unions/generics · MP2 ≤ LESSON 32,
no classes/interfaces/generics · MP3 ≤ LESSON 50 · MP4 ≤ LESSON 70 · optional topics never
required by any project or later core lesson.

## 9. Mini-project conventions

- Folder: `NN_mini_project_K_name/` with `mini-project.md`, `ai-prompt.txt`,
  `review-prompt.txt`.
- Brief sections: Prerequisites and repository name · Scenario · Objective · Core
  requirements (checklist) · Constraints · Starter data · Done when (success criteria) ·
  Suggested commit history · Bonus (optional, never required).
- Projects are Node + TypeScript repositories using the pinned TypeScript version, set up as
  taught in topics 02 and 10, created beside the course folder (see `PUBLISHING_GUIDE.md`).
- Educational only; never presented as real banking or trading software.

## 10. Approved deviations and decisions log

| Date | Decision | Reason |
|---|---|---|
| 2026-09-15 | Mini-projects in their own numbered folders (no notebooks) | User decision; matches `react-complete course` |
| 2026-09-15 | Prerequisite = `js-vanilla-course` | User decision |
| 2026-09-15 | Sixth lesson section `### Verification` added to the template | User requirement (learning cycle) |
| 2026-09-15 | Notebook sources in `tools/sources/`, notebooks generated | Valid JSON, reviewable diffs, reliable validation |
| 2026-09-15 | `check:nb` script in playground | Deno kernel does not report type errors (verified) |
| 2026-09-15 | TypeScript pinned to 6.0.3, `@types/node` 24.13.4 | Match Deno's bundled TS; avoid global `tsc` 7.0.2 |
| 2026-09-15 | Exercise fences use `typescript` | Course language |
| 2026-09-15 | LESSON 34 teaches downleveling with `target: "ES2015"`, not `"ES5"` | Verified: TS 6.0.3 rejects `ES5` with `error TS5107: Option 'target=ES5' is deprecated and will stop functioning in TypeScript 7.0`. The roadmap item (`target`) is still fully covered, and the deprecation is stated in the lesson |
| 2026-09-15 | Concise lesson style; LESSON 1 rewritten | User feedback: LESSON 1 too verbose |
| 2026-09-15 | `QUALITY_ISSUES.md` added as lessons-learned log | User requirement |
| 2026-09-15 | Roadmap "Typed arrays" = arrays with an element type (`number[]`, `string[]`, arrays of object types), not JS `TypedArray` objects (`Float64Array`) | Beginner TypeScript meaning; fits MP1 "store financial values using typed arrays" |
| 2026-09-15 | Topic 02 has the student create `ts-scratch/` (beside the course, not inside it) with `npm init`, pinned `typescript@6.0.3`, `tsc`, `tsconfig.json`. Terminal lessons (02, 10, 17) use `ts-scratch`; `playground/` stays unchanged so `check:nb` always works | Installing and configuring TypeScript is the roadmap content itself; editing the shared playground config would break notebook checking |
| 2026-09-15 | Annotations on variables and parameters from LESSON 8; return-type annotations are taught formally in LESSON 28 (earlier lessons let return types be inferred, and may show one only where LESSON 8 introduces the syntax) | Roadmap lists annotations in Lessons 3, 4 and 7; progressive depth avoids teaching the same thing three times |
| 2026-09-15 | `typeof` checks appear at a basic level in LESSON 26 (basic narrowing); LESSON 62 covers `typeof` fully together with `instanceof` | Basic narrowing of `string \| number` needs `typeof`; roadmap Lesson 13 deepens it |
| 2026-09-15 | Marker renamed to `<!-- practice: terminal -->` and extended to Exercise and Mini Challenge | Terminal lessons need honest practice, not fake notebook cells |
| 2026-09-15 | Notebook type names use the lesson prefix in PascalCase (`L24Account`), like values use `l24...` | `check:nb` merges all cells into one file, so type aliases, interfaces and classes from different lessons would otherwise clash |
| 2026-09-15 | New cell tag `type-error-exercise` | From LESSON 8 on, students must WRITE types. A starter missing annotations can't type-check under strict mode, so its errors are the exercise; the validator requires them in the lesson and forbids them in the solution, while `checkAll` still verifies behavior |
| 2026-09-15 | Node.js **24 or later** required | Verified: Node 24.20 runs `.ts` files directly (type stripping) with no warning; Node 24 is the active LTS |
| 2026-09-15 | Topic 02 teaches a hand-written minimal `tsconfig.json` (`include: ["src"]`, `rootDir`, `outDir`, `strict`) and only *mentions* `tsc --init` | Verified: TS 6.0.3 `tsc --init` generates `module: nodenext`, `target: esnext`, `types: []`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `jsx`, `declaration`, `sourceMap` — too much for beginners and it changes later lessons' behaviour |
| 2026-09-15 | `ts-scratch` keeps `npm init -y`'s `"type": "commonjs"` until topic 17 (modules), where the module setup is decided and taught | Verified: the minimal config compiles single-file scripts that run fine under commonjs; module format belongs to LESSON 34 and topic 17 |
| 2026-10-21 | Topic 01 (LESSON 1-3) simplified further; LESSON 2 and 3 Mini Challenges reduced to two questions | User feedback while taking the course: still too verbose. Same topics, exercises and verification cells; terms used before being explained (compiler, the inferred object type in a compiler message, type definitions) are now explained on first use. Content re-verified against current Node.js (type stripping stable) and TypeScript 7.0 docs |
| 2026-10-21 | Topic 01: LESSON 2 and 3 Mini Challenges are hands-on `type-error-exercise` cells (fix a type error and a logic bug; fix code that runs but fails the type check); their reasoning points moved into the Explanation | User feedback: no written-answer exercises, practical tasks only. Applied to topic 01 only, at the user's request |

### Verified facts for TypeScript 6.0.3 + Node 24.20 (topic 02 experiments, 2026-09-15)

- `npm install --save-dev --save-exact typescript@6.0.3` → `"devDependencies": { "typescript": "6.0.3" }`; `npx tsc --version` → `Version 6.0.3`.
- `npx tsc price.ts` with a type error prints `price.ts(6,20): error TS2345: ...`, exits 2, **and still writes `price.js`**.
- `npx tsc --noEmit price.ts` reports the same error and writes nothing.
- `node price.ts` runs the file (types stripped, not checked), no warning.
- `npx tsc` with no tsconfig prints the help text (`tsc: The TypeScript Compiler - Version 6.0.3`).
- `npx tsc src/index.ts --outDir dist` writes `dist/index.js` (starts with `"use strict";`).
- Minimal tsconfig + `npx tsc` writes `dist/index.js`; with `strict: true` an unannotated parameter gives `error TS7006: Parameter 'amount' implicitly has an 'any' type.`
- `npx tsc src/index.ts` while a tsconfig exists → `error TS5112: tsconfig.json is present but will not be loaded if files are specified on commandline. Use '--ignoreConfig' to skip this error.`
- (LESSON 25 experiment) `node file.ts` on a file containing an `enum` fails:
  `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode`.
  `tsc` emits enums as a real runtime object (`var X; (function (X) { ... })(X || (X = {}));`),
  and `node dist/...js` runs it. Enums work in the Deno notebook kernel. Projects that use enums
  must be run through `npm run build` + `npm start`.
- (LESSON 33 experiment) `tsc` with a type error: exit 2, error reported, **and `dist/index.js`
  written**; `tsc --noEmit`: exit 2, nothing written; with `"noEmitOnError": true`: exit 1 and
  no output at all. `npx tsc --noEmit --watch` prints `Found 0 errors. Watching for file
  changes.` `tsc --showConfig` echoes the resolved config and auto-excludes `outDir`.
