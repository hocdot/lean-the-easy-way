# Everything lives in this folder: Lean (via elan) is installed into .tools/elan,
# the Lean helper is built in lean/.lake, and JS packages go in frontend/node_modules.
.PHONY: setup mathlib dev start test snapshot preview verso verso-serve clean

export ELAN_HOME := $(CURDIR)/.tools/elan
export PATH := $(ELAN_HOME)/bin:$(PATH)
# Mathlib's download cache, kept here rather than in ~/.cache
export MATHLIB_CACHE_DIR := $(CURDIR)/.tools/mathlib-cache
LEAN_VERSION := $(shell cat lean/lean-toolchain)

setup:            ## once: install Lean into .tools/, build the Lean helper, install JS packages
	@test -x $(ELAN_HOME)/bin/elan || ( \
	  mkdir -p .tools && \
	  curl -sSfL https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -o .tools/elan-init.sh && \
	  sh .tools/elan-init.sh -y --no-modify-path --default-toolchain none )
	elan toolchain install $(LEAN_VERSION)
	elan default $(LEAN_VERSION)
	cd lean && lake build
	cd frontend && npm install

mathlib:          ## optional (about 7 GB): Mathlib, for the Advanced cases and Mathlib code in the Lab
	cd mathlib && lake update && lake exe cache get

dev:              ## while editing: backend on :8787 and the site on http://localhost:5180 (hot reload)
	@trap 'kill 0' EXIT; \
	(cd backend && node --no-warnings server.ts) & \
	(cd frontend && npx vite --open)

start:            ## build the site and serve everything on http://localhost:8787
	cd frontend && npm run build
	cd backend && node --no-warnings server.ts

test:             ## check every piece of Lean in the course, the practice generator, and the backend
	cd frontend && npm test
	cd backend && npm test

snapshot:         ## after changing lessons: save Lean's answers for the hosted site (commit the result)
	cd frontend && node --no-warnings scripts/snapshot.ts

preview:          ## the exact GitHub Pages build (no Lean server), on http://localhost:4173/lean-the-easy-way/
	cd frontend && npm run preview:pages

verso:            ## the Verso version (needs setup + mathlib): question widgets, then Lean-checked pages in site/_out/html-multi
	cd frontend && node --no-warnings scripts/scope-css.ts && npx vite build --config vite.verso.config.ts
	rm -rf site/_out/html-multi   # pages from an earlier build (and their search index) would linger
	cd site && lake build && lake exe site
	cd frontend && node --no-warnings scripts/check-verso.ts

verso-serve:      ## look at the Verso version on http://localhost:8790
	cd site/_out/html-multi && python3 -m http.server 8790

clean:            ## remove build outputs (keeps the Lean install)
	rm -rf frontend/dist lean/.lake/build
