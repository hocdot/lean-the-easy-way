import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 7: Week 1 review: read it out loud" =>
%%%
tag := "day07"
file := "day07"
number := false
%%%

_Translate between Lean statements and plain English, both ways._

You can now read the language of statements. Here is everything from this week:

* `theorem name (variables) (hypotheses) : conclusion := proof`
* `(n : Nat)` or `{n : Nat}` or `∀ n : Nat,` → “for every natural number n”
* `(h : P)` before the colon, or `P →` after it → “if P, then”
* `∧` and, `∨` or, `¬` not, `≠` not equal, `↔` if and only if
* `∃ n,` → “there is some n such that”
* On `Nat`: `3 - 5 = 0`, `7 / 2 = 3`, `5 / 0 = 0`

Reading a statement out loud in plain English is called *informalizing* it. It is the main skill of an auditor.

```stepBreak
```

Try it on this one before you read the answer:

```lean -keep (name := day07_1)
theorem mystery (a b : Nat) (h : a ≤ b) : ∃ c : Nat, a + c = b := ⟨b - a, by omega⟩
```

> For all natural numbers a and b, if a ≤ b, then there is some c with a + c = b.

Notice the proof uses `b - a` as the witness, which is safe here _because_ of the hypothesis `a ≤ b` (no stopping at zero). The *Lab* tab can produce a word-for-word English reading of any theorem: press *Audit* there. Today’s questions are a mix of everything.

# Check yourself
%%%
number := false
%%%

```question
d07-q1
```

```question
d07-q2
```

```question
d07-q3
```

```question
d07-q4
```

```question
d07-q5
```

```question
d07-q6
```
