import type { Day } from '@/types/curriculum'
import { day1Module1Pages } from './content/day1/m1-foundations'
import { day1Module2Pages } from './content/day1/m2-normalization'
import { day1Module3Pages } from './content/day1/m3-sql'
import { day1Module4Pages } from './content/day1/m4-indexing'
import { day1Module5Pages } from './content/day1/m5-revision'

export const day1: Day = {
  id: 'day-1',
  number: 1,
  title: 'DBMS Fundamentals',
  shortTitle: 'DBMS Fundamentals',
  description:
    'Core database concepts: architecture, relational model, keys, normalization, SQL, indexing, and an introduction to transactions.',
  topics: [
    'DBMS Architecture',
    'Relational Model',
    'Keys & Constraints',
    'Normalization',
    'SQL',
    'Indexes',
    'Transactions Intro',
  ],
  estimatedMinutes: 220,
  modules: [
    {
      id: 'd1-m1',
      title: 'DBMS Foundations',
      description:
        'Architecture, relational model, schemas, keys, and functional dependencies.',
      pages: day1Module1Pages,
    },
    {
      id: 'd1-m2',
      title: 'Normalization',
      description:
        'Why normalize, 1NF–BCNF, and when denormalization is intentional.',
      pages: day1Module2Pages,
    },
    {
      id: 'd1-m3',
      title: 'SQL',
      description: 'Query fundamentals, joins, aggregation, subqueries, and views.',
      pages: day1Module3Pages,
    },
    {
      id: 'd1-m4',
      title: 'Indexing & Query Basics',
      description:
        'Indexes, B-trees/B+ trees, query execution, and transaction introduction.',
      pages: day1Module4Pages,
    },
    {
      id: 'd1-m-revision',
      title: 'Revision & Interview Prep',
      description: 'Condensed revision, traps, and rapid-fire practice.',
      pages: day1Module5Pages,
    },
  ],
  quiz: {
    id: 'quiz-day-1',
    dayId: 'day-1',
    title: 'Day 1 Assessment — DBMS + SQL',
    description:
      'Test your understanding of relational foundations, normalization, SQL, and indexing.',
    timeLimitMinutes: 30,
    passingScore: 70,
    questions: [],
  },
}
