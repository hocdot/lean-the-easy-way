import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 13: Rewriting and automation" =>
%%%
tag := "day13"
file := "day13"
number := false
%%%

_Follow `rw` in both directions, and judge what `simp`, `omega` and `decide` really show._

With an equation `h : x = y + 1`, `rw [h]` *rewrites* the goal: every `x` becomes `y + 1`.

```lean -keep (name := day13_1)
theorem double (x y : Nat) (h : x = y + 1) : x * 2 = y * 2 + 2 := by
  rw [h]
  omega
```

```
x y : Nat
h : x = y + 1
⊢ x * 2 = y * 2 + 2
```

becomes

```
x y : Nat
h : x = y + 1
⊢ (y + 1) * 2 = y * 2 + 2
```

`rw` replaces the *left* side of the equation by the *right* side. After rewriting, it also tries `rfl`, so it sometimes finishes the goal by itself.

```stepBreak
```

To go the other way, right side to left side, write `rw [← h]`:

```lean -keep (name := day13_2)
theorem move (a b : Nat) (h : a = b) (ha : a > 3) : b > 3 := by
  rw [← h]
  exact ha
```

With `h : a = b`, `rw [← h]` turns every `b` into `a`: the goal goes from `⊢ b > 3` to `⊢ a > 3`, which is `ha`. Plain `rw [h]` would look for `a` in the goal, find none, and fail.

```stepBreak
```

Some tactics do a lot of work at once. This is called *automation*:

* `decide`: computes the answer for specific numbers.
* `omega`: solves arithmetic with `+`, `-`, constants and comparisons, using the hypotheses.
* `simp`: simplifies the goal using many known facts. It may finish, or leave a simpler goal:

```lean -keep (name := day13_3)
theorem simpler (P : Prop) (hp : P) : P ∧ True := by
  simp
  exact hp
```

After `simp` the goal `P ∧ True` has become `P`.

Lean still checks everything automation does. Automation does not lower the standard of proof.

```stepBreak
```

Here is the auditor’s point. When automation succeeds, it tells you the goal was *easy*, not that the theorem is important. Look:

```lean -keep (name := day13_4)
theorem looks_deep (n : Nat) (h1 : n > 10) (h2 : n < 5) : n * n = n + 1000 := by
  omega
```

`omega` succeeds because no number is above 10 and below 5. The hypotheses contradict each other, so any conclusion follows. The statement is vacuous.

> A one-line automated proof of a big-sounding claim is a reason to look closer at the hypotheses.

# Check yourself
%%%
number := false
%%%

```question
d13-q1
```

```question
d13-q2
```

```question
d13-q3
```

```question
d13-q4
```

```question
d13-q5
```

```question
d13-q6
```
