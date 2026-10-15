import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 2: Numbers in Lean are a little different" =>
%%%
tag := "day02"
file := "day02"
number := false
%%%

_Predict what Lean computes for subtraction and division, and why it matters._

The numbers you have seen so far are *natural numbers*: 0, 1, 2, 3 … Lean calls their type `Nat` (mathematicians write ℕ).

You can ask Lean to compute with `#eval`. Lean’s answer is shown under the code.

```lean -keep (name := day02_1)
#eval 2 + 3
#eval 4 * 5
```
```leanOutput day02_1
5
```
```leanOutput day02_1
20
```

`#eval` is not a theorem. It just computes one thing and shows the result.

```stepBreak
```

Natural numbers have no negatives. So what is `3 - 5`? Lean’s answer is that subtraction *stops at zero*:

```lean -keep (name := day02_2)
#eval 3 - 5
```
```leanOutput day02_2
0
```

If you want negative numbers, use the integers, `Int` (ℤ). Writing `(3 : Int)` means “3, as an integer”:

```lean -keep (name := day02_3)
#eval (3 : Int) - 5
```
```leanOutput day02_3
-2
```

```stepBreak
```

Division on `Nat` and `Int` *rounds down*, and `%` gives the remainder:

```lean -keep (name := day02_4)
#eval 7 / 2
#eval 7 % 2
```
```leanOutput day02_4
3
```
```leanOutput day02_4
1
```

And dividing by zero is not an error. By convention, it gives zero:

```lean -keep (name := day02_5)
#eval 5 / 0
```
```leanOutput day02_5
0
```

These are not bugs. Every operation in Lean must give _some_ answer, and these choices make many theorems simpler to state.

```stepBreak
```

Why does an auditor care? Because a statement can be true or false *only because of these conventions*. For example, on paper “a − b + b = a” is always true. With `Nat` it is not: take a = 1 and b = 2, then 1 − 2 + 2 = 0 + 2 = 2.

```lean -keep +error (name := day02_6)
theorem paper_rule (a b : Nat) : a - b + b = a := by omega
```
```leanOutput day02_6
omega could not prove the goal:
a possible counterexample may satisfy the constraints
  d ≥ 0
  c ≥ 0
  c - d ≥ 1
where
 c := ↑b
 d := ↑a
```

(`by omega` asks Lean to prove an arithmetic fact automatically. It fails here, because the fact is false.)

> When you see `-` or `/` in a statement, ask: which kind of numbers is this, and what happens at the edges?

# Check yourself
%%%
number := false
%%%

```question
d02-q1
```

```question
d02-q2
```

```question
d02-q3
```

```question
d02-q4
```

```question
d02-q5
```
