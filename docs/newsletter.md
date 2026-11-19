# Newsletter (wavefern.com/newsletter/)

Static page: `newsletter/index.html` renders `newsletter/articles.js` (newest first) as a masthead, latest-issue feature, 2-column card feed with infinite scroll (chunks of 6 cards), tag filter and month archive sidebar, and a full article view at `#id`. Skeleton cards show while the first and every later Firestore chunk (12 per REST request, `orderBy=d desc`) load. To test infinite scroll, intercept the `firestore.googleapis.com/.../newsletter` request in Playwright and serve fake paged docs. Screenshots live in `newsletter/img/` (960px wide .webp).

## Add an article
1. Take a real screenshot of the feature in the game (headless Playwright, see `tools/wiki-shots.js` for setup). No real-artist names on screen.
2. Convert to 960px .webp into `newsletter/img/`.
3. Add an object at the TOP of `NEWSLETTER` in `articles.js` (id, v, date, tag, title, img, alt, body[]).
4. Voice: plain, short, 2 to 3 short paragraphs, what it is and why a player cares. No hype words, no exclamation marks. Apply the charles-unslop rules.
5. Only big updates get an article. Newsletter files are not game files, so no GAME_VERSION bump needed.

## Weekly roundup (every Monday)
Read `VERSION_HISTORY` in `version.js` and `git log --since="7 days ago"`. Write one article (tag `Weekly`, title like "Week of 9 Nov: ...") covering what shipped the previous week, with one screenshot of the biggest thing. Skip the week if nothing big shipped. PR it and merge to main once checks pass.

## Publishing from the page (admin)
Sign in with the admin Google account on wavefern.com/newsletter/ (the account name sits in the top right of the page). The account's Publish button opens a form: title, tag, version, date, text, optional screenshot. It saves to Firestore `newsletter/{id}` and shows up for everyone, merged with `articles.js`, newest date first. Admin also sees a Delete link on those articles.
One-off setup: publish `firebase-rules/v55.30.5/firestore.rules` (it now has a `newsletter` block, public read, admin write) in Firebase console > Firestore Database > Rules. Until then, publishing shows "permission-denied".
Admin uids live in `88-admin.js` (ADMIN_UIDS), in the rules `admin()` and in the page script. Add a new admin in all three.
