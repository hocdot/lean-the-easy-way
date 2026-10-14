import { lazy, Suspense, useEffect, useState } from 'react'
import { health, STATIC } from './api'
import { About } from './components/About'
import { LabSoon } from './components/LabSoon'
import { Logo } from './components/Logo'
import { DayList, LessonView } from './components/LessonView'
import { PracticeView } from './components/PracticeView'
import { LESSONS } from './content'
import { useRoute } from './nav'
import { nextDay, useProgress } from './store'
import { useTheme, type Theme } from './theme'

// the Lab's editor is the heaviest part of the site: load it only when the Lab is opened
const LabView = lazy(() => import('./components/LabView').then((m) => ({ default: m.LabView })))

const REPO = 'https://github.com/hocdot/lean-the-easy-way'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export default function App() {
  const [theme, setTheme] = useTheme()
  const route = useRoute()
  const progress = useProgress()
  const [backend, setBackend] = useState<'ok' | 'no-lean' | 'down' | null>(null)

  useEffect(() => {
    if (!STATIC) health().then(setBackend)
  }, [])

  const day = route.page === 'learn' ? (route.day ?? nextDay(progress, LESSONS.length)) : null

  return (
    <div className={`app page-${route.page}`}>
      <header className="topbar">
        <a className="brand" href="#/learn">
          <Logo />
          <span className="brand-text">
            <h1>Lean for All</h1>
            <span className="brand-sub">Lean the easy way</span>
          </span>
        </a>
        <nav className="tabs" aria-label="Sections">
          <a href="#/learn" className={route.page === 'learn' ? 'on' : ''}>Learn</a>
          <a href="#/practice" className={route.page === 'practice' ? 'on' : ''}>Practice</a>
          <a href="#/lab" className={route.page === 'lab' ? 'on' : ''}>Lab</a>
        </nav>
        <div className="top-right">
          <a className="btn ghost small" href={REPO} target="_blank" rel="noopener noreferrer">
            Source code
          </a>
          <a className="btn ghost small" href={`${REPO}/issues/new`} target="_blank" rel="noopener noreferrer">
            Suggest an idea
          </a>
          <div className="seg-toggle theme" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.value}
                role="radio"
                aria-checked={theme === t.value}
                className={theme === t.value ? 'on' : ''}
                onClick={() => setTheme(t.value)}
                title={t.value === 'auto' ? 'Follow the system setting' : `Always ${t.label.toLowerCase()}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <a href="#/about" className={`btn ghost small ${route.page === 'about' ? 'on' : ''}`}>About</a>
        </div>
      </header>

      {(backend === 'down' || backend === 'no-lean') && (
        <div className="banner">
          {backend === 'down'
            ? <>Lean is not running, so Run buttons and the Lab will not work. Lessons and practice still do. Start it with <code>make dev</code> in the project folder.</>
            : <>The backend is up but Lean is not set up yet. Run <code>make setup</code> in the project folder.</>}
        </div>
      )}

      <main className="main">
        {route.page === 'learn' && day != null && (
          <div className="learn">
            <aside className="learn-side">
              <DayList current={day} />
            </aside>
            <LessonView key={day} day={day} />
          </div>
        )}
        {route.page === 'practice' && <PracticeView />}
        {route.page === 'lab' && STATIC && <LabSoon />}
        {route.page === 'lab' && !STATIC && <Suspense fallback={<p className="muted">Loading the Lab…</p>}><LabView /></Suspense>}
        {route.page === 'about' && <About />}
      </main>
    </div>
  )
}
