import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from './helpers'

/** Day 7 — Mixed advanced integration across DBMS, Networks, OS, Linux, OOP, Security, system design (30 questions) */
export const day7Questions: QuizQuestion[] = [
  // ===== EASY (10) =====
  q({
    id: 'd7-q01',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['System Design', 'Caching'],
    learningObjective: 'State the core trade-off of an application cache',
    question:
      'A service caches product pages in Redis with a 60s TTL. After a price update, some clients still see the old price for up to a minute. What is this pattern trading?',
    options: [
      'Correctness of the SQL parser for lower CPU',
      'Strong immediate consistency for lower read latency and origin load',
      'TLS security for faster TCP handshakes',
      'Process isolation for shared memory speed',
    ],
    correctAnswer: 1,
    explanation:
      'TTL caches intentionally allow stale reads for a bounded window to cut origin load and latency. That is an availability/performance vs freshness trade-off.',
    whyWrong: {
      '0': 'Caching does not change SQL parsing correctness.',
      '2': 'TLS and TCP handshake are orthogonal to cache TTL freshness.',
      '3': 'Process isolation is an OS concern, not what TTL caches trade.',
    },
    interviewTakeaway:
      'Name the consistency window explicitly when you propose caching.',
  }),
  tf({
    id: 'd7-q02',
    difficulty: 'easy',
    topics: ['Networks', 'Security'],
    learningObjective: 'Separate authentication from confidentiality on the wire',
    question:
      'True or False: Using HTTPS (TLS) alone guarantees that a logged-in user is authorized to delete another user’s account.',
    correct: false,
    explanation:
      'TLS protects confidentiality and integrity of the channel and authenticates the server (and optionally the client). Authorization — whether this principal may perform that action — is an application concern.',
    whyWrong: {
      '0': 'True would conflate transport security with app-level authz.',
    },
    interviewTakeaway: 'TLS ≠ authn ≠ authz — keep the three layers distinct.',
  }),
  q({
    id: 'd7-q03',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['OS', 'Processes'],
    learningObjective: 'Identify what a context switch saves/restores',
    question:
      'During a context switch from thread A to thread B on the same core, which state must the OS primarily save/restore for correctness of user computation?',
    options: [
      'Only the TLS session tickets of open sockets',
      'CPU registers and program counter (plus related thread context)',
      'Only the database connection pool size',
      'The entire disk filesystem journal',
    ],
    correctAnswer: 1,
    explanation:
      'A context switch preserves architectural state so A can resume later: registers, PC, and related thread metadata (and MMU context if address spaces differ).',
    whyWrong: {
      '0': 'Socket crypto state is not the core of a CPU context switch.',
      '2': 'Pool sizing is an app/DB concern, not switch machinery.',
      '3': 'Filesystem journals are I/O durability, not per-thread CPU state.',
    },
    interviewTakeaway: 'Context switch = save/restore CPU (+ address space if needed).',
  }),
  q({
    id: 'd7-q04',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Linux', 'Observability'],
    learningObjective: 'Pick the right Linux signal for diagnosing open files',
    question:
      'A Linux process fails with “Too many open files.” Which first check best targets the immediate limit?',
    options: [
      'cat /proc/<pid>/limits and compare open fds under /proc/<pid>/fd',
      'Disable swap permanently',
      'Increase TCP TIME_WAIT by setting MTU to 1',
      'Delete all B-tree indexes on the database',
    ],
    correctAnswer: 0,
    explanation:
      '`/proc/<pid>/limits` shows RLIMIT_NOFILE; `/proc/<pid>/fd` shows actual descriptors. That confirms whether the process hit its soft/hard fd ceiling.',
    whyWrong: {
      '1': 'Swap does not raise the open-file limit.',
      '2': 'MTU changes do not fix fd exhaustion.',
      '3': 'Indexes are unrelated to process fd limits.',
    },
    interviewTakeaway: 'Fd leaks → proc limits + fd listing before blind ulimit hikes.',
  }),
  q({
    id: 'd7-q05',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['OOP', 'Polymorphism'],
    learningObjective: 'Distinguish interface-based polymorphism from inheritance of state',
    question:
      'In an interview you say “depend on abstractions.” Which OOP mechanism best matches that for interchangeable payment providers?',
    options: [
      'A PaymentProcessor interface with Stripe/PayPal implementations',
      'Copy-pasting charge() into every controller',
      'Making every field public for faster access',
      'Storing passwords in StringBuilder for encapsulation',
    ],
    correctAnswer: 0,
    explanation:
      'Clients depend on a PaymentProcessor abstraction; concrete gateways implement it. That is dependency inversion / Strategy via interfaces.',
    whyWrong: {
      '1': 'Duplication fights change and testing.',
      '2': 'Public fields weaken encapsulation; not the abstraction point.',
      '3': 'Unrelated and insecure.',
    },
    interviewTakeaway: 'Polymorphism via interfaces enables swappable implementations.',
  }),
  q({
    id: 'd7-q06',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['DBMS', 'Transactions'],
    learningObjective: 'Recall ACID durability at a practical level',
    question:
      'A COMMIT returns success, then the DB host loses power before dirty data pages flush. Why can committed data still survive?',
    options: [
      'The query planner re-executes bash history on boot',
      'WAL (or equivalent redo log) flushed on commit enables redo recovery',
      'Indexes alone are the durability mechanism',
      'TCP retransmission stores row versions',
    ],
    correctAnswer: 1,
    explanation:
      'Log-ahead durability: commit forces the write-ahead log; recovery replays committed changes into data files after crash.',
    whyWrong: {
      '0': 'Bash history is irrelevant to DB durability.',
      '2': 'Indexes are access paths, not the durability contract.',
      '3': 'TCP retries packets, not durable row storage.',
    },
    interviewTakeaway: 'Durability story = forced log + redo, not “pages always flushed.”',
  }),
  q({
    id: 'd7-q07',
    type: 'multi',
    difficulty: 'easy',
    topics: ['System Design', 'Load Balancing'],
    learningObjective: 'List valid reasons to put a load balancer in front of app servers',
    question:
      'Which are legitimate reasons to introduce an L7 load balancer in front of identical stateless app replicas? (Select all that apply)',
    options: [
      'Distribute requests and hide individual instance IPs',
      'Terminate TLS and route by path/host',
      'Guarantee linearizable cross-region database writes by itself',
      'Enable rolling deploys by draining instances from the pool',
    ],
    correctAnswer: [0, 1, 3],
    explanation:
      'LBs distribute traffic, can terminate TLS and route at L7, and support draining for deploys. They do not by themselves provide DB linearizability across regions.',
    whyWrong: {
      '2': 'DB consistency is a data-store/protocol problem, not solved by an LB alone.',
    },
    interviewTakeaway: 'LB = traffic + TLS + deploy ergonomics — not a consistency oracle.',
  }),
  q({
    id: 'd7-q08',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Security', 'Auth'],
    learningObjective: 'Recognize why passwords must be salted and hashed',
    question:
      'A breach dumps a user table. Which storage choice most reduces the damage if attackers offline-crack the dump?',
    options: [
      'Plaintext passwords for “debuggability”',
      'Unique salt + slow password hash (e.g. Argon2/bcrypt) per password',
      'Base64 encoding of the password',
      'MD5 of the email address only',
    ],
    correctAnswer: 1,
    explanation:
      'Unique salts defeat rainbow tables; memory-hard/slow hashes raise cracking cost. Encoding and email hashes are not password protection.',
    whyWrong: {
      '0': 'Plaintext is catastrophic on dump.',
      '2': 'Base64 is reversible encoding, not hashing.',
      '3': 'Does not verify or protect the password secret.',
    },
    interviewTakeaway: 'Salted slow hash — never “encrypted password” hand-waving.',
  }),
  q({
    id: 'd7-q09',
    type: 'numerical',
    difficulty: 'easy',
    topics: ['Networks', 'Latency'],
    learningObjective: 'Convert RTT counting into rough latency budget',
    question:
      'A client needs 2 full round trips before the first application byte (ignore processing). One-way delay is 40 ms. Enter the minimum network wait in ms before that first byte can arrive.',
    correctAnswer: '160',
    acceptedAnswers: ['160'],
    explanation:
      'RTT = 2 × 40 = 80 ms. Two RTTs ⇒ 160 ms of network wait before the first app byte (classic TLS/HTTP handshake style budgeting).',
    whyWrong: {
      '80': 'That is only one RTT.',
      '40': 'That is one-way delay only.',
    },
    interviewTakeaway: 'Interview latency math: count RTTs, not just bandwidth.',
  }),
  tf({
    id: 'd7-q10',
    difficulty: 'easy',
    topics: ['OS', 'Virtual Memory'],
    learningObjective: 'Clarify what virtual memory provides',
    question:
      'True or False: Virtual memory lets each process have its own address space so one process generally cannot freely read another’s private pages without OS-mediated sharing.',
    correct: true,
    explanation:
      'Per-process page tables isolate address spaces. Sharing requires explicit mechanisms (shared mappings, IPC), not casual pointer dereference across processes.',
    whyWrong: {
      '1': 'False would deny the isolation purpose of virtual memory.',
    },
    interviewTakeaway: 'VM = isolation + overcommit/paging — not just “more RAM.”',
  }),

  // ===== MEDIUM (10) =====
  q({
    id: 'd7-q11',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['System Design', 'DBMS', 'Caching'],
    learningObjective: 'Choose cache invalidation strategy under write traffic',
    question:
      'A profile API is cache-aside: read Redis, else DB, then fill cache. After profile updates, users intermittently see stale bios for minutes. Which fix best matches cache-aside discipline?',
    options: [
      'Never write to the DB again — Redis is source of truth',
      'On update: write DB then delete/invalidate the cache key (and accept rare race windows you design for)',
      'Set TTL to infinity and restart Redis weekly',
      'Disable primary keys so updates are faster',
    ],
    correctAnswer: 1,
    explanation:
      'Cache-aside keeps DB authoritative; writes should invalidate (or carefully update) the cache so subsequent reads refill. Infinite TTL without invalidation is how stale bios linger.',
    whyWrong: {
      '0': 'Abandoning the DB breaks durability and queryability.',
      '2': 'Weekly restart is an uncontrolled consistency model.',
      '3': 'Dropping keys damages integrity and is unrelated.',
    },
    interviewTakeaway: 'Cache-aside: DB wins; invalidate on write; name the race.',
  }),
  q({
    id: 'd7-q12',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Networks', 'TCP'],
    learningObjective: 'Explain why head-of-line blocking appears with TCP + HTTP/1.1',
    question:
      'Many small API calls share one TCP connection with HTTP/1.1 pipelining disabled (request/response). Why can one slow response hurt latency of later calls on that connection?',
    options: [
      'UDP checksums force global locks across hosts',
      'Responses must stay ordered on that connection — a delayed response blocks subsequent responses (HoL)',
      'TLS always encrypts with ECB so packets stall',
      'DNS TTLs pause the kernel scheduler',
    ],
    correctAnswer: 1,
    explanation:
      'On a single HTTP/1.1 connection, responses are sequential; a stalled first response delays delivery of later ones — classic head-of-line blocking motivating multiplexing (HTTP/2) or more connections.',
    whyWrong: {
      '0': 'UDP checksums are unrelated to HTTP/1.1 response ordering.',
      '2': 'TLS mode myth; not the HoL mechanism here.',
      '3': 'DNS TTL does not pause scheduling for in-flight HTTP.',
    },
    interviewTakeaway: 'HoL: one connection’s ordering couples latencies.',
  }),
  q({
    id: 'd7-q13',
    type: 'code',
    difficulty: 'medium',
    topics: ['OOP', 'Concurrency'],
    learningObjective: 'Spot a shared mutable state bug under concurrency',
    question:
      'This counter is used by many request threads. What is the primary correctness issue?',
    codeSnippet: {
      language: 'java',
      code: `class HitCounter {
  private int hits = 0;
  public void inc() { hits++; }
  public int get() { return hits; }
}`,
    },
    options: [
      'int cannot store counts above 10',
      'hits++ is not atomic — lost updates under concurrency without synchronization/atomics',
      'get() must always throw CheckedException',
      'The class needs to extend Thread to be safe',
    ],
    correctAnswer: 1,
    explanation:
      '`hits++` is read-modify-write. Concurrent threads can interleave and lose increments. Use synchronization, locks, or AtomicInteger.',
    whyWrong: {
      '0': 'int range is far larger than 10.',
      '2': 'No such language requirement.',
      '3': 'Extending Thread does not make shared fields atomic.',
    },
    interviewTakeaway: 'Shared mutable state needs a concurrency story.',
  }),
  q({
    id: 'd7-q14',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Linux', 'Networking'],
    learningObjective: 'Diagnose TIME_WAIT / connection churn symptoms',
    question:
      'A client opens a new TCP connection per tiny request and briefly exhausts ephemeral ports. Which Linux-oriented mitigation is most appropriate?',
    options: [
      'Disable the NIC permanently',
      'Reuse connections (pooling/HTTP keep-alive) and/or tune/reuse strategies rather than one connection per RPC',
      'Set all sockets to UDP and ignore loss',
      'chmod 777 /proc/sys/net',
    ],
    correctAnswer: 1,
    explanation:
      'Ephemeral port exhaustion often comes from connection churn and TIME_WAIT accumulation. Persistent connections / pools reduce local port burn; blind chmod is not a fix.',
    whyWrong: {
      '0': 'Destructive and unrelated to correct reuse.',
      '2': 'UDP changes reliability semantics; not a drop-in fix.',
      '3': 'Permissions theater; not the engineering fix.',
    },
    interviewTakeaway: 'Port exhaustion → connection reuse first, then kernel tunables.',
  }),
  q({
    id: 'd7-q15',
    type: 'multi',
    difficulty: 'medium',
    topics: ['DBMS', 'Indexing', 'SQL'],
    learningObjective: 'Select indexes that match a filter/sort pattern',
    question:
      'Query: WHERE status = ? AND created_at > ? ORDER BY created_at. Which index designs are plausible supports? (Select all that apply)',
    options: [
      'BTREE (status, created_at)',
      'BTREE (created_at, status) — may help less for equality-on-status + range if status is selective first',
      'A hash index only on a random UUID never referenced by the query',
      'Partial index on (created_at) WHERE status = \'ACTIVE\' if almost all queries use that status',
    ],
    correctAnswer: [0, 3],
    explanation:
      'Leading equality on status then range/order on created_at fits (status, created_at). A partial index can be ideal when status is a constant. A random UUID index is useless here; (created_at, status) is usually weaker for this shape.',
    whyWrong: {
      '1': 'Wrong column order is typically inferior for equality+range on the other column.',
      '2': 'Unrelated column cannot support the predicates.',
    },
    interviewTakeaway: 'Index column order follows equality → range/sort.',
  }),
  q({
    id: 'd7-q16',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['Security', 'Networks', 'System Design'],
    learningObjective: 'Place TLS termination and trust boundaries thoughtfully',
    question:
      'An edge proxy terminates TLS, then forwards HTTP to app pods on a private network. Security review asks about the biggest residual risk. Which answer is most accurate?',
    options: [
      'There is no residual risk because private IPs are magical',
      'Traffic after termination is plaintext on the east-west path unless you re-encrypt or use a mesh/mTLS — compromise of the network/proxy path exposes bodies',
      'TLS termination makes SQL injection impossible',
      'Private networks disable all authorization checks automatically',
    ],
    correctAnswer: 1,
    explanation:
      'Edge termination decrypts at the proxy. Hop-to-app is a new trust segment; without mTLS/re-encryption, insiders or lateral movers can sniff/modify.',
    whyWrong: {
      '0': 'Private ≠ confidential against lateral threats.',
      '2': 'TLS does not stop injection in query construction.',
      '3': 'Authz remains an application duty.',
    },
    interviewTakeaway: 'Draw the trust boundary where TLS ends.',
  }),
  q({
    id: 'd7-q17',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['OS', 'Scheduling'],
    learningObjective: 'Relate CPU-bound vs I/O-bound work to scheduling behavior',
    question:
      'A multi-tenant host runs a tight CPU hashing loop alongside a disk-bound log shipper. Why might the shipper still make progress under a preemptive OS scheduler?',
    options: [
      'CPU-bound tasks never yield, so I/O tasks freeze forever on all OSes',
      'Time slices / preemption interrupt the CPU hog; I/O tasks sleep on wait and run when ready',
      'Disk firmware implements Java synchronized',
      'Virtual memory disables all multitasking',
    ],
    correctAnswer: 1,
    explanation:
      'Preemption prevents pure CPU hogs from monopolizing the core forever; I/O-bound threads block in waits and are scheduled when I/O completes.',
    whyWrong: {
      '0': 'Overstates; preemptive kernels interrupt CPU hogs.',
      '2': 'Firmware does not provide Java monitors.',
      '3': 'VM enables multitasking isolation, not disable it.',
    },
    interviewTakeaway: 'Preemption + blocking I/O = interleaved progress.',
  }),
  q({
    id: 'd7-q18',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['System Design', 'Consistency'],
    learningObjective: 'Map CAP-style trade-offs to a concrete outage choice',
    question:
      'A multi-region key-value store partitions: region A cannot reach region B. Product requires the API to keep accepting writes in both regions during the split. What must you accept?',
    options: [
      'Strong single-copy consistency across regions without conflict resolution',
      'Potential conflicting writes / divergence until heal, needing merge or last-write rules',
      'That TCP will serialize all cross-region writes automatically',
      'That ACID serializability is free across disconnected primaries',
    ],
    correctAnswer: 1,
    explanation:
      'Preferring availability for writes on both sides of a partition implies concurrent conflicting histories — you need conflict resolution or accept divergence.',
    whyWrong: {
      '0': 'Unavailable under partition if you insist on one linearizable copy.',
      '2': 'TCP does not provide cross-region consensus.',
      '3': 'Serializability across disconnected primaries is not free.',
    },
    interviewTakeaway: 'Availability during partition ⇒ conflict story required.',
  }),
  q({
    id: 'd7-q19',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['System Design', 'Capacity'],
    learningObjective: 'Estimate replicas from QPS and per-instance capacity',
    question:
      'Peak QPS = 12,000. One app instance sustains 2,000 QPS at target p95. With 2× headroom for spikes/deploys, how many instances should you provision? Enter an integer.',
    correctAnswer: '12',
    acceptedAnswers: ['12'],
    explanation:
      'Base need = 12000/2000 = 6 instances. 2× headroom ⇒ 12.',
    whyWrong: {
      '6': 'Missing the required 2× headroom.',
      '24': 'Over-applies headroom (4×).',
    },
    interviewTakeaway: 'Capacity = ceil(load/capacity) × safety factor — say the factor.',
  }),
  tf({
    id: 'd7-q20',
    difficulty: 'medium',
    topics: ['OOP', 'Design'],
    learningObjective: 'Critique inheritance for code reuse',
    question:
      'True or False: Deep class inheritance is always preferable to composition when two types share a few utility methods.',
    correct: false,
    explanation:
      'Inheritance couples hierarchy and lifecycles; for shared utilities, composition/helpers often reduce fragility. “Always prefer deep inheritance” is a classic anti-pattern.',
    whyWrong: {
      '0': 'True overstates inheritance as default reuse.',
    },
    interviewTakeaway: 'Prefer composition unless you truly have an is-a taxonomy.',
  }),

  // ===== HARD (10) — cross-topic =====
  q({
    id: 'd7-q21',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Security', 'Networks', 'DBMS', 'Indexing'],
    learningObjective: 'Connect TLS, authorization, and indexed data access in one design',
    question:
      'A fintech API uses TLS to the edge, JWT authn, and a query `SELECT * FROM accounts WHERE owner_id = ?`. Attackers with valid logins still read others’ rows by changing IDs. Latency is also high (seq scans). What combined fix is most coherent?',
    options: [
      'Drop TLS — it caused the IDOR — and add more columns to SELECT',
      'Enforce authz so owner_id is bound to the authenticated subject (or equivalent policy), keep TLS, and index (owner_id) / covering columns for the access path',
      'Replace JWT with Base64 of user_id and remove all indexes for write speed',
      'Move passwords into the JWT and disable database constraints',
    ],
    correctAnswer: 1,
    explanation:
      'IDOR is an authorization bug: the predicate must be constrained to the caller’s identity (or central policy). TLS does not stop authorized-but-wrong-object access. Indexing owner_id fixes the seq-scan latency once the safe predicate exists.',
    whyWrong: {
      '0': 'TLS did not cause IDOR; removing it worsens confidentiality.',
      '2': 'Base64 is not authn; removing indexes worsens reads.',
      '3': 'Putting secrets in JWTs and dropping constraints compounds risk.',
    },
    interviewTakeaway: 'TLS + authn + authz + indexed tenant key — all four in one answer.',
  }),
  q({
    id: 'd7-q22',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['OS', 'DBMS', 'Networks', 'System Design'],
    learningObjective: 'Trace latency across context switches, DB pools, and network RTT',
    question:
      'p99 API latency spikes under load. Threads block waiting for JDBC connections; pool max=10; each query ~5ms CPU but often waits on remote DB RTT ~2ms; app does heavy per-request thread handoffs. Which diagnosis best combines OS + DB pool + network?',
    options: [
      'Increase MTU until context switches disappear',
      'Pool exhaustion queues requests; each checkout couples to DB RTT; excessive context switches/thread thrash add scheduling delay — raise pool carefully, cut chatty RTTs (batch), reduce unnecessary blocking/handoffs',
      'Disable the OS scheduler so SQL runs in interrupt context only',
      'Remove primary keys so pools return connections faster',
    ],
    correctAnswer: 1,
    explanation:
      'Small pools create wait queues; each borrowed connection still pays network RTT to the DB; thread thrashing adds context-switch overhead. Fixes: size pools with DB limits, reduce round trips, avoid needless blocking handoffs.',
    whyWrong: {
      '0': 'MTU does not eliminate scheduling or pool queueing.',
      '2': 'Running SQL in interrupt context is nonsensical/dangerous.',
      '3': 'Keys unrelated to pool wait mechanics.',
    },
    interviewTakeaway: 'Latency = queue + RTT×chattiness + scheduling — profile each.',
  }),
  q({
    id: 'd7-q23',
    type: 'multi',
    difficulty: 'hard',
    topics: ['Linux', 'Security', 'OS', 'Networks'],
    learningObjective: 'Select layered controls for a compromised app process',
    question:
      'Assume an app process is RCE’d on a Linux host. Which defenses meaningfully limit blast radius? (Select all that apply)',
    options: [
      'Run as non-root with least privileges; tighten filesystem permissions',
      'Network egress allowlists / security groups so the process cannot scan the entire intranet',
      'seccomp/AppArmor/SELinux profiles reducing dangerous syscalls/capabilities',
      'Store DB admin credentials in world-readable /tmp for “ops convenience”',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'Least privilege, egress controls, and MAC/seccomp reduce lateral movement and data access after RCE. World-readable admin creds expand blast radius.',
    whyWrong: {
      '3': 'Credential exposure is the opposite of containment.',
    },
    interviewTakeaway: 'Defense in depth: identity, filesystem, syscalls, egress.',
  }),
  q({
    id: 'd7-q24',
    type: 'code',
    difficulty: 'hard',
    topics: ['OOP', 'Security', 'DBMS'],
    learningObjective: 'Spot injection + broken encapsulation across layers',
    question:
      'What is the dominant risk in this “repository” used by many subclasses?',
    codeSnippet: {
      language: 'java',
      code: `abstract class UserRepo {
  protected Connection conn; // shared
  String find(String id) {
    return exec("SELECT * FROM users WHERE id='" + id + "'");
  }
}`,
    },
    options: [
      'abstract classes cannot hold fields in Java',
      'String-concatenated SQL enables injection; shared mutable Connection also invites races across threads/subclasses',
      'SELECT * is rejected by all SQL engines',
      'Protected visibility encrypts the connection automatically',
    ],
    correctAnswer: 1,
    explanation:
      'Concatenated SQL is classic injection. A shared Connection without pooling/synchronization discipline is unsafe under concurrency. Parameterized queries + clear ownership fix both.',
    whyWrong: {
      '0': 'Abstract classes may have fields.',
      '2': 'SELECT * is legal (just sloppy).',
      '3': 'protected is visibility, not encryption.',
    },
    interviewTakeaway: 'Parameterized queries + resource ownership beat inheritance sugar.',
  }),
  q({
    id: 'd7-q25',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['System Design', 'DBMS', 'OS', 'Caching'],
    learningObjective: 'Design read path under memory pressure and consistency needs',
    question:
      'A feed service keeps a huge in-process cache. Under memory pressure the Linux OOM killer shoots the JVM. A proposal: give every pod 64GB heap caches and strong consistency with the write DB on every read. Critique the combined idea.',
    options: [
      'Perfect — OOM means caches are working',
      'Giant heaps increase GC/OOM risk; “check DB every read” negates cache latency wins — prefer bounded off-heap/Redis with TTLs/invalidations and cgroup memory limits',
      'OOM killer only kills idle kernels, never JVMs',
      'Strong consistency requires disabling virtual memory globally',
    ],
    correctAnswer: 1,
    explanation:
      'Unbounded in-process caches fight cgroup limits and GC. If every read hits DB for strong consistency, the cache is not buying much. External bounded caches + explicit invalidation/TTL + memory limits are the coherent design.',
    whyWrong: {
      '0': 'OOM is failure, not success.',
      '2': 'False — user processes are OOM targets.',
      '3': 'Consistency models do not require disabling VM.',
    },
    interviewTakeaway: 'Bound memory; don’t pay DB on every read unless required.',
  }),
  q({
    id: 'd7-q26',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Networks', 'Security', 'System Design', 'OOP'],
    learningObjective: 'Combine mTLS service identity with authorization interfaces',
    question:
      'Service A calls Service B. You terminate TLS with a shared cluster cert on the mesh gateway only, and B exposes an interface `AuthzClient.allow(principal, action, resource)`. Engineers pass the string `"admin"` from A without verifying identity. What is the core failure?',
    options: [
      'Interfaces cannot be used across network hops',
      'Missing authenticated service/user identity (e.g. mTLS/SPIFFE + token) bound into authz — a forgeable principal string makes the AuthzClient a decoration',
      'Shared certs make TCP congestion windows larger',
      'OOP interfaces disable TLS 1.3',
    ],
    correctAnswer: 1,
    explanation:
      'Authorization APIs are only as strong as authenticated identity. A forgeable `"admin"` string without cryptographic service/user identity is broken. Mesh identity (mTLS) plus end-to-end principal propagation should feed AuthzClient.',
    whyWrong: {
      '0': 'Interfaces can model remote clients fine.',
      '2': 'Cert sharing ≠ congestion control.',
      '3': 'Type-system interfaces unrelated to TLS versions.',
    },
    interviewTakeaway: 'Authz interfaces need real authenticated principals, not trust strings.',
  }),
  q({
    id: 'd7-q27',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['DBMS', 'OS', 'Linux', 'System Design'],
    learningObjective: 'Reason about fsync, WAL, and container disk limits together',
    question:
      'Postgres in Docker reports commits stalling; `iostat` shows high write latency; the volume is a slow shared cloud disk; `fsync` is on (good for durability). Product wants 10× commit QPS on the same VM. Which response is most honest across layers?',
    options: [
      'Turn off fsync and WAL entirely in production — durability is a myth',
      'You are fsync/WAL bound on slow media — scale commits via batching, group commit awareness, faster disks/provisioned IOPS, or horizontal write sharding — not by deleting durability',
      'Context-switch to real-mode CPU to bypass the block layer',
      'chmod +x the data directory to accelerate fsync',
    ],
    correctAnswer: 1,
    explanation:
      'Commit rate often tracks log flush I/O. Slow volumes + fsync create a hard ceiling. Batching, better storage, and sharding are real levers; disabling WAL/fsync gambles durability.',
    whyWrong: {
      '0': 'Unacceptable durability failure mode for most prod DBs.',
      '2': 'Not a real engineering control on Linux servers.',
      '3': 'Execute bits do not speed fsync.',
    },
    interviewTakeaway: 'Commit QPS ↔ log disk; don’t “fix” durability for demos.',
  }),
  q({
    id: 'd7-q28',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Networks', 'OS', 'DBMS', 'Security'],
    learningObjective: 'Debug intermittent auth failures spanning DNS, TLS, and connection pools',
    question:
      'Intermittent “SSL handshake / server identity” errors appear after a blue/green DB cutover. Apps use a connection pool with long-lived connections; DNS TTL for `db.internal` is 300s; new primary presents a new cert hostname. What cross-layer explanation fits best?',
    options: [
      'Pools may keep sockets to the old backend; resolvers cache DNS; TLS hostname checks fail when traffic shifts — drain pools, lower TTL or use stable names/SANs, rotate with overlapping cert validity',
      'Linux virtual memory rewrites SubjectAltName fields at runtime',
      'B+ trees store certificates, so REINDEX fixes TLS',
      'OOP encapsulation disables DNS',
    ],
    correctAnswer: 0,
    explanation:
      'Long-lived pools + DNS caching pin clients to old endpoints; cert/hostname mismatches appear mid-cutover. Coordinate DNS/certs and recycle pools.',
    whyWrong: {
      '1': 'VM does not mutate X.509 SANs.',
      '2': 'Indexes unrelated to TLS identity.',
      '3': 'Nonsense conflation of OOP and DNS.',
    },
    interviewTakeaway: 'Cutovers: DNS TTL × pooled connections × cert names.',
  }),
  q({
    id: 'd7-q29',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['System Design', 'DBMS', 'Networks', 'OOP'],
    learningObjective: 'Choose an idempotency approach spanning API design and storage',
    question:
      'PaymentCharge.charge(cmd) must be safe under client retries after TCP timeouts (unknown outcome). Which design best integrates API + DB concerns?',
    options: [
      'Ignore duplicates — charging twice is fine for revenue',
      'Require an idempotency key; persist a uniqueness constraint on that key with request outcome; retries read the stored result instead of inserting a second charge',
      'Use UDP so timeouts cannot happen',
      'Make charge() synchronized globally across the fleet with one JVM lock',
    ],
    correctAnswer: 1,
    explanation:
      'Idempotency keys with a durable unique constraint turn at-least-once delivery into exactly-once effects (for that key). Fleet-wide JVM locks don’t exist; UDP doesn’t remove application uncertainty.',
    whyWrong: {
      '0': 'Double charge is a critical bug.',
      '2': 'UDP worsens reliability semantics.',
      '3': 'No single JVM lock across distributed instances.',
    },
    interviewTakeaway: 'Retries ⇒ idempotency key + durable uniqueness.',
  }),
  q({
    id: 'd7-q30',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Linux', 'OS', 'Networks', 'System Design', 'Security'],
    learningObjective: 'Narrate an end-to-end production incident across the stack',
    question:
      'On-call: API errors spike. Symptoms: rising `TIME_WAIT`/`ESTAB` on app hosts, thread dumps show threads blocked in `read()` on DB sockets, Redis CPU hot from stampeding cache misses after flush, and auth service latency up from TLS handshakes (no session reuse). Which ordered response best shows cross-topic fluency?',
    options: [
      'Only rewrite the app in a new OOP language — networking cannot be the cause',
      'Stop the cache stampede (thundering herd locks/singleflight/soft TTL), restore connection reuse/pools for DB and auth TLS, shed load/scale auth, verify ulimit/conntrack; then add guarded cache warmup — not “flush Redis again”',
      'Disable all indexes and SELinux permanently as step one',
      'Lower DNS TTL to 0 and reboot every pod every minute forever',
    ],
    correctAnswer: 1,
    explanation:
      'A Redis flush causes herd misses → DB socket pileup → thread blocking → more connections/TLS to auth. Mitigate herd, reuse connections/sessions, protect auth capacity, then warm caches safely.',
    whyWrong: {
      '0': 'Language rewrite ignores the operational failure mode.',
      '2': 'Destructive and off-target as a first step.',
      '3': 'Chaotic churn worsens storms.',
    },
    interviewTakeaway:
      'Incidents are cross-layer: cache herds × pools × TLS × thread blocking.',
  }),
]

export default day7Questions
