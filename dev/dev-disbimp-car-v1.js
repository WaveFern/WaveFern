/* WaveFern dev: THE DISBIMP. Only runs on /dev/ (window.FW_DEV). Add ?nodisbimp to skip it.

   A detailed hypercar with DISBIMP written along both doors, across the tail and on the number plates. Sold in the Cars shop
   ($140,000, 150 mph); on /dev/ every career is given one, parked outside the garage door. The body is one merged mesh on the shared car materials
   (carBuild in 39-car-models.js: group 0 glossy paint, 1 matte, 2 unlit lights): a shaped wedge body with a shoulder step,
   teardrop canopy, splitter, intakes, LED light bars, hood vents, twin stripes, side intakes with fins, swan-neck rear wing,
   diffuser fins, quad exhausts, ten-spoke rims with discs and calipers, shark fin and underglow.
   The lettering is crisp canvas text (the game's Silkscreen pixel font, redrawn once the font loads) on thin decal planes added
   as children of the car mesh, so every caller (garage, parked cars, driving, shop preview) gets it.
   The paint shop's body colour is used (geometry cached per colour); patterns are not, the livery stays.
   Save: the car is an index in CARS, appended after the lodge cars. Never reorder.
   HOOK window.FW_DISBIMP = {i, geo(col), decals(), spec}. */
(function(){
if(!window.FW_DEV||/[?&]nodisbimp/.test(location.search))return;
if(typeof THREE=='undefined'||typeof CARS=='undefined'||typeof carList!='function'||typeof carBuild!='function')return;

const BODY='#d3202c',ACC='#141519',LED='#fff3e8',GLOW='#ff3b47',INK='#121318',CARB='#24262c',CHR='#c9ced6',RUB='#17171a',DISC='#7d828a';
/* L,W: length and width; r: wheel radius; yb: body bottom; yh: shoulder; fo/ro: axles; Wc: cabin width */
const SP={L:2.62,W:1.18,r:.19,yb:.11,yh:.43,fo:.84,ro:-.82,Wc:.92};

function disGeo(col){const {L,W,r,yb,yh,fo,ro,Wc}=SP,ra=r+.035,dkc=dk(col,.55),dk2=dk(col,.75);
 const arch=zc=>{const a=[];for(let i=0;i<=8;i++){const t=i/8*Math.PI;a.push([zc+Math.cos(t)*ra,yb+Math.sin(t)*ra])}return a};
 return carBuild(({box,ext,cyl,wheel})=>{
  /* body: lower full-width skin up to the shoulder, an inset upper deck on top of it (the step reads as a rounded flank) */
  const low=[[-L/2,yb+.06],[-L/2,yh-.02],[-L/2+.05,yh],[L/2-.3,yh-.04],[L/2-.08,.28],[L/2,.24],[L/2,yb+.05],[L/2-.08,yb],...arch(fo),...arch(ro),[-L/2+.08,yb]];
  ext(low,-W/2,W/2,col);
  ext([[-L/2+.02,yh-.02],[-L/2+.02,.5],[-L/2+.16,.52],[-.62,.5],[.5,.47],[L/2-.32,yh-.02]],-W/2+.07,W/2-.07,col);
  /* front fender bulges over the front wheels */
  [-1,1].forEach(s=>ext([[fo-.34,yh-.03],[fo-.24,yh+.04],[fo+.16,yh],[fo+.3,.325]],s>0?W/2-.2:-W/2+.06,s>0?W/2-.06:-W/2+.2,col));
  /* canopy (teardrop), glass a little proud of it, roof panel and a black A to C pillar line */
  const yt=.77,zr0=-.66,zr1=-.32,zf1=.1,zf0=.5;
  ext([[zr0,.49],[zr1,yt],[zf1,yt],[zf0,.46]],-Wc/2,Wc/2,col);
  ext([[zr0-.02,.52],[zr1-.012,yt-.045],[zf1+.012,yt-.045],[zf0+.025,.49]],-Wc/2-.012,Wc/2+.012,'#3d5f7a');
  box(Wc*.82,.02,zf1-zr1-.04,0,yt+.008,(zf1+zr1)/2,col);
  box(Wc+.03,yt-.55,.035,0,(yt+.5)/2,(zr1+zf1)/2-.06,dkc,0);
  /* roof scoop and shark fin */
  box(.26,.05,.2,0,yt+.035,zr1+.06,INK,1);box(.22,.035,.02,0,yt+.04,zr1+.165,'#050507',2);
  box(.02,.07,.16,0,yt+.04,zr1-.04,col,0);
  /* twin accent stripes nose to tail over bonnet, roof and deck */
  [-1,1].forEach(s=>{const x=s*.1;
   box(.07,.008,L/2-.34-zf0,x,yh+.025,(zf0+L/2-.34)/2+.03,ACC,0,-.06);
   box(.07,.008,zf1-zr1,x,yt+.02,(zr1+zf1)/2,ACC,0);
   box(.07,.008,zr0+L/2-.18,x,.515,(zr0-L/2+.18)/2,ACC,0)});
  /* hood vents */
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)box(.16,.012,.025,s*.3,yh+.02-k*.005,.66+k*.05,INK,1,-.08)});
  /* front: splitter, three intakes with mesh bars, LED headlight slits and black DRL hooks, badge */
  box(W+.06,.025,.16,0,yb+.01,L/2-.03,INK,1);box(W+.06,.012,.02,0,yb+.03,L/2+.05,ACC,0);
  box(W*.36,.1,.02,0,yb+.1,L/2+.004,'#0b0c0f',1);[-1,1].forEach(s=>box(W*.2,.09,.02,s*W*.34,yb+.09,L/2+.004,'#0b0c0f',1));
  for(let k=0;k<3;k++)box(W*.34,.008,.024,0,yb+.07+k*.03,L/2+.006,CARB,1);
  [-1,1].forEach(s=>{box(.26,.03,.06,s*W*.33,.255,L/2-.04,'#e8fbff',2,-.35);box(.04,.08,.03,s*W*.46,.22,L/2-.005,LED,2);box(.2,.015,.03,s*W*.34,.22,L/2+.004,LED,2)});
  box(.1,.06,.012,0,.2,L/2+.006,'#f2f2f2',2);box(.07,.035,.014,0,.2,L/2+.007,INK,1);
  /* sides: side skirt with black edge, intakes with fins behind the doors, door seam, flush handle, mirrors on stalks */
  box(W+.03,.05,fo-ro-2*ra-.06,0,yb+.03,(fo+ro)/2,INK,1);box(W+.035,.012,fo-ro-2*ra-.06,0,yb+.06,(fo+ro)/2,ACC,0);
  [-1,1].forEach(s=>{const x=s*(W/2+.004);
   box(.014,.16,.11,x,yb+.2,-.53,'#0b0c0f',1);for(let k=0;k<4;k++)box(.02,.012,.11,x+s*.004,yb+.14+k*.035,-.53,CARB,1);
   box(.012,yh-yb-.1,.012,x,(yh+yb)/2,.52,dkc,1);box(.012,yh-yb-.1,.012,x,(yh+yb)/2,-.45,dkc,1);
   box(.04,.02,.08,s*(Wc/2+.03),.5,zf0-.07,INK,1);box(.1,.06,.12,s*(Wc/2+.1),.55,zf0-.06,col,0);box(.015,.045,.1,s*(Wc/2+.15),.55,zf0-.06,'#ffab2e',2)});
  /* rear: ducktail, full-width light bar, diffuser fins, quad exhausts */
  box(W-.1,.03,.1,0,.53,-L/2+.06,dk2,0);
  box(W*.98,.12,.012,0,.345,-L/2-.002,INK,1);box(W*.94,.035,.02,0,.375,-L/2-.006,'#ff2a3a',2);[-1,1].forEach(s=>{box(.12,.07,.02,s*W*.42,.37,-L/2-.007,'#ff2a3a',2);box(.08,.03,.015,s*W*.25,.33,-L/2-.007,'#f2f2f2',2)});
  box(W+.02,.09,.12,0,yb+.06,-L/2+.03,INK,1);for(let k=-3;k<=3;k++)box(.012,.08,.16,k*.13,yb+.05,-L/2-.02,CARB,1);
  [-1,1].forEach(s=>[.36,.47].forEach(x=>{cyl(.04,.04,.1,s*x,yb+.12,-L/2-.03,CHR,0,10,Math.PI/2);cyl(.028,.028,.105,s*x,yb+.12,-L/2-.03,'#0a0a0c',1,10,Math.PI/2)}));
  /* swan-neck wing: two pylons from the deck, a wide blade with black trailing edge, endplates */
  [-1,1].forEach(s=>{box(.03,.2,.05,s*.3,.62,-L/2+.18,INK,1);box(.03,.05,.12,s*.3,.72,-L/2+.13,INK,1)});
  box(W+.04,.03,.24,0,.75,-L/2+.1,INK,1,.08);box(W+.04,.012,.03,0,.765,-L/2-.02,ACC,0);
  [-1,1].forEach(s=>box(.02,.14,.28,s*(W/2+.03),.73,-L/2+.1,col,0));
  /* wheels: tyre, dark rim face, five spokes, brake disc, black caliper, centre cap */
  [fo,ro].forEach(z=>[-1,1].forEach(s=>{const x=s*(W/2-.08),xo=s*(W/2-.0);
   /* tyre (outer face at W/2-.01), then layered outwards: dark rim well, brake disc, chrome rim, black caliper, spokes, centre cap */
   wheel(r,.14,x,r,z,RUB,1,20);wheel(r*.8,.01,s*(W/2-.006),r,z,'#2a2d33',1,18);wheel(r*.88,.006,s*(W/2-.008),r,z,CARB,1,20);
   wheel(r*.58,.008,s*(W/2-.0),r,z,DISC,0,16);
   wheel(r*.8,.008,s*(W/2+.01),r,z,CHR,0,20);wheel(r*.7,.009,s*(W/2+.0105),r,z,'#2a2d33',1,18);box(.006,.07,.05,s*(W/2+.0112),r+.075,z-.04,ACC,0,.6);
   for(let k=0;k<5;k++)box(.014,r*1.46,.036,s*(W/2+.012),r,z,CHR,0,k/5*Math.PI);
   wheel(r*.18,.016,s*(W/2+.018),r,z,ACC,0,10);wheel(r*.08,.02,s*(W/2+.02),r,z,INK,1,6)}));
  /* underglow */
  box(W*.8,.01,L*.7,0,.03,0,GLOW,2)})}

/* ---------- the lettering: canvas text on decal planes ---------- */
const FONT='"Silkscreen", ui-monospace, monospace';
function sideCanvas(){const c=document.createElement('canvas');c.width=1024;c.height=176;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
 /* black speed slash under the word, with three pixel dashes in front of it */
 x.fillStyle=ACC;x.beginPath();x.moveTo(120,168);x.lineTo(1020,140);x.lineTo(1020,160);x.lineTo(110,176);x.closePath();x.fill();
 [[20,60],[50,30],[70,14]].forEach(([a,w],k)=>x.fillRect(a,150+k*8,w,6));
 /* the word, sized to fill the panel: black outline, dark red drop shadow, white letters */
 let fs=170;x.font='700 '+fs+'px '+FONT;const w=x.measureText('DISBIMP').width;if(w>980){fs=Math.floor(fs*980/w);x.font='700 '+fs+'px '+FONT}
 x.textAlign='center';x.textBaseline='middle';x.lineJoin='miter';
 x.fillStyle='#5a0a10';x.fillText('DISBIMP',517,77);
 x.lineWidth=20;x.strokeStyle='#0c0d10';x.strokeText('DISBIMP',512,72);
 x.fillStyle='#ffffff';x.fillText('DISBIMP',512,72);
 return c}
function plateCanvas(){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
 x.fillStyle='#f4f4f0';x.fillRect(0,0,256,64);x.strokeStyle='#121318';x.lineWidth=6;x.strokeRect(3,3,250,58);
 x.fillStyle=ACC;x.fillRect(6,6,24,52);
 x.font='700 38px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#121318';x.fillText('DISBIMP',142,34);return c}
const TX={};
function texOf(k,mk){if(TX[k])return TX[k];const t=new THREE.CanvasTexture(mk());t.anisotropy=Math.max(8,(typeof renderer=='object'&&renderer&&renderer.capabilities&&renderer.capabilities.getMaxAnisotropy())||8);t.minFilter=THREE.LinearMipmapLinearFilter;TX[k]={t,mk};return TX[k]}
/* redraw once the pixel font has loaded */
try{document.fonts&&document.fonts.load('700 124px "Silkscreen"').then(()=>{for(const k in TX){TX[k].t.image=TX[k].mk();TX[k].t.needsUpdate=true}}).catch(()=>{})}catch(e){}
let DM=null;
function decalMats(){if(DM)return DM;const m=t=>new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 return DM={side:m(texOf('side',sideCanvas).t),plate:new THREE.MeshBasicMaterial({map:texOf('plate',plateCanvas).t})}}
const PG={};
function decals(){const {L,W,yb,yh,fo,ro,r}=SP,M=decalMats(),g=new THREE.Group();g.name='disbimp-decals';
 const sideLen=1.1,sh=sideLen*176/1024,rw=W*.55;
 PG.side=PG.side||new THREE.PlaneGeometry(sideLen,sh);PG.rear=PG.rear||new THREE.PlaneGeometry(rw,rw*176/1024);PG.plate=PG.plate||new THREE.PlaneGeometry(.3,.075);
 [-1,1].forEach(s=>{const p=new THREE.Mesh(PG.side,M.side);p.position.set(s*(W/2+.014),.3,.08);p.rotation.y=s*Math.PI/2;g.add(p)});
 const rr=new THREE.Mesh(PG.rear,M.side);rr.position.set(0,.45,-L/2-.008);rr.rotation.y=Math.PI;g.add(rr);
 const pf=new THREE.Mesh(PG.plate,M.plate);pf.position.set(0,yb+.11,L/2+.017);g.add(pf);
 const pr=new THREE.Mesh(PG.plate,M.plate);pr.position.set(0,yb+.2,-L/2-.012);pr.rotation.y=Math.PI;g.add(pr);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.renderOrder=2}});return g}

/* ---------- the car ---------- */
const I=CARS.length;CARS.push({n:'Disbimp',p:140000,c:BODY,top:42,mph:150,disbimp:1});
const CG={};
const geoOf=col=>CG[col]||(CG[col]=disGeo(col));
{const c0=carList;carList=function(i,cc,fixed){if(i!==I||cc!==undefined)return c0.apply(this,arguments);
  let col=BODY;try{const cu=S.carCust&&S.carCust[I];if(cu&&/^#[0-9a-f]{6}$/i.test(cu.c))col=cu.c}catch(e){}
  const a=[[SP.W,SP.yh-SP.yb,SP.L,col,0,(SP.yh+SP.yb)/2,0]];
  a.forEach=function(cb){const m=cb([1,1,1,'#fff',0,0,0]);if(m&&m.isMesh){m.geometry=geoOf(col);m.material=carMats();m.scale.set(1,1,1);m.add(decals())}};return a}}

/* the Cars shop: dev-xmas-items hides every car after the sleigh, so add this one's card back in */
if(typeof PA=='object'&&PA&&PA.cars&&typeof cardOf=='function'){const p0=PA.cars;PA.cars=function(){const h=String(p0.apply(this,arguments));
 try{if(h.includes("book('car',"+I+")")||h.includes('data-pv="c:'+I+'"'))return h;const c=CARS[I],own=(S.cars||[]).includes(I);
  const card=cardOf('c:'+I,c.n,'Top speed '+c.mph+' mph · DISBIMP livery',own?'<small class=m>Owned</small>':`<button class=go ${S.money<c.p?'disabled':''} onclick="book('car',${I})">Book · ${$$(c.p)}</button>`);
  const k=h.indexOf('<div class=cards>');return k<0?h+card:h.slice(0,k+17)+card+h.slice(k+17)}catch(e){console.warn('disbimp shop',e);return h}}}

/* dev: every career owns the Disbimp, and whenever it is in the garage it waits outside the garage door instead (the garage is
   unlocked for it). Checked every 3 s while you play; a Disbimp you drove somewhere else stays where you left it.
   Only runs in mode 'play': during boot (mode 'load') S is still the default state that the save is then loaded into. */
function place(){try{if(typeof S!='object'||!S||typeof mode=='undefined'||mode!='play'||typeof pcSpawn!='function')return;
 if(!Array.isArray(S.cars))S.cars=[];let ch=0;if(!S.cars.includes(I)){S.cars.push(I);ch=1}if(!S.garage){S.garage=1;ch=1}
 const j=S.cars.indexOf(I);if(!S.cpk||typeof S.cpk!='object'||Array.isArray(S.cpk))S.cpk={};
 if(!S.cpk[j]){const c=pcSpawn(j);if(c){S.cpk[j]=[c.x,c.z,0];ch=1}}
 if(ch)parkCars()}catch(e){console.warn('disbimp place',e)}}
setInterval(place,3000);

window.FW_DISBIMP={i:I,geo:geoOf,decals,spec:SP};
})();
