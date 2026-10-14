import type { Week } from './types.ts'

export const week2: Week = {
  week: 2,
  title: 'Following a proof step by step',
  summary: 'Tactic proofs and the goal display: intro, exact, constructor, cases, witnesses, apply, have, rewriting, and what automation does (and does not) tell you.',
  lessons: [
    {
      day: 8,
      title: 'Proofs are step by step',
      goal: 'Read a goal display: what you have, what you still need, and when the proof is done.',
      cards: [
        `Last week most proofs were one word, like \`rfl\`. Longer proofs start with \`by\`:

\`\`\`lean
theorem bigger (n : Nat) (h : n > 5) : n > 3 := by
  omega
\`\`\`

After \`by\` comes a list of **tactics**, one per line. A tactic is an instruction such as “compute both sides” or “assume the if-part”. Each tactic changes what is left to prove, and Lean checks every step.

You will not write tactics in this course. You will learn to **follow** them, the way you follow the moves of a chess game someone else plays.`,

        `To follow a proof, look at the **goal display**. Lean shows it at every step. At the start of the proof above, it looks like this:

\`\`\`
n : Nat
h : n > 5
⊢ n > 3
\`\`\`

- Above the \`⊢\` is what you **have**: the variable \`n\` and the hypothesis \`h\`, which you may use.
- After the \`⊢\` (read it “prove”) is the **goal**: what you still **need** to show.

> In the **Lab** tab, click any line of a proof to see the goal display at that point.`,

        `A proof is finished when nothing is left to prove. After \`omega\` in the proof above, Lean shows **No goals**: the theorem is proved.

Some tactics are **finishing** tactics. They either close the goal completely or fail with an error:

- \`rfl\`: both sides of an \`=\` compute to the same value.
- \`decide\`: a statement about specific numbers, settled by computing.
- \`omega\`: arithmetic with \`+\`, \`-\`, constants, \`<\`, \`≤\`, \`=\`, using the hypotheses.

If the proof ends while some goal is still open, Lean reports an error, \`unsolved goals\`, and shows what is left.`,

        `A tactic only works on goals of the right shape. \`decide\` computes, so it needs specific numbers. Here the statement is true, but \`decide\` cannot handle a variable:

\`\`\`lean error
theorem add_zero' (n : Nat) : n + 0 = n := by
  decide
\`\`\`

\`rfl\` succeeds on the same statement, because \`n + 0\` computes to \`n\` whatever n is:

\`\`\`lean
theorem add_zero'' (n : Nat) : n + 0 = n := by
  rfl
\`\`\`

> For an auditor: a rejected proof does not mean the statement is false, and an accepted one only means the steps fit together. The goal display shows you exactly what each step had to prove.`,
      ],
      questions: [
        {
          id: 'd08-q1',
          prompt: `In this goal display, what still has to be proved?

\`\`\`
n : Nat
h : n > 5
⊢ n > 3
\`\`\``,
          options: [
            { text: '`n > 3`', correct: true, why: 'The goal is the line after `⊢`. Everything above it is available to use.' },
            { text: '`n > 5`', misconception: 'goal-vs-hypothesis', why: '`h : n > 5` sits above `⊢`: it is something you *have*, an assumption you may use, not something to prove.' },
            { text: 'Both `n > 5` and `n > 3`', misconception: 'goal-vs-hypothesis', why: 'Only the line after `⊢` is a goal. The lines above it are what you have.' },
          ],
        },
        {
          id: 'd08-q2',
          prompt: `What does the line \`h : a < b\` mean here?

\`\`\`
a b : Nat
h : a < b
⊢ a ≤ b
\`\`\``,
          options: [
            { text: 'We may assume `a < b`, and refer to it by the name `h`.', correct: true, why: 'Lines above `⊢` are hypotheses: assumptions the proof is allowed to use.' },
            { text: 'We must prove `a < b` before proving `a ≤ b`.', misconception: 'goal-vs-hypothesis', why: 'Above `⊢` is what you have, not what you need. The only goal is `a ≤ b`.' },
            { text: 'Lean has checked that `a < b` is true.', misconception: 'hypothesis-is-fact', why: 'A hypothesis is an assumption. Lean never checks it can be true; take a = 5, b = 2 and it is false.' },
          ],
        },
        {
          id: 'd08-q3',
          prompt: 'After the last tactic of a proof, the goal display says **No goals**. What does that mean?',
          options: [
            { text: 'Nothing is left to prove: the proof is complete.', correct: true, why: 'Each tactic changes what is left. When nothing is left, the theorem is proved.' },
            { text: 'Lean could not find anything to prove, so the proof failed.', misconception: 'tactic-meaning', why: 'A failure shows up as a red error. “No goals” is the success state: every goal has been closed.' },
          ],
        },
        {
          id: 'd08-q4',
          prompt: 'Pick the tactic that finishes this proof.',
          code: 'theorem t (n : Nat) (h : n > 5) : n > 3 := by\n  ???',
          fillIn: true,
          options: [
            { text: '`omega`', correct: true, why: '`omega` does arithmetic with the hypotheses: from n > 5 it gets n > 3.' },
            { text: '`rfl`', misconception: 'tactic-meaning', why: '`rfl` proves equalities whose two sides compute to the same value. `n > 3` is not an equality.' },
            { text: '`decide`', misconception: 'tactic-meaning', why: '`decide` computes with specific numbers. Here n is a variable, so there is nothing to compute.' },
          ],
        },
        {
          id: 'd08-q5',
          prompt: 'Lean rejects this proof. Why?',
          code: 'theorem t (n : Nat) : n * 1 = n := by\n  decide',
          codeExpect: 'error',
          options: [
            { text: '`decide` cannot handle the variable n, even though the statement is true.', correct: true, why: 'The statement is true for every n, but `decide` only settles statements about specific numbers. Another tactic (`omega`) proves it.' },
            { text: 'The statement is false.', misconception: 'lean-checks-format', why: 'n * 1 = n holds for every n. A rejected proof only means this step did not work, not that the claim is false.' },
            { text: 'Any tactic that sounds right should work, so this is a bug.', misconception: 'tactic-meaning', why: 'Each tactic fits certain goals. `decide` needs specific numbers to compute with.' },
          ],
        },
        {
          id: 'd08-q6',
          prompt: 'At the start of this proof, what is after the `⊢`?',
          code: 'theorem t (a b : Nat) (h1 : a < b) (h2 : b < 10) : a < 10 := by\n  omega',
          options: [
            { text: '`a < 10`', correct: true, why: 'The conclusion, after the colon, is the goal. `h1` and `h2` appear above `⊢`.' },
            { text: '`a < b`', misconception: 'goal-vs-hypothesis', why: 'That is `h1`, a hypothesis. It is listed above `⊢` as something you have.' },
            { text: '`a < b ∧ b < 10 ∧ a < 10`', misconception: 'goal-vs-hypothesis', why: 'Hypotheses are not added to the goal. You have `a < b` and `b < 10`; you need only `a < 10`.' },
          ],
        },
      ],
    },

    {
      day: 9,
      title: 'intro and exact',
      goal: 'Follow `intro`, `exact` and `assumption`, and predict the goal after each.',
      cards: [
        `How do you prove “if P, then Q”? Assume P, then show Q. The tactic \`intro\` does the assuming:

\`\`\`lean
theorem bigger' (n : Nat) : n > 5 → n > 3 := by
  intro h
  omega
\`\`\`

Before \`intro h\`, and after it:

\`\`\`
n : Nat
⊢ n > 5 → n > 3
\`\`\`

\`\`\`
n : Nat
h : n > 5
⊢ n > 3
\`\`\`

The if-part moved above the line, with the name \`h\`. Nothing was proved yet: \`intro\` only changes the form of the goal.`,

        `\`intro\` also works on \`∀\`. To prove “for every n, …”, take an arbitrary n and prove the claim for it:

\`\`\`lean
theorem add_zero_all : ∀ n : Nat, n + 0 = n := by
  intro n
  rfl
\`\`\`

\`\`\`
⊢ ∀ (n : Nat), n + 0 = n
\`\`\`

becomes

\`\`\`
n : Nat
⊢ n + 0 = n
\`\`\`

You do not get to pick n. It stands for any natural number, so whatever follows must work for all of them.`,

        `When a hypothesis says **exactly** the goal, \`exact\` finishes the proof:

\`\`\`lean
theorem pick (P Q : Prop) (hp : P) (hq : Q) : P := by
  exact hp
\`\`\`

(\`P Q : Prop\` means P and Q are any statements at all.) \`exact hq\` would fail: \`hq\` says Q, but the goal is P.

\`assumption\` does the same job without a name: it looks through the hypotheses for one that is exactly the goal.

\`\`\`lean
theorem pick' (P Q : Prop) (hp : P) (hq : Q) : Q := by
  assumption
\`\`\``,

        `\`intro\` can take several names at once. Follow this one in the Lab, clicking each line:

\`\`\`lean
theorem first (P Q : Prop) : P → Q → P := by
  intro hp hq
  exact hp
\`\`\`

After \`intro hp hq\` you have \`hp : P\` and \`hq : Q\`, and the goal is \`P\`. Then \`exact hp\` closes it.

> For an auditor: \`intro\` and \`exact\` are bookkeeping. They never make anything true that was not already given. If a proof is mostly \`intro\` and \`exact\`, the real content is in the hypotheses, so read those carefully.`,
      ],
      questions: [
        {
          id: 'd09-q1',
          prompt: 'Pick the first step.',
          code: 'theorem t (n : Nat) : n > 5 → n > 3 := by\n  ???\n  omega',
          fillIn: true,
          options: [
            { text: '`intro h`', correct: true, why: 'The goal is an “if … then”. `intro h` assumes `n > 5` as `h`, leaving `n > 3` for `omega`.' },
            { text: '`exact h`', misconception: 'goal-vs-hypothesis', why: 'There is no `h` yet. `n > 5` is part of the goal, not a hypothesis, until `intro` moves it above the line.' },
            { text: '`rfl`', misconception: 'tactic-meaning', why: '`rfl` is for equalities. The goal is an implication, `n > 5 → n > 3`.' },
          ],
        },
        {
          id: 'd09-q2',
          prompt: `This is the goal display. What does it become after \`intro h\`?

\`\`\`
n : Nat
⊢ n > 5 → n > 3
\`\`\``,
          options: [
            { text: 'A new hypothesis `h : n > 5`, and the goal `n > 3`.', correct: true, why: '`intro h` moves the if-part above the line and leaves the then-part as the goal.' },
            { text: 'The goal becomes `n > 5`.', misconception: 'intro-meaning', why: '`intro` does not ask you to prove the if-part. It lets you *assume* it.' },
            { text: 'No goals: `intro` proves the implication.', misconception: 'intro-meaning', why: '`intro` proves nothing by itself. You still have to show `n > 3`.' },
          ],
        },
        {
          id: 'd09-q3',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (P Q : Prop) (hp : P) (hq : Q) : Q := by\n  ???',
          fillIn: true,
          options: [
            { text: '`exact hq`', correct: true, why: '`hq` says Q, which is exactly the goal.' },
            { text: '`exact hp`', misconception: 'exact-match', why: '`hp` says P, but the goal is Q. `exact` needs a hypothesis that says exactly the goal.' },
            { text: '`intro hq`', misconception: 'intro-meaning', why: 'The goal Q has no `→` or `∀` to introduce. `hq` is already a hypothesis.' },
          ],
        },
        {
          id: 'd09-q4',
          prompt: 'Pick the first step.',
          code: 'theorem t : ∀ n : Nat, n * 1 = n := by\n  ???\n  omega',
          fillIn: true,
          options: [
            { text: '`intro n`', correct: true, why: 'For a `∀` goal, `intro n` takes an arbitrary n. The goal becomes `n * 1 = n`, which `omega` proves.' },
            { text: '`exact n`', misconception: 'goal-vs-hypothesis', why: 'There is no `n` above the line yet; it is bound inside the goal. And `n` is a number, not a proof.' },
            { text: '`rfl`', misconception: 'tactic-meaning', why: 'The goal starts with `∀`, so it is not an equality yet. `intro` comes first.' },
          ],
        },
        {
          id: 'd09-q5',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (a b : Nat) (h1 : a < b) (h2 : b < 10) : b < 10 := by\n  ???',
          fillIn: true,
          options: [
            { text: '`assumption`', correct: true, why: '`assumption` finds `h2`, which is exactly the goal `b < 10`.' },
            { text: '`exact h1`', misconception: 'exact-match', why: '`h1` says `a < b`, not `b < 10`. Related is not enough for `exact`.' },
            { text: '`intro h2`', misconception: 'intro-meaning', why: '`b < 10` has no `→` or `∀`, so there is nothing to introduce.' },
          ],
        },
        {
          id: 'd09-q6',
          prompt: 'To prove `n > 5 → n > 3`, `intro h` adds `h : n > 5` to what we have. Why is that allowed?',
          options: [
            { text: 'To prove “if n > 5 then n > 3”, we may assume n > 5 and show n > 3.', correct: true, why: 'That is how “if … then” is proved, on paper and in Lean.' },
            { text: 'Because Lean checked that n > 5.', misconception: 'hypothesis-is-fact', why: 'Nobody checked it; n could be 0. `h` is only assumed, for the purpose of proving the then-part.' },
            { text: 'Because `intro` proves n > 5.', misconception: 'intro-meaning', why: '`intro` proves nothing. It turns “prove if P then Q” into “assume P, prove Q”.' },
          ],
        },
      ],
    },

    {
      day: 10,
      title: 'Taking apart and building “and”',
      goal: 'Follow `constructor`, `h.1`/`h.2`, `obtain` and bullets on `∧` and `↔`.',
      cards: [
        `To prove \`P ∧ Q\` you must prove P and prove Q. The tactic \`constructor\` splits the goal into those two:

\`\`\`
P Q : Prop
hp : P
hq : Q
⊢ P ∧ Q
\`\`\`

After \`constructor\` there are **two** goals, named \`case left\` and \`case right\`:

\`\`\`
case left
P Q : Prop
hp : P
hq : Q
⊢ P
case right
P Q : Prop
hp : P
hq : Q
⊢ Q
\`\`\`

Both must be closed before the proof is done.`,

        `With several goals, a proof uses **bullets**, \`·\`, to work on one goal at a time:

\`\`\`lean
theorem both (P Q : Prop) (hp : P) (hq : Q) : P ∧ Q := by
  constructor
  · exact hp
  · exact hq
\`\`\`

The first bullet handles \`case left\` (goal P), the second handles \`case right\` (goal Q). Each bullet must close its goal completely. Click the lines in the Lab to watch the goals disappear one by one.`,

        `\`↔\` is two implications, so \`constructor\` also splits it, into \`case mp\` (left to right) and \`case mpr\` (right to left):

\`\`\`lean
theorem shift (n : Nat) : n + 1 > 5 ↔ n > 4 := by
  constructor
  · intro h
    omega
  · intro h
    omega
\`\`\`

After \`constructor\`:

\`\`\`
case mp
n : Nat
⊢ n + 1 > 5 → n > 4
case mpr
n : Nat
⊢ n > 4 → n + 1 > 5
\`\`\``,

        `Now the other side: **using** a hypothesis \`h : P ∧ Q\`. It holds two facts. \`h.1\` is the first (P) and \`h.2\` the second (Q). Or \`obtain\` unpacks it into two named hypotheses:

\`\`\`lean
theorem swap (P Q : Prop) (h : P ∧ Q) : Q ∧ P := by
  obtain ⟨hp, hq⟩ := h
  constructor
  · exact hq
  · exact hp
\`\`\`

After \`obtain ⟨hp, hq⟩ := h\`, the display shows \`hp : P\` and \`hq : Q\` in place of \`h\`.

> For an auditor: a hypothesis with \`∧\` is several assumptions at once. Unpack it and check each part.`,
      ],
      questions: [
        {
          id: 'd10-q1',
          prompt: 'Pick the first step.',
          code: 'theorem t (P Q : Prop) (hp : P) (hq : Q) : P ∧ Q := by\n  ???\n  · exact hp\n  · exact hq',
          fillIn: true,
          options: [
            { text: '`constructor`', correct: true, why: '`constructor` splits `P ∧ Q` into the goals P and Q, which the two bullets close.' },
            { text: '`intro h`', misconception: 'tactic-meaning', why: '`intro` is for `→` and `∀`. The goal `P ∧ Q` has neither.' },
            { text: '`exact hp`', misconception: 'exact-match', why: '`hp` proves P, but the goal is `P ∧ Q`. Half of an “and” is not the whole.' },
          ],
        },
        {
          id: 'd10-q2',
          prompt: `What does the goal display look like after \`constructor\`?

\`\`\`
n : Nat
h : n > 2 ∧ n < 10
⊢ n > 2 ∧ n < 10
\`\`\``,
          options: [
            { text: 'Two goals: `case left` with `⊢ n > 2`, and `case right` with `⊢ n < 10`.', correct: true, why: '`constructor` on `∧` gives one goal for each side. Both still have `h` available.' },
            { text: 'One goal, `⊢ n > 2`; the other side is dropped.', misconception: 'tactic-meaning', why: 'Nothing is dropped. Both sides of an “and” must be proved, so there are two goals.' },
            { text: 'No goals: `constructor` proves it.', misconception: 'tactic-meaning', why: '`constructor` only splits the goal. Each part still needs its own proof, here `exact h.1` and `exact h.2`.' },
          ],
        },
        {
          id: 'd10-q3',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (P Q : Prop) (h : P ∧ Q) : P := by\n  ???',
          fillIn: true,
          options: [
            { text: '`exact h.1`', correct: true, why: '`h.1` is the first part of `h`, which is P.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `P ∧ Q`, not P. You need to take out the first part: `h.1`.' },
            { text: '`exact h.2`', misconception: 'exact-match', why: '`h.2` is the second part, Q. The goal is P.' },
          ],
        },
        {
          id: 'd10-q4',
          prompt: `After \`obtain ⟨h1, h2⟩ := h\` the display is:

\`\`\`
n : Nat
h1 : n > 2
h2 : n < 5
⊢ n < 5
\`\`\`

Pick the step that finishes the proof.`,
          code: 'theorem t (n : Nat) (h : n > 2 ∧ n < 5) : n < 5 := by\n  obtain ⟨h1, h2⟩ := h\n  ???',
          fillIn: true,
          options: [
            { text: '`exact h2`', correct: true, why: '`h2 : n < 5` is exactly the goal.' },
            { text: '`exact h1`', misconception: 'exact-match', why: '`h1` says `n > 2`, not `n < 5`.' },
            { text: '`exact h`', misconception: 'exact-match', why: 'After `obtain`, `h` is gone, replaced by `h1` and `h2`. And it said `n > 2 ∧ n < 5`, not the goal.' },
          ],
        },
        {
          id: 'd10-q5',
          prompt: `After \`constructor\` on an \`↔\` goal, the display is:

\`\`\`
case mp
n : Nat
⊢ n + 1 > 5 → n > 4
case mpr
n : Nat
⊢ n > 4 → n + 1 > 5
\`\`\`

What does \`case mpr\` ask for?`,
          options: [
            { text: 'The right-to-left direction: if n > 4, then n + 1 > 5.', correct: true, why: '`↔` is two implications. `mp` is left to right, `mpr` is right to left. Both must be proved.' },
            { text: 'The same thing as `case mp`, written differently.', misconception: 'converse', why: 'The two directions are different claims. `n + 1 > 5 → n > 4` and `n > 4 → n + 1 > 5` are each other’s converse.' },
            { text: 'Nothing: proving `case mp` is enough.', misconception: 'converse', why: 'A one-way `→` is not an `↔`. Both directions must be proved.' },
          ],
        },
        {
          id: 'd10-q6',
          prompt: 'The first bullet works on the goal `Q`. Pick its step.',
          code: 'theorem t (P Q : Prop) (h : P ∧ Q) : Q ∧ P := by\n  constructor\n  · ???\n  · exact h.1',
          fillIn: true,
          options: [
            { text: '`exact h.2`', correct: true, why: 'After `constructor`, the first goal is Q (the left side of `Q ∧ P`), and `h.2` is Q.' },
            { text: '`exact h.1`', misconception: 'exact-match', why: '`h.1` is P. The first goal is Q, the left side of `Q ∧ P`.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `P ∧ Q`, but this goal is only Q.' },
          ],
        },
      ],
    },

    {
      day: 11,
      title: 'Or and there-exists',
      goal: 'Follow `left`/`right`, `rcases` on an “or”, and witnesses for `∃`.',
      cards: [
        `To prove \`P ∨ Q\`, it is enough to prove one side. \`left\` commits to P, \`right\` commits to Q:

\`\`\`lean
theorem pick_side : 2 = 3 ∨ 2 = 2 := by
  right
  rfl
\`\`\`

After \`right\` the goal is \`⊢ 2 = 2\`, and \`rfl\` closes it. Choosing \`left\` would leave \`⊢ 2 = 3\`, which nothing can prove. The step is allowed, but the proof gets stuck.`,

        `**Using** \`h : P ∨ Q\` is different. You know one side holds, not which. So the proof splits into two **cases**, and both must be finished:

\`\`\`lean
theorem small (n : Nat) (h : n = 1 ∨ n = 2) : n < 3 := by
  rcases h with h1 | h2
  · omega
  · omega
\`\`\`

After \`rcases h with h1 | h2\`:

\`\`\`
case inl
n : Nat
h1 : n = 1
⊢ n < 3
case inr
n : Nat
h2 : n = 2
⊢ n < 3
\`\`\`

Each case has only one of the two facts.`,

        `To prove \`∃ n, …\`, name a **witness** and show it works. \`refine ⟨4, ?_⟩\` says “take n = 4” and leaves the check as the goal:

\`\`\`lean
theorem four : ∃ n : Nat, n + 3 = 7 := by
  refine ⟨4, ?_⟩
  rfl
\`\`\`

The goal goes from \`⊢ ∃ n, n + 3 = 7\` to \`⊢ 4 + 3 = 7\`. Two shorter ways do the same in one line: \`exists 4\` (which also tries to close the check itself) and \`exact ⟨4, by decide⟩\`.`,

        `**Using** \`h : ∃ n, …\` gives you *some* number with the property, but you do not choose which:

\`\`\`lean
theorem above (h : ∃ n : Nat, n > 5) : ∃ m : Nat, m > 4 := by
  obtain ⟨x, hx⟩ := h
  exact ⟨x, by omega⟩
\`\`\`

After \`obtain\`:

\`\`\`
x : Nat
hx : x > 5
⊢ ∃ m, m > 4
\`\`\`

All you know about \`x\` is \`hx\`. It might be 6 or a million.

> For an auditor: an “or” hypothesis means every case must be handled, and an \`∃\` hypothesis gives you an unknown value, not a convenient one.`,
      ],
      questions: [
        {
          id: 'd11-q1',
          prompt: 'Pick the first step.',
          code: 'theorem t : 5 < 3 ∨ 5 > 3 := by\n  ???\n  decide',
          fillIn: true,
          options: [
            { text: '`right`', correct: true, why: '`right` leaves `5 > 3`, which is true, and `decide` checks it.' },
            { text: '`left`', misconception: 'tactic-meaning', why: '`left` commits to proving `5 < 3`, which is false. `decide` then fails. Pick the side that is true.' },
            { text: '`intro h`', misconception: 'tactic-meaning', why: '`intro` is for `→` and `∀`. An “or” goal needs `left` or `right`.' },
          ],
        },
        {
          id: 'd11-q2',
          prompt: `After \`rcases h with h1 | h2\` the display is:

\`\`\`
case inl
n : Nat
h1 : n = 1
⊢ n < 3
case inr
n : Nat
h2 : n = 2
⊢ n < 3
\`\`\`

Which is true?`,
          options: [
            { text: 'Both goals must be proved; in the first you may use only `h1`, in the second only `h2`.', correct: true, why: '`h : n = 1 ∨ n = 2` does not say which holds, so the proof covers each possibility separately.' },
            { text: 'Proving one of the two cases is enough.', misconception: 'or-cases', why: 'The proof must work whichever side holds. Leaving a case open gives an `unsolved goals` error.' },
            { text: 'In each case you may use both `h1` and `h2`.', misconception: 'or-cases', why: 'Look at the display: each case has only one of them. You never know both n = 1 and n = 2.' },
          ],
        },
        {
          id: 'd11-q3',
          prompt: 'Pick the first step.',
          code: 'theorem t (n : Nat) (h : n = 1 ∨ n = 2) : n ≥ 1 := by\n  ???\n  · omega\n  · omega',
          fillIn: true,
          options: [
            { text: '`rcases h with h1 | h2`', correct: true, why: 'This splits into the case n = 1 and the case n = 2, and each bullet closes one.' },
            { text: '`exact h.1`', misconception: 'or-cases', why: '`h.1` takes the first part of an “and”. An “or” has no first part you can count on: you do not know whether n = 1 or n = 2 holds.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `n = 1 ∨ n = 2`, not `n ≥ 1`.' },
          ],
        },
        {
          id: 'd11-q4',
          prompt: 'Pick the first step.',
          code: 'theorem t : ∃ n : Nat, n * 3 = 12 := by\n  ???\n  rfl',
          fillIn: true,
          options: [
            { text: '`refine ⟨4, ?_⟩`', correct: true, why: 'Take the witness 4. The goal becomes `4 * 3 = 12`, and `rfl` checks it.' },
            { text: '`intro n`', misconception: 'exists-witness', why: '`intro` is for “for every”. For “there exists”, you do not receive an n; you must provide one.' },
            { text: '`refine ⟨3, ?_⟩`', misconception: 'exists-witness', why: 'A witness has to work. With 3 the goal is `3 * 3 = 12`, which is false, so `rfl` fails.' },
          ],
        },
        {
          id: 'd11-q5',
          prompt: `After \`obtain ⟨x, hx⟩ := h\` the display is:

\`\`\`
x : Nat
hx : x > 5 ∧ x % 2 = 0
⊢ True
\`\`\`

What do you know about \`x\`?`,
          options: [
            { text: 'Only that x > 5 and x is even. Which number it is, you do not know.', correct: true, why: '`h` said such a number exists. `obtain` names one, but you learn nothing else about it.' },
            { text: 'x = 6, the smallest such number.', misconception: 'exists-witness', why: 'Nothing says x is the smallest. It could be 8 or 1000.' },
            { text: 'x is a number you may choose.', misconception: 'exists-witness', why: 'You choose the witness when *proving* an `∃`. When *using* one, the value is given to you and stays unknown.' },
          ],
        },
        {
          id: 'd11-q6',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (h : ∃ n : Nat, n > 5) : ∃ m : Nat, m > 3 := by\n  obtain ⟨x, hx⟩ := h\n  ???',
          fillIn: true,
          options: [
            { text: '`exact ⟨x, by omega⟩`', correct: true, why: 'Use x as the witness. From `hx : x > 5`, `omega` shows `x > 3`.' },
            { text: '`exact ⟨x, hx⟩`', misconception: 'exact-match', why: '`hx` says `x > 5`, but the witness must satisfy `x > 3`. Close is not exact.' },
            { text: '`exact ⟨6, hx⟩`', misconception: 'exists-witness', why: '`hx` is about x, not about 6. You did not choose x, so you cannot assume it is 6.' },
          ],
        },
      ],
    },

    {
      day: 12,
      title: 'Using other theorems',
      goal: 'Follow proofs that use library theorems with `exact` and `apply`, and that record facts with `have`.',
      cards: [
        `Lean comes with a library of proved theorems. You can use one like a tool. \`Nat.le_of_lt\` says:

\`\`\`lean
#check Nat.le_of_lt
\`\`\`

Lean answers \`Nat.le_of_lt {n m : Nat} : n < m → n ≤ m\`: if n < m, then n ≤ m. Given a proof \`h : a < b\`, writing \`Nat.le_of_lt h\` gives a proof of \`a ≤ b\`:

\`\`\`lean
theorem weaken (a b : Nat) (h : a < b) : a ≤ b := by
  exact Nat.le_of_lt h
\`\`\`

A hypothesis \`hpq : P → Q\` works the same way: \`hpq hp\` is a proof of Q.`,

        `\`apply\` uses a theorem **backwards**. The goal is \`a ≤ b\`, and \`Nat.le_of_lt\` ends in \`≤\`, so:

\`\`\`lean
theorem weaken' (a b : Nat) (h : a < b) : a ≤ b := by
  apply Nat.le_of_lt
  exact h
\`\`\`

\`\`\`
a b : Nat
h : a < b
⊢ a ≤ b
\`\`\`

becomes

\`\`\`
a b : Nat
h : a < b
⊢ a < b
\`\`\`

Read \`apply\` as: “to prove a ≤ b, it is enough to prove a < b”. The goal becomes the theorem’s if-part.`,

        `Some theorems need two facts. \`Nat.lt_trans\` says \`n < m → m < k → n < k\`: if n < m and m < k, then n < k. The facts go in that order:

\`\`\`lean
theorem chain (x y z : Nat) (h1 : x < y) (h2 : y < z) : x < z := by
  exact Nat.lt_trans h1 h2
\`\`\`

\`h1\` fills the first if-part (\`x < y\`), \`h2\` the second (\`y < z\`).`,

        `\`have\` records an intermediate fact, with its proof, so later steps can use it:

\`\`\`lean
theorem two_steps (a b c : Nat) (h1 : a < b) (h2 : b < c) : a ≤ c := by
  have h3 : a < c := Nat.lt_trans h1 h2
  exact Nat.le_of_lt h3
\`\`\`

After the \`have\` line, the display gains \`h3 : a < c\` above the \`⊢\`, and the goal \`a ≤ c\` is unchanged.

> For an auditor: unlike a hypothesis, a \`have\` comes with its own proof, which Lean checks. A proof read as a story is often a chain of \`have\` lines: each is a step of the argument.`,
      ],
      questions: [
        {
          id: 'd12-q1',
          prompt: `The display is below. What is the goal after \`apply Nat.le_of_lt\`? (\`Nat.le_of_lt : n < m → n ≤ m\`)

\`\`\`
a b : Nat
h : a < b
⊢ a ≤ b
\`\`\``,
          options: [
            { text: '`⊢ a < b`', correct: true, why: '`apply` works backwards: to get `a ≤ b` from the theorem, you must supply its if-part, `a < b`.' },
            { text: 'No goals: the theorem ends in `≤`, so it proves the goal.', misconception: 'apply-direction', why: 'The theorem only gives `a ≤ b` *if* you supply `a < b`. That if-part becomes the new goal.' },
            { text: '`⊢ a ≤ b`, unchanged, plus a new hypothesis `a < b`.', misconception: 'apply-direction', why: '`apply` changes the goal, not the hypotheses. The goal becomes what the theorem needs: `a < b`.' },
          ],
        },
        {
          id: 'd12-q2',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (a b : Nat) (h : a < b) : a ≤ b := by\n  ???',
          fillIn: true,
          options: [
            { text: '`exact Nat.le_of_lt h`', correct: true, why: '`Nat.le_of_lt h` turns `h : a < b` into a proof of `a ≤ b`, exactly the goal.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `a < b`, and the goal is `a ≤ b`. Related, but not the same statement.' },
            { text: '`intro h`', misconception: 'intro-meaning', why: '`a ≤ b` has no `→` or `∀` to introduce, and `h` already exists.' },
          ],
        },
        {
          id: 'd12-q3',
          prompt: 'After `apply Nat.le_of_lt`, pick the step that finishes the proof.',
          code: 'theorem t (a b : Nat) (h : a < b) : a ≤ b := by\n  apply Nat.le_of_lt\n  ???',
          fillIn: true,
          options: [
            { text: '`exact h`', correct: true, why: 'After `apply`, the goal is `a < b`, which is exactly `h`.' },
            { text: '`exact Nat.le_of_lt h`', misconception: 'apply-direction', why: 'That proves `a ≤ b`, the old goal. After `apply` the goal is `a < b`.' },
            { text: '`rfl`', misconception: 'tactic-meaning', why: '`rfl` is for statements whose two sides compute to the same value. `a < b` is not one of them.' },
          ],
        },
        {
          id: 'd12-q4',
          prompt: 'Pick the step that finishes the proof. (`Nat.lt_trans : n < m → m < k → n < k`)',
          code: 'theorem t (x y z : Nat) (h1 : x < y) (h2 : y < z) : x < z := by\n  ???',
          fillIn: true,
          options: [
            { text: '`exact Nat.lt_trans h1 h2`', correct: true, why: '`h1 : x < y` fills the first if-part, `h2 : y < z` the second, giving `x < z`.' },
            { text: '`exact Nat.lt_trans h2 h1`', misconception: 'exact-match', why: 'Order matters. The first fact must be `x < m` and the second `m < z`; `h2` and `h1` do not fit that way.' },
            { text: '`exact h2`', misconception: 'exact-match', why: '`h2` says `y < z`, not `x < z`.' },
          ],
        },
        {
          id: 'd12-q5',
          prompt: `Before and after the line \`have h3 : a < c := Nat.lt_trans h1 h2\`:

\`\`\`
a b c : Nat
h1 : a < b
h2 : b < c
⊢ a ≤ c
\`\`\`

\`\`\`
a b c : Nat
h1 : a < b
h2 : b < c
h3 : a < c
⊢ a ≤ c
\`\`\`

What did \`have\` do?`,
          options: [
            { text: 'It proved `a < c` from `h1` and `h2` and added it as `h3`. The goal is unchanged.', correct: true, why: '`have` adds a fact together with its proof. It does not touch the goal.' },
            { text: 'It assumed `a < c` without proof.', misconception: 'hypothesis-is-fact', why: 'A `have` needs a proof, here `Nat.lt_trans h1 h2`, and Lean checks it.' },
            { text: 'It changed the goal to `a < c`.', misconception: 'apply-direction', why: 'Compare the two displays: the goal is `a ≤ c` in both. Only a new line appeared above `⊢`.' },
          ],
        },
        {
          id: 'd12-q6',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (a b c : Nat) (h1 : a < b) (h2 : b < c) : a ≤ c := by\n  have h3 : a < c := Nat.lt_trans h1 h2\n  ???',
          fillIn: true,
          options: [
            { text: '`exact Nat.le_of_lt h3`', correct: true, why: '`h3 : a < c`, and `Nat.le_of_lt` turns it into `a ≤ c`.' },
            { text: '`exact h3`', misconception: 'exact-match', why: '`h3` says `a < c`, the goal says `a ≤ c`. One more step is needed.' },
            { text: '`exact Nat.le_of_lt h1`', misconception: 'exact-match', why: 'That proves `a ≤ b`, not `a ≤ c`.' },
          ],
        },
      ],
    },

    {
      day: 13,
      title: 'Rewriting and automation',
      goal: 'Follow `rw` in both directions, and judge what `simp`, `omega` and `decide` really show.',
      cards: [
        `With an equation \`h : x = y + 1\`, \`rw [h]\` **rewrites** the goal: every \`x\` becomes \`y + 1\`.

\`\`\`lean
theorem double (x y : Nat) (h : x = y + 1) : x * 2 = y * 2 + 2 := by
  rw [h]
  omega
\`\`\`

\`\`\`
x y : Nat
h : x = y + 1
⊢ x * 2 = y * 2 + 2
\`\`\`

becomes

\`\`\`
x y : Nat
h : x = y + 1
⊢ (y + 1) * 2 = y * 2 + 2
\`\`\`

\`rw\` replaces the **left** side of the equation by the **right** side. After rewriting, it also tries \`rfl\`, so it sometimes finishes the goal by itself.`,

        `To go the other way, right side to left side, write \`rw [← h]\`:

\`\`\`lean
theorem move (a b : Nat) (h : a = b) (ha : a > 3) : b > 3 := by
  rw [← h]
  exact ha
\`\`\`

With \`h : a = b\`, \`rw [← h]\` turns every \`b\` into \`a\`: the goal goes from \`⊢ b > 3\` to \`⊢ a > 3\`, which is \`ha\`. Plain \`rw [h]\` would look for \`a\` in the goal, find none, and fail.`,

        `Some tactics do a lot of work at once. This is called **automation**:

- \`decide\`: computes the answer for specific numbers.
- \`omega\`: solves arithmetic with \`+\`, \`-\`, constants and comparisons, using the hypotheses.
- \`simp\`: simplifies the goal using many known facts. It may finish, or leave a simpler goal:

\`\`\`lean
theorem simpler (P : Prop) (hp : P) : P ∧ True := by
  simp
  exact hp
\`\`\`

After \`simp\` the goal \`P ∧ True\` has become \`P\`.

Lean still checks everything automation does. Automation does not lower the standard of proof.`,

        `Here is the auditor’s point. When automation succeeds, it tells you the goal was **easy**, not that the theorem is important. Look:

\`\`\`lean
theorem looks_deep (n : Nat) (h1 : n > 10) (h2 : n < 5) : n * n = n + 1000 := by
  omega
\`\`\`

\`omega\` succeeds because no number is above 10 and below 5. The hypotheses contradict each other, so any conclusion follows. The statement is vacuous.

> A one-line automated proof of a big-sounding claim is a reason to look closer at the hypotheses.`,
      ],
      questions: [
        {
          id: 'd13-q1',
          prompt: `What is the goal after \`rw [h]\`?

\`\`\`
a b : Nat
h : a = b
⊢ a + b = 2 * b
\`\`\``,
          options: [
            { text: '`⊢ b + b = 2 * b`', correct: true, why: '`rw [h]` replaces the left side of `h`, `a`, by the right side, `b`.' },
            { text: '`⊢ a + a = 2 * a`', misconception: 'rewrite-direction', why: 'That is the other direction, `rw [← h]`. Plain `rw [h]` turns `a` into `b`.' },
            { text: 'No goals: `rw` proves equations.', misconception: 'tactic-meaning', why: '`rw` changes the goal and then tries `rfl`. Here `b + b` and `2 * b` are not written the same, so a goal remains (`omega` can finish it).' },
          ],
        },
        {
          id: 'd13-q2',
          prompt: 'Pick the first step.',
          code: 'theorem t (a b : Nat) (h : a = b) (ha : a > 3) : b > 3 := by\n  ???\n  exact ha',
          fillIn: true,
          options: [
            { text: '`rw [← h]`', correct: true, why: '`rw [← h]` turns `b` into `a`, so the goal becomes `a > 3`, which is `ha`.' },
            { text: '`rw [h]`', misconception: 'rewrite-direction', why: '`rw [h]` looks for `a` to replace with `b`. The goal `b > 3` contains no `a`, so it fails.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `a = b`, not `b > 3`.' },
          ],
        },
        {
          id: 'd13-q3',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (x : Nat) (h : x = 3) : x * x = 9 := by\n  ???',
          fillIn: true,
          options: [
            { text: '`rw [h]`', correct: true, why: 'Every `x` becomes `3`, giving `3 * 3 = 9`, and `rw` closes that with `rfl`.' },
            { text: '`rw [← h]`', misconception: 'rewrite-direction', why: '`rw [← h]` looks for `3` to turn into `x`. There is no `3` in the goal, so it fails.' },
            { text: '`exact h`', misconception: 'exact-match', why: '`h` says `x = 3`, not `x * x = 9`.' },
          ],
        },
        {
          id: 'd13-q4',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (n : Nat) (h : n + 3 = 10) : n = 7 := by\n  ???',
          fillIn: true,
          options: [
            { text: '`omega`', correct: true, why: '`omega` does the arithmetic: from n + 3 = 10 it gets n = 7.' },
            { text: '`decide`', misconception: 'tactic-meaning', why: '`decide` needs specific numbers. n is a variable, and `decide` does not use hypotheses.' },
            { text: '`rfl`', misconception: 'tactic-meaning', why: '`n = 7` is not true by computation: n could be anything until you use `h`.' },
          ],
        },
        {
          id: 'd13-q5',
          prompt: 'Lean accepts this. Why does `omega` succeed?',
          code: 'theorem big (n : Nat) (h1 : n > 10) (h2 : n < 5) : n * n = n + 1000 := by\n  omega',
          options: [
            { text: 'No n is above 10 and below 5, so the hypotheses can never hold together.', correct: true, why: 'Contradictory hypotheses make any conclusion provable. The theorem says nothing about any number.' },
            { text: '`omega` is very strong, so this must be a deep fact about n * n.', misconception: 'automation-strength', why: 'Automation succeeds on easy goals. This one is easy only because the hypotheses are impossible.' },
            { text: 'It shows that some number satisfies n * n = n + 1000.', misconception: 'vacuous-truth', why: 'The conclusion only follows for numbers meeting both hypotheses, and there are none.' },
          ],
        },
        {
          id: 'd13-q6',
          prompt: 'An AI shows you a theorem called `riemann_hypothesis`, proved in one line `by simp`. Lean accepts it. What do you conclude?',
          options: [
            { text: 'The statement as written must be easy (or vacuous); read it, it is probably not the famous problem.', correct: true, why: '`simp` proves only what simplification can reach. A famous open problem would not fall to it, so the statement must say something else.' },
            { text: 'The Riemann hypothesis is proved, since Lean checked it.', misconception: 'automation-strength', why: 'Lean checked that `simp` proves *this statement*. A one-word proof of a big claim means the statement is weaker than the name.' },
            { text: '`simp` is not checked by Lean, so the proof means nothing.', misconception: 'lean-checks-format', why: 'Lean checks everything `simp` does. The proof is valid; the question is what the statement says.' },
          ],
        },
      ],
    },

    {
      day: 14,
      title: 'Week 2 review: a proof is a story',
      goal: 'Read a whole short proof as an argument in plain English, and pick each next step.',
      cards: [
        `Here is this week in one table, matching the shape of the goal or hypothesis to the tactic:

- goal \`P → Q\` or \`∀ x, …\`: \`intro\`
- goal \`P ∧ Q\` or \`P ↔ Q\`: \`constructor\` (two goals)
- goal \`P ∨ Q\`: \`left\` or \`right\`
- goal \`∃ x, …\`: \`refine ⟨witness, ?_⟩\`, \`exists\`, \`exact ⟨witness, proof⟩\`
- goal exactly a hypothesis: \`exact h\` or \`assumption\`
- have \`h : P ∧ Q\`: \`h.1\`, \`h.2\`, \`obtain ⟨hp, hq⟩ := h\`
- have \`h : P ∨ Q\`: \`rcases h with hp | hq\` (two cases)
- have \`h : ∃ x, …\`: \`obtain ⟨x, hx⟩ := h\`
- have \`h : a = b\`: \`rw [h]\`, \`rw [← h]\`
- use a theorem: \`exact thm h\`, \`apply thm\`, \`have\`
- arithmetic or computation: \`omega\`, \`decide\`, \`simp\`, \`rfl\``,

        `Read a proof as a story, one sentence per step. Click each line in the Lab to check against the goal display.

\`\`\`lean
theorem either_way (P Q R : Prop) (hpr : P → R) (hqr : Q → R) : P ∨ Q → R := by
  intro h
  rcases h with hp | hq
  · exact hpr hp
  · exact hqr hq
\`\`\`

> Assume P or Q (\`intro h\`). There are two cases. If P holds, then R follows by \`hpr\`. If Q holds, then R follows by \`hqr\`. Either way, R.

That is an ordinary proof by cases, written in Lean.`,

        `One last habit for auditors. After following a proof, ask: **which hypotheses did it really need, and can they all hold together?**

\`\`\`lean
theorem odd_and_even (n : Nat) (h1 : n % 2 = 0) (h2 : n % 2 = 1) : n = 12345 := by
  omega
\`\`\`

The “story” is one word, because there is nothing to argue: no number is both even and odd. The proof is correct, and the theorem is empty.`,
      ],
      questions: [
        {
          id: 'd14-q1',
          prompt: 'In the story of this proof, what does the line `rcases h with hp | hq` say?',
          code: 'theorem either_way (P Q R : Prop) (hpr : P → R) (hqr : Q → R) : P ∨ Q → R := by\n  intro h\n  rcases h with hp | hq\n  · exact hpr hp\n  · exact hqr hq',
          options: [
            { text: '“We know P or Q. Consider each case separately.”', correct: true, why: 'Using an “or” means splitting into cases, here one with `hp : P` and one with `hq : Q`.' },
            { text: '“We know both P and Q.”', misconception: 'or-cases', why: '`h : P ∨ Q` gives only one of them, and you do not know which. That is why there are two bullets.' },
            { text: '“We now have to prove P or Q.”', misconception: 'goal-vs-hypothesis', why: '`h` is a hypothesis (it was introduced by `intro h`). `P ∨ Q` is what we have; R is what we need.' },
          ],
        },
        {
          id: 'd14-q2',
          prompt: 'Pick the missing step.',
          code: 'theorem t (P Q : Prop) (hp : P) : Q → P ∧ Q := by\n  intro hq\n  ???\n  · exact hp\n  · exact hq',
          fillIn: true,
          options: [
            { text: '`constructor`', correct: true, why: 'After `intro hq` the goal is `P ∧ Q`. `constructor` splits it into P and Q for the two bullets.' },
            { text: '`exact hp`', misconception: 'exact-match', why: '`hp` proves P, but the goal is `P ∧ Q`.' },
            { text: '`left`', misconception: 'tactic-meaning', why: '`left` is for “or” goals. For “and”, both sides are needed, so use `constructor`.' },
          ],
        },
        {
          id: 'd14-q3',
          prompt: 'Pick the step that finishes the proof.',
          code: 'theorem t (n : Nat) (h : ∃ k : Nat, n = k + 2) : n ≥ 2 := by\n  obtain ⟨k, hk⟩ := h\n  ???',
          fillIn: true,
          options: [
            { text: '`omega`', correct: true, why: 'Now `hk : n = k + 2`, and `omega` concludes n ≥ 2 whatever k is.' },
            { text: '`exact hk`', misconception: 'exact-match', why: '`hk` says `n = k + 2`, not `n ≥ 2`.' },
            { text: '`decide`', misconception: 'tactic-meaning', why: '`decide` needs specific numbers. Here n and k are unknown.' },
          ],
        },
        {
          id: 'd14-q4',
          prompt: 'In the first case, the goal is now `P`. Pick the step.',
          code: 'theorem t (P Q : Prop) (h : P ∨ Q) : Q ∨ P := by\n  rcases h with hp | hq\n  · right\n    ???\n  · left\n    exact hq',
          fillIn: true,
          options: [
            { text: '`exact hp`', correct: true, why: 'In the first case you have `hp : P`, and after `right` the goal is P.' },
            { text: '`exact hq`', misconception: 'or-cases', why: '`hq` exists only in the second case. In this case all you know is P.' },
            { text: '`exact h`', misconception: 'or-cases', why: '`h` was split by `rcases` and is gone. In this case you have only `hp : P`.' },
          ],
        },
        {
          id: 'd14-q5',
          prompt: 'Pick the first step.',
          code: 'theorem t (a b : Nat) (h : a = b) (hb : b > 3) : a > 3 := by\n  ???\n  exact hb',
          fillIn: true,
          options: [
            { text: '`rw [h]`', correct: true, why: '`rw [h]` turns `a` into `b`, so the goal becomes `b > 3`, which is `hb`.' },
            { text: '`rw [← h]`', misconception: 'rewrite-direction', why: '`rw [← h]` looks for `b` to turn into `a`. The goal `a > 3` has no `b`, so it fails.' },
            { text: '`apply h`', misconception: 'apply-direction', why: '`h : a = b` is an equation, not an “if … then”. To use an equation, rewrite with it.' },
          ],
        },
        {
          id: 'd14-q6',
          prompt: 'Lean accepts this. What does it tell you about the number 12345?',
          code: 'theorem odd_and_even (n : Nat) (h1 : n % 2 = 0) (h2 : n % 2 = 1) : n = 12345 := by\n  omega',
          options: [
            { text: 'Nothing: no n is both even and odd, so the theorem never applies.', correct: true, why: 'The hypotheses contradict each other. `omega` sees this and closes any goal.' },
            { text: 'That every even number equals 12345.', misconception: 'vacuous-truth', why: 'The theorem needs both `h1` and `h2`. No number satisfies both, so it says nothing.' },
            { text: 'That 12345 is special, since an automatic tactic proved it.', misconception: 'automation-strength', why: '`omega` succeeded because the hypotheses are impossible, not because of anything about 12345.' },
          ],
        },
      ],
    },
  ],
}
