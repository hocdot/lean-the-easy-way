import VersoManual
import LeanForAll.Meta.Question
import Mathlib.NumberTheory.FLT.Four

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Case 3: Fermat’s Last Theorem and four fake proofs" =>
%%%
tag := "case3"
file := "case3"
number := false
%%%

_Read Mathlib’s statement of Fermat’s Last Theorem, then audit four AI-style “proofs” of it and find each trick._

# The claim
%%%
number := false
%%%

*Fermat’s Last Theorem*: for any whole number n ≥ 3, there are no positive whole numbers a, b, c with aⁿ + bⁿ = cⁿ.

Fermat wrote it in a margin around 1637. Andrew Wiles proved it in 1994, with Richard Taylor, using hundreds of pages of advanced mathematics. A full Lean proof is a large ongoing project.

So if an AI tells you “I proved Fermat’s Last Theorem in Lean, here is the file”, something is almost certainly off. Today you find out exactly what. First, the honest statement.

```stepBreak
```

# Step 1: Mathlib’s statement
%%%
number := false
%%%

Mathlib defines the statement in three layers:

```lean -keep (name := case3_1)
#print FermatLastTheorem
#print FermatLastTheoremFor
#print FermatLastTheoremWith
```
```leanOutput case3_1
def FermatLastTheorem : Prop :=
∀ n ≥ 3, FermatLastTheoremFor n
```
```leanOutput case3_1
def FermatLastTheoremFor : ℕ → Prop :=
fun n => FermatLastTheoremWith ℕ n
```
```leanOutput case3_1
def FermatLastTheoremWith.{u_1} : (R : Type u_1) → [Semiring R] → ℕ → Prop :=
fun R [Semiring R] n => ∀ (a b c : R), a ≠ 0 → b ≠ 0 → c ≠ 0 → a ^ n + b ^ n ≠ c ^ n
```

In short, leaving out the technical parts:

> `FermatLastTheorem := ∀ n ≥ 3, FermatLastTheoremFor n`

> `FermatLastTheoremFor n := FermatLastTheoremWith ℕ n`

> `FermatLastTheoremWith R n := ∀ (a b c : R), a ≠ 0 → b ≠ 0 → c ≠ 0 → a ^ n + b ^ n ≠ c ^ n`

Read from the bottom up: in the numbers R, nonzero a, b, c never satisfy aⁿ + bⁿ = cⁿ. Over ℕ that is the theorem for one n, and `FermatLastTheorem` says it for every n ≥ 3.

```question
a3-q1
```

```question
a3-q2
```

# A definition is not a proof
%%%
number := false
%%%

Lean accepted `def FermatLastTheorem : Prop := …`. That only means the statement is well-formed. A `def` of a `Prop` *writes the claim down*; it proves nothing.

What Mathlib does prove are special cases, each a real `theorem`:

```lean -keep (name := case3_2)
#check fermatLastTheoremFour
#print axioms fermatLastTheoremFour
#check @FermatLastTheorem.of_odd_primes
```
```leanOutput case3_2
fermatLastTheoremFour : FermatLastTheoremFor 4
```
```leanOutput case3_2
'fermatLastTheoremFour' depends on axioms: [propext, Classical.choice, Quot.sound]
```
```leanOutput case3_2
FermatLastTheorem.of_odd_primes : (∀ (p : ℕ), Nat.Prime p → Odd p → FermatLastTheoremFor p) → FermatLastTheorem
```

The proof for n = 4 is a few hundred lines (and there is one for n = 3). You did not read it, and you do not need to: you read its statement, its definitions, and its axioms.

The last one is honest and useful: _if_ Fermat holds for every odd prime exponent, then it holds for all n ≥ 3. Remember it.

```question
a3-q3
```

```question
a3-q4
```

# Fake proof 1
%%%
number := false
%%%

Now the AI’s files. Each one is accepted by Lean, and each is called `fermat_last_theorem`. Here is the first. Here it is. The Lab’s automatic *Audit* has this to say about it:

```lean -keep (name := case3_3)
/-- Fermat's Last Theorem, proved. -/
theorem fermat_last_theorem
    (hprimes : ∀ p : ℕ, Nat.Prime p → Odd p → FermatLastTheoremFor p) :
    FermatLastTheorem :=
  FermatLastTheorem.of_odd_primes hprimes
```

The audit reports *no red flags*. The proof is a real Mathlib theorem. And yet…

```question
a3-q5
```

# Fake proof 2
%%%
number := false
%%%

```lean -keep (name := case3_4)
/-- The key step: Fermat for odd prime exponents. -/
theorem flt_odd_prime (p : ℕ) (hp : Nat.Prime p) (hodd : Odd p) :
    FermatLastTheoremFor p := by
  sorry

/-- Fermat's Last Theorem, proved. -/
theorem fermat_last_theorem : FermatLastTheorem :=
  FermatLastTheorem.of_odd_primes flt_odd_prime

#print axioms fermat_last_theorem
```
```leanOutput case3_4
declaration uses `sorry`
```
```leanOutput case3_4
'fermat_last_theorem' depends on axioms: [propext, sorryAx, Classical.choice, Quot.sound]
```

Lean shows one yellow warning, on the helper lemma, not on `fermat_last_theorem` itself.

```question
a3-q6
```

# Fake proof 3
%%%
number := false
%%%

```lean -keep (name := case3_5)
/-- Fermat's Last Theorem: for every n ≥ 3, the equation aⁿ + bⁿ = cⁿ fails. -/
theorem fermat_last_theorem : ∀ n ≥ 3, ∃ a b c : ℕ, a ^ n + b ^ n ≠ c ^ n := by
  intro n hn
  exact ⟨1, 1, 1, by simp⟩
```

No `sorry`, standard axioms, and the audit finds no red flags (it only notes that `hn` is never used). Read the statement out loud.

```question
a3-q7
```

# Fake proof 4
%%%
number := false
%%%

```lean -keep (name := case3_6)
/-- Fermat's Last Theorem for every exponent n ≥ 3. -/
theorem fermat_last_theorem (n : ℕ) (h3 : 3 ≤ n) (hsmall : n * n < 9) :
    FermatLastTheoremFor n := by
  nlinarith
```

This one uses Mathlib’s own statement, `FermatLastTheoremFor n`, and a one-word proof.

```question
a3-q8
```

# The verdict, and what you just did
%%%
number := false
%%%

Four fakes, four different tricks, mapped to the checklist:

1. *A hypothesis that carries the claim*: step 4. The automatic checks saw nothing; only reading caught it.
2. *A hidden \`sorry\`*: step 1, caught by `#print axioms` and the audit.
3. *A weaker statement* (∃ instead of ∀): step 2. Only reading the statement out loud caught it.
4. *Impossible hypotheses*: step 3, caught by the audit.

Two of the four passed every automatic check. That is why the audit tool lists what it checked and what is *your turn*, and why this course taught you to read.

And the honest status, in this version of Mathlib: Fermat’s Last Theorem is *stated* (`FermatLastTheorem`), the cases *n = 3 and n = 4 are proved*, and it is *reduced to odd prime exponents*. The full proof is being formalized in a separate project.
