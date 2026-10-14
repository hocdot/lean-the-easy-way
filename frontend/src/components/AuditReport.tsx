// The audit of a file: per theorem, its plain-English reading and what to worry about.
import type { DeclReport, Finding, RunResult } from '../api'
import { Inline } from './Markdown'
import { LeanLine } from './LeanText'

const ICON = { bad: '✗', warn: '!', info: 'i', good: '✓' } as const

export function FindingRow({ f }: { f: Finding }) {
  return (
    <li className={`finding ${f.level}`}>
      <span className="f-icon" aria-hidden="true">{ICON[f.level]}</span>
      <div>
        <div className="f-title">{f.title}</div>
        <div className="f-detail"><Inline text={f.detail} /></div>
      </div>
    </li>
  )
}

type Status = 'pass' | 'fail' | 'warn' | 'you'

interface Check {
  status: Status
  title: string
  detail: string
}

const STATUS_ICON: Record<Status, string> = { pass: '✓', fail: '✗', warn: '!', you: '?' }
const STATUS_LABEL: Record<Status, string> = { pass: 'checked', fail: 'problem', warn: 'look closer', you: 'your turn' }

const code = (s: string) => `\`${s}\``

/**
 * The five questions of an audit (Day 27), for one theorem: which ones the automatic checks
 * settled, and which ones only a reader can answer, with what to do.
 */
function checklist(d: DeclReport, defs: string[]): Check[] {
  const find = (title: string) => d.findings.find((f) => f.title === title)
  const as = (f: Finding, status: Status): Check => ({ status, title: f.title, detail: f.detail })
  const hyps = d.hyps.filter((h) => h.prop)
  const listed = hyps.map((h) => `${code(h.name)}: ${h.english}`).join('; ')

  const proved = find('Unfinished proof') ?? find('Rests on a made-up assumption')
  const native = find('Trusts compiled code')
  const step1: Check = proved ? as(proved, 'fail')
    : native ? as(native, 'warn')
    : { status: 'pass', title: 'Proved', detail: 'No `sorry` and no made-up axioms: only Lean’s standard foundations.' }

  const trivial = find('Hypotheses are not needed')
  const step2: Check = trivial ? as(trivial, 'warn') : {
    status: 'you',
    title: 'Does it say what was claimed?',
    detail: 'Read the English reading above out loud and compare it with the claim: the name, the comment, what you were told it proves. Watch for “some” instead of “every”, `≤` instead of `<`, `Nat` instead of `Int`, one case instead of all.',
  }

  const contra = find('Hypotheses contradict each other')
  const step3: Check = contra ? as(contra, 'fail')
    : hyps.length === 0 ? { status: 'pass', title: 'Can the hypotheses hold?', detail: 'There are no hypotheses, so nothing to check here.' }
    : {
        status: 'you',
        title: 'Can the hypotheses all hold at once?',
        detail: `No contradiction was found automatically, but that is not a proof that none exists. Find one example where all of these hold: ${listed}.`,
      }

  const circular = find('Assumes its own conclusion')
  const carried = find('One hypothesis carries the claim')
  const unused = find('A hypothesis is never used') ?? find('Some hypotheses are never used')
  const step4: Check = circular ? as(circular, 'fail')
    : carried ? as(carried, 'warn')
    : hyps.length === 0 ? { status: 'pass', title: 'Are the hypotheses honest?', detail: 'There are no hypotheses, so nothing is assumed.' }
    : {
        status: 'you',
        title: 'Are the hypotheses honest?',
        detail: `For each hypothesis that is not part of the claim, ask: is it known to be true, and is it easier than the conclusion? ${unused ? unused.detail : ''}`.trim(),
      }

  const used = defs.filter((n) => new RegExp(`(^|[^\\w.])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w])`).test(d.statement))
  const step5: Check = used.length ? {
    status: 'you',
    title: 'Do the definitions mean what their names say?',
    detail: `The statement uses ${used.map(code).join(', ')}, defined in this file. Read ${used.length > 1 ? 'their bodies' : 'its body'}, not the name, and try a small case.`,
  } : { status: 'pass', title: 'Definitions', detail: 'The statement uses only Lean’s built-in definitions, none from this file.' }

  return [step1, step2, step3, step4, step5]
}

function Checklist({ checks }: { checks: Check[] }) {
  const problems = checks.filter((c) => c.status === 'fail' || c.status === 'warn').length
  const yours = checks.filter((c) => c.status === 'you').length
  const fatal = checks.some((c) => c.status === 'fail')
  return (
    <div className="checklist">
      <div className="check-summary">
        {fatal
          ? <><strong>Problem found automatically.</strong> This alone means the theorem proves nothing.</>
          : problems > 0
          ? <><strong>{problems} {problems > 1 ? 'warnings' : 'warning'} found automatically.</strong> {yours > 0 && `${yours} ${yours > 1 ? 'steps are' : 'step is'} yours:`}</>
          : <><strong>No red flags found</strong> by the automatic checks. {yours > 0 && `${yours} ${yours > 1 ? 'steps are' : 'step is'} yours:`}</>}
      </div>
      <ol className="checks">
        {checks.map((c, i) => (
          <li key={i} className={`check ${c.status}`}>
            <span className="c-icon" aria-hidden="true">{STATUS_ICON[c.status]}</span>
            <div>
              <div className="c-title">{c.title} <span className="c-label">{STATUS_LABEL[c.status]}</span></div>
              <div className="c-detail"><Inline text={c.detail} /></div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Decl({ d, defs, onJump }: { d: DeclReport; defs: string[]; onJump: (line: number) => void }) {
  const worst = d.findings.some((f) => f.level === 'bad') ? 'bad' : d.findings.some((f) => f.level === 'warn') ? 'warn' : 'ok'
  const isTheorem = d.kind === 'theorem'
  return (
    <section className={`decl ${worst}`}>
      <header className="decl-head">
        <span className="eyebrow">{d.kind}</span>
        <button className="link" onClick={() => onJump(d.line)} title="Show in the editor">
          <code>{d.name}</code> <span className="muted small">line {d.line}</span>
        </button>
      </header>
      {isTheorem || d.kind === 'axiom' ? (
        <p className="reading"><Inline text={capitalize(d.english)} /></p>
      ) : (
        <p className="reading mono"><LeanLine text={`${d.name} : ${d.statement}`} /></p>
      )}
      {isTheorem ? <Checklist checks={checklist(d, defs)} /> : <ul className="findings">{d.findings.map((f, i) => <FindingRow key={i} f={f} />)}</ul>}
      {isTheorem && (d.hyps.length > 0 || d.axioms.length > 0) && (
        <details className="aside">
          <summary>Details: hypotheses and axioms</summary>
          {d.hyps.length > 0 && (
            <table className="hyps">
              <tbody>
                {d.hyps.map((h, i) => (
                  <tr key={i} className={h.used ? '' : 'unused'}>
                    <td><code>{h.name}</code></td>
                    <td><Inline text={h.english} /></td>
                    <td className="muted small">{h.used ? '' : 'unused'}</td>
                  </tr>
                ))}
                <tr className="concl">
                  <td>⊢</td>
                  <td colSpan={2}><Inline text={d.conclusionEnglish} /></td>
                </tr>
              </tbody>
            </table>
          )}
          <p className="small">
            Axioms used: {d.axioms.length ? d.axioms.map((a) => <code key={a} className="ax">{a}</code>) : 'none'}.{' '}
            <span className="muted">propext, Classical.choice and Quot.sound are the standard foundations of Lean’s mathematics.</span>
          </p>
        </details>
      )}
    </section>
  )
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) + '.' : s)

export function AuditReport({ result, onJump }: { result: RunResult; onJump: (line: number) => void }) {
  const a = result.audit
  if (!a) return null
  const defs = a.decls.filter((d) => d.kind !== 'theorem' && d.kind !== 'axiom').map((d) => d.name)
  return (
    <div className="audit">
      {a.file.length > 0 && <ul className="findings file">{a.file.map((f, i) => <FindingRow key={i} f={f} />)}</ul>}
      {a.decls.length === 0 ? (
        <p className="muted">No theorems or definitions to audit. (Unnamed <code>example</code>s are checked but not audited.)</p>
      ) : (
        a.decls.map((d) => <Decl key={d.name} d={d} defs={defs} onJump={onJump} />)
      )}
      <p className="muted small audit-note">
        The automatic checks can show a problem, but they cannot show that a statement is the right one. The steps marked
        “your turn” are the audit itself; Week 4 of Learn teaches each of them.
      </p>
    </div>
  )
}
