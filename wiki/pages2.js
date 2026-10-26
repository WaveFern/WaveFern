/* WaveFern Wiki pages, part 2: Career, Live and touring. */
const tierLv=i=>i<0?'':'Lv '+((D.fame&&D.fame.ftl)||[])[i];

/* ===================== Career ===================== */
page('money','Money','career',{e:'💵',sum:'Every way to earn and spend money.',src:['29-v26.js','02-data.js'],kw:'cash earn income spend pay',body:()=>`
<p class=lead>You start with $100. Most of your income comes from streams, paid every morning.</p>
${H2('Earning')}${T(['Source','How much'],[[L('streams','Streams'),'$'+(D.tune||{}).payRate+' per stream, paid each morning (minus a label\'s cut)'],[L('collabs','Collabs they pay for'),'What you agree in Messages'],[L('festival','Festival sets'),'$0.08 × stage multiplier × crowd, after every song'],[L('world-tour','Tour shows'),'Tickets sold × (ticket price × 0.05 + 1)'],[L('labels','Signing with a label'),'A one-off advance'],[L('quests','Quests'),'Daily and weekly rewards'],[L('fans','Autographs'),'A small tip when a fan stops you'],[L('first-day','Tutorial'),'$150 gift plus small step rewards']])}
${H2('Spending')}<p>${[L('gear'),L('collabs'),L('promotions'),L('radio'),L('cars'),L('homes'),L('furniture'),L('clothes'),L('barbershop'),L('pets'),L('bodyguards'),L('jewellery'),L('food'),L('gphone','phones'),L('apps'),L('flights'),L('world-tour')].join(' · ')}</p>
${N(`Carrying lots of cash in the street can get you robbed. See ${L('fans','Fans and robbery')}.`,'warn')}`});

page('gear','Studio gear','career',{e:'🎛️',sum:'Every piece of studio gear, its levels, prices and what it adds.',src:['02-data.js','52-gear-shop-plus.js','101-economy-labels.js'],kw:'gear mic chair guitar keyboard drums booth promo decks headphones interface monitors synth shop',body:()=>{const g=D.gear||[],cats=D.gcat||[],by=k=>g.find(x=>x.k==k);
 return `<p class=lead>Gear is bought on the laptop (Shop). Each item has 3 upgrades. Prices grow 6× per level, and the effect grows with it. Some upgrades only unlock at a fame level.</p>
${FX('price of level n = base × 6^(n − 1)')}
${cats.map(([t,ks])=>H2(t)+T(['Gear','Effect','Levels','Price per level','Unlocks'],ks.map(by).filter(Boolean).map(x=>[`<b>${x.n}</b><br><small class=m>${esc(x.d)}</small>`,x.q?`+${x.q} quality / level`:x.s?`+${pct(x.s,1)} streams / level`:'',x.lv.map((l,i)=>i?`${i}. ${esc(l)}`:`<span class=m>${esc(l)}</span>`).join('<br>'),['<span class=m>owned</span>'].concat(x.c.map(c=>$$(c))).join('<br>'),[''].concat(x.fl?x.fl.map(f=>tierLv(f)):x.c.map(()=>'')).join('<br>')]))).join('')}
${N(`Quality points are multiplied by your ${L('song-quality/experience','experience')}, so gear pays off more as you make more songs.`)}`}});

page('fame','Fame levels','career',{e:'🌟',sum:'All 350 fame levels, fame tiers and what each level unlocks.',src:['16-big-world-fame-chat-instagrime-v2.js','136-fame-350.js'],kw:'fame level tier unlock listeners bling',body:()=>{const s=(D.fame||{}).starts||[],ftl=(D.fame||{}).ftl||[],ft=(D.fame||{}).ft||[];
 const mile=[[1,'Start'],[ftl[0],'Fame tier 1'],[10,'Fresh Fern Tent (festival)'],...(D.stages||[]).slice(1).map(x=>[x.req,x.n+' (festival)']),[D.awards&&D.awards.need,'Gramophone Awards'],[275,'World Tour app'],[350,'Max level']].filter(x=>x[0]);
 const step=[1,2,3,4,5,10,15,20,25,30,40,50,60,70,80,90,100,120,140,160,180,200,225,250,275,300,325,350];
 return `${IB('Fame','🌟',[['Levels',s.length-1],['Level 275',fmt(s[274])+' listeners'],['Level 350',fmt(s[349])+' listeners'],['Tiers',ft.length]])}
<p class=lead>Your fame level comes from your ${L('listeners','monthly listeners')}. ${L('jewellery','Jewellery')} makes you look more famous: each piece adds 8%.</p>
${FX('fame value = monthly listeners × (1 + 0.08 × pieces of jewellery)')}
<div class=bars title="Listeners needed per level (log scale)">${s.slice(0,350).filter((_,i)=>i%7==0).map(v=>`<i style="height:${(Math.log10(Math.max(1,v))/Math.log10(s[349])*100).toFixed(1)}%"></i>`).join('')}</div>
<p class=m><small>Listeners needed per level, on a log scale, level 1 to 350.</small></p>
${H2('Milestones')}${T([['Level','n'],['Listeners','n'],'Unlocks'],mile.map(([l,t])=>[l,[fmt(s[l-1]),s[l-1]],t]).sort((a,b)=>a[0]-b[0]))}
${H2('Fame tiers','tiers')}<p>Tiers are the big steps. Each tier multiplies a song's daily streams by 1.5 and raises its stream cap, and some gear, guards and shops unlock by tier.</p>
${T([['Tier','n'],['Listeners','n'],['Fame level','n']],ft.map((v,i)=>[i+1,[fmt(v),v],ftl[i]]))}
${H2('Every level','all')}${T([['Level','n'],['Listeners from','n']],step.map(l=>[l,[big(s[l-1]),s[l-1]]]).concat([]),{})}
<details><summary class=btn>Show all ${s.length-1} levels</summary>${T([['Level','n'],['Listeners from','n']],s.slice(0,350).map((v,i)=>[i+1,[big(v),v]]),{filter:1,tall:1})}</details>`}});

page('mentors','Mentors','career',{e:'🧑‍🏫',sum:'Legends who unlock as you grow and add song quality.',src:['02-data.js','06-computer.js'],kw:'mentor legends michael jackson prince dolly dre hendrix',body:()=>`
<p class=lead>Mentors are fictional takes on music legends. Each one unlocks when you reach their monthly listeners and gives +2 quality to every song (and 8 experience). See them on the laptop under Legends.</p>
${T([['Listeners','n'],'Mentor','Advice'],(D.mentors||[]).map(m=>[m[0],m[1],'<i>'+esc(m[2])+'</i>']))}`});

page('labels','Record labels','career',{e:'🏷️',sum:'Label offers, advances, cuts and leaving.',src:['101-economy-labels.js','106-label-hq-soon.js'],kw:'label record deal sign advance cut contract',body:()=>`
${IB('Labels','🏷️',[['First offer','Day 5'],['Offer chance','20% a day'],['Same label again','After 20 days'],['Leave fee','30% of advance'],['After leaving','No offers for 14 days']])}
<p class=lead>Labels message you with an offer when your monthly listeners, total streams and reputation all reach their thresholds. Signing pays an advance up front; from then on the label keeps a cut of your streaming income every night.</p>
${T(['Label','Quality',['Listeners','n'],['Total streams','n'],['Reputation','n'],['Advance','n'],['Cut','n']],(D.labels||[]).map(l=>[`<b>${esc(l.n)}</b><br><small class=m>${esc(l.pitch)}</small>`,'★'.repeat(Math.max(1,Math.round(l.q*5)))+'☆'.repeat(5-Math.max(1,Math.round(l.q*5))),[fmt(l.ml),l.ml],[fmt(l.st),l.st],[l.rep<-50?'any':l.rep,l.rep],[$$(l.adv),l.adv],[pct(l.cut),l.cut]]))}
${H2('Rules')}${ul(['Offers start on day 5, once you have released a song. Each day there is a 20% chance one eligible label writes; the same label waits 20 days before asking again.','Only one offer is open at a time.','Leaving a label costs 30% of the advance you got, and no label writes for 14 days afterwards.'])}
${N('The Label HQ app is "coming soon". Offers, advances and cuts already work.','','Label HQ')}`});

page('quests','Quests','career',{e:'📋',sum:'Daily and weekly quest sets and their rewards.',src:['133-quests.js'],kw:'quest daily weekly goal reward',body:()=>{const r=l=>Math.max(5,Math.round(30*Math.pow(1.04,l)/5)*5);
 return `<p class=lead>The Quests app (preinstalled on the laptop) gives you 3 daily quests and 3 weekly quests. Finish the whole set to get paid. Quests are rolled once and saved, so reloading never changes them.</p>
${FX('daily reward  = $30 × 1.04^fame level   (rounded to $5)\nweekly reward = 10 × the daily reward')}
${T([['Fame level','n'],['Daily set','n'],['Weekly set','n']],[0,10,25,50,100,150,200,275,350].map(l=>[l,[$$(r(l)),r(l)],[$$(r(l)*10),r(l)*10]]))}
${H2('Daily quests')}${ul(['Record 2-4 songs (more at fame 10 and 30)','Release 1-3 songs','Release a song at or above your recent average quality + 3','Post on Instagrime','Send 4 messages','Walk or run 400-700 m'])}
${H2('Weekly quests')}${ul(['Get 35% more streams than last week','Earn 35% more from music than last week','Gain 35% more followers than last week','Release 5-9 songs','Record 12-18 songs','Release 3 songs at your recent average quality + 6','Release an album','Post on Instagrime on 5 different days','Walk or run 3,000-6,000 m'])}
<p>Weeks run day 1-7, 8-14 and so on. The night after a day still counts for that day, so overnight streams land in the right week. Each set never has two quests of the same kind.</p>`}});

page('awards','Gramophone Awards','career',{e:'🏆',sum:'Submit a song, beat the stars, win a trophy.',src:['110-awards.js'],kw:'awards gramophone trophy song of the year',body:()=>{const a=D.awards||{};
 return `${IB('Gramophone Awards','🏆',[['Needs','Fame Level '+a.need],['Cooldown',a.cool+' days'],['Category','Song of the Year'],['Prize','Gramophone Trophy']])}
<p class=lead>The awards hall stands at the end of your street. From Fame Level ${a.need} you can check in (once every ${a.cool} days), submit one song, and watch the ceremony.</p>
${H2('How to win')}<p>You're up against four of these 16 stars. Only the single highest score wins. Their scores move a little each year.</p>
${FX('your score = song quality + min(25, 5 × log10(1 + streams ÷ 1000))')}
${T(['Star',['Score','n'],'Nominated song'],(a.pool||[]).map(p=>[esc(p[0]),p[1],'<i>'+esc(p[2])+'</i>']))}
<p>A win puts a Gramophone Trophy in your Storage: furniture that isn't sold anywhere.</p>`}});

page('reputation','Reputation','career',{e:'🎖️',sum:'What raises and lowers your reputation, and what it does.',src:['75-collab-fees-dms.js','71-festival-booking.js','21-v7-albums-rivals-instagrime-profiles-sit.js'],kw:'rep reputation',body:()=>`
<p class=lead>Reputation is a hidden score that starts at 0.</p>
${H2('What changes it')}${T(['Event','Change'],[['A rival answers your diss track','−2 to +3'],['Cancelling a festival booking less than 2 days before','−2'],['Missing your festival slot','−3'],['Selfie with an artist on a Gphone 12 or newer','+1']])}
${H2('What it does')}${ul(['Collab fees: 1% cheaper per point (up to 10%).','DMs: 3% more likely per point, and bigger artists reach out more.',`Bigger ${L('labels')} need a minimum reputation.`])}`});

page('rivals','Rivals','career',{e:'⚔️',sum:'The rival artists you can diss.',src:['21-v7-albums-rivals-instagrime-profiles-sit.js'],kw:'rival diss beef',body:()=>`
<p class=lead>You can make a ${L('extras/diss','diss track')} about any of these rivals.</p><p>${(D.rivals||[]).map(r=>tag(esc(r))).join(' ')}</p>`});

page('radio','Radio and TV','career',{e:'📻',sum:'Buy airtime for a burst of interest and followers.',src:['16-big-world-fame-chat-instagrime-v2.js'],kw:'radio station tv airtime',body:()=>`
<p class=lead>The Radio Station sells airtime. Each slot raises interest (which lifts every song's daily streams) and brings followers.</p>
${T(['Slot',['Price','n'],['Interest','n'],['Followers','n']],(D.radio||[]).map(r=>[r.n,[$$(r.p),r.p],['+'+pct(r.interest),r.interest],['+'+big(r.fol),r.fol]]))}`});

page('billboards','Billboards','career',{e:'🪧',sum:'When your name goes up beside the main roads.',src:['81-billboards.js'],body:()=>`
<p class=lead>Billboards beside the main roads rotate every 10 seconds through roster artists with 5,000+ monthly listeners. Once you reach 10,000 monthly listeners, your own name joins the rotation.</p>`});

/* ===================== Live ===================== */
page('festival','Park Fields Festival','live',{e:'🎪',sum:'The weekly festival: stages, crowds, pay and crowd minigames.',src:['70-festival.js','71-festival-booking.js'],kw:'festival stage crowd tent pit riverside main stage set',body:()=>`
${IB('Park Fields Festival','🎪',[['When','Every 7th day'],['Where','The field east of Park Avenue'],['Book','FestivalApp, 2+ days ahead'],['Set','Up to 4 hours'],['Energy','15 per set'],['Pay per song','$0.08 × stage × crowd']])}
<p class=lead>A festival opens on every day that is a multiple of 7 (day 7, 14, 21...). The day before, a crew builds it; the day after, they take it down.</p>
${H2('Stages')}${T(['Stage',['Fame level','n'],['Pay','n'],['Base crowd','n'],['Max crowd','n']],(D.stages||[]).map(s=>[s.n,s.req,mul(s.mult),big(s.base),big(s.cap)]))}
${H2('Crowd and pay')}${FX(`crowd = min(max, base × 1.055^(your level − stage level))
        × (0.9 + min(0.2, average quality ÷ 400))  × 1.15 for a collab song
pay after each song = $0.08 × stage multiplier × crowd
streams   = crowd × 0.1   × (0.5 + minigame score)
followers = crowd × 0.015 × (0.5 + minigame score)`)}
${H2('Crowd minigames')}<p>Short games pop up between songs. Score 75% or more and the crowd grows; under 50% and people leave.</p>
${T(['Minigame','Prompt'],Object.entries(D.fmg||{}).map(([k,v])=>[k,v]))}
${H2('Food and drink')}<p>Festival stalls charge about 1.4× normal prices. Food gives energy; drinks also refill stamina.</p>
${T(['Stall','Type','Menu (price / energy)'],(D.fests||[]).map(f=>[esc(f.n),f.kind,f.menu.map(m=>`${esc(m[0])} <span class=m>$${m[1]} / +${m[2]}${m[3]?' · stamina':''}</span>`).join('<br>')]))}`});

page('festival-app','FestivalApp and bookings','live',{e:'🗓️',sum:'Booking a slot and planning a setlist.',src:['71-festival-booking.js'],kw:'festivalapp booking slot setlist cancel',body:()=>`
<p class=lead>FestivalApp is free and installed for you. Pick a festival, a stage your fame allows and a free slot.</p>
${T(['Slot','Time'],(D.slots||[]).map((s,i)=>{const h=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':00';return['Slot '+(i+1),h(s[0])+' to '+h(s[1])]}))}
${ul(['Book at least 2 days before the festival. Booking is free.','Other acts have already taken some slots; at least one per stage is always left free.','Build a setlist from released songs and whole albums. Each song lasts 30-55 in-game minutes, so 4-8 songs fill a slot. The setlist can\'t go over 4 hours.','Editing or cancelling is free while the festival is 2+ days away. Cancelling later costs 2 reputation.','On the day, be at your stage\'s steps during your slot. Miss it and the slot is given away, and you lose 3 reputation.'])}`});

page('flights','Flights and the airport','live',{e:'✈️',sum:'Swiftwing Airways: booking, check-in, security and boarding.',src:['138-flights.js','139-airport.js','137-travel.js','135-destinations.js'],kw:'flight airport swiftwing plane gate boarding check in ticket travel',body:()=>`
${IB('Swiftwing Airways','✈️',[['Flights','One a day per route'],['Departures','07:00 to 23:30'],['Book','Up to 3 days ahead'],['Refund','70% if cancelled 2h+ ahead'],['Gates','1 to 6']])}
<p class=lead>Swiftwing is the game's airline. Book from the Swiftwing app (computer or Gphone) or at the ticket desk in any airport. Fernfield International is at the far west end of Fern Road.</p>
${H2('Fares and flight times')}${FX(`flight time = max(2, round(km ÷ 800 + 0.7)) hours
fare        = round((180 + km × 0.11) ÷ 10) × 10, varying a little day to day`)}
${H2('The rules')}${T(['Step','When'],[['Book','Until 60 minutes before departure, up to 3 days ahead'],['Check in','24 hours to 45 minutes before (app or a check-in desk)'],['Security','Needs a boarding pass'],['Boarding','Opens 2 hours before at the gate'],['Gate closes','10 minutes before departure: the ticket is lost'],['Cancel','More than 2 hours before, for a 70% refund']])}
${H2('The flight')}<p>At your gate press ${K('E')} at the door, take your marked seat and the plane leaves. The clock moves on by the flight time. A flight that runs past 06:00 counts as your night's sleep.</p>
${N('Stranded abroad with no money? Swiftwing gives you a free seat home.','tip')}`});

page('world-tour','World Tour','live',{e:'🌍',sum:'Planning a tour of up to 5 stops, and how shows pay.',src:['146-world-tour.js','135-destinations.js'],kw:'world tour app stadium stop destination',body:()=>`
${IB('World Tour','🌍',[['Unlocks','Fame Level 275'],['Price','$250,000 once'],['Stops','Up to 5'],['Songs per stop','Up to 12'],['Venue cooldown','14 days'],['Shows','One a day']])}
<p class=lead>The World Tour app appears in the App Barn at Fame Level 275. It costs $250,000 once. Plan on its world map: click a continent, then a country, then add its stops, up to 5. Each stop gets a setlist (songs or a whole album). Then book ${L('flights')} and fly there.</p>
${H2('How a show pays')}${FX(`fill       = clamp(0.55 + 0.012 × levels above the venue's + 0.25 × preparation, 0.3, 1)
attendance = capacity × fill × (0.7 + 0.3 × show score)
money      = attendance × (ticket price × 0.05 + 1)
followers  = attendance × 0.12 × (0.5 + score)
streams    = attendance × 18   × (0.5 + score)   (to the songs you played)`)}
${H2('Destinations','destinations')}<p>Every destination has a stadium (or big venue) and a club. Home is UTC−5.</p>
${T(['City','Country',['Time','n'],['Flight','n'],['Fare','n'],'Venue',['Cap','n'],['Fame','n'],['Ticket','n'],'Club',['Cap','n'],['Fame','n']],(D.dest||[]).map(d=>[esc(d.city||d.country),esc(d.country),[(d.tz>=0?'+':'')+d.tz+'h',d.tz],[d.hrs+'h',d.hrs],[$$(d.fare),d.fare],esc(d.venue.n),[fmt(d.venue.cap),d.venue.cap],d.venue.fame,[$$(d.venue.tix),d.venue.tix],esc(d.club.n),[fmt(d.club.cap),d.club.cap],d.club.fame]),{filter:1,tall:1})}`});

page('tour-shows','Stadium and club shows','live',{e:'🏟️',sum:'Rehearsing, production, talking to the crowd and the show score.',src:['151-tour-shows.js'],kw:'stadium club show rehearse production pyro lasers confetti dancers encore',body:()=>{const p=D.prod||{};
 return `<p class=lead>In each tour city the stadium is on the plaza and the club downtown. Walk in, plan the show in the dressing room, then play it.</p>
${H2('Before the show')}${ul(['Setlist: starts from your World Tour plan for that stop, or your top songs. The last song is the encore.','Rehearse up to 2 times a day: you need 20 energy and it uses 8.','A show needs 25 energy and must start between 12:00 and 02:00.'])}
${H2('Production')}${T(['Stadium extra',['Price','n']],(p.venue||[]).map(x=>[x[1],[$$(x[2]),x[2]]]))}${T(['Club extra',['Price','n']],(p.club||[]).map(x=>[x[1],[$$(x[2]),x[2]]]))}
${H2('Show score')}${FX('score = 0.12 + 0.5 × minigames + 0.18 × crowd hype + 0.1 × song quality + 0.05 × rehearsals (max 2) + production')}
<p>Between songs you talk to the crowd. Greeting them in the local language works best (+0.16 hype). A stadium show has an intermission and an encore and runs 6-10 in-game hours.</p>`}});

page('tour-cities','Tour cities','live',{e:'🗼',sum:'Walking around abroad: landmarks, hotels, street food and souvenirs.',src:['150-tour-cities.js','152-tour-city-life.js','160-tour-shop-menus.js'],kw:'city abroad landmark selfie hotel souvenir street food',body:()=>{const sf=D.streetFood||{};
 return `<p class=lead>Every destination becomes a city you can walk around when you land: signs in the local language, its own colours and traffic, an airport, a hotel, shops, a club and a stadium.</p>
${ul(['<b>Landmark selfie</b>: once a day per city, for 30 + √listeners × 0.25 followers and an Instagrime post.','<b>Hotel</b>: check in at reception and sleep in your room. You wake up there.','<b>Shops</b>: restaurants, cafés, convenience stores, souvenir shops (postcards, snow globes, T-shirts, fridge magnets) and record shops.'])}
${H2('Street food')}<p>Food stalls sell local dishes by language. Drinks also refill stamina.</p>
${T(['Language','Menu (price / energy)'],Object.entries(sf).map(([k,v])=>[k,v.map(m=>`${esc(m[0])} <span class=m>$${m[1]} / +${m[2]}</span>`).join(' · ')]))}`}});
