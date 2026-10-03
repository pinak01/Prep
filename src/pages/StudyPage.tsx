import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import {
  findPageLocation,
  getAdjacentPages,
  pageHasContent,
} from '@/data/curriculum'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/common/Button'
import { Callout } from '@/components/common/Callout'
import { ProgressBar } from '@/components/common/ProgressBar'
import { ContentBlocks } from '@/components/study/ContentBlocks'
import { useProgress } from '@/context/ProgressContext'

export function StudyPage() {
  const { dayNumber, pageId } = useParams()
  const loc = pageId ? findPageLocation(pageId) : null
  const adjacent = pageId ? getAdjacentPages(pageId) : null
  const {
    isPageComplete,
    markPageComplete,
    markPageIncomplete,
    setLastVisited,
  } = useProgress()

  useEffect(() => {
    if (!pageId) return
    const found = findPageLocation(pageId)
    if (!found) return
    setLastVisited(found.page.id, found.day.id)
  }, [pageId, setLastVisited])

  if (!loc || String(loc.day.number) !== dayNumber) {
    return <Navigate to="/" replace />
  }

  const { day, module, page, pageIndexInDay, allDayPages } = loc
  const done = isPageComplete(page.id)
  const hasContent = pageHasContent(page)
  const progressPct = Math.round(
    ((pageIndexInDay + (done ? 1 : 0)) / allDayPages.length) * 100,
  )

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: `Day ${day.number}`, to: `/day/${day.number}` },
          { label: module.title },
          { label: page.title },
        ]}
      />

      <header className="mt-4 mb-6 border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Day {day.number} · {module.title}
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          {page.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            ~{page.estimatedMinutes} min
          </span>
          <span>
            Page {pageIndexInDay + 1} of {allDayPages.length}
          </span>
          {done && (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>
        <ProgressBar value={progressPct} className="mt-3" size="sm" showLabel />
      </header>

      {page.learningObjectives.length > 0 && (
        <section className="mb-6 rounded-lg border border-border bg-accent-soft/60 p-4">
          <h2 className="text-sm font-semibold text-accent">Learning objectives</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
            {page.learningObjectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      )}

      {!hasContent ? (
        <Callout variant="warning" title="Content missing">
          This page has no study sections. Skip to the next page or return to the day overview.
        </Callout>
      ) : (
        <div className="space-y-6">
          {page.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="font-serif text-xl font-semibold text-ink">
                {section.title}
              </h2>
              <ContentBlocks blocks={section.blocks} />
            </section>
          ))}
        </div>
      )}

      {page.commonMistakes.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg font-semibold">Common mistakes</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {page.commonMistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {page.interviewQuestions.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg font-semibold">Basic interview questions</h2>
          <ul className="mt-2 space-y-2">
            {page.interviewQuestions.map((q) => (
              <li
                key={q}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {page.intermediateInterviewQuestions.length > 0 && (
        <section className="mt-6">
          <h2 className="font-serif text-lg font-semibold">
            Intermediate interview questions
          </h2>
          <ul className="mt-2 space-y-2">
            {page.intermediateInterviewQuestions.map((q) => (
              <li
                key={q}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {page.advancedInterviewQuestions.length > 0 && (
        <section className="mt-6">
          <h2 className="font-serif text-lg font-semibold">
            Advanced interview questions
          </h2>
          <ul className="mt-2 space-y-2">
            {page.advancedInterviewQuestions.map((q) => (
              <li
                key={q}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {page.interviewReadyAnswers.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="font-serif text-lg font-semibold">
            Interview-ready answers
          </h2>
          {page.interviewReadyAnswers.map((item) => (
            <details
              key={item.question}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <summary className="cursor-pointer text-sm font-medium text-ink">
                {item.question}
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </section>
      )}

      {page.keyTakeaways.length > 0 && (
        <section className="mt-8 rounded-lg border border-border bg-surface-raised p-4">
          <h2 className="text-sm font-semibold text-ink">Key takeaways</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {page.keyTakeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        {adjacent?.prev ? (
          <Link to={`/day/${day.number}/page/${adjacent.prev.id}`}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          </Link>
        ) : (
          <Link to={`/day/${day.number}`}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Day overview
            </Button>
          </Link>
        )}

        <Button
          variant={done ? 'secondary' : 'primary'}
          onClick={() =>
            done ? markPageIncomplete(page.id) : markPageComplete(page.id)
          }
        >
          {done ? (
            <>
              <Circle className="h-4 w-4" />
              Mark incomplete
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Mark complete
            </>
          )}
        </Button>

        {adjacent?.nextIsModuleQuiz ? (
          <Link
            to={`/day/${day.number}/module/${adjacent.module.id}/quiz`}
            onClick={() => markPageComplete(page.id)}
          >
            <Button variant="secondary">
              Module quiz
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : adjacent?.next ? (
          <Link
            to={`/day/${day.number}/page/${adjacent.next.id}`}
            onClick={() => markPageComplete(page.id)}
          >
            <Button variant="secondary">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link
            to={`/day/${day.number}/quiz`}
            onClick={() => markPageComplete(page.id)}
          >
            <Button variant="secondary">
              Day assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </footer>
    </div>
  )
}
