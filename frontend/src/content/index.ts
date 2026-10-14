import type { Lesson, Markdown, Question, Week } from './types.ts'
import { week1 } from './week1.ts'
import { week2 } from './week2.ts'
import { week3 } from './week3.ts'
import { week4 } from './week4.ts'
import { advanced } from './advanced.ts'

export const WEEKS: Week[] = [week1, week2, week3, week4, advanced]
export const LESSONS: Lesson[] = WEEKS.flatMap((w) => w.lessons)

export const isQuestion = (x: Markdown | Question): x is Question => typeof x !== 'string'

/** A lesson's screens in order: its flow, or its cards followed by its questions. */
export const screensOf = (l: Lesson): (Markdown | Question)[] => l.flow ?? [...l.cards, ...l.questions]
export const questionsOf = (l: Lesson): Question[] => screensOf(l).filter(isQuestion)
export const cardsOf = (l: Lesson): Markdown[] => screensOf(l).filter((x): x is Markdown => !isQuestion(x))
/** "Day 3", or a lesson's own label */
export const labelOf = (l: Lesson) => l.label ?? `Day ${l.day}`

/** In a fill-in question, the code with a tactic in place of `???`. */
export const fillIn = (code: string, tactic: string) => code.replace('???', tactic)
/** The tactic an option stands for: its text without the backticks. */
export const tacticOf = (text: string) => text.replace(/^`|`$/g, '')
