import type { QuizQuestion } from '@/types/curriculum'
import { day1ModuleQuizzes } from './day1'
import { day2ModuleQuizzes } from './day2'
import { day3ModuleQuizzes } from './day3'
import { day4ModuleQuizzes } from './day4'
import { day5ModuleQuizzes } from './day5'
import { day6ModuleQuizzes } from './day6'
import { day7ModuleQuizzes } from './day7'

/**
 * Module checkpoint banks keyed by module id (e.g. d3-m1).
 * Each bank should have 8 questions: 3 easy / 3 medium / 2 hard.
 */
export const moduleQuizBanks: Record<string, QuizQuestion[]> = {}

export function registerModuleQuizzes(
  banks: Record<string, QuizQuestion[]>,
): void {
  Object.assign(moduleQuizBanks, banks)
}

registerModuleQuizzes(day1ModuleQuizzes)
registerModuleQuizzes(day2ModuleQuizzes)
registerModuleQuizzes(day3ModuleQuizzes)
registerModuleQuizzes(day4ModuleQuizzes)
registerModuleQuizzes(day5ModuleQuizzes)
registerModuleQuizzes(day6ModuleQuizzes)
registerModuleQuizzes(day7ModuleQuizzes)
