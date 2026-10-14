// Runs Lean code through lean/.lake/build/bin/tutor-run and shapes its output for the UI.
import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findingsFor, fileFlags, type Finding } from './audit.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LEAN_DIR = join(ROOT, 'lean')
const RUNNER = join(LEAN_DIR, '.lake/build/bin/tutor-run')
const ELAN_HOME = join(ROOT, '.tools/elan')
const MATHLIB_PACKAGES = join(ROOT, 'mathlib/.lake/packages')
const TIMEOUT_MS = 20_000
// loading Mathlib from a cold disk can take a while the first time
const MATHLIB_TIMEOUT_MS = 90_000
const MAX_PARALLEL = 3
const MAX_CODE = 50_000

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
  /** true for the `by` that opens a proof: its goals are the starting point */
  start: boolean
  goalsBefore: string[]
  goalsAfter: string[]
}

export interface Hyp {
  name: string
  type: string
  english: string
  used: boolean
  prop: boolean
}

export interface DeclReport {
  name: string
  kind: string
  line: number
  statement: string
  english: string
  hyps: Hyp[]
  conclusion: string
  conclusionEnglish: string
  axioms: string[]
  contradiction: string | null
  circular: string | null
  trivial: string | null
  direct: string | null
  findings: Finding[]
}

export interface Audit {
  decls: DeclReport[]
  file: Finding[]
}

export interface RunResult {
  ok: boolean
  messages: Message[]
  steps: Step[]
  audit: Audit | null
  ms: number
}

export function leanReady(): boolean {
  return existsSync(RUNNER)
}

/** Whether Mathlib has been set up (make mathlib). */
export function mathlibReady(): boolean {
  return existsSync(join(MATHLIB_PACKAGES, 'mathlib/.lake/build/lib/lean/Mathlib.olean'))
}

/** Where Lean finds compiled libraries: the tutor's own, and Mathlib's when it is there. */
function leanPath(): string {
  const dirs = [join(LEAN_DIR, '.lake/build/lib/lean')]
  if (mathlibReady()) {
    for (const p of readdirSync(MATHLIB_PACKAGES)) dirs.push(join(MATHLIB_PACKAGES, p, '.lake/build/lib/lean'))
  }
  return dirs.join(':')
}

const usesMathlib = (code: string) => /^\s*import\s+Mathlib/m.test(code)

// a tiny semaphore, so a burst of requests does not start a dozen Lean processes
let running = 0
const waiting: (() => void)[] = []
async function slot<T>(f: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) await new Promise<void>((r) => waiting.push(r))
  running++
  try {
    return await f()
  } finally {
    running--
    waiting.shift()?.()
  }
}

function exec(code: string, audit: boolean): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(RUNNER, audit ? ['--audit'] : [], {
      cwd: LEAN_DIR,
      env: {
        ...process.env,
        ELAN_HOME,
        LEAN_PATH: leanPath(),
      },
    })
    let out = ''
    let err = ''
    const limit = usesMathlib(code) ? MATHLIB_TIMEOUT_MS : TIMEOUT_MS
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`Lean took longer than ${limit / 1000} seconds and was stopped.`))
    }, limit)
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (err += d))
    child.on('error', (e) => {
      clearTimeout(timer)
      reject(e)
    })
    child.on('close', (status) => {
      clearTimeout(timer)
      if (status === 0) resolvePromise(out)
      else reject(new Error(err.trim() || `Lean exited with status ${status}`))
    })
    child.stdin.end(code)
  })
}

const contains = (a: Range, b: Range) =>
  (a.line < b.line || (a.line === b.line && a.col <= b.col)) &&
  (a.endLine > b.endLine || (a.endLine === b.endLine && a.endCol >= b.endCol))

const sameRange = (a: Range, b: Range) =>
  a.line === b.line && a.col === b.col && a.endLine === b.endLine && a.endCol === b.endCol

/** Keeps the steps a reader would point at: each proof's start, then the innermost tactics. */
export function readableSteps(raw: Omit<Step, 'start'>[]): Step[] {
  const steps = raw
    // `·` alone, and bits like the `]` that `rw [h]` adds for its closing `rfl`, are not steps
    .filter((s) => s.tactic !== '·' && s.tactic !== '.' && !/^[\])}⟩,;]+$/.test(s.tactic))
    .map((s) => ({ ...s, start: s.tactic === 'by' || s.tactic.startsWith('by ') || s.tactic.startsWith('by\n') }))
  const kept = steps
    .filter((s) => s.start || !steps.some((t) => !t.start && t !== s && !sameRange(t, s) && contains(s, t)))
    .map((s) => {
      if (s.start) return s
      // inside a bullet `· exact h`, the bullet's own goals-after shows what is left of the
      // whole proof (the other cases), not just "this case is done": use the outermost step
      // that ends where this one ends
      const outer = steps
        .filter((t) => !t.start && t.endLine === s.endLine && t.endCol === s.endCol && contains(t, s))
        .reduce((a, b) => (contains(b, a) ? b : a), s)
      return { ...s, goalsAfter: outer.goalsAfter }
    })
  // Lean reports only the word `by` for a proof's start; stretch it over the proof's tactics
  // (up to the next proof), so the UI can tell which proof a cursor is in
  const after = (a: { line: number; col: number }, b: { line: number; col: number }) => a.line > b.line || (a.line === b.line && a.col >= b.col)
  return kept.map((s, i) => {
    if (!s.start) return s
    const next = kept.slice(i + 1).find((t) => t.start)
    const body = kept.filter((t) => !t.start && after(t, s) && (!next || !after(t, next)))
    const last = body.reduce<Range>((m, t) => (after({ line: t.endLine, col: t.endCol }, { line: m.endLine, col: m.endCol }) ? t : m), s)
    return { ...s, endLine: last.endLine, endCol: last.endCol }
  })
}

const cache = new Map<string, RunResult>()

export async function runLean(code: string, audit = false): Promise<RunResult> {
  if (code.length > MAX_CODE) throw new Error('That file is too long for the tutor (50,000 characters at most).')
  const key = `${audit ? 'A' : 'R'}:${code}`
  const hit = cache.get(key)
  if (hit) return hit
  const t0 = Date.now()
  const out = await slot(() => exec(code, audit))
  const parsed = JSON.parse(out) as {
    messages: Message[]
    steps: Omit<Step, 'start'>[]
    audit: Omit<DeclReport, 'findings'>[] | null
  }
  const messages = parsed.messages
  const hasErrors = messages.some((m) => m.severity === 'error')
  const result: RunResult = {
    ok: !hasErrors,
    messages,
    steps: readableSteps(parsed.steps),
    audit: audit
      ? {
          decls: (parsed.audit ?? []).map((d) => ({ ...d, findings: findingsFor(d) })),
          file: fileFlags(code, hasErrors, mathlibReady()),
        }
      : null,
    ms: Date.now() - t0,
  }
  cache.set(key, result)
  if (cache.size > 500) cache.delete(cache.keys().next().value!)
  return result
}
