import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  BarChart3,
} from 'lucide-react'
import { curriculum } from '@/data/curriculum'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import type { Day } from '@/types/curriculum'

export function Sidebar({
  collapsed,
  onToggle,
  activeDayId,
}: {
  collapsed: boolean
  onToggle: () => void
  activeDayId?: string
}) {
  const { getDaySummary, isPageComplete } = useProgress()
  const { user, logout } = useAuth()

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-72'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <Link to="/" className="truncate text-sm font-semibold text-accent">
            CS Interview Prep
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <NavLink to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavLink to="/progress" icon={BarChart3} label="Progress" collapsed={collapsed} />
        <NavLink
          to="/interview"
          icon={MessageSquare}
          label="Interview Mode"
          collapsed={collapsed}
        />

        {!collapsed && (
          <p className="mb-1 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Curriculum
          </p>
        )}

        {curriculum.map((day) => (
          <DayNav
            key={day.id}
            day={day}
            collapsed={collapsed}
            forceOpen={activeDayId === day.id}
            summary={getDaySummary(day.id)}
            isPageComplete={isPageComplete}
          />
        ))}
      </nav>

      <div className="border-t border-border p-2">
        {!collapsed && user && (
          <p className="mb-1 truncate px-2 text-xs text-ink-faint">
            Signed in as <span className="font-medium text-ink">{user.username}</span>
          </p>
        )}
        <button
          type="button"
          title="Sign out"
          onClick={() => {
            void logout()
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-surface-raised hover:text-ink"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

function NavLink({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string
  icon: typeof LayoutDashboard
  label: string
  collapsed: boolean
}) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`mb-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        active
          ? 'bg-accent-soft font-medium text-accent'
          : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

function DayNav({
  day,
  collapsed,
  forceOpen,
  summary,
  isPageComplete,
}: {
  day: Day
  collapsed: boolean
  forceOpen?: boolean
  summary: ReturnType<ReturnType<typeof useProgress>['getDaySummary']>
  isPageComplete: (pageId: string) => boolean
}) {
  const { state } = useProgress()
  const [open, setOpen] = useState(Boolean(forceOpen))
  const expanded = forceOpen || open

  if (collapsed) {
    return (
      <Link
        to={`/day/${day.number}`}
        title={`Day ${day.number}: ${day.shortTitle}`}
        className="mb-0.5 flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-raised hover:text-ink"
      >
        {day.number}
      </Link>
    )
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-raised"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        )}
        <span className="truncate font-medium text-ink">
          Day {day.number} — {day.shortTitle}
        </span>
        {summary?.status === 'completed' && (
          <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-success" />
        )}
      </button>

      {expanded && (
        <div className="ml-2 border-l border-border pl-2">
          <Link
            to={`/day/${day.number}`}
            className="mb-1 flex items-center gap-1.5 rounded px-1.5 py-1 text-xs text-ink-muted hover:bg-surface-raised hover:text-ink"
          >
            <BookOpen className="h-3 w-3" />
            Overview
          </Link>

          {day.modules.map((mod) => {
            const completed = mod.pages.filter((p) => isPageComplete(p.id)).length
            const pagesDone = completed === mod.pages.length && mod.pages.length > 0
            const hasQuiz = Boolean(mod.quiz && mod.quiz.questions.length > 0)
            const quizDone = hasQuiz
              ? Boolean(
                  summary &&
                    state.quizAttempts.some((a) => a.quizId === mod.quiz!.id),
                )
              : true
            return (
              <ModuleGroup
                key={mod.id}
                dayNumber={day.number}
                moduleId={mod.id}
                title={mod.title}
                allDone={pagesDone && quizDone}
                hasQuiz={hasQuiz}
                quizDone={hasQuiz ? quizDone : false}
                pages={mod.pages.map((p) => ({
                  id: p.id,
                  title: p.title,
                  done: isPageComplete(p.id),
                }))}
              />
            )
          })}

          <Link
            to={`/day/${day.number}/quiz`}
            className="mt-1 flex items-center gap-1.5 rounded px-1.5 py-1 text-xs text-ink-muted hover:bg-surface-raised hover:text-ink"
          >
            <ClipboardList className="h-3 w-3" />
            Day assessment
            {summary?.quizAttempted && (
              <CheckCircle2 className="h-3 w-3 text-success" />
            )}
          </Link>
        </div>
      )}
    </div>
  )
}

function ModuleGroup({
  dayNumber,
  moduleId,
  title,
  allDone,
  hasQuiz,
  quizDone,
  pages,
}: {
  dayNumber: number
  moduleId: string
  title: string
  allDone: boolean
  hasQuiz: boolean
  quizDone: boolean
  pages: { id: string; title: string; done: boolean }[]
}) {
  const [open, setOpen] = useState(true)
  const location = useLocation()
  const quizPath = `/day/${dayNumber}/module/${moduleId}/quiz`

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 rounded px-1.5 py-1 text-left text-xs font-medium text-ink-muted hover:bg-surface-raised"
      >
        {allDone ? (
          <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
        ) : (
          <Circle className="h-3 w-3 shrink-0 text-ink-faint" />
        )}
        <span className="truncate">{title}</span>
      </button>
      {open && (
        <ul className="ml-3 space-y-0.5">
          {pages.map((p) => {
            const to = `/day/${dayNumber}/page/${p.id}`
            const active = location.pathname === to
            return (
              <li key={p.id}>
                <Link
                  to={to}
                  className={`flex items-center gap-1.5 rounded px-1.5 py-1 text-xs transition-colors ${
                    active
                      ? 'bg-accent-soft font-medium text-accent'
                      : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
                  }`}
                >
                  {p.done ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-3 w-3 shrink-0 text-ink-faint" />
                  )}
                  <span className="truncate">{p.title}</span>
                </Link>
              </li>
            )
          })}
          {hasQuiz && (
            <li>
              <Link
                to={quizPath}
                className={`flex items-center gap-1.5 rounded px-1.5 py-1 text-xs transition-colors ${
                  location.pathname.startsWith(quizPath)
                    ? 'bg-accent-soft font-medium text-accent'
                    : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
                }`}
              >
                {quizDone ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
                ) : (
                  <ClipboardList className="h-3 w-3 shrink-0 text-accent-muted" />
                )}
                <span className="truncate">Module quiz</span>
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
