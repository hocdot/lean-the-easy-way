# Everything lives in this folder: Lean (via elan) is installed into .tools/elan, Mathlib's
# built files in mathlib/.lake, and JS packages in frontend/node_modules.
.PHONY: setup mathlib site serve test snapshot clean

export ELAN_HOME := $(CURDIR)/.tools/elan
export PATH := $(ELAN_HOME)/bin:$(PATH)
# Mathlib's download cache, kept here rather than in ~/.cache
export MATHLIB_CACHE_DIR := $(CURDIR)/.tools/mathlib-cache
LEAN_VERSION := $(shell cat lean/lean-toolchain)

setup:            ## once: install Lean into .tools/, build tutor-run (Lean for the tests and snapshot), install JS packages
	@test -x $(ELAN_HOME)/bin/elan || ( \
	  mkdir -p .tools && \
	  curl -sSfL https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -o .tools/elan-init.sh && \
	  sh .tools/elan-init.sh -y --no-modify-path --default-toolchain none )
	elan toolchain install $(LEAN_VERSION)
	elan default $(LEAN_VERSION)
	cd lean && lake build
	cd frontend && npm install

mathlib:          ## once (about 7 GB): Mathlib's built files, at the versions pinned in mathlib/lake-manifest.json
	cd mathlib && lake exe cache get

site:             ## the site (needs setup + mathlib): question widgets, then Lean-checked pages in site/_out/html-multi
	cd frontend && node --no-warnings scripts/scope-css.ts && npm run build
	rm -rf site/_out/html-multi   # pages from an earlier build (and their search index) would linger
	cd site && lake build && lake exe site
	cd frontend && node --no-warnings scripts/check-verso.ts

serve:            ## look at the site on http://localhost:8790
	cd site/_out/html-multi && python3 -m http.server 8790

test:             ## check every question's Lean against real Lean, and the practice generator
	cd frontend && npm test

snapshot:         ## after changing questions: save Lean's answers, which the questions show (commit the result)
	cd frontend && node --no-warnings scripts/snapshot.ts

clean:            ## remove build outputs (keeps Lean and Mathlib)
	rm -rf site/_out lean/.lake/build
