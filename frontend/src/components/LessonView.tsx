// A lesson: its screens one at a time (cards then questions, or a hands-on flow that mixes
// them), then a short wrap-up.
import { useEffect, useState } from 'react'
import { isQuestion, labelOf, LESSONS, questionsOf, screensOf, WEEKS } from '../content'
import { go } from '../nav'
import { actions, dueExplanation, useProgress } from '../store'
import { Inline, Markdown } from './Markdown'
import { MisconceptionCard } from './MisconceptionCard'
import { QuestionCard } from './QuestionCard'

export function DayList({ current }: { current: number }) {
  const p = useProgress()
  const currentWeek = WEEKS.find((w) => w.lessons.some((l) => l.day === current))?.week
  return (
    <nav className="daylist" aria-label="Lessons">
      {WEEKS.filter((w) => w.lessons.length).map((w) => {
        const done = w.lessons.filter((l) => p.done[l.day]).length
        return (
          // only the current week is open, so the list stays short; the others open on click
          <details key={`${w.week}-${currentWeek}`} className="week" open={w.week === currentWeek}>
            <summary className="week-title">
              <span className="eyebrow">{w.label ?? `Week ${w.week}`} · {done}/{w.lessons.length}</span>
              <span className="week-name">{w.title}</span>
            </summary>
            <ol>
              {w.lessons.map((l, i) => (
                <li key={l.day}>
                  <a
                    href={`#/learn/${l.day}`}
                    className={`day ${l.day === current ? 'current' : ''} ${p.done[l.day] ? 'done' : ''}`}
                    aria-current={l.day === current ? 'page' : undefined}
                  >
                    <span className="day-num">{p.done[l.day] ? '✓' : l.label ? i + 1 : l.day}</span>
                    <span className="day-title">{l.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </details>
        )
      })}
    </nav>
  )
}

interface Result {
  correct: boolean
  pick?: number
}

export function LessonView({ day }: { day: number }) {
  const lesson = LESSONS.find((l) => l.day === day) ?? LESSONS[0]
  const p = useProgress()
  const screens = screensOf(lesson)
  const questions = questionsOf(lesson)
  const nQs = questions.length
  const total = screens.length + 1
  // where the learner was is saved, so a refresh comes back to the same screen
  const [index, setScreen] = useState(() => Math.min(p.at[lesson.day] ?? 0, total - 1))
  const setIndex = (i: number) => {
    setScreen(i)
    actions.position(lesson.day, i)
  }
  // answers come from the saved progress; "Start over" answers afresh without erasing them
  const [replay, setReplay] = useState<Record<string, Result> | null>(null)
  const saved: Record<string, Result> = {}
  for (const qq of questions) {
    const a = p.answers.find((x) => x.q === qq.id)
    if (a) saved[qq.id] = { correct: a.correct, pick: a.pick }
  }
  const results = replay ?? saved
  const answeredCount = Object.keys(saved).length

  const screen = screens[index]
  const q = screen != null && isQuestion(screen) ? screen : null
  const answered = q ? q.id in results : true
  const atEnd = index === total - 1
  const canNext = !atEnd && answered
  const firstQuestion = screens.findIndex(isQuestion)
  const nextIsFirstQuestion = !lesson.flow && index === firstQuestion - 1

  useEffect(() => {
    if (atEnd && answeredCount === nQs) actions.complete(lesson.day)
  }, [atEnd, answeredCount, nQs, lesson.day])

  // ← → move between screens (→ only once the question on screen is answered)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowRight' && canNext) setIndex(index + 1)
      else if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const score = Object.values(results).filter((r) => r.correct).length
  const nextLesson = LESSONS.find((l) => l.day === lesson.day + 1)
  const due = atEnd ? dueExplanation(p) : null
  const label = labelOf(lesson)
  // a screen can be opened once every question before it is answered
  const reachable = (i: number) => screens.slice(0, i).every((x) => !isQuestion(x) || x.id in results)

  return (
    <article className="lesson card">
      <header className="lesson-head">
        <div className="eyebrow">{label}</div>
        <div className="lesson-title-row">
          <h2>{lesson.title}</h2>
          {(index > 0 || Object.keys(results).length > 0) && (
            <button className="btn ghost small" onClick={() => { setReplay({}); setIndex(0) }} title="Go back to the first screen and answer the questions afresh. Your earlier answers are kept.">
              Start over
            </button>
          )}
        </div>
        <p className="lesson-goal"><Inline text={lesson.goal} /></p>
        <div className="segs" role="tablist" aria-label="Lesson progress">
          {Array.from({ length: total }, (_, i) => {
            const x = screens[i]
            const qq = x != null && isQuestion(x) ? x : null
            const st = qq && qq.id in results ? (results[qq.id].correct ? 'good' : 'bad') : i < index ? 'done' : ''
            const ok = i <= index || reachable(i)
            return (
              <button
                key={i}
                className={`seg ${st} ${i === index ? 'current' : ''} ${qq ? 'q' : ''}`}
                onClick={() => ok && setIndex(i)}
                disabled={!ok}
                aria-label={qq ? `Question ${questions.indexOf(qq) + 1}` : i === total - 1 ? 'Wrap-up' : `Reading ${i + 1}`}
              />
            )
          })}
        </div>
      </header>

      <div className="lesson-body" key={index}>
        {screen != null && !isQuestion(screen) && <Markdown text={screen} />}
        {q && (
          <>
            <div className="eyebrow q-count">Question {questions.indexOf(q) + 1} of {nQs}</div>
            <QuestionCard
              key={`${q.id}-${replay ? 'again' : 'first'}`}
              question={q}
              initialPick={results[q.id]?.pick}
              onAnswer={(correct, i, first) => {
                const o = q.options[i]
                const misconceptions = o.misconception ? [o.misconception] : []
                if (replay) setReplay((r) => (r && q.id in r ? r : { ...r, [q.id]: { correct, pick: i } }))
                // the first answer is the lesson's record; replays and retakes count as review
                if (first && !replay) actions.answer({ q: q.id, correct, misconceptions, pick: i })
                else actions.answer({ q: `review:${q.id}`, correct, misconceptions })
              }}
            />
          </>
        )}
        {atEnd && (
          <div className="wrapup">
            <h3>{label} done</h3>
            <p>
              You got <strong>{score} of {nQs}</strong> right{replay ? ' this time' : ' on the first try'}.{' '}
              {score === nQs ? 'Clean sweep.' : 'Every mistake feeds your Practice tab, which brings those ideas back.'}
            </p>
            {due && <MisconceptionCard id={due} />}
            <p className="muted">
              {nextLesson
                ? lesson.label ? 'On to the next case when you are ready.' : 'A lesson a day is the pace this course is built for. Come back tomorrow, or go on now if you like.'
                : 'That was the last one. Practice and the Lab are yours to keep using.'}
            </p>
            <div className="row gap">
              {nextLesson && <button className="btn primary" onClick={() => go(`/learn/${nextLesson.day}`)}>{labelOf(nextLesson)}: {nextLesson.title}</button>}
              <button className="btn" onClick={() => go('/practice')}>Practice</button>
              <button className="btn ghost" onClick={() => { setReplay({}); setIndex(0) }}>Do it again</button>
            </div>
          </div>
        )}
      </div>

      <footer className="lesson-foot">
        <button className="btn" onClick={() => setIndex(index - 1)} disabled={index === 0}>Back</button>
        {!atEnd && (
          <button className="btn primary" onClick={() => setIndex(index + 1)} disabled={!canNext}>
            {q && !answered ? 'Pick an answer' : nextIsFirstQuestion ? 'Start the questions' : index === total - 2 ? 'Finish' : 'Continue'}
          </button>
        )}
      </footer>
    </article>
  )
}
