# Theme sheet

Use this when you add or change UI in any app. It lists the colours, fonts and shared classes the game already uses, so new work matches. Values below were read from `style.css` and the app files named in each section.

## Rules

1. Start from the shared look in `style.css`. Only add a new look when the app is meant to look different (Messages, Amazoom, Instagrime and Threadz already do).
2. Scope app-specific CSS under the app's root class (`.msx`, `.az`, `.ig`, `.thz`, `.ca`, `.bw`, `.site`). Do not restyle bare `button`, `select` or `.card` from an app file.
3. A panel that appears inside another app must follow the host app. The set-a-date panel (`.sch`) lives inside Messages, so it is themed under `.msx` in `36-messages-look.js`.
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

## Messages (`36-messages-look.js`, `75-collab-schedule.js`)

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

Set-a-date panel (`.sch` and its parts, styled under `.msx`):

- `.sch` white panel, ink text. `.schh` title is bold, the money line is muted `#8f7a9a`.
- `.schr` selects: `#f7eefb` pill, no border, pink focus ring `#ff3d8166`.
- `.schs.ok` `#e7f8ef` / `#1d6b47`. `.schs.no` `#fff0e6` / `#9a4a1f`.
- `.chp` offer chips: `#f7eefb` pill, hover `#efe3f2`.
- `.schb` buttons: `#efe3f2` fill; `button.go` is the gradient with a pink glow.
- `.mloc` (meeting place picker) uses the same select look.
- Touch targets are at least 32px tall (chips 32px, buttons 36px, selects 34px). Hover lightens the fill, press scales to 97%, focus shows a pink outline.
- "More options" has a `▸` marker that turns down when open.
- Under 520px wide the day, time and place pickers stack full width, and the two buttons share a row with "Propose this time" on top.

Outside Messages, the same panel uses the default look in `75-collab-schedule.js` (`#16201b` panel, white selects with `#e7a5c9` border). Do not use that look inside Messages.

## Spotifly (`37-spotifly.js`, desktop app id `1`)

- Logo: black tile with green `#1ed760` circle and three black bars (SVG `SFLOGO` in `11-os-v2.js`).
- Wallpaper: `#47b06f` with the wordmark.
- Artist sidebar `.sb`, heading `.sfh` (logo at 26px beside the text).
- Otherwise the shared base.

## App Barn (`store`) and Calendar pricing

- Shared `.card` and `button.go`. Balance line is muted `.m`.
- Calendar listing shows "Get · Free" (`74-calendar.js`).

## Amazoom (`amz`)

- Page `.mn.p0`: white background, text `#0f1111`, Arial 14px.
- Header `.azh`: `#131921` with white text, sticky.
- Search `.azs`: white field, `#febd69` button.
- Buttons `.azbtn`: `#ffd814` pill, `#f7ca00` hover, grey when disabled.
- Product cards `.azc`: white, 1px `#e7e7e7` border, 6px radius. Price `.azp` 28px. Muted `.g` `#565959`.
- Badges `.bd`: `#232f3e`; `.bd.bs` `#c45500`.

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

## Calendar (`.ca`)

- Accent `#5ad1ff`: selected button, today's border, hover border.
- Grid `.ca-g` (7 columns). Cells `.ca-c` `#151a17`, 6px radius. Weekday labels `.ca-wh`.
- Day states: free `.s-free` `#13261b`, busy `.s-busy` `#3a2a12`, off `.s-off` `#3a1717`. Past days are at 55% opacity.
- Selects and inputs in the bar: `#0d1411` fill, 2px black border.

## Festival (`fest`, HUD `#fst`, `#fcr`)

- Progress bar uses the shared `.bar`. Day counter `#fcr b` 28px white.
- Error box `.fa-err`: `#5a1a1a` with white text.
- Booking grid `.fa-grid` with bold `.fa-t` headers.

## Studio minigames (`#mg`)

- Centred hint text `.mgs`, with the highlight `b` in `--g`.

## Beats (`.sr`, `.tbar`)

- Play button `.bpl`: 24px circle, `#1db954` fill, black text. Active row `.sr.bon` tint `#1db95422`.
- Timeline `.tbar` uses `--g` for the moving bar.

## Gear shop and clothes picker

- Section header `.gsh`: 14px Silkscreen, 85% opacity.
- Quality pips `.gpip i.on`: `--g`.
- Swatches `.asw` (24px, 2px black border, `--g` outline when selected).
- Wardrobe picker `.wrs`: `#1d2a24`; selected border `#ff3d81`.

## Other HUD

- Car speed box `#spdbox`: dark gradient `#141c18 → #090c0b`, 16px radius, 1px `--g` 25% border, 12px text.
- Tutorial card `#tqt`: uses the `.box` look.
- Name tags `#ntags`: overlay with no pointer events.

## Shared scheduling bar (`.sch`, outside Messages)

Defined in `75-collab-schedule.js`. Default look: `#16201b` panel, `.schs.ok` `#14452c`, `.schs.no` `#4a2a12`, pill chips `.chp`. Messages overrides it under `.msx`.

## Adding a new app or panel

1. Pick the closest existing look from this sheet. Reuse the shared classes first.
2. Put app CSS in the app's own file inside a `{const st=document.createElement('style');...}` block, with selectors under the app's root class.
3. If the panel appears inside Messages, add its rules under `.msx` in `36-messages-look.js`.
4. Check the result at the game's desktop window width (about 940px) and at phone width (700px and below).
5. Update this sheet when you add a token, a class or an app look.
