import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 20: Junk values and Mathlib-style statements" =>
%%%
tag := "day20"
file := "day20"
number := false
%%%

_Spot statements that depend on junk values, and read `∀ ε > 0`, `∃ δ > 0`, `∑`, `Nat.Prime` and `∈`._

In Lean, *every function gives a value on every input*. When an input makes no sense, the function returns a conventional value, often 0. These are called *junk values*. You know some already:

```lean -keep (name := day20_1)
#eval 5 / 0
#eval 7 % 0
#eval (-5 : Int).toNat
```
```leanOutput day20_1
0
```
```leanOutput day20_1
7
```
```leanOutput day20_1
0
```

(`Int.toNat` turns an integer into a natural number; negatives become 0.)

Mathlib does the same for real numbers. These are true in Mathlib:

```
-- needs Mathlib
example : (1 : ℝ) / 0 = 0 := div_zero 1
-- also true in Mathlib: Real.sqrt (-4) = 0 and Real.log 0 = 0
```

```stepBreak
```

Junk values matter because they change which statements are true. On paper, x / x = 1. In Lean it is false at x = 0, since 0 / 0 = 0. So the correct statement needs a hypothesis:

```lean -keep (name := day20_2)
example (x : Nat) (h : x > 0) : x / x = 1 := Nat.div_self h
```

In Mathlib, `√x * √x = x` is false for x = -4 (the left side is 0), so Mathlib’s version assumes `0 ≤ x`.

It cuts both ways. A statement with a missing side condition can be *false* for a junk reason, and a statement can also be *true only because of* junk. `(1 : ℝ) / 0 = 0` is a theorem in Mathlib, but it is not a fact about dividing by zero.

> When a statement divides, takes a root or a logarithm, ask: what happens at the bad inputs?

```stepBreak
```

Mathlib statements use a shorthand for quantifiers with a condition:

* `∀ ε > 0, P ε` means `∀ ε, ε > 0 → P ε` (with *→*)
* `∃ δ > 0, Q δ` means `∃ δ, δ > 0 ∧ Q δ` (with *∧*)

This is the same rule as in Week 1: “every” goes with →, “some” goes with ∧. Lean shows the long form in goal displays:

```lean -keep (name := day20_3)
example : (∀ n > 2, n ≠ 0) ↔ (∀ n : Nat, n > 2 → n ≠ 0) := Iff.rfl
example : (∃ n > 2, n < 4) ↔ (∃ n : Nat, n > 2 ∧ n < 4) := Iff.rfl
```

(`Iff.rfl` proves `P ↔ P`: Lean sees both sides are the same statement.)

```stepBreak
```

A few more pieces of Mathlib vocabulary:

```
-- needs Mathlib
Nat.Prime p                    -- p is a prime number
x ∈ S                          -- x is an element of S
Finset.range n                 -- the numbers 0, 1, …, n - 1 (n itself is left out)
∑ i ∈ Finset.range n, i        -- 0 + 1 + … + (n - 1)
|x|                            -- the absolute value of x
```

`∈` also works in core Lean for lists:

```lean -keep (name := day20_4)
example : 2 ∈ [1, 2, 3] := by decide
example : ∀ x ∈ [1, 2, 3], x > 0 := by decide
```

> Audit the edges: `Finset.range n` stops at n - 1, so an off-by-one there changes the statement.

```stepBreak
```

Put it together. Here is a typical analysis statement:

```
-- needs Mathlib
theorem t : ∀ ε > 0, ∃ δ > 0, ∀ x : ℝ, |x| < δ → |2 * x| < ε
```

> For every ε > 0, there is a δ > 0 such that for every real x, if |x| < δ then |2x| < ε.

The type matters here too. Over ℕ, even the simple `∀ ε > 0, ∃ δ > 0, δ < ε` is *false*: for ε = 1, no natural number lies strictly between 0 and 1. Over ℝ, take δ = ε / 2. The same symbols, a different truth.

# Check yourself
%%%
number := false
%%%

```question
d20-q1
```

```question
d20-q2
```

```question
d20-q3
```

```question
d20-q4
```

```question
d20-q5
```

```question
d20-q6
```
