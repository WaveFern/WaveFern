/* WaveFern Wiki pages, part 3: City life, Multiplayer, About the game. */
const slotName={top:'Tops',jk:'Jackets',bt:'Bottoms',sh:'Shoes',ht:'Hats',ac:'Extras'};

/* ===================== City life ===================== */
page('city','The city and the map','life',{e:'🗺️',sum:'Places on the map, the taxi, and getting around.',src:['16-big-world-fame-chat-instagrime-v2.js','89-taxi-once.js','32-map-zoom.js'],kw:'map city places taxi poi',body:()=>`
<p class=lead>Your house sits on a quiet street west of the city. Press ${K('N')} for the map: scroll or +/− to zoom.</p>
${H2('Places')}<p>${(D.pois||[]).map(p=>tag(esc(p))).join(' ')}</p>
${H2('Taxi')}<p>From the map you can call a taxi to any place. You get <b>one trip a day</b>: one ride out, then one ride back to where it picked you up. After that it's gone until tomorrow.</p>
${H2('Weather','weather')}<p>Each day rolls its weather: ${(D.weather||[]).join(', ')}. About 90% of days are sunny, 5% rain, 3% fog and 2% storms. Day 1 is always sunny.</p>`});

page('cars','Cars and the garage','life',{e:'🚗',sum:'Every car, its price and top speed.',src:['14-world-fame-cars-pets-collabs.js','63-car-speed.js','18-browser-venues-appointments-roads.js'],kw:'car drive garage motors speed mph',body:()=>`
${IB('Cars','🚗',[['Garage','$2,500'],['Buy at','Motors (book on motors.wf)'],['Drive',K('W')+' go · '+K('S')+' brake']])}
<p class=lead>Book a car on <b>motors.wf</b> in the laptop browser, then visit Motors to pick it up. You need a garage first ($2,500), which appears beside your house once bought.</p>
${T(['Car',['Price','n'],['Top speed','n']],(D.cars||[]).map(c=>[`<span style="color:${c.c}">■</span> ${c.n}`,[$$(c.p),c.p],[c.mph+' mph',c.mph]]))}`});

page('homes','Homes','life',{e:'🏠',sum:'Buying a bigger home and what it gives you.',src:['14-world-fame-cars-pets-collabs.js','15-homes-shop-interiors-hover-previews.js','95-property-no-starter.js'],kw:'home house villa penthouse property',body:()=>`
<p class=lead>Book a viewing on <b>homes.wf</b>, then buy at the Property office. A home gives +3 to every song's quality and +10% reach on streams.</p>
${T(['Home',['Price','n'],'Notes'],(D.props||[]).map((p,i)=>[p[0],[i?$$(p[1]):'',i?p[1]:0],i?'':'Not for sale: your starter house']))}
${N(`Decorate with ${L('furniture')} and ${L('paint')}.`,'tip')}`});

page('furniture','Furniture and storage','life',{e:'🛋️',sum:'Every piece of furniture, Amazoom, storage and build mode.',src:['10-apps-shop-furniture.js','104-furniture-storage.js','158-placement-overhaul.js','79-amazoom-detail.js'],kw:'furniture amazoom storage build place rotate sofa bed',body:()=>`
<p class=lead>Buy furniture on <b>Amazoom</b> (a $250 app). It arrives in Storage. Some pieces move: the fish tank, the grandfather clock\'s pendulum, the lava lamp, the electric fireplace, the popcorn machine and the gaming PC\'s fans. At home press ${K('F')} to open Storage and build mode: place, move and rotate (${K('R')}) pieces.</p>
${T(['Item',['Price','n'],'Amazoom section'],(D.furniture||[]).map(f=>[esc(f.n),[$$(f.p),f.p],f.az||'']),{filter:1,tall:1})}
<p class=m>Plus ${D.furnitureVariants||0} colour and style variants (armchairs, sofas, beds, rugs, beanbags, prints...).</p>`});

page('paint','Wall paint','life',{e:'🎨',sum:'Repainting your walls.',src:['123-property-polish.js'],kw:'paint wall colour',body:()=>`
<p class=lead>Repaint the walls of your home for $40 a colour.</p><p>${(D.paints||[]).map(p=>`<span class=tag style="background:${p[1]};color:#111">${esc(p[0])}</span>`).join(' ')}</p>`});

page('clothes','Clothes (Threadz)','life',{e:'👕',sum:'Every garment on Threadz and the wardrobe.',src:['22-v8-clothes-wardrobe-big-catalogues-pixel.js','50-threadz-new-drop.js','61-threadz-mega-drop.js'],kw:'clothes threadz wardrobe outfit shoes hat jacket',body:()=>`
<p class=lead>Buy clothes on <b>Threadz</b> in the laptop browser and wear them from the wardrobe in your bedroom (${K('E')}). Every piece comes in ${D.colours||0}+ colours.</p>
${T(['Item','Slot',['Price','n']],(D.clothes||[]).map(c=>[esc(c.n),slotName[c.slot]||c.slot,[$$(c.p),c.p]]),{filter:1,tall:1})}`});

page('barbershop','Barbershop','life',{e:'💈',sum:'Haircuts and dye.',src:['90-barbershop.js'],kw:'hair haircut barber dye',body:()=>`
<p class=lead>The Barbershop in the city restyles you. Classic cuts are $20 and a dye job is $15. Signature styles:</p>
${T(['Style',['Price','n']],(D.hair||[]).map(h=>[h[0],[$$(h[1]),h[1]]]))}`});

page('pets','Pets','life',{e:'🐶',sum:'Pets, what they cost and what they do.',src:['14-world-fame-cars-pets-collabs.js','58-pets.js','35-parrot-flight.js'],kw:'pet cat dog parrot fox',body:()=>`
<p class=lead>Book on <b>pawfinder.wf</b>, then pick up at the Pet Shop. You can keep up to 3. Each pet adds +1 to every song's quality. Pets can stay home or follow you around.</p>
${T(['Pet',['Price','n']],(D.pets||[]).map(p=>[p[0],[$$(p[1]),p[1]]]))}`});

page('bodyguards','Bodyguards','life',{e:'🕶️',sum:'Hiring guards to keep fans and thieves away.',src:['14-world-fame-cars-pets-collabs.js','92-fan-robbery.js'],kw:'bodyguard guard security',body:()=>`
<p class=lead>Book on <b>bodyguards.wf</b> and hire at Security. Guards unlock at Fame Level ${((D.fame||{}).ftl||[])[2]}. You can have up to 3, and dismiss them or call them back.</p>
${T(['Guard',['Price','n'],'Fans let through','Thief chance'],[[1,800,'50%','2.5%'],[2,1800,'10%','0.5%'],[3,4000,'none','0%']].map(r=>['Guard '+r[0],[$$(r[1]),r[1]],r[2],r[3]]))}`});

page('jewellery','Jewellery','life',{e:'💎',sum:'Bling that boosts your fame value.',src:['14-world-fame-cars-pets-collabs.js'],kw:'jewellery jewelry bling chain grill',body:()=>`
<p class=lead>Each piece bought at the Jewellery store adds 8% to your ${L('fame')} value.</p>
${T(['Piece',['Price','n']],(D.jewels||[]).map(j=>[j[0],[$$(j[1]),j[1]]]))}`});

page('fans','Fans, autographs and robbery','life',{e:'✍️',sum:'Fans who stop you in the street, tips and thieves.',src:['14-world-fame-cars-pets-collabs.js','92-fan-robbery.js'],kw:'fan autograph rob robbery thief tip',body:()=>`
<p class=lead>The more famous you are, the more people recognise you. A passer-by notices you with a chance of monthly listeners ÷ 5,000,000.</p>
${H2('Autographs')}<p>Sign and you usually get a tip: $3-12 × your fame tier (at least ×1).</p>
${H2('Robbery')}<p>Some "fans" are thieves. A robbery can only happen when you sign an autograph: instead of a tip, they grab <b>35% of the cash you're carrying</b> and run.</p>
${T([['Guards with you','n'],'Fans let through','Thief chance'],[[0,'all','5%'],[1,'50%','2.5%'],[2,'10%','0.5%'],[3,'none','0%']])}`});

page('food','Food and energy','life',{e:'🍔',sum:'Every place to eat and how much energy it gives.',src:['10-apps-shop-furniture.js','14-world-fame-cars-pets-collabs.js','16-big-world-fame-chat-instagrime-v2.js'],kw:'food eat energy goober eats cafe corner shop snack coffee',body:()=>`
<p class=lead>Food refills energy. Drinks marked "stamina" also refill your sprint.</p>
${H2('Corner shop')}${T(['Item',['Price','n'],['Energy','n']],[['Snack',6,8],['Coffee',9,14],['Sandwich',12,20]].map(r=>[r[0],$$(r[1]),'+'+r[2]]))}
${H2('City Cafe')}${T(['Item',['Price','n'],['Energy','n']],[['Flat white',8,15],['Cake',12,22],['Brunch',26,45]].map(r=>[r[0],$$(r[1]),'+'+r[2]]))}
${H2('Goober Eats','goober-eats')}<p>A $180 app that delivers to your door.</p>
${T(['Dish','Section',['Price','n'],['Energy','n']],(D.food||[]).map(f=>[`${esc(f.n)}<br><small class=m>${esc(f.d)}</small>`,f.cat||'',[$$(f.p),f.p],['+'+f.e,f.e]]),{filter:1,tall:1})}
<p>Also: ${L('festival','festival stalls')} and ${L('tour-cities','street food abroad')}.</p>`});

page('gphone','Gphone','life',{e:'📱',sum:'Phone models, perks and the camera.',src:['115-gphone.js','116-gphone-plus.js','118-gphone-apps.js'],kw:'phone gphone camera photo selfie',body:()=>`
<p class=lead>Press ${K('G')} to open your phone. You start with a laggy Gphone 8; newer models are sold on Amazoom. Every model has Messages, Spotifly, Instagrime, Eats, Gigs, Camera and Photos. Better models boost every song's streams and make photo posts bring more followers.</p>
${T([['Model','n'],['Price','n'],['Streams','n'],['Followers per photo post','n'],'Perks'],(D.phones||[]).map(p=>['Gphone '+p.m,[p.p?$$(p.p):'starter',p.p],['+'+pct(p.buzz),p.buzz],['+'+p.post,p.post],esc(p.perks)]))}`});

page('instagrime','Instagrime','life',{e:'📸',sum:'Posting, followers and promotions.',src:['16-big-world-fame-chat-instagrime-v2.js','103-instagrime-icons-trees.js','83-promotions.js','189-instagrime-talk.js'],kw:'instagrime post followers feed photo influencer tagged diss',body:()=>`
<p class=lead>Instagrime is a $400 app. Post once a day for 2-8 new followers. Photos from your ${L('gphone','Gphone')} camera can be posted too, for more followers with a better phone. ${L('promotions','Promotions')} are bought here.</p>
${H2('Posts about you')}<p>Once you have a song out, other people post about you: friends share your first tracks, fans put your songs on repeat or bump into you in the city (you are in the photo), and fan pages appear as you grow. A ${L('rivals','diss track')} sets the feed off for about a week: fans pick sides, gossip pages cover it, the rival posts back before their response track, and everyone argues about who won once it lands. The latest 30 posts about you are kept in the <b>Tagged</b> tab on your account.</p>
${H2('Influencers')}<p>You follow 8 big accounts (skye.daily, popwatch, tourmode.tara, drip.report, thepetpals, cozyroom.mila, dex.lifts and carspotter.jay). Their pictures sit in a row at the top of the feed, 3 of them post on every refresh, and their profiles show a verified tick, a bio and millions of followers. Once you reach about 10,000 listeners they start posting your songs too.</p>`});

page('apps','Computer and apps','life',{e:'💻',sum:'The laptop, its websites and every app in the App Barn.',src:['06-computer.js','10-apps-shop-furniture.js','11-os-v2.js'],kw:'laptop computer app barn browser website',body:()=>`
<p class=lead>Press ${K('E')} at your desk to use the laptop: Spotifly, the gear Shop, Legends (mentors), Messages, a web browser and the App Barn.</p>
${H2('App Barn')}${T(['App',['Price','n'],'What it does'],Object.values(D.apps||{}).map(a=>[a.n+(a.soon?' '+tag('soon','y'):''),[a.p?$$(a.p):'free',a.p],esc(a.d)]))}
${H2('Websites')}${ul(['<b>motors.wf</b>: book a car','<b>homes.wf</b>: book a home viewing','<b>pawfinder.wf</b>: book a pet','<b>bodyguards.wf</b>: book a guard','<b>Threadz</b>: clothes'])}`});

page('messages','Messages and Big Vee','life',{e:'💬',sum:'Chatting with artists, labels and your manager.',src:['76-messages-plus.js','78-big-vee-smarter.js','102-messaging.js'],kw:'messages chat dm big vee manager',body:()=>`
<p class=lead>Messages holds every chat: artists who DM you (see ${L('collabs')}), label offers and Big Vee, your manager. Pin chats to keep them on top, clear them, or press <b>New</b> for suggested people.</p>
${H2('Big Vee')}<p>Big Vee is pinned by default. Text a question in plain words and Big Vee answers from your current save. Topics: controls, making a track, uploading and money, Spotifly, billboards, height, collabs, Messages, gear, clothes, sleep and energy, the map and cars, festivals, fame and saving.</p>`});

/* ===================== Multiplayer ===================== */
page('band-rooms','Band rooms','band',{e:'🎸',sum:'Up to four friends in one band, how songs and sets work together.',src:['161-multiplayer.js'],kw:'multiplayer band room friends online code instrument emote relay peer',body:()=>`
${IB('Band rooms','🎸',[['Players','Up to 4'],['Needs','Google sign-in'],['Rooms','Up to 2 band careers'],['Host','The room creator'],['Emotes','Press B']])}
<p class=lead>From the main menu pick Multiplayer: create a room, or join one with a friend's code. A room is a band of up to 4 players who live in the starter house together.</p>
${H2('Instruments')}${T(['Instrument','Their recording step'],Object.values(D.instruments||{}).map(i=>[i.e+' '+i.n,i.st]))}
<p>You pick your instrument the first time you join, and keep it for that band career. Everyone spawns in the studio, which has every member's instrument.</p>
${H2('How it works')}${ul(['Each member has their own band career for that room, saved on their own device. It never touches your solo careers or cloud save.','The host\'s clock is the band\'s clock. Only the host\'s bed ends the day.','Recording and festival sets need every online member present and ready.','Band songs: whoever starts the take names it, everyone records together, and releasing it releases it for the whole band. Its quality is the members\' average plus 3 per extra member.','If one member runs out of goes, the take is scrapped for everyone.','If the host leaves, the room closes and the others carry on alone.'])}
${H2('Emotes')}<p>Press ${K('B')} for the emote wheel: ${(D.emotes||[]).map(e=>e.e+' '+e.n).join(' · ')}.</p>
${H2('Connection')}<p>Players connect browser to browser. When a direct link can't be made (school networks, strict mobile data), the game switches to a relay after 9 seconds, so everyone still shares one room.</p>`});

/* ===================== About ===================== */
page('settings','Settings and graphics','meta',{e:'⚙️',sum:'Graphics presets for slow computers, and other settings.',src:['122-graphics.js','09-settings-effects.js'],kw:'settings graphics fps pixel performance',body:()=>`
<p class=lead>Settings opens from the main menu or the pause menu. Under <b>Graphics</b> pick a preset or your own mix.</p>
${T(['Preset','Pixel size','Frame cap','Crowds','Weather','Draw distance'],[['High',3,'none','all','full','normal'],['Medium',3,'60','half','light','normal'],['Low',4,'30','a quarter','off','near']])}
<p><b>Auto</b> starts on High and steps down while the game runs slowly, remembering the level it settled on. Graphics settings are saved per device, never in your career.</p>`});

page('versions','Version history','meta',{e:'📜',sum:'Every update to the game, newest first.',kw:'changelog version update history patch',body:()=>typeof VERSION_HISTORY=='undefined'?N('The version list could not be loaded.','warn'):`
<p class=lead>The game is on <b class=g>${GAME_VERSION}</b>. This list is read live from the game, so it is always current.</p>
${T(['Version','What changed'],VERSION_HISTORY.map(v=>[`<span class=tag${/\.0$/.test(v.v)?' g':''}>${v.v}</span>`,esc(v.n)]),{filter:1,tall:1})}`});

page('about-wiki','About this wiki','meta',{e:'📖',sum:'How the wiki is made and kept up to date.',body:()=>`
<p class=lead>This wiki is written from the game's own code. Every table that lists game data (gear, artists, cars, labels, stages, destinations, fame levels and more) is copied out of the running game by <code>tools/wiki-data.js</code> each time the site is published, so it can't fall behind.</p>
<p>The screenshots are taken from a fresh career by <code>tools/wiki-shots.js</code>, which plays the game in a hidden browser. Click one to see it full size.</p>
<p>Data snapshot: game ${esc(D.version||'?')}. Formulas are written out by hand from the code: each page links the files it comes from.</p>`});

/* ===================== Tips: advice rather than answers, shown near the end of the article ===================== */
const TIPS={
 recording:['Do not rush the Beat step. A clean run with no misses adds more than you would think.','The Lyrics step gets harder as you get better at it. Harder lines are worth more, so it evens out.','In the Mix step, small taps keep the level steadier than long holds.'],
 'song-quality':['Early on, making lots of songs is how you get better. Experience grows with every song.','Spend on the gear that gives the most quality per level first.','Things that stay with you for good (mentors, a home, pets) add up over a career.'],
 genres:['Pick a family you like and stick with it for a while. Hopping between sounds costs you.','A HOT genre is a nice bonus for one day. It is not worth breaking a long run in your family for.','If you want to switch sound, do it gradually through a genre in the same family.'],
 streams:['Release often. Interest fades every day you do not put something out.','A song does most of its streaming in its first few weeks, so a steady flow beats one big drop.','Quality lifts everything else in the formula, so it is the best place to spend effort.'],
 listeners:['The monthly number can drop at the start of a new month. Keep releasing and it climbs back.','Followers come mostly from streams, so they follow the same advice.'],
 gear:['Cheap first levels across many items often beat one expensive top level.','Getting heard gear does not make songs better, but it makes good songs earn more.','Some upgrades are locked behind fame. Plan for them before you have the money.'],
 fame:['Jewellery is a shortcut to looking more famous, but it does nothing for your songs.','Big unlocks (festival stages, the awards, the World Tour) come at set fame levels. Check the milestones table to plan ahead.'],
 money:['Buy things that make every future song better before things that only look good.','Do not walk around with all your cash once you are famous.'],
 festival:['Book the biggest stage your fame allows. The crowd and pay grow fast with stage size.','Put your best songs in the setlist. The crowd notices quality.','Arrive at the stage a little early so you do not miss your slot.'],
 'world-tour':['Rehearse before big shows. It costs a little energy and makes a real difference.','Learn how to greet each crowd. Talking to them well lifts the whole show.','Production costs a lot at first, so save it for the stadiums.'],
 'first-day':['Your first songs will not be great. That is normal: keep making them.','Sleep before 06:00, or you will start the next day tired.']};
Object.entries(TIPS).forEach(([k,v])=>{const p=byId(k);if(p)p.tips=v});

/* ===================== Screenshots: taken from the game by tools/wiki-shots.js, shown on these pages ===================== */
const FIGS={
 'first-day':[['bedroom','Your bedroom on day one: the bed, the wardrobe and the computer desk.'],['creator','The character creator at the start of a new career.']],
 saves:[['title','The main menu, where you pick a career slot.']],
 recording:[['song-menu','The Make a song screen.'],['minigame-beat','The Beat step.'],['minigame-lyrics','The Lyrics step.'],['minigame-mix','The Mix step.']],
 spotifly:[['spotifly','A new artist page on Spotifly.']],
 gear:[['gearshop','The Gearshop app on the computer.'],['music-store','The Music Store in the city.']],
 apps:[['app-barn','The App Barn, where you buy apps for the laptop.']],
 messages:[['messages','The Messages app with a few DMs from other artists.']],
 quests:[['quests','The quest log.']],
 festival:[['festival','A set at The Pit on a festival day.']],
 'festival-app':[['festivalapp','FestivalApp, for booking a slot.']],
 flights:[['swiftwing','Booking a flight in the Swiftwing app.'],['airport-outside','The airport entrance.']],
 awards:[['awards-outside','The red carpet outside the awards hall.']],
 city:[['street','A street in town.'],['map','The world map, with the taxi buttons.']],
 homes:[['home-outside','The starter house from the street.']],
 cars:[['motors','Motors, the car dealer.']],
 pets:[['pet-shop','The Pet Shop.']],
 bodyguards:[['security','The security office, where you hire guards.']],
 barbershop:[['barbershop','Choosing a cut at the barbershop.']],
 jewellery:[['jewellery','The jewellery shop counter.']],
 food:[['corner-shop','The corner shop.']],
 gphone:[['gphone','The Gphone home screen.']],
 settings:[['settings','The Graphics settings.']]};
Object.entries(FIGS).forEach(([k,v])=>{const p=byId(k);if(p)p.figs=v});

/* ===================== Secrets and credits ===================== */
page('secrets','Secrets','meta',{sum:'Things the game does not tell you.',kw:'secret code cheat hidden mystery',body:()=>`
<p class=lead>There is a secret code somewhere in WaveFern. What it is, where it goes and what it does is a mystery.</p>
<p>This wiki will not say any more than that. Good luck.</p>`});
page('credits','Credits','meta',{sum:'Who made WaveFern.',kw:'credits made by james rowan music soundtrack fl studio surge arminator tumfy name fernwave fern wave why called',body:()=>`
${IB('WaveFern','',[['Game','James Hutchinson and Rowan Burton'],['Music','Rowan Burton'],['First name','FernWave']])}
<p class=lead>WaveFern was made by James Hutchinson and Rowan Burton.</p>
${H2('Game')}<p>James Hutchinson and Rowan Burton.</p>
${H2('The name','name')}<p>WaveFern was nearly called FernWave. James forgot the name and called the game WaveFern instead (with Rowan), and WaveFern stuck.</p>
<p>The idea behind FernWave: a fern starts as a tiny curled-up shoot and slowly unfurls into something big, the way a career in the game starts with one song in your bedroom. The wave is the sound wave of the music.</p>
${H2('Soundtrack')}<p>Rowan Burton made the soundtracks in <a href="https://www.image-line.com/fl-studio/" target=_blank rel=noopener>FL Studio</a>, using its stock plugins, and <a href="https://surge-synthesizer.github.io/" target=_blank rel=noopener>Surge XT</a>, <a href="https://www.looperman.com/free-music-software/detail/krakli-software-arminator-2" target=_blank rel=noopener>Arminator 2</a> plus <a href="https://tumfy.net/" target=_blank rel=noopener>tumfy</a>'s free kits.</p>
<p>Play the whole soundtrack here. It keeps playing while you read other pages.</p>
${ostTable()}
<p>The songs you make in the game are a separate thing: see ${L('song-audio','How Spotifly songs sound')}.</p>
${H2('Built with')}<p>The game runs in any modern browser with JavaScript and WebGL, with nothing to install. Band rooms use PeerJS, and cloud saves use Google sign-in.</p>`});

/* ===================== FAQ: questions new players tend to ask, answered as pointers and advice ===================== */
const Q=(q,a)=>`<h3>${q}</h3><p>${a}</p>`;
page('faq','Frequently asked questions','start',{sum:'Quick answers to the questions players ask most.',kw:'faq help questions stuck how do i why',body:()=>`
<p class=lead>Short answers to common questions. Each one links to the page with the full details.</p>
${H2('Getting started')}
${Q('What should I do first?',`Follow Big Vee's tutorial. It walks you through your first song, your first upload and your first night. ${L('first-day','Your first day')} covers the same steps.`)}
${Q('Can I play on my phone?',`Yes. A joystick and buttons appear on phones and tablets. See ${L('controls')}.`)}
${Q('Why did I pass out?',`You were still awake at 06:00. You wake where you fell with only 70 energy, so get to bed after 20:00 instead. See ${L('days','Days, time and energy')}.`)}
${Q('I ran out of energy. What now?',`Eat something, or go to bed if it is night. Energy also comes back slowly on its own. See ${L('food','Food and energy')}.`)}
${H2('Music')}
${Q('My songs are bad. How do I make them better?',`Keep making them. You get better with every song, and gear, mentors and a good run in one genre family all add up. ${L('song-quality')} explains every part of the score.`)}
${Q('Why are my streams so low?',`New artists start small. Releasing often keeps interest up, and better songs lift everything else. See ${L('streams')}.`)}
${Q('Why did my monthly listeners go down?',`The monthly number is recounted as days pass, so a quiet spell shows up there. Keep releasing and it climbs back. See ${L('listeners','Monthly listeners and followers')}.`)}
${Q('How do I get a collab?',`Artists about your size DM you on their own, and you can message artists yourself in Messages. See ${L('collabs','Collabs')}.`)}
${Q('Can I listen to my songs?',`Yes. Each song has its own beat that plays from your Spotifly artist page. See ${L('song-audio','How Spotifly songs sound')}.`)}
${H2('Career')}
${Q('How do I get signed to a label?',`Labels only start writing from day 5, and only once your listeners, streams and reputation are high enough for them. The first offers are rarely the best ones. See ${L('labels','Record labels')}.`)}
${Q('How do I go up in fame?',`Fame follows your monthly listeners, so anything that grows your listeners grows your fame. See ${L('fame','Fame levels')} for what each level unlocks.`)}
${Q('When can I play the festival?',`A festival opens every 7th day. Book a slot in FestivalApp at least 2 days ahead. The first stage opens at Fame Level 10. See ${L('festival','Park Fields Festival')}.`)}
${Q('When can I go on tour?',`The World Tour app appears at Fame Level 275. Start saving early, because it is not cheap. See ${L('world-tour','World Tour')}.`)}
${H2('City life')}
${Q('Someone stole my money!',`Some fans asking for an autograph are thieves. Carry less cash, or hire ${L('bodyguards')}. See ${L('fans','Fans, autographs and robbery')}.`)}
${Q('How do I get around faster?',`Sprint, buy a car, or take the taxi from the map. See ${L('city','The city and the map')} and ${L('cars','Cars and the garage')}.`)}
${H2('Saves and settings')}
${Q('Is my career saved?',`It autosaves to your browser. Sign in with Google to keep it in the cloud, or export a save code from the pause menu. See ${L('saves','Saves and careers')}.`)}
${Q('My save will not load.',`It is not lost. Look under Recovered backups on the career screen. See ${L('saves','Saves and careers')}.`)}
${Q('The game is slow on my computer.',`Open Settings and pick a lower graphics preset, or leave it on Auto. See ${L('settings','Settings and graphics')}.`)}
${Q('How do I play with friends?',`Pick Multiplayer on the main menu and create or join a band room with a code. You need to be signed in with Google. See ${L('band-rooms','Band rooms')}.`)}
${H2('Other')}
${Q('Is there a cheat code?',`There is a secret code. That is all this wiki will say. See ${L('secrets')}.`)}
${Q('Who made the game?',`James Hutchinson and Rowan Burton. See ${L('credits')}.`)}
${Q('Why is it called WaveFern?',`It was nearly called FernWave, until that name was forgotten. See ${L('credits/name','The name')}.`)}`});

/* ===================== Contact: a form that sends through Web3Forms, so the address never appears on the site.
   CONTACT_KEY is the Web3Forms access key (safe to be public). While it is empty the page says the form is not open yet. */
const CONTACT_KEY='06696629-392c-46ce-8e33-57c060b74007';
page('contact','Contact','meta',{sum:'Send a message to the people who make the game.',kw:'contact email message feedback bug report help',body:()=>CONTACT_KEY?`
<p class=lead>Found a bug, got an idea, or just want to say something? Send a message to the people who make WaveFern.</p>
<form id=cform class=cform>
<label>Your name<input name=name maxlength=40 required></label>
<label>Your email <span class=m>(only if you want a reply)</span><input name=email type=email maxlength=120></label>
<label>Message<textarea name=message rows=7 maxlength=1500 required></textarea></label>
<input type=checkbox name=botcheck class=hp tabindex=-1 autocomplete=off>
<button type=submit>Send</button> <span id=cstat class=m></span>
</form>`:`<p class=lead>The contact form is not open yet. Check back soon.</p>`});
/* Contact filter: runs in the browser before anything is sent. It stops swearing, slurs, threats, links, shouting,
   gibberish and repeat sends. The word lists are base64 so the page source does not read as a list of slurs. Anyone
   determined can get round a filter in the browser; it is there to stop casual abuse, not every bad message. */
const CF_PRE=atob('ZnVja3xzaGl0fGN1bnR8Yml0Y2h8YmFzdGFyZHx3YW5rfHR3YXR8ZGlja2hlYWR8Ym9sbG9ja3xuaWdnfGZhZ2d8cmV0YXJkfHNsdXR8d2hvcmV8cHVzc3l8dHJhbm55fHNwYXN0aWN8a2lrZXxjaGlua3x3ZXRiYWNrfGR5a2V8cG9ybnxudWRlfG1vdGhlcmZ8YmVsbGVuZHxwcmljaw==').split('|'),CF_EX=atob('YXNzfGFzc2VzfGFyc2V8YXJzZWhvbGV8YXNzaG9sZXxkaWNrfGRpY2tzfHBpc3N8ZmFnfGZhZ3N8dGl0c3x0aXR0eXxib29ic3xjdW18Y29ja3xjb2Nrc3xreXN8bmF6aXxuYXppc3xoaXRsZXJ8cmFwZXxyYXBlZHxyYXBpc3R8cmFwZXN8Y29vbnxjb29uc3xzcGF6fHBha2l8cGFraXN8c2V4fHNleHl8aG9ybnl8aG9lfGhvZXN8dGhvdA==').split('|');
const CF_RE=new RegExp('\\b(('+CF_PRE.join('|')+')[a-z]*|('+CF_EX.join('|')+'))\\b');
const CF_THREAT=/\b(kill|hurt|stab|shoot|dox+)\s+(you|u|ya|yourself|urself|him|them)\b|\b(find|track)\s+(you|u)\s+(and|down)\b|\bwhere\s+(you|u)\s+live\b|\b(go|hope\s+(you|u))\s+die\b|\bdie\s+in\s+a\b|\byour\s+(address|house|home)\b/;
const CF_LINK=/(https?:|www\.|\b[a-z0-9-]+\s*\.\s*(com|net|org|io|gg|xyz|ru|co|uk|ly|me|tv|info|biz|link|site|top)\b|@[a-z0-9_]{3,}|discord\.|t\.me)/i;
const cfNorm=s=>s.toLowerCase().replace(/[0@4]/g,c=>({'0':'o','@':'a','4':'a'})[c]).replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/[5$]/g,'s').replace(/7/g,'t').replace(/(\w)[.*_-](?=\w\b)/g,'$1');
function cfCheck(name,msg){
 const all=name+' '+msg,n=cfNorm(all);
 if(name.trim().length<2)return 'Please put your name.';
 if(msg.trim().length<15)return 'Please write a little more so we know what you mean.';
 if(msg.length>1500)return 'Please keep it under 1,500 characters.';
 if(CF_RE.test(n)||CF_RE.test(n.replace(/(\w)\1+/g,'$1$1'))||CF_RE.test(n.replace(/(\w)\1+/g,'$1')))return 'Please keep it friendly. Your message has language we do not accept.';
 if(CF_THREAT.test(n))return 'Messages that sound like threats are not sent.';
 if(CF_LINK.test(all))return 'Please do not put links, handles or web addresses in your message.';
 const L=msg.replace(/[^a-z]/gi,'');
 if(L.length>15&&L.replace(/[^A-Z]/g,'').length/L.length>.7)return 'Please do not write in all capitals.';
 if(/(.)\1{5,}/.test(msg)||/[a-z]{26,}/i.test(msg)||(L.length>=20&&L.replace(/[^aeiouy]/gi,'').length/L.length<.2))return 'That looks like random letters. Please write a real message.';
 if(msg.trim().split(/\s+/).length<3)return 'Please write a few words.';
 return ''}
function cfLimit(msg){let h=[];try{h=JSON.parse(localStorage.getItem('wk_sent')||'[]')}catch(e){}
 const now=Date.now();h=h.filter(x=>now-x.t<864e5);
 if(h.length&&now-h[h.length-1].t<12e4)return 'Please wait a couple of minutes before sending another message.';
 if(h.length>=5)return 'You have sent a lot of messages today. Please try again tomorrow.';
 if(h.some(x=>x.m==msg.trim()))return 'You have already sent that message.';
 return ''}
function cfLog(msg){try{let h=JSON.parse(localStorage.getItem('wk_sent')||'[]');h=h.filter(x=>Date.now()-x.t<864e5);h.push({t:Date.now(),m:msg.trim()});localStorage.setItem('wk_sent',JSON.stringify(h))}catch(e){}}
document.addEventListener('wiki:render',e=>{if(e.detail.id!='contact')return;const f=document.getElementById('cform');if(!f)return;
 f.onsubmit=async ev=>{ev.preventDefault();const st=document.getElementById('cstat'),b=f.querySelector('button'),d=Object.fromEntries(new FormData(f));
  if(d.botcheck)return;delete d.botcheck;if(!d.email)delete d.email;
  const bad=cfCheck(d.name||'',d.message||'')||cfLimit(d.message||'');if(bad){st.textContent=bad;return}
  b.disabled=true;st.textContent='Sending...';
  try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:CONTACT_KEY,subject:'WaveFern wiki message',from_name:'WaveFern Wiki',...d})}),j=await r.json();
   if(!j.success)throw 0;cfLog(d.message);f.reset();st.textContent='Sent. Thanks for the message.'}
  catch(x){st.textContent='That did not send. Try again in a minute.'}
  b.disabled=false}});

page('song-audio','How Spotifly songs sound','music',{sum:'How the game makes a playable track for every song you record.',src:['67-beats.js','132-808-hats.js'],kw:'audio beat engine sound play listen spotifly samples 808 hi hat tumfy music',body:()=>`
${IB('Beat engine','',[['Made in','The browser, as it plays'],['Styles',Object.values(D.styles||{}).reduce((a,l)=>a+l.length,0)+' across '+(D.genres||[]).length+' genres'],['Scales','Major or minor'],['Recorded 808s',((D.drums||{}).s808||[]).length],['Recorded hi hats',((D.drums||{}).hats||[]).length]])}
<p class=lead>Every song you make has its own instrumental that you can play from your Spotifly artist page. The tracks are not stored as audio files. The game writes each one in the browser when you press play, from a few numbers saved with the song.</p>
${H2('One seed per song')}<p>When you record a song it gets a random number called a seed. The seed picks everything about the beat:</p>
${ul(['a beat style from the song\'s genre (see '+L('genres')+')','the tempo, within that style\'s range','the key, and a major or minor scale','a chord progression','which drum pattern variations play, and small changes to the drum sounds','a hook melody, made up note by note'])}
<p>The same seed always gives the same beat, so a song sounds the same every time you play it, on any device. Collabs and band songs get their own seed too.</p>
${H2('The sounds')}<p>Most of the sounds are made in code with the browser's audio engine: drums, basses, keys, plucked guitars and synths. On top of that, some sounds are recorded samples:</p>
${ul(['Melodic one-shots (keys, basses, bells, brass, plucks, flutes, strings and more). Each song picks one sample per instrument from its seed, so a bass never changes sound halfway through.','The recorded 808s and hi hats you can pick under Extras when you make a song (see '+L('extras')+').'])}
<p>Some of these sounds come from <a href="https://tumfy.net/" target=_blank rel=noopener>tumfy</a>'s free kits.</p>
${H2('Song structure')}<p>A song on Spotifly plays an intro, then verses and hooks with a short bridge, and loops after that. A festival or tour set uses a livelier order that gets to the hook sooner, and a recording session plays a short version under the minigames.</p>
${H2('Where you hear it')}${ul(['Under the minigames while you record','On your Spotifly artist page, with the play button on each song','During festival sets and tour shows, where each song in the setlist plays its own beat'])}
<p>The background music you hear while walking around is different: that is the game's soundtrack, made by Rowan Burton (see ${L('credits')}).</p>`});
