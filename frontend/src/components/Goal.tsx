// The goal display: what you have (above ⊢) and what you must prove (after ⊢).
import { LeanLine } from './LeanText'

interface Parsed {
  caseName: string | null
  hyps: string[]
  target: string | null
}

function parseGoal(text: string): Parsed {
  // a long hypothesis wraps onto lines that start with spaces
  const lines: string[] = []
  for (const l of text.split('\n')) {
    if (/^\s/.test(l) && lines.length) lines[lines.length - 1] += ' ' + l.trim()
    else lines.push(l)
  }
  let caseName: string | null = null
  if (lines[0]?.startsWith('case ')) caseName = lines.shift()!.slice(5)
  const t = lines.findIndex((l) => l.startsWith('⊢'))
  if (t < 0) return { caseName, hyps: lines, target: null }
  return { caseName, hyps: lines.slice(0, t), target: lines.slice(t).join(' ').replace(/^⊢\s*/, '') }
}

export function Goal({ text }: { text: string }) {
  const g = parseGoal(text)
  return (
    <div className="goal">
      {g.caseName && <div className="goal-case">case {g.caseName}</div>}
      {g.hyps.map((h, i) => (
        <div key={i} className="goal-hyp"><LeanLine text={h} /></div>
      ))}
      {g.target != null && (
        <div className="goal-target">
          <span className="turnstile" title="still to prove">⊢</span> <LeanLine text={g.target} />
        </div>
      )}
    </div>
  )
}

export function Goals({ goals, label }: { goals: string[]; label?: string }) {
  return (
    <div className="goals">
      {label && <div className="goals-label">{label}</div>}
      {goals.length === 0 ? (
        <div className="no-goals">No goals left: the proof is complete.</div>
      ) : (
        <>
          {goals.length > 1 && <div className="goals-count">{goals.length} goals, the first one is worked on next</div>}
          {goals.map((g, i) => <Goal key={i} text={g} />)}
        </>
      )}
    </div>
  )
}

/** A goal display written into lesson text as a plain ``` block. */
export function GoalText({ text }: { text: string }) {
  if (!text.includes('⊢')) return <pre className="plain">{text}</pre>
  return <div className="goals static">{text.split(/\n\s*\n/).map((g, i) => <Goal key={i} text={g} />)}</div>
}
