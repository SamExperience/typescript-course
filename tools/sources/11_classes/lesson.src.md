<!-- cell: markdown -->
# TypeScript — Classes

> **How these notebooks work**
>
> - Run the cells from top to bottom, starting with the helper cell below.
> - **Running a cell does not check types.** To see type errors, run this from the
>   `playground` folder:
>
>   ```bash
>   npm run check:nb -- ../11_classes/lesson.ipynb
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
## LESSON 38 — Class syntax, properties, constructors and methods

### Explanation

A class describes objects that carry data **and** the operations that belong to that data.
JavaScript already has classes; TypeScript adds types to their properties and methods.

```typescript
class Account {
  owner: string;
  balance: number;

  constructor(owner: string, balance: number) {
    this.owner = owner;
    this.balance = balance;
  }

  deposit(amount: number): void {
    this.balance = this.balance + amount;
  }
}
```

Three parts:

- **Property declarations** at the top of the body. This is the part JavaScript doesn't have:
  each property is listed with its type, and no other property can be added later.
- **The constructor**: typed parameters, and an assignment for every property.
- **Methods**, typed exactly like the functions in topic 08, return type included.

Strict mode requires the constructor to assign every declared property. Miss one and you get
`Property 'limit' has no initializer and is not definitely assigned in the constructor.`
(TS2564). Either assign it in the constructor, or give it a starting value in the declaration:
`paid: number = 0;`.

Inside the class, properties are always reached through `this`. Writing `balance` on its own
gives `Cannot find name 'balance'. Did you mean the instance member 'this.balance'?` (TS2663).

The class name is also a **type**: `const savings: Account = new Account("Ada", 250);`. A `new`
call is checked like any other call, so a missing argument is reported as
`Expected 2 arguments, but got 1.` (TS2554).

**When to use a class:** when data and the operations on it belong together and you create
many of them — accounts, loans, orders. For plain data with no behavior, an object type
(LESSON 16) stays lighter.

### Key Notes

- Declare every property with its type at the top of the class body.
- Strict mode wants each declared property assigned in the constructor (TS2564).
- Reach properties through `this.` inside the class (TS2663 reminds you).
- Methods are typed like functions.
- The class name is also the type of its instances.

### Example

<!-- cell: code example -->
class L38Account {
  owner: string;
  balance: number;

  constructor(owner: string, balance: number) {
    this.owner = owner;
    this.balance = balance;
  }

  deposit(amount: number): void {
    this.balance = this.balance + amount;
  }

  describe(): string {
    return `${this.owner}: ${this.balance.toFixed(2)} EUR`;
  }
}

const l38Savings: L38Account = new L38Account("Ada", 250);
l38Savings.deposit(100);
console.log(l38Savings.describe()); // prints Ada: 350.00 EUR

<!-- cell: code type-error-demo -->
// Type error on purpose.
class L38Card {
  holder: string;
  // Compiler: Property 'limit' has no initializer and is not definitely assigned in the constructor.
  limit: number;

  constructor(holder: string) {
    this.holder = holder;
  }
}

// Compiler: Expected 2 arguments, but got 1.
const l38Incomplete = new L38Account("Grace");

console.log(new L38Card("Grace").holder); // prints Grace

<!-- cell: markdown -->
### Exercise

A bank tracks small loans. Write the `L38Loan` class so that it keeps its own numbers correct.

1. Run `check:nb` and fix all four `[to fix]` errors.
2. The constructor takes the borrower's name and the amount borrowed. A new loan starts with
   nothing paid.
3. `pay(amount)` records a payment. A payment that would go above the principal only counts up
   to the principal: a loan is never overpaid.
4. `remaining()` returns what is still owed, rounded to 2 decimals.
5. `isSettled()` returns `true` when nothing is left to pay.
6. `summary()` returns a line such as `"Ada owes 600.00 EUR of 1000.00 EUR"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
class L38Loan {
  borrower: string;
  principal: number;
  paid: number;

  constructor(borrower: string, principal: number) {
    this.borrower = borrower;
    // TODO: assign the other two properties
  }

  pay(amount: number): void {
    // TODO: record the payment, without going above the principal
  }

  remaining(): number {
    // TODO: what is still owed, rounded to 2 decimals
    return "0";
  }

  isSettled(): boolean {
    // TODO: true when nothing is left to pay
    return 0;
  }

  summary(): string {
    // TODO: a line such as "Ada owes 600.00 EUR of 1000.00 EUR"
    return this.borrower;
  }
}

const l38MyLoan = new L38Loan("Ada", 1000);
l38MyLoan.pay(400);
console.log(l38MyLoan.summary());

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 38 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l38First = new L38Loan("Ada", 1000);
l38First.pay(400);

const l38Rounding = new L38Loan("Grace", 1000);
l38Rounding.pay(333.33);
l38Rounding.pay(333.33);

const l38Overpaid = new L38Loan("Hopper", 500);
l38Overpaid.pay(600);

checkAll([
  ["remaining after 400", l38First.remaining(), 600],
  ["not settled yet", l38First.isSettled(), false],
  ["summary line", l38First.summary(), "Ada owes 600.00 EUR of 1000.00 EUR"],
  ["remaining is rounded", l38Rounding.remaining(), 333.34],
  ["payment capped at the principal", l38Overpaid.remaining(), 0],
  ["settled", l38Overpaid.isSettled(), true],
]);

<!-- cell: markdown -->
### Mini Challenge

This class makes the same mistake twice: it forgets `this.`. The compiler reports two lines,
and neither of them is the line inside the constructor.

```typescript
class Wallet {
  cash: number;

  constructor(cash: number) {
    cash = cash;
  }

  add(amount: number): void {
    cash = cash + amount;
  }
}
```

Answer in comments in the cell below:

1. Which two lines does the compiler report, and with which messages? One of the two carries
   its message twice: which, and why?
2. Why is `cash = cash;` not reported, even though it is where the mistake starts?
3. Write both corrected lines.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 39 — Access modifiers: `public`, `private`, `protected`

### Explanation

By default every property and method is **public**: anyone holding the object can read it,
write it and call it. That is the problem. `card.balance = 1000` skips every rule the class
was written to enforce.

Three modifiers say who may reach a member:

- **`public`** — reachable everywhere. The default, so the keyword is optional; write it when
  the class also hides members, to make the public surface obvious.
- **`private`** — reachable only inside the class body. From outside:
  `Property 'code' is private and only accessible within class 'Safe'.` (TS2341)
- **`protected`** — reachable inside the class and inside classes that extend it. From
  outside: `Property 'auditLog' is protected and only accessible within class 'Safe' and its
  subclasses.` (TS2445) Subclasses arrive in LESSON 43; until then, read `protected` as
  "private, but my future subclasses may use it too".

`private` is per **class**, not per object: a method can read `other.balance` on another
instance of its own class.

**This is a compile-time rule only.** The emitted JavaScript is unchanged: the property is
still in the object, `JSON.stringify` prints it, and code that skips type checking can reach
it. Modifiers protect your code from mistakes; they are not security.

**How to choose:** hide everything, then make public only what callers really need. Data that
must stay consistent stays private, and a method changes it under the class's rules.

### Key Notes

- `public` (default) everywhere · `private` inside the class · `protected` also in subclasses.
- TS2341 for a private member, TS2445 for a protected one.
- `private` is per class: another instance of the same class is fine.
- Nothing is hidden at runtime; the property is still in the object.
- Expose the smallest useful surface and keep the rules inside methods.

### Example

<!-- cell: code example -->
class L39Account {
  public owner: string;
  private balance: number;

  constructor(owner: string, balance: number) {
    this.owner = owner;
    this.balance = balance;
  }

  public withdraw(amount: number): boolean {
    if (amount > this.balance) {
      return false;
    }
    this.balance = this.balance - amount;
    return true;
  }

  public richerThan(other: L39Account): boolean {
    return this.balance > other.balance; // another instance of the same class: allowed
  }

  public describe(): string {
    return `${this.owner}: ${this.balance.toFixed(2)} EUR`;
  }
}

const l39Ada = new L39Account("Ada", 250);
const l39Grace = new L39Account("Grace", 40);

console.log(`${l39Ada.withdraw(500)} ${l39Ada.richerThan(l39Grace)}`); // prints false true
console.log(l39Ada.describe()); // prints Ada: 250.00 EUR

<!-- cell: code type-error-demo -->
// Type error on purpose.
class L39Safe {
  public label: string;
  private code: string;
  protected auditLog: string[];

  constructor(label: string, code: string) {
    this.label = label;
    this.code = code;
    this.auditLog = [];
  }
}

const l39Safe = new L39Safe("Vault", "0042");

// Compiler: Property 'code' is private and only accessible within class 'L39Safe'.
// Compiler: Property 'auditLog' is protected and only accessible within class 'L39Safe' and its subclasses.
// Both lines still run: prints 0042 0 — the rule exists only while type checking.
console.log(`${l39Safe.code} ${l39Safe.auditLog.length}`);

// prints {"label":"Vault","code":"0042","auditLog":[]}
console.log(JSON.stringify(l39Safe));

<!-- cell: markdown -->
### Exercise

A prepaid card must keep its own balance correct: no charge above the balance, no charge on a
blocked card, no negative top-up.

1. Run `check:nb`. The three `[to fix]` errors are on the last two lines of the cell, where the
   code reaches into the card from outside. Replace those two lines with method calls that do
   the same thing.
2. `topUp(amount)` adds the amount, and ignores amounts of `0` or less.
3. `charge(amount)` returns `false` and changes nothing when the card is blocked or the amount
   is above the balance; otherwise it subtracts the amount and returns `true`.
4. `block()` blocks the card for good.
5. `statement()` returns a line such as `"Ada: 45.00 EUR (active)"`, or `"(blocked)"` in place
   of `"(active)"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
class L39Card {
  public holder: string;
  private balance: number;
  private blocked: boolean;

  constructor(holder: string, balance: number) {
    this.holder = holder;
    this.balance = balance;
    this.blocked = false;
  }

  public topUp(amount: number): void {
    // TODO: add the amount, ignoring 0 or less
  }

  public charge(amount: number): boolean {
    // TODO: refuse when blocked or when the amount is above the balance
    return true;
  }

  public block(): void {
    // TODO: block the card
  }

  public statement(): string {
    // TODO: a line such as "Ada: 45.00 EUR (active)"
    return this.holder;
  }
}

const l39MyCard = new L39Card("Ada", 50);
l39MyCard.balance = l39MyCard.balance + 25;
l39MyCard.blocked = true;
console.log(l39MyCard.statement());

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 39 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l39Active = new L39Card("Ada", 50);
l39Active.topUp(25);
l39Active.topUp(-10);
const l39SmallCharge = l39Active.charge(30);
const l39BigCharge = l39Active.charge(500);

const l39Stopped = new L39Card("Grace", 100);
l39Stopped.block();
const l39ChargeAfterBlock = l39Stopped.charge(10);

checkAll([
  ["a charge within the balance is accepted", l39SmallCharge, true],
  ["a charge above the balance is refused", l39BigCharge, false],
  ["a top-up of 0 or less is ignored", l39Active.statement(), "Ada: 45.00 EUR (active)"],
  ["a blocked card refuses a charge", l39ChargeAfterBlock, false],
  ["the refused charge changed nothing", l39Stopped.statement(), "Grace: 100.00 EUR (blocked)"],
]);

<!-- cell: markdown -->
### Mini Challenge

A savings account is described below, without modifiers. For each member choose `public`,
`private` or `protected`, and give a one-line reason.

```typescript
class SavingsAccount {
  owner: string;
  balance: number;
  interestRate: number;
  movements: string[];              // every deposit and withdrawal, as text

  deposit(amount: number): void;
  applyMonthlyInterest(): void;     // the bank calls this once a month
  history(): string;                // the movements as one printable block
  updateTotals(): void;             // a helper used by the two methods above
}
```

Answer in comments in the cell below. Then answer one more question: which choice would you
change if you knew a `PremiumSavingsAccount` would later extend this class?

<!-- cell: code challenge -->
// owner:
// balance:
// interestRate:
// movements:
// deposit:
// applyMonthlyInterest:
// history:
// updateTotals:
//
// With a subclass in mind:

<!-- cell: markdown -->
## LESSON 40 — `readonly` and parameter properties

### Explanation

Some data is decided when the object is created and must never change afterwards: an IBAN, an
order number, a currency. Mark it **`readonly`**:

```typescript
class Account {
  public readonly iban: string;
  private balance: number;
}
```

A `readonly` property can be given a value in its declaration or in the constructor, and
nowhere else. Anywhere else — another method, or any code outside the class — you get
`Cannot assign to 'iban' because it is a read-only property.` (TS2540)

`readonly` protects the property, not what it points to. With `public readonly holdings:
string[]`, the line `holdings = []` is reported but `holdings.push("MSFT")` is allowed. To
block that too, make the array type readonly as well: `readonly holdings: readonly string[]`,
the array form of the readonly tuples from LESSON 19.

**Parameter properties** remove the repetition you may have noticed in LESSON 38: declare,
then assign the same names in the constructor. Put a modifier in front of a constructor
parameter and TypeScript does both:

```typescript
class Account {
  constructor(
    public readonly iban: string,
    private balance: number,
  ) {}
}
```

- The modifier is what triggers it: `public`, `private`, `protected` or `readonly` alone.
  Without one, the parameter stays an ordinary parameter and no property is created.
- Plain parameters and parameter properties can be mixed in the same constructor.
- The body can stay empty, or do extra work as usual.
- Properties that aren't constructor parameters keep their own declaration, for example
  `private closed: boolean = false;`.

### Key Notes

- `readonly`: assignable in the declaration and the constructor only (TS2540 elsewhere).
- `readonly` locks the property, not the contents of an array it points to.
- A modifier on a constructor parameter declares and assigns the property in one go.
- No modifier, no property.
- Properties that come from somewhere other than a parameter still need a declaration.

### Example

<!-- cell: code example -->
class L40Account {
  private closed: boolean = false;

  constructor(
    public readonly iban: string,
    public readonly owner: string,
    private balance: number,
  ) {}

  public deposit(amount: number): void {
    this.balance = this.balance + amount;
  }

  public describe(): string {
    return `${this.owner} (${this.iban}): ${this.balance.toFixed(2)} EUR`;
  }
}

const l40Ada = new L40Account("IT60X", "Ada", 250);
l40Ada.deposit(100);
console.log(l40Ada.describe()); // prints Ada (IT60X): 350.00 EUR

<!-- cell: code type-error-demo -->
// Type error on purpose.
class L40Order {
  constructor(
    public readonly reference: string,
    private total: number,
  ) {}

  public fixReference(reference: string): void {
    // Compiler: Cannot assign to 'reference' because it is a read-only property.
    this.reference = reference;
  }
}

const l40Order = new L40Order("ORD-1", 99);

// Compiler: Cannot assign to 'reference' because it is a read-only property.
l40Order.reference = "ORD-2";

console.log(l40Order.reference); // prints ORD-2 — readonly is checked, never enforced at runtime

<!-- cell: markdown -->
### Exercise

A fixed-term deposit. The bank opens it once: the IBAN and the currency belong to the
contract and never change. The balance changes only through the deposit's own methods.

1. Rewrite the constructor using parameter properties. `iban` and `currency` stay
   `public readonly`, `balance` stays `private`. `closed` is not a constructor parameter, so
   it keeps its declaration.
2. Run `check:nb`. The one `[to fix]` error is in `correct()`. A wrong IBAN means a new
   contract, not an edit: delete that method.
3. `add(amount)` returns `false` and changes nothing when the deposit is closed or the amount
   is `0` or less; otherwise it adds the amount and returns `true`.
4. `close()` closes the deposit and returns the final balance.
5. `label()` returns a line such as `"IT60 EUR 1250.00 (open)"`, with `(closed)` after closing.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
class L40Deposit {
  public readonly iban: string;
  public readonly currency: "EUR" | "USD";
  private balance: number;
  private closed: boolean = false;

  constructor(iban: string, currency: "EUR" | "USD", balance: number) {
    this.iban = iban;
    this.currency = currency;
    this.balance = balance;
  }

  public correct(iban: string): void {
    this.iban = iban;
  }

  public add(amount: number): boolean {
    // TODO: refuse when the deposit is closed or the amount is 0 or less
    return true;
  }

  public close(): number {
    // TODO: close the deposit and return the final balance
    return 0;
  }

  public label(): string {
    // TODO: a line such as "IT60 EUR 1250.00 (open)"
    return this.iban;
  }
}

const l40MyDeposit = new L40Deposit("IT60", "EUR", 1000);
l40MyDeposit.add(250);
console.log(l40MyDeposit.label());

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 40 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l40Term = new L40Deposit("IT60", "EUR", 1000);
const l40Accepted = l40Term.add(250);
const l40Refused = l40Term.add(-5);
const l40OpenLabel = l40Term.label();
const l40FinalBalance = l40Term.close();
const l40AfterClose = l40Term.add(100);

checkAll([
  ["a deposit is accepted", l40Accepted, true],
  ["an amount of 0 or less is refused", l40Refused, false],
  ["label while open", l40OpenLabel, "IT60 EUR 1250.00 (open)"],
  ["closing returns the final balance", l40FinalBalance, 1250],
  ["a closed deposit takes no more money", l40AfterClose, false],
  ["label after closing", l40Term.label(), "IT60 EUR 1250.00 (closed)"],
  ["the IBAN is readable from outside", l40Term.iban, "IT60"],
]);

<!-- cell: markdown -->
### Mini Challenge

```typescript
class Portfolio {
  constructor(
    public readonly id: string,
    public readonly holdings: string[],
  ) {}
}

const portfolio = new Portfolio("P-1", ["AAPL"]);

portfolio.id = "P-2";
portfolio.holdings = [];
portfolio.holdings.push("MSFT");
```

Answer in comments in the cell below:

1. Which of the last three lines does the compiler report, and with which message?
2. Say in one sentence what `readonly` promises — and what it doesn't.
3. Change the type of `holdings` so that all three lines are reported. Which message does the
   third one get then?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 41 — `static` members

### Explanation

Everything so far belonged to each object: every account has its own balance. Some things
belong to the **class** instead — a limit set by the bank, a count of accounts opened, a check
that needs no account at all. Mark them `static` and reach them through the class name:

```typescript
class Account {
  public static readonly minBalance: number = 0;
  private static opened: number = 0;
}

Account.minBalance;
```

Three uses cover almost everything: shared constants as `public static readonly`; data shared
by all instances, such as a counter, kept `private static` so only the class can change it;
and helpers that need no instance, such as a check on a raw value.

Inside a static method, `this` is the class, not an object, so instance properties aren't
there: `Property 'months' does not exist on type 'typeof Rate'.` (TS2339) Write the class name
instead of `this`, in static and instance code alike: it says out loud that the value is
shared. Two hints help when you forget:

- `Property 'perYear' does not exist on type 'Rate'. Did you mean to access the static member
  'Rate.perYear' instead?` (TS2576) — you went through an instance.
- `Cannot find name 'perYear'. Did you mean the static member 'Rate.perYear'?` (TS2662) — you
  left the class name out.

A counter can't be `static readonly`: `readonly` allows an assignment in the declaration only,
so even the constructor is reported (TS2540). Use `private static` for that.

**When not to use it:** if every member of a class is static, the class is only a container
for functions. Plain functions in a module (LESSON 67) do the same job with less ceremony.

### Key Notes

- `static` members belong to the class; reach them as `ClassName.member`.
- `this` in a static method is the class, so instance properties are out of reach.
- TS2576 (through an instance) and TS2662 (no class name) both name the fix.
- `static readonly` for constants; `private static` for shared data that changes.
- A class of only static members should probably be plain functions.

### Example

<!-- cell: code example -->
class L41Account {
  public static readonly minBalance: number = 0;
  private static opened: number = 0;

  constructor(
    public readonly iban: string,
    private balance: number,
  ) {
    L41Account.opened = L41Account.opened + 1;
  }

  public static howManyOpened(): number {
    return L41Account.opened;
  }

  public canWithdraw(amount: number): boolean {
    return this.balance - amount >= L41Account.minBalance;
  }
}

const l41One = new L41Account("IT60", 100);
const l41Two = new L41Account("IT61", 50);

// prints 2 false true
console.log(`${L41Account.howManyOpened()} ${l41One.canWithdraw(150)} ${l41Two.canWithdraw(50)}`);

<!-- cell: code type-error-demo -->
// Type error on purpose.
class L41Rate {
  public static readonly perYear: number = 3.5;

  constructor(public readonly months: number) {}

  public total(): number {
    return (L41Rate.perYear * this.months) / 12;
  }

  public static describe(): string {
    // Compiler: Property 'months' does not exist on type 'typeof L41Rate'.
    return `${this.months} months`;
  }

  public static bare(): number {
    // Compiler: Cannot find name 'perYear'. Did you mean the static member 'L41Rate.perYear'?
    return perYear;
  }
}

const l41Rate = new L41Rate(6);

// Compiler: Property 'perYear' does not exist on type 'L41Rate'. Did you mean to access the static member 'L41Rate.perYear' instead?
// prints undefined 3.5 1.75 — through the instance there is nothing to read
console.log(`${l41Rate.perYear} ${L41Rate.perYear} ${l41Rate.total()}`);

<!-- cell: markdown -->
### Exercise

The bank caps every transfer at the same amount, and wants to know how many transfers have
been created.

1. Run `check:nb`. Both `[to fix]` errors come from reaching a member the wrong way: one
   inside `isAllowed`, one on the last line of the cell.
2. The constructor counts the new transfer.
3. `isAllowed(amount)` is a check on a plain number, with no transfer involved: `true` for an
   amount above `0` and at most `maxAmount`.
4. `countMade()` returns how many transfers have been created so far.
5. `line()` returns a line such as `"IT60 -> IT61: 100.00 EUR"`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
class L41Transfer {
  public static readonly maxAmount: number = 5000;
  private static made: number = 0;

  constructor(
    public readonly from: string,
    public readonly to: string,
    private amount: number,
  ) {
    // TODO: count this transfer
  }

  public static isAllowed(amount: number): boolean {
    // TODO: above 0 and at most maxAmount
    return amount <= this.amount;
  }

  public static countMade(): number {
    // TODO: how many transfers have been created
    return 0;
  }

  public line(): string {
    // TODO: a line such as "IT60 -> IT61: 100.00 EUR"
    return this.from;
  }
}

const l41Mine = new L41Transfer("IT60", "IT61", 100);
console.log(`${l41Mine.maxAmount} ${l41Mine.line()}`);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 41 must have no `[to fix]` errors left.

The counter check compares the count before and after, so you can run this cell as often as
you like.

<!-- cell: code verification -->
const l41Before = L41Transfer.countMade();
const l41Small = new L41Transfer("IT60", "IT62", 250);
const l41Large = new L41Transfer("IT60", "IT63", 4999);

checkAll([
  ["the limit belongs to the class", L41Transfer.maxAmount, 5000],
  ["4999 is allowed", L41Transfer.isAllowed(4999), true],
  ["the limit itself is allowed", L41Transfer.isAllowed(5000), true],
  ["above the limit is refused", L41Transfer.isAllowed(5001), false],
  ["0 is refused", L41Transfer.isAllowed(0), false],
  ["two more transfers were counted", L41Transfer.countMade() - l41Before, 2],
  ["a transfer line", l41Large.line(), "IT60 -> IT63: 4999.00 EUR"],
  ["the small transfer keeps its own data", l41Small.line(), "IT60 -> IT62: 250.00 EUR"],
]);

<!-- cell: markdown -->
### Mini Challenge

```typescript
class Ticket {
  static issued: number = 0;

  constructor(public readonly code: string) {
    Ticket.issued = Ticket.issued + 1;
  }

  seen(): number {
    return Ticket.issued;
  }
}

const first = new Ticket("A");
const second = new Ticket("B");
```

Answer in comments in the cell below:

1. What do `first.seen()` and `second.seen()` return, and why is it the same number?
2. Is the line `Ticket.issued = 99;` reported? Which modifier would report it, and which one
   would break the constructor instead?
3. With that modifier in place, what can `seen()` still do, and what can code outside the
   class no longer do?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 42 — Getters and setters

### Explanation

A **getter** is a method that callers read like a property. A **setter** is a method that runs
when they assign to it. Together they let the data stay `private` while the class still offers
a plain, readable surface.

```typescript
class Card {
  private _limit: number;

  get limit(): number {
    return this._limit;
  }

  set limit(newLimit: number) {
    if (newLimit >= 0) {
      this._limit = newLimit;
    }
  }
}

card.limit; // calls the getter, no parentheses
card.limit = 200; // calls the setter
```

- An accessor and its stored property can't share a name: `Duplicate identifier 'limit'.`
  (TS2300) The convention is an underscore for the private one — `_limit` inside, `limit`
  outside.
- **A getter with no setter is read-only.** Assigning gives `Cannot assign to 'limit' because
  it is a read-only property.` (TS2540) The line also throws when it runs, because JavaScript
  has nothing to write to.
- A getter is the right home for a **derived value**: `available` is `limit - spent`, worked
  out on every read, so it can never fall out of date.
- A setter is the right home for a **rule on the way in**: check or adjust the value before
  storing it.
- Keep both cheap. Callers read `card.available` expecting a property, so nothing slow belongs
  in there.

**Getter or method?** If it reads like data — `available`, `count`, `isEmpty` — a getter reads
better. If it *does* something — `spend`, `close` — keep the parentheses.

### Key Notes

- `get name(): T` is read as `obj.name`; `set name(value: T)` runs on `obj.name = value`.
- The stored property needs a different name; `_name` is the convention.
- No setter means read-only: TS2540, and a runtime error if the code runs.
- Getters suit derived values; setters suit rules applied before storing.
- Accessors should be as cheap as reading a property.

### Example

<!-- cell: code example -->
class L42Card {
  private _spent: number = 0;

  constructor(
    public readonly holder: string,
    private _limit: number,
  ) {}

  get spent(): number {
    return this._spent;
  }

  get available(): number {
    return Math.round((this._limit - this._spent) * 100) / 100;
  }

  get limit(): number {
    return this._limit;
  }

  set limit(newLimit: number) {
    if (newLimit >= this._spent) {
      this._limit = newLimit;
    }
  }

  spend(amount: number): boolean {
    if (amount <= 0 || amount > this.available) {
      return false;
    }
    this._spent = Math.round((this._spent + amount) * 100) / 100;
    return true;
  }
}

const l42Card = new L42Card("Ada", 100);
l42Card.spend(66.6);
console.log(`${l42Card.spent} ${l42Card.available}`); // prints 66.6 33.4

l42Card.limit = 150;
console.log(l42Card.available); // prints 83.4

<!-- cell: code type-error-demo -->
// Type error on purpose.
class L42Meter {
  private _used: number = 0;

  get used(): number {
    return this._used;
  }

  add(amount: number): void {
    this._used = this._used + amount;
  }

  reset(): void {
    // Compiler: Cannot assign to 'used' because it is a read-only property.
    // Nothing calls reset(), and that is on purpose: the line would also throw when it runs,
    // because a getter without a setter has nowhere to write.
    this.used = 0;
  }
}

const l42Meter = new L42Meter();
l42Meter.add(3);
console.log(l42Meter.used); // prints 3

<!-- cell: markdown -->
### Exercise

A store card with a spending limit. The amounts stay private; everything a caller needs is a
getter.

1. Run `check:nb` and fix both `[to fix]` errors.
2. `spent` returns the total spent so far, rounded to 2 decimals.
3. `available` returns `limit - spent`, rounded to 2 decimals.
4. The `limit` setter accepts a new limit, but ignores one that is below what has already been
   spent.
5. `spend(amount)` returns `false` and changes nothing when the amount is `0` or less, or
   above what is available; otherwise it records the amount and returns `true`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.
class L42StoreCard {
  private _spent: number = 0;

  constructor(
    public readonly holder: string,
    private _limit: number,
  ) {}

  get spent(): number {
    // TODO: the total spent so far, rounded to 2 decimals
    return "0";
  }

  get available(): number {
    // TODO: the limit minus what has been spent, rounded to 2 decimals
    return "0";
  }

  get limit(): number {
    return this._limit;
  }

  set limit(newLimit: number) {
    // TODO: accept the new limit unless it is below what has already been spent
  }

  spend(amount: number): boolean {
    // TODO: refuse an amount of 0 or less, or above what is available
    return true;
  }
}

const l42MyCard = new L42StoreCard("Ada", 100);
l42MyCard.spend(12.1);
l42MyCard.limit = 150;
console.log(`${l42MyCard.spent} of ${l42MyCard.limit}`);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 42 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l42Big = new L42StoreCard("Ada", 100);
const l42BigSpend = l42Big.spend(66.6);
const l42TooMuch = l42Big.spend(50);

const l42Small = new L42StoreCard("Grace", 100);
l42Small.spend(12.1);
l42Small.spend(7.77);
const l42SpentRounded = l42Small.spent;
l42Small.limit = 200;
const l42AfterRaise = l42Small.available;
l42Small.limit = 10;

checkAll([
  ["a spend within the limit is accepted", l42BigSpend, true],
  ["a spend above what is available is refused", l42TooMuch, false],
  ["available is rounded", l42Big.available, 33.4],
  ["two spends add up, rounded", l42SpentRounded, 19.87],
  ["a higher limit raises what is available", l42AfterRaise, 180.13],
  ["a limit below what was spent is ignored", l42Small.limit, 200],
  ["0 is refused", l42Small.spend(0), false],
]);

<!-- cell: markdown -->
### Mini Challenge

```typescript
class Portfolio {
  private _positions: number[] = [];

  get count(): number {
    return this._positions.length;
  }

  get total(): number {
    return this._positions.reduce((sum, value) => sum + value, 0);
  }

  add(value: number): void {
    this._positions.push(value);
  }
}
```

Answer in comments in the cell below:

1. `count` and `total` are worked out on every read. What would go wrong with stored
   `_count` and `_total` properties updated inside `add`?
2. Why would a `set total(value: number)` make no sense here?
3. Getter or plain method for each of these, and why: `isEmpty`, `biggest` (the largest
   position), `sell(value)`, `report()` (builds a multi-line string)?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 43 — Inheritance: `extends` and `super`

### Explanation

Two classes often share most of their behavior and differ in one or two places. `extends`
says "the same as that, plus these changes":

```typescript
class GoldCard extends Card {
  constructor(holder: string, limit: number, private loungeVisits: number) {
    super(holder, limit);
  }

  yearlyCost(): number {
    return 12 + this.loungeVisits * 25;
  }
}
```

- **The constructor must call `super(...)` first**, with the base class's arguments. Without
  it: `Constructors for derived classes must contain a 'super' call.` (TS2377) Touch `this`
  before the call and you also get `'super' must be called before accessing 'this' in the
  constructor of a derived class.` (TS17009) The subclass's own parameters come after the base
  ones, and a parameter property such as `private loungeVisits` still works.
- **Replacing a method** (overriding) means declaring it again with the same name. The new
  version must still fit the old type, or you get `Property 'yearlyCost' in type 'GoldCard' is
  not assignable to the same property in base type 'Card'.` (TS2416)
- **`super.method()`** calls the base class's version, which is how an override extends the
  old behavior instead of throwing it away.
- Now `protected` earns its keep: a subclass can use protected members of the base class, but
  not private ones — `Property 'charged' is private and only accessible within class
  'Account'.` (TS2341)
- A subclass instance fits wherever the base type is expected, so a `Card[]` can hold both.
  Read through the base type, only the base class's members are visible (TS2339 for the rest),
  but a call still runs the subclass's version.

### Key Notes

- `class B extends A` gives B everything A has.
- `super(...)` comes first in the constructor (TS2377, TS17009).
- An override keeps the base signature (TS2416) and may call `super.method()`.
- Subclasses reach `protected` members, never `private` ones (TS2341).
- A subclass instance is usable as the base type; the subclass's methods still win.

### Example

<!-- cell: code example -->
class L43Card {
  constructor(
    public readonly holder: string,
    protected limit: number,
  ) {}

  public yearlyCost(): number {
    return 12;
  }

  public describe(): string {
    return `${this.holder}: ${this.limit} EUR limit, ${this.yearlyCost()} EUR per year`;
  }
}

class L43GoldCard extends L43Card {
  constructor(
    holder: string,
    limit: number,
    private loungeVisits: number,
  ) {
    super(holder, limit);
  }

  public yearlyCost(): number {
    return 12 + this.loungeVisits * 25;
  }

  public describe(): string {
    return `${super.describe()}, ${this.loungeVisits} lounge visits`;
  }
}

// prints Ada: 3000 EUR limit, 112 EUR per year, 4 lounge visits
console.log(new L43GoldCard("Ada", 3000, 4).describe());

// prints Grace: 1000 EUR limit, 12 EUR per year
console.log(new L43Card("Grace", 1000).describe());

<!-- cell: code type-error-demo -->
// Type error on purpose.
class L43BasicCard extends L43Card {
  // Compiler: Constructors for derived classes must contain a 'super' call.
  // Compiler: 'super' must be called before accessing 'this' in the constructor of a derived class.
  // Nothing creates an L43BasicCard, on purpose: without the super call it would throw.
  constructor(holder: string) {
    this.limit = 500;
  }
}

// Compiler: Property 'yearlyCost' in type 'L43FreeCard' is not assignable to the same property in base type 'L43Card'.
class L43FreeCard extends L43Card {
  public yearlyCost(): string {
    return "free";
  }
}

const l43Gold: L43Card = new L43GoldCard("Ada", 3000, 4);

// prints 112 — read as an L43Card, but the gold version of yearlyCost still runs
console.log(l43Gold.yearlyCost());

<!-- cell: markdown -->
### Exercise

`L43Account` is given: don't change it. A student account is an account that pays no monthly
fee, knows its university, and can earn interest.

1. Run `check:nb` and fix both `[to fix]` errors. One of them is about a member of
   `L43Account` that a subclass is not allowed to touch.
2. `monthlyFee()` returns `0` for a student account.
3. `summary()` returns the account's normal summary followed by the university in brackets:
   `"Ada: 152.25 EUR, fee 0.00 EUR (MIT)"`. Build it from the base class's version instead of
   repeating the format.
4. `addInterest(percent)` raises the balance by that percentage, rounded to 2 decimals.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.

// Given: don't change this class.
class L43Account {
  protected balance: number;
  private charged: number = 0;

  constructor(
    public readonly owner: string,
    balance: number,
  ) {
    this.balance = balance;
  }

  get feesPaid(): number {
    return this.charged;
  }

  public deposit(amount: number): boolean {
    if (amount <= 0) {
      return false;
    }
    this.balance = Math.round((this.balance + amount) * 100) / 100;
    return true;
  }

  public monthlyFee(): number {
    return 2;
  }

  public chargeMonthlyFee(): void {
    const fee = this.monthlyFee();
    this.balance = Math.round((this.balance - fee) * 100) / 100;
    this.charged = Math.round((this.charged + fee) * 100) / 100;
  }

  public summary(): string {
    return `${this.owner}: ${this.balance.toFixed(2)} EUR, fee ${this.monthlyFee().toFixed(2)} EUR`;
  }
}

// Your work starts here.
class L43StudentAccount extends L43Account {
  constructor(
    owner: string,
    balance: number,
    private university: string,
  ) {
    super(owner, balance);
  }

  public monthlyFee(): number {
    // TODO: a student account pays no monthly fee
    return 2;
  }

  public summary(): string {
    // TODO: the base class's summary, then the university in brackets
    return `${this.charged} (${this.university})`;
  }

  public addInterest(percent: number): void {
    // TODO: raise the balance by percent, rounded to 2 decimals
  }
}

const l43Mine = new L43StudentAccount("Ada", 100);
console.log(l43Mine.summary());

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 43 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l43Student = new L43StudentAccount("Ada", 100, "MIT");
const l43Deposited = l43Student.deposit(50);
const l43Refused = l43Student.deposit(-5);
l43Student.addInterest(1.5);
l43Student.chargeMonthlyFee();

const l43Plain = new L43Account("Grace", 100);
l43Plain.chargeMonthlyFee();

const l43Mixed: L43Account[] = [l43Plain, l43Student];

checkAll([
  ["the inherited deposit works", l43Deposited, true],
  ["a negative deposit is still refused", l43Refused, false],
  ["a student account pays no fee", l43Student.monthlyFee(), 0],
  ["a plain account still pays 2", l43Plain.monthlyFee(), 2],
  ["fees read through the base type", l43Mixed.map((account) => account.monthlyFee()), [2, 0]],
  ["interest is rounded, and the summary adds the university", l43Student.summary(), "Ada: 152.25 EUR, fee 0.00 EUR (MIT)"],
  ["charging a fee of 0 took nothing", l43Student.feesPaid, 0],
  ["the plain account paid its fee", l43Plain.summary(), "Grace: 98.00 EUR, fee 2.00 EUR"],
]);

<!-- cell: markdown -->
### Mini Challenge

`chargeMonthlyFee()` is written once, in `L43Account`, and nobody overrides it. Yet it takes
`2.00 EUR` from a plain account and nothing from a student account.

Answer in comments in the cell below:

1. Which `monthlyFee()` does `this.monthlyFee()` inside `chargeMonthlyFee()` call, and when is
   that decided?
2. `l43Mixed` is an `L43Account[]`, so `l43Mixed[1].addInterest(1.5)` is reported — even
   though the object in that slot really does have the method. Why?
3. A premium account should pay `5.00 EUR` a month and, on top of that, keep its own count of
   how many fees it has been charged. Which parts would you write in the subclass, and which
   would you leave to `L43Account`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 44 — Abstract classes

### Explanation

Some base classes make no sense on their own. "A loan" isn't a product a bank sells; a student
loan or a car loan is. But both share the payment handling, and both need an interest rate
that only they can supply. `abstract` describes exactly that:

```typescript
abstract class Loan {
  public abstract yearlyRatePercent(): number; // no body: each subclass decides

  public totalDue(): number {
    return this.principal * (1 + this.yearlyRatePercent() / 100);
  }
}
```

- **An abstract class can't be created.** `new Loan("Ada", 1000)` gives
  `Cannot create an instance of an abstract class.` (TS2511) Subclasses can.
- **An abstract member has no body**, and every non-abstract subclass must supply one:
  `Non-abstract class 'Empty' is missing implementations for the following members of 'Loan':
  'yearlyRatePercent', 'label'.` (TS2654) With one missing member the wording is
  `does not implement inherited abstract member perMonth from class 'Fee'.` (TS2515)
- Properties can be abstract too: `protected abstract readonly perMonth: number;`
- The implementation still has to fit the declared type (TS2416), and it can't be reached with
  `super`: `Abstract method 'yearlyRatePercent' in class 'Loan' cannot be accessed via super
  expression.` (TS2513) There is nothing there to call.
- Everything else works as in LESSON 43: the abstract class holds shared state and finished
  methods, and its name is still a type, so `Loan[]` can hold every kind of loan.

**Abstract class or plain base class?** A plain base class with a default implementation lets a
subclass silently keep a wrong default. An abstract member makes the compiler ask for the
answer. Use `abstract` when there is no sensible default, and when the base class on its own is
incomplete.

### Key Notes

- `abstract class` can't be instantiated (TS2511), only extended.
- `abstract` members have no body; a concrete subclass must implement all of them
  (TS2654 / TS2515).
- An abstract method can't be called through `super` (TS2513).
- An abstract class can still hold state and finished methods, unlike a list of rules.
- Choose `abstract` when no default would be right.

### Example

<!-- cell: code example -->
abstract class L44Payment {
  constructor(protected amount: number) {}

  public abstract feePercent(): number;
  public abstract method(): string;

  public fee(): number {
    return Math.round(this.amount * (this.feePercent() / 100) * 100) / 100;
  }

  public receipt(): string {
    return `${this.method()}: ${this.amount.toFixed(2)} EUR + ${this.fee().toFixed(2)} EUR fee`;
  }
}

class L44CardPayment extends L44Payment {
  public feePercent(): number {
    return 1.4;
  }

  public method(): string {
    return "Card";
  }
}

class L44TransferPayment extends L44Payment {
  public feePercent(): number {
    return 0;
  }

  public method(): string {
    return "Transfer";
  }
}

const l44Payments: L44Payment[] = [new L44CardPayment(80), new L44TransferPayment(80)];

// prints Card: 80.00 EUR + 1.12 EUR fee
console.log(l44Payments[0].receipt());

// prints Transfer: 80.00 EUR + 0.00 EUR fee
console.log(l44Payments[1].receipt());

<!-- cell: code type-error-demo -->
// Type error on purpose.

// Compiler: Non-abstract class 'L44CashPayment' is missing implementations for the following members of 'L44Payment': 'feePercent', 'method'.
class L44CashPayment extends L44Payment {}

// Compiler: Cannot create an instance of an abstract class.
const l44Any = new L44Payment(10);

// prints L44Payment — abstract exists only while type checking, so at runtime this is a
// normal class and the object really is created
console.log(l44Any.constructor.name);

<!-- cell: markdown -->
### Exercise

`L44Loan` is given: don't change it. It handles payments and totals, and leaves the rate and
the label to each kind of loan.

1. Run `check:nb` and fix both `[to fix]` errors. One is the rate declared with the wrong
   type; the other is a line that tries to create a loan that isn't any kind of loan.
2. A student loan charges `1.5` percent a year and is labeled `"Student loan"`.
3. A car loan charges `6.5` percent a year and is labeled with its plate:
   `"Car loan (AB-123-CD)"`.
4. Nothing else needs writing: paying, totals and the summary line already work for every
   loan.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.

// Given: don't change this class.
abstract class L44Loan {
  protected paid: number = 0;

  constructor(
    public readonly borrower: string,
    protected principal: number,
  ) {}

  public abstract yearlyRatePercent(): number;
  public abstract label(): string;

  public pay(amount: number): boolean {
    if (amount <= 0) {
      return false;
    }
    this.paid = Math.round((this.paid + amount) * 100) / 100;
    return true;
  }

  public totalDue(): number {
    return Math.round(this.principal * (1 + this.yearlyRatePercent() / 100) * 100) / 100;
  }

  public remaining(): number {
    return Math.round((this.totalDue() - this.paid) * 100) / 100;
  }

  public summary(): string {
    return `${this.label()} for ${this.borrower}: ${this.remaining().toFixed(2)} EUR left`;
  }
}

// Your work starts here.
class L44StudentLoan extends L44Loan {
  public yearlyRatePercent(): string {
    // TODO: 1.5 percent a year
    return "1.5";
  }

  public label(): string {
    // TODO: "Student loan"
    return "Loan";
  }
}

class L44CarLoan extends L44Loan {
  constructor(
    borrower: string,
    principal: number,
    public readonly plate: string,
  ) {
    super(borrower, principal);
  }

  public yearlyRatePercent(): number {
    // TODO: 6.5 percent a year
    return 0;
  }

  public label(): string {
    // TODO: "Car loan (AB-123-CD)"
    return this.plate;
  }
}

const l44Generic = new L44Loan("Ada", 1700);
console.log(l44Generic.borrower);

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 44 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l44Student = new L44StudentLoan("Ada", 1700);
const l44Car = new L44CarLoan("Grace", 4500, "AB-123-CD");
l44Student.pay(200);
const l44Refused = l44Student.pay(0);

checkAll([
  ["the student rate", l44Student.yearlyRatePercent(), 1.5],
  ["the car rate", l44Car.yearlyRatePercent(), 6.5],
  ["each total uses its own rate, rounded", [l44Student.totalDue(), l44Car.totalDue()], [1725.5, 4792.5]],
  ["remaining after a payment", l44Student.remaining(), 1525.5],
  ["a payment of 0 is refused", l44Refused, false],
  ["the student label", l44Student.label(), "Student loan"],
  ["the car label", l44Car.label(), "Car loan (AB-123-CD)"],
  ["the shared summary uses the subclass label", l44Car.summary(), "Car loan (AB-123-CD) for Grace: 4792.50 EUR left"],
]);

<!-- cell: markdown -->
### Mini Challenge

Answer in comments in the cell below:

1. `yearlyRatePercent()` could have been a normal method in `L44Loan` returning `0`. What
   would the compiler no longer tell you, and what kind of bug does that allow?
2. `new L44Loan("Ada", 1700)` is reported, but `abstract` is gone from the compiled
   JavaScript. The demo cell shows that the object is created anyway. What breaks the moment
   you call `summary()` on it, and what is the exact error?
3. A bank adds a mortgage: `8.5` percent, label `"Mortgage"`, and a rule that a payment below
   `500` is refused. Which parts go in the subclass, and which stay in `L44Loan`?

<!-- cell: code challenge -->
// 1.
// 2.
// 3.

<!-- cell: markdown -->
## LESSON 45 — Composition vs inheritance

### Explanation

Inheritance says **"is a"**: a student loan is a loan. Composition says **"has a"**: an account
has a fee policy. Composition needs no new syntax — the class keeps the other object as a
property and asks it to do its part:

```typescript
class Account {
  constructor(
    public readonly owner: string,
    private balance: number,
    private readonly fees: FeePolicy, // has-a
  ) {}

  send(amount: number): boolean {
    const total = amount + this.fees.feeFor(amount); // ask, don't reimplement
    return total <= this.balance;
  }
}
```

Inheritance is the stronger tie, and it costs more:

- A subclass depends on the base class's `protected` surface, so changing the base can break
  every subclass at once.
- A subclass inherits everything, including what it doesn't want.
- A class can extend **one** class only. Two families of behavior means a choice.
- Behavior is fixed when the object is created: a `BasicAccount` can never become a
  `PremiumAccount`.

Composition avoids all four. The part is chosen when the object is built, several classes can
hold the same part, and a class can hold as many parts as it needs.

**How to choose.** Use inheritance when the subclass really is the base type, callers benefit
from that shared type (one `Loan[]` holding every loan), and the shared behavior is real.
Reach for composition otherwise — and when the only difference is a value, neither is needed:
a field is enough.

One rule holds for both: **ask the part, don't reach inside it.** A class that reads its
part's private data has all the coupling of inheritance and none of the benefits.

### Key Notes

- Inheritance = "is a" · composition = "has a" · a plain value = "differs by a number".
- A class extends one class but can hold any number of parts.
- Composition lets the behavior be chosen when the object is created, and shared between
  unrelated classes.
- Inheritance is worth it when callers use the shared base type.
- Delegate to the part through its public surface.

### Example

<!-- cell: code example -->
class L45Journal {
  private lines: string[] = [];

  public record(line: string): void {
    this.lines.push(line);
  }

  public get count(): number {
    return this.lines.length;
  }

  public last(): string | undefined {
    return this.lines[this.lines.length - 1];
  }
}

class L45Wallet {
  private readonly journal = new L45Journal();
  private balance: number;

  constructor(
    public readonly owner: string,
    balance: number,
  ) {
    this.balance = balance;
  }

  public add(amount: number): void {
    this.balance = Math.round((this.balance + amount) * 100) / 100;
    this.journal.record(`+${amount.toFixed(2)} EUR`);
  }

  public spend(amount: number): boolean {
    if (amount > this.balance) {
      this.journal.record(`refused ${amount.toFixed(2)} EUR`);
      return false;
    }
    this.balance = Math.round((this.balance - amount) * 100) / 100;
    this.journal.record(`-${amount.toFixed(2)} EUR`);
    return true;
  }

  public report(): string {
    return `${this.owner}: ${this.balance.toFixed(2)} EUR, ${this.journal.count} movements, last ${this.journal.last()}`;
  }
}

const l45Wallet = new L45Wallet("Ada", 50);
l45Wallet.add(19.99);
l45Wallet.spend(5);
l45Wallet.spend(500);

// prints Ada: 64.99 EUR, 3 movements, last refused 500.00 EUR
console.log(l45Wallet.report());

<!-- cell: markdown -->
A loan, a card and an account can each hold an `L45Journal` the same way. With inheritance,
`Wallet extends Journal` would be nonsense — a wallet is not a journal — and every class that
needed a journal would have to inherit from the same place.

### Exercise

Every account charges a fee on outgoing money, but the rule differs per customer. Instead of
one subclass per rule, the account **holds** a fee policy.

1. Run `check:nb` and fix both `[to fix]` errors. One of them reaches inside the policy
   instead of asking it.
2. `send(amount)` returns `false` and changes nothing when the amount is `0` or less, or when
   the amount plus its fee is above the balance. Otherwise it subtracts both and returns
   `true`.
3. `describeFees()` returns `"Fees: 1.5% (min 0.50 EUR)"` — the policy already knows how to
   describe itself.
4. Don't add subclasses, and don't change `L45FeePolicy`.

Don't open `solutions.ipynb` until you've genuinely tried.

<!-- cell: code type-error-exercise -->
// This cell has type errors on purpose. Fix them.

// Given: don't change this class.
class L45FeePolicy {
  constructor(
    private readonly percent: number,
    private readonly minimum: number,
  ) {}

  public feeFor(amount: number): number {
    return Math.max(this.minimum, Math.round(amount * (this.percent / 100) * 100) / 100);
  }

  public describe(): string {
    return `${this.percent}% (min ${this.minimum.toFixed(2)} EUR)`;
  }
}

// Your work starts here.
class L45Account {
  private balance: number;

  constructor(
    public readonly owner: string,
    balance: number,
    private readonly fees: L45FeePolicy,
  ) {
    this.balance = balance;
  }

  public get balanceNow(): number {
    return this.balance;
  }

  public send(amount: number): boolean {
    // TODO: refuse 0 or less, and anything the balance can't cover once the fee is added
    return 0;
  }

  public describeFees(): string {
    // TODO: ask the policy to describe itself
    return `Fees: ${this.fees.percent}%`;
  }
}

const l45Standard = new L45FeePolicy(1.5, 0.5);
const l45Mine = new L45Account("Ada", 200, l45Standard);
console.log(l45Mine.describeFees());

<!-- cell: markdown -->
### Verification

Run your exercise cell, then this cell. Every line should print `PASS`. Then run `check:nb`:
LESSON 45 must have no `[to fix]` errors left.

<!-- cell: code verification -->
const l45Basic = new L45FeePolicy(1.5, 0.5);
const l45Free = new L45FeePolicy(0, 0);

const l45Ada = new L45Account("Ada", 200, l45Basic);
const l45Grace = new L45Account("Grace", 200, l45Free);

const l45Sent = l45Ada.send(120);
const l45TooBig = l45Ada.send(1000);
const l45Zero = l45Ada.send(0);
l45Grace.send(120);

checkAll([
  ["a payment the balance can cover", l45Sent, true],
  ["the fee is taken too, rounded", l45Ada.balanceNow, 78.2],
  ["a payment above the balance is refused", l45TooBig, false],
  ["0 is refused", l45Zero, false],
  ["the refused payments changed nothing", l45Ada.balanceNow, 78.2],
  ["the same class with a free policy", l45Grace.balanceNow, 80],
  ["the description comes from the policy", l45Ada.describeFees(), "Fees: 1.5% (min 0.50 EUR)"],
  ["and matches the other policy", l45Grace.describeFees(), "Fees: 0% (min 0.00 EUR)"],
]);

<!-- cell: markdown -->
### Mini Challenge

For each of these, choose **inheritance**, **composition**, or **neither — just a field**, and
give a one-line reason. Answer in comments in the cell below.

1. `SavingsAccount` and `CheckingAccount` need everything an account does, plus their own
   monthly fee, and the bank wants one list holding both.
2. Accounts, loans and cards should each keep a written record of every movement, in the same
   format.
3. A premium customer is a customer with a discount percentage. Nothing else differs.
4. A trading account needs everything an account does **and** everything a portfolio does.

<!-- cell: code challenge -->
// 1.
// 2.
// 3.
// 4.
