import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 15: Definitions" =>
%%%
tag := "day15"
file := "day15"
number := false
%%%

_Read a `def`, see what a statement using it really says, and know that a theorem is only as good as its definitions._

So far, statements used only things Lean already knows: numbers, `+`, `<`. Real mathematics names new things. In Lean you do that with `def`:

```lean -keep (name := day15_1)
def double (n : Nat) : Nat := 2 * n

#eval double 5
```
```leanOutput day15_1
10
```

Read it piece by piece:

* `double` is the *name* of the new function.
* `(n : Nat)` is its *input*, a natural number called n.
* `: Nat` after the input says the *result* is a natural number too.
* `2 * n`, after `:=`, is the *body*: how the result is computed.

A `def` claims nothing and proves nothing. It only gives a name to something, so that later statements can use the name.

```stepBreak
```

A definition can also produce a *statement*. Its result type is then `Prop`, Lean’s word for “a statement, something that is true or false”:

```lean -keep (name := day15_2)
def IsEven (n : Nat) : Prop := ∃ k, n = 2 * k

example : IsEven 10 := ⟨5, rfl⟩
```

`IsEven 10` is not a number to compute. It is the statement `∃ k, 10 = 2 * k`: “10 is twice some number”. The proof gives the witness 5, and `rfl` checks `10 = 2 * 5`.

(`example` is a theorem without a name. It is handy for showing one fact.)

```stepBreak
```

Inside a proof, a defined name stays folded up until you open it. The tactic `unfold` replaces the name by its body:

```lean -keep (name := day15_3)
def IsEven (n : Nat) : Prop := ∃ k, n = 2 * k

example : IsEven 6 := by
  unfold IsEven
  exact ⟨3, rfl⟩
```

```
⊢ IsEven 6           (before unfold)
⊢ ∃ k, 6 = 2 * k     (after unfold)
```

Two other ways do the same job: `show ∃ k, 6 = 2 * k` restates the goal in its unfolded form, and `simp [IsEven]` unfolds while simplifying.

Automation such as `omega` does *not* look inside your definitions. On the goal `double n = n + n` it fails, because it sees `double n` as an unknown number. After `unfold double`, the goal is `2 * n = n + n` and `omega` succeeds.

```stepBreak
```

Now the auditor’s point. *Lean does not read names*, of theorems or of definitions. A definition means exactly what its body says. Look:

```lean -keep (name := day15_4)
def IsSquare (n : Nat) : Prop := ∃ k, n = k * 2

theorem six_is_square : IsSquare 6 := ⟨3, rfl⟩
```

Lean accepts it, and the proof is correct. But the body says `k * 2`, not `k * k`: this `IsSquare` means “even”. The theorem proves that 6 is even, and says nothing about squares.

> A theorem about a definition is only as good as the definition. When a statement uses a name you do not know, find its `def` and read the body before you believe anything.

# Check yourself
%%%
number := false
%%%

```question
d15-q1
```

```question
d15-q2
```

```question
d15-q3
```

```question
d15-q4
```

```question
d15-q5
```

```question
d15-q6
```
