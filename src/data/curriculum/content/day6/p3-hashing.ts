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

export const d6p3: StudyPage = createPage(
  'd6-p3',
  'Hashing, Salting & Passwords',
  16,
  [
    'Contrast hashing vs encryption clearly',
    'Explain salting, peppering, and slow password hashes',
    'Describe safe password storage and verification practices',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Hashing is a one-way function: input → fixed-size digest. You cannot practically reverse a good cryptographic hash to get the original input. Encryption is two-way: ciphertext decrypts with a key. For passwords you almost always want hashing (plus salt), not encryption — because you should not be able to recover the plaintext password.',
        ),
        h3('Why it exists'),
        p(
          'If a database of encrypted passwords leaks and the encryption key also leaks (common if key lives near the DB), every password is revealed. With salted slow hashes, attackers must brute-force each password independently; good password choice + Argon2/bcrypt makes that expensive.',
        ),
        callout(
          'mistake',
          'Hashing ≠ encryption ≠ encoding. Base64 is encoding (reversible, no key). AES is encryption (reversible with key). SHA-256 is hashing (one-way). Encrypting passwords “so we can email them back” is a design smell.',
          'Critical distinction',
        ),
        table(
          ['Primitive', 'Reversible?', 'Key?', 'Password storage?'],
          [
            ['Encryption (AES-GCM)', 'Yes with key', 'Yes', 'No (except rare legacy vault patterns)'],
            ['Hash (SHA-256)', 'No', 'No', 'No alone — too fast, no salt'],
            ['Password hash (bcrypt/Argon2)', 'No', 'Optional pepper', 'Yes'],
            ['Base64', 'Yes', 'No', 'Never for secrecy'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Properties of cryptographic hashes'),
        ul([
          'Deterministic: same input → same digest.',
          'Avalanche: tiny input change → very different digest.',
          'Preimage resistance: hard to find input from digest.',
          'Collision resistance: hard to find two inputs with same digest.',
        ]),
        h3('Why plain SHA-256 is wrong for passwords'),
        p(
          'General-purpose hashes are fast by design (file integrity, digests). GPUs/ASICs can try billions of candidates per second. Passwords need intentionally slow, memory-hard algorithms so offline guessing is costly.',
        ),
        h3('Salt'),
        p(
          'A salt is a unique random value stored alongside each password hash. It ensures identical passwords produce different hashes and defeats precomputed rainbow tables. Salt is not secret; uniqueness and sufficient length (e.g. 16+ bytes) matter.',
        ),
        h3('Pepper (optional)'),
        p(
          'A pepper is a secret application-wide value stored outside the DB (KMS/HSM). If the DB leaks without the pepper, offline cracking is harder. Operational cost: pepper rotation is awkward — often done via key versioning.',
        ),
        diagram(
          `flowchart TD
  PW[Password] --> S[Unique salt]
  PW --> H[Argon2id / bcrypt]
  S --> H
  P[Optional pepper from KMS] --> H
  H --> STORE[(Store salt + hash + params)]`,
          'Password registration: salt + slow hash (+ optional pepper)',
        ),
        h3('Verification'),
        ol([
          'Load stored salt, parameters, and hash for the user.',
          'Hash the candidate password with the same parameters.',
          'Compare digests with constant-time equality to avoid timing leaks.',
          'Optionally rehash if parameters are outdated (algorithm upgrade).',
        ]),
        code(
          'java',
          `// Conceptual — use a vetted library (e.g. Spring Security PasswordEncoder)
String hash = argon2.hash(password, uniqueSalt, params);
// store: algorithm id, params, salt, hash — never the plaintext

boolean ok = constantTimeEquals(
  argon2.hash(candidate, storedSalt, storedParams),
  storedHash
);`,
          'Store algorithm metadata so you can upgrade hashes over time',
        ),
        h3('Recommended algorithms (interview-safe)'),
        ul([
          'Argon2id — modern default recommendation (memory-hard).',
          'bcrypt — widely deployed; watch 72-byte password limit.',
          'scrypt — memory-hard alternative.',
          'Avoid: MD5, SHA-1, plain SHA-256/512, unsalted hashes, reversible encryption.',
        ]),
      ]),
      section('example', 'Worked example', [
        example('Two users choose password "Winter2024!"', [
          p(
            'Without salt: both hashes identical → attacker cracks once, compromises both; rainbow tables apply.',
          ),
          p(
            'With unique salts: hashes differ; attacker must run a separate expensive search per user. With Argon2id tuned for ~100ms+ server cost, large dumps become costly to crack at scale.',
          ),
          p(
            'Login path: never log passwords; rate-limit attempts; on success, issue session — password verification is only for authn bootstrap.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Work factor vs latency: higher cost resists GPU cracking but slows login and increases DoS surface — tune and rate-limit.',
          'bcrypt 72-byte limit: very long passphrases may be silently truncated — know the pitfall.',
          'Client-side hashing alone is not enough: the hash becomes the password to the server unless you use a proper PAKE protocol.',
          'Password reset tokens are secrets too — random, single-use, short-lived, stored hashed.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Integrity uses fast hashes (SHA-256) for file/message digests; passwords need slow KDFs.',
          'HMAC and digital signatures use hash primitives differently (keyed authenticity).',
          'Encryption (next page) protects data you must recover; hashing protects data you only need to verify.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “We store Argon2id hashes with unique salts.”'),
        p('Interviewer: “Why not SHA-256?”'),
        p(
          'Strong answer: “SHA-256 is too fast for offline guessing. Password KDFs are deliberately slow and memory-hard so stolen hashes don’t convert to passwords cheaply.”',
        ),
        p('Interviewer: “Is the salt secret?”'),
        p(
          'Strong answer: “No. Uniqueness matters. Secrecy is what a pepper or HSM-backed secret provides, stored separately from the hash database.”',
        ),
        p('Interviewer: “How do you upgrade from bcrypt to Argon2?”'),
        p(
          'Strong answer: “On successful login, rehash with new algorithm and update the stored record. Force reset only for inactive accounts if policy requires.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Saying hashing and encryption are the same.',
      'Using unsalted MD5/SHA-1 for passwords.',
      'Thinking salts must be secret.',
      'Implementing crypto primitives yourself instead of using vetted libraries.',
      'Comparing hashes with == in a way that leaks timing (language-dependent).',
    ],
    interviewQuestions: [
      'Hashing vs encryption — what’s the difference?',
      'Why salt passwords?',
      'Why is SHA-256 alone insufficient for password storage?',
      'What is a pepper?',
      'Name acceptable password hashing algorithms.',
    ],
    intermediateInterviewQuestions: [
      'How does a rainbow table attack work at a conceptual level, and how does salt stop it?',
      'How do you migrate password hashes to a stronger algorithm?',
      'Why constant-time comparison for password hashes?',
      'What should you store alongside the password hash?',
      'How do password reset tokens differ from password hashes?',
    ],
    advancedInterviewQuestions: [
      'Compare Argon2id, bcrypt, and scrypt parameters you would choose for a high-traffic login service.',
      'How do PAKEs (e.g. SRP, OPAQUE) change the password storage threat model?',
      'Design a breach response if password hashes leak.',
      'When is HMAC-SHA256 appropriate vs a password KDF?',
      'How would you detect password spraying vs credential stuffing in logs?',
    ],
    interviewReadyAnswers: [
      {
        question: 'How should passwords be stored?',
        answer:
          'Never store plaintext or reversible encryption for normal passwords. Use a slow, memory-hard password hash like Argon2id or bcrypt with a unique per-user salt, store the algorithm parameters with the hash, and compare using constant-time equality. Optionally add a pepper in KMS. On login, rate-limit attempts. Hashing is one-way verification; encryption would imply we can recover passwords, which we shouldn’t need.',
      },
      {
        question: 'Is hashing the same as encryption?',
        answer:
          'No. Encryption is reversible with a key — used when you must get the original data back. Hashing is one-way — used for integrity checks and password verification. For passwords we use specialized slow hashes with salts, not general-purpose digests and not encryption.',
      },
    ],
    keyTakeaways: [
      'Hashing ≠ encryption ≠ encoding.',
      'Passwords: unique salt + slow KDF (Argon2id/bcrypt); never plaintext.',
      'Salt is public uniqueness; pepper is optional secret outside the DB.',
    ],
  },
)
