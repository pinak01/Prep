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

export const d5p5: StudyPage = createPage(
  'd5-p5',
  'Association, Aggregation & Composition',
  18,
  [
    'Differentiate association, aggregation, and composition with ownership/lifecycle',
    'Model relationships in Java without misleading UML vocabulary',
    'Choose composition when lifetimes are nested and parts should not outlive the whole',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'These terms describe how objects relate. Association is a general “uses / knows” link. Aggregation is a weak whole-part (parts can exist independently). Composition is a strong whole-part (parts’ lifecycle is owned by the whole). Interviewers care about ownership and destruction semantics, not memorizing UML diamonds.',
        ),
        h3('Why it exists'),
        p(
          'Wrong ownership causes bugs: deleting a University should not destroy Person objects that also work elsewhere; deleting a Document should destroy its owned Paragraphs; sharing a mutable Paragraph across Documents without clear ownership causes corruption.',
        ),
        table(
          ['Relationship', 'Ownership', 'Lifecycle', 'Java sketch'],
          [
            [
              'Association',
              'None / peer',
              'Independent',
              'Teacher references Course; both managed elsewhere',
            ],
            [
              'Aggregation',
              'Weak whole-part',
              'Part can outlive whole',
              'Department holds Professors also listed in University',
            ],
            [
              'Composition',
              'Strong ownership',
              'Part dies with whole',
              'Order creates and owns OrderLines; no shared lines',
            ],
          ],
        ),
      ]),
      section('how', 'How it works', [
        p(
          'Java has no language keyword for aggregation vs composition. You express them with field references, constructors, factories, and discipline: who creates the part? who may hold references? is the part shared? Composition usually means: create parts inside the whole (or accept them only at construction and never expose mutable aliases), and do not let parts escape to be reused in another whole.',
        ),
        diagram(
          `flowchart TB
  subgraph Composition
    Order --> Line1[OrderLine]
    Order --> Line2[OrderLine]
  end
  subgraph Association
    Student -.-> Course
    Course -.-> Student
  end
  subgraph Aggregation
    Playlist --> Song
    Library --> Song
  end`,
          'Composition owns lines; association links peers; aggregation shares songs.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `// Composition: Order owns lines
public final class Order {
  private final String id;
  private final List<OrderLine> lines = new ArrayList<>();

  public Order(String id) { this.id = id; }

  public void addItem(Sku sku, int qty, Money unitPrice) {
    lines.add(new OrderLine(sku, qty, unitPrice)); // created here
  }

  public List<OrderLine> lines() {
    return Collections.unmodifiableList(lines);
  }
  // No setter that injects shared mutable OrderLine from outside
}

// Aggregation / association: Playlist references Songs it does not own
public final class Playlist {
  private final List<Song> songs = new ArrayList<>();
  public void add(Song song) { songs.add(Objects.requireNonNull(song)); }
}

// Association: many-to-many via references or join entity
public final class Enrollment {
  private final Student student;
  private final Course course;
}`,
          'Ownership shows up as who constructs and whether parts are shared.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Overusing composition trees creates god-aggregates that are hard to load/persist.',
          'Underusing composition (sharing everything) blurs invariants across “parts.”',
          'ORM note: JPA cascade/orphanRemoval approximate composition; missing cascades approximate association — map intentionally.',
          'Immutable value objects inside an aggregate are often composition of values, not entities.',
        ]),
        callout(
          'tip',
          'If you cannot answer “who deletes this?”, you do not understand the relationship yet.',
          'Ownership test',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Composition supports “composition over inheritance.”',
          'Aggregates in DDD are composition boundaries for consistency.',
          'Coupling: composition couples lifecycles; association couples only usage.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Is Car→Engine composition or aggregation?”'),
        p(
          'Strong answer: “Depends on the domain. In a car manufacturer model, Engine is often composition — built for that Car. In a repair shop swapping engines across cars, it’s aggregation/association. I’d model the real ownership, not a textbook default.”',
        ),
        p('Interviewer: “How do you enforce composition in Java?”'),
        p(
          'Strong answer: “Create parts internally, don’t expose setters for shared parts, return unmodifiable views, and avoid public constructors on part types if they must only exist inside the whole.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Memorizing UML diamonds without ownership semantics.',
      'Calling every field a “composition.”',
      'Sharing OrderLine instances across Orders.',
      'Using inheritance to model has-a (Car extends Engine).',
      'Ignoring ORM cascade settings that contradict the intended lifecycle.',
    ],
    interviewQuestions: [
      'Difference between association, aggregation, and composition?',
      'Give a real-world composition example.',
      'How do you express composition in Java?',
      'Can aggregation parts be shared? Can composition parts?',
      'Is University–Student composition? Why or why not?',
    ],
    intermediateInterviewQuestions: [
      'How do these relationships map to foreign keys and cascade deletes?',
      'Composition vs aggregation for House–Room vs Library–Book?',
      'How does immutability interact with composition?',
      'When would you promote a composed part to an independent aggregate?',
      'How do bidirectional associations create consistency bugs?',
    ],
    advancedInterviewQuestions: [
      'Design Order/OrderLine with clear composition and money invariants.',
      'Explain ownership in a graph of objects with cycles.',
      'How do GC and “destruction” semantics differ from C++ composition?',
      'Map UML relationships to microservice boundaries — when does composition become a service boundary smell?',
      'Discuss orphan removal, cascade types, and accidental deletes.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Association vs aggregation vs composition?',
        answer:
          'Association is a general link between peers. Aggregation is a whole-part where parts can live independently and be shared. Composition is strong ownership: the whole controls creation and lifecycle of parts, and parts aren’t shared across wholes. In Java it’s all references — the difference is discipline around construction, exposure, and deletion/cascades. Trade-off: composition protects invariants but can create large aggregates; association is flexible but ownership can get muddy.',
      },
    ],
    keyTakeaways: [
      'Ask about ownership and lifecycle, not just UML shapes.',
      'Composition = parts owned; aggregation = parts shareable.',
      'Java expresses these via API design, not keywords.',
      'Wrong ownership is a design bug that shows up as data corruption.',
    ],
  },
)

export const d5p6: StudyPage = createPage(
  'd5-p6',
  'Dependency, Coupling & Cohesion',
  16,
  [
    'Define dependency relationships between types',
    'Aim for low coupling and high cohesion with concrete Java examples',
    'Spot coupling smells interviewers expect you to name and fix',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'A dependency exists when type A needs type B to compile or run (imports, parameters, fields, return types, thrown exceptions). Coupling is how tightly A is tied to B’s details. Cohesion is how strongly A’s own elements belong together. Healthy design: high cohesion inside modules, low coupling between them.',
        ),
        h3('Why it exists'),
        p(
          'High coupling makes change expensive: edit a logger format and half the app recompiles/breaks. Low cohesion makes classes confusing: OrderService that also sends email, writes CSV, and computes tax is hard to test and reuse. These two axes predict maintainability better than counting design patterns.',
        ),
        table(
          ['Goal', 'Means', 'Smell if violated'],
          [
            [
              'Low coupling',
              'Depend on interfaces, narrow APIs, events',
              'Ripple changes, hard mocks, circular deps',
            ],
            [
              'High cohesion',
              'One reason to change (SRP cousin)',
              'God classes, unrelated methods, shotgun surgery',
            ],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Kinds of coupling (interview vocabulary)'),
        ul([
          'Content coupling (worst): A modifies B’s internals.',
          'Common coupling: share mutable global/static state.',
          'Control coupling: A passes flags that dictate B’s path.',
          'Stamp coupling: A passes a fat object when it needs two fields.',
          'Data coupling (better): A passes only needed data.',
          'Message / interface coupling: A calls a narrow interface method.',
        ]),
        h3('Cohesion flavors'),
        ul([
          'Functional cohesion (best): elements collaborate for one purpose.',
          'Sequential / communicational: pipeline on same data.',
          'Temporal: “stuff to do at startup” — mediocre.',
          'Coincidental: unrelated methods dumped together — worst.',
        ]),
        diagram(
          `flowchart LR
  subgraph Good
    OrderService --> Pricing
    OrderService --> Payments
    Pricing --> Rules[PricingRules interface]
  end
  subgraph Bad
    God[OrderGodClass] --> DB
    God --> SMTP
    God --> PDF
    God --> Tax
    God --> Cache
  end`,
          'Low coupling via focused deps; high cohesion vs god class.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `// HIGH coupling + LOW cohesion
class OrderManager {
  void place(Order o) {
    DriverManager.getConnection(...); // depends on JDBC details
    // tax, email, PDF, inventory...
  }
}

// LOWER coupling + HIGHER cohesion
class PlaceOrderService {
  private final OrderRepository orders;
  private final PricingEngine pricing;
  private final PaymentGateway payments;
  private final DomainEventPublisher events;

  PlaceOrderService(OrderRepository orders, PricingEngine pricing,
                    PaymentGateway payments, DomainEventPublisher events) {
    this.orders = orders;
    this.pricing = pricing;
    this.payments = payments;
    this.events = events;
  }

  PlacementResult place(PlaceOrderCommand cmd) {
    Money price = pricing.price(cmd.items());
    PaymentResult pay = payments.charge(price, cmd.method());
    Order order = Order.create(cmd, price, pay.id());
    orders.save(order);
    events.publish(new OrderPlaced(order.id()));
    return PlacementResult.ok(order.id());
  }
}
// Email/PDF listeners react to OrderPlaced — not coupled into this service`,
          'Depend on abstractions; keep one use-case per service.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Extreme decoupling (everything via message bus) adds operational complexity — overkill for a small module.',
          'Passing primitives everywhere to avoid stamp coupling can create long, error-prone parameter lists — use small parameter objects.',
          'Circular dependencies often signal missing abstraction or wrong package boundaries.',
          'Static singletons increase coupling (hidden global deps) — hard to test.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'DIP reduces coupling to concrete details.',
          'ISP reduces stamp/fat-interface coupling.',
          'SRP is cohesion at the class level.',
          'Patterns like Facade reduce coupling from clients to a subsystem.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “How do you measure coupling?”'),
        p(
          'Strong answer: “Qualitatively: how many types I touch when requirements change; whether I can test with mocks; whether packages form a DAG. Tools can report afferent/efferent coupling, but I’d lead with change impact.”',
        ),
        p('Interviewer: “Always minimize coupling?”'),
        p(
          'Strong answer: “Minimize accidental coupling. Intentional coupling inside a cohesive module is fine — that’s cohesion. Don’t split a tightly algorithmic unit just to paint a ‘low coupling’ metric green.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Treating any import as “bad coupling.”',
      'Confusing cohesion with “lots of methods.”',
      'Using static utilities everywhere and calling it decoupling.',
      'Flags like mode=1/2/3 creating control coupling.',
      'One JAR/module that everything depends on becoming a bottleneck.',
    ],
    interviewQuestions: [
      'What is coupling? What is cohesion?',
      'Why prefer low coupling and high cohesion?',
      'Give an example of tight coupling in Java.',
      'What is a dependency between two classes?',
      'How does an interface reduce coupling?',
    ],
    intermediateInterviewQuestions: [
      'Name types of coupling from worst to better.',
      'What is coincidental cohesion?',
      'How do circular dependencies arise and how do you break them?',
      'Stamp coupling vs data coupling — example?',
      'How do package structure and coupling relate?',
    ],
    advancedInterviewQuestions: [
      'Design a checkout flow with explicit coupling boundaries for testing.',
      'When is an event-driven approach worth the decoupling cost?',
      'Compare afferent vs efferent coupling metrics.',
      'How does feature envy indicate cohesion problems?',
      'Refactor a god class live: what do you extract first and why?',
      'Explain how DIP, ISP, and SRP jointly improve coupling/cohesion.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain coupling and cohesion.',
        answer:
          'Coupling is how much one module depends on another’s details; cohesion is how well a module’s contents belong together. I want high cohesion — a class with one clear job — and low coupling — depending on narrow interfaces, not concrete JDBC or SMTP. Trade-off: some coupling is necessary for the system to work; I remove brittle, accidental coupling that causes ripple changes and untestable code.',
      },
    ],
    keyTakeaways: [
      'Dependency = needs another type; coupling = how painful that need is.',
      'High cohesion ≈ one purpose; low coupling ≈ stable, narrow interfaces.',
      'Hidden globals/statics are coupling in disguise.',
      'Optimize for change impact, not zero imports.',
    ],
  },
)

export const d5p7: StudyPage = createPage(
  'd5-p7',
  'Constructors & Access Modifiers',
  15,
  [
    'Use constructors, overloading, and factories to establish valid objects',
    'Explain public, protected, package-private, and private nuances in Java',
    'Avoid partially initialized objects and unsafe publication patterns',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Constructors establish invariants: after new, the object must be valid. Access modifiers define who can see types and members, shaping encapsulation boundaries. Together they are how you force clients through safe creation paths.',
        ),
        h3('Access modifiers (members)'),
        table(
          ['Modifier', 'Same class', 'Same package', 'Subclass other pkg', 'World'],
          [
            ['private', '✓', '', '', ''],
            ['package-private (default)', '✓', '✓', '', ''],
            ['protected', '✓', '✓', '✓', ''],
            ['public', '✓', '✓', '✓', '✓'],
          ],
        ),
        callout(
          'info',
          'protected = package + subclasses (even outside package). People often forget the package part.',
          'protected nuance',
        ),
      ]),
      section('how', 'How it works', [
        ul([
          'Constructor chaining: this(...) / super(...) — super constructor runs first.',
          'Overloading: multiple constructors for different creation inputs; keep a single primary that validates.',
          'Factories (static methods / builders): name intents (of, from, parse), return subtypes, can cache, can fail with Optional/exceptions without ‘new’ syntax limits.',
          'private constructors: utility classes, singletons, force factory usage, prevent subclassing when combined with final.',
          'package-private types: hide implementations inside a package/module API.',
        ]),
        h3('Java Module tip'),
        p(
          'With JPMS, exports further restrict public types across modules. Interview depth: public is not “visible everywhere” if the module doesn’t export the package.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `public final class UserId {
  private final UUID value;

  private UserId(UUID value) { this.value = value; } // force factory

  public static UserId of(UUID value) {
    return new UserId(Objects.requireNonNull(value));
  }

  public static UserId parse(String s) {
    return new UserId(UUID.fromString(s));
  }
}

public class Account {
  private final String id;
  private Money balance;

  public Account(String id, Money opening) {
    if (id == null || id.isBlank()) throw new IllegalArgumentException("id");
    this.id = id;
    this.balance = Objects.requireNonNull(opening);
  }

  // Overloaded convenience
  public Account(String id) {
    this(id, Money.zero(Currency.getInstance("USD")));
  }
}

// package-private implementation behind public interface
public interface Clock { Instant now(); }

final class SystemClock implements Clock { // package-private class
  public Instant now() { return Instant.now(); }
}`,
          'Factories and access levels control creation and visibility.',
        ),
        example('Anti-pattern', [
          code(
            'java',
            `class Bad {
  String id;
  Bad() {}           // allows invalid empty object
  void init(String id) { this.id = id; } // two-phase init — easy to forget
}`,
            'Prefer constructor/factory validation over init() methods.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Telescoping constructors → use Builder.',
          'Checked exceptions from constructors can be awkward; factories may be clearer.',
          'Subclassing + constructor throws: partially constructed objects and finalizer issues (legacy) — prefer final classes or composition.',
          'Frameworks needing default constructors: keep domain factories; isolate framework DTOs.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Builder / Factory patterns formalize creation.',
          'Encapsulation relies on private fields + controlled constructors.',
          'Singleton often uses private constructors (and has testing costs).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Why private constructor?”'),
        p(
          'Strong answer: “To control instantiation — factories, singletons, or non-instantiable utility classes. It makes illegal states unrepresentable by blocking raw new from outside.”',
        ),
        p('Interviewer: “protected vs package-private?”'),
        p(
          'Strong answer: “Package-private is for package collaborators. protected also opens to subclasses in other packages — a wider API surface. I use protected only when inheritance is intentional.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Public no-arg constructor leaving mandatory fields null.',
      'Thinking protected is only for subclasses (forgetting same package).',
      'Doing heavy work / starting threads in constructors.',
      'Calling overridable methods from constructors.',
      'Exposing package-private details that should be module-internal.',
    ],
    interviewQuestions: [
      'What are Java access modifiers?',
      'What is constructor overloading?',
      'Why use a private constructor?',
      'Difference between protected and default access?',
      'What must be the first statement in a constructor?',
    ],
    intermediateInterviewQuestions: [
      'Constructor vs static factory — when prefer each?',
      'How do you prevent subclassing?',
      'Explain constructor chaining with this/super.',
      'Why avoid two-phase initialization?',
      'How do records’ compact constructors help validation?',
    ],
    advancedInterviewQuestions: [
      'How does unsafe publication relate to constructors and final fields?',
      'Design a typesafe factory hierarchy for parsing IDs.',
      'Discuss package-private + JPMS as an encapsulation strategy.',
      'How do ORMs/serialization interact with constructors?',
      'Explain the double-checked locking need for lazy init (lead-in to Singleton page).',
      'When should construction fail fast vs return a Result type?',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you ensure objects are always valid?',
        answer:
          'I validate in constructors or static factories and keep fields private. Illegal combinations throw immediately — fail fast — so the rest of the system never sees half-built objects. For many parameters I use a Builder that validates on build(). Trade-off: stricter construction vs flexibility for frameworks; I keep framework DTOs separate from domain types when needed.',
      },
    ],
    keyTakeaways: [
      'Constructors establish invariants; prefer fail-fast creation.',
      'Access modifiers define your real API surface.',
      'protected ⊆ package + subclasses; default = package only.',
      'Factories/builders beat telescoping constructors.',
    ],
  },
)

export const m2Pages: StudyPage[] = [d5p5, d5p6, d5p7]
