# Mini-project 3 — Banking Accounts & Loans Management System

**Prerequisites:** topics 01 → 12 (LESSON 1-50).
**Repository to create:** `ts-banking-accounts` (public).
**Setup and Git:** [PUBLISHING_GUIDE.md](../PUBLISHING_GUIDE.md).

Your third TypeScript repository, and the first one built out of classes. `npm start` opens a
few products for two customers, runs a handful of operations on them, and prints a statement.

> This is a learning project. The data is invented, and nothing here is real banking software.

## Scenario

A small bank offers three products: a savings account, a credit card and a loan. They have
things in common — every product belongs to a customer, has an identifier, and can say what it
is worth today — and things that are entirely their own: a savings account earns interest, a
card has a spending limit and charges a fee, a loan is paid back.

The bank wants one small program that models these products properly, so that the shared parts
are written once, each product keeps its own rules, and no code outside a product can put it
into an impossible state.

## Objective

Design a small domain with interfaces and classes: contracts for what products have in common,
an inheritance chain where the products really are variations of one thing, a part held by
composition where they are not, and access modifiers that make the invariants impossible to
break from outside.

## Core requirements

Core is the project. Finish all of it and you're done.

- [ ] A Node.js + TypeScript project set up as in the Publishing guide (TypeScript `6.0.3`,
      strict `tsconfig.json`, `check`, `build` and `start` scripts, `.gitignore`).
- [ ] **At least two interfaces** describing contracts that more than one product satisfies.
      One of them covers what every product has in common; another covers something only some
      products do (for example earning or charging interest).
- [ ] **An abstract class** for what all products share, with at least one `abstract` member
      that each product has to answer for itself.
- [ ] **Three product classes** — a savings or deposit account, a credit card, and a loan —
      each extending the shared base and implementing the interfaces that apply to it.
- [ ] **Basic operations** on the products: at least depositing and withdrawing, charging and
      repaying, and paying off. Every operation refuses impossible input (an amount of `0` or
      less, a withdrawal above the balance, a charge above the limit) and says so in its
      return value rather than throwing.
- [ ] **Basic interest**: a yearly rate applied to the products that have one, with every money
      value rounded to 2 decimals.
- [ ] **Access modifiers that mean something**: the stored amounts are `private`, the identity
      of a product (its id, its owner) is `readonly`, and anything the outside needs to read is
      reached through a method or a getter.
- [ ] **One thing held by composition**: a small part a product *has* rather than *is* — for
      example a fee rule that decides what a card charges, described by an interface, so that
      two cards can behave differently without a second card class.
- [ ] **At least one `static` member** where it genuinely belongs to the class rather than to
      one product (a bank-wide constant, or a count of products opened).
- [ ] `npm start` prints a readable statement: one line per product with its owner and its
      current value, the interest applied, and a total.

## Constraints

- Use only what LESSON 1-50 taught.
- **Not allowed:** generics, `import`/`export`, decorators, external libraries, a database or
  any kind of backend.
- **No `any`**, written or hidden, and no type assertions (`as`).
- Every method has typed parameters and an **annotated return type**.
- No operation throws; an impossible operation is refused and reported by its result.
- One source file, `src/index.ts`, is enough. No files, network or user input.
- Keep the domain small. Three products, two customers, a handful of operations.

## Starter data

You may use these numbers, change them, or invent your own. They are chosen so that rounding
actually matters.

```typescript
type Currency = "EUR" | "USD";

const bankCurrency: Currency = "EUR";

const openingData = {
  savings: { id: "SA-1", owner: "Ada Lovelace", opening: 2400, yearlyRatePercent: 1.5 },
  card: { id: "CC-1", owner: "Ada Lovelace", limit: 1500, feePercent: 1.5, minimumFee: 0.5 },
  loan: { id: "LN-1", owner: "Grace Hopper", principal: 8000, yearlyRatePercent: 6.5 },
};

console.log(`${openingData.savings.id} in ${bankCurrency}`);
```

Operations worth running in `npm start`, because they exercise the rules:

- a deposit of `249.95` into the savings account, then a withdrawal of `5000` (refused);
- a card charge of `120.50` (the fee is `1.81`, not `1.8075`), then a charge of `100000`
  (refused);
- a loan payment of `1500`, then the yearly interest.

## Done when

- [ ] `npm run check` reports no errors, and `npm run build` followed by `npm start` prints the
      statement.
- [ ] Every refused operation leaves the product exactly as it was, and the printed statement
      shows it.
- [ ] Removing a member that one of your interfaces requires makes `npm run check` report the
      error **on the class**, not at the place the object is used. (Try it, then undo it.)
- [ ] Creating your abstract base class directly is reported. (Try it, then undo it.)
- [ ] Assigning to a stored amount from outside its class is reported. (Try it, then undo it.)
- [ ] Giving a second card a different fee rule changes that card's numbers, with no change to
      the card class itself.
- [ ] Searching the code for `any` and ` as ` finds nothing.
- [ ] The Git history has at least five meaningful commits.

## Suggested commit history

```text
chore: set up TypeScript project
feat: add product interfaces and the abstract base class
feat: add the savings account
feat: add the credit card with a fee rule
feat: add the loan
feat: apply yearly interest
feat: print the statement
docs: add README
```

## Bonus

Optional. Only use concepts from LESSON 1-50.

- Keep a short history of movements inside each product, and print the savings account's.
- Add a second customer with their own products and print a per-customer total.
- Add a minimum balance rule to the savings account, and refuse withdrawals that would break it.
