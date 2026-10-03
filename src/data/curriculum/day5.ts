import type { Day } from '@/types/curriculum'
import { sumPageMinutes } from '../helpers'
import {
  m1Pages,
  m2Pages,
  m3Pages,
  m4Pages,
  revisionPages,
} from './content/day5'

const modules = [
  {
    id: 'd5-m1',
    title: 'OOP Core Concepts',
    description:
      'Classes, objects, encapsulation, abstraction, inheritance, polymorphism, and binding.',
    pages: m1Pages,
  },
  {
    id: 'd5-m2',
    title: 'Object Relationships & Quality',
    description:
      'Association, aggregation, composition, coupling, cohesion, constructors, and access control.',
    pages: m2Pages,
  },
  {
    id: 'd5-m3',
    title: 'Design Principles',
    description: 'SOLID, DRY, KISS, and composition over inheritance.',
    pages: m3Pages,
  },
  {
    id: 'd5-m4',
    title: 'Design Patterns',
    description:
      'Creational, structural, and behavioral patterns commonly asked in interviews — with selection practice.',
    pages: m4Pages,
  },
  {
    id: 'd5-m-revision',
    title: 'Revision & Interview Prep',
    description:
      'Dense checklist, trap list, and rapid-fire drills for OOP + LLD interviews.',
    pages: revisionPages,
  },
]

export const day5: Day = {
  id: 'day-5',
  number: 5,
  title: 'OOP + LLD',
  shortTitle: 'OOP + LLD',
  description:
    'Object-oriented pillars, relationships, SOLID principles, and core design patterns with Java examples — built for interview depth.',
  topics: [
    'OOP Pillars',
    'Relationships',
    'Interfaces & Binding',
    'SOLID',
    'Creational Patterns',
    'Behavioral & Structural Patterns',
  ],
  estimatedMinutes: sumPageMinutes(modules.flatMap((m) => m.pages)),
  modules,
  quiz: {
    id: 'quiz-day-5',
    dayId: 'day-5',
    title: 'Day 5 Assessment — OOP + LLD',
    description:
      'Assess OOP concepts, SOLID principles, and design pattern reasoning.',
    timeLimitMinutes: 30,
    passingScore: 70,
    questions: [],
  },
}
