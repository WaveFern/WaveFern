/* ===== v55.52.44 (held): better Instagrime brand posts, in the game's pixel style, with original product names =====
   1. Product names and taglines: every brand's three products now have original names (no real product lines or slogans).
      They are written into BRD.postProducts in place, so the feed, the brand profile pages and anything reading prods() follow.
   2. Captions: BRD.adHook (called by mk() in 241-brand-posts.js) rewrites each ad's caption: launch, regular and "seen on you" lines,
      a price, hashtags by category, and the player's artist name now and then.
   3. Pictures: postPic is wrapped for posts with p.v2 and draws a 160x120 ad (shown at 2x, pixelated, like every other post): a real 3D
      model of the product (boxes and cylinders like the game's own items, recoloured per product from the brand colours; the original
      14 brands' first product is not borrowed from BRD.item3d, whose models are not sized for this) on a plain flat backdrop, then the brand logo, a 3x5 pixel-font
      name bar, price tag and a NEW burst. Four camera angles. Falls back to a flat plate if WebGL is missing.
   Reused: 241-brand-posts.js (todays, mk, genFeed mix, uposts, pfp, PICS cache), BRD.logo painters / BRD.by / BRD.brands, and the
   pixel helpers of 178-instagrime-photos.js (igxF, igxTxt, igxTW, igxClip, igxDisc). New: the 18 product models, caption pools.
   Nothing is saved. Held behind the dev gate (/dev/ only) until release day: set HELD=false to ship. */
(function(){
const HELD=false;
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
const SPR_OF={sportswear:'sneaker',fastfood:'bag',snack:'bag',coffee:'cup',streetwear:'hoodie',denim:'jeans',streaming:'screen',cosmetics:'lipstick',outdoor:'puffer',athleisure:'hoodie',drink:'can'};
const spriteOf=(b,pi)=>{if(b.id=='rolix')return'watch';if(b.id=='supreme'&&pi)return pi==1?'cap':'deck';if(b.id=='gucci'||b.id=='lv')return pi==1&&b.id=='gucci'?'sneaker':pi==2&&b.id=='lv'?'sneaker':'luxury';
 if(b.id=='radbull'||b.id=='monster'||b.id=='pepsi'||b.id=='cocacola'||b.id=='gator')return'can';if(b.id=='boze'||b.id=='beats'){return pi==2?'tech':'audio'}return SPR_OF[b.cat]||(B3[b.cat]?b.cat:'tech')};
/* colours of a product: pi 0 uses the brand accent, pi 1 the brand background, pi 2 a white body; text-safe accents */
function pal(b,pi){let c=b.c,a=b.bg;if(lum(c)<.18)c=mix(c,'#ffffff',.55);if(lum(a)>.8&&lum(c)>.8)c=mix(c,'#000000',.35);
 let M=[c,mix(a,'#ffffff',.15),'#f4f4f4'][pi%3],A=[a,c,c][pi%3];if(pi%3==1&&lum(M)<.12)M=mix(M,'#ffffff',.3);if(Math.abs(lum(M)-lum(A))<.15)A=lum(M)>.5?'#16161a':'#ffffff';
 return{M,A,S:mix(M,'#000000',.32),H:mix(M,'#ffffff',.55),W:'#f4f4f4',D:'#22242c',K:'#0b0b10'}}
const LG={};function logoCv(id){if(LG[id])return LG[id];const b=BRD.by(id),c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=b.bg;g.fillRect(0,0,64,64);try{b.p(g)}catch(e){}return LG[id]=c}
function logoAt(x,id,X,Y,s){F(x,'#0b0b10',X-1,Y-1,s+2,s+2);x.imageSmoothingEnabled=false;x.drawImage(logoCv(id),X,Y,s,s)}
function newBurst(x,X,Y,r){for(let a=0;a<12;a++){const t=a*Math.PI/6;for(let q=0;q<r+4;q++)F(x,'#ffd400',X+Math.cos(t)*q,Y+Math.sin(t)*q,2,2)}igxDisc(x,'#ff2d55',X,Y,r);igxDisc(x,'#ff5a7a',X-2,Y-2,r-4);const w=igxTW('NEW',2);igxTxt(x,'NEW',Math.round(X-w/2)+1,Y-4,'#7a0a22',2);igxTxt(x,'NEW',Math.round(X-w/2),Y-5,'#fff',2)}
function tag(x,s,X,Y,bg,fg){const w=igxTW(s,1)+6;F(x,'#0b0b10',X-1,Y-1,w+2,11);F(x,bg,X,Y,w,9);igxTxt(x,s,X+3,Y+2,fg,1);return w}
function nameBar(x,s,P,b){s=igxClip(s,24);const sc=igxTW(s,2)<=140?2:1,w=igxTW(s,sc);F(x,'#0b0b10',0,102,160,18);F(x,b.c,0,102,160,2);F(x,mix(b.bg,'#000000',.4),0,104,160,16);igxTxt(x,s,Math.round(80-w/2)+1,(sc==2?108:110)+1,'#000',sc);igxTxt(x,s,Math.round(80-w/2),sc==2?108:110,'#fff',sc)}

/* ---------- 3D product models (boxes and cylinders, like the game's own item models) on a plain flat backdrop ---------- */
const lam=c=>new THREE.MeshLambertMaterial({color:c});
const bx=(g,w,h,d,c,x,y,z,rx,rz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),lam(c));m.position.set(x,y,z);if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;m.castShadow=m.receiveShadow=true;g.add(m);return m};
const cy=(g,rt,rb,h,c,x,y,z,rx,rz)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,14),lam(c));m.position.set(x,y,z);if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;m.castShadow=m.receiveShadow=true;g.add(m);return m};
const B3={
 sneaker:(g,P)=>{bx(g,.3,.05,.86,P.W,0,.025,0);bx(g,.28,.27,.26,P.M,0,.185,-.28);bx(g,.28,.17,.32,P.M,0,.135,-.02);bx(g,.26,.11,.3,P.A,0,.105,.3);bx(g,.2,.03,.28,P.H,0,.24,.06,.35);bx(g,.2,.03,.14,P.D,0,.33,-.28);bx(g,.3,.04,.6,P.A,0,.07,.0)},
 cap:(g,P)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.26,14,8,0,Math.PI*2,0,Math.PI/2),lam(P.M));m.castShadow=true;g.add(m);bx(g,.34,.025,.22,P.S,0,.01,.3);bx(g,.1,.1,.02,P.A,0,.14,.25)},
 deck:(g,P)=>{bx(g,.22,.03,.9,P.M,0,.1,0);bx(g,.22,.035,.3,P.A,0,.1,0);[-.28,.28].forEach(z=>[-.08,.08].forEach(x=>cy(g,.05,.05,.04,P.W,x*1.2,.04,z,0,Math.PI/2)))},
 can:(g,P)=>{cy(g,.15,.15,.5,P.M,0,.25,0);cy(g,.153,.153,.2,P.A,0,.25,0);cy(g,.11,.15,.04,P.W,0,.52,0);cy(g,.14,.14,.02,P.W,0,.005,0)},
 bag:(g,P)=>{bx(g,.44,.54,.13,P.M,0,.27,0);bx(g,.32,.22,.14,P.A,0,.27,0);bx(g,.44,.05,.16,P.W,0,.545,0);bx(g,.44,.05,.16,P.W,0,.0,0)},
 cup:(g,P)=>{cy(g,.2,.14,.4,P.M,0,.2,0);cy(g,.17,.15,.14,P.A,0,.2,0);cy(g,.22,.22,.05,P.W,0,.425,0);bx(g,.03,.2,.03,P.D,.04,.55,0)},
 eyewear:(g,P)=>{[-.15,.15].forEach(x=>{bx(g,.25,.18,.03,P.D,x,.12,0);bx(g,.27,.02,.04,P.M,x,.22,0);bx(g,.27,.02,.04,P.M,x,.02,0)});bx(g,.62,.03,.04,P.M,0,.2,0);bx(g,.03,.03,.3,P.M,-.31,.2,-.15);bx(g,.03,.03,.3,P.M,.31,.2,-.15)},
 hoodie:(g,P)=>{bx(g,.46,.5,.2,P.M,0,.25,0);bx(g,.13,.44,.17,P.M,-.3,.27,0,0,.18);bx(g,.13,.44,.17,P.M,.3,.27,0,0,-.18);bx(g,.3,.12,.2,P.S,0,.54,-.02);bx(g,.26,.1,.01,P.A,0,.12,.105);bx(g,.46,.04,.21,P.S,0,.02,0)},
 jeans:(g,P)=>{[-.1,.1].forEach(x=>bx(g,.19,.6,.18,P.M,x,.3,0));bx(g,.4,.1,.2,P.S,0,.62,0);bx(g,.1,.1,.01,P.A,.12,.5,.095);bx(g,.04,.04,.01,P.W,0,.66,.105)},
 audio:(g,P)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(.27,.03,6,18,Math.PI),lam(P.S));t.position.y=.2;t.castShadow=true;g.add(t);[-.27,.27].forEach(x=>{cy(g,.11,.11,.1,P.M,x,.2,0,0,Math.PI/2);cy(g,.09,.09,.12,P.A,x+(x<0?.02:-.02),.2,0,0,Math.PI/2)})},
 tech:(g,P)=>{bx(g,.32,.62,.04,P.M,0,.31,0);bx(g,.27,.54,.045,P.D,0,.31,0);bx(g,.2,.3,.047,P.A,0,.33,0);bx(g,.06,.015,.047,P.W,0,.56,0)},
 gaming:(g,P)=>{bx(g,.5,.12,.28,P.M,0,.12,0);[-.27,.27].forEach(x=>bx(g,.14,.14,.3,P.S,x,.1,.05));bx(g,.05,.04,.05,P.D,-.2,.19,0);[[.2,0],[.26,.05],[.14,.05]].forEach(q=>bx(g,.04,.03,.04,P.A,q[0],.19,q[1]-.02));cy(g,.04,.04,.03,P.D,.0,.19,.06)},
 screen:(g,P)=>{bx(g,.84,.52,.05,P.D,0,.4,0);bx(g,.76,.44,.055,P.A,0,.4,0);bx(g,.1,.12,.06,P.W,0,.4,0);bx(g,.06,.14,.06,P.D,0,.07,0);bx(g,.34,.03,.2,P.D,0,.015,0)},
 lipstick:(g,P)=>{cy(g,.09,.09,.24,P.D,0,.12,0);cy(g,.07,.07,.04,P.W,0,.26,0);cy(g,.06,.06,.22,P.M,0,.39,0);bx(g,.07,.06,.07,P.M,0,.52,0,0,.5)},
 puffer:(g,P)=>{[0,1,2,3].forEach(i=>bx(g,.46,.14,.22,i%2?P.S:P.M,0,.08+i*.14,0));[-.3,.3].forEach((x,i)=>bx(g,.13,.5,.18,P.M,x,.28,0,0,i?-.2:.2));bx(g,.3,.1,.2,P.S,0,.64,-.02);bx(g,.1,.04,.01,P.A,.12,.4,.115)},
 car:(g,P)=>{bx(g,1.05,.2,.46,P.M,0,.2,0);bx(g,.5,.17,.4,P.D,-.05,.38,0);bx(g,.08,.1,.46,P.M,.36,.3,0);[-.32,.32].forEach(x=>[-.23,.23].forEach(z=>cy(g,.12,.12,.08,P.D,x,.12,z,Math.PI/2)));bx(g,.03,.06,.3,P.W,.53,.2,0);bx(g,1.07,.04,.3,P.A,0,.14,0)},
 luxury:(g,P)=>{bx(g,.52,.38,.22,P.M,0,.19,0);const t=new THREE.Mesh(new THREE.TorusGeometry(.12,.02,6,14,Math.PI),lam(P.S));t.position.set(0,.38,0);t.castShadow=true;g.add(t);bx(g,.1,.08,.02,P.A,0,.3,.12);bx(g,.52,.04,.23,P.S,0,.36,0)},
 watch:(g,P)=>{bx(g,.11,.8,.04,P.S,0,.4,0);cy(g,.17,.17,.07,P.A,0,.4,.03,Math.PI/2);cy(g,.13,.13,.075,P.W,0,.4,.035,Math.PI/2);bx(g,.015,.1,.01,P.D,0,.44,.08);bx(g,.08,.015,.01,P.D,.03,.4,.08)}};
let R3=null;
function render3d(b,pi,lay,P,key){if(typeof THREE=='undefined')return null;
 if(!R3||R3.r.getContext().isContextLost()){const r=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(160,120,false);r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;R3={r}}
 const sc=new THREE.Scene(),bg=P.bg;sc.background=new THREE.Color(bg);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.28}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;sc.add(fl);
 const g=new THREE.Group();
 B3[key]?B3[key](g,P):B3.tech(g,P);
 g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});
 const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new THREE.Vector3()),k=1.0/Math.max(sz.y*1.1,sz.x*.75,sz.z*.75);g.scale.setScalar(k);const b2=new THREE.Box3().setFromObject(g);g.position.set(-(b2.min.x+b2.max.x)/2,-b2.min.y,-(b2.min.z+b2.max.z)/2);
 const yaw=[-1.0,.9,-.55,.6][lay%4],hh=[.45,.35,.6,.5][lay%4],d=[3.3,3.3,3.2,3.4][lay%4];g.rotation.y=yaw;sc.add(g);
 const cam=new THREE.PerspectiveCamera(30,4/3,.1,40);cam.position.set(0,hh+.2,d);cam.lookAt(0,.4,0);
 sc.add(new THREE.AmbientLight(0xffffff,.75));const kl=new THREE.DirectionalLight(0xffffff,.9);kl.position.set(2,4,3);kl.castShadow=true;kl.shadow.mapSize.set(512,512);const c2=kl.shadow.camera;c2.left=-2;c2.right=2;c2.top=2;c2.bottom=-2;c2.near=.5;c2.far=12;kl.shadow.bias=-.002;sc.add(kl,kl.target);
 const rl=new THREE.DirectionalLight(0xffffff,.35);rl.position.set(-3,2,-2);sc.add(rl);
 R3.r.render(sc,cam);sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});return R3.r.domElement}
function PIC(p){const b=BRD.by(p.brandAd),pi=p.prod|0,pr=(BRD.postProducts[b.id]||[])[pi]||[b.n,''],k=document.createElement('canvas');k.width=160;k.height=120;const x=k.getContext('2d');
 x.imageSmoothingEnabled=false;const key=spriteOf(b,pi),P=pal(b,pi);
 /* plain backdrop: the brand's own background colour, unless the product would vanish into it */
 P.bg=Math.abs(lum(P.M)-lum(b.bg))<.12&&Math.abs(lum(P.A)-lum(b.bg))<.12?mix(b.bg,lum(b.bg)>.5?'#000000':'#ffffff',.55):b.bg;
 let cv=null;try{cv=render3d(b,pi,p.lay|0,P,key)}catch(e){console.warn('brand ad 3d',e)}
 if(cv)x.drawImage(cv,0,0,160,120);else{F(x,P.bg,0,0,160,120)}
 const l=(p.lay|0)%2;logoAt(x,b.id,l?128:6,6,26);
 nameBar(x,pr[0],P,b);if(p.launch)newBurst(x,l?24:136,34,13);else tag(x,p.pc,l?6:118,8,'#ffd400','#16161a');
 return k.toDataURL()}
{const pp0=postPic;postPic=function(p){if(p&&p.brandAd&&p.v2){try{if(PICS[p.id])return PICS[p.id];return PICS[p.id]=PIC(p)}catch(e){console.warn('brand ad v2',e)}}return pp0.apply(this,arguments)}}
BRD.adPic=PIC;
})();
