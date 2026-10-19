# Mini-project 4 — Trading Portfolio & Transaction Engine

**Prerequisites:** topics 01 → 17 (LESSON 1-70).
**Repository to create:** `ts-trading-portfolio` (public).
**Setup and Git:** [PUBLISHING_GUIDE.md](../PUBLISHING_GUIDE.md).

Your fourth and last TypeScript repository, and the first one split across several files.
`npm start` builds a portfolio, applies a batch of trades, and prints what happened.

> This is a learning project. The prices are invented, nothing is connected to a market, and
> none of this is real trading software.

## Scenario

An investor holds a few different things: shares in a company, a government bond, some cash.
They come in different currencies, they are worth different amounts, and each kind carries one
detail the others don't. Once a day a batch of buy and sell instructions arrives, and some of
them are wrong: a symbol nobody holds, a quantity that isn't a whole number, a sale larger than
the position.

The investor wants a small program that models the holdings honestly, applies the good trades,
explains the bad ones, and prints the portfolio afterwards.

## Objective

Bring the whole course together: a discriminated union for the asset kinds, a generic container
for the portfolio, utility types where they genuinely help, type guards and exhaustive checks
for the parts that vary, and a multi-file layout where the types sit at the bottom and the
entry point only wires things together.

## Core requirements

Core is the project. Finish all of it and you're done.

- [ ] A Node.js + TypeScript project set up as in the Publishing guide (TypeScript `6.0.3`,
      strict `tsconfig.json`, `"type": "module"`, `"module"`/`"moduleResolution"` set to
      `nodenext`, `check`, `build` and `start` scripts, `.gitignore`).
- [ ] **At least three asset kinds** as a discriminated union — for example a stock, a bond and
      a cash holding. They share the symbol, the quantity, the unit price and the currency; each
      kind adds at least one property of its own.
- [ ] **A generic portfolio**: one class or type that holds assets, parameterized over the kind
      of asset it holds and constrained to your asset type. It can add, remove, find and list,
      and it refuses to add the same symbol twice.
- [ ] **A trade engine**: a function that takes the portfolio and one trade and returns a
      **result type** (a success with what moved, or a failure with a readable reason). It never
      throws, and a refused trade changes nothing.
- [ ] Validation covers at least: an unknown symbol, a quantity that is `0`, negative or not a
      whole number, and a sale larger than the position held.
- [ ] **Portfolio totals**: the value of one asset, a total per currency as a
      `Record<Currency, number>`, and the whole portfolio converted into one currency. Every
      money value rounded to 2 decimals.
- [ ] **At least one user-defined type guard** (`asset is Bond`, say) used for something only
      one kind can do — for example coupon income.
- [ ] **An exhaustive check**: a `switch` over the asset kinds whose `default` assigns to
      `never`, so a new kind is reported.
- [ ] **At least two utility types** where they clearly help (`Record`, `Pick`, `Omit`,
      `Readonly`, `Partial`, `ReturnType`).
- [ ] **A multi-file layout**: the domain types in a module that imports nothing back, the
      logic in its own modules, and `src/index.ts` only wiring them together and printing.
      Type-only imports use `import type`.
- [ ] `npm start` prints the portfolio, the outcome of every trade (good and bad), the totals
      and the number of assets held.

## Constraints

- Use only what LESSON 1-70 taught.
- **Not allowed:** decorators, external libraries, a database, a backend, real market data,
  `any`, type assertions (`as`), namespaces, dynamic `import()`.
- Every function has typed parameters and an **annotated return type**, except where a type is
  deliberately derived from the function with `ReturnType`.
- No operation throws: an impossible trade is refused and reported by its result.
- Keep it small: three or four asset kinds, one investor, a handful of trades. No user input,
  no files, no network.

## Starter data

You may use these holdings and trades, change them, or invent your own. They are chosen so that
rounding and every validation rule are exercised.

```typescript
type Currency = "EUR" | "USD";

const rates: Readonly<Record<Currency, number>> = { EUR: 1, USD: 1.1 };

const holdings = [
  { kind: "stock", symbol: "ACME", quantity: 10, unitPrice: 19.99, currency: "EUR", sector: "industry" },
  { kind: "stock", symbol: "GLOB", quantity: 4, unitPrice: 120.5, currency: "USD", sector: "tech" },
  { kind: "bond", symbol: "GOV27", quantity: 2, unitPrice: 98.4, currency: "EUR", couponPercent: 1.5 },
  { kind: "cash", symbol: "EURCASH", quantity: 250.5, unitPrice: 1, currency: "EUR" },
];

const trades = [
  { action: "buy", symbol: "ACME", quantity: 5 },
  { action: "sell", symbol: "GLOB", quantity: 10 },
  { action: "sell", symbol: "GOV27", quantity: 1 },
  { action: "buy", symbol: "NOPE", quantity: 1 },
  { action: "buy", symbol: "ACME", quantity: 0 },
];

console.log(`${holdings.length} holdings, ${trades.length} trades, USD rate ${rates.USD}`);
```

With those five trades, two succeed and three are refused — one for each validation rule.

## Done when

- [ ] `npm run check` reports no errors, and `npm run build` followed by `npm start` prints the
      portfolio, the trade outcomes and the totals.
- [ ] Every refused trade leaves the portfolio exactly as it was, and the printed report says
      why each one was refused.
- [ ] Adding a fourth asset kind to the union makes `npm run check` report your exhaustive
      `switch`, naming the new kind. (Try it, then undo it.)
- [ ] Reading a kind-specific property without checking the kind first is reported. (Try it,
      then undo it.)
- [ ] Adding the same symbol twice leaves one holding, and the second `add` returns `false`.
- [ ] Searching the code for `any` and ` as ` finds nothing.
- [ ] `src/index.ts` contains no calculation: only construction, calls and printing.
- [ ] The Git history has at least six meaningful commits.

## Suggested commit history

```text
chore: set up TypeScript project
feat: model asset kinds and currencies
feat: add the generic portfolio
feat: value assets and total per currency
feat: apply trades with a result type
feat: add coupon income with a type guard
feat: print the portfolio report
docs: add README
```

## Bonus

Optional. Only use concepts from LESSON 1-70.

- Sort the printed holdings by value, highest first.
- Add a `Partial` "price update" that changes only the unit prices it mentions.
- Report the portfolio in both currencies side by side.
