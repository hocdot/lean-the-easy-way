// The interactive parts of the Verso site. Verso writes the pages (text and Lean code, checked by
// Lean); the interactive parts are placeholders that this bundle fills in:
//   <div class="lfa-question" data-question-id="d01-q1">   a question, as on the React site
//   <div class="lfa-widget" data-widget="home">             the start page
//   <div class="lfa-widget" data-widget="practice">         the Practice page
//   <div class="lfa-widget" data-widget="reset">            the "Reset my progress" button
//   <div class="lfa-widget" data-widget="step">             where a lesson's next step begins (Stepper.tsx)
// It also marks a lesson done once all its questions are answered, and ticks finished lessons in
// Verso's table of contents.
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { LESSONS, questionsOf, WEEKS } from '../content'
import { PracticeView } from '../components/PracticeView'
import { Home } from './Home'
import { WeekLessons } from './WeekLessons'
import { Stepper, stepperFor } from './Stepper'
import { lessonSlug, lessonUrl, weekUrl } from './urls'
import { QuestionCard } from '../components/QuestionCard'
import { actions, progressNow } from '../store'
import './widgets.css'

const questionById = new Map(LESSONS.flatMap((l) => questionsOf(l).map((q) => [q.id, q] as const)))
const lessonOf = new Map(LESSONS.flatMap((l) => questionsOf(l).map((q) => [q.id, l] as const)))


/** What the pages after the weeks are, in the table of contents (by their address). */
const PAGES: Record<string, string> = {
  practice: 'Short sets on what you mix up',
  lab: 'Your own Lean: coming soon',
  about: 'How it teaches, and thanks',
}

/** Which weeks the learner opened or closed in the table of contents (this browser only). */
const OPEN_KEY = 'lfa-toc-open'
function openWeeks(): Record<number, boolean> {
  try {
    return JSON.parse(localStorage.getItem(OPEN_KEY) ?? '{}')
  } catch {
    return {}
  }
}
function saveOpenWeeks(open: Record<number, boolean>) {
  try {
    localStorage.setItem(OPEN_KEY, JSON.stringify(open))
  } catch {
    // private windows: the sidebar just starts afresh on each page
  }
}

/** Verso's table of contents, made compact: "Week 1: Reading…" becomes a small "Week 1" over
 *  the title, "Day 3: Variables…" a number in a column next to it. */
function tidyContents() {
  const toc = document.querySelector('#toc')
  if (!toc || toc.classList.contains('lfa-toc')) return
  toc.classList.add('lfa-toc')
  const book = toc.querySelector('.split-toc.book .title span:last-child')
  if (book) book.textContent = 'Course'
  for (const a of toc.querySelectorAll<HTMLAnchorElement>('.split-toc a')) {
    const m = /^(Week \d+|Advanced|Day (\d+)|Case (\d+)): (.*)$/.exec(a.textContent!.trim())
    if (!m) continue
    const key = document.createElement('span')
    key.className = 'toc-k'
    key.textContent = m[2] ?? (m[3] ? `C${m[3]}` : m[1])
    const title = document.createElement('span')
    title.className = 'toc-t'
    title.textContent = m[4]
    a.replaceChildren(key, title)
    a.classList.add(m[2] || m[3] ? 'toc-lesson' : 'toc-week')
    // a week's own list is headed by just "Week 1 lessons" ("Advanced cases"): its title is in the list above
    if (a.closest('.title')) title.textContent = m[1] === 'Advanced' ? 'cases' : 'lessons'
  }
  // each week's lessons go right under its entry, like an outline: a click on a week opens or
  // closes them (Verso lists only the current week's, so the lists come from the course data)
  const here = /([a-z]+\d+)\/?$/.exec(location.pathname)?.[1]
  for (const w of WEEKS) {
    const entry = [...toc.querySelectorAll<HTMLAnchorElement>('.split-toc.book td > a')].find((a) => a.getAttribute('href')?.startsWith(weekUrl(w)))
    if (!entry) continue
    const list = document.createElement('table')
    list.className = 'lfa-nested'
    for (const l of w.lessons) {
      const row = list.insertRow()
      if (lessonSlug(l) === here) row.className = 'current'
      const a = document.createElement('a')
      a.className = 'toc-lesson'
      a.href = lessonUrl(l.day)
      const key = document.createElement('span')
      key.className = 'toc-k'
      key.textContent = l.label ? `C${l.label.replace(/\D/g, '')}` : String(l.day)
      const title = document.createElement('span')
      title.className = 'toc-t'
      title.textContent = l.title
      a.append(key, title)
      row.insertCell().append(a)
    }
    entry.after(list)
    const row = entry.closest('tr')!
    const chev = document.createElement('span')
    chev.className = 'toc-chev'
    chev.setAttribute('aria-hidden', 'true')
    entry.append(chev)
    const set = (open: boolean) => {
      row.classList.toggle('open', open)
      entry.setAttribute('aria-expanded', String(open))
    }
    // the weeks the learner opened or closed stay that way from page to page; one not touched
    // yet is open only while you are in it
    set(openWeeks()[w.week] ?? row.classList.contains('current'))
    entry.addEventListener('click', (e) => {
      e.preventDefault()
      const open = !row.classList.contains('open')
      set(open)
      saveOpenWeeks({ ...openWeeks(), [w.week]: open })
    })
  }
  // the first entry after the weeks (Practice) starts the rest of the site
  toc.querySelector('.split-toc.book tr:has(a.toc-week):not(:has(~ tr a.toc-week)) + tr')?.classList.add('toc-gap')
  // the other pages get a line under their name too, like the weeks
  for (const a of toc.querySelectorAll<HTMLAnchorElement>('.split-toc.book td a:not(.toc-week):not(.toc-lesson)')) {
    const about = PAGES[/([a-z]+)\/?(#.*)?$/.exec(a.getAttribute('href') ?? '')?.[1] ?? '']
    if (!about) continue
    const key = document.createElement('span')
    key.className = 'toc-k'
    key.textContent = a.textContent!.trim()
    const title = document.createElement('span')
    title.className = 'toc-t'
    title.textContent = about
    a.replaceChildren(key, title)
    a.classList.add('toc-week')
  }
}

/** Ticks lessons whose questions are all answered, in Verso's table of contents. */
function tickContents() {
  const p = progressNow()
  for (const a of document.querySelectorAll<HTMLAnchorElement>('#toc a[href]')) {
    const m = /([a-z]+\d+)\/?(#.*)?$/.exec(a.getAttribute('href') ?? '')
    const lesson = m && LESSONS.find((l) => lessonSlug(l) === m[1])
    if (!lesson || !p.done[lesson.day] || a.classList.contains('done')) continue
    a.classList.add('done')
    a.title = 'Done'
    const key = a.querySelector('.toc-k')
    if (key) key.textContent = '✓'
    else {
      const tick = document.createElement('span')
      tick.className = 'lfa-done'
      tick.textContent = ' ✓'
      a.appendChild(tick)
    }
  }
}

function render(el: HTMLElement, node: ReactNode) {
  createRoot(el).render(<StrictMode><div className="lfa">{node}</div></StrictMode>)
}

function ResetButton() {
  return (
    <button
      className="btn small"
      onClick={() => {
        if (confirm('Erase all your progress and answers? This cannot be undone.')) {
          actions.reset()
          location.reload()
        }
      }}
    >
      Reset my progress
    </button>
  )
}

function mount() {
  for (const el of document.querySelectorAll<HTMLElement>('.lfa-question[data-question-id]')) {
    if (el.dataset.mounted) continue
    el.dataset.mounted = '1'
    const q = questionById.get(el.dataset.questionId!)
    if (!q) {
      el.textContent = `Unknown question ${el.dataset.questionId}`
      continue
    }
    const lesson = lessonOf.get(q.id)!
    render(el, (
      <QuestionCard
        question={q}
        initialPick={progressNow().answers.find((a) => a.q === q.id)?.pick}
        onAnswer={(correct, i, first) => {
          const o = q.options[i]
          const misconceptions = o.misconception ? [o.misconception] : []
          actions.answer(first ? { q: q.id, correct, misconceptions, pick: i } : { q: `review:${q.id}`, correct, misconceptions })
          // a lesson is done once every one of its questions has a first answer
          const answered = new Set(progressNow().answers.map((a) => a.q))
          if (questionsOf(lesson).every((x) => answered.has(x.id))) {
            actions.complete(lesson.day)
            tickContents()
          }
        }}
      />
    ))
  }
  for (const el of document.querySelectorAll<HTMLElement>('.lfa-widget[data-widget]')) {
    if (el.dataset.mounted) continue
    el.dataset.mounted = '1'
    if (el.dataset.widget === 'home') render(el, <Home />)
    else if (el.dataset.widget?.startsWith('week-')) render(el, <WeekLessons week={Number(el.dataset.widget.slice(5))} />)
    else if (el.dataset.widget === 'practice') render(el, <PracticeView />)
    else if (el.dataset.widget === 'reset') render(el, <ResetButton />)
  }
  // a lesson page: one step at a time
  const first = document.querySelector<HTMLElement>('.lfa-question[data-question-id]')
  const stepped = first && !document.querySelector('.lfa-stepped') && stepperFor(first, (id) => lessonOf.get(id))
  if (stepped) render(stepped.foot, <Stepper {...stepped} />)
  tidyContents()
  tickContents()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
else mount()
