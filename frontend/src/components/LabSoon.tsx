// The Lab on the hosted site: it needs a Lean server to run new code, which comes later.
const REPO = import.meta.env.VITE_REPO_URL as string | undefined

export function LabSoon() {
  return (
    <div className="about card soon">
      <div className="eyebrow">Lab</div>
      <h2>Coming soon</h2>
      <p>
        The Lab lets you write any Lean, see the goal at each line, and <strong>Audit</strong> a file with the five-step
        checklist. Running new code needs a Lean server, which this site does not have yet.
      </p>
      <p>
        Everything else works here: the lessons, Practice, and the Advanced cases, including every <strong>Run</strong> and{' '}
        <strong>Step through</strong> button. Those show Lean’s real answers, saved when the site was built.
      </p>
      <p className="muted">
        Meanwhile, to experiment with Lean in your browser, the official editor at{' '}
        <a href="https://live.lean-lang.org" target="_blank" rel="noopener noreferrer">live.lean-lang.org</a> runs Lean and
        Mathlib (without the audit).
        {REPO && <> Or run this site on your own computer, Lab included: see the <a href={`${REPO}#run-it`} target="_blank" rel="noopener noreferrer">README</a>.</>}
      </p>
    </div>
  )
}
