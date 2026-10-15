import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 4: If … then: hypotheses" =>
%%%
tag := "day04"
file := "day04"
number := false
%%%

_Read hypotheses as “if”, and know they are assumptions, not facts._

A *hypothesis* is a condition the theorem assumes:

```lean -keep (name := day04_1)
theorem bigger (n : Nat) (h : n > 5) : n > 3 := by omega
```

`(h : n > 5)` reads “if n > 5”. The `h` is just a name for the assumption, so the proof can refer to it. The whole theorem says:

> For every natural number n, *if* n > 5, *then* n > 3.

```stepBreak
```

Lean writes “if … then” with an arrow, `→`. This is the same theorem with everything after the colon:

```lean -keep (name := day04_2)
theorem bigger' : ∀ n : Nat, n > 5 → n > 3 := by omega
```

Read `P → Q` as “if P, then Q” or “P implies Q”.

Several hypotheses chain together. `P → Q → R` means “if P, then if Q, then R”, which is the same as “if P *and* Q, then R”. The arrow groups to the *right*: `P → Q → R` is `P → (Q → R)`, not `(P → Q) → R`.

```stepBreak
```

The arrow only goes *one way*. This is true for every n:

```lean -keep (name := day04_3)
theorem two_even (n : Nat) (h : n = 2) : n % 2 = 0 := by omega
```

But the reverse, “if n is even then n = 2”, is false (think of 4). Mixing up a statement and its reverse (its _converse_) is one of the most common reading mistakes.

```stepBreak
```

Most important for auditing: *a hypothesis is an assumption, not a fact*. Nobody checked that it can be true. Look:

```lean -keep (name := day04_4)
theorem strange (n : Nat) (h1 : n > 5) (h2 : n < 3) : n = 100 := by omega
```

Lean accepts it. But no number is both above 5 and below 3, so this theorem applies to no number at all. It says nothing. Such a theorem is called *vacuous*, and it is exactly the trick to watch for in AI-written proofs.

# Check yourself
%%%
number := false
%%%

```question
d04-q1
```

```question
d04-q2
```

```question
d04-q3
```

```question
d04-q4
```

```question
d04-q5
```
