import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from '../helpers'

/** Day 1 module checkpoints — 8 questions each (3 easy / 3 medium / 2 hard). */
export const day1ModuleQuizzes: Record<string, QuizQuestion[]> = {
  // ===== d1-m1 DBMS Foundations =====
  'd1-m1': [
    q({
      id: 'd1-m1-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['DBMS Architecture'],
      learningObjective: 'Name the core services a DBMS provides over raw files',
      question:
        'Compared with updating shared CSV files from many app servers, which DBMS responsibility most directly prevents lost updates and torn writes?',
      options: [
        'Pretty-printing result sets',
        'Concurrency control and crash recovery',
        'Compiling application source to native code',
        'Generating UI forms from schema',
      ],
      correctAnswer: 1,
      explanation:
        'Multiple writers race on shared files and crashes leave partial updates. A DBMS coordinates concurrent access and recovers from failures so shared data stays consistent and durable.',
      whyWrong: {
        '0': 'Formatting does not protect shared mutable data.',
        '2': 'Compilation is unrelated to multi-writer integrity.',
        '3': 'UI generation does not solve concurrent write correctness.',
      },
      interviewTakeaway:
        'Lead with concurrency + recovery + integrity when defining a DBMS.',
    }),
    tf({
      id: 'd1-m1-q02',
      difficulty: 'easy',
      topics: ['Relational Model'],
      learningObjective: 'Distinguish SQL tables from mathematical relations',
      question:
        'True or False: In standard SQL, a table may contain two identical rows unless a uniqueness constraint forbids it.',
      correct: true,
      explanation:
        'SQL tables are bags (multisets). Pure relational theory uses sets. Without PRIMARY KEY/UNIQUE, duplicates are allowed.',
      whyWrong: {
        '1': 'False would ignore bag semantics — a common interview nuance.',
      },
      interviewTakeaway: 'Call out bag vs set when comparing SQL tables to relations.',
    }),
    q({
      id: 'd1-m1-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Keys'],
      learningObjective: 'Define candidate key versus super key',
      question:
        'Attribute set K uniquely identifies every tuple, and no proper subset of K still does. What is K?',
      options: ['Super key only', 'Candidate key', 'Foreign key', 'Alternate key only'],
      correctAnswer: 1,
      explanation:
        'A candidate key is a minimal super key. Super keys may contain extras; candidate keys are minimal.',
      whyWrong: {
        '0': 'Super keys need not be minimal.',
        '2': 'Foreign keys reference another relation’s key.',
        '3': 'Alternate key means a candidate not chosen as primary — K itself is a candidate.',
      },
      interviewTakeaway: 'Candidate key = minimal unique identifier.',
    }),
    q({
      id: 'd1-m1-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Keys', 'Constraints'],
      learningObjective: 'Relate primary, candidate, and foreign keys',
      question:
        'A schema has candidate keys {A} and {B,C}. The designer chooses A as PRIMARY KEY. Which statement is correct?',
      options: [
        '{B,C} is no longer a candidate key',
        '{B,C} remains a candidate; it is an alternate key',
        'Foreign keys may only reference {B,C}',
        'A cannot be a candidate key if {B,C} exists',
      ],
      correctAnswer: 1,
      explanation:
        'Choosing a primary key does not remove other candidates. Unchosen candidates are alternate keys and may still be UNIQUE.',
      whyWrong: {
        '0': 'Primary-key choice does not revoke candidacy.',
        '2': 'FK targets are typically primary/unique keys; both candidates can qualify if UNIQUE.',
        '3': 'Multiple candidate keys are common and valid.',
      },
      interviewTakeaway: 'Primary is chosen among candidates; alternates remain unique identifiers.',
    }),
    q({
      id: 'd1-m1-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Functional Dependencies'],
      learningObjective: 'Apply Armstrong axioms / closure intuition',
      question:
        'Given FDs A → B and B → C on relation R(A,B,C), which FD must hold?',
      options: ['C → A', 'A → C', 'C → B', 'B → A'],
      correctAnswer: 1,
      explanation:
        'By transitivity, A → B and B → C imply A → C. The reverse directions are not forced.',
      whyWrong: {
        '0': 'C → A is not implied; dependency is one-directional.',
        '2': 'C → B is not implied by B → C.',
        '3': 'B → A is not implied by A → B.',
      },
      interviewTakeaway: 'Use attribute closure / transitivity; never assume FDs reverse.',
    }),
    tf({
      id: 'd1-m1-q06',
      difficulty: 'medium',
      topics: ['Schemas', 'Integrity'],
      learningObjective: 'Separate schema from instance',
      question:
        'True or False: The relational schema describes structure and constraints; the instance is the set of tuples present at a point in time.',
      correct: true,
      explanation:
        'Schema (intension) is design-time structure; instance (extension) is the current data. Queries run against instances under schema rules.',
      whyWrong: {
        '1': 'False collapses a standard distinction interviewers expect.',
      },
      interviewTakeaway: 'Schema vs instance is a crisp one-liner — use it.',
    }),
    q({
      id: 'd1-m1-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Functional Dependencies', 'Keys'],
      learningObjective: 'Find a candidate key from a set of FDs',
      question:
        'R(A,B,C,D) with FDs {A → B, B → C, D → A}. Which is a candidate key?',
      options: ['{A}', '{B,C}', '{D}', '{B,D}'],
      correctAnswer: 2,
      explanation:
        'Closure of D: D → A → B → C, so D+ = {A,B,C,D}. {A}+ misses D. {B,C}+ misses A and D. {B,D} works but is not minimal since {D} alone is a key.',
      whyWrong: {
        '0': 'A does not determine D.',
        '1': '{B,C} does not determine A or D.',
        '3': '{B,D} is a super key but not minimal — {D} suffices.',
      },
      interviewTakeaway: 'Compute closures; prefer minimal keys when asked for candidates.',
    }),
    q({
      id: 'd1-m1-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['DBMS Architecture'],
      learningObjective: 'Place query planner, executor, and storage roles',
      question:
        'A SELECT with a filter is slow. Which layer is primarily responsible for choosing between an index scan and a sequential scan?',
      options: [
        'Network socket layer of the client driver',
        'Query optimizer / planner',
        'Operating system page cache only',
        'Application ORM string builder only',
      ],
      correctAnswer: 1,
      explanation:
        'The optimizer estimates costs and picks an access path. Storage/OS still read pages, but plan choice is the planner’s job.',
      whyWrong: {
        '0': 'Drivers ferry bytes; they do not pick engine access paths.',
        '2': 'The OS caches pages but does not choose SQL plans.',
        '3': 'ORMs emit SQL; the engine still plans and executes.',
      },
      interviewTakeaway: 'Blame/praise the optimizer for access-path choice; then talk stats and indexes.',
    }),
  ],

  // ===== d1-m2 Normalization =====
  'd1-m2': [
    q({
      id: 'd1-m2-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Normalization'],
      learningObjective: 'Recognize update anomalies from redundancy',
      question:
        'course_name is stored on every enrollment row. Renaming a course requires many updates; some rows are missed. What anomaly is this?',
      options: ['Insertion anomaly', 'Deletion anomaly', 'Update anomaly', 'Phantom anomaly'],
      correctAnswer: 2,
      explanation:
        'The same fact is stored redundantly; partial updates cause inconsistency — a classic update anomaly.',
      whyWrong: {
        '0': 'Insertion anomaly is inability to insert without unrelated data.',
        '1': 'Deletion anomaly loses a fact when deleting the last row that held it.',
        '3': 'Phantoms are concurrency isolation phenomena, not design anomalies.',
      },
      interviewTakeaway: 'Redundant facts ⇒ update anomalies; normalize or manage denormalization deliberately.',
    }),
    tf({
      id: 'd1-m2-q02',
      difficulty: 'easy',
      topics: ['Normalization', '1NF'],
      learningObjective: 'State the 1NF requirement',
      question:
        'True or False: First normal form requires that each attribute hold atomic (indivisible) values — no repeating groups as nested tables in a cell.',
      correct: true,
      explanation:
        '1NF means a proper relation: atomic attribute values and a primary key. Nested multi-valued cells violate 1NF in the classic teaching model.',
      whyWrong: {
        '1': 'False would redefine 1NF incorrectly.',
      },
      interviewTakeaway: 'Start normalization answers with “atomic attributes / no repeating groups.”',
    }),
    q({
      id: 'd1-m2-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Normalization', '2NF'],
      learningObjective: 'Identify a partial dependency violating 2NF',
      question:
        'R has key {StudentId, CourseId}. Non-key attribute StudentName depends only on StudentId. Which normal form is violated?',
      options: ['1NF only', '2NF', '4NF only', 'DKNF'],
      correctAnswer: 1,
      explanation:
        '2NF forbids partial dependency of a non-prime attribute on part of a composite key. StudentName depends on StudentId alone.',
      whyWrong: {
        '0': 'The schema can still be in 1NF while violating 2NF.',
        '2': '4NF concerns multi-valued dependencies, not this FD pattern.',
        '3': 'DKNF is a rarer, stronger notion — not the diagnosis here.',
      },
      interviewTakeaway: '2NF = no partial dependency of non-keys on a composite key.',
    }),
    q({
      id: 'd1-m2-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Normalization', '3NF'],
      learningObjective: 'Spot a transitive dependency violating 3NF',
      question:
        'Key is EmpId. EmpId → DeptId and DeptId → DeptName. DeptName is non-prime. Which NF is violated?',
      options: ['1NF', '2NF', '3NF', 'None — this is already BCNF'],
      correctAnswer: 2,
      explanation:
        'DeptName depends transitively on EmpId via DeptId. 3NF forbids non-prime attributes transitively dependent on a candidate key (with the usual 3NF exceptions not applying here).',
      whyWrong: {
        '0': 'Atomicity is not the issue described.',
        '1': 'The key is single-attribute, so partial dependency (2NF) is not the framing.',
        '3': 'BCNF is stronger; this transitive FD already fails 3NF.',
      },
      interviewTakeaway: '3NF targets transitive dependencies of non-keys.',
    }),
    q({
      id: 'd1-m2-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Normalization', 'BCNF'],
      learningObjective: 'Contrast 3NF and BCNF',
      question:
        'Which situation can satisfy 3NF yet violate BCNF?',
      options: [
        'A non-prime attribute determines another non-prime attribute',
        'A candidate key determines all attributes',
        'A determinant of an FD is a proper subset of a candidate key (and not a superkey), with a prime attribute on the right',
        'Every attribute is atomic',
      ],
      correctAnswer: 2,
      explanation:
        'BCNF requires every determinant of a non-trivial FD to be a superkey. 3NF still allows some FDs where the right side is prime even if the left is not a superkey — classic 3NF-but-not-BCNF cases.',
      whyWrong: {
        '0': 'That typically violates 3NF.',
        '1': 'That is expected key behavior, not a BCNF violation.',
        '3': 'Atomicity is 1NF, not the 3NF/BCNF gap.',
      },
      interviewTakeaway: 'BCNF: every determinant is a superkey; 3NF is slightly weaker.',
    }),
    tf({
      id: 'd1-m2-q06',
      difficulty: 'medium',
      topics: ['Denormalization'],
      learningObjective: 'Justify intentional denormalization',
      question:
        'True or False: Production systems sometimes denormalize (e.g., cache aggregated fields) for read performance, accepting controlled redundancy and update complexity.',
      correct: true,
      explanation:
        'Normalization reduces anomalies; denormalization is a deliberate trade for latency/throughput when measured and carefully maintained (triggers, jobs, app logic).',
      whyWrong: {
        '1': 'False treats normalization as absolute — interviewers expect trade-off language.',
      },
      interviewTakeaway: 'Say “normalize by default; denormalize with a measured reason and update plan.”',
    }),
    q({
      id: 'd1-m2-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Normalization', 'Decomposition'],
      learningObjective: 'Require lossless-join decomposition',
      question:
        'Decomposing R(A,B,C) into R1(A,B) and R2(A,C) is lossless under FDs if which condition holds?',
      options: [
        'R1 and R2 share no attributes',
        'The common attributes form a superkey for at least one of R1 or R2',
        'Both relations have the same number of rows as R',
        'C → B always',
      ],
      correctAnswer: 1,
      explanation:
        'For binary decomposition, lossless join holds if the intersection of attributes is a key for one of the projections (Chase / FD test). Sharing nothing would make the join a Cartesian product.',
      whyWrong: {
        '0': 'Empty intersection yields a Cartesian product — lossy.',
        '2': 'Row counts alone do not guarantee lossless reconstruction.',
        '3': 'C → B is unrelated as a general rule.',
      },
      interviewTakeaway: 'Lossless join: shared attributes must be a key of one side.',
    }),
    q({
      id: 'd1-m2-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Normalization', 'Dependency Preservation'],
      learningObjective: 'Explain dependency preservation after decomposition',
      question:
        'A decomposition is dependency-preserving when:',
      options: [
        'Every original FD can be checked by examining only the projected relations (locally), without joining them all back',
        'The database never uses foreign keys',
        'All relations are in 1NF only',
        'Every query becomes an index-only scan',
      ],
      correctAnswer: 0,
      explanation:
        'Dependency preservation means the union of local FDs on the components implies the original FDs, so integrity can be enforced without reconstructing R.',
      whyWrong: {
        '1': 'FKs are orthogonal to the FD preservation definition.',
        '2': 'NF level alone does not define preservation.',
        '3': 'Physical access paths are unrelated.',
      },
      interviewTakeaway: 'Name both goals: lossless join + dependency preservation.',
    }),
  ],

  // ===== d1-m3 SQL =====
  'd1-m3': [
    q({
      id: 'd1-m3-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['SQL', 'NULL'],
      learningObjective: 'Compare NULL correctly',
      question: 'Which predicate finds rows where email is unknown/absent?',
      options: [
        'WHERE email = NULL',
        'WHERE email IS NULL',
        'WHERE email == NULL',
        'WHERE email EQUALS NULL',
      ],
      correctAnswer: 1,
      explanation:
        'Comparisons with NULL yield UNKNOWN. Use IS NULL / IS NOT NULL.',
      whyWrong: {
        '0': '`= NULL` never matches in WHERE.',
        '2': 'Not SQL equality for NULL.',
        '3': 'Not valid SQL.',
      },
      interviewTakeaway: 'NULL uses three-valued logic — never `= NULL`.',
    }),
    q({
      id: 'd1-m3-q02',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['SQL', 'Aggregates'],
      learningObjective: 'Place aggregate filters in HAVING',
      question:
        'You need departments with at least 5 employees. Where does the COUNT(*) condition belong?',
      options: [
        'WHERE COUNT(*) >= 5',
        'HAVING COUNT(*) >= 5 after GROUP BY department_id',
        'ORDER BY COUNT(*) >= 5',
        'FROM COUNT(*) >= 5',
      ],
      correctAnswer: 1,
      explanation:
        'WHERE filters rows before grouping. Aggregate conditions on groups use HAVING.',
      whyWrong: {
        '0': 'Aggregates are not available that way in WHERE.',
        '2': 'ORDER BY sorts; it does not filter groups.',
        '3': 'Invalid syntax/placement.',
      },
      interviewTakeaway: 'WHERE = rows; HAVING = groups.',
    }),
    tf({
      id: 'd1-m3-q03',
      difficulty: 'easy',
      topics: ['SQL', 'Joins'],
      learningObjective: 'State INNER JOIN semantics',
      question:
        'True or False: An INNER JOIN returns only rows that match the join condition in both tables.',
      correct: true,
      explanation:
        'INNER JOIN keeps matching pairs. Non-matching rows from either side are excluded.',
      whyWrong: {
        '1': 'False would confuse INNER with OUTER join behavior.',
      },
      interviewTakeaway: 'INNER = matches only; OUTER preserves unmatched sides.',
    }),
    q({
      id: 'd1-m3-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['SQL', 'Joins'],
      learningObjective: 'Choose LEFT JOIN for unmatched parents',
      question:
        'You need every customer, including those with no orders. Which pattern keeps unmatched customers?',
      options: [
        'INNER JOIN orders',
        'LEFT JOIN orders from customer',
        'CROSS JOIN only',
        'INTERSECT of the two tables',
      ],
      correctAnswer: 1,
      explanation:
        'LEFT (outer) JOIN from customer to orders preserves customers with NULL order columns when no match exists.',
      whyWrong: {
        '0': 'INNER drops customers without orders.',
        '2': 'CROSS JOIN multiplies rows; it does not express optional association.',
        '3': 'INTERSECT returns common rows, not optional children.',
      },
      interviewTakeaway: 'Preserve the “driving” entity with LEFT JOIN when children may be absent.',
    }),
    q({
      id: 'd1-m3-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['SQL', 'Subqueries'],
      learningObjective: 'Contrast correlated vs non-correlated subqueries',
      question:
        'A subquery in WHERE references a column from the outer query. What kind is it?',
      options: [
        'Non-correlated; runs once',
        'Correlated; conceptually re-evaluated per outer row',
        'Always rewritten as a CROSS JOIN',
        'Illegal in standard SQL',
      ],
      correctAnswer: 1,
      explanation:
        'Correlated subqueries depend on outer-row values. Engines may decorrelate/optimize, but the logical model is per-outer-row dependence.',
      whyWrong: {
        '0': 'Non-correlated subqueries do not reference the outer row.',
        '2': 'Rewrite shapes vary; CROSS JOIN is not the definition.',
        '3': 'Correlated subqueries are standard and common.',
      },
      interviewTakeaway: 'Say “correlated = depends on outer row” then mention optimizer decorrelation.',
    }),
    q({
      id: 'd1-m3-q06',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['SQL', 'Views'],
      learningObjective: 'Explain views as stored queries',
      question: 'What is a SQL view primarily?',
      options: [
        'A physical copy of a table that always stays in sync automatically with no cost',
        'A named query (virtual table) stored in the catalog; some systems also support materialized views',
        'A mandatory index on every column',
        'A synonym for a foreign key',
      ],
      correctAnswer: 1,
      explanation:
        'Ordinary views are stored SELECT definitions. Materialized views cache results with refresh rules — call that out separately.',
      whyWrong: {
        '0': 'Ordinary views are not free physical copies; materialization is explicit.',
        '2': 'Views are not indexes.',
        '3': 'Foreign keys are constraints, not views.',
      },
      interviewTakeaway: 'View = named query; mention materialized views when caching matters.',
    }),
    q({
      id: 'd1-m3-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['SQL', 'Aggregates', 'NULL'],
      learningObjective: 'Predict COUNT and SUM behavior with NULL',
      question:
        'Table T has five rows; column x is NULL in two of them. What does COUNT(x) return?',
      options: ['5', '2', '3', 'NULL'],
      correctAnswer: 2,
      explanation:
        'COUNT(expression) ignores NULLs. COUNT(*) counts rows. Here three non-NULL x values ⇒ 3.',
      whyWrong: {
        '0': 'That would be COUNT(*).',
        '1': 'That counts the NULLs, not non-NULLs.',
        '3': 'COUNT returns 0 for empty sets of values, not NULL here.',
      },
      interviewTakeaway: 'COUNT(*) vs COUNT(col) is a classic NULL trap.',
    }),
    q({
      id: 'd1-m3-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['SQL', 'Window Functions'],
      learningObjective: 'Contrast window functions with GROUP BY',
      question:
        'You need each order row plus the customer’s total spend without collapsing rows. Which approach fits best?',
      options: [
        'GROUP BY customer_id alone in the same SELECT list of all order columns without aggregation',
        'SUM(amount) OVER (PARTITION BY customer_id)',
        'DISTINCT ON amount only',
        'CROSS JOIN the table to itself unconditionally',
      ],
      correctAnswer: 1,
      explanation:
        'Window aggregates compute over partitions while preserving detail rows. Bare GROUP BY collapses groups.',
      whyWrong: {
        '0': 'Selecting non-grouped columns with GROUP BY is invalid/non-deterministic in strict SQL.',
        '2': 'DISTINCT ON is vendor-specific and not the general pattern.',
        '3': 'A blind self-join explodes cardinality.',
      },
      interviewTakeaway: 'Windows = analytics without collapsing; GROUP BY = collapse.',
    }),
  ],

  // ===== d1-m4 Indexing & Query Basics =====
  'd1-m4': [
    q({
      id: 'd1-m4-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Indexing'],
      learningObjective: 'State the primary read benefit of an index',
      question: 'What is the main reason a selective B+ tree index speeds equality lookups?',
      options: [
        'It compresses the SQL text',
        'It reduces the number of pages the engine must read',
        'It removes the need for transactions',
        'It always guarantees O(1) like a perfect hash',
      ],
      correctAnswer: 1,
      explanation:
        'Indexes navigate root→leaf in a few page I/Os instead of scanning the whole heap/table when selectivity is good.',
      whyWrong: {
        '0': 'Irrelevant to I/O path choice.',
        '2': 'Indexes do not replace transactions.',
        '3': 'B+ trees are logarithmic; hash indexes are a different structure.',
      },
      interviewTakeaway: 'Indexes trade write/storage cost for fewer selective read I/Os.',
    }),
    tf({
      id: 'd1-m4-q02',
      difficulty: 'easy',
      topics: ['Indexing'],
      learningObjective: 'Understand write amplification from indexes',
      question:
        'True or False: Adding more indexes can slow INSERT/UPDATE/DELETE even when some SELECTs become faster.',
      correct: true,
      explanation:
        'Each write must maintain relevant indexes (and WAL). More indexes ⇒ more write work and storage.',
      whyWrong: {
        '1': 'False ignores write amplification — a standard follow-up.',
      },
      interviewTakeaway: 'Always mention write/storage cost when praising indexes.',
    }),
    q({
      id: 'd1-m4-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Indexing', 'B+ Tree'],
      learningObjective: 'Describe B+ tree leaf linkage',
      question: 'In a B+ tree index, where do all actual key–pointer (or key–row) entries live?',
      options: [
        'Only in the root',
        'In every internal node exclusively',
        'In the leaf level (leaves often linked for range scans)',
        'Only in the OS inode table',
      ],
      correctAnswer: 2,
      explanation:
        'B+ trees keep all records in leaves; internal nodes hold separators. Leaf links support efficient range scans.',
      whyWrong: {
        '0': 'The root is not the only storage of keys.',
        '1': 'Internal nodes guide search; they are not the sole record store.',
        '3': 'Filesystem inodes are unrelated to DB index structure.',
      },
      interviewTakeaway: 'B+ tree: data in leaves + linked leaves for ranges.',
    }),
    q({
      id: 'd1-m4-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Indexing', 'Selectivity'],
      learningObjective: 'Judge when an index helps',
      question:
        'A boolean column isTrue is ~50%/50%. An equality filter on isTrue alone usually:',
      options: [
        'Is an ideal unique index use case',
        'May not benefit much from an index because selectivity is poor',
        'Forces a full table lock in all engines',
        'Makes the column a candidate key automatically',
      ],
      correctAnswer: 1,
      explanation:
        'Low-selectivity predicates often make index scans + random heap fetches worse than a sequential scan. Optimizers use statistics to decide.',
      whyWrong: {
        '0': '50/50 is not unique/highly selective.',
        '2': 'Index use does not imply full-table locking.',
        '3': 'Boolean equality does not create a key.',
      },
      interviewTakeaway: 'Selectivity and clustering matter more than “index every column.”',
    }),
    q({
      id: 'd1-m4-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Indexing', 'Composite Indexes'],
      learningObjective: 'Apply leftmost prefix rule',
      question:
        'Index exists on (last_name, first_name). Which predicate can typically use that index efficiently?',
      options: [
        'WHERE first_name = \'Ada\'',
        'WHERE last_name = \'Lovelace\'',
        'WHERE middle_name = \'X\'',
        'WHERE age = 36',
      ],
      correctAnswer: 1,
      explanation:
        'Composite B-tree indexes support leftmost prefixes. Filtering only on first_name skips the leading column and usually cannot seek that index well.',
      whyWrong: {
        '0': 'Missing leading column — poor/no use of (last, first).',
        '2': 'middle_name is not in the index.',
        '3': 'age is not in the index.',
      },
      interviewTakeaway: 'Order composite columns by query patterns; remember leftmost prefix.',
    }),
    tf({
      id: 'd1-m4-q06',
      difficulty: 'medium',
      topics: ['Transactions Intro'],
      learningObjective: 'State ACID at a high level',
      question:
        'True or False: Atomicity means a transaction’s changes are all committed or all rolled back as a unit.',
      correct: true,
      explanation:
        'Atomicity is all-or-nothing. Consistency, Isolation, and Durability complete ACID with different meanings.',
      whyWrong: {
        '1': 'False would confuse atomicity with durability or isolation.',
      },
      interviewTakeaway: 'Define each ACID letter separately — do not blend them.',
    }),
    q({
      id: 'd1-m4-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Indexing', 'Covering Indexes'],
      learningObjective: 'Explain covering / index-only scans',
      question:
        'A query selects only (a,b) with WHERE a = ?. An index on (a,b) can satisfy it without heap fetches when:',
      options: [
        'The index contains all columns needed (covering) and visibility/MVCC rules allow an index-only path',
        'The table has no primary key',
        'The query uses SELECT *',
        'There are no statistics',
      ],
      correctAnswer: 0,
      explanation:
        'A covering index supplies needed columns. Engines may still consult visibility maps/MVCC metadata, but the idea is avoiding table row lookups.',
      whyWrong: {
        '1': 'PKs are unrelated to covering.',
        '2': 'SELECT * typically needs all columns — rarely covered by a narrow index.',
        '3': 'Missing stats hurt planning; they do not define covering.',
      },
      interviewTakeaway: 'Covering indexes answer queries from the index alone (modulo visibility).',
    }),
    q({
      id: 'd1-m4-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Query Execution'],
      learningObjective: 'Relate EXPLAIN to plan choice',
      question:
        'EXPLAIN (or EXPLAIN ANALYZE) is most useful in interviews to show that you:',
      options: [
        'Rewrite SQL into assembly',
        'Inspect the chosen plan (scans, joins, estimates) and validate with actual timings when available',
        'Disable the buffer pool',
        'Prove the schema is in BCNF',
      ],
      correctAnswer: 1,
      explanation:
        'Plans reveal access paths, join algorithms, and estimate vs reality (ANALYZE). That drives indexing and query rewrite decisions.',
      whyWrong: {
        '0': 'Engines do not expose SQL→assembly that way.',
        '2': 'Unrelated and harmful.',
        '3': 'Normalization is a design property, not what EXPLAIN proves.',
      },
      interviewTakeaway: 'Bring EXPLAIN into performance answers: plan → bottleneck → fix.',
    }),
  ],
}
