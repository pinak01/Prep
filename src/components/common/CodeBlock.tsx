import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CodeBlock({
  code,
  language,
  caption,
}: {
  code: string
  language: string
  caption?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-border bg-[#0f172a]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-xs text-slate-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
        <code className="font-mono">{code}</code>
      </pre>
      {caption && (
        <figcaption className="border-t border-white/10 px-3 py-2 text-xs text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
