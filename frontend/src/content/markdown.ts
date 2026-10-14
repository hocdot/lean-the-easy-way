// A small Markdown parser for lesson text (see types.ts for what it supports).
// Shared by the page (components/Markdown.tsx) and the content check (tests/content.test.ts).
import type { Expect } from './types.ts'

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'callout'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'code'; lang: string; expect: Expect; code: string; mathlib: boolean }

const FLAGS: Record<string, Expect> = { error: 'error', sorry: 'sorry', fragment: 'skip' }

export function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const out: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const fence = /^```(\w*)((?:\s+\w+)*)\s*$/.exec(line)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++])
      i++
      const lang = fence[1] || 'text'
      const flags = fence[2].trim().split(/\s+/)
      const flag = flags.find((f) => f in FLAGS)
      const expect: Expect = lang === 'lean' ? (flag ? FLAGS[flag] : 'ok') : 'skip'
      out.push({ kind: 'code', lang, expect, code: body.join('\n'), mathlib: flags.includes('mathlib') })
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    if (line.startsWith('### ')) {
      out.push({ kind: 'h', text: line.slice(4) })
      i++
      continue
    }
    const list = /^(\s*)(-|\d+\.)\s+/.exec(line)
    if (list) {
      const kind = list[2] === '-' ? 'ul' : 'ol'
      const items: string[] = []
      while (i < lines.length) {
        const m = /^(\s*)(-|\d+\.)\s+(.*)$/.exec(lines[i])
        if (m) items.push(m[3])
        else if (lines[i].trim() && /^\s+/.test(lines[i]) && items.length) items[items.length - 1] += ' ' + lines[i].trim()
        else break
        i++
      }
      out.push({ kind, items })
      continue
    }
    const para: string[] = []
    const callout = line.startsWith('> ')
    while (i < lines.length && lines[i].trim() && !/^```/.test(lines[i]) && !(para.length && /^(\s*)(-|\d+\.)\s+/.test(lines[i]))) {
      // a bare ">" separates quoted paragraphs
      if (callout && lines[i].trim() === '>') {
        i++
        break
      }
      para.push(callout ? lines[i].replace(/^>\s?/, '') : lines[i])
      i++
    }
    out.push({ kind: callout ? 'callout' : 'p', text: para.join(' ') })
  }
  return out
}

/** Every Lean block in a piece of Markdown, with what Lean must say about it. */
export function leanBlocks(src: string): { code: string; expect: Expect; mathlib: boolean }[] {
  return parseBlocks(src).flatMap((b) => (b.kind === 'code' && b.lang === 'lean' ? [{ code: b.code, expect: b.expect, mathlib: b.mathlib }] : []))
}

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'b' | 'i'; text: string }

export function parseInline(src: string): Inline[] {
  const out: Inline[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m.index > last) out.push({ kind: 'text', text: src.slice(last, m.index) })
    if (m[1] != null) out.push({ kind: 'code', text: m[1] })
    else if (m[2] != null) out.push({ kind: 'b', text: m[2] })
    else out.push({ kind: 'i', text: m[3] })
    last = re.lastIndex
  }
  if (last < src.length) out.push({ kind: 'text', text: src.slice(last) })
  return out
}
