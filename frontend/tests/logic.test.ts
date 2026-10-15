// The practice generator: distractors really differ from the answer, feedback worlds really
// separate them, and the Lean it prints parses the way it is meant to (checked by Lean itself).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { leanReady, runLean } from '../scripts/lean.ts'
import {
  evaluate, generate, LEAN_PREAMBLE, mutants, PREDS, SEEDS, separatingWorld, toEnglish, toLean, toLeanBracketed,
  type Formula,
} from '../src/practice/logic.ts'

const all: { seed: Formula; ms: Formula[] }[] = SEEDS.map((s) => {
  const seed = s.make('Studies', 'Passes', 'Sleeps')
  return { seed, ms: mutants(seed, s.mutate('Studies', 'Passes', 'Sleeps')).map((m) => m.f) }
})

test('every seed has at least three distinct distractors', () => {
  for (const { seed, ms } of all) assert.ok(ms.length >= 3, `${toLean(seed)} has ${ms.length}`)
})

test('every distractor can be told apart from the answer by a small world', () => {
  for (const { seed, ms } of all) {
    for (const m of ms) {
      const w = separatingWorld(seed, m)
      assert.ok(w, `${toLean(m)} vs ${toLean(seed)}`)
      assert.notEqual(evaluate(seed, w), evaluate(m, w))
    }
  }
})

test('English readings are distinct for distinct statements', () => {
  for (const { seed, ms } of all) {
    const texts = [seed, ...ms].map(toEnglish)
    assert.equal(new Set(texts).size, texts.length, texts.join(' | '))
  }
})

test('generated questions are well-formed', () => {
  for (let i = 1; i <= 300; i++) {
    const q = generate(i)
    assert.equal(q.options.filter((o) => o.correct).length, 1, q.id)
    assert.ok(q.options.length >= 3, `${q.id} has ${q.options.length} options`)
    if (q.kind === 'pick-world') {
      for (const o of q.options) assert.equal(evaluate(q.seed, o.world!), o.correct, q.id)
    }
  }
})

test('printed Lean parses as intended (Lean checks it)', { skip: !leanReady() && 'Lean is not installed' }, async () => {
  const lines = all.flatMap(({ seed, ms }) =>
    [seed, ...ms].map((f) => `example : (${toLean(f)}) ↔ ${toLeanBracketed(f)} := Iff.rfl`),
  )
  // and with every property, so all four names are exercised
  for (const p of PREDS) lines.push(`example : (${toLean({ k: 'all', v: 's', f: { k: 'pred', p, v: 's' } })}) ↔ ∀ s : Student, ${p} s := Iff.rfl`)
  const r = await runLean(`${LEAN_PREAMBLE}\n\n${lines.join('\n')}\n`)
  const errors = r.messages.filter((m) => m.severity === 'error')
  assert.deepEqual(errors.map((e) => `${lines[e.line - 4] ?? e.line}: ${e.text}`), [])
})
