import type { StudyPage } from '@/types/curriculum'
import { createPage, ol, p, section } from '../../../helpers'

const adv30 = [
  'Explain write skew under snapshot isolation and a mitigation.',
  'Why might EXPLAIN choose seq scan despite an index existing?',
  'How does leaf-level linking in B+ trees help ORDER BY?',
  'Design a composite index for WHERE a=? AND b>? ORDER BY c.',
  'Walk through recovering a DB after crash using WAL vocabulary.',
  'Compare strict 2PL to MVCC for read-heavy workloads.',
  'How do you detect and resolve a database deadlock in production?',
  'Explain phantom prevention mechanisms at a high level.',
  'When does synchronous replication reduce availability?',
  'How would you reshard a hash-partitioned dataset online?',
  'Clarify CAP vs ACID consistency in one minute.',
  'Bandwidth-delay product: compute and interpret for a link.',
  'Why does HTTP/2 still suffer HOL blocking at TCP layer?',
  'Explain TLS certificate validation failure modes.',
  'How does a reverse proxy terminate TLS and what changes?',
  'Describe Linux fork copy-on-write and why it is fast.',
  'Page replacement: compare FIFO anomalies vs LRU.',
  'How do you investigate 100% CPU with Linux tools end-to-end?',
  'Explain priority inversion and a classic mitigation.',
  'Dynamic dispatch implementation sketch (vtable).',
  'Show an LSP violation and how to fix the model.',
  'Decorator vs inheritance for feature toggles — trade-offs.',
  'JWT alg confusion — conceptual risk and defense.',
  'SSRF to cloud metadata — defensive controls (no exploit steps).',
  'SameSite=Lax gaps — when CSRF tokens still needed.',
  'Design rate limiting that resists distributed brute force.',
  'Exactly-once processing with at-least-once queues + DB — pattern.',
  'Cache stampede — causes and mitigations.',
  'Read-your-writes with async replicas — strategies.',
  'Multi-tenant noisy neighbor — DB and OS angles.',
]

const adv30Answers: { question: string; answer: string }[] = [
  {
    question: 'Explain write skew under snapshot isolation and a mitigation.',
    answer:
      'Under SI, two transactions each read a snapshot, make disjoint writes that together violate an invariant (e.g., both doctors go off-call), and both commit because neither wrote the same row. Mechanism is snapshot reads without predicate locks. Mitigate with SELECT FOR UPDATE / materialize a constraint row, serializable isolation (SSI), or an explicit locking protocol around the invariant.',
  },
  {
    question: 'Why might EXPLAIN choose seq scan despite an index existing?',
    answer:
      'Low selectivity, stale statistics, random I/O cost vs sequential, expression mismatch vs index, or visibility map preventing index-only. I verify with EXPLAIN ANALYZE and row estimates.',
  },
  {
    question: 'How does leaf-level linking in B+ trees help ORDER BY?',
    answer:
      'Leaves store keys in order and point to the next leaf, so a range or ordered scan walks siblings instead of re-descending the tree. Matching ORDER BY to a composite index prefix can avoid a sort. Trade-off: maintaining links and ordered leaves on every insert/delete.',
  },
  {
    question: 'Design a composite index for WHERE a=? AND b>? ORDER BY c.',
    answer:
      'Prefer (a, b, c): equality on a first, then range on b, with c as trailing for ordered leaf walk within each b-range slice—or (a, c, b) if you need strict ORDER BY c globally and can filter b afterward (often worse). Trade-off: leading equality columns matter most; test with EXPLAIN because range on b may stop using c for a free sort.',
  },
  {
    question: 'Walk through recovering a DB after crash using WAL vocabulary.',
    answer:
      'On restart, analysis finds the last checkpoint and redo from the WAL; redo (roll-forward) reapplies committed and in-flight logged changes to bring pages to a consistent redo point; undo (rollback) reverses loser transactions. Durability rests on WAL flushed before commit acknowledgment; dirty data pages may lag.',
  },
  {
    question: 'Compare strict 2PL to MVCC for read-heavy workloads.',
    answer:
      'Strict 2PL readers take shared locks until commit, so writers block and lock footprint grows. MVCC readers use snapshots and rarely block writers, which wins for read-heavy OLTP. Trade-off: MVCC version cleanup, possible write skew under SI, and writers still contend on hot rows.',
  },
  {
    question: 'How do you detect and resolve a database deadlock in production?',
    answer:
      'Engine builds a wait-for graph (or uses lock timeouts), aborts a victim, and surfaces an error the app must retry safely. Ops: correlate logs/metrics for deadlock rate, find conflicting SQL and lock order, shorten transactions, index to reduce lock scope, and standardize access order. Avoid unbounded client retry storms.',
  },
  {
    question: 'Explain phantom prevention mechanisms at a high level.',
    answer:
      'Phantoms are new rows matching a prior predicate. Prevention uses predicate/gap/next-key locks (or serializable SSI tracking) so inserts into a scanned range conflict. Snapshot isolation alone does not always prevent phantoms/write skew; SERIALIZABLE or explicit locks close the gap at concurrency cost.',
  },
  {
    question: 'When does synchronous replication reduce availability?',
    answer:
      'Primary waits for replica ack before commit; if the replica or network dies, commits stall or the system refuses writes to keep sync durability. You gain stronger durability/failover freshness; you lose write availability under replica/network failure unless you demote to async or lose sync guarantees.',
  },
  {
    question: 'How would you reshard a hash-partitioned dataset online?',
    answer:
      'Introduce a new hash ring/partition map, dual-write or change-data-capture to new shards, backfill historical data, shadow-read to validate, then cut traffic and decommission old shards. Trade-offs: temporary write amplification, consistency during migration, and careful routing of in-flight keys (versioned shard map).',
  },
  {
    question: 'Clarify CAP vs ACID consistency in one minute.',
    answer:
      'ACID consistency means the DB enforces integrity rules within a transaction on one (logical) database. CAP consistency usually means linearizability across replicas under partition. You can have ACID locally and still choose AP (stale/divergent replicas) or CP (refuse some ops) during a network split.',
  },
  {
    question: 'Bandwidth-delay product: compute and interpret for a link.',
    answer:
      'BDP = bandwidth × RTT (e.g., 1 Gbps × 40 ms ≈ 5 MB). It is the amount of in-flight data needed to fill the pipe. If the TCP window or app buffer is smaller than BDP, throughput saturates below line rate; tune windows and avoid chatty request–response patterns.',
  },
  {
    question: 'Why does HTTP/2 still suffer HOL blocking at TCP layer?',
    answer:
      'HTTP/2 multiplexes streams on one TCP connection, fixing HTTP/1.1 app-layer HOL, but a lost TCP segment stalls the whole connection until retransmission. HTTP/3/QUIC moves streams onto UDP so loss on one stream need not block others. Trade-off: middlebox/path support and new congestion control ops.',
  },
  {
    question: 'Explain TLS certificate validation failure modes.',
    answer:
      'Hostname mismatch, expired/not-yet-valid leaf, untrusted/incomplete chain, weak signature algorithm, or failed revocation/OCSP checks. Clients must verify chain to a trusted root and identity binding—not merely that a cert is present. Misconfigured intermediates are a common production footgun.',
  },
  {
    question: 'How does a reverse proxy terminate TLS and what changes?',
    answer:
      'Client TLS ends at the proxy; proxy decrypts, applies L7 policy, and opens a new connection (plain or re-encrypted) to backends. You gain cert management and routing at the edge; you must trust the proxy path, forward client identity carefully (mTLS/headers), and not assume backend links are “already secure.”',
  },
  {
    question: 'Describe Linux fork copy-on-write and why it is fast.',
    answer:
      'fork duplicates page tables and marks pages COW; physical pages copy only on first write. Child can exec quickly without copying the whole RSS. Trade-off: large dirty-after-fork footprints (e.g., multi-threaded allocators) cause sudden page copying and memory spikes.',
  },
  {
    question: 'Page replacement: compare FIFO anomalies vs LRU.',
    answer:
      'FIFO can suffer Belady’s anomaly: more frames can increase faults. LRU approximates “evict least recently used” and avoids that anomaly in theory but is expensive exactly; clocks/approximations are used. Workload locality determines which heuristic wins in practice.',
  },
  {
    question: 'How do you investigate 100% CPU with Linux tools end-to-end?',
    answer:
      'top/htop for which PIDs; pidstat/perf top or flame graphs for hot stacks; check runnable vs iowait in vmstat; correlate with app metrics and recent deploys. Distinguish user CPU (app/GC) vs system (syscalls/locks) vs steal. Fix the hottest frames, not a guessed microservice.',
  },
  {
    question: 'Explain priority inversion and a classic mitigation.',
    answer:
      'A low-priority task holds a lock needed by a high-priority task while a medium-priority task runs, delaying the high one. Priority inheritance (or ceiling protocols) temporarily boosts the lock holder. Classic in real-time and also appears in DB/app lock stacks under unfair scheduling.',
  },
  {
    question: 'Dynamic dispatch implementation sketch (vtable).',
    answer:
      'Each class has a vtable of function pointers for overridable methods; each object points to its class’s vtable. A virtual call loads the pointer, indexes the slot, and jumps. Trade-off: indirect call, harder inlining, and per-object pointer cost—vs static dispatch or templates.',
  },
  {
    question: 'Show an LSP violation and how to fix the model.',
    answer:
      'Square extends Rectangle but setWidth breaks area expectations for Rectangle clients—subtype is not substitutable. Fix by removing the false is-a (separate shapes), or use immutable value types / composition so clients depend on a Shape abstraction with honest contracts.',
  },
  {
    question: 'Decorator vs inheritance for feature toggles — trade-offs.',
    answer:
      'Decorator wraps a component to add optional behavior at runtime without exploding subclasses; inheritance bakes toggles into a hierarchy that grows exponentially. Decorators compose well but add indirection and ordering bugs; inheritance is simpler until variants multiply.',
  },
  {
    question: 'JWT alg confusion — conceptual risk and defense.',
    answer:
      'Attackers may try to force a token verified with a weak or none algorithm, or misuse a public key as HMAC secret, if the library trusts the token’s alg header. Defense: allow-list algorithms server-side, ignore token-selected alg, use vetted libraries, and prefer opaque server sessions when revocation is critical.',
  },
  {
    question: 'SSRF to cloud metadata — defensive controls (no exploit steps).',
    answer:
      'Treat any server-side URL fetch as dangerous: allow-list schemes/hosts, block link-local/metadata ranges, require egress proxy controls, disable dangerous redirects, and use IMDS v2/session tokens on cloud hosts. Prefer not fetching user-supplied URLs at all when a signed upload/CDN pattern works.',
  },
  {
    question: 'SameSite=Lax gaps — when CSRF tokens still needed.',
    answer:
      'Lax sends cookies on top-level GET navigations, so state-changing GETs remain risky; some cross-site POST flows and older browsers differ. Keep CSRF tokens (or double-submit) for cookie-authenticated mutations; prefer SameSite=Strict or non-cookie auth for APIs when UX allows.',
  },
  {
    question: 'Design rate limiting that resists distributed brute force.',
    answer:
      'Limit by credential, IP, device, and account with progressive friction (CAPTCHA/backoff), shared Redis/token-bucket across instances, and anomaly detection. Edge + app layers; avoid single-IP locks that attackers rotate. Trade-off: false positives vs abuse—tune with metrics and allow trusted ranges carefully.',
  },
  {
    question: 'Exactly-once processing with at-least-once queues + DB — pattern.',
    answer:
      'Consumers must be idempotent: store a processed message id / business key in the same DB transaction as the side effect (outbox/inbox). At-least-once delivery plus transactional dedupe yields effective exactly-once side effects. Trade-off: unique constraints and careful retry of partial failures.',
  },
  {
    question: 'Cache stampede — causes and mitigations.',
    answer:
      'Many clients miss the same hot key at once (expiry/cold start) and stampede the origin. Mitigate with singleflight/request coalescing, probabilistic early refresh, soft TTLs, and serving stale while one refresher runs. Trade-off: slightly staler reads vs origin meltdown.',
  },
  {
    question: 'Read-your-writes with async replicas — strategies.',
    answer:
      'Route recent writers to primary for a sticky window, use session/causal tokens (LSN/GTID) so reads wait until replica catches up, or accept bounded staleness for non-critical paths. Trade-off: primary load vs UX consistency after writes.',
  },
  {
    question: 'Multi-tenant noisy neighbor — DB and OS angles.',
    answer:
      'One tenant’s queries can exhaust CPU, I/O, locks, or connection pools. Mitigate with per-tenant pools/quotas, statement timeouts, resource groups, indexes/partitioning by tenant, and OS cgroup limits for co-located processes. Measure per-tenant metrics so you can throttle fairly.',
  },
]

export const adv30Page: StudyPage = createPage(
  'd7-adv30',
  '30 Advanced Technical Questions',
  25,
  [
    'Practice deep follow-ups that go past definitions',
    'Force trade-off language and mechanisms',
  ],
  {
    sections: [
      section('howto', 'How to practice', [
        p(
          'Answer in 90–120 seconds: mechanism → trade-off → example. Interviewers live here.',
        ),
      ]),
      section('q', '30 advanced questions', [ol(adv30)]),
    ],
    commonMistakes: ['Stopping at buzzwords without mechanisms'],
    interviewQuestions: adv30.slice(0, 10),
    intermediateInterviewQuestions: adv30.slice(10, 20),
    advancedInterviewQuestions: adv30.slice(20),
    interviewReadyAnswers: adv30Answers,
    keyTakeaways: ['Advanced = mechanisms + trade-offs'],
  },
)
