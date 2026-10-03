import { Link } from 'react-router-dom'
import {
  BookMarked,
  CalendarDays,
  ClipboardList,
  Target,
  Trophy,
} from 'lucide-react'
import { curriculum, getDayById } from '@/data/curriculum'
import { DayCard } from '@/components/dashboard/DayCard'
import { useProgress } from '@/context/ProgressContext'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { statusLabel } from '@/lib/progress'

export function Dashboard() {
  const { overall, getDaySummary, state, resetProgress } = useProgress()
  const currentDay = overall.currentDayId
    ? getDayById(overall.currentDayId)
    : curriculum[0]
  const currentSummary = currentDay ? getDaySummary(currentDay.id) : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          7-Day CS Interview Preparation
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted sm:text-base">
          Intensive prep for DBMS, Networks, OS, Linux, OOP, Cybersecurity, and
          cross-topic interviews. Study one day at a time, then take the assessment.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Overall progress
            </p>
            <p className="text-3xl font-semibold tabular-nums text-ink">
              {overall.percentage}%
            </p>
          </div>
          {currentDay && (
            <Link
              to={`/day/${currentDay.number}`}
              className="shrink-0 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Study Day {currentDay.number}
            </Link>
          )}
        </div>
        <ProgressBar value={overall.percentage} size="lg" />
      </section>

      <section className="mb-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={CalendarDays}
          label="Current Day"
          value={currentDay ? `Day ${currentDay.number}` : '—'}
          hint={currentDay?.title}
        />
        <Stat
          icon={Trophy}
          label="Overall Quiz Score"
          value={
            overall.overallQuizScore !== null
              ? `${overall.overallQuizScore}%`
              : '—'
          }
          hint="Average of best day scores"
        />
        <Stat
          icon={BookMarked}
          label="Topics Completed"
          value={`${overall.topicsCompleted}/${overall.totalTopics}`}
          hint="Modules fully studied"
        />
        <Stat
          icon={Target}
          label="Days Completed"
          value={`${overall.daysCompleted}/${overall.totalDays}`}
          hint="Pages + assessment done"
        />
      </section>

      {currentDay && currentSummary && (
        <section className="mb-8 rounded-xl border border-accent/20 bg-accent-soft/50 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-muted">
                What to study today
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
                Day {currentDay.number} — {currentDay.title}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {currentSummary.completedPages}/{currentSummary.totalPages} pages
                done · {statusLabel(currentSummary.status)}
                {currentSummary.bestQuizScore !== null
                  ? ` · best quiz ${currentSummary.bestQuizScore}%`
                  : ' · quiz not taken'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/day/${currentDay.number}`}
                className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Open day
              </Link>
              <Link
                to={`/day/${currentDay.number}/quiz`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-raised"
              >
                <ClipboardList className="h-4 w-4" />
                Start quiz
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">
            7-day schedule
          </h2>
          <p className="text-sm text-ink-muted">
            All days unlocked. Finish pages, then take the day assessment.
          </p>
        </div>
        {state.completedPages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Reset all local progress? This cannot be undone.')) {
                resetProgress()
              }
            }}
          >
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {curriculum.map((day) => {
          const summary = getDaySummary(day.id)!
          return <DayCard key={day.id} day={day} summary={summary} />
        })}
      </div>

      <section className="mt-10 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-serif text-lg font-semibold">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/interview"
            className="rounded-md border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-raised hover:text-ink"
          >
            Interview Mode
          </Link>
          <Link
            to="/progress"
            className="rounded-md border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-raised hover:text-ink"
          >
            Detailed Progress
          </Link>
        </div>
      </section>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Target
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-ink-faint">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 truncate text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}
