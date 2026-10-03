import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from './helpers'

/** Day 3 — OSI/TCP-IP, subnetting, DNS/DHCP/ARP, TCP/UDP, HTTP/TLS, proxies/LB/CDN (30 questions) */
export const day3Questions: QuizQuestion[] = [
  // ===== EASY (10) =====
  q({
    id: 'd3-q01',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['OSI', 'TCP/IP'],
    learningObjective: 'Map IP to the correct conceptual layer',
    question:
      'In the classic OSI model, which layer is primarily responsible for logical addressing and end-to-end packet forwarding (IP)?',
    options: [
      'Physical',
      'Data Link',
      'Network',
      'Application',
    ],
    correctAnswer: 2,
    explanation:
      'Network layer (L3) handles IP addressing and routing between networks. Data link is frames/MAC; application is end-user protocols.',
    whyWrong: {
      '0': 'Physical moves bits; no IP addresses.',
      '1': 'Data link is MAC/frames on a local segment.',
      '3': 'Application is HTTP/DNS/etc., above transport.',
    },
    interviewTakeaway: 'IP = Network/L3; TCP/UDP = Transport/L4.',
  }),
  tf({
    id: 'd3-q02',
    difficulty: 'easy',
    topics: ['TCP', 'UDP'],
    learningObjective: 'Contrast connection-oriented vs connectionless transport',
    question:
      'True or False: TCP establishes a connection (handshake) before transferring application data, while UDP does not.',
    correct: true,
    explanation:
      'TCP is connection-oriented (3-way handshake, state). UDP is connectionless datagrams with no handshake.',
    whyWrong: {
      '1': 'False would confuse TCP/UDP basics — a frequent warm-up question.',
    },
    interviewTakeaway: 'Lead with reliability/ordering/handshake for TCP vs speed/simplicity for UDP.',
  }),
  q({
    id: 'd3-q03',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['ARP'],
    learningObjective: 'State ARP’s purpose on IPv4 LANs',
    question: 'What does ARP resolve on a typical IPv4 Ethernet LAN?',
    options: [
      'Domain name → IP address',
      'IP address → MAC address',
      'MAC address → domain name',
      'Port number → process name',
    ],
    correctAnswer: 1,
    explanation:
      'ARP (Address Resolution Protocol) maps a next-hop IPv4 address to a link-layer MAC so frames can be delivered on the LAN.',
    whyWrong: {
      '0': 'That is DNS.',
      '2': 'Not ARP’s job (and not how naming works).',
      '3': 'Ports are transport; process mapping is OS-local.',
    },
    interviewTakeaway: 'DNS names→IP; ARP IP→MAC on L2.',
  }),
  q({
    id: 'd3-q04',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['DNS'],
    learningObjective: 'Identify the primary role of DNS',
    question: 'A browser needs to open https://api.example.com. What is DNS’s primary job here?',
    options: [
      'Encrypt the HTTP body',
      'Translate the hostname to an IP address (and related records)',
      'Assign the client a DHCP lease',
      'Choose the TCP congestion algorithm',
    ],
    correctAnswer: 1,
    explanation:
      'DNS resolves names to addresses (A/AAAA) and other records (CNAME, etc.) so the client knows where to connect.',
    whyWrong: {
      '0': 'TLS/HTTPS handles encryption.',
      '2': 'DHCP configures host addressing, not name lookup.',
      '3': 'Congestion control is a TCP stack concern.',
    },
    interviewTakeaway: 'Name the record types (A/AAAA/CNAME) in follow-ups.',
  }),
  q({
    id: 'd3-q05',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['DHCP'],
    learningObjective: 'Recall what DHCP provides to a host',
    question: 'Which set is most characteristic of what DHCP typically configures for a client?',
    options: [
      'IP address, subnet mask, default gateway, DNS servers',
      'Only the TLS certificate chain',
      'Only the HTTP status code',
      'ARP table for the entire Internet',
    ],
    correctAnswer: 0,
    explanation:
      'DHCP leases an IP and usually supplies mask, gateway, and DNS — enough for L3/L4 connectivity and name resolution.',
    whyWrong: {
      '1': 'Certificates come from PKI/TLS, not DHCP.',
      '2': 'HTTP status is application-layer response metadata.',
      '3': 'ARP is local; DHCP does not populate global ARP.',
    },
    interviewTakeaway: 'DHCP = “how I join the network”; DNS = “how I find names.”',
  }),
  q({
    id: 'd3-q06',
    type: 'numerical',
    difficulty: 'easy',
    topics: ['Subnetting', 'CIDR'],
    learningObjective: 'Compute usable host count for a /24',
    question:
      'How many usable host addresses are in a single IPv4 /24 network (excluding network and broadcast)? Enter an integer.',
    correctAnswer: '254',
    acceptedAnswers: ['254'],
    explanation:
      'A /24 has 2^(32-24)=256 addresses. Subtract network and broadcast → 254 usable hosts.',
    whyWrong: {
      '256': 'That counts all addresses including network/broadcast.',
      '255': 'Off-by-one; still includes one reserved address.',
      '253': 'Under-counts usable hosts.',
    },
    interviewTakeaway: 'Usable = 2^(host bits) − 2 for classic IPv4 subnets (point-to-point /31 exceptions aside).',
  }),
  q({
    id: 'd3-q07',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['UDP', 'TCP'],
    learningObjective: 'Choose UDP for latency-sensitive loss-tolerant traffic',
    question:
      'Which workload is the best fit for UDP rather than TCP in a typical interview answer?',
    options: [
      'Bank wire transfer requiring exactly-once ordered delivery by the transport',
      'Live video/voice where occasional loss is preferable to head-of-line retransmission delay',
      'Downloading a large ISO where every byte must arrive in order',
      'SSH remote shell session',
    ],
    correctAnswer: 1,
    explanation:
      'Realtime media often prefers UDP (or QUIC with different trade-offs) so loss does not stall the stream via TCP retransmission HOL blocking.',
    whyWrong: {
      '0': 'Needs reliability — TCP (or app-level reliability on UDP).',
      '2': 'Bulk reliable transfer → TCP.',
      '3': 'SSH runs over TCP.',
    },
    interviewTakeaway: 'UDP when you can tolerate loss or implement reliability yourself.',
  }),
  tf({
    id: 'd3-q08',
    difficulty: 'easy',
    topics: ['HTTPS', 'TLS'],
    learningObjective: 'Relate HTTPS to TLS',
    question:
      'True or False: HTTPS is essentially HTTP spoken over a TLS-secured connection rather than plaintext TCP.',
    correct: true,
    explanation:
      'HTTPS uses TLS to provide confidentiality, integrity, and server authentication for HTTP.',
    whyWrong: {
      '1': 'False would treat HTTPS as a wholly unrelated protocol — incorrect.',
    },
    interviewTakeaway: 'Say “HTTP + TLS,” then mention certs and handshake briefly.',
  }),
  q({
    id: 'd3-q09',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['URL navigation', 'DNS'],
    learningObjective: 'Order early steps after typing a URL',
    question:
      'You type https://shop.example.com in the address bar and press Enter. After the URL is parsed, which step must succeed before a TCP connection to the origin (or CDN edge) can begin?',
    options: [
      'Obtain an IP for the hostname via DNS (or cache)',
      'Send the HTTP POST body',
      'Run ARP for every host on the Internet',
      'Complete a DHCP Discover to example.com',
    ],
    correctAnswer: 0,
    explanation:
      'The client needs a destination IP. DNS (or a cached answer) provides it; only then can TCP/TLS start toward that address.',
    whyWrong: {
      '1': 'HTTP comes after TCP (and usually TLS for HTTPS).',
      '2': 'ARP is only for the local next hop, not the whole Internet.',
      '3': 'DHCP is local host config, not a per-site Discover to the brand domain.',
    },
    interviewTakeaway: 'URL → DNS → TCP → TLS → HTTP is the skeleton story.',
  }),
  q({
    id: 'd3-q10',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['CDN'],
    learningObjective: 'Explain why CDNs exist',
    question: 'What is the main performance goal of a CDN for static web assets?',
    options: [
      'Store assets closer to users to cut latency and origin load',
      'Replace DNS entirely',
      'Disable TLS for speed',
      'Assign RFC1918 addresses to browsers',
    ],
    correctAnswer: 0,
    explanation:
      'CDNs cache/serve content from edge PoPs near clients, reducing RTT and offloading the origin.',
    whyWrong: {
      '1': 'CDNs use DNS; they do not replace it.',
      '2': 'Modern CDNs terminate TLS; they do not remove it for “speed.”',
      '3': 'Nonsense.',
    },
    interviewTakeaway: 'CDN = edge cache + geo proximity + origin shield story.',
  }),

  // ===== MEDIUM (10) =====
  q({
    id: 'd3-q11',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Subnetting', 'CIDR'],
    learningObjective: 'Find the network address given IP and prefix',
    question:
      'What is the network address of 192.168.10.45/28? Enter dotted-quad (e.g. 192.168.10.0).',
    correctAnswer: '192.168.10.32',
    acceptedAnswers: ['192.168.10.32'],
    explanation:
      '/28 ⇒ block size 16 in the last octet. Ranges …0–15, 16–31, 32–47, …. 45 falls in 32–47 ⇒ network 192.168.10.32.',
    whyWrong: {
      '192.168.10.45': 'That is the host, not the network ID.',
      '192.168.10.0': 'Would be correct for /24 or /28 starting at 0, not this host.',
      '192.168.10.48': 'That is the next network, not this one.',
    },
    interviewTakeaway: 'Block size = 2^(host bits); floor the host into the block.',
  }),
  q({
    id: 'd3-q12',
    type: 'multi',
    difficulty: 'medium',
    topics: ['TCP'],
    learningObjective: 'Identify packets in the TCP three-way handshake',
    question:
      'Which statements correctly describe a normal TCP three-way handshake? (Select all that apply)',
    options: [
      'Client sends SYN',
      'Server replies with SYN-ACK',
      'Client finishes with ACK',
      'Client sends FIN first to open the connection',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'Open is SYN → SYN-ACK → ACK. FIN is used to close, not to establish.',
    whyWrong: {
      '3': 'FIN tears down; SYN opens.',
    },
    interviewTakeaway: 'Also mention sequence/ack numbers exchanging initial sequence numbers.',
  }),
  q({
    id: 'd3-q13',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['TCP', 'Flow control', 'Congestion control'],
    learningObjective: 'Distinguish flow control from congestion control',
    question:
      'TCP receiver window (rwnd) shrinking because the application is slow to read — what is this primarily?',
    options: [
      'Congestion control reacting to packet loss in the network',
      'Flow control protecting the receiver’s buffer',
      'ARP cache timeout',
      'DNS negative caching',
    ],
    correctAnswer: 1,
    explanation:
      'Flow control uses the advertised receive window so the sender does not overrun the receiver. Congestion control reacts to network path capacity (loss/ECN/delay).',
    whyWrong: {
      '0': 'That is congestion control (cwnd), a different signal.',
      '2': 'ARP is L2 resolution.',
      '3': 'DNS caching is unrelated to TCP windows.',
    },
    interviewTakeaway: 'Effective window ≈ min(cwnd, rwnd) — say both names.',
  }),
  q({
    id: 'd3-q14',
    type: 'code',
    difficulty: 'medium',
    topics: ['HTTP', 'HTTPS'],
    learningObjective: 'Read a minimal HTTP request line and Host header',
    question: 'For this request, which absolute target URL is being requested on the origin?',
    codeSnippet: {
      language: 'http',
      code: `GET /v1/items?limit=10 HTTP/1.1
Host: api.example.com
Accept: application/json`,
    },
    options: [
      'http://api.example.com/v1/items?limit=10',
      'http://api.example.com/',
      'https://api.example.com/v1/items (query ignored always)',
      'ftp://api.example.com/v1/items?limit=10',
    ],
    correctAnswer: 0,
    explanation:
      'Origin-form request-target + Host header ⇒ http://api.example.com/v1/items?limit=10 (scheme depends on the socket; plaintext HTTP shown here).',
    whyWrong: {
      '1': 'Path and query are not “/”.',
      '2': 'Query is part of the request-target; HTTPS not indicated by this text alone.',
      '3': 'Wrong scheme.',
    },
    interviewTakeaway: 'Virtual hosting: Host header selects the site on a shared IP.',
  }),
  q({
    id: 'd3-q15',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Subnetting', 'CIDR'],
    learningObjective: 'Compute the broadcast address for a prefix',
    question:
      'What is the broadcast address of network 10.5.0.0/26? Enter dotted-quad.',
    correctAnswer: '10.5.0.63',
    acceptedAnswers: ['10.5.0.63'],
    explanation:
      '/26 ⇒ 64 addresses (0–63 in the last octet for this base). Network 10.5.0.0, broadcast 10.5.0.63.',
    whyWrong: {
      '10.5.0.255': 'That would be /24 broadcast.',
      '10.5.0.64': 'First address of the next subnet.',
      '10.5.0.62': 'Last usable host, not broadcast.',
    },
    interviewTakeaway: 'Broadcast = network OR host-mask (all host bits 1).',
  }),
  q({
    id: 'd3-q16',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['DHCP'],
    learningObjective: 'Order the DHCP DORA exchange',
    question:
      'A laptop joins Wi‑Fi with no static IP. Which sequence correctly describes DHCP DORA?',
    options: [
      'Discover → Offer → Request → Acknowledge',
      'Request → Discover → Acknowledge → Offer',
      'Offer → ARP → DNS → Acknowledge',
      'SYN → SYN-ACK → ACK → DHCP',
    ],
    correctAnswer: 0,
    explanation:
      'Client broadcasts Discover; server Offers; client Requests a lease; server Acknowledges. Classic DORA.',
    whyWrong: {
      '1': 'Order scrambled.',
      '2': 'Mixes unrelated protocols into DHCP.',
      '3': 'That is TCP handshake, not DHCP.',
    },
    interviewTakeaway: 'Spell DORA and mention broadcast/UDP 67/68 if asked.',
  }),
  q({
    id: 'd3-q17',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['TLS', 'HTTPS'],
    learningObjective: 'Identify what TLS provides before HTTP data',
    question:
      'During a typical HTTPS connection setup (TLS 1.2 mental model), what is established before the encrypted HTTP request is sent?',
    options: [
      'A negotiated cipher suite, keying material, and authenticated server identity (certificate check)',
      'Only an ARP reply from the CA',
      'A permanent DHCP reservation for the certificate',
      'UDP three-way handshake with FIN',
    ],
    correctAnswer: 0,
    explanation:
      'TLS handshake negotiates parameters, authenticates the server via cert/PKI (usually), and derives keys for record-layer encryption.',
    whyWrong: {
      '1': 'CAs are not on-path ARP responders.',
      '2': 'DHCP unrelated to cert lifetime.',
      '3': 'UDP has no such handshake; FIN is TCP close.',
    },
    interviewTakeaway: 'Separate TCP handshake from TLS handshake from HTTP.',
  }),
  q({
    id: 'd3-q18',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Proxies', 'Load balancers'],
    learningObjective: 'Contrast forward proxy, reverse proxy, and LB roles',
    question:
      'Clients on a corporate network send outbound web traffic through a box that applies allowlists. Origin servers terminate TLS on a box that picks a backend. Which pairing is correct?',
    options: [
      'Outbound allowlist box = forward proxy; origin-facing backend chooser = reverse proxy / LB',
      'Both boxes are only CDNs',
      'Outbound box = reverse proxy; origin box = forward proxy',
      'Neither relates to proxies',
    ],
    correctAnswer: 0,
    explanation:
      'Forward proxies serve clients (egress). Reverse proxies/LBs sit in front of servers (ingress) and select backends.',
    whyWrong: {
      '1': 'CDN is a related edge cache pattern, not the definition here.',
      '2': 'Roles reversed.',
      '3': 'These are textbook proxy roles.',
    },
    interviewTakeaway: 'Forward = client’s agent; reverse = server’s front door.',
  }),
  q({
    id: 'd3-q19',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Subnetting', 'CIDR'],
    learningObjective: 'Count subnets when lengthening the prefix',
    question:
      'How many distinct /26 networks fit inside one /24? Enter an integer.',
    correctAnswer: '4',
    acceptedAnswers: ['4'],
    explanation:
      'Moving from /24 to /26 borrows 2 bits ⇒ 2^2 = 4 subnets (each with 64 addresses).',
    whyWrong: {
      '2': 'That would be borrowing 1 bit (/25).',
      '8': 'That would be /27 inside /24 (3 bits).',
      '64': 'Confuses addresses-per-subnet with subnet count.',
    },
    interviewTakeaway: 'Subnet count = 2^(newPrefix − oldPrefix).',
  }),
  tf({
    id: 'd3-q20',
    difficulty: 'medium',
    topics: ['ARP', 'DNS'],
    learningObjective: 'Separate local ARP from global DNS caching',
    question:
      'True or False: A successful DNS A-record lookup for a remote website also installs that remote host’s MAC address into the client’s ARP table.',
    correct: false,
    explanation:
      'DNS yields an IP. ARP resolves only the local next-hop MAC (gateway or on-link host), not the remote server’s MAC across the Internet.',
    whyWrong: {
      '0': 'True confuses end-to-end IP with local L2 addressing — a common mix-up.',
    },
    interviewTakeaway: 'Remote MAC is unknown/irrelevant; your NIC talks to the gateway’s MAC.',
  }),

  // ===== HARD (10) =====
  q({
    id: 'd3-q21',
    type: 'numerical',
    difficulty: 'hard',
    topics: ['Subnetting', 'CIDR'],
    learningObjective: 'Choose the smallest prefix that fits a host count',
    question:
      'You need at least 500 usable IPv4 host addresses in one subnet (classic network+broadcast reserved). What is the longest prefix length (smallest network) that still fits? Enter like /23.',
    correctAnswer: '/23',
    acceptedAnswers: ['/23', '23'],
    explanation:
      'Need 2^h − 2 ≥ 500 ⇒ 2^h ≥ 502 ⇒ h ≥ 9 ⇒ prefix 32−9 = /23 (510 usable). /24 only has 254 usable.',
    whyWrong: {
      '/24': 'Only 254 usable — too small.',
      '/22': 'Works but is larger than necessary (not longest prefix).',
      '/25': 'Only 126 usable.',
    },
    interviewTakeaway: 'Round host needs up to next power-of-two block, then subtract 2.',
  }),
  q({
    id: 'd3-q22',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['URL navigation', 'DNS', 'TCP', 'TLS', 'HTTP'],
    learningObjective: 'Narrate the full path of typing an HTTPS URL',
    question:
      'Interview prompt: walk through https://cdn.example.com/app.js from Enter to first bytes of the file. Which sequence is most accurate?',
    options: [
      'Parse URL → DNS for hostname → TCP handshake to resolved IP → TLS handshake → HTTP GET → response body',
      'HTTP GET first → then DNS → then ARP for the certificate authority → TCP',
      'DHCP Discover to cdn.example.com → UDP handshake → raw HTTP without IP',
      'TLS to the DNS server carrying the full JS payload inside NXDOMAIN',
    ],
    correctAnswer: 0,
    explanation:
      'Name must become an IP; TCP connects; TLS secures; then HTTP retrieves the object. ARP may occur locally for the next hop but is not “ARP for the CA.”',
    whyWrong: {
      '1': 'HTTP cannot precede knowing where/how to connect.',
      '2': 'DHCP is local config; no UDP “handshake” replacing TCP/TLS.',
      '3': 'Nonsensical misuse of DNS/TLS.',
    },
    interviewTakeaway: 'Add HSTS, connection reuse, and CDN anycast as advanced follow-ups.',
  }),
  q({
    id: 'd3-q23',
    type: 'multi',
    difficulty: 'hard',
    topics: ['Load balancers', 'Proxies', 'CDN'],
    learningObjective: 'Classify L4 vs L7 load-balancing capabilities',
    question:
      'Which capabilities typically require L7 (HTTP-aware) load balancing / reverse proxy behavior rather than pure L4? (Select all that apply)',
    options: [
      'Route by Host header or URL path',
      'Terminate TLS and inspect HTTP cookies for stickiness',
      'Forward TCP bytes solely by destination IP:port/VIP with no HTTP parse',
      'Rewrite or inject HTTP headers before hitting backends',
    ],
    correctAnswer: [0, 1, 3],
    explanation:
      'Path/Host routing, cookie stickiness after TLS termination, and header rewrites need application awareness. Pure L4 forwards connections/packets without parsing HTTP.',
    whyWrong: {
      '2': 'That is classic L4 — not an L7-only capability.',
    },
    interviewTakeaway: 'L4 = fast/passthrough; L7 = smart/content-aware; CDNs are often L7 at the edge.',
  }),
  q({
    id: 'd3-q24',
    type: 'code',
    difficulty: 'hard',
    topics: ['TCP', 'Flow control', 'Congestion control'],
    learningObjective: 'Interpret cwnd vs rwnd limiting the send rate',
    question:
      'Given these simplified TCP variables, how many full-sized segments can the sender transmit before needing an ACK update (ignore SACK/window scaling nuances)?',
    codeSnippet: {
      language: 'text',
      code: `MSS = 1000 bytes
cwnd = 4000 bytes
rwnd = 2500 bytes
in_flight = 0`,
    },
    options: [
      '4 segments (limited by cwnd alone)',
      '2 segments (limited by min(cwnd,rwnd)=2500)',
      '2.5 segments on the wire as a single TCP segment',
      'Unlimited because UDP',
    ],
    correctAnswer: 1,
    explanation:
      'Sendable bytes ≈ min(cwnd, rwnd) − in_flight = 2500. With MSS 1000, that is two full segments (500 bytes of window left unused for a third full MSS).',
    whyWrong: {
      '0': 'Ignores rwnd being tighter than cwnd.',
      '2': 'TCP sends integer segments; window can leave leftover bytes.',
      '3': 'This is TCP windowing.',
    },
    interviewTakeaway: 'Bottleneck is the minimum of congestion and receiver windows.',
  }),
  q({
    id: 'd3-q25',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['TCP', 'Congestion control'],
    learningObjective: 'Explain slow start vs congestion avoidance at a high level',
    question:
      'A bulk TCP transfer starts on a cold connection and throughput ramps quickly, then grows more slowly after a threshold. Which explanation is best?',
    options: [
      'Slow start exponentially increases cwnd each RTT until ssthresh, then congestion avoidance increases more conservatively',
      'DNS TTL expiry forces cwnd to zero every packet',
      'ARP replaces congestion control on WAN paths',
      'HTTP status 200 disables all windowing',
    ],
    correctAnswer: 0,
    explanation:
      'Classic Reno-style story: slow start grows cwnd aggressively; past ssthresh, congestion avoidance (e.g. linear) probes capacity more carefully. Loss/ECN updates ssthresh/cwnd.',
    whyWrong: {
      '1': 'DNS TTL does not zero cwnd per packet.',
      '2': 'ARP is local L2.',
      '3': 'HTTP status unrelated to TCP cwnd rules.',
    },
    interviewTakeaway: 'Name slow start, ssthresh, congestion avoidance, and a loss response (e.g. multiplicative decrease).',
  }),
  q({
    id: 'd3-q26',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Subnetting', 'CIDR'],
    learningObjective: 'Apply VLSM-style allocation reasoning',
    question:
      'You have 172.16.0.0/22 to carve. Team A needs ~200 hosts, Team B ~50, Team C ~10. Which allocation is valid and efficient?',
    options: [
      'A: 172.16.0.0/24, B: 172.16.1.0/26, C: 172.16.1.64/28 (all non-overlapping inside /22)',
      'A: 172.16.0.0/24, B: 172.16.0.0/26, C: 172.16.0.0/28 (overlapping same base)',
      'A: 172.16.0.0/25 only — claim /25 has 200 usable hosts',
      'Give each team a /22 — three overlapping identical blocks',
    ],
    correctAnswer: 0,
    explanation:
      '/24 ⇒ 254 hosts for A; /26 ⇒ 62 for B; /28 ⇒ 14 for C. Subnets listed do not overlap and sit inside 172.16.0.0–172.16.3.255.',
    whyWrong: {
      '1': 'Overlapping prefixes — invalid.',
      '2': '/25 has only 126 usable.',
      '3': 'Cannot assign the same /22 thrice without overlap.',
    },
    interviewTakeaway: 'VLSM: size each subnet, place without overlap, keep summarization in mind.',
  }),
  q({
    id: 'd3-q27',
    type: 'numerical',
    difficulty: 'hard',
    topics: ['Subnetting', 'CIDR'],
    learningObjective: 'Compute last usable address in a large block',
    question:
      'For 172.16.0.0/22, what is the last usable host address (not the broadcast)? Enter dotted-quad.',
    correctAnswer: '172.16.3.254',
    acceptedAnswers: ['172.16.3.254'],
    explanation:
      '/22 spans 172.16.0.0–172.16.3.255. Broadcast 172.16.3.255; last usable 172.16.3.254.',
    whyWrong: {
      '172.16.3.255': 'Broadcast, not usable host.',
      '172.16.0.254': 'Ignores the /22 range spanning four /24s.',
      '172.16.1.254': 'Not the top of the /22.',
    },
    interviewTakeaway: '/22 = four consecutive /24s; watch the third octet.',
  }),
  q({
    id: 'd3-q28',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['DNS', 'CDN', 'TLS', 'HTTP'],
    learningObjective: 'Debug layered failures on a CDN-fronted HTTPS site',
    question:
      'Users see NET::ERR_CERT_COMMON_NAME_INVALID for https://shop.example.com. Dig shows shop CNAME to d123.cloudfront.net, and the browser connected to the CDN edge. Which root cause is most likely?',
    options: [
      'TLS certificate on the edge does not cover shop.example.com (missing SAN/name mismatch)',
      'DHCP failed on the client so TCP ports do not exist',
      'ARP cannot resolve the CloudFront MAC globally',
      'UDP congestion control rejected the certificate',
    ],
    correctAnswer: 0,
    explanation:
      'CNAME to a CDN is normal; the edge cert must still match the name the user typed (shop.example.com). CN/SAN mismatch yields this class of errors.',
    whyWrong: {
      '1': 'DHCP failure usually means no connectivity at all, not a specific cert CN error.',
      '2': 'Clients never ARP for CloudFront’s remote MAC.',
      '3': 'Not a thing.',
    },
    interviewTakeaway: 'Separate DNS pointing, TCP reachability, and cert name coverage when debugging HTTPS.',
  }),
  q({
    id: 'd3-q29',
    type: 'multi',
    difficulty: 'hard',
    topics: ['URL navigation', 'DNS', 'TCP', 'TLS', 'HTTP'],
    learningObjective: 'Select events that occur on a cold HTTPS page load',
    question:
      'Cold cache, recursive DNS available, IPv4-only client loads https://example.com/ (no redirect). Which events normally occur? (Select all that apply)',
    options: [
      'DNS resolution for example.com',
      'TCP three-way handshake to the destination IP',
      'TLS handshake before the HTTP GET',
      'A DHCP DORA exchange with example.com’s authoritative nameserver as the DHCP server',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'Cold HTTPS load: resolve name, TCP connect, TLS, then HTTP. DHCP is orthogonal local config — not done with the site’s auth NS.',
    whyWrong: {
      '3': 'Conflates DHCP with DNS authority — incorrect.',
    },
    interviewTakeaway: 'Be precise about which protocols talk to which servers.',
  }),
  q({
    id: 'd3-q30',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['OSI', 'TCP/IP', 'Load balancers', 'HTTP'],
    learningObjective: 'Combine layering with LB placement in an interview answer',
    question:
      'A service exposes VIP 203.0.113.10. An L4 LB forwards TCP 443 to backends that terminate TLS and speak HTTP. Where is HTTP first available as cleartext inside the path?',
    options: [
      'On the wire from client to VIP (before LB) — HTTP is always cleartext on 443',
      'Only after TLS is terminated on a backend (or an L7 hop that decrypts) — client-to-VIP bytes are TLS records',
      'At the DNS recursive resolver',
      'Inside ARP replies carrying HTML',
    ],
    correctAnswer: 1,
    explanation:
      'Port 443 carries TLS from client through L4 LB (passthrough). HTTP plaintext appears after TLS termination on the backend (or if you used an L7 LB that decrypts).',
    whyWrong: {
      '0': 'HTTPS on 443 is encrypted; L4 LB does not decrypt.',
      '2': 'DNS is not the HTTP cleartext path.',
      '3': 'ARP does not carry HTML payloads.',
    },
    interviewTakeaway: 'State where TLS terminates — it defines who can do L7 routing and see HTTP.',
  }),
]

export default day3Questions
