// A Lean code block in a question: highlighted, with Lean's saved answer behind its Run button,
// and steppable when it holds a proof.
import { useState } from 'react'
import { runLean, walkable, type RunResult } from '../lean/results'
import { LeanLines } from './LeanText'
import { MessageList, Stepper, Verdict } from './RunResult'

type State =
  | { s: 'idle' }
  | { s: 'running' }
  | { s: 'done'; result: RunResult }
  | { s: 'failed'; error: string }

export function CodeBlock({ code, runnable = true }: { code: string; runnable?: boolean }) {
  const [state, setState] = useState<State>({ s: 'idle' })
  const [stepping, setStepping] = useState(false)
  const [step, setStep] = useState(0)

  const run = async () => {
    setState({ s: 'running' })
    try {
      setState({ s: 'done', result: await runLean(code) })
    } catch (e) {
      setState({ s: 'failed', error: (e as Error).message })
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
      {runnable && <div className="code-bar">
        <button className="btn small" onClick={run} disabled={state.s === 'running'}>
          {state.s === 'running' ? 'Running…' : result ? 'Run again' : 'Run'}
        </button>
        {walk.length > 0 && (
          <button className={`btn small ${stepping ? 'on' : ''}`} onClick={() => setStepping(!stepping)}>
            {stepping ? 'Hide steps' : 'Step through'}
          </button>
        )}
      </div>}
      {state.s === 'failed' && (
        <div className="run-out">
          <div className="verdict bad">{state.error}</div>
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
