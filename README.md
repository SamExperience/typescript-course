# TypeScript — complete course

A hands-on TypeScript course built from short lessons (~5 minutes each), continuing where
[`js-vanilla-course`](../js-vanilla-course) stopped.

The aim is not to skim TypeScript. By the end you should understand what the type system is
actually doing, read a compiler error without guessing, write typed code confidently, and have
four projects on GitHub that you built yourself.

> **Status: the course is complete** — all 78 lessons across topics 01-20, and all four
> mini-project briefs. Everything described below exists on disk.

## Prerequisites

**The JavaScript course, finished.** This course assumes all of it: functions, objects, arrays
and array methods, destructuring, spread, classes, modules, promises and `async`/`await`, and
error handling.

Only TypeScript is taught here. A JavaScript feature gets a one-line reminder the first time a
lesson leans on it, and nothing more.

You also need **Node.js 24 or newer**, which is what LESSON 4 sets up. Check with
`node --version`.

## Setup (one time only)

The notebooks run on the **Deno** kernel, the only actively maintained JavaScript and
TypeScript kernel for Jupyter.

```powershell
winget install DenoLand.Deno
deno jupyter --install
jupyter kernelspec list      # should list "deno"
```

To open the notebooks:

- **JupyterLab**: run `jupyter lab` from this folder.
- **VS Code**: install the Jupyter extension:
  ```powershell
  code --install-extension ms-toolsai.jupyter
  ```
  It is what lets VS Code open `.ipynb` files at all. Then reload VS Code, open a notebook,
  click **Select Kernel** at the top right, choose **Jupyter Kernel…** (not "Python
  Environments"), then **Deno**.

Then install the playground once — several lessons need it, and so does every type check:

```bash
cd playground
npm install
```

That installs **TypeScript 6.0.3**, pinned exactly. Every type error quoted anywhere in this
course was produced by that compiler.

## The one thing to understand before you start

**Running a cell does not check types.** The Deno kernel executes TypeScript by stripping the
types away; it never type-checks. So a cell with a deliberate type error still runs, and a cell
you have broken still runs too.

To see type errors, run this from the `playground` folder:

```bash
npm run check:nb -- ../04_basic_types/lesson.ipynb
```

It reports every error in the notebook, sorted into three kinds:

- `[expected]` — from a cell that starts with `// Type error on purpose`. Study it; it is the
  lesson.
- `[to fix]` — from a cell that starts with `// This cell has type errors on purpose. Fix them.`
  Make it disappear; that is the exercise.
- `[error]` — anything else. Something is wrong, probably in what you just wrote.

That split is why the course works in notebooks at all: you get to *run* broken code and see
what the compiler says about it, in the same place.

## Level 1 — Fundamentals

`LESSON N` numbering runs continuously across the whole course; it does not restart per topic.

| # | Topic | Lessons |
|---|---|---|
| 01 | `01_introduction` | **LESSON 1-3** — what TypeScript is and why it exists · benefits, limits, and when it is worth it · TypeScript in modern web development |
| 02 | `02_environment_setup` | **LESSON 4-7** — Node, npm and installing TypeScript · `tsc` and running files · project structure · a first `tsconfig.json` |
| 03 | `03_how_typescript_works` | **LESSON 8-11** — annotations and inference · static type checking · compile time vs runtime, TS → JS · what TypeScript does *not* protect against |
| 04 | `04_basic_types` | **LESSON 12-15** — `string`, `number`, `boolean` · `null` and `undefined` · annotate or infer · reading a type error |
| 05 | `05_objects_arrays_tuples` | **LESSON 16-20** — object types · optional properties · typed arrays · tuples and readonly tuples · practical data modeling |
| 06 | `06_mini_project_1_currency_converter` | **Mini-project 1 — Currency Converter & Account Balance** |

## Level 2 — Type modeling and functions

| # | Topic | Lessons |
|---|---|---|
| 07 | `07_type_composition_narrowing` | **LESSON 21-27** — `any` vs `unknown` · union types · literal types · type aliases · enums · basic narrowing · discriminated data |
| 08 | `08_functions` | **LESSON 28-32** — parameter and return types · optional and default parameters · function expressions and arrows · function types · type-safe design |
| 09 | `09_mini_project_2_transaction_validator` | **Mini-project 2 — Banking Transaction Validator** |

## Level 3 — Compiler, classes and interfaces

| # | Topic | Lessons |
|---|---|---|
| 10 | `10_compiler_tsconfig` | **LESSON 33-37** — checking vs compiling · `target` and `module` · `rootDir` and `outDir` · strict mode and the options that matter · the workflow |
| 11 | `11_classes` | **LESSON 38-45** — syntax and constructors · `public`/`private`/`protected` · `readonly` and parameter properties · `static` · getters and setters · `extends` and `super` · abstract classes · composition vs inheritance |
| 12 | `12_interfaces` | **LESSON 46-50** — syntax, optional and readonly properties · method definitions · extending · implementing · interface vs type alias |
| 13 | `13_mini_project_3_banking_accounts_loans` | **Mini-project 3 — Banking Accounts & Loans** |

## Level 4 — Advanced practical TypeScript

| # | Topic | Lessons |
|---|---|---|
| 14 | `14_generics` | **LESSON 51-55** — why generics exist · generic types and interfaces · generic classes · constraints and `keyof` · avoiding unnecessary generics |
| 15 | `15_utility_types` | **LESSON 56-61** — `Partial`/`Required`/`Readonly` · `Pick`/`Omit` · `Record` · `Exclude`/`Extract` · `ReturnType`/`Parameters` · combining them |
| 16 | `16_advanced_narrowing` | **LESSON 62-66** — `typeof` and `instanceof` · `in` · discriminated unions · user-defined type guards · exhaustive checking and `never` |
| 17 | `17_modules_organization` | **LESSON 67-70** — named and default exports · `import type` · separating types from implementation · a multi-file project |
| 18 | `18_mini_project_4_trading_portfolio` | **Mini-project 4 — Trading Portfolio & Transaction Engine** |

## Optional — after the course proper

Nothing depends on these two topics, and no mini-project uses them. Read them when you are
curious, or skip them.

| # | Topic | Lessons |
|---|---|---|
| 19 | `19_optional_decorators` | **LESSON 71-73** — what a decorator is and its syntax (the standard model) · a practical example · when to use one and when not to |
| 20 | `20_optional_type_level` | **LESSON 74-78** — conditional types · mapped types · `infer` · template literal types · combining them, and when it becomes too much |

**All 78 lessons are written**, across topics 01-20, and all four mini-projects have their
briefs. Run `node tools/course-stats.mjs` to count them yourself.

## How to work through a topic

1. **Open the topic's `lesson.ipynb`** and run the helper cell at the top once. Then read a
   lesson, run its `### Example` cell, and work on the `### Exercise` cell below it.
2. **Run the Verification cell.** Every line should print `PASS`. It checks what the exercise
   actually asked for, not just that the code runs.
3. **Run `npm run check:nb`** from `playground/` and make the lesson's `[to fix]` errors
   disappear.
4. **Do the Mini Challenge.** It is shorter than the exercise and usually makes you reason
   rather than type. It is where the concept sticks.
5. **Check `solutions.ipynb`** — same folder, same order, one solution per exercise and per
   mini challenge, each with a short explanation and the common mistakes. Open it *after* you
   have genuinely tried.

Some lessons send you to the terminal instead of a cell: the setup ones (topic 02), two in
topic 03, the compiler ones (topic 10) and the multi-file ones (topic 17). They say so, and
they say which folder to run the commands in.

## The playground

```bash
cd playground
npm install       # first time only
npm run check     # type-check src/, without producing any JavaScript
npm run build     # compile src/ into dist/
npm start         # run dist/index.js
npm run check:nb -- ../11_classes/lesson.ipynb   # type-check a notebook
```

It exists so that the real compiler, real `tsconfig.json` options and real multi-file imports
can be seen doing their job. It is a scratch space, not a project: there are no lessons in it,
and nothing in it is worth keeping.

## Mini-projects

Four times in this course you stop and build something in **your own public repository**. They
are not exercises with the scaffolding in place — they start from an empty folder, and there is
no solution to look at.

Every brief is strictly limited to what has been taught by that point, and says so:

- [Mini-project 1 — Currency Converter & Account Balance](06_mini_project_1_currency_converter/mini-project.md) — after topic 05, repo `ts-currency-converter`
- [Mini-project 2 — Banking Transaction Validator](09_mini_project_2_transaction_validator/mini-project.md) — after topic 08, repo `ts-transaction-validator`
- [Mini-project 3 — Banking Accounts & Loans](13_mini_project_3_banking_accounts_loans/mini-project.md) — after topic 12, repo `ts-banking-accounts`
- [Mini-project 4 — Trading Portfolio & Transaction Engine](18_mini_project_4_trading_portfolio/mini-project.md) — after topic 17, repo `ts-trading-portfolio`

Each brief ends with a **Done when** list — the checks you run before calling it finished.

Read [PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md) once before the first one. It covers where the
folder goes (beside this course, never inside it), how to set it up with the pinned compiler,
the commit loop, and what the README needs.

These are educational projects with a financial narrative. None of them is, or pretends to be,
a real banking or trading system.

## Working with an AI assistant

Two prompts, for two different moments. Both tell the assistant to teach with questions rather
than answers, and — importantly — what you have **not** been taught yet, so it does not "help"
by showing you something from a later topic.

- **`ai-prompt.txt`** — in every topic folder. Use it *while* you are stuck on an exercise.
- **`review-prompt.txt`** — beside each mini-project brief. Use it *after* you think the project
  is finished, to have your own code reviewed against the brief.

Paste the whole file into a new session, and for a review paste the brief and your code with it.

## Tools

The course builds itself from plain-text sources in `tools/sources/`, and checks itself before
anything is published:

```bash
node tools/build-notebooks.mjs 11_classes   # sources → lesson.ipynb + solutions.ipynb
node tools/validate.mjs 11_classes          # structure, types, execution, verification
node tools/validate-project.mjs 13_mini_project_3_banking_accounts_loans
node tools/course-stats.mjs                 # the counts used in this file
node tools/self-test.mjs                    # checks that the validator still catches things
```

`validate.mjs` type-checks both notebooks with the pinned compiler, runs them on the Deno
kernel, and confirms that every Verification cell **fails** against the starter code and
**passes** against the solution. Nothing reaches this repository without it.

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, teach from it.
