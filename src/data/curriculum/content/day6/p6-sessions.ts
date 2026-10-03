import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  table,
  callout,
  diagram,
  example,
  code,
} from '../../../helpers'

export const d6p6: StudyPage = createPage(
  'd6-p6',
  'Sessions, Cookies & JWT',
  16,
  [
    'Compare server sessions vs JWT trade-offs',
    'Explain secure cookie flags (HttpOnly, Secure, SameSite)',
    'Describe JWT structure, validation, and common pitfalls',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'After authentication, the client must prove identity on later requests. Two dominant patterns: (1) opaque session IDs stored in server-side session stores, often in cookies; (2) self-contained tokens such as JWTs, often in Authorization headers or cookies. Both can be secure if designed carefully; both are dangerous if misconfigured.',
        ),
        h3('Why it exists'),
        p(
          'HTTP is stateless. Sessions/tokens stitch requests into an authenticated conversation without re-sending the password every time. Cookies automate sending browser state; tokens fit SPAs and APIs. Interviewers want trade-offs: revocation, size, scalability, XSS/CSRF exposure.',
        ),
      ]),
      section('how', 'How it works', [
        h3('Server-side sessions'),
        ul([
          'Login creates a random session id → store {sessionId → userId, expiry, meta} in Redis/DB.',
          'Browser holds session id in a cookie; server looks up session on each request.',
          'Logout / compromise → delete server record → immediate revocation.',
        ]),
        h3('Cookie security flags'),
        table(
          ['Flag', 'Purpose'],
          [
            ['HttpOnly', 'JavaScript cannot read cookie → reduces token theft via XSS'],
            ['Secure', 'Send only over HTTPS'],
            ['SameSite=Lax/Strict/None', 'Control cross-site sending → CSRF mitigation'],
            ['Path / Domain', 'Scope which requests include the cookie'],
            ['Max-Age / Expires', 'Lifetime; prefer short-lived sessions + sliding refresh carefully'],
          ],
          'Cookie attributes you should name in interviews',
        ),
        callout(
          'tip',
          'SameSite=None requires Secure. Lax is a common default for session cookies; Strict is tighter but can break legitimate cross-site navigations. CSRF tokens still matter for defense in depth on state-changing requests.',
        ),
        h3('JWT structure'),
        p(
          'JWT = base64url(header) + "." + base64url(payload) + "." + signature. Header has alg/typ; payload has claims (sub, exp, iss, aud, roles…). Signature is HMAC with server secret or asymmetric private key. Important: base64 is encoding — anyone can read the payload; do not put secrets in JWT claims unless encrypted (JWE), which most apps don’t.',
        ),
        diagram(
          `flowchart LR
  H[Header alg] --> T[JWT]
  P[Payload claims] --> T
  S[Signature] --> T
  T --> V{Verify sig + exp + aud}
  V -->|ok| A[Authenticate subject]
  V -->|fail| R[401]`,
          'JWT verification gates before trusting claims',
        ),
        h3('Sessions vs JWT'),
        table(
          ['Dimension', 'Server session', 'JWT (typical access token)'],
          [
            ['Revocation', 'Easy (delete store)', 'Hard until expiry unless blocklist/versioning'],
            ['Scalability', 'Needs shared store', 'Stateless verification at each service'],
            ['Size', 'Small opaque id', 'Larger; sent every request'],
            ['Data freshness', 'Server can update session', 'Stale claims until reissue'],
            ['XSS risk', 'Cookie HttpOnly helps', 'Bearer in JS-accessible storage is risky'],
          ],
        ),
        code(
          'javascript',
          `// Conceptual verification steps (library does crypto)
const payload = jwt.verify(token, publicKey, {
  algorithms: ['RS256'], // explicitly allow-list
  issuer: 'https://auth.example.com',
  audience: 'api.example.com',
});
// then authorize using payload.sub — still need object-level authz`,
          'Always allow-list algorithms; never accept alg=none',
        ),
      ]),
      section('example', 'Worked example', [
        example('SPA + API auth choice', [
          p(
            'Option A: Session cookie, SameSite=Lax, HttpOnly, Secure; API on same site; CSRF tokens for POST/PUT/DELETE. Pros: revocation, HttpOnly. Cons: CSRF considerations, sticky session store.',
          ),
          p(
            'Option B: Short-lived JWT access token (5–15 min) in memory; refresh token in HttpOnly Secure cookie with rotation. Pros: APIs/microservices validate locally. Cons: logout complexity; must prevent refresh-token theft and XSS that steals access tokens.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Storing JWT in localStorage is convenient and XSS-hostile — prefer HttpOnly cookies or in-memory + short TTL.',
          'Putting roles in JWT: fast authz hints but revoke/role-change lag — keep TTL short or use session version claims.',
          'Symmetric HS256 secret shared across many services increases blast radius; RS256/ES256 with JWKS is cleaner for microservices.',
          'Session fixation: regenerate session id after login.',
        ]),
        callout(
          'mistake',
          'Accepting whatever alg the token header declares (especially “none” or switching RS256→HS256 with public key as HMAC secret) is a classic JWT footgun. Libraries must enforce allowed algorithms.',
          'Algorithm confusion',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'OAuth/OIDC commonly issue JWTs as access or ID tokens — next page.',
          'XSS can steal non-HttpOnly tokens; CSRF targets cookie-authenticated requests.',
          'TLS protects tokens in transit; storage and XSS still matter at rest in the browser.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I’d use short-lived JWTs plus a revocable refresh token.”'),
        p('Interviewer: “Why not only long-lived JWTs?”'),
        p(
          'Strong answer: “Long-lived bearer tokens are hard to revoke and widen the theft window. Short access TTL limits damage; refresh rotation detects reuse.”',
        ),
        p('Interviewer: “Cookie or Authorization header?”'),
        p(
          'Strong answer: “Cookies with HttpOnly help against XSS theft but need CSRF defenses. Headers avoid automatic cookie sending but require JS storage carefulness. Choice depends on threat model and app architecture.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Treating JWT payload as confidential.',
      'No exp/iss/aud validation.',
      'Missing Secure/HttpOnly/SameSite on session cookies.',
      'Believing JWT means you can skip server-side authz.',
      'Unable to revoke sessions after password change.',
    ],
    interviewQuestions: [
      'Session vs JWT — trade-offs?',
      'What do HttpOnly, Secure, and SameSite do?',
      'What are the parts of a JWT?',
      'How do you invalidate a JWT on logout?',
      'Why regenerate session IDs after login?',
    ],
    intermediateInterviewQuestions: [
      'Where should you store tokens in a browser SPA?',
      'HS256 vs RS256 for microservice APIs?',
      'How does SameSite mitigate CSRF?',
      'What claims should you validate on every request?',
      'How do refresh token rotation and reuse detection work conceptually?',
    ],
    advancedInterviewQuestions: [
      'Design auth for a BFF (backend-for-frontend) that keeps tokens off the browser.',
      'How do you handle global logout across many devices?',
      'Compare opaque reference tokens vs JWTs at an API gateway.',
      'How would you embed step-up authentication (MFA) into session policy?',
      'Threat-model cookie-based auth on a subdomain architecture.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Compare server sessions and JWTs.',
        answer:
          'Server sessions store state server-side and give the client an opaque id, usually in an HttpOnly Secure SameSite cookie — revocation is easy, but you need a shared session store. JWTs are self-contained signed claims — services can validate without a lookup, which scales, but revocation before expiry is harder and tokens shouldn’t hold secrets. I prefer short-lived access tokens, careful storage, explicit alg allow-lists, and still enforce object-level authorization on every request.',
      },
    ],
    keyTakeaways: [
      'Cookies need HttpOnly, Secure, SameSite; sessions should be regenerable and revocable.',
      'JWTs are signed, not secret — validate alg/exp/iss/aud.',
      'Pick session vs JWT based on revocation and architecture needs.',
    ],
  },
)
