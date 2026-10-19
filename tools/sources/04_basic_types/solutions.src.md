<!-- cell: markdown -->
# TypeScript — Basic Types

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
## LESSON 12 — `string`, `number` and `boolean`

### Exercise

<!-- cell: code solution -->
function l12CheckoutMessage(customerName: string, itemCount: number, isLoggedIn: boolean) {
  if (!isLoggedIn) {
    return "Please log in";
  }
  if (itemCount === 0) {
    return "Your cart is empty";
  }
  return `Checkout for ${customerName}: ${itemCount} item(s)`;
}

console.log(l12CheckoutMessage("Ada", 2, true)); // prints Checkout for Ada: 2 item(s)

<!-- cell: markdown -->
The login check comes first, because a logged-out customer must see "Please log in" whatever
is in the cart.

**Common mistakes**

- **Checking the item count first.** A logged-out customer with an empty cart then gets
  "Your cart is empty". The second verification line catches it.
- **Writing `String`, `Number` or `Boolean`.** They compile, but they're the wrapper object
  types. Use lowercase.
- **Comparing `isLoggedIn === "true"`.** The parameter is a `boolean`, so it can never equal
  a string, and the compiler reports the comparison.

### Verification

<!-- cell: code verification -->
checkAll([
  ["logged out", l12CheckoutMessage("Ada", 2, false), "Please log in"],
  ["logged out with an empty cart", l12CheckoutMessage("Ada", 0, false), "Please log in"],
  ["logged in with an empty cart", l12CheckoutMessage("Ada", 0, true), "Your cart is empty"],
  ["logged in with items", l12CheckoutMessage("Ada", 2, true), "Checkout for Ada: 2 item(s)"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
let l12A = "Total: " + 5;
let l12B = 10 / 4;
let l12C = 5 > 3;
let l12D = Number("abc");
let l12E = Boolean("false");

console.log(l12A, l12B, l12C, l12D, l12E); // prints Total: 5 2.5 true NaN true

// l12A: string, "Total: 5"  (+ with a string joins)
// l12B: number, 2.5         (number covers decimals)
// l12C: boolean, true       (a comparison gives a boolean)
// l12D: number, NaN         (NaN is still a number)
// l12E: boolean, true       (any non-empty string is truthy, even "false")
//
// The surprise is usually l12E. The type is boolean either way, so the compiler has no way
// to tell true from false. Types describe kinds of values, not which value you get.

<!-- cell: markdown -->
`l12D` and `l12E` are both correctly typed and both probably not what you wanted. That's
the "types, not values" limit from LESSON 9 again.

<!-- cell: markdown -->
## LESSON 13 — `null` and `undefined`

### Exercise

<!-- cell: code solution -->
function l13DeliveryDays(zone: string) {
  if (zone === "domestic") {
    return 2;
  }
  if (zone === "europe") {
    return 5;
  }
  return 10;
}

const l13Days = l13DeliveryDays("europe");
console.log(`Arrives in ${l13Days.toFixed(0)} days`); // prints Arrives in 5 days

<!-- cell: markdown -->
Without the final `return`, a zone like `"asia"` fell off the end of the function and
produced `undefined`. With it, every path returns a number, so `l13Days` is always a
`number` and `toFixed` is safe.

**Common mistakes**

- **Rewriting the checks as `if` / `else if` without a final return.** The last path still
  returns nothing, so the error stays.
- **Returning `"10"`.** Now the function sometimes returns a string, and `toFixed` isn't
  available on it.
- **Deleting the `toFixed` line to silence the error.** The error goes away, but
  `l13DeliveryDays("asia")` still returns `undefined`, and the verification still fails.

### Verification

<!-- cell: code verification -->
checkAll([
  ["domestic", l13DeliveryDays("domestic"), 2],
  ["europe", l13DeliveryDays("europe"), 5],
  ["any other zone", l13DeliveryDays("asia"), 10],
  ["an empty zone", l13DeliveryDays(""), 10],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
function l13FindDiscount(code: string) {
  if (code === "WELCOME10") {
    return 10;
  }
  return null;
}

console.log(l13FindDiscount("WELCOME10"), l13FindDiscount("SUMMER")); // prints 10 null

// 1. It returns null. The compiler reports that the value is possibly 'null', because one
//    path of the function returns null.
// 2. null says "we checked, and there is deliberately no discount". undefined usually means
//    something was never set, which looks like a bug.
// 3. Because every number can then be used safely. When a value might be missing, the
//    compiler makes you deal with that case before you call a method on it.

<!-- cell: markdown -->
Strict mode turns "this might be missing" from a runtime crash into a compile-time message.

<!-- cell: markdown -->
## LESSON 14 — Annotate or infer?

### Exercise

<!-- cell: code solution -->
function l14ParseStock(text: string) {
  return Number(text.trim());
}

function l14StockLabel(stock: number) {
  let status: string;
  if (stock === 0) {
    status = "sold out";
  } else if (stock < 5) {
    status = "low";
  } else {
    status = "available";
  }
  return status;
}

let l14Stock: number = l14ParseStock(" 3 ");
console.log(l14StockLabel(l14Stock)); // prints low

<!-- cell: markdown -->
The annotation on `l14Stock` pointed at the real problem: `l14ParseStock` returned a string.
The annotation on `status` turned `status = 0` from a silent bug into a reported error.

**Common mistakes**

- **Removing `: number` from `l14Stock`.** The error doesn't disappear. It moves to the next
  line, where a string is passed to `l14StockLabel`'s `number` parameter.
- **Annotating `status` with `number`.** Then `"low"` and `"available"` become the errors.
  The labels are text, so the type is `string`.
- **Fixing the label without annotating.** The checks pass, but the next wrong assignment
  would be silent again.

### Verification

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

<!-- cell: code challenge-solution -->
// a) Infer. "EUR" already tells TypeScript it's a string.
// b) Annotate: let l14Total: number;  Without a starting value, it would accept anything.
// c) Annotate both parameters: function l14AddTax(amount: number, rate: number)
//    Strict mode requires it, and callers need to know what to pass.
// d) Annotate: let l14Price: number = l14ReadPriceFromApi();
//    If the function ever returns something else, the error points at this line.
// e) Infer. The annotation only repeats what the starting value 0 already says.

<!-- cell: markdown -->
Annotate where TypeScript can't know your intent, or where you want a guarantee. Everywhere
else, let inference do the typing.

<!-- cell: markdown -->
## LESSON 15 — Basic type checking: reading type errors

### Exercise

<!-- cell: code solution -->
// Had a string ("0.22"), expected a number: remove the quotes.
let l15VatRate: number = 0.22;

function l15LineTotal(unitPrice: number, quantity: number) {
  return unitPrice * quantity;
}

function l15InvoiceLine(product: string, unitPrice: number, quantity: number) {
  // A string has no property 'lenght': fix the typo to 'length'.
  if (product.length === 0) {
    return "Missing product name";
  }
  // Expected 2 arguments, got 1: pass the quantity too.
  const net = l15LineTotal(unitPrice, quantity);
  const gross = Math.round(net * (1 + l15VatRate) * 100) / 100;
  return `${product}: ${gross} EUR`;
}

console.log(l15InvoiceLine("Desk lamp", 40, 2)); // prints Desk lamp: 97.6 EUR

<!-- cell: markdown -->
Each fix changes the **value** or the **code**, never the annotation. The annotations were
right all along.

**Common mistakes**

- **Changing the annotation to `let l15VatRate: string`.** The first error disappears, but
  `1 + l15VatRate` now joins text (`"10.22"`) instead of adding, and new errors appear below.
- **Starting with the last error.** Early mistakes can cause later errors, so fix from the top
  and re-check.
- **Missing the typo's runtime effect.** `product.lenght` was `undefined`, so the empty-name
  check never worked. The compiler caught a bug your eyes probably skipped.

### Verification

<!-- cell: code verification -->
checkAll([
  ["two desk lamps", l15InvoiceLine("Desk lamp", 40, 2), "Desk lamp: 97.6 EUR"],
  ["one chair", l15InvoiceLine("Chair", 125, 1), "Chair: 152.5 EUR"],
  ["an empty product name", l15InvoiceLine("", 10, 1), "Missing product name"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Line 1: a number was given where a string is required. Look for a string variable
//    that is assigned a number, for example a name set to 42.
// 2. Line 6: a function that takes 3 arguments was called with only 2. Look at the call and
//    find the missing argument.
// 3. Line 8: nothing called totl exists. Probably a typo for a variable such as total.
// 4. Line 16: discount might have no value, because some path of the code that produced it
//    doesn't set one. Look for a function that doesn't return in every branch.

<!-- cell: markdown -->
You could explain all four without seeing the code. That's the skill: the message tells you
what to look for before you open the file.
