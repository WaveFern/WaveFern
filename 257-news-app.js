/* ===== v55.52.2x (held): News app (laptop + phone) =====
   A preinstalled news app, "Fern Times". Every story is made from the day number and the career, so nothing new is saved:
   music news (your albums and songs, diss tracks and replies from S.news, rivals from S.rvl, the album chart) mixed with
   world, sport, culture, tech, business and science stories from invented places and teams. Today's stories come first,
   older days load as you scroll (shared infinite-scroll helper FWINF, also used by 258-instagrime-more.js).
   Reused: S.news / igzDiss (diss news), S.rvl.rv (rivals), RVN + ART (artist names), igzRng/igzF, postPic (story pictures), lk (looks),
   the Calendar app's preinstalled-app and phone-app wiring. State: none saved (S.apps.news=1 like Calendar).
   Held: HELD=true keeps it dev-only (window.FW_DEV) until release day, then set HELD=false. */
(function(){
const HELD=true;
if(HELD&&!window.FW_DEV)return;
const CATS=[['top','Top stories'],['music','Music'],['world','World'],['sport','Sport'],['culture','Culture'],['tech','Tech'],['biz','Business'],['sci','Science']],
 CN=Object.fromEntries(CATS),CC={music:'#d6322b',world:'#1f5fbf',sport:'#1c8a4c',culture:'#8a3fb0',tech:'#0f8a9a',biz:'#b87408',sci:'#4a5bd0'},
 KIND={music:['stage','studio','album'],world:['city'],sport:['park'],culture:['stage','city'],tech:['home','studio'],biz:['city'],sci:['park']};
const N={tab:'top',open:null,days:2,ctx:'pc'};
const rng=s=>igzRng(s),pk=(a,r)=>a[Math.floor(r()*a.length)%a.length],fmt=n=>igzF(Math.max(0,Math.round(n)));
const hsh=s=>{let h=0;for(const c of String(s))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return h};
/* ---------- invented world ---------- */
const TOWN=['Port Marlow','Dunmere','Kestrel Bay','Ashford Reach','Lumen City','Hollow Quay','Brightwater','Old Fennick','Saltmarsh','Cinder Hill','North Orrin','Velvet Cove'],
 TEAM=['Pigeons','Kings','Herons','Foxes','Sharks','Comets','Anchors','Otters','Wolves','Rockets','Bears','Gulls'],
 SPORT=['football','basketball','hockey','baseball','rugby','volleyball'],
 NAME1=['Ava','Noah','Mira','Theo','Lena','Omar','Iris','Jonas','Priya','Mateo','Zoe','Kofi','Hana','Luca','Nadia','Felix'],
 NAME2=['Okafor','Lindqvist','Moreau','Castellano','Nakamura','Reyes','Haldane','Brightman','Varga','Osei','Petrov','Quinn','Salazar','Tanaka'],
 THING=['Fernphone','Aero','Pixel Loop','Orbit','Nimbus','Glow','Halo','Tidal'],
 FILM=['The Last Lighthouse','Soup Wars','Midnight Tram','Paper Moon Hotel','Gone Fishing (Again)','A Very Quiet Heist','Velvet Thunder','The Pigeon Protocol','Seven Winters Left','Neon Orchard'],
 BOOK=['The Salt Archive','Ten Thousand Mornings','Cartographers of Nothing','How To Be Loud','The Clockmaker\'s Daughter','Small Gods of Brooklyn Street'],
 WORD1=['Midnight','Velvet','Concrete','Golden','Paper','Neon','Static','Honey','Glass','Electric','Tangerine','Quiet'],
 WORD2=['Hearts','Gardens','Season','Letters','Oceans','Machines','Mornings','Static','Weather','Rooms','Fever','Echoes'];
const person=r=>pk(NAME1,r)+' '+pk(NAME2,r),town=r=>pk(TOWN,r),team=r=>pk(TOWN,r)+' '+pk(TEAM,r);
const album=r=>pk(WORD1,r)+' '+pk(WORD2,r);
const artists=()=>{const o=[];try{if(typeof RVN!='undefined')o.push(...RVN)}catch(e){}try{if(typeof ART!='undefined'&&Array.isArray(ART))ART.forEach(a=>{if(a&&a[0]&&!a[8])o.push(a[0])})}catch(e){}return o.length?o:['Vex Valentine','Kid Kaboom','Nyla Knox']};
const me=()=>S.artist||'You';
/* ---------- story templates: each returns {h,dek,p[]} ---------- */
const T={
 world:[r=>{const a=town(r),c=r()<.5?'bike lanes':'free tram rides';return{sc:[['townhall']],h:a+' votes to build '+(r()<.5?'a floating park':'twelve miles of '+c),dek:'Council backs the plan 9 to 4 after a loud public meeting.',p:['Residents of '+a+' packed the town hall on Tuesday night, and by the end most of them had changed their minds.','The plan, first floated three years ago, will cost about $'+(40+Math.floor(r()*60))+' million and open in stages.','Mayor '+person(r)+' called it "the biggest thing '+a+' has done since we got a second bakery".']}},
  r=>{const a=town(r),b=town(r);return{sc:[['city','Harbour']],h:'Ferry between '+a+' and '+b+' returns after a long break',dek:'The crossing was suspended for months. Locals brought snacks.',p:['The first sailing left '+a+' at dawn with every seat taken and a brass band on the pier.','Travel time drops from three hours by road to forty minutes by water.','Operators say a night service is planned for the summer.']}},
  r=>{const a=town(r);return{sc:[['park','Beach'],['city','Market']],h:'Heatwave grips '+a+', ice cream stocks run low',dek:'Shops report record sales and a national shortage of cones.',p:['Temperatures in '+a+' passed '+(34+Math.floor(r()*6))+' degrees for the fourth day running.','One vendor said she sold a month of stock in a weekend and is now selling "just the cone, with hope".','Forecasters expect relief by Thursday.']}},
  r=>{const a=town(r),n=2+Math.floor(r()*5);return{h:'Lost cat walks '+n+' miles home to '+a+' and is a local hero',dek:'Microchip scanner confirms the story. The cat is unavailable for comment.',p:['"Biscuit" went missing in the spring and turned up on her own doorstep, a little thinner and very smug.','Vets say the journey is unusual but not impossible.','The town has since voted to put her on a stamp.']}},
  r=>{const a=town(r);return{sc:[['townhall']],h:'Elections in '+a+': a record turnout and one very long queue',dek:'Polling stations stayed open late for the third time this decade.',p:['More than '+(60+Math.floor(r()*25))+' percent of voters took part, the highest since records began.','Volunteers handed out tea to anyone waiting past eight.','Results are expected by morning.']}}],
 sport:[r=>{const a=team(r),b=team(r),x=Math.floor(r()*4)+1,y=Math.floor(r()*3);return{sc:[['pitch'],['stage','Stadium']],h:a+' beat '+b+' '+(x+y>=3?x+'-'+y:'1-0')+' in a thriller',dek:'A late goal settles the derby in front of a sold-out crowd.',p:['It looked like a draw until the 89th minute, when '+person(r)+' pounced on a loose ball and made no mistake.','"I just closed my eyes and kicked it," the match-winner said afterwards. "Best decision of my life."','The result lifts '+a+' to second in the table.']}},
  r=>{const a=person(r);return{sc:[['stage','Stadium']],h:a+' smashes the national record in the '+pk(['100m','pole vault','200m freestyle','long jump','5000m'],r),dek:'The crowd stood for a full minute after the result went up.',p:[a+', 22, crossed the line in a time nobody in the stadium expected, least of all '+a+'.','The previous record had stood for eleven years.','A homecoming parade is already being planned.']}},
  r=>{const a=team(r),s=pk(SPORT,r);return{sc:[['pitch'],['court']],h:a+' sack their coach after '+(3+Math.floor(r()*6))+' straight losses',dek:'The club says it wants "a fresh voice and fewer own goals".',p:['The decision came an hour after the latest defeat, a '+pk(['4-0','3-1','2-0'],r)+' home loss in the '+s+' league.','Fans gathered outside the ground, half cheering and half asking for refunds.','An interim manager will take training on Monday.']}},
  r=>{const a=person(r);return{sc:[['court']],h:'Underdog '+a+' wins the '+town(r)+' Open',dek:'Ranked 212th in the world, now holding the trophy and not sure where to put it.',p:['The final went to a tie-break and then another tie-break.','"I forgot to be nervous, then remembered, then it was over," '+a+' said.','The prize is $'+(50+Math.floor(r()*150))+',000.']}}],
 culture:[r=>{const f=pk(FILM,r);return{sc:[['cinema']],h:'"'+f+'" tops the box office for a second weekend',dek:'Critics are divided. Audiences are not.',p:['The film took $'+(20+Math.floor(r()*70))+' million, narrowly beating a sequel nobody asked for.','Our reviewer gave it four stars and said "the soundtrack alone is worth the popcorn".','A follow-up has been confirmed.']}},
  r=>{const b=pk(BOOK,r);return{sc:[['album','Poster wall'],['home','Reading nook']],h:'"'+b+'" is the book everyone is pretending they finished',dek:'Sales are up '+(120+Math.floor(r()*300))+' percent since a viral review.',p:['Bookshops across the country report empty shelves and long waiting lists.','The author, '+person(r)+', says they wrote it "on trains, mostly, and one terrible boat".','Film rights are said to be under discussion.']}},
  r=>{const a=town(r);return{sc:[['fit','Graffiti wall'],['city','Neon alley']],h:'Street art festival turns '+a+' into an open-air gallery',dek:'Forty murals in four days. One wall was painted by a seven-year-old and is the best of the lot.',p:['Artists from nine countries took over the old harbour district.','The festival expects '+(30+Math.floor(r()*60))+',000 visitors across the weekend.','Entry is free and the food trucks are not.']}},
  r=>{const f=pk(FILM,r);return{sc:[['cinema'],['home','Reading nook']],h:'Streaming show "'+f+'" gets a surprise third season',dek:'The finale left everyone shouting at their screens.',p:['Producers confirmed the news in a one-line post that has now been shared several million times.','Cast members were told "about eleven minutes before you were".','Filming starts in the autumn.']}}],
 tech:[r=>{const t=pk(THING,r)+' '+(4+Math.floor(r()*9));return{h:t+' launches with a battery that "actually lasts"',dek:'Reviewers report three days per charge and one weirdly good speaker.',p:['The new model keeps the design of last year\'s and quietly fixes everything people complained about.','It costs $'+(399+Math.floor(r()*500))+' and ships next month.','Our test: it survived a drop, a spill and a toddler.']}},
  r=>{return{h:'A chatbot wrote this headline, we promise it did not',dek:'A survey says '+(40+Math.floor(r()*40))+' percent of people now ask an assistant before they ask a friend.',p:['Researchers found the habit is strongest among under-30s and people who are lost.','Privacy groups want clearer labels on what these tools remember.','Meanwhile one company is selling a smart toaster that apologises.']}},
  r=>{const t=pk(THING,r);return{h:t+' app hits '+(10+Math.floor(r()*90))+' million downloads in a week',dek:'The free app lets you rate your own sandwiches. It is more addictive than it sounds.',p:['Developers say they built it in a month, mostly over lunch.','Critics have called it "pointless, perfect".','An update with dark mode lands on Friday.']}},
  r=>{const a=town(r);return{sc:[['city','Roof night']],h:'Delivery drones begin flying over '+a+' this week',dek:'Pizza, parcels and one confused seagull.',p:['The trial covers a three-mile zone and aims to deliver in under ten minutes.','Residents can opt out. Several already have.','The operator promises a quiet hum "about as loud as a sleepy bee".']}}],
 biz:[r=>{const a=pk(THING,r);return{h:a+' shares jump '+(4+Math.floor(r()*12))+'% after a strong quarter',dek:'The company beat forecasts and promised a bigger dividend.',p:['Investors were pleased with sales growth in three regions.','The chief executive said the secret was "listening and also not panicking".','Analysts now expect another good quarter.']}},
  r=>{const a=town(r);return{sc:[['city','Roof night'],['city','Street']],h:'Rents in '+a+' fall for the first time in four years',dek:'A wave of new flats opens, and landlords are suddenly very friendly.',p:['Average rents dropped '+(1+Math.floor(r()*4))+' percent over the quarter.','Tenant groups call it "a good start, not a finish".','More buildings are due next spring.']}},
  r=>{return{h:'Coffee prices climb again as the harvest falls short',dek:'Your flat white is about to cost a little more.',p:['Growers blame a cold spring followed by a very wet summer.','Roasters say they will try to absorb the rise "for as long as we can bear it".','Tea sellers are quietly delighted.']}}],
 sci:[r=>{return{sc:[['lab']],h:'Scientists discover a deep-sea fish that glows in '+pk(['three colours','pink','a pattern that looks like Morse'],r),dek:'It was found 4,000 metres down and is very rude about it.',p:['The team filmed the animal for eleven minutes before it swam off.','Researchers believe the glow helps it find mates in the dark.','The species has been named after the ship\'s cook.']}},
  r=>{return{sc:[['observatory']],h:'A new telescope spots a planet that "could have weather"',dek:'It sits '+(20+Math.floor(r()*80))+' light years away. Do not pack yet.',p:['Astronomers say the planet is rocky and about the size of ours.','Whether it has water is "a question for next year\'s data".','The telescope also found a dozen smaller worlds nobody expected.']}},
  r=>{return{sc:[['park','Blossom'],['park','Lake dock']],h:'Study: a ten-minute walk after lunch really does help',dek:'Researchers tracked '+(1+Math.floor(r()*9))+',000 people for two years.',p:['Walkers reported better mood, better sleep and fewer afternoon slumps.','The effect was strongest in people who did not think they would like it.','The authors suggest "a loop, a podcast, a snack".']}}],
 fillMusic:[r=>{const a=pk(artists(),r),b=album(r);return{h:a+' announces a surprise tour for '+(r()<.5?'next spring':'the summer'),dek:'Tickets for '+b+': Live go on sale Friday at ten.',p:['The tour will visit '+(8+Math.floor(r()*30))+' cities and end with a hometown show.','Fans queued online for hours when the news broke.','Supporting acts will be announced next week.']}},
  r=>{const a=pk(artists(),r),b=album(r);return{sc:[['album','Listening party'],['studio','Control room']],h:'Review: '+a+' "'+b+'" is the album of the month',dek:'Four and a half stars for a record that "refuses to sit still".',p:['The opener sets the tone, a slow build into a chorus you will be humming at the bus stop.','Production is crisp, the lyrics are funnier than you expect, and the closing track is a gut punch.','It is out now on all services.']}},
  r=>{const a=pk(artists(),r);return{h:a+' says the next single is "completely different, and I love it"',dek:'In a candid interview the artist talked fame, family and food.',p:['"I spent six weeks making a song and threw it away. Then I made this one in a car park," '+a+' said.','The single drops at midnight on Friday.','Fans online have already started guessing the lyrics.']}},
  r=>{const a=pk(artists(),r);return{h:'Festival bill leaks: '+a+' and '+pk(artists(),r)+' headline',dek:'Organisers say nothing is confirmed. The poster says otherwise.',p:['A blurry photo of the poster appeared online on Monday and has been shared widely.','Organisers promise an official line-up "soon, and with better lighting".','Day passes sold out in nine minutes last year.']}},
  r=>{return{sc:[['album','Poster wall']],h:'Vinyl is having a moment, again',dek:'Sales of records outpaced CDs for a third year running.',p:['Independent shops report queues on release days.','"People want to hold the thing," said one owner in '+town(r)+'.','Pressing plants are booked solid until the new year.']}}]};
/* ---------- the day's stories ---------- */
function chartRows(){const L=+S.listeners||0,rv=(S.rvl&&S.rvl.rv)||[],rows=rv.map(x=>({n:x.n,v:+x.l||0,al:null}));
 const alb=(S.albums||[]).slice(-1)[0];rows.push({n:me(),v:Math.max(L,1),you:1,al:alb?alb.name:null});
 const names=artists();let i=0;while(rows.length<6&&i<20){const n=names[(hsh(String(S.day))+i*7)%names.length];i++;if(!rows.some(x=>x.n==n))rows.push({n,v:Math.max(2e3,L*(.1+((hsh(n)%90)/100))),al:null})}
 rows.sort((a,b)=>b.v-a.v);rows.forEach((x,k)=>{if(!x.al){const r=rng('al|'+x.n+'|'+Math.floor(S.day/8));x.al=album(r)}});return rows.slice(0,6)}
function playerStories(d){const o=[],a=me(),songs=S.songs||[],alb=S.albums||[],L=+S.listeners||0;
 /* diss tracks and replies (uses the same data as the Instagrime drama) */
 songs.forEach(s=>{if(s.diss&&s.day==d)o.push({cat:'music',you:1,k:'stage',cfg:'ch',h:a+' drops diss track "'+s.title+'" aimed at '+s.diss,dek:'The industry is watching to see how '+s.diss+' answers.',
  p:['"'+s.title+'" landed this week and is already being passed around group chats.','The track takes direct aim at '+s.diss+', and people are calling the second verse "disrespectful, in the best way".','So far '+s.diss+' has stayed quiet. A reply is widely expected. '+a+' said only: "I said what I said."','Streams in the first day: '+fmt(s.streams||0)+'.'],
  why:'Diss tracks are the fastest way to get noticed and the fastest way to start a feud. Whoever answers best usually wins the week.',next:s.diss+' has not replied yet. Replies usually land within a few days, often with a harder verse.',quote:['I said what I said.',a],facts:[['Target',s.diss],['Track',s.title],['First-day streams',fmt(s.streams||0)]]})});
 (S.news||[]).forEach(n=>{if(n.day==d)o.push({cat:'music',you:1,k:'studio',cfg:n.u,h:String(n.cap).replace(/\.$/,''),dek:n.u+' has answered '+a+' and the internet has opinions.',
  p:[n.cap,'Within an hour the reply had more plays than the original.','Fans have split into camps: Team '+a+' and Team '+n.u+'. Both camps are loud.','Neither artist has ruled out a third round.'],
  why:'A reply turns a one-off diss into a full feud, and feuds are what the whole feed talks about. Both artists usually gain listeners.',next:'A third round is likely. '+a+' has the next move.',quote:['Team '+a+' or Team '+n.u+'? Nobody is neutral.','Music Twitter'],facts:[['Replying artist',n.u],['Answering',a],['Day',String(n.day)]]})});
 alb.forEach(x=>{if(x.day==d){const st=(x.songs||[]).reduce((t,id)=>t+((songs.find(s=>s.id==id)||{}).streams||0),0);o.push({cat:'music',you:1,k:'album',cfg:'ch',h:a+' releases "'+x.name+'" and fans cannot stop talking about it',dek:(x.songs||[]).length+' tracks, one clear favourite and a very good cover.',
  p:['"'+x.name+'" arrived today with '+(x.songs||[]).length+' songs and a cover people are already printing on t-shirts.','Early listeners call it "the most complete thing '+a+' has made".','The album\'s songs have '+fmt(st)+' streams between them so far.'],
  why:'An album is the moment an artist stops being "that one song" and becomes a body of work. Critics, playlists and awards all start here.',next:'Reviews land over the next few days. If the numbers hold, expect a chart entry by the end of the week.',quote:['This is the one I am proudest of.',a],facts:[['Album',x.name],['Tracks',String((x.songs||[]).length)],['Streams so far',fmt(st)]]})}});
 /* a new song out that day, and rival news from the rivals system */
 songs.forEach(x=>{if(x.day==d&&!x.diss)o.push({cat:'music',you:1,k:'studio',cfg:'ch',h:a+' drops new single "'+x.title+'"',dek:(x.g?x.g+' fans':'Fans')+' have a new song to argue about.',
  p:['"'+x.title+'" is out now on WaveFern, the latest release from '+a+'.','It arrives '+(songs.length>1?'after '+(songs.length-1)+' earlier release'+(songs.length>2?'s':''):'as the first release of the career')+', and early listeners say it is the most polished yet.','Within the first day it had picked up '+fmt(x.streams||0)+' plays and a handful of lyric breakdowns online.'],
  why:'Every new release is a test of whether listeners will stick around. A good first day tends to decide how much playlist space a song gets.',next:'Watch the weekend numbers. If "'+x.title+'" holds, a video and a live version are the obvious next steps.',facts:[['Artist',a],['Song',x.title],['Streams so far',fmt(x.streams||0)]]})});
 (((S.rvl&&S.rvl.log)||[]).filter(e=>e&&e.d==d)).slice(0,2).forEach(e=>o.push({cat:'music',k:'stage',cfg:String(e.t),h:String(e.t).replace(/\.$/,'').replace(/^./,c=>c.toUpperCase()),dek:'Chart watchers say the race for the top of the scene just got tighter.',
  p:[String(e.t).replace(/\.$/,'')+'.','The move shakes up the rankings that '+a+' and the other rising artists are chasing.','Fans on both sides are already comparing numbers.'],
  why:'The listener ranking decides who gets booked, featured and quoted. A single week can swap the order.',next:'Expect a reply, a new release or a surprise collab within days.',facts:[['Rivals tracked',String(((S.rvl&&S.rvl.rv)||[]).length)],['Your listeners',fmt(+S.listeners||0)]]}));
 if(d==S.day){
  /* an album that is performing really well */
  const best=alb.slice().sort((x,y)=>{const f=q=>(q.songs||[]).reduce((t,id)=>t+((songs.find(s=>s.id==id)||{}).streams||0),0);return f(y)-f(x)})[0];
  if(best&&S.day-best.day>=1){const st=(best.songs||[]).reduce((t,id)=>t+((songs.find(s=>s.id==id)||{}).streams||0),0);
   if(st>=2000)o.push({cat:'music',you:1,k:'album',cfg:'ch',h:'"'+best.name+'" by '+a+' keeps climbing: '+fmt(st)+' streams and counting',dek:'The album is one of the most played releases in the country this week.',
    p:['"'+best.name+'" has been on repeat since it came out '+(S.day-best.day)+' days ago.','Playlist editors say it is "sticking around" in the top spots, which almost never happens.','If the pace holds it will go gold before the month is out.'],
    why:'Most albums peak in week one and fade. One that keeps growing means people are telling their friends, which is the best marketing there is.',next:'A deluxe edition or a tour announcement would ride the wave. So would a new single.',quote:['It sounds better every time I hear it.','one playlist editor'],facts:[['Album',best.name],['Days since release',String(S.day-best.day)],['Total streams',fmt(st)]]})}
  const top=songs.slice().sort((x,y)=>(y.streams||0)-(x.streams||0))[0];
  if(top&&top.streams>=1e3){const m=Math.pow(10,Math.floor(Math.log10(top.streams)));o.push({cat:'music',you:1,k:'studio',cfg:'ch',h:'"'+top.title+'" passes '+fmt(m)+' streams',dek:a+' has the song of the moment, according to the numbers.',
   p:['"'+top.title+'" has now been played '+fmt(top.streams)+' times.','Fans have been posting covers, edits and at least one interpretive dance.','The next target is '+fmt(m*(String(m)[0]==='1'?5:2))+'.'],
   why:'Stream milestones are how the industry measures a song. Passing '+fmt(m)+' puts "'+top.title+'" ahead of most releases this year.',next:'Next stop: '+fmt(m*(String(m)[0]==='1'?5:2))+'. At the current pace it could arrive within weeks.',facts:[['Song',top.title],['Total streams',fmt(top.streams)],['Today',fmt(top.today||0)]]})}
  if(L>=100)o.push({cat:'music',you:1,k:'stage',cfg:'ch',h:a+' now has '+fmt(L)+' monthly listeners',dek:L>=1e6?'A very big number for someone who started in a bedroom.':'Growing fast, and the people listening are not leaving.',
   p:[a+' has grown to '+fmt(L)+' monthly listeners.','Industry watchers rank the act among this month\'s risers.','"Whatever they are doing, keep doing it," said one label scout.'],
   why:'Monthly listeners are the number that labels, brands and promoters look at first. '+(L>=1e5?'Six figures opens doors that were shut a month ago.':'Every jump makes the next offer easier to get.'),next:'The next milestone is '+fmt(Math.pow(10,Math.ceil(Math.log10(L+1)))*(L<Math.pow(10,Math.ceil(Math.log10(L+1)))/2?.5:1))+' listeners.',facts:[['Monthly listeners',fmt(L)],['Songs out',String(songs.length)],['Albums',String(alb.length)]]})}
 return o}
/* explainer text for every story: why it matters, what happens next, key facts and a pull quote (player stories bring their own) */
const WHY={music:['Music news moves fast: a single song or a single post can change who gets booked, quoted and streamed next.','Streaming numbers are now the first thing labels, promoters and fans look at, so any shift in them is news.','Artists in this part of the scene tend to feed off each other, so one move usually sets off another.'],
 world:['Local decisions like this shape daily life: how people travel, what they pay and where they spend their time.','Stories like this tend to spread to neighbouring towns that face the same problem.','Whatever happens here is likely to be copied or argued about elsewhere.'],
 sport:['In a tight table a single result can change who qualifies and who goes home.','Results like this reshape the season and decide where the money and the crowds go.','Records and upsets are what fill stadiums the following week.'],
 culture:['What people watch, read and share decides what gets made next.','A breakout hit can change what studios, publishers and festivals are willing to back.','Culture moves in waves, and this one is still building.'],
 tech:['Gadgets and apps that get the basics right quietly change what everyone else has to build.','Small changes to devices people use every day add up faster than big launches.','Whoever solves the boring problems usually wins the next year.'],
 biz:['Prices and profits end up in everyone\'s shopping basket, sooner or later.','Markets read small signals, and this one is being read closely.','Businesses plan months ahead, so a change now shows up in the shops later.'],
 sci:['Discoveries like this rarely change anything overnight, but they point researchers at the next question.','Each result narrows down what is possible and what is just a good story.','Findings are only the start: other teams now try to repeat them.']},
 NEXT={music:['Watch the weekend numbers and the replies. Both usually arrive within days.','Expect a follow-up release, a surprise collab or a loud social media post.','The next chart update will show whether this was a blip or a trend.'],
 world:['A vote or an update is expected within the next two weeks.','Officials say more details will be published next week.','Local groups plan to keep the pressure on until the first results show.'],
 sport:['The next fixture is the real test. Both sides are back in action this weekend.','Fans will get the full picture when the table updates.','Expect a response from the other side before the next round.'],
 culture:['Streaming figures for the weekend will say whether this one has legs.','Announcements for a follow-up are expected soon.','Critics and fans will keep arguing about it for weeks.'],
 tech:['Reviews and early customer reports arrive over the next fortnight.','An update is promised within the month.','Rivals are expected to answer with their own versions this season.'],
 biz:['The next quarterly report will show whether the trend holds.','Analysts will update their forecasts by Friday.','Watch prices in the shops over the coming weeks.'],
 sci:['A follow-up study is already planned.','The team will publish its full data later this month.','Other labs have been asked to try to repeat the result.']},
 QUOTE={music:['I did not expect it to get this big.','You can hear the difference immediately.'],world:['We have been waiting years for this.','People are cautiously happy.'],sport:['We never stopped believing.','It is the best game I have played.'],culture:['I could not stop talking about it.','Everyone I know has seen it.'],tech:['Finally, someone fixed the basics.','It just works, which is rare.'],biz:['We are cautiously optimistic.','It is a good start.'],sci:['We did not expect that result.','It opens up a lot of questions.']};
function enrich(s,r){const c=s.cat;if(!s.why)s.why=pk(WHY[c]||WHY.music,r);if(!s.next)s.next=pk(NEXT[c]||NEXT.music,r);
 if(!s.facts)s.facts=[['Section',CN[c]],['Reported',s.d==S.day?'Today':'Day '+s.d],['Reporter',s.by]];
 if(!s.quote){const q=pk(QUOTE[c]||QUOTE.music,r);s.quote=[q,pk(['a local resident','an industry insider','one spokesperson','a longtime fan','an analyst'],r)]}
 s.sum=(s.p[0]+' '+s.p[1]).length<=230?s.p[0]+' '+s.p[1]:s.p[0]}
const cache={};
function storiesOf(d){const key=d+'|'+(S.artist||'')+'|'+(d==S.day?[(S.songs||[]).length,(S.albums||[]).length,(S.news||[]).length,Math.floor(Math.log10(1+(+S.listeners||0)))].join(','):'');
 if(cache[key])return cache[key];const r=rng('news|'+d+'|'+(S.artist||'')),out=[];
 const add=(cat,t,i)=>{const x=t(r);out.push(Object.assign({cat,k:pk(KIND[cat],r),cfg:x.h},x))};
 const pick=(a,i,n)=>a[(d*3+i+hsh(S.artist||'x'))%a.length];
 try{out.push(...playerStories(d))}catch(e){console.warn('news player',e)}
 const mus=T.fillMusic;for(let i=out.length;i<4;i++)add('music',pick(mus,i,0),i);
 [['world',2],['sport',2],['culture',1],['tech',1],['biz',1],['sci',1]].forEach(([c,n])=>{for(let i=0;i<n;i++)add(c,pick(T[c],i,0),i)});
 /* a second music piece from the chart, with the album of the week */
 const ch=chartRows(),top=ch[0];
 if(d==S.day&&top&&!top.you)out.splice(Math.min(1,out.length),0,{cat:'music',k:'album',cfg:top.n,h:top.n+'\'s "'+top.al+'" is the album everyone is playing',dek:'It sits at No. 1 on the Fern Times album chart this week.',p:['"'+top.al+'" has taken the top spot with about '+fmt(top.v*3)+' plays this week.','"It does not sound like anything else out right now," said one critic.','The chart refreshes every week.']});
 out.forEach((s,i)=>{s.id=d+'.'+i;s.d=d;s.i=i;s.nid=5e7+d*64+i;s.by=s.by||pk(['Maya Quill','Tom Brannock','Dee Okoro','Sam Whitlock','Jules Ferrand','R. Navarro','Priya Anand','Leo Hartmann'],rng('by'+s.id));s.mins=2+(hsh(s.id)%4);enrich(s,rng('en'+s.id))});
 cache[key]=out;const ks=Object.keys(cache);if(ks.length>40)delete cache[ks[0]];return out}
const find=id=>{const [d,i]=String(id).split('.').map(Number);return storiesOf(d)[i]};
/* a picture scene per story, matched to its topic: [scene, variant name] pairs from 259/260-*-scenes.js (a name that is missing just uses the scene's first look) */
const SCENES={music:[['stage','Stadium'],['stage','Club'],['studio','Control room'],['studio','Basement'],['album','Poster wall'],['stage','Busking'],['stage','Backstage'],['album','Listening party'],['studio','Radio booth'],['stage','Festival']],
 world:[['townhall'],['city','Old town'],['city','Harbour'],['city','Market'],['city','Subway'],['city','Street'],['city','Roof night'],['park','Lake dock']],
 sport:[['pitch'],['court'],['stage','Stadium'],['park','Skatepark'],['pitch'],['court']],
 culture:[['cinema'],['stage','Backstage'],['fit','Runway'],['album','Poster wall'],['stage','Busking'],['cinema'],['city','Neon alley']],
 tech:[['expo'],['lab'],['home','Home studio'],['expo'],['city','Neon alley']],
 biz:[['newsroom'],['city','Roof night'],['city','Street'],['newsroom'],['city','Harbour']],
 sci:[['lab'],['observatory'],['park','Snow'],['observatory'],['park','Lake dock'],['lab']]};
function sceneFor(s){const L=s.sc||SCENES[s.cat]||SCENES.music;let pr=L;if(s.cat=='music'&&s.k=='album')pr=L.filter(x=>x[0]=='album');else if(s.cat=='music'&&s.k=='studio')pr=L.filter(x=>x[0]=='studio');if(!pr.length)pr=L;
 const c=pr[hsh(s.id+'sc')%pr.length],sc=IGXS&&IGXS[c[0]];if(!sc)return null;const vs=sc.V||[sc],bd=c[1]?vs.findIndex(v=>v.n==c[1]):0;return{scene:c[0],bd:bd<0?0:bd}}
function img(s){try{const cfg=s.cfg=='ch'?{...ch}:lk(String(s.cfg||s.h)),sc=sceneFor(s)||{};return postPic({id:s.nid,kind:s.k,cap:s.h,u:s.by,cfg,cfg2:null,scene:sc.scene,bd:sc.bd})}catch(e){return''}}
const END='<div class=end>You are all caught up. See you tomorrow.</div>';
const dayName=d=>d==S.day?'Today':d==S.day-1?'Yesterday':'Day '+d;
/* ---------- look ---------- */
function css(){if(document.getElementById('nwcss'))return;const s=document.createElement('style');s.id='nwcss';s.textContent=`
.mn.nwmn{padding:0!important;background:#f5f1e8}
.nw{min-height:100%;box-sizing:border-box;background:#f5f1e8;color:#1b1a17;font:15px/1.45 "Helvetica Neue",Arial,sans-serif;padding-bottom:30px}
.nw button{font:inherit;cursor:pointer}
.nw .mast{padding:16px 18px 0;text-align:center;border-bottom:3px double #1b1a17;background:#f5f1e8}
.nw .mast .dt{display:flex;justify-content:space-between;font:600 11px/1 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#6a6559}
.nw .mast h1{margin:6px 0 4px;font:700 clamp(30px,6vw,46px)/1 Georgia,"Times New Roman",serif;letter-spacing:-.01em;color:#1b1a17}
.nw .mast h1 i{color:#d6322b;font-style:normal}
.nw .tabs{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;border-top:1px solid #1b1a17;margin-top:6px}
.nw .tabs::-webkit-scrollbar{display:none}
.nw .tabs button{all:unset;cursor:pointer;flex:none;padding:10px 14px;font:700 12px/1 "Helvetica Neue",Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6a6559;border-bottom:3px solid transparent}
.nw .tabs button:hover{color:#1b1a17}.nw .tabs button.on{color:#d6322b;border-bottom-color:#d6322b}
.nw .wrap{max-width:1000px;margin:0 auto;padding:16px 18px 0}
.nw .dh{display:flex;align-items:center;gap:10px;margin:18px 0 10px;font:700 12px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#6a6559}
.nw .dh:after{content:"";flex:1;height:1px;background:#c9c2b0}
.nw .hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:18px;cursor:pointer;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid #c9c2b0}
.nw .hero .pc{position:relative;aspect-ratio:4/3;background:#222;overflow:hidden;border-radius:3px}
.nw .hero img,.nw .card img,.nw .art img{width:100%;height:100%;object-fit:cover;image-rendering:pixelated;display:block}
.nw .hero h2{margin:8px 0 8px;font:700 clamp(22px,3.6vw,32px)/1.12 Georgia,"Times New Roman",serif}
.nw .hero:hover h2,.nw .card:hover h3{text-decoration:underline;text-decoration-thickness:2px}
.nw .dek{color:#4b473d;font-size:15px;margin:0 0 8px}
.nw .meta{font-size:12px;color:#6a6559}
.nw .tag{display:inline-block;font:700 10px/1 "Helvetica Neue",Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#fff;padding:4px 6px;border-radius:2px;margin-right:6px}
.nw .you{background:#1b1a17;color:#ffe45e}
.nw .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}
.nw .card{cursor:pointer;display:flex;flex-direction:column;gap:8px;background:#fffdf7;border:1px solid #d8d1bf;border-radius:3px;overflow:hidden;transition:transform .12s,box-shadow .12s}
.nw .card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.12)}
.nw .card .pc{aspect-ratio:16/10;background:#222}
.nw .card .tx{padding:0 12px 12px}
.nw .card h3{margin:6px 0 6px;font:700 18px/1.2 Georgia,"Times New Roman",serif}
.nw .card p{margin:0 0 8px;font-size:13px;color:#4b473d}
.nw .wh{font-size:13px;line-height:1.45;color:#2d2a24;margin:0 0 10px;padding-left:10px;border-left:3px solid #d6322b;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
.nw .hero .wh{font-size:14px;-webkit-line-clamp:7}
.nw .wh b{display:block;font:700 10px/1 "Helvetica Neue",Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#d6322b;margin-bottom:4px}
.nw .bq{margin:22px 0;padding:6px 0 6px 18px;border-left:4px solid #d6322b;font:italic 22px/1.35 Georgia,serif}.nw .bq small{display:block;margin-top:6px;font:700 11px/1 sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#6a6559;font-style:normal}
.nw .sec{background:#fffdf7;border:1px solid #d8d1bf;border-radius:3px;padding:12px 16px;margin:0 0 14px}.nw .sec h4{margin:0 0 6px!important}.nw .sec p{font:16px/1.55 Georgia,serif;margin:0}
.nw .fx{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;background:#1b1a17;color:#f5f1e8;border-radius:3px;padding:12px 16px;margin:0 0 14px}
.nw .fx div{font-size:12px;color:#b9b3a1}.nw .fx b{display:block;font:700 17px/1.2 Georgia,serif;color:#ffe45e;margin-top:2px;word-break:break-word}
.nw .chart{background:#1b1a17;color:#f5f1e8;border-radius:3px;padding:14px;border:0}
.nw .chart h3{margin:0 0 2px;font:700 16px/1.2 Georgia,serif;color:#ffe45e}.nw .chart small{color:#b9b3a1;display:block;margin-bottom:8px}
.nw .chart ol{margin:0;padding:0;list-style:none}.nw .chart li{display:flex;gap:10px;align-items:baseline;padding:7px 0;border-top:1px solid #3a3830}
.nw .chart li b{font:700 20px/1 Georgia,serif;color:#ffe45e;min-width:22px}.nw .chart li span{flex:1;min-width:0}.nw .chart li em{display:block;font-style:normal;font-size:12px;color:#b9b3a1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nw .chart li.me{background:#2e2b1e;margin:0 -8px;padding:7px 8px;border-radius:2px}.nw .chart li.me i{font:700 9px/1 sans-serif;letter-spacing:.1em;background:#ffe45e;color:#1b1a17;padding:3px 5px;border-radius:2px;margin-left:6px;font-style:normal}
.nw .art{max-width:680px;margin:0 auto;padding:18px 18px 0}
.nw .art .bk{all:unset;cursor:pointer;color:#d6322b;font:700 12px/1 sans-serif;letter-spacing:.08em;text-transform:uppercase}
.nw .art h1{margin:12px 0 8px;font:700 clamp(26px,5vw,38px)/1.1 Georgia,serif}
.nw .art .pc{aspect-ratio:16/10;background:#222;margin:14px 0;border-radius:3px;overflow:hidden}
.nw .nwbd p{font:18px/1.6 Georgia,serif;margin:0 0 16px}
.nw .art h4{margin:28px 0 10px;font:700 12px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#6a6559}
.nw .end{text-align:center;color:#6a6559;font:12px ui-monospace,monospace;padding:18px}
.nw .sent{height:40px;text-align:center;color:#6a6559;font:12px ui-monospace,monospace;padding-top:14px}
@media(max-width:620px),(min-width:0){.nw.nwph .hero{grid-template-columns:1fr}.nw.nwph .mast h1{font-size:30px}.nw.nwph .wrap,.nw.nwph .art{padding-left:12px;padding-right:12px}.nw.nwph .grid{grid-template-columns:1fr}}
@media(max-width:620px){.nw .hero{grid-template-columns:1fr}.nw .wrap{padding:12px}}`;document.head.appendChild(s)}
/* ---------- pieces ---------- */
const tagH=s=>`<span class=tag style="background:${CC[s.cat]}">${CN[s.cat]}</span>${s.you?'<span class="tag you">About you</span>':''}`;
const metaH=s=>`<div class=meta>${tagH(s)}${s.by} · ${s.mins} min read</div>`;
const hero=s=>`<div class=hero onclick="nwOpen('${s.id}')"><div class=pc><img src="${img(s)}" alt=""></div><div><div class=meta>${tagH(s)}</div><h2>${esc(s.h)}</h2><p class=dek>${esc(s.dek)}</p><div class=wh><b>What happened</b>${esc(s.sum)}</div><div class=meta>${s.by} · ${s.mins} min read</div></div></div>`;
const card=s=>`<div class=card onclick="nwOpen('${s.id}')"><div class=pc><img src="${img(s)}" alt="" loading=lazy></div><div class=tx><div class=meta>${tagH(s)}</div><h3>${esc(s.h)}</h3><p>${esc(s.dek)}</p><div class=wh><b>What happened</b>${esc(s.sum)}</div><div class=meta>${s.by} · ${s.mins} min · Read more ›</div></div></div>`;
const chartH=()=>`<div class="card chart" style="cursor:default"><h3>Album chart</h3><small>Most played this week</small><ol>${chartRows().map((x,i)=>`<li class="${x.you?'me':''}"><b>${i+1}</b><span>${esc(x.n)}${x.you?'<i>YOU</i>':''}<em>${esc(x.al||'')}</em></span></li>`).join('')}</ol></div>`;
/* one day: the first day of a feed gets the big story */
function daySec(d,first){let L=storiesOf(d);if(N.tab!='top')L=L.filter(s=>s.cat==N.tab);if(!L.length)return'';
 /* your stories lead, then the rest */
 L=L.slice().sort((a,b)=>(b.you?1:0)-(a.you?1:0)||a.i-b.i);
 const h=first&&L.length?hero(L[0]):'',rest=first&&L.length?L.slice(1):L,ch=(d==S.day&&(N.tab=='top'||N.tab=='music'))?chartH():'';
 return`<div class=dh>${dayName(d)}</div>${h}<div class=grid>${ch}${rest.map(card).join('')}</div>`}
window.nwMore=()=>{const d=S.day-N.days;if(d<1)return null;N.days++;return daySec(d,0)+(d==1?END:'')};
function articleH(s,ctx){const rel=storiesOf(s.d).filter(x=>x.cat==s.cat&&x.id!=s.id).slice(0,3);
 return`<div class="nw${ctx=='ph'?' nwph':''}"><div class=mast><div class=dt><span>Fern Times</span><span>${dayName(s.d)}</span></div><h1>The Fern <i>Times</i></h1></div><div class=art><button class=bk onclick="nwBack()">‹ Back to news</button>
 <div class=meta style="margin-top:14px">${tagH(s)}</div><h1>${esc(s.h)}</h1><p class=dek style="font-size:18px">${esc(s.dek)}</p><div class=meta>By ${s.by} · ${dayName(s.d)} · ${s.mins} min read</div>
 <div class=pc><img src="${img(s)}" alt=""></div><div class=fx>${s.facts.map(f=>`<div>${esc(f[0])}<b>${esc(f[1])}</b></div>`).join('')}</div>
 <h4>What happened</h4><div class=nwbd>${s.p.map(t=>`<p>${esc(t)}</p>`).join('')}</div>
 <div class=bq>“${esc(s.quote[0])}”<small>${esc(s.quote[1])}</small></div>
 <div class=sec><h4>Why it matters</h4><p>${esc(s.why)}</p></div><div class=sec><h4>What happens next</h4><p>${esc(s.next)}</p></div>${rel.length?`<h4>More in ${CN[s.cat]}</h4><div class=grid style="margin-bottom:20px">${rel.map(card).join('')}</div>`:''}</div></div>`}
function page(ctx){css();N.ctx=ctx;
 if(N.open){const s=find(N.open);if(s)return articleH(s,ctx);N.open=null}
 if(N.days<2)N.days=2;N.days=Math.min(N.days,S.day);
 let h='';for(let k=0;k<N.days;k++){const d=S.day-k;if(d<1)break;h+=daySec(d,k==0)}
 if(!h)h='<div class=end>No stories here yet.</div>';
 const wd=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][((S.day-1)%7+7)%7];
 return`<div class="nw${ctx=='ph'?' nwph':''}"><div class=mast><div class=dt><span>${wd} · Day ${S.day}</span><span>Free · Fern Times</span></div><h1>The Fern <i>Times</i></h1>
 <div class=tabs>${CATS.map(c=>`<button class="${N.tab==c[0]?'on':''}" onclick="nwTab('${c[0]}')">${c[1]}</button>`).join('')}</div></div>
 <div class=wrap>${h}${S.day>N.days?'<div class=sent data-inf="nwMore">Loading older stories…</div>':END}</div></div>`}
function rr(){if(N.ctx=='ph'&&document.getElementById('ph')&&typeof phR=='function')phR();else if(typeof mode!='undefined'&&mode=='pc'&&app=='news')pcR()}
const toTop=()=>{try{const m=document.querySelector('#pc .mn');if(m)m.scrollTop=0;const p=document.querySelector('#ph .phx');if(p)p.scrollTop=0}catch(e){}};
window.nwTab=t=>{N.tab=t;N.days=2;N.open=null;try{snd('click')}catch(e){}rr();toTop()};
window.nwOpen=id=>{N.open=id;try{snd('click')}catch(e){}rr();toTop()};
window.nwBack=()=>{N.open=null;rr()};
/* ---------- install: app entry, icon, laptop and phone ---------- */
APPD.news={n:'Fern Times',p:0,d:'Preinstalled. News on music, sport, culture, tech and the world, including stories about you.'};
try{IC.news=mkIc(['KKKKKKKKKK','KWWWWWWWWK','KWKKKKWRRK','KWWWWWWRRK','KWKKWKKWWK','KWWWWWWWWK','KWKKWKKWWK','KWWWWWWWWK','KWKKKKWKKK','KKKKKKKKKK'],{K:'#1b1a17',W:'#f5f1e8',R:'#d6322b'})}catch(e){IC.news=IC.store}
setInterval(()=>{try{if(S&&S.artist&&S.apps&&!S.apps.news)S.apps.news=1}catch(e){}},1000);
PA.news=()=>page('pc');
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{const m=document.querySelector('#pc .mn');if(m)m.classList.toggle('nwmn',app=='news'&&!!m.querySelector('.nw'));FWINF.scan()}catch(e){}return r}}
try{if(typeof GP_APPS!='undefined'&&!GP_APPS.some(a=>a[0]=='news')){GP_APPS.push(['news','Fern Times',()=>IC.news,'#d6322b']);if(typeof GP_TITLE!='undefined')GP_TITLE.news='Fern Times'}
 if(typeof phBody=='function'){const b0=phBody;phBody=function(){if(typeof PH!='undefined'&&PH.app=='news')return`<div class=phx>${page('ph')}</div>`;return b0.apply(this,arguments)}}
 if(typeof phR=='function'){const r0=phR;phR=function(){const r=r0.apply(this,arguments);try{FWINF.scan()}catch(e){}return r}}}catch(e){console.error('news phone',e)}
/* ---------- shared infinite scroll: any element with data-inf="fnName" loads more when it scrolls into view.
   window[fnName]() returns HTML to put before it, '' to try again later, or null when there is nothing more (the element is removed). ---------- */
if(!window.FWINF){let io=null;const IO=()=>io||(io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);
  setTimeout(()=>{try{if(!el.isConnected)return;const f=window[el.dataset.inf],h=typeof f=='function'?f():null;if(h===null){el.remove();return}
   if(h)el.insertAdjacentHTML('beforebegin',h);el.removeAttribute('data-infb');FWINF.scan()}catch(x){console.error('infinite scroll',x);el.remove()}},60)}),{rootMargin:'300px'}));
 window.FWINF={scan(){if(typeof IntersectionObserver=='undefined')return;document.querySelectorAll('[data-inf]:not([data-infb])').forEach(el=>{el.setAttribute('data-infb','1');IO().observe(el)})}}}
window.FWNEWS={sceneFor,storiesOf,chartRows,find,state:N,page};
})();
