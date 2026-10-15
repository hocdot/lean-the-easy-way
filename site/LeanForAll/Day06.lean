import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 6: There exists" =>
%%%
tag := "day06"
file := "day06"
number := false
%%%

_Read `∃`, and see why the order of `∀` and `∃` matters._

`∃` means *there exists*:

```lean -keep (name := day06_1)
theorem some_big : ∃ n : Nat, n > 100 := ⟨101, by decide⟩
```

> There is a natural number n with n > 100.

To prove it, you give one example (here 101, called the *witness*) and show it works. The angle brackets `⟨101, …⟩` package the witness with the proof about it.

```stepBreak
```

*Order matters.* Compare:

```lean -keep (name := day06_2)
theorem always_bigger : ∀ n : Nat, ∃ m : Nat, m > n := fun n => ⟨n + 1, by omega⟩
```

> For every n there is some m bigger than it. (True: m can depend on n, take n + 1.)

Swap the order and you get: “there is one m bigger than _every_ n”, `∃ m : Nat, ∀ n : Nat, m > n`. That is false, since m would have to be bigger than itself. Same symbols, opposite truth.

```stepBreak
```

Two patterns to remember:

* “*Every* P is Q” is `∀ x, P x → Q x` (with *→*).
* “*Some* P is Q” is `∃ x, P x ∧ Q x` (with *∧*).

Mixing them up gives statements that look right but say something silly. `∃ n : Nat, n > 100 → n = 7` is *true*, for a silly reason: take n = 0. Then `0 > 100` is false, and “if false then anything” is true.

```lean -keep (name := day06_3)
theorem silly : ∃ n : Nat, n > 100 → n = 7 := ⟨0, by omega⟩
```

# Check yourself
%%%
number := false
%%%

```question
d06-q1
```

```question
d06-q2
```

```question
d06-q3
```

```question
d06-q4
```

```question
d06-q5
```
