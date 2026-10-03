import { useMemo, useState } from 'react'
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { getDayByNumber, getModuleQuiz } from '@/data/curriculum'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Callout } from '@/components/common/Callout'
import { QuizRunner, type AnswerValue } from '@/components/quiz/QuizRunner'
import { useProgress } from '@/context/ProgressContext'
import { readinessLabel, scoreAttempt, shuffle } from '@/lib/quiz'
import { getBestAttemptForQuiz, getLatestAttemptForQuiz } from '@/lib/storage'
import type { Quiz, QuizMode, QuizQuestion } from '@/types/curriculum'

export function QuizPage() {
  const { dayNumber, moduleId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { state, recordQuizAttempt } = useProgress()
  const day = getDayByNumber(Number(dayNumber))

  const moduleBundle =
    day && moduleId ? getModuleQuiz(day.number, moduleId) : null

  const quiz: Quiz | undefined = moduleBundle?.quiz ?? day?.quiz
  const isModuleQuiz = Boolean(moduleBundle)

  const mode = (searchParams.get('mode') as QuizMode | null) ?? null
  const [sessionKey, setSessionKey] = useState(0)

  const latest = quiz
    ? getLatestAttemptForQuiz(state.quizAttempts, quiz.id)
    : null
  const best = quiz
    ? getBestAttemptForQuiz(state.quizAttempts, quiz.id)
    : null

  const activeMode: QuizMode = mode ?? 'full'

  const basePath = isModuleQuiz
    ? `/day/${day!.number}/module/${moduleId}/quiz`
    : `/day/${day!.number}/quiz`

  const sessionQuestions: QuizQuestion[] = useMemo(() => {
    if (!quiz || !mode) return []
    if (quiz.questions.length === 0) return []
    if (activeMode === 'hard') {
      return shuffle(quiz.questions.filter((q) => q.difficulty === 'hard'))
    }
    if (activeMode === 'incorrect') {
      const ids = new Set(latest?.incorrectQuestionIds ?? [])
      const subset = quiz.questions.filter((q) => ids.has(q.id))
      return shuffle(subset.length ? subset : quiz.questions)
    }
    return shuffle(quiz.questions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, mode, activeMode, latest?.incorrectQuestionIds, sessionKey])

  if (!day) return <Navigate to="/" replace />
  if (moduleId && !moduleBundle) {
    return <Navigate to={`/day/${day.number}`} replace />
  }
  if (!quiz) return <Navigate to="/" replace />

  const hasQuestions = quiz.questions.length > 0
  const inSession = Boolean(mode) && sessionQuestions.length > 0

  function start(nextMode: QuizMode) {
    setSessionKey((k) => k + 1)
    navigate(`${basePath}?mode=${nextMode}`)
  }

  function handleSubmit(answers: Record<string, AnswerValue>) {
    const attempt = scoreAttempt({
      quizId: quiz!.id,
      dayId: day!.id,
      mode: activeMode,
      questions: sessionQuestions,
      answers,
    })
    recordQuizAttempt(attempt)
    navigate(`${basePath}/results?attempt=${attempt.id}`)
  }

  const nextAfterModule = (() => {
    if (!moduleBundle) return null
    const idx = day.modules.findIndex((m) => m.id === moduleBundle.module.id)
    const following = day.modules.slice(idx + 1)
    const nextStudy = following.find((m) => m.pages.length > 0)
    if (nextStudy?.pages[0]) {
      return {
        label: `Continue: ${nextStudy.title}`,
        to: `/day/${day.number}/page/${nextStudy.pages[0].id}`,
      }
    }
    return {
      label: 'Day assessment',
      to: `/day/${day.number}/quiz`,
    }
  })()

  if (inSession) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/' },
            { label: `Day ${day.number}`, to: `/day/${day.number}` },
            ...(isModuleQuiz
              ? [
                  {
                    label: moduleBundle!.module.title,
                    to: `/day/${day.number}`,
                  },
                ]
              : []),
            { label: isModuleQuiz ? 'Module quiz' : 'Day assessment', to: basePath },
            { label: 'In progress' },
          ]}
        />
        <div className="mt-6">
          <QuizRunner
            key={sessionKey}
            questions={sessionQuestions}
            onSubmit={handleSubmit}
            title={`${quiz.title} · ${
              activeMode === 'full'
                ? 'Full'
                : activeMode === 'hard'
                  ? 'Hard only'
                  : 'Retry incorrect'
            }`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: `Day ${day.number}`, to: `/day/${day.number}` },
          {
            label: isModuleQuiz ? 'Module quiz' : 'Day assessment',
          },
        ]}
      />

      <header className="mt-4 mb-6">
        <div className="mb-2 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-accent-muted" />
          <Badge status="quiz">
            {isModuleQuiz ? 'Module checkpoint' : 'Day assessment'}
          </Badge>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-ink">
          {quiz.title}
        </h1>
        <p className="mt-2 text-ink-muted">{quiz.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-3">
            <dt className="text-xs text-ink-faint">Questions</dt>
            <dd className="font-medium">{quiz.questions.length || '—'}</dd>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <dt className="text-xs text-ink-faint">Mix</dt>
            <dd className="font-medium">
              {isModuleQuiz ? '3 Easy / 3 Med / 2 Hard' : '10 Easy / 10 Med / 10 Hard'}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <dt className="text-xs text-ink-faint">Suggested time</dt>
            <dd className="font-medium">{quiz.timeLimitMinutes} min</dd>
          </div>
        </dl>
      </header>

      <Callout variant="info" title="Scoring bands">
        Under 60% Needs Revision · 60–74% Developing · 75–89% Interview Ready ·
        90%+ Strong.
        {isModuleQuiz
          ? ' After this checkpoint, continue to the next topic.'
          : ' This is the full-day assessment after all module quizzes.'}
      </Callout>

      {!hasQuestions && (
        <Callout variant="warning" title="Questions missing">
          This quiz bank is not loaded yet.
        </Callout>
      )}

      {(latest || best) && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-medium text-ink">Your progress</p>
          <p className="mt-1 text-sm text-ink-muted">
            Latest: {latest?.percentage ?? '—'}%
            {latest ? ` (${readinessLabel(latest.readiness)})` : ''} · Best:{' '}
            {best?.percentage ?? state.bestScores[quiz.id] ?? '—'}%
          </p>
          <Link
            to={`${basePath}/results`}
            className="mt-2 inline-block text-sm text-accent-muted hover:underline"
          >
            View latest results & review
          </Link>
          {isModuleQuiz && nextAfterModule && latest && (
            <div className="mt-3">
              <Link
                to={nextAfterModule.to}
                className="inline-flex rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
              >
                {nextAfterModule.label}
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button disabled={!hasQuestions} onClick={() => start('full')}>
          {latest ? 'Retake quiz' : 'Start quiz'}
        </Button>
        {latest && latest.incorrectQuestionIds.length > 0 && (
          <Button variant="secondary" onClick={() => start('incorrect')}>
            Retry incorrect ({latest.incorrectQuestionIds.length})
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={!hasQuestions}
          onClick={() => start('hard')}
        >
          Practice hard only
        </Button>
        <Link to={`/day/${day.number}`}>
          <Button variant="ghost">Back to day</Button>
        </Link>
      </div>
    </div>
  )
}
