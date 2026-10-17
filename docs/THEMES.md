# Theme sheet

Use this when you add or change UI in any app. It lists the colours, fonts and shared classes the game already uses, so new work matches. Values below were read from `style.css` and the app files named in each section.

## Rules

1. Start from the shared look in `style.css`. Only add a new look when the app is meant to look different (Messages, Amazoom, Instagrime, Threadz, FestivalApp and the Gear shop already do).
2. Scope app-specific CSS under the app's root class (`.msx`, `.az`, `.ig`, `.thz`, `.bw`, `.site`). Do not restyle bare `button`, `select` or `.card` from an app file.
3. A panel that appears inside another app must follow the host app. Messages is themed under `.msx` in `36-messages-look.js`.
4. Keep the Silkscreen font for headings and `ui-monospace` for body text in the default look. Apps with their own look name their font in their own section.
5. Bump `GAME_VERSION` and add a `VERSION_HISTORY` entry in `version.js` with every change (patch for fixes, minor for features).

## Shared base (`style.css`)

| Token / class | Value | Used for |
|---|---|---|
| `--bg` | `#0c0f0d` | page and window background |
| `--t` | `#e8f3ec` | main text |
| `--m` / `.m` | `#8aa094` | secondary text |
| `--g` | `#2fe68a` | accent: headings, `button.go`, bars, toasts |
| `--p` | `#161b18` | panel fill |
| Headings | Silkscreen, `ui-monospace` fallback | `h1`, `h2`, `h3`, `.px` |
| Body | `ui-monospace, Menlo, Consolas` 14px | everything else |
| `button` | `#26302a` fill, 2px `#000` border, inset bottom shadow | default button |
| `button:hover` | `#364439` | hover |
| `button.go` | `--g` fill, `#04120a` text, bold | primary action |
| `button:disabled` | opacity 0.4 | unavailable |
| `input`, `textarea` | `#0a0d0b` fill, 2px `#333` border | text fields |
| `.box`, `.hb` | `#0b0f0dd9` fill, 3px `#000` border, `4px 4px 0 #0008` shadow | HUD boxes, modals |
| `.win` | `#0c0f0d`, 3px `#000` border, `6px 6px 0 #0007` shadow | app windows |
| `.wt` | `#1b1f1d` | window title bar |
| `.sb` | `#000`, 160px wide | app sidebar (`.sb button.on` is `#1c221e`) |
| `.mn` | padding 18px, green gradient at the top | app content area |
| `.tb` | `#0b0d0f`, 42px tall, `#333` top border | taskbar |
| `.sm` | `#101412` | start menu |
| `.cards` / `.card` | `#151a17`, 6px radius, 12px padding | product and item tiles |
| `.ng` | flex row, 8px gap | input + button rows |
| `#toast div` | `#000d` fill, 2px `--g` border | toast messages |

Desktop: wallpaper `#pc` (default `#47b06f`), icons `.ico` (48px pixel art, drop shadow).

## Messages (`36-messages-look.js`)

Root: `.chat.msx`. Tokens live on `.chat.msx`:

- Sidebar `--mx-pl` `#1e1537`, selected row gradient pink-to-violet.
- Header `.msxb` gradient `#ff7a59 → #ff3d81 → #8a4dff`, white text.
- Chat background `--mx-cr` `#fff7f0` with a pink dot grid.
- Incoming bubble `.bb.a`: white, 18px radius, 4px bottom-left corner, ink text `--mx-ink` `#2a2140`.
- Outgoing bubble `.bb.me`: gradient `#ff6a88 → #8a4dff`, white text, 4px bottom-right corner.
- Input `.cin`: white bar, `#f7eefb` pill input, gradient `button.go`.
- Unread badge `.ub`: `#ff4f7b`.
- Chat list search `.msq` is a translucent pill on the plum sidebar. The "Suggested people" header `.sgh` is amber, with a dashed outline on each suggested row `.cr.sg` and a "Chat" pill `.sgb`, so it reads as a list of people to start a chat with and not as new messages.
- Chat header actions `.cva` (Pin, Clear chat) are `#f7eefb` pills, 32px tall. The clear confirmation `.msc` is a `#fff0e6` bar with a gradient primary button.
- Guide topic chips `.gtp` reuse `.chp`. The profile-picture dot `.cdot` shows only while a chat is unread.


- `.mloc` (meeting place picker) uses the same select look.
- Touch targets are at least 32px tall (chips 32px, buttons 36px, selects 34px). Hover lightens the fill, press scales to 97%, focus shows a pink outline.


## Spotifly (`37-spotifly.js`, desktop app id `1`)

- Logo: black tile with green `#1ed760` circle and three black bars (SVG `SFLOGO` in `11-os-v2.js`).
- Song row `.sr.sd` adds a 36px column for the delete action: a bin icon button `.bin` (muted `--m`, `--t` on hover, 32px touch target). Keep the bin on the row, not under it.
- Play buttons `.bpl` are the `#1db954` circle (on song rows and on draft rows `.ng .bpl`).
- Wallpaper: `#47b06f` with the wordmark.
- Artist sidebar `.sb`, heading `.sfh` (logo at 26px beside the text).
- Otherwise the shared base.

## Amazoom (`amz`)

- Page `.mn.p0`: white background, text `#0f1111`, Arial 14px.
- Header `.azh`: `#131921` with white text, sticky.
- Search `.azs`: white field, `#febd69` button.
- Buttons `.azbtn`: `#ffd814` pill, `#f7ca00` hover, grey when disabled.
- Product cards `.azc`: white, 1px `#e7e7e7` border, 6px radius. Price `.azp` 28px. Muted `.g` `#565959`.
- Badges `.bd`: `#232f3e`; `.bd.bs` `#c45500`.
- Furniture preview models (`79-amazoom-detail.js`, `AZX`): built from clean boxes in the item's own space, drawn at 128 px on the card. Keep parts at least 0.04 across so they stay readable, and do not stack coplanar slabs.
  - Fish tank (`aqu`): wood cabinet `#3a2a1c` with two doors and gold handles; grey `#8a8f99` frame posts and floor plate; blue `#1f6e9c` backdrop; sand `#e8cc8e`; animated fish, plants and bubbles added by `AZXFX.aqu`.
  - Wardrobe (`ward`) and upright piano (`pno`): solid bodies with inset door panels, gold handles, white and black keys and gold pedals.
  - Cat tree (`cattree`, pet catalogue in `22-v8-clothes-wardrobe-big-catalogues-pixel.js`): tan `#c9955f` and `#9c7140` rope-wrapped posts, platforms, a house with a doorway, a sisal scratching post, and a red toy hung on a string.

## Goober Eats (`eats`)

- Shared `.cards` / `.card` with pixel food art. Buttons are `button.go`.

## Instagrime (`ig`)

- Root `.ig`: black, `#333` 1px border, 6px radius, white text.
- Logo `.igl`: 22px Silkscreen, gradient `#f9a825 → #e91e63 → #7b1fa2` as text.
- Post parts: `.post` (bottom border `#262626`), `.ph` header, `.av` avatar `#444`, `.pbody` gradient body, `.acts` action row.
- Icons `.gi`: grayscale; `.gi.lk` is full colour when liked.
- Story ring `.ring`: the same gradient.

## Web browser (`web`) and sites

- Browser chrome `.bw`: white page, `#202124` text, grey tab `.bwt` `#dfe1e5`, dark bar `.bwb` `#202124`.
- Home: "Searchy" in Google colours, shortcut tiles `.bwtile`.
- Each site wraps its page in `.site.s_<code>` with header `.sh`, body `.sb2` and cards `.card`.

| Code | Site | Header / body colours |
|---|---|---|
| `pr` | Homefield (property) | `#0f4c5c` serif / `#f4f1ea` |
| `pt` | Pawspot (pets) | `#ffb347` / `#fff6e5`, rounded |
| `gd` | Shield Security (bodyguards) | `#101830` gold `#e6b422` / `#0a0f1e` |
| `mt` | Motorline (cars) | theme in `style.css` (`.site.s_mt`) |
| `cl` | (defined in `style.css`) | `#111` header with pink `#ff3d81` rule, `#faf7f2` body |
| `gr` | (defined in `style.css`) | `#2a2a35` header with cyan `#7fe3ff`, `#1b1c24` body |
| `st` | (defined in `style.css`) | `#f08a24` header, `#fff3e0` body |

Site buttons `button.go` take each site's accent.

## Threadz (`.thz`, clothes drops)

- Hero: `linear-gradient(120deg,#111,#3a1230)`, white text, 4px pink `#ff3d81` bottom border. Title 24px Silkscreen, subtitle `#ffb3d1`.
- Cards `.thc2`: white, 2px `#111` border, `4px 4px 0 #0006` shadow, text `#111`.
- Image panel `.thp`: `#f2eee6 → #ded6c4` gradient.
- Name `.thn`: bold uppercase. Badges `.thnew`: pink `#ff3d81`, white. Level `.thlv`: brown `#8a5a00`.
- Section caps `.thct`: 10px uppercase `#7a5cff`.
- Grid `.thg`: `minmax(190px,1fr)`.
- Preview box `.thz .m`: `#555`.

## Festival (`fest`, HUD `#fst`, `#fcr`, FestivalApp root `.fa`)

Look: a neon festival poster. Near-black plum `#100b1c` with soft magenta and lime glows in the corners.

- Font: Impact (fallback Haettenschweiler, Arial Narrow Bold), all caps, 0.6px tracking. Body notes in Arial Narrow, not caps.
- Title `.fa h1`: 36px, a magenta-to-amber-to-lime gradient fill. Section heads `.fa h3`: 19px lime `#c6ff3d` with a thin lime rule.
- Cards `.fa .card`: `#1d1435` with a 2px dashed magenta `#ff2e88` border (a ticket stub) and a lime outer ring.
- Buttons: magenta `#ff2e88` with dark `#100b1c` text. `button.go` is lime `#c6ff3d`. Disabled is `#3a2f55`.
- Errors `.fa-err`: magenta fill, dark text.
- Setlist bar `.fa-tot`: magenta-to-lime gradient. Rows `.fa-r` have dashed rules.
- Slots `.fa-c`: dashed borders. `.you` (your slot) is lime with a white border; `.free` is magenta.
- Booking grid `.fa-grid` with amber `.fa-t` headers (13px, 1px tracking).
- Progress bar in the HUD uses the shared `.bar`. Day counter `#fcr b` 28px white.

## Studio minigames (`#mg`)

- Centred hint text `.mgs`, with the highlight `b` in `--g`.

## Beats (`.sr`, `.tbar`)

- Play button `.bpl`: 24px circle, `#1db954` fill, black text. Active row `.sr.bon` tint `#1db95422`.
- Timeline `.tbar` uses `--g` for the moving bar.

## Gear shop (`.gshop`) and clothes picker

Look: a studio equipment rack. Charcoal panels with a faint scan-line texture, amber meters, monospace labels. Nothing here uses the Silkscreen headings.

- Root `.gshop`: `#15171b` with a 1px black border and 4px corners. Font: Courier New (fallback ui-monospace), not caps for body text.
- Rack header `.gshop-top`: dark steel gradient, 3px amber `#ffb000` bottom rule, "GEARHOUSE" in 22px amber with 5px tracking and a soft glow.
- Title `.gshop h1`: 16px, caps, light grey `#f1f3f6`.
- Section headers `.gsh`: 12px caps amber with a 4px amber left bar.
- Module cards `.gsc`: dark gradient `#24272e → #171a1f`, 1px `#3b4048` border, 3px radius and a bottom shadow, so each looks like a rack unit. Small text is 10px caps grey `#8d949e`.
- Quality pips `.gpip i.on`: amber `#ffb000` with a glow. Empty pips are black.
- Buttons: steel `#2b2f37` with a black border. `button.go` is amber `#ffb000` with dark text. Disabled is 45% opacity.
- Clothes picker `.wrs` keeps the shared look.
- Swatches `.asw` (24px, 2px black border, `--g` outline when selected).
- Wardrobe picker `.wrs`: `#1d2a24`; selected border `#ff3d81`.

## Swiftwing Flights (`sw`, root `.swa`, HUD `#swhud`, flight overlay `#apfly`)

- Airline look, not the dark studio look. Font: Trebuchet MS (fallback sans-serif).
- Tokens: sky blue `#eaf4ff` page, navy `#0b2a5b` header and text, coral `#ff6b4a` for the logo tail, "Buy" and highlights, white cards with 10px corners and a soft navy shadow.
- Tabs Book / My trips / Departures: pill buttons, the open one navy with white text.
- World map: canvas with pale land on blue sea, pins in the continent colours from `WT_CONT`; the selected pin is coral.
- Boarding passes: white card with a coral left stripe, big airport codes, gate, seat and a countdown.
- In-world screens (departure boards, gate screens) are black with yellow `#ffd84a` text and green / amber / red status.
- HUD strip `#swhud`: navy pill under the top bar with the next flight, gate and what to do next.

## Other HUD

- Car speed box `#spdbox`: dark gradient `#141c18 → #090c0b`, 16px radius, 1px `--g` 25% border, 12px text.
- Tutorial card `#tqt`: uses the `.box` look.
- Name tags `#ntags`: overlay with no pointer events.

## Adding a new app or panel

1. Pick the closest existing look from this sheet. Reuse the shared classes first.
2. Put app CSS in the app's own file inside a `{const st=document.createElement('style');...}` block, with selectors under the app's root class.
3. If the panel appears inside Messages, add its rules under `.msx` in `36-messages-look.js`.
4. Check the result at the game's desktop window width (about 940px) and at phone width (700px and below).
5. Update this sheet when you add a token, a class or an app look.
