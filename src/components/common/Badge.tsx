import type { DayStatus } from '@/types/curriculum'

const styles: Record<DayStatus | 'quiz' | 'info', string> = {
  not_started: 'bg-surface-sunken text-ink-muted border-border',
  in_progress: 'bg-info-soft text-info border-info/20',
  completed: 'bg-success-soft text-success border-success/20',
  quiz: 'bg-warning-soft text-warning border-warning/20',
  info: 'bg-accent-soft text-accent border-accent/15',
}

export function Badge({
  status,
  children,
}: {
  status: DayStatus | 'quiz' | 'info'
  children: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {children}
    </span>
  )
}
