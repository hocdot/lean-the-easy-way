import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 5: And, or, not, if and only if" =>
%%%
tag := "day05"
file := "day05"
number := false
%%%

_Read `∧`, `∨`, `¬`, `≠` and `↔`, and know how they group._

Four more symbols, and you can read most statements:

* `P ∧ Q`: P *and* Q (both hold).
* `P ∨ Q`: P *or* Q (at least one holds, maybe both).
* `¬ P`: *not* P. And `a ≠ b` is short for `¬ (a = b)`.
* `P ↔ Q`: P *if and only if* Q (each implies the other).

```lean -keep (name := day05_1)
theorem facts : 2 < 3 ∧ 3 < 4 := by decide
theorem either : 2 = 3 ∨ 2 = 2 := by decide
theorem nope : ¬ (2 = 3) := by decide
```

(`by decide` asks Lean to settle a statement about specific numbers by computing.)

```stepBreak
```

Like `×` before `+` in arithmetic, these symbols have an order. From tightest to loosest:

1. `¬` (applies to the smallest piece after it)
2. `=`, `<`, `≤`, `≠` (comparisons)
3. `∧`
4. `∨`
5. `→`
6. `↔`

So `¬ P ∧ Q` means `(¬ P) ∧ Q`, not `¬ (P ∧ Q)`. And `P ∧ Q → R` means `(P ∧ Q) → R`. When in doubt, look for brackets.

```stepBreak
```

`↔` is two arrows in one: `P ↔ Q` means `P → Q` and `Q → P`.

```lean -keep (name := day05_2)
theorem even_iff (n : Nat) : n % 2 = 0 ↔ (n + 2) % 2 = 0 := by omega
```

A common slip is to treat a one-way `→` as if it were `↔`. When a claim says “exactly when” or “if and only if”, the Lean statement must use `↔`.

```stepBreak
```

Now you can read hypotheses that combine conditions:

```lean -keep (name := day05_3)
theorem small (n : Nat) (h : n > 2 ∧ n < 5) : n = 3 ∨ n = 4 := by omega
```

> For every n, if n > 2 and n < 5, then n = 3 or n = 4.

# Check yourself
%%%
number := false
%%%

```question
d05-q1
```

```question
d05-q2
```

```question
d05-q3
```

```question
d05-q4
```

```question
d05-q5
```
