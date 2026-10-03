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

export const d6p1: StudyPage = createPage(
  'd6-p1',
  'CIA Triad & Threat Mindset',
  14,
  [
    'Define confidentiality, integrity, and availability with concrete controls',
    'Frame security answers around assets, threats, vulnerabilities, and controls',
    'Apply a threat mindset without offensive exploitation detail',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Security interviews almost always start from the CIA triad: Confidentiality, Integrity, and Availability. These are the three properties you protect. Every control — encryption, access checks, backups, rate limits — maps to one or more of them. Strong candidates name the property first, then the threat, then the control.',
        ),
        h3('Why it exists'),
        p(
          'Without a shared vocabulary, “secure the system” is vague. CIA gives you a checklist: Can unauthorized parties read data? Can anyone alter data unnoticed? Can legitimate users reach the service when they need it? Interviewers use this frame to see whether you think in risks and mitigations rather than buzzwords.',
        ),
        h3('The three properties'),
        ul([
          'Confidentiality — only authorized parties can read sensitive data (encryption, access control, least privilege, masking).',
          'Integrity — data and code are not modified improperly; changes are detectable (hashes, signatures, checksums, audit logs, constraints).',
          'Availability — systems remain usable for legitimate users (redundancy, DDoS mitigation, backups, graceful degradation, rate limits that protect capacity).',
        ]),
        callout(
          'tip',
          'Some frameworks add Accountability / Non-repudiation (who did what, and can they deny it?). Mention it as a bonus when discussing audit logs and signed actions.',
          'Beyond CIA',
        ),
      ]),
      section('how', 'How it works — threat mindset', [
        p(
          'A practical interview model is: Asset → Threat → Vulnerability → Control → Residual risk. You do not need attacker playbooks; you need to reason about what can go wrong and what you put in place.',
        ),
        ol([
          'Identify assets: user PII, credentials, payment data, trading orders, session tokens, internal admin APIs.',
          'Name threats: eavesdropping, tampering, account takeover, privilege abuse, outage from overload, insider misuse.',
          'Find vulnerabilities: missing authz, plaintext secrets, unbounded queries, weak password storage, open admin ports.',
          'Apply controls: TLS, parameterized queries, RBAC, hashing, rate limits, monitoring.',
          'Accept residual risk: no system is perfect; document what remains and how you detect it.',
        ]),
        diagram(
          `flowchart LR
  A[Asset] --> T[Threat]
  T --> V[Vulnerability]
  V --> C[Control]
  C --> R[Residual risk]
  R --> M[Monitor / Detect]`,
          'Asset → threat → vulnerability → control → residual risk loop',
        ),
        h3('Defense in depth'),
        p(
          'Never rely on a single control. Example for a password field: TLS in transit (confidentiality), bcrypt+salt at rest (confidentiality if DB leaks), lockout/rate limit (availability + brute-force resistance), audit of login failures (detection). If one layer fails, others still raise the cost of compromise.',
        ),
        table(
          ['Property', 'Classic threat', 'Typical control'],
          [
            ['Confidentiality', 'Eavesdropping / DB dump', 'TLS, encryption at rest, access control'],
            ['Integrity', 'Tampered payment amount', 'Signatures, HMAC, DB constraints, checksums'],
            ['Availability', 'Flood of requests', 'Rate limits, autoscaling, WAF, CDN, backups'],
          ],
          'Quick CIA → threat → control mapping',
        ),
      ]),
      section('example', 'Worked example', [
        example('Secure a banking balance API endpoint', [
          p(
            'Asset: account balances and transfer instructions. Threats: unauthorized read of balances (C), forged transfer amount (I), API flooded so transfers fail (A).',
          ),
          ul([
            'Confidentiality: authenticate caller; authorize only owner/role; never log full account numbers; TLS everywhere.',
            'Integrity: server-side amount validation; idempotency keys; signed or authenticated requests; DB constraints preventing negative balances without a matching debit.',
            'Availability: per-user and per-IP rate limits; circuit breakers; read replicas for balance queries; clear 429/503 behavior.',
          ]),
          p(
            'Interview line: “I’d protect C with authn/authz and TLS, I with server-side validation and audit trails, A with rate limiting and redundancy — and I’d monitor failed authz and unusual transfer patterns.”',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Availability vs security: aggressive lockouts stop brute force but can lock out real users (DoS yourself). Prefer progressive delays + CAPTCHA + anomaly detection over permanent bans.',
          'Confidentiality vs usability: MFA and short session TTLs improve C but hurt UX; product and risk appetite decide.',
          'Integrity vs performance: full cryptographic verification of every message is expensive; often HMAC or TLS integrity is enough at the edge.',
          'Logging vs confidentiality: verbose logs help integrity/accountability but can leak secrets — redact tokens and PII.',
        ]),
        callout(
          'mistake',
          'Saying “we use HTTPS so we’re secure” collapses all of CIA into one control. HTTPS mainly protects data in transit; it does not fix IDOR, XSS, or weak password storage.',
          'Single-control fallacy',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Authn/authz (next pages) primarily serve Confidentiality and Integrity of access decisions.',
          'Hashing protects Integrity of stored passwords (and Confidentiality of the original password if the hash is slow + salted).',
          'TLS protects Confidentiality and Integrity on the wire; certificates establish trust for that channel.',
          'Rate limiting and DDoS defenses are Availability controls that appear again in later vulnerability pages.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I’d start with the CIA triad for this service.”'),
        p('Interviewer: “Why?”'),
        p(
          'Strong answer: “It forces me to cover read risks, tamper risks, and outage risks instead of only talking about encryption.”',
        ),
        p('Interviewer: “How would you prioritize?”'),
        p(
          'Strong answer: “Rank by impact × likelihood for this domain. For finance, integrity of money movement and confidentiality of PII usually outrank nice-to-have features; availability of trading/order paths is also critical during market hours.”',
        ),
        p('Interviewer: “What residual risk remains?”'),
        p(
          'Strong answer: “Insider abuse and zero-days. We mitigate with least privilege, audit logging, separation of duties, and detection — not by pretending residual risk is zero.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Listing tools (WAF, VPC, AES) without mapping them to C, I, or A.',
      'Confusing integrity with confidentiality (“encrypted, so it can’t be changed” — encryption alone does not guarantee integrity unless you also authenticate, e.g. AEAD).',
      'Ignoring availability when asked to “secure” a system.',
      'Assuming perimeter security is enough (defense in depth missing).',
    ],
    interviewQuestions: [
      'What is the CIA triad?',
      'Give one control for each of C, I, and A for a REST API.',
      'What is defense in depth?',
      'How do confidentiality and integrity differ?',
      'What is residual risk?',
    ],
    intermediateInterviewQuestions: [
      'Walk through asset → threat → control for a password reset flow.',
      'How can a security control harm availability?',
      'Where does non-repudiation fit relative to CIA?',
      'Why is “we use HTTPS” an incomplete security answer?',
      'How would you explain risk to a product manager who wants fewer login frictions?',
    ],
    advancedInterviewQuestions: [
      'Prioritize CIA properties for a market-data feed vs a payments ledger — do they differ?',
      'How do you design monitoring that supports all three CIA properties?',
      'When would you intentionally weaken a confidentiality control for availability during an incident?',
      'How do integrity controls interact with eventual consistency in distributed systems?',
      'Describe a defense-in-depth stack for secrets in a microservice architecture.',
    ],
    interviewReadyAnswers: [
      {
        question: 'What is the CIA triad and how do you use it in design?',
        answer:
          'CIA is Confidentiality, Integrity, and Availability — the properties we protect. Confidentiality means only authorized parties read data; Integrity means data isn’t altered improperly and changes are detectable; Availability means legitimate users can use the system. In design I identify assets, map threats to each property, then pick layered controls: TLS and authz for C, signatures/constraints/audit for I, redundancy and rate limits for A. I always mention residual risk and detection, because no single control is enough.',
      },
      {
        question: 'How would you secure a typical backend service?',
        answer:
          'I’d structure the answer around CIA. Confidentiality: HTTPS everywhere, strong authn, object-level authz, secrets in a vault, least-privilege DB roles. Integrity: parameterized queries, server-side validation, authenticated sessions/tokens, audit logs for sensitive actions. Availability: rate limiting, timeouts, horizontal scale, backups/DR. Then I’d call out the top risks for that domain — for APIs usually broken access control and injection — and how we’d detect abuse.',
      },
    ],
    keyTakeaways: [
      'Always map answers to Confidentiality, Integrity, Availability.',
      'Use Asset → Threat → Vulnerability → Control → Residual risk.',
      'Defense in depth: multiple independent layers beat one strong perimeter.',
    ],
  },
)
