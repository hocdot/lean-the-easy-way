import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 22: What does “proved” mean?" =>
%%%
tag := "day22"
file := "day22"
number := false
%%%

_Tell a finished proof from one that skips steps or assumes things, using `#print axioms` and the Lab’s Audit._

This is the last week. Everything so far was preparation for one job: *auditing*. Someone, often an AI, hands you a Lean file and says “proved”. Your job is to decide what, if anything, was proved.

AIs do produce real proofs. They also produce files that look finished but are not. The tricks you will learn to spot this week:

* a proof that skips steps (`sorry`) or assumes things (`axiom`),
* hypotheses that can never hold, or that assume the answer,
* definitions that do not mean what their names say,
* a statement that is not the claim.

Today: the first question of every audit, *is it really proved?*

```stepBreak
```

You met `sorry` before: a placeholder that skips a proof.

```lean -keep (name := day22_1)
theorem big_claim (n : Nat) : n * n ≥ n := by
  sorry
```
```leanOutput day22_1
declaration uses `sorry`
```

Lean does not show a red error. It shows a yellow *warning*, “declaration uses `sorry`”, and accepts the file. So a file full of `sorry` still “compiles”, and someone who only checks for errors will think it is fine.

> A warning about `sorry` means: *nothing is proved here*. Not “almost proved”, not “proved except for a detail”. Nothing.

```stepBreak
```

The warning appears only where `sorry` is written. A theorem that _uses_ an unfinished lemma looks clean:

```lean -keep (name := day22_2)
theorem helper (n : Nat) : n ≤ n * n := by
  sorry

theorem main_result (n : Nat) : n ≤ n * n + 1 := by
  have := helper n
  omega

#print axioms main_result
```
```leanOutput day22_2
declaration uses `sorry`
```
```leanOutput day22_2
'main_result' depends on axioms: [propext, sorryAx, Quot.sound]
```

The warning points at `helper`, not at `main_result`. But look at what `#print axioms main_result` answers, the second message above: `sorryAx` is in the list.

`#print axioms` lists everything a theorem rests on, through every lemma it uses. `sorryAx` is how `sorry` shows up. The other two, `propext` and `Quot.sound`, are standard (see below).

```stepBreak
```

An `axiom` tells Lean to accept a statement *without proof*:

```lean -keep (name := day22_3)
axiom magic : ∀ n : Nat, n * n ≥ n

theorem uses_magic (n : Nat) : n * n ≥ n := magic n

#print axioms uses_magic
```
```leanOutput day22_3
'uses_magic' depends on axioms: [magic]
```

No warning at all. Only `#print axioms` reveals `[magic]`. Lean trusts an axiom completely, so a false one (like `axiom oops : 0 = 1`) lets you prove anything.

All of ordinary mathematics in Lean rests on just three standard axioms: `propext`, `Classical.choice` and `Quot.sound`. Seeing those is normal. *Any other name* in the list, or `sorryAx`, means the theorem is not fully proved.

```stepBreak
```

One more: `native_decide` settles a computation by running a compiled program and trusting its answer, instead of having Lean’s checker go through every step.

```lean -keep (name := day22_4)
theorem by_native : 2 ^ 20 = 1048576 := by native_decide

#print axioms by_native
```
```leanOutput day22_4
'by_native' depends on axioms: [by_native._native.native_decide.ax_1]
```

The output names an extra axiom, `by_native._native.native_decide.ax_1`. This is usually fine for computations, but it is extra trust, so an auditor notes it.

> In the *Lab* tab, the *Audit* button does all of this for every theorem in a file. It reports “Unfinished proof” for `sorry`, “Rests on a made-up assumption” for an `axiom`, and “Trusts compiled code” for `native_decide`.

# Check yourself
%%%
number := false
%%%

```question
d22-q1
```

```question
d22-q2
```

```question
d22-q3
```

```question
d22-q4
```

```question
d22-q5
```

```question
d22-q6
```
