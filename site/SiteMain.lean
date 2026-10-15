import VersoManual
import LeanForAll

open Verso.Genre Manual
open Verso.Output Html

-- where the site is published (the share image needs a full address)
def siteUrl := "https://hocdot.github.io/lean-the-easy-way/"
def description :=
  "Lean for All teaches you, the easy way, to read Lean proofs and audit AI-generated ones: " ++
  "short daily lessons, multiple-choice practice, and hands-on audits of real theorems. Free, no installation."

def config : RenderConfig where
  emitTeX := false
  emitHtmlSingle := .no
  emitHtmlMulti := .immediately
  -- one page per week, and one per lesson inside it
  htmlDepth := 2
  -- The site's own files are copied in when the pages are generated (not compiled in), so
  -- editing them needs no Lean rebuild: the theme (palette, fonts, dark mode, the theme
  -- switch) and the question widgets (built from frontend/ by `make verso`).
  extraFiles := [
    ("assets/favicon.svg", "favicon.svg"), ("assets/og.png", "og.png"),
    ("assets/lfa-theme.css", "lfa-theme.css"), ("assets/lfa-theme.js", "lfa-theme.js"),
    ("assets/lfa-widgets.css", "lfa-widgets.css"), ("assets/lfa-widgets.js", "lfa-widgets.js")
  ]
  extraHead := #[
    -- what search engines and link previews show, as on the React site
    {{<meta name="description" content={{description}}/>}},
    {{<meta property="og:type" content="website"/>}},
    {{<meta property="og:site_name" content="Lean for All"/>}},
    {{<meta property="og:title" content="Lean for All: Lean the easy way"/>}},
    {{<meta property="og:description" content="Learn to read Lean proofs and audit AI-generated ones, a little every day."/>}},
    {{<meta property="og:image" content={{siteUrl ++ "og.png"}}/>}},
    {{<meta property="og:image:width" content="1200"/>}},
    {{<meta property="og:image:height" content="630"/>}},
    {{<meta name="twitter:card" content="summary_large_image"/>}},
    {{<link rel="icon" type="image/svg+xml" href="favicon.svg"/>}},
    {{<link rel="stylesheet" href="lfa-theme.css"/>}},
    {{<link rel="stylesheet" href="lfa-widgets.css"/>}},
    {{<script src="lfa-theme.js"></script>}},
    {{<script src="lfa-widgets.js" defer="defer"></script>}},
    {{<link rel="preconnect" href="https://fonts.googleapis.com"/>}},
    {{<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"/>}}
  ]
  logo := some "favicon.svg"
  sourceLink := some "https://github.com/hocdot/lean-the-easy-way"
  issueLink := some "https://github.com/hocdot/lean-the-easy-way/issues/new"

def main := manualMain (%doc LeanForAll) (config := config)
