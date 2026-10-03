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

export const d3p1: StudyPage = createPage(
  'd3-p1',
  'OSI Model',
  14,
  [
    'Name the 7 OSI layers bottom-up and top-down with one-line responsibilities',
    'Map common protocols (Ethernet, IP, TCP/UDP, HTTP, TLS) to OSI layers',
    'Explain encapsulation/decapsulation and why layering helps design and debugging',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'The OSI (Open Systems Interconnection) model is a 7-layer reference model from ISO that describes how networked systems communicate. It is not a protocol suite you install — it is a vocabulary for separating concerns: physical bits, frames, packets, end-to-end reliability, sessions, data representation, and applications.',
        ),
        h3('Why it exists'),
        p(
          'Before layered models, vendors built monolithic stacks that were hard to interchange. Layering lets you replace Ethernet with Wi-Fi without rewriting HTTP, or swap TCP for QUIC while keeping application semantics. In interviews, OSI proves you can reason about where a problem lives (cable vs routing vs TLS vs app logic).',
        ),
        h3('The 7 layers (bottom → top)'),
        table(
          ['Layer', '#', 'Unit', 'Job', 'Examples'],
          [
            ['Physical', '1', 'Bits', 'Signals, cables, radio, connectors', 'Copper, fiber, RJ45, Wi-Fi PHY'],
            ['Data Link', '2', 'Frames', 'Node-to-node delivery on a link; MAC addressing', 'Ethernet, Wi-Fi MAC, PPP, switches'],
            ['Network', '3', 'Packets', 'Host-to-host across networks; logical addressing & routing', 'IP, ICMP, routers'],
            ['Transport', '4', 'Segments/Datagrams', 'Process-to-process; ports; reliability options', 'TCP, UDP, SCTP'],
            ['Session', '5', 'Data', 'Dialog control, checkpoints (often thin in practice)', 'RPC session concepts, NetBIOS'],
            ['Presentation', '6', 'Data', 'Syntax, encoding, encryption/compression (often folded into app/TLS)', 'TLS, JPEG, ASCII/UTF-8'],
            ['Application', '7', 'Data', 'User-facing protocols and APIs', 'HTTP, DNS, SMTP, FTP, SSH'],
          ],
          'Interview mnemonic (bottom-up): Please Do Not Throw Sausage Pizza Away',
        ),
        callout(
          'tip',
          'Memorize both directions. Interviewers often ask top-down ("start from the browser") or bottom-up ("start from the wire").',
          'Memory tip',
        ),
      ]),
      section('how', 'How it works', [
        h3('Encapsulation'),
        p(
          'Each layer adds its own header (and sometimes trailer) as data moves down the stack. Application data becomes a TCP segment (ports + seq/ack), then an IP packet (source/dest IP), then an Ethernet frame (MAC addresses + FCS). On the receiver, each layer strips its header and passes the payload up — decapsulation.',
        ),
        diagram(
          `flowchart TB
  subgraph Sender
    A7[Application data] --> A6[Presentation encoding]
    A6 --> A5[Session context]
    A5 --> A4["Transport: TCP/UDP header + ports"]
    A4 --> A3["Network: IP header"]
    A3 --> A2["Data Link: Ethernet header/trailer"]
    A2 --> A1[Physical bits on wire]
  end
  A1 --> Wire[Transmission medium]
  Wire --> B1
  subgraph Receiver
    B1[Physical bits] --> B2[Frame → strip L2]
    B2 --> B3[Packet → strip L3]
    B3 --> B4[Segment → strip L4]
    B4 --> B5[Session]
    B5 --> B6[Presentation]
    B6 --> B7[Application]
  end`,
          'Encapsulation down the stack, decapsulation up the stack',
        ),
        h3('Devices and layers'),
        ul([
          'Hub (mostly obsolete): Layer 1 — repeats electrical signals to all ports.',
          'Switch: Layer 2 — forwards frames using MAC address tables (CAM).',
          'Router: Layer 3 — forwards packets using IP and routing tables.',
          'Firewall / load balancer: often L3/L4 (5-tuple) or L7 (HTTP-aware).',
          'Hosts (phones, servers): implement the full stack.',
        ]),
        h3('Protocol mapping (practical, not pedantic)'),
        ul([
          'L2: Ethernet, 802.11 MAC, ARP (ARP is often described as L2.5 — it bridges IP↔MAC).',
          'L3: IPv4/IPv6, ICMP, IGMP.',
          'L4: TCP, UDP.',
          'L5–L7 blur in real stacks: HTTP is application; TLS is often called "between L4 and L7" or presentation; DNS can use UDP/TCP at L4 with app semantics at L7.',
        ]),
        callout(
          'info',
          'Interviewers care that you can place HTTP, TLS, TCP, IP, and Ethernet correctly — not that you argue whether TLS is layer 5 or 6.',
          'Practical mapping',
        ),
      ]),
      section('example', 'Worked example', [
        example('Where does "page won\'t load" sit in OSI?', [
          p(
            'Symptom: browser spins, then "connection timed out". Walk layers:',
          ),
          ol([
            'L1: Is link light up? Wi-Fi associated? Cable plugged in?',
            'L2: Same VLAN? ARP resolving gateway MAC? (arp -a / ip neigh)',
            'L3: Can you ping the gateway? Default route present? DNS returned an IP?',
            'L4: Is TCP SYN getting SYN-ACK on port 443? Firewall dropping?',
            'L5–L7: TLS handshake failing? HTTP 502 from reverse proxy? App bug returning 500?',
          ]),
          p(
            'This structured walk is stronger in interviews than jumping straight to "maybe DNS" or "maybe the server is down."',
          ),
        ]),
        example('Sending an HTTP GET — headers at each layer', [
          p(
            'Payload: HTTP request bytes. TCP adds source port (ephemeral) and dest 443, sequence numbers. IP adds your IP and the server IP. Ethernet adds your NIC MAC and the next-hop (gateway or destination) MAC. Switches only need L2; routers rewrite L2 headers on each hop while keeping the IP packet (TTL decremented).',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'OSI is a teaching/reference model; the Internet runs on TCP/IP. Do not claim "the Internet uses 7 OSI layers as implemented."',
          'Session and Presentation are thin or merged into libraries (TLS, codecs, JSON) in modern stacks.',
          'Cross-layer optimizations exist (QUIC combines transport + crypto + some connection migration) — layering is a guide, not a law.',
          'VLAN tags (802.1Q) and MPLS sit in awkward places; say "L2 extensions" or "between L2 and L3."',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'TCP/IP model (next page) collapses OSI into 4/5 layers used by the Internet.',
          'IP addressing is L3; subnetting decides which hosts share an L2 broadcast domain via a router boundary.',
          'HTTP sits at application; TLS protects it; TCP delivers bytes; IP routes packets.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "OSI has seven layers from Physical up to Application."'),
        p('Interviewer: "Why separate Network and Transport?"'),
        p(
          'Strong answer: "Network gets packets to the right host across many links using IP and routing. Transport gets data to the right process and can add reliability, ordering, and congestion control. You can route without knowing ports, and you can have reliable delivery over different underlays."',
        ),
        p('Interviewer: "Is a switch layer 2 or 3?"'),
        p(
          'Strong answer: "Classic switch is L2 — MAC learning and forwarding. Layer-3 switches also route between VLANs/subnets. In interviews I clarify which device and feature set."',
        ),
        p('Interviewer: "Where does encryption live?"'),
        p(
          'Strong answer: "Depends: WPA encrypts the Wi-Fi link (L2). IPsec can protect IP packets (L3). TLS protects application bytes above TCP (or inside QUIC). End-to-end confidentiality for web apps is usually TLS."',
        ),
      ]),
    ],
    commonMistakes: [
      'Claiming OSI is what browsers implement as seven discrete APIs.',
      'Putting HTTP at layer 4 or TCP at layer 7.',
      'Saying routers work on MAC addresses as their primary forwarding key.',
      'Forgetting that each hop rewrites L2 headers while L3 addresses stay (until NAT).',
      'Memorizing only the mnemonic without being able to explain a real failure at each layer.',
    ],
    interviewQuestions: [
      'List the 7 OSI layers and give one example protocol or device for each.',
      'What is encapsulation? Walk an HTTP request down the stack.',
      'At which layer do MAC addresses and IP addresses operate?',
      'What layer does a typical Ethernet switch operate at?',
      'Why do we use layered network models?',
    ],
    intermediateInterviewQuestions: [
      'Map DNS, ARP, ICMP, TLS, and HTTP to OSI (or TCP/IP) layers and justify.',
      'A ping works but HTTPS fails — which layers are likely OK vs suspect?',
      'Explain the difference between a hub, switch, and router using OSI layers.',
      'Why are Session and Presentation layers often "missing" in real stacks?',
      'How does VLAN tagging relate to the Data Link layer?',
    ],
    advancedInterviewQuestions: [
      'Is ARP layer 2 or 3? Defend your answer.',
      'Where would you place QUIC/HTTP3 in OSI terms, and why is that awkward?',
      'Explain cross-layer design: when is strict layering harmful?',
      'How do firewalls classify traffic at L3 vs L4 vs L7?',
      'Describe MTU and fragmentation using OSI layers — where is MTU enforced?',
      'How does NAT challenge the "end-to-end" principle across layers?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain the OSI model and why it matters.',
        answer:
          'OSI is a seven-layer reference model: Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer has a clear job — bits, frames, packets, end-to-end process delivery, then session/presentation/app concerns. We use it to localize problems and design replaceable components. The Internet implements TCP/IP, not OSI literally, but the vocabulary maps: Ethernet L2, IP L3, TCP/UDP L4, HTTP/DNS L7, with TLS often treated as presentation/security above transport. Trade-off: pure layering aids clarity; real systems sometimes merge layers for performance, like QUIC.',
      },
      {
        question: 'Walk through encapsulation for a web request.',
        answer:
          'The browser creates an HTTP message. TLS may encrypt that payload. TCP wraps it with ports and sequence numbers for the server process. IP adds source and destination IPs for routing. Ethernet adds MACs for the next hop on the local link. Each router strips/rebuilds L2 headers and forwards the IP packet. At the server, layers peel off until the HTTP server reads the request. Key point: L2 changes every hop; L3/L4 end-to-end addresses/ports generally persist (except NAT/proxies).',
      },
    ],
    keyTakeaways: [
      'OSI = 7-layer vocabulary for design and debugging, not the literal Internet stack.',
      'L2 = frames/MAC/switches; L3 = packets/IP/routers; L4 = ports/TCP/UDP; L7 = apps like HTTP/DNS.',
      'Encapsulation adds headers downward; decapsulation strips them upward.',
      'Interview skill: localize a failure to the right layer with evidence.',
    ],
  },
)

export const d3p2: StudyPage = createPage(
  'd3-p2',
  'TCP/IP Model',
  12,
  [
    'Compare TCP/IP (Internet) layers to OSI and justify the collapse',
    'Explain encapsulation using IP packets and TCP segments',
    'Describe the end-to-end principle and how it shapes Internet design',
  ],
  {
    prerequisites: ['d3-p1'],
    sections: [
      section('concept', 'Concept', [
        p(
          'The TCP/IP model (Internet protocol suite) is the practical architecture of the Internet. Common teaching versions use 4 layers: Link, Internet, Transport, Application — or 5 layers when Physical is split out from Link. Compared to OSI, Session and Presentation disappear into the Application layer, and Network ↔ Internet naming differs.',
        ),
        h3('Why it exists'),
        p(
          'TCP/IP grew from real implementation (ARPANET → Internet), not a committee model first. Protocols that shipped and interoperate define the layers. Interviews expect you to map OSI ↔ TCP/IP fluently and speak in TCP/IP terms when discussing real systems.',
        ),
        table(
          ['TCP/IP (4-layer)', 'OSI roughly', 'Key protocols'],
          [
            ['Link (Network Access)', 'L1 + L2', 'Ethernet, Wi-Fi, ARP'],
            ['Internet', 'L3', 'IP, ICMP, IGMP'],
            ['Transport', 'L4', 'TCP, UDP'],
            ['Application', 'L5–L7', 'HTTP, DNS, SMTP, SSH, TLS (often here)'],
          ],
          'Standard interview mapping',
        ),
      ]),
      section('how', 'How it works', [
        h3('PDUs naming'),
        ul([
          'Application: messages / data',
          'TCP: segments; UDP: datagrams',
          'IP: packets (sometimes "datagrams" historically)',
          'Link: frames',
        ]),
        diagram(
          `flowchart LR
  subgraph OSI["OSI 7"]
    O7[App] --- O6[Pres] --- O5[Sess] --- O4[Trans] --- O3[Net] --- O2[DL] --- O1[Phys]
  end
  subgraph TCPIP["TCP/IP 4"]
    T4[Application] --- T3[Transport] --- T2[Internet] --- T1[Link]
  end
  O7 -.-> T4
  O6 -.-> T4
  O5 -.-> T4
  O4 -.-> T3
  O3 -.-> T2
  O2 -.-> T1
  O1 -.-> T1`,
          'OSI layers collapse into the TCP/IP model used on the Internet',
        ),
        h3('End-to-end principle'),
        p(
          'Intelligence and correctness checks should live at the endpoints when possible; the network should be a simple packet-forwarding fabric. TCP reliability, TLS authenticity, and application retries sit in hosts. The network provides best-effort delivery (IP). Middleboxes (NAT, firewalls, L7 proxies) violate pure end-to-end but are ubiquitous — call that out as a modern tension.',
        ),
        h3('Hourglass architecture'),
        p(
          'IP is the narrow waist: many link technologies below, many transports/apps above, one internetworking protocol in the middle. That is why IPv4/IPv6 transitions are hard — everything depends on the waist.',
        ),
      ]),
      section('example', 'Worked example', [
        example('Same request in TCP/IP language', [
          ol([
            'Application: browser issues HTTPS GET; TLS records carry HTTP.',
            'Transport: TCP connection to server:443; segments carry TLS records.',
            'Internet: IP routes packets from client IP to server IP (possibly via NAT).',
            'Link: each hop uses the appropriate frame format (Ethernet/Wi-Fi).',
          ]),
        ]),
        example('ICMP sits where?', [
          p(
            'ICMP is an Internet-layer companion to IP (error reporting, echo). Ping uses ICMP Echo Request/Reply. It is not Transport — there are no ports. Traceroute commonly uses UDP/ICMP/TCP probes with TTL tricks at the Internet layer.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          '4-layer vs 5-layer teaching: either is fine if you are consistent; say which you mean.',
          'TLS placement: "application layer security over TCP" or "between transport and application" — both acceptable if clear.',
          'UDP apps still use the model; "connectionless" does not mean "no layers."',
          'Overlay networks (VXLAN, WireGuard) re-encapsulate — stacked models appear.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'IP addressing (next) is the Internet layer identity.',
          'TCP vs UDP are transport choices with different reliability contracts.',
          'HTTP/3 over QUIC still fits Application over a UDP-based transport that reimplements many TCP features.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "TCP/IP has Link, Internet, Transport, Application."'),
        p('Interviewer: "How does that map to OSI?"'),
        p(
          'Strong answer: "Link ≈ Physical+Data Link, Internet ≈ Network, Transport ≈ Transport, Application ≈ Session+Presentation+Application. OSI is finer for teaching; TCP/IP matches deployed stacks."',
        ),
        p('Interviewer: "Why is IP best-effort?"'),
        p(
          'Strong answer: "Keeps routers simple and scalable. Reliability, ordering, and congestion control are optional at endpoints via TCP or the application. That matches the end-to-end principle and lets voice/video choose UDP when timely delivery matters more than perfect reliability."',
        ),
        p('Interviewer: "Trade-off of middleboxes?"'),
        p(
          'Strong answer: "NAT and firewalls add security and address conservation but break end-to-end addressing, complicate protocols, and make new transports like QUIC harder to deploy when middleboxes ossify expectations around TCP/UDP."',
        ),
      ]),
    ],
    commonMistakes: [
      'Treating OSI and TCP/IP as identical seven-layer stacks.',
      'Saying TCP is in the Internet layer.',
      'Claiming IP guarantees delivery because "Internet Protocol sounds reliable."',
      'Forgetting Link layer still matters for ARP and local delivery.',
    ],
    interviewQuestions: [
      'Name the layers of the TCP/IP model and their roles.',
      'How does TCP/IP map to OSI?',
      'What is the PDU at the Internet layer vs Transport layer?',
      'What does "best-effort delivery" mean for IP?',
      'Where do HTTP and DNS sit in TCP/IP?',
    ],
    intermediateInterviewQuestions: [
      'Explain the end-to-end principle with a concrete example.',
      'Why is IP called the "narrow waist" of the Internet?',
      'Compare OSI usefulness vs TCP/IP usefulness in industry interviews.',
      'Where does ICMP fit, and how does traceroute use TTL?',
      'How do overlays (VPN, VXLAN) change encapsulation?',
    ],
    advancedInterviewQuestions: [
      'How do middleboxes challenge the end-to-end principle?',
      'Why did HTTP/3 move to QUIC over UDP instead of extending TCP?',
      'Explain protocol ossification and how it affects new transport design.',
      'Is MPLS a Link, Internet, or "2.5" technology? Argue.',
      'Contrast connectionless IP with connection-oriented virtual circuits historically.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Compare OSI and TCP/IP.',
        answer:
          'OSI is a seven-layer reference model; TCP/IP is the four-layer suite the Internet actually runs. Mapping: TCP/IP Link covers OSI Physical+Data Link; Internet matches Network; Transport matches Transport; Application absorbs Session, Presentation, and Application. Use OSI for precise debugging vocabulary; use TCP/IP when describing real packet flows. Trade-off: OSI is cleaner pedagogically; TCP/IP reflects deployed protocols and merges layers that were never cleanly separated in practice.',
      },
    ],
    keyTakeaways: [
      'Internet stack ≈ Link → Internet (IP) → Transport (TCP/UDP) → Application.',
      'IP is best-effort; reliability is optional above it.',
      'End-to-end principle: keep intelligence at hosts when possible.',
      'Always be ready to map OSI ↔ TCP/IP in one breath.',
    ],
  },
)

export const d3p3: StudyPage = createPage(
  'd3-p3',
  'IP Addressing',
  14,
  [
    'Explain IPv4 structure, classes (historical), private ranges, and special addresses',
    'Compute network vs host portions given a mask',
    'Describe IPv6 addressing at interview depth (size, types, why it exists)',
  ],
  {
    prerequisites: ['d3-p2'],
    sections: [
      section('concept', 'Concept', [
        p(
          'An IP address is a logical identifier for an interface on an internetwork. IPv4 uses 32-bit addresses (≈4.3 billion); IPv6 uses 128-bit addresses. Addresses are paired with a prefix length (mask) that defines the network portion — identity of the subnet — versus the host portion.',
        ),
        h3('Why it exists'),
        p(
          'MAC addresses identify NICs on a local link but are not hierarchical for global routing. IP provides hierarchical addressing so routers can aggregate routes ("everything under 203.0.113.0/24 goes that way") instead of storing every host.',
        ),
        h3('IPv4 dotted decimal'),
        p(
          '32 bits written as four octets: 192.168.1.10. Binary form matters for subnetting: each octet is 0–255.',
        ),
        table(
          ['Range', 'Purpose'],
          [
            ['0.0.0.0/8', 'This network / special use (e.g. source when learning address)'],
            ['127.0.0.0/8', 'Loopback (localhost 127.0.0.1)'],
            ['10.0.0.0/8', 'Private (RFC 1918)'],
            ['172.16.0.0/12', 'Private (172.16–172.31)'],
            ['192.168.0.0/16', 'Private'],
            ['169.254.0.0/16', 'Link-local APIPA'],
            ['224.0.0.0/4', 'Multicast'],
            ['255.255.255.255', 'Limited broadcast'],
          ],
          'Special and private IPv4 ranges you must memorize',
        ),
      ]),
      section('how', 'How it works', [
        h3('Public vs private vs NAT'),
        p(
          'Private addresses are not routable on the public Internet. Home/office gateways use NAT (typically NAPT) to translate many private hosts to one (or few) public IPs. Servers on the public Internet need public addresses or reverse-proxy exposure.',
        ),
        h3('Historical classes (know, then prefer CIDR)'),
        ul([
          'Class A: /8 — leading bit 0 — huge networks (obsolete as allocation model).',
          'Class B: /16 — leading 10.',
          'Class C: /24 — leading 110.',
          'Modern Internet uses CIDR — classless prefixes of any length.',
        ]),
        h3('IPv6 essentials'),
        ul([
          '128-bit addresses, written as eight hex hextets, compressed with :: once.',
          'Example: 2001:db8::1',
          'Link-local: fe80::/10 — every interface, not routed.',
          'Unique local: fc00::/7 (commonly fd00::/8) — private-like.',
          'Multicast replaces broadcast; Neighbor Discovery replaces ARP.',
          'Why: IPv4 exhaustion, simpler header, better autoconfig — migration is still gradual via dual-stack and NAT64.',
        ]),
        diagram(
          `flowchart TB
  IP["IPv4 32-bit address"]
  IP --> NET["Network prefix determined by mask / CIDR"]
  IP --> HOST["Host bits identify interface in subnet"]
  NET --> R["Routers forward based on longest prefix match"]
  HOST --> L2["On-link delivery via ARP / ND to MAC"]`,
          'Prefix for routing; host bits for on-subnet identity',
        ),
        callout(
          'tip',
          'Always state address + prefix: 10.0.0.5/24. An address alone does not define the subnet.',
          'Interview habit',
        ),
      ]),
      section('example', 'Worked example', [
        example('Identify address types', [
          ul([
            '8.8.8.8 — public DNS (Google) — globally routable.',
            '10.1.2.3 — RFC1918 private.',
            '172.20.5.5 — private (within 172.16/12).',
            '172.32.0.1 — NOT private (172.32 is outside 172.16–31).',
            '192.168.0.1 — private gateway common at home.',
            '127.0.0.1 — loopback to self.',
            '169.254.10.20 — APIPA; DHCP likely failed.',
          ]),
        ]),
        example('Network vs host for 192.168.10.45/24', [
          p(
            'Mask /24 means first 24 bits are network: network address 192.168.10.0, hosts 192.168.10.1–254, broadcast 192.168.10.255. Host .45 is a unicast host in that subnet.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'NAT conserves IPv4 and hides topology but breaks true end-to-end addressing and complicates peer-to-peer.',
          'Multiple interfaces ⇒ multiple IPs; "the IP of a server" is often a VIP or DNS name in front.',
          'Anycast: same IP announced from many places (DNS root, CDN) — routing picks a nearby instance.',
          'IPv6 privacy extensions rotate client addresses — logs must not assume stable client IP = stable user.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Subnetting & CIDR (next) operationalize prefix math.',
          'DHCP assigns IPv4/IPv6; ARP/ND maps IP→MAC on the link.',
          'DNS maps names → A/AAAA records (IPs).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "IPv4 is 32-bit; private ranges are 10/8, 172.16/12, 192.168/16."'),
        p('Interviewer: "Why private addresses?"'),
        p(
          'Strong answer: "So organizations can number internally without consuming global IPv4 space. Border devices NAT or proxy to the public Internet. Trade-off is end-to-end transparency."',
        ),
        p('Interviewer: "How does a router know where to send a packet?"'),
        p(
          'Strong answer: "Longest prefix match in the routing table against the destination IP. More specific routes win over defaults."',
        ),
        p('Interviewer: "IPv6 vs just using NAT forever?"'),
        p(
          'Strong answer: "NAT delayed exhaustion but added complexity. IPv6 restores abundant addressing and simpler end-to-end models; both coexist via dual-stack for a long transition."',
        ),
      ]),
    ],
    commonMistakes: [
      'Thinking 172.16.0.0/16 is the entire private 172 block (it is /12).',
      'Calling 192.168.1.0 a usable host address when it is the network address for /24.',
      'Confusing loopback (127/8) with link-local (169.254/16).',
      'Saying private IPs cannot be used as source addresses on a LAN (they can; they just should not appear as public Internet sources without NAT).',
    ],
    interviewQuestions: [
      'How many bits in IPv4 and IPv6 addresses?',
      'List the RFC1918 private IPv4 ranges.',
      'What is 127.0.0.1 used for?',
      'What is the difference between a public and private IP?',
      'What does /24 mean on an IPv4 address?',
    ],
    intermediateInterviewQuestions: [
      'Explain why IP addressing is hierarchical.',
      'What is APIPA/169.254 and when do you see it?',
      'How does NAT allow many hosts to share one public IP?',
      'What is a link-local IPv6 address?',
      'Differentiate unicast, multicast, broadcast, and anycast.',
    ],
    advancedInterviewQuestions: [
      'Explain longest prefix match with an example routing table.',
      'How does CGNAT differ from home NAT, and what pain does it cause?',
      'Why is IPv6 adoption still incomplete despite exhaustion?',
      'How do anycast DNS and CDNs use routing for latency?',
      'What breaks if two sites use the same RFC1918 space and then connect via VPN?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain IPv4 private addressing and NAT.',
        answer:
          'RFC1918 defines private ranges — 10/8, 172.16/12, 192.168/16 — for internal use. They are not globally routable. At the edge, NAT translates private source addresses to a public IP so many devices can share scarce IPv4 space. WHAT: private numbering + translation. WHY: conservation and topology hiding. HOW: stateful NAT maps 5-tuples. TRADE-OFF: breaks pure end-to-end connectivity; inbound connections need port forwards, reverse proxies, or hole-punching.',
      },
    ],
    keyTakeaways: [
      'IP = logical, hierarchical address for routing; always pair with prefix length.',
      'Memorize private ranges, loopback, link-local, and multicast at a glance.',
      'IPv6 is 128-bit with ND instead of ARP; dual-stack is common.',
      'NAT is a pragmatic IPv4 crutch with end-to-end costs.',
    ],
  },
)

export const d3p4: StudyPage = createPage(
  'd3-p4',
  'Subnetting & CIDR',
  20,
  [
    'Compute network address, broadcast, usable hosts from CIDR',
    'Split networks into subnets for host-count requirements',
    'Explain CIDR aggregation / supernetting and routing efficiency',
  ],
  {
    prerequisites: ['d3-p3'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Subnetting divides an address block into smaller networks by borrowing host bits for network bits (longer prefix). CIDR (Classless Inter-Domain Routing) writes prefixes as /N and allows aggregation of many networks into one route advertisement.',
        ),
        h3('Why it exists'),
        p(
          'Without subnetting, organizations wasted huge classful blocks. Without CIDR aggregation, global routing tables would explode. Subnets also bound broadcast domains and enforce security zones (DMZ vs internal).',
        ),
        h3('Core formulas'),
        ul([
          'Host bits h = 32 − prefixLength (IPv4).',
          'Addresses in block = 2^h (includes network + broadcast for IPv4 unicast subnets).',
          'Usable hosts ≈ 2^h − 2 (except /31 point-to-point and /32 host routes — special cases).',
          'Number of subnets when borrowing b bits = 2^b.',
          'Wildcard mask = bitwise NOT of subnet mask (ACL trick).',
        ]),
        callout(
          'tip',
          'Powers of two: /24=256, /25=128, /26=64, /27=32, /28=16, /29=8, /30=4, /31=2, /32=1. Memorize these cold.',
          'Speed table',
        ),
      ]),
      section('how', 'How it works', [
        h3('Finding network and broadcast'),
        ol([
          'Convert IP and mask to binary (or use octet boundaries when aligned).',
          'Network address = IP AND mask.',
          'Broadcast = network OR wildcard (set all host bits to 1).',
          'First usable = network + 1; last usable = broadcast − 1 (for normal subnets).',
        ]),
        h3('CIDR aggregation'),
        p(
          'If you own 192.0.2.0/24 and 192.0.3.0/24 and they are contiguous and aligned, you may advertise 192.0.2.0/23. Aggregation requires matching prefixes and correct binary alignment — you cannot always merge arbitrary ranges.',
        ),
        diagram(
          `flowchart TB
  Block["203.0.113.0/24 - 256 addresses"]
  Block --> S1["203.0.113.0/26 - 64 addrs"]
  Block --> S2["203.0.113.64/26"]
  Block --> S3["203.0.113.128/26"]
  Block --> S4["203.0.113.192/26"]
  S1 --> Note["Each: 62 usable hosts typically"]`,
          'One /24 split into four /26 subnets',
        ),
      ]),
      section('example', 'Worked numericals', [
        numerical({
          title: 'N1 — Basic /24 analysis',
          problem: 'For 192.168.5.77/24, find network, broadcast, usable range, and usable host count.',
          given: 'IP 192.168.5.77, prefix /24',
          formula: 'h=32-24=8; size=2^8=256; usable=256-2=254',
          steps:
            '1) Mask 255.255.255.0\n2) Network = 192.168.5.0\n3) Broadcast = 192.168.5.255\n4) Usable 192.168.5.1–192.168.5.254',
          answer: 'Network 192.168.5.0/24; broadcast .255; 254 usable hosts; host .77 is valid.',
          shortcut: '/24 → last octet is host; network .0 broadcast .255.',
          mistake: 'Counting .0 and .255 as usable hosts.',
        }),
        numerical({
          title: 'N2 — /26 network boundaries',
          problem: 'Which subnet is 10.0.0.130/26 in? Give network and broadcast.',
          given: 'IP 10.0.0.130, /26 → block size 64 in last octet',
          formula: 'block=2^(32-26)=64; subnet starts at multiples of 64',
          steps:
            '1) Last-octet blocks: 0, 64, 128, 192\n2) 130 is in 128–191\n3) Network 10.0.0.128; broadcast 10.0.0.191',
          answer: '10.0.0.128/26; broadcast 10.0.0.191; usable .129–.190',
          shortcut: 'Mod 64: 130−128=2 → inside .128 subnet.',
          mistake: 'Using /24 boundaries and saying network is 10.0.0.0.',
        }),
        numerical({
          title: 'N3 — Usable hosts for /27',
          problem: 'How many usable hosts in a /27? What mask?',
          given: 'prefix 27',
          formula: 'usable=2^(32-27)-2=2^5-2=30',
          steps: '1) Host bits=5\n2) Total 32 addresses\n3) Minus network+broadcast → 30\n4) Mask 255.255.255.224',
          answer: '30 usable hosts; mask 255.255.255.224',
          shortcut: '/27 → 32 addresses → 30 hosts; 256-32=224 last mask octet.',
          mistake: 'Saying 32 usable hosts.',
        }),
        numerical({
          title: 'N4 — Choose prefix for N hosts',
          problem: 'Need 100 usable hosts. Smallest IPv4 subnet that fits?',
          given: 'need ≥100 usable ⇒ need 2^h − 2 ≥ 100 ⇒ 2^h ≥ 102',
          formula: '2^7=128 ≥ 102; h=7 ⇒ prefix=32-7=/25',
          steps: '1) /26 has 62 usable — too small\n2) /25 has 126 usable — enough\n3) /24 has 254 — works but larger',
          answer: '/25 (126 usable) is the smallest standard fit.',
          shortcut: '62, 126, 254 ladder — pick first that exceeds need.',
          mistake: 'Picking /26 because 64>100 is false (64 total, 62 usable).',
        }),
        numerical({
          title: 'N5 — Subnet a /24 into equal parts',
          problem: 'Split 172.16.4.0/24 into 8 equal subnets. New prefix? First three subnet networks?',
          given: '8 subnets → need 2^b≥8 ⇒ b=3 bits borrowed',
          formula: 'new prefix=/24+3=/27; size=32',
          steps:
            '1) Borrow 3 bits → /27\n2) Networks: .0, .32, .64, .96, .128, .160, .192, .224\n3) First three: 172.16.4.0/27, .32/27, .64/27',
          answer: 'Eight /27s; starts .0, .32, .64, ...',
          shortcut: '8 subnets from /24 → /27; increment 32.',
          mistake: 'Using increment 8 instead of block size 32.',
        }),
        numerical({
          title: 'N6 — Mask to prefix',
          problem: 'Convert mask 255.255.255.240 to CIDR and usable hosts.',
          given: '255.255.255.240',
          formula: '240=11110000b → 4 host bits zero? Wait: 240 means 4 bits for hosts → /28',
          steps: '1) 255.255.255 → 24 bits\n2) 240=11110000 → +4 bits → /28\n3) usable=2^4-2=14',
          answer: '/28 with 14 usable hosts',
          shortcut: '256-240=16 → block 16 → /28.',
          mistake: 'Reading 240 as /29 (confusing with 248).',
        }),
        numerical({
          title: 'N7 — Prefix to mask',
          problem: 'What is the dotted mask for /21?',
          given: '/21 → 21 network bits',
          formula: 'First two octets 255.255; third octet: 5 bits → 256-2^(8-5)=256-8=248? Host bits total=11; third octet has 5 network bits: 11111000=248',
          steps: '1) /21 = 255.255.248.0\n2) Block size in 3rd octet = 8\n3) Networks 0,8,16,...',
          answer: '255.255.248.0',
          shortcut: '/16+/5 → third octet 256-8=248.',
          mistake: 'Writing 255.255.252.0 (/22) or 255.255.240.0 (/20).',
        }),
        numerical({
          title: 'N8 — Is host in subnet?',
          problem: 'Is 192.168.1.70/26 in the same subnet as 192.168.1.65/26?',
          given: '/26 blocks of 64: .0, .64, .128, .192',
          formula: 'Compare network addresses after AND with mask',
          steps: '1) .70 → network .64\n2) .65 → network .64\n3) Same subnet 192.168.1.64/26',
          answer: 'Yes — both in 192.168.1.64/26',
          shortcut: 'Both between 64 and 127.',
          mistake: 'Comparing only first three octets and ignoring /26.',
        }),
        numerical({
          title: 'N9 — Supernet / aggregate',
          problem: 'Can 10.0.0.0/24 and 10.0.1.0/24 aggregate? To what?',
          given: 'Two contiguous /24s starting at even alignment',
          formula: '2 × /24 = /23 if base aligned to /23',
          steps:
            '1) 10.0.0.0 and 10.0.1.0 differ only in bit that /23 covers\n2) Aggregate 10.0.0.0/23\n3) Covers .0.0–.1.255',
          answer: 'Yes → 10.0.0.0/23',
          shortcut: 'Pair of /24s with even first: /23.',
          mistake: 'Advertising 10.0.0.0/23 when you only own one /24 (hijack risk).',
        }),
        numerical({
          title: 'N10 — Cannot aggregate',
          problem: 'Can 10.0.1.0/24 and 10.0.2.0/24 form a single /23?',
          given: '10.0.1.0 and 10.0.2.0',
          formula: '/23 pairs are (0,1), (2,3), (4,5), ...',
          steps: '1) 1 and 2 are not a /23-aligned pair\n2) Covering both needs at least 10.0.0.0/22 (also includes .0 and .3)',
          answer: 'No clean /23; would need /22 including extra space.',
          shortcut: 'Check binary alignment — not every two /24s merge.',
          mistake: 'Blindly adding sizes: 256+256 ⇒ /23 without alignment.',
        }),
        numerical({
          title: 'N11 — /30 point-to-point',
          problem: 'Router link needs exactly 2 usable IPs. Which prefix? Example range.',
          given: '2 usable → 2^h − 2 ≥ 2 ⇒ h=2 ⇒ /30',
          formula: '/30 → 4 addresses: net, 2 hosts, broadcast',
          steps: '1) Example 10.0.0.0/30\n2) Usable 10.0.0.1 and 10.0.0.2\n3) Broadcast .3',
          answer: '/30 (or modern /31 per RFC 3021)',
          shortcut: 'WAN links → /30 classic; /31 saves addresses.',
          mistake: 'Using /32 for both ends without understanding point-to-point specials.',
        }),
        numerical({
          title: 'N12 — VLSM design sketch',
          problem:
            'From 192.168.10.0/24 allocate: NetA 100 hosts, NetB 50 hosts, NetC 10 hosts, and 3× router /30 links. Propose prefixes.',
          given: 'Parent /24; requirements 100, 50, 10, and three /30s',
          formula: 'Allocate largest first: /25, /26, /28, then /30s',
          steps:
            '1) NetA: /25 → 192.168.10.0/25 (126 usable)\n2) NetB: /26 → 192.168.10.128/26 (62)\n3) NetC: /28 → 192.168.10.192/28 (14)\n4) Links: 192.168.10.208/30, .212/30, .216/30\n5) Remaining space left for growth',
          answer: '/25 + /26 + /28 + three /30s as above (one valid VLSM plan).',
          shortcut: 'Sort by size descending; pack without overlap.',
          mistake: 'Giving all networks /24 slices from a single /24 (impossible) or overlapping prefixes.',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          '/31 (RFC 3021) and /32 are special — do not always subtract 2.',
          'Too-small subnets force renumbering; too-large wastes space and widens blast radius.',
          'VLSM saves space but increases operational complexity vs uniform /24s.',
          'Cloud security groups/NACLs often use CIDR; wrong prefix = wrong exposure.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Routing uses these prefixes in tables (longest match).',
          'DHCP scopes are typically aligned to subnets.',
          'Broadcast/ARP stays within the L2 domain corresponding to the subnet (usually).',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "For /26, block size 64, usable 62."'),
        p('Interviewer: "How did you get 62?"'),
        p(
          'Strong answer: "32−26=6 host bits → 2^6=64 addresses; reserve network and broadcast → 62. I would mention /31 exceptions on point-to-point links."',
        ),
        p('Interviewer: "Design subnets for 3 departments with different sizes."'),
        p(
          'Strong answer: "Use VLSM: allocate largest first from the parent CIDR, keep alignments on power-of-two boundaries, document leftover space, and leave room for growth."',
        ),
        p('Interviewer: "Why CIDR in BGP?"'),
        p(
          'Strong answer: "Classless aggregation shrinks the global table. ISPs advertise summaries; more-specific routes still win via longest prefix match when needed for traffic engineering."',
        ),
      ]),
    ],
    commonMistakes: [
      'Forgetting to subtract 2 for network and broadcast.',
      'Using wrong block size (e.g., increments of 64 for /27).',
      'Overlapping VLSM allocations.',
      'Aggregating non-aligned ranges into a supernet you do not fully own.',
      'Off-by-one on last usable address (using broadcast as a host).',
    ],
    interviewQuestions: [
      'How many usable hosts are in a /24, /25, and /26?',
      'Find network and broadcast for 10.5.5.5/28.',
      'What is CIDR and why did it replace classful addressing?',
      'Convert 255.255.255.192 to prefix length.',
      'What is VLSM?',
    ],
    intermediateInterviewQuestions: [
      'Split 192.168.0.0/24 into 4 equal subnets and list them.',
      'What prefix do you need for 500 hosts?',
      'Explain longest prefix match with overlapping routes.',
      'When would you use /30 vs /31?',
      'How do you check if two IPs are in the same subnet?',
    ],
    advancedInterviewQuestions: [
      'Design a VLSM plan for mixed host counts from a /22.',
      'Why can two /24s sometimes not aggregate to a /23?',
      'How does CIDR aggregation interact with traffic engineering (more-specific routes)?',
      'Explain wildcard masks in ACLs vs subnet masks.',
      'How do cloud route tables use /32 host routes for overlays?',
      'IPv6 subnetting often uses /64 per LAN — why?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain subnetting and compute a /26 example.',
        answer:
          'Subnetting lengthens the prefix so a block is split into smaller networks. For 192.168.1.10/26: host bits=6, block=64, so subnets land on .0/.64/.128/.192. 10 falls in 192.168.1.0/26; broadcast .63; usable .1–.62. WHY: isolate broadcast domains and allocate efficiently. TRADE-OFF: smaller subnets save addresses but need more routes and careful VLSM planning.',
      },
      {
        question: 'What is CIDR aggregation?',
        answer:
          'CIDR lets us advertise one summary prefix for many contiguous networks — e.g. two aligned /24s as one /23 — so routers store fewer routes. Longest prefix match still allows punching holes with more-specific routes. Benefit: scalable routing. Risk: summarizing space you do not own or black-holing holes inside the summary.',
      },
    ],
    keyTakeaways: [
      'Usable hosts ≈ 2^(32−prefix) − 2 for normal IPv4 subnets.',
      'Block size and alignment are everything — memorize /24–/30 ladder.',
      'VLSM = unequal subnets; allocate largest first.',
      'CIDR aggregation shrinks tables but requires ownership + alignment.',
    ],
  },
)

export const m1Pages: StudyPage[] = [d3p1, d3p2, d3p3, d3p4]
