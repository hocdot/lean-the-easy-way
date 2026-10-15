import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open LeanForAll

#doc (Manual) "About" =>
%%%
tag := "about"
file := "about"
number := false
%%%

*Lean for All* teaches you to read Lean, the proof assistant, the easy way: a little every day for a month.
The aim is practical: to look at a Lean theorem, perhaps written by an AI, put it in plain words, and judge whether it proves what it claims.
A proof can be checked by Lean and still be empty, when its hypotheses can never hold, when it assumes its own conclusion, or when its statement is not the claim.

About the logo: `∀` is read “for all”, and here it leans against a wall, at ease. So it says “Lean for all”, the easy way.
Together with the wall it also makes `∀N`, the end of Lean's own wordmark, L∃∀N.

*How it teaches*

* You only pick answers. Every wrong answer matches a specific, common misunderstanding.
* Every answer gets concrete feedback: an example where your pick and the right answer differ, or what Lean itself says.
* The site keeps track of what you tend to mix up. Practice brings those ideas back, and after a few mistakes you get a short explanation of the idea itself.
* Every piece of Lean on this site was checked by Lean when the site was built. These pages are written in [Verso](https://verso.lean-lang.org/), Lean's own documentation tool, so hovering over code shows what Lean knows about it.

*Thanks*

The lessons are written for this site, but they stand on the work of others:

* [A Misconception-Driven Adaptive Tutor for Linear Temporal Logic](https://cs.brown.edu/people/sk/Publications/Papers/Published/pgnk-ltl-tutor/), by Siddhartha Prasad, Ben Greenman, Tim Nelson and Shriram Krishnamurthi (CAV 2025): the method behind this site. Questions whose wrong answers each match a known misconception, concrete feedback on every mistake, a model of which ideas you mix up, and explanations once a pattern appears.
* [Lean Game Server and the Natural Number Game](https://adam.math.hhu.de), by Jon Eugster, Alexander Bentkamp and Marcus Zibrowius; the game by Kevin Buzzard and Mohammad Pedramfar: learning Lean one small step at a time, with the goal always in view.
* [Theorem Proving in Lean 4](https://lean-lang.org/theorem_proving_in_lean4/), by Jeremy Avigad, Leonardo de Moura, Soonho Kong and Sebastian Ullrich: how Lean reads statements, propositions and tactics.
* [Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/), by Jeremy Avigad and Patrick Massot: real mathematics with Mathlib, including its conventions.
* [The Mechanics of Proof](https://hrmacbeth.github.io/math2001/), by Heather Macbeth: a gentle course that reads proofs line by line.
* [Functional Programming in Lean](https://lean-lang.org/functional_programming_in_lean/), by David Thrane Christiansen: Lean as a programming language.
* [CS 99: Functional Programming and Theorem Proving in Lean 4](https://web.stanford.edu/class/cs99/), by Leni Aniva and Abdalrhman Mohamed (Stanford Centaur Lab, faculty sponsor Clark Barrett): a university course on writing Lean, and a good next step.
* [Verso](https://verso.lean-lang.org/), by David Thrane Christiansen and the Lean FRO: the tool these pages are written in.
* [Lean and Mathlib](https://leanprover-community.github.io), by the Lean FRO and the Lean community: the prover that checks every example here.

*Your data*

Your progress is stored only in this browser.

```resetProgress
```
