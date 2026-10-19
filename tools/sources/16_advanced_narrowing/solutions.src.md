<!-- cell: markdown -->
# TypeScript — Advanced narrowing

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
## LESSON 62 — `typeof` and `instanceof`

### Exercise

<!-- cell: code solution -->
class L62Voucher {
  constructor(
    public readonly code: string,
    private amount: number,
  ) {}

  public worth(): number {
    return this.amount;
  }
}

class L62Coins {
  constructor(public count: number) {}

  public worth(): number {
    return Math.round(this.count * 0.2 * 100) / 100;
  }
}

type L62Instrument = L62Voucher | L62Coins;

function l62Value(instrument: L62Instrument): number {
  return Math.round(instrument.worth() * 100) / 100;
}

function l62Line(instrument: L62Instrument): string {
  const value = l62Value(instrument).toFixed(2);
  if (instrument instanceof L62Voucher) {
    return `voucher ${instrument.code} (${value} EUR)`;
  }
  return `coins: ${instrument.count} (${value} EUR)`;
}

function l62Text(value: string | number | null): string {
  if (value === null) {
    return "empty";
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.trim();
}

console.log(`${l62Line(new L62Voucher("V-1", 5))} / ${l62Line(new L62Coins(7))}`);
// prints voucher V-1 (5.00 EUR) / coins: 7 (1.40 EUR)

<!-- cell: markdown -->
Both `[to fix]` errors were the same rule from two sides. `instrument.code` before the check
asked for a property only one variant has (`Property 'code' does not exist on type
'L62Instrument'.`), and `instrument.count` inside the voucher branch asked for the *other*
variant's property, which narrowing had just ruled out.

`l62Value` needs no `instanceof` at all: both classes have `worth()`, so it is available on the
union itself. Narrowing is for the parts that differ.

**Common mistakes**

- **Narrowing when nothing needs it.** An `instanceof` in `l62Value` produces two branches that
  do the same thing.
- **`typeof instrument === "object"`** to tell the two apart. Both are objects; only
  `instanceof` knows which class built them.
- **Checking `value === null` after `typeof value === "number"` but using `value.trim()` in
  between.** Order the checks so that each branch leaves exactly one possibility.
- **Rounding only in `l62Line`.** `7 * 0.2` is `1.4000000000000001`, and `l62Value` is the
  function the checks compare.

### Verification

<!-- cell: code verification -->
const l62Voucher = new L62Voucher("V-1", 5);
const l62Coins = new L62Coins(7);

checkAll([
  ["a voucher line", l62Line(l62Voucher), "voucher V-1 (5.00 EUR)"],
  ["a coins line", l62Line(l62Coins), "coins: 7 (1.40 EUR)"],
  ["a voucher's value", l62Value(l62Voucher), 5],
  ["the coins' value", l62Value(l62Coins), 1.4],
  ["three coins", l62Value(new L62Coins(3)), 0.6],
  ["null text", l62Text(null), "empty"],
  ["number text", l62Text(40.7), "40.70"],
  ["string text", l62Text("  ada  "), "ada"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. `typeof value === "object"` is true for null, so that branch would catch the null case —
//    but it narrows the value to null, not to something with a length. Anything read there is
//    reported as possibly null. Checking `value === null` says what you mean and leaves the
//    other two possibilities intact.
//
// 2. No. Both classes have worth(), so it is available on the union without any check.
//    Narrowing is needed only for what the variants don't share — code, count — which is why
//    l62Line needs it and l62Value doesn't. A shared method is the cheaper design when the
//    variants can provide it.
//
// 3. A Date: yes, it is a class that exists at runtime.
//    An object literal typed as an interface: no. The interface is gone at runtime, and the
//      object was never built from a class.
//    An object from JSON.parse: no, whatever type it is annotated with. JSON.parse returns
//      plain objects; instanceof asks which constructor built the object, and that answer is
//      always Object.

<!-- cell: markdown -->
## LESSON 63 — The `in` operator

### Exercise

<!-- cell: code solution -->
type L63CardPayment = { amount: number; last4: string; note?: string };
type L63TransferPayment = { amount: number; fromIban: string; note?: string };
type L63Payment = L63CardPayment | L63TransferPayment;

const l63Card: L63CardPayment = { amount: 120.5, last4: "4242" };
const l63Transfer: L63TransferPayment = { amount: 40.7, fromIban: "IT60", note: "rent" };

const l63AsCard: L63TransferPayment = l63Transfer;

function l63Source(payment: L63Payment): string {
  if ("last4" in payment) {
    return `card ending ${payment.last4}`;
  }
  return `transfer from ${payment.fromIban}`;
}

function l63Fee(payment: L63Payment): number {
  if ("last4" in payment) {
    return Math.round(payment.amount * 0.015 * 100) / 100;
  }
  return 0;
}

function l63HasNote(payment: L63Payment): boolean {
  return "note" in payment;
}

console.log(`${l63Source(l63Card)} / ${l63Source(l63Transfer)}`);
// prints card ending 4242 / transfer from IT60

<!-- cell: markdown -->
`payment.last4` before any check asked for a property only one shape has
(`Property 'last4' does not exist on type 'L63Payment'.`), and `const l63AsCard:
L63CardPayment = l63Transfer` claimed a transfer was a card payment
(`Property 'last4' is missing in type 'L63TransferPayment' but required in type
'L63CardPayment'.`). The fix for the second one is to say what the value really is.

`l63HasNote` uses `in` for its other job: not to tell the shapes apart, but to ask whether an
optional property is present on this particular object.

**Common mistakes**

- **`payment.note !== undefined` instead of `"note" in payment`.** Nearly the same, and
  different for an object that has the key with the value `undefined`. Here either passes the
  checks; know which question you are asking.
- **Using `"note" in payment` to choose the branch in `l63Source`.** Both shapes may have a
  note, so it says nothing about which shape this is.
- **`"amount" in payment`.** Both have it, so the `else` branch is unreachable and the compiler
  keeps the whole union in the `if`.
- **Rounding the fee only when printing.** `120.5 * 1.5%` is `1.8074999999999999`, and the
  check compares the returned number.

### Verification

<!-- cell: code verification -->
const l63Small: L63CardPayment = { amount: 10, last4: "1111", note: "coffee" };

checkAll([
  ["a card source", l63Source(l63Card), "card ending 4242"],
  ["a transfer source", l63Source(l63Transfer), "transfer from IT60"],
  ["the card fee, rounded", l63Fee(l63Card), 1.81],
  ["a smaller card fee", l63Fee(l63Small), 0.15],
  ["transfers are free", l63Fee(l63Transfer), 0],
  ["a card payment with a note", l63HasNote(l63Small), true],
  ["one without", l63HasNote(l63Card), false],
  ["a transfer with a note", l63HasNote(l63Transfer), true],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Because `note` is optional in both shapes: a card payment may have one and a transfer may
//    have one, so its presence says nothing about which kind of payment this is. Used on note,
//    `in` answers a different question — does this particular object carry the property at all?
//    — which is exactly what l63HasNote needs.
//
// 2. Nothing sensible: a direct debit has no last4, so it falls into the else branch and is
//    described as a transfer from an IBAN it doesn't have — undefined at runtime. Nothing is
//    reported, because the function still handles every shape it was told about. You would find
//    out from a wrong line in a statement, not from the compiler.
//
// 3. Give all three shapes the same literal field, for example kind: "card" | "transfer" |
//    "debit", and switch on it — then a new kind can be reported everywhere it isn't handled.

<!-- cell: markdown -->
## LESSON 64 — Discriminated unions

### Exercise

<!-- cell: code solution -->
type L64Payment = { kind: "payment"; to: string; amount: number };
type L64Refund = { kind: "refund"; from: string; amount: number };
type L64Fee = { kind: "fee"; reason: string; amount: number };
type L64Entry = L64Payment | L64Refund | L64Fee;

const l64Entries: L64Entry[] = [
  { kind: "payment", to: "Coffee Bar", amount: 19.99 },
  { kind: "refund", from: "Coffee Bar", amount: 40.7 },
  { kind: "fee", reason: "card", amount: 2.15 },
];

function l64Line(entry: L64Entry): string {
  switch (entry.kind) {
    case "payment":
      return `payment to ${entry.to}: ${entry.amount.toFixed(2)} EUR`;
    case "refund":
      return `refund from ${entry.from}: ${entry.amount.toFixed(2)} EUR`;
    default:
      return `fee (${entry.reason}): ${entry.amount.toFixed(2)} EUR`;
  }
}

function l64Signed(entry: L64Entry): number {
  return entry.kind === "refund" ? entry.amount : -entry.amount;
}

function l64Balance(entries: L64Entry[]): number {
  const total = entries.reduce((sum, entry) => sum + l64Signed(entry), 0);
  return Math.round(total * 100) / 100;
}

console.log(l64Line(l64Entries[1])); // prints refund from Coffee Bar: 40.70 EUR

<!-- cell: markdown -->
`case "voucher"` was reported before the code ever ran: `Type '"voucher"' is not comparable to
type '"payment" | "refund" | "fee"'.` (TS2678) A discriminant of literal types turns a typo in
a `case` into a compiler error, which a `kind: string` would not have done.

The second error was `entry.to` in `l64Signed`, outside any check: only `kind` and `amount` are
guaranteed by the union, so a `to` is not there until the kind has been narrowed.

**Common mistakes**

- **Using `if` chains with `in` instead of the discriminant.** They work, but nothing checks
  that the property names are right, and nothing will check that every kind is handled
  (LESSON 66).
- **Declaring the discriminant as `kind: string` in one variant.** The switch still narrows
  each `case`, but a typo in a `case` value is no longer reported, because any string is
  comparable — the safety net quietly disappears.
- **Signing the amount at the call site** instead of inside `l64Signed`. Then every caller has
  to remember the rule.
- **Not rounding the balance.** `-19.99 + 40.7 - 2.15` is `18.560000000000006`.

### Verification

<!-- cell: code verification -->
checkAll([
  ["a payment line", l64Line(l64Entries[0]), "payment to Coffee Bar: 19.99 EUR"],
  ["a refund line", l64Line(l64Entries[1]), "refund from Coffee Bar: 40.70 EUR"],
  ["a fee line", l64Line(l64Entries[2]), "fee (card): 2.15 EUR"],
  ["a payment counts against you", l64Signed(l64Entries[0]), -19.99],
  ["a refund counts for you", l64Signed(l64Entries[1]), 40.7],
  ["a fee counts against you", l64Signed(l64Entries[2]), -2.15],
  ["the balance, rounded", l64Balance(l64Entries), 18.56],
  ["an empty statement", l64Balance([]), 0],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. At runtime nothing changes: the strings are the same either way. What the compiler loses
//    is every check that depends on knowing the possible values — a `case` with a typo is no
//    longer reported, and neither is a comparison against a value that can never occur. The
//    day a field is renamed, the switch keeps compiling and starts falling through to the
//    wrong branch, and the first sign of it is a wrong number in a statement.
//
// 2. Yes, but only for the amount's sign — and that works because `amount` is shared by all
//    three variants, so no narrowing is needed to read it. The ternary is a check on a value,
//    not a way of reaching a variant-only field. l64Line is where narrowing really earns its
//    place, because `to`, `from` and `reason` each live in one variant.
//
// 3. l64Line is reported: the new kind has no case, and the default branch now receives it, so
//    reading entry.reason there fails. l64Signed is the silent one: an interest entry isn't a
//    refund, so it is counted as negative — a wrong balance, no error. LESSON 66 turns that
//    silence into a compiler error.

<!-- cell: markdown -->
## LESSON 65 — User-defined type guards

### Exercise

<!-- cell: code solution -->
type L65Purchase = { kind: "purchase"; merchant: string; amount: number };
type L65Fee = { kind: "fee"; reason: string; amount: number };
type L65Entry = L65Purchase | L65Fee;

const l65Entries: L65Entry[] = [
  { kind: "purchase", merchant: "Coffee Bar", amount: 19.99 },
  { kind: "fee", reason: "card", amount: 2.15 },
  { kind: "fee", reason: "transfer", amount: 0.5 },
];

const l65Values: unknown[] = ["  ada  ", 10, "", "grace", null];

function l65IsFee(entry: L65Entry): entry is L65Fee {
  return entry.kind === "fee";
}

function l65IsText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function l65Fees(entries: L65Entry[]): L65Fee[] {
  return entries.filter(l65IsFee);
}

function l65Labels(values: unknown[]): string[] {
  return values.filter(l65IsText).map((value) => value.trim());
}

function l65FeeTotal(entries: L65Entry[]): number {
  const total = l65Fees(entries).reduce((sum, fee) => sum + fee.amount, 0);
  return Math.round(total * 100) / 100;
}

console.log(`${l65Fees(l65Entries).length} fees, ${l65Labels(l65Values).join(",")}`);
// prints 2 fees, ada,grace

<!-- cell: markdown -->
Neither function's body changed. `entry is L65Fee` and `value is string` are what carry the
check to the call sites: `filter` now returns `L65Fee[]` instead of `L65Entry[]`, and the
values that survive `l65IsText` are strings, so `.trim()` is allowed on them.

That is the whole difference between a check that returns a boolean and a check that tells the
compiler what the boolean means.

**Common mistakes**

- **Changing the calls instead of the checks.** Casting or re-declaring the result hides the
  problem; the guard is the place that knows the answer.
- **Writing `value is string` for a body that only checks `value !== null`.** The compiler
  accepts it, and the first `.trim()` throws at runtime.
- **`entries.filter((entry) => entry.kind === "fee")` inline.** That works too — TypeScript
  works the narrowing out for a short callback — but the named guard is reusable and says what
  it means. Annotate the guard's return type as `entry is L65Fee` and both forms behave the
  same.
- **Adding up the amounts of every entry.** `l65FeeTotal` uses `l65Fees` so there is one
  definition of "a fee".

### Verification

<!-- cell: code verification -->
checkAll([
  ["a fee is a fee", l65IsFee(l65Entries[1]), true],
  ["a purchase isn't", l65IsFee(l65Entries[0]), false],
  ["text is text", l65IsText("  ada  "), true],
  ["an empty string isn't", l65IsText("   "), false],
  ["a number isn't", l65IsText(10), false],
  ["only the fees", l65Fees(l65Entries).map((fee) => fee.reason), ["card", "transfer"]],
  ["only the labels", l65Labels(l65Values), ["ada", "grace"]],
  ["the fee total, rounded", l65FeeTotal(l65Entries), 2.65],
  ["no entries, no fees", l65FeeTotal([]), 0],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. In l65Fees, where the result of filter has to be an L65Fee[]. Everywhere else the
//    function was used inside an `if`, and a boolean is enough to choose a branch — but not to
//    change the type of an array. filter can only produce the narrower array type if the
//    function it is given says what `true` means.
//
// 2. function isFee(entry: L65Entry): entry is L65Fee { return entry.amount > 0; }
//    Accepted without a word. Every purchase with a positive amount is then treated as a fee,
//    and the error appears far away — reading entry.reason on a purchase gives undefined, and
//    the fee total silently includes purchases. Nothing points back at the guard.
//
// 3. It is honest, because everything it accepts really is a string: the promise is true, just
//    weaker than the check. TypeScript has no plain way to say "a string that isn't blank", so
//    the usual answer is to name the function for what it does — isNonEmptyText — and keep the
//    promise it can actually make.

<!-- cell: markdown -->
## LESSON 66 — Exhaustive checking and `never`

### Exercise

<!-- cell: code solution -->
type L66Purchase = { kind: "purchase"; merchant: string; amount: number };
type L66Refund = { kind: "refund"; from: string; amount: number };
type L66Fee = { kind: "fee"; reason: string; amount: number };
type L66Interest = { kind: "interest"; ratePercent: number; amount: number };
type L66Entry = L66Purchase | L66Refund | L66Fee | L66Interest;

const l66Entries: L66Entry[] = [
  { kind: "purchase", merchant: "Coffee Bar", amount: 19.99 },
  { kind: "refund", from: "Coffee Bar", amount: 40.7 },
  { kind: "fee", reason: "card", amount: 2.15 },
  { kind: "interest", ratePercent: 1.5, amount: 3.2 },
];

function l66Line(entry: L66Entry): string {
  switch (entry.kind) {
    case "purchase":
      return `purchase at ${entry.merchant}: ${entry.amount.toFixed(2)} EUR`;
    case "refund":
      return `refund from ${entry.from}: ${entry.amount.toFixed(2)} EUR`;
    case "fee":
      return `fee (${entry.reason}): ${entry.amount.toFixed(2)} EUR`;
    case "interest":
      return `interest at ${entry.ratePercent.toFixed(2)}%: ${entry.amount.toFixed(2)} EUR`;
    default: {
      const impossible: never = entry;
      return impossible;
    }
  }
}

function l66Signed(entry: L66Entry): number {
  switch (entry.kind) {
    case "refund":
    case "interest":
      return entry.amount;
    case "purchase":
    case "fee":
      return -entry.amount;
    default: {
      const impossible: never = entry;
      return impossible;
    }
  }
}

function l66Balance(entries: L66Entry[]): number {
  const total = entries.reduce((sum, entry) => sum + l66Signed(entry), 0);
  return Math.round(total * 100) / 100;
}

console.log(`${l66Line(l66Entries[3])} / balance ${l66Balance(l66Entries)}`);
// prints interest at 1.50%: 3.20 EUR / balance 21.76

<!-- cell: markdown -->
Both `[to fix]` errors said the same thing — `Type 'L66Interest' is not assignable to type
'never'.` — in two different functions. That is the whole value of the check: one new variant,
every place that has to decide about it, listed by the compiler.

In `l66Signed` the new case sits next to `refund`, because two cases that do the same thing can
share a body. The `default` branch stays, and once every kind is handled it is unreachable — as
the `never` proves.

**Common mistakes**

- **Deleting the `never` line to make the error go away.** The code compiles and the interest
  entry silently falls into whatever the default does. That is the bug the check exists to
  prevent.
- **Handling the new kind in one switch only.** The other error is still there, naming the same
  variant — read both.
- **Returning `impossible` without the annotation** (`return entry;`). The point is the
  assignment to `never`; the return is just a way to satisfy the return type.
- **Forgetting to round the balance.** `-19.99 + 40.7 - 2.15 + 3.2` is `21.760000000000005`.

### Verification

<!-- cell: code verification -->
checkAll([
  ["a purchase line", l66Line(l66Entries[0]), "purchase at Coffee Bar: 19.99 EUR"],
  ["an interest line", l66Line(l66Entries[3]), "interest at 1.50%: 3.20 EUR"],
  ["a fee line", l66Line(l66Entries[2]), "fee (card): 2.15 EUR"],
  ["a purchase counts against you", l66Signed(l66Entries[0]), -19.99],
  ["interest counts for you", l66Signed(l66Entries[3]), 3.2],
  ["a fee counts against you", l66Signed(l66Entries[2]), -2.15],
  ["the balance, rounded", l66Balance(l66Entries), 21.76],
  ["an empty statement", l66Balance([]), 0],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. It would have fallen into the default branch. In the LESSON 64 version that branch
//    returned -entry.amount, so interest earned would have been subtracted from the balance:
//    a wrong number, no error, and nobody would notice until a customer compared the totals by
//    hand.
//
// 2. Because `never` is a type, not a value: there is nothing to test at runtime. The check is
//    a question to the compiler — "is there anything left here?" — and the only way to ask it
//    is to try to assign what is left to a type that accepts nothing.
//
// 3. `void` promises "I return, but with nothing useful", so the code after the call still
//    runs. `never` promises "I do not return at all", so the compiler treats everything after
//    the call as unreachable and can use that when narrowing. That is why a function that
//    always throws is `never`, not `void`.

<!-- cell: markdown -->
That closes topic 16. You can narrow with `typeof`, `instanceof` and `in`, design a
discriminated union that narrows itself, name a check with a type guard, and make the compiler
prove that a union has been handled completely. Topic 17 is the last of the core course: how to
split all of this across files.
