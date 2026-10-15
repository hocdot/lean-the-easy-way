import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 14: Week 2 review: a proof is a story" =>
%%%
tag := "day14"
file := "day14"
number := false
%%%

_Read a whole short proof as an argument in plain English, and pick each next step._

Here is this week in one table, matching the shape of the goal or hypothesis to the tactic:

* goal `P → Q` or `∀ x, …`: `intro`
* goal `P ∧ Q` or `P ↔ Q`: `constructor` (two goals)
* goal `P ∨ Q`: `left` or `right`
* goal `∃ x, …`: `refine ⟨witness, ?_⟩`, `exists`, `exact ⟨witness, proof⟩`
* goal exactly a hypothesis: `exact h` or `assumption`
* have `h : P ∧ Q`: `h.1`, `h.2`, `obtain ⟨hp, hq⟩ := h`
* have `h : P ∨ Q`: `rcases h with hp | hq` (two cases)
* have `h : ∃ x, …`: `obtain ⟨x, hx⟩ := h`
* have `h : a = b`: `rw [h]`, `rw [← h]`
* use a theorem: `exact thm h`, `apply thm`, `have`
* arithmetic or computation: `omega`, `decide`, `simp`, `rfl`

```stepBreak
```

Read a proof as a story, one sentence per step. Hover over each tactic to check it against the goal display.

```lean -keep (name := day14_1)
theorem either_way (P Q R : Prop) (hpr : P → R) (hqr : Q → R) : P ∨ Q → R := by
  intro h
  rcases h with hp | hq
  · exact hpr hp
  · exact hqr hq
```

> Assume P or Q (`intro h`). There are two cases. If P holds, then R follows by `hpr`. If Q holds, then R follows by `hqr`. Either way, R.

That is an ordinary proof by cases, written in Lean.

```stepBreak
```

One last habit for auditors. After following a proof, ask: *which hypotheses did it really need, and can they all hold together?*

```lean -keep (name := day14_2)
theorem odd_and_even (n : Nat) (h1 : n % 2 = 0) (h2 : n % 2 = 1) : n = 12345 := by
  omega
```

The “story” is one word, because there is nothing to argue: no number is both even and odd. The proof is correct, and the theorem is empty.

# Check yourself
%%%
number := false
%%%

```question
d14-q1
```

```question
d14-q2
```

```question
d14-q3
```

```question
d14-q4
```

```question
d14-q5
```

```question
d14-q6
```
