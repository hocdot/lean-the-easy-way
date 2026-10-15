import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 25: Definitions that lie" =>
%%%
tag := "day25"
file := "day25"
number := false
%%%

_Read the body of a definition instead of trusting its name, and notice junk values._

Lean does not read names, and that includes the names of definitions. A `def` means exactly what its body says.

```lean -keep (name := day25_1)
def IsPrime (n : Nat) : Prop := ∀ d, d ∣ n → d = 1 ∨ d = n

theorem one_is_prime : IsPrime 1 := by
  intro d hd
  left
  exact Nat.dvd_one.mp hd
```

The body says “every divisor of n is 1 or n”. That looks like the textbook definition, but it forgot “n ≥ 2”. So 1 counts as prime. Any theorem about this `IsPrime` is a correct proof about a slightly wrong idea.

```stepBreak
```

A check that looks at too little:

```lean -keep (name := day25_2)
/-- Is the list sorted? -/
def isSorted : List Nat → Bool
  | a :: b :: _ => a ≤ b
  | _ => true

#eval isSorted [1, 5, 2]
```
```leanOutput day25_2
true
```

`a :: b :: _` means “a list that starts with a, then b, then anything”. So `isSorted` only compares the *first two* elements. `[1, 5, 2]` counts as sorted. A theorem “my sorting function always returns a list with `isSorted`” would prove almost nothing.

The comment says “is the list sorted?”. Comments, like names, are not checked.

```stepBreak
```

Worst of all, a definition that is *always true*:

```lean -keep (name := day25_3)
/-- f repeats itself with period p. -/
def IsPeriodic (f : Nat → Nat) : Prop := ∃ p, ∀ n, f (n + p) = f n

theorem every_function_is_periodic (f : Nat → Nat) : IsPeriodic f :=
  ⟨0, fun _ => rfl⟩
```

The definition forgot “p > 0”. With p = 0 it says f(n) = f(n), which is true of every function. Then every theorem of the form “… is periodic” is trivially true. The proof is one line, which (as always) is a hint.

```stepBreak
```

*Junk values* can play the same trick. In Lean, every function gives _some_ answer on every input: `x / 0 = 0` on numbers, and in Mathlib also `Real.sqrt (-4) = 0` and `Real.log 0 = 0`. A statement can be true only because of such a value:

```lean -keep (name := day25_4)
/-- Found a solution of 6 / x = 0. -/
theorem solution_found : ∃ x : Nat, 6 / x = 0 := ⟨0, rfl⟩
```

On paper, 6 / x = 0 has no solution. In Lean, x = 0 works, by the junk value 6 / 0 = 0. When a statement involves division, square roots or logarithms, ask: *is it true only at the junk inputs?*

```stepBreak
```

How to audit a definition:

1. Find every `def` a theorem mentions, and read its body, not its name or comment.
2. Test it on small cases with `#eval` or tiny theorems. Is 1 prime? Is `[3, 1, 2]` sorted? Is a function that never repeats “periodic”?
3. Look for missing conditions (n ≥ 2, p > 0) and for junk values.

The Lab’s Audit lists each definition as “A definition”, with a reminder: Lean checks that it is well-formed, *not that it means what its name says*. That part is yours.

# Check yourself
%%%
number := false
%%%

```question
d25-q1
```

```question
d25-q2
```

```question
d25-q3
```

```question
d25-q4
```

```question
d25-q5
```

```question
d25-q6
```
