import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from '../helpers'

/** Day 2 module checkpoints — 8 questions each (3 easy / 3 medium / 2 hard). */
export const day2ModuleQuizzes: Record<string, QuizQuestion[]> = {
  // ===== d2-m1 Transactions & Schedules =====
  'd2-m1': [
    q({
      id: 'd2-m1-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['ACID', 'Transactions'],
      learningObjective: 'Define durability',
      question:
        'After a transaction commits, a power failure occurs. Durability requires that:',
      options: [
        'Uncommitted changes survive',
        'Committed effects survive and can be recovered',
        'Isolation is automatically serializable',
        'The schema is rewritten in BCNF',
      ],
      correctAnswer: 1,
      explanation:
        'Durability means committed work persists across crashes — typically via WAL/redo and recovery.',
      whyWrong: {
        '0': 'Uncommitted work should not be durable as committed state.',
        '2': 'Isolation is a separate ACID property.',
        '3': 'Normalization is unrelated to durability.',
      },
      interviewTakeaway: 'Durability = committed data survives crashes; mention WAL/redo.',
    }),
    tf({
      id: 'd2-m1-q02',
      difficulty: 'easy',
      topics: ['Transactions'],
      learningObjective: 'Identify transaction states',
      question:
        'True or False: After a successful COMMIT, a transaction is considered terminated successfully; ROLLBACK aborts and undoes its uncommitted effects.',
      correct: true,
      explanation:
        'Transactions proceed through states (active → partially committed/committed or failed → aborted). COMMIT finalizes; ROLLBACK undoes.',
      whyWrong: {
        '1': 'False would blur commit vs abort semantics.',
      },
      interviewTakeaway: 'Be precise: commit finishes; rollback aborts.',
    }),
    q({
      id: 'd2-m1-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Schedules'],
      learningObjective: 'Define a schedule',
      question: 'In concurrency theory, a schedule is:',
      options: [
        'A backup cron expression',
        'An ordering of operations from concurrent transactions',
        'A physical disk partition layout',
        'A SQL VIEW definition',
      ],
      correctAnswer: 1,
      explanation:
        'A schedule interleaves reads/writes (and commits/aborts) from multiple transactions. Correctness notions like serializability apply to schedules.',
      whyWrong: {
        '0': 'Ops scheduling ≠ transaction schedules.',
        '2': 'Storage layout is unrelated.',
        '3': 'Views are query objects, not schedules.',
      },
      interviewTakeaway: 'Schedule = interleaved ops; then talk conflict/view serializability.',
    }),
    q({
      id: 'd2-m1-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Serializability'],
      learningObjective: 'Define conflict serializability',
      question:
        'Two operations from different transactions conflict when they:',
      options: [
        'Are both reads of the same item',
        'Access the same data item and at least one is a write',
        'Occur in different databases',
        'Use different isolation levels',
      ],
      correctAnswer: 1,
      explanation:
        'Conflicts are read-write, write-read, or write-write on the same item. Two reads do not conflict. Conflict serializability uses the precedence graph on conflicts.',
      whyWrong: {
        '0': 'Read-read is not a conflict.',
        '2': 'Same-item access is the local notion.',
        '3': 'Isolation level is a product feature; conflict is a schedule property.',
      },
      interviewTakeaway: 'Conflict = same item + ≥1 write; acyclic graph ⇒ conflict serializable.',
    }),
    q({
      id: 'd2-m1-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Serializability'],
      learningObjective: 'Use the precedence graph test',
      question:
        'In a conflict serializability test, an edge Ti → Tj means:',
      options: [
        'Tj committed before Ti started',
        'An operation of Ti conflicts with a later operation of Tj, so Ti should precede Tj in an equivalent serial order',
        'Ti and Tj never accessed shared data',
        'Ti must abort',
      ],
      correctAnswer: 1,
      explanation:
        'Conflict edges encode forced order. A cycle means no conflict-equivalent serial order.',
      whyWrong: {
        '0': 'Commit times alone do not define conflict edges.',
        '2': 'No shared conflicting access ⇒ no such edge.',
        '3': 'Cycles may force aborts in protocols, but the edge itself is an order constraint.',
      },
      interviewTakeaway: 'Draw the conflict graph; cycle ⇒ not conflict serializable.',
    }),
    tf({
      id: 'd2-m1-q06',
      difficulty: 'medium',
      topics: ['ACID', 'Consistency'],
      learningObjective: 'Clarify consistency in ACID',
      question:
        'True or False: In ACID, Consistency means the transaction takes the database from one valid state to another, respecting declared constraints (app + DB).',
      correct: true,
      explanation:
        'C is about integrity constraints/invariants. It is not the same as CAP “consistency” (linearizability) — call out that overloaded word in interviews.',
      whyWrong: {
        '1': 'False would invite CAP confusion.',
      },
      interviewTakeaway: 'Disambiguate ACID consistency vs CAP consistency.',
    }),
    q({
      id: 'd2-m1-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Serializability', 'View Serializability'],
      learningObjective: 'Relate conflict and view serializability',
      question: 'Which statement is accurate?',
      options: [
        'Every view-serializable schedule is conflict-serializable',
        'Every conflict-serializable schedule is view-serializable, but the converse is not always true',
        'The two notions are identical on all schedules',
        'Neither relates to concurrent transactions',
      ],
      correctAnswer: 1,
      explanation:
        'Conflict serializability is stricter/poly-time testable; view serializability is more general (includes some blind-write cases) but hard. CSR ⇒ VSR.',
      whyWrong: {
        '0': 'Opposite inclusion direction.',
        '2': 'They differ; blind writes create gaps.',
        '3': 'Both are concurrency correctness notions.',
      },
      interviewTakeaway: 'CSR ⊂ VSR; engines approximate with locks/MVCC/OCC.',
    }),
    q({
      id: 'd2-m1-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Schedules', 'Recoverability'],
      learningObjective: 'Identify cascading abort risk',
      question:
        'T2 reads a value written by T1, then T1 aborts. What recoverability issue arises if T2 already committed?',
      options: [
        'No issue — dirty reads are always durable',
        'Cascading abort / non-recoverable schedule: T2 read uncommitted data',
        'Automatic serializability is guaranteed',
        'The schedule becomes conflict serializable by definition',
      ],
      correctAnswer: 1,
      explanation:
        'Reading uncommitted data (dirty read) can force cascading rollbacks; if the reader committed, the schedule is not recoverable.',
      whyWrong: {
        '0': 'Dirty reads are exactly the hazard.',
        '2': 'Recoverability ≠ serializability.',
        '3': 'This scenario does not grant CSR.',
      },
      interviewTakeaway: 'Mention recoverability/cascadeless/strict schedules alongside serializability.',
    }),
  ],

  // ===== d2-m2 Concurrency Control =====
  'd2-m2': [
    q({
      id: 'd2-m2-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Locks'],
      learningObjective: 'Distinguish shared vs exclusive locks',
      question:
        'Multiple transactions may hold which lock type on the same item concurrently?',
      options: [
        'Exclusive (X) locks only',
        'Shared (S) locks',
        'Neither — locks are always exclusive',
        'Update locks that block all readers forever by definition',
      ],
      correctAnswer: 1,
      explanation:
        'Shared locks are compatible with each other for concurrent readers. Exclusive locks conflict with both S and X.',
      whyWrong: {
        '0': 'X locks are exclusive — only one at a time.',
        '2': 'Shared locks exist for read concurrency.',
        '3': 'Misstates update-lock purpose/behavior.',
      },
      interviewTakeaway: 'S compatible with S; X conflicts with S and X.',
    }),
    tf({
      id: 'd2-m2-q02',
      difficulty: 'easy',
      topics: ['Two-Phase Locking'],
      learningObjective: 'State the 2PL growing/shrinking rule',
      question:
        'True or False: In two-phase locking, a transaction cannot acquire any new locks after it has released a lock.',
      correct: true,
      explanation:
        '2PL has a growing phase (acquire) then a shrinking phase (release). No lock acquire after first release.',
      whyWrong: {
        '1': 'False would break the 2PL definition.',
      },
      interviewTakeaway: '2PL: grow then shrink — that yields conflict serializability.',
    }),
    q({
      id: 'd2-m2-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Deadlocks'],
      learningObjective: 'Recognize deadlock',
      question: 'A deadlock among transactions means:',
      options: [
        'All transactions committed successfully',
        'A cycle of wait-for dependencies so none can proceed',
        'The buffer pool is empty',
        'The schema lacks a primary key',
      ],
      correctAnswer: 1,
      explanation:
        'Deadlock is a circular wait (e.g., on locks). Detection uses wait-for graphs; prevention uses ordering/timeouts/wound-wait.',
      whyWrong: {
        '0': 'Opposite of stuck waiting.',
        '2': 'Memory pressure is a different problem.',
        '3': 'Keys do not define deadlock.',
      },
      interviewTakeaway: 'Deadlock = cycle in wait-for; detect or prevent.',
    }),
    q({
      id: 'd2-m2-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Two-Phase Locking'],
      learningObjective: 'Contrast basic 2PL vs strict 2PL',
      question: 'Strict two-phase locking primarily requires that:',
      options: [
        'Exclusive locks are held until commit (no early release of X locks)',
        'No shared locks are ever used',
        'Transactions never write',
        'Locks are acquired only after commit',
      ],
      correctAnswer: 0,
      explanation:
        'Strict 2PL holds exclusive locks until commit/abort, avoiding cascading aborts from dirty reads of uncommitted writes. Rigorous 2PL holds all locks until end.',
      whyWrong: {
        '1': 'Shared locks remain useful.',
        '2': 'Writers are the normal case.',
        '3': 'Locks are acquired during the transaction, not after commit.',
      },
      interviewTakeaway: 'Strict 2PL: keep X locks until commit — recoverability-friendly.',
    }),
    q({
      id: 'd2-m2-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Deadlocks'],
      learningObjective: 'Compare deadlock detection vs prevention',
      question:
        'Wait-for graph cycle detection is an example of:',
      options: [
        'Deadlock prevention by timestamp ordering only',
        'Deadlock detection (then victim selection/abort)',
        'Optimistic concurrency validation',
        'Quorum replication',
      ],
      correctAnswer: 1,
      explanation:
        'Detection finds cycles and aborts a victim. Prevention/avoidance tries to stop cycles (e.g., wait-die, wound-wait, lock ordering).',
      whyWrong: {
        '0': 'Timestamp schemes are prevention/avoidance styles, not graph detection.',
        '2': 'OCC validates at commit; different mechanism.',
        '3': 'Replication quorums are orthogonal.',
      },
      interviewTakeaway: 'Name detect (wait-for) vs prevent (order/timestamps/timeouts).',
    }),
    tf({
      id: 'd2-m2-q06',
      difficulty: 'medium',
      topics: ['Locks', 'Lock Escalation'],
      learningObjective: 'Explain lock granularity trade-offs',
      question:
        'True or False: Finer-grained locks (row vs table) usually allow more concurrency but increase lock-management overhead.',
      correct: true,
      explanation:
        'Granularity trades concurrency for metadata/CPU overhead. Engines may escalate many fine locks into coarser ones.',
      whyWrong: {
        '1': 'False ignores a standard systems trade-off.',
      },
      interviewTakeaway: 'Granularity: concurrency ↔ overhead; mention escalation.',
    }),
    q({
      id: 'd2-m2-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Concurrency Control', 'Timestamp Ordering'],
      learningObjective: 'Describe basic timestamp ordering idea',
      question:
        'Under basic timestamp ordering, a write by Ti is rejected when:',
      options: [
        'Any other transaction exists',
        'A later-timestamp transaction has already read or written the item (violating timestamp order)',
        'Ti holds a shared lock',
        'The item is indexed',
      ],
      correctAnswer: 1,
      explanation:
        'T/O enforces an equivalent serial order by timestamps. Late writes that would scramble that order are rejected (and Ti typically aborts/restarts).',
      whyWrong: {
        '0': 'Concurrency is allowed when order is respected.',
        '2': 'T/O is not lock-based in the basic form.',
        '3': 'Indexes are irrelevant to the rejection rule.',
      },
      interviewTakeaway: 'Timestamp order ≈ assumed serial order; reject out-of-order ops.',
    }),
    q({
      id: 'd2-m2-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Optimistic Concurrency'],
      learningObjective: 'Outline OCC phases',
      question: 'Optimistic concurrency control typically:',
      options: [
        'Locks every row at read time exclusively',
        'Reads without locking, validates at commit, then writes if no conflict',
        'Never aborts transactions',
        'Requires single-threaded execution only',
      ],
      correctAnswer: 1,
      explanation:
        'OCC: read/compute optimistically, validate against concurrent writes, commit or abort. Good for low-contention workloads.',
      whyWrong: {
        '0': 'That is pessimistic locking.',
        '2': 'Validation failures abort/retry.',
        '3': 'OCC is for concurrent transactions.',
      },
      interviewTakeaway: 'OCC shines under low conflict; locks shine under high contention.',
    }),
  ],

  // ===== d2-m3 Isolation Levels & MVCC =====
  'd2-m3': [
    q({
      id: 'd2-m3-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Isolation Levels'],
      learningObjective: 'Define dirty read',
      question: 'A dirty read occurs when a transaction:',
      options: [
        'Reads only committed data',
        'Reads data written by another transaction that has not yet committed',
        'Reads the same committed row twice identically',
        'Uses a covering index',
      ],
      correctAnswer: 1,
      explanation:
        'Dirty reads see uncommitted writes that may roll back. READ UNCOMMITTED allows them; higher levels prevent them.',
      whyWrong: {
        '0': 'That avoids dirty reads.',
        '2': 'That describes a stable read, not dirty.',
        '3': 'Indexes are unrelated to the anomaly definition.',
      },
      interviewTakeaway: 'Dirty read = read uncommitted data.',
    }),
    tf({
      id: 'd2-m3-q02',
      difficulty: 'easy',
      topics: ['Isolation Levels'],
      learningObjective: 'Order common SQL isolation levels',
      question:
        'True or False: In the SQL standard progression, READ UNCOMMITTED is weaker than READ COMMITTED, which is weaker than REPEATABLE READ, which is weaker than SERIALIZABLE.',
      correct: true,
      explanation:
        'Each step up forbids more anomalies (with product-specific nuances, especially PostgreSQL/MySQL implementations).',
      whyWrong: {
        '1': 'False would scramble the standard ladder.',
      },
      interviewTakeaway: 'List the four levels in order — then note engine quirks.',
    }),
    q({
      id: 'd2-m3-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Isolation Levels'],
      learningObjective: 'Define non-repeatable read',
      question:
        'T1 reads a row, T2 commits an update to that row, T1 reads again and sees a different value. This is a:',
      options: ['Dirty read', 'Non-repeatable read', 'Phantom read only', 'Lost update only by definition'],
      correctAnswer: 1,
      explanation:
        'Non-repeatable (fuzzy) read: same row changes between reads because another transaction committed. Phantoms are about new/removed rows in a predicate result.',
      whyWrong: {
        '0': 'Dirty reads involve uncommitted data.',
        '2': 'Phantoms concern set membership under a predicate.',
        '3': 'Lost update is a different write-write hazard.',
      },
      interviewTakeaway: 'Same row changes ⇒ non-repeatable; new rows in range ⇒ phantom.',
    }),
    q({
      id: 'd2-m3-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Isolation Levels', 'Phantoms'],
      learningObjective: 'Define phantom reads',
      question:
        'T1 counts rows WHERE status = \'OPEN\' and gets 5. T2 inserts a new OPEN row and commits. T1 counts again and gets 6. This anomaly is a:',
      options: ['Dirty read', 'Phantom read', 'Write skew only', 'Checksum failure'],
      correctAnswer: 1,
      explanation:
        'Phantoms are predicate/range anomalies: the set of rows matching a condition changes due to inserts/deletes by others.',
      whyWrong: {
        '0': 'Both counts can be of committed data.',
        '2': 'Write skew is an MVCC/snapshot anomaly with concurrent writes.',
        '3': 'Not a storage checksum issue.',
      },
      interviewTakeaway: 'Phantoms need predicate/range locks or true serializability/SSI.',
    }),
    q({
      id: 'd2-m3-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['MVCC'],
      learningObjective: 'Explain MVCC readers vs writers',
      question:
        'Under MVCC, concurrent readers typically:',
      options: [
        'Always take exclusive locks on every row they read',
        'Read a snapshot version without blocking writers (subject to isolation rules)',
        'Disable the write-ahead log',
        'Force table scans only',
      ],
      correctAnswer: 1,
      explanation:
        'MVCC keeps multiple versions so readers see a consistent snapshot and writers create new versions. Isolation level still governs what snapshot/anomalies appear.',
      whyWrong: {
        '0': 'That is pessimistic read locking, not the MVCC benefit.',
        '2': 'WAL remains for durability.',
        '3': 'Access methods are independent of MVCC’s versioning idea.',
      },
      interviewTakeaway: 'MVCC: readers don’t block writers — then name isolation caveats.',
    }),
    tf({
      id: 'd2-m3-q06',
      difficulty: 'medium',
      topics: ['Isolation Levels', 'MVCC'],
      learningObjective: 'Note snapshot isolation vs serializability',
      question:
        'True or False: Snapshot isolation prevents many anomalies but can still allow write skew, so it is not identical to full serializability.',
      correct: true,
      explanation:
        'SI is widely used (and powerful) but write skew is the classic counterexample versus serializability. Some systems add SSI to detect dangerous dependency cycles.',
      whyWrong: {
        '1': 'False would oversell SI as serializable.',
      },
      interviewTakeaway: 'Say “SI ≠ serializable; watch write skew / SSI.”',
    }),
    q({
      id: 'd2-m3-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Isolation Levels', 'Write Skew'],
      learningObjective: 'Recognize write skew',
      question:
        'Two doctors on call: each transaction reads that at least one doctor is on call, then both set themselves off call and commit under snapshot isolation. What happened?',
      options: [
        'A dirty read of uncommitted data',
        'Write skew — each write was to a different row; the combined result violates the invariant',
        'A B+ tree split failure',
        'Mandatory cascading abort by 2PL',
      ],
      correctAnswer: 1,
      explanation:
        'Write skew: disjoint writes based on a shared predicate/invariant that neither transaction alone violated at write time, but together they did.',
      whyWrong: {
        '0': 'Both can read committed snapshots.',
        '2': 'Unrelated to index maintenance.',
        '3': 'This is an SI phenomenon, not a 2PL mandate.',
      },
      interviewTakeaway: 'Write skew example = on-call / constraints across rows.',
    }),
    q({
      id: 'd2-m3-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Isolation Levels'],
      learningObjective: 'Pick isolation for a correctness requirement',
      question:
        'A banking transfer must not observe intermediate balances from concurrent transfers and must avoid serialization anomalies. Which choice best matches the requirement in standard terms?',
      options: [
        'READ UNCOMMITTED',
        'READ COMMITTED only',
        'SERIALIZABLE (or equivalent conflict detection such as SSI)',
        'Turning off durability',
      ],
      correctAnswer: 2,
      explanation:
        'Financial invariants typically need serializable (or carefully proven weaker patterns with SELECT FOR UPDATE / constraints). Weaker levels allow anomalies.',
      whyWrong: {
        '0': 'Allows dirty reads — unacceptable here.',
        '1': 'Still allows non-repeatables/phantoms/skew depending on engine.',
        '3': 'Durability is orthogonal and should stay on for money.',
      },
      interviewTakeaway: 'Match isolation to invariants; default to safer for money, measure the cost.',
    }),
  ],

  // ===== d2-m4 Recovery, Replication & Scaling =====
  'd2-m4': [
    q({
      id: 'd2-m4-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['WAL', 'Recovery'],
      learningObjective: 'State WAL purpose',
      question: 'Write-ahead logging (WAL) primarily ensures that:',
      options: [
        'Indexes are never used',
        'Log records describing changes hit stable storage before the corresponding dirty data pages are required to be durable',
        'SQL text is encrypted at rest always',
        'All reads become sequential',
      ],
      correctAnswer: 1,
      explanation:
        'WAL/redo: log first, so crash recovery can redo committed work and undo uncommitted work. Exact flush rules follow ARIES-style protocols.',
      whyWrong: {
        '0': 'WAL does not disable indexes.',
        '2': 'Encryption is a separate control.',
        '3': 'I/O patterns vary.',
      },
      interviewTakeaway: 'WAL = log before data for crash restart.',
    }),
    tf({
      id: 'd2-m4-q02',
      difficulty: 'easy',
      topics: ['Replication'],
      learningObjective: 'Define primary-replica replication',
      question:
        'True or False: In primary–replica replication, the primary accepts writes and replicas apply changes to serve reads (and failover), with lag depending on sync mode.',
      correct: true,
      explanation:
        'Async replicas can lag; sync/quorum modes trade latency for stronger durability/visibility guarantees.',
      whyWrong: {
        '1': 'False would misstate a basic topology.',
      },
      interviewTakeaway: 'Call out replication lag and sync vs async explicitly.',
    }),
    q({
      id: 'd2-m4-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Partitioning', 'Sharding'],
      learningObjective: 'Define sharding',
      question: 'Sharding a database means:',
      options: [
        'Encrypting every column with a different key only',
        'Horizontally partitioning data across multiple nodes/instances',
        'Deleting indexes weekly',
        'Converting all tables to CSV',
      ],
      correctAnswer: 1,
      explanation:
        'Sharding splits rows (by key/range/hash) across shards for scale-out. It introduces cross-shard complexity for queries and transactions.',
      whyWrong: {
        '0': 'Encryption is not sharding.',
        '2': 'Index maintenance is unrelated.',
        '3': 'Export format is unrelated.',
      },
      interviewTakeaway: 'Shard = horizontal split; mention cross-shard pain.',
    }),
    q({
      id: 'd2-m4-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Recovery', 'Checkpoints'],
      learningObjective: 'Explain checkpoints',
      question: 'Checkpoints in a recovery system mainly:',
      options: [
        'Delete the schema',
        'Bound how far recovery must look back by recording a consistent progress mark',
        'Disable ACID',
        'Force all isolation levels to READ UNCOMMITTED',
      ],
      correctAnswer: 1,
      explanation:
        'Checkpoints truncate/advance recovery starting points so redo/undo need not scan unbounded history every crash.',
      whyWrong: {
        '0': 'Checkpoints do not drop schema.',
        '2': 'ACID remains.',
        '3': 'Isolation is unrelated.',
      },
      interviewTakeaway: 'Checkpoint = speed up restart by limiting log replay.',
    }),
    q({
      id: 'd2-m4-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['CAP'],
      learningObjective: 'State CAP trade-off carefully',
      question:
        'In a network partition, CAP reasoning says a system must choose between:',
      options: [
        'CPU and memory',
        'Linearizability-style consistency and availability for the partitioned operations',
        'SQL and indexes',
        'TCP and UDP',
      ],
      correctAnswer: 1,
      explanation:
        'During a partition, you cannot simultaneously provide full availability and strong consistency for conflicting updates. Modern phrasing emphasizes PACELC and concrete consistency models.',
      whyWrong: {
        '0': 'Resource sizing is not CAP.',
        '2': 'Query language ≠ CAP.',
        '3': 'Transport choice ≠ CAP.',
      },
      interviewTakeaway: 'CAP is about partition behavior; name the consistency model you mean.',
    }),
    tf({
      id: 'd2-m4-q06',
      difficulty: 'medium',
      topics: ['SQL vs NoSQL'],
      learningObjective: 'Avoid false dichotomy',
      question:
        'True or False: Many “NoSQL” systems still provide rich query models and tunable consistency; choosing SQL vs NoSQL should follow access patterns, consistency, and operational needs — not slogans.',
      correct: true,
      explanation:
        'Interview-ready answer: workload fit (transactions, joins, scale, latency), consistency, and team ops — engines blur categories.',
      whyWrong: {
        '1': 'False pushes a outdated binary myth.',
      },
      interviewTakeaway: 'Argue from requirements, not SQL-good/NoSQL-bad.',
    }),
    q({
      id: 'd2-m4-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Replication', 'Consistency'],
      learningObjective: 'Contrast sync replication trade-offs',
      question:
        'Synchronous replication to a quorum before ack to the client primarily improves which property at the cost of latency?',
      options: [
        'Client-perceived write durability / reduced data-loss window on primary failure',
        'CPU cache hit rate of the language runtime',
        'Elimination of the need for backups forever',
        'Automatic BCNF normalization',
      ],
      correctAnswer: 0,
      explanation:
        'Waiting for replicas/quorum reduces loss if the primary dies after ack. Cost is higher write latency and availability coupling to replica health.',
      whyWrong: {
        '1': 'Unrelated.',
        '2': 'Backups remain necessary for ops/error recovery.',
        '3': 'Replication ≠ normalization.',
      },
      interviewTakeaway: 'Sync/quorum writes: durability ↑, latency/availability coupling ↑.',
    }),
    q({
      id: 'd2-m4-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Sharding', 'Scaling'],
      learningObjective: 'Identify cross-shard transaction difficulty',
      question:
        'Why are multi-shard ACID transactions hard at scale?',
      options: [
        'Hashes cannot be computed for keys',
        'They need distributed coordination (e.g., 2PC/consensus) with failure and latency complexity',
        'Replicas cannot store bytes',
        'SQL forbids JOINs in all engines',
      ],
      correctAnswer: 1,
      explanation:
        'Atomic commit across shards requires protocols that handle crashes/partitions — slow and operationally complex. Designs often avoid cross-shard transactions.',
      whyWrong: {
        '0': 'Hashing is easy; distribution is hard.',
        '2': 'Replicas store data fine.',
        '3': 'SQL joins exist; cross-shard joins are the pain.',
      },
      interviewTakeaway: 'Prefer shard-local transactions; cite 2PC cost if cross-shard is required.',
    }),
  ],
}
