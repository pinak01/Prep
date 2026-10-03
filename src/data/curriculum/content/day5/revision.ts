import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  ol,
  table,
  callout,
  code,
} from '../../../helpers'

export const d5rev: StudyPage = createPage(
  'd5-rev',
  '10-Minute Revision',
  10,
  [
    'Rapidly recall OOP pillars, relationships, SOLID, and core patterns',
    'Use checklist prompts you can speak aloud before an interview',
  ],
  {
    sections: [
      section('pillars', 'OOP pillars checklist', [
        ul([
          'Encapsulation: protect invariants; no mutable escape; intent methods > setters.',
          'Abstraction: interfaces for roles; abstract class only for shared skeleton/state.',
          'Inheritance: true is-a + LSP; shallow trees; else compose.',
          'Polymorphism: dynamic dispatch on overridable instance methods.',
          'Binding: overrides runtime; overloads/statics/fields compile-time / reference-type.',
        ]),
      ]),
      section('relationships', 'Relationships & quality', [
        ul([
          'Association = knows; Aggregation = weak whole-part; Composition = owns lifecycle.',
          'Low coupling / high cohesion; avoid god classes and hidden statics.',
          'Constructors/factories establish validity; know private/default/protected/public.',
        ]),
      ]),
      section('solid', 'SOLID + DRY/KISS one-liners', [
        table(
          ['Principle', 'One-liner'],
          [
            ['SRP', 'One reason to change'],
            ['OCP', 'Extend by adding types, not editing forever'],
            ['LSP', 'Subtypes must honor base contracts'],
            ['ISP', 'Small role interfaces'],
            ['DIP', 'Depend on abstractions; inject details'],
            ['DRY', 'One authoritative knowledge — not premature helpers'],
            ['KISS', 'Simplest design that works'],
            ['Comp > Inh', 'Reuse via has-a; inherit only for is-a'],
          ],
        ),
      ]),
      section('patterns', 'Patterns 15-second map', [
        ul([
          'Singleton → avoid globals; enum if forced; prefer DI scope.',
          'Factory / Factory Method → hide new; return interfaces.',
          'Abstract Factory → families (theme/vendor).',
          'Builder → many optional fields + validate on build.',
          'Strategy → interchangeable algorithms (Comparator).',
          'Observer → notify many (watch leaks).',
          'Adapter → translate interfaces.',
          'Decorator → same interface + extras (I/O streams).',
        ]),
      ]),
      section('speak', '60-second speak track', [
        p(
          '“I model invariants in domain types, depend on narrow interfaces, extend behavior with new implementations, and compose instead of deep inheritance. Patterns name those structures — Strategy for policies, Factory for creation, Decorator for stacked concerns, Adapter at boundaries. DIP lets me test with fakes.”',
        ),
        callout(
          'tip',
          'Before the call: sketch Order + PaymentGateway + one Strategy on paper in 2 minutes.',
          'Warm-up',
        ),
      ]),
    ],
    commonMistakes: [
      'Revising definitions without an example sentence.',
      'Skipping binding/LSP — highest trick density.',
      'Memorizing UML without ownership talk.',
    ],
    interviewQuestions: [
      'List the four OOP pillars with one example each.',
      'SOLID in one minute.',
      'Composition vs inheritance in one minute.',
      'Name four patterns and when you’d use them.',
      'How does DIP help testing?',
    ],
    intermediateInterviewQuestions: [
      'Association vs aggregation vs composition — 30 seconds.',
      'Overload vs override — 30 seconds.',
      'Abstract class vs interface — 30 seconds.',
      'Strategy vs Template Method — 30 seconds.',
      'Adapter vs Decorator — 30 seconds.',
    ],
    advancedInterviewQuestions: [
      'Deliver a 2-minute LLD for checkout aloud using today’s vocabulary.',
      'List three LSP red flags.',
      'Explain fragile base class without jargon overload.',
      'When do you refuse Singleton in a design interview?',
      'What would you delete from an over-patterned design?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Give a rapid OOP + SOLID summary.',
        answer:
          'I encapsulate invariants, abstract behind interfaces, use inheritance only when LSP holds, and rely on polymorphism for extension. SOLID keeps change cheap: one reason to change, extend by adding types, honor contracts, segregate interfaces, depend on abstractions. I prefer composition for reuse and inject dependencies so tests use fakes. Patterns are optional names for those moves.',
      },
    ],
    keyTakeaways: [
      'Invariants, interfaces, composition, tests — the core story.',
      'SOLID is change-management, not decoration.',
      'Patterns map to variations; skip when variation is absent.',
    ],
  },
)

export const d5traps: StudyPage = createPage(
  'd5-traps',
  'Interview Traps',
  10,
  [
    'Recognize common OOP/LLD misconceptions that cost offers',
    'Practice the corrected mental model under follow-up pressure',
  ],
  {
    sections: [
      section('traps', 'High-frequency traps', [
        h3('1. “Private fields + getters = encapsulation”'),
        p(
          'Trap: mutators allow illegal states. Fix: intent methods + validation; immutable values where possible.',
        ),
        h3('2. “Inheritance is how OOP reuses code”'),
        p(
          'Trap: Stack extends List. Fix: composition; inheritance for substitutable is-a only.',
        ),
        h3('3. “Square is a Rectangle”'),
        p(
          'Trap: LSP break with setters. Fix: separate types under Shape; prefer immutability.',
        ),
        h3('4. “Singleton for every shared service”'),
        p(
          'Trap: global state, untestable. Fix: one instance at composition root + injection.',
        ),
        h3('5. “Interface for every class”'),
        p(
          'Trap: Foo/FooImpl noise. Fix: introduce interfaces at real seams (variation, testing, boundary).',
        ),
        h3('6. “Static methods can be overridden”'),
        p(
          'Trap: binding confusion. Fix: statics hide; instance overrides dispatch dynamically.',
        ),
        h3('7. “OCP means never change files”'),
        p(
          'Trap: absolutism. Fix: stable cores shouldn’t churn for every feature; bugfixes still edit code.',
        ),
        h3('8. “DRY everything immediately”'),
        p(
          'Trap: wrong abstraction. Fix: duplicate until sameness is real; rule of three.',
        ),
        h3('9. Pattern name-drop without forces'),
        p(
          'Trap: “I’ll use Abstract Factory” for one product. Fix: state what varies; pick lightest tool.',
        ),
        h3('10. Decorator vs Adapter mix-up'),
        p(
          'Trap: same UML-ish wrapper. Fix: Adapter changes interface; Decorator keeps it.',
        ),
      ]),
      section('snippets', 'Gotcha snippets', [
        code(
          'java',
          `Animal a = new Dog();
a.staticKind(); // resolved on Animal — not polymorphic
System.out.println(a.name); // field from Animal if hidden in Dog`,
          'Ask yourself: override, overload, static, or field?',
        ),
        callout(
          'mistake',
          'Calling overridable methods from constructors — subclass sees uninitialized fields.',
          'Constructor trap',
        ),
      ]),
      section('recovery', 'How to recover mid-interview', [
        ol([
          'Pause: “Let me check the contract / lifecycle / testability.”',
          'Correct yourself aloud — interviewers reward judgment.',
          'Offer the simpler alternative and when you’d upgrade to a pattern.',
          'Tie back to an invariant you will protect.',
        ]),
      ]),
    ],
    commonMistakes: [
      'Doubling down on a wrong inheritance model.',
      'Ignoring testability until asked.',
      'Drawing patterns that don’t match the prompt’s variations.',
    ],
    interviewQuestions: [
      'What’s wrong with Stack extends ArrayList?',
      'Why is Singleton criticized?',
      'Static vs dynamic binding trap example?',
      'When is DRY harmful?',
      'Adapter or Decorator for retry logic?',
    ],
    intermediateInterviewQuestions: [
      'How do you spot an ISP violation quickly?',
      'What’s wrong with UnsupportedOperationException implements?',
      'Why is protected wider than people think?',
      'When is a switch better than Strategy?',
      'How can Observer cause production incidents?',
    ],
    advancedInterviewQuestions: [
      'Walk through fixing Square/Rectangle without losing shared area() code.',
      'Critique a BaseService inheritance hierarchy in a PR.',
      'Recover from over-engineering Abstract Factory in a design interview.',
      'Explain a false mock that violates LSP of the real gateway.',
      'Where do ORMs push you into encapsulation traps — and how do you cope?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Name three OOP interview traps and fixes.',
        answer:
          'One: getters/setters aren’t encapsulation — protect invariants with real operations. Two: inheritance for reuse — compose instead unless LSP holds. Three: Singleton everywhere — inject a single instance instead. Bonus: don’t invent interfaces or Abstract Factories without a second variant or boundary. Interviewers reward the correction and the trade-off talk.',
      },
    ],
    keyTakeaways: [
      'Contracts and lifecycles beat buzzwords.',
      'Binding + LSP are favorite trick topics.',
      'Correcting yourself with a better design is a positive signal.',
    ],
  },
)

export const d5rapid: StudyPage = createPage(
  'd5-rapid',
  'Rapid Fire — 20 Questions',
  12,
  [
    'Answer 20 high-yield OOP/LLD questions under time pressure',
    'Use model-answer hints to self-score',
  ],
  {
    sections: [
      section('instructions', 'How to use', [
        p(
          'Speak answers in 20–40 seconds each. Then reveal the hint. Score yourself 0/1/2 (miss / partial / strong). Target ≥ 30/40 before mock LLD.',
        ),
      ]),
      section('q1_10', 'Questions 1–10', [
        ol([
          'Class vs object?',
          'Encapsulation in one example?',
          'Abstract class vs interface?',
          'Overload vs override?',
          'What is dynamic dispatch?',
          'Association vs composition?',
          'Coupling vs cohesion?',
          'Why private constructor?',
          'SRP meaning?',
          'OCP meaning?',
        ]),
        h3('Hints 1–10'),
        ul([
          '1: Blueprint vs instance with identity/state.',
          '2: BankAccount deposit/withdraw guards balance.',
          '3: Interface = capability; abstract = shared state/template.',
          '4: Overload compile-time signatures; override runtime.',
          '5: Instance method chosen by runtime type.',
          '6: Composition owns lifecycle of parts.',
          '7: Coupling = interdependence; cohesion = focus.',
          '8: Control creation (factory/singleton/utility).',
          '9: One reason to change.',
          '10: Open to extension, closed to modification churn.',
        ]),
      ]),
      section('q11_20', 'Questions 11–20', [
        ol([
          'LSP in one sentence?',
          'ISP example?',
          'DIP and testing?',
          'Why composition over inheritance?',
          'Singleton drawback?',
          'Factory benefit?',
          'Abstract Factory vs Factory Method?',
          'Builder when?',
          'Strategy vs Observer?',
          'Adapter vs Decorator?',
        ]),
        h3('Hints 11–20'),
        ul([
          '11: Subtypes must honor base contracts/substitutability.',
          '12: Split print/scan so SimplePrinter isn’t forced to fax.',
          '13: Inject interfaces; tests supply fakes — no I/O.',
          '14: Reuse without leaking parent API / fragile base.',
          '15: Global hidden deps; hard to test/reset.',
          '16: Hide construction; return abstractions; OCP.',
          '17: Family of products vs one product deferred.',
          '18: Many optional params; immutable validated build.',
          '19: Strategy swaps algorithms; Observer notifies many.',
          '20: Adapter translates interface; Decorator keeps & enhances.',
        ]),
      ]),
      section('stretch', 'Stretch prompts', [
        p(
          'If you finish early: design checkout in 5 minutes naming interfaces, one pattern, and two tests you’d write.',
        ),
        callout(
          'info',
          'Put all 20 stems into interviewQuestions arrays below for app flashcards.',
          'App note',
        ),
      ]),
    ],
    commonMistakes: [
      'Essay answers — keep them tight.',
      'Skipping the testing angle on DIP/Strategy.',
      'Swapping Adapter/Decorator under speed pressure.',
    ],
    interviewQuestions: [
      'Class vs object?',
      'Encapsulation in one example?',
      'Abstract class vs interface?',
      'Overload vs override?',
      'What is dynamic dispatch?',
      'Association vs composition?',
      'Coupling vs cohesion?',
    ],
    intermediateInterviewQuestions: [
      'Why private constructor?',
      'SRP meaning?',
      'OCP meaning?',
      'LSP in one sentence?',
      'ISP example?',
      'DIP and testing?',
      'Why composition over inheritance?',
    ],
    advancedInterviewQuestions: [
      'Singleton drawback?',
      'Factory benefit?',
      'Abstract Factory vs Factory Method?',
      'Builder when?',
      'Strategy vs Observer?',
      'Adapter vs Decorator?',
    ],
    interviewReadyAnswers: [
      {
        question: 'DIP and testing? (rapid)',
        answer:
          'High-level code depends on interfaces injected in the constructor. Tests pass fakes that record calls or return canned results. I verify business rules without DB/network. That’s why DIP isn’t academic — it’s how unit tests stay fast and reliable.',
      },
      {
        question: 'Adapter vs Decorator? (rapid)',
        answer:
          'Adapter makes incompatible interfaces work together by translating calls. Decorator implements the same interface as the wrappee and adds behavior like buffering, encryption, or retries. Same wrapper shape, different intent.',
      },
    ],
    keyTakeaways: [
      'Speed + precision: definitions tied to examples.',
      'Know binding, LSP, and Adapter/Decorator cold.',
      'Always be ready for the testing follow-up.',
    ],
  },
)

export const revisionPages: StudyPage[] = [d5rev, d5traps, d5rapid]
