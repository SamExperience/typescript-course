# Publishing guide

Four times in this course you stop and build something in **your own public repository**:
after topics 05, 08, 12 and 17. Each project has a brief, `mini-project.md` in its folder,
that tells you *what* to build. This guide covers what all four have in common: where the
project goes, how to set it up, how to commit, and what "finished" means.

Read it once before mini-project 1. After that, come back for the checklists.

## Why bother

The notebooks give you a concept, an example and an exercise with a solution beside it.
That's the right way to learn, and it's also why nobody can tell from the outside whether
you understood anything.

A mini-project starts from an empty folder, with no starter code and no solution. It's where
you find out what you actually know, and it leaves a public record: a short, honest commit
history that shows you built it step by step.

## Core and Bonus

Every brief splits its requirements in two.

- **Core** is the project. Every Core requirement uses only concepts the course has already
  taught. Implement all of Core and the project is finished.
- **Bonus** is optional. Skipping it costs you nothing.

Do Core first, completely. A finished Core is a better repository than a half-built Core with
two bonus features.

## 1. Where the folder goes

**Beside the course, never inside it**, just like `ts-scratch`:

```text
your-projects-folder/
├── typescript-course/        this course: read here, never write here
├── ts-scratch/               your practice project from topic 02
├── ts-currency-converter/    mini-project 1
└── ...
```

Before writing any code, check where you are:

```bash
git rev-parse --show-toplevel
```

- `fatal: not a git repository`: correct, as long as you haven't run `git init` yet.
- A path ending in your project's name: correct, after `git init`.
- A path ending in `typescript-course`: **wrong**. You're inside the course. Move the folder
  out and start again.

## 2. Create the project

On github.com, create a **New repository** with the name the brief gives you. Make it
**Public** and add nothing: no README, no `.gitignore`, no license. Then, in the empty project
folder:

```bash
git init
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
npm init -y
npm install --save-dev --save-exact typescript@6.0.3
```

`git branch -M main` names the first branch `main`, so the first push works on any machine.

Then set the project up exactly as in topic 02:

- **`tsconfig.json`** from LESSON 7:

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

- **Scripts** in `package.json`: `"check": "tsc --noEmit"`, `"build": "tsc"` and
  `"start": "node dist/index.js"`.
- **`.gitignore`** with `node_modules` and `dist` on separate lines.
- **`src/index.ts`**, where your code starts.

Run `npm run check`, `npm run build` and `npm start` once before your first commit, so you
know the setup works.

## 3. The commit loop

Run this sequence for every commit:

```bash
git status          # what changed? Anything unexpected?
git diff            # read every changed line before staging it
git add .
git diff --staged   # a last look at what you're about to commit
npm run check       # no type errors in what you commit
git commit -m "feat: ..."
git push            # the first push on a new repo: git push -u origin main
```

If you ever see `node_modules/` or `dist/` in `git status`, stop and fix `.gitignore` before
committing.

**When to commit:** when one coherent change is finished and works. Every commit should leave
the project in a state where `npm run check` passes.

## 4. Commit messages

```text
feat:      new behavior
fix:       corrects something that behaved wrongly
refactor:  code reorganized, behavior unchanged
docs:      documentation only (README, comments)
chore:     setup, dependencies, configuration
```

Use the imperative mood, lowercase after the colon, and no full stop:

```text
GOOD                                          BAD
feat: convert amounts between currencies      update
fix: reject an unsupported currency pair      fix
docs: add README with setup steps             final version
```

## 5. Your project's README

Write it for someone who has never seen the project:

~~~markdown
# Project name

One line: what it does.

## Overview

2–4 lines: what it does and what it was for. Say plainly that it's a learning project.

## Features

- what the program does, one line each

## Technologies

- TypeScript 6.0.3, Node.js

## Getting started

```bash
npm install
npm run build
npm start
```

## What I learned

2–4 lines, in your own words.

## Example output

(paste what npm start prints)
~~~

The README describes the code that exists, not what you plan to add.

## 6. Before you call it finished

```text
[ ] every Core requirement in the brief is implemented
[ ] every item in the brief's "Done when" list is true
[ ] npm run check reports no errors
[ ] npm run build and npm start work from a clean clone (after npm install)
[ ] .gitignore covers node_modules and dist
[ ] README written, including example output
[ ] git status is clean, and everything is pushed
```

## 7. Have your project reviewed

Every brief comes with a `review-prompt.txt` in the same folder. When you believe the project
is finished (not before, and not instead of the checklist above), open a new session with an
AI assistant and paste three things: that prompt, the whole of `mini-project.md`, and your
code.

The brief goes in so the assistant judges your work against *this* project's requirements. It
checks Core first, treats Bonus as optional, names what's wrong without fixing it for you, and
stays inside what the course has taught.
