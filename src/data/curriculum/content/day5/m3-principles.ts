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

export const d5p8: StudyPage = createPage(
  'd5-p8',
  'SOLID: SRP & OCP',
  18,
  [
    'Apply Single Responsibility and Open/Closed with Java examples',
    'Detect god classes and switch-on-type smells',
    'Extend behavior via new types instead of editing stable code',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'SRP (Single Responsibility Principle): a class should have one reason to change — one axis of responsibility / one stakeholder concern. OCP (Open/Closed Principle): software entities should be open for extension but closed for modification — add behavior by adding code (new classes), not by endlessly editing battle-tested modules.',
        ),
        h3('Why it exists'),
        p(
          'SRP fights god classes that change for reporting, persistence, and business rules at once. OCP fights fragile switch statements that grow with every new product type and risk regressing old paths. Together they make change additive and localized.',
        ),
        callout(
          'tip',
          'SRP is not “only one method.” A cohesive class can have many methods serving one responsibility (e.g., Order aggregate).',
          'SRP myth',
        ),
      ]),
      section('how', 'How it works', [
        h3('SRP in practice'),
        ul([
          'Ask: “Who/what causes this class to change?” If answers diverge (DBA vs UX vs Finance), split.',
          'Separate domain logic, persistence, presentation, and orchestration.',
          'Keep use-case services thin; put rules in domain types or dedicated policy classes.',
        ]),
        h3('OCP in practice'),
        ul([
          'Depend on abstractions; plug in new implementations (Strategy, Decorator, plugins).',
          'Replace if/else on type codes with polymorphism.',
          'Closed for modification ≠ never edit — it means stable core modules shouldn’t churn for every feature.',
        ]),
        diagram(
          `flowchart TB
  Client --> Discount[DiscountPolicy]
  Discount --> Pct[PercentageDiscount]
  Discount --> BOGO[BuyOneGetOne]
  Discount --> Vip[VipDiscount]
  Note1[New policy = new class] -.-> Vip`,
          'OCP: extend by adding DiscountPolicy implementations.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `// SRP violation: mixes persistence, formatting, and rules
class ReportManager {
  void generate() { /* query DB */ }
  void saveToFile() { /* IO */ }
  void email() { /* SMTP */ }
  void applyTaxRules() { /* domain */ }
}

// Better split
class TaxCalculator { Money taxOn(Order o) { ... } }
class ReportAssembler { ReportData assemble(Order o, Money tax) { ... } }
class ReportRenderer { String toCsv(ReportData d) { ... } }
class ReportMailer { void send(String csv, String to) { ... } }

// OCP violation
Money price(Item i) {
  if (i.type == "BOOK") return ...;
  else if (i.type == "FOOD") return ...;
  // every new type edits this method
}

// OCP-friendly
public interface PricingRule {
  boolean supports(Item i);
  Money price(Item i);
}
public final class PricingEngine {
  private final List<PricingRule> rules;
  public Money price(Item i) {
    return rules.stream()
      .filter(r -> r.supports(i))
      .findFirst()
      .orElseThrow()
      .price(i);
  }
}`,
          'Split reasons to change; extend pricing with new rule classes.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Over-SRP: class explosion / “enterprise lasagna” — one interface per method.',
          'OCP via frameworks can become configuration hell; prefer clear code over plugin machinery for simple apps.',
          'Sometimes modifying a switch is fine if the set is closed and tiny (and better with sealed types + pattern matching).',
          'SRP boundaries are contextual — team and change frequency matter.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'OCP often uses Strategy, Decorator, or Observer.',
          'SRP aligns with high cohesion.',
          'DIP enables OCP by depending on abstractions you can extend.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “This class violates SRP because it has many methods.”'),
        p('Interviewer: “Is that the right test?”'),
        p(
          'Strong answer: “No. The test is reasons to change / responsibilities. Many methods can still be one cohesive responsibility. I’d split when persistence policy and tax law changes independently.”',
        ),
        p('Interviewer: “How do you keep OCP from premature abstraction?”'),
        p(
          'Strong answer: “Wait for a second variation or a clear extension point. Rule of three. First write clear code; extract interfaces when a seam earns its keep.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Equating SRP with “one method per class.”',
      'Claiming OCP means never changing any file.',
      'Adding interfaces everywhere for fake OCP.',
      'Leaving giant switch statements as the extension mechanism.',
      'Splitting cohesive code until you can’t find the business story.',
    ],
    interviewQuestions: [
      'What does SRP mean?',
      'What does OCP mean?',
      'Give a Java example of an SRP violation.',
      'How does polymorphism support OCP?',
      'Is a class with 10 methods always an SRP violation?',
    ],
    intermediateInterviewQuestions: [
      'How do you identify “reasons to change”?',
      'Strategy vs editing a switch for OCP — trade-offs?',
      'How does SRP relate to cohesion?',
      'When is violating OCP acceptable?',
      'How do sealed classes interact with OCP thinking?',
    ],
    advancedInterviewQuestions: [
      'Refactor a pricing engine from switches to rules without breaking callers.',
      'Discuss SRP at microservice boundaries — same principle?',
      'How do you prevent OCP plugins from becoming an untested jungle?',
      'Compare OCP extension via inheritance vs composition.',
      'Critique “Enterprisey” SRP over-fragmentation in a PR review.',
      'Design feature toggles without destroying SRP/OCP clarity.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain SRP and OCP with examples.',
        answer:
          'SRP: one reason to change. An OrderRepository shouldn’t also format PDFs — finance tax changes and PDF layout changes for different reasons. OCP: extend behavior by adding types, not endlessly editing a core switch. A PricingEngine with PricingRule implementations lets me add VipPricing without touching old rules. Trade-off: too many tiny classes vs one fragile blob — I split on real change axes, and I don’t invent plugins on day one.',
      },
    ],
    keyTakeaways: [
      'SRP = one reason to change, not one method.',
      'OCP = add behavior by extension, protect stable cores.',
      'Polymorphism/Strategy are common OCP tools.',
      'Avoid both god classes and premature class explosion.',
    ],
  },
)

export const d5p9: StudyPage = createPage(
  'd5-p9',
  'SOLID: LSP, ISP & DIP',
  20,
  [
    'Apply Liskov Substitution, Interface Segregation, and Dependency Inversion',
    'Spot Square/Rectangle and fat-interface violations in snippets',
    'Explain how DIP enables testing with mocks and fakes',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'LSP: subtypes must be substitutable for their base types without breaking callers’ expectations (behavioral contract). ISP: clients shouldn’t depend on methods they don’t use — prefer small role interfaces. DIP: high-level policy depends on abstractions, not low-level details; both should depend on abstractions.',
        ),
        h3('Why these three cluster'),
        p(
          'LSP keeps inheritance honest. ISP keeps abstractions focused. DIP wires the system so details (DB, HTTP, clock) plug into policy. Skip any one and you get brittle hierarchies, awkward mocks, or business logic glued to JDBC.',
        ),
        table(
          ['Principle', 'Failure mode', 'Fix sketch'],
          [
            [
              'LSP',
              'Subclass throws/no-ops or weakens contracts',
              'Re-model hierarchy; prefer composition',
            ],
            [
              'ISP',
              'Fat interface forces empty methods',
              'Split into role interfaces',
            ],
            [
              'DIP',
              'Service new PostgresRepo()',
              'Inject Repository interface',
            ],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('LSP checklist'),
        ul([
          'Preconditions must not be strengthened in subtypes.',
          'Postconditions must not be weakened.',
          'Invariants of the base must be preserved.',
          'History/constraint rules: subtype methods shouldn’t allow state sequences the base forbids.',
          'Avoid throwing unexpected UnsupportedOperationException for base methods.',
        ]),
        h3('ISP'),
        p(
          'Instead of Worker with work()/eat()/code(), split Workable, Eatable — a Robot implements Workable only. Callers depend on the thin slice they need.',
        ),
        h3('DIP & testing'),
        p(
          'If PlaceOrderService depends on PaymentGateway (interface), tests inject a FakePaymentGateway — no Stripe, no network. DIP is what makes unit tests fast and deterministic. Without DIP, “unit tests” become integration tests or need PowerMock surgery on statics.',
        ),
        diagram(
          `flowchart TB
  subgraph HighLevel
    PlaceOrder --> PG[PaymentGateway]
    PlaceOrder --> Repo[OrderRepository]
  end
  subgraph LowLevel
    StripeGateway --> PG
    JdbcOrderRepository --> Repo
  end`,
          'Both high and low level depend on abstractions (DIP).',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `// LSP violation classic
class Rectangle {
  protected int w, h;
  void setWidth(int w) { this.w = w; }
  void setHeight(int h) { this.h = h; }
  int area() { return w * h; }
}
class Square extends Rectangle {
  @Override void setWidth(int w) { this.w = this.h = w; }
  @Override void setHeight(int h) { this.w = this.h = h; }
}
// Client expecting Rectangle.setWidth to leave height unchanged breaks

// Better: separate types, or immutable shapes with no setters

// ISP violation
interface MultiFunctionDevice {
  void print();
  void scan();
  void fax();
}
class SimplePrinter implements MultiFunctionDevice {
  public void print() { ... }
  public void scan() { throw new UnsupportedOperationException(); }
  public void fax() { throw new UnsupportedOperationException(); }
}

// ISP fix
interface Printer { void print(); }
interface Scanner { void scan(); }
class SimplePrinter implements Printer { public void print() { ... } }

// DIP
public final class PlaceOrderService {
  private final PaymentGateway payments; // abstraction
  private final OrderRepository orders;
  public PlaceOrderService(PaymentGateway payments, OrderRepository orders) {
    this.payments = payments;
    this.orders = orders;
  }
}
// Production: new PlaceOrderService(new StripeGateway(...), new JdbcRepo(...))
// Test: new PlaceOrderService(new FakeGateway(), new InMemoryRepo())`,
          'LSP honesty, thin interfaces, injected abstractions for tests.',
        ),
        example('How DIP helps testing', [
          p(
            'You assert that PlaceOrderService calls payments.charge once with the priced amount. The fake records calls. No Docker, no API keys. That’s the interview answer: DIP inverts ownership of dependencies so tests supply doubles.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'LSP: deep hierarchies hard to keep honest — prefer composition.',
          'ISP: too many interfaces → navigation overhead.',
          'DIP: requires wiring (manual, Spring, Guice); over-abstraction for CRUD-only apps can slow delivery.',
          'Fakes must preserve contract (LSP for test doubles too!) or tests lie.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Factory/Abstract Factory often create DIP-friendly graphs.',
          'Strategy is DIP applied to interchangeable algorithms.',
          'Composition over inheritance avoids many LSP traps.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Why is Square extends Rectangle wrong?”'),
        p(
          'Strong answer: “Because clients of Rectangle assume independent width/height. Square changes that contract, breaking substitutability. Model them as separate shapes sharing a Shape abstraction with area(), not mutator inheritance.”',
        ),
        p('Interviewer: “How does DIP help testing?”'),
        p(
          'Strong answer: “High-level code depends on interfaces; tests inject fakes/mocks. I verify business flow without I/O. Trade-off: I must design contracts carefully so fakes stay honest.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Thinking any subclass relationship automatically satisfies LSP.',
      'One giant interface “for flexibility.”',
      'new ConcreteDependency() inside business methods.',
      'Mocks that don’t honor the real contract (false confidence).',
      'Using UnsupportedOperationException as a normal design tool.',
    ],
    interviewQuestions: [
      'What is the Liskov Substitution Principle?',
      'What is Interface Segregation?',
      'What is Dependency Inversion?',
      'Explain Square/Rectangle LSP issue.',
      'How does DIP differ from dependency injection?',
    ],
    intermediateInterviewQuestions: [
      'DIP vs DI framework — relationship?',
      'How do you split a fat repository interface?',
      'Give an ISP violation with a Java collections example (optional remove).',
      'What behavioral rules does LSP require?',
      'How do you unit-test without DIP?',
    ],
    advancedInterviewQuestions: [
      'Design payment + ledger services with DIP-friendly ports and adapters.',
      'Discuss contract tests to keep fakes honest.',
      'When is a “partial” test double an LSP violation?',
      'Refactor inheritance that breaks LSP into composition live.',
      'How do Java’s checked exceptions interact with LSP contracts?',
      'Compare DIP in hexagonal architecture vs classic layered architecture.',
      'Critique Spring @Autowired field injection for DIP clarity.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain LSP, ISP, and DIP.',
        answer:
          'LSP: subtypes must honor the base contract so callers aren’t surprised — Square mutating Rectangle breaks that. ISP: don’t force clients to depend on unused methods — split fat interfaces into roles. DIP: high-level policy depends on abstractions; details implement them. DIP enables tests: inject FakePaymentGateway instead of Stripe. Trade-offs: more types and wiring, but far less brittle change and faster feedback.',
      },
      {
        question: 'How does DIP help testing?',
        answer:
          'Business code takes dependencies as interfaces via the constructor. In production I wire real adapters; in tests I wire in-memory fakes. I exercise rules quickly without databases or networks. Without DIP, dependencies are hard-wired and tests become slow, flaky integration tests — or I reach for brittle static mocking.',
      },
    ],
    keyTakeaways: [
      'LSP = behavioral substitutability, not just shared methods.',
      'ISP = small role interfaces; no forced empty methods.',
      'DIP = depend on abstractions; details plug in.',
      'DIP is why constructor injection makes unit testing practical.',
    ],
  },
)

export const d5p10: StudyPage = createPage(
  'd5-p10',
  'DRY, KISS & Composition vs Inheritance',
  16,
  [
    'Balance DRY without premature abstraction',
    'Apply KISS under interview time pressure',
    'Argue why composition is usually safer than inheritance for reuse',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'DRY (Don’t Repeat Yourself): every piece of knowledge should have a single authoritative representation. KISS (Keep It Simple, Stupid): choose the simplest design that works. Composition vs inheritance: prefer has-a + delegation for reuse; reserve is-a inheritance for true substitutable specialization.',
        ),
        h3('Why composition over inheritance'),
        p(
          'Inheritance couples you to a parent’s implementation and public surface; subclasses break when parents change (fragile base class). Composition lets you reuse by holding a collaborator, choosing what to expose, and swapping implementations (often via interfaces). You can change behavior at runtime; you avoid LSP landmines; you keep hierarchies shallow.',
        ),
        callout(
          'warning',
          'DRY applied blindly creates the wrong abstraction. Three similar loops that will diverge for business reasons should not share a clever helper yet. Prefer duplication until the sameness is real (rule of three).',
          'DRY ≠ copy-paste zero',
        ),
      ]),
      section('how', 'How it works', [
        ul([
          'DRY: extract shared domain rules, not accidental syntactic similarity.',
          'KISS: clear names, shallow call stacks, few patterns — optimize for the next reader (often interviewer you in 6 months).',
          'Composition: class Car { private final Engine engine; void start(){ engine.start(); } }',
          'Inheritance reuse smell: subclassing to get a HashMap “for free” and then blocking half its API.',
        ]),
        diagram(
          `classDiagram
  class InheritanceStack {
    <<extends ArrayList>>
  }
  class CompositionStack {
    -ArrayList storage
    +push()
    +pop()
  }
  note for CompositionStack "Exposes only stack ops\\nNo leaky List API"`,
          'Composition wraps storage; inheritance leaks List methods.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `// Inheritance for reuse — BAD
class Stack<E> extends ArrayList<E> {
  public void push(E e) { add(e); }
  public E pop() { return remove(size() - 1); }
}
// Caller can still stack.add(0, x) — breaks LIFO assumptions

// Composition — GOOD
public final class Stack<E> {
  private final ArrayList<E> storage = new ArrayList<>();
  public void push(E e) { storage.add(e); }
  public E pop() {
    if (storage.isEmpty()) throw new NoSuchElementException();
    return storage.remove(storage.size() - 1);
  }
  public int size() { return storage.size(); }
}

// Strategy via composition (vs deep inheritance trees)
final class Greeter {
  private final GreetingPolicy policy;
  Greeter(GreetingPolicy policy) { this.policy = policy; }
  String greet(String name) { return policy.format(name); }
}`,
          'Composition controls the surface area; inheritance leaks parent API.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Composition adds boilerplate delegation — records/helpers/lombok aren’t excuses to inherit wrongly, but IDE generation helps.',
          'Frameworks (Android views, some UI kits) are inheritance-heavy — work with the platform.',
          'Template Method inheritance can be clear for tiny skeletons; Strategy often scales better.',
          'KISS vs future-proofing: interviewers prefer simple correct designs with named extension points over speculative frameworks.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Decorator/Adapter/Strategy are composition-centric patterns.',
          'LSP problems often disappear when you compose.',
          'DRY + SRP: shared knowledge belongs in one cohesive module.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Why composition over inheritance?”'),
        p(
          'Strong answer: “Because I need reuse without inheriting a whole API and implementation coupling. Composition lets me delegate selectively, swap collaborators, and preserve invariants. Inheritance is for genuine substitutable is-a, not for grabbing helper methods.”',
        ),
        p('Interviewer: “But DRY?”'),
        p(
          'Strong answer: “I’ll DRY domain knowledge. I won’t merge code that only looks similar. Wrong abstraction costs more than duplication.”',
        ),
      ]),
    ],
    commonMistakes: [
      'DRY-ing accidental duplication into a cryptic utility.',
      'Deep inheritance for code reuse.',
      'Over-engineering for KISS interview problems.',
      'Using inheritance because “it’s OOP.”',
      'Delegating everything then exposing the delegate via getter (composition leak).',
    ],
    interviewQuestions: [
      'What is DRY? When is duplication OK?',
      'What is KISS?',
      'Why prefer composition over inheritance?',
      'Give an example where inheritance misuse hurts.',
      'How do DRY and KISS conflict?',
    ],
    intermediateInterviewQuestions: [
      'Rule of three — how do you apply it?',
      'Template Method vs Strategy for shared algorithms?',
      'When is inheritance the better choice?',
      'How does composition help testing?',
      'Explain fragile base class in this context.',
    ],
    advancedInterviewQuestions: [
      'Refactor an inheritance-heavy policy tree to composition under time pressure.',
      'Discuss mixin/default-method reuse vs composition.',
      'How do you prevent “composition getters” from leaking ownership?',
      'Critique a shared “BaseService” in an enterprise codebase.',
      'Balance DRY across microservice boundaries (shared libs vs duplication).',
    ],
    interviewReadyAnswers: [
      {
        question: 'Why composition over inheritance?',
        answer:
          'Inheritance couples me to a parent’s implementation and exposes its API, which often breaks invariants — Stack extends ArrayList is the classic case. Composition lets me own a private collaborator, expose only what I mean, and swap implementations behind an interface. That’s better for testing and LSP. I still use inheritance for narrow, true is-a specialization, but my default reuse tool is composition.',
      },
    ],
    keyTakeaways: [
      'DRY knowledge, not every similar-looking loop.',
      'KISS wins under interview and maintenance pressure.',
      'Composition over inheritance for reuse; inheritance for is-a.',
      'Don’t leak composed delegates through public getters.',
    ],
  },
)

export const m3Pages: StudyPage[] = [d5p8, d5p9, d5p10]
