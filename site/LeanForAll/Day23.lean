import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 23: Hypotheses that can never hold" =>
%%%
tag := "day23"
file := "day23"
number := false
%%%

_Recognize hypotheses that contradict each other or can never be true, and say why the theorem is then empty._

Recall this theorem from Day 4:

```lean -keep (name := day23_1)
theorem strange (n : Nat) (h1 : n > 5) (h2 : n < 3) : n = 100 := by omega
```

It promises: “for every n, *if* n > 5 and n < 3, then n = 100”. No number is above 5 and below 3, so the promise is never put to the test. The theorem is true, but *vacuous*: it says nothing.

It is like “every unicorn in this room is purple”. True, because there are no unicorns in the room.

```stepBreak
```

The extreme case is a hypothesis that is plainly `False`:

```lean -keep (name := day23_2)
theorem riemann_hypothesis (h : False) : 2 + 2 = 5 := h.elim
```

`False` is the statement that can never be proved. “If False, then 2 + 2 = 5” is accepted, and so is “if False, then” anything at all. Logicians say: *from False, anything follows*. (`h.elim` is the proof that uses this.)

So when the hypotheses cannot all hold, any conclusion can be “proved”, including a famous open problem or a false statement. The name, again, means nothing.

```stepBreak
```

Impossible hypotheses are rarely written as `False`. They come in disguise:

* `(h : n < 0)` with `n : Nat`: no natural number is below 0.
* `(h : x ≠ x)`: everything equals itself.
* `(h : n + 1 = 0)` on `Nat`: n + 1 is at least 1.
* `(h1 : a < b) (h2 : b < c) (h3 : c < a)`: a circle of “less than”.
* `(h : ∀ m : Nat, m > 5)`: this says _every_ natural number is above 5. False, take m = 0.

The last one is sneaky: it reads like “for m above 5”, but it is a claim about all m. Compare `∀ m > 5, …`, which means `∀ m, m > 5 → …`.

```stepBreak
```

Automation loves impossible hypotheses. This is accepted:

```lean -keep (name := day23_3)
theorem collatz_solved (n : Nat) (h : n < 0) : n = 1 := by omega
```

`omega` succeeds not because Collatz is solved, but because `n < 0` cannot hold. *A one-word proof of a big claim is a reason to look closer.*

The Lab’s Audit tries to derive `False` from the hypotheses alone (with `contradiction`, `omega` and `simp_all`), and reports “Hypotheses contradict each other” when it can. It does flag `collatz_solved` and `strange`. But it does *not* flag `(h : ∀ m : Nat, m > 5)`: finding the contradiction needs the idea “try m = 0”, and the automatic search does not have it.

```stepBreak
```

So the real test is yours, and it is simple: *find one example where all the hypotheses hold.*

For `(n : Nat) (h1 : n > 2) (h2 : n % 2 = 0)`, n = 4 works, so these hypotheses are fine. You can even ask Lean:

```lean -keep (name := day23_4)
example : 4 > 2 ∧ 4 % 2 = 0 := by decide
```

If you cannot find any example, try to show there is none. Either way, you will know whether the theorem can ever be used.

# Check yourself
%%%
number := false
%%%

```question
d23-q1
```

```question
d23-q2
```

```question
d23-q3
```

```question
d23-q4
```

```question
d23-q5
```

```question
d23-q6
```
