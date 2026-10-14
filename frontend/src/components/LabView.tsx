// The Lab: edit Lean, see Lean's verdict and the goal at the cursor, and audit the file.
import { useEffect, useRef, useState } from 'react'
import { BackendDown, runLean, type RunResult, type Step } from '../api'
import { EXAMPLES } from '../content/examples'
import { SHOWN } from '../lean/abbrev'
import { takeLabCode } from '../nav'
import { AuditReport } from './AuditReport'
import { Editor } from './Editor'
import { Goals } from './Goal'
import { MessageList, Verdict } from './RunResult'

// v2: the default example changed to the audit practice file
const KEY = 'lab-last-v2'

function initialCode(): string {
  const handed = takeLabCode()
  if (handed) return handed
  try {
    return localStorage.getItem(KEY) ?? EXAMPLES[0].code
  } catch {
    return EXAMPLES[0].code
  }
}

const before = (a: { line: number; col: number }, b: { line: number; col: number }) => a.line < b.line || (a.line === b.line && a.col <= b.col)
const inside = (s: Step, c: { line: number; col: number }) => before(s, c) && before(c, { line: s.endLine, col: s.endCol })

/** The goals at the cursor: after the last tactic that starts before it, inside the proof around it. */
function goalsAt(steps: Step[], c: { line: number; col: number }): { goals: string[]; label: string } | null {
  const proof = steps.filter((s) => s.start && inside(s, c)).pop()
  if (!proof) return null
  const within = steps.filter((s) => !s.start && inside(proof, s) && before(s, c))
  // the step whose line the cursor is on, or the last one before it
  const last = within.filter((s) => s.line <= c.line).pop()
  if (!last) return { goals: proof.goalsBefore, label: 'At the start of the proof' }
  return { goals: last.goalsAfter, label: `After ${last.tactic.split('\n')[0]} (line ${last.line})` }
}

type Panel = 'check' | 'audit'

export function LabView() {
  const [code, setCode] = useState(initialCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [audit, setAudit] = useState<RunResult | null>(null)
  const [busy, setBusy] = useState<'run' | 'audit' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState({ line: 1, col: 0 })
  const [panel, setPanel] = useState<Panel>('check')
  const [goto, setGoto] = useState<{ line: number } | null>(null)
  const latest = useRef(code)
  const edit = (c: string) => {
    setCode(c)
    setAudit(null)
  }

  // code handed over from a lesson ("Open in Lab") while the Lab is already open
  useEffect(() => {
    const on = () => {
      const c = takeLabCode()
      if (c) edit(c)
    }
    window.addEventListener('lab-code', on)
    return () => window.removeEventListener('lab-code', on)
  }, [])

  // check the code a moment after typing stops
  useEffect(() => {
    try {
      localStorage.setItem(KEY, code)
    } catch {
      /* the Lab just won't remember this code */
    }
    latest.current = code
    const t = setTimeout(async () => {
      setBusy('run')
      try {
        const r = await runLean(code)
        if (latest.current === code) {
          setResult(r)
          setError(null)
        }
      } catch (e) {
        setError(e instanceof BackendDown ? 'down' : (e as Error).message)
      } finally {
        setBusy(null)
      }
    }, 600)
    return () => clearTimeout(t)
  }, [code])

  const doAudit = async () => {
    setPanel('audit')
    setBusy('audit')
    try {
      setAudit(await runLean(code, true))
      setError(null)
    } catch (e) {
      setError(e instanceof BackendDown ? 'down' : (e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const jump = (line: number) => {
    setGoto({ line })
    setPanel('check')
  }

  const here = result ? goalsAt(result.steps, cursor) : null

  return (
    <div className="lab">
      <section className="lab-editor card">
        <div className="lab-bar">
          <select
            className="select"
            value=""
            onChange={(e) => {
              const ex = EXAMPLES[Number(e.target.value)]
              if (ex) edit(ex.code)
            }}
            aria-label="Load an example"
          >
            <option value="" disabled>Load an example…</option>
            {EXAMPLES.map((ex, i) => <option key={i} value={i}>{ex.name}</option>)}
          </select>
          <span className="muted small push">{busy === 'run' ? 'Checking…' : result ? `Checked in ${(result.ms / 1000).toFixed(1)} s` : ''}</span>
          <button className="btn primary" onClick={doAudit} disabled={busy === 'audit'}>
            {busy === 'audit' ? 'Auditing…' : 'Audit'}
          </button>
        </div>
        <Editor value={code} onChange={edit} onCursor={(line, col) => setCursor({ line, col })} messages={result?.messages ?? []} goto={goto} />
        <div className="lab-help muted small">
          Type symbols with a backslash, then a space:{' '}
          {SHOWN.map(([k, v]) => <span key={k} className="abbr"><code>{k}</code> {v}</span>)}
        </div>
      </section>

      <section className="lab-side card">
        <div className="seg-toggle wide" role="tablist">
          <button role="tab" aria-selected={panel === 'check'} className={panel === 'check' ? 'on' : ''} onClick={() => setPanel('check')}>Goal and messages</button>
          <button role="tab" aria-selected={panel === 'audit'} className={panel === 'audit' ? 'on' : ''} onClick={() => setPanel('audit')}>Audit</button>
        </div>

        {error === 'down' ? (
          <div className="side-body">
            <div className="verdict bad">Cannot reach Lean</div>
            <p className="muted">The Lab needs the local backend. In the project folder, run <code>make dev</code> (see the README).</p>
          </div>
        ) : error ? (
          <div className="side-body"><div className="verdict bad">{error}</div></div>
        ) : panel === 'check' ? (
          <div className="side-body">
            {result && <Verdict result={result} />}
            <div className="side-title">Goal at the cursor</div>
            {here ? <Goals goals={here.goals} label={here.label} /> : <p className="muted small">Click on a line inside a proof (after <code>by</code>) to see what is left to prove there.</p>}
            {result && result.messages.length > 0 && (
              <>
                <div className="side-title">Messages</div>
                <MessageList messages={result.messages} hideLint={false} />
              </>
            )}
          </div>
        ) : (
          <div className="side-body">
            {audit ? <AuditReport result={audit} onJump={jump} />
              : busy === 'audit' ? <p className="muted">Auditing…</p>
              : (
                <div className="audit-intro">
                  <p>Press <strong>Audit</strong> to check every theorem in the file. For each one you get a plain-English reading and the five-step audit checklist: what the computer could check, and what is <strong>your turn</strong>.</p>
                  <p className="muted">The computer catches mechanical problems, like <code>sorry</code> or hypotheses that contradict each other. Whether a statement says what was claimed is for you to judge. Learn how in Week 4: <a href="#/learn/22">Day 22</a> starts it, and <a href="#/learn/27">Day 27</a> is the checklist.</p>
                </div>
              )}
          </div>
        )}
      </section>
    </div>
  )
}
