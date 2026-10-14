// Checks the course content: its structure, and every piece of Lean in it, with the real Lean.
// Run with `make test`. A lesson may only claim what Lean confirms. Without Lean (as on the
// GitHub build), the Lean checks are skipped and the saved snapshot is checked instead.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { leanReady, mathlibReady, runLean, type RunResult } from '../../backend/lean.ts'
import { LESSONS, questionsOf } from '../src/content/index.ts'
import { leanJobs } from '../src/content/jobs.ts'
import { MISCONCEPTIONS } from '../src/content/misconceptions.ts'
import type { Expect } from '../src/content/types.ts'
import snapshot from '../src/content/lean-results.json' with { type: 'json' }

const LEAN = leanReady()
const MATHLIB = mathlibReady()
const only = process.env.DAY ? Number(process.env.DAY) : null
const jobs = leanJobs()

function verdict(r: Pick<RunResult, 'messages'>): Exclude<Expect, 'skip'> {
  if (r.messages.some((m) => m.severity === 'error')) return 'error'
  if (r.messages.some((m) => m.severity === 'warning' && m.text.includes('sorry'))) return 'sorry'
  return 'ok'
}

function describe(r: Pick<RunResult, 'messages'>) {
  return r.messages.map((m) => `  ${m.line}:${m.col} ${m.severity}: ${m.text.split('\n')[0]}`).join('\n')
}

test('days are numbered 1, 2, 3, … and question ids are unique', () => {
  LESSONS.forEach((l, i) => assert.equal(l.day, i + 1, `lesson "${l.title}"`))
  const ids = LESSONS.flatMap((l) => questionsOf(l).map((q) => q.id))
  assert.equal(new Set(ids).size, ids.length, 'duplicate question id')
})

test('every question has one right answer and named misconceptions', () => {
  for (const l of LESSONS) {
    for (const q of questionsOf(l)) {
      assert.ok(q.options.length >= 2 && q.options.length <= 4, `${q.id}: 2–4 options`)
      assert.equal(q.options.filter((o) => o.correct).length, 1, `${q.id}: exactly one correct option`)
      for (const o of q.options) {
        assert.ok(o.why.trim(), `${q.id}: every option explains itself`)
        if (!o.correct) {
          assert.ok(o.misconception, `${q.id}: wrong option "${o.text}" names a misconception`)
          assert.ok(o.misconception in MISCONCEPTIONS, `${q.id}: unknown misconception ${o.misconception}`)
        }
      }
      if (q.fillIn) assert.ok(q.code?.includes('???'), `${q.id}: fill-in code has ???`)
    }
  }
})

test('the saved Lean results cover every example, with the right verdicts (run make snapshot)', () => {
  const saved = snapshot as Record<string, Pick<RunResult, 'messages'>>
  for (const j of jobs) {
    if (j.expect === 'skip') continue
    const r = saved[j.code]
    assert.ok(r, `${j.where}: no saved result. Run \`make snapshot\` after changing lessons.`)
    assert.equal(verdict(r), j.expect, `${j.where}: the saved result says "${verdict(r)}"`)
  }
})

// with Lean installed: every example, run for real
const days = [...new Set(jobs.map((j) => j.day))]
for (const day of days) {
  if (only != null && day !== only) continue
  const mine = jobs.filter((j) => j.day === day && j.expect !== 'skip')
  const needsMathlib = mine.some((j) => j.mathlib)
  test(day == null ? 'misconception examples' : `day ${day}: ${LESSONS[day - 1].title}`, {
    skip: !LEAN ? 'Lean is not installed (make setup)' : needsMathlib && !MATHLIB ? 'Mathlib is not installed (make mathlib)' : false,
  }, async () => {
    await Promise.all(mine.map(async (j) => {
      const r = await runLean(j.code)
      assert.equal(verdict(r), j.expect, `${j.where}: expected Lean to say "${j.expect}"\n--- code ---\n${j.code}\n--- Lean ---\n${describe(r)}`)
    }))
  })
}
