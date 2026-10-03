/* @refresh reload */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { curriculum, getDayById } from '@/data/curriculum'
import {
  getDayProgress,
  getOverallProgress,
  getDayPages,
} from '@/lib/progress'
import {
  clearProgress as clearStorage,
  defaultProgressState,
  loadProgress,
  saveProgress,
} from '@/lib/storage'
import type { ProgressState, QuizAttempt } from '@/types/curriculum'
import {
  ProgressContext,
  type ProgressContextValue,
} from '@/context/progress-context'

function recomputeCompletedDays(state: ProgressState): string[] {
  return curriculum
    .filter((day) => {
      const pages = getDayPages(day)
      const allPages =
        pages.length > 0 &&
        pages.every((p) => state.completedPages.includes(p.id))
      const dayQuizDone = state.quizAttempts.some(
        (a) => a.quizId === day.quiz.id,
      )
      const moduleQuizzesOk = day.modules.every((mod) => {
        if (!mod.quiz || mod.quiz.questions.length === 0) return true
        return state.quizAttempts.some((a) => a.quizId === mod.quiz!.id)
      })
      return allPages && dayQuizDone && moduleQuizzesOk
    })
    .map((d) => d.id)
}

export function ProgressProvider({
  children,
  username,
}: {
  children: ReactNode
  username: string
}) {
  const [state, setState] = useState<ProgressState>(() => loadProgress(username))
  const [hydratedUser, setHydratedUser] = useState(username)

  // Reload when account switches
  useEffect(() => {
    setState(loadProgress(username))
    setHydratedUser(username)
  }, [username])

  useEffect(() => {
    if (hydratedUser !== username) return
    saveProgress(username, state)
  }, [username, hydratedUser, state])

  const overall = useMemo(() => getOverallProgress(state), [state])

  const getDaySummary = useCallback(
    (dayId: string) => {
      const day = getDayById(dayId)
      if (!day) return null
      return getDayProgress(state, day)
    },
    [state],
  )

  const isPageComplete = useCallback(
    (pageId: string) => state.completedPages.includes(pageId),
    [state.completedPages],
  )

  const markPageComplete = useCallback((pageId: string) => {
    setState((prev) => {
      if (prev.completedPages.includes(pageId)) return prev
      const completedPages = [...prev.completedPages, pageId]
      const next = { ...prev, completedPages }
      return { ...next, completedDays: recomputeCompletedDays(next) }
    })
  }, [])

  const markPageIncomplete = useCallback((pageId: string) => {
    setState((prev) => {
      if (!prev.completedPages.includes(pageId)) return prev
      const completedPages = prev.completedPages.filter((id) => id !== pageId)
      const next = { ...prev, completedPages }
      return { ...next, completedDays: recomputeCompletedDays(next) }
    })
  }, [])

  const setLastVisited = useCallback((pageId: string, dayId: string) => {
    setState((prev) => {
      if (prev.lastVisitedPageId === pageId && prev.currentDayId === dayId) {
        return prev
      }
      return {
        ...prev,
        lastVisitedPageId: pageId,
        currentDayId: dayId,
      }
    })
  }, [])

  const recordQuizAttempt = useCallback((attempt: QuizAttempt) => {
    setState((prev) => {
      const bestScores = { ...prev.bestScores }
      bestScores[attempt.quizId] = Math.max(
        bestScores[attempt.quizId] ?? 0,
        attempt.percentage,
      )

      const mastered = new Set(prev.masteredQuestionIds)
      for (const qid of attempt.questionIds) {
        if (!attempt.incorrectQuestionIds.includes(qid)) {
          mastered.add(qid)
        }
      }

      const next: ProgressState = {
        ...prev,
        quizAttempts: [...prev.quizAttempts, attempt],
        bestScores,
        masteredQuestionIds: [...mastered],
      }
      return { ...next, completedDays: recomputeCompletedDays(next) }
    })
  }, [])

  const refreshDayCompletion = useCallback((dayId: string) => {
    setState((prev) => {
      const day = getDayById(dayId)
      if (!day) return prev
      const pages = getDayPages(day)
      const allPages =
        pages.length > 0 &&
        pages.every((p) => prev.completedPages.includes(p.id))
      const dayQuizDone = prev.quizAttempts.some((a) => a.quizId === day.quiz.id)
      const moduleQuizzesOk = day.modules.every((mod) => {
        if (!mod.quiz || mod.quiz.questions.length === 0) return true
        return prev.quizAttempts.some((a) => a.quizId === mod.quiz!.id)
      })
      const completed =
        allPages && dayQuizDone && moduleQuizzesOk
          ? Array.from(new Set([...prev.completedDays, dayId]))
          : prev.completedDays.filter((id) => id !== dayId)
      return { ...prev, completedDays: completed }
    })
  }, [])

  const resetProgress = useCallback(() => {
    clearStorage(username)
    setState(defaultProgressState())
  }, [username])

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      overall,
      getDaySummary,
      isPageComplete,
      markPageComplete,
      markPageIncomplete,
      setLastVisited,
      recordQuizAttempt,
      refreshDayCompletion,
      resetProgress,
    }),
    [
      state,
      overall,
      getDaySummary,
      isPageComplete,
      markPageComplete,
      markPageIncomplete,
      setLastVisited,
      recordQuizAttempt,
      refreshDayCompletion,
      resetProgress,
    ],
  )

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  )
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return ctx
}
