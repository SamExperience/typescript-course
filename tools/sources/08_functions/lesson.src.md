<!-- cell: markdown -->
# TypeScript — Functions

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../08_functions/lesson.ipynb
>   ```
>
> - `[expected]` errors come from cells that start with `// Type error on purpose`: study them.
> - `[to fix]` errors come from cells that start with
>   `// This cell has type errors on purpose. Fix them.`: make them disappear.

<!-- cell: code setup -->
// Course helper: run this cell once, before any Verification cell.
// checkAll prints PASS or FAIL for each [label, actual value, expected value] case.
function checkAll(cases: [string, unknown, unknown][]): void {
  const lines = cases.map(([label, actual, expected]) =>
    JSON.stringify(actual) === JSON.stringify(expected)
      ? `PASS  ${label}`
      : `FAIL  ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
  console.log(lines.join("\n"));
}

<!-- cell: markdown -->
## LESSON 28 — Parameter and return types

### Explanation

You've typed parameters since LESSON 8. A function can also declare what it **returns**. Write
the type after the parameter list:

```typescript
function total(prices: number[]): number {
  return prices.reduce((sum, price) => sum + price, 0);
}
```

Why annotate the return type:

- **It's the function's contract.** Callers can see what they get without reading the body.
- **Mistakes are reported inside the function**, at the `return` that is wrong, instead of at
  some caller far away (like annotations on variables in LESSON 14).
- **Returned objects keep their literal unions.** With `: Transfer`, a returned
  `{ status: "completed" }` no longer widens to `string` (the problem from LESSON 24).

Two special cases:

- **`void`** means "returns nothing useful", for example a function that only prints. Returning
  a value from it is an error, and so is using its result.
- **A missing `return` on some path** is reported: `Function lacks ending return statement and
  return type does not include 'undefined'.` If "nothing found" is a real result, say so
  honestly: `: Account | undefined`.

A **destructured parameter** is typed as a whole: `function describe({ owner, balance }:
Account)`.

**When to annotate returns:** functions that others call, functions with several `return`s,
and results that must keep a literal union. A short helper used in one place can rely on
inference.

### Key Notes

- `function name(params): ReturnType { ... }` declares what the function returns.
- An annotated return type reports a wrong `return` right where it is.
- `void`: nothing useful is returned, and the result can't be used.
- Say "may be missing" honestly: `: Account | undefined`.
- Destructured parameters get one type for the whole object.

### Example

<!-- cell: code example -->
type L28Account = { owner: string; balance: number };

function l28FindAccount(accounts: L28Account[], owner: string): L28Account | undefined {
  return accounts.find((account) => account.owner === owner);
}

function l28PrintBalance({ owner, balance }: L28Account): void {
  console.log(`${owner}: ${balance.toFixed(2)} EUR`);
}

const l28Accounts: L28Account[] = [
  { owner: "Ada", balance: 250 },
  { owner: "Grace", balance: 40.5 },
];

const l28Grace = l28FindAccount(l28Accounts, "Grace");
if (l28Grace !== undefined) {
  l28PrintBalance(l28Grace); // prints Grace: 40.50 EUR
}

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l28Average(values: number[]): number {
  if (values.length === 0) {
    // Compiler: Type 'string' is not assignable to type 'number'.
    return "no values";
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Compiler: Function lacks ending return statement and return type does not include 'undefined'.
function l28Fee(amount: number): number {
  if (amount > 100) {
    return 0;
  }
}

console.log(l28Average([10, 20])); // prints 15

<!-- cell: markdown -->
### Exercise

A bank shows a short summary of an account statement. The return types are already written,
and they make the compiler report every mistake in the starter code.

1. Run `check:nb` and fix all four `[to fix]` errors. Don't remove any return type.
2. Complete `l28Summarize`:
   - `count`: the number of transactions;
   - `total`: the sum of all amounts, rounded to 2 decimals;
   - `status`: `"empty"` when there are no transactions, `"credit"` when the total is 0 or
     more, otherwise `"debit"`.
3. Complete `l28SummaryLine`, which returns a line such as
   `"4 transactions, total 501.45 EUR (credit)"`. `l28PrintSummary` should print that line.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L28Transaction = { description: string; amount: number };
type L28Summary = { count: number; total: number; status: "credit" | "debit" | "empty" };

function l28Summarize(transactions: L28Transaction[]): L28Summary {
  // TODO: follow the rules in the Exercise
  return { count: 0, total: "0", status: "none" };
}

function l28SummaryLine(summary: L28Summary): string {
  // TODO: a line such as "4 transactions, total 501.45 EUR (credit)"
  return summary.count;
}

function l28PrintSummary(summary: L28Summary): void {
  // TODO: print the summary line
  return l28SummaryLine(summary);
}

l28PrintSummary(
  l28Summarize([
    { description: "Salary", amount: 1500 },
    { description: "Rent", amount: -900 },
  ]),
);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 28 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l28Statement: L28Transaction[] = [
  { description: "Salary", amount: 1500 },
  { description: "Rent", amount: -900 },
  { description: "Groceries", amount: -86.45 },
  { description: "Bus pass", amount: -12.1 },
];

checkAll([
  ["count", l28Summarize(l28Statement).count, 4],
  ["total, rounded", l28Summarize(l28Statement).total, 501.45],
  ["status: credit", l28Summarize(l28Statement).status, "credit"],
  ["status: debit", l28Summarize([{ description: "Rent", amount: -900 }]).status, "debit"],
  ["status: empty", l28Summarize([]).status, "empty"],
  ["summary line", l28SummaryLine(l28Summarize(l28Statement)), "4 transactions, total 501.45 EUR (credit)"],
]);

<!-- cell: markdown -->
### Mini Challenge

For each function, decide whether you'd **annotate the return type**, and with which type.
Answer in comments with a short reason.

1. `function l28Greeting(name: string) { return `Hello, ${name}`; }`, used in one place.
2. A function that writes a line to the console and returns nothing.
3. A function that looks up an exchange rate that might not exist.
4. A function that returns `{ status: "ok"; message: string }` or `{ status: "error"; message:
   string }`, used all over the app.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.

<!-- cell: markdown -->
## LESSON 29 — Optional and default parameters

### Explanation

Not every argument is needed on every call. TypeScript gives you two ways to say so.

**Optional parameter: `name?: type`.** Callers may leave it out. Inside the function it may be
`undefined`, so you must handle that case before using it, just like an optional property
(LESSON 17):

```typescript
function withFee(amount: number, fee?: number): number {
  return amount + (fee ?? 0);
}
```

**Default parameter: `name = value`.** Callers may leave it out, and then the default is used.
The type is inferred from the default, and inside the function the value is never
`undefined`:

```typescript
function withDefaultFee(amount: number, fee = 2.5): number {
  return amount + fee; // fee is a number here
}
```

Rules to remember:

- Optional parameters go **after** the required ones. `(fee?: number, amount: number)` is an
  error: `A required parameter cannot follow an optional parameter.`
- A parameter can't have both `?` and a default. The default already makes it optional.
- Only `undefined` triggers a default. Passing `null` is reported, and at runtime `null` would
  be used as the value. That's also why error messages show a defaulted `fee` as
  `number | undefined`: you may pass `undefined` on purpose to skip it.

**Which one?** Use a default when there is a sensible standard value (12 months, `"EUR"`).
Use `?` when "not given" means something different from any value.

### Key Notes

- `fee?: number`: may be left out, and may be `undefined` inside the function.
- `fee = 2.5`: may be left out, and the default is used instead.
- Optional and default parameters come after the required ones.
- Only `undefined` triggers a default, never `null`.
- Default for a standard value; `?` when "missing" has its own meaning.

### Example

<!-- cell: code example -->
function l29Receipt(total: number, currency = "EUR", note?: string): string {
  const line = `${total.toFixed(2)} ${currency}`;
  if (note === undefined) {
    return line;
  }
  return `${line} (${note})`;
}

console.log(l29Receipt(10), "|", l29Receipt(10, "USD"), "|", l29Receipt(10, undefined, "gift"));
// prints 10.00 EUR | 10.00 USD | 10.00 EUR (gift)

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l29WithFee(amount: number, fee?: number): number {
  // Compiler: 'fee' is possibly 'undefined'.
  return amount + fee;
}

// Compiler: Argument of type 'null' is not assignable to parameter of type 'string | undefined'.
console.log(l29Receipt(10, null)); // prints 10.00 null: null doesn't trigger the default

<!-- cell: markdown -->
### Exercise

A bank's loan calculator shows the monthly payment.

1. `months` should default to **12**. Change the parameter so it has that default.
2. `annualRatePercent` is optional. When it's missing, the loan has no interest.
3. Complete the function. The total to repay is
   `principal * (1 + annualRatePercent / 100 * months / 12)`, and the monthly payment is that
   total divided by `months`, rounded to 2 decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l29MonthlyPayment(principal: number, months?: number, annualRatePercent?: number): number {
  // TODO: follow the rules in the Exercise
  return principal / months;
}

console.log(l29MonthlyPayment(1200));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 29 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["default 12 months, no interest", l29MonthlyPayment(1200), 100],
  ["6 months, no interest", l29MonthlyPayment(1200, 6), 200],
  ["12 months at 5%", l29MonthlyPayment(1200, 12, 5), 105],
  ["3 months, rounded", l29MonthlyPayment(1000, 3), 333.33],
  ["3 months at 12%", l29MonthlyPayment(1000, 3, 12), 343.33],
  ["default months, with a rate", l29MonthlyPayment(1000, undefined, 6), 88.33],
]);

<!-- cell: markdown -->
### Mini Challenge

Use `l29Receipt` from the Example. For each call, decide: does the compiler report it, and if
not, what does it print? Answer in comments, then check.

1. `l29Receipt(25)`
2. `l29Receipt(25, "gift")`
3. `l29Receipt(25, undefined, "gift")`
4. `l29Receipt(25, "GBP", "refund")`

One of the calls compiles but doesn't do what its author meant. Which one, and why can't the
compiler catch it?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
// Which one:

<!-- cell: markdown -->
## LESSON 30 — Function expressions and arrow functions

### Explanation

JavaScript has three ways to write a function, and TypeScript types all three the same way:
parameter types in the parentheses, the return type right after them.

```typescript
function addVat(net: number): number {
  return net * 1.22;
}

const addVatExpression = function (net: number): number {
  return net * 1.22;
};

const addVatArrow = (net: number): number => net * 1.22;
```

**Callbacks don't need parameter types.** When you pass an arrow function to `map`, `filter`,
`reduce` or `find`, TypeScript already knows the element type of the array, so it infers the
callback's parameters:

```typescript
const prices = [19.9, 5, 42];
const labels = prices.map((price) => price.toFixed(2)); // price is a number
```

A **standalone** arrow function stored in a variable has no such context, so its parameters
need types, just like a function declaration.

Two traps:

- **Returning an object from a short arrow needs parentheses:** `(amount: number) => ({ amount })`.
  Without them, the braces are read as the function body, and nothing is returned.
- **A `const` arrow can't be used before its line.** A `function` declaration can.

### Key Notes

- Declarations, function expressions and arrows are typed the same way.
- An arrow's return type goes after the parentheses: `(net: number): number =>`.
- Callbacks to array methods get their parameter types inferred.
- Standalone arrows need typed parameters.
- Return an object from a short arrow with `=> ({ ... })`.

### Example

<!-- cell: code example -->
type L30Entry = { label: string; amount: number };

const l30AddVat = (net: number): number => Math.round(net * 1.22 * 100) / 100;
const l30ToEntry = (amount: number): L30Entry => ({ label: `${amount.toFixed(2)} EUR`, amount });

const l30NetPrices = [10, 25.5, 99];
const l30Entries = l30NetPrices.map((price) => l30ToEntry(l30AddVat(price))); // price: number

console.log(l30Entries.map((entry) => entry.label)); // prints [ "12.20 EUR", "31.11 EUR", "120.78 EUR" ]

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Parameter 'price' implicitly has an 'any' type.
const l30Label = (price) => `${price} EUR`;

// Compiler: A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.
// Compiler: Left side of comma operator is unused and has no side effects.
const l30ToEntryBroken = (amount: number): L30Entry => { label: "item", amount };

console.log(l30Label(5), l30ToEntryBroken(5)); // prints 5 EUR undefined

<!-- cell: markdown -->
### Exercise

A card statement lists purchases. Write each helper as an **arrow function**:

1. `l30IsLarge`: `true` when a purchase is 100 EUR or more.
2. `l30ToLabel`: a label such as `"Cafe: 4.50 EUR"`.
3. `l30TravelTotal`: the total of all `"travel"` purchases, rounded to 2 decimals.
4. `l30LargeMerchants`: the merchant names of the large purchases, using `filter` and `map`
   (and `l30IsLarge`).

Fix the `[to fix]` errors along the way.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L30Purchase = { merchant: string; amount: number; category: "food" | "travel" | "other" };

const l30Purchases: L30Purchase[] = [
  { merchant: "Flight", amount: 120.1, category: "travel" },
  { merchant: "Cafe", amount: 4.5, category: "food" },
  { merchant: "Hotel shuttle", amount: 35.2, category: "travel" },
  { merchant: "Bookshop", amount: 150, category: "other" },
  { merchant: "Taxi", amount: 18.3, category: "travel" },
];

const l30IsLarge = (purchase) => false; // TODO
const l30ToLabel = (purchase) => ""; // TODO
const l30TravelTotal = (purchases: L30Purchase[]): number => 0; // TODO
const l30LargeMerchants = (purchases: L30Purchase[]): string[] => []; // TODO

console.log(l30TravelTotal(l30Purchases));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 30 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["a large purchase", l30IsLarge(l30Purchases[0]), true],
  ["a small purchase", l30IsLarge(l30Purchases[1]), false],
  ["exactly 100 is large", l30IsLarge({ merchant: "Shoes", amount: 100, category: "other" }), true],
  ["a label", l30ToLabel(l30Purchases[1]), "Cafe: 4.50 EUR"],
  ["the travel total, rounded", l30TravelTotal(l30Purchases), 173.6],
  ["no purchases", l30TravelTotal([]), 0],
  ["the large merchants", l30LargeMerchants(l30Purchases), ["Flight", "Bookshop"]],
]);

<!-- cell: markdown -->
### Mini Challenge

1. In the cell, rewrite `l30Discount` as an arrow function called `l30DiscountArrow`, with the
   same parameter and return types.
2. Use it in a `map` callback to apply a 10% discount to `[100, 40]`. Did the callback need
   parameter types?
3. **Don't run this, just predict:** what would happen if `console.log(l30DiscountArrow(50, 10))`
   were written **above** the line that declares `l30DiscountArrow`? And above the
   `function l30Discount` declaration instead?

<!-- cell: code challenge -->
function l30Discount(price: number, percent: number): number {
  return price - (price * percent) / 100;
}

// 1.

// 2.

// 3.

<!-- cell: markdown -->
## LESSON 31 — Function types

### Explanation

Functions are values: you store them in variables, put them in objects and pass them to other
functions. A **function type** describes the shape a function must have:

```typescript
type FeeRule = (amount: number) => number;
```

Read it as "a function that takes a number and returns a number". Note the `=>` before the
return type. Inside a type, `(amount: number): number` is a syntax error.

Use function types for:

- **callback parameters:** `function applyFee(amount: number, rule: FeeRule): number`;
- **variables that hold a function:** `const flatFee: FeeRule = (amount) => 2;`, where
  `amount` is inferred from the type;
- **properties:** `type PaymentMethod = { name: string; fee: FeeRule };`.

What the compiler checks:

- **The return type must match.** A rule that returns a string is reported.
- **The parameter types must match.** `(amount: string) => ...` doesn't fit `FeeRule`.
- **Fewer parameters is fine.** `() => 0` is a valid `FeeRule`: it just ignores the amount.
  More **required** parameters is an error, because callers won't pass them.
- **Parameter names don't matter**, only their types and order.

### Key Notes

- `(amount: number) => number` is a function type.
- Use it for callbacks, variables and object properties.
- A function with fewer parameters fits; one with more required parameters doesn't.
- Parameter names in the type are only labels.
- Name function types you reuse with a type alias.

### Example

<!-- cell: code example -->
type L31FeeRule = (amount: number) => number;
type L31PaymentMethod = { name: string; fee: L31FeeRule };

const l31Methods: L31PaymentMethod[] = [
  { name: "Card", fee: (amount) => Math.round(amount * 0.015 * 100) / 100 },
  { name: "Transfer", fee: () => 1 },
  { name: "Wallet", fee: (amount) => (amount >= 50 ? 0 : 0.5) },
];

function l31Cheapest(amount: number, methods: L31PaymentMethod[]): string {
  let best = methods[0];
  for (const method of methods) {
    if (method.fee(amount) < best.fee(amount)) {
      best = method;
    }
  }
  return `${best.name} (fee ${best.fee(amount)} EUR)`;
}

console.log(l31Cheapest(20, l31Methods), "|", l31Cheapest(80, l31Methods)); // prints Card (fee 0.3 EUR) | Wallet (fee 0 EUR)

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Type 'string' is not assignable to type 'number'.
const l31BadRule: L31FeeRule = (amount) => `${amount * 0.01}`;

// Compiler: Type '(amount: string) => number' is not assignable to type 'L31FeeRule'.
const l31WrongParameter: L31FeeRule = (amount: string) => amount.length;

function l31ApplyFee(amount: number, rule: L31FeeRule): number {
  // Compiler: Argument of type 'string' is not assignable to parameter of type 'number'.
  return amount + rule(`${amount}`);
}

console.log(l31BadRule(100)); // prints 1, a string

<!-- cell: markdown -->
### Exercise

A shop runs several discount **rules**. Each rule takes the order total and returns the
discount in EUR (0 when it doesn't apply). The shop always applies the single best rule.

1. Fix the `[to fix]` errors: give `rules` a type, and fix the rule that doesn't match
   `L31DiscountRule`.
2. Complete the rules:
   - `l31TenPercentOver100`: 10% of the total, rounded to 2 decimals, when the total is 100 or
     more;
   - `l31FiveOffOver30`: 5 when the total is 30 or more.
3. Complete `l31BestDiscount` (the largest discount of all rules, or 0 when there are no rules)
   and `l31ApplyBest` (the total minus the best discount, rounded to 2 decimals).

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L31DiscountRule = (total: number) => number;

const l31TenPercentOver100: L31DiscountRule = (total) => 0; // TODO
const l31FiveOffOver30: L31DiscountRule = (total: string) => 0; // TODO

function l31BestDiscount(total: number, rules): number {
  // TODO: the largest discount of all rules, or 0 when there are no rules
  return 0;
}

function l31ApplyBest(total: number, rules: L31DiscountRule[]): number {
  // TODO: the total minus the best discount, rounded to 2 decimals
  return total;
}

const l31Rules: L31DiscountRule[] = [l31TenPercentOver100, l31FiveOffOver30];
console.log(l31ApplyBest(123.45, l31Rules));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 31 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["10% rule, rounded", l31TenPercentOver100(123.45), 12.35],
  ["10% rule below 100", l31TenPercentOver100(99), 0],
  ["5 off at exactly 30", l31FiveOffOver30(30), 5],
  ["5 off below 30", l31FiveOffOver30(29.99), 0],
  ["best discount on a large order", l31BestDiscount(123.45, l31Rules), 12.35],
  ["best discount on a medium order", l31BestDiscount(60, l31Rules), 5],
  ["no rule applies", l31BestDiscount(20, l31Rules), 0],
  ["no rules at all", l31BestDiscount(20, []), 0],
  ["final total, rounded", l31ApplyBest(123.45, l31Rules), 111.1],
]);

<!-- cell: markdown -->
### Mini Challenge

`L31Formatter` is defined in the cell. Before running `check:nb`, decide which of these could
be stored in a variable of that type, and why:

```text
a) (amount) => amount.toFixed(2)
b) (amount, currency, locale: string) => `${amount} ${currency}`
c) (value: number, code: string) => value
d) () => "free"
```

Write your answers as comments. Then add the ones you think are valid as variables and check
with `check:nb`. Delete any line that's reported.

<!-- cell: code challenge -->
type L31Formatter = (amount: number, currency: string) => string;

// Your answers here

<!-- cell: markdown -->
## LESSON 32 — Type-safe function design

### Explanation

This lesson adds no new syntax. It combines what you know into a few habits that make a
function hard to call wrongly.

**1. Accept precise types.** `currency: "EUR" | "USD"` rejects `"GBP"` and typos;
`currency: string` accepts anything.

**2. Use an options object instead of several optional parameters.** In LESSON 29,
`l29Receipt(25, "gift")` silently put the note into the currency. With named options, every
value says what it is, and a misspelled option is reported:

```typescript
type FeeOptions = { amount: number; currency?: "EUR" | "USD"; express?: boolean };

function transferFee({ amount, currency = "EUR", express = false }: FeeOptions): string {
  return express ? `5 ${currency}` : `${amount * 0.01} ${currency}`;
}

transferFee({ amount: 100, express: true });
```

**3. Return honest results.** When something can fail, don't return `-1`, `0` or `""` and
hope the caller remembers. Return a **result type** that is discriminated data (LESSON 27):

```typescript
type ParseResult = { ok: true; amount: number } | { ok: false; error: string };
```

The caller can't read `amount` until it has checked `ok`, so a failure can't be mistaken for a
real value.

**4. Check outside data once, at the edge.** Turn raw text or `unknown` input into a typed
value in one function. Everything after it works with trusted types.

### Key Notes

- Precise parameter types reject wrong values before the code runs.
- Options objects make arguments explicit and catch misspelled names.
- A result type `{ ok: true; ... } | { ok: false; ... }` makes failures impossible to ignore.
- Validate outside data in one place, then pass typed values inward.

### Example

<!-- cell: code example -->
type L32Currency = "EUR" | "USD";
type L32FeeOptions = { amount: number; currency?: L32Currency; express?: boolean };
type L32RateResult = { found: true; rate: number } | { found: false };

function l32TransferFee({ amount, currency = "EUR", express = false }: L32FeeOptions): string {
  const fee = express ? 5 : Math.round(amount * 0.01 * 100) / 100;
  return `${fee} ${currency}`;
}

function l32FindRate(from: L32Currency, to: L32Currency): L32RateResult {
  if (from === to) {
    return { found: true, rate: 1 };
  }
  if (from === "EUR") {
    return { found: true, rate: 1.08 };
  }
  return { found: false };
}

const l32Rate = l32FindRate("USD", "EUR");
const l32RateText = l32Rate.found ? `rate ${l32Rate.rate}` : "no rate available";

console.log(l32TransferFee({ amount: 250 }), "|", l32TransferFee({ amount: 250, express: true }), "|", l32RateText);
// prints 2.5 EUR | 5 EUR | no rate available

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Object literal may only specify known properties, but 'expres' does not exist in type 'L32FeeOptions'. Did you mean to write 'express'?
console.log(l32TransferFee({ amount: 100, expres: true })); // prints 1 EUR: the option was ignored

function l32UnsafeRate(): number {
  const result = l32FindRate("USD", "EUR");
  // Compiler: Property 'rate' does not exist on type 'L32RateResult'.
  return result.rate;
}

<!-- cell: markdown -->
### Exercise

A payment form sends the amount as text. Write the single "edge" function that turns it into a
trusted result, and the function that displays it.

1. Fix the `[to fix]` errors.
2. Complete `l32ParseAmount`. Trim the text first, then return a failure with the **first**
   matching error:
   - `"empty"`: nothing left after trimming;
   - `"not-a-number"`: `Number` can't read it;
   - `"not-positive"`: 0 or less;
   - `"too-large"`: more than 10000.

   Otherwise return a success with the amount.
3. Complete `l32Describe`: `"Amount: 12.50 EUR"` for a success, `"Error: not-a-number"` for a
   failure.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L32ParseError = "empty" | "not-a-number" | "not-positive" | "too-large";
type L32ParseResult = { ok: true; amount: number } | { ok: false; error: L32ParseError };

function l32ParseAmount(text: string): L32ParseResult {
  // TODO: follow the rules in the Exercise
  return { ok: false, error: "invalid" };
}

function l32Describe(result: L32ParseResult): string {
  // TODO: "Amount: 12.50 EUR" or "Error: not-a-number"
  return `Amount: ${result.amount}`;
}

console.log(l32Describe(l32ParseAmount("12.5")));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 32 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["a valid amount is ok", l32ParseAmount("12.5").ok, true],
  ["describe a valid amount", l32Describe(l32ParseAmount("12.5")), "Amount: 12.50 EUR"],
  ["spaces are trimmed", l32Describe(l32ParseAmount("  40 ")), "Amount: 40.00 EUR"],
  ["only spaces", l32Describe(l32ParseAmount("   ")), "Error: empty"],
  ["not a number", l32Describe(l32ParseAmount("abc")), "Error: not-a-number"],
  ["zero", l32Describe(l32ParseAmount("0")), "Error: not-positive"],
  ["negative", l32Describe(l32ParseAmount("-3")), "Error: not-positive"],
  ["the maximum is allowed", l32Describe(l32ParseAmount("10000")), "Amount: 10000.00 EUR"],
  ["too large", l32Describe(l32ParseAmount("20000")), "Error: too-large"],
]);

<!-- cell: markdown -->
### Mini Challenge

**Redesign it.** A teammate wrote this signature for sending money:

```typescript
function send(to: any, amount: string, currency?: string, note?: string, urgent?: boolean): any
```

In the cell, write a better **type-level design**: type aliases for the options and for the
result, and the function signature with a body that only returns a placeholder result. Then,
in a comment, name three mistakes your design now catches that the original accepted.

<!-- cell: code challenge -->
// Your types and signature here

// Three mistakes it catches:
