import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, MessageSquare, Zap } from 'lucide-react'
import {
  collectInterviewQuestions,
  curriculum,
  getDayById,
} from '@/data/curriculum'
import { getHardQuestionsFromDays } from '@/data/quizzes'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/common/Button'
import { Callout } from '@/components/common/Callout'
import { ProgressBar } from '@/components/common/ProgressBar'
import { QuizRunner, type AnswerValue } from '@/components/quiz/QuizRunner'
import { useProgress } from '@/context/ProgressContext'
import {
  formatAnswer,
  readinessLabel,
  scoreAttempt,
  shuffle,
  whyWrongFor,
} from '@/lib/quiz'
import type { QuizAttempt, QuizQuestion } from '@/types/curriculum'
import { getDayStatus } from '@/lib/progress'

type Tab = 'rapid' | 'verbal'

export function InterviewMode() {
  const { state, recordQuizAttempt } = useProgress()
  const [tab, setTab] = useState<Tab>('rapid')
  const [session, setSession] = useState<QuizQuestion[] | null>(null)
  const [result, setResult] = useState<QuizAttempt | null>(null)

  const completedDayIds = useMemo(
    () =>
      curriculum
        .filter((d) => getDayStatus(state, d) === 'completed')
        .map((d) => d.id),
    [state],
  )

  // Fallback: days with any quiz attempt or best score if none fully completed
  const sourceDayIds =
    completedDayIds.length > 0
      ? completedDayIds
      : curriculum
          .filter(
            (d) =>
              state.quizAttempts.some((a) => a.dayId === d.id) ||
              (state.bestScores[d.quiz.id] ?? 0) > 0,
          )
          .map((d) => d.id)

  const hardPool = useMemo(
    () => getHardQuestionsFromDays(sourceDayIds.length ? sourceDayIds : ['day-1']),
    [sourceDayIds],
  )

  function startRapid() {
    const pool =
      hardPool.length > 0
        ? hardPool
        : curriculum.flatMap((d) =>
            d.quiz.questions.filter((q) => q.difficulty === 'hard'),
          )
    if (pool.length === 0) return
    const picked = shuffle(pool).slice(0, Math.min(20, pool.length))
    setResult(null)
    setSession(picked)
  }

  function submitRapid(answers: Record<string, AnswerValue>) {
    if (!session) return
    const attempt = scoreAttempt({
      quizId: 'interview-rapid',
      dayId: 'interview',
      mode: 'interview',
      questions: session,
      answers,
    })
    recordQuizAttempt(attempt)
    setResult(attempt)
    setSession(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Interview Mode' },
        ]}
      />

      <header className="mt-4 mb-6">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Interview Mode
        </h1>
        <p className="mt-2 text-ink-muted">
          Rapid scored assessment from hard questions, plus verbal prompt practice.
        </p>
      </header>

      <div className="mb-6 flex gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setTab('rapid')}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
            tab === 'rapid'
              ? 'bg-accent-soft text-accent'
              : 'text-ink-muted hover:bg-surface-raised'
          }`}
        >
          <Zap className="h-4 w-4" />
          Rapid Assessment
        </button>
        <button
          type="button"
          onClick={() => setTab('verbal')}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
            tab === 'verbal'
              ? 'bg-accent-soft text-accent'
              : 'text-ink-muted hover:bg-surface-raised'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Verbal prompts
        </button>
      </div>

      {tab === 'rapid' ? (
        <RapidPanel
          sourceDayIds={sourceDayIds}
          hardCount={hardPool.length}
          session={session}
          result={result}
          onStart={startRapid}
          onSubmit={submitRapid}
          onClearResult={() => setResult(null)}
        />
      ) : (
        <VerbalPanel />
      )}
    </div>
  )
}

function RapidPanel({
  sourceDayIds,
  hardCount,
  session,
  result,
  onStart,
  onSubmit,
  onClearResult,
}: {
  sourceDayIds: string[]
  hardCount: number
  session: QuizQuestion[] | null
  result: QuizAttempt | null
  onStart: () => void
  onSubmit: (a: Record<string, AnswerValue>) => void
  onClearResult: () => void
}) {
  if (session) {
    return (
      <QuizRunner
        questions={session}
        onSubmit={onSubmit}
        title="Rapid Interview · 20 hard questions · answers hidden until the end"
      />
    )
  }

  if (result) {
    return (
      <div>
        <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
          <p className="text-sm text-ink-muted">Rapid Assessment score</p>
          <p className="mt-1 text-5xl font-semibold tabular-nums">
            {result.percentage}%
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            {result.score}/{result.totalQuestions} ·{' '}
            {readinessLabel(result.readiness)}
          </p>
        </div>

        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-serif text-lg font-semibold">Topic breakdown</h2>
          <ul className="mt-3 space-y-3">
            {result.byTopic.map((t) => (
              <li key={t.topic}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{t.topic}</span>
                  <span className="tabular-nums text-ink-muted">
                    {t.percentage}%
                  </span>
                </div>
                <ProgressBar value={t.percentage} size="sm" />
              </li>
            ))}
          </ul>
        </section>

        {result.incorrectQuestionIds.length > 0 && (
          <section className="mt-6">
            <h2 className="font-serif text-lg font-semibold">Missed questions</h2>
            <div className="mt-3 space-y-3">
              {result.incorrectQuestionIds.map((id) => {
                const q = curriculum
                  .flatMap((d) => d.quiz.questions)
                  .find((x) => x.id === id)
                if (!q) return null
                const user = result.answers[id]
                const why = whyWrongFor(q, user)
                return (
                  <article
                    key={id}
                    className="rounded-lg border border-border bg-surface p-3 text-sm"
                  >
                    <p className="font-medium whitespace-pre-wrap">{q.question}</p>
                    <p className="mt-2 text-danger">
                      Yours: {formatAnswer(q, user)}
                    </p>
                    <p className="text-success">
                      Correct: {formatAnswer(q, q.correctAnswer)}
                    </p>
                    <p className="mt-1 text-ink-muted">{q.explanation}</p>
                    {why && <p className="mt-1 text-ink-muted">{why}</p>}
                    <p className="mt-1 font-medium">{q.interviewTakeaway}</p>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <div className="mt-6 flex gap-2">
          <Button
            onClick={() => {
              onClearResult()
              onStart()
            }}
          >
            Run again
          </Button>
          <Button variant="secondary" onClick={onClearResult}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Callout variant="info" title="How it works">
        Pulls up to 20 hard questions at random from completed days (falls back to
        attempted days / Day 1). One question at a time — no answers until you
        finish.
      </Callout>
      <p className="mt-4 text-sm text-ink-muted">
        Source days:{' '}
        {sourceDayIds.length
          ? sourceDayIds
              .map((id) => getDayById(id)?.shortTitle ?? id)
              .join(', ')
          : 'Day 1 (default)'}
        {' · '}
        Hard pool size: {hardCount || 'using curriculum hard set'}
      </p>
      <Button className="mt-4" onClick={onStart}>
        Start Rapid Assessment
      </Button>
    </div>
  )
}

function VerbalPanel() {
  const all = useMemo(() => collectInterviewQuestions(), [])
  const [dayFilter, setDayFilter] = useState<string>('all')
  const [advancedOnly, setAdvancedOnly] = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const questions = all.filter((q) => {
    if (dayFilter !== 'all' && q.dayId !== dayFilter) return false
    if (advancedOnly && !q.advanced) return false
    return true
  })

  return (
    <div>
      <p className="mb-4 text-sm text-ink-muted">
        Practice structured verbal answers. No scoring — speak aloud.
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
          <Filter className="h-4 w-4" />
          <select
            value={dayFilter}
            onChange={(e) => {
              setDayFilter(e.target.value)
              setRevealed(new Set())
            }}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-ink"
          >
            <option value="all">All days</option>
            {curriculum.map((d) => (
              <option key={d.id} value={d.id}>
                Day {d.number} — {d.shortTitle}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={advancedOnly}
            onChange={(e) => setAdvancedOnly(e.target.checked)}
          />
          Advanced only
        </label>
        <span className="text-xs text-ink-faint">{questions.length} prompts</span>
      </div>
      <ul className="space-y-3">
        {questions.slice(0, 80).map((q, i) => (
          <li
            key={`${q.pageId}-${i}-${q.question.slice(0, 24)}`}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="mb-2 text-xs text-ink-faint">
              Day {q.dayNumber} · {q.dayTitle} · {q.pageTitle}
              {q.advanced ? ' · Advanced' : ''}
            </div>
            <p className="font-medium text-ink">{q.question}</p>
            <button
              type="button"
              onClick={() =>
                setRevealed((prev) => {
                  const next = new Set(prev)
                  if (next.has(i)) next.delete(i)
                  else next.add(i)
                  return next
                })
              }
              className="mt-3 text-xs font-medium text-accent-muted hover:underline"
            >
              {revealed.has(i) ? 'Hide study link' : 'Open related study page'}
            </button>
            {revealed.has(i) && (
              <p className="mt-2 text-sm text-ink-muted">
                Review{' '}
                <Link
                  to={`/day/${q.dayNumber}/page/${q.pageId}`}
                  className="text-accent-muted underline"
                >
                  {q.pageTitle}
                </Link>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
