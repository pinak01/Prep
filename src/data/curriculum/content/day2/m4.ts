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

export const m4Pages: StudyPage[] = [
  createPage(
    'd2-p11',
    'Recovery: WAL & Checkpoints',
    22,
    [
      'Explain Write-Ahead Logging and why it enables durability',
      'State steal/no-force buffer policies and why they force redo+undo',
      'Describe ARIES phases, checkpoints, torn pages, and group commit',
      'Connect fsync cost to commit latency with numerical intuition',
    ],
    {
      sections: [
        section('concept', 'WHAT — WAL & Why It Exists', [
          p(
            'Write-Ahead Logging (WAL): before a change is durable in data pages, the log record describing that change must be on stable storage. After COMMIT, the DBMS forces relevant log records to disk (fsync/fdatasync). On crash, recovery replays history from the log.',
          ),
          h3('Why WAL exists'),
          p(
            'Flushing every dirty data page on every commit is too slow (random I/O across the buffer pool). Append-only logging is sequential and cheap; data pages can be written later. That design choice is what makes steal/no-force practical.',
          ),
          h3('Steal / no-steal and force / no-force'),
          table(
            ['Policy', 'Meaning', 'Recovery implication'],
            [
              ['Steal', 'Dirty pages of uncommitted txns may be written to disk', 'Need UNDO on crash'],
              ['No-steal', 'Uncommitted dirty pages never reach disk', 'Less undo, more buffer pressure'],
              ['Force', 'Commit flushes all dirty pages of the txn', 'Durability without redo of data, slow commits'],
              ['No-force', 'Commit need not flush data pages — only log', 'Need REDO on crash; fast commits'],
            ],
            'Classic textbook combo used by real engines: steal + no-force',
          ),
          callout(
            'tip',
            'Interview line: “Steal ⇒ undo; no-force ⇒ redo; WAL ordering makes both safe.”',
            'Steal/no-force mnemonic',
          ),
          diagram(
            `sequenceDiagram
  participant T as Transaction
  participant B as Buffer Pool
  participant L as WAL
  participant D as Data Files
  T->>B: modify page in memory
  T->>L: append log record
  T->>L: COMMIT + fsync log
  Note over B,D: dirty pages flush later (no-force)
  Note over L: crash → ARIES Analysis/Redo/Undo`,
            'Commit durability is about the log first',
          ),
        ]),
        section('aries', 'HOW — ARIES Phases, Checkpoints, Torn Pages', [
          h3('ARIES (high-level)'),
          p(
            'ARIES (Algorithm for Recovery and Isolation Exploiting Semantics) is the standard steal/no-force recovery framework. Know three restart phases and that undo writes compensating log records (CLRs) so recovery itself is crash-safe.',
          ),
          ol([
            'Analysis: scan log from last checkpoint; rebuild dirty-page table and active-transaction table; find redoLSN (where redo must begin)',
            'Redo: repeat history — re-apply logged updates from redoLSN forward so the disk matches the logged state (including losers’ updates that were stolen)',
            'Undo: roll back loser (uncommitted) transactions using undo/CLRs until each loser is fully undone',
          ]),
          h3('Checkpoints'),
          ul([
            'A checkpoint records recovery progress (e.g., dirty pages, active txns) so Analysis need not start from log dawn',
            'Fuzzy checkpoints avoid freezing the system: continue work while checkpointing',
            'Trade-off: more frequent checkpoints → faster restart, more runtime I/O',
          ]),
          h3('Torn / partial pages'),
          p(
            'Disks write in sectors (often 512B/4KB) while DBMS pages may be 8KB+. A crash mid-write can leave a torn page: half old, half new. WAL + page LSNs (or full-page images / doublewrite buffers) detect and repair torn pages during redo. Without this, silent corruption is possible even if “the log looks fine.”',
          ),
          h3('Group commit'),
          p(
            'fsync is expensive. Group commit batches many transactions’ COMMIT records into one log flush so they share one fsync. Latency for an individual txn may wait a few milliseconds; aggregate commits/sec soar.',
          ),
          example('Crash after commit (durability / redo)', [
            p(
              'T1 committed (log forced). Data page still dirty in RAM (no-force). Crash. Analysis finds T1 committed; Redo reapplies T1’s updates so data files catch up. Client who saw COMMIT keeps its durable guarantee.',
            ),
          ]),
          example('Crash before commit with steal (atomicity / undo)', [
            p(
              'T2 modified pages; buffer manager stole a dirty page to disk; T2 never committed. Restart Redo may re-apply T2’s logged updates (repeat history), then Undo rolls T2 back with CLRs so atomicity holds.',
            ),
          ]),
        ]),
        section('numerical', 'NUMERICAL — fsync & Group Commit Intuition', [
          numerical({
            title: 'Numerical 1 — Naive fsync-per-commit',
            problem:
              'Each COMMIT does one fsync costing 5 ms. What is the max durable commit rate if every txn fsyncs alone?',
            given: 'fsync = 5 ms = 0.005 s per commit; one at a time.',
            formula: 'throughput ≈ 1 / fsync_latency',
            steps:
              '1 / 0.005 = 200 commits/sec.\nEven if CPU is idle, durability caps you at ~200 TPS under this model.',
            answer: '~200 durable commits/sec',
            shortcut: 'Commit TPS ceiling ≈ 1000 / fsync_ms when each commit fsyncs alone.',
            mistake: 'Assuming write() returning means durable — OS page cache can lose data on power loss.',
          }),
          numerical({
            title: 'Numerical 2 — Group commit win',
            problem:
              'Same 5 ms fsync. On average 20 transactions wait and flush together. Approx durable commit rate?',
            given: 'group size G=20; fsync=5 ms.',
            formula: 'throughput ≈ G / fsync_latency',
            steps:
              '20 / 0.005 = 4000 commits/sec.\nEach txn may wait up to ~one flush interval for the group — latency traded for throughput.',
            answer: '~4000 commits/sec (order-of-magnitude)',
            shortcut: 'Group commit multiplies fsync-bound TPS by average group size.',
            mistake: 'Thinking group commit removes the need for fsync entirely.',
          }),
          numerical({
            title: 'Numerical 3 — Why not force data pages',
            problem:
              'A txn dirties 40 random 8KB pages. Force-on-commit would write all 40; WAL commit writes ~1 sequential log chunk. Why is no-force preferred?',
            given: '40 random page writes vs 1 sequential log force.',
            formula: 'Compare random I/O count vs sequential log append + one fsync.',
            steps:
              'Force: up to 40 random durable writes (plus index pages) per commit → catastrophic latency.\nNo-force: append log + one fsync; checkpoint/background writer spreads data-page I/O.',
            answer: 'No-force + WAL keeps commit path sequential; force makes every commit random-I/O heavy.',
            shortcut: 'Log is the sequential shortcut around random data-page flushes.',
            mistake: 'Equating “COMMIT returned” with “all table pages already on disk.”',
          }),
        ]),
        section('tradeoffs', 'TRADE-OFFS & EDGE CASES', [
          ul([
            'Synchronous commit: wait for log fsync — strong durability, higher p99 latency',
            'Async commit / delayed durability: ack before fsync — lower latency, RPO > 0 on crash',
            'Battery-backed RAID / cloud storage semantics change what “fsync” really guarantees — still reason about the DBMS contract',
            'Long-running txns + steal: more undo work; huge WAL retention until they end',
            'Replication often ships the same WAL — local recovery mechanism becomes HA plumbing',
          ]),
          callout(
            'warning',
            '“write() returned” ≠ durable. Durability requires flush through OS cache to stable media (and understanding of disk write cache settings).',
            'OS vs DBMS durability',
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Atomicity uses undo (and CLRs); Durability uses forced log + redo',
            'Checkpoints bound restart time the way vacuum bounds MVCC bloat — operational knobs',
            'Group commit is the systems answer to “fsync is slow but Durability is required”',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Why? → “Why WAL?” → Random data-page flushes on every commit are too slow; sequential log + no-force gives durability cheaply.'),
          p('How? → “How does COMMIT become durable?” → Append COMMIT (and prior) records; fsync log; then ack client.'),
          p('DS? → “What structure is the log?” → Append-only sequential log addressed by LSN; pages carry page-LSN for redo idempotence / torn detection.'),
          p('Tradeoff? → “Sync vs async commit?” → Latency vs possible loss of recent commits on crash.'),
          p('Always? → “Must every COMMIT fsync alone?” → No — group commit batches; some products offer async commit deliberately.'),
          p('ARIES? → Analysis → Redo (repeat history) → Undo losers with CLRs.'),
          p('Torn page? → Partial page write; fix via page LSN / full-page images / doublewrite.'),
        ]),
      ],
      commonMistakes: [
        'Saying “COMMIT writes all table pages immediately” as the only story',
        'Confusing OS page cache with DBMS buffer pool flush guarantees',
        'Equating “process restarted” with “filesystem already durable” without fsync',
        'Remembering redo but forgetting undo under steal',
        'Describing ARIES as “just replay the log” without Analysis/Undo or CLRs',
      ],
      interviewQuestions: [
        'What is WAL?',
        'Why write the log before data pages?',
        'What does COMMIT guarantee?',
        'What is redo?',
        'What is a checkpoint?',
        'What is steal vs no-force?',
      ],
      intermediateInterviewQuestions: [
        'Steal vs no-force policy meaning?',
        'Why is fsync expensive?',
        'What is group commit?',
        'Undo vs redo — when each?',
        'How do checkpoints speed restart?',
        'What is a compensating log record?',
      ],
      advancedInterviewQuestions: [
        'ARIES recovery high-level phases?',
        'How does replication interact with WAL?',
        'Partial page writes / torn pages — how are they handled?',
        'Synchronous commit vs async durability trade-off?',
        'How would you explain a “data loss after power failure” bug?',
        'Why must undo log CLRs (not just in-place undo without logging)?',
        'Estimate commit TPS from fsync latency with and without group commit.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain WAL in 60 seconds.',
          answer:
            'Before we rely on a change surviving a crash, we append a description of that change to a sequential write-ahead log and flush the log on commit. Data pages can be written later under a no-force policy, and uncommitted dirty pages may be stolen to disk — so recovery needs both redo and undo. After a crash, ARIES-style recovery runs Analysis, Redo (repeat history), and Undo of losers. Checkpoints limit how far back we scan; group commit amortizes fsync cost across many transactions.',
        },
        {
          question: 'Walk through ARIES phases.',
          answer:
            'Analysis starts from the last checkpoint and rebuilds which pages were dirty and which transactions were active, determining the redo starting LSN. Redo then walks forward and reapplies logged updates so the disk matches logged history — including updates from transactions that will later be undone. Undo rolls back loser transactions, writing compensating log records so a crash during recovery is itself recoverable. Steal forces undo; no-force forces redo; WAL ordering makes both safe.',
        },
        {
          question: 'Why is group commit important?',
          answer:
            'A single fsync might cost milliseconds. If every transaction fsyncs alone, durable TPS is roughly 1/fsync_latency — e.g., 5 ms ⇒ ~200 commits/s. Group commit lets many commit records share one fsync, multiplying throughput by the average group size while adding a small wait. That is how OLTP systems keep Durability without making every commit pay a full disk flush alone.',
        },
      ],
      keyTakeaways: [
        'Log first, then data pages (WAL rule)',
        'Steal ⇒ undo; no-force ⇒ redo',
        'ARIES: Analysis → Redo → Undo (+ CLRs)',
        'Group commit amortizes fsync; torn pages need page-LSN/doublewrite care',
      ],
    },
  ),

  createPage(
    'd2-p12',
    'Replication',
    18,
    [
      'Contrast sync vs async replication with RPO/RTO vocabulary',
      'Explain primary-replica topologies, lag, and read-your-writes',
      'Reason about failover, fencing, and split-brain',
      'Distinguish physical vs logical replication at interview depth',
    ],
    {
      sections: [
        section('concept', 'WHAT — Replication', [
          p(
            'Replication copies data to multiple nodes for availability, read scaling, or geographic locality. Typical pattern: one primary accepts writes; replicas apply the same changes (often via WAL shipping or logical decoding). Replicas do not automatically give you write scale — they give you extra read capacity and a failover candidate.',
          ),
          h3('Why it exists'),
          p(
            'A single node is a single failure domain and a single read bottleneck. Replication buys redundancy and read fan-out, at the cost of lag, failover complexity, and consistency questions.',
          ),
          table(
            ['Mode', 'Commit waits for', 'RPO intuition', 'Trade-off'],
            [
              ['Asynchronous', 'Local primary durability only', 'Can lose recent commits on failover', 'Fast writes; stale reads possible'],
              ['Synchronous', 'Replica ack (policy-dependent)', 'Near-zero RPO if sync replica was caught up', 'Higher write latency; replica outage can block writes'],
              ['Quorum / semi-sync', 'Ack from k of n', 'Tunable between async and full sync', 'Balances latency vs durability'],
            ],
          ),
          diagram(
            `flowchart LR
  C[Clients] --> P[Primary]
  P -->|WAL / logical| R1[Replica]
  P --> R2[Replica]
  C -.->|reads| R1`,
            'Read replicas scale reads; writes hit primary',
          ),
        ]),
        section('how', 'HOW — Shipping Changes & Topologies', [
          h3('Physical vs logical'),
          ul([
            'Physical / streaming: ship WAL bytes (or page-level changes); replica is essentially the same bytes — great for HA, limited cross-version flexibility',
            'Logical: decode row/statement changes; can filter tables, write to different engines, build CDC pipelines — more CPU, more semantic edge cases',
          ]),
          h3('Lag'),
          p(
            'Replication lag = time (or LSN distance) between primary commit and replica apply. Causes: network, slow apply, long queries on replica holding back apply, vacuum/maintenance. Lag is why “read replica” ≠ “always fresh.”',
          ),
          example('Read-your-writes after signup', [
            p(
              'User creates account on primary, then immediately GETs profile from a load-balanced replica that is 200 ms behind → 404. Fixes: read from primary for that session, session sticky “primary until lag caught up,” or wait for LSN acknowledgment before redirecting reads.',
            ),
          ]),
          example('Numerical lag intuition', [
            numerical({
              title: 'Numerical — Stale read window',
              problem:
                'Primary commits at t=0. Replica apply lag is normally 50 ms p50 and 2 s p99. What do you tell product about “read-after-write” on replicas?',
              given: 'p50=50ms, p99=2s lag.',
              formula: 'Stale window ≈ lag distribution; design for p99 not average.',
              steps:
                'Half the time users may see writes within ~50 ms.\nAbout 1% of reads can be up to ~2 s stale (or more under incidents).\nProduct-critical read-after-write paths must not rely on p50 lag.',
              answer: 'Treat replica reads as eventually consistent; size UX around p99 lag or pin those reads to primary.',
              shortcut: 'Always quote lag percentiles, not “replicas are synced.”',
              mistake: 'Using average lag to promise strong read-after-write.',
            }),
          ]),
          code(
            'text',
            `RPO: how much data can you lose on disaster? (async replica ⇒ minutes/seconds of commits)
RTO: how long until service is back? (detect + elect + promote + redirect)`,
            'RPO vs RTO — say both in HA answers',
          ),
        ]),
        section('failover', 'Failover, fencing & split brain', [
          p(
            'If the primary dies, a replica is promoted. Hard part: ensure the old primary does not accept writes again (STONITH / fencing / fencing tokens). Two primaries accepting writes ⇒ divergent data (split brain) — often worse than downtime.',
          ),
          ul([
            'Async promotion: may drop unreplicated commits (RPO > 0) — clients must tolerate retry/idempotency',
            'Sync promotion: fewer lost commits, but you needed a healthy sync standby before the failure',
            'Hot standby: replica open for reads while replaying; warm: recovering but not serving; cold: backup restore',
          ]),
          callout(
            'warning',
            'Reading from replicas can return stale data. Applications must tolerate replication lag or read from primary for strong read-after-write.',
            'Stale reads',
          ),
          callout(
            'mistake',
            'Multi-primary (“multi-master”) sounds attractive for write scale; conflict resolution, causality, and operational complexity usually dominate unless the domain is carefully partitioned.',
            'Multi-primary caution',
          ),
        ]),
        section('tradeoffs', 'TRADE-OFFS & EDGE CASES', [
          ul([
            'Replicas scale reads, not primary write throughput',
            'Sync replication can make a slow/dead replica block commits — availability vs durability',
            'Long transactions / heavy reports on a replica can delay apply and inflate lag',
            'Schema migrations must be replica-safe (expand/contract) or you break apply',
            'Connection pools and ORMs that “randomize” read replicas break read-your-writes casually',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Same WAL that enables crash recovery often feeds streaming replicas',
            'CAP/consistency models: replica reads ≈ eventual/session consistency unless you wait for sync',
            'Failover fencing is a distributed-systems problem, not just a SQL setting',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Why? → “Why replicate?” → Availability + read scale + locality; not free consistency.'),
          p('How? → “How are changes shipped?” → Physical WAL streaming or logical decoding/CDC.'),
          p('DS? → “What do you monitor?” → Lag (LSN/bytes/seconds), apply errors, disk on standby, fencing health.'),
          p('Tradeoff? → “Sync or async?” → Write latency & availability vs RPO on failover.'),
          p('Always? → “Do replicas fix write bottlenecks?” → No — writes still hit primary (unless you shard or multi-primary with eyes open).'),
          p('Follow-up: “User created a row and cannot read it” → replica lag / read-your-writes.'),
          p('Follow-up: “We promoted and lost orders” → async RPO; need idempotent clients + sync/quorum if RPO≈0.'),
        ]),
      ],
      commonMistakes: [
        'Assuming replicas are always up to date',
        'Ignoring split-brain on dual primaries',
        'Claiming replicas scale writes',
        'Designing read-after-write against async replicas without a session strategy',
        'Confusing RPO (data loss) with RTO (downtime)',
      ],
      interviewQuestions: [
        'What is replication?',
        'Sync vs async?',
        'What is a read replica?',
        'What is failover?',
        'What is replication lag?',
        'What is RPO vs RTO?',
      ],
      intermediateInterviewQuestions: [
        'Read-your-writes with replicas — how?',
        'Logical vs physical replication?',
        'Why can replicas help availability?',
        'Multi-primary risks?',
        'Hot standby vs warm standby?',
        'How does a long query on a replica affect lag?',
      ],
      advancedInterviewQuestions: [
        'Quorum replication awareness?',
        'How does Postgres streaming replication relate to WAL?',
        'Failover election / consensus role?',
        'Replica promotion checklist?',
        'How do you fence an old primary safely?',
        'Design read-your-writes for a mobile API using async replicas.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain database replication trade-offs.',
          answer:
            'We copy writes from a primary to replicas via WAL shipping or logical decoding. Async replication keeps writes fast but risks losing recent commits on failover (RPO > 0) and serving stale reads. Sync or quorum replication reduces data-loss risk but adds latency and can hurt availability if standbys are down. Replicas scale reads, not primary writes. Failover needs fencing so the old primary cannot accept writes (split brain). I choose the mode from RPO requirements and whether the app tolerates lag.',
        },
        {
          question: 'How do you handle read-your-writes with replicas?',
          answer:
            'After a write, either read from the primary for that session, stick the client to primary until its write’s LSN is applied on the chosen replica, or accept eventual consistency and design the UX for it. Load-balancing GETs to random async replicas without a session policy is a classic production bug right after signup or checkout.',
        },
      ],
      keyTakeaways: [
        'Replicas ≠ instant consistency',
        'Sync trades latency/availability for lower RPO',
        'Failover needs fencing against split brain',
        'Replicas scale reads; lag percentiles matter',
      ],
    },
  ),

  createPage(
    'd2-p13',
    'Partitioning & Sharding',
    16,
    [
      'Distinguish vertical vs horizontal partitioning',
      'Explain shard keys, hotspots, and cross-shard queries',
      'Relate partitioning inside one DB vs sharding across nodes',
      'Defend a scaling ladder before proposing shards',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Partitioning splits a logical dataset into pieces for manageability or scale. Vertical partitioning separates columns/tables by access pattern (e.g., hot profile fields vs bulky blobs). Horizontal partitioning splits rows by a key (range, list, or hash). Sharding is horizontal partitioning across multiple database servers — each shard is often its own database with its own connections, backups, and failure domain.',
          ),
          table(
            ['Technique', 'Meaning', 'Typical win'],
            [
              ['Vertical partition', 'Split by columns/tables', 'Isolate hot vs cold attributes'],
              ['Horizontal partition', 'Split rows by key', 'Prune scans; manage huge tables'],
              ['Sharding', 'Horizontal across nodes', 'Write throughput & storage beyond one machine'],
            ],
          ),
          callout(
            'tip',
            'In interviews, say “Postgres declarative partitioning” for single-node table management, and reserve “sharding” for multi-node distribution.',
          ),
        ]),
        section('how', 'How sharding works', [
          h3('Routing'),
          ol([
            'App or proxy computes shard from shard key (hash/range/directory lookup)',
            'Opens a connection (pool) to that shard’s database',
            'Runs local SQL; cross-shard work fans out and merges results',
          ]),
          h3('Shard key choice'),
          ul([
            'Good: high cardinality, even distribution, aligns with most queries (tenant_id, user_id)',
            'Bad: low cardinality; monotonically increasing IDs that concentrate recent writes on one range shard',
            'Celebrity/hot keys overload one shard — mitigate with salting, dedicated shards, or caching',
          ]),
          example('Hash vs range', [
            p(
              'Hash(user_id) % N spreads writes evenly but makes range scans of “all users created today” expensive (scatter-gather). Range sharding by created_at helps time scans but can create hot write tails.',
            ),
          ]),
          diagram(
            `flowchart LR
  App --> Router
  Router --> S1[(Shard 1)]
  Router --> S2[(Shard 2)]
  Router --> S3[(Shard 3)]`,
            'Router/proxy picks a shard from the key',
          ),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Cross-shard JOIN / UNIQUE / FOREIGN KEY / multi-row txn are hard or impossible without 2PC/saga',
            'Global ORDER BY / LIMIT needs merge sort across shards',
            'Resharding (N→N+1) moves data online carefully — dual-write or consistent hashing helps',
            'Connection pools multiply: app_pool_size × shards can overwhelm DB max_connections',
            'Operational blast radius: backups, schema migrations, monitoring × shard count',
          ]),
          callout(
            'mistake',
            'Sharding first is almost always wrong. Exhaust indexes, query rewrite, caching, vertical scale, and read replicas before you accept distributed complexity.',
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'DBMS + Networks: each shard hop adds RTT; chatty ORM × shards amplifies latency',
            'DBMS + OS: more connections ⇒ more sockets/FDs/threads or async workers',
            'Security + DBMS: tenant shard isolation is not a substitute for object-level authz',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: “We would shard the database.”'),
          p('Interviewer: “Why not indexes/replicas first?” → measure bottlenecks; sharding is last resort.'),
          p('Interviewer: “What is the shard key?” → must match access pattern and distribute evenly.'),
          p('Interviewer: “How do you do a transaction across users on different shards?” → avoid; or saga/outbox; 2PC costly.'),
          p('Interviewer: “How do you add shards?” → resharding plan, dual writes, consistent hashing.'),
          p('Interviewer: “What about global unique email?” → central directory service or application-enforced uniqueness with care.'),
        ]),
      ],
      commonMistakes: [
        'Sharding before indexing/query tuning',
        'Choosing a monotonically increasing shard key that concentrates writes',
        'Ignoring connection-pool multiplication across shards',
      ],
      interviewQuestions: [
        'Partition vs shard?',
        'Horizontal vs vertical partitioning?',
        'What is a shard key?',
        'What is a hotspot?',
        'Why are cross-shard joins hard?',
      ],
      intermediateInterviewQuestions: [
        'Hash vs range sharding?',
        'How do you reshard?',
        'Consistent hashing intuition?',
        'Directory / lookup service role?',
        'When is partitioning enough without sharding?',
      ],
      advancedInterviewQuestions: [
        'Distributed transactions vs saga — when?',
        'Global secondary indexes across shards?',
        'Tenant isolation via shards?',
        'Online migration strategies?',
        'How does sharding interact with connection pooling?',
        'Design unique email across shards without a single primary.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How would you scale a database?',
          answer:
            'First optimize queries and indexes, then scale vertically, add read replicas for read-heavy load, and only then shard by a key that matches access patterns. Sharding multiplies operational complexity: cross-shard transactions, resharding, connection pools, and uneven load. I explain those costs explicitly and only accept them when a single primary cannot meet write/storage needs.',
        },
      ],
      keyTakeaways: [
        'Shard key dominates success',
        'Cross-shard work is expensive',
        'Partitioning ≠ automatic distribution',
        'Scale ladder: tune → cache → vertical → replicas → shard',
      ],
    },
  ),

  createPage(
    'd2-p14',
    'CAP Theorem & Consistency Models',
    18,
    [
      'State CAP carefully (partition forces C/A trade-off for linearizability)',
      'Relate CP vs AP examples without cartoon oversimplification',
      'Connect consistency models: strong, causal, eventual, read-your-writes',
      'Separate ACID Consistency from distributed Consistency; know PACELC',
    ],
    {
      sections: [
        section('concept', 'WHAT — CAP (Said Precisely)', [
          p(
            'CAP: in a distributed system, when a network partition occurs, you cannot simultaneously provide linearizability (the “C” Gilbert/Lynch meant) and perfect Availability for all clients. You design which side you sacrifice during partition. Outside partitions, well-designed systems aim for both C and A — so “pick two of three always” is the cartoon.',
          ),
          h3('Definitions that matter'),
          ul([
            'Partition (P): nodes cannot communicate reliably; the network splits or messages drop long enough to matter',
            'Consistency (C in CAP): usually linearizability — every read sees the latest successful write as if one copy',
            'Availability (A): every non-failing node’s request eventually gets a non-error response (even during partition)',
          ]),
          callout(
            'mistake',
            'Saying “pick two of three always” is the common cartoon. Interviewers like the partition-focused statement: during P, choose C or A for linearizable registers.',
            'Cartoon CAP',
          ),
          callout(
            'warning',
            'ACID Consistency (integrity constraints / business rules) ≠ CAP Consistency (linearizability across replicas). Never conflate them in an interview.',
            'ACID C ≠ CAP C',
          ),
        ]),
        section('how', 'HOW — CP vs AP & Consistency Spectrum', [
          table(
            ['Stance during partition', 'Behavior', 'Examples (intuition)'],
            [
              ['CP-leaning', 'Refuse some ops / minority side goes stale or unavailable to preserve one truth', 'Consensus primary (Raft/Paxos), many “strongly consistent” distributed SQL configs'],
              ['AP-leaning', 'Both sides accept writes; reconcile later (versions, CRDTs, last-write-wins)', 'DNS-like systems, some Dynamo-style stores with conflict resolution'],
            ],
          ),
          table(
            ['Model', 'Client expectation', 'When it is enough'],
            [
              ['Linearizable / strong', 'Reads see latest committed write globally', 'Payments ledgers, unique inventory counters'],
              ['Sequential', 'Ops of each client appear in order; single global order of commits', 'Many single-primary DB deployments for clients talking to primary'],
              ['Causal', 'Respects happens-before; may miss concurrent unrelated writes’ order', 'Comment threads, collaborative feeds'],
              ['Read-your-writes / session', 'A client sees its own writes', 'Post-signup profile fetch'],
              ['Eventual', 'Replicas converge if updates stop; reads may be stale now', 'Caches, counters with merge, product catalogs'],
            ],
          ),
          h3('PACELC (awareness)'),
          p(
            'Even when there is no partition, systems trade Latency vs Consistency (the ELC in PACELC). Async replication is a classic “prefer latency, weaker consistency” choice outside failures.',
          ),
          example('Shopping cart during partition', [
            p(
              'AP choice: let both sides of a partition accept cart adds; merge carts later (may need conflict UI). CP choice: one side errors “service unavailable” so you never fork the cart. Product decides which failure mode customers hate less.',
            ),
          ]),
          example('Quorum intuition', [
            numerical({
              title: 'Numerical — Quorum intersection',
              problem:
                'N=5 replicas. Writes need W acks; reads need R replies. Which (W,R) pairs guarantee a read sees the latest durable write (quorum intersection)?',
              given: 'N=5; need W+R > N.',
              formula: 'W + R > N ⇒ read quorum intersects write quorum.',
              steps:
                'W=3,R=3: 3+3>5 ✓\nW=2,R=2: 2+2=4 ≤5 ✗ (can miss latest)\nW=1,R=5: 1+5>5 ✓ (read-all)\nW=5,R=1: 5+1>5 ✓ (write-all)',
              answer: 'Any W,R with W+R > 5 (e.g., 3/3, 5/1, 1/5). Pairs like 2/2 do not intersect.',
              shortcut: 'Intersection rule: W+R > N.',
              mistake: 'Thinking R=1 is always safe — only if W=N (write-all).',
            }),
          ]),
        ]),
        section('tradeoffs', 'TRADE-OFFS & EDGE CASES', [
          ul([
            '“CP system” labels are sloppy — real systems tune per operation and have timeouts',
            'Eventual consistency still needs a conflict story (LWW, merge, CRDT, human resolve)',
            'Session guarantees (read-your-writes, monotonic reads) are often what apps actually need — cheaper than global linearizability',
            'Distributed locks / leases assume a consistency mechanism underneath; a lock on an AP store can lie',
            'Single-primary relational DB: clients talking only to primary look strong; adding async read replicas moves you on the spectrum',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Replication lag is the everyday face of weaker-than-linearizable reads',
            'Consensus (Raft) is how many CP systems pick a primary and order writes',
            'Isolation/serializability inside one primary is orthogonal to cross-replica CAP C',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Why? → “Why can’t we have C+A during partition?” → Split brain: both sides cannot accept linearizable writes without communication.'),
          p('How? → “How do CP systems behave?” → Minority refuses writes / waits for quorum; clients see errors or timeouts.'),
          p('DS? → “What mechanism implements strong leadership?” → Consensus (Raft/Paxos) + logs; quorums for put/get.'),
          p('Tradeoff? → “When is eventual OK?” → When stale reads or mergeable conflicts beat global unavailability.'),
          p('Always? → “Is CAP absolute for my Postgres?” → Single-node ACID ≠ CAP; CAP bites when you distribute and partition.'),
          p('Clarify: “Which C?” → ACID integrity vs linearizability — say which you mean.'),
          p('PACELC: “And when healthy?” → Still choose latency vs consistency (async replica).'),
        ]),
      ],
      commonMistakes: [
        'Using CAP to dismiss relational databases casually',
        'Equating eventual consistency with “no correctness”',
        'Conflating ACID Consistency with CAP Consistency',
        'Claiming “Mongo is AP, MySQL is CP” as absolute labels',
        'Using the “pick two always” slogan without mentioning partitions',
      ],
      interviewQuestions: [
        'What is CAP?',
        'What is a partition?',
        'CP vs AP example?',
        'What is eventual consistency?',
        'What is linearizability (intuition)?',
        'ACID C vs CAP C?',
      ],
      intermediateInterviewQuestions: [
        'Why is the “pick two” slogan misleading?',
        'Read-your-writes vs strong consistency?',
        'How do quorum reads/writes relate?',
        'PACELC awareness?',
        'When is eventual consistency OK?',
        'What happens to a minority Raft replica during partition?',
      ],
      advancedInterviewQuestions: [
        'Give a product requirement that forces AP during partition.',
        'How do distributed locks relate to consistency?',
        'CALM theorem / conflict-free types awareness?',
        'How does Raft provide consensus?',
        'Consistency vs ACID “C” — do not conflate.',
        'Design session read-your-writes without full linearizability.',
        'Show a (W,R,N) that fails quorum intersection.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain CAP without the cartoon.',
          answer:
            'During a network partition, a distributed data system must choose whether to refuse some operations to keep a single linearizable copy of truth, or to remain available on both sides and reconcile later. Outside partitions we want both consistency and availability — so “pick any two of three forever” is misleading. I always ask which consistency model the product needs (linearizable vs read-your-writes vs eventual) and I never confuse that with ACID’s integrity “Consistency.”',
        },
        {
          question: 'How do quorums relate to CAP-style consistency?',
          answer:
            'If you write to W replicas and read from R with W+R > N, every read quorum intersects every write quorum, so a reader can see the latest durable write assuming synced replicas in those quorums. Smaller quorums improve latency/availability but can miss recent writes. Quorums are a tunable knob on the consistency–latency spectrum; they do not erase partition trade-offs when majorities cannot form.',
        },
      ],
      keyTakeaways: [
        'CAP is about partitions + linearizability vs availability',
        'Name the consistency model you mean',
        'ACID C ≠ distributed C',
        'PACELC: even healthy systems trade latency vs consistency',
      ],
    },
  ),

  createPage(
    'd2-p15',
    'SQL vs NoSQL & Database Scaling',
    18,
    [
      'Compare relational vs document/key-value/wide-column/graph stores by access pattern',
      'Outline the scaling ladder before proposing shards or NoSQL',
      'Choose storage from queries, consistency, and operational cost — not fashion',
      'Defend polyglot persistence and CQRS as deliberate splits, not defaults',
    ],
    {
      sections: [
        section('concept', 'WHAT — Families by Access Pattern', [
          p(
            '“SQL vs NoSQL” is a false binary. Pick a data model and consistency/query surface that match access patterns. Relational engines still win most transactional systems in 2026; specialized stores win when the dominant operations are a poor fit for joins/SQL or a single primary’s write path.',
          ),
          table(
            ['Family', 'Strength', 'Pain if misused'],
            [
              ['Relational (SQL)', 'Joins, constraints, multi-row txns, ad-hoc query', 'Cross-shard pain if you outgrow one primary without a plan'],
              ['Key-value', 'Simple get/put, extreme scale, caching', 'No rich query; you reinvent indexes in app'],
              ['Document', 'JSON-like aggregates, flexible fields per entity', 'Unbounded docs; awkward many-to-many; multi-doc txn cost'],
              ['Wide-column', 'Huge sparse rows, write-heavy time-series paths', 'Query flexibility limited; careful key design'],
              ['Graph', 'Multi-hop relationship traversal', 'Overkill for tree/FK data that SQL already models'],
            ],
          ),
          callout(
            'tip',
            '“NoSQL because scale” is weak without naming the access pattern SQL struggled with and what you measured first.',
            'Interview tip',
          ),
        ]),
        section('how', 'HOW — Scaling Ladder & Decision Framework', [
          h3('Scaling ladder (say this order)'),
          ol([
            'Fix queries/indexes/schema (usually the real win)',
            'Cache hot reads (with explicit invalidation/TTL story)',
            'Vertical scale (bigger primary) while it is cheaper than distributed complexity',
            'Read replicas for read-heavy load (accept lag policy)',
            'Partition/shard or move hot paths to specialized stores',
            'CQRS / event-driven async read models where write and read shapes diverge',
          ]),
          h3('Decision questions'),
          ul([
            'What are the top 5 queries by QPS and p99?',
            'Do you need multi-row ACID or is single-key atomicity enough?',
            'Is the schema truly variable, or just evolving (migrations handle evolving)?',
            'Who pages at 3am — operational maturity of the store matters',
          ]),
          example('Orders + items', [
            p(
              'Classic relational: orders 1—N order_lines, FK integrity, payment txn. A document “order aggregate” can work for write/read of whole order, but reporting “top products last week” and cross-order constraints get harder. Default interview answer: SQL for OLTP orders; optional document/cache for storefront product pages.',
            ),
          ]),
          example('Session / cache path', [
            p(
              'Key-value (Redis) for session tokens and rate limits: O(1) get/put, TTL, no joins needed. Putting sessions in Postgres works at small scale; at high QPS the access pattern matches KV better.',
            ),
          ]),
          numerical({
            title: 'Numerical — Scale ladder before shard',
            problem:
              'Primary handles 8k write TPS at 70% CPU. Reads are 90% of QPS and p99 is high. Candidate says “move to Cassandra.” What do you try first and why?',
            given: 'Write load OK; read-dominated; single primary not write-saturated.',
            formula: 'Match bottleneck → cheapest fix on the ladder.',
            steps:
              'Writes are fine ⇒ sharding/NoSQL rewrite is premature.\nReads dominate ⇒ indexes/query fix, cache, then read replicas.\nOnly if write/storage exceeds one primary after tuning do you shard or specialize.',
            answer: 'Tune + cache + replicas first; Cassandra is not justified by this symptom alone.',
            shortcut: 'Name the bottleneck (read/write/storage) before naming a database.',
            mistake: 'Equating “we are popular” with “we need NoSQL.”',
          }),
        ]),
        section('tradeoffs', 'TRADE-OFFS & EDGE CASES', [
          ul([
            'Document “schema-free” still has an implicit schema in application code — messy evolutions hurt more without migrations discipline',
            'Secondary indexes in distributed NoSQL often become scatter-gather (costly) — design primary keys for the hot path',
            'Multi-document transactions exist in modern Mongo/etc. but cost and limitations remain; not a free SQL substitute',
            'Distributed SQL / NewSQL (Cockroach, Spanner-class) offers SQL + horizontal scale with consensus latency — another point on the spectrum',
            'Polyglot persistence: best-of-breed per path, but dual-write and consistency across stores become your problem',
          ]),
          diagram(
            `flowchart TD
  Q[Measure bottleneck] --> T[Tune SQL indexes]
  T --> C[Cache]
  C --> V[Vertical]
  V --> R[Replicas]
  R --> S[Shard / specialized store]
  S --> CQ[CQRS / events]`,
            'Scale ladder — skip rungs only with evidence',
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Replication/partitioning pages are the horizontal rungs of this ladder',
            'Normalization vs denormalization: document stores often denormalize aggregates by design',
            'CAP/consistency: many NoSQL wins assume eventual/session models — say so explicitly',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Why? → “Why this store?” → Access pattern + consistency + ops, not résumé-driven technology.'),
          p('How? → “How do you scale first?” → Ladder: tune → cache → vertical → replicas → shard/specialize.'),
          p('DS? → “What changes in NoSQL key design?” → Primary key / partition key becomes the query planner — design for hotspot avoidance.'),
          p('Tradeoff? → “SQL joins vs denormalized docs?” → Write amplification & inconsistency risk vs read latency.'),
          p('Always? → “Is NoSQL required at scale?” → No — many large systems stay on SQL + replicas + careful sharding.'),
          p('Follow-up: “How do you migrate?” → Dual-write/CDC carefully, expand-contract, verify with shadow reads.'),
        ]),
      ],
      commonMistakes: [
        'Treating NoSQL as schema-free with no data model discipline',
        'Ignoring operational complexity of distributed stores',
        'Jumping to shards/NoSQL before indexes, cache, and replicas',
        'Assuming document DB removes the need for transactions forever',
        'Using graph DB for data that is just foreign keys',
      ],
      interviewQuestions: [
        'SQL vs NoSQL when?',
        'What is a document store good for?',
        'Vertical vs horizontal scaling?',
        'Why still use SQL in 2026?',
        'What is CQRS at a high level?',
        'What is polyglot persistence?',
      ],
      intermediateInterviewQuestions: [
        'How do you migrate from SQL to a document model carefully?',
        'Cache aside vs write-through?',
        'When is a graph DB justified?',
        'Connection pooling importance?',
        'When is a key-value store the right session store?',
        'What breaks if you dual-write SQL and a search index?',
      ],
      advancedInterviewQuestions: [
        'Design a feed with fan-out — SQL or specialized?',
        'NewSQL / distributed SQL awareness?',
        'How do secondary indexes change NoSQL designs?',
        'Multi-document transactions in Mongo — trade-offs?',
        'Cost of strong transactions at global scale?',
        'Defend keeping OLTP on Postgres while offloading search to Elasticsearch.',
      ],
      interviewReadyAnswers: [
        {
          question: 'SQL or NoSQL?',
          answer:
            'I start from access patterns and consistency needs. If I need rich queries, constraints, and multi-row transactions, relational fits. If I need simple key access at massive scale, TTL/cache semantics, or a document aggregate that is always read/written together, a specialized store may fit. Often the answer is SQL plus cache and read replicas first — not an immediate rewrite. I explicitly name operational cost and migration risk in the trade-off.',
        },
        {
          question: 'How would you scale a database-backed service?',
          answer:
            'Measure whether the bottleneck is bad queries, read QPS, write QPS, or storage. Fix indexes and schema, add caching for hot reads, scale vertically while cheap, then add read replicas with a lag policy. Only then shard or introduce a specialized store for hot paths. If read and write models diverge, CQRS with an event/outbox pipeline is cleaner than forcing one database shape to do everything.',
        },
      ],
      keyTakeaways: [
        'Access patterns drive the choice',
        'Scale stepwise; do not jump to shards/NoSQL',
        'Operational cost and consistency model count',
        'Polyglot is a split with dual-write costs — not a trophy',
      ],
    },
  ),

  createPage(
    'd2-p16',
    'Database Interview Problems',
    12,
    [
      'Practice framing database design and scaling trade-offs',
      'Connect Day 1 + Day 2 concepts in interview-style answers',
      'Debug slow queries and isolation bugs systematically',
    ],
    {
      sections: [
        section('scenarios', 'Scenario drills', [
          ol([
            'Design schema for orders + items + payments — keys, FDs, indexes.',
            'Users report double charges — isolation? idempotency keys?',
            'Dashboard query times out — EXPLAIN, indexes, materialized views?',
            'Primary dies — RPO with async replica?',
            'Need multi-region reads — consistency options?',
          ]),
          example('Structured answer template', [
            ul([
              'Clarify requirements (read/write ratio, consistency, size)',
              'Propose schema/indexes',
              'Identify bottlenecks',
              'Offer 2–3 scaling options with trade-offs',
              'Mention observability (slow query log, metrics)',
            ]),
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Indexes (Day 1) + EXPLAIN + isolation (Day 2) = real debugging',
            'WAL + replication = durability and HA story',
            'Normalization + intentional denormalization for read models',
          ]),
        ]),
      ],
      commonMistakes: [
        'Jumping to microservices/sharding in the first sentence',
        'No measurement plan',
      ],
      interviewQuestions: [
        'How do you investigate a slow query?',
        'How do you prevent double submit charges?',
        'When do you add an index?',
        'How do you plan failover?',
        'How do you handle read-after-write?',
      ],
      intermediateInterviewQuestions: [
        'Design an inventory reservation system.',
        'Choose isolation level for seat booking.',
        'Migrate a hot table with zero downtime — ideas?',
        'Cache invalidation strategies?',
        'Audit logging design?',
      ],
      advancedInterviewQuestions: [
        'Exactly-once processing with a DB — how approximate?',
        'Online DDL risks?',
        'Hot partition remediation?',
        'Multi-tenant schema strategies?',
        'Explain a production incident narrative using Day 2 vocab.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Walk me through debugging a slow backend that smells like the DB.',
          answer:
            'I check latency metrics and slow query logs, run EXPLAIN ANALYZE on top offenders, look for sequential scans, missing indexes, or lock waits. I check isolation symptoms if results look wrong under load. I fix the query/index first, then consider caching or replicas, and only then heavier architecture changes.',
        },
      ],
      keyTakeaways: [
        'Structure beats buzzwords',
        'Measure before shard',
        'Blend Day 1+2 vocabulary',
      ],
    },
  ),
]
