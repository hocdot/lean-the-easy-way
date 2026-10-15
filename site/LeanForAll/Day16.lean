import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 16: Definitions by cases and recursion" =>
%%%
tag := "day16"
file := "day16"
number := false
%%%

_Read definitions written case by case or in terms of themselves, by computing small cases, and read the goals that induction produces._

Some definitions treat inputs case by case. This one gives the number before n:

```lean -keep (name := day16_1)
def before : Nat → Nat
  | 0 => 0
  | n + 1 => n

#eval before 5
#eval before 0
```
```leanOutput day16_1
4
```
```leanOutput day16_1
0
```

`Nat → Nat` means “takes a natural number, gives a natural number”. Each line starting with `|` is a *case*: a pattern on the left of `=>`, the result on the right. The pattern `n + 1` matches every number that is one more than some n (so every number except 0), and calls that smaller number n.

Notice `before 0 = 0`. No natural number comes before 0, so the writer had to pick something. Every case must give _some_ value.

```stepBreak
```

The same idea is often written with `match`:

```lean -keep (name := day16_2)
def isZero (n : Nat) : Bool :=
  match n with
  | 0 => true
  | _ => false

#eval isZero 0
#eval isZero 7
```
```leanOutput day16_2
true
```
```leanOutput day16_2
false
```

`match n with` means “look at n and pick the first case that fits”. Lean tries the cases *from top to bottom*. The pattern `_` matches anything, so it catches every n that is not 0.

`Bool` is the type with the two values `true` and `false`, which a program can compute. It is different from `Prop`, the type of statements, which need proofs.

```stepBreak
```

A definition can use itself on a smaller input. This is *recursion*:

```lean -keep (name := day16_3)
def fact : Nat → Nat
  | 0 => 1
  | n + 1 => (n + 1) * fact n

#eval fact 4
```
```leanOutput day16_3
24
```

To read it, compute small cases by hand, from the bottom up:

* `fact 0 = 1`
* `fact 1 = 1 * fact 0 = 1`
* `fact 2 = 2 * fact 1 = 2`
* `fact 3 = 3 * fact 2 = 6`

So `fact n` is 1 × 2 × … × n, the _factorial_ of n. Each step uses a smaller number, so the computation always reaches 0 and stops.

```stepBreak
```

Small cases are the fastest way to catch a wrong definition. This one is meant to add up 0 + 1 + … + n:

```lean -keep (name := day16_4)
def sumTo : Nat → Nat
  | 0 => 0
  | n + 1 => n + sumTo n

#eval sumTo 3
```
```leanOutput day16_4
3
```

Lean shows 3, but 0 + 1 + 2 + 3 = 6. The second case should add `n + 1`, not `n`. Every theorem about this `sumTo` is about the wrong function.

> Small cases can show that a definition is wrong. They cannot show that it is right for every n: that needs a proof.

```stepBreak
```

Proofs about recursive definitions usually use *induction*. You only need to read the goals it produces:

```lean -keep (name := day16_5)
def fact : Nat → Nat
  | 0 => 1
  | n + 1 => (n + 1) * fact n

theorem fact_pos (n : Nat) : fact n > 0 := by
  induction n with
  | zero => decide
  | succ n ih => exact Nat.mul_pos (Nat.succ_pos n) ih
```

`induction n` splits the goal in two:

```
case zero
⊢ fact 0 > 0

case succ
n : Nat
ih : fact n > 0
⊢ fact (n + 1) > 0
```

First prove it for 0. Then prove it for n + 1, *assuming* it for n. That assumption, `ih`, is the _induction hypothesis_. Together the two cases cover 0, 1, 2, … like a row of falling dominoes.

# Check yourself
%%%
number := false
%%%

```question
d16-q1
```

```question
d16-q2
```

```question
d16-q3
```

```question
d16-q4
```

```question
d16-q5
```

```question
d16-q6
```
