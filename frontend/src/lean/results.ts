// What Lean answered for the course's own code. The site has no Lean server: `make snapshot`
// runs every example and question through Lean and saves the answers in
// src/content/lean-results.json, and `make test` fails if one is missing.

export type Severity = 'error' | 'warning' | 'info'

export interface Range {
  line: number
  col: number
  endLine: number
  endCol: number
}

export interface Message extends Range {
  severity: Severity
  text: string
}

export interface Step extends Range {
  tactic: string
  start: boolean
  goalsBefore: string[]
  goalsAfter: string[]
}

export interface RunResult {
  ok: boolean
  messages: Message[]
  steps: Step[]
}

let saved: Promise<Record<string, RunResult>> | null = null
const savedResults = () => (saved ??= import('../content/lean-results.json').then((m) => m.default as Record<string, RunResult>))

/** Lean's saved answer for this code. */
export async function runLean(code: string): Promise<RunResult> {
  const hit = (await savedResults())[code]
  if (!hit) throw new Error('Lean’s answer for this code was not saved (run `make snapshot`).')
  return hit
}

/** The tactic steps a learner can walk through (the `by` openers are the starting points). */
export const walkable = (steps: Step[]) => steps.filter((s) => !s.start)

/** What Lean thinks of the code, in one word. */
export function verdict(r: RunResult): 'error' | 'sorry' | 'ok' {
  if (r.messages.some((m) => m.severity === 'error')) return 'error'
  if (r.messages.some((m) => m.severity === 'warning' && m.text.includes('sorry'))) return 'sorry'
  return 'ok'
}
