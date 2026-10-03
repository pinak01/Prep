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

export const d6p4: StudyPage = createPage(
  'd6-p4',
  'Symmetric & Asymmetric Encryption',
  16,
  [
    'Compare symmetric vs asymmetric crypto use cases',
    'Explain public/private keys and digital signatures at interview depth',
    'Describe hybrid encryption (TLS-style) conceptually',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Symmetric encryption uses one shared secret key for encrypt and decrypt (AES). Asymmetric (public-key) encryption uses a key pair: public key encrypts or verifies; private key decrypts or signs (RSA, ECC). Real systems combine both: asymmetric to establish or wrap keys, symmetric for bulk data — because symmetric is far faster.',
        ),
        h3('Why it exists'),
        p(
          'Confidentiality on untrusted channels needs cryptography. Shared keys don’t scale for strangers on the internet (how do you ship the AES key?). Public keys solve distribution; symmetric keys solve performance. Digital signatures solve integrity and authenticity: prove a message came from the private-key holder and wasn’t altered.',
        ),
        table(
          ['', 'Symmetric', 'Asymmetric'],
          [
            ['Keys', 'One shared secret', 'Public + private pair'],
            ['Speed', 'Fast (bulk data)', 'Slower'],
            ['Use cases', 'Disk/DB fields, TLS record keys', 'Key exchange, signatures, identity'],
            ['Main risk', 'Key distribution & storage', 'Private key theft; wrong usage'],
            ['Examples', 'AES-GCM, ChaCha20-Poly1305', 'RSA-OAEP, ECDH, Ed25519'],
          ],
        ),
      ]),
      section('how', 'How it works', [
        h3('Symmetric: AES-GCM (AEAD)'),
        p(
          'Modern advice: use authenticated encryption (AEAD) like AES-GCM. It provides confidentiality and integrity together. Older patterns (“AES-CBC + separate HMAC”) are easy to get wrong. Never roll your own modes; use high-level APIs.',
        ),
        ul([
          'Key length: AES-128 or AES-256; manage keys in KMS, not in source code.',
          'Nonce/IV: must be unique per key for GCM — reuse is catastrophic.',
          'Associated data: authenticate headers (e.g. record type) without encrypting them.',
        ]),
        h3('Asymmetric: encrypt vs sign'),
        ul([
          'Encrypt with recipient’s public key → only recipient’s private key decrypts (confidentiality).',
          'Sign with sender’s private key → anyone with public key verifies (integrity + authenticity).',
          'Do not confuse “encrypt with private key” folk explanations — prefer “sign” vs “encrypt” vocabulary.',
        ]),
        diagram(
          `flowchart LR
  subgraph Hybrid
    A[Sender] -->|ECDH / RSA-wrap| B[Shared symmetric key]
    B -->|AES-GCM bulk| C[Ciphertext]
  end
  C --> D[Receiver decrypts with same symmetric key]`,
          'Hybrid encryption: asymmetric for keys, symmetric for data',
        ),
        h3('Digital signatures'),
        p(
          'Sign(hash(message), privateKey) → signature. Verify(message, signature, publicKey) → ok/fail. Used for code signing, JWTs (asymmetric algs), certificate chains, and non-repudiation-ish guarantees (stronger with proper key custody).',
        ),
        h3('Key management (where interviews go deep)'),
        ul([
          'Generate keys securely; never hardcode.',
          'Store private keys in KMS/HSM; grant decrypt/sign permissions least-privilege.',
          'Rotate keys; version ciphertext (kid header).',
          'Separate keys by purpose: different keys for field encryption vs token signing.',
        ]),
        code(
          'bash',
          `# Conceptual openssl exploration (not a production key ceremony)
openssl genpkey -algorithm Ed25519 -out ed25519.pem
# Private key stays secret; distribute only the public key`,
          'Asymmetric keys: private stays private; public can be published',
        ),
      ]),
      section('example', 'Worked example', [
        example('Encrypt a file for a partner', [
          p(
            'Naive: email an AES key in the same channel as the file — defeats the purpose if the channel is monitored.',
          ),
          p(
            'Better hybrid: generate a random AES-GCM data key; encrypt the file with it; encrypt (wrap) the data key with the partner’s public key (or ECDH). Send ciphertext + wrapped key. Partner uses private key to unwrap, then AES-decrypts. This is the same pattern cloud KMS envelope encryption uses.',
          ),
        ]),
        example('Signature for integrity', [
          p(
            'Release server signs artifact digest with release private key. Clients verify with published public key. Tampering fails verification even if the attacker can host a modified binary.',
          ),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'RSA for bulk encryption is wrong — use hybrid.',
          '“Security through obscure algorithms” loses to vetted standards.',
          'Public keys need authenticity too — otherwise you encrypt to an attacker’s key (PKI / certificates solve this).',
          'Quantum discussion (interview spice): large-scale quantum threatens RSA/ECC; AES-256 has more margin. Mention briefly; don’t overclaim timelines.',
        ]),
        callout(
          'tip',
          'Interview gold: “Encryption without authentication is dangerous.” Prefer AEAD. Likewise, TLS provides a secure channel — app-level crypto is for end-to-end or at-rest needs TLS doesn’t cover.',
        ),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'TLS (next) uses asymmetric crypto in handshake + symmetric for records.',
          'JWT may use HMAC (symmetric) or RSA/EC (asymmetric) signatures.',
          'Password hashing is not encryption — different goal.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “We use AES-GCM for field encryption and KMS for key wrapping.”'),
        p('Interviewer: “Why not only RSA?”'),
        p(
          'Strong answer: “Asymmetric ops are slow and size-limited. Envelope encryption gives performance of AES with distribution benefits of public key / KMS.”',
        ),
        p('Interviewer: “What if the AES nonce repeats?”'),
        p(
          'Strong answer: “For GCM, nonce reuse under the same key can break confidentiality and authenticity guarantees — catastrophic. Use unique nonces or a lib that manages them.”',
        ),
        p('Interviewer: “Sign or encrypt?”'),
        p(
          'Strong answer: “Encrypt for confidentiality. Sign for integrity/authenticity. Often both: sign-then-encrypt or use protocols that combine them correctly.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Using ECB mode or homegrown crypto.',
      'Confusing signatures with encryption.',
      'Storing private keys in git or world-readable disk.',
      'Reusing IVs/nonces with AES-GCM.',
      'Assuming encryption provides integrity without AEAD/HMAC.',
    ],
    interviewQuestions: [
      'Symmetric vs asymmetric encryption?',
      'What is a digital signature?',
      'What is hybrid / envelope encryption?',
      'Why is AES-GCM preferred over naive AES-CBC?',
      'Where should private keys live?',
    ],
    intermediateInterviewQuestions: [
      'How does TLS use both symmetric and asymmetric crypto?',
      'When do you need application-level encryption if you already have TLS?',
      'What is key rotation for encrypted database columns?',
      'HMAC vs asymmetric signature — when each?',
      'What fails if you encrypt with the wrong public key?',
    ],
    advancedInterviewQuestions: [
      'Design envelope encryption for multi-tenant data at rest.',
      'How do you handle crypto-shredding (delete by destroying keys)?',
      'Compare RSA-PSS vs Ed25519 for artifact signing.',
      'What is forward secrecy and why do modern handshakes care?',
      'How would you threaten-model a service that decrypts PII in the application layer?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Explain symmetric vs asymmetric encryption and when you’d use each.',
        answer:
          'Symmetric uses one shared key — fast, ideal for bulk data (AES-GCM). Asymmetric uses a public/private pair — public can encrypt or verify, private decrypts or signs; great for key exchange and signatures but slower. In practice we use hybrid encryption: asymmetric or KMS to establish/wrap a data key, AES for the payload. Signatures prove integrity and authenticity. Key management — storage, rotation, least privilege — is usually harder than picking the algorithm.',
      },
    ],
    keyTakeaways: [
      'Symmetric = speed; asymmetric = key distribution & signatures; hybrid = both.',
      'Prefer AEAD (AES-GCM); never roll your own crypto.',
      'Private key custody and nonce uniqueness matter as much as algorithms.',
    ],
  },
)
