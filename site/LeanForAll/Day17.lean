import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 17: Structures, lists and dot notation" =>
%%%
tag := "day17"
file := "day17"
number := false
%%%

_Read structures, lists and the dot in `p.x`, `l.length`, `h.1` and `Nat.succ`, and find where a name comes from._

A *structure* bundles several values into one. A point in the plane has two coordinates:

```lean -keep (name := day17_1)
structure Point where
  x : Int
  y : Int

def p : Point := ⟨1, 2⟩
def q : Point := { x := 3, y := -4 }

#eval p.x
#eval q.y
```
```leanOutput day17_1
1
```
```leanOutput day17_1
-4
```

`Point` is a new type. Its *fields* are `x` and `y`, both integers. There are two ways to build one: angle brackets, with the fields in the order the structure lists them, or `{ x := …, y := … }` with names. `p.x` reads the field `x` of `p`.

```stepBreak
```

The dot does more than read fields. A function named `Point.add` lives in the *namespace* `Point`, and can be called with a dot:

```lean -keep (name := day17_2)
structure Point where
  x : Int
  y : Int

def Point.add (a b : Point) : Point := ⟨a.x + b.x, a.y + b.y⟩

def p : Point := ⟨1, 2⟩
def q : Point := ⟨3, -4⟩

#eval (p.add q).y
```
```leanOutput day17_2
-2
```

`p.add q` means `Point.add p q`: Lean sees that p is a `Point` and looks for `Point.add`. The same rule explains `n.succ`: for `n : Nat` it means `Nat.succ n`, which is n + 1. Library theorems use namespaces too: `Nat.add_comm` is the theorem `add_comm` in the namespace `Nat`.

```stepBreak
```

A *list* is a sequence of values of one type, in square brackets. `List Nat` is the type of lists of natural numbers.

```lean -keep (name := day17_3)
#eval [3, 1, 2].length
#eval [1, 2] ++ [3, 4, 5]
#eval [3, 1, 2].reverse
```
```leanOutput day17_3
3
```
```leanOutput day17_3
[1, 2, 3, 4, 5]
```
```leanOutput day17_3
[2, 1, 3]
```

`l.length` is `List.length l`, the number of entries, and `++` joins two lists. Here is a library theorem about them:

```lean -keep (name := day17_4)
example (l1 l2 : List Nat) : (l1 ++ l2).length = l1.length + l2.length :=
  List.length_append
```

> For all lists l1 and l2, the length of l1 joined with l2 is the length of l1 plus the length of l2.

```stepBreak
```

You have met `⟨ ⟩` and `.1` before: `⟨hp, hq⟩` builds a proof of `P ∧ Q`, and `h.1`, `h.2` take it apart. It is the same idea: a proof of “and” is a structure with two fields.

A structure can even have a *statement* as a field:

```lean -keep (name := day17_5)
structure PosNat where
  val : Nat
  pos : val > 0

def three : PosNat := ⟨3, by decide⟩
```

To build a `PosNat`, you must prove `val > 0`. So a theorem about every `(s : PosNat)` quietly assumes `s.val > 0`, even though no `>` appears in the theorem. That hypothesis is hidden in the structure.

```stepBreak
```

`namespace My … end My` puts every name in between under `My.`. After `open My`, you may drop the prefix. That is convenient, but it means a short name can come from anywhere:

```lean -keep (name := day17_6)
namespace My
def Prime (n : Nat) : Prop := n > 1
end My

open My

theorem seven_prime : Prime 7 := by
  unfold Prime
  decide
```

Here `Prime 7` only says `7 > 1`.

> Auditor’s habit: when you see `s.something`, an unfamiliar type, or a familiar-looking name, find the definition it really refers to. Structures and namespaces are places where meaning hides.

# Check yourself
%%%
number := false
%%%

```question
d17-q1
```

```question
d17-q2
```

```question
d17-q3
```

```question
d17-q4
```

```question
d17-q5
```

```question
d17-q6
```
