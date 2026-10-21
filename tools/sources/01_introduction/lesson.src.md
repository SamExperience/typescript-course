<!-- cell: markdown -->
# TypeScript — Introduction

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** The notebook just runs the code. To see type
>   errors, open a terminal in the `playground` folder (one-time setup in the README) and run:
>
>   ```bash
>   npm run check:nb -- ../01_introduction/lesson.ipynb
>   ```
>
>   It lists every type error with its lesson, section and line. Cells that start with
>   `// Type error on purpose` are listed as `[expected]`.

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

### Explanation

**TypeScript is JavaScript with types.** A **type** is the kind of value something is: a
number, a string, an object.

**The problem.** JavaScript doesn't stop you from using the wrong kind of value:

```typescript
const price = "20"; // form fields give you strings
console.log(price + 5); // prints 205, not 25
```

No crash, no warning. The bug just slips through.

**The solution.** In TypeScript you write what kind of value you expect. This is a **type
annotation**:

```typescript
function addShipping(price: number, shipping: number) {
  return price + shipping;
}
```

`price: number` means "`price` must be a number". The **TypeScript compiler**, a program that
reads your code, then reports `addShipping("20", 5)` as an error *before the code runs*.

For now you only need to *read* annotations. You'll write your own from LESSON 8.

**Types disappear before the code runs.** They are removed, and what runs is plain
JavaScript. That's why a notebook cell with a type error still runs.

### Key Notes

- TypeScript = JavaScript + types.
- `price: number` is a type annotation: only numbers are allowed.
- The compiler reports type errors **before** the code runs.
- At runtime, the types are gone: it's plain JavaScript.

### Example

<!-- cell: code type-error-demo -->
// Type error on purpose.
const l1PriceFromForm = "20"; // form fields give you strings
const l1Shipping = 5;

function l1AddShipping(price: number, shipping: number) {
  return price + shipping;
}

// Compiler: Argument of type 'string' is not assignable to parameter of type 'number'.
console.log(l1AddShipping(l1PriceFromForm, l1Shipping)); // prints 205: the cell runs anyway

<!-- cell: code example -->
// The fix: turn the string into a number before the call.
console.log(l1AddShipping(Number(l1PriceFromForm), l1Shipping)); // prints 25

<!-- cell: markdown -->
### Exercise

A checkout form sends every value as a string. In the cell below:

1. Complete `l1OrderTotal` so it returns `price * quantity + shipping`.
2. Set `l1Total` by calling `l1OrderTotal` with the values from `l1Form`. The parameters are
   numbers, so convert the strings first.
3. Try passing `l1Form.price` without converting it and run the cell. What prints? Then put
   the conversion back.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code starter -->
const l1Form = { price: "24.50", quantity: "2", shipping: "4.50" };

function l1OrderTotal(price: number, quantity: number, shipping: number) {
  // TODO: return the cost of all the items plus shipping
  return 0;
}

// TODO: call l1OrderTotal with the form values, converted to numbers
const l1Total = 0;

console.log(l1Total);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`.

<!-- cell: code verification -->
checkAll([
  ["total for the form order", l1Total, 53.5],
  ["3 items at 10, plus 4 shipping", l1OrderTotal(10, 3, 4), 34],
  ["free items, shipping only", l1OrderTotal(0, 5, 4), 4],
]);

<!-- cell: markdown -->
### Mini Challenge

For each call, predict: does the compiler report it, and what does the cell print?

```text
1. l1ApplyFee(100, 2)
2. l1ApplyFee("100", 2)
3. l1Discount("80", 25)
4. l1Discount(Number("80"), 25)
```

Write your predictions as comments in the cell below. Then add the calls, run the cell, and
run `check:nb` to compare.

Call 3 prints the right discount. Why is it still good that the compiler reports it?

<!-- cell: code challenge -->
function l1ApplyFee(amount: number, fee: number) {
  return amount + fee;
}

function l1Discount(price: number, percent: number) {
  return price - (price * percent) / 100;
}

// Your predictions here

<!-- cell: markdown -->
## LESSON 2 — Benefits, limitations, and when TypeScript is useful

### Explanation

**What TypeScript gives you**

- **Early errors.** Wrong types, missing arguments and misspelled property names are reported
  before the code runs.
- **Editor help.** Your editor knows the types, so it suggests names and underlines mistakes
  as you type.
- **Safer changes.** Rename a property, and the compiler lists every line you need to update.
- **Built-in documentation.** `refund(orderId: string, amount: number)` tells you how to call
  the function without reading its code.

**What it can't do**

- **Check your logic.** `price * 0.2` and `price * 0.8` are both numbers. The compiler can't
  know which one you meant.
- **Check data while the program runs.** Form input and API responses arrive at runtime, when
  the types are already gone. More in LESSON 11.

It also costs a little: some extra syntax, and one more command to run.

**When it's worth it.** The bigger the code, the more people working on it and the longer it
lives, the more TypeScript helps. For a short script you run once, JavaScript is often enough.

### Key Notes

- The compiler catches type mistakes: wrong types, missing arguments, misspelled properties.
- It doesn't catch logic mistakes. You still need tests.
- Data that arrives at runtime isn't checked automatically.
- TypeScript pays off most in large, shared, long-lived code.

### Example

Three mistakes that JavaScript runs without complaint. The compiler reports all three.

In the second message, `{ id: string; total: number; }` is how TypeScript describes
`l2Order`: an object whose `id` is a string and whose `total` is a number. TypeScript works
this out from the object's values (more in LESSON 8).

<!-- cell: code type-error-demo -->
// Type error on purpose (three of them).
function l2Refund(orderId: string, amount: number) {
  return `Refund ${amount} EUR for order ${orderId}`;
}

const l2Order = { id: "A-100", total: 59.9 };

// Compiler: Expected 2 arguments, but got 1.
console.log(l2Refund(l2Order.id));

// Compiler: Property 'totl' does not exist on type '{ id: string; total: number; }'. Did you mean 'total'?
console.log(l2Refund(l2Order.id, l2Order.totl));

// Compiler: Argument of type 'number' is not assignable to parameter of type 'string'.
console.log(l2Refund(l2Order.total, l2Order.id));

<!-- cell: markdown -->
And one mistake the compiler can't see, because every type is correct:

<!-- cell: code example -->
// A 20% discount should keep 80% of the price.
function l2ApplyDiscount(price: number) {
  return price * 0.2; // logic bug: should be price * 0.8
}

console.log(l2ApplyDiscount(50)); // prints 10 instead of 40, and the compiler reports nothing

<!-- cell: markdown -->
### Exercise

The shop's rule: **orders of 50 EUR or more ship for free; smaller orders pay 4.90 EUR.**

1. `l2ShippingCost` has no type errors, but it breaks the rule. Run the Verification cell to
   find the failing case, then fix the function.
2. For each bug in `l2CaughtByCompiler`, write `true` if the compiler reports it, or `false`
   if only a runtime check (like the Verification cell) would catch it.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code starter -->
// Shop rule: orders of 50 EUR or more ship for free. Smaller orders pay 4.90 EUR.
function l2ShippingCost(total: number) {
  if (total > 50) {
    return 0;
  }
  return 4.9;
}

// true = the compiler reports it, false = only a runtime check would catch it
const l2CaughtByCompiler = {
  missingArgument: false, // l2ShippingCost()
  wrongFormula: false, // total * 0.2 instead of total * 0.8
  misspelledProperty: false, // order.totl instead of order.total
  stringPassedToNumberParameter: false, // l2ShippingCost("80")
  wrongComparison: false, // total > 50 instead of total >= 50
};

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`.

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

The shop gives a **10% discount on orders of 100 EUR or more**. The cell below has two bugs:
one the compiler reports, and one it can't see.

1. Run `check:nb` (the cell is listed as `[to fix]`) and fix the type error.
2. Run the cell. For a 120 EUR cart it should print `108`. Find and fix the logic bug.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
const l2Cart = { items: 3, total: 120 };

function l2CartDiscount(total: number) {
  if (total >= 100) {
    return total * 0.1;
  }
  return 0;
}

function l2FinalPrice(total: number) {
  return total + l2CartDiscount(total);
}

console.log(l2FinalPrice(l2Cart.totl)); // should print 108

<!-- cell: markdown -->
## LESSON 3 — TypeScript in modern web development

### Explanation

TypeScript is now a standard choice for JavaScript projects:

- **Front end:** React, Vue, Svelte and Angular support it. Build tools like Vite handle
  `.ts` files out of the box.
- **Back end:** Node.js, Deno and Bun run TypeScript.
- **Libraries:** many npm packages come with **type definitions**: files that list the types
  of their functions' parameters and results. When a package doesn't include them, you can
  often install them separately as a `@types/...` package. That's how your editor knows how
  to call code you didn't write.

**Running is not checking.** Fast tools like Vite, Deno and recent Node.js remove the types
and run the code *without checking them*, just like this notebook. The type check is a
separate command (you'll run it from LESSON 5). Real projects use both: the fast tool while
developing, and the type check in the editor and before releasing the code.

So a page can work in the browser and still have type errors. Don't ignore them: a type
error often points to a real bug that today's test simply didn't hit.

### Key Notes

- TypeScript is used for front ends, back ends and libraries.
- Type definitions tell your editor and the compiler how to call a library.
- Many tools run TypeScript by removing the types, without checking them.
- The type check is a separate step. Run it before releasing code.

### Example

Imagine `l3FormatMoney` comes from a library you installed. Its parameter names and types
are all you need to call it correctly.

<!-- cell: code example -->
function l3FormatMoney(amountInCents: number, currency: string) {
  return `${(amountInCents / 100).toFixed(2)} ${currency}`;
}

console.log(l3FormatMoney(1999, "EUR")); // prints 19.99 EUR

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Argument of type 'string' is not assignable to parameter of type 'number'.
console.log(l3FormatMoney("19.99", "EUR")); // prints 0.20 EUR

<!-- cell: markdown -->
### Exercise

Complete `l3ReceiptLine` so it returns one receipt line, such as
`"2 x Coffee beans: 25.80 EUR"`. The amount is the line total (unit price × quantity),
formatted with `l3FormatMoney`. Read the parameter names before you start.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code starter -->
function l3ReceiptLine(name: string, unitPriceInCents: number, quantity: number) {
  // TODO: return a line like "2 x Coffee beans: 25.80 EUR", using l3FormatMoney
  return "";
}

console.log(l3ReceiptLine("Coffee beans", 1290, 2));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`.

<!-- cell: code verification -->
checkAll([
  ["two bags of coffee beans", l3ReceiptLine("Coffee beans", 1290, 2), "2 x Coffee beans: 25.80 EUR"],
  ["one mug", l3ReceiptLine("Mug", 850, 1), "1 x Mug: 8.50 EUR"],
  ["three stickers", l3ReceiptLine("Sticker", 99, 3), "3 x Sticker: 2.97 EUR"],
]);

<!-- cell: markdown -->
### Mini Challenge

This is what happens in a real project: the code runs fine, but the type check fails.

1. Run the cell. The result looks right: `17.00 EUR`.
2. Run `check:nb`. It reports an error in this cell (listed as `[to fix]`).
3. Fix the code so the type check passes **and** the cell still prints `17.00 EUR`.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
// The price comes from the page, so it is a string.
const l3Cart = { mugPriceInCents: "850", quantity: 2 };

console.log(l3FormatMoney(l3Cart.mugPriceInCents * l3Cart.quantity, "EUR")); // prints 17.00 EUR
