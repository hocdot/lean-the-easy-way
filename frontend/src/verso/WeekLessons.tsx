// A week's page on the Verso site: its lessons as cards, with the learner's progress.
import { Inline } from '../components/Markdown'
import { LESSONS, questionsOf, WEEKS } from '../content'
import { nextDay, useProgress } from '../store'
import { lessonUrl } from './urls'

export function WeekLessons({ week }: { week: number }) {
  const p = useProgress()
  const w = WEEKS.find((x) => x.week === week)
  if (!w) return null
  const next = nextDay(p, LESSONS.length)
  return (
    <ol className="week-lessons">
      {w.lessons.map((l, i) => {
        const done = !!p.done[l.day]
        const isNext = !done && l.day === next
        return (
          <li key={l.day}>
            <a className={`lesson-card card ${done ? 'done' : ''} ${isNext ? 'next' : ''}`} href={lessonUrl(l.day)}>
              <span className="lesson-num">{done ? '✓' : l.label ? i + 1 : l.day}</span>
              <span className="lesson-body-text">
                <span className="lesson-card-title">{l.label ?? `Day ${l.day}`}: {l.title}</span>
                <span className="lesson-card-goal"><Inline text={l.goal} /></span>
              </span>
              <span className="lesson-meta">
                {isNext ? <span className="badge next">Next</span> : done ? <span className="badge done">Done</span> : null}
                <span className="muted small">{questionsOf(l).length} questions</span>
              </span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}
