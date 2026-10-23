<!-- cell: markdown -->
# TypeScript — Environment Setup

> **Solutions.** Open this only after you've genuinely tried the exercises in
> `lesson.ipynb`. In this topic most solutions are terminal commands.

<!-- cell: markdown -->
## LESSON 4 — Node.js, npm and installing TypeScript

### Exercise

<!-- practice: terminal -->
```bash
cd your-projects-folder
mkdir ts-scratch
cd ts-scratch
npm init -y
npm install --save-dev --save-exact typescript@6.0.3
```

TypeScript is recorded in `package.json` under `devDependencies`:

```json
"devDependencies": {
  "typescript": "6.0.3"
}
```

**Common mistakes**

- **Creating `ts-scratch` inside the course folder.** Your experiments get mixed with the
  course files. Move the folder next to `typescript-course`.
- **Forgetting `--save-exact`.** `package.json` then says `"^6.0.3"`. Run the install again
  with the flag.
- **Typing `tsc` instead of `npx tsc`.** Without `npx` you get a global `tsc` if one exists
  (possibly another version), or an error saying the command isn't found.

### Verification

<!-- practice: terminal -->
```bash
npx tsc --version
```

prints `Version 6.0.3`, and `node_modules/typescript` exists.

### Mini Challenge

<!-- practice: terminal -->
1. `npm view typescript version` prints `7.0.2` (or newer): npm's newest TypeScript is not
   the course version.
2. Without `--save-exact`, `package.json` says `"typescript": "^6.0.3"`. A future install
   could pick a later `6.x` compiler.
3. Install again with the flag:

   ```bash
   npm install --save-dev --save-exact typescript@6.0.3
   npx tsc --version
   ```

   `package.json` says `"6.0.3"` and `npx tsc --version` prints `Version 6.0.3`.

<!-- cell: markdown -->
## LESSON 5 — The compiler (`tsc`) and running TypeScript files

### Exercise

<!-- practice: terminal -->
1. `npx tsc receipt.ts` prints:

   ```text
   receipt.ts(6,25): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
   ```

   Line 6, column 25: the string `"25"` in the second call.

2. `node receipt.js` prints `Total: 25.00 EUR` once, then crashes with
   `TypeError: amount.toFixed is not a function`. A string has no `toFixed` method. The
   compiler warned you about exactly this before you ran anything.

3. and 4. The fixed `receipt.ts`:

   ```typescript
   function formatTotal(amount: number) {
     return `Total: ${amount.toFixed(2)} EUR`;
   }

   console.log(formatTotal(25));
   console.log(formatTotal(25));
   ```

   ```bash
   npx tsc --noEmit receipt.ts
   npx tsc receipt.ts
   node receipt.js
   ```

**Common mistakes**

- **Running `node receipt.js` right after fixing `receipt.ts`.** The old `receipt.js` still
  contains the bug. Compile again first.
- **Deleting the second call instead of fixing it.** The error disappears, but so does the
  second line of output.
- **Expecting `tsc` to refuse to write the file.** It writes `receipt.js` even with errors.

### Verification

<!-- practice: terminal -->
`npx tsc --noEmit receipt.ts` prints nothing, and `node receipt.js` prints
`Total: 25.00 EUR` twice.

### Mini Challenge

<!-- practice: terminal -->
1. `node invoice.ts` prints `60`: JavaScript turned `"25"` into a number. `node` removes the
   types and never checks them.
2. The check reports:

   ```text
   invoice.ts(5,31): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
   ```

3. The fixed call:

   ```typescript
   console.log(applyDiscount(80, 25));
   ```

   `npx tsc --noEmit invoice.ts` now prints nothing. Running without errors proves nothing
   about types: only `tsc` checks them.

<!-- cell: markdown -->
## LESSON 6 — Basic project structure

### Exercise

<!-- practice: terminal -->
The finished project:

```text
ts-scratch/
├── src/
│   └── index.ts
├── dist/
│   └── index.js     (created by npm run build)
├── node_modules/
├── .gitignore
├── package-lock.json
└── package.json
```

`package.json` scripts:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "tsc src/index.ts --outDir dist",
  "start": "node dist/index.js"
}
```

`.gitignore`:

```text
node_modules
dist
```

```bash
npm run build
npm start
```

**Common mistakes**

- **`"start": "node src/index.js"`.** There is no JavaScript in `src/`. The compiled file is
  in `dist/`.
- **Forgetting `--outDir dist`.** `tsc` writes `index.js` next to `index.ts` inside `src/`,
  mixing source and output again.
- **Running `npm start` before `npm run build`.** `dist/index.js` doesn't exist yet.

### Verification

<!-- practice: terminal -->
`npm run build` creates `dist/index.js`, and `npm start` prints `Order total: 42.50 EUR`.

### Mini Challenge

<!-- practice: terminal -->
1. `npm start` prints `TOTAL: 42.50 EUR`: it runs the edited `dist/index.js`.
2. After `npm run build`, `npm start` prints `Order total: 42.50 EUR` again. The build
   rewrote `dist/index.js` from `src/index.ts`, so the edit is gone.
3. Change the text in `src/index.ts`:

   ```typescript
   console.log(`TOTAL: ${formatPrice(42.5)}`);
   ```

   After `npm run build` and `npm start`, the change stays. Fixes always go in `src/`.
   Put `Order total` back before LESSON 7.

<!-- cell: markdown -->
## LESSON 7 — A first `tsconfig.json`

### Exercise

<!-- practice: terminal -->
`tsconfig.json`:

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

`package.json` scripts:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "build": "tsc",
  "check": "tsc --noEmit",
  "start": "node dist/index.js"
}
```

```bash
npm run check
npm run build
node dist/report.js
```

Step 5: without `: number`, strict mode can't accept a parameter whose type is unknown to
the compiler, so it reports TS7006 at line 1, column 36.

**Common mistakes**

- **Keeping `tsc src/index.ts` as the build script.** With a tsconfig present, that's error
  TS5112. The script must be just `tsc`.
- **Placing `tsconfig.json` inside `src/`.** It belongs in the project root, next to
  `package.json`.
- **Giving two files in `src/` a function with the same name.** Until you learn modules
  (topic 17), all files share one scope, so the compiler reports a duplicate. Use different
  names.

### Verification

<!-- practice: terminal -->
`npm run check` prints no errors, `dist/` contains `index.js` and `report.js`, and
`node dist/report.js` prints `Daily sales: 1280.00 EUR`.

### Mini Challenge

<!-- practice: terminal -->
1. and 2. The compiled file keeps the folder structure: `src/reports/daily.ts` becomes
   `dist/reports/daily.js`.

   ```bash
   npm run build
   node dist/reports/daily.js
   ```

   prints `Monday: 350.00 EUR`.

3. `npx tsc src/index.ts` prints:

   ```text
   error TS5112: tsconfig.json is present but will not be loaded if files are specified on commandline. Use '--ignoreConfig' to skip this error.
   ```

   With a tsconfig, run `npx tsc` without file names.

<!-- cell: markdown -->
Your `ts-scratch` project now has the setup you'll reuse later: `src/`, `dist/`, a minimal
tsconfig, and `check`, `build` and `start` scripts.
