<!-- cell: markdown -->
# TypeScript — Environment Setup

> **How this topic works**
>
> In this topic you install and run TypeScript in a real project, so most of the practice
> happens in a **terminal**, not in the notebook. Sections marked *Practice in the terminal*
> tell you exactly what to run and what you should see. Mini Challenges are still answered
> in the notebook.
>
> You'll build one small project, `ts-scratch`, and keep using it later in the course.
> Create it **beside** the course folder, never inside it:
>
> ```text
> your-projects-folder/
> ├── typescript-course/   this course
> └── ts-scratch/          your practice project
> ```

<!-- cell: markdown -->
## LESSON 4 — Node.js, npm and installing TypeScript

### Explanation

Real TypeScript projects run on **Node.js** and use **npm**, which you already know from the
JavaScript course. This course needs **Node.js 24 or later**.

TypeScript itself is an npm package called `typescript`. It contains the compiler, **`tsc`**.
Install it in each project like this:

```bash
npm install --save-dev --save-exact typescript@6.0.3
```

- `--save-dev`: the compiler is a development tool. Your running app doesn't need it.
- `--save-exact`: saves exactly `6.0.3` in `package.json`, not `^6.0.3`. Everyone on the
  project gets the same compiler, and therefore the same errors.
- `@6.0.3`: the version this course uses.

Run the project's compiler with **`npx`**, which uses the copy inside `node_modules`:

```bash
npx tsc --version
```

Avoid installing TypeScript globally (`npm install -g typescript`). A global `tsc` can be a
different version on every machine.

### Key Notes

- TypeScript is the npm package `typescript`; its compiler is `tsc`.
- Install it per project: `--save-dev --save-exact`.
- Run it with `npx tsc`, so you always use the project's version.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* Creating a project and installing TypeScript:

```bash
node --version
mkdir ts-scratch
cd ts-scratch
npm init -y
npm install --save-dev --save-exact typescript@6.0.3
npx tsc --version
```

`node --version` must print `v24` or higher. The last command prints `Version 6.0.3`. `package.json` now contains:

```json
"devDependencies": {
  "typescript": "6.0.3"
}
```

### Exercise

<!-- practice: terminal -->
*Practice in the terminal.*

1. Go to the folder that contains `typescript-course` (not inside it).
2. Create `ts-scratch`, initialize npm, and install TypeScript 6.0.3 as an exact dev
   dependency.
3. Open `package.json` and find where TypeScript was recorded.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
From inside `ts-scratch`, check all three:

- `npx tsc --version` prints `Version 6.0.3`.
- `package.json` lists `"typescript": "6.0.3"` under `devDependencies`, with no `^`.
- A folder `node_modules/typescript` exists.

### Mini Challenge

Answer in comments:

1. A teammate's `package.json` says `"typescript": "^6.0.3"`. What does the `^` allow npm to
   install?
2. Your teammate types `tsc --version` (without `npx`) and sees a different version from
   yours. What is the most likely reason?
3. Why is an exact, per-project version better for a team than a global install?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 5 — The compiler (`tsc`) and running TypeScript files

### Explanation

There are two ways to run a `.ts` file:

1. **Compile, then run.** `npx tsc price.ts` checks the file and writes `price.js` next to
   it. Then `node price.js` runs the JavaScript.
2. **Run directly.** `node price.ts` removes the types and runs the file. It does **not**
   check them.

To check without writing any files, add `--noEmit` ("emit" means "write output files"):

```bash
npx tsc --noEmit price.ts
```

**Watch out:** when `tsc` finds a type error, it reports the error **and still writes the
`.js` file**. Read the output before you run the result.

A type error looks like this:

```text
price.ts(6,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

`price.ts` is the file, `6` the line and `20` the column. `TS2345` is the error code, followed
by the message. If `tsc` prints nothing, there are no errors.

### Key Notes

- `npx tsc file.ts` checks the file and writes `file.js`, even when there are errors.
- `npx tsc --noEmit file.ts` only checks.
- `node file.ts` runs the file without checking it.
- Errors read as `file(line,column): error code: message`.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* A file `price.ts` in `ts-scratch`:

```typescript
function addVat(price: number) {
  return price * 1.22;
}

console.log(addVat(100));
console.log(addVat("100"));
```

```bash
npx tsc price.ts
```

```text
price.ts(6,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

`price.js` is written anyway. Both `node price.js` and `node price.ts` print `122` twice:
JavaScript turned `"100"` into a number, so the result looks right. The compiler reports the
call regardless, because a string is not what `addVat` expects.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal.* In `ts-scratch`, create `receipt.ts`:

```typescript
function formatTotal(amount: number) {
  return `Total: ${amount.toFixed(2)} EUR`;
}

console.log(formatTotal(25));
console.log(formatTotal("25"));
```

1. Run `npx tsc receipt.ts`. Which line and column does the error point to?
2. `receipt.js` was written anyway. Run `node receipt.js`. What happens?
3. Fix the second call so it passes the number `25`.
4. Check the fixed file with `npx tsc --noEmit receipt.ts`, then compile it and run it.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- `npx tsc --noEmit receipt.ts` prints nothing.
- After `npx tsc receipt.ts`, running `node receipt.js` prints:

```text
Total: 25.00 EUR
Total: 25.00 EUR
```

### Mini Challenge

Answer in comments:

1. What does `invoice.ts(12,7): error TS2345` tell you, even before you read the message?
2. A teammate says: "`node invoice.ts` ran without any error, so the types are fine." What's
   wrong with that reasoning?
3. You fixed a type error in `invoice.ts`, then ran `node invoice.js` without compiling
   again. The bug is still there. Why?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 6 — Basic project structure

### Explanation

Once a project has more than one file, give it a standard shape:

```text
ts-scratch/
├── src/            the TypeScript you write
│   └── index.ts
├── dist/           the JavaScript tsc generates
├── node_modules/   installed packages
├── package.json
└── .gitignore
```

- **`src/`** ("source") holds your `.ts` files. This is what you edit and commit.
- **`dist/`** ("distribution") holds the compiled `.js` files. `tsc` rewrites them on every
  build, so never edit them by hand.
- **`.gitignore`** lists `node_modules` and `dist`, because both are generated and can be
  recreated at any time.

`--outDir dist` tells `tsc` where to write the JavaScript. Put the long commands in
**npm scripts** in `package.json`:

```json
"scripts": {
  "build": "tsc src/index.ts --outDir dist",
  "start": "node dist/index.js"
}
```

Now `npm run build` compiles and `npm start` runs the result. Listing files in a command
gets awkward as the project grows. LESSON 7 fixes that with `tsconfig.json`.

### Key Notes

- `src/` is what you write; `dist/` is what `tsc` generates.
- Never edit or commit `dist/` or `node_modules/`.
- `--outDir dist` sets where compiled files go.
- npm scripts turn long commands into `npm run build` and `npm start`.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* With `src/index.ts`:

```typescript
function formatPrice(amount: number) {
  return `${amount.toFixed(2)} EUR`;
}

console.log(`Order total: ${formatPrice(42.5)}`);
```

and the two scripts above:

```bash
npm run build
npm start
```

`npm run build` creates `dist/index.js` and reports no errors. `npm start` prints:

```text
Order total: 42.50 EUR
```

### Exercise

<!-- practice: terminal -->
*Practice in the terminal.* Reorganize `ts-scratch`:

1. Delete the LESSON 5 files: `price.ts`, `price.js`, `receipt.ts` and `receipt.js`.
2. Create `src/index.ts` with the code from the Example.
3. Add the `build` and `start` scripts to `package.json`. Keep the existing `test` script.
4. Create `.gitignore` so Git ignores `node_modules` and `dist`.
5. Build and run the project.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- The project root contains no `.ts` or `.js` files. They all live in `src/` and `dist/`.
- `npm run build` creates `dist/index.js` with no errors.
- `npm start` prints `Order total: 42.50 EUR`.

### Mini Challenge

Answer in comments:

1. Which of these belong in Git? `src/index.ts`, `dist/index.js`, `node_modules/`,
   `package.json`, `package-lock.json`, `.gitignore`.
2. A teammate fixes a bug by editing `dist/index.js` directly. What happens to the fix after
   the next `npm run build`?
3. You add a second file, `src/report.ts`, and run `npm run build`. Is `dist/report.js`
   created? Why?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 7 — A first `tsconfig.json`

### Explanation

A **`tsconfig.json`** file in the project root holds the compiler's settings. Once it
exists, plain `npx tsc` compiles the whole project, with no file names needed.

This is all you need for now:

```json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "strict": true
  },
  "include": ["src"]
}
```

- **`include`**: which files to compile. Here, everything in `src/`.
- **`rootDir`** and **`outDir`**: where the source lives and where the JavaScript goes.
  `src/index.ts` becomes `dist/index.js`.
- **`strict`**: turns on the compiler's strictest checks. For example, a parameter without a
  type becomes an error. This course always uses strict mode.

The scripts get shorter too:

```json
"scripts": {
  "build": "tsc",
  "check": "tsc --noEmit",
  "start": "node dist/index.js"
}
```

Two things to know:

- With a `tsconfig.json` present, `npx tsc src/index.ts` fails with error **TS5112**. Use
  either file names or a tsconfig, not both.
- `npx tsc --init` generates a much longer tsconfig with many extra options. This course
  uses the short one above. Topic 10 explains the options properly.

### Key Notes

- `tsconfig.json` tells `tsc` what to compile and where to put the output.
- `include`, `rootDir` and `outDir` map `src/` to `dist/`.
- Keep `strict: true`.
- Run `npx tsc` without file names once a tsconfig exists.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* With the tsconfig and scripts above, and two files in `src/`:

```bash
npm run check
npm run build
```

`npm run check` reports no errors. `npm run build` compiles **every** file in `src/`, so
`dist/` now contains `index.js` and `report.js`. New files are picked up automatically.

### Exercise

<!-- practice: terminal -->
*Practice in the terminal.* In `ts-scratch`:

1. Create `tsconfig.json` with the settings from the Explanation.
2. Change the `build` script to `tsc` and add a `check` script.
3. Add `src/report.ts`:

   ```typescript
   function reportLine(label: string, amount: number) {
     return `${label}: ${amount.toFixed(2)} EUR`;
   }

   console.log(reportLine("Daily sales", 1280));
   ```

4. Run `npm run check` and `npm run build`, then `node dist/report.js`.
5. Remove `: number` from the `amount` parameter and run `npm run check`. Read the error, then
   put `: number` back.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- `npm run check` prints no errors (after step 5 is undone).
- After `npm run build`, `dist/` contains `index.js` and `report.js`.
- `node dist/report.js` prints `Daily sales: 1280.00 EUR`.
- In step 5, the error was:

```text
src/report.ts(1,36): error TS7006: Parameter 'amount' implicitly has an 'any' type.
```

### Mini Challenge

Answer in comments:

1. A teammate changes the `build` script back to `tsc src/index.ts` and gets error TS5112.
   Explain what went wrong in one sentence.
2. You add `src/reports/daily.ts`. Where does its compiled file end up?
3. Strict mode gives you more errors. Why is that a good thing?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
