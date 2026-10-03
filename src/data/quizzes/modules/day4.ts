import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from '../helpers'

/** Day 4 module checkpoints — 8 questions each (3 easy / 3 medium / 2 hard). */
export const day4ModuleQuizzes: Record<string, QuizQuestion[]> = {
  // ===== d4-m1 Processes & Scheduling =====
  'd4-m1': [
    q({
      id: 'd4-m1-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Processes'],
      learningObjective: 'Define a process',
      question: 'A process is best described as:',
      options: [
        'A single CPU register only',
        'A program in execution with its own address space and OS-managed state (PCB)',
        'A MAC address',
        'A SQL transaction log',
      ],
      correctAnswer: 1,
      explanation:
        'A process is an instance of a running program: code, data, stack/heap, registers, and kernel bookkeeping in a PCB.',
      whyWrong: {
        '0': 'Registers are part of CPU context, not the whole process.',
        '2': 'Networking L2 identifier.',
        '3': 'Database concept.',
      },
      interviewTakeaway: 'Process = running program + address space + PCB.',
    }),
    tf({
      id: 'd4-m1-q02',
      difficulty: 'easy',
      topics: ['Threads'],
      learningObjective: 'Contrast threads vs processes',
      question:
        'True or False: Threads in the same process typically share the same address space (code/data/heap) while each has its own stack and register context.',
      correct: true,
      explanation:
        'Threads are lighter concurrent units within a process. Sharing memory enables fast communication and requires synchronization.',
      whyWrong: {
        '1': 'False would deny shared-memory threading.',
      },
      interviewTakeaway: 'Threads share address space; stacks are per-thread.',
    }),
    q({
      id: 'd4-m1-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Context Switch'],
      learningObjective: 'Define context switch',
      question: 'A context switch is:',
      options: [
        'Changing Wi‑Fi SSIDs',
        'Saving one thread/process CPU state and loading another’s so the CPU can run a different task',
        'Rewriting a disk partition table',
        'Compiling a kernel module',
      ],
      correctAnswer: 1,
      explanation:
        'The OS saves/restores registers and bookkeeping to multiplex the CPU. Too many switches hurt performance (cache/TLB effects).',
      whyWrong: {
        '0': 'Unrelated networking UX.',
        '2': 'Storage admin task.',
        '3': 'Build step, not scheduling.',
      },
      interviewTakeaway: 'Context switch = save/restore CPU state; it has a cost.',
    }),
    q({
      id: 'd4-m1-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['CPU Scheduling'],
      learningObjective: 'Characterize Round Robin',
      question: 'Round-robin scheduling mainly:',
      options: [
        'Always runs the longest job to completion first',
        'Gives each ready task a time quantum in cyclic order for fairness/responsiveness',
        'Eliminates the need for a ready queue',
        'Only works on single-process systems',
      ],
      correctAnswer: 1,
      explanation:
        'RR rotates runnable tasks with a quantum. Too short ⇒ high switch overhead; too long ⇒ poor interactivity.',
      whyWrong: {
        '0': 'That is closer to LJF/LCFS extremes, not RR.',
        '2': 'RR still uses a ready queue.',
        '3': 'RR is for multiprogramming.',
      },
      interviewTakeaway: 'RR = quantum + cyclic fairness; tune quantum.',
    }),
    q({
      id: 'd4-m1-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['CPU Scheduling'],
      learningObjective: 'Compare SJF and starvation',
      question: 'A risk of strict Shortest Job First (SJF) is:',
      options: [
        'Long jobs may starve if short jobs keep arriving',
        'It cannot reduce average waiting time in theory',
        'It requires no estimates of burst length ever',
        'It forbids preemption in all variants by definition of “SJF”',
      ],
      correctAnswer: 0,
      explanation:
        'SJF optimizes average wait under known bursts but can starve long tasks. Aging or multilevel feedback are practical mitigations. SRTF is the preemptive cousin.',
      whyWrong: {
        '1': 'SJF is optimal for average waiting time under assumptions.',
        '2': 'Needs burst knowledge/estimates.',
        '3': 'SRTF is preemptive SJF-like.',
      },
      interviewTakeaway: 'SJF: great averages, starvation risk — mention aging.',
    }),
    tf({
      id: 'd4-m1-q06',
      difficulty: 'medium',
      topics: ['Processes', 'PCB'],
      learningObjective: 'Name PCB contents',
      question:
        'True or False: A process control block (PCB) typically stores process id, state, CPU registers/program counter, scheduling info, and memory-management info.',
      correct: true,
      explanation:
        'The PCB is the kernel’s record for a process. Exact fields vary by OS, but those categories are standard.',
      whyWrong: {
        '1': 'False omits core PCB responsibilities.',
      },
      interviewTakeaway: 'PCB = kernel dossier for a process.',
    }),
    q({
      id: 'd4-m1-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['CPU Scheduling'],
      learningObjective: 'Explain multilevel feedback queue idea',
      question: 'Multilevel feedback queues (MLFQ) typically:',
      options: [
        'Pin every process to one static priority forever with no demotion',
        'Move jobs between queues based on behavior (e.g., demote CPU hogs) to favor interactive workloads',
        'Disable interrupts permanently',
        'Schedule only kernel threads and never user processes',
      ],
      correctAnswer: 1,
      explanation:
        'MLFQ learns from CPU bursts: interactive jobs stay at higher priority; long CPU-bound jobs sink to lower queues with larger quanta.',
      whyWrong: {
        '0': 'Static priority is not the feedback idea.',
        '2': 'Interrupts remain essential.',
        '3': 'User processes are scheduled too.',
      },
      interviewTakeaway: 'MLFQ = adaptive priorities from observed behavior.',
    }),
    q({
      id: 'd4-m1-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Processes', 'Threads'],
      learningObjective: 'Discuss user-level vs kernel threads',
      question:
        'If a process uses purely user-level threads with no kernel awareness, a blocking syscall by one thread typically:',
      options: [
        'Never blocks anything',
        'Can block the entire process (all user threads) because the kernel schedules the process, not individual user threads',
        'Automatically upgrades to a kernel thread',
        'Converts the process into a zombie',
      ],
      correctAnswer: 1,
      explanation:
        'Classic M:1 user threads share one kernel schedulable entity — one blocking call stalls all. N:1/M:N/kernel threads change that trade-off.',
      whyWrong: {
        '0': 'Blocking still happens at process level.',
        '2': 'Not automatic from a blocking call alone.',
        '3': 'Zombies are exited processes awaiting wait().',
      },
      interviewTakeaway: 'User-level threads: cheap, but blocking/kernel opacity hurts.',
    }),
  ],

  // ===== d4-m2 Synchronization & Deadlocks =====
  'd4-m2': [
    q({
      id: 'd4-m2-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Synchronization', 'Mutex'],
      learningObjective: 'Define mutex purpose',
      question: 'A mutex is used to:',
      options: [
        'Speed up DNS resolution',
        'Ensure mutual exclusion — only one thread holds it and enters a critical section at a time',
        'Allocate IP addresses',
        'Replace the MMU',
      ],
      correctAnswer: 1,
      explanation:
        'Mutexes serialize access to shared data. Unlocking incorrectly or locking in inconsistent order causes bugs/deadlocks.',
      whyWrong: {
        '0': 'Unrelated.',
        '2': 'DHCP territory.',
        '3': 'MMU is hardware memory translation.',
      },
      interviewTakeaway: 'Mutex = exclusive critical section.',
    }),
    tf({
      id: 'd4-m2-q02',
      difficulty: 'easy',
      topics: ['Semaphores'],
      learningObjective: 'Contrast binary vs counting semaphores',
      question:
        'True or False: A binary semaphore has values 0/1 (mutex-like), while a counting semaphore can track a pool of N identical resources.',
      correct: true,
      explanation:
        'Semaphores generalize signaling and resource counts. Mutexes often have ownership semantics that bare semaphores lack.',
      whyWrong: {
        '1': 'False collapses an important distinction.',
      },
      interviewTakeaway: 'Binary ≈ lock/signal; counting ≈ N resources.',
    }),
    q({
      id: 'd4-m2-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Deadlocks'],
      learningObjective: 'List Coffman conditions',
      question: 'Which is one of the four necessary Coffman conditions for deadlock?',
      options: [
        'Preemption of all resources always',
        'Circular wait',
        'Infinite CPU speed',
        'Absence of any shared state',
      ],
      correctAnswer: 1,
      explanation:
        'The four: mutual exclusion, hold-and-wait, no preemption, circular wait. Breaking any one prevents deadlock.',
      whyWrong: {
        '0': 'No-preemption is the condition; forced preemption can prevent deadlock.',
        '2': 'Nonsense.',
        '3': 'Opposite of typical deadlock settings.',
      },
      interviewTakeaway: 'Memorize the four Coffman conditions.',
    }),
    q({
      id: 'd4-m2-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Synchronization'],
      learningObjective: 'Identify race conditions',
      question:
        'Two threads do `x = x + 1` on a shared int without synchronization. The bug class is:',
      options: [
        'A DNS cache miss',
        'A race condition / lost update on shared state',
        'A page table walk failure by definition',
        'An ARP timeout',
      ],
      correctAnswer: 1,
      explanation:
        'Read-modify-write is not atomic. Concurrent updates can lose increments. Fix with locks/atomics.',
      whyWrong: {
        '0': 'Unrelated.',
        '2': 'Not implied.',
        '3': 'Unrelated.',
      },
      interviewTakeaway: 'Shared RMW without sync ⇒ races; use locks/atomics.',
    }),
    q({
      id: 'd4-m2-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Monitors'],
      learningObjective: 'Describe monitors',
      question: 'A monitor (language-level sync construct) typically provides:',
      options: [
        'Open access to all fields with no exclusion',
        'Module encapsulation with implicit mutual exclusion and condition variables for waiting',
        'A replacement for virtual memory',
        'Hardware cache coherence protocols only',
      ],
      correctAnswer: 1,
      explanation:
        'Monitors wrap shared data with automatic exclusion and wait/signal on conditions — Java synchronized methods are related.',
      whyWrong: {
        '0': 'Opposite of monitor intent.',
        '2': 'VM is orthogonal.',
        '3': 'Coherence is hardware; monitors are software abstraction.',
      },
      interviewTakeaway: 'Monitor = mutex + condition variables with encapsulation.',
    }),
    tf({
      id: 'd4-m2-q06',
      difficulty: 'medium',
      topics: ['Deadlocks'],
      learningObjective: 'Name deadlock handling strategies',
      question:
        'True or False: OS/app strategies for deadlock include prevention, avoidance (e.g., Banker’s), detection-and-recovery, and sometimes ostrich (ignore if rare).',
      correct: true,
      explanation:
        "Real systems often use timeouts/watchdogs and careful lock ordering rather than full Banker's algorithm online.",
      whyWrong: {
        '1': 'False omits the standard taxonomy.',
      },
      interviewTakeaway: 'List prevention/avoidance/detection/ignore — then pick pragmatic tactics.',
    }),
    q({
      id: 'd4-m2-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Deadlocks'],
      learningObjective: 'Apply lock ordering prevention',
      question:
        'Two mutexes A and B. Thread 1 locks A then B; Thread 2 locks B then A. This risks deadlock. A prevention approach is:',
      options: [
        'Always acquire locks in a global consistent order (e.g., A before B)',
        'Never unlock any mutex',
        'Disable the scheduler permanently',
        'Use more nested locks without a policy',
      ],
      correctAnswer: 0,
      explanation:
        'Total lock ordering breaks circular wait. Alternatives: try-lock with backoff, lock hierarchies, or fewer locks.',
      whyWrong: {
        '1': 'Worsens hold-and-wait.',
        '2': 'Not a real solution.',
        '3': 'More locks without policy increases risk.',
      },
      interviewTakeaway: 'Deadlock prevention favorite: global lock order.',
    }),
    q({
      id: 'd4-m2-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Semaphores', 'Synchronization'],
      learningObjective: 'Use semaphores for producer-consumer',
      question:
        'In a bounded-buffer producer-consumer, which semaphore roles are classic?',
      options: [
        'Only one mutex and no counting semaphores ever',
        'mutex for buffer exclusion; empty/full counting semaphores for free slots and filled items',
        'A single binary semaphore replacing the buffer',
        'Semaphores that allocate IP addresses',
      ],
      correctAnswer: 1,
      explanation:
        'Classic solution: mutex + empty + full. Producers wait for empty, consumers for full; both take mutex around buffer ops.',
      whyWrong: {
        '0': 'Counting semaphores encode slot/item counts.',
        '2': 'Loses buffer capacity signaling.',
        '3': 'Wrong domain.',
      },
      interviewTakeaway: 'Bounded buffer = mutex + empty + full.',
    }),
  ],

  // ===== d4-m3 Memory & Filesystems =====
  'd4-m3': [
    q({
      id: 'd4-m3-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Virtual Memory'],
      learningObjective: 'Define virtual memory benefit',
      question: 'Virtual memory primarily allows:',
      options: [
        'Processes to use a virtual address space abstracted from physical RAM, with paging/swapping',
        'Removing the need for a CPU',
        'DNS to store page tables',
        'Disabling file permissions',
      ],
      correctAnswer: 0,
      explanation:
        'VA → PA translation via page tables lets processes oversubscribe RAM (with cost), isolate address spaces, and simplify loading.',
      whyWrong: {
        '1': 'Absurd.',
        '2': 'Wrong subsystem.',
        '3': 'Permissions remain important.',
      },
      interviewTakeaway: 'VM = virtual addresses + isolation + paging.',
    }),
    tf({
      id: 'd4-m3-q02',
      difficulty: 'easy',
      topics: ['Paging', 'TLB'],
      learningObjective: 'State TLB role',
      question:
        'True or False: A TLB caches recent virtual-to-physical page translations to avoid walking page tables on every memory access.',
      correct: true,
      explanation:
        'TLB hits make translation fast; misses walk page tables (hardware/software) and refill the TLB.',
      whyWrong: {
        '1': 'False would miss a core performance structure.',
      },
      interviewTakeaway: 'TLB = translation cache; locality matters.',
    }),
    q({
      id: 'd4-m3-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['System Calls'],
      learningObjective: 'Define system call',
      question: 'A system call is:',
      options: [
        'A controlled entry into the kernel to request OS services (e.g., read, write, mmap)',
        'A pure user-space function that can never enter the kernel',
        'A BGP route advertisement',
        'A GPU shader opcode',
      ],
      correctAnswer: 0,
      explanation:
        'Syscalls transition to kernel mode with validation. They are the stable ABI surface for OS services.',
      whyWrong: {
        '1': 'Ordinary library calls may wrap syscalls, but the syscall itself enters the kernel.',
        '2': 'Networking routing protocol.',
        '3': 'Unrelated.',
      },
      interviewTakeaway: 'Syscall = user→kernel service request.',
    }),
    q({
      id: 'd4-m3-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Paging'],
      learningObjective: 'Explain page fault kinds at high level',
      question:
        'A valid page that is not currently resident in RAM typically causes:',
      options: [
        'A major/minor page fault handled by the OS bringing the page in (or mapping it)',
        'Immediate permanent process termination always',
        'An ARP reply',
        'A TCP SYN cookie',
      ],
      correctAnswer: 0,
      explanation:
        'The OS handles demand paging: fetch from disk/swap or map anonymous pages. Protection faults (invalid access) are different and may signal SIGSEGV.',
      whyWrong: {
        '1': 'Not always fatal — demand paging is normal.',
        '2': 'Wrong layer.',
        '3': 'TCP defense mechanism.',
      },
      interviewTakeaway: 'Distinguish demand paging faults vs illegal access faults.',
    }),
    q({
      id: 'd4-m3-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['IPC'],
      learningObjective: 'List common IPC mechanisms',
      question: 'Which set lists common IPC mechanisms?',
      options: [
        'Pipes, sockets, shared memory, message queues, signals',
        'Only HTTP cookies',
        'Only CIDR prefixes',
        'Only B+ tree splits',
      ],
      correctAnswer: 0,
      explanation:
        'Processes communicate via pipes/FIFOs, local/TCP sockets, shm + sync, mq, signals, etc. Trade bandwidth, sync needs, and topology.',
      whyWrong: {
        '1': 'App-layer only, not general IPC catalog.',
        '2': 'Addressing.',
        '3': 'DB indexes.',
      },
      interviewTakeaway: 'Name 4–5 IPC options and when you’d pick each.',
    }),
    tf({
      id: 'd4-m3-q06',
      difficulty: 'medium',
      topics: ['Filesystems'],
      learningObjective: 'Relate files, inodes, and dentries (Unix)',
      question:
        'True or False: On Unix-like systems, a file’s metadata (permissions, size, block pointers) lives in an inode; directory entries map names to inode numbers.',
      correct: true,
      explanation:
        'Multiple hard links can map different names to one inode. Paths are lookups through directories.',
      whyWrong: {
        '1': 'False would confuse name vs inode metadata.',
      },
      interviewTakeaway: 'Name → dentry → inode → data blocks.',
    }),
    q({
      id: 'd4-m3-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Virtual Memory', 'Page Replacement'],
      learningObjective: 'Reason about thrashing',
      question: 'Thrashing occurs when:',
      options: [
        'The working sets of active processes do not fit in RAM, causing excessive paging and collapse of useful work',
        'The TLB is larger than RAM',
        'All processes are CPU-bound with no memory references',
        'Disks are read-only by policy',
      ],
      correctAnswer: 0,
      explanation:
        'Under memory pressure, page fault rate skyrockets and throughput tanks. Mitigations: more RAM, reduce multiprogramming, better locality.',
      whyWrong: {
        '1': 'TLB is a small cache.',
        '2': 'Opposite of memory pressure.',
        '3': 'Unrelated policy.',
      },
      interviewTakeaway: 'Thrashing = working set > RAM ⇒ paging storm.',
    }),
    q({
      id: 'd4-m3-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Segmentation', 'Paging'],
      learningObjective: 'Contrast segmentation and paging',
      question: 'Compared with pure segmentation, paging primarily:',
      options: [
        'Uses fixed-size pages to simplify allocation and reduce external fragmentation (at the cost of internal fragmentation)',
        'Eliminates all translation structures',
        'Makes protection impossible',
        'Requires that virtual addresses equal physical addresses',
      ],
      correctAnswer: 0,
      explanation:
        'Pages are equal-sized frames; segments are variable-sized logical units. Modern OSes often use paged virtual memory (sometimes with segment-like regions).',
      whyWrong: {
        '1': 'Page tables still exist.',
        '2': 'Permission bits remain.',
        '3': 'VA≠PA is the point of translation.',
      },
      interviewTakeaway: 'Paging vs segmentation: fragmentation and address structure trade-offs.',
    }),
  ],

  // ===== d4-m4 Linux Essentials =====
  'd4-m4': [
    q({
      id: 'd4-m4-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Linux Permissions'],
      learningObjective: 'Interpret rwx permission bits',
      question: 'File mode `rw-r-----` (640) means:',
      options: [
        'Owner read/write; group read; others none',
        'Everyone has execute',
        'Only others can write',
        'Sticky bit is set on a directory',
      ],
      correctAnswer: 0,
      explanation:
        'Owner rw-, group r--, others ---. Execute bits are absent for all.',
      whyWrong: {
        '1': 'No execute bits shown.',
        '2': 'Others have no write.',
        '3': 'Sticky bit is a different mode flag (often on /tmp).',
      },
      interviewTakeaway: 'Read permission triples: user/group/other.',
    }),
    tf({
      id: 'd4-m4-q02',
      difficulty: 'easy',
      topics: ['Linux Processes'],
      learningObjective: 'Know ps/top purpose',
      question:
        'True or False: Tools like `ps` and `top`/`htop` help inspect running processes, CPU/memory usage, and process state.',
      correct: true,
      explanation:
        'These are standard observability tools for process health before deeper debugging (strace, perf, logs).',
      whyWrong: {
        '1': 'False would deny basic Linux ops literacy.',
      },
      interviewTakeaway: 'Start process debugging with ps/top, then go deeper.',
    }),
    q({
      id: 'd4-m4-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Linux Filesystem'],
      learningObjective: 'Identify FHS directories',
      question: 'On typical Linux systems, `/etc` primarily holds:',
      options: [
        'User home directories only',
        'System configuration files',
        'Only kernel core dumps',
        'Only temporary browser caches',
      ],
      correctAnswer: 1,
      explanation:
        '`/etc` is for host configuration. Homes are under `/home`; variable data often under `/var`; temp under `/tmp`.',
      whyWrong: {
        '0': 'Homes are `/home` (and `/root`).',
        '2': 'Cores often under `/var/crash` or cwd depending on config.',
        '3': 'Caches are elsewhere.',
      },
      interviewTakeaway: 'Know /etc, /var, /home, /tmp, /proc at a glance.',
    }),
    q({
      id: 'd4-m4-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Linux Text Processing'],
      learningObjective: 'Pick grep/awk/sed roles',
      question:
        'You need lines containing “ERROR” from `app.log`. The most direct common tool is:',
      options: ['grep ERROR app.log', 'chmod ERROR app.log', 'ip route ERROR', 'mkfs ERROR'],
      correctAnswer: 0,
      explanation:
        '`grep` filters lines by pattern. awk/sed handle field processing and stream edits.',
      whyWrong: {
        '1': 'chmod changes permissions.',
        '2': 'ip manipulates networking.',
        '3': 'mkfs makes filesystems — destructive if misused.',
      },
      interviewTakeaway: 'grep to find; awk/sed to transform.',
    }),
    q({
      id: 'd4-m4-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Linux Networking'],
      learningObjective: 'Know ss/netstat and ping roles',
      question:
        'To list listening TCP sockets on a Linux host, a modern common command is:',
      options: ['ss -ltn (or netstat -ltn)', 'chmod -ltn', 'gzip -ltn', 'useradd -ltn'],
      correctAnswer: 0,
      explanation:
        '`ss` replaces much of `netstat` for socket stats. `-l` listening, `-t` TCP, `-n` numeric.',
      whyWrong: {
        '1': 'Permissions tool.',
        '2': 'Compression.',
        '3': 'Account creation.',
      },
      interviewTakeaway: 'ss/netstat for sockets; ip/ping/curl for connectivity checks.',
    }),
    tf({
      id: 'd4-m4-q06',
      difficulty: 'medium',
      topics: ['Linux Permissions'],
      learningObjective: 'Explain setuid carefully (defensive)',
      question:
        'True or False: A setuid executable runs with the file owner’s privileges (often root) — a powerful feature that must be minimized and carefully audited because misuse escalates privilege.',
      correct: true,
      explanation:
        'setuid/setgid are sensitive. Prefer least privilege, capabilities where appropriate, and avoid unnecessary root-owned setuid binaries.',
      whyWrong: {
        '1': 'False understates a critical security mechanism.',
      },
      interviewTakeaway: 'setuid = privilege boundary; treat as high risk.',
    }),
    q({
      id: 'd4-m4-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Linux Debugging'],
      learningObjective: 'Choose strace vs lsof',
      question:
        'A process hangs on I/O and you want to see which syscalls it is blocking in. Which tool fits best?',
      options: [
        'strace (or ltrace for library calls) attached to the process',
        'mkfs on the root filesystem',
        'dd of=/dev/sda unconditionally',
        'rm -rf / without review',
      ],
      correctAnswer: 0,
      explanation:
        '`strace` traces syscalls/signals — excellent for “what is it waiting on?” `lsof` lists open files/sockets; use complementary tools carefully on production.',
      whyWrong: {
        '1': 'Destructive and unrelated.',
        '2': 'Destructive disk write.',
        '3': 'Catastrophic and unrelated.',
      },
      interviewTakeaway: 'Hang debugging: strace/lsof/logs — never “fix” with destructive commands.',
    }),
    q({
      id: 'd4-m4-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Linux Processes', 'Signals'],
      learningObjective: 'Interpret common signals',
      question:
        'Sending SIGTERM to a process typically requests:',
      options: [
        'A polite shutdown the process can handle/cleanup; SIGKILL (9) forces immediate termination and cannot be caught',
        'Filesystem reformatting',
        'Automatic promotion to real-time priority',
        'Disabling ASLR globally',
      ],
      correctAnswer: 0,
      explanation:
        'Operators should prefer SIGTERM/systemd stop for graceful exit; SIGKILL is last resort because finally/cleanup handlers will not run.',
      whyWrong: {
        '1': 'Signals do not format disks.',
        '2': 'Unrelated.',
        '3': 'Unrelated and insecure framing.',
      },
      interviewTakeaway: 'TERM then KILL; know catchable vs not.',
    }),
  ],
}
