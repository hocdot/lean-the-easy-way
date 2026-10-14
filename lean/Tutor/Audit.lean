import Lean

/-!
# `#tutor_audit`

Looks at every theorem, axiom and definition declared in the current file and reports,
as one JSON message prefixed with `TUTOR_AUDIT:`, the things a reviewer should check:

* which axioms each theorem rests on (`sorryAx` means an unfinished proof),
* whether the hypotheses contradict each other (then the theorem says nothing),
* whether the conclusion is literally one of the hypotheses (a circular statement),
* whether the conclusion is true without any hypothesis,
* which hypotheses the proof never uses,
* a word-for-word English reading of the statement.

The English is produced by fixed rules, never guessed, so it is always faithful
(if sometimes clumsy).
-/

open Lean Meta Elab Command

namespace Tutor

/-! ## English reading of a proposition -/

/-- Is `e` a sentence built from connectives (and so needs parentheses inside another one)? -/
private def isCompound (e : Expr) : Bool :=
  e.isForall || e.isAppOfArity ``And 2 || e.isAppOfArity ``Or 2 || e.isAppOfArity ``Iff 2
    || e.isAppOfArity ``Exists 2 || (e.isAppOfArity ``Not 1 && !e.appArg!.isAppOfArity ``Eq 3)

private def code (e : Expr) : MetaM String := do
  return s!"`{← ppExpr e}`"

private def binderName (d : LocalDecl) : String :=
  toString d.userName.eraseMacroScopes

/-- How a `∀` binder reads in English; consecutive binders of the same group are merged. -/
private inductive Group where
  | inst | hyp | statement | type | data (type : Expr)
  deriving BEq

private def groupOf (d : LocalDecl) : MetaM Group := do
  if d.binderInfo.isInstImplicit then return .inst
  if ← isProp d.type then return .hyp
  if d.type.isProp then return .statement
  if d.type.isSort then return .type
  return .data d.type

private def joinAnd (xs : Array String) : String :=
  " and ".intercalate xs.toList

/-- Opens `∃ a, ∃ b, …` binders of type `t` (so they read "there are a, b … such that"),
and hands their names and the body, in context, to `k`. -/
private partial def existsChain (t e : Expr) (k : Array Name → Expr → MetaM String)
    (acc : Array Name := #[]) : MetaM String :=
  match e with
  | .app (.app (.const ``Exists _) t') (.lam n _ b bi) =>
    if t' == t then withLocalDecl n bi t fun x => existsChain t (b.instantiate1 x) k (acc.push n)
    else k acc e
  | _ => k acc e

mutual
  /-- A faithful, rule-based English reading of `e`. -/
  partial def english (e : Expr) : MetaM String := do
    let e ← instantiateMVars e
    if e.isForall then
      return ← forallTelescope e fun xs body => do
        let mut out := ""
        let mut i := 0
        while h : i < xs.size do
          let g ← groupOf (← xs[i].fvarId!.getDecl)
          let mut members := #[]
          while h' : i < xs.size do
            let d ← xs[i].fvarId!.getDecl
            if (← groupOf d) != g then break
            members := members.push d
            i := i + 1
          let names := ", ".intercalate (members.map binderName).toList
          let phrase ← match g with
            | .inst => do pure s!"assuming {joinAnd (← members.mapM fun d => code d.type)}, "
            | .hyp => do pure s!"if {joinAnd (← members.mapM fun d => sub d.type)}, then "
            | .statement => pure s!"for every statement {names}, "
            | .type => pure s!"for every type {names}, "
            | .data t => do pure s!"for every {names} : {← ppExpr t}, "
          out := out ++ phrase
        return out ++ (← english body)
    match e.getAppFnArgs with
    | (``Not, #[p]) =>
      if let (``Eq, #[_, a, b]) := p.getAppFnArgs then
        return s!"`{← ppExpr a} ≠ {← ppExpr b}`"
      return s!"it is not the case that {← sub p}"
    | (``And, #[a, b]) => return s!"{← sub a} and {← sub b}"
    | (``Or, #[a, b]) => return s!"{← sub a} or {← sub b}"
    | (``Iff, #[a, b]) => return s!"{← sub a} if and only if {← sub b}"
    | (``Exists, #[t, .lam n _ b bi]) =>
      withLocalDecl n bi t fun x =>
        existsChain t (b.instantiate1 x) fun more body => do
          let names := (#[n] ++ more).toList.map (toString ·.eraseMacroScopes)
          let pre := if names.length == 1 then "there is some" else "there are"
          return s!"{pre} {", ".intercalate names} : {← ppExpr t} such that {← english body}"
    | (``True, #[]) => return "true (this needs no proof)"
    | (``False, #[]) => return "false (this can never be proved)"
    | _ => code e

  /-- Like `english`, but parenthesized when `e` is itself built from connectives. -/
  partial def sub (e : Expr) : MetaM String := do
    let s ← english e
    return if isCompound e then s!"({s})" else s
end

/-! ## Checks -/

/-- Runs `tac` on a fresh goal of type `goal`; true when it closes the goal without `sorry`.
Never throws, and never lets a failing tactic be "recovered" into a fake success. -/
private def closes (goal : Expr) (tac : TSyntax `tactic) : TermElabM Bool :=
  withoutModifyingState do
    tryCatchRuntimeEx
      (withTheReader Core.Context (fun c => { c with maxHeartbeats := 40000 * 1000 }) <|
        withCurrHeartbeats <| Term.withoutErrToSorry do
          let mvar ← mkFreshExprMVar goal
          let rest ← Tactic.run mvar.mvarId! (Tactic.withoutRecover (Tactic.evalTactic tac))
          let proof ← instantiateMVars mvar
          return rest.isEmpty && !proof.hasSorry && !proof.hasExprMVar)
      (fun _ => return false)

structure Hyp where
  name : String
  type : String
  english : String
  used : Bool
  /-- a hypothesis (a statement assumed), as opposed to a variable like `n : Nat` -/
  prop : Bool
  deriving ToJson

structure Report where
  name : String
  kind : String
  line : Nat
  statement : String
  english : String
  hyps : Array Hyp
  conclusion : String
  conclusionEnglish : String
  axioms : Array String
  /-- the tactic that derived `False` from the hypotheses alone -/
  contradiction : Option String := none
  /-- the hypothesis whose statement is exactly the conclusion -/
  circular : Option String := none
  /-- the tactic that proves the conclusion with no hypotheses at all -/
  trivial : Option String := none
  /-- a hypothesis the conclusion follows from in one step (by applying it) -/
  direct : Option String := none
  deriving ToJson

private def kindOf : ConstantInfo → String
  | .thmInfo _ => "theorem"
  | .axiomInfo _ => "axiom"
  | .defnInfo _ => "def"
  | .opaqueInfo _ => "opaque"
  | .inductInfo _ => "inductive"
  | _ => "other"

/-- Tries each tactic in order on `goal`; the first one that closes it. -/
private def firstCloser (goal : Expr) (tacs : List (String × TSyntax `tactic)) :
    TermElabM (Option String) := do
  for (name, tac) in tacs do
    if ← closes goal tac then return some name
  return none

/-- The tactics among `names` that this file can use (Mathlib's `linarith` and friends exist
only when Mathlib is imported), parsed now rather than when this module was compiled. -/
private def available (names : List String) : TermElabM (List (String × TSyntax `tactic)) := do
  let env ← getEnv
  return names.filterMap fun n =>
    match Parser.runParserCategory env `tactic n with
    | .ok stx => some (n.replace "(intros; " "" |>.replace ")" "", ⟨stx⟩)
    | .error _ => none

def auditDecl (info : ConstantInfo) (line : Nat) : TermElabM Report := do
  let name := info.name
  let axioms := (← collectAxioms name).map toString
  let statement := toString (← ppExpr info.type)
  let (report, closed?) ← forallTelescope info.type fun xs concl => do
    let mut hyps := #[]
    let mut propHyps := #[]
    let value? := match info with
      | .thmInfo v => some v.value
      | .defnInfo v => some v.value
      | _ => none
    let body? := value?.map fun v => (mkAppN v xs).headBeta
    for x in xs do
      let d ← x.fvarId!.getDecl
      if d.binderInfo.isInstImplicit then continue
      let isPropHyp ← isProp d.type
      if isPropHyp then propHyps := propHyps.push x
      let used := match body? with
        | some b => !isPropHyp || b.containsFVar x.fvarId!
        | none => true
      let reading ← if isPropHyp then english d.type
        else if d.type.isProp then pure s!"{binderName d} stands for any statement"
        else if d.type.isSort then pure s!"{binderName d} stands for any type"
        else pure s!"{binderName d} is any {← ppExpr d.type}"
      hyps := hyps.push {
        name := binderName d, type := toString (← ppExpr d.type), english := reading, used, prop := isPropHyp }
    let mut report : Report := {
      name := toString name, kind := kindOf info, line, statement
      english := ← english info.type, hyps
      conclusion := toString (← ppExpr concl), conclusionEnglish := ← english concl, axioms }
    unless info matches .thmInfo _ do return (report, none)
    -- A hypothesis that is literally the conclusion.
    for h in propHyps do
      let d ← h.fvarId!.getDecl
      if ← withReducible (isDefEq d.type concl) then
        report := { report with circular := some (binderName d) }
        break
    -- A hypothesis that gives the conclusion in one step: it carries the whole claim.
    if report.circular.isNone then
      for h in propHyps do
        let d ← h.fvarId!.getDecl
        let hid := mkIdent d.userName
        if !d.userName.hasMacroScopes then
          if ← closes concl (← `(tactic| (apply $hid <;> assumption))) then
            report := { report with direct := some (binderName d) }
            break
    -- Hypotheses that contradict each other: then anything follows from them.
    if !propHyps.isEmpty then
      report := { report with contradiction := ← firstCloser (mkConst ``False) ([
        ("contradiction", ← `(tactic| contradiction)),
        ("omega", ← `(tactic| omega)),
        ("simp_all", ← `(tactic| (simp_all; done))) ] ++ (← available ["linarith", "nlinarith", "norm_num at *"])) }
    -- The statement with its hypotheses dropped, checked below outside this local context
    -- (where the hypotheses would still be visible to the tactics).
    let dataXs ← xs.filterM fun x => return !(← isProp (← x.fvarId!.getDecl).type)
    let closed ← mkForallFVars dataXs concl
    let independent := !propHyps.isEmpty && !(propHyps.any fun h => closed.containsFVar h.fvarId!)
    return (report, if independent then some closed else none)
  -- A conclusion that holds without any hypothesis: then the hypotheses are decoration.
  let some closed := closed? | return report
  return { report with trivial := ← firstCloser closed ([
    ("rfl", ← `(tactic| (intros; rfl))),
    ("decide", ← `(tactic| (intros; decide))),
    ("omega", ← `(tactic| (intros; omega))),
    ("simp", ← `(tactic| (intros; simp; done))) ] ++ (← available ["(intros; norm_num)", "(intros; linarith)"])) }

/-- Declarations written in this file, in source order, skipping compiler-generated ones. -/
def fileDecls : CommandElabM (Array (ConstantInfo × Nat)) := do
  let env ← getEnv
  let mut out := #[]
  for c in ← env.getLocalConstantInfos (skipTheoremSubDecls := true) do
    let n := c.name
    if n.isInternalDetail || isAuxRecursor env n || isNoConfusion env n then continue
    let some ranges ← findDeclarationRanges? n | continue
    let some info := env.find? n | continue
    out := out.push (info, ranges.range.pos.line)
  return out.qsort (·.2 < ·.2)

elab "#tutor_audit" : command => do
  let decls ← fileDecls
  let reports ← liftTermElabM <| decls.mapM fun (info, line) => auditDecl info line
  logInfo m!"TUTOR_AUDIT:{(toJson reports).compress}"

end Tutor
