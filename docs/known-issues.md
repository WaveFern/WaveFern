# Known issues

- Money: if cash still drops unexpectedly, read `localStorage.fw_mlog` (or `FW_MONEY.log` in the console). Each entry has the old and new value, the mode and the call stack of the write.
- Golf (`dev/dev-golf-v1.js`) reads the swing from mouse events only; touch devices need the touch layer for activities.
- `tools/load-test.js` only boots, walks and opens phone apps; it does not enter surf, skate, fishing, golf or Mastery.
- Instagrime brand ad post crash and the house-framing gap (2-extra-room doorway) could not be reproduced headless in v55.20.1; `phR` now falls back to the feed on a throw (console: `phone app failed`). A wake that lowers cash logs `WAKE MONEY BUG` with the writes and stacks in the console.
- Security (v55.30.2): in P2P band rooms the `ad` (admin) and `uid` fields are self-declared, so a modified client can fake the admin badge (cosmetic fx, kick exemption) and the one-account-per-room check. Needs signed identity from a server to fix. Leaderboard numbers are self-reported (rules only bound them). `#fwmove=` on wavefern.com can plant `fw_`/`wk_` localStorage keys that are missing (saves still have to pass the seal).
- Security (v55.30.2): a Google account can still create many band-room entries (Firestore `rooms`, RTDB `r/CODE`), which clutters the admin room list and can block a specific room code. Rules cannot count documents; fix would need a server (Cloud Function) or App Check. Turn on App Check and a billing budget alert in the Firebase console.
- Security (v55.30.2): profile top-songs entries are now length-bounded in the rules (a profile could carry a ~1 MB entry that every viewer downloads). Admin 'Load players' downloads up to 100 full saves (each up to 1.5 MB); many junk accounts could make it slow.
