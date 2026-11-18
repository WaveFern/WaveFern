# Decisions

- 2026-11-18: `S.money` is guarded at the property level (accessor in `247-money-guard.js`) instead of hunting every `S.money+=x`. Two places zero a non-finite cash value (29-v26 new-day code, `scCheck` in 12-save-seal), so any NaN write during the day became "$0 after sleep". Refusing non-finite writes fixes every source at once and logs the culprit's stack in `fw_mlog`.
- 2026-11-18: `$$` shows cents below $100 (only when there are cents); bigger amounts keep the short K/M/B form.
- 2026-11-18: Battery: the main loop caps to 30 fps in mode `'pc'` (still desk scene behind the monitor) and 10 fps while the full-screen Mastery panel is open (it has its own renderer). dt is clamped to 0.05 s, so caps must stay at 20 fps or more wherever game time runs.
