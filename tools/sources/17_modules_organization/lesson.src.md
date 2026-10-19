<!-- cell: markdown -->
# TypeScript — Modules and project organization

> **How these notebooks work**
>
> - This topic is practised in a **real project**, not in the notebook: modules only mean
>   something across files. Each lesson tells you what to run and what you should see.
> - The notebook keeps the explanations and the Mini Challenges, which you answer in the code
>   cells as comments.
> - You need the `ts-scratch` project from topic 02, with the strict `tsconfig.json` from
>   LESSON 7 and the `check`, `build` and `start` scripts.

<!-- cell: code setup -->
// Course helper: run this cell once, before any Verification cell.
// checkAll prints PASS or FAIL for each [label, actual value, expected value] case.
function checkAll(cases: [string, unknown, unknown][]): void {
  const lines = cases.map(([label, actual, expected]) =>
    JSON.stringify(actual) === JSON.stringify(expected)
      ? `PASS  ${label}`
      : `FAIL  ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
  console.log(lines.join("\n"));
}

<!-- cell: markdown -->
## LESSON 67 — Named and default exports and imports

### Explanation

Every file you have written so far has been one program. A **module** is a file that shares
some of what it declares and keeps the rest to itself:

```typescript
// src/domain/account.ts
export type Account = { readonly iban: string; owner: string; balance: number };
export const homeCurrency = "EUR";
export function describe(account: Account): string {
  return `${account.iban}: ${account.balance.toFixed(2)} ${homeCurrency}`;
}
```

```typescript
// src/index.ts
import { describe, homeCurrency } from "./domain/account.js";
```

- **`export`** in front of a declaration makes it available to other files. Anything without it
  is private to the module, which is the module's real job: a small public surface, like the
  `private` of LESSON 39 but for a file.
- **`import { name } from "./path.js"`** brings one or more named things in. The names must
  match: `Module '"./domain/account.js"' has no exported member 'missingName'.` (TS2305) A name
  that exists but isn't exported gets a clearer message: `declares 'internalHelper' locally, but
  it is not exported.` (TS2459)
- **`export default`** marks the one thing a module is mostly about, and the importer chooses
  the name: `import convert from "./domain/rates.js"`. Use it rarely — a named export is easier
  to search for and to re-export.

**The extension in the path is `.js`, even though the file is `.ts`.** The import path is what
Node will read *after* compilation, and with `"module": "nodenext"` (LESSON 34) TypeScript
insists on it: `Relative import paths need explicit file extensions in ECMAScript imports when
'--moduleResolution' is 'node16' or 'nodenext'. Did you mean './domain/account.js'?` (TS2835)

One thing quietly changes: files that import or export have their **own scope**. The duplicate
top-level names that clashed in LESSON 7 (TS2393) can now live in two modules side by side.

### Key Notes

- `export` shares a declaration; everything else stays private to the file.
- `import { a, b } from "./file.js"` — names must match an export (TS2305).
- `export default` is one per module and the importer names it.
- Relative import paths end in `.js`, even for `.ts` files (TS2835).
- Each module has its own scope, so top-level names no longer clash.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* A project with three files:

```text
ts-scratch/
├── package.json        ("type": "module")
├── tsconfig.json       (strict, rootDir src, outDir dist, module/moduleResolution nodenext)
└── src/
    ├── index.ts
    └── domain/
        ├── account.ts  (named exports: Account, homeCurrency, describe)
        └── rates.ts    (a default export: convert)
```

`src/index.ts` imports all four:

```typescript
import { describe, homeCurrency } from "./domain/account.js";
import convert from "./domain/rates.js";
```

`npm run build` then `npm start` prints:

```text
IT60 (Ada): 250.00 EUR
275 USD, home EUR
```

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`.

1. Make sure `package.json` has `"type": "module"` and `tsconfig.json` has
   `"module": "nodenext"` and `"moduleResolution": "nodenext"` (LESSON 34).
2. Create `src/domain/account.ts` exporting an `Account` type, a `homeCurrency` constant and a
   `describe(account)` function. Keep one helper **unexported** in that file.
3. Create `src/domain/rates.ts` with a **default** exported `convert(amount, to)` function.
4. In `src/index.ts`, import all of them and print a line from each. Run `npm run build` and
   `npm start`.
5. Now make three mistakes on purpose, one at a time, and read each message before undoing it:
   drop the `.js` from one import path; import a name that isn't exported; import the
   unexported helper.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- `npm run check` reports nothing and `npm start` prints your two lines.
- Step 5 gives, in order: `TS2835` (with a `Did you mean './domain/account.js'?` hint),
  `TS2305: Module '"./domain/account.js"' has no exported member 'missingName'.`, and a
  different one for the unexported helper:
  `TS2459: Module '"./domain/account.js"' declares 'internalHelper' locally, but it is not
  exported.`
- After undoing all three, `npm run check` is clean again.

### Mini Challenge

Answer in comments in the cell below:

1. `src/domain/account.ts` keeps one helper unexported. What can the rest of the project do
   with it, and which lesson does that remind you of?
2. Why does the import path end in `.js` when the file on disk is `.ts`? What would Node read
   if it said `.ts`?
3. When would you use `export default` rather than a named export — and what does a reader of
   the importing file lose when you do?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 68 — `import type`

### Explanation

A module exports two different kinds of thing: **values** that exist when the program runs
(functions, constants, classes) and **types** that disappear at compile time (aliases,
interfaces). A plain `import` brings in either. `import type` says you mean the second:

```typescript
import { describe } from "./domain/account.js"; // a value
import type { Account } from "./domain/account.js"; // a type
```

Both work. What `import type` adds:

- **It says what you mean.** A reader of the first line knows something will run; a reader of
  the second knows nothing will.
- **A value imported this way can't be used by accident**: `'describe' cannot be used as a
  value because it was imported using 'import type'.` (TS1361) A type alias would have been
  refused anyway — `'Account' only refers to a type, but is being used as a value here.`
  (TS2693) — but only `import type` can say that about a function.
- **The whole line disappears from the output.** Compile the example and `dist/index.js`
  contains only the first import. A module imported for its types alone is not loaded at
  runtime at all — which matters when that module has side effects, or is only present while
  developing.

The same on the way out: `export type { Account }` shares a type, and a barrel file (LESSON 70)
usually needs both forms:

```typescript
export { describe } from "./account.js";
export type { Account } from "./account.js";
```

A class is the one thing that is both: a value (you can call `new`) and a type (you can
annotate with it). Import it plainly unless you only ever use it in annotations.

### Key Notes

- Values exist at runtime; types are erased.
- `import type { T }` imports only types, and `export type { T }` exports them.
- Using a type-only import as a value is reported (TS1361).
- Type-only import lines vanish from the compiled JavaScript.
- A class is both a value and a type: a plain import usually fits.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* With `src/index.ts`:

```typescript
import { describe, homeCurrency } from "./domain/account.js";
import type { Account } from "./domain/types.js";

const account: Account = { iban: "IT60", owner: "Ada", balance: 250 };

console.log(describe(account));
console.log(`home: ${homeCurrency}`);
```

`npm start` prints `IT60 (Ada): 250.00 EUR` and `home: EUR`, and `dist/index.js` keeps a single
import line:

```javascript
import { describe, homeCurrency } from "./domain/account.js";
const account = { iban: "IT60", owner: "Ada", balance: 250 };
```

The `Account` line is gone: nothing about it survives the build.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`, continuing from LESSON 67.

1. Split the imports in `src/index.ts`: the function and the constant with a plain `import`,
   the `Account` type with `import type`.
2. Run `npm run build` and read `dist/index.js`. How many import lines are left, and which?
3. Try to use the type-only import as a value — `const wrong = Account;` — and read the
   message. Then change the `describe` import into an `import type` as well and call it: a
   different message. Undo both.
4. Move the `Account` type into its own file, `src/domain/types.ts`, and export it from there.
   Import it with `import type` in both `account.ts` and `index.ts`. Build and run again.
   `npm start` should print `IT60 (Ada): 250.00 EUR` and `home: EUR`.
5. Look at `dist/domain/`. Is there a `types.js`? Open it if there is.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- Step 2: one import line in `dist/index.js`, the one with `describe` and `homeCurrency`.
- Step 3, two different messages:
  `error TS2693: 'Account' only refers to a type, but is being used as a value here.` — a type
  alias is never a value, whichever way it was imported — and
  `error TS1361: 'describe' cannot be used as a value because it was imported using
  'import type'.` — a real value, hidden behind `import type`.
- Step 4: `npm run check` is clean and `npm start` prints the same line as before.
- Step 5: `dist/domain/types.js` exists but contains nothing except `export {};` — the types
  themselves left no code behind.

### Mini Challenge

Answer in comments in the cell below:

1. Step 5 leaves an almost empty `types.js`. Why is the file created at all, and what would
   happen to `dist/index.js` if the build simply dropped it?
2. `import type` changes nothing that the compiler couldn't have worked out on its own. Name
   two things it gives a **reader** of the file.
3. A module exports a class. Would you import it with `import` or `import type`? Give the case
   for each.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 69 — Separating types from implementation

### Explanation

Once a program has several modules, one question keeps coming back: where does a type live?

**A type used by one module belongs in that module.** Export it next to the function that
produces it. Nothing is gained by moving it away, and the reader finds it where it is used.

**A type used by several modules belongs in a module that imports nothing from them.** A file
like `src/domain/types.ts`, holding the shapes the whole domain agrees on, is a **leaf**:
everyone imports it, it imports nobody. That keeps the import arrows pointing one way.

Why it matters is easiest to see when they don't. Two modules that import **values** from each
other compile without a word, and then:

```text
ReferenceError: Cannot access 'homeCurrency' before initialization
```

One of them runs first, and it needs something the other hasn't defined yet. A cycle of
**types** is harmless — `import type` lines are erased, so at runtime there is no cycle at all,
and mutually referring types (`A` has a `B`, `B` has an `A`) are fine.

A practical order for a small project:

- `types.ts` — shapes only, imports nothing from the domain.
- `<thing>.ts` — the functions or class for one thing, importing the shapes it needs.
- `index.ts` — wires them together and prints.

If you catch yourself adding an import that points *back* towards a module that already imports
you, that is the moment to move a type into the leaf.

### Key Notes

- One user: keep the type in the module that owns it.
- Several users: move it to a module that imports nothing back.
- Value cycles compile and then fail at runtime with a `ReferenceError`.
- Type-only cycles are erased, so they are safe.
- Keep the import arrows pointing one way: types at the bottom, `index.ts` at the top.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* Three modules, arrows pointing one way:

```text
src/
├── index.ts          imports account.ts and types.ts
└── domain/
    ├── types.ts      imports nothing
    └── account.ts    imports types.ts
```

```typescript
// src/domain/types.ts
export type Account = { readonly iban: string; owner: string; balance: number };
```

```typescript
// src/domain/account.ts
import type { Account } from "./types.js";

export const homeCurrency = "EUR";

export function describe(account: Account): string {
  return `${account.iban} (${account.owner}): ${account.balance.toFixed(2)} ${homeCurrency}`;
}
```

`npm start` prints `IT60 (Ada): 250.00 EUR`, and `dist/domain/types.js` contains only
`export {};`.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`, continuing from LESSON 68.

1. Add `src/domain/report.ts` with a `Report` type (an owner and a list of lines) and a
   `buildReport(account, lines)` function. Decide where the `Report` type belongs and why.
2. Make `index.ts` build a report and print it. Run `npm run check` and `npm start`.
3. Now create a **value** cycle on purpose. In `report.ts`, import `homeCurrency` from
   `account.ts` and use it in an exported constant; in `account.ts`, import that constant back
   and use it inside `describe`. Build and run, and read the runtime error.
4. Undo step 3: keep the constant in one module and let the other import it one way only.
5. Make a **type-only** cycle on purpose: declare `Account` in `account.ts` and `Report` in
   `report.ts`, give each an optional field typed with the other, and have both files use
   `import type` for it. Build and run. What happens this time?

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- Steps 1-2: `npm run check` is clean and `npm start` prints your report.
- Step 3: `npm run check` and `npm run build` report nothing at all, and `npm start` fails
  with `ReferenceError: Cannot access 'homeCurrency' before initialization`, naming the line in
  `dist/domain/report.js` that reads it.
- Step 4: clean again.
- Step 5: nothing happens — it builds and runs exactly as before, because both imports are
  erased.

### Mini Challenge

Answer in comments in the cell below:

1. Step 3 compiled and step 5 also compiled, but only one of them broke. Explain the difference
   in one sentence.
2. `types.ts` imports nothing from the domain. What would go wrong the first time it imports a
   *value* from `account.ts`?
3. A type is used by exactly one module today, and you suspect a second module will need it
   next week. Where do you put it now, and why?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 70 — A multi-file project

### Explanation

A small TypeScript project usually looks like this:

```text
ts-scratch/
├── package.json        "type": "module", scripts check/build/start
├── tsconfig.json       strict, rootDir src, outDir dist, module nodenext
├── .gitignore          node_modules, dist
└── src/
    ├── index.ts        the entry point: wires things together, prints
    └── domain/
        ├── index.ts    re-exports the folder's public surface
        ├── account.ts  one thing: the account
        └── report.ts   one thing: the report
```

Three habits carry most of the weight:

- **One thing per file**, named after that thing. `account.ts` holds the account's type and the
  functions that work on it.
- **An entry point that decides nothing.** `index.ts` reads like a summary of the program.
- **A folder speaks through one file.** `domain/index.ts` re-exports what the rest of the
  program may use:

  ```typescript
  export { describe, homeCurrency } from "./account.js";
  export { buildReport } from "./report.js";
  export type { Account } from "./account.js";
  export type { Report } from "./report.js";
  ```

  Callers then write `import { describe, buildReport } from "./domain/index.js";` and never
  need to know which file holds what. The cost is one more hop to read, and one more chance to
  create a cycle — so a folder with two files rarely needs one.

The build mirrors the folders: with `rootDir: "src"` and `outDir: "dist"` (LESSON 35),
`src/domain/account.ts` becomes `dist/domain/account.js`, and `npm start` runs
`dist/index.js`.

When a file starts needing a second name for what it contains — `accountAndReport.ts` — that is
the moment to split it.

### Key Notes

- One thing per file, named after it; `index.ts` only wires things together.
- A folder can expose one public surface through its own `index.ts`.
- Re-export values with `export {}` and types with `export type {}`.
- The `dist` tree mirrors the `src` tree.
- Split a file when its name needs an "and".

### Example

<!-- practice: terminal -->
*Practice in the terminal.* `src/domain/index.ts`:

```typescript
export { describe, homeCurrency } from "./account.js";
export { buildReport } from "./report.js";
export type { Account } from "./account.js";
export type { Report } from "./report.js";
```

`src/index.ts`:

```typescript
import { describe, buildReport } from "./domain/index.js";
import type { Account } from "./domain/index.js";

const account: Account = { iban: "IT60", owner: "Ada", balance: 250 };
const report = buildReport(account, [describe(account)]);

console.log(`${report.owner}: ${report.lines.join(" | ")}`);
```

`npm start` prints `Ada: IT60 (Ada): 250.00 EUR`, and `dist/domain/index.js` keeps only the
value re-exports — the two `export type` lines are gone.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`, continuing from LESSON 69.

1. Make sure `src/domain/` holds `account.ts` and `report.ts`, each exporting its own type and
   its own functions.
2. Add `src/domain/index.ts` that re-exports the values and the types the rest of the program
   needs.
3. Change `src/index.ts` to import everything from `./domain/index.js`, and keep the type
   import separate with `import type`.
4. Run `npm run check`, `npm run build` and `npm start`. Then look at `dist/`: does it mirror
   `src/`? What is inside `dist/domain/index.js`?
5. Add a `src/report/monthly.ts` that imports from `../domain/index.js` and exports a
   `monthlyTitle(account)` function. Use it from `index.ts`. Build and run again.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- `npm run check` is clean; `npm start` prints your report line.
- `dist/` mirrors `src/`: `dist/index.js`, `dist/domain/index.js`, `dist/domain/account.js`,
  `dist/domain/report.js`, and after step 5 `dist/report/monthly.js`.
- `dist/domain/index.js` contains the two `export ... from` lines for the values, and nothing
  for the types.
- Deleting one re-export from `domain/index.ts` makes `npm run check` report the import in
  `src/index.ts` (TS2305). Put it back.

### Mini Challenge

Answer in comments in the cell below:

1. `domain/index.ts` re-exports everything the rest of the program uses. What does that buy a
   caller, and what does it cost the person reading the code for the first time?
2. `src/report/monthly.ts` imports from `../domain/index.js`. What would happen if
   `domain/account.ts` one day imported something from `../report/monthly.js`?
3. Your `index.ts` has grown to 200 lines of wiring. Name two things you would move out of it,
   and say where they would go.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
