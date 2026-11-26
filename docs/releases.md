# Releases: quiet patches all week, one drop on release day

**Release day: Thursday.** Everything else ships the moment it is merged. The in-game "New version" notice only appears for a drop (a new major); patches reload in silently the next time the game opens or is refreshed.

**Before merging a big feature to `main` on any day but Thursday, Claude asks James first ("really merge this now?").** Bug fixes and small tweaks merge any day without asking.

| Kind of change | Ships | Version | Example |
|---|---|---|---|
| Bug fix, small tweak, balance, copy | straight away | patch: v55.52.0 → v55.52.1 | `node tools/bump.js patch "Fixed X"` |
| Exciting feature | held, goes live on release day | still a quiet patch when it merges; the drop is the big number | see below |
| The weekly drop | Thursday | next major: v55.x.y → **v56.0.0**, then v57.0.0 ... | `node tools/bump.js drop "Headline"` |

Shown numbers: players see `v1.N` (before the Founder fresh start, build v49.72.0) and `v2.N` (from it on), counted by position in `VERSION_HISTORY` through `fwShowVer` in `version.js`. The build id (v55.x.y) stays the real id for `bump.js`, the `?v=` tags and the update check; never show it raw, wrap it in `fwShowVer`.

No reset, no renaming of build ids: the next number is simply the current one plus one. Old versions, saves and the `?v=` cache tags stay as they are.

## How a feature is held (no hold branch)
Merge it to `main` like any change, but dark:
- Put it behind the existing dev gate: a `dev/dev-*.js` file that starts with `if(!window.FW_DEV)return;` (players on the real site do not run it; the password-protected `/dev/` page does, so James can test it all week), or
- a new flag in the file itself, `const HELD=true` at the top, that makes the feature do nothing.

Held means invisible, so it merges, tests and conflicts early, one small piece at a time, and never builds up a big diverging branch.
Add one line per held feature to the table below (name, file, gate).

## Release day (one small PR)
1. `git fetch origin && git merge origin/main`, then `node tools/bump.js trial` (should say Clean).
2. Remove the gate of every held feature that is ready (drop the `FW_DEV` check or set `HELD=false`).
3. `node tools/bump.js drop "Headline of the drop"`.
4. Add ONE entry at the top of `WF_NEWS` in `news-data.js` (the existing What's new pop-up; short items, today's date, the new `v56.0.0`) and bump its `?v=` (done by the script if the file is changed).
5. `node tools/bump.js check`, `node tools/check-globals.js`, `tools/load-test.js`, then merge. The update checker tells open tabs a new version is out.
A change that is not ready simply keeps its gate for next week.

## Held features
None. v56.0.0 (2026-11-26) released everything that was held: News app, post and News scenes, Pets overhaul, Instagrime feed upgrade and brand posts (`HELD=false`), smoother walking, and menu Newsletter/Contact (FW_DEV checks removed). The `HELD` flags stay in those files for the next hold.

| Feature | File | Gate |
|---|---|---|
| Santa's Lodge (feed Santa treats, burp present) | `dev/dev-lodge-v1.js` | `FW_DEV` |

## Avoiding merge pain
The old pain was never the numbers: every PR edited the same few lines (`GAME_VERSION`, the top history entry, the `?v=` tags), so any two open PRs conflicted and each was renumbered by hand (55 of the last 300 commits are "Merge main; renumber").
- Before opening or merging a PR: `git fetch origin && node tools/bump.js trial` lists the files that would conflict.
- If only `version.js`, `index.html` ?v= tags or `docs/progress.md` conflict: `git merge origin/main`, then `node tools/bump.js renumber` (takes main's lines, re-adds your one entry, bumps the tags) and `node tools/bump.js check`.
- Never rewrite history, force-push, or keep a branch open for days. Merge small, merge often. Close stale PRs rather than reviving them.
