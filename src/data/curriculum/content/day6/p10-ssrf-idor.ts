import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  code,
  table,
  callout,
  example,
  diagram,
} from '../../../helpers'

export const d6p10: StudyPage = createPage(
  'd6-p10',
  'SSRF, Path Traversal & Broken Access Control / IDOR',
  16,
  [
    'Explain SSRF and path traversal risks with defensive controls',
    'Detect IDOR / broken access control and enforce object-level authz',
    'Prioritize BAC as a top API risk in interview answers',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'This page covers three high-frequency interview topics that are defensive cousins: SSRF (server fetches attacker-influenced URLs), path traversal (file paths escape intended directories), and broken access control / IDOR (users access other users’ objects). All are about trusting the wrong input for location or identity of a resource.',
        ),
        callout(
          'info',
          'OWASP consistently ranks Broken Access Control among the most common and impactful API/web risks. In interviews, IDOR examples are a fast way to show you understand object-level authorization.',
        ),
      ]),
      section('ssrf', 'SSRF — Server-Side Request Forgery', [
        h3('What'),
        p(
          'The server makes an HTTP (or other protocol) request based on user-supplied URL/host input. Attackers aim that request at internal services, metadata endpoints, or otherwise unreachable targets — using your server as a proxy.',
        ),
        h3('How it happens (conceptually)'),
        p(
          'Features like “preview this URL,” “import from webhook,” “fetch avatar from link,” or “load remote config” take a URL string and pass it to an HTTP client on the server. The server’s network position (VPC, cloud metadata hop) differs from the attacker’s, so internal addresses that are firewalled from the internet become reachable through the app.',
        ),
        h3('Why dangerous'),
        ul([
          'Access to cloud instance metadata / internal admin panels.',
          'Port scanning and pivoting inside private networks.',
          'Bypassing IP allow-lists that trust the app server.',
          'Potential credential or secret exposure from internal endpoints.',
        ]),
        h3('How to prevent'),
        ul([
          'Avoid user-controlled URLs when possible; use allow-listed hosts.',
          'Resolve and validate destinations: block link-local, private, metadata IPs; re-check after DNS (DNS rebinding awareness).',
          'Use network egress controls / dedicated proxy with deny-by-default.',
          'Disable unnecessary protocols/redirects; set tight timeouts.',
          'Do not return raw internal error bodies to clients.',
        ]),
        h3('Interview Q'),
        p(
          'Q: “What is SSRF and how do you mitigate it?” A: “SSRF is when user input decides where the server sends a request, exposing internal network capability. Mitigate with allow-lists, blocked private ranges, egress controls, limited redirects, and preferably not accepting arbitrary URLs at all.”',
        ),
      ]),
      section('traversal', 'Path traversal', [
        h3('What'),
        p(
          'Untrusted input influences a filesystem path so the application reads/writes outside the intended directory (e.g. using .. segments or absolute paths).'),
        h3('How it happens (conceptually)'),
        p(
          'Download/export features join a user-supplied filename onto a base directory. Without normalization and containment checks, path components can walk upward or switch roots, accessing config files or secrets on disk.',
        ),
        h3('Why dangerous'),
        ul([
          'Confidentiality: source, keys, /etc-style configs depending on OS and permissions.',
          'Integrity: overwriting files if write paths are vulnerable.',
        ]),
        h3('How to prevent'),
        ul([
          'Never concatenate raw user strings to paths; use generated IDs and server-side maps.',
          'If names are needed: allow-list characters; resolve to canonical path; verify it stays under the base directory.',
          'Run with least filesystem privilege; separate volumes for user content.',
          'Prefer object storage (S3) with app-controlled keys over local arbitrary paths.',
        ]),
        code(
          'java',
          `Path base = Path.of("/var/app/uploads").toRealPath();
Path target = base.resolve(userFile).normalize().toRealPath();
if (!target.startsWith(base)) throw new SecurityException("path escape");
// still better: ignore user paths; look up by opaque id`,
          'Canonicalize and enforce containment — or avoid user path input',
        ),
        h3('Interview Q'),
        p(
          'Q: “How do you stop path traversal?” A: “Don’t take filesystem paths from users. Use opaque IDs. If you must, allow-list, canonicalize, and ensure the resolved path remains under an approved root, with least privilege on the process.”',
        ),
      ]),
      section('idor', 'Broken access control & IDOR', [
        h3('What'),
        p(
          'Broken Access Control means authorization rules are missing or wrong. IDOR (Insecure Direct Object Reference) is a common form: the API accepts an object id (orderId, accountId) and returns/updates it without verifying the caller may access that object.',
        ),
        h3('How it happens (conceptually)'),
        p(
          'Developer checks only that the user is logged in (authn) or has a coarse role, then loads entity by id from the URL. Changing the id to another user’s resource succeeds. Horizontal escalation is same privilege, different object; vertical is accessing admin functions.',
        ),
        diagram(
          `flowchart TD
  R[Request with object id] --> Authn{Authenticated?}
  Authn -->|no| U[401]
  Authn -->|yes| Authz{Can subject access this object?}
  Authz -->|no| F[403]
  Authz -->|yes| OK[Perform action]
  Authn -->|yes but skip authz| BAD[IDOR / BAC vulnerability]`,
          'IDOR is skipped object-level authorization',
        ),
        h3('Why dangerous'),
        ul([
          'Mass leakage of PII, orders, documents, messages.',
          'Unauthorized mutations — integrity of business data.',
          'Often trivial to discover by incrementing IDs if checks are absent.',
        ]),
        h3('How to prevent'),
        ul([
          'Enforce object-level authz on every handler: ownership, tenant id, relationship checks.',
          'Prefer opaque, non-sequential ids (UUIDs) as friction — not a substitute for authz.',
          'Centralize authorization (policies/middleware) to avoid missed endpoints.',
          'Automated tests: user A token must not access user B resources.',
          'Deny by default; log authz failures.',
        ]),
        h3('Interview Q'),
        p(
          'Q: “What is IDOR?” A: “Accessing or modifying an object by its identifier without an authorization check that the caller is allowed to use that object. Fix with consistent object-level authz, multi-tenant constraints, and tests — not just hiding sequential IDs.”',
        ),
      ]),
      section('example', 'Worked example', [
        example('Multi-tenant document API', [
          p(
            'GET /docs/{docId} must filter WHERE doc_id = ? AND tenant_id = ? AND (owner = ? OR shared_with = ?). Fetching by docId alone across tenants is IDOR. Export-to-URL feature must not accept arbitrary internal URLs (SSRF). Attachment download uses storage key from DB, not user path (traversal).',
          ),
        ]),
        table(
          ['Issue', 'Untrusted input used as', 'Primary control'],
          [
            ['SSRF', 'Network location', 'Allow-list + egress policy'],
            ['Path traversal', 'Filesystem location', 'Opaque IDs + containment'],
            ['IDOR/BAC', 'Object identity without authz', 'Object-level authorization'],
          ],
        ),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Returning 404 vs 403 on unauthorized object access — product/security trade-off (existence leakage).',
          'UUID ids reduce guessing but not cross-user access if shared/leaked.',
          'SSRF allow-lists are operationally heavy for user-defined webhooks — use egress proxies and owner verification (challenge URLs).',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Directly extends authn vs authz.',
          'Secure API page consolidates these checks as engineering standards.',
          'Rate limiting (next) slows mass IDOR enumeration but does not fix missing authz.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I’d enforce tenant and ownership checks on every object id.”'),
        p('Interviewer: “Always?”'),
        p(
          'Strong answer: “On every sensitive read/write. Public share links are an explicit alternative capability with their own token authz model — still not a bare enumerable id.”',
        ),
        p('Interviewer: “How do you catch misses?”'),
        p(
          'Strong answer: “Integration tests per role/tenant, authorization unit tests, code review checklist for new routes, and periodic access-control regression suites.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Thinking non-sequential IDs replace authorization.',
      'Only testing happy-path authn.',
      'Allowing redirects in URL fetchers without re-validation.',
      'Trusting client-supplied tenantId instead of deriving it from the session.',
    ],
    interviewQuestions: [
      'What is SSRF?',
      'How do you mitigate path traversal?',
      'What is IDOR?',
      'Horizontal vs vertical privilege escalation?',
      'Why are UUIDs not enough to stop IDOR?',
    ],
    intermediateInterviewQuestions: [
      'How do cloud metadata endpoints relate to SSRF risk?',
      'How should multi-tenant queries enforce isolation?',
      '404 vs 403 for unauthorized resources?',
      'How do you securely implement user-defined webhooks?',
      'What automated tests prevent BAC regressions?',
    ],
    advancedInterviewQuestions: [
      'Design an egress architecture that makes SSRF high-cost for attackers.',
      'How do you authorize nested resources (org → project → doc) efficiently?',
      'Compare centralized policy engines vs per-handler checks.',
      'How does GraphQL change IDOR risk patterns?',
      'Threat-model a PDF renderer that fetches remote assets.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain IDOR and how you prevent it.',
        answer:
          'IDOR is a broken access control issue where an API lets you reference an object by id without checking that your identity is allowed to access it. Login alone isn’t enough — every handler needs object-level or tenant-level authorization. I derive identity from the session/token, enforce ownership or ACL checks in queries, deny by default, and add tests that user A cannot read user B’s resources. Opaque IDs help a little but never replace authz.',
      },
      {
        question: 'What is SSRF defensively?',
        answer:
          'SSRF is when attackers influence a URL or host the server fetches, abusing the server’s network position to reach internal systems. I avoid arbitrary URLs, allow-list destinations, block private/metadata ranges, control egress, limit redirects, and keep error messages generic. Network controls plus application allow-lists are defense in depth.',
      },
    ],
    keyTakeaways: [
      'SSRF: don’t let users aim your server’s HTTP client; allow-list + egress.',
      'Path traversal: opaque IDs + canonical containment.',
      'IDOR/BAC: object-level authz on every resource access.',
    ],
  },
)
