<!-- cell: markdown -->
# TypeScript — Objects, Arrays and Tuples

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
## LESSON 16 — Object types

### Exercise

<!-- cell: code solution -->
let l16Ada: { owner: string; balance: number } = { owner: "Ada", balance: 120 };
let l16Grace: { owner: string; balance: number } = { owner: "Grace", balance: 40 };

function l16TransferSummary(
  from: { owner: string; balance: number },
  to: { owner: string; balance: number },
  amount: number,
) {
  if (amount > from.balance) {
    return "Insufficient funds";
  }
  return `${from.owner} -> ${to.owner}: ${amount} EUR`;
}

console.log(l16TransferSummary(l16Ada, l16Grace, 50)); // prints Ada -> Grace: 50 EUR

<!-- cell: markdown -->
The `[to fix]` error in the data was the misspelled `balanse`. Before the fix, `l16Ada` had no
`balance` at runtime, so `500 > undefined` was `false` and the "too much" transfer went
through. The object type turned a silent bug into a reported one.

**Common mistakes**

- **Typing the parameters as `object`.** `object` says nothing about the properties, so
  `from.balance` is reported as not existing. Describe the actual shape.
- **Renaming the property in the type to `balanse`.** The error moves instead of
  disappearing: other code that expects `balance` now rejects the account. Fix the data, not
  the type.
- **Using `>=` for the check.** Sending exactly your whole balance is allowed, so the
  "exactly the balance" check fails.

### Verification

<!-- cell: code verification -->
checkAll([
  ["enough funds", l16TransferSummary(l16Ada, l16Grace, 50), "Ada -> Grace: 50 EUR"],
  ["exactly the balance", l16TransferSummary(l16Ada, l16Grace, 120), "Ada -> Grace: 120 EUR"],
  ["too much", l16TransferSummary(l16Ada, l16Grace, 500), "Insufficient funds"],
  ["the other direction", l16TransferSummary(l16Grace, l16Ada, 50), "Insufficient funds"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
let l16Product = { name: "Desk lamp", price: 40 };

// 1. { name: string; price: number }
// 2. a) Not reported: price is a number and 45 is a number.
//    b) Reported: a string where a number is required.
//    c) Reported: the type has no property called stock.
//    d) Reported: the type has no property called nmae. It's a typo for name.
// 3. The type describes the object's full shape. If properties could appear at any time,
//    no other code could rely on that shape. Add stock to the object when you create it.

<!-- cell: markdown -->
An object type is a promise about shape. The compiler holds every line of code to that
promise, including code that adds or reads properties.

<!-- cell: markdown -->
## LESSON 17 — Optional properties

### Exercise

<!-- cell: code solution -->
function l17CanWithdraw(account: { owner: string; balance: number; overdraftLimit?: number }, amount: number) {
  return amount <= account.balance + (account.overdraftLimit ?? 0);
}

let l17Premium: { owner: string; balance: number; overdraftLimit: number } = {
  owner: "Grace",
  balance: 100,
  overdraftLimit: 200,
};
let l17Basic: { owner: string; balance: number; overdraftLimit?: number } = { owner: "Ada", balance: 100 };

console.log(l17CanWithdraw(l17Basic, 50), l17CanWithdraw(l17Premium, 250)); // prints true true

<!-- cell: markdown -->
`overdraftLimit?: number` lets Ada's account leave the limit out. In the function,
`account.overdraftLimit ?? 0` turns a missing limit into 0. Before the fix, Ada's
`100 + undefined` was `NaN`, and every comparison with `NaN` is `false`, so she couldn't
withdraw anything.

**Common mistakes**

- **Forgetting the parentheses: `account.balance + account.overdraftLimit ?? 0`.** `+` runs
  before `??`, so the missing limit is still added, and the compiler still reports it.
- **Adding `overdraftLimit: 0` to Ada's data instead.** It works, but then every account must
  state a limit. The exercise asks the type to allow a missing one.
- **Making `overdraftLimit` optional on `l17Premium` too.** Not wrong, but Grace's account
  always has a limit, so the required property describes it more precisely.

### Verification

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

<!-- cell: code challenge-solution -->
let l17Customer: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints?: number;
  deliveryNotes?: string;
} = { id: "C-1", name: "Ada", email: "ada@example.com" };

let l17NewCustomer: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints?: number;
  deliveryNotes?: string;
} = { id: "C-2", name: "Grace", email: "grace@example.com" };

console.log(l17Customer.name, l17NewCustomer.phone ?? "no phone"); // prints Ada no phone

// deliveryNotes is optional: most orders have no special instructions.
// email stays required: every order needs a way to reach the customer.
// loyaltyPoints could also be required with a starting value of 0. Both are reasonable,
// as long as you can explain the choice.

<!-- cell: markdown -->
Repeating that long type twice is exactly the pain LESSON 24 removes, by giving the type a
name.

<!-- cell: markdown -->
## LESSON 18 — Arrays and typed arrays

### Exercise

<!-- cell: code solution -->
let l18Deposits: number[] = [200, 50, 75.5];
let l18Withdrawals: number[] = [];
l18Withdrawals.push(30);
l18Withdrawals.push(12.5);

function l18Balance(deposits: number[], withdrawals: number[]) {
  const totalIn = deposits.reduce((sum, amount) => sum + amount, 0);
  const totalOut = withdrawals.reduce((sum, amount) => sum + amount, 0);
  return totalIn - totalOut;
}

console.log(l18Balance(l18Deposits, l18Withdrawals)); // prints 283

<!-- cell: markdown -->
With `number[]`, `push("12.5")` became an error. Without the annotation, the string slipped
in, `30 + "12.5"` joined into `"3012.5"`, and the balance came out as `-2687`.

**Common mistakes**

- **Leaving `l18Withdrawals` unannotated.** `[]` accepts the string without complaint. The
  error only appears later, at the `l18Balance(...)` call, and the message mentions
  `(string | number)[]`: an array mixing strings and numbers (you'll learn that `|` syntax in
  LESSON 22). Annotating the array moves the error to the `push`, where the bug is
  (LESSON 14).
- **Calling `reduce` without the starting value `0`.** On an empty array, JavaScript throws
  "Reduce of empty array with no initial value", so the "no withdrawals" check crashes.
- **Converting with `Number("12.5")` inside `push`.** It works, but the real fix is to store
  a number in the first place.

### Verification

<!-- cell: code verification -->
checkAll([
  ["the statement balance", l18Balance(l18Deposits, l18Withdrawals), 283],
  ["no withdrawals", l18Balance([100, 20], []), 120],
  ["no deposits", l18Balance([], [15]), -15],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
let l18Scores = [90, 72, 85];

const l18Passed = l18Scores.filter((score) => score >= 80);
const l18Labels = l18Scores.map((score) => `${score} points`);
const l18Best = l18Scores.find((score) => score > 95);
const l18Tenth = l18Scores[10];

console.log(l18Passed, l18Labels, l18Best, l18Tenth);

// 1. l18Passed: number[]. l18Labels: string[].
//    l18Best: a number, or undefined when nothing matches.
//    l18Tenth: number.
// 2. l18Passed holds [90, 85], l18Labels holds ["90 points", "72 points", "85 points"],
//    and l18Best and l18Tenth both hold undefined.
// 3. The compiler warns about l18Best: find can come back empty, so its type includes
//    undefined. It doesn't warn about l18Tenth: indexing a number[] is typed as number,
//    because the compiler doesn't know how long the array is.

<!-- cell: markdown -->
`find` tells you in its type that it might fail. Indexing doesn't, so check the length
yourself when an index might be out of range.

<!-- cell: markdown -->
## LESSON 19 — Tuples and readonly tuples

### Exercise

<!-- cell: code solution -->
const l19Rates: (readonly [string, string, number])[] = [
  ["EUR", "USD", 1.08],
  ["USD", "EUR", 0.93],
  ["EUR", "GBP", 0.85],
];

function l19Convert(amount: number, from: string, to: string) {
  const entry = l19Rates.find((rate) => rate[0] === from && rate[1] === to);
  if (entry === undefined) {
    return -1;
  }
  return Math.round(amount * entry[2] * 100) / 100;
}

console.log(l19Convert(100, "EUR", "USD")); // prints 108

<!-- cell: markdown -->
Two fixes and one implementation:

- `"0.85"` became `0.85`: the third position of each tuple is a `number`.
- The line `l19Rates[0][2] = 1.5;` is gone. `readonly` exists to stop exactly that. If the
  line had run, every EUR to USD conversion would have used 1.5.
- `find` can come back empty, so the function checks for `undefined` before reading
  `entry[2]`.

**Common mistakes**

- **Reading `entry[2]` without the `undefined` check.** The compiler reports that `entry` is
  possibly `undefined`, and an unknown pair would crash at runtime.
- **Removing `readonly` to make the assignment error go away.** The compiler stops
  complaining, but the rate really changes, and the EUR to USD check fails.
- **Returning `amount * entry[2]` without rounding.** `19.99 * 1.08` is
  `21.589199999999998` in JavaScript, so the rounded check fails.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Tuple: two numbers in a well-known order (latitude, longitude).
// 2. Object: four text fields where the order means nothing and names matter.
// 3. Tuple: a short, fixed group, as in the exercise.
// 4. Tuple: two strings where "first, then last" is obvious.

let l19Position: readonly [number, number] = [45.46, 9.19];
let l19Profile: { name: string; email: string; phone: string; city: string } = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "555-0101",
  city: "London",
};

console.log(l19Position[0], l19Profile.city); // prints 45.46 London

<!-- cell: markdown -->
A useful test: if you'd need a comment to remember what position 2 means, use an object.

<!-- cell: markdown -->
## LESSON 20 — Practical data modeling

### Exercise

<!-- cell: code solution -->
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

function l20OverLimit(
  trip: {
    traveler: { name: string; department: string; managerEmail?: string };
    expenses: { description: string; amount: number; category: string }[];
  },
  limits: (readonly [string, number])[],
) {
  return trip.expenses
    .filter((expense) => {
      const limit = limits.find((entry) => entry[0] === expense.category);
      return limit !== undefined && expense.amount > limit[1];
    })
    .map((expense) => expense.description);
}

console.log(l20OverLimit(l20Trip, l20Limits)); // prints [ "Hotel" ]

<!-- cell: markdown -->
The model mirrors the data: a trip **has** one traveler (an object) and **many** expenses
(an array of objects). Each limit is a small, fixed pair (a readonly tuple). `managerEmail?`
lets both kinds of traveler fit the same type.

**Common mistakes**

- **Reading `limit[1]` without checking `limit !== undefined`.** The compiler reports it, and
  the "equipment" expense would crash, because that category has no limit.
- **Making `managerEmail` required.** Then Ada's sample trip no longer matches the type.
- **Typing `expenses` as a tuple.** A trip can have any number of expenses, so it's an array.

### Verification

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

<!-- cell: code challenge-solution -->
let l20Member: {
  name: string;
  email: string;
  phone?: string;
  plan: { name: string; monthlyPrice: number };
  trainer?: string;
  visits: (readonly [string, number])[];
} = {
  name: "Grace Hopper",
  email: "grace@example.com",
  plan: { name: "Standard", monthlyPrice: 35 },
  visits: [
    ["2026-09-01", 45],
    ["2026-09-03", 60],
  ],
};

const l20Minutes = l20Member.visits.reduce((sum, visit) => sum + visit[1], 0);
console.log(`${l20Member.name}: ${l20Minutes} minutes`); // prints Grace Hopper: 105 minutes

// 2. Each visit is a readonly tuple: a small pair where "date, then minutes" is obvious, and
//    a past visit should never change. The plan is an object, because its two details need
//    names. phone and trainer are optional, because many members have neither.

<!-- cell: markdown -->
Other good models exist. For example, a visit as `{ date: string; minutes: number }` is just
as valid. What matters is that you can explain each choice.
