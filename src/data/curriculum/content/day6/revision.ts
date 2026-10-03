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
} from '../../../helpers'

export const d6rev: StudyPage = createPage(
  'd6-rev',
  '10-Minute Revision',
  10,
  [
    'Rapidly recall Day 6 defensive security essentials',
    'Map each topic to a one-line interview cue',
  ],
  {
    sections: [
      section('checklist', 'Dense checklist', [
        p('Use this as a pre-interview skim. Say each line out loud.'),
        h3('Foundations'),
        ul([
          'CIA: Confidentiality / Integrity / Availability — map every control.',
          'Threat mindset: asset → threat → vulnerability → control → residual risk.',
          'Authn = who; Authz = what; IDOR = missing object authz.',
          '401 ≈ not authenticated; 403 ≈ authenticated but forbidden (know the nuance).',
        ]),
        h3('Crypto'),
        ul([
          'Hashing ≠ encryption ≠ encoding.',
          'Passwords: Argon2id/bcrypt + unique salt (+ optional pepper); never plaintext.',
          'Symmetric AES-GCM for bulk; asymmetric for keys/signatures; hybrid in practice.',
          'TLS: confidentiality + integrity in transit + server auth via cert chain to trust anchor.',
        ]),
        h3('Identity'),
        ul([
          'Cookies: HttpOnly, Secure, SameSite; regenerate session on login; revoke server-side.',
          'JWT: signed not secret; validate alg/exp/iss/aud; short TTL; revocation hard.',
          'OAuth: delegated authz; code + PKCE; OIDC adds login/identity.',
        ]),
        h3('Vulnerabilities (defensive cues)'),
        table(
          ['Issue', 'One-line fix cue'],
          [
            ['SQLi', 'Prepared statements + least-privilege DB'],
            ['Command injection', 'No shell; allow-listed argv'],
            ['XSS', 'Contextual encode + CSP + HttpOnly'],
            ['CSRF', 'SameSite + CSRF tokens; no state-changing GET'],
            ['SSRF', 'Allow-list + egress controls'],
            ['Path traversal', 'Opaque IDs + path containment'],
            ['IDOR/BAC', 'Object-level authz + tests'],
            ['Brute force', 'Rate limit + progressive friction + MFA'],
          ],
        ),
        h3('Engineering'),
        ul([
          'Secure API pipeline: TLS → authn → authz → validate → business → audit; rate limit throughout.',
          'DB: private network, TLS, least privilege, parameterized SQL, encrypted backups.',
          'Interview closer: prevent / detect / respond + residual risk.',
        ]),
        callout(
          'tip',
          'If stuck: define the property (C/I/A), name the failure mode, give one preventive control and one detection idea.',
        ),
      ]),
      section('drill', '60-second drills', [
        ol([
          'Explain hashing vs encryption without using the word “basically.”',
          'Draw cert chain: leaf → intermediate → root trust anchor.',
          'Contrast session cookie vs JWT revocation.',
          'List three XSS types and one defense each.',
          'Prioritize top 3 risks for a payments REST API.',
        ]),
      ]),
    ],
    commonMistakes: [
      'Skimming acronyms without being able to explain mechanisms.',
      'Memorizing OWASP names without mitigations.',
    ],
    interviewQuestions: [
      'CIA triad in one breath?',
      'Hashing vs encryption?',
      'Authn vs authz?',
      'TLS trust chain?',
      'IDOR fix?',
    ],
    intermediateInterviewQuestions: [
      'OAuth vs OIDC?',
      'CSRF vs XSS?',
      'Why salt passwords?',
      'JWT alg allow-list — why?',
      'Least privilege DB — why?',
    ],
    advancedInterviewQuestions: [
      'Envelope encryption in one minute?',
      'PKCE purpose?',
      'SSRF egress design sketch?',
      'Refresh token rotation idea?',
      'First-week hardening plan for a legacy API?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Give a 30-second Day 6 summary.',
        answer:
          'Security answers map to CIA. Prove identity then enforce object-level authorization. Store passwords as slow salted hashes, use TLS with proper cert trust, and pick sessions or short-lived JWTs carefully. Prevent injection with parameterization and no shells; prevent XSS/CSRF with encoding, CSP, SameSite, and tokens; prevent IDOR/SSRF/traversal with authz and allow-lists. Rate-limit abuse, lock down DB privileges, and always mention detection plus residual risk.',
      },
    ],
    keyTakeaways: [
      'One-line cues beat shallow buzzwords.',
      'Always pair a risk with a concrete control.',
      'Practice the five 60-second drills aloud.',
    ],
  },
)

export const d6traps: StudyPage = createPage(
  'd6-traps',
  'Interview Traps',
  10,
  [
    'Spot common security misconceptions interviewers probe',
    'Replace shallow answers with precise defensive wording',
  ],
  {
    sections: [
      section('traps', 'High-frequency traps', [
        h3('Trap: “HTTPS means we’re secure”'),
        p(
          'Weak: padlock story ends there. Strong: TLS protects data in transit and authenticates the server identity; it does not fix IDOR, XSS, or plaintext password storage at rest.',
        ),
        h3('Trap: Hashing = encryption'),
        p(
          'Weak: “We encrypt passwords with SHA.” Strong: passwords are hashed with a slow KDF and salt; encryption is reversible and the wrong default for password storage.',
        ),
        h3('Trap: Authn middleware = authorization'),
        p(
          'Weak: “Users must log in.” Strong: every object id is checked for ownership/tenant/role; tests prove user A cannot access user B.',
        ),
        h3('Trap: JWT is inherently safer than sessions'),
        p(
          'Weak: “We’re stateless so we’re secure.” Strong: JWTs trade easy revocation for scalability; payload is readable; alg must be allow-listed; storage/XSS still matter.',
        ),
        h3('Trap: OAuth is login'),
        p(
          'Weak: “We authenticate with OAuth.” Strong: OAuth delegates authorization; OIDC adds identity tokens for login use cases; your API still enforces its own authz.',
        ),
        h3('Trap: Blacklist sanitization stops injection'),
        p(
          'Weak: “We strip quotes.” Strong: use prepared statements / avoid shells; blacklists fail as languages and encodings evolve.',
        ),
        h3('Trap: UUID prevents IDOR'),
        p(
          'Weak: “IDs aren’t guessable.” Strong: secrecy of ids is not authorization; leaked/shared links still need access checks.',
        ),
        h3('Trap: Hard lockout is always good'),
        p(
          'Weak: “Lock after 3 failures.” Strong: that can DoS victims; prefer rate limits, backoff, CAPTCHA/MFA step-up.'),
        h3('Trap: HttpOnly solves XSS'),
        p(
          'Weak: “Cookies aren’t readable.” Strong: XSS can still act as the user; encoding and CSP remain mandatory.'),
        h3('Trap: Offering exploit recipes'),
        p(
          'In interviews, stay on impact and mitigation. Demonstrating offensive payloads is unnecessary and unprofessional unless explicitly in a authorized red-team role discussion at high level.'),
        callout(
          'mistake',
          'Saying “never trust the user” without explaining where trust boundaries are (browser, gateway, service, DB) sounds slogany. Point to concrete checks.',
        ),
      ]),
      section('reframes', 'Better phrases', [
        table(
          ['Avoid', 'Prefer'],
          [
            ['“We use industry best practices”', 'Name 2–3 concrete controls tied to risks'],
            ['“Military-grade encryption”', 'AES-GCM / TLS 1.2+ with forward secrecy'],
            ['“Fully secure”', 'Residual risk + monitoring'],
            ['“Sanitize all input”', 'Validate input + encode output in context + parameterize'],
          ],
        ),
      ]),
      section('followups', 'When interviewer pushes', [
        p('Interviewer: “Is that always true?”'),
        p(
          'Strong pattern: “Usually X; exception when Y; then I’d compensate with Z.” Example: SameSite=Lax usually helps CSRF; cross-site embeds may need SameSite=None+Secure plus CSRF tokens.',
        ),
      ]),
    ],
    commonMistakes: [
      'Absolute claims (“always,” “impossible”).',
      'Tool names without threat mapping.',
      'Conflating confidentiality with integrity.',
    ],
    interviewQuestions: [
      'Why isn’t HTTPS enough?',
      'Why aren’t UUIDs enough against IDOR?',
      'Why not encrypt passwords?',
      'What’s wrong with alg taken from JWT header unchecked?',
      'Why can lockouts backfire?',
    ],
    intermediateInterviewQuestions: [
      'When would you still need CSRF tokens with SameSite cookies?',
      'Why is client-side hashing alone insufficient for passwords?',
      'How can XSS defeat CSRF tokens?',
      'What’s dangerous about Access-Control-Allow-Origin: * with credentials?',
      'Why is implicit OAuth flow discouraged?',
    ],
    advancedInterviewQuestions: [
      'Where does TLS termination change your threat model?',
      'How do you talk about WAFs without overselling them?',
      'Explain algorithm confusion attacks on JWTs conceptually.',
      'When is app-level encryption redundant with disk encryption?',
      'How do you disagree with a hiring manager who wants hard lockouts?',
    ],
    interviewReadyAnswers: [
      {
        question: 'What’s a security answer that sounds senior?',
        answer:
          'I clarify the system and assets, name the highest-impact risks first — usually broken access control, injection, and account takeover — then give preventive controls, how we’d detect abuse, and what residual risk remains. I avoid absolutes, distinguish hashing from encryption, and never pretend HTTPS or UUIDs solve authorization.',
      },
    ],
    keyTakeaways: [
      'Interviewers probe misconceptions — prepare the reframe.',
      'Precision > buzzwords.',
      'Defensive framing only; mitigations over exploits.',
    ],
  },
)

export const d6rapid: StudyPage = createPage(
  'd6-rapid',
  'Rapid Fire — 20 Questions',
  12,
  [
    'Answer 20 common security interview prompts quickly',
    'Use model-answer hints to self-check completeness',
  ],
  {
    sections: [
      section('howto', 'How to use', [
        p(
          'Answer each in 20–40 seconds. Then check the hint. Cover WHAT + WHY/HOW control. No exploitation steps.',
        ),
      ]),
      section('q1_10', 'Questions 1–10', [
        ol([
          'CIA triad — define each with one control. Hint: C encrypt/authz; I hash/sign/constraints; A redundancy/rate limits.',
          'Authn vs authz? Hint: who vs what; IDOR is authz.',
          'Hashing vs encryption? Hint: one-way verify vs reversible confidentiality.',
          'Why salt passwords? Hint: unique hashes; defeat precomputation; not secret.',
          'Name a good password algorithm. Hint: Argon2id/bcrypt/scrypt — not MD5/SHA.',
          'Symmetric vs asymmetric? Hint: shared key speed vs key pairs for distribute/sign; hybrid.',
          'What does TLS not protect? Hint: app bugs, at-rest data, authz between users.',
          'Certificate chain? Hint: leaf signed by intermediate → root trust anchor + hostname/validity.',
          'HttpOnly vs Secure vs SameSite? Hint: no JS / HTTPS only / cross-site cookie behavior.',
          'Session vs JWT trade-off? Hint: revocation vs stateless verification.',
        ]),
      ]),
      section('q11_20', 'Questions 11–20', [
        ol([
          'OAuth roles? Hint: resource owner, client, authorization server, resource server.',
          'Why PKCE? Hint: bind code exchange to initiator; public clients.',
          'Stop SQLi? Hint: prepared statements; least privilege.',
          'Stop command injection? Hint: no shell; allow-listed args.',
          'XSS types? Hint: reflected, stored, DOM — encode/CSP.',
          'CSRF defense? Hint: SameSite + CSRF token; avoid GET mutations.',
          'SSRF mitigation? Hint: allow-list; block private/metadata; egress control.',
          'IDOR fix? Hint: object-level authz; tests across users.',
          'Brute force defense without self-DoS? Hint: rate limit + progressive friction + MFA.',
          'Secure API in 5 bullets? Hint: TLS, authn, object authz, validate/parameterize, rate limit + audit/secrets.',
        ]),
      ]),
      section('model', 'Composite model answer (Q20)', [
        p(
          '“TLS everywhere; authenticate with short-lived sessions/tokens; authorize every object; validate input and parameterize data access; rate-limit and audit sensitive actions; secrets in a vault; generic errors; monitor 401/403/429 anomalies. Residual risk accepted with detection.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Spending 3 minutes on one question during rapid fire.',
      'Skipping the mitigation and only defining the term.',
      'Giving offensive payloads instead of defenses.',
    ],
    interviewQuestions: [
      'Define the CIA triad with one control each.',
      'Authn vs authz?',
      'Hashing vs encryption?',
      'Why salt passwords?',
      'Name a password hashing algorithm and one to avoid.',
      'Symmetric vs asymmetric encryption?',
      'What TLS does not provide?',
      'What is a certificate trust chain?',
      'HttpOnly, Secure, SameSite — purpose of each?',
      'One trade-off: server sessions vs JWT?',
    ],
    intermediateInterviewQuestions: [
      'Four OAuth roles?',
      'Purpose of PKCE?',
      'Primary SQLi prevention?',
      'Primary command-injection prevention?',
      'Three XSS types?',
      'Two CSRF defenses?',
      'Two SSRF defenses?',
      'IDOR prevention beyond UUIDs?',
      'Login brute-force defense that avoids lockout DoS?',
      'Five bullets to secure a REST API?',
    ],
    advancedInterviewQuestions: [
      'Add detection ideas to any five of the rapid-fire answers.',
      'Reorder priorities for an internal admin API vs public mobile API.',
      'Explain when you would choose mTLS.',
      'Describe refresh-token reuse detection conceptually.',
      'Give residual risks after your five-bullet API hardening.',
    ],
    interviewReadyAnswers: [
      {
        question: 'Rapid-fire: hashing vs encryption vs encoding',
        answer:
          'Encoding like Base64 is reversible and not security. Encryption is reversible with a key for confidentiality. Hashing is one-way for integrity or password verification; passwords need slow salted hashes, not general-purpose digests.',
      },
      {
        question: 'Rapid-fire: IDOR',
        answer:
          'IDOR means accessing objects by id without authorization checks. Fix with consistent object-level and tenant checks derived from the authenticated subject, deny by default, and cross-user automated tests. Opaque ids are optional friction only.',
      },
    ],
    keyTakeaways: [
      '20 prompts cover most Day 6 interview surface area.',
      'Short answers still need a concrete control.',
      'Stay defensive — definitions + mitigations.',
    ],
  },
)
