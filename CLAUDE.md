# WaveFern: instructions for Claude

**Read `ARCHITECTURE.md` first.** It maps every game system to its files, the script load order, the shared globals and how saving works. Use it to open only the files for the system you are changing; do not read the whole codebase.

## Rules for every change
- Newest file wins: later scripts re-assign earlier functions. Search for a function name across `*.js` and `dev/*.js` and read the last definition in `index.html` tag order.
- Never reorder or rename script tags in `index.html` without checking the load-order section of `ARCHITECTURE.md`. Files wrapped in one closure (`161-multiplayer.js`, `150-tour-cities.js`, `139-airport.js`) cannot be split mechanically.
- Every change bumps `GAME_VERSION` in `version.js`, adds a `VERSION_HISTORY` entry, and bumps the `?v=` on any changed script tag (including `version.js?v=`). Pull `main` first: other changes land often.
- Saves must keep loading: add new saved fields with defaults in `S` (`02-data.js`); never remove an old save-code decoder; append to `ART`, never reorder it.
- Tell the user the version number whenever you merge to `main`.

## Checks before merging
1. `node tools/check-globals.js` (needs `npm i acorn eslint-scope`): baseline is 0 problems (18 investigated warnings are listed in the `KNOWN` table in the tool); anything new is a regression.
2. Serve the repo (`python3 -m http.server 8099`) and run `THREE_JS=<path to three@0.128.0 build/three.min.js> node tools/load-test.js http://127.0.0.1:8099/index.html` (set `THREE_JS` when the CDN is blocked).
3. Update `ARCHITECTURE.md` in the same commit if files, load order or shared globals change.
