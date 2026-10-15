// What Lean said about a piece of code: a one-line verdict, its messages, and a stepper
// through the proof's goals.
import { verdict, walkable, type Message, type RunResult, type Step } from '../lean/results'
import { hintFor } from '../lean/hints'
import { Goals } from './Goal'

const isLint = (m: Message) => m.severity === 'warning' && /linter|is not explicitly referenced/i.test(m.text)

export function Verdict({ result }: { result: RunResult }) {
  const v = verdict(result)
  const hasDecl = result.steps.length > 0 || !result.messages.every((m) => m.severity === 'info')
  if (v === 'error') return <div className="verdict bad">✗ Lean rejects this</div>
  if (v === 'sorry') return <div className="verdict warn">⚠ Accepted, but it contains <code>sorry</code>: not proved</div>
  return <div className="verdict good">✓ {hasDecl ? 'Lean accepts this' : 'Lean ran it'}</div>
}

export function MessageList({ messages, hideLint = true }: { messages: Message[]; hideLint?: boolean }) {
  const shown = messages.filter((m) => !(hideLint && isLint(m)))
  if (!shown.length) return null
  return (
    <ul className="messages">
      {shown.map((m, i) => {
        const hint = m.severity === 'info' ? null : hintFor(m.text)
        return (
          <li key={i} className={`msg ${m.severity}`}>
            <div className="msg-head">
              <span className="msg-where">line {m.line}</span>
              {m.severity === 'info' ? 'output' : m.severity}
            </div>
            <pre className="msg-text">{m.text}</pre>
            {hint && <div className="msg-hint">{hint}</div>}
          </li>
        )
      })}
    </ul>
  )
}

export function Stepper({ steps, index, onIndex }: { steps: Step[]; index: number; onIndex: (i: number) => void }) {
  const walk = walkable(steps)
  const s = walk[index]
  if (!s) return null
  // the goals before the first step come from the `by` that opens its proof
  const start = steps.filter((t) => t.start && (t.line < s.line || (t.line === s.line && t.col <= s.col))).pop()
  return (
    <div className="stepper">
      <div className="stepper-bar">
        <button className="icon-btn" onClick={() => onIndex(index - 1)} disabled={index === 0} aria-label="Previous step">‹</button>
        <span className="step-label">
          Step {index + 1} of {walk.length}: <code>{s.tactic.split('\n')[0]}</code>
        </span>
        <button className="icon-btn" onClick={() => onIndex(index + 1)} disabled={index === walk.length - 1} aria-label="Next step">›</button>
      </div>
      <div className="step-goals">
        <Goals goals={s.goalsBefore.length ? s.goalsBefore : (start?.goalsBefore ?? [])} label="Before" />
        <Goals goals={s.goalsAfter} label="After" />
      </div>
    </div>
  )
}
