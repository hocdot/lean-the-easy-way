import { useEffect, useState } from 'react'

/** 'auto' follows the system; 'light' and 'dark' override it for this site only. */
export type Theme = 'auto' | 'light' | 'dark'

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const t = localStorage.getItem('theme')
      return t === 'light' || t === 'dark' ? t : 'auto'
    } catch {
      return 'auto'
    }
  })
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable: the choice just isn't remembered */
    }
  }, [theme])
  return [theme, setTheme]
}
