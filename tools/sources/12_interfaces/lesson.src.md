<!-- cell: markdown -->
# TypeScript — Interfaces

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../12_interfaces/lesson.ipynb
>   ```
>
> - `[expected]` errors come from cells that start with `// Type error on purpose`: study them.
> - `[to fix]` errors come from cells that start with
>   `// This cell has type errors on purpose. Fix them.`: make them disappear.

<!-- cell: code setup -->
// Course helper: run this cell once, before any Verification cell.
// checkAll prints PASS or FAIL for each [label, actual value, expected value] case.
function checkAll(cases: [string, unknown, unknown][]): void {
  const lines = cases.map(([label, actual, expected]) =>
    JSON.stringify(actual) === JSON.stringify(expected)
      ? `PASS  ${label}`
      : `FAIL  ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
  console.log(lines.join("\n"));
}

<!-- cell: markdown -->
## LESSON 46 — Interface syntax, optional and readonly properties

### Explanation

An **interface** is a name for the shape of an object:

```typescript
interface Customer {
  readonly id: string;
  name: string;
  email?: string;
}
```

That is the same job the object type aliases in LESSON 24 do, with its own keyword. Properties
are separated by newlines or semicolons, and two markers change what a property promises:

- **`?`** — the property may be missing (LESSON 17). Reading it gives
  `'customer.email' is possibly 'undefined'.` (TS18048) until you check it or use `??`.
- **`readonly`** — the property can be set when the object is created and never again:
  `Cannot assign to 'id' because it is a read-only property.` (TS2540) Like the `readonly` in
  LESSON 40, it is checked, not enforced: the assignment still runs.

Nothing has to declare that it uses an interface. Any object with the right shape fits, which
is what "structural" means. An **object literal** gets one extra rule, the excess property
check: `Object literal may only specify known properties, and 'phone' does not exist in type
'Customer'.` (TS2353) A misspelled property gets a better message, with a suggestion (TS2561).
The check applies to literals only — assign the same object through a variable and it passes.

Interfaces are types, so they disappear before the code runs: `typeof Customer` is
`'Customer' only refers to a type, but is being used as a value here.` (TS2693)

Interfaces and type aliases overlap. LESSON 50 compares them; until then, use `interface` for
the shapes your application passes around.

### Key Notes

- `interface Name { property: type; }` names a shape.
- `?` marks a property that may be missing; `readonly` one that can't change afterwards.
- Any object of the right shape fits — no keyword needed on the object.
- Object literals may not carry unknown extra properties (TS2353 / TS2561).
- An interface exists only while type checking (TS2693 if used as a value).

### Example

<!-- cell: code example -->
interface L46Customer {
  readonly id: string;
  name: string;
  email?: string;
}

const l46Ada: L46Customer = { id: "C-1", name: "Ada Lovelace", email: "ada@example.com" };
const l46Grace: L46Customer = { id: "C-2", name: "Grace Hopper" };

function l46Contact(customer: L46Customer): string {
  return customer.email ?? "no email on file";
}

l46Grace.name = "Grace M. Hopper"; // name is not readonly

// prints Ada Lovelace: ada@example.com
console.log(`${l46Ada.name}: ${l46Contact(l46Ada)}`);

// prints Grace M. Hopper: no email on file
console.log(`${l46Grace.name}: ${l46Contact(l46Grace)}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Cannot assign to 'id' because it is a read-only property.
l46Ada.id = "C-9";

// Compiler: Object literal may only specify known properties, and 'phone' does not exist in type 'L46Customer'.
const l46Extra: L46Customer = { id: "C-3", name: "Hopper", phone: "0123" };

// Compiler: Property 'name' is missing in type '{ id: string; }' but required in type 'L46Customer'.
const l46Incomplete: L46Customer = { id: "C-4" };

// prints C-9 — readonly is checked while compiling, never enforced while running
console.log(l46Ada.id);

<!-- cell: markdown -->
### Exercise

A bank describes its accounts with one interface. An IBAN and an opening date belong to the
account for good; a nickname is something the customer may or may not have chosen.

1. Run `check:nb` and fix both `[to fix]` errors by changing the interface or the function, not
   the sample data. `l46Salary` is a real account that simply has no nickname, and `l46Rebrand`
   is meant to change the nickname.
2. `l46Label(account)` returns the nickname when there is one, and the owner's name otherwise.
3. `l46Describe(account)` returns a line such as `"IT60 (Rainy day fund): 250.00 EUR"`, built
   from the label.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
interface L46Account {
  readonly iban: string;
  owner: string;
  balance: number;
  nickname: string;
  readonly openedOn: string;
}

const l46Savings: L46Account = {
  iban: "IT60",
  owner: "Ada",
  balance: 250,
  nickname: "Rainy day fund",
  openedOn: "2024-03-01",
};

const l46Salary: L46Account = {
  iban: "IT61",
  owner: "Grace",
  balance: 1200,
  openedOn: "2023-11-15",
};

function l46Label(account: L46Account): string {
  // TODO: the nickname when there is one, otherwise the owner
  return account.owner;
}

function l46Describe(account: L46Account): string {
  // TODO: a line such as "IT60 (Rainy day fund): 250.00 EUR"
  return account.iban;
}

function l46Rebrand(account: L46Account, nickname: string): void {
  account.iban = nickname;
}

console.log(l46Describe(l46Savings));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 46 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l46Renamed: L46Account = {
  iban: "IT62",
  owner: "Hopper",
  balance: 10,
  nickname: "Old name",
  openedOn: "2025-01-05",
};

l46Rebrand(l46Renamed, "Emergency fund");

checkAll([
  ["a nickname is used as the label", l46Label(l46Savings), "Rainy day fund"],
  ["without a nickname, the owner's name", l46Label(l46Salary), "Grace"],
  ["the description", l46Describe(l46Savings), "IT60 (Rainy day fund): 250.00 EUR"],
  ["a description with no nickname", l46Describe(l46Salary), "IT61 (Grace): 1200.00 EUR"],
  ["renaming changes the label", l46Label(l46Renamed), "Emergency fund"],
  ["renaming leaves the IBAN alone", l46Renamed.iban, "IT62"],
]);

<!-- cell: markdown -->
### Mini Challenge

```typescript
interface Payment {
  readonly reference: string;
  amount: number;
  note?: string;
}

const raw = { reference: "P-1", amount: 40, currency: "EUR" };
const first: Payment = raw;
const second: Payment = { reference: "P-2", amount: 40, currency: "EUR" };
```

Answer in comments in the cell below:

1. One of the last two lines is reported and the other isn't. Which, and why?
2. `first.note` has type `string | undefined`. What has to happen before `first.note.trim()`
   is allowed, and which message appears if you skip it?
3. The bank wants payments to record the day they were made, and never let it change
   afterwards. Which line do you add to the interface, and what happens to the two objects
   above?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 47 — Method definitions

### Explanation

An interface can describe what an object **does**, not just what it holds:

```typescript
interface FeeRule {
  readonly name: string;
  feeFor(amount: number): number; // method shorthand
  describe: () => string; // the function type from LESSON 31
}
```

Both notations mean the same thing here: the object must have that property, and it must be a
function with that signature. The shorthand reads like a class method; the arrow form reads
like a value that could be swapped later.

Any object with matching functions fits — an object literal, or an instance of a class that
happens to have those methods. Inside a literal you can leave the parameter types out, because
the interface supplies them (LESSON 30):

```typescript
const flat: FeeRule = {
  name: "Flat",
  feeFor(amount) {
    return 0.5;
  },
  describe: () => "0.50 EUR per transfer",
};
```

What the compiler reports:

- A missing method: `Property 'describe' is missing in type '{ ... }' but required in type
  'FeeRule'.` (TS2741)
- A wrong signature: `Type '() => number' is not assignable to type '() => string'.` (TS2322),
  with the mismatched part underneath.
- A wrong call: `Expected 1 arguments, but got 0.` (TS2554)

A method can be optional too — `onFailed?(reason: string): void;` — and then calling it without
checking gives `Cannot invoke an object which is possibly 'undefined'.` (TS2722)

This is the other half of LESSON 45. Composition holds a part; an interface says what that part
must be able to do, without naming any particular class.

### Key Notes

- `method(arg: T): R;` and `method: (arg: T) => R;` both declare a function property.
- Parameter types inside a matching object literal are filled in by the interface.
- Any object of the right shape fits, including a class instance.
- Missing method: TS2741 · wrong signature: TS2322 · wrong call: TS2554.
- `method?()` may be absent, so check before calling (TS2722).

### Example

<!-- cell: code example -->
interface L47Watcher {
  readonly label: string;
  onPaid(amount: number): string;
  onFailed?(reason: string): string;
}

const l47Quiet: L47Watcher = {
  label: "Quiet",
  onPaid(amount) {
    return `paid ${amount.toFixed(2)} EUR`;
  },
};

const l47Loud: L47Watcher = {
  label: "Loud",
  onPaid: (amount) => `paid ${amount.toFixed(2)} EUR`,
  onFailed: (reason) => `failed: ${reason}`,
};

function l47Report(watcher: L47Watcher, amount: number, reason: string): string {
  const paid = watcher.onPaid(amount);
  const failed = watcher.onFailed === undefined ? "no failure handler" : watcher.onFailed(reason);
  return `${paid} / ${failed}`;
}

// prints paid 40.00 EUR / no failure handler
console.log(l47Report(l47Quiet, 40, "no funds"));

// prints paid 40.00 EUR / failed: no funds
console.log(l47Report(l47Loud, 40, "no funds"));

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Property 'onPaid' is missing in type '{ label: string; }' but required in type 'L47Watcher'.
const l47Empty: L47Watcher = { label: "Empty" };

// Compiler: Cannot invoke an object which is possibly 'undefined'.
function l47Announce(watcher: L47Watcher): string {
  return watcher.onFailed("no funds");
}

// prints Quiet — nothing calls l47Announce, because it would throw on l47Quiet
console.log(l47Quiet.label);

<!-- cell: markdown -->
### Exercise

The bank charges a fee on transfers, and different customers are on different rules. The rules
are objects; the interface says what every rule must be able to do.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `l47Flat` charges `0.50` EUR for any amount above `0`, and nothing for `0` or less. Its
   description is `"0.50 EUR per transfer"`.
3. `l47Percent` charges `1.5%` of the amount, rounded to 2 decimals, but never less than
   `0.50` EUR — and nothing for an amount of `0` or less. Its description is
   `"1.5% (min 0.50 EUR)"`.
4. `l47TotalFees(amounts, rule)` adds up the fee for every amount, rounded to 2 decimals.
5. `l47FeeLine(rule)` returns a line such as `"Flat: 0.50 EUR per transfer"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
interface L47FeeRule {
  readonly name: string;
  feeFor(amount: number): number;
  describe(): string;
}

const l47Flat: L47FeeRule = {
  name: "Flat",
  feeFor(amount) {
    // TODO: 0.50 EUR for any amount above 0
    return 0;
  },
  describe(): number {
    // TODO: "0.50 EUR per transfer"
    return 0;
  },
};

const l47Percent: L47FeeRule = {
  name: "Percent",
  feeFor(amount) {
    // TODO: 1.5% rounded to 2 decimals, never below 0.50, and 0 for an amount of 0 or less
    return 0;
  },
  describe() {
    // TODO: "1.5% (min 0.50 EUR)"
    return "";
  },
};

function l47TotalFees(amounts: number[], rule: L47FeeRule): number {
  // TODO: every fee added up, rounded to 2 decimals
  return rule.feeFor();
}

function l47FeeLine(rule: L47FeeRule): string {
  // TODO: a line such as "Flat: 0.50 EUR per transfer"
  return rule.name;
}

console.log(l47FeeLine(l47Flat));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 47 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l47Amounts: number[] = [120, 10, 19.99];

checkAll([
  ["a percent fee is rounded", l47Percent.feeFor(120), 1.8],
  ["the minimum applies to small amounts", l47Percent.feeFor(10), 0.5],
  ["a flat fee ignores the amount", l47Flat.feeFor(120), 0.5],
  ["no fee on an amount of 0", l47Percent.feeFor(0), 0],
  ["nothing to charge on 0, flat rule too", l47Flat.feeFor(0), 0],
  ["the total with the percent rule", l47TotalFees(l47Amounts, l47Percent), 2.8],
  ["the total with the flat rule", l47TotalFees(l47Amounts, l47Flat), 1.5],
  ["a fee line", l47FeeLine(l47Percent), "Percent: 1.5% (min 0.50 EUR)"],
  ["the other fee line", l47FeeLine(l47Flat), "Flat: 0.50 EUR per transfer"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `l47Announce` in the demo cell is reported with TS2722. Name two ways to call an optional
   method safely, and say which one the Example uses.
2. `feeFor(amount: number): number;` and `feeFor: (amount: number) => number;` declare the same
   thing. Why might you still prefer the second form for a rule that a customer can change?
3. In LESSON 45 the account held an `L45FeePolicy`, a class. Suppose it held an `L47FeeRule`
   instead. What would change inside the account, and what would become possible outside it?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 48 — Extending interfaces

### Explanation

When several shapes share the same core, describe the core once and extend it:

```typescript
interface Movement {
  readonly id: string;
  amount: number;
  madeOn: string;
}

interface CardMovement extends Movement {
  kind: "card";
  merchant: string;
}
```

A `CardMovement` has all five properties, `readonly` included. Anything that takes a `Movement`
accepts it, and a `Movement[]` can hold every kind — but through the base type only the base
properties are visible: `Property 'merchant' does not exist on type 'Movement'.` (TS2339) That
is the same rule as base classes in LESSON 43, without any class.

- **An interface can extend several interfaces**: `interface RefundableCard extends
  CardMovement, Refundable {}`. Classes get one parent; interfaces are only shapes, so they can
  combine as many as they need.
- **Missing inherited properties are reported** like any other: `Type '{ kind: "card";
  merchant: string; amount: number; }' is missing the following properties from type
  'CardMovement': id, madeOn` (TS2739).
- **An extension may narrow an inherited property** — `amount: 10 | 20 | 50` over
  `amount: number` is fine — but not change it: `Interface 'BadMovement' incorrectly extends
  interface 'Movement'.` (TS2430)

Giving each extension a literal `kind` turns the family into the discriminated data of
LESSON 27: one union type, and a `switch` that narrows to the right variant.

**When to extend.** When the shared part is genuinely the same thing everywhere. Two shapes
that happen to have an `amount` today are not a family; extending them ties them together
forever.

### Key Notes

- `interface B extends A` gives B everything A declares, `readonly` and `?` included.
- An interface may extend several interfaces at once.
- A B value fits wherever an A is expected; through A, only A's properties are visible.
- An extension can narrow an inherited property, not contradict it (TS2430).
- A literal `kind` on each extension gives a discriminated union.

### Example

<!-- cell: code example -->
interface L48Product {
  readonly code: string;
  monthlyCost: number;
}

interface L48Insurance extends L48Product {
  kind: "insurance";
  covers: string;
}

interface L48Subscription extends L48Product {
  kind: "subscription";
  renewsOn: string;
}

type L48Extra = L48Insurance | L48Subscription;

function l48Cost(product: L48Product): string {
  return `${product.code}: ${product.monthlyCost.toFixed(2)} EUR / month`;
}

function l48Note(extra: L48Extra): string {
  if (extra.kind === "insurance") {
    return `${l48Cost(extra)}, covers ${extra.covers}`;
  }
  return `${l48Cost(extra)}, renews on ${extra.renewsOn}`;
}

const l48Extras: L48Extra[] = [
  { code: "INS-1", monthlyCost: 4.5, kind: "insurance", covers: "card theft" },
  { code: "SUB-1", monthlyCost: 9.99, kind: "subscription", renewsOn: "2026-02-01" },
];

// prints INS-1: 4.50 EUR / month, covers card theft
console.log(l48Note(l48Extras[0]));

// prints SUB-1: 9.99 EUR / month, renews on 2026-02-01
console.log(l48Note(l48Extras[1]));

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Interface 'L48FreeProduct' incorrectly extends interface 'L48Product'.
interface L48FreeProduct extends L48Product {
  monthlyCost: string;
}

const l48First: L48Product = l48Extras[0];

// Compiler: Property 'covers' does not exist on type 'L48Product'.
// prints INS-1 card theft — the object really does carry covers; the L48Product type is just
// the part of it that every product shares
console.log(`${l48First.code} ${l48First.covers}`);

<!-- cell: markdown -->
### Exercise

A bank statement lists three kinds of movement. They share an id, an amount and a date; each
kind adds one detail of its own.

1. Run `check:nb` and fix both `[to fix]` errors: one sample movement is incomplete, and
   `l48Line` reaches for a property its parameter type doesn't promise.
2. `l48Line(movement)` works for any movement and returns
   `"M-1: 40.70 EUR on 2026-01-05"`.
3. `l48Detail(movement)` adds the part that depends on the kind: `" at Coffee Bar"` for a card
   payment, `" to Grace"` for a transfer, `" (monthly fee)"` for a fee.
4. `l48Total(movements)` adds up the amounts of any list of movements, rounded to 2 decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
interface L48Movement {
  readonly id: string;
  amount: number;
  madeOn: string;
}

interface L48CardMovement extends L48Movement {
  kind: "card";
  merchant: string;
}

interface L48TransferMovement extends L48Movement {
  kind: "transfer";
  counterparty: string;
}

interface L48FeeMovement extends L48Movement {
  kind: "fee";
  reason: string;
}

type L48Statement = L48CardMovement | L48TransferMovement | L48FeeMovement;

const l48Card: L48CardMovement = {
  id: "M-1",
  amount: 40.7,
  madeOn: "2026-01-05",
  kind: "card",
  merchant: "Coffee Bar",
};

const l48Transfer: L48TransferMovement = {
  id: "M-2",
  amount: 120.1,
  kind: "transfer",
  counterparty: "Grace",
};

const l48Fee: L48FeeMovement = {
  id: "M-3",
  amount: 2.15,
  madeOn: "2026-01-07",
  kind: "fee",
  reason: "monthly fee",
};

function l48Line(movement: L48Movement): string {
  // TODO: "M-1: 40.70 EUR on 2026-01-05"
  return `${movement.id} ${movement.merchant}`;
}

function l48Detail(movement: L48Statement): string {
  // TODO: the line, plus " at <merchant>", " to <counterparty>" or " (<reason>)"
  return l48Line(movement);
}

function l48Total(movements: L48Movement[]): number {
  // TODO: every amount added up, rounded to 2 decimals
  return 0;
}

console.log(l48Line(l48Card));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 48 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l48Statement: L48Statement[] = [l48Card, l48Transfer, l48Fee];

checkAll([
  ["a line uses the shared properties only", l48Line(l48Card), "M-1: 40.70 EUR on 2026-01-05"],
  ["the same line for a fee", l48Line(l48Fee), "M-3: 2.15 EUR on 2026-01-07"],
  ["a card detail", l48Detail(l48Card), "M-1: 40.70 EUR on 2026-01-05 at Coffee Bar"],
  ["a transfer detail", l48Detail(l48Transfer), "M-2: 120.10 EUR on 2026-01-06 to Grace"],
  ["a fee detail", l48Detail(l48Fee), "M-3: 2.15 EUR on 2026-01-07 (monthly fee)"],
  ["every kind counts in the total, rounded", l48Total(l48Statement), 162.95],
  ["a total of one movement", l48Total([l48Fee]), 2.15],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `l48Total` takes an `L48Movement[]`, not an `L48Statement[]`, and still works for the whole
   statement. Why — and what would `l48Total` be unable to do with its parameter?
2. The bank adds a refund flag that can appear on any kind of movement:
   `refundedOn?: string`. Would you add it to `L48Movement`, write it as a separate interface
   that each kind also extends, or repeat it in all three? Give a reason.
3. `L48FeeMovement` could redeclare `amount`, but only in a way that agrees with
   `L48Movement`. Suppose a fee is always exactly `2`, `5` or `10`. Which declaration would the
   compiler accept, which one would it report, and what would the accepted one buy you?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 49 — Implementing interfaces

### Explanation

A class can say out loud which interfaces it satisfies:

```typescript
class Invoice implements Billable, Cancelable {
  // every member both interfaces ask for
}
```

`implements` adds nothing to the class: no properties, no method bodies, no behavior —
`extends` does that. What it adds is a **check on the class itself**, so a class that doesn't
match is reported on its own line instead of later, at some call.

- A missing member: `Class 'Missing' incorrectly implements interface 'Billable'.` with
  `Property 'describe' is missing in type 'Missing' but required in type 'Billable'.` (TS2420)
- A member with the wrong signature is reported like a wrong override (LESSON 43):
  `Property 'total' in type 'WrongTotal' is not assignable to the same property in base type
  'Billable'.` (TS2416)
- A member hidden behind `private`: `Property 'describe' is private in type 'Hidden' but not in
  type 'Billable'.` (TS2420) An interface describes what the outside can use.

A `readonly` property is satisfied by a plain property **or** by a getter (LESSON 42): both
give the outside something to read and nothing to write. A class can implement several
interfaces, and extend a class at the same time.

The other direction isn't symmetric: an object literal can satisfy an interface, but not a
class type that has private members. The class type includes them, and only the class can
create them.

**Why bother**, when a class with the right shape already fits? Because the promise is then
written where it can be checked: remove a method the interface needs, and the error lands on
the class, not in the file that passed it somewhere.

### Key Notes

- `class C implements I` is a check, not inheritance: nothing is added to C.
- Missing or private members are reported on the class line (TS2420); wrong signatures as
  TS2416.
- A getter satisfies a `readonly` property.
- A class may implement several interfaces, and extend a class at the same time.
- A class type with private members is not satisfied by an object literal.

### Example

<!-- cell: code example -->
interface L49Billable {
  readonly reference: string;
  total(): number;
  describe(): string;
}

interface L49Cancelable {
  readonly canceled: boolean;
  cancel(): void;
}

class L49Invoice implements L49Billable, L49Cancelable {
  private stopped: boolean = false;

  constructor(
    public readonly reference: string,
    private lines: number[],
  ) {}

  public get canceled(): boolean {
    return this.stopped;
  }

  public cancel(): void {
    this.stopped = true;
  }

  public total(): number {
    if (this.stopped) {
      return 0;
    }
    return Math.round(this.lines.reduce((sum, line) => sum + line, 0) * 100) / 100;
  }

  public describe(): string {
    return this.stopped ? `${this.reference}: canceled` : `${this.reference}: ${this.total().toFixed(2)} EUR`;
  }
}

const l49Invoice: L49Billable = new L49Invoice("INV-1", [40.7, 120.1, 2.15]);

console.log(l49Invoice.describe()); // prints INV-1: 162.95 EUR

const l49Second = new L49Invoice("INV-2", [10]);
l49Second.cancel();
console.log(`${l49Second.describe()} ${l49Second.total()}`); // prints INV-2: canceled 0

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Class 'L49Note' incorrectly implements interface 'L49Billable'.
// Compiler: Property 'describe' is missing in type 'L49Note' but required in type 'L49Billable'.
class L49Note implements L49Billable {
  public readonly reference = "NOTE-1";

  public total(): number {
    return 0;
  }
}

console.log(new L49Note().reference); // prints NOTE-1

<!-- cell: markdown -->
### Exercise

A standing order pays the same amount every month for a fixed number of months. It is billable
like an invoice, and it can be canceled.

1. Run `check:nb` and fix both `[to fix]` errors: one member doesn't match what
   `L49Billable` promises, and the last line creates a standing order without saying how long
   it runs.
2. `total()` returns the monthly amount times the number of months, rounded to 2 decimals —
   and `0` once the order has been canceled.
3. `describe()` returns `"SO-1: 12 x 8.90 EUR = 106.80 EUR"`, or `"SO-1: canceled"` after
   cancellation.
4. `cancel()` stops the order for good, and `canceled` reports whether it was stopped. Keep the
   flag private: the outside may read it, not set it.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
class L49StandingOrder implements L49Billable, L49Cancelable {
  private stopped: boolean = false;

  constructor(
    public readonly reference: string,
    private monthlyAmount: number,
    private months: number,
  ) {}

  public get canceled(): boolean {
    // TODO: has this order been canceled?
    return false;
  }

  public cancel(): void {
    // TODO: stop the order
  }

  public total(): string {
    // TODO: the monthly amount times the number of months, rounded, or 0 once canceled
    return "0";
  }

  public describe(): string {
    // TODO: "SO-1: 12 x 8.90 EUR = 106.80 EUR", or "SO-1: canceled"
    return this.reference;
  }
}

const l49Mine = new L49StandingOrder("SO-1", 8.9);
console.log(l49Mine.describe());

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 49 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l49Order = new L49StandingOrder("SO-1", 8.9, 12);
const l49Stopped = new L49StandingOrder("SO-2", 9.99, 6);
l49Stopped.cancel();

const l49Small = new L49StandingOrder("SO-3", 4.15, 3);

checkAll([
  ["the total is rounded", l49Order.total(), 106.8],
  ["a running order is not canceled", l49Order.canceled, false],
  ["the description", l49Order.describe(), "SO-1: 12 x 8.90 EUR = 106.80 EUR"],
  ["a canceled order is canceled", l49Stopped.canceled, true],
  ["a canceled order owes nothing", l49Stopped.total(), 0],
  ["a canceled description", l49Stopped.describe(), "SO-2: canceled"],
  ["another order, another total, also rounded", l49Small.total(), 12.45],
  ["its own description", l49Small.describe(), "SO-3: 3 x 4.15 EUR = 12.45 EUR"],
  ["canceling one order leaves the others alone", l49Order.total(), 106.8],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `implements` adds nothing to the class. So what would you lose by deleting it from
   `L49StandingOrder`, given that the class would still have every member?
2. The bank wants a monthly report built from a plain object literal that has the same
   `reference`, `total()` and `describe()`. Can that literal be typed as `L49Billable`? Can it
   be typed as `L49StandingOrder`? Explain the difference.
3. `canceled` is declared `readonly boolean` in the interface, and the class satisfies it with
   a getter. Name one thing the getter can do that a plain `public canceled = false` property
   cannot.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 50 — Interface or type alias?

### Explanation

Both name a type, and for an object shape they are interchangeable:

```typescript
interface Money {
  amount: number;
  currency: Currency;
}

type MoneyAlias = { amount: number; currency: Currency };
```

They also mix freely: an interface can extend an object type alias, and a class can implement
one. Three differences decide the choice.

**An alias can name any type.** A union, a literal union, a tuple, a function type, even
`string`. An interface describes an object. `type Currency = "EUR" | "USD"` has no interface
equivalent, so unions, tuples and function types are always aliases.

**Interfaces merge, aliases don't.** Two `interface Config` declarations with the same name
become one interface with all the properties. Two `type Settings` declarations are reported:
`Duplicate identifier 'Settings'.` (TS2300) Merging is what lets a library's types be extended
from outside; inside your own code it mostly hides accidents, which is why it is friendlier for
a repeated alias name to be reported.

**`implements` reads better with an interface.** Both work, but a class that implements
something named with `interface` says "this is a contract" to every reader.

**A rule that works:** use `interface` for object shapes that other code depends on — the ones
classes implement, the ones that grow. Use `type` for everything else: unions, literal unions,
tuples, function types, and small shapes that live in one file. Being consistent in a project
matters more than the rule itself.

### Key Notes

- For a plain object shape, either form works and both mix.
- Only an alias can name a union, a tuple, a function type or a primitive.
- Interfaces with the same name merge; repeated aliases are reported (TS2300).
- `interface` for shapes classes implement or that other code depends on.
- `type` for unions, tuples, function types and local shapes.

### Example

<!-- cell: code example -->
type L50Status = "open" | "closed";
type L50Fee = (amount: number) => number;

interface L50Ticket {
  readonly id: string;
  status: L50Status;
  amount: number;
}

function l50Close(ticket: L50Ticket, fee: L50Fee): L50Ticket {
  return { id: ticket.id, status: "closed", amount: ticket.amount + fee(ticket.amount) };
}

const l50Open: L50Ticket = { id: "T-1", status: "open", amount: 100 };
const l50Closed = l50Close(l50Open, (amount) => Math.round(amount * 0.02 * 100) / 100);

// prints T-1 closed 102
console.log(`${l50Closed.id} ${l50Closed.status} ${l50Closed.amount}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Duplicate identifier 'L50Mode'. (reported on both lines)
type L50Mode = "fast";
type L50Mode = "slow";

interface L50Draft {
  id: string;
}

interface L50Draft {
  note: string;
}

// Compiler: Property 'note' is missing in type '{ id: string; }' but required in type 'L50Draft'.
// The second L50Draft did not replace the first: the two declarations merged, so every draft
// now needs a note as well.
const l50Merged: L50Draft = { id: "D-1" };

console.log(l50Open.status); // prints open

<!-- cell: markdown -->
### Exercise

A small wallet report. The currency list, the conversion function and the wallet shape each
want the form that fits them.

1. Run `check:nb` and fix both `[to fix]` errors. One is a currency that isn't one of the two
   the bank supports; the other is a function returning the wrong kind of value.
2. `l50Format(money)` returns `"249.95 EUR"`.
3. `l50TotalIn(wallet, target, rate)` converts every holding to the target currency with the
   `rate` function and adds them up, rounded to 2 decimals.
4. `l50Describe(wallet)` returns `"Ada: 2 holdings"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L50Currency = "EUR" | "USD";

type L50Rate = (from: L50Currency, to: L50Currency) => number;

interface L50Money {
  amount: number;
  currency: L50Currency;
}

interface L50Wallet {
  readonly owner: string;
  holdings: L50Money[];
}

const l50Rate: L50Rate = (from, to) => {
  if (from === to) {
    return 1;
  }
  return from === "EUR" ? 1.1 : 0.91;
};

const l50Wallet: L50Wallet = {
  owner: "Ada",
  holdings: [
    { amount: 249.95, currency: "EUR" },
    { amount: 120.5, currency: "GBP" },
  ],
};

function l50Format(money: L50Money): string {
  // TODO: "249.95 EUR"
  return money.currency;
}

function l50TotalIn(wallet: L50Wallet, target: L50Currency, rate: L50Rate): number {
  // TODO: every holding converted to the target currency, added up, rounded to 2 decimals
  return 0;
}

function l50Describe(wallet: L50Wallet): string {
  // TODO: "Ada: 2 holdings"
  return wallet.holdings;
}

console.log(l50Format(l50Wallet.holdings[0]));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 50 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l50Euros: L50Money = { amount: 249.95, currency: "EUR" };

checkAll([
  ["a formatted amount", l50Format(l50Euros), "249.95 EUR"],
  ["a formatted dollar amount", l50Format({ amount: 120.5, currency: "USD" }), "120.50 USD"],
  ["the same currency needs no conversion", l50TotalIn({ owner: "Solo", holdings: [l50Euros] }, "EUR", l50Rate), 249.95],
  ["a total in euros, rounded", l50TotalIn(l50Wallet, "EUR", l50Rate), 359.61],
  ["a total in dollars, rounded", l50TotalIn(l50Wallet, "USD", l50Rate), 395.45],
  ["an empty wallet totals 0", l50TotalIn({ owner: "New", holdings: [] }, "EUR", l50Rate), 0],
  ["the description", l50Describe(l50Wallet), "Ada: 2 holdings"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. For each of these, `interface` or `type`, and why: a customer shape that three classes
   implement · the list of allowed transaction statuses · a callback that formats money · a
   pair of coordinates · a small shape used by one function in one file.
2. The demo cell declared `interface L50Draft` twice and the two merged into one. Name one
   case where that is useful, and one where it would cost you an afternoon.
3. Your project already declares `type Account = { owner: string; balance: number }`, and a
   class now needs to implement it. Do you have to turn the alias into an interface? What
   would you actually do?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
