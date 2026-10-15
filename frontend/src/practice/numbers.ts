// Generated "What does Lean show?" questions about Lean's number conventions (Day 2): Nat
// subtraction stops at 0, division rounds down, x / 0 = 0, x % 0 = x, Int can go negative.
// Every wrong option is a specific mistake tied to a misconception, and the tests check every
// generated answer against real Lean.
import type { MisconceptionId } from '../content/misconceptions.ts'
import type { Option, Question } from '../content/types.ts'
import { rng } from './logic.ts'

export interface NumberQuestion {
  q: Question
  /** a Lean statement that holds exactly when the right answer is right (for the tests) */
  check: string
}

type Kind = 'sub-below' | 'sub' | 'div' | 'mod' | 'div-zero' | 'mod-zero' | 'int-sub' | 'sub-add' | 'div-mul'

const KIND_MISCONCEPTION: Record<Kind, MisconceptionId> = {
  'sub-below': 'nat-subtraction',
  sub: 'nat-subtraction',
  'int-sub': 'nat-subtraction',
  'sub-add': 'nat-subtraction',
  div: 'division-convention',
  mod: 'division-convention',
  'div-zero': 'division-convention',
  'mod-zero': 'division-convention',
  'div-mul': 'division-convention',
}

const KINDS = Object.keys(KIND_MISCONCEPTION) as Kind[]

const opt = (text: string, why: string, misconception?: MisconceptionId): Option =>
  misconception ? { text, why, misconception } : { text, why, correct: true }
const code = (v: number | string) => `\`${v}\``

export function generateNumber(seed: number, weights: Partial<Record<MisconceptionId, number>> = {}): NumberQuestion {
  const rand = rng(seed)
  const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))
  // lean toward the convention the learner mixes up more
  const w = (k: Kind) => 1 + 10 * (weights[KIND_MISCONCEPTION[k]] ?? 0)
  let r = rand() * KINDS.reduce((s, k) => s + w(k), 0)
  const kind = KINDS.find((k) => (r -= w(k)) < 0) ?? 'sub-below'

  let expr: string
  let answer: number
  let check: string
  let options: Option[]
  const nat = 'nat-subtraction'
  const div = 'division-convention'

  switch (kind) {
    case 'sub-below': {
      const a = int(2, 9), b = int(a + 1, a + 9)
      expr = `${a} - ${b}`
      answer = 0
      options = [
        opt(code(0), `On \`Nat\`, subtraction stops at zero: ${b} is more than ${a}, so ${a} - ${b} = 0.`),
        opt(code(a - b), `There are no negative natural numbers. You would get ${a - b} with \`(${a} : Int) - ${b}\`.`, nat),
        opt('An error', '`Nat` subtraction is defined for every pair of numbers: below zero it gives 0, not an error.', nat),
        opt(code(b - a), `That is ${b} - ${a}. Lean computes ${a} - ${b}, which stops at 0.`, nat),
      ]
      break
    }
    case 'sub': {
      const b = int(2, 9), a = int(b + 1, b + 12)
      expr = `${a} - ${b}`
      answer = a - b
      options = [
        opt(code(a - b), `${a} is at least ${b}, so this is ordinary subtraction: ${a - b}. Only going below zero stops at 0.`),
        opt(code(0), `Subtraction only stops at zero when the result would be negative. Here ${a} - ${b} = ${a - b} is fine.`, nat),
        opt('An error', `Nothing unusual here: ${a} - ${b} = ${a - b}.`, nat),
      ]
      break
    }
    case 'div': {
      let a = 0, b = 0
      do { b = int(2, 7); a = int(b + 1, 9 * b) } while (a % b === 0)
      expr = `${a} / ${b}`
      answer = Math.floor(a / b)
      options = [
        opt(code(answer), `Division on \`Nat\` rounds down: ${a} / ${b} = ${answer}, remainder ${a % b}.`),
        opt(code(Number((a / b).toFixed(2))), '`Nat` has no fractions. Division gives a whole number, rounded down.', div),
        opt(code(answer + 1), `Lean rounds down, not to the nearest number: ${answer}, not ${answer + 1}.`, div),
        opt(code(a % b), `${a % b} is the remainder, which \`${a} % ${b}\` gives. \`/\` gives the quotient, ${answer}.`, div),
      ]
      break
    }
    case 'mod': {
      let a = 0, b = 0
      do { b = int(2, 7); a = int(b + 1, 9 * b) } while (a % b === 0 || Math.floor(a / b) === a % b)
      expr = `${a} % ${b}`
      answer = a % b
      options = [
        opt(code(answer), `\`%\` is the remainder: ${a} = ${b} × ${Math.floor(a / b)} + ${answer}.`),
        opt(code(Math.floor(a / b)), `That is the quotient, \`${a} / ${b}\`. \`%\` gives what is left over: ${answer}.`, div),
        opt(code(Number((a / b).toFixed(2))), '`%` is not division: it gives the whole-number remainder.', div),
      ]
      break
    }
    case 'div-zero': {
      const a = int(1, 99)
      expr = `${a} / 0`
      answer = 0
      options = [
        opt(code(0), 'In Lean, dividing by zero gives zero by convention.'),
        opt('An error', 'Lean never stops with an error here: every operation gives some value, and `x / 0` is defined to be `0`.', div),
        opt(code(a), `That would be dividing by 1. By convention \`${a} / 0 = 0\`.`, div),
      ]
      break
    }
    case 'mod-zero': {
      const a = int(1, 99)
      expr = `${a} % 0`
      answer = a
      options = [
        opt(code(a), `By convention \`x % 0 = x\`: dividing by zero gives 0 with ${a} left over, so the remainder is ${a}.`),
        opt(code(0), 'That is `x / 0`. The remainder `x % 0` is `x`, so that `x = 0 * (x / 0) + x % 0` still holds.', div),
        opt('An error', 'Lean never stops with an error here: `x % 0` is defined to be `x`.', div),
      ]
      break
    }
    case 'int-sub': {
      const a = int(2, 9), b = int(a + 1, a + 9)
      expr = `(${a} : Int) - ${b}`
      answer = a - b
      options = [
        opt(code(a - b), `\`(${a} : Int)\` is an integer, and integers can be negative: ${a} - ${b} = ${a - b}.`),
        opt(code(0), 'Stopping at zero only happens on `Nat`. Here the numbers are integers.', nat),
        opt(code(b - a), `That is ${b} - ${a}. Lean computes ${a} - ${b} = ${a - b}.`, nat),
      ]
      break
    }
    case 'sub-add': {
      const a = int(2, 9), b = int(a + 1, a + 9)
      expr = `${a} - ${b} + ${b}`
      answer = b
      options = [
        opt(code(b), `${a} - ${b} stops at 0 on \`Nat\`, and then 0 + ${b} = ${b}.`),
        opt(code(a), `On paper the ${b}s cancel, but not on \`Nat\`: ${a} - ${b} is already 0, so the result is ${b}.`, nat),
        opt(code(0), `${a} - ${b} is 0, but then ${b} is added: 0 + ${b} = ${b}.`, nat),
      ]
      break
    }
    case 'div-mul': {
      let a = 0, b = 0
      do { b = int(2, 6); a = int(b + 1, 8 * b) } while (a % b === 0)
      expr = `${a} / ${b} * ${b}`
      answer = Math.floor(a / b) * b
      options = [
        opt(code(answer), `${a} / ${b} rounds down to ${Math.floor(a / b)}, and ${Math.floor(a / b)} * ${b} = ${answer}.`),
        opt(code(a), `On paper they cancel, but \`/\` on \`Nat\` rounds down first: ${a} / ${b} = ${Math.floor(a / b)}.`, div),
        opt(code(answer + b), `Division rounds down, not up: ${a} / ${b} = ${Math.floor(a / b)}, so the result is ${answer}.`, div),
      ]
      break
    }
  }

  // the same wrong value can come from two mistakes (e.g. 0 twice): keep the first
  const seen = new Set<string>()
  options = options.filter((o) => (seen.has(o.text) ? false : (seen.add(o.text), true)))
  // shuffle, keeping the questions reproducible from the seed
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  const type = kind === 'int-sub' ? 'Int' : 'Nat'
  check = `example : (${expr} : ${type}) = ${answer < 0 ? `(${answer})` : answer} := by decide`
  return {
    q: { id: `num-${seed}`, prompt: 'What does Lean show?', code: `#eval ${expr}`, generated: true, options },
    check,
  }
}
