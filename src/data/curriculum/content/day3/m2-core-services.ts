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
  code,
} from '../../../helpers'

export const d3p5: StudyPage = createPage(
  'd3-p5',
  'ARP and DHCP',
  14,
  [
    'Explain ARP resolution and caching on a LAN',
    'Describe the DHCP DORA sequence and lease lifecycle',
    'Relate ARP/DHCP failures to common connectivity symptoms',
  ],
  {
    prerequisites: ['d3-p3'],
    sections: [
      section('concept', 'Concept', [
        p(
          'ARP (Address Resolution Protocol) maps an IPv4 address to a MAC address on the local link so frames can be delivered. DHCP (Dynamic Host Configuration Protocol) automatically assigns IP address, mask, gateway, DNS, and other options so hosts join a network without manual static config.',
        ),
        h3('Why they exist'),
        p(
          'IP routing decides the next hop IP, but the NIC sends Ethernet frames to MACs. ARP bridges that gap. Manual IP assignment does not scale and causes conflicts; DHCP centralizes addressing and reduces misconfiguration.',
        ),
        callout(
          'info',
          'IPv6 uses Neighbor Discovery (ND) and typically SLAAC/DHCPv6 instead of ARP/DHCPv4 — mention this if asked about IPv6.',
          'IPv6 note',
        ),
      ]),
      section('how', 'How it works', [
        h3('ARP resolution'),
        ol([
          'Host needs MAC for next-hop IP (destination if on-link, else default gateway).',
          'Check ARP cache; on miss, broadcast ARP Request: "Who has IP X? Tell MAC Y".',
          'Owner of X unicasts ARP Reply with its MAC.',
          'Requester caches mapping and sends the frame.',
        ]),
        diagram(
          `sequenceDiagram
  participant A as Host A
  participant B as Host B
  A->>A: Check ARP cache for B IP
  A->>B: ARP Request broadcast Who has B?
  B->>A: ARP Reply unicast B MAC
  A->>B: Ethernet frame to B MAC carrying IP packet`,
          'ARP request/reply before local IP delivery',
        ),
        h3('Proxy ARP & gratuitous ARP'),
        ul([
          'Proxy ARP: a router answers ARP for IPs it can reach — useful but can hide mis-subnetting.',
          'Gratuitous ARP: host announces its own IP/MAC (detect conflicts, update caches after failover/VIP move).',
        ]),
        h3('DHCP DORA'),
        ol([
          'Discover: client broadcasts looking for servers (0.0.0.0 → 255.255.255.255, UDP 67/68).',
          'Offer: server proposes a lease (IP + options).',
          'Request: client asks for a chosen offer (may see multiple servers).',
          'Ack: server confirms; client configures interface.',
        ]),
        diagram(
          `sequenceDiagram
  participant C as Client
  participant S as DHCP Server
  C->>S: Discover broadcast
  S->>C: Offer IP + options
  C->>S: Request chosen offer
  S->>C: Ack lease`,
          'DHCP DORA handshake',
        ),
        h3('Lease lifecycle'),
        p(
          'Leases expire. At T1 (typically 50% of lease) client renews via unicast Request to the leasing server. At T2 (87.5%) it rebinds via broadcast if renew failed. On failure, address returns to the pool. DHCP Relay (ip helper) forwards Discover across subnets because broadcasts do not cross routers.',
        ),
        table(
          ['Protocol', 'Layer role', 'Scope', 'Failure symptom'],
          [
            ['ARP', 'IP↔MAC on link', 'Local subnet / L2 domain', 'Same-subnet ping fails; incomplete ARP'],
            ['DHCP', 'Auto config', 'Subnet via broadcast or relay', 'APIPA 169.254/x or no IP'],
          ],
        ),
      ]),
      section('example', 'Worked example', [
        example('Default gateway ARP', [
          p(
            'You ping 8.8.8.8. Your host does not ARP for 8.8.8.8. It ARPs for the default gateway IP (e.g. 192.168.1.1), then sends the packet to the gateway MAC with destination IP still 8.8.8.8. Interview gold: ARP targets next hop, not remote destination.',
          ),
        ]),
        example('DHCP conflict', [
          p(
            'Static server uses 10.0.0.50; DHCP also hands out .50. Symptoms: intermittent connectivity, duplicate IP warnings, gratuitous ARP fights. Fix: DHCP reservations or exclude static ranges from the pool.',
          ),
        ]),
        code(
          'bash',
          `# Linux examples (interview familiarity)
ip neigh show          # ARP/ND cache
arping -I eth0 10.0.0.1
dhclient -v eth0       # renew (distro-dependent)`,
          'Operational commands that show ARP/DHCP in action',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'ARP is unauthenticated — ARP spoofing/poisoning is a classic LAN MITM risk; mitigate with Dynamic ARP Inspection, static entries for critical hosts, or encryption (TLS still helps confidentiality).',
          'Long DHCP leases reduce traffic but slow reclaim after devices leave; short leases increase churn.',
          'Multiple DHCP servers need coordinated pools or split scopes to avoid double allocation.',
          'Stale ARP after VM MAC move causes black holes until timeout or gratuitous ARP.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Subnet mask from DHCP defines on-link vs via-gateway behavior for ARP.',
          'DNS server IPs are common DHCP options — DNS next page.',
          'Routers need DHCP relay for clients in other VLANs.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "ARP maps IP to MAC using a broadcast request and unicast reply."'),
        p('Interviewer: "Do you ARP for every destination on the Internet?"'),
        p(
          'Strong answer: "No. Only for the next hop on my local link — usually the gateway for remote destinations. Remote IPs are reached by routing, not ARP."',
        ),
        p('Interviewer: "Walk through DHCP."'),
        p(
          'Strong answer: "DORA — Discover, Offer, Request, Ack — over UDP 67/68, typically broadcast until the client has an address. Relay agents forward across subnets. Leases renew at T1/T2."',
        ),
        p('Interviewer: "Security concern?"'),
        p(
          'Strong answer: "Rogue DHCP can push a malicious gateway/DNS (MITM). Defend with DHCP snooping, authorized servers, and 802.1X on enterprise LANs. ARP poisoning similarly redirects traffic at L2."',
        ),
      ]),
    ],
    commonMistakes: [
      'Saying hosts ARP for remote Internet IPs directly.',
      'Forgetting DHCP uses broadcast and needs relays across routers.',
      'Confusing DNS resolution with DHCP assignment.',
      'Ignoring lease renewal — thinking IP vanishes only at full expiry without renew attempts.',
    ],
    interviewQuestions: [
      'What problem does ARP solve?',
      'Describe an ARP request and reply.',
      'What is the DHCP DORA process?',
      'Which UDP ports does DHCP use?',
      'What is a DHCP lease?',
    ],
    intermediateInterviewQuestions: [
      'When does a host ARP for the gateway vs the destination?',
      'What is gratuitous ARP used for?',
      'Why is a DHCP relay needed?',
      'What happens at T1 and T2 in a DHCP lease?',
      'How would you diagnose a duplicate IP on a LAN?',
    ],
    advancedInterviewQuestions: [
      'Explain ARP spoofing conceptually and defensive controls (no exploit steps).',
      'Compare DHCPv4 with SLAAC and DHCPv6.',
      'How does DHCP snooping + DAI work together on switches?',
      'What is Proxy ARP and when is it dangerous?',
      'How do anycast or VRRP gateways interact with ARP caches during failover?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain ARP and when it is used.',
        answer:
          'ARP resolves an IPv4 next-hop address to a MAC on the local L2 network. On cache miss, the host broadcasts a request; the owner replies with its MAC; the mapping is cached. For remote destinations, you ARP only for the default gateway, not the remote IP. WHY: Ethernet delivers by MAC. TRADE-OFF: simple and fast, but unauthenticated — poisoning is a LAN risk mitigated by switch security features and higher-layer crypto.',
      },
      {
        question: 'Explain DHCP DORA.',
        answer:
          'DHCP automates host network config. Client broadcasts Discover; servers Offer addresses; client Requests one; server Acks the lease — DORA. Options include mask, gateway, and DNS. Relays forward DHCP across subnets. Leases renew before expiry. TRADE-OFF: convenience and centralized policy vs dependency on infrastructure and risk of rogue servers without snooping/auth.',
      },
    ],
    keyTakeaways: [
      'ARP: IP → MAC for the local next hop; cache aggressively.',
      'DHCP DORA assigns IP/mask/gateway/DNS with leases and renewals.',
      'Relay agents make DHCP work across routed subnets.',
      'Both are LAN trust hot spots — mention defensive controls in interviews.',
    ],
  },
)

export const d3p6: StudyPage = createPage(
  'd3-p6',
  'DNS',
  16,
  [
    'Trace recursive vs iterative DNS resolution end-to-end',
    'Explain A/AAAA/CNAME/MX/NS/TXT records and TTL caching',
    'Reason about DNS latency, caching layers, and failure modes',
  ],
  {
    prerequisites: ['d3-p5'],
    sections: [
      section('concept', 'Concept', [
        p(
          'DNS (Domain Name System) is a distributed hierarchical database that maps human-readable names to records — most famously A/AAAA (IPs), but also MX, CNAME, NS, TXT, SRV, etc. Resolvers cache answers according to TTL to keep the system scalable.',
        ),
        h3('Why it exists'),
        p(
          'Users and configs want stable names; IPs change with scaling, failover, and CDNs. DNS provides indirection, load distribution (multiple A records, anycast resolvers), and a control point for traffic steering.',
        ),
        table(
          ['Record', 'Purpose'],
          [
            ['A', 'Name → IPv4'],
            ['AAAA', 'Name → IPv6'],
            ['CNAME', 'Alias → another name (canonical)'],
            ['MX', 'Mail servers for a domain (with priority)'],
            ['NS', 'Authoritative name servers for a zone'],
            ['TXT', 'Arbitrary text (SPF, DKIM, verification)'],
            ['SOA', 'Zone authority metadata'],
          ],
          'Core record types for interviews',
        ),
      ]),
      section('how', 'How it works', [
        h3('Hierarchy'),
        p(
          'Root (.) → TLD (.com) → authoritative zone (example.com) → possibly sub-zones. Stub resolvers on clients ask a recursive resolver (ISP, 8.8.8.8, 1.1.1.1, corporate DNS). The recursive resolver walks the hierarchy if needed.',
        ),
        h3('Recursive vs iterative'),
        ul([
          'Recursive query (client → resolver): "Give me the final answer; you do the work."',
          'Iterative referrals (resolver ↔ hierarchy): root says "ask .com", TLD says "ask ns1.example.com", authoritative returns A record.',
        ]),
        diagram(
          `sequenceDiagram
  participant App as Browser
  participant Stub as Stub resolver
  participant Rec as Recursive resolver
  participant Root as Root NS
  participant TLD as TLD NS
  participant Auth as Authoritative NS
  App->>Stub: Lookup www.example.com
  Stub->>Rec: Recursive query
  Rec->>Root: Where is com?
  Root-->>Rec: Referral to TLD
  Rec->>TLD: Where is example.com?
  TLD-->>Rec: Referral to Auth NS
  Rec->>Auth: A for www.example.com?
  Auth-->>Rec: A 203.0.113.10 TTL 300
  Rec-->>Stub: Answer
  Stub-->>App: IP address`,
          'DNS resolution path with iterative referrals by the recursive resolver',
        ),
        h3('Caching & TTL'),
        p(
          'Each record has a TTL (seconds). Resolvers and browsers/OS cache answers. Lower TTL → faster failover, more query load. Higher TTL → less load, slower changes. Negative caching also exists for NXDOMAIN.',
        ),
        h3('Transport'),
        p(
          'Traditionally UDP/53 for queries; TCP/53 for large responses or zone transfers (AXFR). Modern: DNS over HTTPS (DoH) / TLS (DoT) for privacy. EDNS0 enables larger UDP payloads.',
        ),
      ]),
      section('example', 'Worked example', [
        example('CNAME chain', [
          p(
            'www.example.com CNAME edge.cdn.net → A 203.0.113.10. Client follows CNAME then fetches A. You generally cannot place other records co-existing with CNAME at the same node (classic zone rule). Apex/root domain often uses A/ALIAS/ANAME instead of CNAME.',
          ),
        ]),
        example('Why CDN changes feel delayed', [
          p(
            'You update A record TTL 300, but some resolvers cached the old IP for up to 300s (plus app caches). Interview answer: "Propagation" is mostly cache expiry, not a magical global push.',
          ),
        ]),
        code(
          'bash',
          `dig www.example.com +trace   # show hierarchy
dig example.com MX
dig @8.8.8.8 example.com A`,
          'dig is the standard interview-friendly DNS tool',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Single DNS provider outage takes you offline even if servers are up — use secondary DNS.',
          'DNS prefetch and Happy Eyeballs (v4/v6) affect perceived latency.',
          'Split-horizon DNS returns different answers internally vs publicly.',
          'DNS spoofing/cache poisoning — mitigated by source port randomization, DNSSEC (authenticity), DoH/DoT (path privacy).',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'After DNS, TCP/TLS/HTTP use the resolved IP (or multiple for failover).',
          'DHCP often provides the recursive resolver address.',
          'Load balancers and CDNs heavily rely on DNS for steering.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "DNS resolves names via recursive resolvers that query the hierarchy."'),
        p('Interviewer: "Difference between recursive and authoritative?"'),
        p(
          'Strong answer: "Authoritative servers hold the zone data and answer for names they own. Recursive resolvers chase referrals on behalf of clients and cache results. A server can be both roles, but the functions differ."',
        ),
        p('Interviewer: "How does TTL affect incident response?"'),
        p(
          'Strong answer: "High TTL means a bad IP sticks in caches longer after you fix DNS. For failover-sensitive records, use lower TTLs — accepting more query volume — or use health-aware systems like CDN/GSLB."',
        ),
        p('Interviewer: "Is DNS on UDP reliable enough?"'),
        p(
          'Strong answer: "Queries are short and idempotent; loss just retries. Large answers fall back to TCP. Reliability of the web session itself is still TCP/TLS after resolution."',
        ),
      ]),
    ],
    commonMistakes: [
      'Thinking DNS "pushes" updates worldwide instantly.',
      'Confusing registrar, authoritative DNS, and recursive resolver roles.',
      'Saying CNAME can freely coexist with MX/NS at the same name.',
      'Forgetting browsers/OS have their own caches beyond resolver TTL behavior.',
    ],
    interviewQuestions: [
      'What is DNS and why do we need it?',
      'Explain A vs CNAME vs MX records.',
      'What is a TTL in DNS?',
      'What ports/protocols does DNS use?',
      'What is the difference between a recursive resolver and an authoritative server?',
    ],
    intermediateInterviewQuestions: [
      'Walk through resolving www.example.com from scratch (cold cache).',
      'What is DNS caching and where can answers be cached?',
      'What is a reverse DNS PTR record used for?',
      'Explain split-horizon DNS.',
      'What happens if the TLD servers are unreachable?',
    ],
    advancedInterviewQuestions: [
      'How does DNSSEC protect clients conceptually?',
      'Compare DoH/DoT vs classic UDP/53 for privacy and enterprise filtering.',
      'How do CDNs use DNS for geo-steering and what are the pitfalls (EDNS client subnet)?',
      'Explain NXDOMAIN vs NODATA and negative caching.',
      'How would you design DNS for active-active multi-region failover?',
      'Why is changing NS records riskier than changing an A record?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Walk through DNS resolution.',
        answer:
          'The OS stub asks a recursive resolver. If uncached, the resolver iteratively queries root → TLD → authoritative name servers until it gets the answer (e.g. A record), then caches it for the TTL and returns it to the client. The browser then connects to that IP. WHY hierarchy + caching: global scale. TRADE-OFF: low TTL for agility vs query load; caching delays updates.',
      },
    ],
    keyTakeaways: [
      'DNS = hierarchical, cached name → record mapping.',
      'Recursive resolvers do the iterative walk; authoritatives own the data.',
      'TTL controls freshness vs load; "propagation" ≈ cache expiry.',
      'Record types matter — A/AAAA/CNAME/MX/NS/TXT are must-know.',
    ],
  },
)

export const d3p7: StudyPage = createPage(
  'd3-p7',
  'Routing Basics',
  12,
  [
    'Distinguish forwarding vs routing and describe a routing table',
    'Explain default gateways, next hops, and longest prefix match',
    'Contrast static routing with dynamic protocols at interview depth',
  ],
  {
    prerequisites: ['d3-p3', 'd3-p4'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Routing is the control-plane process of building paths (routing tables / RIB). Forwarding is the data-plane act of sending a packet to the next hop based on those tables (FIB). Hosts do simple routing (local subnet vs default gateway); routers interconnect networks at scale.',
        ),
        h3('Why it exists'),
        p(
          'The Internet is a network of networks. No host has a map of every destination — just a default route and a few specifics. Routers exchange reachability so packets converge toward the destination via hop-by-hop decisions.',
        ),
      ]),
      section('how', 'How it works', [
        h3('Host forwarding decision'),
        ol([
          'Is destination on-link (same subnet per mask)? → ARP/ND and deliver locally.',
          'Else match most specific route (often default 0.0.0.0/0) → send to that next-hop MAC.',
          'TTL/hop limit decremented by each router; at 0, packet dropped + ICMP Time Exceeded.',
        ]),
        h3('Longest prefix match (LPM)'),
        p(
          'If table has 10.0.0.0/8 via A, 10.1.0.0/16 via B, and 10.1.2.0/24 via C, destination 10.1.2.5 chooses C — longest (most specific) prefix wins.',
        ),
        diagram(
          `flowchart LR
  Pkt["Packet dest 10.1.2.5"] --> LPM["Longest prefix match"]
  LPM --> R1["10.0.0.0/8 via A"]
  LPM --> R2["10.1.0.0/16 via B"]
  LPM --> R3["10.1.2.0/24 via C"]
  R3 --> Win["Choose C - most specific"]`,
          'Longest prefix match selects the most specific route',
        ),
        h3('Static vs dynamic'),
        ul([
          'Static: manually configured — simple, predictable, does not adapt to failures.',
          'IGP (OSPF, IS-IS, EIGRP): within an AS — fast convergence, topology awareness.',
          'EGP/BGP: between ASes on the Internet — policy-heavy, scalability-focused.',
        ]),
        table(
          ['Term', 'Meaning'],
          [
            ['Next hop', 'Adjacent IP to which we forward'],
            ['Default route', '0.0.0.0/0 or ::/0 — last resort'],
            ['Metric / preference', 'Tie-break among routes (protocol-specific)'],
            ['ECMP', 'Equal-cost multipath — spread over multiple next hops'],
          ],
        ),
      ]),
      section('example', 'Worked example', [
        example('Home network path', [
          p(
            'Laptop → Wi-Fi AP/router (default gateway) → ISP router → ... → Google. Each hop replaces L2 headers; IP destination stays 8.8.8.8; TTL drops. Traceroute maps hops via ICMP Time Exceeded from routers.',
          ),
        ]),
        example('Two routes conflict', [
          p(
            'You add a static /32 host route to a database VIP via a private link. General /16 goes via the main firewall. LPM sends that host via the private link — classic traffic engineering with more-specifics.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Static routes: zero protocol overhead, high human error, poor failover unless scripted.',
          'Dynamic routing: automatic failover, but complexity, security (auth), and convergence traps (loops, black holes).',
          'Asymmetric routing: path to server ≠ path back — breaks stateful firewalls.',
          'NAT alters apparent endpoints; routing still based on packet headers after translation.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Subnetting defines which destinations are on-link.',
          'BGP policies + DNS/CDN steer users globally (later pages).',
          'TCP sessions survive path changes if endpoints stay reachable; middlebox state may not.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Routing builds tables; forwarding uses them per packet."'),
        p('Interviewer: "How does a host know the gateway?"'),
        p(
          'Strong answer: "Usually DHCP provides the default gateway. The host installs 0.0.0.0/0 via that next hop. For on-link destinations it uses the interface route instead."',
        ),
        p('Interviewer: "What if two routes match?"'),
        p(
          'Strong answer: "Longest prefix wins. If still tied, administrative distance / protocol preference / metric, and possibly ECMP."',
        ),
        p('Interviewer: "BGP vs OSPF one-liner?"'),
        p(
          'Strong answer: "OSPF is an IGP flooding topology inside an AS for shortest paths. BGP is the Internet\'s EGP exchanging prefixes between ASes with rich policy — scalability and control over pure minimum hop count."',
        ),
      ]),
    ],
    commonMistakes: [
      'Using routing and forwarding interchangeably without nuance.',
      'Thinking packets contain the full path (source routing is rare; hop-by-hop is normal).',
      'Forgetting TTL prevents infinite loops.',
      'Assuming traceroute shows the return path (it shows forward hops that reply).',
    ],
    interviewQuestions: [
      'What is the difference between routing and forwarding?',
      'What is a default gateway?',
      'What is longest prefix match?',
      'What does traceroute tell you?',
      'Static vs dynamic routing — when to use each?',
    ],
    intermediateInterviewQuestions: [
      'Explain how a packet leaves a host to reach a remote IP.',
      'What is administrative distance?',
      'How does TTL interact with loops?',
      'What is ECMP?',
      'Why might ping to gateway work but Internet fail?',
    ],
    advancedInterviewQuestions: [
      'Explain BGP at a high level: prefix advertisement and AS paths.',
      'How do routing loops form during convergence, and what mitigations exist?',
      'What is anycast routing and how does it affect traceroute?',
      'How do overlay networks (VXLAN) change physical vs logical routing?',
      'Describe asymmetric routing issues with stateful firewalls.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain how a packet is routed from your laptop to a server.',
        answer:
          'The host checks whether the destination is on-link; if not, it forwards to the default gateway after ARPing the gateway MAC. Each router performs longest prefix match, decrements TTL, and sends the packet out the chosen interface toward the next hop, rewriting L2 headers each time. Eventually it reaches the destination network and local delivery. Control plane (OSPF/BGP/static) built the routes; data plane forwards packets. TRADE-OFF: hop-by-hop simplicity scales; policy and middleboxes can make paths asymmetric or sticky.',
      },
    ],
    keyTakeaways: [
      'Routing = learn paths; forwarding = per-packet next hop.',
      'Longest prefix match is the core lookup rule.',
      'Default route carries most host traffic to the gateway.',
      'IGP vs BGP: inside AS vs between ASes / policy at Internet scale.',
    ],
  },
)

export const m2Pages: StudyPage[] = [d3p5, d3p6, d3p7]
