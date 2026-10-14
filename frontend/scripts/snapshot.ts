// Runs every piece of Lean in the course through real Lean (and Mathlib) and saves Lean's
// answers in src/content/lean-results.json, so the hosted site can show them without a
// Lean server. Run with `make snapshot` after changing lessons, and commit the result.
import { writeFileSync } from 'node:fs'
import { leanReady, mathlibReady, runLean, type RunResult } from '../../backend/lean.ts'
import { leanJobs } from '../src/content/jobs.ts'

if (!leanReady()) throw new Error('Lean is not set up: run `make setup` first.')
if (!mathlibReady()) throw new Error('Mathlib is not set up: run `make mathlib` first (the Advanced cases need it).')

const out: Record<string, Omit<RunResult, 'audit' | 'ms'>> = {}
const jobs = leanJobs().filter((j) => j.expect !== 'skip')
const codes = [...new Set(jobs.map((j) => j.code))]
let done = 0
await Promise.all(codes.map(async (code) => {
  const r = await runLean(code)
  out[code] = { ok: r.ok, messages: r.messages, steps: r.steps }
  if (++done % 25 === 0) console.log(`${done} / ${codes.length}`)
}))

// sorted keys, so the file only changes where the lessons changed
const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]))
writeFileSync(new URL('../src/content/lean-results.json', import.meta.url), JSON.stringify(sorted) + '\n')
console.log(`Saved Lean's answers for ${codes.length} examples.`)
