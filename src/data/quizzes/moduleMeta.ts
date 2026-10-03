import type { Day, Module, Quiz, QuizQuestion } from '@/types/curriculum'

/** Modules that are revision/practice shells — no separate checkpoint quiz */
export function moduleNeedsCheckpointQuiz(mod: Module): boolean {
  const hay = `${mod.id} ${mod.title}`.toLowerCase()
  return !(
    hay.includes('revision') ||
    hay.includes('final') ||
    hay.includes('battery') ||
    hay.includes('must')
  )
}

export function makeModuleQuizMeta(
  day: Pick<Day, 'id' | 'number'>,
  mod: Module,
): Omit<Quiz, 'questions'> {
  return {
    id: `quiz-${mod.id}`,
    dayId: day.id,
    moduleId: mod.id,
    title: `Module quiz — ${mod.title}`,
    description: `Checkpoint for ${mod.title}. Finish this before moving on.`,
    timeLimitMinutes: 12,
    passingScore: 70,
  }
}

export function getModuleQuizzes(day: Day): Quiz[] {
  return day.modules
    .map((m) => m.quiz)
    .filter((q): q is Quiz => Boolean(q?.questions?.length))
}

export function findModule(day: Day, moduleId: string): Module | undefined {
  return day.modules.find((m) => m.id === moduleId)
}

export function isModuleQuizAttempted(
  attempts: { quizId: string }[],
  quizId: string,
): boolean {
  return attempts.some((a) => a.quizId === quizId)
}

/** Attach question banks onto day + module quizzes */
export function attachQuizBanks(
  days: Day[],
  dayBanks: Record<string, QuizQuestion[]>,
  moduleBanks: Record<string, QuizQuestion[]>,
): void {
  for (const day of days) {
    const dayBank = dayBanks[day.id]
    if (dayBank?.length) day.quiz.questions = dayBank

    for (const mod of day.modules) {
      if (!moduleNeedsCheckpointQuiz(mod)) continue
      const bank = moduleBanks[mod.id]
      if (!mod.quiz) {
        mod.quiz = { ...makeModuleQuizMeta(day, mod), questions: bank ?? [] }
      } else if (bank?.length) {
        mod.quiz.questions = bank
      }
    }
  }
}
