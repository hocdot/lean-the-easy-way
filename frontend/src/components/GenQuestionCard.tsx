// A generated question about students. Wrong picks are explained with a small group of
// students where the pick and the right answer disagree.
import { useEffect, useState } from 'react'
import { MISCONCEPTIONS, type MisconceptionId } from '../content/misconceptions'
import {
  evaluate, explain, PREDS, separatingWorld, toEnglish, toLean,
  type Formula, type GenQuestion, type Pred, type World,
} from '../practice/logic'
import { LeanLine } from './LeanText'
import { Inline } from './Markdown'

const LETTERS = ['A', 'B', 'C', 'D']

function children(f: Formula): Formula[] {
  if (f.k === 'pred' || f.k === 'helps') return []
  if ('f' in f) return [f.f]
  return [f.a, f.b]
}

function usedPreds(f: Formula, acc = new Set<Pred>()): Set<Pred> {
  if (f.k === 'pred') acc.add(f.p)
  children(f).forEach((g) => usedPreds(g, acc))
  return acc
}
const usesHelps = (f: Formula): boolean => f.k === 'helps' || children(f).some(usesHelps)

export function WorldTable({ world, preds, helps }: { world: World; preds: Pred[]; helps: boolean }) {
  const pairs = world.students.flatMap((a, i) => world.students.flatMap((b, j) => (world.helps[i][j] ? [`${a} → ${b}`] : [])))
  return (
    <div className="world">
      <table>
        <thead>
          <tr>
            <th />
            {preds.map((p) => <th key={p}><code>{p}</code></th>)}
          </tr>
        </thead>
        <tbody>
          {world.students.map((s, i) => (
            <tr key={s}>
              <th>{s}</th>
              {preds.map((p) => <td key={p} className={world.has[p][i] ? 'yes' : 'no'}>{world.has[p][i] ? '✓' : '·'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {helps && <div className="helps"><code>Helps</code>: {pairs.length ? pairs.join(', ') : 'nobody helps anybody'}</div>}
    </div>
  )
}

export function GenQuestionCard({
  question: q,
  onAnswer,
}: {
  question: GenQuestion
  onAnswer: (correct: boolean, misconceptions: MisconceptionId[]) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const preds = PREDS.filter((p) => usedPreds(q.seed).has(p) || q.options.some((o) => o.f && usedPreds(o.f).has(p)))
  const helps = usesHelps(q.seed)

  const pick = (i: number) => {
    if (picked != null) return
    setPicked(i)
    onAnswer(q.options[i].correct, q.options[i].misconceptions)
  }
  const retake = () => setPicked(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
      const n = Number(e.key)
      if (n >= 1 && n <= q.options.length) pick(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const chosen = picked != null ? q.options[picked] : null
  const right = q.options.find((o) => o.correct)!

  return (
    <div className="question gen">
      <p className="legend-line muted small">
        About a group of students: <code>Studies s</code> means student s studies, <code>Helps s t</code> means s helps t.
      </p>
      {q.kind === 'to-lean' && (
        <>
          <p className="q-prompt">Which Lean statement says this?</p>
          <blockquote className="english">{toEnglish(q.seed)}</blockquote>
        </>
      )}
      {q.kind === 'to-english' && (
        <>
          <p className="q-prompt">Which sentence says the same as this Lean statement?</p>
          <pre className="code"><LeanLine text={toLean(q.seed)} /></pre>
        </>
      )}
      {q.kind === 'pick-world' && (
        <>
          <p className="q-prompt">In which group of students is this statement <strong>true</strong>?</p>
          <pre className="code"><LeanLine text={toLean(q.seed)} /></pre>
        </>
      )}

      <div className={`options ${q.kind === 'pick-world' ? 'worlds' : ''}`} role="radiogroup">
        {q.options.map((o, i) => {
          const state = picked == null ? '' : o.correct ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button key={i} className={`option ${state}`} onClick={() => pick(i)} disabled={picked != null} role="radio" aria-checked={i === picked}>
              <span className="opt-key">{LETTERS[i]}</span>
              <span className="opt-text">
                {q.kind === 'to-lean' && <code className="lean-opt"><LeanLine text={toLean(o.f!)} /></code>}
                {q.kind === 'to-english' && toEnglish(o.f!)}
                {q.kind === 'pick-world' && <WorldTable world={o.world!} preds={preds} helps={helps} />}
              </span>
            </button>
          )
        })}
      </div>

      {chosen && (
        <div className={`feedback ${chosen.correct ? 'good' : 'bad'}`} aria-live="polite">
          <div className="fb-title">{chosen.correct ? 'Right.' : 'Not quite.'}</div>
          {q.kind === 'pick-world' ? (
            <>
              <p>In the group you picked: {explain(q.seed, chosen.world!)}</p>
              {!chosen.correct && <p>In the right one: {explain(q.seed, right.world!)}</p>}
              {!chosen.correct && chosen.f && (
                <p>
                  Your pick fits a different statement, <code className="lean-opt"><LeanLine text={toLean(chosen.f)} /></code>, that is,
                  “{toEnglish(chosen.f)}”
                </p>
              )}
            </>
          ) : chosen.correct ? (
            <p>
              {q.kind === 'to-lean' ? <>It reads: “{toEnglish(q.seed)}”</> : <>That is <code className="lean-opt"><LeanLine text={toLean(q.seed)} /></code> in words.</>}
            </p>
          ) : (
            <Difference answer={q.seed} pick={chosen.f!} preds={preds} helps={helps} kind={q.kind} />
          )}
          {!chosen.correct && chosen.misconceptions.map((m) => (
            <details key={m} className="aside">
              <summary>A common mix-up: <Inline text={MISCONCEPTIONS[m].name} /></summary>
              <p><strong>You might think</strong> <Inline text={MISCONCEPTIONS[m].belief} /></p>
              <p><Inline text={MISCONCEPTIONS[m].truth} /></p>
            </details>
          ))}
          <div className="fb-actions">
            <button className="btn small" onClick={retake}>Try again</button>
            <span className="muted small">Your first answer is the one that counts.</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** A group of students where the pick and the answer disagree: the concrete counterexample. */
function Difference({ answer, pick, preds, helps, kind }: { answer: Formula; pick: Formula; preds: Pred[]; helps: boolean; kind: 'to-lean' | 'to-english' }) {
  const w = separatingWorld(answer, pick)
  return (
    <>
      <p>
        {kind === 'to-lean' ? <>You picked <code className="lean-opt"><LeanLine text={toLean(pick)} /></code>, which reads “{toEnglish(pick)}”</>
          : <>You picked “{toEnglish(pick)}”, which is <code className="lean-opt"><LeanLine text={toLean(pick)} /></code>.</>}
        {' '}That is a different claim. Here is a group where the two disagree:
      </p>
      {w && (
        <>
          <WorldTable world={w} preds={preds} helps={helps} />
          <ul className="compare">
            <li><strong>The statement ({evaluate(answer, w) ? 'true' : 'false'} here):</strong> {explain(answer, w)}</li>
            <li><strong>Your pick ({evaluate(pick, w) ? 'true' : 'false'} here):</strong> {explain(pick, w)}</li>
          </ul>
        </>
      )}
    </>
  )
}
