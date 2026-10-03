import { Link } from 'react-router-dom'
import { curriculum } from '@/data/curriculum'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Badge } from '@/components/common/Badge'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useProgress } from '@/context/ProgressContext'
import { getModuleProgress, statusLabel } from '@/lib/progress'
import { getLatestAttemptForQuiz } from '@/lib/storage'

export function ProgressPage() {
  const { overall, getDaySummary, state } = useProgress()

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Progress' },
        ]}
      />

      <header className="mt-4 mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink">Progress</h1>
        <p className="mt-2 text-ink-muted">
          Track completion across overall → day → module → page.
        </p>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Overall" value={`${overall.percentage}%`} />
        <Metric
          label="Overall Quiz Score"
          value={
            overall.overallQuizScore !== null
              ? `${overall.overallQuizScore}%`
              : '—'
          }
        />
        <Metric
          label="Topics Completed"
          value={`${overall.topicsCompleted}/${overall.totalTopics}`}
        />
        <Metric
          label="Days Completed"
          value={`${overall.daysCompleted}/${overall.totalDays}`}
        />
      </section>

      <div className="mb-8">
        <ProgressBar value={overall.percentage} size="lg" showLabel />
      </div>

      <div className="space-y-5">
        {curriculum.map((day) => {
          const summary = getDaySummary(day.id)!
          const latest = getLatestAttemptForQuiz(state.quizAttempts, day.quiz.id)
          return (
            <section
              key={day.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/day/${day.number}`}
                    className="font-serif text-lg font-semibold text-ink hover:text-accent-muted"
                  >
                    Day {day.number} — {day.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink-muted">
                    {summary.completedPages}/{summary.totalPages} pages ·{' '}
                    {summary.quizAttempted
                      ? `Quiz ${latest?.percentage ?? 0}%`
                      : 'Quiz not attempted'}
                  </p>
                </div>
                <Badge status={summary.status}>
                  {statusLabel(summary.status)}
                </Badge>
              </div>
              <ProgressBar
                value={summary.percentage}
                className="mt-3"
                showLabel
              />

              <div className="mt-4 space-y-3">
                {day.modules.map((mod) => {
                  const mp = getModuleProgress(state, day, mod.id)
                  return (
                    <div key={mod.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-ink">{mod.title}</span>
                        <span className="tabular-nums text-ink-muted">
                          {mp.percentage}%
                        </span>
                      </div>
                      <ProgressBar value={mp.percentage} size="sm" />
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
