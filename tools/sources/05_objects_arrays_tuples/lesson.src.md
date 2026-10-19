<!-- cell: markdown -->
# TypeScript — Objects, Arrays and Tuples

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../05_objects_arrays_tuples/lesson.ipynb
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
## LESSON 16 — Object types

### Explanation

An **object type** describes the shape of an object: which properties it has, and the type
of each one.

```typescript
let account: { owner: string; balance: number } = { owner: "Ada", balance: 250 };
```

With that type, the compiler reports:

- a **missing** property (`balance` left out),
- an **unknown** property (an extra `email` that isn't in the type),
- a **wrong type** (`balance: "250"`),
- a **misspelled** property when you read it (`account.balanse`).

Inference works for objects too: `let product = { name: "Lamp", price: 40 }` gets the type
`{ name: string; price: number }`. You saw this in LESSON 2.

Object types matter most on **parameters**, because a function must say what shape it
expects:

```typescript
function describe(account: { owner: string; balance: number }) {
  return `${account.owner}: ${account.balance} EUR`;
}
```

Writing the same object type twice gets tedious. LESSON 24 shows how to give it a name. For
now, write it out where you need it.

### Key Notes

- `{ owner: string; balance: number }` describes an object's properties and their types.
- Missing, unknown, wrongly typed and misspelled properties are all reported.
- Object literals get their type inferred.
- Always give object parameters an object type.

### Example

<!-- cell: code example -->
let l16Account: { owner: string; balance: number } = { owner: "Ada Lovelace", balance: 250 };

function l16Deposit(account: { owner: string; balance: number }, amount: number) {
  account.balance = account.balance + amount;
  return account.balance;
}

console.log(l16Deposit(l16Account, 50), l16Account.owner); // prints 300 Ada Lovelace

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Property 'balance' is missing in type '{ owner: string; }' but required in type '{ owner: string; balance: number; }'.
let l16Missing: { owner: string; balance: number } = { owner: "Grace" };

// Compiler: Object literal may only specify known properties, and 'email' does not exist in type '{ owner: string; balance: number; }'.
let l16Extra: { owner: string; balance: number } = { owner: "Grace", balance: 0, email: "grace@example.com" };

// Compiler: Type 'string' is not assignable to type 'number'.
let l16WrongType: { owner: string; balance: number } = { owner: "Grace", balance: "0" };

<!-- cell: markdown -->
### Exercise

1. Give `from` and `to` an object type with `owner` (a string) and `balance` (a number).
2. Complete `l16TransferSummary`: return `"Insufficient funds"` when `amount` is more than
   `from.balance`, otherwise a line like `"Ada -> Grace: 50 EUR"`.
3. Run `check:nb` and fix the remaining `[to fix]` error in the account data.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
let l16Ada: { owner: string; balance: number } = { owner: "Ada", balanse: 120 };
let l16Grace: { owner: string; balance: number } = { owner: "Grace", balance: 40 };

function l16TransferSummary(from, to, amount: number) {
  // TODO: "Insufficient funds" when amount is more than from.balance,
  // otherwise a line like "Ada -> Grace: 50 EUR"
  return "";
}

console.log(l16TransferSummary(l16Ada, l16Grace, 50));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 16 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["enough funds", l16TransferSummary(l16Ada, l16Grace, 50), "Ada -> Grace: 50 EUR"],
  ["exactly the balance", l16TransferSummary(l16Ada, l16Grace, 120), "Ada -> Grace: 120 EUR"],
  ["too much", l16TransferSummary(l16Ada, l16Grace, 500), "Insufficient funds"],
  ["the other direction", l16TransferSummary(l16Grace, l16Ada, 50), "Insufficient funds"],
]);

<!-- cell: markdown -->
### Mini Challenge

Use the cell below. Answer in comments:

1. What type does TypeScript infer for `l16Product`?
2. Which of these would the compiler report, and why?
   - a) `l16Product.price = 45;`
   - b) `l16Product.price = "45";`
   - c) `l16Product.stock = 10;`
   - d) `console.log(l16Product.nmae);`
3. JavaScript lets you add a new property to an object at any time. Why does TypeScript
   reject c)?

<!-- cell: code challenge -->
let l16Product = { name: "Desk lamp", price: 40 };

// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 17 — Optional properties

### Explanation

Some data isn't always there. A customer may or may not have a phone number. Mark such a
property as **optional** with `?`:

```typescript
let customer: { name: string; phone?: string } = { name: "Ada" };
```

Now the object may leave `phone` out. When you *read* `customer.phone`, TypeScript knows it
might be `undefined`, so using it directly is an error:

```text
'customer.phone' is possibly 'undefined'.
```

Handle the missing case before you use the value. Two ways you know from JavaScript:

- **Check it:** inside `if (customer.phone !== undefined) { ... }`, TypeScript knows `phone`
  is a string. (LESSON 26 explains how the compiler follows these checks.)
- **Give it a default:** `customer.phone ?? "no phone"` uses the value when it's there, and
  the default when it's `undefined`.

Don't make properties optional "just in case". Every `?` forces a check wherever the property
is used. Use it only for data that is really allowed to be missing.

### Key Notes

- `phone?: string` means the property may be left out.
- Reading an optional property gives you "possibly 'undefined'".
- Check with `!== undefined`, or provide a default with `??`.
- Only mark data optional when it can really be missing.

### Example

<!-- cell: code example -->
function l17ContactLine(customer: { name: string; phone?: string }) {
  if (customer.phone !== undefined) {
    return `${customer.name}: ${customer.phone}`;
  }
  return `${customer.name}: no phone`;
}

console.log(l17ContactLine({ name: "Ada", phone: "555-0101" })); // prints Ada: 555-0101
console.log(l17ContactLine({ name: "Grace" })); // prints Grace: no phone

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l17PhoneLength(customer: { name: string; phone?: string }) {
  // Compiler: 'customer.phone' is possibly 'undefined'.
  return customer.phone.length;
}

console.log(l17PhoneLength({ name: "Ada", phone: "555-0101" })); // prints 8, but { name: "Grace" } would crash

<!-- cell: markdown -->
### Exercise

Some bank accounts have an **overdraft limit**: they may go below zero, down to minus that
limit. Accounts without one can only go down to 0.

1. Ada's account has no overdraft limit. Fix the type of `l17Basic` so the property may be
   left out.
2. Fix `l17CanWithdraw` so an account without a limit uses 0 as its limit.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l17CanWithdraw(account: { owner: string; balance: number; overdraftLimit?: number }, amount: number) {
  return amount <= account.balance + account.overdraftLimit;
}

let l17Premium: { owner: string; balance: number; overdraftLimit: number } = {
  owner: "Grace",
  balance: 100,
  overdraftLimit: 200,
};
let l17Basic: { owner: string; balance: number; overdraftLimit: number } = { owner: "Ada", balance: 100 };

console.log(l17CanWithdraw(l17Basic, 50), l17CanWithdraw(l17Premium, 250));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 17 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["basic account, enough money", l17CanWithdraw(l17Basic, 50), true],
  ["basic account, the whole balance", l17CanWithdraw(l17Basic, 100), true],
  ["basic account, too much", l17CanWithdraw(l17Basic, 101), false],
  ["overdraft, down to the limit", l17CanWithdraw(l17Premium, 300), true],
  ["overdraft, past the limit", l17CanWithdraw(l17Premium, 301), false],
]);

<!-- cell: markdown -->
### Mini Challenge

An online shop stores these customer details: `id`, `name`, `email`, `phone`,
`loyaltyPoints` and `deliveryNotes`. Every customer needs an id, a name and an email to
place an order.

1. In the cell, write the object type for a customer. Decide which properties are optional.
2. In a comment, justify one property you made optional and one you kept required.
3. Test your type: add a second customer who has only the required properties.

<!-- cell: code challenge -->
let l17Customer = { id: "C-1", name: "Ada", email: "ada@example.com" };

// Your answers here

<!-- cell: markdown -->
## LESSON 18 — Arrays and typed arrays

### Explanation

A **typed array** says what type every element has. Write the element type followed by `[]`:

```typescript
let balances: number[] = [120, 45.5, 300];
let owners: string[] = ["Ada", "Grace"];
let accounts: { owner: string; balance: number }[] = [{ owner: "Ada", balance: 120 }];
```

What the compiler does with it:

- **Wrong elements are reported.** `balances.push("50")` is an error.
- **Inference works.** `let prices = [19.9, 5]` gets the type `number[]`.
- **Empty arrays need an annotation.** `let items = []` accepts anything, just like `let x;`
  in LESSON 14. Write `let items: string[] = [];`.
- **Array methods keep track of types.** `map`, `filter` and `reduce` work as in JavaScript,
  and TypeScript knows the type of each result.
- **`find` may find nothing,** so its result is possibly `undefined`. Handle it as in
  LESSON 17.

One limit: `balances[10]` has the type `number`, but at runtime it's `undefined`. The
compiler doesn't track how long an array is.

### Key Notes

- `number[]` means "an array where every element is a number".
- Annotate empty arrays: `let items: string[] = [];`.
- `map`, `filter` and `reduce` results are typed automatically.
- `find` can return `undefined`; reading past the end isn't caught.

### Example

<!-- cell: code example -->
let l18Balances: number[] = [120, 45.5, 300];
let l18Owners = ["Ada", "Grace", "Linus"]; // inferred: string[]

const l18Total = l18Balances.reduce((sum, balance) => sum + balance, 0); // number
const l18Wealthy = l18Owners.filter((owner, index) => l18Balances[index] > 100); // string[]

console.log(l18Total, l18Wealthy);

<!-- cell: code type-error-demo -->
// Type error on purpose.
let l18Accounts: { owner: string; balance: number }[] = [
  { owner: "Ada", balance: 120 },
  { owner: "Grace", balance: 45.5 },
];

// Compiler: Argument of type 'string' is not assignable to parameter of type 'number'.
l18Balances.push("50");

const l18Found = l18Accounts.find((account) => account.owner === "Grace");
// Compiler: 'l18Found' is possibly 'undefined'.
console.log(l18Found.balance); // prints 45.5, but searching for "Linus" would crash

<!-- cell: markdown -->
### Exercise

A bank statement lists deposits and withdrawals.

1. Annotate `l18Withdrawals`: withdrawals are numbers. Then run `check:nb` and fix the bug
   the annotation reveals.
2. Annotate the parameters of `l18Balance` and complete it: it returns the total of the
   deposits minus the total of the withdrawals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
let l18Deposits: number[] = [200, 50, 75.5];
let l18Withdrawals = [];
l18Withdrawals.push(30);
l18Withdrawals.push("12.5");

function l18Balance(deposits, withdrawals) {
  // TODO: total deposits minus total withdrawals
  return 0;
}

console.log(l18Balance(l18Deposits, l18Withdrawals));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 18 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["the statement balance", l18Balance(l18Deposits, l18Withdrawals), 283],
  ["no withdrawals", l18Balance([100, 20], []), 120],
  ["no deposits", l18Balance([], [15]), -15],
]);

<!-- cell: markdown -->
### Mini Challenge

Read the cell below, then answer in comments:

1. What is the type of `l18Passed`, `l18Labels`, `l18Best` and `l18Tenth`?
2. What does each one hold at runtime? Run the cell to check.
3. `l18Best` and `l18Tenth` both end up `undefined`. The compiler warns you about one of them
   and not the other. Which one, and why?

<!-- cell: code challenge -->
let l18Scores = [90, 72, 85];

const l18Passed = l18Scores.filter((score) => score >= 80);
const l18Labels = l18Scores.map((score) => `${score} points`);
const l18Best = l18Scores.find((score) => score > 95);
const l18Tenth = l18Scores[10];

console.log(l18Passed, l18Labels, l18Best, l18Tenth);

// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 19 — Tuples and readonly tuples

### Explanation

A **tuple** is an array with a fixed length, where each position has its own type:

```typescript
let rate: [string, string, number] = ["EUR", "USD", 1.08]; // from, to, rate
```

- **Position matters.** `["EUR", 1.08, "USD"]` is an error.
- **Length matters.** Too many or too few elements are errors, and so is reading `rate[3]`.
  Plain arrays don't get that check.
- **Annotate tuples.** Without an annotation, `["EUR", 1.08]` is an ordinary array whose
  elements can be either type, not a tuple.
- **Destructure to name the positions.** `const [from, to, value] = rate;` gives each
  variable the type of its position.

A **readonly tuple** can't be changed: `readonly [string, string, number]`. Assigning
`rate[2] = 1.1` or calling `push` is an error. A plain tuple, surprisingly, still allows
`push`, so use `readonly` for data that must stay fixed, such as a table of exchange rates.

An array of readonly tuples needs parentheses: `(readonly [string, string, number])[]`.

**Tuple or object?** Tuples suit small groups where the order is obvious, like a currency
pair and its rate. When the meaning of each position isn't obvious, use an object with
named properties.

### Key Notes

- `[string, string, number]`: a fixed length, and one type per position.
- Wrong order, wrong length and out-of-range indexes are reported.
- Always annotate tuples; destructure them to name the positions.
- `readonly [...]` prevents changes, including `push`.
- If the positions need names to make sense, use an object instead.

### Example

<!-- cell: code example -->
const l19EurToUsd: readonly [string, string, number] = ["EUR", "USD", 1.08];

const [l19From, l19To, l19Rate] = l19EurToUsd; // string, string, number
const l19Converted = Math.round(100 * l19Rate * 100) / 100;

console.log(`100 ${l19From} = ${l19Converted} ${l19To}`); // prints 100 EUR = 108 USD

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Compiler: Type 'number' is not assignable to type 'string'.
// Compiler: Type 'string' is not assignable to type 'number'.
let l19WrongOrder: [string, string, number] = ["EUR", 1.08, "USD"];

// Compiler: Tuple type 'readonly [string, string, number]' of length '3' has no element at index '3'.
console.log(l19EurToUsd[3]); // prints undefined

// Compiler: Cannot assign to '2' because it is a read-only property.
l19EurToUsd[2] = 1.1;

<!-- cell: markdown -->
### Exercise

A small exchange-rate table stores each rate as a readonly tuple: from, to, rate.

1. Run `check:nb` and fix the two `[to fix]` errors. One of them is a line that shouldn't
   exist at all: rates in this table must never change.
2. Complete `l19Convert`: return the converted amount rounded to 2 decimals, or `-1` when the
   currency pair isn't in the table.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
const l19Rates: (readonly [string, string, number])[] = [
  ["EUR", "USD", 1.08],
  ["USD", "EUR", 0.93],
  ["EUR", "GBP", "0.85"],
];

l19Rates[0][2] = 1.5;

function l19Convert(amount: number, from: string, to: string) {
  const entry = l19Rates.find((rate) => rate[0] === from && rate[1] === to);
  // TODO: return the converted amount rounded to 2 decimals,
  // or -1 when the currency pair isn't in the table
  return 0;
}

console.log(l19Convert(100, "EUR", "USD"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 19 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["100 EUR to USD", l19Convert(100, "EUR", "USD"), 108],
  ["50 USD to EUR", l19Convert(50, "USD", "EUR"), 46.5],
  ["80 EUR to GBP", l19Convert(80, "EUR", "GBP"), 68],
  ["19.99 EUR to USD, rounded", l19Convert(19.99, "EUR", "USD"), 21.59],
  ["an unknown pair", l19Convert(10, "GBP", "JPY"), -1],
]);

<!-- cell: markdown -->
### Mini Challenge

**Tuple or object?** For each piece of data, decide which fits better, and give a one-line
reason. Then write the type for two of them in the cell.

1. A map position: latitude and longitude.
2. A customer profile: name, email, phone and city.
3. An exchange rate: from, to and rate.
4. A full name split into first name and last name.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.

<!-- cell: markdown -->
## LESSON 20 — Practical data modeling

### Explanation

**Modeling** means turning real information into types *before* you write the logic. You
already have every tool you need. The skill is choosing the right one:

| The data is... | Use |
|---|---|
| a single value | `string`, `number` or `boolean` |
| a thing with named details | an object type |
| many things of the same kind | an array, such as `{ ... }[]` |
| a small group with an obvious order | a tuple, often `readonly` |
| something that may really be missing | an optional property, `?` |

A simple process:

1. **List the things** in the problem: an order, a customer, an item.
2. **Give each thing an object type**, choosing a structure for each property from the table.
3. **Nest them**: an order *has* a customer and *has* a list of items.
4. **Write sample data with the type.** The compiler checks your model against real
   examples before any logic exists.

Nested types get long. That's normal for now, and LESSON 24 shows how to name them.

### Key Notes

- Model the data first, then write the functions.
- Object for named details, array for many, tuple for small fixed groups, `?` for missing.
- Nest object types to mirror how the real data is structured.
- Sample data typed against the model catches modeling mistakes early.

### Example

<!-- cell: code example -->
let l20Order: {
  id: string;
  customer: { name: string; email: string; phone?: string };
  items: { product: string; unitPrice: number; quantity: number }[];
  deliveryWindow: readonly [number, number]; // from hour, to hour
} = {
  id: "A-100",
  customer: { name: "Ada", email: "ada@example.com" },
  items: [
    { product: "Desk lamp", unitPrice: 40, quantity: 2 },
    { product: "Light bulb", unitPrice: 4.5, quantity: 4 },
  ],
  deliveryWindow: [9, 12],
};

const l20ItemsTotal = l20Order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
console.log(`${l20Order.customer.name}: ${l20ItemsTotal} EUR, delivery from ${l20Order.deliveryWindow[0]}:00`);
// prints Ada: 98 EUR, delivery from 9:00

<!-- cell: code type-error-demo -->
// Type error on purpose.
// Sample data that doesn't match the model: the compiler finds both problems.
let l20BadOrder: {
  id: string;
  customer: { name: string; email: string };
  items: { product: string; unitPrice: number; quantity: number }[];
} = {
  id: "A-101",
  customer: { name: "Grace" },
  items: [{ product: "Desk lamp", unitPrice: 40, quantity: "2" }],
};

<!-- cell: markdown -->
### Exercise

A company reimburses travel expenses. Each **category** has a daily limit, stored as a
readonly tuple: `[category, limit]`.

1. Annotate the parameters of `l20OverLimit`. Model `trip` from the sample data in
   `l20Trip`, and add an **optional** `managerEmail` (a string) to the traveler, because some
   travelers have one.
2. Complete the function: return the **descriptions** of expenses whose amount is above their
   category's limit. An expense whose category has no limit is never over it.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
let l20Trip = {
  traveler: { name: "Ada", department: "Research" },
  expenses: [
    { description: "Train", amount: 89.5, category: "transport" },
    { description: "Hotel", amount: 240, category: "lodging" },
    { description: "Dinner", amount: 42.3, category: "meals" },
  ],
};

const l20Limits: (readonly [string, number])[] = [
  ["transport", 150],
  ["lodging", 200],
  ["meals", 60],
];

function l20OverLimit(trip, limits) {
  // TODO: descriptions of expenses above their category's limit
  return [];
}

console.log(l20OverLimit(l20Trip, l20Limits));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 20 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["the hotel is over its limit", l20OverLimit(l20Trip, l20Limits), ["Hotel"]],
  [
    "nothing over the limit",
    l20OverLimit(
      {
        traveler: { name: "Grace", department: "Sales", managerEmail: "boss@example.com" },
        expenses: [{ description: "Taxi", amount: 20, category: "transport" }],
      },
      l20Limits,
    ),
    [],
  ],
  [
    "a category without a limit",
    l20OverLimit(
      {
        traveler: { name: "Linus", department: "IT" },
        expenses: [{ description: "Laptop bag", amount: 500, category: "equipment" }],
      },
      l20Limits,
    ),
    [],
  ],
]);

<!-- cell: markdown -->
### Mini Challenge

**Model it yourself.** A gym stores, for each member: a name, an email, an optional phone
number, a membership plan (its name and monthly price), an optional personal trainer's name,
and a list of visits, where each visit is a date (as text) and the minutes spent.

1. Write the type as an annotation on `l20Member`, and give it sample data.
2. In a comment, explain one structure choice: why an object, an array, a tuple or `?`.
3. Run `check:nb` to confirm your sample data matches your model.

<!-- cell: code challenge -->
// Write your model and sample data here

// 2.
