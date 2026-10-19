<!-- cell: markdown -->
# TypeScript — Modules and project organization

> **Solutions.** Open this only after you've genuinely tried the exercises in
> `lesson.ipynb`. This topic is practised in a real project; the cells here hold the answers to
> the Mini Challenges and the code you should end up with.

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

### Exercise

<!-- practice: terminal -->
The three files, as they should look at the end.

```typescript
// src/domain/account.ts
export type Account = { readonly iban: string; owner: string; balance: number };

export const homeCurrency = "EUR";

function format(amount: number): string {
  return amount.toFixed(2);
}

export function describe(account: Account): string {
  return `${account.iban} (${account.owner}): ${format(account.balance)} ${homeCurrency}`;
}
```

```typescript
// src/domain/rates.ts
const rates = { EUR: 1, USD: 1.1 };

export default function convert(amount: number, to: "EUR" | "USD"): number {
  return Math.round(amount * rates[to] * 100) / 100;
}
```

```typescript
// src/index.ts
import { describe, homeCurrency } from "./domain/account.js";
import convert from "./domain/rates.js";

const account = { iban: "IT60", owner: "Ada", balance: 250 };

console.log(describe(account));
console.log(`${convert(account.balance, "USD")} USD, home ${homeCurrency}`);
```

`npm start` prints:

```text
IT60 (Ada): 250.00 EUR
275 USD, home EUR
```

`format` stays inside `account.ts`. Nothing outside can call it, so it can change name or
disappear without breaking anyone — the same reasoning as `private` in LESSON 39, one level up.

**Common mistakes**

- **Exporting everything.** A module whose every declaration is exported has no inside, and
  every helper becomes something another file may depend on.
- **Writing the import path without `.js`** (TS2835) or with `.ts` — the path is what Node
  reads after the build, and Node reads `.js`.
- **Two default exports in one file.** There is only one "the thing this module is about";
  a second one has to be named.
- **Importing a value and using it as a type**, or the reverse. LESSON 68 is about saying
  which one you mean.

### Verification

<!-- practice: terminal -->
`npm run check` is clean, `npm start` prints the two lines above, and each of the three
deliberate mistakes produced its own message: TS2835 for the missing extension, TS2305 for the
name that doesn't exist, and TS2459 for the one that exists but isn't exported.

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Nothing at all: it isn't exported, so no other file can import it, and the compiler says
//    so by name — "declares 'internalHelper' locally, but it is not exported" (TS2459). It is
//    the file-level version of `private` from LESSON 39: the module decides its own surface,
//    and everything else is free to change.
//
// 2. Because the path is read at runtime, by Node, after the build — and by then the file is
//    dist/domain/account.js. TypeScript checks the import against account.ts but writes the
//    path through untouched. A path ending in .ts would be looked up as a file called
//    account.ts inside dist, which the build never creates.
//
// 3. When a module really is about one thing and the name would only repeat the file name.
//    What the reader loses is the name itself: `import anything from "./rates.js"` compiles
//    whatever they call it, so a rename in the module is invisible at the call site, and
//    searching the project for the function's name finds nothing. Named exports are the
//    default habit for that reason.

<!-- cell: markdown -->
## LESSON 68 — `import type`

### Exercise

<!-- practice: terminal -->
`src/domain/types.ts`:

```typescript
export type Account = { readonly iban: string; owner: string; balance: number };
```

`src/domain/account.ts`:

```typescript
import type { Account } from "./types.js";

export const homeCurrency = "EUR";

function format(amount: number): string {
  return amount.toFixed(2);
}

export function describe(account: Account): string {
  return `${account.iban} (${account.owner}): ${format(account.balance)} ${homeCurrency}`;
}
```

`src/index.ts`:

```typescript
import { describe, homeCurrency } from "./domain/account.js";
import type { Account } from "./domain/types.js";

const account: Account = { iban: "IT60", owner: "Ada", balance: 250 };

console.log(describe(account));
console.log(`home: ${homeCurrency}`);
```

Step 2: `dist/index.js` keeps one import, the one with `describe` and `homeCurrency`.

Step 3, the two messages:

```text
error TS2693: 'Account' only refers to a type, but is being used as a value here.
error TS1361: 'describe' cannot be used as a value because it was imported using 'import type'.
```

The first would have appeared with a plain `import` too — a type alias is never a value. The
second is the one `import type` adds: `describe` really is a value, and the import line said it
would only be used as a type.

Step 5: `dist/domain/types.js` exists and contains exactly `export {};`.

**Common mistakes**

- **Assuming `import type` is required.** A plain import of a type compiles and is erased just
  the same; `import type` is about saying so, and about the error in step 3.
- **Putting a value in a types file.** The moment `types.ts` exports a constant, importing it
  loads code at runtime, and a file everyone imports becomes a file everyone runs.
- **Writing `import type` for a class you construct.** A class is a value too; `new` then fails
  with TS1361.
- **Expecting `types.js` not to be written.** Every `.ts` file in the program produces a `.js`
  file; this one just has nothing in it.

### Verification

<!-- practice: terminal -->
One import line left in `dist/index.js`; TS2693 and TS1361 in step 3; `npm start` printing
`IT60 (Ada): 250.00 EUR` and `home: EUR`; and `dist/domain/types.js` containing `export {};`.

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Because tsc emits one .js file per .ts file in the program: it doesn't try to work out
//    that nothing is left. `export {}` is there to keep the file a module rather than a
//    script. Dropping it would change nothing in dist/index.js, which never imports it — the
//    type import was erased — but tsc can't assume that in general, since another module might
//    import a value from it tomorrow.
//
// 2. It says, at the top of the file, which imports will run and which are only for the type
//    checker — so a reader knows what this module actually loads. And it makes a wrong use
//    impossible: a name imported as a type can't quietly end up in a call, because TS1361
//    names it.
//
// 3. Import it plainly if you ever call `new`, extend it, or pass the class itself around: it
//    is a value then, and `import type` would report TS1361. Use `import type` when the class
//    only ever appears in annotations — a parameter type, a field type — because then nothing
//    about it needs to exist at runtime, and the import disappears from the build.

<!-- cell: markdown -->
## LESSON 69 — Separating types from implementation

### Exercise

<!-- practice: terminal -->
Step 1: `Report` belongs in `report.ts`, next to the function that builds it. Only
`report.ts` and `index.ts` use it, and `report.ts` is the module that owns it.

```typescript
// src/domain/report.ts
import type { Account } from "./account.js";

export type Report = { owner: string; lines: string[] };

export function buildReport(account: Account, lines: string[]): Report {
  return { owner: account.owner, lines };
}
```

Step 3, the value cycle — `report.ts` imports `homeCurrency` from `account.ts` while
`account.ts` imports the new constant back. `npm run check` and `npm run build` say nothing,
and `npm start` fails:

```text
ReferenceError: Cannot access 'homeCurrency' before initialization
```

Step 5, the type-only cycle — `Account` has an optional `Report`, `Report` has an optional
`Account`, each imported with `import type`. It builds and runs exactly as before: both lines
are erased, so at runtime there is no cycle at all.

**Common mistakes**

- **Moving every type into one `types.ts` from the start.** A type with one user reads better
  next to that user; the shared file is for the shapes several modules agree on.
- **Breaking a cycle by moving the *function*.** It is usually the type or the constant that
  wants to move: put it in a module that imports nothing back.
- **Blaming the compiler for step 3.** A value cycle is legal TypeScript and legal JavaScript;
  what fails is the order in which the modules initialize at runtime.
- **Leaving the cycle in place because "it works on my machine".** Which module initializes
  first depends on who imports whom, so the crash can appear after an unrelated change.

### Verification

<!-- practice: terminal -->
Steps 1-2 clean; step 3 building fine and failing at runtime with
`ReferenceError: Cannot access 'homeCurrency' before initialization`; step 4 clean again;
step 5 building and running exactly as before.

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Step 3 imported a value, which has to exist when the module runs; step 5 imported only
//    types, which are erased, so nothing was left to import.
//
// 2. From that moment, every module that imports types.ts also runs account.ts. A file that
//    everyone depends on has become a file that everyone executes — and if account.ts imports
//    anything back, the cycle is a runtime one.
//
// 3. Leave it where it is. Moving it costs nothing later — one line changes in each file — and
//    guessing at a second user that may never arrive spreads the domain across files nobody
//    needed. Move it the day the second module imports it.

<!-- cell: markdown -->
## LESSON 70 — A multi-file project

### Exercise

<!-- practice: terminal -->
The finished layout:

```text
src/
├── index.ts
├── domain/
│   ├── index.ts
│   ├── account.ts
│   └── report.ts
└── report/
    └── monthly.ts
```

```typescript
// src/domain/index.ts
export { describe, homeCurrency } from "./account.js";
export { buildReport } from "./report.js";
export type { Account } from "./account.js";
export type { Report } from "./report.js";
```

```typescript
// src/report/monthly.ts
import { homeCurrency } from "../domain/index.js";
import type { Account } from "../domain/index.js";

export function monthlyTitle(account: Account): string {
  return `Monthly statement for ${account.owner} in ${homeCurrency}`;
}
```

```typescript
// src/index.ts
import { describe, buildReport } from "./domain/index.js";
import { monthlyTitle } from "./report/monthly.js";
import type { Account } from "./domain/index.js";

const account: Account = { iban: "IT60", owner: "Ada", balance: 250 };
const report = buildReport(account, [describe(account)]);

console.log(monthlyTitle(account));
console.log(`${report.owner}: ${report.lines.join(" | ")}`);
```

`npm start` prints:

```text
Monthly statement for Ada in EUR
Ada: IT60 (Ada): 250.00 EUR
```

`dist/` mirrors `src/`, and `dist/domain/index.js` contains only the two value re-exports.

**Common mistakes**

- **A barrel that re-exports a folder's internals.** The point is to publish a surface, not
  every file; anything the rest of the program shouldn't use stays out of it.
- **Importing straight from `domain/account.js` in some files and from `domain/index.js` in
  others.** Pick one and stay with it, or the barrel buys nothing.
- **Forgetting `export type` for the types.** They aren't re-exported by an `export {}` line
  unless they are values, and the import in `index.ts` is then reported (TS2305).
- **Putting logic in `index.ts` because it is quicker.** The entry point stops being readable
  as a summary, which is the only job it has.

### Verification

<!-- practice: terminal -->
`npm run check` clean; `npm start` printing the two lines above; `dist/` mirroring `src/` with
`dist/report/monthly.js` present; `dist/domain/index.js` holding only the value re-exports; and
deleting one of them reporting
`error TS2305: Module '"./domain/index.js"' has no exported member 'buildReport'.`

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. A caller gets one import line and one name to remember, and stops depending on which file
//    holds what — the folder can be reorganized without touching them. A first-time reader
//    pays for it: finding where describe really lives now takes an extra hop, and a barrel
//    that re-exports too much hides the folder's shape instead of showing it.
//
// 2. The two folders would import each other. If both imports are types only, nothing happens.
//    If either is a value, it is a runtime cycle of exactly the kind LESSON 69 produced, and
//    the crash appears in whichever module happens to initialize first. The fix is direction:
//    report depends on domain, never the other way round.
//
// 3. The domain decisions (building the report, applying the rules) into the module that owns
//    them, and the printing into something like src/report/print.ts. What is left in index.ts
//    is reading the input, calling those two, and writing the output — a summary of the
//    program rather than the program.

<!-- cell: markdown -->
That is the end of the core course. You can model data with types, functions and classes,
describe contracts with interfaces, write generic code when it earns its place, reshape types
with the utility types, narrow anything a union can hold, and split a program across files that
each say what they offer. Mini-project 4 puts all of it together.
