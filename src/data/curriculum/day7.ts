import type { Day } from '@/types/curriculum'
import { sumPageMinutes } from '../helpers'
import { m1Pages } from './content/day7/m1'
import { m2Pages } from './content/day7/m2'
import { m3Pages } from './content/day7/m3'
import { revisionCorePages } from './content/day7/revision'
import { mustPage } from './content/day7/must'
import { rapid50Page } from './content/day7/rapid50'
import { adv30Page } from './content/day7/adv30'
import { scenario20Page } from './content/day7/scenario20'
import { cross20Page } from './content/day7/cross20'
import { finalPrepPages } from './content/day7/final-prep'

const modules = [
  {
    id: 'd7-m1',
    title: 'System Design Fundamentals',
    description: 'Scalability building blocks used in interviews.',
    pages: m1Pages,
  },
  {
    id: 'd7-m2',
    title: 'Cross-Topic Connections',
    description: 'How core CS subjects interact in real systems.',
    pages: m2Pages,
  },
  {
    id: 'd7-m3',
    title: 'End-to-End Interview Scenarios',
    description: 'Integrated questions you should narrate fluently.',
    pages: m3Pages,
  },
  {
    id: 'd7-m-revision',
    title: 'Revision & Must-Know',
    description: 'Condensed revision, traps, and must-explain checklist.',
    pages: [...revisionCorePages, mustPage],
  },
  {
    id: 'd7-m-final',
    title: 'Final Interview Battery',
    description:
      '50 rapid-fire, 30 advanced, 20 scenario, and 20 cross-topic verbal drills.',
    pages: [rapid50Page, adv30Page, scenario20Page, cross20Page],
  },
  {
    id: 'd7-m-final-prep',
    title: 'Final Interview Preparation',
    description:
      'Last-mile plan, whiteboard narratives, and 35 difficult cross-topic prompts.',
    pages: finalPrepPages,
  },
]

export const day7: Day = {
  id: 'day-7',
  number: 7,
  title: 'Advanced Interview Integration',
  shortTitle: 'Advanced Interview Integration',
  description:
    'System design fundamentals plus cross-topic engineering questions that connect DBMS, OS, Networks, Linux, Security, and OOP.',
  topics: [
    'System Design Basics',
    'Caching & Load Balancing',
    'Consistency & Availability',
    'Observability',
    'Cross-topic Deep Dives',
    'End-to-End Scenarios',
    'Final Interview Prep',
    'Whiteboard Drills',
  ],
  estimatedMinutes: sumPageMinutes(modules.flatMap((m) => m.pages)),
  modules,
  quiz: {
    id: 'quiz-day-7',
    dayId: 'day-7',
    title: 'Day 7 Assessment — Integration',
    description:
      'Assess system design fundamentals and cross-topic technical communication.',
    timeLimitMinutes: 35,
    passingScore: 70,
    questions: [],
  },
}
