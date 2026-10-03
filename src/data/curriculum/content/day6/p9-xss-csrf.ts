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

export const d6p9: StudyPage = createPage(
  'd6-p9',
  'XSS & CSRF',
  16,
  [
    'Distinguish reflected, stored, and DOM XSS; list mitigations',
    'Explain CSRF and defenses (SameSite, CSRF tokens)',
    'Contrast XSS vs CSRF threat models clearly',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery) are browser-centric flaws. XSS injects attacker script into a victim’s browser context for your origin. CSRF tricks a victim’s browser into sending authenticated requests the victim did not intend. Defensive only: concepts, risks, mitigations — not exploit kits.',
        ),
        table(
          ['', 'XSS', 'CSRF'],
          [
            ['Core idea', 'Attacker script runs in your origin', 'Attacker site triggers victim’s cookies on your site'],
            ['Steals', 'Tokens, DOM data, user actions', 'Causes state-changing actions'],
            ['Needs victim auth?', 'Often to amplify impact', 'Yes — relies on ambient auth (cookies)'],
            ['Primary defenses', 'Encode/CSP/HttpOnly', 'SameSite + CSRF tokens + prefer non-cookie patterns'],
          ],
        ),
      ]),
      section('xss', 'XSS', [
        h3('What'),
        p(
          'The application includes untrusted data in a web page or JS execution context without proper contextual escaping, so the browser treats attacker-controlled content as script or HTML for your origin.',
        ),
        h3('Types (conceptual)'),
        ul([
          'Reflected — malicious input returned immediately in a response (e.g. error/search page).',
          'Stored — malicious input saved (comment, profile) and served to others later.',
          'DOM-based — client-side JS unsafely writes attacker data into the DOM (innerHTML, etc.) without round-tripping a classic server reflection.',
        ]),
        h3('How it happens (conceptually)'),
        p(
          'Different contexts need different escaping: HTML body, attributes, JavaScript strings, URLs, CSS. Using the wrong encoder — or none — lets markup/script break out of the intended text node. Frameworks like React escape by default for text content, but dangerouslySetInnerHTML, href=javascript:, and unsafe URL handling reintroduce risk.',
        ),
        h3('Why dangerous'),
        ul([
          'Session theft if tokens are JS-readable.',
          'Keylogging / UI redress inside the real origin.',
          'Unauthorized actions as the user; wormable stored XSS in social features.',
          'Bypasses same-origin policy from the attacker’s perspective — their code becomes your origin’s code.',
        ]),
        h3('How to prevent'),
        ul([
          'Contextual output encoding / use framework auto-escaping.',
          'Avoid innerHTML / unsanitized markdown; use vetted sanitizers if HTML is required.',
          'Content-Security-Policy (CSP) to reduce inline script impact — defense in depth.',
          'HttpOnly cookies so XSS cannot read session cookies directly.',
          'Validate/allow-list URLs; never reflect unsanitized HTML.',
        ]),
        code(
          'javascript',
          `// Prefer textContent / framework bindings
el.textContent = userProvidedName; // safe as text

// Dangerous if userProvidedHtml is untrusted
// el.innerHTML = userProvidedHtml;`,
          'Default to safe DOM APIs; treat HTML sinks as hazardous',
        ),
        h3('Interview Q'),
        p(
          'Q: “Stored vs reflected XSS?” A: “Reflected comes back in the immediate response to crafted input; stored is persisted and hits every viewer. Both execute in the site’s origin. Fix with contextual encoding, CSP, and careful HTML sanitization only when rich text is required.”',
        ),
      ]),
      section('csrf', 'CSRF', [
        h3('What'),
        p(
          'CSRF occurs when a victim is authenticated to site A with cookies, and visits attacker site B, which causes the browser to send a state-changing request to A including A’s cookies. Site A cannot tell the request was intentional.',
        ),
        h3('How it happens (conceptually)'),
        p(
          'Browsers automatically attach cookies for A on requests to A (subject to SameSite rules). If A accepts a POST that changes email/password/transfer based only on session cookies, a cross-origin form or similar request from B can trigger that action while the user is logged in.',
        ),
        diagram(
          `sequenceDiagram
  participant V as Victim browser
  participant A as Bank A
  participant B as Evil site B
  V->>A: Login - session cookie set
  V->>B: Visits attacker page
  B->>V: Triggers request to A
  V->>A: Request + A's cookies
  Note over A: Without CSRF defense, A may perform action`,
          'CSRF relies on ambient cookie credentials',
        ),
        h3('Why dangerous'),
        ul([
          'Unauthorized transfers, email changes, privilege changes.',
          'User appears to have done it — integrity/accountability confusion.',
          'Works without reading the response (unlike XSS stealing data).',
        ]),
        h3('How to prevent'),
        ul([
          'Anti-CSRF tokens: unpredictable secret in form/header; server verifies match to session.',
          'SameSite=Lax/Strict cookies to block most cross-site cookie sending.',
          'Prefer re-auth / step-up for sensitive actions.',
          'Avoid using GET for state changes.',
          'For token-in-Authorization-header APIs (not cookies), classic CSRF is less applicable — still watch cookie-based refresh.',
          'Check Origin/Referer as additional signals (not sole defense).',
        ]),
        h3('Interview Q'),
        p(
          'Q: “How do SameSite cookies relate to CSRF?” A: “SameSite limits when cookies are sent on cross-site requests, removing the ambient credential CSRF needs. I still use CSRF tokens for defense in depth, especially if SameSite=None is required for cross-site setups.”',
        ),
      ]),
      section('example', 'Worked example', [
        example('Comment box + “change email” form', [
          p(
            'Comment box without encoding → stored XSS → attacker script runs for moderators → can act as them. Fix encoding + CSP + HttpOnly.',
          ),
          p(
            'Change-email POST cookie-authenticated without CSRF token and SameSite=None → CSRF risk. Fix: SameSite + synchronizer token + confirm via email link.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Strict CSP can break inline analytics — use nonces/hashes.',
          'SameSite=Strict may break OAuth return navigations — Lax often chosen.',
          'XSS can often bypass CSRF tokens by reading them — fix XSS; don’t treat CSRF tokens as XSS defense.',
          'JSON APIs with custom headers are harder to CSRF from simple forms — still verify design.',
        ]),
        callout(
          'tip',
          'Memory hook: XSS steals the browser’s soul (runs code). CSRF forges the browser’s will (sends unwanted requests).',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Cookie flags from sessions page are first-line CSRF/XSS controls.',
          'Injection theme continues: XSS is injection into HTML/JS context.',
          'OAuth state parameter is a CSRF defense for the login redirect itself.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “We encode output and set CSP; cookies are HttpOnly SameSite=Lax with CSRF tokens.”'),
        p('Interviewer: “Does HttpOnly stop XSS impact?”'),
        p(
          'Strong answer: “It stops trivial cookie theft, but XSS can still perform actions as the user from the page. Encoding and CSP remain essential.”',
        ),
        p('Interviewer: “SPA with Bearer token in memory — CSRF?”'),
        p(
          'Strong answer: “Classic cookie CSRF shrinks because the browser won’t auto-attach the Bearer header. XSS becomes the bigger threat to that token. Refresh cookies still need CSRF care.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Confusing XSS and CSRF.',
      'Assuming React makes XSS impossible in all cases.',
      'Using CSRF tokens as the only defense while cookies are SameSite=None without Secure.',
      'Escaping for the wrong context (HTML escape inside a JS string).',
    ],
    interviewQuestions: [
      'What is XSS? Name three types.',
      'How do you prevent XSS?',
      'What is CSRF?',
      'How do CSRF tokens work?',
      'How does SameSite mitigate CSRF?',
    ],
    intermediateInterviewQuestions: [
      'Why doesn’t HttpOnly fully solve XSS?',
      'When is DOM XSS still possible in modern frameworks?',
      'CSRF vs CORS — are they the same?',
      'Why are state-changing GETs problematic?',
      'How does CSP help with XSS?',
    ],
    advancedInterviewQuestions: [
      'Design CSRF protection for a microservice BFF with multiple frontends.',
      'How do you safely render user HTML (rich text) in a fintech app?',
      'Threat-model OAuth login CSRF and how state/nonce help.',
      'How can XSS undermine CSRF defenses?',
      'Compare cookie session vs localStorage token regarding XSS/CSRF.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain XSS vs CSRF and key defenses.',
        answer:
          'XSS is injecting script into your site’s origin so it runs in users’ browsers — prevent with contextual encoding, safe frameworks, CSP, and HttpOnly cookies. CSRF tricks a logged-in user’s browser into sending unwanted cookie-authenticated requests — prevent with SameSite cookies, anti-CSRF tokens, no state-changing GETs, and step-up auth for sensitive actions. XSS executes attacker code; CSRF forges requests without needing to read responses.',
      },
    ],
    keyTakeaways: [
      'XSS: encode/CSP/HttpOnly; types = reflected, stored, DOM.',
      'CSRF: SameSite + CSRF tokens; ambient cookies are the fuel.',
      'XSS can defeat CSRF tokens — fix both layers.',
    ],
  },
)
