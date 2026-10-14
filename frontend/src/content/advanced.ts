import type { Week } from './types.ts'

// Hands-on audits of real Mathlib theorems. Each case walks the Day 27 checklist from the
// claim to the verdict, with a question at every step. Code marked `mathlib` runs (and is
// checked by `make test`) only where Mathlib is installed (make mathlib).

const FLT_RENAMED = `import Mathlib.NumberTheory.FLT.Four

/-- Fermat's Last Theorem, proved. -/
theorem fermat_last_theorem
    (hprimes : ∀ p : ℕ, Nat.Prime p → Odd p → FermatLastTheoremFor p) :
    FermatLastTheorem :=
  FermatLastTheorem.of_odd_primes hprimes`

const FLT_SORRY = `import Mathlib.NumberTheory.FLT.Four

/-- The key step: Fermat for odd prime exponents. -/
theorem flt_odd_prime (p : ℕ) (hp : Nat.Prime p) (hodd : Odd p) :
    FermatLastTheoremFor p := by
  sorry

/-- Fermat's Last Theorem, proved. -/
theorem fermat_last_theorem : FermatLastTheorem :=
  FermatLastTheorem.of_odd_primes flt_odd_prime

#print axioms fermat_last_theorem`

const FLT_EXISTS = `import Mathlib.NumberTheory.FLT.Four

/-- Fermat's Last Theorem: for every n ≥ 3, the equation aⁿ + bⁿ = cⁿ fails. -/
theorem fermat_last_theorem : ∀ n ≥ 3, ∃ a b c : ℕ, a ^ n + b ^ n ≠ c ^ n := by
  intro n hn
  exact ⟨1, 1, 1, by simp⟩`

const FLT_VACUOUS = `import Mathlib.NumberTheory.FLT.Four

/-- Fermat's Last Theorem for every exponent n ≥ 3. -/
theorem fermat_last_theorem (n : ℕ) (h3 : 3 ≤ n) (hsmall : n * n < 9) :
    FermatLastTheoremFor n := by
  nlinarith`

const CANTOR_STEPS = `import Mathlib.Logic.Function.Basic

theorem cantor (α : Type) (f : α → Set α) : ¬ Function.Surjective f := by
  intro hf
  obtain ⟨d, hd⟩ := hf {a | a ∉ f a}
  by_cases h : d ∈ f d
  · have h' : d ∉ f d := by
      rw [hd] at h
      exact h
    exact h' h
  · have h' : d ∈ f d := by
      rw [hd]
      exact h
    exact h h'`

const EUCLID = `import Mathlib.Data.Nat.Prime.Infinite

open Nat in
theorem euclid (n : ℕ) : ∃ p, n ≤ p ∧ Nat.Prime p :=
  let p := minFac (n ! + 1)
  have f1 : n ! + 1 ≠ 1 := ne_of_gt <| succ_lt_succ <| factorial_pos _
  have pp : Nat.Prime p := minFac_prime f1
  have np : n ≤ p :=
    le_of_not_ge fun h =>
      have h₁ : p ∣ n ! := dvd_factorial (minFac_pos _) h
      have h₂ : p ∣ 1 := (Nat.dvd_add_iff_right h₁).2 (minFac_dvd _)
      pp.not_dvd_one h₂
  ⟨p, np, pp⟩`

export const advanced: Week = {
  week: 5,
  label: 'Advanced',
  title: 'Auditing real theorems',
  summary: 'Hands-on audits of famous theorems from Mathlib, from the claim to the verdict, one step and one question at a time.',
  lessons: [
    // ───────────────────────────────────────────────────────────── Case 1: Cantor
    {
      day: 31,
      label: 'Case 1',
      title: 'Cantor: no list of all subsets',
      goal: 'Audit a real Mathlib theorem from start to finish: find it, read it, check its definitions, axioms and proof.',
      cards: [],
      questions: [],
      flow: [
        `This section is hands-on. You audit real theorems from **Mathlib**, the library where Lean’s mathematics lives, one checklist step at a time, the way you would audit a file an AI sent you. After each step, a question.

The checklist, from Day 27:

1. Is it really proved? (\`sorry\`, axioms)
2. Does the statement say what was claimed?
3. Can the hypotheses all hold?
4. Are the hypotheses honest?
5. Do the definitions mean what their names say?

The code here needs Mathlib. Pressing **Run** loads the part of Mathlib it imports, which takes a few seconds the first time.`,

        `### The claim

**Cantor’s theorem** (1891): no set can be matched with all of its subsets. However you assign a subset of S to each element of S, some subset is left over.

It is the reason there are different sizes of infinity, and it is famous for a short, clever proof.

### Step 1: find the theorem

Mathlib calls it \`Function.cantor_surjective\`. \`#check\` shows its statement:

\`\`\`lean mathlib
import Mathlib.Logic.Function.Basic

#check @Function.cantor_surjective
\`\`\`

Lean answers:

> \`∀ {α : Type u_1} (f : α → Set α), ¬Function.Surjective f\`

Some vocabulary: \`α\` is any type (any collection of things). \`Set α\` is a subset of α. \`f : α → Set α\` assigns a subset to each element. \`Function.Surjective f\` means every subset is assigned to some element. (\`Type u_1\` only says α may live in any “universe” of types. Ignore it.)`,

        {
          id: 'a1-q1',
          prompt: 'Which English sentence says what `∀ {α} (f : α → Set α), ¬ Function.Surjective f` says?',
          options: [
            { text: 'For every type α and every way f of assigning subsets to elements, f does not hit every subset.', correct: true, why: '`∀` covers every α and every f, and `¬ Function.Surjective f` says f is not onto: some subset is missed.' },
            { text: 'For every type α, there is no function from α to its subsets.', misconception: 'statement-drift', why: 'Functions from α to its subsets exist (send each a to the subset {a}). The claim is only that none of them hits every subset.' },
            { text: 'There is some type α and some f that misses a subset.', misconception: 'free-variable', why: 'That would be an `∃` claim, easy and much weaker. The `∀` makes it a claim about every α and every f.' },
          ],
        },

        `### Step 2: the definitions (checklist step 5)

Do not trust the name \`Surjective\`. Ask Lean what it means:

\`\`\`lean mathlib
import Mathlib.Logic.Function.Basic

#print Function.Surjective
\`\`\`

> \`fun {α} {β} f => ∀ (b : β), ∃ a, f a = b\`

So \`Function.Surjective f\` is “for every b there is an a with f a = b”: every target is hit. That is the usual meaning, so the name is honest.

And \`Set α\`? In Mathlib a subset of α is a property of elements: \`S a\` holds exactly when \`a ∈ S\`. You can check that Lean treats the two as the same:

\`\`\`lean mathlib
import Mathlib.Logic.Function.Basic

example (α : Type) (S : Set α) (a : α) : (a ∈ S) = S a := rfl
\`\`\``,

        {
          id: 'a1-q2',
          prompt: 'Using the printed definition, what does `¬ Function.Surjective f` say?',
          options: [
            { text: 'There is some subset b such that no a has f a = b.', correct: true, why: '`¬ ∀ b, ∃ a, f a = b` is the same as `∃ b, ¬ ∃ a, f a = b`: some subset is never hit.' },
            { text: 'No subset is hit by f at all.', misconception: 'not-scope', why: 'The `¬` is in front of the whole `∀ b, …`. Not every subset is hit, but many can be. Saying “none is hit” would put the `¬` inside.' },
            { text: 'f sends two different elements to the same subset.', misconception: 'definition-trust', why: 'That is about being one-to-one (injective), a different definition. Read the printed body: it is about every b being hit.' },
          ],
        },

        `### Step 3: hypotheses (checklist steps 3 and 4)

Look at the statement again: \`∀ {α} (f : α → Set α), ¬ Function.Surjective f\`. Before the conclusion there are only **variables**: a type α and a function f. There is no hypothesis, no “if”.

So there is nothing that could be impossible (vacuous) and nothing that could secretly assume the answer. Steps 3 and 4 are done at once.`,

        {
          id: 'a1-q3',
          prompt: 'Could this theorem be vacuous, because maybe no function `f : α → Set α` exists?',
          options: [
            { text: 'No: f is a variable (“for every f”), not a hypothesis; and such functions do exist anyway.', correct: true, why: 'There are no hypotheses at all. And for any α, `fun a => {a}` is a function from α to its subsets.' },
            { text: 'Yes: if no such f exists, the theorem says nothing.', misconception: 'vacuous-truth', why: 'Functions like `fun a => {a}` always exist. More importantly, f is not an assumption: the claim is about every f you could pick.' },
          ],
        },

        `### Step 4: is it really proved? (checklist step 1)

\`\`\`lean mathlib
import Mathlib.Logic.Function.Basic

#print axioms Function.cantor_surjective
\`\`\`

> \`'Function.cantor_surjective' does not depend on any axioms\`

No \`sorry\`, no made-up axioms. Not even the three standard ones (\`propext\`, \`Classical.choice\`, \`Quot.sound\`). The proof uses pure logic.`,

        {
          id: 'a1-q4',
          prompt: 'Which `#print axioms` output would make you stop trusting a theorem?',
          options: [
            { text: '`depends on axioms: [propext, sorryAx, Quot.sound]`', correct: true, why: '`sorryAx` means a `sorry` somewhere in the proof or in a lemma it uses: part of it was skipped.' },
            { text: '`does not depend on any axioms`', misconception: 'axiom-is-proof', why: 'No axioms is the strongest possible result: the proof needs nothing beyond Lean’s logic.' },
            { text: '`depends on axioms: [propext, Classical.choice, Quot.sound]`', misconception: 'axiom-is-proof', why: 'These three are the standard foundations of ordinary mathematics in Lean. Seeing them is normal.' },
          ],
        },

        `### Step 5: read the proof (optional, but this one is short)

You do not have to read a proof to audit it: Lean’s kernel checks every step. But Cantor’s proof is famous, so here it is. Mathlib’s version is three lines and very terse:

\`\`\`lean fragment
theorem cantor_surjective {α} (f : α → Set α) : ¬Surjective f := fun hf ↦
  let ⟨a, ha⟩ := hf {a | a ∉ f a}
  iff_not_self <| .of_eq <| congrArg (a ∈ ·) ha
\`\`\`

Here is the same argument written in tactics. Press **Run**, then **Step through** to follow the goals:

\`\`\`lean mathlib
${CANTOR_STEPS}
\`\`\`

The idea: suppose f hits every subset (\`intro hf\`, goal \`False\`). Consider the **diagonal** subset D = {a | a ∉ f a}: the elements not in their own assigned subset. Since f hits everything, some d has f d = D.`,

        {
          id: 'a1-q5',
          prompt: `After \`obtain ⟨d, hd⟩ := hf {a | a ∉ f a}\` the goal display is:

\`\`\`
α : Type
f : α → Set α
hf : Function.Surjective f
d : α
hd : f d = {a | ¬a ∈ f a}
⊢ False
\`\`\`

What do we know about \`d\`?`,
          options: [
            { text: 'f sends d exactly to the diagonal subset {a | a ∉ f a}.', correct: true, why: 'That is `hd`. Surjectivity, applied to the diagonal subset, gave us some d that hits it.' },
            { text: 'd is not in f d.', misconception: 'goal-vs-hypothesis', why: 'Not yet known. Whether d ∈ f d is exactly what the next step examines, in both cases.' },
            { text: 'We chose d to be a convenient element.', misconception: 'exists-witness', why: 'We did not choose it. `hf` said some element hits the diagonal; `obtain` names it d, and all we know is `hd`.' },
          ],
        },

        `### The punchline

Now ask: **is d in its own subset f d?**

- If yes (\`d ∈ f d\`): f d is the diagonal, and being in the diagonal means \`d ∉ f d\`. Contradiction.
- If no (\`d ∉ f d\`): then d satisfies the diagonal’s condition, so d is in the diagonal, which is f d. Contradiction again.

Both answers are impossible, so the assumption that f hits everything was false. The \`by_cases h : d ∈ f d\` line makes exactly these two cases, \`case pos\` and \`case neg\`.`,

        {
          id: 'a1-q6',
          prompt: 'In the first case (`h : d ∈ f d`), the proof has just shown `h\' : d ∉ f d`. Pick the step that finishes this case.',
          code: `import Mathlib.Logic.Function.Basic

theorem cantor (α : Type) (f : α → Set α) : ¬ Function.Surjective f := by
  intro hf
  obtain ⟨d, hd⟩ := hf {a | a ∉ f a}
  by_cases h : d ∈ f d
  · have h' : d ∉ f d := by
      rw [hd] at h
      exact h
    ???
  · have h' : d ∈ f d := by
      rw [hd]
      exact h
    exact h h'`,
          fillIn: true,
          mathlib: true,
          options: [
            { text: '`exact h\' h`', correct: true, why: '`h\'` says “d ∉ f d”, which is “d ∈ f d → False”. Applied to `h : d ∈ f d` it gives `False`, the goal.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `d ∈ f d`, but the goal is `False`. `exact` needs exactly the goal.' },
            { text: '`exact hd`', misconception: 'exact-match', why: '`hd` is the equation `f d = {a | a ∉ f a}`, not `False`.' },
          ],
        },

        `### The verdict

- **Proved?** Yes, with no axioms at all. (Our step-by-step version uses the standard three, because \`by_cases\` reasons classically. Still fine.)
- **Says the claim?** Yes: for every α and every f, some subset is missed.
- **Hypotheses?** None.
- **Definitions?** \`Function.Surjective\` and \`Set\` are Mathlib’s standard ones, and we printed them.

The audit passes. One last look at a variant you may meet.`,

        {
          id: 'a1-q7',
          prompt: 'Someone writes it this way. Lean accepts it. A colleague says “the hypothesis `hf` can never hold, so this is vacuous!” Are they right?',
          code: `import Mathlib.Logic.Function.Basic

theorem cantor' (α : Type) (f : α → Set α) (hf : Function.Surjective f) : False :=
  Function.cantor_surjective f hf`,
          mathlib: true,
          options: [
            { text: 'No: “if hf then False” is exactly how ¬ is stated. Showing hf can never hold is the whole point of the theorem.', correct: true, why: '`¬ P` means `P → False`. A theorem whose conclusion is `False` says its hypotheses are impossible, and here that is the claim.' },
            { text: 'Yes: any theorem with an impossible hypothesis is vacuous.', misconception: 'vacuous-truth', why: 'A vacuous theorem is a problem when its conclusion is supposed to say something. Here the conclusion is `False`: the theorem’s whole message is “hf is impossible”.' },
            { text: 'Yes: it is a different claim from Mathlib’s.', misconception: 'colon-split', why: 'Moving `Function.Surjective f` before the colon as a hypothesis, with conclusion `False`, states exactly `¬ Function.Surjective f`.' },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────────────────── Case 2: Euclid
    {
      day: 32,
      label: 'Case 2',
      title: 'Euclid: infinitely many primes',
      goal: 'Audit how a claim about infinity is stated, check a definition against its famous bugs, and read a classic proof.',
      cards: [],
      questions: [],
      flow: [
        `### The claim

**There are infinitely many prime numbers.** Euclid proved it around 300 BC. It is one of the oldest theorems in mathematics, and Mathlib has it as \`Nat.exists_infinite_primes\`:

\`\`\`lean mathlib
import Mathlib.Data.Nat.Prime.Infinite

#check @Nat.exists_infinite_primes
\`\`\`

> \`Nat.exists_infinite_primes : ∀ (n : ℕ), ∃ p, n ≤ p ∧ Nat.Prime p\`

Notice: the claim says “infinitely many”, but the statement does not contain the word “infinite”. That is the first thing to check.`,

        {
          id: 'a2-q1',
          prompt: 'Why does `∀ n, ∃ p, n ≤ p ∧ Nat.Prime p` mean “there are infinitely many primes”?',
          options: [
            { text: 'Above every number there is a prime. If there were only finitely many primes, there would be none above the largest one.', correct: true, why: 'Unbounded is the same as infinite for sets of natural numbers. The `∀ n` rules out a largest prime.' },
            { text: 'It says every number n is prime.', misconception: 'free-variable', why: 'The prime is p, which comes from `∃ p` and may depend on n. n itself need not be prime.' },
            { text: 'It only says there is at least one prime.', misconception: 'quantifier-order', why: 'That would be `∃ p, Nat.Prime p`. Here a new prime is promised above *every* n, so there are infinitely many.' },
          ],
        },

        `### Step 1: does the statement say the claim?

Statements that look close can be much weaker. Both of these are accepted by Lean, each with a one-line proof:

\`\`\`lean mathlib
import Mathlib.Data.Nat.Prime.Infinite

theorem only_one_prime : ∃ p, Nat.Prime p := ⟨2, Nat.prime_two⟩

theorem prime_below (n : ℕ) : ∃ p, p ≤ n + 2 ∧ Nat.Prime p := ⟨2, by omega, Nat.prime_two⟩
\`\`\`

The first only says a prime exists. The second has the inequality the wrong way round, so the prime 2 works for every n. Neither says anything about infinity.`,

        {
          id: 'a2-q2',
          prompt: 'An AI claims it proved “infinitely many primes”, and shows one of these. Which one actually says it?',
          options: [
            { text: '`∀ n, ∃ p, n ≤ p ∧ Nat.Prime p`', correct: true, why: 'A prime at or above every n: no largest prime, so infinitely many.' },
            { text: '`∀ n, ∃ p, p ≤ n + 2 ∧ Nat.Prime p`', misconception: 'statement-drift', why: 'The prime only has to be *below* n + 2, and p = 2 always works. One prime is enough to prove this.' },
            { text: '`∃ p, Nat.Prime p`', misconception: 'statement-drift', why: 'This says a single prime exists. `⟨2, Nat.prime_two⟩` proves it.' },
          ],
        },

        `A second formalization is reassuring when two of them agree. Mathlib also states the claim literally, with the set of primes:

\`\`\`lean mathlib
import Mathlib.Data.Nat.PrimeFin

#check @Nat.infinite_setOfPred_prime
\`\`\`

> \`Nat.infinite_setOfPred_prime : {p | Nat.Prime p}.Infinite\`

“The set of primes is infinite.” Two different statements of the same claim, both proved in Mathlib.`,

        `### Step 2: the definitions (checklist step 5)

On Day 25 you saw an \`IsPrime\` that forgot “n ≥ 2” and so counted 1 as prime. Does Mathlib’s \`Nat.Prime\` have that bug?

\`\`\`lean mathlib
import Mathlib.Data.Nat.Prime.Infinite

#print Nat.Prime
#check @Nat.prime_def
example : Nat.Prime 7 := by decide
example : ¬ Nat.Prime 1 := Nat.not_prime_one
example : ¬ Nat.Prime 0 := Nat.not_prime_zero
\`\`\`

\`#print\` shows \`Nat.Prime p\` is defined as \`Irreducible p\`, a general notion from algebra that is hard to read. But Mathlib proves \`Nat.prime_def\`, which restates it in school terms:

> \`Nat.Prime p ↔ 2 ≤ p ∧ ∀ (m : ℕ), m ∣ p → m = 1 ∨ m = p\`

And small cases behave: 7 is prime, 0 and 1 are not.`,

        {
          id: 'a2-q3',
          prompt: 'How do you know Mathlib’s `Nat.Prime` does not count 1 as prime, like the broken `IsPrime` of Day 25?',
          options: [
            { text: 'Mathlib proves `Nat.not_prime_one`, and `Nat.prime_def` says a prime is at least 2.', correct: true, why: 'Theorems about a definition are evidence about what it means. Testing small cases is the other half.' },
            { text: 'Because it is called `Prime`.', misconception: 'definition-trust', why: 'Day 25’s `IsPrime` was called that too. Names prove nothing; theorems and small cases do.' },
            { text: 'Because Lean checks that definitions match their names.', misconception: 'lean-checks-format', why: 'Lean never reads names. It only checks that the definition is well-formed.' },
          ],
        },

        `### Steps 3 and 4: hypotheses, and step 1: axioms

The statement has no hypotheses, only the variable n (“for every n”). Nothing to be vacuous, nothing circular.

\`\`\`lean mathlib
import Mathlib.Data.Nat.Prime.Infinite

#print axioms Nat.exists_infinite_primes
\`\`\`

> \`'Nat.exists_infinite_primes' depends on axioms: [propext, Classical.choice, Quot.sound]\``,

        {
          id: 'a2-q4',
          prompt: 'The proof depends on `Classical.choice`. Is that a problem?',
          options: [
            { text: 'No: it is one of the three standard axioms that all of ordinary mathematics in Lean rests on.', correct: true, why: '`propext`, `Classical.choice` and `Quot.sound` are expected. Only other names, or `sorryAx`, are red flags.' },
            { text: 'Yes: any axiom means something was assumed without proof.', misconception: 'axiom-is-proof', why: 'Every mathematical proof rests on some foundations. These three are Lean’s standard ones, shared by all of Mathlib.' },
          ],
        },

        `### Step 5: read the proof

Euclid’s argument fits in a few lines. This is Mathlib’s proof, copied under a new name so it runs here:

\`\`\`lean mathlib
${EUCLID}
\`\`\`

Read it as a story:

- Take the number n! + 1 (n factorial plus one: 1 · 2 · … · n + 1).
- Let p be its **smallest prime factor** (\`minFac\`). It is prime (\`pp\`).
- Why is p ≥ n (\`np\`)? Suppose p ≤ n. Then p is one of the factors of n!, so p divides n! (\`h₁\`). It also divides n! + 1, so it divides their difference, 1 (\`h₂\`). But no prime divides 1.`,

        {
          id: 'a2-q5',
          prompt: 'Why must the prime p (the smallest prime factor of n! + 1) be at least n?',
          options: [
            { text: 'If p ≤ n, p divides n!, and it divides n! + 1, so it would divide 1, which no prime does.', correct: true, why: 'That is `h₁`, `h₂` and `pp.not_dvd_one` in the proof.' },
            { text: 'Because n! + 1 is always prime, and it is bigger than n.', misconception: 'testing-vs-proof', why: 'n! + 1 is often not prime: 4! + 1 = 25 = 5 · 5. The proof never claims it is; it only takes its smallest prime factor.' },
            { text: 'Because p is the largest prime.', misconception: 'quantifier-order', why: 'There is no largest prime; that is the whole point. p is just the smallest prime factor of one particular number.' },
          ],
        },

        `Try it on n = 4 with \`#eval\`:

\`\`\`lean mathlib
import Mathlib.Data.Nat.Prime.Infinite

#eval Nat.factorial 4 + 1
#eval Nat.minFac (Nat.factorial 4 + 1)
\`\`\`

4! + 1 = 25, which is not prime, and its smallest prime factor is 5 ≥ 4. The proof finds the prime 5, not 25.`,

        {
          id: 'a2-q6',
          prompt: 'Final verdict on `Nat.exists_infinite_primes`?',
          options: [
            { text: 'It passes: the statement says “infinitely many”, `Nat.Prime` is the right notion, there are no hypotheses, and only standard axioms.', correct: true, why: 'Every step of the checklist came out clean, and a second statement (`{p | Nat.Prime p}.Infinite`) agrees.' },
            { text: 'It fails: the word “infinite” does not appear in the statement.', misconception: 'statement-drift', why: 'Infinity can be stated in several equivalent ways. “Above every n there is a prime” is one of them.' },
            { text: 'It cannot be judged without checking every line of the proof yourself.', misconception: 'proof-reading', why: 'Lean’s kernel checked every line. Your job was the statement, definitions, hypotheses and axioms, and all were fine.' },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────────────────── Case 3: Fermat
    {
      day: 33,
      label: 'Case 3',
      title: 'Fermat’s Last Theorem and four fake proofs',
      goal: 'Read Mathlib’s statement of Fermat’s Last Theorem, then audit four AI-style “proofs” of it and find each trick.',
      cards: [],
      questions: [],
      flow: [
        `### The claim

**Fermat’s Last Theorem**: for any whole number n ≥ 3, there are no positive whole numbers a, b, c with aⁿ + bⁿ = cⁿ.

Fermat wrote it in a margin around 1637. Andrew Wiles proved it in 1994, with Richard Taylor, using hundreds of pages of advanced mathematics. A full Lean proof is a large ongoing project.

So if an AI tells you “I proved Fermat’s Last Theorem in Lean, here is the file”, something is almost certainly off. Today you find out exactly what. First, the honest statement.`,

        `### Step 1: Mathlib’s statement

Mathlib defines the statement in three layers:

\`\`\`lean mathlib
import Mathlib.NumberTheory.FLT.Four

#print FermatLastTheorem
#print FermatLastTheoremFor
#print FermatLastTheoremWith
\`\`\`

> \`FermatLastTheorem := ∀ n ≥ 3, FermatLastTheoremFor n\`
>
> \`FermatLastTheoremFor n := FermatLastTheoremWith ℕ n\`
>
> \`FermatLastTheoremWith R n := ∀ (a b c : R), a ≠ 0 → b ≠ 0 → c ≠ 0 → a ^ n + b ^ n ≠ c ^ n\`

(Lean’s answers, tidied a little.) Read from the bottom up: in the numbers R, nonzero a, b, c never satisfy aⁿ + bⁿ = cⁿ. Over ℕ that is the theorem for one n, and \`FermatLastTheorem\` says it for every n ≥ 3.`,

        {
          id: 'a3-q1',
          prompt: 'Why does the definition include `a ≠ 0 → b ≠ 0 → c ≠ 0 →`?',
          options: [
            { text: 'Without them the claim is false: take a = 0, then 0ⁿ + cⁿ = cⁿ.', correct: true, why: 'The theorem is about positive numbers. Over ℕ, “nonzero” is the same as “positive”.' },
            { text: 'They are decoration and could be removed.', misconception: 'definition-trust', why: 'Remove them and the statement becomes false (a = 0, b = c), so nobody could prove it. Every condition in a definition matters.' },
            { text: 'They make the statement vacuous.', misconception: 'vacuous-truth', why: 'Nonzero numbers obviously exist, so these conditions can hold. They only exclude the trivial solutions with a zero.' },
          ],
        },

        {
          id: 'a3-q2',
          prompt: 'How do you read `∀ n ≥ 3, FermatLastTheoremFor n`?',
          options: [
            { text: 'For every n, if n ≥ 3, then Fermat holds for n.', correct: true, why: '`∀ n ≥ 3, P n` is short for `∀ n, n ≥ 3 → P n`.' },
            { text: 'For every n, n ≥ 3 and Fermat holds for n.', misconception: 'bounded-quantifier', why: 'That would claim every n is at least 3, which is false. The bound is an “if”.' },
          ],
        },

        `### A definition is not a proof

Lean accepted \`def FermatLastTheorem : Prop := …\`. That only means the statement is well-formed. A \`def\` of a \`Prop\` **writes the claim down**; it proves nothing.

What Mathlib does prove are special cases, each a real \`theorem\`:

\`\`\`lean mathlib
import Mathlib.NumberTheory.FLT.Four

#check fermatLastTheoremFour
#print axioms fermatLastTheoremFour
#check @FermatLastTheorem.of_odd_primes
\`\`\`

> \`fermatLastTheoremFour : FermatLastTheoremFor 4\`
>
> \`'fermatLastTheoremFour' depends on axioms: [propext, Classical.choice, Quot.sound]\`
>
> \`FermatLastTheorem.of_odd_primes : (∀ (p : ℕ), Nat.Prime p → Odd p → FermatLastTheoremFor p) → FermatLastTheorem\`

The proof for n = 4 is a few hundred lines (and there is one for n = 3). You did not read it, and you do not need to: you read its statement, its definitions, and its axioms.

The last one is honest and useful: *if* Fermat holds for every odd prime exponent, then it holds for all n ≥ 3. Remember it.`,

        {
          id: 'a3-q3',
          prompt: 'Lean accepts `def FermatLastTheorem : Prop := ∀ n ≥ 3, FermatLastTheoremFor n` in Mathlib. Does that mean Mathlib proves Fermat’s Last Theorem?',
          options: [
            { text: 'No: a `def` of a `Prop` only states the claim. Mathlib proves the cases n = 3 and n = 4.', correct: true, why: 'Only a `theorem` with a proof (no `sorry`, standard axioms) proves something.' },
            { text: 'Yes: Lean checked it.', misconception: 'statement-not-proof', why: 'Lean checked that the statement makes sense, not that it is true. You can define false statements just as easily.' },
          ],
        },

        {
          id: 'a3-q4',
          prompt: 'To trust `fermatLastTheoremFour`, what do you need to check?',
          options: [
            { text: 'Its statement and the definitions it uses, and `#print axioms`. Not the proof’s lines.', correct: true, why: 'Lean’s kernel checks every step. Fakes hide in what is claimed and what is assumed, not in the steps.' },
            { text: 'Every line of its proof, by hand.', misconception: 'proof-reading', why: 'Lean already checked every line. Reading them may teach you mathematics, but it is not where an audit finds problems.' },
          ],
        },

        `### Fake proof 1

Now the AI’s files. Each one is accepted by Lean, and each is called \`fermat_last_theorem\`. Here is the first. Press **Open in Lab**, then **Audit**, and see what the automatic checks say:

\`\`\`lean mathlib
${FLT_RENAMED}
\`\`\`

The audit reports **no red flags**. The proof is a real Mathlib theorem. And yet…`,

        {
          id: 'a3-q5',
          prompt: 'What is wrong with fake proof 1?',
          code: FLT_RENAMED,
          mathlib: true,
          options: [
            { text: 'Its hypothesis `hprimes` is Fermat for every odd prime exponent: the hard part of the theorem, assumed.', correct: true, why: 'This is `FermatLastTheorem.of_odd_primes` renamed. Mathlib names it honestly, as a reduction. Called `fermat_last_theorem`, it claims what it assumes.' },
            { text: 'Nothing: the audit found no red flags.', misconception: 'automation-strength', why: 'The audit cannot know that `hprimes` is as hard as the conclusion. That judgment (checklist step 4) is yours.' },
            { text: 'It is vacuous: no p can be both prime and odd.', misconception: 'vacuous-truth', why: '3, 5 and 7 are odd primes. The hypothesis can hold; the problem is that nobody can supply it without proving Fermat.' },
          ],
        },

        `### Fake proof 2

\`\`\`lean mathlib sorry
${FLT_SORRY}
\`\`\`

Lean shows one yellow warning, on the helper lemma, not on \`fermat_last_theorem\` itself.`,

        {
          id: 'a3-q6',
          prompt: 'What does `#print axioms fermat_last_theorem` show for fake proof 2, and what does it mean?',
          code: FLT_SORRY,
          codeExpect: 'sorry',
          mathlib: true,
          options: [
            { text: 'It lists `sorryAx`: the helper was never proved, so neither is the main theorem.', correct: true, why: '`#print axioms` follows every lemma used. The `sorry` in `flt_odd_prime` shows up as `sorryAx`. Run it to see.' },
            { text: 'Only the standard axioms: the main theorem itself has no `sorry`.', misconception: 'warning-is-fine', why: 'A theorem is only as proved as the lemmas it uses. The skipped proof travels with it.' },
          ],
        },

        `### Fake proof 3

\`\`\`lean mathlib
${FLT_EXISTS}
\`\`\`

No \`sorry\`, standard axioms, and the audit finds no red flags (it only notes that \`hn\` is never used). Read the statement out loud.`,

        {
          id: 'a3-q7',
          prompt: 'What is wrong with fake proof 3?',
          code: FLT_EXISTS,
          mathlib: true,
          options: [
            { text: 'It says *some* a, b, c fail the equation (∃). Fermat says *no* nonzero a, b, c satisfy it (∀).', correct: true, why: 'a = b = c = 1 gives 1 + 1 ≠ 1, and that is the entire proof. The claim needs every triple.' },
            { text: 'Nothing: it says the equation fails for n ≥ 3.', misconception: 'statement-drift', why: 'It says the equation fails for *one* triple. Fermat’s claim is about every triple.' },
            { text: 'The proof is too short to be real, so Lean must have made a mistake.', misconception: 'lean-checks-format', why: 'Lean made no mistake: the proof really proves this statement. The statement is just much weaker than the claim.' },
          ],
        },

        `### Fake proof 4

\`\`\`lean mathlib
${FLT_VACUOUS}
\`\`\`

This one uses Mathlib’s own statement, \`FermatLastTheoremFor n\`, and a one-word proof.`,

        {
          id: 'a3-q8',
          prompt: 'What is wrong with fake proof 4?',
          code: FLT_VACUOUS,
          mathlib: true,
          options: [
            { text: 'The hypotheses contradict each other: n ≥ 3 makes n · n at least 9, so no n satisfies both.', correct: true, why: 'The theorem never applies to any n, so it says nothing. `nlinarith` succeeds only because of the contradiction. The audit flags it.' },
            { text: '`nlinarith` is a powerful tactic, so this is a real proof of Fermat.', misconception: 'automation-strength', why: 'A one-word proof of a famous theorem means the statement is easy, here because it is vacuous.' },
            { text: 'Nothing: the conclusion is Mathlib’s own `FermatLastTheoremFor n`.', misconception: 'hypothesis-is-fact', why: 'The conclusion is honest, but it is only promised for n satisfying both hypotheses, and there is none.' },
          ],
        },

        `### The verdict, and what you just did

Four fakes, four different tricks, mapped to the checklist:

1. **A hypothesis that carries the claim**: step 4. The automatic checks saw nothing; only reading caught it.
2. **A hidden \`sorry\`**: step 1, caught by \`#print axioms\` and the audit.
3. **A weaker statement** (∃ instead of ∀): step 2. Only reading the statement out loud caught it.
4. **Impossible hypotheses**: step 3, caught by the audit.

Two of the four passed every automatic check. That is why the audit tool lists what it checked and what is **your turn**, and why this course taught you to read.

And the honest status, in this version of Mathlib: Fermat’s Last Theorem is **stated** (\`FermatLastTheorem\`), the cases **n = 3 and n = 4 are proved**, and it is **reduced to odd prime exponents**. The full proof is being formalized in a separate project.`,
      ],
    },
  ],
}
