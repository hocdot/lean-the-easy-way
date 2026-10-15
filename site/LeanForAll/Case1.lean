import VersoManual
import Mathlib.Logic.Function.Basic
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Case 1: Cantor, no list of all subsets" =>
%%%
tag := "case1"
file := "case1"
number := false
%%%

_Audit a real Mathlib theorem from start to finish: find it, read it, check its definitions, axioms and proof._

This section is hands-on. You audit a real theorem from *Mathlib*, the library where Lean's mathematics lives, one checklist step at a time, the way you would audit a file an AI sent you.
After each step, a question.

The checklist, from Day 27:

1. Is it really proved? (`sorry`, axioms)
2. Does the statement say what was claimed?
3. Can the hypotheses all hold?
4. Are the hypotheses honest?
5. Do the definitions mean what their names say?

# The claim
%%%
number := false
%%%

*Cantor's theorem* (1891): no set can be matched with all of its subsets.
However you assign a subset of S to each element of S, some subset is left over.
It is the reason there are different sizes of infinity, and it is famous for a short, clever proof.

# Step 1: find the theorem
%%%
number := false
%%%

Mathlib calls it `Function.cantor_surjective`. Hover over the names to see what they are:

```lean -keep (name := case1_check)
#check @Function.cantor_surjective
```
```leanOutput case1_check
@Function.cantor_surjective : ∀ {α : Type u_1} (f : α → Set α), ¬Function.Surjective f
```

Some vocabulary: `α` is any type (any collection of things). `Set α` is a subset of `α`.
`f : α → Set α` assigns a subset to each element.
`Function.Surjective f` means every subset is assigned to some element.

```question
a1-q1
```

# Step 2: the definitions
%%%
number := false
%%%

Do not trust the name `Surjective`. Ask Lean what it means:

```lean -keep (name := case1_surj)
#print Function.Surjective
```
```leanOutput case1_surj
def Function.Surjective.{u_1, u_2} : {α : Sort u_1} → {β : Sort u_2} → (α → β) → Prop :=
fun {α} {β} f => ∀ (b : β), ∃ a, f a = b
```

So `Function.Surjective f` is “for every `b` there is an `a` with `f a = b`”: every target is hit.
That is the usual meaning, so the name is honest.

```question
a1-q2
```

# Step 3: hypotheses
%%%
number := false
%%%

The statement has only *variables* before the conclusion: a type `α` and a function `f`.
There is no hypothesis, no “if”, so nothing can be impossible and nothing can secretly assume the answer.

```question
a1-q3
```

# Step 4: is it really proved?
%%%
number := false
%%%

```lean -keep (name := case1_ax)
#print axioms Function.cantor_surjective
```
```leanOutput case1_ax
'Function.cantor_surjective' does not depend on any axioms
```

No `sorry`, no made-up axioms, not even the three standard ones. The proof uses pure logic.

```question
a1-q4
```

# Step 5: read the proof
%%%
number := false
%%%

You do not have to read a proof to audit it: Lean checks every step.
But Cantor's argument is famous, so here it is in tactics.
Hover over the tactics to see the goal before and after each one.

```lean -keep
theorem cantor (α : Type) (f : α → Set α) : ¬ Function.Surjective f := by
  intro hf
  obtain ⟨d, hd⟩ := hf {a | a ∉ f a}
  by_cases h : d ∈ f d
  · have h' : d ∉ f d := by
      rw [hd] at h
      exact h
    exact h' h
  · have h' : d ∈ f d := by
      rw [hd]
      exact h
    exact h h'
```

The idea: suppose `f` hits every subset. Look at the *diagonal* subset of the elements not in their own subset. Some `d` is sent to it.
Is `d` in its own subset? If yes, the diagonal's rule says it is not. If no, the rule says it is. Both are impossible.

```question
a1-q5
```

```question
a1-q6
```

# The verdict
%%%
number := false
%%%

Proved with no axioms; the statement says the claim; there are no hypotheses; the definitions are Mathlib's standard ones, which we printed. The audit passes.

```question
a1-q7
```
