import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  ol,
  code,
  table,
  callout,
  diagram,
  example,
} from '../../../helpers'

export const d5p11: StudyPage = createPage(
  'd5-p11',
  'Singleton & Factory (Java)',
  18,
  [
    'Implement Singleton carefully and articulate its drawbacks',
    'Apply Factory Method / simple factory for creation flexibility',
    'Argue when Singleton is a smell versus a constrained resource gate',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Singleton: exactly one instance with global access. Factory: encapsulate object creation so callers depend on a product abstraction, not concrete constructors. Both are creational — but Singleton often fights testability while Factory usually improves it.',
        ),
        h3('Why they exist'),
        p(
          'Singleton historically modeled “one config,” “one connection pool owner,” or “one logger.” Factory exists so creation logic (which subtype? which config?) doesn’t litter business code — supporting OCP and DIP.',
        ),
        callout(
          'warning',
          'Interview-strong take: Singleton is often a disguised global. Prefer dependency injection of a single shared instance managed by the container/composition root.',
          'Modern stance',
        ),
      ]),
      section('how', 'How it works', [
        h3('Singleton variants in Java'),
        ul([
          'Enum singleton (Effective Java): INSTANCE — simple, serialization-safe, reflection-resistant.',
          'static holder / lazy init with class loading.',
          'Double-checked locking with volatile (legacy knowledge check).',
          'DI “singleton scope” ≠ classic Singleton pattern — no global static required.',
        ]),
        h3('Factory styles'),
        ul([
          'Simple factory: static/method chooses concrete type (not always a GoF pattern).',
          'Factory Method: creator subclasses decide which product to instantiate.',
          'Often: interface Product; class Factory { Product create(...) }.',
        ]),
        diagram(
          `classDiagram
  class NotificationFactory {
    +create(channel) Notification
  }
  interface Notification
  Notification <|.. EmailNotification
  Notification <|.. SmsNotification
  NotificationFactory ..> Notification`,
          'Factory returns interface; callers never new concrete types.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `// Enum singleton — preferred if you truly need one
public enum AppConfig {
  INSTANCE;
  private final Properties props = load();
  public String get(String key) { return props.getProperty(key); }
  private Properties load() { ... }
}

// Classic lazy holder
public final class LazyRegistry {
  private LazyRegistry() {}
  private static class Holder {
    static final LazyRegistry INSTANCE = new LazyRegistry();
  }
  public static LazyRegistry get() { return Holder.INSTANCE; }
}

// Factory Method-ish
public interface Button { void render(); }
public interface UIFactory { Button createButton(); }

public final class DarkUIFactory implements UIFactory {
  public Button createButton() { return new DarkButton(); }
}
public final class LightUIFactory implements UIFactory {
  public Button createButton() { return new LightButton(); }
}

// Simple factory
public final class NotificationFactory {
  private NotificationFactory() {}
  public static Notification create(String channel) {
    return switch (channel) {
      case "email" -> new EmailNotification();
      case "sms" -> new SmsNotification();
      default -> throw new IllegalArgumentException(channel);
    };
  }
}`,
          'Enum singleton; factories hide concrete construction.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Singleton: hard to test (hidden deps), hidden state across tests, parallelism issues, lifecycle/reset pain.',
          'Singleton of a DB connection is usually wrong — use a pool.',
          'Factory switch can become OCP debt — prefer registry/plugins when it grows.',
          'Factory Method inheritance hierarchies can be heavy; a simple injected Provider<Button> may suffice.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Abstract Factory generalizes families of products (next page).',
          'DIP: inject factories or products rather than static Singletons.',
          'Spring @Component singleton scope replaces classic Singleton in apps.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Implement a thread-safe Singleton.”'),
        p(
          'Strong answer: “I’d use an enum. If they want DCL, I’ll show volatile + synchronized null-check and then explain why DI is better for testability.”',
        ),
        p('Interviewer: “Why not Singleton for services?”'),
        p(
          'Strong answer: “Global access hides dependencies. I can’t substitute fakes easily. I’ll register one instance in the composition root and inject it.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Lazy Singleton without safe publication (broken DCL).',
      'Using Singleton for anything “shared.”',
      'Factory that returns concrete types still everywhere.',
      'God factory with 200 switch cases.',
      'Mutable Singleton state causing flaky tests.',
    ],
    interviewQuestions: [
      'What is the Singleton pattern? Pros and cons?',
      'How do you create a thread-safe Singleton in Java?',
      'Why is enum Singleton recommended?',
      'What is a Factory? Why use it?',
      'Factory Method vs simple factory?',
    ],
    intermediateInterviewQuestions: [
      'How does Singleton hurt unit testing?',
      'Singleton vs Spring singleton bean?',
      'When is Singleton justified?',
      'How do you make a factory open for extension?',
      'What problems does Factory Method solve vs constructors?',
    ],
    advancedInterviewQuestions: [
      'Show double-checked locking and explain every volatile necessity.',
      'Design a notification factory with classpath plugin registration.',
      'Refactor a Singleton service to DI without breaking callers.',
      'Serialization/reflection attacks on classic Singletons — how enum helps.',
      'Compare Supplier/Provider functional approaches to Factory Method.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Singleton — when and how in Java?',
        answer:
          'Singleton ensures one instance with global access. If I must implement it, I use an enum or initialization-on-demand holder. Trade-offs are severe: hidden dependencies, hard testing, and shared mutable state. In real systems I prefer a single instance created at the composition root and injected — same lifecycle, better design. Factories, by contrast, I use freely to hide construction and return interfaces.',
      },
    ],
    keyTakeaways: [
      'Singleton = global instance; often a testability smell.',
      'Prefer enum or holder if forced to implement it.',
      'Factory hides new and returns abstractions.',
      'DI singleton scope ≠ static Singleton pattern.',
    ],
  },
)

export const d5p12: StudyPage = createPage(
  'd5-p12',
  'Abstract Factory & Builder (Java)',
  18,
  [
    'Contrast Abstract Factory vs Factory Method',
    'Use Builder for complex object construction and telescoping constructors',
    'Know when Abstract Factory is overkill',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Abstract Factory: an interface for creating families of related products (Button + Checkbox for DarkTheme) without specifying concrete classes. Builder: construct a complex object step by step, then build() with validation — especially when there are many optional parameters.',
        ),
        table(
          ['Pattern', 'Creates', 'Key idea'],
          [
            [
              'Factory Method',
              'One product',
              'Subclass/creator decides concrete type',
            ],
            [
              'Abstract Factory',
              'Family of products',
              'One factory yields consistent variants',
            ],
            [
              'Builder',
              'One complex object',
              'Stepwise config + final validation',
            ],
          ],
        ),
      ]),
      section('how', 'How it works', [
        diagram(
          `classDiagram
  class UIFactory {
    <<interface>>
    +button() Button
    +checkbox() Checkbox
  }
  class DarkFactory
  class LightFactory
  UIFactory <|.. DarkFactory
  UIFactory <|.. LightFactory
  DarkFactory ..> DarkButton
  DarkFactory ..> DarkCheckbox`,
          'Abstract Factory keeps product families consistent.',
        ),
        h3('Builder essentials'),
        ul([
          'Fluent withX methods return this (or a staged builder for required fields).',
          'build() validates combinations (e.g., HTTPS requires cert).',
          'Prefer builders for immutables with many fields.',
          'Java records + compact constructors cover simple cases; Builder still wins for options.',
        ]),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `public interface Button { void paint(); }
public interface Checkbox { void paint(); }

public interface UIFactory {
  Button createButton();
  Checkbox createCheckbox();
}

public final class DarkUIFactory implements UIFactory {
  public Button createButton() { return new DarkButton(); }
  public Checkbox createCheckbox() { return new DarkCheckbox(); }
}

// Client depends only on UIFactory — swap LightUIFactory without edits
void renderForm(UIFactory ui) {
  ui.createButton().paint();
  ui.createCheckbox().paint();
}

// Builder
public final class HttpRequest {
  private final String url;
  private final String method;
  private final Map<String, String> headers;
  private final byte[] body;

  private HttpRequest(Builder b) {
    this.url = b.url;
    this.method = b.method;
    this.headers = Map.copyOf(b.headers);
    this.body = b.body != null ? b.body.clone() : null;
  }

  public static final class Builder {
    private final String url; // required
    private String method = "GET";
    private final Map<String, String> headers = new LinkedHashMap<>();
    private byte[] body;

    public Builder(String url) {
      this.url = Objects.requireNonNull(url);
    }
    public Builder method(String method) {
      this.method = Objects.requireNonNull(method);
      return this;
    }
    public Builder header(String k, String v) {
      headers.put(k, v);
      return this;
    }
    public Builder body(byte[] body) {
      this.body = body;
      return this;
    }
    public HttpRequest build() {
      if ("GET".equals(method) && body != null)
        throw new IllegalStateException("GET cannot have body");
      return new HttpRequest(this);
    }
  }
}

HttpRequest req = new HttpRequest.Builder("https://api.example.com")
  .method("POST")
  .header("Content-Type", "application/json")
  .body(json)
  .build();`,
          'Family consistency via Abstract Factory; safe construction via Builder.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Abstract Factory adds many types — overkill for one product.',
          'Adding a new product to an Abstract Factory breaks all factory implementors (ISP/OCP tension) — design families carefully.',
          'Builders can be verbose; for 2–3 fields, a factory method is enough.',
          'Telescoping constructors are the Builder’s main enemy — don’t mix both styles.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Abstract Factory often injected (DIP) into UI/theme or DB dialect layers.',
          'Builder pairs with immutable encapsulation.',
          'Director (GoF) is optional — rarely needed in Java interviews.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Abstract Factory vs Factory Method?”'),
        p(
          'Strong answer: “Factory Method: one product, creation deferred to subclasses. Abstract Factory: create a whole family of related products so they match. I’d use Abstract Factory for themes/DB vendors; Factory Method for a single extension point.”',
        ),
        p('Interviewer: “Why Builder over setters?”'),
        p(
          'Strong answer: “I can keep the product immutable and validate atomic construction. Setters allow invalid half-built objects and racey mutation.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Calling any factory an Abstract Factory.',
      'Abstract Factory when a single Factory Method suffices.',
      'Builder without validation in build().',
      'Mutable product after builder builds (leaking internal maps).',
      'Required fields only enforced by docs, not by API.',
    ],
    interviewQuestions: [
      'What is Abstract Factory?',
      'Abstract Factory vs Factory Method?',
      'What problem does Builder solve?',
      'When would you avoid Abstract Factory?',
      'How do you enforce required fields with Builder?',
    ],
    intermediateInterviewQuestions: [
      'How does Abstract Factory support product family consistency?',
      'Staged builders — why use them?',
      'Builder vs telescoping constructors vs JavaBeans setters?',
      'Can Abstract Factory return builders?',
      'How does Lombok @Builder affect design interviews?',
    ],
    advancedInterviewQuestions: [
      'Evolve an Abstract Factory when a new product type is added — options?',
      'Design a typesafe staged builder for a query DSL.',
      'Compare Abstract Factory with DI modules providing families of beans.',
      'Thread-safety of builders — should they be reused?',
      'Immutable object graphs: nested builders patterns.',
    ],
    interviewReadyAnswers: [
      {
        question: 'When Builder vs Abstract Factory?',
        answer:
          'Builder constructs one complex object with many optional parameters and keeps it valid/immutable at build(). Abstract Factory creates families of related objects so variants stay consistent — dark buttons with dark checkboxes. They’re different axes: complexity of one instance vs consistency across multiple product types. Trade-off: both add types; I use them when the pain (telescoping ctors or mismatched families) is real.',
      },
    ],
    keyTakeaways: [
      'Abstract Factory = families of products.',
      'Factory Method = one product, deferred creation.',
      'Builder = stepwise, validated construction of complex objects.',
      'Don’t over-pattern simple construction.',
    ],
  },
)

export const d5p13: StudyPage = createPage(
  'd5-p13',
  'Strategy & Observer (Java)',
  18,
  [
    'Replace conditionals with Strategy',
    'Apply Observer for event-style updates and know modern Java analogs',
    'Contrast push vs pull observers and memory-leak pitfalls',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Strategy: encapsulate interchangeable algorithms behind an interface and compose them into a context. Observer: one subject notifies many dependents when state changes. Strategy is about choosing behavior; Observer is about propagating change.',
        ),
        h3('Why they exist'),
        p(
          'Strategy kills growing if/else on algorithm choice (sort, price, compress). Observer decouples publishers from concrete subscribers — UI updates, domain events, messaging — though in modern systems you often use event buses or reactive streams instead of hand-rolled lists.',
        ),
      ]),
      section('how', 'How it works', [
        diagram(
          `flowchart LR
  Context --> Strategy
  Strategy --> A[ConcreteA]
  Strategy --> B[ConcreteB]
  Subject --> O1[Observer1]
  Subject --> O2[Observer2]`,
          'Strategy: context delegates. Observer: subject notifies many.',
        ),
        ul([
          'Strategy: inject or set the strategy; context calls strategy.execute(...).',
          'Observer: register/unregister; on change, notifyAll.',
          'Java: Comparator is Strategy; PropertyChangeSupport / Flow API are Observer cousins.',
        ]),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `public interface PricingStrategy {
  Money quote(Cart cart);
}

public final class RegularPricing implements PricingStrategy {
  public Money quote(Cart cart) { return cart.subtotal(); }
}
public final class VipPricing implements PricingStrategy {
  public Money quote(Cart cart) {
    return cart.subtotal().percentOff(10);
  }
}

public final class Checkout {
  private final PricingStrategy pricing;
  public Checkout(PricingStrategy pricing) { this.pricing = pricing; }
  public Money total(Cart cart) { return pricing.quote(cart); }
}

// Observer (simplified)
public interface OrderObserver {
  void onPaid(Order order);
}

public final class OrderSubject {
  private final List<OrderObserver> observers = new CopyOnWriteArrayList<>();
  public void subscribe(OrderObserver o) { observers.add(o); }
  public void unsubscribe(OrderObserver o) { observers.remove(o); }

  public void markPaid(Order order) {
    order.markPaid();
    for (OrderObserver o : observers) o.onPaid(order);
  }
}

// Comparators = Strategy
List<String> names = ...;
names.sort(String::compareToIgnoreCase);
names.sort(Comparator.comparing(String::length));`,
          'Interchangeable algorithms; pub-sub notifications.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Strategy explosion if every tiny branch becomes a class — balance with clarity.',
          'Observer: update storms, ordering undefined, exception handling in notify loops.',
          'Memory leaks: forgotten unsubscribe (especially UI / inner classes).',
          'Push (send data) vs pull (observers query subject) — pull couples observers to subject API.',
          'Prefer domain events + handlers at service boundaries for large systems.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Strategy is OCP + composition over inheritance.',
          'Observer can implement DIP between core and side effects (email, analytics).',
          'Decorator also changes behavior but by wrapping, not swapping algorithm wholesale.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “How do you remove a switch on payment type?”'),
        p(
          'Strong answer: “PricingStrategy/PaymentStrategy per type, selected by factory or DI map. Checkout depends on the interface. New type = new class + registration.”',
        ),
        p('Interviewer: “Observer vs message queue?”'),
        p(
          'Strong answer: “In-process Observer is sync and simple. Queues add durability, load isolation, and cross-service delivery at operational cost. I’d pick Observer inside a monolith module; messaging across processes.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Strategies that still contain giant switches.',
      'Not handling observer exceptions (one bad listener kills others).',
      'Forgetting thread-safety of the listener list.',
      'Using Observer for request/response flows that should return values.',
      'Tight coupling by pushing concrete Event types with 40 fields.',
    ],
    interviewQuestions: [
      'Explain Strategy with a Java example.',
      'Explain Observer with a Java example.',
      'How does Strategy support OCP?',
      'What is push vs pull in Observer?',
      'Where does Java use Strategy in the JDK?',
    ],
    intermediateInterviewQuestions: [
      'Strategy vs Template Method?',
      'How do you choose strategies dynamically at runtime?',
      'Observer memory leaks — causes and fixes?',
      'CopyOnWriteArrayList for listeners — why?',
      'Domain events vs classic Observer?',
    ],
    advancedInterviewQuestions: [
      'Design checkout with Strategy + events for side effects.',
      'Failure isolation policies when notifying observers.',
      'Compare Observer, Mediator, and Pub/Sub.',
      'Reactive Streams vs Observer pattern.',
      'Thread model: notifying listeners on which thread?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Strategy vs Observer — when each?',
        answer:
          'Strategy replaces interchangeable algorithms — pricing, sorting, compression — via composition. Observer notifies multiple dependents of a state change — logging, UI, email. I use Strategy to kill switches; Observer (or domain events) to decouple side effects from the core transaction. Trade-offs: Strategy adds types; Observer adds ordering/exception/leak concerns.',
      },
    ],
    keyTakeaways: [
      'Strategy = pluggable algorithms via interfaces.',
      'Observer = pub-sub for state changes.',
      'Comparator is Strategy in the JDK.',
      'Unsubscribe and exception isolation matter for Observer.',
    ],
  },
)

export const d5p14: StudyPage = createPage(
  'd5-p14',
  'Adapter & Decorator (Java)',
  18,
  [
    'Use Adapter to bridge incompatible interfaces',
    'Use Decorator to add behavior without subclass explosion',
    'Distinguish Adapter, Decorator, and Proxy in interviews',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Adapter: convert one interface into another clients expect — wrap a legacy/third-party API. Decorator: attach additional responsibilities to an object dynamically by wrapping it with the same interface. Both use composition; they differ in intent (translation vs augmentation).',
        ),
        table(
          ['Pattern', 'Intent', 'Interface relationship'],
          [
            [
              'Adapter',
              'Make incompatible APIs work together',
              'Target ≠ Adaptee (translate)',
            ],
            [
              'Decorator',
              'Add behavior transparently',
              'Same interface as wrapped object',
            ],
            [
              'Proxy',
              'Control access (lazy, security, remote)',
              'Same interface; often lifecycle/access focus',
            ],
          ],
        ),
      ]),
      section('how', 'How it works', [
        diagram(
          `flowchart LR
  Client --> Target
  Adapter --> Target
  Adapter --> Adaptee
  Client2 --> Component
  Decorator --> Component
  Concrete --> Component
  Decorator --> Concrete`,
          'Adapter translates; Decorator stacks same-interface wrappers.',
        ),
        p(
          'JDK: InputStreamReader adapts InputStream bytes to Reader chars. java.io stream decorators: BufferedInputStream, GZIPInputStream wrap InputStream. Collections.unmodifiableList is a decorating wrapper restricting mutation.',
        ),
      ]),
      section('example', 'Worked example', [
        code(
          'java',
          `// Target used by app
public interface JsonHttpClient {
  JsonNode get(String path);
}

// Adaptee — third party
class LegacyXmlClient {
  String fetchXml(String url) { ... }
}

// Adapter
public final class XmlToJsonAdapter implements JsonHttpClient {
  private final LegacyXmlClient legacy;
  public XmlToJsonAdapter(LegacyXmlClient legacy) { this.legacy = legacy; }

  public JsonNode get(String path) {
    String xml = legacy.fetchXml(toUrl(path));
    return XmlJson.convert(xml); // translation
  }
}

// Decorator — same interface
public interface DataSource {
  String read();
  void write(String data);
}

public final class FileDataSource implements DataSource { ... }

public abstract class DataSourceDecorator implements DataSource {
  protected final DataSource wrappee;
  protected DataSourceDecorator(DataSource w) { this.wrappee = w; }
}

public final class EncryptionDecorator extends DataSourceDecorator {
  public EncryptionDecorator(DataSource w) { super(w); }
  public void write(String data) { wrappee.write(encrypt(data)); }
  public String read() { return decrypt(wrappee.read()); }
}

public final class CompressionDecorator extends DataSourceDecorator {
  public CompressionDecorator(DataSource w) { super(w); }
  public void write(String data) { wrappee.write(compress(data)); }
  public String read() { return decompress(wrappee.read()); }
}

DataSource ds = new EncryptionDecorator(
  new CompressionDecorator(new FileDataSource("file.dat")));`,
          'Adapter translates XML client; decorators stack cross-cutting behavior.',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Adapter can become a god translation layer — keep mapping explicit.',
          'Decorator stacks can hurt debuggability and identity (== on wrappers).',
          'Order of decorators matters (encrypt-then-compress vs reverse).',
          'Class adapter via multiple inheritance isn’t a Java option — object adapter only.',
          'Don’t confuse Decorator with subclassing for every feature combination (that’s the explosion Decorator avoids).',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Decorator supports OCP for cross-cutting concerns.',
          'Adapter often appears at hexagonal architecture boundaries.',
          'Proxy vs Decorator: similar structure, different reason.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Adapter vs Decorator?”'),
        p(
          'Strong answer: “Adapter changes the interface to match the client. Decorator keeps the interface and adds behavior. If I’m wrapping Stripe to look like PaymentGateway, that’s Adapter. If I’m adding retry/logging around PaymentGateway, that’s Decorator.”',
        ),
        p('Interviewer: “Why not inheritance for logging?”'),
        p(
          'Strong answer: “I’d need a logging subclass per implementation. Decorator wraps any implementation once.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Using Adapter when you control both interfaces — just change one.',
      'Decorator that secretly changes core semantics (LSP risk).',
      'Deep decorator stacks with unclear order.',
      'Calling Proxy a Decorator or vice versa.',
      'Adapter leaking adaptee types through the target API.',
    ],
    interviewQuestions: [
      'What is the Adapter pattern?',
      'What is the Decorator pattern?',
      'Adapter vs Decorator?',
      'Give a JDK example of each.',
      'Decorator vs inheritance for features?',
    ],
    intermediateInterviewQuestions: [
      'Adapter vs Facade?',
      'Proxy vs Decorator?',
      'How do decorators preserve LSP?',
      'Object adapter vs class adapter?',
      'When does Adapter violate DIP?',
    ],
    advancedInterviewQuestions: [
      'Design retry + metrics + circuit-breaker decorators for a gateway.',
      'Identity and equality issues with decorated objects.',
      'Decorator order for encryption and compression — which first and why?',
      'Generate adapters for evolving external APIs (versioning).',
      'Compare Decorator with AOP/interceptors in Spring.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Adapter vs Decorator with Java examples.',
        answer:
          'Adapter makes an incompatible API usable — InputStreamReader, or wrapping LegacyXmlClient as JsonHttpClient. Decorator adds responsibilities while keeping the same interface — BufferedInputStream, or EncryptionDecorator around a DataSource. Structure can look similar (wrappers), but intent differs: translate vs enhance. Trade-off: adapters isolate third parties; decorators avoid subclass combinatorics but can complicate debugging if over-stacked.',
      },
    ],
    keyTakeaways: [
      'Adapter = interface translation.',
      'Decorator = same interface + added behavior.',
      'JDK I/O is full of both ideas.',
      'Prefer decorators over feature-subclass matrices.',
    ],
  },
)

export const d5p15: StudyPage = createPage(
  'd5-p15',
  'Pattern Selection Interview Practice',
  20,
  [
    'Map problem statements to appropriate patterns',
    'Defend trade-offs when a pattern is overkill',
    'Answer how interviewers test OOP understanding end-to-end',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Pattern interviews are not trivia. Interviewers watch whether you name a pattern only after stating the force: what varies, what must stay stable, who owns lifecycle, and how you’ll test it. The winning move is often “simple composition + interface” without forcing a GoF label.',
        ),
        h3('Selection cheat-sheet'),
        table(
          ['If you hear…', 'Consider…', 'Watch out for…'],
          [
            ['Many algorithms / policies', 'Strategy', 'Class explosion'],
            ['Notify many modules', 'Observer / events', 'Leaks, ordering'],
            ['Third-party mismatch', 'Adapter', 'Leaky translation'],
            ['Stackable extras (log/retry)', 'Decorator', 'Wrapper identity'],
            ['Families of products', 'Abstract Factory', 'Overkill'],
            ['Many optional fields', 'Builder', 'Needless fluency'],
            ['One global instance', 'Avoid Singleton; prefer DI', 'Hidden deps'],
            ['Creation choice', 'Factory', 'Giant switches'],
          ],
        ),
      ]),
      section('how', 'How would an interviewer test your understanding of OOP?', [
        p(
          'Interviewers rarely ask you to recite definitions. They probe whether OOP tools show up in design decisions under pressure. Typical tests:',
        ),
        ol([
          'Whiteboard a small domain (orders, payments, notifications) and watch for encapsulation of invariants vs public fields.',
          'Ask you to add a new variant (“now support crypto payments”) — do you edit a switch or extend via interface?',
          'Show a Square/Rectangle or Stack-extends-List snippet — do you spot LSP / composition issues?',
          'Ask how you’d test without hitting Stripe/DB — DIP and fakes.',
          'Change a requirement that breaks an inheritance tree — do you migrate to Strategy/composition?',
          'Name that pattern / when not to use it — judgment over jargon.',
          'Follow-ups: coupling, cohesion, thread-safety of Singleton, decorator order.',
          'Code-reading: predict dynamic dispatch output; explain overload vs override.',
        ]),
        callout(
          'tip',
          'Narrate forces: “What varies is X; what stays stable is Y; I’ll introduce abstraction Z; trade-off is W.” Patterns then become names for that structure.',
          'Verbal structure',
        ),
        h3('Pattern selection drill'),
        ul([
          'Logging + retries around HTTP — Decorator (or interceptor), not subclass per client.',
          'Theme-specific widgets — Abstract Factory; single Button type — Factory Method/simple factory.',
          'Sort orders by different fields — Strategy (Comparator).',
          'Email + analytics on order paid — Observer/domain events, not Checkout doing SMTP.',
          'Legacy SOAP into new REST domain — Adapter at the boundary.',
          'Config object everyone new’s — DI single instance, not static Singleton.',
        ]),
      ]),
      section('example', 'Worked example', [
        example('Interview prompt', [
          p(
            '“Design a notification system: email, SMS, push. Later we’ll add Slack. Messages can be compressed and encrypted. Admins subscribe to failure alerts.”',
          ),
          p('Strong approach:'),
          ul([
            'NotificationChannel strategy/interface + factory/registry for channel selection (OCP).',
            'Decorator pipeline for compression/encryption on a MessageSender.',
            'Observer/events for admin failure alerts (side effects out of send path core).',
            'No Singleton; inject registry and metrics.',
            'Mention ISP: separate FailureListener from Channel admin APIs.',
          ]),
          code(
            'java',
            `public interface NotificationChannel {
  void send(Message message);
}

public interface MessageSender {
  void send(Message message);
}

// Decorators implement MessageSender and wrap another MessageSender
// Channels implement NotificationChannel
// On failure: publisher.notify(new SendFailed(...))`,
            'Sketch enough structure to discuss trade-offs; don’t boil the ocean.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Pattern soup fails interviews — too many boxes, no invariants.',
          'Refusing all patterns also fails — you’ll hard-code switches and statics.',
          'Say when a pattern is premature: one channel forever → just EmailSender.',
          'Prefer JDK/language features (Comparator, streams, sealed types) when they solve it.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Every pattern choice should cite SOLID / coupling / composition.',
          'Creation patterns feed DIP; behavioral patterns shape OCP; structural patterns manage boundaries.',
          'LLD interviews combine this day with API clarity and complexity talk.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Interviewer: “Which pattern is this?”'),
        p(
          'Strong answer: “I’d call it Strategy for channel selection and Decorator for encryption. But the important part is: channels are interchangeable behind an interface, and cross-cutting transforms wrap a sender without modifying each channel.”',
        ),
        p('Interviewer: “Isn’t that overengineering?”'),
        p(
          'Strong answer: “If we only have email and no transforms, yes — I’d ship EmailSender. Given multiple channels and stacked behaviors in the prompt, these seams match the stated variation.”',
        ),
        p('Interviewer: “How would we test it?”'),
        p(
          'Strong answer: “Inject fake channels and a recording FailureListener. Unit-test decorators with a fake inner sender capturing bytes. That’s DIP paying rent.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Name-dropping patterns without forces.',
      'Singleton by default for shared services.',
      'One inheritance tree for every feature.',
      'No testing story.',
      'Drawing UML for 20 minutes with zero invariants discussed.',
    ],
    interviewQuestions: [
      'How do you choose a design pattern?',
      'When is a pattern overkill?',
      'How would an interviewer test your OOP understanding?',
      'Map: retries around a client — which pattern?',
      'Map: multiple payment methods — which pattern?',
    ],
    intermediateInterviewQuestions: [
      'Design notifications with channels + encryption — sketch.',
      'How do you explain a design without using pattern names?',
      'What’s your process for LLD in 30–40 minutes?',
      'How do SOLID principles guide pattern choice?',
      'Give an example where you removed a pattern successfully.',
    ],
    advancedInterviewQuestions: [
      'Evolve the notification design for multi-tenant rate limits.',
      'Where do patterns belong in hexagonal architecture layers?',
      'Facilitate a design review: push back on Abstract Factory abuse.',
      'Combine Strategy + Factory + Observer without circular deps.',
      'How do you document extension points for future teammates?',
      'Trade-offs of event-driven vs in-process Observer at scale.',
    ],
    interviewReadyAnswers: [
      {
        question: 'How would an interviewer test your understanding of OOP?',
        answer:
          'They’ll give a small design problem and watch my decisions: do I encapsulate invariants, depend on interfaces, extend via new types, and test with fakes? They’ll inject a new requirement to see if I modify a switch or apply OCP. They may show LSP-breaking inheritance and ask for a fix via composition. Pattern names are secondary — they’ll probe why, trade-offs, and testing. I narrate what varies vs what’s stable, then pick Strategy, Factory, Decorator, or plain composition accordingly.',
      },
      {
        question: 'How do you pick between patterns?',
        answer:
          'I identify the variation: algorithm (Strategy), interface mismatch (Adapter), stacked behavior (Decorator), creation family (Abstract Factory), construction complexity (Builder), fan-out notifications (Observer). I pick the lightest structure that isolates that variation and keeps tests easy. If there’s only one variant, I skip the pattern. Trade-off is always indirection versus future change cost.',
      },
    ],
    keyTakeaways: [
      'Name forces first; patterns second.',
      'Interviewers test OOP via design changes, LSP traps, and test seams.',
      'Overkill patterns lose points; so do giant switches.',
      'Always include a testing story (DIP + fakes).',
    ],
  },
)

export const m4Pages: StudyPage[] = [d5p11, d5p12, d5p13, d5p14, d5p15]
