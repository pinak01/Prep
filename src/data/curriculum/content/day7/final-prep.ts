import type { StudyPage } from '@/types/curriculum'
import {
  callout,
  createPage,
  diagram,
  h3,
  ol,
  p,
  section,
  ul,
} from '../../../helpers'

/** Whiteboard-ready narratives an interviewer expects you to draw */
export const whiteboardPage: StudyPage = createPage(
  'd7-whiteboard',
  'Questions You Should Be Able to Explain on a Whiteboard',
  30,
  [
    'Draw and narrate each topic in 2–4 minutes under follow-up pressure',
    'Include WHAT / WHY / HOW / TRADE-OFF without being asked',
    'Recover gracefully when the interviewer says “go deeper”',
  ],
  {
    sections: [
      section('howto', 'How to use this page', [
        p(
          'For each topic: draw first, then talk. Expect Why? How? Trade-off? Always? Practice until you can restart cleanly if interrupted.',
        ),
        callout(
          'tip',
          'Strong cadence: label boxes → arrows with sequence numbers → state one failure mode → state one trade-off.',
        ),
      ]),

      section('tcp', 'TCP three-way handshake', [
        diagram(
          `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: SYN seq=x
  S->>C: SYN-ACK seq=y ack=x+1
  C->>S: ACK ack=y+1`,
          'Draw this; then explain ISN sync and half-open risk of 2-way',
        ),
        ul([
          'WHY: sync both initial sequence numbers; confirm both directions alive',
          'WHY NOT 2-way: server cannot know client got SYN-ACK → half-open risk',
          'FOLLOW-UP: FIN/ACK teardown; TIME_WAIT; retransmission of handshake segments',
          'TRADE-OFF: connection state + RTT vs UDP simplicity',
        ]),
      ]),

      section('https', 'HTTPS / TLS', [
        diagram(
          `flowchart LR
  App[HTTP bytes] --> TLS[TLS record layer]
  TLS --> TCP[TCP byte stream]
  TCP --> IP[IP packets]
  Cert[Server cert chain] -.-> TLS`,
          'HTTPS = HTTP over TLS over TCP',
        ),
        ol([
          'TCP connect',
          'TLS handshake: certify server (chain to trust anchor), agree keys',
          'Symmetric crypto for application data + integrity',
          'HTTP request/response inside the secure channel',
        ]),
        ul([
          'WHAT TLS does NOT do: user authz, XSS prevention, at-rest encryption',
          'FOLLOW-UP: MITM without trust — fake cert fails chain/hostname checks',
          'TRADE-OFF: handshake CPU/latency (mitigate: resumption, TLS1.3, HTTP/2/3)',
        ]),
      ]),

      section('dns', 'DNS resolution', [
        diagram(
          `flowchart TB
  Stub[Stub resolver] --> Rec[Recursive resolver]
  Rec --> Root[Root]
  Rec --> TLD[TLD]
  Rec --> Auth[Authoritative]
  Rec --> Cache[(TTL cache)]`,
        ),
        ul([
          'Records: A/AAAA, CNAME, NS, MX',
          'FOLLOW-UP: recursive vs iterative; negative caching; split-horizon',
          'TRADE-OFF: TTL vs freshness/failover speed',
        ]),
      ]),

      section('btree', 'B+ tree index', [
        diagram(
          `flowchart TB
  I[Internal nodes: keys + child ptrs] --> L1[Leaf]
  I --> L2[Leaf]
  I --> L3[Leaf]
  L1 -.-> L2 -.-> L3`,
          'High fanout; linked leaves for ranges',
        ),
        ul([
          'WHY disk-friendly: page-sized nodes, few levels',
          'INSERT: find leaf, maybe split, write amplification + WAL',
          'ALWAYS? No — low selectivity, wrong leading column, tiny tables',
          'COMPOSITE: leftmost prefix; equality columns then range',
        ]),
      ]),

      section('txn', 'Transaction + locking / MVCC', [
        h3('Draw either locking or MVCC story'),
        ul([
          'Locking: S/X compatibility → 2PL growing/shrinking → deadlock waits-for cycle → abort victim',
          'MVCC: readers see snapshot versions; writers create new versions; anomalies depend on isolation',
          'FOLLOW-UP: dirty / non-repeatable / phantom → which level prevents which',
          'TRADE-OFF: stronger isolation ↔ more waits or aborts ↔ less throughput',
        ]),
      ]),

      section('vm', 'Virtual memory & page fault', [
        diagram(
          `flowchart LR
  VA[Virtual address] --> TLB{TLB hit?}
  TLB -->|yes| PA[Physical frame]
  TLB -->|no| PT[Page table]
  PT -->|present| PA
  PT -->|absent| PF[Page fault → OS loads page]`,
        ),
        ul([
          'WHY: process isolation + overcommit illusion + sharing',
          'FOLLOW-UP: working set, thrashing, swap, huge pages',
          'TRADE-OFF: indirection + faults vs contiguous physical simplicity',
        ]),
      ]),

      section('proc', 'Process lifecycle (Linux)', [
        ol([
          'fork(): duplicate address space (COW) → child',
          'exec(): replace image with new program',
          'runs until exit / signal; parent may wait() to reap',
          'zombie if unreaped; orphan reparented',
        ]),
        ul([
          'FOLLOW-UP: clone/threads share address space; signals + handlers',
          'DRAW: parent/child with COW arrow',
        ]),
      ]),

      section('thread', 'Thread vs process', [
        tableLike(),
        ul([
          'FOLLOW-UP: when prefer processes (isolation) vs threads (shared memory speed)',
          'CONTEXT SWITCH cost: registers + (maybe) address space / TLB',
        ]),
      ]),

      section('deadlock', 'Deadlock', [
        ul([
          'Four Coffman conditions: mutual exclusion, hold-and-wait, no preemption, circular wait',
          'DRAW: resource allocation / waits-for graph with a cycle',
          'HANDLING: prevent (order locks), avoid (Banker), detect+abort, ostrich',
          'DB angle: deadlock detector picks victim transaction',
        ]),
      ]),

      section('rest', 'REST API architecture (minimal)', [
        diagram(
          `flowchart LR
  Client --> LB[Load balancer / reverse proxy]
  LB --> API[App servers]
  API --> Cache[(Cache)]
  API --> DB[(Primary DB)]
  DB --> Rep[(Replicas)]`,
        ),
        ul([
          'Resources + HTTP verbs + status codes + idempotency',
          'Stateless app tier (auth token/session store externalized)',
          'FOLLOW-UP: pagination, versioning, rate limits, idempotency keys',
        ]),
      ]),

      section('auth', 'Authentication flow', [
        ol([
          'Identify user (password/OIDC) → establish session or issue tokens',
          'Send credential on later requests (cookie/Authorization)',
          'Authorize each object/action (not just “logged in”)',
          'Logout/revoke; rotate secrets; protect cookies (HttpOnly/Secure/SameSite)',
        ]),
        ul([
          'FOLLOW-UP: session vs JWT revocation; OAuth code+PKCE vs “login with OAuth” misuse',
        ]),
      ]),

      section('scale', 'Basic scalable backend', [
        ol([
          'Single vertical box works until CPU/RAM/IO saturate',
          'Stateless horizontal app replicas + LB',
          'Cache hot reads; async queues for slow work',
          'DB: indexes → replicas → partition/shard last',
          'Observe: latency, errors, saturation; define SLOs',
        ]),
        callout(
          'mistake',
          'Jumping to Kafka/sharding in sentence one without bottlenecks or numbers.',
        ),
      ]),
    ],
    commonMistakes: [
      'Talking without drawing',
      'Definitions without trade-offs',
      'Forgetting failure modes (ACK loss, cert fail, deadlock, page thrash)',
    ],
    interviewQuestions: [
      'Draw the TCP handshake.',
      'Draw HTTPS layered on TCP.',
      'Draw DNS resolution.',
      'Sketch a B+ tree and an insert split.',
      'Sketch deadlock waits-for.',
    ],
    intermediateInterviewQuestions: [
      'Whiteboard MVCC vs locking for a read/write mix.',
      'Draw fork/exec lifecycle.',
      'Draw a minimal authn/authz request path.',
      'Draw scale-out for a read-heavy API.',
      'Show where TLS terminates in a reverse-proxy setup.',
    ],
    advancedInterviewQuestions: [
      'Annotate latency sources on a browser→DB path.',
      'Show how a lost ACK is recovered during data transfer.',
      'Draw shard routing and a cross-shard failure.',
      'Whiteboard Banker safety check on a tiny matrix.',
      'Draw CSRF defense on a cookie-based session app.',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you start any whiteboard system question?',
        answer:
          'I clarify functional requirements, non-functionals (latency, consistency, scale), and constraints. I draw a simple correct path first (client → LB → app → DB), then layer cache, async, replicas, and security. At each step I name a trade-off and a failure mode so follow-ups feel expected, not surprising.',
      },
      {
        question: 'Draw and explain the TCP three-way handshake.',
        answer:
          'Draw Client and Server; arrow 1 SYN seq=x, arrow 2 SYN-ACK seq=y ack=x+1, arrow 3 ACK ack=y+1. Speak: both sides exchange ISNs so later data can be ordered and ACKed. Call out why two-way fails (server cannot know the client got SYN-ACK → half-open). Trade-off: connection state and one RTT vs UDP simplicity; follow with FIN teardown and TIME_WAIT if asked.',
      },
      {
        question: 'Draw HTTPS layered on TCP / TLS.',
        answer:
          'Stack boxes: HTTP bytes → TLS record layer → TCP → IP; dashed arrow from server cert chain into TLS. Narrate TCP connect, then TLS handshake (cert chain to trust anchor, hostname check, key agreement), then symmetric crypto for app data. Say what TLS does not do: user authz, XSS, at-rest encryption. Trade-off: handshake latency mitigated by TLS 1.3, resumption, and HTTP/2 or HTTP/3.',
      },
      {
        question: 'Draw DNS resolution.',
        answer:
          'Draw stub → recursive resolver → root / TLD / authoritative, plus a TTL cache box on the recursive. Speak A/AAAA vs CNAME vs NS; recursive vs iterative. Mention negative caching and split-horizon if probed. Trade-off: long TTL reduces load but slows failover; short TTL is fresher but chatty.',
      },
      {
        question: 'Sketch a B+ tree and an insert split.',
        answer:
          'Draw internal nodes (keys + child pointers) above linked leaf pages holding keys and row pointers or row data. Narrate find-leaf, insert, then split when full with key promotion and write amplification plus WAL. Why: high fanout, few disk I/Os. Always? No — low selectivity, wrong leading column of a composite, or tiny tables where a seq scan wins.',
      },
      {
        question: 'Whiteboard locking or MVCC for transactions.',
        answer:
          'Pick one story. Locking: S/X compatibility matrix, 2PL grow then shrink, waits-for cycle → abort a victim. MVCC: readers see snapshot versions; writers create new versions; anomalies depend on isolation level. Map dirty / non-repeatable / phantom to levels. Trade-off: stronger isolation ↔ more waits or aborts ↔ less throughput.',
      },
      {
        question: 'Draw virtual memory and a page fault.',
        answer:
          'Flow: virtual address → TLB hit? → physical frame; miss → page table; present → frame; absent → page fault → OS loads from backing store. Speak isolation, overcommit illusion, and sharing via mapped pages. Follow-ups: working set, thrashing, swap, huge pages. Trade-off: indirection and fault cost vs contiguous physical simplicity.',
      },
      {
        question: 'Draw Linux process lifecycle (fork/exec).',
        answer:
          'Boxes: parent fork → child with COW address space; exec replaces image; exit; parent wait reaps; unreaped → zombie; orphan reparented. Speak clone/threads sharing address space if asked. Draw the COW arrow explicitly so you remember why fork is cheap until writes diverge.',
      },
      {
        question: 'Whiteboard thread vs process.',
        answer:
          'Two columns: process owns address space, heavier creation/isolation; thread shares address space inside a process, cheaper context usually. PCB/TCB hold scheduling and registers. Prefer processes for fault isolation and security boundaries; threads for shared-memory speed. Context switch: registers always; address space / TLB shootdown when switching processes.',
      },
      {
        question: 'Draw deadlock and the four Coffman conditions.',
        answer:
          'List mutual exclusion, hold-and-wait, no preemption, circular wait. Draw a waits-for or resource-allocation graph with a cycle. Handling options: prevent (global lock order), avoid (Banker), detect+abort, or ostrich. DB angle: detector picks a victim transaction and rolls it back.',
      },
      {
        question: 'Draw a minimal REST API architecture.',
        answer:
          'Client → LB/reverse proxy → app servers → cache and primary DB, with replicas off the primary. Speak resources, verbs, status codes, idempotency, and stateless app tier with externalized session/token store. Follow-ups: pagination, versioning, rate limits, idempotency keys for unsafe retries.',
      },
      {
        question: 'Draw an authentication / authorization request path.',
        answer:
          'Sequence: identify (password/OIDC) → session or tokens → credential on later requests → authorize each object/action → logout/revoke and cookie flags (HttpOnly, Secure, SameSite). Emphasize authn ≠ authz. Follow-up: session store revocation vs JWT; OAuth authorization code + PKCE vs misusing OAuth as “just login”.',
      },
      {
        question: 'Draw basic scalable backend growth.',
        answer:
          'Start with one vertical box; then stateless horizontal apps + LB; cache hot reads; queues for slow work; DB indexes → replicas → partition/shard last. Annotate observe: latency, errors, saturation, SLOs. Call out the mistake of naming Kafka or sharding before a measured bottleneck.',
      },
    ],
    keyTakeaways: [
      'Draw → narrate → trade-off → failure mode',
      'These twelve boards cover most graduate interview whiteboards',
      'Interruptions are normal — restart from labeled steps',
    ],
  },
)

function tableLike() {
  return ul([
    'Process: own address space, heavier isolation/creation',
    'Thread: shared address space within process, cheaper context usually',
    'PCB/TCB store scheduling and register state',
  ])
}

const cross35 = [
  'What happens from browser to database when an authenticated API request is made? Narrate every hop.',
  'Where can latency occur on that path? Rank the top three you would measure first.',
  'How would you debug a p99 latency spike that started after a deploy?',
  'How does HTTPS interact with TCP? What happens if the TCP connection resets mid-request?',
  'How does a database connection interact with OS processes, threads, and sockets?',
  'How would you secure a REST API backed by PostgreSQL end-to-end?',
  'How would you scale that API from 100 to 100k QPS? What breaks first?',
  'How would you detect and alert on failures across LB, app, and DB tiers?',
  'Explain buffer pool vs OS page cache when diagnosing slow queries.',
  'Why can an ORM that issues 50 queries per request destroy performance across regions?',
  'How do connection pools, DB max_connections, and ulimit -n interact?',
  'A replica lag spike coincides with network packet loss — how do you reason about it?',
  'Walk through SQL injection as a failure of trust boundaries from HTTP to SQL parser.',
  'XSS steals a session cookie — which layers failed (browser, HTTP flags, app encoding, CSP)?',
  'CSRF on a state-changing POST — relate cookies, SameSite, and same-origin policy.',
  'Design caching that cannot leak tenant A’s data to tenant B.',
  'Load balancer marks instances healthy while they still stampede the DB on cold start — fix?',
  'Virtual memory thrashing on the DB host — which Linux metrics and which DB symptoms?',
  'Apply dependency inversion so you can swap Postgres for a test double without rewriting domain logic.',
  'Where should rate limiting live (edge, gateway, app, DB) and why layered?',
  'Distinguish CPU saturation, lock waits, and DNS timeouts using concrete signals.',
  'How do TLS termination at a reverse proxy change your threat model inside the VPC?',
  'Design idempotent payment APIs across at-least-once HTTP retries and a SQL unique constraint.',
  'How does MVCC garbage collection interact with long transactions and disk growth?',
  'Context switch storms from too many blocking server threads — what architectural change?',
  'Explain fork/exec of a worker process that then opens a Postgres socket — full stack.',
  'How would you explain CAP to justify an AP cache during a partition while the DB stays CP?',
  'Secure file upload API: path traversal, content-type, authz, virus scanning, storage ACLs.',
  'Observability triad on a checkout flow: which RED/USE metrics at each hop?',
  'Blue/green deploy: how do you avoid schema-break + connection drain issues together?',
  'Chatty microservice mesh vs modular monolith — argue with latency and failure domains.',
  'How does HTTP/2 multiplexing interact with TCP head-of-line blocking vs HTTP/3/QUIC?',
  'Index missing on FK used in joins — relate optimizer, nested loops, and app timeouts.',
  'Session stickiness at LB vs JWT — trade-offs for scale and security.',
  'Write a 90-second story weaving TCP, TLS, authz check, B+ tree lookup, and thread pool queueing.',
]

export const cross35Page: StudyPage = createPage(
  'd7-cross35',
  '35 Cross-Topic Interview Questions',
  35,
  [
    'Answer prompts that force multiple CS domains in one narrative',
    'Practice measuring, securing, and scaling with shared vocabulary',
  ],
  {
    sections: [
      section('howto', 'Answering pattern', [
        p(
          'Name layers (client, DNS, TCP, TLS, proxy, app, OS, DB, cache). For each relevant layer: mechanism → failure → mitigation. Prefer numbers and signals over buzzwords.',
        ),
      ]),
      section('q', '35 difficult cross-topic prompts', [ol(cross35)]),
      section('models', 'Model outlines (selected)', [
        h3('Browser → database'),
        p(
          'DNS → TCP handshake → TLS → HTTP to LB/proxy → app authn/authz → maybe cache → DB protocol on a pooled socket → parse/plan/execute → locks/MVCC → buffer pool/disk → response path. Latency: DNS, handshake, queueing, lock waits, I/O, distant RTT, serialization.',
        ),
        h3('Secure REST + Postgres'),
        p(
          'TLS everywhere; short-lived sessions/tokens; object-level authz; validate input; parameterized SQL; least-privilege DB role; rate limits; secrets in vault; audit; monitoring of 401/403/429. Residual risk stated.',
        ),
        h3('Scale ladder'),
        p(
          'Profile → indexes/query fix → cache → vertical → stateless app replicas + LB → read replicas → queues → partition/shard last. Each step names the bottleneck it removes and the complexity it adds.',
        ),
      ]),
    ],
    commonMistakes: [
      'Answering only networking or only DB when the prompt is cross-cutting',
      'Scaling advice without a measured bottleneck',
    ],
    interviewQuestions: cross35.slice(0, 12),
    intermediateInterviewQuestions: cross35.slice(12, 24),
    advancedInterviewQuestions: cross35.slice(24),
    interviewReadyAnswers: [
      {
        question:
          'What happens from browser to database when an authenticated API request is made? Narrate every hop.',
        answer:
          'The browser resolves DNS, opens TCP, completes TLS, and sends HTTPS to a load balancer or reverse proxy. The proxy terminates TLS (or passes through), forwards to an app instance that authenticates the session/JWT and authorizes the object. The app borrows a pooled DB socket, speaks the Postgres protocol, and the engine parses/plans/executes under locks or MVCC using the buffer pool and possibly disk. The response reverses the path; each hop can fail independently (DNS, RST, 401/403, pool exhaustion, lock timeout).',
      },
      {
        question:
          'Where can latency occur on that path? Rank the top three you would measure first.',
        answer:
          'I start with a distributed trace and stage histograms: app queueing/thread wait, DB time (lock wait vs execution vs I/O), and network RTT including TLS handshake on new connections. Those three usually dominate p99 before micro-optimizing serialization. DNS, cold caches, and cross-AZ hops matter too, but I confirm with spans rather than guessing. Client retries can amplify load and inflate perceived latency.',
      },
      {
        question:
          'How would you debug a p99 latency spike that started after a deploy?',
        answer:
          'I bisect by deploy marker: compare traces, error rates, and saturation (CPU, threads, DB connections, lock waits) before vs after. Check for N+1 queries, missing indexes after schema change, tighter timeouts, new remote calls, or connection-pool shrinkage. Roll back or feature-flag if user impact is high while digging. Correlate with GC pauses, DNS blips, and replica lag so I do not blame the app for an infra event.',
      },
      {
        question:
          'How does HTTPS interact with TCP? What happens if the TCP connection resets mid-request?',
        answer:
          'HTTPS is HTTP bytes framed by TLS records carried on a reliable TCP byte stream; TLS assumes TCP delivers ordered data or fails the connection. A TCP RST tears down the socket; in-flight request/response is lost and TLS state is invalid on that connection. The client typically retries on a new TCP+TLS session, so APIs must be idempotent or use idempotency keys for unsafe methods. Half-closed or idle timeout resets show up as client cancel/5xx spikes without a clean HTTP status from the origin.',
      },
      {
        question:
          'How does a database connection interact with OS processes, threads, and sockets?',
        answer:
          'A client library holds a TCP (or Unix) socket FD in the app process; the DB server accepts it in a backend process or thread depending on engine. Postgres traditionally maps one backend process per connection; thread-pooled servers multiplex differently. The OS schedules those threads/processes, buffers socket data, and enforces ulimit -n on open FDs. Connection pools exist so apps do not create one OS-level connection per HTTP request.',
      },
      {
        question:
          'How would you secure a REST API backed by PostgreSQL end-to-end?',
        answer:
          'TLS in transit; short-lived sessions or tokens; object-level authorization on every mutating and sensitive read path. Parameterized SQL only, least-privilege DB roles, secrets in a vault, rate limits, and input validation at the edge/app. HttpOnly/Secure/SameSite cookies or careful Bearer handling; audit auth failures and anomalous query patterns. Residual risk remains (logic bugs, dependency CVEs), so defense in depth and monitoring matter.',
      },
      {
        question:
          'How would you scale that API from 100 to 100k QPS? What breaks first?',
        answer:
          'I profile first: usually a hot query or single primary CPU/IO breaks before the app tier. Fix indexes and queries, add caching for hot reads, make apps stateless and horizontal behind an LB, then read replicas; queues for write spikes; shard last. Connection pools and DB max_connections often cliff before raw CPU. At 100k QPS, payload size, chatty per-request fan-out, and cross-region RTT dominate unless you redesign access patterns.',
      },
      {
        question:
          'How would you detect and alert on failures across LB, app, and DB tiers?',
        answer:
          'RED/USE-style signals per tier: LB 5xx and unhealthy hosts; app latency/error/saturation (threads, heap); DB connections, lock waits, replication lag, disk. Alert on SLO burn (error budget) and multi-window rates, not single noisy spikes. Traces and structured logs join a request across tiers with a correlation ID. Synthetic checks from outside catch TLS/DNS/cert expiry the in-cluster metrics miss.',
      },
      {
        question:
          'Explain buffer pool vs OS page cache when diagnosing slow queries.',
        answer:
          'The DB buffer pool caches pages in the database process with its own eviction and dirty-write policy; the OS page cache caches file-system blocks underneath. A query can miss in the buffer pool yet still hit OS cache, or miss both and go to disk — iostat and DB cache-hit metrics distinguish them. Tuning shared_buffers vs leaving RAM for the OS is a trade-off; double caching wastes memory. For diagnosis: check buffer hit ratio, then OS cache pressure and swap, then disk latency.',
      },
      {
        question:
          'Why can an ORM that issues 50 queries per request destroy performance across regions?',
        answer:
          'Each query pays a full RTT plus parse/execute; 50 serial round-trips across regions multiply latency into seconds. Connection and pool churn add handshake and queueing overhead under load. The ORM hides N+1 patterns that look fine locally on a co-located DB. Fix with eager/batch loading, joins, or fewer round-trips — caching alone does not fix chatty write paths.',
      },
      {
        question:
          'How do connection pools, DB max_connections, and ulimit -n interact?',
        answer:
          'App pools cap concurrent client sockets; sum of pools across instances must stay under DB max_connections or new connections fail. Each connection consumes an FD on app and server; ulimit -n too low causes EMFILE before the pool max is reached. Oversized pools create backend process storms and context-switch/memory pressure on Postgres. Size pools from measured concurrency and query time, not “bigger is safer.”',
      },
      {
        question:
          'A replica lag spike coincides with network packet loss — how do you reason about it?',
        answer:
          'Replication ships WAL over the network; loss and retransmits reduce effective throughput so apply lag grows even if the replica CPU looks idle. Distinguish primary overload (WAL generation spike) from path issues (packet loss, bandwidth, cross-AZ blips) using network metrics and replication lag charts together. Reads on the lagging replica can serve stale data — apps needing freshness must pin to primary or lag-aware routing. Fix the network or throttle/batch writers; do not “tune SQL” until you know which side is bound.',
      },
      {
        question:
          'Walk through SQL injection as a failure of trust boundaries from HTTP to SQL parser.',
        answer:
          'Untrusted HTTP input crossed into SQL string construction, so the SQL parser treated attacker text as code, not data. The trust boundary should be at parameterized queries/bind variables (and ORM parameterization), not at “sanitized concatenation.” Least-privilege DB roles and allow-listed identifiers limit blast radius if something slips. WAF rules are a backstop, not the primary control.',
      },
      {
        question:
          'XSS steals a session cookie — which layers failed (browser, HTTP flags, app encoding, CSP)?',
        answer:
          'The app failed to encode/escape untrusted output into HTML/JS context, so the browser executed attacker script in the origin. Cookie flags failed if the session cookie lacked HttpOnly (script-readable) or Secure/SameSite as appropriate. CSP failed or was absent as a defense-in-depth to block inline/exfil scripts. Fix encoding first, then cookie hardening and a tight CSP — TLS alone does not stop XSS.',
      },
      {
        question:
          'CSRF on a state-changing POST — relate cookies, SameSite, and same-origin policy.',
        answer:
          'SOP lets a site read another origin’s responses only with CORS; it still allows the browser to send credentialed cross-site requests in some cases. If session cookies are attached automatically, a malicious site can trigger a state-changing POST the user did not intend. SameSite=Lax/Strict reduces cookie sending on cross-site requests; synchronizer tokens or double-submit patterns defend when cookies are used. Prefer re-auth or anti-CSRF tokens for sensitive mutations; SameSite is not enough alone for all browsers and flows.',
      },
      {
        question:
          'Design caching that cannot leak tenant A’s data to tenant B.',
        answer:
          'Key every cache entry by tenant ID (and user/resource as needed); never use global keys for tenant-scoped data. Enforce authz before cache lookup or store only after authorization, and isolate namespaces or caches per tenant for high assurance. On membership/permission change, invalidate or version keys so stale authorized entries cannot be reused. Encrypt at rest if the cache is shared infrastructure; treat cache as a sensitive datastore, not a disposable hint.',
      },
      {
        question:
          'Load balancer marks instances healthy while they still stampede the DB on cold start — fix?',
        answer:
          'Separate liveness from readiness: readiness fails until pools are warmed, migrations checked, and critical dependencies respond. Stagger deploys, pre-warm connection pools, and use slow-start / connection draining on the LB. Cap concurrent DB connections during startup and prefer lazy init with backpressure over connecting everything at once. Health checks that only hit /ping without DB readiness hide the stampede.',
      },
      {
        question:
          'Virtual memory thrashing on the DB host — which Linux metrics and which DB symptoms?',
        answer:
          'Linux: high si/so in vmstat, major page faults, pressure stall info, and collapsing cache hit rates with rising disk latency. DB symptoms: query time spikes, buffer pool thrash, checkpoint/IO stalls, and connection pile-ups as everything waits on I/O. Working set exceeds RAM — fix by adding memory, shrinking work_mem/parallelism, reducing concurrency, or cutting oversized shared buffers that fight the OS. Swapping a DB host is an emergency, not a steady state.',
      },
      {
        question:
          'Apply dependency inversion so you can swap Postgres for a test double without rewriting domain logic.',
        answer:
          'Domain code depends on a repository/port interface; Postgres is an adapter implementing that port. Tests inject an in-memory or fake adapter without changing use-cases. Keep SQL and driver details behind the adapter so swapping engines or adding read replicas does not rewrite business rules. This is D of SOLID applied to persistence — invert ownership of the abstraction toward the domain.',
      },
      {
        question:
          'Where should rate limiting live (edge, gateway, app, DB) and why layered?',
        answer:
          'Edge/CDN absorbs volumetric abuse cheaply; API gateway enforces per-key/IP policies close to clients; app applies user/tenant business quotas; DB safeguards (statement timeouts, connection limits) are last-resort. Layering stops failures when one tier is bypassed or misconfigured. Limits should return 429 with clear headers and not rely on the DB to “be slow” as a throttle. Identity-aware limits need the app/gateway; IP limits alone fail behind NAT.',
      },
      {
        question:
          'Distinguish CPU saturation, lock waits, and DNS timeouts using concrete signals.',
        answer:
          'CPU saturation: high run-queue / CPU utilization, profiles show hot methods, latency rises with concurrency. Lock waits: DB wait events or app blocked on mutexes while CPU is low; traces show time in lock acquire. DNS timeouts: sparse errors with resolver latency spikes, SERVFAIL/timeouts in logs, and multi-service blips without CPU load. Never tune the wrong layer — match the signal to the bottleneck.',
      },
      {
        question:
          'How do TLS termination at a reverse proxy change your threat model inside the VPC?',
        answer:
          'Beyond the proxy, traffic may be plaintext HTTP on the internal network, so a compromised host or mis-routed packet can read/modify requests. You gained cheaper cert management and inspection at the edge but shifted trust to the VPC and proxy configuration. Mitigate with mTLS mesh, re-encrypt to backends, network segmentation, and strict security groups. Cookies and tokens in headers are still sensitive on that hop — treat the private network as hostile-capable.',
      },
      {
        question:
          'Design idempotent payment APIs across at-least-once HTTP retries and a SQL unique constraint.',
        answer:
          'Clients send an Idempotency-Key; the server stores key → response/outcome in a table with a UNIQUE constraint. Concurrent retries serialize on the unique insert; losers read the stored result instead of charging twice. At-least-once delivery from clients or queues is safe if side effects commit in the same transaction as the idempotency row. Timeouts after commit but before response still return the same outcome on retry.',
      },
      {
        question:
          'How does MVCC garbage collection interact with long transactions and disk growth?',
        answer:
          'MVCC keeps old row versions until no transaction can still see them; a long-open transaction pins a horizon and blocks vacuum/GC. Dead tuples accumulate, indexes bloat, and disk grows even if the logical table size is stable. Symptoms: table bloat, rising IO, and autovacuum falling behind. Keep transactions short; monitor bloat and vacuum lag; avoid idle-in-transaction sessions.',
      },
      {
        question:
          'Context switch storms from too many blocking server threads — what architectural change?',
        answer:
          'Too many blocked threads (sync I/O, one-thread-per-request) thrash the scheduler: high voluntary/involuntary context switches, CPU spent in kernel, latency cliffs. Move to async/evented I/O or a bounded worker pool sized to useful concurrency, with queues shedding load. Cap DB and outbound pools so threads are not waiting on thousands of sockets. Measure run-queue and switch rates before and after — fewer busier workers often win.',
      },
      {
        question:
          'Explain fork/exec of a worker process that then opens a Postgres socket — full stack.',
        answer:
          'Parent fork copies the process (COW pages); child exec loads the worker binary and closes unneeded inherited FDs. The worker creates a TCP socket, connects to Postgres (DNS → TCP → optional TLS), and authenticates with DB credentials. The kernel tracks the new FD in the child’s FD table; the DB spawns/assigns a backend for that connection. Prefer connecting after fork/exec so the parent never held DB credentials/sockets the child accidentally inherits.',
      },
      {
        question:
          'How would you explain CAP to justify an AP cache during a partition while the DB stays CP?',
        answer:
          'CAP: under partition, a system chooses availability or strict consistency for that data path. The primary DB stays CP — it may refuse writes or become unavailable rather than diverge. An AP cache can keep serving possibly stale reads so the UX stays up, with explicit staleness and invalidation rules. Clients that need linearizable reads must bypass the cache or fail closed during the partition.',
      },
      {
        question:
          'Secure file upload API: path traversal, content-type, authz, virus scanning, storage ACLs.',
        answer:
          'Authorize the upload to a specific user/tenant resource before accepting bytes; never trust client path or Content-Type alone. Store under generated object keys (no user path concat), validate magic bytes/size limits, and scan asynchronously in a worker. Storage ACLs/IAM make objects private; serve via short-lived signed URLs. Path traversal and XSS via downloaded content are app bugs — treat uploads as untrusted input at every layer.',
      },
      {
        question:
          'Observability triad on a checkout flow: which RED/USE metrics at each hop?',
        answer:
          'Metrics: RED on checkout API (rate, errors, duration) and USE on app/DB hosts (utilization, saturation, errors). Logs: structured payment/authz decisions with request IDs, never raw card data. Traces: spans across LB → checkout → payment → inventory → DB to find the slow hop. Alert on checkout success SLO and payment-provider error rates, not only CPU.',
      },
      {
        question:
          'Blue/green deploy: how do you avoid schema-break + connection drain issues together?',
        answer:
          'Expand/contract schema: deploy additive migrations first so old and new app versions both work; remove columns only after green is sole traffic. Drain connections on blue: LB stops new traffic, in-flight requests finish, pools close cleanly before process kill. Avoid locking migrations that stall both colors’ queries mid-cutover. Keep rollback: green unhealthy → shift traffic back without irreversible destructive DDL.',
      },
      {
        question:
          'Chatty microservice mesh vs modular monolith — argue with latency and failure domains.',
        answer:
          'A mesh of sync calls adds per-hop RTT, serialization, and partial-failure modes; p99 becomes the product of many tails. A modular monolith keeps in-process calls (cheap) with module boundaries for future extract, and one failure domain unless you isolate critically. Microservices help independent deploy and scaling when boundaries are clean; they hurt when every click fans out to ten services. Prefer monolith-plus-modules until a measured bottleneck or team boundary forces a split.',
      },
      {
        question:
          'How does HTTP/2 multiplexing interact with TCP head-of-line blocking vs HTTP/3/QUIC?',
        answer:
          'HTTP/2 multiplexes many streams on one TCP connection, avoiding HTTP/1.1 connection storms, but a lost TCP packet blocks all streams until retransmission — TCP HOL blocking. HTTP/3/QUIC runs streams over UDP with per-stream loss recovery, so one lost packet does not stall unrelated streams. Trade-off: H3 needs UDP allow-listing and different middlebox behavior; H2 is widely deployed. For lossy networks, H3 often improves tail latency; on clean LANs the gap shrinks.',
      },
      {
        question:
          'Index missing on FK used in joins — relate optimizer, nested loops, and app timeouts.',
        answer:
          'Without an index on the FK join column, the optimizer may choose nested-loop probes that seq-scan the child per parent row, exploding I/O and CPU. Query time stretches into seconds; app pools fill and HTTP clients hit timeouts/retries, amplifying load. EXPLAIN shows sequential scans and huge row estimates; adding the FK index turns probes into index lookups. Measure before/after — timeouts are often a symptom of the plan, not “slow network.”',
      },
      {
        question:
          'Session stickiness at LB vs JWT — trade-offs for scale and security.',
        answer:
          'Stickiness keeps server-side sessions on one instance — simple revocation, but uneven load and painful deploys when instances die. JWT (or opaque tokens in a shared store) lets any replica serve the request; JWTs complicate revocation and key rotation unless you keep a denylist or short TTL. Security: sessions in HttpOnly cookies resist XSS token theft better than JS-readable JWTs; both need CSRF care if cookies are used. Prefer shared session store or short-lived access tokens plus refresh for horizontal scale.',
      },
      {
        question:
          'Write a 90-second story weaving TCP, TLS, authz check, B+ tree lookup, and thread pool queueing.',
        answer:
          'Client completes TCP then TLS to our LB; the app worker is checked out from a thread pool (or waits if saturated). After authn, an authz check loads the user’s grant — indexed B+ tree lookup on the grants table via a pooled DB connection. The handler returns JSON over the same TLS session; we ACK at TCP while the worker returns to the pool. If the pool queue grows, p99 rises before the DB is hot — so we measure queue time, DB time, and lock waits separately.',
      },
    ],
    keyTakeaways: [
      'Cross-topic fluency is what graduate interviews actually stress',
      '35 prompts — rotate until answers feel automatic',
      'Always attach a measurement plan',
    ],
  },
)

export const finalPrepOverview: StudyPage = createPage(
  'd7-final-prep',
  'Final Interview Preparation',
  12,
  [
    'Use a structured last-mile plan before assessment centre day',
    'Combine rapid-fire, advanced, scenario, cross-topic, and whiteboard drills',
  ],
  {
    sections: [
      section('plan', '48-hour plan', [
        ol([
          'Skim Day 1–6 revision pages; mark weak topics',
          'Run one full day assessment you scored lowest on; review every miss',
          'Whiteboard the twelve boards on the Whiteboard page aloud',
          'Rapid Assessment (Interview Mode) twice; note recurring weak topics',
          'Drill 35 cross-topic prompts — speak 90 seconds each',
          'Sleep; light rapid-fire only on the morning of',
        ]),
      ]),
      section('banks', 'What sits in this module', [
        ul([
          'Whiteboard explanations (draw + narrate)',
          '35 cross-topic questions (systems thinking)',
          'Also use Day 7 battery: 50 rapid / 30 advanced / 20 scenario / prior cross set',
          'Things I MUST Be Able To Explain checklist',
        ]),
      ]),
      section('bar', 'Interview bar checklist', [
        ul([
          'Can I survive Why/How/Trade-off on indexes, TCP, TLS, MVCC, paging, authz?',
          'Can I narrate browser→DB without skipping OS/sockets?',
          'Can I secure an API without saying only “use HTTPS”?',
          'Can I scale without proposing Kafka in sentence one?',
          'Can I debug with metrics/logs/traces instead of guessing?',
        ]),
      ]),
    ],
    commonMistakes: ['Passive rereading instead of timed verbal drills'],
    interviewQuestions: [
      'What is your personal weakest Day 1–6 topic today?',
      'Which whiteboard do you fear most?',
      'What metric proves an API is healthy?',
      'What is your default slow-query playbook?',
      'What is your default secure-API playbook?',
    ],
    intermediateInterviewQuestions: [
      'Schedule your next 5 verbal drills.',
      'List three misconceptions you already corrected.',
      'Name one cross-topic story you will reuse.',
      'What readiness band are you targeting on Day assessments?',
      'How will you handle “I don’t know” in an interview?',
    ],
    advancedInterviewQuestions: [
      'Invent a follow-up chain for your weakest topic.',
      'Explain a production outage using Day 2–4 vocabulary.',
      'Argue for and against microservices for a graduate system-design prompt.',
      'Prioritize security fixes for a legacy app in one week.',
      'Describe how you calm down and restart a whiteboard mid-answer.',
    ],
    interviewReadyAnswers: [
      {
        question: 'I don’t know — how do you recover?',
        answer:
          'I say what I do know, state the gap honestly, and reason from first principles or ask a clarifying constraint. Example: “I haven’t implemented Raft, but consensus is needed here to elect a single primary; I’d look up the operational details rather than invent them.” Interviewers reward calibrated honesty plus structure.',
      },
    ],
    keyTakeaways: [
      'Final prep is active recall under time pressure',
      'Whiteboards + cross-topic stories beat passive notes',
      'Show trade-offs; never claim absolutes',
    ],
  },
)

export const finalPrepPages: StudyPage[] = [
  finalPrepOverview,
  whiteboardPage,
  cross35Page,
]
