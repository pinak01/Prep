import type { Day } from '@/types/curriculum'
import { sumPageMinutes } from '../helpers'
import {
  d4p1,
  d4p2,
  d4p3,
  d4p4,
  d4p5,
  d4p6,
  d4p7,
  d4p8,
  d4p9,
  d4p10,
  d4p11,
  d4p12,
  d4p13,
  d4p14,
  d4p15,
  d4p16,
  d4p17,
  d4p18,
  d4rev,
  d4traps,
  d4rapid,
} from './content/day4'

const modules = [
  {
    id: 'd4-m1',
    title: 'Processes & Scheduling',
    description:
      'Processes, threads, PCB, context switching, and CPU scheduling algorithms.',
    pages: [d4p1, d4p2, d4p3, d4p4],
  },
  {
    id: 'd4-m2',
    title: 'Synchronization & Deadlocks',
    description: 'Mutexes, semaphores, monitors, and deadlock handling.',
    pages: [d4p5, d4p6, d4p7, d4p8],
  },
  {
    id: 'd4-m3',
    title: 'Memory & Filesystems',
    description:
      'Virtual memory, paging, TLB, segmentation, allocation, system calls, IPC.',
    pages: [d4p9, d4p10, d4p11, d4p12],
  },
  {
    id: 'd4-m4',
    title: 'Linux Essentials',
    description:
      'Filesystem, permissions, process tools, text processing, networking utilities, and debugging.',
    pages: [d4p13, d4p14, d4p15, d4p16, d4p17, d4p18],
  },
  {
    id: 'd4-m-revision',
    title: 'Revision & Interview Prep',
    description: 'Condensed revision, traps, and rapid-fire practice.',
    pages: [d4rev, d4traps, d4rapid],
  },
]

export const day4: Day = {
  id: 'day-4',
  number: 4,
  title: 'OS + Linux',
  shortTitle: 'OS + Linux',
  description:
    'Processes, threads, scheduling, synchronization, memory, filesystems — plus essential Linux tooling for engineers.',
  topics: [
    'Processes & Threads',
    'CPU Scheduling',
    'Synchronization',
    'Deadlocks',
    'Virtual Memory',
    'Linux Filesystem & Permissions',
    'Linux Process Debugging',
  ],
  estimatedMinutes: sumPageMinutes(modules.flatMap((m) => m.pages)),
  modules,
  quiz: {
    id: 'quiz-day-4',
    dayId: 'day-4',
    title: 'Day 4 Assessment — OS + Linux',
    description:
      'Assess process/memory fundamentals, concurrency, and practical Linux fluency.',
    timeLimitMinutes: 35,
    passingScore: 70,
    questions: [],
  },
}
