/**
 * Diagram display without an external Mermaid runtime dependency.
 * Charts are authored in Mermaid syntax for readability; we show a clean source view.
 */
export function MermaidDiagram({
  chart,
  caption,
}: {
  chart: string
  caption?: string
}) {
  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border bg-surface-raised px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
        Diagram
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-ink">
        {chart.trim()}
      </pre>
      {caption && (
        <figcaption className="border-t border-border bg-surface-raised px-3 py-2 text-xs text-ink-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
