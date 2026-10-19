# TASKS — TypeScript course

Statuses: `[ ]` Pending · `[~]` In Progress · `[x]` Completed · `[!]` Blocked

A LESSON is `[x]` only when **Gate 1 (automated)** and **Gate 2 (semantic/pedagogical)**
have both passed and are recorded below it. See `COURSE_PLAN.md` §7.

## Current state

- **Last approved unit:** LESSON 78 (2026-09-16; Gate 2 re-run the same day for QI-027). Optional topic 20 complete; every lesson (1-78) and all four mini-projects are approved.
- **Current task:** none — the course is finished. Every unit, the README and the final QA have passed both gates.
- **Note:** the session was interrupted by a re-login after LESSON 28; work resumed from
  these files.
- **Mode:** continue automatically lesson by lesson (user instruction); stop only for a real
  decision or ambiguity. Review `QUALITY_ISSUES.md` before each unit.
- **Known issues:** the lesson header refers to the course README for the one-time setup;
  the README is written last (tracked under Wrap-up).
- **Blockers:** none.

## 0. Infrastructure

- [x] Create `typescript-course/` with `.gitignore` and `LICENSE`
- [x] `playground/` with pinned TypeScript 6.0.3 and `@types/node` 24.13.4;
      `npm install`, `npm run check`, `npm run build`, `npm start` all succeed (2026-09-15)
- [x] Verify the Deno kernel's type-checking behaviour (does NOT report type errors; allows
      redeclaring `let` across cells) and record it in `COURSE_PLAN.md` §5
- [x] `playground/scripts/check-notebook.mjs` (`npm run check:nb`): tested on a scratch
      notebook, reports the planted type error and cross-cell redeclarations with lines
- [x] `tools/build-notebooks.mjs` (sources → notebooks)
- [x] `tools/validate.mjs` (Gate 1) — proven by `node tools/self-test.mjs`: 9/9 injected
      defects caught (wrong solution, starter already correct, silent demo cell, missing
      section, `...` omission, hand-edited notebook, unexpected type error, verification
      mismatch, runtime error)
- [x] `COURSE_PLAN.md` and `TASKS.md`

## Level 1 — Fundamentals

### 01_introduction (roadmap Lesson 1)
- [x] LESSON 1 — What TypeScript is and why it exists
  - Gate 1 (automated): PASSED — structure, sources in sync, 6+4 code cells type-checked
    with TS 6.0.3 (1 expected demo error, TS2345), both notebooks execute in Deno,
    verification prints 3× FAIL on the starter and 3× PASS on the solution; ≈925 words.
  - Gate 2 (semantic): PASSED after fixes —
    - fixed: printed output quoted as `"205"` but Deno prints `205` (lesson + solutions);
      `parseInt` common mistake gave the wrong total (52, not 52.5); exercise step 3 now says
      to restore the conversion; Mini Challenge says to delete reported calls afterwards;
      English: "deals with types" → "looks at types", "refuses that call" → "reports an error
      for that call", repeated "only", misleading "Here are two functions", clearer `+`
      reminder.
    - checked: roadmap scope (what/why/TS vs JS only; benefits and web dev left to LESSON 2–3)
      · prerequisites (JS only; `unknown`/`void` in the helper cell explicitly marked as
      not needed yet) · Feynman what/why/how · example shows the silent bug and the
      compiler's view · exercise needs real conversion + formula, verification fails for
      unconverted strings ("494.50") and a missing shipping cost · Mini Challenge adds
      reasoning (right-by-accident call) · solutions correct, no new concepts · compile time
      vs runtime stated accurately · native-English review · ~5-minute read.
  - **Revision (user feedback: too verbose):** rewritten in the concise style, 925 → 439
    words; all essential concepts kept (what, why, TS vs JS, compile-time checking, types
    removed at runtime); header trimmed to setup essentials. Helper changed to `checkAll`
    (QI-009). Gate 1 re-run PASSED; Gate 2 re-review PASSED (outputs re-verified).
- [x] LESSON 2 — Benefits, limitations, and when TypeScript is useful
  - Gate 1: PASSED — 4 expected demo errors (TS2345, TS2554, TS2551, TS2345), verification
    FAIL ×4 on starter, PASS ×8 on solution (all 8 lines captured after the QI-009 fix);
    516 words.
  - Gate 2: PASSED after fixes — lost output lines (QI-009, helper and validator changed);
    incomplete compiler message (QI-010); unexplained inferred object type in the demo got a
    one-line forward reference to LESSON 8; "the compiler is happy" → "reports nothing".
    Checked: scope (benefits/limits/when useful), no hidden prerequisites, exercise mixes a
    logic fix (runtime check) with reasoning about what the compiler can catch, open-ended
    Mini Challenge, solutions and common mistakes verified (`> 49.99` edge case).
- [x] LESSON 3 — TypeScript in modern web development
  - Gate 1: PASSED — 1 expected demo error (TS2345), FAIL ×3 on starter, PASS ×3 on
    solution; 390 words.
  - Gate 2: PASSED after fix — "Most npm packages include type definitions" overstated →
    "Many". Checked: outputs (`19.99 EUR`, `0.20 EUR`), compiler message copied from
    `check:nb`, common-mistake numbers run with node (`0.26 EUR`, `12.90 EUR`), claims about
    Vite/Deno/Node type stripping accurate, exercise requires reading the `amountInCents`
    name (types can't express units), Mini Challenge adds workflow reasoning. Topic 01
    `ai-prompt.txt` completed (LESSON 1-3, outcomes).

### 02_environment_setup (roadmap Lesson 2)
- [x] LESSON 4 — Node.js, npm and installing TypeScript
  - Gate 1: PASSED — terminal-practice markers on Example/Exercise/Verification; challenge
    cells type-check and run; 352 words.
  - Gate 2: PASSED after fixes — "initialise" → "initialize" (QI-011, American spelling);
    awkward "`v24` followed by a minor version" → "must print `v24` or higher". Checked: every
    command and output run in a scratch project (install, `Version 6.0.3`, exact
    `devDependencies` entry); scope limited to Node/npm/installing; `--save-exact` and `npx`
    explained once; Mini Challenge reasons about `^`, global tsc, and team consistency.
- [x] LESSON 5 — The compiler (`tsc`) and running TypeScript files
  - Gate 1: PASSED — terminal-practice sections; challenge cells type-check and run; 438 words.
  - Gate 2: PASSED — every command/output verified in scratch project `ts-scratch-5`:
    `price.ts(6,20)` TS2345, `price.js` written anyway, `122` twice for both `node price.js`
    and `node price.ts`; `receipt.ts(6,25)`, `node receipt.js` prints one line then
    `TypeError: amount.toFixed is not a function`; fixed file prints `Total: 25.00 EUR` twice.
    Checked: "emit" defined once, error anatomy explained once, exercise makes the student
    see emitted-despite-errors and the runtime crash the compiler predicted; Mini Challenge
    reasons about stale `.js` and running-is-not-checking; American spelling.
- [x] LESSON 6 — Basic project structure
  - Gate 1: PASSED — terminal-practice sections; challenge cells type-check and run; 399 words.
  - Gate 2: PASSED — verified in `ts-scratch-6`: `npm run build` (`tsc src/index.ts --outDir
    dist`) creates only `dist/index.js`; `npm start` prints `Order total: 42.50 EUR`; adding
    `src/report.ts` does NOT create `dist/report.js` (Mini Challenge claim); `git status`
    with the `.gitignore` lists no `dist/` or `node_modules/` files. Checked: `src`/`dist`
    defined once, motivates tsconfig without teaching it early, common mistakes are real,
    American spelling ("Reorganize").
- [x] LESSON 7 — A first `tsconfig.json`
  - Gate 1: PASSED (re-run after fix) — terminal-practice sections; 450 words.
  - Gate 2: PASSED after fix — TS7006 column quoted as 33 before the experiment ran; real
    output is 36 (QI-012). Verified in `ts-scratch-7`: `npm run check` clean, `npm run build`
    → `dist/index.js`, `dist/report.js`; `node dist/report.js` → `Daily sales: 1280.00 EUR`;
    TS5112 message; `src/reports/daily.ts` → `dist/reports/daily.js`; duplicate function names
    across script files → TS2393 (common mistake + tutor misconception). Topic 02
    `ai-prompt.txt` completed (LESSON 4-7, outcomes, misconceptions).

### 03_how_typescript_works (roadmap Lesson 3)
- [x] LESSON 8 — Type annotations and type inference
  - Gate 1: PASSED — 1 expected demo error (TS2322), 2 `[to fix]` TS7006 in the new
    `type-error-exercise` starter, FAIL ×3 on starter, PASS ×3 on solution; 426 words.
    Tooling added: `type-error-exercise` tag (checker `[to fix]`, validator requires ≥1 error
    in lesson, none in solution); self-test extended to 10/10.
  - Gate 2: PASSED after fix — "straight away" → "right away" (QI-011). Checked: outputs
    (`Ada Lovelace has 300 EUR`, `100`), messages copied from `check:nb`, annotation and
    inference each explained once with when-to-use guidance, return-type annotations
    deferred to LESSON 28, exercise makes the student write annotations AND implement
    behavior, Mini Challenge reasons about inferred types and redundant annotations;
    `toFixed` common mistake verified by the type flow.
- [x] LESSON 9 — Static type checking
  - Gate 1: PASSED (re-run after fixes) — demo TS2339, `[to fix]` TS2322, FAIL ×2 on starter
    (`"20.00"`, `"8.99"` strings from untested branch), PASS ×4 on solution; 436 words.
  - Gate 2: PASSED after fixes — Example lacked a runnable correct cell (validator caught it;
    fixed version added, runs both branches); unclear "a number method must be used on it" →
    names `toUpperCase` on `weightKg`. Checked: outputs, messages, rounding values with node
    (20, 8.99), "types not values" stated once, exercise is a real untested-branch bug,
    common mistake "deleting the annotation" reasoned through inference.
- [x] LESSON 10 — Compile time vs runtime: TypeScript → JavaScript
  - Gate 1: PASSED — demo TS2345; terminal-practice Exercise/Verification; challenge cells
    run (`72`); 437 words.
  - Gate 2: PASSED after fixes — garbled "Topic 02 of LESSON 11" reference (QI-013); a
    PowerShell equality check silently verified nothing and was redone (QI-014). Verified in
    `ts-scratch-10`: exact `dist/invoice.js` (`"use strict";`, annotations and blank lines
    removed, 4-space indentation), `Northwind Supplies pays 305 EUR`, emitted JS identical with
    and without `: string` (`identical: True`); challenge values with node (-720, 72, 72);
    notebook outputs `19.9 is a number` / `19.9 is a string`. Checked: compile time vs
    runtime defined once, "no type checks in compiled JS" stated accurately, `typeof` shown as
    the JavaScript runtime tool, three-way Mini Challenge (compiler / crash / nobody).
- [x] LESSON 11 — What TypeScript does and does not protect against
  - Gate 1: PASSED — FAIL ×2 on starter, PASS ×6 on solution; example type-checks with no
    errors by design; 396 words.
  - Gate 2: PASSED — outputs `string 31` and `4` from the executed notebook; parse results
    (`3,99,0,0,0,0,0`) and `parseInt("2.5")` = 2, `parseInt("3 boxes")` = 3 verified with node
    (one `node -e` lost its later prints to PowerShell quoting and was re-run quote-safe,
    QI-014). Checked: protects/doesn't-protect listed once, `JSON.parse` any deferred to
    LESSON 21 with a one-line reference, no arrays/objects types used, runtime check at the
    edge practised. Topic 03 `ai-prompt.txt` completed (LESSON 8-11, outcomes).

### 04_basic_types (roadmap Lesson 4)
- [x] LESSON 12 — `string`, `number` and `boolean`
  - Gate 1: PASSED — demo TS2322 ×2, `[to fix]` TS7006 ×3, FAIL ×4 on starter, PASS ×4 on
    solution; 351 words.
  - Gate 2: PASSED after fix — tutor prompt contained literal backslash-escaped quotes
    (`\"true\"`) in a plain-text file; rewritten. Verified: outputs (`GRACE HOPPER has 1251
    points. Member: true`, `true 15`, `Total: 5 2.5 true NaN true`); pinned tsc confirms
    wrapper types `String`/`Number`/`Boolean` compile and `isLoggedIn === "true"` is TS2367
    (common-mistake claims). Checked: one table for the three types, lowercase rule once,
    look-alike values, exercise adds a logic-order trap caught by a dedicated check, Mini
    Challenge reinforces types-not-values.
- [x] LESSON 13 — `null` and `undefined`
  - Gate 1: PASSED — demo TS18048 + TS2322, `[to fix]` TS18048, FAIL ×2 on starter
    (`undefined` for unlisted zones), PASS ×4 on solution; 459 words.
  - Gate 2: PASSED — design fix before build: a use-before-assign exercise would have put
    TS2454 into the Verification cell, so it stays a one-line explanation. Verified with the
    pinned compiler: TS18048 `'label' is possibly 'undefined'.`, TS2532 for a call result,
    TS2322 for `null` and `undefined`, TS2454 wording, TS2531 `Object is possibly 'null'.`
    (Mini Challenge), `else if` without a final return still TS18048 (common mistake).
    Outputs `DOMESTIC`, `INTERNATIONAL`, `Arrives in 5 days`, `10 null`. Unions deferred to
    LESSON 22 with a one-line reference; tutor-prompt misconception numbering fixed.
- [x] LESSON 14 — Annotate or infer?
  - Gate 1: PASSED — demo TS2345 + TS2322, `[to fix]` TS2322, FAIL ×3 on starter, PASS ×5
    on solution; 458 words.
  - Gate 2: PASSED — adds new material beyond LESSON 8 (no repetition): verified with pinned
    tsc that an unannotated `let` without a starting value accepts both `0` and `"available"`
    silently, that annotating it reports TS2322, and that an annotation moves the error from
    the use site (TS2551/TS2345) to the creation site (TS2322). Demo uses `Math.round` instead
    of `toFixed` so the uncaught string doesn't crash at runtime. Common-mistake claims
    verified (removing `: number` → TS2345 on the next line; `status: number` → TS2322 ×2).
    Outputs `0 available`, `12`, `low`.
- [x] LESSON 15 — Basic type checking: reading type errors
  - Gate 1: PASSED (re-run after fix) — demo TS2304 (uncalled function) + TS2554 + TS2551,
    `[to fix]` TS2322 + TS2551 + TS2554, FAIL ×3 on starter, PASS ×3 on solution; 510 words.
  - Gate 2: PASSED after fix — the demo's `"receipt".lenght` really reports `on type
    '"receipt"'`, a literal type not taught until LESSON 23 (QI-015); now a `let` variable,
    message confirmed as `on type 'string'`. Verified: Mini Challenge `invoice.ts` lines are
    real compiler output (TS2322, TS2554, TS2304, TS18048 with exact line/column); arithmetic
    97.6 / 152.5 / 24.9 / 7 / NaN with node; outputs `NaN`, `undefined`, `24.9 7`,
    `Desk lamp: NaN EUR`. Runtime-safe error choice (no crash in the starter). Topic 04
    `ai-prompt.txt` completed (LESSON 12-15, outcomes).

### 05_objects_arrays_tuples (roadmap Lesson 5)
- [x] LESSON 16 — Object types
  - Gate 1: PASSED (re-run after fix) — demo TS2741 + TS2353 + TS2322, `[to fix]` TS2561 +
    TS7006 ×2, FAIL ×4 on starter, PASS ×4 on solution; 493 words.
  - Gate 2: PASSED after fix — Mini Challenge answer claimed the compiler "suggests name" for
    `nmae`; the real TS2339 has no suggestion (QI-010 recurrence, logged). Verified with pinned
    tsc: demo messages word for word, `object` parameter → TS2339, renaming the type's property
    → TS2345 with the missing-property detail. Output `300 Ada Lovelace`. The misspelled
    `balanse` makes the "too much" transfer silently succeed at runtime — a real reason for
    object types. Type aliases deferred to LESSON 24.
- [x] LESSON 17 — Optional properties
  - Gate 1: PASSED — demo TS18048, `[to fix]` TS18048 + TS2741, FAIL ×2 on starter (NaN from
    a missing limit), PASS ×5 on solution; 444 words.
  - Gate 2: PASSED — design fix before build: requiring the property in the function while
    verification passed objects without it would have put errors in the Verification cell;
    both `[to fix]` errors now live in the exercise cell. Verified with pinned tsc:
    `a + b ?? 0` → TS18048 + TS2869 (common mistake), `(x ?? 0)` and `!== undefined` compile
    clean. Prerequisite check: `??`/`?.` are taught in `js-vanilla-course/12_modern_syntax`.
    Outputs `Ada: 555-0101`, `Grace: no phone`, `8`, `false true`, `true true`, `Ada no phone`.
    Mini Challenge is open-ended design (≈10% share).
- [x] LESSON 18 — Arrays and typed arrays
  - Gate 1: PASSED (re-run after fix) — demo TS2345 + TS18048, `[to fix]` TS7006 ×2, the
    unannotated `[]` with a string pushed is silent by design, FAIL ×3 on starter, PASS ×3 on
    solution; 439 words.
  - Gate 2: PASSED after fix — a common mistake claimed an unannotated mixed array "is never
    reported"; pinned tsc shows TS2345 with `(string | number)[]` at the later call (QI-016).
    Text now explains the moved error and the untaught union syntax in plain words; tutor
    prompt updated. Verified with pinned tsc: push of a wrong element TS2345, array argument
    element TS2322, `find` TS18048, index past the end not reported, `map` keeps
    `number[]`; TS7034/TS7005 (captured empty array, mentions `any[]`) deliberately kept
    out of the lesson. Arithmetic with node: 283, 120, -15, `"3012.5"`/-2687, the `reduce`
    empty-array error message. Outputs `465.5 [ "Ada", "Linus" ]`, `45.5`, challenge values.
- [x] LESSON 19 — Tuples and readonly tuples
  - Gate 1: PASSED (re-run after fix) — demo TS2322 ×2 + TS2493 + TS2540, `[to fix]` TS2322 +
    TS2540, FAIL ×5 on starter, PASS ×5 on solution; 511 words.
  - Gate 2: PASSED after fix — common mistake claimed `100 * 1.08` = `108.00000000000001`;
    node prints `108`, so rounding was never exercised (QI-002 recurrence). Added the
    verification case 19.99 EUR → USD (`21.589199999999998` unrounded, `21.59` rounded) to both
    notebooks. Verified with pinned tsc: wrong order (two TS2322), too many/few elements,
    TS2493 on a readonly tuple, unannotated `["EUR", 1.08]` is a mixed array (kept out of the
    lesson: its message shows union syntax), readonly assignment TS2540 and push TS2339, plain
    tuples still allow `push`, destructuring keeps types, `entry[2]` without a check →
    TS18048. Outputs `100 EUR = 108 USD`, `undefined`, `108`, `45.46 London`. The exercise's
    readonly-violating line would change EUR→USD to 1.5 at runtime (verified with node: 150),
    so Verification also catches it.
- [x] LESSON 20 — Practical data modeling
  - Gate 1: PASSED (re-run after fix) — demo TS2741 + TS2322, `[to fix]` TS7006 ×2, FAIL ×1
    on starter, PASS ×3 on solution; 576 words.
  - Gate 2: PASSED after fix — the demo's `phone?: string` made the studied message print
    `string | undefined` (untaught union syntax); removed, tutor prompt explains how messages
    display optional properties (QI-016 recurrence). Verified with pinned tsc: `limit[1]`
    without a check TS18048, required `managerEmail` → TS2345 on Ada's trip, `expenses` as a
    tuple → TS2345. Numbers with node (98, `["Hotel"]`). Outputs `Ada: 98 EUR, delivery from
    9:00`, `[ "Hotel" ]`, `Grace Hopper: 105 minutes`. Different domain from MP1 (travel
    expenses), so the lesson doesn't pre-solve the project. Topic 05 `ai-prompt.txt`
    completed (LESSON 16-20, outcomes).

### 06_mini_project_1_currency_converter
- [x] `PUBLISHING_GUIDE.md` (TypeScript setup from topic 02, commit loop, README template,
      finish checklist, review workflow)
- [x] `mini-project.md`
- [x] `ai-prompt.txt`
- [x] `review-prompt.txt`
- [x] Mini-project gate
  - Gate 1: PASSED — `node tools/validate-project.mjs 06_mini_project_1_currency_converter`
    (new tool): files, brief sections, checklists, starter-data block type-checks with TS 6.0.3,
    prompt markers.
  - Gate 2: PASSED — private reference implementation (scratchpad `mp1-reference`, never
    committed) uses only LESSON 1-20 concepts, every function returns one type; `npm run check`
    clean, build and start print balance 1014.51 EUR, a supported and an unsupported
    conversion, covered and uncovered payments. All 8 "Done when" claims verified by mutating
    the reference (`mp1-donewhen.mjs`): rate change changes output, one entry adds a pair,
    rate assignment → TS2540, removing the optional email compiles. Review: scope limited to
    LESSON 1-20 with explicit bans (aliases, interfaces, classes, enums, unions incl. hidden
    ones, generics, any, modules, libraries); requirements describe what, not how;
    learning value covers object type, optional property, typed array, readonly tuples, find +
    undefined check; review prompt covers correctness, requirements, taught/untaught,
    complexity, readability, bugs, scope; native-English review of brief, guide and prompts.

## Level 2 — Type modeling and functions

### 07_type_composition_narrowing (roadmap Lesson 6)
- [x] LESSON 21 — `any` vs `unknown`
  - Gate 1: PASSED — demo TS18046 (any line silent by design), `[to fix]` TS18046, FAIL ×3 on
    starter, PASS ×6 on solution; 511 words.
  - Gate 2: PASSED — verified with pinned tsc: `any` silences method calls, assignments and
    values read from it; `unknown` → TS18046 on use and property reads, TS2322 on assignment
    to `number`; `typeof` checks unlock it; comparing an `unknown` before checking → TS18046
    (common mistake). Runtime values from a script file (QI-014 recurrence logged: `node -e`
    quoting): `"121"`, `19.9`, `true * 1` = 1, `"half" * 1` → `null` in JSON, changing to
    `any` leaves exactly 3 failing checks. Outputs `19.9 5 0`, `121` ×2, `15`. Object
    narrowing of `unknown` deferred to LESSON 26/63 (exercise stays with primitives); the
    helper's `unknown` is now explained.
- [x] LESSON 22 — Union types
  - Gate 1: PASSED — demo TS18047 + TS2339 (two-line message), `[to fix]` TS7006 + TS2322 ×2,
    FAIL ×4 on starter, PASS ×4 on solution; 463 words.
  - Gate 2: PASSED — verified with pinned tsc: union assignment TS2322, member-only method
    TS2339, `string | null` TS18047, narrowing after assignment (no error), inferred
    `number | null` return + TS18047, union array push TS2345, `number | null` to `number`
    TS2345; common mistakes: `string | number | null[]` without parentheses rejects the array
    (TS2322 against `null`), `toUpperCase` before the null check TS18047. Outputs
    `ACC-000042 ACC-777`, `6`, `INV-1042`, `12.50`. Connects back to messages seen in
    LESSON 17-20 and to MP1's same-return-type rule.
- [x] LESSON 23 — Literal types
  - Gate 1: PASSED — demo TS2322 + TS2345 + TS2367, `[to fix]` TS7006 ×2, FAIL ×5 on starter,
    PASS ×5 on solution; 538 words.
  - Gate 2: PASSED — design fix before build: `check:nb` merges cells, so a top-level
    comparison would see `l23Status` narrowed by an earlier assignment; the TS2367 demo lives
    in a function with a typed parameter. Verified with pinned tsc: literal-union assignment
    TS2322, `const` keeps `"EUR"` while `let` widens (TS2322/TS2345), object properties widen
    even in `const` objects, annotated properties keep literal unions, number literal unions,
    TS2367 for impossible comparisons, `"payed"` TS2345, literal types in tuples; common
    mistakes: `"Amex"` TS2367, unannotated order object TS2345 at the call, `months: number`
    silently accepts 5. Outputs `paid 100`, `Currency set to EUR`, `VISA: 6 monthly payments`,
    `Theme: dark annual gold`. `as const` deliberately not taught (type assertions are out of
    scope).
- [x] LESSON 24 — Type aliases and custom types
  - Gate 1: PASSED — demo TS2741 + TS2322 + TS2693 (in an uncalled function to avoid a runtime
    ReferenceError), `[to fix]` TS2304, FAIL ×3 on starter, PASS ×7 on solution; 514 words.
  - Gate 2: PASSED — verified with pinned tsc: messages use alias names (`'Account'`,
    `'Currency'`), nested property/tuple errors, same-shape aliases interchangeable, TS2300
    duplicate alias, TS2693 type used as value, primitive aliases display as `string`;
    common mistakes: directly returned object literal widens `status` → TS2322 when stored as
    the alias, `status: string` silently accepts `"complete"`, literal union gives TS2820
    "Did you mean". Outputs `Ada: 250 EUR 2`, `rejected`, `completed`, `2 1`. Mini Challenge
    refactors LESSON 20's model; return-type annotations still deferred to LESSON 28.
- [x] LESSON 25 — Enums
  - Gate 1: PASSED — demo TS2322 + TS2339, `[to fix]` TS2345, FAIL ×4 on starter (numeric
    enum `Object.values` → `["Groceries","Travel","Entertainment",0,1,2]`), PASS ×4 on
    solution; 505 words.
  - Gate 2: PASSED — experiment: `node file.ts` rejects enums (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX:
    TypeScript enum is not supported in strip-only mode`), tsc emits a runtime object, the
    compiled file runs, the Deno kernel runs enums; recorded in COURSE_PLAN verified facts and
    taught explicitly (LESSON 5's `node file.ts` limitation). Pinned tsc: numeric enum
    rejects `5` but accepts in-range `1`, string enum rejects `"USD"`, misspelled member TS2339
    `typeof Currency`, different-enum comparison TS2367. Design: the starter defines a numeric
    enum (an undefined enum would crash the Verification cell at runtime). Cashback values
    with node (1.6, 3.6, 0.46; unrounded 0.455). Output `Money has arrived [ "PENDING",
    "COMPLETED", "FAILED" ]`, `3.6`.
- [x] LESSON 26 — Basic type narrowing
  - Gate 1: PASSED (re-run after fix) — demo TS2339 + a truthiness logic bug (no error by
    design), `[to fix]` TS2362 + TS18047, FAIL ×7 on starter, PASS ×7 on solution; 542 words.
  - Gate 2: PASSED after fix — Gate 1 caught `...` used as punctuation in demo comments
    (reworded; checklist line added). Verified with pinned tsc: `typeof`/`else`, early return,
    `=== null`, truthiness, `switch`, `!== undefined` all narrow; an `if` without return/else
    restores the full union (TS2339); TS2367 shows the narrowed type; truthiness `0` pitfall is
    silent; a planned claim ("narrowing is lost inside callbacks") was FALSE in TS 6.0.3 and
    was not taught; common mistake `typeof` without else → TS2362. Numbers with node (4.9,
    6.4, 9.4, NaN; `Math.round` gives 4.9 for 2.4 kg). Outputs `no amount 12.5 7.00`,
    `no discount`, `6.4`, `0  no`.
- [x] LESSON 27 — Discriminated data
  - Gate 1: PASSED (re-run after fix) — demo TS2339 + TS2820, `[to fix]` TS2339 (`method:
    string` breaks narrowing), FAIL ×5 on starter, PASS ×7 on solution; 585 words.
  - Gate 2: PASSED after fix — Mini Challenge answer 3 claimed `phone`, `address` and
    `deviceId` would all be reported with one `channel: string` variant; pinned tsc reports only
    `phone` and `deviceId` (QI-016 recurrence logged). Verified: variant-only property TS2339 on
    the union, `if`/`switch` narrowing, wrong property in a narrowed branch, extra property
    TS2353, typo TS2820, `kind: string` breaks narrowing, a forgotten case shows up as
    `string | undefined` (TS2322 when stored as `string`), not inside the switch. Arithmetic
    with node (9.9). Outputs `[ "42.5 EUR by card ending 4242", "10 EUR in cash" ]`,
    `9.9 Courier to Via Roma 1 (express)`, `ada@example.com`. Different domain from MP2
    (delivery options, notifications). Topic 07 `ai-prompt.txt` completed (LESSON 21-27,
    outcomes). **Topic 07 complete.**

### 08_functions (roadmap Lesson 7)
- [x] LESSON 28 — Parameter and return types
  - Gate 1: PASSED (re-run after fix) — demo TS2322 + TS2366, `[to fix]` TS2322 ×4, FAIL ×6 on
    starter, PASS ×6 on solution; 637 words.
  - Gate 2: PASSED after fixes — rounding was not exercised (`1500 - 900 - 86.45` is exactly
    513.55); the statement gained `-12.1` (raw `501.44999999999993`), and the exercise text said
    "three" errors while `check:nb` listed four (both logged under QI-002). Verified with pinned
    tsc: wrong return TS2322, missing return TS2366, `void` return TS2322 and use TS2339, extra
    argument TS2554, `Account | undefined` result TS18048, annotated return keeps literal
    unions, removing the annotation moves the error to the caller (TS2345 with `status: string`).
    Outputs `Grace: 40.50 EUR`, `15`, `2 transactions, total 600.00 EUR (credit)`.
- [x] LESSON 29 — Optional and default parameters
  - Gate 1: PASSED — demo TS18048 + TS2345, `[to fix]` TS18048, FAIL ×5 on starter, PASS ×6 on
    solution (rounding exercised: raw 333.3333333333333 and 343.3333333333333); 541 words.
  - Gate 2: PASSED — verified with pinned tsc: optional used directly TS18048, required after
    optional TS1016, `?` with a default TS1015 (both kept out of runnable cells: grammar
    errors), default type inferred, `null` to a defaulted parameter TS2345 (message shows
    `T | undefined`), wrong default type TS2322, `Expected 1-2 arguments`, skipping a middle
    default with `undefined`. Runtime values from a script: `null` is used as the value
    (`10.00 null`), `receipt(10, "gift")` puts the note into the currency. Outputs match the
    comments.
- [x] LESSON 30 — Function expressions and arrow functions
  - Gate 1: PASSED — demo TS7006 + TS2355 + TS2695, `[to fix]` TS7006 ×2, FAIL ×5 on starter,
    PASS ×7 on solution; 534 words.
  - Gate 2: PASSED — verified with pinned tsc: standalone untyped arrow TS7006, callback
    parameters inferred (TS2339 when misused), object literal in braces → TS2355 + TS2695 (a
    two-property version would be a syntax error, so the demo keeps one label), wrong arrow
    return TS2322, `map` result vs annotation TS2322, const used before declaration TS2448 +
    TS2454 (kept as a prediction question: it would throw at runtime). Node: braces return
    `undefined`, travel total raw 173.60000000000002. Outputs `[ "12.20 EUR", "31.11 EUR",
    "120.78 EUR" ]`, `5 EUR undefined`, `173.6`, `[ 90, 36 ] 45`.
- [x] LESSON 31 — Function types
  - Gate 1: PASSED — demo TS2322 ×2 + TS2345 (callback misuse in an uncalled function), `[to fix]`
    TS2322 + TS7006, FAIL ×5 on starter, PASS ×9 on solution; 626 words.
  - Gate 2: PASSED after fix — the Mini Challenge answer for b) missed that a non-matching arrow
    also loses parameter inference (TS7006 ×2 alongside TS2322); added. Verified with pinned
    tsc: wrong return, wrong parameter type (three-line message), fewer parameters fit, more
    required parameters don't ("Target signature provides too few arguments"), names don't
    matter, string passed as a callback TS2345, `T | undefined` return in a function type,
    `(x): number` inside a type is TS1005 (syntax, kept out of cells); `rules: DiscountRule`
    → TS2339 on `reduce`. Node: `Math.max(...[])` is `-Infinity`, `123.45 * 0.1` raw 12.345,
    final raw 111.10000000000001. Outputs `Card (fee 0.3 EUR) | Wallet (fee 0 EUR)`, `1`,
    `111.1`, `5.00 free`.
- [x] LESSON 32 — Type-safe function design
  - Gate 1: PASSED — demo TS2561 + TS2339, `[to fix]` TS2322 + TS2339, FAIL ×9 on starter, PASS
    ×9 on solution; 665 words.
  - Gate 2: PASSED after a simplification — the first Mini Challenge solution had a contrived
    placeholder body (`summary.length > 0 ? ...`); replaced with a plain placeholder return.
    Verified with pinned tsc: wrong error literal TS2322, variant-only property TS2339, boolean
    literal discriminant narrows with `if (result.ok)` and `=== false`, `{ ok: true }` missing
    amount TS2322, misspelled option TS2561, wrong option value TS2322. Node: `Number("")` and
    `Number("   ")` are 0, `parseFloat("12abc")` is 12. Verification compares `.ok` and
    strings, never whole result objects (key order would make correct answers fail).
    Outputs `2.5 EUR | 5 EUR | no rate available`, `1 EUR`, `Amount: 12.50 EUR`, `TX-50`.
    Topic 08 `ai-prompt.txt` completed. **Topic 08 complete.**

### 09_mini_project_2_transaction_validator
- [x] `mini-project.md` · `ai-prompt.txt` · `review-prompt.txt`
- [x] Mini-project gate
  - Gate 1: PASSED — `node tools/validate-project.mjs 09_mini_project_2_transaction_validator`
    (files, sections, checklists, starter-data block type-checks, prompt markers).
  - Gate 2: PASSED — private reference (`mp2-reference`, never committed) uses only LESSON 1-32:
    discriminated transaction types, currency literal union, string enum for the category,
    `JSON.parse` into `unknown`, one validation function returning a result type, a
    function-type filter criterion, totals per currency. `npm run check` clean; report prints
    `Valid: 4, invalid: 6`, a reason per invalid record and `EUR: 1219.90`. Done-when claims
    verified by mutating the reference (`mp2-donewhen.mjs`): a new bad record appears with its
    reason; reading `transaction.recipient` without a check → TS2339; changing the criterion
    changes the filter output; the source contains no `any`/`as` (the only match was the header
    comment).
  - Scope note: `Array.isArray` narrows to an array with **unchecked** elements, so the brief
    adds two hints that stay inside the course — copy each field into a variable typed
    `unknown` before checking it, and narrow a checked string to the currency union by
    comparison instead of `as`. Both are covered in the tutor and review prompts.

## Level 3 — Compiler, classes and interfaces

### 10_compiler_tsconfig (roadmap Lesson 8)
- [x] LESSON 33 — `tsc`: type checking vs compilation
  - Gate 1: PASSED — terminal-practice Example/Exercise/Verification; challenge cells run;
    600 words.
  - Gate 2: PASSED — every command and output verified in `ts-scratch-33`: `npm run check`
    prints `src/index.ts(5,7): error TS2322 ...` (exit 2, no dist); `npm run build` prints the
    same error, exit 2, **and** writes `dist/index.js` with `const total = "100";`, so
    `npm start` prints `1`; with `"noEmitOnError": true` the build exits 1 and creates no
    `dist`; after the fix both commands are clean; `npx tsc --noEmit --watch` prints
    `Found 0 errors. Watching for file changes.`. Common mistake "dist still there from the
    earlier build" is exactly what the experiment showed. Builds on LESSON 5 and 7 without
    repeating them.
- [x] LESSON 34 — `target` and `module`
  - Gate 1: PASSED — terminal practice; 616 words.
  - Gate 2: PASSED — all outputs verified in `ts-scratch-34`, `-34b` and `-34c`, including the
    exact exercise steps: `src/index.ts(5,28): error TS2550 ... Try changing the 'lib' compiler
    option to 'es2022' or later.`; ES2022 keeps `??` and `.at(-1)`, ES2015 emits
    `note !== null && note !== void 0 ? note : "(none)"`; `npm start` prints
    `Last: 30, note: (none)` in both cases; `module: commonjs` and `nodenext` with
    `"type": "commonjs"` emit `require`, `nodenext` with `"type": "module"` keeps `import`.
  - **Roadmap note:** the roadmap lists `target` with older values in mind, but TS 6.0.3 rejects
    `"ES5"` with `error TS5107: Option 'target=ES5' is deprecated`. The lesson teaches
    downleveling with `ES2015` instead and states the deprecation; recorded in COURSE_PLAN.
- [x] LESSON 35 — `rootDir` and `outDir`
  - Gate 1: PASSED (re-run after fix) — Gate 1 first rejected `...` inside fenced paths; long
    paths now use `<project>/` placeholders (checklist line added); 524 words.
  - Gate 2: PASSED — verified in `ts-scratch-35`: `rootDir: src` + `outDir: dist` mirrors the
    structure (`dist/domain/account.js`); without `rootDir` the output gains a level
    (`dist/src/...`, `dist/tools/seed.js`); without `outDir` the `.js` files land inside `src/`;
    a file outside `rootDir` → TS6059 including the "file is in the program because" detail;
    `tsc --showConfig` shows the `outDir` auto-exclusion, even for `src/build`.
- [x] LESSON 36 — Strict mode and important compiler options
  - Gate 1: PASSED — 654 words.
  - Gate 2: PASSED after three fixes found by experiment (`ts-scratch-36`, `-36b`, `-36c`):
    the example's error lines and order were wrong (real: TS7006 at 3,18; TS2322 at 9,5;
    TS18048 at 11,35); `noUncheckedIndexedAccess` gives TS2532 for a property read and TS2345
    when passing the element, not TS18048 as first written; and `noUnusedLocals` does **not**
    report a top-level variable in a file without `export`, so the exercise now says "inside a
    function" (TS6133 verified there, and at top level once the file has an `export`). Also
    verified: `strict: false` silences all three example errors; the solution file compiles with
    strict + `noUncheckedIndexedAccess` + `noUnusedLocals` and prints `Ada not found null`.
- [x] LESSON 37 — Development workflow and compilation errors
  - Gate 1: PASSED (re-run after a tooling fix) — 760 words. **Tooling bug found by Gate 1:**
    the `~~~~~~` underline in `tsc --pretty` output was parsed as a markdown fence, which hid
    every heading after it. `validate.mjs` and `check-notebook.mjs` now treat only backtick
    fences as fences (recorded in COURSE_PLAN); self-test 10/10 and all earlier topics
    re-validated PASS.
  - Gate 2: PASSED after fix — step 5's error position was quoted as line 19; the real line is
    18 (QI-012 recurrence, caught by re-running the exact file). Verified in `ts-scratch-37`
    and `-37b`: one renamed property produces exactly 4 errors (2× TS2353, 2× TS2339), one edit
    clears all four, `npm start` prints `Ada: 250.50 EUR / Grace: 40.00 EUR / 29050`, and
    `--pretty` adds the code frame plus `Found 1 error in src/index.ts:18`.
    Topic 10 `ai-prompt.txt` completed (LESSON 33-37, outcomes). **Topic 10 complete.**

### 11_classes (roadmap Lesson 9)
- [x] LESSON 38 — Class syntax, properties, constructors and methods
  - Gate 1: PASSED first run — structure, sources in sync, 6+4 code cells type-checked,
    2 expected demo errors, verification FAILs on the starter and PASSes on the solution;
    660 words.
  - Gate 2: PASSED — all messages copied from `check:nb`: TS2564 on the declaration line,
    TS2554 for the short `new` call, TS2322 ×2 in the starter (exactly the "four `[to fix]`
    errors" the exercise promises), TS2663 with its `this.cash` suggestion (reported twice on
    the one line) and TS2339 ×5 for the "deleted the declarations" mistake (`claims-l38.ts`,
    `claims-l38b.ts`). Numbers run in `values-l38.mjs`: rounding is genuinely exercised
    (`1000 - 666.66` = `333.34000000000003` → `333.34`), the cap case gives `0`/`true`, and
    the printed lines match the executed notebooks. Scope stays inside "syntax, properties,
    constructors, methods": no modifiers, `readonly`, `static` or inheritance. Checked that
    an object literal also satisfies a class type, so the lesson only claims the class name
    *is* a type and makes no nominal claim.
- [x] LESSON 39 — Access modifiers: `public`, `private`, `protected`
  - Gate 1: PASSED first run — 11+7 code cells type-checked, 4 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 730 words.
  - Gate 2: PASSED — messages verified in `claims-l39.ts`: TS2341 (private), TS2445 (protected,
    with "and its subclasses"), TS2341 twice on one line for a read-and-write, TS2341 for a
    private method, and TS2322 with the "private in type ... but not in type" detail for an
    object literal. `check:nb` lists exactly the three `[to fix]` errors the exercise
    promises, on the last two lines of the cell. Values from `values-l39.mjs` /
    `values-l39b.mjs`: `false true`, `Ada: 250.00 EUR`, `0042 0`,
    `{"label":"Vault","code":"0042","auditLog":[]}`, `Ada: 75.00 EUR (blocked)`,
    `Ada: 45.00 EUR (active)`.
  - **Scope note:** `protected` is explained and its error message shown, but it is only
    *used* from LESSON 43 (the first lesson with a subclass). The roadmap lists all three
    modifiers together, so the split is unchanged; the lesson says plainly that subclasses
    come in LESSON 43, and the exercise needs `public`/`private` only. No hidden prerequisite.
- [x] LESSON 40 — `readonly` and parameter properties
  - Gate 1: FAILED once, then PASSED — the first run caught a real defect: the solution's
    `label()` printed `EUR` twice and its Verification cell had been adjusted to match
    (QI-019). After the fix: 16+10 code cells type-checked, 6 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 689 words.
  - Gate 2: PASSED — `claims-l40.ts` confirms TS2540 inside another method and from outside,
    that a constructor assignment is allowed, that `readonly currency` works without `public`,
    that a private parameter property gives TS2341 from outside, that
    `readonly holdings: string[]` still allows `push`, and that `readonly string[]` gives
    `Property 'push' does not exist on type 'readonly string[]'.` (TS2339).
    `claims-l40b.ts` confirms the "forgot the modifier" mistake (TS2339 twice on the line).
    Values from `values-l40.mjs`: `Ada (IT60X): 350.00 EUR`, `IT60 EUR 1250.00 (open)`,
    final balance `1250`, `IT60 EUR 1250.00 (closed)`. `check:nb` shows exactly the one
    `[to fix]` error the exercise promises.
  - **Note:** step 1 of the exercise (rewrite the constructor with parameter properties) is a
    style requirement no automated check can prove — both forms satisfy the Verification cell.
    The behavior steps are fully checked, and the solution shows the intended form.
- [x] LESSON 41 — `static`
  - Gate 1: FAILED once, then PASSED — the first run caught a planted TS2662 in the starter
    that crashed the executed notebook (`ReferenceError: maxAmount is not defined`), which also
    silenced the verification output (QI-020). After the fix: 21+13 code cells type-checked,
    9 expected demo errors, verification FAILs on the starter and PASSes on the solution;
    778 words.
  - Gate 2: PASSED — `claims-l41.ts` confirms TS2339 on `typeof Rate` inside a static method,
    TS2662 and TS2576 with their full "Did you mean" hints (TS2576 ends with "instead?"),
    TS2540 for a static readonly assigned from outside **and from the constructor** (so a
    counter can't be `static readonly` — used in the solution's common mistakes and the Mini
    Challenge), TS2341 for a private static from outside, that an instance method may read a
    private static, and that a writable public static can be changed from outside with no
    error. Values from `values-l41.mjs`: `2 false true`, `undefined 3.5 1.75`,
    `5000 IT60 -> IT61: 100.00 EUR`, allowance `true true false false`, counter delta `2`.
  - **Note:** the counter check compares `countMade()` before and after, so the cell is safe to
    re-run and doesn't depend on how many instances the student's own cell created.
- [x] LESSON 42 — Getters and setters
  - Gate 1: PASSED (after a tooling fix, QI-021) — 26+16 code cells type-checked, 10 expected
    demo errors, verification FAILs on the starter and PASSes on the solution; 727 words.
    The ai-prompt check now ignores the "DO NOT INTRODUCE YET" block; `node tools/self-test.mjs`
    10/10 and all nine built topics re-validated PASS after the change.
  - Gate 2: PASSED — `claims-l42.ts` confirms TS2540 for a getter with no setter and TS2300
    ("Duplicate identifier") when the stored property shares the accessor's name, and shows
    that a `get`/`set` pair with **different** types is accepted by TS 6.0.3 (so the lesson
    makes no claim about it) and that `TS1054` (a getter with parameters) is a syntax-level
    error, kept out of runnable cells. `values-l42.mjs` confirms that assigning to a
    getter-only property **throws** at runtime
    (`TypeError: Cannot set property spent of #<Card> which has only a getter`), so the demo
    keeps that line inside a method nothing calls and says why. Values from `values-l42b.mjs`:
    `66.6 33.4` (raw `33.400000000000006`), `83.4`, `12.1 of 150`, `19.87` (raw
    `19.869999999999997`), `180.13`. Both rounding rules are exercised by separate cases.
- [x] LESSON 43 — Inheritance: `extends` and `super`
  - Gate 1: PASSED first run — 31+19 code cells type-checked, 13 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 774 words.
  - Gate 2: PASSED — `claims-l43.ts` confirms TS2377 **and** TS17009 together for a derived
    constructor that touches `this` without `super(...)`, TS2341 for a `private` base member in
    a subclass while `protected` is fine, a parameter property in a derived constructor,
    `super.summary()`, TS2416 with its three-line detail for an incompatible override, TS2554
    for the subclass's own arity, that a subclass instance is assignable to the base type and
    into a base-typed array, and TS2339 for a subclass-only member read through the base type.
    `values-l43.mjs`: `Ada: 3000 EUR limit, 112 EUR per year, 4 lounge visits`,
    `Grace: 1000 EUR limit, 12 EUR per year`, `112` through the base type (dynamic dispatch),
    `Ada: 152.25 EUR, fee 0.00 EUR (MIT)` (raw `152.24999999999997`, so rounding is exercised),
    `Grace: 98.00 EUR, fee 2.00 EUR`, fees `[2, 0]`.
  - **Design note:** the starter already contains `extends` and the `super(...)` call, because
    the Verification cell has to type-check against the starter (a non-extending starter would
    make `L43Account[] = [plain, student]` an error in the Verification cell itself). The
    hands-on `super` practice is the `super.summary()` override, and a missing `super(...)`
    call is shown in the demo cell instead — where nothing constructs the class, since that
    error also throws at runtime (QI-020).
- [x] LESSON 44 — Abstract classes
  - Gate 1: FAILED once, then PASSED — the first run caught the same trap as LESSON 43 from the
    other side: the Verification cell declared `const l44Loans: L44Loan[] = [...]`, which is a
    type error *in the Verification cell* while the starter's rate still returns `string`. The
    cell now calls `totalDue()` on each loan directly; the base-type array is demonstrated in
    the Example instead. After the fix: 36+22 code cells type-checked, 15 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 758 words.
  - Gate 2: PASSED — `claims-l44.ts` confirms TS2511, TS2654 (several missing members, with
    both names listed), TS2515 (a single missing abstract property, unquoted member name),
    TS2416 for an implementation with the wrong type, TS2513 for an abstract method reached
    through `super`, and that the abstract class name works as a type. `values-l44.mjs`:
    `Card: 80.00 EUR + 1.12 EUR fee`, `Transfer: 80.00 EUR + 0.00 EUR fee`, totals
    `[1725.5, 4792.5]` (raw `1725.4999999999998`, so rounding is exercised), remaining
    `1525.5`, `Car loan (AB-123-CD) for Grace: 4792.50 EUR left`, and the runtime behavior the
    Mini Challenge asks about: `new Loan(...)` succeeds, then `summary()` throws
    `TypeError: this.label is not a function`.
  - **Note:** with the starter, "remaining after a payment" still PASSes, because
    `"1.5" / 100` works in JavaScript. That is the point of the "returning the rate as a
    string" common mistake, and the rate itself is compared separately.
- [x] LESSON 45 — Composition vs inheritance
  - Gate 1: PASSED first run — 40+25 code cells type-checked, 15 expected demo errors,
    verification FAILs on the starter (8/8) and PASSes on the solution; 750 words.
  - Gate 2: PASSED — a design lesson with no new syntax, so the checks are behavioral:
    `values-l45.mjs` gives `Ada: 64.99 EUR, 3 movements, last refused 500.00 EUR`, balance
    `78.2` after `120 + 1.80` (raw fee `1.7999999999999998`, so rounding is exercised), `80`
    for the free policy, `Fees: 1.5% (min 0.50 EUR)` and `Fees: 0% (min 0.00 EUR)`, and the
    minimum fee applying to small amounts (`0.5` for both `10` and `19.99`). The two `[to fix]`
    errors are TS2322 and TS2341, both copied from `check:nb`; the starter's
    `this.fees.percent` still prints `1.5` at runtime, which quietly re-makes LESSON 39's point
    that the modifiers are compile-time only.
  - **Topic 11 complete.** All eight lessons build on one banking narrative (loan, card,
    deposit, transfer, store card, student account, loan hierarchy, fee policy) and stay inside
    the roadmap's list for Lesson 9. The closing note points forward to interfaces.

### 12_interfaces (roadmap Lesson 10)
- [x] LESSON 46 — Interface syntax, optional and readonly properties
  - Gate 1: PASSED first run — 6+4 code cells type-checked, 3 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 730 words.
  - Gate 2: PASSED — `claims-l46.ts` confirms TS2540, TS2353, TS2741 (with the full inferred
    type printed), TS2561 with its spelling suggestion, TS18048 for an unchecked optional
    property, TS2693 for an interface used as a value, and that an object **assigned through a
    variable** carries extra properties with no error while the same literal is rejected — the
    fact the Mini Challenge turns on. `claims-l46b.ts` confirms the Mini Challenge's third
    answer: adding a required property reports the literal with TS2353 (the excess property
    wins) and the variable assignment with TS2741. Values from `values-l46.mjs`. The starter's
    runtime output also shows TS2540 is compile-time only: the rename really does overwrite the
    IBAN when the code runs.
- [x] LESSON 47 — Method definitions
  - Gate 1: PASSED first run — 11+7 code cells type-checked, 5 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 726 words.
  - Gate 2: PASSED — `claims-l47.ts` confirms both notations, contextual typing of an
    unannotated parameter inside a matching literal, TS2741 for a missing method, TS2322 for a
    wrong return type and for a wrong parameter type (with the "Types of parameters ... are
    incompatible" detail), TS2554, TS2722 for an unchecked optional method, and that a class
    instance satisfies the interface without naming it (the Mini Challenge's third answer).
    `claims-l47b.ts` confirms the starter produces exactly the two promised errors, and
    `claims-l47c.ts` that both `!== undefined` and `?.()` satisfy the compiler. Values from
    `values-l47.mjs`: fees `1.8 / 0.5 / 0.5`, totals `2.8` and `1.5`, the two fee lines, and
    the example's two report lines. Rounding is exercised by the `feeFor(120)` case
    (raw `1.7999999999999998`).
- [x] LESSON 48 — Extending interfaces
  - Gate 1: FAILED once during authoring, then PASSED — the first build planted TS2430 on an
    interface the Verification cell depends on, which spread into that cell (QI-022). The
    exercise now plants TS2741 and TS2339; the incompatible extension is shown in the demo.
    After the fix: 16+10 code cells type-checked, 7 expected demo errors, verification FAILs on
    the starter and PASSes on the solution; 749 words.
  - Gate 2: PASSED — `claims-l48.ts` confirms extending two interfaces at once, TS2739 for
    several missing inherited properties, TS2430 with its detail, that narrowing an inherited
    property (`amount: 10 | 20 | 50`) is **accepted**, that the extended type is assignable to
    the base and into a base-typed array, TS2339 through the base type, and that `readonly` is
    inherited (TS2540). Totals run in node: `40.7 + 120.1 + 2.15` is `162.95000000000002`, so
    the rounded total is exercised. Outputs match the executed notebooks.
- [x] LESSON 49 — Implementing interfaces
  - Gate 1: FAILED once, then PASSED — the first run caught two real defects: the solution cell
    didn't declare the interfaces it implements (TS2304 in `solutions.ipynb`), and the lesson
    was 822 words. Both fixed (the demo lost its second class, prose trimmed); 767 words.
    A third defect was caught while authoring: the Verification cell first contained
    `const l49AsBillable: L49Billable = l49Order`, which cannot type-check while the starter's
    `total()` returns `string` (QI-022); the interface-typed reference now lives in the Example.
  - Gate 2: PASSED — `claims-l49.ts` confirms TS2420 with all three details (missing member,
    "is private in type C but not in type I", and the multi-member "missing the following
    properties" form), that a **wrong signature gives TS2416**, not TS2420 — the same message
    an incompatible override gets — that a getter satisfies a `readonly` property, that a class
    may implement two interfaces and extend a class at once, that an object literal cannot
    satisfy a class type with private members (TS2739 naming `stopped, lines`), and TS2554.
    Numbers from node: `8.9 * 12` is `106.80000000000001` and `4.15 * 3` is `12.450000000000001`,
    so two independent cases exercise the rounding.
- [x] LESSON 50 — Interface vs type alias
  - Gate 1: PASSED.
  - Gate 2: PASSED — reviewed during the whole-course final QA (the checkbox had been left
    unticked at a topic boundary, see QI-026). 699 words. Demo messages re-confirmed:
    `Duplicate identifier 'L50Mode'.` (TS2300) on **both** lines, as the comment says, and
    `Property 'note' is missing in type '{ id: string; }' but required in type 'L50Draft'.`
    (TS2741) from the merged interface. Exactly two `[to fix]` errors, quoted verbatim in the
    solution: `Type '"GBP"' is not assignable to type 'L50Currency'.` and
    `Type 'L50Money[]' is not assignable to type 'string'.` Numbers re-run in node: the EUR
    total is 359.605 → **359.61** and the USD total 395.445 → **395.45**, so both rounding
    cases have a raw value that differs from the printed one (QI-002). One English fix: a
    gerund-subject clause about repeated alias names was rewritten.

### 13_mini_project_3_banking_accounts_loans
- [x] `mini-project.md` · `ai-prompt.txt` · `review-prompt.txt`
- [x] Mini-project gate
  - Gate 1: PASSED — required files, heading, Prerequisites/Repository lines, the eight
    sections in order, Core and Done-when checklists, no omissions, and the one `typescript`
    block type-checks with the pinned compiler.
  - Gate 2: PASSED — a private reference implementation (`mp3-reference/`, never committed)
    was written first and proves the brief is achievable with LESSON 1-50 only: two interfaces
    (one for every product, one only for the products with interest), an abstract `Product`
    with two abstract members, three product classes extending it, a `FeeRule` part held by
    composition, `private` amounts, `readonly` identity, a getter, a `private static` counter
    and a `public static readonly` currency. `npm run build` + `npm start` print:
    savings `2689.70`, card `-122.31`, loan `-6922.50`, spare card `-200.00`, interest
    `39.75` and `422.50`, `Products opened: 4`, available `1377.69`, total `-4555.11 EUR`.
    Refused operations (withdrawal of 5000, charge of 100000) leave the products untouched, as
    the statement shows. Rounding is genuinely exercised: the card fee on `120.50` is
    `1.8075` → `1.81`, and the savings interest `39.74925` → `39.75`.
  - **Done-when proof:** `mp3-donewhen.mjs` runs 8 mutations against the reference; all 8
    behave as the brief claims — TS2420 on the class for a removed interface member, TS2511 for
    `new Product(...)`, TS2341 for assigning a private amount, TS2540 for assigning a readonly
    id, TS2339 for a card-only member through the shared interface, TS2515 for a product that
    forgets an abstract member, and a clean type-check for a second card with a different fee
    rule (the composition claim).
  - **Scope note:** the reference deliberately avoids `instanceof`, `in` and type guards
    (LESSON 62-66) by keeping a second, narrower list of the products that earn interest — a
    union of the two classes, which is what LESSON 22 and 45 already give the student. The
    tutor prompt names that temptation explicitly.

## Level 4 — Advanced practical TypeScript

### 14_generics (roadmap Lesson 11)
- [x] LESSON 51 — Why generics exist: generic functions
  - Gate 1: PASSED.
  - Gate 2: PASSED — reviewed during the whole-course final QA (the checkbox had been left
    unticked at a topic boundary, see QI-026). 753 words. Every compiler claim in the prose
    re-run (`claims-l51-audit.ts`): `'u' is of type 'unknown'.` (TS18046) for the `unknown[]`
    alternative, and `Type 'number' is not assignable to type 'T'.` with the detail
    `'T' could be instantiated with an arbitrary type which could be unrelated to 'number'.`
    Demo messages confirmed: `Property 'toFixed' does not exist on type 'T'.` and
    `Property 'length' does not exist on type 'number'.` The two `[to fix]` errors are that
    same TS2322 plus TS2345 `Argument of type 'L51Payment[]' is not assignable to parameter
    of type 'string[]'.`, which is the TS2345 the Explanation cites for a disagreeing type
    argument. Printed values checked: `40.7 M-2`, `2 1`, `3`. The lesson opens with the three
    bad alternatives before naming the idea, which is why it runs slightly long.
- [x] LESSON 52 — Generic types and interfaces
  - Gate 1: PASSED first run — 11+7 code cells type-checked, 4 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 674 words.
  - Gate 2: PASSED — `claims-l52.ts` confirms TS2314 for a missing type argument (one and two
    parameters), TS2322 for a wrong value in the filled-in `T`, TS2339 with its detail for
    reading the other branch of a generic result, that discriminant narrowing works unchanged
    on a generic union, that a generic interface is satisfied by an object literal with a
    method, and that a function returning `Result<T>` infers `T` from its argument. Parsing
    values run in node: `Number("")` is `0` (the reason the empty check comes first),
    `Number("abc")` is `NaN`, and `40.705` rounds to `40.71`, so the rounding case is real.
- [x] LESSON 53 — Generic classes
  - Gate 1: PASSED first run — 16+10 code cells type-checked, 7 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 699 words.
  - Gate 2: PASSED — `claims-l53.ts` and `claims-l53b.ts` confirm TS2345 for a wrong item,
    TS2314 (whose message for a class reads `'L53Batch<T>'`, unlike the alias form),
    TS2302 "Static members cannot reference class type parameters", TS2322 between two
    instantiations of the same class, that a subclass may fill the argument in
    (`extends Store<string>`), and that the planted static produces **only** TS2302 — the
    wrong return value inside it is not reported on top.
- [x] LESSON 54 — Generic constraints and `keyof`
  - Gate 1: PASSED first run — 21+13 code cells type-checked, 10 expected demo errors,
    verification FAILs on the starter and PASSes on the solution; 753 words.
  - Gate 2: PASSED — `claims-l54.ts` confirms that a constraint lets the body read the
    constrained member while the caller keeps its own type, TS2345 with "Property 'amount' is
    missing in type ... but required in type ...", TS2345 for a misspelled key ("not assignable
    to parameter of type 'keyof Payment'"), that `T[K]` keeps each property's own type (TS2322
    against a wrong target, for one value and for a column), an interface used as a constraint,
    and TS2339 without a constraint. The demo's `NaN` output is now stated in a comment: it is
    the silent wrong total the constraint prevents.
- [x] LESSON 55 — Practical patterns and avoiding unnecessary generics
  - Gate 1: PASSED.
  - Gate 2: PASSED — reviewed during the whole-course final QA (the checkbox had been left
    unticked at a topic boundary, see QI-026). 704 words. Demo messages confirmed:
    `Type 'string[]' is not assignable to type 'number[]'.` and `Argument of type 'string' is
    not assignable to parameter of type '{ amount: number; }'.` (TS2345); the two `[to fix]`
    errors are the same pair in the exercise. Ordering re-run in node: highest first gives
    `M-2,M-1,M-3` while the original list stays `M-1,M-2,M-3`, and the charges give
    `F-2,F-1`. The QI-023 fix is in place — the check compares a mapped list instead of
    indexing into a result the starter returns empty. Exercise step 2 asks the student to
    **remove** a type parameter that appears once, which is the lesson's own rule applied.

### 15_utility_types (roadmap Lesson 12)
- [x] LESSON 56 — `Partial`, `Required` and `Readonly`
  - Gate 1: PASSED.
  - Gate 2: PASSED — reviewed during the whole-course final QA (the checkbox had been left
    unticked at a topic boundary, see QI-026). **A real defect was found and fixed — see QI-025:**
    the Exercise text described the Example's accounts (`l56Statement`, an IBAN line, a
    missing nickname) while the starter and Verification cells are about customers
    (`l56Card`, `"C-1 Ada (no email)"`, a missing email). The four numbered steps now match
    the cells. Re-validated after the fix. Demo messages confirmed: the TS2345 chain ending
    in `Type 'string | undefined' is not assignable to type 'string'.`, `'changes.balance' is
    possibly 'undefined'.` (TS18048) and `Cannot assign to 'balance' because it is a
    read-only property.` (TS2540). Two `[to fix]` errors: TS2739 for the incomplete
    `Required<L56Customer>` and TS2322 for the possibly-undefined `changes.name`.
- [x] LESSON 57 — `Pick` and `Omit`
  - Gate 1: PASSED first run — 692 words.
  - Gate 2: PASSED — `claims-l57.ts` confirms TS2344 for a `Pick` key that isn't in `T`, TS2353
    for an extra property in a literal, that a value of the full type fits where the smaller
    type is expected, and — the fact the Mini Challenge turns on — that **`Omit` accepts a key
    that isn't in `T` and removes nothing**. The exercise's planted errors were chosen so the
    Verification cell still type-checks against the starter (QI-022): a mis-scoped `Omit` and a
    wrong return value, not a broken `Pick` type.
- [x] LESSON 58 — `Record`
  - Gate 1: FAILED once, then PASSED — the first run caught the Example and the Exercise both
    declaring `L58Currency` and `l58Rates` (TS2300/TS2451 in the concatenated notebook) and a
    `...` inside a solution comment. The Example now uses a channel fee table, leaving the
    currency table to the Exercise; 696 words.
  - Gate 2: PASSED — `claims-l57.ts` confirms TS2741 for a missing key and TS2353 for an unknown
    one with a literal key union, and that `Record<string, number>` types a **missing** key as
    `number` with no error (the demo prints `2 undefined` to show it). Values run in node:
    fees `1.81 / 0 / 6.26`, totals `EUR 160.8, USD 2.15, GBP 0`, conversions `110`, `90.91`,
    `212.93` (raw `110.00000000000001` and `212.92499999999998`), grand total `162.75`.
- [x] LESSON 59 — `Exclude` and `Extract`
  - Gate 1: PASSED first run — 677 words.
  - Gate 2: PASSED — `claims-l59.ts` confirms TS2322 for a value outside an `Exclude` result,
    `Extract`/`Exclude` on a discriminated union (the message names the remaining discriminants),
    that an empty `Extract` is `never` ("not assignable to type 'never'"), and that excluding a
    member that isn't in the union is silently accepted. The solution notes that a plain
    `filter` does not narrow, so the exercise builds the list with a narrowing `if` — inside
    what LESSON 26/27 already taught, with a forward reference to LESSON 64.
- [x] LESSON 60 — `ReturnType` and `Parameters`
  - Gate 1: FAILED once (a `const l60Args` in the Example clashed with the Exercise's), then
    PASSED — 645 words.
  - Gate 2: PASSED — `claims-l59.ts` and `claims-l60b.ts` confirm TS2344 for a non-function
    argument ("does not satisfy the constraint '(...args: any) => any'"), TS2322 for a wrong
    value against a derived return type and against a `Parameters` tuple, the indexed form
    `Parameters<typeof fn>[0]`, `typeof value` in a type position, and TS2749 "refers to a
    value, but is being used as a type here. Did you mean 'typeof build'?" — the Mini
    Challenge's third answer. The type-level `typeof` is introduced explicitly as the same
    keyword as LESSON 10's runtime one, in a different position.
- [x] LESSON 61 — Combining utility types
  - Gate 1: PASSED first run — 697 words.
  - Gate 2: PASSED after one fix — the demo quoted the alias name `'L61Editable'`, but the
    compiler expands it to `Partial<Pick<L61Card, "nickname" | "holder">>` **and reorders the
    union**; the comment now shows the real message and says why it looks different (QI-010
    checklist line extended). The two planted errors prove the two halves of
    `Partial<Pick<...>>`: TS2353 for a field outside the `Pick`, TS2540 for assigning into a
    `Readonly<Record<...>>`.
  - **Topic 15 complete.** with custom types

### 16_advanced_narrowing (roadmap Lesson 13)
- [x] LESSON 62 — `typeof` and `instanceof`
  - Gate 1: PASSED.
  - Gate 2: PASSED — reviewed during the whole-course final QA (the checkbox had been left
    unticked at a topic boundary, see QI-026). 721 words. Demo messages confirmed:
    `'L62Shape' only refers to a type, but is being used as a value here.` (TS2693) and
    `'value' is possibly 'null'.` (TS18047). The two `[to fix]` errors match the exercise
    text exactly — one reads a property before the check
    (`Property 'code' does not exist on type 'L62Instrument'.` with the detail naming
    `L62Coins`, which is the detail line the Explanation promises) and one reads the wrong
    variant's property inside it (`Property 'count' does not exist on type 'L62Voucher'.`).
    Numbers re-run in node: 7 coins → 1.4, 3 coins → 0.6, printed as `1.40` and `5.00`. The
    "`typeof` has eight answers" claim checks out: string, number, bigint, boolean, symbol,
    undefined, object, function. Verification runs against the untouched starter (the
    planted reads give `undefined` at runtime, not a crash).
- [x] LESSON 63 — The `in` operator
  - Gate 1: PASSED first run — 720 words.
  - Gate 2: PASSED after one fix — the demo first quoted TS18046 for `client.passport`, but the
    compiler reports `Type 'unknown' is not assignable to type 'string'.` (TS2322); corrected
    from `claims-l63.ts`, which also confirms that `in` with a name no variant has compiles,
    and that `"note" in payment` is accepted for an optional property shared by both variants.
- [x] LESSON 64 — Discriminated unions
  - Gate 1: PASSED (after two authoring fixes) — 778 words.
  - Gate 2: PASSED — two discoveries changed the lesson: TS2678's message lists the
    discriminants in a **different order** in the lesson than in the scratch file, so the quote
    was copied from `check:nb`; and a `kind: string` on **one** variant still lets a `switch`
    narrow (only a union where *every* variant is loose fails to narrow), so the planted error
    moved to a `case` outside the union plus a variant-only field read outside the switch.
    `claims-l64.ts` confirms TS2678, TS2339 for both cases, and that `default` is narrowed.
- [x] LESSON 65 — User-defined type guards
  - Gate 1: PASSED first run — 716 words.
  - Gate 2: PASSED — `claims-l64.ts` and `claims-l65b.ts` establish exactly when narrowing is
    inferred and when the annotation is needed: a short **unannotated** function or inline arrow
    narrows `filter`, while the same function annotated `: boolean` does not, and neither does a
    callback with more than one statement. A guard whose body contradicts its promise is
    accepted in silence (also confirmed). This corrected a false claim in LESSON 59 (QI-024).
  - **Note:** most Verification checks already pass against this starter, because the exercise
    is about type annotations, whose effect is compile-time only; `check:nb` is the real check
    here, and the lesson says so. `l66FeeTotal`'s behavior is the one runtime FAIL.
- [x] LESSON 66 — Exhaustive checking and `never`
  - Gate 1: PASSED first run — 779 words.
  - Gate 2: PASSED — `claims-l66.ts` confirms TS2322 naming the unhandled variant, TS2534 for a
    `never` function that can return, that `undefined` is not assignable to `never`, and that
    the complete switch compiles. The exercise plants the **same** error in two switches, which
    is the lesson's point; both are reported, naming `L66Interest`. Balance raw
    `21.760000000000005` → `21.76`, so rounding is exercised. The Example also uses
    `error instanceof Error` on a `catch` variable, which strict mode types as `unknown` —
    inside what LESSON 62 taught.
  - **Topic 16 complete.**

### 17_modules_organization (roadmap Lesson 14)
- [x] LESSON 67 — Named and default exports and imports
  - Gate 1: PASSED (after adding the terminal marker to the solutions Exercise) — 699 words.
  - Gate 2: PASSED — everything verified in `ts-scratch-67` with the pinned compiler: the
    three-file project builds and `npm start` prints `IT60 (Ada): 250.00 EUR` and
    `275 USD, home EUR`; TS2835 with its `Did you mean './domain/account.js'?` hint; TS2305 for
    a name that doesn't exist; and **TS2459** — "declares 'internalHelper' locally, but it is
    not exported" — for a name that exists but isn't exported, which was corrected from an
    initial guess of TS2305.
- [x] LESSON 68 — Type-only imports: `import type`
  - Gate 1: PASSED.
  - Gate 2: PASSED — reviewed during the whole-course final QA (the checkbox had been left
    unticked at a topic boundary, see QI-026). 765 words; a terminal lesson, so every claim was
    rebuilt in a fresh scratch project (`l68-audit/`) with the pinned compiler. Confirmed:
    `dist/index.js` keeps exactly **one** import line and its first two lines are the two
    quoted in the lesson; `dist/domain/types.js` really does exist and contains nothing but
    `export {};`; and the program prints `IT60 (Ada): 250.00 EUR` then `home: EUR`. The
    TS2693/TS1361 pair recorded earlier still stands: `const wrong = Account;` on a type
    alias is TS2693, and TS1361 needs a real value imported with `import type`. Step 3 ends
    by telling the student to undo both experiments (QI-003).
- [x] LESSON 69 — Separating types from implementation
  - Gate 1: PASSED — 710 words.
  - Gate 2: PASSED after one correction: the first draft's "value cycle" ran through
    `types.ts`, which is not a cycle at runtime (the other direction was type-only). The
    exercise now makes `account.ts` and `report.ts` import values from each other, which builds
    silently and fails with `ReferenceError: Cannot access 'homeCurrency' before
    initialization` — run and copied from the real output. The type-only cycle was run too and
    builds and prints normally.
- [x] LESSON 70 — Organizing a project into multiple files
  - Gate 1: PASSED.
  - Gate 2: PASSED — reviewed during the whole-course final QA (the checkbox had been left
    unticked at a topic boundary, see QI-026). 651 words; terminal lesson, claims rebuilt in
    `ts-scratch-67`. Confirmed: `dist/domain/index.js` contains only the two value
    `export ... from` lines and neither `export type` line; `dist/` mirrors `src/` with
    `dist/index.js`, `dist/domain/{index,account,report}.js` and `dist/report/monthly.js`;
    `npm start` prints `Ada: IT60 (Ada): 250.00 EUR`. The claim that removing one re-export
    reports **TS2305** was verified as written — the project was still in that state, and
    the compiler said `Module '"./domain/index.js"' has no exported member 'buildReport'.`
    (this is genuinely TS2305, not the TS2459 of LESSON 67, because the barrel does not
    declare the name locally). The re-export was put back and the build re-run clean.

### 18_mini_project_4_trading_portfolio
- [x] `mini-project.md` · `ai-prompt.txt` · `review-prompt.txt`
- [x] Mini-project gate
  - Gate 1: PASSED — required files, heading, Prerequisites/Repository lines, the eight sections
    in order, Core and Done-when checklists, no omissions, and the `typescript` block
    type-checks with the pinned compiler.
  - Gate 2: PASSED — a private multi-file reference (`mp4-reference/`, never committed) proves
    the brief is achievable with LESSON 1-70 only: `src/domain/types.ts` (a leaf module with
    three interfaces extending a shared base and a discriminated `Asset` union),
    `src/domain/portfolio.ts` (`class Portfolio<T extends Asset>`), `src/domain/valuation.ts`
    (`Readonly<Record<Currency, number>>` rates, an `asset is Bond` guard, an exhaustive
    `switch` with `never`), `src/engine/trades.ts` (a result type, no throwing) and an
    `src/index.ts` that only wires and prints. `npm run build` + `npm start` print the
    portfolio, `ok`/`fail` lines for all five trades, `Assets held: 4`,
    `Moved in this session: 198.35`, `{"EUR":648.75,"USD":482}`, `Portfolio in EUR: 1086.93`
    and `Coupon income: 1.48`. Every money value is rounded; `19.99 * 15` and the 1.5% coupon
    both exercise it.
  - **Done-when proof:** `mp4-donewhen.mjs` runs 8 mutations; all 8 behave as the brief claims —
    TS2322 against `never` for a fourth asset kind, TS2339 for a kind-specific property read
    without a check, TS2344 for a portfolio of something that isn't an asset, TS2339 for reading
    a success field on a failed result, TS2741 for a totals table missing a currency, TS2339
    when the type guard is replaced by a plain boolean callback, and a clean check for the
    untouched reference and for the types module staying value-free.
  - **Scope note:** intersection types (`&`) are not taught, so the shared asset fields come
    from an interface with `extends` (LESSON 48); `instanceof` and `as` are avoided entirely.

## Optional advanced section

### 19_optional_decorators (optional roadmap Lesson 15)
- [x] LESSON 71 — What decorators are, why they exist, and their syntax
  - Gate 1: PASSED — 761 words.
  - Gate 2: PASSED — the **standard (TC39) decorator model** is what TS 6.0.3 uses with no
    `experimentalDecorators`, and the Deno kernel runs it, so the cells execute for real
    (checked before writing: `claims-l71.ts` compiles and `deno run` prints
    `calling deposit / 150 / 152.25`). A first draft's loose signature was rejected by the
    compiler (TS1241 + TS1270), which became the demo. Exercise: three `[to fix]` errors from
    two mistakes — TS1270 at each `@` plus TS2345 for `target.call(this)` without the
    arguments — and the lesson says so, pointing back at LESSON 37. Outputs verified:
    `150 130`, `deposit,withdraw`, `152.24999999999997`; `40.7 - 0.7` is exactly `40`.
- [x] LESSON 72 — A practical decorator example
  - Gate 1: PASSED (after two fixes: a `...` inside a quoted message, and 804 → 767 words).
  - Gate 2: PASSED — the stacking order was **run** before it was written (`order.ts` in the
    scratchpad): `factory outer | factory inner | apply inner | apply outer | enter outer |
    enter inner | body | leave inner | leave outer`. A first draft claimed the wrong-decorator
    demo "prints 4"; it really prints `[Function (anonymous)]`, because the factory used as a
    decorator replaces the method with the decorator function — the comment now says that, and
    it makes the runtime damage visible (QI-001 class, caught by reading the executed
    notebook). Values: `152.25`, `enter yearly,leave yearly`, clamped `40 / 100 / 0 / 50`.
- [x] LESSON 73 — When to use decorators and when to avoid them
  - Gate 1: PASSED — 709 words.
  - Gate 2: PASSED — a design lesson with no new syntax. The exercise builds the same rule
    twice, once as a higher-order function and once as a decorator, and the checks compare them
    side by side; fee values run in node (`120.5 → 1.81`, `10 → 0.15 → 0.5`, `33.33 → 0.5`
    exactly, `0 → 0.5`). The planted errors are TS2322 and TS2554, the second of which makes
    the lesson's own point: the decorator form cannot forget its argument.
  - **Topic 19 complete.**

### 20_optional_type_level (optional roadmap Lesson 16)
- [x] LESSON 74 — Conditional types
  - Gate 1: PASSED — 722 words; 6 code cells type-checked, 2 expected demo errors, 3 `[to fix]`
    errors (the exercise text says three).
  - Gate 2: PASSED — every claim run against the pinned compiler (`claims-l74.ts` … `-l74e.ts`
    in the scratchpad). Verified: a union handed to a bare type parameter distributes, so
    `L74Options<L74Format>` is the union `{ separator: string; } | { indent: number; } |
    { pageSize: string; }` and a generic function holding one cannot read a property of it
    (TS2339, whose second line names `{ indent: number; }`); a wrong payload gives TS2353 with
    the branch **expanded**, not the alias name; `Exclude<T, U>` written by hand as
    `T extends U ? never : T` behaves identically to the real one; `[T] extends [U]` keeps the
    union whole, so the bracketed `L74Long<L74Channel>` is the whole channel union including
    `"sms"`, while `[T] extends [never]` is the only form that can ask whether a type is empty
    (the naked version gives `never` for `never`). Planted errors are two TS2353 object
    literals plus TS2322 `Type '("email" | "push")[]' is not assignable to type '"sms"[]'.` at
    the `return` — all statement-level, so the Verification cell both type-checks and runs
    against the untouched starter (QI-020, QI-022, QI-023). Printed values confirmed in Deno:
    `; 2 A4`, `csv,json`, `csv ;`, `ada@example.com: Statement ready`,
    `+39 340 1122334: Code 4417`, `d-77: Payment received`, `["email","push"]`.
- [x] LESSON 75 — Mapped types
  - Gate 1: PASSED — 715 words; 2 expected demo errors and 3 `[to fix]` errors for this lesson
    (`check:nb` reports 6 in total, LESSON 74's three included, which is expected while working
    through the notebook in order).
  - Gate 2: PASSED — claims run against the pinned compiler (`claims-l75.ts`, `claims-l75b.ts`).
    The central verified fact: a mapped type over `keyof T` **keeps each key's `readonly` and
    `?`** unless the mapping changes them — `{ [K in keyof T]: boolean }` over a type with a
    `readonly sku` still refuses `t.sku = false` (TS2540) and leaves an optional `discount?`
    optional, which is what makes `-readonly` and `-?` necessary rather than decorative.
    Also verified: `Partial<T>` keeps `readonly` too (so `Partial` and
    `{ -readonly [K in keyof T]?: T[K] }` differ only there), `-?` on a type with no optional
    property changes nothing, and the hand-written `MyPartial`/`MyReadonly`/`MyRequired`/
    `MyRecord` behave exactly like the built-ins. Planted errors are statement-level:
    TS2741 `Property 'sku' is missing in type '{ name: string; price: number; }' but required
    in type 'L75Editable<L75Product>'.` plus two TS18048 (`'full.price'` and `'full.discount'`
    are possibly `undefined`); the starter's `l75Apply` returns the product unchanged, so the
    Verification cell type-checks, runs, and still fails until the exercise is done.
    Printed values confirmed in Deno: `owner,balance`, `Grace IT60 0542 9999`,
    `Standing desk 249.00 -20.00`, and `l75Apply(...).discount` really is `undefined`.
- [x] LESSON 76 — `infer`
  - Gate 1: PASSED — 663 words; 2 expected demo errors and 5 `[to fix]` errors for this lesson.
  - Gate 2: PASSED — claims run against the pinned compiler (`claims-l76.ts`, `claims-l76b.ts`).
    The exact standard-library definitions were copied from `playground/node_modules/typescript/
    lib/lib.es5.d.ts` (lines 1638 and 1648):
    `type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;`
    and `type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;`
    — note the false branch of `ReturnType` is `any`, not `never`. Verified: `(...args: never[]) =>
    infer R` matches every function and is the `any`-free equivalent, because a two-parameter
    function is **not** assignable to `() => number` (TS2322 "Target signature provides too few
    arguments. Expected 2 or more, but got 0.") while the reverse is allowed; a pattern that
    misses falls to the false branch silently, and `never` is only reported where something
    reads from it. Planted errors, all statement-level: TS2322 on `l76Basket`
    (`'[string, number, number][]'` not assignable to `'[string, number, number][][]'`), TS2322
    `Type '"Desk"' is not assignable to type 'never'.`, TS2322
    `Type '{ count: number; amount: number; }' is not assignable to type 'never'.` and two TS2339
    (`Property 'count'` / `'amount'` does not exist on type `'never'`). The demo messages quote
    **literal** types — `Type '12'` and `Type '"EUR"'`, not `'number'` and `'string'` — which a
    first draft got wrong (QI-010/QI-015 class, caught by `check:nb`). The starter's `l76Total`
    returns zeros, so the Verification cell type-checks, runs, and still fails until the exercise
    is done. Printed values confirmed in Deno: `EUR,USD,GBP`, `EUR 3`, `108`,
    `7 items, 803.00`, and count 7 / amount 803 over the three order lines.
- [x] LESSON 77 — Template literal types
  - Gate 1: PASSED — 645 words; 2 expected demo errors and 4 `[to fix]` errors. A first draft
    said five; `check:nb` said four, and both the exercise text and the solutions note were
    corrected. Gate 1 also caught the missing LESSON 77 entry in `ai-prompt.txt` (the QI-021
    check doing its job).
  - Gate 2: PASSED — claims run against the pinned compiler (`claims-l77.ts`, `claims-l77b.ts`).
    Verified: a union inside a template multiplies out, and a near-miss is reported as TS2820
    listing every member with a suggestion —
    `Type '"payment:error"' is not assignable to type '"payment.info" | "payment.error" | "login.info" | "login.error"'. Did you mean '"payment.error"'?`
    ; building the string at runtime (`\`${channel}/${state}\``) satisfies the template type;
    the four case helpers behave as documented (`Capitalize<"owner">` is `"Owner"`); an `as`
    clause renames mapped keys, and **a key renamed to `never` is dropped**, so
    `{ [K in keyof T as T[K] extends string ? K : never]: T[K] }` really does keep only the
    string-valued properties (confirmed by `Object.keys(...).length` being 1 at runtime);
    without the `as` clause the keys keep their old names (TS2353 on the object literal, TS2339
    and TS2551 where they are read); `Capitalize<K>` without `& string` is TS2344
    `Type 'K' does not satisfy the constraint 'string'.` because `keyof T` is
    `string | number | symbol`; and `\`set${K & string}\`` without `Capitalize` gives `setowner`.
    The starter's `l77Slot` returns a constant, so the Verification cell type-checks, runs, and
    still fails until the exercise is done. Printed values confirmed in Deno:
    `[payment.error] ada 2`, `ada 1`, `[login.info]`, `owner=Ada pending=3`, `sms/sent`,
    `email/queued`.
- [x] LESSON 78 — Combining features, and when it becomes too much
  - Gate 1: PASSED — 769 words after the QI-027 fix; 1 expected demo error and 2 `[to fix]` errors.
  - Gate 2: PASSED — claims run against the pinned compiler (`claims-l78.ts`). Verified: the
    combined type
    `{ [K in keyof T as \`send${Capitalize<K & string>}\`]: (input: T[K]) => string }` gives its
    handler parameters their types by contextual typing, so `(input) => \`pay ${input.amount}\``
    needs no annotation; the derived API is assignable to the hand-written one
    (`const l78Plain: L78PlainApi = l78Api;` type-checks), which is the lesson's point made by
    the compiler rather than by assertion; a miscapitalized computed key is TS2561
    `Object literal may only specify known properties, but 'sendpay' does not exist in type 'L78Api<L78Commands>'. Did you mean to write 'sendPay'?`.
    The two planted mistakes are a mapping without its `as` clause (TS2561, suggesting the
    original key name `'deposit'`) and a narrowed `infer` pattern that misses
    (TS2322 `Type '{ amount: number; }' is not assignable to type 'never'.`); the starter's
    `l78Run` returns zeros, so the Verification cell type-checks, runs, and still fails until
    the exercise is done. It compares `l78Payload` as a whole rather than reading a property of
    it, because under the starter that value's type is `never` (QI-023). Printed values
    confirmed in Deno: `pay 50 refund 20 (damaged)`, `pay 50`, `deposit 100 | close moved`,
    lines 2, payload `{"amount":100}`.
  - Gate 2 re-run (2026-09-16), after a user review found that Mini Challenge question 4
    claimed `infer` had no alternative when `ReturnType`/`Parameters` (LESSON 60) cover the
    function case — see QI-027. The question and its answer now name the utility types first
    and keep the hand-written pattern for shapes the library does not name, which is what
    LESSON 76 and the topic's `ai-prompt.txt` already said. The exercise note says plainly
    that `Parameters<L78Deposit>[0]` is the production answer, so the exercise reads as
    practice. Claims re-verified with the pinned compiler: the hand-written pattern and
    `Parameters<L78Deposit>[0]` are mutually assignable, `ReturnType<L78Deposit>` is
    `string`, and a wrong payload is still rejected through the library type. Rebuilt and
    Gate 1 PASSED again; LESSON 78 is 769 words. No other lesson touched.
  - **Topic 20 complete. All 78 lessons of the course are approved.**

## Wrap-up
- [x] `README.md` (setup includes: Deno kernel, Jupyter or VS Code, and
      `npm install` in `playground/`, because LESSON 1 already refers to `npm run check:nb`)
  - Gate 1: PASSED — every count in the file is produced by `node tools/course-stats.mjs`
    (new this session): 20 folders, 16 lesson topics, 4 mini-projects with 4 briefs,
    2 optional topics, 78 lessons (LESSON 1-78, contiguous), 32 notebooks, 20 `ai-prompt.txt`,
    4 `review-prompt.txt`. Every command in the file was run.
  - Gate 2: PASSED — native-English pass done. Two facts were corrected against the repo
    rather than written from memory: the Node requirement is **24 or newer** (what LESSON 4
    sets up, not the compiler's own `engines` field, which says >=14.17), and terminal-practice
    lessons live in topics **02, 03, 10 and 17**, not just 10 and 17 (counted with the
    `<!-- practice: terminal -->` markers). The README leads with the one fact that makes the
    notebook format work — running a cell does not check types — and with the
    `[expected]`/`[to fix]`/`[error]` split that `check:nb` prints.
- [x] Final whole-course QA (same checks as the per-lesson gates; see `COURSE_PLAN.md` §7)
  - All 16 lesson topics re-validated with `tools/validate.mjs`: Gate 1 PASSED for every one,
    each reporting "Course lessons so far: 78".
  - All 4 mini-projects re-validated with `tools/validate-project.mjs`: Gate 1 PASSED.
  - `node tools/self-test.mjs`: **10/10 mutations caught**.
  - Playground round trip from `playground/`: `npm run check` clean, `npm run build` clean,
    `npm start` printed `The TypeScript course playground is working.`
  - Structure: 20 folders present and contiguous; LESSON 1-78 with no gaps or duplicates;
    32 notebooks; `ai-prompt.txt` in all 20 folders; `review-prompt.txt` in all 4 mini-project
    folders; `.gitignore`, `LICENSE`, `PUBLISHING_GUIDE.md` present.
  - Prerequisite ledger: exactly **78 rows, numbered 1-78 with no gaps**.
  - Compiler discipline: `typescript` pinned at `6.0.3` in `playground/package.json`, and every
    `tsc` invocation in `tools/` and `playground/scripts/` resolves to
    `playground/node_modules/typescript/lib/tsc.js`. No global `tsc` anywhere.
  - No stray `TODO: write`, `FIXME` or `XXX` markers in any published notebook.
  - **Finding:** seven lessons (50, 51, 55, 56, 62, 68, 70) were built and passing Gate 1 but
    had never had their checkbox ticked or their gates recorded — each is the first or last
    lesson of its topic (QI-026). All seven were reviewed properly rather than ticked off:
    every quoted message re-run through `check:nb`, every number re-run in node, and the two
    terminal lessons rebuilt in scratch projects. Six passed unchanged. LESSON 56 had a real
    defect — its exercise text described the Example's domain instead of the starter's
    (QI-025) — now fixed and re-validated. One English fix in LESSON 50.

**The course is complete.** All 78 lessons, 4 mini-project briefs, 20 AI tutor prompts,
4 review prompts, the publishing guide and the README have passed both gates.
