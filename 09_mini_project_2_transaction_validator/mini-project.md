# Mini-project 2 — Banking Transaction Validator

**Prerequisites:** topics 01 → 08 (LESSON 1-32).
**Repository to create:** `ts-transaction-validator` (public).
**Setup and Git:** [PUBLISHING_GUIDE.md](../PUBLISHING_GUIDE.md).

Your second TypeScript repository. It's a command-line program again: `npm start` reads a batch
of raw transaction records, validates them, and prints a report.

> This is a learning project. The data is invented, and nothing here is real banking software.

## Scenario

A small bank receives transaction records from a partner system every night. The records arrive
as raw JSON text, and the partner doesn't always send clean data: amounts can be written as
text, fields can be missing, and some records are simply wrong. Before anything is booked, the
bank needs a tool that separates valid transactions from invalid ones, explains every
rejection, and summarizes the valid ones.

## Objective

Model the different kinds of transactions precisely, turn untrusted input into typed data in
one place, and design small, fully typed functions that filter and total the results.

## Core requirements

Core is the project. Finish all of it and you're done.

- [ ] A Node.js + TypeScript project set up as in the Publishing guide (TypeScript `6.0.3`,
      strict `tsconfig.json`, `check`, `build` and `start` scripts, `.gitignore`).
- [ ] **At least three transaction types** modeled as discriminated data: for example a
      deposit, a withdrawal and a transfer. Every type shares some properties (such as an ID
      and an amount) and at least one type has a property the others don't (such as the
      recipient of a transfer).
- [ ] Type aliases for every domain type, and **at least one literal union** (for example the
      currency).
- [ ] An **enum** for the transaction status or category, used in the program's data or output.
- [ ] The raw input is a **JSON text** in the code, parsed with `JSON.parse` into a value typed
      `unknown`. It contains **at least eight records**, including at least three invalid ones
      with **different** problems.
- [ ] **One validation function** turns one raw record into a result type: either a valid,
      fully typed transaction or a failure with a clear reason. No other part of the program
      reads the raw data.
- [ ] Validation checks at least: the record has a known transaction type, the amount is a
      number greater than 0, and the currency is supported.
- [ ] At least **two filter functions** that select valid transactions by a criterion (for
      example by type, by currency, or above a minimum amount). **At least one filter receives
      its criterion as a function** described by a function type.
- [ ] A function that **calculates totals**: at least the total per currency of the valid
      transactions, rounded to 2 decimals.
- [ ] `npm start` prints a readable report: how many records were valid and invalid, the reason
      for every invalid record, the results of both filters, and the totals.

## Constraints

- Use only what LESSON 1-32 taught.
- **Not allowed:** classes, interfaces, generics, decorators, `import`/`export`, external
  libraries.
- **No `any`**, written or hidden, and no type assertions (`as`). The parsed data is `unknown`
  until the validation function has checked it.
- Every function has typed parameters and an **annotated return type**.
- The program must not crash on invalid records.
- One source file, `src/index.ts`, is enough. No files, network or user input.

## Starter data

You may use this raw text, change it, or write your own. It deliberately contains problems.

A hint about reading raw objects: the course hasn't taught how to check the properties of an
`unknown` object directly. Design your record format so each record is something you *can*
check with what you know. For example, a record can be a **tuple-like array** of primitives,
where `typeof` checks each position:

```typescript
const rawBatch: string = `[
  ["T-001", "deposit", 1200, "EUR"],
  ["T-002", "withdrawal", "80.50", "EUR"],
  ["T-003", "transfer", 250, "USD", "Grace Hopper"],
  ["T-004", "refund", 30, "EUR"],
  ["T-005", "withdrawal", -45, "EUR"],
  ["T-006", "deposit", 99.99, "JPY"],
  ["T-007", "transfer", 75, "EUR"],
  ["T-008", "deposit", 310.4, "USD"]
]`;

const parsedBatch: unknown = JSON.parse(rawBatch);
console.log(Array.isArray(parsedBatch));
```

`Array.isArray` is JavaScript: it checks at runtime whether a value is an array, and TypeScript
narrows the value to an array inside the check.

Two hints, so you don't get stuck on something the course hasn't covered:

- After `Array.isArray`, TypeScript knows you have an array but nothing about its elements, so
  reading `record[2]` gives you an unchecked value. Copy each field into a variable typed
  `unknown` first (`const amount: unknown = record[2];`), then check it with `typeof`. That
  keeps the "no `any`" rule honest.
- A `typeof` check only tells you that a value is a `string`, not that it's one of your
  currencies. To turn it into your literal union, compare it with each allowed value and return
  that value: inside `if (text === "EUR")`, TypeScript knows `text` is `"EUR"`.

## Done when

- [ ] `npm run check` reports no errors, and `npm run build` followed by `npm start` prints the
      report.
- [ ] Adding a new invalid record to the raw text makes it appear in the report with its
      reason, with no other code change.
- [ ] Searching the code for `any` and ` as ` finds nothing.
- [ ] Reading a property that only one transaction type has, without checking the type first,
      makes `npm run check` report an error. (Try it, then undo it.)
- [ ] Changing a filter's criterion function changes the filter result, with no change to the
      filter function itself.
- [ ] The Git history has at least five meaningful commits.

## Suggested commit history

```text
chore: set up TypeScript project
feat: model transaction types and currencies
feat: add raw batch and parse it as unknown
feat: validate raw records into a result type
feat: filter valid transactions
feat: calculate totals per currency
feat: print the validation report
docs: add README
```

## Bonus

Optional. Only use concepts from LESSON 1-32.

- Report a warning (not an error) for transactions above a large-amount threshold.
- Reject duplicate transaction IDs.
- Sort the invalid records by their reason in the report.
