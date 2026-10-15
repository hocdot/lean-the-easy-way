import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 28: Case study: a too-good-to-be-true proof" =>
%%%
tag := "day28"
file := "day28"
number := false
%%%

_Run the full checklist on a realistic file and find the hypothesis that makes it empty._

The *Collatz conjecture* is a famous unsolved problem. Take a positive number. If it is even, halve it; if it is odd, triple it and add 1. Repeat. Starting from 6: 6, 3, 10, 5, 16, 8, 4, 2, 1. The conjecture says every start eventually reaches 1. No one knows if that is true.

Suppose an AI posts: “I proved the Collatz conjecture in Lean. It compiles, no `sorry`.” Here is the whole file. Lean accepts it.

```lean -keep (name := day28_1)
/-- One step of the Collatz process: halve an even number, send an odd n to 3n + 1. -/
def step (n : Nat) : Nat := if n % 2 = 0 then n / 2 else 3 * n + 1

/-- Apply `step` k times. -/
def steps : Nat → Nat → Nat
  | 0, n => n
  | k + 1, n => steps k (step n)

/-- n reaches 1 after some number of steps. -/
def ReachesOne (n : Nat) : Prop := ∃ k, steps k n = 1

/-- The Collatz conjecture: every positive number reaches 1. -/
theorem collatz_conjecture (n : Nat) (hn : n > 0)
    (h_descent : ∀ m, m > 1 → step m < m) : ReachesOne n := by
  induction n using Nat.strongRecOn with
  | _ n ih =>
    if h1 : n = 1 then
      exact ⟨0, h1⟩
    else
      have hlt : step n < n := h_descent n (by omega)
      have hpos : step n > 0 := by
        unfold step
        split <;> omega
      obtain ⟨k, hk⟩ := ih (step n) hlt hpos
      exact ⟨k + 1, hk⟩
```

Take a minute to read it before reading on.

```stepBreak
```

*Step 1: is it proved?* The Lab’s Audit says the theorem uses only `propext` and `Quot.sound`: standard. No `sorry`, no `axiom`. And the Audit finds *no red flags* at all.

*Step 2: read the statement.* The Audit’s English reading:

> for every n : Nat, if `n > 0` and (for every m : Nat, if `m > 1`, then `step m < m`), then `ReachesOne n`

The claim was “for every n > 0, n reaches 1”. The statement has an *extra hypothesis*, `h_descent`: every number above 1 gets _smaller_ after one step. That is not part of the claim. Steps 3 and 4 are about it.

```stepBreak
```

*Step 3: can the hypotheses all hold?* `hn : n > 0` is fine (n = 1). Now test `h_descent` on a small odd number, m = 3:

```lean -keep (name := day28_2)
def step (n : Nat) : Nat := if n % 2 = 0 then n / 2 else 3 * n + 1

#eval step 3

theorem descent_is_false : ¬ (∀ m, m > 1 → step m < m) :=
  fun h => absurd (h 3 (by decide)) (by decide)
```
```leanOutput day28_2
10
```

`step 3 = 10`, and 10 is not less than 3. So `h_descent` is *false*. The theorem can never be applied: it is vacuous, exactly like Day 23’s `strange`. The proof by induction is real, but it rests on a hypothesis that never holds. If every step went down, reaching 1 would be easy; the whole difficulty of Collatz is that odd numbers go _up_.

```stepBreak
```

What made this hard to see:

* The hypothesis had a respectable name, `h_descent`, as if it were a known lemma.
* The proof was long and real (induction, cases), not a suspicious one-word `omega`.
* The definitions (`step`, `steps`, `ReachesOne`) are correct, so step 5 passes.
* The Audit found nothing: the contradiction only appears when you plug in m = 3, and `h_descent` is used inside an induction, several steps deep, so “One hypothesis carries the claim” does not fire either.

What found it: checklist step 3, “find an example”, done by a person. *Treat every hypothesis that is not in the claim as a suspect, and test it on small numbers.*

# Check yourself
%%%
number := false
%%%

```question
d28-q1
```

```question
d28-q2
```

```question
d28-q3
```

```question
d28-q4
```

```question
d28-q5
```

```question
d28-q6
```
