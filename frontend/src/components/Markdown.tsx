import { Fragment } from 'react'
import { parseBlocks, parseInline } from '../content/markdown'
import { CodeBlock } from './CodeBlock'
import { GoalText } from './Goal'

export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((t, i) =>
        t.kind === 'code' ? <code key={i} className="ic">{t.text}</code>
          : t.kind === 'b' ? <strong key={i}>{t.text}</strong>
          : t.kind === 'i' ? <em key={i}>{t.text}</em>
          : <Fragment key={i}>{t.text}</Fragment>,
      )}
    </>
  )
}

export function Markdown({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={`md ${compact ? 'compact' : ''}`}>
      {parseBlocks(text).map((b, i) => {
        switch (b.kind) {
          case 'p': return <p key={i}><Inline text={b.text} /></p>
          case 'h': return <h3 key={i}><Inline text={b.text} /></h3>
          case 'callout': return <div key={i} className="callout"><Inline text={b.text} /></div>
          case 'ul': return <ul key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul>
          case 'ol': return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ol>
          case 'code':
            return b.lang === 'lean'
              ? <CodeBlock key={i} code={b.code} runnable={b.expect !== 'skip'} mathlib={b.mathlib} />
              : <GoalText key={i} text={b.code} />
        }
      })}
    </div>
  )
}
