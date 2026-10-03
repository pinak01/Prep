import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  ol,
  table,
  callout,
  diagram,
  example,
  numerical,
} from '../../../helpers'

export const d3p8: StudyPage = createPage(
  'd3-p8',
  'TCP vs UDP',
  12,
  [
    'Compare connection-oriented TCP with connectionless UDP',
    'Choose TCP vs UDP for common application scenarios with justification',
    'Explain ports, multiplexing, and what each protocol guarantees',
  ],
  {
    prerequisites: ['d3-p2'],
    sections: [
      section('concept', 'Concept', [
        p(
          'TCP (Transmission Control Protocol) provides reliable, ordered, byte-stream delivery between processes with congestion and flow control. UDP (User Datagram Protocol) provides best-effort, message-oriented datagrams with minimal overhead — no connection setup, no reliability, no congestion control in the protocol itself.',
        ),
        h3('Why both exist'),
        p(
          'Not every app wants TCP\'s guarantees. Video calls prefer timely frames over retransmitting stale data. DNS wants a tiny request/response without handshake RTT. TCP shines for file transfer, HTTP (until HTTP/3), email — correctness over raw latency.',
        ),
        table(
          ['Property', 'TCP', 'UDP'],
          [
            ['Connection', '3-way handshake', 'None'],
            ['Reliability', 'ACKs, retransmit', 'None'],
            ['Ordering', 'Byte stream reassembly', 'Per-datagram only'],
            ['Flow control', 'Yes (rwnd)', 'No'],
            ['Congestion control', 'Yes', 'No (app/QUIC may)'],
            ['Header overhead', 'Larger (20B+)', '8 bytes'],
            ['Use cases', 'HTTP/1–2, SSH, DB clients', 'DNS, VoIP, games, QUIC, DHCP'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Ports & multiplexing'),
        p(
          'Both use 16-bit source and destination ports. A TCP connection is a 4-tuple (srcIP, srcPort, dstIP, dstPort) — or 5-tuple including protocol. UDP sockets are identified similarly but without connection state machine. Well-known ports: 80/443, 53, 22, etc. Ephemeral ports for clients.',
        ),
        h3('TCP = byte stream'),
        p(
          'TCP does not preserve application write boundaries. Two 100-byte writes may arrive as one 200-byte read. Apps use length prefixes or delimiters. UDP preserves datagram boundaries (up to size limits).',
        ),
        diagram(
          `flowchart TB
  App1[Application needing correctness] --> TCP[TCP]
  App2[Application needing low latency / simple request-response] --> UDP[UDP]
  TCP --> IP[IP best effort]
  UDP --> IP
  IP --> Net[Network may drop reorder delay]`,
          'Both ride best-effort IP; TCP adds reliability at endpoints',
        ),
        callout(
          'tip',
          'HTTP/3 uses QUIC over UDP — not because reliability is unwanted, but to implement it in user space with TLS integrated and better loss recovery/migration than ossified TCP middleboxes allow.',
          'Modern wrinkle',
        ),
      ]),
      section('example', 'Worked example', [
        example('Protocol choice drill', [
          ul([
            'Banking API: TCP (HTTPS) — need reliability and TLS.',
            'Live multiplayer position updates: UDP — drop old state rather than stall.',
            'DNS query: UDP primarily; TCP for large/zone transfers.',
            'Video streaming (Netflix-style): often TCP/HTTP(S) or QUIC — buffering absorbs jitter; not the same as interactive VoIP.',
            'VoIP: UDP + app-level jitter buffer + optional FEC.',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'TCP head-of-line blocking: one lost packet delays subsequent bytes in that connection (HTTP/2 multiplex suffers; HTTP/3/QUIC improves stream isolation).',
          'UDP apps must reinvent reliability carefully or cause congestion collapse — be kind to the network.',
          'NATs handle TCP differently from UDP timeouts; UDP mappings often expire sooner.',
          'Checksum: UDP checksum optional in IPv4 (mandatory IPv6); TCP checksum mandatory.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Next pages: TCP handshake, reliability, congestion — the cost of TCP\'s guarantees.',
          'HTTP historically TCP; DNS/DHCP often UDP.',
          'Load balancers: L4 decisions on TCP/UDP 5-tuples.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "TCP is reliable and connection-oriented; UDP is unreliable and connectionless."'),
        p('Interviewer: "What does reliable mean precisely?"'),
        p(
          'Strong answer: "TCP detects loss via ACKs/timeouts/duplicate ACKs, retransmits, delivers a contiguous ordered byte stream to the app, and avoids overwhelming receiver and network via flow and congestion control. It does not guarantee latency or that the app won\'t disconnect."',
        ),
        p('Interviewer: "Why use UDP for DNS?"'),
        p(
          'Strong answer: "Most queries fit one packet; handshake would add RTT; loss is rare and client retries are cheap. TCP is available when needed for size or reliability of zone data."',
        ),
        p('Interviewer: "Is UDP always faster?"'),
        p(
          'Strong answer: "Lower overhead and no handshake help, but if the app then builds TCP-like reliability poorly, it can be slower or unfair. Choose based on semantics, not the myth that UDP equals speed."',
        ),
      ]),
    ],
    commonMistakes: [
      'Saying UDP is "faster" without explaining missing features.',
      'Claiming TCP guarantees timely delivery.',
      'Thinking TCP preserves message boundaries.',
      'Forgetting both use ports for process demux.',
    ],
    interviewQuestions: [
      'Compare TCP and UDP on reliability, connection, and ordering.',
      'Give three use cases for UDP and three for TCP.',
      'What is a port number?',
      'Does TCP preserve application message boundaries?',
      'Which protocol does DNS typically use and why?',
    ],
    intermediateInterviewQuestions: [
      'What is head-of-line blocking in TCP?',
      'Why does HTTP/3 run over UDP?',
      'Explain the TCP 4-tuple / 5-tuple.',
      'How do NATs treat TCP vs UDP differently?',
      'What must a reliable UDP application implement itself?',
    ],
    advancedInterviewQuestions: [
      'Compare TCP byte-stream vs message-oriented transports (SCTP/QUIC streams).',
      'How can UDP-based apps implement congestion control responsibly?',
      'Explain TCP fair sharing vs a greedy UDP video stream on a bottleneck.',
      'When would you choose TCP_NODELAY / disable Nagle, and why?',
      'How does multipath or connection migration differ in QUIC vs TCP?',
    ],
    interviewReadyAnswers: [
      {
        question: 'When do you choose TCP vs UDP?',
        answer:
          'Choose TCP when you need a reliable ordered byte stream, congestion control, and simple app logic — web APIs, file transfer, SSH. Choose UDP when you want low overhead, datagram boundaries, or to control timing yourself — DNS, DHCP, VoIP, games — accepting loss or handling it in the app. QUIC shows UDP can still host reliability. TRADE-OFF: TCP convenience vs latency/control; UDP flexibility vs reinventing safety and being network-friendly.',
      },
    ],
    keyTakeaways: [
      'TCP: reliable ordered byte stream + flow/congestion control; connection setup cost.',
      'UDP: minimal datagram service; app owns reliability and congestion.',
      'Ports multiplex many apps onto one IP.',
      'Pick based on delivery semantics, not slogans about speed.',
    ],
  },
)

export const d3p9: StudyPage = createPage(
  'd3-p9',
  'TCP Handshake & Termination',
  14,
  [
    'Explain the three-way handshake and connection state purpose',
    'Explain why a two-way handshake is insufficient',
    'Describe four-way termination, TIME_WAIT, and HALF-CLOSE',
  ],
  {
    prerequisites: ['d3-p8'],
    sections: [
      section('concept', 'Concept', [
        p(
          'TCP establishes a connection with a three-way handshake (SYN, SYN-ACK, ACK) to agree on initial sequence numbers and ensure both sides are ready. Termination is a four-way exchange of FINs and ACKs (or variants) because each direction of the byte stream closes independently.',
        ),
        h3('Why handshake exists'),
        p(
          'Sequence numbers must be synchronized so data and ACKs make sense. Both peers need evidence the other can receive. Old duplicate SYNs from previous incarnations must not create false connections — classic reason against naive two-way handshake.',
        ),
      ]),
      section('how', 'How it works', [
        h3('Three-way handshake'),
        ol([
          'Client → Server: SYN, seq=x (client ISN), options (MSS, window scale, SACK…).',
          'Server → Client: SYN-ACK, seq=y (server ISN), ack=x+1.',
          'Client → Server: ACK, ack=y+1. Connection ESTABLISHED on both ends.',
        ]),
        diagram(
          `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: SYN seq=x
  Note over S: LISTEN → SYN_RCVD
  S->>C: SYN seq=y ACK ack=x+1
  Note over C: SYN_SENT → ESTABLISHED
  C->>S: ACK ack=y+1
  Note over S: SYN_RCVD → ESTABLISHED`,
          'TCP three-way handshake with state transitions',
        ),
        h3('Why not two-way?'),
        p(
          'Suppose only SYN and SYN-ACK. A delayed duplicate SYN from an old connection could open a new connection the client never intended, and the server would believe a session exists. The client\'s final ACK proves the client is live in this incarnation and acknowledges the server ISN. Also both sides exchange ISNs — two segments cannot fully confirm bidirectional sync in the presence of duplicates. (Interview answer: synchronize ISNs both ways + protect against old duplicate SYNs.)',
        ),
        h3('Termination (four-way)'),
        ol([
          'Active closer → FIN.',
          'Peer → ACK (that direction half-closed; may still send data).',
          'Peer → FIN when done sending.',
          'Active closer → ACK, then enters TIME_WAIT.',
        ]),
        diagram(
          `sequenceDiagram
  participant A as Active closer
  participant P as Passive closer
  A->>P: FIN
  P->>A: ACK
  Note over P: May still send data
  P->>A: FIN
  A->>P: ACK
  Note over A: TIME_WAIT 2MSL`,
          'TCP connection termination — independent FIN per direction',
        ),
        h3('TIME_WAIT'),
        p(
          'The active closer waits ~2×MSL so old duplicate segments die and so a final ACK can be resent if the peer\'s FIN was retransmitted. Heavy short-lived connections can exhaust local ports — reuse strategies, connection pooling, or SO_REUSEADDR nuances appear in systems interviews.',
        ),
        callout(
          'info',
          'Simultaneous open and simultaneous close exist; FIN+ACK combined is common when no more data. States like CLOSE_WAIT mean the local app has not closed its socket yet after peer FIN.',
          'State machine nuance',
        ),
      ]),
      section('example', 'Worked example', [
        example('CLOSE_WAIT leak', [
          p(
            'Server app forgets to close sockets after client disconnects → many CLOSE_WAIT → resource leak. Interview signal: distinguish kernel TCP state from application close() responsibility.',
          ),
        ]),
        example('SYN flood (conceptual)', [
          p(
            'Attacker sends many SYNs, never ACKs, filling SYN_RCVD queues. Defenses: SYN cookies, backlogs, rate limits, firewalls — not exploit details, just awareness that handshake state is a resource.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Handshake costs one RTT before data (TLS adds more; TLS1.3 0-RTT and TCP Fast Open are optimizations with replay caveats).',
          'TIME_WAIT protects correctness at the cost of port occupancy.',
          'Half-close enables protocols that send request then FIN while still reading response (unusual today vs HTTP length framing).',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Reliability uses the agreed sequence space after handshake.',
          'HTTPS: TCP handshake then TLS handshake (unless QUIC merges).',
          'Load balancers must handle SYN routing consistently (or use SYN cookies / conntrack).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "TCP uses a three-way handshake: SYN, SYN-ACK, ACK."'),
        p('Interviewer: "Why not two-way?"'),
        p(
          'Strong answer: "We need both initial sequence numbers exchanged and confirmation that each side received the other\'s ISN. The third ACK also defends against old duplicate SYNs creating half-open phantom connections on the server. Two-way is not safe with delayed duplicates."',
        ),
        p('Interviewer: "Why four-way close?"'),
        p(
          'Strong answer: "TCP is full-duplex. Each direction closes with its own FIN/ACK. Combining is possible when empty, but conceptually it\'s two half-closes."',
        ),
        p('Interviewer: "What is TIME_WAIT for?"'),
        p(
          'Strong answer: "Ensure the final ACK is delivered if the last FIN is retransmitted, and ensure old segments expire before the 4-tuple is reused. Duration is on the order of 2×MSL."',
        ),
      ]),
    ],
    commonMistakes: [
      'Saying the third ACK is "just courtesy" without the duplicate-SYN rationale.',
      'Calling termination always exactly four packets (FINs can combine with ACKs).',
      'Blaming TIME_WAIT as a pure bug rather than a correctness feature.',
      'Confusing LISTEN backlog issues with application thread pool exhaustion.',
    ],
    interviewQuestions: [
      'Describe the TCP three-way handshake.',
      'Why is the handshake three-way, not two-way?',
      'How does TCP connection termination work?',
      'What is TIME_WAIT and why does it exist?',
      'What do SYN and FIN flags mean?',
    ],
    intermediateInterviewQuestions: [
      'Explain CLOSE_WAIT vs TIME_WAIT.',
      'What is an initial sequence number (ISN) and why randomize it?',
      'What is simultaneous open?',
      'How does a SYN flood stress a server (high level)?',
      'What options are negotiated in the handshake?',
    ],
    advancedInterviewQuestions: [
      'Explain SYN cookies and what information they encode conceptually.',
      'How do TCP Fast Open and TLS 1.3 0-RTT change the latency story, and what are replay risks?',
      'How do load balancers maintain affinity across handshake packets?',
      'Walk the full TCP state machine from LISTEN to CLOSED for both sides.',
      'How does connection abortion with RST differ from graceful FIN shutdown?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Why is TCP handshake three-way?',
        answer:
          'TCP needs both sides to pick and acknowledge initial sequence numbers so reliability can track bytes. Flow: SYN(x), SYN-ACK(y, ack=x+1), ACK(ack=y+1). A two-way handshake cannot safely confirm bidirectional ISN sync under delayed duplicate SYNs — an old SYN could make a server believe a connection exists. The client\'s final ACK binds this incarnation. TRADE-OFF: one RTT setup cost for connection safety before data.',
      },
    ],
    keyTakeaways: [
      'SYN / SYN-ACK / ACK synchronizes ISNs both ways.',
      'Third ACK is essential for duplicate-SYN safety, not decoration.',
      'Close is per-direction FINs; TIME_WAIT protects the active closer.',
      'Know CLOSE_WAIT (app must close) vs TIME_WAIT (kernel wait).',
    ],
  },
)

export const d3p10: StudyPage = createPage(
  'd3-p10',
  'Reliability & Retransmission',
  14,
  [
    'Describe sequence numbers, ACKs, and cumulative acknowledgment',
    'Explain timeout retransmission and fast retransmit',
    'Analyze ACK-loss and data-loss scenarios correctly',
  ],
  {
    prerequisites: ['d3-p9'],
    sections: [
      section('concept', 'Concept', [
        p(
          'TCP numbers bytes with sequence numbers. Receivers send cumulative ACKs meaning "I have received all bytes up to ack−1 continuously." Lost data is retransmitted based on RTO timer expiry or fast retransmit after duplicate ACKs. Optional SACK (selective ACK) describes holes more precisely.',
        ),
        h3('Why this design'),
        p(
          'IP can drop, reorder, or duplicate packets. TCP turns that into a reliable stream using sequence space + ACKs + retransmission + sliding window (next page).',
        ),
      ]),
      section('how', 'How it works', [
        h3('Cumulative ACK'),
        p(
          'If bytes 1–1000 and 1501–2000 arrived but 1001–1500 are missing, cumulative ACK stays at 1001. With SACK, receiver can report the 1501–2000 block to avoid retransmitting what was already received.',
        ),
        h3('Loss detection'),
        ul([
          'Timeout (RTO): conservative; can hurt latency; RTO estimated from RTT variance (Jacobson/Karels).',
          'Fast retransmit: typically after 3 duplicate ACKs, retransmit likely lost segment without waiting full RTO.',
          'Fast recovery: reduce congestion window more gently than hard timeout (details next page).',
        ]),
        diagram(
          `sequenceDiagram
  participant S as Sender
  participant R as Receiver
  S->>R: Seg1 seq=1
  S->>R: Seg2 seq=1001
  Note over R: Seg2 lost
  S->>R: Seg3 seq=2001
  R->>S: ACK 1001
  R->>S: ACK 1001 dup
  R->>S: ACK 1001 dup
  R->>S: ACK 1001 dup
  Note over S: Fast retransmit Seg2
  S->>R: Seg2 retransmit
  R->>S: ACK 3001 cumulative`,
          'Duplicate ACKs trigger fast retransmit; cumulative ACK advances after hole filled',
        ),
        h3('ACK loss scenarios — critical interview traps'),
        ul([
          'Data arrives, ACK lost: sender eventually retransmits; receiver sees duplicate data and ACKs again (discard duplicate payload). Progress is OK — ACKs are not reliably delivered themselves; data reliability is achieved by retransmit of data.',
          'Data lost, ACK never sent for that byte: sender retransmits after timeout or dupacks from later packets.',
          'Delayed ACKs: receivers may ACK every second full segment — reduces ACK traffic, can interact with Nagle.',
        ]),
        diagram(
          `sequenceDiagram
  participant S as Sender
  participant R as Receiver
  S->>R: Data seq=1
  R--xS: ACK lost
  Note over S: RTO fires
  S->>R: Retransmit seq=1
  R->>S: ACK again
  Note over R: Duplicate data discarded`,
          'ACK loss does not corrupt data — retransmission recovers',
        ),
      ]),
      section('example', 'Worked example', [
        example('Reorder vs loss', [
          p(
            'Packets arrive 1,3,2. Receiver buffers 3, sends dup ACK for 2 when 3 arrives early; when 2 arrives, ACK jumps. Reordering can falsely trigger fast retransmit — modern stacks use careful thresholds and RACK/TLP algorithms.',
          ),
        ]),
        example('Idempotent app vs TCP', [
          p(
            'TCP may retransmit; apps still need idempotency for RPC at-least-once across crashes. TCP reliability ≠ exactly-once business logic.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Timeouts are ambiguous (loss vs long delay) — congestion control treats timeout as severe signal.',
          'Go-Back-N style behavior without SACK wastes bandwidth; SACK improves high-BDP links.',
          'Middleboxes that "help" can break SACK or sequence assumptions.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Flow/congestion windows limit what may be sent outstanding.',
          'HTTP/2 on one TCP connection couples streams via HOL blocking on loss.',
          'QUIC retransmits per stream/packet number space differently.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "TCP uses sequence numbers and ACKs to retransmit lost data."'),
        p('Interviewer: "What if the ACK is lost but data arrived?"'),
        p(
          'Strong answer: "The receiver already has the data. The sender\'s timer expires and it retransmits. The receiver discards the duplicate and sends another ACK. Reliability is ensured by retransmitting data, not by reliably delivering ACKs."',
        ),
        p('Interviewer: "Timeout vs fast retransmit?"'),
        p(
          'Strong answer: "Timeout waits RTO based on RTT estimates — safe but slow. Fast retransmit uses duplicate ACKs as an early loss signal when later packets arrive, recovering sooner on moderately lossy paths."',
        ),
        p('Interviewer: "Always?"'),
        p(
          'Strong answer: "If the window is small and no later packets arrive, you may get no dupacks and must rely on timeout. Also severe reordering can mimic loss."',
        ),
      ]),
    ],
    commonMistakes: [
      'Believing lost ACKs require a special ACK-retransmission protocol.',
      'Thinking cumulative ACK means selective delivery without buffering.',
      'Assuming three dupacks always means loss (could be reorder).',
      'Equating TCP reliability with exactly-once application semantics.',
    ],
    interviewQuestions: [
      'How does TCP detect packet loss?',
      'What does a cumulative ACK mean?',
      'What is fast retransmit?',
      'What happens if an ACK is lost but data was received?',
      'What is RTO?',
    ],
    intermediateInterviewQuestions: [
      'Explain duplicate ACKs with a missing segment example.',
      'What problem does SACK solve?',
      'How is RTT used to compute RTO?',
      'How does reordering confuse loss detection?',
      'Why retransmit the oldest unacked segment first typically?',
    ],
    advancedInterviewQuestions: [
      'Compare Go-Back-N vs selective repeat ideas in TCP with/without SACK.',
      'Explain RACK/TLP at a high level vs classic triple-dupack.',
      'How do spurious retransmissions happen and how are they detected?',
      'Walk byte numbering across segments with a mid-connection loss and recovery.',
      'How does TCP handle duplication from retransmits at the receiver?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain TCP reliability and ACK loss.',
        answer:
          'TCP tracks bytes with sequence numbers; receivers send cumulative ACKs for contiguous data received. On loss, sender retransmits after RTO or fast retransmit (duplicate ACKs), optionally guided by SACK. If data arrived but ACK was lost, sender retransmits; receiver drops duplicate data and ACKs again — progress is fine. WHY: IP is unreliable. TRADE-OFF: recovery latency and bandwidth vs correctness; timeouts are blunt congestion signals.',
      },
    ],
    keyTakeaways: [
      'Reliability = seq + ACK + retransmit (+ SACK).',
      'ACK loss ≠ data loss; data retransmit repairs it.',
      'Fast retransmit uses dupacks; timeout is fallback.',
      'TCP reliable delivery ≠ exactly-once app logic.',
    ],
  },
)

export const d3p11: StudyPage = createPage(
  'd3-p11',
  'Flow Control, Congestion Control & Sliding Window',
  18,
  [
    'Distinguish flow control from congestion control clearly',
    'Explain sliding window, cwnd, rwnd, and effective window',
    'Compute BDP and relate window size to throughput',
  ],
  {
    prerequisites: ['d3-p10'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Flow control protects the receiver from being overwhelmed (receiver window rwnd advertised). Congestion control protects the network from collapse (congestion window cwnd estimated by sender). The sender\'s outstanding data is limited by min(cwnd, rwnd) (and sometimes other factors) — the sliding window moves as data is ACKed.',
        ),
        h3('Why both'),
        p(
          'A fast sender and slow phone need flow control. Many senders sharing a bottleneck need congestion control. Confusing them is a classic interview fail.',
        ),
        table(
          ['Mechanism', 'Protects', 'Signal'],
          [
            ['Flow control', 'Receiver buffer', 'rwnd in TCP header'],
            ['Congestion control', 'Network path', 'Loss / ECN / delay → adjust cwnd'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Sliding window'),
        p(
          'Imagine a window of allowed sequence numbers in flight. As leftmost bytes are ACKed, the window slides right, allowing new bytes. Window size limits throughput roughly to window/RTT (bandwidth-delay product thinking).',
        ),
        diagram(
          `flowchart LR
  Sent["Sent ACKed"] --> Inflight["In flight <= min cwnd rwnd"]
  Inflight --> NotYet["Not yet sent"]
  ACKs["ACKs arrive"] --> Slide["Window slides right"]`,
          'Sliding window advances as ACKs free sequence space',
        ),
        h3('Slow start & congestion avoidance (classic Reno mental model)'),
        ul([
          'Slow start: cwnd grows exponentially (roughly doubling per RTT) until ssthresh.',
          'Congestion avoidance: linear growth (~+1 MSS per RTT).',
          'On loss: reduce ssthresh / cwnd (multiplicative decrease); timeout often resets to slow start.',
          'Modern stacks: CUBIC, BBR (model-based, uses delay/bandwidth estimates) — mention names, do not overclaim equations unless asked.',
        ]),
        h3('BDP'),
        p(
          'Bandwidth-Delay Product ≈ bottleneck bandwidth × RTT. To fill the pipe, window (and buffers) need to be on the order of BDP. Undersized windows cap throughput regardless of link speed.',
        ),
        callout(
          'tip',
          'Effective rate ≈ min(app rate, window/RTT, path capacity). Window/RTT is the classic interview lever.',
          'Throughput intuition',
        ),
      ]),
      section('example', 'Worked numericals (BDP & windows)', [
        numerical({
          title: 'BDP-1 — Basic BDP',
          problem: 'Link 100 Mbps, RTT 80 ms. What is BDP in bytes?',
          given: 'BW=100e6 bits/s, RTT=0.08 s',
          formula: 'BDP = BW × RTT',
          steps:
            '1) 100e6 × 0.08 = 8e6 bits\n2) 8e6 / 8 = 1,000,000 bytes ≈ 1 MB',
          answer: '≈ 1,000,000 bytes (1 MB)',
          shortcut: '100 Mb/s × 0.08 s = 8 Mb → 1 MB.',
          mistake: 'Forgetting to convert bits to bytes (off by 8).',
        }),
        numerical({
          title: 'BDP-2 — Required window',
          problem: 'Want ~1 Gbps on a path with RTT 40 ms. Approximate window needed?',
          given: 'BW=1e9 bits/s, RTT=0.04 s',
          formula: 'window ≈ BW × RTT',
          steps:
            '1) 1e9 × 0.04 = 4e7 bits\n2) /8 = 5,000,000 bytes ≈ 5 MB',
          answer: 'On the order of 5 MB congestion/receiver window (and buffering).',
          shortcut: '1 Gbps × 40 ms → 40 Mb ≈ 5 MB.',
          mistake: 'Using 40 µs instead of 40 ms (1000× error).',
        }),
        numerical({
          title: 'BDP-3 — Window-limited throughput',
          problem: 'rwnd=64 KB, RTT=100 ms, path is 1 Gbps. Max TCP throughput roughly?',
          given: 'W=64×1024 bytes, RTT=0.1 s',
          formula: 'throughput ≈ W / RTT',
          steps:
            '1) W=65536 bytes = 524288 bits\n2) /0.1 = 5.24e6 bits/s ≈ 5.2 Mbps',
          answer: '≈ 5.2 Mbps — window-limited, not path-limited.',
          shortcut: '64KB/0.1s ≈ 640 KB/s ≈ 5 Mbps.',
          mistake: 'Saying you get 1 Gbps because the link is 1 Gbps.',
        }),
        numerical({
          title: 'BDP-4 — Window scaling need',
          problem: 'BDP is 2 MB. Default window 65535 without scaling — enough?',
          given: 'BDP=2MB, max unscaled window=64KB−1',
          formula: 'Need W ≥ BDP for full pipe',
          steps: '1) 64KB << 2MB\n2) Need window scaling option to advertise megabyte-scale rwnd',
          answer: 'No — must use TCP window scaling (and adequate buffers).',
          shortcut: 'If BDP > 64KB, scaling is mandatory for performance.',
          mistake: 'Confusing cwnd units (packets vs bytes) without converting.',
        }),
        numerical({
          title: 'BDP-5 — Mini data center',
          problem: 'RTT 0.5 ms, BW 10 Gbps. BDP?',
          given: '10e9 bits/s × 0.0005 s',
          formula: 'BDP=BW×RTT',
          steps: '1) 10e9×5e-4=5e6 bits\n2) /8=625,000 bytes ≈ 625 KB',
          answer: '≈ 625 KB',
          shortcut: 'High bandwidth still needs nontrivial windows even at sub-ms RTT.',
          mistake: 'Assuming LAN BDP is negligible always — at 10/40/100G it is not.',
        }),
        numerical({
          title: 'BDP-6 — Effective window',
          problem: 'cwnd=100 MSS, rwnd=40 MSS, MSS=1460 B, RTT=50 ms. Approx throughput?',
          given: 'effective window = min(100,40)=40 MSS',
          formula: 'rate ≈ (40×1460 bytes) / 0.05 s',
          steps:
            '1) 40×1460=58400 bytes\n2) /0.05 = 1,168,000 B/s\n3) ×8 ≈ 9.3 Mbps',
          answer: '≈ 9.3 Mbps, limited by rwnd not cwnd',
          shortcut: 'min(cwnd,rwnd)/RTT dominates.',
          mistake: 'Averaging cwnd and rwnd instead of taking min.',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Large buffers (bufferbloat) raise latency; BBR/FQ-CoDel target delay.',
          'Aggressive cwnd hurts fairness; too timid underuses links.',
          'Flow control alone cannot stop network congestion — need cwnd.',
          'App-layer sliding windows (RPC) are analogous but separate from TCP.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Loss signals from previous page feed cwnd reductions.',
          'HTTP/2 multiplexing shares one connection\'s cwnd among streams.',
          'CDN/edge proximity reduces RTT → less window needed for same throughput.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Flow control is rwnd; congestion control is cwnd; send with min of both."'),
        p('Interviewer: "How does that relate to throughput?"'),
        p(
          'Strong answer: "Throughput is roughly window/RTT up to path capacity. To saturate a path you need window on the order of the bandwidth-delay product and enough buffer space."',
        ),
        p('Interviewer: "Walk slow start."'),
        p(
          'Strong answer: "Start with a small cwnd, increase exponentially each RTT until a loss signal or ssthresh, then grow linearly. On heavy loss/timeout, reduce aggressively and often restart slow start. Goal: probe capacity quickly but back off when the network is congested."',
        ),
        p('Interviewer: "Trade-off CUBIC vs BBR?"'),
        p(
          'Strong answer: "CUBIC reacts primarily to loss and is widely deployed. BBR models bottleneck bandwidth and RTT, often better on lossy/policed links, but interactions and fairness can be subtle. I pick based on workload measurement, not dogma."',
        ),
      ]),
    ],
    commonMistakes: [
      'Swapping definitions of flow vs congestion control.',
      'Using max(cwnd,rwnd) instead of min.',
      'Forgetting unit conversions in BDP (bits/bytes, ms/s).',
      'Assuming link speed alone determines TCP throughput.',
    ],
    interviewQuestions: [
      'Difference between flow control and congestion control?',
      'What is a sliding window in TCP?',
      'What is cwnd vs rwnd?',
      'What is bandwidth-delay product?',
      'What is slow start?',
    ],
    intermediateInterviewQuestions: [
      'Why can a 1 Gbps path deliver only a few Mbps to one TCP flow?',
      'Explain multiplicative decrease.',
      'How does window scaling help?',
      'What is ssthresh?',
      'How does bufferbloat affect TCP latency?',
    ],
    advancedInterviewQuestions: [
      'Compare Reno, CUBIC, and BBR at a conceptual level.',
      'How does ECN change congestion signaling?',
      'Compute BDP and recommend buffer/window settings for a WAN backup link.',
      'How does HTTP/2 stream multiplexing interact with TCP congestion control?',
      'Explain why fairness among flows is approximate, not perfect.',
      'How do pacing and qdiscs interact with large cwnd bursts?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain flow control vs congestion control and BDP.',
        answer:
          'Flow control uses the receiver\'s advertised rwnd so we do not overflow its buffer. Congestion control adjusts cwnd based on network signals (loss/ECN/delay) so we do not overload the path. Bytes in flight ≤ min(cwnd, rwnd). Throughput ≈ window/RTT until you hit capacity; the window needed to fill the pipe is about BW×RTT — the bandwidth-delay product. TRADE-OFF: large windows/buffers fill fat pipes but can add latency if queues grow (bufferbloat).',
      },
    ],
    keyTakeaways: [
      'Flow = protect receiver (rwnd); congestion = protect network (cwnd).',
      'In flight limited by min(cwnd, rwnd); window slides on ACKs.',
      'BDP = BW × RTT; undersized windows cap throughput.',
      'Slow start probes fast; loss triggers backoff — modern CC variants differ.',
    ],
  },
)

export const m3Pages: StudyPage[] = [d3p8, d3p9, d3p10, d3p11]
