# Writing course content

The course is 30 short daily lessons (about 10 minutes each) for people who have **never seen
Lean or any proof assistant**. The goal is not to write Lean but to **read** it, put it into
plain English ("informalize" it), and finally **audit** Lean written by an AI: spot vacuous or
contradictory hypotheses, circular statements (P → P), hypotheses that carry the whole
difficulty, `sorry`, `axiom`, wrong definitions, and statements weaker than the claim.

The method follows the LTL Tutor (Prasad, Greenman, Nelson, Krishnamurthi, CAV 2025):
learners only **pick** answers; every wrong option is a *distractor* that corresponds to a
specific, named misconception (`src/content/misconceptions.ts`), and its feedback is concrete
("take n = 4: …"). Repeated mistakes on one misconception trigger that misconception's
explanation, and practice questions are chosen to target it.

## Files

- `frontend/src/content/types.ts`: the data shapes (`Week`, `Lesson`, `Question`, `Option`) and
  the Markdown subset allowed in text.
- `frontend/src/content/misconceptions.ts`: the misconception catalog. Every wrong option must
  name one of its ids.
- `frontend/src/content/week1.ts` … `week4.ts`: the lessons. Week 1 is the reference for tone,
  length and format.

## Voice

- Short sentences. Plain words. Explain every symbol and every term the first time it appears.
- Assume no mathematics beyond school arithmetic and no programming.
- Each card is one idea, about 60–150 words, usually with one small code example.
- Prefer concrete examples over definitions. Show, then name.
- Keep the auditor's point of view: end lessons with *why this matters when checking someone
  else's Lean*.
- No exclamation marks, no hype, no "simply"/"just"/"easy".

## Lessons

Each lesson has 3–5 cards and 5–6 questions. Questions:

- 2–4 options, exactly one `correct: true`. Wrong options are plausible mistakes, each with a
  `misconception` id. Every option has a `why` that explains concretely.
- Use `code` for Lean shown with the question; `codeExpect` says what Lean says about it
  (`'ok'` default, `'error'`, `'sorry'`, or `'skip'` for code that cannot run, e.g. Mathlib).
- "Pick the next step" questions: `fillIn: true`, `code` contains `???` where the tactic goes,
  each option's `text` is exactly one tactic in backticks, e.g. `` '`intro h`' ``. The test
  checks the correct tactic completes the proof (no errors) and every wrong one makes Lean
  report an error. Picking an option in the app runs it through real Lean and shows the result.
- Question ids: `dNN-qM` (e.g. `d09-q3`), unique.

## Lean code must be true

Every runnable code block (```` ```lean ````, `code` fields) is run through real Lean
(core Lean 4.35, **no Mathlib**) by the test. Flags on a fence: `lean error` (must fail),
`lean sorry` (accepted with a `sorry` warning), `lean fragment` (not run: use only for
Mathlib-style code that cannot run without Mathlib; double-check those claims carefully).

Check your work, for one day at a time:

```console
cd frontend && DAY=9 npm test
```

To see what Lean says about a snippet (messages, goal states after each tactic, and the audit):

```console
cd lean && ELAN_HOME=$PWD/../.tools/elan LEAN_PATH=$PWD/.lake/build/lib/lean \
  .lake/build/bin/tutor-run --audit < some-file.lean | python3 -m json.tool
```

Facts about core Lean 4.35 worth knowing:

- `autoImplicit` is on: an undeclared lowercase variable in a statement silently becomes
  "for every" (Mathlib turns this off).
- Useful tactics in core: `rfl`, `decide`, `omega` (linear arithmetic on Nat/Int), `simp`,
  `intro`, `exact`, `apply`, `constructor`, `cases`/`rcases`/`obtain`, `left`, `right`,
  `exists`/`refine ⟨_, ?_⟩`, `rw`, `have`, `induction`, `contradiction`, `assumption`,
  `trivial`, `exfalso`, `show`.
- Not in core: `use`, `linarith`, `norm_num`, `ring`, `positivity`, `ℝ`, `Finset`, `Nat.Prime`
  (these are Mathlib).
