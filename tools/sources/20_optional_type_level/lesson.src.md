<!-- cell: markdown -->
# TypeScript — Type-level TypeScript (optional)

> **How these notebooks work**
>
> - This topic is **optional**. Nothing in the course depends on it, and no mini-project uses
>   it.
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../20_optional_type_level/lesson.ipynb
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
## LESSON 74 — Conditional types

### Explanation

A **conditional type** chooses between two types:

```typescript
type Label<T> = T extends string ? "text" : "other";
```

`extends` here means *is assignable to*, not class inheritance. It is an `if` that the compiler
evaluates while checking; nothing runs.

Its usual job is to tie one type to another — a file format, and the options that format needs:

```typescript
type Options<T extends Format> = T extends "csv" ? { separator: string } : { indent: number };
```

`Options<"csv">` is `{ separator: string }`: one type parameter decides the rest, so a caller
who names the format cannot pass the wrong options.

**Unions distribute.** When the checked type is a bare type parameter and you hand it a union,
the check runs on each member and the results are joined:

```typescript
type Textual<T> = T extends "pdf" ? never : T;
type Kept = Textual<"csv" | "json" | "pdf">; // "csv" | "json"
```

`never` is the empty union, so a branch that produces it simply disappears. That is exactly how
`Exclude` (LESSON 59) is defined:

```typescript
type Exclude<T, U> = T extends U ? never : T;
```

You have been using conditional types since topic 15 without writing one.

To compare the union as a whole instead of member by member, wrap both sides in brackets:
`[T] extends ["pdf"] ? "only pdf" : "something else"`.

**What they cost.** Inside a generic function `T` is not known yet, so `Options<T>` is still all
of its branches at once and you cannot read a property of it. Conditional types describe what
callers see; they do not make a function body easier to write.

### Key Notes

- `T extends U ? X : Y` is an `if` for types, and `extends` means "is assignable to".
- Use one to derive a type from another type, usually a literal one.
- A union handed to a bare type parameter distributes, member by member.
- Branches that give `never` vanish, which is all `Exclude` is.
- `[T] extends [U]` compares the union as a whole instead.

### Example

<!-- cell: code example -->
type L74Format = "csv" | "json" | "pdf";

type L74Options<T extends L74Format> = T extends "csv"
  ? { separator: string }
  : T extends "json"
    ? { indent: number }
    : { pageSize: string };

const l74Csv: L74Options<"csv"> = { separator: ";" };
const l74Json: L74Options<"json"> = { indent: 2 };
const l74Pdf: L74Options<"pdf"> = { pageSize: "A4" };

type L74Textual<T> = T extends "pdf" ? never : T;

const l74Formats: L74Format[] = ["csv", "json", "pdf"];
const l74Written: L74Textual<L74Format>[] = l74Formats.filter((format) => format !== "pdf");

// prints ; 2 A4
console.log(`${l74Csv.separator} ${l74Json.indent} ${l74Pdf.pageSize}`);

// prints csv,json
console.log(l74Written.join(","));

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Object literal may only specify known properties, and 'separator' does not exist in type '{ indent: number; }'.
const l74WrongOptions: L74Options<"json"> = { separator: ";" };

function l74Describe<T extends L74Format>(format: T, options: L74Options<T>): string {
  // Compiler: Property 'separator' does not exist on type '{ separator: string; } | { indent: number; } | { pageSize: string; }'.
  //   Property 'separator' does not exist on type '{ indent: number; }'.
  return `${format} ${options.separator}`;
}

// prints csv ; — T is open inside the function, so the compiler sees all three branches at once
console.log(l74Describe("csv", { separator: ";" }));

<!-- cell: markdown -->
### Exercise

Notification channels, where each channel needs a different kind of target.

1. Run `check:nb` and fix the three `[to fix]` errors.
2. `L74Target<T>` gives `{ address: string }` for `"email"`, `{ phone: string }` for `"sms"`
   and `{ deviceId: string }` for `"push"`.
3. `L74Long<T>` keeps the channels that can carry a long message — every one except `"sms"`.
4. Each send function returns its target's own field, then `": "`, then the text.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L74Channel = "email" | "sms" | "push";

// TODO: sms needs a phone number, push needs a device id
type L74Target<T extends L74Channel> = T extends "email"
  ? { address: string }
  : { address: string };

// TODO: which channels carry a long message?
type L74Long<T> = T extends "sms" ? T : never;

const l74Inbox: L74Target<"email"> = { address: "ada@example.com" };
const l74Phone: L74Target<"sms"> = { phone: "+39 340 1122334" };
const l74Device: L74Target<"push"> = { deviceId: "d-77" };

function l74Mail(target: L74Target<"email">, text: string): string {
  return `${target.address}: ${text}`;
}

function l74Sms(target: L74Target<"sms">, text: string): string {
  // TODO: the phone number, then the text
  return text;
}

function l74Push(target: L74Target<"push">, text: string): string {
  // TODO: the device id, then the text
  return text;
}

function l74LongOnly(channels: L74Channel[]): L74Long<L74Channel>[] {
  return channels.filter((channel) => channel !== "sms");
}

console.log(l74Mail(l74Inbox, "Statement ready"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 74 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["the email target keeps its address", l74Mail(l74Inbox, "Statement ready"), "ada@example.com: Statement ready"],
  ["the sms target keeps its phone number", l74Sms(l74Phone, "Code 4417"), "+39 340 1122334: Code 4417"],
  ["the push target keeps its device id", l74Push(l74Device, "Payment received"), "d-77: Payment received"],
  ["only the channels that carry a long message", l74LongOnly(["email", "sms", "push"]), ["email", "push"]],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. What is `L74Target<L74Channel>` — the whole union handed to the type — and why?
2. `L74Long<T>` written as `[T] extends ["sms"] ? never : T` behaves differently. What would
   `L74Long<L74Channel>` be then, and when would you want that form?
3. `Exclude<T, U>` is `T extends U ? never : T`. Why is `Exclude<"a" | "b", "a">` just `"b"`,
   rather than `never | "b"`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 75 — Mapped types

### Explanation

A **mapped type** builds an object type by walking the keys of another one:

```typescript
type Flags<T> = { [K in keyof T]: boolean };
```

`K in keyof T` loops over the key names; what follows the `:` is the new value type, and `T[K]`
is the old one. `Flags<Account>` has the same keys as `Account`, all of them `boolean`.

**The keys keep the modifiers they had.** Map a type whose `sku` is `readonly` and whose
`discount` is optional, and the result still has a readonly `sku` and an optional `discount` —
the line above says nothing about either. That is why modifiers can be **taken away** as well
as added, with a minus sign: `-?` makes every property required, `-readonly` makes every
property writable.

The utility types of topic 15 are written exactly this way:

```typescript
type Partial<T> = { [K in keyof T]?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
```

Both kinds of change can appear at once, which is how a form's draft is described:
`{ -readonly [K in keyof T]?: T[K] }` — nothing is fixed, and nothing is compulsory yet.

**The source need not be `keyof T`.** Any union of keys can be mapped, and doing so is
`Record`:

```typescript
type Record<K extends string, V> = { [P in K]: V };
```

**When to stop.** A mapped type earns its place when the derived type has to follow its source:
add a field to `Account` and every derived type follows. If you need three fields of one type
in one place, `Pick` already says that, and a hand-written object type says it more plainly
still.

### Key Notes

- `{ [K in keyof T]: X }` walks the keys of `T`, and `T[K]` is the original value type.
- Mapped keys keep the `readonly` and `?` they had unless you change them.
- Add a modifier by writing it, remove one with `-readonly` or `-?`.
- `Partial`, `Readonly`, `Required` and `Record` are all mapped types.
- Use one when a type must follow its source; otherwise write the type out.

### Example

<!-- cell: code example -->
type L75Account = {
  readonly iban: string;
  owner: string;
  balance: number;
};

type L75Touched<T> = { [K in keyof T]: boolean };
type L75Draft<T> = { -readonly [K in keyof T]?: T[K] };

const l75Account: L75Account = { iban: "IT60 0542 8111", owner: "Ada", balance: 1250 };
const l75Touched: L75Touched<L75Account> = { iban: false, owner: true, balance: true };

const l75Draft: L75Draft<L75Account> = { owner: "Grace" };
l75Draft.iban = "IT60 0542 9999";

function l75Changed(touched: L75Touched<L75Account>): string {
  return Object.entries(touched)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
    .join(",");
}

// prints owner,balance
console.log(l75Changed(l75Touched));

// prints Grace IT60 0542 9999 — the draft dropped both the readonly and the required
console.log(`${l75Draft.owner} ${l75Draft.iban}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Cannot assign to 'iban' because it is a read-only property.
l75Account.iban = "IT60 0542 9999";

// Compiler: Property 'balance' is missing in type '{ iban: false; owner: true; }' but required in type 'L75Touched<L75Account>'.
const l75Half: L75Touched<L75Account> = { iban: false, owner: true };

// prints IT60 0542 9999 — readonly is checked, not enforced: the assignment above really ran
console.log(l75Account.iban);

<!-- cell: markdown -->
### Exercise

One product type, and the two shapes around it: what an edit form may send, and what a printed
line needs.

1. Run `check:nb` and fix the three `[to fix]` errors.
2. `L75Editable<T>` makes every property writable and optional.
3. `L75Full<T>` leaves nothing optional.
4. `l75Apply` returns a new product taking every field the patch names, and the product's own
   value for the rest.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L75Product = {
  readonly sku: string;
  name: string;
  price: number;
  discount?: number;
};

// TODO: every property writable and optional
type L75Editable<T> = { [K in keyof T]: T[K] };

// TODO: nothing optional any more
type L75Full<T> = { [K in keyof T]?: T[K] };

const l75Desk: L75Product = { sku: "p-1", name: "Desk", price: 199 };
const l75Edits: L75Editable<L75Product> = { name: "Standing desk", price: 249 };
const l75Ready: L75Full<L75Product> = {
  sku: "p-1",
  name: "Standing desk",
  price: 249,
  discount: 20,
};

function l75Apply(product: L75Product, edits: L75Editable<L75Product>): L75Product {
  // TODO: each field the patch names, and the product's own value for the rest
  return product;
}

function l75Line(full: L75Full<L75Product>): string {
  return `${full.name} ${full.price.toFixed(2)} -${full.discount.toFixed(2)}`;
}

console.log(l75Line(l75Ready));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 75 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l75Edited = l75Apply(l75Desk, l75Edits);

checkAll([
  ["the patch replaces the name", l75Edited.name, "Standing desk"],
  ["and the price", l75Edited.price, 249],
  ["a field the patch leaves out keeps its value", l75Edited.sku, "p-1"],
  ["a field missing from both stays undefined", l75Edited.discount, undefined],
  ["the printed line", l75Line(l75Ready), "Standing desk 249.00 -20.00"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `L75Editable<L75Product>` and `Partial<L75Product>` are almost the same type. What is the
   one difference, and when would it matter?
2. `L75Full<T>` applied to a type that has no optional property at all — what does the `-?`
   do there?
3. `L75Touched<T>` in the Example is written `{ [K in keyof T]: boolean }` and says nothing
   about `readonly` or `?`. Why does `L75Touched<L75Product>` still have a readonly `sku` and
   an optional `discount`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 76 — `infer`

### Explanation

`infer` names a type that the compiler works out from a pattern. It may appear only in the
`extends` part of a conditional type:

```typescript
type ElementOf<T> = T extends (infer U)[] ? U : never;
type Row = ElementOf<string[]>; // string
```

Read it as a question with a blank in it: "is `T` an array of something? If so, call that
something `U`." When the pattern does not match, the false branch is used, and `never` is the
usual choice.

The same trick reaches inside a function type:

```typescript
type Result<T> = T extends (...args: never[]) => infer R ? R : never;
```

which is what `ReturnType` (LESSON 60) already is. The standard library writes it with `any`,
because it has to accept every function there is:

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

Patterns can be structural, and may contain more than one blank: `[infer F, ...unknown[]]`
captures the first member of a tuple and ignores the rest.

**Where it pays.** `ReturnType<typeof loadAccount>` keeps a type in step with the function that
produces it. Change the function, and the type follows; there is no second definition to
remember.

**Where it does not.** The pattern has to match exactly. `() => infer R` means "a function that
takes no arguments", so handing it a function of two parameters gives `never` — quietly, until
something reads a property of it. A plain named return type beats a clever pattern.

### Key Notes

- `infer U` names a blank in a pattern, and only inside a conditional type's `extends`.
- `T extends (infer U)[] ? U : never` is "the element type of `T`".
- `ReturnType` and `Parameters` are conditional types with `infer` inside them.
- A pattern that does not match falls to the false branch, usually `never`.
- Use it to keep a type in step with a function, not to build a puzzle.

### Example

<!-- cell: code example -->
const l76Rates: [string, number][] = [["EUR", 1], ["USD", 1.08], ["GBP", 0.85]];

type L76Element<T> = T extends (infer U)[] ? U : never;
type L76Rate = L76Element<typeof l76Rates>;

function l76Load(): { base: string; rates: L76Rate[] } {
  return { base: "EUR", rates: l76Rates };
}

type L76Snapshot = ReturnType<typeof l76Load>;

function l76Codes(snapshot: L76Snapshot): string {
  return snapshot.rates.map(([code]) => code).join(",");
}

const l76Snapshot: L76Snapshot = l76Load();

// prints EUR,USD,GBP
console.log(l76Codes(l76Snapshot));

// prints EUR 3
console.log(`${l76Snapshot.base} ${l76Snapshot.rates.length}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l76Convert(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

type L76NarrowResult<T> = T extends () => infer R ? R : never;

// Compiler: Type '12' is not assignable to type 'never'.
const l76Missed: L76NarrowResult<typeof l76Convert> = 12;

// Compiler: Type '"EUR"' is not assignable to type 'never'.
const l76NotAnArray: L76Element<string> = "EUR";

// prints 108 — nothing is wrong with the function; the pattern above was too narrow
console.log(l76Convert(100, 1.08));

<!-- cell: markdown -->
### Exercise

An order, stored as tuples of label, quantity and unit price.

1. Run `check:nb` and fix the five `[to fix]` errors.
2. `L76Item<T>` is one element of an array.
3. `L76Label<T>` is the first member of a tuple, whatever follows it.
4. `L76Out<T>` is the result of a function, whatever parameters it takes.
5. `l76Total` counts every quantity, and adds up quantity times price for each line.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
const l76Lines: [string, number, number][] = [
  ["Desk", 2, 199],
  ["Lamp", 1, 49],
  ["Chair", 4, 89],
];

// TODO: one element of an array
type L76Item<T> = T extends (infer U)[] ? U[] : never;

// TODO: the first member of a tuple, whatever follows it
type L76Label<T> = T extends [infer F] ? F : never;

// TODO: the result of a function, whatever parameters it takes
type L76Out<T> = T extends () => infer R ? R : never;

const l76Basket: L76Item<typeof l76Lines>[] = l76Lines;
const l76FirstLabel: L76Label<[string, number, number]> = "Desk";

function l76Total(lines: L76Item<typeof l76Lines>[]): { count: number; amount: number } {
  // TODO: add up the quantities, and quantity times price for each line
  return { count: 0, amount: 0 };
}

const l76Summary: L76Out<typeof l76Total> = l76Total(l76Basket);

function l76Report(summary: L76Out<typeof l76Total>): string {
  return `${summary.count} items, ${summary.amount.toFixed(2)}`;
}

console.log(l76Report(l76Summary));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 76 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l76Counted = l76Total(l76Basket);

checkAll([
  ["every quantity is counted", l76Counted.count, 7],
  ["the lines add up", l76Counted.amount, 803],
  ["the first member of the tuple is its label", l76FirstLabel, "Desk"],
  ["the report line", l76Report(l76Summary), "7 items, 803.00"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. Why does `L76Out` need `(...args: never[]) => infer R` rather than `() => infer R`? Say what
   the compiler is asking when it matches the pattern.
2. What is `L76Item<string>`, and why?
3. `ReturnType<typeof l76Total>` already exists in the standard library. So when is writing a
   pattern of your own actually worth it?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 77 — Template literal types

### Explanation

A **template literal type** describes the shape of a string:

```typescript
type Iban = `IT${string}`;
```

Only a string that begins with `IT` is assignable to it.

Put a union inside, and it multiplies out:

```typescript
type Area = "payment" | "login";
type Level = "info" | "error";
type Topic = `${Area}.${Level}`;
// "payment.info" | "payment.error" | "login.info" | "login.error"
```

Four members from two unions. Errors then list every one of them, and the compiler offers a
"Did you mean" suggestion when the string it was given is close.

Four built-in helpers change case: `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize`.

The real payoff is **renaming keys** in a mapped type, with an `as` clause:

```typescript
type Getters<T> = { [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] };
```

`K & string` is needed because `keyof T` is `string | number | symbol`, and only a string fits
in a template. A key whose new name works out to `never` is **dropped** — which is how a
mapping filters keys out.

**The cost is size.** Two unions of ten members make a hundred; three make a thousand. The type
still works, but every error message lists them and editors grow slow. Use a template literal
type when the strings really are a pattern — event names, prefixed keys, a small set of routes
— and write the union out by hand when there are only a few.

### Key Notes

- A template literal type describes a string's shape: `` `IT${string}` ``.
- A union inside it multiplies out into every combination.
- `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize` change case.
- `as` renames a mapped key, and a key renamed to `never` disappears.
- Keep the combinations small; the compiler will not stop you.

### Example

<!-- cell: code example -->
type L77Area = "payment" | "login";
type L77Level = "info" | "error";
type L77Topic = `${L77Area}.${L77Level}`;

type L77Session = { user: string; attempts: number };
type L77Getters<T> = { [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] };
type L77Strings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };

const l77Getters: L77Getters<L77Session> = {
  getUser: () => "ada",
  getAttempts: () => 2,
};

const l77Named: L77Strings<L77Session> = { user: "ada" };

function l77Log(topic: L77Topic): string {
  return `[${topic}]`;
}

// prints [payment.error] ada 2
console.log(`${l77Log("payment.error")} ${l77Getters.getUser()} ${l77Getters.getAttempts()}`);

// prints ada 1 — attempts is a number, so its key was mapped to never and dropped
console.log(`${l77Named.user} ${Object.keys(l77Named).length}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Type '"payment:error"' is not assignable to type '"payment.info" | "payment.error" | "login.info" | "login.error"'. Did you mean '"payment.error"'?
const l77WrongSeparator: L77Topic = "payment:error";

// Compiler: Object literal may only specify known properties, and 'user' does not exist in type 'L77Getters<L77Session>'.
const l77NotRenamed: L77Getters<L77Session> = { user: () => "ada", getAttempts: () => 2 };

// prints [login.info] — that topic is spelled the way the type asks
console.log(l77Log("login.info"));

<!-- cell: markdown -->
### Exercise

A small delivery board: a slot name built from two unions, and a setter for every field.

1. Run `check:nb` and fix the four `[to fix]` errors.
2. `L77Slot` is `"<channel>/<state>"`, for example `"email/queued"`.
3. `L77Setters<T>` gives every key a setter named `set<Field>`, taking that field's own type.
4. `l77Slot(channel, state)` builds the slot name from its two arguments.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L77Channel = "email" | "sms";
type L77State = "queued" | "sent";

// TODO: "<channel>/<state>"
type L77Slot = `${L77Channel}-${L77State}`;

type L77Board = { owner: string; pending: number };

// TODO: rename every key to set<Field>
type L77Setters<T> = { [K in keyof T]: (value: T[K]) => string };

const l77Setters: L77Setters<L77Board> = {
  setOwner: (value: string) => `owner=${value}`,
  setPending: (value: number) => `pending=${value}`,
};

function l77Slot(channel: L77Channel, state: L77State): L77Slot {
  // TODO: join the two with a slash
  return "email/queued";
}

function l77Apply(setters: L77Setters<L77Board>, owner: string, pending: number): string {
  return `${setters.setOwner(owner)} ${setters.setPending(pending)}`;
}

console.log(l77Apply(l77Setters, "Ada", 3));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 77 must have no `[to fix]` errors left.

<!-- cell: code verification -->
checkAll([
  ["the slot name joins the two with a slash", l77Slot("sms", "sent"), "sms/sent"],
  ["and does the same for the other channel", l77Slot("email", "queued"), "email/queued"],
  ["every setter is named and applied", l77Apply(l77Setters, "Ada", 3), "owner=Ada pending=3"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `L77Slot` has four members. If a third union of three priorities were added to the template,
   how many would it have, and what would you notice first?
2. Why is `K & string` needed in `` `set${Capitalize<K & string>}` ``?
3. What happens to a key whose `as` clause works out to `never`, and what is that useful for?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 78 — Combining features, and when it becomes too much

### Explanation

Nothing new here. The four features of this topic compose, and this lesson is about deciding
how far to take them.

One combination is worth learning, because it appears in real code. Start from a record of
commands and derive the API that sends them:

```typescript
type Api<T> = { [K in keyof T as `send${Capitalize<K & string>}`]: (input: T[K]) => string };
```

That is a mapped type, a template literal, a case helper and an indexed access in one line. Add
one command to the record and the API grows a method; misspell one and the compiler says so.

**When it earns its place**

- The source changes, and everything derived from it has to keep up.
- There are many members. Two handlers written by hand are clearer than any type function;
  twenty are not.
- You are describing code you do not own — a library, an API schema, someone else's config.

**When to write it out instead**

- **You cannot say it in one sentence.** That is the most reliable test here.
- **It does more than one job.** Name the steps; those names are what error messages show.
- **The error lands somewhere else.** A derived type is reported where it is *used*, which can
  be far from the line that was wrong — as every lesson in this topic has shown.
- **The shape is yours to change.** Library authors compute types because they cannot edit
  their callers. In your own application you can just change the type.

Type-level programming is a tool for the few percent of code that describes other code. The
rest of a program is better served by a clear object type and a function that does one thing.

### Key Notes

- Mapped, conditional, template literal and `infer` all compose.
- A derived type pays when the source changes, or when there are many members.
- If you cannot say the type in one sentence, write it out by hand.
- Name intermediate steps; error messages will show those names.
- Compute types when you cannot edit the source; otherwise edit the source.

### Example

<!-- cell: code example -->
type L78Commands = {
  pay: { amount: number };
  refund: { amount: number; reason: string };
};

type L78Api<T> = { [K in keyof T as `send${Capitalize<K & string>}`]: (input: T[K]) => string };

const l78Api: L78Api<L78Commands> = {
  sendPay: (input) => `pay ${input.amount}`,
  sendRefund: (input) => `refund ${input.amount} (${input.reason})`,
};

// The same two methods, written out. Four lines, and nothing to work out.
type L78PlainApi = {
  sendPay: (input: { amount: number }) => string;
  sendRefund: (input: { amount: number; reason: string }) => string;
};

const l78Plain: L78PlainApi = l78Api;

// prints pay 50 refund 20 (damaged)
console.log(`${l78Api.sendPay({ amount: 50 })} ${l78Plain.sendRefund({ amount: 20, reason: "damaged" })}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Object literal may only specify known properties, but 'sendpay' does not exist in type 'L78Api<L78Commands>'. Did you mean to write 'sendPay'?
const l78Typo: L78Api<L78Commands> = {
  sendpay: (input: { amount: number }) => `pay ${input.amount}`,
  sendRefund: (input: { amount: number; reason: string }) => `refund ${input.amount}`,
};

// prints pay 50 — the object above is a perfectly good object; only its key name is wrong
console.log(l78Api.sendPay({ amount: 50 }));

<!-- cell: markdown -->
### Exercise

Two derived types worth having, and one written out by hand on purpose.

1. Run `check:nb` and fix the two `[to fix]` errors.
2. `L78Handlers<T>` gives one handler per event, named `on<Event>`, taking that event's own
   payload and returning a string.
3. `L78PayloadOf<T>` is the payload type a handler takes, whatever it is.
4. `l78Run` calls both handlers and reports how many lines came back and their joined text,
   separated by `" | "`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
type L78Events = {
  deposit: { amount: number };
  close: { reason: string };
};

// TODO: one handler per event, named on<Event>
type L78Handlers<T> = { [K in keyof T]: (payload: T[K]) => string };

// TODO: the payload type a handler takes, whatever it is
type L78PayloadOf<T> = T extends (payload: string) => string ? string : never;

type L78Deposit = (payload: { amount: number }) => string;

const l78Payload: L78PayloadOf<L78Deposit> = { amount: 100 };

const l78Handlers: L78Handlers<L78Events> = {
  onDeposit: (payload: { amount: number }) => `deposit ${payload.amount}`,
  onClose: (payload: { reason: string }) => `close ${payload.reason}`,
};

// Written out by hand on purpose — see the Mini Challenge.
type L78Report = { lines: number; text: string };

function l78Run(handlers: L78Handlers<L78Events>, amount: number, reason: string): L78Report {
  // TODO: call both handlers, then report how many lines and their joined text
  return { lines: 0, text: "" };
}

console.log(l78Run(l78Handlers, 100, "moved").text);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 78 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l78Result = l78Run(l78Handlers, 100, "moved");

checkAll([
  ["both handlers ran", l78Result.lines, 2],
  ["and their text is joined", l78Result.text, "deposit 100 | close moved"],
  ["the payload type is the handler's own", l78Payload, { amount: 100 }],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below. For each one, say what you would write and why.

1. `L78Report` has two fields and is used once. Should it be derived from something?
2. The event record grows from two events to thirty, and two more are added every month. Does
   that change your answer about `L78Handlers`?
3. You need "the same object, but every field is a string" for a form, in one screen of one
   application. Mapped type, or four lines written out?
4. You are writing a library, and callers hand you an object of functions. You need the type of
   what one of them returns. Which feature of this topic does the work — and should you write
   the pattern out yourself?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
