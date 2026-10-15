// Writes the site's logo (site/assets/favicon.svg: the tab icon, the header and the start page)
// from its drawing in logo-geometry.ts. Run: node --no-warnings scripts/favicon.ts
import { writeFileSync } from 'node:fs'
import { BRICKS, FLOOR_X, FLOOR_Y, FOOT, FORALL, TILT, WALL } from './logo-geometry.ts'

const ink = '#1c1b19'
const bg = '#f5f4f0'
const hi = '#e09b74'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" rx="14" fill="${ink}"/>` +
  `<line x1="${FLOOR_X.from}" y1="${FLOOR_Y}" x2="${FLOOR_X.to}" y2="${FLOOR_Y}" stroke="${bg}" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>` +
  `<g fill="${hi}">${BRICKS.map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${WALL.rowH}" rx="1.2"/>`).join('')}</g>` +
  `<path d="${FORALL}" transform="translate(${FOOT.x} ${FOOT.y}) rotate(${TILT})" fill="none" stroke="${bg}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>` +
  `</svg>\n`
writeFileSync(new URL('../../site/assets/favicon.svg', import.meta.url), svg)
console.log('wrote site/assets/favicon.svg')
