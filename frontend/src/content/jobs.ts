// Every piece of Lean in the questions and the misconception examples, with what Lean must say
// about it. The content test checks each against real Lean, and the snapshot
// (scripts/snapshot.ts) saves Lean's answer for each, so the site can show them without a Lean
// server. (The lesson pages' Lean is checked by Verso when the site is built.)
import { fillIn, LESSONS, questionsOf, tacticOf } from './index.ts'
import { leanBlocks } from './markdown.ts'
import { MISCONCEPTIONS } from './misconceptions.ts'
import type { Expect } from './types.ts'

export interface LeanJob {
  /** where it appears, for error messages */
  where: string
  /** the lesson it belongs to (none for misconception examples) */
  day: number | null
  code: string
  expect: Expect
  mathlib: boolean
}

export function leanJobs(): LeanJob[] {
  const jobs: LeanJob[] = []
  for (const [id, m] of Object.entries(MISCONCEPTIONS)) {
    for (const b of leanBlocks(m.example)) jobs.push({ where: `misconception ${id}`, day: null, ...b })
  }
  for (const l of LESSONS) {
    for (const q of questionsOf(l)) {
      for (const o of q.options) for (const b of leanBlocks(o.why)) jobs.push({ where: `${q.id} why`, day: l.day, ...b })
      for (const b of leanBlocks(q.prompt)) jobs.push({ where: `${q.id} prompt`, day: l.day, ...b })
      if (!q.code) continue
      const mathlib = q.mathlib ?? false
      if (q.fillIn) {
        for (const o of q.options) {
          jobs.push({ where: `${q.id} with ${o.text}`, day: l.day, code: fillIn(q.code, tacticOf(o.text)), expect: o.correct ? 'ok' : 'error', mathlib })
        }
      } else {
        jobs.push({ where: `${q.id} code`, day: l.day, code: q.code, expect: q.codeExpect ?? 'ok', mathlib })
      }
    }
  }
  return jobs
}
