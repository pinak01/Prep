import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  callout,
} from '../../../helpers'

/** Crisp interview-ready explanations for must-know topics */
export const mustPage: StudyPage = createPage(
  'd7-must',
  'Things I MUST Be Able To Explain',
  25,
  [
    'Deliver a crisp 45–90s explanation for each core topic below',
    'Include WHAT / WHY / HOW / TRADE-OFF when probed',
    'Use this page as a final verbal checklist before interviews',
  ],
  {
    sections: [
      section('howto', 'How to use this page', [
        p(
          'Cover each topic aloud without notes. Aim for clarity over completeness. If you stumble, rewrite your version in one sticky sentence + three supporting bullets.',
        ),
        callout(
          'tip',
          'Format: one-line definition → mechanism steps → when it matters → common trade-off/mistake.',
          'Verbal template',
        ),
      ]),

      section('tcp', 'TCP handshake', [
        h3('Interview-ready explanation'),
        p(
          'TCP establishes a reliable, ordered byte stream with a three-way handshake: client sends SYN with initial sequence number; server replies SYN-ACK with its own sequence; client sends ACK. After that, both sides agree the connection is open and sequence numbers are synchronized so lost/duplicated packets can be detected. A two-way handshake is insufficient because the server would not know the client received its SYN-ACK, risking half-open state if the last ACK is lost. Trade-off: reliability and congestion control cost handshake RTTs and state (memory) per connection versus UDP\'s fire-and-forget.',
        ),
        ul([
          'WHY 3-way: synchronize both ISNs and confirm both directions.',
          'Follow-up: teardown uses FIN/ACK (and often 4 segments) because streams are half-closeable.',
          'Mistake: saying handshake encrypts — that\'s TLS.',
        ]),
      ]),

      section('https', 'HTTPS', [
        h3('Interview-ready explanation'),
        p(
          'HTTPS is HTTP carried over TLS. TLS authenticates the server using a certificate chain rooted in a trusted CA, negotiates cryptographic parameters, and then encrypts application data so eavesdroppers cannot read or undetectably alter it. The browser/client verifies the cert matches the hostname and is unexpired/trusted. HTTPS does not by itself authenticate the end user, authorize actions, or fix XSS — those are application controls. Trade-off: CPU and handshake latency (mitigated by resumption/HTTP/2/3) versus confidentiality on hostile networks.',
        ),
      ]),

      section('dns', 'DNS', [
        h3('Interview-ready explanation'),
        p(
          'DNS maps human names to records like A/AAAA addresses. Resolvers recursively query from root to TLD to authoritative name servers unless an answer is cached within TTL. Clients usually ask a recursive resolver; that resolver does the heavy lifting. Failures or slow DNS block connection setup before TCP even starts. Trade-offs: low TTL helps failover but increases query load; high TTL is faster/cheaper but slower to change.',
        ),
        ul([
          'Caching at browser, OS, and resolver layers.',
          'Follow-up: CNAME alias chains; MX/TXT for mail/verification.',
        ]),
      ]),

      section('btree', 'B+ tree', [
        h3('Interview-ready explanation'),
        p(
          'A B+ tree is a balanced multi-level index used by databases: internal nodes store keys and child pointers; leaf nodes store keys and row pointers (or records) and are often linked for range scans. High fan-out keeps height small — typically 3–4 levels — so point lookups need few page I/Os. All data-order traversal happens at the leaves. Trade-off versus hash indexes: B+ trees support range predicates and ordering; hash does not.',
        ),
      ]),

      section('indexing', 'Indexing', [
        h3('Interview-ready explanation'),
        p(
          'An index is an extra data structure that lets the engine find rows without scanning the whole table. We index columns used in selective WHERE/JOIN/ORDER BY patterns. Composite indexes follow leftmost-prefix matching. Indexes speed reads that use them but add storage and slow writes because each modification updates indexes too. Unused or low-selectivity indexes can hurt overall performance.',
        ),
      ]),

      section('normalization', 'Normalization', [
        h3('Interview-ready explanation'),
        p(
          'Normalization restructures schemas to reduce redundancy and anomalies. 1NF: atomic attributes. 2NF: no partial dependency on part of a composite key. 3NF: no transitive dependency of non-keys on keys. BCNF tightens further. We normalize for integrity and simpler updates; we sometimes denormalize intentionally for read performance, accepting redundancy with careful update discipline.',
        ),
      ]),

      section('transactions', 'Transactions', [
        h3('Interview-ready explanation'),
        p(
          'A transaction is a sequence of operations treated as one logical unit: commit makes all effects durable and visible per isolation rules; rollback undoes them. ACID: Atomicity (all-or-nothing), Consistency (constraints preserved), Isolation (concurrent txs don\'t step on each other unchecked), Durability (committed data survives crashes, typically via WAL). Trade-off: stronger guarantees usually mean more locking or versioning overhead.',
        ),
      ]),

      section('serializability', 'Serializability', [
        h3('Interview-ready explanation'),
        p(
          'Serializability means the concurrent execution\'s effect equals some serial order of the same transactions. Conflict serializability checks whether conflicting operations can be ordered without cycles in a precedence graph. It\'s the gold standard of isolation correctness but can be expensive; many systems offer weaker levels for performance. Not every "anomalous-looking" schedule is non-serializable — draw the graph.',
        ),
      ]),

      section('isolation', 'Isolation levels', [
        h3('Interview-ready explanation'),
        p(
          'Isolation levels trade concurrency anomalies for performance. Read Uncommitted can see dirty data. Read Committed avoids dirty reads but allows non-repeatable reads. Repeatable Read stabilizes read rows (engines differ on phantoms). Serializable prevents anomalies equivalent to serial execution. In interviews, name which anomalies you prevent and that MVCC engines implement these with snapshots + locks/detection rather than only classic locking.',
        ),
      ]),

      section('mvcc', 'MVCC', [
        h3('Interview-ready explanation'),
        p(
          'Multi-Version Concurrency Control keeps multiple row versions so readers can use a snapshot without blocking writers (and vice versa, often). Each transaction sees data as of a timestamp/XID snapshot. Writers create new versions; old versions are cleaned by vacuum/GC when no longer visible. Benefits: high read concurrency. Costs: version bloat, cleanup, and occasional write conflicts/aborts under serializable variants.',
        ),
      ]),

      section('deadlocks', 'Deadlocks', [
        h3('Interview-ready explanation'),
        p(
          'A deadlock is a cycle of waits: T1 holds A waits for B; T2 holds B waits for A (classic). Conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Databases typically detect cycles and abort a victim transaction; prevention uses ordering locks or timeouts. In OS, similar ideas apply to mutexes. Interview tip: show a wait-for graph and pick a victim (least work / youngest).',
        ),
      ]),

      section('vmem', 'Virtual memory', [
        h3('Interview-ready explanation'),
        p(
          'Virtual memory gives each process a private virtual address space mapped to physical frames via page tables. It enables isolation, convenient contiguous virtual layouts, and paging to disk when RAM is scarce. On access to a non-present page, a page fault traps to the OS to load or allocate a frame. Trade-off: paging to disk (thrashing) destroys performance — especially fatal for DB buffer pools.',
        ),
      ]),

      section('pagetables', 'Page tables', [
        h3('Interview-ready explanation'),
        p(
          'Page tables are the OS multi-level maps from virtual page numbers to physical frames plus flags (present, dirty, user/kernel, NX). The MMU walks them (with TLB caching translations). Multi-level tables save memory for sparse address spaces. Context switches may require TLB invalidation for process changes, which is part of why process switches cost more than thread switches within a process.',
        ),
        callout(
          'tip',
          'After this checklist, practice the Day 7 “Whiteboard” page — same topics, but you must draw under interruption.',
        ),
      ]),

      section('ctx', 'Context switch', [
        h3('Interview-ready explanation'),
        p(
          'A context switch is the OS saving the CPU state of one schedulable entity and restoring another\'s so many tasks share cores. Saves/restores registers and kernel bookkeeping; process switches also switch address spaces. Necessary for multitasking; excessive switches from too many runnable threads waste cycles and hurt cache locality. Distinct from a mode switch (user↔kernel) though syscalls often involve both.',
        ),
      ]),

      section('proc_thread', 'Process vs thread', [
        h3('Interview-ready explanation'),
        p(
          'A process is an isolation boundary: address space, FDs, credentials, etc. Threads within a process share that address space and FDs but have their own stacks and register state. Threads are cheaper to create/switch and enable shared-memory parallelism, but bugs (races) are easier; processes isolate faults and security better. Servers choose thread pools, process pools, or event loops based on isolation vs overhead.',
        ),
      ]),

      section('lifecycle', 'Linux process lifecycle', [
        h3('Interview-ready explanation'),
        p(
          'Processes are created (typically fork/clone), run in user/kernel modes, can block on I/O, be scheduled runnable, stopped by signals, and terminate (exit). After exit, a zombie remains until the parent wait()s to collect status; orphaned processes are reaped by init/systemd. States you should name: running, interruptible sleep, uninterruptible sleep (D), stopped, zombie.',
        ),
      ]),

      section('forkexec', 'fork / exec', [
        h3('Interview-ready explanation'),
        p(
          'fork creates a child process as a copy of the parent (Linux uses copy-on-write pages). exec replaces the current process image with a new program, keeping the PID. Shells fork a child then exec the command; the parent waits. fork alone does not load a new binary; exec alone does not create a new process. Together they implement "run this program as a child".',
        ),
      ]),

      section('pipes', 'Pipes', [
        h3('Interview-ready explanation'),
        p(
          'A pipe is a unidirectional kernel buffer connecting processes: write end → read end, classic for shell pipelines (cmd1 | cmd2). Related processes inherit FDs after fork. Pipes provide simple IPC with blocking backpressure when buffers fill; they are local and byte-stream oriented. For networked IPC use sockets; for multi-reader pub/sub use higher-level systems.',
        ),
      ]),

      section('oop', 'OOP', [
        h3('Interview-ready explanation'),
        p(
          'Object-oriented programming models software as objects that encapsulate state and behavior. Core ideas: encapsulation (hide invariants), abstraction (meaningful interfaces), inheritance (share/override behavior), polymorphism (one interface, many implementations). In backends, OOP shines at domain boundaries and test seams; overuse of deep inheritance creates rigidity — prefer clear modules and composition.',
        ),
      ]),

      section('solid', 'SOLID', [
        h3('Interview-ready explanation'),
        p(
          'SOLID is five design guidelines: Single Responsibility (one reason to change), Open/Closed (extend without modifying stable core), Liskov Substitution (subtypes honor contracts), Interface Segregation (small client-specific interfaces), Dependency Inversion (depend on abstractions). Use them to keep code change-friendly; don\'t force all five into a tiny script. In interviews, give one concrete class-level example per principle you cite.',
        ),
      ]),

      section('comp_inh', 'Composition vs inheritance', [
        h3('Interview-ready explanation'),
        p(
          'Inheritance models "is-a" via code reuse and polymorphism but couples hierarchy deeply and risks fragile base classes. Composition models "has-a / uses-a": build behavior by combining components behind interfaces — usually more flexible. Rule of thumb: prefer composition for reuse; use inheritance when you truly have a stable subtype relationship and shared contract. Same advice maps to systems: compose services, don\'t inherit platforms.',
        ),
      ]),

      section('authn_authz', 'Authn / Authz', [
        h3('Interview-ready explanation'),
        p(
          'Authentication establishes identity ("who are you?") via passwords, OTP, SSO, certificates, etc. Authorization decides permissions ("what can you do?") on resources/actions after identity is known. Conflating them causes bugs: a valid login does not imply access to another user\'s order. Design APIs to check object-level authz on every request, not only at the UI.',
        ),
      ]),

      section('tls', 'TLS', [
        h3('Interview-ready explanation'),
        p(
          'TLS is the cryptographic protocol under HTTPS (and other protocols). It performs a handshake to authenticate endpoints (usually server) and derive shared keys, then uses symmetric crypto for efficient bulk encryption. Certificates bind public keys to identities via CA signatures. TLS protects data in transit; it does not replace app-layer authz or input validation. Versions and cipher hygiene matter operationally.',
        ),
      ]),

      section('sqli', 'SQL injection (defensive)', [
        h3('Interview-ready explanation'),
        p(
          'SQL injection happens when untrusted input is concatenated into SQL so the attacker changes the query\'s structure — reading or modifying data unintendedly. It\'s dangerous because the DB trusts the query text. Prevent with parameterized queries/prepared statements, least-privilege DB users, input validation, and avoiding dynamic SQL. Defense-in-depth: WAF helps but is not a substitute for parameterization.',
        ),
      ]),

      section('xss', 'XSS (defensive)', [
        h3('Interview-ready explanation'),
        p(
          'Cross-site scripting injects attacker-controlled script into a page that victims\' browsers execute in your origin, stealing sessions or performing actions. Reflected, stored, and DOM-based variants differ in how the payload arrives. Prevent by context-aware output encoding/escaping, Content-Security-Policy, HttpOnly cookies, and careful use of dangerous APIs (innerHTML). Treat all untrusted data as data, never as code.',
        ),
      ]),

      section('csrf', 'CSRF (defensive)', [
        h3('Interview-ready explanation'),
        p(
          'Cross-site request forgery tricks a victim\'s browser into sending an authenticated request (cookies auto-attached) to your site without intending it. Danger: state-changing actions as the user. Defenses: anti-CSRF tokens, SameSite cookies, preferring non-cookie auth for APIs (with care), and avoiding state-changing GETs. Note: XSS can often bypass CSRF defenses — fix both.',
        ),
      ]),

      section('rest', 'REST', [
        h3('Interview-ready explanation'),
        p(
          'REST is an architectural style for networked APIs using resources identified by URLs, manipulated via uniform methods (GET/POST/PUT/PATCH/DELETE), and typically representing state as JSON over HTTP. Good REST APIs are evolvable, use proper status codes, pagination, and idempotency where retries happen. It\'s not "JSON over HTTP equals REST" — resource modeling and constraints matter. Trade-offs vs RPC/GraphQL depend on client needs and caching.',
        ),
      ]),

      section('caching', 'Caching', [
        h3('Interview-ready explanation'),
        p(
          'Caching stores expensive-to-compute or fetch results closer to the consumer (CDN, Redis, DB buffer pool). It improves latency and reduces backend load when hit rates are high. The hard part is freshness: TTLs, invalidation on write, and stampede control. Always define what correctness you sacrifice under staleness and what happens when the cache is down.',
        ),
      ]),

      section('lb', 'Load balancing', [
        h3('Interview-ready explanation'),
        p(
          'A load balancer distributes traffic across healthy backends to improve capacity and availability. L4 balances TCP connections; L7 understands HTTP and can route by path/host. Algorithms include round-robin, least connections, and consistent hashing. Health checks and graceful drains make deploys safe. Sticky sessions help stateful apps but hinder even scale — prefer externalized state.',
        ),
      ]),

      section('dbscale', 'DB scaling', [
        h3('Interview-ready explanation'),
        p(
          'Scale databases by first fixing queries/indexes and vertical resources, then add caching and read replicas for read-heavy loads (accept lag). For write scale or huge datasets, partition/shard with careful key choice; move analytics off the primary. Each step adds operational complexity and consistency trade-offs — measure the real bottleneck (CPU, I/O, locks, connections) before sharding.',
        ),
      ]),
    ],
    commonMistakes: [
      'Memorizing buzzwords without a mechanism sentence',
      'Mixing TLS user auth with application authn',
      'Saying replicas scale writes',
      'Explaining SQLi/XSS with exploit recipes instead of defenses',
    ],
    interviewQuestions: [
      'Pick five topics from this list and explain each in 60 seconds.',
      'Why is the TCP handshake three-way?',
      'What does TLS not protect you from?',
      'When is denormalization justified?',
      'How does MVCC change reader/writer blocking?',
    ],
    intermediateInterviewQuestions: [
      'Relate isolation levels to real user-visible bugs.',
      'Page table walk vs TLB hit — performance story.',
      'Composition vs inheritance with a payments example.',
      'CSRF vs XSS — how they interact.',
      'Cache invalidation strategy for user profile reads.',
    ],
    advancedInterviewQuestions: [
      'Serializable vs snapshot isolation anomalies.',
      'Design DB scaling for multi-tenant write spikes.',
      'fork + COW interaction with large memory footprints.',
      'Explain deadlocks across app locks and DB locks.',
      'TLS 1.3 vs 1.2 handshake differences at a high level.',
    ],
    interviewReadyAnswers: [
      {
        question: 'How should I practice this list?',
        answer:
          'Shuffle the topics and record 60-second answers. For each, force one trade-off sentence. Then have a partner ask "why?" and "how?" once. Anything you cannot explain without notes goes back to its original day for a focused review before you move on.',
      },
    ],
    keyTakeaways: [
      'This list is your verbal gate before interviews.',
      'Mechanism + trade-off beats definition-only answers.',
      'Security topics: defensive framing only.',
      'Tie each topic back to a real system moment (request, query, deploy, outage).',
    ],
  },
)
