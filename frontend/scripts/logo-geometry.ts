// The logo's drawing on a 64 × 64 grid, with even margins and one stroke weight.
// Used by favicon.ts, which writes it out as site/assets/favicon.svg.

// mirrored: the wall on the left, the ∀ leaning left onto it, so wall and ∀ read as an N
export const WALL = { x: 14, y: 13.2, w: 12, rowH: 8, gap: 1.6, rows: 4 }
export const FLOOR_Y = 50.5
export const FLOOR_X = { from: 14, to: 53 }

/** Half the ∀'s stroke width: its rounded ends reach this far past the path's points. */
const CAP = 2.3
const WALL_TOP = WALL.y
const WALL_BOTTOM = WALL.y + WALL.rows * WALL.rowH + (WALL.rows - 1) * WALL.gap

/** The ∀'s legs, from its foot to each top corner, sized so that once tilted it spans exactly
 * the wall's height (rounded ends included), so the two stand even. */
const LEG_H = WALL_BOTTOM - WALL_TOP - 2 * CAP
const LEG = { dx: LEG_H * (10 / 33.53), dy: LEG_H * (32 / 33.53) }

/** Exactly the angle that makes the ∀'s right leg vertical. */
export const TILT = -(Math.atan2(LEG.dx, LEG.dy) * 180) / Math.PI

/** Where the ∀'s foot stands: on the floor, with its left arm resting on the wall's face. */
// (the tilted ∀'s top-left corner sits 2·dx·cos(tilt) left of its foot; its rounded end
// then overlaps the wall face by a hair, so the arm visibly rests on it)
export const FOOT = { x: WALL.x + WALL.w + CAP - 0.34 + 2 * LEG.dx * Math.cos((TILT * Math.PI) / 180), y: WALL_BOTTOM - CAP }

/** Bricks: full-width and half-width rows alternating, like real brickwork. */
export const BRICKS: { x: number; y: number; w: number }[] = Array.from({ length: WALL.rows }, (_, r) => {
  const y = WALL.y + r * (WALL.rowH + WALL.gap)
  if (r % 2 === 0) return [{ x: WALL.x, y, w: WALL.w }]
  const half = (WALL.w - WALL.gap) / 2
  return [{ x: WALL.x, y, w: half }, { x: WALL.x + half + WALL.gap, y, w: half }]
}).flat()

/** The ∀ upright with its foot at (0, 0): two legs from the top corners and the crossbar. */
export const FORALL = `M ${-LEG.dx} ${-LEG.dy} L 0 0 L ${LEG.dx} ${-LEG.dy} M ${-0.6 * LEG.dx} ${-0.6 * LEG.dy} L ${0.6 * LEG.dx} ${-0.6 * LEG.dy}`
