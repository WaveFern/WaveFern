# Newsletter (wavefern.com/newsletter/)

Static page: `newsletter/index.html` renders `newsletter/articles.js` (newest first). Screenshots live in `newsletter/img/` (960px wide .webp).

## Add an article
1. Take a real screenshot of the feature in the game (headless Playwright, see `tools/wiki-shots.js` for setup). No real-artist names on screen.
2. Convert to 960px .webp into `newsletter/img/`.
3. Add an object at the TOP of `NEWSLETTER` in `articles.js` (id, v, date, tag, title, img, alt, body[]).
4. Voice: plain, short, 2 to 3 short paragraphs, what it is and why a player cares. No hype words, no exclamation marks. Apply the charles-unslop rules.
5. Only big updates get an article. Newsletter files are not game files, so no GAME_VERSION bump needed.

## Weekly roundup (every Monday)
Read `VERSION_HISTORY` in `version.js` and `git log --since="7 days ago"`. Write one article (tag `Weekly`, title like "Week of 9 Nov: ...") covering what shipped the previous week, with one screenshot of the biggest thing. Skip the week if nothing big shipped. PR it and merge to main once checks pass.
