import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 10: Taking apart and building “and”" =>
%%%
tag := "day10"
file := "day10"
number := false
%%%

_Follow `constructor`, `h.1`/`h.2`, `obtain` and bullets on `∧` and `↔`._

To prove `P ∧ Q` you must prove P and prove Q. The tactic `constructor` splits the goal into those two:

```
P Q : Prop
hp : P
hq : Q
⊢ P ∧ Q
```

After `constructor` there are *two* goals, named `case left` and `case right`:

```
case left
P Q : Prop
hp : P
hq : Q
⊢ P
case right
P Q : Prop
hp : P
hq : Q
⊢ Q
```

Both must be closed before the proof is done.

```stepBreak
```

With several goals, a proof uses *bullets*, `·`, to work on one goal at a time:

```lean -keep (name := day10_1)
theorem both (P Q : Prop) (hp : P) (hq : Q) : P ∧ Q := by
  constructor
  · exact hp
  · exact hq
```

The first bullet handles `case left` (goal P), the second handles `case right` (goal Q). Each bullet must close its goal completely. Hover over the tactics to watch the goals disappear one by one.

```stepBreak
```

`↔` is two implications, so `constructor` also splits it, into `case mp` (left to right) and `case mpr` (right to left):

```lean -keep (name := day10_2)
theorem shift (n : Nat) : n + 1 > 5 ↔ n > 4 := by
  constructor
  · intro h
    omega
  · intro h
    omega
```

After `constructor`:

```
case mp
n : Nat
⊢ n + 1 > 5 → n > 4
case mpr
n : Nat
⊢ n > 4 → n + 1 > 5
```

```stepBreak
```

Now the other side: *using* a hypothesis `h : P ∧ Q`. It holds two facts. `h.1` is the first (P) and `h.2` the second (Q). Or `obtain` unpacks it into two named hypotheses:

```lean -keep (name := day10_3)
theorem swap (P Q : Prop) (h : P ∧ Q) : Q ∧ P := by
  obtain ⟨hp, hq⟩ := h
  constructor
  · exact hq
  · exact hp
```

After `obtain ⟨hp, hq⟩ := h`, the display shows `hp : P` and `hq : Q` in place of `h`.

> For an auditor: a hypothesis with `∧` is several assumptions at once. Unpack it and check each part.

# Check yourself
%%%
number := false
%%%

```question
d10-q1
```

```question
d10-q2
```

```question
d10-q3
```

```question
d10-q4
```

```question
d10-q5
```

```question
d10-q6
```
