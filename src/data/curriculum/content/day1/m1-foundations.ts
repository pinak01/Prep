import type { StudyPage } from '@/types/curriculum'
import {
  callout,
  code,
  createPage,
  diagram,
  example,
  h3,
  numerical,
  ol,
  p,
  section,
  table,
  ul,
} from '../../../helpers'

export const day1Module1Pages: StudyPage[] = [
  createPage(
    'd1-p1',
    'DBMS Architecture',
    12,
    [
      'Explain why applications use a DBMS instead of raw files',
      'Describe three-schema architecture and logical/physical data independence',
      'Name query processor, storage manager, and transaction manager responsibilities',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('A Database Management System (DBMS) is software that stores, retrieves, and manages structured data while enforcing integrity, concurrency control, and durability. Applications talk to the DBMS through a query language (usually SQL) or an API; they do not manage disk pages, indexes, or crash recovery themselves.'),
          h3('Why it exists'),
          p('Without a DBMS, every application would re-implement locking, crash recovery, indexing, access control, and schema evolution. A DBMS centralizes those concerns so many clients can share consistent data safely.'),
          h3('Where it sits'),
          ul([
            'Application / ORM / SQL client — issues queries and transactions',
            'DBMS — parses, plans, executes, caches, locks, logs, recovers',
            'Operating system — files, memory, processes, disk I/O',
            'Hardware — CPU, RAM, SSD/HDD',
          ]),
          diagram(
            `flowchart TB
  App[Application / ORM] --> Q[Query Processor]
  Q --> SM[Storage Manager]
  Q --> TM[Transaction Manager]
  SM --> Buf[Buffer Pool]
  SM --> Idx[Indexes]
  TM --> Lock[Lock / MVCC]
  TM --> Log[WAL / Recovery]
  Buf --> Disk[(Data Files)]
  Log --> Disk`,
            'Major DBMS components an interviewer expects you to name',
          ),
        ]),
        section('three-schema', 'Three-schema architecture', [
          p('ANSI/SPARC describes three levels: external (views for different users), conceptual (logical schema for the whole enterprise), and internal (files, pages, indexes).'),
          table(
            ['Level', 'What it describes', 'Interview point'],
            [
              ['External', 'User/app-specific views', 'Security + simplicity via views'],
              ['Conceptual', 'Tables, keys, constraints', 'Logical design / ER → relational'],
              ['Internal', 'Pages, indexes, files', 'Physical design / performance'],
            ],
          ),
          h3('Data independence'),
          ul([
            'Logical data independence: change conceptual schema (add column, split table) without rewriting all external views/apps — hard in practice, but the goal matters.',
            'Physical data independence: change indexes, clustering, or storage layout without changing SQL result meaning — this is why you can ADD INDEX without changing SELECT semantics.',
          ]),
          callout(
            'tip',
            'If asked “why not just use files?”, answer: concurrency, integrity constraints, query optimization, recovery after crash, and a declarative query language.',
          ),
        ]),
        section('components', 'How it works internally', [
          h3('Query processor'),
          ol([
            'Parse SQL into an AST; check syntax and authorization',
            'Bind names to catalog objects (tables, columns, types)',
            'Rewrite (view expansion, constant folding, predicate pushdown ideas)',
            'Optimize: choose join order, access paths (index vs scan), estimate costs',
            'Execute operators (scan, seek, nest-loop/hash/merge join, aggregate)',
          ]),
          h3('Storage manager'),
          p('Organizes data into files and pages (often 8KB). The buffer pool caches pages in RAM. On a miss: pin a frame, read page from disk, possibly evict another page (clock/LRU variants). Dirty pages are written back asynchronously.'),
          h3('Transaction manager'),
          p('Provides ACID. Uses locking and/or MVCC for isolation, and write-ahead logging (WAL) for durability and crash recovery. Day 2 goes deep here; for Day 1, know these pieces exist and why.'),
          example('Mental model for SELECT', [
            p('SELECT * FROM orders WHERE id = 42'),
            ul([
              'Catalog says orders has a primary-key B+ tree on id',
              'Optimizer chooses index seek → fetch heap/clustered row',
              'Executor touches buffer pool; maybe 1–3 I/Os if cold cache',
              'Result returned to client connection',
            ]),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'DBMS generality costs overhead vs a specialized embedded store — but you gain safety and tooling.',
            'ORMs hide SQL but do not remove the need to understand plans, indexes, and transactions.',
            'In-process SQLite vs client/server Postgres: different process/network models, same architectural ideas.',
          ]),
          callout(
            'mistake',
            'Saying “the database is just a place to store tables” fails follow-ups about buffer pools, WAL, and concurrency.',
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'DBMS + OS: buffer pool interacts with OS page cache; disk I/O and fsync matter for durability.',
            'DBMS + Networks: client connections, pooling, and latency of round trips.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: “A DBMS manages data for applications.”'),
          p('Interviewer: “Why not files?” → concurrency, recovery, declarative queries, integrity.'),
          p('Interviewer: “What happens when you run a query?” → parse → bind → optimize → execute via storage + buffer pool.'),
          p('Interviewer: “What survives a power failure?” → durable WAL + recovered data files; uncommitted work rolled back.'),
        ]),
      ],
      commonMistakes: [
        'Confusing schema (structure) with instance (current data)',
        'Claiming physical indexes change SELECT meaning (they change performance, not result semantics barring bugs/hints)',
        'Ignoring the buffer pool when explaining “why second query is faster”',
      ],
      interviewQuestions: [
        'What is a DBMS and what problems does it solve?',
        'What are the three schema levels?',
        'What is physical data independence?',
        'Name three major DBMS components.',
        'Why do applications usually avoid managing raw data files?',
      ],
      intermediateInterviewQuestions: [
        'Walk through what happens inside the DBMS when you run a SELECT with a WHERE clause.',
        'How does the buffer pool reduce disk I/O?',
        'What is the catalog/data dictionary used for?',
        'Logical vs physical data independence — give an example of each.',
        'Where do ORMs sit in this architecture?',
      ],
      advancedInterviewQuestions: [
        'If RAM is large enough to hold the whole database, does the storage manager become irrelevant? Why/why not?',
        'How might OS page cache and DBMS buffer pool interact or duplicate work?',
        'Why is query optimization NP-hard in join ordering, and how do systems cope?',
        'What fails if the transaction manager is removed but storage remains?',
        'How would you explain DBMS architecture to connect it to “slow query” debugging?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain DBMS architecture in 60 seconds.',
          answer:
            'Apps send SQL to the DBMS. The query processor parses and optimizes; the executor uses the storage manager’s buffer pool and indexes to read/write pages on disk. The transaction manager enforces ACID with locks or MVCC and write-ahead logging. Three-schema design separates user views, logical tables, and physical storage so we can change indexes without rewriting applications. That separation is physical data independence.',
        },
      ],
      keyTakeaways: [
        'DBMS = shared data service with integrity, concurrency, recovery, and a query engine',
        'Remember query processor, storage/buffer pool, transaction/recovery',
        'Physical data independence is why indexes are a performance concern, not a semantic rewrite',
      ],
    },
  ),

  createPage(
    'd1-p2',
    'Relational Model',
    10,
    [
      'Define relation, tuple, attribute, domain, degree, and cardinality',
      'Distinguish schema vs instance and intentional vs extensional data',
      'Explain why the relational model fits OLTP and set-oriented querying',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('The relational model (Codd) represents data as relations: sets of tuples over named attributes with domains. In SQL practice we use tables (bags/multisets unless DISTINCT), rows, and columns — close but not identical to pure math relations.'),
          table(
            ['Term', 'Meaning', 'SQL analogue'],
            [
              ['Relation', 'Set of tuples of the same type', 'Table (approx.)'],
              ['Tuple', 'Ordered values for attributes', 'Row'],
              ['Attribute', 'Named column with a domain', 'Column'],
              ['Domain', 'Allowed value set / type', 'Type + constraints'],
              ['Degree', '# of attributes', '# of columns'],
              ['Cardinality', '# of tuples', '# of rows'],
            ],
          ),
          h3('Schema vs instance'),
          ul([
            'Schema (intension): structure — Employee(id, name, dept_id)',
            'Instance (extension): current rows at a moment in time',
          ]),
          h3('Why it exists'),
          p('It gives a clean algebraic foundation (relational algebra/calculus) for declarative querying, normalization theory, and optimizer rewrites — independent of how data is physically stored.'),
        ]),
        section('how', 'How it works in practice', [
          p('Keys identify tuples. Foreign keys reference other relations. Constraints restrict valid instances. Queries describe what result set you want; the engine chooses how.'),
          code(
            'sql',
            `CREATE TABLE employee (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INT REFERENCES department(id)
);`,
            'Schema defines structure; INSERT creates instance data',
          ),
          callout(
            'info',
            'SQL tables are multisets: two identical rows can exist without a key. Pure relations are sets. Interviewers like this nuance.',
          ),
        ]),
        section('tradeoffs', 'Trade-offs', [
          ul([
            'Rigid schema helps integrity; schema changes need migrations.',
            'Joins model relationships explicitly — powerful, but expensive if unindexed.',
            'Document stores trade join-centric design for flexible nested documents — Day 2 covers that trade-off.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“What is a relation?” → set of tuples over attributes.'),
          p('“Is a SQL table a relation?” → approximately; SQL allows duplicates and NULL.'),
          p('“Why does that matter?” → DISTINCT, GROUP BY, and cardinality estimates behave differently than pure set theory.'),
        ]),
      ],
      commonMistakes: [
        'Using “row/column” only and freezing when asked for relational terms',
        'Confusing cardinality of a relation with cardinality of a relationship in ER (1:N etc.)',
        'Saying NULL is just an empty string',
      ],
      interviewQuestions: [
        'Define relation, tuple, and attribute.',
        'What is a domain?',
        'Schema vs instance?',
        'What is degree vs cardinality of a relation?',
        'Why is the relational model useful?',
      ],
      intermediateInterviewQuestions: [
        'How does SQL differ from the pure relational model?',
        'What does NULL mean in the relational/SQL world?',
        'What is a relational algebra projection vs selection?',
        'Why are keys important in the relational model?',
        'Intentional vs extensional database?',
      ],
      advancedInterviewQuestions: [
        'How do relational algebra equivalences enable query optimization?',
        'Can you have a relation with zero attributes? (edge theory question)',
        'Why did Codd emphasize physical data independence?',
        'How do bag semantics change join cardinality?',
        'When would you denormalize away from clean relational design?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain the relational model briefly.',
          answer:
            'Data is organized as relations—tables of rows—where each column has a domain. The schema describes structure; the instance is the current data. Keys identify rows and relationships are represented by values (foreign keys), not physical links. That lets us query declaratively with relational algebra/SQL while the engine owns storage and access paths.',
        },
      ],
      keyTakeaways: [
        'Relation ≈ typed table; know schema vs instance',
        'SQL ≈ relational model with NULL and duplicates',
        'Declarative queries + keys/constraints are the payoff',
      ],
    },
  ),

  createPage(
    'd1-p3',
    'Keys and Constraints',
    12,
    [
      'Differentiate super, candidate, primary, alternate, and foreign keys',
      'Apply entity, referential, domain, and CHECK constraints',
      'Reason about ON DELETE/UPDATE cascade, restrict, set null',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('A key is a set of attributes that uniquely identifies tuples. Constraints are rules the DBMS enforces so invalid instances never commit.'),
          table(
            ['Key type', 'Definition'],
            [
              ['Super key', 'Any attribute set that uniquely identifies a tuple (may have extras)'],
              ['Candidate key', 'Minimal super key (no proper subset is a super key)'],
              ['Primary key', 'Chosen candidate key for the table'],
              ['Alternate key', 'Candidate key not chosen as primary'],
              ['Foreign key', 'Attributes referencing a candidate/primary key in another (or same) table'],
            ],
          ),
          h3('Why keys exist'),
          p('Without unique identification you cannot reliably update/delete one entity, express relationships, or build indexes that support point lookups.'),
        ]),
        section('constraints', 'Integrity constraints', [
          ul([
            'Entity integrity: primary key attributes must not be NULL (SQL PRIMARY KEY implies NOT NULL + UNIQUE).',
            'Referential integrity: foreign key values must match an existing referenced key or be NULL (if allowed).',
            'Domain constraints: types, CHECKs, NOT NULL.',
            'User-defined: triggers/assertions (less common in interviews than PK/FK/CHECK).',
          ]),
          code(
            'sql',
            `CREATE TABLE enrollment (
  student_id INT NOT NULL,
  course_id  INT NOT NULL,
  grade CHAR(2),
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES course(id)  ON DELETE RESTRICT
);`,
            'Composite primary key + FK actions',
          ),
          h3('FK actions'),
          table(
            ['Action', 'On delete/update of parent'],
            [
              ['RESTRICT/NO ACTION', 'Block if children exist'],
              ['CASCADE', 'Propagate delete/update to children'],
              ['SET NULL', 'Child FK set to NULL (columns must allow NULL)'],
              ['SET DEFAULT', 'Child FK set to default'],
            ],
          ),
        ]),
        section('example', 'Worked reasoning', [
          example('Identify keys', [
            p('Student(id, email, roll_no, name). Assume id, email, roll_no each unique.'),
            ul([
              'Candidate keys: {id}, {email}, {roll_no}',
              'Pick PRIMARY KEY (id); alternates: email, roll_no',
              '{id, name} is a super key but not candidate (not minimal)',
            ]),
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“What is a candidate key?” → minimal unique identifier.'),
          p('“Can a table have multiple?” → yes; one is primary.'),
          p('“Can PK be composite?” → yes, when uniqueness needs multiple columns.'),
          p('“What does ON DELETE CASCADE do?” → deleting parent deletes matching children — dangerous if misunderstood.'),
        ]),
      ],
      commonMistakes: [
        'Calling any unique column “the candidate key” without minimality',
        'Thinking foreign keys must reference primary keys only (must reference a unique/candidate key)',
        'Using CASCADE everywhere without considering accidental mass deletes',
      ],
      interviewQuestions: [
        'Super key vs candidate key?',
        'Primary vs alternate key?',
        'What is a foreign key?',
        'What is entity integrity?',
        'What is referential integrity?',
      ],
      intermediateInterviewQuestions: [
        'Can a foreign key reference a unique non-primary column?',
        'When do you use a composite primary key?',
        'ON DELETE CASCADE vs RESTRICT — when each?',
        'Why disallow NULL in primary key columns?',
        'Surrogate vs natural keys — trade-offs?',
      ],
      advancedInterviewQuestions: [
        'How do deferred constraint checks interact with transactions?',
        'Self-referential FK example (employee.manager_id) — insertion order issues?',
        'Why might UNIQUE NULL columns allow multiple NULLs in SQL?',
        'How do constraints interact with concurrent transactions?',
        'When would you enforce integrity in the app instead of the DB? Risks?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain keys and why they matter.',
          answer:
            'A candidate key is a minimal set of columns that uniquely identifies a row. We pick one as the primary key. Foreign keys reference a unique key in another table to enforce relationships. Together with NOT NULL, UNIQUE, and CHECK, they keep the database instance valid so applications do not rely on hope.',
        },
      ],
      keyTakeaways: [
        'Candidate = minimal unique; primary = chosen candidate',
        'FK enforces referential integrity; know CASCADE vs RESTRICT',
        'Constraints belong in the database for a single source of truth',
      ],
    },
  ),

  createPage(
    'd1-p4',
    'Functional Dependencies',
    14,
    [
      'Define functional dependency and trivial vs non-trivial FDs',
      'Compute attribute closures and apply Armstrong axioms',
      'Find candidate keys from a set of FDs',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('A functional dependency X → Y means that whenever two tuples agree on attributes X, they must agree on attributes Y. X functionally determines Y.'),
          ul([
            'Trivial FD: Y ⊆ X (always true)',
            'Non-trivial: Y is not a subset of X',
            'Completely non-trivial: X ∩ Y = ∅',
          ]),
          h3('Why FDs exist in interviews'),
          p('Normalization is FD theory applied to schema design. Candidate keys are attribute sets whose closure is all attributes.'),
        ]),
        section('armstrong', 'Armstrong axioms & closure', [
          ul([
            'Reflexivity: if Y ⊆ X then X → Y',
            'Augmentation: if X → Y then XZ → YZ',
            'Transitivity: if X → Y and Y → Z then X → Z',
          ]),
          p('Derived rules: union, decomposition, pseudotransitivity. You rarely need to name them; you need closure.'),
          h3('Attribute closure X+'),
          ol([
            'Start with result = X',
            'Repeatedly: if there is FD A → B with A ⊆ result, add B to result',
            'Stop at fixpoint — that is X+',
          ]),
          p('X is a superkey if X+ = all attributes. X is a candidate key if it is a superkey and no proper subset is.'),
        ]),
        section('numericals', 'Worked numericals', [
          numerical({
            title: 'Closure and candidate keys',
            problem:
              'R = (A,B,C,D,E) with FDs: A → BC, CD → E, B → D, E → A. Find all candidate keys.',
            given: 'Attributes ABCDE; FDs as above',
            formula: 'Compute closures of promising attribute sets; minimal superkeys are candidate keys',
            steps: `1) A+ : A → BC ⇒ ABC; B → D ⇒ ABCD; CD → E ⇒ ABCDE. So A+ = ABCDE. A is a superkey.
2) Check subsets of A: only A itself — so A is a candidate key.
3) E → A so E+ includes A+, thus E+ = ABCDE. E is a candidate key.
4) CD: CD → E ⇒ CDE → A ⇒ everything. CD is a candidate key.
5) B alone: B → D ⇒ BD; cannot get A/C/E. Not a key.
6) Other candidates often appear as combinations that determine A or E or CD.
   Check BC: B→D so BCD → E → A → all. Is BC minimal? C alone? C+ = C (nothing). B alone no. So BC is a candidate key.
   Similarly BD? B→D already, BD+ = BD — no.
Common complete set for this classic problem: A, E, BC, CD, and also BE, etc. depending on exhaustive search.
Focus interview method: try single attributes, then pairs that look promising from FD left-hand sides.`,
            answer:
              'Candidate keys include {A}, {E}, {BC}, {CD} (and possibly others like {BE} — verify with closure in the interview). Method matters more than memorizing the set.',
            shortcut:
              'Attributes that never appear on the right-hand side of any FD must be in every key. Here, check RHS = A,B,C,D,E from FDs… all appear on some RHS in this set, so no forced attribute.',
            mistake:
              'Stopping after finding one key (A) and missing that E and CD are also keys via transitivity.',
          }),
          numerical({
            title: 'Is this FD implied?',
            problem: 'FDs: A → B, B → C. Does A → C hold? Does C → A?',
            given: 'Two FDs',
            formula: 'Transitivity; closure',
            steps: `A+ = ABC so A → C holds.
C+ = C only (no FD from C) so C → A does not hold.`,
            answer: 'A → C yes; C → A no',
            shortcut: 'FDs are one-directional unless you have a cycle of dependencies.',
            mistake: 'Assuming dependencies are symmetric like correlation.',
          }),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“What is an FD?” → X → Y means X determines Y.'),
          p('“How do you find keys?” → attributes whose closure is all attributes; then minimize.'),
          p('“Why does this matter?” → 2NF/3NF/BCNF are defined in terms of FDs and keys.'),
        ]),
      ],
      commonMistakes: [
        'Treating FDs as reversible',
        'Forgetting minimality when listing candidate keys',
        'Confusing FD with multivalued dependency (MVD) — advanced topic; do not mix casually',
      ],
      interviewQuestions: [
        'What is a functional dependency?',
        'What is a trivial FD?',
        'What is attribute closure?',
        'How do you test if X is a superkey?',
        'State Armstrong’s three axioms.',
      ],
      intermediateInterviewQuestions: [
        'Given FDs, find all candidate keys (walk through method).',
        'What is a canonical cover / minimal basis? (high level)',
        'Why do we care about FDs for normalization?',
        'Partial dependency vs transitive dependency?',
        'Can Y in X → Y have multiple attributes?',
      ],
      advancedInterviewQuestions: [
        'Compute a candidate key for a schema with 6 attributes under time pressure — narrate heuristics.',
        'What is the difference between FD implication and satisfying an instance?',
        'Why is checking FD implication efficient via closure but enumerating keys exponential?',
        'How do FDs interact with NULL in SQL (theory vs practice)?',
        'Explain lossless-join decomposition using FDs (preview of next module).',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do you find candidate keys from FDs?',
          answer:
            'I compute attribute closures. If X+ equals all attributes, X is a superkey. I then remove attributes one by one; if it remains a superkey after each removal attempt fails for subsets, the minimal sets are candidate keys. I start with attributes that never appear on FD right-hand sides because they must belong to every key.',
        },
      ],
      keyTakeaways: [
        'X → Y: same X ⇒ same Y',
        'Closure algorithm is the workhorse for keys and normalization',
        'Candidate key = minimal superkey',
      ],
    },
  ),
]
