# WaveFern security checklist

Read this before touching: multiplayer/friends/leaderboard/profile code, anything that renders text from another player, `firebase-rules/`, `88-admin.js`, the deploy workflow, or anything that adds a new Firebase read/write.
Threat model: WaveFern is a static page. **Everything in the browser is attacker-controlled** (JS, saves, `localStorage`, `FBU`, `isAdmin()`, messages from a host or bandmate). Only the Firebase rules, Firebase Auth and Firebase's own servers are trusted. Last audit: v55.30.5 (19 Nov 2026).

## 1. Rules (the real security boundary)
- [ ] Rules live in `firebase-rules/<version>/` (`firestore.rules`, `database.rules.json`). Change them there, bump the folder name to the game version, fix every path mention (`grep -rn "firebase-rules/"`).
- [ ] Every Firestore/RTDB write is limited to the writer's own uid, bounded in size and shape (`hasOnly`, length and number limits, regexes with no `<>"`), and `auth != null` alone is **not** enough: use `google()` (Firestore) or `auth.token.firebase.sign_in_provider === 'google.com'` (RTDB) so free anonymous accounts cannot be used for spam.
- [ ] Anything a player can create in bulk (usernames, rooms, profiles) needs a one-per-account rule or an accepted, documented limit. Usernames: created only in the same batch as `profiles/{me}.h` and only when the old name is released.
- [ ] Anything that grants a privilege (admin, Founder, DEV, gifts, usernames) is decided by the rules or by a fixed uid list, never by a field the player writes.
- [ ] Wildcard children in RTDB rules (`$other`) also match children you have not listed: list every legitimate key first, then `$other: false`. (The first v55.30.5 draft broke room creation this way; the emulator test caught it.)
- [ ] Run `tools/rules-test.js` in the emulators (command in the file header). All lines must pass. Add a test for every new rule.
- [ ] Publish the rules in the Firebase console (Firestore > Rules, Realtime Database > Rules). Rules in the repo do nothing until published; compare the console copy with the repo after each release.

## 2. Rendering other players' text (XSS)
- [ ] Every string from Firebase, PeerJS, a save code, a URL or a gift is untrusted: render with `textContent`, or `esc()` / `E()` before `innerHTML`.
- [ ] `esc()` does **not** escape `'`. Never put a remote string inside `onclick="f('${x}')"`. If an id must go there, check it with `idOk()` / `idc()` (`161-multiplayer.js`) or a strict regex first.
- [ ] Remote strings used as object keys (`MB[id]`, `BQ[bl]`) must not be `__proto__`, `constructor` or `prototype`: `cln()` replaces them; use `idOk()` for ids.
- [ ] Remote URLs: only `https://` hosts matched with a dot boundary, e.g. `^https:\/\/([a-z0-9-]+\.)+googleusercontent\.com\/` (a bare `[a-z0-9.-]*googleusercontent` also matches `evilgoogleusercontent.com`). Images from data URLs must start with `data:image/jpeg;base64,`.
- [ ] No `eval`, `new Function`, string `setTimeout`, `document.write` of remote data, `javascript:` links, or `target=_blank` without `rel=noopener` / `opener=null`.
- [ ] New script tags from other origins need `integrity` + `crossorigin` (see Three.js and PeerJS) and a pinned version.

## 3. Admin and privileged features
- [ ] `isAdmin()`, `fwIsDev()`, `S.cheat`, `FW_DEV` only show UI. A browser console can fake all of them. Anything that must be protected is protected by a rule that checks `request.auth.uid`.
- [ ] Admin uids appear in three places and must match: `88-admin.js` (`ADMIN_UIDS`), `newsletter/index.html` (`ADMINS`), `firestore.rules` (`admin()`). `248-dev-tag.js` has the DEV list.
- [ ] Peer messages cannot prove who someone is: the `ad` (admin) flag in band rooms is self-declared. It may only unlock cosmetic or moderation-exempt behaviour, never data, money or saves.
- [ ] The `/dev/` password gate is a convenience, not security (hash is public, scripts are public). The dev build must stay cut off from the cloud (`dev/dev-shim.js`).

## 4. Saves and client-side data
- [ ] Never trust a loaded save, `localStorage` value or `#fwmove=` import for anything that affects other players. Leaderboard and profile numbers are self-reported: rules only bound them. Tainted careers (`S.tainted`, `S.cheat`) must stay off the leaderboard.
- [ ] Do not remove old save decoders, but unsigned codes stay refused (`SEAL_LEGACY_UNTIL`). New string fields in `S` get `<`/`>` stripped on load (`scClean2`).

## 5. Secrets and config
- [ ] The Firebase web config (`apiKey`, `projectId`, `appId`, `databaseURL`) is public by design. Never commit a service account, admin SDK key, OAuth client secret, GitHub token or `.env`. Run `grep -rIn -E "AIza|BEGIN .*PRIVATE|ghp_|github_pat_|sk-" --exclude-dir=node_modules .` before merging: only the public web key may match.
- [ ] Firebase console (manual, check after changes): API key restricted to `wavefern.com`, `www.wavefern.com`, `wavefern.github.io`, `localhost`; Authorized domains list the same; Anonymous sign-in disabled once nothing needs it; App Check turned on (see "Open items" in the PR report); billing budget alert set.

## 6. Deploy and dependencies
- [ ] `.github/workflows/static.yml` keeps minimal `permissions`, no secrets, no `pull_request_target`, actions pinned to a major version, npm installs pinned to a version.
- [ ] Everything in the repo root is published. Do not add private notes, keys, exports or save files to the repo.
- [ ] CDN scripts: pinned version + SRI hash. The CSP (`index.html`) cannot be strict because the game uses inline handlers; keep `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
- [ ] GitHub Pages cannot send `X-Frame-Options` / `frame-ancestors`; putting the domain behind Cloudflare would allow it.

## 7. Before merging a change that touches any of the above
1. `node tools/check-globals.js` (0 problems), `node tools/mp-ids-test.js`, `node tools/seal-test.js`, `node tools/load-test.js`.
2. If rules changed: `tools/rules-test.js` in the emulators, then tell James to publish them.
3. Re-read this list for the files you touched, and add a line here for any new class of mistake.
