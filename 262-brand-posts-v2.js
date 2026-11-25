/* ===== v55.52.44 (held): better Instagrime brand posts, in the game's pixel style, with original product names =====
   1. Product names and taglines: every brand's three products now have original names (no real product lines or slogans).
      They are written into BRD.postProducts in place, so the feed, the brand profile pages and anything reading prods() follow.
   2. Captions: BRD.adHook (called by mk() in 241-brand-posts.js) rewrites each ad's caption: launch, regular and "seen on you" lines,
      a price, hashtags by category, and the player's artist name now and then.
   3. Pictures: postPic is wrapped for posts with p.v2 and draws a 160x120 pixel ad (shown at 2x like every other post) in one of four
      layouts: spotlight stage, night billboard, split poster, shop window. The product is a pixel sprite per category, outlined
      automatically and recoloured per product from the brand's own colours, with the brand logo, a 3x5 pixel-font name and price tag.
   Reused: 241-brand-posts.js (todays, mk, genFeed mix, uposts, pfp, PICS cache), BRD.logo / BRD.by / BRD.brands, and the pixel helpers of
   178-instagrime-photos.js (igxF, igxGrad, igxDisc, igxTxt, igxTW, igxClip, igxMix). New: the sprites, four layouts, caption pools.
   Nothing is saved. Held behind the dev gate (/dev/ only) until release day: set HELD=false to ship. */
(function(){
const HELD=true;
if(HELD&&!window.FW_DEV)return;
if(typeof BRD=='undefined'||!BRD.brands||!BRD.postProducts||typeof postPic=='undefined'||typeof igxF=='undefined'||typeof PICS=='undefined')return;

/* ---------- 1. original product names: [name, tagline] ---------- */
const N={
 converse:[['Court Canvas Hi','Canvas that outlasts the tour bus'],['Cloud Platform Lo','Two extra inches, zero apologies'],['Suede Roller Low','Simple, soft, gone by Friday']],
 monster:[['Mango Mayhem','Pure mango chaos in a can'],['Zero Static','All the buzz, none of the sugar'],['Midnight Voltage','For the 3 AM studio session']],
 rayban:[['Drifter Classic','Look cool, see cooler'],['Pilot Gold','Stage approved, sun approved'],['Retro Bar Frames','Old shape, new attitude']],
 supreme:[['Stamp Hoodie','Drops once. Gone in a minute'],['Corner Cap','The cap everyone queues for'],['Deck Series 9','Art you can ride']],
 levis:[['Straight Five Jeans','Still the one, since forever'],['Work Jacket','Gets better every wash'],['Wool Lined Denim','Warm denim for cold cities']],
 beats:[['Studio Cans Pro','Hear every layer of your mix'],['Flex Buds','Pocket sized bass'],['Mini Boom Speaker','Party in your pocket']],
 pepsi:[['Cherry Pop','New flavour, same fizz'],['Zero Fizz','Zero sugar, full taste'],['Vanilla Float','Dessert in a can']],
 adidas:[['Terrace Low','The terrace classic is back'],['CloudRunner 5','Soft landings for 10k'],['Heritage Track Set','Three bars, one legend']],
 cocacola:[['Zero Cherry Cola','The fizz you wanted'],['Winter Glass Bottle','Limited glass, limited time'],['Mini Cans','Small can, big smile']],
 samsung:[['Nova Ultra Phone','The camera that sees in the dark'],['Pebble Buds','Wire-free, worry-free'],['Flip Fold Z','Two screens, one pocket']],
 nike:[['Cushion One','Air under every step'],['Panda Low Top','The one everyone wants'],['Fleece Tech Set','Built for the cold']],
 gucci:[['Gold Clasp Bag','Gold hardware, quiet flex'],['Bit Loafer','Walk into the room'],['Emerald Band Belt','The detail that matters']],
 apple:[['Core Phone 20 Pro','Our best camera yet'],['Orbit Buds Max','Spatial sound for your mix'],['Slim Book Air','Thin, light, runs all day']],
 lv:[['City Satchel 30','The icon, in new colours'],['Voyage Trunk','Travel like a legend'],['Runner Sneaker','Luxury you can run in']],
 vanz:[['Skate Low','Skate it, wear it, wreck it'],['Checker Slip-On','The checkerboard never dies'],['Ledge Pro Mid','Built for the rail']],
 tacko:[['Crunch Taco Supreme','Crunch first, questions later'],['Cheesy Fries Box','Back by popular demand'],['Blue Freeze','Frozen and electric blue']],
 doritoz:[['Cheesy Triangles','Every finger gets orange'],['Cool Cream Crunch','Cool, loud, shareable'],['Blaze Edition','Hot enough to need milk']],
 starbux:[['Autumn Spice Latte','Back for autumn'],['Cloud Foam Cold Brew','Iced and fluffy'],['Sea Sparkle Frappe','Limited, green and glittery']],
 gator:[['Orange Thunder','Fuel for the fourth quarter'],['Zero Lime Sport','All the sweat, no sugar'],['Glacier Freeze','Cold blue recovery']],
 maybelyn:[['Mega Lash Mascara','Lashes that need their own seat'],['Kiss-Proof Lipstick','Lasts 24 hours, we checked'],['Skin Match Foundation','Your shade, no filter']],
 radbull:[['Rad Bull Original','Lift-off in a can'],['Rad Bull Sugarfree','Lift-off without the crash'],['Mango Summer Edition','Tropical blast-off']],
 netflux:[['Neon Heist, Season 4','Binge it before the weekend'],['Backstreet Mysteries','The finale you waited for'],['Ad-Free Plan','Stream it without breaks']],
 boze:[['Hush Studio Cans','Silence, but louder'],['Sport Buds','Stay in your zone'],['Mini Room Speaker','Big room in a small shell']],
 pooma:[['Cat Sprint Low','Low, fast, unmistakable'],['Soft Suede Low','Same icon, softer step'],['Retro Runner','Chunky and unapologetic']],
 lulu:[['Flow Leggings','Second skin, first choice'],['Zip Run Jacket','Zip up for the run'],['All-Day Belt Bag','Hands free, all day']],
 razzr:[['Viper Mouse V3','Latency is for losers'],['Tentacle Headset','Hear them first'],['Clicker Keyboard','Click faster than thought']],
 microsoff:[['Surf Laptop 6','Sleek, fast, Wi-Fi hungry'],['Gamebox Series Z','Power your next game'],['Panes 12','Windows, but cooler']],
 sonny:[['Console Six','Play has no limits'],['Stroll Headphones','Noise cancelling for the tour bus'],['Vista Pro TV','The picture is the point']],
 nintenda:[['Pocket Console 2','Play anywhere, any time'],['Kart Racers Deluxe','Shell incoming'],['Fern Quest: Tides of Time','The adventure continues']],
 northfake:[['Summit Puffer','Stay warm, look expedition-ready'],['Basecamp Duffel','Pack for the summit'],['Peak Fleece','Soft as a cloud']],
 fenti:[['Soft Focus Foundation','40 shades, zero excuses'],['Gloss Drop Universal','One gloss for every lip'],['Shimmer Stix','Glow like the main stage']],
 envidia:[['Pixel GPU 6090','Frame rates for days'],['Smooth Scale Update','Smoother. Sharper. Free.'],['Mini AI Kit','Tiny box, giant brain']],
 tezla:[['Volt Sedan Plaid','0 to 60 in a blink'],['Armour Truck 2','Armoured and unapologetic'],['Home Battery Wall','Keep the lights on']],
 dysun:[['Detect Vacuum V15','Dust has nowhere to hide'],['Curl Styler','Curls without the heat damage'],['Bladeless Cool Fan','Bladeless and breezy']],
 ferrali:[['Prancer GTB','Italian thunder, now in red'],['Hybrid Thunder 1000','1000 horses, one pedal'],['Prancer SUV','Prancing horse, family sized']],
 rolix:[['Diver Date','Dive deep, look sharp'],['Chrono Gold','The chronograph everyone wants'],['Dress Date 36','Old money, new wrist']]};
Object.assign(BRD.postProducts,N);

/* ---------- helpers ---------- */
const hsh=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h};
const rgb=c=>{c=String(c||'#888');if(c[0]!='#')return[136,136,136];if(c.length==4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1,7),16);return[(n>>16)&255,(n>>8)&255,n&255]};
const hex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const A=rgb(a),B=rgb(b);return hex(A.map((v,i)=>v+(B[i]-v)*t))};
const lum=c=>{const a=rgb(c);return(a[0]*.3+a[1]*.59+a[2]*.11)/255};
const F=igxF;
const TAGS={sneaker:'sneakerhead',sportswear:'fitcheck',drink:'refresh',fastfood:'snacktime',snack:'snackattack',coffee:'coffeetime',eyewear:'shadesup',streetwear:'streetstyle',denim:'denimdays',audio:'soundcheck',tech:'newtech',gaming:'gamernight',streaming:'binge',cosmetics:'glowup',outdoor:'getoutside',athleisure:'movedaily',car:'carspotting',luxury:'luxelife'};
const price=(b,i,pi)=>{const base=[8,19,34,89,240][Math.min(4,b.t|0)];const v=base*(1+((hsh(b.id+pi)%70)/100)+pi*.15);const r=v<30?Math.round(v)+.99:Math.round(v/5)*5;return'$'+(v<30?r.toFixed(2):r)};

/* ---------- 2. captions ---------- */
const LAUNCH=[
 '{T} NEW DROP: {n} is out now. {t}. {pr}. Link in bio. {h}',
 'JUST LANDED: {n}. {t}. Only {pr}, while they last. {h}',
 'It is here. {n}. {t}. Tap to shop, {pr}. {h}',
 'Day one of {n}. {t}. Queue is already round the corner. {h}',
 '{n} just dropped and the servers are sweating. {pr}. {h}'];
const REG=[
 '{n}. {t}. {pr}. {h}',
 'Spotted in the wild: {n}. {t}. {h}',
 'Have you tried {n} yet? {t}. {h}',
 'Paid partnership. {n}: {t}. {pr}. {h}',
 'Rate {n} out of ten. We say eleven. {h}',
 'Treat yourself today: {n}, {pr}. {h}',
 'Fan favourite for a reason. {n}. {t}. {h}'];
const ART=[
 'Seen with {a} on the tour bus: {n}. {t}. {h}',
 '{a} approved. {n}, {pr}. {h}',
 'Official pick of the studio: {n}. Ask {a}. {h}'];
function adHook(p,b,pr,launch,day,i,k){
 const h=hsh(b.id+'|'+day+'|'+k),tag=TAGS[b.cat]||'newin',art=(typeof S!='undefined'&&S.artist)?String(S.artist).slice(0,16):'';
 const pool=launch?LAUNCH:(art&&h%4==0?ART:REG);
 const pi=p.prod|0,pc=price(b,i,pi);
 p.cap=pool[h%pool.length].replace('{T}','').replace(/\{n\}/g,pr[0]).replace(/\{t\}/g,pr[1]).replace('{pr}',pc).replace('{a}',art).replace('{h}','#'+tag+(launch?' #newdrop':' #ad')).replace(/\s+/g,' ').trim();
 p.v2=1;p.pc=pc;p.lay=(h>>3)%4;p.h=h}
BRD.adHook=adHook;

/* ---------- 3. pixel sprites: M main, S shade, H highlight, W white, A brand accent, D dark. Outline is added automatically ---------- */
const SP={
 sneaker:['.MMMMM............','.MMMMMM...........','.MMMMMMM..........','.MHMMMMMM.........','.MMMMMMMMMM.......','.MMMAMMMMMMMMM....','.MMMMAMMMMMMMMMM..','.MMMMMMMMMMMMMMMMM','WWWWWWWWWWWWWWWWWW','WSSSSSSSSSSSSSSSSW'],
 cap:['....MMMMMM....','..MMMMMMMMMM..','.MMMHMMMMMMMM.','.MMMMMMAAMMMM.','MMMMMMMMMMMMMMMMMM','SSSSSSSSSSSSSSSSSS'],
 deck:['..MMMMMMMMMMMMMMMM..','.MMMMMMMMMMMMMMMMMM.','MMMAAAAAAAAAAAAAAMMM','MMMAAAAAAAAAAAAAAMMM','.MMMMMMMMMMMMMMMMMM.','..SSSSSSSSSSSSSSSS..'],
 can:['.WWWWWWWW.','WWWWWWWWWW','.MMMMMMMM.','MMHMMMMMMM','MMHMAAAAMM','MMHMAAAAMM','MMHMAAAAMM','MMHMMMMMMM','MMHMMMMMSM','MMHMMMMMSM','MMMMMMMMSM','MMMMMMMMSM','.MMMMMMSM.','WWWWWWWWWW','.WWWWWWWW.'],
 bag:['.WWWWWWWWWW.','.MMMMMMMMMM.','MMHMMMMMMMSM','MMHMAAAAAMSM','MMHMAAAAAMSM','MMHMAAAAAMSM','MMHMMMMMMMSM','MMHMMMMMMMSM','MMMMMMMMMMSM','MMMMMMMMMMSM','MMMMMMMMMMSM','.MMMMMMMMSM.'],
 cup:['WWWWWWWWWWWW','.WWWWWWWWWW.','.MMMMMMMMMM.','.MHMMMMMMSM.','..MHAAAAMSM.','..MHAAAAMSM.','..MHMMMMMSM.','...MMMMMMM..','...MMMMMSM..','....MMMMM...'],
 eyewear:['DDDDDDDDDDDDDDDDDD','DMMMMMMMDDMMMMMMMD','DMAAAAAMMMMAAAAAMD','DMAHAAAMMMMAHAAAMD','DMAAAAAMMMMAAAAAMD','.DMMMMMD..DMMMMMD.','..DDDDD....DDDDD..'],
 hoodie:['...MMM....MMM...','..MMMMMMMMMMMM..','.MMMMMHHMMMMMMM.','MMMMMMMMMMMMMMMM','MMMMMMMMMMMMMMMM','MMSMMMAAAAMMMSMM','MMSMMAAAAAAMMSMM','MMSMMMMMMMMMMSMM','MM.MMMMMMMMMM.MM','SS.SSSSSSSSSS.SS'],
 jeans:['MMMMMMMMMMMM','MSSSSSSSSSSM','MMMMMAMMMMMM','MMMMMMMMMMMM','MMHMMMMMMHMM','MMHMMMMMMHMM','MMHMMSSMMHMM','MMHMM..MMHMM','MMHMM..MMHMM','MMMMM..MMMMM','MMMMM..MMMMM','MMMMM..MMMMM'],
 audio:['...MMMMMMMM...','..MMHHHHHHMM..','.MM........MM.','MM..........MM','MM..........MM','MMMM......MMMM','MMAMM....MMAMM','MMAMM....MMAMM','MMAMM....MMAMM','MMMMM....MMMMM','.MMMM....MMMM.'],
 tech:['.MMMMMMMM.','MMMMMMMMMM','MAAAAAAAAM','MAHAAAAAAM','MAAAAAAAAM','MAAAAAAAAM','MAAAAAAAAM','MAAAAAAAAM','MAAAAAAAAM','MAAAAAAAAM','MMMMMMMMMM','MMMMWWMMMM'],
 gaming:['.MMM......MMM.','MMMMMMMMMMMMMM','MMDMMMMMMAMMMM','MDDDMMMMAAAMMM','MMDMMMMMMAMMMM','MMMMMMMMMMMMMM','.MMMM....MMMM.','..MM......MM..'],
 screen:['MMMMMMMMMMMMMMMM','MAAAAAAAAAAAAAAM','MAAAAAAWAAAAAAAM','MAAAAAAWWAAAAAAM','MAAAAAAWWWAAAAAM','MAAAAAAWWAAAAAAM','MAAAAAAWAAAAAAAM','MAAAAAAAAAAAAAAM','MMMMMMMMMMMMMMMM','.......SS.......','....SSSSSSSS....'],
 lipstick:['....MM....','...MMMM...','...MHMM...','...MMMM...','..WWWWWW..','..WDDDDW..','..WDHDDW..','..WDDDDW..','..WDDDDW..','..WDDDDW..','.WWWWWWWW.'],
 puffer:['..MMMMMMMMMM..','.MMMMHMMMMMMM.','MMMMMMMMMMMMMM','SSSSSSSSSSSSSS','MMMMMMMMMMMMMM','MMMMMMAAMMMMMM','SSSSSSSSSSSSSS','MMMMMMMMMMMMMM','MMMMMMMMMMMMMM','SSSSSSSSSSSSSS','MMMMMMMMMMMMMM'],
 car:['..........MMMMMMM.......','.......MMMMHHMMMMMM.....','.....MMMMAAAMAAAMMMM....','...MMMMMMMMMMMMMMMMMM...','.MMMMMMMMMMMMMMMMMMMMM..','MMMMMMMMMMMMMMMMMMMMMMM.','MMDDDMMMMMMMMMMMMDDDMMM.','.DDWDD.........DDWDD....','..DDD...........DDD.....'],
 luxury:['....MMMMMM....','...M......M...','...M......M...','..MMMMMMMMMM..','.MMHMMMMMMMMM.','.MMHMMAAMMMMM.','.MMHMMAAMMMMS.','.MMMMMMMMMMMS.','.MMMMMMMMMMMS.','.MMMMMMMMMMSS.','..SSSSSSSSSS..'],
 watch:['...DDDDDD...','...DMMMMD...','..DDDDDDDD..','.DWWWWWWWWD.','.DWAAAWAAAD.','.DWAAAWAAAD.','.DWAWWWAAAD.','.DWAAAAAAAD.','.DWWWWWWWWD.','..DDDDDDDD..','...DMMMMD...','...DDDDDD...']};
const SPR_OF={sportswear:'sneaker',fastfood:'bag',snack:'bag',coffee:'cup',streetwear:'hoodie',denim:'jeans',streaming:'screen',cosmetics:'lipstick',outdoor:'puffer',athleisure:'hoodie',drink:'can'};
const spriteOf=(b,pi)=>{if(b.id=='rolix')return'watch';if(b.id=='supreme'&&pi)return pi==1?'cap':'deck';if(b.id=='gucci'||b.id=='lv')return pi==1&&b.id=='gucci'?'sneaker':pi==2&&b.id=='lv'?'sneaker':'luxury';
 if(b.id=='radbull'||b.id=='monster'||b.id=='pepsi'||b.id=='cocacola'||b.id=='gator')return'can';if(b.id=='boze'||b.id=='beats'){return pi==2?'tech':'audio'}return SPR_OF[b.cat]||(SP[b.cat]?b.cat:'tech')};
/* colours of a product: pi 0 uses the brand accent, pi 1 the brand background, pi 2 a white body; text-safe accents */
function pal(b,pi){let c=b.c,a=b.bg;if(lum(c)<.18)c=mix(c,'#ffffff',.55);if(lum(a)>.8&&lum(c)>.8)c=mix(c,'#000000',.35);
 let M=[c,mix(a,'#ffffff',.15),'#f4f4f4'][pi%3],A=[a,c,c][pi%3];if(pi%3==1&&lum(M)<.12)M=mix(M,'#ffffff',.3);if(Math.abs(lum(M)-lum(A))<.15)A=lum(M)>.5?'#16161a':'#ffffff';
 return{M,A,S:mix(M,'#000000',.32),H:mix(M,'#ffffff',.55),W:'#f4f4f4',D:'#22242c',K:'#0b0b10'}}
function sprite(x,key,P,X,Y,sc,flip){const rows=SP[key]||SP.tech,w=Math.max(...rows.map(r=>r.length)),h=rows.length,g=[];
 for(let j=-1;j<=h;j++){g[j]=[];for(let i=-1;i<=w;i++){const ch=(rows[j]||'')[flip?w-1-i:i];g[j][i]=ch&&ch!='.'?ch:null}}
 for(let j=-1;j<=h;j++)for(let i=-1;i<=w;i++){let ch=g[j][i];if(!ch&&(g[j-1]&&g[j-1][i]||g[j+1]&&g[j+1][i]||g[j][i-1]||g[j][i+1]))ch='K';if(ch)F(x,P[ch]||P.M,X+i*sc,Y+j*sc,sc,sc)}
 return{w:w*sc,h:h*sc}}
const sw=key=>{const r=SP[key]||SP.tech;return{w:Math.max(...r.map(s=>s.length)),h:r.length}};
/* a floor shadow in dithered pixels */
function shadow(x,cx,cy,rw){for(let j=0;j<3;j++){const w=rw*(1-j*.25);F(x,'#00000044',cx-w,cy+j*2,w*2,2)}}
function sparkle(x,X,Y,c,s){F(x,c,X,Y-s,1,s*2+1);F(x,c,X-s,Y,s*2+1,1);F(x,'#fff',X,Y,1,1)}
const LG={};function logoCv(id){if(LG[id])return LG[id];const b=BRD.by(id),c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=b.bg;g.fillRect(0,0,64,64);try{b.p(g)}catch(e){}return LG[id]=c}
function logoAt(x,id,X,Y,s){F(x,'#0b0b10',X-1,Y-1,s+2,s+2);x.imageSmoothingEnabled=false;x.drawImage(logoCv(id),X,Y,s,s)}
function newBurst(x,X,Y,r){for(let a=0;a<12;a++){const t=a*Math.PI/6;for(let q=0;q<r+4;q++)F(x,'#ffd400',X+Math.cos(t)*q,Y+Math.sin(t)*q,2,2)}igxDisc(x,'#ff2d55',X,Y,r);igxDisc(x,'#ff5a7a',X-2,Y-2,r-4);const w=igxTW('NEW',2);igxTxt(x,'NEW',Math.round(X-w/2)+1,Y-4,'#7a0a22',2);igxTxt(x,'NEW',Math.round(X-w/2),Y-5,'#fff',2)}
function tag(x,s,X,Y,bg,fg){const w=igxTW(s,1)+6;F(x,'#0b0b10',X-1,Y-1,w+2,11);F(x,bg,X,Y,w,9);igxTxt(x,s,X+3,Y+2,fg,1);return w}
function nameBar(x,s,P,b){s=igxClip(s,24);const sc=igxTW(s,2)<=140?2:1,w=igxTW(s,sc);F(x,'#0b0b10',0,102,160,18);F(x,b.c,0,102,160,2);F(x,mix(b.bg,'#000000',.4),0,104,160,16);igxTxt(x,s,Math.round(80-w/2)+1,(sc==2?108:110)+1,'#000',sc);igxTxt(x,s,Math.round(80-w/2),sc==2?108:110,'#fff',sc)}

/* ---------- the four layouts ---------- */
const LAY=[
/* 0 spotlight stage: sunburst, pedestal, sparkles */
(x,p,b,pr,P,key,pi,h)=>{igxGrad(x,mix(b.bg,'#000000',.55),mix(b.bg,'#000000',.15),0,102);
 x.save();x.globalAlpha=.2;x.fillStyle=P.M;for(let i=0;i<14;i++){const a=i*Math.PI/7+(h%7)*.1;x.beginPath();x.moveTo(80,56);x.lineTo(80+Math.cos(a)*140,56+Math.sin(a)*140);x.lineTo(80+Math.cos(a+.13)*140,56+Math.sin(a+.13)*140);x.fill()}x.restore();
 for(let i=0;i<10;i++)sparkle(x,10+(hsh(h+'s'+i)%140),8+(hsh(h+'t'+i)%70),i%2?'#fff':P.M,1+i%2);
 F(x,'#0b0b10',38,84,84,18);F(x,mix(b.c,'#000000',.5),39,85,82,16);F(x,P.M,39,85,82,3);F(x,mix(b.c,'#000000',.2),39,90,82,2);for(let i=0;i<82;i+=6)F(x,'#00000033',39+i,92,2,10);
 const z=sw(key),sc=Math.max(3,Math.floor(62/Math.max(z.w,z.h)*(z.w>14?1.1:1))),W=z.w*sc,H=z.h*sc;shadow(x,80,83,W/2);sprite(x,key,P,Math.round(80-W/2),84-H-1,sc);
 logoAt(x,b.id,6,6,26);nameBar(x,pr[0],P,b);if(p.launch)newBurst(x,136,26,14);else tag(x,p.pc,118,8,'#ffd400','#16161a')},
/* 1 night billboard over a skyline */
(x,p,b,pr,P,key,pi,h)=>{igxGrad(x,'#0a0f2a',mix(b.bg,'#ff8a5a',.35),0,100);for(let i=0;i<24;i++)F(x,'#ffffffaa',hsh(h+'q'+i)%160,hsh(h+'w'+i)%46,1,1);
 for(let i=0;i<14;i++){const bw=10+hsh(h+'b'+i)%14,bh=18+hsh(h+'c'+i)%34,bx=i*12-4;F(x,'#0d1020',bx,102-bh,bw,bh);for(let yy=106-bh;yy<100;yy+=5)for(let xx=bx+2;xx<bx+bw-2;xx+=4)if(hsh(h+xx+'y'+yy)%3)F(x,hsh(xx+yy)%4?'#ffd890':'#0d1020',xx,yy,2,2)}
 F(x,'#2a2d3c',28,52,4,50);F(x,'#2a2d3c',128,52,4,50);F(x,'#0b0b10',14,8,132,60);F(x,'#3a3f55',16,10,128,56);F(x,b.bg,18,12,124,52);
 for(let i=0;i<124;i+=8)F(x,b.c+'33',18+i,12,3,52);F(x,b.c,18,12,124,3);F(x,b.c,18,61,124,3);
 for(let i=0;i<8;i++){F(x,'#fff6c0',20+i*16,5,6,3);x.save();x.globalAlpha=.1;x.fillStyle='#fff6c0';x.beginPath();x.moveTo(23+i*16,8);x.lineTo(10+i*16,62);x.lineTo(40+i*16,62);x.fill();x.restore()}
 const z=sw(key),sc=Math.max(2,Math.floor(40/Math.max(z.w,z.h)*1.15)),W=z.w*sc;sprite(x,key,P,Math.round(52-W/2),18+Math.round((44-z.h*sc)/2),sc);
 logoAt(x,b.id,100,18,28);const s=igxClip(pr[0],12),w=igxTW(s,1);igxTxt(x,s,Math.round(114-w/2),50,'#fff',1);
 F(x,'#0b0b10',0,100,160,20);F(x,'#16161a',0,102,160,18);for(let i=0;i<160;i+=16)F(x,'#ffd400',i,110,8,2);
 const t=igxClip(pr[1],36);igxTxt(x,t,Math.round(80-igxTW(t,1)/2),105,'#d8dce8',1);tag(x,p.pc,6,86,'#ffd400','#16161a');if(p.launch)newBurst(x,136,86,12)},
/* 2 split poster with halftone and a big name */
(x,p,b,pr,P,key,pi,h)=>{F(x,b.bg,0,0,160,120);x.save();x.beginPath();x.moveTo(0,0);x.lineTo(104,0);x.lineTo(60,120);x.lineTo(0,120);x.closePath();x.fillStyle=mix(b.c,'#000000',lum(b.c)>.5?.1:0);x.fill();x.restore();
 for(let j=0;j<14;j++)for(let i=0;i<22;i++){const X=i*8+(j%2)*4,Y=j*8+4;if(X<92-j*3.6){const r=Math.max(0,Math.min(3,3-Math.abs(X-30)/22));if(r>=1)F(x,mix(b.c,'#000000',.22),X,Y,Math.round(r),Math.round(r))}}
 const z=sw(key),sc=Math.max(3,Math.floor(58/Math.max(z.w,z.h))),W=z.w*sc,H=z.h*sc;shadow(x,46,96,W/2);sprite(x,key,P,Math.round(46-W/2),Math.round(94-H),sc,hsh(b.id)%2);
 const wds=String(pr[0]).toUpperCase().replace(/[^A-Z0-9 ]/g,'').split(' ').slice(0,3);let yy=14;const tc=lum(b.bg)>.55?'#16161a':'#ffffff';
 wds.forEach(wd=>{const sc2=igxTW(wd,3)<=70?3:igxTW(wd,2)<=70?2:1,xx=156-igxTW(wd,sc2);igxTxt(x,wd,xx+1,yy+1,'#000a',sc2);igxTxt(x,wd,xx,yy,tc,sc2);yy+=sc2*6+3});
 {const ws=igxClip(pr[1],60).split(' ');let ln='',L=[];ws.forEach(w=>{if(igxTW(ln+' '+w,1)>56&&ln){L.push(ln);ln=w}else ln=ln?ln+' '+w:w});L.push(ln);L.slice(0,3).forEach((q,i)=>igxTxt(x,q,156-igxTW(q,1),yy+4+i*7,tc,1))}
 logoAt(x,b.id,126,88,26);igxDisc(x,'#ffd400',22,22,14);igxDisc(x,'#ff2d55',22,22,11);const w=igxTW(p.pc,1);igxTxt(x,p.pc,Math.round(22-w/2),20,'#fff',1);if(p.launch)tag(x,'NEW DROP',6,106,'#ff2d55','#fff')},
/* 3 shop window with three of the product in the brand's colours */
(x,p,b,pr,P,key,pi,h)=>{igxGrad(x,mix(b.bg,'#000000',.25),mix(b.bg,'#000000',.55),0,120);F(x,'#0b0b10',0,0,160,16);F(x,b.c,0,16,160,2);
 const nm=igxClip(b.n,18),w=igxTW(nm,2);igxTxt(x,nm,Math.round(80-w/2),4,b.c,2);
 for(let i=0;i<3;i++){const cx=30+i*50;x.save();x.globalAlpha=.16;x.fillStyle='#fff6c0';x.beginPath();x.moveTo(cx,20);x.lineTo(cx-26,100);x.lineTo(cx+26,100);x.fill();x.restore()}
 F(x,'#0b0b10',6,98,148,5);F(x,mix(b.c,'#000000',.55),6,98,148,2);
 const z=sw(key),sc=Math.max(2,Math.floor(36/Math.max(z.w,z.h)*1.2));
 for(let i=0;i<3;i++){const cx=30+i*50,P2=pal(b,(pi+i)%3),W=z.w*sc;sprite(x,key,P2,Math.round(cx-W/2),97-z.h*sc,sc,i==1&&hsh(b.id)%2);
  }
 const t=igxClip(pr[0],20);igxTxt(x,t,6,108,'#fff',1);{const s=p.pc,w2=igxTW(s,1)+6;F(x,'#0b0b10',154-w2,105,w2+2,11);F(x,'#ffd400',155-w2,106,w2,9);igxTxt(x,s,158-w2,108,'#16161a',1)}
 x.save();x.globalAlpha=.9;F(x,'#ff2d55',2,22,3,3);x.restore();if(p.launch)newBurst(x,136,40,13);logoAt(x,b.id,6,24,22)}
];
function PIC(p){const b=BRD.by(p.brandAd),pi=p.prod|0,pr=(BRD.postProducts[b.id]||[])[pi]||[b.n,''],k=document.createElement('canvas');k.width=160;k.height=120;const x=k.getContext('2d');
 x.imageSmoothingEnabled=false;const key=spriteOf(b,pi),P=pal(b,pi);LAY[(p.lay|0)%LAY.length](x,p,b,pr,P,key,pi,p.h|0);
 /* a dithered vignette keeps every layout in the same pixel look */
 for(let i=0;i<160;i+=2){F(x,'#0000001a',i,0,1,1);F(x,'#0000001a',i+1,119,1,1)}
 return k.toDataURL()}
{const pp0=postPic;postPic=function(p){if(p&&p.brandAd&&p.v2){try{if(PICS[p.id])return PICS[p.id];return PICS[p.id]=PIC(p)}catch(e){console.warn('brand ad v2',e)}}return pp0.apply(this,arguments)}}
BRD.adPic=PIC;
})();
