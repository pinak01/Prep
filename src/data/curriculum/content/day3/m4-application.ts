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

export const d3p12: StudyPage = createPage(
  'd3-p12',
  'HTTP Fundamentals',
  14,
  [
    'Explain methods, status codes, headers, and idempotency',
    'Contrast HTTP/1.1, HTTP/2, and HTTP/3 at a practical level',
    'Reason about caching, content negotiation, and connection reuse',
  ],
  {
    prerequisites: ['d3-p8'],
    sections: [
      section('concept', 'Concept', [
        p(
          'HTTP is an application-layer request/response protocol for transferring representations of resources. A client sends a method + target + headers + optional body; a server responds with a status code + headers + body. Most web APIs and browser traffic use HTTP semantics even when carried over different transports (TCP or QUIC).',
        ),
        h3('Why it dominates'),
        p(
          'Uniform resource model, universal client (browser), intermediable (caches, proxies, CDNs), and evolving versions that keep semantics while fixing performance (multiplexing, header compression, better loss recovery).',
        ),
        table(
          ['Method', 'Safe?', 'Idempotent?', 'Typical use'],
          [
            ['GET', 'Yes', 'Yes', 'Read resource'],
            ['HEAD', 'Yes', 'Yes', 'Headers only'],
            ['PUT', 'No', 'Yes', 'Replace resource'],
            ['DELETE', 'No', 'Yes', 'Remove resource'],
            ['POST', 'No', 'No*', 'Create/action (*can be made idempotent with keys)'],
            ['PATCH', 'No', 'No*', 'Partial update'],
            ['OPTIONS', 'Yes', 'Yes', 'CORS/preflight / capabilities'],
          ],
          'Safe = no state change intended; idempotent = N identical requests same server effect as 1',
        ),
      ]),
      section('how', 'How it works', [
        h3('Status code classes'),
        ul([
          '1xx informational',
          '2xx success (200 OK, 201 Created, 204 No Content)',
          '3xx redirect (301 permanent, 302/307/308 nuances)',
          '4xx client error (400, 401 vs 403, 404, 429)',
          '5xx server error (500, 502 bad gateway, 503 unavailable, 504 gateway timeout)',
        ]),
        h3('HTTP/1.1 essentials'),
        ul([
          'Persistent connections (keep-alive) — reuse TCP for multiple requests.',
          'Pipelining existed but was barely used (HOL issues).',
          'Hosts virtual hosting via Host header.',
          'Chunked transfer encoding; Content-Length framing.',
          'One request at a time per connection in practice → browsers open many parallel connections.',
        ]),
        h3('HTTP/2'),
        ul([
          'Binary framing, multiplexed streams on one connection.',
          'HPACK header compression.',
          'Server push (rarely decisive today).',
          'Still TCP → TCP HOL blocking on packet loss affects all streams.',
        ]),
        h3('HTTP/3'),
        ul([
          'HTTP semantics over QUIC (usually UDP/443).',
          'Independent streams reduce HOL blocking.',
          'TLS 1.3 integrated into QUIC handshake — often faster setup.',
          'Connection migration (e.g., Wi-Fi → cellular) via connection IDs.',
        ]),
        diagram(
          `flowchart TB
  subgraph H1["HTTP/1.1"]
    A1[Req1] --> A2[Req2]
    A2 --> A3[Req3]
  end
  subgraph H2["HTTP/2 over TCP"]
    B1[Stream1]
    B2[Stream2]
    B3[Stream3]
    B1 --- T[One TCP connection]
    B2 --- T
    B3 --- T
  end
  subgraph H3["HTTP/3 over QUIC"]
    C1[Stream1]
    C2[Stream2]
    C1 --- Q[QUIC over UDP]
    C2 --- Q
  end`,
          'Evolution: serialized → multiplexed on TCP → multiplexed on QUIC',
        ),
        h3('Caching headers (interview favorites)'),
        ul([
          'Cache-Control, ETag / If-None-Match → 304',
          'Last-Modified / If-Modified-Since',
          'Vary (e.g., Vary: Accept-Encoding)',
        ]),
      ]),
      section('example', 'Worked example', [
        example('Idempotency in payments', [
          p(
            'Retrying POST /charge might double-bill. Prefer Idempotency-Key header or PUT with deterministic IDs so retries are safe when TCP/HTTP fails mid-flight.',
          ),
        ]),
        code(
          'http',
          `GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer ...

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=0
ETag: "abc123"

{"id":42,"name":"Ada"}`,
          'Minimal request/response shape — methods, headers, body',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'HTTP/2 multiplexing helps, but one lossy TCP connection can stall everything — HTTP/3 addresses that.',
          'Excessive redirects add RTTs; misconfigured 301 caches permanently in browsers.',
          'GET with body is non-interop; do not design APIs that require it.',
          'Proxies may alter hop-by-hop headers (Connection, Keep-Alive, TE).',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'HTTPS = HTTP over TLS (next page).',
          'REST uses HTTP methods/status as the uniform interface.',
          'CDNs cache based on HTTP caching semantics.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "HTTP is request/response with methods and status codes."'),
        p('Interviewer: "Is POST idempotent?"'),
        p(
          'Strong answer: "Not by definition. Each POST may create another resource or trigger another action. We can make an operation idempotent with keys or by using PUT to a known URL, but vanilla POST is not."',
        ),
        p('Interviewer: "HTTP/2 vs HTTP/3?"'),
        p(
          'Strong answer: "Both multiplex streams and compress headers. HTTP/2 runs on TCP so packet loss blocks the connection. HTTP/3 uses QUIC over UDP with per-stream loss recovery and tighter TLS integration, improving performance on lossy/mobile networks."',
        ),
        p('Interviewer: "401 vs 403?"'),
        p(
          'Strong answer: "401 means unauthenticated — identify yourself. 403 means authenticated but not allowed, or generally forbidden. Some APIs blur them for security; I explain the intended semantics."',
        ),
      ]),
    ],
    commonMistakes: [
      'Calling all HTTP methods idempotent or none idempotent.',
      'Saying HTTP/2 eliminated all HOL blocking (TCP HOL remains).',
      'Using 200 for everything and ignoring status semantics.',
      'Confusing CORS preflight failures with TCP/TLS failures.',
    ],
    interviewQuestions: [
      'What does it mean for an HTTP method to be idempotent?',
      'Name common 2xx/4xx/5xx status codes and when to use them.',
      'Differences between HTTP/1.1 and HTTP/2?',
      'What problem does HTTP/3 solve vs HTTP/2?',
      'What is the Host header for?',
    ],
    intermediateInterviewQuestions: [
      'Explain keep-alive and why browsers limited connections per host in HTTP/1.1.',
      'How do ETag and 304 work?',
      '301 vs 302 vs 307/308?',
      'What is head-of-line blocking in HTTP/1.1 vs HTTP/2?',
      'How does HPACK help?',
    ],
    advancedInterviewQuestions: [
      'How does QUIC connection migration work at a high level?',
      'Design idempotent payment APIs over unreliable networks.',
      'When is HTTP/2 connection coalescing / SNI relevant?',
      'Explain hop-by-hop vs end-to-end headers with proxies.',
      'How do CDNs interpret Cache-Control: s-maxage vs max-age?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Compare HTTP/1.1, HTTP/2, and HTTP/3.',
        answer:
          'HTTP/1.1 is text-based request/response, usually one outstanding request per connection in practice, so browsers open many TCP connections. HTTP/2 adds binary framing, multiplexed streams, and header compression on one TCP connection — better efficiency, but TCP loss still stalls all streams. HTTP/3 keeps HTTP semantics over QUIC/UDP, reducing stream HOL blocking and combining crypto with transport for faster setup and migration. TRADE-OFF: newer protocols need client/server/path support; UDP may be blocked on some networks.',
      },
    ],
    keyTakeaways: [
      'Methods + status codes + headers carry HTTP semantics.',
      'Idempotency matters for safe retries — POST is not idempotent by default.',
      'H1: many conns; H2: multiplex on TCP; H3: multiplex on QUIC.',
      'Caching and redirects are performance and correctness levers.',
    ],
  },
)

export const d3p13: StudyPage = createPage(
  'd3-p13',
  'HTTPS and TLS Basics',
  16,
  [
    'Explain why TLS exists and what confidentiality, integrity, and authenticity mean',
    'Outline certificate validation and the TLS handshake at interview depth',
    'Explain how HTTPS prevents classic MITM when validation is done correctly',
  ],
  {
    prerequisites: ['d3-p12'],
    sections: [
      section('concept', 'Concept', [
        p(
          'HTTPS is HTTP over TLS (Transport Layer Security). TLS provides confidentiality (encryption), integrity (tamper detection), and authentication (usually of the server via certificates; optionally mutual TLS). It runs above TCP for HTTPS/1.1 and HTTP/2, and is integrated into QUIC for HTTP/3.',
        ),
        h3('Why it exists'),
        p(
          'Plain HTTP exposes passwords, cookies, and content to any on-path observer and allows modification. TLS aims to make the channel private and authentic between client and the intended server — defeating passive eavesdropping and active MITM when used correctly.',
        ),
        table(
          ['Property', 'Meaning'],
          [
            ['Confidentiality', 'Eavesdropper cannot read plaintext'],
            ['Integrity', 'Modifications detected'],
            ['Authentication', 'Talking to the real server (cert chain + hostname)'],
            ['Forward secrecy', 'Past sessions stay safe if long-term key later leaks (ECDHE)'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Certificates & PKI'),
        ol([
          'Server presents a certificate binding a public key to identities (SAN DNS names).',
          'Certificate is signed by a Certificate Authority (CA) the client trusts (root store).',
          'Client verifies signature chain, validity dates, revocation (OCSP/CRL/stapling — imperfect), and hostname match.',
          'Client uses the public key material only after trust succeeds — then performs key exchange.',
        ]),
        h3('TLS 1.2 vs 1.3 handshake (conceptual)'),
        ul([
          'Agree version and ciphers; exchange key shares (ECDHE); derive symmetric keys.',
          'Server proves ownership of certificate private key.',
          'TLS 1.3: fewer RTTs, safer cipher suite story, 0-RTT option with replay caveats.',
          'Symmetric crypto (AES-GCM / ChaCha20-Poly1305) protects application data efficiently after handshake.',
        ]),
        diagram(
          `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: TCP connect
  C->>S: ClientHello key share
  S->>C: ServerHello key share
  S->>C: Certificate CertificateVerify Finished
  C->>S: Finished
  Note over C,S: Application data encrypted HTTP`,
          'Simplified TLS 1.3-style handshake after TCP (HTTP/1.1 or H2)',
        ),
        h3('How MITM is prevented (when validation is correct)'),
        p(
          'An attacker on the path can forward packets but cannot present a valid certificate for example.com without the private key of a cert trusted for that name. If the client properly validates the chain and hostname, a forged cert fails. If the client accepts the attacker\'s self-signed cert (user click-through) or a rogue corporate CA is installed, MITM becomes possible — trust model matters.',
        ),
        diagram(
          `flowchart TB
  U[User browser] -->|TLS to real cert| S[example.com]
  A[On-path attacker]
  U -.->|If validation skipped| A
  A -.->|Fake cert accepted| Bad[Attacker decrypts/modifies]
  U -->|Validation enforced| OK[Attacker sees only ciphertext]`,
          'MITM fails against proper certificate validation; succeeds if trust is broken',
        ),
        callout(
          'warning',
          'TLS does not encrypt DNS by itself (unless DoH/DoT), nor hide that you talk to an IP/SNI in older setups (ECH aims to encrypt SNI). Discuss metadata honestly.',
          'Scope of protection',
        ),
      ]),
      section('example', 'Worked example', [
        example('Certificate name mismatch', [
          p(
            'Cert for *.example.com does not cover api.example.org. Browser shows error — correct behavior. Apps that disable verification "to make it work" re-enable MITM risk.',
          ),
        ]),
        example('mTLS', [
          p(
            'Mutual TLS: both sides present certificates. Common for service mesh / private APIs. Heavier ops (cert rotation) but strong identity vs shared bearer tokens alone.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Handshake latency: mitigated by session resumption, TLS1.3, HTTP/3.',
          'Termination at load balancer: TLS to LB, maybe plaintext or re-encrypt inside VPC — threat model dependent.',
          'Corporate TLS inspection installs a private CA — intentional MITM for DLP; devices must trust that CA.',
          'HSTS forces HTTPS; certificate pinning (mobile) is brittle but used in high-security apps.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'TCP/QUIC provides delivery; TLS provides security layer for HTTP.',
          'Proxies: TLS can tunnel via CONNECT (HTTPS proxy) or terminate at reverse proxy.',
          'Typing a URL https://... includes TLS handshake in the critical path.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "HTTPS is HTTP over TLS for encryption and authentication."'),
        p('Interviewer: "How does the client know it is not a MITM?"'),
        p(
          'Strong answer: "The server must present a certificate chain ending in a trusted root for the requested hostname, proving possession of the private key during the handshake. Without a trusted cert for that name, a MITM cannot complete a validated handshake. If the user or OS trusts a rogue CA, that guarantee collapses."',
        ),
        p('Interviewer: "Symmetric vs asymmetric roles?"'),
        p(
          'Strong answer: "Asymmetric crypto authenticates and establishes shared secrets; bulk data uses fast symmetric AEAD. That hybrid design is why TLS is practical at scale."',
        ),
        p('Interviewer: "What does TLS not protect?"'),
        p(
          'Strong answer: "Endpoint compromise, phishing to the wrong site with a valid cert, some metadata like packet timings/sizes, and historically clear SNI/DNS — plus anything sent after decrypt at a terminating proxy."',
        ),
      ]),
    ],
    commonMistakes: [
      'Saying HTTPS only encrypts and ignoring authentication.',
      'Claiming TLS prevents phishing on lookalike domains with valid certs.',
      'Disabling cert verification in production clients.',
      'Equating "padlock" with full site safety (XSS, etc. still exist).',
    ],
    interviewQuestions: [
      'What security properties does TLS provide?',
      'What is the difference between HTTP and HTTPS?',
      'What is checked during certificate validation?',
      'How does TLS help prevent MITM?',
      'What is forward secrecy?',
    ],
    intermediateInterviewQuestions: [
      'Sketch the TLS handshake at a high level.',
      'TLS 1.2 vs 1.3 — what improved?',
      'What is SNI and why does it exist?',
      'Where can TLS be terminated in a load-balanced architecture?',
      'What is HSTS?',
    ],
    advancedInterviewQuestions: [
      'Explain 0-RTT data risks (replay) in TLS 1.3.',
      'How does certificate transparency help the ecosystem?',
      'Compare mTLS vs JWT for service identity.',
      'How does ECH change what on-path observers see?',
      'Design secure TLS for microservices: mesh vs gateway termination trade-offs.',
      'What breaks if a client pins a cert and the server rotates?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain HTTPS and MITM prevention.',
        answer:
          'HTTPS wraps HTTP in TLS so data is encrypted and integrity-protected, and the server authenticates with a PKI certificate matching the hostname. After TCP connect, ClientHello/ServerHello establish keys (modern ECDHE for forward secrecy); the server proves possession of the cert private key; then HTTP runs encrypted. A network MITM without a trusted certificate for that name cannot decrypt or silently alter traffic if the client validates correctly. TRADE-OFF: trust depends on CAs and correct client validation; TLS termination points must be in your threat model; DNS/SNI metadata may still leak.',
      },
    ],
    keyTakeaways: [
      'TLS ≈ confidentiality + integrity + authentication (+ FS with ephemeral KE).',
      'Cert chain + hostname validation is the MITM backstop.',
      'Bulk crypto is symmetric; asymmetric crypto bootstraps trust/keys.',
      'Know what TLS does not protect (endpoints, phishing, some metadata).',
    ],
  },
)

export const d3p14: StudyPage = createPage(
  'd3-p14',
  'REST, WebSockets & Sockets',
  14,
  [
    'Describe REST constraints and resource-oriented API design',
    'Contrast request/response HTTP with WebSocket full-duplex messaging',
    'Explain sockets as the OS abstraction for network endpoints',
  ],
  {
    prerequisites: ['d3-p12'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Sockets are the OS API for sending/receiving data on transports (TCP/UDP). REST is an architectural style for networked APIs — typically over HTTP — centered on resources, uniform interfaces, and stateless interactions. WebSockets provide a persistent, full-duplex message channel starting with an HTTP upgrade, suited to server-push and chatty interactive apps.',
        ),
        h3('Why separate these ideas'),
        p(
          'Interviewers mix levels: "socket" (API/transport endpoint), "REST" (API design), "WebSocket" (specific protocol). Clear layering earns points.',
        ),
      ]),
      section('how', 'How it works', [
        h3('Sockets'),
        ul([
          'socket → bind/listen/accept (server) or connect (client) → send/recv → close.',
          'TCP socket ≈ connection endpoint; UDP socket ≈ host:port mailbox.',
          'Blocking vs non-blocking / evented I/O (epoll, kqueue, io_uring) for scale.',
        ]),
        h3('REST (practical interview definition)'),
        ul([
          'Resources identified by URIs.',
          'Uniform interface: HTTP methods + status codes + representations (JSON).',
          'Stateless server: each request carries auth/context; scalability via horizontal servers.',
          'Hypermedia optional (HATEOAS) — rarely strict in industry APIs.',
          'Not merely "JSON over HTTP" — but many "REST APIs" are pragmatic RPC-ish.',
        ]),
        h3('WebSockets'),
        ol([
          'Client sends HTTP Upgrade: websocket with Sec-WebSocket-Key.',
          'Server responds 101 Switching Protocols.',
          'Thereafter framed messages either direction over the same TCP/TLS connection.',
          'App handles heartbeats, reconnect/backoff, auth refresh.',
        ]),
        diagram(
          `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: HTTP GET Upgrade websocket
  S->>C: 101 Switching Protocols
  C->>S: WS message
  S->>C: WS message
  S->>C: Server push anytime`,
          'WebSocket upgrade then full-duplex messaging',
        ),
        table(
          ['Model', 'Directionality', 'Best for'],
          [
            ['REST/HTTP', 'Request → response', 'CRUD APIs, cacheable reads'],
            ['WebSocket', 'Full duplex', 'Chat, live feeds, collaborative editing'],
            ['SSE', 'Server → client stream', 'One-way event streams over HTTP'],
            ['gRPC streaming', 'Streams on HTTP/2', 'Service-to-service, typed contracts'],
          ],
        ),
      ]),
      section('example', 'Worked example', [
        example('Choose the channel', [
          ul([
            'Mobile app loads profile: REST GET /users/me — cacheable, simple.',
            'Trading ticker: WebSocket or SSE — continuous updates.',
            'File upload: REST multipart or presigned URL to object storage.',
            'Microservice internal: gRPC often preferred over ad-hoc JSON REST.',
          ]),
        ]),
        code(
          'javascript',
          `// Browser WebSocket sketch
const ws = new WebSocket('wss://example.com/ticks')
ws.onmessage = (e) => console.log(e.data)
ws.send('subscribe:AAPL')`,
          'Client-side full-duplex after wss upgrade',
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'WebSockets: stateful connections harder to load-balance; need sticky sessions or pub/sub fanout.',
          'REST: easy intermediaries/caching; awkward for high-frequency server push.',
          'Long-lived sockets vs serverless timeouts — architectural mismatch.',
          'Socket leaks (forgot close) exhaust FDs — ops interview crossover.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'wss:// = WebSocket over TLS, same cert story as HTTPS.',
          'L7 proxies must understand Upgrade; L4 can forward blindly.',
          'Typing a URL uses HTTP(S); apps may later open WebSockets.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "REST uses stateless HTTP resource APIs; WebSockets are full-duplex after upgrade."'),
        p('Interviewer: "Is REST the same as HTTP?"'),
        p(
          'Strong answer: "REST is an architecture that usually uses HTTP as its uniform interface, but HTTP can carry non-REST APIs, and REST is more than JSON verbs — resources, statelessness, and representations. In industry we often say REST for pragmatic HTTP APIs."',
        ),
        p('Interviewer: "How do you scale WebSockets?"'),
        p(
          'Strong answer: "Terminate connections on a fleet with sticky routing or a dedicated gateway, fan out events via Redis/NATS/Kafka, and keep instances horizontally scalable by externalizing session interest lists."',
        ),
        p('Interviewer: "Socket vs WebSocket?"'),
        p(
          'Strong answer: "A socket is the OS endpoint API for TCP/UDP. WebSocket is an application protocol that uses a TCP socket (often with TLS) after an HTTP handshake to exchange framed messages."',
        ),
      ]),
    ],
    commonMistakes: [
      'Calling any JSON HTTP API "pure REST" without nuance.',
      'Thinking WebSockets replace HTTP for all APIs.',
      'Confusing SSE with WebSockets.',
      'Using raw TCP sockets in browsers (you cannot — use WS/WebRTC/HTTP).',
    ],
    interviewQuestions: [
      'What are the main constraints of REST?',
      'How does a WebSocket connection start?',
      'Difference between WebSockets and HTTP polling?',
      'What is a TCP socket?',
      'When would you choose WebSockets over REST?',
    ],
    intermediateInterviewQuestions: [
      'What does statelessness mean for REST scalability?',
      'How does wss:// differ from ws://?',
      'Compare SSE and WebSockets.',
      'What is an HTTP Upgrade?',
      'How do reverse proxies affect WebSockets?',
    ],
    advancedInterviewQuestions: [
      'Design a multi-region WebSocket fanout system.',
      'How does gRPC streaming compare to WebSockets?',
      'Backpressure strategies for hot WebSocket feeds.',
      'Idempotency and delivery guarantees for WS messages (at-least-once).',
      'Security: auth, origin checks, and message-size limits on WS.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Compare REST and WebSockets.',
        answer:
          'REST over HTTP is request/response, usually stateless, great for resource CRUD, caching, and ubiquitous tooling. WebSockets upgrade from HTTP to a long-lived full-duplex channel for low-latency bidirectional messages and server push. Use REST for standard API operations; use WebSockets when the client must stream or interact continuously. TRADE-OFF: REST is simpler to scale and cache; WebSockets need connection state management, heartbeats, and careful load balancing.',
      },
    ],
    keyTakeaways: [
      'Sockets = OS networking API; protocols ride on them.',
      'REST ≈ resourceful, stateless HTTP APIs (pragmatic definition OK if precise).',
      'WebSockets = upgrade then full-duplex; harder to scale than pure REST.',
      'Pick channel based on push needs, caching, and operational complexity.',
    ],
  },
)

export const d3p15: StudyPage = createPage(
  'd3-p15',
  'Proxies, Load Balancers & CDN',
  14,
  [
    'Distinguish forward vs reverse proxies and gateways',
    'Explain L4 vs L7 load balancing algorithms and health checks',
    'Describe CDN edge caching and origin shielding concepts',
  ],
  {
    prerequisites: ['d3-p12', 'd3-p13'],
    sections: [
      section('concept', 'Concept', [
        p(
          'A proxy is an intermediary for requests. Forward proxies serve clients (egress, filtering). Reverse proxies sit in front of servers (ingress, TLS termination, routing). Load balancers distribute traffic across instances. CDNs are geographically distributed reverse-proxy caches that bring content closer to users.',
        ),
        h3('Why they exist'),
        p(
          'Scale beyond one machine, terminate TLS centrally, enforce security policy, cache static assets, absorb spikes, and hide origin topology.',
        ),
      ]),
      section('how', 'How it works', [
        h3('Forward vs reverse'),
        table(
          ['Type', 'Who configures', 'Purpose'],
          [
            ['Forward proxy', 'Client/org egress', 'NAT-ish access, filtering, anonymity'],
            ['Reverse proxy', 'Service operator', 'LB, WAF, TLS, routing to apps'],
            ['Transparent proxy', 'Network path', 'Intercept without client config'],
          ],
        ),
        h3('L4 vs L7 load balancing'),
        ul([
          'L4: TCP/UDP 5-tuple; very fast; no HTTP awareness; can forward TLS bytes without decrypting (passthrough).',
          'L7: parse HTTP; route by path/host/header; can retry idempotent GETs; needs TLS terminate or observability tricks.',
          'Algorithms: round-robin, least connections, consistent hashing (sticky sessions / cache friendliness), weighted.',
          'Health checks remove bad backends; drain for deploys.',
        ]),
        diagram(
          `flowchart LR
  U[Users] --> CDN[CDN edge]
  CDN --> RP[Reverse proxy / L7 LB]
  RP --> A[App A]
  RP --> B[App B]
  RP --> C[App C]
  A --> DB[(Data plane)]
  B --> DB
  C --> DB`,
          'Common public web path: CDN → reverse proxy/LB → app fleet',
        ),
        h3('CDN behavior'),
        ul([
          'Edge caches responses per cache key (URL + Vary headers).',
          'Cache HIT serves locally; MISS fetches origin (or regional shield).',
          'Purge/invalidate on deploy; TTL and revalidation (ETag) matter.',
          'Anycast DNS or Geo-DNS steers clients to nearby POP.',
        ]),
      ]),
      section('example', 'Worked example', [
        example('Sticky sessions', [
          p(
            'Legacy app stores session in local memory. L7 cookie affinity or consistent hash keeps a user on one node. Better fix: externalize session store so any node can serve — then LB can be truly stateless.',
          ),
        ]),
        example('TLS modes', [
          p(
            'Passthrough L4: end-to-end TLS to app — LB cannot inject headers. Terminate at LB: LB adds X-Forwarded-For / X-Forwarded-Proto; apps must trust only the LB. Re-encrypt to backend for in-transit protection inside the DC.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'L7 features vs latency/CPU of decryption and parsing.',
          'CDN caching wrong (personalized pages) leaks data — Cache-Control: private.',
          'Single LB region is an availability risk — use anycast/DNS failover/multi-region.',
          'Health checks that hit cheap /health may pass while /api is broken — check what matters.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'HTTP caching headers drive CDN correctness.',
          'DNS TTLs interact with LB failover speed.',
          'WebSockets need Upgrade-aware L7 or L4 passthrough.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Reverse proxies and LBs distribute and protect backends; CDNs cache at the edge."'),
        p('Interviewer: "L4 vs L7?"'),
        p(
          'Strong answer: "L4 balances TCP/UDP connections without reading HTTP — high performance, TLS passthrough possible. L7 understands HTTP for path-based routing, header policies, and smarter retries, usually after TLS termination. Choose based on whether you need application awareness."',
        ),
        p('Interviewer: "How does a CDN reduce latency?"'),
        p(
          'Strong answer: "It shortens the RTT by serving cacheable content from a nearby POP and often keeps persistent optimized connections to origins. Dynamic APIs may still hit origin, but TLS/TCP setup can still benefit from edge termination patterns."',
        ),
        p('Interviewer: "Trade-off of terminating TLS at the edge?"'),
        p(
          'Strong answer: "Gains visibility, WAF, and routing; becomes a trust boundary. Backend traffic needs a separate protection story, and cert management concentrates on the edge."',
        ),
      ]),
    ],
    commonMistakes: [
      'Swapping forward and reverse proxy definitions.',
      'Assuming CDNs always cache personalized API responses safely.',
      'Ignoring X-Forwarded-For spoofing if app trusts clients directly.',
      'Equating load balancing with autoscaling (related but distinct).',
    ],
    interviewQuestions: [
      'Forward proxy vs reverse proxy?',
      'What is a CDN?',
      'L4 vs L7 load balancing?',
      'Name common load balancing algorithms.',
      'What is TLS termination?',
    ],
    intermediateInterviewQuestions: [
      'How do health checks interact with deployments?',
      'What is consistent hashing good for?',
      'How do CDNs use Cache-Control?',
      'What headers identify the original client IP behind a proxy?',
      'Sticky sessions — why are they often an anti-pattern?',
    ],
    advancedInterviewQuestions: [
      'Design global load balancing with DNS + anycast + health.',
      'How would you cache authenticated content at the edge safely?',
      'Blue/green or canary via LB weighted routing — failure modes?',
      'Compare Envoy/nginx/cloud LBs feature sets conceptually.',
      'Origin shield and request collapsing — how they protect origins.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain reverse proxies, load balancers, and CDNs.',
        answer:
          'A reverse proxy accepts client traffic on behalf of servers — often terminating TLS, applying WAF rules, and routing. A load balancer is a reverse proxy specialized to distribute across healthy instances using L4 or L7 policies. A CDN is a distributed fleet of caching reverse proxies that serve content near users to cut latency and origin load. TRADE-OFF: more intermediaries add hop complexity and trust boundaries but unlock scale, safety, and performance.',
      },
    ],
    keyTakeaways: [
      'Forward = client egress; reverse = service ingress.',
      'L4 = fast packets/connections; L7 = HTTP-aware routing.',
      'CDNs cache at edges; correctness depends on cache keys/headers.',
      'Health checks + draining make LB-safe deploys possible.',
    ],
  },
)

export const d3p16: StudyPage = createPage(
  'd3-p16',
  'Latency, Throughput & Typing a URL',
  20,
  [
    'Define latency vs throughput and where delays accrue',
    'Narrate the full path: DNS → TCP → TLS → HTTP → server → response → render',
    'Identify optimization levers at each step for interviews',
  ],
  {
    prerequisites: ['d3-p6', 'd3-p9', 'd3-p13', 'd3-p15'],
    sections: [
      section('concept', 'Concept', [
        p(
          'Latency is time for a unit of work to complete (e.g., RTT, time-to-first-byte). Throughput is work per unit time (Mbps, requests/s). A system can have high throughput and still feel slow if latency is high (fat pipe, long RTT). Typing a URL into a browser exercises nearly every concept from Day 3 in order — the ultimate interview story.',
        ),
        h3('Why interviewers love this'),
        p(
          'It tests whether you can integrate DNS, routing, TCP, TLS, HTTP, caching, and rendering without drowning in trivia — structured, layered narration wins.',
        ),
        table(
          ['Metric', 'Unit examples', 'Dominated by'],
          [
            ['Latency', 'ms', 'Distance/RTT, queues, handshakes, disk, GC'],
            ['Throughput', 'Mb/s, req/s', 'Bandwidth, concurrency, CPU, window/BDP'],
          ],
        ),
      ]),
      section('how', 'How it works — end-to-end URL deep dive', [
        h3('Step-by-step: user presses Enter on https://www.example.com/shop'),
        ol([
          'Parse URL: scheme https, host www.example.com, path /shop, optional query/fragment (fragment not sent to server).',
          'HSTS / cache: browser may force HTTPS or use cached redirect.',
          'DNS resolution: stub → recursive resolver → (cache hit or) root/TLD/auth → A/AAAA; may return CDN edge IPs; Happy Eyeballs may race v6/v4.',
          'Decide next hop: on-link vs default gateway; ARP/ND for next hop MAC.',
          'Routing across Internet: hop-by-hop LPM toward the VIP / anycast edge.',
          'TCP three-way handshake to dest:443 (unless 0-RTT/QUIC).',
          'TLS handshake: certify example.com, derive keys (TLS1.3 ~1 RTT after TCP; HTTP/3/QUIC combines).',
          'HTTP request: GET /shop, headers (Host, cookies, Accept-Encoding…); H2/H3 may multiplex.',
          'Edge/CDN/LB: cache HIT possible; else forward to origin; WAF/auth as configured.',
          'App/server: business logic, DB/cache; build HTML/JSON response.',
          'Response path: status/headers/body; possible compression (gzip/br); TCP/QUIC delivery.',
          'Browser: parse HTML, discover CSS/JS/images — each may trigger more DNS/TCP/TLS/HTTP (connections reused when possible).',
          'Render: DOM/CSSOM → render tree → paint; JS may block; metrics like TTFB, FCP, LCP.',
        ]),
        diagram(
          `sequenceDiagram
  participant U as User Browser
  participant D as DNS Resolver
  participant E as CDN Edge
  participant O as Origin App
  U->>D: Resolve www.example.com
  D-->>U: IP of edge
  U->>E: TCP + TLS
  U->>E: HTTP GET /shop
  alt Cache HIT
    E-->>U: 200 HTML cached
  else Cache MISS
    E->>O: Fetch origin
    O-->>E: HTML
    E-->>U: 200 HTML
  end
  U->>E: GET /app.js /styles.css
  E-->>U: Assets`,
          'Critical path for a typical HTTPS page load via CDN',
        ),
        h3('Where time goes (latency budget)'),
        ul([
          'DNS lookup (cached vs cold).',
          'TCP handshake (~1 RTT).',
          'TLS handshake (~1 RTT TLS1.3; more on older stacks).',
          'Request + server think time + TTFB.',
          'Download (size / throughput) + parse/render; waterfall of dependencies.',
        ]),
        callout(
          'tip',
          'Say "about one RTT each for TCP and TLS 1.3 on a cold HTTPS/1.1 or H2 connection, plus DNS if uncached" — then mention HTTP/3 can merge transport+TLS.',
          'Interview timing intuition',
        ),
      ]),
      section('example', 'Worked example', [
        example('Cold vs warm load', [
          ul([
            'Cold: DNS + new TCP + TLS + full HTML + many assets.',
            'Warm: DNS cached, keep-alive/H2 connection warm, disk cache 304/HIT — much faster.',
            'Optimization story: CDN, cache headers, fewer bytes (compression, image sizing), fewer RTTs (preconnect, H3), edge SSR.',
          ]),
        ]),
        example('Latency vs throughput scenario', [
          p(
            'Copying a 10 GB backup across a 1 Gbps link with 100 ms RTT: throughput may approach line rate if window ≥ BDP (~12.5 MB), but a tiny API call still pays full RTT handshake costs — latency-bound. Different bottlenecks, different fixes.',
          ),
        ]),
        example('Failure localization using the story', [
          ul([
            'NXDOMAIN / wrong IP → DNS.',
            'SYN timeout → network/firewall/routing.',
            'TLS cert error → PKI/name mismatch/MITM/clock.',
            'HTTP 502/504 → proxy/upstream.',
            'HTTP 200 but blank app → frontend JS/CORS/content.',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'More edge logic improves UX but increases complexity and cache correctness risk.',
          'Aggressive DNS TTLs vs failover agility.',
          'Connection coalescing and partitioning (browsers isolate privacy) change reuse assumptions.',
          'Mobile networks: high RTT/loss — H3/QUIC shines; still optimize bytes.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Every prior Day 3 page appears in this narrative — use it as your synthesis.',
          'BDP math explains why fat international pipes still need large windows.',
          'Security: TLS authenticity is why you trust the HTML/JS you execute.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: "Browser resolves DNS, TCP+TLS to the server or CDN, then HTTP GET, then renders and fetches subresources."'),
        p('Interviewer: "How many RTTs before the first byte on cold HTTPS?"'),
        p(
          'Strong answer: "Roughly DNS (variable) + 1 RTT TCP + 1 RTT TLS 1.3 + 1 RTT for request/response TTFB if the server answers immediately — order-of-magnitude three network RTTs after DNS on classic TCP+TLS1.3. HTTP/3 can reduce setup. Caching and keep-alive remove most of this on subsequent navigations."',
        ),
        p('Interviewer: "How would you speed it up?"'),
        p(
          'Strong answer: "Cut RTTs (CDN, preconnect, H3), cut bytes (compression, code-split, image CDN), cut server time (cache, DB indexes), and cut critical-path chains (defer JS, inline critical CSS carefully). Measure with TTFB/LCP waterfall, do not guess."',
        ),
        p('Interviewer: "Latency vs bandwidth upgrade?"'),
        p(
          'Strong answer: "If the page is small and RTT-dominated, more bandwidth barely helps — reduce RTTs and server time. If transferring large assets, bandwidth and window/BDP matter more."',
        ),
      ]),
    ],
    commonMistakes: [
      'Skipping DNS, TLS, or CDN in the URL story.',
      'Claiming data starts in the SYN packet as a matter of course (unless TFO/0-RTT carefully caveated).',
      'Confusing latency with bandwidth.',
      'Forgetting subresource fetches dominate many page loads.',
    ],
    interviewQuestions: [
      'What happens when you type a URL and press Enter?',
      'Latency vs throughput — difference?',
      'Where does time go on a cold HTTPS page load?',
      'How does a CDN change the URL fetch path?',
      'What is TTFB?',
    ],
    intermediateInterviewQuestions: [
      'Estimate RTTs for TCP+TLS1.3+HTTP GET cold connection.',
      'How does connection reuse change the story on the next click?',
      'How do cookies and SameSite policies affect cross-site requests in the waterfall?',
      'What is Happy Eyeballs?',
      'How would you debug "site works on Wi-Fi but not corporate network"?',
    ],
    advancedInterviewQuestions: [
      'Compare performance of HTTP/2 vs HTTP/3 on a high-loss mobile link.',
      'Design a performance budget for a global e-commerce homepage.',
      'How do service workers alter the fetch pipeline?',
      'Explain connection coalescing and CERT/name constraints.',
      'Where does BDP appear in a large file download story?',
      'How do anycast edges interact with TCP during failover mid-connection?',
    ],
    interviewReadyAnswers: [
      {
        question: 'What happens when you type https://example.com into a browser?',
        answer:
          'The browser parses the URL, resolves example.com via DNS to one or more IPs (often a CDN), ARPs the local gateway if needed, and routes packets to the destination. It completes a TCP handshake to port 443, then a TLS handshake validating the certificate for the hostname and establishing encryption keys. It sends an HTTP GET /, receives HTML, and recursively fetches linked assets—reusing connections when possible—then parses and renders the page. Each step can be cached or optimized: DNS TTL, keep-alive/H2/H3, CDN HITs, compression. TRADE-OFF: cold loads pay DNS+TCP+TLS RTTs; warm loads mostly pay server/edge time and download/render.',
      },
      {
        question: 'Latency vs throughput with an example.',
        answer:
          'Latency is how long one operation waits — e.g. 80 ms RTT. Throughput is how much you move per time — e.g. 500 Mbps. A chatty API with 20 sequential dependencies feels slow even on a fat pipe because each call waits RTT. A bulk download cares about bandwidth and TCP window ≥ BDP. Optimize latency-bound paths by reducing RTTs and serialization; optimize throughput-bound paths with bandwidth, concurrency, and window sizing.',
      },
    ],
    keyTakeaways: [
      'URL load = DNS → L2/L3 delivery → TCP → TLS → HTTP → app → render waterfall.',
      'Latency ≠ throughput; diagnose which binds the user experience.',
      'Cold HTTPS pays multiple RTTs; caching/CDN/H3 shrink the critical path.',
      'Use this narrative to stitch every Day 3 topic into one coherent answer.',
    ],
  },
)

export const m4Pages: StudyPage[] = [d3p12, d3p13, d3p14, d3p15, d3p16]
