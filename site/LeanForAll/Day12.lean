import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 12: Using other theorems" =>
%%%
tag := "day12"
file := "day12"
number := false
%%%

_Follow proofs that use library theorems with `exact` and `apply`, and that record facts with `have`._

Lean comes with a library of proved theorems. You can use one like a tool. `Nat.le_of_lt` says:

```lean -keep (name := day12_1)
#check Nat.le_of_lt
```
```leanOutput day12_1
Nat.le_of_lt {n m : Nat} : n < m → n ≤ m
```

Lean answers `Nat.le_of_lt {n m : Nat} : n < m → n ≤ m`: if n < m, then n ≤ m. Given a proof `h : a < b`, writing `Nat.le_of_lt h` gives a proof of `a ≤ b`:

```lean -keep (name := day12_2)
theorem weaken (a b : Nat) (h : a < b) : a ≤ b := by
  exact Nat.le_of_lt h
```

A hypothesis `hpq : P → Q` works the same way: `hpq hp` is a proof of Q.

```stepBreak
```

`apply` uses a theorem *backwards*. The goal is `a ≤ b`, and `Nat.le_of_lt` ends in `≤`, so:

```lean -keep (name := day12_3)
theorem weaken' (a b : Nat) (h : a < b) : a ≤ b := by
  apply Nat.le_of_lt
  exact h
```

```
a b : Nat
h : a < b
⊢ a ≤ b
```

becomes

```
a b : Nat
h : a < b
⊢ a < b
```

Read `apply` as: “to prove a ≤ b, it is enough to prove a < b”. The goal becomes the theorem’s if-part.

```stepBreak
```

Some theorems need two facts. `Nat.lt_trans` says `n < m → m < k → n < k`: if n < m and m < k, then n < k. The facts go in that order:

```lean -keep (name := day12_4)
theorem chain (x y z : Nat) (h1 : x < y) (h2 : y < z) : x < z := by
  exact Nat.lt_trans h1 h2
```

`h1` fills the first if-part (`x < y`), `h2` the second (`y < z`).

```stepBreak
```

`have` records an intermediate fact, with its proof, so later steps can use it:

```lean -keep (name := day12_5)
theorem two_steps (a b c : Nat) (h1 : a < b) (h2 : b < c) : a ≤ c := by
  have h3 : a < c := Nat.lt_trans h1 h2
  exact Nat.le_of_lt h3
```

After the `have` line, the display gains `h3 : a < c` above the `⊢`, and the goal `a ≤ c` is unchanged.

> For an auditor: unlike a hypothesis, a `have` comes with its own proof, which Lean checks. A proof read as a story is often a chain of `have` lines: each is a step of the argument.

# Check yourself
%%%
number := false
%%%

```question
d12-q1
```

```question
d12-q2
```

```question
d12-q3
```

```question
d12-q4
```

```question
d12-q5
```

```question
d12-q6
```
