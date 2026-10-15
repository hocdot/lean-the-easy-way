// The start page of the Verso site: who it is for, a Continue button to the next unfinished
// lesson, and a card per week with the learner's progress.
import { useEffect, useRef } from 'react'
import { LESSONS, WEEKS } from '../content'
import { nextDay, useProgress } from '../store'
import { lessonUrl, weekUrl } from './urls'


export function Home() {
  const p = useProgress()
  const done = Object.keys(p.done).length
  const next = nextDay(p, LESSONS.length)
  const nextLesson = LESSONS.find((l) => l.day === next)!
  const started = done > 0 || p.answers.length > 0
  const title = useRef<HTMLSpanElement>(null)
  const sub = useRef<HTMLSpanElement>(null)
  const pitch = useRef<HTMLParagraphElement>(null)
  const logo = useRef<HTMLImageElement>(null)
  // the subtitle exactly as wide as the title (lfa-theme.js measures them once the fonts are in),
  // and the logo as tall as the title, subtitle and pitch together, level with the title's top
  useEffect(() => {
    const fit = () => {
      if (!title.current || !sub.current || !pitch.current || !logo.current) return
      ;(window as { lfaFit?: (a: Element, b: HTMLElement) => void }).lfaFit?.(title.current, sub.current)
      const img = logo.current
      img.style.width = img.style.height = img.style.marginTop = ''
      // on phones the logo sits above the text, at its own size
      if (getComputedStyle(img.parentElement!).flexDirection === 'column') return
      const start = img.getBoundingClientRect().top
      // a bigger logo narrows the text, which can rewrap the pitch: settle in a few rounds
      for (let i = 0; i < 4; i++) {
        const r = document.createRange()
        r.selectNodeContents(title.current)
        const top = r.getBoundingClientRect().top
        r.selectNodeContents(pitch.current)
        const h = Math.round(r.getBoundingClientRect().bottom - top)
        if (Math.abs(img.getBoundingClientRect().height - h) < 1) break
        img.style.width = img.style.height = `${h}px`
        img.style.marginTop = `${top - start}px`
      }
    }
    fit()
    document.fonts?.ready.then(fit)
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <img ref={logo} className="hero-logo" src="favicon.svg" alt="" />
        <div>
          <h1 className="hero-title"><span ref={title}>Lean for All</span></h1>
          <div className="hero-sub"><span ref={sub}>Lean the easy way</span></div>
          <p ref={pitch} className="hero-pitch">
            Learn to read Lean proofs, and to audit AI-generated ones: a short lesson a day for a month, then hands-on audits of
            real theorems. You only ever pick answers. No installation, no experience needed.
          </p>
          <div className="hero-actions">
            <a className="btn primary" href={lessonUrl(next)}>
              {started ? 'Continue' : 'Start'}: {nextLesson.label ?? `Day ${nextLesson.day}`}, {nextLesson.title}
            </a>
            {started && <span className="muted small">{done} of {LESSONS.length} lessons done</span>}
          </div>
        </div>
      </section>

      <section className="week-cards">
        {WEEKS.map((w) => {
          const n = w.lessons.length
          const k = w.lessons.filter((l) => p.done[l.day]).length
          return (
            <a key={w.week} className="week-card card" href={weekUrl(w)}>
              <span className="eyebrow">{w.label ?? `Week ${w.week}`}</span>
              <span className="week-card-title">{w.title}</span>
              <span className="week-card-summary">{w.summary}</span>
              <span className="week-card-progress">
                <span className="bar"><i style={{ width: `${(100 * k) / n}%` }} /></span>
                <span className="muted small">{k} / {n}</span>
              </span>
            </a>
          )
        })}
        <a className="week-card card" href="practice/">
          <span className="eyebrow">Anytime</span>
          <span className="week-card-title">Practice</span>
          <span className="week-card-summary">Endless short sets, aimed at the ideas you mix up most.</span>
        </a>
      </section>

      <p className="home-note muted small">
        Every piece of Lean on this site was checked by Lean when the site was built. Hover over code to see what Lean knows
        about it: the type of every name, and the goals at every step of a proof.
      </p>
    </div>
  )
}
