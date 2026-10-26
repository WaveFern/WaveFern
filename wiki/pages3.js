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
<p class=lead>Buy furniture on <b>Amazoom</b> (a $250 app). It arrives in Storage. At home press ${K('F')} to open Storage and build mode: place, move and rotate (${K('R')}) pieces.</p>
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

page('instagrime','Instagrime','life',{e:'📸',sum:'Posting, followers and promotions.',src:['16-big-world-fame-chat-instagrime-v2.js','103-instagrime-icons-trees.js','83-promotions.js'],kw:'instagrime post followers feed photo',body:()=>`
<p class=lead>Instagrime is a $400 app. Post once a day for 2-8 new followers. Photos from your ${L('gphone','Gphone')} camera can be posted too, for more followers with a better phone. ${L('promotions','Promotions')} are bought here.</p>`});

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
<p>Data snapshot: game ${esc(D.version||'?')}. Formulas are written out by hand from the code: each page links the files it comes from.</p>`});
