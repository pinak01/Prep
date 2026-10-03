import { curriculum } from '@/data/curriculum'
import {
  getLatestAttemptForQuiz,
  getLatestQuizAttemptOverall,
} from '@/lib/storage'
import { getModuleQuizzes } from '@/data/quizzes/moduleMeta'
import type {
  Day,
  DayProgressSummary,
  DayStatus,
  Module,
  ModuleProgressSummary,
  OverallProgressSummary,
  ProgressState,
} from '@/types/curriculum'

export function getDayPages(day: Day) {
  return day.modules.flatMap((m) => m.pages)
}

export function isPageCompleted(
  state: ProgressState,
  pageId: string,
): boolean {
  return state.completedPages.includes(pageId)
}

export function isModuleQuizDone(
  state: ProgressState,
  mod: Module,
): boolean {
  if (!mod.quiz || mod.quiz.questions.length === 0) return true
  return state.quizAttempts.some((a) => a.quizId === mod.quiz!.id)
}

export function getModuleProgress(
  state: ProgressState,
  day: Day,
  moduleId: string,
): ModuleProgressSummary {
  const mod = day.modules.find((m) => m.id === moduleId)
  if (!mod) {
    return {
      moduleId,
      completedPages: 0,
      totalPages: 0,
      percentage: 0,
      quizAttempted: false,
      bestQuizScore: null,
      hasQuiz: false,
    }
  }
  const totalPages = mod.pages.length
  const completedPages = mod.pages.filter((p) =>
    isPageCompleted(state, p.id),
  ).length
  const hasQuiz = Boolean(mod.quiz && mod.quiz.questions.length > 0)
  const quizAttempted = hasQuiz ? isModuleQuizDone(state, mod) : false
  const bestQuizScore = hasQuiz
    ? (state.bestScores?.[mod.quiz!.id] ?? null)
    : null

  const pagePct =
    totalPages === 0 ? 0 : Math.round((completedPages / totalPages) * 100)
  const percentage = hasQuiz
    ? Math.round(pagePct * 0.8 + (quizAttempted ? 20 : 0))
    : pagePct

  return {
    moduleId,
    completedPages,
    totalPages,
    percentage,
    quizAttempted,
    bestQuizScore,
    hasQuiz,
  }
}

/** Day-level final assessment only (not module checkpoints) */
export function isDayQuizAttempted(state: ProgressState, day: Day): boolean {
  return state.quizAttempts.some((a) => a.quizId === day.quiz.id)
}

/** @deprecated use isDayQuizAttempted — kept for call-site compatibility */
export function isQuizAttempted(state: ProgressState, day: Day): boolean {
  return isDayQuizAttempted(state, day)
}

export function allModuleQuizzesDone(state: ProgressState, day: Day): boolean {
  const quizzes = getModuleQuizzes(day)
  if (quizzes.length === 0) return true
  return quizzes.every((q) =>
    state.quizAttempts.some((a) => a.quizId === q.id),
  )
}

export function getDayStatus(state: ProgressState, day: Day): DayStatus {
  const pages = getDayPages(day)
  const completed = pages.filter((p) => isPageCompleted(state, p.id)).length
  const dayQuizDone = isDayQuizAttempted(state, day)
  const modulesDone = allModuleQuizzesDone(state, day)
  const allPagesDone = pages.length > 0 && completed === pages.length

  if (allPagesDone && modulesDone && dayQuizDone) return 'completed'

  const anyModuleQuizStarted = day.modules.some(
    (mod) =>
      mod.quiz &&
      state.quizAttempts.some((a) => a.quizId === mod.quiz!.id),
  )

  if (
    completed > 0 ||
    dayQuizDone ||
    anyModuleQuizStarted ||
    state.completedDays.includes(day.id)
  ) {
    return 'in_progress'
  }
  return 'not_started'
}

export function getDayProgress(
  state: ProgressState,
  day: Day,
): DayProgressSummary {
  const pages = getDayPages(day)
  const completedPages = pages.filter((p) => isPageCompleted(state, p.id)).length
  const totalPages = pages.length
  const pagePercentage =
    totalPages === 0 ? 0 : Math.round((completedPages / totalPages) * 100)
  const quizAttempted = isDayQuizAttempted(state, day)
  const latest = getLatestAttemptForQuiz(state.quizAttempts, day.quiz.id)
  const status = getDayStatus(state, day)
  const bestQuizScore =
    state.bestScores?.[day.quiz.id] ?? latest?.percentage ?? null

  const moduleQuizzes = getModuleQuizzes(day)
  const moduleQuizzesTotal = moduleQuizzes.length
  const moduleQuizzesCompleted = moduleQuizzes.filter((q) =>
    state.quizAttempts.some((a) => a.quizId === q.id),
  ).length
  const moduleQuizPct =
    moduleQuizzesTotal === 0
      ? 100
      : (moduleQuizzesCompleted / moduleQuizzesTotal) * 100

  // Pages 70% · module quizzes 15% · day quiz 15%
  const percentage = Math.round(
    pagePercentage * 0.7 +
      moduleQuizPct * 0.15 +
      (quizAttempted ? 15 : 0),
  )

  return {
    dayId: day.id,
    status,
    completedPages,
    totalPages,
    pagePercentage,
    quizAttempted,
    latestQuizScore: latest?.percentage ?? null,
    bestQuizScore,
    moduleQuizzesCompleted,
    moduleQuizzesTotal,
    percentage,
  }
}

export function getOverallProgress(state: ProgressState): OverallProgressSummary {
  const totalPages = curriculum.reduce(
    (sum, d) => sum + getDayPages(d).length,
    0,
  )
  const pagesCompleted = curriculum.reduce((sum, d) => {
    return (
      sum +
      getDayPages(d).filter((p) => isPageCompleted(state, p.id)).length
    )
  }, 0)

  const daysCompleted = curriculum.filter(
    (d) => getDayStatus(state, d) === 'completed',
  ).length

  const allModules = curriculum.flatMap((d) => d.modules)
  const totalTopics = allModules.length
  const topicsCompleted = allModules.filter((mod) => {
    if (mod.pages.length === 0) return false
    const pagesDone = mod.pages.every((p) => isPageCompleted(state, p.id))
    return pagesDone && isModuleQuizDone(state, mod)
  }).length

  const dayQuizScores = curriculum
    .map((d) => state.bestScores?.[d.quiz.id])
    .filter((s): s is number => typeof s === 'number')
  const overallQuizScore =
    dayQuizScores.length === 0
      ? null
      : Math.round(
          dayQuizScores.reduce((a, b) => a + b, 0) / dayQuizScores.length,
        )

  const pagePct = totalPages === 0 ? 0 : (pagesCompleted / totalPages) * 100
  const quizPct =
    (curriculum.filter((d) => isDayQuizAttempted(state, d)).length /
      curriculum.length) *
    100
  const percentage = Math.round(pagePct * 0.85 + quizPct * 0.15)

  const latest = getLatestQuizAttemptOverall(
    state.quizAttempts.filter((a) => a.quizId !== 'interview-rapid'),
  )

  let currentDayId = state.currentDayId
  const firstIncomplete = curriculum.find(
    (d) => getDayStatus(state, d) !== 'completed',
  )
  if (firstIncomplete) currentDayId = firstIncomplete.id
  else if (!currentDayId) currentDayId = curriculum[0]?.id ?? null

  return {
    percentage,
    daysCompleted,
    totalDays: curriculum.length,
    pagesCompleted,
    totalPages,
    topicsCompleted,
    totalTopics,
    overallQuizScore,
    latestQuizScore: latest?.percentage ?? null,
    currentDayId,
  }
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `~${h} hour${h === 1 ? '' : 's'}`
  return `~${h}.${Math.round((m / 60) * 10)} hours`
}

export function statusLabel(status: DayStatus): string {
  switch (status) {
    case 'not_started':
      return 'Not Started'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
  }
}
