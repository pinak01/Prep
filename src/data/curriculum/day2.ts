import type { Day } from '@/types/curriculum'
import { sumPageMinutes } from '../helpers'
import { m1Pages } from './content/day2/m1'
import { m2Pages } from './content/day2/m2'
import { m3Pages } from './content/day2/m3'
import { m4Pages } from './content/day2/m4'
import { revisionPages } from './content/day2/revision'

const allPages = [...m1Pages, ...m2Pages, ...m3Pages, ...m4Pages, ...revisionPages]

export const day2: Day = {
  id: 'day-2',
  number: 2,
  title: 'DBMS Advanced',
  shortTitle: 'DBMS Advanced',
  description:
    'Transactions, concurrency control, isolation, recovery, replication, partitioning, CAP, and database scaling.',
  topics: [
    'ACID & Transactions',
    'Serializability',
    'Concurrency Control',
    'Isolation Levels',
    'Recovery & WAL',
    'Replication & Sharding',
    'CAP & Scaling',
  ],
  estimatedMinutes: sumPageMinutes(allPages),
  modules: [
    {
      id: 'd2-m1',
      title: 'Transactions & Schedules',
      description: 'ACID, transaction states, schedules, and serializability.',
      pages: m1Pages,
    },
    {
      id: 'd2-m2',
      title: 'Concurrency Control',
      description: 'Locks, two-phase locking, deadlocks, and lock-based protocols.',
      pages: m2Pages,
    },
    {
      id: 'd2-m3',
      title: 'Isolation Levels & MVCC',
      description: 'Anomalies, isolation levels, and multi-version concurrency control.',
      pages: m3Pages,
    },
    {
      id: 'd2-m4',
      title: 'Recovery, Replication & Scaling',
      description:
        'WAL, checkpoints, replication, partitioning, sharding, CAP, SQL vs NoSQL.',
      pages: m4Pages,
    },
    {
      id: 'd2-m-revision',
      title: 'Revision & Interview Prep',
      description:
        'Dense checklist, interview traps, and rapid-fire practice for Day 2.',
      pages: revisionPages,
    },
  ],
  quiz: {
    id: 'quiz-day-2',
    dayId: 'day-2',
    title: 'Day 2 Assessment — Advanced DBMS',
    description:
      'Assess transactions, concurrency, isolation, recovery, and scaling concepts.',
    timeLimitMinutes: 30,
    passingScore: 70,
    questions: [],
  },
}
