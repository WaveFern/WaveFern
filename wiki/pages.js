/* WaveFern Wiki pages, part 1: categories, Main Page, Getting started, Music.
   Each page's body() builds its HTML when it is opened, so tables always use the current WIKI_DATA. */
cat('start','Getting started','🎮','The basics: your first day, the controls, saving, and how a day works.');
cat('music','Music','🎤','Recording songs, what decides their quality, genres, extras like 808s and hi hats, and how streams and listeners are worked out.');
cat('career','Career','📈','Money, gear, fame, mentors, collabs, record labels, promotions, quests, awards, rivals and radio.');
cat('live','Live and touring','🎪','The weekly festival, booking your own slots, flights, and the World Tour.');
cat('life','City life','🏙️','Getting around, homes, furniture, clothes, pets, food, the phone, the computer and the people of the city.');
cat('band','Multiplayer','🎸','Band rooms: playing with up to three friends.');
cat('meta','About the game','📜','Settings, graphics, saves and the full version history.');

/* ===================== Main Page ===================== */
page('home','Main Page','meta',{hide:1,body:()=>{const n=PAGES.filter(p=>!p.hide).length;
 return `<div class=hero><h1>WAVEFERN<br>WIKI</h1><div class="px sub">Music Career Sim</div>
 <p class=lead>Welcome to the WaveFern Records wiki: every mechanic of the game, worked out from the game's own code.<br>The tables on these pages are copied straight from the game's data each time it updates, so the numbers are always the real ones.</p>
 <div class=stats><div><b>${n}</b>pages</div><div><b>${(D.genres||[]).length}</b>genres</div><div><b>${(D.artists||[]).length}</b>artists</div><div><b>${(D.dest||[]).length}</b>tour cities</div><div><b>${(D.fame&&D.fame.starts.length-1)||350}</b>fame levels</div></div>
 <p><a class="btn go" href="../">▶ Play the game</a> <a class=btn href="#/first-day">New here? Start here</a></p></div>
 <div class=grid>${CATS.map(c=>`<a class=card href="#/cat-${c.id}"><span class=e>${c.e}</span><h3>${c.t}</h3><ul>${PAGES.filter(p=>p.cat===c.id&&!p.hide).slice(0,7).map(p=>'<li>'+p.t+'</li>').join('')}${PAGES.filter(p=>p.cat===c.id&&!p.hide).length>7?'<li>…and more</li>':''}</ul></a>`).join('')}</div>
 ${H2('Popular pages')}<p>${['streams','song-quality','genres','extras','collabs','fame','labels','festival','world-tour','band-rooms'].map(i=>L(i)).join(' · ')}</p>
 ${H2('Latest update')}${typeof VERSION_HISTORY!='undefined'?`<p><span class="tag g">${VERSION_HISTORY[0].v}</span> ${esc(VERSION_HISTORY[0].n)}</p><p>${L('versions','See the full version history')}</p>`:''}`}});

/* ===================== Getting started ===================== */
page('first-day','Your first day','start',{e:'🌅',sum:'What to do in your first hour, step by step.',src:['72-tutorial.js','02-data.js'],body:()=>`
${IB('New career','🌅',[['Cash','$100'],['Energy','100'],['Home','Starter house'],['Phone','Gphone 8'],['Tutorial gift','$150 + small rewards']])}
<p class=lead>You start as an unknown artist with $100, a starter house with a tiny studio and a laptop. The goal: record songs, release them on Spotifly, and grow from nobody to a global star.</p>
${H2('The quick loop')}<ol>
<li>Pick an artist name on the laptop (${K('E')} at the desk, then <b>Spotifly</b>). You cannot record until you have one.</li>
<li>Walk to the mic in your studio and press ${K('E')}. Pick a genre and play the three ${L('recording','recording minigames')}. Each song costs 15 ${L('days','energy')}.</li>
<li>Back at the laptop, open Spotifly › Upload, give the draft a title and release it. Streams start right away.</li>
<li>Sleep in your bed to end the day. Overnight, yesterday's ${L('streams')} are paid out and your ${L('listeners','monthly listeners')} update.</li>
<li>Spend the money on ${L('gear')} so your next songs are better, and repeat.</li></ol>
${H2('The tutorial')}<p>Big Vee, your manager, walks you through the first steps. Each step pays a little cash and each chapter a bit more:</p>
${T(['Chapter','Step','Goal'],(D.tutorial||[]).map(t=>[t.c+1,t.n,esc(t.o||'')]),{tall:1})}
${N('Every step pays $3, every chapter $10, and finishing the whole tutorial $20 more. You can skip it from the pause menu, and you still get the $150 starting gift.','tip','Rewards')}
${H2('Good first goals')}${ul([`Record a few songs in one ${L('genres','genre family')}: the ${L('genres','genre focus')} bonus rewards a steady sound.`,`Buy a better ${L('gear','microphone')} first: it gives the most quality per level.`,`Install ${L('instagrime','Instagrime')} and post once a day for followers.`,`Reach 10 monthly listeners to unlock your first ${L('mentors','mentor')}.`])}`});

page('controls','Controls','start',{e:'⌨️',sum:'Keyboard, mouse and touch controls.',src:['07-input-loop.js','154-touch-controls.js'],kw:'keys keyboard wasd shift sprint',body:()=>`
<p class=lead>WaveFern plays with a keyboard and mouse, or with touch controls on phones and tablets.</p>
${T(['Key','What it does'],[[K('W')+K('A')+K('S')+K('D')+' / arrows','Walk'],[K('Shift'),'Sprint (uses stamina)'],[K('E')+' / '+K('Space')+' / '+K('Enter'),'Interact: doors, desks, shops, people, mic'],[K('F'),'Storage and furniture build mode at home'],[K('R'),'Rotate furniture while placing it'],[K('N'),'World map (and the taxi)'],[K('M'),'Mute music'],[K('G'),'Open your phone'],[K('B'),'Emote wheel in a band room'],[K('Esc'),'Pause menu: settings, save, quit'],[K('1')+K('2')+K('3'),'Pick a rhyme in the Lyrics minigame'],[K('Space')+' (hold)','Raise the level in the Mix minigame']])}
${H2('Walking and stamina')}<p>You walk at 3.3 m/s and sprint at 6.5 m/s. Sprinting drains stamina by 15 per second; it refills at 10 per second when you stop. If you run it to zero you are winded and can't sprint again until it is back to 30.</p>
${H2('Touch')}<p>On a phone or tablet a joystick appears bottom left, with buttons for sprint and interact. Menus, the phone and the computer work by tapping.</p>`});

page('days','Days, time and energy','start',{e:'⏰',sum:'How long a day lasts, energy, sleeping and passing out.',src:['29-v26.js','07-input-loop.js','04-house.js'],kw:'clock sleep bed pass out energy night',body:()=>`
${IB('A game day','⏰',[['Real time','12 minutes'],['Starts','06:00'],['Night','20:00 – 06:00'],['Pass out','06:00, with 70% energy'],['Song cost','15 energy']])}
<p class=lead>A full in-game day lasts 12 real minutes, from 06:00 to 06:00 the next morning. About nine songs fit in one day.</p>
${H2('The clock')}<p>The first half of the day runs from 06:00 to 20:00; the second half is night, from 20:00 to 06:00. The clock keeps running while the computer or phone is open.</p>
${H2('Energy')}${ul(['You wake with 100 energy after sleeping in your bed.','Recording a song costs 15 energy (7.5 for your part in a collab). A festival set costs 15 and a tour show 25.','Energy slowly comes back by itself during the day, about 36 over a full day.',`Food tops it up: the corner shop, City Cafe, ${L('food','Goober Eats')} and festival stalls.`])}
${H2('Sleeping')}<p>You can only go to bed at night (after 20:00), or earlier if your energy is under 15. Sleeping ends the day: yesterday's streams are paid, your ${L('listeners','monthly listeners')} are updated, every genre's hype is rerolled and new messages arrive.</p>
${N('If you are still awake at 06:00 you pass out where you stand and wake with only 70 energy.','warn','Passing out')}
${H2('What happens overnight')}${ul(['Streams for the day are completed and paid at the stream rate (after any label cut).','Interest decays by 10% and gains 6% for each song you released that day.','Monthly listeners and followers update (followers grow by 5% of the day\'s streams).','Genre hype rerolls between ×0.8 and ×1.3.','A new mentor may unlock, artists may DM you, labels may make offers, and new quests roll.'])}`});

page('saves','Saves and careers','meta',{e:'💾',sum:'Two career slots, autosave, cloud saves, save codes and backups.',src:['12-save-load.js','86-google-signin.js'],kw:'save load code cloud google backup slot',body:()=>`
<p class=lead>The main menu has two career slots. Each career saves on its own, so nothing leaks between them.</p>
${H2('How saving works')}${ul(['The game autosaves to your browser as you play.','Sign in with Google from the main menu to keep your career in the cloud and play it on any device.','The pause menu can export a <b>save code</b> (starts with <code>FW3-</code>). Paste it back in to load it anywhere. Older <code>FW2-</code> and <code>FW1-</code> codes still load.','If a save ever fails to load it is kept as a recoverable backup instead of being lost. Backups show under <b>Recovered backups</b> on the career screen: press Recover, or drag one onto a slot.'])}
${N('Band rooms keep a separate band career for each room, on your device. It never touches your two career slots or your cloud save.','','Band careers')}`});

/* ===================== Music ===================== */
page('recording','Recording a song','music',{e:'🎙️',sum:'The Make a song screen and the three minigames: Beat, Lyrics and Mix.',src:['165-song-menu.js','34-studio-minigames.js','130-song-session.js'],kw:'mic studio minigame beat lyrics mix rhyme countdown',body:()=>`
${IB('Recording','🎙️',[['Where','The mic in any studio'],['Energy','15'],['Needs','An artist name'],['Steps','Beat · Lyrics · Mix'],['Time','About 80 seconds']])}
<p class=lead>Walk to the mic and press ${K('E')} to open <b>Make a song</b>. Pick a genre (and, if you like, ${L('extras','extras')}), then play three short minigames. How well you play decides a big part of the song's ${L('song-quality','quality')}.</p>
${H2('The Make a song screen')}${ul([`A grid of the ${(D.genres||[]).length} ${L('genres','genres')}. A genre marked <span class="tag g">HOT</span> has hype above ×1.12 today and earns more streams; <span class="tag r">COLD</span> is below ×0.92.`,`Each genre shows its ${L('genres/genre-focus','genre focus')} percentage: how much your fans will reward (or punish) that choice.`,`An <b>Extras</b> drop-down holds the diss track, 808 and hi hat options. See ${L('extras')}.`])}
<p>Every step starts with an animated <b>3, 2, 1, GO</b> countdown; nothing counts until it is over.</p>
${H2('1. Beat')}<p>A marker swings along a bar. Hit it when it is inside the green zone (within 8% of the centre). Six good hits finish the step. Each hit speeds the marker up by 5%. You get three goes: every miss uses one, and running out scraps the take.</p>
${H2('2. Lyrics')}<p>Pick the word that rhymes with the one shown (keys 1–3 or tap). There are five lines and the game adapts to you:</p>
${T(['Level','Difficulty','Time per line','Traps'],[['Easy','under 0.35','about 8 s','any other word'],['Tricky','0.35 – 0.7','about 5–6 s','words that look like the answer'],['Hard','0.7 and up','down to 3.5 s','longer rhymes, near-rhymes as traps']])}
<p>The time limit is <code>8 − 4.5 × difficulty</code> seconds. A right answer is worth <code>0.85 + 0.3 × difficulty</code> points, so harder lines count for more. Half your level carries over to the next session.</p>
${H2('3. Mix')}<p>Hold ${K('Space')} (or hold the mouse) to raise the level, let go to drop it. The level rises at 1.15 per second and falls at 0.95. Keep it within 0.1 of the moving green band for 6 seconds.</p>
${FX('mix score = min(1, time in band ÷ 6 s × 1.15)')}
${H2('Session grade')}${T(['Average of Lyrics and Mix','Grade'],[['0.9 and up','Studio magic'],['0.7 – 0.9','Solid session'],['0.45 – 0.7','Rough around the edges'],['below 0.45','Messy take']])}
<p>The finished draft waits on your laptop. Give it a title and release it from Spotifly › Upload, or use <b>Upload all</b> to release every titled draft at once.</p>
${N(`In a ${L('band-rooms','band room')} the middle step depends on your instrument: only vocalists rhyme. Guitar, bass, drums and keys play their own part.`,'','Bands')}`});

page('song-quality','Song quality','music',{e:'⭐',sum:'Exactly how a song\'s quality score is worked out.',src:['34-studio-minigames.js','29-v26.js','52-gear-shop-plus.js'],kw:'quality score q experience formula',body:()=>{const g=D.gear||[];
 return `<p class=lead>Every song gets a quality score. Quality drives almost everything: daily ${L('streams')}, the chance of a hit, ${L('festival')} crowds and ${L('awards')}.</p>
${H2('The formula')}${FX(`quality = max(3, round( <b>experience</b> × (
    random 8–14
  + 16 × <b>session</b>            (average of Lyrics and Mix, 0–1)
  + <b>gear points</b>             (see below)
  + 3 if you own a home      + 1 per pet you own
  + 2 per unlocked mentor
  + max(0, 8 − misses)       (Beat step)
)))`)}
${H2('Experience','experience')}<p>New artists don't get full value from their gear. Experience starts at 0.3 and climbs towards 1:</p>
${FX(`experience = 0.3 + 0.7 × (1 − e^(−xp / 200))
xp = songs made + 8 per mentor + 6 per fame level`)}
<p>${T(['xp','Experience'],[0,25,50,100,200,400,800].map(x=>[x,(.3+.7*(1-Math.exp(-x/200))).toFixed(2)]))}</p>
${H2('Gear points','gear-points')}<p>Each level of a piece of gear adds a fixed number of points (level 0 = the starting item):</p>
${T(['Gear',['Points per level','n'],['Max level','n'],['At max','n']],g.filter(x=>x.q).map(x=>[L('gear',x.n),x.q,x.lv.length-1,x.q*(x.lv.length-1)]))}
<p>Promo, decks and the content kit don't add quality; they add ${L('streams','reach')} instead.</p>
${H2('Collab songs')}<p>A ${L('collabs','collab')}'s quality uses a different recipe: a random 30–40 base plus gear, times experience, plus up to 25 points from the fee you agreed (more for a bigger fee) and ±4 per point of opinion from the meeting chat.</p>
${H2('Band songs')}<p>A band song's quality is the average of every member's take, plus 3 for each extra member.</p>`}});

page('genres','Genres and genre focus','music',{e:'🎼',sum:'The nine genres, their families, beat styles, hype and the genre focus bonus.',src:['02-data.js','166-genre-focus.js','67-beats.js'],kw:'genre focus family hype hot cold trending latin hip-hop rap pop rock',body:()=>{const fams={};(D.fam||[]).forEach(([g,f])=>(fams[f]=fams[f]||[]).push(g));
 return `${IB('Genres','🎼',[['Genres',(D.genres||[]).length],['Families',Object.keys(fams).length],['Hype range','×0.8 – ×1.3'],['Focus range','about −25% to +40%']])}
<p class=lead>There are ${(D.genres||[]).length} genres. Each has its own beat styles, its own daily hype, and belongs to a family of similar sounds.</p>
${H2('Genres and beat styles')}${T(['Genre','Family','Beat styles'],(D.genres||[]).map(g=>[g,(D.fam.find(f=>f[0]==g)||[])[1]||'',((D.styles||{})[g]||[]).join(', ')]))}
${H2('Hype (trending)')}<p>Every morning each genre's hype is rerolled between ×0.8 and ×1.3. It multiplies the daily streams of every song in that genre, old ones included. On the Make a song screen a genre above ×1.12 shows <span class="tag g">HOT</span> and one below ×0.92 shows <span class="tag r">COLD</span>.</p>
${H2('Genre focus','genre-focus')}<p>Fans reward a steady sound. When you release a song, the five songs you released before it decide its <b>focus</b>, a multiplier it keeps on its daily streams for good.</p>
${FX(`share = (1 per same genre + 0.8 per same family) ÷ 5 previous releases
run   = how many of your latest releases in a row are in this family (max 5)
focus = 0.75 + 0.5 × share + 0.03 × run`)}
${T(['Your last five releases','Focus'],[['All in other families (genre hopping)','×0.75 (−25%)'],['Mixed, about half the same family','about ×1.0'],['All the same family, different genres','×1.30'],['All the same genre, a run of 5','×1.40 (+40%)']])}
<p>The families are:</p>${ul(Object.entries(fams).map(([f,gs])=>`<b>${f}</b>: ${gs.join(', ')}`))}
${N('Your very first release has nothing to compare against, so its focus is ×1. A toast tells you when a release gets +5% or more, or −5% or less.','')}
${N('Pick one family and stay in it for most of your releases. You can still switch: the penalty fades as your last five releases fill up with the new family.','tip')}`}});

page('extras','Extras: diss tracks, 808s and hi hats','music',{e:'🥁',sum:'The Extras options on the Make a song screen.',src:['165-song-menu.js','132-808-hats.js','21-v7-albums-rivals-instagrime-profiles-sit.js'],kw:'808 hi hat hats diss track drums extras',body:()=>{const cap=s=>s[0].toUpperCase()+s.slice(1);
 return `<p class=lead>Open <b>Extras</b> on the Make a song screen to choose a diss track, your 808 and your hi hats.</p>
${H2('808 and hi hats')}<p>Both pickers offer <b>Auto</b> (the genre's own pick), <b>Built-in</b> (the classic synthesised sound) or one of the named samples. Your choice is remembered for the next song and saved with each song, so it plays the same every time. They change how the song sounds, not its quality.</p>
<h3>808s (${(D.drums||{}).s808?D.drums.s808.length:0})</h3><p>${((D.drums||{}).s808||[]).map(x=>tag(cap(x))).join(' ')}</p>
<h3>Hi hats (${(D.drums||{}).hats?D.drums.hats.length:0})</h3><p>${((D.drums||{}).hats||[]).map(x=>tag(cap(x))).join(' ')}</p>
${H2('Diss tracks','diss')}<p>Tick <b>Diss track</b> and pick a rival to make a song called <i>No Love For [rival]</i>. Releasing it is a gamble:</p>
${ul(['On release, interest changes by somewhere between −8% and +25%.','2 to 5 days later the rival answers. That moves interest by −12% to +20% and your reputation by −2 to +3.'])}
<p>See ${L('rivals')} for the list of rivals.</p>`}});

page('streams','Streams','music',{e:'📈',sum:'The full daily streams formula, decay, caps, hits and viral songs.',src:['29-v26.js','02-data.js','166-genre-focus.js'],kw:'streams formula plays daily decay hit viral cap payout',body:()=>{const p=D.pace||{},f=D.perf||{};
 return `${IB('Streams','📈',[['Pay per stream','$'+(D.tune||{}).payRate],['Paid','Every morning'],['Night speed','×2'],['Hit chance','about '+pct(f.hitP||.08)],['Viral chance','about '+(100*(f.viralP||0)).toFixed(2)+'%']])}
<p class=lead>Every released song earns streams every day. Streams build up through the day (twice as fast at night) and are paid the next morning at <b>$${(D.tune||{}).payRate} per stream</b>, minus any ${L('labels','label')} cut.</p>
${H2('Daily streams')}${FX(`daily = quality × ${p.base} × random(0.75–1.25)
      × <b>genre hype</b>                         (×0.8–1.3, rerolled daily)
      × <b>age decay</b>   (0.86^days + ${p.floor})      (a new song fades over a few weeks)
      × <b>fame</b>        1.5^fame tier × (1 + min(1, √listeners ÷ 200))
      × <b>interest</b>    0.3 + 0.7 × interest
      × <b>reach</b>       1 + promo×0.3 + decks×0.2 + content kit + home×0.1
      × <b>quality</b>     clamp((quality ÷ ${f.qRef})^${f.qPow}, ${f.qMin}, ${f.qMax})
      × <b>collab</b>      (feature)² × (1 + 0.5 × min(1.5, quality ÷ 100))
      × <b>focus</b>       genre focus (see Genres)
      × 1.5 on release day`)}
<p>On top of that, a ${L('collabs','collab')} brings the featured artist's fans: about 1% of their monthly listeners a day, decaying the same way.</p>
<p>Other boosts that stack on top: ${L('promotions')}, ${L('albums','album')} tracks, the ${L('halo','catalogue halo')}, your ${L('gphone','Gphone')} model and ${L('radio')} slots.</p>
${H2('Interest')}<p>Interest is a 0–100% measure of how much people are talking about you. Each morning it drops by 10%, then gains 6% for every song you released yesterday. Albums, radio and diss tracks also move it. Releasing steadily keeps it high.</p>
<p>Whether a song is a hit, goes viral or is normal is rolled <b>once, on its release day</b>.</p>${H2('Hits','hits')}${FX(`hit chance = ${f.hitP} × clamp(quality ÷ ${f.hitQRef}, ${f.hitQMin}, ${f.hitQMax})
a hit streams ×${f.hitMin}–${f.hitMax}`)}
${H2('Going viral','viral')}${FX(`viral chance = ${f.viralP} × min(1, quality ÷ ${f.viralQBest})^${f.viralQPow}
a viral song gets ${fmt(f.viralMin)} + listeners × ${f.viralLisMin}–${f.viralLisMax} extra streams over ${f.viralDays} days`)}
${H2('The cap')}<p>So one song can't run away forever, daily streams are capped:</p>${FX('cap = quality² × 25 × 1.5^fame tier × hit multiplier')}
${H2('Payouts')}<p>Each morning you're paid yesterday's streams × $${(D.tune||{}).payRate}. If you're signed, the label keeps its cut first. Earnings show on the morning summary and in Spotifly › Stats.</p>`}});

page('listeners','Monthly listeners and followers','music',{e:'👥',sum:'How monthly listeners and followers are counted.',src:['29-v26.js'],kw:'monthly listeners followers ml',body:()=>`
<p class=lead>Monthly listeners are the headline number: they set your ${L('fame')} level, who ${L('collabs','DMs you')}, which ${L('labels')} want you, and how big your ${L('festival')} crowds are.</p>
${H2('Monthly listeners')}<p>A month is 30 in-game days. Each month the game picks a random divisor from 2 to 5. Every morning:</p>
${FX(`base = max(this month's streams, last 30 days of streams) ÷ divisor
if you had streams yesterday:
  listeners = max(base, old + yesterday ÷ (divisor × 30) + old × 1% × releases × interest)
otherwise:
  listeners = base`)}
<p>So while songs are streaming, monthly listeners never drop from one day to the next. When a new month starts with a bigger divisor, the number can fall.</p>
${H2('Followers')}<p>Followers grow by 5% of each day's streams, plus extras from ${L('instagrime','Instagrime')} posts, photo posts (bigger with a better ${L('gphone','Gphone')}), ${L('radio')}, ${L('promotions')}, ${L('festival')} sets, tour shows and landmark selfies.</p>`});

page('albums','Albums','music',{e:'💿',sum:'Bundling songs into an album, and the album boost.',src:['21-v7-albums-rivals-instagrime-profiles-sit.js','98-spotifly-artist-page.js','96-album-song-picker.js','112-cover-art.js'],kw:'album cover art tracks',body:()=>`
<p class=lead>Once you have at least two released songs you can bundle them into an album from Spotifly. Pick the tracks, the order, a title and cover art.</p>
${H2('What an album does')}${ul(['Releasing an album adds 20% interest.','For the first 14 days, track 1 gets up to +60% streams and the other tracks up to +25%. The boost fades over those two weeks.','Albums show on your Spotifly artist page.'])}
${N('Put your best song as track 1: it gets the biggest boost.','tip')}`});

page('collabs','Collabs, fees and haggling','music',{e:'🤝',sum:'DMs, negotiation, meetings and how collab fees are set.',src:['75-collab-fees-dms.js','33-haggle.js','29-v26.js','54-skyline-meetings.js'],kw:'collab feature feat dm message fee haggle negotiate meeting personality',body:()=>{const np=D.neg||{};
 return `${IB('Collabs','🤝',[['Started by','You, or a DM from them'],['Energy','7.5'],['Song tag','(feat. NAME)'],['DMs a day','0–2, max 3 waiting'],['Artists',(D.artists||[]).length]])}
<p class=lead>A collab is a song with another artist. You either pay them (you messaged them) or they pay you (they messaged you). Their fans come along: a featured song gets about 1% of their monthly listeners in extra streams each day.</p>
${H2('Who messages you')}<p>Each day 0 DMs (20%), 1 (40%) or 2 (40%) can arrive, never more than 3 waiting. On your first day 2–3 small artists say hello. Who writes depends on size:</p>
${ul(['Artists about your size are the most likely.','A bit smaller: common. Much smaller: rare, unless you worked together before or share a genre.','Bigger: falls off fast with the gap, helped by your growth this week, your interest and your reputation.',`Your recent genres: ×1.6 for the same genre, ×1.25 for a related one, ×0.85 otherwise.`,`Artists with ${fmt((D.dmStar||{}).A)}+ listeners only DM you once you have ${fmt((D.dmStar||{}).L)}. ${Object.entries(D.dmLock||{}).map(([n,v])=>`${n} waits until you have ${fmt(v)}.`).join(' ')}`])}
${H2('The price')}${FX(`what they charge = their fee × size factor × markup × reach × repeat × reputation
  size factor = 0.18 + 0.82 × A ÷ (A + 1500)        (A = their listeners)
  markup      = 0.92 – 1.12, fixed per artist
  reach       = ((A + 5) ÷ (you + 5))^0.2, kept within 0.75 – 1.35
  repeat      = ×0.92 if you've worked together before
  reputation  = −1% per point (up to −10%)
what they pay you = 55% of your own market price, never more than 80% of their fee`)}
${H2('Haggling','haggle')}<p>Type your offer in Messages ("how about $120?", "two fifty", "1.5k"). Each artist has a fixed negotiation personality:</p>
${T(['Personality',['Moves on price','n'],['Closes the gap per round','n'],['Rounds before a final offer','n'],['Insulted below','n']],Object.entries(np).map(([k,v])=>[k,pct(v.drop),pct(v.rate),v.pat,pct(v.ins)]))}
<p>Big names move less. Offers inside their range are usually accepted, more often the longer you've talked. Lowball too hard and they're insulted. A lone "100" means "keep it 100", not an offer.</p>
${H2('The meeting')}<p>Once you agree, press <b>Confirm &amp; pay</b> (or <b>Accept &amp; get paid</b>). The artist waits at the meeting place (gold beacon). Walk up to them to chat for 1–3 exchanges: pick a tone (hype, chill, pro, joke, cocky) that suits their personality (chill, hype, shy, formal, goofy). Their opinion goes from −3 to +3 and changes the song: ±4 quality and ±12% feature strength per point.</p>
${FX(`feature strength = (1.05 + min(0.3, fee ÷ 6000)) × (1 + opinion × 0.12)`)}
${H2('All artists','artists')}<p>Listeners as in the game's data. <i>Real</i> artists are fictional stand-ins of real stars.</p>
${T(['Artist','Genre',['Listeners','n'],['Base fee','n'],'Personality','Haggling','Type'],(D.artists||[]).map(a=>[esc(a.n),a.g,[fmt(a.l),a.l],[$$(a.fee),a.fee],a.pers,a.np||'',a.real?tag('real','y'):a.big?tag('big'):'']),{filter:1,tall:1})}`}});

page('promotions','Promotions','music',{e:'📣',sum:'Paid campaigns that multiply a song\'s streams for a few days.',src:['83-promotions.js'],kw:'promo boost campaign blitz',body:()=>`
<p class=lead>From Instagrime you can pay to promote a released song. The price grows with your monthly listeners. A promoted song streams its multiplier times its normal amount every day of the campaign, and you gain followers when it starts.</p>
${T(['Promotion',['Days','n'],['Streams','n'],'Price',['Followers','n']],(D.promos||[]).map(p=>[p.n,p.days,mul(p.m),`$${p.base} + $${p.per} × listeners`,'3–12 + '+pct(p.f,0)+' of listeners']))}
${N('A promotion multiplies the song\'s normal daily streams, so it is worth most on a strong, fresh song in a HOT genre.','tip')}`});

page('halo','Catalogue halo','music',{e:'✨',sum:'When your listeners balloon, some of them dig into your older songs.',src:['108-catalogue-halo.js'],kw:'halo catalogue back catalog',body:()=>{const h=D.halo||{};return `
<p class=lead>When your monthly listeners jump (after a hit or a viral song, say), some of those new fans dig into your older songs, so nothing in your catalogue is stuck at a few hundred streams.</p>
${FX(`extra daily streams per song = listeners × ${h.rate} ÷ max(${h.minSongs}, songs − 1)
                                × quality factor × age factor × (0.5 + 0.5 × interest) × random(0.75–1.25)
age factor = ${h.ageKeep} + ${1-h.ageKeep} × ${h.ageDecay}^days since release`)}
<p>Because it's split across the catalogue, the total stays about the same however many songs you have. Hit and viral songs don't get it. It does nothing early on, when your listeners are small.</p>`}});

page('spotifly','Spotifly','music',{e:'🎧',sum:'The streaming site: upload, stats, artist page and browse.',src:['37-spotifly.js','98-spotifly-artist-page.js','111-spotifly-browse.js','109-analytics.js'],kw:'spotifly upload stats artist page',body:()=>`
<p class=lead>Spotifly is where your music lives. Open it on the laptop (or the Spotifly app on your phone).</p>
${ul(['<b>Setup</b>: pick your artist name. You need one before recording.','<b>Upload</b>: title drafts and release them, one by one or all at once.','<b>Stats</b>: streams, earnings and listeners by day, and per-song history.','<b>Artist page</b>: your profile, top 5 songs by popularity (or all songs), albums.','<b>Browse</b>: other artists\' pages.',`Promote songs (${L('promotions')}) and build ${L('albums')}.`])}`});
