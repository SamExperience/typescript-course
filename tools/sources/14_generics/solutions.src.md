<!-- cell: markdown -->
# TypeScript — Generics

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
## LESSON 51 — Why generics exist, and generic functions

### Exercise

<!-- cell: code solution -->
type L51Payment = { reference: string; amount: number };

function l51FirstOf<T>(items: T[]): T | undefined {
  return items[0];
}

function l51LastTwo<T>(items: T[]): T[] {
  return items.slice(-2);
}

function l51Keep<T>(items: T[], keep: (item: T) => boolean): T[] {
  return items.filter(keep);
}

const l51Payments: L51Payment[] = [
  { reference: "P-1", amount: 40.7 },
  { reference: "P-2", amount: 120.1 },
  { reference: "P-3", amount: 2.15 },
];

const l51References: L51Payment[] = l51LastTwo(l51Payments);

console.log(l51References.length); // prints 2

<!-- cell: markdown -->
The first `[to fix]` error was `return items.length` in a function that promises a `T`:
`Type 'number' is not assignable to type 'T'.`, with the reason spelled out — `'T' could be
instantiated with an arbitrary type which could be unrelated to 'number'.` A length is a
number whatever the list holds, and `T` might be anything.

The second was the explicit type argument: `l51LastTwo<string>(l51Payments)` promised a list
of strings and handed over payments (TS2345). Dropping the `<string>` lets the argument decide,
which is the point of the generic — and the annotation on the left has to agree with it.

`slice(-2)` returns the last two items and simply returns everything when the list is shorter,
which is exactly the rule the exercise asks for.

**Common mistakes**

- **Writing `unknown[]` to "make it work for everything".** It does, and the caller gets a
  value it can't use: `'value' is of type 'unknown'.` (TS18046) The link between the argument
  and the result is what a generic adds.
- **Three copies of the same function**, one per type. That is the problem generics solve.
- **Reaching for a property of `T` inside the function** (`items[0].amount`). `T` promises
  nothing yet; narrowing what `T` can be is LESSON 54.
- **Returning `items[items.length - 2]`** for the last two. That is one item, and it's
  `undefined` for a one-item list.

### Verification

<!-- cell: code verification -->
const l51Numbers: number[] = [10, 20, 30];
const l51Texts: string[] = ["a", "b"];

checkAll([
  ["the first number", l51FirstOf(l51Numbers), 10],
  ["the first payment", l51FirstOf(l51Payments)?.reference, "P-1"],
  ["an empty list has no first item", l51FirstOf([]), undefined],
  ["the last two numbers", l51LastTwo(l51Numbers), [20, 30]],
  ["a short list gives what it has", l51LastTwo(l51Texts), ["a", "b"]],
  ["an empty list gives an empty list", l51LastTwo([]), []],
  ["numbers kept by a rule", l51Keep(l51Numbers, (value) => value > 15), [20, 30]],
  ["payments kept by a rule", l51Keep(l51Payments, (payment) => payment.amount > 100).length, 1],
  ["texts kept by a rule", l51Keep(l51Texts, (text) => text === "a"), ["a"]],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. It would be `unknown`. Before using it the caller would have to check it — typeof for a
//    primitive, and for an object there is no check the course has taught yet. Everything the
//    caller already knew about the list would have to be proved again, value by value.
//
// 2. Because the function is checked once, for every possible T, not once per call. The
//    compiler has to be right for `l51Total(["a"])` as well, and a string has no toFixed. The
//    call that happens to pass numbers is not the only call that has to work.
//
// 3. Generic: the last item of any list — the result type follows the argument.
//    Generic: the longer of two lists — same reason, and both lists share one T.
//    Not generic: adding up a list of amounts — it only makes sense for number[], and saying
//      so is clearer than a T that would need a constraint.
//    Not generic: formatting a payment — it works on one type, so Payment says more than T.

<!-- cell: markdown -->
## LESSON 52 — Generic types and interfaces

### Exercise

<!-- cell: code solution -->
type L52Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

type L52Account = { iban: string; owner: string };

const l52Accounts: L52Account[] = [
  { iban: "IT60", owner: "Ada" },
  { iban: "IT61", owner: "Grace" },
];

const l52NoAccount: L52Account = { iban: "-", owner: "nobody" };

const l52Nothing: L52Result<number> = { ok: false, error: "nothing yet" };

function l52ParseAmount(text: string): L52Result<number> {
  if (text === "") {
    return { ok: false, error: "no amount given" };
  }
  const value = Number(text);
  if (Number.isNaN(value)) {
    return { ok: false, error: `not a number: ${text}` };
  }
  return { ok: true, value: Math.round(value * 100) / 100 };
}

function l52FindAccount(accounts: L52Account[], iban: string): L52Result<L52Account> {
  const found = accounts.find((account) => account.iban === iban);
  if (found === undefined) {
    return { ok: false, error: `no account with IBAN ${iban}` };
  }
  return { ok: true, value: found };
}

function l52ValueOr<T>(result: L52Result<T>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

function l52Describe<T>(result: L52Result<T>, label: string): string {
  return `${label}: ${result.ok ? "ok" : result.error}`;
}

console.log(l52Describe(l52ParseAmount("40.70"), "amount")); // prints amount: ok

<!-- cell: markdown -->
`L52Result` without its argument was the first `[to fix]` error: the name alone isn't a type
(TS2314). `L52Result<number>` is what `l52Nothing` means — a failed result that would have
carried a number.

The second was `{ ok: true, value: text }` in a function that promises a `L52Result<number>`.
The return type is where the promise lives, so the wrong value is reported at the `return`
(LESSON 28), not at some later caller.

`l52ValueOr` and `l52Describe` never look inside the value, so they work for a number and an
account alike. `result.ok` narrows the union exactly as in LESSON 27 — `T` changes nothing
about how narrowing works.

**Common mistakes**

- **Checking the number before the empty text.** `Number("")` is `0`, not `NaN`, so an empty
  text would quietly become a valid amount of `0`.
- **`Number.isNaN(value)` vs `value === NaN`.** Nothing equals `NaN`, so the comparison is
  always `false` and every text passes.
- **Rounding in the caller.** `40.705` has to be `40.71` in the result itself; the value is what
  the rest of the report uses.
- **Writing two result types**, one for amounts and one for accounts. That is exactly what the
  type parameter removes.
- **Returning `{ ok: false, value: fallback }`.** The failed branch has no `value`, and the
  compiler says so.

### Verification

<!-- cell: code verification -->
checkAll([
  ["a valid amount", l52ValueOr(l52ParseAmount("40.70"), 0), 40.7],
  ["an amount is rounded", l52ValueOr(l52ParseAmount("40.705"), 0), 40.71],
  ["text that isn't a number falls back", l52ValueOr(l52ParseAmount("abc"), 0), 0],
  ["an empty text is refused", l52Describe(l52ParseAmount(""), "amount"), "amount: no amount given"],
  ["the reason is reported", l52Describe(l52ParseAmount("abc"), "amount"), "amount: not a number: abc"],
  ["a success describes itself", l52Describe(l52ParseAmount("40.70"), "amount"), "amount: ok"],
  ["a known account", l52ValueOr(l52FindAccount(l52Accounts, "IT61"), l52NoAccount).owner, "Grace"],
  ["an unknown account falls back", l52ValueOr(l52FindAccount(l52Accounts, "IT99"), l52NoAccount).owner, "nobody"],
  ["the missing account is reported", l52Describe(l52FindAccount(l52Accounts, "IT99"), "account"), "account: no account with IBAN IT99"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. l52ParseAmount and l52FindAccount each do one job for one type: parsing produces a
//    number, looking up an account produces an account. A type parameter there would promise
//    something the function can't keep. l52ValueOr and l52Describe do the same work for every
//    result, and they never look inside the value — that is exactly when a generic is right.
//
// 2. Two: one result type for amounts and one for accounts, each with its own success and
//    failure branch. l52ValueOr would have to exist twice as well, once per result type, with
//    identical bodies — and a third one the day a third kind of result appears.
//
// 3. T promises nothing, so nothing can be assumed about the value: no toFixed, no property,
//    not even a useful template string beyond String(value). To print it, the function would
//    have to be told something about T — a constraint (LESSON 54) — or be handed a function
//    that turns a T into a string, which is what a Mapper<T, string> would be.

<!-- cell: markdown -->
## LESSON 53 — Generic classes

### Exercise

<!-- cell: code solution -->
type L53Payment = { reference: string; amount: number };

class L53Batch<T> {
  private stored: T[] = [];

  constructor(
    public readonly label: string,
    private readonly limit: number,
  ) {}

  public static describe(): string {
    return "a batch holds up to a fixed number of items of one kind";
  }

  public add(item: T): boolean {
    if (this.isFull) {
      return false;
    }
    this.stored.push(item);
    return true;
  }

  public get size(): number {
    return this.stored.length;
  }

  public get isFull(): boolean {
    return this.stored.length >= this.limit;
  }

  public items(): readonly T[] {
    return this.stored;
  }

  public find(matches: (item: T) => boolean): T | undefined {
    return this.stored.find(matches);
  }
}

const l53Anything: L53Batch<number> = new L53Batch<number>("anything", 2);

console.log(`${l53Anything.label}: ${L53Batch.describe()}`);
// prints anything: a batch holds up to a fixed number of items of one kind

<!-- cell: markdown -->
`describe()` is `static`, so it exists once, shared by every batch of every type — there is no
single `T` for it to talk about (TS2302). Saying what a batch *is* needs no type parameter at
all. And `L53Batch` on its own isn't a type: a batch is always a batch of something (TS2314).

`add` asks `this.isFull` instead of repeating `this.stored.length >= this.limit`. One rule,
one place.

**Common mistakes**

- **Making `describe()` an instance method to silence TS2302.** It works, but the question was
  never about one batch. A static that can't mention `T` is usually a sign it belongs to the
  class, not to the content.
- **`items()` returning `this.stored` as `T[]` instead of `readonly T[]`.** Then a caller can
  push straight into the batch and walk past the limit.
- **Checking `>` instead of `>=` in `isFull`.** A batch of 2 accepts a third item.
- **Storing the item before checking the limit.** The refused item is already inside, and
  `size` proves it.

### Verification

<!-- cell: code verification -->
const l53Refs = new L53Batch<string>("references", 2);
const l53Added = [l53Refs.add("P-1"), l53Refs.add("P-2"), l53Refs.add("P-3")];

const l53Payments = new L53Batch<L53Payment>("payments", 3);
l53Payments.add({ reference: "P-1", amount: 40.7 });
l53Payments.add({ reference: "P-2", amount: 120.1 });

checkAll([
  ["the first two fit, the third does not", l53Added, [true, true, false]],
  ["a full batch keeps its size", l53Refs.size, 2],
  ["and knows it is full", l53Refs.isFull, true],
  ["the refused item was not stored", l53Refs.items(), ["P-1", "P-2"]],
  ["a batch of another type counts its own items", l53Payments.size, 2],
  ["which is not full yet", l53Payments.isFull, false],
  ["finding by a rule", l53Payments.find((payment) => payment.amount > 100)?.reference, "P-2"],
  ["nothing matches", l53Refs.find((reference) => reference === "P-9"), undefined],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Without a type parameter: one class per kind of content, StringBatch and PaymentBatch,
//    with identical bodies and a third one waiting to be written. With unknown[], items()
//    would return unknown[], and every caller would have to prove all over again what the
//    batch obviously holds — the type would be thrown away at the door.
//
// 2. A static member belongs to the class object, which is created once when the program
//    starts, before any batch exists and shared by batches of every type. T is chosen per
//    instance, so at the moment describe() exists there is no T to mean anything.
//
// 3. Type parameter: a queue of things waiting to be sent, and a cache of values looked up by
//    name — both are containers that don't care what they hold.
//    No type parameter: a savings account and a repayment schedule. They have rules about
//    their content — amounts, rates, dates — so naming those types says more than T.

<!-- cell: markdown -->
## LESSON 54 — Constraints and `keyof`

### Exercise

<!-- cell: code solution -->
type L54Movement = { id: string; amount: number; madeOn: string };

const l54Movements: L54Movement[] = [
  { id: "M-1", amount: 40.7, madeOn: "2026-01-05" },
  { id: "M-2", amount: 120.1, madeOn: "2026-01-06" },
  { id: "M-3", amount: 2.15, madeOn: "2026-01-07" },
];

const l54Owners = [{ owner: "Ada" }, { owner: "Grace" }];

function l54Total<T extends { amount: number }>(items: T[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
}

function l54Largest<T extends { amount: number }>(items: T[]): T | undefined {
  let best: T | undefined = undefined;
  for (const item of items) {
    if (best === undefined || item.amount > best.amount) {
      best = item;
    }
  }
  return best;
}

function l54Get<T, K extends keyof T>(item: T, key: K): T[K] {
  return item[key];
}

function l54Column<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

console.log(`${l54Total(l54Movements)} ${l54Get(l54Movements[0], "amount")} ${l54Owners.length}`);
// prints 162.95 40.7 2

<!-- cell: markdown -->
Both `[to fix]` errors were calls, and both messages named the missing piece.
`l54Total(l54Owners)` failed because an owner has no `amount`:
`Property 'amount' is missing in type '{ owner: string; }' but required in type
'{ amount: number; }'.` And `"amuont"` is not one of the movement's keys, so it isn't a
`keyof L54Movement` — a typo that would have been a silent `undefined` in JavaScript.

`l54Largest` returns `T | undefined`, not `{ amount: number } | undefined`, which is why
`l54Largest(l54Movements)?.id` still works. The constraint says what the function may read; it
doesn't shrink what the caller gets back.

**Common mistakes**

- **Constraining to `L54Movement`.** The function then works for movements only, and the same
  code has to be written again for charges.
- **Dropping the constraint and reading `item.amount` anyway.** `Property 'amount' does not
  exist on type 'T'.` (TS2339) — `T` alone promises nothing.
- **Returning `{ amount: number } | undefined` from `l54Largest`.** It compiles, and every
  caller loses the rest of its own type.
- **`items.reduce((best, item) => ...)` without a starting value** on a possibly empty list.
  Reduce on an empty array with no starting value throws at runtime.
- **Rounding each amount instead of the total.** The exercise asks for the total rounded; the
  individual amounts are already what they are.

### Verification

<!-- cell: code verification -->
const l54Charges: { code: string; amount: number }[] = [
  { code: "F-1", amount: 0.5 },
  { code: "F-2", amount: 1.81 },
];

const l54Id: string = l54Get(l54Movements[1], "id");
const l54Value: number = l54Get(l54Movements[1], "amount");

checkAll([
  ["a total of movements, rounded", l54Total(l54Movements), 162.95],
  ["the same function totals charges", l54Total(l54Charges), 2.31],
  ["an empty list totals 0", l54Total([]), 0],
  ["the largest movement keeps its own type", l54Largest(l54Movements)?.id, "M-2"],
  ["the largest charge", l54Largest(l54Charges)?.code, "F-2"],
  ["an empty list has no largest item", l54Largest([]), undefined],
  ["a field by name", l54Id, "M-2"],
  ["another field, another type", l54Value, 120.1],
  ["a column of ids", l54Column(l54Movements, "id"), ["M-1", "M-2", "M-3"]],
  ["a column of amounts", l54Column(l54Charges, "amount"), [0.5, 1.81]],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Two things: the charges (code + amount) could no longer be totalled, because they are
//    not movements; and any future kind of money — a fee, a repayment, a line on an invoice —
//    would need its own copy of the function. The constraint should be the shape the body
//    reads, which is one property.
//
// 2. Because the caller gets its own type back. With T, l54Largest(movements)?.id and
//    l54Largest(charges)?.code both work. With { amount: number } | undefined, the result
//    would have exactly one readable property, and the id or the code would be reported as
//    missing — the function would have quietly thrown away everything it didn't need itself.
//
// 3. K extends keyof T decides it: K is the single key the caller passed, and the return type
//    T[K] is the type of that property. Without keyof, the key would be a plain string and the
//    return type would have to be something like string | number — a union every caller would
//    then have to narrow, for a value the compiler could have known exactly.

<!-- cell: markdown -->
## LESSON 55 — Practical patterns, and avoiding unnecessary generics

### Exercise

<!-- cell: code solution -->
type L55Movement = { id: string; amount: number };

const l55Movements: L55Movement[] = [
  { id: "M-1", amount: 40.7 },
  { id: "M-2", amount: 120.1 },
  { id: "M-3", amount: 2.15 },
];

function l55Line(item: { amount: number }): string {
  return `${item.amount.toFixed(2)} EUR`;
}

function l55Change<T, R>(items: T[], change: (item: T) => R): R[] {
  return items.map(change);
}

function l55ByAmount<T extends { amount: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.amount - left.amount);
}

const l55Ids: string[] = l55Change(l55Movements, (movement) => movement.id);

console.log(`${l55Line(l55Movements[0])} ${l55Ids.join(",")}`);
// prints 40.70 EUR M-1,M-2,M-3

<!-- cell: markdown -->
`l55Line` lost its type parameter and nothing changed: it accepted "anything with an amount"
before and it accepts exactly that now — with a shorter signature and a clearer error message.
`T` appeared once, so it linked nothing.

The other two keep theirs for opposite reasons. `l55Change` links the item type to the callback
and the callback's result to the returned array — three places, two parameters. `l55ByAmount`
links the argument to the result: pass movements, get movements back, not
`{ amount: number }[]`.

The two `[to fix]` errors were both calls: `const l55Ids: number[]` asked for numbers from a
callback returning ids (TS2322), and `l55Line("40.70")` passed a string where something with an
`amount` was expected (TS2345).

**Common mistakes**

- **Sorting the original list.** `items.sort()` orders in place and returns the same array, so
  the caller's list changes behind its back. `[...items].sort(...)` sorts a copy.
- **`sort((a, b) => a.amount - b.amount)`** gives lowest first. Highest first is
  `right.amount - left.amount`.
- **Keeping the type parameter on `l55Line` "in case it's useful later".** The constraint is
  already the parameter type; the extra `<T>` only makes the signature harder to read.
- **Giving `l55Change` one type parameter** and returning `T[]`. The whole point is that the
  result type is a different one.

### Verification

<!-- cell: code verification -->
const l55Charges: { code: string; amount: number }[] = [
  { code: "F-1", amount: 0.5 },
  { code: "F-2", amount: 1.81 },
];

const l55Order = l55Change(l55ByAmount(l55Movements), (movement) => movement.id);

checkAll([
  ["a line for a movement", l55Line(l55Movements[0]), "40.70 EUR"],
  ["the same line for a charge", l55Line(l55Charges[1]), "1.81 EUR"],
  ["changed into ids", l55Change(l55Movements, (movement) => movement.id), ["M-1", "M-2", "M-3"]],
  ["changed into lengths", l55Change(["a", "bb"], (text) => text.length), [1, 2]],
  ["changed into booleans", l55Change(l55Charges, (charge) => charge.amount > 1), [false, true]],
  ["ordered, highest first", l55Order, ["M-2", "M-1", "M-3"]],
  ["the original list is untouched", l55Change(l55Movements, (movement) => movement.id), ["M-1", "M-2", "M-3"]],
  ["charges order too", l55Change(l55ByAmount(l55Charges), (charge) => charge.code), ["F-2", "F-1"]],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// count: no. T appears once and the body only reads length.
//   count(items: unknown[]): number
// pairUp: yes. T links both parameters to each other and to the result, so two values of the
//   same type go in and that type comes back out.
// idOf: no. T appears once; the constraint is the parameter type.
//   idOf(item: { id: string }): string
// pick: yes. T appears in the parameter, inside keyof T and in the return type T[K]; K links
//   the key to the type of the value that comes back.
// save: no. T appears once and nothing is returned.
//   save(item: unknown): void
//
// What they have in common: the type parameter appears at least twice, and one of those
// places is the return type or a second argument. That is what "linking" means — the caller's
// type is carried through to the answer instead of being read once and forgotten.

<!-- cell: markdown -->
That is topic 14. You can write generic functions, types, interfaces and classes, constrain a
type parameter to what the body needs, read properties by name with `keyof`, and tell a
generic that earns its place from one that only looks clever. Topic 15 uses all of it: the
utility types TypeScript ships with are generics someone already wrote for you.
