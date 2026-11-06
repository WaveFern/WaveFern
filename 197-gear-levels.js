/* ---------- v49.48.0: gear goes up to level 5, and six new gear lines ----------
   Every gear line now has 5 levels (GMAX in 52-gear-shop-plus.js) instead of 3. Levels 4 and 5 cost a lot more (x4 and then x4.5 the
   price of the level before) and count x1.5 on their quality or stream bonus (gearX in 52). They are locked behind higher Fame Levels.
   Old saves keep the level they had: 0 to 3 mean exactly what they did, and the two new levels are waiting above them.
   Six new lines (GY, which works like GX in 52): Plugin suite, Mastering chain, Tape machine, Merch stand, Press kit and
   Livestream rig. They have no studio model yet; they show a small preview in the shop and in the Upgrades list.
   Loads after 101 (which sets the old prices) and 187 (the Upgrades screen reads GEAR). Wrapped so nothing leaks. */
(()=>{
const MORE={chair:['Massage recliner','Golden throne'],mic:['Ribbon mic','Vintage tube legend'],guitar:['Boutique archtop','Signature guitar'],promo:['Billboard campaign','Global ad blitz'],
 keys:['Vintage organ rig','Concert grand'],drums:['Pro studio kit','Gold-plated kit'],booth:['Floating room','Mastering suite'],decks:['Festival decks','Light-up deck rig'],
 phones:['Custom in-ear monitors','Mastering reference cans'],iface:['Pro converter stack','Flagship digital hub'],monitors:['Soffit-mounted monitors','Reference wall'],
 pedals:['Handmade rack','Dream rig'],bass:['Fretless custom','Signature bass'],sampler:['Vintage sampler','Legendary sampler'],vocal:['Dual-channel chain','Hall of fame chain'],
 synth:['Analog wall','Museum collection'],treat:['Floating floor','Concert-hall room'],desk:['Analog legend console','Dream console'],content:['Camera crew','Broadcast studio']};
/* the six new lines. c = price of levels 1 to 5, fl = fame tier needed to buy each level (-1 = open) */
const NEW={
 plugins:{n:'Plugin suite',d:'Polish every mix',lv:['Free plugins','Basic effects','Channel strips','Full mix suite','Analog-modelled set','Every plugin made'],b:400,q:3,fl:[0,1,2,3,5]},
 mastering:{n:'Mastering chain',d:'Loud, clean finishes',lv:['No mastering','Online mastering','Limiter and EQ','Hardware chain','Mastering suite','Legendary mastering house'],b:600,q:4,fl:[1,2,3,4,6]},
 tape:{n:'Tape machine',d:'Warmth on everything',lv:['No tape','Cassette 4-track','Reel-to-reel','Pro tape machine','Two-inch machine','Tape vault'],b:800,q:3,fl:[1,2,4,5,7]},
 merch:{n:'Merch stand',d:'Fans spread the word',lv:['No merch','Handmade stickers','Printed tees','Online store','Tour merch line','Global brand'],b:300,s:.04,fl:[-1,0,1,3,5]},
 press:{n:'Press kit',d:'Blogs and radio pick you up',lv:['No press kit','One page bio','Photos and bio','Publicist','PR agency','Global press team'],b:500,s:.05,fl:[0,1,2,4,6]},
 stamina:{n:'Energy pack',d:'More energy: you walk much further before you tire',lv:['Tired legs','Water bottle','Trainers','Fitness band','Energy drinks','Peak fitness'],b:150,fl:[-1,-1,0,1,3]},
 live:{n:'Livestream rig',d:'Play for fans live',lv:['No rig','Webcam stream','Multi-camera stream','Pro stream room','Broadcast truck','Satellite uplink'],b:700,s:.06,fl:[0,1,3,5,7]}};
const MAXT=(typeof FT!='undefined'?FT.length:12)-1;
/* 1) old lines: two more level names, two more prices, two more fame locks */
Object.keys(MORE).forEach(k=>{const G=GEAR[k];if(!G||G.lv.length>5)return;G.lv.push(...MORE[k]);const c=G.c,c3=Math.round(c[2]*4);c.push(c3,Math.round(c3*4.5));
 if(G.fl){const b=Math.max(G.fl[2],0);G.fl.push(Math.min(MAXT,b+2),Math.min(MAXT,b+4))}else G.fl=[-1,-1,-1,2,4]});
/* 2) new lines */
Object.keys(NEW).forEach(k=>{if(GEAR[k])return;const o=NEW[k],c=[1,6,36,160,720].map(m=>Math.round(o.b*m)),G={n:o.n,d:o.d,lv:o.lv,c,fl:o.fl};if(o.q)G.q=o.q;if(o.s)G.s=o.s;
 GEAR[k]=G;GY[k]=G;if(o.q)GQ[k]=o.q;if(o.s)GSB[k]=o.s});
gfill();
/* shop sections */
const sec=n=>GCAT.find(c=>c[0]==n)[1];sec('Recording').push('plugins','mastering','tape');sec('Recording').push('stamina');sec('Getting heard').push('merch','press','live');
/* small previews for the new lines (l is 0 to 3) */
Object.assign(GXM,{
 plugins:l=>[[.5,.34,.05,'#15181d',0,.5,0],[.44,.26,.02,['#2c3e50','#1f6f5a','#6a3a8a','#8a1c2a'][l],0,.5,.04],...Array.from({length:l+1},(_,i)=>[.06,.04,.02,'#2fe68a',-.15+i*.1,.5,.06]),[.2,.2,.04,'#333',0,.2,0]],
 mastering:l=>[[.5,.12*(l+2),.34,'#2a2d33',0,.06*(l+2),0],...Array.from({length:l+1},(_,i)=>[.44,.02,.01,i%2?'#aab3bd':'#ffb000',0,.1+i*.11,.18])],
 tape:l=>[[.5,.34,.3,['#4a4a4a','#3a2a1a','#6a6a6a','#2a2d33'][l],0,.17,0],[.16,.16,.02,'#ddd',-.12,.3,.16],[.16,.16,.02,'#ddd',.12,.3,.16],[.04,.04,.03,'#c0392b',0,.12,.16]],
 merch:l=>[[.9,.05,.4,'#6b4a2e',0,.7,0],[.06,.7,.06,'#3a2a1a',-.4,.35,0],[.06,.7,.06,'#3a2a1a',.4,.35,0],...Array.from({length:l+1},(_,i)=>[.2,.14,.04,['#e84393','#3498db','#f1c40f','#2ecc71'][i],-.3+i*.2,.8,0])],
 press:l=>[...Array.from({length:l+1},(_,i)=>[.3,.02,.4,i%2?'#f0efe8':'#d9d6c8',0,.02+i*.03,0]),[.2,.02,.03,'#2c3e50',0,.04+l*.03,.1]],
 stamina:l=>[[.2,.5,.2,['#9aa3ad','#3498db','#2ecc71','#f1c40f'][Math.min(3,l|0)],0,.25,0],[.12,.12,.12,'#ecf0f1',0,.55,0]],
 live:l=>[[.04,1,.04,'#222',0,.5,0],[.3,.04,.3,'#222',0,.02,0],[.22,.14,.14,'#111',0,1.05,0],[.08,.08,.08,'#c0392b',.09,1.1,.08],...(l>=1?[[.5,.5,.03,'#223',.45,.9,0]]:[]),...(l>=2?[[.14,.1,.1,'#111',-.3,.9,0]]:[]),...(l>=3?[[.9,.5,.03,'#1f6f5a',-.7,.9,0]]:[])]});
/* models only know levels 0 to 3: levels 4 and 5 show as the top model */
{const g0=gm;gm=(k,l)=>g0(k,Math.max(0,Math.min(3,l|0)))}
/* saves that already hold gear: nothing to move, levels 0 to 3 stay as they were; clamp anything out of range */
try{if(S&&S.gear)gfill()}catch(e){console.error('gear levels',e)}
})();
