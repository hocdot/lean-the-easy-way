import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 24: Hypotheses that assume the answer" =>
%%%
tag := "day24"
file := "day24"
number := false
%%%

_Spot hypotheses that restate the conclusion or carry the hard part of the problem._

The bluntest trick: put the conclusion among the hypotheses.

```lean -keep (name := day24_1)
theorem square_even (n : Nat) (h : n * n % 2 = 0) : n * n % 2 = 0 := h
```

Read it: “if n · n is even, then n · n is even”. This has the shape *P → P*, which is true of every statement P. The proof is just `h`: “you told me so”.

The Lab’s Audit catches this exact form and reports “Assumes its own conclusion”.

```stepBreak
```

Usually the conclusion is not copied word for word, but *restated*. The claim was “n · n + n is always even”:

```lean -keep (name := day24_2)
theorem sum_even (n : Nat) (h : (n * n + n) % 2 = 0) : 2 ∣ n * n + n := by omega
```

(`2 ∣ m` means “2 divides m”.) The hypothesis says the remainder of n · n + n divided by 2 is 0. That _is_ “n · n + n is even”, in other words. The theorem is still P → P in disguise.

The Audit finds *no red flags* here: the two sides are not written the same way, so its exact-match check does not fire. You have to read it.

```stepBreak
```

The subtle version: a hypothesis that is not the conclusion but *does the hard part*. Goldbach’s conjecture says every even number above 2 is a sum of two primes. Nobody has proved it.

```lean -keep (name := day24_3)
def IsPrime (p : Nat) : Prop := p ≥ 2 ∧ ∀ d, d ∣ p → d = 1 ∨ d = p

theorem goldbach (n : Nat) (h2 : n > 2) (heven : n % 2 = 0)
    (key : ∀ m, m > 2 → m % 2 = 0 → ∃ p q, IsPrime p ∧ IsPrime q ∧ p + q = m) :
    ∃ p q, IsPrime p ∧ IsPrime q ∧ p + q = n :=
  key n h2 heven
```

`h2` and `heven` are the normal conditions of the claim. But `key` _is_ Goldbach’s conjecture, for every m. The theorem only says “if Goldbach holds, then Goldbach holds for n”.

The Audit has a check for this pattern: when the conclusion follows from one hypothesis in a single step (the proof only applies it), it reports “*One hypothesis carries the claim*”. Here it names `key`.

```stepBreak
```

This is the pattern to look for in AI-written “proofs” of famous problems. Take the Navier–Stokes equations (a famous open problem about how fluids flow): a Lean file that assumes, as a hypothesis, that the solution stays under control for all time has assumed exactly the hard part of the problem. The rest of such a proof can be real, but it only shows “if the hard part holds, the easy part follows”.

The Audit’s “One hypothesis carries the claim” check has two limits:

* It cannot tell whether a hypothesis is hard. That depends on what is known in mathematics. You must judge it.
* It only sees *one-step* uses. When a hypothesis carries the claim through several steps (inside an induction, say), nothing is flagged. Day 28 shows such a file.

```stepBreak
```

So for *each* hypothesis, ask two questions:

1. *Is it part of the claim?* “Every even n above 2 …” justifies `n > 2` and `n % 2 = 0`. Nothing in the claim justifies `key`.
2. *If it is extra, is it known to be true, and much easier than the conclusion?* A standard fact is fine. An unproved statement, or one as hard as the conclusion, is not.

> A hypothesis that is not in the claim must earn its place. If it is as hard as the conclusion, the theorem has moved the problem, not solved it.

# Check yourself
%%%
number := false
%%%

```question
d24-q1
```

```question
d24-q2
```

```question
d24-q3
```

```question
d24-q4
```

```question
d24-q5
```

```question
d24-q6
```
