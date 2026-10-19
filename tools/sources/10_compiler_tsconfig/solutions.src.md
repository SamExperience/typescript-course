<!-- cell: markdown -->
# TypeScript — The Compiler and tsconfig.json

> **Solutions.** Open this only after you've genuinely tried the exercises in
> `lesson.ipynb`. In this topic most solutions are terminal commands and configuration files.

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
## LESSON 33 — `tsc`: type checking vs compilation

### Exercise

<!-- practice: terminal -->
Step 1 prints the error twice, once per command, and `dist/index.js` contains the compiled
code with the rejected value:

```javascript
"use strict";
function fee(amount) {
    return amount * 0.01;
}
const total = "100";
console.log(fee(total));
```

`npm start` prints `1`.

Step 2, `tsconfig.json`:

```json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noEmitOnError": true
  },
  "include": ["src"]
}
```

After deleting `dist`, `npm run build` reports the same error and creates nothing.

Step 3, the fixed line and a clean run:

```typescript
const total = 100;
```

```bash
npm run check   # prints nothing
npm run build
npm start       # prints 1
```

Step 4: watch mode prints a compilation message, then `Found 0 errors. Watching for file
changes.` Each save triggers a new check.

**Common mistakes**

- **Not deleting `dist` before step 2.** The old `dist/index.js` is still there from step 1, so
  it looks as if `noEmitOnError` did nothing.
- **Adding `noEmitOnError` outside `compilerOptions`.** The compiler ignores it, and your
  editor may warn that the option is unknown at the top level.
- **Leaving watch mode running and wondering why the terminal is blocked.** It's meant to stay
  open. Use a second terminal, or stop it with Ctrl-C.

### Verification

<!-- practice: terminal -->
`npm run check` prints nothing after step 3, `npm start` prints `1`, and in step 2 no `dist`
folder was created.

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. npm start runs dist/index.js, which the build wrote anyway; the types were already
//    removed, so nothing stopped "100" from being used as a number at runtime.
// 2. npm run check: it type-checks without writing anything, and its exit code (0 or not) is
//    what the server looks at.
// 3. The editor checks the files you have open. npm run check checks the whole project, with
//    the project's own tsconfig and the exact pinned compiler version.
// 4. When you want to run the partly compiled output while you're still fixing errors, for
//    example to try one function during debugging.

<!-- cell: markdown -->
Checking and compiling are separate jobs. Decide deliberately which one each command in your
project does.

<!-- cell: markdown -->
## LESSON 34 — `target` and `module`

### Exercise

<!-- practice: terminal -->
Step 2, with `"target": "ES2015"`:

```text
src/index.ts(5,28): error TS2550: Property 'at' does not exist on type 'number[]'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2022' or later.
```

The message names `lib`, which `target` sets for you. Raising the target to `"ES2022"` is
enough.

Step 3, with `"target": "ES2022"`:

```bash
npm run check   # prints nothing
npm run build
npm start       # prints Last: 30, note: (none)
```

Step 4, the same line in `dist/index.js`:

```javascript
// target ES2022
return `Last: ${balances.at(-1) ?? 0}, note: ${note ?? "(none)"}`;

// target ES2015, with balances[2] instead of .at(-1)
return `Last: ${balances[2]}, note: ${note !== null && note !== void 0 ? note : "(none)"}`;
```

**Common mistakes**

- **Trying `"target": "ES5"`.** TypeScript 6 reports
  `error TS5107: Option 'target=ES5' is deprecated and will stop functioning in TypeScript 7.0.`
  and compiles nothing.
- **Adding `lib` by hand to silence the `.at` error.** It works, but `target` already sets a
  matching `lib`. Raise the target instead.
- **Looking at an old `dist/index.js`.** Rebuild after every config change (and remember
  LESSON 33: without `noEmitOnError`, a failed build can leave a stale file behind).

### Verification

<!-- practice: terminal -->
`npm start` prints `Last: 30, note: (none)`, and the `??` operator appears in `dist/index.js`
only with the newer target.

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. target ES2022 (or newer) and module nodenext: Node 24 understands modern JavaScript, so
//    there's nothing to rewrite.
// 2. A lower target, for example ES2015, so tsc rewrites newer syntax into what those
//    browsers understand. The module setting is usually decided by the bundler.
// 3. The output keeps import/export, but package.json doesn't say "type": "module", so Node
//    reads dist/index.js as an older-style file. The tsconfig and package.json disagree.
// 4. No. The code is identical; only the compiler's idea of which built-in APIs exist
//    changed. Whether .at() really exists depends on the runtime that runs the output.

<!-- cell: markdown -->
`target` and `module` don't change what your program does. They decide which JavaScript it
becomes, and which runtimes can run it.

<!-- cell: markdown -->
## LESSON 35 — `rootDir` and `outDir`

### Exercise

<!-- practice: terminal -->
Step 1:

```text
dist/
├── index.js
└── domain/account.js
```

Step 2, the error:

```text
error TS6059: File '<project>/tools/seed.ts' is not under 'rootDir' '<project>/src'. 'rootDir' is expected to contain all source files.
  The file is in the program because:
    Matched by include pattern 'tools' in '<project>/tsconfig.json'
```

It names `tools/seed.ts` and the option `rootDir`, and then explains why that file is part of
the build at all.

Step 3, without `rootDir`:

```text
dist/
├── src/index.js
├── src/domain/account.js
└── tools/seed.js
```

`tsc` used the shared parent folder of all included files, so everything moved one level
deeper.

Step 4 restores the original layout:

```json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "target": "ES2022",
    "noEmitOnError": true
  },
  "include": ["src"]
}
```

**Common mistakes**

- **Not deleting `dist` between steps.** Old files stay behind, and the folder looks like a
  mixture of both layouts.
- **Fixing step 2 by removing `rootDir`.** That's step 3, and it moves every output file. The
  real fix is to decide which folders belong to the build.
- **Forgetting to update `start` after the output moved.** `node dist/index.js` only works when
  the file is really at that path.

### Verification

<!-- practice: terminal -->
`dist` contains `index.js` and `domain/account.js`, and `npm start` works.

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. A file outside src was added to the build and rootDir is missing, so tsc recomputed the
//    shared parent folder and wrote dist/src/index.js. Setting "rootDir": "src" (and keeping
//    include to the folders that belong to the build) fixes it.
// 2. The compiled .js files sit next to the sources, so they get committed by accident, they
//    show up in searches and editor file lists, and a later rename leaves a stale .js file
//    behind that Node may still run.
// 3. Otherwise the generated .js files would themselves be input to the next build, so tsc
//    would compile its own output over and over.
// 4. Nothing simple. The output would be spread through src, so you'd have to ignore *.js
//    inside your source folders, which also hides real JavaScript files you might want to
//    keep.

<!-- cell: markdown -->
One tidy rule covers most projects: `include: ["src"]`, `rootDir: "src"`, `outDir: "dist"`,
and `dist` in `.gitignore`.

<!-- cell: markdown -->
## LESSON 36 — Strict mode and important options

### Exercise

<!-- practice: terminal -->
Steps 2 and 3, a fixed `src/index.ts`:

```typescript
type Account = { owner: string; balance: number };

function ownerOf(account: Account): string {
  return account.owner;
}

const accounts: Account[] = [{ owner: "Ada", balance: 10 }];
const found = accounts.find((account) => account.owner === "Grace");
const note: string | null = null;

const first = accounts[0];
if (first !== undefined) {
  console.log(ownerOf(first), found === undefined ? "not found" : found.balance, note);
}
```

Each fix answers one error: a type for the parameter, an `undefined` check for `find`, and a
union for a value that may be empty. With `noUncheckedIndexedAccess`, `accounts[0]` also needs
a check, even though the array obviously has one element. `npm start` then prints
`Ada not found null`.

Step 4: an unused variable inside a function reports
`error TS6133: 'helper' is declared but its value is never read.` At the top level of a file
with no `export`, the same option says nothing, because such a variable isn't a local at all.

**Common mistakes**

- **Leaving `"strict": false` after step 1.** Everything looks fine and nothing is checked.
  Turn it back on before you fix anything.
- **"Fixing" the `find` error by removing the `found.balance` line.** The lookup can still fail;
  the point is to handle that case.
- **Typing `note` as `string` and assigning `""`.** That's a different meaning: an empty note
  instead of no note. `string | null` says what you meant.

### Verification

<!-- practice: terminal -->
`npm run check` prints nothing with all the options on, and `npm start` runs.

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. TS7006 (parameter implicitly any) comes from noImplicitAny.
//    TS18048 ('found' is possibly undefined) and TS2322 (null into string) come from
//    strictNullChecks.
// 2. Two examples: a parameter with no type is accepted and becomes any, so typos inside the
//    function are never reported (LESSON 8); and a value that may be null or undefined can be
//    used directly, so "Cannot read properties of undefined" comes back at runtime
//    (LESSON 13).
// 3. noUncheckedIndexedAccess. It only changes the types: every index access becomes
//    "possibly undefined", so you must check it. At runtime nothing changes, because the
//    types are removed anyway (LESSON 10).
// 4. Because almost every array index in existing code would suddenly need a check, including
//    the many that are safe in practice. Keeping it opt-in lets teams turn on strict without
//    rewriting all their loops.

<!-- cell: markdown -->
Strict mode is the baseline, not an expert setting. The extra options are a choice about how
much extra checking a team wants to carry.

<!-- cell: markdown -->
## LESSON 37 — Development workflow and compilation errors

### Exercise

<!-- practice: terminal -->
Step 2 reports four errors and one cause:

```text
src/index.ts(4,19): error TS2353: Object literal may only specify known properties, and 'balance' does not exist in type 'Account'.
src/index.ts(5,21): error TS2353: Object literal may only specify known properties, and 'balance' does not exist in type 'Account'.
src/index.ts(9,40): error TS2339: Property 'balance' does not exist on type 'Account'.
src/index.ts(13,54): error TS2339: Property 'balance' does not exist on type 'Account'.
```

Step 3, the one change:

```typescript
type Account = { owner: string; balance: number };
```

Step 4:

```text
Ada: 250.50 EUR
Grace: 40.00 EUR
29050
```

Step 5, the same error in both formats:

```text
src/index.ts(18,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

```text
src/index.ts:18:7 - error TS2322: Type 'string' is not assignable to type 'number'.

18 const amount: number = "5";
         ~~~~~~


Found 1 error in src/index.ts:18
```

**Common mistakes**

- **Renaming the property in the data and in the two functions** (three edits) instead of in
  the type (one edit). Both make the errors go away, but only one is the actual decision:
  which name does this type have?
- **Counting errors as progress.** Four errors became zero with one edit; two errors can also
  become five when a fix reveals the next problem.
- **Fixing the last error first.** Later errors are often consequences of earlier ones.

### Verification

<!-- practice: terminal -->
`npm run check` prints nothing, and `npm start` prints the three lines above.

### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Three causes: the renamed quantity property (four errors), a call with a missing
//    argument, and a value that may be undefined. Fix the renamed property first: it explains
//    four of the six errors and may change the others.
// 2. npm run check again. After a fix, the list of errors can shrink, grow or change, so the
//    output you were reading is already out of date.
// 3. order.ts(9,3) TS2554: a function was called with one argument although it needs two.
//    order.ts(30,7) TS18048: line might have no value at that point, so some path doesn't set
//    one, and it has to be handled before use.
// 4. npm run check while fixing: it's faster, it writes nothing, and it checks the whole
//    project. Use npm run build when you actually want to run the program.

<!-- cell: markdown -->
"Six errors" is not a measure of how broken the code is. Three causes, fixed one at a time
from the top, is the work.
