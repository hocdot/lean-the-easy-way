// The shape of the course. Lessons are plain data, so `make test` can run every piece of
// Lean in them through the real Lean and check that each claim about Lean is true.
import type { MisconceptionId } from './misconceptions.ts'

/**
 * Text fields are a small Markdown:
 *   paragraphs, **bold**, *italic*, `inline code`, - bullets, 1. numbered lists,
 *   > a callout (one paragraph), and fenced Lean blocks:
 *
 *   ```lean            complete Lean code; must be accepted by Lean (no errors)
 *   ```lean error      complete Lean code that Lean must reject (to show an error)
 *   ```lean sorry      accepted, but with a `sorry` warning
 *   ```lean fragment   a piece of code to read, never run
 *   ```lean mathlib    needs Mathlib: run (and checked) only where Mathlib is installed;
 *                      combine with a flag, e.g. ```lean mathlib error
 *
 * Runnable blocks get a "Run" button that shows what Lean says.
 */
export type Markdown = string

export interface Option {
  /** what the learner picks: Markdown, usually one `inline code` or a short sentence */
  text: Markdown
  correct?: boolean
  /** the misconception that leads to picking this (wrong) option */
  misconception?: MisconceptionId
  /** feedback after picking it: concretely why it is right or wrong */
  why: Markdown
}

export type Expect = 'ok' | 'error' | 'sorry' | 'skip'

export interface Question {
  /** stable id, e.g. "d03-q2"; progress is stored by it */
  id: string
  prompt: Markdown
  /** Lean shown with the prompt (not part of the Markdown so it can be run) */
  code?: string
  /** what Lean must say about `code` (checked by `make test`); default 'ok' */
  codeExpect?: Expect
  /** `code` needs Mathlib (run and checked only where Mathlib is installed) */
  mathlib?: boolean
  /** 2–4 options, exactly one correct; shown in this order */
  options: Option[]
  /**
   * For "pick the next step" questions: `code` contains `???`, and each option's text is
   * a tactic in backticks. Picking one shows what real Lean says about the code with that
   * tactic in place. `make test` checks the correct one closes the proof and the others fail.
   */
  fillIn?: boolean
}

export interface Lesson {
  day: number
  title: string
  /** shown instead of "Day N", e.g. "Case 1" */
  label?: string
  /** one sentence: what you can do after this lesson */
  goal: string
  /** short screens of explanation, read in order */
  cards: Markdown[]
  /** the check at the end, 4–7 questions */
  questions: Question[]
  /**
   * Hands-on lessons: explanation screens and questions interleaved, in this order. When set,
   * it is the whole lesson, and `cards` and `questions` are left empty.
   */
  flow?: (Markdown | Question)[]
}

export interface Week {
  week: number
  /** shown instead of "Week N" */
  label?: string
  title: string
  summary: string
  lessons: Lesson[]
}
