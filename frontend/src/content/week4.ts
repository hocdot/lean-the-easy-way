import type { Week } from './types.ts'

// Files shown more than once (in cards and in questions). Every one is run by the test.

const COLLATZ = `/-- One step of the Collatz process: halve an even number, send an odd n to 3n + 1. -/
def step (n : Nat) : Nat := if n % 2 = 0 then n / 2 else 3 * n + 1

/-- Apply \`step\` k times. -/
def steps : Nat → Nat → Nat
  | 0, n => n
  | k + 1, n => steps k (step n)

/-- n reaches 1 after some number of steps. -/
def ReachesOne (n : Nat) : Prop := ∃ k, steps k n = 1

/-- The Collatz conjecture: every positive number reaches 1. -/
theorem collatz_conjecture (n : Nat) (hn : n > 0)
    (h_descent : ∀ m, m > 1 → step m < m) : ReachesOne n := by
  induction n using Nat.strongRecOn with
  | _ n ih =>
    if h1 : n = 1 then
      exact ⟨0, h1⟩
    else
      have hlt : step n < n := h_descent n (by omega)
      have hpos : step n > 0 := by
        unfold step
        split <;> omega
      obtain ⟨k, hk⟩ := ih (step n) hlt hpos
      exact ⟨k + 1, hk⟩`

const STEP_DEF = `def step (n : Nat) : Nat := if n % 2 = 0 then n / 2 else 3 * n + 1`

const QUADRATIC_FULL = `theorem quadratic_all_solutions (x : Int) : x * x = x + 6 ↔ x = 3 ∨ x = -2 := by
  constructor
  · intro h
    have h1 : (x - 3) * (x + 2) = 0 := by
      rw [Int.sub_mul, Int.mul_add, Int.mul_add]
      omega
    rcases Int.mul_eq_zero.mp h1 with h2 | h2
    · left; omega
    · right; omega
  · rintro (rfl | rfl) <;> decide`

const IS_PRIME_BOOL = `def isPrime (n : Nat) : Bool := n ≥ 2 && (List.range (n - 2)).all (fun k => n % (k + 2) != 0)`

export const week4: Week = {
  week: 4,
  title: 'Auditing a proof',
  summary:
    'Check Lean written by someone else, or by an AI: is it really proved, can its hypotheses hold, do they assume the answer, do the definitions mean what they say, and is the statement the claim?',
  lessons: [
    // ─────────────────────────────────────────────────────────────── Day 22
    {
      day: 22,
      title: 'What does “proved” mean?',
      goal: 'Tell a finished proof from one that skips steps or assumes things, using `#print axioms` and the Lab’s Audit.',
      questions: [
        {
          id: 'd22-q1',
          prompt: 'An AI sends this file and says “compiles, no errors”. Lean shows one yellow warning. Is the theorem proved?',
          code: `theorem sum_of_odds (n : Nat) : n * n = n * n + 0 := by
  sorry`,
          codeExpect: 'sorry',
          options: [
            { text: 'No: the warning says the proof uses `sorry`, so nothing is proved.', correct: true, why: '`sorry` skips the proof. Lean reports it as a warning only so that you can keep working on the rest of a file.' },
            { text: 'Yes: there are no errors, only a warning.', misconception: 'warning-is-fine', why: 'A `sorry` warning is not harmless like a style warning. It means the proof is missing.' },
            { text: 'Yes: the statement is obviously true, so the `sorry` does not matter.', misconception: 'warning-is-fine', why: 'Whether the statement is true is exactly what a proof is for. With `sorry`, Lean checked nothing. (This one happens to be true, but a false statement with `sorry` looks the same.)' },
          ],
        },
        {
          id: 'd22-q2',
          prompt: '`#print axioms final_theorem` shows `[propext, sorryAx, Quot.sound]`. There is no `sorry` written anywhere in the proof of `final_theorem`. What do you conclude?',
          options: [
            { text: 'Some lemma that `final_theorem` uses (directly or indirectly) contains `sorry`, so it is not proved.', correct: true, why: '`#print axioms` follows every lemma the proof uses. `sorryAx` anywhere in that chain means a step was skipped.' },
            { text: 'It is proved: there is no `sorry` in its own proof.', misconception: 'warning-is-fine', why: 'A theorem is only as proved as the lemmas it relies on. The `sorry` is in one of them, which is why the warning appeared elsewhere.' },
            { text: 'It is proved: all three are standard axioms.', misconception: 'axiom-is-proof', why: 'Only `propext`, `Classical.choice` and `Quot.sound` are standard. `sorryAx` is how `sorry` appears.' },
          ],
        },
        {
          id: 'd22-q3',
          prompt: 'Lean accepts this file with no warnings. What is the problem?',
          code: `axiom key_estimate : ∀ n : Nat, 2 ^ n ≥ n * n

theorem growth (n : Nat) : 2 ^ n ≥ n * n := key_estimate n`,
          options: [
            { text: '`key_estimate` is assumed, not proved, and it is false (n = 3: 8 is not ≥ 9). So `growth` proves nothing.', correct: true, why: 'An `axiom` is taken on faith. Here the faith is misplaced: 2³ = 8 but 3 · 3 = 9. `#print axioms growth` would show `[key_estimate]`.' },
            { text: 'There is no problem: an axiom is a basic fact, like a theorem.', misconception: 'axiom-is-proof', why: 'An axiom is not checked by anyone. This one is even false, and Lean accepted it anyway.' },
            { text: 'There is no problem: Lean would have shown a warning otherwise.', misconception: 'warning-is-fine', why: 'Axioms produce no warning at all. Only `#print axioms` (or the Lab’s Audit) shows them.' },
          ],
        },
        {
          id: 'd22-q4',
          prompt: 'Which `#print axioms` result means the theorem is fully proved by ordinary mathematics?',
          options: [
            { text: '`[propext, Classical.choice, Quot.sound]`', correct: true, why: 'These three are the standard axioms that all of ordinary mathematics in Lean rests on.' },
            { text: '`[propext, sorryAx]`', misconception: 'warning-is-fine', why: '`sorryAx` means a `sorry` was used somewhere in the proof.' },
            { text: '`[propext, main_lemma]`', misconception: 'axiom-is-proof', why: '`main_lemma` is not a standard axiom. Someone declared it with `axiom`, so it was assumed, not proved.' },
          ],
        },
        {
          id: 'd22-q5',
          prompt: 'Lean accepts this. What does it show?',
          code: `axiom oops : 0 = 1

theorem anything : 2 + 2 = 5 := by
  have := oops
  omega`,
          options: [
            { text: 'A false axiom lets you prove anything, even `2 + 2 = 5`.', correct: true, why: 'From `0 = 1`, `omega` can derive any arithmetic fact. Lean trusts the axiom, so it accepts the result.' },
            { text: 'That `2 + 2 = 5` is true in Lean.', misconception: 'accepted-means-true', why: 'The theorem rests on `oops`, which is false. Without it, `2 + 2 = 5` cannot be proved.' },
            { text: 'Lean is broken: it should have checked the axiom.', misconception: 'axiom-is-proof', why: 'Checking is exactly what `axiom` switches off. That is why an auditor must look for axioms.' },
          ],
        },
        {
          id: 'd22-q6',
          prompt: 'The Lab’s Audit says “Trusts compiled code” for a theorem proved `by native_decide`. What does that mean?',
          options: [
            { text: 'A program computed the answer and Lean trusted it, instead of checking every step itself. Usually fine, but it is extra trust.', correct: true, why: '`native_decide` adds an axiom saying “the compiled program is right”. It is a smaller risk than `sorry`, but it is not the full guarantee.' },
            { text: 'The proof is missing, like `sorry`.', misconception: 'warning-is-fine', why: 'The computation was really done; only its checking was handed to compiled code. That is weaker than a kernel check, but it is not a skipped proof.' },
            { text: 'Nothing: compiled code is the same as a proof.', misconception: 'axiom-is-proof', why: 'Compiled code can have bugs that Lean’s checker would catch. That is why the audit flags it.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 23
    {
      day: 23,
      title: 'Hypotheses that can never hold',
      goal: 'Recognize hypotheses that contradict each other or can never be true, and say why the theorem is then empty.',
      questions: [
        {
          id: 'd23-q1',
          prompt: 'An AI announces it has solved the twin prime conjecture. Lean accepts the file. What is the problem?',
          code: `theorem twin_primes_solved (n : Nat) (h1 : n > 10) (h2 : n < 10) :
    ∃ p, p > n ∧ p + 2 > n := by omega`,
          options: [
            { text: 'The hypotheses contradict each other (no n is above 10 and below 10), so the theorem says nothing.', correct: true, why: 'With impossible hypotheses, any conclusion is “proved”. The Lab’s Audit reports “Hypotheses contradict each other” here.' },
            { text: 'Nothing: Lean accepted it, so twin primes are solved.', misconception: 'accepted-means-true', why: 'Lean only checked that the conclusion follows from the hypotheses. They can never hold, so nothing follows about any real number.' },
            { text: 'The conclusion is false.', misconception: 'vacuous-truth', why: 'The conclusion does not matter here: it is never reached. Even a true conclusion would tell you nothing, because the theorem can never be applied.' },
            { text: '`omega` is too weak for number theory, so the proof must be wrong.', misconception: 'automation-strength', why: 'The proof is correct. `omega` succeeds because the hypotheses are impossible, not because it solved anything.' },
          ],
        },
        {
          id: 'd23-q2',
          prompt: 'One of these tactics finishes the proof, even though `x = 12345` is false for almost every x. Which one?',
          code: `theorem t (x : Nat) (h : x + 1 = 0) : x = 12345 := by
  ???`,
          fillIn: true,
          options: [
            { text: '`omega`', correct: true, why: '`omega` sees that `x + 1 = 0` is impossible on `Nat`, and from an impossible hypothesis it can prove anything.' },
            { text: '`rfl`', misconception: 'tactic-meaning', why: '`rfl` needs both sides to compute to the same value. `x` and `12345` do not, so it fails.' },
            { text: '`decide`', misconception: 'tactic-meaning', why: '`decide` computes, and it cannot compute with an unknown x. It also ignores hypotheses.' },
          ],
        },
        {
          id: 'd23-q3',
          prompt: 'For a natural number `n`, which of these hypotheses **can** hold?',
          options: [
            { text: '`n - 5 = 0`', correct: true, why: 'Take n = 3: on `Nat`, 3 − 5 stops at 0. So this hypothesis is satisfiable (by every n ≤ 5).' },
            { text: '`n < 0`', misconception: 'nat-subtraction', why: 'A natural number is never below 0. A theorem with this hypothesis is vacuous.' },
            { text: '`n ≠ n`', misconception: 'hypothesis-is-fact', why: 'Every n equals itself, so `n ≠ n` never holds. Writing it as a hypothesis does not make it possible.' },
            { text: '`n + 1 = 0`', misconception: 'hypothesis-is-fact', why: '`n + 1` is at least 1, so this never holds.' },
          ],
        },
        {
          id: 'd23-q4',
          prompt: 'Lean accepts this, and the Lab’s Audit finds no contradiction. What is the problem?',
          code: `theorem every_number_zero (n : Nat) (h : ∀ m : Nat, m > 5) : n = 0 := by
  have := h 0
  omega`,
          options: [
            { text: '`h` claims every natural number is above 5, which is false (m = 0). So the theorem is vacuous.', correct: true, why: 'The proof itself does it: `h 0` gives `0 > 5`, and from that `omega` proves anything.' },
            { text: '`h` means “for every m above 5”, a normal condition.', misconception: 'bounded-quantifier', why: 'That would be `∀ m > 5, …`, short for `∀ m, m > 5 → …`. Here `h` says `m > 5` for every m, with no “if”.' },
            { text: 'Nothing: the audit found no contradiction, so the hypotheses can hold.', misconception: 'automation-strength', why: 'The audit only tries a few tactics. Finding this contradiction needs the idea “try m = 0”. No red flag is not a proof of consistency.' },
          ],
        },
        {
          id: 'd23-q5',
          prompt: 'The Audit reports “Hypotheses contradict each other” for a theorem whose conclusion is a famous open problem. What does the theorem tell you about the open problem?',
          options: [
            { text: 'Nothing: it can never be applied, because its hypotheses never all hold.', correct: true, why: 'A theorem with contradictory hypotheses proves every conclusion equally well, so it carries no information about this one.' },
            { text: 'That the open problem is solved, at least in some cases.', misconception: 'vacuous-truth', why: 'There are no cases: no situation satisfies all the hypotheses.' },
            { text: 'That the hypotheses are true, since Lean checked the theorem.', misconception: 'hypothesis-is-fact', why: 'Hypotheses are assumptions, never checked. Here they are not even possible.' },
          ],
        },
        {
          id: 'd23-q6',
          prompt: 'You want to check that the hypotheses `(n : Nat) (h1 : n > 2) (h2 : n % 2 = 1)` can all hold. What is the best check?',
          options: [
            { text: 'Find one n that satisfies both, for example n = 3.', correct: true, why: '3 > 2 and 3 % 2 = 1. One example is enough to show the hypotheses are consistent.' },
            { text: 'Check that the theorem is accepted by Lean.', misconception: 'hypothesis-is-fact', why: 'Lean accepts theorems with impossible hypotheses too. Acceptance says nothing about whether the hypotheses can hold.' },
            { text: 'Check that the proof is long, not a single `omega`.', misconception: 'automation-strength', why: 'A short proof is a reason to look closer, but proof length does not decide anything. Find an example.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 24
    {
      day: 24,
      title: 'Hypotheses that assume the answer',
      goal: 'Spot hypotheses that restate the conclusion or carry the hard part of the problem.',
      questions: [
        {
          id: 'd24-q1',
          prompt: 'What is the problem with this theorem?',
          code: 'theorem odd_square (n : Nat) (h : n % 2 = 1) (hsq : n * n % 2 = 1) : n * n % 2 = 1 := hsq',
          options: [
            { text: 'The hypothesis `hsq` is the conclusion, so the theorem is P → P.', correct: true, why: 'The proof is `hsq` itself: “you told me so”. The Audit reports “Assumes its own conclusion”.' },
            { text: 'The hypotheses contradict each other.', misconception: 'vacuous-truth', why: 'They can both hold: n = 3 gives 3 % 2 = 1 and 9 % 2 = 1. The problem is circularity, not contradiction.' },
            { text: 'Nothing: `hsq` is a different hypothesis from `h`, so it is fine.', misconception: 'hypothesis-does-the-work', why: 'Being different from `h` does not matter. `hsq` is exactly what the theorem claims to prove.' },
          ],
        },
        {
          id: 'd24-q2',
          prompt: 'The claim is “n · n + n is always even”. The Audit finds no red flags. What is wrong?',
          code: 'theorem sum_even (n : Nat) (h : (n * n + n) % 2 = 0) : 2 ∣ n * n + n := by omega',
          options: [
            { text: 'The hypothesis restates the claim in other words, so the theorem is P → P in disguise.', correct: true, why: '“The remainder by 2 is 0” and “2 divides it” say the same thing. The hard part (why it is even) was assumed.' },
            { text: 'Nothing: the hypothesis is not literally the conclusion, so it is harmless.', misconception: 'hypothesis-does-the-work', why: 'A hypothesis can say the same thing as the conclusion with different symbols. The Audit only catches exact copies.' },
            { text: '`omega` cannot handle `n * n`, so the proof is wrong.', misconception: 'automation-strength', why: 'The proof is correct: `omega` treats `n * n + n` as one unknown, and the step from “remainder 0” to “divisible by 2” is easy. That is the sign the hypothesis did the work.' },
          ],
        },
        {
          id: 'd24-q3',
          prompt: 'In the `goldbach` theorem from the cards, which hypothesis carries the whole difficulty?',
          code: `def IsPrime (p : Nat) : Prop := p ≥ 2 ∧ ∀ d, d ∣ p → d = 1 ∨ d = p

theorem goldbach (n : Nat) (h2 : n > 2) (heven : n % 2 = 0)
    (key : ∀ m, m > 2 → m % 2 = 0 → ∃ p q, IsPrime p ∧ IsPrime q ∧ p + q = m) :
    ∃ p q, IsPrime p ∧ IsPrime q ∧ p + q = n :=
  key n h2 heven`,
          options: [
            { text: '`key`: it is Goldbach’s conjecture itself, for every m.', correct: true, why: 'The proof only plugs n into `key`. All the mathematics is assumed.' },
            { text: '`h2`: it restricts n to numbers above 2.', misconception: 'hypothesis-does-the-work', why: '`h2` is part of the claim (“every even number above 2”). It is a normal condition.' },
            { text: 'None: Lean accepted it, so Goldbach is proved.', misconception: 'accepted-means-true', why: 'Lean checked “if Goldbach holds, it holds for n”. That is trivially true and proves nothing about Goldbach.' },
          ],
        },
        {
          id: 'd24-q4',
          prompt: 'For the `goldbach` theorem, the Audit reports “One hypothesis carries the claim”, naming `key`. What should you conclude?',
          options: [
            { text: 'The proof only applies `key`. Whether that is acceptable depends on `key`, and here `key` is Goldbach itself, so nothing was proved.', correct: true, why: 'The Audit points at the hypothesis; judging whether it is known and easier is a question about mathematics, which is your job.' },
            { text: 'It is a minor style remark; the theorem still proves Goldbach’s conjecture.', misconception: 'hypothesis-does-the-work', why: 'The whole conjecture sits in `key`. A theorem that only applies an unproved hypothesis has proved nothing about it.' },
            { text: 'That `key` has been checked to be true.', misconception: 'hypothesis-is-fact', why: 'No one checks hypotheses. They are assumptions.' },
          ],
        },
        {
          id: 'd24-q5',
          prompt: 'A theorem about a fluid flow assumes `h_bound`: “the speed stays below some fixed bound for all time”, and concludes “the flow stays smooth for all time”. Experts say the bound is exactly the unsolved part. What was proved?',
          options: [
            { text: 'Only “if the hard part holds, then the conclusion holds”. The open problem is still open.', correct: true, why: 'The hard part was moved into a hypothesis. That can be a useful lemma, but it is not a solution.' },
            { text: 'The open problem, since `h_bound` is a different statement from the conclusion.', misconception: 'hypothesis-does-the-work', why: 'A hypothesis does not need to be identical to the conclusion to carry the difficulty. Here it does.' },
            { text: 'Nothing at all: the hypotheses must contradict each other.', misconception: 'vacuous-truth', why: 'Nothing suggests a contradiction: the bound is not known to be false, just not known to be true.' },
          ],
        },
        {
          id: 'd24-q6',
          prompt: 'The claim: “for every even n above 2, n is not prime”. Which hypothesis list matches the claim, with nothing extra?',
          options: [
            { text: '`(n : Nat) (h1 : n > 2) (h2 : n % 2 = 0)`', correct: true, why: 'These are exactly the conditions in the claim: above 2, and even.' },
            { text: '`(n : Nat) (h1 : n > 2) (h2 : n % 2 = 0) (h3 : 2 ∣ n ∧ 2 < n)`', misconception: 'hypothesis-does-the-work', why: '`h3` restates the other two. Harmless here, but a hypothesis that is not in the claim always needs a reason.' },
            { text: '`(n : Nat) (h1 : n > 2) (h2 : n % 2 = 0) (h3 : ∃ d, d ∣ n ∧ d ≠ 1 ∧ d ≠ n)`', misconception: 'hypothesis-does-the-work', why: '`h3` says n has a divisor other than 1 and n, which is what “not prime” means. It assumes the conclusion.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 25
    {
      day: 25,
      title: 'Definitions that lie',
      goal: 'Read the body of a definition instead of trusting its name, and notice junk values.',
      questions: [
        {
          id: 'd25-q1',
          prompt: 'What is wrong with this definition?',
          code: 'def IsPrime (n : Nat) : Prop := ∀ d, d ∣ n → d = 1 ∨ d = n',
          options: [
            { text: 'It counts 1 as prime: the condition n ≥ 2 is missing.', correct: true, why: 'The only divisor of 1 is 1, so “every divisor is 1 or n” holds for n = 1.' },
            { text: 'Nothing: it is called `IsPrime`, so it means prime.', misconception: 'definition-trust', why: 'The name is a label. Only the body counts, and the body lets 1 in.' },
            { text: 'Nothing: Lean would reject a wrong definition.', misconception: 'lean-checks-format', why: 'Lean checks that a definition is well-formed, not that it matches the idea in your head.' },
          ],
        },
        {
          id: 'd25-q2',
          prompt: 'What does Lean show?',
          code: `def isSorted : List Nat → Bool
  | a :: b :: _ => a ≤ b
  | _ => true

#eval isSorted [2, 9, 1, 0]`,
          options: [
            { text: '`true`', correct: true, why: '`isSorted` only compares the first two elements, 2 and 9.' },
            { text: '`false`', misconception: 'definition-trust', why: 'That is what a real sortedness check would say. This one stops after the first two elements.' },
          ],
        },
        {
          id: 'd25-q3',
          prompt: 'This is accepted. What is the problem?',
          code: `def IsPeriodic (f : Nat → Nat) : Prop := ∃ p, ∀ n, f (n + p) = f n

theorem squares_are_periodic : IsPeriodic (fun n => n * n) := ⟨0, fun _ => rfl⟩`,
          options: [
            { text: 'The definition allows p = 0, so every function is “periodic”.', correct: true, why: 'With p = 0 the condition is f(n) = f(n). A correct definition would require p > 0, and then n · n would not be periodic.' },
            { text: 'Nothing: squares are periodic, Lean proved it.', misconception: 'definition-trust', why: 'Lean proved the statement about *this* `IsPeriodic`, which is always true. The squares 0, 1, 4, 9, … never repeat.' },
            { text: 'The proof is too short to be right.', misconception: 'automation-strength', why: 'The proof is correct. It is short because the definition makes the statement trivial.' },
          ],
        },
        {
          id: 'd25-q4',
          prompt: 'Why is this accepted, when 6 / x = 0 has no solution on paper?',
          code: 'theorem solution_found : ∃ x : Nat, 6 / x = 0 := ⟨0, rfl⟩',
          options: [
            { text: 'In Lean, 6 / 0 = 0, a junk value, so x = 0 works.', correct: true, why: 'Division by zero gives 0 by convention. The statement is true only because of that.' },
            { text: 'Because 6 / x rounds down, and some large x gives 0.', misconception: 'division-convention', why: 'That is also true on `Nat` (x = 7 gives 0), but the witness given is 0, which works only by the junk value.' },
            { text: 'Because Lean refuses bad inputs, so x = 0 is not allowed and another x is used.', misconception: 'junk-values', why: 'Lean never refuses: `6 / 0` is defined, and equals 0. The proof uses exactly x = 0.' },
          ],
        },
        {
          id: 'd25-q5',
          prompt: 'This definition is meant to say “the sequence a gets as close as you like to L”. Lean accepts the theorem. What went wrong?',
          code: `def ConvergesTo (a : Nat → Nat) (L : Nat) : Prop :=
  ∀ ε > 0, ∃ N, ∀ n ≥ N, L - a n < ε

theorem everything_converges (a : Nat → Nat) : ConvergesTo a 0 :=
  fun ε hε => ⟨0, fun n _ => by omega⟩`,
          options: [
            { text: 'On `Nat`, `0 - a n` is always 0, so every sequence “converges” to 0.', correct: true, why: 'Subtraction stops at zero, and one-sided subtraction is not a distance. A correct definition would measure the distance both ways.' },
            { text: 'Nothing: the name says converges, so it converges.', misconception: 'definition-trust', why: 'The body decides the meaning. Here the body is true of every sequence, for example 0, 1, 2, 3, … .' },
            { text: '`L - a n` can be negative, so the definition is fine.', misconception: 'nat-subtraction', why: 'On `Nat` it cannot be negative: it stops at 0. That is exactly what makes the definition trivial at L = 0.' },
          ],
        },
        {
          id: 'd25-q6',
          prompt: 'The Lab’s Audit lists a `def` with “A definition: Lean checks that it is well-formed, not that it means what its name says.” What should you do?',
          options: [
            { text: 'Read its body and test it on small cases to see if it matches the intended meaning.', correct: true, why: 'That is the only way to catch a missing condition or a check that looks at too little.' },
            { text: 'Nothing: definitions cannot be wrong, only proofs can.', misconception: 'definition-trust', why: 'A definition cannot be “unproved”, but it can mean the wrong thing, which makes every theorem about it miss the point.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 26
    {
      day: 26,
      title: 'Proving something else',
      goal: 'Compare a statement with the claim word by word, and catch statements that are weaker or different.',
      questions: [
        {
          id: 'd26-q1',
          prompt: 'The claim: “every n has a larger number that is even”. What is the problem with this theorem?',
          code: 'theorem even_above : ∃ n : Nat, ∃ m, m > n ∧ m % 2 = 0 := ⟨0, 2, by decide⟩',
          options: [
            { text: 'It says only that **some** n has a larger even number (n = 0), not every n.', correct: true, why: 'The claim needs `∀ n, ∃ m, m > n ∧ m % 2 = 0`. The `∃ n` version is proved by a single example.' },
            { text: 'Nothing: it proves the claim.', misconception: 'statement-drift', why: '`∃ n` means “for some n”. The claim is about every n.' },
            { text: 'The order of the quantifiers is wrong: it should be `∃ m, ∀ n`.', misconception: 'quantifier-order', why: '`∃ m, ∀ n, m > n` would ask for one m above every n, which is false. The fix is `∀ n, ∃ m`.' },
          ],
        },
        {
          id: 'd26-q2',
          prompt: 'An AI says it proved that n · n + n + 41 is prime for every n. Its theorem is below, fully checked. What did it prove?',
          code: `${IS_PRIME_BOOL}

theorem euler_prime : ∀ n, n < 40 → isPrime (n * n + n + 41) = true := by
  decide +kernel`,
          options: [
            { text: 'Only the 40 cases n = 0 … 39. The claim is in fact false at n = 40.', correct: true, why: '40 · 40 + 40 + 41 = 1681 = 41 · 41. Checking a finite range is testing, even inside a theorem.' },
            { text: 'The claim: 40 cases in a row are enough evidence.', misconception: 'testing-vs-proof', why: 'Evidence is not proof, and here the very next case fails.' },
            { text: 'The claim, because `decide` checked every case.', misconception: 'statement-drift', why: '`decide` checked every case *of the statement*, which only covers n < 40.' },
          ],
        },
        {
          id: 'd26-q3',
          prompt: 'The claim: “every integer x with x · x = 4 is equal to 2”. The theorem is accepted. What is the problem?',
          code: `theorem square_four (x : Nat) (h : x * x = 4) : x = 2 := by
  have hx : x < 3 := by
    apply Nat.lt_of_not_le
    intro hx
    have := Nat.mul_le_mul hx hx
    omega
  have : x = 0 ∨ x = 1 ∨ x = 2 := by omega
  rcases this with rfl | rfl | rfl <;> simp_all`,
          options: [
            { text: 'It is about `Nat`, not integers. Over the integers the claim is false: x = −2.', correct: true, why: 'Choosing `Nat` removed the counterexample. The theorem is true but says less than the claim.' },
            { text: 'Nothing: `Nat` and integers behave the same here.', misconception: 'coercion', why: 'They do not: `(-2 : Int) * (-2) = 4`, and there is no −2 in `Nat`.' },
            { text: 'The hypothesis `h` contradicts itself.', misconception: 'vacuous-truth', why: 'x = 2 satisfies it. The hypotheses are fine; the type is the problem.' },
          ],
        },
        {
          id: 'd26-q4',
          prompt: 'Lean accepts this. What is going on?',
          code: `instance weirdLT : LT Nat := ⟨fun _ _ => True⟩

theorem five_lt_two : (5 : Nat) < 2 := trivial`,
          options: [
            { text: 'The file redefines `<` on `Nat` to mean “always true”.', correct: true, why: 'An `instance` can change what a symbol means. Here `5 < 2` just means `True`.' },
            { text: '5 < 2 is true in Lean, because of a convention like `x / 0 = 0`.', misconception: 'junk-values', why: 'With the usual `<`, `(5 : Nat) < 2` is false. The trick is the instance, not a junk value.' },
            { text: 'Lean only checks that symbols are used correctly.', misconception: 'notation-trust', why: 'Lean checks the proof fully, but against the meaning of `<` defined in the file, which is not the usual one.' },
          ],
        },
        {
          id: 'd26-q5',
          prompt: 'The claim: “the smallest n with n · n > 50 is 8”. What is the problem with this theorem?',
          code: 'theorem smallest_is_eight : 8 * 8 > 50 := by decide',
          options: [
            { text: 'It only checks that 8 works, not that no smaller n works.', correct: true, why: '“Smallest” has two parts: 8 works, and 7, 6, … do not. The statement keeps only the easy part.' },
            { text: 'Nothing: 8 · 8 = 64 > 50, which is the claim.', misconception: 'statement-drift', why: 'That is half the claim. 9, 10 and 100 also satisfy n · n > 50, and they are not the smallest.' },
            { text: '`decide` cannot prove a claim about the smallest number.', misconception: 'automation-strength', why: '`decide` could prove the full claim too (it is about finitely many cases). The problem is what the statement says.' },
          ],
        },
        {
          id: 'd26-q6',
          prompt: 'The claim: “f is strictly increasing” (each value is bigger than the one before). Which statement says that?',
          options: [
            { text: '`∀ n, f n < f (n + 1)`', correct: true, why: '“Strictly” means `<`: each value is bigger, never equal.' },
            { text: '`∀ n, f n ≤ f (n + 1)`', misconception: 'statement-drift', why: '`≤` allows equal values. A constant function satisfies this.' },
            { text: '`∃ n, f n < f (n + 1)`', misconception: 'statement-drift', why: 'This only needs one step where f goes up.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 27
    {
      day: 27,
      title: 'The audit checklist',
      goal: 'Audit a theorem in five steps, and use the Lab’s Audit report while knowing what it cannot see.',
      questions: [
        {
          id: 'd27-q1',
          prompt: 'Which checklist step catches a hypothesis like `(key : ∀ m, m > 2 → m % 2 = 0 → ∃ p q, …)` in a theorem claimed to prove Goldbach?',
          options: [
            { text: 'Step 4: is any hypothesis as hard as the claim?', correct: true, why: '`key` is Goldbach’s conjecture itself. It is not part of the claim and not a known fact.' },
            { text: 'Step 1: is it really proved?', misconception: 'hypothesis-does-the-work', why: 'Step 1 passes: no `sorry`, no `axiom`. The proof is complete; it just assumes the hard part.' },
            { text: 'Step 3: can the hypotheses all hold?', misconception: 'vacuous-truth', why: '`key` is not known to be false, so you cannot show the hypotheses are impossible. The problem is that `key` is the whole difficulty.' },
          ],
        },
        {
          id: 'd27-q2',
          prompt: 'The Audit says “Hypotheses are not needed” for this theorem. What does that tell you?',
          code: 'theorem big_numbers (n : Nat) (h : n > 1000) : n * 0 = 0 := Nat.mul_zero n',
          options: [
            { text: 'The conclusion is true for every n, so `h` adds nothing. Check that the statement is really the intended claim.', correct: true, why: 'When the conclusion is trivial on its own, the theorem is probably weaker than claimed.' },
            { text: 'The hypotheses contradict each other.', misconception: 'vacuous-truth', why: 'n = 1001 satisfies `h`. The hypotheses are fine; they are just not used.' },
            { text: 'The proof is unfinished.', misconception: 'warning-is-fine', why: 'The proof is complete. The finding is about the statement, not the proof.' },
          ],
        },
        {
          id: 'd27-q3',
          prompt: 'The Audit reports “No red flags found” for a theorem. What do you know?',
          options: [
            { text: 'It is proved with standard axioms, and the automatic checks found no contradiction or circularity. The statement still has to be read.', correct: true, why: 'That is exactly what “no red flags” covers. Steps 2, 4 and 5 are about meaning, which the Audit cannot judge.' },
            { text: 'The theorem proves the claim in its name.', misconception: 'accepted-means-true', why: 'Names are never checked, by Lean or by the Audit.' },
            { text: 'The hypotheses can all hold.', misconception: 'automation-strength', why: 'The Audit only tries a few tactics. It missed `(h : ∀ m : Nat, m > 5)`, for example.' },
          ],
        },
        {
          id: 'd27-q4',
          prompt: 'Step 3 for this theorem: which example shows that the hypotheses can all hold?',
          code: 'theorem t (a b : Nat) (h1 : a < b) (h2 : b < 2 * a) (h3 : a + b = 7) : a * b > 10 := by\n  sorry',
          codeExpect: 'sorry',
          options: [
            { text: 'a = 3, b = 4', correct: true, why: '3 < 4, 4 < 6 and 3 + 4 = 7. All three hypotheses hold, so the theorem is not vacuous.' },
            { text: 'a = 2, b = 5', misconception: 'hypothesis-is-fact', why: '2 + 5 = 7 and 2 < 5, but 5 < 4 is false. `h2` fails.' },
            { text: 'None needed: Lean checks the hypotheses.', misconception: 'hypothesis-is-fact', why: 'Lean never checks hypotheses. (And here it did not even check the proof: it is `sorry`, which fails step 1.)' },
          ],
        },
        {
          id: 'd27-q5',
          prompt: 'The Audit’s English reading says: “for every x : Nat, if `x * x = 4`, then `x = 2`”. The claim was about integers. Which step does this fail?',
          options: [
            { text: 'Step 2: the statement is about `Nat`, not integers.', correct: true, why: 'Reading it out loud reveals the type. Over the integers, x = −2 is a counterexample.' },
            { text: 'Step 3: the hypotheses can never hold.', misconception: 'vacuous-truth', why: 'x = 2 satisfies `x * x = 4`. The hypotheses are fine.' },
            { text: 'None: the English reading matches the claim closely enough.', misconception: 'statement-drift', why: '“Close enough” is how drift gets through. `Nat` and integers are different worlds.' },
          ],
        },
        {
          id: 'd27-q6',
          prompt: 'A file passes step 1 and the Audit shows no red flags, but it starts with `local notation:50 a " ≺ " b => b ≤ a`. What should you do?',
          options: [
            { text: 'Find what `≺` means (here, `b ≤ a`, reversed) and read every statement that uses it with that meaning.', correct: true, why: 'Custom notation can make a statement look like something else. The English reading shows `10 ≺ 3` as `3 ≤ 10`.' },
            { text: 'Nothing: `≺` is a standard symbol for “less than”.', misconception: 'notation-trust', why: 'A symbol means whatever the file defines. Here it reverses the order.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 28
    {
      day: 28,
      title: 'Case study: a too-good-to-be-true proof',
      goal: 'Run the full checklist on a realistic file and find the hypothesis that makes it empty.',
      questions: [
        {
          id: 'd28-q1',
          prompt: 'In the Collatz file, which hypothesis is not part of the claim “every positive n reaches 1”?',
          code: COLLATZ,
          options: [
            { text: '`h_descent`', correct: true, why: 'The claim has one condition, n > 0, which is `hn`. `h_descent` was added.' },
            { text: '`hn`', misconception: 'hypothesis-does-the-work', why: '`hn : n > 0` is the claim’s own condition (“every positive n”).' },
            { text: 'Neither: both are needed for the proof, so both belong.', misconception: 'hypothesis-does-the-work', why: 'Being needed for the proof is not the test. A hypothesis must be part of the claim, or a known easier fact.' },
          ],
        },
        {
          id: 'd28-q2',
          prompt: 'What does Lean show?',
          code: `${STEP_DEF}

#eval step 7`,
          options: [
            { text: '`22`', correct: true, why: '7 is odd, so step 7 = 3 · 7 + 1 = 22.' },
            { text: '`3`', misconception: 'definition-trust', why: 'Halving only happens for even numbers (`n % 2 = 0`). 7 is odd.' },
          ],
        },
        {
          id: 'd28-q3',
          prompt: 'Given `step 3 = 10`, what is the status of the hypothesis `h_descent : ∀ m, m > 1 → step m < m`?',
          options: [
            { text: 'It is false, so the theorem can never be applied: it is vacuous.', correct: true, why: 'm = 3 is above 1, but step 3 = 10 is not below 3. No situation satisfies all the hypotheses.' },
            { text: 'It is true for most m, so the theorem holds for most n.', misconception: 'vacuous-truth', why: '`h_descent` is a single statement about *every* m. One counterexample makes it false, and then the theorem applies to no n at all.' },
            { text: 'Lean checked it, since the file was accepted.', misconception: 'hypothesis-is-fact', why: 'Lean never checks hypotheses. It checked “if `h_descent`, then …”.' },
          ],
        },
        {
          id: 'd28-q4',
          prompt: 'Why did the Audit report “No red flags found” for `collatz_conjecture`?',
          options: [
            { text: 'Seeing that `h_descent` is false needs a specific test (m = 3), which its automatic search does not try.', correct: true, why: 'The Audit tries a few tactics on the hypotheses as they are. It does not search for counterexamples. And since `h_descent` is used deep inside an induction, not in one step, “One hypothesis carries the claim” does not fire either.' },
            { text: 'Because the theorem is a correct proof of Collatz.', misconception: 'automation-strength', why: 'No red flags is not a certificate. The theorem is vacuous.' },
            { text: 'Because a long proof cannot have contradictory hypotheses.', misconception: 'automation-strength', why: 'Any proof, long or short, can rest on a false hypothesis. Here the induction is real but never applies.' },
          ],
        },
        {
          id: 'd28-q5',
          prompt: 'If `h_descent` were removed, what would happen to the proof?',
          options: [
            { text: 'It would break: the step `step n < n` came from `h_descent`, and without it nobody knows how to finish.', correct: true, why: 'Without `h_descent` the theorem is the real Collatz conjecture, which is unsolved.' },
            { text: 'Nothing: `h_descent` is never used.', misconception: 'hypothesis-does-the-work', why: 'It is used in `have hlt : step n < n := h_descent n …`. It carries the whole argument.' },
          ],
        },
        {
          id: 'd28-q6',
          prompt: 'A variant of the file proves the same conclusion with `(h_descent : ∀ m, m > 1 → m % 2 = 0 → step m < m)`. Is the theorem still vacuous?',
          code: `${STEP_DEF}

theorem even_descent : ∀ m, m > 1 → m % 2 = 0 → step m < m := by
  intro m h1 h2
  unfold step
  simp [h2]
  omega`,
          options: [
            { text: 'No: this hypothesis is true (shown above), but it is also not enough to prove Collatz, so the proof would have to change.', correct: true, why: 'Even numbers do go down. The difficulty is the odd numbers, which this hypothesis says nothing about.' },
            { text: 'Yes: any hypothesis called `h_descent` is false.', misconception: 'definition-trust', why: 'Names decide nothing, in either direction. Test the statement: this one is true.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 29
    {
      day: 29,
      title: 'Case study: the statement does not match the claim',
      goal: 'Compare formal statements of a competition problem with the problem, and find exactly how each one falls short.',
      questions: [
        {
          id: 'd29-q1',
          prompt: 'What does `quadratic_solved` establish about the problem “find all integers x with x · x = x + 6”?',
          code: 'theorem quadratic_solved : ∃ x : Int, x * x = x + 6 := ⟨3, by decide⟩',
          options: [
            { text: 'Only that at least one solution exists.', correct: true, why: '`∃` asks for one example. Finding all solutions needs a statement about every x.' },
            { text: 'That 3 is the only solution.', misconception: 'exists-witness', why: 'The proof uses 3 as a witness, but the statement says nothing about other x. (And −2 is also a solution.)' },
            { text: 'The full answer: the problem is solved.', misconception: 'statement-drift', why: '“There is a solution” is much weaker than “here are all the solutions”.' },
          ],
        },
        {
          id: 'd29-q2',
          prompt: 'What is the problem with `only_solution`?',
          code: `theorem only_solution (x : Nat) (h : x * x = x + 6) : x = 3 := by
  have hx : x < 4 := by
    apply Nat.lt_of_not_le
    intro hx
    have := Nat.mul_le_mul_right x hx
    omega
  have : x = 0 ∨ x = 1 ∨ x = 2 ∨ x = 3 := by omega
  rcases this with rfl | rfl | rfl | rfl <;> simp_all`,
          options: [
            { text: 'It is about `Nat`, which has no −2. Over the integers, “the only solution is 3” is false.', correct: true, why: 'The problem asks about integers. Restricting to `Nat` silently drops a solution.' },
            { text: 'Its hypothesis `h` can never hold.', misconception: 'vacuous-truth', why: 'x = 3 satisfies it: 9 = 3 + 6. The theorem is not vacuous; it is about the wrong kind of number.' },
            { text: 'Nothing: natural numbers are integers, so it covers the problem.', misconception: 'coercion', why: 'Every natural number is an integer, but not every integer is a natural number. Negative solutions are left out.' },
          ],
        },
        {
          id: 'd29-q3',
          prompt: 'What is missing from `answers_work`?',
          code: `theorem answers_work (x : Int) (h : x = 3 ∨ x = -2) : x * x = x + 6 := by
  rcases h with rfl | rfl <;> decide`,
          options: [
            { text: 'The other direction: that every solution is 3 or −2.', correct: true, why: 'It shows the answers are solutions, not that they are the only ones. That is the hard half.' },
            { text: 'Nothing: it shows the answers satisfy the equation, which is the problem.', misconception: 'converse', why: '“The answers are solutions” is the converse of “the solutions are the answers”. A “find all” problem needs both.' },
            { text: 'It assumes its own conclusion.', misconception: 'hypothesis-does-the-work', why: 'The hypothesis (x is 3 or −2) is not the conclusion (x · x = x + 6). It is a legitimate check, just only half the problem.' },
          ],
        },
        {
          id: 'd29-q4',
          prompt: 'Which statement matches “find all integers x with x · x = x + 6; the answer is 3 and −2”?',
          options: [
            { text: '`∀ x : Int, x * x = x + 6 ↔ x = 3 ∨ x = -2`', correct: true, why: 'Both directions, over the integers: these are solutions, and there are no others.' },
            { text: '`∀ x : Int, x * x = x + 6 → x = 3 ∨ x = -2`', misconception: 'converse', why: 'This says every solution is 3 or −2, but not that 3 and −2 are solutions. (Here that half is easy, but a full answer states it.)' },
            { text: '`∀ x : Nat, x * x = x + 6 ↔ x = 3 ∨ x = -2`', misconception: 'coercion', why: 'On `Nat`, `-2` is not a natural number, so the problem changes. Check the type.' },
          ],
        },
        {
          id: 'd29-q5',
          prompt: 'An AI proves the following and says “the solutions are 3 and −2”. What is wrong?',
          code: `${QUADRATIC_FULL}

theorem weak_answer (x : Int) (h : x * x = x + 6) : x = 3 ∨ x = -2 ∨ x = 100 := by
  have := (quadratic_all_solutions x).mp h
  omega`,
          options: [
            { text: 'Allowing an extra answer (100) makes the statement weaker: it no longer says 100 is not a solution, and it does not say 3 and −2 are solutions.', correct: true, why: 'An “or” list of possible answers can be padded with anything. The statement is true but does not pin down the answer.' },
            { text: 'Nothing: it is true, so it proves the answer.', misconception: 'statement-drift', why: 'True is not enough; it must say what was claimed. Here 100 sneaks in as a possible solution.' },
            { text: 'It is false, because 100 is not a solution.', misconception: 'lean-checks-format', why: 'It is true (Lean checked it): an “or” only needs one part to hold, and for every solution x, x = 3 or x = −2 does.' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────── Day 30
    {
      day: 30,
      title: 'Graduation',
      goal: 'Bring the four weeks together in one final review, and know where to go next.',
      questions: [
        {
          id: 'd30-q1',
          prompt: 'Is this accepted by Lean?',
          code: 'theorem t (a b : Nat) : a - b + b = a := by omega',
          codeExpect: 'error',
          options: [
            { text: 'No: on `Nat`, a − b stops at 0. For a = 1, b = 2: 0 + 2 = 2, not 1.', correct: true, why: 'The paper rule needs b ≤ a. Without that hypothesis the statement is false, and `omega` fails.' },
            { text: 'Yes: subtracting and adding b cancel out.', misconception: 'nat-subtraction', why: 'Only when b ≤ a. `Nat` subtraction stops at zero.' },
          ],
        },
        {
          id: 'd30-q2',
          prompt: 'In this goal display, what still has to be proved?',
          code: `-- n : Nat
-- h : n > 3
-- ⊢ n ≠ 0
example (n : Nat) (h : n > 3) : n ≠ 0 := by omega`,
          options: [
            { text: '`n ≠ 0`', correct: true, why: 'The line after `⊢` is the goal. The lines above it are what you have.' },
            { text: '`n > 3`', misconception: 'goal-vs-hypothesis', why: '`h : n > 3` is above the `⊢`: it is a hypothesis you may use, not something to prove.' },
          ],
        },
        {
          id: 'd30-q3',
          prompt: 'Which is **false**?',
          options: [
            { text: '`∃ m : Nat, ∀ n : Nat, m > n`', correct: true, why: 'One m bigger than every n, including m itself. Impossible.' },
            { text: '`∀ n : Nat, ∃ m : Nat, m > n`', misconception: 'quantifier-order', why: 'This is true: for each n, take m = n + 1.' },
          ],
        },
        {
          id: 'd30-q4',
          prompt: 'An AI says this file proves that every n above 1 has a prime factor. Lean accepts it with no warnings. What is the first problem an audit finds?',
          code: `def IsPrime (p : Nat) : Prop := p ≥ 2 ∧ ∀ d, d ∣ p → d = 1 ∨ d = p

axiom prime_factor_exists : ∀ n, n > 1 → ∃ p, IsPrime p ∧ p ∣ n

theorem has_prime_factor (n : Nat) (h : n > 1) : ∃ p, IsPrime p ∧ p ∣ n :=
  prime_factor_exists n h`,
          options: [
            { text: 'Step 1 fails: the theorem rests on an `axiom`, so nothing was proved.', correct: true, why: '`#print axioms has_prime_factor` shows `[prime_factor_exists]`. The claim was assumed, not proved (even though it happens to be true).' },
            { text: 'The `IsPrime` definition counts 1 as prime.', misconception: 'definition-trust', why: 'This `IsPrime` includes `p ≥ 2`, so 1 is not prime. The definition is fine.' },
            { text: 'None: no warnings means it is proved.', misconception: 'warning-is-fine', why: 'Axioms produce no warnings. Only `#print axioms` or the Audit reveals them.' },
          ],
        },
        {
          id: 'd30-q5',
          prompt: 'What is the problem with this theorem?',
          code: 'theorem perfect_numbers_solved (n : Nat) (h1 : n > 2 * n) : n % 2 = 0 := by omega',
          options: [
            { text: '`n > 2 * n` never holds for a natural number, so the theorem is vacuous.', correct: true, why: 'For n = 0 it says 0 > 0; for n ≥ 1, 2n is bigger. The Audit reports “Hypotheses contradict each other”.' },
            { text: 'Nothing: `omega` proved it, so it is a real result about perfect numbers.', misconception: 'automation-strength', why: '`omega` succeeded because the hypothesis is impossible. The statement does not even mention perfect numbers.' },
            { text: 'It proves that every n is even.', misconception: 'vacuous-truth', why: 'It proves that every n *with n > 2n* is even, and there is no such n.' },
          ],
        },
        {
          id: 'd30-q6',
          prompt: 'An AI says “Proved, Lean accepts it”. What is the right first response?',
          options: [
            { text: 'Run the audit: check the axioms, then read the statement and compare it with the claim.', correct: true, why: 'Lean’s acceptance is the start of the audit, not the end. It guarantees the statement as written, nothing more.' },
            { text: 'Accept it: Lean does not make mistakes.', misconception: 'accepted-means-true', why: 'Lean did not make a mistake. The question is whether the statement it checked is the claim, and whether `sorry` or an `axiom` was used.' },
            { text: 'Reject it: AIs cannot write real proofs.', misconception: 'lean-checks-format', why: 'AIs do write real proofs, and Lean checks them strictly. Audit it rather than guessing either way.' },
          ],
        },
      ],
    },
  ],
}
