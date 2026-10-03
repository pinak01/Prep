import type { Day } from '@/types/curriculum'
import { sumPageMinutes } from '../helpers'
import {
  d6p1,
  d6p2,
  d6p3,
  d6p4,
  d6p5,
  d6p6,
  d6p7,
  d6p8,
  d6p9,
  d6p10,
  d6p11,
  d6p12,
  d6p13,
  d6p14,
  d6rev,
  d6traps,
  d6rapid,
} from './content/day6'

const modules = [
  {
    id: 'd6-m1',
    title: 'Security Foundations',
    description:
      'CIA triad, authentication, authorization, and crypto primitives.',
    pages: [d6p1, d6p2, d6p3, d6p4],
  },
  {
    id: 'd6-m2',
    title: 'Transport Security & Identity',
    description: 'TLS, certificates, cookies, sessions, JWT, and OAuth basics.',
    pages: [d6p5, d6p6, d6p7],
  },
  {
    id: 'd6-m3',
    title: 'Common Vulnerabilities (Defensive)',
    description:
      'OWASP-style web and API vulnerabilities — detection mindset and mitigations.',
    pages: [d6p8, d6p9, d6p10, d6p11],
  },
  {
    id: 'd6-m4',
    title: 'Secure Engineering Practices',
    description: 'Secure APIs and databases for interviews.',
    pages: [d6p12, d6p13, d6p14],
  },
  {
    id: 'd6-m-revision',
    title: 'Revision & Interview Prep',
    description: 'Condensed revision, traps, and rapid-fire practice.',
    pages: [d6rev, d6traps, d6rapid],
  },
]

export const day6: Day = {
  id: 'day-6',
  number: 6,
  title: 'Cybersecurity',
  shortTitle: 'Cybersecurity',
  description:
    'Defensive application security: crypto fundamentals, authn/authz, common web vulnerabilities, and secure engineering practices.',
  topics: [
    'CIA Triad',
    'Authn vs Authz',
    'Hashing & Encryption',
    'TLS & Certificates',
    'Sessions / JWT / OAuth',
    'OWASP-style Vulnerabilities',
    'Secure APIs',
  ],
  estimatedMinutes: sumPageMinutes(modules.flatMap((m) => m.pages)),
  modules,
  quiz: {
    id: 'quiz-day-6',
    dayId: 'day-6',
    title: 'Day 6 Assessment — Cybersecurity',
    description:
      'Assess defensive security fundamentals, auth, crypto basics, and common vulnerability mitigations.',
    timeLimitMinutes: 30,
    passingScore: 70,
    questions: [],
  },
}
