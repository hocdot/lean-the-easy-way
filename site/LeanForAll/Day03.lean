import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 3: Variables mean “for every”" =>
%%%
tag := "day03"
file := "day03"
number := false
%%%

_Read a theorem with variables as a claim about every value._

A theorem can talk about *every* number at once:

```lean -keep (name := day03_1)
theorem add_zero_example (n : Nat) : n + 0 = n := rfl
```

The `(n : Nat)` before the colon introduces a variable `n` that is a natural number. Read the whole thing as:

> For every natural number n, n + 0 = n.

The variable is part of the statement, even though it sits before the colon.

```stepBreak
```

Lean has a symbol for “for every”: `∀`. This states exactly the same thing, with the variable after the colon:

```lean -keep (name := day03_2)
theorem add_zero_again : ∀ n : Nat, n + 0 = n := fun n => rfl
```

Both versions mean the same. Writers put variables before the colon because it is shorter. You will see both styles.

Several variables can share one pair of brackets, `(a b : Nat)`, meaning “for all natural numbers a and b”.

```stepBreak
```

Because the claim is about every value, you can *use* a theorem on any particular value. Here a library theorem, `Nat.add_comm`, states that `a + b = b + a` for all a and b, and we use it as the proof for 3 and 4:

```lean -keep (name := day03_3)
theorem swap_example : 3 + 4 = 4 + 3 := Nat.add_comm 3 4
```

So a proof can be the name of another theorem applied to some values. You do not need to understand a proof to understand a statement, and for auditing, the statement matters most.

```stepBreak
```

You will also meet *curly braces*:

```lean -keep (name := day03_4)
theorem pos_ne_zero {n : Nat} (h : n > 0) : n ≠ 0 := by omega
```

`{n : Nat}` still means “for every natural number n”. The braces only tell Lean to figure out `n` by itself whenever the theorem is used. For reading, treat `{ }` exactly like `( )`.

(The `(h : n > 0)` part is a _hypothesis_: “if n > 0”. That is tomorrow’s lesson.)

# Check yourself
%%%
number := false
%%%

```question
d03-q1
```

```question
d03-q2
```

```question
d03-q3
```

```question
d03-q4
```

```question
d03-q5
```
