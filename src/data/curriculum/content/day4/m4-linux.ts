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

export const d4p13 = createPage(
  'd4-p13',
  'Linux Filesystem & Permissions',
  18,
  [
    'Navigate FHS landmarks (/etc, /var, /proc, /sys, /home, /usr)',
    'Interpret rwx bits for user/group/other and special bits',
    'Compute chmod numerical modes and reason about umask',
    'Use ls -l / stat / chown / chmod confidently',
  ],
  {
    prerequisites: ['d4-p11'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Linux follows the Filesystem Hierarchy Standard (FHS) by convention: configuration under /etc, variable data/logs under /var, user homes under /home, binaries under /usr, devices under /dev, and kernel/process APIs under /proc and /sys (virtual filesystems). Permissions are the first line of discretionary access control on files.',
        ),
        h3('Permission model'),
        p(
          'Each inode has mode bits for owner (user), group, and other: r(4) w(2) x(1). For directories, x means “traverse”; r means “list names”; w means “create/delete entries” (with sticky bit nuances on /tmp).',
        ),
        table(
          ['Octal', 'Symbolic', 'Meaning'],
          [
            ['7', 'rwx', 'read+write+execute'],
            ['6', 'rw-', 'read+write'],
            ['5', 'r-x', 'read+execute'],
            ['4', 'r--', 'read only'],
            ['0', '---', 'none'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Special bits'),
        ul([
          'setuid (4xxx): execute as file owner (e.g., passwd) — powerful, audited carefully',
          'setgid (2xxx): execute as group / new files inherit dir group',
          'sticky (1xxx): on directories, only file owner (or root) can delete their files (/tmp)',
        ]),
        h3('umask'),
        p(
          'umask subtracts permissions from defaults. Common default create mode 666 for files and 777 for dirs before umask. Effective = requested & ~umask.',
        ),
        code(
          'bash',
          `ls -l /etc/passwd
stat -c '%a %A %U %G %n' /etc/passwd
# Change mode
chmod 640 secret.txt          # rw-r-----
chmod u+x deploy.sh           # symbolic
chmod -R g-w project/         # recursive remove group write
# Ownership
sudo chown app:app /var/lib/app -R
# umask
umask                         # e.g. 0022
umask 027                     # stricter for shared hosts`,
          'Daily permission toolkit',
        ),
      ]),
      section('example', 'Worked example', [
        numerical({
          title: 'chmod octal calculation',
          problem:
            'You want owner rwx, group r-x, other ---. What chmod octal do you use? What does ls -l show?',
          given: 'user=rwx(7), group=r-x(5), other=---(0)',
          formula: 'octal = u*100 + g*10 + o*1 in octal digits; or 4r+2w+1x per triad',
          steps: 'u=7, g=5, o=0 → 750\nls -l: -rwxr-x---',
          answer: 'chmod 750; mode string -rwxr-x---',
          shortcut: 'Memorize 4/2/1 and common modes 755, 644, 640, 700.',
          mistake: 'Using 570 when you meant 750 (swapping user/group).',
        }),
        numerical({
          title: 'umask effect',
          problem:
            'Default file create bits 666, umask 027. What permissions does a new file get?',
          given: 'base 666, umask 027',
          formula: 'mode = base & ~umask (bitwise)',
          steps:
            '666 octal = rw-rw-rw-\numask 027 clears group-write and all other bits\n666 & ~027 = 640 → rw-r-----',
          answer: '640 (rw-r-----)',
          shortcut: 'umask 022 → files 644; umask 077 → files 600.',
          mistake: 'Subtracting decimal instead of thinking in permission bits.',
        }),
        numerical({
          title: 'Directory sticky bit',
          problem:
            'Directory mode shows drwxrwxrwt. Interpret the last t and why /tmp uses it.',
          given: 'others have rwx plus sticky',
          formula: 'sticky on dir: delete/rename only if you own the file (or dir) or are privileged',
          steps:
            't means execute for other + sticky (T would mean sticky without x)\nPrevents users from deleting each other\'s files in a world-writable directory',
          answer: 'World-writable shared dir with sticky delete protection — classic /tmp',
          shortcut: 'Remember: sticky → “stick to your own files” in /tmp.',
          mistake: 'Thinking sticky makes files undeletable by their owner.',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Too-open perms (777/666) are a common audit finding.',
          'setuid binaries expand attack surface — prefer capabilities where possible.',
          'ACLs (getfacl/setfacl) extend beyond ugo when needed.',
          '/proc and /sys are not “disk files” — writes can alter kernel behavior (carefully).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Permissions are rwx for user, group, other; chmod sets them."'),
        p('Interviewer: "What does execute mean on a directory?"'),
        p(
          'Strong answer: "Permission to traverse — resolve names inside. Without x you cannot cd or access children even if you know the name, depending on path checks."',
        ),
        p('Interviewer: "How does umask interact with 666?"'),
        p(
          'Strong answer: "Kernel takes the requested mode and clears bits present in umask. With 022, files become 644."',
        ),
      ]),
    ],
    commonMistakes: [
      'chmod 777 as a “fix” for permission errors.',
      'Forgetting directories need x to be entered.',
      'Confusing group ownership with ACLs.',
      'Ignoring that root bypasses DAC checks (still constrained by other mechanisms).',
    ],
    interviewQuestions: [
      'What does chmod 644 mean?',
      'Interpret -rwxr-x---.',
      'What is umask?',
      'What is the sticky bit on /tmp?',
      'What lives in /proc?',
    ],
    intermediateInterviewQuestions: [
      'setuid vs setgid?',
      'Why is execute needed on directories?',
      'Difference between /etc and /var?',
      'How do ACLs differ from ugo bits?',
      'What does chown root:root and chmod 600 protect?',
    ],
    advancedInterviewQuestions: [
      'How do namespaces + bind mounts change path meaning?',
      'Explain immutable attribute (chattr +i) vs mode bits.',
      'How do Linux capabilities reduce need for setuid?',
      'NFS root_squash interaction with UIDs?',
      'seccomp vs file permissions?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain Linux file permissions and chmod numerics.',
        answer:
          'Each file has user/group/other permission triads built from r=4, w=2, x=1. chmod 750 means owner full, group read+execute, other nothing. Directories use x for traversal. umask clears bits from default create modes so new files are not world-writable. Special bits setuid/setgid/sticky handle privilege elevation and /tmp delete rules. In interviews, also mention that /proc and /sys are virtual and that least privilege beats chmod 777.',
      },
    ],
    keyTakeaways: [
      'FHS gives you a mental map of a Linux box.',
      'Octal modes are interview bread-and-butter — practice conversions.',
      'umask shapes default security of new files.',
      'Special bits have precise semantics — especially sticky on directories.',
    ],
  },
)

export const d4p14 = createPage(
  'd4-p14',
  'Processes: ps, top, htop, jobs',
  14,
  [
    'Read ps output (PID, PPID, STAT, %CPU, COMMAND)',
    'Use top/htop to find CPU and memory hogs',
    'Manage shell jobs: &, fg, bg, Ctrl-Z, kill',
    'Map signals (SIGTERM/SIGKILL/SIGHUP) to behavior',
  ],
  {
    prerequisites: ['d4-p2'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Observability of processes is how OS theory meets production. ps snapshots the process table; top/htop sample continuously; shell job control manages foreground/background process groups tied to a terminal.',
        ),
      ]),
      section('how', 'How it works', [
        code(
          'bash',
          `# Snapshots
ps aux --sort=-%cpu | head
ps -ef | grep nginx
ps -o pid,ppid,stat,rss,cmd -p $(pgrep -d, sshd)

# Live
top -o %CPU
# htop if installed — trees, search, kill from UI

# Job control
sleep 300 &
jobs -l
fg %1
# Ctrl-Z suspends → then:
bg %1
kill -TERM %1
nohup longjob.sh >out.log 2>&1 &   # survive hangup`,
          'Core process inspection & job control',
        ),
        table(
          ['Signal', 'Default', 'Use'],
          [
            ['SIGTERM (15)', 'Terminate', 'Polite shutdown — preferred'],
            ['SIGKILL (9)', 'Kill (uncatchable)', 'Last resort'],
            ['SIGHUP (1)', 'Hangup', 'Reload many daemons / kill tty jobs'],
            ['SIGSTOP/CONT', 'Stop/continue', 'Job control; not catchable STOP'],
            ['SIGINT (2)', 'Interrupt', 'Ctrl-C foreground'],
          ],
        ),
        callout(
          'tip',
          'STAT codes: R runnable, S sleep, D uninterruptible, Z zombie, T stopped, < high priority, N nice, l multithreaded.',
          'ps STAT cheat sheet',
        ),
      ]),
      section('example', 'Worked example', [
        example('Zombie hunt', [
          code(
            'bash',
            `ps aux | awk '$8 ~ /Z/ {print}'
# Zombies die when parent wait()s or when reparented to init/systemd after parent exits`,
            'Zombies hold almost no RAM — they hold an exit code slot',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'kill -9 skips cleanup handlers — can leave IPC/temp files; prefer TERM then wait.',
          'top’s %CPU can exceed 100% on multicore (per-process sum of cores).',
          'RSS vs VSZ: resident vs virtual mapping size — don’t panic at large VSZ.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "I use ps/top to find who burns CPU; kill -TERM first."'),
        p('Interviewer: "What is a zombie?"'),
        p(
          'Strong answer: "A process that has exited but whose parent has not yet waited on it. It keeps a PCB stub for the exit status. Fix the parent, not kill -9 the zombie."',
        ),
      ]),
    ],
    commonMistakes: [
      'kill -9 as first reaction.',
      'Grepping ps and accidentally matching the grep process without care.',
      'Confusing job IDs (%1) with PIDs.',
      'Thinking RSS is exclusive private memory (shared pages complicate it).',
    ],
    interviewQuestions: [
      'How do you list all processes?',
      'Difference between kill and kill -9?',
      'What does Ctrl-Z do?',
      'What is a zombie process?',
      'How do you find the process using the most CPU?',
    ],
    intermediateInterviewQuestions: [
      'Explain ps STAT field values.',
      'fg/bg/jobs workflow?',
      'What does nohup change?',
      'PPID of an orphaned process?',
      'RSS vs VSZ?',
    ],
    advancedInterviewQuestions: [
      'How does systemd relate to reaping zombies?',
      'cgroups visibility in top/htop?',
      'How do you map a port to a PID? (preview ss/lsof)',
      'Thread view: ps -L / top -H?',
      'Nice vs realtime priorities?',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you inspect and manage Linux processes?',
        answer:
          'I start with ps or top/htop to see PID, parent, state, and CPU/RSS. For runaway jobs I send SIGTERM, wait, then SIGKILL if needed. Shell job control uses &, Ctrl-Z, bg/fg for interactive work; nohup or systemd for longevity. I can explain STAT codes and that zombies need a waiting parent. Trade-off: forceful kills recover the CPU quickly but skip graceful cleanup.',
      },
    ],
    keyTakeaways: [
      'ps = snapshot; top/htop = live.',
      'TERM then KILL; know signal semantics.',
      'Job control ≠ system service management (systemd).',
      'STAT letters connect to OS process states.',
    ],
  },
)

export const d4p15 = createPage(
  'd4-p15',
  'grep, awk, sed, Pipes & Redirection',
  18,
  [
    'Compose pipelines to filter and transform text/logs',
    'Use grep/ripgrep patterns, awk columns, sed substitutions',
    'Master >, >>, 2>, 2>&1, <, and /dev/null',
    'Reason about PATH and environment variables',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Unix philosophy: small tools + pipes. For interviews and on-call, fluency with grep/awk/sed and redirection separates “I’ve read man pages” from “I can slice a 2 GB log now.”',
        ),
      ]),
      section('how', 'How it works', [
        code(
          'bash',
          `# grep
grep -RIn --exclude-dir=node_modules 'TODO' .
grep -E 'ERROR|FATAL' app.log | tail -50
# count matching lines
grep -c 'Timeout' app.log

# awk — column processing
ps aux | awk 'NR==1 || $3>50.0 {print $2,$3,$11}'
awk -F, '{sum+=$3} END{print sum}' data.csv

# sed — stream edit
sed -n '100,120p' app.log
sed 's/foo/bar/g' file.txt

# Redirection
cmd >out.txt           # stdout truncate
cmd >>out.txt          # append
cmd 2>err.txt          # stderr
cmd >both.txt 2>&1     # merge stderr into stdout
cmd </input.txt
cmd >/dev/null 2>&1    # silence

# Pipeline
journalctl -u nginx --since today | grep error | awk '{print $5}' | sort | uniq -c | sort -nr | head`,
          'Patterns you will actually type on-call',
        ),
        h3('PATH & environment'),
        code(
          'bash',
          `echo $PATH
which python3
export APP_ENV=prod
env | grep APP_
# Dangerous: world-writable dirs early in PATH → trojan binaries`,
          'Commands resolve via PATH search order',
        ),
      ]),
      section('example', 'Worked example', [
        example('Interview live-coding style', [
          p(
            'Q: From access.log (Apache/Nginx combined), find top 10 IPs. A: awk \'{print $1}\' access.log | sort | uniq -c | sort -nr | head.',
          ),
        ]),
        callout(
          'mistake',
          'cmd > file 2>&1 is not the same order-insensitive — redirect stdout first, then point stderr at stdout.',
          'Redirection order',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'awk vs cut: awk for fields/logic; cut for simple delimiters.',
          'sed vs editor: sed for scripted transforms; not for interactive large edits.',
          'Pipelines run concurrently — beware partial buffering and SIGPIPE.',
          'Locale/UTF-8 can affect sort/grep — set LC_ALL=C for speed/byte semantics.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "I\'d pipeline grep into awk to extract fields, then sort | uniq -c."'),
        p('Interviewer: "How do you keep stderr?"'),
        p(
          'Strong answer: "Merge with 2>&1 into the pipe: cmd 2>&1 | tee all.log — or capture separately."',
        ),
      ]),
    ],
    commonMistakes: [
      'grep then cat file | grep — useless use of cat.',
      'Forgetting -n/-R flags when needed.',
      'Writing sed that only works on GNU vs BSD differences without care.',
      'Assuming pipelines buffer entire output before next stage.',
    ],
    interviewQuestions: [
      'What does the pipe operator do?',
      'Difference between > and >>?',
      'How do you redirect stderr?',
      'What is awk good for?',
      'What does PATH control?',
    ],
    intermediateInterviewQuestions: [
      'Explain 2>&1 order.',
      'Write a pipeline for top log IPs.',
      'grep -E vs -F?',
      'How does xargs relate to pipes?',
      'What is /dev/null used for?',
    ],
    advancedInterviewQuestions: [
      'How does SIGPIPE affect writers in a pipeline?',
      'When prefer jq over awk for JSON logs?',
      'Binary data hazards with line-based tools?',
      'How do process substitutions <(cmd) work?',
      'Performance: sort external merge vs in-memory?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Show how you analyze logs with Unix tools.',
        answer:
          'I stream logs through filters rather than opening them in an editor. grep/rg narrows to relevant lines; awk extracts fields; sort | uniq -c ranks frequencies; head shows the top offenders. Redirection captures stdout/stderr for artifacts. Pipes let stages run concurrently with backpressure via kernel pipe buffers. Trade-off: one-liners are fast for exploration but should become scripts when reused.',
      },
    ],
    keyTakeaways: [
      'Pipes compose filters; redirection controls streams.',
      'grep find, awk fields, sed substitute — know one strong pattern each.',
      '2>&1 ordering matters.',
      'PATH decides which binary you actually run.',
    ],
  },
)

export const d4p16 = createPage(
  'd4-p16',
  'SSH, curl, ss, lsof',
  14,
  [
    'Use SSH for remote shells and tunnels at a basic safe level',
    'Debug HTTP with curl status/headers/body flags',
    'Inspect listening sockets and connections with ss',
    'Map ports and files to processes with lsof',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Networked debugging tools answer: Can I reach it? What is listening? Which process owns this port or file? SSH authenticates and encrypts remote access; curl is the HTTP Swiss army knife; ss replaces much of netstat; lsof answers “who has this open?”',
        ),
      ]),
      section('how', 'How it works', [
        code(
          'bash',
          `# SSH
ssh user@host
ssh -i ~/.ssh/id_ed25519 user@host
scp file user@host:/tmp/
# Local port forward: local 8080 → remote localhost:80
ssh -L 8080:127.0.0.1:80 user@host

# curl
curl -I https://example.com              # headers only
curl -sS -o /tmp/b -w '%{http_code}\\n' https://example.com
curl -X POST -H 'Content-Type: application/json' -d '{"a":1}' http://localhost:8080/api
curl -v --max-time 5 http://127.0.0.1:8080/health

# ss — sockets
ss -ltnp          # listening TCP with processes
ss -s             # summary
ss -tp dst 1.2.3.4:443

# lsof
lsof -i :8080
lsof -p 1234 | head
lsof /var/log/app.log`,
          'Reachability + ownership toolkit',
        ),
        callout(
          'info',
          'Prefer ss over netstat on modern Linux. Know both names in interviews.',
          'Vocabulary',
        ),
      ]),
      section('example', 'Worked example', [
        example('“Port already in use”', [
          ol([
            'ss -ltnp | grep 8080 (or lsof -i :8080)',
            'Identify PID/command',
            'Decide: stop service, change port, or kill politely',
            'Confirm with curl -v localhost:8080/health',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'SSH tunnels are great for debug; don’t become undocumented production networking.',
          'curl -k disables TLS verify — emergency only.',
          'lsof can be slow on huge FD tables; ss is tighter for sockets.',
          'Containers: tools in host vs container namespaces differ — may need nsenter/docker exec.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "ss -ltnp shows listeners; lsof -i :port maps the process."'),
        p('Interviewer: "ESTABLISHED vs LISTEN?"'),
        p(
          'Strong answer: "LISTEN means accepting new connections on a local socket. ESTABLISHED is an active connection with a peer. TIME_WAIT is normal after active close."',
        ),
      ]),
    ],
    commonMistakes: [
      'Using telnet-only mental model when curl -v is clearer for HTTP.',
      'Forgetting -p/-n flags and not seeing process names (needs privileges sometimes).',
      'Assuming localhost from host reaches process only bound in a container network namespace.',
      'Leaving world-open SSH agent forwards carelessly.',
    ],
    interviewQuestions: [
      'How do you copy a file over SSH?',
      'How do you see what is listening on port 443?',
      'Useful curl flags for debugging?',
      'ss vs netstat?',
      'How do you find which process writes to a log file?',
    ],
    intermediateInterviewQuestions: [
      'Explain SSH local vs remote port forwarding.',
      'What does TIME_WAIT mean?',
      'curl exit codes / -f behavior?',
      'How to show Unix domain sockets with ss?',
      'lsof + deleted-but-open files for disk space?',
    ],
    advancedInterviewQuestions: [
      'How do network namespaces affect ss output?',
      'Diagnose TLS handshake failures with curl -v / openssl s_client (high level)?',
      'SO_REUSEADDR vs SO_REUSEPORT conceptually?',
      'How does ssh ProxyJump work?',
      'eBPF alternatives to classic socket debugging?',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you debug a service that will not accept connections?',
        answer:
          'I check the process is up (ps/systemctl), then ss -ltnp for the expected bind address/port—binding to 127.0.0.1 vs 0.0.0.0 matters. I curl -v locally to see TCP/HTTP errors, and lsof -i :port to confirm ownership. Remote access uses SSH; I verify firewall/security groups separately. Trade-off: restarting quickly vs capturing evidence (logs, ss state) first.',
      },
    ],
    keyTakeaways: [
      'SSH for remote + tunnels; curl for HTTP truth.',
      'ss answers socket state; lsof links resources to PIDs.',
      'Bind address mistakes are classic outage causes.',
      'Privilege/namespaces affect what these tools show.',
    ],
  },
)

export const d4p17 = createPage(
  'd4-p17',
  'Disk, Memory, Logs & systemd',
  16,
  [
    'Check disk with df/du and inodes',
    'Read memory pressure with free /proc/meminfo',
    'Find logs via journalctl and classic /var/log',
    'Control services with systemctl start/stop/status/enable',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Production debugging triangle: CPU (earlier), memory, disk — plus “is the service supposed to be running?” systemd is the init system/service manager on most modern Linux distros; journald collects logs.',
        ),
      ]),
      section('how', 'How it works', [
        code(
          'bash',
          `# Disk
df -h
df -i                 # inode exhaustion — empty dirs can still fail creates
du -sh /var/log/* | sort -h | tail
# Find large files
du -ah /var | sort -h | tail -20

# Memory
free -h
cat /proc/meminfo | egrep 'MemAvailable|Cached|Swap'
vmstat 1 5

# Logs
journalctl -u nginx -n 100 --no-pager
journalctl -p err -Since '1 hour ago'
less /var/log/syslog   # distro-dependent paths

# systemd
systemctl status nginx
sudo systemctl restart nginx
systemctl is-enabled nginx
systemctl cat nginx    # show unit file
systemctl list-units --failed`,
          'Disk, RAM, logs, services — the ops quartet',
        ),
        h3('Unit types (interview)'),
        ul([
          '.service — long-running daemons',
          '.timer — cron-like scheduling',
          '.socket — socket activation',
          'dependencies: After=, Requires=, Wants=',
        ]),
      ]),
      section('example', 'Worked example', [
        example('Disk full postmortem sketch', [
          ol([
            'Application writes fail with ENOSPC',
            'df -h shows / full; df -i checks inodes',
            'du finds /var/log/app growth',
            'Truncate/rotate logs; fix retention; restart if needed',
            'Check if deleted-open files still hold space: lsof | grep deleted',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'MemAvailable is better than free for “how much can I start?” on Linux.',
          'Swap can hide memory pressure until latency explodes.',
          'journald vacuum vs persistent storage configuration.',
          'Restarting clears bad state but destroys evidence — capture first when safe.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "df for filesystems, du for directories, journalctl for unit logs."'),
        p('Interviewer: "Service fails just after boot — what next?"'),
        p(
          'Strong answer: "systemctl status and journalctl -u service -b for this boot; check After= dependencies and Exit codes in the unit status."',
        ),
      ]),
    ],
    commonMistakes: [
      'Cleaning disk without checking open-deleted files.',
      'Looking only at free memory and ignoring cache/available.',
      'tailing the wrong log when journald is the source of truth.',
      'systemctl enable vs start confusion (enable = on boot).',
    ],
    interviewQuestions: [
      'df vs du?',
      'How do you check free memory?',
      'How do you view logs for a systemd service?',
      'systemctl restart vs reload?',
      'What is inode exhaustion?',
    ],
    intermediateInterviewQuestions: [
      'How do you find what filled the disk?',
      'What is MemAvailable?',
      'How do timers differ from cron?',
      'How to persist journald logs?',
      'What does systemctl cat show?',
    ],
    advancedInterviewQuestions: [
      'cgroup memory limits vs free output?',
      'How does OOM killer choose victims?',
      'systemd sandboxing directives (ProtectSystem, NoNewPrivileges) at high level?',
      'XFS/ext4 ENOSPC nuances?',
      'Correlate deploy time with journalctl --since?',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you troubleshoot disk and service failures on Linux?',
        answer:
          'For disk: df -h and df -i, then du to locate growth, and lsof for deleted-but-held files. For memory: free -h / MemAvailable and watch swap. For services: systemctl status and journalctl -u … to see exit codes and dependency failures. I prefer gathering evidence before blind restarts. Trade-off: aggressive log deletion recovers space quickly but may erase forensic data.',
      },
    ],
    keyTakeaways: [
      'df filesystem, du tree, df -i inodes.',
      'journalctl is first-class on systemd hosts.',
      'enable ≠ start; status + journal explain failures.',
      'Deleted open files can “eat” disk invisibly to du.',
    ],
  },
)

export const d4p18 = createPage(
  'd4-p18',
  'Linux Process Debugging',
  18,
  [
    'Execute a 100% CPU investigation playbook end-to-end',
    'Explain fork/exec/wait and how shells launch programs',
    'Use /proc, strace, and thread views to localize faults',
    'Connect OS concepts (states, syscalls, VM) to tooling answers',
  ],
  {
    prerequisites: ['d4-p14', 'd4-p2', 'd4-p1'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Interviewers often ask you to narrate debugging like an SRE: hypothesis → evidence → action. A “CPU 100%” incident is the perfect storyline because it ties scheduling, threads, syscalls, and profiling vocabulary together.',
        ),
        h3('fork / exec / wait (must-know)'),
        ul([
          'fork: create child (COW address space)',
          'exec: replace image with a new program',
          'wait/waitpid: parent reaps exit status (avoids zombies)',
          'Shells: fork → child execs command; parent waits for foreground jobs',
        ]),
        diagram(
          `sequenceDiagram
    participant Shell
    participant Child
    participant Kernel
    Shell->>Kernel: fork()
    Kernel-->>Shell: child pid
    Kernel-->>Child: 0
    Child->>Kernel: execve("cmd")
    Note over Child: Address space replaced
    Shell->>Kernel: waitpid()
    Child->>Kernel: exit(status)
    Kernel-->>Shell: status`,
          'How a shell runs an external command',
        ),
      ]),
      section('how', 'How it works', [
        h3('Playbook: process stuck at ~100% CPU'),
        ol([
          'Confirm: top/htop — which PID? one core or all? user vs system time?',
          'Identify: ps -o pid,ppid,stat,wchan,cmd -p PID; check threads with top -H -p PID or ps -L.',
          'Is it runnable compute or livelock? STAT R vs continuous futex waits with low CPU means lock contention, not CPU burn.',
          'Sample stacks: perf top -p PID (or pstack/gdb thread apply all bt if allowed).',
          'Syscall view: strace -p PID -f -c (summary) or timed samples — spinning without syscalls ⇒ tight userspace loop.',
          'Recent change: deploys, traffic spikes, GC flags, regex catastrophic backtracking, accidental busy-wait.',
          'Mitigate: scale out, restart with evidence captured, rate-limit input, fix code path.',
          'Prevent: CPU cgroup limits, alerts on CPU, load tests, timeouts on loops.',
        ]),
        code(
          'bash',
          `PID=$(pgrep -n myapp)
top -H -p "$PID"
ps -L -p "$PID" -o pid,lwp,stat,pcpu,comm --sort=-pcpu | head
# Syscall summary for 10s (interrupt with Ctrl-C)
timeout 10 strace -f -c -p "$PID" 2>&1 || true
# /proc details
ls /proc/$PID/fd | wc -l
cat /proc/$PID/status | egrep 'State|Threads|VmRSS|Cpus_allowed'
cat /proc/$PID/wchan
# Native stacks if perf permitted
# perf top -p $PID`,
          'Evidence pack for a hot process',
        ),
      ]),
      section('example', 'Worked example', [
        example('Busy loop vs blocking', [
          p(
            'Service A: 100% user CPU, strace shows almost no syscalls → tight loop / bad algorithm / spin. Service B: low CPU, many threads in futex_wait → lock contention or thread pool exhaustion. Service C: high system CPU → kernel time from heavy I/O, networking, or page faults (check /proc/vmstat pgfault).',
          ),
        ]),
        callout(
          'tip',
          'Verbal structure: Observe → Localize (process/thread) → Classify (compute vs I/O vs lock) → Evidence (stack/strace) → Mitigate → Root cause.',
          'Interview delivery',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'strace -p slows the target — short samples in prod.',
          'gdb attach pauses threads — use carefully.',
          'Containers: debug from inside or with elevated host tools + PID namespace awareness.',
          'Killing the process recovers capacity but may lose the only reproduction.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'STAT/wchan ↔ process states (p2).',
          'Threads sharing address space ↔ races (p5) when CPU burn is a spin on a flag.',
          'Page faults ↔ VM (p9) when system CPU + disk spike together.',
          'systemd restart ↔ service supervision (p17).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "I\'d find the PID, inspect threads, then strace/perf to see if it\'s userspace spin or kernel time."'),
        p('Interviewer: "How does the shell start ls?"'),
        p(
          'Strong answer: "Shell forks a child; the child execs /bin/ls; the parent waitpids for foreground. That’s why builtins don’t fork the same way."',
        ),
        p('Interviewer: "fork without exec?"'),
        p(
          'Strong answer: "Used when the child should continue running the same program image — e.g., prefork servers — with care about threads and COW costs."',
        ),
      ]),
    ],
    commonMistakes: [
      'Blaming “Linux scheduling bug” before checking the app stack.',
      'Using only kill -9 with no diagnosis.',
      'Interpreting high load average without separating runnable vs D-state I/O wait.',
      'Forgetting multithreaded view (one hot LWP).',
    ],
    interviewQuestions: [
      'What does fork do? What does exec do?',
      'How does a shell run an external command?',
      'How do you debug 100% CPU usage?',
      'What is strace used for?',
      'Where do you look under /proc for a process?',
    ],
    intermediateInterviewQuestions: [
      'How do you tell CPU spin from lock contention?',
      'What does waitpid prevent?',
      'perf top vs strace?',
      'How do you inspect thread CPU inside one process?',
      'What is wchan?',
    ],
    advancedInterviewQuestions: [
      'How do you debug CPU in a container on a noisy neighbor node?',
      'Explain copy-on-write faults after fork in a large JVM.',
      'How would you capture a core dump safely?',
      'Relate CFS throttling (cgroup cpu.max) to observed %CPU.',
      'Design an on-call runbook for hot loops in production.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Walk me through debugging a process at 100% CPU.',
        answer:
          'Confirm with top which PID and whether time is user or system. Check thread view for a single hot LWP. Use wchan/STAT to see if it’s truly runnable. Sample with strace -c or perf to classify userspace spin vs syscall-heavy vs fault-heavy. Capture stacks before restarting. Root causes are often busy-wait, pathological input, tight GC/regex, or unexpected hot paths after deploy. fork/exec knowledge matters when the hot process is a child of a supervisor/shell. Trade-off: invasive tools add overhead; start with /proc and short samples.',
      },
    ],
    keyTakeaways: [
      'Playbook structure beats random command firing.',
      'fork/exec/wait is the creation story of Unix processes.',
      'Classify: compute spin vs syscalls vs locks vs paging.',
      'Tie tools back to PCB, states, and VM vocabulary for strong interviews.',
    ],
  },
)
