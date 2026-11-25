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
| Feature | File | Gate | Ready? |
|---|---|---|---|
| News app (Fern Times) on laptop and phone | `257-news-app.js` | `HELD=true` + `FW_DEV` | yes |
| More post and News backgrounds (24 variants + 8 news scenes) | `259-photo-scenes.js`, `260-news-scenes.js` | `HELD=true` + `FW_DEV` | yes |
| Pets overhaul: own all, equip 3, names, P menu, roaming and sleeping at home, bodyguards wait outside home | `261-pets-v2.js` (needs the powerups of `dev/dev-pets.js` to go live with it) | `HELD=true` + `FW_DEV` | testing |
| Instagrime feed upgrade: endless scroll, better posts about you, career reactions (quiet spells, albums, split-opinion shoots, diss tracks), comments only from the comment button, double-tap pixel-heart like, hundreds of varied comments (car posts most, "liked the vid" ones after you like), dock Search instead of Photo post | `258-instagrime-more.js` | `HELD=true` + `FW_DEV` | yes |

## Avoiding merge pain
The old pain was never the numbers: every PR edited the same few lines (`GAME_VERSION`, the top history entry, the `?v=` tags), so any two open PRs conflicted and each was renumbered by hand (55 of the last 300 commits are "Merge main; renumber").
- Before opening or merging a PR: `git fetch origin && node tools/bump.js trial` lists the files that would conflict.
- If only `version.js`, `index.html` ?v= tags or `docs/progress.md` conflict: `git merge origin/main`, then `node tools/bump.js renumber` (takes main's lines, re-adds your one entry, bumps the tags) and `node tools/bump.js check`.
- Never rewrite history, force-push, or keep a branch open for days. Merge small, merge often. Close stale PRs rather than reviving them.
| Instagrime brand posts: original product names, new captions, 3D product ads on a plain backdrop | `262-brand-posts-v2.js` (+ `BRD.adHook` in `241`) | `HELD=true` + `FW_DEV` | yes |
