/* ===== dev only: Pier Fishing, a calm fishing minigame on the north shore of the island (v55.16.0) =====
   Loaded after dev-surf-v1.js. Add ?nofish to skip it. Nothing runs unless the island is on.
   PLACE   A short wooden fishing pier with a T-shaped head on the north shore (west of the Lighthouse pier, nothing else is near it), a
           Bait & Tackle hut with a service window (rods, bait, selling fish, gifting rare ones), a rod rack, buckets, crates, benches, a
           drying rack, a beached rowboat, a Fishing Board (today's tide, weather, records, the fish that is biting), lanterns that glow
           at dusk, two cats and four seagulls that react to what you do, and two NPC anglers (Old Mara and Pete) built with buildChar.
           Real metres, blocky, every static prop is merged into a few meshes (vertex colours). Props are solid (cols); you walk the planks.
   PLAY    E at a fishing spot equips your rod. Mouse (or A/D) aims, HOLD the mouse or Space to charge the power meter and RELEASE to cast
           (the gold band at the top is a perfect cast). The bobber floats; small dips are NIBBLES (do nothing), a big dunk with a splash
           and a sound is a BITE: press SPACE or click inside the ring to set the hook. Then the REEL-IN, like the Mix in the studio: the fish
           swims up and down a water column; HOLD to lift the green bar, let go to sink it, and keep the fish inside it so the catch meter
           fills (it drains outside). Dashes shoot the fish up or down. Full meter = landed, empty = it got away. The catch card shows size, weight, rarity and records. Esc pauses.
           Keys: A/D aim, W twitch the lure, S reel in, Q/E change spot while idle, J journal, Esc pause.
   FISH    26 entries (20 fish, junk and one treasure chest) chosen by water depth (from where it lands), time of day, weather, tide, bait,
           your rod and the fish of the day. Rods unlock reach (deeper water) and strength (bigger fish); baits attract kinds of fish.
   STATE   S.fish={caught:{id:{n,best,len,first}},rod,rods,bait,baits,earn,inv,rec,..} (lazy, old saves start empty, saved with the rest of S).
   HOOKS   FW_MASTERY.add('fish',..) after every catch (guarded). Test hook: window.FW_FISH (see the bottom).
   Mode is 'fish' while a session runs (own key handling in the capture phase, own camera through a renderer.render wrapper, HUD #fishhud). */
(function(){
if(!window.FW_ISLAND||/[?&]nofish/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined'||typeof renderer=='undefined'||typeof cam=='undefined'||typeof P=='undefined')return;
const FI=window.FW_ISLAND,GR=FI.grass,CO=FI.coast;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rr=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1)),pk=a=>a[Math.floor(Math.random()*a.length)];
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const sn=k=>{try{snd(k)}catch(e){}},say2=t=>{try{say(t)}catch(e){}},sv=()=>{try{autoSave()}catch(e){}};
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};
const inPoly=(Q,x,z)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const softSeen={};function soft(e,t){if(!softSeen[t]){softSeen[t]=1;console.error('fish '+t,e)}}
const dayNo=()=>Math.max(1,S.day||1);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');

/* ---------- saved state (lazy, old saves start empty) ---------- */
const st=()=>{let o=S.fish;if(!o||typeof o!='object')o=S.fish={};
 const d={rod:0,rods:1,bait:'worm',earn:0,sessions:0,casts:0,bites:0,lost:0,snaps:0,gifted:0,sold:0,tales:0};
 for(const k in d)if(typeof o[k]!=typeof d[k])o[k]=d[k];
 if(!o.caught||typeof o.caught!='object')o.caught={};if(!o.baits||typeof o.baits!='object')o.baits={};if(!Array.isArray(o.inv))o.inv=[];
 if(!o.rec||typeof o.rec!='object')o.rec={w:0,id:'',len:0};if(!(o.rods&1))o.rods|=1;if(o.rod<0||o.rod>4||!(o.rods>>o.rod&1))o.rod=0;return o};

/* ---------- the gear ---------- */
const RODS=[
 {n:'Bamboo Pole',reach:8,pow:1,reel:.075,zone:0,luck:0,col:'#c9a35a',len:2.3,price:0,tx:'A cane pole with a bit of string. Short cast, gentle fish.'},
 {n:'Fiberglass Rod',reach:14,pow:1.25,reel:.09,zone:.012,luck:.06,col:'#4aa3d8',len:2.6,price:150,tx:'Casts past the drop-off into open water. Stronger line.'},
 {n:'Graphite Spinner',reach:24,pow:1.55,reel:.105,zone:.024,luck:.12,col:'#3b4252',len:2.9,price:520,tx:'A long cast and a quick reel. Strong enough for barracuda and tuna.'},
 {n:'Deepwater Rod',reach:36,pow:1.9,reel:.12,zone:.036,luck:.2,col:'#c0392b',len:3.2,price:1500,tx:'Reaches the trench. Stays calm against sharks.'},
 {n:'Master Angler Rod',reach:50,pow:2.4,reel:.14,zone:.05,luck:.3,col:'#e6b422',len:3.4,price:4200,tx:'Gold-wrapped. The long game: swordfish and legends.'}];
const BAITS={worm:{n:'Worm',at:1,pack:0,price:0,c:'#d98a8a',tx:'Free from the bucket. Small fish love them.'},
 dough:{n:'Bread dough',at:.95,pack:10,price:8,c:'#f0dcae',tx:'Sunfish, herring and shy golden things like it.'},
 shrimp:{n:'Shrimp',at:1.15,pack:8,price:14,c:'#ff9a7a',tx:'Crabs, flounder, snapper and rays.'},
 minnow:{n:'Live minnow',at:1.2,pack:6,price:20,c:'#bcd4e0',tx:'Predators: bass, barracuda, tuna, sharks.'},
 glow:{n:'Glow jelly',at:1.1,pack:5,price:28,c:'#7ff3ff',tx:'Glows in the dark. Squid and the deep night fish.'},
 roe:{n:'Golden roe',at:1.3,pack:4,price:60,c:'#ffc844',tx:'The premium bait: legends and the biggest fish.'}};
const BORD=['worm','dough','shrimp','minnow','glow','roe'];
const RAR=['Common','Uncommon','Rare','Epic','Legendary'],RARC=['#c4ced4','#6be08c','#4aa3ff','#c58cff','#ffd23d'],JUNKC='#9a8f80';
const BANDN=['Shallows','Open water','Deep water','The trench'],TODN=['Dawn','Day','Dusk','Night'],WXN=['Sunny','Rain','Fog','Storm'],TIDEN=['Low tide','Rising tide','High tide','Falling tide'];
const BANDU=[14,34,58];/* metres out from the waterline where a band ends */
const bandOfU=u=>u<BANDU[0]?0:u<BANDU[1]?1:u<BANDU[2]?2:3;

/* ---------- the fish: id,name,rarity,kind,weight range,price,band/time/weather/tide weights,bait weights,minimum rod,behaviour,length factor,text ----------
   beh = [pull, agility, burst gap min, max, burst length, thrash, stamina]; band = shallows, open, deep, trench; time = dawn, day, dusk, night; weather = sun, rain, fog, storm; tide = low, rise, high, fall */
const SP=[];
function sp(id,n,r,k,w0,w1,pr,bd,tm,wx,td,bt,rod,beh,lk,tx,bw){SP.push({id,n,r,k,w0,w1,pr,bd,tm,wx,td,bt,rod,beh,lk,tx,bw:bw!=null?bw:[1,.5,.2,.07,.025][r]})}
const ALLB={worm:1,dough:1,shrimp:1,minnow:1,glow:1,roe:1},T1=[1,1,1,1];
sp('minnow','Silver Minnow',0,'f',.02,.07,3,[1.3,.9,0,0],[1,1,1,.5],[1,1,.8,.6],T1,{worm:1.4,dough:1.2,shrimp:.6,minnow:.1,glow:.3,roe:.2},0,[.12,1.4,3,6,.4,.1,.3],17,'A flash of silver. Great live bait, better company.');
sp('sunfish','Sunfish',0,'f',.1,.5,5,[1.2,.8,0,0],[.8,1.4,.8,.2],[1.2,.7,.6,.3],T1,{worm:1.3,dough:1.5,shrimp:.7,minnow:.3,glow:.2,roe:.4},0,[.18,1.1,3,6,.5,.15,.4],30,'Round, orange and always in a good mood.');
sp('perch','Pier Perch',0,'f',.2,1.1,8,[.8,1.2,.4,0],[1.2,1,1.2,.8],[1,1.3,1,.8],[.8,1.3,1,.8],{worm:1.3,dough:.8,shrimp:1.2,minnow:1,glow:.4,roe:.5},0,[.22,1.2,3,6,.5,.2,.5],36,'Lives under the pier and has opinions about it.');
sp('herring','Herring',0,'f',.1,.4,6,[0,1.2,1,0],[1.3,1,1.2,.5],[1,1,1.3,.6],[1,1.2,1.2,1],{worm:.8,dough:1.1,shrimp:1.3,minnow:.7,glow:.4,roe:.4},0,[.2,1.6,2.5,5,.5,.15,.4],34,'Travels in a crowd. This one got lost from it.');
sp('mackerel','Mackerel',0,'f',.3,1.6,11,[0,1,1.3,.3],[1.4,1,1.3,.7],[1,1.2,1,.8],T1,{worm:.6,dough:.3,shrimp:1.3,minnow:1.4,glow:.5,roe:.8},0,[.3,1.5,2.5,5,.6,.2,.6],38,'Stripes like a tiny tiger and just as quick.');
sp('flounder','Flounder',1,'f',.6,3.5,22,[1.3,1.3,.3,0],[1,1.2,1,1.2],[1,1.4,1,.8],[1.4,1,.8,1],{worm:1.2,dough:.4,shrimp:1.8,minnow:.7,glow:.3,roe:.8},0,[.35,.7,3.5,7,.8,.3,.6],38,'Both eyes on one side. Still misses everything.');
sp('crab','Blue Crab',1,'f',.2,.9,18,[1.5,.8,0,0],[1,.8,1,1.6],[1,1,1,.8],[.8,1,1.6,1.2],{worm:1.2,dough:.3,shrimp:1.8,minnow:.4,glow:.2,roe:.3},0,[.3,1.4,2,4,.6,.9,.5],26,'Sideways attitude, claws up. Pinches on principle.');
sp('puffer','Pufferfish',1,'f',.3,1.8,20,[.4,1.4,.8,0],[.8,1.5,1,.3],[1.5,.5,.5,.2],T1,{worm:.8,dough:1,shrimp:1.3,minnow:.5,glow:.2,roe:.5},0,[.35,.8,2.5,5,.7,.5,.7],24,'Puffs up when upset. It is upset right now.');
sp('bass','Sea Bass',1,'f',1,6,32,[0,.9,1.4,.5],[1.3,.8,1.3,1.5],[1,1.3,1.2,1],[1,1.4,1,.8],{worm:.5,dough:.1,shrimp:1.3,minnow:1.8,glow:.6,roe:1},1,[.5,1.1,2.8,5.5,.9,.3,.8],40,'A proper dinner. Knows it and acts like it.');
sp('eel','Silver Eel',1,'f',.5,2.2,28,[1,1.2,.5,0],[.5,.3,1,2.4],[.8,1.5,1.5,1.2],[1.2,1,1,1],{worm:1.8,dough:.1,shrimp:.8,minnow:1.2,glow:.6,roe:.3},0,[.4,.9,2,4,.8,.8,.7],60,'Slippery in every possible way. Do not hold it.');
sp('squid','Squid',1,'f',.4,2.5,26,[0,.8,1.4,.8],[.5,.2,1.2,2.5],[.8,1,1.3,1],T1,{worm:.3,dough:0,shrimp:1.3,minnow:1,glow:2.4,roe:.8},1,[.4,1.5,2,4,.7,.5,.6],34,'Squirts ink when you stare. So you stare.');
sp('snapper','Red Snapper',2,'f',1.5,8,60,[0,.4,1.4,1],[1.2,1.2,1,.7],[1.2,.8,.8,.5],[1,1.2,1.3,.9],{worm:.2,dough:0,shrimp:1.6,minnow:1.5,glow:.5,roe:1.5},1,[.6,1.1,2.5,5,1,.4,.9],38,'Red as a fire truck and twice as loud on the line.');
sp('barracuda','Barracuda',2,'f',2,12,75,[0,.3,1.2,1.4],T1.map((v,i)=>[1,1,1.2,.8][i]),[1.3,.8,.8,1],T1,{worm:0,dough:0,shrimp:.8,minnow:2.2,glow:.5,roe:1},2,[.8,2,1.8,3.5,.8,.4,.8],48,'All teeth and bad manners. Fast, so be ready.');
sp('tuna','Yellowfin Tuna',2,'f',8,40,160,[0,0,.6,1.6],[1.3,1.1,1,.5],[1.2,.8,.7,.6],T1,{worm:0,dough:0,shrimp:.4,minnow:1.8,glow:.3,roe:1.6},2,[1,.9,3,5.5,1.6,.1,1.2],34,'A torpedo with fins. It will pull and keep pulling.');
sp('ray','Eagle Ray',2,'f',4,25,110,[0,0,1,1.2],[1,1.2,1,.8],[1.2,.8,1,1],T1,{worm:0,dough:0,shrimp:1.8,minnow:1.2,glow:.4,roe:.8},2,[.9,.8,2,4,1.5,.9,1],38,'Glides like it is flying. Flaps like it is annoyed.');
sp('shark','Hammerhead',3,'f',30,150,600,[0,0,.3,1.2],[.8,.6,1,1.6],[.6,1,1.2,2.4],T1,{worm:0,dough:0,shrimp:.2,minnow:1.8,glow:.2,roe:1.4},3,[1.15,1,2,3.5,1.4,.5,1.4],36,'The head is a hammer and the mood is a storm.');
sp('sword','Swordfish',3,'f',20,120,520,[0,0,.3,1.4],[1.5,.5,1.3,.6],[1,1,1,1.4],[1,1,1.4,1],{worm:0,dough:0,shrimp:0,minnow:1.6,glow:.5,roe:2.4},4,[1.3,1.3,1.8,3.2,1.2,.3,1.5],54,'Brings its own sword. Politely asks you to let go.');
sp('glowfin','Glowfin Lanternfish',3,'f',.3,2.4,420,[0,0,1,1.6],[0,0,.3,3],[1,1,1.4,1.2],T1,{worm:0,dough:0,shrimp:.6,minnow:.5,glow:3.5,roe:1},2,[.45,1.3,2.5,5,.9,.4,.7],40,'A deep sea fish with its own lantern. It only comes up in the dark.');
sp('koi','Golden Koi',4,'f',.8,3.2,900,[1.5,1,0,0],[2.2,.3,1.1,0],[2,.3,.2,0],[.8,1.2,2,.8],{worm:.2,dough:3,shrimp:.2,minnow:0,glow:0,roe:2.5},1,[.5,.9,2.5,5,.9,.2,1],40,'A legend of the pier. Shows up at sunrise, when the sea is calm, for dough.');
sp('oar','Moonlit Oarfish',4,'f',8,60,1400,[0,0,.5,1.5],[0,0,0,3],[.5,1.2,2.5,2],T1,{worm:0,dough:0,shrimp:0,minnow:.5,glow:2.5,roe:2},3,[.9,.6,2.5,5,1.3,.4,1.3],110,'A silver ribbon from the deep. Only seen on dark, wet nights.');
sp('boot','Old Boot',0,'j',.4,.9,1,[1,1,.8,.4],T1,T1,T1,ALLB,0,[.08,.1,9,9,.1,0,.2],30,'Left foot, size 14. Somebody is having a worse day than you.',.3);
sp('can','Rusty Can',0,'j',.1,.3,1,[1,1,.6,.2],T1,T1,T1,ALLB,0,[.08,.1,9,9,.1,0,.2],20,'Vintage "Fern Cola". At least it is recycling.',.3);
sp('weed','Tangled Seaweed',0,'j',.3,1.2,1,[1.2,1,.4,0],T1,[1,1.3,1.2,1.4],[1.3,1,.8,1],ALLB,0,[.12,.2,8,9,.2,0,.2],40,'A free salad. Smells exactly like low tide.',.34);
sp('duck','Rubber Duck',1,'j',.05,.1,15,[1,1,.5,.2],T1,T1,T1,ALLB,0,[.06,.1,9,9,.1,0,.1],20,'Squeaks when squeezed. The duck has seen things.',.05);
sp('bottle','Message in a Bottle',1,'j',.2,.4,12,[.7,1,.9,.4],T1,[1,1,1.4,1.4],T1,ALLB,0,[.1,.1,9,9,.1,0,.2],26,'"HELP! I am stuck on an island with no snacks." Dated four years ago.',.07);
sp('chest','Treasure Chest',3,'t',4,9,250,[0,.2,.8,1],T1,[1,1,1.3,1.5],T1,ALLB,1,[.35,.15,9,9,.2,0,.3],30,'Barnacled, heavy and rattling with old coins. Finders keepers.',.03);
const SPI={};SP.forEach((s,i)=>{s.i=i;SPI[s.id]=s});
const NFISH=SP.filter(s=>s.k=='f').length;

/* ---------- time, weather, tide, the fish of the day ---------- */
const hourNow=()=>{try{return(festMins()/60)%24}catch(e){return 12}};
const todOf=h=>h>=6&&h<9?0:h>=9&&h<17?1:h>=17&&h<20?2:3;
const wxNow=()=>{const k=S.wx&&S.wx.d===S.day?S.wx.k:'sun';return k=='rain'?1:k=='fog'?2:k=='storm'?3:0};
const TP=745.2,TPH=420;/* tide period (12 h 25 min) and the minute of day 1 when the first high tide comes */
function tideAt(day,m){const a=(day-1)*1440+m,ph=(((a-TPH)/TP)%1+1)%1,h=.5+.5*Math.cos(ph*6.2832),k=ph<.08||ph>=.92?2:ph<.42?3:ph<.58?0:1;return{ph,h,k}}
const clk=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
function tideList(day){const out=[],m0=360,m1=1560,a0=(day-1)*1440;for(let n=-2;n<5;n++){[[TPH+n*TP,'High'],[TPH+(n+.5)*TP,'Low']].forEach(([a,k])=>{const m=a-a0;if(m>=m0&&m<=m1)out.push([m,k])})}return out.sort((a,b)=>a[0]-b[0])}
const HOTS=SP.filter(s=>s.k=='f'&&s.r<=2&&s.rod<=2);
const hotOf=day=>HOTS[Math.floor(hash(day*7.13)*HOTS.length)].id;
function env(){const m=(()=>{try{return festMins()}catch(e){return 720}})(),h=(m/60)%24,o=st(),t=tideAt(dayNo(),m);return{tod:todOf(h),wx:wxNow(),tide:t.k,tideH:t.h,hot:hotOf(dayNo()),rod:o.rod,bait:o.bait,h,m}}
function weights(c){let tot=0;const w=SP.map(s=>{let v=s.bw*s.bd[c.band]*s.tm[c.tod]*s.wx[c.wx]*s.td[c.tide];
  const b=s.bt[c.bait];v*=b!=null?b:s.k=='f'?.55:1;if(c.rod<s.rod)v=0;if(s.id===c.hot)v*=2.6;v*=1+(c.luck||0)*s.r*.9;v=Math.max(0,v);tot+=v;return v});return{w,tot}}
function rollSpecies(c){const {w,tot}=weights(c);if(tot<=0)return SPI.weed;let x=Math.random()*tot;for(let i=0;i<w.length;i++){x-=w[i];if(x<=0)return SP[i]}return SPI.weed}
/* the size: most fish are on the small side, better gear and a perfect hook shift it up */
function rollFish(s,luck){const sz=Math.pow(Math.random(),clamp(1.85-(luck||0)*1.3,.9,2));let w=lerp(s.w0,s.w1,sz);w=w<.1?Math.round(w*1000)/1000:Math.round(w*100)/100;
 return{id:s.id,w,l:Math.max(3,Math.round(s.lk*Math.cbrt(w))),sz}}
const priceOf=(s,sz)=>Math.max(1,Math.round(s.pr*(.55+.9*Math.pow(sz,1.2))*(sz>.88?1.15:1)));
const fmtW=w=>w<1?Math.round(w*1000)+' g':(w<10?w.toFixed(2):w<100?w.toFixed(1):Math.round(w))+' kg';
const szOf=(s,w)=>clamp((w-s.w0)/((s.w1-s.w0)||1),0,1);

/* ---------- pixel art for every entry: a list of rects on a grid, drawn flat on a canvas (card, journal) and extruded for the 3D model ---------- */
const ARTC={};
function fishArt(o){const L=o.L,H=o.H,TL=o.tl||6,sn2=o.snout||0,gw=L+TL+sn2+1,gh=H+(o.dh||5),yc=Math.floor(gh/2),r=[],X0=TL,tops=[],bots=[];
 for(let i=0;i<L;i++){const t=(i+.5)/L,h=Math.max(.5,Math.pow(Math.sin(Math.PI*Math.pow(t,o.pk||1.4)),.7)*H/2*(o.fat||1)),n=Math.max(1,Math.round(h*2)),yb=Math.round(yc-n/2),
   nb=Math.max(1,Math.round(n*.3)),nv=Math.max(1,Math.round(n*.28)),nm=Math.max(0,n-nb-nv),dp=n*.55+.5;let mc=o.m;if(o.st&&i>2&&i<L-3&&i%o.st[1]<(o.st[2]||1))mc=o.st[0];
   r.push([X0+i,yb,1,nv,o.v,dp]);if(nm>0)r.push([X0+i,yb+nv,1,nm,mc,dp]);r.push([X0+i,yb+nv+nm,1,nb,o.b,dp]);tops[i]=yb+n;bots[i]=yb}
 for(let j=0;j<TL;j++){const ht=.6+(TL-1-j)*.46*(o.tw||1),gap=o.fork===false?0:Math.max(0,(TL-3-j)*.35),y0=Math.round(yc-ht),y1=Math.round(yc+ht);
  if(gap>.4){const g=Math.round(gap);r.push([j,y0,1,Math.max(1,yc-g-y0),o.f,.8]);r.push([j,yc+g,1,Math.max(1,y1-yc-g),o.f,.8])}else r.push([j,y0,1,Math.max(1,y1-y0),o.f,.8])}
 if(!o.nodorsal){const a=Math.round(L*.34),wd=Math.max(3,Math.round(L*.3)),fh=Math.max(2,Math.round(H*.5*(o.df||1)));for(let k=0;k<wd;k++){const hk=Math.max(1,Math.round(fh*(1-k/wd)));r.push([X0+a+k,tops[a+k],1,hk,o.f,.7])}}
 {const a=Math.round(L*.5);for(let k=0;k<3;k++)r.push([X0+a+k,bots[a+k]-Math.max(1,2-k),1,Math.max(1,2-k),o.f,.7]);const a2=Math.round(L*.22);for(let k=0;k<3;k++)r.push([X0+a2+k,bots[a2+k]-1,1,1,o.f,.7])}
 const ey=Math.round(yc+Math.max(0,H*.16)),ex=X0+L-Math.max(3,Math.round(L*.16));r.push([ex,ey,1,1,'#ffffff',1]);r.push([ex+1,ey,1,1,'#101418',1.1]);
 r.push([X0+L-Math.max(5,Math.round(L*.27)),Math.round(yc-H*.2),1,Math.max(2,Math.round(H*.4)),o.g||'#00000033',.3]);
 if(o.sp){let q=o.seed||3;for(let k=0;k<(o.spn||10);k++){q=(q*16807)%2147483647;const i=2+q%Math.max(2,L-5);q=(q*16807)%2147483647;const y=bots[i]+q%Math.max(1,tops[i]-bots[i]);r.push([X0+i,y,1,1,o.sp,.9])}}
 if(o.glow){let q=7;for(let k=0;k<(o.glowN||9);k++){q=(q*16807)%2147483647;const i=3+q%Math.max(2,L-6);const y=bots[i]+(k%2)*Math.max(1,(tops[i]-bots[i])-1);r.push([X0+i,y,1,1,o.glow,1,1])}}
 if(o.bill)r.push([X0+L,yc+Math.round(H*.2),o.bill,1,o.bc||'#8da2b8',.6]);
 if(o.hammer){r.push([X0+L-2,yc-4,2,9,o.b,3]);r.push([X0+L-2,yc-4,2,1,o.v,3]);r.push([X0+L-1,yc+3,1,1,'#fff',3.1])}
 if(o.crest)for(let i=2;i<L-2;i++)r.push([X0+i,tops[i],1,2,o.crest,.5]);
 if(o.lure){r.push([X0+L-2,tops[L-3]+1,1,3,'#2b4a5c',.4]);r.push([X0+L-1,tops[L-3]+4,2,2,o.lure,1,1])}
 if(o.whisk){r.push([X0+L,yc-1,2,1,'#fff6c8',.3]);r.push([X0+L,yc-2,1,1,'#fff6c8',.3])}
 if(o.spike)for(let i=3;i<L-2;i+=2){r.push([X0+i,tops[i],1,1,'#c9b890',.6]);r.push([X0+i,bots[i]-1,1,1,'#c9b890',.6])}
 return{gw,gh,r}}
const F=(id,o)=>ARTC[id]=()=>fishArt(o);
F('minnow',{L:10,H:3,b:'#8aa6b8',m:'#d6e4ec',v:'#f4f8fa',f:'#b9ccd8',tl:4,df:.8});
F('sunfish',{L:11,H:9,fat:1.05,b:'#e79a2c',m:'#f2c24a',v:'#ffe9a8',f:'#e8741c',tl:3,sp:'#2e8bc2',spn:8,df:1.1,tw:.8,fork:false});
F('perch',{L:16,H:7,b:'#4d7a3a',m:'#9aba52',v:'#f0efb8',f:'#e0542a',st:['#3b5c2c',4,1],tl:4,df:1.1});
F('herring',{L:16,H:5,b:'#3f6f94',m:'#c5d8e4',v:'#f3f6f8',f:'#8aa6b8',tl:5});
F('mackerel',{L:19,H:6,b:'#2f8a8a',m:'#9ac8d0',v:'#eef4f4',f:'#3c6e78',st:['#1c3f4a',3,1],tl:5,df:.9});
F('puffer',{L:11,H:11,fat:1.05,b:'#b99a5a',m:'#e8d49a',v:'#fff4d0',f:'#c9a85a',tl:3,sp:'#6a5230',spn:12,spike:1,tw:.6,fork:false,df:.6});
F('bass',{L:22,H:9,b:'#3f5a3a',m:'#aebb8c',v:'#f2f0d8',f:'#5f7d52',tl:6,g:'#243420',df:1.2});
F('eel',{L:30,H:3,b:'#3a4a58',m:'#aab6c0',v:'#dfe6ea',f:'#7a8c9a',tl:3,nodorsal:true,fork:false,dh:3});
F('snapper',{L:20,H:10,b:'#d9442e',m:'#e8664a',v:'#f6bfae',f:'#c8321e',tl:5,df:1.2,g:'#a02a1a'});
F('barracuda',{L:28,H:6,b:'#4f6270',m:'#a8b6c0',v:'#eef0f2',f:'#6c7e8c',st:['#566a78',5,1],tl:6,snout:2,df:.8});
F('tuna',{L:26,H:11,b:'#1f3f6a',m:'#6f8fb4',v:'#e8eef4',f:'#f2c82e',tl:6,df:1.2,g:'#16304f',fat:1.05});
F('sword',{L:30,H:9,b:'#26405f',m:'#6d86a2',v:'#e6edf3',f:'#33506f',tl:6,bill:9,snout:9,df:1.7});
F('koi',{L:20,H:8,b:'#f2b21a',m:'#ffd04a',v:'#fff0b0',f:'#ffcf3a',sp:'#fff7d0',spn:14,seed:11,tl:5,whisk:1,fat:1.05,df:1,g:'#c88a10'});
F('glowfin',{L:18,H:9,b:'#14203e',m:'#243764',v:'#3a5686',f:'#2a4a7c',glow:'#7ff3ff',glowN:11,lure:'#7ff3ff',tl:5,fat:1.1,g:'#0c142c',df:1.2});
F('oar',{L:40,H:5,b:'#aeb8c6',m:'#dbe2ea',v:'#f4f7fa',f:'#e6405a',crest:'#e6405a',tl:5,whisk:0,nodorsal:true,dh:7,g:'#7a8696'});
F('shark',{L:30,H:9,b:'#5a6a78',m:'#8a9aa8',v:'#e4eaee',f:'#4a5a68',tl:7,hammer:1,df:1.7,g:'#36444f'});
ARTC.flounder=()=>{const B='#8a7a52',M='#b9a874',D='#5f5236',Fn='#a8955a',r=[];/* a flatfish seen from above: an oval, a fringe of fin, both eyes on one side */
 for(let i=0;i<16;i++){const t=(i+.5)/16,h=Math.max(1,Math.round(Math.sin(Math.PI*Math.pow(t,.8))*6.2));r.push([5+i,7-h-1,1,1,Fn,.8]);r.push([5+i,7+h,1,1,Fn,.8]);r.push([5+i,7-h,1,h*2,i%4==1?M:B,2.4])}
 for(let j=0;j<5;j++){const ht=Math.round(.8+(4-j)*.55);r.push([j,7-ht,1,ht*2,Fn,.9])}
 [[8,5],[11,9],[13,6],[10,7],[15,8],[7,9]].forEach(a=>r.push([a[0]+1,a[1],1,1,D,2.5]));[[9,4],[12,10],[14,7]].forEach(a=>r.push([a[0]+1,a[1],1,1,'#d8c890',2.5]));
 r.push([17,5,2,2,'#ffffff',3]);r.push([18,5,1,1,'#101418',3.2]);r.push([17,8,2,2,'#ffffff',3]);r.push([18,8,1,1,'#101418',3.2]);
 return{gw:22,gh:15,r}};
ARTC.crab=()=>{const B='#2f6fb5',L2='#5aa0e0',D='#1f4c85',O='#e8742c',r=[[4,3,10,5,B,4],[5,8,8,1,L2,3],[4,7,10,1,L2,3],[3,4,1,3,B,3],[14,4,1,3,B,3],[1,9,2,3,O,1.4],[0,11,1,2,O,1.4],[2,11,1,2,O,1.4],[15,9,2,3,O,1.4],[14,11,1,2,O,1.4],[16,11,1,2,O,1.4],[3,9,2,1,B,1.4],[14,9,2,1,B,1.4]];
 for(let k=0;k<4;k++){r.push([2-(k>1?0:0),2-(k%2),2,1,D,.8]);r.push([14,2-(k%2),2,1,D,.8])}
 [[0,1],[1,0],[0,3],[2,1]].forEach(([a,b])=>r.push([3+a*0,b,1,1,D,.8]));for(let k=0;k<4;k++){r.push([4+k*2,2,1,1,D,.8]);r.push([4+k*2,1,1,1,D,.8])}
 r.push([6,9,1,2,'#fff',.6]);r.push([6,10,1,1,'#111',.7]);r.push([11,9,1,2,'#fff',.6]);r.push([11,10,1,1,'#111',.7]);r.push([7,5,4,1,L2,3.1]);return{gw:18,gh:14,r}};
ARTC.squid=()=>{const B='#e8a0a8',D='#c8707c',r=[];for(let i=0;i<14;i++){const t=i/13,h=Math.round(1+Math.sin(Math.PI*Math.min(1,t*1.15))*3.5);r.push([8+i,6-h,1,h*2,i%3==0?D:B,h*.9+.5])}
 r.push([20,3,3,6,B,2]);r.push([21,1,1,4,D,.6]);r.push([21,10,1,3,D,.6]);for(let i=0;i<7;i++)r.push([2+i,2+(i%3)*2+(i<2?0:0),1,1,D,.8]);for(let k=0;k<5;k++)for(let i=0;i<7;i++)r.push([1+i,3+k*1+(k>2?1:0),1,1,k%2?B:D,.7]);
 r.push([12,4,3,3,'#fff',2.2]);r.push([13,5,2,2,'#101418',2.3]);r.push([7,2,2,2,'#c06a76',.8]);return{gw:25,gh:12,r}};
ARTC.ray=()=>{const B='#4a6a8a',V='#dce6ee',r=[];for(let k=0;k<13;k++){const h=Math.max(1,Math.round(6-Math.abs(k-6)*.9));r.push([4+k,6-h,1,h*2,k>9?B:'#3b5a7a',.8]);r.push([4+k,6-h,1,Math.max(1,Math.round(h*.4)),V,.7])}
 for(let k=0;k<8;k++)r.push([17+k,6,1,1,'#2e4660',.5]);for(let k=0;k<8;k++){r.push([6+k,6-Math.round(1+k*.2)-1,1,1,'#e8f0f8',.9]);}
 r.push([16,8,1,1,'#fff',1]);r.push([17,8,1,1,'#111',1.1]);return{gw:26,gh:13,r}};
ARTC.boot=()=>({gw:14,gh:14,r:[[2,0,10,3,'#2a1c14',3],[1,3,8,6,'#6a4426',3],[1,9,7,4,'#7a5230',3],[2,12,5,1,'#8a6038',3],[8,3,5,3,'#6a4426',3],[2,3,8,1,'#3a2618',3.2],[2,8,5,1,'#e8dcc0',3.2],[3,10,4,1,'#e8dcc0',3.2],[3,6,4,1,'#e8dcc0',3.2],[10,3,3,1,'#8a6038',3.2],[3,12,2,1,'#3a8a3a',3.4],[11,1,1,1,'#7a8a30',3.4],[5,5,1,1,'#7a8a30',3.4]]});
ARTC.can=()=>({gw:11,gh:14,r:[[2,0,7,12,'#a8442c',5],[2,0,7,1,'#6e2c1c',5],[2,11,7,2,'#c8ccd0',5],[3,12,5,1,'#8a9098',5],[2,4,7,4,'#d8d0b8',5.2],[3,5,5,1,'#a8442c',5.3],[3,6,3,1,'#a8442c',5.3],[3,2,1,1,'#7a3a22',5.3],[7,7,1,1,'#7a3a22',5.3],[6,10,1,2,'#6e2c1c',5.3]]});
ARTC.weed=()=>{const r=[],C=['#2f7a3a','#3f9a4a','#5cb860'];for(let k=0;k<9;k++){const h=5+(k*7%6),x=1+k*2;for(let j=0;j<h;j++)r.push([x+(j%3==1?1:0)*(k%2?1:-1)+(k%2),j,1,1,C[(j+k)%3],1.4])}for(let k=0;k<5;k++)r.push([3+k*3,2+k%3,1,2,'#d8b84a',.8]);return{gw:20,gh:11,r}};
ARTC.duck=()=>({gw:14,gh:14,r:[[2,0,10,5,'#ffd23a',6],[1,1,1,3,'#ffd23a',5],[0,3,1,3,'#ffd23a',3],[8,5,5,5,'#ffd23a',5],[9,10,3,2,'#ffd23a',4],[12,7,2,2,'#f08a20',3],[10,8,1,1,'#111',5.2],[3,2,5,2,'#f2b81c',6.2],[10,5,2,1,'#fff1a0',5.3],[3,0,10,1,'#e8a81c',6.2]]});
ARTC.bottle=()=>({gw:22,gh:10,r:[[3,1,13,7,'#58c4a8',4],[4,2,11,5,'#9ae4d0',4.2],[16,3,4,3,'#58c4a8',2.6],[20,2,1,5,'#8a5a2c',3.4],[6,3,7,3,'#f4ead0',3.2],[7,4,5,1,'#c8a878',3.3],[7,5,3,1,'#c8a878',3.3],[4,1,12,1,'#2e8a74',4],[5,6,2,1,'#e8fff4',4.3]]});
ARTC.chest=()=>({gw:20,gh:15,r:[[1,0,18,8,'#8a5a2c',9],[1,8,18,4,'#9a6a36',9],[3,12,14,1,'#8a5a2c',8],[0,0,1,13,'#e6b422',9.2],[19,0,1,13,'#e6b422',9.2],[1,7,18,1,'#e6b422',9.3],[1,0,18,1,'#6a4220',9.3],[8,5,4,5,'#e6b422',9.5],[9,6,2,2,'#5a3a14',9.6],[3,2,1,1,'#3a8a4a',9.4],[15,3,1,1,'#3a8a4a',9.4],[5,10,1,1,'#f4d85a',9.4],[13,9,2,1,'#f4d85a',9.4],[9,13,3,1,'#f4d85a',6]]});
const artOf=id=>{let a=ARTC[id];if(!a)return{gw:8,gh:8,r:[[1,1,6,6,'#888',2]]};if(typeof a=='function'){a=ARTC[id]=a()}return a};
/* flat pixel art on a canvas; sil = dark silhouette for fish you have not met yet */
function artCanvas(id,px,sil){const a=artOf(id),cv=document.createElement('canvas');cv.width=a.gw*px;cv.height=a.gh*px;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 if(!sil){const gl=a.r.filter(q=>q[6]);if(gl.length){c.shadowColor=gl[0][4];c.shadowBlur=px*2.4;gl.forEach(q=>{c.fillStyle=q[4];c.fillRect(q[0]*px,(a.gh-q[1]-q[3])*px,q[2]*px,q[3]*px)});c.shadowBlur=0}}
 a.r.forEach(q=>{c.fillStyle=sil?'#0f1d26':q[4];c.fillRect(q[0]*px,(a.gh-q[1]-q[3])*px,q[2]*px,q[3]*px)});
 if(!sil){c.fillStyle='rgba(255,255,255,.18)';const top=a.r.slice().sort((x,y)=>(y[1]+y[3])-(x[1]+x[3]))[0];if(top)c.fillRect(top[0]*px,(a.gh-top[1]-top[3])*px,top[2]*px,Math.max(1,px*.5))}
 cv.style.imageRendering='pixelated';return cv}

/* ---------- the site: a frame on the north shore. x runs east, z runs inland (south), the sea is at -z; 1 unit = 1 m ---------- */
function edgeZ(x){let z=-60;while(z>-900&&inPoly(GR,x,z-2))z-=2;return z}
function waterZ(x){let z=edgeZ(x);while(z>-900&&inPoly(CO,x,z-1))z-=1;return z}
let LH_X=600;try{const q=POIS.find(p=>p[2]=='Lighthouse');if(q)LH_X=q[0]}catch(e){}
let FX=480;{let best=1e9;for(let x=420;x<=Math.min(560,LH_X-75);x+=10){const e0=edgeZ(x),v=Math.abs(edgeZ(x-28)-e0)+Math.abs(edgeZ(x+28)-e0)+Math.abs(waterZ(x-28)-waterZ(x))+Math.abs(waterZ(x+28)-waterZ(x))+Math.abs(waterZ(x)-e0+15)*.5;if(v<best){best=v;FX=x}}}
const ZE=edgeZ(FX);
const WZ={};{for(let k=-16;k<=16;k++){WZ[k]=waterZ(FX+k*4)-ZE}}/* waterline z in the local frame every 4 m */
const wlAt=x=>{const f=clamp(x/4,-15.999,15.999),i=Math.floor(f);return lerp(WZ[i],WZ[i+1],f-i)};
const uAt=(lx,lz)=>wlAt(lx)-lz;/* metres out to sea from the waterline (local frame) */
const WLC=wlAt(0);
const sandY=d=>d<=0?-.36:d<5?lerp(-.36,-.33,d/5):d<10?lerp(-.33,-.30,(d-5)/5):d<15?lerp(-.30,-.27,(d-10)/5):-.25;
const baseY=u=>(u<=0?-.41:u<13?lerp(-.41,-.43,u/13):u<38?lerp(-.43,-.46,(u-13)/25):u<60?lerp(-.46,-.5,(u-38)/22):-.5)+.012;
const DECK=.54,HX=9.5,HEADZ0=-43,HEADZ1=-37,PIERW=2.2;
const lw=(x,z)=>[FX+x,ZE+z];
const inMain=(lx,lz)=>lx>-2.75&&lx<2.75&&lz>HEADZ0-.8&&lz<8,inHead=(lx,lz)=>lx>-10&&lx<10&&lz>HEADZ0-.8&&lz<HEADZ1+.8;
const deckH=lz=>lz<=1?DECK:lz>=7?-.25:lerp(DECK,-.25,(lz-1)/6);
function walkY(x,z){const lx=x-FX,lz=z-ZE;
 if(inHead(lx,lz))return DECK;if(inMain(lx,lz))return lz<7?deckH(lz):0;
 if(Math.abs(lx)<60&&lz<2&&lz>WLC-8&&inPoly(CO,x,z)&&!inPoly(GR,x,z)){return sandY(clamp(lz-wlAt(lx),0,15))+.22}return 0}
const SPOTS=[
 {n:'Beach, east of the pier',x:5.8,z:-9.2,h:Math.PI,s:'sand'},
 {n:'Mid pier, west rail',x:-1.5,z:-27,h:-Math.PI/2,s:'rail'},{n:'Mid pier, east rail',x:1.5,z:-27,h:Math.PI/2,s:'rail'},
 {n:'Pier head, west end',x:-7.8,z:-41.2,h:Math.PI,s:'rail'},{n:'Pier head, middle',x:0,z:-41.2,h:Math.PI,s:'rail'},{n:'Pier head, east end',x:7.8,z:-41.2,h:Math.PI,s:'rail'}];
SPOTS.forEach(s=>{s.wx=FX+s.x;s.wz=ZE+s.z;s.y=s.s=='sand'?sandY(clamp(s.z-wlAt(s.x),0,15))+.22:DECK});

/* ---------- boxes, merged ---------- */
let BT=null;const mkB=()=>({a:[],n:0});
function bx(w,h,d,c,x,y,z,ry,rx,rz){const b=BT;b.n++;const j=a=>1+(b.n*a%8)*.0004+.0002;b.a.push([w*j(7919),h*j(104729),d*j(1299709),c,x,y,z,ry||0,rx||0,rz||0])}
function flush(b,mat){const tpl=new THREE.BoxGeometry(1,1,1),tp=tpl.attributes.position.array,tn=tpl.attributes.normal.array,ti=tpl.index.array,N=b.a.length,pos=new Float32Array(N*72),nor=new Float32Array(N*72),col=new Float32Array(N*72),idx=new Uint32Array(N*36);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),v=new THREE.Vector3(),nm=new THREE.Matrix3(),cc=new THREE.Color();
 for(let k=0;k<N;k++){const o=b.a[k];e.set(o[8],o[7],o[9],'YXZ');q.setFromEuler(e);sc.set(o[0],o[1],o[2]);ps.set(o[4],o[5],o[6]);m.compose(ps,q,sc);nm.getNormalMatrix(m);cc.set(String(o[3]).slice(0,7));
  for(let i=0;i<24;i++){v.set(tp[i*3],tp[i*3+1],tp[i*3+2]).applyMatrix4(m);const p=(k*24+i)*3;pos[p]=v.x;pos[p+1]=v.y;pos[p+2]=v.z;v.set(tn[i*3],tn[i*3+1],tn[i*3+2]).applyMatrix3(nm).normalize();nor[p]=v.x;nor[p+1]=v.y;nor[p+2]=v.z;col[p]=cc.r;col[p+1]=cc.g;col[p+2]=cc.b}
  for(let i=0;i<36;i++)idx[k*36+i]=ti[i]+k*24}
 tpl.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));
 const mesh=new THREE.Mesh(g,mat||vmat());return mesh}
function vmat(){const m=new THREE.MeshLambertMaterial({vertexColors:true});m.userData.xms=1;return m}
const COL={wood:'#9a6a3c',woodL:'#c99a5c',woodD:'#5a3a22',plank:'#b98a52',navy:'#22405e',blue:'#5f8fa6',blueD:'#46748c',white:'#f3efe2',red:'#d9483b',yel:'#f2c14e',teal:'#2aa7a1',rope:'#d8c08a',slate:'#2f4a63',slateD:'#243a50',iron:'#3a3f48',steel:'#cfd3d8',glass:'#bfe6ee',green:'#2f8f4a',green2:'#3da35a',sand:'#e0d09a'};
const SOL=[];
function solid(x0,z0,x1,z1){const q=[FX+x0,ZE+z0,FX+x1,ZE+z1];SOL.push(q);try{cols.push(q)}catch(e){}}
const solidC=(x,z,hw,hd)=>solid(x-hw,z-(hd==null?hw:hd),x+hw,z+(hd==null?hw:hd));
/* canvases as signs */
const FONT="'Silkscreen','Courier New',monospace";
function canvasSign(w,h,draw,px){const cv=document.createElement('canvas');cv.width=Math.round(w*(px||96));cv.height=Math.round(h*(px||96));const c=cv.getContext('2d');draw(c,cv.width,cv.height);const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;t.anisotropy=2;return{cv,c,t,w,h}}
const SIGNS=[];
function planeSign(g,sg,x,y,z,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(sg.w,sg.h),new THREE.MeshBasicMaterial({map:sg.t,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);SIGNS.push(m);return m}
const frame=(c,w,h,bg,fg,lwd)=>{lwd=lwd||6;c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle=fg;c.lineWidth=lwd;c.strokeRect(lwd,lwd,w-2*lwd,h-2*lwd)};
/* a fish from the art list, as boxes in a batch: scale sc metres per cell, centred at x,y,z, turned ry */
function artBoxes(id,sc,x,y,z,ry,lay){PFISH.push({id,sc,x,y,z,ry:ry||0,lay})}
const PFISH=[];

/* ---------- the world: one group at the pier foot, everything in local metres ---------- */
const root=new THREE.Group();root.name='pierFishing';root.position.set(FX,0,ZE);WORLD.add(root);
const ANIM={buoys:[],gl:null,glMat:null,halos:[],pools:[],cats:[],gulls:[],npcs:[],flags:[],lights:[],win:null};
let BUILT=false;
function palm(x,z,s,lean,rot){s=s||1;lean=lean||.14;rot=rot||0;let px=x,py=sandY(clamp(z-wlAt(x),0,15))-.1,pz=z;if(z>0)py=-.3;
 for(let i=0;i<7;i++){const w=.46*s-i*.03*s,h=1.05*s;bx(w,h*1.04,w,i%2?'#8a6a40':'#7d5f38',px,py+h/2,pz);px+=lean*s*Math.cos(rot);pz+=lean*s*Math.sin(rot);py+=h}
 bx(.6*s,.4*s,.6*s,'#5f4a2a',px,py+.05*s,pz);
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2+rot,c1=i%2?COL.green:COL.green2,c2=i%2?COL.green2:COL.green,ca=Math.cos(a),sa=Math.sin(a),l1=1.5*s,l2=1.35*s;
  bx(l1,.09*s,.55*s,c1,px+ca*l1*.5*Math.cos(.22),py+.2*s-Math.sin(.22)*l1*.5,pz+sa*l1*.5*Math.cos(.22),-a,0,-.22);
  const ex=px+ca*l1*Math.cos(.22),ey=py+.2*s-Math.sin(.22)*l1,ez=pz+sa*l1*Math.cos(.22);
  bx(l2,.09*s,.45*s,c2,ex+ca*l2*.5*Math.cos(.62),ey-Math.sin(.62)*l2*.5,ez+sa*l2*.5*Math.cos(.62),-a,0,-.62)}
 [[.3,0],[-.3,.2],[0,-.3]].forEach(([dx,dz])=>bx(.3*s,.3*s,.3*s,'#6b4a28',px+dx*s,py-.25*s,pz+dz*s));solidC(x,z,.3)}
/* a bucket with fish tails sticking out */
function bucket(x,y,z,c,ids){bx(.5,.46,.5,c,x,y+.23,z);bx(.56,.06,.56,dk(c,.7),x,y+.47,z);bx(.44,.02,.44,'#1f3a4a',x,y+.465,z);bx(.04,.3,.04,COL.iron,x-.26,y+.62,z,0,0,.35);bx(.04,.3,.04,COL.iron,x+.26,y+.62,z,0,0,-.35);bx(.5,.04,.04,COL.iron,x,y+.78,z);
 ids.forEach((id,i)=>{artBoxes(id,.028,x+(i-.5)*.14,y+.58,z+(i%2?.04:-.04),.4+i*.7)})}
const dk=(c,f)=>{const k=new THREE.Color(c);k.r=Math.min(1,k.r*f);k.g=Math.min(1,k.g*f);k.b=Math.min(1,k.b*f);return'#'+k.getHexString()};
function crate(x,y,z,w,h,d,ry){bx(w,h,d,COL.plank,x,y+h/2,z,ry);const c=Math.cos(ry||0),s=Math.sin(ry||0);[[-1,0],[1,0]].forEach(([a])=>{bx(.08,h+.02,d+.02,COL.woodD,x+a*(w/2-.05)*c,y+h/2,z-a*(w/2-.05)*s,ry)});bx(w+.02,.08,.12,COL.woodD,x,y+h*.5,z,ry);solidC(x,z,Math.max(w,d)/2*.95,Math.min(w,d)/2*.95)}
function bench(x,z,face,pc){/* face: 0 faces west (-x), 1 east, 2 north (-z) ; seat 1.8 long */
 const al=face<2?1:0;const sw=al?.5:1.8,sd=al?1.8:.5;const ox=face==0?-1:face==1?1:0,oz=face==2?-1:0;
 bx(sw,.07,sd,COL.woodL,x,DECK+.46,z);bx(al?.07:1.8,.34,al?1.8:.07,COL.wood,x-ox*.27,DECK+.78,z-oz*.27);
 [-1,1].forEach(a=>{const lx=al?x:x+a*.8,lz=al?z+a*.8:z;bx(al?.46:.08,.46,al?.08:.46,COL.woodD,lx,DECK+.23,lz);bx(.07,.4,.07,COL.woodD,lx-ox*.27,DECK+.7,lz-oz*.27)});
 solidC(x,z,al?.3:.9,al?.9:.3)}
function lantern(x,y,z,up){/* a bracket lantern: pushed into the glow batch for the bulb, the cage into the main one */
 bx(.34,.05,.34,COL.iron,x,y+.27,z);bx(.3,.07,.3,COL.iron,x,y-.26,z);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bx(.03,.46,.03,COL.iron,x+a*.14,y,z+b*.14));bx(.06,.1,.06,COL.iron,x,y+.34,z);
 const g=BT;BT=GB;bx(.22,.34,.22,'#ffe2a0',x,y,z);BT=g;ANIM.lights.push([x,y,z])}
let GB=null;

/* ---------- the pier ---------- */
function buildPier(){
 /* deck: a base, then individual planks in two tones, a gap line between them */
 bx(PIERW*2,.22,39,COL.woodD,0,DECK-.2,-18);bx(HX*2,.22,6.4,COL.woodD,0,DECK-.2,-40);
 const plank=(x0,x1,z)=>{const w=x1-x0,t=(Math.sin(z*12.9+x0*3.1)*.5+.5);const c=['#c99a5c','#be9054','#b78750','#cfa264','#b38450'][Math.floor(t*4.99)];bx(w,.08,.34,c,(x0+x1)/2,DECK-.04,z);if(Math.sin(z*7.7)>.2)bx(.05,.081,.04,'#5a3a22',x0+.25,DECK-.04,z+.08)};
 for(let z=.8;z>-37;z-=.4)plank(-PIERW,PIERW,z);for(let z=-37;z>-43.2;z-=.4)plank(-HX,HX,z);
 /* the beach ramp: planks follow the slope */
 const th=Math.atan((DECK+.25)/6);bx(PIERW*2,.22,6.1,COL.woodD,0,(DECK-.25)/2-.2,4,0,th);
 for(let z=1.05;z<7;z+=.4){const y=deckH(z)-.04;bx(PIERW*2,.08,.34,['#c99a5c','#be9054','#b78750'][Math.floor((Math.sin(z*12.9)*.5+.5)*2.99)],0,y,z,0,th)}
 /* piles and cross beams */
 for(let z=-1;z>-37;z-=3.8){[-1,1].forEach(a=>{bx(.34,2.1,.34,COL.woodD,a*(PIERW-.18),-.55,z);bx(.38,.5,.38,'#3b4a3a',a*(PIERW-.18),-.42,z)});bx(PIERW*2+.2,.22,.3,COL.wood,0,DECK-.42,z)}
 for(let x=-HX+.6;x<=HX;x+=3.8){for(const z of[-43,-37.2]){bx(.34,2.1,.34,COL.woodD,x,-.55,z);bx(.38,.5,.38,'#3b4a3a',x,-.42,z)}}
 for(let z=-37.6;z>-43;z-=2.6)bx(HX*2+.2,.2,.3,COL.wood,0,DECK-.4,z);
 /* low stringers you can see from the side */
 [-1,1].forEach(a=>bx(.16,.3,38.4,COL.wood,a*(PIERW-.05),DECK-.36,-18));bx(HX*2,.3,.16,COL.wood,0,DECK-.36,-43.05);
 /* rails: main deck both sides, ramp both sides, the head all round except where it joins the deck */
 const rail=(x0,z0,x1,z1,y)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);bx(.1,.1,L,COL.woodL,(x0+x1)/2,y,(z0+z1)/2,a)};
 [-1,1].forEach(a=>{const x=a*(PIERW-.05);rail(x,-37,x,-.2,DECK+.9);rail(x,-37,x,-.2,DECK+.5);
  for(let z=-37;z<=-.2;z+=3.8)bx(.14,1.05,.14,COL.woodD,x,DECK+.46,z);
  /* ramp side: sloped rails */
  const rl=6.05;bx(.1,.1,rl,COL.woodL,x,(DECK-.25)/2+.9-.0,4,0,th);bx(.1,.1,rl,COL.woodL,x,(DECK-.25)/2+.5,4,0,th);bx(.14,1.0,.14,COL.woodD,x,deckH(4)+.45,4);bx(.14,.9,.14,COL.woodD,x,deckH(7)+.35,7);
  solid(a>0?PIERW-.3:-PIERW-.2,-37,a>0?PIERW+.2:-PIERW+.3,-.2);solid(a>0?PIERW-.3:-PIERW-.2,.4,a>0?PIERW+.2:-PIERW+.3,7)});
 /* head rails: north, west, east, and the two south pieces */
 rail(-HX+.05,-43.05,HX-.05,-43.05,DECK+.9);rail(-HX+.05,-43.05,HX-.05,-43.05,DECK+.5);rail(-HX+.05,-43.05,-HX+.05,-37,DECK+.9);rail(-HX+.05,-43.05,-HX+.05,-37,DECK+.5);rail(HX-.05,-43.05,HX-.05,-37,DECK+.9);rail(HX-.05,-43.05,HX-.05,-37,DECK+.5);
 rail(-HX+.05,-37.05,-PIERW,-37.05,DECK+.9);rail(-HX+.05,-37.05,-PIERW,-37.05,DECK+.5);rail(PIERW,-37.05,HX-.05,-37.05,DECK+.9);rail(PIERW,-37.05,HX-.05,-37.05,DECK+.5);
 for(let x=-HX;x<=HX+.01;x+=2.375)bx(.14,1.05,.14,COL.woodD,x,DECK+.46,-43.05);for(let z=-43.05;z<=-37;z+=2)[-1,1].forEach(a=>bx(.14,1.05,.14,COL.woodD,a*(HX-.05),DECK+.46,z));
 solid(-HX-.2,-43.6,HX+.2,-42.5);solid(-HX-.2,-43.6,-HX+.45,-36.9);solid(HX-.45,-43.6,HX+.2,-36.9);solid(-HX-.2,-37.4,-PIERW+.2,-36.85);solid(PIERW-.2,-37.4,HX+.2,-36.85);
 /* the entry arch over the top of the ramp */
 [-1,1].forEach(a=>{bx(.3,3.9,.3,COL.woodD,a*2.75,1.55,1);bx(.46,.2,.46,COL.wood,a*2.75,3.55,1);bx(.5,.3,.5,COL.wood,a*2.75,-.18,1);bx(.12,1.1,.12,COL.wood,a*2.4,3.0,1,0,0,a*-.7)});
 bx(6.1,.3,.3,COL.wood,0,3.6,1);bx(5.2,.06,.34,COL.rope,0,3.38,1);solid(2.55,.8,2.95,1.2);solid(-2.95,.8,-2.55,1.2);
 /* bollards, a lifebuoy and a rope coil at the head */
 [[-8.9,-42.4],[8.9,-42.4],[-2.4,-37.5],[2.4,-37.5]].forEach(([x,z])=>{bx(.3,.5,.3,COL.iron,x,DECK+.25,z);bx(.38,.1,.38,COL.iron,x,DECK+.54,z);solidC(x,z,.2)});
 {const x=-6.4,y=DECK+.95,z=-43.2;[[0,.5],[0,-.5],[.5,0],[-.5,0]].forEach(([a,b],i)=>bx(a?.16:.9,b?.16:.9,.12,i%2?COL.white:COL.red,x+a*.5,y+b*.5,z+.0));[[.35,.35],[-.35,.35],[.35,-.35],[-.35,-.35]].forEach(([a,b],i)=>bx(.26,.26,.12,i%2?COL.red:COL.white,x+a,y+b,z,0,0,.785));bx(.5,.5,.1,'#3a6a86',x,y,z-.01)}
 for(let i=0;i<4;i++)bx(.9-i*.04,.09,.9-i*.04,COL.rope,5.6,DECK+.05+i*.09,-36.2+(i%2)*.02,i*.5);
 /* the fishing spots: a painted fish on the deck (flat planes, added later), plus buckets, crates and a cleaning table on the head */
 bucket(5.4,DECK,-42,'#2f7fc4',['perch','mackerel']);solidC(5.4,-42,.3);bucket(-5.3,DECK,-39.2,'#d9483b',['sunfish']);solidC(-5.3,-39.2,.3);bucket(.9,DECK,-5.5,'#f2c14e',[]);solidC(.9,-5.5,.3);
 crate(8.2,DECK,-39.1,.9,.6,.8,.3);crate(8.1,DECK+.6,-39.0,.7,.5,.6,-.2);crate(-8.4,DECK,-39.0,.8,.5,.8,-.15);
 {const x=7.6,z=-37.8;/* cleaning table */bx(1.6,.08,.8,COL.woodL,x,DECK+.95,z);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bx(.08,.92,.08,COL.woodD,x+a*.7,DECK+.46,z+b*.32));bx(.5,.03,.3,COL.white,x-.3,DECK+1,z);bx(.3,.025,.05,COL.steel,x+.3,DECK+1,z+.1,.4);artBoxes('herring',.034,x-.3,DECK+1.04,z,.2,0);solid(x-.85,z-.45,x+.85,z+.45)}
 /* benches: Mara's on the west side, one on the east, two on the head facing the horizon */
 bench(-1.3,-21,0);bench(1.3,-31.5,1);bench(-3.2,-41.85,2);bench(3.2,-41.85,2);
 /* lanterns on posts along the pier */
 [[-1,-6],[1,-11],[-1,-16],[1,-23],[-1,-33],[1,-35]].forEach(([a,z])=>{const x=a*(PIERW-.05);bx(.2,1.5,.2,COL.woodD,x,DECK+1.8,z);bx(.5,.06,.06,COL.woodD,x-a*.22,DECK+2.45,z);lantern(x-a*.4,DECK+2.2,z)});
 [[-HX+.4,-42.7],[-4.4,-42.7],[4.4,-42.7],[HX-.4,-42.7],[-HX+.4,-37.5],[HX-.4,-37.5]].forEach(([x,z])=>{bx(.2,1.5,.2,COL.woodD,x,DECK+1.8,z);lantern(x,DECK+2.2,z)});
 /* warning signs on the rail */
 const warn=canvasSign(1.5,.7,(c,w,h)=>{frame(c,w,h,'#f4ead0','#5a3a22',6);c.fillStyle='#17323a';c.font='bold '+Math.round(h*.23)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('DO NOT FEED',w/2,h*.28);c.fillStyle='#d94a33';c.fillText('THE GULLS',w/2,h*.55);c.fillStyle='#17323a';c.font=Math.round(h*.15)+'px '+FONT;c.fillText('(they will know)',w/2,h*.83)},110);
 planeSign(root,warn,2.12,DECK+1.1,-8,-Math.PI/2);bx(.08,.8,1.6,COL.woodD,2.09,DECK+1.1,-8);
 const nod=canvasSign(1.5,.6,(c,w,h)=>{frame(c,w,h,'#d94a33','#fff3d9',6);c.fillStyle='#fff3d9';c.font='bold '+Math.round(h*.3)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('NO SWIMMING',w/2,h*.38);c.font=Math.round(h*.17)+'px '+FONT;c.fillText('fish live here',w/2,h*.74)},110);
 planeSign(root,nod,-2.12,DECK+1.1,-24,Math.PI/2);bx(.08,.7,1.6,COL.woodD,-2.09,DECK+1.1,-24);
 const hd=canvasSign(5.6,.9,(c,w,h)=>{frame(c,w,h,'#22405e','#f2c14e',8);c.fillStyle='#f2c14e';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(h*.5)+'px '+FONT;c.fillText('PIER FISHING',w/2,h*.52)},110);
 planeSign(root,hd,0,3.35,1.2,0);planeSign(root,hd,0,3.35,.8,Math.PI);
 /* spot markers: a painted fish on a dark teal square, one at each spot (flat, a hair above the planks) */
 const mk=canvasSign(1.3,1.3,(c,w,h)=>{c.fillStyle='rgba(32,118,128,.55)';c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=4;c.setLineDash([10,8]);c.strokeRect(8,8,w-16,h-16);const a=artCanvas('perch',Math.round(w/26),false);c.globalAlpha=.85;c.drawImage(a,(w-a.width)/2,(h-a.height)/2)},100);
 SPOTS.forEach(s=>{if(s.s=='sand')return;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.3),new THREE.MeshBasicMaterial({map:mk.t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.rotation.x=-Math.PI/2;m.rotation.z=-s.h+Math.PI;m.position.set(s.x,DECK+.004,s.z);m.renderOrder=2;root.add(m);SIGNS.push(m)});
 /* buoys out on the water (they bob), and a few floats on a rope line */
 for(let i=0;i<4;i++){const u=26+i*9,x=-28+i*17+(i%2)*8,z=WLC-u;const g=new THREE.Group();g.position.set(x,baseY(u)+.02,z);const BB=BT;BT=mkB();bx(.5,.3,.5,i%2?COL.red:COL.yel,0,.05,0);bx(.4,.3,.4,COL.white,0,.3,0);bx(.07,.6,.07,COL.iron,0,.72,0);bx(.2,.1,.2,COL.red,0,1.05,0);const m=flush(BT,vmat());BT=BB;g.add(m);root.add(g);ANIM.buoys.push({g,y:g.position.y,ph:i*1.9})}
}

/* ---------- the Bait & Tackle hut, rack, board, boat and the rest of the shore ---------- */
function buildHut(){
 const X0=-20,X1=-11.5,Z0=3.5,Z1=10,Y0=.12,YW=3.7,xm=(X0+X1)/2,zm=(Z0+Z1)/2;
 /* foundation and floor */
 bx(X1-X0+.5,.5,Z1-Z0+.5,COL.woodD,xm,-.15,zm);bx(X1-X0+.3,.1,Z1-Z0+.3,COL.woodL,xm,Y0-.05,zm);
 for(let x=X0+.5;x<X1;x+=1)bx(.04,.02,Z1-Z0,COL.woodD,x,Y0+.0,zm);
 /* porch deck on the east side, the customer side */
 bx(3.2,.16,Z1-Z0+.4,COL.woodL,X1+1.5,-.02,zm);for(let z=Z0-.1;z<Z1+.3;z+=.45)bx(3.2,.17,.04,COL.woodD,X1+1.5,-.02,z);
 [[X1+2.9,Z0-.1],[X1+2.9,Z1+.1]].forEach(([x,z])=>bx(.22,.9,.22,COL.woodD,x,-.4,z));
 /* walls: planks (vertical strips), trims. south and north full, west full, east with the service window */
 const wall=(x,z,w,d,h,y)=>{bx(w,h,d,COL.blue,x,y+h/2,z);const al=w>d;const n=Math.floor((al?w:d)/.5);for(let i=0;i<n;i++){const o=-((al?w:d)/2)+.25+i*.5;if(al)bx(.04,h,d+.04,COL.blueD,x+o,y+h/2,z);else bx(w+.04,h,.04,COL.blueD,x,y+h/2,z+o)}};
 wall(xm,Z1-.125,X1-X0,.25,YW-Y0,Y0);wall(xm,Z0+.125,X1-X0,.25,YW-Y0,Y0);wall(X0+.125,zm,.25,Z1-Z0,YW-Y0,Y0);
 const WZ0=5.3,WZ1=8.7,WY0=1.2,WY1=2.45,ex=X1-.125;
 wall(ex,zm,.25,Z1-Z0,WY0-Y0,Y0);wall(ex,zm,.25,Z1-Z0,YW-WY1,WY1);wall(ex,(Z0+WZ0)/2,.25,WZ0-Z0,WY1-WY0,WY0);wall(ex,(WZ1+Z1)/2,.25,Z1-WZ1,WY1-WY0,WY0);
 /* corner posts and window frame */
 [[X0,Z0],[X0,Z1],[X1,Z0],[X1,Z1]].forEach(([x,z])=>bx(.34,YW-Y0+.1,.34,COL.white,x,(YW+Y0)/2,z));
 bx(.12,WY1-WY0+.2,.12,COL.white,X1+.02,(WY0+WY1)/2,WZ0-.06);bx(.12,WY1-WY0+.2,.12,COL.white,X1+.02,(WY0+WY1)/2,WZ1+.06);bx(.14,.12,WZ1-WZ0+.3,COL.white,X1+.02,WY1+.06,(WZ0+WZ1)/2);
 /* the counter */
 bx(1.0,.12,WZ1-WZ0+.5,COL.woodL,X1+.5,WY0-.04,(WZ0+WZ1)/2);bx(.1,.86,WZ1-WZ0+.5,COL.wood,X1+.95,WY0-.5,(WZ0+WZ1)/2);for(let z=WZ0-.1;z<WZ1+.2;z+=.5)bx(.12,.8,.05,COL.woodD,X1+.97,WY0-.5,z);
 /* things on the counter: a brass scale, jars of lures and a tackle box, a little fish on a plate */
 bx(.5,.06,.4,COL.iron,X1+.5,WY0+.06,5.9);bx(.08,.4,.08,COL.iron,X1+.5,WY0+.28,5.9);bx(.34,.04,.34,'#c9a24a',X1+.5,WY0+.5,5.9);bx(.12,.12,.04,COL.white,X1+.5,WY0+.4,6.1);
 [[7.4,'#f2c14e'],[7.7,'#d9483b'],[8.0,'#7ff3ff']].forEach(([z,c])=>{bx(.28,.34,.28,COL.glass,X1+.5,WY0+.2,z);bx(.3,.06,.3,COL.iron,X1+.5,WY0+.4,z);bx(.14,.14,.14,c,X1+.5,WY0+.17,z)});
 bx(.4,.22,.3,COL.red,X1+.5,WY0+.14,8.45);bx(.4,.03,.3,COL.iron,X1+.5,WY0+.26,8.45);
 /* awning: navy and white stripes sloping down over the porch */
 for(let z=Z0+.1;z<Z1-.2;z+=.6){const i=Math.round((z-Z0)/.6);bx(2.3,.1,.6,i%2?COL.white:COL.navy,X1+1.05,2.52,z+.3,0,0,-.2)}
 bx(.1,.3,Z1-Z0-.2,COL.navy,X1+2.15,2.22,zm);[[Z0+.2],[Z1-.2]].forEach(([z])=>{bx(.16,2.4,.16,COL.woodD,X1+2.15,1.2,z);solidC(X1+2.15,z,.16)});
 /* hanging sign on the front */
 const sg=canvasSign(4.4,.9,(c,w,h)=>{frame(c,w,h,'#22405e','#f2c14e',8);c.fillStyle='#f2c14e';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(h*.46)+'px '+FONT;c.fillText('BAIT & TACKLE',w/2,h*.42);c.fillStyle='#8ae0da';c.font=Math.round(h*.18)+'px '+FONT;c.fillText('RODS * WORMS * FRESH FISH BOUGHT',w/2,h*.8)},110);
 planeSign(root,sg,X1+.03,3.18,zm,Math.PI/2);bx(.08,1.05,4.6,COL.woodD,X1-.01,3.18,zm);
 /* roof: two slopes, stripes and fascia; ridge along z */
 const roofY0=YW-.02,ridgeY=5.3,xr=xm,rf=(xe,dir)=>{const dx=Math.abs(xr-xe),dy=ridgeY-roofY0,L=Math.hypot(dx,dy),a=Math.atan2(dy,dx)*dir,cx=(xe+xr)/2,cy=(roofY0+ridgeY)/2+.08;
  bx(L+.1,.14,Z1-Z0+1.3,COL.slate,cx,cy,zm,0,0,a);for(let t=.4;t<L;t+=.55){const k=t/L,px=xe+(xr-xe)*k,py=roofY0+dy*k;bx(.07,.17,Z1-Z0+1.32,COL.slateD,px,py+.08,zm,0,0,a)}};
 rf(X1+1.2,-1);rf(X0-1.2,1);bx(.3,.18,Z1-Z0+1.4,COL.slateD,xr,ridgeY+.12,zm);
 for(let y=YW;y<ridgeY-.1;y+=.28){const w=(ridgeY-y)/(ridgeY-roofY0)*(X1-X0+.2);[Z0,Z1].forEach(z=>bx(w,.28,.22,COL.blue,xm,y+.14,z));}
 /* door on the south wall, a window on the north and west with flower boxes; chimney */
 bx(1.2,2.2,.12,COL.navy,-15.8,Y0+1.1,Z1+.05);bx(1.4,.12,.16,COL.white,-15.8,Y0+2.26,Z1+.06);bx(.12,.1,.14,COL.yel,-15.3,Y0+1.1,Z1+.12);
bx(1.4,.9,.1,COL.glass,-17,2.2,Z0-.05);bx(1.6,.1,.14,COL.white,-17,2.7,Z0-.06);bx(1.6,.1,.14,COL.white,-17,1.72,Z0-.06);bx(.1,.9,.14,COL.white,-17,2.2,Z0-.06);
 bx(1.5,.3,.3,COL.woodD,-17,1.5,Z0-.22);for(let i=0;i<5;i++)bx(.2,.25,.2,['#ff7ab8','#f2c14e','#ff7a5c','#fff3d9','#ff7ab8'][i],-17.6+i*.3,1.75,Z0-.22);
 bx(.1,.9,1.4,COL.glass,X0-.02,2.2,6);bx(.14,.1,1.6,COL.white,X0-.03,2.7,6);bx(.14,.1,1.6,COL.white,X0-.03,1.72,6);
 bx(.9,1.6,.9,'#8a6a5a',-18.2,5.4,6.8);bx(1.1,.16,1.1,COL.iron,-18.2,6.26,6.8);
 /* inside, seen through the window: back wall shelves with jars and boxes, a glowing lamp and the floor */
 bx(.1,2.5,Z1-Z0-.5,'#8a5e38',X0+.4,1.5,zm);for(let k=0;k<3;k++)bx(.5,.06,Z1-Z0-.9,COL.woodL,X0+.7,1.3+k*.7,zm);
 for(let k=0;k<3;k++)for(let i=0;i<6;i++){const z=Z0+.9+i*.85,c=['#d9483b','#f2c14e','#2aa7a1','#fff3d9','#7ff3ff','#c58cff'][(i+k*2)%6];bx(.28,.3,.28,c,X0+.7,1.5+k*.7,z)}
 bx(1.0,.1,Z1-Z0-.5,COL.woodL,xm+1.5,Y0+.9,zm);bx(.9,.9,Z1-Z0-.5,COL.wood,xm+1.5,Y0+.45,zm);
 /* a net on the west wall, floats, a lifebuoy, and a hung catch */
 for(let i=0;i<9;i++){bx(.04,2.4,.04,COL.rope,X0-.12,1.9,3.8+i*.65);}for(let k=0;k<8;k++)bx(.04,.04,5.5,COL.rope,X0-.13,.9+k*.3,6.5);
 for(let i=0;i<6;i++)bx(.2,.2,.2,i%2?COL.red:COL.yel,X0-.2,.6+(i%3)*.8,4.2+i*.9);
 {const x=X0-.2,y=3,z=8.7;[[0,.5],[0,-.5],[.5,0],[-.5,0]].forEach(([a,b],i)=>bx(.12,b?.16:.9,a?.16:.9,i%2?COL.white:COL.red,x,y+b*.5,z+a*.5));}
 solid(X0-.3,Z0-.3,X1+.3,Z1+.3);
 /* the rod rack beside the porch, with the five rods you can own and a spare */
 {const x=-8.7,z0=3.2;bx(.12,2,.12,COL.woodD,x,1,z0);bx(.12,2,.12,COL.woodD,x,1,z0+2.1);bx(.12,.1,2.2,COL.wood,x,1.65,z0+1.05);bx(.12,.1,2.2,COL.wood,x,.7,z0+1.05);bx(.4,.1,2.2,COL.woodD,x,.05,z0+1.05);
  RODS.concat([RODS[0]]).forEach((r,i)=>{const z=z0+.3+i*.3,len=r.len*.85;bx(.045,len,.045,r.col,x+.18,len/2+.1,z,0,0,.18);bx(.07,.12,.07,COL.iron,x+.12,.5,z,0,0,.18);bx(.09,.2,.09,'#222',x+.1,.35,z,0,0,.18)});solid(x-.2,z0-.1,x+.5,z0+2.2)}
 /* buckets and crates on the porch and the sand */
 bucket(-9.9,-.1,9.4,'#2f7fc4',['bass','herring']);solidC(-9.9,9.4,.3);bucket(-9.5,-.1,9.9,'#d9483b',['crab']);solidC(-9.5,9.9,.3);bucket(-10.1,-.1,3.1,'#f2c14e',[]);solidC(-10.1,3.1,.3);
 crate(-22.2,-.25,4.5,1,.7,1,.2);crate(-22.1,-.25,5.8,.8,.6,.8,-.3);crate(-22.3,.45,4.6,.7,.5,.7,.1);
 /* a drying rack with fish */
 {const x=-23.5,z=8.5;[[-1.2],[1.2]].forEach(([a])=>bx(.14,2.3,.14,COL.woodD,x,.9,z+a));bx(.12,.12,2.6,COL.wood,x,2,z);solid(x-.2,z-1.4,x+.2,z+1.4);
  [['mackerel',-.9],['herring',-.45],['perch',0],['herring',.45],['mackerel',.9]].forEach(([id,o],i)=>{bx(.02,.3,.02,COL.rope,x,1.85,z+o);artBoxes(id,.034,x,1.55-(i%2)*.1,z+o,Math.PI/2,0)})}
 /* a stack of lobster-pot style cages and a barrel by the porch */
 [[-5.2,5.6],[-5.2,6.7]].forEach(([x,z],i)=>{bx(.9,.7,.9,'#6a5a3a',x,.1+.35,z);for(let k=0;k<4;k++)bx(.94,.06,.94,COL.woodD,x,.2+k*.2,z);solidC(x,z,.45)});
 bx(.7,.9,.7,COL.navy,-6.2,.5,9.6);bx(.74,.07,.74,COL.iron,-6.2,.25,9.6);bx(.74,.07,.74,COL.iron,-6.2,.75,9.6);solidC(-6.2,9.6,.38);
 /* palms and a little scrub */
 palm(-25.5,12.4,1.1,.12,.9);palm(-10,15,1,.1,2.4);palm(14.5,13.2,1.15,.12,.4);palm(17.5,6,.9,.1,1.9);
}
function buildBoard(){const bx0=5.3,bz=5.2;
 [-1,1].forEach(a=>bx(.22,3.2,.22,COL.woodD,bx0+a*1.55,1.4,bz));bx(3.5,2.6,.16,COL.woodD,bx0,2.3,bz+.0);bx(3.7,.18,.5,COL.wood,bx0,3.7,bz);bx(3.9,.12,.6,COL.slate,bx0,3.85,bz);bx(3.4,.1,.34,COL.woodL,bx0,.95,bz-.2);
 ANIM.board=canvasSign(3.3,2.45,()=>{},140);planeSign(root,ANIM.board,bx0,2.32,bz+.085,0);
 /* the back of the board, so it is not a flat card from the other side */
 bx(3.3,2.45,.02,COL.woodL,bx0,2.32,bz-.09);lantern(bx0-1.55,3.1,bz-.3);solid(bx0-1.8,bz-.3,bx0+1.8,bz+.3)}
function buildBoat(){const x=12.5,z=-5.5,ry=.5,c=Math.cos(ry),s=Math.sin(ry),L=(a,b)=>[x+a*c+b*s,z-a*s+b*c];
 const y0=sandY(clamp(z-wlAt(x),0,15))-.05;/* hull: a keel board, sides that flare out, a bow, seats, two oars */
 bx(1.2,.12,3.8,'#3a5a7a',x,y0+.1,z,ry);[-1,1].forEach(a=>{const p=L(a*.62,0);bx(.12,.55,3.6,'#4a7aa4',p[0],y0+.38,p[1],ry,0,a*.18);bx(.14,.06,3.7,COL.white,L(a*.7,0)[0],y0+.66,L(a*.7,0)[1],ry,0,a*.18)});
 {const p=L(0,1.95);bx(1.3,.55,.14,'#4a7aa4',p[0],y0+.38,p[1],ry);const q=L(0,-1.95);bx(1.1,.5,.14,'#4a7aa4',q[0],y0+.36,q[1],ry)}
 [-.8,.5].forEach(o=>{const p=L(0,o);bx(1.3,.07,.34,COL.woodL,p[0],y0+.42,p[1],ry)});
 {const p=L(.3,0);bx(.06,.06,2.6,COL.woodL,p[0],y0+.5,p[1],ry+.08);bx(.3,.05,.5,COL.woodL,L(.3,1.4)[0],y0+.5,L(.3,1.4)[1],ry+.08)}
 {const p=L(-.3,.1);bx(.06,.06,2.6,COL.woodL,p[0],y0+.5,p[1],ry-.08);bx(.3,.05,.5,COL.woodL,L(-.3,-1.2)[0],y0+.5,L(-.3,-1.2)[1],ry-.08)}
 bx(.8,.06,.14,COL.rope,L(.4,2.2)[0],y0+.12,L(.4,2.2)[1],ry+.4);
 for(let i=0;i<4;i++){const q=[[0,2.2],[-.4,3.2],[.2,4.2],[-.2,5.2]][i],p=L(q[0],q[1]);bx(.08,.08,.9,COL.rope,p[0],y0+.1,p[1],ry+.4+i*.3)}
 solidC(x,z,1.15,1.15)}
function buildLights(){/* soft glow sprites and floor pools at every lantern; opacity follows the evening */
 const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,236,170,1)');g.addColorStop(.25,'rgba(255,205,110,.55)');g.addColorStop(1,'rgba(255,170,60,0)');c.fillStyle=g;c.fillRect(0,0,64,64);
 const tex=new THREE.CanvasTexture(cv);ANIM.glowTex=tex;
 ANIM.lights.forEach(([x,y,z],i)=>{const sm=new THREE.SpriteMaterial({map:tex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,fog:false});const s=new THREE.Sprite(sm);s.position.set(x,y,z);s.scale.set(3.4,3.4,1);s.renderOrder=6;root.add(s);ANIM.halos.push(s);
  const onDeck=z<2&&z>-44&&Math.abs(x)<10;if(onDeck){const pm=new THREE.MeshBasicMaterial({map:tex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,fog:false}),p=new THREE.Mesh(new THREE.PlaneGeometry(5,5),pm);p.rotation.x=-Math.PI/2;p.position.set(x,DECK+.012+(i%3)*.0015,z);p.renderOrder=3;root.add(p);ANIM.pools.push(p)}});
 /* the hut window: a warm light inside, only seen through the opening */
 const wm=new THREE.MeshBasicMaterial({map:tex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,fog:false}),w=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.6),wm);w.position.set(-13.6,1.9,7);w.rotation.y=Math.PI/2;w.renderOrder=6;root.add(w);ANIM.win=w}
function buildSite(){if(BUILT)return;BUILT=true;
 BT=mkB();GB=mkB();
 try{buildPier()}catch(e){soft(e,'pier')}try{buildHut()}catch(e){soft(e,'hut')}try{buildBoard()}catch(e){soft(e,'board')}try{buildBoat()}catch(e){soft(e,'boat')}
 const m=flush(BT,vmat());m.name='fishStatic';root.add(m);ANIM.mesh=m;
 try{PFISH.forEach((q,i)=>{const rack=q.sc>.03,f=fish3(q.id,rack?.42:.36);/* head down; in a bucket the tail sticks out of the top */f.rotation.set(0,q.ry,-Math.PI/2+(rack?0:(i%2?.3:-.3)));f.position.set(q.x,rack?q.y:q.y-.15,q.z);swim(f,0,0);root.add(f)})}catch(e){soft(e,'pfish')}
 const gm=new THREE.MeshBasicMaterial({vertexColors:true});gm.userData.xms=1;ANIM.glMat=gm;const gmesh=flush(GB,gm);gmesh.name='fishLamps';root.add(gmesh);ANIM.gl=gmesh;
 BT=null;GB=null;try{buildLights()}catch(e){soft(e,'lights')}
 drawBoard()}

/* ---------- sounds (added once to the game's SND table) ---------- */
const SND_ADD=()=>{try{if(typeof SND!='object'||SND.fs_splash)return;
 SND.fs_cast=()=>{sdNz(.34,1400,.2,{q:1,f2:420,sw:.4,pan:rr(-.2,.2)});sdNz(.3,2600,.05,{q:.8,f2:900,sw:.5,del:.02})};
 SND.fs_splash=()=>{sdNz(.5,950,.3,{q:.7,f2:240,sw:.6,rev:.2,pan:rr(-.15,.15)});sdNz(.2,3000,.09,{ty:'highpass',del:.02});sdHit(130,.14,.22,[[1,1,1]],{bend:.4,lp:520})};
 SND.fs_plip=()=>{sdHit(980,.07,.1,[[1,1,1],[2.1,.2,.5]],{bend:.25,jit:.05,rev:.1,pan:rr(-.2,.2)});sdNz(.03,2600,.05,{q:1.5})};
 SND.fs_bite=()=>{sdHit(150,.2,.4,[[1,1,1],[1.6,.3,.5]],{bend:.5,lp:600});sdNz(.18,700,.26,{q:.8,f2:240,sw:.2,rev:.15});const f=1318;sdHit(f,.45,.13,[[1,1,1],[2.76,.16,.4],[5.4,.04,.2]],{jit:0,rev:.25,del:.03});sdHit(f*1.5,.4,.1,[[1,1,1]],{jit:0,rev:.3,del:.11});sdHit(f*2,.35,.08,[[1,1,1]],{jit:0,rev:.3,del:.19})};
 SND.fs_hook=()=>{sdHit(420,.09,.3,[[1,1,1],[3.9,.2,.3]],{bend:.3,jit:.03});sdNz(.07,3200,.12,{ty:'highpass'});sdHit(1760,.3,.07,[[1,1,1]],{del:.05,jit:0,rev:.2})};
 SND.fs_click=()=>{sdNz(.012,3700,.07,{q:1.6,pan:rr(-.1,.1)});sdHit(1500,.02,.035,[[1,1,1]],{jit:.08})};
 SND.fs_zing=()=>{sdNz(.3,1200,.09,{q:3,f2:3800,sw:.7,pan:rr(-.3,.3)})};
 SND.fs_snap=()=>{sdNz(.06,3300,.32,{ty:'highpass'});sdHit(2000,.14,.18,[[1,1,1]],{bend:-.5,lp:5000});sdNz(.25,500,.1,{q:.6,f2:200})};
 SND.fs_lose=()=>{const f=300*(1+rr(-.02,.02));sdHit(f,.16,.12,[[1,1,1],[2.3,.2,.4]],{bend:.04,jit:0,lp:1400});sdHit(f*.8,.2,.1,[[1,1,1]],{del:.14,jit:0,lp:1100})};
 SND.fs_catch=()=>{const V=[1,1.25,1.5,2],f=523;V.forEach((r,i)=>sdHit(f*r,.55,.1,[[1,1,1],[2,.2,.4]],{del:i*.07,jit:.002,rev:.3,pan:(i-1.5)*.18}));sdNz(.4,3200,.04,{q:.6,sw:.3,rev:.3})};
 SND.fs_rare=()=>{const V=[1,1.25,1.5,2,2.5,3],f=440;V.forEach((r,i)=>{sdHit(f*r,.8,.1,[[1,1,1],[2.76,.16,.4],[5.4,.04,.2]],{del:i*.09,jit:0,rev:.35,pan:(i-2.5)*.15})});sdHit(f/2,1.1,.12,[[1,1,1],[2,.2,.4]],{rev:.3})};
 SND.fs_gull=()=>{[0,.17,.3].forEach((d,i)=>sdHit(1250+i*90,.14,.06,[[1,1,1],[2,.3,.5]],{bend:.5,del:d,jit:.05,rev:.2,pan:rr(-.3,.3)}))};
 SND.fs_meow=()=>{sdHit(640,.28,.07,[[1,1,1],[2,.3,.5],[3,.1,.3]],{bend:.4,jit:.06,rev:.1});sdHit(560,.3,.05,[[1,1,1]],{del:.12,bend:-.2,jit:.04})};
 SND.fs_chest=()=>{for(let i=0;i<6;i++)sdHit(2300+i*170,.12,.09,[[1,1,1],[1.5,.5,.8]],{del:i*.05,jit:.05,rev:.15,pan:rr(-.3,.3)})}}catch(e){}};
const spl=k=>{try{SND_ADD();snd(k)}catch(e){}};

/* ---------- little blocky animals: cats and seagulls ---------- */
const bmesh=fn=>{const o=BT;BT=mkB();try{fn();return flush(BT,vmat())}finally{BT=o}};
function mkCat(c1,c2,x,z,y,ry){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;
 const sit=bmesh(()=>{bx(.3,.27,.3,c1,0,.14,-.1);bx(.24,.32,.22,c1,0,.3,.03,0,-.12);bx(.07,.26,.07,c1,-.07,.13,.15);bx(.07,.26,.07,c1,.07,.13,.15);bx(.09,.04,.11,c2,-.07,.02,.17);bx(.09,.04,.11,c2,.07,.02,.17);bx(.13,.18,.02,c2,0,.26,.15);bx(.09,.1,.05,c2,0,.04,-.22)});
 const head=bmesh(()=>{bx(.22,.18,.2,c1,0,0,0);bx(.06,.08,.05,c1,-.07,.13,-.02,0,0,.2);bx(.06,.08,.05,c1,.07,.13,-.02,0,0,-.2);bx(.03,.05,.02,'#ff9ab0',-.07,.13,0,0,0,.2);bx(.03,.05,.02,'#ff9ab0',.07,.13,0,0,0,-.2);bx(.1,.07,.05,c2,0,-.04,.12);bx(.04,.03,.02,'#ff8aa0',0,-.01,.15);bx(.04,.045,.02,'#7ae060',-.05,.03,.105);bx(.04,.045,.02,'#7ae060',.05,.03,.105);bx(.015,.045,.021,'#111',-.05,.03,.106);bx(.015,.045,.021,'#111',.05,.03,.106);bx(.04,.07,.02,c2,0,.07,.105);bx(.2,.012,.012,'#fff',0,-.03,.12)});
 head.position.set(0,.47,.08);
 const tail=new THREE.Group();tail.position.set(0,.06,-.2);const tm=bmesh(()=>{bx(.07,.07,.32,c1,0,.03,-.16);bx(.07,.15,.07,c1,0,.1,-.31);bx(.072,.05,.072,c2,0,.19,-.31)});tail.add(tm);
 const walk=new THREE.Group(),wb=bmesh(()=>{bx(.22,.2,.5,c1,0,.3,0);bx(.14,.06,.2,c2,0,.19,.1)});walk.add(wb);const legs=[[-.08,.17],[.08,.17],[-.08,-.17],[.08,-.17]].map(([a,b])=>{const l=new THREE.Group();l.position.set(a,.24,b);l.add(bmesh(()=>{bx(.07,.24,.07,c1,0,-.12,0);bx(.08,.04,.09,c2,0,-.24,.01)}));walk.add(l);return l});walk.visible=false;
 g.add(sit,head,tail,walk);root.add(g);
 const c={g,sit,head,tail,walk,legs,x,z,y,ry:ry||0,st:'sit',t:rr(0,9),home:[x,z,y,ry||0],tx:x,tz:z,hy:0,beg:0,meow:0,blink:rr(2,6)};ANIM.cats.push(c);return c}
function mkGull(px,py,pz,ry){const g=new THREE.Group();g.position.set(px,py,pz);g.rotation.y=ry||0;
 const body=bmesh(()=>{bx(.22,.2,.42,'#f4f4f0',0,.16,0);bx(.2,.06,.3,'#9aa6b0',0,.28,-.02);bx(.14,.06,.18,'#2a2a30',0,.26,-.26);bx(.14,.14,.2,'#f4f4f0',0,.14,-.3);bx(.15,.14,.16,'#f4f4f0',0,.34,.2);bx(.05,.04,.12,'#f2a02a',0,.32,.34);bx(.02,.02,.03,'#e03a2a',0,.31,.4);bx(.03,.03,.02,'#111',.065,.37,.27);bx(.03,.03,.02,'#111',-.065,.37,.27);bx(.03,.12,.03,'#f2a02a',-.05,.02,0);bx(.03,.12,.03,'#f2a02a',.05,.02,0);bx(.06,.02,.07,'#f2a02a',-.05,-.04,.02);bx(.06,.02,.07,'#f2a02a',.05,-.04,.02)});
 const wing=s=>{const w=new THREE.Group();w.position.set(s*.11,.27,0);w.add(bmesh(()=>{bx(.5,.035,.3,'#aab4bc',s*.25,0,0);bx(.2,.036,.3,'#26262c',s*.6,0,0)}));return w};
 const wl=wing(-1),wr=wing(1);g.add(body,wl,wr);root.add(g);
 const o={g,body,wl,wr,st:'perch',t:rr(0,9),home:[px,py,pz,ry||0],ang:rr(0,6.28),R:rr(9,18),alt:rr(7,12),cx:0,cz:0,timer:0,look:0,flap:0,sp:5+rr(0,2),lastAlarm:0};ANIM.gulls.push(o);return o}
function gullFold(o,k){/* k 0 folded, 1 spread */o.wl.rotation.set(0,(1-k)*1.45,(1-k)*-.1);o.wr.rotation.set(0,-(1-k)*1.45,(1-k)*.1)}
const PW=()=>[P.x-FX,P.z-ZE];
function gullTick(o,dt,t){const g=o.g,pl=PW(),hx=o.home[0],hz=o.home[2];
 if(o.st=='perch'){const dp=Math.hypot(pl[0]-hx,pl[1]-hz);o.look+=dt;g.rotation.y=o.home[3]+Math.sin(t*.4+o.t)*.5;g.position.y=o.home[1]+Math.abs(Math.sin(t*1.7+o.t))*.0;gullFold(o,0);
  if(dp<3.2&&mode!='menu'||o.alarm){o.alarm=0;o.st='fly';o.timer=rr(14,28);o.cx=pl[0]+rr(-12,12);o.cz=pl[1]-rr(10,24);o.ang=Math.atan2(hz-o.cz,hx-o.cx);o.fy=o.home[1];o.fl=0;spl('fs_gull')}}
 else if(o.st=='fly'||o.st=='dive'){o.timer-=dt;o.fl=Math.min(1,(o.fl||0)+dt*.6);let tx,tz,ty;
  if(o.st=='dive'){const gx=o.dx,gz=o.dz;tx=gx+Math.cos(t*3+o.t)*1.4;tz=gz+Math.sin(t*3+o.t)*1.4;ty=o.dy+Math.sin(t*5)*.4;const k=1-Math.exp(-dt*2.2);g.position.x+=(tx-g.position.x)*k;g.position.z+=(tz-g.position.z)*k;g.position.y+=(ty-g.position.y)*k;const dx=tx-g.position.x,dz=tz-g.position.z;g.rotation.y=Math.atan2(-dx,-dz)||g.rotation.y;
   const fl=Math.sin(t*16+o.t);gullFold(o,1);o.wl.rotation.z=fl*.6;o.wr.rotation.z=-fl*.6;if(o.timer<=0){o.st='fly';o.timer=rr(8,16);o.cx=o.dx;o.cz=o.dz-rr(8,14)}return}
  o.ang+=dt*o.sp/o.R;tx=o.cx+Math.cos(o.ang)*o.R;tz=o.cz+Math.sin(o.ang)*o.R;ty=o.alt+Math.sin(t*.6+o.t)*1.3;
  const k=1-Math.exp(-dt*1.6);const px=g.position.x,pz=g.position.z;g.position.x+=(tx-px)*k;g.position.z+=(tz-pz)*k;g.position.y+=(ty-g.position.y)*k;g.rotation.y=Math.atan2(-(g.position.x-px),-(g.position.z-pz))||g.rotation.y;
  const glide=Math.sin(t*.5+o.t)>.55,fl=glide?0:Math.sin(t*11+o.t);gullFold(o,1);o.wl.rotation.z=fl*.55+.12;o.wr.rotation.z=-fl*.55-.12;g.rotation.z=Math.sin(t*.7+o.t)*.25;
  if(o.timer<=0){o.st='land';o.lt=0;o.from=[g.position.x,g.position.y,g.position.z]}}
 else if(o.st=='land'){o.lt+=dt/2.2;const k=sm(0,1,o.lt);g.position.set(lerp(o.from[0],hx,k),lerp(o.from[1],o.home[1],k)+Math.sin(k*Math.PI)*1.1,lerp(o.from[2],hz,k));const fl=Math.sin(t*14);gullFold(o,1-k*.6);o.wl.rotation.z=fl*.5*(1-k);o.wr.rotation.z=-fl*.5*(1-k);g.rotation.z*=.9;
  if(o.lt>=1){o.st='perch';g.rotation.z=0;g.position.set(hx,o.home[1],hz)}}}
function catTick(c,dt,t){const g=c.g,pl=PW();c.t+=dt;c.blink-=dt;
 if(c.st=='sit'){const d=Math.hypot(pl[0]-c.x,pl[1]-c.z);let ty=c.home[3];
  if(G&&G.on&&G.st=='wait'&&G.land){const lx=G.land.x-FX-c.x,lz=G.land.z-ZE-c.z;ty=Math.atan2(lx,lz)}else if(d<7&&mode!='menu'){ty=Math.atan2(pl[0]-c.x,pl[1]-c.z)}
  let df=ty-c.head.rotation.y-g.rotation.y;df=Math.atan2(Math.sin(df),Math.cos(df));c.head.rotation.y=clamp(c.head.rotation.y+df*Math.min(1,dt*4),-1.1,1.1);
  c.tail.rotation.y=Math.sin(c.t*1.4)*.5;c.head.rotation.x=Math.sin(c.t*.9)*.04;c.g.scale.y=1+Math.sin(c.t*2.1)*.012;c.head.scale.y=c.blink<0&&c.blink>-.12?.55:1;if(c.blink<-.12)c.blink=rr(2.5,7);
  g.position.set(c.x,c.y,c.z);g.rotation.y=c.home[3];c.sit.visible=true;c.walk.visible=false}
 else if(c.st=='run'){const dx=c.tx-g.position.x,dz=c.tz-g.position.z,d=Math.hypot(dx,dz);c.sit.visible=false;c.walk.visible=true;c.head.position.set(0,.5,.28);c.head.rotation.y=0;
  if(d<.12){c.st=c.beg>0?'beg':'sit';c.x=g.position.x;c.z=g.position.z;c.head.position.set(0,.47,.08);if(c.beg>0){c.bt=0;spl('fs_meow')}else{c.sit.visible=true;c.walk.visible=false;c.home=[c.x,c.z,c.y,g.rotation.y]}return}
  const sp=2.6*dt;g.position.x+=dx/d*sp;g.position.z+=dz/d*sp;let a=Math.atan2(dx,dz),df=a-g.rotation.y;df=Math.atan2(Math.sin(df),Math.cos(df));g.rotation.y+=df*Math.min(1,dt*9);
  const ph=t*14;c.legs.forEach((l,i)=>l.rotation.x=Math.sin(ph+(i==1||i==2?Math.PI:0))*.7);g.position.y=c.y+Math.abs(Math.sin(ph))*.04;c.tail.rotation.y=Math.sin(t*6)*.3;c.tail.rotation.x=-.6}
 else if(c.st=='beg'){c.bt+=dt;c.sit.visible=true;c.walk.visible=false;c.tail.rotation.x=0;g.position.y=c.y;const lk=Math.atan2(pl[0]-g.position.x,pl[1]-g.position.z);g.rotation.y+=(lk-g.rotation.y)*Math.min(1,dt*5);c.head.rotation.y=0;c.head.rotation.x=-.25+Math.sin(c.bt*2.2)*.08;c.tail.rotation.y=Math.sin(c.bt*3)*.5;
  if(c.bt>1.8&&!c.m2){c.m2=1;spl('fs_meow')}if(c.bt>(c.beg||5)||(!G||!G.on)&&c.bt>2.5){c.st='run';c.beg=0;c.m2=0;c.tx=c.home[0];c.tz=c.home[1]}}
 c.tail.rotation.x=c.st=='run'?-.6:c.tail.rotation.x*(.9)}
function catBeg(){/* a cat comes over to the angler when something is caught */const sp=G.sp,c=ANIM.cats.filter(k=>k.st=='sit').sort((a,b)=>Math.hypot(a.x-sp.x,a.z-sp.z)-Math.hypot(b.x-sp.x,b.z-sp.z))[0];if(!c)return;
 const d=[Math.sin(G.yaw),Math.cos(G.yaw)],r=[-d[1],d[0]];let tx=sp.x+d[0]*.3+r[0]*.85,tz=sp.z+d[1]*.3+r[1]*.85;if(Math.abs(sp.x)<4&&sp.z>-37.2)tx=clamp(tx,-1.6,1.6);else if(sp.z<-37.2)tz=clamp(tz,-42,-37.6);
 c.st='run';c.beg=5;c.tx=tx;c.tz=tz;c.y=sp.y}
function gullDive(){const o=ANIM.gulls.slice().sort((a,b)=>(a.st=='perch'?1:0)-(b.st=='perch'?1:0)||Math.hypot(a.g.position.x-G.sp.x,a.g.position.z-G.sp.z)-Math.hypot(b.g.position.x-G.sp.x,b.g.position.z-G.sp.z))[0];if(!o)return;
 o.st='dive';o.timer=5;o.dx=G.sp.x+Math.sin(G.yaw)*2.5;o.dz=G.sp.z+Math.cos(G.yaw)*2.5;o.dy=G.sp.y+2.9;o.fl=1;spl('fs_gull')}

/* ---------- people: Salty in the hut, Old Mara on her bench, Pete at the rail (all buildChar) ---------- */
const NPC=[];let ppBuilt=false;
function person(x,z,ry,o){const i=NPC.length,r=n=>{let h=Math.sin((i+1)*61.7+n*13.3)*43758.5;return h-Math.floor(h)};
 const c={skin:Math.floor(r(1)*(typeof SKIN!='undefined'?SKIN.length:6)),eyes:o.eyes!=null?o.eyes:Math.floor(r(2)*4),mouth:Math.floor(r(3)*4),hair:o.hair!=null?o.hair:Math.floor(r(4)*12),hc:Math.floor(r(5)*(typeof HAIRC!='undefined'?HAIRC.length:12)),top:o.topT!=null?o.topT:0,tc:0,pc:0,tc_custom:o.top||'#ffd23d',pc_custom:o.pants||'#2b3a55',body:o.body!=null?o.body:r(6),bt:o.bt!=null?o.bt:2,hgt:o.hgt!=null?o.hgt:.45};
 if(o.hcc)c.hc_custom=o.hcc;const f=buildChar(c);f.g.position.set(x,o.y,z);f.g.rotation.y=ry;root.add(f.g);
 if(o.seat){f.legs.forEach(l=>l.rotation.x=-1.5)}
 const p={f,k:o.k,x,z,y:o.y,ry,ph:i*1.7,nm:o.nm,cd:rr(30,70),a:0,hold:null,bub:null,bt:0};NPC.push(p);return p}
/* a rod with a bendable blade: n nested segments, the tip is a marker object */
function makeRod(col,len,n){n=n||5;const g=new THREE.Group(),segs=[],sl=len/n;let par=g;
 g.add(bmesh(()=>{bx(.06,.06,.34,'#2a2f38',0,0,.02);bx(.07,.11,.09,'#222',0,-.07,.1);bx(.05,.04,.15,COL.iron,0,-.12,.12)}));
 for(let i=0;i<n;i++){const s=new THREE.Group();s.position.z=i?sl:.3;const th=.05-.03*i/n;s.add(bmesh(()=>{bx(th,th,sl*1.04,col,0,0,sl/2)}));par.add(s);segs.push(s);par=s}
 const tip=new THREE.Object3D();tip.position.z=sl;par.add(tip);
 const lm=new THREE.MeshLambertMaterial({color:0x4a505c}),lg=new THREE.MeshLambertMaterial({color:0xc9ced6}),lk=new THREE.MeshLambertMaterial({color:0xe6b422}),reel=new THREE.Group();reel.position.set(0,-.17,.13);
 const sp1=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.075,14),lm);sp1.rotation.z=Math.PI/2;reel.add(sp1);const sp2=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.012,14),lg);sp2.rotation.z=Math.PI/2;sp2.position.x=.043;reel.add(sp2);
 const hd=new THREE.Group();hd.position.x=.056;const ar=new THREE.Mesh(new THREE.BoxGeometry(.014,.075,.014),lg);ar.position.y=-.037;hd.add(ar);const kn=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),lk);kn.position.set(.014,-.075,0);hd.add(kn);reel.add(hd);const st2=new THREE.Mesh(new THREE.BoxGeometry(.03,.07,.05),lm);st2.position.set(0,.05,0);reel.add(st2);g.add(reel);
 return{g,segs,tip,reel:hd,bend:b=>segs.forEach((s,i)=>s.rotation.x=b/n*(.6+.8*i/n))}}
function lineMesh(n){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((n+1)*3),3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xf4f4ff,transparent:true,opacity:.8}));l.frustumCulled=false;l.userData.n=n;return l}
function setLine(l,a,b,sag){const n=l.userData.n,p=l.geometry.attributes.position.array;for(let i=0;i<=n;i++){const t=i/n,k=i*3;p[k]=lerp(a.x,b.x,t);p[k+1]=lerp(a.y,b.y,t)-sag*4*t*(1-t);p[k+2]=lerp(a.z,b.z,t)}l.geometry.attributes.position.needsUpdate=true}
function bobberMesh(){/* a round red and white bobber with a yellow antenna: one mesh, vertex colours, own geometry */
 const P3=[],N3=[],C3a=[],add=(geo,x,y,z,cf)=>{const g=geo.index?geo.toNonIndexed():geo,p=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<p.length;i+=9){const yy=(p[i+1]+p[i+4]+p[i+7])/3,c=new THREE.Color(cf(yy));for(let q=0;q<3;q++){P3.push(p[i+q*3]+x,p[i+q*3+1]+y,p[i+q*3+2]+z);N3.push(n[i+q*3],n[i+q*3+1],n[i+q*3+2]);C3a.push(c.r,c.g,c.b)}}};
 add(new THREE.SphereGeometry(.1,16,12),0,.02,0,y=>y>0?'#e0382c':'#f6f4ee');
 add(new THREE.CylinderGeometry(.012,.012,.2,6),0,.2,0,()=>'#ffd23a');add(new THREE.CylinderGeometry(.02,.02,.03,8),0,.1,0,()=>'#ffd23a');
 add(new THREE.CylinderGeometry(.014,.014,.1,6),0,-.1,0,()=>'#6a6a70');
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N3,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C3a,3));
 return new THREE.Mesh(g,vmat())}
function buildPeople(){if(ppBuilt)return;ppBuilt=true;
 const clerk=person(-13.6,7,Math.PI/2,{k:'clerk',top:'#f3efe2',pants:'#22405e',y:.12,hair:2,bt:3,nm:'Salty',hcc:'#7a7a80',body:.6,topT:5});clerk.f.arms[1].rotation.x=-.4;
 const mara=person(-1.28,-21,-Math.PI/2,{k:'mara',top:'#d9483b',pants:'#46748c',y:DECK-.02,hair:7,bt:1,nm:'Old Mara',seat:1,hcc:'#e8e8ee',body:.3,topT:6});mara.rod=makeRod('#9a6a3c',2.8,5);mara.rod.g.position.set(-1.7,DECK+1.15,-21);mara.rod.g.rotation.set(-.55,-Math.PI/2,0);root.add(mara.rod.g);mara.rod.bend(.18);mara.f.arms[1].rotation.x=-1.0;mara.f.arms[0].rotation.x=-.9;
 const pete=person(-5.3,-42,Math.PI,{k:'pete',top:'#2aa7a1',pants:'#5a4a3a',y:DECK,hair:1,bt:2,nm:'Pete',hcc:'#3a2a1a',topT:7});pete.rod=makeRod('#2b2f3a',3.0,5);pete.rod.g.position.set(-5.0,DECK+1.1,-42.3);pete.rod.g.rotation.set(-.6,Math.PI,0);root.add(pete.rod.g);pete.rod.bend(.2);pete.f.arms[1].rotation.x=-1.0;pete.f.arms[0].rotation.x=-.8;
 /* each angler has a line into the sea and a bobber */
 [[mara,-8.5,-23.5],[pete,-3.5,-52]].forEach(([n,lx,lz])=>{n.line=lineMesh(14);root.add(n.line);n.bob=bobberMesh();const u=uAt(lx,lz);n.bob.position.set(lx,baseY(u)+.04,lz);n.bob.userData.y=baseY(u)+.04;root.add(n.bob);n.lx=lx;n.lz=lz});
 root.updateMatrixWorld(true)}
const _v=new THREE.Vector3();
function npcTick(dt,t){NPC.forEach(n=>{const g=n.f.g;
 if(n.k=='clerk'){n.f.arms[1].rotation.x=-.5+Math.sin(t*1.6+n.ph)*.1;g.rotation.y=Math.PI/2+Math.sin(t*.35)*.25;if(G&&G.on)g.rotation.y=Math.PI/2;return}
 if(n.k!='mara'&&n.k!='pete')return;
 n.cd-=dt;const tip=n.rod.tip;tip.getWorldPosition(_v);const loc=root.worldToLocal(_v.clone());
 if(n.a==0){n.bob.position.y=n.bob.userData.y+Math.sin(t*1.7+n.ph)*.025;n.bob.rotation.z=Math.sin(t*1.1+n.ph)*.08;n.f.arms[0].rotation.x=-.85+Math.sin(t*.9+n.ph)*.03;n.rod.bend(.18+Math.sin(t*.7+n.ph)*.03);
  if(n.cd<=0){n.a=1;n.at=0;n.cd=rr(70,130);n.bub={t:'Got one!',l:2.4};spl('fs_plip')}}
 else if(n.a==1){n.at+=dt;n.bob.position.y=n.bob.userData.y-Math.min(.25,n.at*.8);n.rod.bend(.5);n.f.arms[1].rotation.x=-1.6;n.f.arms[0].rotation.x=-1.2;if(n.at>.7){n.a=2;n.at=0}}
 else if(n.a==2){n.at+=dt;n.f.arms[1].rotation.x=-1.0+Math.sin(n.at*12)*.15;n.f.arms[0].rotation.x=-1.1+Math.sin(n.at*12+1.5)*.3;n.rod.bend(.45);n.bob.position.y=n.bob.userData.y+Math.sin(n.at*14)*.05;n.bob.position.x=n.lx+Math.sin(n.at*3)*(1.2-n.at*.3);if(n.at>2.6){n.a=3;n.at=0;n.bob.position.x=n.lx;const s=pk(SP.filter(q=>q.k=='f'&&q.r<=1));n.hold=npcFish(s.id,g);n.bub={t:pk(['Look at this beauty!','Dinner!','Not bad, eh?','Another one for the bucket.']),l:2.8};spl('fs_splash')}}
 else if(n.a==3){n.at+=dt;n.f.arms[1].rotation.x=-2.3;n.f.arms[0].rotation.x=-2.3;n.rod.bend(.1);if(n.hold){n.hold.position.set(0,2.3,.25);n.hold.rotation.y+=dt*1.5;swim(n.hold,t,.14,10)}if(n.at>3.2){n.a=0;if(n.hold){g.remove(n.hold);disposeM(n.hold);n.hold=null}}}
 const bp=n.bob.position;_v.set(loc.x,loc.y,loc.z);setLine(n.line,_v,{x:bp.x,y:bp.y+.2,z:bp.z},n.a==2?.1:.5);
 if(n.bub){n.bub.l-=dt;if(n.bub.l<=0)n.bub=null}})}
function npcFish(id,parent){const m=modelMesh(id,.7);m.position.set(0,2.3,.25);parent.add(m);return m}
/* ---------- v55.29.0: real 3D fish. Every catch is a smooth model built from a recipe (FM): a lofted body with countershading, stripes, spots
   and a lateral line, real fins (forked, lunate, round, shark tails, spiny dorsals), eyes with pupils and the extras (hammer, bill, whiskers, lure,
   photophores, spikes, crest). Crab, squid, ray and the junk have their own builders. One swim shader bends the body (uM 0 = fish, 1 = ray wings,
   2 = crab legs); the same models draw the catch card, the journal and the reel game through one small offscreen renderer (IR). ---------- */
const C3=c=>new THREE.Color(c),mixC=(a,b,t)=>a.clone().lerp(b,clamp(t,0,1));
const FM={};
const R3=(id,o)=>{FM[id]=o};
/* H height, W width (both / length), pk where the body is tallest (0 tail .. 1 nose), ped tail-stalk size, c [back, side, belly], f fin colour, fe fin edge,
   tl tail [kind, length, half height], d / d2 dorsal fins [from, to, height], an anal fin, pc pectoral size, e eye size, ec iris colour,
   bars / wav / spots / lat patterns, k wave number, sh shininess */
R3('minnow',{H:.2,W:.12,pk:.62,c:['#5d7e92','#cfdde6','#f4f8fa'],f:'#b9ccd8',tl:['fork',.22,.12],d:[.46,.6,.55],an:[.18,.3,.4],pc:.08,e:.045,lat:'#8fb3c8',sh:80,spc:'#6a6a6a'});
R3('sunfish',{H:.62,W:.2,pk:.55,ped:.2,c:['#b8652a','#f2b84a','#ffe9a8'],f:'#e8741c',tl:['round',.2,.2],d:[.14,.72,.3,1],an:[.12,.46,.3],pc:.12,e:.055,spots:[['#2e8bc2',14,.045,3]],ear:'#1b2a40'});
R3('perch',{H:.3,W:.14,pk:.6,c:['#3a6229','#9aba52','#f0efb8'],f:'#e0542a',tl:['fork',.2,.14],d:[.34,.62,.6,1],d2:[.13,.31,.4],an:[.12,.26,.38],pc:.1,e:.05,bars:['#263f1a',6,.8]});
R3('herring',{H:.22,W:.12,pk:.6,c:['#2f5f84','#c5d8e4','#f3f6f8'],f:'#8aa6b8',tl:['fork',.25,.14],d:[.42,.58,.5],an:[.12,.28,.25],pc:.08,e:.045,sh:90,spc:'#7a7a7a'});
R3('mackerel',{H:.2,W:.14,pk:.58,c:['#1f6f72','#a8cfd6','#eef4f4'],f:'#3c6e78',tl:['lunate',.22,.16],d:[.56,.7,.55],d2:[.22,.32,.32],an:[.2,.3,.3],pc:.08,e:.04,wav:['#132d36',9],sh:80,spc:'#5a5a5a',fl:5});
R3('flounder',{flat:1,H:.55,W:.09,pk:.5,ped:.16,c:['#6d5c3a','#9e8b5c','#f3efe4'],f:'#a8955a',tl:['round',.14,.15],d:[.05,.9,.14],an:[.06,.8,.13],pc:.07,e:.045,spots:[['#4a3c22',18,.05,5],['#d8c890',9,.03,9]]});
R3('puffer',{H:.72,W:.66,pk:.5,ped:.22,c:['#8a6c36','#e0c88a','#fff4d0'],f:'#c9a85a',tl:['round',.16,.14],d:[.16,.3,.35],an:[.14,.28,.3],pc:.12,e:.075,ec:'#ffe36a',spots:[['#4a3618',20,.035,7]],spikes:46});
R3('bass',{H:.3,W:.16,pk:.58,c:['#2a4230','#93a67a','#f2f0d8'],f:'#5f7d52',tl:['fork',.2,.16],d:[.32,.66,.5,1],an:[.13,.3,.36],pc:.1,e:.045,lat:'#2a3a26',mouth:1});
R3('eel',{H:.075,W:.065,pk:.62,ped:.35,c:['#2f3d4a','#8e9ca8','#dfe6ea'],f:'#5a6c7a',tl:['point',.06,.03],d:[.0,.62,.55,2],an:[.0,.5,.5,2],pc:.05,e:.022,k:9,fl:3});
R3('snapper',{H:.36,W:.15,pk:.6,c:['#a8281a','#e8664a','#f6bfae'],f:'#c8321e',tl:['fork',.22,.16],d:[.25,.68,.42,1],an:[.15,.32,.4],pc:.11,e:.05,ec:'#ffcf9a'});
R3('barracuda',{H:.14,W:.1,pk:.45,c:['#334652','#a8b6c0','#eef0f2'],f:'#6c7e8c',tl:['fork',.2,.13],d:[.56,.66,.6],d2:[.2,.3,.5],an:[.2,.3,.45],pc:.07,e:.032,bars:['#26343e',16,.55],snout:1,teeth:1,sh:70});
R3('tuna',{H:.3,W:.22,pk:.5,c:['#13284d','#6f8fb4','#e8eef4'],f:'#2a4a74',tl:['lunate',.24,.25],d:[.55,.67,.6],d2:[.34,.44,1,0,'#f2c82e'],an:[.32,.42,.9,'#f2c82e'],pc:.14,e:.04,lat:'#f2c82e',finlets:'#f2c82e',sh:90,spc:'#6a6a6a'});
R3('shark',{H:.2,W:.17,pk:.62,c:['#4c5c6a','#8a9aa8','#e4eaee'],f:'#4a5a68',tl:['shark',.3,.2],d:[.55,.68,1.3],d2:[.2,.25,.35],an:[.19,.24,.35],pc:.2,e:.03,hammer:1,fl:4});
R3('sword',{H:.2,W:.16,pk:.55,c:['#1b3050','#6d86a2','#e6edf3'],f:'#33506f',tl:['lunate',.26,.26],d:[.6,.8,1.15],an:[.25,.32,.45],pc:.13,e:.045,bill:.42,sh:80});
R3('glowfin',{H:.45,W:.2,pk:.55,c:['#0a1226','#22335e','#3a5686'],f:'#2a4a7c',fe:'#7ff3ff',tl:['fork',.2,.17],d:[.3,.6,.4],an:[.2,.4,.35],pc:.1,e:.075,ec:'#b8f6ff',glow:'#7ff3ff',lure:1});
R3('koi',{H:.28,W:.17,pk:.58,c:['#e08a0c','#ffcf3a','#fff0b0'],f:'#ffcf3a',fe:'#fff8d8',tl:['fork',.3,.21],d:[.25,.7,.4],an:[.15,.28,.4],pc:.15,e:.045,spots:[['#fff7d0',9,.075,11]],whisk:1,sh:110,spc:'#9a8040'});
R3('oar',{H:.085,W:.04,pk:.72,ped:.3,c:['#909cac','#dbe2ea','#f4f7fa'],f:'#e6405a',tl:['point',.07,.03],d:[.02,.97,.9,2],an:[.0,0,0],pc:.03,e:.02,spots:[['#5a6676',26,.018,13]],crest:'#e6405a',k:10,sh:100,spc:'#7a7a7a',fl:3});
R3('crab',{kind:'crab',k:6,view:[.6,-.3]});R3('squid',{kind:'squid',k:7});R3('ray',{kind:'ray',m:1,k:4,view:[.85,0,0],sh:18,spc:'#141414'});
R3('boot',{kind:'boot'});R3('can',{kind:'can',sh:120,spc:'#9a9a9a',view:[.25,-.3,.9]});R3('weed',{kind:'weed',k:6});R3('duck',{kind:'duck',sh:90});R3('bottle',{kind:'bottle',sh:140,spc:'#cfe'});R3('chest',{kind:'chest'});
/* the mesh builder: everything is merged into one non-indexed geometry with colour, swim weight (aSw) and glow (aGl) */
const MB=()=>({p:[],n:[],c:[],w:[],g:[]});
const _m4=new THREE.Matrix4(),_q4=new THREE.Quaternion(),_e4=new THREE.Euler(),_s4=new THREE.Vector3(),_p4=new THREE.Vector3(),_n3=new THREE.Matrix3(),_v4=new THREE.Vector3(),_w4=new THREE.Vector3();
/* o: p position, r rotation [x,y,z], s scale (number or [x,y,z]), c colour (hex/Color or fn(x,y,z,nx,ny,nz) -> Color), w swim weight (number or fn(x,y,z)), gl glow 0..1 */
function addG(b,geo,o){o=o||{};const g=geo.index?geo.toNonIndexed():geo;if(!g.attributes.normal)g.computeVertexNormals();
 const P2=g.attributes.position,N2=g.attributes.normal,CA=g.attributes.color,s=o.s==null?1:o.s;
 _e4.set((o.r||[0,0,0])[0],(o.r||[0,0,0])[1],(o.r||[0,0,0])[2],'XYZ');_q4.setFromEuler(_e4);if(typeof s=='number')_s4.set(s,s,s);else _s4.set(s[0],s[1],s[2]);_p4.set(...(o.p||[0,0,0]));_m4.compose(_p4,_q4,_s4);_n3.getNormalMatrix(_m4);
 const cf=typeof o.c=='function'?o.c:null,cc=cf?null:o.c!=null?C3(o.c):null,wf=typeof o.w=='function'?o.w:null,cl=new THREE.Color(1,1,1);
 for(let i=0;i<P2.count;i++){_v4.set(P2.getX(i),P2.getY(i),P2.getZ(i)).applyMatrix4(_m4);_w4.set(N2.getX(i),N2.getY(i),N2.getZ(i)).applyMatrix3(_n3).normalize();
  b.p.push(_v4.x,_v4.y,_v4.z);b.n.push(_w4.x,_w4.y,_w4.z);
  let c=cc;if(cf)c=cf(_v4.x,_v4.y,_v4.z,_w4.x,_w4.y,_w4.z);else if(!c&&CA){cl.setRGB(CA.getX(i),CA.getY(i),CA.getZ(i));c=cl}else if(!c)c=cl;b.c.push(c.r,c.g,c.b);
  b.w.push(wf?wf(_v4.x,_v4.y,_v4.z):(o.w||0));b.g.push(o.gl||0)}
 if(g!==geo)g.dispose();geo.dispose()}
function finG(pts){const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);return new THREE.ShapeGeometry(sh)}
/* a fin: a flat outline in the x-y plane; colour runs from the root colour to the edge colour by distance from the root line y=y0 */
function addFin(b,pts,o){const f=C3(o.c),fe=C3(o.fe||'#ffffff'),sp=o.span||.1,y0=o.y0||0,ref=o.ref;
 addG(b,finG(pts),{p:o.p,r:o.r,s:o.s,w:o.w,c:(x,y,z)=>{const d=ref?Math.hypot(x-ref[0],y-ref[1],z-ref[2])/sp:Math.abs(y-y0)/sp;const t=clamp(d,0,1);const k=mixC(f,fe,t*(o.fk==null?.35:o.fk));const ray=1-.12*(.5+.5*Math.sin((x*(o.rays||90))));return k.multiplyScalar(ray)}})}
const hsh=(n,s)=>{const x=Math.sin(n*127.1+(s||0)*311.7)*43758.5453;return x-Math.floor(x)};
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const fishW=x=>Math.min(1.5,Math.pow(clamp((.32-x)/.82,0,2),1.5));/* swim weight along the body: none at the head, most at the tail */
function buildFishBody(b,o){const N=44,M=26,H=o.H,W=o.W,ped=o.ped==null?.13:o.ped,pk=Math.log(.5)/Math.log(o.pk||.58),c0=C3(o.c[0]),c1=C3(o.c[1]),c2=C3(o.c[2]);
 const hh=u=>{const s=Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(u,pk))),.72);let v=H/2*((1-ped)*s+ped*Math.pow(1-u,.6));if(o.snout)v*=1-.35*ss(.8,1,u);return v},
  hw=u=>{const s=Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(u,pk))),.8);return W/2*((1-ped*.7)*s+ped*.7*Math.pow(1-u,.6))},
  yc=u=>o.flat?0:-H*.035*Math.sin(Math.PI*u);
 const spots=[];(o.spots||[]).forEach(([c,n,r,sd])=>{for(let k=0;k<n;k++){const u=.12+.78*hsh(k+1,sd),a=o.flat?(-.9+1.8*hsh(k+7,sd)):(-.15+2.0*hsh(k+3,sd));spots.push({c:C3(c),r,u,a})}});
 const pos=[],col=[],idx=[],lc=o.lat?C3(o.lat):null,bc=o.bars?C3(o.bars[0]):null,wc=o.wav?C3(o.wav[0]):null;
 const P=(u,a)=>{const x=u-.5,ny=Math.sin(a),nz=Math.cos(a);return[x,yc(u)+hh(u)*ny,hw(u)*nz]};spots.forEach(q=>q.p=P(q.u,q.a));
 for(let i=0;i<N;i++){const u=(1-Math.cos(Math.PI*i/(N-1)))/2*.995+.0025;
  for(let j=0;j<M;j++){const a=-Math.PI/2+j/M*Math.PI*2,p=P(u,a),ny=Math.sin(a),nz=Math.cos(a),k=o.flat?nz:ny;pos.push(p[0],p[1],p[2]);
   let c=k>0?mixC(c1,c0,ss(-.05,.6,k)):mixC(c1,c2,ss(.05,-.55,k));
   if(o.flat&&nz<0)c=c2.clone();
   if(bc&&(o.flat?nz>-.2:ny>-.5)){const v=.5+.5*Math.cos(u*o.bars[1]*Math.PI*2);c=mixC(c,bc,o.bars[2]*ss(.55,.8,v)*(1-ss(.85,.97,u))*ss(.04,.12,u))}
   if(wc&&ny>0){const v=Math.sin((u*o.wav[1]+ny*1.2+Math.sin(u*31)*.12)*Math.PI*2);c=mixC(c,wc,.85*ss(.2,.6,v)*ss(.05,.35,ny)*(1-ss(.8,.9,u)))}
   if(lc&&!o.flat&&Math.abs(ny-.04)<.12&&u>.12&&u<.8)c=mixC(c,lc,.55*(1-Math.abs(ny-.04)/.12));
   for(const s of spots){const sp=s.p;if(o.flat&&nz<0)break;const d=Math.hypot(p[0]-sp[0],p[1]-sp[1],(p[2]-sp[2])*.6);if(d<s.r)c=mixC(c,s.c,ss(s.r,s.r*.55,d))}
   if(u>.78&&u<.83&&k<.75&&!o.flat)c.multiplyScalar(.86);/* the gill line */
   if(o.ear&&Math.hypot(u-.79,ny-.25)<.07)c=C3(o.ear);
   const nn=.97+.06*hsh(i*31+j,2);c.multiplyScalar(nn);col.push(c.r,c.g,c.b)}}
 for(let i=0;i<N-1;i++)for(let j=0;j<M;j++){const a=i*M+j,b2=i*M+(j+1)%M,c=(i+1)*M+j,d=(i+1)*M+(j+1)%M;idx.push(a,c,b2,b2,c,d)}
 const t0=pos.length/3;{const u=.0025;pos.push(u-.5,yc(u),0);const c=c1;col.push(c.r,c.g,c.b)}for(let j=0;j<M;j++)idx.push(t0,j,(j+1)%M);
 const t1=pos.length/3;{pos.push(.5,yc(1),0);const c=mixC(c1,c0,.3);col.push(c.r,c.g,c.b)}for(let j=0;j<M;j++){const a=(N-1)*M+j,b2=(N-1)*M+(j+1)%M;idx.push(t1,b2,a)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 addG(b,g,{w:x=>fishW(x)});
 /* the shape helpers for the fins */
 const X=u=>u-.5,TY=u=>yc(u)+hh(u)*.94,BY=u=>yc(u)-hh(u)*.94,f=o.f,fe=o.fe||'#ffffff';
 /* tail */
 {const [k,tl,th]=o.tl,rh=Math.max(hh(.01),.01)*1.05,x0=-.49;let pts;
  if(k=='fork')pts=[[0,rh],[-tl*.75,th],[-tl,th*.96],[-tl*.58,0],[-tl,-th*.96],[-tl*.75,-th],[0,-rh]];
  else if(k=='lunate')pts=[[0,rh],[-tl*.5,th*.55],[-tl,th*1.05],[-tl*.78,th*.45],[-tl*.6,0],[-tl*.78,-th*.45],[-tl,-th*1.05],[-tl*.5,-th*.55],[0,-rh]];
  else if(k=='shark')pts=[[0,rh],[-tl*.6,th*.7],[-tl,th*1.25],[-tl*.85,th*.95],[-tl*.55,0],[-tl*.6,-th*.4],[-tl*.45,-th*.55],[0,-rh]];
  else if(k=='point')pts=[[0,rh],[-tl,0],[0,-rh]];
  else{pts=[[0,rh]];for(let q=0;q<=10;q++){const a=Math.PI*(.5+q/10);pts.push([-tl*.42+Math.cos(a)*tl*.58,Math.sin(a)*th])}pts.push([0,-rh])}
  addFin(b,pts,{p:[x0,yc(0),0],c:f,fe,ref:[x0,yc(0),0],span:tl,w:x=>fishW(x),rays:160})}
 /* dorsal, second dorsal, anal */
 const ridge=(ua,ub,h,up,spk,col)=>{if(!(ub>ua)||!(h>0))return;const n=12,pts=[],hgt=h*H;
  for(let q=0;q<=n;q++){const t=q/n,u=lerp(ua,ub,t),y=up?TY(u):BY(u);let e=spk==2?.85*ss(0,.08,t)*ss(1,.9,t)+.05:Math.pow(Math.sin(Math.PI*Math.min(1,t*1.25+.0)),.8)*(1-.55*t)+.08;if(spk!=2&&t<.12)e*=t/.12;if(spk==1&&q%2==1&&t<.65)e*=1.25;else if(spk==1&&t<.65)e*=.82;pts.push([X(u),y+(up?1:-1)*hgt*e])}
  for(let q=n;q>=0;q--){const u=lerp(ua,ub,q/n);pts.push([X(u),(up?TY(u):BY(u))+(up?-1:1)*.004])}
  addFin(b,pts.map(p=>[p[0],p[1]]),{c:col||f,fe,y0:up?TY((ua+ub)/2):BY((ua+ub)/2),span:hgt,w:x=>fishW(x),rays:220})};
 ridge(o.d[0],o.d[1],o.d[2],1,o.d[3],o.d[4]);if(o.d2)ridge(o.d2[0],o.d2[1],o.d2[2],1,o.d2[3],o.d2[4]);if(o.an)ridge(o.an[0],o.an[1],o.an[2],0,o.an[3]==2?2:0,typeof o.an[3]=='string'?o.an[3]:null);
 if(o.crest){ridge(.88,.995,1.8,1,1,o.crest);for(let q=0;q<5;q++){const u=.9+q*.018;addG(b,new THREE.ConeGeometry(.006,.16+q*.03,4),{p:[X(u)-.05,TY(u)+.08+q*.01,0],r:[0,0,1.1+q*.08],c:o.crest,w:.6})}}
 if(o.finlets){for(let q=0;q<6;q++){const u=.06+q*.035;[1,0].forEach(up=>{const y=up?TY(u):BY(u),s=.022;addFin(b,[[s*.6,0],[-s*.6,0],[-s,(up?1:-1)*s*1.3]],{p:[X(u),y,0],c:o.finlets,fe:o.finlets,span:.03,w:x=>fishW(x)})})}}
 /* pectoral and pelvic fins, both sides */
 [1,-1].forEach(sd=>{const u=.72,pc=o.pc||.1,y=o.flat?yc(u):yc(u)-hh(u)*.3,z=o.flat?0:hw(u)*.92*sd;
  if(!o.flat)addFin(b,[[0,0],[-pc*.95,pc*.32],[-pc*1.1,0],[-pc*.75,-pc*.35],[0,-pc*.12]],{p:[X(u),y,z],r:[sd*.55,sd*-.45,-.35],c:f,fe,ref:[X(u),y,z],span:pc,w:x=>.25+fishW(x),rays:300});
  if(!o.flat&&!o.hammer&&o.H>.15){const u2=.58,pv=pc*.55;addFin(b,[[0,0],[-pv,-pv*.2],[-pv*.9,-pv*.85],[0,-pv*.2]],{p:[X(u2),BY(u2)+.01,sd*hw(u2)*.4],r:[sd*.25,0,0],c:f,fe,ref:[X(u2),BY(u2),0],span:pv,w:x=>fishW(x)})}});
 /* eyes: a white or coloured iris and a black pupil */
 const eye=(x,y,z,e,sd)=>{addG(b,new THREE.SphereGeometry(e,14,10),{p:[x,y,z],s:[1,1,.6],c:o.ec||'#f1ead0',w:fishW(x)});addG(b,new THREE.SphereGeometry(e*.62,12,8),{p:[x+e*.05,y,z+sd*e*.3],s:[1,1,.55],c:'#0b0f14',w:fishW(x)});addG(b,new THREE.SphereGeometry(e*.2,6,5),{p:[x+e*.22,y+e*.25,z+sd*e*.5],c:'#ffffff',w:fishW(x)})};
 if(o.hammer){const u=.965,x=X(u);addG(b,new THREE.SphereGeometry(1,20,10),{p:[x,yc(u)+hh(u)*.2,0],s:[.055,.026,.27],c:(x2,y2,z2,nx,ny)=>ny>0?C3(o.c[0]):C3(o.c[2]),w:0});[1,-1].forEach(sd=>eye(x,yc(u)+hh(u)*.2,sd*.265,o.e,sd))}
 else if(o.flat){[.86,.8].forEach((u,i)=>eye(X(u),yc(u)+(i?-.06:.05),hw(u)*.8,o.e,1))}
 else[1,-1].forEach(sd=>{const u=o.eu||.86;eye(X(u),yc(u)+hh(u)*.3,sd*hw(u)*.78,o.e,sd)});
 /* mouth */
 if(!o.hammer){const u=.985;addG(b,new THREE.BoxGeometry(.035,o.mouth?.012:.007,hw(.94)*1.6),{p:[X(u)-.01,yc(u)-hh(.93)*.28,0],c:'#3a1a18',w:0})}
 if(o.teeth)for(let q=0;q<5;q++)[1,-1].forEach(sd=>addG(b,new THREE.ConeGeometry(.004,.012,3),{p:[X(.94+q*.01),yc(.95)-hh(.95)*.15,sd*hw(.95)*.85],r:[Math.PI,0,0],c:'#ffffff',w:0}));
 if(o.bill){const L=o.bill,u=.995;addG(b,new THREE.ConeGeometry(hh(.97)*.45,L,10),{p:[X(u)+L/2,yc(u)+hh(.97)*.12,0],r:[0,0,-Math.PI/2],s:[1,1,.7],c:'#8da2b8',w:0})}
 if(o.whisk)[1,-1].forEach(sd=>{for(let q=0;q<2;q++)addG(b,new THREE.CylinderGeometry(.0035,.002,.11,4),{p:[X(.99)-.01,yc(.98)-hh(.95)*.4-.04,sd*(hw(.95)*.4+.012+q*.01)],r:[sd*.5,0,-.45-q*.3],c:'#fff6c8',w:.15})});
 if(o.lure){const u=.9;let px=X(u),py=TY(u);for(let q=0;q<6;q++){const a=.4+q*.35,L=.04,nx=px+Math.cos(a)*L,ny2=py+Math.sin(a)*L*1.2;addG(b,new THREE.CylinderGeometry(.004,.004,L*1.15,4),{p:[(px+nx)/2,(py+ny2)/2,0],r:[0,0,a-Math.PI/2],c:'#2b4a5c',w:0});px=nx;py=ny2}
  addG(b,new THREE.SphereGeometry(.026,12,8),{p:[px,py,0],c:'#bfffff',gl:1,w:0})}
 if(o.glow){for(let q=0;q<16;q++){const u=.12+q*.045,ny=-.55+(q%2)*.2;[1,-1].forEach(sd=>{const a=Math.asin(ny),p=P(u,a);addG(b,new THREE.SphereGeometry(.009,6,4),{p:[p[0],p[1],sd*Math.abs(p[2])*1.01],c:o.glow,gl:1,w:fishW(p[0])})})}}
 if(o.spikes){for(let q=0;q<o.spikes;q++){const u=.2+.62*hsh(q+1,21),a=hsh(q+5,23)*Math.PI*2,p=P(u,a),n=new THREE.Vector3(0,Math.sin(a)*W,Math.cos(a)*H).normalize();const sp=new THREE.ConeGeometry(.012,.05,5);
   const qq=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),n),eu=new THREE.Euler().setFromQuaternion(qq,'XYZ');addG(b,sp,{p:[p[0]+n.x*.02,p[1]+n.y*.02,p[2]+n.z*.02],r:[eu.x,eu.y,eu.z],c:'#efe0b0',w:fishW(p[0])})}}
}
/* the specials */
function buildCrab(b){const B='#2f6fb5',L2='#5aa0e0',O='#e8742c',CR='#f2e8d0';
 addG(b,new THREE.SphereGeometry(1,24,14),{p:[0,.1,0],s:[.26,.11,.42],c:(x,y,z,nx,ny)=>ny>.1?mixC(C3(B),C3(L2),hsh(Math.round(x*40)+Math.round(z*40)*7,1)*.35):C3(CR),w:0});
 [1,-1].forEach(sd=>{addG(b,new THREE.ConeGeometry(.035,.14,6),{p:[0,.1,sd*.47],r:[sd*Math.PI/2,0,0],c:B,w:0});
  for(let q=0;q<3;q++){const x=-.13+q*.09;addG(b,new THREE.CylinderGeometry(.02,.016,.19,6),{p:[x,.13,sd*.465],r:[sd*1.21,0,(q-1)*.25],c:B,w:1});addG(b,new THREE.SphereGeometry(.02,6,4),{p:[x,.163,sd*.55],c:B,w:1});addG(b,new THREE.CylinderGeometry(.016,.005,.21,6),{p:[x,.083,sd*.61],r:[sd*2.5,0,(q-1)*.25],c:L2,w:1})}
  addG(b,new THREE.SphereGeometry(1,10,6),{p:[-.22,.04,sd*.3],s:[.06,.015,.08],c:L2,w:1});
  addG(b,new THREE.CylinderGeometry(.03,.025,.22,8),{p:[.2,.1,sd*.28],r:[0,0,-1.1],c:B,w:.3});
  addG(b,new THREE.SphereGeometry(1,14,10),{p:[.35,.13,sd*.3],s:[.11,.065,.07],c:(x,y,z,nx,ny)=>x>.4?C3(O):C3(B),w:.4});
  addG(b,new THREE.ConeGeometry(.025,.12,6),{p:[.47,.16,sd*.3],r:[0,0,-1.4],c:O,w:.6});addG(b,new THREE.ConeGeometry(.022,.1,6),{p:[.46,.1,sd*.3],r:[0,0,-1.9],c:O,w:.6});
  addG(b,new THREE.CylinderGeometry(.009,.009,.08,5),{p:[.2,.2,sd*.08],r:[0,0,-.2],c:B,w:0});addG(b,new THREE.SphereGeometry(.022,8,6),{p:[.21,.245,sd*.08],c:'#0b0f14',w:0})})}
function buildSquid(b){const B='#e8a0a8',D='#b8606e';const spotc=(x,y,z)=>{const h=hsh(Math.round(x*60)*13+Math.round(y*60)*7+Math.round(z*60),4);return h>.8?C3(D):mixC(C3(B),C3('#f6c8cc'),h*.6)};
 const lp=[[0,0],[.035,.03],[.07,.09],[.095,.2],[.105,.33],[.1,.45],[.09,.52],[.06,.54]].map(q=>new THREE.Vector2(q[0],q[1]));
 addG(b,new THREE.LatheGeometry(lp,20),{p:[-.5,0,0],r:[0,0,-Math.PI/2],c:spotc,w:0});
 [1,-1].forEach(sd=>addFin(b,[[0,0],[.16,0],[.02,.11]],{p:[-.5,0,0],r:[sd*Math.PI/2,0,0],c:B,fe:'#ffe0e4',ref:[-.45,0,0],span:.12,w:.4}));
 addG(b,new THREE.SphereGeometry(.075,14,10),{p:[.1,0,0],s:[1.2,.9,1],c:B,w:0});
 [1,-1].forEach(sd=>{addG(b,new THREE.SphereGeometry(.036,12,8),{p:[.11,.01,sd*.06],c:'#f6f0e0',w:0});addG(b,new THREE.SphereGeometry(.024,10,6),{p:[.12,.012,sd*.08],c:'#101418',w:0})});
 for(let q=0;q<8;q++){const a=q/8*Math.PI*2,r=.035;addG(b,new THREE.CylinderGeometry(.006,.016,.26,6),{p:[.3,Math.sin(a)*r,Math.cos(a)*r],r:[0,0,-Math.PI/2+Math.sin(a)*.12],c:spotc,w:x=>clamp((x-.15)/.3,0,1.2)})}
 [1,-1].forEach(sd=>{addG(b,new THREE.CylinderGeometry(.004,.006,.38,5),{p:[.36,0,sd*.015],r:[0,0,-Math.PI/2],c:D,w:x=>clamp((x-.15)/.3,0,1.4)});addG(b,new THREE.SphereGeometry(.014,6,4),{p:[.55,0,sd*.015],s:[1.8,1,1],c:D,w:1.4})})}
function buildRay(b){const B=C3('#2a4866'),B2=C3('#3e6488'),V=C3('#e4ecf2'),W2=C3('#eef4fa'),N=46,M=34,pos=[],col=[],idx=[];
 const span=u=>.5*Math.pow(Math.max(0,1-Math.abs(u-.42)/(u<.42?.42:.58)),.85)+.03*Math.sin(Math.PI*u),th=u=>.05*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.05)),.6)+.004;
 const spots=[];for(let k=0;k<26;k++){const u=.15+.6*hsh(k,50),z=(hsh(k,51)*2-1)*span(u)*.8;spots.push([u-.5,z])}
 for(let i=0;i<N;i++){const u=i/(N-1)*.99+.005;for(let j=0;j<M;j++){const a=-Math.PI/2+j/M*Math.PI*2,ny=Math.sin(a),nz=Math.cos(a),x=u-.5,y=th(u)*ny*(1-.7*Math.pow(Math.abs(nz),3)),z=span(u)*nz;pos.push(x,y,z);
  let c=ny>0?mixC(B,B2,.5+.5*Math.sin(x*14+z*9)):V.clone();if(ny>0)for(const sp of spots){const d=Math.hypot(x-sp[0],z-sp[1]);if(d<.028)c=mixC(c,W2,ss(.028,.016,d))}col.push(c.r,c.g,c.b)}}
 for(let i=0;i<N-1;i++)for(let j=0;j<M;j++){const a=i*M+j,b2=i*M+(j+1)%M,c=(i+1)*M+j,d=(i+1)*M+(j+1)%M;idx.push(a,c,b2,b2,c,d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 addG(b,g,{w:(x,y,z)=>Math.pow(Math.abs(z)/.5,1.3)});
 addG(b,new THREE.ConeGeometry(.012,.7,6),{p:[-.84,0,0],r:[0,0,Math.PI/2],c:'#203448',w:.1});
 [1,-1].forEach(sd=>{addG(b,new THREE.SphereGeometry(.018,8,6),{p:[.4,.02,sd*.045],c:'#f2ead0',w:0});addG(b,new THREE.SphereGeometry(.011,6,4),{p:[.405,.028,sd*.055],c:'#0b0f14',w:0});
  addFin(b,[[0,0],[.07,0],[.03,.04]],{p:[.45,-.005,sd*.025],r:[Math.PI/2,0,0],c:'#2a4866',span:.06,w:0})})}
function buildBoot(b){const BR='#6a4426',BD='#3a2618',SO='#2a1c14';
 addG(b,new THREE.BoxGeometry(.62,.08,.24),{p:[.05,-.27,0],c:SO,w:0});addG(b,new THREE.SphereGeometry(1,18,12),{p:[.17,-.15,0],s:[.22,.13,.12],c:BR,w:0});
 addG(b,new THREE.CylinderGeometry(.13,.14,.48,16),{p:[-.12,.02,0],c:(x,y)=>y>.2?C3(BD):C3(BR),w:0});addG(b,new THREE.CylinderGeometry(.14,.14,.05,16),{p:[-.12,.27,0],c:BD,w:0});
 for(let q=0;q<4;q++)addG(b,new THREE.BoxGeometry(.03,.012,.2),{p:[.02+q*.05,-.06+q*.035*0+(-q*.02),0],r:[0,0,.6],c:'#e8dcc0',w:0});
 for(let q=0;q<4;q++)addG(b,new THREE.CylinderGeometry(.006,.003,.22,4),{p:[-.2+q*.04,.38,.05*(q%2?1:-1)],r:[.3*(q%2?1:-1),0,.5-q*.3],c:'#3a8a3a',w:.6})}
function buildCan(b){const rust=(x,y,z)=>{const a=Math.atan2(z,x),n=.5+.25*Math.sin(a*3+y*9)+.25*Math.sin(a*5-y*13);let c;if(y>.215||y<-.215)c=C3('#c8ccd0');else if(Math.abs(y)<.1)c=Math.abs(y-.025*Math.sin(a*2))<.025?C3('#c8442c'):C3('#efe4c8');else c=C3('#b8382a');return n>.78?mixC(c,C3('#7a4422'),ss(.78,.9,n)):c};
 addG(b,new THREE.CylinderGeometry(.16,.16,.48,22,6),{c:rust,w:0});addG(b,new THREE.CylinderGeometry(.14,.16,.03,22),{p:[0,.255,0],c:'#9aa0a8',w:0});addG(b,new THREE.BoxGeometry(.06,.01,.03),{p:[.05,.272,0],c:'#cfd4da',w:0})}
function buildWeed(b){const C=['#2f7a3a','#3f9a4a','#5cb860','#4a8a2a'];for(let q=0;q<9;q++){const L=.5+hsh(q,30)*.45,g=new THREE.PlaneGeometry(.06,L,1,10),pp=g.attributes.position;for(let i=0;i<pp.count;i++){const y=pp.getY(i);pp.setX(i,pp.getX(i)+Math.sin(y*9+q)*.04);pp.setZ(i,Math.sin(y*6+q*2)*.05)}g.computeVertexNormals();
  addG(b,g,{p:[-.1-L/2+.1,(q-4)*.02,(q%3-1)*.05],r:[q*.4,0,Math.PI/2+(q-4)*.12],c:C[q%4],w:x=>clamp((.1-x)/.8,0,1.3)})}
 for(let q=0;q<5;q++)addG(b,new THREE.SphereGeometry(.025,6,4),{p:[-.2-q*.12,(q%2)*.06-.03,0],c:'#d8b84a',w:.4})}
function buildDuck(b){const Y='#ffd23a',Y2='#f2b81c';addG(b,new THREE.SphereGeometry(1,20,14),{p:[-.05,-.05,0],s:[.3,.2,.22],c:Y,w:0});addG(b,new THREE.SphereGeometry(.15,18,12),{p:[.17,.2,0],c:Y,w:0});
 addG(b,new THREE.ConeGeometry(.05,.14,10),{p:[.36,.18,0],r:[0,0,-Math.PI/2],s:[1,1,.6],c:'#f08a20',w:0});addG(b,new THREE.ConeGeometry(.06,.14,8),{p:[-.34,.06,0],r:[0,0,1.1],c:Y2,w:0});
 [1,-1].forEach(sd=>{addG(b,new THREE.SphereGeometry(.025,8,6),{p:[.27,.25,sd*.09],c:'#111111',w:0});addG(b,new THREE.SphereGeometry(1,12,8),{p:[-.07,0,sd*.2],s:[.17,.09,.04],c:Y2,w:0})})}
function buildBottle(b){const lp=[[0,-.36],[.14,-.36],[.15,-.33],[.15,.08],[.12,.16],[.06,.22],[.05,.36],[.058,.38],[0,.38]].map(q=>new THREE.Vector2(q[0],q[1]));
 addG(b,new THREE.LatheGeometry(lp,22),{r:[0,0,-Math.PI/2],c:(x,y,z)=>{const h=y>0&&Math.abs(z)<.05?.25:0;return mixC(C3('#3aa48a'),C3('#c8fff0'),h+.1*hsh(Math.round(x*40),33))},w:0});
 addG(b,new THREE.CylinderGeometry(.045,.04,.09,10),{p:[.42,0,0],r:[0,0,-Math.PI/2],c:'#8a5a2c',w:0});addG(b,new THREE.CylinderGeometry(.075,.075,.22,12),{p:[-.08,0,0],r:[0,0,-Math.PI/2],c:'#f4ead0',w:0});
 addG(b,new THREE.TorusGeometry(.056,.008,5,14),{p:[.3,0,0],r:[0,Math.PI/2,0],c:'#c8a878',w:0})}
function buildChest(b){const W='#8a5a2c',W2='#9a6a36',G2='#e6b422';const wood=(x,y,z)=>C3(Math.floor((y+.2)*16)%2?W:W2).multiplyScalar(.92+.12*hsh(Math.round(x*30)+Math.round(y*16)*5,40));
 addG(b,new THREE.BoxGeometry(.62,.3,.4),{p:[0,-.08,0],c:wood,w:0});addG(b,new THREE.CylinderGeometry(.2,.2,.62,16,1,false,0,Math.PI),{p:[0,.07,0],r:[0,0,Math.PI/2],s:[1,.7,1],c:(x,y,z)=>C3(W).multiplyScalar(.9+.15*hsh(Math.round(z*20),41)),w:0});
 [-.26,0,.26].forEach(x=>{addG(b,new THREE.BoxGeometry(.04,.32,.42),{p:[x,-.08,0],c:G2,w:0});addG(b,new THREE.CylinderGeometry(.21,.21,.04,16,1,false,0,Math.PI),{p:[x,.07,0],r:[0,0,Math.PI/2],s:[1,.7,1],c:G2,w:0})});
 addG(b,new THREE.BoxGeometry(.08,.1,.03),{p:[0,.02,.21],c:G2,w:0});addG(b,new THREE.BoxGeometry(.025,.035,.01),{p:[0,.01,.227],c:'#3a2a10',w:0});
 for(let q=0;q<7;q++)addG(b,new THREE.CylinderGeometry(.035,.035,.01,10),{p:[-.2+q*.065,.08+(q%3)*.01,.22],r:[1.2,0,q*.3],c:'#f4d85a',w:0});
 for(let q=0;q<9;q++)addG(b,new THREE.SphereGeometry(.018+hsh(q,42)*.012,6,4),{p:[-.3+hsh(q,43)*.6,-.22+hsh(q,44)*.25,(hsh(q,45)>.5?1:-1)*.205],c:'#e8e4d8',w:0})}
const GEO={};
function geoOf(id){if(GEO[id])return GEO[id];const o=FM[id]||FM.weed,b=MB();
 try{if(o.kind=='crab')buildCrab(b);else if(o.kind=='squid')buildSquid(b);else if(o.kind=='ray')buildRay(b);else if(o.kind=='boot')buildBoot(b);else if(o.kind=='can')buildCan(b);else if(o.kind=='weed')buildWeed(b);
  else if(o.kind=='duck')buildDuck(b);else if(o.kind=='bottle')buildBottle(b);else if(o.kind=='chest')buildChest(b);else buildFishBody(b,o)}catch(e){soft(e,'geo '+id)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
 g.setAttribute('aSw',new THREE.Float32BufferAttribute(b.w,1));g.setAttribute('aGl',new THREE.Float32BufferAttribute(b.g,1));
 g.computeBoundingBox();const bb=g.boundingBox,cx=(bb.min.x+bb.max.x)/2,cy=(bb.min.y+bb.max.y)/2,cz=(bb.min.z+bb.max.z)/2,L=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z,bb.max.y-bb.min.y)||1;
 g.translate(-cx,-cy,-cz);g.scale(1/L,1/L,1/L);g.computeBoundingBox();g.computeBoundingSphere();g.userData.fish=1;return GEO[id]=g}
const FVS='attribute float aSw;attribute float aGl;uniform float uT;uniform float uA;uniform float uK;uniform float uM;varying float vGl;\n';
function fishMat(id){const o=FM[id]||{},m=new THREE.MeshPhongMaterial({vertexColors:true,shininess:o.sh||55,specular:C3(o.spc||'#3c3c3c'),side:THREE.DoubleSide});
 m.userData.U={uT:{value:0},uA:{value:.06},uK:{value:o.k||5},uM:{value:o.m!=null?o.m:o.kind=='crab'?2:0}};m.userData.xms=1;
 m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,this.userData.U);
  sh.vertexShader=FVS+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGl=aGl;{float ph=uT-(uM<.5?position.x:(uM<1.5?abs(position.z):position.x*3.+position.z*2.))*uK;float of=aSw*uA*sin(ph);if(uM<.5)transformed.z+=of;else transformed.y+=of;}');
  sh.fragmentShader='varying float vGl;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb=mix(gl_FragColor.rgb,vColor*1.3+.2,vGl);')};
 return m}
/* a 3D catch: one mesh, its own material (the swim uniforms), the shared geometry; len = metres along its longest side */
function fish3(id,len){const m=new THREE.Mesh(geoOf(id),fishMat(id));m.scale.setScalar(len||1);m.userData.fid=id;m.userData.ph=Math.random()*9;m.frustumCulled=false;return m}
/* t = seconds, amp = how hard it swims (0 still, .06 calm, .14 fighting, .22 flopping) */
function swim(m,t,amp,fr){if(!m||!m.material||!m.material.userData.U)return;const U=m.material.userData.U,o=FM[m.userData.fid]||{};U.uT.value=(t+m.userData.ph)*(fr||o.fl||6.5);U.uA.value=amp==null?.06:amp}
function disposeM(m){if(!m)return;try{if(m.parent)m.parent.remove(m);m.material.dispose()}catch(e){}}
/* ---------- the icon renderer: one small offscreen WebGL canvas that draws a model for the card, the journal and the reel game ---------- */
let IR=null;const ICON={};
function irInit(){if(IR!==null)return IR;try{const cv=document.createElement('canvas');cv.width=320;cv.height=200;
 const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});r.setPixelRatio(1);r.setClearColor(0x000000,0);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xe8f6ff,0x3a5068,.9));const d=new THREE.DirectionalLight(0xffffff,.8);d.position.set(1.2,3,4);sc.add(d);const d2=new THREE.DirectionalLight(0x9fe8ff,.45);d2.position.set(-3,1.5,-2);sc.add(d2);
 const cm=new THREE.PerspectiveCamera(26,1.6,.05,50);const piv=new THREE.Group();sc.add(piv);IR={r,cv,sc,cm,piv,m:{},w:0,h:0};
 cv.addEventListener('webglcontextlost',e=>{e.preventDefault();IR=false})}catch(e){soft(e,'icon');IR=false}return IR}
/* draws model id into the offscreen canvas at w x h and returns it; o: t (seconds), amp, ry (turn), rx (tilt), fit (share of the frame) */
function irDraw(id,w,h,o){const I=irInit();if(!I)return null;o=o||{};if(I.w!==w||I.h!==h){I.r.setSize(w,h,false);I.w=w;I.h=h}
 let m=I.m[id];if(!m){m=I.m[id]=fish3(id,1);m.userData.ph=0}I.piv.children.slice().forEach(c=>I.piv.remove(c));I.piv.add(m);
 swim(m,o.t||0,o.amp==null?.05:o.amp);const v=(FM[id]||{}).view||[.06,-.32,0];
 m.rotation.set(o.rx!=null?o.rx:v[0],o.ry!=null?o.ry:v[1],o.rz!=null?o.rz:v[2]||0);m.position.set(0,0,0);m.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(m),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3());m.position.sub(ct);
 const asp=w/h,fov=I.cm.fov*Math.PI/180,fit=o.fit||.86,dh=sz.y/(fit*2*Math.tan(fov/2)),dw=sz.x/(fit*2*Math.tan(fov/2)*asp),dist=Math.max(dh,dw)+sz.z/2;
 I.cm.aspect=asp;I.cm.position.set(0,dist*.12,dist);I.cm.lookAt(0,0,0);I.cm.updateProjectionMatrix();
 try{I.r.render(I.sc,I.cm)}catch(e){soft(e,'irDraw');return null}return I.cv}
/* draws a model onto a 2D canvas: sil = a dark shape (fish you have not met), glow = a coloured halo */
function drawFishTo(cv,id,o){o=o||{};const x=cv.getContext('2d'),W=cv.width,H=cv.height,src=irDraw(id,W,H,o);x.clearRect(0,0,W,H);if(!src){const a=artCanvas(id,Math.max(1,Math.floor(W/artOf(id).gw)),!!o.sil);x.drawImage(a,(W-a.width)/2,(H-a.height)/2);return false}
 if(o.sil){x.save();x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=o.silC||'#0f1d26';x.fillRect(0,0,W,H);x.restore();if(o.glow){x.save();x.globalCompositeOperation='destination-over';x.shadowColor=o.glow;x.shadowBlur=W*.05;x.drawImage(cv,0,0);x.restore()}}
 else{if(o.glow){x.save();x.shadowColor=o.glow;x.shadowBlur=W*.06;x.drawImage(src,0,0);x.restore()}x.drawImage(src,0,0)}return true}
/* a cached picture of a model as an <img> (journal, shop) */
function fishImg(id,w,h,sil){const k=id+'|'+w+'|'+h+'|'+(sil?1:0),im=new Image();im.width=w;im.height=h;im.className='f3';im.alt='';
 if(!ICON[k]){const cv=document.createElement('canvas');cv.width=w*2;cv.height=h*2;drawFishTo(cv,id,{sil,t:0,amp:0,fit:.9});ICON[k]=cv.toDataURL()}im.src=ICON[k];return im}
/* the 3D model of a catch (v55.29.0: the smooth model, not the extruded pixel art), scaled to a longest side of `len` metres */
function modelMesh(id,len){return fish3(id,len)}

/* ---------- the fishing board and the speech bubbles ---------- */
let boardKey='';
function drawBoard(){const sg=ANIM.board;if(!sg)return;const o=st(),c=sg.c,W=sg.cv.width,H=sg.cv.height,m0=(()=>{try{return festMins()}catch(e){return 720}})(),e=env();
 boardKey=[dayNo(),wxNow(),o.sold,Object.keys(o.caught).length,o.rec.w].join('|');
 frame(c,W,H,'#f4ead0','#5a3a22',8);c.textBaseline='middle';c.textAlign='center';c.fillStyle='#17323a';c.font='bold '+Math.round(H*.085)+'px '+FONT;c.fillText('FISHING BOARD',W/2,H*.075);
 c.fillStyle='#d94a33';c.fillRect(W*.06,H*.135,W*.88,H*.012);c.textAlign='left';c.font='bold '+Math.round(H*.052)+'px '+FONT;c.fillStyle='#17323a';
 c.fillText('DAY '+dayNo()+'  '+WXN[e.wx].toUpperCase(),W*.06,H*.19);c.fillStyle='#2a7a74';c.fillText(TIDEN[e.tide].toUpperCase(),W*.6,H*.19);
 c.fillStyle='#17323a';c.font='bold '+Math.round(H*.046)+'px '+FONT;c.fillText("TODAY'S TIDE",W*.06,H*.265);
 const tl=tideList(dayNo()).slice(0,4);tl.forEach((q,i)=>{const x=W*(.06+i*.225),past=q[0]<m0;c.fillStyle=past?'#9a9a90':q[1]=='High'?'#2a7a74':'#8a5a2a';c.font='bold '+Math.round(H*.042)+'px '+FONT;c.fillText(q[1].toUpperCase(),x,H*.325);c.font=Math.round(H*.05)+'px '+FONT;c.fillText(clk(q[0]),x,H*.385)});
 c.fillStyle='#17323a';c.font='bold '+Math.round(H*.046)+'px '+FONT;const hs=SPI[e.hot];c.fillText('BITING WELL:',W*.06,H*.465);c.fillStyle='#d94a33';c.fillText(hs.n.toUpperCase(),W*.38,H*.465);
 c.fillStyle='#17323a';c.fillText('LOCAL RECORDS',W*.06,H*.545);c.fillRect(W*.06,H*.575,W*.88,H*.008);
 const rows=SP.filter(s=>o.caught[s.id]&&o.caught[s.id].best).sort((a,b)=>o.caught[b.id].best-o.caught[a.id].best).slice(0,4);
 c.font=Math.round(H*.045)+'px '+FONT;if(!rows.length){c.fillStyle='#8a8a80';c.fillText('Nobody has caught anything yet.',W*.06,H*.64);c.fillText('Be the first on the board!',W*.06,H*.7)}
 rows.forEach((s,i)=>{const y=H*(.635+i*.065);c.fillStyle=RARC[s.r]=='#ffd23d'?'#b8860b':'#17323a';c.textAlign='left';c.fillText(s.n,W*.06,y);c.textAlign='right';c.fillText(fmtW(o.caught[s.id].best),W*.94,y)});
 c.textAlign='center';c.fillStyle='#2a7a74';c.font=Math.round(H*.04)+'px '+FONT;c.fillText('Fish found '+Object.keys(o.caught).filter(k=>SPI[k]&&SPI[k].k=='f').length+' of '+NFISH+'   ·   J = journal',W/2,H*.945);
 sg.t.needsUpdate=true}
/* a speech bubble over an NPC head, one sprite each, drawn only while it speaks */
function bubbleTick(){NPC.forEach(n=>{if(!n.bub){if(n.spr)n.spr.visible=false;return}
 if(!n.spr){const cv=document.createElement('canvas');cv.width=256;cv.height=72;const t=new THREE.CanvasTexture(cv);n.sc=cv;n.spr=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,fog:false}));n.spr.scale.set(2.6,.73,1);n.spr.renderOrder=12;n.f.g.add(n.spr);n.spr.position.set(0,2.55,0)}
 if(n.btxt!==n.bub.t){n.btxt=n.bub.t;const c=n.sc.getContext('2d');c.clearRect(0,0,256,72);c.fillStyle='rgba(255,255,255,.95)';c.strokeStyle='#1d2a33';c.lineWidth=4;c.beginPath();c.roundRect?c.roundRect(4,4,248,50,12):c.rect(4,4,248,50);c.fill();c.stroke();c.fillStyle='#1d2a33';c.font='bold 20px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(n.bub.t,128,30);c.beginPath();c.moveTo(118,54);c.lineTo(128,68);c.lineTo(138,54);c.fill();n.spr.material.map.needsUpdate=true}
 n.spr.visible=true})}

/* ---------- the session ---------- */
const cam3=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.15,2600);
let G=null,hud=null,fhCSS=null;
const GK={};let GKd={};const MOUSE={x:innerWidth/2,y:innerHeight/2,has:false};
const water=(u)=>baseY(u);
const wU=(x,z)=>uAt(x-FX,z-ZE);/* u of a world point */
const wY=(x,z)=>baseY(Math.max(0,wU(x,z)));
const _tip=new THREE.Vector3(),_a=new THREE.Vector3(),_b=new THREE.Vector3();
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(c===cam&&G&&G.on){cam3.aspect=innerWidth/innerHeight;cam3.updateProjectionMatrix();try{poseFrame()}catch(e){soft(e,'pose')}const sc0=sun.castShadow;sun.castShadow=false;try{return r0(sc,cam3)}finally{sun.castShadow=sc0}}return r0(sc,c)}}
/* a wrapped weather tick: the world only shows the weather in 'play', so while fishing it believes it is 'play' */
if(typeof wxTick=='function'){const x0=wxTick;wxTick=function(dt){if(G&&G.on&&mode=='fish'){const m=mode;mode='play';try{return x0.apply(this,arguments)}finally{mode=m}}return x0.apply(this,arguments)}}

/* particles (one instanced mesh of small boxes) and ripples (a pool of flat rings) */
const PN=150;let PART=null,RIP=null;
function partsOn(){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92}),PN);im.frustumCulled=false;im.renderOrder=5;
 const pt=[];for(let i=0;i<PN;i++){pt.push({l:0,m:1,x:0,y:0,z:0,vx:0,vy:0,vz:0,s:.1,g:9,c:new THREE.Color(1,1,1)});im.setColorAt(i,pt[i].c)}scene.add(im);PART={im,pt,n:0,m4:new THREE.Matrix4(),q:new THREE.Quaternion(),v:new THREE.Vector3(),sc:new THREE.Vector3()}}
function partsOff(){if(!PART)return;scene.remove(PART.im);PART.im.geometry.dispose();PART.im.material.dispose();PART.im.dispose();PART=null}
function spray(x,y,z,n,o){if(!PART)return;o=o||{};for(let k=0;k<n;k++){const p=PART.pt[PART.n=(PART.n+1)%PN],a=rr(0,6.283),sp=rr(.3,1)*(o.sp||1.6);p.x=x+rr(-1,1)*(o.r||.12);p.y=y+rr(0,.1);p.z=z+rr(-1,1)*(o.r||.12);p.vx=Math.cos(a)*sp;p.vz=Math.sin(a)*sp;p.vy=(o.vy||2.6)*rr(.5,1.2);p.s=(o.size||.09)*rr(.7,1.3);p.l=p.m=(o.life||.8)*rr(.7,1.2);p.g=o.g==null?9:o.g;p.c.set(o.c||'#ffffff')}}
function partsTick(dt){if(!PART)return;const im=PART.im,{m4,q,v,sc}=PART;
 for(let i=0;i<PN;i++){const p=PART.pt[i];if(p.l>0){p.l-=dt;p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<-.38&&p.g>0){p.y=-.38;p.vy=0;p.vx*=.3;p.vz*=.3;p.l=Math.min(p.l,.12)}}
  const k=p.l>0?Math.min(1,p.l/p.m*2.2)*p.s:0;v.set(p.x,p.y,p.z);sc.set(k,k,k);m4.compose(v,q,sc);im.setMatrixAt(i,m4);im.setColorAt(i,p.c)}
 im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}
function ripOn(){const geo=new THREE.RingGeometry(.86,1,28);geo.rotateX(-Math.PI/2);const a=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.visible=false;m.renderOrder=4;scene.add(m);a.push({m,t:0,l:0,s0:.2,s1:1,op:.6})}RIP={a,n:0,geo}}
function ripOff(){if(!RIP)return;RIP.a.forEach(r=>{scene.remove(r.m);r.m.material.dispose()});RIP.geo.dispose();RIP=null}
function ripple(x,z,size,op,dur){if(!RIP)return;const r=RIP.a[RIP.n=(RIP.n+1)%RIP.a.length];r.t=0;r.l=dur||1.6;r.s0=.1;r.s1=size||1;r.op=op==null?.6:op;r.m.position.set(x,wY(x,z)+.02,z);r.m.visible=true}
function ripTick(dt){if(!RIP)return;RIP.a.forEach(r=>{if(r.l<=0)return;r.t+=dt;const k=r.t/r.l;if(k>=1){r.l=0;r.m.visible=false;return}const s=lerp(r.s0,r.s1,1-Math.pow(1-k,2));r.m.scale.set(s,1,s);r.m.material.opacity=r.op*(1-k)*Math.min(1,k*8)})}

/* ---------- start / stop ---------- */
const keyName=e=>{const k=(e.key||'').toLowerCase();return k==' '||k=='spacebar'?' ':k};
function baitNow(){const o=st();if(o.bait!='worm'&&(o.baits[o.bait]|0)<=0)o.bait='worm';return o.bait}
function startSession(i){if(G||away()||mode!='play'&&mode!='menu')return;const o=st(),sp=SPOTS[i];if(!sp||!BUILT)return;
 try{closeUI()}catch(e){}
 o.sessions++;baitNow();
 G={on:1,paused:0,i,sp:{x:sp.x,z:sp.z,wx:sp.wx,wz:sp.wz,y:sp.y,h:sp.h,n:sp.n,s:sp.s},st:'aim',stT:0,t:0,fade:1,fadeT:0,aim:0,yaw:sp.h,pw:0,pwD:1,hold:false,needRel:true,mouseAim:false,
  land:null,castD:0,lure:new THREE.Vector3(),pose:{pitch:.7,ar:-.5,al:-.35,bend:0},cam:{p:new THREE.Vector3(),l:new THREE.Vector3(),fov:58,init:0},shake:0,msgT:0,catches:0,sess:{n:0,cash:0,best:null,mast:0},
  keep:null,card:null,hidden:[],w:null,R:null,late:0,fr:null,fsp:null,pressed:0,pressW:0,pressS:0,pressQ:0,pressE:0,lastTouch:0,bite:0,perfect:false,dips:0};
 mode='fish';try{$('hud').style.display='none'}catch(e){}document.body.classList.add('fston');
 try{FOL.forEach(f=>{G.hidden.push([f,f.m.visible]);f.m.visible=false})}catch(e){}
 try{if(P.mesh){P.mesh.visible=true;G.sh=P.mesh.children[0]&&P.mesh.children[0].visible;if(P.mesh.children[0])P.mesh.children[0].visible=false}}catch(e){}
 P.x=sp.wx;P.z=sp.wz;SY=sp.y;
 buildGear();partsOn();ripOn();
 const sf=scene.fog;G.fog=sf&&sf.near!=null?[sf.near,sf.far,sf.color.clone()]:null;if(sf&&sf.near!=null){sf.near=300;sf.far=1500;const bg=scene.background;if(bg&&bg.isColor)sf.color.copy(bg)}
 hudOn();camSnap();msg(o.sessions==1?'Welcome to the pier. Hold to cast.':'Hold to cast',2.4);if(o.sessions==1)G.tut=1;
 try{document.getElementById('c').focus()}catch(e){}}
function buildGear(){const g=G,o=st(),r=RODS[o.rod];g.rod=makeRod(r.col,r.len,5);P.mesh.add(g.rod.g);g.line=lineMesh(20);scene.add(g.line);g.bob=bobberMesh();g.bob.scale.setScalar(1.7);g.bob.visible=false;scene.add(g.bob);
 const gc=document.createElement('canvas');gc.width=gc.height=32;const x=gc.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(127,243,255,1)');gr.addColorStop(1,'rgba(127,243,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
 g.bobGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gc),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,fog:false}));g.bobGlow.scale.set(.9,.9,1);g.bob.add(g.bobGlow);g.bobGlow.position.y=.2;
 {const sc=document.createElement('canvas');sc.width=sc.height=64;const x=sc.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(6,32,42,.95)');gr.addColorStop(.55,'rgba(6,32,42,.55)');gr.addColorStop(1,'rgba(6,32,42,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
  const pg=new THREE.PlaneGeometry(1,1);pg.rotateX(-Math.PI/2);g.shadow=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));g.shadow.visible=false;g.shadow.renderOrder=3;scene.add(g.shadow)}
 const ring=new THREE.RingGeometry(.8,1,32);ring.rotateX(-Math.PI/2);g.ring=new THREE.Mesh(ring,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));g.ring.renderOrder=4;g.ring.visible=false;scene.add(g.ring);
 g.dots=[];const dg=new THREE.BoxGeometry(.09,.09,.09),dm=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75});g.dotG=dg;g.dotM=dm;for(let i=0;i<14;i++){const m=new THREE.Mesh(dg,dm);m.visible=false;scene.add(m);g.dots.push(m)}
 g.fishM=null}
function disposeGear(g){try{P.mesh.remove(g.rod.g);g.rod.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}catch(e){soft(e,'dispRod')}
 try{scene.remove(g.line);g.line.geometry.dispose();g.line.material.dispose();scene.remove(g.bob);g.bob.geometry.dispose();g.bob.material.dispose();g.bobGlow.material.map.dispose();g.bobGlow.material.dispose();scene.remove(g.shadow);g.shadow.geometry.dispose();g.shadow.material.dispose();
  scene.remove(g.ring);g.ring.geometry.dispose();g.ring.material.dispose();g.dots.forEach(m=>scene.remove(m));g.dotG.dispose();g.dotM.dispose();dropFish(g);disposeM(g.fishF);g.fishF=null;g.shadow.material.map.dispose()}catch(e){soft(e,'dispose')}}
function dropFish(g){if(g.fishM){disposeM(g.fishM);g.fishM=null}}
function exitSession(){const g=G;if(!g)return;G=null;
 mode='play';try{$('hud').style.display=''}catch(e){}document.body.classList.remove('fston');
 try{g.hidden.forEach(a=>{a[0].m.visible=a[1]})}catch(e){}
 try{if(P.mesh){if(P.mesh.children[0])P.mesh.children[0].visible=g.sh!==false;P.mesh.rotation.set(0,0,0);P.mesh.quaternion.identity();P.arms[0].rotation.set(0,0,0);P.arms[1].rotation.set(0,0,0);P.legs[0].rotation.set(0,0,0);P.legs[1].rotation.set(0,0,0)}}catch(e){}
 disposeGear(g);partsOff();ripOff();hudOff();
 try{const sf=scene.fog;if(g.fog&&sf){sf.near=g.fog[0];sf.far=g.fog[1];sf.color.copy(g.fog[2])}}catch(e){}
 for(const k in GK)delete GK[k];GKd={};
 P.x=g.sp.wx;P.z=g.sp.wz;P.rot=g.sp.h;SY=g.sp.y;
 sv()}
const mast=(pts,why)=>{try{if(typeof FW_MASTERY!='undefined'&&FW_MASTERY.add){const r=FW_MASTERY.add('fish',clamp(pts,0,40),why);if(G)G.sess.mast+=+r||0;return+r||0}}catch(e){soft(e,'mast')}return 0};
function msg(t,sec,cls){if(!G)return;G.msgT=sec||1.8;G.msgS=t;G.msgC=cls||'';const e=$f('fh_msg');if(e){e.textContent=t;e.className=cls||'';e.style.opacity=1;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}}

/* ---------- input: capture phase, so the game's own keys do not fire while you fish ---------- */
const guard=()=>G&&G.on;
addEventListener('keydown',e=>{if(!guard())return;if(e.ctrlKey||e.metaKey||/^f\d+$/i.test(e.key||''))return;const k=keyName(e);e.stopImmediatePropagation();
 if(JO){if(k=='escape'||k=='j'){e.preventDefault();if(!e.repeat)closeJournal()}return}
 if(k=='escape'){e.preventDefault();if(!e.repeat)pauseCard();return}
 if(G.paused){if(k=='enter'&&!e.repeat)resumeCard();return}
 if(k==' '||k.startsWith('arrow')||k=='tab')e.preventDefault();
 if(!e.repeat){GKd[k]=1;if(k==' '||k=='enter'){G.hold=true;G.pressed=1}if(k=='w'||k=='arrowup')G.pressW=1;if(k=='s'||k=='arrowdown')G.pressS=1;if(k=='q')G.pressQ=1;if(k=='e')G.pressE=1;if(k=='r')G.pressR=1;if(k=='j')openJournal(1)}
 GK[k]=1},true);
addEventListener('keyup',e=>{const k=keyName(e);if(!guard()&&!GK[k])return;delete GK[k];if(k==' '||k=='enter'){if(G)G.hold=false;if(G)G.rel=1}if(guard())e.stopImmediatePropagation()},true);
addEventListener('blur',()=>{for(const k in GK)delete GK[k];if(G){G.hold=false;if(G.on&&!G.paused&&G.st!='card')pauseCard()}});
addEventListener('contextmenu',e=>{if(guard())e.preventDefault()},true);
addEventListener('pointerdown',e=>{if(!guard()||G.paused||JO)return;if(e.target&&e.target.closest&&e.target.closest('#fishhud button, #fishjrn'))return;MOUSE.x=e.clientX;MOUSE.y=e.clientY;MOUSE.has=true;if(e.button==2){G.pressS=1;return}if(e.button!=0)return;G.hold=true;G.pressed=1;e.preventDefault()},true);
addEventListener('pointerup',e=>{if(!guard())return;if(e.button==0){G.hold=false;G.rel=1}},true);
addEventListener('pointermove',e=>{if(!guard())return;const dx=Math.abs(e.clientX-MOUSE.x);MOUSE.x=e.clientX;MOUSE.y=e.clientY;if(dx>1.5||!MOUSE.has){MOUSE.has=true;if(G)G.mouseAim=true}},true);
const KL=()=>!!(GK.a||GK.arrowleft),KR=()=>!!(GK.d||GK.arrowright);

/* ---------- the numbers behind a cast ---------- */
function aimLand(pw){const g=G,r=RODS[st().rod],d=3+(r.reach-3)*Math.pow(pw,.9),x=g.sp.wx+Math.sin(g.yaw)*d,z=g.sp.wz+Math.cos(g.yaw)*d;return{x,z,d,u:wU(x,z)}}
function tipWorld(out){const g=G;g.rod.g.updateMatrixWorld(true);g.rod.tip.getWorldPosition(out);return out}
function spend(){const o=st();if(o.bait!='worm'){o.baits[o.bait]=Math.max(0,(o.baits[o.bait]|0)-1);if(!o.baits[o.bait]){const n=BAITS[o.bait].n;o.bait='worm';msg('Out of '+n.toLowerCase()+'. Back to worms.',2.2)}}}
function doCast(){const g=G,o=st(),pw=g.pw,L=aimLand(pw);g.pw0=pw;
 if(pw<.1){g.st='aim';g.needRel=false;return}
 if(L.u<1.2){spl('err');msg('That lands on the sand',1.4,'bad');g.st='aim';g.needRel=false;return}
 g.land=L;g.castD=L.d;g.perfect=pw>=.9;g.st='cast';g.stT=0;g.flying=false;g.cDur=.6+L.d*.02;o.casts++;spend();spl('fs_cast')}
function planWait(){const g=G,o=st(),c=env(),band=bandOfU(g.land.u),r=RODS[o.rod];
 const ctx={band,tod:c.tod,wx:c.wx,tide:c.tide,bait:o.bait,rod:o.rod,hot:c.hot,luck:r.luck+(g.perfect?.05:0)};g.ctx=ctx;
 const fo=window.FW_FISH&&FW_FISH.force,s=(fo&&SPI[fo])||rollSpecies(ctx);g.fsp=s;g.fr=rollFish(s,ctx.luck);
 const br=BAITS[o.bait].at*(c.tod==0||c.tod==2?1.2:1)*(c.wx==1?1.25:c.wx==3?1.35:1)*(c.tide==1?1.15:c.tide==2?1.08:1)*(g.perfect?1.12:1)*(1+.05*o.rod);
 const tb=clamp(8.5/br*rr(.55,1.45),3.2,15),big=s.w1>=4||s.r>=2;let n=s.k!='f'?0:s.r>=3?ri(0,1):big?ri(1,2):ri(2,4);const nib=[];let t=1.4;for(let i=0;i<n&&t<tb-1.6;i++){t+=rr(.9,2.2);if(t<tb-1.2)nib.push(t);t+=1}
 return{t:0,tb,nib,ni:0,ns:-9,na:0,jig:0,dip:0,junk:s.k!='f'&&s.k!='t'}}
function startBite(){const g=G,w=g.w,s=g.fsp;g.st='bite';g.stT=0;g.bT=0;g.win=(s.k=='f'?.95:1.7)+.05*st().rod;g.shake=.8;g.bite=1;st().bites++;
 spl(s.k=='f'?'fs_bite':'fs_plip');const L=g.land;ripple(L.x,L.z,2.2,.8,1.8);ripple(L.x,L.z,1.3,.7,1.2);spray(L.x,wY(L.x,L.z),L.z,s.k=='f'?16:6,{sp:2,vy:2.4})}
function doHook(){const g=G;g.st='hook';g.stT=0;spl('fs_hook');const L=g.land;spray(L.x,wY(L.x,L.z),L.z,20,{sp:2.6,vy:3.4});ripple(L.x,L.z,2.6,.8,1.4);msg('HOOKED!',1.2,'good');g.shake=1;
 try{disposeM(g.fishF);const q=g.fsp;g.fishF=fish3(q.id,clamp(g.fr.l/100,.28,1.6));g.fishF.name='hookedFish';g.fishF.rotation.order='YZX';g.fishF.userData.len=g.fishF.scale.x;scene.add(g.fishF);g.jump=null;g.ffH=null}catch(e){soft(e,'fishF')}}
function loseLine(text,cls,snap){const g=G;g.st='lose';g.stT=0;g.lsMsg=text;msg(text,2.2,cls||'bad');g.R=null;g.bite=0;g.fsp=g.fsp;g.jump=null;if(g.fishF){const L=g.lure;spray(L.x,wY(L.x,L.z),L.z,10,{sp:1.6,vy:2.4});disposeM(g.fishF);g.fishF=null}if(snap){spl('fs_snap');st().snaps++}else spl('fs_lose');g.lureFrom=g.lure.clone()}
/* the reel-in minigame (v55.23.0, played like the Mix in the studio): HOLD to lift the green catch bar, let go and it sinks; keep the fish inside it.
   In the bar the catch meter fills, outside it drains: full = landed, empty = it got away. Dashes make the fish shoot up or down the column.
   A pure step function so the tests can drive it. */
function newReel(sp,fr,rod,castD){const sz=fr.sz,b=sp.beh,junk=sp.k!='f',pull=b[0]*(.7+.6*sz)/rod.pow;
 const zw=clamp(.125+rod.zone*1.3+(junk?.07:0)-(sp.k=='f'?sp.r*.011:0)-sz*.012,.085,.24);
 return{p:{pull,agi:b[1],gA:b[2],gB:b[3],bl:b[4],thr:b[5],stam:b[6]*(.7+.6*sz),sz,junk,rod,zw,
   gain:.105*Math.pow(rod.reel/.075,.6)/(.42+.85*pull*(.5+.5*sz))*(junk?1.5:1),drain:.085*(.6+.5*Math.min(1.4,pull))},
  D0:.55+.35*clamp(castD/rod.reach,0,1),D:.5,T:.3,f:.36,fv:0,z:.24,zv:0,prog:.3,stam:1,nb:rr(2.2,3.8),bst:null,tg:.42,tgT:.5,time:0,inz:0,hot:0,tot:0,maxT:0,res:'',bursts:0,hold:false,inZ:true}}
function reelStep(R,dt,inp){if(R.res)return R;const P2=R.p,hold=!!inp.hold,zw=P2.zw;R.hold=hold;R.time+=dt;
 /* the catch bar: holding lifts it, letting go lets it sink, it bumps softly off both ends */
 R.zv+=(hold?2.7:-2.3)*dt;R.zv*=Math.exp(-dt*1.4);R.zv=clamp(R.zv,-1.25,1.25);R.z+=R.zv*dt;
 if(R.z<zw){R.z=zw;R.zv=R.zv<-.25?-R.zv*.3:0}if(R.z>1-zw){R.z=1-zw;R.zv=R.zv>.25?-R.zv*.25:0}
 /* the fish: drifts to a new depth now and then, makes a dash in between (junk just sinks) */
 R.nb-=dt;if(!R.bst&&R.nb<=0&&!P2.junk){R.bst={left:P2.bl*rr(.75,1.25)};R.tg=clamp(R.f+(R.f<.5?1:-1)*(Math.random()<.78?1:-1)*rr(.35,.6),Math.min(.5,2*zw+.05),.96);R.nb=rr(P2.gA,P2.gB)*(.55+.6*R.stam);R.bursts++;R.newBurst=1}
 if(R.bst){R.bst.left-=dt;if(R.bst.left<=0)R.bst=null}
 R.tgT-=dt;if(R.tgT<=0&&!R.bst){R.tg=P2.junk?clamp(R.f-rr(.02,.08),.05,.95):clamp(R.f+rr(-.32,.32)*(.5+P2.agi*.5),Math.min(.5,2*zw+.05),.95);R.tgT=rr(.5,1.4)}
 const spd=(R.bst?.55+P2.agi*.75:.12+P2.agi*.2)*(.65+.35*R.stam),want=clamp((R.tg-R.f)*5,-spd,spd);R.fv+=(want-R.fv)*Math.min(1,dt*(R.bst?7:4));
 R.f+=R.fv*dt;if(P2.thr>0)R.f+=Math.sin(R.time*(16+P2.thr*8)+P2.sz*9)*P2.thr*(R.bst?.18:.06)*dt;R.f=clamp(R.f,.02,.98);
 const inZ=Math.abs(R.f-R.z)<zw;R.inZ=inZ;
 /* the catch meter */
 R.prog=clamp(R.prog+(inZ?P2.gain*(R.bst?.55:1):-P2.drain*(R.bst?1.3:1))*dt,0,1);
 if(inZ)R.stam=Math.max(.2,R.stam-dt*.12/Math.max(.3,P2.stam));else R.stam=Math.min(1,R.stam+dt*.03);
 /* the line: how far out the fish is and how hard the rod bends (only the look) */
 R.D=R.D0*(1-.88*R.prog);const Tn=.25+.35*P2.pull*(R.bst?1.6:.7)*(.6+.4*R.stam)+(hold?.12:0)+(inZ?0:.1);R.T+=(Tn-R.T)*Math.min(1,dt*3);if(R.T>R.maxT)R.maxT=R.T;
 R.tot+=dt;if(inZ)R.inz+=dt;else if(R.bst)R.hot+=dt;
 if(R.prog>=1)R.res='won';else if(R.prog<=0)R.res='lost';
 return R}
const skillOf=R=>clamp(.75*(R.tot>0?R.inz/R.tot:0)+.25*(1-(R.tot>0?R.hot/R.tot:0)*2),0,1);
function startReel(){const g=G,o=st();g.R=newReel(g.fsp,g.fr,RODS[o.rod],g.castD);g.st='reel';g.stT=0;g.reelClick=0;g.stuck=0;msg('REEL!',1,'good')}
function reelInputs(){return{hold:!!G.hold}}
function catchFish(){const g=G,o=st(),s=g.fsp,fr=g.fr,R=g.R,skill=R?skillOf(R):.6,rec=o.caught[s.id]||(o.caught[s.id]={n:0,best:0,len:0,first:dayNo()}),isNew=rec.n==0,isRec=!isNew&&s.k=='f'&&fr.w>rec.best,trophy=fr.sz>.88&&s.k=='f';
 const value=s.k=='t'?Math.round(s.pr*(.6+.8*fr.sz)):priceOf(s,fr.sz);const rarityPts=s.k=='f'?[.5,1.2,3,6,12][s.r]:s.k=='t'?3:.15;
 const newB=isNew?(s.k=='f'?[1,1.5,3,5,8][s.r]:.5):0;let pts=rarityPts*(.75+.5*fr.sz)*(.7+.6*skill)+newB+(isRec?rarityPts*.25:0);
 rec.n++;if(fr.w>rec.best)rec.best=fr.w;if(fr.l>rec.len)rec.len=fr.l;if(s.k=='f'&&fr.w>o.rec.w){o.rec={w:fr.w,id:s.id,len:fr.l}}
 const m=mast(pts,(isNew?'New ':'')+s.n);g.sess.n++;g.catches++;g.sess.cash+=value;if(!g.sess.best||fr.w>g.sess.best.w)g.sess.best=fr;
 g.card={s,fr,skill,isNew,isRec,trophy,value,mast:m,coins:s.k=='t'?value:0};g.st='land';g.stT=0;g.R=null;g.bite=0;g.hold=false;
 g.jump=null;g.fishM=g.fishF;g.fishF=null;if(!g.fishM){g.fishM=fish3(s.id,clamp(fr.l/100,.28,1.6));g.fishM.position.copy(g.lure)}g.fishM.name='caughtFish';g.fishM.rotation.order='YZX';scene.add(g.fishM);
 g.fishM.userData.len=g.fishM.scale.x;g.fishM.userData.hl=clamp(g.fishM.scale.x*1.1,.42,.85);g.fromLure=g.lure.clone();g.fromPos=g.fishM.position.clone();g.fromRot=g.fishM.rotation.y;g.flopAt=0;g.flop=.22;
 if(s.k=='f'&&s.r>=2&&Math.random()<.9||Math.random()<.35)gullDive();if(s.k=='f'||s.id=='duck'||Math.random()<.4)if(Math.random()<.8)catBeg();
 try{S.fish.tales=(S.fish.tales|0)}catch(e){}sv()}
/* keep puts the catch in the bucket; the bucket holds 40 (the cheapest is let go when it is full) */
function keepFish(){const g=G,o=st(),c=g.card;if(!c)return;const it={id:c.s.id,w:c.fr.w,l:c.fr.l,v:c.value,d:dayNo(),sz:+c.fr.sz.toFixed(3)};o.inv.push(it);if(o.inv.length>40){let mi=0;o.inv.forEach((q,i)=>{if(q.v<o.inv[mi].v)mi=i});const r=o.inv.splice(mi,1)[0];if(r===it)msg('Bucket full, it swam off again',2,'bad');else msg('Bucket full: let a '+SPI[r.id].n+' go',2,'bad')}sv()}

/* ---------- the state machine, once per frame ---------- */
function simTick(dt){const g=G;if(!g)return;
 g.fade+=(g.fadeT-g.fade)*Math.min(1,dt*8);
 if(g.paused||JO){hudTick(dt,true);return}
 g.t+=dt;g.stT+=dt;g.shake=Math.max(0,g.shake-dt*2.2);
 try{if(g.st!='card'&&g.st!='land'){const DK=typeof DAYK!='undefined'?DAYK:1;if(S.t<596)S.t=Math.min(596,S.t+dt*DK*.3);else if(!g.late){g.late=1;msg('It is very late. The night fish are out.',3)}}}catch(e){}
 if(g.msgT>0){g.msgT-=dt;if(g.msgT<=0){const e=$f('fh_msg');if(e)e.style.opacity=0}}
 if(!g.hold&&g.needRel)g.needRel=false;
 const pr=g.pressed,pW=g.pressW,pS=g.pressS,pQ=g.pressQ,pE=g.pressE,pR=g.pressR;g.pressed=g.pressW=g.pressS=g.pressQ=g.pressE=g.pressR=0;
 switch(g.st){
  case'aim':case'charge':{
   {const ax=(KR()?1:0)-(KL()?1:0);if(ax){g.mouseAim=false;g.aim=clamp(g.aim+ax*1.15*dt,-1.3,1.3)}else if(g.mouseAim&&MOUSE.has){const tg=clamp((MOUSE.x/innerWidth-.5)*2*1.4,-1.3,1.3);g.aim+=(tg-g.aim)*Math.min(1,dt*7)}g.yaw=g.sp.h+g.aim}
   if(g.st=='aim'){if(g.hold&&!g.needRel){g.st='charge';g.pw=0;g.pwD=1;g.stT=0}
    else if((pQ||pE)&&g.sp.s){shiftSpot(pQ?-1:1)}}
   else{g.pw+=g.pwD*dt/1.3;if(g.pw>=1){g.pw=1;g.pwD=-1}if(g.pw<=0){g.pw=0;g.pwD=1}
    if(!g.hold){doCast()}}
   break}
  case'cast':{
   if(!g.flying&&g.stT>=.2){g.flying=true;g.fT=0;tipWorld(_tip);g.tip0=_tip.clone();spl('fs_cast');g.lure.copy(_tip)}
   if(g.flying){g.fT+=dt;const k=clamp(g.fT/g.cDur,0,1),L=g.land,h=1.4+L.d*.16,wy=wY(L.x,L.z);g.lure.set(lerp(g.tip0.x,L.x,k),lerp(g.tip0.y,wy,k)+4*h*k*(1-k),lerp(g.tip0.z,L.z,k));if(k>=1){g.flying=false;landLure()}}
   break}
  case'wait':{const w=g.w;w.t+=dt;
   if(pS){g.st='retract';g.stT=0;g.lureFrom=g.lure.clone();g.bite=0;break}
   if(pW&&w.jig<3&&w.t>.5){w.jig++;w.tb=Math.max(w.t+1.1,w.tb-.9);ripple(g.land.x,g.land.z,.9,.55,1.1);w.twitch=.3;spl('fs_click')}
   if(w.twitch>0)w.twitch-=dt;
   if(w.ni<w.nib.length&&w.t>=w.nib[w.ni]){w.ns=w.t;w.na=rr(.05,.095);w.ni++;spl('fs_plip');ripple(g.land.x,g.land.z,.7,.5,1)}
   w.dip=w.ns>-5&&w.t-w.ns<.4?Math.sin(Math.PI*clamp((w.t-w.ns)/.4,0,1))*w.na:0;
   if(pr){if(w.ns>-5&&w.t-w.ns<.75&&w.t<w.tb-.1){loseLine('Too early! It spat the hook.','bad');break}}
   if(w.t>=w.tb){startBite()}
   break}
  case'bite':{g.bT+=dt;if(pr){doHook();break}if(g.bT>g.win){loseLine('It took the bait and got away.','bad')}break}
  case'hook':{if(g.stT>.45)startReel();break}
  case'reel':{const R=g.R;if(!R){g.st='aim';break}
   const inp=reelInputs();reelStep(R,dt,inp);
   if(R.newBurst){R.newBurst=0;spl('fs_zing');g.shake=Math.max(g.shake,.35);spray(g.lure.x,wY(g.lure.x,g.lure.z),g.lure.z,9,{sp:2,vy:2.6});ripple(g.lure.x,g.lure.z,1.8,.7,1.2);g.dash=.5;
    const sp=g.fsp;if(g.fishF&&sp.k=='f'&&sp.id!='crab'&&!g.jump&&(sp.r>=1||g.fr.sz>.5)&&Math.random()<.5)g.jump={t:0,dur:.75+g.fishF.scale.x*.25,h:.55+g.fishF.scale.x*.6,sp:0}}
   if(inp.hold&&!R.bst){g.reelClick-=dt;if(g.reelClick<=0){g.reelClick=.11;spl('fs_click')}}
   if(!R.inZ&&R.prog<.22){g.warn=(g.warn||0)-dt;if(g.warn<=0){g.warn=.3;sn('err')}}
   if(R.inZ!==g.wasIn){g.wasIn=R.inZ;if(R.inZ&&R.time>.3)spl('fs_plip')}
   g.stuck=(g.stuck||0)+dt;if(g.stuck>150){R.res='lost'}
   if(R.res=='won')catchFish();else if(R.res=='snap')loseLine('SNAP! The line broke.','bad',true);else if(R.res=='lost')loseLine('It got away!','bad');
   break}
  case'land':{if(g.stT>1.05){g.st='card';g.stT=0;g.needRel=true;g.hold=false;spl(g.card.s.r>=2&&g.card.s.k=='f'||g.card.isNew&&g.card.s.k=='f'?'fs_rare':g.card.s.k=='t'?'fs_chest':'fs_catch');cardShow()}break}
  case'card':{
   if(g.stT>.6){if(pr)cardKeep(true);else if(pR)cardKeep(false)}break}
  case'release':{if(g.stT>.9){dropFish(g);g.st='aim';g.needRel=true}break}
  case'stow':{if(g.stT>.5){dropFish(g);g.st='aim';g.needRel=true}break}
  case'retract':{const d=Math.max(1,Math.hypot(g.lureFrom.x-g.sp.wx,g.lureFrom.z-g.sp.wz)),dur=clamp(d/16,.5,2.6),k=clamp(g.stT/dur,0,1);tipWorld(_tip);g.lure.set(lerp(g.lureFrom.x,_tip.x,k),lerp(g.lureFrom.y,_tip.y,k*k)+Math.sin(k*3.14)*.4,lerp(g.lureFrom.z,_tip.z,k));if(Math.random()<dt*10&&k<.95)ripple(g.lure.x,g.lure.z,.5,.4,.8);if(k>=1){g.st='aim';g.needRel=true;g.land=null;g.w=null}break}
  case'lose':{const k=clamp(g.stT/1.5,0,1);tipWorld(_tip);g.lure.set(lerp(g.lureFrom.x,_tip.x,k),lerp(g.lureFrom.y,_tip.y,k*k)+Math.sin(k*3.14)*.3,lerp(g.lureFrom.z,_tip.z,k));if(k>=1){g.st='aim';g.needRel=true;g.land=null;g.w=null}break}
 }
 GKd={};
 partsTick(dt);ripTick(dt);hudTick(dt,false)}
function landLure(){const g=G,L=g.land;spl('fs_splash');spray(L.x,wY(L.x,L.z),L.z,g.perfect?10:18,{sp:g.perfect?1.2:2,vy:g.perfect?2:3.2});ripple(L.x,L.z,1.6,.7,1.5);ripple(L.x,L.z,2.6,.45,1.9);g.w=planWait();g.st='wait';g.stT=0;g.lure.set(L.x,wY(L.x,L.z),L.z);if(g.perfect)msg('Perfect cast!',1.4,'good')}
function shiftSpot(dir){const g=G,n=SPOTS.length,j=(g.i+dir+n)%n;
 g.i=j;const sp=SPOTS[j];g.sp={x:sp.x,z:sp.z,wx:sp.wx,wz:sp.wz,y:sp.y,h:sp.h,n:sp.n,s:sp.s};g.aim=0;g.yaw=sp.h;P.x=sp.wx;P.z=sp.wz;SY=sp.y;g.cam.init=0;spl('fs_click');msg(sp.n,1.6)}
function cardKeep(keep){const g=G;if(!g||g.st!='card')return;cardHide();
 if(keep){keepFish();g.st='stow';g.stT=0;g.stow0=g.fishM?g.fishM.position.clone():null;spl('cash')}
 else{g.st='release';g.stT=0;g.rel0=g.fishM?g.fishM.position.clone():null;g.splashed=false;spl('fs_click')}
 g.card=null;g.land=null;g.w=null;sv()}

/* ---------- the lure, the line and the character, drawn in the render wrapper ---------- */
function lureUpdate(dt){const g=G,st_=g.st;if(!g.land&&st_!='aim'&&st_!='charge')return;
 if(st_=='aim'||st_=='charge'||(st_=='cast'&&!g.flying)||st_=='card'||st_=='land'||st_=='release'){tipWorld(_tip);g.lure.set(_tip.x+Math.sin(g.t*1.3)*.03,_tip.y-.62,_tip.z)}
 else if(st_=='wait'){const w=g.w,L=g.land,u=wU(L.x,L.z),by=wY(L.x,L.z),tw=w.twitch>0?Math.sin(w.twitch*20)*.06:0;g.lure.set(L.x+Math.sin(g.t*.5)*.05,by+.02+Math.sin(g.t*1.6)*.022-w.dip+tw,L.z+Math.cos(g.t*.4)*.04)}
 else if(st_=='bite'){const w=g.w,L=g.land,by=wY(L.x,L.z),junk=g.fsp.k!='f'&&g.fsp.k!='t',dep=junk?-.22*sm(0,.9,g.bT):-.34*sm(0,.1,g.bT)+Math.sin(g.bT*22)*.03;g.lure.set(L.x+(junk?0:Math.sin(g.bT*9)*.08),by+.02+dep,L.z)}
 else if(st_=='hook'){const L=g.land;g.lure.set(L.x,wY(L.x,L.z)-.12+Math.sin(g.stT*30)*.04,L.z)}
 else if(st_=='reel'&&g.R){const R=g.R,L=g.land,s=g.sp,dx=Math.sin(g.yaw),dz=Math.cos(g.yaw),ex=s.wx+dx*1.8,ez=s.wz+dz*1.8,D=R.D,lat=(R.f-.5)*2*(1.3+4.2*D);
  let x=lerp(ex,L.x,D)-dz*lat*(-1)*-1*0,z=lerp(ez,L.z,D);x+=-dz*lat;z+=dx*lat;const u=wU(x,z);if(u<.8){const k=(.8-u);x-=0;z-=k*1}
  const by=wY(x,z);g.lure.set(x,by+.02+(R.bst?Math.abs(Math.sin(g.t*16))*.1:Math.sin(g.t*3)*.02),z)}}
function poseFrame(){const g=G,m=P.mesh;if(!m||!g.rod)return;const now=performance.now(),dt=Math.min(.06,(now-(g.lastPose||now))/1000);g.lastPose=now;const k=1-Math.exp(-dt*9),po=g.pose,R=g.R,w=g.w;
 let pitch=.75,ar=-.6,al=-.4,bend=.08,direct=false;const s=g.st;
 if(s=='aim'){pitch=.75;ar=-.6;al=-.4;bend=.06}
 else if(s=='charge'){pitch=.75+1.15*g.pw;ar=-.6-.9*g.pw;al=-.4-.6*g.pw;bend=-.12*g.pw}
 else if(s=='cast'){const t=g.stT;direct=true;if(t<.2){const u=t/.2;pitch=lerp(.75+1.15*(g.pw0||.5),1.95,u);ar=-1.55;al=-1;bend=-.15}else{const u=clamp((t-.2)/.2,0,1),e=u*u*(3-2*u);pitch=lerp(1.95,.4,e);ar=lerp(-1.55,-.95,e);al=lerp(-1,-.6,e);bend=lerp(.6,.05,e)}}
 else if(s=='wait'){pitch=.85;ar=-.75;al=-.55;bend=.12+(w?w.dip*2.6:0)}
 else if(s=='bite'){pitch=lerp(.85,.55,sm(0,.12,g.bT));ar=-.8;al=-.6;bend=.2+.55*sm(0,.12,g.bT)}
 else if(s=='hook'){direct=true;const u=sm(0,.25,g.stT);pitch=lerp(.55,1.65,u);ar=lerp(-.8,-1.35,u);al=lerp(-.6,-1.1,u);bend=.55}
 else if(s=='reel'&&R){pitch=.95+.2*Math.sin(g.t*1.3);ar=-.9;al=g.hold?-1.05+Math.sin(g.t*14)*.3:-.8;bend=.25+clamp(R.T,0,1.3)*1.05+(R.bst?Math.sin(g.t*30)*.05:0)}
 else if(s=='land'||s=='card'){pitch=1.25;ar=-1.15;al=-1.15;bend=.04}
 else if(s=='release'){pitch=.9;const u=sm(0,.35,g.stT);ar=lerp(-1.35,-.55,u);al=lerp(-1.35,-.7,u);bend=.05}
 else if(s=='stow'){pitch=.9;const u=sm(0,.5,g.stT);ar=lerp(-1.35,-.6,u);al=lerp(-1.35,-.45,u);bend=.05}
 else if(s=='retract'){pitch=.95;ar=-.9;al=-1.0+Math.sin(g.t*16)*.3;bend=.2}
 else if(s=='lose'){pitch=.75;ar=-.6;al=-.4;bend=-.05}
 if(direct){po.pitch=pitch;po.ar=ar;po.al=al;po.bend=bend}else{po.pitch+=(pitch-po.pitch)*k;po.ar+=(ar-po.ar)*k;po.al+=(al-po.al)*k;po.bend+=(bend-po.bend)*k}
 P.rot=g.yaw;m.rotation.y=g.yaw;m.position.y=g.sp.y;m.position.x=g.sp.wx;m.position.z=g.sp.wz;
 P.arms[1].rotation.set(po.ar,0,.04);P.arms[0].rotation.set(po.al,0,-.04);P.legs[0].rotation.set(0,0,0);P.legs[1].rotation.set(0,0,0);
 {const p=P.arms[1].position,l=.52;g.rod.g.position.set(p.x*.6,p.y-l*Math.cos(po.ar),p.z-l*Math.sin(po.ar));g.rod.g.rotation.set(-po.pitch,0,0);g.rod.bend(po.bend)}
 m.updateMatrixWorld(true);tipWorld(_tip);
 /* the fish on the line: its head at the lure, the back just breaking the surface, it wobbles with the fight and sometimes leaps */
 if(g.fishF){const ff=g.fishF,hs=s=='hook'||s=='reel';ff.visible=hs;
  if(hs){const L=g.lure,len=ff.userData.len,wy=wY(L.x,L.z),junk=g.fsp.k!='f',fv=R?R.fv:0,dash=!!(R&&R.bst),ax=L.x-g.sp.wx,az=L.z-g.sp.wz,an=Math.hypot(ax,az)||1;
   let ry=Math.atan2(az/an,-ax/an)+(junk?g.t*.5:Math.sin(g.t*(dash?9:3.2))*(dash?.3:.14)+fv*.7),pz=junk?0:-fv*.35,y=wy-len*.07+(junk?Math.sin(g.t*2.2)*.03:Math.sin(g.t*5)*.012),rx=junk?Math.sin(g.t*1.3)*.2:Math.sin(g.t*4)*.1;
   const j=g.jump;if(j){if(!j.sp){j.sp=1;spl('fs_splash');spray(L.x,wy,L.z,16,{sp:2.2,vy:3.4});ripple(L.x,L.z,2.2,.7,1.4)}
    j.t+=dt;const q=clamp(j.t/j.dur,0,1);y=wy+len*.1+4*j.h*q*(1-q);pz=(.5-q)*1.5;rx=Math.sin(q*20)*.25;ry+=Math.sin(q*9)*.15;
    if(q>=1){g.jump=null;spl('fs_splash');spray(L.x,wy,L.z,22,{sp:2.4,vy:3.6});ripple(L.x,L.z,2.8,.8,1.6);ripple(L.x,L.z,1.6,.6,1.1)}}
   const hx=Math.cos(ry),hz=-Math.sin(ry);ff.position.set(L.x-hx*len*.5,y,L.z-hz*len*.5);ff.rotation.set(rx,ry,pz);
   if(junk&&!j)swim(ff,g.t,0);else swim(ff,g.t,g.jump?.2:dash?.16:.09,g.jump?12:dash?11:6.5)}}
 /* the fish you just caught: flops through the air into your hands, is held in front of you, is thrown back or stowed in the bucket */
 if(g.fishM){const fm=g.fishM,d=[Math.sin(g.yaw),Math.cos(g.yaw)],rv=[-d[1],d[0]],ud=fm.userData,hp=[g.sp.wx+d[0]*.75,g.sp.y+.98,g.sp.wz+d[1]*.75],hry=Math.atan2(-rv[1],rv[0]),aw=Math.atan2(-d[1],d[0]);
  const angTo=(a,b,u)=>{let q=b-a;q=Math.atan2(Math.sin(q),Math.cos(q));return a+q*u};
  if(s=='land'){const u=clamp(g.stT/1.0,0,1),e=u*u*(3-2*u),fl=g.fromPos||g.fromLure;fm.position.set(lerp(fl.x,hp[0],e),lerp(fl.y,hp[1],e)+Math.sin(u*Math.PI)*1.5,lerp(fl.z,hp[2],e));
   fm.rotation.set(Math.sin(u*26)*.7*(1-u),angTo(g.fromRot||0,hry,e),Math.sin(u*17)*.45*(1-u));fm.scale.setScalar(lerp(ud.len,ud.hl,e));g.flop=.22;swim(fm,g.t,.22,12)}
  else if(s=='card'){g.flopD=Math.max(0,(g.flopD||0)-dt);if(g.t>=(g.flopAt||0)){g.flopAt=g.t+rr(1.6,3);g.flopD=.55}
   const fe=Math.min(1,g.flopD/.3);g.flop=.03+.19*fe;fm.scale.setScalar(ud.hl);
   fm.position.set(hp[0],hp[1]+Math.sin(g.t*2)*.025+fe*Math.sin(g.t*30)*.03,hp[2]);fm.rotation.set(fe*Math.sin(g.t*26)*.35,hry+Math.sin(g.t*.7)*.12,Math.sin(g.t*1.5)*.05+fe*Math.sin(g.t*22)*.12);swim(fm,g.t,g.flop,fe>.05?12:5)}
  else if(s=='release'){const u=clamp(g.stT/.8,0,1),a=g.rel0||fm.position,wx=g.sp.wx+d[0]*3.5,wz=g.sp.wz+d[1]*3.5;fm.position.set(lerp(a.x,wx,u),lerp(a.y,wY(wx,wz),u*u)+Math.sin(u*Math.PI)*1.2,lerp(a.z,wz,u));
   fm.rotation.set(Math.sin(u*18)*.5*(1-u),angTo(hry,aw,sm(0,.3,u)),(.4-u)*1.5);swim(fm,g.t,.22,12);
   if(u>=1&&!g.splashed){g.splashed=true;spl('fs_splash');spray(wx,wY(wx,wz),wz,18,{sp:2.2,vy:3.2});ripple(wx,wz,2,.7,1.5);ripple(wx,wz,1.2,.5,1)}fm.visible=u<1}
  else if(s=='stow'){const u=clamp(g.stT/.5,0,1),e=u*u*(3-2*u),a=g.stow0||fm.position,tx=g.sp.wx+rv[0]*.5,tz=g.sp.wz+rv[1]*.5;fm.position.set(lerp(a.x,tx,e),lerp(a.y,g.sp.y+.5,e)+Math.sin(u*Math.PI)*.35,lerp(a.z,tz,e));
   fm.rotation.set(0,angTo(hry,hry+1.2,e),-e*1.1);fm.scale.setScalar(Math.max(.02,ud.hl*(1-e*.96)));swim(fm,g.t,.12,10)}}
 else g.splashed=false;
 /* the reel handle spins: fast while winding, a blur when the line comes in */
 {const rs=(s=='reel'&&R)?(g.hold?15:(R.bst?-9:1.5)):(s=='retract'||s=='lose')?22:0;g.reelA=(g.reelA||0)+rs*dt;if(g.rod.reel)g.rod.reel.rotation.x=g.reelA}
 /* bobber and line */
 const bob=g.bob;bob.visible=!(s=='card'||s=='land'||s=='release'||s=='stow');bob.position.copy(g.lure);const night=nightK();g.bobGlow.material.opacity=night*.8;
 bob.rotation.z=s=='wait'?Math.sin(g.t*1.2)*.1:s=='reel'?Math.sin(g.t*9)*.3:0;
 const ln=g.line;ln.visible=bob.visible;if(bob.visible){const d=Math.hypot(g.lure.x-_tip.x,g.lure.z-_tip.z);let sag=Math.min(2.4,.15+d*.05);if(s=='reel'&&R)sag=Math.max(0,.9*(1-R.T*1.4))*Math.min(1,d/6);else if(s=='bite'||s=='hook')sag=.2;else if(s=='cast'&&g.flying)sag=.5;else if(s=='aim'||s=='charge'||(s=='cast'&&!g.flying))sag=.04;
  _b.set(g.lure.x,g.lure.y+.28,g.lure.z);setLine(ln,_tip,_b,sag)}
 /* the shape of the fish under the bobber */
 {const sh=g.shadow;let vis=false;if(g.fsp&&((s=='wait'&&w&&w.ns>-5)||s=='bite'||s=='hook'||s=='reel')){vis=true;const fl=clamp(g.fr.l/100*1.1,.3,2.4);sh.scale.set(fl*.34,1,fl);
   const a=s=='wait'?g.t*.9:0,rad=s=='wait'?1.1:s=='bite'?.35:.2;sh.position.set(g.lure.x+Math.cos(a)*rad,wY(g.lure.x,g.lure.z)+.012,g.lure.z+Math.sin(a)*rad);sh.rotation.y=s=='reel'?g.yaw+Math.sin(g.t*2)*.4:-a;sh.material.opacity=s=='wait'?.3:.45}sh.visible=vis}
 /* the aim ring and the dotted arc */
 {const show=s=='aim'||s=='charge';g.ring.visible=show;g.dots.forEach(d=>d.visible=show);if(show){const pw=s=='charge'?g.pw:(g.pw0||.55),L=aimLand(pw),ok=L.u>=1.2,col=ok?['#9be8de','#7ff3ff','#6aa8ff','#c58cff'][bandOfU(L.u)]:'#ff7a6a',by=wY(L.x,L.z);
   g.ring.position.set(L.x,by+.02,L.z);const sc=1+Math.sin(g.t*4)*.06;g.ring.scale.set(sc,1,sc);g.ring.material.color.set(col);g.dotM.color.set(col);g.aimL=L;
   const h=1.4+L.d*.16;for(let i=0;i<g.dots.length;i++){const t=(i+1)/(g.dots.length+1);g.dots[i].position.set(lerp(_tip.x,L.x,t),lerp(_tip.y,by,t)+4*h*t*(1-t),lerp(_tip.z,L.z,t))}}}
 camUpdate(dt)}
function camTarget(){const g=G,s=g.st,yw=g.yaw,d=[Math.sin(yw),Math.cos(yw)],r=[-d[1],d[0]],b=[g.sp.wx,g.sp.y,g.sp.wz],L=g.lure;let p,l,fov=58,sp=3;
 const at=(a,c,h)=>[b[0]+d[0]*a+r[0]*c,b[1]+h,b[2]+d[1]*a+r[1]*c];
 if(s=='aim'||s=='charge'){p=at(-4.4,1.5,2.75);l=at(11,-.4,1.0);fov=58;sp=3.2}
 else if(s=='cast'){const f=g.flying;p=at(-2.4,5.6,2.5);l=f?[lerp(b[0],L.x,.65),b[1]+1.4,lerp(b[2],L.z,.65)]:at(3,0,1.7);fov=54;sp=f?4.2:3.4}
 else if(s=='reel'&&g.R){const q=.06+.14*g.R.D;p=at(-3.3,2.5,2.7);p=[lerp(p[0],L.x,q),lerp(p[1],L.y+1.3,q),lerp(p[2],L.z,q)];l=[L.x,L.y+.2,L.z];fov=lerp(40,50,g.R.D);sp=3}
 else if(s=='land'||s=='card'||s=='release'||s=='stow'){p=at(3.2,1.05,1.75);l=at(.4,-1.5,1.3);fov=46;sp=3.2}
 else{p=at(-4.1,1.9,2.7);const lx=g.land?L.x:b[0]+d[0]*8,lz=g.land?L.z:b[2]+d[1]*8;l=[lerp(b[0],lx,.86),lerp(b[1]+1.3,L.y+.2,.8),lerp(b[2],lz,.86)];if(s=='wait'||s=='bite'||s=='hook'){p[0]+=r[0]*Math.sin(g.t*.25)*.25;p[2]+=r[1]*Math.sin(g.t*.25)*.25}fov=52;sp=2.6}
 return{p,l,fov,sp}}
function camUpdate(dt){const g=G,c=g.cam,T=camTarget();if(!c.init){c.p.set(T.p[0],T.p[1],T.p[2]);c.l.set(T.l[0],T.l[1],T.l[2]);c.fov=T.fov;c.init=1}
 const k=1-Math.exp(-dt*T.sp),k2=1-Math.exp(-dt*T.sp*1.4);c.p.x+=(T.p[0]-c.p.x)*k;c.p.y+=(T.p[1]-c.p.y)*k;c.p.z+=(T.p[2]-c.p.z)*k;c.l.x+=(T.l[0]-c.l.x)*k2;c.l.y+=(T.l[1]-c.l.y)*k2;c.l.z+=(T.l[2]-c.l.z)*k2;c.fov+=(T.fov-c.fov)*k;
 const sh=g.shake*.07;cam3.position.set(c.p.x+(sh?rr(-sh,sh):0),Math.max(c.p.y,g.sp.y+.5)+(sh?rr(-sh,sh):0),c.p.z+(sh?rr(-sh,sh):0));cam3.lookAt(c.l);if(Math.abs(cam3.fov-c.fov)>.01){cam3.fov=c.fov;cam3.updateProjectionMatrix()}}
function camSnap(){if(G)G.cam.init=0}

/* ---------- HUD ---------- */
const $f=id=>document.getElementById(id);
const CSS=`#fishhud{position:fixed;inset:0;z-index:7;pointer-events:none;display:none;font-family:Silkscreen,'Courier New',monospace;color:#fff;--c:#ffd27a;--cd:#a8742a;--t:#7ff3ff;--bg:rgba(8,26,34,.8);--ln:rgba(255,255,255,.22)}
#fishhud *{box-sizing:border-box}
#fishhud .fp{position:absolute;background:var(--bg);border:2px solid var(--ln);box-shadow:0 4px 0 rgba(0,0,0,.35);padding:8px 12px}
#fishhud small{display:block;font-size:10px;letter-spacing:.08em;opacity:.7}
#fishhud b{font-weight:normal}
#fh_tl{left:14px;top:14px;min-width:210px;font-size:11px;line-height:1.6}#fh_tl b.big{font-size:20px;color:var(--c);display:block}
#fh_tr{right:14px;top:14px;text-align:right;min-width:190px;font-size:11px;line-height:1.6}#fh_tr b{color:var(--c)}
#fh_msg{position:absolute;left:50%;top:21%;transform:translateX(-50%);font-size:34px;letter-spacing:.06em;text-shadow:0 3px 0 rgba(0,0,0,.55);opacity:0;white-space:nowrap}
#fh_msg.good{color:#9dffb6}#fh_msg.bad{color:#ffa090}
#fh_msg.pop{animation:fhpop .35s ease-out}@keyframes fhpop{0%{transform:translateX(-50%) scale(1.5)}100%{transform:translateX(-50%) scale(1)}}
#fh_hint{position:absolute;left:50%;bottom:78px;transform:translateX(-50%);font-size:13px;background:var(--bg);padding:6px 14px;border:2px solid var(--ln);display:none;white-space:nowrap;max-width:94vw}
#fh_keys{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);font-size:11px;white-space:nowrap;background:var(--bg);padding:6px 12px;border:2px solid var(--ln);max-width:96vw;overflow:hidden}
#fh_keys kbd{display:inline-block;min-width:22px;padding:2px 6px;margin:0 3px;background:#f6efe0;color:#2a1c0a;border-bottom:3px solid #a89268;font:inherit;font-size:10px;text-align:center}
#fh_pwr{position:absolute;left:50%;bottom:116px;transform:translateX(-50%);width:min(380px,80vw);display:none;text-align:center}
#fh_pwr .bar{position:relative;height:18px;background:rgba(8,26,34,.85);border:2px solid var(--ln)}#fh_pwr i{display:block;height:100%;background:linear-gradient(90deg,#7ff3ff,#ffd27a)}
#fh_pwr .sw{position:absolute;right:0;top:0;width:10%;height:100%;background:rgba(255,210,90,.38);border-left:2px solid #ffd27a}
#fh_pt{display:block;margin-top:6px;font-size:12px;text-shadow:0 2px 0 rgba(0,0,0,.6)}
#fh_bite{position:absolute;left:50%;top:30%;width:0;height:0;display:none}
#fh_bite .rg{position:absolute;left:-50px;top:-50px;width:100px;height:100px;border:4px solid rgba(157,255,182,.85);border-radius:50%}
#fh_bite .in{position:absolute;left:-50px;top:-50px;width:100px;height:100px;border:6px solid #fff;border-radius:50%}
#fh_bite .ex{position:absolute;left:-50px;top:-34px;width:100px;text-align:center;font-size:58px;color:#ffd27a;text-shadow:0 4px 0 rgba(0,0,0,.55)}
#fh_bite .tx{position:absolute;left:-120px;top:64px;width:240px;text-align:center;font-size:18px;text-shadow:0 2px 0 rgba(0,0,0,.6)}
#fh_reel{position:absolute;right:3vw;top:50%;transform:translateY(-50%);display:none;width:150px}
#fh_rw{display:flex;flex-direction:column;align-items:center;gap:8px}#fh_rw.shk{animation:fhshk .1s linear infinite}
@keyframes fhshk{0%{transform:translate(0,0)}25%{transform:translate(3px,-2px)}50%{transform:translate(-3px,2px)}75%{transform:translate(2px,3px)}100%{transform:translate(0,0)}}
#fh_rl{font-size:12px;letter-spacing:.06em;text-align:center;text-shadow:0 2px 0 rgba(0,0,0,.6);background:var(--bg);border:2px solid var(--ln);padding:5px 8px;max-width:190px}
#fh_rl.big{color:#ffd27a}
#fh_rr{display:flex;gap:8px;align-items:stretch}
#fh_col{position:relative;width:74px;height:min(360px,52vh)}
#fh_col .wt{position:absolute;inset:0;border-radius:14px;overflow:hidden;border:3px solid rgba(255,255,255,.35);background:linear-gradient(180deg,#58c9e8 0%,#2a8fc0 35%,#14587f 75%,#0b3552 100%);box-shadow:0 4px 0 rgba(0,0,0,.35),inset 0 0 18px rgba(0,20,40,.5)}
#fh_col .sand{position:absolute;left:0;right:0;bottom:0;height:9%;background:linear-gradient(180deg,#d8c08a,#a88a54)}
#fh_col .bb{position:absolute;bottom:-8px;width:7px;height:7px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7);animation:fhbub 4s linear infinite}
@keyframes fhbub{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:.9}100%{transform:translateY(-380px) scale(1.2);opacity:0}}
#fh_zone{position:absolute;left:0;right:0;bottom:0;height:20%;background:rgba(120,255,160,.28);border-top:3px solid #9dffb6;border-bottom:3px solid #9dffb6;border-radius:6px;transition:background .12s,box-shadow .12s}
#fh_zone.in{background:rgba(120,255,160,.5);box-shadow:0 0 16px 3px rgba(157,255,182,.85)}
#fh_fc{position:absolute;left:50%;bottom:0;width:100px;height:60px;margin-left:-50px;transform:translateY(50%);will-change:transform;pointer-events:none}
#fh_mt{position:relative;width:16px;border-radius:8px;background:rgba(8,26,34,.85);border:3px solid rgba(255,255,255,.35);overflow:hidden}
#fh_mu{position:absolute;left:0;right:0;bottom:0;height:100%;transform-origin:50% 100%;transform:scaleY(.3);background:#9dffb6}
#fh_crank{position:relative;width:54px;height:54px;border-radius:50%;background:radial-gradient(circle,#5a606c 0,#3a404c 70%);border:3px solid #c9ced6;box-shadow:0 3px 0 rgba(0,0,0,.4)}
#fh_crank i{position:absolute;left:50%;top:50%;width:4px;height:22px;margin:-22px 0 0 -2px;background:#c9ced6;transform-origin:50% 100%;border-radius:2px}
#fh_crank i::after{content:'';position:absolute;left:-4px;top:-6px;width:12px;height:12px;border-radius:50%;background:#e6b422}
#fh_card{left:auto;right:3vw;top:50%;transform:translateY(-50%);width:min(420px,94vw);display:none;pointer-events:auto;text-align:center;padding:14px 18px 14px;border-width:3px}
#fh_card .art{background:radial-gradient(circle,rgba(127,243,255,.28),rgba(8,26,34,0) 70%);padding:6px;margin:0 auto;display:flex;justify-content:center;min-height:100px;align-items:center}
#fh_card .art canvas{max-width:100%;height:auto}
#fh_card h3{font-weight:normal;font-size:30px;line-height:1.1;margin:6px 0 2px}#fh_card .rar{font-size:12px;letter-spacing:.14em}
#fh_card .fl{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0 0}#fh_card .fl span{padding:2px 8px;font-size:11px;background:#ffd27a;color:#2a1c0a}#fh_card .fl span.n{background:#9dffb6}#fh_card .fl span.t{background:#ff9ad0}
#fh_card .gr{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:12px;margin:10px 0;text-align:left}#fh_card .gr b{float:right;color:var(--c)}
#fh_card p{font-size:11px;line-height:1.6;opacity:.85;margin:6px 0}
#fh_card .row,#fh_modal .row{display:flex;gap:10px;margin-top:12px}#fh_card button,#fh_modal button{flex:1;font:inherit;font-size:13px;padding:9px 6px;background:#3a2a10;color:#fff;border:2px solid var(--c);cursor:pointer}#fh_card button.go,#fh_modal button.go{background:var(--c);color:#2a1c0a}
#fh_modal{left:50%;top:50%;transform:translate(-50%,-50%);width:min(460px,92vw);display:none;pointer-events:auto;text-align:left}
#fh_modal h2{font-weight:normal;font-size:26px;margin:0 0 8px;color:var(--c)}#fh_modal p{font-size:12px;line-height:1.7;margin:4px 0}
#fh_fade{position:absolute;inset:0;background:#06202a;opacity:0}
@media (max-width:640px){#fh_reel{right:6px;width:110px}#fh_col{width:56px;height:min(300px,44vh)}#fh_fc{width:76px;height:46px;margin-left:-38px}#fh_rl{font-size:10px;max-width:130px}#fh_crank{width:40px;height:40px}#fh_crank i{height:15px;margin-top:-15px}#fh_tl{min-width:0;font-size:10px}#fh_tr{min-width:0;font-size:10px}#fh_msg{font-size:24px}}`;
function hudOn(){if(!fhCSS){fhCSS=document.createElement('style');fhCSS.id='fishcss';fhCSS.textContent=CSS;document.head.appendChild(fhCSS)}
 hud=document.createElement('div');hud.id='fishhud';
 hud.innerHTML=`<div id=fh_tl class=fp></div><div id=fh_tr class=fp></div><div id=fh_msg></div>
<div id=fh_bite><div class=rg></div><div class=in id=fh_bi></div><div class=ex>!</div><div class=tx id=fh_bt></div></div>
<div id=fh_pwr><div class=bar><i id=fh_pf></i><div class=sw></div></div><span id=fh_pt></span></div>
<div id=fh_reel><div id=fh_rw><div id=fh_rl>Something is on the line!</div><div id=fh_rr><div id=fh_col><div class=wt><div class=sand></div><i class=bb style="left:12%;animation-delay:0.0s;animation-duration:3.6s"></i><i class=bb style="left:34%;animation-delay:1.1s;animation-duration:4.4s"></i><i class=bb style="left:58%;animation-delay:2.3s;animation-duration:3.9s"></i><i class=bb style="left:78%;animation-delay:0.6s;animation-duration:4.8s"></i><i class=bb style="left:46%;animation-delay:3.1s;animation-duration:4.1s"></i><div id=fh_zone></div></div><canvas id=fh_fc width=150 height=90></canvas></div><div id=fh_mt><u id=fh_mu></u></div></div><div id=fh_crank><i id=fh_ck></i></div></div></div>
<div id=fh_hint></div><div id=fh_keys></div><div id=fh_card class=fp></div><div id=fh_modal class=fp></div><div id=fh_fade></div>`;
 document.body.appendChild(hud);hud.style.display='block';HC={};
}
function hudOff(){if(hud){hud.remove();hud=null}HC={}}
let HC={};const setT=(id,t)=>{if(HC[id]!==t){HC[id]=t;const e=$f(id);if(e)e.textContent=t}};const setH=(id,t)=>{if(HC[id]!==t){HC[id]=t;const e=$f(id);if(e)e.innerHTML=t}};
const fmtClock=()=>{try{return clk(festMins())}catch(e){return'12:00'}};
function hudTick(dt,paused){const g=G;if(!hud||!g)return;const o=st(),e=env(),r=RODS[o.rod],B=BAITS[o.bait],s=g.st;
 setH('fh_tl',`<small>${E(g.sp.n)}</small><b class=big>${fmtClock()}</b>Day ${dayNo()} · ${WXN[e.wx]}<br>${TIDEN[e.tide]}<br><span style="color:var(--t)">${TODN[e.tod]}</span> · Biting well: ${E(SPI[e.hot].n)}`);
 const inv=o.inv,tot=inv.reduce((a,q)=>a+q.v,0);
 setH('fh_tr',`<small>EQUIPPED</small><b>${E(r.n)}</b><br>Bait: ${E(B.n)}${o.bait=='worm'?'':' x'+(o.baits[o.bait]|0)}<br>Bucket ${inv.length}/40 · ${money(tot)}<br>Caught this trip: ${g.sess.n}`);
 /* power meter */
 const pw=$f('fh_pwr');if(pw){const show=s=='aim'||s=='charge';pw.style.display=show?'block':'none';if(show){const L=g.aimL||aimLand(g.pw0||.55);const f=$f('fh_pf');if(f)f.style.width=(s=='charge'?g.pw*100:0).toFixed(1)+'%';
  setT('fh_pt',L.u<1.2?'Too short: it lands on the sand':(s=='charge'?(g.pw>=.9?'PERFECT: let go!':'Let go to cast'):'Hold to cast')+' · '+Math.round(L.d)+' m · '+BANDN[bandOfU(L.u)]+(RODS[o.rod].reach<L.d+1&&0?'':''))}}
 /* bite ring */
 const bt=$f('fh_bite');if(bt){const show=s=='bite';bt.style.display=show?'block':'none';if(show){const k=clamp(g.bT/g.win,0,1),bi=$f('fh_bi');if(bi)bi.style.transform='scale('+lerp(2.3,1,k).toFixed(3)+')';setT('fh_bt',g.fsp&&g.fsp.k!='f'&&g.fsp.k!='t'?'SOMETHING HEAVY! SPACE':'BITE!  SPACE / CLICK')}}
 /* reel */
 const rl=$f('fh_reel');if(rl){const show=s=='reel'&&g.R;rl.style.display=show?'block':'none';if(show){const R=g.R,z=$f('fh_zone'),fc=$f('fh_fc'),mu=$f('fh_mu'),ck=$f('fh_ck'),rw=$f('fh_rw');
  if(!paused){g.dash=Math.max(0,(g.dash||0)-dt);g.crankA=((g.crankA||0)+(R.hold?dt*540:dt*40))%360}
  if(z){z.style.bottom=((R.z-R.p.zw)*100).toFixed(2)+'%';z.style.height=(R.p.zw*200).toFixed(2)+'%';z.className=R.inZ?'in':''}
  if(fc){const sp=g.fsp,col=sp.k=='f'?RARC[sp.r]:JUNKC;drawFishTo(fc,sp.id,{t:g.t,amp:.12,sil:true,glow:col});fc.style.bottom=(R.f*100).toFixed(2)+'%';fc.style.transform='translateY(50%) rotate('+(-R.fv*28).toFixed(1)+'deg)'}
  if(mu){mu.style.transform='scaleY('+R.prog.toFixed(3)+')';mu.style.background='hsl('+Math.round(R.prog*120)+',80%,55%)'}
  if(ck)ck.style.transform='rotate('+(g.crankA||0).toFixed(0)+'deg)';
  if(rw){const sh=(g.dash||0)>0;if(rw.classList.contains('shk')!==sh)rw.classList.toggle('shk',sh)}
  setT('fh_rl',g.fr&&g.fr.sz>.7?'A big one!':'Something is on the line!')}}
 if(s=='card'){const cv=$f('fh_cv');if(cv&&g.card)drawFishTo(cv,g.card.s.id,{t:g.t,amp:g.flop||.03,ry:-.32+Math.sin(g.t*.6)*.45})}
 /* hints and keys */
 let hint='',kh='';
 if(s=='aim'){hint=g.tut?'Move the mouse (or A / D) to aim. Hold to charge, let go to cast.':'';kh='<kbd>MOUSE</kbd> / <kbd>A</kbd><kbd>D</kbd> aim <kbd>HOLD</kbd> charge, release to cast <kbd>Q</kbd><kbd>E</kbd> change spot <kbd>J</kbd> journal <kbd>ESC</kbd> pause'}
 else if(s=='charge')kh='<kbd>RELEASE</kbd> to cast: the gold band is a perfect cast';
 else if(s=='wait'){const w=g.w;hint=g.tut&&w&&w.t<5?'Wait for a big dunk. Small dips are only nibbles: stay calm.':w&&w.ns>-5&&w.t-w.ns<1.2?'A nibble. Wait for it...':'';kh='Wait for the bobber <kbd>W</kbd> twitch the lure <kbd>S</kbd> reel in <kbd>ESC</kbd> pause'}
 else if(s=='bite')kh='<kbd>SPACE</kbd> / <kbd>CLICK</kbd> now!';
 else if(s=='reel'){hint=g.tut&&g.R&&g.R.time<8?'Hold to lift the green bar, let go to sink it. Keep the fish inside the bar to fill the meter!':'';kh='<kbd>HOLD</kbd> lift the green bar, let go to sink <kbd>ESC</kbd> pause'}
 else if(s=='card')kh='<kbd>SPACE</kbd> keep <kbd>R</kbd> release';
 else kh='';
 const hh=$f('fh_hint');if(hh){if(hint){hh.style.display='block';setT('fh_hint',hint)}else hh.style.display='none'}setH('fh_keys',kh);const kk=$f('fh_keys');if(kk)kk.style.display=kh?'block':'none';
 const f=$f('fh_fade');if(f)f.style.opacity=g.fade.toFixed(2)}
function cardShow(){const g=G,c=g.card;if(!c||!hud)return;const s=c.s,fr=c.fr,e=$f('fh_card'),o=st(),col=s.k=='f'?RARC[s.r]:s.k=='t'?RARC[3]:JUNKC,rn=s.k=='f'?RAR[s.r]:s.k=='t'?'Treasure':'Junk';
 const sk=Math.round(c.skill*100),sc=c.skill>.8?'Master reel':c.skill>.55?'Smooth reel':c.skill>.3?'Wobbly reel':'Lucky catch';
 e.innerHTML=`<div class=fl>${c.isNew?'<span class=n>NEW IN YOUR JOURNAL!</span>':''}${c.isRec?'<span>NEW RECORD!</span>':''}${c.trophy?'<span class=t>TROPHY SIZE</span>':''}</div><div class=art id=fh_art></div><h3 style="color:${col}">${E(s.n)}</h3><div class=rar style="color:${col}">${rn.toUpperCase()}</div>
 <div class=gr><span>Weight<b>${fmtW(fr.w)}</b></span><span>Length<b>${fr.l} cm</b></span><span>${s.k=='t'?'Coins inside':'Worth'}<b>${money(c.value)}</b></span><span>Reel skill<b>${sc}</b></span>${o.caught[s.id]&&o.caught[s.id].n>1&&s.k=='f'?`<span>Your best<b>${fmtW(o.caught[s.id].best)}</b></span><span>Caught<b>x${o.caught[s.id].n}</b></span>`:''}${c.mast?`<span>Mastery<b>+${c.mast.toFixed(1)}</b></span>`:''}</div>
 <p>${E(s.tx)}</p><div class=row><button onclick="fsCard(0)">RELEASE [R]</button><button class=go onclick="fsCard(1)">${s.k=='t'?'TAKE IT [SPACE]':'KEEP [SPACE]'}</button></div>`;
 const art=$f('fh_art');if(art){art.innerHTML='<canvas id=fh_cv width=600 height=340 style="width:100%;max-width:300px"></canvas>';const cv=$f('fh_cv');drawFishTo(cv,s.id,{t:g.t,amp:.03,ry:-.32})}e.style.display='block';e.style.borderColor=col}
function cardHide(){const e=$f('fh_card');if(e)e.style.display='none'}
window.fsCard=k=>{if(G&&G.st=='card'&&G.stT>.35)cardKeep(!!k)};
function modal(h){const m=$f('fh_modal');if(!m)return;if(h){m.innerHTML=h;m.style.display='block'}else m.style.display='none'}
function pauseCard(){const g=G;if(!g||!g.on)return;if(JO)return;g.paused=!g.paused;
 if(g.paused){g.hold=false;modal(`<h2>Paused</h2><p>${E(g.sp.n)} · ${g.sess.n} caught this trip${g.sess.n?' · '+money(g.sess.cash)+' worth':''}</p><p style="opacity:.8">Hold the mouse or SPACE to cast. Small dips are nibbles: wait. A big dunk is a bite: press SPACE. In the reel, HOLD lifts the green bar and letting go sinks it: keep the fish inside it until the meter is full. Q / E change spot, J journal.</p><div class=row><button onclick="fsQuit()">LEAVE THE PIER</button><button onclick="fsJrn()">JOURNAL</button><button class=go onclick="fsResume()">RESUME</button></div>`)}
 else modal(null)}
function resumeCard(){if(G&&G.paused)pauseCard()}
window.fsResume=resumeCard;window.fsJrn=()=>openJournal(1);
window.fsQuit=function(){if(!G)return;G.paused=false;modal(null);G.fadeT=1;const g=G;setTimeout(()=>{try{if(G===g)exitSession()}catch(e){soft(e,'quit')}},420)};

/* ---------- the Journal: every entry, silhouettes for the ones you have not met ---------- */
let JO=null,jCSS=null;
const BEST=(s,arr)=>{let b=0;arr.forEach((v,i)=>{if(v>arr[b])b=i});return b};
function condText(s,full){const bi=BEST(s,s.bd),ti=s.tm.map((v,i)=>[v,i]).filter(a=>a[0]>=1.15).map(a=>TODN[a[1]]),bn=s.bd.map((v,i)=>[v,i]).filter(a=>a[0]>=.8).map(a=>BANDN[a[1]]);
 const bt=BORD.filter(b=>(s.bt[b]||0)>=1.25).map(b=>BAITS[b].n.toLowerCase());let t='Found in: '+(bn.join(', ')||BANDN[bi]);if(ti.length&&ti.length<4)t+=' · Best at: '+ti.join(', ');
 if(full){if(bt.length)t+=' · Likes: '+bt.join(', ');const wx=s.wx.map((v,i)=>[v,i]).filter(a=>a[0]>=1.25).map(a=>WXN[a[1]].toLowerCase());if(wx.length)t+=' · Weather: '+wx.join(', ');const td=s.td.map((v,i)=>[v,i]).filter(a=>a[0]>=1.3).map(a=>TIDEN[a[1]].toLowerCase());if(td.length)t+=' · Tide: '+td.join(', ');if(s.rod>0)t+=' · Needs: '+RODS[s.rod].n}else if(s.rod>0)t+=' · Needs a better rod';return t}
function openJournal(fromSession){if(JO||away())return;if(!fromSession&&mode!='play'&&mode!='menu')return;const prev=mode;JO={prev,from:!!fromSession,sel:null,flt:'all'};
 if(!fromSession)mode='menu';
 if(!jCSS){jCSS=document.createElement('style');jCSS.id='fishjcss';jCSS.textContent=`#fishjrn{position:fixed;inset:0;z-index:30;background:rgba(6,22,30,.94);color:#fff;font-family:Silkscreen,'Courier New',monospace;display:flex;flex-direction:column;padding:16px 20px;overflow:hidden}
#fishjrn *{box-sizing:border-box}#fishjrn h1{font-weight:normal;font-size:26px;margin:0;color:#ffd27a}#fishjrn .fjhd{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
#fishjrn .fjpc{flex:1;min-width:220px}#fishjrn .fjpc i{display:block;height:12px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25)}#fishjrn .fjpc u{display:block;height:100%;background:linear-gradient(90deg,#7ff3ff,#ffd27a);text-decoration:none}
#fishjrn .fjst{font-size:11px;opacity:.85;line-height:1.7}#fishjrn button{font:inherit;font-size:12px;padding:7px 12px;background:#16424c;color:#fff;border:2px solid #7ff3ff;cursor:pointer}#fishjrn button.on{background:#7ff3ff;color:#06202a}
#fishjrn .fjbd{display:flex;gap:16px;flex:1;min-height:0}#fishjrn .fjgd{flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;align-content:start;padding:2px 6px 10px 2px}
#fishjrn .fjjc{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.18);padding:8px;text-align:center;cursor:pointer;font-size:10px;line-height:1.5}#fishjrn .fjjc:hover,#fishjrn .fjjc.sel{background:rgba(255,210,122,.14);border-color:#ffd27a}
#fishjrn .fjjc .fjar{height:64px;display:flex;align-items:center;justify-content:center}#fishjrn .fjjc canvas,#fishjrn .fjjc img{max-width:100%;max-height:64px;width:auto;height:auto}#fishjrn .fjjc b{display:block;font-weight:normal;font-size:12px}
#fishjrn .fjdt{width:min(330px,36vw);overflow:auto;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.2);padding:12px;font-size:11px;line-height:1.7}#fishjrn .fjdt h2{font-weight:normal;font-size:20px;margin:6px 0 2px}
#fishjrn .fjdt .fjar{display:flex;justify-content:center;padding:8px;background:radial-gradient(circle,rgba(127,243,255,.22),rgba(0,0,0,0) 70%)}#fishjrn .fjdt canvas,#fishjrn .fjdt img{max-width:100%;height:auto}
@media (max-width:760px){#fishjrn .fjbd{flex-direction:column}#fishjrn .fjdt{width:100%;max-height:36vh}}`;document.head.appendChild(jCSS)}
 const d=document.createElement('div');d.id='fishjrn';document.body.appendChild(d);JO.el=d;jRender();if(fromSession)modal(null)}
function jRender(){const J=JO;if(!J)return;const o=st(),found=SP.filter(s=>o.caught[s.id]&&o.caught[s.id].n>0),pct=Math.round(found.length/SP.length*100),fish=SP.filter(s=>s.k=='f'),ff=fish.filter(s=>o.caught[s.id]&&o.caught[s.id].n).length;
 const list=SP.filter(s=>J.flt=='all'||(J.flt=='fish'?s.k=='f':s.k!='f')).slice().sort((a,b)=>(a.k=='f'?0:1)-(b.k=='f'?0:1)||a.r-b.r||a.i-b.i);
 const tot=Object.values(o.caught).reduce((a,q)=>a+q.n,0),rec=o.rec&&o.rec.id?SPI[o.rec.id]:null;
 J.el.innerHTML=`<div class=fjhd><h1>Fish Journal</h1><div class=fjpc><div class=fjst>${found.length} of ${SP.length} entries found · ${pct}% complete · fish ${ff} of ${fish.length}</div><i><u style="width:${pct}%"></u></i></div>
 <div class=fjst>Total caught ${tot}<br>Heaviest ${rec?E(rec.n)+' '+fmtW(o.rec.w):'none yet'}<br>Earned from fish ${money(o.earn)}</div>
 <div><button class="${J.flt=='all'?'on':''}" onclick="fsJf('all')">ALL</button> <button class="${J.flt=='fish'?'on':''}" onclick="fsJf('fish')">FISH</button> <button class="${J.flt=='other'?'on':''}" onclick="fsJf('other')">JUNK &amp; TREASURE</button> <button onclick="fsJc()">CLOSE [J]</button></div></div>
 <div class=fjbd><div class=fjgd id=jgd></div><div class=fjdt id=jdt></div></div>`;
 const gd=J.el.querySelector('#jgd');list.forEach(s=>{const rc=o.caught[s.id],hv=rc&&rc.n>0,col=s.k=='f'?RARC[s.r]:s.k=='t'?RARC[3]:JUNKC,c=document.createElement('div');c.className='fjjc'+(J.sel===s.id?' sel':'');c.style.borderTopColor=col;c.style.borderTopWidth='4px';
  const ar=document.createElement('div');ar.className='fjar';ar.appendChild(fishImg(s.id,120,64,!hv));c.appendChild(ar);
  const t=document.createElement('div');t.innerHTML=hv?`<b>${E(s.n)}</b><span style="color:${col}">${s.k=='f'?RAR[s.r]:s.k=='t'?'Treasure':'Junk'}</span><br>Best ${fmtW(rc.best)}${s.k=='f'?' · '+rc.len+' cm':''}<br>Caught x${rc.n}`:`<b>???</b><span style="color:${col}">${s.k=='f'?RAR[s.r]:s.k=='t'?'Treasure':'Junk'}</span><br><span style="opacity:.7">not found yet</span>`;c.appendChild(t);c.onclick=()=>{J.sel=s.id;jRender()};gd.appendChild(c)});
 const dt=J.el.querySelector('#jdt'),sel=J.sel?SPI[J.sel]:null;
 if(!sel)dt.innerHTML='<b style="color:#ffd27a">How to fill the journal</b><br>Click an entry. Fish depend on how far out your line lands, the time of day, the weather, the tide, your bait and your rod. A better rod reaches deeper water and handles bigger fish.<br><br>Dark shapes are fish you have not met yet. The hint under each one tells you where to look.';
 else{const rc=o.caught[sel.id],hv=rc&&rc.n>0,col=sel.k=='f'?RARC[sel.r]:sel.k=='t'?RARC[3]:JUNKC;dt.innerHTML=`<div class=fjar id=jbig></div><h2 style="color:${col}">${hv?E(sel.n):'???'}</h2><span style="color:${col}">${sel.k=='f'?RAR[sel.r]:sel.k=='t'?'Treasure':'Junk'}</span><br>${hv?E(sel.tx):'A shape in the water. Catch one to learn its name.'}<br><br>${hv?'Heaviest '+fmtW(rc.best)+(sel.k=='f'?' · longest '+rc.len+' cm':'')+'<br>Caught x'+rc.n+' · first on day '+rc.first+'<br>Worth about '+money(sel.pr)+' each<br><br>':''}<span style="color:#7ff3ff">${E(condText(sel,hv))}</span>`;
  const big=dt.querySelector('#jbig');if(big)big.appendChild(fishImg(sel.id,260,150,!hv))}}
window.fsJf=f=>{if(JO){JO.flt=f;jRender()}};window.fsJc=()=>closeJournal();
function closeJournal(){const J=JO;if(!J)return;JO=null;try{J.el.remove()}catch(e){}if(!J.from){mode=J.prev=='menu'&&$('ui')&&$('ui').innerHTML?'menu':'play'}else if(G&&G.paused)modal(null)}
addEventListener('keydown',e=>{if(G&&G.on)return;const k=keyName(e);if(JO){if(k=='escape'||k=='j'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)closeJournal()}return}
 if(k=='j'&&!e.repeat&&mode=='play'&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||'')&&(Object.keys(st().caught).length||Math.hypot(P.x-FX,P.z-ZE)<150)){e.stopImmediatePropagation();openJournal(0)}},true);

/* ---------- the hut: sell, rods, bait; Mara; the board ---------- */
let SHT='sell';
const cashIn=n=>{S.money=+((S.money||0)+n).toFixed(2);S.earn=(S.earn||0)+n;const o=st();o.earn+=n;o.sold+=1;spl('cash')};
function shopHTML(){const o=st(),inv=o.inv.map((q,i)=>({q,i})).sort((a,b)=>b.q.v-a.q.v),tot=o.inv.reduce((a,q)=>a+q.v,0),keepT=o.inv.filter(q=>SPI[q.id].r<2||SPI[q.id].k!='f').reduce((a,q)=>a+q.v,0);
 const tab=(id,n)=>`<button class="pesong ${SHT==id?'go':''}" style="flex:1;text-align:center${SHT==id?';background:#ffd27a;color:#2a1c0a':''}" onclick="fsTab('${id}')">${n}</button>`;
 let body='';
 if(SHT=='sell'){body=`<p class=pebl>Salty buys what is in your bucket (${o.inv.length}/40). Rare fish also make a good gift for Old Mara. Fresh fish pay by size and rarity.</p><div class=row2 style="display:flex;gap:8px;margin:0 0 8px"><button onclick="fsSellAll(0)" ${o.inv.length?'':'disabled'}>Sell all (${money(tot)})</button><button onclick="fsSellAll(1)" ${keepT?'':'disabled'}>Sell all but rare+ (${money(keepT)})</button></div><div class=pelist style="max-height:300px;overflow:auto">${inv.length?inv.map(({q,i})=>{const s=SPI[q.id],c=s.k=='f'?RARC[s.r]:s.k=='t'?RARC[3]:JUNKC;return`<button class=pesong onclick="fsSell(${i})"><b style="color:${c}">${E(s.n)} <span style="float:right">${money(q.v)}</span></b><small>${fmtW(q.w)} · ${q.l} cm · ${s.k=='f'?RAR[s.r]:s.k=='t'?'treasure':'junk'} · tap to sell</small></button>`}).join(''):'<p class=pesm>Your bucket is empty. Go and catch something.</p>'}</div>`}
 else if(SHT=='rods'){body=`<p class=pebl>Better rods cast further (deeper water) and reel harder fish. You have ${money(S.money||0)}.</p><div class=pelist>${RODS.map((r,i)=>{const own=o.rods>>i&1,eq=o.rod==i;return`<button class=pesong onclick="${own?`fsEquip(${i})`:`fsBuyRod(${i})`}" style="${eq?'outline:3px solid #ffd27a':''}"><b>${E(r.n)} <span style="float:right">${eq?'EQUIPPED':own?'OWNED: equip':money(r.price)}</span></b><small>Reach ${r.reach} m · strength ${r.pow}x · reel ${Math.round(r.reel*1000/75)/10}x · ${E(r.tx)}</small></button>`}).join('')}</div>`}
 else{body=`<p class=pebl>Bait decides who bites. Worms are free. Packs cost money but bring the better fish. You have ${money(S.money||0)}.</p><div class=pelist>${BORD.map(id=>{const b=BAITS[id],n=id=='worm'?'free':o.baits[id]|0,eq=o.bait==id;return`<div class=pesong style="display:flex;flex-direction:row;gap:8px;align-items:center;${eq?'outline:3px solid #ffd27a':''}"><span style="flex:1"><b>${E(b.n)} <small style="display:inline">${id=='worm'?'unlimited':'x'+n}</small></b><small>${E(b.tx)}</small></span>${id=='worm'?'':`<button onclick="fsBuyBait('${id}')">${b.pack} for ${money(b.price)}</button>`}<button onclick="fsUseBait('${id}')" ${id!='worm'&&!n?'disabled':''}>${eq?'IN USE':'USE'}</button></div>`}).join('')}</div>`}
 return`<div class="box modal pe" style="width:min(620px,95vw)"><div class=pehd><span class=pek>Pier Fishing</span><h2>Salty's Bait &amp; Tackle</h2></div><div class=pebd><div style="display:flex;gap:6px;margin-bottom:8px">${tab('sell','Sell fish')}${tab('rods','Rods')}${tab('bait','Bait')}</div>${body}<div class=row2 style="display:flex;gap:8px"><button onclick="fsJournalBtn()">Fish journal</button><button onclick="closeUI()">Leave</button></div></div></div>`}
function openShop(){if(mode!='play'||away())return;mode='menu';try{$('ui').innerHTML=shopHTML()}catch(e){soft(e,'shop')}}
const reShop=()=>{if(mode=='menu'&&$('ui')&&$('ui').querySelector('.pek')&&/Bait/.test($('ui').innerHTML))try{$('ui').innerHTML=shopHTML()}catch(e){}};
window.fsTab=t=>{SHT=t;reShop()};
window.fsSell=i=>{const o=st(),q=o.inv[i];if(!q)return;o.inv.splice(i,1);cashIn(q.v);sv();reShop();say2('Sold '+SPI[q.id].n+' for '+money(q.v))};
window.fsSellAll=m=>{const o=st();let t=0,n=0;o.inv=o.inv.filter(q=>{const s=SPI[q.id];if(m&&s.k=='f'&&s.r>=2)return true;t+=q.v;n++;return false});if(!n)return;cashIn(t);sv();reShop();say2('Sold '+n+' for '+money(t))};
window.fsBuyRod=i=>{const o=st(),r=RODS[i];if(o.rods>>i&1)return;if((S.money||0)<r.price){spl('err');return say2('The '+r.n+' costs '+money(r.price)+'.')}S.money=+((S.money||0)-r.price).toFixed(2);S.spent=(S.spent||0)+r.price;o.rods|=1<<i;o.rod=i;spl('cash');sv();reShop();say2(r.n+' is yours. Casts '+r.reach+' m.')};
window.fsEquip=i=>{const o=st();if(!(o.rods>>i&1))return;o.rod=i;sn('pop');sv();reShop()};
window.fsBuyBait=id=>{const o=st(),b=BAITS[id];if((S.money||0)<b.price){spl('err');return say2(b.pack+' '+b.n.toLowerCase()+' costs '+money(b.price)+'.')}S.money=+((S.money||0)-b.price).toFixed(2);S.spent=(S.spent||0)+b.price;o.baits[id]=(o.baits[id]|0)+b.pack;o.bait=id;spl('cash');sv();reShop()};
window.fsUseBait=id=>{const o=st();if(id!='worm'&&!(o.baits[id]|0))return;o.bait=id;sn('pop');sv();reShop()};
window.fsJournalBtn=()=>openJournal(0);
const MARA=["The sea bass hide under the pier when the tide comes in. Try a live minnow.","Dawn and dusk, that is when they really bite. Same as my knees.","Fog? Stay home. Storm? Even better. The big ones love a storm.","Never strike on a nibble. A nibble is the fish saying hello.","When it dashes, chase it with the green bar: up or down, it will not stay put. Keep it in the bar and the line fills.","The golden koi only comes at sunrise, in calm water, for bread dough. I have seen it once. In 1998.","Glow jelly after dark. The deep fish think it is a tiny lantern."];
function openMara(){if(mode!='play')return;mode='menu';const o=st(),gifts=o.inv.map((q,i)=>({q,i})).filter(({q})=>SPI[q.id].k=='f'&&SPI[q.id].r>=1).sort((a,b)=>b.q.v-a.q.v).slice(0,8),tip=MARA[(dayNo()+(o.gifted|0))%MARA.length];
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(560px,94vw)"><div class=pehd><span class=pek>Pier Fishing</span><h2>Old Mara</h2></div><div class=pebd><p class=pebl>"${E(tip)}"</p><p class=pebl style="opacity:.85">She loves a good fish. Give her an uncommon or better one and she pays more than the shop, and sometimes shares her bait.</p><div class=pelist>${gifts.length?gifts.map(({q,i})=>{const s=SPI[q.id];return`<button class=pesong onclick="fsGift(${i})"><b style="color:${RARC[s.r]}">${E(s.n)} <span style="float:right">${money(Math.round(q.v*2.2))}</span></b><small>${fmtW(q.w)} · ${RAR[s.r]} · give to Mara</small></button>`}).join(''):'<p class=pesm>Nothing worth gifting in your bucket yet.</p>'}</div><div class=row2><button onclick="closeUI()">Thanks, Mara</button></div></div></div>`}
window.fsGift=i=>{const o=st(),q=o.inv[i];if(!q||mode!='menu')return;const s=SPI[q.id];o.inv.splice(i,1);const pay=Math.round(q.v*2.2);cashIn(pay);o.gifted++;let extra='';if(s.r>=2){const b=pk(['minnow','shrimp','glow']);o.baits[b]=(o.baits[b]|0)+3;extra=' She also hands you 3 '+BAITS[b].n.toLowerCase()+'.'}
 sv();const n=NPC.find(p=>p.k=='mara');if(n)n.bub={t:pk(['Lovely! Just lovely!','Oh, you spoil me.','Dinner is sorted!']),l:3.5};closeUI();say2('Mara pays '+money(pay)+' for the '+s.n+'.'+extra)};
function openBoard(){if(mode!='play')return;const e=env(),tl=tideList(dayNo()),o=st();say2('Today: '+WXN[e.wx]+', '+TIDEN[e.tide].toLowerCase()+'. '+tl.slice(0,4).map(q=>q[1]+' '+clk(q[0])).join(', ')+'.');setTimeout(()=>say2('Biting well today: '+SPI[e.hot].n+'.'),900);if(Object.keys(o.caught).length)setTimeout(()=>openJournal(0),1800)}
function talkPete(){const o=st(),un=SP.filter(s=>s.k=='f'&&!(o.caught[s.id]&&o.caught[s.id].n)&&s.r<=3);const s=un.length?pk(un):null;
 const n=NPC.find(p=>p.k=='pete');if(n)n.bub={t:s?'Heard of a '+s.n+'?':'You have seen it all!',l:3};
 say2(s?'Pete: "'+condText(s,false)+' ... that is what I hear about the '+s.n+'."':'Pete: "You have met every fish I know. Impressive."')}

/* ---------- the maps: the pier, the hut roof, the board and the boat from above, and the label ---------- */
try{if(!POIS.some(q=>q[2]=='Pier Fishing'))POIS.push([FX-6,ZE+6,'Pier Fishing','#3fd0ff'])}catch(e){}
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){const r=m0.apply(this,arguments);try{x.save();x.lineJoin='round';x.translate(sx(FX),sz(ZE));x.scale(kx,kz);const fine=kx>.25;
  const R=(cx,cz,w,d,col)=>{x.fillStyle=col;x.fillRect(cx-w/2,cz-d/2,w,d)},Q=(cx,cz,w,d,col)=>{R(cx+.4,cz+.4,w,d,'rgba(0,0,0,.25)');R(cx,cz,w,d,col)};
  Q(0,-18,4.6,38.5,'#9a6a3c');Q(0,4,4.6,6,'#b98a52');Q(0,-40,19,6.4,'#9a6a3c');if(fine){for(let z=-35;z<0;z+=4)R(0,z,4.6,.18,'#5a3a22');for(let xx=-8;xx<=8;xx+=4)R(xx,-40,.18,6.4,'#5a3a22')}
  Q(-15.75,6.75,9,6.8,'#2f4a63');R(-15.75,6.75,.5,7,'#243a50');if(fine){R(-15.75,6.75,9,.3,'#6a8aa6');R(-9.6,6.8,1.6,3.4,'#22405e')}
  Q(5.3,5.2,3.6,.7,'#c99a5c');Q(12.5,-5.5,1.6,3.7,'#4a7aa4');if(fine)R(12.5,-5.5,.9,3,'#c99a5c');
  [[-25.5,12.4],[-10,15],[14.5,13.2],[17.5,6]].forEach(([a,b])=>{x.fillStyle='#2f8a3a';x.beginPath();x.arc(a,b,2.4,0,6.283);x.fill();x.fillStyle='#5cc05a';x.beginPath();x.arc(a,b,1,0,6.283);x.fill()});
  if(fine){x.fillStyle='#ffd27a';ANIM.lights.forEach(l=>{x.beginPath();x.arc(l[0],l[2],.5,0,6.283);x.fill()});x.fillStyle='#d9483b';ANIM.buoys.forEach(b=>{x.beginPath();x.arc(b.g.position.x,b.g.position.z,.8,0,6.283);x.fill()})}
  x.restore()}catch(e){try{x.restore()}catch(e2){}}return r}}

/* ---------- glue: build when you come near, interactions, animals, light, standing on the planks ---------- */
let intDone=false,HY2=0,ANT=0;
function nightK(){const t=S.t||0,f=t<240?0:t<300?(t-240)/60*.5:t<330?.5+(t-300)/30*.4:.9;return clamp((f-.1)/.62,0,1)}
function lightsTick(){const k=nightK(),wx=wxNow();if(ANIM.glMat)ANIM.glMat.color.setScalar(.62+.38*k);const o=k*(wx==2?.8:1);ANIM.halos.forEach(h=>h.material.opacity=o*.85);ANIM.pools.forEach(p=>p.material.opacity=o*.5);if(ANIM.win)ANIM.win.material.opacity=.15+o*.5}
{const h0=hit;hit=function(x,z,r){try{if(BUILT&&!IN&&mode!='drive'&&(inMain(x-FX,z-ZE)||inHead(x-FX,z-ZE))){r=r||.4;return cols.some(c=>x+r>c[0]&&x-r<c[2]&&z+r>c[1]&&z-r<c[3])?1:0}}catch(e){}return h0.apply(this,arguments)}}
{const w1=worldTick;worldTick=function(dt){const r=w1.apply(this,arguments);try{
 if(mode=='title'||away())return r;dt=dt||.016;
 const dd=Math.hypot(P.x-FX,P.z-ZE);
 if(!BUILT&&dd<470&&typeof buildChar=='function')buildSite();
 if(!BUILT)return r;
 root.visible=dd<520||!!G;
 if(!intDone){intDone=true;const hs=lw(-9.4,7);
  INT.push({x:hs[0],z:hs[1],r:3.6,l:"Salty's Bait & Tackle: rods, bait, sell fish",a:()=>openShop(),fi:1});
  const bs=lw(5.3,7.3);INT.push({x:bs[0],z:bs[1],r:3,l:'Read the fishing board',a:()=>openBoard(),fi:2});
  SPOTS.forEach((s,i)=>INT.push({x:s.wx,z:s.wz,r:s.s=='sand'?2.3:1.7,l:'Fish here: '+s.n,a:()=>startSession(i),fi:3}));
  const mp=lw(-1.2,-21),pp=lw(-5.3,-41.2);INT.push({x:mp[0],z:mp[1],r:2.4,l:'Talk to Old Mara',a:()=>openMara(),fi:4});INT.push({x:pp[0],z:pp[1],r:2.2,l:'Talk to Pete',a:()=>talkPete(),fi:5})}
 if(root.visible){if(!ppBuilt&&dd<220)buildPeople();ANT+=dt;lightsTick();
  if((dd<320&&(!window.FW_ZONE||FW_ZONE.seen(root,25)))||G){/* v55.29.0: animated only while the pier is on screen */ANIM.buoys.forEach(b=>{b.g.position.y=b.y+Math.sin(ANT*1.3+b.ph)*.05;b.g.rotation.z=Math.sin(ANT*.9+b.ph)*.1;b.g.rotation.x=Math.sin(ANT*1.1+b.ph*2)*.08});
   if(ppBuilt){npcTick(dt,ANT);bubbleTick()}
   if(!ANIM.animals&&ppBuilt){ANIM.animals=1;mkCat('#d98a3a','#fff3d9',-3.2,-41.85,DECK+.5,Math.PI);mkCat('#3a3a42','#e8e8ee',1.3,-31.5,DECK+.5,Math.PI/2);
    mkGull(-2.05,DECK+3.15,-33,.8);mkGull(9.3,DECK+.95,-43,2.4);mkGull(-15.75,5.55,4.6,1.2);mkGull(12.5,.45,-5.5,-.6);ANIM.gulls[0].home[1]=DECK+3.15;ANIM.gulls[1].home[1]=DECK+1.0}
   ANIM.cats.forEach(c=>catTick(c,dt,ANT));ANIM.gulls.forEach(o=>gullTick(o,dt,ANT))}}
 if(G&&G.on){P.x=G.sp.wx;P.z=G.sp.wz;SY=G.sp.y;simTick(dt);lureUpdateSafe(dt)}
 else if(!IN&&P.mesh&&dd<80&&mode=='play'){const h=walkY(P.x,P.z);HY2+=(h-HY2)*Math.min(1,dt*10);SY=HY2;P.mesh.position.y=HY2}else if(Math.abs(HY2)>.01&&mode=='play'){HY2*=1-Math.min(1,dt*10);SY=HY2}
 }catch(e){soft(e,'glue')}return r}}
function lureUpdateSafe(dt){try{if(G&&G.on)lureUpdate(dt)}catch(e){soft(e,'lure')}}

window.FW_FISH={SP,SPI,RODS,BAITS,SPOTS,st,env,weights,rollSpecies,rollFish,newReel,reelStep,skillOf,priceOf,artOf,artCanvas,tideAt,tideList,hotOf,bandOfU,uAt,wU,aimLand,openJournal,closeJournal,openShop,openMara,drawBoard,root,ANIM,NPC,FX,ZE,DECK,
 fish3,geoOf,swim,irDraw,drawFishTo,fishImg,FM,get G(){return G},get JO(){return JO},start:i=>startSession(i==null?4:i),exit:()=>{if(G)exitSession()},key:(k,d)=>{if(d){GK[k]=1;GKd[k]=1;if(k==' '){if(G){G.hold=true;G.pressed=1}}if(k=='w'&&G)G.pressW=1;if(k=='s'&&G)G.pressS=1}else{delete GK[k];if(k==' '&&G){G.hold=false}}},
 tick:dt=>{if(G){simTick(dt);lureUpdateSafe(dt)}},poseFrame,catchFish,keepFish,cardKeep,startBite,doHook,startReel,landLure,planWait,nightK,spl,buildSite,get built(){return BUILT},force:null,pauseCard,fmtW,gullDive,catBeg,SOL,mast}
})();
