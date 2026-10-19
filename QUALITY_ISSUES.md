# QUALITY_ISSUES — lessons-learned log

Every real defect found while building the course: what went wrong, why, how it was fixed,
and how to prevent it. **Review this file before starting each new unit** and check the new
unit against every "Prevention" line.

Structure and execution state live in `COURSE_PLAN.md` and `TASKS.md`, not here.

## Prevention checklist (summary of all entries below)

- [ ] Printed-output comments copied from the executed notebook, not guessed (QI-001).
- [ ] Every number, result or error message stated in prose was actually run (QI-002).
- [ ] Any rounding rule is exercised: at least one verification case has a raw result that
      differs from its rounded value, confirmed with node (QI-002 recurrences).
- [ ] Any number of `[to fix]` or demo errors mentioned in the text matches `check:nb` (QI-002).
- [ ] Verification never compares whole objects that students build themselves: `checkAll`
      uses `JSON.stringify`, so a different property order would fail a correct answer.
      Compare fields or derived strings instead (LESSON 32 design rule).
- [ ] Grammar-level errors (TS1005, TS1015, TS1016) are only shown in markdown, never in
      runnable cells, because they can stop a cell from running at all.
- [ ] Any "try the wrong thing" step ends by telling the student to undo it (QI-003).
- [ ] Each idea explained once; Key Notes add no new information; no infrastructure detail
      inside teaching text; lesson ≤ ~700 words (QI-004).
- [ ] Read-aloud English pass: plain verbs, no repeated words in adjacent sentences, no
      translated-sounding phrases (QI-005).
- [ ] Tools re-run after every tool edit; `node tools/self-test.mjs` after validator changes (QI-006).
- [ ] Text refers to code where it actually is ("the cell below", not "here") (QI-007).
- [ ] Files written with the Write tool or Node, never PowerShell `Set-Content` (QI-008).
- [ ] Verification uses one `checkAll([...])` call; every code cell has ≤ 3 `console.log`
      calls and none inside a loop (QI-009).
- [ ] Compiler messages quoted in comments are copied in full from `check:nb` output (QI-010),
      including cases where the compiler **expands a type alias** instead of naming it and
      reorders a union's members (LESSON 61).
- [ ] Every expected string in a Verification cell is copied from the verified reference run,
      and a Verification cell is never edited to make a solution pass (QI-019).
- [ ] Planted errors on names that don't exist (TS2662, TS2663, TS2304) live only in demo
      cells or markdown, never in starter code the Verification cell runs (QI-020).
- [ ] The Verification cell must also RUN against the untouched starter: never index into a
      result the starter returns empty (`f(x)[0].name`), and never read a property of a value
      the starter leaves `undefined` (QI-023).
- [ ] A planted error never changes a type other cells depend on (a broken interface, alias or
      class declaration): the Verification cell has to type-check against the starter (QI-022).
- [ ] American English spelling throughout: initialize, organize, modeling, behavior,
      color (QI-011).
- [ ] Long file paths inside fenced blocks use `<project>/...`-style placeholders, never `...`
      or `…` (Gate 1 rejects those as omissions; LESSON 35).
- [ ] No `...` inside code or code comments, not even as punctuation ("no return here..."):
      the validator treats it as an omission, and students can't tell the difference
      (caught by Gate 1 in LESSON 26).
- [ ] Every "the compiler reports nothing" claim is verified with the full scenario,
      including later calls that use the value (QI-016).
- [ ] Every "the compiler can't do X" claim is run against the pinned compiler too, not
      written from memory of an older TypeScript (QI-024).
- [ ] Before LESSON 23, don't call methods or properties directly on a literal or a `const`
      string/number in code that produces a quoted error: the message would show a literal
      type such as `'"receipt"'`. Use a `let` variable or a parameter (QI-015).
- [ ] A lesson never says a feature is the **only** way to do something without checking the
      utility types already taught. `ReturnType`/`Parameters` cover function types (QI-027).
- [ ] The Exercise text names the **starter cell's** identifiers, domain and expected
      strings — not the Example's. Read the two side by side before approving (QI-025).
- [ ] Every lesson's checkbox in TASKS.md is ticked **with** its two gate notes in the same
      edit; a built lesson with an unticked box means Gate 2 never happened (QI-026).
- [ ] Terminal commands and their output are run in a scratch project before they appear
      in a lesson (topic 02 practice, see COURSE_PLAN "Verified facts").

## Entries

### QI-027 — A Mini Challenge claimed a feature had no alternative when a taught one existed
- **Unit:** LESSON 78 (found by the user's sample review of topic 20)
- **Problem:** Mini Challenge question 4 asked "why is there no alternative?" and its answer said
  "There is no alternative because the object is the caller's, not yours". For a function type
  there *is* an alternative, and the course had already taught it: `ReturnType<F>` and
  `Parameters<F>[0]` (LESSON 60). The claim also contradicted LESSON 76, whose own challenge
  answer says "For a function result, use ReturnType — writing it again by hand is one more
  thing to keep correct", and the topic's `ai-prompt.txt`, which says `ReturnType` should be
  preferred to writing the pattern again by hand.
- **Cause:** the sentence conflated two different claims — *a computed type is unavoidable here*
  (true: you cannot edit the caller's object) and *you must write the `infer` pattern yourself*
  (false: the standard library already names it). The lesson is the last in the course and was
  written to close the topic, so the rhetorical ending was not re-checked against LESSON 60.
- **Fix:** the question now asks which feature does the work **and whether you should write the
  pattern out yourself**; the answer names `ReturnType<F>` and `Parameters<F>[0]` first, keeps
  a hand-written pattern for shapes the library does not name (as LESSON 76 says), and keeps the
  part that was right — the reason a *computed* type is needed at all. The exercise note now
  also says outright that `Parameters<L78Deposit>[0]` is what real code would use, so the
  exercise reads as practice rather than as advice. Verified with the pinned compiler
  (`claims-l78-q4.ts`): the hand-written pattern and `Parameters<L78Deposit>[0]` are assignable
  in both directions, `ReturnType<L78Deposit>` is `string`, and the library type still rejects
  a wrong payload shape.
- **Prevention:** before writing "there is no alternative", "the only way" or "you have to",
  check the prerequisite ledger for a utility type that already covers the case, and check what
  earlier lessons on the same feature concluded. A closing lesson is the most likely place for
  an overstated claim, because it is written to sound final.

### QI-026 — Seven lessons were built and validated but never given a Gate 2 record
- **Unit:** LESSON 50, 51, 55, 56, 62, 68, 70 (found by the whole-course final QA)
- **Problem:** `TASKS.md` still showed `- [ ]` for seven lessons, with no Gate 1 or Gate 2 note
  under them, even though all seven were written, built, and passing Gate 1 inside their
  topics. Nothing in the repository said whether their semantic review had ever been done.
- **Cause:** each of the seven is the **first or last lesson of its topic**. The checkbox and
  the evidence note were written as a separate step after the lesson, and at a topic boundary
  that step was skipped in favor of starting the next topic.
- **Fix:** all seven were reviewed properly at the end of the course — every quoted compiler
  message re-run through `check:nb`, every number re-run in node, and the terminal claims of
  LESSON 68 and 70 rebuilt in scratch projects. Six passed unchanged; LESSON 56 had a real
  defect (QI-025). The gate notes are now in `TASKS.md`.
- **Prevention:** a lesson is not finished when it builds — it is finished when its checkbox
  and both gate notes are in `TASKS.md`. Tick the box in the same edit as the note, before
  starting the next unit, and never let a topic boundary interrupt that.

### QI-025 — The exercise text described the Example's scenario, not the exercise's
- **Unit:** LESSON 56 (found by the whole-course final QA)
- **Problem:** the Exercise text asked for `l56Statement(account)` returning
  `"IT60 (Ada): 250.00 EUR"` and said "a missing nickname becomes the owner's name". The
  starter cell and the Verification cell are about **customers**: `l56Card(customer)` returning
  `"C-1 Ada (no email)"`, and a missing **email** becoming `"none@example.com"`. A student
  following the numbered steps would have looked for a function that does not exist.
- **Cause:** the exercise was drafted in the Example's domain (accounts) and the starter was
  later rewritten in a different one (customers) so as not to repeat the Example. The prose was
  not updated with it. No automated check can see this: the text is markdown, and both cells
  were internally consistent.
- **Fix:** the four numbered steps and the opening line now name `l56Update`, `l56Card` and
  `l56Fill`, the customer fields, and the exact strings the Verification cell expects.
- **Prevention:** read the Exercise text and the starter cell **side by side** as the last step
  of Gate 2, checking three things: every function named in the text exists in the cell, every
  quoted output string appears in the Verification cell, and every field name is the starter's.

### QI-024 — A "the compiler can't do this" claim was out of date
- **Unit:** LESSON 59 solutions (found while writing LESSON 65)
- **Problem:** a common-mistake bullet said that `entries.filter((entry) => entry.state !==
  "pending")` returns `L59Entry[]` because "a plain `filter` doesn't narrow". Against the pinned
  compiler it **does**: TypeScript infers a type predicate for a short unannotated callback, so
  the result is `L59Settled[]` and the claim was false.
- **Cause:** the claim came from older TypeScript knowledge and was never run. The `claims-*`
  file for that lesson tested `Exclude`/`Extract`, not the sentence in the solution.
- **Fix:** the bullet now states what the compiler really does and says when the inference stops
  (an annotated `: boolean` return type, or a callback with more than one statement) — verified
  in `claims-l59b.ts` and `claims-l65b.ts`, which also confirm that a named function annotated
  `: boolean` does not narrow while the same function without the annotation does.
- **Prevention:** a claim about what the compiler *cannot* do is a claim like any other and
  needs a line in a claims file. Language features change; the pinned compiler is the only
  authority.
- **Refinement (verified while writing LESSON 74, `claims-l74b.ts`):** the inference is
  narrower than "short unannotated callback". `values.filter((v) => v !== null)` narrows
  `(string | null)[]` to `string[]`, but `values.filter((v) => v !== null && v !== "")` does
  **not** — it still gives `(string | null)[]` (TS2322). One comparison against the parameter
  works; a compound condition does not. Never write a lesson example that relies on the
  compound form narrowing.

### QI-023 — The Verification cell crashed against the starter
- **Unit:** LESSON 55 (also the demo cell of the same lesson)
- **Problem:** a check read `l55ByAmount(l55Charges)[0].code`. The starter returns an empty
  list, so `[0]` is `undefined` and the cell threw
  `TypeError: Cannot read properties of undefined (reading 'code')` — no PASS/FAIL output at
  all, and Gate 1 also reported "checks do not fail against the untouched starter". The same
  run caught a demo cell calling `l55Describe("40.70")`, which throws for the same reason.
- **Cause:** the check was written against the solution's behavior only. Every Verification
  cell runs twice — once against the starter, once against the solution — and the starter
  returns empty lists and `undefined`s by design.
- **Fix:** the check now maps the sorted list into ids (empty in, empty out, FAIL not crash),
  and the demo's failing call moved inside a function nothing calls.
- **Prevention:** before building, read every check as if every helper returned `[]`,
  `undefined` or `0`. Compare whole derived values (a mapped list, a joined string) rather
  than indexing into them. This is QI-020 applied to the Verification cell itself.

### QI-022 — A planted error in a declaration broke the Verification cell
- **Unit:** LESSON 48 (also seen from the other side in LESSON 43 and LESSON 44)
- **Problem:** the starter declared `interface L48FeeMovement extends L48Movement { amount: string }`
  to plant TS2430. Because the interface is *used*, the bad `amount` spread through everything:
  4 `[to fix]` errors instead of 2, plus three `[error]`s inside the Verification cell
  (`Argument of type 'L48Statement[]' is not assignable to parameter of type 'L48Movement[]'`).
- **Cause:** the planted error was in a **declaration** (an interface) rather than in a
  statement. Every value and call that mentions that declaration inherits the damage, and the
  Verification cell must type-check against the untouched starter.
- **Fix:** the exercise now plants a missing property (TS2741) and a base-typed parameter
  reaching for a variant property (TS2339); the incompatible extension is demonstrated in the
  demo cell, where nothing depends on it.
- **Prevention:** plant errors in statements, not in the declarations other cells rely on
  (interfaces, type aliases, classes used by the Verification cell). Before building, ask:
  "does the Verification cell still type-check while this error is present?" The three trapped
  lessons — 43 (a non-extending starter), 44 (a wrong abstract implementation) and 48 — were
  all the same question.

### QI-021 — The ai-prompt check could be satisfied by the wrong section
- **Unit:** LESSON 42 (tooling: `validate.mjs`)
- **Problem:** Gate 1 requires the topic's `ai-prompt.txt` to mention every LESSON in the
  topic, but it searched the whole file. The prompt's "DO NOT INTRODUCE YET" block names the
  *later* lessons of the same topic, so the check passed for LESSON 42 while the prompt still
  listed it as something the tutor must not introduce.
- **Cause:** a substring search over the whole file, written before the prompt had a
  "not yet" section naming lessons from the same topic.
- **Fix:** the check now looks only at the text above "DO NOT INTRODUCE YET". Self-test
  10/10 and all nine built topics re-validated PASS.
- **Prevention:** when a rule says "the file must mention X", check *where* it may say it. A
  check that can be satisfied by the section that says the opposite is not a check.

### QI-020 — A planted "cannot find name" error crashed the starter at runtime
- **Unit:** LESSON 41 (lesson starter)
- **Problem:** the starter's `isAllowed` contained a bare `maxAmount` to produce TS2662. The
  Verification cell calls `isAllowed`, so the executed notebook threw
  `ReferenceError: maxAmount is not defined`, the cell produced no PASS/FAIL output at all, and
  Gate 1 reported both the crash and "checks do not fail against the untouched starter".
- **Cause:** a planted *type* error that is also a *runtime* error was placed in code the
  Verification cell executes.
- **Fix:** the starter keeps only errors that still run (`this.amount` in a static method
  evaluates to `undefined`); the TS2662 case moved to the demo cell, inside a static method
  nothing calls.
- **Prevention:** a planted error must leave the cell runnable. Errors on *names* that don't
  exist (TS2662, TS2663, TS2304) belong in a demo cell's uncalled method or in markdown, never
  in a starter method the Verification cell calls. Errors on *types* (TS2339, TS2322, TS2341,
  TS2540, TS2564, TS2576) are safe: they still evaluate, usually to `undefined`.

### QI-019 — Printed format drifted between the exercise text and the solution
- **Unit:** LESSON 40 (solutions)
- **Problem:** the exercise asks for `"IT60 EUR 1250.00 (open)"`, but the solution's template
  string added a second `EUR` (`IT60 EUR 1250.00 EUR (open)`) and its Verification cell was
  changed to match, so the solution "passed" against the wrong expectation.
- **Cause:** the template string was retyped from memory while writing the solution, instead
  of copied from the reference implementation that had already been run
  (`values-l40.mjs` printed the correct line).
- **Fix:** template string and both expected strings corrected; Gate 1 caught it through the
  "check cells must be identical in lesson and solutions" rule.
- **Prevention:** copy every expected string from the `values-*.mjs` run, never retype it. The
  identical-verification-cells rule is the safety net: if a Verification cell has to be edited
  to make a solution pass, the solution is wrong, not the cell.

### QI-001 — Printed output shown as a JavaScript literal
- **Unit:** LESSON 1 (lesson and solutions)
- **Problem:** comments and prose said a cell prints `"205"`; Deno's `console.log` prints `205`.
- **Cause:** the expected value was written as a JS literal instead of copying the real output.
- **Fix:** comments now show the printed text and say it is a string where that matters.
- **Prevention:** after Gate 1, read `tools/.tmp/executed/<topic>/*.ipynb` outputs and compare
  every `// prints` comment with the real output.

### QI-002 — Wrong arithmetic in a "Common mistakes" note
- **Unit:** LESSON 1 solutions
- **Problem:** the `parseInt` mistake claimed a total of `52.5`; the real total is `52`.
- **Cause:** only one of the three converted values was considered, computed mentally.
- **Fix:** corrected to `52`, with both converted values shown.
- **Prevention:** every numeric claim in prose is checked by running it (`node -e` or a scratch cell).
- **Recurrence (LESSON 19, caught before approval):** a common mistake claimed
  `100 * 1.08` is `108.00000000000001`; node prints exactly `108`, so an unrounded solution
  would have passed every check. Fixed with a verification case that needs rounding
  (`19.99 * 1.08` = `21.589199999999998`). Also check that each "you must round / convert /
  handle X" rule is actually exercised by at least one verification case.
- **Recurrence (LESSON 28, caught before approval):** the "total, rounded" check used
  `1500 - 900 - 86.45`, which is exactly `513.55` in JavaScript, so rounding was never tested,
  and a common mistake quoted a non-existent `513.5500000000001`. Candidate data sets were
  computed with node, and the statement now includes `-12.1` (raw `501.44999999999993`).
  **Prevention upgrade:** before writing any rounding rule, run the raw calculation for every
  verification case and confirm at least one raw result differs from its rounded value.
- **Related slip (LESSON 28):** the exercise text said "three `[to fix]` errors" while
  `check:nb` listed four (one object literal had two mistakes). Any count of errors stated in
  a lesson is copied from `check:nb` output.

### QI-003 — Experiment step left the student's code broken
- **Unit:** LESSON 1 exercise and Mini Challenge
- **Problem:** "try passing the string directly" had no instruction to undo it, so Verification
  or `check:nb` would then fail for the wrong reason.
- **Cause:** exploration steps were written without thinking about the next cell.
- **Fix:** added "put the conversion back" / "delete the reported calls".
- **Prevention:** every deliberate-mistake step ends with an undo instruction.

### QI-004 — Lesson too verbose
- **Unit:** LESSON 1 (user feedback after first approval)
- **Problem:** the same idea (running is not type checking; compiler finds errors early) was
  explained in the header, the Explanation, Key Notes and after the Example; setup detail
  appeared inside teaching text. ~925 words.
- **Cause:** optimising for completeness instead of scanability.
- **Fix:** LESSON 1 rewritten: short paragraphs, each idea once, infrastructure only in the
  notebook header.
- **Prevention:** explain once, then code. Key Notes = ≤ 5 short bullets restating, never
  extending. No background that doesn't help the exercise. Aim ≤ ~700 words; the validator
  warns above 800.

### QI-005 — Unnatural English phrasing
- **Unit:** LESSON 1
- **Problem:** "deals with types", "refuses that call", "only" repeated in adjacent sentences.
- **Cause:** first-draft wording not read aloud.
- **Fix:** "looks at types", "reports an error for that call", sentences rephrased.
- **Prevention:** dedicated read-aloud pass in Gate 2; prefer the course's standard verbs:
  the compiler *reports* an error; the code *runs*; a type *allows*/*rejects* a value.

### QI-006 — Validator crashed (temporal dead zone, then duplicate declaration)
- **Unit:** `tools/validate.mjs`
- **Problem:** `report()` read `totalLessons` before its `const` declaration; the first fix
  then declared it twice.
- **Cause:** early-exit path added without re-running the script.
- **Fix:** single `let totalLessons = 0` at the top, assignment later.
- **Prevention:** run the tool after every edit to it; run `node tools/self-test.mjs` after any
  validator change.

### QI-007 — Text pointed at code in the wrong place
- **Unit:** LESSON 1 Mini Challenge
- **Problem:** "Here are two functions" but the functions were in the cell below.
- **Cause:** text drafted before the cell layout was final.
- **Fix:** "The cell below defines two functions".
- **Prevention:** final Gate 2 pass reads the built notebook order, not the draft.

### QI-008 — PowerShell wrote a BOM into JSON
- **Unit:** infrastructure (scratch notebook test)
- **Problem:** `Set-Content -Encoding utf8` (Windows PowerShell 5.1) added a BOM; nbconvert
  could not read the notebook.
- **Cause:** PowerShell 5.1 encoding defaults.
- **Fix:** files written with the Write tool.
- **Prevention:** never create course files through PowerShell redirection or `Set-Content`.

### QI-009 — Deno kernel dropped output lines
- **Unit:** LESSON 2 verification (both notebooks); affects any cell
- **Problem:** a verification cell with 8 `check(...)` calls showed only 4 lines after
  execution. A scratch test printing 10 lines in a loop lost 3–5 lines, differently on each
  run; one `console.log` of a joined string, or a cell ending with an `await`, lost nothing.
  Lost FAIL lines could let a broken lesson pass Gate 1, and students could miss output.
- **Cause:** the Deno kernel reports the cell as finished before all stdout messages are
  sent; Jupyter clients ignore messages that arrive after that.
- **Fix:** helper replaced by `checkAll([...])`, which prints every result in one
  `console.log`. Validator now fails a code cell with more than 3 `console.log` calls or a
  `console.log` inside a loop.
- **Prevention:** one `checkAll` per Verification cell; examples print at most 3 values
  (combine values into one template string when more are needed); no printing inside loops.

### QI-010 — Compiler message quoted incompletely
- **Unit:** LESSON 2 example
- **Problem:** the comment quoted the misspelled-property error without its
  "Did you mean 'total'?" hint.
- **Cause:** message written from memory.
- **Fix:** comment copied from `check:nb` output.
- **Prevention:** after Gate 1, run `npm run check:nb` on the lesson and compare every quoted
  compiler message word for word.
- **Recurrence (LESSON 16, caught before approval):** a Mini Challenge answer claimed the
  compiler "suggests name" for `l16Product.nmae`; the real TS2339 message has no
  "Did you mean" hint. Paraphrased descriptions of messages (hints, suggestions, codes) need
  the same check as quoted ones.

### QI-011 — Mixed British and American spelling
- **Unit:** LESSON 4 ("initialise"); the roadmap and earlier lessons use American spelling
  ("modeling")
- **Problem:** inconsistent spelling across the course.
- **Cause:** no spelling convention recorded.
- **Fix:** "initialize". Convention: American English.
- **Prevention:** in the language review, scan for -ise/-isation, -our, "modelling",
  "behaviour", "colour", "centre".

### QI-012 — Error position written before the experiment ran
- **Unit:** LESSON 7 (lesson Verification and solutions)
- **Problem:** the TS7006 error was quoted at column 33; the real compiler output is column 36.
- **Cause:** lesson text was drafted in parallel with the experiment script, and the column
  was estimated instead of copied (QI-002 prevention not applied).
- **Fix:** column corrected to 36 in both notebooks after reading the experiment output.
- **Prevention:** when drafting in parallel with an experiment, mark every exact output
  (line/column, printed text, file lists) as provisional, and compare each one against the
  experiment output before Gate 2 approval. Never approve a terminal lesson until its
  experiment has run.

### QI-018 — Tilde underline parsed as a markdown fence
- **Unit:** LESSON 37 (tooling: `validate.mjs`, `check-notebook.mjs`)
- **Problem:** Gate 1 reported LESSON 37 as having only an `Explanation` section. The lesson
  quotes `tsc --pretty` output, which contains a `~~~~~~` underline; the fence regex accepted
  `~~~` as a fence marker, so the parser thought everything after it was inside a code block.
- **Cause:** the fence regex allowed both backtick and tilde fences, but tilde lines also occur
  as content in compiler output.
- **Fix:** both tools now treat only backtick lines as fences; the convention is recorded in
  `COURSE_PLAN.md` §6. Self-test 10/10, all earlier topics re-validated.
- **Prevention:** when a lesson quotes tool output, check that the output can't contain markdown
  syntax the tools interpret. A structural failure in a lesson that looks correct is a tooling
  suspect, not only a content suspect.

### QI-017 — Compiler behavior assumed from a similar experiment
- **Unit:** LESSON 36 (terminal lesson)
- **Problem:** three claims were written from an earlier, slightly different experiment: the
  example's error lines and order, the message for `noUncheckedIndexedAccess` (TS18048 instead
  of the real TS2532 / TS2345), and `noUnusedLocals` reporting a top-level variable (it doesn't,
  in a file without `export`).
- **Cause:** the experiment used a longer file and a different usage of the indexed element, so
  line numbers and messages differed from the lesson's own code.
- **Fix:** re-ran the experiment with the lesson's exact files (`exp-l36b`, `exp-l36c`) and
  corrected all three; the exercise now declares the unused variable inside a function.
- **Prevention:** experiments must use the **exact** code the lesson prints, in the same file
  layout. When a message depends on how a value is used, state both variants.

### QI-013 — Garbled cross-reference in a solution
- **Unit:** LESSON 10 solutions
- **Problem:** the closing note said "Topic 02 of LESSON 11 looks at more of these limits",
  which mixes a topic number with a lesson number and makes no sense.
- **Cause:** a sentence was edited halfway while drafting and not re-read.
- **Fix:** "LESSON 11 looks at more of these limits."
- **Prevention:** every forward or backward reference names exactly one thing, either
  "LESSON N" or "topic NN", and is checked against the topic map in `COURSE_PLAN.md`.

### QI-014 — A verification command silently checked nothing
- **Unit:** LESSON 10 Gate 2 (tooling)
- **Problem:** a PowerShell check meant to prove "the emitted JavaScript is identical"
  printed an empty result, because `-eq` on multi-line command output compares arrays
  element by element instead of returning true or false.
- **Cause:** captured external-command output was compared as if it were a single string.
- **Fix:** re-run with `Get-Content -Raw` and `[string]::Equals`, which printed
  `identical: True`.
- **Prevention:** a check must print an explicit `True`/`False` or PASS/FAIL. An empty or
  missing result counts as "not verified", never as success.
- **Recurrence (LESSON 11 and LESSON 21):** `node -e` commands containing quotes were broken
  by PowerShell quoting. Once, some prints silently disappeared. The second time, the command
  failed to parse. Runtime checks that contain quotes now go into a scratch `.mjs` file that
  is run with `node <file>`.

### QI-015 — Quoted error message exposed a literal type too early
- **Unit:** LESSON 15 example (demo cell)
- **Problem:** the comment quoted `Property 'lenght' does not exist on type 'string'`, but
  `"receipt".lenght` really reports `on type '"receipt"'`: a literal type, which is only taught
  in LESSON 23. The quote was wrong (QI-010 again) and the real message used an untaught
  concept.
- **Cause:** the property was accessed directly on a string literal, and the comment was
  written before reading the `check:nb` output.
- **Fix:** the text is stored in `let l15Title = "Receipt"`, whose type is `string`, so the
  message matches the comment. The fixed example uses `l15Title.length`.
- **Prevention:** until LESSON 23, demo and exercise errors involving strings or numbers use
  `let` variables or parameters, never literals or `const` values. Always compare quoted
  messages against `check:nb` output before approval (QI-010).

### QI-016 — "The compiler says nothing" claim was wrong
- **Unit:** LESSON 18 solutions (common mistakes)
- **Problem:** the solution claimed that leaving the empty `l18Withdrawals` array unannotated
  means the string "is never reported". In fact the array's type becomes
  `(string | number)[]`, and passing it to the `number[]` parameter is reported (TS2345). The
  message also shows union syntax, which isn't taught until LESSON 22.
- **Cause:** only the `push` line was reasoned about, not the later call that uses the array.
- **Fix:** the common mistake now says the error moves to the call, explains
  `(string | number)[]` in plain words with a forward reference, and links back to LESSON 14.
  The tutor prompt got a matching misconception entry.
- **Prevention:** every "not reported" or "silent" claim is checked in a claims file that
  includes the complete scenario the student will actually run, including later calls that
  use the value. When a likely student path produces a message with untaught syntax, explain
  that message in the solutions and the tutor prompt.
- **Recurrence (LESSON 20 demo, caught before approval):** the demo's type included
  `phone?: string`, so the `[expected]` message students are told to study printed
  `phone?: string | undefined`. The optional property wasn't needed for the demo and was
  removed; the tutor prompt now explains how messages display optional properties. Keep
  demo types minimal: only the properties the demo is about.
- **Recurrence (LESSON 27 Mini Challenge solution, caught before approval):** the answer claimed
  that with one `channel: string` variant, reading `phone`, `address` or `deviceId` would all be
  reported. The pinned compiler reports only `phone` and `deviceId`; `address` belongs to the
  loose variant itself. Answers that predict "everything is reported" need the same claims
  check as answers that predict silence.
