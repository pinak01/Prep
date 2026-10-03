import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { getDayByNumber, getModuleQuiz } from '@/data/curriculum'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useProgress } from '@/context/ProgressContext'
import {
  answersEqual,
  formatAnswer,
  readinessLabel,
  whyWrongFor,
} from '@/lib/quiz'
import { getLatestAttemptForQuiz } from '@/lib/storage'
import type { QuizAttempt, QuizQuestion } from '@/types/curriculum'

export function QuizResults() {
  const { dayNumber, moduleId } = useParams()
  const [params] = useSearchParams()
  const day = getDayByNumber(Number(dayNumber))
  const { state } = useProgress()

  if (!day) return <Navigate to="/" replace />

  const moduleBundle =
    moduleId ? getModuleQuiz(day.number, moduleId) : null
  if (moduleId && !moduleBundle) {
    return <Navigate to={`/day/${day.number}`} replace />
  }

  const quiz = moduleBundle?.quiz ?? day.quiz
  const isModuleQuiz = Boolean(moduleBundle)
  const basePath = isModuleQuiz
    ? `/day/${day.number}/module/${moduleId}/quiz`
    : `/day/${day.number}/quiz`

  const attemptId = params.get('attempt')
  const attempt: QuizAttempt | null =
    (attemptId
      ? state.quizAttempts.find((a) => a.id === attemptId)
      : null) ?? getLatestAttemptForQuiz(state.quizAttempts, quiz.id)

  if (!attempt) {
    return <Navigate to={basePath} replace />
  }

  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]))
  const sessionQuestions: QuizQuestion[] = attempt.questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is QuizQuestion => Boolean(q))

  const incorrect = sessionQuestions.filter(
    (q) => !answersEqual(q, attempt.answers[q.id]),
  )

  const quizAttempts = state.quizAttempts.filter((a) => a.quizId === quiz.id)
  const bandColor =
    attempt.readiness === 'strong'
      ? 'text-success'
      : attempt.readiness === 'interview_ready'
        ? 'text-accent-muted'
        : attempt.readiness === 'developing'
          ? 'text-warning'
          : 'text-danger'

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
    return { label: 'Day assessment', to: `/day/${day.number}/quiz` }
  })()

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: `Day ${day.number}`, to: `/day/${day.number}` },
          {
            label: isModuleQuiz ? 'Module quiz' : 'Day assessment',
            to: basePath,
          },
          { label: 'Results' },
        ]}
      />

      <header className="mt-4 mb-6">
        <h1 className="font-serif text-2xl font-semibold">
          {isModuleQuiz ? 'Module quiz results' : 'Day assessment results'}
        </h1>
        <p className="mt-1 text-ink-muted">
          {quiz.title} · mode: {attempt.mode}
        </p>
      </header>

      <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
        <p className="text-sm text-ink-muted">Score</p>
        <p className="mt-1 text-5xl font-semibold tabular-nums text-ink">
          {attempt.percentage}%
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          {attempt.score}/{attempt.totalQuestions} correct ·{' '}
          <span className={`font-medium ${bandColor}`}>
            {readinessLabel(attempt.readiness)}
          </span>
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          {new Date(attempt.attemptedAt).toLocaleString()} · Best:{' '}
          {state.bestScores[quiz.id] ?? attempt.percentage}%
        </p>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {attempt.byDifficulty.map((d) => (
          <div
            key={d.difficulty}
            className="rounded-lg border border-border bg-surface p-3"
          >
            <p className="text-xs font-medium capitalize text-ink-faint">
              {d.difficulty}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {d.total ? `${d.percentage}%` : '—'}
            </p>
            <p className="text-xs text-ink-muted">
              {d.correct}/{d.total}
            </p>
          </div>
        ))}
      </section>

      {attempt.byTopic.length > 0 && (
        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-serif text-lg font-semibold">Topic-wise accuracy</h2>
          <ul className="mt-3 space-y-3">
            {attempt.byTopic.map((t) => (
              <li key={t.topic}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{t.topic}</span>
                  <span className="tabular-nums text-ink-muted">
                    {t.percentage}% ({t.correct}/{t.total})
                  </span>
                </div>
                <ProgressBar value={t.percentage} size="sm" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {incorrect.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg font-semibold">
            Wrong answer review ({incorrect.length})
          </h2>
          <div className="mt-4 space-y-4">
            {incorrect.map((q) => {
              const user = attempt.answers[q.id]
              const why = whyWrongFor(q, user)
              return (
                <article
                  key={q.id}
                  className="rounded-xl border border-danger/20 bg-danger-soft/30 p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-ink-faint">
                    {q.difficulty} · {q.topics.join(', ')}
                  </p>
                  <h3 className="mt-1 whitespace-pre-wrap font-medium text-ink">
                    {q.question}
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-ink-faint">Your answer</dt>
                      <dd className="text-danger">{formatAnswer(q, user)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-faint">Correct answer</dt>
                      <dd className="text-success">
                        {formatAnswer(q, q.correctAnswer)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-faint">Explanation</dt>
                      <dd className="text-ink-muted">{q.explanation}</dd>
                    </div>
                    {why && (
                      <div>
                        <dt className="text-ink-faint">Why yours is wrong</dt>
                        <dd className="text-ink-muted">{why}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-ink-faint">Interview takeaway</dt>
                      <dd className="font-medium text-ink">{q.interviewTakeaway}</dd>
                    </div>
                  </dl>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {quizAttempts.length > 1 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Attempt history</h2>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
            {[...quizAttempts].reverse().map((a) => (
              <li
                key={a.id}
                className="flex justify-between px-3 py-2 text-sm"
              >
                <span className="text-ink-muted">
                  {new Date(a.attemptedAt).toLocaleString()} · {a.mode}
                </span>
                <span className="font-medium tabular-nums">{a.percentage}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {isModuleQuiz && nextAfterModule && (
          <Link to={nextAfterModule.to}>
            <Button>{nextAfterModule.label}</Button>
          </Link>
        )}
        <Link to={`${basePath}?mode=full`}>
          <Button variant={isModuleQuiz ? 'secondary' : 'primary'}>
            Retake quiz
          </Button>
        </Link>
        {incorrect.length > 0 && (
          <Link to={`${basePath}?mode=incorrect`}>
            <Button variant="secondary">Retry incorrect</Button>
          </Link>
        )}
        <Link to={`/day/${day.number}`}>
          <Button variant="ghost">Back to day</Button>
        </Link>
      </div>
    </div>
  )
}
