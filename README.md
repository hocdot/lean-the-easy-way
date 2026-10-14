# Lean the Easy Way

A month of short daily lessons for reading Lean, for people who have never seen a proof
assistant. The goal is practical: look at a Lean theorem, perhaps written by an AI, say in
plain words what it claims, and judge whether it proves what it says. A proof can pass Lean's
checker and still be empty: its hypotheses never hold, it assumes its own conclusion, or its
statement is not the claim.

- **Learn**: 30 lessons in four weeks: reading statements, following proofs, definitions and
  conventions, auditing. Each lesson has a few short cards and 5–6 multiple-choice questions.
- **Advanced**: three hands-on audits of real Mathlib theorems, each walked from the claim
  to the verdict with a question at every step: Cantor's theorem, Euclid's infinitely many
  primes, and Fermat's Last Theorem with four fake "proofs" to take apart. Needs Mathlib.
- **Practice**: sets of 8 questions, generated or drawn from past lessons, aimed at the ideas you
  mix up most.
- **Lab**: edit and run Lean, see the goal at the cursor, and **Audit** a file. For every theorem
  you get a word-for-word English reading and red flags: `sorry`, made-up `axiom`s,
  `native_decide`, contradictory hypotheses, a hypothesis that is the conclusion, a hypothesis
  that carries the whole claim, a conclusion that needs no hypotheses, unused hypotheses.

The teaching method follows the LTL Tutor (Prasad, Greenman, Nelson, Krishnamurthi, CAV 2025).
Every wrong answer matches a named misconception, and feedback is concrete. A recency-weighted
model of your mistakes chooses what to practise. After 5 mistakes it explains the misconception
you show most. See `About` in the app for sources and thanks.

## Run it

Needs macOS or Linux, `make`, `curl`, and Node 22.18 or newer. Everything else is installed
inside this folder: Lean in `.tools/elan`, the Lean helper in `lean/.lake`, JS packages in
`frontend/node_modules`. Nothing else on your machine changes.

```console
make setup     # once (a few minutes): Lean 4.35, the Lean helper, JS packages
make mathlib   # optional, about 7 GB: Mathlib, for Advanced and Mathlib code in the Lab
make start     # build the site and open http://localhost:8787
make dev       # while editing: http://localhost:5180 with hot reload (backend on :8787)
make test      # run every piece of Lean in the course through real Lean, plus the other tests
```

Your progress is kept in the browser (localStorage). The backend listens on `127.0.0.1` only.
Lean code can run programs (`#eval`), so do not expose the backend to a network.

## Publish on GitHub Pages

The hosted site has no Lean server. The Run and Step through buttons, and the feedback on
"pick the next step" questions, show Lean's real answers. `make snapshot` saves them in
`frontend/src/content/lean-results.json`. The Lab says "coming soon" there. Everything else
is the same as running locally.

Once:

1. On GitHub, create an **empty public** repository named `lean-the-easy-way`
   (no README, license or .gitignore).
2. In this folder:
   ```console
   git add .
   git commit -m "Lean the Easy Way"
   git remote add origin git@github.com:<your-user>/lean-the-easy-way.git
   git push -u origin main
   ```
3. On GitHub, in the repository's **Settings → Pages → Build and deployment**, set
   **Source** to **GitHub Actions**.
4. Open the **Actions** tab. If the first run failed (it ran before step 3), open
   "Deploy to GitHub Pages" and press **Run workflow** (or **Re-run all jobs**).
5. When it is green, the site is at `https://<your-user>.github.io/lean-the-easy-way/`.

Every push to `main` then rebuilds the site. After changing lessons:

```console
make snapshot   # save Lean's answers for the changed examples (needs Lean and Mathlib)
make test       # check everything with the real Lean
make preview    # look at the exact hosted build on http://localhost:4173/lean-the-easy-way/
git commit -am "…" && git push
```

GitHub's build machine has no Lean. Its tests check the lessons, and check that the saved answers
cover every example. If you forget `make snapshot`, the build fails and tells you so.

## How it works

```
frontend/   React + Vite. The course is plain data in src/content/:
            week1.ts … week4.ts       lessons and questions
            misconceptions.ts         the misconception catalog (with explanations)
            examples.ts               the Lab's examples
            src/practice/logic.ts     the practice generator (see below)
backend/    a dependency-free Node server: POST /api/run { code, audit } runs Lean
            lean.ts                   runs lean/.lake/build/bin/tutor-run, shapes the result
            audit.ts                  turns the audit's facts into plain-language findings
lean/       a small Lean package:
            Main.lean                 tutor-run: elaborates a file from stdin and prints JSON
                                      (messages, goals before/after every tactic, audit)
            Tutor/Audit.lean          #tutor_audit: axioms used, contradiction / circularity /
                                      one-step / triviality checks, English reading
```

**Practice generator.** A seed statement about a few students (`∀ s : Student, Studies s → Passes s`)
is changed by mutation rules, each tied to one misconception: `∀`↔`∃` order, `→` vs `∧`, the
converse, the scope of `¬`, how `→` groups. Mutants that mean the same as the seed are dropped,
checked on hundreds of small random groups of students. A group where your pick and the answer
disagree is the feedback. The tests have Lean confirm that the printed Lean parses as intended.

**Content is checked by Lean.** `make test` runs every runnable code block, question and
misconception example through Lean and checks the expected outcome. Fences: ` ```lean `
(must be accepted), ` ```lean error ` (must be rejected), ` ```lean sorry `,
` ```lean fragment ` (not run, e.g. Mathlib). For "pick the next step" questions, the right
tactic must finish the proof and every wrong one must fail. See `docs/CONTENT_GUIDE.md` for
writing lessons.

## Mathlib

Mathlib, Lean's mathematics library, lives in `mathlib/` (a separate Lake project pinned to the
Mathlib release that matches `lean/lean-toolchain`). `make mathlib` downloads it with its
prebuilt files. The download cache stays in `.tools/mathlib-cache`. The backend finds it
automatically. Without it, the Weeks 1–4 lessons work fully. Advanced shows its text, but
cannot run its code, and the Lab reports "Needs Mathlib" for files that import it.

A file that imports a specific part of Mathlib (`import Mathlib.Data.Nat.Prime.Infinite`)
checks in about 2 seconds once warm. `import Mathlib` (all of it) takes 10–40 seconds.
When a file imports Mathlib, the audit also tries `linarith`, `nlinarith` and `norm_num`
to find contradictory hypotheses.
