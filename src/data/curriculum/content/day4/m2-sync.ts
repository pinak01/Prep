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

export const d4p5 = createPage(
  'd4-p5',
  'Synchronization Basics',
  16,
  [
    'Define race conditions, critical sections, and atomicity',
    'State mutual exclusion, progress, and bounded waiting',
    'Explain why interrupts and multicore make locks necessary',
    'Contrast locks vs lock-free thinking at a high level',
  ],
  {
    prerequisites: ['d4-p1'],
    sections: [
      section('concept', 'Concept', [
        p(
          'When threads share memory, interleaved reads/writes can produce results that no sequential execution would. A race condition exists when correctness depends on timing. The critical section is the code that touches shared state and must execute as if atomic with respect to other threads’ critical sections for that state.',
        ),
        h3('Why it exists'),
        p(
          'Preemption + multicore store buffers mean “one line of high-level code” is not atomic. Classic example: counter++ is load/add/store. Two threads can both load 0 and both store 1. Synchronization restores safety (and sometimes liveness) properties the hardware does not give you for free.',
        ),
        h3('Requirements for a good mutual-exclusion solution (Peterson-style criteria)'),
        ol([
          'Mutual exclusion: at most one thread in the critical section for a given resource.',
          'Progress: if no one is in the CS and someone wants in, selection cannot be postponed indefinitely by threads outside the CS.',
          'Bounded waiting: a thread waiting to enter cannot be overtaken forever (no unbounded starvation at the lock).',
        ]),
      ]),
      section('how', 'How it works', [
        h3('Building blocks'),
        ul([
          'Atomic instructions: test-and-set, compare-and-swap (CAS), fetch-and-add — hardware primitives.',
          'Memory barriers/fences: control visibility order across cores.',
          'Disabling interrupts: only works for uniprocessor kernel critical sections — insufficient on SMP.',
          'Higher-level: mutex, semaphore, monitor/condition variable, RCU (Linux kernel).',
        ]),
        code(
          'java',
          `// Unsafe: race on balance
class Account {
  private int balance;
  void deposit(int x) { balance += x; } // NOT atomic
}

// Safe: intrinsic lock
class SafeAccount {
  private int balance;
  synchronized void deposit(int x) { balance += x; }
}`,
          'Language locks compile down to OS futexes / atomic ops — same problem, better API',
        ),
        callout(
          'warning',
          '“It works on my laptop” is not proof of race-freedom. Races are Heisenbugs — stress tests and tools (TSAN) matter.',
          'Reality check',
        ),
      ]),
      section('example', 'Worked example', [
        example('Lost update race', [
          p(
            'Shared balance=100. T1 deposits 20; T2 deposits 30. Expected 150. Without sync, both load 100; T1 stores 120; T2 stores 130 — lost update. Critical section is the read-modify-write of balance.',
          ),
        ]),
        diagram(
          `sequenceDiagram
    participant T1
    participant Mem as balance
    participant T2
    T1->>Mem: read 100
    T2->>Mem: read 100
    T1->>Mem: write 120
    T2->>Mem: write 130
    Note over Mem: Lost update — 20 vanished`,
          'Interleaving that breaks deposit correctness',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Coarse locks: simple, low concurrency (big critical sections).',
          'Fine locks: more parallelism, deadlock/complexity risk.',
          'Busy-waiting (spinlocks): low latency if hold time ≪ context-switch cost; burns CPU if long.',
          'Blocking locks: efficient for long critical sections; wakeup cost.',
          'Too much sync → serialization; too little → races/corruption.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Blocking on a lock is a Running→Waiting transition (p2).',
          'Deadlocks (p7) are liveness failures of lock protocols.',
          'CPU caches + memory models make “just use volatile” insufficient for mutual exclusion.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "A race is when shared mutable state is accessed without adequate synchronization."'),
        p('Interviewer: "How do you fix it?"'),
        p(
          'Strong answer: "Identify the critical section and enforce mutual exclusion with a mutex/atomic, or redesign to eliminate sharing (message passing, immutability, thread confinement)."',
        ),
        p('Interviewer: "Always use a lock?"'),
        p(
          'Strong answer: "No. Prefer confinement or immutable data. For hot counters, atomics/CAS. Locks when you need multi-word consistency."',
        ),
      ]),
    ],
    commonMistakes: [
      'Thinking synchronized methods make the whole object universally thread-safe for all operation combinations.',
      'Using a boolean flag without atomics/volatiles as a lock.',
      'Confusing data race (memory model) with general race condition (logic timing).',
      'Assuming single-threaded appearance of async callbacks means no concurrency issues.',
    ],
    interviewQuestions: [
      'What is a race condition?',
      'What is a critical section?',
      'Name the three requirements for mutual exclusion solutions.',
      'Why is incrementing a shared integer not atomic?',
      'What is busy waiting?',
    ],
    intermediateInterviewQuestions: [
      'When would you choose a spinlock over a blocking mutex?',
      'What is memory visibility and why do locks provide it?',
      'Explain check-then-act races (e.g., TOCTOU).',
      'How does ThreadSanitizer help?',
      'Difference between deadlock, livelock, and starvation?',
    ],
    advancedInterviewQuestions: [
      'Sketch Peterson’s algorithm and its limitations on modern hardware.',
      'What does compare-and-swap buy you for lock-free structures?',
      'Explain acquire/release semantics briefly.',
      'How do false sharing and cache lines interact with locks?',
      'Why is “double-checked locking” historically tricky in Java/C++?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain race conditions and critical sections.',
        answer:
          'A race condition means the correctness of shared-state updates depends on unpredictable interleaving. The critical section is the minimal code that must appear atomic relative to other threads touching the same state. We enforce mutual exclusion with locks or atomics because CPUs can interleave or parallelize read-modify-write sequences. Trade-offs: locking adds latency and deadlock risk; finer locks raise concurrency but complexity. Strong answers also mention progress and bounded waiting, not only exclusion.',
      },
    ],
    keyTakeaways: [
      'Shared + mutable + concurrent ⇒ need a synchronization story.',
      'Critical section size is a performance/correctness dial.',
      'Hardware atomics underpin software locks.',
      'Safety (mutex) and liveness (no deadlock/starvation) are separate goals.',
    ],
  },
)

export const d4p6 = createPage(
  'd4-p6',
  'Mutex, Semaphore & Monitors',
  18,
  [
    'Contrast mutex vs binary semaphore vs counting semaphore',
    'Solve classic semaphore patterns (producer-consumer mental model)',
    'Explain monitors and condition variables (wait/notify)',
    'Map Java synchronized / pthread APIs to these concepts',
  ],
  {
    prerequisites: ['d4-p5'],
    sections: [
      section('concept', 'Concept', [
        p(
          'A mutex (mutual exclusion lock) is owned by at most one thread; typically only the owner may unlock. A semaphore is an integer counter with wait(P/down) and signal(V/up): wait waits until count > 0 then decrements; signal increments and wakes a waiter. A binary semaphore’s count is 0/1 — similar to a mutex but historically without ownership semantics. A counting semaphore controls N identical resources or a buffer of size N.',
        ),
        h3('Monitors'),
        p(
          'A monitor packages shared data + operations with implicit mutual exclusion; condition variables let threads wait for predicates (wait releases the monitor lock; signal/notify wakes waiters). Java’s synchronized + wait/notify is a monitor-style API; C’s pthread_cond_* is explicit.',
        ),
        table(
          ['Primitive', 'Ownership?', 'Main use'],
          [
            ['Mutex', 'Yes (usually)', 'Protect critical sections'],
            ['Binary semaphore', 'No', 'Signaling / lock-like exclusion'],
            ['Counting semaphore', 'No', 'Resource pools, bounded buffers'],
            ['Condition variable', 'Used with mutex', 'Wait for a predicate'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Producer–consumer (bounded buffer)'),
        ul([
          'mutex: protect buffer structure',
          'sem empty = N: slots free',
          'sem full = 0: items available',
          'Producer: wait(empty), lock, insert, unlock, signal(full)',
          'Consumer: wait(full), lock, remove, unlock, signal(empty)',
        ]),
        code(
          'c',
          `// Pseudocode — interview sketch
sem empty = N, full = 0;
mutex m;

void produce(item x) {
  wait(empty);
  lock(m);
  buf[in++] = x;
  unlock(m);
  signal(full);
}

void consume() {
  wait(full);
  lock(m);
  item x = buf[out++];
  unlock(m);
  signal(empty);
}`,
          'Order matters: waiting on empty/full outside the mutex avoids deadlock',
        ),
        h3('Condition variables — always loop'),
        code(
          'java',
          `synchronized (lock) {
  while (!condition) {  // while, not if — spurious wakeups / stolen signal
    lock.wait();
  }
  // condition holds
}`,
          'Canonical monitor pattern',
        ),
        callout(
          'tip',
          'Interview distinction: mutex is for exclusion; condition variable is for waiting until state changes. Semaphores can do both but with less structure — easier to misuse.',
          'API design',
        ),
      ]),
      section('example', 'Worked example', [
        example('Readers–writers (high level)', [
          p(
            'Many readers OR one writer. Semaphore/mutex patterns track active readers and a write lock. Trade-off: reader-preference can starve writers; writer-preference can starve readers. Real systems (Linux rwlock) choose policies explicitly.',
          ),
        ]),
        code(
          'bash',
          `# Linux: see futex waits (mutex under the hood often uses futex)
# Example investigation — process stuck?
ps -eo pid,wchan:25,cmd | grep -i futex | head`,
          'Blocked mutexes often show up as futex wait channels',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Mutex ownership helps catch unlock bugs; semaphores allow asymmetric signal (useful for interrupt handlers / rendezvous).',
          'Semaphore as mutex: possible, but lose ownership diagnostics.',
          'notify vs notifyAll: single waiter structure vs broadcast when multiple predicates share a CV.',
          'Priority inheritance on mutexes mitigates inversion; not all semaphore implementations do this.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Mutex excludes; semaphore counts; CV waits for conditions."'),
        p('Interviewer: "Can a binary semaphore replace a mutex?"'),
        p(
          'Strong answer: "For exclusion, often yes, but you lose ownership: any thread could V(), which is either a bug or a feature (signaling). Prefer mutex for lock/unlock pairs."',
        ),
        p('Interviewer: "How is a mutex implemented?"'),
        p(
          'Strong answer: "Uncontended path: atomic CAS. Contended: park on a futex/wait queue so the OS deschedules waiters instead of spinning forever — hybrid spin-then-block is common."',
        ),
      ]),
    ],
    commonMistakes: [
      'Using if (!cond) wait instead of while.',
      'Locking order: waiting on a semaphore while holding a mutex that the signaler needs.',
      'Calling wait() without holding the associated mutex.',
      'Saying monitors are obsolete — they live on in language runtimes.',
    ],
    interviewQuestions: [
      'Difference between mutex and semaphore?',
      'What is a counting semaphore used for?',
      'What is a monitor?',
      'Why use a condition variable instead of busy-waiting on a flag?',
      'Explain producer-consumer synchronization needs.',
    ],
    intermediateInterviewQuestions: [
      'Why should condition waits use a while loop?',
      'Binary semaphore vs mutex ownership.',
      'How do pthread_mutex and futex relate?',
      'Outline readers–writers lock behavior.',
      'What is a recursive mutex and when is it a smell?',
    ],
    advancedInterviewQuestions: [
      'Implement a barrier with semaphores.',
      'Explain Mesa vs Hoare semantics for signal.',
      'How does Java ReentrantLock + Condition differ from synchronized?',
      'Design a bounded buffer without counting semaphores (only mutex+CV).',
      'What is RCU and when does it beat reader-writer locks?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Mutex vs semaphore vs monitor?',
        answer:
          'A mutex serializes access and is owned by the locker. A semaphore is a counter for signaling or limiting N resources; a binary semaphore can imitate a lock without ownership. A monitor wraps data with automatic exclusion and condition variables for waiting on predicates. In practice: mutex/CV for structured shared-state code; semaphores for resource counts and classic textbook patterns. Trade-off: semaphores are powerful but easier to get wrong; monitors push you toward clearer invariants.',
      },
    ],
    keyTakeaways: [
      'Match the primitive to the problem: exclusion vs counting vs waiting-for-predicate.',
      'Producer–consumer is the must-know semaphore pattern.',
      'Always while-wait on conditions.',
      'Under the hood, contended locks sleep via OS wait queues/futexes.',
    ],
  },
)

export const d4p7 = createPage(
  'd4-p7',
  'Deadlocks: Conditions & Handling',
  18,
  [
    'State and apply the four Coffman conditions',
    'Contrast prevention, avoidance, detection+recovery, and ostrich approach',
    'Draw and read a resource-allocation graph for single-instance resources',
    'Discuss deadlock vs livelock vs starvation with examples',
  ],
  {
    prerequisites: ['d4-p6'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Deadlock: a set of processes is waiting forever for resources held by others in the set. Coffman’s four conditions (all necessary):',
        ),
        ol([
          'Mutual exclusion: resources not shareable.',
          'Hold and wait: hold at least one resource while waiting for another.',
          'No preemption: resources cannot be forcibly taken.',
          'Circular wait: cyclic chain of waits.',
        ]),
        diagram(
          `flowchart LR
  P1 -->|holds| R1
  P2 -->|holds| R2
  P1 -->|waits for| R2
  P2 -->|waits for| R1`,
          'Classic two-process deadlock cycle',
        ),
      ]),
      section('how', 'How it works', [
        h3('Handling strategies'),
        table(
          ['Strategy', 'Idea', 'Cost'],
          [
            [
              'Prevention',
              'Break a Coffman condition (e.g., total lock order ⇒ no circular wait)',
              'Design discipline; may hurt concurrency',
            ],
            [
              'Avoidance',
              'Only grant requests that keep system in safe state (Banker\'s)',
              'Needs max-claim info; runtime checks',
            ],
            [
              'Detection + recovery',
              'Allow deadlock; find cycles; abort/rollback victims',
              'Detection CPU; recovery waste',
            ],
            [
              'Ignore (ostrich)',
              'Assume rare; reboot/restart jobs',
              'Used widely when cost of prevention > cost of rare deadlock',
            ],
          ],
        ),
        h3('Prevention tactics (interview list)'),
        ul([
          'Acquire all locks up front (breaks hold-and-wait) — low concurrency, risk of over-locking.',
          'Impose global lock ordering (breaks circular wait) — industry standard for multi-lock code.',
          'Try-lock with backoff / ordered trylock loops — can livelock if naive.',
          'Timeout locks — detect suspected deadlock; careful with correctness.',
        ]),
        callout(
          'info',
          'Most application code prevents deadlocks with lock ordering and short critical sections. Kernels/DBs may mix detection and careful design. Pure Banker’s is rare in general-purpose OS.',
          'Practice',
        ),
      ]),
      section('example', 'Worked example', [
        example('Resource allocation graph', [
          p(
            'Single-instance resources: a cycle ⇔ deadlock. Multi-instance: cycle is necessary but not sufficient — need claim/allocation matrices (Banker\'s / deadlock detection algorithms).',
          ),
        ]),
        code(
          'java',
          `// Deadlock-prone
synchronized (a) {
  synchronized (b) { /* ... */ }
}
// Other thread: synchronized(b) { synchronized(a) { ... } }

// Prevention: both always lock a then b
synchronized (a) {
  synchronized (b) { /* ... */ }
}`,
          'Global order a→b breaks circular wait',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Livelock: processes keep changing state in response to each other but make no progress (two people sidestepping in a hallway).',
          'Starvation: one process waits indefinitely while others proceed — not necessarily a cycle.',
          'Distributed deadlocks need waits-for graphs across nodes — harder.',
          'DB transactions: detection via waits-for + victim abort is common.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Deadlock needs all four Coffman conditions."'),
        p('Interviewer: "Which do you break in practice?"'),
        p(
          'Strong answer: "Usually circular wait via a global lock order. Sometimes hold-and-wait by acquiring everything first. Preempting locks is hard for mutexes holding invariants."',
        ),
        p('Interviewer: "Why not Banker\'s everywhere?"'),
        p(
          'Strong answer: "Processes rarely know max resource needs a priori; the algorithm is conservative and expensive for fine-grained dynamic locking."',
        ),
      ]),
    ],
    commonMistakes: [
      'Listing only circular wait as the definition (it’s one condition).',
      'Confusing deadlock with a slow lock under load.',
      'Claiming any cycle with multi-instance resources is deadlock.',
      'Saying the ostrich approach is “wrong” — it’s an engineering trade-off.',
    ],
    interviewQuestions: [
      'What are the four Coffman conditions?',
      'How can you prevent circular wait?',
      'Difference between deadlock prevention and avoidance?',
      'Deadlock vs starvation?',
      'What is a resource-allocation graph?',
    ],
    intermediateInterviewQuestions: [
      'How do databases typically handle deadlock?',
      'Give a real code deadlock example and fix.',
      'What is livelock?',
      'How does lock timeout relate to recovery?',
      'Why is preempting a mutex difficult?',
    ],
    advancedInterviewQuestions: [
      'Describe deadlock detection with a wait-for graph.',
      'How do wait cycles work in distributed systems?',
      'Trade-offs of victim selection heuristics?',
      'How do lock-free algorithms avoid deadlock?',
      'Explain priority inversion vs deadlock.',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you handle deadlocks?',
        answer:
          'First ensure all four Coffman conditions are understood. In app code I prevent deadlocks—especially circular wait—with a strict global lock order and small critical sections. Avoidance like Banker’s needs max claims and is uncommon for mutexes. Systems that can’t prevent cheaply may detect cycles in a waits-for graph and abort a victim, or deliberately ignore rare deadlocks when recovery is restart. Trade-off: prevention reduces concurrency or adds discipline; detection wastes work on abort; ignoring risks rare outages.',
      },
    ],
    keyTakeaways: [
      'Four Coffman conditions — memorize and apply.',
      'Prevention via lock ordering is the bread-and-butter answer.',
      'Avoidance ≠ prevention; Banker’s is avoidance.',
      'Distinguish deadlock / livelock / starvation cleanly.',
    ],
  },
)

export const d4p8 = createPage(
  'd4-p8',
  "Banker's Algorithm",
  20,
  [
    'Define Allocation, Max, Need, and Available matrices',
    'Run the safety algorithm and a resource-request check end-to-end',
    'Explain safe vs unsafe vs deadlocked states',
    'Argue limitations of Banker’s in real systems',
  ],
  {
    prerequisites: ['d4-p7'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Banker’s algorithm (Dijkstra) is deadlock avoidance for multiple resource types. Each process declares a maximum claim. The system grants a request only if the resulting state is safe: there exists an order to satisfy all max claims without getting stuck.',
        ),
        ul([
          'Allocation[i][j]: process i holds of resource j',
          'Max[i][j]: max claim',
          'Need[i][j] = Max − Allocation',
          'Available[j]: free instances of j',
        ]),
        callout(
          'tip',
          'Unsafe ≠ currently deadlocked. Unsafe means you might deadlock if processes claim the rest of their Need. Safe ⇒ can avoid deadlock with careful future grants.',
          'Vocabulary',
        ),
      ]),
      section('how', 'How it works', [
        h3('Safety algorithm'),
        ol([
          'Work = Available; Finish[i]=false for all i',
          'Find i with Finish[i]=false and Need[i] ≤ Work',
          'If found: Work += Allocation[i]; Finish[i]=true; record i in safe sequence; repeat',
          'If all Finish true → safe; else unsafe',
        ]),
        h3('Request algorithm'),
        ol([
          'If Request > Need → error (exceeds claim)',
          'If Request > Available → wait',
          'Tentatively allocate: Available-=Req; Allocation+=Req; Need-=Req',
          'Run safety; if safe keep; else rollback and wait',
        ]),
      ]),
      section('example', 'Worked example', [
        numerical({
          title: "Banker's safety check (full numerical)",
          problem:
            '3 resource types A B C with total instances 10, 5, 7. Processes P0–P4 with Allocation and Max given below. Available currently (3,3,2). Is the state safe? If yes, give a safe sequence.',
          given:
            'Allocation:\nP0 (0,1,0)\nP1 (2,0,0)\nP2 (3,0,2)\nP3 (2,1,1)\nP4 (0,0,2)\nMax:\nP0 (7,5,3)\nP1 (3,2,2)\nP2 (9,0,2)\nP3 (2,2,2)\nP4 (4,3,3)\nAvailable=(3,3,2)',
          formula: 'Need=Max−Allocation; safety: find Need≤Work, then Work+=Allocation',
          steps:
            'Need:\nP0 (7,4,3)\nP1 (1,2,2)\nP2 (6,0,0)\nP3 (0,1,1)\nP4 (4,3,1)\nWork=(3,3,2)\nP1 Need(1,2,2)≤Work → Work=(3,3,2)+(2,0,0)=(5,3,2)\nP3 Need(0,1,1)≤Work → Work=(5,3,2)+(2,1,1)=(7,4,3)\nP4 Need(4,3,1)≤Work → Work=(7,4,3)+(0,0,2)=(7,4,5)\nP0 Need(7,4,3)≤Work → Work=(7,4,5)+(0,1,0)=(7,5,5)\nP2 Need(6,0,0)≤Work → Work=(7,5,5)+(3,0,2)=(10,5,7)\nAll finished. Safe sequence e.g. ⟨P1,P3,P4,P0,P2⟩ (other orders possible if multiple eligible).',
          answer: 'Safe; one safe sequence is P1 → P3 → P4 → P0 → P2',
          shortcut: 'Always recompute Need first; at each step list who is eligible to avoid missing a candidate.',
          mistake: 'Adding Max to Work instead of Allocation when a process “finishes”.',
        }),
        numerical({
          title: 'Request check',
          problem:
            'From the safe state above, P1 requests (1,0,2). Can it be granted immediately?',
          given: 'Request P1=(1,0,2); Available=(3,3,2); Need_P1=(1,2,2)',
          formula: 'Request≤Need and Request≤Available, then safety on tentative state',
          steps:
            'Request(1,0,2)≤Need(1,2,2) OK\nRequest≤Available(3,3,2) OK\nTentative: Available=(2,3,0); Alloc_P1=(3,0,2); Need_P1=(0,2,0)\nRun safety from here (standard textbook result): still safe with sequence e.g. ⟨P1,P3,P4,P0,P2⟩\nGrant.',
          answer: 'Yes — grant the request; system remains safe',
          shortcut: 'If Request > Available, deny without running full safety.',
          mistake: 'Granting because Available looks “large” without running the safety algorithm.',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Requires a priori Max claims — unrealistic for many apps.',
          'Conservative: may deny requests that would not actually deadlock.',
          'O(n²m) style checks — OK for teaching, heavy for fine-grained OS locking.',
          'Still foundational for interviews and for understanding “safe state”.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Banker\'s only grants requests that leave a safe state."'),
        p('Interviewer: "How do you show safety?"'),
        p(
          'Strong answer: "Simulate worst-case claims: repeatedly pick a process whose Need fits in Work, then release its Allocation into Work. If all can finish, safe."',
        ),
        p('Interviewer: "Complexity / practicality?"'),
        p(
          'Strong answer: "Polynomial but needs Max matrices; real OS mutexes don’t declare Max, so we use prevention/detection instead."',
        ),
      ]),
    ],
    commonMistakes: [
      'Confusing Available totals with Work after releases.',
      'Using Max instead of Allocation when releasing in the safety sim.',
      'Equating unsafe with deadlock.',
      'Forgetting Need = Max − Allocation before starting.',
    ],
    interviewQuestions: [
      'What is a safe state?',
      'Define Need in Banker’s algorithm.',
      'Outline the safety algorithm.',
      'What information must processes declare?',
      'Unsafe vs deadlock?',
    ],
    intermediateInterviewQuestions: [
      'Walk through a full safety check on a 3-resource instance.',
      'How does the request algorithm use safety?',
      'Why is Banker’s conservative?',
      'Single-instance resources: how does this relate to RAG cycles?',
      'What happens if Max is overstated?',
    ],
    advancedInterviewQuestions: [
      'Derive time complexity in terms of n processes and m resource types.',
      'How would you adapt avoidance for multiple instances with claims changing?',
      'Compare Banker’s to deadlock detection matrices.',
      'Why don’t general-purpose kernels run Banker’s for mutexes?',
      'Discuss claim/ceiling protocols in RT systems as related ideas.',
    ],
    interviewReadyAnswers: [
      {
        question: "Explain Banker's algorithm with the safety check.",
        answer:
          'Banker’s avoids deadlock by tracking Allocation, Max, Need=Max−Allocation, and Available. A state is safe if we can order processes so each one’s remaining Need can be satisfied with current free resources plus what finished processes release. On a request, we tentatively allocate and run that safety simulation; only commit if still safe. Trade-off: needs a priori max claims and may refuse safe-in-practice requests. Great interview algorithm; rare as a literal OS mutex policy.',
      },
    ],
    keyTakeaways: [
      'Need = Max − Allocation; Available is free pool.',
      'Safety simulation finds a safe sequence or declares unsafe.',
      'Request path = tentative allocate + safety + maybe rollback.',
      'Safe ⊃ deadlock-free under max-claim assumptions; unsafe is a warning, not a corpse.',
    ],
  },
)
