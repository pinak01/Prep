export function ProgressBar({
  value,
  size = 'md',
  showLabel = false,
  className = '',
}: {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-full overflow-hidden rounded-full bg-border ${heights[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heights[size]} rounded-full bg-accent-muted transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-ink-muted">
          {clamped}%
        </span>
      )}
    </div>
  )
}
