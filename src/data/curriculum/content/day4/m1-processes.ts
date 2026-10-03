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

export const d4p1 = createPage(
  'd4-p1',
  'Processes, Threads & PCB',
  18,
  [
    'Define a process vs a thread and what each owns',
    'List PCB fields and why the OS needs them',
    'Contrast user-level vs kernel-level threads and hybrid models',
    'Explain fork/exec and shared vs private resources after fork',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'A process is an instance of a running program: the OS’s unit of resource ownership and isolation. It owns a private virtual address space, open file descriptors, credentials, signal handlers, and accounting info. A thread is the unit of CPU scheduling inside a process: it owns a register set, stack, and thread-local state, but shares the process’s address space and most resources with sibling threads.',
        ),
        h3('Why it exists'),
        p(
          'Multiprogramming needs isolation (one buggy app must not corrupt another) and concurrency (overlap I/O with compute; use multiple cores). Processes give isolation. Threads give cheaper concurrency when workers genuinely share data and file handles. Without both abstractions, you either over-isolate (fork everything → expensive) or under-isolate (all code in one address space → fragile).',
        ),
        h3('Process Control Block (PCB)'),
        p(
          'The PCB (task_struct in Linux) is the kernel’s dossier for a process/thread. On every context switch and syscall path, the kernel reads/writes this structure. Typical contents:',
        ),
        ul([
          'Identity: PID, PPID, UID/GID, process group, session',
          'CPU state: saved registers, program counter, stack pointer, CPU flags',
          'Scheduling: priority, nice, policy (CFS/RT), runtime stats, CPU affinity',
          'Memory: pointers to page tables / mm_struct, heap/stack bounds',
          'I/O: open file table, cwd, umask, tty',
          'Signals: pending/blocked masks, handlers',
          'Accounting: CPU time, start time, rlimits',
        ]),
        callout(
          'tip',
          'In interviews, say “PCB” for the abstract concept and mention Linux’s task_struct / mm_struct when asked for a real OS.',
          'Interview tip',
        ),
        diagram(
          `flowchart TB
  subgraph Process["Process (resource owner)"]
    AS["Virtual address space<br/>code · data · heap · stacks"]
    OFD["Open files · cwd · credentials"]
    T1["Thread 1<br/>regs + stack"]
    T2["Thread 2<br/>regs + stack"]
    T3["Thread 3<br/>regs + stack"]
  end
  PCB["PCB / task_struct<br/>sched · mm · files · signals"]
  T1 --> AS
  T2 --> AS
  T3 --> AS
  T1 --> OFD
  T2 --> OFD
  T3 --> OFD
  PCB -.-> Process`,
          'Process owns resources; threads share them and each has its own stack/registers',
        ),
      ]),
      section('how', 'How it works', [
        h3('Address space layout (typical userspace)'),
        ul([
          'Text (code): read-only executable pages',
          'Data / BSS: globals and zero-initialized statics',
          'Heap: grows via brk/mmap; shared by all threads',
          'Memory mappings: shared libs, file-backed mmap',
          'Stacks: one per thread, grow toward lower addresses (on most ABIs)',
        ]),
        h3('User threads vs kernel threads'),
        table(
          ['Model', 'Who schedules?', 'Pros', 'Cons'],
          [
            [
              'User-level (N:1)',
              'Library in userspace',
              'Fast switch; portable',
              'One blocking syscall blocks all; no true parallelism',
            ],
            [
              'Kernel-level (1:1)',
              'Kernel',
              'True multicore; blocking is per-thread',
              'Heavier create/switch; more kernel bookkeeping',
            ],
            [
              'Hybrid (M:N)',
              'Both',
              'Can combine benefits',
              'Complex; many OSes moved to 1:1 (Linux NPTL)',
            ],
          ],
          'Linux today is effectively 1:1: every pthread is a schedulable task_struct',
        ),
        h3('fork and exec'),
        p(
          'fork() clones the calling process. The child gets a new PID and a copy-on-write (COW) view of the parent’s memory. File descriptors are duplicated (same open file description → shared offset). After fork, execve() overlays a new program image: address space is replaced, but open FDs (unless O_CLOEXEC), PID, and some credentials persist. Threads: only the calling thread is duplicated in the child; others vanish — a classic footgun.',
        ),
        code(
          'bash',
          `# See process tree and threads
ps -efH | head -40
ps -eLf | head -20          # -L shows threads (LWP)
cat /proc/self/status | egrep 'Name|Pid|PPid|Threads|Vm'`,
          'procfs exposes PCB-ish fields the kernel tracks for your process',
        ),
      ]),
      section('example', 'Worked example', [
        example('Interview sketch: one process, three threads', [
          p(
            'A web server process listens on :8080. Thread A accepts connections; threads B and C handle requests. All three share the listening socket FD and an in-memory cache (heap). Each has its own stack for call frames and locals. If B corrupts a shared cache pointer without synchronization, C can crash — isolation is between processes, not threads.',
          ),
          p(
            'Contrast: three processes each with their own heap would need shared memory or IPC to share the cache, but a wild write in one process cannot silently corrupt another’s private heap.',
          ),
        ]),
        code(
          'bash',
          `# Minimal fork mental model
python3 - <<'PY'
import os, time
pid = os.fork()
if pid == 0:
    print("child", os.getpid(), "parent", os.getppid())
    os._exit(0)
else:
    print("parent", os.getpid(), "child", pid)
    os.wait()
PY`,
          'fork returns 0 in child and child PID in parent — classic interview fact',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Threads are cheaper to create/switch than processes, but bugs in shared memory are harder to contain.',
          'Processes + IPC scale better for fault isolation (Chrome’s multi-process model).',
          'COW makes fork cheap until either side writes; large dirty heaps make fork expensive (databases often prefer threads or posix_spawn).',
          'Too many threads → stack memory pressure and scheduler overhead; thread pools exist for a reason.',
          'Green threads / async runtimes (Go goroutines, Java virtual threads) multiplex many logical tasks onto fewer kernel threads — interviewers love this comparison.',
        ]),
        callout(
          'warning',
          'Never say “threads are always better than processes.” Ask what you need: isolation vs shared-memory performance.',
          'Trap',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'PCB fields drive context switching (Day 4 p2) and scheduling priority (p3–p4).',
          'Shared address space ⇒ need synchronization (p5–p6).',
          'fork/exec is how shells and supervisors launch programs (Linux debugging, p18).',
          'Virtual memory (p9) is what makes per-process address spaces possible.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "A process owns resources; a thread is a schedulable path of execution that shares those resources."'),
        p('Interviewer: "Why have both?"'),
        p(
          'Strong answer: "Isolation vs concurrency. Processes protect address spaces and credentials. Threads let us overlap work and use multiple cores without paying full process create/IPC costs when sharing is intentional."',
        ),
        p('Interviewer: "What exactly is in the PCB?"'),
        p(
          'Strong answer: "Identity, saved CPU state, scheduling params, memory descriptors, open files, signals, accounting. Enough for the kernel to pause, resume, and police the task."',
        ),
        p('Interviewer: "How does Linux implement threads?"'),
        p(
          'Strong answer: "1:1. clone() with shared VM/files creates a thread; each has a task_struct. pthread APIs sit on top of that."',
        ),
        p('Interviewer: "Trade-off of many threads?"'),
        p(
          'Strong answer: "Stack RAM, cache churn, lock contention, and scheduler overhead. Prefer pools, async I/O, or more processes when isolation matters."',
        ),
      ]),
    ],
    commonMistakes: [
      'Saying threads have their own address space (they do not).',
      'Confusing “kernel thread” with “kernel-mode only” — kernel threads are schedulable entities managed by the kernel; user threads run in userspace but may map 1:1 to them.',
      'Forgetting that fork + multithreaded parent is dangerous (only one thread survives in the child).',
      'Listing “stack” as process-private only — each thread has a stack; the heap is shared.',
      'Claiming PCB lives in the process’s userspace heap — it is kernel memory.',
    ],
    interviewQuestions: [
      'What is a process? What is a thread?',
      'What information does a PCB store?',
      'What resources do threads share within a process?',
      'What is the difference between user-level and kernel-level threads?',
      'What does fork() return in the parent and the child?',
    ],
    intermediateInterviewQuestions: [
      'Why is creating a thread usually cheaper than creating a process?',
      'Explain copy-on-write after fork.',
      'What happens to open file descriptors after fork?',
      'When would you choose multi-process over multi-threaded design?',
      'How does a thread pool relate to PCB/scheduling costs?',
    ],
    advancedInterviewQuestions: [
      'How does Linux’s clone() unify fork and pthread_create?',
      'Why are M:N threading models hard, and why did Linux move to 1:1 NPTL?',
      'How do goroutines/virtual threads differ from OS threads?',
      'What is a zombie process and how does it relate to the PCB?',
      'Explain how /proc/<pid> exposes kernel process state to userspace.',
      'What is the difference between a process group, session, and PID namespace?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Process vs thread — explain for an interview.',
        answer:
          'A process is the OS unit of resource ownership: private virtual address space, file table, credentials. A thread is the unit of scheduling inside that process: registers and stack of its own, but shared heap, code, and FDs. We use processes for isolation and fault containment; threads when workers need cheap shared-memory concurrency. The kernel tracks each schedulable task in a PCB (Linux task_struct). Trade-off: threads are lighter but races and one bad pointer can take down the whole process.',
      },
      {
        question: 'What is a PCB and why does the OS need it?',
        answer:
          'The Process Control Block is the kernel’s metadata for a task: identity, saved CPU context, scheduling info, memory maps, open files, signals, limits. On a context switch the kernel saves registers into the PCB/thread stack and loads the next task’s state. Without a PCB the OS could not pause, resume, account for, or securely isolate programs.',
      },
    ],
    keyTakeaways: [
      'Process = isolation + resources; thread = execution context sharing those resources.',
      'PCB/task_struct is the kernel’s source of truth for scheduling and resource control.',
      'Linux threads are 1:1 kernel tasks; user-level-only models lose multicore and block awkwardly.',
      'fork is COW clone; exec replaces the image — foundation of process creation on Unix.',
    ],
  },
)

export const d4p2 = createPage(
  'd4-p2',
  'Process States & Context Switching (what exactly happens)',
  16,
  [
    'Draw and narrate the five-state process model',
    'Explain exactly what a context switch saves/restores and why it costs',
    'Distinguish voluntary vs involuntary switches; interrupt vs syscall paths',
    'Connect wait queues, blocking I/O, and the ready queue',
  ],
  {
    prerequisites: ['d4-p1'],
    sections: [
      section('concept', 'Concept', [
        p(
          'A process (more precisely, a schedulable thread) is always in a well-defined state from the kernel’s point of view. The classic five-state model: New → Ready → Running → Waiting (Blocked) → Terminated, with Ready↔Running transitions driven by the scheduler, and Running→Waiting when the task blocks on I/O, locks, or sleep.',
        ),
        h3('Why states exist'),
        p(
          'CPUs are scarce; I/O is slow. States let the OS keep the CPU busy with Ready tasks while others wait for disk, network, or events — the essence of multiprogramming. Without Waiting, a process stuck on disk would waste the core (old batch systems effectively did this).',
        ),
        diagram(
          `stateDiagram-v2
    [*] --> New
    New --> Ready: admitted
    Ready --> Running: dispatch / schedule
    Running --> Ready: time slice / preempt
    Running --> Waiting: block (I/O, lock, sleep)
    Waiting --> Ready: event completes
    Running --> Terminated: exit / kill
    Terminated --> [*]`,
          'Process lifecycle: Ready↔Running is the hot path; Waiting parks tasks off-CPU',
        ),
      ]),
      section('how', 'How it works', [
        h3('What exactly happens in a context switch'),
        ol([
          'Decision: scheduler picks next task (or idle). Trigger may be timer interrupt (preemption), blocking syscall, wake-up, or yield.',
          'Save outgoing context: general-purpose registers, PC/IP, stack pointer, CPU flags; FPU/SIMD lazily or eagerly depending on OS.',
          'Update PCB/scheduling structures: mark outgoing Ready or Waiting; account runtime; maybe rebalance runqueues.',
          'Switch address space if next task is in another process: load CR3/TTBR (page table root) — TLB shootdown/flush implications.',
          'Restore incoming context: registers/stack; return from interrupt/syscall trampoline into userspace or resume kernel thread.',
          'Memory barriers / cache effects: cold caches and branch predictors make switches more expensive than register moves alone.',
        ]),
        h3('Voluntary vs involuntary'),
        ul([
          'Voluntary: task blocks (read disk, futex wait) or sched_yield — leaves Running for Waiting/Ready.',
          'Involuntary: timer tick or higher-priority wake-up preempts a still-runnable task → Running→Ready.',
        ]),
        h3('Linux view (interview-friendly)'),
        p(
          'Linux uses TASK_RUNNING (on a CPU or runnable), interruptible/uninterruptible sleep for blocked, zombie for exited-but-not-waited, and stopped for job control/signals. “Uninterruptible sleep (D state)” often means waiting on disk — famous in ops interviews.',
        ),
        code(
          'bash',
          `# State letters in ps: R running, S sleep, D disk sleep, Z zombie, T stopped
ps -eo pid,stat,wchan:20,cmd --sort=stat | head -30
# wchan ≈ kernel wait channel (what it's blocked on)`,
          'Map textbook states to live Linux process states',
        ),
      ]),
      section('example', 'Worked example', [
        example('Blocking read → context switch story', [
          p(
            'Thread calls read() on a socket with no data. Syscall enters kernel; no bytes ready → thread is put on a wait queue, state → Waiting, scheduler runs another Ready thread. NIC interrupt later delivers data; kernel copies to buffer, moves thread to Ready. On next schedule, it resumes just after the blocking point with data available. The “context” restored is its registers and stack so user code continues as if read() just returned.',
          ),
        ]),
        callout(
          'info',
          'Context switch ≠ mode switch. User→kernel (syscall/interrupt) can happen without changing the current thread. Context switch changes which thread’s register set is live.',
          'Precision',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Faster switches improve concurrency illusion; too frequent switches destroy cache locality (thrashing the CPU).',
          'Same-process thread switch avoids full MMU switch — cheaper than cross-process switch.',
          'Kernel preemption and interrupt latency matter for RT workloads.',
          'Spurious wakeups and thundering herds: many waiters become Ready when one event fires — design wake-one when possible.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Scheduler policies (p3–p4) decide who leaves Ready for Running.',
          'Blocking on locks (p5–p6) is a Waiting transition — priority inversion can follow.',
          'Page faults (p9) can block a Running task while the page is fetched.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Ready means runnable but not on CPU; Waiting means blocked on an event."'),
        p('Interviewer: "What exactly is saved on a context switch?"'),
        p(
          'Strong answer: "CPU registers, PC, stack pointer, and scheduling metadata in the PCB. If the next task is another process, also the address-space root so the MMU walks the right page tables."',
        ),
        p('Interviewer: "Why is it expensive?"'),
        p(
          'Strong answer: "Not just register moves — direct/indirect costs: cache/TLB pollution, pipeline flush, possible TLB shootdowns across CPUs, and scheduler bookkeeping."',
        ),
        p('Interviewer: "Always switch on every syscall?"'),
        p(
          'Strong answer: "No. Syscalls are mode switches. A context switch happens only if the kernel deschedules the current task."',
        ),
      ]),
    ],
    commonMistakes: [
      'Confusing context switch with mode switch (user↔kernel).',
      'Saying Waiting processes still consume CPU (they should not, except busy-wait bugs).',
      'Forgetting MMU/CR3 switch cost between processes.',
      'Claiming zombies hold the full address space — they mainly retain the exit status in the PCB until reaped.',
    ],
    interviewQuestions: [
      'List the classic process states and legal transitions.',
      'What is a context switch?',
      'When does a process move from Running to Waiting?',
      'What is the difference between preemption and blocking?',
      'What is a zombie process?',
    ],
    intermediateInterviewQuestions: [
      'Walk through a context switch step by step.',
      'Why are thread switches often cheaper than process switches?',
      'What is the ready queue?',
      'Explain interruptible vs uninterruptible sleep on Linux.',
      'How does a timer interrupt cause preemption?',
    ],
    advancedInterviewQuestions: [
      'What is the cost model of a context switch on a multicore NUMA system?',
      'How do wait queues and wakeups interact with the scheduler?',
      'Explain softirq/tasklet vs process context briefly.',
      'How does CFS represent “Ready” tasks?',
      'What happens to state when a SIGSTOP / SIGCONT is delivered?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain context switching and its cost.',
        answer:
          'A context switch is the kernel saving one thread’s CPU state into its PCB and loading another’s so a different task runs. If the next task is in another process, the kernel also switches page tables. Direct cost is register save/restore and scheduler work; indirect cost is cache and TLB misses afterward. Mode switches (syscall/interrupt) are cheaper and do not always change the current thread. Trade-off: more frequent switching improves fairness/latency but hurts throughput via cache thrashing.',
      },
    ],
    keyTakeaways: [
      'States enable multiprogramming: block waiters, run ready work.',
      'Context switch saves/restores thread CPU state; may switch address spaces.',
      'Syscall ≠ context switch; preemption and blocking are different paths off-CPU.',
      'Linux STAT letters map textbook states to production debugging.',
    ],
  },
)

export const d4p3 = createPage(
  'd4-p3',
  'CPU Scheduling: FCFS, SJF, SRTF',
  20,
  [
    'Define arrival, burst, waiting, turnaround, and response time',
    'Work FCFS, SJF (non-preemptive), and SRTF numericals end-to-end',
    'Explain convoy effect and SJF starvation',
    'Argue when each policy is realistic vs theoretical',
  ],
  {
    prerequisites: ['d4-p2'],
    sections: [
      section('concept', 'Concept', [
        p(
          'CPU scheduling chooses which Ready task runs next on a core. Metrics: waiting time (time in Ready), turnaround time (completion − arrival), response time (first run − arrival), throughput (jobs/time), CPU utilization. No single policy optimizes all metrics.',
        ),
        h3('Policies in this page'),
        ul([
          'FCFS / FIFO: run in arrival order; non-preemptive.',
          'SJF: pick shortest CPU burst next; non-preemptive (once started, runs to burst end).',
          'SRTF: preemptive SJF — always run the job with least remaining time.',
        ]),
        callout(
          'tip',
          'SJF is optimal for average waiting time among non-preemptive policies if bursts are known. Real OS cannot know future bursts — they estimate (aging, history).',
          'Theory vs practice',
        ),
      ]),
      section('how', 'How it works', [
        h3('Formulas'),
        ul([
          'Turnaround TAT = Completion − Arrival',
          'Waiting WT = TAT − Burst (for CPU-only jobs with no I/O wait in the model)',
          'Average WT / TAT = mean over all processes',
        ]),
        h3('Convoy effect (FCFS)'),
        p(
          'A long CPU-bound job at the head of the queue forces many short jobs to wait — average WT explodes. Classic argument against pure FCFS for interactive systems.',
        ),
        h3('Starvation (SJF/SRTF)'),
        p(
          'A continuous stream of short jobs can postpone a long job forever. Fix: aging (gradually boost priority / treat as shorter).',
        ),
      ]),
      section('example', 'Worked example', [
        numerical({
          title: 'FCFS waiting & turnaround',
          problem:
            'Processes P1–P4 arrive at time 0 with CPU bursts 5, 3, 8, 6 ms in that order. Compute average waiting and turnaround time under FCFS.',
          given: 'All arrive at t=0; order P1,P2,P3,P4; bursts 5,3,8,6',
          formula: 'WT = start − arrival; TAT = completion − arrival; arrival=0 ⇒ WT=start, TAT=completion',
          steps:
            'Gantt: P1[0–5], P2[5–8], P3[8–16], P4[16–22]\nP1: WT=0, TAT=5\nP2: WT=5, TAT=8\nP3: WT=8, TAT=16\nP4: WT=16, TAT=22\nSum WT=0+5+8+16=29 → avg WT=29/4=7.25\nSum TAT=5+8+16+22=51 → avg TAT=12.75',
          answer: 'Average WT = 7.25 ms; average TAT = 12.75 ms',
          shortcut: 'For all-arrive-at-0 FCFS, WT of Pk = sum of bursts before it.',
          mistake: 'Using SJF order while claiming FCFS, or forgetting TAT includes the burst.',
        }),
        numerical({
          title: 'SJF (non-preemptive)',
          problem:
            'Same four processes, all arrive at 0, bursts 5,3,8,6. Schedule SJF. Find average WT.',
          given: 'Bursts: P1=5, P2=3, P3=8, P4=6; all at t=0',
          formula: 'Always pick shortest remaining job among those that have arrived; non-preemptive',
          steps:
            'Order by burst: P2(3), P1(5), P4(6), P3(8)\nGantt: P2[0–3], P1[3–8], P4[8–14], P3[14–22]\nWT: P2=0, P1=3, P4=8, P3=14 → sum=25 → avg=6.25\n(Compare FCFS avg WT 7.25 — SJF better)',
          answer: 'Average WT = 6.25 ms',
          shortcut: 'All arrive together ⇒ sort by burst ascending.',
          mistake: 'Preempting mid-burst (that would be SRTF, not SJF).',
        }),
        numerical({
          title: 'SRTF with staggered arrivals',
          problem:
            'P1 arrives 0 burst 8; P2 arrives 1 burst 4; P3 arrives 2 burst 9; P4 arrives 3 burst 5. Use SRTF. Find average waiting time.',
          given: 'Arrival/burst: (0,8),(1,4),(2,9),(3,5)',
          formula: 'At every arrival/completion, run job with least remaining time; WT = TAT − burst',
          steps:
            't0–1: only P1, run P1 (rem 7 at t=1)\nt1: P2 arrives rem4 < P1 rem7 → run P2\nt1–3: P2 runs; at t=2 P3 arrives (ignored while shorter P2 runs); at t=3 P4 arrives rem5\nt3: P2 finishes (ran 2 more → total 4). Remaining: P1=7, P3=9, P4=5 → pick P4\nt3–8: P4 runs to completion\nt8: remaining P1=7, P3=9 → P1 runs t8–15\nt15–24: P3 runs\nCompletion: P2=3, P4=8, P1=15, P3=24\nTAT: P1=15-0=15, P2=3-1=2, P3=24-2=22, P4=8-3=5\nWT=TAT−burst: P1=7, P2=-2? → 2-4=-2 impossible — recheck P2: arrived 1, completed 3, TAT=2, WT=2-4=-2 means error in completion.\nRecalculate carefully:\n- 0–1: P1 (P1 rem=7)\n- 1–5: P2 runs fully 4 units, completes at t=5 (not t=3!). At t=2 P3 arrives; at t=3 P4 arrives but P2 still shortest rem.\n- At t=5: rem P1=7, P3=9, P4=5 → P4\n- 5–10: P4 completes at 10\n- 10–17: P1 completes at 17\n- 17–26: P3 completes at 26\nTAT: P1=17, P2=5-1=4, P3=26-2=24, P4=10-3=7\nWT: P1=17-8=9, P2=4-4=0, P3=24-9=15, P4=7-5=2; sum=26; avg=6.5',
          answer: 'Average waiting time = 6.5 ms',
          shortcut: 'Redraw Gantt at every arrival; always compare remaining times, not original bursts.',
          mistake: 'Using original burst instead of remaining time after partial execution of P1.',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'FCFS: simple, fair by arrival, bad average WT with mixed bursts.',
          'SJF/SRTF: great averages, need burst knowledge/estimates; starvation risk.',
          'SRTF has more context switches (preemption on arrivals).',
          'I/O-bound jobs often have short CPU bursts — SJF naturally prefers them, improving overlap.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "SJF minimizes average waiting time when bursts are known."'),
        p('Interviewer: "How?"'),
        p(
          'Strong answer: "Short jobs ahead of long ones reduces how many jobs wait behind a long burst — mathematically optimal among non-preemptive disciplines with known bursts."',
        ),
        p('Interviewer: "Always usable in a real OS?"'),
        p(
          'Strong answer: "No — future burst length is unknown. OS approximates with exponential averaging of past bursts and combines with priority/fairness (e.g., CFS aims at fair CPU time, not pure SJF)."',
        ),
      ]),
    ],
    commonMistakes: [
      'Mixing WT and TAT formulas.',
      'For SRTF, forgetting to preempt when a shorter job arrives.',
      'Assuming all processes arrive at 0 when the problem gives arrival times.',
      'Counting I/O wait as CPU waiting incorrectly in simple CPU-only Gantt charts.',
    ],
    interviewQuestions: [
      'Define waiting time and turnaround time.',
      'Explain FCFS and the convoy effect.',
      'Why is SJF optimal for average waiting time?',
      'How does SRTF differ from SJF?',
      'What is starvation in SJF?',
    ],
    intermediateInterviewQuestions: [
      'Compute average WT for a given FCFS instance.',
      'Compute a full SJF Gantt chart with arrivals.',
      'Show how aging mitigates starvation.',
      'Why do interactive systems dislike pure FCFS?',
      'How would you estimate next CPU burst?',
    ],
    advancedInterviewQuestions: [
      'Prove or intuitively argue SJF’s optimality for average WT.',
      'Compare SRTF vs Round Robin for response time.',
      'How does Linux CFS differ philosophically from SJF?',
      'What happens to these algorithms with multi-level feedback queues?',
      'How do soft real-time constraints change the metric of interest?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Compare FCFS, SJF, and SRTF.',
        answer:
          'FCFS runs in arrival order — simple but suffers convoy effect when long jobs block shorts. SJF always runs the shortest known burst next and minimizes average waiting time among non-preemptive policies, but can starve long jobs and needs burst knowledge. SRTF is preemptive SJF: always run least remaining time, usually even better averages, more switches. Real kernels estimate bursts and add fairness; they rarely run textbook SJF alone.',
      },
    ],
    keyTakeaways: [
      'Memorize WT/TAT definitions; practice Gantt charts until mechanical.',
      'FCFS convoy vs SJF starvation is a classic paired trade-off.',
      'SRTF uses remaining time; re-evaluate at every arrival.',
      'Theory assumes known bursts; production uses estimates + fairness.',
    ],
  },
)

export const d4p4 = createPage(
  'd4-p4',
  'Round Robin & Scheduling Trade-offs',
  18,
  [
    'Simulate Round Robin with a given time quantum',
    'Explain how quantum size affects context-switch overhead vs response time',
    'Compare scheduling goals: fairness, throughput, latency, RT',
    'Outline priority scheduling, MLFQ, and modern CFS at interview level',
  ],
  {
    prerequisites: ['d4-p3'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Round Robin (RR) is preemptive FCFS with a time quantum q. Each Ready job runs at most q time units before being moved to the tail of the Ready queue. Designed for fair, interactive time-sharing.',
        ),
        h3('Why RR exists'),
        p(
          'Pure FCFS is unfair to short/interactive jobs. RR bounds how long you wait for another slice roughly by (n−1)·q, giving better response time.',
        ),
      ]),
      section('how', 'How it works', [
        ul([
          'Ready queue is a FIFO of runnable tasks.',
          'Dispatch head for min(q, remaining_burst).',
          'If still runnable when q expires → preempt, append to tail.',
          'If bursts finish early → switch immediately (no busy waiting for the rest of q).',
        ]),
        h3('Quantum trade-off'),
        ul([
          'q → ∞: RR degenerates to FCFS (few switches, poor interactivity).',
          'q → very small: fair and responsive, but context-switch overhead dominates; effective CPU work collapses.',
          'Rule of thumb: q should be large vs switch cost (e.g., tens of ms historically) but small vs human-perceptible delay.',
        ]),
        h3('Broader scheduling landscape'),
        table(
          ['Approach', 'Idea', 'Watch-outs'],
          [
            ['Priority', 'Always run highest priority', 'Starvation; priority inversion'],
            ['MLFQ', 'Demote CPU hogs; favor interactive', 'Tuning complexity; gaming'],
            ['CFS (Linux)', 'Fair virtual runtime (red-black tree)', 'Not textbook RR; weight by nice'],
            ['Realtime (FIFO/RR)', 'Strict priority classes', 'Can starve non-RT'],
          ],
        ),
      ]),
      section('example', 'Worked example', [
        numerical({
          title: 'Round Robin numerical (q=4)',
          problem:
            'Three processes arrive at 0 with bursts 10, 5, 8. RR with q=4. Find average turnaround and waiting time. Assume order P1,P2,P3 in the initial queue.',
          given: 'Bursts P1=10,P2=5,P3=8; all arrival 0; q=4; ready order P1,P2,P3',
          formula: 'TAT=completion−arrival; WT=TAT−burst',
          steps:
            'Timeline:\n0–4 P1 (rem6)\n4–8 P2 (rem1)\n8–12 P3 (rem4)\n12–16 P1 (rem2)\n16–17 P2 (rem0) completes 17\n17–21 P3 (rem0) completes 21\n21–23 P1 (rem0) completes 23\nTAT: P1=23, P2=17, P3=21; avg=(23+17+21)/3=20.33\nWT: P1=13, P2=12, P3=13; avg=12.67',
          answer: 'Avg TAT ≈ 20.33; avg WT ≈ 12.67 (same time unit as bursts)',
          shortcut: 'Maintain a queue of remaining bursts; always slice at most q.',
          mistake: 'Keeping a finished process in the queue, or not rotating after a full quantum.',
        }),
        numerical({
          title: 'Quantum sensitivity (conceptual numbers)',
          problem:
            'Same jobs bursts 6,6,6 arrive at 0. Compare number of context switches for q=1 vs q=6 (ignore the final switch to idle).',
          given: 'Three equal jobs of 6; RR',
          formula: 'Switches ≈ every time a quantum expires or a job finishes while others remain',
          steps:
            'q=6: each job runs to completion in turn → 2 switches between jobs (P1→P2→P3).\nq=1: jobs interleave 1 unit at a time for 18 units of work → switch almost every unit while ≥2 runnable ≈ 17 switches.\nLesson: tiny q ⇒ many switches.',
          answer: 'q=6 → ~2 inter-job switches; q=1 → ~17 switches',
          shortcut: 'If q ≥ max burst and all arrive together, RR ≡ FCFS.',
          mistake: 'Counting only preemptions and forgetting completion-time switches (interviewers vary — state your assumption).',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'RR improves response time vs FCFS; average WT often worse than SJF.',
          'I/O-bound jobs may voluntarily leave early — naturally get more frequent turns (good for interactivity).',
          'Priority inversion: low-priority holds lock needed by high-priority — need inheritance/ceiling protocols.',
          'Multicore: per-CPU runqueues, load balancing, affinity vs migration costs (cache/NUMA).',
        ]),
        callout(
          'mistake',
          'Do not claim Linux uses textbook Round Robin for normal tasks. Default is CFS; RR exists as a realtime policy (SCHED_RR).',
          'Common misconception',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Context switch cost (p2) sets a floor on useful q.',
          'Synchronization (p5+) interacts with priorities (inversion).',
          'Virtual memory faults add unexpected blocking mid-slice.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "RR shares the CPU in slices for fairness and responsiveness."'),
        p('Interviewer: "How do you choose q?"'),
        p(
          'Strong answer: "Large enough that switch overhead is a small fraction of q; small enough that interactive jobs get the CPU before users notice. Empirically tens of milliseconds was classic; modern CFS uses a different fairness mechanism."',
        ),
        p('Interviewer: "Trade-off vs SJF?"'),
        p(
          'Strong answer: "RR is fairer and better for response time; SJF wins average waiting time but needs predictions and can starve."',
        ),
      ]),
    ],
    commonMistakes: [
      'Forgetting to requeue a process that still has remaining burst after q.',
      'Assuming RR always beats SJF on average waiting time (usually false).',
      'Equating Linux desktop scheduling with textbook RR.',
      'Ignoring that early completion frees the CPU before q ends.',
    ],
    interviewQuestions: [
      'Explain Round Robin scheduling.',
      'What happens if the time quantum is too small? Too large?',
      'Compare RR and FCFS.',
      'What is response time and why does RR help it?',
      'What is priority inversion?',
    ],
    intermediateInterviewQuestions: [
      'Work a full RR Gantt chart for a given q.',
      'Why might RR increase average turnaround vs SJF?',
      'Describe multilevel feedback queue in one minute.',
      'How does nice value affect Linux scheduling?',
      'Difference between SCHED_OTHER, SCHED_FIFO, SCHED_RR?',
    ],
    advancedInterviewQuestions: [
      'Explain CFS virtual runtime and the red-black tree briefly.',
      'How do soft affinity and load balancing interact?',
      'Design a scheduler metric for a latency-sensitive trading gateway.',
      'How do cgroups / cpu.shares interact with fair scheduling?',
      'When is co-scheduling / gang scheduling used?',
    ],
    interviewReadyAnswers: [
      {
        question: 'How does quantum size affect Round Robin?',
        answer:
          'A small quantum makes the system feel fair and responsive because no job hogs the CPU for long, but context-switch overhead and cache pollution rise — throughput falls. A large quantum reduces switches and approaches FCFS, hurting interactive response and recreating convoy effects. Choose q much larger than switch cost but small relative to human-noticeable delay. Modern general-purpose OSes often use fair-share schedulers rather than fixed-q RR for normal tasks.',
      },
    ],
    keyTakeaways: [
      'RR = preemptive fair slicing; quantum is the central knob.',
      'Optimize response vs overhead; RR ≠ optimal average WT.',
      'Know priority, MLFQ, CFS names for “what does Linux actually do?” follow-ups.',
      'Priority inversion is the bridge from scheduling to synchronization.',
    ],
  },
)
