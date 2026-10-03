import { createContext } from 'react'
import type {
  DayProgressSummary,
  OverallProgressSummary,
  ProgressState,
  QuizAttempt,
} from '@/types/curriculum'

export interface ProgressContextValue {
  state: ProgressState
  overall: OverallProgressSummary
  getDaySummary: (dayId: string) => DayProgressSummary | null
  isPageComplete: (pageId: string) => boolean
  markPageComplete: (pageId: string) => void
  markPageIncomplete: (pageId: string) => void
  setLastVisited: (pageId: string, dayId: string) => void
  recordQuizAttempt: (attempt: QuizAttempt) => void
  refreshDayCompletion: (dayId: string) => void
  resetProgress: () => void
}

/** Isolated so Fast Refresh can remount the provider without replacing this identity. */
export const ProgressContext = createContext<ProgressContextValue | null>(null)
