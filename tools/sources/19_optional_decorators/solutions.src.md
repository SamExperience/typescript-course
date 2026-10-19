<!-- cell: markdown -->
# TypeScript — Decorators (optional)

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
## LESSON 71 — What decorators are, and their syntax

### Exercise

<!-- cell: code solution -->
const l71Counts: Record<string, number> = {};

function l71Counted<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: Args) => Return {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    l71Counts[name] = (l71Counts[name] ?? 0) + 1;
    return target.call(this, ...args);
  };
}

class L71Wallet {
  private cash: number = 0;

  @l71Counted
  add(amount: number): number {
    this.cash = this.cash + amount;
    return this.cash;
  }

  @l71Counted
  spend(amount: number): number {
    this.cash = this.cash - amount;
    return this.cash;
  }
}

function l71CountOf(name: string): number {
  return l71Counts[name] ?? 0;
}

const l71Wallet = new L71Wallet();
l71Wallet.add(10);
console.log(l71CountOf("add")); // prints 1

<!-- cell: markdown -->
Three errors, two mistakes. `...args: string[]` in the returned function broke the promise the
decorator makes about every method it wraps, and the compiler said so at each `@` (TS1270) —
one cause, two reports, exactly as in LESSON 37. The third was `target.call(this)`, which drops
the arguments: `Argument of type '[]' is not assignable to parameter of type 'Args'.` (TS2345)

`Args` is what ties the three together: the wrapper takes the same arguments as the method and
passes them straight through.

**Common mistakes**

- **Writing the replacement as an arrow function.** An arrow has no `this` of its own, so the
  wrapped method loses the object it was called on.
- **Returning `target.call(this, args)`** instead of spreading. That passes the array itself as
  the first argument.
- **Counting inside the method instead of the decorator.** That works, and it is the same line
  repeated in every method — which is the problem decorators exist to remove.
- **`l71Counts[name] + 1` without a fallback.** The first call reads `undefined` and the count
  becomes `NaN`.

### Verification

<!-- cell: code verification -->
const l71Fresh = new L71Wallet();
const l71Before = l71CountOf("add");

const l71AfterAdd = l71Fresh.add(40.7);
const l71AfterSpend = l71Fresh.spend(0.7);

checkAll([
  ["the method still returns its value", l71AfterAdd, 40.7],
  ["and the second one too", l71AfterSpend, 40],
  ["the call was counted", l71CountOf("add") - l71Before, 1],
  ["each method is counted separately", l71CountOf("spend") >= 1, true],
  ["an unknown method has no count", l71CountOf("transfer"), 0],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. Because the decorator function body runs when the class is defined, and the array is
//    read only later, when a decorated method is called. `const l71Calls` is hoisted in the
//    module's scope and initialized before the first call happens. The decorator itself runs
//    once per decorated member, at class definition time — not on every call.
//
// 2. The types, not the behavior. A decorator typed with unknown[] parameters says "I work for
//    any method", and then the replacement it returns is also typed with unknown[] — so the
//    method's own signature is lost. With a two-argument method, callers would be told the
//    method takes a list of unknowns, and every existing call would be reported at the call
//    site rather than here.
//
// 3. The original is still there, captured as `target` in the closure: the replacement calls
//    it. What changed is what the class exposes under that name. Written as an arrow function,
//    the replacement would take `this` from the surrounding scope instead of from the call, so
//    `this.cash` would not be the wallet the method was called on.

<!-- cell: markdown -->
## LESSON 72 — A practical example

### Exercise

<!-- cell: code solution -->
let l72Applied = 0;

function l72Clamped(min: number, max: number) {
  return function <This, Args extends unknown[]>(
    target: (this: This, ...args: Args) => number,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => number>,
  ): (this: This, ...args: Args) => number {
    return function (this: This, ...args: Args): number {
      const value = target.call(this, ...args);
      if (value < min) {
        l72Applied = l72Applied + 1;
        return min;
      }
      if (value > max) {
        l72Applied = l72Applied + 1;
        return max;
      }
      return value;
    };
  };
}

class L72Review {
  @l72Clamped(0, 100)
  score(points: number): number {
    return points * 10;
  }

  @l72Clamped(0, 50)
  discount(percent: number): number {
    return percent;
  }
}

const l72Review = new L72Review();
console.log(l72Review.discount(10)); // prints 10

<!-- cell: markdown -->
Three errors from two mistakes again. The returned wrapper promised a `string` while the
decorator has to hand back a method of the same shape as the one it wrapped (TS1270, reported
at each `@`), and `@l72Clamped` was used without its arguments — so the factory itself became
the decorator, and the compiler reported that it takes a number rather than a method (TS1241).

The clamping happens **after** the method runs: the decorator's job is to look at the result,
not to repeat the calculation.

**Common mistakes**

- **Clamping the arguments instead of the result.** `score(25)` is a legal call; it is the
  `250` it returns that is out of range.
- **Counting every call** instead of only the ones that changed. The check compares the
  difference, so an extra count is visible.
- **`Math.min(max, Math.max(min, value))`** without counting. Shorter, but then nothing knows
  whether a change happened; the exercise needs both.
- **Using `@l72Clamped` with no arguments.** A factory has to be called: the `@` line is an
  expression, and its value is what decorates.

### Verification

<!-- cell: code verification -->
const l72Checked = new L72Review();
const l72Start = l72Applied;

const l72Inside = l72Checked.score(4);
const l72TooHigh = l72Checked.score(25);
const l72Negative = l72Checked.score(-3);
const l72Discount = l72Checked.discount(80);

checkAll([
  ["a result inside the range is untouched", l72Inside, 40],
  ["a result above the maximum is clamped", l72TooHigh, 100],
  ["a result below the minimum is clamped", l72Negative, 0],
  ["the other method has its own range", l72Discount, 50],
  ["three results had to change", l72Applied - l72Start, 3],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. The inner one, @l72Rounded(2), receives the raw number straight from the method body and
//    rounds it; @l72Logged wraps that, so it sees the already-rounded result. Swapping them
//    changes nothing in what is printed — both still run — but the trace would then be written
//    inside the rounding wrapper, so "enter yearly" would appear after the rounding wrapper had
//    been entered rather than before.
//
// 2. When the decorator is applied — once per decorated method, while the class is being
//    defined. It does not run per call. Anything expensive that depends only on the options
//    belongs there, not inside the returned function.
//
// 3. The first says the thing after the @ isn't usable as a method decorator at all: without
//    its arguments, l72Rounded is a function that expects a number, and a decorator is called
//    with a method and a context. The second says the decorator and the method disagree about
//    the result: the decorator returns a method giving a number, while the method it is applied
//    to promises a string.

<!-- cell: markdown -->
## LESSON 73 — When to use decorators, and when to avoid them

### Exercise

<!-- cell: code solution -->
function l73WithFloor(
  calculate: (amount: number) => number,
  floor: number,
): (amount: number) => number {
  return (amount) => Math.max(floor, calculate(amount));
}

function l73Floored(floor: number) {
  return function <This, Args extends unknown[]>(
    target: (this: This, ...args: Args) => number,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => number>,
  ): (this: This, ...args: Args) => number {
    return function (this: This, ...args: Args): number {
      return Math.max(floor, target.call(this, ...args));
    };
  };
}

function l73RawFee(amount: number): number {
  return Math.round(amount * 0.015 * 100) / 100;
}

const l73PlainFee = l73WithFloor(l73RawFee, 0.5);

class L73Invoice {
  @l73Floored(0.5)
  fee(amount: number): number {
    return Math.round(amount * 0.015 * 100) / 100;
  }
}

console.log(`${l73PlainFee(10)} ${new L73Invoice().fee(10)}`); // prints 0.5 0.5

<!-- cell: markdown -->
The two `[to fix]` errors were the wrapper returning a string instead of a number, and
`l73WithFloor(l73RawFee)` called without the floor (TS2554) — the decorator version can't make
that mistake, because `@l73Floored(0.5)` would be reported if the argument were missing.

That is the honest comparison. The wrapper is shorter, has no context object and is easy to
test on its own; the decorator sits closer to the method and applies to every call without the
caller building anything. Neither is better in general.

**Common mistakes**

- **Rounding in one version and not the other.** The checks compare the two side by side for
  exactly that reason.
- **Applying the floor before the calculation.** `Math.max(floor, amount)` clamps the input;
  the rule is about the fee.
- **Returning `floor` whenever the result is small**, including when it is *equal* to the
  floor. `Math.max` handles that without a special case.
- **Giving the decorator a different floor from the wrapper.** Then the two disagree and the
  exercise's point disappears.

### Verification

<!-- cell: code verification -->
const l73Invoice = new L73Invoice();

checkAll([
  ["a fee above the floor is kept", l73PlainFee(120.5), 1.81],
  ["and the decorated one agrees", l73Invoice.fee(120.5), 1.81],
  ["a small fee is lifted to the floor", l73PlainFee(10), 0.5],
  ["and the decorated one agrees again", l73Invoice.fee(10), 0.5],
  ["exactly at the floor", l73PlainFee(33.33), 0.5],
  ["a zero amount", l73Invoice.fee(0), 0.5],
]);

<!-- cell: markdown -->
### Mini Challenge

<!-- cell: code challenge-solution -->
// 1. A decorator. The behavior is identical for every method, adds nothing to what any of them
//    means, and a reader loses nothing by not seeing it at the call site — which is exactly the
//    case decorators are for. (A wrapper function would have to be applied by hand to each
//    method, and someone would forget one.)
//
// 2. Nothing at all, or a wrapper. One method, one rule: round inside the method and be done.
//    A decorator here adds a layer of indirection for a single line.
//
// 3. A decorator, because the framework requires it. The decorator is the framework's way of
//    saying what the class is; writing it by hand is not an option.
//
// 4. Neither — write it in the method, or give the class a credit-limit collaborator
//    (LESSON 45). The check changes what the method means: sometimes it refuses to pay. A
//    reader of `pay()` has to know that, so it belongs where they can see it.

<!-- cell: markdown -->
That is the end of the optional decorator topic. You can read a decorator in someone else's
code, write a simple one, and — more useful day to day — recognize the cases where a plain
function says more.
