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
    'd7-p10',
    'Browser Request to Backend',
    14,
    [
      'Narrate DNS → TCP → TLS → HTTP → reverse proxy → app → DB end-to-end',
      'Identify where latency can occur at each hop',
      'Connect caching, keep-alive, and connection reuse to real timings',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'This is the flagship cross-topic narrative. A single click exercises networks, OS sockets, security (TLS), app code, and databases. Interviewers ask you to walk the path and point at latency and failure modes without memorizing RFCs.',
          ),
        ]),
        section('how', 'How it works', [
          h3('Full path'),
          ol([
            'URL parse: scheme, host, path, query.',
            'DNS resolution: stub → recursive resolver → authoritative (cached TTLs matter).',
            'TCP 3-way handshake to VIP / edge IP.',
            'TLS handshake (unless 0-RTT/resumption): certificates, key exchange, cipher.',
            'HTTP request: headers, cookies, method; maybe HTTP/2 multiplexing.',
            'Edge/CDN/WAF/LB: routing, TLS terminate or pass-through, rate limits.',
            'App server: authn/authz, validate, business logic.',
            'DB/cache: pooled connection, query, commit.',
            'Response reverse path; browser renders; maybe more asset requests.',
          ]),
          diagram(
            `sequenceDiagram
  participant B as Browser
  participant D as DNS
  participant E as Edge/LB
  participant A as App
  participant C as Cache
  participant DB as DB
  B->>D: Resolve host
  B->>E: TCP+TLS
  B->>E: HTTP request
  E->>A: Forward
  A->>C: Get
  alt miss
    A->>DB: Query
  end
  A->>E: Response
  E->>B: Response`,
            'One request, many systems',
          ),
          h3('Latency budget (illustrative)'),
          table(
            ['Hop', 'Order-of-magnitude', 'Notes'],
            [
              ['DNS (cold)', '10–100ms+', 'Cached: near 0'],
              ['TCP+TLS (cold)', '1–3 RTTs', 'Resumption cheaper'],
              ['Edge→app', '1–5ms local; 30–80ms cross-region', 'Placement matters'],
              ['App CPU', 'sub-ms–tens of ms', 'Business logic'],
              ['Cache hit', 'sub-ms–2ms', 'Redis local'],
              ['DB query', '1–50ms+ ', 'Plans, locks, I/O'],
            ],
          ),
          numerical({
            title: 'Cold vs warm HTTPS API call',
            problem:
              'RTT=20ms. Cold: DNS 30ms + TCP 1 RTT + TLS 2 RTT + HTTP 1 RTT + app/DB 25ms. Warm keep-alive: HTTP 1 RTT + 25ms. Compare.',
            given: 'RTT 20ms',
            formula: 'sum of sequential waits',
            steps:
              'Cold: 30 + 20 + 40 + 20 + 25 = 135ms\nWarm: 20 + 25 = 45ms',
            answer: 'Cold ~135ms vs warm ~45ms',
            shortcut: 'Connection reuse often beats micro-optimizing handlers',
            mistake: 'Blaming DB for latency that is mostly cold handshakes',
          }),
        ]),
        section('example', 'Worked example', [
          example('Narrate: GET https://api.example.com/v1/me', [
            p(
              '"Browser checks DNS cache, else resolver. Connects to edge IP with TCP then TLS verifying the cert chain. Sends HTTP/2 GET with Authorization. LB routes to a healthy app instance. App validates JWT, checks authz, reads user from Redis; on miss, SELECT by PK from Postgres via pool, populates cache. Returns JSON 200. Total p99 dominated by TLS cold starts and DB misses — not JSON serialization."',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'HTTP/3/QUIC changes handshake story — know it exists; details optional.',
            'TLS termination at LB: simpler apps, hop LB→app may be plaintext in private net (or mTLS).',
            'Too many domains: more DNS+TLS; domain sharding less relevant with HTTP/2.',
            'Service worker / browser cache can short-circuit network entirely.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Security: cookies SameSite, CSRF on state-changing routes, XSS in HTML responses.',
            'OS: each hop is sockets/FDs; time in kernel vs user.',
            'DBMS: index on user id makes /me a point lookup.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Interviewer: "Where would you look first if p99 doubled?"'),
          p(
            'Strong answer: "Split client-seen latency: DNS/TLS/connect vs TTFB vs download. Metrics: edge, app, DB. Traces show which span grew. Common culprits: cache hit-rate drop, DB locks, dependency latency, GC, or AZ imbalance."',
          ),
        ]),
      ],
      commonMistakes: [
        'Skipping DNS/TLS in the narrative',
        'Assuming every request pays full handshake (keep-alive/resumption)',
        'Not naming where authn/authz runs',
        'Ignoring geographic placement in latency',
      ],
      interviewQuestions: [
        'Walk through what happens when you type a URL and hit enter.',
        'Where does TLS sit in the request path?',
        'How does DNS caching affect performance?',
        'What does a reverse proxy do?',
        'Name three places latency hides in this path.',
      ],
      intermediateInterviewQuestions: [
        'HTTP/1.1 keep-alive vs HTTP/2 multiplexing?',
        'When should TLS terminate at the LB vs app?',
        'How do cookies travel on this path?',
        'How does a CDN change the narrative?',
        'Explain HSTS at a high level.',
      ],
      advancedInterviewQuestions: [
        'Budget p99 for a multi-dependency request with fan-out.',
        'How do connection pools between LB and app interact with client keep-alive?',
        'Debug intermittent TLS handshake failures.',
        'Compare edge auth vs app auth for JWT validation.',
        'How would you design for 0-downtime certificate rotation?',
      ],
      interviewReadyAnswers: [
        {
          question: 'Browser to backend — full story?',
          answer:
            'The browser resolves DNS, opens TCP to the edge, completes TLS, then sends HTTP. An LB or reverse proxy routes to an app instance. The app authenticates and authorizes, then hits cache or DB over a pooled connection and returns a response. Latency is the sum of DNS, handshakes, RTTs, app time, and data-store time; keep-alive and caching remove repeated fixed costs. I can deep-dive any hop — usually TLS cold start, chatty DB, or cross-region RTT.',
        },
      ],
      keyTakeaways: [
        'Memorize the hop order; reason about each.',
        'Cold handshake ≠ warm request cost.',
        'Traces beat guessing which hop regressed.',
        'Security and performance share this path.',
      ],
    },
  ),

  createPage(
    'd7-p11',
    'HTTPS, Indexes & Context Switches',
    12,
    [
      'Explain HTTPS/TLS handshake essentials and what TLS does/does not protect',
      'Explain how a DB index (B+ tree) speeds lookups and costs writes',
      'Describe what happens during a context switch and why it matters under load',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Three "explain like an engineer" classics often asked back-to-back: secure transport, database indexing, and OS context switching. Together they span security, DBMS, and OS — perfect Day-7 synthesis.',
          ),
        ]),
        section('how', 'How it works', [
          h3('HTTPS / TLS (essentials)'),
          ul([
            'Confidentiality: encryption of bytes on the wire.',
            'Integrity: detect tampering (MACs/AEADs).',
            'Authentication: certificate proves server identity (client auth optional).',
            'Handshake: agree versions/ciphers, authenticate, derive keys; then encrypted app data.',
            'Does NOT by itself: authorize users, stop XSS, or make JSON schemas valid.',
          ]),
          diagram(
            `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: ClientHello
  S->>C: ServerHello + Certificate
  C->>C: Verify chain
  C->>S: Key share / Finished
  S->>C: Finished
  C->>S: Encrypted HTTP`,
            'TLS then HTTP — order matters in explanations',
          ),
          h3('Indexes (B+ tree mental model)'),
          ul([
            'Index: extra structure mapping key → row location (or covering columns).',
            'B+ tree: high fan-out, balanced; point lookup ≈ few page reads (tree height).',
            'Helps WHERE/JOIN/ORDER BY matching leftmost prefix of composite keys.',
            'Costs: extra storage, slower writes, maintenance (bloat/vacuum).',
          ]),
          code(
            'sql',
            'CREATE INDEX idx_orders_user_created\n  ON orders(user_id, created_at DESC);\n-- Speeds: WHERE user_id=? ORDER BY created_at DESC LIMIT 20\n-- Weak for: WHERE created_at BETWEEN ... (leftmost prefix missing)',
            'Composite index prefix rule',
          ),
          h3('Context switch'),
          p(
            'Scheduler pauses one thread/process and resumes another: save registers/PC to PCB/TCB, switch address space if process change (more expensive), restore, resume. TLB/cache effects add soft costs. Too many runnable threads → thrash.',
          ),
        ]),
        section('example', 'Worked example', [
          example('Tie-together scenario', [
            p(
              'HTTPS protects the wire to your API. An index on session_token makes "lookup session" O(log n) page reads. A thread-per-request server under huge concurrency burns time in context switches — prefer pooling/eventing so CPU runs handlers, not scheduler overhead.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'TLS CPU cost vs cleartext on private networks — prefer encrypt; hardware offload helps.',
            'Over-indexing: write-heavy tables suffer; unused indexes are pure cost.',
            'Process switch > thread switch typically (address space).',
            'Voluntary vs involuntary switches — blocking I/O vs time slice.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'TLS certificates ↔ PKI trust stores (security day).',
            'Index pages ↔ buffer pool / page cache (DBMS+OS).',
            'Context switches ↔ socket server models (Networks+OS).',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Interviewer: "Why not index every column?"'),
          p(
            'Strong answer: "Each index slows inserts/updates and uses space. I index for measured query patterns and high selectivity predicates, and I drop unused indexes."',
          ),
          p('Interviewer: "Is HTTPS enough for API security?"'),
          p(
            'Strong answer: "Necessary for transport, not sufficient — still need authn/authz, validation, and XSS/CSRF controls depending on clients."',
          ),
        ]),
      ],
      commonMistakes: [
        'Saying TLS authenticates the user (it authenticates the server by default)',
        'Thinking indexes speed every query including SELECT * large scans always',
        'Confusing context switch with mode switch (user↔kernel) — related but distinct',
        'Claiming B-tree and hashmap indexes are interchangeable for range scans',
      ],
      interviewQuestions: [
        'What does TLS provide?',
        'Walk through a TLS handshake at a high level.',
        'How does a B+ tree index help a point lookup?',
        'What is a context switch?',
        'Process switch vs thread switch?',
      ],
      intermediateInterviewQuestions: [
        'Certificate chain of trust — explain.',
        'Covering index — what and why?',
        'When does an index make a query slower?',
        'How do syscalls relate to mode switches?',
        'TLS session resumption — why faster?',
      ],
      advancedInterviewQuestions: [
        'Compare clustered vs secondary indexes (engine-dependent).',
        'How do speculative execution mitigations affect context-switch costs?',
        'mTLS for service identity vs user JWT.',
        'Index skip scan / bitmap index OR conditions (engine-specific awareness).',
        'Soft vs hard IRQ interaction with latency (high level).',
      ],
      interviewReadyAnswers: [
        {
          question: 'Explain HTTPS, indexes, and context switches briefly.',
          answer:
            'HTTPS is HTTP over TLS: the handshake authenticates the server via certificates and establishes encryption keys so data is confidential and integrity-protected on the wire. A DB index, typically a B+ tree, lets us find rows by key in a few page reads instead of scanning; it speeds reads that match the index and costs write overhead. A context switch is the OS saving one thread\'s CPU state and restoring another\'s so many tasks can share cores — essential for concurrency, expensive if we thrash with too many runnable threads.',
        },
      ],
      keyTakeaways: [
        'TLS: encrypt + integrity + server auth; not full app security.',
        'Indexes: read win, write/storage cost; match query patterns.',
        'Context switches enable sharing; excess causes thrashing.',
        'Be ready to explain all three in under two minutes each.',
      ],
    },
  ),

  createPage(
    'd7-p12',
    'Processes, APIs & Scaling Databases',
    12,
    [
      'Explain how Linux creates a process (fork/exec mental model)',
      'Secure a REST API with practical control layers',
      'Outline database scaling: indexes, replicas, partitioning, sharding',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Another triple combo: OS process creation, API security, and DB scale-out. These appear in both theory questions and design follow-ups ("how does the worker start?", "how do you secure this?", "DB is the bottleneck — now what?").',
          ),
        ]),
        section('how', 'How it works', [
          h3('fork / exec mental model'),
          ul([
            'fork(): create child as copy of parent (copy-on-write pages modern Linux).',
            'exec(): replace address space with a new program image.',
            'Typical shell: fork child → exec command; parent can wait().',
            'posix_spawn / language runtimes may optimize but the model remains.',
          ]),
          code(
            'c',
            'pid_t pid = fork();\n if (pid == 0) {\n   execlp("grep", "grep", "error", "app.log", NULL);\n   _exit(127);\n }\n waitpid(pid, &status, 0);',
            'Child execs; parent waits — classic pattern',
          ),
          h3('Secure REST API (layered)'),
          ol([
            'TLS only; HSTS for browsers.',
            'Authenticate (session/JWT/OAuth) — identity.',
            'Authorize per resource (object-level checks).',
            'Validate inputs; parameterized DB access.',
            'Rate limit; idempotency for unsafe retries.',
            'Least-privilege credentials; audit sensitive ops.',
            'Safe errors; no stack traces or secret leakage.',
          ]),
          h3('Scaling databases'),
          table(
            ['Technique', 'Helps', 'Watch out'],
            [
              ['Query/index tuning', 'Most first wins', 'Wrong index / bad plans'],
              ['Vertical scale', 'Simple boost', 'Ceiling + cost'],
              ['Read replicas', 'Read QPS', 'Lag, RYW'],
              ['Caching', 'Hot keys', 'Invalidation'],
              ['Partitioning', 'Manage large tables', 'Cross-partition queries'],
              ['Sharding', 'Write scale', 'Cross-shard txs, ops'],
              ['CQRS / warehouse', 'Heavy analytics off primary', 'Sync lag'],
            ],
          ),
        ]),
        section('example', 'Worked example', [
          example('Worker process + API + DB scale', [
            p(
              'API accepts export job (secured, 202 + id). Worker processes are supervised (systemd/k8s): each is a process running the worker binary (image start ≈ exec). Workers pull queue jobs idempotently. DB: index on (org_id, created_at); replicas for read dashboards; shard later if multi-tenant write volume demands.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'fork bombs / unbounded process spawn — supervise and limit.',
            'JWT in localStorage XSS risk vs HttpOnly cookies CSRF risk — pick consciously.',
            'Sharding before indexes is a common premature move.',
            'Replica failover with async replication → possible data loss (RPO).',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Pipes/sockets: how processes compose on one machine vs over network.',
            'OOP ports for payment/DB interfaces inside the API process.',
            'Observability on API and DB metrics guides which scaling lever to pull.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Interviewer: "Our writes are bottlenecked — replicas didn\'t help. Why?"'),
          p(
            'Strong answer: "Replicas scale reads. Writes still hit the primary. For writes I look at indexes slowing inserts, lock contention, batch writes, partitioning/sharding, or queueing non-critical writes."',
          ),
        ]),
      ],
      commonMistakes: [
        'Saying fork alone runs a new program without exec',
        'Securing APIs with TLS only',
        'Adding shards before measuring query plans',
        'Using replicas to scale writes',
      ],
      interviewQuestions: [
        'Explain fork and exec.',
        'How do you secure a REST API?',
        'Ways to scale a relational database?',
        'Why don\'t read replicas help write load?',
        'Authn vs authz on an API endpoint?',
      ],
      intermediateInterviewQuestions: [
        'Copy-on-write after fork — why efficient?',
        'Object-level authorization example.',
        'Horizontal partitioning vs sharding terminology.',
        'When to introduce CQRS?',
        'Process vs thread for a worker pool?',
      ],
      advancedInterviewQuestions: [
        'Online resharding strategies.',
        'Secure multi-tenant row-level security patterns.',
        'Blue/green with DB migrations and expand-contract.',
        'Privilege separation with multiple processes.',
        'Global primary vs regional primaries for writes.',
      ],
      interviewReadyAnswers: [
        {
          question: 'fork/exec, secure APIs, and scaling DBs — connected answer?',
          answer:
            'Linux creates processes by forking a child and execing a new program image — that\'s how workers and services start under supervisors. A REST API is secured in layers: TLS, authentication, authorization, validation, rate limits, and least privilege — not by HTTPS alone. Databases scale first by correct indexes and queries, then vertical scale, caching, and read replicas; write scale needs partitioning or sharding and careful consistency. I pick the lever that matches whether I\'m read-bound, write-bound, or lock-bound.',
        },
      ],
      keyTakeaways: [
        'fork copies; exec replaces — together they start programs.',
        'API security is layered controls.',
        'Replicas ≠ write scale.',
        'Measure before shard.',
      ],
    },
  ),

  createPage(
    'd7-p13',
    'Debugging a Slow Backend',
    12,
    [
      'Build a systematic debugging playbook: metrics → logs → traces → DB → network → host',
      'Prioritize hypotheses under interview time pressure',
      'Communicate findings with evidence, not vibes',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Debugging interviews test structured thinking. Random restarts and "maybe Redis?" waste time. You need a playbook that narrows the layer quickly and proves the bottleneck with signals.',
          ),
          callout(
            'tip',
            'Always ask: Is it all endpoints or one? All users or a tenant? Started after a deploy? Correlate with change.',
            'Scope first',
          ),
        ]),
        section('how', 'How it works', [
          h3('Playbook'),
          ol([
            'Define symptom: latency, errors, or both; SLO impact; since when.',
            'Dashboards: edge vs app vs dependency RED metrics.',
            'Traces: which span regressed?',
            'If app CPU high: profiles/hot locks; if low CPU + high latency: waiting on I/O/deps.',
            'DB: slow query log, plans, locks, connection saturation, hit rates.',
            'Network: DNS, TLS errors, retries, timeouts, dependency health.',
            'Host: CPU steal, iowait, swap, FD limits, thread counts.',
            'Mitigate: rollback, feature flag, shed load, scale, fix query — then hard fix.',
          ]),
          diagram(
            `flowchart TD
  S[Symptom] --> Scope[Scope blast radius]
  Scope --> M[Metrics RED]
  M --> T[Traces]
  T --> Branch{Where?}
  Branch -->|App| P[Profile / locks]
  Branch -->|DB| Q[Queries / locks / pool]
  Branch -->|Dep| D[Timeouts / retries]
  Branch -->|Host| H[CPU disk mem FD]`,
            'Narrow before deep-diving code',
          ),
          table(
            ['Pattern', 'Likely layer'],
            [
              ['p99↑ p50 flat', 'Tail deps, GC, locks, noisy neighbor'],
              ['All instances CPU 100%', 'Infinite loop, regex, crypto, compression'],
              ['DB connections maxed', 'Pool leak, thundering herd, missing index load'],
              ['iowait high', 'Disk / missing cache / huge scans'],
              ['Error spikes + latency', 'Retries amplifying load'],
            ],
          ),
        ]),
        section('example', 'Worked example', [
          example('Interview story', [
            p(
              '"p99 on checkout jumped from 200ms to 2s after deploy. Traces show DB span growth. Slow query log: sequential scan on orders missing new filter column index. CPU on DB up; app CPU fine. Fix: add index concurrently, rollback feature flag while building. Lesson: migration shipped without index for new predicate."',
            ),
          ]),
          code(
            'sql',
            `-- Always check the plan under production-like data
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE org_id = $1 AND status = 'pending';`,
            'Plans beat guesses',
          ),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Scaling app pods can worsen DB storms — fix amplification first.',
            'Retry storms: exponential backoff + jitter + circuit breakers.',
            'Caching as blind fix can hide DB issues and create consistency bugs.',
            'Profiler overhead in prod — use sampling.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Observability pillars from d7-p4.',
            'N+1 and pools from d7-p6.',
            'Host tooling from d7-p8.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Interviewer: "What if traces are missing?"'),
          p(
            'Strong answer: "Fall back to synchronized metrics timestamps, structured logs with request_id, and host/DB stats. I\'d also add minimal tracing around the suspect path as part of mitigation."',
          ),
        ]),
      ],
      commonMistakes: [
        'Jumping into code before seeing which layer regressed',
        'Ignoring retries as a latency/error multiplier',
        'Scaling the wrong tier',
        'No rollback/feature-flag plan while investigating',
      ],
      interviewQuestions: [
        'How do you debug a slow API?',
        'Metrics vs logs vs traces in an incident?',
        'Signs the database is the bottleneck?',
        'What is a retry storm?',
        'How do you scope an incident quickly?',
      ],
      intermediateInterviewQuestions: [
        'p50 fine but p99 bad — hypotheses?',
        'How do circuit breakers help?',
        'Diagnose connection pool exhaustion.',
        'How do you tell lock wait vs I/O wait in Postgres/MySQL?',
        'When is rollback better than hot-fixing forward?',
      ],
      advancedInterviewQuestions: [
        'Debug distributed latency without 100% tracing sampling.',
        'GC thrashing vs lock contention — differentiate.',
        'Multi-tenant noisy neighbor isolation under incident.',
        'Load-test fidelity gaps that miss production tails.',
        'Design an incident runbook for on-call juniors.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Walk me through debugging a slow backend.',
          answer:
            'I scope the blast radius and timeline first, then use RED metrics to see whether the edge, app, or a dependency regressed. Traces tell me which span grew; if it\'s the DB I check plans, locks, and pools; if it\'s the host I check CPU, iowait, swap, and FDs. I watch for retry amplification. I mitigate with rollback or load shedding when needed, then fix the root cause with evidence — not guesses.',
        },
      ],
      keyTakeaways: [
        'Scope → metrics → traces → layer deep-dive.',
        'Waiting vs running CPU points to different fixes.',
        'Retries can be the outage.',
        'Mitigate first if users are burning.',
      ],
    },
  ),

  createPage(
    'd7-p14',
    'Capstone Synthesis',
    10,
    [
      'Integrate all 7 days into coherent interview narratives',
      'Self-check coverage gaps before assessment centre day',
      'Practice switching depths: 60s overview ↔ deep dive',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Capstone day is about fluency: weaving DBMS, OS, networks, Linux, OOP, security, and system design into answers that sound like an engineer who has operated systems — not seven disconnected courses.',
          ),
        ]),
        section('how', 'How it works', [
          h3('Narrative templates'),
          ul([
            'Design ask → clarify → API/data → boxes → bottleneck deep dive → failures → security/ops.',
            'Explain ask → definition → why → how (steps/diagram) → complexity/cost → trade-off → example.',
            'Debug ask → scope → signals → hypothesis ranking → evidence → mitigate → fix.',
          ]),
          h3('Cross-day map'),
          table(
            ['Day', 'Pull into answers when…'],
            [
              ['1–2 DBMS', 'Schema, indexes, txns, isolation, deadlocks'],
              ['3 Networks', 'Latency, TCP/TLS/DNS, LB, HTTP'],
              ['4 OS/Linux', 'Processes, VM, scheduling, tools'],
              ['5 OOP/LLD', 'Boundaries, SOLID, patterns sparingly'],
              ['6 Security', 'Authn/authz, TLS, OWASP defenses'],
              ['7 Integration', 'End-to-end designs and trade-offs'],
            ],
          ),
          h3('Self-check checklist'),
          ul([
            'Can I explain TCP handshake and why 3-way?',
            'Can I explain isolation levels and a deadlock cycle?',
            'Can I narrate browser→DB with latency points?',
            'Can I secure a REST endpoint in layers?',
            'Can I choose SQL/cache/queue with reasons?',
            'Can I debug slow p99 with a playbook?',
            'Can I discuss fork/exec, VM, and context switch crisply?',
            'Can I apply SOLID without pattern spam?',
          ]),
        ]),
        section('example', 'Worked example', [
          example('90-second synthesis: "Design a URL shortener"', [
            p(
              'Clarify scale and redirect latency. API POST/GET. Data: code PK, long URL. App stateless behind LB; Redis cache-aside on code; Postgres source of truth with unique index on code; async analytics via queue (idempotent). TLS at edge; rate limit creates; parameterized SQL. On failure: cache miss storm controls; DB pool bounds. Trade-off: hash vs counter codes; eventual analytics OK, redirect correctness not.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Depth vs breadth: offer overview, ask where to dive.',
            'Silence vs wrong detail: state assumptions; correctable beats frozen.',
            'Buzzwords without mechanisms fail follow-ups — always have HOW.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          p(
            'Every strong answer cites mechanisms: B+ tree pages, TLS handshakes, WAL fsync, epoll, MVCC versions, CSRF tokens — not just labels.',
          ),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Interviewer: "What are you weakest on?"'),
          p(
            'Strong answer: Name a real gap, what you\'re doing about it, and pivot to a related strength with a crisp explanation. Self-awareness beats bluffing.',
          ),
        ]),
      ],
      commonMistakes: [
        'Treating days as silos in answers',
        'No numbers / no failure modes in designs',
        'Cannot go one level deeper when asked "how?"',
        'Skipping security and observability entirely',
      ],
      interviewQuestions: [
        'Give a 60s overview of how the web stack works.',
        'Pick one topic from each day and connect them.',
        'What trade-off do you always mention in designs?',
        'How do you handle a question you don\'t know?',
        'What is your debugging philosophy?',
      ],
      intermediateInterviewQuestions: [
        'Design + secure + observe a file upload service in 8 minutes.',
        'Explain consistency from DB isolation to replica lag.',
        'Connect virtual memory to database performance.',
        'Where do SOLID and microservices disagree?',
        'Prioritize fixes in a dual outage (DB + cache).',
      ],
      advancedInterviewQuestions: [
        'Lead a whiteboard design while mentoring a quieter partner.',
        'Justify RPO/RTO for a payments ledger.',
        'Postmortem narrative: latency regression root cause.',
        'Multi-region story with concrete consistency UX.',
        'Argue against a fashionable technology in your design.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do you integrate everything you studied?',
          answer:
            'I use templates. For design: requirements, API and data, simple architecture, deep-dive bottlenecks, failures, security and ops. For explain questions: what, why, how, trade-offs, example. For debug: scope, metrics, traces, layer, mitigate, fix. I pull DBMS when correctness and indexes matter, networks for latency, OS for resource limits, security for trust boundaries, and OOP for module seams. If I don\'t know something, I say so, reason from first principles, and check assumptions with the interviewer.',
        },
      ],
      keyTakeaways: [
        'Fluency = mechanisms + trade-offs + structure.',
        'Offer overview; dive on cue.',
        'Security and operability are part of design.',
        'Use the must-explain list as your final gate.',
      ],
    },
  ),
]
