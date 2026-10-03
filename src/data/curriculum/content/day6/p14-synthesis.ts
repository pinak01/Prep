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
  example,
  diagram,
} from '../../../helpers'

export const d6p14: StudyPage = createPage(
  'd6-p14',
  'Security Interview Synthesis',
  14,
  [
    'Structure answers for "how would you secure X?" questions',
    'Prioritize risks for a typical REST backend',
    'Deliver crisp verbal answers covering prevent, detect, respond',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Security interviews reward structured thinking under time pressure. You will rarely recite every OWASP item. Instead: clarify the system, name top risks, map controls to CIA, mention detection/response, and acknowledge residual risk. This page is a playbook for synthesizing Days 6 topics into strong verbal answers.',
        ),
        h3('Why it exists'),
        p(
          'Candidates fail by dumping buzzwords (WAF, zero-trust, blockchain) without prioritization. Strong candidates sound like engineers who ship: concrete controls, trade-offs, and what they’d do first in a week vs a quarter.',
        ),
      ]),
      section('how', 'How it works — answer frameworks', [
        h3('Framework A — STRIDE-lite (optional vocabulary)'),
        p(
          'Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. You need not memorize Microsoft STRIDE, but the categories help you not miss whole threat classes.'),
        h3('Framework B — Interview default (recommended)'),
        ol([
          'Clarify assets & trust boundaries (who calls what; where TLS terminates).',
          'List top 5 risks for this system (not generic internet).',
          'For each: prevent → detect → respond.',
          'Call out quick wins vs longer projects.',
          'State residual risk and metrics you’d watch.',
        ]),
        diagram(
          `flowchart LR
  Q[How secure X?] --> A[Assets]
  A --> T[Top threats]
  T --> C[Controls by CIA]
  C --> D[Detect]
  D --> R[Respond / residual]`,
          'Keep synthesis linear so interviewers can follow',
        ),
        h3('Typical REST backend priority stack'),
        table(
          ['Priority', 'Risk', 'First controls'],
          [
            ['P0', 'Broken access control / IDOR', 'Object-level authz + tests'],
            ['P0', 'Injection (SQL/command)', 'Parameterization; no shell'],
            ['P0', 'Authn failures / account takeover', 'MFA, hashing, rate limits, session hygiene'],
            ['P1', 'Sensitive data exposure', 'TLS, minimize PII, encrypt/tokenize, log redaction'],
            ['P1', 'XSS/CSRF (if browser cookies)', 'Encoding/CSP; SameSite + CSRF tokens'],
            ['P2', 'SSRF / traversal on features', 'Allow-lists; opaque file ids'],
            ['P2', 'Availability abuse', 'Rate limits; timeouts; edge protection'],
          ],
          'Adjust order for domain (payments vs public content)',
        ),
        callout(
          'tip',
          'Say “I’d verify whether cookies or bearer tokens are used — CSRF vs XSS emphasis changes.” That single clarifying question signals maturity.',
        ),
      ]),
      section('example', 'Worked example', [
        example('Prompt: “Secure our stock-trading API.”', [
          p(
            'Assets: orders, positions, PII, session tokens, admin tools. Trust: public clients → API gateway → services → DB.',
          ),
          ul([
            'Prevent: TLS; strong authn + step-up for trades; object-level authz on accounts; parameterized SQL; idempotent orders; rate limits; secrets in vault; HttpOnly session or short-lived tokens.',
            'Detect: authz failure spikes, unusual order velocity, geo anomalies, admin impersonation logs.',
            'Respond: kill sessions, rotate secrets, freeze suspicious accounts, incident runbooks.',
            'Residual: insider risk, dependency zero-days — mitigate with least privilege and patching SLAs.',
          ]),
          p(
            '60-second closer: “First week I’d nail authz tests, TLS, password/session hygiene, and rate limits on login/order. Parallel track: threat model SSRF-ish integrations and backup encryption.”',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Security vs time-to-market: ship P0 controls before fancy zero-trust mesh.',
          'False positives in fraud/rate systems hurt revenue — tune with product.',
          'Compliance (PCI, GDPR) constrains design — mention when relevant, don’t hide behind it.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Every prior Day 6 page is a module you can plug into this framework.',
          'Revision pages compress this into drills.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “Top risk is IDOR on account-scoped resources.”'),
        p('Interviewer: “How would you prove it’s fixed?”'),
        p(
          'Strong answer: “Automated tests with two users’ tokens across every object route, plus denial-by-default middleware and audit of 403s in staging.”',
        ),
        p('Interviewer: “What if we only have two engineers?”'),
        p(
          'Strong answer: “Prioritize authz, injection, and authn hardening first — highest exploitability × impact. Defer perfect CSP/mesh until P0 is green.”',
        ),
        p('Interviewer: “Always encrypt everything at the app layer?”'),
        p(
          'Strong answer: “No. TLS + disk encryption cover much. App-level encryption for select high-sensitivity fields when threat model needs crypto-shredding or reduced DBA exposure — cost is search and key ops.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Buzzword salad without prioritization.',
      'Ignoring detection and response.',
      'Claiming 100% security.',
      'Forgetting availability / rate limits in “secure the API.”',
      'Not asking clarifying questions about architecture.',
    ],
    interviewQuestions: [
      'How would you secure a REST API end-to-end?',
      'What are your top three web app risks and why?',
      'Walk me through a threat model for password reset.',
      'How do you balance security and usability for login?',
      'What would you do in the first week on a legacy insecure service?',
    ],
    intermediateInterviewQuestions: [
      'How do you prioritize a backlog of security tickets?',
      'What metrics indicate authz health?',
      'How would you explain residual risk to leadership?',
      'Secure design for a multi-tenant SaaS — key points?',
      'When do you bring in a WAF vs fix the code?',
    ],
    advancedInterviewQuestions: [
      'Threat-model an event-driven payments pipeline.',
      'Design an incident response for suspected token theft at scale.',
      'How do you embed security into SDLC without becoming a blocker?',
      'Compare risk for public mobile API vs internal admin API.',
      'How would you evaluate a third-party OAuth integration’s security?',
      'Defend trade-offs in a BFF vs pure SPA token architecture.',
    ],
    interviewReadyAnswers: [
      {
        question: 'How would you secure a typical REST backend?',
        answer:
          'I’d clarify assets and whether auth is cookie or bearer based. Priorities: object-level authorization to stop IDOR, parameterized queries to stop injection, solid authn with hashed passwords/MFA and session hygiene, TLS everywhere, and rate limits on auth and expensive routes. I’d add validation, least-privilege DB roles, secret management, generic errors, and audit logs for sensitive actions. I’d detect spikes in 401/403/429 and anomalous access, and I’d be explicit about residual risk like insider threats and zero-days.',
      },
      {
        question: 'Hashing vs encryption — quick interview answer?',
        answer:
          'Encryption is reversible with a key and protects confidentiality of data you must recover. Hashing is one-way and used for integrity and password verification. Passwords use slow salted hashes like Argon2id, not encryption and not fast SHA-256 alone.',
      },
    ],
    keyTakeaways: [
      'Structure: assets → top threats → prevent/detect/respond → residual risk.',
      'Prioritize BAC/IDOR, injection, and authn for most REST backends.',
      'Clarify architecture; prioritize ruthlessly; never claim perfect security.',
    ],
  },
)
