// A lesson page one step at a time, as on the React site. Verso writes the whole lesson as one
// page; this splits it into steps and shows one, with the progress bar and Back / Continue.
// A step begins at each ```stepBreak``` marker (where the React site's cards began), at each
// section heading, and around each question (a question is a step of its own). Continue waits
// for the question on screen to be answered. The place in the lesson is saved, and a link to
// something later in the page (from search, say) opens the step that holds it.
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LESSONS, questionsOf } from '../content'
import type { Lesson } from '../content/types'
import { MisconceptionCard } from '../components/MisconceptionCard'
import { actions, dueExplanation, progressNow, useProgress } from '../store'
import { lessonUrl } from './urls'

interface Step {
  items: HTMLElement[]
  /** the question asked in this step, if any */
  q?: string
}

/** The lesson's blocks after its title and goal, in order, split into steps. */
export function stepsOf(section: HTMLElement): Step[] {
  const steps: Step[] = []
  let cur: Step = { items: [] }
  const close = () => {
    if (cur.items.length) steps.push(cur)
    cur = { items: [] }
  }
  const walk = (parent: HTMLElement, skip: number) => {
    for (const el of [...parent.children].slice(skip) as HTMLElement[]) {
      if (el.tagName === 'SECTION') {
        walk(el, 0)
      } else if (el.matches('.lfa-widget[data-widget=step]')) {
        close()
      } else if (el.matches('h1, h2, h3, h4')) {
        close()
        cur.items.push(el)
      } else if (el.matches('.lfa-question')) {
        // a heading just before a question stays with it
        if (!cur.items.every((x) => x.matches('h1, h2, h3, h4'))) close()
        cur.items.push(el)
        cur.q = el.dataset.questionId
        close()
      } else {
        cur.items.push(el)
      }
    }
  }
  walk(section, goalEnd(section)) // the title and the goal stay visible
  close()
  return steps
}

/** How many blocks at the top of the lesson stay put: its title, and the goal under it (in italics). */
const goalEnd = (section: HTMLElement) => (section.children[1]?.matches('p:has(> em:only-child)') ? 2 : 1)

/** Shows one step of `steps`, hiding the others (and sections left with nothing to show). */
function show(section: HTMLElement, steps: Step[], index: number) {
  steps.forEach((s, i) => s.items.forEach((el) => (el.hidden = i !== index)))
  for (const sub of section.querySelectorAll<HTMLElement>('section')) {
    sub.hidden = !steps[index]?.items.some((el) => sub.contains(el))
  }
}

export function Stepper({ lesson, section, steps, top }: { lesson: Lesson; section: HTMLElement; steps: Step[]; top: HTMLElement }) {
  const p = useProgress()
  const total = steps.length + 1 // and a wrap-up
  const answered = (q?: string) => !q || p.answers.some((a) => a.q === q)
  const reachable = (i: number) => steps.slice(0, i).every((s) => answered(s.q))

  const [index, setScreen] = useState(() => {
    // a link into the page opens the step that holds its target
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)))
    const hit = target ? steps.findIndex((s) => s.items.some((el) => el === target || el.contains(target))) : -1
    if (hit >= 0) return hit
    let i = Math.min(progressNow().at[lesson.day] ?? 0, total - 1)
    while (i > 0 && !reachable(i)) i--
    return i
  })
  const setIndex = (i: number) => {
    setScreen(i)
    actions.position(lesson.day, i)
    const h1 = section.querySelector('h1')
    if (h1 && h1.getBoundingClientRect().top < 0) h1.scrollIntoView({ block: 'start' })
  }

  useEffect(() => show(section, steps, index), [section, steps, index])

  useEffect(() => {
    const onHash = () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      const hit = target ? steps.findIndex((s) => s.items.some((el) => el === target || el.contains(target))) : -1
      if (hit >= 0) setScreen(hit)
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [steps])

  const step = steps[index]
  const atEnd = index === total - 1
  const canNext = !atEnd && answered(step?.q)

  // ← → move between steps (→ only once the question on screen is answered)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowRight' && canNext) setIndex(index + 1)
      else if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1)
      else return
      e.preventDefault()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const qs = steps.filter((s) => s.q).map((s) => s.q!)
  const results = new Map(qs.flatMap((q) => {
    const a = p.answers.find((x) => x.q === q)
    return a ? [[q, a.correct] as const] : []
  }))
  const score = [...results.values()].filter(Boolean).length
  const next = LESSONS.find((l) => l.day === lesson.day + 1)
  const label = lesson.label ?? `Day ${lesson.day}`

  return (
    <>
      {createPortal(
        <div className="lfa">
          <div className="segs stepper-segs" role="tablist" aria-label="Lesson progress">
            {Array.from({ length: total }, (_, i) => {
              const q = steps[i]?.q
              const st = q && results.has(q) ? (results.get(q) ? 'good' : 'bad') : i < index ? 'done' : ''
              const ok = i <= index || reachable(i)
              return (
                <button
                  key={i}
                  className={`seg ${st} ${i === index ? 'current' : ''} ${q ? 'q' : ''}`}
                  onClick={() => ok && setIndex(i)}
                  disabled={!ok}
                  aria-label={q ? `Question ${qs.indexOf(q) + 1}` : i === total - 1 ? 'Wrap-up' : `Step ${i + 1}`}
                />
              )
            })}
          </div>
        </div>,
        top,
      )}
      {atEnd && (
        <div className="wrapup">
          <h3>{label} done</h3>
          <p>
            You got <strong>{score} of {qs.length}</strong> right on the first try.{' '}
            {score === qs.length ? 'Clean sweep.' : 'Every mistake feeds the Practice page, which brings those ideas back.'}
          </p>
          <WrapupExplanation />
          <p className="muted">
            {next
              ? lesson.label ? 'On to the next case when you are ready.' : 'A lesson a day is the pace this course is built for. Come back tomorrow, or go on now if you like.'
              : 'That was the last one. Practice is yours to keep using.'}
          </p>
          <div className="row gap">
            {next && <a className="btn primary" href={lessonUrl(next.day)}>{next.label ?? `Day ${next.day}`}: {next.title}</a>}
            <a className="btn" href="practice/">Practice</a>
            <button className="btn ghost" onClick={() => setIndex(0)}>Read it again</button>
          </div>
        </div>
      )}
      <div className="lesson-foot stepper-foot">
        <button className="btn" onClick={() => setIndex(index - 1)} disabled={index === 0}>Back</button>
        {!atEnd && (
          <button className="btn primary" onClick={() => setIndex(index + 1)} disabled={!canNext}>
            {!canNext ? 'Pick an answer' : index === total - 2 ? 'Finish' : 'Continue'}
          </button>
        )}
      </div>
    </>
  )
}

function WrapupExplanation() {
  const due = dueExplanation(useProgress())
  return due ? <MisconceptionCard id={due} /> : null
}

/** Turns the lesson page holding `anyQuestion` into steps; returns where to mount the controls. */
export function stepperFor(anyQuestion: HTMLElement, lessonOf: (id: string) => Lesson | undefined) {
  const section = document.querySelector<HTMLElement>('main .content-wrapper > section')
  const lesson = lessonOf(anyQuestion.dataset.questionId ?? '')
  if (!section || !lesson || !section.contains(anyQuestion) || !questionsOf(lesson).length) return null
  const steps = stepsOf(section)
  if (steps.length < 2) return null
  section.classList.add('lfa-stepped')
  const top = document.createElement('div')
  top.className = 'stepper-top'
  section.children[goalEnd(section) - 1].after(top)
  const foot = document.createElement('div')
  foot.className = 'stepper'
  section.append(foot)
  return { lesson, section, steps, top, foot }
}
