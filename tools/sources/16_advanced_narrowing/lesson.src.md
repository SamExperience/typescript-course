<!-- cell: markdown -->
# TypeScript — Advanced narrowing

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../16_advanced_narrowing/lesson.ipynb
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
## LESSON 62 — `typeof` and `instanceof`

### Explanation

LESSON 26 narrowed unions of primitives with `typeof`. Two things are worth adding now.

**`typeof` has eight answers**, and one of them is a trap: `typeof null` is `"object"`. So for
`string | null`, the branch `typeof value === "object"` narrows to `null`, and reading
`value.length` there gives `'value' is possibly 'null'.` (TS18047) Comparing with `null`
directly is clearer for that case.

**`instanceof` narrows objects to a class** (LESSON 38 onwards):

```typescript
function describe(method: Card | Cash): string {
  if (method instanceof Card) {
    return `card ${method.number}`; // a Card here
  }
  return `cash ${method.count()}`; // a Cash here
}
```

It asks a runtime question — "was this object built from that class?" — so the right side must
be a real class, something that exists when the code runs. A type alias isn't:
`'NotAClass' only refers to a type, but is being used as a value here.` (TS2693) It works with
built-in classes too, like `Date`.

Outside the check, the union's members have only what they share: `method.number` before the
`if` is `Property 'number' does not exist on type 'Method'.` (TS2339), with the detail naming
the variant that lacks it. Inside the check, the *other* variant's members are the ones out of
reach.

For arrays, `Array.isArray(value)` is the narrowing check, not `typeof`: `typeof []` is
`"object"` like everything else.

### Key Notes

- `typeof null` is `"object"`: narrow `null` by comparing with `null`.
- `instanceof C` narrows to instances of the class `C`.
- The right side of `instanceof` must exist at runtime (TS2693 for a type).
- Before the check, only the union's shared members are available (TS2339).
- Arrays are narrowed with `Array.isArray`, not `typeof`.

### Example

<!-- cell: code example -->
class L62Card {
  constructor(
    public readonly number: string,
    private limit: number,
  ) {}

  public headroom(): number {
    return this.limit;
  }
}

class L62Cash {
  constructor(public notes: number) {}

  public total(): number {
    return this.notes * 10;
  }
}

type L62Method = L62Card | L62Cash;

function l62Describe(method: L62Method): string {
  if (method instanceof L62Card) {
    return `card ${method.number}, headroom ${method.headroom().toFixed(2)}`;
  }
  return `cash, ${method.total().toFixed(2)} EUR`;
}

function l62Label(value: string | number | null): string {
  if (value === null) {
    return "nothing";
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.trim();
}

// prints card 4000, headroom 1500.00 / cash, 30.00 EUR
console.log(`${l62Describe(new L62Card("4000", 1500))} / ${l62Describe(new L62Cash(3))}`);

// prints 40.70 ada nothing
console.log(`${l62Label(40.7)} ${l62Label("  ada  ")} ${l62Label(null)}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.
type L62Shape = { size: number };

// Compiler: 'L62Shape' only refers to a type, but is being used as a value here.
// Nothing calls this: at runtime the line would throw, because a type has no value.
function l62BadCheck(value: unknown): boolean {
  return value instanceof L62Shape;
}

function l62Trap(value: string | null): number {
  if (typeof value === "object") {
    // Compiler: 'value' is possibly 'null'.
    // Nothing calls this either: inside this branch the value really is null.
    return value.length;
  }
  return value.length;
}

// prints 5 — the branch above is only reached for null, and this call never gets there
console.log(l62Trap("hello"));

<!-- cell: markdown -->
### Exercise

A till accepts two kinds of payment instrument, and prints a label for whatever it is given.

1. Run `check:nb` and fix both `[to fix]` errors: one reads a property before the check, the
   other reads the wrong variant's property inside it.
2. `l62Line(instrument)` returns `"voucher V-1 (5.00 EUR)"` for a voucher and
   `"coins: 7 (1.40 EUR)"` for coins.
3. `l62Value(instrument)` returns the value in euros of either instrument, rounded to
   2 decimals.
4. `l62Text(value)` returns `"empty"` for `null`, the number with 2 decimals for a number, and
   the trimmed text for a string.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
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

function l62Line(instrument: L62Instrument): string {
  // TODO: "voucher V-1 (5.00 EUR)" or "coins: 7 (1.40 EUR)"
  const reference = instrument.code;
  if (instrument instanceof L62Voucher) {
    return `voucher ${reference} (${instrument.count} EUR)`;
  }
  return `coins: ${instrument.count}`;
}

function l62Value(instrument: L62Instrument): number {
  // TODO: the value in euros, rounded to 2 decimals
  return 0;
}

function l62Text(value: string | number | null): string {
  // TODO: "empty", a number with 2 decimals, or the trimmed text
  return "";
}

console.log(l62Line(new L62Coins(7)));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 62 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. `l62Text` checks `null` before `typeof value === "number"`. What would happen if it checked
   `typeof value === "object"` first instead, and why?
2. Both instrument classes have a `worth()` method. Does `l62Value` need `instanceof` at all?
   What does that tell you about when narrowing is needed?
3. `instanceof` asks a question about the object's class. Which of these can it narrow, and
   which can't it: a `Date`, an object literal typed as an interface, a class instance that
   arrived from `JSON.parse`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 63 — The `in` operator

### Explanation

`instanceof` needs a class. For plain object types — the ones from interfaces and type aliases
— the question is instead "does this object have that property?", and `in` asks it:

```typescript
type Person = { name: string; dateOfBirth: string };
type Company = { name: string; vatNumber: string };
type Client = Person | Company;

function idOf(client: Client): string {
  if ("vatNumber" in client) {
    return client.vatNumber; // a Company here
  }
  return client.dateOfBirth; // a Person here
}
```

`in` is JavaScript: it checks at runtime whether the object has that key. TypeScript uses the
answer to narrow the union, both ways — the property is there in the `if`, absent in the
`else`.

Two things to watch:

- **The property name isn't checked against the union.** `"passport" in client` compiles even
  though no variant has it. Inside the branch the property exists but its type is `unknown`, so
  using it is reported (`Type 'unknown' is not assignable to type 'string'.`) — and the branch
  is simply never taken.
- **An optional property is a poor discriminator.** `"nickname" in account` is true for one
  account and false for another of the same type, so it narrows nothing useful.

`in` also answers questions about a single type: `"nickname" in account` is how you ask whether
an optional property was actually set, rather than set to `undefined`.

When you own the types, a shared literal field is a better design than either `in` or
`instanceof` — that is LESSON 64. `in` is what you reach for when the shapes are given to you
and have nothing in common.

### Key Notes

- `"property" in value` narrows a union by the presence of that property.
- It works on plain object types, where `instanceof` can't help.
- Both branches are narrowed: present in the `if`, absent in the `else`.
- A name no variant has is accepted and narrows nothing useful.
- For a single type, `in` tells you whether an optional property is there.

### Example

<!-- cell: code example -->
type L63Person = { name: string; dateOfBirth: string };
type L63Company = { name: string; vatNumber: string; employees: number };
type L63Client = L63Person | L63Company;

function l63Identifier(client: L63Client): string {
  if ("vatNumber" in client) {
    return `VAT ${client.vatNumber} (${client.employees} staff)`;
  }
  return `born ${client.dateOfBirth}`;
}

function l63Greeting(client: L63Client): string {
  return `Dear ${client.name}`;
}

const l63Ada: L63Person = { name: "Ada", dateOfBirth: "1815-12-10" };
const l63Shop: L63Company = { name: "Coffee Bar", vatNumber: "IT123", employees: 4 };

// prints born 1815-12-10 / VAT IT123 (4 staff)
console.log(`${l63Identifier(l63Ada)} / ${l63Identifier(l63Shop)}`);

// prints Dear Ada
console.log(l63Greeting(l63Ada));

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Property 'vatNumber' does not exist on type 'L63Client'.
function l63TooEarly(client: L63Client): string {
  return client.vatNumber;
}

function l63Unknown(client: L63Client): string {
  if ("passport" in client) {
    // Compiler: Type 'unknown' is not assignable to type 'string'.
    return client.passport;
  }
  return client.name;
}

// prints Ada — the branch above is never taken, because no client has a passport
console.log(l63Unknown(l63Ada));

<!-- cell: markdown -->
### Exercise

A payment arrives either from a saved card or from a bank transfer. The two shapes come from
the bank's partner and have only the amount in common.

1. Run `check:nb` and fix both `[to fix]` errors: one reads a property before knowing which
   shape it has, and one claims a payment is a card payment before checking.
2. `l63Source(payment)` returns `"card ending 4242"` or `"transfer from IT60"`.
3. `l63Fee(payment)` returns `1.5%` of the amount for a card payment, rounded to 2 decimals,
   and `0` for a transfer.
4. `l63HasNote(payment)` returns whether the payment carries a note — both shapes may have one,
   and it is optional in both.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L63CardPayment = { amount: number; last4: string; note?: string };
type L63TransferPayment = { amount: number; fromIban: string; note?: string };
type L63Payment = L63CardPayment | L63TransferPayment;

const l63Card: L63CardPayment = { amount: 120.5, last4: "4242" };
const l63Transfer: L63TransferPayment = { amount: 40.7, fromIban: "IT60", note: "rent" };

const l63AsCard: L63CardPayment = l63Transfer;

function l63Source(payment: L63Payment): string {
  // TODO: "card ending 4242" or "transfer from IT60"
  return payment.last4;
}

function l63Fee(payment: L63Payment): number {
  // TODO: 1.5% for a card payment, rounded to 2 decimals; 0 for a transfer
  return 0;
}

function l63HasNote(payment: L63Payment): boolean {
  // TODO: does this payment carry a note?
  return false;
}

console.log(l63Source(l63Transfer));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 63 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. `l63HasNote` can't use `"note" in payment` to tell the two payment kinds apart. Why not, and
   what is `in` telling you when you use it on `note`?
2. The partner adds a third shape, a direct debit with a `mandateId`. What does
   `l63Source` do about it, and when would you find out?
3. If the bank owned these three shapes, what single change would make every one of these
   functions simpler? (One sentence — LESSON 64 is about that change.)

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 64 — Discriminated unions

### Explanation

`instanceof` needs classes and `in` needs the shapes to differ. A **discriminated union**
removes both problems: every variant carries the same field, with a different literal value.

```typescript
type Email = { kind: "email"; to: string; subject: string };
type Sms = { kind: "sms"; to: string; characters: number };
type Push = { kind: "push"; device: string; badge: number };
type Notification = Email | Sms | Push;
```

One field answers the question, and a `switch` reads it:

```typescript
switch (notification.kind) {
  case "email":
    return notification.subject; // an Email here
  case "sms":
    return `${notification.characters} characters`; // an Sms here
  default:
    return notification.device; // only Push is left
}
```

LESSON 27 introduced this shape; here is what makes it work and what to watch for.

- **The discriminant must be a literal type.** Declare `kind: string` and nothing narrows:
  `Property 'subject' does not exist on type 'Loose'.` (TS2339) even inside
  `if (notification.kind === "email")`.
- **A case outside the union is reported**: `Type '"letter"' is not comparable to type
  '"email" | "sms" | "push"'.` (TS2678) — a typo in a `case` can't slip through.
- **The `default` branch is narrowed too**, to whatever variants are left.
- Outside the switch, only the shared fields are available (TS2339 as usual).

Use the same field name everywhere — `kind` or `type` — and keep the values short and stable.
The payoff arrives in LESSON 66: with a discriminant, the compiler can prove that every variant
has been handled.

### Key Notes

- Every variant carries the same field with a different **literal** value.
- `switch` on that field narrows each branch, including `default`.
- `kind: string` narrows nothing (TS2339).
- A `case` value outside the union is reported (TS2678).
- Prefer this design over `in` and `instanceof` whenever you own the types.

### Example

<!-- cell: code example -->
type L64Email = { kind: "email"; to: string; subject: string };
type L64Sms = { kind: "sms"; to: string; characters: number };
type L64Push = { kind: "push"; device: string; badge: number };
type L64Notification = L64Email | L64Sms | L64Push;

function l64Describe(notification: L64Notification): string {
  switch (notification.kind) {
    case "email":
      return `email to ${notification.to}: ${notification.subject}`;
    case "sms":
      return `sms to ${notification.to}, ${notification.characters} characters`;
    default:
      return `push to ${notification.device} (${notification.badge})`;
  }
}

function l64Recipients(notifications: L64Notification[]): string[] {
  const recipients: string[] = [];
  for (const notification of notifications) {
    recipients.push(notification.kind === "push" ? notification.device : notification.to);
  }
  return recipients;
}

const l64All: L64Notification[] = [
  { kind: "email", to: "ada@example.com", subject: "Statement" },
  { kind: "sms", to: "+39 000", characters: 120 },
  { kind: "push", device: "phone-1", badge: 3 },
];

// prints email to ada@example.com: Statement
console.log(l64Describe(l64All[0]));

// prints ada@example.com,+39 000,phone-1
console.log(l64Recipients(l64All).join(","));

<!-- cell: code type-error-demo -->
// Type error on purpose.
type L64LooseEmail = { kind: string; to: string; subject: string };
type L64LooseSms = { kind: string; to: string; characters: number };
type L64Loose = L64LooseEmail | L64LooseSms;

function l64LooseSubject(notification: L64Loose): string {
  if (notification.kind === "email") {
    // Compiler: Property 'subject' does not exist on type 'L64Loose'.
    return notification.subject;
  }
  return "other";
}

function l64WrongCase(notification: L64Notification): string {
  switch (notification.kind) {
    // Compiler: Type '"letter"' is not comparable to type '"email" | "sms" | "push"'.
    case "letter":
      return "letter";
    default:
      return "other";
  }
}

// prints other — the check above is true at runtime, but the type never narrowed
console.log(l64LooseSubject({ kind: "sms", to: "+39", characters: 10 }));

<!-- cell: markdown -->
### Exercise

A statement line can be a payment, a refund or a fee. Each kind prints differently and counts
differently towards the balance.

1. Run `check:nb` and fix both `[to fix]` errors: one `case` names something that isn't an
   entry kind, and one function reads a field the union doesn't guarantee.
2. `l64Line(entry)` returns `"payment to Coffee Bar: 19.99 EUR"`,
   `"refund from Coffee Bar: 40.70 EUR"` or `"fee (card): 2.15 EUR"`.
3. `l64Signed(entry)` returns the amount as it counts towards the balance: negative for a
   payment and a fee, positive for a refund.
4. `l64Balance(entries)` adds up the signed amounts, rounded to 2 decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
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
  // TODO: one line per kind
  switch (entry.kind) {
    case "payment":
      return `payment to ${entry.to}: ${entry.amount.toFixed(2)} EUR`;
    case "voucher":
      return "voucher";
    default:
      return "";
  }
}

function l64Signed(entry: L64Entry): number {
  // TODO: negative for a payment and a fee, positive for a refund
  return entry.to;
}

function l64Balance(entries: L64Entry[]): number {
  // TODO: the signed amounts added up, rounded to 2 decimals
  return 0;
}

console.log(l64Line(l64Entries[1]));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 64 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. With `kind: string` on one variant, the `switch` still runs correctly at runtime. What
   exactly did the compiler lose, and what would go wrong the day a field is renamed?
2. `l64Signed` could be written with `entry.kind === "refund" ? entry.amount : -entry.amount`.
   Is the narrowing still doing anything there? Explain.
3. The bank adds a `"interest"` entry. Which of the three functions does the compiler report,
   and which one silently does the wrong thing? (LESSON 66 fixes the silent one.)

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 65 — User-defined type guards

### Explanation

Sometimes the check that decides a type lives in its own function. Say so in the return type:

```typescript
function isEmail(notification: Notification): notification is Email {
  return notification.kind === "email";
}
```

`notification is Email` means "when this returns `true`, the argument is an `Email`". The body
still returns a plain boolean; the annotation is what the compiler carries to every call site,
so `if (isEmail(n))` narrows exactly like `if (n.kind === "email")`.

Where it earns its place:

- **`filter` that keeps the narrower type.** `all.filter(isEmail)` is an `Email[]`.
  TypeScript works this out on its own for a short callback written inline, so
  `all.filter((n) => n.kind === "email")` also gives an `Email[]`. It stops doing so when the
  function's return type is annotated `: boolean`, or when the body grows past a single
  expression — and those are exactly the cases where writing `n is Email` brings the narrowing
  back.
- **Checking outside data.** A guard is how a value typed `unknown` becomes a typed value:
  `function isAmount(value: unknown): value is number { return typeof value === "number" &&
  value > 0; }`.
- **A rule with a name.** `isSettled(entry)` says more at a call site than the condition
  inside it.

One warning: **the compiler trusts the annotation.** A guard whose body doesn't prove what the
annotation claims is accepted without a word, and every call site then believes it. A guard is
a promise you have to keep yourself.

### Key Notes

- `function f(x: T): x is U` narrows `x` to `U` wherever `f(x)` is true.
- The body returns a normal boolean; the annotation is what narrows.
- `filter` with a guard returns the narrower array type.
- A guard is how `unknown` data becomes typed data.
- Nothing checks that the body matches the promise: keep it honest.

### Example

<!-- cell: code example -->
type L65Card = { kind: "card"; last4: string; amount: number };
type L65Transfer = { kind: "transfer"; iban: string; amount: number };
type L65Move = L65Card | L65Transfer;

function l65IsCard(move: L65Move): move is L65Card {
  return move.kind === "card";
}

function l65IsAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const l65Moves: L65Move[] = [
  { kind: "card", last4: "4242", amount: 120.5 },
  { kind: "transfer", iban: "IT60", amount: 40.7 },
  { kind: "card", last4: "1111", amount: 10 },
];

const l65Cards: L65Card[] = l65Moves.filter(l65IsCard);
const l65Raw: unknown[] = [10, "40.70", 2.15];
const l65Amounts: number[] = l65Raw.filter(l65IsAmount);

// prints 4242,1111 / 2 numbers
console.log(`${l65Cards.map((card) => card.last4).join(",")} / ${l65Amounts.length} numbers`);

// prints 130.5 — only the card amounts
console.log(l65Cards.reduce((sum, card) => sum + card.amount, 0));

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l65IsTransferPlain(move: L65Move): boolean {
  return move.kind === "transfer";
}

// Compiler: Type 'L65Move[]' is not assignable to type 'L65Transfer[]'.
const l65Transfers: L65Transfer[] = l65Moves.filter(l65IsTransferPlain);

function l65Doubled(value: unknown): number {
  // Compiler: 'value' is of type 'unknown'.
  return value * 2;
}

// No error, and no truth either: this guard claims the wrong type.
function l65IsCardLying(move: L65Move): move is L65Card {
  return move.kind === "transfer";
}

// prints 1 — the filter above really did keep one transfer, whatever its type says
console.log(l65Moves.filter(l65IsTransferPlain).length);

<!-- cell: markdown -->
### Exercise

The bank receives a batch of raw values and a list of statement entries. Both need a check with
a name.

1. Run `check:nb` and fix both `[to fix]` errors by giving the two checks a type guard return
   type, not by changing the calls.
2. `l65IsFee(entry)` is true for a fee entry, `l65IsText(value)` is true for a non-empty string.
3. `l65Fees(entries)` returns only the fee entries, as a `L65Fee[]`.
4. `l65Labels(values)` returns only the non-empty strings, trimmed.
5. `l65FeeTotal(entries)` adds up the fee amounts, rounded to 2 decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L65Purchase = { kind: "purchase"; merchant: string; amount: number };
type L65Fee = { kind: "fee"; reason: string; amount: number };
type L65Entry = L65Purchase | L65Fee;

const l65Entries: L65Entry[] = [
  { kind: "purchase", merchant: "Coffee Bar", amount: 19.99 },
  { kind: "fee", reason: "card", amount: 2.15 },
  { kind: "fee", reason: "transfer", amount: 0.5 },
];

const l65Values: unknown[] = ["  ada  ", 10, "", "grace", null];

function l65IsFee(entry: L65Entry): boolean {
  // TODO: is this a fee?
  return entry.kind === "fee";
}

function l65IsText(value: unknown): boolean {
  // TODO: is this a non-empty string?
  return typeof value === "string" && value.trim() !== "";
}

function l65Fees(entries: L65Entry[]): L65Fee[] {
  // TODO: only the fees
  return entries.filter(l65IsFee);
}

function l65Labels(values: unknown[]): string[] {
  // TODO: only the non-empty strings, trimmed
  return values.filter(l65IsText).map((value) => value.trim());
}

function l65FeeTotal(entries: L65Entry[]): number {
  // TODO: the fee amounts added up, rounded to 2 decimals
  return 0;
}

console.log(l65IsFee(l65Entries[1]));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 65 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. `l65IsFee` worked as a plain `boolean` function everywhere except one place. Which place,
   and why exactly there?
2. Write, in a comment, a guard body that the compiler accepts but that is a lie. What would
   go wrong, and where would the error finally appear?
3. `l65IsText` returns `value is string`, but it also rejects `"   "`. Is the type it promises
   still honest? What would a more precise promise need?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 66 — Exhaustive checking and `never`

### Explanation

`never` is the type with **no values at all**. Nothing can be assigned to it — not `undefined`,
not `null`, nothing — and that is exactly what makes it useful.

After a `switch` has handled every variant of a union, the value left in `default` has no
possible type. Assign it to a `never` and say so:

```typescript
default: {
  const impossible: never = entry;
  return impossible;
}
```

While every variant is handled, that line compiles. Add a fourth variant and it stops:
`Type 'L66Interest' is not assignable to type 'never'.` (TS2322) The message names the variant
nobody handled, and it appears in **every** switch that forgot it — which is the point. Without
it, a forgotten variant is silent: the `default` branch simply treats it as something it isn't.

You have already met `never` twice: an `Extract` that matches nothing (LESSON 59), and any
narrowing that rules everything out.

It also has a second job: **a function that never returns normally** is declared `: never`.

```typescript
function fail(message: string): never {
  throw new Error(message);
}
```

If such a function can reach its end, that is reported too: `A function returning 'never'
cannot have a reachable end point.` (TS2534) Don't confuse it with `void`, which means "returns
nothing useful" — a `void` function does return.

### Key Notes

- `never` has no values: nothing can be assigned to it.
- In a `default` branch, `const impossible: never = value` proves every variant was handled.
- A new variant is then reported in every switch that forgot it (TS2322, naming it).
- `: never` also marks a function that always throws (TS2534 if it can return).
- `never` is not `void` and not `undefined`.

### Example

<!-- cell: code example -->
type L66Email = { kind: "email"; subject: string };
type L66Sms = { kind: "sms"; characters: number };
type L66Push = { kind: "push"; badge: number };
type L66Notification = L66Email | L66Sms | L66Push;

function l66Describe(notification: L66Notification): string {
  switch (notification.kind) {
    case "email":
      return `email: ${notification.subject}`;
    case "sms":
      return `sms: ${notification.characters} characters`;
    case "push":
      return `push: badge ${notification.badge}`;
    default: {
      const impossible: never = notification;
      return impossible;
    }
  }
}

function l66Fail(message: string): never {
  throw new Error(message);
}

function l66Cost(notification: L66Notification): number {
  if (notification.kind === "email") {
    return 0;
  }
  if (notification.kind === "sms") {
    return Math.round(notification.characters * 0.01 * 100) / 100;
  }
  return 0;
}

// prints email: Statement / sms: 1.2 / 0
console.log(
  `${l66Describe({ kind: "email", subject: "Statement" })} / sms: ${l66Cost({ kind: "sms", characters: 120 })} / ${l66Cost({ kind: "push", badge: 1 })}`,
);

// prints caught: nothing to send
try {
  l66Fail("nothing to send");
} catch (error) {
  console.log(`caught: ${error instanceof Error ? error.message : "unknown"}`);
}

<!-- cell: code type-error-demo -->
// Type error on purpose.
type L66Letter = { kind: "letter"; pages: number };
type L66Wider = L66Notification | L66Letter;

function l66Incomplete(notification: L66Wider): string {
  switch (notification.kind) {
    case "email":
      return "email";
    case "sms":
      return "sms";
    case "push":
      return "push";
    default: {
      // Compiler: Type 'L66Letter' is not assignable to type 'never'.
      const impossible: never = notification;
      return impossible;
    }
  }
}

// Compiler: A function returning 'never' cannot have a reachable end point.
function l66NotReallyNever(message: string): never {
  const ignored = message.trim();
}

// prints email — the letter case is the one nobody wrote
console.log(l66Incomplete({ kind: "email", subject: "Statement" }));

<!-- cell: markdown -->
### Exercise

The statement from LESSON 64 has a fourth kind of entry: interest. Both functions below already
end with an exhaustiveness check, and both are reported until the new kind is handled.

1. Run `check:nb`. Both `[to fix]` errors name the same missing variant. Handle it in both
   switches.
2. `l66Line(entry)` returns `"interest at 1.50%: 3.20 EUR"` for an interest entry, and the
   lines from LESSON 64 for the others.
3. `l66Signed(entry)` returns the amount as it counts towards the balance: negative for a
   purchase and a fee, positive for a refund and for interest.
4. `l66Balance(entries)` adds up the signed amounts, rounded to 2 decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
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
    default: {
      const impossible: never = entry;
      return impossible;
    }
  }
}

function l66Signed(entry: L66Entry): number {
  switch (entry.kind) {
    case "refund":
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
  // TODO: the signed amounts added up, rounded to 2 decimals
  return 0;
}

console.log(l66Line(l66Entries[0]));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 66 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. Without the `never` check, what would `l66Signed` have returned for an interest entry, and
   when would anyone have noticed?
2. `const impossible: never = entry;` is the line that fails. Explain in one sentence why
   assigning to `never` is the check, rather than something like `typeof entry === "never"`.
3. `l66Fail` in the Example is declared `: never`, not `: void`. What does each of the two
   promise a caller, and which one lets the compiler treat the code after the call as
   unreachable?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
