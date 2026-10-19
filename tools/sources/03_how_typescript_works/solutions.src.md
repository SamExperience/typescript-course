<!-- cell: markdown -->
# TypeScript — How TypeScript Works

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
## LESSON 8 — Type annotations and type inference

### Exercise

<!-- cell: code solution -->
function l8MonthlyPayment(loanAmount: number, months: number) {
  return Math.round((loanAmount / months) * 100) / 100;
}

let l8FirstPayment = l8MonthlyPayment(1200, 12);
console.log(l8FirstPayment); // prints 100

<!-- cell: markdown -->
Both parameters need an annotation, because nothing tells TypeScript what callers will pass.
`l8FirstPayment` needs none: it is inferred as `number` from what the function returns.

**Common mistakes**

- **Rounding with `toFixed(2)`.** It returns a *string* (`"333.33"`), so the function now
  returns a string, `l8FirstPayment` is inferred as a string, and the checks fail.
- **Annotating only one parameter.** `check:nb` still reports TS7006 for the other one.
- **Adding `: number` to `l8FirstPayment`.** Not wrong, but unnecessary: the type is already
  inferred.

### Verification

<!-- cell: code verification -->
checkAll([
  ["1200 over 12 months", l8MonthlyPayment(1200, 12), 100],
  ["1000 over 3 months", l8MonthlyPayment(1000, 3), 333.33],
  ["500 over 1 month", l8MonthlyPayment(500, 1), 500],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
let l8Rate = 3.5;
let l8Currency = "EUR";
let l8Interest = l8Rate * 100;
let l8Label = `${l8Interest} ${l8Currency}`;
let l8Fee: number = 2;

// 1. l8Rate: number, l8Currency: string, l8Interest: number (number * number),
//    l8Label: string (a template literal is always a string), l8Fee: number.
// 2. l8Rate = "4%"      -> reported: a string where a number belongs.
//    l8Label = 350      -> reported: a number where a string belongs.
//    l8Interest = 0.5   -> fine: still a number.
//    l8Currency = "USD" -> fine: still a string.
// 3. The ": number" on l8Fee. The value 2 already tells TypeScript it's a number.

<!-- cell: markdown -->
Inferred types are just as strict as annotated ones. Inference only saves you from writing
what TypeScript can already see.

<!-- cell: markdown -->
## LESSON 9 — Static type checking

### Exercise

<!-- cell: code solution -->
function l9DeliveryFee(zone: string, orderTotal: number) {
  if (zone === "local") {
    return 0;
  }
  if (zone === "national") {
    return 4.9;
  }
  // International: 10% of the order total, rounded to 2 decimals.
  const fee: number = Math.round(orderTotal * 0.1 * 100) / 100;
  return fee;
}

console.log(l9DeliveryFee("local", 80), l9DeliveryFee("national", 80)); // prints 0 4.9

<!-- cell: markdown -->
`toFixed(2)` returns a **string**, so `const fee: number = ...toFixed(2)` is a type error.
At runtime the function returned `"20.00"` instead of `20`, but only for international
orders, which the cell never called. `Math.round(value * 100) / 100` keeps it a number.

**Common mistakes**

- **Deleting `: number` to make the error go away.** `check:nb` goes quiet, but `fee` is
  now inferred as a string and the international checks still fail. The annotation was
  right; the value was wrong.
- **Testing only the zones the cell already calls.** Everything looks fine until an
  international order arrives. That's the point of static checking.

### Verification

<!-- cell: code verification -->
checkAll([
  ["local delivery is free", l9DeliveryFee("local", 80), 0],
  ["national delivery", l9DeliveryFee("national", 80), 4.9],
  ["international: 10% of 200", l9DeliveryFee("international", 200), 20],
  ["international: 10% of 89.90", l9DeliveryFee("international", 89.9), 8.99],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
function l9Greeting(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }
  return "Good afternoon";
}

// 1. Yes. Static checking reads every line, whether it runs or not.
// 2. No. 25 is a number, so the type is correct. The compiler knows types, not which
//    values make sense. A runtime check is needed for that.
// 3. A type mistake in a branch the test never reaches, such as the international branch
//    returning a string instead of a number.

<!-- cell: markdown -->
Tests check the paths you run. Static checking covers every path for type mistakes. You need
both.

<!-- cell: markdown -->
## LESSON 10 — Compile time vs runtime: TypeScript → JavaScript

### Exercise

<!-- practice: terminal -->
`dist/invoice.js` after `npm run build`:

```javascript
"use strict";
const vatRate = 0.22;
function priceWithVat(netPrice) {
    return Math.round(netPrice * (1 + vatRate) * 100) / 100;
}
const customer = "Northwind Supplies";
console.log(`${customer} pays ${priceWithVat(250)} EUR`);
```

- **Removed:** every annotation (`: number`, `: string`) and the blank lines.
- **Added:** `"use strict";` at the top, which switches on JavaScript's strict mode.
- **Changed:** only the formatting (indentation). The logic is identical.

In step 4, `dist/invoice.js` doesn't change at all. `const customer = "Northwind Supplies"`
compiles to the same JavaScript whether the type was annotated or inferred.

**Common mistakes**

- **Looking for a type check in `dist/invoice.js`.** There isn't one. Annotations only exist
  at compile time.
- **Comparing with an old `dist/` file.** Run `npm run build` again after every change to
  `src/`.

### Verification

<!-- practice: terminal -->
`node dist/invoice.js` prints `Northwind Supplies pays 305 EUR`, and the compiled file
contains no annotations.

### Mini Challenge

<!-- cell: code challenge-solution -->
let l10Discount: number = 0.1;

function l10FinalPrice(price: number, discount: number) {
  return price - price * discount;
}

console.log(l10FinalPrice(80, l10Discount)); // prints 72

// 1. let l10Discount = 0.1;
//    function l10FinalPrice(price, discount) {
//        return price - price * discount;
//    }
//    console.log(l10FinalPrice(80, l10Discount));
//
// 2. a) The compiler: a string is passed where a number belongs. (At runtime it would even
//       print 72, because - and * turn "80" into a number.)
//    b) Nobody. Both arguments are numbers, so the compiler is satisfied, and nothing
//       crashes: it just prints -720.
//    c) The compiler: it cannot find a function with that name. If the code ran anyway, it
//       would crash with a ReferenceError.

<!-- cell: markdown -->
Case b is the kind of bug no type annotation can catch, because the mistake is in the value,
not the type. LESSON 11 looks at more of these limits.

<!-- cell: markdown -->
## LESSON 11 — What TypeScript does and does not protect against

### Exercise

<!-- cell: code solution -->
function l11ParseQuantity(text: string) {
  const quantity = Number(text);
  if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99) {
    return quantity;
  }
  return 0;
}

console.log(l11ParseQuantity("3")); // prints 3

<!-- cell: markdown -->
`Number(text)` turns the text into a number, or `NaN` when it can't. `Number.isInteger`
rejects `NaN` and decimals, and the two comparisons enforce the range. An empty field becomes
`0`, which fails `quantity >= 1`.

**Common mistakes**

- **Using `parseInt`.** `parseInt("2.5")` is `2` and `parseInt("3 boxes")` is `3`, so invalid
  text slips through as a valid quantity.
- **Checking only `quantity > 0`.** `"150"` passes, and so would `"2.5"` without
  `Number.isInteger`.
- **Trusting the parameter type.** `text: string` only says it's a string. Whether that
  string is a valid quantity is a runtime question.

### Verification

<!-- cell: code verification -->
checkAll([
  ["a normal quantity", l11ParseQuantity("3"), 3],
  ["the largest allowed quantity", l11ParseQuantity("99"), 99],
  ["not a number", l11ParseQuantity("three"), 0],
  ["a decimal", l11ParseQuantity("2.5"), 0],
  ["too many", l11ParseQuantity("150"), 0],
  ["an empty field", l11ParseQuantity(""), 0],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Yes. The compiler reports a number passed where a string belongs.
// 2. No. The data only arrives at runtime, so the compiler never sees it.
// 3. No. TypeScript trusts the annotation on JSON.parse's result, but at runtime
//    l11Stock holds the string "12".
// 4. No. Both are valid operations on numbers. It's a logic mistake, so only a test finds it.
// 5. Yes. The compiler reports that toFixd doesn't exist on type 'number'.

<!-- cell: markdown -->
A useful rule: the compiler guards your code, and runtime checks guard the edges where data
enters your program.
