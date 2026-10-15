// Generated practice questions, after the LTL Tutor's design:
// a seed statement is mutated by rules that each embody one misconception, mutants that mean
// the same as the seed are discarded (checked on many small random worlds), and a world where
// the learner's pick and the right answer disagree becomes the concrete feedback.
//
// Statements talk about a few students: unary properties (studies, passes, …) and one
// relation (helps). Small enough to evaluate exactly, rich enough for ∀/∃/→/∧/∨/¬/↔.
import type { MisconceptionId } from '../content/misconceptions.ts'

export type Formula =
  | { k: 'pred'; p: Pred; v: string }
  | { k: 'helps'; a: string; b: string }
  | { k: 'not'; f: Formula }
  | { k: 'and' | 'or' | 'imp' | 'iff'; a: Formula; b: Formula }
  | { k: 'all' | 'ex'; v: string; f: Formula }

export type Pred = 'Studies' | 'Passes' | 'Sleeps' | 'Sings'
export const PREDS: Pred[] = ['Studies', 'Passes', 'Sleeps', 'Sings']
const VERB: Record<Pred, { s: string; base: string }> = {
  Studies: { s: 'studies', base: 'study' },
  Passes: { s: 'passes', base: 'pass' },
  Sleeps: { s: 'sleeps', base: 'sleep' },
  Sings: { s: 'sings', base: 'sing' },
}

// ---------- constructors ----------
const P = (p: Pred, v = 's'): Formula => ({ k: 'pred', p, v })
const H = (a: string, b: string): Formula => ({ k: 'helps', a, b })
const not = (f: Formula): Formula => ({ k: 'not', f })
const and = (a: Formula, b: Formula): Formula => ({ k: 'and', a, b })
const or = (a: Formula, b: Formula): Formula => ({ k: 'or', a, b })
const imp = (a: Formula, b: Formula): Formula => ({ k: 'imp', a, b })
const iff = (a: Formula, b: Formula): Formula => ({ k: 'iff', a, b })
const all = (v: string, f: Formula): Formula => ({ k: 'all', v, f })
const ex = (v: string, f: Formula): Formula => ({ k: 'ex', v, f })

// ---------- worlds ----------
export interface World {
  students: string[]
  has: Record<Pred, boolean[]>
  helps: boolean[][]
}

export const NAMES = ['Ana', 'Ben', 'Cy']

export function evaluate(f: Formula, w: World, env: Record<string, number> = {}): boolean {
  switch (f.k) {
    case 'pred': return w.has[f.p][env[f.v]]
    case 'helps': return w.helps[env[f.a]][env[f.b]]
    case 'not': return !evaluate(f.f, w, env)
    case 'and': return evaluate(f.a, w, env) && evaluate(f.b, w, env)
    case 'or': return evaluate(f.a, w, env) || evaluate(f.b, w, env)
    case 'imp': return !evaluate(f.a, w, env) || evaluate(f.b, w, env)
    case 'iff': return evaluate(f.a, w, env) === evaluate(f.b, w, env)
    case 'all': return w.students.every((_, i) => evaluate(f.f, w, { ...env, [f.v]: i }))
    case 'ex': return w.students.some((_, i) => evaluate(f.f, w, { ...env, [f.v]: i }))
  }
}

/** A seeded PRNG (mulberry32), so a question can be regenerated from its seed. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomWorld(rand: () => number, size = 1 + Math.floor(rand() * 3)): World {
  const students = NAMES.slice(0, size)
  const has = Object.fromEntries(PREDS.map((p) => [p, students.map(() => rand() < 0.5)])) as Record<Pred, boolean[]>
  const helps = students.map(() => students.map(() => rand() < 0.4))
  return { students, has, helps }
}

/** Worlds for comparing statements: random, plus every world with one or two students. */
const PROBE_WORLDS: World[] = (() => {
  const rand = rng(12345)
  return Array.from({ length: 600 }, (_, i) => randomWorld(rand, 1 + (i % 3)))
})()

export function equivalent(a: Formula, b: Formula): boolean {
  return PROBE_WORLDS.every((w) => evaluate(a, w) === evaluate(b, w))
}

/** A small world where `a` and `b` disagree, preferring fewer students. */
export function separatingWorld(a: Formula, b: Formula): World | null {
  for (const size of [1, 2, 3]) {
    const w = PROBE_WORLDS.find((w) => w.students.length === size && evaluate(a, w) !== evaluate(b, w))
    if (w) return w
  }
  return null
}

// ---------- printing as Lean ----------
const PREC = { iff: 20, imp: 25, or: 30, and: 35 } as const

/** Lean syntax, with only the brackets Lean needs (Lean's real precedences and associativity). */
export function toLean(f: Formula, ctx = 0): string {
  const wrap = (s: string, prec: number) => (prec < ctx ? `(${s})` : s)
  switch (f.k) {
    case 'pred': return `${f.p} ${f.v}`
    case 'helps': return `Helps ${f.a} ${f.b}`
    case 'not': return wrap(`¬${toLean(f.f, 40)}`, 40)
    case 'all':
    case 'ex': {
      // a binder reaches as far right as it can, so it needs brackets anywhere but at the end
      const s = `${f.k === 'all' ? '∀' : '∃'} ${f.v} : Student, ${toLean(f.f, 0)}`
      return ctx > 0 ? `(${s})` : s
    }
    default: {
      const p = PREC[f.k]
      const op = { iff: '↔', imp: '→', or: '∨', and: '∧' }[f.k]
      // ∧ ∨ → are right-associative; ↔ is non-associative, so both sides need brackets
      const left = toLean(f.a, p + 1)
      const right = toLean(f.b, f.k === 'iff' ? p + 1 : p)
      // a binder on the left is bracketed by toLean (ctx > 0); on the right it may run to the end
      return wrap(`${left} ${op} ${right}`, p)
    }
  }
}

/** Fully bracketed Lean, used by the tests to check toLean's brackets against Lean's parser. */
export function toLeanBracketed(f: Formula): string {
  switch (f.k) {
    case 'pred': return `(${f.p} ${f.v})`
    case 'helps': return `(Helps ${f.a} ${f.b})`
    case 'not': return `(¬${toLeanBracketed(f.f)})`
    case 'all': return `(∀ ${f.v} : Student, ${toLeanBracketed(f.f)})`
    case 'ex': return `(∃ ${f.v} : Student, ${toLeanBracketed(f.f)})`
    default: return `(${toLeanBracketed(f.a)} ${{ iff: '↔', imp: '→', or: '∨', and: '∧' }[f.k]} ${toLeanBracketed(f.b)})`
  }
}

export const LEAN_PREAMBLE = `variable (Student : Type) (Studies Passes Sleeps Sings : Student → Prop)
  (Helps : Student → Student → Prop)`

// ---------- English ----------
type Lit = { p: Pred; neg: boolean }

/** `f` as a property of variable v, when it is a property or its negation. */
function literal(f: Formula, v: string): Lit | null {
  if (f.k === 'pred' && f.v === v) return { p: f.p, neg: false }
  if (f.k === 'not' && f.f.k === 'pred' && f.f.v === v) return { p: f.f.p, neg: true }
  return null
}
const says = (l: Lit) => (l.neg ? `does not ${VERB[l.p].base}` : VERB[l.p].s)
const sayBase = (l: Lit) => (l.neg ? `not ${VERB[l.p].base}` : VERB[l.p].base)

/**
 * A plain-English reading. Common shapes get natural phrasing (like the LTL Tutor's pattern
 * table); anything else is read out mechanically, which is clumsy but never wrong.
 */
export function toEnglish(f: Formula): string {
  return capitalize(pattern(f) ?? mechanical(f))
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1) + '.'
}

const Q1 = (f: Formula) => (f.k === 'all' || f.k === 'ex' ? f.k : null)

function pattern(f: Formula): string | null {
  if (f.k === 'all' || f.k === 'ex') {
    const v = f.v
    const q = f.k === 'all' ? 'every student' : 'some student'
    const body = f.f
    const single = literal(body, v)
    if (single) {
      if (f.k === 'all' && single.neg) return `no student ${VERB[single.p].s}`
      return `${q} ${says(single)}`
    }
    if (body.k === 'and' || body.k === 'or') {
      const a = literal(body.a, v)
      const b = literal(body.b, v)
      // "does not X and Y" could be misread as "does not (X and Y)": put the positive part
      // first ("Y and does not X"), which means the same since and/or work in either order
      if (a && b) return a.neg && !b.neg ? `${q} ${says(b)} ${body.k} ${says(a)}` : `${q} ${says(a)} ${body.k} ${says(b)}`
    }
    if (f.k === 'all' && body.k === 'imp') {
      const a = literal(body.a, v)
      const b = literal(body.b, v)
      if (a && b) {
        if (!a.neg && b.neg) return `no student who ${says(a)} ${VERB[b.p].s}`
        return `every student who ${says(a)} ${says(b)}`
      }
      if (body.b.k === 'imp') {
        const c = literal(body.b.a, v)
        const d = literal(body.b.b, v)
        if (a && c && d) return `every student who ${says(a)} and ${says(c)} ${says(d)}`
      }
    }
    if (f.k === 'all' && body.k === 'imp' && body.a.k === 'or') {
      const a = literal(body.a.a, v)
      const b = literal(body.a.b, v)
      const c = literal(body.b, v)
      if (a && b && c) return `every student who ${says(a)} or ${says(b)} ${says(c)}`
    }
    if (body.k === 'not' && body.f.k === 'and' && f.k === 'all') {
      const a = literal(body.f.a, v)
      const b = literal(body.f.b, v)
      if (a && b && !a.neg && !b.neg) return `no student both ${VERB[a.p].s} and ${VERB[b.p].s}`
    }
    if (body.k === 'and' && f.k === 'ex') {
      const a = literal(body.a, v)
      const b = literal(body.b, v)
      if (a && b && !a.neg && b.neg) return `some student ${says(a)} but ${says(b)}`
    }
    if (f.k === 'all' && body.k === 'iff') {
      const a = literal(body.a, v)
      const b = literal(body.b, v)
      if (a && b) return `each student ${says(a)} exactly when they ${sayBase(b)}`
    }
    // relation patterns
    if (body.k === 'all' || body.k === 'ex') {
      const w = body.v
      const inner = body.f
      if (Q1(f) === 'all' && inner.k === 'imp' && body.k === 'all') {
        const l = literal(inner.a, w)
        if (l && !l.neg && inner.b.k === 'helps' && inner.b.a === v && inner.b.b === w) return `every student helps every student who ${says(l)}`
      }
      if (Q1(f) === 'all' && inner.k === 'and' && body.k === 'ex') {
        const l = literal(inner.a, w)
        if (l && !l.neg && inner.b.k === 'helps' && inner.b.a === v && inner.b.b === w) return `every student helps some student who ${says(l)}`
      }
      if (inner.k === 'helps') {
        const subjFirst = inner.a === v && inner.b === w
        const objFirst = inner.a === w && inner.b === v
        const Q1 = f.k, Q2 = body.k
        if (subjFirst) {
          if (Q1 === 'all' && Q2 === 'ex') return 'every student helps some student'
          if (Q1 === 'ex' && Q2 === 'all') return 'some student helps every student'
          if (Q1 === 'all' && Q2 === 'all') return 'every student helps every student'
          if (Q1 === 'ex' && Q2 === 'ex') return 'some student helps some student'
        }
        if (objFirst) {
          if (Q1 === 'all' && Q2 === 'ex') return 'every student is helped by some student'
          if (Q1 === 'ex' && Q2 === 'all') return 'some student is helped by every student'
        }
      }
    }
  }
  if (f.k === 'imp' && (f.a.k === 'all' || f.a.k === 'ex') && f.b.k === 'all') {
    const l1 = literal(f.a.f, f.a.v)
    const l2 = literal(f.b.f, f.b.v)
    if (l1 && l2 && !l1.neg && !l2.neg) return `if ${f.a.k === 'all' ? 'every' : 'some'} student ${VERB[l1.p].s}, then every student ${VERB[l2.p].s}`
  }
  if (f.k === 'and' && f.a.k === 'all' && f.b.k === 'all') {
    const l1 = literal(f.a.f, f.a.v)
    const l2 = literal(f.b.f, f.b.v)
    if (l1 && l2 && !l1.neg && !l2.neg) return `every student ${VERB[l1.p].s}, and every student ${VERB[l2.p].s}`
  }
  if (f.k === 'not' && f.f.k === 'all') {
    const l = literal(f.f.f, f.f.v)
    if (l && !l.neg) return `not every student ${VERB[l.p].s}`
  }
  if (f.k === 'not' && f.f.k === 'ex') {
    const l = literal(f.f.f, f.f.v)
    if (l && !l.neg) return `no student ${VERB[l.p].s}`
  }
  return null
}

function mechanical(f: Formula): string {
  const sub = (g: Formula) => {
    const s = mechanical(g)
    return g.k === 'pred' || g.k === 'helps' || (g.k === 'not' && (g.f.k === 'pred' || g.f.k === 'helps')) ? s : `(${s})`
  }
  switch (f.k) {
    case 'pred': return `${f.v} ${VERB[f.p].s}`
    case 'helps': return `${f.a} helps ${f.b}`
    case 'not':
      if (f.f.k === 'pred') return `${f.f.v} does not ${VERB[f.f.p].base}`
      if (f.f.k === 'helps') return `${f.f.a} does not help ${f.f.b}`
      return `it is not the case that ${sub(f.f)}`
    case 'and': return `${sub(f.a)} and ${sub(f.b)}`
    case 'or': return `${sub(f.a)} or ${sub(f.b)}`
    case 'imp': return `if ${sub(f.a)}, then ${sub(f.b)}`
    case 'iff': return `${sub(f.a)} exactly when ${sub(f.b)}`
    case 'all': return `for every student ${f.v}, ${mechanical(f.f)}`
    case 'ex': return `there is a student ${f.v} such that ${mechanical(f.f)}`
  }
}

// ---------- seeds and conceptual mutations ----------
export interface Mutant {
  f: Formula
  misconceptions: MisconceptionId[]
}

interface Seed {
  /** builds the statement from distinct properties a, b, c */
  make: (a: Pred, b: Pred, c: Pred) => Formula
  /** mutation rules, each embodying one misconception */
  mutate: (a: Pred, b: Pred, c: Pred) => Mutant[]
}

const M = (f: Formula, m: MisconceptionId): Mutant => ({ f, misconceptions: [m] })

export const SEEDS: Seed[] = [
  { // every student who a's b's
    make: (a, b) => all('s', imp(P(a), P(b))),
    mutate: (a, b) => [
      M(all('s', and(P(a), P(b))), 'forall-and'),
      M(all('s', imp(P(b), P(a))), 'converse'),
      M(ex('s', imp(P(a), P(b))), 'exists-implies'),
      M(ex('s', and(P(a), P(b))), 'statement-drift'),
      M(all('s', iff(P(a), P(b))), 'converse'),
    ],
  },
  { // some student a's and b's
    make: (a, b) => ex('s', and(P(a), P(b))),
    mutate: (a, b) => [
      M(ex('s', imp(P(a), P(b))), 'exists-implies'),
      M(all('s', and(P(a), P(b))), 'statement-drift'),
      M(all('s', imp(P(a), P(b))), 'forall-and'),
      M(ex('s', or(P(a), P(b))), 'not-scope'),
    ],
  },
  { // no student who a's b's
    make: (a, b) => all('s', imp(P(a), not(P(b)))),
    mutate: (a, b) => [
      M(all('s', and(not(P(a)), P(b))), 'not-scope'),
      M(all('s', imp(not(P(a)), P(b))), 'not-scope'),
      M(ex('s', and(P(a), not(P(b)))), 'statement-drift'),
      M(all('s', imp(P(b), P(a))), 'converse'),
      M(not(all('s', imp(P(a), P(b)))), 'not-scope'),
    ],
  },
  { // every student who a's and b's c's
    make: (a, b, c) => all('s', imp(P(a), imp(P(b), P(c)))),
    mutate: (a, b, c) => [
      M(all('s', imp(imp(P(a), P(b)), P(c))), 'arrow-grouping'),
      M(all('s', and(P(a), and(P(b), P(c)))), 'forall-and'),
      M(all('s', imp(P(c), and(P(a), P(b)))), 'converse'),
      M(all('s', imp(or(P(a), P(b)), P(c))), 'arrow-grouping'),
    ],
  },
  { // every student helps some student
    make: () => all('s', ex('t', H('s', 't'))),
    mutate: () => [
      M(ex('t', all('s', H('s', 't'))), 'quantifier-order'),
      M(ex('s', all('t', H('s', 't'))), 'quantifier-order'),
      M(all('s', ex('t', H('t', 's'))), 'statement-drift'),
      M(all('s', all('t', H('s', 't'))), 'exists-witness'),
    ],
  },
  { // some student helps every student
    make: () => ex('s', all('t', H('s', 't'))),
    mutate: () => [
      M(all('t', ex('s', H('s', 't'))), 'quantifier-order'),
      M(all('s', ex('t', H('s', 't'))), 'quantifier-order'),
      M(ex('s', ex('t', H('s', 't'))), 'statement-drift'),
    ],
  },
  { // not every student a's
    make: (a) => not(all('s', P(a))),
    mutate: (a) => [
      M(all('s', not(P(a))), 'not-scope'),
      M(not(ex('s', P(a))), 'not-scope'),
      M(ex('s', P(a)), 'statement-drift'),
      M(all('s', P(a)), 'not-scope'),
      M(ex('s', not(P(a))), 'quantifier-order'),
    ],
  },
  { // each student a's exactly when they b
    make: (a, b) => all('s', iff(P(a), P(b))),
    mutate: (a, b) => [
      M(all('s', imp(P(a), P(b))), 'converse'),
      M(all('s', imp(P(b), P(a))), 'converse'),
      M(all('s', and(P(a), P(b))), 'forall-and'),
    ],
  },
  { // every student who a's helps some student who b's
    make: (a, b) => all('s', imp(P(a), ex('t', and(P(b, 't'), H('s', 't'))))),
    mutate: (a, b) => [
      M(all('s', imp(P(a), ex('t', imp(P(b, 't'), H('s', 't'))))), 'exists-implies'),
      M(all('s', and(P(a), ex('t', and(P(b, 't'), H('s', 't'))))), 'forall-and'),
      M(ex('t', and(P(b, 't'), all('s', imp(P(a), H('s', 't'))))), 'quantifier-order'),
      M(all('s', imp(P(a), all('t', imp(P(b, 't'), H('s', 't'))))), 'exists-witness'),
    ],
  },
  { // every student a's or b's
    make: (a, b) => all('s', or(P(a), P(b))),
    mutate: (a, b) => [
      M(or(all('s', P(a)), all('s', P(b))), 'quantifier-order'),
      M(all('s', and(P(a), P(b))), 'forall-and'),
      M(all('s', imp(P(a), P(b))), 'converse'),
    ],
  },
  { // every student who a's or b's, c's
    make: (a, b, c) => all('s', imp(or(P(a), P(b)), P(c))),
    mutate: (a, b, c) => [
      M(all('s', or(P(a), imp(P(b), P(c)))), 'not-scope'),
      M(all('s', imp(and(P(a), P(b)), P(c))), 'statement-drift'),
      M(all('s', imp(P(c), or(P(a), P(b)))), 'converse'),
      M(ex('s', imp(or(P(a), P(b)), P(c))), 'exists-implies'),
    ],
  },
  { // some student a's but does not b
    make: (a, b) => ex('s', and(P(a), not(P(b)))),
    mutate: (a, b) => [
      M(not(ex('s', and(P(a), P(b)))), 'not-scope'),
      M(ex('s', not(and(P(a), P(b)))), 'not-scope'),
      M(all('s', and(P(a), not(P(b)))), 'statement-drift'),
      M(ex('s', imp(P(a), not(P(b)))), 'exists-implies'),
    ],
  },
  { // if every student a's, then every student b's
    make: (a, b) => imp(all('s', P(a)), all('s', P(b))),
    mutate: (a, b) => [
      M(all('s', imp(P(a), P(b))), 'quantifier-order'),
      M(imp(all('s', P(b)), all('s', P(a))), 'converse'),
      M(imp(ex('s', P(a)), all('s', P(b))), 'statement-drift'),
      M(and(all('s', P(a)), all('s', P(b))), 'hypothesis-is-fact'),
    ],
  },
  { // every student helps every student who a's
    make: (a) => all('s', all('t', imp(P(a, 't'), H('s', 't')))),
    mutate: (a) => [
      M(all('s', ex('t', and(P(a, 't'), H('s', 't')))), 'quantifier-order'),
      M(all('s', all('t', and(P(a, 't'), H('s', 't')))), 'forall-and'),
      M(all('s', all('t', imp(H('s', 't'), P(a, 't')))), 'converse'),
    ],
  },
  { // no student a's and b's
    make: (a, b) => all('s', not(and(P(a), P(b)))),
    mutate: (a, b) => [
      M(all('s', and(not(P(a)), P(b))), 'not-scope'),
      M(all('s', and(not(P(a)), not(P(b)))), 'not-scope'),
      M(not(all('s', and(P(a), P(b)))), 'quantifier-order'),
      M(ex('s', not(and(P(a), P(b)))), 'statement-drift'),
    ],
  },
]

/** The distinct (and non-equivalent) mutants of a seed; equal ones are merged (LTL Tutor, fn. 3). */
export function mutants(seed: Formula, raw: Mutant[]): Mutant[] {
  const out: Mutant[] = []
  for (const m of raw) {
    if (equivalent(m.f, seed)) continue
    const same = out.find((o) => equivalent(o.f, m.f))
    if (same) same.misconceptions = [...new Set([...same.misconceptions, ...m.misconceptions])]
    else out.push({ f: m.f, misconceptions: [...m.misconceptions] })
  }
  return out
}

// ---------- questions ----------
export type GenKind = 'to-lean' | 'to-english' | 'pick-world'

export interface GenOption {
  f: Formula | null
  world?: World
  correct: boolean
  misconceptions: MisconceptionId[]
}

export interface GenQuestion {
  id: string
  kind: GenKind
  seed: Formula
  options: GenOption[]
}

/** Weights: how likely the learner holds each misconception (0 when unknown). */
export type Weights = Partial<Record<MisconceptionId, number>>

function weightedPick<T>(items: T[], weight: (t: T) => number, rand: () => number): T {
  const ws = items.map((t) => Math.max(weight(t), 0) + 0.15)
  let r = rand() * ws.reduce((a, b) => a + b, 0)
  for (let i = 0; i < items.length; i++) if ((r -= ws[i]) < 0) return items[i]
  return items[items.length - 1]
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const score = (ms: MisconceptionId[], w: Weights) => Math.max(0, ...ms.map((m) => w[m] ?? 0))

/**
 * A new question. Seeds and distractors are chosen with a bias toward the misconceptions the
 * learner most likely holds, as in the LTL Tutor's outer loop.
 */
export function generate(seedNumber: number, weights: Weights = {}, kind?: GenKind): GenQuestion {
  const rand = rng(seedNumber)
  const seedDef = weightedPick(SEEDS, (s) => score(s.mutate('Studies', 'Passes', 'Sleeps').flatMap((m) => m.misconceptions), weights), rand)
  const [a, b, c] = shuffle(PREDS, rand)
  const seed = seedDef.make(a, b, c)
  const ms = mutants(seed, seedDef.mutate(a, b, c))
  const k: GenKind = kind ?? (['to-lean', 'to-english', 'pick-world'] as const)[Math.floor(rand() * 3)]
  const id = `gen-${seedNumber}-${k}`

  if (k === 'pick-world') {
    // the right answer is a world where the seed holds; each distractor is a world where a
    // mutant holds but the seed does not, so picking it reveals that mutant's misconception
    const options: GenOption[] = []
    const ordered = [...ms].sort((x, y) => score(y.misconceptions, weights) - score(x.misconceptions, weights) || rand() - 0.5)
    for (const m of ordered) {
      if (options.length === 3) break
      const w = findWorld(rand, (w) => evaluate(m.f, w) && !evaluate(seed, w))
      if (w) options.push({ f: m.f, world: w, correct: false, misconceptions: m.misconceptions })
    }
    // mutants that imply the seed have no world of their own: fill up with worlds where the
    // seed fails, tagged with the mutants that hold there
    for (let tries = 0; options.length < 3 && tries < 20; tries++) {
      const w = findWorld(rand, (w) => !evaluate(seed, w))
      if (!w || options.some((o) => sameWorld(o.world!, w))) continue
      const held = ms.filter((m) => evaluate(m.f, w)).flatMap((m) => m.misconceptions)
      options.push({ f: null, world: w, correct: false, misconceptions: held.length ? [...new Set(held)] : ordered[0].misconceptions })
    }
    const good = findWorld(rand, (w) => evaluate(seed, w) && ms.some((m) => !evaluate(m.f, w)))
      ?? findWorld(rand, (w) => evaluate(seed, w))!
    options.push({ f: seed, world: good, correct: true, misconceptions: [] })
    return { id, kind: k, seed, options: shuffle(options, rand) }
  }

  const picked = [...ms]
    .sort((x, y) => score(y.misconceptions, weights) - score(x.misconceptions, weights) || rand() - 0.5)
    .slice(0, 3)
  const options: GenOption[] = [
    { f: seed, correct: true, misconceptions: [] },
    ...picked.map((m) => ({ f: m.f, correct: false, misconceptions: m.misconceptions })),
  ]
  return { id, kind: k, seed, options: shuffle(options, rand) }
}

const sameWorld = (a: World, b: World) => JSON.stringify(a) === JSON.stringify(b)

function findWorld(rand: () => number, ok: (w: World) => boolean): World | null {
  for (let i = 0; i < 400; i++) {
    const w = randomWorld(rand, 2 + Math.floor(rand() * 2))
    if (ok(w)) return w
  }
  return null
}

/** Why `f` is true or false in `w`, in a sentence: the student(s) that decide it. */
export function explain(f: Formula, w: World): string {
  const truth = evaluate(f, w)
  if (f.k === 'all' || f.k === 'ex') {
    const idx = w.students.map((_, i) => i)
    const holds = (i: number) => evaluate(f.f, w, { [f.v]: i })
    if (f.k === 'all') {
      const bad = idx.filter((i) => !holds(i))
      return truth
        ? `True: it holds for every student (${w.students.join(', ')}).`
        : `False: it fails for ${bad.map((i) => w.students[i]).join(' and ')}.`
    }
    const good = idx.filter(holds)
    return truth
      ? `True: ${good.map((i) => w.students[i]).join(' and ')} ${good.length > 1 ? 'are examples' : 'is an example'}.`
      : `False: no student is an example.`
  }
  const T = truth ? 'True' : 'False'
  const why = (g: Formula) => {
    const s = explain(g, w).replace(/^(True|False): /, '').replace(/\.$/, '')
    return `${evaluate(g, w) ? 'true' : 'false'} (${s.charAt(0).toLowerCase()}${s.slice(1)})`
  }
  if (f.k === 'not') return `${T}: the part after ¬ is ${why(f.f)}.`
  if (f.k === 'pred' || f.k === 'helps') return `${T} in this group.`
  if ('a' in f) return `${T}: the left part is ${why(f.a)}, and the right part is ${why(f.b)}.`
  return `${T} in this group.`
}
