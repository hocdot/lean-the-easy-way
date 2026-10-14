import { STATIC } from '../api'
import { actions } from '../store'

const SOURCES: { title: string; who: string; url: string; what: string }[] = [
  {
    title: 'A Misconception-Driven Adaptive Tutor for Linear Temporal Logic',
    who: 'Siddhartha Prasad, Ben Greenman, Tim Nelson, Shriram Krishnamurthi (CAV 2025)',
    url: 'https://cs.brown.edu/people/sk/Publications/Papers/Published/pgnk-ltl-tutor/',
    what: 'The method behind this site: questions whose wrong answers each match a known misconception, concrete feedback on every mistake, a model of which ideas you mix up, and explanations once a pattern appears. See also the LTL Tutor itself at ltl-tutor.xyz.',
  },
  {
    title: 'Lean Game Server and the Natural Number Game',
    who: 'Jon Eugster, Alexander Bentkamp, Marcus Zibrowius; the game by Kevin Buzzard and Mohammad Pedramfar',
    url: 'https://adam.math.hhu.de',
    what: 'Learning Lean one small step at a time, with the goal always in view.',
  },
  {
    title: 'Theorem Proving in Lean 4',
    who: 'Jeremy Avigad, Leonardo de Moura, Soonho Kong, Sebastian Ullrich',
    url: 'https://lean-lang.org/theorem_proving_in_lean4/',
    what: 'The reference for how Lean reads statements, propositions and tactics.',
  },
  {
    title: 'Mathematics in Lean',
    who: 'Jeremy Avigad, Patrick Massot',
    url: 'https://leanprover-community.github.io/mathematics_in_lean/',
    what: 'How real mathematics is written with Mathlib, including its conventions.',
  },
  {
    title: 'The Mechanics of Proof',
    who: 'Heather Macbeth',
    url: 'https://hrmacbeth.github.io/math2001/',
    what: 'A gentle course that reads proofs line by line, for people new to proof.',
  },
  {
    title: 'Functional Programming in Lean',
    who: 'David Thrane Christiansen',
    url: 'https://lean-lang.org/functional_programming_in_lean/',
    what: 'Lean as a programming language: definitions, structures, type classes.',
  },
  {
    title: 'CS 99: Functional Programming and Theorem Proving in Lean 4',
    who: 'Leni Aniva, Abdalrhman Mohamed; Stanford Centaur Lab (faculty sponsor Clark Barrett)',
    url: 'https://web.stanford.edu/class/cs99/',
    what: 'A university course on writing Lean: programming, proofs and metaprogramming. A good next step after this site, especially its lectures on axioms, the kernel and what Lean trusts.',
  },
  {
    title: 'Lean and Mathlib',
    who: 'The Lean FRO and the Lean community',
    url: 'https://leanprover-community.github.io',
    what: 'The prover that checks every example here, and the community around it.',
  },
]

export function About() {
  return (
    <div className="about card">
      <h2>About</h2>
      <p>
        <strong>Lean the Easy Way</strong> teaches you to read Lean, the proof assistant, a little every day for a month. The aim is
        practical: to look at a Lean theorem, perhaps written by an AI, put it in plain words, and judge whether it proves what it
        claims. A proof can be checked by Lean and still be empty, when its hypotheses can never hold, when it assumes its own
        conclusion, or when its statement is not the claim.
      </p>
      <h3>How it teaches</h3>
      <ul>
        <li>You only pick answers. Every wrong answer matches a specific, common misunderstanding.</li>
        <li>Every answer gets concrete feedback: an example where your pick and the right answer differ, or what Lean itself says.</li>
        <li>The site keeps track of what you tend to mix up. Practice brings those ideas back, and after a few mistakes you get a short explanation of the idea itself.</li>
        <li>Every piece of Lean on this site is checked with the real Lean, both when the course is built and when you press Run.</li>
      </ul>
      <h3>Thanks</h3>
      <p>The lessons are written for this site, but they stand on the work of others:</p>
      <ul className="sources">
        {SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
            <span className="muted"> · {s.who}</span>
            <div className="small">{s.what}</div>
          </li>
        ))}
      </ul>
      <h3>Your data</h3>
      <p className="muted">
        Your progress is stored only in this browser.{' '}
        {STATIC
          ? 'The Lean output shown with each example was produced by the real Lean when this site was built.'
          : 'Lean runs on your own computer, through the small local backend.'}
      </p>
      <button
        className="btn small"
        onClick={() => {
          if (confirm('Erase all your progress and answers? This cannot be undone.')) actions.reset()
        }}
      >
        Reset my progress
      </button>
    </div>
  )
}
