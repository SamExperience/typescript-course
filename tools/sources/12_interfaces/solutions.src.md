<!-- cell: markdown -->
# TypeScript — Interfaces

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
## LESSON 46 — Interface syntax, optional and readonly properties

### Exercise

<!-- cell: code solution -->
interface L46Account {
  readonly iban: string;
  owner: string;
  balance: number;
  nickname?: string;
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
  return account.nickname ?? account.owner;
}

function l46Describe(account: L46Account): string {
  return `${account.iban} (${l46Label(account)}): ${account.balance.toFixed(2)} EUR`;
}

function l46Rebrand(account: L46Account, nickname: string): void {
  account.nickname = nickname;
}

console.log(l46Describe(l46Savings)); // prints IT60 (Rainy day fund): 250.00 EUR

<!-- cell: markdown -->
Each `[to fix]` error named the property whose promise was wrong. `nickname` was declared as
something every account has, so an account without one was reported
(`Property 'nickname' is missing in type '{ iban: string; owner: string; balance: number;
openedOn: string; }' but required in type 'L46Account'.`, TS2741); `?` says what the bank
actually means. And `l46Rebrand` assigned the new name to `iban`, which the interface had
already marked `readonly` (TS2540) — the mistake was in the function, not in the interface.

`l46Describe` calls `l46Label` instead of repeating the `??`, so "which name do we show" is
decided in one place.

**Common mistakes**

- **Deleting `readonly` from `iban` to make TS2540 go away.** The error was right: an account
  number doesn't change, and the function was writing to the wrong property.
- **Making every property optional.** Then `owner` and `balance` may be missing too, and every
  line that reads them needs a check. Optional means "genuinely may be absent".
- **`account.nickname || account.owner`.** It works here, but it also replaces an empty
  nickname `""` with the owner. `??` only steps in for `null` and `undefined` (LESSON 17).
- **Adding a `label` property to the interface** and keeping it up to date by hand. The label
  is worked out from data the account already has, so it belongs in a function.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Only the last line is reported:
//      Object literal may only specify known properties, and 'currency' does not exist in
//      type 'Payment'. (TS2353)
//    The excess property check applies to object literals written directly in the
//    annotated position. `raw` is a variable whose type was inferred first, and a type with
//    more properties than required still satisfies Payment, so `first` passes. The check is
//    there to catch typos and leftovers in literals, not to forbid extra data in general.
//
// 2. Something has to rule out undefined first: an if (first.note !== undefined) around the
//    call, or (first.note ?? "").trim(). Without it:
//      'first.note' is possibly 'undefined'. (TS18048)
//
// 3. Add `readonly madeOn: string;`. Both objects are then reported, because neither has the
//    property (TS2353 for the literal, TS2741 for the assignment from `raw`). That is the
//    point: a required property added to an interface shows every place that has to supply
//    it. If old payments genuinely have no date, `madeOn?: string` is the honest shape, and
//    every reader then has to handle the missing case.

<!-- cell: markdown -->
## LESSON 47 — Method definitions

### Exercise

<!-- cell: code solution -->
interface L47FeeRule {
  readonly name: string;
  feeFor(amount: number): number;
  describe(): string;
}

const l47Flat: L47FeeRule = {
  name: "Flat",
  feeFor(amount) {
    return amount > 0 ? 0.5 : 0;
  },
  describe() {
    return "0.50 EUR per transfer";
  },
};

const l47Percent: L47FeeRule = {
  name: "Percent",
  feeFor(amount) {
    if (amount <= 0) {
      return 0;
    }
    return Math.max(0.5, Math.round(amount * 0.015 * 100) / 100);
  },
  describe() {
    return "1.5% (min 0.50 EUR)";
  },
};

function l47TotalFees(amounts: number[], rule: L47FeeRule): number {
  const total = amounts.reduce((sum, amount) => sum + rule.feeFor(amount), 0);
  return Math.round(total * 100) / 100;
}

function l47FeeLine(rule: L47FeeRule): string {
  return `${rule.name}: ${rule.describe()}`;
}

console.log(l47FeeLine(l47Flat)); // prints Flat: 0.50 EUR per transfer

<!-- cell: markdown -->
`describe(): number` broke the promise the interface makes about that method, so the whole
object literal was reported with the mismatched part underneath (TS2322). And `rule.feeFor()`
asked for a fee without saying what for (TS2554) — the amount is exactly what the rule needs.

Neither `feeFor` needs a parameter type: the interface already says `amount` is a number, and
a matching literal picks that up.

`l47TotalFees` and `l47FeeLine` never mention `l47Flat` or `l47Percent`. They work with
anything that satisfies `L47FeeRule`, which is why a third rule needs no change to either of
them.

**Common mistakes**

- **Rounding only the total.** `120 * 1.5%` is `1.7999999999999998`; the total comes out right
  because it is rounded at the end, but `feeFor(120)` still returns the long number, and any
  receipt printing a single fee shows it.
- **Applying the minimum before checking for 0.** `Math.max(0.5, 0)` is `0.5`, so an amount of
  `0` gets charged half a euro.
- **Writing `if (rule.name === "Percent")` inside `l47TotalFees`.** The rule already knows its
  own fee; asking it is the whole point of the interface.
- **Putting the description text in `l47FeeLine`.** Then a new rule means editing a function
  that was supposed to work for every rule.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Compare it with undefined before calling it —
//      if (watcher.onFailed !== undefined) { watcher.onFailed(reason); }
//    which is what l47Report does, in the conditional expression — or use optional chaining,
//    watcher.onFailed?.(reason), which calls it only when it is there. Both satisfy the
//    compiler because both rule out undefined before the call.
//
// 2. The arrow form reads as "this property holds a function", which is what a rule a
//    customer can change really is: the object keeps the same shape while the function inside
//    it is replaced. The shorthand reads as "this object does this", which fits behavior that
//    is fixed when the object is written. The compiler accepts the same values either way, so
//    the choice is about what the reader should expect.
//
// 3. Nothing inside the account changes: it still calls feeFor and describe. What changes is
//    who can supply the rule. With a class, every rule has to be an L45FeePolicy or a
//    subclass of it. With an interface, any object of the right shape fits — a literal
//    written in a test, an object built from a configuration file, or an instance of a class
//    that was never told the interface exists.

<!-- cell: markdown -->
## LESSON 48 — Extending interfaces

### Exercise

<!-- cell: code solution -->
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
  madeOn: "2026-01-06",
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
  return `${movement.id}: ${movement.amount.toFixed(2)} EUR on ${movement.madeOn}`;
}

function l48Detail(movement: L48Statement): string {
  const line = l48Line(movement);
  if (movement.kind === "card") {
    return `${line} at ${movement.merchant}`;
  }
  if (movement.kind === "transfer") {
    return `${line} to ${movement.counterparty}`;
  }
  return `${line} (${movement.reason})`;
}

function l48Total(movements: L48Movement[]): number {
  const total = movements.reduce((sum, movement) => sum + movement.amount, 0);
  return Math.round(total * 100) / 100;
}

console.log(l48Detail(l48Card)); // prints M-1: 40.70 EUR on 2026-01-05 at Coffee Bar

<!-- cell: markdown -->
The first `[to fix]` error listed exactly what `l48Transfer` was missing: `madeOn` is declared
once, in `L48Movement`, and every kind of movement inherits it (TS2741). The second was the
rule this lesson is about — `l48Line` takes an `L48Movement`, and a merchant is not part of
that promise (TS2339). `l48Detail` is where a merchant exists, because there the `kind` has
been checked.

Two functions, two levels: `l48Line` and `l48Total` work on what every movement has, so they
keep working when a fourth kind appears. `l48Detail` is the only place that knows the kinds
apart.

**Common mistakes**

- **Adding `merchant?: string` to `L48Movement`** to make TS2339 go away. Every transfer and
  fee then carries a property that means nothing to them, and every reader has to handle
  `undefined`.
- **Copying `id`, `amount` and `madeOn` into all three interfaces** instead of extending. It
  compiles, and the next shared property has to be added three times.
- **Comparing `movement.kind` to a misspelled value** such as `"transfers"`. With literal
  types the compiler reports the comparison itself (TS2367, LESSON 23).
- **Building the detail line from scratch in each branch.** `l48Line` already produces the
  shared part; the branch only adds its own tail.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Every kind of movement extends L48Movement, so each one is an L48Movement and an
//    L48Statement[] is a list of them. What l48Total cannot do is read merchant, counterparty
//    or reason: through the parameter type only id, amount and madeOn are promised, and
//    reaching for anything else is reported (TS2339). That limit is what makes it safe for
//    kinds that don't exist yet.
//
// 2. A separate interface, for example `interface Refundable { refundedOn?: string }`, and
//    each kind extends both: `interface L48CardMovement extends L48Movement, Refundable`.
//    Putting it in L48Movement says every movement can be refunded, which may not be true of
//    a fee; repeating it three times means three places to change. An interface may extend
//    several interfaces, so the shared flag stays written once.
//
// 3. `amount: 2 | 5 | 10` is accepted: each of those values is a number, so the extension
//    narrows the inherited property instead of contradicting it. `amount: string` is reported
//    (TS2430). What the narrowed version buys you is that a fee of 3 is reported where it is
//    written, and a `switch` over the three values is complete by construction.

<!-- cell: markdown -->
## LESSON 49 — Implementing interfaces

### Exercise

<!-- cell: code solution -->
interface L49Billable {
  readonly reference: string;
  total(): number;
  describe(): string;
}

interface L49Cancelable {
  readonly canceled: boolean;
  cancel(): void;
}

class L49StandingOrder implements L49Billable, L49Cancelable {
  private stopped: boolean = false;

  constructor(
    public readonly reference: string,
    private monthlyAmount: number,
    private months: number,
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
    return Math.round(this.monthlyAmount * this.months * 100) / 100;
  }

  public describe(): string {
    if (this.stopped) {
      return `${this.reference}: canceled`;
    }
    return `${this.reference}: ${this.months} x ${this.monthlyAmount.toFixed(2)} EUR = ${this.total().toFixed(2)} EUR`;
  }
}

const l49Mine = new L49StandingOrder("SO-1", 8.9, 12);
console.log(l49Mine.describe()); // prints SO-1: 12 x 8.90 EUR = 106.80 EUR

<!-- cell: markdown -->
`total(): string` broke the promise `L49Billable` makes, and the compiler said so on the
member itself (TS2416) — the same message an incompatible override gets, because it is the
same question: does this member still fit what it claims to be? The second error was on the
last line: the constructor takes three arguments, and a standing order with no length is not a
standing order (TS2554).

`canceled` is a getter over a private flag, which is exactly what `readonly canceled: boolean`
asks for: readable outside, writable only by `cancel()`.

**Common mistakes**

- **Deleting `implements L49Billable` to silence TS2416.** The class then satisfies nothing in
  particular, and the wrong return type only surfaces the day someone passes the order to a
  function that bills it.
- **Making `stopped` public instead of writing the getter.** Anyone can then un-cancel an
  order by assigning `false`.
- **Rounding inside `describe()` only.** `8.9 * 12` is `106.80000000000001`, so `total()` has
  to round; `toFixed(2)` in the text would hide it.
- **Returning the full amount after cancellation.** A canceled order owes nothing, and
  `describe()` should say `canceled` rather than print a total nobody will pay.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Nothing at all today: the class has every member, so it still fits L49Billable wherever
//    one is expected. What you lose is the check. Delete a method tomorrow, or change a
//    return type, and nothing is reported on the class; the error appears wherever someone
//    passes the order to code that expects a billable thing, which may be another file
//    entirely. `implements` is a promise written down where it can be checked.
//
// 2. As an L49Billable: yes. The interface asks for a reference, a total() and a describe(),
//    and a literal can supply all three.
//    As an L49StandingOrder: no. The class type also includes stopped, monthlyAmount and
//    months, which are private — the literal is reported as missing them, and they cannot be
//    supplied from outside at all. Only the class can make one of its own instances.
//
// 3. The getter works the answer out on each read, so it can never disagree with the flag it
//    reports: `cancel()` sets one private value and every reader sees it. A public property
//    would be a second copy that someone has to remember to update — and that anyone could
//    assign to, since a plain property is writable from outside unless it is readonly.

<!-- cell: markdown -->
## LESSON 50 — Interface or type alias?

### Exercise

<!-- cell: code solution -->
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
    { amount: 120.5, currency: "USD" },
  ],
};

function l50Format(money: L50Money): string {
  return `${money.amount.toFixed(2)} ${money.currency}`;
}

function l50TotalIn(wallet: L50Wallet, target: L50Currency, rate: L50Rate): number {
  const total = wallet.holdings.reduce(
    (sum, holding) => sum + holding.amount * rate(holding.currency, target),
    0,
  );
  return Math.round(total * 100) / 100;
}

function l50Describe(wallet: L50Wallet): string {
  return `${wallet.owner}: ${wallet.holdings.length} holdings`;
}

console.log(l50Format(l50Wallet.holdings[0])); // prints 249.95 EUR

<!-- cell: markdown -->
Both `[to fix]` errors came from a named type doing its job. `"GBP"` is not one of the two
values `L50Currency` allows, so it was reported inside the literal that wrote it
(`Type '"GBP"' is not assignable to type 'L50Currency'.`); and `l50Describe` promised a string
while returning the holdings array (`Type 'L50Money[]' is not assignable to type 'string'.`).

Notice which form each declaration uses. `L50Currency` and `L50Rate` have to be aliases: a
union and a function type are not object shapes. `L50Money` and `L50Wallet` could be either,
and are interfaces because they describe things the rest of the application passes around.

**Common mistakes**

- **Adding `"GBP"` to `L50Currency` to clear the error.** Then `l50Rate` has to answer for a
  currency it has no rate for, and every `switch` on a currency gets a case nobody wrote.
- **Converting with `amount * rate(target, holding.currency)`.** The arguments are `from` then
  `to`; swapping them multiplies by the opposite rate, and the euro total comes out as
  `385.5` instead of `359.61`.
- **Rounding each converted holding.** The exercise asks for the total rounded, and rounding
  twice can move the last cent.
- **Writing `L50Rate` as an interface with a call signature.** It works, but a function type is
  what an alias is for, and every reader recognizes `(from, to) => number` at a glance.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Customer shape implemented by three classes: interface — it is a contract, and
//      `implements Customer` says so on every class.
//    Allowed transaction statuses: type — a union has no interface form.
//    A callback that formats money: type — a function type, same reason.
//    A pair of coordinates: type — a tuple, same reason.
//    A small shape used by one function in one file: either; type is the shorter habit for
//      something local, and nothing depends on it.
//
// 2. Useful: adding a property to a type that comes from a library, or from generated code,
//    without touching the file it lives in.
//    Expensive: two people declare `interface Options` in the same project for two different
//    things. Nothing is reported. The two just merge, and every object of that type suddenly
//    needs properties from the other one — with the error appearing wherever the objects are
//    built, never where the mistake was made.
//
// 3. No. A class can implement an object type alias exactly as it implements an interface, so
//    `class SavingsAccount implements Account` compiles as it is. What is worth doing is
//    deciding which form the project uses for shapes like this and being consistent, rather
//    than rewriting a working declaration.

<!-- cell: markdown -->
That closes topic 12 and Level 3. You can describe object shapes with interfaces, say which
properties are optional and which never change, describe what an object must be able to do,
build families of shapes with `extends`, check a class against a contract with `implements`,
and choose between an interface and a type alias. Mini-project 3 puts the whole level to
work: interfaces for the contracts, classes for the accounts, loans and cards.
