import Lean

/-!
# tutor-run

Reads a Lean file on stdin, elaborates it, and prints one JSON object:

* `messages`: errors, warnings and `#eval` output, with their ranges,
* `steps`: every tactic in the file, with the goals before and after it,
* `audit`: the `#tutor_audit` report, when run with `--audit`.

Lines are 1-based and columns 0-based (in codepoints), as Lean reports them.
-/

open Lean Elab

structure Range where
  line : Nat
  col : Nat
  endLine : Nat
  endCol : Nat
  deriving ToJson

structure Msg extends Range where
  severity : String
  text : String
  deriving ToJson

structure Step extends Range where
  tactic : String
  goalsBefore : Array String
  goalsAfter : Array String
  deriving ToJson

def auditPrefix := "TUTOR_AUDIT:"

/-- Tactic nodes that only group other tactics; their children are the real steps. -/
def groupingKinds : List SyntaxNodeKind :=
  [``Lean.Parser.Tactic.tacticSeq, ``Lean.Parser.Tactic.tacticSeq1Indented,
   ``Lean.Parser.Tactic.tacticSeqBracketed, ``Lean.Parser.Term.byTactic, nullKind]

def rangeOf (map : FileMap) (stx : Syntax) : Option Range := do
  let pos ← stx.getPos? (canonicalOnly := true)
  let endPos ← stx.getTailPos? (canonicalOnly := true)
  let p := map.toPosition pos
  let e := map.toPosition endPos
  return { line := p.line, col := p.column, endLine := e.line, endCol := e.column }

def ppGoals (ci : ContextInfo) (mctx : MetavarContext) (goals : List MVarId) : IO (Array String) :=
  goals.toArray.mapM fun g =>
    return toString (← { ci with mctx }.runMetaM {} (Meta.ppGoal g))

def collectSteps (map : FileMap) (trees : List InfoTree) : IO (Array Step) := do
  let mut steps : Array Step := #[]
  for tree in trees do
    steps ← tree.foldInfoM (init := steps) fun ci info acc => do
      let .ofTacticInfo ti := info | return acc
      if groupingKinds.contains ti.stx.getKind then return acc
      let some r := rangeOf map ti.stx | return acc
      -- macro expansions repeat the range of the tactic they came from: keep the outermost
      if acc.any (fun s => s.line == r.line && s.col == r.col && s.endLine == r.endLine && s.endCol == r.endCol) then
        return acc
      return acc.push {
        toRange := r
        tactic := (toString (ti.stx.prettyPrint)).trimAscii.toString
        goalsBefore := ← ppGoals ci ti.mctxBefore ti.goalsBefore
        goalsAfter := ← ppGoals ci ti.mctxAfter ti.goalsAfter }
  return steps.qsort fun a b => a.line < b.line || (a.line == b.line && a.col < b.col)

def severityName : MessageSeverity → String
  | .error => "error"
  | .warning => "warning"
  | .information => "info"

def main (args : List String) : IO UInt32 := do
  let audit := args.contains "--audit"
  let source ← (← IO.getStdin).readToEnd
  -- the audit command goes after the user's code, so their line numbers do not move
  let input := if audit then source ++ "\n\n#tutor_audit\n" else source
  initSearchPath (← findSysroot)
  unsafe enableInitializersExecution
  let inputCtx := Parser.mkInputContext input "Main.lean"
  let (header, parserState, messages) ← Parser.parseHeader inputCtx
  let imports := HeaderSyntax.imports header ++ (if audit then #[{ module := `Tutor.Audit }] else #[])
  let opts := Elab.async.set {} false
  let (env, messages) ← processHeaderCore (HeaderSyntax.startPos header) imports (HeaderSyntax.isModule header) opts messages
    inputCtx (trustLevel := 1024) (mainModule := `Main)
  let cmdState := { Command.mkState env messages opts with infoState := { enabled := true } }
  let s ← IO.processCommands inputCtx parserState cmdState
  let mut msgs : Array Msg := #[]
  let mut report : Json := Json.null
  for m in s.commandState.messages.toList do
    let text ← m.data.toString
    if text.startsWith auditPrefix then
      report := (Json.parse (text.drop auditPrefix.length).toString).toOption.getD Json.null
      continue
    let e := m.endPos.getD m.pos
    msgs := msgs.push {
      line := m.pos.line, col := m.pos.column, endLine := e.line, endCol := e.column
      severity := severityName m.severity, text }
  let steps ← collectSteps inputCtx.fileMap s.commandState.infoState.trees.toList
  IO.println (Json.mkObj [
    ("messages", toJson msgs), ("steps", toJson steps), ("audit", report)]).compress
  return 0
