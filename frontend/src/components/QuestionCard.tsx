// One multiple-choice question from a lesson, with immediate, concrete feedback.
// For "pick the next step" questions, the picked tactic is run through real Lean.
import { useEffect, useState } from 'react'
import { BackendDown, runLean, type RunResult } from '../api'
import { fillIn, tacticOf } from '../content'
import { MISCONCEPTIONS } from '../content/misconceptions'
import type { Question } from '../content/types'
import { CodeBlock } from './CodeBlock'
import { LeanLines } from './LeanText'
import { Inline, Markdown } from './Markdown'
import { Goals } from './Goal'
import { MessageList, Verdict } from './RunResult'

const LETTERS = ['A', 'B', 'C', 'D']

export function QuestionCard({
  question: q,
  onAnswer,
  initialPick,
}: {
  question: Question
  /** called on every pick; `first` is false for a retake (only first answers count as progress) */
  onAnswer: (correct: boolean, picked: number, first: boolean) => void
  /** an earlier answer to show again (after a refresh, or on a revisit) */
  initialPick?: number
}) {
  const [picked, setPicked] = useState<number | null>(initialPick ?? null)
  const [retakes, setRetakes] = useState(0)
  const [lean, setLean] = useState<{ result?: RunResult; error?: string } | null>(null)

  const runFill = (i: number) => {
    if (!q.fillIn || !q.code) return
    runLean(fillIn(q.code, tacticOf(q.options[i].text)))
      .then((result) => setLean({ result }))
      .catch((e) => setLean({ error: e instanceof BackendDown ? 'Lean is not running, so this cannot be shown live.' : (e as Error).message }))
  }

  // an answer shown again gets its Lean result again too
  useEffect(() => {
    if (initialPick != null) runFill(initialPick)
    // only when the card first appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (i: number) => {
    if (picked != null) return
    setPicked(i)
    onAnswer(!!q.options[i].correct, i, retakes === 0 && initialPick == null)
    if (q.fillIn) setLean({})
    runFill(i)
  }

  const retake = () => {
    setPicked(null)
    setLean(null)
    setRetakes(retakes + 1)
  }

  // 1–4 picks an option
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
  const m = chosen && !chosen.correct && chosen.misconception ? MISCONCEPTIONS[chosen.misconception] : null
  const isTactics = q.fillIn

  return (
    <div className="question">
      <div className="q-prompt"><Markdown text={q.prompt} /></div>
      {q.code && (q.fillIn ? (
        <pre className="code fill"><LeanLines code={q.code} /></pre>
      ) : (
        <CodeBlock code={q.code} runnable={q.codeExpect !== 'skip'} mathlib={q.mathlib} />
      ))}

      <div className={`options ${isTactics ? 'inline' : ''}`} role="radiogroup">
        {q.options.map((o, i) => {
          const state = picked == null ? '' : o.correct ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button
              key={i}
              className={`option ${state} ${i === picked ? 'picked' : ''}`}
              onClick={() => pick(i)}
              disabled={picked != null}
              role="radio"
              aria-checked={i === picked}
            >
              <span className="opt-key">{LETTERS[i]}</span>
              <span className="opt-text"><Inline text={o.text} /></span>
            </button>
          )
        })}
      </div>

      {chosen && (
        <div className={`feedback ${chosen.correct ? 'good' : 'bad'}`} aria-live="polite">
          <div className="fb-title">{chosen.correct ? 'Right.' : 'Not quite.'}</div>
          <Markdown text={chosen.why} compact />
          {!chosen.correct && (
            <div className="fb-answer">
              <div className="fb-label">The answer: <Inline text={right.text} /></div>
              <Markdown text={right.why} compact />
            </div>
          )}
          {m && (
            <details className="aside">
              <summary>A common mix-up: <Inline text={m.name} /></summary>
              <p><strong>You might think</strong> <Inline text={m.belief} /></p>
              <p><Inline text={m.truth} /></p>
            </details>
          )}
          {q.fillIn && (lean || initialPick != null) && (
            <div className="fb-lean">
              <div className="fb-label">What Lean says with <code>{tacticOf(chosen.text)}</code>:</div>
              {lean?.error ? <p className="muted small">{lean.error}</p>
                : !lean?.result ? <p className="muted small">Running Lean…</p>
                : <LeanOutcome result={lean.result} />}
            </div>
          )}
          <details className="aside">
            <summary>Why each option is right or wrong</summary>
            <ul className="all-why">
              {q.options.map((o, i) => (
                <li key={i} className={o.correct ? 'right' : 'wrong'}>
                  <div className="fb-label">{LETTERS[i]}. <Inline text={o.text} /> <span className="muted small">{o.correct ? 'right' : 'wrong'}</span></div>
                  <Markdown text={o.why} compact />
                </li>
              ))}
            </ul>
          </details>
          <div className="fb-actions">
            <button className="btn small" onClick={retake}>Try again</button>
            <span className="muted small">Your first answer is the one that counts for your progress.</span>
          </div>
        </div>
      )}
    </div>
  )
}

function LeanOutcome({ result }: { result: RunResult }) {
  const errors = result.messages.filter((m) => m.severity === 'error')
  // for a wrong tactic, the goals it left (if it ran at all) explain the error best
  const unsolved = errors.find((e) => /unsolved goals/.test(e.text))
  return (
    <>
      <Verdict result={result} />
      {errors.length > 0 && !unsolved && <MessageList messages={errors.slice(0, 1)} />}
      {unsolved && <Goals goals={unsolved.text.replace(/^unsolved goals\n/, '').split(/\n\n(?=case |[^\s])/)} label="Still to prove" />}
    </>
  )
}
