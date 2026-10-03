import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  h3,
  ul,
  table,
  callout,
  example,
  numerical,
  diagram,
} from '../../../helpers'

export const d6p11: StudyPage = createPage(
  'd6-p11',
  'DDoS, Brute Force & Rate Limiting',
  12,
  [
    'Describe availability attacks at a high level',
    'Apply rate limiting and lockout/backoff strategies defensively',
    'Balance security controls against self-DoS of legitimate users',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Availability attacks try to make a service unusable. DDoS (Distributed Denial of Service) floods resources from many sources. Brute force / credential stuffing hammer authentication endpoints. Rate limiting and related controls protect capacity and slow guessing — they are core Availability (and sometimes Confidentiality) defenses.',
        ),
        h3('Why it exists'),
        p(
          'Compute, bandwidth, DB connections, and third-party APIs are finite. Without limits, one noisy client — malicious or buggy — can starve everyone. Auth endpoints are especially sensitive because each attempt may be expensive (password KDF) and guessing threatens accounts.',
        ),
      ]),
      section('how', 'How it works', [
        h3('DDoS (high level, defensive)'),
        ul([
          'Volumetric — saturate bandwidth.',
          'Protocol / resource — exhaust connections, TLS handshakes, or app threads.',
          'Application-layer — expensive endpoints (search, export, login) called at high rate.',
        ]),
        p(
          'Mitigations are mostly architectural/ops: CDN/anycast, cloud DDoS protection, autoscaling with care, caches, graceful degradation, and rejecting junk early. Application teams still design cheap-to-reject paths and avoid unbounded work per request.',
        ),
        h3('Brute force & credential stuffing'),
        ul([
          'Brute force — trying many passwords against one account.',
          'Credential stuffing — trying breached username/password pairs across sites.',
          'Password spraying — few common passwords across many accounts to avoid per-account lockouts.',
        ]),
        h3('Rate limiting strategies'),
        table(
          ['Strategy', 'Idea', 'Watch-out'],
          [
            ['Fixed window', 'N requests per time bucket', 'Boundary bursts'],
            ['Sliding window / token bucket', 'Smoother allowance', 'Slightly more complex'],
            ['Per IP', 'Simple edge limit', 'NAT shares IPs; attackers rotate IPs'],
            ['Per user / API key', 'Protects authenticated abuse', 'Needs identity first'],
            ['Per account on login', 'Slows password guessing', 'Lockout → self-DoS'],
          ],
        ),
        diagram(
          `flowchart LR
  Req[Request] --> RL{Rate limit ok?}
  RL -->|no| R429[429 + Retry-After]
  RL -->|yes| App[Handler]
  App --> Exp{Expensive auth?}
  Exp -->|fail| Backoff[Backoff / CAPTCHA / MFA step-up]`,
          'Reject early; escalate friction on auth failures',
        ),
        h3('Defensive patterns for login'),
        ul([
          'Progressive delays / soft lockouts rather than permanent lock (avoids lockout DoS).',
          'CAPTCHA or proof-of-work after thresholds.',
          'MFA and breach-password checks (haveibeenpwned-style) for stuffing resistance.',
          'Generic error messages (“invalid credentials”) to reduce user enumeration — trade-off with UX.',
          'Monitor anomalous success/failure geolocation patterns.',
        ]),
        callout(
          'warning',
          'Hard account lockout after N failures can be weaponized to lock out victims. Prefer rate limits, exponential backoff, MFA challenges, and risk-based friction.',
          'Self-DoS trap',
        ),
      ]),
      section('example', 'Worked example', [
        example('Login API capacity', [
          p(
            'Argon2 tuned to ~100ms CPU per attempt. Without limits, 100 concurrent guesses ≈ 10 CPU-seconds per second of wall time per core pattern — attackers convert your security hashing into a DoS. Edge rate limit + per-account throttle + cheap checks (account exists cache, connection limits) before the KDF.',
          ),
        ]),
        numerical({
          title: 'Rate limit mental math',
          problem:
            'An API allows 100 requests/minute/user. A batch job needs 2500 requests. How many minutes minimum under a perfect steady rate?',
          given: 'Limit L = 100 req/min; Work W = 2500 req',
          formula: 't_min = ceil(W / L)',
          steps: '2500 / 100 = 25 minutes if evenly spaced.\nBurstier clients hit 429 sooner and must back off.',
          answer: '25 minutes minimum at full steady use of the quota',
          shortcut: 'minutes ≈ total_requests / rpm',
          mistake: 'Ignoring that other users/apps share lower upstream limits (DB, third parties)',
        }),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'CDN/WAF help volumetric/app floods but misconfigured rules block legit traffic.',
          'IP limits punish mobile carriers / offices behind NAT.',
          'Returning 429 with Retry-After is polite; silent drops complicate clients.',
          'Caching reduces app-layer load but must respect authz (never cache personalized private responses publicly).',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Availability pillar of CIA.',
          'Slow password hashes increase brute-force cost but also amplify login DoS — pair with rate limits.',
          'Secure APIs should document and enforce quotas.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “I’d put token-bucket limits per IP and per user, with stricter login limits.”'),
        p('Interviewer: “How do you avoid locking out real users?”'),
        p(
          'Strong answer: “Progressive friction instead of hard lockouts, CAPTCHA/MFA step-up, notify the user, and allow unlock via verified email — while still slowing automated guessing.”',
        ),
        p('Interviewer: “Trade-off?”'),
        p(
          'Strong answer: “Attackers can still distribute load across many IPs; you need layered signals and possibly bot management at the edge, not only a single counter.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Only rate-limiting by IP.',
      'Permanent lockouts that enable denial against victims.',
      'Running expensive password hashes before cheap rate-limit checks.',
      'Assuming a WAF alone makes the app resilient.',
    ],
    interviewQuestions: [
      'What is a DDoS attack at a high level?',
      'What is rate limiting?',
      'Brute force vs credential stuffing?',
      'Why can account lockout be harmful?',
      'What HTTP status is used for rate limiting?',
    ],
    intermediateInterviewQuestions: [
      'Compare token bucket vs fixed window.',
      'Where should rate limits be enforced (edge, gateway, service)?',
      'How do you rate-limit expensive export endpoints?',
      'How does caching help availability defenses?',
      'How would you detect password spraying?',
    ],
    advancedInterviewQuestions: [
      'Design a multi-tier rate-limiting system for a global API.',
      'How do you protect against application-layer DDoS on search?',
      'Trade-offs of CAPTCHA privacy vs bot defense.',
      'How should retries/backoff be designed so clients don’t amplify outages?',
      'Combine risk-based auth with rate limits for step-up MFA.',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you defend login against brute force without harming users?',
        answer:
          'I rate-limit by IP and by account, run cheap checks before expensive password hashing, and use progressive delays or CAPTCHA/MFA step-up instead of hard permanent lockouts that attackers can use to lock victims out. I monitor for spraying and stuffing patterns, keep errors generic, and encourage MFA. Edge protections help with volumetric floods, but app-layer quotas on expensive endpoints still matter.',
      },
    ],
    keyTakeaways: [
      'Protect availability with layered rate limits and edge defenses.',
      'Prefer progressive friction over hard lockouts.',
      'Expensive endpoints (login, search, export) need stricter quotas.',
    ],
  },
)
