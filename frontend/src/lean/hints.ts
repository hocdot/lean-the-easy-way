// Plain-English hints for Lean's most common messages, shown under the message itself.

const HINTS: [RegExp, string][] = [
  [/unsolved goals/, 'The proof ended before everything was proved. The goals listed are what is still left.'],
  [/declaration uses `?sorry`?/, '`sorry` skips a proof. Lean accepts the file, but this part is not proved.'],
  [/The rfl tactic|Not a definitional equality|rfl.*failed|definitionally equal/i, 'The two sides do not compute to the same value.'],
  [/omega could not prove the goal/, '`omega` could not prove it: the statement may be false, or need reasoning beyond + − and comparisons.'],
  [/decide.*(failed|false)|evaluates to false/i, 'Computing the statement gives `false`: it does not hold.'],
  [/Type mismatch|type mismatch/, 'What was given does not have exactly the statement that was needed here.'],
  [/[Uu]nknown (identifier|constant)/, 'Lean does not know this name. It may be misspelled, or come from a library that is not loaded (such as Mathlib).'],
  [/unknown module prefix|unknown package|object file .* does not exist/, 'This needs a library that is not installed here (often Mathlib).'],
  [/unexpected token|expected/, 'Lean could not read the code here: something is missing or mistyped.'],
  [/failed to synthesize/, 'Lean could not find how to do this operation for these types (for example, negative numbers in `Nat`).'],
  [/Tactic `constructor` failed|constructor.*failed/, '`constructor` needs a goal built from parts, like `∧` or `↔`.'],
  [/Tactic `introN` failed|no additional binders|intro.*failed/, '`intro` needs a goal of the form `… → …` or `∀ x, …`.'],
  [/linter|is not explicitly referenced|unused variable/i, 'Only style advice, not a problem with the proof.'],
]

export function hintFor(text: string): string | null {
  for (const [re, hint] of HINTS) if (re.test(text)) return hint
  return null
}
