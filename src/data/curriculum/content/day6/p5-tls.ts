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
} from '../../../helpers'

export const d6p5: StudyPage = createPage(
  'd6-p5',
  'TLS & Certificates',
  16,
  [
    'Explain what TLS protects (and what it does not)',
    'Describe certificate chains and trust anchors',
    'Sketch the trust establishment flow for interviews',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'TLS (Transport Layer Security) sits under HTTP to provide a confidential, integrity-protected channel between client and server, with server authentication via certificates (and optionally client certificates). HTTPS = HTTP over TLS. TLS does not magically fix XSS, SQLi, or IDOR — those are application bugs above the transport.',
        ),
        h3('Why it exists'),
        p(
          'On the public internet, paths cross untrusted networks. Without TLS, passwords, cookies, and tokens can be read or modified in transit. Certificates bind a public key to a hostname so you encrypt to the real bank.com, not an impostor.',
        ),
        table(
          ['TLS provides', 'TLS does NOT provide'],
          [
            ['Confidentiality of bytes on the wire', 'End-to-end crypto if a reverse proxy terminates TLS'],
            ['Integrity of the TLS records', 'Protection against malicious server logic'],
            ['Server identity (via cert + trust store)', 'Authorization between users'],
            ['Optional client identity (mTLS)', 'Safety of data at rest on either end'],
          ],
        ),
      ]),
      section('how', 'How it works — trust establishment', [
        h3('Certificates and PKI'),
        ul([
          'A certificate is a signed statement: “Public key PK belongs to example.com, valid from…to…, issued by CA X.”',
          'Trust anchors are root CAs in the client trust store (OS/browser).',
          'Intermediate CAs form a chain from leaf cert up to a trusted root.',
          'Clients verify signatures along the chain, hostname match (SAN), and validity period / revocation status.',
        ]),
        diagram(
          `flowchart TB
  Root[Root CA - Trust Anchor]
  Int[Intermediate CA]
  Leaf[Leaf cert for api.example.com]
  Root -->|signs| Int
  Int -->|signs| Leaf
  Client[Client trust store] -.->|trusts| Root
  Client -->|verifies chain to| Leaf`,
          'Certificate chain: leaf → intermediate → trusted root',
        ),
        h3('Conceptual TLS handshake (interview level)'),
        ol([
          'Client hello: supported TLS versions, cipher suites, extensions (SNI hostname).',
          'Server hello: chosen parameters; presents certificate chain.',
          'Client validates chain + hostname; derives shared secrets (modern TLS 1.3 uses ECDHE for forward secrecy).',
          'Symmetric keys protect application data records (AEAD).',
          'HTTP request proceeds inside the encrypted channel.',
        ]),
        diagram(
          `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: ClientHello (SNI, suites)
  S->>C: ServerHello + certificate chain
  C->>C: Validate chain, hostname, time
  C->>S: Key agreement messages
  Note over C,S: Derive symmetric traffic keys
  C->>S: Encrypted HTTP request
  S->>C: Encrypted HTTP response`,
          'Trust establishment then symmetric-protected application data',
        ),
        h3('Important properties'),
        ul([
          'Forward secrecy: compromising long-term server private key later should not decrypt past sessions (ECDHE).',
          'SNI: client indicates target hostname so servers can present the right cert.',
          'Certificate pinning: optional extra trust constraint; operationally brittle — know trade-offs.',
          'mTLS: client also presents a cert — common for service meshes and B2B APIs.',
        ]),
        callout(
          'info',
          'TLS 1.3 simplified the handshake, removed obsolete ciphers, and is the modern default. In interviews, prefer saying “TLS 1.2+ with modern AEAD ciphers and forward secrecy” unless asked for 1.3 specifics.',
          'Version hygiene',
        ),
      ]),
      section('example', 'Worked example', [
        example('Why browsers show a padlock', [
          p(
            'You visit https://pay.example.com. Browser receives leaf cert for pay.example.com signed by an intermediate, chained to a root in the trust store. Hostname matches; not expired; chain verifies. Browser then uses the established keys so cookies and card forms aren’t plaintext on the wire.',
          ),
          p(
            'If an attacker presents a self-signed cert for pay.example.com, verification fails unless the user explicitly trusts it — which is why “click through cert warnings” is dangerous on real sites.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'TLS termination at a load balancer: backend hop may be plaintext in a private network — some threat models require TLS again (mTLS) to the app.',
          'Corporate TLS inspection: middlebox presents its own cert; privacy/integrity model changes.',
          'Expired certs cause total outage (availability) — monitoring cert expiry is an ops control.',
          'HSTS tells browsers to always use HTTPS — reduces downgrade/ssl-strip style risks.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Uses asymmetric crypto for authentication/key agreement and symmetric AEAD for data — prior page.',
          'Secure cookies often set Secure flag so they only ride on HTTPS.',
          'OAuth redirect URIs should be HTTPS in production to protect codes/tokens in transit.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “All public traffic is HTTPS with certificates from a public CA.”'),
        p('Interviewer: “What does that guarantee?”'),
        p(
          'Strong answer: “Confidentiality and integrity between client and the TLS endpoint, plus authentication of that server identity — not app-layer authorization or safety of data at rest.”',
        ),
        p('Interviewer: “How does the client know to trust the cert?”'),
        p(
          'Strong answer: “It verifies a chain of signatures to a root CA in its trust store, checks hostname and validity, and ideally revocation status.”',
        ),
        p('Interviewer: “What about service-to-service?”'),
        p(
          'Strong answer: “Often mTLS or a mesh identity: both sides present certs issued by an internal CA, plus still enforce authz.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Claiming HTTPS prevents XSS or SQL injection.',
      'Unable to explain certificate chains / trust anchors.',
      'Ignoring cert expiry as an availability risk.',
      'Assuming TLS to the load balancer protects the whole path if backends are plaintext and the threat model includes lateral movement.',
    ],
    interviewQuestions: [
      'What does TLS provide?',
      'What is a certificate chain?',
      'What is a trust anchor / root CA?',
      'HTTP vs HTTPS?',
      'What is mTLS?',
    ],
    intermediateInterviewQuestions: [
      'Explain forward secrecy at a high level.',
      'What is SNI and why does it matter?',
      'What does certificate hostname verification prevent?',
      'How would you monitor and rotate certificates in production?',
      'When would you use certificate pinning?',
    ],
    advancedInterviewQuestions: [
      'Compare public PKI vs private CA for microservices.',
      'How does TLS interception break the end-to-end trust model?',
      'Design cert rotation with zero downtime for a fleet of services.',
      'What changed conceptually from TLS 1.2 to 1.3?',
      'How do you threaten-model a reverse proxy that terminates TLS and injects headers?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain how TLS and certificates establish trust.',
        answer:
          'TLS creates an encrypted, integrity-protected channel. The server presents a certificate that binds its public key to a hostname, signed by a CA. The client verifies the signature chain up to a trusted root in its trust store, checks the hostname and validity, then performs key agreement to derive symmetric keys for the session. That authenticates the server and protects data in transit. It doesn’t replace application authentication of users or authorization checks.',
      },
    ],
    keyTakeaways: [
      'TLS: confidentiality + integrity in transit + server auth via certs.',
      'Trust = chain validation to a root anchor + hostname/validity checks.',
      'HTTPS ≠ full application security.',
    ],
  },
)
