import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from '../helpers'

/** Day 5 module checkpoints — OOP + LLD (skip revision) */
export const day5ModuleQuizzes: Record<string, QuizQuestion[]> = {
  // ===== d5-m1 OOP Core Concepts =====
  'd5-m1': [
    q({
      id: 'd5-m1-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['OOP Pillars', 'Encapsulation'],
      learningObjective:
        'Identify encapsulation as protecting invariants behind a controlled API',
      question:
        'A Money class exposes a public BigDecimal amount field that callers can set to any value. Which OOP idea is most directly violated?',
      options: [
        'Polymorphism via interfaces',
        'Encapsulation of state and invariants',
        'Static method binding',
        'Garbage collection',
      ],
      correctAnswer: 1,
      explanation:
        'Encapsulation hides representation and enforces rules (e.g. non-negative money) through methods. Public mutable fields skip validation.',
      whyWrong: {
        '0': 'Polymorphism is about interchangeable behaviors, not field visibility.',
        '2': 'Binding concerns which method body runs, not invariant protection.',
        '3': 'GC is a runtime memory concern, not an OOP pillar.',
      },
      interviewTakeaway:
        'Say “protect invariants,” not just “make fields private.”',
    }),
    tf({
      id: 'd5-m1-q02',
      difficulty: 'easy',
      topics: ['Abstraction', 'Interfaces'],
      learningObjective:
        'Distinguish abstraction (useful interface) from hiding everything forever',
      question:
        'True or False: Abstraction means exposing a stable, useful contract while hiding implementation details callers should not depend on.',
      correct: true,
      explanation:
        'Abstraction selects what to show (operations/semantics) and what to hide (how). Callers program to the contract, not the internals.',
      whyWrong: {
        '1': 'False would treat abstraction as “zero information,” which is incorrect.',
      },
      interviewTakeaway:
        'Abstraction = meaningful interface; encapsulation = protecting how/state.',
    }),
    q({
      id: 'd5-m1-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Inheritance', 'Polymorphism'],
      learningObjective: 'Recognize runtime dispatch for overridden instance methods',
      question:
        'In Java, Shape s = new Circle(); s.area(); where Circle overrides area(). Which method runs?',
      options: [
        'Shape.area always, because the variable type is Shape',
        'Circle.area via dynamic dispatch on the runtime type',
        'Neither — overrides are illegal in Java',
        'A randomly chosen subclass method',
      ],
      correctAnswer: 1,
      explanation:
        'Virtual/instance methods dispatch on the receiver’s runtime class (Circle), not the compile-time reference type.',
      whyWrong: {
        '0': 'Compile-time type controls the callable API, not which override runs.',
        '2': 'Overrides are central to polymorphism.',
        '3': 'Dispatch is deterministic.',
      },
      interviewTakeaway: 'Runtime type decides overridden instance methods.',
    }),
    q({
      id: 'd5-m1-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Binding', 'Static methods'],
      learningObjective: 'Contrast static binding with instance method dispatch',
      question:
        'Parent p = new Child(); both declare a static method greet(). What does p.greet() invoke (when called as Parent.greet / via reference typed Parent)?',
      options: [
        'Child.greet via dynamic dispatch',
        'Parent.greet — static methods bind to the compile-time type / declaring class, not the runtime instance',
        'Both Parent and Child greet methods',
        'A compile error always',
      ],
      correctAnswer: 1,
      explanation:
        'Static methods are not polymorphic. Resolution uses the compile-time type (or class name). Prefer ClassName.method() to avoid confusion.',
      whyWrong: {
        '0': 'Dynamic dispatch applies to instance methods, not static ones.',
        '2': 'Only one static method is selected.',
        '3': 'Calling a static via a reference is allowed (though discouraged).',
      },
      interviewTakeaway: 'Static = compile-time; instance override = runtime.',
    }),
    q({
      id: 'd5-m1-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Interfaces', 'Abstraction'],
      learningObjective: 'Choose interface vs concrete class for dependency design',
      question:
        'A payment service needs to charge cards and later support wallets without rewriting callers. What is the strongest OOP move?',
      options: [
        'Hard-code Stripe API calls in every controller',
        'Depend on a PaymentProcessor interface; inject concrete implementations',
        'Make every field public so adapters can patch state',
        'Use only static utility methods with no types',
      ],
      correctAnswer: 1,
      explanation:
        'Programming to an interface (abstraction) lets you swap implementations and extend payment channels without rewriting callers.',
      whyWrong: {
        '0': 'Hard-coding vendors couples callers to one provider.',
        '2': 'Public fields weaken encapsulation and do not define a contract.',
        '3': 'Static utilities do not model interchangeable behaviors well.',
      },
      interviewTakeaway: 'Depend on abstractions for swappable behavior.',
    }),
    tf({
      id: 'd5-m1-q06',
      difficulty: 'medium',
      topics: ['Inheritance', 'Composition'],
      learningObjective: 'Recognize when inheritance is the wrong default',
      question:
        'True or False: Preferring inheritance for every reuse need is usually safer than composition because subclasses automatically share private fields of the parent.',
      correct: false,
      explanation:
        'Inheritance for reuse often creates fragile hierarchies and tight coupling. Composition (“has-a”) is usually safer for reuse; inheritance is for true is-a specialization of behavior/contracts.',
      whyWrong: {
        '0': 'True would endorse inheritance-as-default, a common design anti-pattern.',
      },
      interviewTakeaway: 'Reuse via composition; inherit for true is-a.',
    }),
    q({
      id: 'd5-m1-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Encapsulation', 'Immutability'],
      learningObjective:
        'Spot encapsulation leaks via mutable getters returning internal collections',
      question:
        'Order.getLines() returns the internal List<OrderLine> directly. Callers clear() the list. What is the main design failure?',
      options: [
        'Dynamic dispatch failed',
        'Representation leaked — callers can break Order invariants without going through Order methods',
        'The class must be abstract',
        'Static binding was used incorrectly',
      ],
      correctAnswer: 1,
      explanation:
        'Returning live mutable internals bypasses the owning type’s API. Prefer unmodifiable views, defensive copies, or controlled mutation methods.',
      whyWrong: {
        '0': 'Dispatch is unrelated to collection aliasing.',
        '2': 'Abstractness does not fix a leaky getter.',
        '3': 'Binding is not the issue.',
      },
      interviewTakeaway:
        'Never return live mutable internals from an aggregate.',
    }),
    q({
      id: 'd5-m1-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Polymorphism', 'LSP'],
      learningObjective:
        'Detect behavioral inheritance that breaks substitutability expectations',
      question:
        'Square extends Rectangle and overrides setWidth to also set height so sides stay equal. Clients that resize a Rectangle independently then break. What went wrong conceptually?',
      options: [
        'Encapsulation was too strong',
        'The is-a inheritance broke expected Rectangle contracts (substitutability)',
        'Interfaces cannot have methods',
        'Static methods must be overridden',
      ],
      correctAnswer: 1,
      explanation:
        'Clients relying on Rectangle’s independent width/height semantics cannot safely use Square. Inheritance must preserve the parent’s behavioral contract, not just field shapes.',
      whyWrong: {
        '0': 'The bug is a broken contract, not “too much” encapsulation.',
        '2': 'Interfaces can declare methods.',
        '3': 'Static methods are not overridden polymorphically.',
      },
      interviewTakeaway:
        'Inheritance is about contracts, not just shared fields.',
    }),
  ],

  // ===== d5-m2 Object Relationships & Quality =====
  'd5-m2': [
    q({
      id: 'd5-m2-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Relationships', 'Composition'],
      learningObjective: 'Recognize composition as strong ownership of parts',
      question:
        'Document creates Paragraph instances, owns their lifecycle, and paragraphs are not shared across documents. What relationship is this?',
      options: [
        'Loose association only',
        'Aggregation with shared parts',
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
    tf({
      id: 'd5-m2-q02',
      difficulty: 'easy',
      topics: ['Coupling', 'Cohesion'],
      learningObjective: 'State the preferred coupling/cohesion direction',
      question:
        'True or False: Good modular design typically aims for high cohesion within a module and low coupling between modules.',
      correct: true,
      explanation:
        'High cohesion means related responsibilities stay together; low coupling means changes don’t ripple widely across modules.',
      whyWrong: {
        '1': 'False reverses a standard design quality goal.',
      },
      interviewTakeaway: 'High cohesion, low coupling — say it explicitly.',
    }),
    q({
      id: 'd5-m2-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Access control', 'Constructors'],
      learningObjective: 'Choose access level that matches intended API surface',
      question:
        'A helper used only inside the same package should generally be:',
      options: [
        'public so every module can call it',
        'package-private (default) or private if only one class needs it',
        'protected so subclasses everywhere can see it',
        'always static and public',
      ],
      correctAnswer: 1,
      explanation:
        'Minimize visibility. Package-private keeps helpers off the public API; private is even tighter when a single class owns the helper.',
      whyWrong: {
        '0': 'Public expands the API and coupling surface.',
        '2': 'Protected still exposes to subclasses and is often overused.',
        '3': 'Static/public is not a default for helpers.',
      },
      interviewTakeaway: 'Smallest access that still works.',
    }),
    q({
      id: 'd5-m2-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Aggregation', 'Composition'],
      learningObjective: 'Differentiate aggregation from composition via lifecycle',
      question:
        'A University holds Professor references, but professors also work at research labs and outlive any one department. Best label?',
      options: [
        'Composition — professors die with the university object',
        'Aggregation / association with weak ownership — parts can outlive the whole',
        'Inheritance — professor is-a university',
        'No relationship exists',
      ],
      correctAnswer: 1,
      explanation:
        'When parts are shared or outlive the whole, ownership is weak (aggregation/association), not composition.',
      whyWrong: {
        '0': 'Composition implies nested lifecycle ownership.',
        '2': 'Inheritance is is-a, not membership.',
        '3': 'There is a clear association.',
      },
      interviewTakeaway: 'Ask: can the part outlive / be shared?',
    }),
    q({
      id: 'd5-m2-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Coupling', 'Dependency'],
      learningObjective: 'Identify tight coupling smells',
      question:
        'Which design shows the tightest (worst) coupling?',
      options: [
        'Service depends on a PaymentGateway interface',
        'OrderService directly constructs StripeClient, parses its proprietary error enums, and reaches into its public fields',
        'Repository depends on a JDBC DataSource abstraction',
        'Controller depends on an application service interface',
      ],
      correctAnswer: 1,
      explanation:
        'Depending on concrete vendor types, private error shapes, and field access creates brittle, hard-to-test coupling.',
      whyWrong: {
        '0': 'Interface dependency is loose coupling.',
        '2': 'DataSource is an intentional abstraction boundary.',
        '3': 'Controller→service via interface is a normal layering choice.',
      },
      interviewTakeaway: 'Name the concrete dependency that makes change expensive.',
    }),
    tf({
      id: 'd5-m2-q06',
      difficulty: 'medium',
      topics: ['Constructors', 'Invariants'],
      learningObjective: 'Use constructors to establish valid objects',
      question:
        'True or False: A constructor (or factory) should establish a valid object; failing fast on illegal arguments is usually better than creating a half-initialized instance.',
      correct: true,
      explanation:
        'Objects should start valid. Throwing on bad inputs prevents invalid states from spreading through the system.',
      whyWrong: {
        '1': 'False would endorse zombie objects that violate invariants.',
      },
      interviewTakeaway: 'Valid at birth — or don’t create it.',
    }),
    q({
      id: 'd5-m2-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Cohesion', 'SRP'],
      learningObjective: 'Detect low cohesion / god-object smells',
      question:
        'UserManager validates passwords, renders HTML emails, runs SQL, and computes monthly billing. What quality problem dominates?',
      options: [
        'Too much polymorphism',
        'Low cohesion — unrelated reasons to change packed into one type',
        'Excessive use of private fields',
        'Missing inheritance tree',
      ],
      correctAnswer: 1,
      explanation:
        'Unrelated concerns (auth, presentation, persistence, billing) indicate low cohesion and multiple change drivers — split by responsibility.',
      whyWrong: {
        '0': 'Polymorphism is not the core smell here.',
        '2': 'Private fields are fine; the issue is mixed responsibilities.',
        '3': 'More inheritance would not fix cohesion.',
      },
      interviewTakeaway: 'Ask “who causes this class to change?”',
    }),
    q({
      id: 'd5-m2-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Composition', 'Access control'],
      learningObjective:
        'Preserve composition ownership when exposing parts',
      question:
        'Order owns OrderLines. A teammate wants a public setter setLines(List) that replaces the list reference with a caller-owned mutable list. Why is this risky?',
      options: [
        'Java forbids setters',
        'It can break ownership: external aliases can mutate lines and violate Order invariants',
        'Lists cannot be fields',
        'Dynamic dispatch stops working',
      ],
      correctAnswer: 1,
      explanation:
        'Composition requires controlling the part collection. Accepting/holding caller-owned mutable lists creates shared mutable ownership and invariant risk.',
      whyWrong: {
        '0': 'Setters are allowed; they can still be a bad API.',
        '2': 'Lists are valid fields.',
        '3': 'Dispatch is unrelated.',
      },
      interviewTakeaway:
        'Owned collections: copy in, never share the live list out.',
    }),
  ],

  // ===== d5-m3 Design Principles =====
  'd5-m3': [
    q({
      id: 'd5-m3-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['SOLID', 'SRP'],
      learningObjective: 'State Single Responsibility Principle intent',
      question:
        'Which situation best illustrates an SRP violation?',
      options: [
        'A ReportService that builds PDFs, sends email, and writes audit logs for unrelated stakeholders',
        'A class with three private helpers for one use case',
        'An interface with two methods in the same abstraction',
        'Using composition instead of inheritance',
      ],
      correctAnswer: 0,
      explanation:
        'SRP: one reason to change. Mixing PDF layout, email delivery, and audit persistence couples unrelated change drivers.',
      whyWrong: {
        '1': 'Helpers for one responsibility are fine.',
        '2': 'Interface size is more ISP than automatic SRP failure.',
        '3': 'Composition over inheritance is a separate principle.',
      },
      interviewTakeaway: 'SRP = one reason to change, not “one method.”',
    }),
    tf({
      id: 'd5-m3-q02',
      difficulty: 'easy',
      topics: ['SOLID', 'OCP'],
      learningObjective: 'State Open/Closed Principle at a high level',
      question:
        'True or False: Open/Closed suggests preferring extension (new types/plugins) over endlessly modifying a stable core for every new variant.',
      correct: true,
      explanation:
        'OCP: open for extension, closed for modification — add behavior by adding code rather than repeatedly editing battle-tested modules.',
      whyWrong: {
        '1': 'False would reject the core OCP idea.',
      },
      interviewTakeaway: 'Extend with new classes; protect stable cores.',
    }),
    q({
      id: 'd5-m3-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['DRY', 'KISS'],
      learningObjective: 'Apply KISS vs premature abstraction',
      question:
        'Two nearly identical private methods appear once in a 50-line script that will not grow. Best first instinct?',
      options: [
        'Immediately invent a framework and three interfaces',
        'Keep it simple; extract only if duplication becomes a real change-cost problem',
        'Copy the methods into every subclass via inheritance',
        'Make both methods public for reuse',
      ],
      correctAnswer: 1,
      explanation:
        'KISS/YAGNI: avoid premature abstractions. DRY matters when duplication shares a reason to change — not for every textual similarity.',
      whyWrong: {
        '0': 'Frameworks for tiny scripts violate KISS.',
        '2': 'Inheritance for reuse is often wrong.',
        '3': 'Public APIs expand coupling without need.',
      },
      interviewTakeaway: 'DRY the meaning, not every similar line.',
    }),
    q({
      id: 'd5-m3-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['SOLID', 'LSP'],
      learningObjective: 'Apply Liskov Substitution Principle',
      question:
        'A subclass overrides withdraw() to throw UnsupportedOperationException for all calls while the base type promises withdrawals succeed when funds exist. What principle is broken?',
      options: [
        'ISP only',
        'LSP — subtype is not safely substitutable for the base contract',
        'DIP — because no interface was used',
        'KISS — because the method is too short',
      ],
      correctAnswer: 1,
      explanation:
        'LSP requires subtypes to honor the behavioral expectations of the base type. Strengthening preconditions or weakening postconditions breaks clients.',
      whyWrong: {
        '0': 'ISP is about fat interfaces clients are forced to depend on.',
        '2': 'DIP is about depending on abstractions; the failure here is substitutability.',
        '3': 'KISS is unrelated.',
      },
      interviewTakeaway: 'Subtypes must keep the parent’s promises.',
    }),
    q({
      id: 'd5-m3-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['SOLID', 'ISP'],
      learningObjective: 'Recognize Interface Segregation Principle',
      question:
        'A fat Worker interface forces Robot to implement eat() and sleep() with empty stubs. Which SOLID principle is most relevant?',
      options: [
        'ISP — clients should not depend on methods they do not use',
        'SRP — because eat has two lines',
        'OCP — because stubs are closed',
        'DIP — because Robot is concrete',
      ],
      correctAnswer: 0,
      explanation:
        'ISP splits wide interfaces so implementers only take methods that make sense. Empty stubs are a classic ISP smell.',
      whyWrong: {
        '1': 'SRP is about reasons to change, not stub methods alone.',
        '2': 'OCP is about extension vs modification.',
        '3': 'DIP is about direction of dependencies.',
      },
      interviewTakeaway: 'Split fat interfaces; avoid no-op implementations.',
    }),
    tf({
      id: 'd5-m3-q06',
      difficulty: 'medium',
      topics: ['SOLID', 'DIP'],
      learningObjective: 'State Dependency Inversion Principle',
      question:
        'True or False: DIP says high-level policy modules should depend on abstractions, not on low-level concrete details.',
      correct: true,
      explanation:
        'Both high-level and low-level modules should depend on abstractions (interfaces). Details are injected/plugged in.',
      whyWrong: {
        '1': 'False would reverse DIP.',
      },
      interviewTakeaway: 'Policy depends on interfaces; details implement them.',
    }),
    q({
      id: 'd5-m3-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Composition over inheritance', 'OCP'],
      learningObjective:
        'Prefer composition/strategy over deep inheritance for varying behavior',
      question:
        'Pricing needs percent, BOGO, and VIP rules that will keep growing. A deep Discount → Seasonal → VipSeasonal inheritance tree is becoming unreadable. Better approach?',
      options: [
        'Add more levels until every combination has a class',
        'Compose an Order with a DiscountPolicy strategy (and combine policies if needed)',
        'Put all rules in one switch and never extract',
        'Make every field public for flexibility',
      ],
      correctAnswer: 1,
      explanation:
        'Strategy/composition lets you mix behaviors and extend via new policy types without combinatorial inheritance trees.',
      whyWrong: {
        '0': 'Combinatorial subclassing is the smell.',
        '2': 'A forever-growing switch fights OCP and readability.',
        '3': 'Public fields do not solve behavior variation.',
      },
      interviewTakeaway: 'Vary behavior with Strategy, not deep trees.',
    }),
    q({
      id: 'd5-m3-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['DRY', 'Coupling'],
      learningObjective: 'Avoid accidental DRY that couples unrelated domains',
      question:
        'Billing and Shipping both have a validateAddress() with similar code but different legal rules and change schedules. Extracting one shared util used by both is risky because:',
      options: [
        'Java cannot share methods',
        'Forced DRY can couple unrelated change drivers — a shipping tweak may break billing',
        'DRY always forbids helpers',
        'Addresses must be immutable strings only',
      ],
      correctAnswer: 1,
      explanation:
        'Duplication that looks similar but changes for different reasons should not share one abstraction. Premature DRY creates unwanted coupling.',
      whyWrong: {
        '0': 'Sharing is possible; the issue is design coupling.',
        '2': 'DRY is valuable when meaning truly is shared.',
        '3': 'Immutability is orthogonal.',
      },
      interviewTakeaway: 'Don’t DRY unrelated reasons to change.',
    }),
  ],

  // ===== d5-m4 Design Patterns =====
  'd5-m4': [
    q({
      id: 'd5-m4-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Creational Patterns', 'Factory'],
      learningObjective: 'Identify Factory’s purpose',
      question:
        'Callers need EmailNotification or SmsNotification without new-ing concretes everywhere. Which pattern fits best?',
      options: [
        'Observer',
        'Factory (creational) returning a Notification abstraction',
        'Decorator',
        'Adapter',
      ],
      correctAnswer: 1,
      explanation:
        'Factories encapsulate creation so callers depend on product abstractions, not concrete constructors.',
      whyWrong: {
        '0': 'Observer is about event notification, not creation.',
        '2': 'Decorator adds responsibilities dynamically.',
        '3': 'Adapter converts incompatible interfaces.',
      },
      interviewTakeaway: 'Factory = “who creates which subtype?”',
    }),
    tf({
      id: 'd5-m4-q02',
      difficulty: 'easy',
      topics: ['Creational Patterns', 'Singleton'],
      learningObjective: 'State a modern caution about Singleton',
      question:
        'True or False: Classic Singleton (global static instance) can hurt testability; DI “singleton scope” is often preferable.',
      correct: true,
      explanation:
        'Global singletons make substitution hard in tests. Prefer injecting a single shared instance from a composition root/container.',
      whyWrong: {
        '1': 'False ignores a standard interview critique of Singleton.',
      },
      interviewTakeaway: 'Singleton scope ≠ global static Singleton.',
    }),
    q({
      id: 'd5-m4-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Behavioral Patterns', 'Strategy'],
      learningObjective: 'Map Strategy to interchangeable algorithms',
      question:
        'A checkout flow swaps shipping cost calculators at runtime based on carrier. Best pattern?',
      options: [
        'Singleton',
        'Strategy',
        'Adapter',
        'Builder for every shipment field only',
      ],
      correctAnswer: 1,
      explanation:
        'Strategy encapsulates a family of interchangeable algorithms behind a common interface.',
      whyWrong: {
        '0': 'Singleton controls instance count, not algorithms.',
        '2': 'Adapter bridges incompatible APIs.',
        '3': 'Builder helps construct complex objects; it does not select shipping algorithms.',
      },
      interviewTakeaway: 'Strategy = plug-in algorithm.',
    }),
    q({
      id: 'd5-m4-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Structural Patterns', 'Adapter'],
      learningObjective: 'Distinguish Adapter from Decorator',
      question:
        'You must call a legacy XmlInventory API from code that expects InventoryService (JSON-shaped domain). Which pattern?',
      options: [
        'Observer',
        'Adapter — translate the incompatible interface',
        'Decorator — wrap to add logging only',
        'Singleton — one XML parser forever',
      ],
      correctAnswer: 1,
      explanation:
        'Adapter makes an existing interface usable by translating calls to another API. Decorator adds behavior while preserving the same interface.',
      whyWrong: {
        '0': 'Observer is publish/subscribe.',
        '2': 'Decorator assumes a compatible interface already.',
        '3': 'Singleton does not solve interface mismatch.',
      },
      interviewTakeaway: 'Adapter changes shape; Decorator adds behavior.',
    }),
    q({
      id: 'd5-m4-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Structural Patterns', 'Decorator'],
      learningObjective: 'Identify Decorator for layered responsibilities',
      question:
        'You want CompressedStream around EncryptedStream around FileStream, each adding behavior without rewriting FileStream. Pattern?',
      options: [
        'Factory Method only',
        'Decorator',
        'Abstract Factory for databases',
        'Observer',
      ],
      correctAnswer: 1,
      explanation:
        'Decorator wraps a component with the same interface to add responsibilities dynamically and combinatorially.',
      whyWrong: {
        '0': 'Factory creates objects; it does not layer behaviors.',
        '2': 'Abstract Factory creates families of related products.',
        '3': 'Observer notifies dependents of state changes.',
      },
      interviewTakeaway: 'Decorator = stackable wrappers, same interface.',
    }),
    tf({
      id: 'd5-m4-q06',
      difficulty: 'medium',
      topics: ['Behavioral Patterns', 'Observer'],
      learningObjective: 'State Observer’s intent',
      question:
        'True or False: Observer lets many dependents be notified of subject state changes without the subject hard-coding each concrete listener type.',
      correct: true,
      explanation:
        'Subjects depend on an observer abstraction; listeners register/unregister. This supports loose coupling for event-style updates.',
      whyWrong: {
        '1': 'False would deny Observer’s core publish/subscribe intent.',
      },
      interviewTakeaway: 'Observer = one-to-many notifications via interface.',
    }),
    q({
      id: 'd5-m4-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Creational Patterns', 'Builder', 'Abstract Factory'],
      learningObjective: 'Select Builder vs Abstract Factory appropriately',
      question:
        'You must construct a complex HttpRequest with many optional headers/timeouts (same product type). Separately, you need families of UI widgets for Light vs Dark themes. Best pairing?',
      options: [
        'Builder for HttpRequest; Abstract Factory for theme widget families',
        'Singleton for both problems',
        'Observer for construction; Adapter for themes',
        'Only inheritance trees for both',
      ],
      correctAnswer: 0,
      explanation:
        'Builder stepwise-constructs a complex single product. Abstract Factory creates families of related products (buttons/inputs per theme) consistently.',
      whyWrong: {
        '1': 'Singleton does not address construction complexity or product families.',
        '2': 'Observer/Adapter solve different problems.',
        '3': 'Deep inheritance is usually worse than these patterns here.',
      },
      interviewTakeaway:
        'Builder = complex object; Abstract Factory = product families.',
    }),
    q({
      id: 'd5-m4-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Pattern Selection'],
      learningObjective: 'Choose patterns from problem statements under trade-offs',
      question:
        'Interview prompt: “Notify many dashboards when inventory changes; also wrap the repository with caching and metrics without changing callers.” Best combo?',
      options: [
        'Factory + Singleton only',
        'Observer for notifications; Decorator for caching/metrics layers',
        'Adapter for both',
        'Builder for inventory rows only',
      ],
      correctAnswer: 1,
      explanation:
        'Observer fits multi-listener updates. Decorator stacks cross-cutting behaviors (cache, metrics) behind the same repository interface.',
      whyWrong: {
        '0': 'Creation patterns do not cover notification/layering needs.',
        '2': 'Adapter is for incompatible interfaces, not both needs.',
        '3': 'Builder constructs objects; it does not notify or decorate.',
      },
      interviewTakeaway: 'Map symptoms → intent → pattern; name trade-offs.',
    }),
  ],
}
