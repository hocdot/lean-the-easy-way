// A Lean code block in a lesson: highlighted, runnable, and steppable when it holds a proof.
import { useState } from 'react'
import { BackendDown, capabilities, isSaved, runLean, STATIC, walkable, type RunResult } from '../api'
import { openInLab } from '../nav'
import { LeanLines } from './LeanText'
import { MessageList, Stepper, Verdict } from './RunResult'

type State =
  | { s: 'idle' }
  | { s: 'running' }
  | { s: 'done'; result: RunResult }
  | { s: 'failed'; error: string; down: boolean }

export function CodeBlock({ code, runnable = true, mathlib = false }: { code: string; runnable?: boolean; mathlib?: boolean }) {
  const [state, setState] = useState<State>({ s: 'idle' })
  const [stepping, setStepping] = useState(false)
  const [step, setStep] = useState(0)

  const run = async () => {
    setState({ s: 'running' })
    if (mathlib && !STATIC && !(await capabilities())?.mathlib && !(await isSaved(code))) {
      setState({ s: 'failed', error: 'This example needs Mathlib, which is not installed here. Run `make mathlib` in the project folder (about 7 GB), then restart.', down: false })
      return
    }
    try {
      setState({ s: 'done', result: await runLean(code) })
    } catch (e) {
      setState({ s: 'failed', error: (e as Error).message, down: e instanceof BackendDown })
    }
  }

  const result = state.s === 'done' ? state.result : null
  const walk = result ? walkable(result.steps) : []
  const marks: Record<number, string> = {}
  for (const m of result?.messages ?? []) if (m.severity === 'error') marks[m.line] = 'err'
  const marked = stepping && walk[step] ? walk[step].line : null

  return (
    <div className="codeblock">
      <pre className="code"><LeanLines code={code} mark={marked} marks={marks} /></pre>
      {(runnable || !STATIC) && <div className="code-bar">
        {runnable ? (
          <button className="btn small" onClick={run} disabled={state.s === 'running'}>
            {state.s === 'running' ? 'Running…' : result ? 'Run again' : 'Run'}
          </button>
        ) : (
          <span className="muted small">Shown for reading only</span>
        )}
        {mathlib && state.s === 'running' && <span className="muted small">Loading Mathlib takes a few seconds…</span>}
        {walk.length > 0 && (
          <button className={`btn small ${stepping ? 'on' : ''}`} onClick={() => setStepping(!stepping)}>
            {stepping ? 'Hide steps' : 'Step through'}
          </button>
        )}
        {!STATIC && (
          <button className="btn ghost small push" onClick={() => openInLab(code)} title="Edit and run this code in the Lab">
            Open in Lab
          </button>
        )}
      </div>}
      {state.s === 'failed' && (
        <div className="run-out">
          <div className="verdict bad">{state.down ? 'Cannot reach Lean.' : state.error}</div>
          {state.down && !STATIC && <p className="muted small">Start the local backend with <code>make dev</code> (see the README).</p>}
        </div>
      )}
      {result && (
        <div className="run-out">
          <Verdict result={result} />
          {stepping && walk.length > 0 ? (
            <Stepper steps={result.steps} index={Math.min(step, walk.length - 1)} onIndex={setStep} />
          ) : (
            <MessageList messages={result.messages} />
          )}
        </div>
      )}
    </div>
  )
}
