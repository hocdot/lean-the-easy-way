import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 21: Week 3 review: what was really proved?" =>
%%%
tag := "day21"
file := "day21"
number := false
%%%

_Read a definition together with a theorem about it, and say exactly what was proved._

This week was about what makes a statement mean something different from what it looks like:

* `def`: a name for a body. Lean does not read the name; read the body.
* Cases and recursion: compute small cases by hand to see what a definition does.
* Structures and namespaces: `p.x`, `n.succ`, `h.1`; a structure can hide hypotheses, and `open` can hide where a name comes from.
* Hidden arguments: `{ }`, `[ ]`, and undeclared names (autoImplicit) are all “for every”. `@` shows everything.
* Number types: `Nat`, `Int`, ℝ. `↑` is a conversion, and where it happens matters.
* Junk values: `x / 0 = 0`, `√(-4) = 0`. Shorthand: `∀ ε > 0` uses →, `∃ δ > 0` uses ∧.

```stepBreak
```

Try it on this one before you read the verdict:

```lean -keep (name := day21_1)
def avg (a b : Nat) : Nat := (a + b) / 2

theorem avg_between (h : a ≤ b) : a ≤ avg a b ∧ avg a b ≤ b := by
  unfold avg
  omega
```

* `avg` is a `Nat` average: it *rounds down*, so `avg 3 4 = 3`.
* `a` and `b` are never declared: autoImplicit makes them hidden “for every” variables, of type `Nat` because `avg` needs them.
* `h : a ≤ b` is a real hypothesis.

> For all natural numbers a ≤ b, the rounded-down average of a and b lies between a and b.

That is a true and honest statement, but about rounded-down averages of natural numbers, not averages of real numbers.

# Check yourself
%%%
number := false
%%%

```question
d21-q1
```

```question
d21-q2
```

```question
d21-q3
```

```question
d21-q4
```

```question
d21-q5
```

```question
d21-q6
```
