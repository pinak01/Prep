import {
  createPage,
  section,
  p,
  h3,
  ul,
  ol,
  table,
  callout,
  code,
} from '../../../helpers'

export const d4rev = createPage(
  'd4-rev',
  '10-Minute Revision',
  10,
  [
    'Recall the highest-yield OS + Linux facts under time pressure',
    'Rehearse formulas and command cheatsheets',
    'Self-check readiness before mock interviews',
  ],
  {
    sections: [
      section('checklist', 'Dense checklist', [
        h3('Processes & scheduling'),
        ul([
          'Process owns resources; thread shares them (stack/regs private).',
          'PCB/task_struct: identity, CPU state, mm, files, signals, sched.',
          'States: New/Ready/Running/Waiting/Terminated; Linux R,S,D,Z,T.',
          'Context switch ≠ mode switch; may switch CR3/page tables.',
          'WT = TAT − burst; TAT = completion − arrival.',
          'FCFS convoy; SJF optimal avg WT (known bursts); SRTF = preemptive SJF; RR quantum trade-off.',
          'Linux normal tasks ≈ CFS, not textbook RR.',
        ]),
        h3('Sync & deadlocks'),
        ul([
          'Race → critical section → mutex/atomic.',
          'Mutex ownership vs semaphore counting; CV + while(predicate).',
          'Coffman: ME, hold&wait, no preemption, circular wait.',
          'Prevention (lock order) vs avoidance (Banker) vs detect/recover vs ignore.',
          'Need=Max−Alloc; safety sim adds Allocation back to Work.',
        ]),
        h3('Memory & FS'),
        ul([
          'VA = VPN+off → PTE → frame; fault if not present.',
          'FIFO / LRU / OPT replacements; Belady anomaly (FIFO).',
          'TLB caches translations; ASID/PCID; shootdown.',
          'Internal (paging) vs external (contiguous) fragmentation.',
          'Inode metadata; dir names; syscall = mode switch; VFS.',
          'IPC: pipe/socket/shm(+sync)/signals — pick by need.',
        ]),
        h3('Linux'),
        ul([
          'Modes: 755/644/640/700; rwx=4/2/1; umask; sticky on /tmp.',
          'ps/top/jobs; TERM then KILL; zombies need wait.',
          'grep|awk|sed; > >> 2>&1 pipes; PATH.',
          'ssh/curl/ss -ltnp/lsof -i :port.',
          'df/du/free/journalctl/systemctl.',
          'CPU playbook: PID → threads → strace/perf → classify → mitigate.',
          'Shell: fork → exec → wait.',
        ]),
        callout(
          'tip',
          'If you can narrate one Gantt chart, one Banker safety pass, one page-replacement trace, one chmod octal, and one 100% CPU playbook, you are interview-ready for Day 4.',
          'Bar',
        ),
      ]),
      section('formulas', 'Formulas & commands card', [
        table(
          ['Topic', 'Remember'],
          [
            ['TAT / WT', 'TAT=C−A; WT=TAT−burst (CPU-only model)'],
            ['chmod', 'r4 w2 x1; 755 dirs, 644 files common'],
            ['umask', 'effective ≈ requested & ~umask'],
            ['Banker Need', 'Need=Max−Allocation'],
            ['EAT (TLB)', 'h(tlb+m)+(1−h)(tlb+walk+m)'],
          ],
        ),
        code(
          'bash',
          `ps aux --sort=-%cpu | head
ss -ltnp
lsof -i :8080
df -h; free -h
journalctl -u svc -n 100 --no-pager
chmod 640 file; umask`,
          '30-second command drill',
        ),
      ]),
    ],
    commonMistakes: [
      'Skipping numerical practice — scheduling/paging/Banker are speed checks.',
      'Memorizing tool flags without the OS story behind them.',
    ],
    interviewQuestions: [
      'Process vs thread in 30 seconds?',
      'Four Coffman conditions?',
      'FIFO vs LRU one-liner?',
      'chmod 640 meaning?',
      'fork vs exec?',
    ],
    intermediateInterviewQuestions: [
      'Context switch steps?',
      'Safe state definition?',
      'TLB purpose?',
      'ss vs lsof?',
      'Why while not if on condition wait?',
    ],
    advancedInterviewQuestions: [
      'CFS vs RR?',
      'Belady anomaly?',
      'Major vs minor fault?',
      'Priority inversion fix?',
      'CPU 100% playbook?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Give a 60-second Day 4 sweep.',
        answer:
          'OS multiplexes CPUs with processes/threads tracked by PCBs, scheduling Ready tasks and blocking on I/O. Shared memory needs locks; deadlocks need Coffman awareness and lock ordering or Banker-style avoidance. Virtual memory translates via page tables/TLBs with replacement on pressure. Linux exposes this via ps/top, chmod, pipes, ss/lsof, journalctl/systemd, and fork/exec. I can work WT/TAT, Banker safety, and page-fault traces on a whiteboard.',
      },
    ],
    keyTakeaways: [
      'Theory metrics + Linux tools are one story.',
      'Practice the three numerical families cold.',
      'Playbooks beat trivia for senior-flavored interviews.',
    ],
  },
)

export const d4traps = createPage(
  'd4-traps',
  'Interview Traps',
  10,
  [
    'Avoid the most common OS/Linux misconceptions',
    'Catch precision errors interviewers punish',
    'Replace vague answers with sharp distinctions',
  ],
  {
    sections: [
      section('traps', 'High-frequency traps', [
        ol([
          '“Threads have their own address space.” — False; that’s processes.',
          '“Syscall = context switch.” — Mode switch; context switch changes thread.',
          '“Linux uses Round Robin.” — CFS for normal tasks; SCHED_RR is realtime.',
          '“Unsafe state means deadlock now.” — Means deadlock is possible under claims.',
          '“More frames always fewer FIFO faults.” — Belady’s anomaly.',
          '“Virtual memory means swap.” — Swap is optional backing; VM is translation/protection.',
          '“Mutex and binary semaphore are identical.” — Ownership & usage differ.',
          '“kill -9 first.” — Prefer SIGTERM; KILL skips cleanup.',
          '“chmod 777 fixes it.” — Security smell; debug ownership/paths.',
          '“Zombie uses tons of RAM.” — Mostly an exit-status stub.',
          '“High VSZ means memory leak.” — Virtual mappings ≠ resident.',
          '“Page fault always means bug.” — Demand paging faults are normal.',
        ]),
        callout(
          'mistake',
          'Sounding absolute (“always”, “Linux is RR”) is riskier than stating the common case plus the exception.',
          'Language trap',
        ),
      ]),
      section('precision', 'Precision upgrades', [
        table(
          ['Vague', 'Sharp'],
          [
            ['“Lock the code”', '“Serialize this critical section with a mutex”'],
            ['“Schedule fairly”', '“CFS equalizes weighted virtual runtime”'],
            ['“Memory full”', '“MemAvailable low / thrashing / OOM killer”'],
            ['“Port busy”', '“LISTEN socket owned by PID via ss -ltnp”'],
          ],
        ),
        p(
          'When stuck, define terms, give a mechanism, give a trade-off. That triad survives follow-ups.',
        ),
      ]),
      section('followups', 'Trap recovery phrases', [
        p('Candidate slips: "Syscalls always context switch."'),
        p('Recovery: "More precisely, they mode-switch into the kernel; a context switch happens only if the scheduler deschedules the thread—e.g., it blocks."'),
        p('Candidate slips: "Banker prevents deadlock by removing mutual exclusion."'),
        p('Recovery: "That would be prevention. Banker is avoidance—it refuses unsafe allocations while still allowing mutual exclusion."'),
      ]),
    ],
    commonMistakes: [
      'Doubling down on a wrong absolute instead of refining.',
      'Confusing textbook policies with Linux defaults.',
      'Mixing prevention/avoidance/detection vocabulary.',
    ],
    interviewQuestions: [
      'Syscall vs context switch?',
      'Unsafe vs deadlock?',
      'Does Linux use RR for normal tasks?',
      'Do threads have private heaps?',
      'Is every page fault an error?',
    ],
    intermediateInterviewQuestions: [
      'When is kill -9 justified?',
      'VSZ vs RSS trap?',
      'Binary semaphore vs mutex?',
      'Belady anomaly statement?',
      'Sticky bit purpose?',
    ],
    advancedInterviewQuestions: [
      'Where do people misuse shared memory IPC?',
      'How can load average mislead?',
      'Priority inversion vs deadlock?',
      'Why M:N threading surprised people?',
      'External vs internal fragmentation mix-ups?',
    ],
    interviewReadyAnswers: [
      {
        question: 'What OS misconception do candidates most often make?',
        answer:
          'Collapsing distinct ideas: process/thread, syscall/context-switch, unsafe/deadlocked, VM/swap, mutex/semaphore, CFS/RR. Strong candidates draw the boundary in one sentence and add when the exception matters. That precision is often worth more than listing five algorithm names.',
      },
    ],
    keyTakeaways: [
      'Punish absolute wrongness; reward precise distinctions.',
      'Name the Linux reality after the textbook model.',
      'Recover gracefully by restating the sharper definition.',
    ],
  },
)

export const d4rapid = createPage(
  'd4-rapid',
  'Rapid Fire — 20 Questions',
  12,
  [
    'Answer 20 high-yield prompts quickly',
    'Use hint sections to self-score',
    'Flag weak spots for targeted review',
  ],
  {
    sections: [
      section('round', '20 prompts (answer out loud)', [
        ol([
          'Process vs thread — 20 seconds.',
          'Name five PCB fields.',
          'Ready vs Waiting.',
          'Define turnaround time.',
          'What is the convoy effect?',
          'RR as quantum → 0 and → ∞?',
          'Critical section definition.',
          'Mutex vs counting semaphore.',
          'Four Coffman conditions.',
          'Need matrix formula.',
          'What does a page fault do?',
          'FIFO vs OPT goal.',
          'Why TLB?',
          'Internal vs external fragmentation.',
          'User vs kernel mode.',
          'Pipe vs shared memory.',
          'chmod 750 meaning.',
          'SIGTERM vs SIGKILL.',
          'Command to see listener on :443.',
          'Shell steps to run /bin/ls.',
        ]),
      ]),
      section('hints', 'Model-answer hints (not full essays)', [
        ul([
          '1: resources vs execution context.',
          '2: PID, regs, sched, mm, files…',
          '3: runnable vs blocked on event.',
          '4: completion − arrival.',
          '5: long job blocks shorts in FCFS.',
          '6: pure overhead vs ≈ FCFS.',
          '7: code needing mutual exclusion.',
          '8: ownership lock vs resource count.',
          '9: ME, hold&wait, no preempt, cycle.',
          '10: Max − Allocation.',
          '11: trap → load page → update PTE → resume.',
          '12: oldest vs farthest-next-use.',
          '13: cache VA→PA translations.',
          '14: waste in page vs holes between blocks.',
          '15: unprivileged vs privileged CPU mode.',
          '16: kernel stream copy vs shared pages+sync.',
          '17: rwxr-x---.',
          '18: catchable polite vs forced kill.',
          '19: ss -ltnp | grep 443 (or lsof -i :443).',
          '20: fork; child execve; parent waitpid.',
        ]),
        callout(
          'tip',
          'Score yourself: 18–20 ready; 14–17 review weak pages; <14 rework numericals + playbook.',
          'Self-score',
        ),
      ]),
    ],
    commonMistakes: [
      'Writing essays in rapid fire — punch the keyword then stop.',
      'Skipping self-score; the point is diagnostics.',
    ],
    interviewQuestions: [
      'Process vs thread — 20 seconds.',
      'Name five PCB fields.',
      'Ready vs Waiting.',
      'Define turnaround time.',
      'What is the convoy effect?',
      'RR as quantum → 0 and → ∞?',
      'Critical section definition.',
    ],
    intermediateInterviewQuestions: [
      'Mutex vs counting semaphore.',
      'Four Coffman conditions.',
      'Need matrix formula.',
      'What does a page fault do?',
      'FIFO vs OPT goal.',
      'Why TLB?',
      'Internal vs external fragmentation.',
    ],
    advancedInterviewQuestions: [
      'User vs kernel mode.',
      'Pipe vs shared memory.',
      'chmod 750 meaning.',
      'SIGTERM vs SIGKILL.',
      'Command to see listener on :443.',
      'Shell steps to run /bin/ls.',
    ],
    interviewReadyAnswers: [
      {
        question: 'How should you use this rapid-fire page?',
        answer:
          'Cover the answers with your hand, speak one tight sentence each, then check hints. Anything hesitant becomes a targeted revisit of that page’s numerical or playbook. Speed with precision beats slow perfection in screening rounds.',
      },
    ],
    keyTakeaways: [
      '20 prompts cover the Day 4 surface area.',
      'Hints are answer keys for self-study, not scripts to memorize verbatim.',
      'Revisit weak IDs: scheduling, Banker, paging, chmod, CPU playbook.',
    ],
  },
)
