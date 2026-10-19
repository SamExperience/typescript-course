<!-- cell: markdown -->
# TypeScript — Generics

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../14_generics/lesson.ipynb
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
## LESSON 51 — Why generics exist, and generic functions

### Explanation

You need "the first item of a list". The list may hold amounts, references or accounts. With
what you know so far there are three ways, and all three cost something:

- one function per type — the same code three times;
- `items: unknown[]` returning `unknown` — the caller gets a value it can't use until it checks
  it (`'u' is of type 'unknown'.`, TS18046);
- `items: (number | string)[]` — the result is a union, even when you passed only numbers.

The missing idea is a **link** between what goes in and what comes out. A **type parameter**
says it:

```typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

`T` is a name for a type the caller decides. `first([10, 20])` fills `T` with `number` and
returns `number | undefined`; `first(["a"])` returns `string | undefined`. You can write it
yourself — `first<string>(["a"])` — but inference from the argument is usually enough, and a
type argument that disagrees with the value is reported (TS2345).

Inside the function, `T` promises nothing beyond "some type". `items[0].toFixed(2)` gives
`Property 'toFixed' does not exist on type 'T'.` (TS2339), and returning anything that isn't a
`T` gives `Type 'number' is not assignable to type 'T'.` with the reason: `'T' could be
instantiated with an arbitrary type which could be unrelated to 'number'.` Saying more about
`T` is LESSON 54.

A generic function also passes `T` into its callbacks: in `keepIf(items: T[], keep: (item: T)
=> boolean)`, the arrow you write at the call site already knows its parameter type.

**When to reach for one:** when a function does the same work for several types and the caller
should keep the type it started with. One `T`, one job. If a function only ever handles
accounts, `Account[]` says more.

### Key Notes

- `function name<T>(...)` declares a type parameter the caller fills in.
- Inference from the arguments usually decides `T`; an explicit `<string>` is checked too.
- A generic keeps the caller's type; `unknown` throws it away and a union widens it.
- Inside, `T` has no members of its own (TS2339 for anything you try).
- Reach for a generic when one function serves several types, not by default.

### Example

<!-- cell: code example -->
function l51First<T>(items: T[]): T | undefined {
  return items[0];
}

function l51KeepIf<T>(items: T[], keep: (item: T) => boolean): T[] {
  return items.filter(keep);
}

type L51Movement = { reference: string; amount: number };

const l51Amounts: number[] = [40.7, 120.1, 2.15];
const l51Movements: L51Movement[] = [
  { reference: "M-1", amount: 40.7 },
  { reference: "M-2", amount: 120.1 },
];

const l51FirstAmount: number | undefined = l51First(l51Amounts);
const l51Big = l51KeepIf(l51Movements, (movement) => movement.amount > 100);

// prints 40.7 M-2
console.log(`${l51FirstAmount} ${l51First(l51Big)?.reference}`);

// prints 2 1
console.log(`${l51KeepIf(l51Amounts, (amount) => amount > 3).length} ${l51Big.length}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l51Total<T>(items: T[]): string {
  // Compiler: Property 'toFixed' does not exist on type 'T'.
  return items[0].toFixed(2);
}

// Compiler: Property 'length' does not exist on type 'number'.
const l51Wrong = l51KeepIf(l51Amounts, (amount) => amount.length > 1);

// prints 3 — T is number here, so the callback's parameter is a number
console.log(l51KeepIf(l51Amounts, (amount) => amount > 0).length);

<!-- cell: markdown -->
### Exercise

Three helpers a statement report needs. Each one must work for any kind of list: amounts,
references, or movement objects.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `l51FirstOf(items)` returns the first item, or `undefined` for an empty list.
3. `l51LastTwo(items)` returns the last two items, or fewer if the list is shorter.
4. `l51Keep(items, keep)` returns the items the `keep` function accepts.
5. Every one of them keeps the caller's type: `l51FirstOf(amounts)` must be a
   `number | undefined`, not `unknown`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L51Payment = { reference: string; amount: number };

function l51FirstOf<T>(items: T[]): T | undefined {
  // TODO: the first item, or undefined
  return items.length;
}

function l51LastTwo<T>(items: T[]): T[] {
  // TODO: the last two items, or fewer
  return [];
}

function l51Keep<T>(items: T[], keep: (item: T) => boolean): T[] {
  // TODO: the items the keep function accepts
  return [];
}

const l51Payments: L51Payment[] = [
  { reference: "P-1", amount: 40.7 },
  { reference: "P-2", amount: 120.1 },
  { reference: "P-3", amount: 2.15 },
];

const l51References: string[] = l51LastTwo<string>(l51Payments);

console.log(l51Payments.length);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 51 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. `l51FirstOf(l51Numbers)` has type `number | undefined`. What type would it have if the
   parameter were `unknown[]` instead, and what would the caller have to do before using the
   result?
2. The demo cell tries `items[0].toFixed(2)` inside a generic function and is reported. The
   value really is a number when the function is called with numbers. Why does the compiler
   refuse anyway?
3. Which of these should be generic, and which should not: a function that returns the last
   item of any list · a function that adds up a list of amounts · a function that returns the
   longer of two lists · a function that formats a payment for a receipt?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 52 — Generic types and interfaces

### Explanation

A type alias or an interface can take a type parameter too. The result type from LESSON 32 is
the clearest example: the shape never changes, only what it carries.

```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

interface Page<T> {
  readonly items: T[];
  readonly total: number;
}
```

`Result<number>` and `Result<Account>` are two types written once. Narrowing still works the
way LESSON 27 taught: after `if (result.ok)`, `result.value` is a `T`, and reading `error` on
the success branch is reported (TS2339).

- **The argument is part of the name.** Writing `Result` alone gives `Generic type 'Result'
  requires 1 type argument(s).` (TS2314) Same for two parameters, when you supply one.
- **Inference happens at function calls, not at annotations.** You write `Result<number>` in an
  annotation; but a function `firstResult<T>(items: T[]): Result<T>` fills `T` in from its
  argument, so `firstResult([1, 2])` is a `Result<number>` without you saying so.
- **A function type can be generic too**: `type Mapper<T, R> = (item: T) => R`, and
  `Mapper<string, number>` describes a function from a string to a number.

Nothing here is new machinery: the same `<T>` from LESSON 51, on a type instead of a function.
It is what stops a codebase from growing `NumberResult`, `AccountResult` and `PaymentResult`
side by side.

### Key Notes

- `type Name<T> = ...` and `interface Name<T> { ... }` take a type argument.
- Using the name without its argument is reported (TS2314).
- Annotations state the argument; function calls infer it.
- `type F<T, R> = (item: T) => R` describes a family of functions.
- One generic shape replaces a row of near-identical named types.

### Example

<!-- cell: code example -->
type L52Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

interface L52Page<T> {
  readonly items: T[];
  readonly total: number;
}

function l52FirstResult<T>(page: L52Page<T>): L52Result<T> {
  const found = page.items[0];
  if (found === undefined) {
    return { ok: false, error: "the page is empty" };
  }
  return { ok: true, value: found };
}

const l52Names: L52Page<string> = { items: ["Ada", "Grace"], total: 2 };
const l52Empty: L52Page<number> = { items: [], total: 0 };

const l52Name = l52FirstResult(l52Names);
const l52Amount = l52FirstResult(l52Empty);

// prints Ada / the page is empty
console.log(`${l52Name.ok ? l52Name.value : "-"} / ${l52Amount.ok ? l52Amount.value : l52Amount.error}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Generic type 'L52Result' requires 1 type argument(s).
const l52Bare: L52Result = { ok: true, value: 1 };

function l52ErrorOf(result: L52Result<number>): string {
  // Compiler: Property 'error' does not exist on type 'L52Result<number>'.
  return result.error;
}

// prints 2 — the page keeps its own type, whatever it holds
console.log(l52Names.total);

<!-- cell: markdown -->
### Exercise

A report reads amounts typed by a clerk and looks accounts up by IBAN. Both can fail, and both
report failure the same way.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `l52ParseAmount(text)` returns a failed result with the error `"no amount given"` for an
   empty text, `"not a number: abc"` for text that isn't a number, and otherwise a successful
   result with the amount rounded to 2 decimals.
3. `l52FindAccount(accounts, iban)` returns the matching account, or a failed result with the
   error `"no account with IBAN IT99"`.
4. `l52ValueOr(result, fallback)` returns the value of a successful result, or the fallback.
   It works for any kind of result.
5. `l52Describe(result, label)` returns `"amount: ok"` for a success, and
   `"amount: not a number: abc"` for a failure. It works for any kind of result too.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L52Account = { iban: string; owner: string };

const l52Accounts: L52Account[] = [
  { iban: "IT60", owner: "Ada" },
  { iban: "IT61", owner: "Grace" },
];

const l52NoAccount: L52Account = { iban: "-", owner: "nobody" };

const l52Nothing: L52Result = { ok: false, error: "nothing yet" };

function l52ParseAmount(text: string): L52Result<number> {
  // TODO: "no amount given", "not a number: abc", or the amount rounded to 2 decimals
  return { ok: true, value: text };
}

function l52FindAccount(accounts: L52Account[], iban: string): L52Result<L52Account> {
  // TODO: the matching account, or "no account with IBAN IT99"
  return { ok: false, error: "not implemented" };
}

function l52ValueOr<T>(result: L52Result<T>, fallback: T): T {
  // TODO: the value of a success, otherwise the fallback
  return fallback;
}

function l52Describe<T>(result: L52Result<T>, label: string): string {
  // TODO: "amount: ok" or "amount: not a number: abc"
  return label;
}

console.log(l52Describe(l52ParseAmount("40.70"), "amount"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 52 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. `l52ValueOr` and `l52Describe` are generic, but `l52ParseAmount` and `l52FindAccount` are
   not. Why is that the right split?
2. Without `L52Result<T>`, how many types would this exercise need, and what would change in
   `l52ValueOr`?
3. `l52Describe` never touches the value inside a successful result. What stops it from
   printing that value, and what would you need to do it?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 53 — Generic classes

### Explanation

A class can take a type parameter exactly as a function does, and every member can use it:

```typescript
class Ledger<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  last(): T | undefined {
    return this.items[this.items.length - 1];
  }
}
```

The caller decides what a ledger holds, at `new`: `new Ledger<string>()`, or
`new Cell(10)` when a constructor argument makes it obvious. From then on the instance is a
`Ledger<string>` and only strings go in — `add(7)` is reported as any wrong argument would be
(TS2345).

- **The name alone isn't a type.** `let ledger: Ledger` gives `Generic type 'Ledger<T>'
  requires 1 type argument(s).` (TS2314) — the same rule as LESSON 52.
- **`Ledger<string>` and `Ledger<number>` are different types**, so one cannot be assigned to
  the other (TS2322).
- **Static members can't use `T`.** A static belongs to the class itself, which exists once for
  every `T`: `Static members cannot reference class type parameters.` (TS2302)
- **A subclass can fill the argument in**: `class NoteLedger extends Ledger<string>` is a
  normal class whose `add` takes a string.

**When to reach for one:** when the class is *about* holding or handling something whose type
it doesn't care about — a store, a queue, a cache, a result box. When the class has rules of
its own about what it holds, like the accounts in topic 11, a concrete type says more.

### Key Notes

- `class Name<T>` makes every member able to use `T`.
- The argument is fixed at `new`, explicitly or by inference from a constructor argument.
- `Name` alone is not a type (TS2314); `Name<A>` and `Name<B>` are unrelated (TS2322).
- Static members cannot mention `T` (TS2302).
- Generic classes suit containers, not classes that have rules about their content.

### Example

<!-- cell: code example -->
class L53Ledger<T> {
  private items: T[] = [];

  constructor(public readonly name: string) {}

  public add(item: T): void {
    this.items.push(item);
  }

  public get count(): number {
    return this.items.length;
  }

  public last(): T | undefined {
    return this.items[this.items.length - 1];
  }

  public findBy(matches: (item: T) => boolean): T | undefined {
    return this.items.find(matches);
  }
}

type L53Movement = { reference: string; amount: number };

const l53Amounts = new L53Ledger<number>("amounts");
l53Amounts.add(40.7);
l53Amounts.add(120.1);

const l53Movements = new L53Ledger<L53Movement>("movements");
l53Movements.add({ reference: "M-1", amount: 40.7 });
l53Movements.add({ reference: "M-2", amount: 120.1 });

// prints 2 120.1 M-2
console.log(`${l53Amounts.count} ${l53Amounts.last()} ${l53Movements.findBy((movement) => movement.amount > 100)?.reference}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Argument of type 'string' is not assignable to parameter of type 'number'.
l53Amounts.add("40.70");

// Compiler: Generic type 'L53Ledger<T>' requires 1 type argument(s).
const l53Any: L53Ledger = l53Amounts;

class L53Broken<T> {
  // Compiler: Static members cannot reference class type parameters.
  public static first(): T {
    return "nothing";
  }
}

// prints amounts — the ledger itself is fine; only those three lines are wrong
console.log(l53Amounts.name);

<!-- cell: markdown -->
### Exercise

The bank batches operations before sending them: a batch holds up to a fixed number of items of
one kind, whatever kind that is.

1. Run `check:nb` and fix both `[to fix]` errors. One is a static member reaching for something
   it can't have; the other is a type used without its argument.
2. `add(item)` stores the item and returns `true`, or returns `false` and stores nothing when
   the batch is already full.
3. `size` reports how many items the batch holds, and `isFull` whether it is full.
4. `items()` returns everything in the batch, in the order it went in.
5. `find(matches)` returns the first item the `matches` function accepts, or `undefined`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L53Payment = { reference: string; amount: number };

class L53Batch<T> {
  private stored: T[] = [];

  constructor(
    public readonly label: string,
    private readonly limit: number,
  ) {}

  public static describe(): T {
    // TODO: a static member belongs to the class, so it can't mention T.
    // Return a plain description of what a batch is.
    return "a batch";
  }

  public add(item: T): boolean {
    // TODO: store it and return true, or return false when the batch is full
    return true;
  }

  public get size(): number {
    // TODO: how many items are stored
    return 0;
  }

  public get isFull(): boolean {
    // TODO: is the batch full?
    return false;
  }

  public items(): readonly T[] {
    // TODO: everything in the batch
    return [];
  }

  public find(matches: (item: T) => boolean): T | undefined {
    // TODO: the first item the matches function accepts
    return undefined;
  }
}

const l53Anything: L53Batch = new L53Batch<number>("anything", 2);

console.log(l53Anything.label);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 53 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. `L53Batch<string>` and `L53Batch<L53Payment>` come from one class. What would you have had
   to write without a type parameter, and what would `items()` return if you had used
   `unknown[]` instead?
2. `describe()` had to stop mentioning `T`. Explain why in terms of when a static member
   exists and how many batches share it.
3. Which of these deserve a type parameter: a queue of things waiting to be sent · a savings
   account · a cache of values looked up by name · a loan repayment schedule?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 54 — Constraints and `keyof`

### Explanation

LESSON 51 left `T` with no members at all, so a generic function could carry values around but
never look inside them. A **constraint** says the least `T` must be:

```typescript
function totalOf<T extends { amount: number }>(items: T[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}
```

`T extends { amount: number }` means "any type that has at least an `amount` number". Inside,
`item.amount` is allowed. Outside, the caller still keeps its own full type — `highest(payments)`
returns a `Payment`, not a `{ amount: number }`. An argument that doesn't fit is reported with
the reason: `Property 'amount' is missing in type '{ name: string; }' but required in type
'{ amount: number; }'.` (TS2345) A constraint can be an interface just as well:
`<T extends Billable>`.

**`keyof T`** is the union of `T`'s property names. It turns "read a property by name" into
something the compiler can check:

```typescript
function field<T, K extends keyof T>(item: T, key: K): T[K] {
  return item[key];
}
```

`K` is one of the keys, and `T[K]` is the type of *that* property. So
`field(payment, "amount")` is a `number` and `field(payment, "reference")` is a `string`, while
a misspelled key is reported: `Argument of type '"nmae"' is not assignable to parameter of type
'keyof Payment'.`

**How much to constrain:** exactly what the body reads, and nothing more. A constraint of
`{ amount: number }` works for payments, fees and movements alike; `<T extends Payment>` would
shut the door on the other two for no reason.

### Key Notes

- `<T extends Shape>` lets the body use `Shape`'s members and still returns the caller's type.
- A failing argument is reported with the missing part named (TS2345).
- `keyof T` is the union of `T`'s property names; `T[K]` is that property's type.
- A wrong key is a type error, not a runtime `undefined`.
- Constrain to what the body actually reads.

### Example

<!-- cell: code example -->
type L54Payment = { reference: string; amount: number; currency: "EUR" | "USD" };

function l54TotalOf<T extends { amount: number }>(items: T[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
}

function l54Field<T, K extends keyof T>(item: T, key: K): T[K] {
  return item[key];
}

const l54Payments: L54Payment[] = [
  { reference: "P-1", amount: 40.7, currency: "EUR" },
  { reference: "P-2", amount: 120.1, currency: "USD" },
  { reference: "P-3", amount: 2.15, currency: "EUR" },
];

const l54Fees: { code: string; amount: number }[] = [
  { code: "F-1", amount: 0.5 },
  { code: "F-2", amount: 1.81 },
];

const l54Reference: string = l54Field(l54Payments[0], "reference");
const l54Amount: number = l54Field(l54Payments[0], "amount");

// prints 162.95 2.31 P-1 40.7
console.log(`${l54TotalOf(l54Payments)} ${l54TotalOf(l54Fees)} ${l54Reference} ${l54Amount}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.
const l54Names = [{ name: "Ada" }];

// Compiler: Argument of type '{ name: string; }[]' is not assignable to parameter of type '{ amount: number; }[]'.
// prints NaN — without the constraint this would be a silent wrong total
console.log(l54TotalOf(l54Names));

// Compiler: Argument of type '"nmae"' is not assignable to parameter of type 'keyof L54Payment'.
const l54Typo = l54Field(l54Payments[0], "nmae");

function l54NoConstraint<T>(items: T[]): number {
  // Compiler: Property 'amount' does not exist on type 'T'.
  return items.reduce((sum, item) => sum + item.amount, 0);
}

<!-- cell: markdown -->
### Exercise

Report helpers that work for anything with an amount, and one that reads a field by name.

1. Run `check:nb` and fix both `[to fix]` errors by correcting the calls, not the functions.
2. `l54Total(items)` adds up the amounts of any list of things that have one, rounded to
   2 decimals.
3. `l54Largest(items)` returns the item with the highest amount, or `undefined` for an empty
   list. It returns the caller's own type, so `l54Largest(payments)?.reference` must work.
4. `l54Get(item, key)` returns the value of that property, with that property's type.
5. `l54Column(items, key)` returns the list of that property's values, in order.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L54Movement = { id: string; amount: number; madeOn: string };

const l54Movements: L54Movement[] = [
  { id: "M-1", amount: 40.7, madeOn: "2026-01-05" },
  { id: "M-2", amount: 120.1, madeOn: "2026-01-06" },
  { id: "M-3", amount: 2.15, madeOn: "2026-01-07" },
];

const l54Owners = [{ owner: "Ada" }, { owner: "Grace" }];

function l54Total<T extends { amount: number }>(items: T[]): number {
  // TODO: every amount added up, rounded to 2 decimals
  return 0;
}

function l54Largest<T extends { amount: number }>(items: T[]): T | undefined {
  // TODO: the item with the highest amount
  return undefined;
}

function l54Get<T, K extends keyof T>(item: T, key: K): T[K] {
  // TODO: the value of that property
  return item[key];
}

function l54Column<T, K extends keyof T>(items: T[], key: K): T[K][] {
  // TODO: that property's value for every item
  return [];
}

console.log(l54Total(l54Owners));
console.log(l54Get(l54Movements[0], "amuont"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 54 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. `l54Total` is constrained to `{ amount: number }`, not to `L54Movement`. Name two things
   that would stop working if it were constrained to `L54Movement` instead.
2. `l54Largest` returns `T | undefined` rather than `{ amount: number } | undefined`. Why does
   that matter to the caller?
3. `l54Get(movement, "amount")` returns a `number`, and `l54Get(movement, "id")` returns a
   `string`, from one function. Which part of the signature decides that, and what would the
   return type have to be without `keyof`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 55 — Practical patterns, and avoiding unnecessary generics

### Explanation

Almost every useful generic is one of four shapes:

- **A container** — `Batch<T>`, `Ledger<T>`: it holds things and doesn't care what they are.
- **A box with an outcome** — `Result<T>`: one shape, different contents.
- **A transformer** — `map(items: T[], change: (item: T) => R): R[]`: two type parameters,
  because the output type is genuinely a different one.
- **A constrained reader** — `<T extends { amount: number }>` or `keyof T`: the body reads a
  little, the caller keeps everything.

The useful test for whether a type parameter earns its place is simple: **does it appear at
least twice?** A parameter links two places — an argument to the result, two arguments to each
other, an argument to a callback. If `T` appears once, it links nothing:

```typescript
function describe<T extends { amount: number }>(item: T): string; // T appears once
function describe(item: { amount: number }): string; // the same thing, said plainly
```

Both accept the same arguments and both return a string. The first only looks harder.

Two more habits worth having:

- **One type parameter per job.** `<T, R>` in a transformer is two jobs — in, out. Four
  parameters usually means the function is doing too much.
- **A generic is not a way to avoid deciding.** If a function only ever handles payments,
  `Payment` says more than `T` and gives better errors.

Generics pay off when the same code serves several types *and the caller keeps its own*.
Everywhere else, a plain type is the clearer answer.

### Key Notes

- Four patterns cover most cases: container, result box, transformer, constrained reader.
- A type parameter that appears once can be replaced by its constraint.
- `<T, R>` is for a real transformation; more than two is a warning sign.
- A concrete type gives better errors than a `T` that never varies.
- Reach for a generic when the caller must keep its own type.

### Example

<!-- cell: code example -->
type L55Payment = { reference: string; amount: number };

// Worth a type parameter: the result type follows the callback.
function l55MapTo<T, R>(items: T[], change: (item: T) => R): R[] {
  return items.map(change);
}

// Not worth one: T appeared only in the parameter, so the constraint says it better.
function l55Describe(item: { amount: number }): string {
  return `${item.amount.toFixed(2)} EUR`;
}

const l55Payments: L55Payment[] = [
  { reference: "P-1", amount: 40.7 },
  { reference: "P-2", amount: 120.1 },
];

const l55References: string[] = l55MapTo(l55Payments, (payment) => payment.reference);
const l55Lengths: number[] = l55MapTo(["a", "bb"], (text) => text.length);

// prints P-1,P-2 1,2 40.70 EUR
console.log(`${l55References.join(",")} ${l55Lengths.join(",")} ${l55Describe(l55Payments[0])}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Type 'string[]' is not assignable to type 'number[]'.
const l55Wrong: number[] = l55MapTo(l55Payments, (payment) => payment.reference);

// Compiler: Argument of type 'string' is not assignable to parameter of type '{ amount: number; }'.
// Nothing calls l55Broken: the call inside it would also throw, because "40.70" has no amount.
function l55Broken(): string {
  return l55Describe("40.70");
}

// prints 2 — the mapped list is fine at runtime; only the annotation above it is wrong
console.log(l55Wrong.length);

<!-- cell: markdown -->
### Exercise

Three report helpers. Two of them need a type parameter; one of them only looks as if it does.

1. Run `check:nb` and fix both `[to fix]` errors by correcting the calls.
2. `l55Line(item)` returns `"40.70 EUR"`. Its type parameter appears exactly once — replace it
   with the constraint itself and keep the function working.
3. `l55Change(items, change)` returns the result of applying `change` to every item.
4. `l55ByAmount(items)` returns a **new** list ordered by amount, highest first, and leaves the
   original list untouched.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L55Movement = { id: string; amount: number };

const l55Movements: L55Movement[] = [
  { id: "M-1", amount: 40.7 },
  { id: "M-2", amount: 120.1 },
  { id: "M-3", amount: 2.15 },
];

function l55Line<T extends { amount: number }>(item: T): string {
  // TODO: "40.70 EUR" — and this one doesn't need its type parameter
  return "";
}

function l55Change<T, R>(items: T[], change: (item: T) => R): R[] {
  // TODO: change applied to every item
  return [];
}

function l55ByAmount<T extends { amount: number }>(items: T[]): T[] {
  // TODO: a new list, highest amount first
  return [];
}

const l55Ids: number[] = l55Change(l55Movements, (movement) => movement.id);

console.log(l55Line("40.70"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 55 must have no `[to fix]` errors left.

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

For each signature, say whether the type parameter earns its place. If it doesn't, write the
signature you would use instead.

- `count<T>(items: T[]): number`
- `pairUp<T>(left: T, right: T): [T, T]`
- `idOf<T extends { id: string }>(item: T): string`
- `pick<T, K extends keyof T>(item: T, key: K): T[K]`
- `save<T>(item: T): void`

Answer in comments in the cell below, then answer one more question: what do the signatures
that keep their type parameter have in common?

<!-- cell: code challenge -->
// count:
// pairUp:
// idOf:
// pick:
// save:
//
// What they have in common:
