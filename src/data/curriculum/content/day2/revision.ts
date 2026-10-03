import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  ol,
  table,
  callout,
} from '../../../helpers'

export const revisionPages: StudyPage[] = [
  createPage(
    'd2-rev',
    '10-Minute Revision',
    10,
    [
      'Rapidly recall ACID, schedules, locking, isolation, recovery, and scaling',
      'Use as a pre-interview checklist the morning of',
    ],
    {
      sections: [
        section('acid', 'ACID & Lifecycle (90s)', [
          ul([
            'Atomicity: all-or-nothing via undo/rollback',
            'Consistency: constraints + valid state transitions',
            'Isolation: concurrency control (locks/MVCC) — levels weaken this',
            'Durability: WAL flushed before COMMIT ack',
            'States: Active → Partially Committed → Committed | Failed → Aborted',
          ]),
        ]),
        section('schedules', 'Schedules (2 min)', [
          ul([
            'Conflict: different txns, same item, ≥1 write (RW/WR/WW)',
            'Precedence edge Ti→Tj if Ti\'s conflicting op precedes Tj\'s',
            'Acyclic graph ⇔ conflict serializable; topo order = serial order',
            'Recoverable: writer commits before dirty reader commits',
            'Cascadeless: no dirty reads; Strict: no dirty read/write',
          ]),
          callout(
            'tip',
            'In numericals: list edges out loud, then hunt cycles. Separate CS from recoverability.',
          ),
        ]),
        section('locks', 'Locks & Deadlocks (2 min)', [
          ul([
            'S-S OK; X conflicts with S and X',
            '2PL: grow then shrink ⇒ conflict serializable (≠ deadlock-free)',
            'Strict 2PL: hold X until end; Rigorous: hold all until end',
            'Wait-for graph cycle = deadlock → abort victim → retry',
            '2PL ≠ 2PC',
          ]),
        ]),
        section('isolation', 'Anomalies, Isolation, MVCC (2 min)', [
          table(
            ['Level', 'Stops'],
            [
              ['RU', 'almost nothing'],
              ['RC', 'dirty'],
              ['RR', 'dirty + non-repeatable (*engine)'],
              ['SERIALIZABLE', 'all + serialization anomalies'],
            ],
          ),
          ul([
            'Non-repeatable = same row changes; Phantom = set/predicate membership changes',
            'MVCC: versions + snapshots; vacuum/purge cost; SI allows write skew',
            'Defaults: PG/Oracle/SQL Server often RC; MySQL InnoDB RR',
          ]),
        ]),
        section('scale', 'WAL, Replica, Shard, CAP (2 min)', [
          ul([
            'WAL before data; steal/no-force ⇒ redo+undo; checkpoints bound recovery',
            'Async replica: lag = RPO risk; sync: latency; fence to avoid split-brain',
            'Replicas scale reads; shards scale writes; shard key = balance + locality',
            'CAP during partition: CP vs AP; CAP C ≠ ACID C; remember PACELC',
            'Scale order: optimize → vertical → replicas/cache → partition → shard',
          ]),
        ]),
        section('checklist', '60-Second Self-Test', [
          ol([
            'Draw S/X matrix',
            'Given a 6-op schedule, build precedence graph',
            'Name three anomalies with SQL one-liners',
            'Explain why COMMIT needs WAL fsync',
            'Say when you would NOT shard yet',
          ]),
        ]),
      ],
      commonMistakes: [
        'Skipping recoverability when practicing only serializability numericals',
        'Forgetting engine-specific RR behavior',
      ],
      interviewQuestions: [
        'Define ACID in 60 seconds.',
        'How do you test conflict serializability?',
        'Strict vs basic 2PL?',
        'Dirty vs phantom read?',
        'WAL in one sentence?',
      ],
      intermediateInterviewQuestions: [
        'Recoverable vs cascadeless?',
        'Why MVCC still needs locks for writes?',
        'Sync vs async replication RPO?',
        'CAP vs PACELC?',
        'When is SERIALIZABLE worth the cost?',
      ],
      advancedInterviewQuestions: [
        'Write skew under SI — example and fix?',
        'ARIES three phases in one breath?',
        'Shard key for multi-tenant SaaS?',
        'SSI vs 2PL serializability?',
        'Outbox + CDC reliable events sketch?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Give a 2-minute Day 2 summary.',
          answer:
            'Transactions give ACID: undo for atomicity, constraints for consistency, locks/MVCC for isolation, WAL for durability. Correct concurrency is conflict serializability — acyclic precedence graphs — enforced by 2PL or SSI; recoverability avoids committing readers of aborted data. Isolation levels trade anomalies for speed; MVCC makes readers cheap at the cost of version cleanup. Crashes use WAL redo/undo and checkpoints. Scale with replicas then shards; during partitions CAP forces CP vs AP. I always tie the tool to the invariant I am protecting.',
        },
      ],
      keyTakeaways: [
        'Edges → cycles → not CS; dirty read + early commit → not recoverable.',
        '2PL ⇒ CS; strict 2PL helps recovery; deadlocks still happen.',
        'WAL/replicas/shards/CAP are the failure-and-scale layer on top of ACID.',
      ],
    },
  ),

  createPage(
    'd2-traps',
    'Interview Traps',
    10,
    [
      'Spot misconceptions that lose credit in DBMS interviews',
      'Replace each trap with a precise correction',
    ],
    {
      sections: [
        section('traps', 'High-Frequency Traps', [
          h3('1. ACID Consistency = CAP Consistency'),
          p(
            'Wrong. ACID C is about valid states/constraints. CAP C is linearizability across replicas during partitions. Say both words carefully.',
          ),
          h3('2. 2PL prevents deadlocks'),
          p('Wrong. 2PL prevents non-CS schedules, not circular waits. Detection/prevention is separate.'),
          h3('3. 2PL = 2PC'),
          p(
            'Two-Phase Locking (concurrency) ≠ Two-Phase Commit (distributed atomic commit).',
          ),
          h3('4. Phantom = non-repeatable'),
          p(
            'Non-repeatable: same row\'s values change. Phantom: rows appear/disappear in a predicate result.',
          ),
          h3('5. READ COMMITTED stops lost updates'),
          p(
            'Not by itself for naive read-modify-write. Use atomic UPDATE, locks, or versions.',
          ),
          h3('6. Snapshot Isolation = SERIALIZABLE'),
          p('SI prevents many anomalies but allows write skew. SERIALIZABLE/SSI needed for full guarantee.'),
          h3('7. Replicas scale writes'),
          p('Replicas scale reads (and HA). Writes still go to primary (in primary-replica). Shards scale writes.'),
          h3('8. COMMIT flushes table pages'),
          p('COMMIT flushes WAL (durability). Data pages may flush later (no-force).'),
          h3('9. We picked CA in CAP'),
          p(
            'Partitions happen. You choose CP vs AP behavior when they do; you do not "drop P" on the public Internet.',
          ),
          h3('10. Any acyclic graph means serializable'),
          p(
            'Must be the precedence/serialization graph from conflicting operations — not a random ER diagram or wait-for graph.',
          ),
          h3('11. MySQL RR = Postgres RR = ANSI RR'),
          p('Implementations differ on phantoms and locking. Qualify by engine.'),
          h3('12. Sharding early shows senior judgment'),
          p('Often opposite — seniors postpone sharding with indexes, vertical scale, replicas, cache.'),
        ]),
        section('recover', 'How to Correct Yourself Mid-Answer', [
          ul([
            '"Let me be precise — I conflated X with Y; the difference is..."',
            'Redraw the right graph (precedence vs wait-for)',
            'State the trade-off you almost skipped',
          ]),
        ]),
        section('followups', 'Trap Follow-ups Interviewers Use', [
          p('Interviewer: "So RR means no phantoms?"'),
          p(
            'Strong answer: "ANSI suggests phantoms remain at RR, but InnoDB next-key locking often prevents them, while Postgres RR is snapshot-based and still allows some serialization anomalies — for true safety I use SERIALIZABLE or explicit locks for the invariant."',
          ),
        ]),
      ],
      commonMistakes: [
        'Doubling down on a wrong definition instead of correcting',
        'Using vendor marketing ("CP system") without semantics',
      ],
      interviewQuestions: [
        'Is 2PL deadlock-free?',
        'Does RC prevent lost updates?',
        'Is SI serializable?',
        'Do replicas increase write TPS?',
        'Is CAP-C the same as ACID-C?',
      ],
      intermediateInterviewQuestions: [
        'Give a write-skew example under SI.',
        'When is a schedule CS but not recoverable?',
        'Why might sync replication reduce availability?',
        'Wait-for vs precedence graph?',
        'Why is view serializability rarely implemented?',
      ],
      advancedInterviewQuestions: [
        'Where does Postgres deviate from textbook strict 2PL?',
        'Explain a false deadlock timeout.',
        'How can logical replication diverge from physical?',
        'Critique "eventual consistency is enough for banking."',
        'When do global secondary indexes break sharding assumptions?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Name three DBMS interview traps and corrections.',
          answer:
            'First, 2PL is not 2PC and does not prevent deadlocks — it guarantees conflict serializability; deadlocks need detection or ordering. Second, Snapshot Isolation is not full serializability because of write skew — use SERIALIZABLE/SSI or explicit locks for those invariants. Third, CAP Consistency is not ACID Consistency, and read replicas do not scale writes. Correcting these live signals real understanding.',
        },
      ],
      keyTakeaways: [
        'Precision beats buzzwords — define which "consistency" and which graph.',
        'Know engine caveats for isolation.',
        'Scale writes with shards/primary capacity, not replicas.',
      ],
    },
  ),

  createPage(
    'd2-rapid',
    'Rapid Fire — 20 Questions',
    12,
    [
      'Answer 20 core prompts quickly; check against model hints',
      'Build fluency for screening rounds',
    ],
    {
      sections: [
        section('instructions', 'How to Use', [
          p(
            'Say answers out loud in 20–40 seconds each. Then expand any miss using the model hints below. The 20 prompts are also listed in the question fields for app UI practice modes.',
          ),
        ]),
        section('q1_10', 'Questions 1–10 — Hints', [
          ol([
            'ACID — Atomic undo; Constraint validity; Isolation CC; Durable WAL.',
            'Dirty read — read uncommitted write.',
            'Conflict — different txns, same item, ≥1 write.',
            'CS test — acyclic precedence graph.',
            'Recoverable — writer commits before dirty reader.',
            'S vs X — share reads; exclusive writes; matrix.',
            '2PL — no lock after first unlock; ⇒ CS.',
            'Strict 2PL — hold X until commit.',
            'Deadlock — wait-for cycle; abort victim.',
            'Phantom — predicate set changes via insert/delete.',
          ]),
        ]),
        section('q11_20', 'Questions 11–20 — Hints', [
          ol([
            'RC vs RR — per-statement vs stable snapshot (typical MVCC).',
            'MVCC — multi versions; readers use snapshots; vacuum cost.',
            'WAL — log before data/commit ack.',
            'Checkpoint — limit recovery scan; trade overhead.',
            'Async vs sync replication — latency vs RPO.',
            'Split-brain — two primaries; fence old.',
            'Shard key — even load + transaction locality.',
            'CAP — during partition choose C or A; P assumed.',
            'Replicas ≠ write scale.',
            'Lost update fix — atomic UPDATE / locks / version.',
          ]),
        ]),
        section('model', 'Selected Model Answers (compressed)', [
          p(
            'Q4: "Build Ti→Tj when Ti conflicts before Tj; cycle ⇒ not conflict serializable; else topo order is serial order."',
          ),
          p(
            'Q13: "WAL records must be durable before we overwrite pages or ack COMMIT so redo/undo can restore ACID after crash."',
          ),
          p(
            'Q18: "In a partition, either refuse some ops (CP) or serve potentially inconsistent answers (AP). CAP-C ≠ ACID-C."',
          ),
          p(
            'Q20: "Do not read-modify-write without protection; use UPDATE … WHERE, SELECT FOR UPDATE, or optimistic version checks."',
          ),
        ]),
      ],
      commonMistakes: [
        'Writing essays — rapid fire rewards crisp definitions',
        'Skipping the graph method on schedule questions',
      ],
      interviewQuestions: [
        'Define ACID.',
        'What is a dirty read?',
        'When do two operations conflict?',
        'How do you test conflict serializability?',
        'Define a recoverable schedule.',
      ],
      intermediateInterviewQuestions: [
        'Shared vs exclusive locks?',
        'What is two-phase locking?',
        'What is strict 2PL?',
        'How do you detect deadlock?',
        'What is a phantom read?',
      ],
      advancedInterviewQuestions: [
        'READ COMMITTED vs REPEATABLE READ?',
        'How does MVCC work?',
        'What is WAL?',
        'What does a checkpoint do?',
        'Async vs sync replication?',
        'What is split-brain?',
        'How do you choose a shard key?',
        'State CAP carefully.',
        'Do read replicas scale writes?',
        'How do you prevent lost updates?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Rapid pack: serializability + recoverability + isolation.',
          answer:
            'Conflict serializability means the precedence graph of RW/WR/WW conflicts is acyclic. Recoverability means you never commit a transaction that read dirty data from a writer that later aborts — cascadeless schedules avoid dirty reads entirely. Isolation levels dial which anomalies clients can see: RC stops dirty reads; RR stabilizes rows; SERIALIZABLE aims for no anomalies including phantoms and write skew. In interviews I separate these three topics explicitly so I do not mix graphs, commit order, and SQL levels.',
        },
        {
          question: 'Rapid pack: durability + HA + scale.',
          answer:
            'Durability is WAL fsync before COMMIT ack, with redo/undo after crashes and checkpoints to bound recovery. HA uses replication — async trades RPO for latency; sync opposite — and fencing prevents split-brain. Scale reads with replicas and caches; scale writes with careful sharding. CAP reminds me that during partitions I must choose refusal versus stale service, which is a different axis from ACID on a single primary.',
        },
      ],
      keyTakeaways: [
        'Twenty crisp definitions beat one long vague monologue.',
        'Schedule numericals: edges then cycles.',
        'Always mention the trade-off in one clause.',
      ],
    },
  ),
]
