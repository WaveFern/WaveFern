# WaveFern architecture

Read this first. It tells you which files to open for a task so you do not have to read the whole codebase.
Keep it accurate: update it in the same commit as any structural change (new file, renamed file, changed load order, new global others depend on).

## 1. Overview

WaveFern is a static browser game (GitHub Pages; the repo has no build step, but the deploy workflow bundles and minifies the scripts into `fw-bundle.js`, see §4). Everything is **classic `<script>` files sharing one global scope**, loaded by `index.html` in the order the tags appear. There are no ES modules and no imports: a file uses a function or variable simply because an earlier file declared it.

- 237 game scripts in the repo root + 60 files in `dev/` = **297 local script tags** in `index.html` (checked by `tools/check-globals.js`). Every root script is loaded; there are no orphan scripts. Other `.js` files (`tools/`, `wiki/`, `trailer/` etc.) are not part of the game page.
- Three.js r128 (CDN, with a cdnjs fallback) renders the 3D world. The "computer", phone and menus are plain DOM (`style.css`, see `docs/THEMES.md`).
- Firebase (Auth, Firestore, Analytics) is optional: the game runs fully offline as a guest. Rules are in `firebase-rules/`.
- Version and changelog live in `version.js` (`GAME_VERSION`, `VERSION_HISTORY`). Bump both in the same commit as every change.

### The "patch layering" style (most important thing to understand)
The game grew version by version. The first files (`01`–`29`) define the core; **later files re-assign or wrap earlier functions** (for example `recMenu` from `05-game-flow.js` is wrapped by `165-song-menu.js`). Each file's top comment names the version and says which earlier file it patches. Consequences:

1. The **last file that defines/wraps a function wins**. To find the live behaviour, search for the name across the repo and read the newest file, not the first.
2. Moving or renaming a file or reordering tags can silently change which version of a function is live. Do not reorder without checking.
3. A top-level `let/const/class` name declared twice makes the browser skip the whole later file. Run `node tools/check-globals.js` after any edit (CLASH check).

### Startup sequence
1. `index.html` inline scripts: update lockout, loading-screen messages.
2. `00-*.js` (dev clock, old-address save mover, startup guard, tab audio fade, pixel icons), then Three.js, `assets.js` (music/wallpaper URLs), `version.js`.
3. the numbered game files (`01`…`215`) in tag order (see §4 for the real order; it is not purely numeric).
4. `27-boot.js` runs mid-list: builds the world in separately try/caught steps (`buildHouse`, `buildWorld`, `buildBigWorld`, `buildCity` ...), starts `loop`, and after two animation frames calls `restoreSave()` then `titleOpen()` (main menu). Files that load after it (`210`–`218`, `216`, `217`, the `dev/` block) are still parsed before those frames, so they can patch what boot built. The loading screen waits for the menu, Firebase auth and the stadium menu scene (15 s max).
5. Game loop is `loop` in `07-input-loop.js` (patched later by many files).

## 2. System directory

Numbers are file prefixes (`NN-*.js`). "Newest wins" files are listed last in each row.

| System | Files | What lives there |
|---|---|---|
| **Core infrastructure** | `00-guard`, `01-start`, `02-data` (state `S`, tuning), `05-game-flow` (`mode`, `recMenu`), `07-input-loop` (input + `loop`), `27-boot`, `94-update-check`, `169-popups`, `176-game-feel`, `116-perf`, `122-graphics`, `85-pc-safety` | Global state, main loop, boot, error guard, popup stack, graphics presets |
| **Auth & accounts** | `86-google-signin`, `208-onboarding` (username/display name), `213-public-profile`, `88-admin`, `124`/`127`/`162` (admin tools), `207-dev-panel` | Google sign-in, `isAdmin()`, usernames, public profile |
| **Saving & player data** | `12-save-seal`, `12-save-load`, `12-save-vault`, `12-reset`, `00-moved-saves`, `86-vault-cloud`, `209-founder-cloud`, `206-founder` | Save codes, slots, vault backups, fresh-start reset, cloud copy (see §5) |
| **Character & look** | `03-character`, `64-hat-hair`, `134-hair-3d`, `171-wardrobe-fit`, `114-real-looks`, `129-followers-sprint` | `buildChar`, hair, faces |
| **Clothes shop (Threadz)** | `22a-v8-wardrobe-catalogues` (clothes, furniture/food/property catalogues, Instagrime posts), `22c-v8-clothes-colours`, `50`, `51`, `60`, `61`, `62`, `193-clothes-plus`, `215-city-brand-stores` | Clothing data `GAR`, previews, prints |
| **Song creation** | `13-shops-v3-recording-game`, `34-studio-minigames`, `130-song-session`, `165-song-menu`, `187-upgrades`, `220-minigames` (song activities: runs the original Beat/Lyrics/Mix plus Echo, Build It, unlocked by Studio Level), `166-genre-focus`, `96-album-song-picker`, `112`/`113` (covers), `199-instrument-samples`, `217-name-upload-ui`, `221-release-page` (puts back the plain original Upload page) | Beat/Lyrics/Mix minigames, album picker, release flow, covers |
| **Studio & equipment** | `52-gear-shop-plus`, `53-studio-gear-detail`, `197-gear-levels`, `219-gear-tiers` (six shop categories, `GT` Studio Level 1-6 worked out from `S.gear`, replaces `PG.shop`), `04-house`, `17-fixes`, `25-v21` | Gear lines and levels, studio room models |
| **Career progression** | `14-world-fame-cars-pets-collabs`, `16-big-world-fame-chat-instagrime-v2` (fame levels `FT`), `136-fame-350`, `133-quests`, `173-career-boost`, `174-career-depth`, `177-early-game`, `100-stats`, `110-awards`, `203-dm-peers`, `204-world-offers` | Fame, quests, awards, milestones |
| **Brand deals & photoshoots** | `223-brand-deals` (brands, canvas logos, offers, company flights, Messages buttons, the whole Label HQ app UI; since v51.9.0 a monochrome website: top bar Brand Deals (overview + brand directory, each brand has its own page) | Active Deals | Past Deals, and Labels | Team on the right; a signed label only tints the Labels/Team buttons; Helvetica LT Pro (Adobe Fonts kit ngq0vsd) + Norman variable headings, both from Adobe Fonts (full-width layout), loaded on first open; global `BRD`, state `S.brands`), `dev/dev-brandtest-v1.js` (dev only, test mode `S.cheat`: calls `BRD.mk` each morning and every 30 s when no offer is open; `BRD.mk` is exported by `223`), `236-signature-pixel` (pixel-art items, overlay theme and pen for `signGame`, and the game-style signature setup page), `235-my-signature` (`S.sig`, first-visit signature setup in Label HQ, `SIGNME.sim` match score, pays every `signGame` session), `234-street-autograph` (street fan autographs open `signGame`, wraps `sign(n)`), `231-label-press` (Vinyl & CD tab of Label HQ, `BRD.press()`: pressing runs `S.press`, cost/demand model `BRD.pressModel`, daily sales via a `wakeUp` wrapper; the tab itself is added in `223`), `224-brand-studio` (HQ banner picture, no longer shown in Label HQ, photo set, photoshoot UI `BRD.begin`, Instagrime post, fame recognition abroad), `225-brand-hq` (wraps `D.landmark`: while a deal is active its city's landmark block becomes the brand's walkable HQ, 14 designs; a `D.cityHooks` hook builds the studio room `'brand'` with per-brand backdrops and props; company-car prompt), `82-label-hq`/`106-label-hq-soon` (team upgrades, shown in the Team tab of Label HQ, themed by the signed label) | Uses the 3D photo renderer of `178-instagrime-photos`, `TRAVEL` tickets, and `DCITY` (landmark block, `mkRoom`, interactions) |
| **Economy & shop** | `02-data` (tuning knobs), `10-apps-shop-furniture`, `101-economy-labels` (`UPX`), `82-label-hq`, `83-promotions`, `210-economy-rebalance`, `226-summary-streams` (morning summary Streams card scaled to the listener change, display only), `211-hook`, `212-endgame`, `185-instagrime-buzz`, `63-car-speed` | Income, listener pacing, promos, prices |
| **Inventory, homes & furniture** | `15-homes-shop-interiors`, `79`/`182`/`191` (Amazoom), `95-property-no-starter`, `99-starter-furniture`, `104-furniture-storage`, `158-placement-overhaul`, `123-property-polish`, `26-v24-upstairs-redesign` | Properties, Storage, placing furniture |
| **Cars** | `14`, `39-car-models`, `63-car-speed`, `218-parked-cars`, `230-parking-lots` (12 small flat car parks plus the big City Car Park and two Festival car parks, found on the live `ROADS` list at start, with decoration cars in about a third of the bays; global `PARKLOTS`; wraps `exitDrive` to snap the car into the nearest free bay, blue P on the world map) | Models, speed, parking |
| **World (home city)** | `16-big-world...`, `18`, `31-wide-roads`, `32-map-zoom`, `38-city-detail`, `40-city-fixes`, `41-fountains`, `42-central-park`, `54`, `55-interiors`, `57a`-`57e` (tower floors: kit, Skyline, Pulse, Aurora, Nova), `81-billboards`, `90-barbershop`, `91`/`93`/`180`/`181` (shops), `97-weather`, `131-street-flow`, `194`/`195` (pop-up events), `196-never-stuck` | Roads, buildings, interiors, NPC pedestrians |
| **Travel & world tour** | `135-destinations`, `137-travel` (`TRAVEL`), `138-flights`, `139-airport`, `145-world-map-data`, `146-world-tour`, `150-tour-cities`, `151-tour-shows`, `152-tour-city-life`, `160`, `179`, `192` | Destinations (`WT_*`), airline, abroad cities, stadium shows |
| **Festival & stage** | `70a-festival-core` (schedule, stages, ground), `70b-festival-crowds` (board, crowds, interactions), `70c-festival-set` (performing a set, frame loop, maps), `71-festival-booking`, `188-stage-walk`, `233-festival-backstage` (backstage walkway, gate and steward escort at each stage, autographs after sets and tour shows; `festSumUI` in `70c` draws the set summary), `232-signature-game` (reusable signature minigame: global `signGame({items,...})` and `SIGN`, see its header) | Weekly Park Fields Festival, crowd, stage |
| **Messaging & NPC social** | `20-wider-understanding`, `30-npc-chat` (intent parser), `33-haggle`, `36`, `76`, `75`, `78`, `102-messaging`, `128-dm-variety`, `222-collab-pool` (~67 more ART artists, extra message lines, dmDaily wrapper: >=1 new DM per 3 days), `159-messages-mobile`, `228-chat-delays` (wraps `sendMsg`, `inst`, `bdGetHQ`, `pcR`: "typing..." hold of contact replies in `S.typ`, App Barn and Label HQ link download bars in `S.dl`, both saved and finished by a 200 ms tick, which waits while paused); `229-pause-freeze` (last script: pausing freezes pending short `setTimeout`s, shifts saved real-time deadlines forward on resume, pauses CSS animations, exposes `FWP`; `161` exposes `fwMpRuns`); apps: `103`/`178`/`185`/`189`/`227-instagrime-studio` (Instagrime; `227` = New post studio `igcOpen`, per-scene backdrops/poses/camera, redefines `igxPhoto`), `37`/`98`/`111`/`157`/`186`/`217-spotifly-hq-pfp` (the "WaveFern" music app; old name Spotifly in code) | Chat engine, collabs, social apps |
| **Artist roster** | `21-v7`, `29-v26`, `77`, `80`, `125`, `126`, `153`, `209-carlos`, `209-alfonso`, `120`, `184-parody-names` | `ART` roster: **append only**, saves refer to artists by index |
| **Phone & computer UI** | `06-computer`, `11-os-v2`, `115`/`116-gphone-plus`/`118` (Gphone), `105`, `119`, `155`, `198-game-ui`, `172-settings-plus`, `09-settings-effects`, `00-pixel-icons`, `style.css` | Desktop, apps, pause menu, settings |
| **Audio** | `08-music`, `67-beats` (procedural beat engine; one closure, read whole by `tools/music-test.js` and `tools/mix-*.js`, so do not split), `73-ambience`, `107-my-songs-music`, `132-808-hats`, `200-sfx-polish`, `00-tab-fade`, `156` | Music, sfx, ambience |
| **Graphics & rendering** | `04-house`, `23`/`24` (previews), `56-name-tags`, `84-pixel-pictures`, `190-pfp-styles`, `122-graphics`, `116-perf` | Meshes, canvas textures, profile pictures |
| **Multiplayer & leaderboards** | `161-multiplayer` (band rooms, PeerJS, leaderboard), `216-friends-hub` | Band rooms, friends, presence | Leaderboard row/profile writes are blocked for tainted careers (`S.tainted`, `window.fwTainted`, `dev/dev-leaderboard-v1.js`); `fdClearLeaderboardRow` is in `209-founder-cloud.js`.
| **Input** | `07-input-loop`, `154-touch-controls`, `168-gamepad`, `155`/`158z` (responsive) | Keyboard, touch, controller |
| **Trailers** | `175-trailer`, `183-band-trailer`, `201`, `202` | `?trailer` modes, recording |
| **Tutorial** | `72-tutorial` (Big Vee), `78-big-vee-smarter`, `214-guide-markers`, `205-announcement` | Tips, guide line, announcements |
| **`dev/` scripts** | 60 `dev/dev-*.js` loaded at the very end of `index.html` | Features promoted from the dev build; many are numbered `-v1`/`-v2` patches. Some (`dev-music-v1.js`, 100 KB) are full forks of an earlier file. Check them when looking for the live behaviour of anything in `dev-*` areas |

Separate pages that are **not** the game: `wiki/`, `trailer/`, `mtrailer/`, `vtrailer/`, `about/`, `legal/`, `privacy/`, `terms/`, `dev/index.html` (password-protected preview that rewrites the script list).

### Split files
When a big top-level file is split, the pieces take consecutive tag positions (same order, same code), so behaviour is identical. Comments in other files that mention `22-v8...js` mean the `22a`–`22f` group; `57-tower-floors.js` means `57a`–`57e`; `70-festival.js` means `70a`–`70c` (all split in v50.0.1, tag order = old order). `67-beats.js` is one closure and is read as a whole by `tools/`, so it stays one file. Files wrapped in one closure (for example `161-multiplayer.js`, `150-tour-cities.js`, `139-airport.js`) share closure-local state and **cannot** be split mechanically; they need a deliberate refactor.

## 3. Shared globals that many files depend on

Do not rename these; hundreds of references exist. Search before changing.

- `S` (`02-data.js`): the whole player state (money, songs, followers, gear, day, ...). Saved as one object. Other saved globals: `ch` (character), `PL` (placed furniture), `VOL`, `FX`.
- `THREE`, `scene`, `camera`, `P` (player) and `mode` (current screen/state string) drive the world and loop.
- `ART`: artist roster (append only). `GAR`: clothes catalogue. `PROPS`: properties. `FT`: fame thresholds.
- `TRAVEL` (`137`), `WT_*` destination tables (`135`), `UPX` (`101`), `MSGU` (`102`), `TT` (title screen state).
- Helper functions: `isAdmin()` (`88`), `pxIcon` (`00-pixel-icons`), `fwSoftErr` (`00-guard`), `popup/toast` (`169`), `FW_CLOCK.now()` (`00-dev`, use instead of `Date.now()` for anything tied to the fresh start).
- `localStorage` keys: `fw_save_1/2` (careers, `fw_u_{uid}_save_N` when signed in), `fw_slot`, `fw_set`, `fw_gfx`, `fw_vault`, `fw_bak_N` (recovered backups), `fw_fbproj`.

## 4. Load order rules that must not be broken

The real order is the order of tags in `index.html`, not file numbers. Known non-numeric spots:

- `00-*` first, then Three.js, `assets.js`, `version.js` (everything reads `GAME_VERSION`).
- `12-save-seal` → `12-save-load` → `12-save-vault` → `12-reset`, all right after `11-os-v2`. `86-vault-cloud` must follow `86-google-signin`.
- `50`, `51`, `52`, `53`, `60`, `61`, `62` load *between* `37` and `64`, and `67-beats`, `57a`-`57e` (tower floors; keep in that order) between `71` and `58-pets`: they append to `GAR` / gear after the base data of `22-v8` and must stay after their parents.
- `27-boot.js` is **not last**; `210`–`212`, `216`, `217-name-upload-ui`, `218-parked-cars` and all `dev/` scripts load after it.
- `208-onboarding` → `213-public-profile` → `209-founder-cloud` / `209-carlos` / `209-alfonso`; `158z-responsive` after `215`; `dev-menu-sync-v1` before `216-friends-hub`.
- Cache-busting `?v=` query strings in `index.html` are per file; bump the one for a file you change (and `GAME_VERSION`), or players keep the old file.
- The dev bundle builder (`tools/build-dev-bundle.js`) and `dev/index.html` read the script list from `index.html`, so adding a tag there is all that is needed, but **renaming or moving a file needs those and `tools/*` checked**.
- **Production bundle**: `.github/workflows/static.yml` runs `tools/build-prod-bundle.js` on the deployed copy only. It joins every local script after the 3D library into `fw-bundle.js` (run in the same order, each as its own classic script) and rewrites that copy's `index.html`; the original page is kept as `index-src.html`. An inline fallback writes the normal tags (from the first script the bundle had not run) if the bundle is missing or stops. Nothing is committed from this step, so edit scripts and tags as usual. `index.html` also has `modulepreload` links for the three Firebase files (keep the version equal to `FB_V` in `86-google-signin.js`).
- No dynamic script loading of game files exists. The only runtime script injection is `161-multiplayer.js` (loads PeerJS from a list of CDNs) and `dev/index.html` (re-serves the tag list). Keep both working.

## 5. Data and saving

- State is one JSON object: `{S, ch, PL, VOL, FX}` packed by `saveCode()` in `12-save-load.js`. Formats: `FW1-` base64, `FW2-`/`FW3-` LZW-packed (3 is chat-safe), `FW4-` sealed (encrypted + tamper-evident, `12-save-seal.js`). Old formats still load, so never remove a decoder.
- Two career slots (`fw_save_1`, `fw_save_2`; `fw_slot` is the active one), autosaved to `localStorage`. `loadCode` is tolerant: missing fields fall back to defaults taken from the snapshot `S0` (`snapS`), and a code that fails to load is kept as `fw_bak_N`.
- `12-save-vault.js` keeps a rolling vault copy (`fw_vault`), and handles export/import and Firebase project moves.
- Cloud saves (`86-google-signin.js`, `86-vault-cloud.js`): when signed in, careers live under `fw_u_{uid}_save_N` and Firestore holds a second copy; on sign-in the **cloud save wins** over a guest career, and a cloud load never overwrites a career with an empty or unreadable one. Signing out keeps the cloud copy and the device careers.
- `12-reset.js` holds the scheduled fresh start (`RS`) with Founder rewards (`206`, `209-founder-cloud`).
- Adding a saved field: add a default in `S` (`02-data.js`) so old saves load, never rely on it existing, and bump nothing in the codec.

## 6. Development guidance

**Where to look**
- Money/price balance → `02-data.js` tuning block, `101-economy-labels.js` (`UPX`), `210-economy-rebalance.js`.
- Making a song → `34`, `130`, `165`, `187`, `13`. New song UI step → `165-song-menu.js`.
- A shop's stock → the catalogue file for it (`22a`/`22c`/`50`/`61` clothes, `52`/`197` gear, `79`/`182` furniture).
- Artist chat behaviour → `30-npc-chat.js` (parser), `102-messaging.js`, `33-haggle.js`.
- A bug in a named function → `grep -n "function name\|name=" *.js dev/*.js`, read the **last** match in tag order.
- Abroad cities → `150`/`151`/`152`/`179`/`192`; home city → `16`/`38`/`42`/`55`/`91`/`93`.
- UI colours/classes → `docs/THEMES.md` and `style.css` before touching any app UI.

**Most interconnected files** (change with care): `02-data.js` (`S`), `05-game-flow.js`, `07-input-loop.js`, `16-big-world-fame-chat-instagrime-v2.js`, `22a`–`22f` (the old single `22-v8` file, split by topic: `22b` post pictures/figures, `22d` album covers, `22e` towers, `22f` home annex/pets/property), `29-v26.js`, `12-save-load.js`, `161-multiplayer.js`.

**Adding a feature safely**
1. Prefer a new small `NNN-name.js` over editing a giant file; use the next free number, put its tag where its dependencies are already loaded (usually before `27-boot` unless it patches boot output), and give it a version + purpose header comment.
2. Wrap/patch an existing function by saving the old one (`const _old=fn; fn=function(...a){...;return _old.apply(this,a)}`), as existing files do.
3. Keep new state inside a single global object (like `TRAVEL`, `UPX`) rather than many loose globals, and persist it under `S`.
4. Register the tag in `index.html` with `?v=` and bump `GAME_VERSION` and `VERSION_HISTORY`.
5. Update the system table above if a new system or file appears.

**Testing** (no framework; tools in `tools/`)
- `node tools/check-globals.js` (needs `acorn`, `eslint-scope`): duplicate declarations, early reads, syntax newer than ES2020. Baseline: **0 problems**. The 18 old UNDEFINED reports were investigated (v50.0.1) and are listed with reasons in the `KNOWN` table at the top of `tools/check-globals.js` (`--known` prints them): almost all are names private to a closure (`MPS`, `frStart`, `needLogin` in `161`; `fade`, `AP` in `139`; `inCity` in `150`; `toast` in `169`; `countUp` in `176`) read from another file behind a `typeof`/`try` guard, so that branch never runs. Any new report is a regression; fix it, do not add it to `KNOWN`. To make one of those branches work, expose the name from its closure on purpose (and check the behaviour change first).
- `node tools/seal-test.js`: save codec and tamper checks.
- `node tools/music-test.js`: beat engine variety checks.
- `node tools/load-test.js [url]`: headless boot, new career, open phone apps, save; prints page errors. Serve with `python3 -m http.server 8099`.
- `node tools/wiki-data.js` refreshes `wiki/data.js` from the live game (also runs in deploy).
- Manual: new career, make and release a song, save, reload and load the save, sign-in and cloud save if touched.
