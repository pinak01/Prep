import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  ol,
  code,
  table,
  callout,
  diagram,
  example,
} from '../../../helpers'

export const d6p2: StudyPage = createPage(
  'd6-p2',
  'Authentication vs Authorization',
  14,
  [
    'Clearly distinguish authentication from authorization with examples',
    'Explain common authn factors and session concepts',
    'Reason about identity, roles, and object-level permissions',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Authentication (authn) answers: Who are you? Authorization (authz) answers: What are you allowed to do? Mixing them up is one of the most common interview mistakes — and one of the most common production bugs (authenticated but not authorized → IDOR).',
        ),
        h3('Why it exists'),
        p(
          'Systems must both prove identity and enforce policy. Proving you are Alice does not mean Alice may delete Bob’s orders. Separating these concerns lets you change credentials (password, SSO, MFA) without rewriting every permission check, and change roles/policies without changing how login works.',
        ),
        table(
          ['Concept', 'Question', 'Example failure'],
          [
            ['Authentication', 'Who are you?', 'Stolen password → attacker logs in as victim'],
            ['Authorization', 'What can you do?', 'User A reads user B’s /orders/123 (IDOR)'],
            ['Accounting / Audit', 'What did you do?', 'No trail of who exported customer data'],
          ],
          'Authn vs authz vs accounting (AAA)',
        ),
      ]),
      section('how', 'How it works', [
        h3('Authentication factors'),
        ul([
          'Something you know — password, PIN, recovery answers (weak alone).',
          'Something you have — hardware key, phone authenticator app, SMS OTP (SMS is weaker).',
          'Something you are — biometrics (usually unlocks a local secret; server still sees a token).',
        ]),
        p(
          'MFA combines factors so stealing one secret is not enough. Interview nuance: “security questions” are still knowledge factors, not a second independent factor.',
        ),
        h3('Typical authn flow (session-based)'),
        ol([
          'Client presents credentials to login endpoint over TLS.',
          'Server verifies (e.g. password hash compare with constant-time equality).',
          'Server creates a session record (or signed token) bound to user id + metadata.',
          'Client sends session identifier on later requests (cookie or Authorization header).',
          'Server resolves identity from that artifact before any business logic.',
        ]),
        diagram(
          `sequenceDiagram
  participant U as User
  participant A as App
  participant S as Auth service
  U->>A: Credentials
  A->>S: Verify identity
  S-->>A: Subject / user id
  A-->>U: Session or token
  U->>A: Request + proof of identity
  A->>A: Authenticate then Authorize
  A-->>U: Allow or 401/403`,
          'Authn first, then authz on every sensitive request',
        ),
        h3('Authorization models'),
        ul([
          'RBAC — roles (admin, trader, viewer) map to permissions. Simple, common in interviews.',
          'ABAC — attributes (department, region, time of day) drive decisions; more flexible, harder to reason about.',
          'ACL / object ACLs — per-resource lists of who can access.',
          'ReBAC — relationship-based (Google Zanzibar style): “user is owner of doc”).',
        ]),
        callout(
          'warning',
          'HTTP status hygiene: 401 Unauthorized historically means “not authenticated” (missing/invalid credentials). 403 Forbidden means “authenticated but not allowed.” Interviewers notice if you swap them casually — mention the common confusion and be consistent.',
          '401 vs 403',
        ),
        code(
          'java',
          `// Pseudocode — never trust client-supplied "role"
User user = authenticate(request);          // who?
if (user == null) return 401;

Order order = orders.find(orderId);
if (!authz.canView(user, order)) return 403; // what?

return 200 + order;`,
          'Authn then object-level authz — never skip the ownership check',
        ),
      ]),
      section('example', 'Worked example', [
        example('Banking app: Alice views an account', [
          p(
            'Authn: Alice logs in with password + TOTP; server issues a session cookie bound to alice@bank.',
          ),
          p(
            'Authz: GET /accounts/999 must check that account 999 belongs to Alice (or Alice has a delegated advisor role). Checking only that Alice is logged in is insufficient — that is classic broken access control.',
          ),
          ul([
            'Horizontal privilege escalation: Alice → Bob’s account (same role, different object).',
            'Vertical privilege escalation: Alice → admin endpoint (higher privilege).',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Coarse RBAC is easy but over-grants; fine-grained checks are safer but easy to miss on new endpoints.',
          'Centralized policy engines (OPA, etc.) improve consistency; local checks are simpler but drift.',
          'Service-to-service authn (mTLS, SPIFFE) differs from end-user authn — don’t conflate them.',
          'Impersonation / “login as user” for support needs strict audit and time-bound tokens.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Sessions, cookies, JWT (later) are mechanisms that carry authenticated identity.',
          'OAuth separates resource owner, client, and authorization server — still authn vs authz underneath.',
          'IDOR is almost always an authorization failure after successful authentication.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “Authentication proves identity; authorization enforces permissions.”'),
        p('Interviewer: “Why do teams still ship IDOR?”'),
        p(
          'Strong answer: “Because they check login once and forget object-level checks on every ID in the URL or body. Authn middleware isn’t authz.”',
        ),
        p('Interviewer: “How do you test authz?”'),
        p(
          'Strong answer: “Automated tests: user A token against user B resources must get 403; role matrix tests for vertical privilege; fuzz IDs in CI for critical routes.”',
        ),
        p('Interviewer: “Trade-off of RBAC vs ABAC?”'),
        p(
          'Strong answer: “RBAC is simpler to audit; ABAC handles contextual rules but policies become hard to reason about. Many systems start RBAC and add attributes carefully.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Using “authorize” when you mean “log in.”',
      'Checking only that a JWT is valid, not that the subject may access the resource.',
      'Trusting role or userId fields from the client body.',
      'Returning 404 vs 403 inconsistently in ways that leak existence of objects — know the product choice.',
    ],
    interviewQuestions: [
      'Difference between authentication and authorization?',
      'What is MFA? Give examples of factors.',
      'What do 401 and 403 mean?',
      'What is RBAC?',
      'What is the difference between horizontal and vertical privilege escalation?',
    ],
    intermediateInterviewQuestions: [
      'How would you authorize access to /users/{id}/documents/{docId}?',
      'When is ABAC preferable to RBAC?',
      'How should service-to-service calls authenticate?',
      'What should happen if a session is valid but the user was deactivated?',
      'How do you design “support impersonation” safely?',
    ],
    advancedInterviewQuestions: [
      'Compare ACL, RBAC, and ReBAC for a document-sharing product.',
      'How do you prevent TOCTOU bugs between authz check and use of a resource?',
      'How should authorization work in a CQRS / event-sourced system?',
      'Design a permission model for multi-tenant SaaS with org admins and project roles.',
      'How do zero-trust principles change authn/authz between microservices?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain authentication vs authorization.',
        answer:
          'Authentication verifies who you are — credentials, SSO, MFA — and establishes a subject identity. Authorization decides what that subject can do on a specific action and resource. In practice I authenticate first, then enforce authz on every sensitive operation with object-level checks, not just role checks. A valid login with a missing ownership check is how IDOR happens. Status codes: typically 401 if identity isn’t established, 403 if identity is known but denied.',
      },
    ],
    keyTakeaways: [
      'Authn = who; authz = what — never conflate.',
      'Object-level authorization is mandatory for every resource ID.',
      'MFA strengthens authn; RBAC/ABAC structure authz.',
    ],
  },
)
