import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 30: Graduation" =>
%%%
tag := "day30"
file := "day30"
number := false
%%%

_Bring the four weeks together in one final review, and know where to go next._

Look back at what you can do now.

* *Week 1*: read a statement: `∀`, `∃`, `→`, `∧`, `∨`, `¬`, `↔`, and the quirks of `Nat` (`3 - 5 = 0`, `7 / 2 = 3`, `5 / 0 = 0`).
* *Week 2*: follow a proof through its goal displays: what you have above `⊢`, what you need below it, and how each tactic changes that.
* *Week 3*: read definitions, curly-brace arguments, hidden conversions `↑`, junk values and Mathlib-style notation.
* *Week 4*: audit: is it proved, does the statement match the claim, can the hypotheses hold, do they assume the answer, do the definitions mean what they say.

That is enough to read most short Lean files and say what they really prove.

```stepBreak
```

The one-page audit, to keep:

1. *Proved?* `#print axioms`: only `propext`, `Classical.choice`, `Quot.sound`. No `sorryAx`, no custom axioms.
2. *Statement = claim?* Read it out loud. Every/some, `<`/`≤`, `→`/`↔`, the type of numbers, finite ranges, the full answer.
3. *Hypotheses possible?* Find one example.
4. *Hypotheses honest?* Each one is part of the claim or a known, easier fact.
5. *Definitions honest?* Read the bodies; test small cases; watch junk values and notation.

And the mindset: Lean is a perfect checker of the statement *as written*. Your job is the gap between what is written and what is claimed.

```stepBreak
```

Where to go next, if you want to *write* Lean, not only read it:

* *Natural Number Game*: a gentle, playful start to writing proofs, in the browser.
* *Theorem Proving in Lean 4*: the official book on how Lean works.
* *Mathematics in Lean*: doing real mathematics with Mathlib.
* *Functional Programming in Lean*: Lean as a programming language.
* *Stanford CS 99*: a full university course on Lean 4 (programming, proofs, and how Lean checks them), with lecture handouts you can follow on your own.
* The *Lean Zulip* chat, where the community answers questions.

And keep using the *Lab* tab: paste any Lean you meet, press *Audit*, and go through the checklist. Today’s questions mix all four weeks.

# Check yourself
%%%
number := false
%%%

```question
d30-q1
```

```question
d30-q2
```

```question
d30-q3
```

```question
d30-q4
```

```question
d30-q5
```

```question
d30-q6
```
