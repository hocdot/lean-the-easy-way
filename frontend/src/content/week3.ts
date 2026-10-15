import type { Week } from './types.ts'

export const week3: Week = {
  week: 3,
  title: 'Definitions, types and conventions',
  summary:
    'Definitions, recursion, structures and lists, hidden arguments, number types and conversions, junk values, and how to read Mathlib-style statements: everything that can make a statement mean something other than what it seems to say.',
  lessons: [
    {
      day: 15,
      title: 'Definitions',
      goal: 'Read a `def`, see what a statement using it really says, and know that a theorem is only as good as its definitions.',
      questions: [
        {
          id: 'd15-q1',
          prompt: 'What does Lean show?',
          code: 'def triple (n : Nat) : Nat := n + n\n\n#eval triple 5',
          options: [
            { text: '`10`', correct: true, why: 'The body is `n + n`, so `triple 5 = 5 + 5 = 10`. The name promises three times; the body computes two times.' },
            { text: '`15`', misconception: 'definition-trust', why: 'Lean does not read the name `triple`. It computes the body, `n + n`, which gives 10.' },
            { text: 'An error, because the body does not match the name', misconception: 'definition-trust', why: 'Lean never compares a name with its body. Any name is allowed, even a misleading one.' },
          ],
        },
        {
          id: 'd15-q2',
          prompt: 'What does this `def` claim?',
          code: 'def IsEven (n : Nat) : Prop := ∃ k, n = 2 * k',
          options: [
            { text: 'Nothing. It gives the name `IsEven n` to the statement `∃ k, n = 2 * k`.', correct: true, why: 'A `def` only names something. `IsEven 7` is a statement (a false one), but nobody claims it.' },
            { text: 'That every natural number is even.', misconception: 'free-variable', why: 'Here n is the input of the definition, not a “for every” claim. A `def` makes no claim at all.' },
            { text: 'That this is the correct definition of “even”, checked by Lean.', misconception: 'accepted-means-true', why: 'Lean checks that the body makes sense (it is a statement about n), not that it matches the name. Here it happens to be right; you checked that by reading it.' },
          ],
        },
        {
          id: 'd15-q3',
          prompt: 'Lean accepts this. What has really been proved?',
          code: 'def IsSquare (n : Nat) : Prop := ∃ k, n = k * 2\n\ntheorem six_is_square : IsSquare 6 := ⟨3, rfl⟩',
          options: [
            { text: 'That 6 = k * 2 for some k, that is, 6 is even.', correct: true, why: 'Unfold the definition: `IsSquare 6` is `∃ k, 6 = k * 2`, and k = 3 works.' },
            { text: 'That 6 is a perfect square.', misconception: 'definition-trust', why: '6 is not a perfect square. The body says `k * 2`, so this `IsSquare` means “even”. Lean does not read names.' },
            { text: 'Nothing: Lean must have made a mistake.', misconception: 'lean-checks-format', why: 'Lean checked correctly: 6 = 3 * 2. The mistake is in the definition, and Lean cannot know what the writer meant.' },
          ],
        },
        {
          id: 'd15-q4',
          prompt: 'Pick the step that lets `omega` finish the proof.',
          fillIn: true,
          code: 'def double (n : Nat) : Nat := 2 * n\n\ntheorem double_eq (n : Nat) : double n = n + n := by\n  ???\n  omega',
          options: [
            { text: '`unfold double`', correct: true, why: 'The goal becomes `2 * n = n + n`, plain arithmetic that `omega` proves.' },
            { text: '`rfl`', misconception: 'tactic-meaning', why: '`rfl` fails: with an unknown n, Lean cannot compute `2 * n` and `n + n` to literally the same thing.' },
            { text: '`omega`', misconception: 'tactic-meaning', why: '`omega` does not look inside `double`. It treats `double n` as an unknown number x, and `x = n + n` cannot be proved for an unknown x.' },
          ],
        },
        {
          id: 'd15-q5',
          prompt: 'Before `unfold IsEven`, the goal is `⊢ IsEven 6`. What is the goal after it? (Press Run and look at the goal.)',
          code: 'def IsEven (n : Nat) : Prop := ∃ k, n = 2 * k\n\nexample : IsEven 6 := by\n  unfold IsEven\n  sorry',
          codeExpect: 'sorry',
          options: [
            { text: '`⊢ ∃ k, 6 = 2 * k`', correct: true, why: '`unfold` puts the body of the definition in place of the name, with 6 for n.' },
            { text: '`⊢ 6 % 2 = 0`', misconception: 'definition-trust', why: 'That is another way to say “even”, but `unfold` uses exactly the body that was written, nothing else.' },
            { text: '`⊢ ∀ k, 6 = 2 * k`', misconception: 'exists-witness', why: 'The body says `∃ k` (some k), not `∀ k` (every k). `unfold` copies the body exactly.' },
          ],
        },
        {
          id: 'd15-q6',
          prompt: 'A file contains `theorem seven_prime : IsPrime 7`, and Lean accepts it. `IsPrime` is defined higher up in the same file. What do you check first?',
          options: [
            { text: 'The body of `def IsPrime`: does it really say “prime”?', correct: true, why: 'The theorem proves whatever the body says about 7. If the body is wrong, the theorem is a correct proof of the wrong thing.' },
            { text: 'Nothing: the name `IsPrime` makes the meaning clear.', misconception: 'definition-trust', why: 'Lean does not read names. `IsPrime` could be defined as `n > 1`, and then the theorem only says 7 > 1.' },
            { text: 'Whether the proof is long enough to be convincing.', misconception: 'automation-strength', why: 'Proof length tells you nothing here. If the definition is wrong, even a long, correct proof proves the wrong thing.' },
          ],
        },
      ],
    },

    {
      day: 16,
      title: 'Definitions by cases and recursion',
      goal: 'Read definitions written case by case or in terms of themselves, by computing small cases, and read the goals that induction produces.',
      questions: [
        {
          id: 'd16-q1',
          prompt: 'What does Lean show?',
          code: 'def before : Nat → Nat\n  | 0 => 0\n  | n + 1 => n\n\n#eval before 0',
          options: [
            { text: '`0`', correct: true, why: 'The first case says `| 0 => 0`. The writer chose 0, because some value must be given.' },
            { text: '`-1`', misconception: 'nat-subtraction', why: 'The result type is `Nat`, which has no negative numbers. And the first case says it directly: `0 => 0`.' },
            { text: 'An error, because nothing comes before 0', misconception: 'junk-values', why: 'Lean functions never refuse an input. The definition has a case for 0, and it gives 0.' },
          ],
        },
        {
          id: 'd16-q2',
          prompt: 'What does Lean show? Compute small cases by hand.',
          code: 'def f : Nat → Nat\n  | 0 => 2\n  | n + 1 => 3 * f n\n\n#eval f 2',
          options: [
            { text: '`18`', correct: true, why: '`f 0 = 2`, `f 1 = 3 * f 0 = 6`, `f 2 = 3 * f 1 = 18`.' },
            { text: '`9`', misconception: 'definition-trust', why: 'That is 3 × 3, as if `f 0` were 1. Read the first case: `f 0 = 2`. So f 1 = 6 and f 2 = 18.' },
            { text: '`6`', misconception: 'definition-trust', why: 'That is `f 1`. One more step: `f 2 = 3 * f 1 = 3 * 6 = 18`.' },
          ],
        },
        {
          id: 'd16-q3',
          prompt: '`sumTo n` is supposed to be 0 + 1 + … + n. What does Lean show?',
          code: 'def sumTo : Nat → Nat\n  | 0 => 0\n  | n + 1 => n + sumTo n\n\n#eval sumTo 4',
          options: [
            { text: '`6`', correct: true, why: '`sumTo 4 = 3 + sumTo 3 = 3 + 2 + sumTo 2 = 3 + 2 + 1 + sumTo 1 = 3 + 2 + 1 + 0 + sumTo 0 = 6`. The intended answer is 10, so the definition is wrong.' },
            { text: '`10`', misconception: 'definition-trust', why: 'That is what the name and the comment promise. The body adds `n`, not `n + 1`, at each step: 3 + 2 + 1 + 0 = 6.' },
          ],
        },
        {
          id: 'd16-q4',
          prompt: 'In a proof of `fact n > 0` by `induction n`, what does the `succ` case look like?',
          options: [
            { text: 'You have `ih : fact n > 0`, and you must prove `fact (n + 1) > 0`.', correct: true, why: 'Induction steps up: assuming the claim for n, prove it for n + 1.' },
            { text: 'You have `fact (n + 1) > 0`, and you must prove `fact n > 0`.', misconception: 'converse', why: 'That is backwards. The step goes from n to n + 1, so that 0 leads to 1, 1 leads to 2, and so on.' },
            { text: 'You must prove `fact n > 0` for every n, with no help.', misconception: 'goal-vs-hypothesis', why: 'The whole point of the succ case is the extra hypothesis `ih`, above the `⊢`, which you may use.' },
          ],
        },
        {
          id: 'd16-q5',
          prompt: 'Pick the step that finishes the `zero` case.',
          fillIn: true,
          code: 'def fact : Nat → Nat\n  | 0 => 1\n  | n + 1 => (n + 1) * fact n\n\ntheorem fact_pos (n : Nat) : fact n > 0 := by\n  induction n with\n  | zero => ???\n  | succ n ih => exact Nat.mul_pos (Nat.succ_pos n) ih',
          options: [
            { text: '`decide`', correct: true, why: 'The goal `fact 0 > 0` is about one specific number. Lean computes `fact 0 = 1` and checks `1 > 0`.' },
            { text: '`exact ih`', misconception: 'goal-vs-hypothesis', why: 'There is no `ih` in the zero case. The induction hypothesis only exists in the succ case.' },
            { text: '`omega`', misconception: 'tactic-meaning', why: '`omega` does not look inside `fact`. It sees `fact 0` as an unknown number, and an unknown number need not be above 0.' },
          ],
        },
        {
          id: 'd16-q6',
          prompt: '`#eval fact 0`, `#eval fact 1`, … up to `#eval fact 20` all show positive numbers. Is `∀ n, fact n > 0` now proved?',
          options: [
            { text: 'No. 21 cases are evidence; a proof such as the induction above covers every n.', correct: true, why: 'There are infinitely many n. Testing checks finitely many.' },
            { text: 'Yes, 21 cases are plenty.', misconception: 'testing-vs-proof', why: 'Checking cases is not proving. Many statements hold for the first thousand numbers and then fail.' },
          ],
        },
      ],
    },

    {
      day: 17,
      title: 'Structures, lists and dot notation',
      goal: 'Read structures, lists and the dot in `p.x`, `l.length`, `h.1` and `Nat.succ`, and find where a name comes from.',
      questions: [
        {
          id: 'd17-q1',
          prompt: 'What does Lean show?',
          code: 'structure Point where\n  x : Int\n  y : Int\n\ndef p : Point := ⟨3, -1⟩\n\n#eval p.y',
          options: [
            { text: '`-1`', correct: true, why: 'Angle brackets fill the fields in the order the structure lists them: x = 3, then y = -1.' },
            { text: '`3`', misconception: 'definition-trust', why: 'That is `p.x`. The structure lists x first and y second, so `⟨3, -1⟩` has y = -1.' },
          ],
        },
        {
          id: 'd17-q2',
          prompt: 'Pick the step that proves the goal.',
          fillIn: true,
          code: 'theorem t (n : Nat) (h : n > 0 ∧ n < 10) : n < 10 := by\n  ???',
          options: [
            { text: '`exact h.2`', correct: true, why: '`h.2` is the second part of `h`, which is `n < 10`: exactly the goal.' },
            { text: '`exact h.1`', misconception: 'exact-match', why: '`h.1` is the first part, `n > 0`, which is not the goal.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `n > 0 ∧ n < 10`. That contains the goal, but `exact` needs exactly the goal.' },
          ],
        },
        {
          id: 'd17-q3',
          prompt: 'What does this theorem say?',
          code: 'theorem t (n : Nat) : n.succ > n := by omega',
          options: [
            { text: 'For every natural number n, n + 1 > n.', correct: true, why: 'For `n : Nat`, `n.succ` means `Nat.succ n`, which is n + 1.' },
            { text: 'For one particular number called `n.succ`, it is bigger than n.', misconception: 'free-variable', why: '`n.succ` is not a new variable. The dot calls the function `Nat.succ` on n. And `(n : Nat)` means every n.' },
          ],
        },
        {
          id: 'd17-q4',
          prompt: 'Which plain-English reading is right?',
          code: 'structure Sorted3 where\n  a : Nat\n  b : Nat\n  c : Nat\n  ok : a ≤ b ∧ b ≤ c\n\ntheorem Sorted3.first_le_last (s : Sorted3) : s.a ≤ s.c :=\n  Nat.le_trans s.ok.1 s.ok.2',
          options: [
            { text: 'For any three numbers a, b, c with a ≤ b and b ≤ c, a ≤ c.', correct: true, why: 'Every `Sorted3` carries the field `ok : a ≤ b ∧ b ≤ c`. That is a hypothesis, hidden in the structure, and the proof uses it.' },
            { text: 'For any three numbers a, b, c, a ≤ c.', misconception: 'definition-trust', why: 'That is false (a = 5, c = 1). The structure’s definition includes `ok`, so only ordered triples count. Read the structure, not just the theorem.' },
          ],
        },
        {
          id: 'd17-q5',
          prompt: 'Lean accepts this. What does `Prime 7` say here?',
          code: 'namespace My\ndef Prime (n : Nat) : Prop := n > 1\nend My\n\nopen My\n\ntheorem seven_prime : Prime 7 := by\n  unfold Prime\n  decide',
          options: [
            { text: '`7 > 1`', correct: true, why: 'After `open My`, `Prime` means `My.Prime`, whose body is `n > 1`.' },
            { text: '7 is a prime number.', misconception: 'definition-trust', why: 'The name `Prime` refers to `My.Prime`, which only says n > 1. By this definition, 4 is “prime” too.' },
          ],
        },
        {
          id: 'd17-q6',
          prompt: 'What does this statement say?',
          code: 'example (l1 l2 : List Nat) : (l1 ++ l2).length = l1.length + l2.length :=\n  List.length_append',
          options: [
            { text: 'For all lists l1 and l2, joining them gives a list whose length is the sum of their lengths.', correct: true, why: '`++` joins lists, and `l.length` is `List.length l`, the number of entries.' },
            { text: 'For two particular lists l1 and l2, chosen somewhere else.', misconception: 'free-variable', why: 'Variables before the colon mean “for every”, lists included.' },
            { text: 'Adding up the numbers in l1 and l2 gives the same total either way.', misconception: 'definition-trust', why: '`++` does not add numbers; it joins two lists into one. And `length` counts entries, it does not add them up.' },
          ],
        },
      ],
    },

    {
      day: 18,
      title: 'Hidden arguments',
      goal: 'Find the arguments a statement does not show: curly braces, square brackets, and variables Lean adds by itself.',
      questions: [
        {
          id: 'd18-q1',
          prompt: 'Press Run: Lean shows the full statement of a library theorem, hidden arguments included. What does it say?',
          code: '#check @List.length_append',
          options: [
            { text: 'For every type α and all lists as and bs with entries in α, the length of `as ++ bs` is the sum of their lengths.', correct: true, why: 'Everything in `{ }` after `∀` is still “for every”.' },
            { text: 'Only something about two lists `as` and `bs` that are fixed elsewhere.', misconception: 'implicit-arguments', why: 'Curly-brace arguments are part of the statement and mean “for every”. Lean only fills them in by itself when the theorem is used.' },
            { text: 'Only something about lists of natural numbers.', misconception: 'free-variable', why: 'α is a variable: it stands for every type, so the theorem covers lists of anything.' },
          ],
        },
        {
          id: 'd18-q2',
          prompt: 'In core Lean, is this accepted, and what does it say?',
          code: 'theorem t (h : x > 5) : x > 3 := by omega',
          options: [
            { text: 'Accepted: for every natural number x, if x > 5 then x > 3.', correct: true, why: 'autoImplicit silently adds `{x : Nat}`, a hidden “for every”.' },
            { text: 'Rejected, because `x` is never declared.', misconception: 'implicit-arguments', why: 'In core Lean, autoImplicit is on: an undeclared name becomes a hidden argument. (Mathlib turns this off, and then it would be rejected.)' },
            { text: 'Accepted, but only about one particular x.', misconception: 'free-variable', why: 'The hidden argument means “for every x”, like any other variable in a statement.' },
          ],
        },
        {
          id: 'd18-q3',
          prompt: 'Lean accepts this. What does it prove?',
          code: 'theorem length_self : lenght = lenght := rfl\n\n#check @length_self',
          options: [
            { text: 'Only that any value equals itself: `lenght` (a typo) became a hidden variable.', correct: true, why: '`#check @length_self` shows `∀ {α : Sort u_1} {lenght : α}, lenght = lenght`. Nothing about lengths.' },
            { text: 'Something about the length of lists.', misconception: 'accepted-means-true', why: 'No function `lenght` exists. autoImplicit turned the typo into a new variable, so the statement is `x = x`.' },
          ],
        },
        {
          id: 'd18-q4',
          prompt: 'What does Lean show?',
          code: 'def addSelf {α : Type} [Add α] (x : α) : α := x + x\n\n#eval addSelf (-3 : Int)',
          options: [
            { text: '`-6`', correct: true, why: 'α is `Int` here, and `[Add α]` finds integer addition: -3 + -3 = -6.' },
            { text: 'An error: `addSelf` only works for one type.', misconception: 'free-variable', why: '`{α : Type}` means every type that has an addition. `Int` qualifies.' },
          ],
        },
        {
          id: 'd18-q5',
          prompt: 'Pick the step that uses `pos_ne_zero` correctly.',
          fillIn: true,
          code: 'theorem pos_ne_zero {n : Nat} (h : n > 0) : n ≠ 0 := by omega\n\nexample : 5 ≠ 0 := by\n  ???',
          options: [
            { text: '`exact pos_ne_zero (by decide)`', correct: true, why: 'Lean fills in n = 5 itself, by matching `n ≠ 0` with the goal `5 ≠ 0`. You only supply the proof of `5 > 0`.' },
            { text: '`exact pos_ne_zero 5 (by decide)`', misconception: 'implicit-arguments', why: 'n is in curly braces, so Lean fills it in and you must not pass it. Lean takes 5 as the proof of `n > 0` and complains.' },
            { text: '`exact pos_ne_zero`', misconception: 'exact-match', why: 'Without the proof of `n > 0`, `pos_ne_zero` is “if n > 0 then n ≠ 0”, not `5 ≠ 0`.' },
          ],
        },
        {
          id: 'd18-q6',
          prompt: 'What does the `@` do here?',
          code: 'def twice {α : Type} (f : α → α) (x : α) : α := f (f x)\n\n#eval @twice Nat (fun n => n + 3) 10',
          options: [
            { text: 'It makes the hidden argument α visible, so it can be given by hand (here `Nat`).', correct: true, why: 'With `@`, every argument is explicit, including the ones in curly braces.' },
            { text: 'It adds a new argument that `twice` did not have before.', misconception: 'implicit-arguments', why: 'α was always an argument of `twice`, hidden in curly braces. `@` only lets you see it and give it.' },
          ],
        },
      ],
    },

    {
      day: 19,
      title: 'Number types and hidden conversions',
      goal: 'Tell which number type a statement is about, and read the conversion arrow `↑`.',
      questions: [
        {
          id: 'd19-q1',
          prompt: 'What does Lean show?',
          code: '#eval ((2 - 5 : Nat) : Int)',
          options: [
            { text: '`0`', correct: true, why: 'The subtraction happens in `Nat` first: 2 - 5 = 0. Then 0 is converted to an integer.' },
            { text: '`-3`', misconception: 'coercion', why: 'The conversion to `Int` comes *after* the subtraction, which was done in `Nat` and stopped at 0.' },
          ],
        },
        {
          id: 'd19-q2',
          prompt: 'Which of these is equal to -3?',
          options: [
            { text: '`(2 : Int) - 5`', correct: true, why: '2 is an integer, so 5 is read as an integer too, and the subtraction is done in `Int`.' },
            { text: '`((2 - 5 : Nat) : Int)`', misconception: 'coercion', why: 'Here the subtraction is done in `Nat` (giving 0) before the conversion. The result is 0.' },
            { text: '`2 - 5`', misconception: 'nat-subtraction', why: 'Plain numerals are `Nat`, so `2 - 5` is 0.' },
          ],
        },
        {
          id: 'd19-q3',
          prompt: 'Lean shows `fun n m => ↑n + m : Nat → Int → Int`. What is `↑n`?',
          code: '#check fun (n : Nat) (m : Int) => n + m',
          options: [
            { text: 'n converted to an integer: the same value, now of type `Int`.', correct: true, why: '`↑` marks a coercion. Lean inserted it because `n + m` needs both sides to be integers.' },
            { text: 'A bigger number than n, such as n + 1.', misconception: 'coercion', why: 'The arrow does not change the value. It only changes the type from `Nat` to `Int`.' },
          ],
        },
        {
          id: 'd19-q4',
          prompt: 'Why does this theorem need the hypothesis `h`?',
          code: 'theorem sub_cast (a b : Nat) (h : b ≤ a) :\n    ((a - b : Nat) : Int) = (a : Int) - (b : Int) := by omega',
          options: [
            { text: 'Without it the statement is false: for a = 3, b = 5, the left side is 0 and the right side is -2.', correct: true, why: 'On the left, subtraction happens in `Nat` and stops at 0. On the right, it happens in `Int`. They agree only when b ≤ a.' },
            { text: 'It is not needed: converting before or after subtracting gives the same result.', misconception: 'coercion', why: 'Try a = 3, b = 5: `↑(3 - 5) = ↑0 = 0`, but `↑3 - ↑5 = -2`.' },
          ],
        },
        {
          id: 'd19-q5',
          prompt: 'The claim is “for every real number x, x × x ≥ 0”. Lean accepts this. What has been proved?',
          code: 'theorem sq_nonneg\' (x : Nat) : x * x ≥ 0 := Nat.zero_le _',
          options: [
            { text: 'Only the statement for natural numbers, where it is trivial (every `Nat` is ≥ 0).', correct: true, why: 'The variable has type `Nat`. Real numbers include negatives like -2.5, which this statement never mentions.' },
            { text: 'The claim about real numbers.', misconception: 'statement-drift', why: 'The type in the statement is `Nat`, not ℝ. A theorem about natural numbers is a different, much weaker theorem.' },
            { text: 'Nothing: Lean cannot prove things about `Nat`.', misconception: 'lean-checks-format', why: 'The proof is fine. It proves exactly the `Nat` statement, which is not the claim.' },
          ],
        },
        {
          id: 'd19-q6',
          prompt: 'In Mathlib, with `n : ℕ` and n = 3, what is the value of this real number?',
          code: '-- needs Mathlib\n((n / 2 : ℕ) : ℝ)',
          codeExpect: 'skip',
          options: [
            { text: '`1`', correct: true, why: 'The division happens in ℕ first and rounds down: 3 / 2 = 1. Then 1 is converted to a real number.' },
            { text: '`1.5`', misconception: 'coercion', why: 'That would be `(n : ℝ) / 2`, which converts first and then divides as real numbers. Here the conversion comes last.' },
          ],
        },
      ],
    },

    {
      day: 20,
      title: 'Junk values and Mathlib-style statements',
      goal: 'Spot statements that depend on junk values, and read `∀ ε > 0`, `∃ δ > 0`, `∑`, `Nat.Prime` and `∈`.',
      questions: [
        {
          id: 'd20-q1',
          prompt: 'Which statement is true for **every** natural number x?',
          options: [
            { text: '`x > 0 → x / x = 1`', correct: true, why: 'With x > 0, the division is a real division and gives 1. The hypothesis rules out the junk case x = 0.' },
            { text: '`x / x = 1`', misconception: 'junk-values', why: 'At x = 0, Lean computes 0 / 0 = 0, not 1.' },
            { text: '`x - 1 + 1 = x`', misconception: 'nat-subtraction', why: 'At x = 0: 0 - 1 = 0 on `Nat`, so the left side is 1.' },
          ],
        },
        {
          id: 'd20-q2',
          prompt: 'In Mathlib, what is `Real.sqrt (-4)`?',
          options: [
            { text: '`0`', correct: true, why: 'The square root of a negative real number is the junk value 0 in Mathlib.' },
            { text: 'An error: negative numbers have no real square root.', misconception: 'junk-values', why: 'Every function in Lean gives a value on every input. `Real.sqrt` returns 0 for negative inputs.' },
            { text: '`-2`', misconception: 'junk-values', why: '(-2) × (-2) = 4, not -4. No real number squares to -4, so Mathlib returns the junk value 0.' },
          ],
        },
        {
          id: 'd20-q3',
          prompt: 'What does `∀ ε > 0, ∃ δ > 0, P ε δ` mean?',
          options: [
            { text: '`∀ ε, ε > 0 → ∃ δ, δ > 0 ∧ P ε δ`', correct: true, why: 'The `∀` shorthand unfolds with `→`, the `∃` shorthand with `∧`.' },
            { text: '`∀ ε, ε > 0 ∧ ∃ δ, δ > 0 → P ε δ`', misconception: 'bounded-quantifier', why: 'This swaps the connectives. It would claim every ε is positive, which is false for ε = 0.' },
            { text: '`∀ ε, ε > 0 → ∃ δ, δ > 0 → P ε δ`', misconception: 'exists-implies', why: 'With `∃`, the condition is joined by `∧`. With `→`, any δ that is not positive would make the inside true for a silly reason.' },
          ],
        },
        {
          id: 'd20-q4',
          prompt: 'In Mathlib, what is `∑ i ∈ Finset.range 4, i`?',
          code: '-- needs Mathlib\n∑ i ∈ Finset.range 4, i',
          codeExpect: 'skip',
          options: [
            { text: '`6`', correct: true, why: '`Finset.range 4` is {0, 1, 2, 3}, and 0 + 1 + 2 + 3 = 6.' },
            { text: '`10`', misconception: 'statement-drift', why: 'That is 1 + 2 + 3 + 4. `Finset.range 4` stops at 3. Off-by-one differences like this are easy to miss when comparing a statement with a claim.' },
          ],
        },
        {
          id: 'd20-q5',
          prompt: 'Lean rejects this. Is the statement true?',
          code: 'example : ∀ ε > 0, ∃ δ > 0, δ < ε := by\n  intro ε hε\n  exact ⟨ε / 2, by omega, by omega⟩',
          codeExpect: 'error',
          options: [
            { text: 'No. The numbers here are `Nat`, and for ε = 1 no natural number lies strictly between 0 and 1.', correct: true, why: 'Plain numerals make ε and δ natural numbers. On real numbers the statement would be true.' },
            { text: 'Yes. Take δ = ε / 2; Lean only failed to see it.', misconception: 'division-convention', why: 'On `Nat`, 1 / 2 = 0, which is not > 0. δ = ε / 2 works for real numbers, not here.' },
          ],
        },
        {
          id: 'd20-q6',
          prompt: 'What does this say?',
          code: 'example : ∃ n > 5, n < 7 := ⟨6, by decide⟩',
          options: [
            { text: 'There is a natural number n with n > 5 and n < 7.', correct: true, why: '`∃ n > 5, …` means `∃ n, n > 5 ∧ …`. The witness is 6.' },
            { text: 'There is a natural number n such that if n > 5, then n < 7.', misconception: 'bounded-quantifier', why: 'The `∃` shorthand uses `∧`, not `→`. With `→`, n = 0 would work for a silly reason.' },
          ],
        },
      ],
    },

    {
      day: 21,
      title: 'Week 3 review: what was really proved?',
      goal: 'Read a definition together with a theorem about it, and say exactly what was proved.',
      questions: [
        {
          id: 'd21-q1',
          prompt: 'What does Lean show?',
          code: 'def avg (a b : Nat) : Nat := (a + b) / 2\n\n#eval avg 3 4',
          options: [
            { text: '`3`', correct: true, why: '(3 + 4) / 2 = 7 / 2, which rounds down to 3 on `Nat`.' },
            { text: '`3.5`', misconception: 'division-convention', why: 'The result type is `Nat`, which has no fractions. Division rounds down.' },
            { text: '`4`', misconception: 'division-convention', why: 'Lean rounds down, not to the nearest number.' },
          ],
        },
        {
          id: 'd21-q2',
          prompt: 'In this theorem, what are `a` and `b`?',
          code: 'def avg (a b : Nat) : Nat := (a + b) / 2\n\ntheorem avg_between (h : a ≤ b) : a ≤ avg a b ∧ avg a b ≤ b := by\n  unfold avg\n  omega',
          options: [
            { text: 'Hidden variables added by autoImplicit: the theorem is about all natural numbers a and b with a ≤ b.', correct: true, why: '`#check @avg_between` would show `∀ {a b : Nat}, a ≤ b → …`.' },
            { text: 'Two particular numbers defined somewhere else.', misconception: 'free-variable', why: 'Nothing named a or b is defined. Undeclared names in a statement become “for every” variables.' },
            { text: 'Not part of the statement, since they are not declared.', misconception: 'implicit-arguments', why: 'They are part of the statement, as hidden curly-brace arguments. Hidden does not mean absent.' },
          ],
        },
        {
          id: 'd21-q3',
          prompt: 'Lean accepts this. A paper says “we proved in Lean that 0 is positive”. What was really proved?',
          code: 'def IsPositive (x : Int) : Prop := x ≥ 0\n\ntheorem zero_pos : IsPositive 0 := by\n  unfold IsPositive\n  decide',
          options: [
            { text: 'Only that 0 ≥ 0. The definition uses ≥, so it means “not negative”, not “positive”.', correct: true, why: '“Positive” means > 0. The body says ≥ 0, which 0 satisfies.' },
            { text: 'That 0 is positive.', misconception: 'definition-trust', why: 'Lean does not read the name `IsPositive`. Its body says `x ≥ 0`, so the theorem says `0 ≥ 0`.' },
            { text: 'Nothing, because `decide` only checks one number.', misconception: 'testing-vs-proof', why: 'The statement is about one number, 0, so checking that one number is a complete proof. The problem is the definition, not the proof.' },
          ],
        },
        {
          id: 'd21-q4',
          prompt: 'Lean rejects this. Why?',
          code: 'theorem t (n : Nat) : ((n - 1 : Nat) : Int) = (n : Int) - 1 := by omega',
          codeExpect: 'error',
          options: [
            { text: 'It is false for n = 0: the left side is ↑(0 - 1) = 0, the right side is 0 - 1 = -1.', correct: true, why: 'The left side subtracts in `Nat` before converting. The statement would need `(h : n ≥ 1)`.' },
            { text: 'It is true, but `omega` cannot handle `Int`.', misconception: 'coercion', why: '`omega` handles `Nat`, `Int` and the conversion between them. The statement really is false at n = 0.' },
          ],
        },
        {
          id: 'd21-q5',
          prompt: 'In Mathlib, is this statement true?',
          code: '-- needs Mathlib\ntheorem t (x : ℝ) : Real.sqrt x * Real.sqrt x = x',
          codeExpect: 'skip',
          options: [
            { text: 'No: for x = -4, `Real.sqrt (-4) = 0`, so the left side is 0, not -4.', correct: true, why: 'Because of the junk value, the statement needs the hypothesis `0 ≤ x`, and Mathlib’s version has it.' },
            { text: 'Yes: Real.sqrt only accepts x ≥ 0, so the statement is only about those x.', misconception: 'junk-values', why: '`Real.sqrt` accepts every real number. For negatives it returns 0, and that breaks the statement.' },
          ],
        },
        {
          id: 'd21-q6',
          prompt: 'Pick the step that lets `omega` finish the proof.',
          fillIn: true,
          code: 'def avg (a b : Nat) : Nat := (a + b) / 2\n\ntheorem avg_le (a b : Nat) (h : a ≤ b) : avg a b ≤ b := by\n  ???\n  omega',
          options: [
            { text: '`unfold avg`', correct: true, why: 'The goal becomes `(a + b) / 2 ≤ b`, which `omega` proves using h.' },
            { text: '`intro h`', misconception: 'intro-meaning', why: 'The goal has no `→` or `∀` to introduce. `h` is already a hypothesis above the `⊢`.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `a ≤ b`, but the goal is `avg a b ≤ b`. They are not the same.' },
          ],
        },
      ],
    },
  ],
}
