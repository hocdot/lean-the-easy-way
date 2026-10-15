# Lean for All

*the easy way*

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

The published site is the Verso version (below). GitHub's build machine installs Lean, downloads
Mathlib's prebuilt files and runs `make verso`, so every piece of Lean on the site is checked by
real Lean on each build (a first build takes a while; later ones reuse a cache). The Lab says
"coming soon" there: it needs a Lean server. The React site (`frontend/`, `make dev`) is still
how you use the Lab locally; the branch `react` keeps the version of the site published before.

Once:

1. On GitHub, create an **empty public** repository named `lean-the-easy-way`
   (no README, license or .gitignore).
2. In this folder:
   ```console
   git add .
   git commit -m "Lean for All"
   git remote add origin git@github.com:<your-user>/lean-the-easy-way.git
   git push -u origin main
   ```
3. On GitHub, in the repository's **Settings → Pages → Build and deployment**, set
   **Source** to **GitHub Actions**.
4. Open the **Actions** tab. If the first run failed (it ran before step 3), open
   "Deploy to GitHub Pages" and press **Run workflow** (or **Re-run all jobs**).
5. When it is green, the site is at `https://<your-user>.github.io/lean-the-easy-way/`.

Every push to `main` then rebuilds and publishes the site (about 10 minutes; a push that only
changes docs is skipped). After changing lessons:

```console
make verso         # check every example with real Lean and build the pages
make verso-serve   # look at them on http://localhost:8790
git commit -am "…" && git push
```

## The Verso version

The lessons are written in [Verso](https://verso.lean-lang.org/), Lean's own documentation
tool, in `site/`. Verso elaborates every example with real Lean when the site is built: hovering
over code shows each name's type and documentation and the goals at each tactic, and each
example's output (`#eval` results, errors, `sorry` warnings) is shown under it and checked
against Lean. The interactive parts are the React components from `frontend/`, mounted into the
Verso pages by `frontend/src/verso/widgets.tsx`: questions (by id, still defined in
`frontend/src/content`), Practice, and the reset button. Lessons are shown one step at a time
(`frontend/src/verso/Stepper.tsx`); a ```` ```stepBreak``` ```` block in a lesson starts a new step.
Since the lesson pages and the course data live in different places, `make verso` ends by checking
that they agree (`frontend/scripts/check-verso.ts`): every question exists, every lesson's page
asks all of its questions, and every page is where the site's links expect it.

```console
make verso         # needs make setup and make mathlib; pages in site/_out/html-multi
make verso-serve   # http://localhost:8790
```

```
site/
  LeanForAll.lean          the front page: weeks, Advanced, Practice, Lab, About
  LeanForAll/WeekN.lean    one chapter per week (and Advanced.lean)
  LeanForAll/DayNN.lean    one page per lesson; CaseN.lean for the Advanced cases
  LeanForAll/Meta/         the `question`, `practice` and `resetProgress` blocks
  SiteMain.lean            Verso's settings: theme, fonts, logo, links
  assets/                  theme (lfa-theme.css/.js), logo; widgets built by make verso
```

The site shares `mathlib/.lake/packages` with `mathlib/`, so `site/lake-manifest.json` pins the
same versions as `mathlib/lake-manifest.json`. Do not run `lake update` in `site/`.

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
