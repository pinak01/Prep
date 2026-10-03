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
    'd7-p1',
    'System Design Mindset',
    12,
    [
      'Clarify functional requirements, non-functional constraints, and success metrics before designing',
      'Structure answers: API → data model → services → scale → trade-offs',
      'Estimate capacity with back-of-envelope math and state assumptions aloud',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'System design interviews test how you turn a vague product ask into a coherent, scalable architecture under uncertainty. The goal is not a perfect diagram — it is a clear decision process: what problem are you solving, for whom, at what scale, with which trade-offs.',
          ),
          h3('Why it exists'),
          p(
            'Real systems fail from unclear requirements and hidden non-functionals (latency, consistency, cost, operability). Interviewers want to see you surface those early, then design iteratively rather than jumping to Kafka + microservices.',
          ),
          h3('WHAT / WHY / HOW / WHEN'),
          ul([
            'WHAT: A structured conversation that produces APIs, data, components, and scaling plan.',
            'WHY: Ambiguity kills designs; clarifying constraints prevents over- or under-engineering.',
            'HOW: Ask → scope → high-level design → deep dives → bottlenecks → trade-offs.',
            'WHEN: Any open-ended "design X" prompt (URL shortener, news feed, chat, payment ledger).',
          ]),
          callout(
            'tip',
            'Say your assumptions out loud: "I\'ll assume 10M DAU, 100 req/s average, peak 10×, read-heavy 90/10." Interviewers correct you; silence is worse.',
            'Interview move',
          ),
        ]),
        section('how', 'How it works', [
          h3('Recommended answer skeleton (8–12 minutes)'),
          ol([
            'Clarify product: actors, core flows, out-of-scope items.',
            'Non-functionals: latency SLOs, consistency, availability, durability, privacy, cost.',
            'Capacity: QPS, storage growth, payload sizes, fan-out.',
            'API sketch: resources, auth, idempotency, pagination.',
            'Data model: entities, keys, indexes, hot partitions.',
            'High-level boxes: clients → edge → services → stores → async workers.',
            'Deep dive 1–2 bottlenecks: cache, queue, sharding, search, etc.',
            'Failure modes: retries, timeouts, idempotency, degraded modes.',
            'Trade-offs & evolution: what you\'d change at 10× scale.',
          ]),
          diagram(
            `flowchart LR
  A[Clarify] --> B[Estimate]
  B --> C[API + Data]
  C --> D[High-level]
  D --> E[Deep dive]
  E --> F[Failures]
  F --> G[Trade-offs]`,
            'Interview flow — do not skip clarify/estimate',
          ),
          h3('Capacity estimation pattern'),
          p(
            'Break into: requests/sec, reads vs writes, storage bytes/day, bandwidth. Always show units. Round to order-of-magnitude (powers of 10).',
          ),
          numerical({
            title: 'URL shortener — rough write QPS',
            problem:
              'Estimate average write QPS if 100M new short URLs are created per month.',
            given: '100M writes / month',
            formula: 'QPS ≈ total_ops / seconds_in_period',
            steps:
              'Seconds in 30 days ≈ 30 × 86,400 ≈ 2.6e6\n100e6 / 2.6e6 ≈ 38 writes/sec average\nPeak often 5–10× → design for ~200–400 write QPS',
            answer: '~40 avg write QPS; plan peak ~400 QPS',
            shortcut: 'Month ≈ 2.5e6 seconds; ops/month ÷ 2.5e6 ≈ avg QPS',
            mistake: 'Designing for peak as if it were average, or forgetting reads dominate',
          }),
        ]),
        section('example', 'Worked example', [
          example('Design: "URL shortener" — first 90 seconds', [
            p(
              'Candidate: "Functional: create short URL, redirect, optional expiry/analytics. Non-functional: redirect p99 < 50ms after edge, high availability, uniqueness of codes. Out of scope for v1: custom domains, A/B experiments."',
            ),
            p(
              'Then: "API: POST /urls {longUrl} → {code}; GET /{code} → 302. Data: code (PK), long_url, user_id, created_at, expires_at. Reads ≫ writes → cache by code; DB as source of truth; analytics async via queue."',
            ),
            callout(
              'info',
              'Notice: no CDN/Kafka yet. Introduce complexity only when a requirement forces it.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Over-scoping: designing a global multi-region mesh for a campus tool wastes time.',
            'Under-scoping: ignoring auth, idempotency, or abuse (spam short links).',
            'Premature microservices: start with modular monolith unless team/scale needs splits.',
            'Ignoring write path uniqueness: short-code collisions need retry or reserved ranges.',
            'Forgetting operational concerns: deploy, migrate schema, observe, roll back.',
          ]),
          table(
            ['Signal', 'Strong candidate', 'Weak candidate'],
            [
              ['Requirements', 'Asks about SLOs & scale', 'Draws boxes immediately'],
              ['APIs', 'Idempotent writes, pagination', 'Vague "service calls"'],
              ['Data', 'Keys, indexes, hotspots', 'Only entity names'],
              ['Failures', 'Timeouts, retries, poison msgs', 'Happy path only'],
            ],
          ),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'DBMS: indexes and isolation levels decide correctness under concurrent writes.',
            'Networks: RTT and TLS dominate single-request latency budgets.',
            'OS: connection pools and thread models limit concurrency before "scale out".',
            'Security: authn/authz and rate limits belong in the first design pass, not as an afterthought.',
            'OOP/LLD: service boundaries should map to cohesive modules with clear interfaces.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: "I\'d put a cache in front of the DB for redirects."'),
          p('Interviewer: "Why?"'),
          p(
            'Strong answer: "Redirects are read-heavy and cacheable by code; caching cuts DB QPS and p99 latency. Cache is a performance layer — DB remains source of truth for creates/updates."',
          ),
          p('Interviewer: "How do you handle cache stampede on a viral link?"'),
          p(
            'Strong answer: "Singleflight/request coalescing, short TTL + probabilistic early refresh, or lock around miss. Also pre-warm on create for hot codes if we can predict."',
          ),
          p('Interviewer: "Trade-off vs always hitting DB?"'),
          p(
            'Strong answer: "DB is simpler and always consistent, but won\'t meet latency/cost at high QPS. Cache adds invalidation complexity and stale-read windows."',
          ),
        ]),
      ],
      commonMistakes: [
        'Jumping to tech names (Kafka, Redis, Kubernetes) before clarifying requirements',
        'Never stating numbers — "high scale" without QPS/storage estimates',
        'Designing only the happy path; ignoring retries, duplicates, and partial failures',
        'Treating CAP as a slogan instead of naming which consistency clients actually need',
      ],
      interviewQuestions: [
        'Walk me through how you approach a system design interview.',
        'What questions do you ask before drawing any boxes?',
        'How do you estimate capacity for a new service?',
        'What belongs in a v1 vs later for a URL shortener?',
        'How do you decide monolith vs microservices?',
      ],
      intermediateInterviewQuestions: [
        'How would you structure the API and data model for a news feed?',
        'Where do you put rate limiting in a design, and why?',
        'How do idempotency keys change your write path?',
        'What SLOs would you propose for a payment authorization API?',
        'How do you choose between sync RPC and async messaging?',
      ],
      advancedInterviewQuestions: [
        'Design a globally available config service with strong read-your-writes for admins.',
        'How would you evolve a modular monolith into services without a big-bang rewrite?',
        'Where does backpressure belong in your architecture?',
        'How do you design for multi-tenant noisy-neighbor isolation?',
        'Walk through failure modes when the cache and DB disagree.',
        'How do you budget p99 latency across DNS, TLS, app, and DB?',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do you approach system design?',
          answer:
            'I clarify functional scope and non-functionals first — latency, consistency, availability, scale, and what\'s out of scope. I estimate QPS and storage so the design matches order-of-magnitude load. Then I sketch APIs and the data model, draw a simple high-level architecture, and deep-dive the bottlenecks: caching, sharding, queues, or search. I close with failure handling — timeouts, retries, idempotency — and explicit trade-offs. I add complexity only when a requirement forces it.',
        },
        {
          question: 'Monolith or microservices?',
          answer:
            'Default to a modular monolith with clear module boundaries when a small team owns the product — simpler deploy, transactions, and debugging. Split into services when you need independent scaling, different SLAs, or separate release ownership, and when the network/ops cost is justified. Interfaces and data ownership matter more than the number of deployables.',
        },
      ],
      keyTakeaways: [
        'Clarify + estimate before technology choices.',
        'Structure: API → data → services → scale → failures → trade-offs.',
        'Speak assumptions; invite correction.',
        'Complexity must earn its place against a stated requirement.',
      ],
    },
  ),

  createPage(
    'd7-p2',
    'Scalability, Caching & Load Balancing',
    14,
    [
      'Explain horizontal vs vertical scaling and when each fits',
      'Apply caching layers (CDN, app, DB) with invalidation awareness',
      'Describe load balancer roles, health checks, and session affinity trade-offs',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Scalability is the ability to handle growth in load without a linear collapse in latency or availability. Caching reduces repeated work; load balancing spreads work across instances. Together they are the three levers interviewers expect you to reason about early.',
          ),
          h3('Vertical vs horizontal'),
          ul([
            'Vertical: bigger machine (CPU/RAM/disk). Simple, limited by hardware, single point of failure unless HA pair.',
            'Horizontal: more machines behind a balancer. Needs statelessness or shared state; better elasticity.',
          ]),
          callout(
            'warning',
            'Horizontal scale fails if you keep sticky in-memory session state without a shared store — you\'ve just built many tiny silos.',
            'Sticky state trap',
          ),
        ]),
        section('how', 'How it works', [
          h3('Caching layers'),
          table(
            ['Layer', 'What it caches', 'Typical invalidation'],
            [
              ['CDN / edge', 'Static & some API GETs', 'TTL, purge API'],
              ['App / Redis', 'Hot keys, sessions, computed views', 'TTL, write-through/around, explicit delete'],
              ['DB buffer pool', 'Pages/blocks', 'DB engine managed'],
              ['OS page cache', 'File pages', 'Kernel managed'],
            ],
          ),
          h3('Cache strategies'),
          ul([
            'Cache-aside: app reads cache; on miss, read DB, populate cache. Flexible; risk of stampede.',
            'Write-through: write DB and cache together. Stronger freshness; write latency up.',
            'Write-behind: write cache, flush DB async. Fast writes; durability risk.',
          ]),
          h3('Load balancing'),
          ul([
            'L4 (TCP): fast, less app-aware; good for raw throughput.',
            'L7 (HTTP): route by path/host/header; can terminate TLS; richer health checks.',
            'Algorithms: round-robin, least-conn, consistent hashing (for cache affinity).',
            'Health checks: remove bad backends; pair with graceful drain on deploy.',
          ]),
          diagram(
            `flowchart TB
  C[Clients] --> CDN[CDN]
  CDN --> LB[Load Balancer]
  LB --> A1[App 1]
  LB --> A2[App 2]
  A1 --> Cache[(Redis)]
  A2 --> Cache
  A1 --> DB[(Primary DB)]
  A2 --> DB`,
            'Classic read-heavy web tier',
          ),
          numerical({
            title: 'Cache hit rate impact',
            problem:
              'DB can do 2k QPS. App needs 20k QPS reads. What hit rate is required if misses go to DB?',
            given: 'Need 20k QPS; DB capacity 2k QPS for misses',
            formula: 'miss_QPS = total_QPS × (1 − hit_rate) ≤ DB_capacity',
            steps:
              '20000 × (1 − h) ≤ 2000\n1 − h ≤ 0.1\nh ≥ 0.9',
            answer: 'At least 90% hit rate (ignoring other DB load)',
            shortcut: 'Required hit rate ≈ 1 − (DB_QPS / total_QPS)',
            mistake: 'Forgetting writes and admin queries also consume DB capacity',
          }),
        ]),
        section('example', 'Worked example', [
          example('Session store migration', [
            p(
              'Problem: sticky sessions pin users to one app instance; deploys and scale-out are painful.',
            ),
            p(
              'Design: move session to Redis; apps become stateless; LB uses round-robin/least-conn; set short session TTL + sliding refresh; protect Redis with auth and network policy.',
            ),
            p(
              'Trade-off: Redis becomes critical path — need HA Redis, timeouts, and fallback (re-login) under outage.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Cache consistency: stale reads vs invalidation complexity.',
            'Thundering herd: many clients miss the same key simultaneously.',
            'Hot key: one celebrity key overwhelms a single shard — need local cache or key splitting.',
            'LB affinity: helps stateful apps but harms even distribution and failover.',
            'CDN caching personalized GETs: privacy and correctness bugs.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'DBMS: buffer pool is a cache; app Redis is another — know which layer missed.',
            'Networks: cache saves RTTs to origin; LB health checks are network probes.',
            'Security: cache poisoning / open proxy risks at edge; never cache Authorization responses carelessly.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: "We\'ll use Redis in front of Postgres."'),
          p('Interviewer: "What\'s the consistency model for reads?"'),
          p(
            'Strong answer: "With cache-aside and delete-on-write, readers may see stale data until TTL/invalidation. If we need read-your-writes, we can bypass cache for the writer\'s session or use short TTL on user-specific keys."',
          ),
          p('Interviewer: "Complexity of always write-through?"'),
          p(
            'Strong answer: "Every write pays cache + DB latency and failure modes couple them; simpler freshness, worse write path and availability coupling."',
          ),
        ]),
      ],
      commonMistakes: [
        'Calling Redis a silver bullet without eviction, TTL, and stampede plans',
        'Assuming load balancer = infinite scale (DB/state still bottleneck)',
        'Using session affinity as the primary scaling strategy forever',
        'Caching without defining TTL/invalidation for mutable data',
      ],
      interviewQuestions: [
        'Horizontal vs vertical scaling — when each?',
        'Explain cache-aside vs write-through.',
        'What does an L7 load balancer give you over L4?',
        'How do you prevent cache stampede?',
        'Why make app servers stateless?',
      ],
      intermediateInterviewQuestions: [
        'How would you cache a personalized homepage safely?',
        'Consistent hashing — why for caches?',
        'How do health checks interact with rolling deploys?',
        'When is CDN caching wrong for an API?',
        'How do you size a Redis cluster for hot keys?',
      ],
      advancedInterviewQuestions: [
        'Design multi-layer caching for a social feed with fan-out.',
        'How do you handle split-brain between two Redis primaries?',
        'Explain read repair vs TTL-only invalidation.',
        'Where would you place rate limiting relative to the LB and app?',
        'How does connection pooling interact with many LB backends?',
        'Design graceful degradation when cache is down.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do caching and load balancing help scale a web app?',
          answer:
            'Load balancing spreads requests across stateless app instances so we can scale horizontally. Caching removes repeated work: CDN for static/edge, Redis for hot keys, DB buffer pool for pages. The critical design points are hit rate, invalidation, and failure modes — a cache miss storm or sticky in-memory sessions will undo horizontal scale. I measure QPS and latency, then add the cheapest layer that meets the SLO.',
        },
      ],
      keyTakeaways: [
        'Scale out needs shared-nothing or shared-state that can take the load.',
        'Every cache needs a freshness story.',
        'LB + health checks + drain = operable horizontal scale.',
        'Find the real bottleneck: CPU, DB, lock, or network — not just "add Redis".',
      ],
    },
  ),

  createPage(
    'd7-p3',
    'Databases, Queues & Consistency',
    14,
    [
      'Choose SQL vs NoSQL for access patterns and consistency needs',
      'Introduce queues for async work, decoupling, and spike absorption',
      'Discuss consistency, availability, and fault-tolerance trade-offs clearly',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Data stores and queues define correctness and coupling. SQL shines for relational integrity and multi-row transactions; NoSQL variants optimize specific access patterns and scale-out. Queues move work off the request path so spikes and slow dependencies do not block users.',
          ),
          h3('Consistency vocabulary (use precisely)'),
          ul([
            'Strong / linearizable: one globally agreed latest value for a key (expensive across regions).',
            'Sequential / causal: weaker but still principled ordering guarantees.',
            'Eventual: replicas converge; temporary staleness allowed.',
            'Read-your-writes / monotonic reads: session-centric guarantees users notice.',
          ]),
          callout(
            'mistake',
            'Do not say "CAP says you can\'t have C and A." State which partition behavior you choose and what clients observe during failover.',
            'CAP slogan trap',
          ),
        ]),
        section('how', 'How it works', [
          h3('SQL vs NoSQL decision table'),
          table(
            ['Need', 'Lean SQL', 'Lean NoSQL / specialized'],
            [
              ['Multi-row ACID', 'Yes', 'Hard / limited'],
              ['Flexible evolving docs', 'JSON columns or migrations', 'Document DB'],
              ['Massive key-value QPS', 'With cache/shard care', 'KV / wide-column'],
              ['Ad-hoc joins/analytics', 'Strong', 'Often via warehouse/ETL'],
              ['Simple primary-key lookup at huge scale', 'Possible with sharding', 'Natural fit'],
            ],
          ),
          h3('Queues & async patterns'),
          ul([
            'Decouple producer/consumer speed (upload → virus scan → notify).',
            'Absorb spikes; smooth DB write load.',
            'Enable retries with backoff; need idempotent consumers.',
            'At-least-once delivery is common → design for duplicates.',
          ]),
          diagram(
            `sequenceDiagram
  participant API
  participant Q as Queue
  participant W as Worker
  participant DB
  API->>DB: Write intent / outbox
  API->>Q: Enqueue job
  API-->>API: 202 Accepted
  W->>Q: Poll/receive
  W->>DB: Process idempotently
  W->>Q: Ack`,
            'Async processing with idempotent worker',
          ),
          h3('Replication & consistency'),
          p(
            'Primary-replica: writes to primary, reads may be stale on replicas. Multi-primary: higher write availability, conflict resolution required. Quorum R+W>N can tune durability vs latency.',
          ),
        ]),
        section('example', 'Worked example', [
          example('Checkout: sync vs async', [
            p(
              'Reserve inventory and create order: keep in a DB transaction (or saga with clear compensation) because money/stock correctness matters.',
            ),
            p(
              'Send confirmation email and update recommendations: enqueue — user should not wait on SMTP or ML.',
            ),
            p(
              'If using outbox pattern: write order + outbox row in one transaction; publisher relays to queue — avoids "DB committed but message lost".',
            ),
          ]),
          code(
            'sql',
            `-- Outbox row in same txn as business write
BEGIN;
INSERT INTO orders (...);
INSERT INTO outbox (topic, payload, created_at) VALUES ('order.created', :json, now());
COMMIT;`,
            'Transactional outbox — atomic intent + event',
          ),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Queue as infinite buffer: hides producer overload until disk fills — need backpressure/alerts.',
            'Exactly-once: usually "effectively once" via idempotency keys + dedupe store.',
            'Replica reads: faster/cheaper but stale; bad for read-your-writes after profile update.',
            'Sharding: scales writes; kills cross-shard transactions and complicates joins.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'DBMS Day 1–2: isolation levels explain what "consistent read" means under concurrency.',
            'Networks: replication lag is largely RTT + apply speed.',
            'OS: fsync and page cache affect durability latency for queue/DB commits.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: "We\'ll use eventual consistency for the feed."'),
          p('Interviewer: "Why is that acceptable?"'),
          p(
            'Strong answer: "Feed ranking tolerates seconds of lag; users care more about availability and latency. For wallet balance I would not choose eventual."',
          ),
          p('Interviewer: "How do consumers avoid double-charging?"'),
          p(
            'Strong answer: "Idempotency key per logical operation stored uniquely; retries reuse the key; consumer checks before side effects."',
          ),
        ]),
      ],
      commonMistakes: [
        'Using a queue without idempotent consumers',
        'Defaulting everything to NoSQL "for scale" without access patterns',
        'Reading from replicas immediately after a write without session stickiness',
        'Promising exactly-once without explaining dedupe',
      ],
      interviewQuestions: [
        'When would you choose SQL over NoSQL?',
        'Why use a message queue?',
        'What is eventual consistency?',
        'What is the outbox pattern?',
        'Primary-replica: who serves writes?',
      ],
      intermediateInterviewQuestions: [
        'At-least-once vs at-most-once vs exactly-once — practical view?',
        'How does quorum (R/W/N) trade latency for durability?',
        'When do you need a saga instead of a local transaction?',
        'How do you detect and handle poison messages?',
        'Explain read-your-writes after updating a profile.',
      ],
      advancedInterviewQuestions: [
        'Design idempotent payment capture with at-least-once queues.',
        'How would you shard a multi-tenant SaaS DB?',
        'Conflict resolution strategies for multi-primary writes.',
        'Compare Kafka log vs classic work queue for domain events.',
        'How do you bound replication lag and what do clients see when exceeded?',
        'Design a dual-write avoidance strategy when migrating datastores.',
      ],
      interviewReadyAnswers: [
        {
          question: 'SQL or NoSQL for this service?',
          answer:
            'I choose based on access patterns and consistency. If I need joins, constraints, and multi-row ACID, I start with SQL. If the workload is simple key lookups or append-only events at extreme QPS, a specialized store can win. Many systems use SQL for the source of truth and caches/queues/search indexes beside it. I avoid picking NoSQL only because it sounds scalable.',
        },
      ],
      keyTakeaways: [
        'Match store to access pattern and consistency need.',
        'Queues decouple and absorb spikes; demand idempotency.',
        'Name the consistency clients observe — especially after writes.',
        'Outbox/saga patterns exist because distributed dual-write is hard.',
      ],
    },
  ),

  createPage(
    'd7-p4',
    'Observability, Security & API Design',
    12,
    [
      'Cover logs, metrics, and traces as complementary signals',
      'Fold security controls into system answers without hand-waving',
      'Design clean, evolvable HTTP APIs with pagination and error contracts',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'A design that cannot be operated or secured will fail in production. Observability answers "what is broken and why?"; security answers "who can do what to which data?"; API design answers "how do clients integrate without constant breakage?"',
          ),
          h3('Three pillars'),
          ul([
            'Metrics: aggregates (QPS, p99, error rate, saturation) — dashboards & alerts.',
            'Logs: event details for a specific request/entity — debugging.',
            'Traces: request across services — find where latency hides.',
          ]),
          callout(
            'tip',
            'In interviews, name RED/USE style signals: Rate, Errors, Duration; Utilization, Saturation, Errors for resources.',
            'Ops vocabulary',
          ),
        ]),
        section('how', 'How it works', [
          h3('Security folded into design'),
          ul([
            'TLS everywhere externally; authn at edge/gateway; authz in the service owning the resource.',
            'Least privilege for DB/service credentials; secrets not in images.',
            'Input validation + parameterized queries; rate limits on public endpoints.',
            'Audit log for sensitive actions (permission changes, payouts).',
          ]),
          h3('API design essentials'),
          ul([
            'Resource-oriented URLs; proper methods (GET safe/idempotent, PUT idempotent).',
            'Consistent error body: code, message, request_id (no stack traces to clients).',
            'Cursor/limit pagination over huge OFFSET for large lists.',
            'Versioning strategy: URL /v1 or compatible evolution with additive fields.',
            'Idempotency-Key on payment-like POSTs.',
          ]),
          code(
            'json',
            `{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Balance too low",
    "request_id": "req_01HZX..."
  }
}`,
            'Stable machine-readable errors + correlation id',
          ),
          diagram(
            `flowchart LR
  Req[Request + trace_id] --> GW[API Gateway]
  GW --> Svc[Service]
  Svc --> DB[(DB)]
  Svc --> Log[Logs]
  Svc --> Met[Metrics]
  Svc --> Tr[Trace spans]`,
            'Every request should be correlatable',
          ),
        ]),
        section('example', 'Worked example', [
          example('Public "create report" API', [
            p(
              'POST /v1/reports with Idempotency-Key; auth via Bearer token; authz checks org membership; validate JSON schema; write row; enqueue async generation; return 202 with report_id.',
            ),
            p(
              'Observability: metric report_create_total{status}; histogram duration; log fields user_id, org_id, report_id, request_id; trace spans for DB + enqueue.',
            ),
            p(
              'Security: rate limit per user/org; never log PII payloads; TLS; principle of least privilege on queue publish credentials.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'High-cardinality metrics (user_id labels) explode time-series cost.',
            'PII in logs creates compliance incidents — redact.',
            'Over-versioning APIs vs breaking clients with silent field meaning changes.',
            'Gateway-only authz: microservices still need defense in depth for direct calls.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Security day: authn ≠ authz; cookies/JWT trade-offs.',
            'Networks: API gateways terminate TLS and enforce WAF/rate limits.',
            'Linux: correlating high latency with CPU steal, FD limits, disk saturation.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: "We\'ll add logging and monitoring."'),
          p('Interviewer: "What exactly do you alert on?"'),
          p(
            'Strong answer: "SLOs: availability and latency burn rates — e.g., 5xx ratio and p99 duration — not raw CPU alone. CPU is a diagnostic, not the user-facing SLO."',
          ),
          p('Interviewer: "How do you secure the API?"'),
          p(
            'Strong answer: "TLS, authenticate identity, authorize per resource, validate input, rate limit, least-privilege credentials, audit sensitive actions — layered, not a single checkbox."',
          ),
        ]),
      ],
      commonMistakes: [
        'Treating observability as "we\'ll add ELK later" with no signals named',
        'Security as a trailing bullet instead of controls on each external edge',
        'APIs without pagination, idempotency, or error contracts',
        'Logging secrets or full payment payloads',
      ],
      interviewQuestions: [
        'Metrics vs logs vs traces — when each?',
        'How do you design pagination for large collections?',
        'What belongs in an API error response?',
        'Where do you enforce authorization?',
        'What is an idempotency key used for?',
      ],
      intermediateInterviewQuestions: [
        'How would you define SLOs for a checkout API?',
        'Cursor vs offset pagination trade-offs?',
        'How do you prevent broken access control on /orders/{id}?',
        'What makes a good dashboard for on-call?',
        'How do you version a public REST API?',
      ],
      advancedInterviewQuestions: [
        'Design tracing across async queue boundaries.',
        'How do you detect silent correctness bugs with observability?',
        'Privacy-preserving logging strategy for GDPR-like constraints.',
        'Multi-tenant rate limiting fair sharing design.',
        'Zero-downtime API migration with dual-read/dual-write.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do you include security and observability in a design?',
          answer:
            'I treat them as first-class requirements. For security: TLS, authentication at the edge, authorization in the owning service, validation, rate limits, least privilege, and audit trails for sensitive actions. For observability: RED metrics for user journeys, structured logs with request_id, and traces across dependencies. Alerts should track SLO burn, not only host CPU. APIs get clear errors, pagination, and idempotency where retries happen.',
        },
      ],
      keyTakeaways: [
        'Metrics + logs + traces answer different questions — use all three.',
        'Security controls map onto edges, identities, and data stores.',
        'API contracts need pagination, errors, and idempotency for real clients.',
        'Alert on user-facing SLOs; use resource metrics to diagnose.',
      ],
    },
  ),
]
