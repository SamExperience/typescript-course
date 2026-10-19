<!-- cell: markdown -->
# TypeScript — Utility types

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../15_utility_types/lesson.ipynb
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
## LESSON 56 — `Partial`, `Required` and `Readonly`

### Explanation

TypeScript ships with a set of generic types that build a new type out of one you already have.
The first three change what the properties promise:

```typescript
type Account = { iban: string; owner: string; balance: number; nickname?: string };

type Changes = Partial<Account>; // every property optional
type Complete = Required<Account>; // every property required
type Frozen = Readonly<Account>; // every property readonly
```

Each one produces a **new** type; `Account` itself never changes.

- **`Partial<T>`** describes "some of the properties", which is exactly what an update is:
  `apply(account, { balance: 300 })`. A `Partial<Account>` is not an `Account`, and passing one
  where the full type is expected is reported with the reason:
  `Type 'string | undefined' is not assignable to type 'string'.` (TS2345) Reading a property
  of a `Partial` needs the usual check first (TS18048).
- **`Required<T>`** removes the `?`. A value that leaves `nickname` out is then reported
  (TS2741) — useful when a later step has to have every field filled in.
- **`Readonly<T>`** marks every property `readonly`: assigning gives
  `Cannot assign to 'balance' because it is a read-only property.` (TS2540) As a parameter
  type it is a promise: "this function won't change your object".

`Readonly` and `Partial` are **shallow**: they change the properties of `T`, not the properties
of objects inside it. `holdings` may be readonly while `holdings.push(...)` is still allowed.

Nothing here is magic: they are generic types like the ones you wrote in LESSON 52, shipped
with the compiler.

### Key Notes

- `Partial<T>` all optional · `Required<T>` all required · `Readonly<T>` all readonly.
- They build a new type; the original is untouched.
- A `Partial<T>` can't be used where a `T` is expected (TS2345).
- Reading a `Partial`'s property needs an `undefined` check (TS18048).
- All three are shallow: nested objects keep their own rules.

### Example

<!-- cell: code example -->
type L56Account = {
  iban: string;
  owner: string;
  balance: number;
  nickname?: string;
};

function l56Apply(account: L56Account, changes: Partial<L56Account>): L56Account {
  return {
    iban: changes.iban ?? account.iban,
    owner: changes.owner ?? account.owner,
    balance: changes.balance ?? account.balance,
    nickname: changes.nickname ?? account.nickname,
  };
}

function l56Line(account: Readonly<L56Account>): string {
  return `${account.iban} (${account.nickname ?? account.owner}): ${account.balance.toFixed(2)} EUR`;
}

const l56Savings: L56Account = { iban: "IT60", owner: "Ada", balance: 250 };
const l56Updated = l56Apply(l56Savings, { balance: 300, nickname: "Rainy day" });

// prints IT60 (Ada): 250.00 EUR
console.log(l56Line(l56Savings));

// prints IT60 (Rainy day): 300.00 EUR
console.log(l56Line(l56Updated));

<!-- cell: code type-error-demo -->
// Type error on purpose.
const l56Changes: Partial<L56Account> = { balance: 300 };

// Compiler: Argument of type 'Partial<L56Account>' is not assignable to parameter of type 'Readonly<L56Account>'.
// Nothing calls l56Broken: reading balance.toFixed on a missing balance would throw.
function l56Broken(): string {
  return l56Line(l56Changes);
}

function l56Doubled(changes: Partial<L56Account>): number {
  // Compiler: 'changes.balance' is possibly 'undefined'.
  return changes.balance * 2;
}

const l56Frozen: Readonly<L56Account> = l56Savings;

// Compiler: Cannot assign to 'balance' because it is a read-only property.
l56Frozen.balance = 0;

// prints 0 — readonly is a compile-time rule, so the assignment above really did run
console.log(l56Savings.balance);

<!-- cell: markdown -->
### Exercise

The bank edits customers by sending only the fields that changed, and prints a card that must
never modify what it is given.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `l56Update(customer, changes)` returns a **new** customer with the given changes applied. A
   field that isn't in `changes` keeps its current value, and the customer passed in is never
   modified.
3. `l56Card(customer)` returns `"C-1 Ada (no email)"`, or the address in the brackets when
   there is one. Its parameter type must promise not to change the customer.
4. `l56Fill(customer)` returns a customer with every field filled in: a missing email becomes
   `"none@example.com"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L56Customer = {
  id: string;
  name: string;
  email?: string;
  active: boolean;
};

const l56Customer: L56Customer = { id: "C-1", name: "Ada", active: true };

const l56Partial: Required<L56Customer> = { id: "C-2", name: "Grace" };

function l56Update(customer: L56Customer, changes: Partial<L56Customer>): L56Customer {
  // TODO: a new customer with the changes applied, leaving the original alone
  return { id: customer.id, name: changes.name, email: customer.email, active: customer.active };
}

function l56Card(customer: Readonly<L56Customer>): string {
  // TODO: "C-1 Ada (no email)" or "C-1 Ada (ada@example.com)"
  return customer.id;
}

function l56Fill(customer: L56Customer): Required<L56Customer> {
  // TODO: every field filled in; a missing email becomes "none@example.com"
  return { id: customer.id, name: customer.name, email: "none@example.com", active: customer.active };
}

console.log(l56Card(l56Customer));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 56 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l56Renamed = l56Update(l56Customer, { name: "Ada Lovelace" });
const l56Deactivated = l56Update(l56Customer, { active: false, email: "ada@example.com" });

checkAll([
  ["the changed field", l56Renamed.name, "Ada Lovelace"],
  ["the untouched fields", l56Renamed.id, "C-1"],
  ["the original is unchanged", l56Customer.name, "Ada"],
  ["two changes at once", `${l56Deactivated.active} ${l56Deactivated.email}`, "false ada@example.com"],
  ["a card without an email", l56Card(l56Customer), "C-1 Ada (no email)"],
  ["a card with one", l56Card(l56Deactivated), "C-1 Ada (ada@example.com)"],
  ["a filled-in customer", l56Fill(l56Customer).email, "none@example.com"],
  ["an existing email is kept", l56Fill(l56Deactivated).email, "ada@example.com"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `l56Update` takes a `Partial<L56Customer>` rather than a `L56Customer`. What would callers
   have to write if it took the full type, and what would that cost when a new field is added
   to `L56Customer`?
2. The demo cell assigns to a `Readonly` property and the value really changes when the cell
   runs. What does `Readonly<T>` protect, then, and what doesn't it?
3. `Required<L56Customer>` makes `email` required. Would you use it for the customers stored by
   the bank, or only for a later step of the program? Give a reason.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 57 — `Pick` and `Omit`

### Explanation

The next two build a smaller type out of a bigger one, by naming properties:

```typescript
type Account = { iban: string; owner: string; balance: number; pin: string };

type Summary = Pick<Account, "iban" | "balance">; // only these two
type Public = Omit<Account, "pin">; // everything except this one
```

`Pick<T, K>` keeps the properties you name; `Omit<T, K>` keeps the rest. Either way the
properties keep their own types, their `?` and their `readonly`, so a change to `Account`
reaches both without anyone editing them.

- **A name that isn't a key of `T` is reported for `Pick`**: `Type '"nmae"' does not satisfy the
  constraint 'keyof Account'.` (TS2344)
- **`Omit` does not check the name.** `Omit<Account, "nmae">` is accepted and removes nothing,
  which is worth knowing: a typo there is silent.
- An object literal with a property the smaller type doesn't have is reported as usual
  (TS2353), but a **full `Account` held in a variable** fits where a `Summary` is expected: it
  has everything the smaller type asks for.

**Which to use.** `Pick` when the short list is the point ("a statement line needs these two
fields"). `Omit` when the removal is the point ("everything except the PIN"). `Omit` also keeps
working when new fields arrive — which is what you want for a public view, and not what you
want for a summary that should stay small.

### Key Notes

- `Pick<T, K>` keeps the named properties, `Omit<T, K>` removes them.
- Property types, `?` and `readonly` are carried over unchanged.
- A wrong key is reported for `Pick` (TS2344) but silently ignored by `Omit`.
- A value of the full type fits where the smaller type is expected.
- `Pick` for a deliberate short list, `Omit` for a deliberate removal.

### Example

<!-- cell: code example -->
type L57Account = {
  readonly iban: string;
  owner: string;
  balance: number;
  pin: string;
};

type L57Public = Omit<L57Account, "pin">;
type L57Summary = Pick<L57Account, "iban" | "balance">;

function l57Publish(account: L57Account): L57Public {
  return { iban: account.iban, owner: account.owner, balance: account.balance };
}

function l57SummaryLine(summary: L57Summary): string {
  return `${summary.iban}: ${summary.balance.toFixed(2)} EUR`;
}

const l57Account: L57Account = { iban: "IT60", owner: "Ada", balance: 250, pin: "0000" };
const l57Shown = l57Publish(l57Account);

// prints IT60 Ada IT60: 250.00 EUR
console.log(`${l57Shown.iban} ${l57Shown.owner} ${l57SummaryLine(l57Account)}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Type '"nmae"' does not satisfy the constraint 'keyof L57Account'.
type L57Typo = Pick<L57Account, "nmae">;

// Compiler: Object literal may only specify known properties, and 'pin' does not exist in type 'L57Public'.
const l57Leaked: L57Public = { iban: "IT61", owner: "Grace", balance: 10, pin: "1234" };

// No error at all: Omit ignores a key that isn't there, so this type still has the pin.
type L57NotOmitted = Omit<L57Account, "pni">;
const l57StillHasPin: L57NotOmitted = { iban: "IT62", owner: "Hopper", balance: 5, pin: "9999" };

// prints IT62 — the type above is the full account under a misleading name
console.log(l57StillHasPin.iban);

<!-- cell: markdown -->
### Exercise

A loan record holds everything the bank knows. Two smaller views are built from it: what a
customer may see, and what a one-line report needs.

1. Run `check:nb` and fix both `[to fix]` errors: one view lets through something it
   shouldn't, and one function returns the wrong kind of value. Don't change the sample loan.
2. `L57CustomerView` is the loan without the internal risk note and without the officer's name.
3. `L57ReportRow` is only the reference, the borrower and the outstanding amount.
4. `l57ForCustomer(loan)` returns the customer view, and `l57Row(loan)` returns the report row.
5. `l57RowLine(row)` returns `"LN-1 Ada: 6500.00 EUR"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L57Loan = {
  readonly reference: string;
  borrower: string;
  outstanding: number;
  ratePercent: number;
  riskNote: string;
  officer: string;
};

const l57Loan: L57Loan = {
  reference: "LN-1",
  borrower: "Ada",
  outstanding: 6500,
  ratePercent: 6.5,
  riskNote: "reviewed 2026-01",
  officer: "Grace",
};

type L57CustomerView = Omit<L57Loan, "riskNote">;

type L57ReportRow = Pick<L57Loan, "reference" | "borrower" | "outstanding">;

function l57ForCustomer(loan: L57Loan): L57CustomerView {
  // TODO: everything the customer may see
  return { reference: loan.reference, borrower: loan.borrower, outstanding: loan.outstanding, ratePercent: loan.ratePercent };
}

function l57Row(loan: L57Loan): L57ReportRow {
  // TODO: the three fields the report needs
  return { reference: loan.reference, borrower: loan.borrower, outstanding: loan.outstanding };
}

function l57RowLine(row: L57ReportRow): string {
  // TODO: "LN-1 Ada: 6500.00 EUR"
  return row.outstanding;
}

console.log(l57RowLine(l57Row(l57Loan)));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 57 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l57View = l57ForCustomer(l57Loan);
const l57Fields = Object.keys(l57View).sort();

checkAll([
  ["the customer view keeps the rate", l57View.ratePercent, 6.5],
  ["and the borrower", l57View.borrower, "Ada"],
  ["but not the risk note or the officer", l57Fields, ["borrower", "outstanding", "ratePercent", "reference"]],
  ["the row has three fields", Object.keys(l57Row(l57Loan)).sort(), ["borrower", "outstanding", "reference"]],
  ["the row line", l57RowLine(l57Row(l57Loan)), "LN-1 Ada: 6500.00 EUR"],
  ["another loan, another line", l57RowLine({ reference: "LN-2", borrower: "Hopper", outstanding: 250.5 }), "LN-2 Hopper: 250.50 EUR"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. The bank adds a `currency` field to `L57Loan`. What happens to `L57CustomerView`, and what
   happens to `L57ReportRow`? Which behavior do you want in each case?
2. `Omit<L57Loan, "riskNotes">` — with an `s` — is accepted by the compiler. What does the
   resulting type contain, and how would you notice the mistake?
3. Would you write `l57Row` to take an `L57Loan` or an `L57CustomerView`? Give a reason in
   terms of what the function actually reads.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 58 — `Record`

### Explanation

`Record<K, V>` describes an object used as a table: `K` is the type of the keys, `V` the type
of every value.

```typescript
type Currency = "EUR" | "USD" | "GBP";

type RateTable = Record<Currency, number>;
const rates: RateTable = { EUR: 1, USD: 1.1, GBP: 0.85 };
```

When `K` is a **literal union**, the table has to be complete: leaving `GBP` out is
`Property 'GBP' is missing in type '{ EUR: number; USD: number; }' but required in type
'RateTable'.` (TS2741) An unknown key is reported too (TS2353). That is the real value of
`Record` here — add a currency to the union and every table built from it is reported until
someone fills in the new rate.

When `K` is `string`, the table accepts any key — and reading one gives a `V` whether or not
it is there:

```typescript
type Counts = Record<string, number>;
const counts: Counts = { deposits: 2 };
const missing: number = counts.withdrawals; // typed number, actually undefined
```

Nothing is reported, and `missing.toFixed(2)` throws when it runs. LESSON 36's
`noUncheckedIndexedAccess` is the option that turns those reads into `number | undefined`.
Without it, prefer a literal union of keys whenever you know them.

`Record` is how the "totals per currency" from mini-project 2 should have been typed: one
entry per known currency, checked by the compiler.

### Key Notes

- `Record<K, V>`: keys of type `K`, values of type `V`.
- With a literal union of keys, a missing entry (TS2741) or an unknown one (TS2353) is reported.
- Adding a value to the key union reports every table that hasn't been updated.
- `Record<string, V>` accepts any key and types every read as `V`, present or not.
- Use a known key union whenever you have one.

### Example

<!-- cell: code example -->
type L58Channel = "card" | "transfer" | "cash";

const l58FeePercent: Record<L58Channel, number> = { card: 1.5, transfer: 0, cash: 2.5 };

const l58ChannelNames: Record<L58Channel, string> = {
  card: "Card",
  transfer: "Transfer",
  cash: "Cash",
};

function l58FeeFor(channel: L58Channel, amount: number): number {
  return Math.round(amount * (l58FeePercent[channel] / 100) * 100) / 100;
}

// prints 1.81 0 6.26
console.log(`${l58FeeFor("card", 120.5)} ${l58FeeFor("transfer", 120.5)} ${l58FeeFor("cash", 250.5)}`);

// prints Card / Transfer
console.log(`${l58ChannelNames.card} / ${l58ChannelNames.transfer}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Property 'cash' is missing in type '{ card: number; transfer: number; }' but required in type 'Record<L58Channel, number>'.
const l58Incomplete: Record<L58Channel, number> = { card: 1.5, transfer: 0 };

// Compiler: Object literal may only specify known properties, and 'cheque' does not exist in type 'Record<L58Channel, number>'.
const l58Unknown: Record<L58Channel, number> = { card: 1.5, transfer: 0, cash: 2.5, cheque: 3 };

// No error: with string keys, a missing entry is still typed number.
const l58Counts: Record<string, number> = { deposits: 2 };
const l58Missing: number = l58Counts.withdrawals;

// prints 2 undefined — the second one would throw if anything called toFixed on it
console.log(`${l58Counts.deposits} ${l58Missing}`);

<!-- cell: markdown -->
### Exercise

A statement adds up movements per currency and converts them to one currency for the total.

1. Run `check:nb` and fix both `[to fix]` errors by completing the tables, not by changing
   their types.
2. `l58Totals(movements)` returns one total per currency, rounded to 2 decimals. A currency
   with no movements totals `0`.
3. `l58In(amount, from, to)` converts an amount using the rate table, rounded to 2 decimals.
4. `l58GrandTotal(movements, target)` converts every currency's total into the target currency
   and adds them up, rounded to 2 decimals.
5. `l58Report(movements)` returns `"EUR 160.80 | USD 2.15 | GBP 0.00"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L58Currency = "EUR" | "USD" | "GBP";
type L58Movement = { reference: string; amount: number; currency: L58Currency };

const l58Rates: Record<L58Currency, number> = { EUR: 1, USD: 1.1 };

const l58Names: Record<L58Currency, string> = { EUR: "EUR", USD: "USD", GBP: "GBP", CHF: "CHF" };

const l58Movements: L58Movement[] = [
  { reference: "M-1", amount: 40.7, currency: "EUR" },
  { reference: "M-2", amount: 120.1, currency: "EUR" },
  { reference: "M-3", amount: 2.15, currency: "USD" },
];

function l58Totals(movements: L58Movement[]): Record<L58Currency, number> {
  // TODO: one total per currency, rounded to 2 decimals
  return { EUR: 0, USD: 0, GBP: 0 };
}

function l58In(amount: number, from: L58Currency, to: L58Currency): number {
  // TODO: the amount converted with the rate table, rounded to 2 decimals
  return amount;
}

function l58GrandTotal(movements: L58Movement[], target: L58Currency): number {
  // TODO: every currency total converted into the target currency and added up
  return 0;
}

function l58Report(movements: L58Movement[]): string {
  // TODO: "EUR 160.80 | USD 2.15 | GBP 0.00"
  return "";
}

console.log(l58Report(l58Movements));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 58 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l58Sums = l58Totals(l58Movements);

checkAll([
  ["the euro total", l58Sums.EUR, 160.8],
  ["the dollar total", l58Sums.USD, 2.15],
  ["a currency with no movements", l58Sums.GBP, 0],
  ["no conversion needed", l58In(40.7, "EUR", "EUR"), 40.7],
  ["euros into dollars, rounded", l58In(100, "EUR", "USD"), 110],
  ["dollars into euros, rounded", l58In(100, "USD", "EUR"), 90.91],
  ["euros into pounds, rounded", l58In(250.5, "EUR", "GBP"), 212.93],
  ["everything in euros", l58GrandTotal(l58Movements, "EUR"), 162.75],
  ["the report", l58Report(l58Movements), "EUR 160.80 | USD 2.15 | GBP 0.00"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. The bank starts accepting Swiss francs, so `"CHF"` joins `L58Currency`. Which lines does the
   compiler report, and why is that a good day rather than a bad one?
2. `l58Rates` could have been typed `Record<string, number>`. What would the compiler have
   stopped reporting, and what would happen at runtime to `l58In(100, "CHF", "EUR")`?
3. `l58Totals` starts from `{ EUR: 0, USD: 0, GBP: 0 }` rather than an empty object. What would
   an empty start cost, in types and at runtime?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 59 — `Exclude` and `Extract`

### Explanation

The previous utility types worked on object shapes. These two work on **unions**, keeping or
removing members:

```typescript
type Currency = "EUR" | "USD" | "GBP";

type Foreign = Exclude<Currency, "EUR">; // "USD" | "GBP"
type Home = Extract<Currency, "EUR" | "CHF">; // "EUR"
```

`Exclude<T, U>` drops every member of `T` that fits `U`; `Extract<T, U>` keeps exactly those.
A value outside the result is reported as usual: `Type '"EUR"' is not assignable to type
'Foreign'.` (TS2322)

They are at their best on the **discriminated unions** from LESSON 27:

```typescript
type CardMovement = Extract<Movement, { kind: "card" }>;
type NotAFee = Exclude<Movement, { kind: "fee" }>;
```

`Extract` names one variant without repeating its properties, and `Exclude` names "all the
others". Add a fourth variant and both follow along.

Two things to know:

- **Excluding something that isn't in the union does nothing** — no error, no change. Like
  `Omit`, the name is not checked against the union.
- **Extracting nothing leaves `never`**, a type no value belongs to, so every assignment to it
  is reported: `Type '"EUR"' is not assignable to type 'never'.` `never` gets its own lesson
  (LESSON 66); here it is just the sign of an empty result.

### Key Notes

- `Exclude<T, U>` removes union members, `Extract<T, U>` keeps them.
- On a discriminated union, `Extract<T, { kind: "card" }>` names one variant.
- `Exclude<T, { kind: "fee" }>` names "everything except that variant".
- Removing a member that isn't there is silently accepted.
- An empty result is `never`, and nothing can be assigned to it.

### Example

<!-- cell: code example -->
type L59Currency = "EUR" | "USD" | "GBP";
type L59Foreign = Exclude<L59Currency, "EUR">;

type L59Movement =
  | { kind: "card"; amount: number; merchant: string }
  | { kind: "transfer"; amount: number; counterparty: string }
  | { kind: "fee"; amount: number; reason: string };

type L59Card = Extract<L59Movement, { kind: "card" }>;
type L59NotAFee = Exclude<L59Movement, { kind: "fee" }>;

function l59NeedsConversion(currency: L59Foreign): string {
  return `${currency} needs conversion`;
}

function l59Merchant(movement: L59Card): string {
  return movement.merchant;
}

function l59Payer(movement: L59NotAFee): string {
  return movement.kind === "card" ? movement.merchant : movement.counterparty;
}

const l59Card: L59Card = { kind: "card", amount: 40.7, merchant: "Coffee Bar" };
const l59Transfer: L59NotAFee = { kind: "transfer", amount: 120.1, counterparty: "Grace" };

// prints USD needs conversion Coffee Bar Grace
console.log(`${l59NeedsConversion("USD")} ${l59Merchant(l59Card)} ${l59Payer(l59Transfer)}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Type '"EUR"' is not assignable to type 'L59Foreign'.
const l59Home: L59Foreign = "EUR";

// Compiler: Type '"fee"' is not assignable to type '"card" | "transfer"'.
const l59Fee: L59NotAFee = { kind: "fee", amount: 2, reason: "monthly" };

// Compiler: Type '"EUR"' is not assignable to type 'never'.
type L59Nothing = Extract<L59Currency, "CHF">;
const l59Empty: L59Nothing = "EUR";

// prints card — the values above exist at runtime; only the types refuse them
console.log(l59Card.kind);

<!-- cell: markdown -->
### Exercise

A statement handles three kinds of movement and three currencies. Two of the types below name
a part of those sets instead of repeating it.

1. Run `check:nb` and fix both `[to fix]` errors by correcting the values, not the types.
2. `L59Settled` is every movement except a pending one; `L59Pending` is that one variant.
3. `l59Bank(currency)` returns `"USD is converted at the daily rate"` — it accepts only the
   currencies that aren't the home currency.
4. `l59Waiting(movement)` returns `"P-9 waits for approval"` for a pending movement.
5. `l59Cleared(movements)` returns only the movements that are not pending, keeping their
   order.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L59Money = "EUR" | "USD" | "CHF";
type L59NotHome = Exclude<L59Money, "EUR">;

type L59Entry =
  | { state: "booked"; reference: string; amount: number }
  | { state: "returned"; reference: string; amount: number; reason: string }
  | { state: "pending"; reference: string; amount: number; since: string };

type L59Settled = Exclude<L59Entry, { state: "pending" }>;
type L59Pending = Extract<L59Entry, { state: "pending" }>;

const l59Wrong: L59NotHome = "EUR";

const l59Pending: L59Pending = { state: "booked", reference: "P-9", amount: 40.7 };

const l59Entries: L59Entry[] = [
  { state: "booked", reference: "P-1", amount: 40.7 },
  { state: "pending", reference: "P-9", amount: 120.1, since: "2026-01-05" },
  { state: "returned", reference: "P-2", amount: 2.15, reason: "wrong account" },
];

function l59Bank(currency: L59NotHome): string {
  // TODO: "USD is converted at the daily rate"
  return "";
}

function l59Waiting(entry: L59Pending): string {
  // TODO: "P-9 waits for approval"
  return "";
}

function l59Cleared(entries: L59Entry[]): L59Settled[] {
  // TODO: every entry that is not pending, in order
  return [];
}

console.log(l59Bank("USD"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 59 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l59Settled = l59Cleared(l59Entries);

checkAll([
  ["a foreign currency", l59Bank("USD"), "USD is converted at the daily rate"],
  ["another one", l59Bank("CHF"), "CHF is converted at the daily rate"],
  ["a pending entry", l59Waiting({ state: "pending", reference: "P-9", amount: 1, since: "2026-01-05" }), "P-9 waits for approval"],
  ["the pending entry is left out", l59Settled.length, 2],
  ["the order is kept", l59Settled.map((entry) => entry.reference), ["P-1", "P-2"]],
  ["nothing pending survives", l59Settled.map((entry) => entry.state), ["booked", "returned"]],
  ["an empty list clears to nothing", l59Cleared([]).length, 0],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `L59Settled` is written as `Exclude<L59Entry, { state: "pending" }>` rather than by listing
   the two variants. What happens to it when a fourth state is added, and is that what you
   want?
2. `Exclude<L59Money, "CHV">` — a typo — compiles. What is the resulting type, and where would
   you notice?
3. Inside `l59Cleared`, what tells the compiler that an entry which isn't pending is an
   `L59Settled`? Name the lesson that taught it.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 60 — `ReturnType` and `Parameters`

### Explanation

These two read a **function type** and hand you a piece of it. To name the type of a function
you already wrote, use `typeof` in a type position:

```typescript
function makeReceipt(reference: string, amount: number) {
  return { reference, total: amount.toFixed(2) };
}

type Receipt = ReturnType<typeof makeReceipt>; // { reference: string; total: string }
type ReceiptArgs = Parameters<typeof makeReceipt>; // [reference: string, amount: number]
```

`typeof value` in a type position means "the type of that value" — the same keyword as the
runtime `typeof` from LESSON 10, in a different place, doing a different job.

- **`ReturnType<F>`** is what `F` returns. It keeps a derived type in step with the function
  that builds it: change what `makeReceipt` returns and `Receipt` changes with it, with no
  second declaration to update.
- **`Parameters<F>`** is a **tuple** of the parameter types (LESSON 19). One parameter is
  `Parameters<typeof makeReceipt>[0]`.
- Both need a function type: `ReturnType<Currency>` gives `Type 'string' does not satisfy the
  constraint '(...args: any) => any'.` (TS2344)

**When to use them.** When a function is the source of truth and a type has to follow it.
Writing `Receipt` by hand and hoping the two stay equal is the thing these replace. When the
*type* is the source of truth, do it the other way round: declare the type and annotate the
function's return with it.

### Key Notes

- `typeof fn` in a type position names the function's type.
- `ReturnType<F>` is what `F` returns; `Parameters<F>` is a tuple of its parameters.
- `Parameters<F>[0]` is the first parameter's type.
- Both require a function type (TS2344 otherwise).
- Use them when the function is the source of truth, not the other way round.

### Example

<!-- cell: code example -->
function l60MakeReceipt(reference: string, amount: number) {
  return { reference, total: amount.toFixed(2), paid: amount > 0 };
}

type L60Receipt = ReturnType<typeof l60MakeReceipt>;
type L60ReceiptArgs = Parameters<typeof l60MakeReceipt>;
type L60Reference = Parameters<typeof l60MakeReceipt>[0];

function l60Print(receipt: L60Receipt): string {
  return `${receipt.reference}: ${receipt.total} EUR`;
}

const l60ReceiptArgs: L60ReceiptArgs = ["R-1", 40.7];
const l60Receipt: L60Receipt = l60MakeReceipt(l60ReceiptArgs[0], l60ReceiptArgs[1]);
const l60Ref: L60Reference = "R-2";

// prints R-1: 40.70 EUR true R-2
console.log(`${l60Print(l60Receipt)} ${l60Receipt.paid} ${l60Ref}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Type 'string' does not satisfy the constraint '(...args: any) => any'.
type L60NotAFunction = ReturnType<string>;

// Compiler: Type 'number' is not assignable to type 'string'.
const l60WrongReceipt: L60Receipt = { reference: "R-3", total: 10, paid: true };

// Compiler: Type 'string' is not assignable to type 'number'.
const l60WrongArgs: L60ReceiptArgs = ["R-4", "10"];

// prints R-1 — the receipt built by the function is still fine
console.log(l60Receipt.reference);

<!-- cell: markdown -->
### Exercise

A statement builder is the source of truth: whatever it returns is what the rest of the report
works with.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `l60Build(owner, amounts)` returns an object with the owner, how many amounts there were,
   their total rounded to 2 decimals, and whether the total is above `100`. Don't annotate its
   return type: the type below is derived from it.
3. `L60Statement` is the type that builder returns, and `L60BuildArgs` the tuple of its
   parameters.
4. `l60Line(statement)` returns `"Ada: 3 movements, 162.95 EUR (large)"`, or `(small)` when the
   total is `100` or less.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l60Build(owner: string, amounts: number[]) {
  // TODO: { owner, count, total (rounded), large }
  return { owner, count: 0, total: 0, large: false };
}

type L60Statement = ReturnType<typeof l60Build>;
type L60BuildArgs = Parameters<typeof l60Build>;
type L60Owner = Parameters<typeof l60Build>[0];

type L60Broken = ReturnType<L60Owner>;

const l60Args: L60BuildArgs = ["Ada", [40.7, 120.1, 2.15]];

const l60Wrong: L60Statement = { owner: "Grace", count: "2", total: 10, large: false };

function l60Line(statement: L60Statement): string {
  // TODO: "Ada: 3 movements, 162.95 EUR (large)"
  return statement.owner;
}

console.log(l60Line(l60Build(l60Args[0], l60Args[1])));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 60 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l60Big = l60Build("Ada", [40.7, 120.1, 2.15]);
const l60Small = l60Build("Grace", [10, 5.5]);
const l60None = l60Build("Hopper", []);

checkAll([
  ["how many amounts", l60Big.count, 3],
  ["the total, rounded", l60Big.total, 162.95],
  ["a large statement", l60Big.large, true],
  ["a small one", l60Small.large, false],
  ["its total", l60Small.total, 15.5],
  ["an empty statement", `${l60None.count} ${l60None.total} ${l60None.large}`, "0 0 false"],
  ["a line", l60Line(l60Big), "Ada: 3 movements, 162.95 EUR (large)"],
  ["a small line", l60Line(l60Small), "Grace: 2 movements, 15.50 EUR (small)"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `l60Build` has no return type annotation, and `L60Statement` is derived from it. What would
   you gain and what would you lose by annotating the function and writing the type by hand
   instead?
2. `Parameters<typeof l60Build>` is a tuple, not an object. What can you do with it that you
   couldn't do with two separate types?
3. A colleague writes `type Statement = ReturnType<l60Build>`, without `typeof`, and gets an
   error. What is the difference between `l60Build` and `typeof l60Build` in a type position?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 61 — Combining utility types

### Explanation

Utility types take a type and give back a type, so they nest:

```typescript
type Patch = Partial<Pick<Account, "owner" | "nickname">>;
```

Read it from the inside out: take `Account`, keep two properties, make both optional. That is
"the fields a customer may edit, any of them". Three useful combinations:

- **`Partial<Pick<T, K>>`** — a patch limited to certain fields. An update that names a field
  outside the list is reported (TS2353), which a plain `Partial<T>` would have allowed.
- **`Record<K, Omit<V, "secret">>`** — a table whose values are a trimmed view.
- **`Readonly<Record<K, V>>`** — a lookup table nobody may change after it is built.

Two habits keep this readable:

- **Name the steps.** `type Public = Omit<Account, "pin">` and then
  `Record<Tier, Public>` reads better than one nested line, and the name is what error messages
  will show.
- **Stop at two levels.** `Partial<Pick<Omit<Account, "pin">, "owner">>` is a puzzle. If you
  can't say the type out loud in one sentence, write it out by hand instead.

The point of all of these is the same as in LESSON 57: one source of truth. Change `Account`
and every derived type follows, or the compiler says which line has to decide something.

### Key Notes

- Utility types nest; read them from the inside out.
- `Partial<Pick<T, K>>` is a patch limited to certain fields.
- `Record<K, Omit<V, "x">>` is a table of trimmed views.
- Name intermediate steps, and stop nesting at two levels.
- Every derived type follows its source, which is the whole point.

### Example

<!-- cell: code example -->
type L61Tier = "basic" | "premium";

type L61Card = {
  readonly number: string;
  holder: string;
  pin: string;
  tier: L61Tier;
  nickname?: string;
};

type L61Editable = Partial<Pick<L61Card, "holder" | "nickname">>;
type L61Safe = Omit<L61Card, "pin">;
type L61Limits = Readonly<Record<L61Tier, number>>;

const l61Limits: L61Limits = { basic: 1000, premium: 5000 };

function l61Edit(card: L61Card, changes: L61Editable): L61Card {
  return {
    number: card.number,
    holder: changes.holder ?? card.holder,
    pin: card.pin,
    tier: card.tier,
    nickname: changes.nickname ?? card.nickname,
  };
}

function l61Safe(card: L61Card): L61Safe {
  return { number: card.number, holder: card.holder, tier: card.tier, nickname: card.nickname };
}

const l61Card: L61Card = { number: "4000", holder: "Ada", pin: "0000", tier: "premium" };
const l61Renamed = l61Edit(l61Card, { nickname: "Travel card" });

// prints Ada Travel card 5000
console.log(`${l61Renamed.holder} ${l61Renamed.nickname} ${l61Limits[l61Card.tier]}`);

// prints 4000 undefined
console.log(`${l61Safe(l61Card).number} ${l61Safe(l61Card).nickname}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Object literal may only specify known properties, and 'pin' does not exist in type 'Partial<Pick<L61Card, "nickname" | "holder">>'.
// (the message spells the type out instead of using the alias name, and lists the keys in its own order)
const l61BadEdit: L61Editable = { pin: "1234" };

// Compiler: Cannot assign to 'premium' because it is a read-only property.
l61Limits.premium = 9000;

// Compiler: Object literal may only specify known properties, and 'pin' does not exist in type 'L61Safe'.
const l61Leaked: L61Safe = { number: "4001", holder: "Grace", tier: "basic", pin: "1111" };

// prints 9000 — readonly is checked, not enforced: the assignment above really ran
console.log(l61Limits.premium);

<!-- cell: markdown -->
### Exercise

Accounts again, with three derived types: what a customer may edit, what may be shown, and a
table of counts that must not change once it is built.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `L61Patch` is "any of the owner and the nickname, and nothing else".
3. `L61Public` is the account without the PIN.
4. `L61Counts` is a table with one number per tier that nobody can change afterwards.
5. `l61Apply(account, patch)` returns a new account with the patch applied;
   `l61Show(account)` returns the public view; `l61Count(accounts)` counts the accounts per
   tier; `l61CountLine(counts)` returns `"basic 2 | premium 1"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L61Level = "basic" | "premium";

type L61Account = {
  readonly iban: string;
  owner: string;
  balance: number;
  pin: string;
  level: L61Level;
  nickname?: string;
};

type L61Patch = Partial<Pick<L61Account, "owner" | "nickname">>;
type L61Public = Omit<L61Account, "pin">;
type L61Counts = Readonly<Record<L61Level, number>>;

const l61Accounts: L61Account[] = [
  { iban: "IT60", owner: "Ada", balance: 250, pin: "0000", level: "basic" },
  { iban: "IT61", owner: "Grace", balance: 1200, pin: "1111", level: "premium", nickname: "Salary" },
  { iban: "IT62", owner: "Hopper", balance: 10, pin: "2222", level: "basic" },
];

const l61Patch: L61Patch = { balance: 999 };

function l61Apply(account: L61Account, patch: L61Patch): L61Account {
  // TODO: a new account with the patch applied, everything else unchanged
  return account;
}

function l61Show(account: L61Account): L61Public {
  // TODO: the account without the PIN
  return { iban: account.iban, owner: account.owner, balance: account.balance, level: account.level, nickname: account.nickname };
}

function l61Count(accounts: L61Account[]): L61Counts {
  // TODO: how many accounts per level
  return { basic: 0, premium: 0 };
}

function l61CountLine(counts: L61Counts): string {
  // TODO: "basic 2 | premium 1"
  return "";
}

const l61Totals: L61Counts = { basic: 0, premium: 0 };
l61Totals.basic = 1;

console.log(l61CountLine(l61Count(l61Accounts)));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 61 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l61Edited = l61Apply(l61Accounts[0], { owner: "Ada Lovelace", nickname: "Rainy day" });
const l61Shown = l61Show(l61Accounts[1]);
const l61Numbers = l61Count(l61Accounts);

checkAll([
  ["the patched owner", l61Edited.owner, "Ada Lovelace"],
  ["the patched nickname", l61Edited.nickname, "Rainy day"],
  ["the untouched balance", l61Edited.balance, 250],
  ["the original account is unchanged", l61Accounts[0].owner, "Ada"],
  ["the public view has no PIN", Object.keys(l61Shown).sort(), ["balance", "iban", "level", "nickname", "owner"]],
  ["basic accounts", l61Numbers.basic, 2],
  ["premium accounts", l61Numbers.premium, 1],
  ["the count line", l61CountLine(l61Numbers), "basic 2 | premium 1"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `L61Patch` is `Partial<Pick<L61Account, "owner" | "nickname">>`. What would a plain
   `Partial<L61Account>` have allowed a customer to send?
2. The bank adds a `closedOn` field to `L61Account`. Which of the three derived types change,
   and which line of the exercise does the compiler report first?
3. Rewrite `Readonly<Record<L61Level, number>>` as two named steps. Which version would you
   keep, and why?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
