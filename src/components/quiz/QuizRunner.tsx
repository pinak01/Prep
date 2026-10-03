import { useMemo, useState } from 'react'
import { CheckSquare, Square } from 'lucide-react'
import type { QuizQuestion } from '@/types/curriculum'
import { Button } from '@/components/common/Button'
import { CodeBlock } from '@/components/common/CodeBlock'
import { ProgressBar } from '@/components/common/ProgressBar'

export type AnswerValue = number | number[] | string

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

export function QuizRunner({
  questions,
  onSubmit,
  title,
}: {
  questions: QuizQuestion[]
  onSubmit: (answers: Record<string, AnswerValue>) => void
  title?: string
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})

  const q = questions[index]
  const answeredCount = useMemo(
    () => questions.filter((item) => isAnswered(answers[item.id])).length,
    [answers, questions],
  )

  if (!q) return null

  const current = answers[q.id]
  const currentAnswered = isAnswered(current)
  const isLast = index >= questions.length - 1

  function setAnswer(value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [q.id]: value }))
  }

  function toggleMulti(optionIndex: number) {
    const prev = Array.isArray(current) ? [...current] : []
    const pos = prev.indexOf(optionIndex)
    if (pos >= 0) prev.splice(pos, 1)
    else prev.push(optionIndex)
    setAnswer(prev)
  }

  function handlePrimary() {
    if (!currentAnswered) return
    if (isLast) onSubmit(answers)
    else setIndex((i) => i + 1)
  }

  return (
    <div className="mx-auto max-w-2xl">
      {title && (
        <p className="mb-2 text-sm font-medium text-ink-muted">{title}</p>
      )}
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-ink-muted">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span className="tabular-nums">
          Answered {answeredCount}/{questions.length}
        </span>
      </div>
      <ProgressBar
        value={Math.round(((index + 1) / questions.length) * 100)}
        className="mb-6"
        size="sm"
      />

      <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-surface-sunken px-2 py-0.5 capitalize text-ink-muted">
            {q.difficulty}
          </span>
          <span className="rounded bg-surface-sunken px-2 py-0.5 uppercase text-ink-faint">
            {q.type}
          </span>
          {q.topics.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded bg-accent-soft px-2 py-0.5 text-accent"
            >
              {t}
            </span>
          ))}
        </div>

        <h2 className="whitespace-pre-wrap font-serif text-xl font-semibold text-ink">
          {q.question}
        </h2>
        <p className="mt-2 text-xs text-ink-faint">
          Objective: {q.learningObjective}
        </p>

        {q.codeSnippet && (
          <div className="mt-4">
            <CodeBlock
              language={q.codeSnippet.language}
              code={q.codeSnippet.code}
            />
          </div>
        )}

        <div className="mt-5 space-y-2">
          {q.type === 'numerical' ? (
            <input
              type="text"
              value={typeof current === 'string' ? current : ''}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your calculated answer"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm outline-none focus:border-accent-muted"
              autoFocus
            />
          ) : q.type === 'multi' ? (
            (q.options ?? []).map((opt, i) => {
              const selected = Array.isArray(current) && current.includes(i)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleMulti(i)}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? 'border-accent bg-accent-soft text-ink'
                      : 'border-border hover:bg-surface-raised'
                  }`}
                >
                  {selected ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                  )}
                  <span>{opt}</span>
                </button>
              )
            })
          ) : (
            (q.options ?? []).map((opt, i) => {
              const selected = Number(current) === i
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswer(i)}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? 'border-accent bg-accent-soft text-ink'
                      : 'border-border hover:bg-surface-raised'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-accent bg-accent' : 'border-ink-faint'
                    }`}
                  >
                    {selected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span>{opt}</span>
                </button>
              )
            })
          )}
        </div>

        {q.type === 'multi' && (
          <p className="mt-3 text-xs text-ink-faint">Select all that apply.</p>
        )}
      </article>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        <div className="flex flex-wrap gap-2">
          {!isLast && (
            <Button variant="ghost" onClick={() => setIndex((i) => i + 1)}>
              Skip
            </Button>
          )}
          <Button onClick={handlePrimary} disabled={!currentAnswered}>
            {isLast ? 'Submit assessment' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
