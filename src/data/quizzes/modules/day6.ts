import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from '../helpers'

/** Day 6 module checkpoints — defensive cybersecurity (skip revision) */
export const day6ModuleQuizzes: Record<string, QuizQuestion[]> = {
  // ===== d6-m1 Security Foundations =====
  'd6-m1': [
    q({
      id: 'd6-m1-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['CIA Triad'],
      learningObjective: 'Map a control to the CIA property it primarily protects',
      question:
        'Encrypting customer PII at rest so unauthorized readers cannot understand the bytes primarily supports which CIA property?',
      options: [
        'Availability',
        'Integrity',
        'Confidentiality',
        'Non-repudiation alone',
      ],
      correctAnswer: 2,
      explanation:
        'Confidentiality means only authorized parties can learn content. Encryption at rest is a classic confidentiality control.',
      whyWrong: {
        '0': 'Availability is about timely usable access.',
        '1': 'Integrity is about unauthorized modification; encryption alone does not prove data was unaltered.',
        '3': 'Non-repudiation is about proof of origin/actions, not the core CIA label here.',
      },
      interviewTakeaway: 'Encryption ⇒ confidentiality — name CIA first.',
    }),
    tf({
      id: 'd6-m1-q02',
      difficulty: 'easy',
      topics: ['Authentication', 'Authorization'],
      learningObjective: 'Distinguish authentication from authorization',
      question:
        'True or False: Authentication answers “who are you?” while authorization answers “what are you allowed to do?”',
      correct: true,
      explanation:
        'Authn establishes identity; authz decides permissions for that identity (or role/scope).',
      whyWrong: {
        '1': 'False would reverse a foundational definition.',
      },
      interviewTakeaway: 'Separate prove-identity from check-permission.',
    }),
    q({
      id: 'd6-m1-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Hashing', 'Password Storage'],
      learningObjective: 'Choose appropriate password storage',
      question:
        'Which approach is the most appropriate default for storing user passwords?',
      options: [
        'Plaintext for support resets',
        'Reversible AES so passwords can be emailed back',
        'A slow adaptive password hash (Argon2/bcrypt/scrypt) with unique per-user salt',
        'Unsalted MD5 for speed',
      ],
      correctAnswer: 2,
      explanation:
        'Passwords should be one-way hashed with a modern slow algorithm and unique salts so offline cracking is expensive.',
      whyWrong: {
        '0': 'Plaintext is catastrophic on breach.',
        '1': 'Reversible storage means a key leak reveals all passwords.',
        '3': 'Fast unsalted hashes are trivial to crack at scale.',
      },
      interviewTakeaway: 'Say “Argon2/bcrypt + unique salt,” never “we encrypt passwords.”',
    }),
    q({
      id: 'd6-m1-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['CIA Triad', 'Integrity'],
      learningObjective: 'Identify integrity-focused controls',
      question:
        'Which control primarily targets integrity rather than confidentiality?',
      options: [
        'TLS encryption of HTTP bodies',
        'HMAC or digital signatures verifying a payload was not altered',
        'Hiding a server in a private VPC only',
        'Turning off logs to reduce disk use',
      ],
      correctAnswer: 1,
      explanation:
        'MACs/signatures detect unauthorized modification. Encryption mainly protects confidentiality (though AEAD also binds integrity).',
      whyWrong: {
        '0': 'TLS confidentiality is the primary association here; integrity is via AEAD/MAC inside TLS, but the option names encryption alone.',
        '2': 'Network isolation is mainly access/availability/confidentiality posture, not a integrity check.',
        '3': 'Disabling logs harms detection, not integrity of data.',
      },
      interviewTakeaway: 'Integrity ⇒ detect/prevent unauthorized change.',
    }),
    q({
      id: 'd6-m1-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Encryption', 'Hashing'],
      learningObjective: 'Contrast hashing with encryption',
      question:
        'Why is a cryptographic hash a poor choice for storing credit-card PANs you must later display?',
      options: [
        'Hashes are always reversible with the salt',
        'Hashes are one-way — you cannot recover the original PAN for legitimate display/processing',
        'Hashes guarantee confidentiality forever',
        'Encryption is illegal for PANs',
      ],
      correctAnswer: 1,
      explanation:
        'Hashes are one-way. If you need the original value later, use authorized encryption (and strong key management), not password-style hashing.',
      whyWrong: {
        '0': 'Proper cryptographic hashes are not reversible via salt.',
        '2': 'Hashing is not a confidentiality vault for recoverable secrets.',
        '3': 'Encryption is commonly required for card data under strict controls.',
      },
      interviewTakeaway: 'Hash for verify-only; encrypt when you must recover.',
    }),
    tf({
      id: 'd6-m1-q06',
      difficulty: 'medium',
      topics: ['Authorization', 'Least Privilege'],
      learningObjective: 'Apply least privilege to roles',
      question:
        'True or False: Least privilege means granting each principal only the permissions required for its job — not admin-by-default.',
      correct: true,
      explanation:
        'Least privilege shrinks blast radius when credentials or code are compromised.',
      whyWrong: {
        '0': 'False would endorse over-privileged defaults.',
      },
      interviewTakeaway: 'Default deny; grant narrowly; review often.',
    }),
    q({
      id: 'd6-m1-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Encryption', 'Key Management'],
      learningObjective: 'Reason about key management over algorithm name-dropping',
      question:
        'An app “uses AES-256” but stores the AES key in the same database row as the ciphertext, readable by the app DB user. What is the main failure?',
      options: [
        'AES-256 is obsolete',
        'Key management failure — ciphertext and key with equal access provides little confidentiality',
        'You must use MD5 instead',
        'Symmetric crypto cannot encrypt rows',
      ],
      correctAnswer: 1,
      explanation:
        'Confidentiality depends on who can access keys. Co-locating keys with ciphertext under the same access path undermines encryption.',
      whyWrong: {
        '0': 'AES-256 remains widely used; the issue is keys.',
        '2': 'MD5 is inappropriate here.',
        '3': 'Symmetric crypto is commonly used for data at rest.',
      },
      interviewTakeaway: 'Talk keys/HSM/KMS, not only cipher names.',
    }),
    q({
      id: 'd6-m1-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Authentication', 'MFA'],
      learningObjective: 'Explain defense-in-depth for authentication',
      question:
        'Password-only login for a high-value admin portal is weak mainly because:',
      options: [
        'Passwords cannot be hashed',
        'A single factor (something you know) is phishable/reusable; MFA adds another independent factor',
        'TLS makes passwords unnecessary',
        'Authorization replaces authentication',
      ],
      correctAnswer: 1,
      explanation:
        'MFA requires an additional factor (e.g. something you have) so a stolen password alone is insufficient.',
      whyWrong: {
        '0': 'Passwords can and should be hashed.',
        '2': 'TLS protects the channel, not account takeover after phishing.',
        '3': 'Authz decides permissions after identity is established.',
      },
      interviewTakeaway: 'High-value accounts: MFA + strong session controls.',
    }),
  ],

  // ===== d6-m2 Transport Security & Identity =====
  'd6-m2': [
    q({
      id: 'd6-m2-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['TLS', 'Encryption'],
      learningObjective: 'State what TLS primarily protects in transit',
      question:
        'A browser has a valid TLS session to api.example.com. What does TLS primarily guarantee for that connection?',
      options: [
        'The API business logic has no bugs',
        'Confidentiality and integrity of data in transit, plus authentication of the server (via certificate validation)',
        'That DB password hashes are Argon2',
        'That authorization checks are correct',
      ],
      correctAnswer: 1,
      explanation:
        'TLS protects the channel and authenticates the server (and optionally the client). App logic and authz remain separate.',
      whyWrong: {
        '0': 'TLS does not verify business correctness.',
        '2': 'Password storage is an application/DB concern.',
        '3': 'Authorization is application-level.',
      },
      interviewTakeaway: 'TLS ≠ authz; it secures the pipe.',
    }),
    tf({
      id: 'd6-m2-q02',
      difficulty: 'easy',
      topics: ['Sessions', 'Cookies'],
      learningObjective: 'Identify secure cookie flags at a high level',
      question:
        'True or False: Session cookies for HTTPS sites should typically use Secure and HttpOnly (and carefully choose SameSite) to reduce theft and script access.',
      correct: true,
      explanation:
        'Secure limits cookies to HTTPS; HttpOnly blocks document.cookie access; SameSite helps mitigate CSRF-style cross-site sends.',
      whyWrong: {
        '1': 'False ignores standard session-cookie hardening.',
      },
      interviewTakeaway: 'Name Secure, HttpOnly, SameSite in interviews.',
    }),
    q({
      id: 'd6-m2-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['JWT', 'Sessions'],
      learningObjective: 'Contrast server sessions with JWTs at a high level',
      question:
        'Compared with a server-side session ID, a common trade-off of long-lived unsigned/poorly validated tokens is:',
      options: [
        'They always provide stronger authz',
        'Revocation and short lifetime become harder if the token is treated as self-contained without a denylist/rotation strategy',
        'They eliminate the need for HTTPS',
        'They make SQL injection impossible',
      ],
      correctAnswer: 1,
      explanation:
        'Self-contained tokens are hard to revoke instantly unless you add server state, short TTLs, rotation, or introspection.',
      whyWrong: {
        '0': 'Authz is not automatically stronger.',
        '2': 'Tokens still need TLS in transit.',
        '3': 'Token format does not stop injection.',
      },
      interviewTakeaway: 'JWTs: short TTL + revoke/rotate story.',
    }),
    q({
      id: 'd6-m2-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['TLS', 'Certificates'],
      learningObjective: 'Explain certificate validation purpose',
      question:
        'Why must clients validate the server certificate (chain, hostname, expiry, trust anchors)?',
      options: [
        'To speed up TCP congestion control',
        'To ensure they are encrypting to the intended server, not an impostor',
        'To hash passwords correctly',
        'To enable CORS',
      ],
      correctAnswer: 1,
      explanation:
        'Without validation, encryption can go to an attacker (MITM). Trust + hostname checks bind the channel to the right identity.',
      whyWrong: {
        '0': 'Congestion control is unrelated.',
        '2': 'Password hashing is separate.',
        '3': 'CORS is a browser same-origin policy mechanism.',
      },
      interviewTakeaway: 'Encryption without authentication is incomplete.',
    }),
    q({
      id: 'd6-m2-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['OAuth', 'Identity'],
      learningObjective: 'State OAuth’s typical role vs authentication product',
      question:
        'In common web architectures, OAuth 2.0 is primarily about:',
      options: [
        'Delegated authorization — granting limited access to resources without sharing the user’s password with the client app',
        'Replacing TLS',
        'Encrypting database columns',
        'Guaranteeing SQL injection is impossible',
      ],
      correctAnswer: 0,
      explanation:
        'OAuth delegates access (scopes/tokens). OpenID Connect layers identity claims on top for authentication use cases.',
      whyWrong: {
        '1': 'OAuth does not replace TLS.',
        '2': 'Column encryption is orthogonal.',
        '3': 'OAuth does not fix injection.',
      },
      interviewTakeaway: 'OAuth = delegated authz; OIDC adds identity.',
    }),
    tf({
      id: 'd6-m2-q06',
      difficulty: 'medium',
      topics: ['JWT', 'Authentication'],
      learningObjective: 'Call out JWT verification requirements',
      question:
        'True or False: Accepting a JWT without verifying signature/algorithm and expiry is unsafe even if the token “looks like JSON.”',
      correct: true,
      explanation:
        'Unverified tokens can be forged or replayed. Always validate signature (with an allowlisted alg), expiry, issuer/audience as applicable.',
      whyWrong: {
        '1': 'False would endorse trusting client-controlled blobs.',
      },
      interviewTakeaway: 'Never trust a JWT you have not verified.',
    }),
    q({
      id: 'd6-m2-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Sessions', 'Security'],
      learningObjective: 'Harden session lifecycle after privilege changes',
      question:
        'After a password change or privilege escalation, what is a strong session hygiene practice?',
      options: [
        'Keep all old sessions forever for convenience',
        'Invalidate existing sessions (or rotate session IDs) so stolen cookies stop working',
        'Store passwords in the session cookie',
        'Disable HTTPS for faster logout',
      ],
      correctAnswer: 1,
      explanation:
        'Session fixation/theft risks drop when you rotate/invalidate sessions at auth boundaries and sensitive changes.',
      whyWrong: {
        '0': 'Long-lived unreoked sessions extend attacker windows.',
        '2': 'Never put passwords in cookies.',
        '3': 'HTTPS remains required.',
      },
      interviewTakeaway: 'Rotate session IDs at login and sensitive events.',
    }),
    q({
      id: 'd6-m2-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['OAuth', 'Tokens'],
      learningObjective: 'Choose safer token handling for SPAs/APIs at a conceptual level',
      question:
        'For a public SPA calling APIs, which guidance is most aligned with modern defensive practice?',
      options: [
        'Put long-lived refresh tokens in localStorage and skip HTTPS',
        'Prefer short-lived access tokens, careful refresh handling, and avoid exposing powerful tokens to XSS-prone storage when possible',
        'Share one client secret in frontend JavaScript',
        'Disable redirect URI validation for flexibility',
      ],
      correctAnswer: 1,
      explanation:
        'Public clients cannot keep secrets. Short-lived access tokens, protected refresh flows, and reducing XSS-exposable storage are key themes.',
      whyWrong: {
        '0': 'localStorage + long-lived tokens + no TLS is high risk.',
        '2': 'Frontend cannot protect a client secret.',
        '3': 'Redirect URI validation is a core OAuth control.',
      },
      interviewTakeaway: 'Public clients: no secrets; short tokens; harden storage.',
    }),
  ],

  // ===== d6-m3 Common Vulnerabilities (Defensive) =====
  'd6-m3': [
    q({
      id: 'd6-m3-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Injection', 'SQLi'],
      learningObjective: 'Identify the primary SQLi mitigation',
      question:
        'Which mitigation best prevents classic SQL injection?',
      options: [
        'String-concatenating user input into SQL carefully',
        'Parameterized queries / prepared statements (and ORM bind parameters)',
        'Base64-encoding the query string',
        'Disabling TLS',
      ],
      correctAnswer: 1,
      explanation:
        'Bound parameters keep data separate from SQL structure so user input cannot alter query syntax.',
      whyWrong: {
        '0': 'Manual concatenation is the root cause pattern.',
        '2': 'Encoding is not a substitute for parameterization.',
        '3': 'TLS does not fix query construction.',
      },
      interviewTakeaway: 'Always parameterize — never concatenate SQL.',
    }),
    tf({
      id: 'd6-m3-q02',
      difficulty: 'easy',
      topics: ['XSS'],
      learningObjective: 'State XSS mitigation mindset',
      question:
        'True or False: Context-appropriate output encoding/escaping and avoiding unsafe HTML sinks are primary defenses against XSS.',
      correct: true,
      explanation:
        'XSS injects script into victims’ browsers. Encode for the output context (HTML/attr/JS/URL) and use safe templating/CSP as defense in depth.',
      whyWrong: {
        '1': 'False would deny the standard XSS defense model.',
      },
      interviewTakeaway: 'Encode on output; treat user HTML as hostile.',
    }),
    q({
      id: 'd6-m3-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['CSRF'],
      learningObjective: 'Recognize CSRF at a conceptual level',
      question:
        'CSRF primarily abuses which condition?',
      options: [
        'The browser automatically attaching cookies/credentials to a cross-site request the user did not intentionally make for that action',
        'Missing indexes on SQL tables',
        'Weak TLS ciphers only',
        'Too much logging',
      ],
      correctAnswer: 0,
      explanation:
        'CSRF tricks a victim’s browser into sending authenticated requests. Defenses include SameSite cookies, anti-CSRF tokens, and avoiding cookie auth for pure APIs when appropriate.',
      whyWrong: {
        '1': 'Indexes are performance, not CSRF.',
        '2': 'TLS strength is a different topic.',
        '3': 'Logging volume is unrelated.',
      },
      interviewTakeaway: 'CSRF = unwanted cross-site authenticated actions.',
    }),
    q({
      id: 'd6-m3-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['IDOR', 'Access Control'],
      learningObjective: 'Identify broken object-level authorization',
      question:
        'User A changes /api/orders/42 to /api/orders/43 and sees another user’s order. What control failed?',
      options: [
        'TLS certificate pinning only',
        'Object-level authorization (IDOR / broken access control)',
        'Password hashing algorithm choice',
        'CDN cache TTLs',
      ],
      correctAnswer: 1,
      explanation:
        'Every object access must verify the caller is allowed that resource — not just that they are logged in.',
      whyWrong: {
        '0': 'TLS does not enforce per-object authz.',
        '2': 'Hashing is about credential storage.',
        '3': 'Cache TTLs are performance/freshness.',
      },
      interviewTakeaway: 'Authn ≠ authz on every object ID.',
    }),
    q({
      id: 'd6-m3-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['SSRF'],
      learningObjective: 'Describe SSRF risk and defensive posture',
      question:
        'A feature fetches a user-supplied URL server-side. What is the core SSRF risk and a primary defense theme?',
      options: [
        'Risk: server becomes a proxy into internal networks; Defense: allowlists, block link-local/metadata IPs, and avoid raw URL fetch from users',
        'Risk: CSS breaks; Defense: minify CSS',
        'Risk: GC pauses; Defense: larger heap',
        'Risk: slow DNS only; Defense: disable DNS',
      ],
      correctAnswer: 0,
      explanation:
        'SSRF makes your server request internal targets. Prefer allowlists, network egress controls, and never trust user URLs blindly.',
      whyWrong: {
        '1': 'CSS is unrelated.',
        '2': 'GC is unrelated.',
        '3': 'Disabling DNS is not a real mitigation strategy.',
      },
      interviewTakeaway: 'SSRF: don’t let users aim your server’s HTTP client.',
    }),
    tf({
      id: 'd6-m3-q06',
      difficulty: 'medium',
      topics: ['Rate Limiting', 'Brute Force'],
      learningObjective: 'Apply rate limiting defensively',
      question:
        'True or False: Rate limiting and lockout/backoff on authentication endpoints help mitigate credential stuffing and online brute force.',
      correct: true,
      explanation:
        'Throttling slows automated guessing. Combine with MFA, breach detection, and monitoring — not rate limits alone.',
      whyWrong: {
        '1': 'False would ignore a standard control.',
      },
      interviewTakeaway: 'Throttle auth; alert on anomalies; prefer MFA.',
    }),
    q({
      id: 'd6-m3-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Path Traversal', 'Access Control'],
      learningObjective: 'Defend file access against path traversal',
      question:
        'A download endpoint builds paths as baseDir + userFilename. Which defensive approach is sound?',
      options: [
        'Trust the filename if the user is authenticated',
        'Resolve/normalize the path and ensure it stays within an allowlisted directory; prefer opaque file IDs over raw paths',
        'Concatenate “../” filters only once at the start',
        'Store files with world-writable permissions for convenience',
      ],
      correctAnswer: 1,
      explanation:
        'Path traversal escapes intended directories. Canonicalize and enforce containment; better yet, map opaque IDs to stored objects.',
      whyWrong: {
        '0': 'Authn does not stop traversal payloads.',
        '2': 'Naive string filters are brittle.',
        '3': 'World-writable files worsen compromise impact.',
      },
      interviewTakeaway: 'Opaque IDs + containment checks for file APIs.',
    }),
    q({
      id: 'd6-m3-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Injection', 'Command Injection'],
      learningObjective: 'Avoid shelling out with unsanitized input',
      question:
        'Which practice best reduces OS command injection risk?',
      options: [
        'Build shell strings with user input and hope quoting is perfect',
        'Avoid the shell: use safe APIs/libraries with argument arrays, and never pass raw user input to a command interpreter',
        'Lower process privileges after the command runs',
        'Log the command after execution only',
      ],
      correctAnswer: 1,
      explanation:
        'Command injection thrives on shell metacharacters. Prefer no shell, fixed binaries with argv arrays, and strong allowlists if unavoidable.',
      whyWrong: {
        '0': 'Manual quoting is fragile.',
        '2': 'Least privilege helps blast radius but does not stop injection.',
        '3': 'Logging after the fact is detection, not prevention.',
      },
      interviewTakeaway: 'Don’t shell out with user input.',
    }),
  ],

  // ===== d6-m4 Secure Engineering Practices =====
  'd6-m4': [
    q({
      id: 'd6-m4-q01',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Secure APIs', 'Input Validation'],
      learningObjective: 'Validate inputs at trust boundaries',
      question:
        'Which habit is most important for secure API design?',
      options: [
        'Trust all JSON because it parsed',
        'Validate and authorize at the boundary; reject unexpected fields/types; enforce schemas',
        'Return stack traces to all clients for transparency',
        'Use GET for state-changing deletes to simplify caching',
      ],
      correctAnswer: 1,
      explanation:
        'Parsed JSON is still untrusted. Schema validation, authz, and safe error handling are foundational.',
      whyWrong: {
        '0': 'Parse success ≠ semantic safety.',
        '2': 'Stack traces leak internals.',
        '3': 'Unsafe method semantics invite caches/proxies/CSRF issues.',
      },
      interviewTakeaway: 'Validate → authenticate → authorize → process.',
    }),
    tf({
      id: 'd6-m4-q02',
      difficulty: 'easy',
      topics: ['Secure APIs', 'Secrets'],
      learningObjective: 'Keep secrets out of clients and repos',
      question:
        'True or False: API keys and DB passwords belong in server-side secret stores/env — not in frontend bundles or git.',
      correct: true,
      explanation:
        'Anything shipped to browsers or committed to git should be treated as public. Use vaults/KMS/CI secrets.',
      whyWrong: {
        '1': 'False would endorse leaking credentials.',
      },
      interviewTakeaway: 'If the browser can see it, it’s not a secret.',
    }),
    q({
      id: 'd6-m4-q03',
      type: 'mcq',
      difficulty: 'easy',
      topics: ['Secure DB', 'Least Privilege'],
      learningObjective: 'Apply least privilege to DB users',
      question:
        'An app only needs to read/write specific tables. The DB login should:',
      options: [
        'Use the superuser for simplicity',
        'Have narrowly scoped privileges on required objects only',
        'Share one admin password across all microservices',
        'Disable authentication to the database',
      ],
      correctAnswer: 1,
      explanation:
        'Least-privilege DB roles limit damage from SQLi or stolen credentials.',
      whyWrong: {
        '0': 'Superuser maximizes blast radius.',
        '2': 'Shared admin credentials break accountability and isolation.',
        '3': 'Open DB auth is catastrophic.',
      },
      interviewTakeaway: 'App DB users: minimal grants, no superuser.',
    }),
    q({
      id: 'd6-m4-q04',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Secure APIs', 'Idempotency'],
      learningObjective: 'Use idempotency for safe retries',
      question:
        'A payment POST may be retried by clients after timeouts. What defensive API practice helps?',
      options: [
        'Ignore duplicates and charge twice',
        'Idempotency keys so retries do not create duplicate side effects',
        'Disable TLS on payment routes',
        'Return 500 for every retry',
      ],
      correctAnswer: 1,
      explanation:
        'Idempotency keys let the server recognize retries and return the original result without double-charging.',
      whyWrong: {
        '0': 'Double charges are a critical failure.',
        '2': 'TLS remains required for payments.',
        '3': 'Blind 500s do not solve duplicate side effects.',
      },
      interviewTakeaway: 'Money APIs: idempotency + exactly-once intent.',
    }),
    q({
      id: 'd6-m4-q05',
      type: 'mcq',
      difficulty: 'medium',
      topics: ['Secure DB', 'Encryption'],
      learningObjective: 'Layer DB security controls',
      question:
        'Which set best reflects secure database practices for interviews?',
      options: [
        'Parameterized queries, least-privilege roles, encryption at rest/in transit, careful migration secrets',
        'String-built SQL, shared root account, plaintext backups on public buckets',
        'Disable audits to improve privacy',
        'Store password hashes with a single global salt “for consistency”',
      ],
      correctAnswer: 0,
      explanation:
        'Defense in depth: safe query construction, privilege separation, encryption, and secret hygiene for backups/migrations.',
      whyWrong: {
        '1': 'These are anti-patterns.',
        '2': 'Audits support detection and compliance.',
        '3': 'Per-user unique salts are preferred.',
      },
      interviewTakeaway: 'DB security is layered — not one checkbox.',
    }),
    tf({
      id: 'd6-m4-q06',
      difficulty: 'medium',
      topics: ['Secure APIs', 'Logging'],
      learningObjective: 'Avoid logging secrets',
      question:
        'True or False: Production logs should avoid writing passwords, session tokens, raw PANs, and other secrets.',
      correct: true,
      explanation:
        'Logs are widely accessible in ops pipelines. Redact/tokenize sensitive fields; log IDs and outcomes instead.',
      whyWrong: {
        '1': 'False would endorse secret sprawl via logs.',
      },
      interviewTakeaway: 'If you wouldn’t put it in Slack, don’t log it.',
    }),
    q({
      id: 'd6-m4-q07',
      type: 'scenario',
      difficulty: 'hard',
      topics: ['Secure APIs', 'Authorization'],
      learningObjective: 'Design defense-in-depth for multi-tenant APIs',
      question:
        'In a multi-tenant SaaS API, tenant B’s JWT must never read tenant A’s rows. Where should enforcement live?',
      options: [
        'Only in the UI hiding buttons',
        'In the API/service layer and data access filters (every query scoped by tenant), not UI alone',
        'Only in a CDN cache key',
        'Nowhere if JWT signature verifies',
      ],
      correctAnswer: 1,
      explanation:
        'UI checks are bypassable. Enforce tenant isolation in server authz and queries; treat missing tenant predicates as defects.',
      whyWrong: {
        '0': 'UI is not a security boundary.',
        '2': 'CDN keys do not authorize data access.',
        '3': 'Valid JWT proves identity/claims, not cross-tenant permission.',
      },
      interviewTakeaway: 'Tenant ID in every query — enforce server-side.',
    }),
    q({
      id: 'd6-m4-q08',
      type: 'mcq',
      difficulty: 'hard',
      topics: ['Secure Engineering', 'Threat Modeling'],
      learningObjective: 'Prioritize controls with a threat mindset',
      question:
        'You have one sprint for security hardening on a public CRUD API. Which prioritization is most interview-strong?',
      options: [
        'Cosmetic UI theming before authz',
        'Fix authn/authz gaps, injection-safe data access, secret/TLS hygiene, then rate limits/monitoring',
        'Only add a CAPTCHA and call it done',
        'Disable all logging to reduce risk',
      ],
      correctAnswer: 1,
      explanation:
        'Threat modeling prioritizes identity, authorization, injection, transport/secrets, then abuse resistance and detectability.',
      whyWrong: {
        '0': 'Theming is not a security priority.',
        '2': 'CAPTCHA alone does not fix broken access or injection.',
        '3': 'Disabling logs removes detection.',
      },
      interviewTakeaway: 'Rank by attacker impact: identity → data access → abuse.',
    }),
  ],
}
