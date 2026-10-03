import type { ProgressState, QuizAttempt } from '@/types/curriculum'

const STORAGE_PREFIX = 'cs-interview-prep-progress-v2'

export function progressStorageKey(username: string): string {
  return `${STORAGE_PREFIX}:${username.toLowerCase()}`
}

export const defaultProgressState = (): ProgressState => ({
  completedPages: [],
  quizAttempts: [],
  completedDays: [],
  bestScores: {},
  masteredQuestionIds: [],
  lastVisitedPageId: null,
  currentDayId: 'day-1',
  updatedAt: new Date().toISOString(),
})

function migrate(raw: Partial<ProgressState> & { quizAttempts?: QuizAttempt[] }): ProgressState {
  const base = defaultProgressState()
  const attempts = (raw.quizAttempts ?? []).map((a) => ({
    ...a,
    id: a.id ?? `attempt-migrated-${a.attemptedAt}`,
    mode: a.mode ?? 'full',
    questionIds: a.questionIds ?? Object.keys(a.answers ?? {}),
    readiness: a.readiness ?? (a.percentage >= 90
      ? 'strong'
      : a.percentage >= 75
        ? 'interview_ready'
        : a.percentage >= 60
          ? 'developing'
          : 'needs_revision'),
    byDifficulty: a.byDifficulty ?? [],
    byTopic: a.byTopic ?? [],
    incorrectQuestionIds: a.incorrectQuestionIds ?? [],
  })) as QuizAttempt[]

  const bestScores = { ...(raw.bestScores ?? {}) }
  for (const a of attempts) {
    bestScores[a.quizId] = Math.max(bestScores[a.quizId] ?? 0, a.percentage)
  }

  return {
    ...base,
    ...raw,
    completedPages: raw.completedPages ?? [],
    quizAttempts: attempts,
    completedDays: raw.completedDays ?? [],
    bestScores,
    masteredQuestionIds: raw.masteredQuestionIds ?? [],
  }
}

export function loadProgress(username: string): ProgressState {
  try {
    const key = progressStorageKey(username)
    const raw =
      localStorage.getItem(key) ??
      // one-time legacy fallback for Pinak only (pre-auth storage)
      (username.toLowerCase() === 'pinak'
        ? localStorage.getItem('cs-interview-prep-progress-v2') ??
          localStorage.getItem('cs-interview-prep-progress-v1')
        : null)
    if (!raw) return defaultProgressState()
    const parsed = migrate(JSON.parse(raw) as Partial<ProgressState>)
    // Persist under user key if we loaded legacy data
    localStorage.setItem(key, JSON.stringify(parsed))
    return parsed
  } catch {
    return defaultProgressState()
  }
}

export function saveProgress(username: string, state: ProgressState): void {
  const next = { ...state, updatedAt: new Date().toISOString() }
  localStorage.setItem(progressStorageKey(username), JSON.stringify(next))
}

export function clearProgress(username: string): void {
  localStorage.removeItem(progressStorageKey(username))
}

export function getLatestAttemptForQuiz(
  attempts: QuizAttempt[],
  quizId: string,
): QuizAttempt | null {
  const filtered = attempts.filter((a) => a.quizId === quizId)
  if (filtered.length === 0) return null
  return filtered.reduce((latest, a) =>
    new Date(a.attemptedAt) > new Date(latest.attemptedAt) ? a : latest,
  )
}

export function getBestAttemptForQuiz(
  attempts: QuizAttempt[],
  quizId: string,
): QuizAttempt | null {
  const filtered = attempts.filter((a) => a.quizId === quizId)
  if (filtered.length === 0) return null
  return filtered.reduce((best, a) =>
    a.percentage > best.percentage ? a : best,
  )
}

export function getLatestQuizAttemptOverall(
  attempts: QuizAttempt[],
): QuizAttempt | null {
  if (attempts.length === 0) return null
  return attempts.reduce((latest, a) =>
    new Date(a.attemptedAt) > new Date(latest.attemptedAt) ? a : latest,
  )
}
