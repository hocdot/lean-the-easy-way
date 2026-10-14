// Lean's input shortcuts: type \to then a space to get →, as in Lean's editors.

export const ABBREVIATIONS: Record<string, string> = {
  to: '→', r: '→', imp: '→', '->': '→', l: '←', '<-': '←', iff: '↔', '<->': '↔',
  and: '∧', or: '∨', not: '¬', neg: '¬', forall: '∀', all: '∀', ex: '∃', exists: '∃',
  ne: '≠', '=n': '≠', le: '≤', '<=': '≤', ge: '≥', '>=': '≥', '|-': '⊢', vdash: '⊢',
  '<': '⟨', '>': '⟩', N: 'ℕ', nat: 'ℕ', Z: 'ℤ', int: 'ℤ', R: 'ℝ', Q: 'ℚ',
  in: '∈', notin: '∉', sub: '⊆', ss: '⊆', x: '×', times: '×', circ: '∘', o: '∘', '.': '·', cdot: '·',
  la: 'λ', lam: 'λ', fun: 'λ', sum: '∑', prod: '∏', dvd: '∣', '|': '∣', up: '↑', '^-1': '⁻¹',
  a: 'α', b: 'β', g: 'γ', e: 'ε', d: 'δ', '0': '₀', '1': '₁', '2': '₂',
}

/** The abbreviation ending at the end of `before` (e.g. "x \\to" → "to"), if any. */
export function abbreviationAt(before: string): { from: number; to: string } | null {
  const m = /\\([^\s\\]+)$/.exec(before)
  if (!m) return null
  const sym = ABBREVIATIONS[m[1]]
  return sym ? { from: before.length - m[0].length, to: sym } : null
}

/** The shortcuts shown in the Lab's help line. */
export const SHOWN = [
  ['\\to', '→'], ['\\and', '∧'], ['\\or', '∨'], ['\\not', '¬'], ['\\forall', '∀'], ['\\ex', '∃'],
  ['\\iff', '↔'], ['\\ne', '≠'], ['\\le', '≤'], ['\\<', '⟨'], ['\\>', '⟩'], ['\\N', 'ℕ'],
] as const
