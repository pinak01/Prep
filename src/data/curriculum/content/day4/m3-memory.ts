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

export const d4p9 = createPage(
  'd4-p9',
  'Virtual Memory & Paging',
  22,
  [
    'Explain virtual vs physical addresses and why VM exists',
    'Describe page tables, PTEs, and the page-fault path',
    'Work FIFO, LRU, and Optimal page-replacement numericals',
    'Discuss thrashing and working-set intuition',
  ],
  {
    prerequisites: ['d4-p1'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Virtual memory gives each process a private virtual address space, mapped by the OS onto physical frames (and disk swap). Programs see a contiguous VA space; the MMU translates VA→PA using page tables. Paging splits memory into fixed-size pages (e.g., 4 KiB) so allocation is flexible and protection/sharing are per-page.',
        ),
        h3('Why it exists'),
        ul([
          'Isolation: process A cannot touch B’s pages without mapping.',
          'Convenient layout: stack/heap grow independently; sparse address spaces.',
          'Overcommit / multiprogramming: more virtual memory than RAM via demand paging + swap.',
          'Sharing: map the same physical frame read-only into many processes (shared libs).',
        ]),
        diagram(
          `flowchart LR
  VA["Virtual address<br/>VPN + offset"] --> MMU["MMU + page table / TLB"]
  MMU -->|hit| PA["Physical address<br/>frame + offset"]
  MMU -->|miss PTE present=0| PF["Page fault handler"]
  PF --> Disk["Swap / file backed page"]
  Disk --> Frame["Allocate frame<br/>update PTE"]
  Frame --> MMU`,
          'VA translation and the page-fault path',
        ),
        diagram(
          `flowchart TB
  subgraph VAS["Process virtual address space"]
    P0["Page 0"]
    P1["Page 1"]
    P2["Page 2"]
    P3["Page 3"]
  end
  subgraph PT["Page table"]
    E0["PTE0 → Frame 2"]
    E1["PTE1 → Frame 5"]
    E2["PTE2 invalid"]
    E3["PTE3 → Frame 1"]
  end
  subgraph RAM["Physical memory"]
    F1["Frame 1"]
    F2["Frame 2"]
    F5["Frame 5"]
  end
  P0 --> E0 --> F2
  P1 --> E1 --> F5
  P3 --> E3 --> F1
  P2 --> E2`,
          'Pages map to frames via PTE; invalid PTE ⇒ fault',
        ),
      ]),
      section('how', 'How it works', [
        h3('Addresses'),
        p(
          'Virtual address = virtual page number (VPN) + offset. Physical address = frame number + same offset. PTE holds frame number + flags: present/valid, R/W, U/S, accessed/dirty, NX, etc.',
        ),
        h3('Page fault (major path)'),
        ol([
          'CPU walks tables (or TLB miss then walk); present bit clear → fault trap to kernel.',
          'Kernel checks if access is legal (segfault vs demand page).',
          'Find/free a frame (may run page replacement / reclaim).',
          'Schedule I/O from swap or file; block thread (Waiting) if major fault.',
          'Update PTE, flush/invalidate TLB entry as needed; retry instruction.',
        ]),
        h3('Replacement policies (interview classics)'),
        ul([
          'FIFO: evict oldest loaded page — simple, Belady’s anomaly possible.',
          'Optimal (MIN/OPT): evict page used farthest in the future — offline lower bound.',
          'LRU: evict least recently used — good approximation of OPT; expensive exactly.',
          'Clock/Second-chance: approximate LRU with reference bits — used in practice.',
        ]),
        callout(
          'warning',
          'Belady’s anomaly: for FIFO, more frames can increase fault count for some traces. LRU and OPT do not have this anomaly.',
          'Exam favorite',
        ),
      ]),
      section('example', 'Worked example', [
        numerical({
          title: 'FIFO page replacement',
          problem:
            'Reference string: 7,0,1,2,0,3,0,4,2,3,0,3,2 with 3 frames. Count page faults under FIFO.',
          given: '3 frames; refs 7 0 1 2 0 3 0 4 2 3 0 3 2; FIFO queue order',
          formula: 'Fault if page not in memory; evict head of FIFO on fault when full',
          steps:
            '7f [7]\n0f [7,0]\n1f [7,0,1]\n2f replace7 [0,1,2]\n0 hit\n3f replace0 [1,2,3]\n0f replace1 [2,3,0]\n4f replace2 [3,0,4]\n2f replace3 [0,4,2]\n3f replace0 [4,2,3]\n0f replace4 [2,3,0]\n3 hit\n2 hit\nFaults at refs: 7,0,1,2,3,0,4,2,3,0 → 10 faults. (Hits do not reorder the FIFO queue.)',
          answer: '10 page faults under FIFO with 3 frames',
          shortcut: 'Maintain an explicit queue; mark H/F each reference — never rely on memory.',
          mistake: 'Evicting the LRU page while claiming FIFO, or reordering the FIFO queue on hits.',
        }),
        numerical({
          title: 'LRU page replacement',
          problem:
            'Same string 7,0,1,2,0,3,0,4,2,3,0,3,2 with 3 frames. Count LRU faults.',
          given: '3 frames; LRU = evict page whose last use is oldest',
          formula: 'On fault when full, replace least recently referenced page',
          steps:
            '7,0,1 fault → [7,0,1]\n2 fault replace7 → [0,1,2]\n0 hit (recency update)\n3 fault replace1 → [0,2,3]\n0 hit\n4 fault replace2 → [0,3,4]\n2 fault replace0 → [3,4,2]\n3 hit\n0 fault replace4 → [3,2,0]\n3 hit\n2 hit\nFaults = 9 (standard result for this string with LRU/3 frames)',
          answer: '9 page faults (LRU)',
          shortcut: 'After each ref, rewrite frames in MRU→LRU order to see victim clearly.',
          mistake: 'Updating recency on FIFO policy by accident.',
        }),
        numerical({
          title: 'Optimal (MIN) replacement',
          problem:
            'Same string and 3 frames. Count OPT faults.',
          given: 'Evict page whose next use is farthest (or never)',
          formula: 'Offline optimal policy',
          steps:
            '7f [7]; 0f [7,0]; 1f [7,0,1]\n2f: 7 never used again → replace7 [0,1,2]\n0 hit\n3f: 1 never used again → replace1 [0,2,3]\n0 hit\n4f: among {0,2,3}, next uses: 0 soon, 2 sooner than 3? after “4” string is 2,3,0,3,2 — next: 2 then 3 then 0; farthest is 0 → replace0 [2,3,4]\n2 hit\n3 hit\n0f: replace4 (4 never again) [2,3,0]\n3 hit\n2 hit\nFaults: 7,0,1,2,3,4,0 → 7 faults.',
          answer: '7 page faults under Optimal',
          shortcut: 'OPT is the lower bound you compare LRU/FIFO against in interviews.',
          mistake: 'Looking only one step ahead instead of farthest next use.',
        }),
        example('Thrashing', [
          p(
            'If the working set of runnable processes exceeds RAM, the system spends most time paging. CPU utilization drops while disk is busy — thrashing. Fixes: reduce multiprogramming degree, buy RAM, local replacement / working-set policies, detect and suspend victims.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Larger pages: smaller tables, better TLB reach; more internal fragmentation.',
          'Huge pages (2 MB/1 GB): great for large heaps/DBs; harder to manage, potential waste.',
          'Demand paging: fast start, fault storms possible.',
          'Swap thrashing vs OOM killer — Linux may kill before absolute deadlock on memory.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Context switch may change page table root (p2).',
          'TLB (p10) caches translations; faults interact with scheduling (block on I/O).',
          'mmap/file pages unify FS and VM (p11).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Virtual memory maps VPN to frames via page tables; faults load missing pages."'),
        p('Interviewer: "What happens on a page fault?"'),
        p(
          'Strong answer: "Trap to kernel, validate access, allocate/reclaim a frame, read page from disk/file, update PTE/TLB, resume the instruction. The thread may sleep for a major fault."',
        ),
        p('Interviewer: "FIFO vs LRU?"'),
        p(
          'Strong answer: "FIFO is simple but can fault more with more memory (Belady). LRU approximates optimal using recency; exact LRU is pricey so hardware/OS use clock approximations."',
        ),
      ]),
    ],
    commonMistakes: [
      'Thinking virtual memory always equals “using disk” — many pages never leave RAM.',
      'Confusing page fault with segmentation fault (illegal access).',
      'Reordering FIFO queue on hits.',
      'Claiming more frames always help FIFO.',
    ],
    interviewQuestions: [
      'What is virtual memory?',
      'What is a page table entry?',
      'What causes a page fault?',
      'Explain FIFO and LRU replacement.',
      'What is thrashing?',
    ],
    intermediateInterviewQuestions: [
      'Work a full LRU fault count for a reference string.',
      'What is Belady’s anomaly?',
      'Demand paging vs prepaging?',
      'What are dirty/accessed bits for?',
      'How does copy-on-write use page protections?',
    ],
    advancedInterviewQuestions: [
      'How do multi-level page tables save memory vs a single flat table?',
      'Explain inverted page tables.',
      'Working set vs WSClock?',
      'How do huge pages interact with fragmentation?',
      'NUMA page placement policies?',
      'Contrast major vs minor page faults on Linux.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain virtual memory, paging, and page faults.',
        answer:
          'Each process has a virtual address space split into pages, mapped by page tables to physical frames or marked not-present. The MMU translates VA to PA; if the PTE is invalid, a page fault traps to the OS, which may load the page from disk, allocate a frame (possibly evicting another page via FIFO/LRU/clock), update the PTE, and resume. Benefits: isolation, sparse mappings, overcommit. Costs: table memory, TLB pressure, and thrashing if working sets exceed RAM.',
      },
    ],
    keyTakeaways: [
      'VM = translation + protection + demand loading.',
      'Practice FIFO/LRU/OPT traces until mechanical.',
      'OPT is offline bound; LRU approximates; FIFO is simple but anomalous.',
      'Thrashing is a system-level symptom of oversubscribed memory.',
    ],
  },
)

export const d4p10 = createPage(
  'd4-p10',
  'TLB, Segmentation & Allocation',
  16,
  [
    'Explain TLB purpose, hit/miss path, and shootdown',
    'Contrast segmentation with paging and segmented paging',
    'Compare contiguous allocation, paging, and buddy/slab ideas',
    'Reason about external vs internal fragmentation',
  ],
  {
    prerequisites: ['d4-p9'],
    sections: [
      section('concept', 'Concept', [
        p(
          'The TLB (Translation Lookaside Buffer) is a small associative cache of recent VA→PA translations. Without it, every load/store would walk multi-level page tables (multiple memory refs). Segmentation divides address space into variable-sized logical segments (code, stack, …) with base+limit. Modern general-purpose OSes are paging-first; x86 historically combined both.',
        ),
        h3('Fragmentation'),
        ul([
          'External: free memory punched into holes between allocated regions (contiguous allocation / segments).',
          'Internal: wasted space inside an allocated block/page (paging’s last partial page).',
        ]),
      ]),
      section('how', 'How it works', [
        h3('TLB'),
        ol([
          'CPU looks up VPN in TLB.',
          'Hit: concatenate frame + offset → PA (fast path).',
          'Miss: hardware/software page-table walk; fill TLB; retry.',
          'Context switch: flush or tag TLB with ASID/PCID to avoid full flush.',
          'Shootdown: when PTE changes on multicore, remote CPUs must invalidate stale TLB entries.',
        ]),
        h3('Allocation strategies (classic)'),
        table(
          ['Strategy', 'Idea', 'Fragmentation'],
          [
            ['First/best/worst fit', 'Place in holes of contiguous memory', 'External'],
            ['Paging', 'Fixed frames', 'Internal'],
            ['Buddy allocator', 'Split/merge power-of-two blocks', 'Internal + some external'],
            ['Slab/slub', 'Caches of equal-size kernel objects', 'Low internal for objects'],
          ],
        ),
        code(
          'bash',
          `# TLB / memory pressure clues
grep -E 'pgfault|pgmajfault' /proc/vmstat
# perf (if available) can sample dTLB-load-misses — know the concept even if tool missing`,
          'Ops angle: fault rates hint at VM/TLB stress',
        ),
      ]),
      section('example', 'Worked example', [
        example('Effective memory access time', [
          p(
            'If TLB hit ratio h, TLB access ε, memory access m, and single-level walk assumed on miss: EAT ≈ h(ε+m) + (1−h)(ε+2m) when walk needs one table read + one data read (simplified). Higher hit ratio dominates performance — locality matters.',
          ),
        ]),
        numerical({
          title: 'EAT with TLB',
          problem:
            'Memory access 100 ns, TLB 20 ns, hit ratio 90%, page-table walk one memory access on miss. Find effective access time for a data reference (simplified single-level).',
          given: 'm=100ns, tlb=20ns, h=0.9; miss path: tlb + table + data',
          formula: 'EAT = h(tlb+m) + (1-h)(tlb+2m)',
          steps:
            'Hit: 20+100=120\nMiss: 20+100+100=220\nEAT=0.9*120 + 0.1*220 = 108 + 22 = 130 ns',
          answer: '130 ns effective access time',
          shortcut: 'EAT ≈ tlb + m + (1−h)·(walk costs)',
          mistake: 'Forgetting to include the data access on the miss path.',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Larger TLB / huge pages ⇒ better reach, fewer misses.',
          'Segmentation matches programmer objects but external fragmentation & swapping whole segments hurts.',
          'Paging: uniform, good sharing/protection; needs multi-level tables + TLB.',
          'ASID/PCID tags reduce flush cost at context switch.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "TLB caches page translations to avoid walking tables every access."'),
        p('Interviewer: "What happens on context switch?"'),
        p(
          'Strong answer: "Naively flush TLB because translations are process-specific. With ASID/PCID, entries are tagged so we can keep them across switches."',
        ),
        p('Interviewer: "Paging vs segmentation?"'),
        p(
          'Strong answer: "Paging uses fixed sizes — no external fragmentation, some internal. Segmentation uses logical variable sizes — natural protection domains, external fragmentation. Modern OSes primarily page; segments are vestigial on x86-64."',
        ),
      ]),
    ],
    commonMistakes: [
      'Saying TLB stores data (it stores translations).',
      'Ignoring TLB shootdown costs on multicore PTE updates.',
      'Claiming paging has external fragmentation (normally internal).',
      'Equating segmentation fault always with segment hardware — on Linux it’s a general SIGSEGV.',
    ],
    interviewQuestions: [
      'What is a TLB?',
      'What is a TLB miss?',
      'Internal vs external fragmentation?',
      'Paging vs segmentation?',
      'What is a buddy allocator?',
    ],
    intermediateInterviewQuestions: [
      'Compute a simple EAT given hit ratio.',
      'Why use multi-level page tables?',
      'What is TLB shootdown?',
      'How do huge pages help TLB reach?',
      'First-fit vs best-fit trade-offs?',
    ],
    advancedInterviewQuestions: [
      'How do ASIDs/PCIDs work at a high level?',
      'Explain speculative execution’s interaction with TLB/page permissions historically (conceptually).',
      'Slab vs buddy responsibilities in Linux?',
      'What is a virtually indexed physically tagged cache issue?',
      'How does memory compaction relate to huge pages?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain the TLB and why it matters.',
        answer:
          'The TLB caches recent virtual-to-physical page translations. Hits make address translation roughly a CAM lookup plus the data access; misses require walking page tables and refill the TLB. Because walks are expensive, locality and huge pages improve effective memory latency. On context switches, TLBs may flush or use address-space IDs. Multicore PTE updates need shootdowns so stale translations are not used. Trade-off: small/fast TLBs vs coverage.',
      },
    ],
    keyTakeaways: [
      'TLB makes paging practical; hit rate is everything.',
      'Paging ↔ internal fragmentation; contiguous/segments ↔ external.',
      'Know buddy/slab as Linux allocator vocabulary.',
      'EAT numericals are fair game in interviews.',
    ],
  },
)

export const d4p11 = createPage(
  'd4-p11',
  'File Systems, Syscalls & Modes',
  16,
  [
    'Describe files, inodes, directories, and path lookup',
    'Explain user mode vs kernel mode and the syscall boundary',
    'Trace open/read/write/close at interview depth',
    'Connect VFS to multiple filesystem types',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'A filesystem maps names and offsets to durable bytes (and metadata). Unix model: everything is a file — regular files, devices, pipes. An inode stores metadata (owner, mode, timestamps, size, data block pointers); directory entries map names → inode numbers. The Virtual File System (VFS) is the kernel’s common API above ext4, XFS, NFS, etc.',
        ),
        h3('Modes'),
        p(
          'CPUs provide privilege rings. User mode runs applications with restricted instructions/memory. Kernel mode runs OS code with full hardware control. Crossing the boundary happens via syscalls (svc/syscall instruction), exceptions, or interrupts — controlled entry points.',
        ),
      ]),
      section('how', 'How it works', [
        h3('Syscall path (simplified)'),
        ol([
          'Userspace libc wrapper (read) sets syscall number + args in registers.',
          'syscall instruction traps to kernel; mode switch; stack switch to kernel stack.',
          'Kernel validates args, walks file descriptor → file object → inode/ops.',
          'Performs I/O (page cache hit or block device), sets return value.',
          'Returns to userspace; mode switch back; libc returns to app.',
        ]),
        code(
          'bash',
          `# Trace syscalls of a command
strace -e openat,read,write,close cat /etc/hostname 2>&1 | head -40
# See FD table
ls -l /proc/self/fd`,
          'strace makes the syscall boundary visible',
        ),
        h3('Open file layers'),
        ul([
          'FD (per-process) → file description (offset, status flags) → inode/dentry → pages in page cache → disk blocks.',
          'fork duplicates FDs sharing the same open file description (shared offset).',
          'dup/dup2 create another FD to the same description.',
        ]),
      ]),
      section('example', 'Worked example', [
        example('Why page cache matters', [
          p(
            'First read of a file may hit disk (slow). Second read often served from page cache — still a read() syscall (mode switch) but no device I/O. mmap can avoid some copying; still involves VM mappings.',
          ),
        ]),
        callout(
          'tip',
          'Interview golden line: “Syscalls are controlled, audited transitions into kernel mode — not a context switch by themselves.”',
          'Precision',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Many small syscalls → mode-switch overhead (batching, io_uring, readv).',
          'Buffered vs O_DIRECT: cache vs bypass for DBs.',
          'Journaling FS trade durability vs speed (data=ordered/writeback modes).',
          'Permissions checked at open/lookup — not every read byte (capability at open time).',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'FD tables live conceptually in the PCB (p1).',
          'Page cache unifies FS and VM (p9).',
          'Permissions deepen in Linux chmod page (p13).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "User code cannot touch hardware directly; it requests services via syscalls."'),
        p('Interviewer: "What does an inode store?"'),
        p(
          'Strong answer: "Metadata: owner, permissions, timestamps, size, link count, and pointers to data blocks — not the file name. Names live in directory entries."',
        ),
        p('Interviewer: "Hard link vs symlink?"'),
        p(
          'Strong answer: "Hard link: another directory entry to the same inode (same FS). Symlink: a special file holding a path string; may dangle; can cross filesystems."',
        ),
      ]),
    ],
    commonMistakes: [
      'Believing the filename is stored inside the inode.',
      'Calling every kernel entry a context switch.',
      'Thinking close() always flushes data to platters (buffers/journal complicate durability).',
      'Confusing libc buffered I/O with kernel page cache.',
    ],
    interviewQuestions: [
      'User mode vs kernel mode?',
      'What is a system call?',
      'What is an inode?',
      'What does open() return?',
      'Hard link vs soft link?',
    ],
    intermediateInterviewQuestions: [
      'Walk through read() from libc to disk.',
      'Why is VFS useful?',
      'File descriptor vs open file description?',
      'What is the page cache?',
      'What does fsync() guarantee (approximately)?',
    ],
    advancedInterviewQuestions: [
      'How does path lookup work with dentry cache?',
      'Explain journalled filesystem commit path at a high level.',
      'io_uring vs classic read/write?',
      'Capability / seccomp interaction with syscalls?',
      'Why might mmap be faster or slower than read?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain syscalls and file I/O structure.',
        answer:
          'Applications run in user mode and must enter the kernel via syscalls for privileged services like I/O. open returns a file descriptor that indexes a per-process table pointing at a kernel file object with offset and a link to an inode. Reads/writes go through the VFS into a concrete filesystem and usually the page cache. Mode switches have cost but are not themselves thread context switches. Trade-offs appear in buffering, O_DIRECT, and durability APIs like fsync.',
      },
    ],
    keyTakeaways: [
      'Inode = metadata + blocks; directory = names.',
      'Syscall = controlled mode switch into the kernel.',
      'FD → file object → inode → page cache → device.',
      'VFS lets many filesystems share one API.',
    ],
  },
)

export const d4p12 = createPage(
  'd4-p12',
  'IPC',
  14,
  [
    'Compare pipes, FIFOs, message queues, shared memory, signals, and sockets',
    'Choose IPC mechanisms by latency, coupling, and topology needs',
    'Explain why shared memory needs synchronization',
    'Relate IPC to microservices and local RPC patterns',
  ],
  {
    prerequisites: ['d4-p5', 'd4-p11'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Inter-Process Communication lets processes exchange data or coordinate despite separate address spaces. Mechanisms differ in coupling, bandwidth, synchronization needs, and whether they work across machines.',
        ),
        table(
          ['Mechanism', 'Cross-machine?', 'Notes'],
          [
            ['Pipe / FIFO', 'No', 'Byte stream; pipe anonymous parent/child; FIFO named'],
            ['Unix domain socket', 'No', 'Stream/datagram locally; FD passing'],
            ['TCP/UDP socket', 'Yes', 'Network IPC / RPC substrate'],
            ['Shared memory', 'No*', 'Fastest large data; needs locks/atomics'],
            ['Message queue', 'No*', 'Structured messages; kernel buffered'],
            ['Signals', 'No', 'Async notifications; limited payload'],
            ['mmap file', 'Maybe', 'Share via FS; durability optional'],
          ],
          '*Networked variants exist as separate systems (Redis, MQ brokers)',
        ),
      ]),
      section('how', 'How it works', [
        code(
          'bash',
          `# Pipe: stdout of left → stdin of right
ps aux | grep nginx | awk '{print $2}'

# Named pipe
mkfifo /tmp/f
echo hello > /tmp/f &   # blocks until reader
cat /tmp/f

# Sockets mental model
ss -ltnp | head`,
          'Pipes are the most common “everyday IPC” for engineers',
        ),
        h3('Shared memory pattern'),
        ol([
          'Create/attach shm region (shm_open+mmap or SysV shmget).',
          'Agree on layout and synchronization (mutex in process-shared mode, atomics).',
          'Detach/unmap on exit; unlink when done.',
        ]),
        callout(
          'warning',
          'Shared memory without synchronization is just a cross-process race condition.',
          'Critical',
        ),
      ]),
      section('example', 'Worked example', [
        example('Choosing IPC', [
          ul([
            'Shell pipelines / producer-consumer text: pipes',
            'Local service API with multiple clients: Unix sockets',
            'High-volume market data between processes on one host: shared memory + ring buffer',
            'Async “something happened”: signals or eventfd',
            'Across hosts: sockets + serialization (gRPC/HTTP)',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Pipes: simple, copy through kernel, unidirectional (pair for bidirectional).',
          'Sockets: flexible, more setup; portable patterns.',
          'Shm: minimal copying, max footguns (lifetime, sync, ABI).',
          'Signals: not a general data channel; unsafe in handlers (async-signal-safety).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "I\'d pick pipes for streams, sockets for services, shm for bulk local data."'),
        p('Interviewer: "Why is shm fastest?"'),
        p(
          'Strong answer: "After setup, producers/consumers touch the same physical pages — no per-message kernel copy. The cost moves to synchronization and careful memory ordering."',
        ),
        p('Interviewer: "How do threads change the story?"'),
        p(
          'Strong answer: "Threads already share memory — IPC becomes synchronization. Processes need an explicit mechanism first."',
        ),
      ]),
    ],
    commonMistakes: [
      'Using signals to pass complex data.',
      'Forgetting CLOEXEC / inheritance quirks of FDs across exec.',
      'Assuming TCP localhost is as cheap as Unix sockets / shm (it is not).',
      'Ignoring backpressure — pipes and queues have finite capacity.',
    ],
    interviewQuestions: [
      'What is IPC?',
      'Pipe vs named pipe?',
      'Why synchronize shared memory?',
      'Signals vs pipes for communication?',
      'When prefer sockets over shared memory?',
    ],
    intermediateInterviewQuestions: [
      'How does FD passing over Unix sockets work conceptually?',
      'SysV vs POSIX IPC APIs?',
      'What is an eventfd?',
      'How do shell pipelines implement IPC?',
      'Message queue vs stream socket?',
    ],
    advancedInterviewQuestions: [
      'Design a lock-free SPSC ring buffer in shared memory.',
      'How do D-Bus / gRPC sit on top of sockets?',
      'Zero-copy strategies (splice, io_uring, mmap)?',
      'Security: why credential passing matters on Unix sockets?',
      'Compare IPC in microkernels vs monolithic kernels.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Compare common IPC mechanisms.',
        answer:
          'Pipes and Unix sockets move byte streams through the kernel—simple and safe for local streaming. Network sockets extend that across hosts. Shared memory maps the same pages into multiple processes for high bandwidth but requires explicit synchronization and careful lifecycle management. Message queues preserve message boundaries. Signals are lightweight notifications, not data pipes. Choose based on topology, performance, and how much structure and safety you need.',
      },
    ],
    keyTakeaways: [
      'Separate address spaces ⇒ need explicit IPC.',
      'Pipes/sockets copy; shm shares — sync required.',
      'Match mechanism to local vs remote and stream vs messages.',
      'Shell pipelines are IPC you already use daily.',
    ],
  },
)
