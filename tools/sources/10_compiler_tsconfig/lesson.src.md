<!-- cell: markdown -->
# TypeScript — The Compiler and tsconfig.json

> **How this topic works**
>
> This topic is about the compiler itself, so most of the practice happens in a **terminal**,
> in your `ts-scratch` project from topic 02. Sections marked *Practice in the terminal* tell
> you what to run and what you should see. Mini Challenges are answered in the notebook.
>
> Your `ts-scratch` project already has `src/`, `dist/`, a strict `tsconfig.json` and the
> `check`, `build` and `start` scripts from LESSON 7.

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

### Explanation

`tsc` does two jobs, and you can ask for them separately:

- **Check the types.** `tsc --noEmit` (your `npm run check`) reports errors and writes nothing.
- **Check the types and write JavaScript.** `tsc` (your `npm run build`) reports the same
  errors **and still writes `dist/`**, as you saw in LESSON 5.

That surprises people, so it's worth seeing clearly: a build that printed errors can still
produce a `dist/` folder that runs, using the wrong values.

To stop that, add one option to `tsconfig.json`:

```json
"noEmitOnError": true
```

Now a build with any error writes nothing, and `dist/` keeps whatever it had before.

Both commands also set an **exit code**: `0` when there are no errors, and non-zero when there
are. That's how a build server knows a commit is broken, even though nobody is reading the
output.

For daily work, **watch mode** rechecks on every save:

```bash
npx tsc --noEmit --watch
```

It prints `Found 0 errors. Watching for file changes.` and stays open until you stop it with
Ctrl-C.

### Key Notes

- `tsc --noEmit` checks only; `tsc` checks and writes JavaScript.
- By default, errors don't stop the output. `"noEmitOnError": true` does.
- Exit code 0 means no errors; anything else means errors.
- `tsc --noEmit --watch` rechecks after every save.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* With this `src/index.ts`:

```typescript
function fee(amount: number): number {
  return amount * 0.01;
}

const total: number = "100";
console.log(fee(total));
```

```bash
npm run check
npm run build
npm start
```

`npm run check` prints:

```text
src/index.ts(5,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

`npm run build` prints the same error, **and** writes `dist/index.js`. `npm start` then prints
`1`: JavaScript turned the text `"100"` into a number, so the program ran with a value the
compiler had already rejected.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`.

1. Put the code from the Example into `src/index.ts`. Run `npm run check`, then `npm run build`,
   then `npm start`. Confirm that the build wrote `dist/index.js` even though it reported an
   error.
2. Add `"noEmitOnError": true` to `compilerOptions` in `tsconfig.json`. Delete the `dist`
   folder, then run `npm run build` again. Is `dist` there?
3. Fix the file: `const total = 100;`. Run `npm run check`, `npm run build` and `npm start`.
4. Start watch mode with `npx tsc --noEmit --watch`. Break the file again in your editor and
   save. Watch the terminal, then fix it and watch again. Stop watch mode with Ctrl-C.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- Step 1: `npm run build` reports `error TS2322` and `dist/index.js` exists. `npm start` prints
  `1`.
- Step 2: after `noEmitOnError`, `npm run build` reports the same error and **no** `dist` folder
  is created.
- Step 3: `npm run check` prints nothing, and `npm start` prints `1` again, this time from code
  the compiler accepted.
- Step 4: watch mode prints `Found 0 errors. Watching for file changes.`, then reports the error
  a second after you save, and goes back to 0 errors when you fix it.

### Mini Challenge

Answer in comments:

1. In step 1, `npm start` printed `1` even though the check failed. Explain in one sentence how
   that's possible.
2. A build server runs one command to decide whether to reject a commit. Which of `npm run
   check`, `npm run build` and `npm start` would you choose, and what does it look at?
3. Your editor already underlines type errors as you type. Give one reason to run
   `npm run check` anyway.
4. Name one situation where you'd rather **not** set `noEmitOnError`.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.

<!-- cell: markdown -->
## LESSON 34 — `target` and `module`

### Explanation

Two options decide **what kind of JavaScript** `tsc` writes.

**`target`: which JavaScript version the output uses.**

- With a **new** target (`"ES2022"`), the output looks almost like your source: `??`, classes
  and template literals are kept as they are.
- With an **older** target, `tsc` rewrites newer syntax into older equivalents. With
  `"ES2015"`, `note ?? "(no note)"` becomes
  `note !== null && note !== void 0 ? note : "(no note)"`.
- `target` also tells the compiler **which built-in APIs exist**. With `"ES2015"`,
  `[1, 2].at(0)` is an error:
  `Property 'at' does not exist on type 'number[]'. Do you need to change your target library?`
  The API is a runtime feature, not syntax, so the compiler can only accept it if the target
  (or the `lib` option it implies) includes it.
- `"ES5"` is deprecated in TypeScript 6 and reports an error, so don't use it.

**`module`: what kind of import/export code the output uses.**

- `"commonjs"` writes `require(...)`, the older Node.js style.
- `"nodenext"` follows your `package.json`: with `"type": "module"` it keeps
  `import`/`export`, otherwise it writes `require(...)`.

You'll write imports in LESSON 67. Until then, `module` only decides the *shape* of the
output.

**A rule of thumb:** for a Node.js project, `"target": "ES2022"` and `"module": "nodenext"`.
For browser code, a bundler usually decides, and `target` says how old the browsers may be.

### Key Notes

- `target` = which JavaScript version is written, and which built-in APIs exist.
- An older target means rewritten syntax and fewer available APIs.
- `"ES5"` is deprecated in TypeScript 6.
- `module` = `require` (`"commonjs"`) or `import`/`export` (`"nodenext"` with
  `"type": "module"`).
- Node project default: `ES2022` + `nodenext`.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* For this `src/index.ts`:

```typescript
const note: string | undefined = undefined;

function noteLine(): string {
  return `Note: ${note ?? "(none)"}`;
}

console.log(noteLine());
```

with `"target": "ES2015"`, `dist/index.js` contains:

```javascript
return `Note: ${note !== null && note !== void 0 ? note : "(none)"}`;
```

and with `"target": "ES2022"`:

```javascript
return `Note: ${note ?? "(none)"}`;
```

Both print `Note: (none)`. Same behavior, different JavaScript.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`.

1. Put this in `src/index.ts`:

   ```typescript
   const note: string | undefined = undefined;
   const balances = [10, 20, 30];

   function report(): string {
     return `Last: ${balances.at(-1) ?? 0}, note: ${note ?? "(none)"}`;
   }

   console.log(report());
   ```

2. Set `"target": "ES2015"` in `tsconfig.json` and run `npm run check`. Read the error: which
   option does it suggest changing, and to which value?
3. Set `"target": "ES2022"`, then run `npm run check`, `npm run build` and `npm start`.
4. Open `dist/index.js` and find the `??` operator. Then set the target back to `"ES2015"`,
   remove the `.at(-1) ?? 0` part (use `balances[2]` instead), build again and compare the same
   line. Finally, restore `"target": "ES2022"`.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- Step 2 reports:
  `error TS2550: Property 'at' does not exist on type 'number[]'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2022' or later.`
- Step 3: `npm run check` prints nothing and `npm start` prints
  `Last: 30, note: (none)`.
- Step 4: with `ES2022` the file contains `??`; with `ES2015` the same line contains
  `note !== null && note !== void 0 ? note : "(none)"`.

### Mini Challenge

Choose `target` and `module` for each project, and give a one-line reason.

1. A command-line tool that only ever runs on Node.js 24.
2. Code for a website that must also work in a five-year-old browser.
3. A teammate sets `"module": "nodenext"`, and `node dist/index.js` fails with
   `Cannot use import statement outside a module`. What's mismatched?
4. Someone raises `target` from `"ES2015"` to `"ES2022"` and a `.at()` error disappears. Did
   their code change?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.

<!-- cell: markdown -->
## LESSON 35 — `rootDir` and `outDir`

### Explanation

These two options decide **where** the compiled files go.

- **`include`** says which files to compile (`["src"]`).
- **`rootDir`** is the folder those files are measured from.
- **`outDir`** is where the output goes.

`tsc` keeps the structure: with `rootDir: "src"` and `outDir: "dist"`, `src/domain/account.ts`
becomes `dist/domain/account.js`.

Three things worth knowing:

- **Without `outDir`**, every `.js` file is written next to its `.ts` file, so `src/` fills up
  with generated files. Always set `outDir`.
- **Without `rootDir`**, `tsc` works out the shared parent of all included files. Add a file
  outside `src/` and the output suddenly gains an extra level: `dist/src/index.js` and
  `dist/tools/seed.js`. Setting `rootDir` keeps the shape predictable.
- **`rootDir` must contain every compiled file.** If `include` matches a file outside it, the
  build stops with:
  `error TS6059: File '<project>/tools/seed.ts' is not under 'rootDir' '<project>/src'. 'rootDir' is expected to contain all source files.`
  The message then explains why the file was in the program.

`tsc` never compiles its own output: the folder named by `outDir` is excluded automatically,
even when it sits inside `src/`.

### Key Notes

- `include` = what to compile, `rootDir` = measured from where, `outDir` = written where.
- The folder structure under `rootDir` is mirrored under `outDir`.
- No `outDir` means `.js` files next to your `.ts` files.
- No `rootDir` means the shape can change when you add a file elsewhere.
- Every compiled file must live inside `rootDir` (TS6059).

### Example

<!-- practice: terminal -->
*Practice in the terminal.* With this project:

```text
ts-scratch/
├── src/
│   ├── index.ts
│   └── domain/account.ts
└── tsconfig.json
```

and `"rootDir": "src"`, `"outDir": "dist"`, `"include": ["src"]`, `npm run build` produces:

```text
dist/
├── index.js
└── domain/account.js
```

Remove `"rootDir"` and add `"tools"` to `include`, and the same build produces
`dist/src/index.js`, `dist/src/domain/account.js` and `dist/tools/seed.js` instead.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`.

1. Create `src/domain/account.ts` with `console.log("account");` and make sure
   `src/index.ts` still prints something. Run `npm run build` and look at `dist`.
2. Create `tools/seed.ts` with `console.log("seed");` and add `"tools"` to `include`. Run
   `npm run build` and read the error. Which file does it name, and which option does it
   mention?
3. Remove `"rootDir"` (keep `outDir` and both `include` entries). Delete `dist` and build
   again. Where did the files go this time?
4. Put the project back: `"rootDir": "src"`, `"include": ["src"]`. Delete `dist` and `tools`,
   build, and confirm `dist` looks like it did in step 1.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- Step 1: `dist` contains `index.js` and `domain/account.js`.
- Step 2: the build reports
  `error TS6059: File '<project>/tools/seed.ts' is not under 'rootDir' '<project>/src'.`
- Step 3: `dist` contains `src/index.js`, `src/domain/account.js` and `tools/seed.js`.
- Step 4: `dist` contains `index.js` and `domain/account.js` again, and `npm start` still
  works.

### Mini Challenge

Answer in comments:

1. A teammate's `dist` suddenly contains `dist/src/index.js`, so `npm start`
   (`node dist/index.js`) fails. What's the likely cause, and which option fixes it?
2. Another project has no `outDir`. Name two problems that causes, beyond the mess.
3. Why does `tsc` exclude the `outDir` folder from compilation by itself?
4. Your `.gitignore` lists `dist`. What would you have to add to it if the project had no
   `outDir`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.

<!-- cell: markdown -->
## LESSON 36 — Strict mode and important options

### Explanation

**`"strict": true` is a group of checks**, not one. Two of them you've relied on since the
start:

- **`noImplicitAny`**: a parameter without a type is an error (TS7006, LESSON 8).
- **`strictNullChecks`**: `null` and `undefined` are separate types, so "possibly undefined" is
  reported (TS18048, LESSON 13).

Turn `strict` off and all of that silently disappears: the same file compiles with **no**
errors, and the bugs come back at runtime. Strict mode is not a difficulty setting. It's the
reason the compiler can help you at all.

Three more options are **not** in `strict`, because they change how much existing code has to
be adjusted. They're worth knowing:

| Option | What it adds |
|---|---|
| `noUncheckedIndexedAccess` | `accounts[5]` becomes "possibly `undefined`", closing the gap from LESSON 18 |
| `noUnusedLocals` / `noUnusedParameters` | reports variables and parameters nobody reads (TS6133) |
| `noImplicitReturns` | every path of a function must return a value |

Plus `noEmitOnError` from LESSON 33.

**What to use:** `strict: true` in every project, always. Add `noUncheckedIndexedAccess` when
you start a new project. The rest is team taste. This course keeps `tsconfig.json` small, so
every lesson behaves the same on every machine.

### Key Notes

- `strict: true` bundles `noImplicitAny`, `strictNullChecks` and more.
- Without it, your existing errors vanish and the bugs stay.
- `noUncheckedIndexedAccess` makes array indexing honest.
- `noUnusedLocals` reports dead code; `noImplicitReturns` reports missing returns.
- Keep `strict` on; add the extras deliberately.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* This file has three problems:

```typescript
type Account = { owner: string; balance: number };

function ownerOf(account) {
  return account.owner;
}

const accounts: Account[] = [{ owner: "Ada", balance: 10 }];
const found = accounts.find((account) => account.owner === "Grace");
let note: string = null;

console.log(ownerOf(accounts[0]), found.balance, note);
```

With `"strict": false`, `npm run check` prints **nothing**. With `"strict": true`:

```text
src/index.ts(3,18): error TS7006: Parameter 'account' implicitly has an 'any' type.
src/index.ts(9,5): error TS2322: Type 'null' is not assignable to type 'string'.
src/index.ts(11,35): error TS18048: 'found' is possibly 'undefined'.
```

Same code, same bugs. Only the compiler's willingness to tell you changed.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`.

1. Put the code from the Example into `src/index.ts`. Temporarily set `"strict": false` and run
   `npm run check`. Confirm it reports nothing, then put `"strict": true` back.
2. Fix all three errors properly: annotate the parameter, handle the missing account, and give
   `note` a type that can hold no value.
3. Add `"noUncheckedIndexedAccess": true` and run `npm run check` again. It reports a new
   problem about `accounts[0]`. Fix that too.
4. Add `"noUnusedLocals": true`. Declare a variable **inside a function** and never use it, see
   the error, then remove the variable. Finally remove `"noUnusedLocals"` again and keep the
   other options.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- Step 1: with `strict: false`, `npm run check` prints nothing; with `strict: true` it reports
  TS7006, TS18048 and TS2322.
- Step 3: the new message depends on how you use the element. Reading a property gives
  `error TS2532: Object is possibly 'undefined.'`, and passing it to a function gives
  `error TS2345: Argument of type 'Account | undefined' is not assignable to parameter of type 'Account'.`
  After your fix, `npm run check` is clean.
- Step 4: the unused variable reports
  `error TS6133: 'helper' is declared but its value is never read.`
- At the end, `npm run check` prints nothing and `npm start` runs.

### Mini Challenge

Answer in comments:

1. Match each error from the Example to the check that produced it: `noImplicitAny` or
   `strictNullChecks`.
2. A teammate suggests `"strict": false` to meet a deadline. Name two things that stop being
   checked, using errors you've met in this course.
3. LESSON 18 said that reading past the end of an array isn't caught. Which option changes
   that, and does it change what happens at runtime?
4. Why do you think `noUncheckedIndexedAccess` is not part of `strict`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.

<!-- cell: markdown -->
## LESSON 37 — Development workflow and compilation errors

### Explanation

A practical loop for working on a TypeScript project:

1. **Write code.** Your editor underlines problems in the files you have open.
2. **Keep `npx tsc --noEmit --watch` running** in a second terminal, so the whole project is
   checked after every save.
3. **Run `npm run check` before every commit.** Same compiler, same config, whole project.
4. **`npm run build` and `npm start`** when you want to run the result.

**One mistake usually produces several errors.** Rename a property in a type, and every place
that used the old name reports something:

```text
src/index.ts(4,19): error TS2353: Object literal may only specify known properties, and 'balance' does not exist in type 'Account'.
src/index.ts(5,21): error TS2353: Object literal may only specify known properties, and 'balance' does not exist in type 'Account'.
src/index.ts(9,40): error TS2339: Property 'balance' does not exist on type 'Account'.
src/index.ts(13,54): error TS2339: Property 'balance' does not exist on type 'Account'.
```

Four errors, one cause. So: **fix the first error, then check again.** Never judge progress by
the number of errors.

**Reading a long message.** The first line is what went wrong; the indented lines below explain
why, getting more specific as you go down. Read from the top and stop as soon as you know
enough.

`tsc` can also show errors with the offending code underneath. In a terminal it usually does
this by itself; when the output goes somewhere else (a file, a build log), add `--pretty`:

```text
src/broken.ts:1:7 - error TS2322: Type 'string' is not assignable to type 'number'.

1 const amount: number = "5";
        ~~~~~~

Found 1 error in src/broken.ts:1
```

### Key Notes

- Editor while typing, `--watch` while working, `npm run check` before committing.
- Several errors often share one cause: fix the first one, then re-check.
- Read long messages from the top; the indented lines are the reason.
- `--pretty` adds the code frame and an error summary.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* `Account` stores cents, but the data and the code still use the old
property name:

```typescript
type Account = { owner: string; balanceInCents: number };

const accounts: Account[] = [
  { owner: "Ada", balance: 25050 },
  { owner: "Grace", balance: 4000 },
];

function balanceLine(account: Account): string {
  return `${account.owner}: ${(account.balance / 100).toFixed(2)} EUR`;
}

console.log(accounts.map(balanceLine).join("\n"));
```

`npm run check` reports **four** errors: two in the data (TS2353) and two in the code (TS2339).
Renaming the property in the type back to `balance` fixes all four at once.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal,* in `ts-scratch`.

1. Put this in `src/index.ts`:

   ```typescript
   type Account = { owner: string; balanceInCents: number };

   const accounts: Account[] = [
     { owner: "Ada", balance: 25050 },
     { owner: "Grace", balance: 4000 },
   ];

   function balanceLine(account: Account): string {
     return `${account.owner}: ${(account.balance / 100).toFixed(2)} EUR`;
   }

   function total(list: Account[]): number {
     return list.reduce((sum, account) => sum + account.balance, 0);
   }

   console.log(accounts.map(balanceLine).join("\n"));
   console.log(total(accounts));
   ```

2. Run `npm run check` and count the errors. How many different **causes** are there?
3. Fix it with **one** change, then run `npm run check` again.
4. Run `npm run build` and `npm start`.
5. Break one line again (for example `const amount: number = "5";`) and compare
   `npx tsc --noEmit` with `npx tsc --noEmit --pretty`. Then remove that line.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- Step 2: four errors, two `TS2353` and two `TS2339`, all about `balance`.
- Step 3: `npm run check` prints nothing.
- Step 4: `npm start` prints:

  ```text
  Ada: 250.50 EUR
  Grace: 40.00 EUR
  29050
  ```

- Step 5: `--pretty` adds the source line, a `~~~~~~` marker under the value and a final
  `Found 1 error in src/index.ts:<line>`.

### Mini Challenge

A teammate sends you this output and says "TypeScript is broken, I have six errors":

```text
src/cart.ts(12,9): error TS2339: Property 'quantity' does not exist on type 'CartLine'.
src/cart.ts(18,24): error TS2339: Property 'quantity' does not exist on type 'CartLine'.
src/cart.ts(25,11): error TS2339: Property 'quantity' does not exist on type 'CartLine'.
src/order.ts(7,14): error TS2339: Property 'quantity' does not exist on type 'CartLine'.
src/order.ts(9,3): error TS2554: Expected 2 arguments, but got 1.
src/order.ts(30,7): error TS18048: 'line' is possibly 'undefined'.
```

Answer in comments:

1. How many causes can you see, and which one would you fix first?
2. What would you ask them to run after that first fix, and why?
3. Which of the six errors is **not** about the renamed property, and what does each of those
   two mean?
4. They ask whether they should use `npm run build` or `npm run check` while fixing. What do
   you answer?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
