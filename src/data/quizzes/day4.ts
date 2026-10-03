import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from './helpers'

/** Day 4 — OS processes/scheduling/sync/VM + Linux permissions/pipes/fork-exec (30 questions) */
export const day4Questions: QuizQuestion[] = [
  // ===== EASY (10) =====
  q({
    id: 'd4-q01',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Processes', 'Threads'],
    learningObjective: 'Distinguish process vs thread ownership',
    question:
      'Which statement best captures the process vs thread split used by modern OSes?',
    options: [
      'A thread owns the address space; processes only own a stack',
      'A process owns resources/isolation (address space, FDs); a thread is the schedulable CPU entity sharing that process',
      'Processes and threads are identical synonyms in every kernel',
      'Threads never share open file descriptors with siblings',
    ],
    correctAnswer: 1,
    explanation:
      'The process is the resource/isolation boundary. Threads share that address space and most FDs; each thread has its own registers and stack and is what the scheduler runs.',
    whyWrong: {
      '0': 'Address space ownership is process-level, not thread-level.',
      '2': 'They are related but not identical abstractions.',
      '3': 'Sibling threads typically share the open file table.',
    },
    interviewTakeaway:
      'Say “process = resources; thread = CPU schedule unit” in one breath.',
  }),
  tf({
    id: 'd4-q02',
    difficulty: 'easy',
    topics: ['PCB', 'Context Switch'],
    learningObjective: 'State what a PCB stores for context switches',
    question:
      'True or False: On a context switch, the kernel saves/restores CPU register state using information kept in the process/thread control block (e.g., Linux task_struct).',
    correct: true,
    explanation:
      'The PCB/task_struct holds saved registers, scheduling metadata, mm pointers, files, signals, etc. Context switch saves outgoing state and loads the next runnable thread’s state from that structure.',
    whyWrong: {
      '1': 'False would deny the primary purpose of the PCB’s CPU-state fields.',
    },
    interviewTakeaway: 'Name PCB fields: regs, PID, mm, files, priority — not just “metadata.”',
  }),
  q({
    id: 'd4-q03',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Scheduling', 'FCFS'],
    learningObjective: 'Recognize the FCFS convoy effect',
    question:
      'Many short interactive jobs sit behind one long CPU-bound job in a pure FCFS ready queue. What is this called?',
    options: [
      'Priority inversion',
      'Convoy effect',
      'Thrashing',
      'Belady’s anomaly',
    ],
    correctAnswer: 1,
    explanation:
      'Convoy effect: a long job at the head forces short jobs to wait, inflating average waiting time — a classic FCFS weakness.',
    whyWrong: {
      '0': 'Priority inversion is lock+priority interaction, not FCFS queueing.',
      '2': 'Thrashing is excessive paging under memory pressure.',
      '3': 'Belady’s anomaly is FIFO page replacement with more frames worsening faults.',
    },
    interviewTakeaway: 'Pair “FCFS → convoy” with “SJF → starvation” as trade-offs.',
  }),
  q({
    id: 'd4-q04',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Synchronization', 'Mutex'],
    learningObjective: 'Define a mutex’s role',
    question:
      'Two threads both execute balance += deposit. Without sync they can lose updates. What does a mutex provide for that critical section?',
    options: [
      'Guaranteed FIFO scheduling of the two threads forever',
      'Mutual exclusion so at most one thread runs the critical section at a time',
      'Automatic deadlock detection by the hardware',
      'Removal of the need for atomic CPU instructions underneath',
    ],
    correctAnswer: 1,
    explanation:
      'A mutex serializes entry to the critical section so the read-modify-write of balance appears atomic w.r.t. other lock holders.',
    whyWrong: {
      '0': 'Mutexes don’t redefine the CPU scheduler’s policy.',
      '2': 'Hardware doesn’t auto-detect lock deadlocks.',
      '3': 'Mutex implementations rely on atomics/futexes; they don’t eliminate them.',
    },
    interviewTakeaway: 'Race = timing-dependent correctness; mutex restores mutual exclusion.',
  }),
  q({
    id: 'd4-q05',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Semaphore'],
    learningObjective: 'Contrast counting semaphore vs binary mutex use',
    question:
      'You have a pool of 5 identical DB connections. Which primitive matches “up to 5 concurrent holders” most directly?',
    options: [
      'A single binary mutex only (no counting)',
      'A counting semaphore initialized to 5',
      'A barrier that waits for 5 threads then frees all forever',
      'Nice value adjustment in the scheduler',
    ],
    correctAnswer: 1,
    explanation:
      'A counting semaphore (or equivalent resource counter) tracks N identical permits. Mutex alone allows only one holder.',
    whyWrong: {
      '0': 'Binary exclusion is too strict for a pool of five.',
      '2': 'Barriers sync phases, not resource counts.',
      '3': 'Nice affects CPU share, not connection permits.',
    },
    interviewTakeaway: 'Mutex = exclusion; counting semaphore = N identical resources.',
  }),
  q({
    id: 'd4-q06',
    type: 'multi',
    difficulty: 'easy',
    topics: ['Deadlocks'],
    learningObjective: 'Recall Coffman conditions',
    question:
      'Which are among the four Coffman conditions required for deadlock? (Select all that apply)',
    options: [
      'Mutual exclusion',
      'Hold and wait',
      'Preemptable resources only (resources can always be forcibly taken)',
      'Circular wait',
    ],
    correctAnswer: [0, 1, 3],
    explanation:
      'Deadlock needs mutual exclusion, hold-and-wait, no preemption, and circular wait. Preemptable resources break the “no preemption” condition.',
    whyWrong: {
      '2': 'No preemption (not forced preemption) is the Coffman condition.',
    },
    interviewTakeaway: 'Break any one Coffman condition to prevent deadlock.',
  }),
  q({
    id: 'd4-q07',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Virtual Memory', 'Paging'],
    learningObjective: 'State why virtual memory exists',
    question: 'What is a primary reason OSes use virtual memory with paging?',
    options: [
      'To make every process share one physical address identically with no translation',
      'To give each process a private virtual address space mapped to frames, enabling isolation and flexible allocation',
      'To eliminate the need for a CPU MMU',
      'To guarantee zero page faults forever',
    ],
    correctAnswer: 1,
    explanation:
      'VM isolates processes, supports sparse layouts, sharing, and overcommit via demand paging — MMU translates VA→PA using page tables.',
    whyWrong: {
      '0': 'Translation and private spaces are the point.',
      '2': 'Paging relies on the MMU.',
      '3': 'Demand paging intentionally faults on first touch / reclaim.',
    },
    interviewTakeaway: 'VM story: isolation + sparse VA + demand paging + protection bits.',
  }),
  q({
    id: 'd4-q08',
    type: 'numerical',
    difficulty: 'easy',
    topics: ['Linux Permissions'],
    learningObjective: 'Compute chmod octal from rwx triads',
    question:
      'You want owner rwx, group r-x, other ---. Enter the three-digit chmod octal (e.g. 755).',
    correctAnswer: '750',
    acceptedAnswers: ['0750'],
    explanation:
      'rwx=7, r-x=5, ---=0 → 750. ls -l shows -rwxr-x---.',
    whyWrong: {
      '570': 'Swapped user and group.',
      '755': 'That gives other r-x as well.',
      '740': 'Group would be r-- not r-x.',
    },
    interviewTakeaway: 'Memorize 4/2/1 and common modes 755, 644, 640, 700.',
  }),
  q({
    id: 'd4-q09',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['fork', 'exec'],
    learningObjective: 'Distinguish fork from exec',
    question: 'In Unix process creation, what does execve primarily do?',
    options: [
      'Duplicate the calling process into a child with a new PID',
      'Replace the current process image with a new program',
      'Wait until a child exits',
      'Create an anonymous pipe between two FDs',
    ],
    correctAnswer: 1,
    explanation:
      'fork creates a child; exec overlays a new program in the current process; wait/waitpid reaps children.',
    whyWrong: {
      '0': 'That is fork (or clone), not exec.',
      '2': 'That is wait/waitpid.',
      '3': 'That is pipe().',
    },
    interviewTakeaway: 'Shell pattern: fork → child exec → parent wait.',
  }),
  tf({
    id: 'd4-q10',
    difficulty: 'easy',
    topics: ['Pipes', 'Linux'],
    learningObjective: 'Describe pipe data flow',
    question:
      'True or False: A Unix anonymous pipe is a unidirectional byte stream between related processes, typically used so one process’s stdout feeds another’s stdin.',
    correct: true,
    explanation:
      'pipe() yields a read end and write end. Shells wire cmd1 | cmd2 that way. Data is a byte stream (not message-framed by default).',
    whyWrong: {
      '1': 'False contradicts the standard pipe model used by shells.',
    },
    interviewTakeaway: 'Pipes = related processes + byte stream; sockets for broader IPC.',
  }),

  // ===== MEDIUM (10) =====
  q({
    id: 'd4-q11',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Scheduling', 'FCFS'],
    learningObjective: 'Compute FCFS average waiting time',
    question:
      'P1–P4 all arrive at t=0 with bursts 5, 3, 8, 6 ms and run FCFS in that order. What is the average waiting time in ms? Enter a decimal (e.g. 7.25).',
    correctAnswer: '7.25',
    acceptedAnswers: ['7.25', '29/4'],
    explanation:
      'Gantt: P1[0–5], P2[5–8], P3[8–16], P4[16–22]. WT = 0+5+8+16 = 29; avg = 29/4 = 7.25 ms.',
    whyWrong: {
      '12.75': 'That is average TAT, not WT.',
      '6.25': 'That is SJF average WT for the same bursts.',
      '0': 'Only P1 has WT 0.',
    },
    interviewTakeaway: 'WT = start − arrival; TAT = completion − arrival.',
  }),
  q({
    id: 'd4-q12',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Scheduling', 'SJF'],
    learningObjective: 'Compute non-preemptive SJF average waiting time',
    question:
      'Same four jobs arrive at 0 with bursts 5, 3, 8, 6. Non-preemptive SJF. Average waiting time in ms?',
    correctAnswer: '6.25',
    acceptedAnswers: ['6.25', '25/4'],
    explanation:
      'Order by burst: P2(3), P1(5), P4(6), P3(8). WT: 0, 3, 8, 14 → sum 25 → avg 6.25 (better than FCFS 7.25).',
    whyWrong: {
      '7.25': 'That is FCFS, not SJF order.',
      '5.5': 'Arithmetic error on the Gantt.',
    },
    interviewTakeaway: 'All-arrive-together SJF ⇒ sort by burst ascending.',
  }),
  q({
    id: 'd4-q13',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Scheduling', 'Round Robin'],
    learningObjective: 'Reason about RR quantum trade-offs',
    question:
      'Three equal CPU bursts of 6 arrive together under Round Robin. Roughly how does q=1 compare to q=6 for context-switch count (ignore final idle switch)?',
    options: [
      'q=1 and q=6 cause the same number of switches',
      'q=1 causes many more switches (~interleave every unit); q=6 is essentially FCFS with ~2 inter-job switches',
      'q=6 always causes more switches than q=1',
      'RR never context-switches when bursts are equal',
    ],
    correctAnswer: 1,
    explanation:
      'Large q (≥ max burst, same arrival) degenerates toward FCFS. Tiny q maximizes fairness/response but pays switch overhead on almost every tick.',
    whyWrong: {
      '0': 'Quantum size strongly affects switch rate.',
      '2': 'Opposite of the usual trade-off.',
      '3': 'Equal bursts still rotate under small q.',
    },
    interviewTakeaway: 'q→∞ ≈ FCFS; q→0 ≈ overhead dominates — pick q ≫ switch cost.',
  }),
  q({
    id: 'd4-q14',
    type: 'code',
    difficulty: 'medium',
    topics: ['Synchronization', 'Race Conditions'],
    learningObjective: 'Spot a lost-update race in code',
    question:
      'Two threads call deposit concurrently with no lock. What can go wrong?',
    codeSnippet: {
      language: 'java',
      code: `class Account {
  private int balance = 100;
  void deposit(int x) { balance += x; }
}`,
    },
    options: [
      'Nothing — += is always a single atomic CPU instruction on all platforms',
      'Lost updates: both threads may read the same balance and overwrite each other’s add',
      'The JVM forbids two threads from entering the method',
      'The process must deadlock immediately',
    ],
    correctAnswer: 1,
    explanation:
      'balance += x is typically load/add/store. Interleaving yields a classic lost update unless synchronized/locked/atomic.',
    whyWrong: {
      '0': 'High-level += is not a concurrency guarantee.',
      '2': 'Without synchronized, both may enter.',
      '3': 'Races ≠ deadlocks.',
    },
    interviewTakeaway: 'Demonstrate the interleaving on a whiteboard — don’t just say “race.”',
  }),
  q({
    id: 'd4-q15',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Semaphore', 'Synchronization'],
    learningObjective: 'Map producer-consumer to semaphore roles',
    question:
      'Bounded buffer: producers must not overwrite full slots; consumers must not read empty slots; mutual exclusion protects the buffer structure. A common semaphore setup is:',
    options: [
      'One mutex only — empty/full counting is unnecessary',
      'mutex + empty (counting free slots) + full (counting filled slots)',
      'Two barriers and no mutex',
      'Only a condition variable with no underlying lock',
    ],
    correctAnswer: 1,
    explanation:
      'Classic solution: mutex for the critical section, empty/full counting semaphores (or CV+mutex equivalents) for capacity and availability.',
    whyWrong: {
      '0': 'Without empty/full signaling you busy-wait or corrupt bounds.',
      '2': 'Barriers don’t model slot counts.',
      '3': 'Condition variables are used with a mutex.',
    },
    interviewTakeaway: 'Name the three primitives: mutex, empty, full.',
  }),
  q({
    id: 'd4-q16',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Deadlocks', 'Banker'],
    learningObjective: 'Compute Need = Max − Allocation',
    question:
      "Banker's: process P has Max=(7,5,3) and Allocation=(0,1,0). What is Need for resource type A (first component)? Enter an integer.",
    correctAnswer: '7',
    acceptedAnswers: ['7'],
    explanation:
      'Need = Max − Allocation = (7,5,3)−(0,1,0) = (7,4,3). Need_A = 7.',
    whyWrong: {
      '0': 'That is Allocation_A, not Need_A.',
      '4': 'That is Need_B.',
      '3': 'That is Need_C or Max_C confusion.',
    },
    interviewTakeaway: 'Always recompute Need before running the safety algorithm.',
  }),
  q({
    id: 'd4-q17',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Paging', 'Page Replacement'],
    learningObjective: 'Count FIFO page faults on a reference string',
    question:
      'Reference string 7,0,1,2,0,3,0,4,2,3,0,3,2 with 3 frames, FIFO. How many page faults?',
    correctAnswer: '10',
    acceptedAnswers: ['10'],
    explanation:
      'FIFO faults on 7,0,1,2,3,0,4,2,3,0 → 10. Hits do not reorder the FIFO queue; only faults enqueue/evict.',
    whyWrong: {
      '9': 'That is the LRU fault count for this string.',
      '7': 'That is Optimal.',
      '13': 'Counting hits as faults.',
    },
    interviewTakeaway: 'Draw frames + queue each step; don’t mentally “LRU while saying FIFO.”',
  }),
  q({
    id: 'd4-q18',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['TLB', 'Virtual Memory'],
    learningObjective: 'Compute simplified EAT with TLB',
    question:
      'Memory access m=100 ns, TLB=20 ns, hit ratio 0.9, single-level walk on miss (tlb + table + data). Effective access time in ns? Enter an integer.',
    correctAnswer: '130',
    acceptedAnswers: ['130'],
    explanation:
      'Hit: 20+100=120. Miss: 20+100+100=220. EAT = 0.9×120 + 0.1×220 = 108+22 = 130 ns.',
    whyWrong: {
      '120': 'Hit path only — ignores misses.',
      '220': 'Miss path only.',
      '110': 'Forgot TLB on both paths or misfactored.',
    },
    interviewTakeaway: 'EAT = h(tlb+m) + (1−h)(tlb+walk+m); locality ⇒ TLB hit rate.',
  }),
  q({
    id: 'd4-q19',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Linux Permissions', 'umask'],
    learningObjective: 'Apply umask to default file mode',
    question:
      'Default file create bits 666, umask 027. What octal mode does the new file get?',
    correctAnswer: '640',
    acceptedAnswers: ['0640', '640'],
    explanation:
      'mode = 666 & ~027 = 640 → rw-r-----.',
    whyWrong: {
      '666': 'Forgot umask.',
      '644': 'That is typical with umask 022, not 027.',
      '600': 'That would be closer to umask 077.',
    },
    interviewTakeaway: 'umask clears bits: 022→644 files; 027→640; 077→600.',
  }),
  q({
    id: 'd4-q20',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['Linux Debugging', 'Processes'],
    learningObjective: 'Outline a 100% CPU diagnosis playbook',
    question:
      'prod box: one Java service pegs a core at 100%. What is the best first investigative sequence?',
    options: [
      'Immediately reboot without identifying the PID',
      'Confirm hot PID/LWP via top/ps, note user vs system time, sample stacks (jstack/perf/strace -c) before restarting',
      'chmod -R 777 / to rule out permissions',
      'Disable the MMU',
    ],
    correctAnswer: 1,
    explanation:
      'Identify who burns CPU and whether it’s userspace spin, syscall-heavy, or fault-heavy; capture evidence before killing/restarting.',
    whyWrong: {
      '0': 'Destroys evidence and may not fix root cause.',
      '2': 'Dangerous and unrelated.',
      '3': 'Impossible/nonsense for this triage.',
    },
    interviewTakeaway: 'top → thread view → wchan/STAT → short samples → then act.',
  }),

  // ===== HARD (10) =====
  q({
    id: 'd4-q21',
    type: 'numerical',
    difficulty: 'hard',
    topics: ['Scheduling', 'SRTF'],
    learningObjective: 'Simulate SRTF with arrivals for average WT',
    question:
      'SRTF: P1(arr 0, burst 8), P2(1,4), P3(2,9), P4(3,5). Average waiting time in ms?',
    correctAnswer: '6.5',
    acceptedAnswers: ['6.5', '6.50', '13/2'],
    explanation:
      '0–1 P1; 1–5 P2 completes; 5–10 P4; 10–17 P1; 17–26 P3. WT: P1=9, P2=0, P3=15, P4=2 → avg 26/4 = 6.5. Always compare remaining time at arrivals.',
    whyWrong: {
      '7.25': 'FCFS-style thinking without preemption.',
      '0': 'Not all wait times are zero.',
      '8': 'Likely used original bursts instead of remaining after P1’s first slice.',
    },
    interviewTakeaway: 'SRTF: re-evaluate remaining time at every arrival — redraw the Gantt.',
  }),
  q({
    id: 'd4-q22',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Deadlocks', 'Banker', 'Synchronization'],
    learningObjective: 'Distinguish prevention vs Banker avoidance',
    question:
      'Interviewer: “Banker’s prevents deadlock by removing mutual exclusion.” What is the best correction?',
    options: [
      'Agree — Banker disables locks entirely',
      'Disagree — removing mutex is prevention; Banker is avoidance that refuses unsafe allocations while still allowing mutual exclusion',
      'Banker is only a page-replacement policy',
      'Banker is identical to detecting a waits-for cycle after deadlock already happened',
    ],
    correctAnswer: 1,
    explanation:
      'Prevention breaks a Coffman condition (e.g., lock ordering breaks circular wait). Banker avoids unsafe states given max claims. Detection finds deadlock after the fact.',
    whyWrong: {
      '0': 'Banker still allows exclusive holds; it gates grants.',
      '2': 'Category error.',
      '3': 'That’s detection/recovery, not avoidance.',
    },
    interviewTakeaway: 'Prevention vs avoidance vs detect/recover — don’t conflate vocabulary.',
  }),
  q({
    id: 'd4-q23',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Page Replacement', 'Belady'],
    learningObjective: 'Apply Belady’s anomaly correctly',
    question:
      'Which statement about Belady’s anomaly is accurate?',
    options: [
      'LRU can fault more with more frames for some traces',
      'Optimal (MIN) exhibits Belady’s anomaly',
      'FIFO may fault more when given more frames for some reference strings; LRU and OPT do not',
      'Belady’s anomaly means TLB shootdown on multicore',
    ],
    correctAnswer: 2,
    explanation:
      'Belady’s anomaly is specific to certain stack-property-violating policies like FIFO. LRU and OPT are stack algorithms and do not show it.',
    whyWrong: {
      '0': 'LRU does not have Belady’s anomaly.',
      '1': 'OPT is a lower bound without that anomaly.',
      '3': 'Unrelated concept.',
    },
    interviewTakeaway: 'Name FIFO + Belady; contrast with LRU/OPT stack property.',
  }),
  q({
    id: 'd4-q24',
    type: 'multi',
    difficulty: 'hard',
    topics: ['Context Switch', 'TLB', 'Virtual Memory'],
    learningObjective: 'Connect context switches to TLB behavior',
    question:
      'After switching address spaces, which statements are true? (Select all that apply)',
    options: [
      'Without ASID/PCID, kernels often flush TLB because stale translations could map the wrong process',
      'With ASID/PCID tags, TLB entries can be retained across switches',
      'The TLB stores file contents, not VA→PA translations',
      'Multicore PTE updates may require TLB shootdown so remote CPUs drop stale entries',
    ],
    correctAnswer: [0, 1, 3],
    explanation:
      'TLB caches translations. Untagged TLBs flush on mm switch; ASIDs avoid full flush. Shootdown keeps multicore TLBs coherent after PTE changes.',
    whyWrong: {
      '2': 'TLB caches translations, not general file data.',
    },
    interviewTakeaway: 'Context switch cost includes register save + possible TLB flush/shootdown.',
  }),
  q({
    id: 'd4-q25',
    type: 'code',
    difficulty: 'hard',
    topics: ['fork', 'Linux', 'Virtual Memory'],
    learningObjective: 'Predict fork return values and COW implications',
    question:
      'What does this print for parent vs child (ignoring scheduling order of the two lines), and what memory cost is deferred?',
    codeSnippet: {
      language: 'c',
      code: `pid_t p = fork();
if (p == 0) {
  printf("child %d\\n", p);
} else if (p > 0) {
  printf("parent got %d\\n", p);
}`,
    },
    options: [
      'Both print the same positive PID; pages are fully copied eagerly before fork returns',
      'Child prints 0; parent prints child’s PID; address space is typically copy-on-write until a write faults',
      'Child prints −1 always; parent prints 0',
      'fork replaces the program image like exec',
    ],
    correctAnswer: 1,
    explanation:
      'fork returns 0 in the child and child PID in the parent. Modern Unix uses COW: shared read-only pages until a write triggers a private copy (extra faults after fork on large heaps).',
    whyWrong: {
      '0': 'Return values differ; copy is usually lazy COW.',
      '2': '−1 is failure in the caller only.',
      '3': 'That’s exec, not fork.',
    },
    interviewTakeaway: 'fork+COW + large JVM heaps ⇒ fault storm risk; prefork carefully.',
  }),
  q({
    id: 'd4-q26',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Scheduling', 'Round Robin', 'Linux'],
    learningObjective: 'Correct RR misconceptions about Linux CFS',
    question:
      'Candidate: “Linux schedules normal tasks with textbook Round Robin.” Best interviewer-ready correction?',
    options: [
      'Yes — SCHED_RR is the default for all processes',
      'No — default fair scheduler is CFS (vruntime); SCHED_RR is a realtime policy, not the normal-task default',
      'Linux has no scheduler; hardware round-robins cores',
      'CFS is identical to FCFS convoy scheduling',
    ],
    correctAnswer: 1,
    explanation:
      'CFS approximates fair CPU share via virtual runtime. SCHED_FIFO/SCHED_RR are realtime classes. Textbook RR is a teaching model, not the default Linux policy name for nice’d tasks.',
    whyWrong: {
      '0': 'SCHED_RR is not the default for normal tasks.',
      '2': 'False.',
      '3': 'CFS targets fairness, not pure FCFS convoys.',
    },
    interviewTakeaway: 'Separate textbook RR from Linux CFS vs SCHED_RR.',
  }),
  q({
    id: 'd4-q27',
    type: 'numerical',
    difficulty: 'hard',
    topics: ['Scheduling', 'Round Robin'],
    learningObjective: 'Compute RR average turnaround time',
    question:
      'P1,P2,P3 arrive at 0 with bursts 10,5,8; RR q=4; initial order P1,P2,P3. Average turnaround time? Enter a decimal rounded to 2 places (e.g. 20.33).',
    correctAnswer: '20.33',
    acceptedAnswers: ['20.33', '20.333', '61/3'],
    explanation:
      'Completions: P2 at 17, P3 at 21, P1 at 23. TAT 23+17+21=61; avg=61/3≈20.33. WT avg≈12.67.',
    whyWrong: {
      '12.67': 'That is average waiting time, not TAT.',
      '23': 'That is only P1’s TAT.',
      '15': 'Incomplete Gantt.',
    },
    interviewTakeaway: 'Keep a queue of remaining bursts; slice at most q each turn.',
  }),
  q({
    id: 'd4-q28',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Virtual Memory', 'Thrashing', 'Scheduling'],
    learningObjective: 'Diagnose thrashing vs CPU-bound load',
    question:
      'CPU utilization is low, disk/swap is saturated, many processes are runnable but faulting heavily. Best diagnosis and OS-level response direction?',
    options: [
      'Healthy CPU-bound batch — raise multiprogramming degree further',
      'Thrashing: working sets exceed RAM — reduce multiprogramming / suspend victims / add memory; replacement alone may not save you',
      'FCFS convoy — switch quantum to 1 μs',
      'Missing execute bit on /bin — chmod 777 /',
    ],
    correctAnswer: 1,
    explanation:
      'Thrashing: system pages more than it computes. Fix degree of multiprogramming, memory, or working-set policies — not more concurrency.',
    whyWrong: {
      '0': 'More jobs worsen memory pressure.',
      '2': 'Wrong symptom class.',
      '3': 'Unrelated and dangerous.',
    },
    interviewTakeaway: 'Low CPU + high page-in/out ⇒ thrashing narrative.',
  }),
  q({
    id: 'd4-q29',
    type: 'code',
    difficulty: 'hard',
    topics: ['Linux Permissions', 'Pipes', 'fork'],
    learningObjective: 'Combine shell fork-exec with permission failure modes',
    question:
      'A shell runs `./tool | cat`. `./tool` is mode 644 owned by you. What fails and why?',
    codeSnippet: {
      language: 'bash',
      code: `ls -l ./tool
# -rw-r--r--  1 you you  12K  tool
./tool | cat`,
    },
    options: [
      'Nothing — 644 is always executable for the owner',
      'execve of ./tool fails (permission denied) because owner lacks execute; the pipe setup never gets a successful tool process',
      'cat cannot read pipes when the writer lacks +x',
      'fork is rejected by umask 022',
    ],
    correctAnswer: 1,
    explanation:
      'Execute permission is required to exec a file. 644 is rw-r--r-- (no +x). Shell still forks, but the child exec fails; pipeline breaks on the producer side.',
    whyWrong: {
      '0': '644 has no execute bit.',
      '2': 'Pipe readability isn’t gated that way.',
      '3': 'umask doesn’t block fork.',
    },
    interviewTakeaway: 'Wire the story: permissions gate exec; fork+pipe+exec is the shell’s launch path.',
  }),
  q({
    id: 'd4-q30',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Synchronization', 'Deadlocks', 'Linux Debugging'],
    learningObjective: 'Combine lock ordering with production deadlock triage',
    question:
      'Two threads in a Linux service freeze; one holds mutex A waiting for B, the other holds B waiting for A. CPU is near idle. Best combined OS+app answer?',
    options: [
      'It cannot be deadlock because CPU is idle',
      'Classic circular wait: prevent with global lock order (or try-lock backoff); confirm with thread dumps /gdb showing blocked futex waits — Banker’s max-claims is rarely how app mutexes are managed',
      'Increase RR quantum to break the cycle automatically',
      'Run page replacement OPT to free the mutexes',
    ],
    correctAnswer: 1,
    explanation:
      'Idle CPU fits blocking deadlock. Fix with lock ordering/less nesting; diagnose via stacks and futex waits. Banker needs a priori max claims — uncommon for fine-grained app locks.',
    whyWrong: {
      '0': 'Deadlocked threads block; CPU can be idle.',
      '2': 'Scheduler quantum doesn’t unlock mutex cycles.',
      '3': 'Paging is unrelated to user mutex ownership.',
    },
    interviewTakeaway:
      'Deadlock interview chain: Coffman → lock order → dumps/futex → why not Banker for mutexes.',
  }),
]

export default day4Questions
