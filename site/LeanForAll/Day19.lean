import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 19: Number types and hidden conversions" =>
%%%
tag := "day19"
file := "day19"
number := false
%%%

_Tell which number type a statement is about, and read the conversion arrow `↑`._

Every number in Lean has a type. A plain numeral is a `Nat` unless something says otherwise. A *type ascription* `(3 : Int)` says it:

```lean -keep (name := day19_1)
#check 3
#check (3 : Int)
```
```leanOutput day19_1
3 : Nat
```
```leanOutput day19_1
3 : Int
```

The type changes what statements mean. The same words can be false on `Nat` and true on `Int`:

```lean -keep +error (name := day19_2)
theorem nat_ver (a b : Nat) : a - b + b = a := by omega
```
```leanOutput day19_2
omega could not prove the goal:
a possible counterexample may satisfy the constraints
  d ≥ 0
  c ≥ 0
  c - d ≥ 1
where
 c := ↑b
 d := ↑a
```

```lean -keep (name := day19_3)
theorem int_ver (a b : Int) : a - b + b = a := by omega
```

With Mathlib you will also meet the rationals `ℚ` and the *real numbers* `ℝ` (all decimals, like 1.5 or π). Core Lean has neither.

```stepBreak
```

What if a statement mixes types, say a `Nat` and an `Int`? Lean converts the `Nat` into an `Int` and shows the conversion with an arrow `↑`:

```lean -keep (name := day19_4)
#check fun (n : Nat) (m : Int) => m + n
```
```leanOutput day19_4
fun n m => m + ↑n : Nat → Int → Int
```

Lean answers `fun n m => m + ↑n : Nat → Int → Int`. Read `↑n` as “n, converted to an integer”: the same value, now of type `Int`. Such an automatic conversion is called a *coercion*.

You can also ask for one by hand: `((5 : Nat) : Int)` is 5 as a natural number, converted to an integer.

```stepBreak
```

*Where* the conversion happens matters:

```lean -keep (name := day19_5)
#check fun (a b : Nat) => ((a - b : Nat) : Int)
#check fun (a b : Nat) => (a : Int) - (b : Int)
```
```leanOutput day19_5
fun a b => ↑(a - b) : Nat → Nat → Int
```
```leanOutput day19_5
fun a b => ↑a - ↑b : Nat → Nat → Int
```

The first is `↑(a - b)`: subtract in `Nat` (stopping at 0), _then_ convert. The second is `↑a - ↑b`: convert, then subtract in `Int`. Take a = 3, b = 5:

```lean -keep (name := day19_6)
example : ((3 - 5 : Nat) : Int) = 0 := rfl
example : ((3 : Nat) : Int) - ((5 : Nat) : Int) = -2 := rfl
```

So `↑(a - b) = ↑a - ↑b` is not true in general. It needs the hypothesis `b ≤ a`.

```stepBreak
```

The same happens with real numbers in Mathlib. With `n : ℕ` (Mathlib writes ℕ for `Nat`):

```
-- needs Mathlib; n : ℕ, and take n = 3
(n : ℝ) / 2          -- convert, then divide: 1.5
((n / 2 : ℕ) : ℝ)    -- divide in ℕ (rounding down), then convert: 1
```

> When you see `↑`, ask two questions: which type is each operation done in, and where exactly does the conversion happen? And compare the type in the statement with the claim: a fact proved about `Nat` is not a fact about real numbers.

# Check yourself
%%%
number := false
%%%

```question
d19-q1
```

```question
d19-q2
```

```question
d19-q3
```

```question
d19-q4
```

```question
d19-q5
```

```question
d19-q6
```
