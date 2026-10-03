import type { QuizQuestion } from '@/types/curriculum'
import { day1Questions } from './day1'
import { day2Questions } from './day2'
import { day3Questions } from './day3'
import { day4Questions } from './day4'
import { day5Questions } from './day5'
import { day6Questions } from './day6'
import { day7Questions } from './day7'

export { moduleQuizBanks } from './modules'

/** Populated banks attached by curriculum index via day id */
export const quizBanks: Record<string, QuizQuestion[]> = {
  'day-1': day1Questions,
  'day-2': day2Questions,
  'day-3': day3Questions,
  'day-4': day4Questions,
  'day-5': day5Questions,
  'day-6': day6Questions,
  'day-7': day7Questions,
}

export function getHardQuestionsFromDays(dayIds: string[]): QuizQuestion[] {
  return dayIds.flatMap((id) =>
    (quizBanks[id] ?? []).filter((q) => q.difficulty === 'hard'),
  )
}
