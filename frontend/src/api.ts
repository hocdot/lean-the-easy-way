// The Lean backend (backend/server.ts). Types mirror backend/lean.ts.

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

export type Level = 'bad' | 'warn' | 'info' | 'good'

export interface Finding {
  level: Level
  title: string
  detail: string
}

export interface DeclReport {
  name: string
  kind: string
  line: number
  statement: string
  english: string
  hyps: { name: string; type: string; english: string; used: boolean; prop: boolean }[]
  conclusion: string
  conclusionEnglish: string
  axioms: string[]
  contradiction: string | null
  circular: string | null
  trivial: string | null
  direct: string | null
  findings: Finding[]
}

export interface RunResult {
  ok: boolean
  messages: Message[]
  steps: Step[]
  audit: { decls: DeclReport[]; file: Finding[] } | null
  ms: number
}

export class BackendDown extends Error {}

/**
 * The hosted site (GitHub Pages) has no Lean server: it shows Lean's saved answers for the
 * course's own examples (src/content/lean-results.json, made by `make snapshot`) and keeps
 * the Lab for later. Set by VITE_STATIC=1 at build time.
 */
export const STATIC = import.meta.env.VITE_STATIC === '1'

type Saved = Record<string, Omit<RunResult, 'audit' | 'ms'>>
let saved: Promise<Saved> | null = null
const savedResults = () => (saved ??= import('./content/lean-results.json').then((m) => m.default as Saved))

export async function isSaved(code: string): Promise<boolean> {
  return code in (await savedResults())
}

export async function runLean(code: string, audit = false): Promise<RunResult> {
  // the course's own examples: Lean's answer was saved when the site was built
  if (!audit) {
    const hit = (await savedResults())[code]
    if (hit) return { ...hit, audit: null, ms: 0 }
  }
  if (STATIC) throw new BackendDown('Running new code needs a Lean server, which the hosted site does not have yet.')
  let res: Response
  try {
    res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, audit }),
    })
  } catch {
    throw new BackendDown('The Lean backend is not running.')
  }
  if (res.status === 502 || res.status === 504) throw new BackendDown('The Lean backend is not running.')
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `The backend answered ${res.status}.`)
  return body as RunResult
}

let healthCheck: Promise<{ lean: boolean; mathlib: boolean } | null> | null = null

/** What the backend can do (asked once per page load); null when it is not running. */
export function capabilities() {
  if (STATIC) return Promise.resolve(null)
  healthCheck ??= fetch('/api/health')
    .then((res) => (res.ok ? (res.json() as Promise<{ lean: boolean; mathlib: boolean }>) : null))
    .catch(() => null)
  return healthCheck
}

export async function health(): Promise<'ok' | 'no-lean' | 'down'> {
  const c = await capabilities()
  return !c ? 'down' : c.lean ? 'ok' : 'no-lean'
}

/** The tactic steps a learner can walk through (the `by` openers are the starting points). */
export const walkable = (steps: Step[]) => steps.filter((s) => !s.start)

/** What Lean thinks of the code, in one word. */
export function verdict(r: RunResult): 'error' | 'sorry' | 'ok' {
  if (r.messages.some((m) => m.severity === 'error')) return 'error'
  if (r.messages.some((m) => m.severity === 'warning' && m.text.includes('sorry'))) return 'sorry'
  return 'ok'
}
