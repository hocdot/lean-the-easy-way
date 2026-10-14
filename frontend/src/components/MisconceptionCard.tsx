// Concept-level feedback in the "refutation text" style of the LTL Tutor: what you probably
// believe, why it is not so, and an example.
import { MISCONCEPTIONS, type MisconceptionId } from '../content/misconceptions'
import { actions } from '../store'
import { Inline, Markdown } from './Markdown'

export function MisconceptionCard({ id, dismissable = true }: { id: MisconceptionId; dismissable?: boolean }) {
  const m = MISCONCEPTIONS[id]
  return (
    <section className="refute">
      <div className="eyebrow">A pattern in your answers</div>
      <h3><Inline text={m.name} /></h3>
      <p><strong>You might think</strong> <Inline text={m.belief} /></p>
      <p><strong>In fact,</strong> <Inline text={m.truth} /></p>
      <Markdown text={m.example} />
      {dismissable && (
        <div className="row gap">
          <button className="btn small" onClick={() => actions.explained(id)}>Got it</button>
        </div>
      )}
    </section>
  )
}
