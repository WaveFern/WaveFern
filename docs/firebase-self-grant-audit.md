# Can a player give themselves items? Firebase audit (v55.52.15)

Asked: update the Firebase rules so nobody can give themselves anything (inventory, borders, money, crates, rewards).

## Result: the Realtime Database rules already allow none of it, so they are unchanged
`firebase-rules/v55.30.18/database.rules.json` is default-deny at the root and only opens `f/*` (friends, usernames, invites, presence) and `r/*` (band rooms). No game progress is stored there: the game never writes inventory, borders, money, crates or rewards to the Realtime Database. `tools/rules-test.js` now asserts this (7 new "google can NOT write ..." lines; 97 of 97 pass in the emulators). Nothing needs publishing for this part, and I did not touch the live project.

## Where the "things" really live, and why rules cannot stop a self-grant there
- All progress (`S.inv`, `S.wr`, `S.cars`, `S.wraps`, `S.pbd` borders, money, advent doors `S.adv`) is the player's career save. It is held in the browser (localStorage) and backed up as one opaque string `saves/{uid}.code` in Firestore (`FW4-...`, a sealed save).
- Firestore rules let a player write only their own `saves/{uid}` and check only its shape (prefix, length, `day`, `artist`, `t`). They cannot look inside `code`, and the seal key ships in the page (`12-save-seal.js`), so a seal proves nothing.
- The game is a client-authoritative single-player game that also runs fully offline. A player can already edit their own localStorage save, and the crate roll runs in the browser. No rule change can stop that: a rule that rejects the save write would break every cloud save, and the local copy would still be editable.
- What rules already protect, because other people see it: Founder flags, admin tools, gifts (admin creates, player only marks claimed), usernames, profiles and leaderboard rows (numbers are bounded, tainted careers stay off the board). Those are enforced by `request.auth.uid`, not by anything the player writes.

## What a rules-only fix would break
Tightening `saves/{uid}` further is impossible without parsing the save (rules cannot). Locking it (`allow write: if false`) would stop cloud save/restore for every player. Nothing else is writable that grants items, so there is nothing else to lock.

## What real enforcement would need (not done here, needs James's decision)
1. Cloud Functions (needs the Blaze plan) in `europe-west1`: a callable `saveCloud` that validates a save before writing it (day only moves forward, money and fame within what the days played allow, item ids exist in the catalogue, `S.adv` claims match the calendar date) and rules that deny direct client writes to `saves/`. Cost: every save goes through a function; old clients must be updated at the same time; a determined cheater who edits the checks' inputs consistently is still hard to catch.
2. Server-side crate roll for the event: a callable `openCrate(day)` that rolls, writes the prize to `grants/{uid}` and refuses a second roll for the same door. The client only reads `grants/`. Safest to ship first, because it protects the one thing that is scarce and shared (Starlight tier drops) and leaves normal saves alone. Needs the same Blaze plan and about a day of work plus emulator tests.
3. Cheaper stopgap with no new infrastructure: keep treating saves as untrusted (already true), keep tainted/cheat careers off leaderboards and profiles, and never let a save field decide anything others see (already in `docs/SECURITY_CHECKLIST.md` section 4). Borders are cosmetic and only shown on your own picture, so a forged border affects nobody else.

Recommendation: ship as is now (no rules to publish), and decide on option 2 before the calendar goes live on 1 December if scarcity of the Starlight tier matters.
