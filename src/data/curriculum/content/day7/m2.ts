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
    'd7-p5',
    'DBMS + OS (buffer pool, page cache, I/O)',
    12,
    [
      'Connect DBMS buffer pool, OS page cache, and disk I/O to query latency',
      'Explain how process/thread models and scheduling affect database performance',
      'Reason about fsync, write-ahead logging, and durable commits at OS level',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Databases do not touch bare metal in isolation — they ask the OS for memory and I/O. The buffer pool caches table/index pages inside the DB process; the OS page cache caches file pages in kernel memory. Misunderstanding these layers leads to wrong tuning advice ("just add RAM") without knowing which cache missed.',
          ),
          h3('Why it exists'),
          p(
            'Disk latency (even SSD) is orders of magnitude slower than RAM. Both DB and OS cache aggressively. Durability requires careful use of fsync so commits survive power loss — that cost shows up in write latency.',
          ),
        ]),
        section('how', 'How it works', [
          h3('Read path (simplified)'),
          ol([
            'Query needs a page (e.g., index leaf).',
            'If in DB buffer pool → memory hit (fastest).',
            'Else DB reads file via OS; may hit OS page cache (still RAM) or go to storage.',
            'Page entered into buffer pool; latch/lock rules apply for concurrency.',
          ]),
          diagram(
            `flowchart TB
  Q[Query] --> BP{In buffer pool?}
  BP -->|yes| Hit[Return page]
  BP -->|no| OS{In OS page cache?}
  OS -->|yes| Copy[Copy to buffer pool]
  OS -->|no| Disk[Read storage]
  Disk --> Copy
  Copy --> Hit`,
            'Two cache layers before disk',
          ),
          h3('Write path & WAL'),
          p(
            'Most OLTP engines write to a write-ahead log first, then later flush dirty pages. Commit latency often waits for WAL fsync (depends on sync settings). Group commit batches multiple transactions\' fsyncs.',
          ),
          table(
            ['Layer', 'Caches', 'Controlled by'],
            [
              ['DB buffer pool', 'Table/index pages, sometimes result bits', 'DB config (shared_buffers, innodb_buffer_pool)'],
              ['OS page cache', 'Filesystem pages', 'Kernel + available RAM'],
              ['Storage cache', 'Device-level', 'Hardware/firmware'],
            ],
          ),
          numerical({
            title: 'Why buffer pool hit rate matters',
            problem:
              'Random page read from SSD ≈ 100µs; from RAM ≈ 0.2µs. Compare 1M logical reads at 99% vs 90% hit rate (misses go to SSD).',
            given: 'RAM 0.2µs; SSD 100µs; 1e6 logical reads',
            formula: 'time ≈ hits×RAM + misses×SSD',
            steps:
              '99% hit: 0.99e6×0.2µs + 0.01e6×100µs = 198ms + 1000ms = 1.198s\n90% hit: 0.9e6×0.2µs + 0.1e6×100µs = 180ms + 10,000ms = 10.18s',
            answer: '~1.2s vs ~10s — miss rate dominates',
            shortcut: 'When SSD ≫ RAM, time ≈ miss_count × SSD_latency',
            mistake: 'Optimizing CPU while the workload is random I/O bound',
          }),
          code(
            'bash',
            `# Linux: see if workload is disk-bound
iostat -xz 1
# DB-facing: cache hit metrics (Postgres example names)
# blks_hit / (blks_hit + blks_read)  -- buffer hit ratio`,
            'Separate OS I/O stats from DB buffer hits',
          ),
        ]),
        section('example', 'Worked example', [
          example('Slow COUNT(*) on large table', [
            p(
              'Symptom: query slow on cold start, faster after repeat. Explanation: first run warms OS page cache / buffer pool; second run hits memory.',
            ),
            p(
              'Interview insight: "warm cache" benchmarks lie about production cold starts and after restarts. Size buffer pool for working set; don\'t double-count RAM (DB pool + OS cache + connections).',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Huge buffer pool + huge OS cache on same host can cause double caching; some DBs use O_DIRECT to bypass page cache.',
            'fsync every commit: durable but slower; async commit: faster, risk window on crash.',
            'Prefetch / sequential scans love throughput; random index lookups love latency + cache.',
            'Thread-per-connection models explode context switches under high concurrency — connection pooling helps.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Virtual memory: DB processes compete with page reclaim; swapping a buffer pool is catastrophic.',
            'Indexes: B+ tree depth × page misses ≈ I/O amplification for point lookups.',
            'Linux: vm.swappiness, dirty ratios, and iowait are on-call signals.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: "We\'ll increase shared_buffers."'),
          p('Interviewer: "Why might that not help?"'),
          p(
            'Strong answer: "If the working set already fits, or the bottleneck is locks/CPU/query plans, more buffer won\'t help. Also stealing RAM from OS page cache or causing swap hurts. Measure hit rate, iowait, and explain plans first."',
          ),
          p('Interviewer: "What happens on commit?"'),
          p(
            'Strong answer: "WAL records are written and typically fsync\'d so the commit is durable; dirty data pages can flush later. Commit latency tracks log sync more than table page writes."',
          ),
        ]),
      ],
      commonMistakes: [
        'Confusing DB buffer pool with OS page cache',
        'Allowing the DB to swap — latency falls off a cliff',
        'Blaming "slow disk" when the plan is a sequential scan of billions of rows',
        'Ignoring that cold cache ≠ warm cache performance',
      ],
      interviewQuestions: [
        'What is a database buffer pool?',
        'How does the OS page cache interact with a DBMS?',
        'Why is fsync important for commits?',
        'Why is swapping deadly for databases?',
        'What is write-ahead logging?',
      ],
      intermediateInterviewQuestions: [
        'When would you use O_DIRECT?',
        'How does group commit improve throughput?',
        'How do checkpoints relate to dirty pages?',
        'Why can a count query be I/O heavy without an index-only scan?',
        'How do you tell buffer miss vs lock wait in a slow query?',
      ],
      advancedInterviewQuestions: [
        'Explain double buffering vs bypassing OS cache.',
        'How does NUMA placement affect large buffer pools?',
        'Design memory budgeting for DB + Redis + apps on one host.',
        'How do SSD vs HDD change index vs scan preferences?',
        'Relate isolation level choices to latch/IO contention.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do OS and DBMS caching affect query performance?',
          answer:
            'The DBMS buffer pool keeps hot table and index pages in process memory. On a miss, the read goes through the OS, which may still hit the page cache in RAM, or else storage. Most OLTP latency cliffs are miss-rate or lock related, not raw CPU. For durability, commits usually wait on WAL fsync, which is an OS-level sync to stable storage. I look at buffer hit ratio, iowait, and whether the working set fits in RAM before buying hardware.',
        },
      ],
      keyTakeaways: [
        'Buffer pool and page cache are different layers — measure both.',
        'Commit latency often = WAL sync, not table page write.',
        'Never let the buffer pool swap.',
        'Cold vs warm cache changes interview and production numbers.',
      ],
    },
  ),

  createPage(
    'd7-p6',
    'DBMS + Networks (pooling, latency, replication lag)',
    12,
    [
      'Explain connection pooling, chatty queries, and network round trips',
      'Relate replication lag to network partitions and failover behavior',
      'Budget latency across app → DB network hops',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Every DB query is also a network conversation (unless embedded). Connection setup (TCP + auth + session) is expensive; per-query RTT adds up with chatty ORMs. Replication moves bytes over the network — lag is a networked consistency problem, not only a DB knob.',
          ),
        ]),
        section('how', 'How it works', [
          h3('Connection pooling'),
          ul([
            'Without pool: each request may open TCP+TLS+auth to DB — lethal under load.',
            'Pool (app-side or proxy like PgBouncer): reuse backends; cap concurrency to what DB can handle.',
            'Pool modes: session vs transaction pooling — transaction mode breaks session features (temp tables, prepared statements care).',
          ]),
          h3('Chatty queries = RTT amplification'),
          p(
            'N+1 patterns: 1 query for parent + N for children. On a 0.5ms RTT link that\'s small; across AZs or regions it dominates.',
          ),
          numerical({
            title: 'N+1 latency',
            problem:
              '1 parent query + 50 child queries; RTT 2ms each; ignore server CPU. How long?',
            given: '51 RTTs × 2ms',
            formula: 'time ≈ (#queries) × RTT',
            steps: '51 × 2ms = 102ms network alone',
            answer: '~102ms before query execution time',
            shortcut: 'Batch/join to collapse RTTs',
            mistake: 'Profiling only DB CPU time while ignoring client wait on network',
          }),
          diagram(
            `sequenceDiagram
  participant App
  participant Pool
  participant DB
  App->>Pool: checkout conn
  Pool->>DB: reuse session
  App->>DB: query 1
  App->>DB: query 2
  App->>Pool: release`,
            'Pool amortizes handshake; still pays per-query RTT',
          ),
          h3('Replication lag'),
          p(
            'Async replica: primary streams WAL; replica applies. Lag = network delay + apply backlog. Clients reading replicas may see stale data. During primary failure, unreplicated commits can be lost if async.',
          ),
        ]),
        section('example', 'Worked example', [
          example('ORMs across regions', [
            p(
              'App in Region A, DB primary in Region B: every query pays cross-region RTT (~30–80ms). Fix options: colocate app with primary, use local read replicas carefully, batch queries, or move to region-local data with conflict rules.',
            ),
            code(
              'sql',
              `-- Collapse N+1 into one round trip
SELECT o.id, i.*
FROM orders o
JOIN order_items i ON i.order_id = o.id
WHERE o.user_id = $1;`,
              'Join/batch beats per-row queries on high RTT',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Too-large pools: stampede overwhelms DB — better fail fast at pool limit.',
            'Serverless functions × new connections: need external pooler.',
            'Sync replication: lower loss risk, higher commit latency.',
            'Read-after-write to replica: user doesn\'t see their update — sticky to primary or session RYW.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'TCP handshake + TLS to DB (if used) adds setup cost — pooling wins.',
            'OS FD limits: each connection is FDs on app and DB sides.',
            'Security: DB should not be on public internet; use private networking + IAM/auth.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: "We scale app pods to 200."'),
          p('Interviewer: "What happens to the database?"'),
          p(
            'Strong answer: "If each pod opens 20 connections, that\'s 4000 sessions — DB meltdown. We need a pooler, lower per-pod max, and concurrency limits so DB CPU/memory stay healthy."',
          ),
        ]),
      ],
      commonMistakes: [
        'Ignoring RTT in ORM-heavy designs',
        'Scaling app tier without bounding DB connections',
        'Reading replicas without discussing lag',
        'Assuming sync replication is free',
      ],
      interviewQuestions: [
        'Why use connection pooling?',
        'What is the N+1 query problem?',
        'What causes replication lag?',
        'Why is cross-AZ DB access costly?',
        'Session vs transaction pooling?',
      ],
      intermediateInterviewQuestions: [
        'How do you provide read-your-writes with replicas?',
        'PgBouncer transaction mode caveats?',
        'How does async vs sync replication change RPO?',
        'Design a pool size formula from DB max_connections.',
        'How do prepared statements interact with pooling?',
      ],
      advancedInterviewQuestions: [
        'Multi-region active-active database options and conflicts.',
        'How to shed load when the pool is exhausted.',
        'Tail-latency amplification from fan-out queries.',
        'Online schema change under replication lag.',
        'Detecting silent lag-driven consistency bugs in QA.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do networking and databases interact in production?',
          answer:
            'Queries pay network RTT; chatty patterns multiply that cost. Connection setup is expensive, so pools reuse sessions and protect the DB from connection stampedes when apps scale out. Replicas improve read scale but introduce lag over the network — clients may read stale data, and async replication has a durability risk on failover. I colocate chatty apps with their primary when latency matters and bound pool sizes to DB capacity.',
        },
      ],
      keyTakeaways: [
        'Pool connections; bound concurrency.',
        'Minimize round trips — joins/batches over N+1.',
        'Replica lag is a product-visible consistency issue.',
        'App scale-out without pool discipline kills the DB.',
      ],
    },
  ),

  createPage(
    'd7-p7',
    'Networks + OS (sockets, FDs, syscalls)',
    10,
    [
      'Connect sockets, file descriptors, and kernel networking to app behavior',
      'Discuss context switches and syscall overhead under high connection load',
      'Explain blocking vs non-blocking I/O models at interview depth',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'A TCP connection is a kernel object exposed to user space as a socket file descriptor. Accepting thousands of clients means managing FDs, syscalls (read/write/epoll), and scheduler behavior. Many "framework performance" differences are I/O model differences.',
          ),
        ]),
        section('how', 'How it works', [
          h3('Socket lifecycle (server)'),
          ol([
            'socket() → bind() → listen()',
            'accept() → new FD per connection',
            'read()/write() or async equivalents move bytes',
            'close() / shutdown(); kernel reclaims.',
          ]),
          h3('I/O models'),
          table(
            ['Model', 'Idea', 'Trade-off'],
            [
              ['Thread-per-conn', 'Simple blocking I/O', 'High memory + context switches'],
              ['Thread pool + blocking', 'Cap threads', 'Head-of-line if tasks stick'],
              ['Evented (epoll/kqueue)', 'Few threads, many FDs', 'Avoid blocking the loop'],
              ['io_uring / async', 'Batch syscalls', 'Complexity, newer stacks'],
            ],
          ),
          diagram(
            `flowchart LR
  NIC[NIC] --> Kernel[Kernel TCP stack]
  Kernel --> Sock[Socket FD]
  Sock --> App[User-space app]
  App -->|syscalls| Kernel`,
            'Bytes cross kernel/user boundary via syscalls',
          ),
          code(
            'bash',
            `# See open FDs / socket states
ls /proc/<pid>/fd | wc -l
ss -s
ulimit -n   # FD limit — common production footgun`,
            'FD limits and socket states are first-line checks',
          ),
          callout(
            'warning',
            'Hitting max open files yields mysterious EMFILE / accept failures. Limits are per-process and system-wide.',
            'Production footgun',
          ),
        ]),
        section('example', 'Worked example', [
          example('C10k mental model', [
            p(
              '10k idle connections with thread-per-conn ≈ 10k stacks/threads — heavy. Event loops keep connections as FDs in epoll sets with a small thread count; CPU wakes on readiness. Trade-off: one blocking disk call on the event thread stalls many requests — offload to workers.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Too many short connections: TCP/TLS handshake CPU dominates — keep-alives, HTTP/2, pooling.',
            'Context switches soar with excessive threads competing on shared locks.',
            'Nagle + delayed ACK interactions can add latency for small RPCs — know TCP_NODELAY discussions at high level.',
            'SYN floods / backlog: listen queue sizing and firewalls.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'Load balancers terminate or pass through TCP; idle timeouts close FDs.',
            'DB pools are socket pools underneath.',
            'Security: socket binding to 0.0.0.0 exposes services — bind intentionally.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Candidate: "We\'ll increase worker threads to handle more load."'),
          p('Interviewer: "When does that hurt?"'),
          p(
            'Strong answer: "When the workload is already CPU-bound or lock-contended, extra threads add context-switch overhead and cache churn. Prefer non-blocking I/O for many idle conns, and size threads near core count for CPU work."',
          ),
        ]),
      ],
      commonMistakes: [
        'Ignoring ulimit / FD exhaustion',
        'Blocking the event loop with CPU or disk work',
        'Assuming more threads always increase throughput',
        'Forgetting idle timeout mismatches between LB and app',
      ],
      interviewQuestions: [
        'What is a socket file descriptor?',
        'Blocking vs non-blocking I/O?',
        'What is epoll used for?',
        'Why do FD limits matter?',
        'What is a context switch cost in high-conn servers?',
      ],
      intermediateInterviewQuestions: [
        'Thread-per-connection vs event loop trade-offs?',
        'How do keep-alives reduce handshake load?',
        'What does TIME_WAIT imply for short-lived clients?',
        'How do backpressure and socket buffers interact?',
        'Explain thundering herd on accept (conceptually).',
      ],
      advancedInterviewQuestions: [
        'Compare select/poll/epoll scalability.',
        'How does SO_REUSEPORT change multi-process accept?',
        'Zero-copy sendfile / splice use cases.',
        'Diagnose latency from excessive softirqs / packet processing.',
        'Design connection lifecycle across LB idle timeouts.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do OS sockets affect a network service?',
          answer:
            'Each connection is a kernel socket exposed as a file descriptor. The server\'s I/O model — threads versus an event loop — decides how those FDs are watched and how many context switches you pay. Under many idle connections, evented I/O scales better; under heavy CPU work, extra threads can hurt. In production I watch FD usage, socket states, and whether we\'re spending time in syscalls versus useful work.',
        },
      ],
      keyTakeaways: [
        'Sockets are FDs; limits are real.',
        'I/O model dominates high-connection performance.',
        'More threads ≠ more throughput.',
        'Keep-alives and pooling reduce handshake tax.',
      ],
    },
  ),

  createPage(
    'd7-p8',
    'Linux + OS & Security Cross-Cuts',
    12,
    [
      'Use Linux tooling to observe OS-level behavior under load',
      'Connect Security + Networks and Security + DBMS in one narrative',
      'Explain least privilege on processes, files, and DB accounts',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'Interviewers love cross-cuts: "The API is slow / breached / flaky — what do you look at?" Linux tooling bridges OS theory to practice. Security cross-cuts ask you to place controls where trust boundaries exist: network edge, process identity, data store.',
          ),
        ]),
        section('how', 'How it works', [
          h3('Linux observability toolkit (interview set)'),
          table(
            ['Question', 'Tools'],
            [
              ['Who uses CPU?', 'top/htop, pidstat'],
              ['Disk bound?', 'iostat, iotop'],
              ['Memory / swap?', 'free, vmstat, /proc/meminfo'],
              ['Network sockets?', 'ss, netstat, lsof -i'],
              ['Syscalls / stalls?', 'strace (careful), perf'],
              ['What listens?', 'ss -lntp'],
            ],
          ),
          code(
            'bash',
            `# Snapshot under load
uptime
ss -s
iostat -xz 1 3
free -h
ps aux --sort=-%cpu | head`,
            'A compact "is the host sick?" checklist',
          ),
          h3('Security × Networks'),
          ul([
            'TLS terminates at edge or service; certificates rotate; HTTP→HTTPS redirect.',
            'Security groups / firewalls: only necessary ports; DB not public.',
            'DoS: rate limits, connection limits, SYN cookies (kernel) — availability is a security property.',
          ]),
          h3('Security × DBMS'),
          ul([
            'Parameterized queries / least-privilege DB users per service.',
            'Encryption in transit to DB; at-rest encryption for disks/backups.',
            'No shared superuser for apps; audit DDL and access to PII columns.',
          ]),
          diagram(
            `flowchart TB
  Internet --> WAF[WAF / Edge]
  WAF --> App[App as non-root]
  App --> DB[(DB least-privilege user)]
  App --> Secrets[Secrets manager]`,
            'Trust boundaries with least privilege',
          ),
        ]),
        section('example', 'Worked example', [
          example('Incident: elevated 401/403 and latency', [
            p(
              'Linux: ss shows many ESTAB; CPU low; iowait low → maybe external dependency or lock.',
            ),
            p(
              'Security angle: spike of auth failures could be credential stuffing — rate limit login, alert on failure rate, check for breached passwords; do not lock out entire NAT blindly without UX plan.',
            ),
            p(
              'DB angle: app user should not have DROP TABLE; compromised app ≠ full DB wipe.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'strace on production: powerful but heavy — prefer metrics first.',
            'Running containers as root simplifies debug, worsens blast radius.',
            'Over-firewalling breaks health checks and replica traffic — document ports.',
            'Central TLS termination vs per-service mTLS — ops complexity vs zero-trust.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'OS process model: privilege of the UID running the service.',
            'Capabilities / seccomp in containers limit syscalls.',
            'Audit logs link security events to request_ids from observability.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Interviewer: "How would you harden a Linux service talking to Postgres?"'),
          p(
            'Strong answer: "Run as non-root, minimal filesystem permissions, secrets from a manager not env in git, private network to DB, TLS to DB if required, DB role with only needed DML, parameterized SQL, rate limits at edge, patch base images, and monitor auth failures + privileged DDL."',
          ),
        ]),
      ],
      commonMistakes: [
        'Security checklist without network placement (public DB)',
        'Debugging only app logs when the host is swapping',
        'Granting app roles SUPERUSER for convenience',
        'Ignoring rate limits as both ops and security controls',
      ],
      interviewQuestions: [
        'Which Linux tools diagnose CPU vs disk vs network?',
        'How do you apply least privilege to a DB user?',
        'Why keep databases off the public internet?',
        'How does rate limiting help security and reliability?',
        'What does running as non-root buy you?',
      ],
      intermediateInterviewQuestions: [
        'How would you investigate EMFILE errors?',
        'Perimeter vs zero-trust networking for service-to-service?',
        'How do you rotate DB credentials safely?',
        'Container escape mental model — what host privileges matter?',
        'Correlate WAF blocks with app traces.',
      ],
      advancedInterviewQuestions: [
        'Design defense-in-depth for a multi-tenant API on Kubernetes.',
        'How do you detect data exfiltration via DNS at a high level?',
        'Break-glass access procedures without permanent admin keys.',
        'Hardening checklist for a PCI-like payment path (conceptual).',
        'Combine SELinux/AppArmor narrative with app sandboxing.',
      ],
      interviewReadyAnswers: [
        {
          question: 'Connect Linux, OS, and security for a backend service.',
          answer:
            'The service runs as a least-privilege OS user with limited filesystem and network access. Linux tools — ss, iostat, free, top — tell me if failures are resource exhaustion versus app logic. On the security cross-cut: encrypt on the wire, keep the DB private, use a narrow DB role, parameterize queries, and rate-limit abuse. Observability and audit logs close the loop when something looks like an attack or a capacity incident.',
        },
      ],
      keyTakeaways: [
        'Host tooling separates resource faults from app bugs.',
        'Least privilege applies to OS users and DB roles.',
        'Network placement is a security control.',
        'Availability attacks are security issues too.',
      ],
    },
  ),

  createPage(
    'd7-p9',
    'OOP + System Design',
    10,
    [
      'Apply modular design, interfaces, and patterns inside service boundaries',
      'Avoid over-patterning while keeping designs extensible',
      'Map OOP principles (SOLID, composition) onto service and module seams',
    ],
    {
      sections: [
        section('concept', 'Concept', [
          p(
            'System design without module design becomes a ball of mud at the class level. OOP principles help you place boundaries: what varies, what must stay stable, and how to depend on abstractions at seams (payment providers, notifiers, storage).',
          ),
          callout(
            'tip',
            'In system design, patterns are seasoning. Name Strategy/Factory only when they remove a real branchy mess.',
            'Pattern diet',
          ),
        ]),
        section('how', 'How it works', [
          h3('Mapping OOP → services'),
          table(
            ['OOP idea', 'System design analog'],
            [
              ['Encapsulation', 'Service owns its database; no shared tables'],
              ['Interface / DIP', 'Depend on PaymentGateway port, not Stripe SDK everywhere'],
              ['SRP', 'One deployable reason to change; avoid god services'],
              ['Composition', 'Orchestrate smaller services/modules vs deep inheritance of platforms'],
              ['LSP', 'Substitutable replicas/providers that honor contracts'],
            ],
          ),
          code(
            'java',
            'public interface PaymentGateway {\n  ChargeResult charge(ChargeRequest req);\n}\n\npublic final class CheckoutService {\n  private final PaymentGateway payments;\n  private final OrderRepository orders;\n  // orchestrates; does not embed Stripe HTTP details\n}',
            'Ports at boundaries keep domain testable and swappable',
          ),
          h3('Where LLD meets HLD'),
          ul([
            'HLD chooses Checkout service + Payment provider + Order DB.',
            'LLD defines domain entities, transactional boundaries, and strategies for fees/tax.',
            'Idempotency and validation live near the use-case service, not scattered in controllers only.',
          ]),
        ]),
        section('example', 'Worked example', [
          example('Notification fan-out', [
            p(
              'Bad: God class Notifier with giant switch for email/SMS/push and vendor SDKs.',
            ),
            p(
              'Better: NotificationPort implementations; orchestrator loads preferences; queue workers per channel; shared IdempotencyStore. System design adds the queue; OOP shapes the worker code.',
            ),
          ]),
        ]),
        section('tradeoffs', 'Trade-offs & edge cases', [
          ul([
            'Interface explosion: abstracting too early before second implementation exists.',
            'Distributed "OOP": chatty service calls mimicking object graphs — network is not a method call.',
            'Shared domain library across services can recreate a distributed monolith.',
            'Anemic domain + all logic in services can be fine for CRUD; rich domain helps complex rules.',
          ]),
        ]),
        section('connections', 'Connections Between Concepts', [
          ul([
            'SOLID OCP: add payment provider without editing core checkout flow.',
            'Composition over inheritance: same advice for platform frameworks.',
            'Testing: fake ports in unit tests; contract tests at service boundaries.',
          ]),
        ]),
        section('followups', 'Interview follow-up chain', [
          p('Interviewer: "How does SOLID show up in your design?"'),
          p(
            'Strong answer: "SRP keeps pricing rules out of the HTTP layer. DIP makes us depend on a PaymentGateway interface so we can test and swap vendors. OCP lets us add a provider by adding a class. I wouldn\'t force every SOLID letter into a CRUD form."',
          ),
        ]),
      ],
      commonMistakes: [
        'Name-dropping patterns without structure',
        'Deep inheritance for service reuse across domains',
        'Leaking DB rows as API DTOs without a boundary',
        'Chatty microservice method-call graphs',
      ],
      interviewQuestions: [
        'How does encapsulation apply to microservices?',
        'Composition vs inheritance for extensibility?',
        'Where would you use a Strategy in a backend?',
        'What is a anti-corruption layer?',
        'How do you avoid a god service?',
      ],
      intermediateInterviewQuestions: [
        'Map DIP to hexagonal architecture.',
        'When is an anemic domain model acceptable?',
        'How do shared kernels create coupling?',
        'Design module boundaries inside a modular monolith.',
        'Where should idempotency logic live in code?',
      ],
      advancedInterviewQuestions: [
        'Evolve a monolith module into a service while preserving contracts.',
        'Polymorphism across process boundaries — what breaks?',
        'Domain events vs CRUD services for consistency.',
        'Design plugin architecture for risk scoring without downtime.',
        'Balance DRY across services vs independent deployability.',
      ],
      interviewReadyAnswers: [
        {
          question: 'How do OOP principles influence system design?',
          answer:
            'They guide boundaries. Services encapsulate their data; modules depend on interfaces at integration points like payments or notifications; we prefer composition of capabilities over inheritance hierarchies. SOLID helps keep change isolated — especially SRP and DIP — but I apply patterns only when they reduce real complexity. System design chooses the boxes; OOP keeps each box coherent as code.',
        },
      ],
      keyTakeaways: [
        'Encapsulation ⇒ service-owned data.',
        'Depend on ports at volatile boundaries.',
        'Composition scales better than inheritance trees.',
        'Don\'t turn the network into an object graph.',
      ],
    },
  ),
]
