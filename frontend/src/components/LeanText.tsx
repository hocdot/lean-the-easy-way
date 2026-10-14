import { tokenize, tokenizeBlock, type Token } from '../lean/highlight'

function Tok({ t }: { t: Token }) {
  return t.kind === 'text' ? <>{t.text}</> : <span className={`tk-${t.kind}`}>{t.text}</span>
}

/** One line of Lean, highlighted. */
export function LeanLine({ text }: { text: string }) {
  return <span className="lean">{tokenize(text).map((t, i) => <Tok key={i} t={t} />)}</span>
}

/** A block of Lean, highlighted, one element per line (so lines can be marked). */
export function LeanLines({ code, mark, marks }: { code: string; mark?: number | null; marks?: Record<number, string> }) {
  return (
    <>
      {tokenizeBlock(code).map((toks, i) => (
        <div key={i} className={`ln ${mark === i + 1 ? 'marked' : ''} ${marks?.[i + 1] ?? ''}`}>
          {toks.length ? toks.map((t, j) => <Tok key={j} t={t} />) : '​'}
        </div>
      ))}
    </>
  )
}
