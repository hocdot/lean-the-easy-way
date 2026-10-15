// Where each page is on the Verso site, relative to the site root (Verso's <base> makes relative
// links work from any page). These must match the `file :=` names in site/LeanForAll/*.lean:
// `make verso` checks that every one of them was generated (scripts/check-verso.ts).
import { WEEKS } from '../content/index.ts'
import type { Lesson, Week } from '../content/types.ts'

/** A lesson's page name: day07 for Day 7, case2 for the Advanced section's Case 2. */
export const lessonSlug = (l: Lesson): string =>
  l.label ? `case${l.label.replace(/\D/g, '')}` : `day${String(l.day).padStart(2, '0')}`

export const weekUrl = (w: Week): string => (w.label ? 'advanced/' : `week-${w.week}/`)

export function lessonUrl(day: number): string {
  const week = WEEKS.find((w) => w.lessons.some((l) => l.day === day))!
  return weekUrl(week) + lessonSlug(week.lessons.find((l) => l.day === day)!) + '/'
}
