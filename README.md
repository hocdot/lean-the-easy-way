# Lean for All

*Lean the easy way*

A month of short daily lessons for reading Lean, for people who have never seen a proof
assistant. The goal is practical: look at a Lean theorem, perhaps written by an AI, say in
plain words what it claims, and judge whether it proves what it says. A proof can pass Lean's
checker and still be empty: its hypotheses never hold, it assumes its own conclusion, or its
statement is not the claim.

- **Learn**: 30 lessons in four weeks: reading statements, following proofs, definitions and
  conventions, auditing. Each lesson is a few short steps of reading and 5–6 multiple-choice
  questions.
- **Advanced**: three hands-on audits of real Mathlib theorems, each walked from the claim
  to the verdict with a question at every step: Cantor's theorem, Euclid's infinitely many
  primes, and Fermat's Last Theorem with four fake "proofs" to take apart.
- **Practice**: sets of 8 questions, generated or drawn from past lessons, aimed at the ideas you
  mix up most.
- **Lab**: coming soon (it needs a Lean server). The branch `react` keeps the earlier React
  version of the site, whose Lab edits, runs and audits Lean with a local Lean server.

The teaching method follows the LTL Tutor (Prasad, Greenman, Nelson, Krishnamurthi, CAV 2025).
Every wrong answer matches a named misconception, and feedback is concrete. A recency-weighted
model of your mistakes chooses what to practise. After 5 mistakes it explains the misconception
you show most. See the site's About page for sources and thanks.

## Run it

Needs macOS or Linux, `make`, `curl`, Python 3, and Node 22.18 or newer. Everything else is
installed inside this folder: Lean in `.tools/elan`, Mathlib in `mathlib/.lake`, JS packages in
`frontend/node_modules`. Nothing else on your machine changes.

```console
make setup     # once (a few minutes): Lean 4.35, the Lean runner, JS packages
make mathlib   # once, about 7 GB: Mathlib's prebuilt files (the Advanced cases use Mathlib)
make site      # build the site, checking every piece of Lean in it (site/_out/html-multi)
make serve     # look at it on http://localhost:8790
make test      # check every question's Lean with real Lean, and the practice generator
```

Your progress is kept in the browser (localStorage).

## Publish on GitHub Pages

Every push to `main` rebuilds and publishes the site (about 10 minutes; a push that only changes
docs is skipped). GitHub's build machine installs Lean, downloads Mathlib's prebuilt files and
runs `make site`, so every piece of Lean on the site is checked by real Lean on each build.

After changing lessons or questions:

```console
make snapshot   # after changing questions: save Lean's answers, which the questions show
make test
make site && make serve
git commit -am "…" && git push
```

Setting it up for a new repository, once:

1. On GitHub, create an **empty public** repository named `lean-the-easy-way`.
2. Push this folder to it: `git remote add origin git@github.com:<your-user>/lean-the-easy-way.git`,
   then `git push -u origin main`.
3. In the repository's **Settings → Pages → Build and deployment**, set **Source** to
   **GitHub Actions**.
4. Open the **Actions** tab. If the first run failed (it ran before step 3), open
   "Deploy to GitHub Pages" and press **Run workflow**.
5. When it is green, the site is at `https://<your-user>.github.io/lean-the-easy-way/`.

## How it works

```
site/       the site, in Verso (Lean's documentation tool)
            LeanForAll.lean           the front page
            LeanForAll/WeekN.lean     one chapter per week (and Advanced.lean)
            LeanForAll/DayNN.lean     one page per lesson; CaseN.lean for the Advanced cases
            LeanForAll/Meta/          the blocks the pages use: question, stepBreak, practice, …
            SiteMain.lean             Verso's settings: fonts, logo, links, search-engine tags
            assets/                   theme (lfa-theme.css/.js), logo, share image
frontend/   the interactive parts, in React, built into site/assets/lfa-widgets.js
            src/verso/                what goes into the pages: questions, the step-by-step
                                      lessons, the start page, week pages, the sidebar
            src/content/              the course data: each lesson's title, goal and questions,
                                      and the misconception catalog
            src/practice/             the practice generator (see below)
            scripts/                  lean.ts (runs Lean for the tests and snapshot), snapshot,
                                      check-verso, scope-css, the logo
lean/       tutor-run, the Lean program behind scripts/lean.ts: it elaborates a file and prints
            Lean's messages and the goals before and after every tactic, as JSON
mathlib/    a Lake project pinned to the Mathlib release that matches lean/lean-toolchain
```

**Checked by Lean.** Verso elaborates every lesson's Lean when the site is built: hovering over
code shows each name's type and the goals at each tactic, and each example's output (`#eval`
results, errors, `sorry` warnings) is shown under it and checked against Lean. The questions'
Lean is checked by `make test`, and `make snapshot` saves Lean's answers for the site, which has
no Lean server. `make site` ends by checking that the lesson pages and the course data agree:
every question exists, every lesson's page asks all of its questions, and every page is where
the site's links expect it. See `docs/CONTENT_GUIDE.md` for writing lessons.

**Step by step.** Each lesson page is shown one step at a time, with a progress bar and
Back / Continue; Continue waits for the question on screen. A step begins at each heading and
around each question, and a ```` ```stepBreak ```` block starts one anywhere else.

**Practice generator.** A seed statement about a few students (`∀ s : Student, Studies s → Passes s`)
is changed by mutation rules, each tied to one misconception: `∀`↔`∃` order, `→` vs `∧`, the
converse, the scope of `¬`, how `→` groups. Mutants that mean the same as the seed are dropped,
checked on hundreds of small random groups of students. A group where your pick and the answer
disagree is the feedback. The tests have Lean confirm that the printed Lean parses as intended.

**Mathlib.** `site/` shares `mathlib/.lake/packages`, so `site/lake-manifest.json` pins the same
versions as `mathlib/lake-manifest.json`. Do not run `lake update` in `site/` or `mathlib/`.
