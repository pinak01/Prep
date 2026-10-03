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

export const day1Module4Pages: StudyPage[] = [
  createPage(
    'd1-p13',
    'Index Fundamentals',
    20,
    [
      'Explain why indexes speed lookups and slow writes',
      'Contrast clustered vs secondary indexes',
      'Reason about selectivity, composite design, covering indexes',
      'Quantify INSERT cost with multiple secondary indexes; know when indexes do not help',
    ],
    {
      sections: [
        section('concept', 'WHAT — Indexes', [
          p(
            'An index is a secondary data structure that maps key values to row locations (or stores rows themselves in clustered indexes). Without an index, finding `WHERE id = 42` may require a sequential scan of all pages.',
          ),
          h3('Why databases need indexes'),
          p(
            'Disk/SSD I/O dominates. Indexes reduce the number of pages touched for selective predicates and ordered access. They are not free: every INSERT/UPDATE/DELETE must maintain each relevant index (plus WAL).',
          ),
        ]),
        section('types', 'Clustered, secondary, composite, covering', [
          table(
            ['Type', 'Idea'],
            [
              ['Clustered', 'Row data stored in index order (one per table typically); leaf holds rows'],
              ['Secondary / non-clustered', 'Leaf holds key + pointer/row id / primary key lookup'],
            ],
          ),
          h3('Composite indexes & leftmost prefix'),
          p(
            'Index on (a,b,c) supports predicates on a, a+b, a+b+c efficiently. A predicate only on b often cannot use the index tree order (unless skip-scan tricks). Leading column matters. Design rule of thumb: equality columns first (most selective helpful ones), then range column, then covering INCLUDE/payload columns.',
          ),
          h3('Covering index'),
          p(
            'If the index contains all columns needed for a query, the engine may avoid fetching the heap/table (index-only scan). In Postgres, INCLUDE columns widen a covering index without changing sort order keys.',
          ),
          h3('Selectivity'),
          p(
            'High selectivity (few rows match) favors indexes. Indexing a boolean with 50/50 distribution rarely helps — random I/O to half the table loses to sequential scan.',
          ),
          code(
            'sql',
            `CREATE INDEX idx_orders_customer_created
  ON orders (customer_id, created_at);

-- Good for: WHERE customer_id = ? AND created_at > ?
-- Weak for: WHERE created_at > ? alone (no leftmost prefix)`,
          ),
        ]),
        section('numerical', 'NUMERICAL — INSERT Cost & Composite Drill', [
          numerical({
            title: 'Numerical 1 — Five secondary indexes',
            problem:
              'Heap insert touches ~1 data page (+ possible page split). Table has 5 secondary B+ indexes, each height 3 (root cached). Estimate random page writes for one INSERT (cold leaves; ignore WAL amplification details).',
            given: '1 heap page + 5 indexes × ~1 leaf write each (internal nodes cached).',
            formula: 'write_pages ≈ 1 (heap) + N_secondary (leaf updates) (+ splits rare).',
            steps:
              'Base row write: ~1 page.\nEach secondary index: navigate (~2 I/Os if root cached) + dirty leaf.\nDominant durable cost often: 1 + 5 = 6 page modifications before WAL considerations.\nWith WAL: each change logged; fsync still once per commit (group commit helps).\nCompare to 0 secondary indexes: ~1 data page — 5 indexes roughly 5× more index maintenance work per insert.',
            answer:
              '~6 page modifications order-of-magnitude (1 heap + 5 leaves); indexes dominate write amplification on insert-heavy tables.',
            shortcut: 'Each secondary index ≈ +1 leaf maintain per INSERT (plus WAL).',
            mistake: 'Counting only the heap write and ignoring index maintenance.',
          }),
          numerical({
            title: 'Numerical 2 — When index does NOT help',
            problem:
              'Table 10M rows. Predicate matches 3M rows (30%). Index lookup would do ~3M random heap fetches. Seq scan reads ~200k pages sequentially. Which wins?',
            given: 'selectivity 0.30; large match set.',
            formula: 'Index wins when selective enough that random I/O << sequential scan cost.',
            steps:
              '30% match ⇒ index nested loop / bitmap still touches a huge fraction of the table via random I/O.\nOptimizer correctly prefers seq scan.\nIndex exists but is not used — and maintaining it still slows writes.',
            answer: 'Seq scan — index does not help this query; consider dropping if no selective query needs it.',
            shortcut: 'Rule of thumb: indexes for high selectivity; low selectivity → scan.',
            mistake: '“There is an index, so the query must be fast.”',
          }),
          example('Composite design drill', [
            p('Workload:'),
            ul([
              'Q1: WHERE tenant_id = ? AND status = ? AND created_at > ? ORDER BY created_at',
              'Q2: WHERE tenant_id = ? AND id = ?',
              'Q3: WHERE status = ? alone (rare admin)',
            ]),
            p(
              'Strong design: (tenant_id, status, created_at) serves Q1 with leftmost equality then range; PK/unique (tenant_id, id) or global id PK serves Q2. Do not lead with created_at. Q3 alone may seq-scan or use a separate low-priority index only if measured.',
            ),
            code(
              'sql',
              `-- Equality, equality, then range/order
CREATE INDEX idx_jobs_tenant_status_created
  ON jobs (tenant_id, status, created_at);

-- Covering variant (Postgres): avoid heap for a narrow projection
CREATE INDEX idx_jobs_tenant_status_created_incl
  ON jobs (tenant_id, status, created_at)
  INCLUDE (priority);`,
              'Composite + covering design sketch',
            ),
          ]),
        ]),
        section('tradeoffs', 'TRADE-OFFS — When indexes hurt', [
          ul([
            'Write amplification: each index maintenance = extra CPU + I/O + WAL',
            'Storage: indexes consume disk and buffer pool space',
            'Wrong indexes → optimizer still scans; wasted writes forever',
            'Low selectivity → random I/O may beat sequential scan',
            'Functions on columns (`WHERE LOWER(email)=`) defeat plain indexes unless expression index exists',
            'Tiny tables: seq scan often wins; index overhead not worth it',
            'Too many overlapping composites: optimizer confusion + write death',
          ]),
          callout(
            'tip',
            'Interview answer structure: definition → structure (B+) → read benefit → write cost → selectivity → composite leftmost prefix → covering → when it does NOT help.',
          ),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Why? → fewer page reads for selective lookups.'),
          p('How? → balanced B+ tree from key to row locations / heap TIDs.'),
          p('DS? → B+ tree (sometimes hash for equality-only).'),
          p('Tradeoff? → read I/O ↓ vs write amplification + storage ↑.'),
          p('Always? → no — low selectivity, wrong column order, wrapping columns in functions, tiny tables.'),
          p('INSERT cost? → maintain every secondary index leaf (+ WAL); 5 indexes ≈ 5× index work.'),
          p('Composite? → leftmost prefix; equality columns then range; INCLUDE for covering.'),
          p('Covering? → index-only scan when all needed columns are in the index (+ visibility map in PG).'),
        ]),
      ],
      commonMistakes: [
        'Indexing every column “just in case”',
        'Ignoring write cost on hot tables',
        'Putting range column before equality columns in a composite index',
        'Assuming an existing index is always used',
        'Counting INSERT cost as heap-only',
      ],
      interviewQuestions: [
        'What is an index?',
        'Why do indexes speed reads?',
        'Why do indexes slow writes?',
        'Clustered vs secondary index?',
        'What is selectivity?',
        'What is a covering index?',
      ],
      intermediateInterviewQuestions: [
        'Explain leftmost prefix rule.',
        'When would you not create an index?',
        'How do unique indexes enforce uniqueness?',
        'Index on FK columns — why often recommended?',
        'Design a composite for equality + range + ORDER BY.',
        'Estimate INSERT cost with N secondary indexes.',
      ],
      advancedInterviewQuestions: [
        'How would you design indexes for a given workload of 5 queries?',
        'Partial / filtered indexes — when?',
        'Expression indexes (lower(email)) — use cases?',
        'Index bloat and maintenance (VACUUM/REINDEX awareness)?',
        'Why might an index exist but not be used (visibility map, stats, cost)?',
        'How do INCLUDE columns differ from adding a column to the key?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain indexes as if to an interviewer who keeps asking why.',
          answer:
            'An index is a sorted tree structure that lets the database find rows by key without scanning the whole table. That cuts I/O for selective queries. The common structure is a B+ tree. Writes become slower because each change updates the table and every secondary index, including logging — e.g., five secondary indexes roughly means five leaf maintains per INSERT. I choose indexes from query predicates, favoring high selectivity and composite orders that match equality then range filters, and I add covering columns when index-only scans matter. I avoid indexing low-selectivity columns and I confirm with EXPLAIN — an index that is never used is pure write cost.',
        },
        {
          question: 'When does an index not help?',
          answer:
            'When the predicate matches a large fraction of the table, when the composite order does not match leftmost prefix, when a function/cast hides the column from the index, on tiny tables where seq scan is cheaper, or when statistics lead the optimizer to prefer a scan. In those cases the index still slows writes, so I question whether it should exist.',
        },
      ],
      keyTakeaways: [
        'Indexes trade write cost + storage for read I/O reduction',
        'Composite order, covering, and selectivity decide usefulness',
        'N secondary indexes ≈ N× insert maintenance',
        'Always ready for the why/how/trade-off/always? chain',
      ],
    },
  ),

  createPage(
    'd1-p14',
    'B-Trees and B+ Trees',
    14,
    [
      'Describe B-tree/B+ tree nodes, fanout, and height',
      'Explain why B+ trees dominate disk-oriented indexes',
      'Estimate I/O cost for point and range lookups',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p('B-trees are multiway balanced trees optimized so each node fits a disk page. High fanout ⇒ low height ⇒ few I/Os per lookup. B+ trees store all records in leaves and keep leaves linked for range scans; internal nodes store only separators/keys.'),
          diagram(
            `flowchart TB
  I["Internal: keys + child pointers"] --> L1["Leaf: keys + row pointers"]
  I --> L2["Leaf"]
  I --> L3["Leaf"]
  L1 -.-> L2 -.-> L3`,
            'B+ tree: fat internal nodes, linked leaves for ranges',
          ),
          h3('Why B+ for databases'),
          ul([
            'All data in leaves ⇒ stable shape for range queries',
            'Leaf sibling pointers ⇒ sequential range scan without tree re-traversal',
            'Internal nodes pack more keys (no full records) ⇒ higher fanout ⇒ shorter tree',
          ]),
        ]),
        section('numerical', 'Height / I/O intuition', [
          numerical({
            title: 'Estimate B+ tree height',
            problem:
              'Each index page holds 500 keys (fanout ≈ 500). How many levels for 100 million keys? Approx I/Os for point lookup if root is cached?',
            given: 'fanout f=500, N=1e8',
            formula: 'height ≈ ceil(log_f N); I/Os ≈ height (cold) or height-1 if root cached',
            steps: `log_500(1e8) = ln(1e8)/ln(500) ≈ 18.4/6.21 ≈ 3.0
So height about 3–4 levels.
If root in memory: ~2–3 disk reads worst case for point query (plus table fetch if secondary).`,
            answer: '~3–4 levels; a handful of I/Os per point lookup when cold',
            shortcut: 'Fanout hundreds ⇒ millions of keys at depth 3–4',
            mistake: 'Comparing to binary tree height log2(1e8)≈26 and forgetting page fanout',
          }),
        ]),
        section('ops', 'Search, insert, split', [
          ol([
            'Search: root → child by key ranges → leaf',
            'Insert: find leaf; if full, split node, promote separator key upward (may cascade)',
            'Delete: may merge/redistribute underflow nodes (details rarely required)',
          ]),
          callout(
            'info',
            'Interview depth: structure + why disk-friendly + range vs range + height/fanout. Full split algorithms optional unless asked.',
          ),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“What data structure?” → B+ tree.'),
          p('“Why not hash index?” → hash great for equality, weak for ranges/ORDER BY.'),
          p('“Why not binary tree?” → poor fanout; too many levels/I/Os.'),
        ]),
      ],
      commonMistakes: [
        'Saying “binary search tree” and stopping',
        'Not knowing leaves are linked in B+ trees',
        'Claiming indexes are O(1) always (hash can be; B+ is logarithmic I/O)',
      ],
      interviewQuestions: [
        'What is a B+ tree?',
        'B-tree vs B+ tree?',
        'Why high fanout matters?',
        'How do range queries use B+ trees?',
        'About how deep is an index on a large table?',
      ],
      intermediateInterviewQuestions: [
        'What happens on leaf split?',
        'Why are internal nodes smaller than leaf payloads?',
        'Hash index vs B+ trade-offs?',
        'Why keep the tree balanced?',
        'Clustered index leaf contents vs secondary?',
      ],
      advancedInterviewQuestions: [
        'Estimate fanout given page size and key width.',
        'Prefix compression / suffix truncation awareness?',
        'Index page splits and write amplification?',
        'Why buffer pool hit rate dominates real latency?',
        'LSM trees vs B+ trees — when (LevelDB/Rocks) awareness?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Why are B+ trees preferred for many database indexes?',
          answer:
            'They are balanced multiway trees where a node matches a disk page. High fanout keeps height small, so lookups cost few I/Os. All row pointers live in leaves, and leaves are linked, which makes range scans efficient. Internal nodes store keys only, packing more branches per page than a design that stores full records in every node.',
        },
      ],
      keyTakeaways: [
        'B+ = disk-page-sized nodes + linked leaves',
        'Height stays tiny because fanout is huge',
        'Great for equality and ranges; hash is equality-only',
      ],
    },
  ),

  createPage(
    'd1-p15',
    'Query Execution Basics',
    14,
    [
      'Outline SQL → parse → plan → execute',
      'Contrast seq scan, index scan, and index-only scan',
      'Compare nested loop, hash, and merge joins at interview depth',
      'Read a simple EXPLAIN at interview depth',
    ],
    {
      sections: [
        section('pipeline', 'From SQL to results', [
          p(
            'A query engine turns declarative SQL into an executable plan. Correctness first (semantics), then cost-based choice among equivalent plans.',
          ),
          ol([
            'Parse & analyze (syntax, types, existence, permissions)',
            'Rewrite (view expansion, constant folding, predicate simplification)',
            'Plan: join order, join algorithm, access path (scan vs index)',
            'Execute operators (iterator/Volcano pull model or compiled pipelines)',
          ]),
          code(
            'sql',
            `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42;`,
            'ANALYZE = actual timings; BUFFERS = cache hits vs reads',
          ),
          table(
            ['Access path', 'When it wins'],
            [
              ['Seq scan', 'Large fraction of table needed; sequential I/O cheaper than random'],
              ['Index nested lookup', 'Highly selective equality/range on indexed columns'],
              ['Bitmap index scan', 'Multiple conditions combined (Postgres-style)'],
              ['Index-only scan', 'Covering index + visibility map allows skip heap'],
            ],
          ),
        ]),
        section('joins', 'Join algorithms (interview essentials)', [
          table(
            ['Algorithm', 'Idea', 'Good when'],
            [
              ['Nested loop', 'For each outer row, probe inner', 'Small outer + indexed inner lookup'],
              ['Hash join', 'Build hash table on one side, probe', 'Equi-join, larger sets, memory available'],
              ['Merge join', 'Sort both sides (or use ordered indexes), merge', 'Equi/range on sorted inputs'],
            ],
          ),
          callout(
            'tip',
            'Say: “Join order matters as much as join type — cardinality estimates drive both.”',
          ),
        ]),
        section('cost', 'Cost & statistics', [
          p(
            'The optimizer estimates cardinality using table stats (histograms, most-common values, null fractions). Cost ≈ CPU + sequential/random page I/O. Stale stats ⇒ bad plans (e.g., nested loop on a million-row inner).',
          ),
          ul([
            'Selectivity wrong → wrong access path',
            'Correlation between columns often underestimated',
            'Parameter sniffing / generic plans can freeze a bad plan for varied bind values',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Indexes (physical design) change which plans are cheap — not SQL meaning',
            'Buffer pool hit rate often dominates: cold cache plans look worse',
            'Locks/MVCC visibility can add time beyond the pure plan cost',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('“How do you debug a slow query?” → EXPLAIN ANALYZE → rows vs estimate → seq scan on large table? → join order? → sort/hash spill? → missing/wrong index? → stats?'),
          p('“Why seq scan with an index present?” → low selectivity, cast on column, wrong composite order, or cost model prefers sequential I/O.'),
          p('“Would forcing an index hint help?” → last resort; fix stats/query/index first.'),
        ]),
      ],
      commonMistakes: [
        'Blindly adding indexes without reading the plan',
        'Assuming the optimizer is always right without ANALYZE',
        'Optimizing SQL text without checking actual row counts',
      ],
      interviewQuestions: [
        'What does the query optimizer do?',
        'Seq scan vs index scan?',
        'What is EXPLAIN?',
        'What is cardinality estimation?',
        'Name three join algorithms.',
      ],
      intermediateInterviewQuestions: [
        'When is a seq scan better than an index?',
        'What is a nested loop join?',
        'Hash join vs merge join?',
        'How do statistics affect plans?',
        'What is predicate pushdown?',
      ],
      advancedInterviewQuestions: [
        'How would you investigate a slow SQL query end-to-end?',
        'Parameter sniffing / prepared plan pitfalls?',
        'Skewed data and bad estimates — mitigations?',
        'Parallel query operators awareness?',
        'Planner hints — when justified?',
      ],
      interviewReadyAnswers: [
        {
          question: 'How would you investigate a slow SQL query?',
          answer:
            'I run EXPLAIN ANALYZE to see actual time and rows versus estimates. I look for sequential scans on large tables, unexpected join orders, nested loops exploding row counts, and sorts/hashes spilling to disk. I check whether an index could support the filter or join key, whether composite order matches, whether a cast disables the index, and whether statistics are stale. I fix the query/index/stats, then re-measure — not guess.',
        },
      ],
      keyTakeaways: [
        'Optimizer chooses among correct plans by estimated cost',
        'EXPLAIN ANALYZE is mandatory vocabulary',
        'Join algorithm + order + access path + stats explain most surprises',
      ],
    },
  ),

  createPage(
    'd1-p16',
    'Transactions Introduction',
    16,
    [
      'Define a transaction and ACID properties with mechanisms (not slogans)',
      'Explain atomicity/durability via undo + WAL at interview depth',
      'Recognize long-txn harm, autocommit traps, and commit-crash follow-ups',
      'Preview why concurrency and recovery need Day 2 depth',
    ],
    {
      sections: [
        section('concept', 'WHAT — Transactions & ACID', [
          p(
            'A transaction is a sequence of operations treated as one unit of work: either all effects commit or none do (from a correctness perspective).',
          ),
          code(
            'sql',
            `BEGIN;
UPDATE accounts SET bal = bal - 100 WHERE id = 1;
UPDATE accounts SET bal = bal + 100 WHERE id = 2;
COMMIT; -- or ROLLBACK on failure`,
            'Money transfer must not stop halfway',
          ),
          table(
            ['ACID', 'Client promise', 'Mechanism preview'],
            [
              ['Atomicity', 'All or nothing', 'Undo logs / rollback; abort cleans partial work'],
              ['Consistency', 'Integrity rules hold after commit', 'Constraints + app invariants; not CAP “C”'],
              ['Isolation', 'Defined separation from concurrent txns', 'Locks / MVCC / isolation levels (Day 2)'],
              ['Durability', 'After COMMIT ack, survives crashes', 'WAL + fsync (log before data pages)'],
            ],
          ),
          callout(
            'info',
            'Day 2 expands isolation anomalies, locking, MVCC, WAL, and serializability with numericals. Today: vocabulary + mechanisms + operational traps.',
          ),
        ]),
        section('mechanisms', 'HOW — Atomicity & Durability Mechanisms', [
          h3('Atomicity'),
          p(
            'Before/while changing data pages, the engine records enough undo information. On ROLLBACK or crash of an in-flight txn, recovery/abort applies undo so partial effects disappear. Clients never see a committed half-transfer.',
          ),
          h3('Durability'),
          p(
            'COMMIT does not require every dirty table page to hit disk. It requires the write-ahead log records for that txn to be on stable storage (fsync). After a crash, redo from WAL restores committed effects (no-force). Day 2 covers steal/no-force and ARIES.',
          ),
          example('Commit then crash', [
            p(
              'Client receives COMMIT OK → power loss before data pages flush → restart redo from WAL → money transfer still present. That is Durability.',
            ),
          ]),
          example('Crash mid-transaction', [
            p(
              'Transfer debited account A, not yet credited B, not committed → crash → undo removes the debit (Atomicity). Client must retry the whole txn.',
            ),
          ]),
          h3('Autocommit trap'),
          p(
            'Many drivers/default modes autocommit each statement. Two UPDATEs for a transfer as separate autocommit statements are NOT one atomic transaction — a failure between them leaves money disappeared. Always BEGIN…COMMIT for multi-statement integrity.',
          ),
          code(
            'sql',
            `-- DANGER under autocommit: not atomic together
UPDATE accounts SET bal = bal - 100 WHERE id = 1; -- committed
-- crash here
UPDATE accounts SET bal = bal + 100 WHERE id = 2; -- never ran`,
            'Autocommit trap — wrap multi-step work explicitly',
          ),
        ]),
        section('ops', 'Long Transactions & Operational Harm', [
          ul([
            'Hold locks/row versions longer → block writers or bloat MVCC (vacuum cannot reclaim)',
            'Delay replication apply / increase lag on busy systems',
            'Enlarge crash-recovery undo windows',
            'Invite idle-in-transaction timeouts and mysterious “DB got slow” incidents',
          ]),
          callout(
            'warning',
            'Do not open a transaction, call an HTTP API, wait on a user, or run a huge report inside the same OLTP txn. Keep transactions short; move slow I/O outside.',
            'Long txn anti-pattern',
          ),
          numerical({
            title: 'Numerical — Autocommit vs explicit txn',
            problem:
              'API runs 3 UPDATEs that must all succeed. Autocommit on. Failure rate after statement 1 is 1%. What integrity failure mode exists?',
            given: '3 statements; autocommit; P(fail after #1)=1%.',
            formula: 'Without an explicit txn, partial commits are durable.',
            steps:
              'Each UPDATE commits alone.\n~1% of requests permanently apply only the first change.\nExplicit BEGIN/COMMIT makes failure → ROLLBACK of all three.',
            answer: 'Partial updates become durable bugs ~1% of the time; use one transaction.',
            shortcut: 'Multi-statement invariant ⇒ explicit transaction, never autocommit faith.',
            mistake: 'Assuming “we use a SQL database” implies multi-statement atomicity by default.',
          }),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Why? → “Why transactions?” → Multi-step invariants + concurrent clients need a correctness contract.'),
          p('How? → “How is durability implemented?” → WAL forced on commit; data pages later; redo after crash.'),
          p('How? → “How is atomicity implemented?” → Undo/rollback of losers; uncommitted effects do not survive.'),
          p('DS? → “What is logged?” → Redo/undo records addressed by LSN (Day 2 depth).'),
          p('Tradeoff? → “Why not one huge txn for a job?” → Locks, MVCC bloat, recovery pain — batch in small txns.'),
          p('Always? → “Does COMMIT flush all table pages?” → No — typically log force (no-force policy).'),
          p('Crash after COMMIT ack? → Redo restores effects — client should treat success as durable.'),
          p('Crash before COMMIT? → Undo — client retries; must be idempotent at app boundary.'),
          p('Autocommit? → Each statement is its own txn — dangerous for multi-step business ops.'),
        ]),
      ],
      commonMistakes: [
        'Thinking Autocommit means you do not need to understand transactions',
        'Equating consistency in ACID with distributed “strong consistency” casually',
        'Believing COMMIT always writes every dirty table page immediately',
        'Holding transactions open across network calls or user think-time',
        'Retrying non-idempotent side effects after unknown commit outcome without care',
      ],
      interviewQuestions: [
        'What is a transaction?',
        'What does COMMIT do?',
        'What does ROLLBACK do?',
        'Name the ACID properties.',
        'Why use transactions for bank transfers?',
        'What is autocommit?',
      ],
      intermediateInterviewQuestions: [
        'What is a savepoint?',
        'Atomicity vs durability?',
        'What layer implements transactions?',
        'What happens if the server crashes mid-transaction?',
        'What happens if the server crashes right after COMMIT returns?',
        'Why are long transactions harmful?',
      ],
      advancedInterviewQuestions: [
        'How does WAL enable durability?',
        'Why is isolation not absolute by default in many DBs?',
        'Read-only transactions — optimizations?',
        'Application-level transactions across two databases — problem?',
        'How do clients handle uncertainty if the network fails during COMMIT?',
        'Relate steal/no-force buffer policies to Atomicity and Durability.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain ACID briefly.',
          answer:
            'Atomicity means all-or-nothing — unimplemented by magic slogans but by undo/rollback so partial work disappears. Consistency means constraints and invariants hold after commit (not CAP linearizability). Isolation means concurrent transactions get a defined separation so they do not read dirty partial updates — strength depends on isolation level. Durability means after COMMIT is acknowledged, effects survive crashes because the WAL was forced to stable storage; recovery redos committed work even if data pages had not flushed yet.',
        },
        {
          question: 'What happens if we crash just after COMMIT returns?',
          answer:
            'The client was told success, so Durability must hold. The engine already flushed the commit record to the WAL. On restart, redo reapplies those logged changes to data pages if needed. This is why interviews separate “log forced” from “all table pages flushed.”',
        },
        {
          question: 'Why are long transactions dangerous?',
          answer:
            'They hold locks or pin MVCC versions for a long time, blocking other writers, delaying vacuum/purge, bloating storage, and widening crash undo work. They also tempt developers to do HTTP calls or user waits inside a txn. Keep OLTP transactions short; batch large jobs into many small commits with idempotency.',
        },
      ],
      keyTakeaways: [
        'Transaction = unit of atomic work',
        'Atomicity ≈ undo; Durability ≈ WAL + fsync',
        'Autocommit is not a multi-statement transaction',
        'Keep txns short; Day 2 covers isolation & recovery depth',
      ],
    },
  ),
]
