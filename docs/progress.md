# Progress

Newest first. One line per shipped change; details live in `version.js` (`VERSION_HISTORY`).

- v55.28.1 (2026-11-19): removed the blocked-domain fallback script from `index.html`.
- v55.30.3 (2026-11-19): security audit and hardening: band-room id sanitising (`161`), strict Google photo host (`213`, `216`, rules), Firebase rules v55.30.3 (Google-only rooms/RTDB, `database.rules.json` now in the repo), `docs/SECURITY_CHECKLIST.md`, `tools/rules-test.js`, `tools/mp-ids-test.js`.
- v55.28.0 (2026-11-19): surfing rework: waves face the beach, sweet-spot marker and pop-up meter, new water shader and spray, smooth surfer animations, new surfboard.
- v55.24.0 (2026-11-19): land around every destination city (`250-country-edges.js`): terrain per country to the horizon, coast, highways, farms, forests, landmarks; replaces the flat square ground.
- v55.21.8 (2026-11-18): fixed lag spikes from the chat swear filter (`dev/dev-profanity-v1.js` memoised, scrub only re-checks changed message text). 250 chats x 25 log lines: 500 ms scrub took 550 ms avg (735 max) before, 0.4 ms avg after; frames in 15-20 s headless 124 -> 1718.
- v55.20.1 (2026-11-18): bug fix pack for section 1 of James's list (idle offline, house-front fade, storage placing, real overnight streams, vinyl money in Earned, double click sound, sleep zoom, version tag, face-on-cover button, backup delete, wake-money console error). Not reproduced: Instagrime brand post crash (phone guard added), house framing gap.
- v55.19.1 (2026-11-18): money accessor guard (root cause of "$0 after sleep"), cents under $100 in `$$`, Mastery surf/fish texts, PC view 30 fps and Mastery panel 10 fps caps.
