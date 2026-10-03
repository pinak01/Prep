import type { ContentBlock } from '@/types/curriculum'
import { Callout } from '@/components/common/Callout'
import { CodeBlock } from '@/components/common/CodeBlock'
import { MermaidDiagram } from '@/components/common/MermaidDiagram'

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-study">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>
    case 'heading':
      return block.level === 2 ? <h2>{block.text}</h2> : <h3>{block.text}</h3>
    case 'list':
      return block.ordered ? (
        <ol>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'code':
      return (
        <CodeBlock
          code={block.code}
          language={block.language}
          caption={block.caption}
        />
      )
    case 'table':
      return (
        <div className="my-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-raised text-ink-muted">
              <tr>
                {block.headers.map((h) => (
                  <th key={h} className="border-b border-border px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && (
            <p className="border-t border-border bg-surface-raised px-3 py-2 text-xs text-ink-muted">
              {block.caption}
            </p>
          )}
        </div>
      )
    case 'callout':
      return (
        <Callout variant={block.variant} title={block.title}>
          {block.text}
        </Callout>
      )
    case 'diagram':
      if (!block.mermaid?.trim()) {
        return (
          <div className="my-4 rounded-lg border border-border bg-surface-raised p-4">
            <p className="text-sm text-ink-muted">Diagram unavailable.</p>
            {block.caption && (
              <p className="mt-2 text-xs text-ink-faint">{block.caption}</p>
            )}
          </div>
        )
      }
      return <MermaidDiagram chart={block.mermaid} caption={block.caption} />
    case 'example':
      return (
        <div className="my-4 rounded-lg border border-border bg-surface p-4">
          <h3 className="!mt-0 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Example: {block.title}
          </h3>
          <ContentBlocks blocks={block.blocks} />
        </div>
      )
    case 'numerical':
      return (
        <div className="my-4 rounded-lg border border-border bg-surface p-4">
          <h3 className="!mt-0 font-semibold">{block.title}</h3>
          <p className="text-sm font-medium text-ink-muted">Problem</p>
          <p className="whitespace-pre-wrap text-sm">{block.problem}</p>
          <p className="mt-3 text-sm font-medium text-ink-muted">Solution</p>
          <p className="whitespace-pre-wrap text-sm">{block.solution}</p>
        </div>
      )
    default:
      return null
  }
}
