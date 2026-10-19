<!-- cell: markdown -->
# TypeScript — Classes

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
## LESSON 38 — Class syntax, properties, constructors and methods

### Exercise

<!-- cell: code solution -->
class L38Loan {
  borrower: string;
  principal: number;
  paid: number;

  constructor(borrower: string, principal: number) {
    this.borrower = borrower;
    this.principal = principal;
    this.paid = 0;
  }

  pay(amount: number): void {
    this.paid = Math.min(this.principal, this.paid + amount);
  }

  remaining(): number {
    return Math.round((this.principal - this.paid) * 100) / 100;
  }

  isSettled(): boolean {
    return this.remaining() === 0;
  }

  summary(): string {
    return `${this.borrower} owes ${this.remaining().toFixed(2)} EUR of ${this.principal.toFixed(2)} EUR`;
  }
}

const l38MyLoan = new L38Loan("Ada", 1000);
l38MyLoan.pay(400);
console.log(l38MyLoan.summary()); // prints Ada owes 600.00 EUR of 1000.00 EUR

<!-- cell: markdown -->
The four `[to fix]` errors came in two pairs. `principal` and `paid` were declared but never
assigned, so both declarations were reported (TS2564); `paid` starts at `0`, which the
constructor sets. The other two were wrong return values: `"0"` is not a `number`, and `0` is
not a `boolean`.

`Math.min` keeps a payment from going above the principal, and `isSettled` reuses
`remaining()` instead of repeating the subtraction — one method calling another through `this`.

**Common mistakes**

- **Deleting the property declarations to silence TS2564.** Then the class has no properties
  at all, and every `this.borrower` is reported instead:
  `Property 'borrower' does not exist on type 'L38Loan'.` (TS2339) — five errors in place of
  two. The declarations are what gives the class its shape.
- **Forgetting to round in `remaining()`.** After two payments of `333.33`,
  `1000 - 666.66` is `333.34000000000003` in JavaScript, so the check fails.
- **Not capping the payment.** A payment of `600` on a `500` loan leaves `remaining()` at
  `-100` and `isSettled()` at `false`.
- **Rounding inside `summary()` only.** `toFixed(2)` formats the text but doesn't change what
  `remaining()` returns, so the rounded-value check still fails.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Two lines:
//    - the declaration `cash: number;`
//      Property 'cash' has no initializer and is not definitely assigned in the constructor.
//      (TS2564)
//    - the line inside add():
//      Cannot find name 'cash'. Did you mean the instance member 'this.cash'? (TS2663)
//      This one is reported twice, once for each use of cash on that line.
//
// 2. `cash = cash;` is valid code: inside the constructor, `cash` is the parameter, so the
//    line assigns the parameter to itself. Nothing is wrong with it as an expression. The
//    compiler reports the consequence instead: `this.cash` never gets a value, which is the
//    TS2564 error on the declaration.
//
// 3.   this.cash = cash;
//      this.cash = this.cash + amount;

<!-- cell: markdown -->
Both messages point away from the line you have to change. TS2564 tells you the property is
never assigned, not which assignment is missing; TS2663 tells you a name isn't in scope and
guesses, correctly, that you meant a property. Reading the guess is usually faster than
reading the message.

<!-- cell: markdown -->
## LESSON 39 — Access modifiers: `public`, `private`, `protected`

### Exercise

<!-- cell: code solution -->
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
    if (amount > 0) {
      this.balance = this.balance + amount;
    }
  }

  public charge(amount: number): boolean {
    if (this.blocked || amount > this.balance) {
      return false;
    }
    this.balance = this.balance - amount;
    return true;
  }

  public block(): void {
    this.blocked = true;
  }

  public statement(): string {
    const state = this.blocked ? "blocked" : "active";
    return `${this.holder}: ${this.balance.toFixed(2)} EUR (${state})`;
  }
}

const l39MyCard = new L39Card("Ada", 50);
l39MyCard.topUp(25);
l39MyCard.block();
console.log(l39MyCard.statement()); // prints Ada: 75.00 EUR (blocked)

<!-- cell: markdown -->
The three `[to fix]` errors were all TS2341, two of them on the same line: reading and writing
`balance` from outside are two separate accesses. The fix wasn't to change the modifiers but to
go through the methods, `topUp(25)` and `block()` — which is the whole point of hiding the two
properties.

Notice where each rule lives: `charge` checks *before* it subtracts, so a refused charge leaves
the balance untouched, and no caller can get that wrong.

**Common mistakes**

- **Making the properties public to silence TS2341.** The errors go away and so does every
  guarantee: `card.balance = 1000` is legal again, and a charge can be recorded on a blocked
  card. The Verification cell still passes, which is exactly why this one is worth catching
  yourself.
- **Subtracting first, checking afterwards.** `this.balance = this.balance - amount;` followed
  by `if (this.balance < 0) return false;` returns the right answer with a wrong balance left
  behind.
- **Forgetting the blocked card in `charge`.** The amount fits, so it returns `true`.
- **Letting `topUp` accept a negative amount.** That is a withdrawal that skips every check in
  `charge`.

### Verification

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

<!-- cell: code challenge-solution -->
// owner: public — callers need the name, and reading it breaks nothing.
// balance: private — only the account's own methods may change it, so no rule is skipped.
// interestRate: private — the class uses it; nobody outside needs to set it.
// movements: private — the history must not be editable from outside.
// deposit: public — this is what the account is for.
// applyMonthlyInterest: public — the bank calls it from outside once a month.
// history: public — a read-only view of hidden data, returned as text.
// updateTotals: private — an internal helper. Keeping it private means it can change,
//   or disappear, without breaking any caller.
//
// With a subclass in mind: interestRate becomes protected, because a
// PremiumSavingsAccount needs to read (or override) the rate. updateTotals can also become
// protected if the subclass has to call it after adding its own movement. Everything else
// stays as it is: a subclass is not an excuse to open up the data.

<!-- cell: markdown -->
`private` and `protected` differ in one thing only: whether a subclass is inside the fence.
Start with `private`, and move a member to `protected` when a subclass actually needs it —
not before.

<!-- cell: markdown -->
## LESSON 40 — `readonly` and parameter properties

### Exercise

<!-- cell: code solution -->
class L40Deposit {
  private closed: boolean = false;

  constructor(
    public readonly iban: string,
    public readonly currency: "EUR" | "USD",
    private balance: number,
  ) {}

  public add(amount: number): boolean {
    if (this.closed || amount <= 0) {
      return false;
    }
    this.balance = this.balance + amount;
    return true;
  }

  public close(): number {
    this.closed = true;
    return this.balance;
  }

  public label(): string {
    const state = this.closed ? "closed" : "open";
    return `${this.iban} ${this.currency} ${this.balance.toFixed(2)} (${state})`;
  }
}

const l40MyDeposit = new L40Deposit("IT60", "EUR", 1000);
l40MyDeposit.add(250);
console.log(l40MyDeposit.label()); // prints IT60 EUR 1250.00 (open)

<!-- cell: markdown -->
Three declarations and three assignments became three constructor parameters. `closed` keeps
its own declaration with a starting value, because it isn't a constructor parameter: nobody
opens a deposit that is already closed.

The single `[to fix]` error was `correct()` assigning to a `readonly` property (TS2540). The
method had to go: the IBAN is part of the contract, and the class now says so in one word
instead of in a comment nobody reads.

**Common mistakes**

- **Dropping `readonly` to keep `correct()`.** The error disappears and so does the guarantee.
  When something genuinely has to change, it isn't `readonly` data — but an IBAN isn't that.
- **Forgetting the modifier on a constructor parameter.** Without `public`, `private`,
  `protected` or `readonly`, it stays an ordinary parameter and no property is created, so
  every `this.balance` is reported: `Property 'balance' does not exist on type 'L40Deposit'.`
  (TS2339)
- **Putting `closed` in the constructor to save a line.** Then callers can open a closed
  deposit. A starting value in the declaration is the right place for it.
- **Closing inside `label()`.** `label()` describes the deposit; only `close()` changes it.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. The first two lines are reported, both with TS2540:
//      Cannot assign to 'id' because it is a read-only property.
//      Cannot assign to 'holdings' because it is a read-only property.
//    The third line, portfolio.holdings.push("MSFT"), is accepted.
//
// 2. readonly promises that the property will keep pointing at the same value after the
//    constructor — not that the value itself can't be changed.
//
// 3. public readonly holdings: readonly string[]
//    The third line then gets:
//      Property 'push' does not exist on type 'readonly string[]'. (TS2339)

<!-- cell: markdown -->
## LESSON 41 — `static` members

### Exercise

<!-- cell: code solution -->
class L41Transfer {
  public static readonly maxAmount: number = 5000;
  private static made: number = 0;

  constructor(
    public readonly from: string,
    public readonly to: string,
    private amount: number,
  ) {
    L41Transfer.made = L41Transfer.made + 1;
  }

  public static isAllowed(amount: number): boolean {
    return amount > 0 && amount <= L41Transfer.maxAmount;
  }

  public static countMade(): number {
    return L41Transfer.made;
  }

  public line(): string {
    return `${this.from} -> ${this.to}: ${this.amount.toFixed(2)} EUR`;
  }
}

const l41Mine = new L41Transfer("IT60", "IT61", 100);
console.log(`${L41Transfer.maxAmount} ${l41Mine.line()}`); // prints 5000 IT60 -> IT61: 100.00 EUR

<!-- cell: markdown -->
Both `[to fix]` errors came from losing track of where a member lives: `this.amount` inside a
static method (TS2339 on `typeof L41Transfer`, because `this` is the class there), and
`l41Mine.maxAmount` through an instance (TS2576). Writing `L41Transfer.maxAmount` and
`L41Transfer.made` clears them.

`isAllowed` takes the amount as a parameter because it answers a question about a number, not
about a transfer: the form can call it before any transfer exists.

**Common mistakes**

- **Making `made` an instance property.** Then every transfer counts only itself, and
  `countMade()` returns `1` however many were created.
- **Declaring the counter `private static readonly`.** `readonly` allows an assignment in the
  declaration only, so the constructor's increment is reported:
  `Cannot assign to 'made' because it is a read-only property.` (TS2540) A counter changes,
  so `private static` is as far as you can lock it.
- **Making `isAllowed` an instance method.** It would need a transfer that doesn't exist yet.
- **Reading `maxAmount` through `this` inside `isAllowed`.** `this.maxAmount` happens to work
  in a static method, because `this` is the class — but the class name says what is going on.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Both return 2. There is one `issued` on the class, not one per ticket, and each
//    constructor call added 1 to that single counter. `seen()` only reads it.
//
// 2. No: `static issued` is public and writable, so assigning 99 from outside is allowed.
//    `private static issued` reports it —
//      Property 'issued' is private and only accessible within class 'Ticket'. (TS2341)
//    `static readonly issued` reports the constructor instead, because readonly allows an
//    assignment in the declaration only —
//      Cannot assign to 'issued' because it is a read-only property. (TS2540)
//
// 3. With `private static`, seen() still reads the counter, because it is inside the class.
//    Outside code can no longer read it or write it, so the only way to change the count is
//    to create a ticket — which is exactly what the counter is supposed to measure.

<!-- cell: markdown -->
## LESSON 42 — Getters and setters

### Exercise

<!-- cell: code solution -->
class L42StoreCard {
  private _spent: number = 0;

  constructor(
    public readonly holder: string,
    private _limit: number,
  ) {}

  get spent(): number {
    return Math.round(this._spent * 100) / 100;
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

const l42MyCard = new L42StoreCard("Ada", 100);
l42MyCard.spend(12.1);
l42MyCard.limit = 150;
console.log(`${l42MyCard.spent} of ${l42MyCard.limit}`); // prints 12.1 of 150

<!-- cell: markdown -->
Both `[to fix]` errors were the same placeholder, `return "0"` in a getter declared
`: number` (TS2322). A getter is typed exactly like a method, so a wrong return value is
reported in the same way.

`available` is worked out on every read instead of being stored, so it can't disagree with
`_spent` and `_limit`. `spend` reads `this.available` for its own check: the rule and the
getter can never drift apart.

The setter is where the "no limit below what is already spent" rule lives. A caller writes
`card.limit = 10` and simply doesn't get it — from outside it looks like a plain assignment.

**Common mistakes**

- **Rounding only in `available`.** Two spends of `12.1` and `7.77` leave `_spent` at
  `19.869999999999997`, so the `spent` check fails while `available` looks right.
- **Storing `_available` and updating it in `spend`.** It then has to be updated in the
  `limit` setter too, and the first method that forgets makes the card lie.
- **Checking `amount > this._limit` in `spend`.** That allows spending the whole limit again
  after money has already been spent. The limit for a new spend is what is *available*.
- **Letting the setter accept any number.** A limit below what has been spent would make
  `available` negative, and a card can't unspend money.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Stored _count and _total would be a second copy of something the positions already
//    say. Every method that changes _positions would have to update both, and the day one
//    forgets, the portfolio reports numbers that don't match its own data. Worked out on
//    read, they can't disagree. The cost is that each read does the work again, which for a
//    short array is nothing.
//
// 2. total is derived from the positions. Assigning a total would mean deciding how to
//    spread it over them, and there is no single right way. Derived values get a getter and
//    no setter, so the compiler reports the attempt (TS2540) instead of letting a caller
//    invent data.
//
// 3. isEmpty: getter — it reads like a fact about the portfolio.
//    biggest: getter — also a fact, though its type has to be number | undefined, because an
//      empty portfolio has no biggest position.
//    sell(value): method — it changes the portfolio, and it takes an argument.
//    report(): method — it builds something, and building a multi-line string is more work
//      than a caller expects from reading a property.

<!-- cell: markdown -->
## LESSON 43 — Inheritance: `extends` and `super`

### Exercise

<!-- cell: code solution -->
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

class L43StudentAccount extends L43Account {
  constructor(
    owner: string,
    balance: number,
    private university: string,
  ) {
    super(owner, balance);
  }

  public monthlyFee(): number {
    return 0;
  }

  public summary(): string {
    return `${super.summary()} (${this.university})`;
  }

  public addInterest(percent: number): void {
    this.balance = Math.round(this.balance * (1 + percent / 100) * 100) / 100;
  }
}

const l43Mine = new L43StudentAccount("Ada", 100, "MIT");
console.log(l43Mine.summary()); // prints Ada: 100.00 EUR, fee 0.00 EUR (MIT)

<!-- cell: markdown -->
The two `[to fix]` errors were both about the line between a subclass and its base class.
`this.charged` is `private` in `L43Account`, so a subclass can't see it
(`Property 'charged' is private and only accessible within class 'L43Account'.`, TS2341) —
`balance` is `protected`, which is why `addInterest` may change it. And
`new L43StudentAccount("Ada", 100)` was missing the third argument (TS2554): the subclass's
constructor is the one callers see.

`summary()` calls `super.summary()` and adds to it. Repeating the format instead would mean
two places to change the day the summary line changes.

**Common mistakes**

- **Copying the base class's summary text into the override.** It passes the check today and
  drifts tomorrow. `super.summary()` is the whole point of `super`.
- **Calling `this.summary()` inside the override.** That calls the override again, which
  calls itself again: the cell hangs or ends in a stack overflow. `super.` is what reaches
  the base class's version.
- **Making `charged` protected to get rid of TS2341.** The exercise says not to change
  `L43Account`, and the subclass doesn't need it: `feesPaid` already reads it.
- **Forgetting `super(owner, balance)`** when writing the constructor from scratch, or putting
  it after `this.university = university` (TS2377, TS17009).
- **Rounding after the multiplication only in the summary.** `100 + 50` then `+1.5%` is
  `152.24999999999997`; `toFixed(2)` would hide it in the text while the stored balance stays
  wrong.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. It calls the monthlyFee() of the object it is running on: the plain account's for a
//    plain account, the student account's for a student account. That is decided while the
//    program runs, from the real object, not from the type written in the code. It is why
//    one chargeMonthlyFee() serves every subclass.
//
// 2. The type says what may be used, not what happens to be there. l43Mixed is an
//    L43Account[], so every element is only guaranteed to be an L43Account, and the compiler
//    reports Property 'addInterest' does not exist on type 'L43Account'. (TS2339) The value
//    in slot 1 is a student account, but slot 0 isn't, and the compiler treats the array as
//    one type.
//
// 3. Write only the difference: monthlyFee() returning 5, a private counter, and an override
//    of chargeMonthlyFee() that calls super.chargeMonthlyFee() and then adds 1 to the
//    counter. Everything else — the balance, deposit, feesPaid, summary — stays in
//    L43Account, where it already works for every account.

<!-- cell: markdown -->
## LESSON 44 — Abstract classes

### Exercise

<!-- cell: code solution -->
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

class L44StudentLoan extends L44Loan {
  public yearlyRatePercent(): number {
    return 1.5;
  }

  public label(): string {
    return "Student loan";
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
    return 6.5;
  }

  public label(): string {
    return `Car loan (${this.plate})`;
  }
}

const l44Mine = new L44CarLoan("Grace", 4500, "AB-123-CD");
console.log(l44Mine.summary()); // prints Car loan (AB-123-CD) for Grace: 4792.50 EUR left

<!-- cell: markdown -->
Each subclass is only the two answers `L44Loan` couldn't give: a rate and a label. Everything
else — paying, the total, the remaining amount, the summary line — was written once.

The two `[to fix]` errors were the two mistakes `abstract` is designed to catch. Declaring
`yearlyRatePercent(): string` breaks the promise the abstract member makes, so it is reported
as an override that doesn't fit (TS2416). And `new L44Loan("Ada", 1700)` asks for a loan that
is no kind of loan (TS2511) — the class has no rate and no label to give.

**Common mistakes**

- **Copying `pay` or `totalDue` into a subclass.** They already work, and two copies drift
  apart. A subclass should hold only what differs.
- **Returning the rate as a string** and letting JavaScript's `"1.5" / 100` cover it up. The
  total even comes out right, which is why the check compares the rate itself.
- **Writing the label format twice**, once in each subclass and once in `summary()`. The
  summary asks `this.label()` and doesn't care what the answer looks like.
- **Making `L44Loan` non-abstract to allow `new L44Loan(...)`.** The compiler then accepts an
  object with no rate and no label, and the error moves to whoever calls `summary()`.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. With a default of 0, a subclass that forgets the rate compiles and runs. Every loan of
//    that kind quietly charges no interest, and nothing points at the missing line: the bug
//    lives in the money, not in the code. An abstract member turns "I forgot" into a
//    compiler error at the class that forgot.
//
// 2. Nothing breaks when the object is created — abstract is a compile-time rule, so at
//    runtime L44Loan is a normal class. It breaks on the first call that needs a subclass
//    answer: summary() calls this.label(), which doesn't exist, and the program stops with
//      TypeError: this.label is not a function
//    That is exactly the runtime crash TS2511 saves you from.
//
// 3. In the subclass: yearlyRatePercent() returning 8.5, label() returning "Mortgage", and an
//    override of pay() that refuses an amount below 500 and otherwise calls super.pay(amount).
//    In L44Loan: everything else. The base class already knows how to record a payment, and
//    the override adds one rule in front of it instead of rewriting it.

<!-- cell: markdown -->
## LESSON 45 — Composition vs inheritance

### Exercise

<!-- cell: code solution -->
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
    if (amount <= 0) {
      return false;
    }
    const total = Math.round((amount + this.fees.feeFor(amount)) * 100) / 100;
    if (total > this.balance) {
      return false;
    }
    this.balance = Math.round((this.balance - total) * 100) / 100;
    return true;
  }

  public describeFees(): string {
    return `Fees: ${this.fees.describe()}`;
  }
}

const l45Standard = new L45FeePolicy(1.5, 0.5);
const l45Mine = new L45Account("Ada", 200, l45Standard);
l45Mine.send(120);

// prints Fees: 1.5% (min 0.50 EUR) — 78.2 EUR left
console.log(`${l45Mine.describeFees()} — ${l45Mine.balanceNow} EUR left`);

<!-- cell: markdown -->
One `L45Account` class serves every fee rule, because the rule arrives as an object. A new
rule is a new `L45FeePolicy`, not a new class, and the accounts stay the same type.

The two `[to fix]` errors marked the two halves of delegation. `this.fees.percent` reached
inside the policy for data that belongs to it (TS2341); `describe()` is the policy's own job,
and the account only frames the answer. And `return 0` in a method declared `: boolean`
(TS2322) was the placeholder for the rule the account itself owns: what it can afford.

**Common mistakes**

- **Recomputing the fee inside `send`.** The policy holds the percentage and the minimum; a
  second copy of that formula in the account is the bug waiting to happen.
- **Adding `L45BasicAccount` and `L45FreeAccount` subclasses.** Two classes, two constructors
  and two type names, for what is one number and one minimum.
- **Forgetting the fee in the balance check.** `amount <= this.balance` lets a payment through
  that the fee then pushes past the balance.
- **Rounding only the subtraction.** `120 * 1.5%` is `1.7999999999999998`, so the total has to
  be rounded before it is compared and subtracted.

### Verification

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

<!-- cell: code challenge-solution -->
// 1. Inheritance, with an abstract base: both really are accounts, they share the balance and
//    every operation on it, and the bank wants one Account[] holding both. The monthly fee is
//    exactly the hole an abstract member leaves.
//
// 2. Composition: a Journal class that each of the three holds. They are not kinds of one
//    another, and a class can only extend one class anyway — inheritance would force all
//    three into one family for the sake of a shared helper.
//
// 3. Neither: add a discountPercent field, with 0 as the ordinary value. A subclass whose
//    only difference is a number gives you a second type name and no new behavior.
//
// 4. Composition: it needs two families of behavior, and a class can extend only one class.
//    Hold an account and a portfolio, and expose the operations the trading account really
//    offers instead of everything both parts can do.

<!-- cell: markdown -->
That is the whole of topic 11. You can now write a class, decide what it hides, lock down what
must not change, share what belongs to the class itself, expose data through accessors, extend
a class when a subclass really is one, leave the right holes with `abstract`, and choose the
part-holding design when it isn't. Topic 12 adds interfaces: the contracts these classes
promise to keep.
