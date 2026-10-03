import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  code,
  table,
  callout,
  diagram,
  example,
} from '../../../helpers'

export const d5p1: StudyPage = createPage(
  'd5-p1',
  'Classes, Objects & Encapsulation',
  18,
  [
    'Define class vs object and why the distinction matters in design interviews',
    'Explain encapsulation as information hiding via access control and invariants',
    'Design immutable value objects in Java and argue their trade-offs',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'A class is a blueprint: it declares state (fields) and behavior (methods) that share a coherent responsibility. An object is a runtime instance of that blueprint with its own identity and field values. Interviews care less about dictionary definitions and more about whether you use classes to protect invariants — rules that must always be true for the object to be valid.',
        ),
        h3('Why it exists'),
        p(
          'Without encapsulation, any code can mutate fields in illegal ways (negative balance, null required fields, broken caches). Encapsulation localizes validation and change. When requirements shift, you change one class instead of hunting every caller that touched raw fields.',
        ),
        h3('WHAT / WHY / HOW / WHEN'),
        ul([
          'WHAT: Bundle data + operations; hide representation behind a controlled API.',
          'WHY: Protect invariants, reduce coupling to internals, enable evolution.',
          'HOW: private fields, public methods, constructors that establish validity, getters that do not leak mutables.',
          'WHEN: Always for domain types with rules; less critical for simple DTOs that are pure data bags — but even DTOs benefit from clear ownership of mutation.',
        ]),
      ]),
      section('how', 'How it works', [
        p(
          'In Java, access modifiers are the first line of encapsulation: private (class only), package-private (default), protected (package + subclasses), public (everyone). Encapsulation is not “make everything private and add getters/setters.” A setter that blindly assigns breaks encapsulation if it allows invalid states. Prefer methods that express intent: deposit(amount), not setBalance(b).',
        ),
        diagram(
          `classDiagram
  class BankAccount {
    -Money balance
    -AccountId id
    +deposit(Money)
    +withdraw(Money)
    +getBalance() Money
  }
  note for BankAccount "Invariant: balance >= 0\\nMutations only via deposit/withdraw"`,
          'Encapsulation hides the representation; the public API preserves the invariant.',
        ),
        callout(
          'tip',
          'Interview phrasing: “Encapsulation is information hiding so clients depend on behavior, not storage. Getters/setters alone are not encapsulation if they expose a mutable bag.”',
          'Soundbite',
        ),
        h3('Immutability'),
        p(
          'An immutable object’s state cannot change after construction. In Java: final class, private final fields, no setters, defensive copies for mutable inputs/outputs, and constructors (or factories) that validate. Benefits: thread-safety without locks, safe sharing as map keys, simpler reasoning. Costs: more allocations when “updating” (create a new instance), awkward for large mutable graphs.',
        ),
      ]),
      section('example', 'Worked example', [
        example('Encapsulated account vs leaky DTO', [
          code(
            'java',
            `// BAD: encapsulation theater — public setters allow illegal state
public class LeakyAccount {
  public BigDecimal balance; // anyone can set -100
}

// GOOD: invariant enforced at the boundary
public final class BankAccount {
  private final String id;
  private BigDecimal balance;

  public BankAccount(String id, BigDecimal opening) {
    if (id == null || id.isBlank()) throw new IllegalArgumentException("id");
    if (opening == null || opening.signum() < 0)
      throw new IllegalArgumentException("opening");
    this.id = id;
    this.balance = opening;
  }

  public void deposit(BigDecimal amount) {
    requirePositive(amount);
    balance = balance.add(amount);
  }

  public void withdraw(BigDecimal amount) {
    requirePositive(amount);
    if (balance.compareTo(amount) < 0)
      throw new IllegalStateException("insufficient funds");
    balance = balance.subtract(amount);
  }

  public BigDecimal getBalance() {
    return balance; // BigDecimal is immutable — safe to return
  }

  private static void requirePositive(BigDecimal amount) {
    if (amount == null || amount.signum() <= 0)
      throw new IllegalArgumentException("amount");
  }
}`,
            'Operations encode business rules; callers cannot leave the object invalid.',
          ),
          code(
            'java',
            `// Immutable money value object
public final class Money {
  private final BigDecimal amount;
  private final Currency currency;

  private Money(BigDecimal amount, Currency currency) {
    this.amount = amount;
    this.currency = currency;
  }

  public static Money of(BigDecimal amount, Currency currency) {
    Objects.requireNonNull(amount);
    Objects.requireNonNull(currency);
    if (amount.scale() > currency.getDefaultFractionDigits())
      throw new IllegalArgumentException("scale");
    return new Money(amount, currency);
  }

  public Money plus(Money other) {
    requireSameCurrency(other);
    return new Money(amount.add(other.amount), currency);
  }
  // equals/hashCode based on amount + currency
}`,
            'Updates return new instances; no shared mutable money state.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Over-encapsulation: tiny classes with no behavior become ceremony; anemic domain models push all logic into services.',
          'Under-encapsulation: public fields / package-wide mutability creates invisible coupling and race conditions.',
          'Returning List from a getter: return Collections.unmodifiableList or a defensive copy, or expose Stream / read-only views.',
          'Records (Java 16+): great for immutable data carriers; still validate in compact constructors.',
          'Serialization frameworks often need no-arg constructors or accessors — design boundaries carefully so frameworks do not force leaky mutability into the domain core.',
        ]),
        callout(
          'warning',
          'Exposing a mutable ArrayList via getItems() lets callers clear() your internal list. That is an encapsulation bug, not a “Java quirk.”',
          'Mutable escape',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Encapsulation enables Abstraction: hide how, expose what.',
          'Immutability complements thread-safety discussions later in concurrency interviews.',
          'SOLID SRP often starts with “what invariant does this class own?”',
          'Composition: encapsulate collaborators behind the owning type’s API.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “Encapsulation means making fields private and providing getters/setters.”'),
        p('Interviewer: “Why? What does that buy you if setters are public?”'),
        p(
          'Strong answer: “Access control alone is weak. Encapsulation means the object refuses illegal transitions. Methods validate and preserve invariants. If every field has a public setter, clients still own the rules.”',
        ),
        p('Interviewer: “How would you make this thread-safe?”'),
        p(
          'Strong answer: “Prefer immutability for Money. For BankAccount, synchronize methods or use concurrent designs / actor-style single writer. Don’t sprinkle volatile on BigDecimal references and call it done.”',
        ),
        p('Interviewer: “Trade-off of immutability?”'),
        p(
          'Strong answer: “Safer sharing and simpler reasoning vs allocation churn and awkward in-place updates for large graphs. Use for values; use careful mutability for aggregates with clear ownership.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Equating encapsulation with “private + getters/setters.”',
      'Returning internal mutable collections from getters.',
      'Putting validation only in the UI/controller, never in the domain object.',
      'Using public fields “for speed” in shared models.',
      'Forgetting equals/hashCode contracts on value objects used in Sets/Maps.',
    ],
    interviewQuestions: [
      'What is the difference between a class and an object?',
      'What is encapsulation? Give a Java example.',
      'Why are private fields not enough for encapsulation?',
      'What is an immutable class in Java? How do you create one?',
      'When would you prefer a mutable object over an immutable one?',
    ],
    intermediateInterviewQuestions: [
      'How do you prevent mutable escape through getters?',
      'Explain encapsulation vs abstraction — are they the same?',
      'How do Java records help with immutable data carriers?',
      'Should every field have a getter? When would you omit one?',
      'How does encapsulation relate to API versioning and binary compatibility?',
    ],
    advancedInterviewQuestions: [
      'Design a Money type: currency, rounding, equality, and thread-safety.',
      'Your ORM requires setters. How do you keep domain invariants?',
      'Compare information hiding with the Law of Demeter.',
      'When is an anemic domain model acceptable vs harmful?',
      'How do package-private types help encapsulation at module boundaries?',
      'Discuss defensive copies vs unmodifiable views vs immutable collections (List.copyOf).',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain encapsulation with a concrete Java example.',
        answer:
          'Encapsulation hides how an object stores and protects its state, exposing only meaningful operations. A BankAccount keeps balance private and offers deposit/withdraw that reject negatives and overdrafts. Clients depend on that API, not on whether balance is a BigDecimal or long cents. Trade-off: more ceremony up front, but invariants stay in one place and internals can change without rewriting callers. Getters/setters alone are not encapsulation if they allow illegal states.',
      },
      {
        question: 'Why prefer immutable value objects?',
        answer:
          'Immutable objects are safely shareable across threads, make excellent map keys, and eliminate a class of aliasing bugs. In Java you use final fields, no setters, and return new instances for updates. Trade-off is allocation and less convenient in-place editing. I use immutability for Money, IDs, and DTOs at boundaries; mutable aggregates when a single owner clearly controls lifecycle.',
      },
    ],
    keyTakeaways: [
      'Class = blueprint; object = identity + state at runtime.',
      'Encapsulation protects invariants — not just private fields.',
      'Immutability buys safety and simplicity; pay with allocations.',
      'Never leak mutable internals from getters.',
    ],
  },
)

export const d5p2: StudyPage = createPage(
  'd5-p2',
  'Abstraction & Interfaces',
  18,
  [
    'Contrast abstract classes and interfaces in modern Java',
    'Choose the right abstraction boundary for APIs and plugins',
    'Explain abstraction as separating essential behavior from implementation detail',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Abstraction means focusing on what a collaborator can do, not how it does it. In Java you express abstractions with interfaces (and sometimes abstract classes). The goal is a stable contract so callers and implementors can evolve independently.',
        ),
        h3('Why it exists'),
        p(
          'Without abstraction, high-level policy (checkout, risk checks, reporting) hard-codes low-level details (Postgres, Stripe, a specific sorting algorithm). Every swap of technology becomes a rewrite. Abstraction lets you program to a contract: PaymentGateway.charge(...), not StripeClient.post(...).',
        ),
        table(
          ['Mechanism', 'Can have state?', 'Multiple inheritance?', 'Typical use'],
          [
            [
              'interface',
              'static/default only (instance fields: no)',
              'Yes — implement many',
              'Capability / role contracts',
            ],
            [
              'abstract class',
              'Yes — instance fields',
              'No — single extends',
              'Shared partial implementation + template',
            ],
            [
              'concrete class',
              'Yes',
              'N/A',
              'Full implementation',
            ],
          ],
          'Java abstraction toolkit (post-Java 8 interfaces with default methods).',
        ),
      ]),
      section('how', 'How it works', [
        h3('Interfaces'),
        p(
          'An interface declares methods (and since Java 8, default/static methods; since Java 9, private helpers in interfaces). A class implements the interface and must provide the abstract methods. Clients depend on the interface type. This is the backbone of Dependency Inversion and Strategy.',
        ),
        h3('Abstract classes'),
        p(
          'Use when you have shared fields/constructors and a partial algorithm (Template Method): abstract class Processor { final void run() { validate(); doWork(); audit(); } abstract void doWork(); }. Subclasses fill in the varying step. Prefer interfaces for pure contracts; prefer abstract classes when you must share state or enforce a skeletal flow.',
        ),
        callout(
          'tip',
          'Modern default: start with an interface. Introduce an abstract class only when multiple implementors truly share state or a non-trivial template.',
          'Design default',
        ),
        diagram(
          `flowchart LR
  Client --> PG[PaymentGateway]
  PG --> Stripe[StripeGateway]
  PG --> Mock[MockGateway]
  PG --> Bank[InternalBankGateway]`,
          'Clients depend on the abstraction; implementations are swappable.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `public interface PaymentGateway {
  PaymentResult charge(Money amount, PaymentMethod method);
}

public interface Refundable {
  PaymentResult refund(String paymentId, Money amount);
}

// Prefer small role interfaces (ISP) over a fat "PaymentOps" god-interface

public final class StripeGateway implements PaymentGateway, Refundable {
  private final StripeClient client;
  public StripeGateway(StripeClient client) { this.client = client; }

  @Override
  public PaymentResult charge(Money amount, PaymentMethod method) {
    // map domain -> Stripe API, map errors -> domain failures
    return PaymentResult.ok(client.charge(...));
  }

  @Override
  public PaymentResult refund(String paymentId, Money amount) {
    return PaymentResult.ok(client.refund(...));
  }
}

// Template Method via abstract class when skeletal flow is shared
public abstract class BatchJob {
  public final void execute() {
    lock();
    try {
      doExecute();
      markSuccess();
    } catch (Exception e) {
      markFailure(e);
      throw e;
    } finally {
      unlock();
    }
  }
  protected abstract void doExecute();
}`,
          'Interface for swappable capabilities; abstract class for shared orchestration.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Too many tiny interfaces → indirection fog; too few fat interfaces → ISP violations and mock pain.',
          'default methods on interfaces: convenient evolution, but can cause diamond conflicts and hide real design debt.',
          'Abstract class locks you into single inheritance — a high cost if a type needs two “is-a” parents.',
          'Leaky abstractions: interface method signatures that expose SQLException or vendor types couple callers to an implementation.',
          'Premature abstraction: one implementation and no variation → YAGNI; abstract when you have a clear second need or a test seam.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'DIP: high-level modules depend on these abstractions.',
          'Strategy/Observer/Factory all center on interface-typed collaborators.',
          'Polymorphism is how different implementations satisfy one abstraction.',
          'ISP: keep interfaces focused so implementors are not forced to stub junk methods.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I would use an abstract class for PaymentGateway.”'),
        p('Interviewer: “Why not an interface?”'),
        p(
          'Strong answer: “If there’s no shared state or template algorithm, an interface is better — multiple roles, easier mocking, no inheritance tax. I’d use an abstract class only if several gateways share locking/retry scaffolding.”',
        ),
        p('Interviewer: “How do you evolve the interface without breaking implementors?”'),
        p(
          'Strong answer: “Add default methods carefully, or version the API (PaymentGatewayV2), or use adapter facades. Breaking changes need coordinated releases.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Creating an interface for every class with a matching Foo/FooImpl pair by reflex.',
      'Putting vendor types (ResultSet, HttpServletRequest) in your domain interfaces.',
      'Using abstract classes just to share constants — use interfaces or utility types instead.',
      'Confusing abstraction (what) with encapsulation (protect how).',
      'One giant Service interface with 40 methods.',
    ],
    interviewQuestions: [
      'What is abstraction in OOP?',
      'Difference between abstract class and interface in Java?',
      'Can an interface have a constructor? Why/why not?',
      'What are default methods and why were they added?',
      'When do you choose an abstract class over an interface?',
    ],
    intermediateInterviewQuestions: [
      'How do you keep abstractions from leaking implementation details?',
      'Explain programming to an interface — benefits and costs.',
      'How do sealed interfaces (Java 17+) change API design?',
      'Can abstract classes implement interfaces? When is that useful?',
      'How does abstraction help unit testing?',
    ],
    advancedInterviewQuestions: [
      'Design a plugin SPI for pricing rules using interfaces.',
      'Discuss binary compatibility when adding methods to a published interface.',
      'Compare abstraction in OOP with abstraction in functional interfaces (Function, Predicate).',
      'When is a leaky abstraction worse than no abstraction?',
      'How would you migrate a deep abstract-class hierarchy to interfaces + composition?',
      'Explain diamond inheritance problems with default methods and how Java resolves them.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Abstract class vs interface — which do you pick?',
        answer:
          'I default to interfaces for contracts and roles because a type can implement many and clients stay decoupled from hierarchy. I use an abstract class when subclasses must share state or a Template Method skeleton that should not be reimplemented. Trade-off: abstract classes give reuse but consume the single extends slot and couple you to a hierarchy. In interviews I’ll also mention ISP — prefer several small interfaces over one fat abstract parent.',
      },
    ],
    keyTakeaways: [
      'Abstraction = depend on essential contracts, not details.',
      'Interfaces for capabilities; abstract classes for shared skeletal implementation.',
      'Keep abstractions non-leaky (no vendor types in domain APIs).',
      'Don’t abstract until there’s a real variation or test seam.',
    ],
  },
)

export const d5p3: StudyPage = createPage(
  'd5-p3',
  'Inheritance & Polymorphism',
  20,
  [
    'Apply inheritance only for true is-a relationships with behavioral substitutability',
    'Explain method overriding, overloading, and polymorphic use of references',
    'Recognize fragile base class problems and when to stop inheriting',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Inheritance lets a subclass reuse and specialize a superclass. Polymorphism lets you treat different types uniformly through a common supertype: Animal a = new Dog(); a.speak(); calls Dog’s version. Inheritance is a tool; polymorphism is the payoff. Interviews punish deep, accidental hierarchies.',
        ),
        h3('Why it exists'),
        p(
          'Polymorphism lets frameworks and libraries call your code without knowing concrete types (think List.sort with Comparator, or a servlet container invoking service()). Inheritance was historically the reuse mechanism; modern Java prefers composition for reuse and interfaces for polymorphism.',
        ),
        h3('Overloading vs overriding'),
        table(
          ['', 'Overloading', 'Overriding'],
          [
            ['When resolved', 'Compile time (signature)', 'Runtime (dynamic dispatch)'],
            ['Same class / hierarchy', 'Same class, different params', 'Subclass redefines instance method'],
            ['Return type', 'Can differ (not alone)', 'Covariant returns allowed'],
            ['static/private/final', 'Can overload', 'Not overridden (hidden / illegal)'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        p(
          'Java uses single class inheritance and multiple interface implementation. Override with the same signature; use @Override. The JVM selects the method based on the runtime type of the receiver for instance methods (virtual invocation). Fields and static methods are not polymorphic in the same way — they are resolved on the reference type / hiding rules.',
        ),
        diagram(
          `classDiagram
  Animal <|-- Dog
  Animal <|-- Cat
  class Animal {
    +speak() String
  }
  class Dog {
    +speak() String
  }
  class Cat {
    +speak() String
  }`,
          'is-a hierarchy enabling polymorphic speak().',
        ),
        callout(
          'mistake',
          'Fragile base class: superclass changes break subclasses that depended on internal call patterns. Classic: Base.method() calls this.hook(); refactoring Base silently changes subclass behavior.',
          'Fragile base class',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `public abstract class Shape {
  public abstract double area();
}

public final class Circle extends Shape {
  private final double r;
  public Circle(double r) {
    if (r <= 0) throw new IllegalArgumentException();
    this.r = r;
  }
  @Override public double area() { return Math.PI * r * r; }
}

public final class Rectangle extends Shape {
  private final double w, h;
  public Rectangle(double w, double h) {
    this.w = w; this.h = h;
  }
  @Override public double area() { return w * h; }
}

// Polymorphism in action
double totalArea(List<Shape> shapes) {
  return shapes.stream().mapToDouble(Shape::area).sum();
}

// Overloading — compile-time choice by argument types
void print(int x) { ... }
void print(String s) { ... }

// BAD inheritance for reuse only (not is-a):
// class Stack extends ArrayList { ... }  // clients can call add(index, e)!`,
          'Polymorphism via Shape; inheritance abused when Stack extends ArrayList.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Inheritance couples subclass to superclass implementation — strongest coupling Java offers.',
          'Protected fields become a de facto public API for subclasses.',
          'Multiple levels (A→B→C→D) make reasoning and testing hard; prefer shallow trees.',
          'Square extends Rectangle is a classic LSP trap (see Day page on LSP).',
          'final on class/method: intentional — prevents unsafe overriding; use when inheritance isn’t part of the design.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Dynamic dispatch (next page) is the mechanism behind polymorphism.',
          'LSP defines when inheritance is valid behaviorally.',
          'Composition vs inheritance: reuse without is-a.',
          'Template Method uses inheritance; Strategy uses composition for the same variability.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I’ll reuse code by extending this utility class.”'),
        p('Interviewer: “Is it an is-a relationship?”'),
        p(
          'Strong answer: “If not, I’ll compose: hold a private final Helper and delegate. Inheritance for reuse of implementation creates brittle coupling and leaks superclass API.”',
        ),
        p('Interviewer: “Complexity of polymorphic call?”'),
        p(
          'Strong answer: “Same as a normal call asymptotically; JVM uses invokevirtual / itables. Hot paths may inline after JIT profiling. Interview focus is design clarity, not micro-overhead.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Using inheritance purely for code reuse (Stack extends Vector).',
      'Confusing overloading with overriding.',
      'Expecting fields or static methods to be dynamically dispatched.',
      'Deep hierarchies “for future flexibility.”',
      'Overriding and silently weakening preconditions (LSP break).',
    ],
    interviewQuestions: [
      'What is inheritance? What is polymorphism?',
      'Difference between overloading and overriding?',
      'Can you override a private or static method in Java?',
      'What does @Override do?',
      'Why is “Stack extends ArrayList” a bad idea?',
    ],
    intermediateInterviewQuestions: [
      'What is the fragile base class problem?',
      'Explain covariant return types in overriding.',
      'How do default interface methods interact with overriding?',
      'When should a class or method be final?',
      'How does polymorphism enable the Open/Closed Principle?',
    ],
    advancedInterviewQuestions: [
      'Compare Template Method (inheritance) vs Strategy (composition) for the same variation.',
      'How does the JVM resolve invokevirtual vs invokeinterface?',
      'Design a shape hierarchy that won’t force LSP violations for Square/Rectangle.',
      'Discuss mixin-style reuse via default methods vs composition.',
      'How do you test a class designed for inheritance (hooks, protected methods)?',
      'What breaks if you change a protected method’s call order in a base class?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain polymorphism with Java.',
        answer:
          'Polymorphism means I can write code against a supertype and get subtype-specific behavior at runtime. List of Shape calls area(), and Circle or Rectangle runs. That’s dynamic dispatch on the receiver. I use it to extend behavior without editing every client. Trade-off: harder to see which implementation runs, so I keep hierarchies shallow and prefer interfaces plus composition when reuse is the only goal.',
      },
      {
        question: 'When do you avoid inheritance?',
        answer:
          'When the relationship isn’t a true behavioral is-a, when I only want reuse, or when subclasses would need to disable superclass features. Then I compose and delegate. Inheritance is best for narrow, stable specializations with LSP in mind — otherwise it becomes the fragile base class problem.',
      },
    ],
    keyTakeaways: [
      'Inheritance = is-a + shared implementation; use sparingly.',
      'Polymorphism = one interface, many behaviors via dynamic dispatch.',
      'Overloading is compile-time; overriding is runtime.',
      'Prefer composition when you only need reuse.',
    ],
  },
)

export const d5p4: StudyPage = createPage(
  'd5-p4',
  'Static vs Dynamic Binding (dynamic dispatch)',
  16,
  [
    'Distinguish compile-time (static) binding from runtime (dynamic) binding in Java',
    'Predict which method runs given polymorphic references, overloads, and hiding',
    'Explain why dynamic dispatch is central to OOP design',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Binding is deciding which method implementation runs for a call. Static binding is fixed at compile time (overloads, private/static/final methods, field access). Dynamic binding (dynamic dispatch) selects the override based on the runtime type of the object — the heart of polymorphism.',
        ),
        h3('Why interviewers ask'),
        p(
          'Trick questions mix overload resolution (static) with override dispatch (dynamic). Candidates who “know polymorphism” still fail: Animal a = new Dog(); a.version(); if version is static, Animal’s method runs. Understanding binding prevents false confidence in hierarchies.',
        ),
      ]),
      section('how', 'How it works', [
        ul([
          'Instance methods (non-private, non-final, non-static): invokevirtual / invokeinterface → dynamic dispatch.',
          'static methods: resolved on the compile-time type; subclass “override” is actually hiding.',
          'private methods: always the defining class’s version (not polymorphic).',
          'final methods: bound like non-virtual for overriding purposes (cannot override).',
          'Overload selection: compile-time, based on reference type and argument types (most specific match).',
          'Fields: no dynamic dispatch — always the reference type’s field (hiding, not overriding).',
        ]),
        diagram(
          `sequenceDiagram
  participant C as Caller
  participant Ref as Animal ref
  participant Heap as Dog instance
  C->>Ref: a.speak()
  Note over Ref: compile-time type Animal
  Ref->>Heap: dynamic dispatch
  Heap-->>C: Dog.speak()`,
          'Dynamic dispatch uses the runtime object, not the reference type.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `class Animal {
  String name = "animal";
  static String kind() { return "Animal"; }
  void speak() { System.out.println("..."); }
  void greet(Animal a) { System.out.println("Animal greet Animal"); }
  void greet(Dog d) { System.out.println("Animal greet Dog"); }
}

class Dog extends Animal {
  String name = "dog"; // hides, does not override
  static String kind() { return "Dog"; } // hides
  @Override void speak() { System.out.println("woof"); }
}

Animal a = new Dog();
a.speak();           // woof — dynamic (override)
System.out.println(a.name); // "animal" — field from reference type
System.out.println(a.kind()); // "Animal" — static on reference type
Dog d = new Dog();
a.greet(d);          // "Animal greet Dog" — overload picked at compile time
                     // using compile-time types of a and argument`,
          'Overrides dispatch dynamically; statics, fields, and overloads do not.',
        ),
        example('Interview prediction drill', [
          p(
            'Always ask three questions: (1) Is this an instance method that can be overridden? (2) What is the runtime type of the receiver? (3) For overloads, what are the compile-time argument types?',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Dynamic dispatch enables OCP and plugins; costs: harder static reasoning, slightly more complex call sites (usually irrelevant after JIT).',
          'Overload + override together confuse readers — avoid APIs where both interact subtly.',
          'Constructors: do not call overridable methods from constructors — subclass fields aren’t initialized yet.',
          'Optional/bridge methods and generics can add synthetic bridges; rare interview detail but explains some “extra” methods in javap.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Polymorphism’s mechanism is dynamic binding.',
          'Strategy pattern moves dispatch from inheritance to a composed interface field.',
          'Visitor uses double dispatch patterns when single dispatch isn’t enough.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “What prints?” (shows static method on subclass via superclass ref)'),
        p(
          'Strong answer: “Static methods are bound to the compile-time type, so the superclass method runs. It’s hiding, not overriding. I’d never design APIs that rely on static ‘polymorphism.’”',
        ),
        p('Interviewer: “How would you get polymorphic behavior without inheritance?”'),
        p(
          'Strong answer: “Composition: hold a Behavior interface and delegate. That’s Strategy — dispatch on the strategy object’s runtime type.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Assuming static methods override.',
      'Assuming field access is polymorphic.',
      'Mixing up overload resolution with override dispatch.',
      'Calling overridable methods from constructors.',
      'Using the reference type alone to predict instance method results.',
    ],
    interviewQuestions: [
      'What is static binding vs dynamic binding?',
      'Which Java constructs use dynamic dispatch?',
      'Why doesn’t a static method participate in polymorphism?',
      'How is the overloaded method chosen?',
      'What is method hiding?',
    ],
    intermediateInterviewQuestions: [
      'Predict output for a mixed overload/override snippet.',
      'Why is calling an overridable method from a constructor dangerous?',
      'Difference between invokevirtual and invokespecial?',
      'How do private methods affect binding?',
      'Can final methods be dynamically dispatched to overrides?',
    ],
    advancedInterviewQuestions: [
      'Explain how the JVM itable/vtable enables interface dispatch.',
      'How does JIT inlining interact with virtual calls?',
      'Design an API that avoids overload/override ambiguity.',
      'What is double dispatch and when do you need it?',
      'How do default methods change dispatch resolution?',
      'Compare dynamic dispatch with pattern matching switch (Java 21) for closed hierarchies.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Static vs dynamic binding in Java?',
        answer:
          'Static binding is decided at compile time — overloads, static/private/final methods, and field access. Dynamic binding picks the override from the runtime type of the object for normal instance methods. That’s why Animal a = new Dog(); a.speak() can print woof, but a static kind() still uses Animal’s version. Design implication: rely on instance overrides for polymorphism; don’t expect statics or fields to behave polymorphically.',
      },
    ],
    keyTakeaways: [
      'Dynamic dispatch = runtime type of receiver for overridable instance methods.',
      'Overloads, statics, and fields are compile-time / reference-type stories.',
      'Never simulate polymorphism with static methods.',
      'Predict output by separating overload resolution from override dispatch.',
    ],
  },
)

export const m1Pages: StudyPage[] = [d5p1, d5p2, d5p3, d5p4]
