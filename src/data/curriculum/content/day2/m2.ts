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

export const m2Pages: StudyPage[] = [
  createPage(
    'd2-p5',
    'Locks: Shared and Exclusive',
    16,
    [
      'Describe shared (S) and exclusive (X) locks and the compatibility matrix',
      'Explain lock conversion, escalation, and intent locks at interview depth',
      'Connect locking to conflict serializability and anomalies prevented',
    ],
    {
      sections: [
        section('concept', 'WHAT — Lock-Based Concurrency Control', [
          p(
            'A lock is a concurrency-control token associated with a data item (row, page, table, key-range). Before accessing an item, a transaction must hold an appropriate lock. The lock manager grants or queues requests according to a compatibility matrix. Locks are the classic way to implement Isolation.',
          ),
          h3('Why locks exist'),
          p(
            'Without coordination, concurrent R/W creates dirty reads, lost updates, and non-serializable histories. Locks serialize conflicting accesses while allowing safe parallelism (e.g., multiple concurrent readers).',
          ),
          h3('Basic lock modes'),
          ul([
            'Shared (S) — read lock: many txns may hold S on the same item simultaneously',
            'Exclusive (X) — write lock: only one txn; no other S or X allowed',
          ]),
          table(
            ['', 'S (held)', 'X (held)'],
            [
              ['S (request)', 'Compatible', 'Conflict'],
              ['X (request)', 'Conflict', 'Conflict'],
            ],
            'Lock compatibility matrix',
          ),
          callout(
            'tip',
            'Memorize: readers share; writers exclude everyone. Almost every lock interview starts here.',
          ),
        ]),
        section('how', 'HOW — Lock Manager Behavior', [
          h3('Request / grant / wait'),
          ol([
            'Txn requests lock mode on item',
            'If compatible with all currently held locks → grant; else enqueue (wait)',
            'On release, wake compatible waiters (policy: FCFS to avoid starvation, or priority)',
          ]),
          h3('Lock conversion'),
          p(
            'Upgrade S→X when a reader wants to write (common pattern: read then update). Upgrades can deadlock if two txns hold S and both want X — classic upgrade deadlock.',
          ),
          h3('Lock granularity & escalation'),
          ul([
            'Finer locks (row) → more concurrency, more lock-manager overhead',
            'Coarser locks (table) → cheap, less concurrency',
            'Escalation: after too many row locks, promote to page/table lock to bound memory',
          ]),
          h3('Multi-granularity & intent locks (high level)'),
          p(
            'To lock a row safely while others lock tables, systems use intent locks: IS (intent shared), IX (intent exclusive), SIX, etc. Intent locks on ancestors signal "I have / will have finer locks below," allowing the lock manager to detect conflicts without scanning every row.',
          ),
          table(
            ['Mode', 'Meaning'],
            [
              ['IS', 'Intend to take S locks on finer grains'],
              ['IX', 'Intend to take X (or IX) on finer grains'],
              ['S', 'Shared on this grain (read whole object)'],
              ['X', 'Exclusive on this grain'],
              ['SIX', 'S + IX — read all + intend to modify some children'],
            ],
            'Common multi-granularity lock modes',
          ),
          diagram(
            `flowchart TD
  T[Table lock modes IS/IX/S/X]
  P[Page]
  R[Row S/X]
  T --> P --> R`,
            'Locks nest from coarse to fine; intent locks on the path',
          ),
          code(
            'sql',
            `-- Conceptual; syntax varies by engine
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR SHARE;   -- S lock (PG)
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;  -- X lock (PG)
UPDATE accounts SET balance = balance - 10 WHERE id = 1;
COMMIT; -- releases locks (under strict 2PL variants)`,
            'Explicit row locks in SQL when default isolation is not enough',
          ),
        ]),
        section('example', 'Worked Examples', [
          example('Compatible readers', [
            p('T1 and T2 both request S(X) → both granted. Parallel reads proceed.'),
          ]),
          example('Writer blocks readers', [
            p('T1 holds X(X). T2 requests S(X) → waits until T1 releases (typically at commit under strict 2PL).'),
          ]),
          example('Lost update without proper X locks', [
            p(
              'T1 and T2 both read balance=100, both write 100-10. Last writer wins → one debit lost. Correct pattern: X lock before read-modify-write (or atomic UPDATE / optimistic version check).',
            ),
          ]),
          numerical({
            title: 'Numerical — Who waits?',
            problem:
              'T1 holds S(A). T2 requests X(A). T3 requests S(A). Assume FCFS queue. Who gets the lock when T1 releases?',
            given: 'Compatibility + FCFS wait queue: T2 then T3.',
            formula: 'Grant next waiter if compatible with currently held locks.',
            steps:
              'While T1 holds S, T2(X) waits; T3(S) would be compatible with T1 but FCFS behind T2 → T3 also waits (to avoid bypassing T2 forever).\nT1 releases → T2 gets X.\nT3 waits until T2 releases, then gets S.',
            answer: 'T2 first (X), then T3 (S). T3 does not jump the queue.',
            shortcut: 'Writers in queue typically block new readers under fair policies.',
            mistake: 'Granting T3 immediately with T1 while T2 waits — causes writer starvation.',
          }),
        ]),
        section('tradeoffs', 'WHEN & TRADE-OFFS', [
          ul([
            'Locks: predictable conflict handling; risk of blocking and deadlocks',
            'Fine-grained: throughput under mixed workload; CPU/memory for lock table',
            'Coarse-grained: simpler, risk of hot-spot table locks',
            'MVCC (later) reduces read-write blocking but adds version maintenance',
          ]),
          callout(
            'warning',
            'Holding locks across external API calls is a production foot-gun — keep critical sections inside the DB transaction short.',
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Locking protocol (next: 2PL) determines serializability guarantees',
            'Deadlocks arise from circular wait on locks',
            'Isolation levels change which locks are taken for reads (e.g., predicate locks for SERIALIZABLE)',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "Shared vs exclusive locks?"'),
          p(
            'Strong answer: "S locks allow concurrent readers; X locks are mutually exclusive with both S and X for writers. Compatibility matrix: S-S yes, everything with X no."',
          ),
          p('Interviewer: "Why intent locks?"'),
          p(
            'Strong answer: "So we can lock a row without locking the whole table exclusively, while still detecting conflicts with someone locking the table. Intent modes mark the path from root to leaf."',
          ),
        ]),
      ],
      commonMistakes: [
        'Saying writers can share X locks',
        'Forgetting upgrade deadlocks (two S → both want X)',
        'Assuming SELECT always takes S locks — under MVCC READ COMMITTED, often no row S locks for plain reads',
        'Confusing OS mutexes with DB transactional locks',
      ],
      interviewQuestions: [
        'What is a shared lock?',
        'What is an exclusive lock?',
        'Draw the S/X compatibility matrix.',
        'What is lock escalation?',
        'Why can multiple transactions hold S locks together?',
      ],
      intermediateInterviewQuestions: [
        'What is a lock upgrade and how can it deadlock?',
        'Explain intent locks IS and IX.',
        'How does lock granularity affect throughput?',
        'What is writer starvation and how do queues help?',
        'Difference between FOR UPDATE and FOR SHARE in PostgreSQL?',
      ],
      advancedInterviewQuestions: [
        'How do key-range / next-key locks prevent phantoms?',
        'Explain SIX locks and when they are useful.',
        'How does the lock manager implement deadlock detection?',
        'Compare latch (short-term page latch) vs transactional lock.',
        'How do hierarchical locks interact with partition pruning / pruned partitions?',
        'Design a fair lock grant policy that avoids reader or writer starvation.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain shared and exclusive locks.',
          answer:
            'Shared locks are for reads and are compatible with other shared locks, enabling concurrent readers. Exclusive locks are for writes and conflict with both shared and exclusive locks, so only one writer — and no readers — can hold the item. The lock manager grants compatible requests and queues conflicts. Trade-off: locking prevents anomalies but introduces blocking and deadlocks; granularity and duration of locks are the main tuning knobs.',
        },
      ],
      keyTakeaways: [
        'S-S compatible; any X conflicts with S and X.',
        'Granularity trades concurrency vs overhead; intent locks make hierarchy work.',
        'Upgrade deadlocks are a classic trap.',
      ],
    },
  ),

  createPage(
    'd2-p6',
    'Two-Phase Locking (2PL)',
    18,
    [
      'Define growing and shrinking phases of 2PL',
      'Contrast basic, strict, and rigorous 2PL',
      'Relate 2PL to conflict serializability and cascading aborts',
    ],
    {
      sections: [
        section('concept', 'WHAT — The 2PL Protocol', [
          p(
            'Two-Phase Locking is a locking discipline: a transaction may not acquire any new lock after it has released even one lock. Life splits into a growing phase (acquire locks) and a shrinking phase (only release). This syntactic rule is enough to guarantee conflict serializability.',
          ),
          h3('Why it exists'),
          p(
            'Ad-hoc locking (lock/unlock anytime) can produce non-serializable schedules. 2PL gives a simple programmer/engine rule that yields acyclic precedence graphs.',
          ),
          diagram(
            `flowchart LR
  G[Growing phase: acquire locks only] --> P[Lock point]
  P --> S[Shrinking phase: release locks only]`,
            'The lock point separates the two phases',
          ),
        ]),
        section('how', 'HOW — Variants You Must Name', [
          h3('Basic 2PL'),
          p(
            'Follow growing/shrinking. May release locks before commit once shrinking starts. Guarantees conflict serializability but can allow cascading aborts (release write locks early; others may dirty-read).',
          ),
          h3('Strict 2PL'),
          p(
            'Hold all exclusive locks until commit/abort. Shared locks may be released earlier (depending on textbook variant — many systems hold them until commit too). Prevents dirty reads of this txn\'s writes → cascadeless/strict behavior for writes. Industry default mental model.',
          ),
          h3('Rigorous 2PL'),
          p(
            'Hold all locks (S and X) until commit/abort. Simplifies reasoning; commit order aligns cleanly with serialization order. Slightly less concurrency than releasing S early.',
          ),
          table(
            ['Variant', 'CS?', 'Holds X until end?', 'Holds S until end?', 'Cascading aborts?'],
            [
              ['Basic 2PL', 'Yes', 'No', 'No', 'Possible'],
              ['Strict 2PL', 'Yes', 'Yes', 'Optional/early OK in theory', 'Avoided for dirty reads'],
              ['Rigorous 2PL', 'Yes', 'Yes', 'Yes', 'Avoided'],
            ],
          ),
          callout(
            'tip',
            'Interview line: "2PL ⇒ conflict serializable. Converse false — some CS schedules are not 2PL." Strict 2PL also helps recoverability.',
          ),
          h3('Conservative (static) 2PL'),
          p(
            'Preclaim all needed locks before starting — growing phase first, atomically. Deadlock-free if acquisition is ordered, but requires knowing the read/write set ahead of time (often unrealistic).',
          ),
        ]),
        section('example', 'Worked Examples & Numericals', [
          example('Valid basic 2PL trace', [
            code(
              'text',
              `T1: L-S(X)  R(X)  L-X(Y)  W(Y)  U(X)  U(Y)  C
        |growing--------|  |shrink-|`,
              'After first unlock, T1 must not lock anything new',
            ),
          ]),
          example('Illegal 2PL (lock after unlock)', [
            code(
              'text',
              `T1: L-X(A) W(A) U(A) L-X(B) W(B)  -- illegal: lock after unlock`,
              'Violates two-phase rule even if somehow serializable',
            ),
          ]),
          numerical({
            title: 'Numerical — Is this 2PL?',
            problem:
              'T1 sequence: lock(X), read(X), lock(Y), write(Y), unlock(X), unlock(Y). T2: lock(X), write(X), unlock(X). Concurrent schedule interleaves T1.unlock(X) before T2.lock(X). Does each txn obey 2PL?',
            given: 'Per-txn lock timelines above.',
            formula: 'Per txn: no lock after an unlock.',
            steps:
              'T1: acquires X,Y then only unlocks → 2PL OK.\nT2: single lock/unlock → 2PL OK.\nWhether the global schedule is allowed depends on lock manager waits — T2 waits for X until T1 unlocks X.',
            answer: 'Both transactions obey 2PL.',
            shortcut: 'Check each txn\'s lock acquire/release sequence independently.',
            mistake: 'Judging 2PL from the interleaved global order instead of per-txn phases.',
          }),
          numerical({
            title: 'Numerical — Serialization order vs commit order',
            problem:
              'Under rigorous 2PL, why does commit order match a serial order?',
            given: 'All locks held until commit.',
            formula: 'Edges Ti→Tj in precedence graph imply Ti commits before Tj releases conflicts — actually Ti acquired conflicting lock first.',
            steps:
              'If Ti→Tj from a conflict, Ti accessed first while holding lock; Tj waited.\nTi must commit (and release) before Tj proceeds to that access.\nHence Ti commits before Tj — commit order extends serial order.',
            answer: 'Under rigorous 2PL, serialization order respects commit order.',
            shortcut: 'Rigorous 2PL ⇒ commit order = serial order.',
            mistake: 'Assuming the same for basic 2PL with early unlocks.',
          }),
        ]),
        section('tradeoffs', 'WHEN & TRADE-OFFS', [
          ul([
            '2PL is simple and proven, but blocking/deadlocks remain',
            'Strict/rigorous reduce concurrency vs basic 2PL early unlock',
            'Long transactions enlarge growing phase → more contention',
            'Alternatives: timestamp ordering, OCC, MVCC+SSI',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            '2PL ⇒ conflict serializability (sufficient condition)',
            'Strict 2PL ⇒ strict schedules (recoverability page)',
            'Deadlocks still possible under 2PL (unless conservative + ordered locks)',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "Does 2PL guarantee serializability?"'),
          p(
            'Strong answer: "Conflict serializability, yes. Growing then shrinking ensures the precedence graph is acyclic. It does not by itself prevent deadlocks, and basic 2PL may allow cascading aborts — use strict 2PL."',
          ),
          p('Interviewer: "Trade-off of rigorous vs basic?"'),
          p(
            'Strong answer: "Rigorous holds locks longer → less concurrency, simpler recovery and commit-order reasoning. Basic releases early → more concurrency, possible cascades."',
          ),
        ]),
      ],
      commonMistakes: [
        'Thinking 2PL prevents deadlocks (it does not)',
        'Confusing two-phase commit (2PC, distributed) with two-phase locking (2PL)',
        'Claiming every serializable schedule can be produced under 2PL',
        'Releasing X locks before commit and still calling it strict 2PL',
      ],
      interviewQuestions: [
        'What are the two phases in 2PL?',
        'What does 2PL guarantee?',
        'What is strict 2PL?',
        'What is rigorous 2PL?',
        'Does 2PL prevent deadlocks?',
      ],
      intermediateInterviewQuestions: [
        'Why does releasing locks early in basic 2PL risk cascading aborts?',
        'Sketch why 2PL implies an acyclic precedence graph.',
        'What is conservative 2PL?',
        'How is 2PL different from 2PC?',
        'When would you still need SERIALIZABLE isolation if you use row locks?',
      ],
      advancedInterviewQuestions: [
        'Is the converse true — every CS schedule allowed by some 2PL execution?',
        'How do predicate locks extend 2PL to prevent phantoms?',
        'Compare 2PL with timestamp-ordering protocols.',
        'How does deadlock frequency scale with lock duration under 2PL?',
        'Explain lock point and its relation to serialization order.',
        'Where does PostgreSQL deviate from pure textbook 2PL because of MVCC?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain two-phase locking.',
          answer:
            '2PL requires each transaction to acquire all the locks it will ever need before releasing any lock: a growing phase then a shrinking phase. That discipline guarantees conflict serializability. Strict 2PL keeps exclusive locks until commit to avoid dirty reads and cascading aborts; rigorous 2PL keeps all locks until commit. Trade-off: more lock holding time means less concurrency and more deadlocks, but stronger recovery and simpler reasoning. Note: 2PL ≠ two-phase commit.',
        },
      ],
      keyTakeaways: [
        'Growing then shrinking ⇒ conflict serializability.',
        'Strict/rigorous 2PL improve recoverability at concurrency cost.',
        '2PL ≠ 2PC; 2PL does not prevent deadlocks.',
      ],
    },
  ),

  createPage(
    'd2-p7',
    'Deadlocks in Databases',
    16,
    [
      'Explain deadlock prevention vs detection vs avoidance in DB context',
      'Use wait-for graphs to detect deadlocks',
      'Describe victim selection, timeouts, and retry strategies',
    ],
    {
      sections: [
        section('concept', 'WHAT — Deadlock', [
          p(
            'A deadlock is a circular wait: T1 waits for a lock held by T2, T2 waits for a lock held by T1 (generalize to cycles of many txns). None can proceed. Databases must detect or prevent this; leaving it to operators is not acceptable.',
          ),
          h3('Four Coffman conditions (OS classic, still useful)'),
          ul([
            'Mutual exclusion — locks are exclusive when conflicting',
            'Hold and wait — hold locks while requesting more',
            'No preemption — cannot casually steal a lock without abort',
            'Circular wait — cycle in wait-for graph',
          ]),
          diagram(
            `flowchart LR
  T1 -->|waits for lock held by| T2
  T2 -->|waits for lock held by| T1`,
            'Simplest deadlock cycle',
          ),
        ]),
        section('how', 'HOW — Prevention, Avoidance, Detection', [
          h3('Timeouts (practical prevention/detection hybrid)'),
          p(
            'If a lock wait exceeds a threshold, abort the waiter (or holder, depending on policy). Simple, may abort false positives under load.',
          ),
          h3('Wait-for graph detection'),
          ol([
            'Node per active txn',
            'Edge Ti → Tj if Ti waits for a lock held by Tj',
            'Periodically (or on each wait) check for cycles',
            'On cycle: choose a victim txn to abort, release its locks, retry later',
          ]),
          h3('Victim selection criteria'),
          ul([
            'Youngest txn / least work done (cheapest to undo)',
            'Fewest locks / least progress',
            'Avoid aborting the same txn repeatedly (starvation) — use retry counters',
          ]),
          h3('Prevention via ordering'),
          p(
            'Lock items in a global order (e.g., by primary key ascending) so cycles cannot form. Useful in application-level locking. Wound-wait / wait-die use timestamps: older txns wound (abort) younger holders, or younger dies when waiting on older — prevents cycles.',
          ),
          table(
            ['Strategy', 'Idea', 'Pros', 'Cons'],
            [
              ['Detection + victim', 'Find cycles, abort one', 'High concurrency until deadlock', 'Abort/retry cost'],
              ['Lock timeout', 'Abort long waiters', 'Simple', 'False positives'],
              ['Wait-die / wound-wait', 'Timestamp priority', 'No cycles', 'More aborts'],
              ['Ordered locking', 'Acquire in key order', 'No deadlocks', 'App discipline / may hold longer'],
            ],
          ),
        ]),
        section('example', 'Worked Numericals', [
          numerical({
            title: 'Numerical 1 — Draw wait-for graph',
            problem:
              'T1 holds X(A), waits for X(B). T2 holds X(B), waits for X(A). Deadlock?',
            given: 'Two txns, crossed locks.',
            formula: 'Cycle in wait-for graph.',
            steps:
              'Edges: T1→T2 (waits on B), T2→T1 (waits on A). Cycle.',
            answer: 'Yes — deadlock. Abort T1 or T2.',
            shortcut: 'Crossed pair of X locks is the textbook deadlock.',
            mistake: 'Calling it a precedence-graph serializability issue — different graph.',
          }),
          numerical({
            title: 'Numerical 2 — Three-way cycle',
            problem:
              'T1 waits for T2, T2 waits for T3, T3 waits for T1. T4 waits for T2. Who is in deadlock? Whom abort?',
            given: 'Wait-for edges as stated.',
            formula: 'Nodes on a cycle are deadlocked; break cycle by one victim.',
            steps:
              'Cycle T1-T2-T3. T4 waits on T2 but is not on a cycle yet — blocked by deadlock but not causing a second cycle.\nAbort any one of T1,T2,T3; preferably least cost. T4 may proceed after.',
            answer: 'Deadlock set {T1,T2,T3}; abort one of them. T4 is waiting, not in cycle.',
            shortcut: 'Only cycle participants need a victim; others may be collateral waiters.',
            mistake: 'Aborting T4 — does not break the cycle.',
          }),
          numerical({
            title: 'Numerical 3 — Wait-die',
            problem:
              'TS(T1)=10 (older), TS(T2)=20. T2 holds X(A). T1 requests A. Under wait-die, what happens? If roles reversed?',
            given: 'Wait-die: older waits; younger dies.',
            formula:
              'Wait-die: if requester older than holder → wait; if younger → abort requester.',
            steps:
              'T1 older requests lock held by T2 younger → T1 waits.\nIf T2 requests lock held by T1 → T2 (younger) aborts/retries.',
            answer: 'T1 waits; reverse case T2 dies (aborts).',
            shortcut: 'Wait-die: younger never waits for older — dies instead.',
            mistake: 'Swapping wait-die with wound-wait rules.',
          }),
          example('Application-level ordered locks', [
            code(
              'sql',
              `-- Always lock accounts in ascending id order to transfer
BEGIN;
SELECT * FROM accounts WHERE id IN (3,7) ORDER BY id FOR UPDATE;
-- lock id=3 then id=7 consistently across txns
UPDATE ...;
COMMIT;`,
              'Global lock order prevents cyclic waits on account pairs',
            ),
          ]),
        ]),
        section('tradeoffs', 'WHEN & TRADE-OFFS', [
          ul([
            'Detection maximizes concurrency but pays abort/retry under contention',
            'Prevention aborts earlier / restricts wait → fewer stuck cycles, more artificial failures',
            'Timeouts need tuning: too low → spurious aborts; too high → stuck longer',
            'OLTP hot rows (e.g., single counter) deadlock/lock-wait hotspots — redesign (queue, sharding, atomic update)',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Wait-for graph ≠ precedence (serialization) graph — do not confuse in exams',
            'Victim abort → transaction Failed/Aborted lifecycle; client should retry',
            'MVCC reduces read-write deadlocks but write-write deadlocks remain',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "How does a database detect deadlocks?"'),
          p(
            'Strong answer: "Maintain a wait-for graph: edge from waiter to holder. On waits or periodically, detect cycles. Abort a victim to break the cycle, undo its work, release locks, and let the client retry."',
          ),
          p('Interviewer: "How do you choose the victim?"'),
          p(
            'Strong answer: "Minimize wasted work — abort the txn with least progress or youngest — and ensure fairness so one txn is not repeatedly chosen."',
          ),
        ]),
      ],
      commonMistakes: [
        'Confusing wait-for graphs with precedence graphs',
        'Thinking 2PL eliminates deadlocks',
        'Retrying forever without backoff after deadlock aborts',
        'Locking rows in inconsistent orders in application code',
      ],
      interviewQuestions: [
        'What is a deadlock in a database?',
        'What is a wait-for graph?',
        'How can deadlocks be detected?',
        'Name one deadlock prevention technique.',
        'What happens to the victim transaction?',
      ],
      intermediateInterviewQuestions: [
        'Contrast wait-die and wound-wait.',
        'Why can timeouts cause false-positive aborts?',
        'How does ordered locking prevent deadlocks?',
        'What criteria are used for victim selection?',
        'Can read-only transactions deadlock under pure locking?',
      ],
      advancedInterviewQuestions: [
        'How do deadlock detectors handle locks with multiple holders (S locks)?',
        'Explain deadlock probability vs number of locks held (rule of thumb).',
        'How do distributed deadlocks differ (Phantom deadlocks, edge chasing)?',
        'Design an idempotent retry strategy after deadlock_aborted SQLSTATE.',
        'How does PostgreSQL report and log deadlocks?',
        'When is it better to redesign schema/hotspot than tune deadlock settings?',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do you handle deadlocks in a database system?',
          answer:
            'Deadlocks are circular waits on locks. Engines typically detect them with a wait-for graph and abort a victim transaction to break the cycle, or use lock wait timeouts. Prevention schemes like wait-die/wound-wait or global lock ordering avoid cycles. On the application side, keep transactions short, access resources in a consistent order, and retry aborted transactions with backoff and idempotency. Trade-off: detection allows more concurrency until a deadlock; prevention aborts earlier or restricts waiting.',
        },
      ],
      keyTakeaways: [
        'Cycle in wait-for graph = deadlock.',
        'Abort a victim; design client retries.',
        'Do not confuse wait-for graphs with serialization precedence graphs.',
      ],
    },
  ),
]
