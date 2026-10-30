/* ---------- Threadz mega drop: 71 more clothes in streetwear, sportswear, designer, vintage and stage ----------
   Appended to GAR after the earlier drops, so every older id stays the same (saves keep working).
   New styles: tops 16-37, jackets 9-23, bottoms 9-20, hats 12-20, extras 10-22. They plug into the new-drop wrapper
   (XNEW + the base style tables in 50-threadz-new-drop.js), use the canvas prints from 60-threadz-prints.js for
   logos, graphics and all-over patterns, and have their own shop and wardrobe previews. Brand names are made up. */
const GAR1=GAR.length,XCATN={street:'Streetwear',sport:'Sportswear',designer:'Designer',vintage:'Vintage',stage:'Stage'};
/* [name, price, style, default colour, fame tier (index into FTL) or undefined, category] */
const gA3=(slot,a)=>{gA2(slot,a);const g=GAR[GAR.length-1];g.cat=a[5];GM[g.id]=g};
[['Logo Hoodie',72,16,'#2c3e50',,'street'],['Box Logo Tee',40,17,'#f4f4f4',,'street'],['Band Tour Tee',38,18,'#111111',,'vintage'],['Football Shirt',65,19,'#2f6fb5',,'sport'],
 ['Basketball Jersey',60,20,'#800020',,'sport'],['Tie-Dye Tee',34,21,'#9b59b6',,'vintage'],['Rugby Shirt',68,22,'#1f3a6e',0,'vintage'],['Hawaiian Shirt',55,23,'#1abc9c',,'vintage'],
 ['Ribbed Tank',22,24,'#f4f4f4',,'street'],['Oversized Tee',45,25,'#7f8c8d',,'street'],['Cropped Hoodie',58,26,'#e88aa6',,'street'],['Sequin Top',240,27,'#d9c8a0',1,'stage'],
 ['Mesh Stage Top',150,28,'#111111',1,'stage'],['Monogram Tee',320,29,'#5a3a22',2,'designer'],['Ringer Tee',32,30,'#f4f4f4',,'vintage'],['Cable Cardigan',85,31,'#d9c8a0',0,'vintage'],
 ['Quarter-zip Fleece',70,32,'#6b8e5a',,'sport'],['Sports Crop Top',36,33,'#111111',,'sport'],['Compression Top',48,34,'#2c3e50',,'sport'],['Silk Shirt',280,35,'#800020',2,'designer'],
 ['Corset Top',190,36,'#111111',1,'stage'],['Pixel Gamer Tee',30,37,'#2c3e50',,'street']].forEach(a=>gA3('top',a));
[['Track Jacket',85,9,'#111111',,'sport'],['Coach Jacket',95,10,'#1f3a6e',,'street'],['Racing Jacket',210,11,'#c0392b',1,'street'],['Cloud Puffer',260,12,'#f4f4f4',1,'designer'],
 ['Patch Denim Jacket',140,13,'#2f6fb5',0,'vintage'],['Faux Fur Coat',480,14,'#e88aa6',2,'stage'],['Sequin Blazer',520,15,'#bdc3c7',3,'stage'],['Studded Leather Jacket',380,16,'#111111',2,'stage'],
 ['Anorak',110,17,'#e67e22',,'sport'],['Tour Jacket',300,18,'#111111',2,'stage'],['Harrington Jacket',120,19,'#d9c8a0',0,'vintage'],['Shearling Aviator',650,20,'#5a3a22',3,'designer'],
 ['Tech Shell',190,21,'#2c3e50',1,'sport'],['Kimono Jacket',340,22,'#1f3a6e',2,'designer'],['Chore Coat',105,23,'#6b8e5a',0,'vintage']].forEach(a=>gA3('jk',a));
[['Basketball Shorts',40,9,'#800020',,'sport'],['Parachute Pants',78,10,'#111111',,'street'],['Plaid Trousers',90,11,'#c0392b',0,'vintage'],['Leather Pants',260,12,'#111111',2,'stage'],
 ['Flared Jeans',72,13,'#3498db',,'vintage'],['Sweat Shorts',30,14,'#7f8c8d',,'street'],['Cargo Joggers',55,15,'#6b8e5a',,'street'],['Denim Mini Skirt',45,16,'#3498db',,'street'],
 ['Bike Shorts',28,17,'#111111',,'sport'],['Sequin Trousers',310,18,'#bdc3c7',2,'stage'],['Carpenter Jeans',68,19,'#2f6fb5',,'vintage'],['Pinstripe Trousers',230,20,'#2c3e50',1,'designer']].forEach(a=>gA3('bt',a));
[['Fitted Logo Cap',38,12,'#111111',,'street'],['Durag',18,13,'#111111',,'street'],['Monogram Bucket Hat',260,14,'#5a3a22',2,'designer'],['Top Hat',150,15,'#111111',1,'stage'],
 ['Fisherman Beanie',26,16,'#e67e22',,'street'],['Camp Cap',34,17,'#6b8e5a',,'vintage'],['Stage Crown',900,18,'#f1c40f',3,'stage'],['Sweatband',12,19,'#f4f4f4',,'sport'],['Trapper Hat',70,20,'#2c3e50',0,'vintage']].forEach(a=>gA3('ht',a));
[['Cuban Link Chain',420,10,'#f1c40f',2,'designer'],['Iced Pendant',750,11,'#bdc3c7',3,'designer'],['Mini Shoulder Bag',380,12,'#5a3a22',2,'designer'],['Belt Bag',45,13,'#111111',,'street'],
 ['Aviator Shades',85,14,'#f1c40f',,'vintage'],['Star Shades',60,15,'#e84393',0,'stage'],['Diamond Studs',520,16,'#f4f4f4',3,'designer'],['Wristbands',14,17,'#f4f4f4',,'sport'],
 ['Leather Gloves',75,18,'#111111',0,'stage'],['Feather Boa',120,19,'#e84393',1,'stage'],['All-Access Pass',200,20,'#111111',1,'stage'],['Bow Tie',40,21,'#111111',,'designer'],
 ['Silver Bracelets',150,22,'#bdc3c7',0,'designer']].forEach(a=>gA3('ac',a));

/* base styles the shared parts borrow (tops: 0 tee, 1 hoodie, 4 tank, 8 long sleeve; jackets: 0 shell, 1 hood, 2 long, 3 quilted; bottoms: 0 long, 1 shorts, 3 wide) */
Object.assign(XTOPB,{16:1,17:0,18:0,19:0,20:4,21:0,22:8,23:0,24:4,25:0,26:1,27:4,28:8,29:0,30:0,31:8,32:8,33:4,34:8,35:8,36:4,37:0});
Object.assign(XJKB,{9:0,10:0,11:0,12:3,13:0,14:2,15:0,16:0,17:1,18:0,19:0,20:0,21:1,22:2,23:0});
Object.assign(XBTB,{9:1,10:3,11:0,12:0,13:0,14:1,15:0,16:1,17:1,18:0,19:3,20:0});
for(let t=16;t<=37;t++)XTSL[t]=[.25,.5,.5,.3,0,.25,.5,.3,.5][XTOPB[t]];
XTNOHEM.push(16,20,25,26,27,31,33,36);XTNOCUFF.push(16,19,22,25,26,28,30,31,32,35);

/* ---- artwork for the drop ---- */
const XTZ='#ff3d81',xRnd=s=>{let h=s;return()=>(h=(h*1103515245+12345)>>>0)/4294967296};
const xpHue=(c,dh)=>{const k=new THREE.Color(c),o={};k.getHSL(o);return'#'+new THREE.Color().setHSL((o.h+dh+1)%1,Math.max(.5,o.s),Math.min(.6,Math.max(.42,o.l))).getHexString()};
const xpSpark=(x,cx,cy,R,col)=>{x.fillStyle=col;x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,q=i%2?R*.28:R;x.lineTo(cx+q*Math.cos(a),cy+q*Math.sin(a))}x.closePath();x.fill()};
const xpBolt=(x,bx,by,s,col)=>{x.fillStyle=col;x.beginPath();[[0,0],[14,0],[6,16],[16,16],[-4,44],[2,22],[-8,22]].forEach(([a,b],i)=>i?x.lineTo(bx+a*s,by+b*s):x.moveTo(bx+a*s,by+b*s));x.closePath();x.fill()};
const xpPatch=(x,cx,cy,r,bg,st)=>{x.fillStyle=bg;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();x.save();x.setLineDash([5,4]);x.lineWidth=3;x.strokeStyle=st;x.beginPath();x.arc(cx,cy,r-6,0,7);x.stroke();x.restore()};
/* Threadz own logo */
XPR.thzarc={s:[256,160],f:(x,W,H,c)=>{const ink=xpInk(c);xpArc(x,'THREADZ',128,300,230,48,'blk',ink,{st:XTZ,lw:8,sp:2,ma:1.05});xpStar(x,128,116,16,7,5,XTZ);xpT(x,'WORLDWIDE',128,146,16,'sans',ink,{mw:150})}};
XPR.thzback={s:[256,256],f:(x,W,H,c)=>{const ink=xpInk(c);xpT(x,'THREADZ',128,96,64,'blk',ink,{st:XTZ,lw:10,mw:236});[40,216].forEach(p=>xpStar(x,p,146,10,4,5,XTZ));xpT(x,'WORLDWIDE',128,146,22,'blk',XTZ,{mw:150});x.fillStyle=ink;x.fillRect(40,172,176,3);xpT(x,'EST. 2026 · WAVEFERN CITY',128,196,15,'sans',ink,{mw:220})}};
XPR.thzsl={s:[64,160],f:(x,W,H,c)=>{x.save();x.translate(32,80);x.rotate(-Math.PI/2);xpT(x,'THREADZ',0,0,30,'blk',xpInk(c),{mw:150});x.restore()}};
XPR.thzsm={s:[128,64],f:(x,W,H,c)=>xpT(x,'THREADZ',64,32,28,'blk',xpInk(c),{mw:118})};
XPR.boxlogo={s:[256,96],f:(x,W,H,c)=>{const dark=xlum(c)<.3,bg=dark?'#f4f4f4':'#111111',fg=dark?'#111111':'#f4f4f4';x.fillStyle=bg;xpRR(x,8,10,240,76,12);x.fill();x.font=xfont('blk',50);x.textBaseline='middle';
 const a=x.measureText('LOW').width,b=x.measureText('KEY').width,s=Math.min(1,216/(a+b));x.save();x.translate(128-(a+b)*s/2,50);x.scale(s,1);x.fillStyle=fg;x.fillText('LOW',0,0);x.fillStyle='#2fe68a';x.fillText('KEY',a,0);x.restore()}};
/* Band Tour Tee: NEON GHOSTS */
XPR.band={s:[256,256],f:(x,W,H,c)=>{const p='#ff4fd8',q='#3ff6ff',ink=xpInk(c);x.save();x.shadowColor=p;x.shadowBlur=12;x.strokeStyle=p;x.lineWidth=6;x.beginPath();x.arc(128,136,70,0,7);x.stroke();x.restore();
 x.fillStyle='#f4f4f4';x.beginPath();x.arc(128,124,38,Math.PI,0);x.lineTo(166,174);for(let i=0;i<4;i++){x.lineTo(156-i*19,162);x.lineTo(147-i*19,174)}x.lineTo(90,174);x.closePath();x.fill();
 x.fillStyle='#111';[[114,122],[142,122]].forEach(([a,b])=>{x.beginPath();x.ellipse(a,b,7,10,0,0,7);x.fill()});xpBolt(x,40,108,1.1,q);xpBolt(x,206,108,1.1,q);
 x.save();x.shadowColor=q;x.shadowBlur=8;xpArc(x,'NEON GHOSTS',128,136,92,30,'blk',q,{ma:2.3});x.restore();xpT(x,'LIVE · LOUD · LATE',128,236,18,'sans',ink,{mw:220})}};
XPR.tour={s:[256,300],f:(x,W,H,c)=>{const ink=xpInk(c),p='#ff4fd8';xpT(x,'NEON GHOSTS',128,28,34,'blk',p,{mw:236});xpT(x,'WORLD TOUR 2026',128,62,22,'blk',ink,{mw:220});x.fillStyle=ink;x.fillRect(40,80,176,3);
 [['03.14','WAVEFERN CITY'],['03.18','SKYLINE ARENA'],['03.22','NORTH PIER'],['03.27','THE FERN BOWL'],['04.02','HARBOUR HALL'],['04.06','MAPLE PARK'],['04.11','NEON DOME'],['04.15','HOMETOWN']].forEach(([d,n],i)=>{const y=104+i*24;xpT(x,d,50,y,16,'blk',p);xpT(x,n,152,y,16,'sans',ink,{mw:140})})}};
/* Football Shirt and Basketball Jersey */
XPR.skylark={s:[256,96],f:(x,W,H,c)=>{const ink=xpInk(c);x.fillStyle=ink;x.beginPath();x.moveTo(14,54);x.quadraticCurveTo(40,16,68,42);x.quadraticCurveTo(84,20,108,24);x.quadraticCurveTo(86,40,76,62);x.quadraticCurveTo(46,48,14,54);x.fill();xpT(x,'SKYLARK',180,40,40,'blk',ink,{mw:140});xpT(x,'AIR',180,76,20,'sans',ink,{mw:100})}};
XPR.crest={s:[112,128],f:(x,W,H,c)=>{const a=xlum(c)>.5,bg=a?'#1f3a6e':'#f4f1e8',fg=a?'#f4f1e8':'#1f3a6e';x.fillStyle=bg;x.beginPath();x.moveTo(12,14);x.lineTo(100,14);x.lineTo(100,64);x.quadraticCurveTo(100,104,56,122);x.quadraticCurveTo(12,104,12,64);x.closePath();x.fill();x.strokeStyle='#e6b422';x.lineWidth=5;x.stroke();xpT(x,'WFC',56,54,30,'blk',fg,{mw:80});xpStar(x,56,90,12,5,5,'#e6b422')}};
XPR.kitback={s:[256,256],f:(x,W,H,c,v)=>{const ink=xpInk(c);xpT(x,String(v||'WAVEFERN').toUpperCase().slice(0,12),128,34,34,'blk',ink,{mw:220});xpT(x,'10',128,148,150,'con',ink,{mw:200})}};
XPR.bball={s:[256,200],f:(x,W,H,c)=>{const{ink,out}=xpTeam(c);xpT(x,'Waves',128,60,80,'scr',ink,{st:out,lw:8,mw:236});xpT(x,'7',128,150,84,'blk',ink,{st:out,lw:10})}};
XPR.bballb={s:[256,256],f:(x,W,H,c,v)=>{const{ink,out}=xpTeam(c);xpArc(x,String(v||'WAVEFERN').toUpperCase().slice(0,12),128,280,230,38,'blk',ink,{sp:3,ma:1.1});xpT(x,'7',128,164,150,'blk',ink,{st:out,lw:14})}};
XPR.rugby={s:[96,112],f:(x,W,H,c)=>{const a=xlum(c)>.5,fg=a?'#1f3a6e':'#f4f1e8';x.fillStyle='#c0392b';[0,1,2,3,4].forEach(i=>{const t=i*1.2566;x.beginPath();x.arc(48+Math.cos(t)*12,46+Math.sin(t)*12,13,0,7);x.fill()});x.fillStyle='#e6b422';x.beginPath();x.arc(48,46,8,0,7);x.fill();x.fillStyle='#2e7d32';x.beginPath();x.ellipse(30,74,6,12,.8,0,7);x.fill();x.beginPath();x.ellipse(66,74,6,12,-.8,0,7);x.fill();xpT(x,'WRFC',48,98,18,'blk',fg,{mw:80})}};
XPR.osback={s:[256,200],f:(x,W,H,c)=>{const ink=xpInk(c);xpT(x,'SEE YOU',128,52,52,'blk',ink,{mw:230});xpT(x,'AT THE SHOW',128,108,38,'blk',ink,{mw:236});[60,128,196].forEach(p=>xpStar(x,p,150,11,5,5,XTZ));xpT(x,'WAVEFERN LIVE',128,184,18,'sans',ink,{mw:200})}};
XPR.osfront={s:[96,96],f:(x,W,H,c)=>{xpStar(x,48,48,40,17,5,XTZ);xpStar(x,48,48,22,9,5,xpInk(c))}};
/* NOVA: the sports brand */
XPR.nova={s:[128,128],f:(x,W,H,c)=>{const ink=xpInk(c);xpSpark(x,64,46,40,ink);xpT(x,'NOVA',64,106,34,'blk',ink,{mw:116})}};
XPR.novab={s:[256,200],f:(x,W,H,c)=>{const ink=xpInk(c),ac=xlum(c)>.55?'#e74c3c':'#2fe68a';xpSpark(x,128,64,56,ac);xpT(x,'NOVA',128,146,62,'blk',ink,{mw:220});xpT(x,'ATHLETICS',128,188,20,'sans',ink,{mw:160})}};
XPR.novaband={s:[256,48],f:(x,W,H,c)=>{const ink=xpInk(c);[0,1,2].forEach(i=>{xpT(x,'NOVA',44+i*84,25,24,'blk',ink,{mw:56});xpSpark(x,86+i*84,24,10,ink)})}};
XPR.peak={s:[128,112],f:(x,W,H,c)=>{const ink=xpInk(c);x.strokeStyle=ink;x.lineWidth=7;x.lineJoin='round';x.beginPath();x.moveTo(14,74);x.lineTo(50,24);x.lineTo(70,50);x.lineTo(84,34);x.lineTo(114,74);x.stroke();xpT(x,'SUMMIT',64,96,26,'blk',ink,{mw:116})}};
/* vintage and street graphics */
XPR.radio={s:[256,200],f:(x,W,H,c)=>{const ink=xpInk(c),ac=xlum(c)>.55?'#c0392b':'#ffb347';x.strokeStyle=ink;x.lineWidth=6;x.beginPath();x.arc(128,76,56,0,7);x.stroke();xpT(x,'88.1',128,68,40,'blk',ac);xpT(x,'FM',128,100,18,'blk',ink);
 [0,1,2].forEach(i=>[0,Math.PI].forEach(o=>{x.beginPath();x.arc(128,76,70+i*13,o-.55,o+.55);x.stroke()}));xpT(x,'WAVE RADIO',128,160,34,'blk',ink,{mw:236});xpT(x,'ON AIR SINCE 1988',128,190,14,'sans',ink,{mw:200});
 x.save();x.globalCompositeOperation='destination-out';const r=xRnd(3);for(let i=0;i<900;i++){x.fillStyle=`rgba(0,0,0,${.3+r()*.7})`;x.fillRect(r()*W,r()*H,1+r()*3,1+r()*2)}x.restore()}};
XPR.pixel={s:[256,220],f:(x,W,H,c)=>{const ink=xpInk(c),Q=10,G=['..XXXXXXXXXXXX..','.XXXXXXXXXXXXXX.','XXX.XXXXXXXXXRXX','XX...XXXXXXXBXGX','XXX.XXXXXXXXXYXX','XXXXXXXXXXXXXXXX','XXXXX......XXXXX','.XXX........XXX.'],K={X:ink,R:'#e74c3c',B:'#3498db',G:'#2ecc71',Y:'#f1c40f'};
 G.forEach((row,j)=>[...row].forEach((q,i)=>{if(K[q]){x.fillStyle=K[q];x.fillRect(48+i*Q,26+j*Q,Q,Q)}}));xpT(x,'PRESS START',128,148,28,'pix',xlum(c)>.55?'#c0392b':'#2fe68a',{mw:232});xpT(x,'1UP  000000',128,190,16,'pix',ink,{mw:200})}};
XPR.crew={s:[256,200],f:(x,W,H,c)=>{const ink=xpInk(c);xpArc(x,'THREADZ',128,260,200,30,'blk',XTZ,{sp:4,ma:1});xpT(x,'CREW',128,112,78,'blk',ink,{mw:230});xpT(x,'TOUR STAFF 2026',128,176,20,'sans',ink,{mw:220})}};
XPR.crewf={s:[128,64],f:(x,W,H,c)=>{const ink=xpInk(c);xpT(x,'THREADZ',64,22,22,'blk',ink,{mw:116});xpT(x,'CREW',64,48,18,'sans',XTZ,{mw:80})}};
/* Racing Jacket patches */
XPR.turbo={s:[160,100],f:(x,W,H)=>{x.fillStyle='#c0392b';x.beginPath();x.ellipse(80,50,74,44,0,0,7);x.fill();x.strokeStyle='#f1c40f';x.lineWidth=6;x.stroke();xpT(x,'TURBO',80,42,34,'blk','#f1c40f',{mw:120});xpT(x,'OIL CO.',80,72,16,'blk','#f4f4f4',{mw:90})}};
XPR.nitro={s:[128,96],f:(x,W,H)=>{x.fillStyle='#111111';xpRR(x,4,8,120,80,10);x.fill();x.strokeStyle='#f4f4f4';x.lineWidth=3;x.stroke();xpBolt(x,22,22,1.1,'#f1c40f');xpT(x,'NITRO',76,48,28,'blk','#f4f4f4',{mw:76})}};
XPR.checks={s:[96,96],f:(x,W,H)=>{x.fillStyle='#d0d0d0';x.fillRect(12,8,5,82);for(let j=0;j<5;j++)for(let i=0;i<6;i++){x.fillStyle=(i+j)%2?'#111111':'#f4f4f4';x.fillRect(17+i*12,10+j*10+Math.sin(i)*3,12,10)}}};
XPR.racingb={s:[256,200],f:(x,W,H,c)=>{const ink=xpInk(c);for(let i=0;i<16;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#111111':'#f4f4f4';x.fillRect(i*16,8+j*12,16,12);x.fillRect(i*16,168+j*12,16,12)}xpT(x,'WAVEFERN',128,76,48,'blk',ink,{mw:236,st:'#c0392b',lw:6});xpT(x,'RACING TEAM',128,130,28,'blk','#f1c40f',{mw:220})}};
/* Patch Denim Jacket */
XPR.psmile={s:[96,96],f:(x,W,H)=>{x.fillStyle='#f1c40f';for(let i=0;i<12;i++){const a=i*Math.PI/6;x.beginPath();x.moveTo(48+Math.cos(a-.15)*30,48+Math.sin(a-.15)*30);x.lineTo(48+Math.cos(a)*46,48+Math.sin(a)*46);x.lineTo(48+Math.cos(a+.15)*30,48+Math.sin(a+.15)*30);x.fill()}
 xpPatch(x,48,48,32,'#f1c40f','#c0392b');x.fillStyle='#5a3a22';[[38,42],[58,42]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,4,0,7);x.fill()});x.strokeStyle='#5a3a22';x.lineWidth=4;x.beginPath();x.arc(48,52,12,.3,Math.PI-.3);x.stroke()}};
XPR.pstar={s:[96,96],f:(x,W,H)=>{xpPatch(x,48,48,44,'#c0392b','#f4f1e8');xpStar(x,48,50,28,12,5,'#f4f1e8')}};
XPR.pfern={s:[96,96],f:(x,W,H)=>{xpPatch(x,48,48,44,'#1f5a3a','#f1c40f');x.save();x.translate(18,16);x.scale(.5,.5);XPR.fern.f(x,128,128,'#111111');x.restore()}};
XPR.pback={s:[256,256],f:(x,W,H)=>{xpPatch(x,128,128,120,'#111111','#f1c40f');xpArc(x,'KEEP IT LOUD',128,128,90,30,'blk','#f1c40f',{ma:2.4});x.fillStyle='#e8e8e8';xpRR(x,92,112,72,92,8);x.fill();x.fillStyle='#333';[[128,140,16],[128,182,12]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill()});xpBolt(x,60,120,1.3,'#ff3d81');xpBolt(x,190,120,1.3,'#ff3d81')}};
XPR.studback={s:[256,200],f:(x,W,H)=>{const s='#e0e0e0';for(let i=0;i<9;i++){const a=i/8;[-1,1].forEach(k=>{x.fillStyle=s;x.beginPath();x.arc(128+k*(40+a*80),70+a*30-Math.sin(a*3)*20,7,0,7);x.fill()})}x.fillStyle=s;x.beginPath();x.arc(128,78,30,0,7);x.fill();x.fillRect(110,96,36,22);x.fillStyle='#111';[[116,76],[140,76]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,8,0,7);x.fill()});xpT(x,'NO SLEEP',128,164,34,'blk',s,{mw:220})}};
/* Tour Jacket */
XPR.tourchest={s:[192,96],f:(x,W,H,c)=>{const ink=xpInk(c);xpT(x,'WaveFern',96,50,52,'scr',ink,{st:XTZ,lw:4,mw:180});xpStar(x,170,22,10,4,5,'#e6b422')}};
XPR.tourback={s:[256,256],f:(x,W,H,c)=>{const ink=xpInk(c);x.strokeStyle='#e6b422';x.lineWidth=4;for(let i=0;i<16;i++){const a=i*Math.PI/8;x.beginPath();x.moveTo(128+Math.cos(a)*50,120+Math.sin(a)*50);x.lineTo(128+Math.cos(a)*74,120+Math.sin(a)*74);x.stroke()}xpStar(x,128,120,44,18,5,'#e6b422');xpStar(x,128,120,26,11,5,XTZ);
 xpArc(x,'WORLD TOUR',128,120,100,32,'blk',ink,{ma:1.8});xpT(x,"'26",128,226,38,'blk',ink)}};
/* hats */
XPR.fitted={s:[128,96],f:(x,W,H,c)=>{const ink=xpInk(c);xpT(x,'W',64,52,86,'ser',ink,{st:XTZ,lw:4});xpStar(x,98,22,12,5,5,XTZ);xpGrain(x,W,H,.12,6)}};
XPR.sidepatch={s:[96,96],f:(x,W,H)=>{xpPatch(x,48,48,44,'#f4f1e8','#c0392b');xpT(x,'2026',48,42,26,'blk','#1f3a6e',{mw:70});xpT(x,'TOUR',48,66,14,'blk','#c0392b')}};
XPR.campfire={s:[160,96],f:(x,W,H,c)=>{x.fillStyle='#f4f1e8';xpRR(x,4,6,152,84,14);x.fill();xpStitch(x,10,12,140,72,10,'#6b8e5a',2);x.fillStyle='#e67e22';x.beginPath();x.moveTo(28,70);x.lineTo(48,30);x.lineTo(68,70);x.closePath();x.fill();
 x.strokeStyle='#2f6fb5';x.lineWidth=4;x.beginPath();x.moveTo(24,78);x.quadraticCurveTo(36,70,48,78);x.quadraticCurveTo(60,86,72,78);x.stroke();xpT(x,'CAMP',112,36,26,'blk','#1d1d22',{mw:72});xpT(x,'WAVE',112,64,26,'blk','#e67e22',{mw:72})}};
/* extras */
XPR.pass={s:[160,224],f:(x,W,H,c,v)=>{x.fillStyle='#f4f4f4';xpRR(x,4,4,152,216,10);x.fill();x.fillStyle=XTZ;x.fillRect(4,22,152,44);xpT(x,'ALL ACCESS',80,44,24,'blk','#fff',{mw:140});x.fillStyle='#cfd6dc';x.fillRect(16,78,56,64);x.fillStyle='#7f8c8d';x.beginPath();x.arc(44,102,13,0,7);x.fill();x.fillRect(26,120,36,22);
 xpT(x,String(v||'ARTIST').toUpperCase().slice(0,10),116,96,16,'blk','#1d1d22',{mw:76});xpT(x,'ARTIST',116,120,12,'sans','#56695c',{mw:70});for(let i=0;i<30;i++){x.fillStyle='#1d1d22';x.fillRect(20+i*4,158,(i*7%3)+1,36)}xpT(x,'WAVEFERN WORLD TOUR',80,206,11,'sans','#1d1d22',{mw:140})}};
XPR.iced={s:[128,128],f:(x,W,H,c)=>{const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,xlt(c,.5));g.addColorStop(.5,dk(c,.75));g.addColorStop(1,dk(c,.45));x.fillStyle=g;xpRR(x,6,6,116,116,18);x.fill();x.strokeStyle=xlt(c,.7);x.lineWidth=5;x.stroke();
 xpT(x,'WF',64,66,72,'blk','#1d1d22',{st:'#1d1d22',lw:10,mw:108});const t=document.createElement('canvas');t.width=W;t.height=H;const y=t.getContext('2d');
 for(let j=0;j<H;j+=6)for(let i=0;i<W;i+=6){y.fillStyle=(i/6+j/6)%3?'#ffffff':'#9fdcff';y.beginPath();y.arc(i+3,j+3,2.8,0,7);y.fill()}y.globalCompositeOperation='destination-in';xpT(y,'WF',64,66,72,'blk','#fff',{mw:108});x.drawImage(t,0,0)}};
XPR.starlens={s:[128,128],f:(x,W,H,c)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,xlt(c,.35));g.addColorStop(1,dk(c,.55));xpStar(x,64,68,60,26,5);x.fillStyle=g;x.fill();x.lineWidth=8;x.strokeStyle='#1d1d22';x.lineJoin='round';x.stroke();x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(52,52,10,5,-.6,0,7);x.fill()}};
/* all-over patterns (the cloth colour is part of the artwork) */
XPR.tiedye={s:[256,256],f:(x,W,H,c)=>{const cs=[c,xpHue(c,.33),xpHue(c,.66)];x.fillStyle=xlt(c,.6);x.fillRect(0,0,W,H);x.filter='blur(5px)';x.lineCap='round';for(let i=0;i<110;i++){const a=i*.45,r=i*1.7;x.strokeStyle=cs[i%3];x.lineWidth=13;x.beginPath();x.arc(128,128,r,a,a+1.3);x.stroke()}x.filter='none'}};
XPR.hawaii={s:[256,256],f:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const r=xRnd(11),lf=xlum(c)>.5?'#2e7d32':'#5fd07a',fl=['#f4f4f4','#ff8fb1','#ffd27a'];
 for(let i=0;i<16;i++){const px=r()*W,py=r()*H,a=r()*6;x.fillStyle=lf;x.save();x.translate(px,py);x.rotate(a);x.beginPath();x.ellipse(0,-18,9,22,0,0,7);x.fill();x.restore()}
 for(let i=0;i<13;i++){const px=r()*W,py=r()*H,R=13+r()*8;x.fillStyle=fl[i%3];for(let k=0;k<5;k++){const a=k*1.2566+i;x.beginPath();x.ellipse(px+Math.cos(a)*R*.7,py+Math.sin(a)*R*.7,R*.55,R*.38,a,0,7);x.fill()}x.fillStyle='#e6b422';x.beginPath();x.arc(px,py,R*.25,0,7);x.fill()}}};
XPR.sequin={s:[256,256],f:(x,W,H,c)=>{x.fillStyle=dk(c,.55);x.fillRect(0,0,W,H);const r=xRnd(5);for(let j=0;j<19;j++)for(let i=0;i<19;i++){const px=i*14+(j%2)*7,py=j*14,k=r();x.fillStyle=k>.82?xlt(c,.7):k>.45?xlt(c,.25):dk(c,.85);x.beginPath();x.arc(px,py,6.5,0,7);x.fill();if(k>.9){x.fillStyle='#fff';x.beginPath();x.arc(px-2,py-2,1.8,0,7);x.fill()}}}};
XPR.mesh={s:[128,128],f:(x,W,H,c,v)=>{x.fillStyle=v||'#d99a6c';x.fillRect(0,0,W,H);x.strokeStyle=c;x.lineWidth=3;for(let i=-7;i<8;i++){x.beginPath();x.moveTo(i*21,0);x.lineTo(i*21+H,H);x.stroke();x.beginPath();x.moveTo(i*21,H);x.lineTo(i*21+H,0);x.stroke()}}};
XPR.mono={s:[256,256],f:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const t=xlum(c)>.55?dk(c,.62):'#cdb27a';for(let j=0;j<5;j++)for(let i=0;i<5;i++){const px=i*64+(j%2)*32,py=j*64;xpT(x,'V',px,py,30,'ser',t);x.save();x.translate(px+32,py+32);x.fillStyle=t;for(let k=0;k<4;k++){x.rotate(Math.PI/2);x.beginPath();x.arc(0,-6,5,0,7);x.fill()}x.restore()}}};
XPR.fur={s:[128,128],f:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const r=xRnd(9);x.lineWidth=2;x.lineCap='round';for(let i=0;i<900;i++){const px=r()*W,py=r()*H,a=1.2+r()*.8;x.strokeStyle=r()<.5?xlt(c,.28):dk(c,.78);x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*6,py+Math.sin(a)*8);x.stroke()}}};
XPR.tartan={s:[128,128],f:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);x.globalAlpha=.5;x.fillStyle=dk(c,.45);[16,80].forEach(p=>{x.fillRect(p,0,28,H);x.fillRect(0,p,W,28)});x.fillStyle='#14402a';x.fillRect(56,0,12,H);x.fillRect(0,56,W,12);x.globalAlpha=1;x.fillStyle=xlum(c)>.5?'#1d1d22':'#f1c40f';[4,112].forEach(p=>{x.fillRect(p,0,3,H);x.fillRect(0,p,W,3)})}};
XPR.wave={s:[256,256],f:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const l=xlt(c,.4);for(let j=0;j<18;j++)for(let i=-1;i<9;i++){const px=i*32+(j%2?16:0),py=j*16;[16,12,8,4].forEach((r,k)=>{x.fillStyle=k%2?c:l;x.beginPath();x.arc(px,py,r,0,7);x.fill()});x.fillStyle=c;x.beginPath();x.arc(px,py,16,0,7);x.lineWidth=1.5;x.strokeStyle=l;x.stroke()}}};
XPR.pinstripe={s:[128,128],f:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);x.fillStyle=xlt(c,.4);for(let i=0;i<8;i++)x.fillRect(6+i*16,0,1.6,H)}};

/* where each style's prints go (u across -.5..5, v up 0..1, pw width share); used by the character and the previews */
const XSP={top:{16:{f:[['thzarc',0,.6,.6]],b:[['thzback',0,.55,.78]],s:[['thzsl',.24,.08]]},17:{f:[['boxlogo',0,.68,.52]]},18:{f:[['band',0,.55,.78]],b:[['tour',0,.5,.72]]},
 19:{f:[['skylark',0,.52,.72],['crest',.26,.82,.15]],b:[['kitback',0,.55,.66]]},20:{f:[['bball',0,.48,.62]],b:[['bballb',0,.52,.66]]},22:{f:[['rugby',.26,.74,.14]]},
 25:{f:[['osfront',-.25,.82,.14]],b:[['osback',0,.6,.72]],dz:.025},26:{f:[['nova',.24,.76,.15]]},30:{f:[['radio',0,.56,.66]]},32:{f:[['peak',.26,.75,.16]]},33:{f:[['novaband',0,.5,.62]]},
 34:{f:[['nova',.26,.78,.14]]},37:{f:[['pixel',0,.55,.72]]}},
 jk:{9:{f:[['nova',.27,.78,.14]],b:[['novab',0,.58,.62]]},10:{f:[['crewf',.27,.8,.22]],b:[['crew',0,.55,.8]]},
 11:{f:[['turbo',-.26,.35,.25],['nitro',.26,.35,.2],['checks',.28,.8,.13]],b:[['racingb',0,.55,.82]],s:[['nitro',.14,.12]]},
 13:{f:[['psmile',.33,.35,.18],['pstar',-.3,.3,.17]],b:[['pback',0,.55,.7]],s:[['pfern',.24,.13]]},16:{b:[['studback',0,.55,.72]]},17:{f:[['peak',.28,.82,.14]]},
 18:{f:[['tourchest',-.27,.78,.3]],b:[['tourback',0,.55,.8]]},21:{f:[['peak',.27,.8,.13]]}}};

/* ---- drawing helpers ---- */
const xacc=c=>xlum(c)>.5?'#1f3a6e':'#f4f1e8',xArt=c=>c===ch&&S.artist?S.artist:'WAVEFERN';
/* swap the plain material of a colour for another on direct children (so other pieces keep theirs) */
function xSwap(objs,c,mat,skip){const pm=M(c);objs.forEach(o=>o&&o.children.forEach(m=>{if(m.isMesh&&m.material===pm&&m!==skip)m.material=mat}))}
const xGloss=(objs,c)=>xSwap(objs,c,xm('!'+c));
const xLegMat=(x,c,mat)=>x.legs.forEach(l=>xSwap([l],c,mat,xShoe(l)));
const xNeck=(x,c)=>xb(x.g,x.w*.42,.05,.02,xtone(c,.8),0,1.08,x.d/2-.005);
const xCuff=(x,c,y,h)=>x.arms.forEach(a=>xb(a,.182,h||.06,.232,c,0,-(y||.47),0));
const xHem=(x,c,y,h)=>xb(x.g,x.w+.012,h||.06,x.d+.012,c,0,y||.53,0);
const xBare=x=>[-1,1].forEach(s=>xb(x.g,x.w*.24,.1,x.d+.006,x.sk,s*(x.w/2-x.w*.12+.002),1.055,0));
const xJkClose=x=>{const wm=M('#f4f4f4'),m=x.g.children.find(m=>m.isMesh&&m.material===wm&&Math.abs(m.position.y-.8)<1e-6&&Math.abs(m.position.z-(x.d/2+.05))<1e-6);if(m)x.g.remove(m)};

/* ---- tops ---- */
XNEW.top[16]=(x,c)=>{if(x.jk)return;const{g,w,d}=x,t=xtone(c,.8),z=d/2;[-1,1].forEach(s=>{xb(g,.014,.14,.012,'#f4f4f4',s*.05,1.03,z+.006);xb(g,.022,.035,.018,'~#cfd3d8',s*.05,.95,z+.008)});xb(g,w*.6,.012,.006,t,0,.715,z+.032);
 xb(g,w*.8+.01,.03,.03,t,0,1.2,-d/2+.1);xHem(x,t);xCuff(x,t);xpPlace(x,'top',XSP.top[16],c)};
XNEW.top[17]=(x,c)=>{if(x.jk)return;xNeck(x,c);xpPlace(x,'top',XSP.top[17],c)};
XNEW.top[18]=(x,c)=>{if(x.jk)return;xNeck(x,c);xpPlace(x,'top',XSP.top[18],c)};
XNEW.top[19]=(x,c)=>{if(x.jk)return;const{g,w,d,arms}=x,ac=xacc(c),z=d/2;[-1,1].forEach(s=>{xb(g,.13,.035,.014,ac,s*.05,1.07,z+.004,0,0,s*.6);xb(g,.02,.58,.014,ac,s*(w/2+.004),.8,0)});xb(g,w*.5,.03,d*.6,ac,0,1.105,0);
 arms.forEach(a=>xb(a,.182,.04,.232,ac,0,-.235,0));xpPlace(x,'top',XSP.top[19],c,xArt(x.c))};
XNEW.top[20]=(x,c)=>{if(x.jk)return;const{g,w,d,sk}=x,ac=xacc(c),z=d/2;xBare(x);[-1,1].forEach(s=>{xb(g,.025,.2,d+.012,ac,s*(w/2-w*.24+.004),1.0,0);xb(g,.14,.03,.014,ac,s*.06,1.05,z+.004,0,0,s*.7);xb(g,.02,.48,.014,ac,s*(w/2+.004),.75,0)});
 xb(g,w*.2,.07,.012,sk,0,1.075,z+.002);xHem(x,ac,.52,.03);xpPlace(x,'top',XSP.top[20],c,xArt(x.c))};
XNEW.top[21]=(x,c)=>{if(x.jk)return;xSwap([x.g,...x.arms],c,xpSkinMat('tiedye',c));xNeck(x,c)};
XNEW.top[22]=(x,c)=>{if(x.jk)return;const{g,w,d,arms}=x,ac=xlum(c)>.5?'#1f3a6e':'#e6b422',z=d/2;[.62,.8,.98].forEach(y=>xb(g,w+.006,.09,d+.006,ac,0,y,0));arms.forEach(a=>{xb(a,.176,.09,.226,ac,0,-.12,0);xb(a,.182,.07,.232,'#f4f4f4',0,-.465,0)});
 [-1,1].forEach(s=>xb(g,w*.3,.07,.07,'#f4f4f4',s*w*.14,1.1,z-.005,0,0,s*.35));xb(g,w*.62,.08,d*.55,'#f4f4f4',0,1.12,-d*.2);xb(g,.07,.22,.014,'#f4f4f4',0,.98,z+.006);[1.03,.95].forEach(y=>xb(g,.03,.03,.012,'#d9c8a0',0,y,z+.014));xpPlace(x,'top',XSP.top[22],c)};
XNEW.top[23]=(x,c)=>{if(x.jk)return;const{g,w,d}=x,z=d/2,t=xtone(c,.85);xSwap([g,...x.arms],c,xpSkinMat('hawaii',c));[-1,1].forEach(s=>xb(g,w*.26,.07,.06,t,s*w*.15,1.08,z-.01,0,0,s*.5));xb(g,w*.2,.1,.01,x.sk,0,1.06,z+.002);
 xb(g,.035,.5,.012,t,.02,.78,z+.006);[.95,.8,.65].forEach(y=>xb(g,.03,.03,.012,'#f4f1e8',.02,y,z+.013))};
XNEW.top[24]=(x,c)=>{if(x.jk)return;const{g,w,d,sk}=x,t=xtone(c,.85),z=d/2;xBare(x);for(let i=0;i<9;i++){const px=-w*.4+i*w*.1;[1,-1].forEach(f=>xb(g,.008,.5,.006,t,px,.77,f*(z+.002)))}xb(g,w*.36,.08,.012,sk,0,1.065,z+.003);xb(g,w*.38,.015,.014,t,0,1.02,z+.004)};
XNEW.top[25]=(x,c)=>{if(x.jk)return;const{g,w,d,arms}=x,t=xtone(c,.85);xb(g,w+.05,.62,d+.05,c,0,.79,0);xb(g,w+.054,.04,d+.054,t,0,.5,0);arms.forEach(a=>{xb(a,.21,.34,.25,c,0,-.15,0);xb(a,.212,.03,.252,t,0,-.31,0)});xb(g,w*.44,.05,.03,xtone(c,.8),0,1.08,d/2+.01);xpPlace(x,'top',XSP.top[25],c)};
XNEW.top[26]=(x,c)=>{if(x.jk)return;const{g,w,d,sk}=x,t=xtone(c,.8),z=d/2,pk=g.children.find(m=>m.isMesh&&Math.abs(m.position.y-.64)<1e-6&&Math.abs(m.position.z-(d/2+.01))<1e-6);if(pk)g.remove(pk);
 xb(g,w+.004,.15,d+.004,sk,0,.575,0);xb(g,w+.014,.06,d+.014,t,0,.67,0);[-1,1].forEach(s=>xb(g,.014,.15,.012,'#f4f4f4',s*.05,1.0,z+.006));xCuff(x,t);xpPlace(x,'top',XSP.top[26],c)};
XNEW.top[27]=(x,c)=>{if(x.jk)return;const{g,w,d,sk}=x,z=d/2;xSwap([g],c,xpSkinMat('sequin',c,null,90));xBare(x);xb(g,w*.3,.1,.012,sk,0,1.06,z+.002);[-1,1].forEach(s=>xb(g,.025,.012,d*.9,'~#d8d8d8',s*w*.3,1.106,0))};
XNEW.top[28]=(x,c)=>{if(x.jk)return;xSwap([x.g,...x.arms],c,xpSkinMat('mesh',c,x.sk));xNeck(x,c);xCuff(x,c,.475,.05)};
XNEW.top[29]=(x,c)=>{if(x.jk)return;xSwap([x.g,...x.arms],c,xpSkinMat('mono',c));xNeck(x,c);xb(x.g,.08,.04,.012,'~#d4af37',-x.w*.3,.56,x.d/2+.006)};
XNEW.top[30]=(x,c)=>{if(x.jk)return;const{g,w,d,arms}=x,ac=xlum(c)>.55?'#c0392b':'#f4f1e8';xb(g,w*.44,.06,.03,ac,0,1.075,d/2-.003);xb(g,w*.44,.02,d*.5,ac,0,1.105,0);arms.forEach(a=>xb(a,.182,.05,.232,ac,0,-.225,0));xpPlace(x,'top',XSP.top[30],c)};
XNEW.top[31]=(x,c)=>{if(x.jk)return;const{g,w,d}=x,t=xtone(c,.8),z=d/2;xb(g,w*.3,.32,.01,'#f4f4f4',0,.94,z+.002);[-1,1].forEach(s=>{xb(g,.05,.62,.016,t,s*w*.16,.8,z+.004);xb(g,w*.22,.14,.016,c,s*w*.3,.66,z+.004);xb(g,w*.22,.02,.018,t,s*w*.3,.73,z+.006);
 [.32,.42].forEach(k=>xb(g,.012,.4,.008,t,s*w*k,.88,z+.002))});[.98,.86,.74,.62].forEach(y=>xb(g,.035,.035,.014,'#5a3a22',-w*.16,y,z+.012));xHem(x,t,.54,.07);xCuff(x,t,.46,.08)};
XNEW.top[32]=(x,c)=>{if(x.jk)return;const{g,w,d}=x,t=xtone(c,.8),z=d/2;xb(g,w*.5,.1,d*.62,c,0,1.14,0);xb(g,w*.5+.006,.012,d*.62+.006,t,0,1.188,0);xb(g,.016,.3,.01,'~#cfd3d8',0,.99,z+.004);xb(g,.03,.05,.014,'~#cfd3d8',0,.88,z+.008);xb(g,.016,.08,.01,'~#cfd3d8',0,1.14,d*.31+.004);
 [-1,1].forEach(s=>xb(g,.05,.58,d+.01,t,s*(w/2-.02),.8,0));xHem(x,t);xCuff(x,t);xpPlace(x,'top',XSP.top[32],c)};
XNEW.top[33]=(x,c)=>{if(x.jk)return;const{g,w,d,sk}=x,t=xtone(c,.8);xb(g,w+.004,.28,d+.004,sk,0,.64,0);xb(g,w+.012,.07,d+.012,t,0,.8,0);xBare(x);xb(g,w*.3,.08,.012,sk,0,1.065,d/2+.002);xb(g,w*.3,.14,.012,sk,0,1.02,-d/2-.002);xpPlace(x,'top',XSP.top[33],c)};
XNEW.top[34]=(x,c)=>{if(x.jk)return;const{g,w,d,arms}=x,ac=xacc(c);xGloss([g,...arms],c);[-1,1].forEach(s=>xb(g,.06,.58,d*.7,ac,s*(w/2-.026),.8,0));arms.forEach((a,i)=>xb(a,.006,.46,.03,ac,(i?1:-1)*.088,-.24,0));[-1,1].forEach(s=>xb(g,.022,.56,.01,ac,s*w*.36,.8,d/2+.004));xb(g,w*.4,.1,d*.55,'!'+c,0,1.14,0);xpPlace(x,'top',XSP.top[34],c)};
XNEW.top[35]=(x,c)=>{if(x.jk)return;const{g,w,d,arms,sk}=x,t=xtone(c,.85),z=d/2;xGloss([g,...arms],c);[-1,1].forEach(s=>xb(g,w*.3,.08,.07,'!'+t,s*w*.15,1.1,z-.01,0,0,s*.45));xb(g,w*.18,.14,.01,sk,0,1.04,z+.002);xb(g,.04,.42,.012,'!'+t,0,.74,z+.006);
 [.9,.78,.66].forEach(y=>xb(g,.028,.028,.012,'~#e8e0d0',0,y,z+.013));arms.forEach(a=>xb(a,.182,.07,.232,'!'+t,0,-.465,0))};
XNEW.top[36]=(x,c)=>{if(x.jk)return;const{g,w,d,sk}=x,t=dk(c,.6),z=d/2;xGloss([g],c);xBare(x);xb(g,w*.5,.08,.012,sk,0,1.07,z+.002);for(let i=0;i<6;i++)xb(g,.012,.56,.01,t,-w*.42+i*w*.168,.8,z+.004);
 for(let i=0;i<5;i++){const y=.6+i*.1;[-1,1].forEach(s=>{xb(g,.1,.01,.01,'#f4f1e8',0,y,z+.01,0,0,s*.5);xs(g,.012,'~#d8d8d8',s*.035,y,z+.008,6)})}};
XNEW.top[37]=(x,c)=>{if(x.jk)return;xNeck(x,c);xpPlace(x,'top',XSP.top[37],c)};

/* ---- jackets (front of the shell at d/2+.04) ---- */
XNEW.jk[9]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.04,st=xlum(c)>.55?'#1d1d22':'#f4f4f4',t=xtone(c,.75);xJkClose(x);xb(g,.018,.6,.01,'~#d0d0d0',0,.8,z+.006);xb(g,.035,.05,.014,'~#d0d0d0',0,1.04,z+.01);xb(g,w*.62,.11,d*.62+.08,c,0,1.15,0);
 arms.forEach((a,i)=>{const s=i?1:-1;[-.05,0,.05].forEach(o=>xb(a,.006,.46,.022,st,s*.088,-.25,o));xb(a,.182,.06,.232,t,0,-.47,0)});xb(g,w+.095,.05,d+.095,t,0,.525,0);xpPlace(x,'jk',XSP.jk[9],c)};
XNEW.jk[10]=(x,c)=>{const{g,w,d}=x,z=d/2+.04,t=xtone(c,.75);xJkClose(x);xb(g,.008,.58,.01,t,0,.8,z+.004);[1.0,.86,.72,.58].forEach(y=>xc(g,.018,.018,.012,'~#d0d0d0',w*.03,y,z+.008,Math.PI/2,0,0,8));
 [-1,1].forEach(s=>{xb(g,w*.32,.09,.03,c,s*w*.16,1.09,z,0,0,s*.4);xb(g,.015,.08,.015,'#1d1d22',s*w*.2,.48,z+.01)});xb(g,w+.095,.04,d+.095,t,0,.525,0);xpPlace(x,'jk',XSP.jk[10],c)};
XNEW.jk[11]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.04,ac=xlum(c)>.5?'#1d1d22':'#f4f4f4',t=xtone(c,.75);xJkClose(x);xb(g,w+.09,.1,d+.09,ac,0,.98,0);xb(g,w+.092,.025,d+.092,'#f1c40f',0,.915,0);
 arms.forEach(a=>{xb(a,.18,.1,.23,ac,0,-.12,0);xb(a,.182,.06,.232,t,0,-.47,0)});xb(g,.018,.6,.01,'~#d0d0d0',0,.8,z+.01);xb(g,w*.55,.1,d*.6+.08,c,0,1.15,0);xb(g,w+.095,.05,d+.095,t,0,.525,0);xpPlace(x,'jk',XSP.jk[11],c)};
XNEW.jk[12]=(x,c)=>{const{g,w,d,arms}=x,t=dk(c,.82),pc='!'+c;xJkClose(x);for(let i=0;i<6;i++)xb(g,w+.2,.09,d+.2,pc,0,.54+i*.105,0);for(let i=0;i<5;i++)xb(g,w+.17,.02,d+.17,t,0,.59+i*.105,0);xb(g,w*.85,.2,d*.85+.18,pc,0,1.17,0);
 arms.forEach(a=>{for(let j=0;j<4;j++)xb(a,.26,.1,.3,pc,0,-.07-j*.115,0)});xb(g,.02,.66,.01,'~#d0d0d0',0,.84,d/2+.105);xb(g,.04,.06,.016,'~#d0d0d0',0,1.08,d/2+.11)};
XNEW.jk[13]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.045,st='#d9a441';[-1,1].forEach(s=>{xb(g,.15,.12,.012,dk(c,.88),s*w*.3,.95,z+.002);xb(g,.16,.04,.014,dk(c,.75),s*w*.3,1.0,z+.004);xs(g,.018,'~#b87333',s*w*.3,.99,z+.012,6);xb(g,.006,.56,.014,st,s*w*.12,.8,z+.002)});
 xb(g,w+.1,.006,d+.1,st,0,.9,0);[.95,.8,.65].forEach(y=>xs(g,.02,'~#b87333',w*.22,y,z+.01,6));xb(g,w+.095,.05,d+.095,dk(c,.85),0,.525,0);arms.forEach(a=>xb(a,.182,.06,.232,dk(c,.85),0,-.47,0));xpPlace(x,'jk',XSP.jk[13],c)};
XNEW.jk[14]=(x,c)=>{const{g,w,d,arms}=x,fc=xlt(c,.12),fm=xpSkinMat('fur',fc);xSwap([g,...arms],c,xpSkinMat('fur',c));[xb(g,w+.18,.2,d+.2,fc,0,1.04,0),...arms.map(a=>xb(a,.24,.14,.29,fc,0,-.44,0)),xb(g,w+.16,.1,d+.16,fc,0,.18,0)].forEach(m=>m.material=fm)};
XNEW.jk[15]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.045;xSwap([g,...arms],c,xpSkinMat('sequin',c,null,90));[-1,1].forEach(s=>xb(g,.1,.34,.014,'!#111111',s*w*.17,.93,z+.004,0,0,-s*.3));xb(g,.09,.035,.012,'#f4f4f4',w*.3,.95,z+.004);arms.forEach(a=>xb(a,.182,.05,.232,'!#111111',0,-.47,0))};
XNEW.jk[16]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.045,st='~#e0e0e0';xGloss([g,...arms],c);[-1,1].forEach(s=>{xb(g,.12,.32,.016,'!'+dk(c,.85),s*w*.2,.93,z+.004,0,0,s*.28);for(let i=0;i<5;i++)xb(g,.022,.022,.022,st,s*(w*.08+i*w*.075),1.115,0);
 for(let i=0;i<5;i++)xb(g,.02,.02,.02,st,s*(w*.13+i*.012),1.06-i*.065,z+.016);xb(g,.14,.014,.01,'~#c0c0c0',s*w*.3,.68,z+.006,0,0,s*.5)});xb(g,.018,.5,.01,'~#d0d0d0',w*.2,.78,z+.006);xb(g,w+.1,.06,d+.1,'!'+dk(c,.8),0,.54,0);xpPlace(x,'jk',XSP.jk[16],c)};
XNEW.jk[17]=(x,c)=>{const{g,w,d}=x,z=d/2+.04,t=xtone(c,.8);xJkClose(x);xb(g,.016,.22,.01,'~#d0d0d0',0,.98,z+.006);xb(g,.03,.05,.014,'~#d0d0d0',0,.87,z+.01);xb(g,w*.7,.22,.03,t,0,.7,z+.012);xb(g,w*.6,.012,.01,'~#d0d0d0',0,.8,z+.03);
 [-1,1].forEach(s=>{xb(g,.012,.12,.012,'#1d1d22',s*.07,1.0,z+.01);xc(g,.016,.016,.03,'#1d1d22',s*.07,.93,z+.012,0,0,0,6)});xb(g,w+.095,.04,d+.095,t,0,.525,0);xpPlace(x,'jk',XSP.jk[17],c)};
XNEW.jk[18]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.045,rb=xlum(c)>.5?'#1d1d22':'#f4f1e8',t=xtone(c,.6);xGloss([g,...arms],c);xb(g,w+.1,.07,d+.1,t,0,.53,0);[.52,.545].forEach(y=>xb(g,w+.105,.008,d+.105,rb,0,y,0));
 arms.forEach(a=>{xb(a,.184,.06,.234,t,0,-.47,0);xb(a,.186,.008,.236,rb,0,-.465,0)});xb(g,w*.62,.07,d*.62+.08,t,0,1.13,0);[.98,.84,.7,.58].forEach(y=>xc(g,.016,.016,.012,'~#d0d0d0',w*.21,y,z+.006,Math.PI/2,0,0,8));xpPlace(x,'jk',XSP.jk[18],c)};
XNEW.jk[19]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.04,t=xtone(c,.8),tm=xpSkinMat('tartan','#b22222');xJkClose(x);xb(g,.016,.6,.01,'~#c9a227',0,.8,z+.006);xb(g,w*.66,.08,d*.66+.08,c,0,1.15,0);
 [-1,1].forEach(s=>{xb(g,w*.2,.08,.03,'#b22222',s*w*.13,1.09,z,0,0,s*.35).material=tm;xb(g,.16,.02,.012,t,s*w*.3,.66,z+.004,0,0,-s*.4)});xb(g,w+.1,.012,.01,t,0,1.0,-d/2-.046);
 xb(g,w+.095,.07,d+.095,t,0,.53,0);arms.forEach(a=>xb(a,.182,.07,.232,t,0,-.465,0));[1.06,1.13].forEach(y=>xs(g,.016,'#1d1d22',w*.06,y,z+.01,6))};
XNEW.jk[20]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.045,sh='#efe6d0',fm=xpSkinMat('fur',sh);xGloss([g,...arms],c);[xb(g,w+.2,.16,d+.22,sh,0,1.1,0),...[-1,1].map(s=>xb(g,.13,.36,.03,sh,s*w*.19,.92,z+.006,0,0,s*.22)),xb(g,w+.12,.08,d+.12,sh,0,.53,0),...arms.map(a=>xb(a,.22,.1,.27,sh,0,-.45,0))].forEach(m=>m.material=fm);
 [-1,1].forEach(s=>{xb(g,.06,.03,.24,'!#2a1a10',s*w*.42,1.12,d*.2);xb(g,.025,.03,.03,'~#c0c0c0',s*w*.42,1.12,d*.33)});xb(g,.018,.42,.01,'~#d0d0d0',w*.2,.76,z+.006)};
XNEW.jk[21]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.04,tp=dk(c,.7),rf='*#dfe9ee';xJkClose(x);xb(g,.022,.6,.01,dk(c,.5),0,.8,z+.006);[-1,1].forEach(s=>{xb(g,.012,.6,.012,tp,s*w*.25,.8,z+.004);xb(g,.15,.012,d*.9,tp,s*w*.32,1.105,0)});
 arms.forEach(a=>{xb(a,.176,.012,.226,tp,0,-.06,0);xb(a,.182,.035,.232,rf,0,-.3,0)});xb(g,w+.092,.03,d+.092,rf,0,.66,0);xb(g,w+.095,.05,d+.095,tp,0,.525,0);xb(g,w*.8+.02,.03,.04,tp,0,1.2,-d/2+.08);xpPlace(x,'jk',XSP.jk[21],c)};
XNEW.jk[22]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.045,ac=xlum(c)>.5?'#1d1d22':'#e6b422';arms.forEach(a=>xb(a,.26,.36,.34,c,0,-.2,0));xSwap([g,...arms],c,xpSkinMat('wave',c));[-1,1].forEach(s=>xb(g,.07,.75,.016,ac,s*w*.15,.68,z+.004,0,0,-s*.18));xb(g,w+.12,.12,d+.12,'#1d1d22',0,.6,0);xb(g,w+.125,.02,d+.125,ac,0,.6,0)};
XNEW.jk[23]=(x,c)=>{const{g,w,d,arms}=x,z=d/2+.04,t=xtone(c,.75),cd=dk(c,.6);xJkClose(x);xb(g,.006,.6,.01,t,w*.02,.8,z+.004);[1.02,.89,.76,.63].forEach(y=>xs(g,.02,'#2a1a10',w*.06,y,z+.01,6));
 [-1,1].forEach(s=>{xb(g,w*.3,.16,.012,c,s*w*.26,.62,z+.006);xb(g,w*.3+.004,.012,.014,t,s*w*.26,.7,z+.008);xb(g,w*.32,.09,.04,cd,s*w*.16,1.1,z-.005,0,0,s*.4)});xb(g,w*.24,.13,.012,c,-w*.26,.92,z+.006);xb(g,w*.24+.004,.012,.014,t,-w*.26,.985,z+.008);
 arms.forEach(a=>xb(a,.182,.06,.232,t,0,-.47,0));xb(g,w+.095,.03,d+.095,t,0,.51,0)};

/* ---- bottoms (leg pivots: the leg box ends at y -.42, front at d*.4) ---- */
XNEW.bt[9]=(x,c)=>{const{g,w,d}=x,ac=xacc(c);legEach(x,(l,s)=>{xb(l,w*.47,.34,d*.86,c,0,-.17,0);xb(l,.01,.32,d*.36,ac,s*(w*.235+.004),-.17,0);xb(l,w*.475,.03,d*.865,ac,0,-.325,0)});xb(g,w+.03,.07,d+.03,c,0,.5,0);xb(g,w+.035,.015,d+.035,ac,0,.52,0);
 [-1,1].forEach(s=>xb(g,.014,.09,.01,'#f4f4f4',s*.03,.45,d/2+.02));xprint(x.legs[1],'nova',c,.09,.09,0,-.24,d*.43+.004)};
XNEW.bt[10]=(x,c)=>{const{w,d}=x,t=xtone(c,.75);xLegMat(x,c,xm('!'+c));legEach(x,(l,s)=>{[-.12,-.3].forEach(y=>xb(l,w*.59,.01,d*.98,t,0,y,0));xb(l,.02,.12,.14,'!'+c,s*(w*.29+.01),-.2,0);xb(l,.022,.008,.12,'~#c0c0c0',s*(w*.29+.021),-.15,0);
 xc(l,.018,.018,.04,'#1d1d22',s*.04,-.47,d*.49,0,0,0,6);xb(l,.006,.06,.006,'#1d1d22',s*.04,-.44,d*.49)})};
XNEW.bt[11]=(x,c)=>{xLegMat(x,c,xpSkinMat('tartan',c));legEach(x,l=>xb(l,.008,.4,.01,xtone(c,.7),0,-.21,x.d*.4+.003))};
XNEW.bt[12]=(x,c)=>{const{w,d}=x;xLegMat(x,c,xm('!'+c));legEach(x,(l,s)=>{xb(l,.01,.4,.012,'!'+dk(c,.7),s*.03,-.21,d*.4+.004);xb(l,.006,.4,.03,'!'+dk(c,.7),s*(w*.21+.003),-.21,0)});xb(x.g,.016,.08,.01,'~#d0d0d0',0,.45,d*.42)};
XNEW.bt[13]=(x,c)=>{const{w,d}=x,st='#d9a441';legEach(x,(l,s)=>{xb(l,w*.5,.12,d*.9,c,0,-.37,.01);xb(l,w*.56,.06,d*.96,c,0,-.42,.015);xb(l,w*.565,.008,d*.965,st,0,-.445,.015);xb(l,.006,.3,.014,st,s*(w*.21+.003),-.15,0);xb(l,.012,.11,.01,st,s*w*.14,-.1,d*.4+.004,0,0,s*.6)});
 xb(x.g,w*.6,.035,d*.82,'#2a1a10',0,.49,0);xb(x.g,.05,.04,.016,'~#b87333',0,.49,d*.41+.006)};
XNEW.bt[14]=(x,c)=>{const{g,w,d}=x;legEach(x,l=>xb(l,w*.44,.03,d*.82,xlt(c,.25),0,-.235,0));xb(g,w+.02,.06,d+.02,xtone(c,.85),0,.5,0);[-1,1].forEach(s=>{xb(g,.014,.1,.01,'#f4f4f4',s*.035,.44,d/2+.016);xb(g,.02,.025,.014,'~#cfd3d8',s*.035,.39,d/2+.018)});xprint(x.legs[1],'thzsm',c,.11,.055,0,-.08,d*.4+.004)};
XNEW.bt[15]=(x,c)=>{const{g,w,d}=x,t=xtone(c,.75);legEach(x,(l,s)=>{xb(l,w*.4,.06,d*.76,t,0,-.4,0);xb(l,.03,.15,.16,c,s*(w*.21+.012),-.2,0);xb(l,.034,.05,.17,t,s*(w*.21+.014),-.13,0);xs(l,.012,'#1d1d22',s*(w*.21+.032),-.135,0,6)});[-1,1].forEach(s=>xb(g,.014,.09,.01,'#f4f4f4',s*.035,.45,d*.4+.02))};
XNEW.bt[16]=(x,c)=>{const{g,w,d}=x,st='#d9a441';xb(g,w+.07,.26,d+.07,c,0,.39,0);xb(g,w+.075,.008,d+.075,st,0,.275,0);xb(g,w+.08,.04,d+.08,dk(c,.88),0,.505,0);xs(g,.02,'~#b87333',0,.505,d/2+.042,6);
 [-1,1].forEach(s=>{xb(g,.006,.24,.012,st,s*w*.12,.39,d/2+.036);xb(g,.1,.008,.01,st,s*w*.3,.45,d/2+.037,0,0,s*.5)})};
XNEW.bt[17]=(x,c)=>{const{g,w,d}=x,ac=xacc(c);xLegMat(x,c,xm('!'+c));legEach(x,(l,s)=>xb(l,.006,.22,.03,ac,s*(w*.21+.003),-.12,0));xb(g,w+.014,.05,d+.014,'!'+dk(c,.85),0,.5,0);xprint(x.legs[1],'nova',c,.07,.07,0,-.13,d*.4+.004)};
XNEW.bt[18]=(x,c)=>{const{w}=x;xLegMat(x,c,xpSkinMat('sequin',c,null,90));legEach(x,(l,s)=>xb(l,.008,.4,.03,'~#e0e0e0',s*(w*.21+.004),-.21,0))};
XNEW.bt[19]=(x,c)=>{const{w,d}=x,st='#d9a441',z=d*.485;legEach(x,(l,s)=>{xb(l,w*.56,.16,.012,dk(c,.9),0,-.26,z+.004);[-.18,-.34].forEach(y=>xb(l,w*.56+.004,.006,.014,st,0,y,z+.006));xb(l,.006,.4,.014,st,s*(w*.29+.003),-.21,0)});
 const l=x.legs[1],r=x.legs[0];xb(l,.03,.14,.1,c,w*.29+.015,-.14,-.02);xb(l,.012,.02,.1,st,w*.29+.031,-.07,-.02);xb(r,.022,.1,.012,dk(c,.85),-(w*.29+.012),-.12,.06);xb(r,.022,.012,.04,dk(c,.85),-(w*.29+.012),-.17,.045)};
XNEW.bt[20]=(x,c)=>{const{w,d}=x;xLegMat(x,c,xpSkinMat('pinstripe',c));legEach(x,l=>{xb(l,.006,.38,.012,xlt(c,.3),0,-.2,d*.4+.004);xb(l,w*.43,.04,d*.81,dk(c,.9),0,-.4,0)})};

/* ---- hats (head pivot; head is a .55 cube, top at .275, face at z .275) ---- */
XNEW.ht[12]=(x,c)=>{const{h}=x,t=xtone(c,.75);xb(h,.63,.17,.63,c,0,.37,0);xb(h,.62,.022,.34,c,0,.285,.43);xb(h,.6,.006,.32,'#2e5e3a',0,.272,.43);xb(h,.06,.03,.06,c,0,.47,0);xb(h,.012,.012,.645,t,0,.455,0);xb(h,.645,.012,.012,t,0,.455,0);
 [-1,1].forEach(s=>xs(h,.012,t,s*.2,.42,.22,4));xprint(h,'fitted',c,.24,.18,0,.37,.3165);xprint(h,'sidepatch',c,.11,.11,.3165,.37,0,Math.PI/2);xprint(h,'sticker',c,.09,.09,.13,.2971,.48,0,null,-Math.PI/2)};
XNEW.ht[13]=(x,c)=>{const{h}=x,m='!'+c,t='!'+dk(c,.8);xb(h,.6,.17,.61,m,0,.36,-.01);xb(h,.6,.08,.04,m,0,.24,.29);xb(h,.61,.24,.08,m,0,.17,-.29);xb(h,.012,.012,.62,t,0,.448,-.01);xb(h,.2,.4,.02,m,0,-.06,-.335);
 [-1,1].forEach(s=>xb(h,.05,.42,.018,t,s*.09,-.08,-.35,0,0,s*.08));xb(h,.12,.05,.04,t,0,.13,-.35)};
XNEW.ht[14]=(x,c)=>{const{h}=x,mm=xpSkinMat('mono',c);[xb(h,.62,.18,.62,c,0,.38,0),xb(h,.92,.03,.92,c,0,.3,0)].forEach(m=>m.material=mm);[-1,1].forEach(s=>{xb(h,.92,.03,.14,c,0,.265,s*.51,s*.35,0,0).material=mm;xb(h,.14,.03,.92,c,s*.51,.265,0,0,0,-s*.35).material=mm});xb(h,.625,.04,.625,'#5a3a22',0,.31,0)};
XNEW.ht[15]=(x,c)=>{const{h}=x,ac=xlum(c)>.5?'#1d1d22':'#c0392b';xc(h,.32,.32,.46,'!'+c,0,.56,0,0,0,0,16);xc(h,.325,.325,.07,ac,0,.37,0,0,0,0,16);xc(h,.5,.5,.025,'!'+c,0,.32,0,0,0,0,18);xc(h,.322,.322,.012,'!'+dk(c,.8),0,.79,0,0,0,0,16)};
XNEW.ht[16]=(x,c)=>{const{h}=x,t=xtone(c,.82);xb(h,.62,.12,.62,c,0,.37,0);xb(h,.66,.09,.66,t,0,.3,0);for(let i=0;i<7;i++)xb(h,.018,.09,.665,dk(t,.85),-.27+i*.09,.3,0);xprint(h,'label',c,.12,.06,0,.3,.3345)};
XNEW.ht[17]=(x,c)=>{const{h}=x,t=xtone(c,.8);xb(h,.63,.14,.63,c,0,.355,0);xb(h,.6,.022,.26,c,0,.29,.4);xb(h,.63,.012,.012,t,0,.37,.31);[-1,1].forEach(s=>xb(h,.012,.14,.012,t,s*.15,.355,.316));xb(h,.3,.03,.012,'#1d1d22',0,.32,-.32);xb(h,.04,.04,.014,'~#c0c0c0',.08,.32,-.326);xprint(h,'campfire',c,.24,.144,0,.355,.3165)};
XNEW.ht[18]=(x,c)=>{const{h}=x,m='~'+c;xb(h,.56,.14,.56,'#8e1b3a',0,.36,0);[-1,1].forEach(s=>{xb(h,.62,.1,.03,m,0,.33,s*.31);xb(h,.03,.1,.62,m,s*.31,.33,0)});
 for(let i=0;i<3;i++){const p=-.2+i*.2;[-1,1].forEach(s=>{xb(h,.08,.08,.025,m,p,.41,s*.31,0,0,Math.PI/4);xb(h,.025,.08,.08,m,s*.31,.41,p,Math.PI/4,0,0)})}[[0,'!#c0392b'],[-.2,'!#2f6fb5'],[.2,'!#2ecc71']].forEach(([p,k])=>xs(h,.025,k,p,.33,.33,8));xs(h,.03,'!#f4f4f4',0,.47,.31,6)};
XNEW.ht[19]=(x,c)=>{const{h}=x,t=xtone(c,.85);xb(h,.6,.08,.6,c,0,.17,0);[.14,.2].forEach(y=>xb(h,.605,.008,.605,t,0,y,0));xprint(h,'nova',c,.07,.07,0,.17,.3045)};
XNEW.ht[20]=(x,c)=>{const{h}=x,fm=xpSkinMat('fur','#d9c8a0');xb(h,.62,.2,.62,'!'+c,0,.38,0);xb(h,.012,.012,.625,dk(c,.7),0,.481,0);[xb(h,.66,.12,.06,'#d9c8a0',0,.3,.31),xb(h,.05,.34,.36,'#d9c8a0',-.33,.13,0),xb(h,.05,.34,.36,'#d9c8a0',.33,.13,0),xb(h,.66,.24,.05,'#d9c8a0',0,.2,-.33)].forEach(q=>q.material=fm);
 [-1,1].forEach(s=>xb(h,.012,.1,.012,'#1d1d22',s*.33,-.07,.1))};

/* ---- extras (torso front at d/2, wider when a jacket is on) ---- */
XNEW.ac[10]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2,z=d/2+.02,m='~'+c;for(let i=0;i<13;i++){const a=(i-6)/6;xb(g,.05,.04,.03,m,a*w*.3,1.08-(1-a*a)*.16,z,0,0,(i%2?.3:-.3)+a*.4)}xb(g,w*.56,.025,d*.5,m,0,1.112,-.02)};
XNEW.ac[11]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2,z=d/2+.015;for(let i=0;i<11;i++){const a=(i-5)/5;xb(g,.025,.025,.012,'~'+c,a*w*.26,1.08-(1-a*a)*.12,z)}xb(g,.03,.05,.02,'~'+c,0,.935,z);xb(g,.16,.16,.025,'~'+c,0,.84,z+.004);xprint(g,'iced',c,.15,.15,0,.84,z+.0175)};
XNEW.ac[12]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2,z=d/2,sc='!'+dk(c,.8),mm=xpSkinMat('mono',c);xb(g,.04,.5,.012,sc,w*.3,.86,z+.008);xb(g,.04,.5,.012,sc,w*.3,.86,-z-.008);xb(g,.04,.012,d+.02,sc,w*.3,1.113,0);
 const p=xgrp(g,w*.33,.56,z+.05);xb(p,.2,.15,.08,c,0,0,0).material=mm;xb(p,.205,.06,.085,sc,0,.05,0);xb(p,.04,.03,.02,'~#d4af37',0,.02,.045)};
XNEW.ac[13]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2,z=d/2,L=Math.hypot(w,.62)+.05,a=Math.atan2(w,.62),t=xtone(c,.8);xb(g,.045,L,.012,t,0,.8,z+.008,0,0,-a);xb(g,.045,L,.012,t,0,.8,-z-.008,0,0,a);
 const p=xgrp(g,-w*.12,.95,z+.045);p.rotation.z=.35;xb(p,.3,.13,.07,c,0,0,0);xb(p,.28,.01,.074,'~#c0c0c0',0,.045,0);xprint(p,'nova',c,.07,.07,.08,-.01,.0365)};
XNEW.ac[14]=(x,c)=>{const{h}=x,f='~#d4af37',l='!'+dk(c,.45);[-1,1].forEach(s=>{xb(h,.16,.1,.012,l,s*.135,.06,.3);xb(h,.12,.05,.012,l,s*.135,.0,.3);xb(h,.165,.012,.016,f,s*.135,.115,.3);xb(h,.012,.012,.3,f,s*.29,.09,.15)});xb(h,.08,.012,.014,f,0,.1,.3);xb(h,.06,.01,.014,f,0,.075,.3)};
XNEW.ac[15]=(x,c)=>{const{h}=x;[-1,1].forEach(s=>{xprint(h,'starlens',c,.2,.2,s*.135,.05,.296);xb(h,.012,.012,.3,'#1d1d22',s*.29,.09,.15)});xb(h,.06,.015,.012,'#1d1d22',0,.08,.292)};
XNEW.ac[16]=(x,c)=>{const{h}=x;[-1,1].forEach(s=>{xb(h,.035,.035,.035,'*'+xlt(c,.75),s*.345,-.03,.02);xb(h,.012,.05,.012,'*#ffffff',s*.365,-.03,.02)})};
XNEW.ac[17]=(x,c)=>{const t=xtone(c,.8);x.arms.forEach((a,i)=>{const s=i?1:-1;xb(a,.2,.08,.25,c,0,-.41,0);[-.375,-.445].forEach(y=>xb(a,.202,.008,.252,t,0,y,0));xprint(a,'nova',c,.05,.05,s*.1015,-.41,0,s*Math.PI/2)})};
XNEW.ac[18]=(x,c)=>{x.arms.forEach(a=>{xb(a,.18,.12,.23,'!'+c,0,-.445,0);xb(a,.186,.03,.236,'!'+dk(c,.8),0,-.385,0);xb(a,.02,.02,.01,'~#c0c0c0',0,-.39,.118)})};
XNEW.ac[19]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2,l=xlt(c,.25);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;xs(g,.06,i%2?c:l,Math.cos(a)*w*.36,1.11+Math.sin(i*1.7)*.015,Math.sin(a)*d*.42,6)}for(let j=0;j<5;j++)[-1,1].forEach(s=>xs(g,.055,j%2?c:l,s*(w*.2+j*.006),1.02-j*.09,d/2+.04,6))};
XNEW.ac[20]=(x,c)=>{const{g}=x,d=x.d+x.o*2,z=d/2+.012;[-1,1].forEach(s=>{xb(g,.025,.3,.008,c,s*.07,.97,z,0,0,-s*.35);xb(g,.025,.012,d*.6,c,s*.12,1.112,-.02)});xb(g,.03,.04,.012,'~#c0c0c0',0,.83,z+.002);xb(g,.17,.23,.008,'#f4f4f4',0,.69,z+.006);xprint(g,'pass',c,.16,.224,0,.69,z+.0105,0,xArt(x.c))};
XNEW.ac[21]=(x,c)=>{const{g}=x,d=x.d+x.o*2,z=d/2+.02;[-1,1].forEach(s=>{xb(g,.08,.07,.03,c,s*.05,1.05,z,0,0,s*.25);xb(g,.02,.08,.032,dk(c,.8),s*.088,1.05,z,0,0,s*.25)});xb(g,.035,.04,.04,dk(c,.85),0,1.05,z+.004)};
XNEW.ac[22]=(x,c)=>{x.arms.forEach(a=>[0,1,2].forEach(i=>xb(a,.19,.022,.24,'~'+c,0,-.36-i*.035,0)))};

/* ---- shop and wardrobe previews (box lists [w,h,d,colour,x,y,z,print]; 'none' boxes only carry a print) ---- */
{const clb3=clb;clb=function(k){const[id,col]=String(k).split('|'),g=GM[id];if(!g||GAR.indexOf(g)<GAR1)return clb3(k);try{const L=xclb3(g,col||g.dc);if(L&&L.length)return L}catch(e){console.warn('preview',e)}return clb3(k)}}
function xclb3(g,c){const st=g.st,a=[],P=(...q)=>a.push(q),d=dk(c,.8),t=xtone(c,.75),sk=SKIN[2],ac=xacc(c),pr=(n,v)=>({p:n,col:c,f:'all',v}),
 pp=(n,x,y,w,z,o)=>a.push([w,w*xpAsp(n),.01,'none',x,y,z,Object.assign({p:n,col:c},o)]),side=(n,x,y,w,o)=>a.push([.01,w*xpAsp(n),w,'none',x,y,0,Object.assign({p:n,col:c,f:'x'},o)]);
 if(g.slot=='top'){const T0=(sl,k,cl)=>{P(.9,.7,.5,c,0,.5,0,k);if(sl)[-1,1].forEach(s=>P(.22,sl,.3,cl||c,s*.58,.8-sl/2,0,k))},sp=XSP.top[st],neck=()=>P(.4,.04,.04,t,0,.84,.24);
  if(st==16){T0(.8);P(.6,.25,.3,d,0,.92,-.25);P(.55,.16,.03,dk(c,.75),0,.3,.26);[-1,1].forEach(s=>{P(.03,.16,.02,'#f4f4f4',s*.07,.76,.26);P(.24,.06,.32,t,s*.58,.03,0)})}
  else if(st==17||st==18||st==37){T0(.3);neck()}
  else if(st==19){T0(.3);[-1,1].forEach(s=>{P(.02,.68,.12,ac,s*.455,.5,0);P(.23,.05,.31,ac,s*.58,.67,0);P(.16,.05,.03,ac,s*.07,.82,.25)})}
  else if(st==20){T0(0);[-1,1].forEach(s=>{P(.2,.14,.52,sk,s*.36,.8,0);P(.04,.3,.52,ac,s*.25,.72,0)});P(.16,.08,.02,sk,0,.82,.255);P(.92,.04,.52,ac,0,.17,0)}
  else if(st==21){T0(.3,pr('tiedye'));neck()}
  else if(st==22){T0(.8);[.3,.52,.72].forEach(y=>P(.92,.1,.52,ac,0,y,0));[-1,1].forEach(s=>{P(.24,.1,.32,ac,s*.58,.66,0);P(.24,.07,.32,'#f4f4f4',s*.58,.04,0)});P(.4,.08,.2,'#f4f4f4',0,.86,.18);P(.06,.22,.02,'#f4f4f4',0,.74,.26)}
  else if(st==23){T0(.3,pr('hawaii'));[-1,1].forEach(s=>P(.22,.08,.18,xtone(c,.85),s*.13,.86,.2));[.7,.5,.3].forEach(y=>P(.04,.04,.02,'#f4f1e8',0,y,.26))}
  else if(st==24){T0(0);[-1,1].forEach(s=>P(.2,.12,.52,sk,s*.36,.8,0));for(let i=0;i<9;i++)P(.02,.6,.02,t,-.36+i*.09,.46,.255);P(.32,.06,.02,sk,0,.82,.255)}
  else if(st==25){P(.98,.86,.56,c,0,.45,0);[-1,1].forEach(s=>P(.26,.42,.34,c,s*.62,.66,0));P(.42,.05,.06,t,0,.86,.26);pp('osfront',-.24,.72,.13,.286)}
  else if(st==26){P(.9,.48,.5,c,0,.61,0);P(.84,.22,.44,sk,0,.26,0);P(.92,.06,.52,t,0,.37,0);[-1,1].forEach(s=>{P(.22,.8,.3,c,s*.58,.4,0);P(.03,.16,.02,'#f4f4f4',s*.07,.76,.26)});P(.6,.25,.3,d,0,.92,-.25)}
  else if(st==27){T0(0,pr('sequin'));[-1,1].forEach(s=>P(.2,.12,.52,sk,s*.36,.8,0));P(.24,.08,.02,sk,0,.82,.255)}
  else if(st==28){T0(.8,pr('mesh',SKIN[2]));neck()}
  else if(st==29){T0(.3,pr('mono'));neck()}
  else if(st==30){T0(.3);P(.42,.06,.06,c=='#f4f4f4'||xlum(c)>.55?'#c0392b':'#f4f1e8',0,.84,.22);[-1,1].forEach(s=>P(.23,.06,.31,xlum(c)>.55?'#c0392b':'#f4f1e8',s*.58,.53,0))}
  else if(st==31){T0(.8);P(.24,.3,.02,'#f4f4f4',0,.69,.255);[-1,1].forEach(s=>{P(.06,.7,.03,t,s*.14,.5,.26);P(.2,.15,.02,c,s*.3,.3,.258);P(.24,.07,.32,t,s*.58,.04,0)});[.7,.55,.4,.25].forEach(y=>P(.04,.04,.03,'#5a3a22',-.14,y,.275));P(.92,.08,.52,t,0,.18,0)}
  else if(st==32){T0(.8);P(.45,.12,.35,c,0,.9,0);P(.03,.3,.02,'#cfd3d8',0,.72,.26);[-1,1].forEach(s=>P(.06,.7,.52,t,s*.43,.5,0))}
  else if(st==33){P(.9,.32,.5,c,0,.69,0);P(.84,.36,.44,sk,0,.34,0);P(.92,.08,.52,t,0,.53,0);[-1,1].forEach(s=>P(.2,.12,.52,sk,s*.36,.8,0))}
  else if(st==34){T0(.8);[-1,1].forEach(s=>{P(.08,.7,.52,ac,s*.43,.5,0);P(.03,.7,.02,ac,s*.31,.5,.255)});P(.02,.76,.05,ac,.695,.42,0);P(.4,.1,.3,c,0,.88,0)}
  else if(st==35){T0(.8);[-1,1].forEach(s=>{P(.22,.08,.16,t,s*.13,.86,.2);P(.24,.07,.32,t,s*.58,.04,0)});P(.16,.16,.02,sk,0,.76,.255);[.6,.45,.3].forEach(y=>P(.04,.04,.02,'#e8e0d0',0,y,.26))}
  else if(st==36){P(.9,.62,.5,c,0,.46,0);[-1,1].forEach(s=>P(.2,.1,.5,sk,s*.35,.82,0));P(.4,.08,.02,sk,0,.8,.255);for(let i=0;i<6;i++)P(.02,.58,.02,dk(c,.6),-.36+i*.144,.45,.255);for(let i=0;i<5;i++)P(.1,.02,.02,'#f4f1e8',0,.24+i*.1,.262)}
  if(sp&&st!=25)xpPrev(a,'top',sp,c);if(st==33)a.forEach(q=>{if(q[7]&&q[7].p=='novaband'){q[5]=.53;q[6]=.262}});return a}
 if(g.slot=='jk'){const J0=(open,k)=>{P(.95,.75,.55,c,0,.5,0,k);[-1,1].forEach(s=>P(.24,.7,.35,c,s*.62,.5,0,k));P(.6,.2,.3,d,0,.9,-.25);if(open)P(.35,.7,.02,'#f4f4f4',0,.5,.29)},sp=XSP.jk[st],zip=(cl)=>P(.03,.72,.02,cl||'#d0d0d0',0,.5,.285);
  if(st==9){J0();zip();P(.5,.12,.4,c,0,.9,0);[-.05,0,.05].forEach(o=>P(.02,.7,.03,xlum(c)>.55?'#1d1d22':'#f4f4f4',.745,.5,o))}
  else if(st==10){J0();[.72,.55,.38,.21].forEach(y=>P(.05,.05,.02,'#d0d0d0',.02,y,.285));[-1,1].forEach(s=>P(.2,.1,.04,t,s*.12,.86,.27));P(.97,.05,.57,t,0,.15,0)}
  else if(st==11){J0();zip();P(.97,.12,.57,xlum(c)>.5?'#1d1d22':'#f4f4f4',0,.72,0);P(.975,.03,.575,'#f1c40f',0,.645,0);[-1,1].forEach(s=>P(.26,.1,.37,xlum(c)>.5?'#1d1d22':'#f4f4f4',s*.62,.72,0))}
  else if(st==12){for(let i=0;i<5;i++){P(1.05,.13,.65,c,0,.18+i*.14,0);if(i)P(1.02,.02,.62,d,0,.11+i*.14,0)}[-1,1].forEach(s=>{P(.3,.68,.42,c,s*.68,.45,0);P(.31,.02,.43,d,s*.68,.45,0)});P(.75,.2,.5,c,0,.9,0);P(.03,.7,.02,'#d0d0d0',0,.45,.33)}
  else if(st==13){J0(1);[-1,1].forEach(s=>P(.2,.08,.03,dk(c,.75),s*.27,.66,.29));[.6,.4,.2].forEach(y=>P(.04,.04,.03,'#b87333',.2,y,.29))}
  else if(st==14){P(1.05,1.1,.65,c,0,.35,0,pr('fur'));[-1,1].forEach(s=>P(.3,.75,.42,c,s*.68,.45,0,pr('fur')));P(1.0,.22,.66,xlt(c,.12),0,.85,0,{p:'fur',col:xlt(c,.12),f:'all'});P(.35,.9,.02,'#f4f4f4',0,.4,.33)}
  else if(st==15){J0(1,pr('sequin'));[-1,1].forEach(s=>P(.12,.4,.03,'#111111',s*.15,.62,.29));P(.1,.04,.02,'#f4f4f4',.3,.68,.285)}
  else if(st==16){J0(1);[-1,1].forEach(s=>{P(.14,.35,.03,dk(c,.85),s*.2,.62,.29);for(let i=0;i<4;i++)P(.04,.04,.04,'#d8d8d8',s*(.12+i*.1),.88,0)});P(.02,.55,.02,'#d0d0d0',.18,.45,.3)}
  else if(st==17){J0();P(.7,.3,.3,d,0,.95,-.3);P(.6,.22,.04,t,0,.32,.29);P(.03,.2,.02,'#d0d0d0',0,.75,.285)}
  else if(st==18){J0(1);P(.97,.08,.57,t,0,.16,0);P(.98,.015,.58,xlum(c)>.5?'#1d1d22':'#f4f1e8',0,.16,0);[-1,1].forEach(s=>P(.25,.08,.36,t,s*.62,.18,0));[.72,.55,.38,.21].forEach(y=>P(.04,.04,.02,'#d0d0d0',.18,y,.29))}
  else if(st==19){J0();zip('#c9a227');P(.66,.1,.45,c,0,.9,0);[-1,1].forEach(s=>P(.18,.08,.04,'#b22222',s*.13,.82,.27,{p:'tartan',col:'#b22222',f:'all'}));P(.97,.08,.57,t,0,.16,0)}
  else if(st==20){J0(1);P(1.05,.2,.66,'#efe6d0',0,.9,0,{p:'fur',col:'#efe6d0',f:'all'});[-1,1].forEach(s=>{P(.18,.35,.03,'#efe6d0',s*.2,.66,.29);P(.28,.1,.39,'#efe6d0',s*.62,.18,0)});P(1.0,.08,.6,'#efe6d0',0,.16,0)}
  else if(st==21){J0();P(.7,.3,.3,d,0,.95,-.3);zip(dk(c,.5));P(.97,.015,.57,dk(c,.7),0,.75,0);P(.975,.035,.575,'#dfe9ee',0,.4,0);[-1,1].forEach(s=>P(.25,.035,.36,'#dfe9ee',s*.62,.35,0))}
  else if(st==22){P(.95,1.0,.55,c,0,.38,0,pr('wave'));[-1,1].forEach(s=>P(.34,.5,.5,c,s*.66,.58,0,pr('wave')));[-1,1].forEach(s=>P(.1,.8,.03,xlum(c)>.5?'#1d1d22':'#e6b422',s*.12,.45,.285));P(.97,.14,.57,'#1d1d22',0,.42,0)}
  else{J0();P(.7,.1,.45,dk(c,.6),0,.88,0);[-1,1].forEach(s=>P(.22,.18,.02,c,s*.26,.28,.285));P(.18,.14,.02,c,-.25,.63,.285);[.7,.52,.34,.16].forEach(y=>P(.04,.04,.03,'#2a1a10',.04,y,.29))}
  if(sp)xpPrev(a,'jk',sp,c);return a}
 if(g.slot=='bt'){const L0=k=>[-1,1].forEach(s=>P(.4,.9,.4,c,s*.25,.45,0,k)),W0=()=>[-1,1].forEach(s=>P(.58,.9,.52,c,s*.3,.45,0)),S0=()=>[-1,1].forEach(s=>{P(.4,.45,.4,c,s*.25,.75,0);P(.3,.4,.3,sk,s*.25,.3,0)});
  if(st==9){[-1,1].forEach(s=>{P(.46,.55,.46,c,s*.26,.7,0);P(.47,.04,.47,ac,s*.26,.44,0);P(.3,.32,.3,sk,s*.26,.24,0)});P(.02,.53,.2,ac,.495,.7,0);P(1,.1,.5,c,0,.95,0);pp('nova',.26,.6,.12,.236)}
  else if(st==10){W0();[-1,1].forEach(s=>{P(.04,.06,.04,'#1d1d22',s*.3,.02,.27);[.3,.6].forEach(y=>P(.59,.015,.53,t,s*.3,y,0))});P(.04,.2,.25,c,.6,.5,0)}
  else if(st==11)L0(pr('tartan'));
  else if(st==12){L0();[-1,1].forEach(s=>P(.02,.88,.02,dk(c,.7),s*.25,.45,.205));P(.03,.12,.02,'#d0d0d0',0,.85,.21)}
  else if(st==13){[-1,1].forEach(s=>{P(.4,.75,.4,c,s*.25,.53,0);P(.52,.2,.48,c,s*.25,.1,0);P(.015,.85,.02,'#d9a441',s*.45,.45,0)})}
  else if(st==14){S0();[-1,1].forEach(s=>{P(.42,.05,.42,xlt(c,.25),s*.25,.53,0);P(.03,.18,.02,'#f4f4f4',s*.06,.88,.21)});pp('thzsm',.25,.82,.16,.206)}
  else if(st==15){[-1,1].forEach(s=>{P(.4,.85,.4,c,s*.25,.48,0);P(.36,.08,.36,t,s*.25,.04,0)});P(.04,.22,.26,c,.47,.5,0);P(.05,.05,.28,t,.475,.6,0)}
  else if(st==16){[-1,1].forEach(s=>P(.3,.62,.3,sk,s*.25,.3,0));P(1.0,.36,.55,c,0,.78,0);P(1.01,.015,.56,'#d9a441',0,.62,0);P(.05,.05,.02,'#b87333',0,.92,.28)}
  else if(st==17){[-1,1].forEach(s=>{P(.38,.5,.38,c,s*.24,.72,0);P(.3,.48,.3,sk,s*.24,.24,0)});P(.02,.48,.1,ac,.435,.72,0);pp('nova',.24,.75,.1,.196)}
  else if(st==18){L0(pr('sequin'));P(.02,.88,.04,'#e0e0e0',.455,.45,0)}
  else if(st==19){W0();[-1,1].forEach(s=>P(.5,.22,.02,dk(c,.9),s*.3,.38,.265));P(.03,.2,.08,c,.6,.55,0);P(.015,.85,.02,'#d9a441',.595,.45,.15)}
  else{L0(pr('pinstripe'));[-1,1].forEach(s=>{P(.01,.88,.01,xlt(c,.3),s*.25,.45,.205);P(.42,.06,.42,dk(c,.9),s*.25,.03,0)})}
  if(st!=16&&st!=13)P(.95,.12,.45,c,0,.95,0);return a}
 if(g.slot=='ht'){
  if(st==12){P(.9,.32,.9,c,0,.3,0);P(.9,.04,.5,c,0,.15,.68);P(.86,.01,.46,'#2e5e3a',0,.125,.68);P(.14,.012,.14,'#e6b422',.2,.176,.72);pp('fitted',0,.3,.36,.456);side('sidepatch',.456,.3,.16)}
  else if(st==13){P(.86,.24,.88,c,0,.25,0);P(.3,.6,.04,c,0,-.1,-.45);[-1,1].forEach(s=>P(.06,.6,.03,dk(c,.8),s*.1,-.1,-.47))}
  else if(st==14){P(.8,.3,.8,c,0,.3,0,pr('mono'));P(1.3,.06,1.3,c,0,.12,0,pr('mono'));P(.82,.05,.82,'#5a3a22',0,.18,0)}
  else if(st==15){P(.7,.75,.7,c,0,.5,0);P(.72,.12,.72,xlum(c)>.5?'#1d1d22':'#c0392b',0,.2,0);P(1.1,.05,1.1,c,0,.12,0)}
  else if(st==16){P(.9,.22,.9,c,0,.2,0);P(.95,.12,.95,t,0,.08,0);pp('label',0,.08,.2,.48)}
  else if(st==17){P(.9,.22,.9,c,0,.2,0);P(.86,.04,.35,c,0,.1,.6);pp('campfire',0,.2,.34,.456)}
  else if(st==18){P(.8,.2,.8,'#8e1b3a',0,.2,0);P(.86,.16,.86,c,0,.1,0);[-.25,0,.25].forEach(p=>{P(.12,.18,.06,c,p,.27,.4);P(.06,.18,.12,c,.4,.27,p)});[[-.25,'#2f6fb5'],[0,'#c0392b'],[.25,'#2ecc71']].forEach(([p,k])=>P(.08,.08,.02,k,p,.1,.435))}
  else if(st==19){[-1,1].forEach(s=>{P(.92,.14,.06,c,0,.1,s*.43);P(.06,.14,.8,c,s*.43,.1,0)});pp('nova',0,.1,.11,.462)}
  else{P(.9,.3,.9,c,0,.3,0);const f={p:'fur',col:'#d9c8a0',f:'all'};P(.92,.14,.08,'#d9c8a0',0,.17,.46,f);[-1,1].forEach(s=>P(.08,.42,.5,'#d9c8a0',s*.47,0,0,f))}
  return a}
 if(st==10){for(let i=0;i<13;i++){const q=(i-6)/6;P(.12,.08,.08,c,q*.42,.62-(1-q*q)*.4,0)}P(.12,.12,.06,dk(c,.85),0,.2,0)}
 else if(st==11){for(let i=0;i<11;i++){const q=(i-5)/5;P(.05,.05,.04,c,q*.3,.85-(1-q*q)*.3,0)}P(.36,.36,.06,c,0,.32,0);pp('iced',0,.32,.34,.035)}
 else if(st==12){P(.5,.36,.2,c,0,.2,0,pr('mono'));P(.52,.12,.22,dk(c,.8),0,.33,0);P(.06,.06,.02,'#d4af37',0,.3,.115);P(.05,.6,.04,dk(c,.8),-.2,.68,0);P(.05,.6,.04,dk(c,.8),.2,.68,0);P(.45,.05,.04,dk(c,.8),0,.98,0)}
 else if(st==13){P(.6,.26,.18,c,0,.2,0);P(.58,.015,.01,'#c0c0c0',0,.28,.095);P(1.1,.05,.04,xtone(c,.8),0,.24,-.1);pp('nova',.18,.16,.1,.096)}
 else if(st==14){const l=dk(c,.45);[-1,1].forEach(s=>{P(.28,.2,.03,l,s*.2,.3,0);P(.2,.08,.03,l,s*.2,.17,0);P(.03,.03,.5,'#d4af37',s*.36,.4,-.25)});P(.7,.03,.03,'#d4af37',0,.42,0);P(.12,.025,.03,'#d4af37',0,.36,0)}
 else if(st==15){[-1,1].forEach(s=>{pp('starlens',s*.22,.3,.38,.02);P(.03,.03,.5,'#1d1d22',s*.42,.38,-.25)});P(.1,.03,.03,'#1d1d22',0,.34,0)}
 else if(st==16){P(.9,.12,.5,'#1f3a6e',0,.06,0);[-1,1].forEach(s=>{P(.12,.12,.12,xlt(c,.75),s*.2,.2,0);P(.03,.06,.03,'#ffffff',s*.2,.29,0)})}
 else if(st==17){[-1,1].forEach(s=>{P(.34,.18,.34,c,s*.3,.2,0);P(.345,.015,.345,xtone(c,.8),s*.3,.27,0);pp('nova',s*.3,.2,.1,.175)})}
 else if(st==18){[-1,1].forEach(s=>{P(.24,.24,.12,c,s*.3,.25,0);for(let i=0;i<4;i++)P(.045,.14,.1,c,s*.3-.09+i*.06,.43,0);P(.26,.06,.14,dk(c,.8),s*.3,.1,0)})}
 else if(st==19){for(let i=0;i<14;i++){const q=i/13*Math.PI;P(.14,.14,.14,i%2?c:xlt(c,.25),Math.cos(q)*.45,.3+Math.sin(q)*.4,0)}}
 else if(st==20){[-1,1].forEach(s=>P(.03,.6,.02,c,s*.12,.75,0));a.push([.3,.42,.02,'#f4f4f4',0,.25,0]);pp('pass',0,.25,.28,.016,{v:xArt(ch)})}
 else if(st==21){[-1,1].forEach(s=>P(.25,.2,.08,c,s*.15,.3,0));P(.1,.12,.1,dk(c,.85),0,.3,.01)}
 else for(let i=0;i<3;i++)[[.36,.05,.04,0,.18],[.36,.05,.04,0,-.18],[.04,.05,.36,.18,0],[.04,.05,.36,-.18,0]].forEach(([w,h,dd,x,z])=>P(w,h,dd,c,x,.1+i*.09,z));
 return a}

/* ---- Threadz shop: tabs, style filters (All, New, Streetwear, ...), locks, NEW tags, and the item's own colour as a swatch ---- */
let THF='';
PA.clothes=()=>{const lv=fameLevel(),nn=GAR.length-GAR1,L=GAR.filter(g=>g.slot==CLT&&(!THF||(THF=='new'?GAR.indexOf(g)>=GAR1:g.cat==THF)));
 const card=g=>{const col=THC[g.id]||(S.wc||{})[g.id]||g.dc,own=S.wr.includes(g.id),lk=!own&&garLock(g),nw=GAR.indexOf(g)>=GAR1,sw=CPAL.includes(g.dc)?CPAL:[g.dc,...CPAL];
  return`<div class=thc2 ${lk?'style="opacity:.78"':''}><div class=thp style="--pvb:transparent">${isoP('k',g.id+'|'+col)}</div><div class=thn>${esc(g.n)}${nw?' <small class=thnew>NEW</small>':''}</div>${g.cat?`<div class=thct>${XCATN[g.cat]}</div>`:''}<div class=thr>${$$(g.p)}${g.ft>=0?` <small class=thlv>Fame Lv ${garLv(g)}</small>`:''}</div><div class=thsw>${sw.map(c=>`<i class="${c==col?'on':''}" style="background:${c}" onclick="THC['${g.id}']='${c}';pcR()"></i>`).join('')}</div>${own?`<button onclick="wearG('${g.id}','${col}');say('Wearing ${esc(g.n)}');pcR()">Owned · Wear this colour</button>`:lk?`<button disabled>Unlocks at Fame Level ${garLv(g)}</button>`:`<button class=go ${S.money<g.p?'disabled':''} onclick="buyG('${g.id}')">Buy</button>`}</div>`};
 return`<div class=thz><div class=hero><b>MEGA DROP · ${GAR.length} STYLES</b><span>${nn} fresh pieces just landed across streetwear, sportswear, designer, vintage and stage looks. Every piece comes in ${CPAL.length} colours. Choose yours, then buy. Premium pieces unlock as your fame grows (you are Fame Level ${lv}).</span></div><div class=thh>${WSL2.map(t=>`<button class="${CLT==t[0]?'go':''}" onclick="CLT='${t[0]}';pcR()">${t[1]}</button>`).join('')}<span style="margin-left:auto">Balance <b>${$$(S.money)}</b></span></div><div class="thh thf">${[['','All'],['new','New'],...Object.entries(XCATN)].map(([k,n])=>`<button class="${THF==k?'go':''}" onclick="THF='${k}';pcR()">${n}</button>`).join('')}</div><div class=thg>${L.map(card).join('')||'<p class=m style="grid-column:1/-1">Nothing of this style in this tab yet. Try another tab or filter.</p>'}</div></div>`};
{const st=document.createElement('style');st.textContent='.thf{margin-top:-4px}.thf button{font-size:11px;padding:3px 9px}.thct{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#7a5cff;margin:-2px 0 2px}';document.head.appendChild(st)}
