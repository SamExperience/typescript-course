# Mini-project 1 — Currency Converter & Account Balance

**Prerequisites:** topics 01 → 05 (LESSON 1-20).
**Repository to create:** `ts-currency-converter` (public).
**Setup and Git:** [PUBLISHING_GUIDE.md](../PUBLISHING_GUIDE.md).

Your first TypeScript repository. It's a small command-line program: no web page, no user
input. All the data lives in the code, and `npm start` prints the results.

> This is a learning project. The exchange rates are fixed sample values, and nothing here is
> real banking software.

## Scenario

A small bank wants a utility that shows a customer's account at a glance. The customer keeps
their account in their home currency but often pays in other currencies. The utility must
show the current balance, convert amounts between the currencies the bank supports, and tell
whether the balance covers a payment, even when the payment is in a different currency.

## Objective

Model the customer, their transactions and the bank's exchange rates with TypeScript's basic
types, and write small, fully typed functions that calculate and display the results.

## Core requirements

Core is the project. Finish all of it and you're done.

- [ ] A Node.js + TypeScript project set up as in the Publishing guide: TypeScript `6.0.3`
      installed as an exact dev dependency, the strict `tsconfig.json` from LESSON 7, the
      `check`, `build` and `start` scripts, and a `.gitignore`.
- [ ] A **customer profile** stored as a typed object with at least: a customer ID, a full
      name and a home currency code (such as `"EUR"`), plus **at least one optional detail**
      (for example an email address or a phone number).
- [ ] The customer's **transactions** stored as a typed array of amounts in the home currency:
      positive for money in, negative for money out. At least five transactions.
- [ ] The **current balance** is calculated from the transactions, never typed in by hand.
- [ ] A **fixed exchange-rate table** where each rate is a **readonly tuple** of: currency
      from, currency to, and rate. At least three currency pairs, including both directions
      of at least one pair.
- [ ] A function that **converts an amount** between two currencies using the table, rounded to
      2 decimals. Converting a currency to itself returns the same amount. An **unsupported
      pair** must not crash the program and must be clearly reported in the output.
- [ ] A function that **checks whether the balance covers a payment**. The payment has an
      amount and a currency, which may differ from the home currency. A payment in an
      unsupported currency is never covered.
- [ ] `npm start` prints a readable summary with: the customer's name, the current balance
      with its currency, **at least two conversions** (at least one supported and one
      unsupported), and **at least two payment checks** (at least one covered and one not
      covered).

## Constraints

- Use only what LESSON 1-20 taught.
- **Not allowed:** classes, interfaces, type aliases (`type X = ...`), enums, union types
  (`|`), generics, `any`, `import`/`export`, external libraries.
- Every function parameter has a type annotation, and `npm run check` reports no errors.
- Every function always returns the **same type** of value, for example always a `number`.
  Don't return a number in one case and `null` or a string in another.
- The exchange-rate table can't be changed by the code: assigning to a rate must be a
  compiler error.
- No user input, files or network requests. One source file, `src/index.ts`, is enough.
- Keep it small. This is not a banking system.

## Starter data

You may use these sample values, change them, or invent your own. They are plain values: the
types are your job.

```typescript
const sampleCustomer = { id: "C-1001", fullName: "Ada Lovelace", homeCurrency: "EUR", email: "ada@example.com" };

const sampleTransactions = [1200, -45.5, -300, 250, -89.99];

const sampleRates = [
  ["EUR", "USD", 1.08],
  ["USD", "EUR", 0.93],
  ["EUR", "GBP", 0.85],
  ["GBP", "EUR", 1.17],
];

console.log(sampleCustomer.fullName, sampleTransactions.length, sampleRates.length);
```

## Done when

- [ ] `npm run check` reports no errors, and `npm run build` followed by `npm start` prints the
      summary.
- [ ] Changing one rate in the table changes the printed conversion, with no other code edits.
- [ ] Adding a new currency pair needs exactly one new entry in the table.
- [ ] Adding the line `rates[0][2] = 2;` (or the equivalent for your table's name) makes
      `npm run check` report an error. Remove the line afterwards.
- [ ] Deleting the optional detail from the customer data still compiles.
- [ ] The Git history has at least four meaningful commits.

## Suggested commit history

This is a guide, not a rule:

```text
chore: set up TypeScript project
feat: add customer profile and transactions
feat: calculate the current balance
feat: add exchange-rate table and conversion
feat: check whether the balance covers a payment
feat: print the account summary
docs: add README
```

## Bonus

Optional. Only use concepts from LESSON 1-20.

- Print every transaction converted into a second currency.
- Report a payment amount of zero or less as invalid.
- Format every printed amount with 2 decimals and its currency code.
