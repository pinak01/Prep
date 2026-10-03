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

export const m3Pages: StudyPage[] = [
  createPage(
    'd2-p8',
    'Read Anomalies',
    18,
    [
      'Define dirty reads, non-repeatable reads, and phantom reads',
      'Give concrete SQL scenarios for each anomaly',
      'Relate anomalies to what isolation levels must prevent',
    ],
    {
      sections: [
        section('concept', 'WHAT — Concurrency Anomalies', [
          p(
            'Anomalies are undesirable phenomena when transactions interleave under weak isolation. Interviews expect precise definitions plus a SQL story you can whiteboard in under a minute. The classic trio: dirty read, non-repeatable (fuzzy) read, phantom read. Also know lost update as a write anomaly.',
          ),
          h3('Why it matters'),
          p(
            'Product bugs in booking, inventory, and finance often are isolation bugs mislabeled as "race conditions." Naming the anomaly tells you which isolation level or locking pattern fixes it.',
          ),
          table(
            ['Anomaly', 'Core idea', 'Writer state'],
            [
              [
                'Dirty read',
                'Read data written by a txn that has not committed (and may abort)',
                'Uncommitted',
              ],
              [
                'Non-repeatable read',
                'Re-read same row; value changed because another txn committed an update/delete',
                'Committed update/delete',
              ],
              [
                'Phantom read',
                'Re-run a range/predicate query; set of rows changes due to committed inserts/deletes matching predicate',
                'Committed insert/delete in range',
              ],
            ],
          ),
          callout(
            'tip',
            'Non-repeatable = same row identity, different values. Phantom = different membership of a result set (new/missing rows). This distinction is the #1 exam trap.',
            'Row vs set',
          ),
        ]),
        section('how', 'HOW — SQL Scenarios', [
          h3('Dirty read'),
          code(
            'sql',
            `-- Session T1                          -- Session T2 (READ UNCOMMITTED)
BEGIN;                                   BEGIN;
UPDATE accounts SET balance = 0
  WHERE id = 1; -- not committed
                                         SELECT balance FROM accounts WHERE id = 1;
                                         -- sees 0 (dirty)
ROLLBACK; -- restores old balance
                                         -- T2 already acted on falsehood`,
            'Dirty read: T2 saw uncommitted data that disappeared',
          ),
          h3('Non-repeatable read'),
          code(
            'sql',
            `-- T1                                   -- T2
BEGIN;                                   BEGIN;
SELECT balance FROM accounts WHERE id=1;
-- returns 100
                                         UPDATE accounts SET balance=50 WHERE id=1;
                                         COMMIT;
SELECT balance FROM accounts WHERE id=1;
-- returns 50 (same row, new value)
COMMIT;`,
            'Non-repeatable: committed update changes a row you already read',
          ),
          h3('Phantom read'),
          code(
            'sql',
            `-- T1                                   -- T2
BEGIN;                                   BEGIN;
SELECT COUNT(*) FROM orders
  WHERE status = 'NEW';
-- returns 4
                                         INSERT INTO orders(status) VALUES ('NEW');
                                         COMMIT;
SELECT COUNT(*) FROM orders
  WHERE status = 'NEW';
-- returns 5 (new row in predicate)
COMMIT;`,
            'Phantom: predicate result membership changed',
          ),
          h3('Lost update (write anomaly)'),
          code(
            'sql',
            `-- Both read 100, both write 90 — one decrement lost
-- Fix: single UPDATE balance = balance - 10,
-- SELECT FOR UPDATE, or optimistic version column`,
            'Lost update is often grouped with isolation discussions',
          ),
          diagram(
            `flowchart TD
  DR[Dirty read] -->|prevent with| RC[READ COMMITTED+]
  NRR[Non-repeatable] -->|prevent with| RR[REPEATABLE READ / SI]
  PH[Phantom] -->|prevent with| SER[SERIALIZABLE / range locks / SSI]`,
            'Which anomaly disappears as isolation strengthens (ANSI intuition)',
          ),
        ]),
        section('example', 'More Scenarios & Numerical Reasoning', [
          example('Write skew (advanced anomaly under SI)', [
            p(
              'Doctors on call: constraint "at least one on duty." T1 and T2 each see two on duty, each sets themselves off duty, both commit → zero on duty. Neither updated the other\'s row — Snapshot Isolation allows this. Fix: SERIALIZABLE / explicit locks / constraints materializing the conflict.',
            ),
          ]),
          numerical({
            title: 'Numerical — Name the anomaly',
            problem:
              'T1 reads sum of all rows where dept=5 as 1000. T2 inserts a new emp in dept=5 and commits. T1 re-reads sum as 1200. Which anomaly?',
            given: 'Aggregate over a predicate changes due to insert.',
            formula: 'Phantom vs non-repeatable classification.',
            steps:
              'New row entered the predicate set — not an update to a previously read row identity.\nThis is a phantom read (predicate / range anomaly).',
            answer: 'Phantom read.',
            shortcut: 'Insert/delete matching WHERE → phantom; update existing row → non-repeatable.',
            mistake: 'Calling every inconsistent re-read a dirty read.',
          }),
          numerical({
            title: 'Numerical — Dirty or not?',
            problem:
              'T1 updates row; T2 reads new value; T1 commits. Is T2\'s read dirty?',
            given: 'Read happened before T1 commit.',
            formula: 'Dirty = read uncommitted data.',
            steps:
              'At read time T1 had not committed ⇒ dirty read.\nEven though T1 later commits, the read was dirty at the time (and if T1 had aborted, T2 would have been wrong).',
            answer: 'Yes — dirty read (recoverability also at risk if T2 commits first).',
            shortcut: 'Dirtyness is about writer state at read time, not eventual commit.',
            mistake: 'Saying it is fine because T1 eventually committed.',
          }),
        ]),
        section('tradeoffs', 'WHEN & TRADE-OFFS', [
          ul([
            'Preventing all anomalies (true serializability) costs latency/aborts',
            'Many apps tolerate non-repeatable reads for read-mostly paths',
            'Phantoms matter for range integrity (unique booking slots, quotas)',
            'Always ask: what invariant breaks if this anomaly occurs?',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Next page maps anomalies → isolation levels',
            'MVCC prevents dirty reads naturally; phantoms need extra work',
            'Recoverability page: dirty reads + early commit = disaster',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "Difference between non-repeatable and phantom?"'),
          p(
            'Strong answer: "Non-repeatable is the same row changing values due to a committed update/delete. Phantom is the set of rows matching a predicate changing due to committed inserts/deletes. Fixes differ: row version stability vs predicate/range locks or SSI."',
          ),
        ]),
      ],
      commonMistakes: [
        'Swapping phantom and non-repeatable definitions',
        'Calling any race a dirty read',
        'Forgetting lost update and write skew',
        'Assuming REPEATABLE READ always blocks phantoms (MySQL InnoDB history differs from ANSI naming)',
      ],
      interviewQuestions: [
        'What is a dirty read?',
        'What is a non-repeatable read?',
        'What is a phantom read?',
        'Give a SQL example of a phantom.',
        'What is a lost update?',
      ],
      intermediateInterviewQuestions: [
        'How do you prevent lost updates without SERIALIZABLE?',
        'Why are phantoms harder to prevent than non-repeatable reads?',
        'Explain write skew with an example.',
        'Can a read-only transaction observe phantoms?',
        'How does SELECT FOR UPDATE change anomaly exposure?',
      ],
      advancedInterviewQuestions: [
        'How does InnoDB next-key locking prevent phantoms?',
        'Why can Snapshot Isolation still allow write skew?',
        'Map each anomaly to ANSI SQL isolation definitions carefully.',
        'How would you demonstrate anomalies in two psql sessions in an interview?',
        'Which anomalies matter for an idempotent event-sourced ledger?',
        'Contrast fuzzy read terminology with ANSI non-repeatable read.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain dirty, non-repeatable, and phantom reads with examples.',
          answer:
            'Dirty read: you read another transaction\'s uncommitted write that might roll back — e.g., see a balance updated in an open txn. Non-repeatable read: you read a committed row twice and a committed UPDATE/DELETE changed it in between. Phantom: you re-evaluate a predicate/range and committed INSERTs/DELETEs change which rows match — e.g., COUNT of open orders changes. Trade-off: blocking these needs stronger isolation or explicit locks, costing throughput.',
        },
      ],
      keyTakeaways: [
        'Dirty = uncommitted; non-repeatable = row changed; phantom = set changed.',
        'Always accompany definitions with a two-session SQL story.',
        'Know lost update and write skew beyond the classic three.',
      ],
    },
  ),

  createPage(
    'd2-p9',
    'Isolation Levels',
    22,
    [
      'Map READ UNCOMMITTED → SERIALIZABLE to anomalies prevented',
      'Work write skew (on-call doctors) and contrast it with lost update',
      'Explain PG SSI vs InnoDB RR mechanisms at interview depth',
      'Choose levels with performance vs correctness trade-offs',
    ],
    {
      sections: [
        section('concept', 'WHAT — Isolation Levels', [
          p(
            'SQL standard isolation levels are a menu of guarantees weaker than full serializability, letting you trade correctness phenomena for performance. You must know both the ANSI anomaly table and the caveat that real engines implement levels differently (especially REPEATABLE READ vs phantoms and Snapshot Isolation vs SERIALIZABLE).',
          ),
          table(
            ['Level', 'Dirty read', 'Non-repeatable', 'Phantom', 'Write skew (SI)'],
            [
              ['READ UNCOMMITTED', 'Possible', 'Possible', 'Possible', 'Possible'],
              ['READ COMMITTED', 'No', 'Possible', 'Possible', 'Possible'],
              ['REPEATABLE READ / SI*', 'No', 'No', 'Engine*', 'Often yes under SI'],
              ['SERIALIZABLE', 'No', 'No', 'No', 'No (goal)'],
            ],
            'ANSI + SI caveat (*PG RR ≈ SI; InnoDB RR uses next-key locks)',
          ),
          callout(
            'warning',
            'PostgreSQL REPEATABLE READ is snapshot isolation: stable row versions, but write skew / serialization anomalies remain. PostgreSQL SERIALIZABLE uses SSI (aborts dangerous dependency patterns). MySQL InnoDB REPEATABLE READ uses MVCC + next-key locks and often prevents phantoms in practice — different mechanism, same name. Always qualify by engine.',
            'Engine caveats',
          ),
        ]),
        section('how', 'HOW — What Engines Actually Do', [
          h3('READ UNCOMMITTED'),
          p('Allow dirty reads. Rarely used in Postgres (treated like RC). Sometimes used for approximate analytics on other engines.'),
          h3('READ COMMITTED'),
          p(
            'Each statement sees only committed data; successive statements in one txn may see different committed versions. Default in PostgreSQL and Oracle. Good OLTP default when you do not need repeatable reads.',
          ),
          h3('REPEATABLE READ / Snapshot Isolation'),
          p(
            'Transaction sees a stable snapshot (MVCC) so previously read row versions do not change mid-txn. Concurrent inserts and multi-row invariants are the subtle part — SI is not full serializability.',
          ),
          h3('SERIALIZABLE'),
          p(
            'Emulates serial execution. Implementations: strict 2PL + predicate/gap locks, or Serializable Snapshot Isolation (SSI) detecting dangerous rw-dependency structures and aborting one txn. Highest abort/latency cost under contention.',
          ),
          h3('Postgres SSI vs InnoDB RR (must-know contrast)'),
          table(
            ['Topic', 'PostgreSQL', 'MySQL InnoDB'],
            [
              ['Default', 'READ COMMITTED', 'REPEATABLE READ'],
              ['RR meaning', 'Snapshot Isolation (MVCC snapshot)', 'MVCC + next-key / gap locks on reads that lock'],
              ['Phantoms at RR', 'Still possible under SI; SSI needed for full guarantee', 'Next-key locking often blocks phantoms for locking reads'],
              ['Write skew at RR/SI', 'Possible under RR; SERIALIZABLE/SSI aborts', 'Often prevented when predicates are locked; still reason carefully'],
              ['SERIALIZABLE', 'SSI — optimistic, abort on anomaly', 'Typically stricter locking'],
            ],
            'Same SQL names ≠ same implementation',
          ),
          code(
            'sql',
            `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- critical invariant work
COMMIT;`,
            'Per-transaction isolation selection',
          ),
        ]),
        section('writeskew', 'Worked — Write Skew vs Lost Update', [
          h3('Lost update (same row)'),
          p(
            'Two txns read the same row version, each compute a new value, each write — last writer wins and one increment/decrement vanishes. Classic fix: atomic `UPDATE … SET bal = bal - 10`, `SELECT FOR UPDATE`, or optimistic version column. Lost update is a write-write conflict on one item.',
          ),
          code(
            'sql',
            `-- Lost update shape (both read 100, both write 90)
-- T1: READ bal=100; T2: READ bal=100;
-- T1: WRITE 90; T2: WRITE 90; -- one decrement lost
-- Fix: UPDATE accounts SET bal = bal - 10 WHERE id = 1;`,
            'Lost update: concurrent read-modify-write on ONE row',
          ),
          h3('Write skew (different rows, one invariant)'),
          p(
            'Write skew: each txn reads a set, writes a disjoint row, and together they break a multi-row constraint — even though there is no write-write conflict on the same row. Snapshot Isolation famously allows this.',
          ),
          example('On-call doctors (the interview example)', [
            p(
              'Constraint: at least one doctor on duty. Rows: Alice.on_duty=true, Bob.on_duty=true.',
            ),
            code(
              'sql',
              `-- Both run under Snapshot Isolation / PG REPEATABLE READ
-- T1: SELECT * FROM doctors WHERE on_duty;  -- sees Alice, Bob
-- T2: SELECT * FROM doctors WHERE on_duty;  -- sees Alice, Bob
-- T1: UPDATE doctors SET on_duty=false WHERE name='Alice'; COMMIT;
-- T2: UPDATE doctors SET on_duty=false WHERE name='Bob';   COMMIT;
-- Result: zero on duty — invariant broken. Neither updated the other's row.`,
              'Write skew: disjoint writes, shared predicate invariant',
            ),
            p(
              'Fixes: SERIALIZABLE (PG SSI aborts one), materialize the conflict (`UPDATE duty_count …`, lock a duty table row), or `SELECT … FOR UPDATE` on all on-duty rows before changing.',
            ),
          ]),
          table(
            ['', 'Lost update', 'Write skew'],
            [
              ['Rows written', 'Same row', 'Different rows'],
              ['Conflict type', 'WW on one item', 'Often only RW dependencies on a predicate/set'],
              ['SI / PG RR', 'May still happen on naive RMW; row-level WW often detected on update', 'Allowed — famous SI anomaly'],
              ['Typical fix', 'Atomic UPDATE / FOR UPDATE / version', 'SERIALIZABLE/SSI, lock predicate set, or constraint row'],
            ],
            'Interview discriminator table',
          ),
          numerical({
            title: 'Numerical — Name the bug',
            problem:
              'Invariant: sum(on_duty) ≥ 1 across N doctors. Two concurrent SI txns each see sum=2, each flips a different doctor to off, both commit. Lost update or write skew?',
            given: 'Disjoint row writes; multi-row invariant broken.',
            formula: 'Same-row WW ⇒ lost update; disjoint writes + set invariant ⇒ write skew.',
            steps:
              'No two writers updated the same primary key.\nEach write was legal on its snapshot.\nCombined committed state violates sum≥1.\n⇒ write skew under SI.',
            answer: 'Write skew (not lost update).',
            shortcut: 'If keys differ and a SET constraint breaks, say write skew.',
            mistake: 'Calling every race a lost update.',
          }),
        ]),
        section('example', 'Choosing Levels', [
          example('Inventory reservation', [
            p(
              'Need: no oversell on ONE stock row. READ COMMITTED + SELECT FOR UPDATE, or atomic UPDATE … WHERE stock >= n, or SERIALIZABLE. Plain RC SELECT then UPDATE without locks can lose updates. This is usually lost-update territory, not write skew.',
            ),
          ]),
          example('Reporting query inside a txn', [
            p(
              'Long analytics SELECT under RC may see changing committed data mid-report. Use RR/snapshot or a read replica with a single consistent snapshot export.',
            ),
          ]),
          numerical({
            title: 'Numerical — Minimum level',
            problem:
              'Requirement: never read uncommitted data; OK if a row changes between two reads in one txn. Minimum ANSI level?',
            given: 'Allow non-repeatable; forbid dirty.',
            formula: 'ANSI table.',
            steps: 'Forbid dirty ⇒ at least READ COMMITTED. Non-repeatable allowed ⇒ RC suffices.',
            answer: 'READ COMMITTED.',
            shortcut: 'Dirty-free floor is RC.',
            mistake: 'Jumping to SERIALIZABLE for every requirement.',
          }),
        ]),
        section('tradeoffs', 'TRADE-OFFS', [
          ul([
            'Stronger isolation → more locks / more SSI aborts → lower throughput',
            'Weaker isolation → more app-level invariants to enforce',
            'Raising global default to SERIALIZABLE can surprise latency SLOs — prefer surgical use on invariant-critical txns',
            'Idempotency and constraints complement isolation; do not rely on isolation alone for all business rules',
            'PG SSI: watch serialization_failure rates; retry safely',
            'InnoDB RR: gap locks can block concurrent inserts — throughput trade-off for phantom control',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Anomalies page defines dirty / fuzzy / phantom; this page maps levels + SI extras',
            'MVCC is the substrate for RC/RR snapshots; SSI adds conflict detection on top',
            '2PL SERIALIZABLE vs SSI SERIALIZABLE — different mechanisms, same goal',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Why? → “Why not always SERIALIZABLE?” → Aborts/locks hurt p99; most OLTP invariants are local and cheaper with RC + careful writes.'),
          p('How? → “How does PG SERIALIZABLE work?” → SSI tracks rw-dependencies; aborts on dangerous structures instead of locking everything.'),
          p('DS? → “What do you monitor?” → serialization_failure / deadlock rates, lock waits, retry storms.'),
          p('Tradeoff? → “PG RR vs InnoDB RR?” → SI (write skew possible) vs next-key locking (more blocking, fewer phantoms).'),
          p('Always? → “Does RR prevent write skew?” → Not under Snapshot Isolation / Postgres RR — need SERIALIZABLE or explicit locks.'),
          p('Discriminator: “Lost update or write skew?” → Same row WW vs disjoint writes breaking a set invariant.'),
          p('Doctors follow-up: “Show the SQL interleaving” → both SELECT on_duty, each UPDATE self off, both COMMIT.'),
        ]),
      ],
      commonMistakes: [
        'Memorizing ANSI table without engine caveats',
        'Assuming SERIALIZABLE is free',
        'Confusing statement-level vs transaction-level snapshots under RC',
        'Thinking RC prevents lost updates automatically',
        'Calling write skew a lost update',
        'Assuming Postgres RR ≡ InnoDB RR ≡ ANSI RR',
      ],
      interviewQuestions: [
        'List the four SQL isolation levels.',
        'Which anomalies does READ COMMITTED prevent?',
        'What is the default isolation in PostgreSQL?',
        'Why choose REPEATABLE READ?',
        'What does SERIALIZABLE guarantee?',
        'What is write skew?',
      ],
      intermediateInterviewQuestions: [
        'How does Oracle\'s READ COMMITTED differ from locking RC?',
        'Why might MySQL RR behave differently from Postgres RR?',
        'When is READ UNCOMMITTED acceptable?',
        'How do you set isolation for a single transaction?',
        'Does RC prevent lost updates on UPDATE balance = balance - 10?',
        'Contrast lost update vs write skew with examples.',
      ],
      advancedInterviewQuestions: [
        'Explain SSI at a high level and when it aborts.',
        'How does READ COMMITTED SNAPSHOT in SQL Server differ from locking RC?',
        'Design a policy: which endpoints use SERIALIZABLE in a booking service?',
        'Relate isolation levels to CAP/consistency models carefully (without conflating).',
        'How do secondary indexes and range scans interact with RR locking in InnoDB?',
        'What instrumentation shows serialization failure rates in production?',
        'Work the on-call doctors write-skew interleaving and three distinct fixes.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain isolation levels and when you use each.',
          answer:
            'READ UNCOMMITTED allows dirty reads — almost never wanted. READ COMMITTED, the common default, only sees committed data but values can change between statements — great for short OLTP updates. REPEATABLE READ / snapshots keep row versions stable for the transaction — good for multi-step reads, but under Snapshot Isolation write skew remains. SERIALIZABLE prevents phantoms and serialization anomalies by locks or SSI, at the cost of latency and aborts. I pick the weakest level that preserves the specific invariant, and use row locks or atomic UPDATEs when a full isolation bump is overkill.',
        },
        {
          question: 'Explain write skew and how it differs from lost update.',
          answer:
            'Lost update is concurrent read-modify-write on the same row so one write overwrites the other — fix with atomic UPDATE, FOR UPDATE, or versions. Write skew is when transactions read a shared predicate/set, write different rows, and together break a multi-row invariant — the classic on-call doctors example under Snapshot Isolation. There is no WW conflict on one key, so SI allows it. Fixes: PostgreSQL SERIALIZABLE (SSI), locking all rows in the predicate, or materializing a conflict row/constraint that serializes the decision.',
        },
        {
          question: 'Postgres RR vs InnoDB RR — what do you say in an interview?',
          answer:
            'Names match; mechanisms differ. Postgres REPEATABLE READ is Snapshot Isolation: great for stable reads, but write skew is possible; true serializability needs ISOLATION LEVEL SERIALIZABLE (SSI) with retries on serialization_failure. InnoDB REPEATABLE READ combines MVCC with next-key/gap locking for locking reads, which often prevents phantoms but introduces more blocking. I never claim “RR” without naming the engine.',
        },
      ],
      keyTakeaways: [
        'Know the ANSI anomaly matrix and major engine defaults.',
        'RC ≠ protection against lost updates without careful writes.',
        'Write skew ≠ lost update — doctors example under SI.',
        'PG RR ≈ SI; PG SERIALIZABLE = SSI; InnoDB RR ≠ PG RR.',
      ],
    },
  ),

  createPage(
    'd2-p10',
    'MVCC',
    18,
    [
      'Explain how multi-version concurrency control works conceptually',
      'Relate snapshots, version chains, and visibility rules',
      'Compare locking vs MVCC approaches and vacuum/purge costs',
    ],
    {
      sections: [
        section('concept', 'WHAT — Multi-Version Concurrency Control', [
          p(
            'MVCC keeps multiple versions of a row so readers can see a consistent snapshot without taking blocking read locks on writers (and vice versa, for many cases). Writers create new versions; old versions remain until no transaction needs them. PostgreSQL, Oracle, InnoDB (to a degree), and many systems use MVCC variants.',
          ),
          h3('Why it exists'),
          p(
            'Under pure locking, long reads block writes or vice versa. MVCC enables high read concurrency: readers do not wait for writers (except for rare cases), and writers do not wait for readers — write-write conflicts still need resolution.',
          ),
          diagram(
            `flowchart LR
  R1[Row v1 xmin=10 xmax=25]
  R2[Row v2 xmin=25 xmax=NULL]
  R1 -->|update by T25| R2
  Snap[Snapshot as of T20] --> R1`,
            'Readers on older snapshots keep seeing v1 while v2 is current',
          ),
        ]),
        section('how', 'HOW — Snapshots and Visibility', [
          h3('Version metadata (Postgres-shaped intuition)'),
          ul([
            'xmin — creating transaction ID',
            'xmax — deleting/updating transaction ID (or unset)',
            'Visibility: a version is visible if creating txn committed (and was in snapshot) and deleting txn is not considered committed for that snapshot',
          ]),
          h3('Snapshots'),
          p(
            'At snapshot time, the engine records which XIDs are committed/in-progress. Visibility checks use that freeze-frame so the transaction sees a stable database for REPEATABLE READ / SERIALIZABLE, or a per-statement snapshot for READ COMMITTED.',
          ),
          h3('Updates and deletes'),
          p(
            'UPDATE marks old version deleted and inserts a new version (or equivalent). DELETE sets xmax. Indexes point at version chains; hot updates may cause bloat without cleanup.',
          ),
          h3('Cleanup: VACUUM / purge'),
          p(
            'When no snapshot still needs an old version, a cleanup process reclaims space. Long-running transactions delay cleanup → table bloat. Operationally critical.',
          ),
          h3('Write conflicts'),
          p(
            'If two txns update the same row, one wins; the other waits or gets "could not serialize access" depending on isolation. MVCC does not magically merge conflicting writes.',
          ),
          code(
            'sql',
            `-- Postgres: see dead tuples / bloat pressure (illustrative)
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'accounts';
-- Long txns → dead tuples linger until vacuum can reclaim`,
            'Operations angle of MVCC',
          ),
        ]),
        section('example', 'Worked Example', [
          example('Reader-writer concurrency', [
            ol([
              'Row balance=100, version v1',
              'T_write begins UPDATE to 90 → creates v2; T_write not yet committed',
              'T_read with snapshot before T_write commits still sees v1=100',
              'T_write commits; new snapshots see v2=90; old snapshots still see v1 until done',
            ]),
          ]),
          example('READ COMMITTED vs RR under MVCC', [
            p(
              'RC takes a new snapshot per statement → can see newly committed v2 on second SELECT. RR keeps first snapshot → second SELECT still sees v1.',
            ),
          ]),
          numerical({
            title: 'Numerical — Who sees what?',
            problem:
              'T1 (RR) reads X=5. T2 updates X to 7 and commits. T3 (RC) begins and reads X. Then T1 reads X again. Values?',
            given: 'MVCC snapshots as described.',
            formula: 'RR stable snapshot; RC sees latest committed.',
            steps:
              'T1 second read still 5.\nT3 reads 7.\nNo dirty reads involved.',
            answer: 'T1 sees 5 then 5; T3 sees 7.',
            shortcut: 'RR freezes; RC refreshes each statement.',
            mistake: 'Saying T1 must see 7 because T2 committed.',
          }),
        ]),
        section('tradeoffs', 'TRADE-OFFS', [
          table(
            ['Approach', 'Pros', 'Cons'],
            [
              [
                'Pure locking',
                'Simpler mental model; strong control',
                'Readers/writers block; deadlocks',
              ],
              [
                'MVCC',
                'Readers do not block writers',
                'Version bloat; vacuum; write skew under SI',
              ],
            ],
          ),
          ul([
            'MVCC + SSI ≈ serializability with optimistic aborts',
            'Hot rows still serialize writers',
            'Disk and index maintenance become part of the concurrency story',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Isolation levels define which snapshot rules apply',
            'WAL still required for Durability — MVCC is about Isolation visibility',
            'Replication may ship row versions / WAL records derived from the same machinery',
          ]),
        ]),
        section('followups', 'Interview Follow-up Chain', [
          p('Interviewer: "How does Postgres let readers avoid locks?"'),
          p(
            'Strong answer: "MVCC — updates create new row versions; readers use a snapshot to decide visibility. Writers do not in-place overwrite the only copy readers need. Trade-off is dead tuple cleanup via VACUUM and potential bloat from long transactions."',
          ),
          p('Interviewer: "Does MVCC mean no locks?"'),
          p(
            'Strong answer: "No. Writes still take locks / row exclusive locks; DDL and some reads take locks. MVCC mainly removes the need for readers to block on writers for consistency."',
          ),
        ]),
      ],
      commonMistakes: [
        'Claiming MVCC eliminates all locks',
        'Ignoring vacuum/bloat operationally',
        'Equating Snapshot Isolation with SERIALIZABLE',
        'Forgetting write-write conflicts still exist',
      ],
      interviewQuestions: [
        'What is MVCC?',
        'Why does MVCC help performance?',
        'What is a snapshot?',
        'What problem does VACUUM solve in Postgres?',
        'Do writers still lock under MVCC?',
      ],
      intermediateInterviewQuestions: [
        'How do xmin/xmax style fields decide visibility?',
        'Difference between RC and RR snapshots.',
        'What is snapshot too old / related errors in some engines?',
        'How can long transactions hurt all writers indirectly?',
        'Explain heap-only tuple updates (HOT) at a high level.',
      ],
      advancedInterviewQuestions: [
        'How does SSI detect read-write dependency cycles on top of MVCC?',
        'Compare Oracle undo segments vs Postgres heap versions.',
        'How does InnoDB MVCC use undo logs for consistent reads?',
        'What is transaction ID wraparound and why is it dangerous?',
        'How do indexes find the visible version efficiently?',
        'Design monitoring for MVCC bloat in production.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain MVCC.',
          answer:
            'MVCC stores multiple versions of rows so each transaction reads from a consistent snapshot without taking long shared locks. An update creates a new version and marks the old one deleted for future snapshots; ongoing readers keep seeing the old version. Writers still conflict with other writers on the same row. Trade-offs: excellent read scalability, but old versions need garbage collection (VACUUM/purge), and long transactions delay cleanup and can bloat storage. Snapshot Isolation still allows some anomalies like write skew unless you use SERIALIZABLE/SSI.',
        },
      ],
      keyTakeaways: [
        'MVCC = versions + snapshot visibility rules.',
        'Readers mostly avoid blocking writers; cleanup is the cost.',
        'SI ≠ full serializability; know write skew.',
      ],
    },
  ),
]
