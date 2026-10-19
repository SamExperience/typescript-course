<!-- cell: markdown -->
# TypeScript — Utility types

> **Solutions.** Open this only after you've genuinely tried the exercises in
> `lesson.ipynb`. Run the helper cell first, then a solution cell and its Verification cell.

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

### Exercise

<!-- cell: code solution -->
type L56Customer = {
  id: string;
  name: string;
  email?: string;
  active: boolean;
};

const l56Customer: L56Customer = { id: "C-1", name: "Ada", active: true };

const l56Partial: Partial<L56Customer> = { id: "C-2", name: "Grace" };

function l56Update(customer: L56Customer, changes: Partial<L56Customer>): L56Customer {
  return {
    id: changes.id ?? customer.id,
    name: changes.name ?? customer.name,
    email: changes.email ?? customer.email,
    active: changes.active ?? customer.active,
  };
}

function l56Card(customer: Readonly<L56Customer>): string {
  return `${customer.id} ${customer.name} (${customer.email ?? "no email"})`;
}

function l56Fill(customer: L56Customer): Required<L56Customer> {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email ?? "none@example.com",
    active: customer.active,
  };
}

console.log(l56Card(l56Update(l56Customer, { name: "Ada Lovelace" })));
// prints C-1 Ada Lovelace (no email)

<!-- cell: markdown -->
The first `[to fix]` error was `Required<L56Customer>` on a value with two fields:
`Required` removes the `?`, so `email` became compulsory and `active` was missing as well.
That object was only ever meant to be "some fields", which is `Partial`.

The second was `name: changes.name` inside `l56Update`. A `Partial` property is
`string | undefined`, and the result promises a `string` — `?? customer.name` is what turns
"maybe changed" into "the new value or the old one".

`l56Update` builds a new object rather than assigning into `customer`, which is why the
original is still `"Ada"` after the update. `Readonly` on `l56Card` says the same thing in the
type: this function only reads.

**Common mistakes**

- **`changes.email || customer.email`.** An empty email `""` would be replaced by the old one;
  `??` only steps in for `null` and `undefined` (LESSON 17).
- **Assigning into the customer** (`customer.name = changes.name ?? customer.name`) and
  returning it. Every holder of that object sees the change, and the "original is unchanged"
  check fails.
- **Marking `l56Update`'s first parameter `Readonly`** and then returning it unchanged. Not
  wrong, but the point of the function is to produce a new customer.
- **Filling the email with `""`.** `Required` asks for a string, and `""` is one — but the
  exercise asks for a real placeholder, and an empty string is the kind of value that hides
  later.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Callers would have to pass a complete customer every time, repeating every field they
//    are not changing — and repeating them is exactly how a stale value gets copied back over
//    a fresh one. When a new field is added to L56Customer, every one of those call sites is
//    reported and has to be edited. With Partial, they aren't: a caller that changes the name
//    still only mentions the name.
//
// 2. It protects the code, not the object. The compiler refuses the assignment, so no line
//    you write can change the value — but nothing is frozen at runtime, and code that skips
//    type checking (or a value that arrived from elsewhere) can still change it. Readonly is a
//    promise between parts of your program, not a lock.
//
// 3. Only for a later step. The bank's stored customers genuinely may have no email, and
//    saying so with `email?` is honest. Required<L56Customer> belongs where the program has
//    already filled the gaps — after l56Fill, for example — so that the code downstream never
//    has to ask whether the email is there.

<!-- cell: markdown -->
## LESSON 57 — `Pick` and `Omit`

### Exercise

<!-- cell: code solution -->
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

type L57CustomerView = Omit<L57Loan, "riskNote" | "officer">;

type L57ReportRow = Pick<L57Loan, "reference" | "borrower" | "outstanding">;

function l57ForCustomer(loan: L57Loan): L57CustomerView {
  return {
    reference: loan.reference,
    borrower: loan.borrower,
    outstanding: loan.outstanding,
    ratePercent: loan.ratePercent,
  };
}

function l57Row(loan: L57Loan): L57ReportRow {
  return { reference: loan.reference, borrower: loan.borrower, outstanding: loan.outstanding };
}

function l57RowLine(row: L57ReportRow): string {
  return `${row.reference} ${row.borrower}: ${row.outstanding.toFixed(2)} EUR`;
}

console.log(l57RowLine(l57Row(l57Loan))); // prints LN-1 Ada: 6500.00 EUR

<!-- cell: markdown -->
`Omit<L57Loan, "riskNote">` still contained the officer, so the object returned by
`l57ForCustomer` was missing a required property. The fix belongs in the type —
`"riskNote" | "officer"` — because the customer view is defined by what it removes. The second
error was `l57RowLine` returning a number where it promised a string.

Both views are built from `L57Loan`, so the day `outstanding` changes type, all three functions
are checked against that change without anyone editing the views.

**Common mistakes**

- **Writing the views out by hand** (`type L57ReportRow = { reference: string; borrower:
  string; outstanding: number }`). It works today and silently drifts from the loan tomorrow.
- **Using `Pick` for the customer view.** It would need updating every time a harmless field is
  added, and a forgotten one simply disappears from what the customer sees.
- **Leaving the field out of the returned object instead of out of the type.** The object then
  doesn't match the type it promises, which is exactly what was reported.
- **Trusting `Omit` with a misspelled key.** Nothing is reported and nothing is removed.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. L57CustomerView gains the currency automatically, and l57ForCustomer is reported until it
//    supplies it — which is what you want: a new field reaches the customer unless someone
//    decides otherwise. L57ReportRow doesn't change at all, because it names its three fields —
//    which is also what you want: a report row shouldn't grow by itself.
//
// 2. It contains every property of L57Loan, risk note included, under a name that claims
//    otherwise. You would notice it the way the exercise did: the data you return, or print,
//    still has the field the view was supposed to remove. Omit accepts any string, so that
//    name is checked by you and by nobody else.
//
// 3. Either compiles: the three fields the row needs are in both types. Taking the L57Loan is
//    the simpler call, since that is what the caller holds. What matters is not taking
//    something larger than the function reads — a row builder has no business seeing the risk
//    note — so if the row ever needs to be built far from the bank's own code, the smaller
//    type is the safer parameter.

<!-- cell: markdown -->
## LESSON 58 — `Record`

### Exercise

<!-- cell: code solution -->
type L58Currency = "EUR" | "USD" | "GBP";
type L58Movement = { reference: string; amount: number; currency: L58Currency };

const l58Rates: Record<L58Currency, number> = { EUR: 1, USD: 1.1, GBP: 0.85 };

const l58Names: Record<L58Currency, string> = { EUR: "EUR", USD: "USD", GBP: "GBP" };

const l58Movements: L58Movement[] = [
  { reference: "M-1", amount: 40.7, currency: "EUR" },
  { reference: "M-2", amount: 120.1, currency: "EUR" },
  { reference: "M-3", amount: 2.15, currency: "USD" },
];

const l58Order: L58Currency[] = ["EUR", "USD", "GBP"];

function l58Totals(movements: L58Movement[]): Record<L58Currency, number> {
  const totals: Record<L58Currency, number> = { EUR: 0, USD: 0, GBP: 0 };
  for (const movement of movements) {
    totals[movement.currency] = Math.round((totals[movement.currency] + movement.amount) * 100) / 100;
  }
  return totals;
}

function l58In(amount: number, from: L58Currency, to: L58Currency): number {
  return Math.round((amount / l58Rates[from]) * l58Rates[to] * 100) / 100;
}

function l58GrandTotal(movements: L58Movement[], target: L58Currency): number {
  const totals = l58Totals(movements);
  const sum = l58Order.reduce((running, currency) => running + l58In(totals[currency], currency, target), 0);
  return Math.round(sum * 100) / 100;
}

function l58Report(movements: L58Movement[]): string {
  const totals = l58Totals(movements);
  return l58Order.map((currency) => `${l58Names[currency]} ${totals[currency].toFixed(2)}`).join(" | ");
}

console.log(l58Report(l58Movements)); // prints EUR 160.80 | USD 2.15 | GBP 0.00

<!-- cell: markdown -->
Both `[to fix]` errors were the tables telling the truth about themselves: `l58Rates` had no
rate for `GBP` (TS2741), and `l58Names` had an entry for a currency that doesn't exist
(TS2353). Neither would have been reported if the tables had been typed
`Record<string, number>`.

`l58Order` exists because a list of currencies in a fixed order is not the same thing as the
table: the table says what is known, the list says what to print and in which order.

**Common mistakes**

- **Starting `l58Totals` from `{}`.** It doesn't satisfy `Record<L58Currency, number>`, and
  with a looser type a currency with no movements would be missing instead of `0`.
- **Adding to a total without rounding.** Every addition is a new floating-point result, and
  the report ends up printing something like `160.79999999999998`.
- **Converting the movements one by one in `l58GrandTotal`** instead of the currency totals.
  Both can be defended, but they round differently, and the checks convert the totals.
- **Writing the report with `Object.keys(totals)`.** Those keys come back as `string[]`, and
  indexing the record with a plain string is reported.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Every table typed by the currency union is reported: l58Rates, l58Names and the
//    starting object inside l58Totals. That is a good day: the compiler is listing exactly the
//    places that need a decision. Without the key union they would all still compile, and
//    francs would convert at a rate of undefined.
//
// 2. It would stop reporting the missing GBP rate, the CHF typo, and any other absent
//    currency. At runtime l58In(100, "CHF", "EUR") would read undefined as a rate, compute
//    100 / undefined * 1, and produce NaN — which then spreads silently through every total
//    that touches it.
//
// 3. An empty start doesn't satisfy Record<L58Currency, number>, so it wouldn't compile
//    without loosening the type. Once loosened, a currency with no movements would be missing
//    from the result instead of being 0, and the report would have to handle a gap that the
//    zeroed start makes impossible.

<!-- cell: markdown -->
## LESSON 59 — `Exclude` and `Extract`

### Exercise

<!-- cell: code solution -->
type L59Money = "EUR" | "USD" | "CHF";
type L59NotHome = Exclude<L59Money, "EUR">;

type L59Entry =
  | { state: "booked"; reference: string; amount: number }
  | { state: "returned"; reference: string; amount: number; reason: string }
  | { state: "pending"; reference: string; amount: number; since: string };

type L59Settled = Exclude<L59Entry, { state: "pending" }>;
type L59Pending = Extract<L59Entry, { state: "pending" }>;

const l59Wrong: L59NotHome = "USD";

const l59Pending: L59Pending = { state: "pending", reference: "P-9", amount: 40.7, since: "2026-01-05" };

const l59Entries: L59Entry[] = [
  { state: "booked", reference: "P-1", amount: 40.7 },
  { state: "pending", reference: "P-9", amount: 120.1, since: "2026-01-05" },
  { state: "returned", reference: "P-2", amount: 2.15, reason: "wrong account" },
];

function l59Bank(currency: L59NotHome): string {
  return `${currency} is converted at the daily rate`;
}

function l59Waiting(entry: L59Pending): string {
  return `${entry.reference} waits for approval`;
}

function l59Cleared(entries: L59Entry[]): L59Settled[] {
  const settled: L59Settled[] = [];
  for (const entry of entries) {
    if (entry.state !== "pending") {
      settled.push(entry);
    }
  }
  return settled;
}

console.log(`${l59Bank("USD")} / ${l59Waiting(l59Pending)}`);
// prints USD is converted at the daily rate / P-9 waits for approval

<!-- cell: markdown -->
Both `[to fix]` errors were values that didn't belong to the smaller type: `"EUR"` is exactly
what `L59NotHome` removes, and a `booked` entry is not what `Extract` kept. Neither type had to
change — the values did.

Inside `l59Cleared`, `entry.state !== "pending"` narrows the union to the two remaining
variants, which is precisely what `L59Settled` names (LESSON 26 and 27). The `push` is accepted
because the narrowed type and the `Exclude` type are the same set.

**Common mistakes**

- **Listing the variants by hand** (`type L59Settled = { state: "booked"; ... } | { state:
  "returned"; ... }`). Two places to update, and the day they disagree the compiler believes
  the copy.
- **Assuming `entries.filter((entry) => entry.state !== "pending")` can't produce an
  `L59Settled[]`.** It can: TypeScript 6.0.3 works out a narrowing rule for a short callback
  like this one, so the filtered array really does have the narrower type. The loop above is
  the version that keeps working when the callback grows a second statement or an annotated
  `: boolean` return type — LESSON 65 is about saying the narrowing out loud.
- **`Exclude<L59Entry, "pending">`.** The members of the union are object types, not strings,
  so nothing matches and nothing is removed.
- **Forgetting that the result of an empty `Extract` is `never`.** If `l59Waiting` suddenly
  takes a type nothing can satisfy, look at what was extracted.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. A fourth state joins L59Settled automatically, because Exclude says "everything except
//    pending". That is usually what you want for "the ones we can report on" — but it is worth
//    being deliberate: if the new state also needs holding back, the type won't tell you, and
//    only l59Cleared's condition decides. The compiler keeps the two in step only if the
//    condition and the Exclude mention the same states.
//
// 2. Nothing is removed, so L59NotHome would be "EUR" | "USD" | "CHF" — the whole union. You
//    would notice when l59Bank("EUR") compiles happily and the home currency gets converted at
//    the daily rate. Like Omit, Exclude accepts a member that isn't there.
//
// 3. Narrowing: `entry.state !== "pending"` removes the pending variant inside the if, which
//    is the discriminated-union narrowing of LESSON 27 (and the basic narrowing of LESSON 26).
//    The narrowed type and Exclude<L59Entry, { state: "pending" }> describe the same two
//    variants, so the push is accepted.

<!-- cell: markdown -->
## LESSON 60 — `ReturnType` and `Parameters`

### Exercise

<!-- cell: code solution -->
function l60Build(owner: string, amounts: number[]) {
  const total = Math.round(amounts.reduce((sum, amount) => sum + amount, 0) * 100) / 100;
  return { owner, count: amounts.length, total, large: total > 100 };
}

type L60Statement = ReturnType<typeof l60Build>;
type L60BuildArgs = Parameters<typeof l60Build>;
type L60Owner = Parameters<typeof l60Build>[0];

type L60Fine = ReturnType<typeof l60Build>;

const l60Args: L60BuildArgs = ["Ada", [40.7, 120.1, 2.15]];

const l60Wrong: L60Statement = { owner: "Grace", count: 2, total: 10, large: false };

function l60Line(statement: L60Statement): string {
  const size = statement.large ? "large" : "small";
  return `${statement.owner}: ${statement.count} movements, ${statement.total.toFixed(2)} EUR (${size})`;
}

console.log(l60Line(l60Build(l60Args[0], l60Args[1])));
// prints Ada: 3 movements, 162.95 EUR (large)

<!-- cell: markdown -->
`ReturnType<L60Owner>` asked for the return type of a `string` (TS2344): `L60Owner` is the
type of a parameter, not a function. `ReturnType` only accepts something callable, which is
what `typeof l60Build` is.

The second error was `count: "2"` in a value typed `L60Statement` — and notice where that type
came from. Nobody wrote it. It is whatever `l60Build` returns, so the object had to match the
builder, not a hand-written declaration that might have drifted.

**Common mistakes**

- **Annotating `l60Build`'s return type as well.** Not wrong, but then the annotation is the
  source of truth and `ReturnType` only repeats it. Pick one direction.
- **`ReturnType<l60Build>` without `typeof`.** `'l60Build' refers to a value, but is being used
  as a type here. Did you mean 'typeof l60Build'?` (TS2749)
- **Rounding the total inside `l60Line` only.** `40.7 + 120.1 + 2.15` is `162.95000000000002`,
  so the stored total has to be the rounded one.
- **`large: total >= 100`.** The rule is "above 100", and a statement of exactly `100` is small.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. You would gain a named contract that reads well at a glance and gives clearer errors
//    inside the builder, reported at the wrong `return` instead of at a caller (LESSON 28).
//    You would lose the guarantee that the two agree: the day someone adds a field to the
//    returned object and forgets the type, nothing is reported. Derive the type when the
//    function is the source of truth; annotate when the type is.
//
// 2. It can be stored, passed around and spread into the call as one value: a tuple keeps the
//    order and the types together, so ["Ada", [40.7]] is checked against both parameters at
//    once. Two separate types would let a caller pair the wrong owner with the wrong amounts
//    and nothing would notice, because nothing would tie them together.
//
// 3. l60Build is a value — a function that exists at runtime. In a type position TypeScript
//    expects a type, so it reports
//      'l60Build' refers to a value, but is being used as a type here. Did you mean
//      'typeof l60Build'? (TS2749)
//    `typeof l60Build` is the bridge: it takes the value and gives back its type.

<!-- cell: markdown -->
## LESSON 61 — Combining utility types

### Exercise

<!-- cell: code solution -->
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

const l61Patch: L61Patch = { owner: "Ada Lovelace" };

function l61Apply(account: L61Account, patch: L61Patch): L61Account {
  return {
    iban: account.iban,
    owner: patch.owner ?? account.owner,
    balance: account.balance,
    pin: account.pin,
    level: account.level,
    nickname: patch.nickname ?? account.nickname,
  };
}

function l61Show(account: L61Account): L61Public {
  return {
    iban: account.iban,
    owner: account.owner,
    balance: account.balance,
    level: account.level,
    nickname: account.nickname,
  };
}

function l61Count(accounts: L61Account[]): L61Counts {
  let basic = 0;
  let premium = 0;
  for (const account of accounts) {
    if (account.level === "basic") {
      basic = basic + 1;
    } else {
      premium = premium + 1;
    }
  }
  return { basic, premium };
}

function l61CountLine(counts: L61Counts): string {
  return `basic ${counts.basic} | premium ${counts.premium}`;
}

const l61Totals: L61Counts = { basic: 0, premium: 0 };

console.log(l61CountLine(l61Count(l61Accounts))); // prints basic 2 | premium 1

<!-- cell: markdown -->
The patch type did its job twice. `{ balance: 999 }` was reported because `Pick` had already
limited the patch to two fields — a plain `Partial<L61Account>` would have accepted it and
quietly let a customer set their own balance. And `l61Totals.basic = 1` was reported because
`Readonly` wraps the whole table: the counts are built once and then only read.

`l61Count` adds up in two local variables and returns the table at the end. A `Readonly` result
can't be filled in field by field after it exists, which is exactly the point.

**Common mistakes**

- **Building the counts by assigning into a `L61Counts` value.** Every assignment is reported;
  the table is meant to be created complete.
- **`Partial<L61Account>` for the patch.** It compiles, and the PIN, the IBAN and the balance
  become editable by whoever sends the patch.
- **Returning `account` itself from `l61Apply` after assigning to it.** The original changes
  too, and the "original account is unchanged" check fails.
- **Leaving `nickname` out of the public view.** `Omit` only removes the PIN; every other
  property, optional ones included, is still part of the type.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Everything: the balance, the PIN, the level, even the IBAN — Partial<L61Account> is
//    "any subset of the account", and an update endpoint that accepts it accepts a customer
//    setting their own balance. Pick decides which fields are editable; Partial decides that
//    each of them is optional. Both halves matter.
//
// 2. L61Public gains closedOn, because Omit removes only the PIN — so l61Show is reported
//    until it supplies the new field. L61Patch doesn't change: it names its two fields.
//    L61Counts doesn't change either: it is built from the level union, not from the account.
//    The first line reported is the return of l61Show.
//
// 3. type L61CountTable = Record<L61Level, number>;
//    type L61Counts = Readonly<L61CountTable>;
//    Two steps are worth it when a name is worth having — here "the count table" is a real
//    thing the program talks about. For a single use, the one-liner is fine: the rule is two
//    levels of nesting, and a name as soon as you would have to read it twice.

<!-- cell: markdown -->
That is topic 15. You can reshape an existing type instead of retyping it: optional, required
or readonly properties, a shorter or trimmed view, a table keyed by a union, a slice of a
union, and the types a function already decides. Topic 16 goes back to values: how TypeScript
narrows a type from the checks you write.
