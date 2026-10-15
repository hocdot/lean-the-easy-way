import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 9: intro and exact" =>
%%%
tag := "day09"
file := "day09"
number := false
%%%

_Follow `intro`, `exact` and `assumption`, and predict the goal after each._

How do you prove “if P, then Q”? Assume P, then show Q. The tactic `intro` does the assuming:

```lean -keep (name := day09_1)
theorem bigger' (n : Nat) : n > 5 → n > 3 := by
  intro h
  omega
```

Before `intro h`, and after it:

```
n : Nat
⊢ n > 5 → n > 3
```

```
n : Nat
h : n > 5
⊢ n > 3
```

The if-part moved above the line, with the name `h`. Nothing was proved yet: `intro` only changes the form of the goal.

```stepBreak
```

`intro` also works on `∀`. To prove “for every n, …”, take an arbitrary n and prove the claim for it:

```lean -keep (name := day09_2)
theorem add_zero_all : ∀ n : Nat, n + 0 = n := by
  intro n
  rfl
```

```
⊢ ∀ (n : Nat), n + 0 = n
```

becomes

```
n : Nat
⊢ n + 0 = n
```

You do not get to pick n. It stands for any natural number, so whatever follows must work for all of them.

```stepBreak
```

When a hypothesis says *exactly* the goal, `exact` finishes the proof:

```lean -keep (name := day09_3)
theorem pick (P Q : Prop) (hp : P) (hq : Q) : P := by
  exact hp
```

(`P Q : Prop` means P and Q are any statements at all.) `exact hq` would fail: `hq` says Q, but the goal is P.

`assumption` does the same job without a name: it looks through the hypotheses for one that is exactly the goal.

```lean -keep (name := day09_4)
theorem pick' (P Q : Prop) (hp : P) (hq : Q) : Q := by
  assumption
```

```stepBreak
```

`intro` can take several names at once. Follow this one by hovering over each line:

```lean -keep (name := day09_5)
theorem first (P Q : Prop) : P → Q → P := by
  intro hp hq
  exact hp
```

After `intro hp hq` you have `hp : P` and `hq : Q`, and the goal is `P`. Then `exact hp` closes it.

> For an auditor: `intro` and `exact` are bookkeeping. They never make anything true that was not already given. If a proof is mostly `intro` and `exact`, the real content is in the hypotheses, so read those carefully.

# Check yourself
%%%
number := false
%%%

```question
d09-q1
```

```question
d09-q2
```

```question
d09-q3
```

```question
d09-q4
```

```question
d09-q5
```

```question
d09-q6
```
