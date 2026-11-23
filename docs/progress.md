# Progress

Newest first. One line per shipped change; details live in `version.js` (`VERSION_HISTORY`).

- v55.52.1 (2026-11-23): release scheme: quiet patches all week, one major drop on release day (docs/releases.md); `tools/bump.js` (patch, drop, check, trial, renumber) replaces hand-edited version lines.
- v55.49.0 (2026-11-23): desktop wallpapers: 22 more built-ins (CSS only), scrollable picker, "Add your own picture" (reuses `pxPick`/`pxEnc` from `84-pixel-pictures.js`, 128x72 16-colour, `S.wpc` ~6 KB, slot 100).
- v55.40.0 (2026-11-22): key hints: `255-key-hints.js` (paced one-at-a-time chips for Shift/N/G/Tab/F, H Controls card + pause button, `S.kh`, `FW_KEYS`).
- v55.39.0 (2026-11-22): removed Fern Rush (runner) from the arcade at James's request; menu shows Fern Flap and Fern Quest.
- v55.37.0 (2026-11-22): day-1 retention: `254-first-session.js` (Next Goal chip, early bed + instant first listeners after the first release, early milestones, Welcome-back summary, funnel `FW_FUNNEL`), Big Vee five numbered steps, streak pays in full.
- v55.35.0 (2026-11-22): arcade: enemy-floor collision fix (`ecol` zeroed vy mid-loop), hero run cycle, 3D voxel runner/guard/dog and hit effects in Fern Rush, static menu snapshots (`snap()`).
- v55.34.0 (2026-11-22): arcade redraw: 400x224, parallax, particles; platformer is now the original Fern Quest; Fern Rush is pseudo-3D behind the runner; new neon arcade menu.
- v55.33.0 (2026-11-22): arcade (`252-arcade.js`: Fern Flap, Fern Bros 4 courses, Fern Rush, 2D pixel, opened from the arcade cabinet, gaming PC and tour-city arcades) and one shared furniture interaction system (`253-furniture-interact.js`, ~45 item types).
- v55.31.0 (2026-11-20): freeze fix: save pack + seal (100-250 ms on a big save) moved to `12-save-worker.js` (autosave timer, pause and cloud sync via `saveCodeAsync`), `saveCode` memoised on unchanged JSON; `scPack`/`SC_A`/`SC_C` moved into `12-save-seal.js`.
- v55.30.18 (2026-11-20): outside-audit fixes: Founder auto-backfill of other players removed (`209`: `fdBackfill(true,[uids])` is manual), RTDB room rules narrowed (host cannot write guest `u/` slots, `i` closed), rules now `firebase-rules/v55.30.18/`, 11 new rules tests.
- v55.30.15 (2026-11-19): airport terminal and brand HQ rooms no longer draw their own blob contact shadows (`139`, `239`); they use the game's normal sun shadows from `dev/dev-graphics-v12.js`.
- v55.28.1 (2026-11-19): removed the blocked-domain fallback script from `index.html`.
- v55.30.5 (2026-11-19): security audit and hardening: band-room id sanitising (`161`), strict Google photo host (`213`, `216`, rules), Firebase rules v55.30.5 (Google-only rooms/RTDB, `database.rules.json` now in the repo), `docs/SECURITY_CHECKLIST.md`, `tools/rules-test.js`, `tools/mp-ids-test.js`.
- v55.28.0 (2026-11-19): surfing rework: waves face the beach, sweet-spot marker and pop-up meter, new water shader and spray, smooth surfer animations, new surfboard.
- v55.24.0 (2026-11-19): land around every destination city (`250-country-edges.js`): terrain per country to the horizon, coast, highways, farms, forests, landmarks; replaces the flat square ground.
- v55.21.8 (2026-11-18): fixed lag spikes from the chat swear filter (`dev/dev-profanity-v1.js` memoised, scrub only re-checks changed message text). 250 chats x 25 log lines: 500 ms scrub took 550 ms avg (735 max) before, 0.4 ms avg after; frames in 15-20 s headless 124 -> 1718.
- v55.20.1 (2026-11-18): bug fix pack for section 1 of James's list (idle offline, house-front fade, storage placing, real overnight streams, vinyl money in Earned, double click sound, sleep zoom, version tag, face-on-cover button, backup delete, wake-money console error). Not reproduced: Instagrime brand post crash (phone guard added), house framing gap.
- v55.19.1 (2026-11-18): money accessor guard (root cause of "$0 after sleep"), cents under $100 in `$$`, Mastery surf/fish texts, PC view 30 fps and Mastery panel 10 fps caps.
- v55.52.0: Big Vee portrait and name on the Next Goal box and key hint chips (his 5 numbered tutorial steps in 72-tutorial.js were never removed).
