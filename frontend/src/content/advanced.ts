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
      questions: [
        {
          id: 'a1-q1',
          prompt: 'Which English sentence says what `∀ {α} (f : α → Set α), ¬ Function.Surjective f` says?',
          options: [
            { text: 'For every type α and every way f of assigning subsets to elements, f does not hit every subset.', correct: true, why: '`∀` covers every α and every f, and `¬ Function.Surjective f` says f is not onto: some subset is missed.' },
            { text: 'For every type α, there is no function from α to its subsets.', misconception: 'statement-drift', why: 'Functions from α to its subsets exist (send each a to the subset {a}). The claim is only that none of them hits every subset.' },
            { text: 'There is some type α and some f that misses a subset.', misconception: 'free-variable', why: 'That would be an `∃` claim, easy and much weaker. The `∀` makes it a claim about every α and every f.' },
          ],
        },
        {
          id: 'a1-q2',
          prompt: 'Using the printed definition, what does `¬ Function.Surjective f` say?',
          options: [
            { text: 'There is some subset b such that no a has f a = b.', correct: true, why: '`¬ ∀ b, ∃ a, f a = b` is the same as `∃ b, ¬ ∃ a, f a = b`: some subset is never hit.' },
            { text: 'No subset is hit by f at all.', misconception: 'not-scope', why: 'The `¬` is in front of the whole `∀ b, …`. Not every subset is hit, but many can be. Saying “none is hit” would put the `¬` inside.' },
            { text: 'f sends two different elements to the same subset.', misconception: 'definition-trust', why: 'That is about being one-to-one (injective), a different definition. Read the printed body: it is about every b being hit.' },
          ],
        },
        {
          id: 'a1-q3',
          prompt: 'Could this theorem be vacuous, because maybe no function `f : α → Set α` exists?',
          options: [
            { text: 'No: f is a variable (“for every f”), not a hypothesis; and such functions do exist anyway.', correct: true, why: 'There are no hypotheses at all. And for any α, `fun a => {a}` is a function from α to its subsets.' },
            { text: 'Yes: if no such f exists, the theorem says nothing.', misconception: 'vacuous-truth', why: 'Functions like `fun a => {a}` always exist. More importantly, f is not an assumption: the claim is about every f you could pick.' },
          ],
        },
        {
          id: 'a1-q4',
          prompt: 'Which `#print axioms` output would make you stop trusting a theorem?',
          options: [
            { text: '`depends on axioms: [propext, sorryAx, Quot.sound]`', correct: true, why: '`sorryAx` means a `sorry` somewhere in the proof or in a lemma it uses: part of it was skipped.' },
            { text: '`does not depend on any axioms`', misconception: 'axiom-is-proof', why: 'No axioms is the strongest possible result: the proof needs nothing beyond Lean’s logic.' },
            { text: '`depends on axioms: [propext, Classical.choice, Quot.sound]`', misconception: 'axiom-is-proof', why: 'These three are the standard foundations of ordinary mathematics in Lean. Seeing them is normal.' },
          ],
        },
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
      questions: [
        {
          id: 'a2-q1',
          prompt: 'Why does `∀ n, ∃ p, n ≤ p ∧ Nat.Prime p` mean “there are infinitely many primes”?',
          options: [
            { text: 'Above every number there is a prime. If there were only finitely many primes, there would be none above the largest one.', correct: true, why: 'Unbounded is the same as infinite for sets of natural numbers. The `∀ n` rules out a largest prime.' },
            { text: 'It says every number n is prime.', misconception: 'free-variable', why: 'The prime is p, which comes from `∃ p` and may depend on n. n itself need not be prime.' },
            { text: 'It only says there is at least one prime.', misconception: 'quantifier-order', why: 'That would be `∃ p, Nat.Prime p`. Here a new prime is promised above *every* n, so there are infinitely many.' },
          ],
        },
        {
          id: 'a2-q2',
          prompt: 'An AI claims it proved “infinitely many primes”, and shows one of these. Which one actually says it?',
          options: [
            { text: '`∀ n, ∃ p, n ≤ p ∧ Nat.Prime p`', correct: true, why: 'A prime at or above every n: no largest prime, so infinitely many.' },
            { text: '`∀ n, ∃ p, p ≤ n + 2 ∧ Nat.Prime p`', misconception: 'statement-drift', why: 'The prime only has to be *below* n + 2, and p = 2 always works. One prime is enough to prove this.' },
            { text: '`∃ p, Nat.Prime p`', misconception: 'statement-drift', why: 'This says a single prime exists. `⟨2, Nat.prime_two⟩` proves it.' },
          ],
        },        {
          id: 'a2-q3',
          prompt: 'How do you know Mathlib’s `Nat.Prime` does not count 1 as prime, like the broken `IsPrime` of Day 25?',
          options: [
            { text: 'Mathlib proves `Nat.not_prime_one`, and `Nat.prime_def` says a prime is at least 2.', correct: true, why: 'Theorems about a definition are evidence about what it means. Testing small cases is the other half.' },
            { text: 'Because it is called `Prime`.', misconception: 'definition-trust', why: 'Day 25’s `IsPrime` was called that too. Names prove nothing; theorems and small cases do.' },
            { text: 'Because Lean checks that definitions match their names.', misconception: 'lean-checks-format', why: 'Lean never reads names. It only checks that the definition is well-formed.' },
          ],
        },
        {
          id: 'a2-q4',
          prompt: 'The proof depends on `Classical.choice`. Is that a problem?',
          options: [
            { text: 'No: it is one of the three standard axioms that all of ordinary mathematics in Lean rests on.', correct: true, why: '`propext`, `Classical.choice` and `Quot.sound` are expected. Only other names, or `sorryAx`, are red flags.' },
            { text: 'Yes: any axiom means something was assumed without proof.', misconception: 'axiom-is-proof', why: 'Every mathematical proof rests on some foundations. These three are Lean’s standard ones, shared by all of Mathlib.' },
          ],
        },
        {
          id: 'a2-q5',
          prompt: 'Why must the prime p (the smallest prime factor of n! + 1) be at least n?',
          options: [
            { text: 'If p ≤ n, p divides n!, and it divides n! + 1, so it would divide 1, which no prime does.', correct: true, why: 'That is `h₁`, `h₂` and `pp.not_dvd_one` in the proof.' },
            { text: 'Because n! + 1 is always prime, and it is bigger than n.', misconception: 'testing-vs-proof', why: 'n! + 1 is often not prime: 4! + 1 = 25 = 5 · 5. The proof never claims it is; it only takes its smallest prime factor.' },
            { text: 'Because p is the largest prime.', misconception: 'quantifier-order', why: 'There is no largest prime; that is the whole point. p is just the smallest prime factor of one particular number.' },
          ],
        },
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
      questions: [
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
        },      ],
    },
  ],
}
