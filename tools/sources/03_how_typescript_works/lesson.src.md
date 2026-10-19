<!-- cell: markdown -->
# TypeScript — How TypeScript Works

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../03_how_typescript_works/lesson.ipynb
>   ```
>
> - Cells that start with `// Type error on purpose` are listed as `[expected]`: study them.
> - Cells that start with `// This cell has type errors on purpose. Fix them.` are listed as
>   `[to fix]`: your exercise is to make those errors disappear.

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

### Explanation

A value gets its type in one of two ways.

**Annotation: you write the type.** Put `: type` after a variable or parameter name:

```typescript
let balance: number = 250;

function deposit(balance: number, amount: number) {
  return balance + amount;
}
```

**Inference: TypeScript works it out.** When a variable gets a value right away,
TypeScript uses the type of that value:

```typescript
let owner = "Ada"; // inferred: string
let newBalance = deposit(balance, 50); // inferred: number, because deposit returns a number
```

In your editor, hover over a variable to see its type. Annotated or inferred, the type is
fixed: `owner = 42` is an error either way.

**When to annotate**

- **Parameters: always.** TypeScript can't guess what callers will pass, so strict mode
  reports a parameter without a type (TS7006, from LESSON 7).
- **Variables that start with a value: usually not.** `let count: number = 3` works, but the
  annotation repeats what TypeScript already knows.
- **Return values:** let TypeScript infer them for now. LESSON 28 covers annotating them.

### Key Notes

- Annotation: `name: type`, written by you.
- Inference: TypeScript takes the type from the value.
- Either way, the type can't change later.
- Annotate parameters. Let inference handle variables that start with a value.

### Example

<!-- cell: code example -->
// Annotations on a variable and on parameters.
let l8Balance: number = 250;

function l8Deposit(balance: number, amount: number) {
  return balance + amount;
}

// Inference: no annotations, but both variables still have a type.
let l8Owner = "Ada Lovelace"; // string
let l8NewBalance = l8Deposit(l8Balance, 50); // number

console.log(`${l8Owner} has ${l8NewBalance} EUR`); // prints Ada Lovelace has 300 EUR

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Type 'string' is not assignable to type 'number'.
l8NewBalance = "300 EUR"; // the inferred type is still number

<!-- cell: markdown -->
### Exercise

The loan calculator below has type errors: its parameters have no types.

1. Run `check:nb` and find the `[to fix]` errors for LESSON 8.
2. Add the missing annotations.
3. Complete the function: it returns the monthly payment (`loanAmount` divided by
   `months`), rounded to 2 decimals with `Math.round(value * 100) / 100`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l8MonthlyPayment(loanAmount, months) {
  // TODO: return loanAmount divided by months, rounded to 2 decimals
  return 0;
}

let l8FirstPayment = l8MonthlyPayment(1200, 12);
console.log(l8FirstPayment);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`
again: LESSON 8 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["1200 over 12 months", l8MonthlyPayment(1200, 12), 100],
  ["1000 over 3 months", l8MonthlyPayment(1000, 3), 333.33],
  ["500 over 1 month", l8MonthlyPayment(500, 1), 500],
]);

<!-- cell: markdown -->
### Mini Challenge

Read the cell below without running anything, then answer in comments:

1. What is the type of each variable?
2. Which of these assignments would the compiler report, and why?
   `l8Rate = "4%"`, `l8Label = 350`, `l8Interest = 0.5`, `l8Currency = "USD"`
3. Which annotation is unnecessary?

<!-- cell: code challenge -->
let l8Rate = 3.5;
let l8Currency = "EUR";
let l8Interest = l8Rate * 100;
let l8Label = `${l8Interest} ${l8Currency}`;
let l8Fee: number = 2;

// Your answers here

<!-- cell: markdown -->
## LESSON 9 — Static type checking

### Explanation

**Static** means "without running the code". The compiler reads your files, follows the
type of every value through every line, and reports mismatches. Nothing is executed.

Running the code only tests the lines that actually run. A branch for a rare case, such as
an international order or an unusual error, can hide a bug for months, because nobody runs
it.

The compiler checks **every** branch, every time, whether it runs or not.

Static checking knows **types**, not **values**. It knows `weightKg` is a number, so it
reports a string method such as `toUpperCase` used on it. It can't know which branch will
run, or whether `25` is a sensible hour of the day. That's still the job of runtime checks and tests (LESSON 2).

### Key Notes

- Static checking reads the code without running it.
- It checks every branch, including code that never runs in your tests.
- It knows types, not values.
- Static checks and runtime checks work together.

### Example

This function has a bug in the branch that the call below never reaches.

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l9ShippingLabel(country: string, weightKg: number) {
  if (country === "IT") {
    return `Domestic parcel: ${weightKg} kg`;
  }
  // Compiler: Property 'toUpperCase' does not exist on type 'number'.
  return `International parcel: ${weightKg.toUpperCase()} kg`;
}

console.log(l9ShippingLabel("IT", 2)); // prints Domestic parcel: 2 kg

<!-- cell: markdown -->
The cell runs without complaint, because the broken line never executes. Call it with
`"FR"` and it would crash. The compiler reports the bug either way. Here is the fixed
version, tested on both branches:

<!-- cell: code example -->
function l9FixedShippingLabel(country: string, weightKg: number) {
  if (country === "IT") {
    return `Domestic parcel: ${weightKg} kg`;
  }
  return `International parcel: ${weightKg} kg`;
}

console.log(l9FixedShippingLabel("IT", 2)); // prints Domestic parcel: 2 kg
console.log(l9FixedShippingLabel("FR", 2)); // prints International parcel: 2 kg

<!-- cell: markdown -->

### Exercise

`l9DeliveryFee` looks correct when you try the local and national zones. It isn't.

1. Run the cell. Then run `check:nb` and find the `[to fix]` error for LESSON 9.
2. Fix the international branch so it returns a **number**: 10% of the order total, rounded
   to 2 decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l9DeliveryFee(zone: string, orderTotal: number) {
  if (zone === "local") {
    return 0;
  }
  if (zone === "national") {
    return 4.9;
  }
  // International: 10% of the order total, rounded to 2 decimals.
  const fee: number = (orderTotal * 0.1).toFixed(2);
  return fee;
}

console.log(l9DeliveryFee("local", 80), l9DeliveryFee("national", 80)); // prints 0 4.9

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 9 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["local delivery is free", l9DeliveryFee("local", 80), 0],
  ["national delivery", l9DeliveryFee("national", 80), 4.9],
  ["international: 10% of 200", l9DeliveryFee("international", 200), 20],
  ["international: 10% of 89.90", l9DeliveryFee("international", 89.9), 8.99],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments, using the function in the cell below:

1. You only ever call `l9Greeting(9)`. Does the compiler still check the
   `return "Good afternoon"` line?
2. Can static checking tell you that `l9Greeting(25)` makes no sense? Why or why not?
3. A test calls `l9DeliveryFee("local", 80)` and passes. Name a kind of bug that static
   checking finds but this test doesn't.

<!-- cell: code challenge -->
function l9Greeting(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }
  return "Good afternoon";
}

// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 10 — Compile time vs runtime: TypeScript → JavaScript

### Explanation

Your code goes through two separate moments:

- **Compile time:** `tsc` reads your TypeScript, checks the types and writes JavaScript. Type
  errors are found here.
- **Runtime:** Node.js or the browser runs that JavaScript. Crashes and wrong results happen
  here.

`tsc` changes surprisingly little. It **removes the annotations** and keeps your logic as it
is:

```typescript
// src/invoice.ts
function priceWithVat(netPrice: number) {
  return Math.round(netPrice * 1.22 * 100) / 100;
}
```

```javascript
// dist/invoice.js
function priceWithVat(netPrice) {
    return Math.round(netPrice * 1.22 * 100) / 100;
}
```

So **the compiled JavaScript contains no type checks.** `netPrice: number` does not become
"stop if this isn't a number". While the program runs, only JavaScript itself can inspect a
value, for example with `typeof`.

### Key Notes

- Compile time: `tsc` checks types and writes JavaScript.
- Runtime: the JavaScript runs, and the types no longer exist.
- `tsc` removes annotations; your logic stays the same.
- To inspect a value while the program runs, use JavaScript, such as `typeof`.

### Example

<!-- cell: code example -->
function l10DescribeAmount(amount: number) {
  // typeof is JavaScript: it looks at the actual value while the code runs.
  return `${amount} is a ${typeof amount}`;
}

console.log(l10DescribeAmount(19.9)); // prints 19.9 is a number

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Argument of type 'string' is not assignable to parameter of type 'number'.
console.log(l10DescribeAmount("19.9")); // prints 19.9 is a string: nothing stops it at runtime

<!-- cell: markdown -->
### Exercise

<!-- practice: terminal -->
*Practice in the terminal.* Only the real compiler can show you what it writes. In
`ts-scratch`:

1. Create `src/invoice.ts`:

   ```typescript
   const vatRate: number = 0.22;

   function priceWithVat(netPrice: number) {
     return Math.round(netPrice * (1 + vatRate) * 100) / 100;
   }

   const customer: string = "Northwind Supplies";
   console.log(`${customer} pays ${priceWithVat(250)} EUR`);
   ```

2. Run `npm run build` and open `dist/invoice.js`. Compare it with `src/invoice.ts` line by
   line: what was removed, and what was added?
3. Run `node dist/invoice.js`.
4. Remove `: string` from `customer`, build again and compare `dist/invoice.js`. Did it
   change?

Don't open `solutions.ipynb` until you've genuinely tried.

### Verification

<!-- practice: terminal -->
- `node dist/invoice.js` prints `Northwind Supplies pays 305 EUR`.
- `dist/invoice.js` has no `: number` or `: string` anywhere, and starts with
  `"use strict";`.
- In step 4, `dist/invoice.js` is exactly the same as before.

### Mini Challenge

Use the cell below. Answer in comments:

1. Write the JavaScript that `tsc` would produce for the code in the cell (you can skip
   `"use strict";`).
2. Who notices each problem first: the **compiler**, a **crash at runtime**, or **nobody**
   (the result is just wrong)?
   - a) `l10FinalPrice("80", 0.1)`
   - b) `l10FinalPrice(80, 10)`, from someone who meant "10%"
   - c) `l10FinalPrise(80, 0.1)`, with a typo in the name

<!-- cell: code challenge -->
let l10Discount: number = 0.1;

function l10FinalPrice(price: number, discount: number) {
  return price - price * discount;
}

console.log(l10FinalPrice(80, l10Discount)); // prints 72

// 1.
// 2.

<!-- cell: markdown -->
## LESSON 11 — What TypeScript does and does not protect against

### Explanation

**TypeScript protects you from type mistakes in the code it can see:** wrong types, missing
arguments, misspelled names, and methods used on the wrong type, in every branch.

**It does not protect you from:**

- **Data from outside.** Form input, files, API responses and `JSON.parse` results only
  arrive at runtime, so the compiler never sees them. If you write
  `const quantity: number = JSON.parse(text)`, TypeScript takes your word for it. (LESSON 21
  explains why this line is allowed.)
- **Wrong values and wrong logic.** `10` instead of `0.1`, or `*` instead of `+`. The types
  are correct, so nothing is reported.

For data from outside, write a **runtime check** in plain JavaScript: look at the value
before you trust it.

### Key Notes

- TypeScript checks the code you write, not the data your program receives.
- An annotation on outside data is a promise, not a check.
- Logic and value mistakes still need tests.
- Check outside data at runtime, where it enters your program.

### Example

A cart saved as JSON, for example in `localStorage`, stores the quantity as a string.

<!-- cell: code example -->
const l11Saved = '{"quantity": "3"}';

// The compiler accepts this annotation without checking the data.
const l11Quantity: number = JSON.parse(l11Saved).quantity;
console.log(typeof l11Quantity, l11Quantity + 1); // prints string 31

// A runtime check: convert, then make sure the result really is a whole number.
const l11Checked = Number(JSON.parse(l11Saved).quantity);
console.log(Number.isInteger(l11Checked) ? l11Checked + 1 : "invalid quantity"); // prints 4

<!-- cell: markdown -->
There is no type error anywhere in that cell, yet `l11Quantity` holds a string. Only the
runtime check catches the problem.

### Exercise

A quantity field on an order form sends text. TypeScript guarantees it's a `string`, but not
that it contains a sensible quantity.

Complete `l11ParseQuantity` so it returns the quantity as a number when the text is a
**whole number from 1 to 99**, and `0` for anything else. `Number.isInteger` from the
Example will help.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code starter -->
function l11ParseQuantity(text: string) {
  // TODO: return the quantity (1 to 99, whole numbers only), or 0 when it isn't valid
  return 0;
}

console.log(l11ParseQuantity("3"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`.

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

For each situation, would TypeScript protect you? Answer **yes** or **no** in a comment, with
a short reason.

1. Calling `l11ParseQuantity(3)` with a number instead of a string.
2. An API sends `"three"` where you expected a quantity.
3. `const l11Stock: number = JSON.parse('"12"');`
4. Using `*` instead of `+` when adding the shipping cost to a total.
5. Typing `total.toFixd(2)` instead of `total.toFixed(2)`.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
// 5.
