// The logo: a ∀ leaning against a brick wall, standing on the floor. Lean, the easy way.
// Wall and ∀ together also read as ∀N, the end of Lean's wordmark L∃∀N.
// The drawing's numbers live in geometry.ts, shared with scripts/favicon.ts.
import { BRICKS, FLOOR_X, FLOOR_Y, FOOT, FORALL, TILT, WALL } from './geometry'

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 64 64" aria-hidden="true">
      <rect className="logo-bg" width="64" height="64" rx="14" />
      <line className="logo-floor" x1={FLOOR_X.from} y1={FLOOR_Y} x2={FLOOR_X.to} y2={FLOOR_Y} />
      <g className="logo-wall">
        {BRICKS.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={WALL.rowH} rx={1.2} />)}
      </g>
      <path className="logo-mark" d={FORALL} transform={`translate(${FOOT.x} ${FOOT.y}) rotate(${TILT})`} />
    </svg>
  )
}
