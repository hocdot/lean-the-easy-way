import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 8: Proofs are step by step" =>
%%%
tag := "day08"
file := "day08"
number := false
%%%

_Read a goal display: what you have, what you still need, and when the proof is done._

Last week most proofs were one word, like `rfl`. Longer proofs start with `by`:

```lean -keep (name := day08_1)
theorem bigger (n : Nat) (h : n > 5) : n > 3 := by
  omega
```

After `by` comes a list of *tactics*, one per line. A tactic is an instruction such as “compute both sides” or “assume the if-part”. Each tactic changes what is left to prove, and Lean checks every step.

You will not write tactics in this course. You will learn to *follow* them, the way you follow the moves of a chess game someone else plays.

```stepBreak
```

To follow a proof, look at the *goal display*. Lean shows it at every step. At the start of the proof above, it looks like this:

```
n : Nat
h : n > 5
⊢ n > 3
```

* Above the `⊢` is what you *have*: the variable `n` and the hypothesis `h`, which you may use.
* After the `⊢` (read it “prove”) is the *goal*: what you still *need* to show.

> On this site, hover over a tactic in any proof to see the goal display at that point.

```stepBreak
```

A proof is finished when nothing is left to prove. After `omega` in the proof above, Lean shows *No goals*: the theorem is proved.

Some tactics are *finishing* tactics. They either close the goal completely or fail with an error:

* `rfl`: both sides of an `=` compute to the same value.
* `decide`: a statement about specific numbers, settled by computing.
* `omega`: arithmetic with `+`, `-`, constants, `<`, `≤`, `=`, using the hypotheses.

If the proof ends while some goal is still open, Lean reports an error, `unsolved goals`, and shows what is left.

```stepBreak
```

A tactic only works on goals of the right shape. `decide` computes, so it needs specific numbers. Here the statement is true, but `decide` cannot handle a variable:

```lean -keep +error (name := day08_2)
theorem add_zero' (n : Nat) : n + 0 = n := by
  decide
```
```leanOutput day08_2
Expected type must not contain free variables
  n + 0 = n

Hint: Use the `+revert` option to automatically clean up and revert free variables
```

`rfl` succeeds on the same statement, because `n + 0` computes to `n` whatever n is:

```lean -keep (name := day08_3)
theorem add_zero'' (n : Nat) : n + 0 = n := by
  rfl
```

> For an auditor: a rejected proof does not mean the statement is false, and an accepted one only means the steps fit together. The goal display shows you exactly what each step had to prove.

# Check yourself
%%%
number := false
%%%

```question
d08-q1
```

```question
d08-q2
```

```question
d08-q3
```

```question
d08-q4
```

```question
d08-q5
```

```question
d08-q6
```
