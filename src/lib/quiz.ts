import type {
  Difficulty,
  DifficultyAccuracy,
  QuizAttempt,
  QuizMode,
  QuizQuestion,
  ReadinessBand,
  TopicAccuracy,
} from '@/types/curriculum'

export function normalizeNumericalAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
}

export function answersEqual(
  question: QuizQuestion,
  user: number | number[] | string | undefined,
): boolean {
  if (user === undefined || user === null || user === '') return false

  switch (question.type) {
    case 'multi': {
      const correct = Array.isArray(question.correctAnswer)
        ? [...question.correctAnswer].map(Number).sort((a, b) => a - b)
        : []
      const given = Array.isArray(user)
        ? [...user].map(Number).sort((a, b) => a - b)
        : []
      return (
        correct.length === given.length &&
        correct.every((v, i) => v === given[i])
      )
    }
    case 'numerical': {
      const accepted = [
        String(question.correctAnswer),
        ...(question.acceptedAnswers ?? []),
      ].map(normalizeNumericalAnswer)
      return accepted.includes(normalizeNumericalAnswer(String(user)))
    }
    default: {
      // mcq | truefalse | code | scenario
      return Number(user) === Number(question.correctAnswer)
    }
  }
}

export function formatAnswer(
  question: QuizQuestion,
  answer: number | number[] | string | undefined,
): string {
  if (answer === undefined || answer === null || answer === '') return '—'
  if (question.type === 'numerical') return String(answer)
  if (question.type === 'multi' && Array.isArray(answer)) {
    return answer
      .map((i) => question.options?.[Number(i)] ?? String(i))
      .join('; ')
  }
  if (typeof answer === 'number' || /^\d+$/.test(String(answer))) {
    const idx = Number(answer)
    return question.options?.[idx] ?? String(answer)
  }
  return String(answer)
}

export function readinessBand(percentage: number): ReadinessBand {
  if (percentage < 60) return 'needs_revision'
  if (percentage < 75) return 'developing'
  if (percentage < 90) return 'interview_ready'
  return 'strong'
}

export function readinessLabel(band: ReadinessBand): string {
  switch (band) {
    case 'needs_revision':
      return 'Needs Revision'
    case 'developing':
      return 'Developing'
    case 'interview_ready':
      return 'Interview Ready'
    case 'strong':
      return 'Strong'
  }
}

export function scoreAttempt(opts: {
  quizId: string
  dayId: string
  mode: QuizMode
  questions: QuizQuestion[]
  answers: Record<string, number | number[] | string>
}): QuizAttempt {
  const { quizId, dayId, mode, questions, answers } = opts
  let score = 0
  const incorrectQuestionIds: string[] = []

  const diffMap: Record<Difficulty, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  }
  const topicMap = new Map<string, { correct: number; total: number }>()

  for (const q of questions) {
    const ok = answersEqual(q, answers[q.id])
    if (ok) score += 1
    else incorrectQuestionIds.push(q.id)

    diffMap[q.difficulty].total += 1
    if (ok) diffMap[q.difficulty].correct += 1

    for (const topic of q.topics) {
      const cur = topicMap.get(topic) ?? { correct: 0, total: 0 }
      cur.total += 1
      if (ok) cur.correct += 1
      topicMap.set(topic, cur)
    }
  }

  const totalQuestions = questions.length
  const percentage =
    totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100)

  const byDifficulty: DifficultyAccuracy[] = (
    ['easy', 'medium', 'hard'] as Difficulty[]
  ).map((d) => ({
    difficulty: d,
    correct: diffMap[d].correct,
    total: diffMap[d].total,
    percentage:
      diffMap[d].total === 0
        ? 0
        : Math.round((diffMap[d].correct / diffMap[d].total) * 100),
  }))

  const byTopic: TopicAccuracy[] = [...topicMap.entries()]
    .map(([topic, v]) => ({
      topic,
      correct: v.correct,
      total: v.total,
      percentage:
        v.total === 0 ? 0 : Math.round((v.correct / v.total) * 100),
    }))
    .sort((a, b) => a.topic.localeCompare(b.topic))

  return {
    id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quizId,
    dayId,
    mode,
    score,
    totalQuestions,
    percentage,
    answers,
    questionIds: questions.map((q) => q.id),
    attemptedAt: new Date().toISOString(),
    passed: percentage >= 75,
    readiness: readinessBand(percentage),
    byDifficulty,
    byTopic,
    incorrectQuestionIds,
  }
}

export function whyWrongFor(
  question: QuizQuestion,
  userAnswer: number | number[] | string | undefined,
): string | null {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
    return 'No answer was submitted.'
  }
  if (!question.whyWrong) return null

  if (question.type === 'multi' && Array.isArray(userAnswer)) {
    const notes = userAnswer
      .map((i) => question.whyWrong?.[String(i)])
      .filter(Boolean)
    return notes.length ? notes.join(' ') : null
  }
  if (question.type === 'numerical') {
    const key = normalizeNumericalAnswer(String(userAnswer))
    return question.whyWrong[key] ?? question.whyWrong[String(userAnswer)] ?? null
  }
  return question.whyWrong[String(userAnswer)] ?? null
}

/** Fisher–Yates shuffle (copy) */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function validateQuestion(q: QuizQuestion): string[] {
  const errors: string[] = []
  if (!q.id) errors.push('missing id')
  if (!q.question) errors.push(`${q.id}: missing question`)
  if (!q.learningObjective) errors.push(`${q.id}: missing learningObjective`)
  if (!q.explanation) errors.push(`${q.id}: missing explanation`)
  if (!q.interviewTakeaway) errors.push(`${q.id}: missing interviewTakeaway`)
  if (!q.topics?.length) errors.push(`${q.id}: missing topics`)

  const choiceTypes: QuizQuestion['type'][] = [
    'mcq',
    'multi',
    'truefalse',
    'code',
    'scenario',
  ]
  if (choiceTypes.includes(q.type)) {
    if (!q.options || q.options.length < 2) {
      errors.push(`${q.id}: options required`)
    } else if (q.type === 'multi') {
      if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
        errors.push(`${q.id}: multi needs correctAnswer array`)
      } else if (
        q.correctAnswer.some(
          (i) => typeof i !== 'number' || i < 0 || i >= q.options!.length,
        )
      ) {
        errors.push(`${q.id}: multi correctAnswer out of range`)
      }
    } else if (
      typeof q.correctAnswer !== 'number' ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options!.length
    ) {
      errors.push(`${q.id}: correctAnswer index out of range`)
    }
  }

  if (q.type === 'truefalse' && q.options) {
    const normalized = q.options.map((o) => o.toLowerCase())
    if (!normalized.includes('true') || !normalized.includes('false')) {
      errors.push(`${q.id}: truefalse options should be True/False`)
    }
  }

  if (q.type === 'numerical' && typeof q.correctAnswer !== 'string') {
    errors.push(`${q.id}: numerical correctAnswer must be string`)
  }

  if (q.type === 'code' && !q.codeSnippet?.code) {
    errors.push(`${q.id}: code questions need codeSnippet`)
  }

  return errors
}

export function validateQuestionBank(
  questions: QuizQuestion[],
  expectCount = 30,
): string[] {
  const errors: string[] = []
  if (questions.length !== expectCount) {
    errors.push(`expected ${expectCount} questions, got ${questions.length}`)
  }
  const easy = questions.filter((q) => q.difficulty === 'easy').length
  const medium = questions.filter((q) => q.difficulty === 'medium').length
  const hard = questions.filter((q) => q.difficulty === 'hard').length
  if (easy !== 10) errors.push(`expected 10 easy, got ${easy}`)
  if (medium !== 10) errors.push(`expected 10 medium, got ${medium}`)
  if (hard !== 10) errors.push(`expected 10 hard, got ${hard}`)

  const ids = new Set<string>()
  for (const q of questions) {
    if (ids.has(q.id)) errors.push(`duplicate id ${q.id}`)
    ids.add(q.id)
    errors.push(...validateQuestion(q))
  }
  return errors
}
