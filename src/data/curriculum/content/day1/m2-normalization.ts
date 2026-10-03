import type { StudyPage } from '@/types/curriculum'
import {
  callout,
  code,
  createPage,
  example,
  h3,
  numerical,
  ol,
  p,
  section,
  table,
  ul,
} from '../../../helpers'

export const day1Module2Pages: StudyPage[] = [
  createPage(
    'd1-p5',
    'Why Normalization?',
    10,
    [
      'Identify insertion, update, and deletion anomalies',
      'State goals of decomposition: remove redundancy, preserve information and dependencies',
      'Contrast intentional denormalization vs accidental redundancy',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('Normalization is a discipline for designing relation schemas so that the same fact is not stored multiple times in conflicting ways. It uses functional dependencies to decompose tables into smaller ones.'),
          h3('Why it exists'),
          p('Redundancy causes anomalies: the database can contradict itself or force awkward NULL inserts.'),
          table(
            ['Anomaly', 'What goes wrong'],
            [
              ['Update', 'Same fact in many rows; update one, forget others → inconsistency'],
              ['Insertion', 'Cannot insert a fact without inventing another unrelated key'],
              ['Deletion', 'Deleting last row that held a fact accidentally deletes that fact'],
            ],
          ),
          example('Classic unnormalized course offering', [
            code(
              'text',
              `StudentCourse(student_id, student_name, course_id, course_name, instructor)
-- course_name repeats for every student in the course
-- instructor tied to course also repeats`,
            ),
            p('Update anomaly: rename course → touch every enrollment row. Deletion anomaly: last student drops → lose course/instructor info if stored only here.'),
          ]),
        ]),
        section('goals', 'Decomposition goals', [
          ul([
            'Remove harmful redundancy (not all repetition is evil — keys repeat by design in FKs)',
            'Lossless-join: join of parts reconstructs the original exactly',
            'Dependency preservation: FDs can still be checked locally on components when possible',
          ]),
          callout(
            'tip',
            'Foreign keys intentionally repeat the parent key value. That is not the redundancy normalization fights; repeating instructor phone on every order line is.',
          ),
        ]),
        section('tradeoffs', 'Trade-offs', [
          p('More joins can mean more I/O at read time. Teams sometimes denormalize read-heavy paths after measuring. That is a conscious trade-off, not an excuse to skip design.'),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“Why normalize?” → avoid anomalies / inconsistent facts.'),
          p('“Can normalized DBs still have duplicate values?” → yes, FK values and legitimate repeated measurements.'),
          p('“Always normalize to BCNF?” → not always; dependency preservation and performance matter.'),
        ]),
      ],
      commonMistakes: [
        'Equating any repeated column value with “must denormalize or must normalize” without FD reasoning',
        'Thinking normalization is about “making more tables” rather than removing bad FDs from a schema',
      ],
      interviewQuestions: [
        'What is normalization?',
        'Name three anomalies with examples.',
        'Why is redundancy dangerous?',
        'What is a lossless-join decomposition?',
        'What is dependency preservation?',
      ],
      intermediateInterviewQuestions: [
        'Can a normalized database still contain duplicate data? Explain.',
        'When is denormalization justified?',
        'How do FDs drive normalization?',
        'What information can be lost in a bad decomposition?',
        'Normalize vs “just use a document” — how do you answer?',
      ],
      advancedInterviewQuestions: [
        'Give an example where BCNF decomposition fails to preserve dependencies.',
        'How does redundancy interact with concurrency anomalies? (preview Day 2)',
        'How would you detect anomalies in an existing production schema?',
        'Is 1NF about atomicity only? Debate with SQL arrays/JSON.',
        'How do materialized views relate to denormalization?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Why does normalization reduce redundancy?',
          answer:
            'When one real-world fact is embedded in many rows, updates must touch all copies. Normalization uses FDs to split schemas so each fact lives in one place, referenced by keys. That removes update/delete/insert anomalies while foreign keys intentionally duplicate only identifiers, not entire payloads.',
        },
      ],
      keyTakeaways: [
        'Anomalies are the concrete pain of bad redundancy',
        'Decompose using FDs with lossless join as a non-negotiable',
        'Denormalize deliberately after you understand the normalized design',
      ],
    },
  ),

  createPage(
    'd1-p6',
    '1NF and 2NF',
    12,
    [
      'Define 1NF and convert repeating groups to atomic attributes',
      'Define 2NF: no partial dependency of non-prime attributes on a composite key',
      'Detect and fix partial dependencies with a worked example',
    ],
    {
      sections: [
        section('1nf', 'First Normal Form (1NF)', [
          p('1NF requires atomic attribute values: no repeating groups or nested tables in a cell. Each intersection of row and column holds a single value from the domain.'),
          example('Unnormalized → 1NF', [
            p('Customer with phones “A, B” in one cell → two rows or a separate Phone table. Multi-valued cells break relational operators and keys.'),
          ]),
          callout(
            'info',
            'SQL JSON/array columns exist; theoretically they can violate classical 1NF. In interviews, state classical 1NF first, then discuss practical JSON trade-offs.',
          ),
        ]),
        section('2nf', 'Second Normal Form (2NF)', [
          p('2NF: relation is in 1NF and every non-prime attribute is fully functionally dependent on every candidate key. Equivalently: no partial dependency of a non-prime attribute on part of a composite candidate key.'),
          ul([
            'Prime attribute: part of some candidate key',
            'Partial dependency: A → B where A is a proper subset of a candidate key and B is non-prime',
          ]),
          callout(
            'tip',
            'If all candidate keys are single-attribute, 1NF already implies 2NF. Partial dependency needs a composite key.',
          ),
        ]),
        section('numerical', 'Worked example', [
          numerical({
            title: 'Fix partial dependency',
            problem:
              'Enrollment(student_id, course_id, student_name, grade). FD: {student_id,course_id}→grade, student_id→student_name. Key is (student_id, course_id). Is it 2NF?',
            given: 'Composite key; student_name depends only on student_id',
            formula: '2NF forbids non-prime attrs depending on proper subset of a candidate key',
            steps: `student_name is non-prime and depends on student_id alone → partial dependency → not 2NF.
Decompose:
Student(student_id, student_name) with student_id → student_name
Enrollment(student_id, course_id, grade) with {student_id,course_id}→grade`,
            answer: 'Not 2NF; split into Student + Enrollment as above (lossless via student_id).',
            shortcut: 'Ask: “Does any column describe only part of the composite key?”',
            mistake: 'Moving grade into Student — grade depends on both student and course.',
          }),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“Define 2NF.” → 1NF + no partial dependency of non-primes on composite keys.'),
          p('“Show an example.” → student_name with enrollment grade table.'),
          p('“How do you fix?” → separate relation for the partial FD left-hand side.'),
        ]),
      ],
      commonMistakes: [
        'Saying 2NF is “no redundancy” vaguely',
        'Applying partial dependency ideas to single-column keys',
        'Forgetting non-prime vs prime distinction',
      ],
      interviewQuestions: [
        'What is 1NF?',
        'What is a partial dependency?',
        'Define 2NF.',
        'When is 1NF automatically 2NF?',
        'Give an example that violates 2NF.',
      ],
      intermediateInterviewQuestions: [
        'Walk through decomposing a 2NF violation.',
        'Prime vs non-prime attributes?',
        'Does 2NF allow transitive dependencies?',
        'How do you verify lossless join after 2NF decomposition?',
        'Multi-valued attribute vs separate table — trade-offs?',
      ],
      advancedInterviewQuestions: [
        'Formal algorithm: synthesize 2NF decomposition from FDs.',
        'Can a relation be in 2NF but still have update anomalies? (yes → 3NF)',
        'How do surrogate keys change partial dependency discussions?',
        '1NF debates with JSONB columns in Postgres — your stance?',
        'Relate 2NF to “one fact per row type” intuition.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain 2NF with an example.',
          answer:
            'A table is in 2NF if it is in 1NF and no non-key column depends on only part of a composite key. In Enrollment(student_id, course_id, student_name, grade), student_name depends only on student_id, so we split Student and Enrollment. Grade stays with the full key because it depends on both.',
        },
      ],
      keyTakeaways: [
        '1NF: atomic cells',
        '2NF: kill partial deps on composite keys',
        'Single-attribute keys ⇒ 2NF comes free after 1NF',
      ],
    },
  ),

  createPage(
    'd1-p7',
    '3NF and BCNF',
    14,
    [
      'Define 3NF and transitive dependencies',
      'Define BCNF and contrast with 3NF',
      'Decide when 3NF is preferred for dependency preservation',
    ],
    {
      sections: [
        section('3nf', 'Third Normal Form (3NF)', [
          p('3NF: for every non-trivial FD X → A, either X is a superkey, or A is prime. Intuition: no transitive dependency of non-prime attributes on a key through another non-prime.'),
          example('Transitive dependency', [
            p('Employee(emp_id, dept_id, dept_name) with emp_id→dept_id and dept_id→dept_name ⇒ emp_id→dept_name transitively. dept_name should live in Department(dept_id, dept_name).'),
          ]),
        ]),
        section('bcnf', 'Boyce–Codd Normal Form (BCNF)', [
          p('BCNF: for every non-trivial FD X → A, X is a superkey. Stricter than 3NF: even prime attributes cannot depend on a non-superkey determinant.'),
          table(
            ['Form', 'Rule of thumb'],
            [
              ['2NF', 'No partial deps of non-primes on composite keys'],
              ['3NF', 'No transitive deps of non-primes; primes get a pass in the formal rule'],
              ['BCNF', 'Every determinant of a non-trivial FD is a superkey'],
            ],
          ),
          callout(
            'warning',
            'BCNF is not always dependency-preserving. Classic interview point: sometimes 3NF is chosen so FDs remain enforceable without joins.',
          ),
        ]),
        section('numerical', 'Worked comparison', [
          numerical({
            title: '3NF but not BCNF',
            problem:
              'R(C, S, Z) with FDs: C,S → Z and Z → C. Candidate keys include {S,Z} and {C,S}. Is R in 3NF? BCNF?',
            given: 'Classic textbook schema (course, student, zip-like Z→C pattern)',
            formula: 'Check each FD against 3NF and BCNF definitions',
            steps: `CS → Z: CS is a superkey → OK for both.
Z → C: Z is not a superkey. For 3NF, C is prime (C is in key CS) → allowed in 3NF.
For BCNF, determinant Z must be superkey → fails BCNF.
Decomposing to BCNF: (Z,C) and (S,Z) — check dependency preservation of CS → Z carefully in discussion.`,
            answer: 'In 3NF, not in BCNF.',
            shortcut: 'If a determinant is not a key but the RHS is part of a key, suspect 3NF≠BCNF.',
            mistake: 'Claiming 3NF and BCNF are identical.',
          }),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“Difference between 3NF and BCNF?” → BCNF requires every determinant to be a superkey; 3NF allows RHS prime exceptions.'),
          p('“Which do you pick?” → prefer BCNF when possible; keep 3NF if decomposition loses dependency preservation and that matters.'),
        ]),
      ],
      commonMistakes: [
        'Memorizing “3NF removes transitive deps” without the formal exception for primes',
        'Saying BCNF always preserves dependencies',
      ],
      interviewQuestions: [
        'Define 3NF.',
        'What is a transitive dependency?',
        'Define BCNF.',
        'Is BCNF stricter than 3NF?',
        'Give an example that is 3NF but not BCNF.',
      ],
      intermediateInterviewQuestions: [
        'Why might we stop at 3NF?',
        'Walk through decomposing to BCNF.',
        'How do you test lossless join for a decomposition into two relations?',
        'What is a determinant?',
        'Does BCNF imply 3NF imply 2NF imply 1NF?',
      ],
      advancedInterviewQuestions: [
        'Prove or explain: BCNF ⇒ 3NF.',
        'Show a decomposition that is BCNF but not dependency-preserving.',
        'How does 4NF relate to multivalued dependencies? (awareness level)',
        'Normalize this schema under time pressure — narrate trade-offs.',
        'How do real ORMs encourage violations of 3NF?',
      ],
      interviewReadyAnswers: [
        {
          question: '3NF vs BCNF?',
          answer:
            'Both remove bad transitive structure. 3NF allows a non-trivial FD X→A if A is part of a candidate key even when X is not a superkey. BCNF forbids that: every non-trivial FD must have a superkey on the left. BCNF is stricter; occasionally we keep 3NF to preserve dependencies.',
        },
      ],
      keyTakeaways: [
        '3NF ≈ no transitive non-prime deps (formal rule allows prime RHS)',
        'BCNF ≈ every determinant is a superkey',
        'Know one 3NF-not-BCNF example',
      ],
    },
  ),

  createPage(
    'd1-p8',
    'Normalization Problems & Denormalization',
    20,
    [
      'Normalize a schema end-to-end from FDs',
      'Work a lossless-join example and sketch dependency preservation',
      'Justify intentional denormalization with costs and follow-ups',
      'Place historical price facts on order lines correctly',
    ],
    {
      sections: [
        section('algorithm', 'Practical normalization workflow', [
          ol([
            'List attributes and FDs (from business rules)',
            'Find candidate keys via closures',
            'Check 1NF → 2NF → 3NF → BCNF; decompose violating FDs',
            'Verify lossless join; check dependency preservation',
            'Map to SQL tables + foreign keys',
          ]),
          h3('Lossless join test (two-way)'),
          p(
            'Decomposing R into R1 and R2 is lossless if (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2 — i.e., the common attributes form a superkey for at least one side. Why: then joining cannot invent spurious tuples; each R1 row matches at most one “completion” on the key side.',
          ),
          h3('Dependency preservation (sketch)'),
          p(
            'A decomposition preserves dependencies if you can check every FD using only the local relations (without joining everything back). Lossless is mandatory for correctness of the data; dependency preservation is desirable so the DBMS can enforce FDs with local constraints. BCNF decompositions are always lossless (with the usual algorithm) but may sacrifice dependency preservation — that is the classic BCNF vs 3NF trade-off.',
          ),
        ]),
        section('example', 'Worked — Lossless Join', [
          example('R = CourseSection attributes', [
            p(
              'Let R(C, T, H, R, S, G) with meaning Course, Teacher, Hour, Room, Student, Grade. Suppose FDs include: C→T (each course has one teacher), HS→R (a student at an hour is in one room), HR→C, etc. Focus on a binary split for the test.',
            ),
          ]),
          numerical({
            title: 'Numerical — Lossless or lossy?',
            problem:
              'R(A,B,C) with FDs {A→B, B→C}. Decompose into R1(A,B) and R2(B,C). Is it lossless? Is it dependency preserving?',
            given: 'R1∩R2 = {B}; FDs A→B, B→C.',
            formula: 'Lossless iff (R1∩R2) → R1 or (R1∩R2) → R2. Preserve if each FD lives in some Ri (or follows from local FDs).',
            steps:
              'Intersection is B. Does B→AB? No (B↛A). Does B→BC? Yes — B→C so B→BC.\n⇒ (R1∩R2) → R2 ⇒ lossless.\nA→B is inside R1; B→C inside R2 ⇒ dependency preserving.\n(Also note R was not BCNF/3NF-friendly originally because A→C transitive via B — this split is the classic 3NF-style decomposition.)',
            answer: 'Lossless and dependency preserving.',
            shortcut: 'If the shared attributes are a key for either side, join is lossless.',
            mistake: 'Checking only “we split on an FD” without testing the intersection→side rule.',
          }),
          numerical({
            title: 'Numerical — Lossy trap',
            problem:
              'R(A,B,C) with only FD A→B. Split into R1(A,B) and R2(A,C). Wait — try R1(A,B) and R2(B,C) instead. Lossless?',
            given: 'Only A→B; decompose to (A,B) and (B,C).',
            formula: 'Test intersection B against keys of either side.',
            steps:
              'R1∩R2={B}. B→AB? No. B→BC? No given FD says so.\nNeither side keyed by B ⇒ lossy.\nSpurious tuples: joining on B can pair unrelated A and C that never co-occurred.',
            answer: 'Lossy — reject this decomposition.',
            shortcut: 'No FD giving B → one side ⇒ danger.',
            mistake: 'Assuming any split that “looks normalized” is lossless.',
          }),
          callout(
            'tip',
            'Whiteboard habit: write R1∩R2, then ask “is this a superkey of R1 or R2?” Circle yes/no before moving on.',
            'Exam habit',
          ),
        ]),
        section('denorm', 'Denormalization — When & Follow-ups', [
          p(
            'Store derived or duplicated data to reduce joins / speed reads. Costs: storage, update complexity, risk of inconsistency. Patterns: cache columns, summary tables, materialized views, CQRS read models.',
          ),
          h3('Price on order_line — historical fact'),
          p(
            'Products.price changes over time. Order line items must store unit_price (and often currency/tax) at purchase time as a historical fact. That is not “bad denormalization of product” — the business event captured a point-in-time value. Joining products.price later would rewrite history when catalog prices change. Normalize the catalog; snapshot price onto the line.',
          ),
          code(
            'sql',
            `-- Catalog (current truth)
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INT NOT NULL  -- changes over time
);

-- Order line stores historical price at purchase
CREATE TABLE order_lines (
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL REFERENCES products(id),
  qty INT NOT NULL,
  unit_price_cents INT NOT NULL, -- snapshot: do NOT rely on products.price later
  PRIMARY KEY (order_id, product_id)
);`,
            'Historical fact vs current catalog price',
          ),
          example('Denorm follow-up chain (say it aloud)', [
            ul([
              'Why denorm? → Measured join/p99 cost on a hot read path',
              'What is duplicated? → Name the columns/aggregates explicitly',
              'Who updates it? → Same txn as source, trigger, or async job',
              'What if async lags? → Stale read policy / repair job',
              'How do you detect drift? → Checksums, periodic reconcilers, metrics',
              'Can a materialized view replace hand-rolled cache columns?',
            ]),
          ]),
          callout(
            'tip',
            'Interview phrasing: “We denormalize after measuring join cost, with a clear update path or async refresh — and we snapshot historical facts like order-line price by design.”',
          ),
        ]),
        section('tradeoffs', 'TRADE-OFFS & EDGE CASES', [
          ul([
            'Lossless join is non-negotiable; dependency preservation is the usual sacrifice when chasing BCNF',
            'Over-normalization → excessive joins, harder transactional updates across many tables',
            'Under-normalization → update/delete/insert anomalies from Day 1 NF pages',
            'Star/snowflake warehouse schemas are intentional denormalization for analytics',
            'Indexes are not denormalization; they are engine-maintained access paths',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Normalized OLTP + denormalized read models (CQRS) appears in system design.',
            'Historical snapshots (order_line price) connect to auditing and immutable event thinking.',
            'FKs + UNIQUE constraints are how SQL approximates preserved FDs locally.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Why? → “Why test lossless?” → Lossy joins invent fake facts — silent data corruption.'),
          p('How? → “How do you test binary lossless?” → If R1∩R2 is a superkey of R1 or R2, it is lossless.'),
          p('DS? → “How do you find keys?” → Attribute closure under FDs until you cover R.'),
          p('Tradeoff? → “3NF vs BCNF?” → BCNF removes more anomalies; may lose dependency preservation.'),
          p('Always? → “Always fully normalize?” → No — denorm for measured reads; snapshot historical facts always.'),
          p('Price follow-up: “Where does unit price live?” → On order_line as history; products.price is current catalog.'),
          p('Denorm follow-up: “How do you stay consistent?” → Same txn, trigger, or async + monitor drift.'),
        ]),
      ],
      commonMistakes: [
        'Decomposing without checking lossless join',
        'Calling every extra table “more normalized” even when FDs do not require it',
        'Treating order-line price snapshots as a normalization mistake',
        'Assuming BCNF always preserves all FDs locally',
        'Denormalizing “for performance” with no update/consistency story',
      ],
      interviewQuestions: [
        'Steps to normalize a schema?',
        'State the binary lossless-join test.',
        'What is denormalization?',
        'Give a valid reason to denormalize.',
        'What is the cost of denormalization?',
        'Where should purchased unit price be stored?',
      ],
      intermediateInterviewQuestions: [
        'Normalize a given FD set to 3NF on a whiteboard.',
        'Dependency preservation vs lossless join — which is mandatory?',
        'Materialized view vs denormalized table?',
        'How do you keep denormalized data consistent?',
        'When does over-normalization hurt?',
        'Show a lossy decomposition and a spurious tuple story.',
      ],
      advancedInterviewQuestions: [
        'Synthesize a 3NF schema using the Bernstein algorithm (awareness).',
        'Design: orders with line items and product price history — where do prices live?',
        'How do unique constraints replace some FDs in SQL?',
        'Explain a production bug caused by denormalized inconsistency.',
        'Relate star schemas (warehousing) to denormalization.',
        'Give FDs where BCNF decomposition fails to preserve a dependency.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do you approach a normalization problem in an interview?',
          answer:
            'I write attributes and FDs from the story, find keys with closures, then remove partial and transitive dependencies by splitting tables. I check that joins of the parts reconstruct the original (lossless: intersection is a superkey of one side) and mention if we lost the ability to check some FD locally (dependency preservation). Finally I say when I would denormalize for measured read performance with a consistency strategy — and I store historical facts like order-line unit price as snapshots, not live catalog joins.',
        },
        {
          question: 'Explain lossless join with a quick example.',
          answer:
            'For a binary split, compute R1∩R2. If those attributes functionally determine all of R1 or all of R2, the join cannot invent spurious rows. Example: R(A,B,C) with A→B and B→C split into (A,B) and (B,C) is lossless because B→BC. Splitting into (A,B) and (B,C) when you only have A→B (no B→C) is lossy — joining on B can pair unrelated A and C.',
        },
        {
          question: 'Should product price be only in the products table?',
          answer:
            'Current catalog price lives on products. The price charged on an order must live on order_lines (unit_price at purchase) because it is a historical fact. If you always join products.price later, past invoices silently change when the catalog updates. That snapshot is intentional and correct, not accidental denormalization.',
        },
      ],
      keyTakeaways: [
        'Method: FDs → keys → NF checks → lossless verify',
        'Lossless join is mandatory; dependency preservation is desirable',
        'Denormalize with eyes open and an update story',
        'Order-line price is historical fact — snapshot it',
      ],
    },
  ),
]
