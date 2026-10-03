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
  numerical,
} from '../../../helpers'

export const m1Pages: StudyPage[] = [
  createPage(
    'd2-p1',
    'ACID Properties Deep Dive',
    18,
    [
      'Explain Atomicity, Consistency, Isolation, and Durability with concrete failure scenarios',
      'Map each ACID property to the DBMS subsystem that enforces it',
      'Reason about what breaks when a property is weakened (e.g., eventual consistency)',
      'Give a 60-second verbal model answer covering all four properties',
    ],
    {
      sections: [
        section('concept', 'WHAT — The ACID Contract', [
          p(
            'ACID is the classic correctness contract for a single-database transaction: a sequence of reads and writes that the DBMS treats as one logical unit of work. The four properties — Atomicity, Consistency, Isolation, Durability — are not marketing slogans; each is enforced by specific mechanisms (undo logs, constraint checks, concurrency control, WAL). In interviews, shallow definitions lose points; strong answers tie each letter to a failure mode and a mechanism.',
          ),
          h3('Why it exists'),
          p(
            'Without ACID, concurrent clients and crashes would leave money in limbo, violate invariants, and make debugging impossible. Applications would have to reinvent crash recovery and concurrency — which is exactly what early file-based systems forced developers to do. DBMS vendors productized these guarantees so application code can say BEGIN…COMMIT and reason locally.',
          ),
          h3('The four properties (interview-grade)'),
          table(
            ['Property', 'Promise', 'If violated', 'Primary enforcer'],
            [
              [
                'Atomicity',
                'All-or-nothing: either every effect of the txn is visible, or none is',
                'Half-applied transfers, orphan rows',
                'Undo/rollback + WAL undo records',
              ],
              [
                'Consistency',
                'Txn takes DB from one valid state to another (constraints + app invariants)',
                'Negative balances, broken FKs',
                'Constraint engine + app logic; DBMS checks declared constraints',
              ],
              [
                'Isolation',
                'Concurrent txns do not see each other\'s intermediate states (as if serial)',
                'Dirty/non-repeatable/phantom reads',
                'Locks / MVCC / optimistic CC',
              ],
              [
                'Durability',
                'Once COMMIT returns, effects survive power loss / process crash',
                'Committed data disappears after reboot',
                'WAL flushed to stable storage before commit ack',
              ],
            ],
            'ACID cheat-sheet for verbal answers',
          ),
          callout(
            'tip',
            'Consistency is the most mis-explained letter. The DBMS guarantees that declared constraints hold; business invariants (e.g., "inventory never negative") are only guaranteed if the application encodes them in constraints/triggers/checks or careful txn logic.',
            'Interview nuance',
          ),
        ]),
        section('how', 'HOW — Mechanisms Behind Each Letter', [
          h3('Atomicity'),
          p(
            'During a transaction, changes are tentative. If the txn aborts (explicit ROLLBACK, deadlock victim, constraint failure, crash before commit), the recovery manager undoes all its writes using undo information in the log. After COMMIT, those changes are considered permanent (subject to Isolation/Durability). Atomicity is about the boundary of one transaction — not about multi-database distributed sagas.',
          ),
          h3('Consistency'),
          p(
            'Think of Consistency as: "the database\'s integrity rules are never left broken at commit time." PRIMARY KEY, UNIQUE, FOREIGN KEY, CHECK, NOT NULL are validated before commit (or earlier). If a txn would leave an invalid state, it is rejected. Application-level consistency (double-entry bookkeeping) may require SERIALIZABLE isolation or carefully ordered updates plus constraints.',
          ),
          h3('Isolation'),
          p(
            'Isolation is a spectrum in practice (see Day 2 isolation levels). The ideal is serializability: the effect of concurrent execution equals some serial order. Real systems often offer weaker levels for throughput. Isolation is enforced by locking (2PL), MVCC snapshots, optimistic validation, or combinations.',
          ),
          h3('Durability'),
          p(
            'Write-Ahead Logging (WAL): before a dirty page is written to data files (and before COMMIT is acknowledged), the log records describing those changes must be on durable storage. After a crash, REDO brings committed work forward; UNDO rolls back incomplete txns. Sync replication is an extension of durability across nodes.',
          ),
          diagram(
            `flowchart LR
  App[Application] -->|BEGIN/COMMIT| TM[Transaction Manager]
  TM --> CC[Concurrency Control]
  TM --> RM[Recovery Manager / WAL]
  CC --> Buf[Buffer Pool]
  RM --> Log[(WAL / Log)]
  Buf --> Data[(Data Files)]
  Log --> Data`,
            'ACID is delivered by transaction, concurrency, and recovery subsystems working together',
          ),
        ]),
        section('example', 'Worked Failure Scenarios', [
          example('Bank transfer without Atomicity', [
            p('T: debit A by 100; credit B by 100. Crash after debit, before credit.'),
            p(
              'Without Atomicity: A lost 100, B never gained — money vanished. With Atomicity: on recovery, undo the debit (or never flush partial state), restoring the pre-txn state.',
            ),
          ]),
          example('Constraint = Consistency', [
            code(
              'sql',
              `CREATE TABLE accounts (
  id INT PRIMARY KEY,
  balance INT NOT NULL CHECK (balance >= 0)
);

BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1; -- OK if balance was 40? FAILS CHECK
COMMIT; -- never reached if CHECK fails`,
              'CHECK constraint rejects the txn → Consistency preserved; Atomicity rolls back the failed UPDATE',
            ),
          ]),
          example('Isolation failure: dirty read', [
            p(
              'T1 updates balance to 0 but has not committed. T2 reads 0 and decides to reject a withdrawal. T1 rolls back → balance was never 0. T2 acted on fiction. Isolation (at least READ COMMITTED) prevents this.',
            ),
          ]),
          example('Durability failure', [
            p(
              'COMMIT returns success to the client, but the log was only in OS page cache and never fsynced. Power fails → committed txn vanishes. Correct systems fsync WAL (or equivalent) before acknowledging COMMIT — trading latency for Durability.',
            ),
          ]),
        ]),
        section('tradeoffs', 'WHEN & TRADE-OFFS', [
          h3('When to insist on full ACID'),
          ul([
            'Financial ledgers, inventory reservation, booking systems, anything with hard invariants',
            'Single-row or multi-row updates that must appear atomic to readers',
            'Regulatory or audit requirements that demand crash-safe committed state',
          ]),
          h3('When people intentionally weaken ACID'),
          ul([
            'Caching layers and search indexes often favor availability / latency over strong consistency',
            'Distributed NoSQL may offer eventual consistency (BASE) for partition tolerance',
            'Read replicas may lag — "read-your-writes" may need session stickiness or sync paths',
          ]),
          callout(
            'warning',
            'ACID is per-database (or per-shard) unless you add distributed transactions (2PC/3PC/saga). Saying "we are ACID" for a microservices landscape with multiple DBs is usually false without extra protocols.',
            'Distributed myth',
          ),
          h3('Trade-offs table'),
          table(
            ['Stronger guarantee', 'Cost'],
            [
              ['Strict serializable isolation', 'More locks / aborts / latency'],
              ['Synchronous durable commit (fsync)', 'Higher commit latency'],
              ['Sync multi-AZ replication', 'Write path waits for replica ack'],
              ['Weaker isolation / async replica', 'Anomalies or stale reads possible'],
            ],
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Atomicity + Durability → recovery algorithms (ARIES-style redo/undo + WAL)',
            'Isolation → schedules, conflict serializability, 2PL, MVCC (later pages)',
            'Consistency ↔ normalization/constraints from Day 1; isolation levels affect whether constraints "feel" violated under concurrency',
            'CAP (later) is about distributed systems; ACID is traditionally single-node / single primary',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Candidate: "ACID means Atomicity, Consistency, Isolation, Durability."'),
          p('Interviewer: "Why do we need Atomicity if we have Durability?"'),
          p(
            'Strong answer: "Durability protects committed work across crashes. Atomicity protects incomplete work — if we crash mid-txn, we must undo so we never leave half-applied state. They solve opposite sides of the commit boundary."',
          ),
          p('Interviewer: "How does the database implement Atomicity?"'),
          p(
            'Strong answer: "Undo logging (and often steal/no-force buffer policies). On abort or recovery, apply undo records to reverse uncommitted changes. Commit flips the txn to durable via WAL before ack."',
          ),
          p('Interviewer: "Is Consistency the same as Isolation?"'),
          p(
            'Strong answer: "No. Consistency is about valid states and constraints. Isolation is about concurrent visibility. You can have constraint-valid DBs that still allow anomalies under weak isolation."',
          ),
          p('Interviewer: "Trade-off of syncing WAL on every commit?"'),
          p(
            'Strong answer: "Durability vs latency/throughput. Group commit batches multiple txns\' fsyncs. Cloud disks and replication add more latency dimensions."',
          ),
        ]),
      ],
      commonMistakes: [
        'Defining Consistency only as "data is correct" without mentioning constraints vs app invariants',
        'Claiming Isolation always means serializable — most DBs default to READ COMMITTED',
        'Confusing Atomicity (all-or-nothing of one txn) with distributed atomicity across services',
        'Saying Durability means "data is on disk in the table file" — it means log/stable storage such that recovery can restore committed state',
        'Treating ACID and CAP as interchangeable frameworks',
      ],
      interviewQuestions: [
        'What does each letter in ACID stand for?',
        'Give a real-world example where Atomicity matters.',
        'Who is responsible for Consistency — DBMS or application?',
        'What happens if Durability is not guaranteed after COMMIT?',
        'Name one mechanism used to implement Isolation.',
      ],
      intermediateInterviewQuestions: [
        'How are Atomicity and Durability related to the write-ahead log?',
        'Can a database be Atomic and Durable but poorly Isolated? Explain.',
        'Why might an application still see anomalies under ACID databases?',
        'Explain steal vs force buffer policies and how Atomicity/Durability still hold.',
        'How do CHECK constraints interact with transaction rollback?',
      ],
      advancedInterviewQuestions: [
        'Does PostgreSQL\'s default isolation level provide full Isolation in the ACID sense? What does it guarantee?',
        'How does group commit improve throughput without sacrificing Durability?',
        'In a system with async replicas, which ACID property appears weakened for readers of the replica?',
        'Explain why "eventual consistency" systems still often provide Atomicity for a single-partition write.',
        'How would you explain ACID vs BASE in a system design interview without being dismissive of either?',
        'What breaks if we acknowledge COMMIT before WAL fsync completes?',
        'How do savepoints relate to Atomicity?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain ACID properties.',
          answer:
            'ACID is the transaction contract. Atomicity: all-or-nothing — on abort/crash mid-txn we undo so partial updates never stick. Consistency: commit leaves declared constraints (and hopefully app invariants) satisfied; invalid txns are rejected. Isolation: concurrent txns do not interfere unsafely; ideally equivalent to some serial order, though real DBs offer levels that trade anomalies for performance. Durability: after COMMIT succeeds, effects survive crashes via write-ahead logging to stable storage. Trade-off: stronger isolation and sync durability cost latency and throughput; distributed systems may weaken consistency across nodes while keeping local ACID.',
        },
        {
          question: 'How does a DBMS guarantee Durability?',
          answer:
            'Before acknowledging COMMIT, the DBMS writes and flushes WAL records for that transaction to durable storage. Data pages may still be dirty in the buffer pool (no-force). After a crash, recovery REDOes committed log records so those changes reappear. Trade-off: fsync latency; mitigated by group commit and battery-backed caches.',
        },
      ],
      keyTakeaways: [
        'Each ACID letter maps to a failure mode and a concrete DBMS mechanism.',
        'Consistency ≠ Isolation; constraints vs concurrency visibility are different concerns.',
        'Durability is about recoverable committed state (WAL), not necessarily immediate table-file writes.',
        'ACID is primarily a single-database guarantee; distribute carefully.',
      ],
    },
  ),

  createPage(
    'd2-p2',
    'Transaction States & Lifecycle',
    14,
    [
      'Trace active → partially committed → committed / failed → aborted',
      'Explain commit and rollback semantics and what clients can assume',
      'Relate states to logging and buffer-pool behavior',
    ],
    {
      sections: [
        section('concept', 'WHAT — Transaction Lifecycle', [
          p(
            'A transaction is not just BEGIN/COMMIT syntax — it moves through well-defined states. Interviewers use this to check whether you understand when changes become visible and durable, and what recovery must do if a crash hits in each state.',
          ),
          h3('Standard state machine (Silberschatz-style)'),
          ol([
            'Active — executing; reads/writes happening; not yet decided',
            'Partially Committed — final statement done; DBMS is making commit durable (flush log)',
            'Committed — commit successful; effects durable; txn cannot be aborted anymore',
            'Failed — discovered it cannot proceed (error, deadlock, constraint)',
            'Aborted — rolled back; DB restored as if txn never ran; may restart as a new txn',
          ]),
          diagram(
            `stateDiagram-v2
  [*] --> Active
  Active --> PartiallyCommitted: end of work
  Active --> Failed: error / kill
  PartiallyCommitted --> Committed: log flush OK
  PartiallyCommitted --> Failed: flush / system failure
  Failed --> Aborted: rollback complete
  Committed --> [*]
  Aborted --> [*]`,
            'Transaction state transitions',
          ),
          callout(
            'info',
            'Some texts collapse "partially committed" into the commit protocol internals. Mentioning it shows you know COMMIT is not instantaneous — durability work happens before the client is told success.',
          ),
        ]),
        section('how', 'HOW — Commit, Rollback, and Client Visibility', [
          h3('BEGIN / START TRANSACTION'),
          p(
            'Marks entry into Active. Snapshot/lock behavior depends on isolation level (e.g., PG takes snapshot at first statement for some levels). Autocommit mode implicitly wraps each statement in its own txn.',
          ),
          h3('COMMIT path'),
          ul([
            'Validate remaining constraints if deferred',
            'Write COMMIT log record',
            'Flush WAL through that LSN (log sequence number)',
            'Mark txn Committed; release locks (timing depends on 2PL variant)',
            'Acknowledge success to client — only now may the client assume Durability',
          ]),
          h3('ROLLBACK path'),
          ul([
            'Generate undo for each change (or apply compensating undo from log)',
            'Write ABORT record',
            'Release locks',
            'State → Aborted; resources free; no effects remain',
          ]),
          h3('Savepoints'),
          p(
            'Nested rollback markers inside an Active txn. ROLLBACK TO SAVEPOINT undoes work after that point without aborting the whole txn — Atomicity of the outer txn still holds at the end.',
          ),
          code(
            'sql',
            `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
SAVEPOINT after_debit;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- oops, wrong account
ROLLBACK TO SAVEPOINT after_debit;
UPDATE accounts SET balance = balance + 100 WHERE id = 3;
COMMIT;`,
            'Savepoint rolls back part of a txn without full abort',
          ),
        ]),
        section('example', 'Crash Timing Examples', [
          example('Crash while Active', [
            p(
              'Recovery finds no COMMIT record → UNDO all of the txn\'s updates. Client never got success; safe to retry.',
            ),
          ]),
          example('Crash during Partially Committed', [
            p(
              'If COMMIT record made it to stable log → REDO and treat as Committed. If not → UNDO. This is why "COMMIT returns only after flush" matters for the client contract.',
            ),
          ]),
          example('Client disconnect mid-txn', [
            p(
              'Server typically aborts the Active txn (timeout / disconnect handler) so locks are not held forever. Application must not assume partial work survived.',
            ),
          ]),
        ]),
        section('tradeoffs', 'WHEN & TRADE-OFFS', [
          ul([
            'Long-lived Active txns hold locks or pin old MVCC versions → hurt concurrency; keep txns short',
            'Autocommit simplifies code but cannot make multi-statement Atomicity',
            'Explicit txns give Atomicity across statements at the cost of longer critical sections',
            'Retrying after Abort is safe only if the application is idempotent or re-reads state',
          ]),
          callout(
            'mistake',
            'Never assume that seeing your own writes in a session means other sessions see them — Isolation decides visibility; Commit decides durability/publication to others (modulo isolation).',
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Partially Committed ↔ Durability / WAL flush',
            'Failed/Aborted ↔ Atomicity / undo',
            'Committed + concurrent readers ↔ Isolation levels & MVCC snapshots',
            'Deadlock detection moves victims Active → Failed → Aborted',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "Walk me through states of a transaction."'),
          p(
            'Strong answer: "Active while running; Partially Committed when work is done and we are flushing commit; Committed after durable commit record; or Failed then Aborted if we roll back. Crash recovery uses the log to finish commit or undo."',
          ),
          p('Interviewer: "When can the client retry?"'),
          p(
            'Strong answer: "After definite Abort/error, retry as a new txn. After uncertain commit (timeout waiting for COMMIT ack), use idempotency keys — the commit may have succeeded server-side."',
          ),
        ]),
      ],
      commonMistakes: [
        'Thinking COMMIT is just a flag flip with no I/O',
        'Confusing session disconnect with committed work surviving',
        'Retrying non-idempotent side effects after ambiguous commit errors',
        'Holding transactions open across user think-time / network calls',
      ],
      interviewQuestions: [
        'List the states in a transaction lifecycle.',
        'What is the difference between Failed and Aborted?',
        'When does a transaction become Durable?',
        'What does ROLLBACK do?',
        'What is a savepoint?',
      ],
      intermediateInterviewQuestions: [
        'Why does the partially committed state exist conceptually?',
        'What should an application do if COMMIT times out?',
        'How does autocommit differ from an explicit multi-statement transaction?',
        'When are locks released relative to commit in strict 2PL?',
        'How do long transactions affect MVCC vacuum / purge?',
      ],
      advancedInterviewQuestions: [
        'Explain commit acknowledgment in the presence of synchronous replication.',
        'How do prepared transactions (2PC) extend the state machine?',
        'What is "commit stall" and how does group commit help?',
        'Contrast statement-level vs transaction-level atomicity in error handling (e.g., PG).',
        'How do XA / distributed txns change abort responsibilities?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain the transaction state diagram.',
          answer:
            'A txn starts Active and performs work. When it finishes successfully it enters Partially Committed while the DBMS writes/flushes a COMMIT record for Durability. If that succeeds it becomes Committed and effects persist. On errors or deadlock it becomes Failed, then Aborted after rollback undoes changes — Atomicity. Clients should treat success only after COMMIT ack, and design retries for aborts and ambiguous failures.',
        },
      ],
      keyTakeaways: [
        'COMMIT has an internal durability step before the client should trust success.',
        'Aborted txns leave no effects; Committed txns are permanent.',
        'Keep transactions short; design idempotent retries.',
      ],
    },
  ),

  createPage(
    'd2-p3',
    'Schedules and Serializability',
    25,
    [
      'Define serial vs concurrent schedules and why concurrency is allowed',
      'Identify conflicting operations and build precedence (serialization) graphs',
      'Decide conflict serializability via cycle detection — with many numericals',
      'Distinguish view serializability at a high level',
    ],
    {
      sections: [
        section('concept', 'WHAT — Schedules and Correct Concurrency', [
          p(
            'A schedule is an ordering of the important operations (typically read R, write W, commit C, abort A) of concurrent transactions. A serial schedule runs txns one after another with no interleaving. Concurrent schedules interleave operations for throughput but must remain correct.',
          ),
          h3('Why it exists'),
          p(
            'Serial execution is obviously correct but wastes CPU/IO while one txn waits on disk. Interleaving improves utilization. Serializability is the correctness gold standard: a concurrent schedule is OK if it is equivalent to some serial order.',
          ),
          h3('Conflict'),
          p(
            'Two operations conflict if they belong to different transactions, access the same data item, and at least one is a write. Conflict pairs: R-W, W-R, W-W (same item). R-R does not conflict.',
          ),
          h3('Conflict serializability'),
          p(
            'A schedule is conflict serializable if it can be transformed into a serial schedule by swapping only non-conflicting adjacent operations. Equivalently: its precedence graph is acyclic.',
          ),
          h3('Precedence (serialization) graph'),
          ul([
            'Node per transaction Ti that appears in the schedule',
            'Edge Ti → Tj if an operation of Ti precedes and conflicts with an operation of Tj',
            'Acyclic ⇔ conflict serializable; any topological order is an equivalent serial order',
            'Cycle ⇔ not conflict serializable',
          ]),
          diagram(
            `flowchart LR
  T1 --> T2
  T2 --> T3
  T1 --> T3`,
            'Acyclic precedence graph ⇒ serial order T1, T2, T3',
          ),
        ]),
        section('how', 'HOW — Algorithm You Must Perform Live', [
          ol([
            'List all operations in order (ignore values unless asked for view serializability)',
            'Find every conflicting pair (different txns, same item, ≥1 write)',
            'For each conflict where op of Ti appears before op of Tj, add edge Ti → Tj',
            'Draw the graph; look for cycles (DFS / inspection)',
            'If acyclic, report a topological serial order; else "not conflict serializable"',
          ]),
          callout(
            'tip',
            'In exams, write the edges explicitly: "W1(X) before R2(X) ⇒ T1→T2". Interviewers love seeing the edge justification.',
            'Exam habit',
          ),
          h3('View serializability (awareness level)'),
          p(
            'Based on similar read-from relationships and final writes. Strictly weaker than conflict serializability (more schedules allowed) but NP-hard to test — systems implement conflict-based protocols (2PL) instead. Blind writes create schedules that may be view but not conflict serializable.',
          ),
        ]),
        section('example', 'Worked Numericals — Conflict Serializability', [
          numerical({
            title: 'Numerical 1 — Acyclic graph',
            problem:
              'Schedule S1: R1(X) W1(X) R2(X) W2(Y) R1(Y) W1(Y) C1 C2. Is S1 conflict serializable? If yes, give a serial order.',
            given:
              'Operations as listed; items X,Y; transactions T1,T2.',
            formula:
              'Build precedence graph from conflicting pairs; acyclic ⇒ CS; topo order = serial order.',
            steps:
              '1) Conflicts:\n- W1(X) before R2(X) ⇒ T1→T2\n- R1(Y) before W2(Y)? W2(Y) is before R1(Y): W2(Y) before R1(Y) ⇒ T2→T1\n2) Also W2(Y) before W1(Y) ⇒ T2→T1\nWait — reorder carefully:\nS1: R1(X), W1(X), R2(X), W2(Y), R1(Y), W1(Y), C1, C2\nEdges:\n- W1(X) < R2(X) ⇒ T1→T2\n- W2(Y) < R1(Y) ⇒ T2→T1\n- W2(Y) < W1(Y) ⇒ T2→T1\n3) Edges T1→T2 and T2→T1 ⇒ cycle.',
            answer: 'Not conflict serializable (cycle T1 ↔ T2).',
            shortcut: 'W on X then other reads X ⇒ edge; later W on Y by other before your R/W on Y ⇒ opposite edge → cycle.',
            mistake: 'Forgetting W-R on Y creates T2→T1 after you already have T1→T2 from X.',
          }),
          numerical({
            title: 'Numerical 2 — Classic serializable interleaving',
            problem:
              'S2: R1(A) R2(A) W1(A) R2(B) W2(B) W1(B) C1 C2. Conflict serializable?',
            given: 'T1,T2; items A,B.',
            formula: 'Precedence edges from conflicts; check cycles.',
            steps:
              'Conflicts:\n- R2(A) before W1(A) ⇒ T2→T1\n- R1(A) before W1(A) same txn — ignore\n- W1(A) vs others on A: R2(A) already handled\n- W2(B) before W1(B) ⇒ T2→T1\n- R2(B) before W1(B) ⇒ T2→T1\nOnly edges T2→T1. Acyclic. Serial order: T2 then T1.',
            answer: 'Yes — equivalent to serial T2 → T1.',
            shortcut: 'If all edges go one way, that direction is the serial order.',
            mistake: 'Inventing an edge T1→T2 from R1(A) before R2(A) — reads do not conflict.',
          }),
          numerical({
            title: 'Numerical 3 — Three transactions',
            problem:
              'S3: R1(X) R2(X) W1(X) R3(X) W2(Y) W3(X) R1(Y) C1 C2 C3. Is it conflict serializable? Serial order?',
            given: 'T1,T2,T3; items X,Y.',
            formula: 'Edge Ti→Tj when Ti\'s conflicting op precedes Tj\'s.',
            steps:
              'On X:\n- R2(X) < W1(X) ⇒ T2→T1\n- W1(X) < R3(X) ⇒ T1→T3\n- W1(X) < W3(X) ⇒ T1→T3\n- R2(X) < W3(X) ⇒ T2→T3\n- R3(X) < W3(X) same txn\nOn Y:\n- W2(Y) < R1(Y) ⇒ T2→T1\nEdges: T2→T1, T1→T3, T2→T3. Acyclic. Topo: T2, T1, T3.',
            answer: 'Conflict serializable; serial order T2 → T1 → T3.',
            shortcut: 'Draw nodes; add edges; try to order sources first.',
            mistake: 'Missing T2→T1 from W2(Y) before R1(Y).',
          }),
          numerical({
            title: 'Numerical 4 — Cycle with three nodes',
            problem:
              'S4: W1(X) R2(X) W2(Y) R3(Y) W3(Z) R1(Z). CS or not?',
            given: 'Writes/reads as listed (commits omitted).',
            formula: 'Cycle test on precedence graph.',
            steps:
              'W1(X)<R2(X) ⇒ T1→T2\nW2(Y)<R3(Y) ⇒ T2→T3\nW3(Z)<R1(Z) ⇒ T3→T1\nCycle T1→T2→T3→T1.',
            answer: 'Not conflict serializable.',
            shortcut: 'Each txn writes something the next reads — circular dependency.',
            mistake: 'Stopping after two edges and declaring serializable.',
          }),
          numerical({
            title: 'Numerical 5 — Write-write conflict',
            problem:
              'S5: W1(X) W2(X) W2(Y) W1(Y) C1 C2. Serializable?',
            given: 'T1,T2.',
            formula: 'W-W conflicts create edges.',
            steps:
              'W1(X)<W2(X) ⇒ T1→T2\nW2(Y)<W1(Y) ⇒ T2→T1\nCycle.',
            answer: 'Not conflict serializable (lost-update shaped cycle).',
            shortcut: 'Crossing W-W on two items in opposite orders ⇒ cycle.',
            mistake: 'Thinking only reads create edges.',
          }),
          numerical({
            title: 'Numerical 6 — Find all edges',
            problem:
              'S6: R1(X) W2(X) W2(Y) R3(Y) W1(Y) W3(Z) R1(Z) C1 C2 C3. Build the graph and decide.',
            given: 'Full schedule S6.',
            formula: 'Enumerate conflicts systematically by item.',
            steps:
              'X: R1(X)<W2(X) ⇒ T1→T2\nY: W2(Y)<R3(Y) ⇒ T2→T3; W2(Y)<W1(Y) ⇒ T2→T1; R3(Y)<W1(Y) ⇒ T3→T1\nZ: W3(Z)<R1(Z) ⇒ T3→T1\nEdges: T1→T2, T2→T3, T2→T1, T3→T1.\nT1→T2→T1 cycle (also T1→T2→T3→T1).',
            answer: 'Not conflict serializable.',
            shortcut: 'T1→T2 and T2→T1 alone suffice to reject.',
            mistake: 'Ignoring R3(Y)<W1(Y).',
          }),
          numerical({
            title: 'Numerical 7 — Serial schedule check',
            problem:
              'S7: R1(X) W1(X) C1 R2(X) W2(Y) C2. Is this conflict serializable? Is it serial?',
            given: 'S7.',
            formula: 'Serial = no interleaving; CS = acyclic graph.',
            steps:
              'No interleaving of T1 and T2 operations — already serial order T1 then T2.\nEdge: W1(X)<R2(X) ⇒ T1→T2. Acyclic.',
            answer: 'Yes; it is itself a serial schedule T1→T2.',
            shortcut: 'All serial schedules are conflict serializable.',
            mistake: 'Saying serial schedules need a graph test to be "serial" — serial is syntactic.',
          }),
          numerical({
            title: 'Numerical 8 — Choose equivalent serial order',
            problem:
              'S8: R1(X) W1(X) R2(Y) W2(Y) R2(X) W1(Y) C1 C2. Give a serial order equivalent under conflict equivalence, or say impossible.',
            given: 'S8.',
            formula: 'Topo order of precedence graph.',
            steps:
              'W1(X)<R2(X) ⇒ T1→T2\nW2(Y)<W1(Y) ⇒ T2→T1\nCycle ⇒ no conflict-equivalent serial order.',
            answer: 'Impossible — not conflict serializable.',
            shortcut: 'Opposite edges on X vs Y.',
            mistake: 'Picking T1→T2 because T1 started first — start order ≠ serializability order.',
          }),
          numerical({
            title: 'Numerical 9 — Multi-item practice',
            problem:
              'S9: R3(Z) R1(X) W1(X) R2(X) W2(Y) R3(Y) W3(Y) W3(Z) C1 C2 C3. CS? Order?',
            given: 'S9.',
            formula: 'Graph + topo.',
            steps:
              'X: W1(X)<R2(X) ⇒ T1→T2\nY: W2(Y)<R3(Y) ⇒ T2→T3; W2(Y)<W3(Y) ⇒ T2→T3\nZ: R3(Z)<W3(Z) same txn; no other Z conflicts across txns before\nActually R3(Z) early then W3(Z) later — same txn.\nEdges: T1→T2→T3. Acyclic. Order T1, T2, T3.',
            answer: 'Conflict serializable; T1 → T2 → T3.',
            shortcut: 'Chain of dependencies follows data flow of writes.',
            mistake: 'Adding T3→T1 with no conflicting pair justifying it.',
          }),
          numerical({
            title: 'Numerical 10 — Dirty pattern / abort awareness',
            problem:
              'S10: W1(X) R2(X) A1 C2 (A1 = abort T1). For conflict serializability of committed projection, what matters? Is the committed schedule CS?',
            given: 'T1 aborts after W1(X); T2 read X and commits.',
            formula:
              'Recoverability ≠ serializability; for CS among committed txns, abort removes T1 — but dirty read of aborted write is a recoverability problem.',
            steps:
              'If we only keep committed txns: T2 alone — trivial serial.\nBut T2 read a value written by aborted T1 — schedule is not recoverable / has dirty read.\nInterview: separate conflict serializability from recoverability.',
            answer:
              'Committed projection is trivially serial (only T2), but the schedule is undesirable: dirty read from an aborted txn. Flag recoverability failure.',
            shortcut: 'Always ask: abort present? Check recoverability separately from CS.',
            mistake: 'Declaring "not serializable" only because an abort appears.',
          }),
        ]),
        section('tradeoffs', 'TRADE-OFFS & EDGE CASES', [
          ul([
            'Conflict serializability is sufficient for correctness under conflict model; may reject some view-serializable schedules',
            'Testing view serializability is expensive — not used in engines',
            'Real systems ensure CS via protocols (2PL, SSI) rather than analyzing global schedules after the fact',
            'Operations on different items never conflict — that is why concurrency helps',
          ]),
          table(
            ['Notion', 'Test', 'Used in engines?'],
            [
              ['Conflict serializability', 'Acyclic precedence graph', 'Yes (via 2PL etc.)'],
              ['View serializability', 'View equivalence to a serial schedule', 'Rarely tested online'],
              ['Serial schedule', 'No interleaving', 'Too restrictive'],
            ],
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            '2PL ⇒ conflict serializable schedules (syntactic guarantee)',
            'Recoverability (next page) constrains commit order relative to dirty reads',
            'Isolation level SERIALIZABLE aims for this intuition (implementation varies)',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "How do you check conflict serializability?"'),
          p(
            'Strong answer: "Build a precedence graph: edge Ti→Tj if Ti has a conflicting operation earlier than Tj on the same item. Acyclic iff conflict serializable; topological order is an equivalent serial order."',
          ),
          p('Interviewer: "Why not always run serially?"'),
          p(
            'Strong answer: "Throughput and latency — interleave CPU and I/O across txns. Serializability lets us keep correctness while allowing safe interleaving."',
          ),
          p('Interviewer: "Complexity?"'),
          p(
            'Strong answer: "Graph cycle detection is linear in nodes+edges; constructing edges is about scanning conflicting pairs — fine for exam-sized schedules."',
          ),
        ]),
      ],
      commonMistakes: [
        'Treating R-R as a conflict',
        'Drawing edges based on wall-clock start order instead of conflicting operations',
        'Forgetting W-W conflicts',
        'Confusing conflict serializability with recoverability',
        'Claiming any acyclic resource allocation graph means serializable — wrong graph',
      ],
      interviewQuestions: [
        'What is a serial schedule?',
        'When do two operations conflict?',
        'What is a precedence graph?',
        'How do you test conflict serializability?',
        'Are all serializable schedules conflict serializable?',
      ],
      intermediateInterviewQuestions: [
        'Give a schedule that is not conflict serializable and show the cycle.',
        'Why is view serializability harder to check?',
        'Does conflict serializability allow more concurrency than serial execution? Explain.',
        'What serial orders are allowed by a given acyclic graph?',
        'How does a blind write relate to view vs conflict serializability?',
      ],
      advancedInterviewQuestions: [
        'Prove that 2PL produces conflict-serializable schedules (sketch).',
        'Can a schedule be view serializable but not conflict serializable? Sketch an example shape.',
        'How does Snapshot Isolation differ from conflict serializability?',
        'Relate precedence graphs to waits-for graphs — same thing?',
        'In SSI (Serializable Snapshot Isolation), what additional checks approximate true serializability?',
        'How would you explain "equivalent to a serial order" to a backend engineer with no DB course?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain conflict serializability and how you test it.',
          answer:
            'A schedule is conflict serializable if it can be turned into a serial schedule by swapping only non-conflicting adjacent operations. Practically: build a precedence graph with an edge Ti→Tj whenever Ti performs a conflicting operation before Tj on the same item (R-W, W-R, W-W). If the graph has no cycle, the schedule is conflict serializable and any topological order is a valid equivalent serial order. Cycles mean no such order exists. Engines enforce this via protocols like 2PL rather than checking graphs after the fact.',
        },
      ],
      keyTakeaways: [
        'Conflicts = different txns + same item + ≥1 write.',
        'Acyclic precedence graph ⇔ conflict serializable.',
        'Practice edge listing until it is muscle memory — this is a favorite numerical.',
      ],
    },
  ),

  createPage(
    'd2-p4',
    'Recoverability & Cascading Rollbacks',
    16,
    [
      'Define recoverable, cascading-rollback (aca), and strict schedules',
      'Decide recoverability from schedules with commits/aborts',
      'Explain why recoverable schedules matter for crash recovery and client trust',
    ],
    {
      sections: [
        section('concept', 'WHAT — Recoverability Hierarchy', [
          p(
            'Serializability answers "is the interleaving logically correct?" Recoverability answers "if a txn reads dirty data and the writer aborts, can we still make commit/abort decisions consistent?" A schedule can be conflict serializable yet non-recoverable — interviews often test both.',
          ),
          h3('Definitions'),
          ul([
            'Dirty read: reading a value written by an uncommitted transaction',
            'Recoverable schedule: if Tj reads a value written by Ti, then Ti must commit before Tj commits. (If Ti aborts, Tj must not have committed.)',
            'Cascadeless (ACA — avoids cascading aborts): Tj may read a value from Ti only after Ti has committed. No dirty reads.',
            'Strict schedule: Tj may neither read nor overwrite a value written by Ti until Ti commits or aborts. Stricter than cascadeless (also delays W-W).',
          ]),
          table(
            ['Class', 'Allows dirty read?', 'Allows overwrite uncommitted?', 'Cascading rollback?'],
            [
              ['Recoverable', 'Yes, but reader cannot commit first', 'Yes', 'Possible'],
              ['Cascadeless (ACA)', 'No', 'Yes (W-W may still)', 'No'],
              ['Strict', 'No', 'No', 'No'],
            ],
            'Recoverability hierarchy (strict ⊂ cascadeless ⊂ recoverable ⊂ all schedules)',
          ),
          callout(
            'info',
            'Strict 2PL produces strict schedules — that is one reason databases love it: serializability + nice recovery behavior.',
          ),
        ]),
        section('how', 'HOW — Checking a Schedule', [
          ol([
            'Find each read Ri(X) that reads a value produced by Wj(X) with no intervening committed write to X (dirty if Tj not yet committed at read time)',
            'Recoverable: for every such dirty read from Ti to Tj, commit(Ti) appears before commit(Tj) — or Ti does not abort after Tj committed',
            'Cascadeless: there should be no dirty reads at all — reads only from committed writes',
            'Strict: additionally, no write overwrites an uncommitted write',
          ]),
          h3('Cascading rollback'),
          p(
            'If T2 reads T1\'s dirty write, and T1 aborts, T2 must also abort (and any T3 that dirty-read T2, and so on). Expensive and painful — cascadeless schedules prevent this by construction.',
          ),
          diagram(
            `flowchart TD
  T1[T1 writes X] -->|dirty read| T2[T2 reads X]
  T1 -->|aborts| RB1[Rollback T1]
  RB1 -->|must abort| T2
  T2 -->|dirty read| T3[T3...]
  T2 -->|cascading abort| T3`,
            'Cascading rollback chain from one abort',
          ),
        ]),
        section('example', 'Worked Numericals', [
          numerical({
            title: 'Numerical 1 — Non-recoverable',
            problem:
              'S: W1(X) R2(X) C2 A1. Is S recoverable?',
            given: 'T2 reads X from T1, commits, then T1 aborts.',
            formula: 'Recoverable ⇒ writer commits before reader commits.',
            steps:
              'T2 read dirty X from T1.\nC2 occurs before A1 — T2 already committed.\nCannot undo T2 after commit → non-recoverable.',
            answer: 'Not recoverable.',
            shortcut: 'Reader commits before writer ⇒ instant fail.',
            mistake: 'Calling it only "not serializable" — wrong category.',
          }),
          numerical({
            title: 'Numerical 2 — Recoverable but not cascadeless',
            problem:
              'S: W1(X) R2(X) C1 C2. Classify.',
            given: 'Dirty read; writer commits first.',
            formula: 'Hierarchy tests.',
            steps:
              'Dirty read exists ⇒ not cascadeless, not strict.\nC1 before C2 ⇒ recoverable.\nIf A1 had happened before C2, T2 would need abort (cascade).',
            answer: 'Recoverable, not cascadeless, not strict.',
            shortcut: 'Dirty read + writer commits first = recoverable only.',
            mistake: 'Equating recoverable with cascadeless.',
          }),
          numerical({
            title: 'Numerical 3 — Cascadeless',
            problem:
              'S: W1(X) C1 R2(X) C2. Classify.',
            given: 'Read after commit.',
            formula: 'No dirty reads ⇒ ACA; check W-W for strict.',
            steps:
              'R2 sees committed write ⇒ cascadeless and recoverable.\nNo overwrite of uncommitted data ⇒ also strict for this fragment.',
            answer: 'Recoverable, cascadeless, and strict (for shown ops).',
            shortcut: 'Read-only-after-commit patterns are strict if writes also wait.',
            mistake: 'Forgetting strict also constrains writes.',
          }),
          numerical({
            title: 'Numerical 4 — Cascading abort scenario',
            problem:
              'S: W1(X) R2(X) W2(Y) R3(Y) A1. What must happen?',
            given: 'Abort T1 after dirty chain.',
            formula: 'Cascading rollback rules.',
            steps:
              'T2 dirty-read X from T1 ⇒ T2 must abort.\nT3 dirty-read Y from T2 ⇒ T3 must abort.\nCascade: A1 ⇒ A2 ⇒ A3.',
            answer: 'Abort T2 and T3 as well (cascading rollback).',
            shortcut: 'Follow the dirty-read dependency edges backward from aborter.',
            mistake: 'Only aborting T1 and leaving T2 committed — that would be non-recoverable if T2 already committed.',
          }),
          numerical({
            title: 'Numerical 5 — Strict vs ACA with W-W',
            problem:
              'S: W1(X) W2(X) C1 C2. Is it cascadeless? Strict?',
            given: 'T2 overwrites T1\'s uncommitted write, then both commit.',
            formula: 'ACA forbids dirty reads, not necessarily dirty overwrites; strict forbids both.',
            steps:
              'No reads ⇒ vacuously cascadeless (and recoverable if we only care reads).\nW2 overwrote uncommitted W1 ⇒ not strict.\nAlso complicates undo order (recovery prefers strict).',
            answer: 'Cascadeless (no dirty reads) but not strict.',
            shortcut: 'Strict = no dirty read AND no dirty write.',
            mistake: 'Saying any W-W before commit is non-recoverable — recoverability is defined via reads-from for classic exams.',
          }),
        ]),
        section('tradeoffs', 'WHEN & TRADE-OFFS', [
          ul([
            'Allowing dirty reads increases concurrency but risks cascading aborts and non-recoverability if commits are ordered wrong',
            'Cascadeless/strict reduce concurrency (readers/writers wait for commit) but simplify recovery and avoid cascades',
            'Production OLTP almost always uses at least READ COMMITTED (no dirty reads) — cascadeless for reads',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Strict 2PL ⇒ strict schedules',
            'READ UNCOMMITTED allows dirty reads → cascading risk',
            'Atomicity needs recoverability: cannot have committed readers of aborted data',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "What is a cascading rollback?"'),
          p(
            'Strong answer: "When an abort forces other transactions that dirty-read its data to abort too, potentially chaining. Cascadeless schedules prevent this by only reading committed data."',
          ),
          p('Interviewer: "Why prefer strict schedules?"'),
          p(
            'Strong answer: "Simplifies undo — you never overwrite uncommitted data, so restore is cleaner — and avoids dirty reads. Cost is holding write locks until commit (strict 2PL)."',
          ),
        ]),
      ],
      commonMistakes: [
        'Using "recoverable" and "cascadeless" interchangeably',
        'Ignoring commit order when a dirty read exists',
        'Forgetting cascading aborts can chain across many txns',
        'Mixing up recoverability with conflict serializability',
      ],
      interviewQuestions: [
        'Define a recoverable schedule.',
        'What is a dirty read?',
        'What does cascadeless mean?',
        'What is a cascading rollback?',
        'What is a strict schedule?',
      ],
      intermediateInterviewQuestions: [
        'Give a schedule that is recoverable but not cascadeless.',
        'Give a non-recoverable schedule.',
        'Why does strict 2PL help recovery?',
        'Relate READ UNCOMMITTED to cascading aborts.',
        'Is every conflict-serializable schedule recoverable?',
      ],
      advancedInterviewQuestions: [
        'How do undo logs behave differently under non-strict schedules?',
        'Explain recoverability in the presence of multiple dirty reads of the same item.',
        'How do databases practically avoid non-recoverable schedules?',
        'Contrast ACA with snapshot isolation\'s handling of uncommitted data.',
        'Design a numerical that is CS but not recoverable.',
        'Why might a system allow non-strict schedules internally with careful undo?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain recoverable vs cascadeless vs strict schedules.',
          answer:
            'Recoverable: if you read another txn\'s write, that writer must commit before you commit — otherwise we could commit a reader of aborted data. Cascadeless: you never dirty-read at all; you only read committed values, so aborts do not cascade. Strict: you also never overwrite uncommitted writes, which simplifies undo and is what strict 2PL gives you. Trade-off: stricter classes reduce anomalies and recovery pain but hold locks longer and lower concurrency.',
        },
      ],
      keyTakeaways: [
        'Serializability ≠ recoverability — check both in schedule problems.',
        'Dirty read + reader commits first = non-recoverable.',
        'Strict ⊂ Cascadeless ⊂ Recoverable.',
      ],
    },
  ),
]
