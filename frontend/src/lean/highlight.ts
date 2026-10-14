// A small Lean tokenizer, shared by code blocks and the Lab editor.

export type TokenKind = 'comment' | 'keyword' | 'tactic' | 'type' | 'symbol' | 'number' | 'string' | 'sorry' | 'text'

export interface Token {
  kind: TokenKind
  text: string
}

const KEYWORDS = new Set([
  'theorem', 'lemma', 'def', 'example', 'abbrev', 'instance', 'structure', 'class', 'inductive', 'where',
  'fun', 'λ', 'let', 'in', 'have', 'show', 'from', 'by', 'match', 'with', 'if', 'then', 'else', 'do',
  'namespace', 'section', 'end', 'open', 'variable', 'universe', 'axiom', 'import', 'deriving',
  'local', 'scoped', 'notation', 'infix', 'infixl', 'infixr', 'prefix', 'postfix', 'macro', 'macro_rules',
  'syntax', 'private', 'protected', 'noncomputable', 'partial', 'unsafe', 'opaque', 'calc', 'at',
  'set_option', 'attribute', 'mutual', 'termination_by', 'decreasing_by',
])

const TACTICS = new Set([
  'intro', 'intros', 'exact', 'apply', 'refine', 'rfl', 'decide', 'native_decide', 'omega', 'simp', 'simp_all',
  'constructor', 'cases', 'rcases', 'obtain', 'induction', 'left', 'right', 'exists', 'use', 'rw', 'rewrite',
  'contradiction', 'assumption', 'trivial', 'exfalso', 'unfold', 'specialize', 'linarith', 'norm_num',
  'ring', 'positivity', 'nlinarith', 'aesop', 'tauto', 'exact?', 'apply?', 'first', 'repeat', 'all_goals',
  'any_goals', 'try', 'next', 'case', 'funext', 'ext', 'subst', 'symm', 'calc', 'change', 'generalize', 'done',
])

const TYPES = new Set(['Nat', 'Int', 'Prop', 'Type', 'True', 'False', 'Bool', 'List', 'String', 'Real', 'ℕ', 'ℤ', 'ℝ', 'ℚ', 'Sort'])

const RULES: [TokenKind, RegExp][] = [
  ['comment', /^--.*/],
  ['comment', /^\/-[\s\S]*?(-\/|$)/],
  ['string', /^"(?:[^"\\]|\\.)*"?/],
  ['number', /^\d+(\.\d+)?/],
  ['text', /^#(eval|check|print|reduce)\b/],
  ['text', /^[A-Za-z_À-ɏͰ-Ͽἀ-῿℀-⅏][\w.'!?À-ɏͰ-Ͽ₀-ₜ℀-⅏]*/],
  ['symbol', /^(:=|<;>|←|→|↔|∀|∃|¬|∧|∨|≠|≤|≥|⊢|⟨|⟩|∑|∏|∈|∉|⊆|∣|×|∘|↑|·|=>|\|)/],
  ['text', /^[\s\S]/],
]

export function tokenize(line: string): Token[] {
  const out: Token[] = []
  let rest = line
  while (rest) {
    for (const [kind, re] of RULES) {
      const m = re.exec(rest)
      if (!m) continue
      out.push({ kind: classify(kind, m[0]), text: m[0] })
      rest = rest.slice(m[0].length)
      break
    }
  }
  return out
}

function classify(kind: TokenKind, text: string): TokenKind {
  if (kind !== 'text') return kind
  if (text.startsWith('#')) return 'keyword'
  if (text === 'sorry' || text === 'admit') return 'sorry'
  if (KEYWORDS.has(text)) return 'keyword'
  if (TACTICS.has(text)) return 'tactic'
  if (TYPES.has(text)) return 'type'
  return 'text'
}

/** Tokens for a whole block, keeping block comments that span lines together. */
export function tokenizeBlock(code: string): Token[][] {
  const lines: Token[][] = []
  let inComment = false
  for (const line of code.split('\n')) {
    if (inComment) {
      const end = line.indexOf('-/')
      if (end < 0) {
        lines.push([{ kind: 'comment', text: line }])
        continue
      }
      inComment = false
      lines.push([{ kind: 'comment', text: line.slice(0, end + 2) }, ...tokenize(line.slice(end + 2))])
      continue
    }
    const toks = tokenize(line)
    const last = toks[toks.length - 1]
    if (last?.kind === 'comment' && last.text.startsWith('/-') && !last.text.endsWith('-/')) inComment = true
    lines.push(toks)
  }
  return lines
}
