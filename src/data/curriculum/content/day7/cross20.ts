import type { StudyPage } from '@/types/curriculum'
import { createPage, ol, p, section } from '../../../helpers'

const cross = [
  'How do the DBMS buffer pool and OS page cache both affect a query?',
  'Where do sockets, file descriptors, and threads meet under high QPS?',
  'Why can network RTT make “chatty” SQL catastrophic?',
  'How does replication lag combine network partitions and stale reads?',
  'Explain HTTPS using OS (sockets) + networks (TLS) + app (certs) vocabulary.',
  'How would Linux tools confirm a DB is bottlenecked on CPU vs I/O vs locks?',
  'Context switches under many blocking DB connections — what do you change?',
  'Connection pool sizing: OS limits, DB max_connections, latency.',
  'SQL injection is a security bug with a DBMS interface — full stack fix.',
  'XSS stealing a session cookie — browser + HTTP + auth design.',
  'CSRF across sites — cookies + SameSite + app tokens.',
  'Design caching that respects authorization boundaries.',
  'Load balancer health checks vs DB connection storms on deploy.',
  'Virtual memory pressure causing DB jitter — diagnose.',
  'Use OOP interfaces to make a storage backend swappable in system design.',
  'DIP: why injecting a repository helps testing a payment service.',
  'Rate limiting at gateway vs app vs DB — layered defense.',
  'Observability: which metrics bridge network, OS, and DB?',
  'Slow endpoint: distinguish GC/CPU, lock waits, and DNS blips.',
  'Tell one story that weaves TCP, TLS, authz, index, and thread pool.',
]

const crossAnswers: { question: string; answer: string }[] = [
  {
    question: 'How do the DBMS buffer pool and OS page cache both affect a query?',
    answer:
      'The DBMS caches pages in its buffer pool with its own eviction and dirty-write policy; the OS may also cache file blocks. Double caching can waste RAM; durability still depends on fsync/WAL discipline. Performance debugging must consider both hit rates and writeback behavior.',
  },
  {
    question: 'Where do sockets, file descriptors, and threads meet under high QPS?',
    answer:
      'Each accepted connection is an FD; the kernel socket buffers hold bytes while app threads or an event loop read/write them. Under high QPS, FD limits, epoll/kqueue readiness, and thread-per-connection stacks collide—exhaust FDs or threads and latency spikes. Prefer pooled workers + non-blocking accept, and size ulimit/net.core carefully.',
  },
  {
    question: 'Why can network RTT make “chatty” SQL catastrophic?',
    answer:
      'Each query is at least one client↔DB RTT plus execute time. N+1 patterns multiply RTT; in multi-AZ/region that dominates CPU. Fix with joins/batching, fewer round-trips, and connection locality. OS/DB are fine while the network serializes work.',
  },
  {
    question: 'How does replication lag combine network partitions and stale reads?',
    answer:
      'Async replicas apply WAL over the network; partition or congestion grows lag so reads see old snapshots (AP behavior). Clients may read stale authz/balance after a write to primary. Mitigate with lag SLOs, read-your-writes routing, or CP-style refusals when lag exceeds budget.',
  },
  {
    question: 'Explain HTTPS using OS (sockets) + networks (TLS) + app (certs) vocabulary.',
    answer:
      'App opens a TCP socket (OS FD); TLS handshake negotiates keys over that byte stream and validates the server cert chain/hostname; then HTTP rides the encrypted record layer. App must still enforce authz—TLS only secures the pipe. Mis-set trust stores or SNI break the network/app boundary.',
  },
  {
    question: 'How would Linux tools confirm a DB is bottlenecked on CPU vs I/O vs locks?',
    answer:
      'CPU: top/perf on postgres/mysqld user time. I/O: iostat/await, vmstat bi/bo, DB buffer hit ratio. Locks: DB wait_event/lock graphs, not just OS runqueue. Cross-check: high CPU with low iowait vs high await vs sessions waiting on locks. Fix the confirmed layer.',
  },
  {
    question: 'Context switches under many blocking DB connections — what do you change?',
    answer:
      'Too many blocked app threads waiting on DB create scheduler/TLB churn without useful work. Shrink pool to match DB capacity, use async/non-blocking where fit, add timeouts, and fix slow queries so holds are short. OS shows runnable≠busy; DB shows connection count and wait events.',
  },
  {
    question: 'Connection pool sizing: OS limits, DB max_connections, latency.',
    answer:
      'Pool ≈ concurrent useful work, not “more is faster.” Cap by DB max_connections across all app instances, OS FD/process limits, and latency under load (Little’s law). Oversized pools queue inside the DB; undersized queues in the app. Measure p95 wait for a pool checkout vs query time.',
  },
  {
    question: 'SQL injection is a security bug with a DBMS interface — full stack fix.',
    answer:
      'Client input must never become SQL structure: parameterized statements at the DB API, validation at the app edge, least-privilege DB roles, and WAF only as defense-in-depth. Logs/alerts on syntax errors help detect probes. Fix is app+DB contract, not network obscurity.',
  },
  {
    question: 'XSS stealing a session cookie — browser + HTTP + auth design.',
    answer:
      'Malicious script in the page origin reads document.cookie if not HttpOnly, then exfiltrates over HTTP. Defense: output encoding/CSP (browser), HttpOnly+Secure+SameSite cookies (HTTP), short sessions/refresh rotation (auth), and prefer non-cookie tokens for APIs when XSS risk is high.',
  },
  {
    question: 'CSRF across sites — cookies + SameSite + app tokens.',
    answer:
      'Browser auto-sends cookies on cross-site requests; attacker site triggers a state-changing call. SameSite reduces sending; anti-CSRF tokens bind mutations to the real app origin; avoid cookie-auth GET mutations. Layers: browser cookie policy + app CSRF middleware + optional Origin/Referer checks.',
  },
  {
    question: 'Design caching that respects authorization boundaries.',
    answer:
      'Never key public caches only on URL if responses are user-specific. Include tenant/user/authz version in keys or cache only after authz at origin; use private Cache-Control for personalized data; purge on permission changes. CDN/app/DB each need a clear “who can see this” rule.',
  },
  {
    question: 'Load balancer health checks vs DB connection storms on deploy.',
    answer:
      'Aggressive health checks mark instances up before pools warm, then every instance opens max DB connections at once. Sequence: start accepting after pool warm; stagger deploys; size health-check rate; use LB connection draining. Network LB + OS listen backlog + DB max_connections must be planned together.',
  },
  {
    question: 'Virtual memory pressure causing DB jitter — diagnose.',
    answer:
      'When RSS + page cache exceed RAM, the OS reclaim/swap causes multi-ms stalls in query latency. Check si/so, major faults, and DB buffer pool vs available RAM (avoid double-cache thrash). Fix: right-size shared_buffers/cache, cgroup limits, and stop noisy neighbors; confirm with before/after p99.',
  },
  {
    question: 'Use OOP interfaces to make a storage backend swappable in system design.',
    answer:
      'Define a Repository/Storage port (interface) for load/save; app services depend on that, not Postgres/S3 concretions. Swap in fake for tests or migrate to another store behind the same contract. Trade-off: interface must capture real semantics (transactions, consistency) or swaps lie.',
  },
  {
    question: 'DIP: why injecting a repository helps testing a payment service.',
    answer:
      'Payment use-cases depend on an abstract ledger/payment-port; tests inject an in-memory fake without hitting network/DB. Production injects the real adapter. High-level policy stays stable when infrastructure changes—classic DIP, enabling fast unit tests and safer refactors.',
  },
  {
    question: 'Rate limiting at gateway vs app vs DB — layered defense.',
    answer:
      'Gateway sheds volumetric abuse early (IP/route); app enforces user/tenant business quotas and auth-aware limits; DB statement timeouts and connection caps are last resort. Each layer fails closed differently—edge alone misses authenticated abuse; DB alone is too late and collateral.',
  },
  {
    question: 'Observability: which metrics bridge network, OS, and DB?',
    answer:
      'Network: RTT, retransmits, LB 5xx. OS: CPU, iowait, mem/pressure, FD/thread counts. DB: QPS, p95 query, buffer hit, locks, replication lag. Traces stitch request id across LB→app→DB. Alerts should correlate saturation at the layer that is red, not only app error rate.',
  },
  {
    question: 'Slow endpoint: distinguish GC/CPU, lock waits, and DNS blips.',
    answer:
      'GC/CPU: elevated process CPU, GC pause metrics, flame graphs in app code. Locks: DB wait events / thread dump on monitors with low CPU. DNS: sparse multi-100ms gaps, resolver errors, dig latency spikes without DB load. Use traces + host metrics in the same time window to pick one cause.',
  },
  {
    question: 'Tell one story that weaves TCP, TLS, authz, index, and thread pool.',
    answer:
      'Client completes TCP+TLS to the LB; app worker from a bounded pool authenticates and checks object-level authz; a parameterized query hits an indexed lookup so the DB returns quickly and releases the worker. Without the index, workers block on DB, pools exhaust, and new TLS handshakes queue—network, security, and OS scheduling all show the same backlog.',
  },
]

export const cross20Page: StudyPage = createPage(
  'd7-cross20',
  '20 Cross-Topic Questions',
  25,
  [
    'Force answers that combine multiple CS fundamentals',
    'Practice “full stack systems” verbal fluency',
  ],
  {
    sections: [
      section('howto', 'How to answer', [
        p(
          'Name each layer you touch (client, network, OS, runtime, DB, security). Show how they couple.',
        ),
      ]),
      section('q', '20 cross-topic prompts', [ol(cross)]),
    ],
    commonMistakes: ['Answering only one domain when the prompt asks for interaction'],
    interviewQuestions: cross.slice(0, 7),
    intermediateInterviewQuestions: cross.slice(7, 14),
    advancedInterviewQuestions: cross.slice(14),
    interviewReadyAnswers: crossAnswers,
    keyTakeaways: ['Cross-topic fluency is the Day 7 goal'],
  },
)
