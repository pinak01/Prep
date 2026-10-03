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
  code,
  diagram,
} from '../../../helpers'

export const d6p12: StudyPage = createPage(
  'd6-p12',
  'Secure APIs',
  14,
  [
    'Apply authn/authz, input validation, least privilege, and audit logging',
    'Discuss HTTPS-only, error hygiene, and secret management basics',
    'Structure a coherent “secure this API” interview answer',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Secure API design is the practical synthesis of prior pages: transport security, identity, authorization, injection resistance, and abuse controls. Interviewers often ask you to walk through securing a REST (or GraphQL) backend end-to-end. Lead with threats, then layered controls — not a random tool laundry list.',
        ),
        h3('Why it exists'),
        p(
          'APIs are the front door to data and actions. Browsers, mobiles, partners, and scripts all call them. Mistakes concentrate here: missing authz, verbose errors, unbounded payloads, leaked secrets in clients.',
        ),
      ]),
      section('how', 'How it works — checklist that interviews love', [
        diagram(
          `flowchart TB
  TLS[TLS only] --> Authn[Authenticate]
  Authn --> Authz[Authorize object/action]
  Authz --> Val[Validate input]
  Val --> Biz[Business logic]
  Biz --> Data[Least-privilege data access]
  Data --> Log[Audit sensitive actions]
  Authn --> RL[Rate limit / abuse]`,
          'Request pipeline for a secure API',
        ),
        ol([
          'HTTPS everywhere; HSTS at the edge; no mixed sensitive cookies on HTTP.',
          'Authenticate every non-public route; validate tokens/sessions properly.',
          'Authorize per action and per object/tenant — deny by default.',
          'Validate inputs: types, ranges, sizes, allow-lists; reject unknown fields if appropriate.',
          'Parameterize DB access; avoid injecting into commands or LDAP, etc.',
          'Rate-limit; timeouts; payload size limits; pagination caps.',
          'Least privilege to DB and downstream services; separate read/write roles if useful.',
          'Secret management: vault/KMS; never commit secrets; rotate.',
          'Error hygiene: generic client messages; correlate with internal request ids.',
          'Audit log security-relevant events; monitor anomalies.',
          'CORS intentionally configured — not * with credentials.',
          'Dependency hygiene and patching; SAST/DAST as process, not silver bullets.',
        ]),
        h3('Error hygiene'),
        code(
          'json',
          `{
  "error": "invalid_request",
  "message": "Unable to process order",
  "requestId": "01JABC..."
}`,
          'External errors stay generic; stack traces stay internal',
        ),
        h3('Versioning & deprecation'),
        p(
          'Security fixes sometimes require breaking changes (stricter validation). Version APIs, communicate deprecations, and never leave forever-vulnerable legacy routes unauthenticated “for compatibility” without a plan.',
        ),
        table(
          ['Area', 'Do', "Don't"],
          [
            ['Authz', 'Check every resource id', 'Trust client role/userId fields'],
            ['Secrets', 'KMS/vault + rotation', 'Hardcode in repo or mobile app'],
            ['PII', 'Minimize fields returned', 'Dump full ORM entities'],
            ['CORS', 'Explicit origins', 'Access-Control-Allow-Origin: * with cookies'],
            ['Files', 'Type/size scan; opaque ids', 'Serve user path strings'],
          ],
        ),
      ]),
      section('example', 'Worked example', [
        example('POST /v1/transfers', [
          ul([
            'mTLS or public TLS + user session/JWT with audience=payments-api.',
            'Authz: source account owned by subject; destination validated; limits per tier.',
            'Idempotency-Key header to prevent double spend on retries.',
            'Body schema validation; amount > 0; currency allow-list.',
            'Rate limit per user; step-up MFA above threshold.',
            'DB txn with parameterized SQL; ledger integrity constraints.',
            'Audit: who, from, to, amount, ip, device, result — no full PAN in logs.',
            'Response: transfer id + status; no internal account row dumps.',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Strict schema validation breaks tolerant clients — version carefully.',
          'Verbose debug modes in prod leak data — feature-flag with authz.',
          'Gateway auth ≠ service authz — zero-trust still checks inside.',
          'GraphQL: query depth/cost limits matter as much as REST pagination.',
        ]),
        callout(
          'tip',
          'Interview structure: Assets → Threats → Controls (prevent/detect/respond) → Residual risk. Map a few controls explicitly to CIA.',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Pulls together TLS, authn/authz, injection, XSS/CSRF (for cookie APIs), SSRF/IDOR, rate limits.',
          'Next page specializes DB-side practices.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I’d secure the API with TLS, authn, object-level authz, validation, and rate limits.”'),
        p('Interviewer: “How do you handle secrets?”'),
        p(
          'Strong answer: “Inject from a secret manager at runtime, short-lived credentials where possible, rotate on leak, never ship secrets to the client, and scope keys per service.”',
        ),
        p('Interviewer: “Detection?”'),
        p(
          'Strong answer: “Audit authz failures, spike in 401/403/429, anomalous transfer patterns, and alert on admin actions — with privacy-aware logging.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Listing tools without saying what risk each mitigates.',
      'Stopping at authentication.',
      'Returning stack traces or SQL errors to clients.',
      'Forgetting idempotency on financial/state-changing APIs.',
      'Wide-open CORS with credentialed cookies.',
    ],
    interviewQuestions: [
      'How would you secure a REST API?',
      'What belongs in an API error response?',
      'How should API secrets be managed?',
      'Why is object-level authorization critical in APIs?',
      'What is the role of rate limiting in API security?',
    ],
    intermediateInterviewQuestions: [
      'How do you securely design file upload/download APIs?',
      'What CORS settings are appropriate for a cookie-authenticated SPA?',
      'How do you prevent mass assignment / over-posting?',
      'How should admin APIs differ from user APIs?',
      'What logs are necessary vs dangerous?',
    ],
    advancedInterviewQuestions: [
      'Secure a public partner API with per-client credentials and rotation.',
      'Design defense in depth for a GraphQL gateway.',
      'How do you approach API security testing in CI/CD?',
      'Zero-trust service-to-service auth for internal APIs.',
      'How do you handle security of webhooks you send and receive?',
    ],
    interviewReadyAnswers: [
      {
        question: 'How would you secure a typical REST backend?',
        answer:
          'I’d start from CIA and the data exposed. Transport: TLS only. Identity: strong authn with short-lived tokens or sessions. Authorization: deny-by-default object and tenant checks on every route. Input: schema validation, size limits, parameterized data access. Abuse: rate limits and timeouts. Operations: secrets in a vault, generic errors with request ids, audit logs for sensitive actions, and monitoring on auth anomalies. I’d call out IDOR and injection as top risks and how tests catch regressions.',
      },
    ],
    keyTakeaways: [
      'Secure APIs = TLS + authn + object authz + validation + limits + secret hygiene + audit.',
      'Deny by default; never trust client-supplied identity/role.',
      'Structure answers as threats → controls → residual risk.',
    ],
  },
)
