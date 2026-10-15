import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 26: Proving something else" =>
%%%
tag := "day26"
file := "day26"
number := false
%%%

_Compare a statement with the claim word by word, and catch statements that are weaker or different._

The most common problem in AI-written Lean is not cheating. It is *statement drift*: the proof is correct, but the statement is a little different from the claim, usually weaker. Typical drifts:

* `∃` (“some”) instead of `∀` (“every”)
* `≤` instead of `<`, or `→` instead of `↔`
* one specific number instead of every number
* a finite range (n < 100) instead of every n
* `Nat` instead of `Int` or the real numbers
* the answer written into the statement

Each one turns a hard claim into an easy theorem.

```stepBreak
```

Two small examples. Claim: “*every* n above 1 has n · n > n”. Proved:

```lean -keep (name := day26_1)
theorem squares_grow : ∃ n : Nat, n * n > n := ⟨2, by decide⟩
```

That only says some n works (n = 2). One example, not every case.

Claim: “n < n · n for every n above 1”. Proved:

```lean -keep (name := day26_2)
theorem squares_grow' (n : Nat) : n ≤ n * n := Nat.le_mul_self n
```

`≤` instead of `<`, and the condition “above 1” dropped. True, but it is not the claim: it allows n · n = n.

```stepBreak
```

A finite range is testing in disguise. Euler noticed that n · n + n + 41 is prime for n = 0, 1, 2, … . Is it prime for every n?

```lean -keep (name := day26_3)
def isPrime (n : Nat) : Bool := n ≥ 2 && (List.range (n - 2)).all (fun k => n % (k + 2) != 0)

theorem euler_prime : ∀ n, n < 40 → isPrime (n * n + n + 41) = true := by
  decide +kernel

#eval isPrime (40 * 40 + 40 + 41)
```
```leanOutput day26_3
false
```

(`decide +kernel` is `decide` with the computation done by Lean’s core checker; it is fully checked.) The theorem is correct, for n below 40. At n = 40 the value is 1681 = 41 · 41, not prime. A statement “for n < 40” proves nothing about all n.

```stepBreak
```

Changing the kind of number changes the claim. Claim: “every *integer* x with x · x = 4 equals 2”. That is false: x = −2. But on `Nat` there is no −2:

```lean -keep (name := day26_4)
theorem square_four (x : Nat) (h : x * x = 4) : x = 2 := by
  have hx : x < 3 := by
    apply Nat.lt_of_not_le
    intro hx
    have := Nat.mul_le_mul hx hx
    omega
  have : x = 0 ∨ x = 1 ∨ x = 2 := by omega
  rcases this with rfl | rfl | rfl <;> simp_all
```

A false claim, “proved”, by quietly choosing a smaller world. Always check the type: `Nat`, `Int`, or (in Mathlib) `ℝ`.

```stepBreak
```

Last, a file can change what symbols mean:

```lean -keep (name := day26_5)
instance weirdLT : LT Nat := ⟨fun _ _ => True⟩

theorem five_lt_two : (5 : Nat) < 2 := trivial
```

The `instance` redefines `<` on `Nat` as “always true”. A `notation` line can do the same for a new symbol. The Lab’s Audit warns “Defines its own notation” or notes “Defines an instance”. For notation, its English reading also shows the real meaning (a reversed symbol `10 ≺ 3` reads as `3 ≤ 10`). For an instance it cannot: `5 < 2` still reads `5 < 2`, so find the instance and read it. Then compare the statement with the claim, *word by word*.

# Check yourself
%%%
number := false
%%%

```question
d26-q1
```

```question
d26-q2
```

```question
d26-q3
```

```question
d26-q4
```

```question
d26-q5
```

```question
d26-q6
```
