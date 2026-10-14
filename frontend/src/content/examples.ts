// Starting points for the Lab. Each shows something the audit should (or should not) flag.

export const EXAMPLES: { name: string; code: string }[] = [
  {
    name: 'Audit practice (start here)',
    code: `-- Audit practice. Lean accepts all three theorems below.
-- Press Audit, then go through the checklist under each one.
-- One is honest. One is caught by the automatic checks.
-- One only a careful reader can catch.

-- Claim: if a is at most 3 and b at most 4, then a + b is at most 7.
theorem sum_small (a b : Nat) (ha : a ≤ 3) (hb : b ≤ 4) : a + b ≤ 7 := by
  omega

-- Claim: a big result about squares.
theorem big_square (n : Nat) (h1 : n > 10) (h2 : n < 5) : n * n = 2 := by
  omega

-- Claim: every number above 1 splits: it has a divisor other than 1 and itself.
def HasSmallDivisor (n : Nat) : Prop := ∃ d, d ∣ n ∧ d < n

theorem every_number_splits (n : Nat) (h : n > 1) : HasSmallDivisor n :=
  ⟨1, Nat.one_dvd n, h⟩
`,
  },
  {
    name: 'A first proof',
    code: `-- Click on a line of the proof to see the goal at that point.
theorem and_swap (P Q : Prop) (hp : P) (hq : Q) : Q ∧ P := by
  constructor
  · exact hq
  · exact hp
`,
  },
  {
    name: 'Contradictory hypotheses',
    code: `-- Press Audit. This "proves" something false about n,
-- but only for numbers that do not exist.
theorem amazing (n : Nat) (h1 : n > 5) (h2 : n < 3) : n * n = 7 := by
  omega
`,
  },
  {
    name: 'Assumes its conclusion',
    code: `-- The hypothesis hard is exactly the claim: P → P.
theorem hard_problem_solved (P : Prop) (easy : True) (hard : P) : P := by
  exact hard
`,
  },
  {
    name: 'A hypothesis that does the work',
    code: `-- No contradiction and nothing circular, yet the hypothesis \`key\`
-- is the whole claim for every m, so the "proof" just uses it.
def f (n : Nat) : Nat := n * n

theorem f_grows (n : Nat) (key : ∀ m, f m ≥ m) : f n ≥ n := by
  exact key n
`,
  },
  {
    name: 'Unfinished (sorry)',
    code: `theorem big_claim (n : Nat) : n * n ≥ n := by
  sorry
`,
  },
  {
    name: 'Made-up axiom',
    code: `axiom shortcut : ∀ n : Nat, n + 1 = n

theorem zero_eq_one : (0 : Nat) = 1 := by
  have h := shortcut 0
  omega
`,
  },
  {
    name: 'A definition that lies',
    code: `-- IsPrime forgets "n ≥ 2", so 1 counts as prime.
def IsPrime (n : Nat) : Prop := ∀ d, d ∣ n → d = 1 ∨ d = n

theorem one_is_prime : IsPrime 1 := by
  intro d hd
  left
  exact Nat.dvd_one.mp hd
`,
  },
  {
    name: 'An honest theorem',
    code: `theorem le_of_add (a b : Nat) : a ≤ a + b := by
  omega

theorem sum_formula (n : Nat) : 2 * (n * (n + 1) / 2) = n * (n + 1) := by
  induction n with
  | zero => rfl
  | succ k ih =>
    have : (k + 1) * (k + 1 + 1) = k * (k + 1) + 2 * (k + 1) := by
      simp [Nat.add_mul, Nat.mul_add, Nat.mul_comm]
      omega
    rw [this]
    omega
`,
  },
]
