/** Content block primitives for data-driven study pages */
export type CalloutVariant = 'info' | 'tip' | 'warning' | 'mistake'

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'code'; language: string; code: string; caption?: string }
  | { type: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { type: 'callout'; variant: CalloutVariant; title?: string; text: string }
  | { type: 'diagram'; mermaid?: string; caption?: string }
  | { type: 'example'; title: string; blocks: ContentBlock[] }
  | { type: 'numerical'; title: string; problem: string; solution: string }

export interface StudySection {
  id: string
  title: string
  blocks: ContentBlock[]
}

export interface StudyPage {
  id: string
  title: string
  estimatedMinutes: number
  prerequisites?: string[]
  learningObjectives: string[]
  sections: StudySection[]
  commonMistakes: string[]
  interviewQuestions: string[]
  intermediateInterviewQuestions: string[]
  advancedInterviewQuestions: string[]
  interviewReadyAnswers: { question: string; answer: string }[]
  keyTakeaways: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  pages: StudyPage[]
  /** Checkpoint quiz after this module's study pages (optional) */
  quiz?: Quiz
}

export type QuestionType =
  | 'mcq'
  | 'multi'
  | 'truefalse'
  | 'numerical'
  | 'code'
  | 'scenario'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuizMode = 'full' | 'incorrect' | 'hard' | 'interview'

export type ReadinessBand =
  | 'needs_revision'
  | 'developing'
  | 'interview_ready'
  | 'strong'

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  /** What understanding this item checks */
  learningObjective: string
  options?: string[]
  /** Optional snippet for code / scenario questions */
  codeSnippet?: { language: string; code: string }
  /**
   * mcq / truefalse / code / scenario → option index
   * multi → option indices
   * numerical → canonical string answer
   */
  correctAnswer: number | number[] | string
  /** Extra accepted numerical answers after normalization */
  acceptedAnswers?: string[]
  explanation: string
  /** Keyed by option index string or normalized wrong numerical answer */
  whyWrong?: Record<string, string>
  interviewTakeaway: string
  difficulty: Difficulty
  topics: string[]
}

export interface Quiz {
  id: string
  dayId: string
  /** Present when this quiz belongs to a module checkpoint */
  moduleId?: string
  title: string
  description: string
  timeLimitMinutes: number
  passingScore: number
  questions: QuizQuestion[]
}

export interface Day {
  id: string
  number: number
  title: string
  shortTitle: string
  description: string
  topics: string[]
  estimatedMinutes: number
  modules: Module[]
  quiz: Quiz
}

export type DayStatus = 'not_started' | 'in_progress' | 'completed'

export interface TopicAccuracy {
  topic: string
  correct: number
  total: number
  percentage: number
}

export interface DifficultyAccuracy {
  difficulty: Difficulty
  correct: number
  total: number
  percentage: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  dayId: string
  mode: QuizMode
  score: number
  totalQuestions: number
  percentage: number
  answers: Record<string, number | number[] | string>
  questionIds: string[]
  attemptedAt: string
  passed: boolean
  readiness: ReadinessBand
  byDifficulty: DifficultyAccuracy[]
  byTopic: TopicAccuracy[]
  incorrectQuestionIds: string[]
}

export interface ProgressState {
  completedPages: string[]
  quizAttempts: QuizAttempt[]
  completedDays: string[]
  /** Best percentage per quizId */
  bestScores: Record<string, number>
  /** Question IDs answered correctly at least once */
  masteredQuestionIds: string[]
  lastVisitedPageId: string | null
  currentDayId: string | null
  updatedAt: string
}

export interface PageProgressSummary {
  pageId: string
  completed: boolean
}

export interface ModuleProgressSummary {
  moduleId: string
  completedPages: number
  totalPages: number
  percentage: number
  quizAttempted: boolean
  bestQuizScore: number | null
  hasQuiz: boolean
}

export interface DayProgressSummary {
  dayId: string
  status: DayStatus
  completedPages: number
  totalPages: number
  pagePercentage: number
  quizAttempted: boolean
  latestQuizScore: number | null
  bestQuizScore: number | null
  moduleQuizzesCompleted: number
  moduleQuizzesTotal: number
  percentage: number
}

export interface OverallProgressSummary {
  percentage: number
  daysCompleted: number
  totalDays: number
  pagesCompleted: number
  totalPages: number
  /** Modules with all pages completed */
  topicsCompleted: number
  totalTopics: number
  /** Average of best day-assessment scores (null if none attempted) */
  overallQuizScore: number | null
  latestQuizScore: number | null
  currentDayId: string | null
}
