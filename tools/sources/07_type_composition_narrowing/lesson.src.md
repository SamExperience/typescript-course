<!-- cell: markdown -->
# TypeScript — Type Composition and Narrowing

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../07_type_composition_narrowing/lesson.ipynb
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
## LESSON 21 — `any` vs `unknown`

### Explanation

Sometimes TypeScript can't know a value's type, for example the result of `JSON.parse` or
data from an API. There are two types for that situation, and they behave in opposite ways.

**`any` means "don't check this".** Every operation is allowed, and every value you read from
it is `any` as well. `JSON.parse` returns `any`, which is why `const quantity: number =
JSON.parse(text)` compiled in LESSON 11. Mistakes with `any` only show up at runtime.

**`unknown` means "check this before you use it".** You can store any value in it, but you
can't use it: no reading properties, no calling methods, no arithmetic, and no assigning it to
a `number`, until you've checked what it is.

The check is JavaScript's `typeof`. Inside `if (typeof value === "number") { ... }`,
TypeScript treats `value` as a `number`. LESSON 26 explains how the compiler follows checks
like this.

**The rule:** use `unknown` for data you don't control, and avoid `any`. Treat any `any` in
your code as a warning sign.

Now you can read the helper cell: `actual: unknown` accepts every value, and the helper only
compares it.

### Key Notes

- `any` turns checking off, and it spreads to every value read from it.
- `unknown` accepts any value but blocks every use until you check it.
- `typeof value === "number"` lets you use an `unknown` as a number inside the `if`.
- Use `unknown` for outside data. Avoid `any`.

### Example

<!-- cell: code example -->
function l21ToAmount(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return 0;
}

const l21FromApi: unknown = JSON.parse('"19.90"');
console.log(l21ToAmount(l21FromApi), l21ToAmount(5), l21ToAmount(true)); // prints 19.9 5 0

<!-- cell: code type-error-demo -->
// Type error on purpose.
let l21Loose: any = JSON.parse('"12"');
console.log(l21Loose + 1); // no error reported, and it prints 121: the text was joined, not added

let l21Checked: unknown = JSON.parse('"12"');
// Compiler: 'l21Checked' is of type 'unknown'.
console.log(l21Checked + 1); // prints 121 too, but the compiler makes you check first

<!-- cell: markdown -->
### Exercise

A discount service sends a percentage as JSON. It might arrive as a number, as a string, or as
something unexpected.

Complete `l21ParseDiscount` and fix the `[to fix]` error **without** changing `unknown` to
`any`:

- a number from 0 to 100: return that number;
- a string that contains a number from 0 to 100: return that number;
- anything else, or a number outside 0 to 100: return `0`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l21ParseDiscount(value: unknown) {
  // TODO: follow the rules in the Exercise
  return value * 1;
}

console.log(l21ParseDiscount(JSON.parse("15")));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 21 must have no `[to fix]` errors left.

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

For each situation, choose **`any`**, **`unknown`**, or **a specific type**. Answer in
comments with a one-line reason.

1. The result of `JSON.parse` on a response from another company's server.
2. A function parameter that must always be a price.
3. A large old JavaScript file you're converting to TypeScript, which has to compile today.
4. The `actual` parameter of the `checkAll` helper.

Then: `let l21Data: any = JSON.parse("{}"); let l21Name = l21Data.customer;`
What type does `l21Name` have, and why is that a problem?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
// Last question:

<!-- cell: markdown -->
## LESSON 22 — Union types

### Explanation

A **union type** means "one of these types". Write the types separated by `|`:

```typescript
let accountId: string | number = "A-1";
accountId = 42; // fine
accountId = true; // Type 'boolean' is not assignable to type 'string | number'.
```

Real data often comes in a few kinds: an ID that is either a number or a code, or a value that
may be missing. A union describes that honestly.

**Using a union value:** you can only do what **every** member allows. `id.toString()` works
on both strings and numbers, but `id.toUpperCase()` is an error, because numbers don't have
it. Check first with `typeof` (LESSON 21). Inside the check, TypeScript knows which member
you have.

**Missing values:** `string | null` says "a string, or deliberately nothing". The compiler
makes you handle `null` before using the string. This also explains messages you've already
seen: `string | undefined` for optional properties, and `(string | number)[]` for an array
that mixes both. Note the parentheses in array types.

Don't add union members just to make an error go away. Every member is one more case to check
wherever the value is used.

### Key Notes

- `A | B` means "either an A or a B".
- On a union, you can only use what every member supports.
- Check with `typeof` or `=== null` before using member-specific features.
- Arrays of unions need parentheses: `(string | number)[]`.
- Every extra member means one more case to handle.

### Example

<!-- cell: code example -->
function l22FormatAccountId(id: string | number) {
  if (typeof id === "number") {
    return `ACC-${id.toString().padStart(6, "0")}`;
  }
  return id.toUpperCase();
}

console.log(l22FormatAccountId(42), l22FormatAccountId("acc-777")); // prints ACC-000042 ACC-777

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l22CouponLength(code: string | null) {
  // Compiler: 'code' is possibly 'null'.
  return code.length;
}

function l22ShoutId(id: string | number) {
  // Compiler: Property 'toUpperCase' does not exist on type 'string | number'.
  return id.toUpperCase();
}

console.log(l22CouponLength("SAVE10")); // prints 6, but null would crash

<!-- cell: markdown -->
### Exercise

A payment's **reference** is an invoice number (a number), an order code (a string), or
missing (`null`).

1. Annotate the parameter of `l22PaymentReference` with a union, and fix the type of
   `l22References`.
2. Complete the function:
   - a number: `"INV-"` followed by the number, such as `"INV-1042"`;
   - a string: the code in capital letters, such as `"ORD-7A"`;
   - `null`: `"NO-REF"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l22PaymentReference(reference) {
  // TODO: follow the rules in the Exercise
  return "";
}

const l22References: string[] = [1042, "ord-7a", null];

console.log(l22PaymentReference(1042));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 22 must have no `[to fix]` errors left.

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

Use the cell below. Answer in comments:

1. What type does TypeScript infer for `l22Parsed`?
2. Why would `l22Parsed.toFixed(2)` be reported? Write a safe way to print it with 2 decimals.
3. In mini-project 1, every function had to return the same type. Which rule does
   `l22ParseAmount` break, and why is that acceptable now?

<!-- cell: code challenge -->
function l22ParseAmount(text: string) {
  if (text === "") {
    return null;
  }
  return Number(text);
}

const l22Parsed = l22ParseAmount("12.5");

// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 23 — Literal types

### Explanation

A **literal type** is one exact value used as a type: `"paid"`, `3` or `true`. On its own it
isn't very useful. Combined with `|`, it gives a precise list of allowed values:

```typescript
let status: "pending" | "paid" | "refunded" = "pending";
status = "shipped"; // Type '"shipped"' is not assignable to type '"pending" | "paid" | "refunded"'.
```

What you get:

- **Typos are caught:** `"payed"` is rejected.
- **Impossible checks are caught:** comparing a status with `"shipped"` is reported, because it
  can never be true.
- **Your editor suggests the allowed values** as you type.

Number literals work the same way: `months: 1 | 3 | 6 | 12`.

**Watch out for inference.** `const currency = "EUR"` gets the type `"EUR"`, because a
`const` can never change. `let currency = "EUR"` gets `string`, because it could change
later. Object properties are treated like `let`: in `{ status: "paid" }`, `status` is a
`string`. To keep a literal union on a property, annotate the object.

### Key Notes

- A literal type is an exact value: `"paid"`, `3`, `true`.
- A union of literals lists every allowed value.
- Typos and impossible comparisons are reported.
- `const` keeps the literal type; `let` and object properties widen to `string` or `number`.
- Annotate objects whose properties must stay literal unions.

### Example

<!-- cell: code example -->
function l23InstallmentAmount(total: number, months: 1 | 3 | 6 | 12) {
  return Math.round((total / months) * 100) / 100;
}

let l23Status: "pending" | "paid" | "refunded" = "pending";
l23Status = "paid";

console.log(l23Status, l23InstallmentAmount(1200, 12)); // prints paid 100

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Type '"payed"' is not assignable to type '"pending" | "paid" | "refunded"'.
l23Status = "payed";

let l23Currency = "EUR"; // let: the type is string, not "EUR"
function l23SetCurrency(code: "EUR" | "USD" | "GBP") {
  return `Currency set to ${code}`;
}
// Compiler: Argument of type 'string' is not assignable to parameter of type '"EUR" | "USD" | "GBP"'.
console.log(l23SetCurrency(l23Currency)); // prints Currency set to EUR

function l23IsShipped(status: "pending" | "paid" | "refunded") {
  // Compiler: This comparison appears to be unintentional because the types '"pending" | "paid" | "refunded"' and '"shipped"' have no overlap.
  return status === "shipped";
}

<!-- cell: markdown -->
### Exercise

A shop lets customers pay by card, in full or in monthly installments.

1. Annotate `card` with the allowed cards (`"visa"`, `"mastercard"`, `"amex"`) and `months`
   with the allowed plans (1, 3, 6 or 12). Then fix any new error the annotations cause.
2. Complete `l23PlanLabel`:
   - `"amex"` can only be paid in full: any plan other than 1 month gives `"Not available"`;
   - 1 month gives a label like `"VISA: pay in full"`;
   - any other plan gives a label like `"MASTERCARD: 6 monthly payments"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l23PlanLabel(card, months) {
  // TODO: follow the rules in the Exercise
  return "";
}

const l23Order = { total: 600, card: "visa", months: 6 };

console.log(l23PlanLabel(l23Order.card, l23Order.months));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 23 must have no `[to fix]` errors left.

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

Read the cell below, then answer in comments:

1. What type do `l23Plan`, `l23Tier` and `l23Settings.theme` have?
2. A function takes `theme: "light" | "dark"`. Would it accept `l23Settings.theme`? If not,
   how could you make it accepted **without** changing the function?
3. Why does TypeScript widen `let` variables and object properties to `string`, but not
   `const` variables?

<!-- cell: code challenge -->
const l23Plan = "annual";
let l23Tier = "gold";
const l23Settings = { theme: "dark" };

// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 24 — Type aliases and custom types

### Explanation

Writing `{ owner: string; balance: number }` again and again is tedious, and a change means
editing every copy. A **type alias** gives a type a name:

```typescript
type Currency = "EUR" | "USD" | "GBP";
type Account = { owner: string; balance: number; currency: Currency };
type Rate = readonly [Currency, Currency, number];
```

- `type Name = ...;` works for **any** type: objects, unions, literal unions, tuples and
  arrays.
- Aliases can use other aliases, so you can build **custom types** for your domain:
  `Account` uses `Currency`.
- Change the alias once, and every place that uses it follows.
- Error messages use the name: `... but required in type 'Account'.`
- An alias is just a name. Two aliases with the same shape are interchangeable, because
  TypeScript compares shapes, not names.
- Aliases exist only at compile time. You can't log or pass `Account` at runtime.

Type names use **PascalCase**. In these notebooks they also carry the lesson number, like
variables do: `L24Account`.

### Key Notes

- `type Name = SomeType;` names any type.
- Aliases can be built from other aliases.
- One definition, used everywhere, changed in one place.
- Same shape means compatible, whatever the name.
- Types don't exist at runtime.

### Example

<!-- cell: code example -->
type L24Currency = "EUR" | "USD" | "GBP";
type L24Account = { owner: string; balance: number; currency: L24Currency };
type L24Rate = readonly [L24Currency, L24Currency, number];

const l24Rates: L24Rate[] = [
  ["EUR", "USD", 1.08],
  ["USD", "EUR", 0.93],
];

function l24Describe(account: L24Account) {
  return `${account.owner}: ${account.balance} ${account.currency}`;
}

const l24Ada: L24Account = { owner: "Ada", balance: 250, currency: "EUR" };
console.log(l24Describe(l24Ada), l24Rates.length); // prints Ada: 250 EUR 2

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Property 'balance' is missing in type '{ owner: string; currency: "EUR"; }' but required in type 'L24Account'.
const l24Missing: L24Account = { owner: "Grace", currency: "EUR" };

// Compiler: Type '"JPY"' is not assignable to type 'L24Currency'.
const l24BadRate: L24Rate = ["EUR", "JPY", 1.08];

function l24PrintType() {
  // Compiler: 'L24Account' only refers to a type, but is being used as a value here.
  console.log(L24Account);
}

<!-- cell: markdown -->
### Exercise

A bank records every transfer.

1. Create two type aliases where the TODO says:
   - `L24TransferStatus`: either `"completed"` or `"rejected"`;
   - `L24Transfer`: an object with `from` and `to` (both `L24Account`), `amount` (a number)
     and `status` (an `L24TransferStatus`).
2. Complete `l24MakeTransfer`. A transfer is **rejected**, and no balance changes, when the
   currencies differ, the amount is 0 or less, or the sender doesn't have enough money.
   Otherwise, move the money and mark it **completed**.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
// TODO: create the L24TransferStatus and L24Transfer type aliases here.

function l24MakeTransfer(from: L24Account, to: L24Account, amount: number) {
  // TODO: follow the rules in the Exercise
  const transfer: L24Transfer = { from, to, amount, status: "rejected" };
  return transfer;
}

const l24Bob: L24Account = { owner: "Bob", balance: 40, currency: "EUR" };
console.log(l24MakeTransfer(l24Ada, l24Bob, 100).status);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 24 must have no `[to fix]` errors left.

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

In LESSON 20 you wrote the trip model inline, with the same object types repeated. Rewrite it
with aliases:

1. Create `L24Traveler`, `L24Expense`, `L24Limit` and `L24Trip` (the traveler has an optional
   `managerEmail`; a limit is a readonly `[category, limit]` tuple).
2. Write a sample `L24Trip` with two expenses.
3. In a comment: which alias would you reuse if you later added a list of *approved* expenses?

<!-- cell: code challenge -->
// Your aliases and sample trip here

// 3.

<!-- cell: markdown -->
## LESSON 25 — Enums

### Explanation

An **enum** is a named set of constants:

```typescript
enum TransactionStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Failed = "FAILED",
}
```

You use a member with a dot: `TransactionStatus.Completed`. A variable typed
`TransactionStatus` only accepts the enum's members. Even the matching plain string
`"COMPLETED"` is rejected, so every value goes through the enum.

- **String enums**, like the one above, give each member a readable value. That's what you
  see in logs and JSON, so prefer them.
- **Numeric enums** (`enum Priority { Low, Medium, High }`) number their members 0, 1 and 2.
  Logs then show numbers, and a plain number such as `1` is accepted too.

**Unlike type aliases, enums exist at runtime.** `tsc` turns an enum into a real JavaScript
object, so you can list its values with `Object.values(TransactionStatus)`. That also has a
cost: `node file.ts` (LESSON 5) refuses to run a file containing an enum. Build it with
`npm run build` instead. The notebook kernel handles enums fine.

**Enum or literal union?** A literal union (`"pending" | "completed"`) is lighter and disappears
at runtime. An enum gives you one named object that you can reference and loop over. Both are
valid. Choose an enum when you need its values at runtime, or when a project asks for one.

### Key Notes

- `enum Name { Member = "VALUE" }` defines named constants.
- Only enum members are accepted, not the matching plain strings.
- Prefer string enums: their values are readable.
- Enums exist at runtime, so `node file.ts` can't run them. Compile with `tsc`.
- Literal unions are lighter; enums give you runtime values.

### Example

<!-- cell: code example -->
enum L25TransactionStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Failed = "FAILED",
}

function l25StatusLabel(status: L25TransactionStatus) {
  if (status === L25TransactionStatus.Completed) {
    return "Money has arrived";
  }
  if (status === L25TransactionStatus.Failed) {
    return "Transfer failed";
  }
  return "Still processing";
}

console.log(l25StatusLabel(L25TransactionStatus.Completed), Object.values(L25TransactionStatus));

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Type '"COMPLETED"' is not assignable to type 'L25TransactionStatus'.
let l25Current: L25TransactionStatus = "COMPLETED";

// Compiler: Property 'Refunded' does not exist on type 'typeof L25TransactionStatus'.
console.log(L25TransactionStatus.Refunded); // prints undefined

<!-- cell: markdown -->
### Exercise

A credit card gives **cashback** by spending category: 2% on groceries, 3% on travel and 1%
on entertainment.

1. `L25Category` is a numeric enum. Change it to a **string enum** with the values
   `"GROCERIES"`, `"TRAVEL"` and `"ENTERTAINMENT"`.
2. Fix the `[to fix]` error in the `console.log` call.
3. Complete `l25CashbackPercent` and `l25Cashback`. The cashback amount is rounded to 2
   decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
enum L25Category {
  Groceries,
  Travel,
  Entertainment,
}

function l25CashbackPercent(category: L25Category) {
  // TODO: Groceries 2, Travel 3, Entertainment 1
  return 0;
}

function l25Cashback(amount: number, category: L25Category) {
  // TODO: the cashback amount, rounded to 2 decimals
  return 0;
}

console.log(l25Cashback(120, "TRAVEL"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 25 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["the enum values are readable", Object.values(L25Category), ["GROCERIES", "TRAVEL", "ENTERTAINMENT"]],
  ["groceries cashback", l25Cashback(80, L25Category.Groceries), 1.6],
  ["travel cashback", l25Cashback(120, L25Category.Travel), 3.6],
  ["entertainment cashback, rounded", l25Cashback(45.5, L25Category.Entertainment), 0.46],
]);

<!-- cell: markdown -->
### Mini Challenge

**Enum or literal union?** For each case, choose one and give a one-line reason.

1. A payment status that is saved to a database and shows up in log files.
2. Three card brands that are only used in type annotations.
3. All supported currencies, shown one per line in a menu (the code has to loop over them).
4. A small script that you run with `node script.ts`.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.

<!-- cell: markdown -->
## LESSON 26 — Basic type narrowing

### Explanation

**Narrowing** means TypeScript follows your checks and gives a value a more precise type
inside each branch. You've already relied on it since LESSON 13. This lesson shows how it
works.

These checks narrow a value:

| Check | Inside the branch, the value is |
|---|---|
| `typeof x === "string"` | a `string` |
| `x === null` or `x !== undefined` | with `null` or `undefined` removed |
| `if (x)` | without `null` and `undefined` (and without other falsy values) |
| `x === "paid"`, or `case "paid":` in a `switch` | that literal |

**How far a check reaches:**

- **Inside** the `if` block, the value has the narrow type, and the `else` block gets
  everything else.
- **After** an `if` that returns, the rest of the function only sees the remaining types.
  This "early return" pattern keeps code flat.
- After an `if` **without** `return` or `else`, the full union is back.

**Watch out for truthiness with numbers.** `if (percent)` treats `0` like a missing value,
because `0` is falsy. For numbers, check `!== undefined` or `!== null` instead.

### Key Notes

- Narrowing = a check that gives a value a more precise type in a branch.
- `typeof`, `=== null`, `!== undefined`, truthiness, `===` and `switch` all narrow.
- An early `return` narrows the rest of the function.
- Without `return` or `else`, the narrowing ends with the `if` block.
- Don't use truthiness to check numbers: `0` is falsy.

### Example

<!-- cell: code example -->
function l26FormatAmount(amount: string | number | null) {
  if (amount === null) {
    return "no amount";
  }
  if (typeof amount === "string") {
    return amount.trim(); // amount is a string here
  }
  return amount.toFixed(2); // only number is left
}

console.log(l26FormatAmount(null), l26FormatAmount(" 12.5 "), l26FormatAmount(7));

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l26FormatBroken(amount: string | number) {
  if (typeof amount === "string") {
    amount.trim(); // no return here
  }
  // Compiler: Property 'toFixed' does not exist on type 'string | number'.
  return amount.toFixed(2); // so after the if, amount can still be a string
}

// No compiler error here, but a logic bug: 0 is falsy.
function l26DiscountLabel(percent: number | undefined) {
  if (percent) {
    return `${percent}% off`;
  }
  return "no discount";
}

console.log(l26DiscountLabel(0)); // prints no discount, although 0% was a real value

<!-- cell: markdown -->
### Exercise

A shipping form sends a parcel's weight in kilograms: a number, a text such as `"2.5"`, or
`null` when the field is empty. The alias `L26Weight` describes that.

Fix the `[to fix]` error by narrowing `weight`, and complete `l26ShippingCost`:

- `null`, a text that isn't a number, or a weight of 0 or less: `-1`;
- up to 2 kg: `4.9`;
- above 2 kg: `4.9` plus `1.5` for every **started** kilogram above 2. For example, 2.5 kg
  costs `6.4`. (`Math.ceil` rounds up to a whole number.)

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L26Weight = number | string | null;

function l26ShippingCost(weight: L26Weight) {
  // TODO: follow the rules in the Exercise
  return weight * 1.5;
}

console.log(l26ShippingCost(3));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 26 must have no `[to fix]` errors left.

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

Read the function in the cell below without running it. Answer in comments:

1. What is the type of `value` at the lines marked A, B and C?
2. A teammate suggests replacing `value === null` with `!value`. Which inputs would then
   wrongly return `"empty"`?

<!-- cell: code challenge -->
function l26Describe(value: string | number | boolean | null) {
  if (value === null) {
    return "empty"; // A
  }
  if (typeof value === "boolean") {
    return value ? "yes" : "no"; // B
  }
  return String(value); // C
}

// 1.
// 2.

<!-- cell: markdown -->
## LESSON 27 — Discriminated data

### Explanation

Data often comes in **variants** that share some properties but not others. A card payment
has the card's last four digits, a bank transfer has an IBAN, and cash has neither. Model each
variant as its own object type with a shared **literal** property that says which kind it is,
then combine them with a union:

```typescript
type CardPayment = { kind: "card"; amount: number; cardLast4: string };
type TransferPayment = { kind: "transfer"; amount: number; iban: string };
type CashPayment = { kind: "cash"; amount: number };
type Payment = CardPayment | TransferPayment | CashPayment;
```

- The shared literal property, here `kind`, is the **discriminant**.
- Properties every variant has, like `amount`, work without a check.
- Properties only one variant has, like `iban`, need a check first.
  `if (payment.kind === "transfer")` or `case "transfer":` narrows `payment` to that
  variant.
- It only works when `kind` is a **literal type** in each variant. With `kind: string`,
  TypeScript can't tell the variants apart.
- A forgotten `case` isn't reported inside the `switch`. Instead, the function's result type
  includes `undefined`. LESSON 66 shows a direct check.

### Key Notes

- One object type per variant, joined with `|`.
- A shared literal property (the discriminant) says which variant it is.
- Check the discriminant before using variant-only properties.
- The discriminant must be a literal type, never `string`.

### Example

<!-- cell: code example -->
type L27CardPayment = { kind: "card"; amount: number; cardLast4: string };
type L27TransferPayment = { kind: "transfer"; amount: number; iban: string };
type L27CashPayment = { kind: "cash"; amount: number };
type L27Payment = L27CardPayment | L27TransferPayment | L27CashPayment;

function l27Describe(payment: L27Payment) {
  switch (payment.kind) {
    case "card":
      return `${payment.amount} EUR by card ending ${payment.cardLast4}`;
    case "transfer":
      return `${payment.amount} EUR by transfer from ${payment.iban}`;
    case "cash":
      return `${payment.amount} EUR in cash`;
  }
}

const l27Payments: L27Payment[] = [
  { kind: "card", amount: 42.5, cardLast4: "4242" },
  { kind: "cash", amount: 10 },
];

console.log(l27Payments.map((payment) => l27Describe(payment)));

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l27IbanOf(payment: L27Payment) {
  // Compiler: Property 'iban' does not exist on type 'L27Payment'.
  return payment.iban;
}

// Compiler: Type '"crd"' is not assignable to type '"card" | "transfer" | "cash"'. Did you mean '"card"'?
const l27Typo: L27Payment = { kind: "crd", amount: 10, cardLast4: "4242" };

console.log(l27IbanOf({ kind: "transfer", amount: 5, iban: "IT60X0542811101000000123456" }));

<!-- cell: markdown -->
### Exercise

An online shop offers three delivery methods:

- **pickup** at a store (it has a `storeName`),
- **courier** to an address (it has an `address` and an `express` flag),
- **locker** (it has a `lockerId`).

1. The types below use `method: string`, so TypeScript can't tell the variants apart. Fix
   them so each variant has a literal `method`.
2. Complete `l27DeliveryFee`: pickup costs `0`, locker `2.5`, courier `5.9`, plus `4` when it's
   express.
3. Complete `l27DeliverySummary`: `"Pickup at Milan Store"`, `"Locker L-17"`,
   `"Courier to Via Roma 1"`, with `" (express)"` added at the end for express deliveries.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L27Pickup = { method: string; storeName: string };
type L27Courier = { method: string; address: string; express: boolean };
type L27Locker = { method: string; lockerId: string };
type L27Delivery = L27Pickup | L27Courier | L27Locker;

function l27DeliveryFee(option: L27Delivery) {
  // TODO: follow the rules in the Exercise
  if (option.method === "courier" && option.express) {
    return 9.9;
  }
  return 0;
}

function l27DeliverySummary(option: L27Delivery) {
  // TODO: follow the rules in the Exercise
  return "";
}

const l27MyDelivery: L27Delivery = { method: "courier", address: "Via Roma 1", express: true };
console.log(l27DeliveryFee(l27MyDelivery), l27DeliverySummary(l27MyDelivery));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 27 must have no `[to fix]` errors left.

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

**Model it yourself.** A banking app sends three kinds of notifications: **SMS** (to a phone
number), **email** (to an address, with a subject) and **push** (to a device ID).

1. Write one type alias per variant, with a literal `channel` discriminant, and a union
   `L27Notification`.
2. Write `l27Recipient(notification)`, which returns the phone number, the email address or
   the device ID.
3. In a comment: what would happen to your function if one variant had `channel: string`?

<!-- cell: code challenge -->
// Your types and function here

// 3.
