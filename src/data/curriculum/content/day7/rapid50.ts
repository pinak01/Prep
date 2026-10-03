import type { StudyPage } from '@/types/curriculum'
import { createPage, ol, p, section, ul } from '../../../helpers'

const rapid50 = [
  'TCP three-way handshake steps?',
  'Why not two-way handshake?',
  'What does HTTPS protect?',
  'DNS resolution high-level steps?',
  'Why B+ trees for indexes?',
  'Clustered vs secondary index?',
  'What is normalization for?',
  '2NF in one sentence?',
  '3NF vs BCNF?',
  'Define a transaction.',
  'ACID — one line each.',
  'Conflict serializability test?',
  'Dirty vs non-repeatable vs phantom?',
  'What is MVCC?',
  'What is a deadlock?',
  'Virtual memory purpose?',
  'What is a page fault?',
  'TLB purpose?',
  'What happens in a context switch?',
  'Process vs thread?',
  'Linux process creation: fork/exec?',
  'How does a pipe work?',
  'chmod 755 meaning?',
  'Encapsulation vs abstraction?',
  'Inheritance vs composition — prefer?',
  'What is dynamic dispatch?',
  'SRP of SOLID?',
  'DIP of SOLID?',
  'Strategy pattern purpose?',
  'Authn vs authz?',
  'Hashing vs encryption?',
  'Why salt passwords?',
  'TLS certificate chain idea?',
  'SQL injection prevention?',
  'XSS prevention?',
  'CSRF prevention?',
  'REST Stateless meaning?',
  'Why caching helps?',
  'L4 vs L7 load balancer?',
  'How to scale a database stepwise?',
  'Connection pooling why?',
  'WHERE vs HAVING?',
  'LEFT JOIN pitfall with WHERE?',
  'Idempotent HTTP methods?',
  'CAP during partition?',
  'WAL purpose?',
  'Semaphore vs mutex?',
  'Banker’s algorithm purpose?',
  'Observability triad?',
  'First three steps debugging a slow API?',
]

const rapid50Answers: { question: string; answer: string }[] = [
  {
    question: 'TCP three-way handshake steps?',
    answer:
      'Client sends SYN with its initial sequence number; server replies SYN-ACK with its own ISN and ack of client; client sends ACK. Both sides then have agreed sequence spaces and can exchange data reliably.',
  },
  {
    question: 'Why not two-way handshake?',
    answer:
      'Two-way cannot safely synchronize both sequence numbers against delayed duplicate SYNs: an old SYN could open a half-valid connection. The third ACK lets the initiator confirm the server’s ISN and reject stale opens.',
  },
  {
    question: 'What does HTTPS protect?',
    answer:
      'TLS encrypts and integrity-protects the HTTP bytes in transit and authenticates the server (and optionally the client) via certificates. It does not fix authz bugs, XSS, or protect data at rest on either endpoint.',
  },
  {
    question: 'DNS resolution high-level steps?',
    answer:
      'Stub resolver asks recursive resolver; cache hits return early. Otherwise the recursive walks root → TLD → authoritative, gets A/AAAA (and often CNAME), and returns the answer with TTL for caching.',
  },
  {
    question: 'Why B+ trees for indexes?',
    answer:
      'All keys live in leaves with sibling links, so range scans are sequential leaf walks with few random I/Os. High fanout keeps trees shallow; internal nodes are separators only. Trade-off: writes must maintain balance and leaf links.',
  },
  {
    question: 'Clustered vs secondary index?',
    answer:
      'Clustered (primary) organizes table rows by the index key; secondary points to the row (or PK) and may need a heap/cluster lookup. Trade-off: great for PK-range locality; secondary adds write cost and possibly extra I/O on read.',
  },
  {
    question: 'What is normalization for?',
    answer:
      'Reduce update anomalies and redundant storage by ensuring each fact lives in one place with clear keys and dependencies. Trade-off: more joins at read time, so warehouses often denormalize intentionally.',
  },
  {
    question: '2NF in one sentence?',
    answer:
      'Already in 1NF, and every non-key attribute depends on the whole candidate key—no partial dependency on a composite key.',
  },
  {
    question: '3NF vs BCNF?',
    answer:
      '3NF forbids non-key → non-key transitive deps; BCNF requires every determinant to be a candidate key. BCNF is stricter; rare cases keep 3NF when BCNF would lose a dependency or force awkward decompositions.',
  },
  {
    question: 'Define a transaction.',
    answer:
      'A logical unit of work the DBMS treats as atomic: either all its changes commit or none do, under isolation from concurrent transactions and durability after commit.',
  },
  {
    question: 'ACID — one line each.',
    answer:
      'Atomicity: all-or-nothing. Consistency: integrity rules hold after commit. Isolation: concurrent txs do not see illegal intermediate states. Durability: committed data survives crashes (WAL/fsync).',
  },
  {
    question: 'Conflict serializability test?',
    answer:
      'Build a precedence graph of conflict edges (rw/wr/ww on same item); the schedule is conflict-serializable iff the graph is acyclic. Cycle means no equivalent serial order under conflict equivalence.',
  },
  {
    question: 'Dirty vs non-repeatable vs phantom?',
    answer:
      'Dirty: read uncommitted data that may roll back. Non-repeatable: same row reread shows a committed update. Phantom: a range query sees new/removed rows from another commit. Severity and locks/MVCC differ.',
  },
  {
    question: 'What is MVCC?',
    answer:
      'Readers see a snapshot version of rows instead of blocking writers (and vice versa for many workloads). Trade-off: version storage/cleanup (vacuum) and anomalies like write skew under snapshot isolation.',
  },
  {
    question: 'What is a deadlock?',
    answer:
      'A cycle of waits where each holder waits for a lock another holds. DBMS detects via wait-for graph or timeout and aborts a victim; apps should keep lock order consistent and keep critical sections short.',
  },
  {
    question: 'Virtual memory purpose?',
    answer:
      'Give each process a large private address space, isolate processes, and oversubscribe RAM by paging to disk. Trade-off: page faults and TLB pressure under memory pressure.',
  },
  {
    question: 'What is a page fault?',
    answer:
      'CPU references a virtual page not mapped in the TLB/page table (or not resident). Kernel loads from disk/swap or allocates, updates mappings, then resumes—or signals a segfault for invalid access.',
  },
  {
    question: 'TLB purpose?',
    answer:
      'Cache recent virtual→physical translations so each memory access is not a full page-table walk. Misses are costly; large working sets or frequent context switches thrash the TLB.',
  },
  {
    question: 'What happens in a context switch?',
    answer:
      'Kernel saves/restores registers, stack pointer, and address-space/TLB context, then schedules another thread. Cost is not just the switch itself but cold caches and TLB after the switch.',
  },
  {
    question: 'Process vs thread?',
    answer:
      'Process: own address space and OS resources. Threads share that space and FDs within a process, so communication is cheap but races need sync. Isolation vs shared-state concurrency is the core trade-off.',
  },
  {
    question: 'Linux process creation: fork/exec?',
    answer:
      'fork clones the process (COW pages); exec overlays a new program image in the child. Typical pattern: fork → child execs binary; parent waits or continues. posix_spawn packages the common case.',
  },
  {
    question: 'How does a pipe work?',
    answer:
      'Kernel buffer with a read end and write end; writers block when full, readers when empty. Used for parent–child IPC after fork; unidirectional; for bidirectional use two pipes or a socketpair.',
  },
  {
    question: 'chmod 755 meaning?',
    answer:
      'Owner rwx (7), group rx (5), others rx (5)—typical executable/dir: owner can write, everyone can read/execute. Directories need execute to traverse; files need execute to run.',
  },
  {
    question: 'Encapsulation vs abstraction?',
    answer:
      'Encapsulation hides internal state behind a controlled interface. Abstraction models the essential behavior clients need, omitting irrelevant detail. You need both: hide how, expose what.',
  },
  {
    question: 'Inheritance vs composition — prefer?',
    answer:
      'Prefer composition: has-a wiring is more flexible and avoids fragile base-class coupling. Use inheritance when you truly have a stable is-a hierarchy and want polymorphic reuse of behavior.',
  },
  {
    question: 'What is dynamic dispatch?',
    answer:
      'At runtime the concrete override is chosen (e.g., vtable lookup) based on the object’s type, not the static reference type. Enables polymorphism; costs an indirect call and harder inlining.',
  },
  {
    question: 'SRP of SOLID?',
    answer:
      'A module should have one reason to change—one cohesive responsibility. Not “one method,” but one axis of change so features do not couple unrelated edits.',
  },
  {
    question: 'DIP of SOLID?',
    answer:
      'High-level policy depends on abstractions, not concrete details; details implement those abstractions. Enables testing with fakes and swapping storage/payment implementations.',
  },
  {
    question: 'Strategy pattern purpose?',
    answer:
      'Encapsulate interchangeable algorithms behind an interface and inject the chosen strategy. Avoids giant conditionals; trade-off is more types and indirection for simple cases.',
  },
  {
    question: 'Authn vs authz?',
    answer:
      'Authentication proves who you are; authorization decides what that subject may do to which resource. IDOR is usually an authz failure after successful authn.',
  },
  {
    question: 'Hashing vs encryption?',
    answer:
      'Hashing is one-way for integrity or password verification; encryption is reversible with a key for confidentiality. Encoding (Base64) is neither. Passwords need slow salted hashes, not AES.',
  },
  {
    question: 'Why salt passwords?',
    answer:
      'Per-password random salt makes identical passwords hash differently and defeats precomputed rainbow tables. Salt is not secret; secrecy is in the slow KDF (Argon2id/bcrypt) and server-side parameters.',
  },
  {
    question: 'TLS certificate chain idea?',
    answer:
      'Leaf cert is signed by an intermediate, ultimately chaining to a trusted root in the client store. Client also checks hostname, validity window, and revocation/status as configured.',
  },
  {
    question: 'SQL injection prevention?',
    answer:
      'Use parameterized queries/prepared statements so user input is never concatenated into SQL. Least-privilege DB users and input validation layer defense; never rely on escaping alone.',
  },
  {
    question: 'XSS prevention?',
    answer:
      'Context-aware output encoding, strict CSP, HttpOnly cookies, and treat all untrusted HTML as dangerous. Prefer frameworks that auto-escape; sanitize only when rich HTML is required.',
  },
  {
    question: 'CSRF prevention?',
    answer:
      'Anti-CSRF tokens bound to the session for state-changing requests, SameSite cookies, and avoid mutating via GET. For APIs, prefer Authorization headers over cookie-only auth when feasible.',
  },
  {
    question: 'REST Stateless meaning?',
    answer:
      'Each request carries enough auth/context that the server need not remember client session state between calls. Enables horizontal scale; trade-off: larger tokens/headers or external session stores.',
  },
  {
    question: 'Why caching helps?',
    answer:
      'Avoids repeating expensive work (DB, compute, remote calls) for hot keys, cutting latency and load. Trade-off: staleness, invalidation complexity, and stampedes under miss storms.',
  },
  {
    question: 'L4 vs L7 load balancer?',
    answer:
      'L4 balances TCP/UDP by IP/port with low overhead; L7 understands HTTP for path/header routing, TLS terminate, and richer policies. L7 is smarter but costlier per request.',
  },
  {
    question: 'How to scale a database stepwise?',
    answer:
      'Optimize queries/indexes → add cache → vertical scale → read replicas → shard/partition when write or data size demands. Measure at each step; sharding is last because of operational cost.',
  },
  {
    question: 'Connection pooling why?',
    answer:
      'Creating DB connections is expensive (TCP, auth, memory). A pool reuses them and caps concurrency to protect the DB. Mis-sizing causes queue wait or max_connections exhaustion.',
  },
  {
    question: 'WHERE vs HAVING?',
    answer:
      'WHERE filters rows before aggregation; HAVING filters groups after GROUP BY. Use WHERE for row predicates; HAVING for aggregate conditions like COUNT(*) > 1.',
  },
  {
    question: 'LEFT JOIN pitfall with WHERE?',
    answer:
      'Filtering the right table in WHERE turns LEFT JOIN into an inner join by eliminating unmatched left rows (NULLs fail the predicate). Put right-side filters in ON, or handle NULLs explicitly.',
  },
  {
    question: 'Idempotent HTTP methods?',
    answer:
      'GET, PUT, DELETE, HEAD, OPTIONS are idempotent by spec: repeating has the same resource effect. POST is not. Design APIs so retries of PUT/DELETE (and idempotent POST with keys) are safe.',
  },
  {
    question: 'CAP during partition?',
    answer:
      'When nodes cannot communicate, you choose between serving possibly stale/divergent data (AP) or refusing some writes/reads for linearizability (CP). CAP is about partition behavior, not “pick two always.”',
  },
  {
    question: 'WAL purpose?',
    answer:
      'Write-ahead log records changes before data pages are durable so crash recovery can redo/undo. Enables durability, PITR, and replication; trade-off is sequential log I/O and fsync latency.',
  },
  {
    question: 'Semaphore vs mutex?',
    answer:
      'Mutex is binary ownership by one locker; semaphore counts permits for signaling/resource pools and may not track owner. Prefer mutex for critical sections; semaphore for N-resource or producer–consumer.',
  },
  {
    question: 'Banker’s algorithm purpose?',
    answer:
      'Deadlock avoidance: allocate resources only if the resulting state is still safe (exists an order all processes can finish). Conservative vs detection/recovery; needs max-claim knowledge.',
  },
  {
    question: 'Observability triad?',
    answer:
      'Metrics (aggregates/alerts), logs (event detail), traces (request path across services). Together they answer “is it broken?”, “what happened?”, and “where did time go?”',
  },
  {
    question: 'First three steps debugging a slow API?',
    answer:
      'Reproduce with timing and request id; check RED/latency metrics and recent deploys; break down time into network, app CPU/GC, locks, and DB EXPLAIN. Fix the measured bottleneck, not a guess.',
  },
]

const rapid50Outlines = rapid50Answers.map(
  ({ question, answer }) => `${question} — ${answer}`,
)

export const rapid50Page: StudyPage = createPage(
  'd7-rapid50',
  'Rapid Fire — 50 Questions',
  20,
  [
    'Answer 50 core prompts in short verbal bursts',
    'Cover the full curriculum surface area',
  ],
  {
    sections: [
      section('howto', 'How to practice', [
        p('20–30 seconds each. No notes. Mark misses and revisit source days.'),
      ]),
      section('q', 'All 50 questions', [ol(rapid50)]),
      section('outlines', 'Model outlines (all 50)', [
        p(
          'Short verbal targets: WHY/HOW and a trade-off when it matters. Use interviewReadyAnswers in the UI for the same text as Q–A cards.',
        ),
        ul(rapid50Outlines),
      ]),
      section('hints', 'Spot-check themes', [
        ul([
          'Indexes: B+ tree, fewer I/Os, write amplification, selectivity.',
          'Context switch: save/restore registers & memory maps; scheduler; cost = cache/TLB.',
          'HTTPS: TLS handshake, cert validate, symmetric session keys, integrity.',
          'IDOR: object-level authz beats obscure IDs.',
        ]),
      ]),
    ],
    commonMistakes: ['Spending 3 minutes per “rapid” question'],
    interviewQuestions: rapid50.slice(0, 20),
    intermediateInterviewQuestions: rapid50.slice(20, 40),
    advancedInterviewQuestions: rapid50.slice(40),
    interviewReadyAnswers: rapid50Answers,
    keyTakeaways: ['Retrieval speed for assessment centres'],
  },
)
