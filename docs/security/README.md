# WaveFern security notes (v49.71.0)

A browser game runs on the player's machine, so nothing here makes cheating impossible. The aim is to stop casual and mass cheating, stop attacks on other players, and keep the shared Firebase data tidy.

## What changed in the game (live as soon as this is deployed)
- **Sealed saves (FW4-).** Save codes and the careers stored in the browser are encrypted and authenticated (SHA-256 keystream plus HMAC-SHA-256 tag, `12-save-seal.js`). An edited, cut, damaged or invented code is refused ("This save was edited or damaged"). Same length as the old code, same chat-safe characters.
- **Old saves upgrade themselves.** Unsigned FW1-/FW2-/FW3- codes load, are checked, and are re-saved as FW4- straight away. They stop loading on `SEAL_LEGACY_UNTIL` (1 March 2027, in `12-save-seal.js`); change that date to close the door sooner or later.
- **Sanity checks on load.** Impossible numbers (negative or huge followers/streams, money far beyond lifetime earnings, absurd list sizes) are repaired, not rejected. A career edited in the console is flagged when it saves and repaired when it loads. The admin account is exempt.
- **Shared codes can't carry markup.** `<` and `>` are replaced in every text in a loaded save, and `__proto__` keys are removed.
- **Band rooms.** Numbers from other players or hosts (quality, score, day, clock, counts) are clamped; link ids are checked before they go into buttons; each link is limited to 60 messages a second.
- **Script integrity.** three.js and PeerJS load with Subresource Integrity hashes (three.js falls back to the old CDN copy if the hash ever fails).
- **Content-Security-Policy** (meta tag; GitHub Pages cannot send headers): blocks plugins, `<base>` hijacking, form hijacking and scripts from hosts that are not listed. Inline scripts are still allowed because the game uses inline handlers everywhere, so this limits damage but is not a complete XSS barrier.

## Needs James (Firebase / Google console, not done)
1. **Publish `docs/security/firestore.rules.proposed` and `docs/security/database.rules.proposed.json`** (Firestore > Rules, Realtime Database > Rules). They work with the game as it is today. They add: cloud saves must start with FW4-/FW3- and be dated within 2 days of the server clock, day <= 100000; text other players see cannot contain `< > "`; friend presence time must be the server time; unknown children under `f/` are refused. Remove `FW3-` from the Firestore rule after `SEAL_LEGACY_UNTIL`.
2. **Restrict the Firebase web API key** (Google Cloud console > APIs & Services > Credentials) to HTTP referrers `wavefern.com/*`, `www.wavefern.com/*`, `wavefern.github.io/*`. The key in the code is meant to be public, but restricting it stops reuse elsewhere.
3. **Turn on App Check** (reCAPTCHA) for Firestore and Realtime Database, in monitor mode first. This is the main protection against scripts that call the database without the real game. It also needs a small client change (needs the site key).
4. Authentication settings: keep authorised domains to wavefern.com and wavefern.github.io. Anonymous sign-in is only used for the admin room list.

## What remains possible
- Anyone who reads `12-save-seal.js` can rebuild the key and forge a valid code, or edit the game in DevTools and play with changed numbers. The checks catch blunt edits, not careful ones.
- Money, fame and streams are computed on the player's device and the cloud save is an opaque blob the server can't check. There is no leaderboard, so there is nothing to rank-cheat; if one is added, compute it server-side.
- Rolling back to an older valid code can't be detected without a server.
- Band rooms are peer to peer; a modified client can still send odd-but-in-range values to its bandmates. The host is trusted.
- A Cloud Function that verifies the seal before accepting a cloud save would close that path further; it needs the Blaze plan.
