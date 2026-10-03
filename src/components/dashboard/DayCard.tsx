import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, ClipboardList, FileText } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { ProgressBar } from '@/components/common/ProgressBar'
import { formatMinutes, statusLabel } from '@/lib/progress'
import type { Day, DayProgressSummary } from '@/types/curriculum'

export function DayCard({
  day,
  summary,
}: {
  day: Day
  summary: DayProgressSummary
}) {
  const pageCount = day.modules.reduce((n, m) => n + m.pages.length, 0)
  const cta =
    summary.status === 'not_started'
      ? 'Start'
      : summary.status === 'completed'
        ? 'Review'
        : 'Continue'

  const firstPage = day.modules[0]?.pages[0]
  const href =
    summary.status === 'not_started' && firstPage
      ? `/day/${day.number}/page/${firstPage.id}`
      : `/day/${day.number}`

  const readyNext =
    summary.completedPages === summary.totalPages && summary.quizAttempted

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          {day.number}
        </div>
        <Badge status={summary.status}>{statusLabel(summary.status)}</Badge>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Day {day.number}
      </p>
      <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
        {day.title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {day.topics.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded bg-surface-sunken px-1.5 py-0.5 text-[11px] text-ink-muted"
          >
            {t}
          </span>
        ))}
        {day.topics.length > 4 && (
          <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[11px] text-ink-faint">
            +{day.topics.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {summary.completedPages}/{pageCount} pages
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatMinutes(day.estimatedMinutes)}
        </span>
        <span className="inline-flex items-center gap-1">
          <ClipboardList className="h-3.5 w-3.5" />
          {summary.bestQuizScore !== null
            ? `Quiz ${summary.bestQuizScore}%`
            : 'Quiz pending'}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-ink-muted">Progress</span>
          <span className="font-medium tabular-nums text-ink">{summary.percentage}%</span>
        </div>
        <ProgressBar value={summary.percentage} />
        {readyNext && day.number < 7 && (
          <p className="mt-2 text-xs text-success">Ready for Day {day.number + 1}</p>
        )}
        {summary.completedPages === summary.totalPages && !summary.quizAttempted && (
          <p className="mt-2 text-xs text-accent-muted">Pages done — take the quiz</p>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Link
          to={href}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          {summary.status === 'completed' && (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {cta}
          <ArrowRight className="h-4 w-4 opacity-80" />
        </Link>
      </div>
    </article>
  )
}
