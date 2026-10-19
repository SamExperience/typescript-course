<!-- cell: markdown -->
# TypeScript — Functions

> **Solutions.** Open this only after you've genuinely tried the exercises in
> `lesson.ipynb`. Run the helper cell first, then a solution cell and its Verification cell.

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

### Exercise

<!-- cell: code solution -->
type L28Transaction = { description: string; amount: number };
type L28Summary = { count: number; total: number; status: "credit" | "debit" | "empty" };

function l28Summarize(transactions: L28Transaction[]): L28Summary {
  if (transactions.length === 0) {
    return { count: 0, total: 0, status: "empty" };
  }
  const sum = transactions.reduce((runningTotal, transaction) => runningTotal + transaction.amount, 0);
  const total = Math.round(sum * 100) / 100;
  return { count: transactions.length, total, status: total >= 0 ? "credit" : "debit" };
}

function l28SummaryLine(summary: L28Summary): string {
  return `${summary.count} transactions, total ${summary.total.toFixed(2)} EUR (${summary.status})`;
}

function l28PrintSummary(summary: L28Summary): void {
  console.log(l28SummaryLine(summary));
}

l28PrintSummary(
  l28Summarize([
    { description: "Salary", amount: 1500 },
    { description: "Rent", amount: -900 },
  ]),
); // prints 2 transactions, total 600.00 EUR (credit)

<!-- cell: markdown -->
The four `[to fix]` errors were each reported at the exact line of the mistake: `"0"` is not a
number, `"none"` is not one of the allowed statuses, `summary.count` is not a string, and a
`void` function can't return a value. Thanks to `: L28Summary`, the `"credit"`, `"debit"` and `"empty"` literals in the
returned objects keep their literal type.

**Common mistakes**

- **Deleting the return types to silence the errors.** The mistakes don't go away. Without
  `: L28Summary`, the returned `status` widens to `string`, and passing the result to
  `l28SummaryLine` is reported at the call instead, far from the cause.
- **Printing inside `l28SummaryLine`.** It must *return* the line. The Verification cell
  compares its result, and `l28PrintSummary` is the function that prints.
- **Forgetting to round.** `1500 - 900 - 86.45 - 12.1` is `501.44999999999993` in
  JavaScript, so the "total, rounded" check fails.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Not needed. A short helper used in one place: inference already gives string.
// 2. Annotate with void. It documents "no result" and stops anyone from using one.
// 3. Annotate with number | undefined (or number | null). The type tells every caller to
//    handle a missing rate.
// 4. Annotate with an alias, for example:
//      type L28Result = { status: "ok"; message: string } | { status: "error"; message: string };
//    It's used everywhere, and the annotation keeps "ok" and "error" as literals in the
//    returned objects.

<!-- cell: markdown -->
The more places call a function, the more its return type is worth writing down.

<!-- cell: markdown -->
## LESSON 29 — Optional and default parameters

### Exercise

<!-- cell: code solution -->
function l29MonthlyPayment(principal: number, months = 12, annualRatePercent?: number): number {
  const rate = annualRatePercent ?? 0;
  const total = principal * (1 + (rate / 100) * (months / 12));
  return Math.round((total / months) * 100) / 100;
}

console.log(l29MonthlyPayment(1200)); // prints 100

<!-- cell: markdown -->
`months = 12` makes the parameter optional *and* gives it a number, so `total / months` is
safe. `annualRatePercent ?? 0` turns a missing rate into 0% before any arithmetic.

**Common mistakes**

- **Writing `months?: number = 12`.** A parameter can't have both. The default alone is enough.
- **Using `annualRatePercent` without handling `undefined`.** The compiler reports it, and at
  runtime the result would be `NaN`.
- **Putting the rate before `months`.** Then `l29MonthlyPayment(1200, 6)` would mean a 6% rate,
  and the "6 months" check fails.

### Verification

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

<!-- cell: code challenge-solution -->
function l29Receipt(total: number, currency = "EUR", note?: string): string {
  const line = `${total.toFixed(2)} ${currency}`;
  if (note === undefined) {
    return line;
  }
  return `${line} (${note})`;
}

console.log(l29Receipt(25), "|", l29Receipt(25, "gift"), "|", l29Receipt(25, undefined, "gift"), "|", l29Receipt(25, "GBP", "refund"));
// prints 25.00 EUR | 25.00 gift | 25.00 EUR (gift) | 25.00 GBP (refund)

// 1. Not reported. Prints 25.00 EUR.
// 2. Not reported. Prints 25.00 gift.
// 3. Not reported. Prints 25.00 EUR (gift).
// 4. Not reported. Prints 25.00 GBP (refund).
// Which one: call 2. The author meant "gift" as the note, but arguments fill parameters in
// order, so it became the currency. Both parameters are strings, so the types match and the
// compiler has nothing to report. Call 3 is the correct way to skip the currency.

<!-- cell: markdown -->
When two optional parameters have the same type, a mix-up is invisible to the compiler.
LESSON 32 shows a function design that avoids it.

<!-- cell: markdown -->
## LESSON 30 — Function expressions and arrow functions

### Exercise

<!-- cell: code solution -->
type L30Purchase = { merchant: string; amount: number; category: "food" | "travel" | "other" };

const l30Purchases: L30Purchase[] = [
  { merchant: "Flight", amount: 120.1, category: "travel" },
  { merchant: "Cafe", amount: 4.5, category: "food" },
  { merchant: "Hotel shuttle", amount: 35.2, category: "travel" },
  { merchant: "Bookshop", amount: 150, category: "other" },
  { merchant: "Taxi", amount: 18.3, category: "travel" },
];

const l30IsLarge = (purchase: L30Purchase): boolean => purchase.amount >= 100;

const l30ToLabel = (purchase: L30Purchase): string => `${purchase.merchant}: ${purchase.amount.toFixed(2)} EUR`;

const l30TravelTotal = (purchases: L30Purchase[]): number => {
  const sum = purchases
    .filter((purchase) => purchase.category === "travel")
    .reduce((total, purchase) => total + purchase.amount, 0);
  return Math.round(sum * 100) / 100;
};

const l30LargeMerchants = (purchases: L30Purchase[]): string[] =>
  purchases.filter(l30IsLarge).map((purchase) => purchase.merchant);

console.log(l30TravelTotal(l30Purchases)); // prints 173.6

<!-- cell: markdown -->
The standalone arrows get typed parameters. The callbacks inside `filter`, `reduce` and `map`
don't need any: TypeScript knows they receive an `L30Purchase`. `filter(l30IsLarge)` passes the
arrow function itself as the callback.

**Common mistakes**

- **Leaving `purchase` untyped in `l30IsLarge` or `l30ToLabel`.** Standalone arrows have no
  context, so strict mode reports an implicit `any`.
- **Forgetting to round.** `120.1 + 35.2 + 18.3` is `173.60000000000002` in JavaScript.
- **Writing `(p) => { p.merchant }` in `map`.** With braces and no `return`, every element
  becomes `undefined`.

### Verification

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

<!-- cell: code challenge-solution -->
function l30Discount(price: number, percent: number): number {
  return price - (price * percent) / 100;
}

// 1.
const l30DiscountArrow = (price: number, percent: number): number => price - (price * percent) / 100;

// 2. No parameter types needed: price is inferred as a number from the array.
const l30Discounted = [100, 40].map((price) => l30DiscountArrow(price, 10));
console.log(l30Discounted, l30Discount(50, 10)); // prints [ 90, 36 ] 45

// 3. Above the const arrow: the compiler reports that the variable is used before its
//    declaration, and at runtime it throws a ReferenceError. Above the function declaration:
//    it works, because function declarations are available in the whole scope.

<!-- cell: markdown -->
Choose the style you like for standalone functions, and type them fully. For callbacks, let
TypeScript infer the parameters.

<!-- cell: markdown -->
## LESSON 31 — Function types

### Exercise

<!-- cell: code solution -->
type L31DiscountRule = (total: number) => number;

const l31TenPercentOver100: L31DiscountRule = (total) => (total >= 100 ? Math.round(total * 0.1 * 100) / 100 : 0);
const l31FiveOffOver30: L31DiscountRule = (total) => (total >= 30 ? 5 : 0);

function l31BestDiscount(total: number, rules: L31DiscountRule[]): number {
  return rules.reduce((best, rule) => Math.max(best, rule(total)), 0);
}

function l31ApplyBest(total: number, rules: L31DiscountRule[]): number {
  return Math.round((total - l31BestDiscount(total, rules)) * 100) / 100;
}

const l31Rules: L31DiscountRule[] = [l31TenPercentOver100, l31FiveOffOver30];
console.log(l31ApplyBest(123.45, l31Rules)); // prints 111.1

<!-- cell: markdown -->
Because the rules are typed with `L31DiscountRule`, `total` is inferred inside each arrow, and
`rules` can hold any function of that shape. `reduce` starts at `0`, which is also the answer
when no rule applies.

**Common mistakes**

- **`Math.max(...rules.map((rule) => rule(total)))`.** With no rules, `Math.max()` of nothing is
  `-Infinity`, and the "no rules at all" check fails.
- **Typing `rules` as `L31DiscountRule` instead of `L31DiscountRule[]`.** That's one rule, not a
  list, and `reduce` is reported.
- **Rounding only the final total.** `123.45 * 0.1` is `12.345`, so the 10% rule itself must
  round, or its check fails.

### Verification

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

<!-- cell: code challenge-solution -->
type L31Formatter = (amount: number, currency: string) => string;

const l31FormatA: L31Formatter = (amount) => amount.toFixed(2);
const l31FormatD: L31Formatter = () => "free";

console.log(l31FormatA(5, "EUR"), l31FormatD(5, "EUR")); // prints 5.00 free

// a) Valid: fewer parameters is fine. The currency is simply ignored.
// b) Not valid: a third required parameter, which callers of an L31Formatter never pass.
//    Because the function doesn't fit the type, amount and currency also lose their inferred
//    types, so check:nb reports them as implicit any too.
// c) Not valid: it returns a number, but the type requires a string.
// d) Valid: no parameters at all, and it returns a string.

<!-- cell: markdown -->
The compiler asks one question: can this function be called **safely** in every place that
expects an `L31Formatter`? Ignoring arguments is safe; needing extra ones isn't.

<!-- cell: markdown -->
## LESSON 32 — Type-safe function design

### Exercise

<!-- cell: code solution -->
type L32ParseError = "empty" | "not-a-number" | "not-positive" | "too-large";
type L32ParseResult = { ok: true; amount: number } | { ok: false; error: L32ParseError };

function l32ParseAmount(text: string): L32ParseResult {
  const trimmed = text.trim();
  if (trimmed === "") {
    return { ok: false, error: "empty" };
  }
  const amount = Number(trimmed);
  if (Number.isNaN(amount)) {
    return { ok: false, error: "not-a-number" };
  }
  if (amount <= 0) {
    return { ok: false, error: "not-positive" };
  }
  if (amount > 10000) {
    return { ok: false, error: "too-large" };
  }
  return { ok: true, amount };
}

function l32Describe(result: L32ParseResult): string {
  if (result.ok) {
    return `Amount: ${result.amount.toFixed(2)} EUR`;
  }
  return `Error: ${result.error}`;
}

console.log(l32Describe(l32ParseAmount("12.5"))); // prints Amount: 12.50 EUR

<!-- cell: markdown -->
`ok` is the discriminant: inside `if (result.ok)`, only the success variant is left, so `amount`
is available. The return type `L32ParseResult` makes the compiler check every `return`, so
`"invalid"` could never slip through.

**Common mistakes**

- **Checking for empty text after `Number`.** `Number("")` and `Number("   ")` are both `0`, so
  empty input would be reported as `"not-positive"`.
- **Returning `{ ok: true }` without the amount.** The compiler reports the missing property.
- **Using `parseFloat`.** `parseFloat("12abc")` is `12`, so invalid text would pass as a real
  amount.

### Verification

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

<!-- cell: code challenge-solution -->
type L32Recipient = { name: string; iban: string };
type L32SendOptions = {
  to: L32Recipient;
  amount: number;
  currency?: "EUR" | "USD" | "GBP";
  note?: string;
  urgent?: boolean;
};
type L32SendResult = { ok: true; reference: string } | { ok: false; reason: "insufficient-funds" | "invalid-iban" };

function l32Send(options: L32SendOptions): L32SendResult {
  // Placeholder body: a real implementation would validate and send the money.
  return { ok: true, reference: `TX-${options.amount}` };
}

const l32Sent = l32Send({ to: { name: "Grace", iban: "IT60X0542811101000000123456" }, amount: 50, note: "dinner" });
console.log(l32Sent.ok ? l32Sent.reference : l32Sent.reason); // prints TX-50

// Three mistakes it catches:
// 1. An amount passed as text ("50"): amount is a number.
// 2. A note put where the currency belongs: options have names, and "dinner" isn't a currency.
// 3. Using the result without checking ok: reference only exists on a success.
// (Also: a recipient without an iban, a misspelled option such as urgnt, and an unsupported
//  currency.)

<!-- cell: markdown -->
Other designs are fine too. What matters is that each type rules out a mistake the original
signature accepted.
