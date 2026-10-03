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
  code,
} from '../../../helpers'

export const d6p13: StudyPage = createPage(
  'd6-p13',
  'Secure Database Practices',
  12,
  [
    'Use least-privilege DB accounts, parameterized queries, and encryption at rest/in transit',
    'Avoid exposing internal errors and sensitive columns',
    'Explain backup, migration, and secret handling for databases',
  ],
  {
    sections: [
      section('concept', 'Concept', [
        p(
          'Databases concentrate valuable data — so they concentrate risk. Secure DB practices combine access control, safe query patterns, encryption, auditing, and operational hygiene (backups, migrations, network exposure). Application bugs become data breaches when the DB role can do too much.',
        ),
        h3('Why it exists'),
        p(
          'Even with a perfect app, an over-privileged credential, plaintext backup, or open port can undo everything. Interviews expect you to think beyond “use SQL parameters” into how the database is exposed and administered.',
        ),
      ]),
      section('how', 'How it works', [
        h3('Network & identity'),
        ul([
          'Private network / VPC; no public 5432/3306 to the world.',
          'TLS to the database (in transit) when supported.',
          'IAM auth or rotated passwords/secrets from a vault — not long-lived shared passwords in apps.',
          'Separate credentials per service; never share admin creds with apps.',
        ]),
        h3('Least privilege'),
        ul([
          'App role: only needed DML on needed tables/views; no DDL in production app users.',
          'Migrations run with a distinct migrator role.',
          'Read replicas with read-only users for reporting.',
          'Avoid SELECT * in app code for sensitive tables — project columns deliberately.',
        ]),
        code(
          'sql',
          `-- Conceptual privilege split
GRANT SELECT, INSERT, UPDATE ON app.orders TO app_runtime;
-- no DELETE/DROP/TRUNCATE for runtime
GRANT SELECT ON app.orders_masked TO reporting_reader;`,
          'Runtime users should not be schema admins',
        ),
        h3('Query safety'),
        ul([
          'Parameterized queries only for values.',
          'Views / stored procedures can encapsulate access but must not concatenate unsafely inside.',
          'Row statements and timeouts to stop runaway queries (availability + DoS).',
        ]),
        h3('Encryption & data protection'),
        table(
          ['Layer', 'Control'],
          [
            ['In transit', 'TLS between app and DB'],
            ['At rest', 'Disk/volume encryption; provider-managed keys'],
            ['Column-level', 'Encrypt highly sensitive fields (envelope/KMS); minimize plaintext need'],
            ['Backups', 'Encrypted backups; access-controlled; tested restores'],
            ['Masking', 'Redact PII in non-prod; never copy prod dumps casually'],
          ],
        ),
        h3('Audit & errors'),
        ul([
          'Audit DDL, privilege changes, and access to sensitive tables where feasible.',
          'App catches DB errors; clients see generic messages.',
          'Do not log full row payloads with secrets/PII.',
        ]),
        callout(
          'mistake',
          'Using the database superuser for the application “because it works” maximizes blast radius for SQLi and compromised app servers.',
          'Superuser app antipattern',
        ),
      ]),
      section('example', 'Worked example', [
        example('Orders service DB posture', [
          ul([
            'Runtime role: CRUD on orders/order_items; SELECT on products; no access to payroll schema.',
            'Card data not stored — token from payment provider (minimize PCI scope).',
            'PII columns minimized; national IDs encrypted with KMS data keys if required.',
            'Migrations in CI with review; prod migrator creds only in pipeline.',
            'Backups encrypted daily; quarterly restore test.',
            'Non-prod uses synthetic data or scrubbed subsets.',
          ]),
        ]),
      ]),
      section('tradeoffs', 'Trade-offs & edge cases', [
        ul([
          'Column encryption hurts search/sort — design access patterns first.',
          'Heavy auditing has storage/perf cost — sample or focus on sensitive ops.',
          'ORMs can over-fetch columns — DTOs/projections reduce leakage.',
          'Shared DB across microservices couples security blast radius — prefer ownership boundaries.',
        ]),
      ]),
      section('connections', 'Connections Between Concepts', [
        ul([
          'Parameterized queries ↔ injection page.',
          'Encryption at rest ↔ symmetric crypto / KMS.',
          'Least privilege ↔ authz mindset at the data layer.',
        ]),
      ]),
      section('followups', 'Interview follow-up chain', [
        p('Candidate: “App uses a least-privilege role and parameterized SQL; DB is private with TLS.”'),
        p('Interviewer: “What about backups?”'),
        p(
          'Strong answer: “Backups are encrypted, access-controlled like prod, and we test restores. A plaintext backup is a second production database sitting elsewhere.”',
        ),
        p('Interviewer: “Non-prod?”'),
        p(
          'Strong answer: “No raw prod PII by default. Synthetic or masked data; separate credentials; still no public exposure.”',
        ),
      ]),
    ],
    commonMistakes: [
      'Publicly exposed database ports.',
      'App connected as superuser/dbo.',
      'Unencrypted backups of sensitive data.',
      'Leaking SQL exceptions to API clients.',
      'Copying production data to laptops for debugging.',
    ],
    interviewQuestions: [
      'What is least privilege for database accounts?',
      'How do you protect data in transit to a DB?',
      'Why parameterize queries?',
      'How should backups be secured?',
      'What should clients see when a DB error occurs?',
    ],
    intermediateInterviewQuestions: [
      'How do you separate migrator vs runtime DB credentials?',
      'When is column-level encryption worth the complexity?',
      'How do you prevent sensitive data from landing in logs?',
      'How should reporting access production data?',
      'What network controls belong around a database?',
    ],
    advancedInterviewQuestions: [
      'Design key management for encrypted columns across app fleets.',
      'How do you securely run analytics on sensitive datasets?',
      'Threat-model a compromised read replica.',
      'How do database activity monitoring and IAM DB auth change the model?',
      'Secure multi-tenant row-level security patterns (strengths/limits).',
    ],
    interviewReadyAnswers: [
      {
        question: 'How do you secure a database for a web app?',
        answer:
          'Keep the DB private on the network, require TLS, and never use superuser credentials in the app. Give the runtime role only the DML it needs on specific objects; run migrations with a separate role. Use parameterized queries exclusively, encrypt at rest, encrypt or tokenize the most sensitive columns, and protect backups like production. Hide internal DB errors from clients, audit privileged actions, and keep non-prod free of raw production PII.',
      },
    ],
    keyTakeaways: [
      'Least-privilege roles + parameterized queries + private network/TLS.',
      'Encrypt at rest/in transit; treat backups as prod data.',
      'Minimize sensitive columns in queries, logs, and non-prod.',
    ],
  },
)
