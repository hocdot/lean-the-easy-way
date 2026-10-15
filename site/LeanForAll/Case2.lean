import VersoManual
import LeanForAll.Meta.Question
import Mathlib.Data.Nat.Prime.Infinite
import Mathlib.Data.Nat.PrimeFin

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Case 2: Euclid: infinitely many primes" =>
%%%
tag := "case2"
file := "case2"
number := false
%%%

_Audit how a claim about infinity is stated, check a definition against its famous bugs, and read a classic proof._

# The claim
%%%
number := false
%%%

*There are infinitely many prime numbers.* Euclid proved it around 300 BC. It is one of the oldest theorems in mathematics, and Mathlib has it as `Nat.exists_infinite_primes`:

```lean -keep (name := case2_1)
#check @Nat.exists_infinite_primes
```
```leanOutput case2_1
Nat.exists_infinite_primes : ∀ (n : ℕ), ∃ p, n ≤ p ∧ Nat.Prime p
```

Notice: the claim says “infinitely many”, but the statement does not contain the word “infinite”. That is the first thing to check.

```question
a2-q1
```

# Step 1: does the statement say the claim?
%%%
number := false
%%%

Statements that look close can be much weaker. Both of these are accepted by Lean, each with a one-line proof:

```lean -keep (name := case2_2)
theorem only_one_prime : ∃ p, Nat.Prime p := ⟨2, Nat.prime_two⟩

theorem prime_below (n : ℕ) : ∃ p, p ≤ n + 2 ∧ Nat.Prime p := ⟨2, by omega, Nat.prime_two⟩
```

The first only says a prime exists. The second has the inequality the wrong way round, so the prime 2 works for every n. Neither says anything about infinity.

```question
a2-q2
```

A second formalization is reassuring when two of them agree. Mathlib also states the claim literally, with the set of primes:

```lean -keep (name := case2_3)
#check @Nat.infinite_setOfPred_prime
```
```leanOutput case2_3
Nat.infinite_setOfPred_prime : {p | Nat.Prime p}.Infinite
```

“The set of primes is infinite.” Two different statements of the same claim, both proved in Mathlib.

```stepBreak
```

# Step 2: the definitions (checklist step 5)
%%%
number := false
%%%

On Day 25 you saw an `IsPrime` that forgot “n ≥ 2” and so counted 1 as prime. Does Mathlib’s `Nat.Prime` have that bug?

```lean -keep (name := case2_4)
#print Nat.Prime
#check @Nat.prime_def
example : Nat.Prime 7 := by decide
example : ¬ Nat.Prime 1 := Nat.not_prime_one
example : ¬ Nat.Prime 0 := Nat.not_prime_zero
```
```leanOutput case2_4
def Nat.Prime : ℕ → Prop :=
fun p => Irreducible p
```
```leanOutput case2_4
@Nat.prime_def : ∀ {p : ℕ}, Nat.Prime p ↔ 2 ≤ p ∧ ∀ (m : ℕ), m ∣ p → m = 1 ∨ m = p
```

`#print` shows `Nat.Prime p` is defined as `Irreducible p`, a general notion from algebra that is hard to read. But Mathlib proves `Nat.prime_def`, which restates it in school terms:

> `Nat.Prime p ↔ 2 ≤ p ∧ ∀ (m : ℕ), m ∣ p → m = 1 ∨ m = p`

And small cases behave: 7 is prime, 0 and 1 are not.

```question
a2-q3
```

# Steps 3 and 4: hypotheses, and step 1: axioms
%%%
number := false
%%%

The statement has no hypotheses, only the variable n (“for every n”). Nothing to be vacuous, nothing circular.

```lean -keep (name := case2_5)
#print axioms Nat.exists_infinite_primes
```
```leanOutput case2_5
'Nat.exists_infinite_primes' depends on axioms: [propext, Classical.choice, Quot.sound]
```

```question
a2-q4
```

# Step 5: read the proof
%%%
number := false
%%%

Euclid’s argument fits in a few lines. This is Mathlib’s proof, copied under a new name so it runs here:

```lean -keep (name := case2_6)
open Nat in
theorem euclid (n : ℕ) : ∃ p, n ≤ p ∧ Nat.Prime p :=
  let p := minFac (n ! + 1)
  have f1 : n ! + 1 ≠ 1 := ne_of_gt <| succ_lt_succ <| factorial_pos _
  have pp : Nat.Prime p := minFac_prime f1
  have np : n ≤ p :=
    le_of_not_ge fun h =>
      have h₁ : p ∣ n ! := dvd_factorial (minFac_pos _) h
      have h₂ : p ∣ 1 := (Nat.dvd_add_iff_right h₁).2 (minFac_dvd _)
      pp.not_dvd_one h₂
  ⟨p, np, pp⟩
```

Read it as a story:

* Take the number n! + 1 (n factorial plus one: 1 · 2 · … · n + 1).
* Let p be its *smallest prime factor* (`minFac`). It is prime (`pp`).
* Why is p ≥ n (`np`)? Suppose p ≤ n. Then p is one of the factors of n!, so p divides n! (`h₁`). It also divides n! + 1, so it divides their difference, 1 (`h₂`). But no prime divides 1.

```question
a2-q5
```

Try it on n = 4 with `#eval`:

```lean -keep (name := case2_7)
#eval Nat.factorial 4 + 1
#eval Nat.minFac (Nat.factorial 4 + 1)
```
```leanOutput case2_7
25
```
```leanOutput case2_7
5
```

4! + 1 = 25, which is not prime, and its smallest prime factor is 5 ≥ 4. The proof finds the prime 5, not 25.

```question
a2-q6
```
