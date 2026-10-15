import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 27: The audit checklist" =>
%%%
tag := "day27"
file := "day27"
number := false
%%%

_Audit a theorem in five steps, and use the Lab’s Audit report while knowing what it cannot see._

Everything this week fits in five questions. Ask them in order, for every theorem that matters:

1. *Is it really proved?* No `sorry`, no `axiom`, only standard axioms in `#print axioms`.
2. *Read the statement out loud.* Does it say what was claimed, word by word: every/some, `<`/`≤`, `→`/`↔`, which numbers?
3. *Can the hypotheses all hold?* Find one example that satisfies them all.
4. *Is any hypothesis as hard as the claim?* Every hypothesis must be part of the claim, or a known, easier fact.
5. *Do the definitions mean what their names say?* Read the bodies, test small cases, watch for junk values and custom notation.

Steps 2 to 5 are reading. Lean cannot do them for you.

```stepBreak
```

The Lab’s *Audit* button helps with all five. For each theorem it reports:

* *Unfinished proof* (`sorry`), *Rests on a made-up assumption* (an `axiom`), *Trusts compiled code* (`native_decide`): step 1.
* *Hypotheses contradict each other*: step 3.
* *Assumes its own conclusion*: a hypothesis identical to the conclusion, step 4.
* *One hypothesis carries the claim*: the proof only applies one hypothesis, step 4.
* *Hypotheses are not needed*: the conclusion is true without them. Often a sign the statement is weaker than claimed (step 2).
* *A hypothesis is never used*: harmless, but ask why it is there.

It also flags files that define notation or instances, and lists every definition (step 5).

```stepBreak
```

“Hypotheses are not needed” deserves an example:

```lean -keep (name := day27_1)
theorem big_numbers (n : Nat) (h : n > 1000) : n * 0 = 0 := Nat.mul_zero n
```

The Audit finds that `n * 0 = 0` holds for every n (`rfl` proves it with no hypothesis). Then `h` is decoration, and the conclusion is probably not the interesting statement that was intended.

The Audit also gives an *English reading* of each statement, built by fixed rules from the symbols, so it is never a guess. Here: “for every n : Nat, if `n > 1000`, then `n * 0 = 0`”. Use it for step 2, and compare it with the claim.

```stepBreak
```

Now the limits. *“No red flags found” is not a guarantee.* In this week’s examples, the Audit missed or could not judge:

* `(h : ∀ m : Nat, m > 5)`, an impossible hypothesis: the contradiction needs the idea m = 0.
* `key` in `goldbach` _was_ flagged, but whether it is an open problem is mathematics, not logic. And a hypothesis used through several steps (Day 28) is not flagged at all.
* `sum_even`: the hypothesis restates the conclusion with different symbols.
* `IsPeriodic`, `isSorted`: definitions that say less than their names.
* `∃` instead of `∀`, `n < 40`, `Nat` instead of `Int`: the statements were real theorems, just not the claims.

The Audit checks *trust and obvious logic*. *Meaning* is your job.

# Check yourself
%%%
number := false
%%%

```question
d27-q1
```

```question
d27-q2
```

```question
d27-q3
```

```question
d27-q4
```

```question
d27-q5
```

```question
d27-q6
```
