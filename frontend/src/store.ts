// The learner's progress, kept in this browser (localStorage), and the misconception model.
//
// The model follows the LTL Tutor: each wrong answer counts toward the misconceptions its
// option is tagged with, weighted by recency (a decay inversely proportional to the time since
// the mistake). From a uniform prior, a misconception's relative likelihood is its share of
// the total. Once there are at least 5 mistakes, the most likely misconception is explained.
import { useCallback, useEffect, useState } from 'react'
import { MISCONCEPTIONS, type MisconceptionId } from './content/misconceptions'

export interface Answer {
  /** question id (lesson questions) or generated id */
  q: string
  at: number
  correct: boolean
  misconceptions: MisconceptionId[]
  /** which option was picked (lesson questions), so the answer can be shown again */
  pick?: number
}

export interface Progress {
  /** day → when it was completed (ms) */
  done: Record<number, number>
  /** first answer to each question, in order */
  answers: Answer[]
  /** the misconception explanation last shown, and the number of mistakes at that time */
  explained: { id: MisconceptionId; mistakes: number } | null
  /** day → the screen of the lesson the learner was last on */
  at: Record<number, number>
}

const KEY = 'lean-easy-progress-v1'
const EMPTY: Progress = { done: {}, answers: [], explained: null, at: {} }

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Progress) } : EMPTY
  } catch {
    return EMPTY
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable: progress lasts until the tab closes */
  }
}

const listeners = new Set<(p: Progress) => void>()
let current = load()

function update(f: (p: Progress) => Progress) {
  current = f(current)
  save(current)
  listeners.forEach((l) => l(current))
}

export const actions = {
  answer(a: Omit<Answer, 'at'>) {
    // a lesson question counts once (its first answer); practice answers all count
    const once = /^d\d+-/.test(a.q)
    update((p) => (once && p.answers.some((x) => x.q === a.q) ? p : { ...p, answers: [...p.answers, { ...a, at: Date.now() }] }))
  },
  position(day: number, screen: number) {
    update((p) => (p.at[day] === screen ? p : { ...p, at: { ...p.at, [day]: screen } }))
  },
  complete(day: number) {
    update((p) => (p.done[day] ? p : { ...p, done: { ...p.done, [day]: Date.now() } }))
  },
  explained(id: MisconceptionId) {
    update((p) => ({ ...p, explained: { id, mistakes: mistakes(p) } }))
  },
  reset() {
    update(() => EMPTY)
  },
}

export function useProgress(): Progress {
  const [p, setP] = useState(current)
  useEffect(() => {
    listeners.add(setP)
    return () => void listeners.delete(setP)
  }, [])
  return p
}

/** Answers to lesson questions, latest first: has the learner seen it, and how did it go? */
export function useAnswerOf(): (q: string) => Answer | undefined {
  const p = useProgress()
  return useCallback((q: string) => p.answers.find((a) => a.q === q), [p])
}

export const mistakes = (p: Progress) => p.answers.filter((a) => !a.correct).length

const DAY_MS = 24 * 60 * 60 * 1000

/** Recency-weighted mistake score of each misconception. */
function scores(p: Progress, now = Date.now()): Record<MisconceptionId, number> {
  const ids = Object.keys(MISCONCEPTIONS) as MisconceptionId[]
  const score = Object.fromEntries(ids.map((id) => [id, 0])) as Record<MisconceptionId, number>
  for (const a of p.answers) {
    if (a.correct) continue
    const decay = 1 / (1 + (now - a.at) / DAY_MS)
    for (const m of a.misconceptions) if (m in score) score[m] += decay / a.misconceptions.length
  }
  return score
}

/** Each misconception's relative likelihood (sums to 1), starting from a uniform prior. */
export function likelihoods(p: Progress): Record<MisconceptionId, number> {
  const score = scores(p)
  const prior = 0.05
  const ids = Object.keys(score) as MisconceptionId[]
  const total = ids.reduce((s, id) => s + score[id] + prior, 0)
  return Object.fromEntries(ids.map((id) => [id, (score[id] + prior) / total])) as Record<MisconceptionId, number>
}

/** Misconceptions with recent mistakes, most likely first; weight is in (0, 1]. */
export function weakSpots(p: Progress, limit = 3): { id: MisconceptionId; weight: number }[] {
  const score = scores(p)
  const max = Math.max(...Object.values(score))
  return (Object.entries(score) as [MisconceptionId, number][])
    .filter(([, s]) => s > 0.05)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, s]) => ({ id, weight: s / max }))
}

/**
 * The misconception to explain now, if any: after 5 mistakes in all, and 5 more since the
 * last explanation (LTL Tutor, section 5.2).
 */
export function dueExplanation(p: Progress): MisconceptionId | null {
  const n = mistakes(p)
  if (n < 5) return null
  if (p.explained && n - p.explained.mistakes < 5) return null
  return weakSpots(p, 1)[0]?.id ?? null
}

/** The first day not yet completed (or the last day). */
export function nextDay(p: Progress, total: number): number {
  for (let d = 1; d <= total; d++) if (!p.done[d]) return d
  return total
}
