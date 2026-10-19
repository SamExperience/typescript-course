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

<!-- cell: code challenge-solution -->
// 1. "^6.0.3" allows any later 6.x version, such as 6.1.0. Two installs at different times
//    can end up with different compilers.
// 2. They ran a global tsc. Without npx, the terminal finds the globally installed
//    compiler, which can be any version.
// 3. With an exact version in package.json, every machine uses the same compiler, so a
//    type error on one machine is a type error on every machine.

<!-- cell: markdown -->
A newer compiler can report errors an older one didn't. Pinning the version keeps
"it compiles on my machine" true for the whole team.

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

<!-- cell: code challenge-solution -->
// 1. The problem is in invoice.ts, at line 12, column 7, and TS2345 is the kind of error
//    (a value of the wrong type passed to a parameter).
// 2. node removes the types and runs the file without checking them. Running without an
//    error proves nothing about types. Use npx tsc --noEmit invoice.ts to check.
// 3. node runs invoice.js, the old compiled output. The fix is only in invoice.ts until you
//    run npx tsc invoice.ts again.

<!-- cell: markdown -->
Compiling and running are separate steps, and so are checking and running. Each command
does one job.

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

<!-- cell: code challenge-solution -->
// 1. In Git: src/index.ts, package.json, package-lock.json and .gitignore.
//    Not in Git: dist/index.js and node_modules/, because both are generated.
// 2. The fix is lost. The build overwrites dist/index.js from src/index.ts, which still
//    has the bug. Fixes always go in src/.
// 3. No. The build script only names src/index.ts, so tsc compiles that file and nothing
//    else. Every new file would have to be added to the command.

<!-- cell: markdown -->
Question 3 is the reason for the next lesson: a `tsconfig.json` tells `tsc` which folder to
compile, so new files are picked up automatically.

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

<!-- cell: code challenge-solution -->
// 1. The script passes a file name while a tsconfig.json exists, and tsc doesn't allow
//    mixing the two ways of saying what to compile.
// 2. In dist/reports/daily.js. rootDir and outDir keep the folder structure: src/ maps to
//    dist/, so src/reports/ maps to dist/reports/.
// 3. Each extra error points to a place where the compiler would otherwise have to guess a
//    type. Fixing it now is cheaper than finding the bug at runtime.

<!-- cell: markdown -->
Your `ts-scratch` project now has the setup you'll reuse later: `src/`, `dist/`, a minimal
tsconfig, and `check`, `build` and `start` scripts.
