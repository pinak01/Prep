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
} from '../../../helpers'

export const d3rev: StudyPage = createPage(
  'd3-rev',
  '10-Minute Revision',
  10,
  [
    'Recite layered models, addressing, and core protocols cold',
    'Recall TCP reliability/congestion essentials and HTTP/TLS path',
    'Run the "type a URL" narrative without notes',
  ],
  {
    sections: [
      section('checklist', 'Dense checklist', [
        h3('Models & addressing'),
        ul([
          'OSI 7: Physical → … → Application; TCP/IP 4: Link → Internet → Transport → Application.',
          'L2 MAC/switch/frame; L3 IP/router/packet; L4 port/TCP|UDP; L7 HTTP/DNS.',
          'IPv4 32-bit; private 10/8, 172.16/12, 192.168/16; loopback 127/8; APIPA 169.254/16.',
          'CIDR: usable ≈ 2^(32−p)−2; /24=254, /25=126, /26=62, /27=30, /28=14, /30=2.',
          'LPM routing; default gateway; ARP next hop only.',
        ]),
        h3('Core services'),
        ul([
          'ARP: Who has IP → MAC; cache; gateway for remote dest.',
          'DHCP DORA + lease T1/T2; relay across subnets.',
          'DNS: recursive vs auth; A/AAAA/CNAME/MX/NS; TTL caching.',
        ]),
        h3('Transport'),
        ul([
          'TCP reliable ordered byte stream + flow/congestion; UDP datagram best-effort.',
          'Handshake SYN / SYN-ACK / ACK — third ACK defeats old duplicate SYNs.',
          'Close: FIN/ACK each way; TIME_WAIT = 2MSL correctness.',
          'ACK lost ≠ data lost; fast retransmit via dupacks; SACK helps.',
          'min(cwnd,rwnd); BDP=BW×RTT; throughput≈W/RTT.',
        ]),
        h3('Web stack'),
        ul([
          'HTTP methods/status; idempotent GET/PUT/DELETE; POST not by default.',
          'H1 many conns; H2 multiplex TCP; H3 QUIC/UDP.',
          'TLS: encrypt + integrity + cert auth; validates hostname → MITM hard.',
          'REST vs WebSocket vs socket API; forward vs reverse proxy; L4 vs L7 LB; CDN edge cache.',
          'URL story: DNS → TCP → TLS → HTTP → CDN/origin → render waterfall.',
        ]),
        callout(
          'tip',
          'Speak for 60–90s on "type a URL" every day until it is automatic — it pulls the whole syllabus together.',
          'Drill',
        ),
      ]),
      section('numbers', 'Numbers to memorize', [
        table(
          ['Item', 'Value'],
          [
            ['DNS / DHCP ports', 'UDP/TCP 53; DHCP 67/68'],
            ['HTTP / HTTPS', '80 / 443'],
            ['/24 block', '256 addresses, 254 usable'],
            ['TCP handshake RTTs', '~1 before data'],
            ['TLS1.3 extra', '~1 RTT (classic TCP+TLS)'],
          ],
        ),
      ]),
      section('followups', 'Self-quiz chain', [
        p('You: "Explain subnet /26."'),
        p('You (answer): "64 addresses, network+broadcast reserved, 62 hosts, block on multiples of 64."'),
        p('You: "Why not 2-way TCP handshake?"'),
        p('You (answer): "Need both ISNs ACKed; defend against delayed duplicate SYNs."'),
        p('You: "Flow vs congestion?"'),
        p('You (answer): "rwnd protects receiver; cwnd protects network; send min."'),
      ]),
    ],
    commonMistakes: [
      'Revising mnemonics without one worked subnetting numerical.',
      'Skipping the URL narrative synthesis.',
      'Memorizing HTTP/3 as "just faster HTTP/2 on TCP."',
    ],
    interviewQuestions: [
      'List OSI layers bottom-up in 15 seconds.',
      'Usable hosts in /26 and /28?',
      'DHCP DORA steps?',
      'Why three-way handshake?',
      'Cold HTTPS RTT budget?',
    ],
    intermediateInterviewQuestions: [
      'ARP for 8.8.8.8 — what actually happens?',
      'CNAME vs A at zone apex?',
      'cwnd vs rwnd with a number example?',
      '401 vs 403?',
      'L4 vs L7 LB one-liners?',
    ],
    advancedInterviewQuestions: [
      'BDP for 400 Mbps at 60 ms — window needed?',
      'How does ACK loss recover?',
      'MITM + rogue CA story?',
      'Why QUIC over UDP?',
      'VLSM three-subnet sketch from /24?',
    ],
    interviewReadyAnswers: [
      {
        question: '60-second Day 3 summary.',
        answer:
          'Networks are layered: Ethernet delivers frames, IP routes packets best-effort, TCP or UDP serves apps. We subnet with CIDR, resolve names with DNS, assign hosts with DHCP, and map IP to MAC with ARP. TCP handshakes, acknowledges, and congestion-controls; HTTP rides TLS for secure web semantics, often via CDNs and load balancers. Typing a URL walks DNS → TCP → TLS → HTTP → render end-to-end.',
      },
    ],
    keyTakeaways: [
      'Layer + localize failures; do not jump to guesses.',
      'CIDR math and TCP handshake reasons are non-negotiable.',
      'URL narrative is your integration exam.',
    ],
  },
)

export const d3traps: StudyPage = createPage(
  'd3-traps',
  'Interview Traps',
  10,
  [
    'Avoid classic misconceptions that lose easy points',
    'Correct subtle half-truths about TCP, DNS, HTTPS, and proxies',
    'Practice precise wording under follow-ups',
  ],
  {
    sections: [
      section('traps', 'High-frequency traps', [
        h3('Addressing & L2/L3'),
        ul([
          'Trap: "We ARP for the remote server IP on the Internet." → Fix: ARP only the next hop / gateway.',
          'Trap: "172.16/16 is all private 172s." → Fix: private is 172.16.0.0/12 (through 172.31).',
          'Trap: "/24 has 256 usable hosts." → Fix: 254 usable (minus net+broadcast).',
          'Trap: "Private IPs cannot be used at all on the Internet path." → Fix: they appear inside NAT; public side is translated.',
        ]),
        h3('TCP'),
        ul([
          'Trap: "Two-way handshake is fine." → Fix: ISN sync both ways + old duplicate SYN hazard.',
          'Trap: "Lost ACK means data must be gone." → Fix: retransmit data; receiver de-dupes.',
          'Trap: "TCP guarantees latency." → Fix: reliability, not timeliness.',
          'Trap: "Flow control = congestion control." → Fix: rwnd vs cwnd.',
          'Trap: "TIME_WAIT is a bug." → Fix: correctness for final ACK and 4-tuple reuse.',
        ]),
        h3('HTTP / TLS / DNS'),
        ul([
          'Trap: "HTTP/2 has no HOL blocking." → Fix: no HTTP-msg HOL; TCP HOL remains; H3 improves.',
          'Trap: "HTTPS stops phishing." → Fix: cert proves key control for a name, not human trust of lookalikes.',
          'Trap: "DNS propagates globally in minutes by push." → Fix: TTLs/caches expire.',
          'Trap: "POST is idempotent." → Fix: not by default.',
        ]),
        h3('Infrastructure'),
        ul([
          'Trap: Swap forward/reverse proxy.',
          'Trap: "CDN always makes dynamic personalized pages faster/safe to cache." → Fix: cache policy matters.',
          'Trap: "UDP is always faster than TCP." → Fix: depends on what the app must reinvent.',
        ]),
      ]),
      section('wording', 'Precision upgrades', [
        table(
          ['Sloppy', 'Stronger'],
          [
            ['"TCP is a layer 3 protocol"', '"TCP is transport (L4); IP is network/internet layer"'],
            ['"Switch routes IPs"', '"Switch forwards frames by MAC; router forwards packets by IP"'],
            ['"TLS encrypts the connection so we are safe"', '"TLS provides confidentiality, integrity, and server auth if validation succeeds"'],
            ['"The load balancer balances servers"', '"L4/L7 policies distribute flows/requests across healthy backends"'],
          ],
        ),
      ]),
      section('followups', 'Trap follow-up chain', [
        p('Interviewer: "Is HTTPS enough for security?"'),
        p(
          'Strong answer: "Necessary for transport security in transit, not sufficient for app security — still need authz, XSS/CSRF defenses, safe deps, and correct cert validation. Also know where TLS terminates."',
        ),
        p('Interviewer: "So UDP apps do not need congestion control?"'),
        p(
          'Strong answer: "The UDP protocol does not provide it, but well-behaved apps or frameworks should — otherwise they harm the network and themselves under load. QUIC includes CC."',
        ),
      ]),
    ],
    commonMistakes: [
      'Doubling down on a wrong mnemonic instead of correcting under pressure.',
      'Giving exploit-y detail when asked about ARP spoofing — stay conceptual + defensive.',
      'Overclaiming exact TLS state machine bytes when a solid conceptual answer suffices.',
    ],
    interviewQuestions: [
      'Correct this: "TCP is layer 3."',
      'Correct this: "/26 has 64 usable hosts."',
      'Correct this: "We ARP for google.com\'s IP."',
      'Correct this: "HTTP/2 eliminated HOL blocking completely."',
      'Correct this: "TIME_WAIT should always be disabled."',
    ],
    intermediateInterviewQuestions: [
      'Why do people confuse reverse and forward proxies?',
      'Why is "DNS propagation" misleading?',
      'When is UDP slower in practice than TCP?',
      'How can HTTPS still allow corporate inspection?',
      'Why is "private IP means secure" false?',
    ],
    advancedInterviewQuestions: [
      'Explain a false fast-retransmit due to reordering — what changes in modern stacks?',
      'Where does trusting X-Forwarded-For go wrong?',
      'How can over-aggregation in BGP black-hole traffic?',
      'Why might enabling TCP timestamps / window scaling be filtered by middleboxes?',
      'Cache poisoning conceptual conditions vs modern mitigations (high level).',
    ],
    interviewReadyAnswers: [
      {
        question: 'Call out three misconceptions you will not fall for.',
        answer:
          'I will not ARP for remote Internet destinations — only the next hop. I will not conflate flow control with congestion control — rwnd versus cwnd. I will not claim HTTP/2 removed all HOL blocking — TCP loss still couples streams, which is a reason HTTP/3/QUIC exists. Bonus: ACK loss does not mean data loss; HTTPS authenticity depends on certificate validation, not just encryption.',
      },
    ],
    keyTakeaways: [
      'Most traps are layer confusion or absolute claims.',
      'Prefer precise, scoped statements with trade-offs.',
      'Correct yourself out loud if you slip — interviewers reward recovery.',
    ],
  },
)

export const d3rapid: StudyPage = createPage(
  'd3-rapid',
  'Rapid Fire — 20 Questions',
  12,
  [
    'Answer 20 core networking questions crisply',
    'Use model-answer hints to self-score',
    'Flag weak areas for targeted review',
  ],
  {
    sections: [
      section('howto', 'How to use this drill', [
        p(
          'Cover the answers. Speak each response in ≤45 seconds. Then reveal the hint. Mark ✔︎ / ~ / ✘. Re-drill ✘ items using the matching study page.',
        ),
        ol([
          'Say the answer aloud — do not only think it.',
          'Include one trade-off or caveat when natural.',
          'If stuck, state the layer you would debug first.',
        ]),
      ]),
      section('answers', 'Model answer hints (20)', [
        h3('Q1–Q5 — Foundations'),
        ul([
          'Q1 hint: OSI 7 names + one example each; mention TCP/IP collapse.',
          'Q2 hint: Encapsulation headers L7→L2; L2 changes each hop.',
          'Q3 hint: Private ranges list; NAT at edge.',
          'Q4 hint: /27 → 32 addrs → 30 usable; mask 255.255.255.224.',
          'Q5 hint: ARP next-hop MAC; broadcast request, unicast reply.',
        ]),
        h3('Q6–Q10 — Services & routing'),
        ul([
          'Q6 hint: DORA; UDP 67/68; relay for remote subnets.',
          'Q7 hint: Recursive resolver walks root→TLD→auth; TTL cache.',
          'Q8 hint: LPM; default route 0.0.0.0/0.',
          'Q9 hint: Routing builds tables; forwarding per-packet next hop.',
          'Q10 hint: TCP reliable stream vs UDP datagram; example picks.',
        ]),
        h3('Q11–Q15 — TCP deep'),
        ul([
          'Q11 hint: SYN/SYN-ACK/ACK; duplicate SYN rationale.',
          'Q12 hint: Four-way FIN; TIME_WAIT 2MSL.',
          'Q13 hint: ACK lost → data retransmit; receiver drops dup.',
          'Q14 hint: rwnd vs cwnd; min governs in-flight.',
          'Q15 hint: BDP=BW×RTT; W/RTT throughput cap.',
        ]),
        h3('Q16–Q20 — Web & infra'),
        ul([
          'Q16 hint: Idempotent methods; POST caveat.',
          'Q17 hint: H1 vs H2 vs H3 bullets.',
          'Q18 hint: Cert validate + encrypt; MITM without trusted cert fails.',
          'Q19 hint: Reverse proxy/LB/CDN roles; L4 vs L7.',
          'Q20 hint: DNS→TCP→TLS→HTTP→render; RTT budget.',
        ]),
        callout(
          'info',
          'Full question text is listed in the interview question tiers below — use Basic Q1–5, Intermediate Q1–5, and Advanced Q1–10 as the 20.',
          'Where are the 20 questions?',
        ),
      ]),
      section('followups', 'Rapid follow-up spice', [
        p('After each answer, ask yourself: "Why? / How detected? / Trade-off?"'),
        p(
          'Strong habit: "Because IP is best-effort…" / "Because receivers advertise rwnd…" / "Trade-off is …"',
        ),
      ]),
    ],
    commonMistakes: [
      'Rambling past 45s — structure beats encyclopedia mode.',
      'Skipping numericals (Q4, Q15) — interviewers often ask one.',
      'Memorizing hints without page-level understanding.',
    ],
    interviewQuestions: [
      'Q1: Name the OSI layers and map them to TCP/IP.',
      'Q2: What is encapsulation? What changes every hop?',
      'Q3: List RFC1918 private IPv4 ranges.',
      'Q4: How many usable hosts in a /27? What is the mask?',
      'Q5: Explain ARP in two sentences.',
    ],
    intermediateInterviewQuestions: [
      'Q6: Walk through DHCP DORA.',
      'Q7: Recursive vs authoritative DNS?',
      'Q8: What is longest prefix match?',
      'Q9: Routing vs forwarding?',
      'Q10: When TCP vs when UDP?',
    ],
    advancedInterviewQuestions: [
      'Q11: Why is the TCP handshake three-way, not two-way?',
      'Q12: Explain TCP termination and TIME_WAIT.',
      'Q13: Data arrived but ACK was lost — what happens?',
      'Q14: Flow control vs congestion control?',
      'Q15: Define BDP and why window size matters.',
      'Q16: Which HTTP methods are idempotent and why does it matter?',
      'Q17: Compare HTTP/1.1, HTTP/2, and HTTP/3.',
      'Q18: How does HTTPS prevent MITM?',
      'Q19: Forward vs reverse proxy; L4 vs L7 load balancing.',
      'Q20: What happens when you type a URL and press Enter?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Q11 — Why three-way handshake?',
        answer:
          'Both sides must exchange and acknowledge initial sequence numbers so reliability works both directions. The client\'s final ACK also prevents old delayed SYNs from creating false connections on the server. Cost is about one RTT before data on a classic TCP connection.',
      },
      {
        question: 'Q15 — BDP',
        answer:
          'BDP equals bandwidth times RTT — the amount of data that can be in flight to fill the pipe. TCP throughput is roughly min(capacity, window/RTT), so the window needs to be on the order of BDP (with window scaling if BDP > 64KB).',
      },
      {
        question: 'Q20 — Type a URL',
        answer:
          'Parse URL → DNS to IP → reach next hop via ARP/routing → TCP handshake → TLS with cert check → HTTP request via CDN/LB/origin → response → browser fetches subresources and renders. Cold loads pay DNS+TCP+TLS RTTs; caches and keep-alive shrink repeats.',
      },
    ],
    keyTakeaways: [
      '20 questions cover the day\'s examinable surface area.',
      'Numerical + handshake + URL story are highest ROI.',
      'Re-drill weak answers the same day.',
    ],
  },
)

export const m5Pages: StudyPage[] = [d3rev, d3traps, d3rapid]
