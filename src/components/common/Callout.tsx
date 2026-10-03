import type { CalloutVariant } from '@/types/curriculum'
import { AlertTriangle, Info, Lightbulb, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

const config: Record<
  CalloutVariant,
  { icon: typeof Info; className: string; defaultTitle: string }
> = {
  info: {
    icon: Info,
    className: 'border-info/25 bg-info-soft text-info',
    defaultTitle: 'Note',
  },
  tip: {
    icon: Lightbulb,
    className: 'border-success/25 bg-success-soft text-success',
    defaultTitle: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning/25 bg-warning-soft text-warning',
    defaultTitle: 'Warning',
  },
  mistake: {
    icon: XCircle,
    className: 'border-danger/25 bg-danger-soft text-danger',
    defaultTitle: 'Common Mistake',
  },
}

export function Callout({
  variant,
  title,
  children,
}: {
  variant: CalloutVariant
  title?: string
  children: ReactNode
}) {
  const c = config[variant]
  const Icon = c.icon
  return (
    <div className={`my-4 rounded-lg border px-4 py-3 ${c.className}`}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 shrink-0" />
        {title ?? c.defaultTitle}
      </div>
      <div className="text-sm leading-relaxed text-ink/90">{children}</div>
    </div>
  )
}
