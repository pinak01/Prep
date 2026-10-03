import type { QuizQuestion } from '@/types/curriculum'
import { q, tf } from './helpers'

/** Day 6 — Defensive security: CIA, auth, crypto, sessions, common vulns mitigations, APIs (30 questions) */
export const day6Questions: QuizQuestion[] = [
  // ===== EASY (10) =====
  q({
    id: 'd6-q01',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['CIA Triad'],
    learningObjective: 'Map a control to the CIA property it primarily protects',
    question:
      'Encrypting customer PII at rest so unauthorized readers cannot understand the bytes primarily supports which CIA property?',
    options: ['Availability', 'Integrity', 'Confidentiality', 'Non-repudiation alone'],
    correctAnswer: 2,
    explanation:
      'Confidentiality means only authorized parties can learn the content. Encryption at rest is a classic confidentiality control.',
    whyWrong: {
      '0': 'Availability is about timely usable access, not secrecy of stored bytes.',
      '1': 'Integrity is about preventing unauthorized modification; encryption alone does not prove data was not altered.',
      '3': 'Non-repudiation is typically about proof of origin/actions, not the core CIA label for encryption at rest.',
    },
    interviewTakeaway: 'Name the CIA property first, then the control — encryption ⇒ confidentiality.',
  }),
  tf({
    id: 'd6-q02',
    difficulty: 'easy',
    topics: ['Authentication', 'Authorization'],
    learningObjective: 'Distinguish authentication from authorization',
    question:
      'True or False: Authentication answers “who are you?” while authorization answers “what are you allowed to do?”',
    correct: true,
    explanation:
      'Authn establishes identity; authz decides permissions for that identity (or role/scope). Confusing them is a common interview fail.',
    whyWrong: {
      '1': 'False would reverse a foundational security definition.',
    },
    interviewTakeaway: 'Always separate “prove identity” from “check permission.”',
  }),
  q({
    id: 'd6-q03',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Hashing', 'Password Storage'],
    learningObjective: 'Choose appropriate password storage',
    question:
      'Which approach is the most appropriate default for storing user passwords in a modern web app?',
    options: [
      'Plaintext in the users table for support convenience',
      'Reversible AES encryption with a shared app key so passwords can be emailed back',
      'A slow adaptive password hash (e.g. Argon2/bcrypt/scrypt) with unique per-user salt',
      'MD5 of the password with no salt for speed',
    ],
    correctAnswer: 2,
    explanation:
      'Passwords should be one-way hashed with a modern memory-hard/slow algorithm and unique salts so offline cracking is expensive and rainbow tables fail.',
    whyWrong: {
      '0': 'Plaintext is catastrophic on breach.',
      '1': 'Reversible storage means a key leak reveals all passwords.',
      '3': 'Fast unsalted hashes are trivial to crack at scale.',
    },
    interviewTakeaway: 'Say “Argon2/bcrypt + unique salt,” never “we encrypt passwords.”',
  }),
  q({
    id: 'd6-q04',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['TLS', 'Encryption'],
    learningObjective: 'State what TLS primarily protects in transit',
    question:
      'A browser shows a valid TLS session to api.example.com. What does TLS primarily guarantee for that connection?',
    options: [
      'The API business logic has no bugs',
      'Confidentiality and integrity of data in transit, plus authentication of the server (via certificate validation)',
      'That the user’s password hash in the database is Argon2',
      'That SQL injection is impossible',
    ],
    correctAnswer: 1,
    explanation:
      'TLS encrypts and integrity-protects the channel and authenticates the server when certificates are validated correctly. It does not fix application bugs.',
    whyWrong: {
      '0': 'TLS is not an app-correctness guarantee.',
      '2': 'Password storage is an at-rest concern independent of TLS.',
      '3': 'Injection is an application input-handling issue.',
    },
    interviewTakeaway: 'TLS = in-transit confidentiality/integrity + server auth — not “secure app.”',
  }),
  q({
    id: 'd6-q05',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['SQL Injection', 'Secure Databases'],
    learningObjective: 'Identify the primary SQLi mitigation',
    question:
      'Which control most directly prevents classic SQL injection from untrusted input?',
    options: [
      'Turning off HTTPS',
      'Parameterized queries / prepared statements that bind user values separately from SQL structure',
      'Storing the SQL text in Redis',
      'Using longer table names',
    ],
    correctAnswer: 1,
    explanation:
      'Parameter binding keeps user data out of the SQL parse tree so input cannot change query structure. Escaping strings by hand is fragile; prefer parameters.',
    whyWrong: {
      '0': 'TLS does not stop injection into SQL.',
      '2': 'Caching query text is unrelated.',
      '3': 'Naming does not sanitize inputs.',
    },
    interviewTakeaway: 'Lead with parameterized queries; mention least-privilege DB users as defense in depth.',
  }),
  tf({
    id: 'd6-q06',
    difficulty: 'easy',
    topics: ['XSS'],
    learningObjective: 'Recognize XSS as a trust-boundary failure in the browser',
    question:
      'True or False: Cross-site scripting (XSS) occurs when untrusted data is interpreted as active script/markup in a victim’s browser context.',
    correct: true,
    explanation:
      'XSS is an output-encoding / context separation failure: attacker-controlled data executes with the site’s origin privileges in the browser.',
    whyWrong: {
      '1': 'False would deny the standard XSS definition.',
    },
    interviewTakeaway: 'XSS = untrusted data treated as code in the wrong context — fix with encoding + CSP.',
  }),
  q({
    id: 'd6-q07',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['CSRF'],
    learningObjective: 'State the CSRF problem and a standard mitigation',
    question:
      'A site uses cookie-based session auth. An attacker’s page triggers the victim’s browser to POST a state-changing request to that site. Which mitigation best addresses this CSRF risk?',
    options: [
      'Rely only on the session cookie being HttpOnly',
      'Require a synchronizer (anti-CSRF) token or equivalent SameSite/custom-header pattern that the attacker’s origin cannot forge',
      'Disable TLS',
      'Hash the user’s email with MD5',
    ],
    correctAnswer: 1,
    explanation:
      'CSRF abuses the browser automatically sending cookies. Anti-CSRF tokens, SameSite cookies, and requiring non-simple custom headers for APIs break that forgery path.',
    whyWrong: {
      '0': 'HttpOnly stops JS cookie theft; it does not stop automatic cookie submission on CSRF.',
      '2': 'Worse for security.',
      '3': 'Irrelevant to request forgery.',
    },
    interviewTakeaway: 'CSRF = unwanted authenticated action; fix with tokens/SameSite, not HttpOnly alone.',
  }),
  q({
    id: 'd6-q08',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Sessions'],
    learningObjective: 'Apply basic session cookie hardening flags',
    question:
      'Which set of cookie attributes is the best baseline for a session cookie over HTTPS?',
    options: [
      'Secure; HttpOnly; SameSite=Lax (or Strict where UX allows)',
      'Secure=false; HttpOnly=false; SameSite=None without Secure',
      'Document.cookie writable from any iframe with no flags',
      'Store the session id in localStorage only and skip cookies',
    ],
    correctAnswer: 0,
    explanation:
      'Secure limits to HTTPS; HttpOnly blocks script access; SameSite reduces CSRF risk. Together they harden session cookies.',
    whyWrong: {
      '1': 'Opposite of hardening.',
      '2': 'Maximally exposed.',
      '3': 'localStorage is readable by XSS; not automatically safer.',
    },
    interviewTakeaway: 'Session cookies: Secure + HttpOnly + thoughtful SameSite.',
  }),
  q({
    id: 'd6-q09',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['Rate Limiting'],
    learningObjective: 'Explain why rate limiting is a defensive control',
    question:
      'Why do services rate-limit login and password-reset endpoints?',
    options: [
      'To make SQL joins faster',
      'To slow credential stuffing, brute force, and abuse that harms availability or account security',
      'To replace TLS',
      'To prove the database is normalized',
    ],
    correctAnswer: 1,
    explanation:
      'Rate limits and lockout/backoff policies raise the cost of automated guessing and protect availability of auth endpoints.',
    whyWrong: {
      '0': 'Unrelated to query planning.',
      '2': 'Rate limits do not encrypt traffic.',
      '3': 'Normalization is a data-modeling concern.',
    },
    interviewTakeaway: 'Mention rate limits + monitoring on auth surfaces in every security design answer.',
  }),
  q({
    id: 'd6-q10',
    type: 'mcq',
    difficulty: 'easy',
    topics: ['IDOR', 'Authorization'],
    learningObjective: 'Define IDOR at a high level',
    question:
      'User A changes a URL from /orders/1001 to /orders/1002 and sees User B’s order. What class of flaw is this, and what is the primary fix?',
    options: [
      'XSS — add a Content-Security-Policy only',
      'IDOR / broken object-level authorization — enforce authz checks that the caller may access that object',
      'Missing TLS — enable HTTPS only',
      'Weak hashing — switch to SHA-1',
    ],
    correctAnswer: 1,
    explanation:
      'Insecure Direct Object Reference (broken object-level authz) means the server trusts a client-supplied id without verifying ownership/permission.',
    whyWrong: {
      '0': 'CSP does not authorize object access.',
      '2': 'TLS does not stop authorized-looking requests for others’ objects.',
      '3': 'Hashing is unrelated.',
    },
    interviewTakeaway: 'Every object access needs a server-side “may this subject touch this resource?” check.',
  }),

  // ===== MEDIUM (10) =====
  q({
    id: 'd6-q11',
    type: 'multi',
    difficulty: 'medium',
    topics: ['CIA Triad'],
    learningObjective: 'Map multiple controls to CIA properties',
    question:
      'Which pairings correctly match a control to its primary CIA goal? (Select all that apply)',
    options: [
      'Checksums / HMAC / digital signatures → Integrity',
      'Redundant replicas and failover → Availability',
      'Access control lists denying unauthorized reads → Confidentiality',
      'Turning off backups → Availability',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'Integrity detects/prevents unauthorized change; availability keeps systems usable; confidentiality restricts disclosure. Disabling backups harms availability/recovery.',
    whyWrong: {
      '3': 'Backups support availability and recovery; disabling them does not help availability.',
    },
    interviewTakeaway: 'Be ready to give one control per C/I/A property.',
  }),
  q({
    id: 'd6-q12',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Hashing', 'Encryption'],
    learningObjective: 'Distinguish hashing from encryption uses',
    question:
      'When should you prefer a cryptographic hash (or HMAC) over encryption?',
    options: [
      'When you must later recover the original secret from the stored value',
      'When you need a fixed-size fingerprint or integrity tag and do not need to recover the original input',
      'When you want to hide a message from the database admin but still decrypt it for display',
      'When you need bidirectional TLS record protection',
    ],
    correctAnswer: 1,
    explanation:
      'Hashes/HMACs are one-way (for integrity/fingerprints). Encryption is reversible with a key — use it when authorized parties must recover plaintext.',
    whyWrong: {
      '0': 'That requires encryption (or a vault), not a hash.',
      '2': 'That is encryption’s job.',
      '3': 'TLS uses authenticated encryption, not “hash instead of encrypt.”',
    },
    interviewTakeaway: 'Hash/HMAC for integrity/fingerprints; encrypt when you need plaintext back.',
  }),
  q({
    id: 'd6-q13',
    type: 'code',
    difficulty: 'medium',
    topics: ['SQL Injection', 'Secure APIs'],
    learningObjective: 'Spot unsafe vs safe query construction',
    question:
      'Which snippet is the safer pattern for binding a user-supplied id?',
    codeSnippet: {
      language: 'javascript',
      code: `// A
db.query("SELECT * FROM orders WHERE id = " + req.query.id)

// B
db.query("SELECT * FROM orders WHERE id = $1", [req.query.id])`,
    },
    options: [
      'A — string concatenation is clearer',
      'B — parameterized binding separates data from SQL',
      'Both are equivalent for security',
      'Neither; only ORMs can ever be safe',
    ],
    correctAnswer: 1,
    explanation:
      'B uses a parameter placeholder so the driver sends id as data. A concatenates untrusted input into SQL text.',
    whyWrong: {
      '0': 'Clarity does not equal safety.',
      '2': 'They are not equivalent.',
      '3': 'ORMs help when they parameterize; raw parameters are also fine.',
    },
    interviewTakeaway: 'Show you can recognize concatenation vs bind parameters instantly.',
  }),
  q({
    id: 'd6-q14',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['XSS'],
    learningObjective: 'Choose context-appropriate XSS defenses',
    question:
      'Your React app already escapes text nodes by default, but you must render limited rich HTML from a CMS. What is the safest defensive approach?',
    options: [
      'dangerouslySetInnerHTML with the raw CMS string and no sanitizer',
      'Sanitize with a vetted HTML sanitizer allowlist, then render; prefer avoiding HTML when possible; add a strict CSP',
      'Disable HTTPS so scripts cannot load',
      'Base64-encode the HTML and put it in a cookie',
    ],
    correctAnswer: 1,
    explanation:
      'If HTML is required, sanitize to an allowlist of tags/attrs, keep frameworks’ default escaping elsewhere, and use CSP as defense in depth.',
    whyWrong: {
      '0': 'Raw HTML injection is a classic stored XSS path.',
      '2': 'Breaks security further.',
      '3': 'Does not make HTML safe to render.',
    },
    interviewTakeaway: 'Default escape; sanitize only if you must render HTML; CSP as belt-and-suspenders.',
  }),
  q({
    id: 'd6-q15',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['SSRF'],
    learningObjective: 'Describe SSRF risk and defensive controls',
    question:
      'An API accepts a URL from users and the server fetches it to generate a preview. What is the core SSRF risk, and a key mitigation?',
    options: [
      'Risk: server makes requests to unintended internal targets; mitigate with allowlists, block link-local/metadata IPs, and no raw user URLs to sensitive networks',
      'Risk: slower JSON parsing; mitigate by using larger EC2 instances only',
      'Risk: CSRF on the browser; mitigate with HttpOnly cookies only',
      'Risk: weak password hashing; mitigate with MD5',
    ],
    correctAnswer: 0,
    explanation:
      'SSRF turns the server into a proxy toward internal services/cloud metadata. Defend with strict allowlists, network egress controls, and denying private/link-local ranges.',
    whyWrong: {
      '1': 'Not an SSRF definition.',
      '2': 'Different class of bug.',
      '3': 'Unrelated.',
    },
    interviewTakeaway: 'SSRF defense = don’t let users aim your server’s HTTP client at the internal network.',
  }),
  q({
    id: 'd6-q16',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['Path Traversal', 'Command Injection'],
    learningObjective: 'Apply safe file and command handling patterns',
    question:
      'Which practice best mitigates path traversal when serving user-requested files from a downloads directory?',
    options: [
      'Concatenate user input onto "/var/app/downloads/" and open the path directly',
      'Resolve/canonicalize the path, verify it stays under an allowlisted root, and map requests to stored object keys rather than raw filesystem paths',
      'Run the web server as root so permission errors disappear',
      'Disable all logging',
    ],
    correctAnswer: 1,
    explanation:
      'Never trust `../` style input. Canonicalize, enforce a root jail/allowlist, or avoid filesystem paths entirely with opaque IDs.',
    whyWrong: {
      '0': 'Classic traversal pattern.',
      '2': 'Privilege escalation of the blast radius.',
      '3': 'Harms detection.',
    },
    interviewTakeaway: 'For files: allowlisted roots + canonicalize; for shells: avoid shell, use argv arrays.',
  }),
  q({
    id: 'd6-q17',
    type: 'scenario',
    difficulty: 'medium',
    topics: ['JWT', 'Sessions'],
    learningObjective: 'Reason about JWT validation and revocation trade-offs',
    question:
      'Your API validates JWTs with the correct signature and issuer but accepts tokens forever after logout. What defensive gap remains, and what is a practical mitigation?',
    options: [
      'No gap — signature validity is enough forever',
      'Missing revocation/expiry discipline — use short TTLs, refresh-token rotation, and optional denylist/version checks on sensitive actions',
      'Switch all tokens to unsigned "none" algorithm for speed',
      'Store the JWT private signing key in the public SPA bundle',
    ],
    correctAnswer: 1,
    explanation:
      'Signed ≠ currently authorized. Short-lived access tokens, rotating refresh tokens, and server-side session/version checks address logout and theft windows.',
    whyWrong: {
      '0': 'Ignores revocation and lifetime.',
      '2': 'Algorithm confusion / unsigned tokens are dangerous.',
      '3': 'Exposes the signing key — catastrophic.',
    },
    interviewTakeaway: 'JWT answer: validate sig/claims + short TTL + revocation/rotation story.',
  }),
  q({
    id: 'd6-q18',
    type: 'mcq',
    difficulty: 'medium',
    topics: ['OAuth'],
    learningObjective: 'Identify a secure OAuth authorization-code practice',
    question:
      'For a public SPA/native client using OAuth 2.0 authorization code flow, which defensive practice is expected?',
    options: [
      'Embed the client secret in the JavaScript bundle',
      'Use PKCE, keep tokens out of URL fragments where possible, and never ship a confidential client secret to the browser',
      'Send the resource owner password directly to every API',
      'Disable redirect URI validation for convenience',
    ],
    correctAnswer: 1,
    explanation:
      'Public clients use auth code + PKCE; secrets in SPAs are extractable. Strict redirect URI allowlists prevent code theft via open redirects.',
    whyWrong: {
      '0': 'SPA cannot keep a client secret.',
      '2': 'ROPC is discouraged and expands credential exposure.',
      '3': 'Redirect URI validation is critical.',
    },
    interviewTakeaway: 'OAuth for SPAs: auth code + PKCE, strict redirects, no secrets in the frontend.',
  }),
  q({
    id: 'd6-q19',
    type: 'numerical',
    difficulty: 'medium',
    topics: ['Rate Limiting'],
    learningObjective: 'Compute a simple token-bucket allowance',
    question:
      'A login endpoint allows 5 requests per minute per IP (fixed window). In one minute an IP sends 5 failed attempts, waits, then sends 3 more in the same window. How many of those last 3 are rejected by a strict fixed window of 5?',
    correctAnswer: '3',
    acceptedAnswers: ['3', 'three'],
    explanation:
      'After 5 allowed requests, the remaining quota is 0 for that window, so all 3 subsequent attempts are rejected until the window resets.',
    whyWrong: {
      '0': 'Quota was already exhausted.',
      '2': 'Would imply one still allowed.',
    },
    interviewTakeaway: 'Be ready to discuss fixed window vs token bucket and auth-endpoint limits.',
  }),
  q({
    id: 'd6-q20',
    type: 'multi',
    difficulty: 'medium',
    topics: ['Secure APIs', 'Secure Databases'],
    learningObjective: 'List defense-in-depth controls for data APIs',
    question:
      'Which controls belong in a defense-in-depth design for a CRUD API over a relational DB? (Select all that apply)',
    options: [
      'Authentication on every sensitive endpoint',
      'Object-level authorization checks before read/update/delete',
      'Parameterized queries and least-privilege DB credentials',
      'Returning full stack traces and SQL text in production 500 responses',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'Authn, authz, safe query construction, and least privilege reduce breach impact. Verbose errors leak internals useful to attackers.',
    whyWrong: {
      '3': 'Detailed errors in production aid attackers and leak schema/query info.',
    },
    interviewTakeaway: 'Stack: identity → permission → safe data access → minimal error disclosure.',
  }),

  // ===== HARD (10) =====
  q({
    id: 'd6-q21',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Authentication', 'Authorization', 'IDOR'],
    learningObjective: 'Design layered checks for a multi-tenant API',
    question:
      'Multi-tenant SaaS: JWT proves user U in tenant T. Endpoint PATCH /documents/:id updates a document. Which server-side check sequence is most correct?',
    options: [
      'Trust :id alone if the JWT signature verifies',
      'Verify JWT (sig/exp/issuer), resolve membership of U in T, load document, ensure document.tenant_id == T (and role permits write), then apply validated fields',
      'Check only that the document id is a valid UUID format',
      'Authorize solely in the SPA by hiding the edit button',
    ],
    correctAnswer: 1,
    explanation:
      'Authn proves who; tenant membership and object ownership/role checks enforce authz. UI hiding is not a control. UUID format is not authorization.',
    whyWrong: {
      '0': 'Signature ≠ object permission.',
      '2': 'Syntax checks ≠ authorization.',
      '3': 'Client-side UI is bypassable.',
    },
    interviewTakeaway: 'Multi-tenant mantra: authenticate, bind tenant, authorize object, then mutate.',
  }),
  q({
    id: 'd6-q22',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['TLS', 'Encryption', 'Secure APIs'],
    learningObjective: 'Combine in-transit and at-rest protections correctly',
    question:
      'A payment service stores cardholder data. Which statement best reflects layered cryptographic defense (high level, PCI-aware)?',
    options: [
      'TLS to the app means the database can store PANs in plaintext forever with no access control',
      'Use TLS in transit; minimize retention; tokenize/encrypt sensitive fields at rest with keys in a managed KMS/HSM; strict access control and auditing',
      'Hash PANs with MD5 so they can be decrypted for refunds',
      'Put private TLS keys in the public mobile app to “pin harder”',
    ],
    correctAnswer: 1,
    explanation:
      'Transit and rest are different layers. Sensitive data needs minimization, strong at-rest protection with proper key management, and access auditing — TLS alone is insufficient.',
    whyWrong: {
      '0': 'TLS ends at the app; DB plaintext remains a breach risk.',
      '2': 'Hashes are not reversible encryption for refunds.',
      '3': 'Never ship private TLS keys to clients.',
    },
    interviewTakeaway: 'Separate TLS, field encryption/tokenization, and KMS/key access stories.',
  }),
  q({
    id: 'd6-q23',
    type: 'multi',
    difficulty: 'hard',
    topics: ['CSRF', 'XSS', 'Sessions'],
    learningObjective: 'Reason about interacting browser threats',
    question:
      'Cookie session + XSS on the same site. Which statements are accurate for a defensive interview answer? (Select all that apply)',
    options: [
      'XSS can often defeat CSRF token defenses by reading the token/DOM and issuing requests as the user',
      'HttpOnly session cookies reduce token theft via document.cookie but do not remove XSS impact on user actions in-page',
      'Fixing XSS is therefore critical even if anti-CSRF tokens are present',
      'SameSite=Strict alone makes XSS impossible',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'XSS runs in the origin, so it can abuse the session from inside. HttpOnly helps against cookie exfiltration via JS but not in-page actions. SameSite is a CSRF control, not an XSS eliminator.',
    whyWrong: {
      '3': 'SameSite does not stop script injection/execution.',
    },
    interviewTakeaway: 'Rank XSS as higher severity when discussing cookie sessions and CSRF tokens.',
  }),
  q({
    id: 'd6-q24',
    type: 'code',
    difficulty: 'hard',
    topics: ['Command Injection'],
    learningObjective: 'Prefer safe process invocation over shell interpolation',
    question:
      'Which approach is the safer way to run an allowlisted image tool on a user-supplied filename already validated to a safe basename?',
    codeSnippet: {
      language: 'python',
      code: `# A
os.system(f"convert {user_filename} out.png")

# B
subprocess.run(["convert", user_filename, "out.png"], check=True)`,
    },
    options: [
      'A — shell gives more features',
      'B — argv list avoids shell metacharacter interpretation',
      'Both equally safe always',
      'A is safer because f-strings sanitize input',
    ],
    correctAnswer: 1,
    explanation:
      'Shell interpolation enables metacharacter injection. Passing an argument vector to the executable avoids the shell. Still validate/allowlist filenames and prefer libraries over OS tools when possible.',
    whyWrong: {
      '0': 'Shell features are the hazard.',
      '2': 'Not equal.',
      '3': 'f-strings do not sanitize for shell.',
    },
    interviewTakeaway: 'No shell; argv arrays; allowlists; prefer native libraries.',
  }),
  q({
    id: 'd6-q25',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['SSRF', 'Secure APIs'],
    learningObjective: 'Apply defense in depth for URL-fetch features',
    question:
      'Design review: “webhook tester” lets customers POST a target URL that your backend will request. Which design is most defensible?',
    options: [
      'Fetch any URL, including http://169.254.169.254/, to be “flexible”',
      'Allow only https to customer-owned allowlisted hosts/IPs, block private/link-local/metadata ranges, set timeouts/size limits, and isolate egress in a locked-down network',
      'Pass the URL to the DB as dynamic SQL for “logging”',
      'Disable authentication on the tester so partners integrate faster',
    ],
    correctAnswer: 1,
    explanation:
      'SSRF-prone features need allowlists, IP family blocks, timeouts, response size caps, and network isolation. Cloud metadata endpoints are a classic sensitive target to deny.',
    whyWrong: {
      '0': 'Metadata IP is a textbook SSRF hazard.',
      '2': 'Adds SQLi risk; unrelated to safe fetching.',
      '3': 'Unauthenticated abuse amplifies impact.',
    },
    interviewTakeaway: 'For server-side fetches: allowlist + private-IP deny + egress isolation.',
  }),
  q({
    id: 'd6-q26',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['JWT', 'OAuth', 'Authorization'],
    learningObjective: 'Separate identity tokens from authorization decisions',
    question:
      'An access token includes scope read:reports. A client calls DELETE /reports/9. The token signature and expiry are valid. What should the resource server do?',
    options: [
      'Allow delete because any valid JWT means full admin',
      'Deny unless scopes/roles permit delete and object-level authz allows acting on report 9',
      'Allow delete if the refresh token exists in localStorage',
      'Ignore scopes because OIDC always grants write',
    ],
    correctAnswer: 1,
    explanation:
      'Resource servers must enforce scope/audience and application authz. A valid signature only proves the token was issued and not expired/tampered — not that the action is allowed.',
    whyWrong: {
      '0': 'Confuses authenticity with authorization.',
      '2': 'Client storage is not a server authz signal.',
      '3': 'OIDC identity ≠ unlimited write.',
    },
    interviewTakeaway: 'Valid token ≠ permitted operation; check scope + object authz.',
  }),
  q({
    id: 'd6-q27',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['Path Traversal', 'IDOR', 'Secure Databases'],
    learningObjective: 'Combine object authorization with safe storage access',
    question:
      'Downloads are stored in object storage as tenant/docId/file. Clients send docId. Attackers try docIds from other tenants and keys like "../../admin". What is the strongest combined defense?',
    options: [
      'Trust docId from the client and concatenate paths',
      'Authenticate, authorize docId to the caller’s tenant via DB, use server-side storage keys only (no client paths), and never interpolate raw paths from input',
      'Rely on obscurity of UUIDs alone with no authz',
      'Disable TLS to simplify clients',
    ],
    correctAnswer: 1,
    explanation:
      'Opaque IDs still need authz. Storage keys must be derived server-side after permission checks so path traversal and cross-tenant reads fail closed.',
    whyWrong: {
      '0': 'Enables traversal and IDOR.',
      '2': 'UUIDs are not an authorization mechanism.',
      '3': 'Weakens confidentiality in transit.',
    },
    interviewTakeaway: 'Authorize the object first; derive storage keys server-side.',
  }),
  q({
    id: 'd6-q28',
    type: 'multi',
    difficulty: 'hard',
    topics: ['SQL Injection', 'XSS', 'CSRF', 'Secure APIs'],
    learningObjective: 'Pick the right mitigation per vulnerability class',
    question:
      'Match defenses correctly — which statements are true? (Select all that apply)',
    options: [
      'Parameterized queries primarily mitigate SQL injection',
      'Context-aware output encoding / component escaping primarily mitigate XSS',
      'Anti-CSRF tokens or SameSite strategies primarily mitigate CSRF on cookie sessions',
      'Parameterized queries alone fully mitigate XSS and CSRF',
    ],
    correctAnswer: [0, 1, 2],
    explanation:
      'Each class has a primary control family. SQL parameters do not encode HTML for browsers or prove intent against CSRF.',
    whyWrong: {
      '3': 'Different trust boundaries — DB vs browser vs cross-site request.',
    },
    interviewTakeaway: 'Map vuln → primary control; don’t claim one silver bullet.',
  }),
  q({
    id: 'd6-q29',
    type: 'mcq',
    difficulty: 'hard',
    topics: ['Hashing', 'Authentication', 'Rate Limiting'],
    learningObjective: 'Combine password hashing with online attack defenses',
    question:
      'Despite Argon2id password hashes with unique salts, accounts are taken over via credential stuffing. What additional defensive layer is most relevant?',
    options: [
      'Switch to unsalted MD5 for faster logins',
      'Bot/rate limiting, breach-password checks, MFA, and monitoring anomalous login patterns',
      'Disable TLS so stuffing traffic is easier to inspect in cleartext at the edge',
      'Store password hints equal to the password',
    ],
    correctAnswer: 1,
    explanation:
      'Strong hashing slows offline cracking after a DB leak; credential stuffing is an online attack using passwords leaked elsewhere. MFA, rate limits, and breached-password detection address that path.',
    whyWrong: {
      '0': 'Weakens offline resistance.',
      '2': 'Cleartext inspection is not worth dropping TLS.',
      '3': 'Hints that are the password are catastrophic.',
    },
    interviewTakeaway: 'Hashing ≠ stuffing defense; add MFA + rate limits + anomaly detection.',
  }),
  q({
    id: 'd6-q30',
    type: 'scenario',
    difficulty: 'hard',
    topics: ['CIA Triad', 'Secure APIs', 'Authorization'],
    learningObjective: 'Deliver a full defensive design narrative under interview pressure',
    question:
      'Interviewer: “Secure this notes API.” Which answer best covers CIA + authn/authz + common web risks without pivoting to exploit steps?',
    options: [
      '“Just use JWT; security is done.”',
      '“TLS for confidentiality/integrity in transit; authn + object authz; parameterized SQL; output encoding/CSP; CSRF controls if cookies; rate limits; least-privilege DB; short-lived tokens/session hardening; monitor auth failures.”',
      '“Disable all authentication to reduce complexity.”',
      '“Security is only a firewall rule.”',
    ],
    correctAnswer: 1,
    explanation:
      'Strong answers layer CIA controls with identity, authorization, injection/XSS/CSRF defenses, rate limiting, and operational monitoring — without describing how to attack.',
    whyWrong: {
      '0': 'JWT alone is incomplete.',
      '2': 'Removes a core control.',
      '3': 'Perimeter-only thinking fails modern app threats.',
    },
    interviewTakeaway:
      'Practice a 30-second secure-API checklist: TLS, authn, authz, safe data access, browser defenses, limits, keys/secrets, monitoring.',
  }),
]

export default day6Questions
