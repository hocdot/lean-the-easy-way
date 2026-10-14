// The misconception catalog. Every wrong option in a question names the misconception that
// leads to it, as in the LTL Tutor (Prasad, Greenman, Nelson, Krishnamurthi, CAV 2025).
// When the same misconception keeps coming up, the learner sees its "refutation text":
// what they probably believe, why it is wrong, and a concrete example.

export interface Misconception {
  /** short name shown in the "things to review" list */
  name: string
  /** "You might think that …" */
  belief: string
  /** what is actually true */
  truth: string
  /** a small concrete example, Markdown (may contain a ```lean block) */
  example: string
}

export const MISCONCEPTIONS = {
  'theorem-parts': {
    name: 'Parts of a theorem',
    belief: 'the name of a theorem, or its proof, is part of what it claims.',
    truth:
      'A theorem has three parts: `theorem name : statement := proof`. Only the statement (between the colon and `:=`) is the claim. The name is a label, and the proof is the evidence.',
    example: 'In `theorem two_eq_two : 2 = 2 := rfl`, the claim is `2 = 2`. The name is `two_eq_two`, and `rfl` is the proof.',
  },
  'lean-checks-format': {
    name: 'What Lean checks',
    belief: 'Lean only checks that the code is well-formed, like a spell-checker, so a false statement could be accepted.',
    truth:
      'Lean checks that the proof really proves the statement, step by step. A false statement cannot be proved, unless the code cheats (with `sorry` or `axiom`, which an audit finds).',
    example: '```lean error\ntheorem nope : 2 + 2 = 5 := rfl\n```',
  },
  'free-variable': {
    name: 'What a variable stands for',
    belief: 'a variable like `n` in a theorem stands for one particular number.',
    truth:
      'A variable in the statement means “for every”: `theorem t (n : Nat) : n + 0 = n` claims `n + 0 = n` for every natural number n. When the theorem is used, n can be replaced by anything.',
    example: '```lean\ntheorem t (n : Nat) : n + 0 = n := rfl\n\nexample : 42 + 0 = 42 := t 42\n```',
  },
  'testing-vs-proof': {
    name: 'Testing is not proving',
    belief: 'if `#eval` shows the right answer, the statement is proved.',
    truth:
      '`#eval` computes one case. A theorem about every n needs a proof that covers every n. Checking a few (or a million) cases is evidence, not proof.',
    example: '`#eval 7 * 7 % 4` shows 1, but that does not prove “every odd square leaves remainder 1 when divided by 4”.',
  },
  'accepted-means-true': {
    name: 'What “Lean accepts it” means',
    belief: 'if Lean accepts a theorem, the claim in its name or comment is true.',
    truth:
      'Lean checks only that the proof proves the statement exactly as written. The name and comments are ignored. If the statement is weaker, different, or vacuous, Lean is still happy.',
    example:
      'Lean accepts this, but the statement says nothing about primes:\n\n```lean\ntheorem infinitely_many_primes : 1 + 1 = 2 := rfl\n```',
  },
  'warning-is-fine': {
    name: 'Warnings and `sorry`',
    belief: 'a file that has only warnings (no errors) is fully proved.',
    truth:
      '`sorry` is a placeholder that skips a proof. Lean reports it as a warning, not an error, so the file still “compiles”. A theorem whose proof uses `sorry` proves nothing.',
    example: '```lean sorry\ntheorem big_claim (n : Nat) : n * n ≥ n := by\n  sorry\n```',
  },
  'axiom-is-proof': {
    name: '`axiom` and trust',
    belief: 'an `axiom` is a kind of proved fact, like a theorem.',
    truth:
      '`axiom` tells Lean to assume a statement without proof. Lean trusts it completely, so a false axiom lets you prove anything, including `0 = 1`.',
    example: '```lean\naxiom oops : 0 = 1\n\ntheorem anything : 2 + 2 = 5 := by\n  have := oops\n  omega\n```',
  },
  'colon-split': {
    name: 'Arguments before the colon',
    belief: 'the things written before the `:` of a theorem are just setup, and the statement is only what comes after the colon.',
    truth:
      'Everything before the colon is part of the statement. `(n : Nat)` means “for every natural number n”, and `(h : n > 0)` means “if n > 0”. Moving them after the colon with `∀` and `→` gives exactly the same theorem.',
    example:
      'These state the same thing:\n\n```lean\ntheorem a (n : Nat) (h : n > 0) : n ≥ 1 := h\ntheorem b : ∀ n : Nat, n > 0 → n ≥ 1 := fun _ h => h\n```',
  },
  'hypothesis-is-fact': {
    name: 'Hypotheses are assumptions',
    belief: 'a hypothesis like `(h : x > 5)` is a fact Lean has checked.',
    truth:
      'A hypothesis is an assumption: the theorem says “*if* this holds, then …”. Nobody checked that it can hold. Whoever uses the theorem must supply a proof of it.',
    example:
      'This is accepted, but only says something about numbers that are both above 5 and below 3, and there are none:\n\n```lean\ntheorem weird (x : Nat) (h1 : x > 5) (h2 : x < 3) : x = 100 := by omega\n```',
  },
  'vacuous-truth': {
    name: 'Impossible hypotheses',
    belief: 'a proved theorem always tells you something about the conclusion.',
    truth:
      'If the hypotheses can never all hold, the theorem is *vacuously* true: it proves any conclusion, so it tells you nothing. From `False`, anything follows.',
    example: '```lean\ntheorem from_false (h : False) : 1 = 2 := h.elim\n```',
  },
  'arrow-grouping': {
    name: 'How `→` groups',
    belief: '`P → Q → R` means `(P → Q) → R`.',
    truth:
      '`→` groups to the right: `P → Q → R` means `P → (Q → R)`, “if P, then if Q, then R”, which is the same as “if P and Q, then R”.',
    example:
      '```lean\nexample (P Q R : Prop) : (P → Q → R) ↔ (P ∧ Q → R) :=\n  ⟨fun h hpq => h hpq.1 hpq.2, fun h hp hq => h ⟨hp, hq⟩⟩\n```',
  },
  converse: {
    name: 'Direction of `→`',
    belief: '`P → Q` also gives `Q → P`.',
    truth:
      '`P → Q` only goes one way. “If it rains, the street is wet” does not mean “if the street is wet, it rained”. Both directions together are `P ↔ Q`.',
    example:
      '`n = 2 → n % 2 = 0` is true for every natural number, but `n % 2 = 0 → n = 2` is false (take n = 4).',
  },
  'quantifier-order': {
    name: 'Order of `∀` and `∃`',
    belief: '`∀ x, ∃ y, …` and `∃ y, ∀ x, …` say the same thing.',
    truth:
      'Order matters. `∀ x, ∃ y` lets y depend on x (“everyone has a mother”). `∃ y, ∀ x` needs one y that works for every x (“someone is everyone’s mother”).',
    example:
      '`∀ n : Nat, ∃ m, m > n` is true (take m = n + 1). `∃ m : Nat, ∀ n, m > n` is false (no number is bigger than all numbers, including itself).',
  },
  'exists-implies': {
    name: '`∃` with `→`',
    belief: '“some x is P and Q” is written `∃ x, P x → Q x`.',
    truth:
      'With `∃`, use `∧`: `∃ x, P x ∧ Q x`. The version with `→` is almost always true for a silly reason: any x that is not P makes `P x → Q x` true.',
    example:
      '`∃ n : Nat, n > 100 → n = 7` is true: take n = 0, since `0 > 100` is false, the implication holds.',
  },
  'forall-and': {
    name: '`∀` with `∧`',
    belief: '“every P is Q” is written `∀ x, P x ∧ Q x`.',
    truth:
      'With `∀`, use `→`: `∀ x, P x → Q x` (“for every x, if x is P then x is Q”). `∀ x, P x ∧ Q x` says *everything* is both P and Q.',
    example:
      '“Every even number is a multiple of 2” is `∀ n, n % 2 = 0 → 2 ∣ n`. Writing `∀ n, n % 2 = 0 ∧ 2 ∣ n` claims every number is even, which is false.',
  },
  'not-scope': {
    name: 'What `¬` covers',
    belief: '`¬ P ∧ Q` means “not (P and Q)”.',
    truth:
      '`¬` binds tightly, to the smallest thing after it: `¬ P ∧ Q` means `(¬ P) ∧ Q`. To negate the whole thing, write `¬ (P ∧ Q)`.',
    example: '`¬ 1 = 2 ∧ 2 = 2` is true: it reads `(1 ≠ 2) ∧ (2 = 2)`.',
  },
  'nat-subtraction': {
    name: 'Subtraction on `Nat`',
    belief: '`a - b` on natural numbers can be negative, as on paper.',
    truth:
      '`Nat` has no negative numbers, so subtraction stops at zero: `3 - 5 = 0`. Statements about `Nat` subtraction can be true or false for this reason alone.',
    example: '```lean\nexample : (3 : Nat) - 5 = 0 := rfl\nexample : (3 : Int) - 5 = -2 := rfl\n```',
  },
  'division-convention': {
    name: 'Division in Lean',
    belief: '`a / b` is the exact fraction, and dividing by zero is an error.',
    truth:
      'On `Nat` and `Int`, `/` rounds down: `7 / 2 = 3`. And in Lean, dividing by zero is not an error: `x / 0 = 0`. A theorem can quietly rely on these conventions.',
    example: '```lean\nexample : 7 / 2 = 3 := rfl\nexample : 5 / 0 = 0 := rfl\n```',
  },
  'goal-vs-hypothesis': {
    name: 'Goal vs hypotheses',
    belief: 'the lines above `⊢` are things still to prove.',
    truth:
      'In a goal display, the lines above `⊢` are what you *have* (variables and hypotheses). The single line after `⊢` is what you still *need* to prove.',
    example: '```\nn : Nat\nh : n > 3\n⊢ n > 1\n```\nYou have n and h. You must prove n > 1.',
  },
  'tactic-meaning': {
    name: 'What a tactic does',
    belief: 'any tactic that “sounds right” can be used at any step.',
    truth:
      'Each tactic fits a particular shape of goal: `intro` for `→` and `∀`, `constructor` for `∧` and `↔`, `exact h` when `h` is exactly the goal, `rfl` for equalities that hold by computation.',
    example:
      'With goal `P ∧ Q`, `intro` fails (there is no `→` to introduce); `constructor` splits it into the goals `P` and `Q`.',
  },
  'intro-meaning': {
    name: 'What `intro` does',
    belief: '`intro` proves something, or adds an assumption out of nowhere.',
    truth:
      '`intro h` works when the goal is `P → Q` (or `∀ x, …`). It moves `P` into the hypotheses under the name `h` and leaves `Q` as the goal. That is fair: to prove “if P then Q”, you may assume P.',
    example: 'Goal `n > 5 → n > 3`. After `intro h`: hypothesis `h : n > 5`, goal `n > 3`.',
  },
  'exact-match': {
    name: 'When `exact` works',
    belief: '`exact h` works whenever `h` is related to the goal.',
    truth: '`exact h` works only when what `h` says is exactly the goal (Lean allows only differences it can compute away).',
    example: 'With `h : P ∧ Q` and goal `P`, `exact h` fails; `exact h.1` works.',
  },
  'apply-direction': {
    name: 'How `apply` works',
    belief: '`apply h` with `h : P → Q` turns a goal `P` into `Q`.',
    truth:
      '`apply` works backwards from the goal. With goal `Q` and `h : P → Q`, `apply h` leaves the goal `P`: to get Q it is enough to show P.',
    example: 'Goal `x > 0`, lemma `h : x > 5 → x > 0`. After `apply h` the goal is `x > 5`.',
  },
  'or-cases': {
    name: 'Using an “or”',
    belief: 'from `h : P ∨ Q` you may use both P and Q.',
    truth:
      '`h : P ∨ Q` says at least one holds, but not which. A proof that uses it splits into two cases, one assuming P and one assuming Q, and must finish both.',
    example: '`rcases h with hp | hq` gives two goals: one with `hp : P`, one with `hq : Q`.',
  },
  'exists-witness': {
    name: 'Proving and using “there exists”',
    belief: 'to prove `∃ x, P x` you must show P for every x (or you may use any x you like from an `∃` hypothesis).',
    truth:
      'To prove `∃ x, P x`, give one specific x (the *witness*) and show P for it. When you *have* `h : ∃ x, P x`, you get some x with P x, but you do not get to choose which.',
    example: '```lean\nexample : ∃ n : Nat, n * n = 49 := ⟨7, rfl⟩\n```',
  },
  'bounded-quantifier': {
    name: '`∀ ε > 0` and `∃ x > 0`',
    belief: '`∀ ε > 0, P ε` means “for every ε, ε > 0 and P ε”.',
    truth:
      'It is shorthand. `∀ ε > 0, P ε` means `∀ ε, ε > 0 → P ε`. `∃ x > 0, P x` means `∃ x, x > 0 ∧ P x`. The `∀` version uses `→`, the `∃` version uses `∧`.',
    example: '```lean\nexample : (∀ n > 2, n ≠ 0) ↔ (∀ n : Nat, n > 2 → n ≠ 0) := Iff.rfl\n```',
  },
  'junk-values': {
    name: 'Junk values',
    belief: 'functions like square root, logarithm or division refuse bad inputs, so statements using them are only about sensible inputs.',
    truth:
      'In Lean (and Mathlib) every function returns *some* value on every input. Bad inputs get a conventional “junk” value: `x / 0 = 0`, `Real.sqrt (-4) = 0`, `Real.log 0 = 0`. A statement can be true only because of junk values.',
    example:
      '```lean fragment\n-- Mathlib: true, but only because 1 / 0 = 0\nexample : (1 : ℝ) / 0 = 0 := div_zero 1\n```',
  },
  'hypothesis-does-the-work': {
    name: 'A hypothesis that does the work',
    belief: 'a hypothesis that is not literally the conclusion is harmless.',
    truth:
      'A hypothesis can carry the hard part of the problem: assume the key estimate, or something equivalent to the conclusion, and the remaining proof is easy. The theorem is then only “if the hard part holds, the easy part follows”. Ask of each hypothesis: is it known to be true, and is it easier than the claim?',
    example:
      '“Theorem: every even number above 2 is a sum of two primes, assuming `h : ∀ n, n > 2 → Even n → ∃ p q, …`”. The hypothesis *is* Goldbach’s conjecture.',
  },
  'rewrite-direction': {
    name: 'Direction of `rw`',
    belief: '`rw [h]` with `h : a = b` replaces `b` by `a`.',
    truth:
      '`rw [h]` replaces the left side by the right side: every `a` becomes `b`. To go the other way write `rw [← h]`.',
    example: 'With `h : x = 2` and goal `x + x = 4`, `rw [h]` turns the goal into `2 + 2 = 4`.',
  },
  'automation-strength': {
    name: 'What automation proves',
    belief: 'when `simp`, `omega` or `decide` succeeds, the theorem must be deep or important.',
    truth:
      'Automation succeeds on easy goals, including goals made easy by a bad statement (contradictory hypotheses, or a conclusion that is trivially true). A one-word proof of a big claim is a reason to look closer.',
    example: '```lean\ntheorem collatz_solved (n : Nat) (h : n < 0) : n = 1 := by omega\n```\n`omega` succeeds because `n < 0` is impossible for natural numbers.',
  },
  'definition-trust': {
    name: 'Trusting a name',
    belief: 'a definition called `IsPrime` (or `Sorted`, `Converges` …) means what its name says.',
    truth:
      'Lean does not read names. A definition means exactly what its body says. A theorem about a wrong definition is a correct proof of the wrong thing.',
    example:
      '```lean\ndef IsPrime (n : Nat) : Prop := ∀ d, d ∣ n → d = 1 ∨ d = n\n\n-- 1 is "prime" by this definition: the condition n ≥ 2 is missing\nexample : IsPrime 1 := by\n  intro d hd\n  left\n  exact Nat.dvd_one.mp hd\n```',
  },
  'statement-drift': {
    name: 'Proving a weaker statement',
    belief: 'a theorem that looks close to the claim proves the claim.',
    truth:
      'Small changes make a different theorem: `∃` instead of `∀`, `≤` instead of `<`, one number instead of all, a finite range instead of everything, `Nat` instead of real numbers. Compare the statement with the claim word by word.',
    example:
      'Claim: “every n has a prime above it”. Proved instead: `∃ n, ∃ p, p > n ∧ Nat.Prime p`, which only needs one example.',
  },
  'implicit-arguments': {
    name: 'Curly-brace arguments',
    belief: 'arguments in `{ }` are not part of the statement.',
    truth:
      '`{x : Nat}` is still “for every x”. The braces only mean Lean fills x in by itself when the theorem is used.',
    example: '`theorem t {n : Nat} (h : n > 0) : n ≠ 0` is a statement about every n.',
  },
  'coercion': {
    name: 'Hidden conversions (`↑`)',
    belief: 'a number means the same thing wherever it appears.',
    truth:
      'Lean converts between number types (`Nat` to `Int` to real numbers) and shows it with `↑`. Where the conversion happens matters: `↑(a - b)` subtracts in `Nat` first (stopping at 0), `↑a - ↑b` subtracts after converting.',
    example: '```lean\nexample : ((3 - 5 : Nat) : Int) = 0 := rfl\nexample : ((3 : Nat) : Int) - ((5 : Nat) : Int) = -2 := rfl\n```',
  },
  'statement-not-proof': {
    name: 'A statement is not a proof',
    belief: 'if Lean accepts `def FermatLastTheorem : Prop := …`, Fermat’s Last Theorem has been proved.',
    truth:
      'A `def` whose type is `Prop` only *writes down* a statement, so that people can talk about it. Lean checks that it is well-formed, not that it is true. Only a `theorem` (with no `sorry` and no extra axioms) proves something.',
    example:
      '```lean\ndef Goldbach : Prop := ∀ n : Nat, n > 2 → n % 2 = 0 → ∃ p q : Nat, p + q = n\n```\nLean accepts this definition. It says nothing about whether Goldbach is true.',
  },
  'proof-reading': {
    name: 'What an auditor reads',
    belief: 'to trust a theorem you must read and understand every line of its proof.',
    truth:
      'Lean’s kernel checks every step of the proof, so the steps themselves need no human checking. What Lean cannot check is whether the theorem is the right one: the statement, the definitions it uses, its hypotheses, and the axioms it rests on. That is where an auditor spends the time. Reading the proof helps understanding, but it is not where fake proofs hide.',
    example: 'Mathlib’s proof of Fermat’s Last Theorem for n = 3 is hundreds of lines. Auditing it means reading one line, `fermatLastTheoremThree : FermatLastTheoremFor 3`, the definition of `FermatLastTheoremFor`, and its `#print axioms`.',
  },
  'notation-trust': {
    name: 'Trusting symbols',
    belief: 'symbols like `+`, `≤` or `∑` always mean the usual thing.',
    truth:
      'A file can define its own notation, instances and macros. Then a familiar symbol can mean something else. Check where unusual notation is defined.',
    example: '```lean\nlocal infix:50 " ≤≤ " => fun (a b : Nat) => True\n\ntheorem looks_strong : 100 ≤≤ 1 := trivial\n```',
  },
} satisfies Record<string, Misconception>

export type MisconceptionId = keyof typeof MISCONCEPTIONS
