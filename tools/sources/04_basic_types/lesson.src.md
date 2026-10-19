<!-- cell: markdown -->
# TypeScript — Basic Types

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../04_basic_types/lesson.ipynb
>   ```
>
> - `[expected]` errors come from cells that start with `// Type error on purpose`: study them.
> - `[to fix]` errors come from cells that start with
>   `// This cell has type errors on purpose. Fix them.`: make them disappear.

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
## LESSON 12 — `string`, `number` and `boolean`

### Explanation

These three **primitive types** cover most everyday values:

| Type | Values | Examples |
|---|---|---|
| `string` | text | `"Ada"`, `"A-100"` |
| `number` | any number: whole, decimal, negative, even `NaN` | `42`, `19.99`, `-5` |
| `boolean` | `true` or `false` | `true` |

There is no separate type for whole numbers and decimals. `number` covers both.

Write type names in **lowercase**. `String`, `Number` and `Boolean` with a capital letter are
JavaScript's wrapper objects, not the types you want.

The type decides what you can do with a value: a `string` has `toUpperCase()`, a `number` has
`toFixed()`, and a `boolean` has neither.

Watch out for values that only **look** like another type: `"42"` and `"true"` are both
strings.

### Key Notes

- `string`, `number` and `boolean`, always in lowercase.
- `number` covers whole numbers and decimals alike.
- A value's type decides which methods you can use on it.
- `"42"` and `"true"` are strings, not a number and a boolean.

### Example

<!-- cell: code example -->
let l12Customer: string = "Grace Hopper";
let l12Points: number = 1250.5;
let l12IsMember: boolean = true;

console.log(`${l12Customer.toUpperCase()} has ${l12Points.toFixed(0)} points. Member: ${l12IsMember}`);
// prints GRACE HOPPER has 1251 points. Member: true

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Type 'string' is not assignable to type 'boolean'.
let l12NewsletterOptIn: boolean = "true";

// Compiler: Type 'string' is not assignable to type 'number'.
let l12Discount: number = "15";

console.log(l12NewsletterOptIn, l12Discount); // prints true 15, but both values are strings

<!-- cell: markdown -->
### Exercise

1. Annotate the three parameters of `l12CheckoutMessage` with the right primitive types.
2. Complete the function:
   - not logged in: `"Please log in"`
   - logged in with 0 items: `"Your cart is empty"`
   - otherwise: `"Checkout for Ada: 2 item(s)"`, using the name and the item count

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l12CheckoutMessage(customerName, itemCount, isLoggedIn) {
  // TODO: return the right message (see the Exercise)
  return "";
}

console.log(l12CheckoutMessage("Ada", 2, true));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 12 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["logged out", l12CheckoutMessage("Ada", 2, false), "Please log in"],
  ["logged out with an empty cart", l12CheckoutMessage("Ada", 0, false), "Please log in"],
  ["logged in with an empty cart", l12CheckoutMessage("Ada", 0, true), "Your cart is empty"],
  ["logged in with items", l12CheckoutMessage("Ada", 2, true), "Checkout for Ada: 2 item(s)"],
]);

<!-- cell: markdown -->
### Mini Challenge

Without running the cell, write the **type** and the **value** of each variable in a comment.
Then run it to check the values. Which result surprises you, and why doesn't the type warn you?

<!-- cell: code challenge -->
let l12A = "Total: " + 5;
let l12B = 10 / 4;
let l12C = 5 > 3;
let l12D = Number("abc");
let l12E = Boolean("false");

console.log(l12A, l12B, l12C, l12D, l12E);

// Your answers here

<!-- cell: markdown -->
## LESSON 13 — `null` and `undefined`

### Explanation

Both mean "no value", with a small difference:

- **`undefined`**: nothing was set. For example, a variable without a value, or a function
  that ends without returning anything.
- **`null`**: empty on purpose. A programmer wrote it, for example "no coupon applied".

In strict mode, `null` and `undefined` are **types of their own**. A `string` can't hold
them:

```typescript
let coupon: string = null; // Type 'null' is not assignable to type 'string'.
```

This protects you from JavaScript's most common crash: calling a method on a value that
isn't there ("Cannot read properties of undefined").

Right now you'll mostly meet `undefined` in a function that **doesn't return in every
branch**. TypeScript notices, and reports it when you use the result:

```typescript
function membershipLabel(points: number) {
  if (points >= 1000) {
    return "gold";
  }
}

const label = membershipLabel(50);
label.toUpperCase(); // 'label' is possibly 'undefined'.
```

The fix: make every branch return a value. Using a variable before giving it one is reported
too: `Variable 'total' is used before being assigned.`

When a value may really be missing on purpose, you'll write "a string **or** null" with `|`
in LESSON 22.

### Key Notes

- `undefined`: nothing was set. `null`: empty on purpose.
- In strict mode, `string`, `number` and `boolean` can't hold `null` or `undefined`.
- A function that doesn't return in every branch can give you `undefined`.
- "possibly 'undefined'" means some path produces no value. Fix the path.

### Example

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l13ShippingZone(country: string) {
  if (country === "IT") {
    return "domestic";
  }
  if (country === "FR") {
    return "europe";
  }
}

const l13Zone = l13ShippingZone("IT");
// Compiler: 'l13Zone' is possibly 'undefined'.
console.log(l13Zone.toUpperCase()); // prints DOMESTIC, but "US" would crash here

// Compiler: Type 'null' is not assignable to type 'string'.
let l13Coupon: string = null;

<!-- cell: markdown -->
The fixed version returns a value on every path, so the result is always a string:

<!-- cell: code example -->
function l13FixedShippingZone(country: string) {
  if (country === "IT") {
    return "domestic";
  }
  if (country === "FR") {
    return "europe";
  }
  return "international";
}

console.log(l13FixedShippingZone("US").toUpperCase()); // prints INTERNATIONAL

<!-- cell: markdown -->
### Exercise

1. Run `check:nb` and find the `[to fix]` error for LESSON 13.
2. Fix `l13DeliveryDays` so every zone gets a number: `"domestic"` takes 2 days, `"europe"`
   takes 5, and **any other zone** takes 10.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l13DeliveryDays(zone: string) {
  if (zone === "domestic") {
    return 2;
  }
  if (zone === "europe") {
    return 5;
  }
  // TODO: every other zone takes 10 days
}

const l13Days = l13DeliveryDays("europe");
console.log(`Arrives in ${l13Days.toFixed(0)} days`);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 13 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["domestic", l13DeliveryDays("domestic"), 2],
  ["europe", l13DeliveryDays("europe"), 5],
  ["any other zone", l13DeliveryDays("asia"), 10],
  ["an empty zone", l13DeliveryDays(""), 10],
]);

<!-- cell: markdown -->
### Mini Challenge

Use the cell below. Answer in comments:

1. What does `l13FindDiscount("SUMMER")` return? What would the compiler say about
   `l13FindDiscount("SUMMER").toFixed(2)`?
2. This function uses `null` for "no discount". Why is `null` a better choice here than
   `undefined`?
3. In your own words: why is it useful that strict mode keeps `null` out of `number`?

<!-- cell: code challenge -->
function l13FindDiscount(code: string) {
  if (code === "WELCOME10") {
    return 10;
  }
  return null;
}

console.log(l13FindDiscount("WELCOME10"), l13FindDiscount("SUMMER"));

// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 14 — Annotate or infer?

### Explanation

LESSON 8 gave you the basic rule: annotate parameters, and let inference handle variables
that start with a value. Two situations need a closer look.

**1. A variable without a starting value.** `let status;` has no type yet, so TypeScript
lets it take whatever you assign, even a number in one branch and a string in another. It
reports nothing. Annotate it, and a wrong assignment becomes an error:

```typescript
let status: string;
status = 0; // Type 'number' is not assignable to type 'string'.
```

**2. A value you expect to have a certain type.** Inference copies whatever a function
returns. If that function is wrong, the error appears later, where you *use* the value. An
annotation states what you expect, so the error points at the line that *creates* the value,
which is where the problem is.

| Situation | Annotate or infer? |
|---|---|
| Parameter | Annotate |
| Variable with a starting value | Infer |
| Variable without a starting value | Annotate |
| Value whose type you want to guarantee | Annotate |

### Key Notes

- `let x;` without an annotation accepts any value, silently.
- Give a variable without a starting value an annotation.
- An annotation moves the error to where a wrong value is created.
- Don't annotate what inference already gets right.

### Example

<!-- cell: code example -->
function l14StockStatus(stock: number) {
  let status; // no starting value and no annotation
  if (stock === 0) {
    status = 0; // a mistake, and the compiler accepts it
  } else {
    status = "available";
  }
  return status;
}

console.log(l14StockStatus(0), l14StockStatus(8)); // prints 0 available

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l14ReadStock(text: string) {
  return text.trim(); // bug: returns a string, not a number
}

// Inferred: the error appears where the value is used.
let l14StockA = l14ReadStock(" 12 ");
// Compiler: Argument of type 'string' is not assignable to parameter of type 'number'.
console.log(Math.round(l14StockA));

// Annotated: the error appears where the value is created.
// Compiler: Type 'string' is not assignable to type 'number'.
let l14StockB: number = l14ReadStock(" 12 ");

<!-- cell: markdown -->
### Exercise

The stock report below has one `[to fix]` error and one silent bug.

1. Fix the `[to fix]` error by fixing `l14ParseStock` so it returns the **number** in the
   text. Don't remove the annotation on `l14Stock`.
2. Annotate `status` in `l14StockLabel`. Run `check:nb`: the compiler now reports the silent
   bug. Fix it: a stock of 0 gets the label `"sold out"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l14ParseStock(text: string) {
  return text.trim();
}

function l14StockLabel(stock: number) {
  let status;
  if (stock === 0) {
    status = 0;
  } else if (stock < 5) {
    status = "low";
  } else {
    status = "available";
  }
  return status;
}

let l14Stock: number = l14ParseStock(" 3 ");
console.log(l14StockLabel(l14Stock));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 14 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["parse a padded number", l14ParseStock(" 12 "), 12],
  ["parse a plain number", l14ParseStock("7"), 7],
  ["sold out", l14StockLabel(0), "sold out"],
  ["low stock", l14StockLabel(3), "low"],
  ["available", l14StockLabel(20), "available"],
]);

<!-- cell: markdown -->
### Mini Challenge

For each line, decide: **annotate** or **infer**? Answer in a comment with a short reason.
If you'd annotate, write the annotation.

<!-- cell: code challenge -->
// a) let l14Currency = "EUR";
// b) let l14Total;   (it gets its value later, inside an if/else)
// c) function l14AddTax(amount, rate) { return amount * (1 + rate); }
// d) let l14Price = l14ReadPriceFromApi();   (you expect a number, but someone else wrote the function)
// e) let l14Count: number = 0;

// Your answers here

<!-- cell: markdown -->
## LESSON 15 — Basic type checking: reading type errors

### Explanation

You already know where an error is (`file(line,column)`, LESSON 5). This lesson is about
**what it means**. Most messages you'll see so far are one of these:

| Message | Read it as |
|---|---|
| `Type 'A' is not assignable to type 'B'.` | You gave an A where a B is required. |
| `Argument of type 'A' is not assignable to parameter of type 'B'.` | You passed an A to a parameter that takes a B. |
| `Property 'x' does not exist on type 'T'.` | A T has no `x`: a typo, or the value isn't the type you think. |
| `Expected 2 arguments, but got 1.` | A call has the wrong number of arguments. |
| `Cannot find name 'x'.` | Nothing called `x` is declared: a typo, or a missing variable. |
| `'x' is possibly 'undefined'.` | Some path leaves `x` without a value. |

A strategy that works:

1. **Start with the first error.** One mistake can cause more errors below it.
2. **Read it as "what I have" vs "what was expected".** Then decide which side is wrong.
   Usually it's the value, not the annotation.
3. **Fix the cause, then check again.** Deleting an annotation to silence an error only hides
   the problem (LESSON 14).

### Key Notes

- "Not assignable" means the value's type doesn't match what the place expects.
- "Does not exist" and "Cannot find name" usually mean a typo.
- Fix the first error first, then re-check.
- Fix the value, not the annotation, unless the annotation is really wrong.

### Example

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l15ReceiptTotal(subtotal: number, shipping: number) {
  return subtotal + shipping;
}

function l15PrintReceipt() {
  // Compiler: Cannot find name 'l15Subtotal'.
  console.log(l15ReceiptTotal(l15Subtotal, 4.9));
}

// Compiler: Expected 2 arguments, but got 1.
console.log(l15ReceiptTotal(20)); // prints NaN

let l15Title = "Receipt";
// Compiler: Property 'lenght' does not exist on type 'string'. Did you mean 'length'?
console.log(l15Title.lenght); // prints undefined

<!-- cell: markdown -->
`l15PrintReceipt` is never called, yet its error is still reported: static checking reads
every line (LESSON 9). The fixed calls:

<!-- cell: code example -->
const l15FixedSubtotal = 20;
console.log(l15ReceiptTotal(l15FixedSubtotal, 4.9), l15Title.length); // prints 24.9 7

<!-- cell: markdown -->
### Exercise

The invoice cell below has three `[to fix]` errors, and it prints `Desk lamp: NaN EUR`.

1. Run `check:nb`. For each LESSON 15 error, **before changing anything**, write a comment
   above the line: what you have, what was expected, and your fix.
2. Fix the errors, from the first to the last.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
let l15VatRate: number = "0.22";

function l15LineTotal(unitPrice: number, quantity: number) {
  return unitPrice * quantity;
}

function l15InvoiceLine(product: string, unitPrice: number, quantity: number) {
  if (product.lenght === 0) {
    return "Missing product name";
  }
  const net = l15LineTotal(unitPrice);
  const gross = Math.round(net * (1 + l15VatRate) * 100) / 100;
  return `${product}: ${gross} EUR`;
}

console.log(l15InvoiceLine("Desk lamp", 40, 2));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 15 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["two desk lamps", l15InvoiceLine("Desk lamp", 40, 2), "Desk lamp: 97.6 EUR"],
  ["one chair", l15InvoiceLine("Chair", 125, 1), "Chair: 152.5 EUR"],
  ["an empty product name", l15InvoiceLine("", 10, 1), "Missing product name"],
]);

<!-- cell: markdown -->
### Mini Challenge

A teammate sends you only the compiler output for a file called `invoice.ts`. For each
error, write in a comment what it means in plain words and what you'd look for in the code.

```text
invoice.ts(1,5): error TS2322: Type 'number' is not assignable to type 'string'.
invoice.ts(6,13): error TS2554: Expected 3 arguments, but got 2.
invoice.ts(8,13): error TS2304: Cannot find name 'totl'.
invoice.ts(16,13): error TS18048: 'discount' is possibly 'undefined'.
```

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
