# Known issues

- Money: if cash still drops unexpectedly, read `localStorage.fw_mlog` (or `FW_MONEY.log` in the console). Each entry has the old and new value, the mode and the call stack of the write.
- Golf (`dev/dev-golf-v1.js`) reads the swing from mouse events only; touch devices need the touch layer for activities.
- `tools/load-test.js` only boots, walks and opens phone apps; it does not enter surf, skate, fishing, golf or Mastery.
- Instagrime brand ad post crash and the house-framing gap (2-extra-room doorway) could not be reproduced headless in v55.20.1; `phR` now falls back to the feed on a throw (console: `phone app failed`). A wake that lowers cash logs `WAKE MONEY BUG` with the writes and stacks in the console.
