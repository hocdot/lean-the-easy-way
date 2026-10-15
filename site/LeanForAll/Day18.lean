import VersoManual
import LeanForAll.Meta.Question

open Verso.Genre Manual
open Verso.Genre.Manual.InlineLean
open LeanForAll

#doc (Manual) "Day 18: Hidden arguments" =>
%%%
tag := "day18"
file := "day18"
number := false
%%%

_Find the arguments a statement does not show: curly braces, square brackets, and variables Lean adds by itself._

Some functions work for every type. This one applies a function twice:

```lean -keep (name := day18_1)
def twice {α : Type} (f : α → α) (x : α) : α := f (f x)

#eval twice (fun n => n + 3) 10
```
```leanOutput day18_1
16
```

`α` (the Greek letter alpha) stands for *any type*: `Nat`, `Int`, lists, anything. `fun n => n + 3` is a function without a name: “take n, give n + 3”. Applied twice to 10, it gives 16.

`{α : Type}` is in curly braces, so it is an *implicit* argument: you never write it, Lean works it out (here from `10`, it sees α is `Nat`). In a theorem, curly braces still mean *for every*. They only change who fills the value in.

```stepBreak
```

To see everything, put `@` in front of a name. Then all hidden arguments become visible, and you may give them yourself:

```lean -keep (name := day18_2)
def twice {α : Type} (f : α → α) (x : α) : α := f (f x)

#check @twice
#eval @twice Nat (fun n => n + 3) 10
#check @List.length_append
```
```leanOutput day18_2
@twice : {α : Type} → (α → α) → α → α
```
```leanOutput day18_2
16
```
```leanOutput day18_2
@List.length_append : ∀ {α : Type u_1} {as bs : List α}, (as ++ bs).length = as.length + bs.length
```

The last line shows a library theorem in full:

```
∀ {α : Type u_1} {as bs : List α}, (as ++ bs).length = as.length + bs.length
```

> For every type α and all lists as and bs with entries in α, …

(`Type u_1` is a technical detail: read it as “some type”.)

```stepBreak
```

Square brackets are a second kind of hidden argument:

```lean -keep (name := day18_3)
def addSelf {α : Type} [Add α] (x : α) : α := x + x

#eval addSelf 5
#eval addSelf (-3 : Int)
```
```leanOutput day18_3
10
```
```leanOutput day18_3
-6
```

`[Add α]` reads “α must have an addition”. Lean finds that addition by itself: for `Nat` the usual one, for `Int` the integer one. Such an argument is called a _type class_ argument.

For an auditor, this means `+` in a general statement is “whatever addition the type has”. Usually that is the familiar one, but a file can supply its own.

```stepBreak
```

The most surprising hidden argument: in core Lean, a name you never declared silently becomes “for every”. This is called *autoImplicit*.

```lean -keep (name := day18_4)
theorem t (h : a > 5) : a > 3 := by omega

#check @t
```
```leanOutput day18_4
@t : ∀ {a : Nat}, a > 5 → a > 3
```

`a` is declared nowhere, yet Lean accepts it and reads `∀ {a : Nat}, a > 5 → a > 3`. Here that is harmless. But a typo also becomes a variable:

```lean -keep (name := day18_5)
theorem length_self : lenght = lenght := rfl

#check @length_self
```
```leanOutput day18_5
@length_self : ∀ {α : Sort u_1} {lenght : α}, lenght = lenght
```

`lenght` is not a function about length. It is a new hidden variable, and the theorem only says that something equals itself. Mathlib switches autoImplicit off, so there such code is rejected.

> When a name in a statement is declared nowhere, it is a hidden “for every”, or a typo.

# Check yourself
%%%
number := false
%%%

```question
d18-q1
```

```question
d18-q2
```

```question
d18-q3
```

```question
d18-q4
```

```question
d18-q5
```

```question
d18-q6
```
