<!-- cell: markdown -->
# TypeScript — Introduction

> **Solutions.** Open this only after you've genuinely tried the exercises in
> `lesson.ipynb`. Run the helper cell first, then a solution cell and its Verification cell.

<!-- cell: code setup -->
// Course helper: run this cell once, before any Verification cell.
// checkAll prints PASS or FAIL for each [label, actual value, expected value] case.
// You don't need to understand how it works yet.
function checkAll(cases: [string, unknown, unknown][]): void {
  const lines = cases.map(([label, actual, expected]) =>
    JSON.stringify(actual) === JSON.stringify(expected)
      ? `PASS  ${label}`
      : `FAIL  ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
  console.log(lines.join("\n"));
}

<!-- cell: markdown -->
## LESSON 1 — What TypeScript is and why it exists

### Exercise

<!-- cell: code solution -->
const l1Form = { price: "24.50", quantity: "2", shipping: "4.50" };

function l1OrderTotal(price: number, quantity: number, shipping: number) {
  return price * quantity + shipping;
}

const l1Total = l1OrderTotal(Number(l1Form.price), Number(l1Form.quantity), Number(l1Form.shipping));

console.log(l1Total); // prints 53.5

// Step 3: passing l1Form.price directly prints 494.50.
// "24.50" * "2" is 49, then 49 + "4.50" joins them into the string "494.50".

<!-- cell: markdown -->
The parameters promise numbers, so the strings are converted *before* the call. The function
itself can then trust its parameters.

**Common mistakes**

- **Passing the strings directly.** JavaScript prints `494.50` instead of failing. The
  compiler reports it.
- **Using `parseInt`.** It drops the decimals (`24` and `4`), so the total is `52`.
- **Forgetting shipping.** The total is `49`.

### Verification

<!-- cell: code verification -->
checkAll([
  ["total for the form order", l1Total, 53.5],
  ["3 items at 10, plus 4 shipping", l1OrderTotal(10, 3, 4), 34],
  ["free items, shipping only", l1OrderTotal(0, 5, 4), 4],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
function l1ApplyFee(amount: number, fee: number) {
  return amount + fee;
}

function l1Discount(price: number, percent: number) {
  return price - (price * percent) / 100;
}

// 1. l1ApplyFee(100, 2)            -> not reported. Prints 102.
// 2. l1ApplyFee("100", 2)          -> reported. Prints 1002: + joins "100" and 2.
// 3. l1Discount("80", 25)          -> reported. Prints 60: - and * turn "80" into a number.
// 4. l1Discount(Number("80"), 25)  -> not reported. Prints 60.

console.log(l1ApplyFee(100, 2)); // prints 102
console.log(l1Discount(Number("80"), 25)); // prints 60

<!-- cell: markdown -->
**Why report call 3?** The compiler checks that values match what a function expects, not
whether today's result looks right. Call 3 is correct only by accident. If someone later
changes the formula to use `+`, it breaks silently, like call 2.

<!-- cell: markdown -->
## LESSON 2 — Benefits, limitations, and when TypeScript is useful

### Exercise

<!-- cell: code solution -->
// Shop rule: orders of 50 EUR or more ship for free. Smaller orders pay 4.90 EUR.
function l2ShippingCost(total: number) {
  if (total >= 50) {
    return 0;
  }
  return 4.9;
}

// true = the compiler reports it, false = only a runtime check would catch it
const l2CaughtByCompiler = {
  missingArgument: true, // the function expects 1 argument
  wrongFormula: false, // both formulas produce a number
  misspelledProperty: true, // the object has no property called totl
  stringPassedToNumberParameter: true, // the parameter only allows numbers
  wrongComparison: false, // > and >= both compare two numbers
};

<!-- cell: markdown -->
The comparison and the formula are **logic** mistakes: every type is correct, so only a
runtime check finds them. The other three break a type rule, so the compiler reports them.

**Common mistakes**

- **Fixing the rule with `total > 49.99`.** It passes today's checks, but an order of `49.995`
  would ship free. `>=` says exactly what the rule says.
- **Marking every bug `true`.** The compiler knows what *type* a value must have, not what
  the value should be.

### Verification

<!-- cell: code verification -->
checkAll([
  ["an order of 80 ships free", l2ShippingCost(80), 0],
  ["an order of exactly 50 ships free", l2ShippingCost(50), 0],
  ["an order of 49.99 pays shipping", l2ShippingCost(49.99), 4.9],
  ["missing argument", l2CaughtByCompiler.missingArgument, true],
  ["wrong formula", l2CaughtByCompiler.wrongFormula, false],
  ["misspelled property", l2CaughtByCompiler.misspelledProperty, true],
  ["string passed to a number parameter", l2CaughtByCompiler.stringPassedToNumberParameter, true],
  ["wrong comparison", l2CaughtByCompiler.wrongComparison, false],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Probably not. It's short, runs once, and you can hold every detail in your head.
// 2. Yes. Many functions, many changes and several people: the compiler checks every call
//    after every change, and the types tell new developers how to use the code.
// 3. Yes. The types are the documentation other teams see in their editor, and the
//    compiler reports it when they call your functions the wrong way.

<!-- cell: markdown -->
There is no single right answer for case 1. What matters is the reason: TypeScript's value
grows with the size of the code, the number of people and how long it lives.

<!-- cell: markdown -->
## LESSON 3 — TypeScript in modern web development

### Exercise

<!-- cell: code solution -->
function l3FormatMoney(amountInCents: number, currency: string) {
  return `${(amountInCents / 100).toFixed(2)} ${currency}`;
}

function l3ReceiptLine(name: string, unitPriceInCents: number, quantity: number) {
  return `${quantity} x ${name}: ${l3FormatMoney(unitPriceInCents * quantity, "EUR")}`;
}

console.log(l3ReceiptLine("Coffee beans", 1290, 2)); // prints 2 x Coffee beans: 25.80 EUR

<!-- cell: markdown -->
The library's parameter name `amountInCents` tells you to pass cents, so you multiply the
unit price in cents and let `l3FormatMoney` do the formatting.

**Common mistakes**

- **Converting to euros first.** `l3FormatMoney(25.8, "EUR")` prints `0.26 EUR`. The type
  (`number`) is correct, so the compiler can't catch it. Only the parameter *name* tells you
  the unit.
- **Formatting the unit price instead of the line total.** The mug passes, but the coffee
  beans show `12.90 EUR`.

### Verification

<!-- cell: code verification -->
checkAll([
  ["two bags of coffee beans", l3ReceiptLine("Coffee beans", 1290, 2), "2 x Coffee beans: 25.80 EUR"],
  ["one mug", l3ReceiptLine("Mug", 850, 1), "1 x Mug: 8.50 EUR"],
  ["three stickers", l3ReceiptLine("Sticker", 99, 3), "3 x Sticker: 2.97 EUR"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Vite removes the types and runs the JavaScript without checking it, so type errors
//    don't stop the page from loading.
// 2. No. A type error often points to a real bug on a path nobody has tried yet, such as a
//    string where a number belongs. The page working today doesn't prove it's correct.
// 3. In the editor while writing code, and by running the type-check command before the
//    code is released (for example, before every commit or build).

<!-- cell: markdown -->
The fast tool and the type check do different jobs. Using only the fast tool means you get
JavaScript's silent mistakes back.
