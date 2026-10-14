// Turns the facts tutor-run reports about each declaration into plain-language findings.

export type Level = 'bad' | 'warn' | 'info' | 'good'

export interface Finding {
  level: Level
  title: string
  detail: string
}

interface Facts {
  name: string
  kind: string
  axioms: string[]
  hyps: { name: string; used: boolean; type: string }[]
  contradiction: string | null
  circular: string | null
  trivial: string | null
  direct: string | null
}

/** The three axioms all of ordinary mathematics in Lean rests on. */
export const STANDARD_AXIOMS = ['propext', 'Classical.choice', 'Quot.sound']

const isNative = (a: string) => a.includes('native_decide') || a === 'Lean.ofReduceBool' || a === 'Lean.trustCompiler'

export function findingsFor(d: Facts): Finding[] {
  const out: Finding[] = []
  if (d.kind === 'axiom') {
    out.push({
      level: 'bad',
      title: 'Assumed, not proved',
      detail: `\`${d.name}\` is an \`axiom\`: Lean takes it on faith. Anything that uses it is only as true as this assumption.`,
    })
    return out
  }
  if (d.kind !== 'theorem') {
    out.push({
      level: 'info',
      title: 'A definition',
      detail: 'Lean checks that it is well-formed, not that it means what its name says. Read its body: theorems about it are only as meaningful as it is.',
    })
    return out
  }

  if (d.axioms.includes('sorryAx')) {
    out.push({
      level: 'bad',
      title: 'Unfinished proof',
      detail: 'The proof (or something it uses) contains `sorry`, a placeholder that skips the proof. Nothing is proved.',
    })
  }
  const custom = d.axioms.filter((a) => a !== 'sorryAx' && !STANDARD_AXIOMS.includes(a) && !isNative(a))
  if (custom.length) {
    out.push({
      level: 'bad',
      title: 'Rests on a made-up assumption',
      detail: `The proof uses ${custom.map((a) => `\`${a}\``).join(', ')}, declared with \`axiom\`. Lean never checked ${custom.length > 1 ? 'these' : 'it'}.`,
    })
  }
  if (d.axioms.some(isNative)) {
    out.push({
      level: 'warn',
      title: 'Trusts compiled code',
      detail: 'The proof uses `native_decide`, which runs a program and trusts its answer instead of having Lean’s kernel check every step. Usually fine for computations, but it is extra trust.',
    })
  }
  if (d.contradiction) {
    out.push({
      level: 'bad',
      title: 'Hypotheses contradict each other',
      detail: `Lean derived \`False\` from the hypotheses alone (with \`${d.contradiction}\`). No situation satisfies them all, so the theorem is vacuous: it “proves” its conclusion only because it can never be used.`,
    })
  }
  if (d.circular) {
    out.push({
      level: 'bad',
      title: 'Assumes its own conclusion',
      detail: `Hypothesis \`${d.circular}\` states exactly the conclusion. The theorem has the shape P → P, which is true of anything.`,
    })
  }
  if (d.direct && !d.contradiction) {
    out.push({
      level: 'warn',
      title: 'One hypothesis carries the claim',
      detail: `The conclusion follows from \`${d.direct}\` in a single step: the proof only applies it. Ask whether \`${d.direct}\` is known to be true, and whether it is any easier than the conclusion. If not, nothing was really proved.`,
    })
  }
  if (d.trivial) {
    out.push({
      level: 'warn',
      title: 'Hypotheses are not needed',
      detail: `The conclusion is true on its own (\`${d.trivial}\` proves it with no hypotheses). Check that the statement really says what was claimed.`,
    })
  }
  const unused = d.hyps.filter((h) => !h.used).map((h) => `\`${h.name}\``)
  if (unused.length && !d.circular && !d.trivial && !d.axioms.includes('sorryAx')) {
    out.push({
      level: 'info',
      title: unused.length > 1 ? 'Some hypotheses are never used' : 'A hypothesis is never used',
      detail: `The proof never uses ${unused.join(', ')}. Harmless, but ask why ${unused.length > 1 ? 'they are' : 'it is'} there.`,
    })
  }
  if (!out.some((f) => f.level === 'bad' || f.level === 'warn')) {
    out.push({
      level: 'good',
      title: 'No red flags found',
      detail: 'Proved using only Lean’s standard axioms, and the automatic checks found no contradiction or circularity. Still read the statement: does it say what was claimed?',
    })
  }
  return out
}

// Constructs that can make code mean something other than what it looks like.
const FILE_RULES: { re: RegExp; finding: Finding }[] = [
  {
    re: /^\s*(local\s+|scoped\s+)?(notation|infix|infixl|infixr|prefix|postfix|macro|macro_rules|syntax|elab|elab_rules)\b/m,
    finding: {
      level: 'warn',
      title: 'Defines its own notation',
      detail: 'The file adds notation or syntax. Symbols may not mean what they usually do: find where each one used in a theorem is defined.',
    },
  },
  {
    re: /^\s*(@\[[^\]]*\]\s*)?(local\s+|scoped\s+)?instance\b/m,
    finding: {
      level: 'info',
      title: 'Defines an instance',
      detail: 'An `instance` can change what `+`, `≤`, `0` and so on mean for a type. Check it matches the usual meaning.',
    },
  },
  {
    re: /@\[\s*(implemented_by|extern)\b|^\s*unsafe\b/m,
    finding: {
      level: 'warn',
      title: 'Replaces code with unchecked code',
      detail: '`implemented_by`, `extern` or `unsafe` swap in code that Lean does not check. Proofs by evaluation can then be wrong.',
    },
  },
  {
    re: /set_option\s+debug\./,
    finding: {
      level: 'bad',
      title: 'Turns off a safety check',
      detail: 'A `debug.` option can disable parts of Lean’s checking. Treat everything in this file as unverified.',
    },
  },
  {
    re: /^\s*example\b/m,
    finding: {
      level: 'info',
      title: 'Contains examples',
      detail: '`example`s are checked but have no name, so they are not audited one by one. Turn one into a `theorem` to audit it.',
    },
  },
]

export function fileFlags(code: string, hasErrors: boolean, mathlib: boolean): Finding[] {
  const noComments = code.replace(/\/-[\s\S]*?-\//g, '').replace(/--.*$/gm, '')
  const out = FILE_RULES.filter((r) => r.re.test(noComments)).map((r) => r.finding)
  if (!mathlib && /^\s*import\s+Mathlib/m.test(noComments)) {
    out.unshift({
      level: 'warn',
      title: 'Needs Mathlib',
      detail: 'This code imports Mathlib, the big library of mathematics, which is not installed in this local setup. Run `make mathlib` in the project folder to add it.',
    })
  }
  if (hasErrors) {
    out.unshift({
      level: 'bad',
      title: 'Lean rejected part of this file',
      detail: 'Some of the code has errors (see Messages). The audit covers only the declarations Lean accepted.',
    })
  }
  return out
}
