import VersoManual

/-!
# Questions in Verso pages

A lesson asks a question with a `question` code block holding the question's id:

````
```question
d01-q1
```
````

The question itself (its options, feedback and misconceptions) lives with the rest of the course
data in `frontend/src/content`, where `make test` checks it against real Lean. Here it becomes a
placeholder that the widget bundle (`frontend/src/verso/widgets.tsx`, built into
`site/assets/lfa-widgets.js` and loaded on every page by `SiteMain.lean`) fills with the interactive question: the same component, feedback,
progress and misconception tracking as the React site.
-/

open Verso.Genre Manual
open Verso.Doc Elab
open Verso.Output Html
open Lean

namespace LeanForAll

block_extension Block.question (id : String) where
  data := .str id
  traverse _ _ _ := pure none
  toTeX := none
  toHtml := some fun _ _ _ data _ => do
    let .str id := data
      | Verso.reportError s!"Expected a question id, got {data}"; pure .empty
    pure {{<div class="lfa-question" data-question-id={{id}}></div>}}

-- A placeholder for one of the site's interactive pages (`practice`, `reset`), which the widget
-- bundle fills in: `<div class="lfa-widget" data-widget="practice">`.
block_extension Block.widget (kind : String) where
  data := .str kind
  traverse _ _ _ := pure none
  toTeX := none
  toHtml := some fun _ _ _ data _ => do
    let .str kind := data
      | Verso.reportError s!"Expected a widget name, got {data}"; pure .empty
    pure {{<div class="lfa-widget" data-widget={{kind}}></div>}}

/-- Practice: endless question sets aimed at what the learner mixes up. -/
@[code_block]
def practice : CodeBlockExpanderOf Unit
  | (), _ => ``(Block.other (Block.widget "practice") #[])

/-- The start page: a Continue button to the next unfinished lesson, and a card per week. -/
@[code_block]
def home : CodeBlockExpanderOf Unit
  | (), _ => ``(Block.other (Block.widget "home") #[])

/-- A week's lessons as cards, with the learner's progress. The block holds the week's number
(`5` for Advanced). -/
@[code_block]
def weekLessons : CodeBlockExpanderOf Unit
  | (), code => ``(Block.other (Block.widget $(quote ("week-" ++ code.getString.trimAscii.copy))) #[])

/-- Where a new step of a lesson begins. Lessons are shown one step at a time (as on the React
site); steps also begin at each section heading and around each question. -/
@[code_block]
def stepBreak : CodeBlockExpanderOf Unit
  | (), _ => ``(Block.other (Block.widget "step") #[])

/-- A button that erases the learner's saved progress (after asking). -/
@[code_block]
def resetProgress : CodeBlockExpanderOf Unit
  | (), _ => ``(Block.other (Block.widget "reset") #[])

/-- An interactive multiple-choice question, by its id in the course data. -/
@[code_block]
def question : CodeBlockExpanderOf Unit
  | (), code => do
    ``(Block.other (Block.question $(quote code.getString.trimAscii.copy)) #[])

end LeanForAll
