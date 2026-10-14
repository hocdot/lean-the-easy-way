// The audit flags what it should, and only that.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { runLean } from '../lean.ts'

async function titles(code: string) {
  const r = await runLean(code, true)
  return Object.fromEntries(r.audit!.decls.map((d) => [d.name, d.findings.map((f) => f.title)]))
}

test('flags each kind of problem', async () => {
  const t = await titles(`
theorem fine (a b : Nat) (h : a ≤ b) : a < b + 1 := by omega
theorem vacuous (n : Nat) (h1 : n > 5) (h2 : n < 3) : n * n = 7 := by omega
theorem circular (P : Prop) (hp : P) : P := hp
theorem unfinished (n : Nat) : n * n ≥ n := by sorry
axiom magic : (0 : Nat) = 1
theorem uses_magic : (2 : Nat) = 3 := by have := magic; omega
theorem decorated (n : Nat) (h : n > 100) : n + 0 = n := by simp
def f (n : Nat) : Nat := n * n
theorem carried (n : Nat) (key : ∀ m, f m ≥ m) : f n ≥ n := key n
`)
  assert.deepEqual(t.fine, ['No red flags found'])
  assert.deepEqual(t.vacuous, ['Hypotheses contradict each other'])
  assert.deepEqual(t.circular, ['Assumes its own conclusion'])
  assert.deepEqual(t.unfinished, ['Unfinished proof'])
  assert.deepEqual(t.magic, ['Assumed, not proved'])
  assert.deepEqual(t.uses_magic, ['Rests on a made-up assumption'])
  assert.deepEqual(t.decorated, ['Hypotheses are not needed'])
  assert.deepEqual(t.f, ['A definition'])
  assert.deepEqual(t.carried, ['One hypothesis carries the claim'])
})

test('reads statements in English', async () => {
  const r = await runLean('theorem t (n : Nat) (h : n > 5) (h2 : n < 9) : ∃ m : Nat, m < n ∧ m ≠ 0 := ⟨1, by omega, by decide⟩', true)
  assert.equal(r.audit!.decls[0].english, 'for every n : Nat, if `n > 5` and `n < 9`, then there is some m : Nat such that `m < n` and `m ≠ 0`')
})

test('reports goals step by step', async () => {
  const r = await runLean('theorem t (p q : Prop) (hp : p) (hq : q) : p ∧ q := by\n  constructor\n  · exact hp\n  · exact hq\n')
  assert.deepEqual(r.steps.filter((s) => !s.start).map((s) => s.tactic), ['constructor', 'exact hp', 'exact hq'])
  assert.equal(r.steps[0].goalsBefore[0], 'p q : Prop\nhp : p\nhq : q\n⊢ p ∧ q')
  assert.deepEqual(r.steps.at(-1)!.goalsAfter, [])
})
