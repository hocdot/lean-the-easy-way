// Checks the Verso site against the course data (run by `make verso`, after the pages are
// generated). The lesson text lives in site/LeanForAll/*.lean, but the questions and the list of
// lessons live in src/content, and the two must agree, or things break with no error:
//   - a question id on a page that the course data does not have shows "Unknown question";
//   - a lesson whose page leaves out one of its questions can never be marked done;
//   - a page at a different place than src/verso/urls.ts says makes the links to it dead.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LESSONS, questionsOf, WEEKS } from '../src/content/index.ts'
import { lessonSlug, lessonUrl, weekUrl } from '../src/verso/urls.ts'

const SITE = new URL('../../site/', import.meta.url).pathname
const OUT = join(SITE, '_out/html-multi')
const problems: string[] = []

// the questions on each page, by the page's file name
const pages = new Map<string, string[]>()
const lean = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === 'Meta' ? [] : lean(join(dir, e.name))) : e.name.endsWith('.lean') ? [join(dir, e.name)] : []))
for (const f of lean(join(SITE, 'LeanForAll'))) {
  const text = readFileSync(f, 'utf8')
  const ids = [...text.matchAll(/^```question\n\s*(\S+)\s*\n```/gm)].map((m) => m[1])
  const file = /^file := "([^"]+)"/m.exec(text)?.[1]
  if (ids.length && !file) problems.push(`${f}: has questions but no \`file := ...\``)
  if (file) pages.set(file, ids)
  for (const m of text.matchAll(/^```weekLessons\n\s*(\d+)\s*\n```/gm)) {
    if (!WEEKS.some((w) => w.week === Number(m[1]))) problems.push(`${f}: weekLessons ${m[1]} is not a week in the course data`)
  }
}

const known = new Set(LESSONS.flatMap((l) => questionsOf(l).map((q) => q.id)))
for (const [file, ids] of pages) {
  for (const id of ids) if (!known.has(id)) problems.push(`${file}: question ${id} is not in the course data`)
}

for (const l of LESSONS) {
  const name = `${l.label ?? `Day ${l.day}`} (${lessonSlug(l)})`
  const onPage = pages.get(lessonSlug(l))
  if (!onPage) {
    problems.push(`${name}: no page with \`file := "${lessonSlug(l)}"\``)
    continue
  }
  const want = questionsOf(l).map((q) => q.id)
  const missing = want.filter((id) => !onPage.includes(id))
  const extra = onPage.filter((id) => !want.includes(id))
  if (missing.length) problems.push(`${name}: page leaves out ${missing.join(', ')}, so the lesson can never be finished`)
  if (extra.length) problems.push(`${name}: page asks ${extra.join(', ')}, which belong to other lessons`)
  if (!existsSync(join(OUT, lessonUrl(l.day), 'index.html'))) problems.push(`${name}: no page generated at ${lessonUrl(l.day)}`)
}
for (const w of WEEKS) {
  if (!existsSync(join(OUT, weekUrl(w), 'index.html'))) problems.push(`${w.label ?? `Week ${w.week}`}: no page generated at ${weekUrl(w)}`)
}
for (const page of ['practice/', 'lab/', 'about/']) {
  if (!existsSync(join(OUT, page, 'index.html'))) problems.push(`no page generated at ${page}`)
}

if (problems.length) {
  console.error(`The Verso site and the course data disagree:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.log(`Verso site matches the course data: ${LESSONS.length} lessons, ${known.size} questions.`)
