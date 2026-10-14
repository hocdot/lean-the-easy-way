// The Lab's editor: CodeMirror with Lean highlighting, Lean's input shortcuts (\to → →),
// and Lean's messages shown as underlines.
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint'
import { EditorState, RangeSetBuilder } from '@codemirror/state'
import {
  Decoration, EditorView, ViewPlugin, drawSelection, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers,
  type DecorationSet, type ViewUpdate,
} from '@codemirror/view'
import { useEffect, useRef } from 'react'
import type { Message } from '../api'
import { abbreviationAt } from '../lean/abbrev'
import { tokenizeBlock } from '../lean/highlight'

const highlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = this.build(view)
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = this.build(u.view)
    }
    build(view: EditorView) {
      const b = new RangeSetBuilder<Decoration>()
      const doc = view.state.doc
      tokenizeBlock(doc.toString()).forEach((toks, i) => {
        let pos = doc.line(i + 1).from
        for (const t of toks) {
          if (t.kind !== 'text' && t.text.length) b.add(pos, pos + t.text.length, Decoration.mark({ class: `tk-${t.kind}` }))
          pos += t.text.length
        }
      })
      return b.finish()
    }
  },
  { decorations: (v) => v.decorations },
)

/** On space, tab or enter after an abbreviation like \to, replace it with its symbol. */
const abbreviations = EditorView.inputHandler.of((view, from, to, text) => {
  if (!/^[\s()[\]{},:]$/.test(text)) return false
  const line = view.state.doc.lineAt(from)
  const a = abbreviationAt(line.text.slice(0, from - line.from))
  if (!a) return false
  view.dispatch({
    changes: { from: line.from + a.from, to, insert: a.to + (text === ' ' ? '' : text) },
    selection: { anchor: line.from + a.from + a.to.length + (text === ' ' ? 0 : text.length) },
  })
  return true
})

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '13.5px', backgroundColor: 'var(--surface)', color: 'var(--ink)' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.65' },
  '.cm-content': { caretColor: 'var(--ink)', padding: '10px 0' },
  '.cm-gutters': { backgroundColor: 'var(--surface)', color: 'var(--ink-3)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'var(--accent-soft)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--ink)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: 'var(--lo-soft) !important' },
  '.cm-cursor': { borderLeftColor: 'var(--ink)' },
  '.cm-tooltip': { backgroundColor: 'var(--surface)', border: '1px solid var(--line-2)', color: 'var(--ink)' },
  '.cm-diagnostic': { fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'pre-wrap', maxWidth: '560px' },
})

function toDiagnostics(view: EditorView, messages: Message[]): Diagnostic[] {
  const doc = view.state.doc
  const pos = (line: number, col: number) => {
    const l = doc.line(Math.min(Math.max(line, 1), doc.lines))
    return Math.min(l.from + col, l.to)
  }
  return messages.map((m) => {
    const from = pos(m.line, m.col)
    let to = pos(m.endLine, m.endCol)
    if (to <= from) to = Math.min(from + 1, doc.length)
    return {
      from, to,
      severity: m.severity === 'info' ? 'info' : m.severity,
      message: m.text,
    }
  })
}

export function Editor({
  value, onChange, onCursor, messages, goto,
}: {
  value: string
  onChange: (v: string) => void
  onCursor: (line: number, col: number) => void
  messages: Message[]
  /** move the cursor to this line (a new object each time) */
  goto?: { line: number } | null
}) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const cb = useRef({ onChange, onCursor })
  cb.current = { onChange, onCursor }

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(), highlightActiveLineGutter(), history(), drawSelection(), highlightActiveLine(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          highlighter, abbreviations, lintGutter(), theme, EditorView.lineWrapping,
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cb.current.onChange(u.state.doc.toString())
            if (u.docChanged || u.selectionSet) {
              const head = u.state.selection.main.head
              const line = u.state.doc.lineAt(head)
              cb.current.onCursor(line.number, head - line.from)
            }
          }),
        ],
      }),
    })
    view.current = v
    return () => v.destroy()
    // the editor is created once; later values arrive through the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
  }, [value])

  useEffect(() => {
    const v = view.current
    if (v) v.dispatch(setDiagnostics(v.state, toDiagnostics(v, messages)))
  }, [messages])

  useEffect(() => {
    const v = view.current
    if (!v || !goto) return
    const line = v.state.doc.line(Math.min(Math.max(goto.line, 1), v.state.doc.lines))
    v.dispatch({ selection: { anchor: line.from }, effects: EditorView.scrollIntoView(line.from, { y: 'center' }) })
    v.focus()
  }, [goto])

  return <div className="editor" ref={host} />
}
