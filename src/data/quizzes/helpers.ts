import type {
  Difficulty,
  QuestionType,
  QuizQuestion,
} from '@/types/curriculum'

type QInput = {
  id: string
  type: QuestionType
  difficulty: Difficulty
  topics: string[]
  learningObjective: string
  question: string
  options?: string[]
  codeSnippet?: { language: string; code: string }
  correctAnswer: number | number[] | string
  acceptedAnswers?: string[]
  explanation: string
  whyWrong?: Record<string, string>
  interviewTakeaway: string
}

export function q(input: QInput): QuizQuestion {
  return { ...input }
}

export function tf(
  partial: Omit<QInput, 'type' | 'options' | 'correctAnswer'> & {
    correct: boolean
  },
): QuizQuestion {
  return q({
    ...partial,
    type: 'truefalse',
    options: ['True', 'False'],
    correctAnswer: partial.correct ? 0 : 1,
  })
}
