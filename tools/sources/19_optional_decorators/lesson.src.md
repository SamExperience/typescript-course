<!-- cell: markdown -->
# TypeScript — Decorators (optional)

> **How these notebooks work**
>
> - This topic is **optional**. Nothing in the course depends on it, and no mini-project uses
>   it.
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../19_optional_decorators/lesson.ipynb
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
## LESSON 71 — What decorators are, and their syntax

### Explanation

A **decorator** is a function that wraps a class member, written above it with an `@`:

```typescript
class Account {
  @logged
  deposit(amount: number): number {
    return amount;
  }
}
```

It is not a type. It is ordinary JavaScript that runs **once, when the class is defined**, and
it can replace what it decorates. The version TypeScript 6 uses is the standard one, shared with
modern JavaScript: no `experimentalDecorators`, no extra setting.

A method decorator takes two arguments:

```typescript
function logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: Args) => Return {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(`calling ${name}`);
    return target.call(this, ...args);
  };
}
```

- **`target`** is the method being decorated.
- **`context`** describes it: `context.name` is the member's name, `context.kind` is
  `"method"`, `"getter"`, `"field"` and so on.
- **What you return replaces the member.** Return nothing and the original stays.

The generics are what keep it typed for every method it is used on: `This` is the class,
`Args` the parameters, `Return` the result (LESSON 54). A signature that is too loose is
reported where the decorator is *used*: `Unable to resolve signature of method decorator when
called as an expression.` (TS1241) and `Decorator function return type ... is not assignable`
(TS1270).

Decorators also exist for classes, getters, setters and fields, each with its own context type.
This topic stays with methods, which is where they earn their place most often.

### Key Notes

- `@name` above a member wraps it with a function; it is code, not a type.
- A decorator runs once, when the class is defined.
- A method decorator receives `(target, context)` and may return a replacement.
- `context.name` and `context.kind` describe what is being decorated.
- A loose signature is reported at the `@` (TS1241, TS1270).

### Example

<!-- cell: code example -->
function l71Logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: Args) => Return {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    l71Calls.push(name);
    return target.call(this, ...args);
  };
}

const l71Calls: string[] = [];

class L71Account {
  constructor(private balance: number) {}

  @l71Logged
  deposit(amount: number): number {
    this.balance = this.balance + amount;
    return this.balance;
  }

  @l71Logged
  withdraw(amount: number): number {
    this.balance = this.balance - amount;
    return this.balance;
  }
}

const l71Account = new L71Account(100);

// prints 150 130
console.log(`${l71Account.deposit(50)} ${l71Account.withdraw(20)}`);

// prints deposit,withdraw — the wrapper ran on both calls
console.log(l71Calls.join(","));

<!-- cell: code type-error-demo -->
// Type error on purpose.
function l71Loose(
  target: (this: unknown, ...args: unknown[]) => unknown,
  context: ClassMethodDecoratorContext,
): (this: unknown, ...args: unknown[]) => unknown {
  return function (this: unknown, ...args: unknown[]): unknown {
    return target.call(this, ...args);
  };
}

class L71Rate {
  // Compiler: Unable to resolve signature of method decorator when called as an expression.
  // Compiler: Decorator function return type '(this: unknown, ...args: unknown[]) => unknown' is not assignable to type 'void | ((base: number) => number)'.
  @l71Loose
  yearly(base: number): number {
    return base * 1.015;
  }
}

// prints 152.24999999999997 — the decorator runs fine; only its types are too loose
console.log(new L71Rate().yearly(150));

<!-- cell: markdown -->
### Exercise

Write a decorator that counts how many times a method was called.

1. Run `check:nb`. There are three `[to fix]` errors but only two mistakes: the wrapper's
   parameter type is wrong (reported at each `@`, LESSON 37), and the original method is called
   without its arguments.
2. `l71Counted` wraps a method so that every call adds one to `l71Counts` for that method's
   name, then runs the original and returns its result unchanged.
3. Apply it to both methods of `L71Wallet`.
4. `l71CountOf(name)` returns how many times that method was called, or `0`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
const l71Counts: Record<string, number> = {};

function l71Counted<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: string[]) => Return {
  const name = String(context.name);
  return function (this: This, ...args: string[]): Return {
    // TODO: count this call, then run the original with the same arguments
    return target.call(this);
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
  // TODO: how many times that method was called, or 0
  return 0;
}

const l71Wallet = new L71Wallet();
l71Wallet.add(10);
console.log(l71CountOf("add"));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 71 must have no `[to fix]` errors left.

The counts include the calls made in the exercise cell, so run that cell once before this one.

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

Answer in comments in the cell below:

1. `l71Logged` in the Example pushes into an array declared **after** it. Why does that work,
   and when exactly does the decorator function itself run?
2. The demo's loose decorator works at runtime and is still reported. What is the compiler
   protecting, and what would go wrong with a method that takes two arguments?
3. A decorator returns a new function that replaces the method. What happens to the original —
   and what would `this` be inside the replacement if you wrote it as an arrow function?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 72 — A practical example

### Explanation

A decorator that needs options is written as a **factory**: a function you *call*, which
returns the decorator.

```typescript
function rounded(decimals: number) {
  return function <This, Args extends unknown[]>(
    target: (this: This, ...args: Args) => number,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => number>,
  ): (this: This, ...args: Args) => number {
    return function (this: This, ...args: Args): number {
      const factor = 10 ** decimals;
      return Math.round(target.call(this, ...args) * factor) / factor;
    };
  };
}

class Rate {
  @rounded(2)
  yearly(base: number): number {
    return base * 1.015;
  }
}
```

`@rounded(2)` calls `rounded`, which returns the real decorator. Note the narrower `target`
type: this one only fits methods returning a `number`, and applying it to one that returns a
string is reported.

**Two decorators on one method** run in a fixed order: the factories are evaluated top to
bottom, the decorators are applied bottom-up (the one closest to the method wraps it first),
and at call time the wrappers run outside in and unwind in reverse:

```text
factory outer | factory inner | apply inner | apply outer |
enter outer | enter inner | body | leave inner | leave outer
```

### Key Notes

- A decorator with options is a factory: `@name(args)` calls it, and the result decorates.
- Narrow the `target` type when the decorator only fits certain methods.
- Factories run top to bottom; decorators apply bottom-up; wrappers run outside in.
- The order matters as soon as two decorators both change the result.
- Forgetting the call — `@rounded` instead of `@rounded(2)` — is reported.

### Example

<!-- cell: code example -->
const l72Trace: string[] = [];

function l72Logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): (this: This, ...args: Args) => Return {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    l72Trace.push(`enter ${name}`);
    const result = target.call(this, ...args);
    l72Trace.push(`leave ${name}`);
    return result;
  };
}

function l72Rounded(decimals: number) {
  return function <This, Args extends unknown[]>(
    target: (this: This, ...args: Args) => number,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => number>,
  ): (this: This, ...args: Args) => number {
    const factor = 10 ** decimals;
    return function (this: This, ...args: Args): number {
      return Math.round(target.call(this, ...args) * factor) / factor;
    };
  };
}

class L72Rate {
  @l72Logged
  @l72Rounded(2)
  yearly(base: number): number {
    return base * 1.015;
  }
}

// prints 152.25 — rounded by the inner decorator
console.log(new L72Rate().yearly(150));

// prints enter yearly,leave yearly — the outer decorator saw the call
console.log(l72Trace.join(","));

<!-- cell: code type-error-demo -->
// Type error on purpose.
class L72Label {
  // Compiler: Unable to resolve signature of method decorator when called as an expression.
  // Compiler: a second message, TS1270, then says the decorator's return type is not
  // assignable to 'void | ((text: string) => number)'. The factory itself was used as the
  // decorator: it takes a number, not a method.
  @l72Rounded
  size(text: string): number {
    return text.length;
  }
}

class L72Name {
  // Compiler: Unable to resolve signature of method decorator when called as an expression.
  // Compiler: Decorator function return type '(this: L72Name, text: string) => number' is not assignable to type 'void | ((text: string) => string)'.
  // This decorator only fits methods that return a number.
  @l72Rounded(2)
  upper(text: string): string {
    return text.toUpperCase();
  }
}

// prints [Function (anonymous)] — and that is the runtime damage the first error predicted:
// `size` was replaced by the decorator function itself, so calling it returns another function
console.log(new L72Label().size("Ada!"));

<!-- cell: markdown -->
### Exercise

Write a decorator factory that keeps a returned number inside a range.

1. Run `check:nb` and fix the `[to fix]` errors.
2. `l72Clamped(min, max)` returns a decorator: the wrapped method runs, and its result is
   returned unchanged if it is inside the range, or replaced by `min` or `max` if it falls
   outside.
3. Apply it to `score` with `0` and `100`, and to `discount` with `0` and `50`.
4. `l72Applied` counts how many times the clamping actually changed a result.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
let l72Applied = 0;

function l72Clamped(min: number, max: number) {
  return function <This, Args extends unknown[]>(
    target: (this: This, ...args: Args) => number,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => number>,
  ): (this: This, ...args: Args) => string {
    return function (this: This, ...args: Args): string {
      // TODO: run the method, then keep the result inside [min, max]
      // and add 1 to l72Applied whenever the result had to change
      return "0";
    };
  };
}

class L72Review {
  @l72Clamped
  score(points: number): number {
    return points * 10;
  }

  @l72Clamped(0, 50)
  discount(percent: number): number {
    return percent;
  }
}

const l72Review = new L72Review();
console.log(l72Review.discount(10));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 72 must have no `[to fix]` errors left.

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

Answer in comments in the cell below:

1. In the Example, `@l72Logged` sits above `@l72Rounded(2)`. Which wrapper receives the raw
   number and which receives the rounded one? What would swapping them change in the trace?
2. `l72Rounded` computes `factor` outside the returned function. When does that line run, and
   how many times?
3. The demo cell shows `@l72Rounded` applied to a method returning a `string`, and applied
   without its arguments. Describe each of the two messages in your own words.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 73 — When to use decorators, and when to avoid them

### Explanation

A decorator is a wrapper with special syntax. Everything it does can be done by an ordinary
function, so the question is never "can I?" but "should the reader see it?".

**Where they earn their place**

- The same concern on many members: logging, timing, counting, clamping a result.
- Behavior that is genuinely uniform — every method gets exactly the same treatment.
- Frameworks that are built around them. Angular and NestJS use decorators to declare what a
  class *is*; there the decorator is the framework's vocabulary, not your own invention.

**What they cost**

- **The call site says nothing.** `card.charge(10)` looks like a plain call, and the rounding,
  the logging or the retry are elsewhere. A reader has to know to look above the method.
- **They run at definition time**, which surprises people who expect per-call behavior.
- **Typing them is fiddly**, as LESSON 71 and 72 showed, and a loose signature quietly widens
  every method it touches.
- **They are hard to test on their own**: you need a class to apply them to.

**The alternative is usually smaller.** A plain function that takes a function and returns a
function does the same job, in view:

```typescript
function withRounding(calculate: (base: number) => number): (base: number) => number {
  return (base) => Math.round(calculate(base) * 100) / 100;
}
```

No new syntax, no context object, easy to test, and the wrapping is visible where it happens.
Composition (LESSON 45) covers most of the rest: a class that *has* a logger is easier to
follow than a class whose methods are silently wrapped.

**A rule that holds up:** use a decorator when the behavior is the same everywhere, adds
nothing to the meaning of the method, and a reader is not harmed by not seeing it. Otherwise
write the wrapper, or write the line.

That is also why the four mini-projects of this course ban them: at this size, everything a
decorator would hide is better shown.

### Key Notes

- A decorator is a wrapper with syntax; a plain higher-order function does the same work.
- They suit uniform, invisible concerns and frameworks built around them.
- Their cost is invisibility at the call site, plus fiddly types.
- Composition or a wrapper function is usually clearer in your own code.
- Use one when not seeing it costs the reader nothing.

### Example

<!-- cell: code example -->
function l73WithRounding(
  calculate: (base: number) => number,
): (base: number) => number {
  return (base) => Math.round(calculate(base) * 100) / 100;
}

function l73Yearly(base: number): number {
  return base * 1.015;
}

const l73RoundedYearly = l73WithRounding(l73Yearly);

function l73Rounded2<This, Args extends unknown[]>(
  target: (this: This, ...args: Args) => number,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => number>,
): (this: This, ...args: Args) => number {
  return function (this: This, ...args: Args): number {
    return Math.round(target.call(this, ...args) * 100) / 100;
  };
}

class L73Rate {
  @l73Rounded2
  yearly(base: number): number {
    return base * 1.015;
  }
}

// prints 152.24999999999997 152.25 152.25
console.log(`${l73Yearly(150)} ${l73RoundedYearly(150)} ${new L73Rate().yearly(150)}`);

<!-- cell: markdown -->
Both versions round. The difference is where a reader sees it: `l73WithRounding(l73Yearly)`
says so on the line that builds the function, while `new L73Rate().yearly(150)` looks like a
plain call.

### Exercise

A fee calculator exists twice: once wrapped by a plain function, once by a decorator. Make both
behave identically, then judge them.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `l73WithFloor(calculate, floor)` returns a function that runs `calculate` and never returns
   less than `floor`.
3. `l73Floored(floor)` is the same rule as a decorator factory, applied to `L73Invoice.fee`.
4. Both must give the same answers for the same inputs.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
function l73WithFloor(
  calculate: (amount: number) => number,
  floor: number,
): (amount: number) => number {
  // TODO: run calculate, never return less than floor
  return (amount) => "0";
}

function l73Floored(floor: number) {
  return function <This, Args extends unknown[]>(
    target: (this: This, ...args: Args) => number,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => number>,
  ): (this: This, ...args: Args) => number {
    return function (this: This, ...args: Args): number {
      // TODO: the same rule, applied to the method's result
      return target.call(this, ...args);
    };
  };
}

function l73RawFee(amount: number): number {
  return Math.round(amount * 0.015 * 100) / 100;
}

const l73PlainFee = l73WithFloor(l73RawFee);

class L73Invoice {
  @l73Floored(0.5)
  fee(amount: number): number {
    return Math.round(amount * 0.015 * 100) / 100;
  }
}

console.log(l73RawFee(120.5));

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 73 must have no `[to fix]` errors left.

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

For each of these, say whether you would use a decorator, a wrapper function, composition, or
nothing at all — and why. Answer in comments in the cell below.

1. Every method of a service class should log its name when called, in development only.
2. One method's result must be rounded to 2 decimals.
3. A class must be registered with a framework that discovers classes by their decorators.
4. A payment method must check the customer's credit limit before doing anything.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
