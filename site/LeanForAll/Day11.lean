import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 11: Or and there-exists" =>
%%%
tag := "day11"
file := "day11"
number := false
%%%

_Follow `left`/`right`, `rcases` on an “or”, and witnesses for `∃`._

To prove `P ∨ Q`, it is enough to prove one side. `left` commits to P, `right` commits to Q:

```lean -keep (name := day11_1)
theorem pick_side : 2 = 3 ∨ 2 = 2 := by
  right
  rfl
```

After `right` the goal is `⊢ 2 = 2`, and `rfl` closes it. Choosing `left` would leave `⊢ 2 = 3`, which nothing can prove. The step is allowed, but the proof gets stuck.

```stepBreak
```

*Using* `h : P ∨ Q` is different. You know one side holds, not which. So the proof splits into two *cases*, and both must be finished:

```lean -keep (name := day11_2)
theorem small (n : Nat) (h : n = 1 ∨ n = 2) : n < 3 := by
  rcases h with h1 | h2
  · omega
  · omega
```

After `rcases h with h1 | h2`:

```
case inl
n : Nat
h1 : n = 1
⊢ n < 3
case inr
n : Nat
h2 : n = 2
⊢ n < 3
```

Each case has only one of the two facts.

```stepBreak
```

To prove `∃ n, …`, name a *witness* and show it works. `refine ⟨4, ?_⟩` says “take n = 4” and leaves the check as the goal:

```lean -keep (name := day11_3)
theorem four : ∃ n : Nat, n + 3 = 7 := by
  refine ⟨4, ?_⟩
  rfl
```

The goal goes from `⊢ ∃ n, n + 3 = 7` to `⊢ 4 + 3 = 7`. Two shorter ways do the same in one line: `exists 4` (which also tries to close the check itself) and `exact ⟨4, by decide⟩`.

```stepBreak
```

*Using* `h : ∃ n, …` gives you _some_ number with the property, but you do not choose which:

```lean -keep (name := day11_4)
theorem above (h : ∃ n : Nat, n > 5) : ∃ m : Nat, m > 4 := by
  obtain ⟨x, hx⟩ := h
  exact ⟨x, by omega⟩
```

After `obtain`:

```
x : Nat
hx : x > 5
⊢ ∃ m, m > 4
```

All you know about `x` is `hx`. It might be 6 or a million.

> For an auditor: an “or” hypothesis means every case must be handled, and an `∃` hypothesis gives you an unknown value, not a convenient one.

# Check yourself
%%%
number := false
%%%

```question
d11-q1
```

```question
d11-q2
```

```question
d11-q3
```

```question
d11-q4
```

```question
d11-q5
```

```question
d11-q6
```
