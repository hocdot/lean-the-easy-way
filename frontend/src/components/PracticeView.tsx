// Practice: sets of 8 questions, generated or drawn from past lessons, aimed at the ideas the
// learner most often mixes up (the LTL Tutor's outer loop).
import { useEffect, useMemo, useState } from 'react'
import { labelOf, LESSONS, questionsOf } from '../content'
import { MISCONCEPTIONS, type MisconceptionId } from '../content/misconceptions'
import type { Question } from '../content/types'
import { generate, type GenQuestion } from '../practice/logic'
import { generateNumber } from '../practice/numbers'
import { actions, dueExplanation, likelihoods, useProgress, weakSpots, type Progress } from '../store'
import { GenQuestionCard } from './GenQuestionCard'
import { Inline } from './Markdown'
import { MisconceptionCard } from './MisconceptionCard'
import { QuestionCard } from './QuestionCard'

type Item = { kind: 'gen'; q: GenQuestion } | { kind: 'review' | 'num'; q: Question }

const SET_SIZE = 8

/** Lesson questions worth seeing again: missed ones first, then those tied to weak spots. */
function reviewPool(p: Progress): { q: Question; weight: number }[] {
  const l = likelihoods(p)
  const out: { q: Question; weight: number }[] = []
  for (const lesson of LESSONS) {
    if (!p.done[lesson.day]) continue
    for (const q of questionsOf(lesson)) {
      const attempts = p.answers.filter((a) => a.q === q.id || a.q === `review:${q.id}`)
      const last = attempts[attempts.length - 1]
      const missed = last ? !last.correct : false
      const tags = q.options.flatMap((o) => (o.misconception ? [o.misconception] : []))
      const affinity = Math.max(0, ...tags.map((t) => l[t])) * 10
      const staleDays = last ? (Date.now() - last.at) / 86_400_000 : 30
      out.push({ q, weight: (missed ? 3 : 0.3) + affinity + Math.min(staleDays, 30) / 30 })
    }
  }
  return out
}

function pickWeighted<T>(xs: { q: T; weight: number }[], n: number): T[] {
  const pool = [...xs]
  const out: T[] = []
  while (out.length < n && pool.length) {
    const total = pool.reduce((s, x) => s + x.weight, 0)
    let r = Math.random() * total
    const i = pool.findIndex((x) => (r -= x.weight) < 0)
    out.push(pool.splice(i < 0 ? pool.length - 1 : i, 1)[0].q)
  }
  return out
}

/**
 * A set: lesson questions to review (up to 3, once lessons are done), questions about Lean's
 * number conventions (2, or 3 when those are a weak spot), and generated logic questions for
 * the rest, all leaning toward the learner's likely misconceptions.
 */
function newSet(p: Progress): Item[] {
  const weights = likelihoods(p)
  const reviews = pickWeighted(reviewPool(p), 3)
  const numbersWeak = weakSpots(p).some((w) => w.id === 'nat-subtraction' || w.id === 'division-convention')
  const nNumbers = numbersWeak ? 3 : 2
  const base = Math.floor(Math.random() * 1e9)
  const logic: Item[] = Array.from({ length: SET_SIZE - reviews.length - nNumbers }, (_, i) => ({ kind: 'gen', q: generate(base + i, weights) }))
  const numbers: Item[] = Array.from({ length: nNumbers }, (_, i) => ({ kind: 'num', q: generateNumber(base + 100 + i, weights).q }))
  // interleave so no kind comes in a long run
  const items: Item[] = []
  const queues = [logic, numbers, reviews.map((q): Item => ({ kind: 'review', q }))]
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) items.push(q.shift()!)
  return items
}

export function PracticeView() {
  const p = useProgress()
  const [items, setItems] = useState<Item[]>(() => newSet(p))
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [setNumber, setSetNumber] = useState(1)
  const practiced = p.answers.filter((a) => !/^d\d+-/.test(a.q)).length
  const weak = weakSpots(p)
  const due = dueExplanation(p)
  const [open, setOpen] = useState<MisconceptionId | null>(null)

  const item = items[index]
  const answered = results.length > index
  const finished = results.length === items.length && index === items.length - 1

  const restart = () => {
    setItems(newSet(p))
    setIndex(0)
    setResults([])
    setSetNumber(setNumber + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowRight' && answered && index < items.length - 1) setIndex(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const record = (correct: boolean, misconceptions: MisconceptionId[], id: string) => {
    if (answered) return
    setResults((r) => [...r, correct])
    actions.answer({ q: id, correct, misconceptions })
  }

  const doneDays = useMemo(() => Object.keys(p.done).length, [p.done])

  return (
    <div className="practice">
      <header className="page-head">
        <h2>Practice</h2>
        <p className="muted">
          Practice never runs out: questions come in sets of {SET_SIZE}, and a new set is made each time, leaning toward the ideas
          you have mixed up recently and bringing back lesson questions you missed.{' '}
          {doneDays < 6 && 'Most of it uses Week 1 (days 2 to 6).'}
        </p>
      </header>

      {weak.length > 0 && (
        <section className="weak card">
          <div className="eyebrow">Recently mixed up</div>
          <ul>
            {weak.map((w) => (
              <li key={w.id}>
                <button className={`weak-item ${open === w.id ? 'on' : ''}`} onClick={() => setOpen(open === w.id ? null : w.id)}>
                  <span className="weak-name"><Inline text={MISCONCEPTIONS[w.id].name} /></span>
                  <span className="weak-bar"><i style={{ width: `${Math.round(w.weight * 100)}%` }} /></span>
                </button>
              </li>
            ))}
          </ul>
          {open && <MisconceptionCard id={open} dismissable={false} />}
        </section>
      )}

      {due && <MisconceptionCard id={due} />}

      <section className="card practice-card">
        <div className="set-head">
          <div className="dots" aria-label={`Question ${index + 1} of ${items.length}`}>
            {items.map((_, i) => (
              <span key={i} className={`dot ${results[i] === true ? 'good' : results[i] === false ? 'bad' : ''} ${i === index ? 'current' : ''}`} />
            ))}
          </div>
          <span className="eyebrow">
            Set {setNumber}
            {' · '}
            {item.kind === 'review' ? `from ${labelOf(LESSONS.find((l) => questionsOf(l).includes(item.q))!).toLowerCase()}` : item.kind === 'num' ? 'numbers' : 'logic'}
            {practiced > 0 && ` · ${practiced} answered in all`}
          </span>
        </div>

        {item.kind === 'gen' ? (
          <GenQuestionCard key={`${index}-${item.q.id}`} question={item.q} onAnswer={(c, m) => record(c, m, item.q.id)} />
        ) : (
          <QuestionCard
            key={`${index}-${item.q.id}`}
            question={item.q}
            onAnswer={(c, i) => {
              const m = item.q.options[i].misconception
              record(c, m ? [m] : [], item.kind === 'review' ? `review:${item.q.id}` : item.q.id)
            }}
          />
        )}

        <div className="lesson-foot">
          {finished ? (
            <>
              <span>
                <strong>{results.filter(Boolean).length} of {items.length}</strong> right.
              </span>
              <button className="btn primary" onClick={restart}>Next set</button>
            </>
          ) : (
            <>
              <span className="muted small">{index + 1} / {items.length}</span>
              <button className="btn primary" onClick={() => setIndex(index + 1)} disabled={!answered}>
                {answered ? 'Next' : 'Pick an answer'}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
