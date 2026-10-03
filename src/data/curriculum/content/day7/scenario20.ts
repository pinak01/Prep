import type { StudyPage } from '@/types/curriculum'
import { createPage, ol, p, section } from '../../../helpers'

const scenarios = [
  'Design a scalable public REST API for a read-heavy catalog.',
  'Narrate browser → DNS → TLS → app → DB for a login request; mark latency.',
  'Users say the site is “slow” — your first 15 minutes of debugging.',
  'How would you secure a new REST API before launch?',
  'Database CPU is hot — how do you scale without rewriting the app tomorrow?',
  'Primary DB fails — walk through failover and client behavior.',
  'Design high availability for a checkout service (targets + trade-offs).',
  'Sudden spike of 401/429 — what do you check?',
  'Orders duplicated after client retries — fix design.',
  'Need GDPR delete for a user across services — approach.',
  'Feature flag rollout caused errors — rollback + diagnosis plan.',
  'Mobile app on flaky networks — API/timeout/idempotency design.',
  'Add a notification system without coupling to checkout latency.',
  'Migrate a monolith DB table that is 2TB with minimal downtime.',
  'Cache shows stale prices — invalidation design.',
  'Multi-region active-passive for reads — consistency story.',
  'Third-party payment webhook handling — security + reliability.',
  'On-call: disk full on DB host — Linux + DB actions.',
  'Design pagination that stays correct under inserts.',
  'Explain how OS, networking, and DBMS interact in one backend request.',
]

const scenarioAnswers: { question: string; answer: string }[] = [
  {
    question: 'Design a scalable public REST API for a read-heavy catalog.',
    answer:
      'Detect: clarify QPS, catalog size, freshness SLO, and hot keys. Isolate: separate read path (CDN/edge cache → API → cache → read replicas) from rare writes. Fix: cache-aside with TTLs, composite indexes for list filters, cursor pagination, rate limits, and CDN for public assets. Verify: load test p95/p99, cache hit rate, and replica lag under peak; watch origin QPS after deploy.',
  },
  {
    question: 'Narrate browser → DNS → TLS → app → DB for a login request; mark latency.',
    answer:
      'Detect latency budget per hop. Isolate: DNS (+cache) → TCP/TLS handshake → HTTP to LB/app → auth check → parameterized DB lookup/update → set session cookie. Fix: keep TLS session resumption, connection reuse, pool DB conns, index login lookups, avoid chatty round-trips. Verify: trace spans for DNS/TLS/app/DB; mark RTT-heavy vs CPU/DB waits in the waterfall.',
  },
  {
    question: 'Users say the site is “slow” — your first 15 minutes of debugging.',
    answer:
      'Detect: confirm blast radius (region, endpoint, user segment) via RUM/APM and error rates. Isolate: recent deploy/config, saturation (CPU/mem/disk/DB), dependency SLIs, and whether slowness is FE, edge, or API. Fix: mitigate (rollback, shed load, scale hot tier) before deep root-cause. Verify: p95 recovers and error budget stops burning; capture a timeline for the postmortem.',
  },
  {
    question: 'How would you secure a new REST API before launch?',
    answer:
      'Detect: threat model (public vs partner, PII, abuse). Isolate: trust boundaries at edge, app, and data. Fix: TLS everywhere; authn with short-lived sessions/tokens; object-level authz; validate input; parameterized SQL; rate limits; secret management; generic errors; audit sensitive actions; monitor auth anomalies. Verify: authz tests across users, security scan in CI, and residual risk stated for launch review.',
  },
  {
    question: 'Database CPU is hot — how do you scale without rewriting the app tomorrow?',
    answer:
      'Detect: top SQL by CPU/time, lock waits, and cache hit rates. Isolate: missing indexes vs bad plans vs connection storms vs hot partitions. Fix short-term: add/fix indexes, increase pool discipline, cache hottest reads, add replica for read offload, vertical scale if needed. Verify: CPU and p95 drop with EXPLAIN ANALYZE before/after; schedule schema/app rewrites only if still bound.',
  },
  {
    question: 'Primary DB fails — walk through failover and client behavior.',
    answer:
      'Detect: health checks fail, replication lag, fencing. Isolate: promote a replica (sync preferred), update DNS/VIP/proxy routing, fence old primary. Fix clients: reconnect with backoff, fail fast on writes during fence, retry only idempotent ops. Verify: write path on new primary, no split-brain, lag/catch-up metrics green, and data checksums/spot checks for recent writes.',
  },
  {
    question: 'Design high availability for a checkout service (targets + trade-offs).',
    answer:
      'Detect: set SLO (e.g., 99.9% successful checkouts) and RPO/RTO. Isolate: single points—app AZ, payment gateway, DB primary. Fix: multi-AZ app + LB, sync/semi-sync DB or failover runbook, idempotent order create, circuit breakers to payments, outbox for async side effects. Trade-off: sync replication durability vs write latency/availability. Verify: game-day failover and chaos on dependency timeouts.',
  },
  {
    question: 'Sudden spike of 401/429 — what do you check?',
    answer:
      'Detect: which endpoints and identity types spike; correlate with deploy, cert expiry, clock skew, and WAF/rate-limit changes. Isolate: bad credentials vs revoked keys vs overly tight limits vs bot abuse. Fix: restore auth config, tune limits with progressive friction, rotate secrets if leaked, block obvious abuse. Verify: 401/429 return to baseline and login success rate recovers without opening abuse floodgates.',
  },
  {
    question: 'Orders duplicated after client retries — fix design.',
    answer:
      'Detect: duplicate order ids/amounts in a retry window. Isolate: non-idempotent POST + at-least-once client/network. Fix: client Idempotency-Key; unique business constraint; upsert/inbox table in same txn as order insert; return original result on replay. Verify: replay tests and production duplicate-order metric near zero under induced retries.',
  },
  {
    question: 'Need GDPR delete for a user across services — approach.',
    answer:
      'Detect: inventory systems holding PII (app DB, logs, analytics, backups, emails). Isolate: authoritative identity and legal basis/retention exceptions. Fix: orchestrated delete/anonymize workflow with per-service handlers, tombstones where referential integrity needs it, and documented backup expiry. Verify: access checks return gone/anonymized; audit trail of completion; re-test after backup restore policies.',
  },
  {
    question: 'Feature flag rollout caused errors — rollback + diagnosis plan.',
    answer:
      'Detect: error/latency spike aligned with flag percentage. Isolate: flag off globally first (fast mitigation), then reproduce with flag on in staging. Fix: patch bad code path or targeting rules; add kill-switch and canary metrics next time. Verify: errors drop after disable; staged re-enable with per-cohort SLIs before 100%.',
  },
  {
    question: 'Mobile app on flaky networks — API/timeout/idempotency design.',
    answer:
      'Detect: mobile RTT variance, timeouts, duplicate submits. Isolate: client retry vs server processing ambiguity. Fix: short connect timeouts, longer but bounded total deadline, exponential backoff + jitter, Idempotency-Key on mutations, resumable uploads, and clear offline UX. Verify: chaos/latency injection shows no duplicate side effects and acceptable success after retry.',
  },
  {
    question: 'Add a notification system without coupling to checkout latency.',
    answer:
      'Detect: checkout p99 must not wait on email/SMS. Isolate: sync notification call in request path. Fix: transactional outbox or queue publish after commit; workers send with retries/DLQ; checkout returns when order is durable. Verify: checkout latency unchanged under notification outage; messages eventually delivered; no lost notify on crash (outbox drain).',
  },
  {
    question: 'Migrate a monolith DB table that is 2TB with minimal downtime.',
    answer:
      'Detect: table size, write rate, FK/index constraints, downtime budget. Isolate: cannot lock-copy 2TB in a maintenance window. Fix: expand–contract (new schema), dual-write or CDC backfill in chunks, shadow reads, cutover with short lock/rename, then drop old. Verify: row counts/checksums, lag=0 at cutover, and rollback plan tested.',
  },
  {
    question: 'Cache shows stale prices — invalidation design.',
    answer:
      'Detect: user-visible price mismatch vs source of truth. Isolate: TTL-only cache or missed invalidation on update. Fix: write-through or explicit purge on price change; versioned keys; short TTL as safety net; never cache personalized prices without authz-aware keys. Verify: update→read path shows new price within SLO; monitor stale-hit complaints and purge lag.',
  },
  {
    question: 'Multi-region active-passive for reads — consistency story.',
    answer:
      'Detect: RPO/RTO and whether stale reads are OK. Isolate: passive region serves reads from async replica. Fix: document staleness bound; pin post-write reads to primary or wait-for-LSN; failover promotes passive with fencing. Verify: lag dashboards, failover drill, and read-your-writes tests for critical flows.',
  },
  {
    question: 'Third-party payment webhook handling — security + reliability.',
    answer:
      'Detect: forged or duplicate webhooks. Isolate: verify signatures, timestamps, and source allow-lists; never trust body alone. Fix: idempotent handlers keyed by provider event id; acknowledge quickly and process async; map to internal order state machine. Verify: replay/duplicate events do not double-charge; invalid signatures rejected and alerted.',
  },
  {
    question: 'On-call: disk full on DB host — Linux + DB actions.',
    answer:
      'Detect: ENOSPC, failed writes, monitoring disk%. Isolate: WAL/logs/temp/data growth vs runaway query. Fix (careful order): free safe space (old logs, rotated WAL if policy allows), pause noncritical jobs, enlarge volume; avoid deleting live data files. DB: checkpoint/archive WAL, temp cleanup, emergency read-only if needed. Verify: disk headroom, replication healthy, and no corruption after space returns.',
  },
  {
    question: 'Design pagination that stays correct under inserts.',
    answer:
      'Detect: offset pages skip/duplicate rows when inserts land ahead of the cursor. Isolate: OFFSET/LIMIT instability. Fix: keyset/cursor pagination on stable sort keys (id/time+id), return opaque cursors, and consistent sort direction. Verify: concurrent insert tests show no duplicates/skips; document that deep OFFSET is unsupported at scale.',
  },
  {
    question: 'Explain how OS, networking, and DBMS interact in one backend request.',
    answer:
      'Detect: one request’s latency budget across layers. Isolate: NIC/TCP stack → process threads/FDs → app pool → DB protocol over socket → buffer pool/WAL/locks inside DBMS → possible page cache I/O. Fix bottlenecks where measured (pool size, indexes, RTT, syscalls). Verify: end-to-end trace plus host metrics (CPU, iowait, retransmits) and DB wait events tell one coherent story.',
  },
]

export const scenario20Page: StudyPage = createPage(
  'd7-scenario20',
  '20 Scenario-Based Questions',
  30,
  [
    'Practice end-to-end design and incident narratives',
    'Combine requirements, constraints, and trade-offs',
  ],
  {
    sections: [
      section('howto', 'Answering template', [
        p(
          'Clarify goals/constraints → propose design → call out bottlenecks → scaling/security → how you would validate.',
        ),
        p(
          'For incidents, narrate detect → isolate → fix → verify. InterviewReadyAnswers below use that playbook.',
        ),
      ]),
      section('q', '20 scenarios', [ol(scenarios)]),
    ],
    commonMistakes: ['Diving into tech without clarifying SLOs or scale'],
    interviewQuestions: scenarios.slice(0, 7),
    intermediateInterviewQuestions: scenarios.slice(7, 14),
    advancedInterviewQuestions: scenarios.slice(14),
    interviewReadyAnswers: scenarioAnswers,
    keyTakeaways: ['Scenarios reward structured thinking'],
  },
)
