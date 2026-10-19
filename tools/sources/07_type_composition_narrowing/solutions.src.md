<!-- cell: markdown -->
# TypeScript — Type Composition and Narrowing

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
## LESSON 21 — `any` vs `unknown`

### Exercise

<!-- cell: code solution -->
function l21ParseDiscount(value: unknown) {
  let percent = 0;
  if (typeof value === "number") {
    percent = value;
  } else if (typeof value === "string") {
    percent = Number(value);
  } else {
    return 0;
  }

  if (percent >= 0 && percent <= 100) {
    return percent;
  }
  return 0;
}

console.log(l21ParseDiscount(JSON.parse("15"))); // prints 15

<!-- cell: markdown -->
The `typeof` checks are what make `unknown` usable: inside each `if`, TypeScript knows what
`value` is. A string that isn't a number becomes `NaN`, and `NaN >= 0` is `false`, so it
falls through to `0`.

**Common mistakes**

- **Changing `unknown` to `any`.** The error disappears, but `true * 1` is `1` and `150` is
  accepted, so three checks fail. `any` hid exactly the cases you had to handle.
- **Handling only numbers.** `"25"` comes back as `0`, and the numeric-string check fails.
- **Checking the range before converting.** `"25" >= 0` compares a string with a number. With
  `unknown`, the compiler won't even allow it until you've checked the type.

### Verification

<!-- cell: code verification -->
checkAll([
  ["a number", l21ParseDiscount(15), 15],
  ["a numeric string", l21ParseDiscount("25"), 25],
  ["zero", l21ParseDiscount(0), 0],
  ["out of range", l21ParseDiscount(150), 0],
  ["text that isn't a number", l21ParseDiscount("half"), 0],
  ["a boolean", l21ParseDiscount(true), 0],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. unknown: you don't control that data, so check it before using it.
// 2. A specific type, number: you know exactly what it must be.
// 3. any, temporarily: it gets the file compiling, but every any is a spot to fix later.
// 4. unknown: the helper accepts any value and only compares it, never uses it.
// Last question: l21Name is any too. any spreads to everything read from it, so a typo such
// as l21Name.toUppercase() would never be reported.

<!-- cell: markdown -->
`unknown` moves the "is this really a number?" question to compile time. `any` postpones it to
runtime, when a customer finds the bug.

<!-- cell: markdown -->
## LESSON 22 — Union types

### Exercise

<!-- cell: code solution -->
function l22PaymentReference(reference: string | number | null) {
  if (reference === null) {
    return "NO-REF";
  }
  if (typeof reference === "number") {
    return `INV-${reference}`;
  }
  return reference.toUpperCase();
}

const l22References: (string | number | null)[] = [1042, "ord-7a", null];

console.log(l22PaymentReference(1042)); // prints INV-1042

<!-- cell: markdown -->
After the `null` check and the `number` check, only one member is left, so TypeScript knows
`reference` is a string on the last line.

**Common mistakes**

- **Writing `string | number | null[]` without parentheses.** That means "a string, or a
  number, or an array of nulls", so the array itself is rejected.
- **Calling `toUpperCase()` before handling `null`.** After the `number` check, the value can
  still be a string **or** `null`, and the compiler reports that it's possibly `null`.
- **Adding `boolean` to the union "to be safe".** Nothing sends a boolean, and every caller
  would have to handle one.

### Verification

<!-- cell: code verification -->
checkAll([
  ["an invoice number", l22PaymentReference(1042), "INV-1042"],
  ["an order code", l22PaymentReference("ord-7a"), "ORD-7A"],
  ["no reference", l22PaymentReference(null), "NO-REF"],
  [
    "the whole list",
    l22References.map((reference) => l22PaymentReference(reference)),
    ["INV-1042", "ORD-7A", "NO-REF"],
  ],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
function l22ParseAmount(text: string) {
  if (text === "") {
    return null;
  }
  return Number(text);
}

const l22Parsed = l22ParseAmount("12.5");

if (l22Parsed !== null) {
  console.log(l22Parsed.toFixed(2)); // prints 12.50
}

// 1. number | null. One branch returns null and the other returns a number.
// 2. It might be null, and null has no toFixed. The if above checks for null first, so inside
//    it TypeScript knows l22Parsed is a number.
// 3. It returns a number in one case and null in another. Without unions, that couldn't be
//    written down, so mini-project 1 banned it. Now the type says so honestly, and the compiler
//    makes every caller handle null.

<!-- cell: markdown -->
A union in a return type isn't a problem when it's intentional. It's documentation that the
compiler enforces.

<!-- cell: markdown -->
## LESSON 23 — Literal types

### Exercise

<!-- cell: code solution -->
function l23PlanLabel(card: "visa" | "mastercard" | "amex", months: 1 | 3 | 6 | 12) {
  if (card === "amex" && months !== 1) {
    return "Not available";
  }
  if (months === 1) {
    return `${card.toUpperCase()}: pay in full`;
  }
  return `${card.toUpperCase()}: ${months} monthly payments`;
}

const l23Order: { total: number; card: "visa" | "mastercard" | "amex"; months: 1 | 3 | 6 | 12 } = {
  total: 600,
  card: "visa",
  months: 6,
};

console.log(l23PlanLabel(l23Order.card, l23Order.months)); // prints VISA: 6 monthly payments

<!-- cell: markdown -->
The annotations on the parameters caused a new error at the call: without its own
annotation, `l23Order` had `card: string` and `months: number`, which are wider than the
parameters allow. Annotating the object keeps the literal unions.

**Common mistakes**

- **Annotating the parameters but not `l23Order`.** The call is then reported, because
  object properties widen to `string` and `number`.
- **Typing `months` as `number`.** Then `l23PlanLabel("visa", 5)` compiles, even though no
  5-month plan exists.
- **Comparing with `"Amex"`.** The capital letter makes it a value that `card` can never be,
  and the compiler reports the comparison as unintentional.

### Verification

<!-- cell: code verification -->
checkAll([
  ["visa in full", l23PlanLabel("visa", 1), "VISA: pay in full"],
  ["mastercard over 6 months", l23PlanLabel("mastercard", 6), "MASTERCARD: 6 monthly payments"],
  ["amex in full", l23PlanLabel("amex", 1), "AMEX: pay in full"],
  ["amex in installments", l23PlanLabel("amex", 3), "Not available"],
  ["the sample order", l23PlanLabel(l23Order.card, l23Order.months), "VISA: 6 monthly payments"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
const l23Plan = "annual";
let l23Tier = "gold";
const l23Settings: { theme: "light" | "dark" } = { theme: "dark" };

function l23ApplyTheme(theme: "light" | "dark") {
  return `Theme: ${theme}`;
}

console.log(l23ApplyTheme(l23Settings.theme), l23Plan, l23Tier); // prints Theme: dark annual gold

// 1. l23Plan: "annual". l23Tier: string. l23Settings.theme: string (before the annotation).
// 2. Not with the original object: its theme is a string. Annotating the object with
//    { theme: "light" | "dark" } makes it accepted, as above.
// 3. A let variable or an object property can be given a different value later, so
//    TypeScript assumes any string is possible. A const can never change, so its exact value
//    is its type.

<!-- cell: markdown -->
When a literal union "doesn't fit", look for a value that was widened on its way to the call.

<!-- cell: markdown -->
## LESSON 24 — Type aliases and custom types

### Exercise

<!-- cell: code solution -->
type L24Currency = "EUR" | "USD" | "GBP";
type L24Account = { owner: string; balance: number; currency: L24Currency };
type L24TransferStatus = "completed" | "rejected";
type L24Transfer = { from: L24Account; to: L24Account; amount: number; status: L24TransferStatus };

function l24MakeTransfer(from: L24Account, to: L24Account, amount: number) {
  if (from.currency !== to.currency || amount <= 0 || amount > from.balance) {
    const rejected: L24Transfer = { from, to, amount, status: "rejected" };
    return rejected;
  }
  from.balance = from.balance - amount;
  to.balance = to.balance + amount;
  const completed: L24Transfer = { from, to, amount, status: "completed" };
  return completed;
}

const l24Ada: L24Account = { owner: "Ada", balance: 250, currency: "EUR" };
const l24Bob: L24Account = { owner: "Bob", balance: 40, currency: "EUR" };
console.log(l24MakeTransfer(l24Ada, l24Bob, 100).status); // prints completed

<!-- cell: markdown -->
The rejection check comes first, so a rejected transfer returns before any balance changes.
Each result is built in a variable typed `L24Transfer`, so `status` keeps its literal union.

**Common mistakes**

- **Returning `{ from, to, amount, status: "completed" }` directly.** The returned object's
  `status` widens to `string` (LESSON 23), so storing the result as an `L24Transfer` later is
  reported. Building it in a typed variable avoids that. LESSON 28 shows another way.
- **Declaring `status: string` in the alias.** Everything compiles, but a typo such as
  `"complete"` is no longer caught.
- **Changing the balances before checking the rules.** A rejected transfer must leave both
  accounts untouched; the "changes nothing" check catches it.

### Verification

<!-- cell: code verification -->
const l24Sender: L24Account = { owner: "Ada", balance: 250, currency: "EUR" };
const l24Receiver: L24Account = { owner: "Bob", balance: 40, currency: "EUR" };
const l24Done = l24MakeTransfer(l24Sender, l24Receiver, 100);
const l24TooMuch = l24MakeTransfer({ owner: "Cy", balance: 10, currency: "EUR" }, { owner: "Di", balance: 0, currency: "EUR" }, 50);
const l24Mixed = l24MakeTransfer({ owner: "Ed", balance: 500, currency: "EUR" }, { owner: "Flo", balance: 0, currency: "USD" }, 50);
const l24Zero = l24MakeTransfer({ owner: "Gus", balance: 100, currency: "GBP" }, { owner: "Hal", balance: 0, currency: "GBP" }, 0);

checkAll([
  ["a valid transfer is completed", l24Done.status, "completed"],
  ["the sender's new balance", l24Sender.balance, 150],
  ["the receiver's new balance", l24Receiver.balance, 140],
  ["too little money is rejected", l24TooMuch.status, "rejected"],
  ["different currencies are rejected", l24Mixed.status, "rejected"],
  ["a rejected transfer changes nothing", l24Mixed.from.balance, 500],
  ["a zero amount is rejected", l24Zero.status, "rejected"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
type L24Traveler = { name: string; department: string; managerEmail?: string };
type L24Expense = { description: string; amount: number; category: string };
type L24Limit = readonly [string, number];
type L24Trip = { traveler: L24Traveler; expenses: L24Expense[] };

const l24SampleTrip: L24Trip = {
  traveler: { name: "Ada", department: "Research" },
  expenses: [
    { description: "Train", amount: 89.5, category: "transport" },
    { description: "Hotel", amount: 240, category: "lodging" },
  ],
};

const l24SampleLimits: L24Limit[] = [["transport", 150]];
console.log(l24SampleTrip.expenses.length, l24SampleLimits.length); // prints 2 1

// 3. L24Expense. An approved list would be another L24Expense[], so the expense shape is
//    defined once and both lists stay in sync.

<!-- cell: markdown -->
Compare this with LESSON 20's function signature: `l20OverLimit(trip: L24Trip, limits:
L24Limit[])` says the same thing in one readable line.

<!-- cell: markdown -->
## LESSON 25 — Enums

### Exercise

<!-- cell: code solution -->
enum L25Category {
  Groceries = "GROCERIES",
  Travel = "TRAVEL",
  Entertainment = "ENTERTAINMENT",
}

function l25CashbackPercent(category: L25Category) {
  if (category === L25Category.Groceries) {
    return 2;
  }
  if (category === L25Category.Travel) {
    return 3;
  }
  return 1;
}

function l25Cashback(amount: number, category: L25Category) {
  return Math.round(amount * l25CashbackPercent(category)) / 100;
}

console.log(l25Cashback(120, L25Category.Travel)); // prints 3.6

<!-- cell: markdown -->
`amount * percent` is the cashback in cents, so rounding it and dividing by 100 gives an
amount with 2 decimals. The call uses `L25Category.Travel`, because the enum doesn't accept
the plain string `"TRAVEL"`.

**Common mistakes**

- **Keeping the plain string `"TRAVEL"` in the call.** A string enum only accepts its members,
  so the argument is reported.
- **Leaving the enum numeric.** Everything else compiles, but `Object.values` returns the
  names *and* the numbers, and the first check fails.
- **Computing `amount * (percent / 100)` without rounding.** `45.5 * 0.01` is `0.455`, not the
  expected `0.46`.

### Verification

<!-- cell: code verification -->
checkAll([
  ["the enum values are readable", Object.values(L25Category), ["GROCERIES", "TRAVEL", "ENTERTAINMENT"]],
  ["groceries cashback", l25Cashback(80, L25Category.Groceries), 1.6],
  ["travel cashback", l25Cashback(120, L25Category.Travel), 3.6],
  ["entertainment cashback, rounded", l25Cashback(45.5, L25Category.Entertainment), 0.46],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Either works; a string enum is a good fit. One central list of statuses, and the saved
//    and logged values are readable ("COMPLETED").
// 2. A literal union. The values are only needed for type checking, so nothing has to exist at
//    runtime.
// 3. An enum. The code needs the values at runtime to loop over them, for example with
//    Object.values.
// 4. A literal union. node script.ts can't run files that contain an enum.

<!-- cell: markdown -->
The deciding question is usually: **do I need these values while the program runs?** If yes,
an enum helps. If not, a literal union is enough.

<!-- cell: markdown -->
## LESSON 26 — Basic type narrowing

### Exercise

<!-- cell: code solution -->
type L26Weight = number | string | null;

function l26ShippingCost(weight: L26Weight) {
  if (weight === null) {
    return -1;
  }

  let kilograms: number;
  if (typeof weight === "string") {
    kilograms = Number(weight);
  } else {
    kilograms = weight;
  }

  if (Number.isNaN(kilograms) || kilograms <= 0) {
    return -1;
  }
  if (kilograms <= 2) {
    return 4.9;
  }
  return 4.9 + Math.ceil(kilograms - 2) * 1.5;
}

console.log(l26ShippingCost(3)); // prints 6.4

<!-- cell: markdown -->
The early `return` removes `null`. Then `typeof` splits the string case from the number case,
and both end up in `kilograms`, a `number`. Everything after that works on one type.

**Common mistakes**

- **Forgetting "text that isn't a number".** `Number("heavy")` is `NaN`, and `NaN <= 0` is
  `false`, so the parcel would get a price of `NaN`.
- **Checking `typeof weight === "string"` without an `else` or `return`.** After the `if`,
  `weight` is still `string | number`, and the arithmetic is reported again.
- **Rounding with `Math.round` instead of `Math.ceil`.** 2.4 kg would then cost only 4.9,
  although a started kilogram above 2 should be charged.

### Verification

<!-- cell: code verification -->
checkAll([
  ["a light parcel", l26ShippingCost(1.2), 4.9],
  ["exactly 2 kg", l26ShippingCost(2), 4.9],
  ["2.5 kg as text", l26ShippingCost("2.5"), 6.4],
  ["5 kg", l26ShippingCost(5), 9.4],
  ["weight missing", l26ShippingCost(null), -1],
  ["zero", l26ShippingCost(0), -1],
  ["text that isn't a number", l26ShippingCost("heavy"), -1],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
function l26Describe(value: string | number | boolean | null) {
  if (value === null) {
    return "empty"; // A
  }
  if (typeof value === "boolean") {
    return value ? "yes" : "no"; // B
  }
  return String(value); // C
}

console.log(l26Describe(0), l26Describe(""), l26Describe(false)); // prints 0  no

// 1. A: null. B: boolean. C: string | number (null and boolean have already returned).
// 2. Every falsy value: 0, an empty string "" and false. With !value they would all return
//    "empty", although they're real values. That's why === null is the right check here.

<!-- cell: markdown -->
The printed line has two spaces in the middle: `l26Describe("")` returns an empty string.
With `!value`, the three results would all have been `empty`.

<!-- cell: markdown -->
## LESSON 27 — Discriminated data

### Exercise

<!-- cell: code solution -->
type L27Pickup = { method: "pickup"; storeName: string };
type L27Courier = { method: "courier"; address: string; express: boolean };
type L27Locker = { method: "locker"; lockerId: string };
type L27Delivery = L27Pickup | L27Courier | L27Locker;

function l27DeliveryFee(option: L27Delivery) {
  switch (option.method) {
    case "pickup":
      return 0;
    case "locker":
      return 2.5;
    case "courier":
      return option.express ? 5.9 + 4 : 5.9;
  }
}

function l27DeliverySummary(option: L27Delivery) {
  if (option.method === "pickup") {
    return `Pickup at ${option.storeName}`;
  }
  if (option.method === "locker") {
    return `Locker ${option.lockerId}`;
  }
  const suffix = option.express ? " (express)" : "";
  return `Courier to ${option.address}${suffix}`;
}

const l27MyDelivery: L27Delivery = { method: "courier", address: "Via Roma 1", express: true };
console.log(l27DeliveryFee(l27MyDelivery), l27DeliverySummary(l27MyDelivery)); // prints 9.9 Courier to Via Roma 1 (express)

<!-- cell: markdown -->
With literal `method` values, each `case` and each `if` narrows `option` to one variant, so
`option.express` and `option.storeName` are allowed where they're used. In
`l27DeliverySummary`, after the two early returns only the courier variant is left.

**Common mistakes**

- **Keeping `method: string`.** TypeScript can't narrow, so `option.express` is still
  reported, even inside `if (option.method === "courier")`.
- **Reading `option.address` before checking `method`.** Only the courier variant has it, so
  the compiler reports it on the union.
- **Forgetting a `case`.** Nothing is reported inside the `switch`, but that method's fee is
  `undefined`, and its verification line fails.

### Verification

<!-- cell: code verification -->
checkAll([
  ["pickup fee", l27DeliveryFee({ method: "pickup", storeName: "Milan Store" }), 0],
  ["locker fee", l27DeliveryFee({ method: "locker", lockerId: "L-17" }), 2.5],
  ["standard courier fee", l27DeliveryFee({ method: "courier", address: "Via Roma 1", express: false }), 5.9],
  ["express courier fee", l27DeliveryFee({ method: "courier", address: "Via Roma 1", express: true }), 9.9],
  ["pickup summary", l27DeliverySummary({ method: "pickup", storeName: "Milan Store" }), "Pickup at Milan Store"],
  ["locker summary", l27DeliverySummary({ method: "locker", lockerId: "L-17" }), "Locker L-17"],
  [
    "express courier summary",
    l27DeliverySummary({ method: "courier", address: "Via Roma 1", express: true }),
    "Courier to Via Roma 1 (express)",
  ],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
type L27Sms = { channel: "sms"; phone: string };
type L27Email = { channel: "email"; address: string; subject: string };
type L27Push = { channel: "push"; deviceId: string };
type L27Notification = L27Sms | L27Email | L27Push;

function l27Recipient(notification: L27Notification) {
  switch (notification.channel) {
    case "sms":
      return notification.phone;
    case "email":
      return notification.address;
    case "push":
      return notification.deviceId;
  }
}

console.log(l27Recipient({ channel: "email", address: "ada@example.com", subject: "Statement ready" }));
// prints ada@example.com

// 3. A variant with channel: string could match ANY case, so the compiler keeps it in every
//    branch. For example, if L27Email had channel: string, then in case "sms" the value could
//    still be an L27Email, and reading phone would be reported (the same for deviceId in
//    case "push"). Only properties that the loose variant also has would still work.

<!-- cell: markdown -->
This pattern (variants + a literal discriminant + a `switch`) comes back in almost every
TypeScript codebase. LESSON 64 and LESSON 66 take it further.
