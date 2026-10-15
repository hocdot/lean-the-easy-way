import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 1: A theorem is a claim and a proof" =>
%%%
tag := "day01"
file := "day01"
number := false
%%%

_Find the name, the statement and the proof of a theorem, and know what Lean checks._

Lean is a programming language in which you can also write mathematical *claims* and their *proofs*.
Lean then checks each proof, step by step, like a very strict teacher who never gets tired.

This course teaches you to *read* Lean, not to become an expert at writing it.
By the end of the month you should be able to look at a Lean theorem, perhaps one written by an AI, and say what it really claims and whether you should believe it.

# The parts of a theorem
%%%
number := false
%%%

Here is a complete theorem. Hover over any part of it to see what Lean knows about it.

```lean -keep
theorem two_eq_two : 2 = 2 := rfl
```

It has three parts:

* `two_eq_two` is the *name*, a label so we can refer to it later.
* `2 = 2`, between the colon and `:=`, is the *statement*: the claim being made.
* `rfl` is the *proof*. `rfl` means “both sides are the same”. Lean computes both sides and compares them.

# Lean checks every proof
%%%
number := false
%%%

Lean computes before it compares, so this works too:

```lean -keep
theorem two_plus_two : 2 + 2 = 4 := rfl
```

But if the claim is false, no proof can convince Lean:

```lean -keep +error (name := day01_wrong)
theorem wrong : 2 + 2 = 5 := rfl
```

Lean refuses, with an error. You do not need to understand the message yet: an error means *rejected*.

```leanOutput day01_wrong
Not a definitional equality: the left-hand side
  2 + 2
is not definitionally equal to the right-hand side
  5
```

# Lean ignores the name
%%%
number := false
%%%

The first lesson of auditing: a name is just a label. This is accepted:

```lean -keep
theorem very_hard_problem_solved : 1 + 1 = 2 := rfl
```

The name sounds impressive, but the statement is only `1 + 1 = 2`.
When you check a theorem, always read the *statement*, never just the name or the comment above it.

# Check yourself
%%%
number := false
%%%

```question
d01-q1
```

```question
d01-q2
```

```question
d01-q3
```

```question
d01-q4
```

```question
d01-q5
```
