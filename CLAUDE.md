# WaveFern: instructions for Claude

**Read `ARCHITECTURE.md` first.** It maps every game system to its files, the script load order, the shared globals and how saving works. Use it to open only the files for the system you are changing; do not read the whole codebase.

## Rules for every change
- Newest file wins: later scripts re-assign earlier functions. Search for a function name across `*.js` and `dev/*.js` and read the last definition in `index.html` tag order.
- Never reorder or rename script tags in `index.html` without checking the load-order section of `ARCHITECTURE.md`. Files wrapped in one closure (`161-multiplayer.js`, `150-tour-cities.js`, `139-airport.js`) cannot be split mechanically.
- Versions and releases: read `docs/releases.md`. Fixes and small tweaks ship at once as a patch; exciting features merge dark (behind the `FW_DEV` gate or a `HELD` flag) and go live together on release day as the next major (v56.0.0). Never edit version numbers by hand: run `node tools/bump.js patch "note"` (or `drop`), which bumps `GAME_VERSION`, adds the `VERSION_HISTORY` entry and bumps the `?v=` of changed scripts (including `version.js?v=`). Pull `main` first; on a version-only merge conflict run `node tools/bump.js renumber`; before merging run `node tools/bump.js trial` and `check`. No history rewrites or force pushes.
- Saves must keep loading: add new saved fields with defaults in `S` (`02-data.js`); never remove an old save-code decoder; append to `ART`, never reorder it.
- Tell the user the version number whenever you merge to `main`.

## Checks before merging
1. `node tools/check-globals.js` (needs `npm i acorn eslint-scope`): baseline is 0 problems (18 investigated warnings are listed in the `KNOWN` table in the tool); anything new is a regression.
2. Serve the repo (`python3 -m http.server 8099`) and run `THREE_JS=<path to three@0.128.0 build/three.min.js> node tools/load-test.js http://127.0.0.1:8099/index.html` (set `THREE_JS` when the CDN is blocked).
3. Update `ARCHITECTURE.md` in the same commit if files, load order or shared globals change.

## Orchestrate mode (on until James says "orchestrate off")
- The main session plans, writes briefs and checks results; bulk work goes to workers (`.claude/agents/builder.md` on Sonnet, `.claude/agents/reviewer.md` on Haiku).
- Every brief states the goal, the files to read and a runnable "Done when:" check. Run that check yourself before accepting worker output; never pass on an unchecked report.
- Session start: read this file, `docs/progress.md`, `docs/decisions.md`, `docs/known-issues.md`. Session end: update them and propose skill or CLAUDE.md edits (see `.claude/skills/reflect`), applied only after James approves.
- Headless checks: Three.js r128 can be fetched with `npm pack three@0.128.0` when the CDNs are blocked; `tools/load-test.js` only boots and opens apps, so also drive the feature you changed (its `window.FW_*` test hook) in Playwright.
- Every new place in the world also goes on the world map and the minimap (`POIS` entry + `mapPaint` wrapper).
- Keep replies terse.
