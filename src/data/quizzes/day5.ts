import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from './helpers'

/** Day 5 — OOP pillars, relationships, SOLID, principles, patterns (30 questions) */
export const day5Questions: QuizQuestion[] = [
  // ===== EASY (10) =====
  q({
    id: 'd5-q01',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['OOP Pillars', 'Encapsulation'],
    learningObjective: 'Identify encapsulation as hiding state behind a controlled API',
    question:
      'A class exposes public fields for balance and lets any caller set them freely. Which OOP pillar is most directly violated?',
    options: [
      'Polymorphism',
      'Encapsulation',
      'Inheritance',
      'Compilation',
    ],
    correctAnswer: 1,
    explanation:
      'Encapsulation bundles data with methods that protect invariants. Public mutable fields skip validation and expose representation.',
    whyWrong: {
      '0': 'Polymorphism is about interchangeable behaviors via a common type.',
      '2': 'Inheritance is about is-a reuse/specialization, not field visibility.',
      '3': 'Not an OOP pillar.',
    },
    interviewTakeaway:
      'Say “invariants behind methods,” not just “private fields.”',
  }),
  tf({
    id: 'd5-q02',
    difficulty: 'easy',
    topics: ['OOP Pillars', 'Abstraction'],
    learningObjective: 'Distinguish abstraction from hiding every detail forever',
    question:
      'True or False: Abstraction means exposing a useful interface while hiding implementation details that callers should not depend on.',
    correct: true,
    explanation:
      'Abstraction selects what to show (operations/contracts) and what to hide (how). It is not “no details exist,” but “callers need not know them.”',
    whyWrong: {
      '1': 'False confuses abstraction with “zero information” — a common mix-up with encapsulation wording.',
    },
    interviewTakeaway: 'Abstraction = meaningful interface; encapsulation = protecting how/state.',
  }),
  q({
    id: 'd5-q03',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Relationships', 'Composition'],
    learningObjective: 'Recognize composition as strong ownership of parts',
    question:
      'Order creates OrderLine instances internally, owns their lifecycle, and lines are never shared across orders. What relationship is this?',
    options: [
      'Association without ownership',
      'Aggregation (shared parts)',
      'Composition',
      'Inheritance',
    ],
    correctAnswer: 2,
    explanation:
      'Composition is strong whole–part ownership: the whole controls creation/lifecycle; parts are not shared across wholes.',
    whyWrong: {
      '0': 'Association is a general link; here ownership is strong.',
      '1': 'Aggregation allows independent/shared parts.',
      '3': 'Inheritance is is-a, not has-a.',
    },
    interviewTakeaway: 'Ownership + lifecycle + no sharing ⇒ composition.',
  }),
  q({
    id: 'd5-q04',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Binding', 'Polymorphism'],
    learningObjective: 'Define dynamic dispatch for instance methods',
    question:
      'In Java, Animal a = new Dog(); a.speak(); where speak() is an instance method overridden in Dog. Which method runs?',
    options: [
      'Animal.speak always, because the variable type is Animal',
      'Dog.speak via dynamic (runtime) dispatch on the object’s class',
      'Neither — override is illegal',
      'A random subclass method',
    ],
    correctAnswer: 1,
    explanation:
      'Virtual/instance methods dispatch on the runtime type of the receiver (Dog), not the compile-time reference type.',
    whyWrong: {
      '0': 'Compile-time type governs what you can call, not which override runs.',
      '2': 'Overrides are core to polymorphism.',
      '3': 'Dispatch is deterministic.',
    },
    interviewTakeaway: 'Runtime type decides overridden instance methods.',
  }),
  q({
    id: 'd5-q05',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['SOLID', 'SRP'],
    learningObjective: 'State Single Responsibility Principle intent',
    question:
      'Which change request best illustrates a Single Responsibility Principle violation?',
    options: [
      'A Report class that generates PDF and also sends email and persists audit logs when any of those change for different reasons',
      'A class with two private helper methods',
      'Using an interface with three methods',
      'Naming a method process()',
    ],
    correctAnswer: 0,
    explanation:
      'SRP: a module should have one reason to change. Mixing PDF layout, email delivery, and audit persistence couples unrelated change drivers.',
    whyWrong: {
      '1': 'Helpers do not imply multiple responsibilities.',
      '2': 'Interface size is ISP territory, not automatically SRP failure.',
      '3': 'Naming alone is not an SRP violation.',
    },
    interviewTakeaway: 'SRP = one reason to change, not “one method only.”',
  }),
  tf({
    id: 'd5-q06',
    difficulty: 'easy',
    topics: ['Principles', 'DRY'],
    learningObjective: 'Avoid cargo-cult DRY that couples unrelated concepts',
    question:
      'True or False: DRY means you must always extract any duplicated lines into a shared method, even if the duplicates represent different domain rules that will evolve separately.',
    correct: false,
    explanation:
      'DRY targets duplicated knowledge/rules, not accidental textual similarity. Forcing one abstraction for diverging concepts creates brittle coupling.',
    whyWrong: {
      '0': 'True over-applies DRY — interviewers probe this.',
    },
    interviewTakeaway: 'DRY = one source of truth for the same knowledge, not zero duplicate tokens.',
  }),
  q({
    id: 'd5-q07',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Patterns', 'Singleton'],
    learningObjective: 'Identify Singleton intent',
    question: 'What problem does the Singleton pattern primarily address?',
    options: [
      'Ensuring a class has at most one instance and a global access point',
      'Building complex objects step by step',
      'Adapting an incompatible interface',
      'Notifying many dependents of state changes',
    ],
    correctAnswer: 0,
    explanation:
      'Singleton restricts instantiation to one (or a controlled number) and provides a shared access point — often controversial for testing.',
    whyWrong: {
      '1': 'That is Builder.',
      '2': 'That is Adapter.',
      '3': 'That is Observer.',
    },
    interviewTakeaway: 'Name Singleton’s testing/global-state trade-offs unprompted.',
  }),
  q({
    id: 'd5-q08',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Patterns', 'Strategy'],
    learningObjective: 'Map Strategy to interchangeable algorithms',
    question:
      'A checkout needs to swap payment algorithms (card, UPI, wallet) without changing the checkout orchestrator. Which pattern fits best?',
    options: ['Singleton', 'Strategy', 'Decorator', 'Adapter'],
    correctAnswer: 1,
    explanation:
      'Strategy encapsulates a family of algorithms behind a common interface and selects one at runtime.',
    whyWrong: {
      '0': 'Singleton controls instance count, not algorithm families.',
      '2': 'Decorator adds layered behavior around one component.',
      '3': 'Adapter bridges incompatible interfaces of existing types.',
    },
    interviewTakeaway: 'Strategy = composition of interchangeable behaviors.',
  }),
  q({
    id: 'd5-q09',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Composition vs Inheritance'],
    learningObjective: 'Prefer composition for has-a reuse',
    question:
      'Car needs an Engine. Why is Car extends Engine usually the wrong model?',
    options: [
      'Inheritance is banned in Java',
      'It models has-a as is-a, breaking substitutability and locking into a brittle hierarchy',
      'Composition cannot hold fields',
      'Engines cannot be classes',
    ],
    correctAnswer: 1,
    explanation:
      'A Car is not an Engine. Inheritance implies substitutability; has-a should be a field (composition/aggregation).',
    whyWrong: {
      '0': 'False.',
      '2': 'Composition is implemented with fields/delegates.',
      '3': 'Nonsense.',
    },
    interviewTakeaway: '“Favor composition over inheritance” starts with true is-a checks.',
  }),
  q({
    id: 'd5-q10',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Patterns', 'Observer'],
    learningObjective: 'Identify Observer publish–subscribe intent',
    question:
      'A stock ticker notifies many UI widgets when price changes, without the ticker knowing concrete widget classes. Which pattern is this?',
    options: ['Factory', 'Observer', 'Builder', 'Singleton'],
    correctAnswer: 1,
    explanation:
      'Observer (publish–subscribe) lets subjects notify dependents through an abstract listener/observer interface.',
    whyWrong: {
      '0': 'Factory creates objects.',
      '2': 'Builder constructs complex objects.',
      '3': 'Singleton limits instances.',
    },
    interviewTakeaway: 'Observer decouples event source from listeners.',
  }),

  // ===== MEDIUM (10) =====
  q({
    id: 'd5-q11',
    type: 'code',
    difficulty: 'medium',
    topics: ['Binding', 'Static vs Dynamic'],
    learningObjective: 'Predict static method hiding vs instance override',
    question: 'Static vs instance call on A x = new B(); x.s(); x.i(); — what is printed?',
    codeSnippet: {
      language: 'java',
      code: `class A {
  static void s() { System.out.print("A"); }
  void i() { System.out.print("a"); }
}
class B extends A {
  static void s() { System.out.print("B"); }
  @Override void i() { System.out.print("b"); }
}
A x = new B();
x.s();
x.i();`,
    },
    options: ['Bb', 'Ab', 'Ba', 'Aa'],
    correctAnswer: 1,
    explanation:
      'Static methods are resolved on the compile-time type (A.s → "A"). Instance methods dispatch on runtime type (B.i → "b").',
    whyWrong: {
      '0': 'Assumes statics are virtual.',
      '2': 'Swaps static/instance rules.',
      '3': 'Ignores override of i().',
    },
    interviewTakeaway: 'Statics hide; instance methods override.',
  }),
  q({
    id: 'd5-q12',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Relationships', 'Aggregation'],
    learningObjective: 'Contrast aggregation with composition',
    question:
      'A Department references Employee objects that also belong to a company-wide employee registry and outlive any single department. Best classification?',
    options: [
      'Composition — department owns employees exclusively',
      'Aggregation/association — employees are shared and independent',
      'Inheritance — department is-a employee',
      'Decorator — department wraps employee',
    ],
    correctAnswer: 1,
    explanation:
      'Parts that outlive the whole and can be shared are aggregation (or plain association), not composition.',
    whyWrong: {
      '0': 'Exclusive lifecycle ownership would be composition.',
      '2': 'Not an is-a relationship.',
      '3': 'Decorator is a structural pattern, not a UML ownership link.',
    },
    interviewTakeaway: 'Ask: can the part be shared / outlive the whole?',
  }),
  q({
    id: 'd5-q13',
    type: 'multi',
    difficulty: 'medium',
    topics: ['SOLID', 'OCP', 'LSP'],
    learningObjective: 'Recognize Open–Closed and Liskov cues',
    question:
      'Which design moves align with OCP and/or LSP? (Select all that apply)',
    options: [
      'Extend behavior by adding a new Strategy implementation instead of editing a giant switch',
      'Override withdraw() in a SquareAccount subclass to throw because “squares can’t withdraw” while clients expect Account',
      'Program to an interface so new payment types plug in without changing callers',
      'Strengthen preconditions in a subclass method beyond the base contract',
    ],
    correctAnswer: [0, 2],
    explanation:
      'OCP favors extension points (Strategy/interfaces). LSP forbids weakening postconditions or strengthening preconditions / surprising throws that break client expectations.',
    whyWrong: {
      '1': 'Classic LSP violation — subclass not substitutable.',
      '3': 'Stronger preconditions break LSP.',
    },
    interviewTakeaway: 'OCP needs stable extension points; LSP protects substitutability.',
  }),
  q({
    id: 'd5-q14',
    type: 'code',
    difficulty: 'medium',
    topics: ['Binding', 'Overload vs Override'],
    learningObjective: 'Show overload resolution is compile-time',
    question: 'Overload print(Animal)/print(Dog) with Animal a = new Dog(); print(a); — what is printed?',
    codeSnippet: {
      language: 'java',
      code: `void print(Animal a) { System.out.print("Animal"); }
void print(Dog d) { System.out.print("Dog"); }
Animal a = new Dog();
print(a);`,
    },
    options: ['Dog', 'Animal', 'Compile error', 'RuntimeException'],
    correctAnswer: 1,
    explanation:
      'Overload selection uses the compile-time argument type (Animal). Runtime type does not pick print(Dog).',
    whyWrong: {
      '0': 'Confuses overload with override/dispatch.',
      '2': 'Valid overload call.',
      '3': 'No throw.',
    },
    interviewTakeaway: 'Overloads = compile time; overrides = runtime.',
  }),
  q({
    id: 'd5-q15',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Patterns', 'Factory', 'Builder'],
    learningObjective: 'Choose Factory vs Builder',
    question:
      'You need to construct an HttpRequest with many optional headers/timeouts in a readable fluent API, validating only at the end. Which pattern fits best?',
    options: [
      'Singleton',
      'Builder',
      'Observer',
      'Adapter',
    ],
    correctAnswer: 1,
    explanation:
      'Builder accumulates optional configuration step-by-step and produces a consistent object on build().',
    whyWrong: {
      '0': 'Does not solve telescoping constructors.',
      '2': 'About notifications, not construction.',
      '3': 'About interface compatibility.',
    },
    interviewTakeaway: 'Factory = which type; Builder = how to assemble a complex one.',
  }),
  q({
    id: 'd5-q16',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['Principles', 'KISS', 'DRY'],
    learningObjective: 'Balance KISS against premature abstraction',
    question:
      'Two services share three similar lines of logging. A teammate wants a 12-class framework “for reuse.” What is the best KISS-aligned response?',
    options: [
      'Always extract a framework when any duplication appears',
      'Keep a small shared helper if the knowledge is truly shared; avoid a framework until a stable reuse need is proven',
      'Copy-paste forever and never extract',
      'Use Singleton for the logger so abstraction is unnecessary',
    ],
    correctAnswer: 1,
    explanation:
      'KISS favors the simplest design that works. Extract real shared knowledge modestly; don’t invent frameworks for accidental duplication.',
    whyWrong: {
      '0': 'Premature abstraction violates KISS.',
      '2': 'Ignores genuine shared knowledge (DRY).',
      '3': 'Singleton doesn’t address abstraction scope.',
    },
    interviewTakeaway: 'Say when you’d wait to abstract — interview gold.',
  }),
  q({
    id: 'd5-q17',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Patterns', 'Adapter', 'Decorator'],
    learningObjective: 'Distinguish Adapter from Decorator',
    question:
      'You have a legacy XmlPaymentGateway. Your app expects PaymentProcessor. You write a wrapper that translates calls/data formats. Which pattern?',
    options: [
      'Decorator — because it wraps another object',
      'Adapter — because it makes an incompatible interface usable',
      'Strategy — because it swaps algorithms',
      'Observer — because it listens to payments',
    ],
    correctAnswer: 1,
    explanation:
      'Adapter converts one interface to another clients expect. Decorator keeps the same interface and adds behavior.',
    whyWrong: {
      '0': 'Same-interface layering is Decorator; here the interfaces differ.',
      '2': 'No family of interchangeable algorithms.',
      '3': 'Not an event subscription design.',
    },
    interviewTakeaway: 'Adapter changes interface; Decorator preserves it.',
  }),
  q({
    id: 'd5-q18',
    type: 'code',
    difficulty: 'medium',
    topics: ['Patterns', 'Decorator'],
    learningObjective: 'Trace stacked decorator behavior',
    question: 'Decorator stack Sugar(Milk(Simple)).desc() — what is printed?',
    codeSnippet: {
      language: 'java',
      code: `interface Coffee { String desc(); }
class Simple implements Coffee {
  public String desc() { return "coffee"; }
}
class Milk implements Coffee {
  Coffee c; Milk(Coffee c) { this.c = c; }
  public String desc() { return c.desc() + "+milk"; }
}
class Sugar implements Coffee {
  Coffee c; Sugar(Coffee c) { this.c = c; }
  public String desc() { return c.desc() + "+sugar"; }
}
Coffee c = new Sugar(new Milk(new Simple()));
System.out.print(c.desc());`,
    },
    options: [
      'coffee+milk+sugar',
      'coffee+sugar+milk',
      'sugar+milk+coffee',
      'coffee',
    ],
    correctAnswer: 0,
    explanation:
      'Innermost Simple returns "coffee"; Milk appends "+milk"; Sugar appends "+sugar".',
    whyWrong: {
      '1': 'Wrong stacking order — Sugar wraps Milk.',
      '2': 'Decorators append after delegating inward.',
      '3': 'Ignores decorators.',
    },
    interviewTakeaway: 'Decorator order is part of the design.',
  }),
  q({
    id: 'd5-q19',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['SOLID', 'ISP'],
    learningObjective: 'Count ISP-motivated interface splits',
    question:
      'A fat Worker interface has work(), eat(), sleep(). Robot implements Worker but must no-op or throw on eat/sleep. If you split into Workable and MaintenanceNeeds (eat/sleep), how many of the original three methods belong on Workable for Robot? Enter an integer.',
    correctAnswer: '1',
    acceptedAnswers: ['1', 'one'],
    explanation:
      'ISP: clients depend only on methods they use. Robot needs work() only → one method on Workable.',
    whyWrong: {
      '3': 'Keeping all three forces Robot into unused contracts.',
      '0': 'Robot still needs work().',
    },
    interviewTakeaway: 'Fat interfaces force dummy methods — split by client needs.',
  }),
  q({
    id: 'd5-q20',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Composition vs Inheritance', 'Polymorphism'],
    learningObjective: 'Reuse behavior via composition + interfaces',
    question:
      'Several notification channels need shared retry/backoff, but also unrelated hierarchies (Email already extends TemplateMail). Best approach?',
    options: [
      'Force all channels to extend RetryableChannel abstract class only',
      'Put retry in a collaborator (composition) and keep channel-specific types behind a Notifier interface',
      'Copy retry code into every class forever',
      'Make Object the superclass for retry via reflection',
    ],
    correctAnswer: 1,
    explanation:
      'Java single inheritance is precious. Share retry via a helper/component; vary channels through interfaces/polymorphism.',
    whyWrong: {
      '0': 'Blocks other necessary superclasses.',
      '2': 'Abandons reuse without reason.',
      '3': 'Not a sound design.',
    },
    interviewTakeaway: 'Composition for reuse; interfaces for polymorphism.',
  }),

  // ===== HARD (10) =====
  q({
    id: 'd5-q21',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['SOLID', 'OCP', 'Patterns', 'Strategy'],
    learningObjective: 'Combine OCP with Strategy under changing pricing rules',
    question:
      'Pricing starts as if/else on customer type. Product wants monthly new discount rules without editing a 400-line PriceService. Which design best applies OCP with a pattern?',
    options: [
      'Keep the if/else; add more else-if branches forever',
      'Introduce a PricingStrategy interface; register/select strategies (map/list) so new rules are new classes; PriceService orchestrates only',
      'Make PriceService a Singleton so branches are global',
      'Use Adapter to rename PriceService methods',
    ],
    correctAnswer: 1,
    explanation:
      'Strategy (+ registration) opens for extension (new classes) and closes PriceService against modification of every rule — OCP in practice.',
    whyWrong: {
      '0': 'Opposite of OCP.',
      '2': 'Singleton doesn’t remove branching or aid extension.',
      '3': 'Adapter doesn’t address rule explosion.',
    },
    interviewTakeaway: 'Cite Strategy as a concrete OCP mechanism.',
  }),
  q({
    id: 'd5-q22',
    type: 'code',
    difficulty: 'hard',
    topics: ['Binding', 'Polymorphism', 'LSP'],
    learningObjective: 'Spot LSP risk via override that changes contract',
    question:
      'Clients rely on Bird.fly() to succeed for any Bird. What does this design violate, and what prints when fly() is called on Bird b = new Penguin()?',
    codeSnippet: {
      language: 'java',
      code: `class Bird {
  void fly() { System.out.print("fly"); }
}
class Penguin extends Bird {
  @Override void fly() { throw new UnsupportedOperationException(); }
}
Bird b = new Penguin();
b.fly();`,
    },
    options: [
      'No violation; prints fly',
      'LSP violation; throws UnsupportedOperationException at runtime',
      'Compile error on override',
      'OCP violation only; prints fly',
    ],
    correctAnswer: 1,
    explanation:
      'Penguin is not substitutable for Bird if fly() is part of Bird’s contract — LSP break. Dynamic dispatch still calls Penguin.fly(), which throws.',
    whyWrong: {
      '0': 'Override throws; also model is wrong.',
      '2': 'Override is allowed syntactically.',
      '3': 'Wrong principle and wrong output.',
    },
    interviewTakeaway: 'Model capabilities (FlyingBird) instead of lying inheritance.',
  }),
  q({
    id: 'd5-q23',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['SOLID', 'DIP', 'Patterns', 'Factory'],
    learningObjective: 'Apply DIP with Factory for construction',
    question:
      'OrderService new PostgresOrderRepository() hard-codes infrastructure. Tests can’t substitute fakes. Which change best applies DIP and a creational pattern?',
    options: [
      'Keep new; use reflection in tests to rewrite bytecode only',
      'Depend on OrderRepository abstraction; inject it (or obtain from an Abstract Factory/Factory method) so Postgres is a detail',
      'Make OrderService extend PostgresOrderRepository',
      'Convert repository methods to statics on OrderService',
    ],
    correctAnswer: 1,
    explanation:
      'DIP: high-level modules depend on abstractions. Factories/DI supply concrete implementations at the edges.',
    whyWrong: {
      '0': 'Fragile and avoids design fix.',
      '2': 'Inheritance worsens coupling.',
      '3': 'Statics harden coupling further.',
    },
    interviewTakeaway: 'DIP + Factory/DI = testable boundaries.',
  }),
  q({
    id: 'd5-q24',
    type: 'multi',
    difficulty: 'hard',
    topics: ['SOLID', 'Patterns', 'Decorator', 'SRP'],
    learningObjective: 'Combine Decorator with SRP for cross-cutting concerns',
    question:
      'A PaymentProcessor should charge cards. You also need logging, metrics, and idempotency keys. Which statements are sound? (Select all that apply)',
    options: [
      'Wrap a core processor with Decorator layers (logging, metrics, idempotency) each with one reason to change',
      'Put logging, metrics, idempotency, and charging in one class to keep “simple”',
      'Keep the same PaymentProcessor interface on decorators so callers stay stable (OCP-friendly)',
      'Use inheritance: LoggingMetricsIdempotentProcessor extends 3 unrelated base classes',
    ],
    correctAnswer: [0, 2],
    explanation:
      'Decorators preserve the interface and split cross-cutting concerns (SRP). Java cannot multiply inherit implementation bases.',
    whyWrong: {
      '1': 'Re-creates a multi-reason god class.',
      '3': 'Illegal/impractical in Java; wrong tool.',
    },
    interviewTakeaway: 'Decorator stacks ≈ SRP for orthogonal behaviors.',
  }),
  q({
    id: 'd5-q25',
    type: 'code',
    difficulty: 'hard',
    topics: ['Patterns', 'Singleton', 'Binding'],
    learningObjective: 'Reason about unsafe lazy Singleton under concurrency',
    question:
      'Two threads call getInstance() at the same time on this class. What is the main correctness risk?',
    codeSnippet: {
      language: 'java',
      code: `class S {
  private static S inst;
  private S() {}
  static S getInstance() {
    if (inst == null) inst = new S(); // no lock
    return inst;
  }
}`,
    },
    options: [
      'None — Java guarantees one instance automatically',
      'Race can create multiple instances; later readers may see different objects',
      'The private constructor makes getInstance unreachable',
      'It always deadlocks',
    ],
    correctAnswer: 1,
    explanation:
      'Check-then-act without synchronization allows both threads to observe null and construct two Singletons — classic bug; use enum, holder, or locked DCL carefully.',
    whyWrong: {
      '0': 'No such guarantee for this pattern.',
      '2': 'Private ctor still callable inside the class.',
      '3': 'No locking ⇒ no deadlock here.',
    },
    interviewTakeaway: 'Prefer enum Singleton or initialization-on-demand holder.',
  }),
  q({
    id: 'd5-q26',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['SOLID', 'ISP', 'Patterns', 'Adapter'],
    learningObjective: 'Use Adapter + ISP when integrating a wide third-party API',
    question:
      'A vendor SDK exposes a 40-method MegaClient. Your app only needs refund() and capture(). MegaClient also forces checked exceptions you dislike. Best design?',
    options: [
      'Pass MegaClient everywhere and call whatever methods are convenient',
      'Define a narrow PaymentGateway interface (capture/refund); implement an Adapter that translates to MegaClient and maps exceptions',
      'Extend MegaClient in every service class',
      'Make MegaClient a Singleton and ignore ISP',
    ],
    correctAnswer: 1,
    explanation:
      'ISP keeps app code on a minimal interface; Adapter isolates vendor shape/exceptions — DIP-friendly too.',
    whyWrong: {
      '0': 'Couples the app to a fat, volatile SDK.',
      '2': 'Spreads vendor types deeper.',
      '3': 'Singleton doesn’t shrink the interface.',
    },
    interviewTakeaway: 'Narrow ports + Adapter at the boundary.',
  }),
  q({
    id: 'd5-q27',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Composition vs Inheritance', 'Patterns', 'Strategy', 'SOLID'],
    learningObjective: 'Refactor inheritance of behavior into Strategy (OCP/LSP safe)',
    question:
      'GameCharacter subclasses override attack() twenty ways; shared movement code lives in the base. New hybrid characters need mix-and-match attacks. What refactor best applies composition + Strategy and improves OCP/LSP?',
    options: [
      'Deeper inheritance: Hybrid extends Warrior extends Mage',
      'Compose GameCharacter with an AttackStrategy (and maybe MoveStrategy); add new attacks as new strategy classes',
      'Delete polymorphism; use one class with a type string and switches',
      'Make every attack a Singleton enum constant only',
    ],
    correctAnswer: 1,
    explanation:
      'Composition of strategies avoids brittle hierarchies and LSP tension from forced inheritance trees; new attacks extend by addition.',
    whyWrong: {
      '0': 'Combinatorial explosion and fragile base classes.',
      '2': 'Central switch fights OCP.',
      '3': 'Enum constants alone don’t replace flexible runtime composition.',
    },
    interviewTakeaway: '“Inheritance for is-a, Strategy for does-a.”',
  }),
  q({
    id: 'd5-q28',
    type: 'code',
    difficulty: 'hard',
    topics: ['Patterns', 'Observer', 'SOLID'],
    learningObjective: 'See Observer coupling and DIP in listener design',
    question:
      'Which change best reduces DIP/SRP issues in this sketch?',
    codeSnippet: {
      language: 'java',
      code: `class Order {
  EmailSender email = new EmailSender();
  void complete() {
    // ... domain work
    email.send("done");
  }
}`,
    },
    options: [
      'Keep EmailSender new; add SmsSender.new and PushSender.new inside complete()',
      'Emit a domain event / notify OrderCompleted listeners (Observer); email/SMS implement Listener — Order depends on abstraction',
      'Make Order extend EmailSender',
      'Move complete() into a GodService that imports all SDKs',
    ],
    correctAnswer: 1,
    explanation:
      'Observer/events let Order announce outcomes without knowing notification channels — SRP + DIP. Concrete senders plug in as listeners.',
    whyWrong: {
      '0': 'Hard-codes more infrastructure into the domain type.',
      '2': 'Nonsense inheritance.',
      '3': 'Concentrates coupling elsewhere.',
    },
    interviewTakeaway: 'Domain events ≈ Observer for decoupling side effects.',
  }),
  q({
    id: 'd5-q29',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Patterns', 'Builder', 'SOLID', 'DRY'],
    learningObjective: 'Defend Builder when validation and immutability matter',
    question:
      'An API client needs immutable Request objects with required URL, optional headers, and cross-field validation (body implies Content-Type). Telescoping constructors duplicated validation. Interviewer asks for pattern + principles. Best answer?',
    options: [
      'Public mutable fields — KISS',
      'Builder with required args in ctor/factory, fluent optionals, validate once in build(); keeps Request immutable (SRP: builder assembles, request holds state)',
      'Singleton Request reused for all calls',
      'Adapter from String to Request without validation',
    ],
    correctAnswer: 1,
    explanation:
      'Builder centralizes construction/validation (DRY for rules) and preserves immutability; Request stays a simple value — aligned with SRP.',
    whyWrong: {
      '0': 'Breaks encapsulation/invariants.',
      '2': 'Shared mutable/global request is unsafe.',
      '3': 'Skips the validation problem.',
    },
    interviewTakeaway: 'Builder shines for immutable objects with validation.',
  }),
  q({
    id: 'd5-q30',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['SOLID', 'Patterns', 'Decorator', 'Strategy', 'Composition'],
    learningObjective: 'Select a coherent pattern mix under SOLID constraints',
    question:
      'Design a report exporter: formats (CSV/PDF) vary, and you may optionally gzip and/or encrypt output. Constraints: no god class, OCP for new formats/filters, Java single inheritance. Which combination is strongest?',
    options: [
      'One Exporter class with boolean flags and nested switches',
      'ExportStrategy for format; decorate the OutputStream/Exporter with Gzip/Encrypt decorators; compose strategies + stream filters',
      'CSVExporter extends PDFExporter extends GZipExporter',
      'Singleton Factory that returns void and prints to System.out only',
    ],
    correctAnswer: 1,
    explanation:
      'Strategy varies format algorithms; Decorator layers orthogonal output transforms — composition avoids inheritance diamonds and keeps OCP/SRP.',
    whyWrong: {
      '0': 'Closed for extension only via edits; SRP failure.',
      '2': 'Rigid inheritance stack; wrong is-a chain.',
      '3': 'Doesn’t meet requirements.',
    },
    interviewTakeaway: 'Stack Strategy (what) with Decorator (extra how) via composition.',
  }),
]

export default day5Questions
