// Generated number questions: well-formed, and every right answer confirmed by real Lean.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { leanReady, runLean } from '../../backend/lean.ts'
import { MISCONCEPTIONS } from '../src/content/misconceptions.ts'
import { generateNumber } from '../src/practice/numbers.ts'

const generated = Array.from({ length: 400 }, (_, i) => generateNumber(i + 1))

test('every number question has one right answer, distinct options, and named misconceptions', () => {
  for (const { q } of generated) {
    assert.equal(q.options.filter((o) => o.correct).length, 1, q.id)
    assert.ok(q.options.length >= 3, `${q.id}: ${q.options.length} options`)
    assert.equal(new Set(q.options.map((o) => o.text)).size, q.options.length, `${q.id}: duplicate options`)
    for (const o of q.options) if (!o.correct) assert.ok(o.misconception && o.misconception in MISCONCEPTIONS, q.id)
  }
})

test('every right answer is what Lean computes (Lean checks it)', { skip: !leanReady() && 'Lean is not installed' }, async () => {
  const checks = [...new Set(generated.map((g) => g.check))]
  const r = await runLean(checks.join('\n') + '\n')
  const errors = r.messages.filter((m) => m.severity === 'error')
  assert.deepEqual(errors.map((e) => `${checks[e.line - 1]}: ${e.text.split('\n')[0]}`), [])
  assert.ok(checks.length > 100, `only ${checks.length} distinct questions`)
})
