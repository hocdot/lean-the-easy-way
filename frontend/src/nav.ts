// Routes live in the URL hash: #/learn/3, #/practice, #/lab, #/about.
import { useEffect, useState } from 'react'

export type Route =
  | { page: 'learn'; day: number | null }
  | { page: 'practice' }
  | { page: 'lab' }
  | { page: 'about' }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/')
  if (parts[0] === 'practice') return { page: 'practice' }
  if (parts[0] === 'lab') return { page: 'lab' }
  if (parts[0] === 'about') return { page: 'about' }
  const day = Number(parts[1])
  return { page: 'learn', day: parts[0] === 'learn' && day > 0 ? day : null }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function go(path: string) {
  location.hash = path
}

const LAB_KEY = 'lab-code'

/** Opens the Lab with this code in the editor. */
export function openInLab(code: string) {
  try {
    sessionStorage.setItem(LAB_KEY, code)
  } catch {
    /* without storage the Lab opens with its last code */
  }
  go('/lab')
  window.dispatchEvent(new Event('lab-code'))
}

export function takeLabCode(): string | null {
  try {
    const code = sessionStorage.getItem(LAB_KEY)
    sessionStorage.removeItem(LAB_KEY)
    return code
  } catch {
    return null
  }
}
