import type { Week } from './types.ts'

export const week1: Week = {
  week: 1,
  title: 'Reading what a theorem says',
  summary: 'The parts of a theorem, numbers in Lean, and the words of logic: for every, if, and, or, not, there exists.',
  lessons: [
    {
      day: 1,
      title: 'A theorem is a claim and a proof',
      goal: 'Find the name, the statement and the proof of a theorem, and know what Lean checks.',
      questions: [
        {
          id: 'd01-q1',
          prompt: 'In this theorem, which part is the **statement** (the claim)?',
          code: 'theorem two_eq_two : 2 = 2 := rfl',
          options: [
            { text: '`2 = 2`', correct: true, why: 'The statement sits between the colon `:` and `:=`. It is the claim being proved.' },
            { text: '`two_eq_two`', misconception: 'theorem-parts', why: 'That is the **name**, a label. Lean does not read it.' },
            { text: '`rfl`', misconception: 'theorem-parts', why: 'That is the **proof**, which comes after `:=`. It is the evidence, not the claim.' },
          ],
        },
        {
          id: 'd01-q2',
          prompt: 'Will Lean accept this theorem?',
          code: 'theorem t : 3 + 4 = 8 := rfl',
          codeExpect: 'error',
          options: [
            { text: 'No, because 3 + 4 is not 8.', correct: true, why: 'Lean computes `3 + 4` to `7`, compares it with `8`, and rejects the proof. Press Run to see the error.' },
            { text: 'Yes, it is written correctly.', misconception: 'lean-checks-format', why: 'Being well-written is not enough. Lean checks that the proof really proves the claim, and `3 + 4 = 8` is false, so nothing can prove it.' },
          ],
        },
        {
          id: 'd01-q3',
          prompt: 'Someone shows you a theorem called `fermat_last_theorem`, and Lean accepts it. What do you know for sure?',
          options: [
            { text: 'The statement written after the colon is proved.', correct: true, why: 'That is exactly what Lean guarantees, and nothing more. You still have to read the statement to know what was proved.' },
            { text: 'Fermat’s Last Theorem is proved.', misconception: 'accepted-means-true', why: 'Lean ignores names. The statement could be `1 + 1 = 2`. Read it before you believe it.' },
            { text: 'Nothing, because Lean only checks spelling.', misconception: 'lean-checks-format', why: 'Lean checks much more than spelling: it checks the proof proves the statement. What you do not know yet is whether the statement is the famous theorem.' },
          ],
        },
        {
          id: 'd01-q4',
          prompt: 'Which part of a theorem does Lean ignore when it decides whether the theorem is correct?',
          options: [
            { text: 'The name', correct: true, why: 'The name is only a label for referring to the theorem later.' },
            { text: 'The statement', misconception: 'theorem-parts', why: 'The statement is the most important part: the proof must prove exactly this.' },
            { text: 'The proof', misconception: 'theorem-parts', why: 'The proof is what Lean checks, step by step.' },
          ],
        },
        {
          id: 'd01-q5',
          prompt: 'Is this accepted by Lean?',
          code: 'theorem big_result : 10 = 5 + 5 := rfl',
          options: [
            { text: 'Yes: `5 + 5` computes to `10`.', correct: true, why: '`rfl` works whenever both sides compute to the same value. The order of the sides does not matter.' },
            { text: 'No: the name promises a big result.', misconception: 'accepted-means-true', why: 'Lean does not read the name at all. It only checks `10 = 5 + 5`, which is true.' },
            { text: 'No: `rfl` only works when both sides are written the same way.', misconception: 'tactic-meaning', why: '`rfl` compares the *values* after computing, so `10` and `5 + 5` count as the same.' },
          ],
        },
      ],
    },

    {
      day: 2,
      title: 'Numbers in Lean are a little different',
      goal: 'Predict what Lean computes for subtraction and division, and why it matters.',
      questions: [
        {
          id: 'd02-q1',
          prompt: 'What does Lean show?',
          code: '#eval 2 - 5',
          options: [
            { text: '`0`', correct: true, why: 'On `Nat`, subtraction stops at zero, so `2 - 5 = 0`.' },
            { text: '`-3`', misconception: 'nat-subtraction', why: 'There are no negative natural numbers. You would get `-3` with `(2 : Int) - 5`.' },
            { text: 'An error', misconception: 'nat-subtraction', why: 'Lean does not complain: `Nat` subtraction is defined for all inputs and stops at zero.' },
          ],
        },
        {
          id: 'd02-q2',
          prompt: 'What does Lean show?',
          code: '#eval 9 / 2',
          options: [
            { text: '`4`', correct: true, why: 'Division on `Nat` rounds down: 9 / 2 = 4, remainder 1.' },
            { text: '`4.5`', misconception: 'division-convention', why: '`Nat` has no fractions. Division rounds down to a whole number.' },
            { text: '`5`', misconception: 'division-convention', why: 'Lean rounds down, not to the nearest number.' },
          ],
        },
        {
          id: 'd02-q3',
          prompt: 'What does Lean show?',
          code: '#eval 6 / 0',
          options: [
            { text: '`0`', correct: true, why: 'In Lean, dividing by zero gives zero by convention.' },
            { text: 'An error: division by zero', misconception: 'division-convention', why: 'Lean never stops with an error here. Every operation gives some value, and `x / 0` is defined to be `0`.' },
          ],
        },
        {
          id: 'd02-q4',
          prompt: 'What does Lean show?',
          code: '#eval (10 : Int) - 12',
          options: [
            { text: '`-2`', correct: true, why: '`(10 : Int)` is an integer, and integers can be negative.' },
            { text: '`0`', misconception: 'nat-subtraction', why: 'Stopping at zero only happens on `Nat`. Here the numbers are integers.' },
          ],
        },
        {
          id: 'd02-q5',
          prompt: 'Lean **accepts** this theorem. Why?',
          code: 'theorem surprise : 4 - 10 = 0 := rfl',
          options: [
            { text: 'On `Nat`, `4 - 10` stops at zero.', correct: true, why: 'Plain numbers like `4` are natural numbers unless said otherwise, so `4 - 10` computes to `0`.' },
            { text: 'Lean does not check numbers carefully.', misconception: 'lean-checks-format', why: 'Lean computes exactly. The theorem is true, but only because of how `Nat` subtraction works.' },
            { text: 'It is a mistake in Lean.', misconception: 'nat-subtraction', why: 'It is a deliberate convention: `Nat` subtraction is defined to stop at zero.' },
          ],
        },
      ],
    },

    {
      day: 3,
      title: 'Variables mean “for every”',
      goal: 'Read a theorem with variables as a claim about every value.',
      questions: [
        {
          id: 'd03-q1',
          prompt: 'How do you read this statement?',
          code: 'theorem t (a b : Nat) : a + b = b + a := Nat.add_comm a b',
          options: [
            { text: 'For all natural numbers a and b, a + b = b + a.', correct: true, why: 'Variables before the colon mean “for every”.' },
            { text: 'For some particular numbers a and b, a + b = b + a.', misconception: 'free-variable', why: 'A variable in a theorem stands for *every* value, not one particular value.' },
            { text: 'a + b = b + a, and a, b are just setup that is not part of the claim.', misconception: 'colon-split', why: 'The variables before the colon are part of the statement: they say what the claim is about.' },
          ],
        },
        {
          id: 'd03-q2',
          prompt: 'Which of these states the **same** thing as `theorem t (n : Nat) : n * 1 = n`?',
          options: [
            { text: '`theorem t : ∀ n : Nat, n * 1 = n`', correct: true, why: '`(n : Nat)` before the colon and `∀ n : Nat,` after it mean the same.' },
            { text: '`theorem t : ∃ n : Nat, n * 1 = n`', misconception: 'free-variable', why: 'This only claims that *some* n works (n = 0 would do). The original claims it for every n.' },
            { text: '`theorem t : 5 * 1 = 5`', misconception: 'free-variable', why: 'This is only one case. The original claims it for every n.' },
          ],
        },
        {
          id: 'd03-q3',
          prompt: 'Here, what does `{n : Nat}` mean?',
          code: 'theorem pos_ne_zero {n : Nat} (h : n > 0) : n ≠ 0 := by omega',
          options: [
            { text: 'For every natural number n (Lean fills n in when the theorem is used).', correct: true, why: 'Curly braces still mean “for every”. They only change how the theorem is used, not what it says.' },
            { text: 'It is not part of the statement.', misconception: 'implicit-arguments', why: 'It is part of the statement: the claim is about every n.' },
          ],
        },
        {
          id: 'd03-q4',
          prompt: 'Suppose Lean accepts `theorem t (n : Nat) : n + 0 = n`. Which of these follows from it?',
          options: [
            { text: '`42 + 0 = 42`', correct: true, why: 'The theorem holds for every n, so in particular for n = 42.' },
            { text: 'Nothing about 42, since 42 is not mentioned.', misconception: 'free-variable', why: '`n` stands for every natural number, including 42.' },
          ],
        },
        {
          id: 'd03-q5',
          prompt: 'How many claims does this theorem make, in effect?',
          code: 'theorem t (a : Nat) : a * 0 = 0 := Nat.mul_zero a',
          options: [
            { text: 'One for every natural number a: 0 * 0 = 0, 1 * 0 = 0, 2 * 0 = 0, …', correct: true, why: 'A “for every” statement covers infinitely many cases at once. That is what makes proofs more powerful than tests.' },
            { text: 'Just one, about a single number a.', misconception: 'free-variable', why: 'The statement covers every natural number a, not one.' },
          ],
        },
      ],
    },

    {
      day: 4,
      title: 'If … then: hypotheses',
      goal: 'Read hypotheses as “if”, and know they are assumptions, not facts.',
      questions: [
        {
          id: 'd04-q1',
          prompt: 'How do you read this theorem?',
          code: 'theorem t (n : Nat) (h : n > 10) : n ≠ 0 := by omega',
          options: [
            { text: 'For every n, if n > 10 then n ≠ 0.', correct: true, why: 'The hypothesis `(h : n > 10)` is the “if” part, and the statement after the colon is the “then” part.' },
            { text: 'For every n, n > 10 and n ≠ 0.', misconception: 'hypothesis-is-fact', why: 'The hypothesis is a condition (“if”), not a second claim. Not every n is above 10.' },
            { text: 'For every n, if n ≠ 0 then n > 10.', misconception: 'converse', why: 'That is the reverse direction, and it is false: n = 1 is not 0 and not above 10.' },
          ],
        },
        {
          id: 'd04-q2',
          prompt: 'What does `P → Q → R` mean?',
          options: [
            { text: 'If P, then (if Q, then R). In other words: if P and Q, then R.', correct: true, why: 'The arrow groups to the right.' },
            { text: 'If (P implies Q), then R.', misconception: 'arrow-grouping', why: 'That would be written `(P → Q) → R`. Without brackets, `→` groups to the right.' },
          ],
        },
        {
          id: 'd04-q3',
          prompt: 'This theorem is accepted. What does it tell you?',
          code: 'theorem strange (n : Nat) (h1 : n > 5) (h2 : n < 3) : n = 100 := by omega',
          options: [
            { text: 'Nothing useful: no number satisfies both hypotheses.', correct: true, why: 'The hypotheses contradict each other, so the theorem can never be applied. It is vacuously true.' },
            { text: 'That some number n equals 100.', misconception: 'vacuous-truth', why: 'The conclusion only follows *if* both hypotheses hold, and they never do together.' },
            { text: 'That there is a number above 5 and below 3.', misconception: 'hypothesis-is-fact', why: 'Hypotheses are assumptions. Lean never checked they can hold, and here they cannot.' },
          ],
        },
        {
          id: 'd04-q4',
          prompt: 'Which theorem says “if n is 2, then n is even”?',
          options: [
            { text: '`theorem t (n : Nat) (h : n = 2) : n % 2 = 0`', correct: true, why: 'The hypothesis is the “if” part, the conclusion is the “then” part.' },
            { text: '`theorem t (n : Nat) (h : n % 2 = 0) : n = 2`', misconception: 'converse', why: 'This is the reverse: “if n is even, then n is 2”, which is false for n = 4.' },
            { text: '`theorem t (n : Nat) : n = 2 ∧ n % 2 = 0`', misconception: 'hypothesis-is-fact', why: 'This claims every n is 2 and even (we will meet `∧`, “and”, tomorrow). The “if” is gone.' },
          ],
        },
        {
          id: 'd04-q5',
          prompt: 'In `theorem t (x : Nat) (h : x > 1000) : x > 999`, who makes sure that `x > 1000`?',
          options: [
            { text: 'Whoever uses the theorem: they must supply a proof of `x > 1000`.', correct: true, why: 'A hypothesis is a condition to be met when the theorem is used. The theorem itself just assumes it.' },
            { text: 'Lean already checked that `x > 1000`.', misconception: 'hypothesis-is-fact', why: 'Lean never checks that a hypothesis is true. It checks that the conclusion follows *if* it is.' },
          ],
        },
      ],
    },

    {
      day: 5,
      title: 'And, or, not, if and only if',
      goal: 'Read `∧`, `∨`, `¬`, `≠` and `↔`, and know how they group.',
      questions: [
        {
          id: 'd05-q1',
          prompt: 'How does Lean read `¬ P ∧ Q`?',
          options: [
            { text: '`(¬ P) ∧ Q`', correct: true, why: '`¬` applies to the smallest piece after it.' },
            { text: '`¬ (P ∧ Q)`', misconception: 'not-scope', why: 'To negate the whole “and”, you need brackets: `¬ (P ∧ Q)`.' },
          ],
        },
        {
          id: 'd05-q2',
          prompt: 'Will Lean accept this?',
          code: 'theorem t : ¬ 2 = 2 ∨ 1 = 1 := by decide',
          options: [
            { text: 'Yes: it says (2 ≠ 2) or (1 = 1), and the second part is true.', correct: true, why: '`¬` binds tightly, so the statement is `(¬ 2 = 2) ∨ 1 = 1`. One true side is enough for “or”.' },
            { text: 'No: it says “not (2 = 2 or 1 = 1)”, which is false.', misconception: 'not-scope', why: '`¬` only covers `2 = 2`. To negate the whole “or” you would need brackets: `¬ (2 = 2 ∨ 1 = 1)`.' },
          ],
        },
        {
          id: 'd05-q3',
          prompt: 'How do you read this?',
          code: 'theorem t (n : Nat) (h : n > 2 ∧ n < 5) : n = 3 ∨ n = 4 := by omega',
          options: [
            { text: 'For every n, if n > 2 and n < 5, then n = 3 or n = 4.', correct: true, why: '`∧` is “and”, `∨` is “or”, and the hypothesis is the “if” part.' },
            { text: 'For every n, n > 2 and n < 5 and n = 3 and n = 4.', misconception: 'hypothesis-is-fact', why: 'The hypothesis is a condition, and `∨` means “or”, not “and”.' },
          ],
        },
        {
          id: 'd05-q4',
          prompt: 'Which statement says “n is even **exactly when** n + 2 is even”?',
          options: [
            { text: '`n % 2 = 0 ↔ (n + 2) % 2 = 0`', correct: true, why: '“Exactly when” is “if and only if”, `↔`.' },
            { text: '`n % 2 = 0 → (n + 2) % 2 = 0`', misconception: 'converse', why: 'This only says one direction. “Exactly when” needs both, which is `↔`.' },
            { text: '`n % 2 = 0 ∧ (n + 2) % 2 = 0`', misconception: 'forall-and', why: 'This claims both are even, which fails for odd n. It does not express that one holds exactly when the other does.' },
          ],
        },
        {
          id: 'd05-q5',
          prompt: 'How does Lean group `P ∧ Q → R`?',
          options: [
            { text: '`(P ∧ Q) → R`', correct: true, why: '`∧` binds tighter than `→`.' },
            { text: '`P ∧ (Q → R)`', misconception: 'not-scope', why: '`→` is looser than `∧`, so the “and” is formed first.' },
          ],
        },
      ],
    },

    {
      day: 6,
      title: 'There exists',
      goal: 'Read `∃`, and see why the order of `∀` and `∃` matters.',
      questions: [
        {
          id: 'd06-q1',
          prompt: 'Which one is **true**?',
          options: [
            { text: '`∀ n : Nat, ∃ m : Nat, m > n`', correct: true, why: 'For each n, pick m = n + 1. The m may depend on n.' },
            { text: '`∃ m : Nat, ∀ n : Nat, m > n`', misconception: 'quantifier-order', why: 'This needs one m bigger than every n, including m itself. Impossible.' },
          ],
        },
        {
          id: 'd06-q2',
          prompt: 'Which statement says “**some** number above 10 is even”?',
          options: [
            { text: '`∃ n : Nat, n > 10 ∧ n % 2 = 0`', correct: true, why: 'With `∃`, use `∧`: some n is above 10 *and* even.' },
            { text: '`∃ n : Nat, n > 10 → n % 2 = 0`', misconception: 'exists-implies', why: 'This is true for a silly reason: n = 0 makes `n > 10` false, so the “if” holds. It does not say anything about numbers above 10.' },
            { text: '`∀ n : Nat, n > 10 → n % 2 = 0`', misconception: 'quantifier-order', why: 'That says *every* number above 10 is even, which is false (11).' },
          ],
        },
        {
          id: 'd06-q3',
          prompt: 'Which statement says “**every** number above 10 is above 5”?',
          options: [
            { text: '`∀ n : Nat, n > 10 → n > 5`', correct: true, why: 'With `∀`, use `→`: for every n, if it is above 10, it is above 5.' },
            { text: '`∀ n : Nat, n > 10 ∧ n > 5`', misconception: 'forall-and', why: 'This says every number is above 10, which is false (take 0).' },
          ],
        },
        {
          id: 'd06-q4',
          prompt: 'To prove `∃ n : Nat, n * n = 49`, what do you need to do?',
          options: [
            { text: 'Give one number (7) and show 7 * 7 = 49.', correct: true, why: 'An existence proof needs one witness and a check that it works: `⟨7, rfl⟩`.' },
            { text: 'Show n * n = 49 for every n.', misconception: 'exists-witness', why: 'That would be a `∀` claim, and it is false. `∃` needs only one example.' },
          ],
        },
        {
          id: 'd06-q5',
          prompt: 'This is accepted by Lean. What does it really tell you?',
          code: 'theorem silly : ∃ n : Nat, n > 100 → n = 7 := ⟨0, by omega⟩',
          options: [
            { text: 'Almost nothing: n = 0 makes the “if” part false, so the implication holds.', correct: true, why: 'An implication with a false “if” part is true. Lean accepts the witness 0.' },
            { text: 'That some number above 100 equals 7.', misconception: 'exists-implies', why: 'No number above 100 equals 7. The statement does not say that, because it uses `→` instead of `∧`.' },
          ],
        },
      ],
    },

    {
      day: 7,
      title: 'Week 1 review: read it out loud',
      goal: 'Translate between Lean statements and plain English, both ways.',
      questions: [
        {
          id: 'd07-q1',
          prompt: 'Which English sentence matches?',
          code: 'theorem t (x : Nat) (h : x > 0) : ∃ y : Nat, y + 1 = x := ⟨x - 1, by omega⟩',
          options: [
            { text: 'For every natural number x, if x > 0, then there is some y with y + 1 = x.', correct: true, why: 'Variable: “for every”. Hypothesis: “if”. `∃`: “there is some”.' },
            { text: 'There is some x > 0 and some y with y + 1 = x.', misconception: 'free-variable', why: '`(x : Nat)` means “for every x”, not “some x”.' },
            { text: 'For every x and every y, if x > 0 then y + 1 = x.', misconception: 'quantifier-order', why: '`∃ y` means “some y”, chosen after x is given, not every y.' },
          ],
        },
        {
          id: 'd07-q2',
          prompt: 'Which Lean statement says “**no** natural number is below zero”?',
          options: [
            { text: '`∀ n : Nat, ¬ (n < 0)`', correct: true, why: 'For every n, it is not the case that n < 0.' },
            { text: '`∃ n : Nat, ¬ (n < 0)`', misconception: 'quantifier-order', why: 'This only says that *some* number is not below zero.' },
            { text: '`¬ ∀ n : Nat, n < 0`', misconception: 'not-scope', why: 'This says “not every number is below zero”, which is much weaker: it would still allow some to be below zero.' },
          ],
        },
        {
          id: 'd07-q3',
          prompt: 'This is accepted. A friend says “so 7 - 9 + 9 = 7”. Is that right?',
          code: 'theorem t (a b : Nat) (h : b ≤ a) : a - b + b = a := by omega',
          options: [
            { text: 'No: the theorem needs b ≤ a, and 9 ≤ 7 is false.', correct: true, why: 'The hypothesis restricts the claim. Indeed 7 - 9 + 9 = 0 + 9 = 9 on `Nat`.' },
            { text: 'Yes: the theorem is about all a and b.', misconception: 'hypothesis-is-fact', why: 'It is about all a and b *that satisfy b ≤ a*. The hypothesis matters.' },
            { text: 'Yes: subtraction then addition always cancels.', misconception: 'nat-subtraction', why: 'Not on `Nat`: 7 - 9 stops at 0, then 0 + 9 = 9.' },
          ],
        },
        {
          id: 'd07-q4',
          prompt: 'Which statement says “if n is above 3 **and** below 6, then n is 4 or 5”?',
          options: [
            { text: '`∀ n : Nat, n > 3 → n < 6 → n = 4 ∨ n = 5`', correct: true, why: 'Two arrows in a row mean “if … and …, then”.' },
            { text: '`∀ n : Nat, (n > 3 → n < 6) → n = 4 ∨ n = 5`', misconception: 'arrow-grouping', why: 'The brackets change the meaning: “if (above 3 implies below 6), then …”, which is not the claim.' },
            { text: '`∀ n : Nat, n > 3 ∧ n < 6 ∧ (n = 4 ∨ n = 5)`', misconception: 'forall-and', why: 'This claims every n is above 3, below 6, and 4 or 5, which is false for n = 0.' },
          ],
        },
        {
          id: 'd07-q5',
          prompt: 'A theorem is called `prime_gaps_bounded` and is accepted. What should you do first?',
          options: [
            { text: 'Read its statement and say it in plain English.', correct: true, why: 'The name promises; the statement delivers. Only the statement is checked.' },
            { text: 'Trust it: Lean checked it.', misconception: 'accepted-means-true', why: 'Lean checked that the proof proves *the statement*. Whether the statement is the famous result is for you to check.' },
          ],
        },
        {
          id: 'd07-q6',
          prompt: 'What does Lean show?',
          code: '#eval (20 - 25) / 0',
          options: [
            { text: '`0`', correct: true, why: '`20 - 25` is `0` on `Nat`, and anything divided by zero is `0`.' },
            { text: 'An error', misconception: 'division-convention', why: 'Neither subtraction below zero nor division by zero is an error in Lean.' },
            { text: '`-5`', misconception: 'nat-subtraction', why: 'On `Nat`, `20 - 25` is `0`. And `/ 0` gives `0` anyway.' },
          ],
        },
      ],
    },
  ],
}
