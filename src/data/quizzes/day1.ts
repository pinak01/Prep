import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from './helpers'

/** Day 1 — DBMS + SQL + normalization + indexes (30 questions) */
export const day1Questions: QuizQuestion[] = [
  // ===== EASY (10) =====
  q({
    id: 'd1-q01',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['DBMS Architecture'],
    learningObjective: 'Identify what a DBMS provides beyond raw file storage',
    question:
      'An engineer proposes storing customer orders as plain CSV files updated by multiple app servers. Which DBMS responsibility most directly addresses the biggest correctness risk?',
    options: [
      'Pretty-printing query results',
      'Concurrency control and crash recovery for shared consistent data',
      'Compiling the application to native code',
      'Replacing SQL with a GUI form designer',
    ],
    correctAnswer: 1,
    explanation:
      'Multiple writers on shared files race and can corrupt data; a crash mid-write leaves partial updates. A DBMS provides locking/MVCC and WAL/recovery so concurrent clients share consistent durable data.',
    whyWrong: {
      '0': 'Formatting is cosmetic, not the core risk.',
      '2': 'Compilation is unrelated to multi-writer data integrity.',
      '3': 'UI tooling does not solve concurrent shared-state correctness.',
    },
    interviewTakeaway:
      'Say “concurrency + recovery + integrity,” not just “databases store tables.”',
  }),
  tf({
    id: 'd1-q02',
    difficulty: 'easy',
    topics: ['Relational Model'],
    learningObjective: 'Distinguish SQL tables from pure relations',
    question:
      'True or False: In standard SQL, a table is allowed to contain two identical rows unless a uniqueness constraint prevents it.',
    correct: true,
    explanation:
      'SQL tables are multisets (bags). Pure relational theory uses sets. Without PRIMARY KEY/UNIQUE, duplicates are allowed.',
    whyWrong: {
      '1': 'False would ignore bag semantics — a common interview nuance.',
    },
    interviewTakeaway: 'Mention bag vs set when defining “relation” vs “SQL table.”',
  }),
  q({
    id: 'd1-q03',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Keys'],
    learningObjective: 'Define candidate key vs super key',
    question:
      'Attribute set K uniquely identifies every row, and no proper subset of K still uniquely identifies rows. What is K?',
    options: ['Super key only', 'Candidate key', 'Foreign key', 'Alternate key only'],
    correctAnswer: 1,
    explanation:
      'A candidate key is a minimal super key. Super keys may include extra attributes; candidate keys do not.',
    whyWrong: {
      '0': 'Super keys need not be minimal.',
      '2': 'Foreign keys reference another relation’s key.',
      '3': 'Alternate key = candidate not chosen as primary — K itself is a candidate.',
    },
    interviewTakeaway: 'Candidate = minimal unique identifier.',
  }),
  q({
    id: 'd1-q04',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['SQL'],
    learningObjective: 'Handle NULL comparisons correctly',
    question: 'Which predicate correctly finds rows where email is unknown/absent?',
    options: [
      'WHERE email = NULL',
      'WHERE email IS NULL',
      'WHERE email == NULL',
      'WHERE email EQUALS NULL',
    ],
    correctAnswer: 1,
    explanation:
      'Comparisons with NULL yield UNKNOWN, not TRUE. Use IS NULL / IS NOT NULL.',
    whyWrong: {
      '0': '`= NULL` never matches in WHERE.',
      '2': 'Not SQL equality syntax for NULL.',
      '3': 'Not valid SQL.',
    },
    interviewTakeaway: 'NULL uses three-valued logic — never `= NULL`.',
  }),
  q({
    id: 'd1-q05',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['SQL', 'Aggregates'],
    learningObjective: 'Distinguish WHERE vs HAVING',
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
      'WHERE filters rows before grouping. Aggregates over groups are filtered with HAVING.',
    whyWrong: {
      '0': 'Aggregates are not available in WHERE for that group.',
      '2': 'ORDER BY sorts; it does not filter groups.',
      '3': 'Invalid.',
    },
    interviewTakeaway: 'WHERE = rows; HAVING = groups.',
  }),
  q({
    id: 'd1-q06',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Normalization'],
    learningObjective: 'Recognize update anomalies',
    question:
      'A table stores course_name on every enrollment row. Renaming a course requires updating many rows and some were missed. What anomaly is this?',
    options: ['Insertion anomaly', 'Deletion anomaly', 'Update anomaly', 'Join anomaly'],
    correctAnswer: 2,
    explanation:
      'The same fact is stored redundantly; partial updates cause inconsistency — classic update anomaly.',
    whyWrong: {
      '0': 'Insertion anomaly is inability to insert without unrelated data.',
      '1': 'Deletion anomaly loses a fact when deleting the last row that held it.',
      '3': 'Not a standard anomaly name in this sense.',
    },
    interviewTakeaway: 'Redundant facts ⇒ update anomalies; normalize or manage denormalization carefully.',
  }),
  q({
    id: 'd1-q07',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Indexing'],
    learningObjective: 'State the primary read benefit of an index',
    question: 'What is the main reason a selective B+ tree index speeds equality lookups?',
    options: [
      'It compresses the SQL text',
      'It reduces the number of pages the engine must read',
      'It removes the need for transactions',
      'It guarantees O(1) time like a perfect hash always',
    ],
    correctAnswer: 1,
    explanation:
      'Indexes navigate from root to leaf in a few page I/Os instead of scanning the whole table, when selectivity is good.',
    whyWrong: {
      '0': 'Irrelevant.',
      '2': 'Indexes do not replace transactions.',
      '3': 'B+ trees are logarithmic in height; hash indexes are different and not always used.',
    },
    interviewTakeaway: 'Indexes trade write cost for fewer read I/Os on selective predicates.',
  }),
  tf({
    id: 'd1-q08',
    difficulty: 'easy',
    topics: ['Indexing'],
    learningObjective: 'Understand write amplification from indexes',
    question:
      'True or False: Adding more indexes can slow down INSERT/UPDATE/DELETE even if SELECT becomes faster.',
    correct: true,
    explanation:
      'Each write must maintain every relevant index (plus WAL). More indexes ⇒ more write work.',
    whyWrong: {
      '1': 'False ignores write amplification — a classic follow-up.',
    },
    interviewTakeaway: 'Always mention write/storage cost when praising indexes.',
  }),
  q({
    id: 'd1-q09',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['SQL', 'Joins'],
    learningObjective: 'Differentiate INNER vs LEFT JOIN',
    question:
      'You need every customer, including those with no orders. Which join keeps unmatched customers?',
    options: ['INNER JOIN orders', 'LEFT JOIN orders from customer', 'CROSS JOIN only', 'RIGHT JOIN customer from orders with no unmatched left'],
    correctAnswer: 1,
    explanation:
      'LEFT JOIN from customer to orders preserves all customers; non-matches get NULL order columns.',
    whyWrong: {
      '0': 'INNER drops customers without orders.',
      '2': 'CROSS is a product, not the intended outer semantics.',
      '3': 'Wording is confused; start from customer with LEFT JOIN.',
    },
    interviewTakeaway: 'Outer join side = the side you refuse to drop.',
  }),
  q({
    id: 'd1-q10',
    type: 'truefalse',
    difficulty: 'easy',
    topics: ['Transactions'],
    learningObjective: 'Recall atomicity intent',
    question:
      'True or False: Atomicity means that after a crash, committed transactions’ effects remain durable on stable storage.',
    options: ['True', 'False'],
    correctAnswer: 1,
    explanation:
      'That statement describes Durability (with WAL). Atomicity is all-or-nothing for a transaction’s effects.',
    whyWrong: {
      '0': 'Confuses Atomicity with Durability — common ACID mix-up.',
    },
    interviewTakeaway: 'A = all-or-nothing; D = survives crash after commit.',
  }),

  // ===== MEDIUM (10) =====
  q({
    id: 'd1-q11',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Functional Dependencies', 'Keys'],
    learningObjective: 'Compute attribute closure to test a superkey',
    question:
      'R(A,B,C,D) with FDs: A→B, B→C, C→D. What is A+ (list attributes in alphabetical order, no spaces/commas, e.g. ABCD)?',
    correctAnswer: 'ABCD',
    acceptedAnswers: ['a b c d', 'a,b,c,d', 'ABCD'],
    explanation:
      'A→B ⇒ AB; B→C ⇒ ABC; C→D ⇒ ABCD. So A determines all attributes and is a key.',
    whyWrong: {
      abc: 'Stopped before applying C→D.',
      ab: 'Did not chase transitive FDs.',
    },
    interviewTakeaway: 'Closure is the mechanical way to find keys from FDs.',
  }),
  q({
    id: 'd1-q12',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Normalization'],
    learningObjective: 'Detect a 2NF violation',
    question:
      'Enrollment(student_id, course_id, student_name, grade) with key (student_id, course_id) and student_id→student_name. Why is this not 2NF?',
    options: [
      'grade depends on the full key',
      'student_name partially depends on part of the composite key',
      'The table has two columns in the key',
      'There is a foreign key',
    ],
    correctAnswer: 1,
    explanation:
      '2NF forbids non-prime attributes depending on a proper subset of a candidate key. student_name depends only on student_id.',
    whyWrong: {
      '0': 'That supports keeping grade with the composite key.',
      '2': 'Composite keys are fine; partial deps are not.',
      '3': 'FKs are unrelated to the 2NF definition.',
    },
    interviewTakeaway: 'Partial dependency ⇒ split the determinant’s attributes into their own relation.',
  }),
  q({
    id: 'd1-q13',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Normalization'],
    learningObjective: 'Contrast 3NF and BCNF',
    question:
      'Which statement correctly distinguishes BCNF from 3NF?',
    options: [
      'BCNF allows non-superkey determinants if the RHS is prime; 3NF never does',
      '3NF allows a non-trivial FD X→A when A is prime even if X is not a superkey; BCNF requires X to be a superkey',
      'They are identical definitions',
      'BCNF only applies to tables without primary keys',
    ],
    correctAnswer: 1,
    explanation:
      'BCNF is stricter: every non-trivial FD’s left side must be a superkey. 3NF has an exception when the RHS is prime.',
    whyWrong: {
      '0': 'Reversed.',
      '2': 'Classic interview distinction exists.',
      '3': 'Nonsense.',
    },
    interviewTakeaway: 'Know one 3NF-not-BCNF example and the dependency-preservation trade-off.',
  }),
  q({
    id: 'd1-q14',
    type: 'multi',
    difficulty: 'medium',
    topics: ['SQL', 'Joins'],
    learningObjective: 'Identify LEFT JOIN + WHERE pitfalls',
    question:
      'Which situations typically turn a LEFT JOIN into effectively an inner join? (Select all that apply)',
    options: [
      'Filtering a right-table non-null column in WHERE (e.g., WHERE o.id IS NOT NULL)',
      'Putting the right-table year filter in ON (e.g., ON ... AND o.year = 2024)',
      'Adding WHERE o.year = 2024 after LEFT JOIN orders o',
      'Selecting only left-table columns',
    ],
    correctAnswer: [0, 2],
    explanation:
      'WHERE predicates that reject NULL-padded right rows remove unmatched left rows. Filters meant to preserve outer semantics belong in ON.',
    whyWrong: {
      '1': 'ON filter keeps unmatched left rows (with NULL rights).',
      '3': 'Projection does not change join cardinality semantics.',
    },
    interviewTakeaway: 'ON vs WHERE is an outer-join interview classic.',
  }),
  q({
    id: 'd1-q15',
    type: 'code',
    difficulty: 'medium',
    topics: ['SQL', 'Aggregates'],
    learningObjective: 'Interpret COUNT NULL semantics',
    question: 'What does this query return for COUNT values?',
    codeSnippet: {
      language: 'sql',
      code: `SELECT COUNT(*) AS a, COUNT(email) AS b
FROM t;
-- t has 5 rows; email is NULL in 2 rows`,
    },
    options: ['a=5, b=5', 'a=5, b=3', 'a=3, b=3', 'a=5, b=0'],
    correctAnswer: 1,
    explanation:
      'COUNT(*) counts rows. COUNT(email) ignores NULL email values → 3.',
    whyWrong: {
      '0': 'COUNT(email) skips NULLs.',
      '2': 'COUNT(*) still counts rows with NULL email.',
      '3': 'Non-null emails still count.',
    },
    interviewTakeaway: 'Always specify what COUNT is counting.',
  }),
  q({
    id: 'd1-q16',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Indexing'],
    learningObjective: 'Apply leftmost prefix rule',
    question:
      'Index exists on (customer_id, created_at). Which query is least likely to use that index efficiently for the leading columns?',
    options: [
      'WHERE customer_id = 9',
      'WHERE customer_id = 9 AND created_at > DATE \'2024-01-01\'',
      'WHERE created_at > DATE \'2024-01-01\'',
      'WHERE customer_id IN (1,2) ORDER BY created_at',
    ],
    correctAnswer: 2,
    explanation:
      'Without the leading customer_id predicate, a standard B+ tree on (customer_id, created_at) cannot seek by created_at alone (unless skip-scan tricks, not assumed).',
    whyWrong: {
      '0': 'Leading equality can use the index.',
      '1': 'Equality + range on next column is ideal.',
      '3': 'Leading column still present.',
    },
    interviewTakeaway: 'Composite index column order is a design decision.',
  }),
  q({
    id: 'd1-q17',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Indexing', 'B+ Trees'],
    learningObjective: 'Explain why B+ trees fit disk indexes',
    question: 'Why are B+ trees preferred over binary search trees for many disk-based indexes?',
    options: [
      'They are always O(1)',
      'High fanout page-sized nodes keep tree height tiny, and linked leaves help range scans',
      'They do not need to be balanced',
      'They store all data only in internal nodes',
    ],
    correctAnswer: 1,
    explanation:
      'Matching node size to disk pages + huge fanout ⇒ few I/Os. Leaves hold records/pointers and are linked for ranges.',
    whyWrong: {
      '0': 'Height is logarithmic in fanout.',
      '2': 'Balance is essential.',
      '3': 'B+ trees keep records in leaves; internals hold separators.',
    },
    interviewTakeaway: 'Fanout → height → I/O is the story.',
  }),
  q({
    id: 'd1-q18',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['SQL', 'Subqueries'],
    learningObjective: 'Choose EXISTS for anti-join safety',
    question:
      'You need customers with no orders. The orders.customer_id column can be NULL in dirty data. Which pattern is safest?',
    options: [
      'WHERE customer_id NOT IN (SELECT customer_id FROM orders)',
      'WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)',
      'WHERE id != ALL (SELECT customer_id FROM orders)',
      'CROSS JOIN orders and filter randomly',
    ],
    correctAnswer: 1,
    explanation:
      'NOT IN becomes empty when the subquery yields NULL. NOT EXISTS semi/anti-join pattern is robust.',
    whyWrong: {
      '0': 'NULL in the subquery breaks NOT IN.',
      '2': 'Same NULL pitfalls.',
      '3': 'Nonsense.',
    },
    interviewTakeaway: 'Prefer EXISTS/NOT EXISTS for existence checks.',
  }),
  q({
    id: 'd1-q19',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Query Optimization'],
    learningObjective: 'Know when seq scan can win',
    question:
      'A query needs ~80% of a large table’s rows. Why might the optimizer choose a sequential scan over an index?',
    options: [
      'Indexes are never used for large tables',
      'Random I/O from many index lookups can exceed the cost of one sequential pass',
      'Sequential scans ignore WHERE clauses',
      'The optimizer cannot estimate selectivity',
    ],
    correctAnswer: 1,
    explanation:
      'For unselective predicates, jumping via index pointers causes random I/O; scanning sequentially can be cheaper.',
    whyWrong: {
      '0': 'False.',
      '2': 'WHERE still applies.',
      '3': 'It estimates; estimates can be wrong but the reason stands.',
    },
    interviewTakeaway: 'Selectivity drives access path — say this in interviews.',
  }),
  q({
    id: 'd1-q20',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['B+ Trees'],
    learningObjective: 'Estimate tree height from fanout',
    question:
      'A B+ tree index has fanout ≈ 100. Roughly how many levels (height) are needed for 1,000,000 keys? Enter an integer (typical ceil(log_100 1e6)).',
    correctAnswer: '3',
    acceptedAnswers: ['3', '4'],
    explanation:
      'log_100(1e6)=3 exactly (100^3=1e6). Real trees may be 3–4 with occupancy <100%.',
    whyWrong: {
      '20': 'That would be binary-tree thinking (log2).',
      '6': 'Too high for fanout 100.',
    },
    interviewTakeaway: 'Huge fanout ⇒ tiny height ⇒ few disk I/Os.',
  }),

  // ===== HARD (10) =====
  q({
    id: 'd1-q21',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Normalization', 'Indexing', 'SQL'],
    learningObjective: 'Combine schema design with performance reasoning',
    question:
      'Orders are normalized (orders + order_items). A dashboard repeatedly joins and aggregates line totals per day, timing out. Which approach best matches “measure, then denormalize consciously”?',
    options: [
      'Delete all indexes to speed writes so the job finishes',
      'Add indexes supporting join/filter keys, consider a summary table/materialized view refreshed async, keep OLTP normalized',
      'Store the entire dashboard HTML in a database column',
      'Switch every column to TEXT to avoid type checks',
    ],
    correctAnswer: 1,
    explanation:
      'First ensure join keys are indexed. If still heavy, maintain a denormalized aggregate (summary/matview) with a clear refresh strategy rather than destroying OLTP design.',
    whyWrong: {
      '0': 'Hurts reads further.',
      '2': 'Not a data model.',
      '3': 'Irrelevant and harmful.',
    },
    interviewTakeaway: 'Normalization for writes/correctness; controlled denormalization for hot reads.',
  }),
  q({
    id: 'd1-q22',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Functional Dependencies', 'Normalization'],
    learningObjective: 'Apply lossless-join test',
    question:
      'R decomposed into R1(A,B) and R2(B,C). When is this lossless-join?',
    options: [
      'Always',
      'Never',
      'If B→A or B→C (B is a key for at least one side)',
      'Only if A→C',
    ],
    correctAnswer: 2,
    explanation:
      'Binary lossless test: common attributes must form a superkey for R1 or R2.',
    whyWrong: {
      '0': 'Bad decompositions lose information.',
      '1': 'Many are lossless.',
      '3': 'Not the binary test.',
    },
    interviewTakeaway: 'Lossless join is mandatory; quote the intersection-superkey test.',
  }),
  q({
    id: 'd1-q23',
    type: 'code',
    difficulty: 'hard',
    topics: ['SQL', 'Joins', 'Aggregates'],
    learningObjective: 'Avoid double-counting after joins',
    question:
      'orders(id, total) 1—N order_items. What is wrong with summing o.total after joining to items?',
    codeSnippet: {
      language: 'sql',
      code: `SELECT SUM(o.total)
FROM orders o
JOIN order_items i ON i.order_id = o.id;`,
    },
    options: [
      'Nothing — this is the standard way',
      'order.total is duplicated per item row, inflating SUM',
      'JOIN always ignores ON',
      'SUM cannot run on integers',
    ],
    correctAnswer: 1,
    explanation:
      'Fan-out duplicates order totals. Aggregate items separately or sum distinct orders carefully.',
    whyWrong: {
      '0': 'Classic bug.',
      '2': 'False.',
      '3': 'False.',
    },
    interviewTakeaway: 'Join fan-out before aggregates is a production footgun.',
  }),
  q({
    id: 'd1-q24',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Indexing', 'Query Optimization'],
    learningObjective: 'Debug a slow query systematically',
    question:
      'A selective WHERE on user_id is slow despite an index. EXPLAIN shows Seq Scan. Which is the best next investigative step?',
    options: [
      'Blame the network exclusively',
      'Check whether the predicate matches the index (type/expression), review row estimates vs ANALYZE, look for cast wrapping the column',
      'Drop the primary key',
      'Disable WAL',
    ],
    correctAnswer: 1,
    explanation:
      'Common causes: implicit cast preventing index use, stale stats, or optimizer cost model choosing seq scan. Verify plan details and predicate sargability.',
    whyWrong: {
      '0': 'Too early; plan shows local access path issue.',
      '2': 'Destructive and unrelated.',
      '3': 'Dangerous and unrelated.',
    },
    interviewTakeaway: 'EXPLAIN ANALYZE → sargability → stats → then rewrite/index.',
  }),
  q({
    id: 'd1-q25',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Indexing'],
    learningObjective: 'Reason about covering indexes',
    question:
      'A query selects (id, email) WHERE email = ?. Primary key is id. Which index best enables an index-only style plan (engine permitting)?',
    options: [
      'INDEX(email) alone if the engine still must fetch heap for id — better: INDEX(email) INCLUDE (id) / covering (email,id) depending on engine',
      'INDEX(id) only',
      'No index ever covers',
      'Hash index on a random UUID column unrelated to the query',
    ],
    correctAnswer: 0,
    explanation:
      'A covering index includes all referenced columns so the engine can avoid heap fetches (visibility rules permitting).',
    whyWrong: {
      '1': 'Does not help email lookup.',
      '2': 'False.',
      '3': 'Irrelevant.',
    },
    interviewTakeaway: 'Covering indexes trade storage for fewer heap visits.',
  }),
  q({
    id: 'd1-q26',
    type: 'multi',
    difficulty: 'hard',
    topics: ['Keys', 'Constraints'],
    learningObjective: 'Reason about FK delete actions',
    question:
      'Parent deleted while children exist. Which actions are consistent with referential integrity policies? (Select all that apply)',
    options: [
      'ON DELETE RESTRICT — reject the parent delete',
      'ON DELETE CASCADE — delete matching children',
      'ON DELETE SET NULL — null out child FKs if columns allow NULL',
      'ON DELETE IGNORE CONSTRAINTS — leave orphans silently as a standard SQL action name',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'RESTRICT/NO ACTION, CASCADE, SET NULL/DEFAULT are standard. Silently ignoring constraints is not a proper integrity policy.',
    whyWrong: {
      '3': 'Not a standard referential action — orphans violate RI.',
    },
    interviewTakeaway: 'Name CASCADE risks in interviews (accidental mass deletes).',
  }),
  q({
    id: 'd1-q27',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['DBMS Architecture', 'Transactions'],
    learningObjective: 'Connect buffer pool, WAL, and durability',
    question:
      'A transaction commits successfully, then power fails before dirty table pages are flushed. On restart the committed row is still present. Which mechanism primarily explains this?',
    options: [
      'The SQL parser re-ran the old query text from bash history',
      'WAL forced on commit plus redo recovery reapplied committed changes',
      'The client GUI cached the row',
      'Indexes alone provide durability',
    ],
    correctAnswer: 1,
    explanation:
      'Durability is log-first: commit flushes WAL; recovery redos committed updates into data files.',
    whyWrong: {
      '0': 'Irrelevant.',
      '2': 'Client cache is not database durability.',
      '3': 'Indexes are access paths, not the durability contract.',
    },
    interviewTakeaway: 'Commit durability story = WAL + fsync + redo.',
  }),
  q({
    id: 'd1-q28',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Normalization'],
    learningObjective: 'Recognize intentional denormalization',
    question:
      'A read-heavy product page stores denormalized seller_name on listings, updated via async events when sellers rename. What is the key trade-off to state in an interview?',
    options: [
      'There is no trade-off',
      'Faster reads / fewer joins vs temporary inconsistency and update complexity',
      'It always violates entity integrity',
      'It makes candidate keys impossible',
    ],
    correctAnswer: 1,
    explanation:
      'Denormalization buys read performance at the cost of consistency lag and more complex writes/invalidations.',
    whyWrong: {
      '0': 'Always trade-offs.',
      '2': 'Keys can still be valid.',
      '3': 'False.',
    },
    interviewTakeaway: 'Denormalize with an explicit consistency story.',
  }),
  q({
    id: 'd1-q29',
    type: 'code',
    difficulty: 'hard',
    topics: ['SQL'],
    learningObjective: 'Predict three-valued logic outcomes',
    question: 'For x NULL, what is the result of the WHERE clause (rows kept)?',
    codeSnippet: {
      language: 'sql',
      code: `SELECT *
FROM t
WHERE NOT (x = 1);`,
    },
    options: [
      'All rows where x is NULL are kept',
      'No rows with x NULL are kept (UNKNOWN filtered out)',
      'Syntax error always',
      'Only rows with x=1',
    ],
    correctAnswer: 1,
    explanation:
      'x=1 is UNKNOWN for NULL; NOT UNKNOWN is UNKNOWN; WHERE keeps only TRUE.',
    whyWrong: {
      '0': 'UNKNOWN is discarded.',
      '2': 'Valid SQL.',
      '3': 'Opposite.',
    },
    interviewTakeaway: 'NOT does not turn UNKNOWN into TRUE.',
  }),
  q({
    id: 'd1-q30',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Indexing', 'B+ Trees', 'Query Optimization'],
    learningObjective: 'Deliver a full index follow-up chain under pressure',
    question:
      'Interviewer: “Indexes make queries faster.” Which response best anticipates Why/How/Trade-off follow-ups?',
    options: [
      '“Yes, always, for every query.”',
      '“A selective B+ tree reduces page I/Os for lookups/ranges; writes and storage cost rise; low selectivity or wrong column order may not help — verify with EXPLAIN.”',
      '“Indexes replace normalization.”',
      '“Only hash indexes exist in databases.”',
    ],
    correctAnswer: 1,
    explanation:
      'Strong answers include structure (B+), I/O, selectivity, write amplification, and verification.',
    whyWrong: {
      '0': 'Fails “always?” follow-up.',
      '2': 'Category error.',
      '3': 'False.',
    },
    interviewTakeaway:
      'Practice the full chain: why → structure → complexity/I/O → writes → when not → EXPLAIN.',
  }),
]

export default day1Questions
