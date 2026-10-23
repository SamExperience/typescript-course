<!-- cell: markdown -->
# TypeScript — Environment Setup

> **How this topic works**
>
> You practise in a **terminal**, not in the notebook. You'll build one small project,
> `ts-scratch`, and reuse it later. Create it **beside** the course folder, never inside it:
>
> ```text
> your-projects-folder/
> ├── typescript-course/   this course
> └── ts-scratch/          your practice project
> ```

<!-- cell: markdown -->
## LESSON 4 — Node.js, npm and installing TypeScript

### Explanation

TypeScript projects run on **Node.js** and use **npm**, which you know from the JavaScript
course. This course needs **Node.js 24 or later**.

The TypeScript **compiler** is called **`tsc`**. It checks your types and turns `.ts` files
into `.js` files. That second step is called **compiling**. `tsc` comes in the npm package
`typescript`, and you install it in each project:

```bash
npm init -y
npm install --save-dev --save-exact typescript@6.0.3
```

- `npm init -y` creates `package.json`, the project's ID card. `-y` accepts every default.
- `npm install` downloads the package into the **`node_modules`** folder.
- `--save-dev` records it under **`devDependencies`**: tools you need while you write code,
  not when the app runs.
- `@6.0.3` is the version this course uses.
- `--save-exact` saves exactly `"6.0.3"`. Without it npm saves `"^6.0.3"`, and the `^` lets
  npm install any later `6.x` version.

Why an exact version? npm's newest TypeScript is already 7, and different versions can
report different errors. With the same version, everyone sees the same errors.

Run the compiler with **`npx tsc`**. `npx` uses the copy in `node_modules`. A plain `tsc`
could find a different version installed globally on your computer.

### Key Notes

- `tsc` checks types and compiles `.ts` into `.js`.
- Install it per project with `--save-dev --save-exact`.
- Always run it as `npx tsc`.

### Example

<!-- practice: terminal -->
*Practice in the terminal:*

```bash
node --version
mkdir ts-scratch
cd ts-scratch
npm init -y
npm install --save-dev --save-exact typescript@6.0.3
npx tsc --version
```

`node --version` prints `v24` or higher, and the last command prints `Version 6.0.3`.
`package.json` now contains:

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
From inside `ts-scratch`:

- `npx tsc --version` prints `Version 6.0.3`.
- `package.json` lists `"typescript": "6.0.3"` under `devDependencies`, with no `^`.
- The folder `node_modules/typescript` exists.

### Mini Challenge

<!-- practice: terminal -->
*Practice in the terminal.* See the `^` for yourself:

1. Run `npm view typescript version`. It prints npm's newest TypeScript.
2. Run `npm install --save-dev typescript@6.0.3` (without `--save-exact`) and look at
   `package.json`.
3. Fix it so `package.json` says `"6.0.3"` again, then check with `npx tsc --version`.

<!-- cell: markdown -->
## LESSON 5 — The compiler (`tsc`) and running TypeScript files

### Explanation

There are two ways to run a `.ts` file:

1. **Compile, then run.** `npx tsc price.ts` checks the file and writes `price.js` next to
   it. Then `node price.js` runs that JavaScript.
2. **Run directly.** `node price.ts` removes the types and runs the file. It does **not**
   check them.

To check without writing any file, add `--noEmit` ("emit" means "write output files"):

```bash
npx tsc --noEmit price.ts
```

**Watch out:** when `tsc` finds a type error, it reports it **and still writes the `.js`
file**. Read the output before you run the result.

A type error looks like this:

```text
price.ts(6,20): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

File `price.ts`, line `6`, column `20`. `TS2345` is the error code, then the message. If
`tsc` prints nothing, there are no errors.

### Key Notes

- `npx tsc file.ts` checks and writes `file.js`, even when there are errors.
- `npx tsc --noEmit file.ts` only checks.
- `node file.ts` runs without checking.

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

`price.js` is written anyway, and `node price.js` prints `122` twice: JavaScript turned
`"100"` into a number. The result looks right, but `addVat` expects a number, so the
compiler reports the call.

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
- After `npx tsc receipt.ts`, `node receipt.js` prints:

```text
Total: 25.00 EUR
Total: 25.00 EUR
```

### Mini Challenge

<!-- practice: terminal -->
*Practice in the terminal.* Create `invoice.ts`:

```typescript
function applyDiscount(price: number, percent: number) {
  return price - (price * percent) / 100;
}

console.log(applyDiscount(80, "25"));
```

1. Run `node invoice.ts`. It prints `60` with no complaint.
2. Run `npx tsc --noEmit invoice.ts`. Now the error appears.
3. Fix the call, and run the check again until it prints nothing.

<!-- cell: markdown -->
## LESSON 6 — Basic project structure

### Explanation

With more than one file, give the project a standard shape:

```text
ts-scratch/
├── src/                the TypeScript you write
│   └── index.ts
├── dist/               the JavaScript tsc generates
├── node_modules/       installed packages
├── package.json
├── package-lock.json
└── .gitignore
```

- **`src/`** ("source"): your `.ts` files. This is what you edit.
- **`dist/`** ("distribution"): the compiled `.js` files. `tsc` rewrites them on every build,
  so never edit them by hand.
- **`package-lock.json`**: written by npm. It records the exact version of every installed
  package. Keep it in Git.
- **`.gitignore`**: lists `node_modules` and `dist`. Both are generated, so they stay out of
  Git.

`--outDir dist` tells `tsc` where to write the JavaScript. Save the long commands as
**npm scripts** in `package.json`:

```json
"scripts": {
  "build": "tsc src/index.ts --outDir dist",
  "start": "node dist/index.js"
}
```

Now `npm run build` compiles and `npm start` runs the result. Note that `build` names one
file only: LESSON 7 fixes that with `tsconfig.json`.

### Key Notes

- `src/` is what you write; `dist/` is what `tsc` generates.
- Never edit `dist/`. Keep `dist/` and `node_modules/` out of Git.
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

`npm run build` creates `dist/index.js` with no errors. `npm start` prints:

```text
Order total: 42.50 EUR
```

### Exercise

<!-- practice: terminal -->
*Practice in the terminal.* Reorganize `ts-scratch`:

1. Delete the LESSON 5 files: `price.ts`, `price.js`, `receipt.ts`, `receipt.js` and
   `invoice.ts`.
2. Create `src/index.ts` with the code from the Example.
3. Add the `build` and `start` scripts to `package.json`. Keep the existing `test` script.
4. Create `.gitignore` so Git ignores `node_modules` and `dist`.
5. Build and run the project.

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- The project root has no `.ts` or `.js` files. They live in `src/` and `dist/`.
- `npm run build` creates `dist/index.js` with no errors.
- `npm start` prints `Order total: 42.50 EUR`.

### Mini Challenge

<!-- practice: terminal -->
*Practice in the terminal.* Prove that edits to `dist/` get lost:

1. In `dist/index.js`, change `Order total` to `TOTAL`, then run `npm start`.
2. Run `npm run build`, then `npm start` again. Where did your edit go?
3. Make the same change the right way, in `src/index.ts`, and rebuild.

<!-- cell: markdown -->
## LESSON 7 — A first `tsconfig.json`

### Explanation

A **`tsconfig.json`** file in the project root holds the compiler's settings. Once it
exists, a plain `npx tsc` compiles the whole project, with no file names.

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
  `src/index.ts` becomes `dist/index.js`, and subfolders are kept.
- **`strict`**: turns on the strictest checks. For example, a parameter with no type is an
  error, because the compiler would have to give it type **`any`**, which means "any value,
  not checked". This course always uses strict mode.

The scripts get shorter:

```json
"scripts": {
  "build": "tsc",
  "check": "tsc --noEmit",
  "start": "node dist/index.js"
}
```

Two things to know:

- With a `tsconfig.json` present, `npx tsc src/index.ts` fails with error **TS5112**. Use
  file names or a tsconfig, not both.
- `npx tsc --init` generates a much longer tsconfig. This course uses the short one above.
  Topic 10 explains the options.

### Key Notes

- `tsconfig.json` tells `tsc` what to compile and where to put the output.
- Keep `strict: true`.
- With a tsconfig, run `npx tsc` without file names.

### Example

<!-- practice: terminal -->
*Practice in the terminal.* With the tsconfig and scripts above, and two files in `src/`:

```bash
npm run check
npm run build
```

`npm run build` compiles **every** file in `src/`: `dist/` gets `index.js` and `report.js`.
New files are picked up automatically.

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

<!-- practice: terminal -->
*Practice in the terminal.*

1. Create `src/reports/daily.ts`:

   ```typescript
   function dailyLine(day: string, amount: number) {
     return `${day}: ${amount.toFixed(2)} EUR`;
   }

   console.log(dailyLine("Monday", 350));
   ```

2. Run `npm run build`. Find the compiled file in `dist/` and run it with `node`.
3. Run `npx tsc src/index.ts` and read the error code.
