<!-- cell: markdown -->
# TypeScript — Type-level TypeScript (optional)

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
## LESSON 74 — Conditional types

### Exercise

<!-- cell: code solution -->
type L74Channel = "email" | "sms" | "push";

type L74Target<T extends L74Channel> = T extends "email"
  ? { address: string }
  : T extends "sms"
    ? { phone: string }
    : { deviceId: string };

type L74Long<T> = T extends "sms" ? never : T;

const l74Inbox: L74Target<"email"> = { address: "ada@example.com" };
const l74Phone: L74Target<"sms"> = { phone: "+39 340 1122334" };
const l74Device: L74Target<"push"> = { deviceId: "d-77" };

function l74Mail(target: L74Target<"email">, text: string): string {
  return `${target.address}: ${text}`;
}

function l74Sms(target: L74Target<"sms">, text: string): string {
  return `${target.phone}: ${text}`;
}

function l74Push(target: L74Target<"push">, text: string): string {
  return `${target.deviceId}: ${text}`;
}

function l74LongOnly(channels: L74Channel[]): L74Long<L74Channel>[] {
  return channels.filter((channel) => channel !== "sms");
}

console.log(l74Mail(l74Inbox, "Statement ready")); // prints ada@example.com: Statement ready

<!-- cell: markdown -->
Three errors from two mistakes. The second branch of `L74Target` gave every remaining channel
an `address`, so both the sms and the push target were reported as object literals with an
unknown property; a nested conditional gives each channel its own shape. And `L74Long` was
written the wrong way round, so the compiler expected `"sms"[]` back from a function that
returns everything else.

Note where the second mistake was caught: not in the type, which is legal on its own, but at
the `return` that had to satisfy it.

**Common mistakes**

- **Adding a fourth branch for `"push"`.** After `"email"` and `"sms"`, it is the only channel
  left, so the last branch needs no check of its own.
- **Making `L74Long` take `T extends L74Channel`.** The constraint does no harm here, but the
  point of `L74Long` is that it filters *any* union — the same shape as `Exclude`.
- **Returning `channels.filter((channel) => channel === "email" || channel === "push")`.**
  It gives the right values, but it has to be edited every time a channel is added.
- **Reading `target.address` in all three functions.** Only one branch has it; the other two
  are reported.

### Verification

<!-- cell: code verification -->
checkAll([
  ["the email target keeps its address", l74Mail(l74Inbox, "Statement ready"), "ada@example.com: Statement ready"],
  ["the sms target keeps its phone number", l74Sms(l74Phone, "Code 4417"), "+39 340 1122334: Code 4417"],
  ["the push target keeps its device id", l74Push(l74Device, "Payment received"), "d-77: Payment received"],
  ["only the channels that carry a long message", l74LongOnly(["email", "sms", "push"]), ["email", "push"]],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. The union of all three shapes:
//    { address: string } | { phone: string } | { deviceId: string }.
//    T is a bare type parameter, so the union distributes: the conditional runs once per
//    member and the three results are joined. That is also why a generic function holding an
//    L74Target<T> cannot read any of the properties — until T is known, all three are possible.
//
// 2. L74Long<L74Channel> would be the whole L74Channel union, "sms" included. The brackets
//    stop the distribution, so the question becomes "is this entire union assignable to
//    ["sms"]?" — it is not, so the false branch returns T unchanged. The form is worth having
//    when the answer really is about the union as a whole: [T] extends [never] asks whether a
//    type is empty, which the distributive version cannot ask at all.
//
// 3. Because never is the empty union. Adding it to a union adds no members, so never | "b"
//    collapses to "b" — the same reason [] concat [1] is [1]. A branch that produces never is
//    how a conditional type says "drop this member".

<!-- cell: markdown -->
## LESSON 75 — Mapped types

### Exercise

<!-- cell: code solution -->
type L75Product = {
  readonly sku: string;
  name: string;
  price: number;
  discount?: number;
};

type L75Editable<T> = { -readonly [K in keyof T]?: T[K] };
type L75Full<T> = { [K in keyof T]-?: T[K] };

const l75Desk: L75Product = { sku: "p-1", name: "Desk", price: 199 };
const l75Edits: L75Editable<L75Product> = { name: "Standing desk", price: 249 };
const l75Ready: L75Full<L75Product> = {
  sku: "p-1",
  name: "Standing desk",
  price: 249,
  discount: 20,
};

function l75Apply(product: L75Product, edits: L75Editable<L75Product>): L75Product {
  return {
    sku: product.sku,
    name: edits.name ?? product.name,
    price: edits.price ?? product.price,
    discount: edits.discount ?? product.discount,
  };
}

function l75Line(full: L75Full<L75Product>): string {
  return `${full.name} ${full.price.toFixed(2)} -${full.discount.toFixed(2)}`;
}

console.log(l75Line(l75Ready)); // prints Standing desk 249.00 -20.00

<!-- cell: markdown -->
Three errors from two mistakes. `L75Editable` copied the product unchanged, so a patch naming
two fields was missing the third; `-readonly [K in keyof T]?` is what makes a patch a patch.
And `L75Full` made everything optional instead of required, so both `full.price` and
`full.discount` were reported as possibly `undefined`; `-?` is the modifier that was wanted.

Note that neither mistake was reported on the type itself. Both are legal types; the compiler
complained at the lines that had to satisfy them.

**Common mistakes**

- **Writing `L75Editable<T> = Partial<T>`.** Close, but `Partial` keeps the modifiers it does
  not change, so `sku` stays readonly and a draft built field by field cannot set it.
- **Returning `{ ...product, ...edits }` from `l75Apply`.** It gives the right answer here, but
  a patch that names `discount: undefined` would erase a real discount; `??` field by field
  says what is meant.
- **Reading `full.discount` and hoping.** Without `-?` the compiler reports it (TS18048), which
  is the whole reason for having `L75Full`.
- **Adding `-readonly` to `L75Full` as well.** Nothing asked for it. A printed line does not
  need to assign anything.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Only the readonly. Partial<T> is { [K in keyof T]?: T[K] }, which keeps every modifier it
//    does not mention, so Partial<L75Product> still has a readonly sku; L75Editable takes it
//    off with -readonly. It matters as soon as the draft is built up by assignment
//    (draft.sku = "p-2") rather than written as one object literal — with Partial that line is
//    reported, with L75Editable it is allowed.
//
// 2. Nothing at all. A minus modifier removes something that is there; on a type whose
//    properties are all required already, -? leaves the type exactly as it was. It is safe to
//    write, which is why Required<T> can be defined once for every T.
//
// 3. Because a mapped type over keyof T copies each key together with its modifiers, and only
//    the part after the colon is replaced. The mapping says the values are boolean; it says
//    nothing about readonly or ?, so both are carried over. Changing them is exactly what
//    readonly, ?, -readonly and -? are for.

<!-- cell: markdown -->
## LESSON 76 — `infer`

### Exercise

<!-- cell: code solution -->
const l76Lines: [string, number, number][] = [
  ["Desk", 2, 199],
  ["Lamp", 1, 49],
  ["Chair", 4, 89],
];

type L76Item<T> = T extends (infer U)[] ? U : never;
type L76Label<T> = T extends [infer F, ...unknown[]] ? F : never;
type L76Out<T> = T extends (...args: never[]) => infer R ? R : never;

const l76Basket: L76Item<typeof l76Lines>[] = l76Lines;
const l76FirstLabel: L76Label<[string, number, number]> = "Desk";

function l76Total(lines: L76Item<typeof l76Lines>[]): { count: number; amount: number } {
  let count = 0;
  let amount = 0;
  for (const [, quantity, price] of lines) {
    count = count + quantity;
    amount = amount + quantity * price;
  }
  return { count, amount };
}

const l76Summary: L76Out<typeof l76Total> = l76Total(l76Basket);

function l76Report(summary: L76Out<typeof l76Total>): string {
  return `${summary.count} items, ${summary.amount.toFixed(2)}`;
}

console.log(l76Report(l76Summary)); // prints 7 items, 803.00

<!-- cell: markdown -->
Five errors from three mistakes, and each mistake is the same kind: a pattern that does not
match what it is given.

- `(infer U)[] ? U[]` gave back an array of elements instead of one element, so a basket of
  lines became an array of arrays of lines.
- `[infer F]` matches a tuple of **exactly one** member, so a three-member tuple fell to the
  false branch and `"Desk"` was compared against `never`.
- `() => infer R` matches only a function that takes no arguments. `l76Total` takes one, so
  `L76Out<typeof l76Total>` was `never` — which is why the two reads inside `l76Report` were
  reported as well. `(...args: never[])` matches any parameter list.

**Common mistakes**

- **Writing `T extends unknown[] ? T[number] : never`.** It gives the right answer for an array
  and is a fine thing to know, but the exercise is about the pattern.
- **Using `...infer Rest` in `L76Label` and then ignoring `Rest`.** It works, but `...unknown[]`
  says "and anything else" without naming something unused.
- **Forgetting that `l76Total` must count quantities, not lines.** Three lines, seven items.
- **Reusing `ReturnType` for `L76Out`.** That is the honest production answer — see the third
  Mini Challenge question — but it skips the exercise.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Matching a pattern is an assignability question: "is this type assignable to the shape I
//    wrote?" A function of two parameters is NOT assignable to () => R — the compiler says the
//    target signature provides too few arguments — so the pattern misses and the false branch
//    wins. The reverse is allowed, which is why (...args: never[]) => infer R matches every
//    function, whatever it takes.
//
// 2. never. string is not an array, so T extends (infer U)[] fails and the false branch is
//    used. This is the quiet part of infer: nothing is reported where the type is written, only
//    later, wherever something tries to use the never it produced.
//
// 3. When the standard library has no name for the shape you are asking about. ReturnType and
//    Parameters cover functions, and Awaited covers promises; the element of an array, the
//    first member of a tuple, or the payload inside a domain type of your own have no
//    ready-made helper, and that is where a pattern earns its place. For a function result,
//    use ReturnType — writing it again by hand is one more thing to keep correct.

<!-- cell: markdown -->
## LESSON 77 — Template literal types

### Exercise

<!-- cell: code solution -->
type L77Channel = "email" | "sms";
type L77State = "queued" | "sent";

type L77Slot = `${L77Channel}/${L77State}`;

type L77Board = { owner: string; pending: number };

type L77Setters<T> = { [K in keyof T as `set${Capitalize<K & string>}`]: (value: T[K]) => string };

const l77Setters: L77Setters<L77Board> = {
  setOwner: (value: string) => `owner=${value}`,
  setPending: (value: number) => `pending=${value}`,
};

function l77Slot(channel: L77Channel, state: L77State): L77Slot {
  return `${channel}/${state}`;
}

function l77Apply(setters: L77Setters<L77Board>, owner: string, pending: number): string {
  return `${setters.setOwner(owner)} ${setters.setPending(pending)}`;
}

console.log(l77Apply(l77Setters, "Ada", 3)); // prints owner=Ada pending=3

<!-- cell: markdown -->
Four errors from two mistakes. The separator in `L77Slot` was a hyphen, so every slot name
spelled with a slash was compared against the four hyphenated members — including the one the
function returns. And `L77Setters` mapped the keys without renaming them, so the object naming
`setOwner` and `setPending` had unknown properties, and the two reads inside `l77Apply` had
nowhere to come from.

Notice that the compiler suggested the right spelling in the first case ("Did you mean
`"email-queued"`?"). It knows the whole union, because the template has already been multiplied
out.

**Common mistakes**

- **Writing `` `${channel}/${state}` `` but leaving `L77Slot` as a plain `string`.** The
  function would still run; nothing would be checked, which is the only reason for the type.
- **Renaming with `` `set${K}` `` and no `Capitalize`.** That gives `setowner`, which is not what
  the object literal says.
- **Forgetting `& string`.** `Capitalize<K>` alone is reported (TS2344): `keyof T` is
  `string | number | symbol`, and `Capitalize` only takes a string.
- **Giving every setter `(value: string)`.** `T[K]` is what keeps `setPending` taking a number.

### Verification

<!-- cell: code verification -->
checkAll([
  ["the slot name joins the two with a slash", l77Slot("sms", "sent"), "sms/sent"],
  ["and does the same for the other channel", l77Slot("email", "queued"), "email/queued"],
  ["every setter is named and applied", l77Apply(l77Setters, "Ada", 3), "owner=Ada pending=3"],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Twelve: 2 channels x 2 states x 3 priorities. Every combination is a separate member, so
//    the count multiplies rather than adds. What you notice first is the error messages — a
//    single mistyped slot now lists all twelve possibilities — and, in a real project, the
//    editor taking longer to offer them.
//
// 2. keyof T is not only string: a key can be a number or a symbol, and a symbol cannot be put
//    into a string template. K & string keeps just the string part of the key type, which is
//    the only part a name can be built from.
//
// 3. The key disappears from the mapped type. That makes the as clause a filter as well as a
//    renamer: { [K in keyof T as T[K] extends string ? K : never]: T[K] } keeps only the
//    properties whose values are strings, as the Example's L77Strings does.

<!-- cell: markdown -->
## LESSON 78 — Combining features, and when it becomes too much

### Exercise

<!-- cell: code solution -->
type L78Events = {
  deposit: { amount: number };
  close: { reason: string };
};

type L78Handlers<T> = {
  [K in keyof T as `on${Capitalize<K & string>}`]: (payload: T[K]) => string;
};

type L78PayloadOf<T> = T extends (payload: infer P) => string ? P : never;

type L78Deposit = (payload: { amount: number }) => string;

const l78Payload: L78PayloadOf<L78Deposit> = { amount: 100 };

const l78Handlers: L78Handlers<L78Events> = {
  onDeposit: (payload: { amount: number }) => `deposit ${payload.amount}`,
  onClose: (payload: { reason: string }) => `close ${payload.reason}`,
};

// Written out by hand on purpose — see the Mini Challenge.
type L78Report = { lines: number; text: string };

function l78Run(handlers: L78Handlers<L78Events>, amount: number, reason: string): L78Report {
  const lines = [handlers.onDeposit({ amount }), handlers.onClose({ reason })];
  return { lines: lines.length, text: lines.join(" | ") };
}

console.log(l78Run(l78Handlers, 100, "moved").text); // prints deposit 100 | close moved

<!-- cell: markdown -->
Two errors from two mistakes, one each. `L78Handlers` mapped the keys without renaming them, so
an object naming `onDeposit` had an unknown property. And `L78PayloadOf` asked for a handler
taking a `string`, which this one does not, so the pattern missed and `{ amount: 100 }` was
compared against `never`.

Both types put together everything in this topic: a mapped type with an `as` clause, a template
literal and `Capitalize` in the first; a conditional type with `infer` in the second. Neither is
longer than a line, and each can be said in a sentence — which is the test that matters.

Writing `L78PayloadOf` yourself is practice. In real code you would write
`Parameters<L78Deposit>[0]` (LESSON 60), which is the same type under a name the standard
library already maintains. Question 4 comes back to this.

**Common mistakes**

- **Counting the events instead of the lines.** `lines.length` is two here either way; a third
  event would show the difference.
- **Joining with `"|"` or `" |"`.** The brief says `" | "`, and the check compares the exact
  string.
- **Writing `L78PayloadOf<T> = T extends (payload: unknown) => string ? unknown : never`.**
  That matches, but it throws away the answer; `infer P` is what keeps it.
- **Deriving `L78Report` as well.** From what? It is two fields, used once. See question 1.

### Verification

<!-- cell: code verification -->
const l78Result = l78Run(l78Handlers, 100, "moved");

checkAll([
  ["both handlers ran", l78Result.lines, 2],
  ["and their text is joined", l78Result.text, "deposit 100 | close moved"],
  ["the payload type is the handler's own", l78Payload, { amount: 100 }],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. No. It has no source to follow — it is not "the report for these events", it is just two
//    fields — and it is read once. Deriving it would add a step for a reader to work through
//    and give the error messages a longer name to print, for nothing in return.
//
// 2. Yes, strongly. Thirty handlers written out is thirty chances to misspell one, and two new
//    ones a month means the list and the type drift apart. That is exactly the case the mapped
//    type is for: one source of truth, and the compiler reports the handler nobody wrote.
//
// 3. Four lines written out. One screen, one application, a shape you own: if it changes, you
//    change it. A mapped type here costs a reader the work of expanding it in their head, and
//    buys nothing that a compiler error would not have caught anyway.
//
// 4. infer, inside a conditional type — but do not write the pattern out. A function result
//    already has a name: ReturnType<F>, and Parameters<F>[0] for its first argument, both from
//    LESSON 60, and each one is this same conditional-with-infer under a name. Write your own
//    only when nothing in the standard library names the shape you want, as in LESSON 76. What
//    the utility types do not remove is the reason a computed type is needed at all: the object
//    is the caller's, not yours — you cannot write its type out, and you cannot ask them to
//    change it. That is the honest boundary of this whole topic: compute a type when you cannot
//    edit the source, and edit the source when you can.

<!-- cell: markdown -->
That is the end of the optional type-level topic, and of the course. You can read the four
features, write each of them, and — the part that takes longer to learn — say when a plain type
is the better answer.
