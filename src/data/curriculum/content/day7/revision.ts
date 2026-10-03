import type { StudyPage } from '@/types/curriculum'
import {
  createPage,
  section,
  p,
  ul,
  ol,
  table,
  callout,
} from '../../../helpers'

export const revPage: StudyPage = createPage(
  'd7-rev',
  '10-Minute Revision',
  10,
  [
    'Rapidly review Day 7 system design and cross-topic integration points',
    'Hit every must-explain trigger once at checklist depth',
  ],
  {
    sections: [
      section('sd', 'System design (2 min)', [
        ol([
          'Clarify functional + non-functional + out-of-scope',
          'Estimate QPS/storage; state assumptions',
          'API → data → boxes → bottleneck → failures → trade-offs',
          'Stateless apps + LB; cache with invalidation story',
          'SQL vs NoSQL by access pattern; queues need idempotency',
          'Metrics/logs/traces + layered security on every design',
        ]),
      ]),
      section('cross', 'Cross-topic flashes (4 min)', [
        ul([
          'DB+OS: buffer pool vs page cache; WAL fsync; never swap DB',
          'DB+Net: pool connections; N+1 = RTT tax; replica lag',
          'Net+OS: sockets are FDs; event loop vs threads; ulimit',
          'Linux+Sec: ss/iostat/free; non-root; private DB; least privilege',
          'OOP+SD: encapsulate data per service; ports at boundaries',
        ]),
      ]),
      section('e2e', 'End-to-end flashes (3 min)', [
        ul([
          'Browser path: DNS → TCP → TLS → HTTP → LB → app → cache/DB',
          'HTTPS = HTTP+TLS; index = B+ tree trade-offs; context switch cost',
          'fork/exec; secure REST layers; DB scale levers (replicas ≠ writes)',
          'Debug: scope → RED → traces → layer → mitigate → fix',
        ]),
      ]),
      section('gate', '60-second gate (1 min)', [
        callout(
          'warning',
          'If you cannot explain TCP handshake, MVCC, authn/authz, and cache-aside without notes, reopen d7-must before the interview.',
          'Hard gate',
        ),
      ]),
    ],
    commonMistakes: [
      'Revising technology names instead of mechanisms',
      'Skipping failure modes and security',
    ],
    interviewQuestions: [
      'Recite the system design skeleton.',
      'Name the browser→DB hops.',
      'Buffer pool vs page cache?',
      'When do you shard?',
      'Debug playbook in five steps?',
    ],
    intermediateInterviewQuestions: [
      'Read-your-writes with replicas?',
      'Idempotent consumers — why?',
      'L4 vs L7 LB?',
      'TLS vs app authz?',
      'N+1 across AZs?',
    ],
    advancedInterviewQuestions: [
      'Outbox pattern why?',
      'Hot key mitigation?',
      'p99 budget across fan-out?',
      'Transaction pooling caveats?',
      'Serializable anomaly example?',
    ],
    interviewReadyAnswers: [
      {
        question: 'Day 7 in one breath?',
        answer:
          'Design with clarify-estimate-API-data-boxes-failures; scale with LB, cache, queues, and honest consistency; connect DB/OS/net/security mechanisms; narrate the full request path; debug with metrics and traces. Everything ends in trade-offs and operability.',
      },
    ],
    keyTakeaways: [
      'Skeleton + mechanisms + trade-offs.',
      'Use d7-must for verbal holes.',
      'Practice timing: 60s and 5-minute depths.',
    ],
  },
)

export const trapsPage: StudyPage = createPage(
  'd7-traps',
  'Interview Traps',
  12,
  [
    'Recognize common misconceptions that lose credit in integration interviews',
    'Replace traps with precise, mechanism-correct statements',
  ],
  {
    sections: [
      section('traps', 'High-frequency traps', [
        table(
          ['Trap', 'Why it fails', 'Better'],
          [
            [
              'Jump to Kafka/K8s',
              'No requirements',
              'Clarify SLOs/scale first',
            ],
            [
              'CAP slogan',
              'Hand-wavy',
              'Say client-visible behavior on partition',
            ],
            [
              'Replicas for writes',
              'Wrong lever',
              'Replicas help reads; writes need primary/shard plan',
            ],
            [
              'HTTPS = secure app',
              'Incomplete',
              'TLS + authn + authz + validation + …',
            ],
            [
              'Exactly-once queue',
              'Oversimplified',
              'At-least-once + idempotency → effective once',
            ],
            [
              'More threads = faster',
              'Often false',
              'Size to cores; avoid switch thrash',
            ],
            [
              'Index everything',
              'Write amplification',
              'Index measured patterns',
            ],
            [
              'Cache without TTL/invalidation',
              'Stale/wrong data',
              'State freshness policy',
            ],
            [
              'Public DB "for now"',
              'Breach waiting',
              'Private net + least privilege',
            ],
            [
              'Microservices for a 2-person app',
              'Ops cost',
              'Modular monolith first',
            ],
          ],
        ),
      ]),
      section('language', 'Language traps', [
        ul([
          '"Lock-free" when you mean "we use Redis" — be precise.',
          '"Strong consistency" without naming the operation/key scope.',
          '"Real-time" when you mean "p99 < 200ms".',
          '"Stateless JWT" ignoring revocation/logout needs.',
        ]),
      ]),
      section('followups', 'How interviewers spring traps', [
        p('Candidate: "We\'ll be strongly consistent and highly available globally."'),
        p('Interviewer: "During a partition between regions, what happens to writes?"'),
        p(
          'Strong answer: "I can\'t have low-latency independent writes everywhere with linearizability. I\'d choose a primary region for writes, or accept conflict resolution / higher latency with consensus."',
        ),
      ]),
      section('recovery', 'Recovering when you fall in', [
        ol([
          'Pause: "Let me correct that."',
          'State the precise claim.',
          'Give the trade-off you missed.',
          'Continue — interviewers reward self-correction.',
        ]),
      ]),
    ],
    commonMistakes: [
      'Doubling down on a wrong buzzword',
      'Blaming tools instead of mechanisms under follow-up',
    ],
    interviewQuestions: [
      'What\'s wrong with "replicas scale writes"?',
      'Why is "HTTPS secures the API" incomplete?',
      'When is sticky session a trap?',
      'Why is "exactly-once" slippery?',
      'How do you correct yourself mid-interview?',
    ],
    intermediateInterviewQuestions: [
      'CAP misstatements you\'ve heard — fix them.',
      'Cache stampede — what naive answer misses?',
      'Connection-per-request serverless trap?',
      'Serializable checkbox vs actual anomalies?',
      'Global low latency + strong consistency trap?',
    ],
    advancedInterviewQuestions: [
      'Dual-write trap when adopting a new datastore.',
      'Split-brain after failover — what do you admit?',
      'ORMs hide N+1 — how does it trap designs?',
      'Feature-flag rollback vs forward fix under partial migrate.',
      'Security theater controls that fail interviews.',
    ],
    interviewReadyAnswers: [
      {
        question: 'You said something wrong — what now?',
        answer:
          'I correct it explicitly, state the accurate mechanism, and name the trade-off I skipped. Interviewers care more about precise thinking than never misspeaking. Then I ask if they want me to adjust the design given the correction.',
      },
    ],
    keyTakeaways: [
      'Traps are usually oversimplified slogans.',
      'Self-correct early.',
      'Replace slogans with client-visible behavior.',
    ],
  },
)

export const revisionCorePages: StudyPage[] = [revPage, trapsPage]
