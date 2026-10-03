import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from './helpers'

/** Day 2 — transactions, concurrency, isolation, MVCC, WAL, replication, sharding, CAP (30 questions) */
export const day2Questions: QuizQuestion[] = [
  // ===== EASY (10) =====
  q({
    id: 'd2-q01',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Transactions', 'ACID'],
    learningObjective: 'Map each ACID letter to its intent',
    question:
      'A payment debit and credit must both succeed or neither. Which ACID property is the primary guarantee?',
    options: ['Isolation', 'Atomicity', 'Durability', 'Consistency (as in “C” alone)'],
    correctAnswer: 1,
    explanation:
      'Atomicity is all-or-nothing: partial effects of a transaction are not visible after abort or crash recovery.',
    whyWrong: {
      '0': 'Isolation controls concurrent visibility, not all-or-nothing within one txn.',
      '2': 'Durability is about surviving crashes after commit.',
      '3': 'Consistency is invariants; atomicity is the mechanism for multi-step all-or-nothing.',
    },
    interviewTakeaway: 'Lead with “atomicity = all-or-nothing” before naming Isolation/Durability.',
  }),
  tf({
    id: 'd2-q02',
    difficulty: 'easy',
    topics: ['Isolation'],
    learningObjective: 'Recognize dirty reads',
    question:
      'True or False: A dirty read occurs when a transaction reads another transaction’s uncommitted changes.',
    correct: true,
    explanation:
      'Dirty read = reading uncommitted data that may later roll back. Forbidden at READ COMMITTED and above in ANSI levels.',
    whyWrong: {
      '1': 'False would confuse dirty reads with non-repeatable reads (committed changes between reads).',
    },
    interviewTakeaway: 'Dirty = uncommitted; non-repeatable = committed change between your reads.',
  }),
  q({
    id: 'd2-q03',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Concurrency', 'Anomalies'],
    learningObjective: 'Name lost-update anomaly',
    question:
      'T1 and T2 both read balance=100, each add 10, both write 110. The intended final balance was 120. What happened?',
    options: ['Phantom read', 'Lost update', 'Dirty write only', 'Cascade delete'],
    correctAnswer: 1,
    explanation:
      'Both overwrote based on a stale read; one increment was lost. Classic lost-update under weak concurrency control.',
    whyWrong: {
      '0': 'Phantoms are new rows matching a prior predicate range.',
      '2': 'Dirty write is overwriting uncommitted data; here both may commit.',
      '3': 'Unrelated to FK actions.',
    },
    interviewTakeaway: 'Lost update ⇒ need locking, version checks, or higher isolation / optimistic concurrency.',
  }),
  q({
    id: 'd2-q04',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['WAL'],
    learningObjective: 'State write-ahead logging purpose',
    question: 'What does Write-Ahead Logging (WAL) primarily ensure before modifying data pages?',
    options: [
      'SQL text is prettier',
      'Log records describing changes hit stable storage before corresponding dirty pages are flushed',
      'Replicas always run ahead of the primary',
      'Indexes are never updated',
    ],
    correctAnswer: 1,
    explanation:
      'WAL/ARIES-style recovery: log first so crash recovery can redo/undo correctly; dirty pages need not flush on every commit.',
    whyWrong: {
      '0': 'Cosmetic.',
      '2': 'Replication lag/lead is orthogonal to the WAL rule.',
      '3': 'Indexes are updated; they are also recovered via logging.',
    },
    interviewTakeaway: '“Log before data” is the durability/recovery soundbite.',
  }),
  tf({
    id: 'd2-q05',
    difficulty: 'easy',
    topics: ['MVCC'],
    learningObjective: 'State MVCC high-level idea',
    question:
      'True or False: Under MVCC, readers typically see a snapshot version of rows and often avoid blocking writers (and vice versa) for ordinary SELECTs.',
    correct: true,
    explanation:
      'Multi-version concurrency keeps prior row versions so snapshots can read without waiting for writers (engine-specific visibility rules apply).',
    whyWrong: {
      '1': 'False understates why Postgres-style READ COMMITTED/REPEATABLE READ use snapshots.',
    },
    interviewTakeaway: 'MVCC trades version storage/vacuum for read/write non-blocking.',
  }),
  q({
    id: 'd2-q06',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Replication'],
    learningObjective: 'Contrast sync vs async replication',
    question:
      'Primary waits for at least one standby to acknowledge WAL before commit returns. What is this?',
    options: [
      'Asynchronous replication',
      'Synchronous replication (sync commit to standby)',
      'Sharding',
      'Two-phase locking',
    ],
    correctAnswer: 1,
    explanation:
      'Sync replication ties commit latency to replica ack; reduces data-loss window on primary failure vs async.',
    whyWrong: {
      '0': 'Async returns commit without waiting for replica apply/ack.',
      '2': 'Sharding partitions data; not this wait semantics.',
      '3': '2PL is a concurrency protocol, not replication mode.',
    },
    interviewTakeaway: 'Sync = lower RPO, higher commit latency; async = opposite trade-off.',
  }),
  q({
    id: 'd2-q07',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Sharding'],
    learningObjective: 'Define horizontal sharding',
    question:
      'Customer rows are split across DB nodes by hash(customer_id). What is this pattern called?',
    options: [
      'Vertical partitioning of columns only',
      'Horizontal sharding / partitioning by key',
      'Materialized view refresh',
      'Full table lock escalation',
    ],
    correctAnswer: 1,
    explanation:
      'Horizontal sharding distributes row subsets by a shard key so each node holds a slice of the table.',
    whyWrong: {
      '0': 'Vertical split is by columns/tables, not row key ranges/hashes.',
      '2': 'Matviews are for cached query results.',
      '3': 'Locking is unrelated to data placement.',
    },
    interviewTakeaway: 'Shard key choice drives cross-shard joins and hotspots.',
  }),
  q({
    id: 'd2-q08',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['CAP'],
    learningObjective: 'Recall CAP trade-off under partition',
    question:
      'During a network partition, a system that rejects some writes to keep all surviving nodes agreeing on the same data prioritizes which pair?',
    options: ['AP (availability + partition tolerance)', 'CP (consistency + partition tolerance)', 'CA forever without partitions', 'Only durability'],
    correctAnswer: 1,
    explanation:
      'CAP: under partition you choose Consistency or Availability. Refusing conflicting writes to preserve a single value is CP-leaning.',
    whyWrong: {
      '0': 'AP systems stay available but may diverge.',
      '2': 'CA assumes no partition — not the interesting case.',
      '3': 'Durability is ACID D, not the CAP triad.',
    },
    interviewTakeaway: 'CAP is about partition behavior — say CP vs AP with an example.',
  }),
  tf({
    id: 'd2-q09',
    difficulty: 'easy',
    topics: ['Isolation'],
    learningObjective: 'Place SERIALIZABLE in the isolation hierarchy',
    question:
      'True or False: SERIALIZABLE is the weakest ANSI SQL isolation level and always allows dirty reads.',
    correct: false,
    explanation:
      'SERIALIZABLE is the strongest ANSI level (no dirty/non-repeatable/phantom anomalies as defined). READ UNCOMMITTED is the weakest.',
    whyWrong: {
      '0': 'True reverses the hierarchy — a common mix-up with “serial” sounding fast/loose.',
    },
    interviewTakeaway: 'Order: RU < RC < RR < Serializable (anomaly-prevention sense).',
  }),
  q({
    id: 'd2-q10',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Distributed DB', 'Replication'],
    learningObjective: 'Define primary-replica role',
    question: 'In a typical primary–replica setup, where do writes go?',
    options: [
      'Any replica equally by default with no coordination',
      'To the primary (leader); replicas apply the change stream',
      'Only to the slowest replica',
      'Nowhere — distributed DBs forbid writes',
    ],
    correctAnswer: 1,
    explanation:
      'Single-primary replication funnels writes through the leader; replicas replay WAL/binlog for reads/failover.',
    whyWrong: {
      '0': 'Multi-primary needs conflict resolution; not “typical” default.',
      '2': 'Nonsense.',
      '3': 'False.',
    },
    interviewTakeaway: 'State write path + failover + lag when discussing replicas.',
  }),

  // ===== MEDIUM (10) =====
  q({
    id: 'd2-q11',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Concurrency', 'Schedules'],
    learningObjective: 'Count conflicting operations in a schedule',
    question:
      'Schedule: R1(A) W2(A) W1(A) C1 C2. How many conflicting pairs of operations appear (operations conflict if different txns, same item, ≥1 write)? Enter an integer.',
    correctAnswer: '2',
    acceptedAnswers: ['2'],
    explanation:
      'Conflicts: R1(A)–W2(A) and W2(A)–W1(A). (R1 and W1 are same txn — not a conflict pair across txns.)',
    whyWrong: {
      '1': 'Missed one of the two cross-txn conflicts on A.',
      '3': 'Overcounted; same-txn ops or non-conflicts do not add.',
    },
    interviewTakeaway: 'Conflict = different txn + same data + at least one write.',
  }),
  q({
    id: 'd2-q12',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Concurrency', 'Serializability'],
    learningObjective: 'Apply precedence graph for conflict serializability',
    question:
      'Schedule S: R1(X) W2(X) W1(X) C1 C2. Edges in the conflict graph are T1→T2 if an op of T1 precedes and conflicts with an op of T2. Is S conflict serializable?',
    options: [
      'Yes — acyclic graph',
      'No — cycle T1→T2→T1 (R1 before W2 and W2 before W1)',
      'Yes because both commit',
      'Only if X is an integer',
    ],
    correctAnswer: 1,
    explanation:
      'R1(X) < W2(X) ⇒ T1→T2; W2(X) < W1(X) ⇒ T2→T1. Cycle ⇒ not conflict serializable.',
    whyWrong: {
      '0': 'There is a cycle.',
      '2': 'Commits do not imply serializability.',
      '3': 'Irrelevant.',
    },
    interviewTakeaway: 'Draw the precedence graph; cycle ⇒ not CSR.',
  }),
  q({
    id: 'd2-q13',
    type: 'code',
    difficulty: 'medium',
    topics: ['Isolation', 'Anomalies'],
    learningObjective: 'Identify non-repeatable read in SQL timeline',
    question: 'At READ COMMITTED, what can T1 observe?',
    codeSnippet: {
      language: 'sql',
      code: `-- T1: BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- sees 100
-- T2: UPDATE accounts SET balance = 80 WHERE id = 1; COMMIT;
-- T1:
SELECT balance FROM accounts WHERE id = 1;  -- ?`,
    },
    options: [
      'Must still see 100 (repeatable by definition of RC)',
      'May see 80 — non-repeatable read allowed at READ COMMITTED',
      'Must see uncommitted 80 before T2 commits',
      'Must error and abort always',
    ],
    correctAnswer: 1,
    explanation:
      'RC prevents dirty reads but allows committed updates between statements ⇒ non-repeatable reads.',
    whyWrong: {
      '0': 'That is closer to REPEATABLE READ / snapshot behavior.',
      '2': 'RC forbids dirty reads.',
      '3': 'No mandatory abort here.',
    },
    interviewTakeaway: 'RC = no dirty; RR/snapshot = stable row versions for the txn.',
  }),
  q({
    id: 'd2-q14',
    type: 'multi',
    difficulty: 'medium',
    topics: ['Isolation', 'Anomalies'],
    learningObjective: 'Match anomalies prevented by isolation levels',
    question:
      'Which anomalies does ANSI REPEATABLE READ prevent that READ COMMITTED does not? (Select all that apply)',
    options: [
      'Dirty reads',
      'Non-repeatable reads on already-read rows',
      'Phantom reads (new matching rows)',
      'Writes by aborted transactions becoming durable',
    ],
    correctAnswer: [1],
    explanation:
      'Both RC and RR prevent dirty reads. RR additionally prevents non-repeatable reads; phantoms are the classic gap RR may still allow (engine-dependent). Durability is not an isolation anomaly.',
    whyWrong: {
      '0': 'Already prevented by RC.',
      '2': 'Phantoms are the RR→Serializable gap in ANSI theory.',
      '3': 'Atomicity/durability, not isolation level naming.',
    },
    interviewTakeaway: 'Say “RC vs RR vs phantoms” precisely; mention engine nuances (Postgres RR ≈ snapshot).',
  }),
  q({
    id: 'd2-q15',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['MVCC', 'Isolation'],
    learningObjective: 'Explain snapshot isolation write skew',
    question:
      'Two doctors on call: constraint “at least one on call.” Both read the other is on call, both set themselves off, both commit under snapshot isolation. What anomaly is this?',
    options: [
      'Dirty read',
      'Write skew (SI anomaly; serializable would reject)',
      'Lost update on a single row both updated',
      'Successful 2PC prepare',
    ],
    correctAnswer: 1,
    explanation:
      'Each write disjoint rows based on a stale snapshot of the predicate; SI allows write skew. True serializable (SSI/S2PL) prevents it.',
    whyWrong: {
      '0': 'Reads are of committed snapshot data.',
      '2': 'They did not overwrite the same row version.',
      '3': 'Unrelated distributed commit protocol.',
    },
    interviewTakeaway: 'SI ≠ serializable — write skew is the interview example.',
  }),
  q({
    id: 'd2-q16',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['WAL', 'Recovery'],
    learningObjective: 'Separate redo vs undo roles',
    question:
      'After a crash, recovery finds a committed txn whose data pages were not flushed, and an uncommitted txn that dirtied pages. What is the standard approach?',
    options: [
      'Ignore the log',
      'Redo committed changes from WAL; undo uncommitted changes',
      'Undo committed and redo aborted',
      'Drop the database',
    ],
    correctAnswer: 1,
    explanation:
      'ARIES-style: analysis + redo to bring pages to a consistent logged state, then undo loser transactions.',
    whyWrong: {
      '0': 'Breaks durability/atomicity.',
      '2': 'Reversed.',
      '3': 'Not recovery.',
    },
    interviewTakeaway: 'Commit ⇒ redo; loser ⇒ undo.',
  }),
  q({
    id: 'd2-q17',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Replication', 'Distributed DB'],
    learningObjective: 'Reason about replication lag effects',
    question:
      'A user writes on the primary then immediately reads from an async replica and does not see their write. What is this?',
    options: [
      'Phantom DDL',
      'Read-your-writes violation due to replication lag',
      'Proof that WAL was never written',
      'Mandatory under SERIALIZABLE',
    ],
    correctAnswer: 1,
    explanation:
      'Async replicas trail the primary; sticky primary reads or causal/session guarantees fix read-your-writes.',
    whyWrong: {
      '0': 'Unrelated.',
      '2': 'Primary commit likely succeeded; replica just lagging.',
      '3': 'Isolation level on one node does not force cross-replica freshness.',
    },
    interviewTakeaway: 'Mention read-your-writes / monotonic reads when using read replicas.',
  }),
  q({
    id: 'd2-q18',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Concurrency', 'Schedules'],
    learningObjective: 'Determine serial order from a conflict graph',
    question:
      'Only conflict: W1(A) before R2(A). T3 has no conflicts with T1 or T2. How many conflict-equivalent serial orders of {T1,T2,T3} exist? Enter an integer.',
    correctAnswer: '3',
    acceptedAnswers: ['3'],
    explanation:
      'Edge T1→T2 only. T3 can be placed before T1, between T1 and T2, or after T2 ⇒ orders T3-T1-T2, T1-T3-T2, T1-T2-T3.',
    whyWrong: {
      '1': 'That would require T3 to be locked into a single position.',
      '6': 'All 6 permutations would require no edges at all.',
    },
    interviewTakeaway: 'Acyclic conflict graph ⇒ count topological sorts for equivalent serial orders.',
  }),
  q({
    id: 'd2-q19',
    type: 'multi',
    difficulty: 'medium',
    topics: ['Sharding', 'Distributed DB'],
    learningObjective: 'Identify sharding operational costs',
    question:
      'Which are real costs of hash sharding by user_id? (Select all that apply)',
    options: [
      'Cross-shard transactions and joins become harder',
      'Hot keys (celebrity user_id) can overload one shard',
      'Resharding/rebalancing when adding nodes is operationally heavy',
      'SQL SELECT without a WHERE becomes impossible forever on one shard’s local data',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'Distributed txns, skew, and rebalancing dominate shard ops. Local full scans on a shard still work; global scans need scatter-gather.',
    whyWrong: {
      '3': 'Local queries still run; global fan-out is the issue.',
    },
    interviewTakeaway: 'Interview shard answers: key choice, skew, cross-shard, rebalancing.',
  }),
  q({
    id: 'd2-q20',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['CAP', 'Distributed DB'],
    learningObjective: 'Critique naive CAP slogans',
    question:
      'Which statement is the most accurate refinement of CAP for practitioners?',
    options: [
      'You must pick exactly two letters and delete the third forever at design time',
      'During a partition, you choose how to degrade: refuse some ops (favor consistency) or serve possibly stale/divergent answers (favor availability); outside partitions you can be consistent and available',
      'CAP replaces ACID completely',
      'Network partitions never happen in cloud regions',
    ],
    correctAnswer: 1,
    explanation:
      'Modern reading: CAP highlights partition behavior. Systems tune latency/consistency continuously (PACELC), not a one-time “pick two.”',
    whyWrong: {
      '0': 'Oversimplified meme.',
      '2': 'Orthogonal layers.',
      '3': 'Partitions and partial failures do happen.',
    },
    interviewTakeaway: 'Prefer “behavior under partition + latency trade-offs” over “pick two.”',
  }),

  // ===== HARD (10) =====
  q({
    id: 'd2-q21',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Isolation', 'Application Retries', 'Concurrency'],
    learningObjective: 'Combine isolation failures with idempotent retries',
    question:
      'Checkout uses READ COMMITTED. App retries the whole txn on deadlock. A client timeout retries the HTTP request while the first attempt may still be committing. Which design best prevents double-charge?',
    options: [
      'Lower isolation to READ UNCOMMITTED to go faster',
      'Idempotency key unique constraint / upsert so retries of the same request cannot insert a second payment; keep short txns and retry only on retryable errors',
      'Remove all unique constraints so inserts always succeed',
      'Rely solely on SERIALIZABLE without any application idempotency',
    ],
    correctAnswer: 1,
    explanation:
      'Isolation does not make duplicate client requests a single logical purchase. Idempotency keys + unique constraints handle at-least-once delivery; SERIALIZABLE alone does not dedupe two committed attempts.',
    whyWrong: {
      '0': 'Worsens anomalies.',
      '2': 'Invites duplicates.',
      '3': 'Two separate successful txns can both commit without conflicting keys.',
    },
    interviewTakeaway: 'Isolation ≠ idempotency — say both in distributed/API interviews.',
  }),
  q({
    id: 'd2-q22',
    type: 'code',
    difficulty: 'hard',
    topics: ['Isolation', 'MVCC', 'SQL'],
    learningObjective: 'Predict Postgres-style SSI abort under concurrent write',
    question:
      'Under SERIALIZABLE (SSI), T1’s commit may fail. Why?',
    codeSnippet: {
      language: 'sql',
      code: `-- balance starts at 100; constraint: balance >= 0
-- T1: BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT balance FROM accounts WHERE id=1;     -- 100
-- T2: BEGIN; UPDATE accounts SET balance = 0 WHERE id=1; COMMIT;
-- T1: UPDATE accounts SET balance = balance - 30 WHERE id=1;
-- T1: COMMIT;  -- ?`,
    },
    options: [
      'Always succeeds seeing balance 100 forever regardless of T2',
      'May abort with a serialization failure because T1’s read/write set conflicts with T2’s committed write',
      'Must dirty-read T2’s uncommitted -30',
      'Must delete the accounts table',
    ],
    correctAnswer: 1,
    explanation:
      'SSI detects rw-dependencies that break serializability and aborts one txn. Applications must retry the whole transaction.',
    whyWrong: {
      '0': 'SI without SSI can allow stale decisions; SSI may abort.',
      '2': 'Serializable still reads committed snapshots, not dirty data.',
      '3': 'Nonsense.',
    },
    interviewTakeaway: 'Serializable ⇒ be ready to retry on serialization_failure.',
  }),
  q({
    id: 'd2-q23',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['WAL', 'Replication', 'Durability'],
    learningObjective: 'Combine sync replication with failover RPO',
    question:
      'Primary fsyncs local WAL and uses async streaming to one replica. Primary dies after commit ack to client; replica is 2 seconds behind. What is true?',
    options: [
      'RPO is zero — async cannot lose data',
      'Committed transactions in the lag window may be lost on failover unless you had sync replication or another durable sink',
      'WAL on the dead primary is automatically visible to clients without restore',
      'Sharding would have prevented lag',
    ],
    correctAnswer: 1,
    explanation:
      'Async replica ack is not required for commit; failover to a lagging replica loses the unreplicated suffix. Sync replication / quorum commit reduces RPO.',
    whyWrong: {
      '0': 'Async explicitly allows loss window.',
      '2': 'Dead disk is not serving; need restore/failover.',
      '3': 'Sharding does not fix replication lag.',
    },
    interviewTakeaway: 'Tie commit ack, sync vs async, and RPO in one sentence.',
  }),
  q({
    id: 'd2-q24',
    type: 'multi',
    difficulty: 'hard',
    topics: ['MVCC', 'WAL', 'Isolation'],
    learningObjective: 'Connect MVCC vacuum with long transactions',
    question:
      'A long-running analytics txn holds an old snapshot for hours while OLTP updates churn. Which effects can follow? (Select all that apply)',
    options: [
      'Table/index bloat because old row versions cannot be vacuumed past the snapshot’s xmin horizon',
      'Query plans and caches on other nodes are deleted by CAP',
      'OLTP performance may degrade due to version chains / wraparound risk if extreme',
      'Readers using that snapshot keep seeing a stable older database state',
    ],
    correctAnswer: [0, 2, 3],
    explanation:
      'MVCC retains versions until no snapshot needs them; long txns pin horizons ⇒ bloat and potential wraparound pressure. Snapshot stability is intended. CAP does not delete plans.',
    whyWrong: {
      '1': 'Non sequitur — CAP is about partitions, not vacuum.',
    },
    interviewTakeaway: 'Long transactions are an ops hazard under MVCC — mention vacuum/horizon.',
  }),
  q({
    id: 'd2-q25',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Sharding', 'Transactions', 'Distributed DB'],
    learningObjective: 'Design cross-shard transfer with failure modes',
    question:
      'Transfer $50 from user A (shard 1) to user B (shard 2). Network fails after debit commits on shard 1, before credit on shard 2. Which approach is most sound?',
    options: [
      'Ignore the debit — money will reappear',
      'Use a saga/outbox with compensating credit-or-refund, or a coordinated 2PC/XA with clear timeout/recovery; make steps idempotent',
      'Turn off WAL on both shards',
      'Only raise isolation to REPEATABLE READ on each shard independently and assume atomic global commit',
    ],
    correctAnswer: 1,
    explanation:
      'Cross-shard atomicity needs 2PC (availability/latency cost) or saga/compensations with idempotency. Per-shard isolation does not compose into global atomicity.',
    whyWrong: {
      '0': 'Loses money.',
      '2': 'Destroys durability.',
      '3': 'Local RR ≠ distributed atomic commit.',
    },
    interviewTakeaway: 'Distributed txn = 2PC vs saga; always discuss partial failure.',
  }),
  q({
    id: 'd2-q26',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Concurrency', 'Isolation', 'Application Retries'],
    learningObjective: 'Choose optimistic concurrency with version checks',
    question:
      'Inventory row has version column. UPDATE ... SET qty=qty-1, version=version+1 WHERE id=? AND version=? returns 0 rows under READ COMMITTED. Best application response?',
    options: [
      'Assume success and charge the card',
      'Treat as conflict: reread, revalidate business rules, retry limited times or fail to the user',
      'Disable the version column and blind-write',
      'Switch the DB to async replica for the write',
    ],
    correctAnswer: 1,
    explanation:
      'Optimistic concurrency control: 0 rows means lost race. Retry with fresh state or abort; never invent success.',
    whyWrong: {
      '0': 'Causes oversell/lost updates.',
      '2': 'Removes the protection.',
      '3': 'Writes must go to primary; replicas do not fix OCC.',
    },
    interviewTakeaway: 'OCC = version/etag + retry loop + clear user-visible failure.',
  }),
  q({
    id: 'd2-q27',
    type: 'numerical',
    difficulty: 'hard',
    topics: ['Concurrency', 'Serializability'],
    learningObjective: 'Detect cycle length in a precedence graph',
    question:
      'Conflicts: W1(A)<R2(A), W2(B)<R3(B), W3(A)<R1(A). What is the length of the shortest cycle in the conflict graph (number of edges)? Enter an integer, or 0 if acyclic.',
    correctAnswer: '3',
    acceptedAnswers: ['3'],
    explanation:
      'Edges: T1→T2, T2→T3, T3→T1. One 3-cycle; not conflict serializable.',
    whyWrong: {
      '0': 'There is a cycle.',
      '2': 'No 2-cycle among these three edges alone.',
    },
    interviewTakeaway: 'Shortest cycle length is a quick CSR check under pressure.',
  }),
  q({
    id: 'd2-q28',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['CAP', 'Replication', 'Isolation'],
    learningObjective: 'Combine quorum reads with isolation expectations',
    question:
      'A CP-leaning quorum system requires majority ACK for writes. A client reads from a single stale replica (not quorum) at READ COMMITTED locally. What can go wrong?',
    options: [
      'Nothing — any local RC read is globally linearizable',
      'You can miss recent majority-committed writes (Violate real-time / read-your-writes) even though the write path was careful',
      'CAP forces the read to see future writes',
      'WAL is disabled automatically',
    ],
    correctAnswer: 1,
    explanation:
      'Write quorum ≠ read freshness unless reads also use quorum/lease/primary. Local RC only orders what that replica has applied.',
    whyWrong: {
      '0': 'Linearizability needs careful read path too.',
      '2': 'Nonsense.',
      '3': 'Unrelated.',
    },
    interviewTakeaway: 'State quorum for both reads and writes when claiming strong consistency.',
  }),
  q({
    id: 'd2-q29',
    type: 'code',
    difficulty: 'hard',
    topics: ['Isolation', 'Anomalies', 'SQL'],
    learningObjective: 'Spot phantom risk in range queries',
    question: 'T1 runs twice under classic ANSI REPEATABLE READ locking (no predicate locks). What is possible?',
    codeSnippet: {
      language: 'sql',
      code: `-- T1: BEGIN;
SELECT * FROM orders WHERE customer_id = 7;  -- 2 rows
-- T2 inserts a new order for customer 7 and COMMITs
-- T1: SELECT * FROM orders WHERE customer_id = 7;  -- ?`,
    },
    options: [
      'Must always return exactly the same 2 rows; phantoms impossible by RR definition in all engines',
      'May return 3 rows — phantom insert; true SERIALIZABLE / predicate locks / SSI needed to forbid',
      'Must return 0 rows',
      'Must see T2’s uncommitted insert before T2 commits',
    ],
    correctAnswer: 1,
    explanation:
      'Phantoms are new rows matching a prior predicate. ANSI RR historically allowed them; Serializable (or Postgres SSI) prevents.',
    whyWrong: {
      '0': 'Engine-dependent; ANSI RR ≠ no phantoms.',
      '2': 'Unfounded.',
      '3': 'That would be a dirty read.',
    },
    interviewTakeaway: 'Phantom = predicate; name SSI or locking gap strategy.',
  }),
  q({
    id: 'd2-q30',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['WAL', 'MVCC', 'Sharding', 'Application Retries'],
    learningObjective: 'Integrate recovery, multi-shard, and client retries end-to-end',
    question:
      'Interviewer: design order placement across two shards with crash mid-commit and client retries. Which answer best combines the mechanisms?',
    options: [
      '“Just use READ UNCOMMITTED everywhere and hope.”',
      '“Persist intent via local WAL-backed txn + outbox on the order shard; async reliable messaging to inventory shard with idempotent consumers; client sends Idempotency-Key; on crash, redo from WAL and resume outbox; avoid dual-write without outbox.”',
      '“Disable WAL and MVCC to simplify.”',
      '“CAP says we cannot store orders.”',
    ],
    correctAnswer: 1,
    explanation:
      'End-to-end story: durability (WAL), exactly-once effects via idempotency, and cross-shard consistency via outbox/saga rather than naive dual-write.',
    whyWrong: {
      '0': 'Weak isolation does not compose a distributed design.',
      '2': 'Removes recovery and concurrency foundations.',
      '3': 'Misuse of CAP.',
    },
    interviewTakeaway:
      'Package WAL + idempotency + outbox/saga when asked for distributed orders.',
  }),
]

export default day2Questions
