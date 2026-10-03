import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from '../helpers'

/** Day 7 module checkpoints — system design + integration (skip revision/final) */
export const day7ModuleQuizzes: Record<string, QuizQuestion[]> = {
  // ===== d7-m1 System Design Fundamentals =====
  'd7-m1': [
    q({
      id: 'd7-m1-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['System Design', 'Requirements'],
      learningObjective: 'Start design interviews by clarifying constraints',
      question:
        'What should you do first in a system design interview after hearing “design a URL shortener”?',
      options: [
        'Immediately draw Kafka and 20 microservices',
        'Clarify functional scope, non-functionals (QPS, latency, consistency), and assumptions aloud',
        'Only discuss UI colors',
        'Refuse capacity estimation forever',
      ],
      correctAnswer: 1,
      explanation:
        'Ambiguity kills designs. Surface requirements and constraints before choosing components.',
      whyWrong: {
        '0': 'Jumping to tech stacks without constraints is a common fail.',
        '2': 'UI theming is not the interview focus.',
        '3': 'Back-of-envelope math is expected.',
      },
      interviewTakeaway: 'Ask → estimate → API/data → boxes → trade-offs.',
    }),
    tf({
      id: 'd7-m1-q02',
      difficulty: 'easy',
      topics: ['Caching', 'Consistency'],
      learningObjective: 'State the core cache freshness trade-off',
      question:
        'True or False: A TTL cache can trade strong immediate consistency for lower latency and origin load.',
      correct: true,
      explanation:
        'TTL caches intentionally allow bounded staleness. Name the consistency window when you propose caching.',
      whyWrong: {
        '1': 'False would deny the central cache trade-off.',
      },
      interviewTakeaway: 'Caches buy speed; pay with freshness windows.',
    }),
    q({
      id: 'd7-m1-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Load Balancing', 'Scalability'],
      learningObjective: 'Identify load balancer purpose',
      question:
        'A reverse proxy load balancer in front of app replicas primarily helps by:',
      options: [
        'Replacing the need for authentication',
        'Distributing requests across instances and enabling horizontal scale / health-based routing',
        'Guaranteeing serializable DB isolation',
        'Eliminating all network latency',
      ],
      correctAnswer: 1,
      explanation:
        'LBs spread traffic, hide instance failures, and support scaling out. They do not replace auth or DB isolation semantics.',
      whyWrong: {
        '0': 'Auth remains an app/identity concern.',
        '2': 'Isolation is a database property.',
        '3': 'LBs cannot remove physics/RTT.',
      },
      interviewTakeaway: 'LB = scale-out + health routing at the edge.',
    }),
    q({
      id: 'd7-m1-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Caching', 'Cache-aside'],
      learningObjective: 'Describe cache-aside read path',
      question:
        'In cache-aside (lazy loading), on a read miss the service typically:',
      options: [
        'Writes only to cache and never to DB',
        'Loads from DB, populates cache, returns data',
        'Deletes the database row',
        'Disables the load balancer',
      ],
      correctAnswer: 1,
      explanation:
        'Cache-aside: app checks cache → on miss reads DB → fills cache. Writes usually update DB then invalidate/update cache.',
      whyWrong: {
        '0': 'Durable source of truth remains the DB for most designs.',
        '2': 'Misses do not delete data.',
        '3': 'LB is unrelated to a single miss.',
      },
      interviewTakeaway: 'Cache-aside: miss → DB → fill cache.',
    }),
    q({
      id: 'd7-m1-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Queues', 'Async'],
      learningObjective: 'Choose queues for decoupling and spike absorption',
      question:
        'When is introducing a message queue most justified?',
      options: [
        'To make every read strongly consistent across regions automatically',
        'To absorb write spikes and decouple producers from slow consumers (emails, indexing, fan-out)',
        'To replace TLS',
        'To avoid defining APIs',
      ],
      correctAnswer: 1,
      explanation:
        'Queues smooth load and enable async work. They add eventual processing and operational complexity — use with a clear reason.',
      whyWrong: {
        '0': 'Queues do not magically create strong cross-region consistency.',
        '2': 'Security transport is separate.',
        '3': 'APIs remain necessary.',
      },
      interviewTakeaway: 'Queue when work can be async / spike-prone.',
    }),
    tf({
      id: 'd7-m1-q06',
      difficulty: 'medium',
      topics: ['Consistency', 'Availability'],
      learningObjective: 'Apply CAP-style trade-off language carefully',
      question:
        'True or False: In a network partition, a distributed system often must choose between serving potentially stale/divergent data and refusing some requests to preserve consistency.',
      correct: true,
      explanation:
        'Partition forces trade-offs between availability and consistency (informally CAP). State which side your design picks and why.',
      whyWrong: {
        '1': 'False would pretend partitions have no consistency/availability tension.',
      },
      interviewTakeaway: 'Say which side you choose under partition — and for which data.',
    }),
    q({
      id: 'd7-m1-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Databases', 'Sharding'],
      learningObjective: 'Reason about shard key hotspots',
      question:
        'You shard users by country_code, but 80% of traffic is one country. What goes wrong and what’s a better instinct?',
      options: [
        'Nothing — uneven shards are ideal',
        'Hot shard overload; prefer higher-cardinality keys (e.g. user_id) or hierarchical/compound strategies',
        'Delete indexes globally',
        'Put everything in one giant row',
      ],
      correctAnswer: 1,
      explanation:
        'Low-cardinality shard keys create hotspots. Choose keys that spread load while preserving locality for common queries.',
      whyWrong: {
        '0': 'Skewed shards are a classic failure mode.',
        '2': 'Indexes are not the root fix for shard skew.',
        '3': 'Giant rows create different bottlenecks.',
      },
      interviewTakeaway: 'Shard keys need cardinality + query locality.',
    }),
    q({
      id: 'd7-m1-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Observability', 'API Design'],
      learningObjective: 'Tie SLOs, idempotency, and failure modes into a design',
      question:
        'For a create-order API under retries, which combination is most interview-complete?',
      options: [
        'No timeouts, infinite retries, no metrics',
        'Idempotency keys, timeouts/retries with backoff, structured logs/metrics/traces, and a defined degraded mode',
        'Only a prettier OpenAPI theme',
        'Synchronous fan-out to 50 services on the request path with no budgets',
      ],
      correctAnswer: 1,
      explanation:
        'Production designs need safe retries, latency budgets, and observability. Unbounded fan-out and missing SLOs fail under load.',
      whyWrong: {
        '0': 'Unbounded retries amplify outages.',
        '2': 'Docs cosmetics aren’t the design.',
        '3': 'Huge sync fan-out destroys latency/availability.',
      },
      interviewTakeaway: 'Idempotency + budgets + observability = senior signal.',
    }),
  ],

  // ===== d7-m2 Cross-Topic Connections =====
  'd7-m2': [
    q({
      id: 'd7-m2-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['DBMS', 'OS', 'Caching'],
      learningObjective: 'Connect DB buffer pool vs OS page cache',
      question:
        'A query needs a table page not in the DB buffer pool. Next it may still avoid disk if:',
      options: [
        'The CPU L1 cache stores SQL text',
        'The OS page cache still holds the file pages in RAM',
        'TLS session tickets contain the row',
        'The load balancer caches SQL plans',
      ],
      correctAnswer: 1,
      explanation:
        'DB buffer pool and OS page cache are two RAM layers before storage. A buffer-pool miss can still hit OS cache.',
      whyWrong: {
        '0': 'L1 is for CPU lines, not DB pages.',
        '2': 'TLS tickets are unrelated to table pages.',
        '3': 'LBs do not cache DB page contents.',
      },
      interviewTakeaway: 'Two caches: DB buffer pool, then OS page cache.',
    }),
    tf({
      id: 'd7-m2-q02',
      difficulty: 'easy',
      topics: ['Networks', 'DBMS'],
      learningObjective: 'Relate connection pooling to latency',
      question:
        'True or False: DB connection pools reduce per-request latency by amortizing expensive connection setup (TCP/TLS/auth) across many queries.',
      correct: true,
      explanation:
        'Opening connections is costly. Pools reuse authenticated connections; sizing and timeouts still matter.',
      whyWrong: {
        '1': 'False would ignore a standard performance practice.',
      },
      interviewTakeaway: 'Pool connections; don’t open TCP+auth per query.',
    }),
    q({
      id: 'd7-m2-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['OS', 'Networks', 'Sockets'],
      learningObjective: 'Connect sockets to file descriptors',
      question:
        'On Linux, each accepted TCP connection typically consumes:',
      options: [
        'A file descriptor (among other kernel resources)',
        'A new physical CPU permanently',
        'A separate JVM installation',
        'An extra TLS certificate per packet',
      ],
      correctAnswer: 0,
      explanation:
        'Sockets are FDs. Hitting ulimit/nfile caps causes “too many open files” under connection storms.',
      whyWrong: {
        '1': 'Connections share CPUs via scheduling.',
        '2': 'JVM installs are unrelated per socket.',
        '3': 'Certificates are not per packet.',
      },
      interviewTakeaway: 'Connections ≈ FDs — watch ulimits under load.',
    }),
    q({
      id: 'd7-m2-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['DBMS', 'Networks', 'Replication'],
      learningObjective: 'Explain read replica lag cross-topic',
      question:
        'An API reads from an async replica right after a write to primary and sometimes misses the new row. Best explanation?',
      options: [
        'TLS failed',
        'Replication lag — async replicas can be behind primary; read-your-writes may need primary or session sticky reads',
        'The OS scheduler deleted the row',
        'JWT signature algorithms rotate automatically',
      ],
      correctAnswer: 1,
      explanation:
        'Async replication trades freshness for scale. Call out lag and read-your-writes strategies in interviews.',
      whyWrong: {
        '0': 'TLS issues look different (connection/cert errors).',
        '2': 'Schedulers do not delete committed rows.',
        '3': 'JWT alg rotation is unrelated to replica freshness.',
      },
      interviewTakeaway: 'Replica reads ⇒ name lag and read-your-writes.',
    }),
    q({
      id: 'd7-m2-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Linux', 'Security', 'OS'],
      learningObjective: 'Cross-cut least privilege at OS level',
      question:
        'A web app process runs as root and can read /etc/shadow. From a cross-topic security+OS view, what should change?',
      options: [
        'Nothing — root is convenient',
        'Run as an unprivileged user with minimal filesystem capabilities; isolate secrets',
        'Disable all file permissions',
        'Store DB passwords world-readable for debugging',
      ],
      correctAnswer: 1,
      explanation:
        'Least privilege at the OS boundary limits blast radius after RCE. Don’t run app servers as root.',
      whyWrong: {
        '0': 'Root maximizes damage.',
        '2': 'Permissions are a control, not something to disable.',
        '3': 'World-readable secrets are a critical failure.',
      },
      interviewTakeaway: 'App processes: non-root + tight FS permissions.',
    }),
    tf({
      id: 'd7-m2-q06',
      difficulty: 'medium',
      topics: ['OOP', 'System Design'],
      learningObjective: 'Connect SOLID ideas to service boundaries',
      question:
        'True or False: Unbounded “god services” that mix payments, email, and inventory often mirror SRP/cohesion failures at system scale.',
      correct: true,
      explanation:
        'Service boundaries should align with change drivers and domain cohesion — the same instincts as SRP/high cohesion in OOP.',
      whyWrong: {
        '1': 'False would ignore the OOP↔architecture parallel.',
      },
      interviewTakeaway: 'Bad class design scales into bad service design.',
    }),
    q({
      id: 'd7-m2-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['DBMS', 'OS', 'Durability'],
      learningObjective: 'Connect WAL/fsync to commit latency',
      question:
        'Commit latency spikes when disk fsync is slow. How do WAL-based databases relate?',
      options: [
        'Commits usually wait for WAL durability (fsync settings); group commit batches fsyncs — OS/storage latency shows up as commit time',
        'Databases never touch disks',
        'fsync only affects DNS',
        'Polymorphism controls fsync',
      ],
      correctAnswer: 0,
      explanation:
        'WAL + fsync provides durability. Storage and OS I/O latency dominate commit times under sync settings.',
      whyWrong: {
        '1': 'OLTP DBs absolutely depend on durable storage.',
        '2': 'DNS is unrelated.',
        '3': 'OOP dispatch is unrelated to durability I/O.',
      },
      interviewTakeaway: 'Commit latency ≈ WAL fsync + storage path.',
    }),
    q({
      id: 'd7-m2-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Networks', 'OS', 'Syscalls'],
      learningObjective: 'Explain blocking I/O vs evented servers cross-topic',
      question:
        'A thread-per-connection server stalls under many slow clients mainly because:',
      options: [
        'Each blocked connection can tie up a thread waiting on socket I/O, exhausting threads/FDs',
        'SQL indexes stop existing',
        'HTTPS forbids concurrency',
        'Encapsulation prevents epoll',
      ],
      correctAnswer: 0,
      explanation:
        'Blocking I/O models couple concurrency to threads. Evented/async models multiplex many sockets with fewer threads — with their own complexity.',
      whyWrong: {
        '1': 'Indexes are independent of the threading model.',
        '2': 'HTTPS allows concurrency.',
        '3': 'Encapsulation is an OOP concept, not a kernel limit.',
      },
      interviewTakeaway: 'Blocking servers: threads ≈ concurrency ceiling.',
    }),
  ],

  // ===== d7-m3 End-to-End Interview Scenarios =====
  'd7-m3': [
    q({
      id: 'd7-m3-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Networks', 'TLS', 'HTTP'],
      learningObjective: 'Order the browser→backend path',
      question:
        'Which sequence best matches a cold HTTPS API call from a browser?',
      options: [
        'SQL → TLS → DNS → TCP',
        'DNS → TCP → TLS → HTTP → (proxy/app) → DB/cache',
        'JWT → GC → RAID → DNS',
        'Only WebSocket, never HTTP',
      ],
      correctAnswer: 1,
      explanation:
        'Resolve host, establish TCP, complete TLS, then send HTTP, then hit edge/app/data stores.',
      whyWrong: {
        '0': 'Order is reversed/wrong.',
        '2': 'Those components are not the request path order.',
        '3': 'Most APIs are still HTTP(S).',
      },
      interviewTakeaway: 'Narrate DNS→TCP→TLS→HTTP→app→data fluently.',
    }),
    tf({
      id: 'd7-m3-q02',
      difficulty: 'easy',
      topics: ['Security', 'TLS', 'Authorization'],
      learningObjective: 'Separate transport security from authz',
      question:
        'True or False: HTTPS alone guarantees a logged-in user is authorized to delete another user’s account.',
      correct: false,
      explanation:
        'TLS secures the channel and authenticates the server. Authorization is an application check on the principal and resource.',
      whyWrong: {
        '0': 'True conflates transport security with app-level authz.',
      },
      interviewTakeaway: 'TLS ≠ authn ≠ authz.',
    }),
    q({
      id: 'd7-m3-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['DBMS', 'Indexes'],
      learningObjective: 'Connect indexes to API latency',
      question:
        'An endpoint filters orders by user_id frequently and is slow at scale. First database instinct?',
      options: [
        'Ensure an appropriate index supporting the filter/join pattern; verify with EXPLAIN',
        'Remove primary keys',
        'Disable connection pooling',
        'Store all rows in one JSON cookie',
      ],
      correctAnswer: 0,
      explanation:
        'Selective filters need indexes. Confirm with plans rather than guessing.',
      whyWrong: {
        '1': 'Removing PKs harms integrity and often performance.',
        '2': 'Pooling helps connection cost; it doesn’t fix missing indexes.',
        '3': 'Cookies are not a database.',
      },
      interviewTakeaway: 'Slow filter ⇒ index + EXPLAIN, not folklore.',
    }),
    q({
      id: 'd7-m3-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['OS', 'Performance'],
      learningObjective: 'Relate context switches to backend latency',
      question:
        'Under heavy thread churn, why can excessive context switches hurt a backend’s p99 latency?',
      options: [
        'They save/restore CPU state and can thrash caches, adding scheduling overhead',
        'They delete TLS certificates',
        'They automatically add SQL indexes',
        'They force HTTP/3 only',
      ],
      correctAnswer: 0,
      explanation:
        'Context switches are not free: register/PC save-restore and cache effects add overhead when oversubscribed.',
      whyWrong: {
        '1': 'Certificates are unrelated.',
        '2': 'Switches don’t create indexes.',
        '3': 'Protocol choice is separate.',
      },
      interviewTakeaway: 'Too many threads ⇒ scheduling tax on p99.',
    }),
    q({
      id: 'd7-m3-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Debugging', 'Observability'],
      learningObjective: 'Debug a slow backend with a structured approach',
      question:
        'p99 latency jumped. Which first-pass triage is most sound?',
      options: [
        'Randomly rewrite the language',
        'Check RED/USE metrics, recent deploys, dependency latency (DB/cache), and saturation (CPU, FDs, pools)',
        'Only change CSS',
        'Disable all monitoring to reduce load',
      ],
      correctAnswer: 1,
      explanation:
        'Separate symptom (latency) from saturated resources and slow dependencies. Correlate with changes.',
      whyWrong: {
        '0': 'Rewrites without diagnosis waste time.',
        '2': 'Frontend CSS won’t fix API p99.',
        '3': 'Blinding yourself removes signal.',
      },
      interviewTakeaway: 'Metrics → dependency → saturation → recent change.',
    }),
    tf({
      id: 'd7-m3-q06',
      difficulty: 'medium',
      topics: ['Processes', 'Scaling'],
      learningObjective: 'Distinguish vertical vs horizontal scale',
      question:
        'True or False: Horizontal scaling adds more instances behind a load balancer; vertical scaling grows CPU/RAM on one machine — each hits different limits (statefulness, coordination vs single-host ceiling).',
      correct: true,
      explanation:
        'Know when sticky sessions/shared state block easy horizontal scale, and when vertical scale is a temporary stopgap.',
      whyWrong: {
        '1': 'False would confuse a fundamental scaling distinction.',
      },
      interviewTakeaway: 'Name scale-out vs scale-up limits explicitly.',
    }),
    q({
      id: 'd7-m3-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['End-to-End', 'Caching', 'DB'],
      learningObjective: 'Narrate a coherent fix for stale+slow reads',
      question:
        'Product pages are slow and sometimes stale after admin updates. Which end-to-end plan is most coherent?',
      options: [
        'Only increase TTL forever and ignore DB indexes',
        'Index hot read paths, use cache-aside with explicit invalidation/short TTL on updates, and measure hit rate + DB time',
        'Turn off HTTPS',
        'Store product HTML only in client localStorage as source of truth',
      ],
      correctAnswer: 1,
      explanation:
        'Fix origin query cost and define cache freshness on writes. Measure both cache and DB contributions.',
      whyWrong: {
        '0': 'Longer TTL worsens staleness without fixing misses.',
        '2': 'Security regressions are not a performance plan.',
        '3': 'Client storage is not a system source of truth.',
      },
      interviewTakeaway: 'Pair cache policy with indexed origin reads.',
    }),
    q({
      id: 'd7-m3-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Capstone', 'Trade-offs'],
      learningObjective: 'Integrate multi-layer trade-offs in one narrative',
      question:
        'Design prompt: global read-heavy catalog, rare writes, strict authz, p99 < 200ms regional. Which statement is strongest?',
      options: [
        'Single global primary with chatty sync fan-out and no cache',
        'Edge/CDN or regional caches for public-safe fragments, regional app+DB/replicas for personalized/authz data, short invalidation story, and clear consistency exceptions',
        'One monolith thread handling all countries with no pooling',
        'Put admin credentials in the CDN for speed',
      ],
      correctAnswer: 1,
      explanation:
        'Read-heavy globals favor caching/CDN for public content, while authz/personalized data stays on trusted backends with explicit freshness rules.',
      whyWrong: {
        '0': 'Uncached chatty globals miss latency targets.',
        '2': 'No pooling/scale plan fails under load.',
        '3': 'Secrets at the CDN edge are a critical failure.',
      },
      interviewTakeaway: 'Split public cacheable vs private authz paths.',
    }),
  ],
}
