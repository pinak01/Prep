import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from '../helpers'

/** Day 3 module checkpoints — 8 questions each (3 easy / 3 medium / 2 hard). */
export const day3ModuleQuizzes: Record<string, QuizQuestion[]> = {
  // ===== d3-m1 Networking Models & Addressing =====
  'd3-m1': [
    q({
      id: 'd3-m1-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['OSI', 'TCP/IP'],
      learningObjective: 'Map HTTP to the layered model',
      question: 'In the TCP/IP model, HTTP is primarily an example of which layer?',
      options: ['Link layer', 'Internet/Network layer', 'Transport layer', 'Application layer'],
      correctAnswer: 3,
      explanation:
        'HTTP is an application protocol. TCP/UDP are transport; IP is internet; Ethernet/Wi‑Fi are link.',
      whyWrong: {
        '0': 'Link is framing/MAC.',
        '1': 'IP/routing live at internet layer.',
        '2': 'TCP/UDP are transport.',
      },
      interviewTakeaway: 'Place protocols in layers quickly: HTTP→app, TCP→transport, IP→internet.',
    }),
    tf({
      id: 'd3-m1-q02',
      difficulty: 'easy',
      topics: ['IP Addressing'],
      learningObjective: 'Distinguish IPv4 address size',
      question: 'True or False: An IPv4 address is 32 bits long.',
      correct: true,
      explanation: 'IPv4 = 32-bit addresses; IPv6 = 128-bit addresses.',
      whyWrong: {
        '1': 'False would confuse IPv4 with IPv6 width.',
      },
      interviewTakeaway: 'Memorize 32-bit IPv4 vs 128-bit IPv6.',
    }),
    q({
      id: 'd3-m1-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Subnetting', 'CIDR'],
      learningObjective: 'Interpret a CIDR prefix length',
      question: 'In 192.168.1.0/24, the /24 means:',
      options: [
        '24 hosts only',
        'The first 24 bits are the network prefix',
        'The address is IPv6',
        'The TTL is 24',
      ],
      correctAnswer: 1,
      explanation:
        'CIDR /n sets a network prefix of n bits. /24 leaves 8 host bits (minus network/broadcast in classic IPv4 usage).',
      whyWrong: {
        '0': 'Host count is 2^(32-24) addresses in the block, not “24 hosts.”',
        '2': 'This is IPv4 dotted quad.',
        '3': 'TTL is unrelated to the prefix.',
      },
      interviewTakeaway: '/n = prefix length; hosts = 2^(32-n) in the block.',
    }),
    q({
      id: 'd3-m1-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['OSI'],
      learningObjective: 'Identify layer responsibilities',
      question: 'Which OSI layer is primarily responsible for end-to-end reliable delivery (when used)?',
      options: ['Physical', 'Data Link', 'Network', 'Transport'],
      correctAnswer: 3,
      explanation:
        'Transport (TCP) provides end-to-end reliability, ports, and congestion/flow control. Network routes packets; link delivers on a single hop/segment.',
      whyWrong: {
        '0': 'Physical moves bits/signals.',
        '1': 'Link is adjacent-node framing/MAC.',
        '2': 'Network = logical addressing/routing (IP).',
      },
      interviewTakeaway: 'Reliability & ports → transport; routing → network.',
    }),
    q({
      id: 'd3-m1-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Subnetting'],
      learningObjective: 'Compute usable hosts in a subnet',
      question:
        'How many usable host addresses are in a typical IPv4 /26 LAN (excluding network & broadcast)?',
      options: ['62', '64', '26', '30'],
      correctAnswer: 0,
      explanation:
        '/26 ⇒ 2^(32-26) = 64 addresses; subtract network and broadcast ⇒ 62 usable in classic IPv4 subnetting.',
      whyWrong: {
        '1': '64 counts network + broadcast too.',
        '2': 'Confuses prefix length with host count.',
        '3': '30 is the /27 usable count.',
      },
      interviewTakeaway: 'Usable ≈ 2^(32-prefix) − 2 for ordinary IPv4 subnets.',
    }),
    tf({
      id: 'd3-m1-q06',
      difficulty: 'medium',
      topics: ['IP Addressing'],
      learningObjective: 'Recognize private IPv4 ranges',
      question:
        'True or False: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 are reserved private IPv4 ranges (RFC 1918) not routed on the public Internet.',
      correct: true,
      explanation:
        'Private addresses are used inside orgs/NAT. They must not appear as globally routable destinations on the public Internet.',
      whyWrong: {
        '1': 'False would miss a standard interview fact.',
      },
      interviewTakeaway: 'List the three RFC 1918 blocks confidently.',
    }),
    q({
      id: 'd3-m1-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Subnetting', 'CIDR'],
      learningObjective: 'Find the network address from IP + mask',
      question:
        'Host 10.20.35.77/20 — what is the network address?',
      options: ['10.20.35.0', '10.20.32.0', '10.20.0.0', '10.20.35.77'],
      correctAnswer: 1,
      explanation:
        '/20 ⇒ mask 255.255.240.0. In the third octet, 35 & ~15 = 32 (block size 16). Network = 10.20.32.0.',
      whyWrong: {
        '0': 'Does not align to the /20 boundary.',
        '2': 'That would be a /16-style network.',
        '3': 'That is the host address, not the network.',
      },
      interviewTakeaway: 'AND address with mask; know block sizes for /20, /22, etc.',
    }),
    q({
      id: 'd3-m1-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['TCP/IP', 'Encapsulation'],
      learningObjective: 'Describe encapsulation order',
      question:
        'When an application sends data over TCP/IP Ethernet, which encapsulation order is correct (outermost last)?',
      options: [
        'Ethernet → IP → TCP → application data',
        'Application data → TCP → IP → Ethernet',
        'IP → Ethernet → TCP → application data',
        'TCP → application data → Ethernet → IP',
      ],
      correctAnswer: 1,
      explanation:
        'Sender wraps app data in TCP segment, then IP packet, then Ethernet frame. Receiver unwraps in reverse.',
      whyWrong: {
        '0': 'Reverses the send-side wrap order.',
        '2': 'Scrambles layering.',
        '3': 'Scrambles layering.',
      },
      interviewTakeaway: 'Encapsulation: app → transport → network → link.',
    }),
  ],

  // ===== d3-m2 Core Network Services =====
  'd3-m2': [
    q({
      id: 'd3-m2-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['DNS'],
      learningObjective: 'State DNS purpose',
      question: 'DNS primarily maps:',
      options: [
        'MAC addresses to switch ports only',
        'Human-readable names to IP addresses (and related records)',
        'File paths to inodes',
        'SQL tables to indexes',
      ],
      correctAnswer: 1,
      explanation:
        'DNS resolves names to A/AAAA (and serves MX, CNAME, TXT, etc.). It is critical infrastructure for almost every networked app.',
      whyWrong: {
        '0': 'That is closer to switching/CAM, not DNS.',
        '2': 'Filesystem metadata.',
        '3': 'Database internals.',
      },
      interviewTakeaway: 'DNS = name → IP (+ other RRs); mention caching and TTL.',
    }),
    tf({
      id: 'd3-m2-q02',
      difficulty: 'easy',
      topics: ['DHCP'],
      learningObjective: 'State DHCP role',
      question:
        'True or False: DHCP can automatically assign IP address, subnet mask, default gateway, and DNS servers to clients.',
      correct: true,
      explanation:
        'DHCP leases configuration so hosts join a network without manual IP setup.',
      whyWrong: {
        '1': 'False understates DHCP’s common options.',
      },
      interviewTakeaway: 'DHCP = automated host network config (lease).',
    }),
    q({
      id: 'd3-m2-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['ARP'],
      learningObjective: 'Define ARP',
      question: 'ARP is used on Ethernet/IPv4 LANs to:',
      options: [
        'Encrypt HTTP payloads',
        'Resolve an IPv4 address to a MAC address',
        'Allocate TCP port numbers',
        'Compress DNS responses',
      ],
      correctAnswer: 1,
      explanation:
        'ARP answers “who has IP X?” with a MAC so frames can be delivered on the L2 segment. IPv6 uses NDP instead.',
      whyWrong: {
        '0': 'TLS/HTTPS encrypt; ARP does not.',
        '2': 'Ephemeral ports are OS/transport concerns.',
        '3': 'DNS compression is separate.',
      },
      interviewTakeaway: 'ARP: IPv4 → MAC on a LAN.',
    }),
    q({
      id: 'd3-m2-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Routing'],
      learningObjective: 'Contrast routing vs switching',
      question:
        'A router forwards packets between networks primarily using:',
      options: [
        'MAC addresses alone in the IP header',
        'Destination IP address and a routing table/FIB',
        'HTTP cookies',
        'SQL primary keys',
      ],
      correctAnswer: 1,
      explanation:
        'L3 forwarding looks up the destination IP longest-prefix match. Switches forward frames by MAC within a broadcast domain.',
      whyWrong: {
        '0': 'MACs are L2; IP headers carry IPs.',
        '2': 'Cookies are application state.',
        '3': 'Unrelated.',
      },
      interviewTakeaway: 'Router = IP lookup; switch = MAC lookup.',
    }),
    q({
      id: 'd3-m2-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['DNS'],
      learningObjective: 'Explain recursive vs iterative resolution',
      question:
        'When your stub resolver asks a recursive resolver for example.com, the recursive resolver typically:',
      options: [
        'Only queries the authoritative server for unrelated TLDs and stops',
        'Walks the hierarchy (root → TLD → authoritative), possibly iteratively, and returns the answer (cached)',
        'Rewrites the IP stack MTU',
        'Issues an ARP for the domain string',
      ],
      correctAnswer: 1,
      explanation:
        'Recursive resolvers perform the heavy lifting of hierarchy traversal and caching; stubs ask them recursively.',
      whyWrong: {
        '0': 'Incomplete description of resolution.',
        '2': 'MTU is unrelated.',
        '3': 'ARP does not resolve DNS names.',
      },
      interviewTakeaway: 'Stub → recursive resolver → hierarchy; cache + TTL matter.',
    }),
    tf({
      id: 'd3-m2-q06',
      difficulty: 'medium',
      topics: ['DHCP', 'ARP'],
      learningObjective: 'Order DHCP and ARP in host bring-up',
      question:
        'True or False: A host often uses DHCP to learn its IP/gateway/DNS, then uses ARP when sending IP packets to resolve next-hop MACs on the LAN.',
      correct: true,
      explanation:
        'DHCP configures L3 identity and defaults; ARP (or NDP) resolves L2 addresses for on-link delivery.',
      whyWrong: {
        '1': 'False scrambles a common boot/join sequence.',
      },
      interviewTakeaway: 'DHCP for config; ARP/NDP for on-link delivery.',
    }),
    q({
      id: 'd3-m2-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['DNS', 'Security'],
      learningObjective: 'Describe DNS cache poisoning risk at a high level',
      question:
        'Why can forged DNS answers be dangerous if accepted into a resolver cache?',
      options: [
        'They only slow TXT lookups cosmetically',
        'Clients may be redirected to attacker-controlled IPs for trusted names until TTL expires',
        'They automatically enable SQL injection',
        'They increase TCP congestion windows',
      ],
      correctAnswer: 1,
      explanation:
        'Poisoned cache entries steer users to wrong hosts — a serious integrity failure. Defenses include DNSSEC, hardened resolvers, and least privilege on who can update records. Discuss defensively.',
      whyWrong: {
        '0': 'Impact is redirection/trust break, not cosmetic.',
        '2': 'Different vulnerability class.',
        '3': 'Unrelated to congestion control.',
      },
      interviewTakeaway: 'DNS integrity matters; mention DNSSEC/caching risks defensively.',
    }),
    q({
      id: 'd3-m2-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Routing'],
      learningObjective: 'Explain longest-prefix match',
      question:
        'A router has routes 10.0.0.0/8 and 10.1.2.0/24. Packet to 10.1.2.5 is forwarded using:',
      options: [
        'The /8 always, because it is larger',
        'The /24 via longest-prefix match',
        'Neither — IP forbids overlapping prefixes',
        'Round-robin between both forever',
      ],
      correctAnswer: 1,
      explanation:
        'Forwarding picks the most specific matching prefix (longest mask). Overlapping prefixes are normal in routing tables.',
      whyWrong: {
        '0': 'Larger aggregates lose to more specific routes.',
        '2': 'Overlaps are expected; specificity decides.',
        '3': 'Not the default IP lookup rule.',
      },
      interviewTakeaway: 'FIB lookup = longest-prefix match.',
    }),
  ],

  // ===== d3-m3 Transport Layer TCP & UDP =====
  'd3-m3': [
    q({
      id: 'd3-m3-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['UDP'],
      learningObjective: 'Characterize UDP',
      question: 'UDP is best described as:',
      options: [
        'Connection-oriented with retransmission by default',
        'Connectionless, unreliable datagram delivery with ports and checksum',
        'A routing protocol replacing BGP',
        'An encryption layer replacing TLS',
      ],
      correctAnswer: 1,
      explanation:
        'UDP sends datagrams without connection setup or reliability. Apps that need reliability build it above UDP (or use TCP/QUIC).',
      whyWrong: {
        '0': 'That describes TCP.',
        '2': 'UDP is transport, not interdomain routing.',
        '3': 'TLS is separate; can run over UDP (DTLS/QUIC designs differ).',
      },
      interviewTakeaway: 'UDP = simple datagrams; no built-in reliability.',
    }),
    tf({
      id: 'd3-m3-q02',
      difficulty: 'easy',
      topics: ['TCP'],
      learningObjective: 'State TCP connection orientation',
      question:
        'True or False: TCP provides a byte-stream abstraction with connection setup, reliability, and ordered delivery (within a connection).',
      correct: true,
      explanation:
        'TCP is connection-oriented, reliable, ordered byte stream with flow and congestion control.',
      whyWrong: {
        '1': 'False would mis-sell TCP’s contract.',
      },
      interviewTakeaway: 'TCP = reliable ordered byte stream + congestion control.',
    }),
    q({
      id: 'd3-m3-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['TCP Handshake'],
      learningObjective: 'Recall the three-way handshake',
      question: 'The classic TCP three-way handshake flag sequence is:',
      options: ['SYN, SYN-ACK, ACK', 'FIN, FIN-ACK, ACK', 'RST, SYN, ACK', 'PSH, ACK, FIN'],
      correctAnswer: 0,
      explanation:
        'Client SYN → server SYN-ACK → client ACK establishes the connection and synchronizes sequence numbers.',
      whyWrong: {
        '1': 'That is closer to connection teardown patterns.',
        '2': 'RST aborts; not the setup trio.',
        '3': 'Not the establishment sequence.',
      },
      interviewTakeaway: 'SYN → SYN-ACK → ACK — know why sequence numbers sync.',
    }),
    q({
      id: 'd3-m3-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['TCP', 'Flow Control'],
      learningObjective: 'Distinguish flow vs congestion control',
      question: 'TCP flow control primarily protects:',
      options: [
        'The network from aggregate overload only',
        'The receiver from being overwhelmed (receive window)',
        'DNS caches from poisoning',
        'Disk filesystems from fragmentation',
      ],
      correctAnswer: 1,
      explanation:
        'Flow control uses the advertise receive window so the sender does not overrun the receiver. Congestion control reacts to network signals (loss/ECN/delay).',
      whyWrong: {
        '0': 'That is congestion control’s concern.',
        '2': 'DNS security is separate.',
        '3': 'Unrelated.',
      },
      interviewTakeaway: 'Flow = receiver; congestion = network.',
    }),
    q({
      id: 'd3-m3-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['TCP', 'Congestion Control'],
      learningObjective: 'Describe congestion window role',
      question: 'The TCP congestion window (cwnd) limits:',
      options: [
        'The maximum size of an Ethernet frame on the wire permanently',
        'How much unacknowledged data the sender may have in flight due to network congestion control',
        'The number of DNS labels in a name',
        'The OS process priority',
      ],
      correctAnswer: 1,
      explanation:
        'Senders pace in-flight data by min(cwnd, rwnd). Loss/ECN/delay algorithms adjust cwnd (slow start, congestion avoidance, etc.).',
      whyWrong: {
        '0': 'MTU/frame size is not cwnd.',
        '2': 'DNS naming unrelated.',
        '3': 'Scheduling priority unrelated.',
      },
      interviewTakeaway: 'In flight ≤ min(cwnd, rwnd).',
    }),
    tf({
      id: 'd3-m3-q06',
      difficulty: 'medium',
      topics: ['TCP', 'UDP'],
      learningObjective: 'Choose TCP vs UDP for a use case',
      question:
        'True or False: Latency-sensitive media or simple request/response protocols sometimes prefer UDP (or UDP-based stacks) when the application can tolerate or recover from loss itself.',
      correct: true,
      explanation:
        'UDP avoids head-of-line blocking and connection overhead when apps manage reliability/timeliness. TCP remains default for reliable byte streams.',
      whyWrong: {
        '1': 'False ignores real UDP use cases (DNS historically, games, VoIP, QUIC on UDP).',
      },
      interviewTakeaway: 'Pick transport from loss/latency/HOL blocking needs.',
    }),
    q({
      id: 'd3-m3-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['TCP', 'Sliding Window'],
      learningObjective: 'Explain sliding window efficiency',
      question: 'TCP’s sliding window improves throughput mainly by:',
      options: [
        'Sending only one byte per RTT forever',
        'Allowing multiple segments in flight before waiting for each ACK, pipelining within the window',
        'Disabling acknowledgments',
        'Removing sequence numbers',
      ],
      correctAnswer: 1,
      explanation:
        'Windows pipeline data across the RTT bandwidth product instead of stop-and-wait per segment.',
      whyWrong: {
        '0': 'Stop-and-wait wastes high-BDP paths.',
        '2': 'ACKs remain essential.',
        '3': 'Sequence numbers enable reliability/ordering.',
      },
      interviewTakeaway: 'Windowing fills the pipe: relate to BDP.',
    }),
    q({
      id: 'd3-m3-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['TCP Handshake', 'Security'],
      learningObjective: 'Explain SYN flood defensively at high level',
      question:
        'A SYN flood overwhelms a server by:',
      options: [
        'Sending many connection attempts that consume half-open state, degrading capacity for legitimate clients',
        'Encrypting all payloads with AES',
        'Deleting the server’s routing table via ARP',
        'Forcing all clients onto UDP only',
      ],
      correctAnswer: 0,
      explanation:
        'Half-open TCP state is finite. Defenses include SYN cookies, firewalls/rate limits, and capacity planning — discuss mitigation, not offense.',
      whyWrong: {
        '1': 'Encryption is not the flood mechanism.',
        '2': 'Misstates ARP effects.',
        '3': 'Not what a SYN flood does.',
      },
      interviewTakeaway: 'SYN flood = state exhaustion; mention SYN cookies/defenses only.',
    }),
  ],

  // ===== d3-m4 Application Layer & Web Infrastructure =====
  'd3-m4': [
    q({
      id: 'd3-m4-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['HTTP'],
      learningObjective: 'Identify safe/idempotent GET semantics (ideal)',
      question: 'HTTP GET is intended to be:',
      options: [
        'A non-safe state-changing operation by design',
        'Safe and idempotent retrieval of a resource representation',
        'A replacement for TLS',
        'Only usable with UDP',
      ],
      correctAnswer: 1,
      explanation:
        'GET should not change server state (safe) and repeated GETs have the same effect (idempotent). Real apps sometimes violate this — call out the contract.',
      whyWrong: {
        '0': 'That would be POST-like misuse.',
        '2': 'TLS is separate (HTTPS).',
        '3': 'HTTP commonly runs over TCP/QUIC.',
      },
      interviewTakeaway: 'Method semantics: GET safe/idempotent; POST not necessarily.',
    }),
    tf({
      id: 'd3-m4-q02',
      difficulty: 'easy',
      topics: ['TLS', 'HTTPS'],
      learningObjective: 'State HTTPS role',
      question:
        'True or False: HTTPS is HTTP over TLS, providing confidentiality and integrity for the HTTP bytes on the wire (plus authentication of the server via certificates when validated correctly).',
      correct: true,
      explanation:
        'TLS protects the channel. Certificate validation and modern cipher suites matter for real security.',
      whyWrong: {
        '1': 'False understates transport security.',
      },
      interviewTakeaway: 'HTTPS = HTTP + TLS; mention cert validation.',
    }),
    q({
      id: 'd3-m4-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['REST'],
      learningObjective: 'State a REST resource idea',
      question: 'In common REST-style HTTP APIs, resources are typically manipulated via:',
      options: [
        'Raw IP fragments only',
        'URLs/URIs identifying resources and HTTP methods acting on them',
        'MAC address rewrites',
        'Filesystem inodes exposed to the Internet',
      ],
      correctAnswer: 1,
      explanation:
        'REST-ish APIs expose resources at URIs with methods (GET/POST/PUT/PATCH/DELETE) and representations (often JSON).',
      whyWrong: {
        '0': 'Too low-level.',
        '2': 'L2 mechanism.',
        '3': 'Dangerous and not REST.',
      },
      interviewTakeaway: 'Resource + URI + method + representation.',
    }),
    q({
      id: 'd3-m4-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['HTTP', 'HTTP/2'],
      learningObjective: 'Contrast HTTP/1.1 and HTTP/2 multiplexing',
      question: 'HTTP/2’s multiplexing mainly helps by:',
      options: [
        'Removing the need for TLS forever',
        'Interleaving multiple streams on one connection to reduce head-of-line blocking at the HTTP message layer vs many HTTP/1.1 connections',
        'Replacing DNS',
        'Making UDP mandatory',
      ],
      correctAnswer: 1,
      explanation:
        'HTTP/2 frames multiple streams on one TCP connection. TCP HOL blocking can remain; HTTP/3/QUIC addresses that differently.',
      whyWrong: {
        '0': 'HTTP/2 is commonly used with TLS but does not obsolete TLS’s purpose.',
        '2': 'DNS remains.',
        '3': 'HTTP/2 is typically over TCP; HTTP/3 uses QUIC/UDP.',
      },
      interviewTakeaway: 'H2 multiplexes streams; mention TCP HOL → H3/QUIC.',
    }),
    q({
      id: 'd3-m4-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Proxies', 'Load Balancers'],
      learningObjective: 'Distinguish reverse proxy / LB role',
      question: 'A reverse proxy / Layer-7 load balancer in front of app servers typically:',
      options: [
        'Terminates client connections and forwards to upstreams (routing, TLS, health checks)',
        'Replaces the need for application authentication always',
        'Assigns public IPs to every browser tab',
        'Compiles TypeScript on the client',
      ],
      correctAnswer: 0,
      explanation:
        'Edge proxies terminate clients, apply routing/policies, and distribute load. AuthZ still belongs in the app/zero-trust design — proxies can help but do not replace it by magic.',
      whyWrong: {
        '1': 'Auth remains a first-class concern.',
        '2': 'Nonsense addressing model.',
        '3': 'Unrelated.',
      },
      interviewTakeaway: 'LB/reverse proxy = terminate, route, health-check, scale out.',
    }),
    tf({
      id: 'd3-m4-q06',
      difficulty: 'medium',
      topics: ['CDN'],
      learningObjective: 'Explain CDN purpose',
      question:
        'True or False: A CDN caches (and often serves) content from edge locations closer to users to reduce latency and origin load.',
      correct: true,
      explanation:
        'CDNs improve performance and absorb traffic. Cache keys, TTLs, and purge strategy matter for correctness.',
      whyWrong: {
        '1': 'False ignores a standard web-scale pattern.',
      },
      interviewTakeaway: 'CDN = edge cache + performance/availability; mind invalidation.',
    }),
    q({
      id: 'd3-m4-q07',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['WebSockets'],
      learningObjective: 'Contrast WebSockets with request/response HTTP',
      question: 'WebSockets are useful when you need:',
      options: [
        'Only one-shot DNS lookups',
        'A persistent, full-duplex channel after an HTTP upgrade for ongoing messages',
        'To avoid all authentication forever',
        'To replace IP routing',
      ],
      correctAnswer: 1,
      explanation:
        'WebSockets start with HTTP then switch to a long-lived bidirectional channel — good for push/interactive apps. Still require authz and careful framing.',
      whyWrong: {
        '0': 'DNS is orthogonal.',
        '2': 'Security controls still apply.',
        '3': 'Transport/app feature, not routing replacement.',
      },
      interviewTakeaway: 'WS = upgraded persistent full-duplex; still secure it.',
    }),
    q({
      id: 'd3-m4-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['HTTP', 'Request Path'],
      learningObjective: 'Narrate URL → response path',
      question:
        '“What happens when you type a URL?” — which step order is most accurate at interview level?',
      options: [
        'TLS handshake, then DNS, then TCP, then HTTP',
        'DNS resolve → TCP connect (or QUIC) → TLS (if HTTPS) → HTTP request/response → render',
        'HTTP response, then ARP for the domain name, then DNS',
        'Only ARP, then render HTML with no transport',
      ],
      correctAnswer: 1,
      explanation:
        'Name resolution first (often cached), then transport connect, then TLS for HTTPS, then HTTP, then browser work. HSTS/connection reuse can reorder micro-details — state the classic path clearly.',
      whyWrong: {
        '0': 'TLS cannot precede knowing where to connect via DNS (unless already known).',
        '2': 'Order is reversed/nonsensical.',
        '3': 'Omits IP/transport.',
      },
      interviewTakeaway: 'DNS → connect → TLS → HTTP → render; mention caches/keep-alive.',
    }),
  ],
}
