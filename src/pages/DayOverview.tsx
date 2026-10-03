import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
} from 'lucide-react'
import { getDayByNumber } from '@/data/curriculum'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Badge } from '@/components/common/Badge'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useProgress } from '@/context/ProgressContext'
import { formatMinutes, getModuleProgress, statusLabel } from '@/lib/progress'

export function DayOverview() {
  const { dayNumber } = useParams()
  const num = Number(dayNumber)
  const day = getDayByNumber(num)
  const { getDaySummary, isPageComplete, state } = useProgress()

  if (!day || Number.isNaN(num)) return <Navigate to="/" replace />

  const summary = getDaySummary(day.id)!
  const firstIncomplete = day.modules
    .flatMap((m) => m.pages)
    .find((p) => !isPageComplete(p.id))

  // Prefer unfinished module quiz when all pages in that module are done
  const pendingModuleQuiz = day.modules.find((m) => {
    if (!m.quiz || m.quiz.questions.length === 0) return false
    const pagesDone = m.pages.every((p) => isPageComplete(p.id))
    const quizDone = state.quizAttempts.some((a) => a.quizId === m.quiz!.id)
    return pagesDone && !quizDone
  })

  const continueHref = pendingModuleQuiz
    ? `/day/${day.number}/module/${pendingModuleQuiz.id}/quiz`
    : firstIncomplete
      ? `/day/${day.number}/page/${firstIncomplete.id}`
      : `/day/${day.number}/quiz`

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: `Day ${day.number}` },
        ]}
      />

      <header className="mt-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge status={summary.status}>{statusLabel(summary.status)}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
            <Clock className="h-3.5 w-3.5" />
            {formatMinutes(day.estimatedMinutes)}
          </span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
          Day {day.number} — {day.title}
        </h1>
        <p className="mt-2 text-ink-muted">{day.description}</p>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-ink-muted">
              {summary.completedPages}/{summary.totalPages} pages
              {summary.moduleQuizzesTotal > 0
                ? ` · ${summary.moduleQuizzesCompleted}/${summary.moduleQuizzesTotal} module quizzes`
                : ''}
              {summary.quizAttempted
                ? ' · Day assessment done'
                : ' · Day assessment pending'}
            </span>
            <span className="font-medium tabular-nums">{summary.percentage}%</span>
          </div>
          <ProgressBar value={summary.percentage} size="lg" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={continueHref}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {summary.status === 'not_started' ? 'Start studying' : 'Continue studying'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={`/day/${day.number}/quiz`}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-raised"
          >
            <ClipboardList className="h-4 w-4" />
            Day Assessment
            {summary.bestQuizScore !== null
              ? ` · best ${summary.bestQuizScore}%`
              : ' · 30 questions'}
          </Link>
          {summary.status === 'completed' && day.number < 7 && (
            <Link
              to={`/day/${day.number + 1}`}
              className="inline-flex items-center gap-2 rounded-md border border-success/30 bg-success-soft px-4 py-2 text-sm font-medium text-success hover:opacity-90"
            >
              Next: Day {day.number + 1}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {summary.completedPages === summary.totalPages && !summary.quizAttempted && (
          <p className="mt-3 text-sm text-accent-muted">
            All study pages complete. Take the day assessment to finish Day {day.number}.
          </p>
        )}
        {summary.status === 'completed' && (
          <p className="mt-3 text-sm text-success">
            Day {day.number} complete
            {day.number < 7
              ? ` — you can move to Day ${day.number + 1}.`
              : ' — use Interview Mode for final drills.'}
          </p>
        )}
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Topics
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {day.topics.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {day.modules.map((mod, mi) => {
          const mp = getModuleProgress(state, day, mod.id)
          return (
            <div
              key={mod.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-ink-faint">
                    Module {mi + 1}
                  </p>
                  <h3 className="font-serif text-lg font-semibold text-ink">
                    {mod.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">{mod.description}</p>
                </div>
                <span className="shrink-0 text-xs font-medium tabular-nums text-ink-muted">
                  {mp.completedPages}/{mp.totalPages}
                </span>
              </div>
              <ProgressBar value={mp.percentage} size="sm" className="mb-3" />
              <ul className="divide-y divide-border rounded-lg border border-border">
                {mod.pages.map((page, pi) => {
                  const done = isPageComplete(page.id)
                  return (
                    <li key={page.id}>
                      <Link
                        to={`/day/${day.number}/page/${page.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-raised"
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-ink-faint" />
                        )}
                        <span className="min-w-0 flex-1 truncate font-medium text-ink">
                          <span className="mr-2 text-ink-faint">
                            {mi + 1}.{pi + 1}
                          </span>
                          {page.title}
                        </span>
                        <span className="shrink-0 text-xs text-ink-faint">
                          {page.estimatedMinutes} min
                        </span>
                      </Link>
                    </li>
                  )
                })}
                {mp.hasQuiz && (
                  <li>
                    <Link
                      to={`/day/${day.number}/module/${mod.id}/quiz`}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-raised"
                    >
                      {mp.quizAttempted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <ClipboardList className="h-4 w-4 shrink-0 text-accent-muted" />
                      )}
                      <span className="min-w-0 flex-1 font-medium text-ink">
                        Module quiz — {mod.title}
                      </span>
                      <span className="shrink-0 text-xs text-ink-faint">
                        {mp.bestQuizScore !== null
                          ? `Best ${mp.bestQuizScore}%`
                          : '8 questions'}
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )
        })}
      </section>
    </div>
  )
}
