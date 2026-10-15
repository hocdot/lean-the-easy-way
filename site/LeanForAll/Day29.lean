import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 29: Case study: the statement does not match the claim" =>
%%%
tag := "day29"
file := "day29"
number := false
%%%

_Compare formal statements of a competition problem with the problem, and find exactly how each one falls short._

Competition problems are a favorite benchmark for AI provers. A known risk: if the formal statement does not match the problem, a “solved” result means nothing. Collections of formalized problems have contained such mismatches, and claims of “hundreds of problems solved” have counted some of them.

Our problem:

> Find all integers x such that x · x = x + 6.

The answer is x = 3 and x = −2 (check: 9 = 3 + 6, and 4 = −2 + 6). “Find all” has two halves: these numbers *are* solutions, and there are *no others*.

```stepBreak
```

An AI submits this file, saying “solved, three theorems, no `sorry`”. All accepted, and the Audit finds no red flags.

```lean -keep (name := day29_1)
/-! Problem: find all integers x such that x * x = x + 6.
    (The answer: x = 3 and x = -2.) -/

/-- Solved: the equation has a solution. -/
theorem quadratic_solved : ∃ x : Int, x * x = x + 6 := ⟨3, by decide⟩

/-- Solved: 3 is the only solution. -/
theorem only_solution (x : Nat) (h : x * x = x + 6) : x = 3 := by
  have hx : x < 4 := by
    apply Nat.lt_of_not_le
    intro hx
    have := Nat.mul_le_mul_right x hx
    omega
  have : x = 0 ∨ x = 1 ∨ x = 2 ∨ x = 3 := by omega
  rcases this with rfl | rfl | rfl | rfl <;> simp_all

/-- Solved: the answers are 3 and -2. -/
theorem answers_work (x : Int) (h : x = 3 ∨ x = -2) : x * x = x + 6 := by
  rcases h with rfl | rfl <;> decide
```

Each theorem is correct. Now step 2: read each statement out loud, and compare it with “find all integers x with x · x = x + 6”.

```stepBreak
```

What each one really says:

1. `quadratic_solved`: “there is *some* integer with x · x = x + 6”. One example (3). It does not find all, and it does not even mention −2.
2. `only_solution`: “every *natural number* x with x · x = x + 6 is 3”. True, but on `Nat` the solution −2 does not exist. Over the integers, the statement would be false.
3. `answers_work`: “if x is 3 or −2, then x is a solution”. This checks the answer, but only *one direction*: it does not show there are no other solutions.

None of them is wrong. All of them are *weaker than the problem*.

```stepBreak
```

A statement that matches the problem says both halves at once, over the integers, with `↔`:

```lean -keep (name := day29_2)
theorem quadratic_all_solutions (x : Int) : x * x = x + 6 ↔ x = 3 ∨ x = -2 := by
  constructor
  · intro h
    have h1 : (x - 3) * (x + 2) = 0 := by
      rw [Int.sub_mul, Int.mul_add, Int.mul_add]
      omega
    rcases Int.mul_eq_zero.mp h1 with h2 | h2
    · left; omega
    · right; omega
  · rintro (rfl | rfl) <;> decide
```

> for every x : Int, x · x = x + 6 *if and only if* x = 3 or x = −2.

“If” is `answers_work`. “Only if” is the hard half: the proof rewrites the equation as (x − 3)(x + 2) = 0, and a product is zero only when a factor is.

When you audit a solution to a “find all” problem, look for exactly this shape: `∀ x : (the right type), (condition) ↔ (x is one of the answers)`.

# Check yourself
%%%
number := false
%%%

```question
d29-q1
```

```question
d29-q2
```

```question
d29-q3
```

```question
d29-q4
```

```question
d29-q5
```
