/* ===== v55.23.0: country edges (the land around every destination city) =====
   Destination cities (150-tour-cities.js) used to sit on one flat 2600 x 2600 plane of a single colour, so from the arrival
   flight the town and its suburbs (dev/dev-abroad-v1.js) looked like a square cut out of a green sheet. This file loads last
   and adds one more D.cityHooks entry, so it runs after every other city hook. It takes that plane away and builds real land
   that fits the country:
   - a height field (24-unit flat-shaded cells, about 3 km across) that stays flat under the town, the suburbs, the airport
     and the far-east rooms (x > ROOMX), then rolls into hills and mountains with a biome per destination (ID table):
     farmland and hedges, pine forest and lakes, olive groves and vineyards, savanna, dunes and oases, rice paddies and
     terraces, polders with tulips; a few landmarks on the horizon (PK table: Fuji, Table Mountain, Kilimanjaro, Sugarloaf,
     volcanoes, mine dumps; the pyramids are built as objects)
   - the coast: water cities get a sea that reaches the horizon and a coastline with bays and beaches outside the town
   - highways that leave the town and follow the valleys, with cars driving on them
   - a ragged ring of houses and low blocks outside the suburbs that thins out with distance, plus hamlets along the
     highways, farms with barns and silos, wind turbines or windmills that turn
   The player never walks out there (150 keeps you inside the town), so none of it has collision. Everything is merged into
   a few big meshes (MERGE tiles) and the terrain mesh's onBeforeRender moves the cars and rotors. Snow from
   dev/dev-christmas-v1.js settles on it too (it borrows SBM's uSnow uniform). Graphics presets with fewer crowds get fewer
   trees and houses.
   Test hook: window.FW_EDGES = {H(x,z) ground height in city-local units, last: stats of the last build}. */
(()=>{
const D=window.DCITY;if(!D||!D.cityHooks||typeof THREE=='undefined')return;
const Q=24,EXT=1700,XMAX=1520,ROOMX=960,FLAT=-.07,MERGE=5;
const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const h32=(a,b,s)=>{let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263)+Math.imul(s|0,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296};
function vn(x,z,s){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
 const a=h32(xi,zi,s),b=h32(xi+1,zi,s),c=h32(xi,zi+1,s),d=h32(xi+1,zi+1,s);return(a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*2-1}
function fbm(x,z,s,o){let t=0,a=1,n=0;for(let i=0;i<(o||4);i++){t+=vn(x,z,s+i*17)*a;n+=a;a*=.5;x=x*2.03+5.1;z=z*2.03+1.7}return t/n}
const TC=new THREE.Color(),TC2=new THREE.Color();

/* ---------- biomes ---------- */
const B0={
 temp:{gr:['#5f8f50','#679853','#58874a','#4f7d45'],fld:['#c9b45e','#86ad4a','#6d9c42','#8c6c46','#a9c262','#d9ca72'],rock:'#7f7d74',mtn:60,mtnD:520,roll:9,forest:.5,tr:{broad:.75,conifer:.25},farm:.8},
 brit:{gr:['#5f9450','#6aa057','#56884a','#4f8045'],fld:['#6aa04e','#78ae58','#5a8f44','#8fbb62','#c9b45e','#7c9a48'],rock:'#7a7a72',mtn:45,mtnD:480,roll:13,forest:.4,tr:{broad:.85,conifer:.15},farm:.9,hedge:1},
 boreal:{gr:['#4f7a48','#47713f','#5a8550','#53804a'],fld:['#a8b860','#c9b45e','#7aa04e'],rock:'#73776f',mtn:50,mtnD:450,roll:12,forest:.85,tr:{conifer:.82,birch:.18},farm:.3,lakes:5},
 alpine:{gr:['#5a8a4c','#4f7f45','#66944f','#557f48'],fld:['#8fb055','#a9b860'],rock:'#7d7a74',mtn:300,mtnD:330,roll:16,forest:.6,tr:{conifer:.8,broad:.2},farm:.25,snow:150},
 med:{gr:['#a3a35c','#9a9a55','#b0a866','#8e9450'],fld:['#cdb066','#b0a058','#8a8c4a','#b97c4c','#c9a45a'],rock:'#a8957a',mtn:90,mtnD:480,roll:12,forest:.35,tr:{cypress:.35,olive:.4,pine:.25},farm:.7,vine:1},
 arid:{gr:['#bf9a68','#b48d5c','#c9a874','#a98a5a'],fld:['#a8a058','#c2a062','#8f9a50'],rock:'#a0765a',mtn:150,mtnD:520,roll:10,forest:.15,tr:{palm:.5,olive:.5},farm:.3},
 sav:{gr:['#b8a860','#a99b54','#c4b46c','#9c9a52'],fld:['#c9b45e','#8a9a48'],rock:'#9a7a5a',mtn:70,mtnD:520,roll:8,forest:.3,tr:{acacia:1},farm:.25,lone:.12},
 trop:{gr:['#4f9a48','#58a64e','#40883f','#66ad57'],fld:['#7cbc4c','#9ac850','#5f9e3c','#a8b85a'],rock:'#6f6a5e',mtn:90,mtnD:450,roll:10,forest:.7,tr:{palm:.45,broad:.55},farm:.5},
 desert:{gr:['#dcc28c','#d4b67c','#e4cc98','#cfae74'],fld:null,rock:'#b8905e',mtn:40,mtnD:600,roll:3,forest:0,tr:{palm:1},farm:0,dunes:1,lakes:2,oasis:1},
 asia:{gr:['#5f9050','#6a9a56','#55854a','#4f7f46'],fld:['#86bc50','#76ac44','#9cc85a','#7fb8a0'],rock:'#77756c',mtn:150,mtnD:420,roll:12,forest:.65,tr:{conifer:.45,broad:.55},farm:.75,paddy:1}};
const ID={nyc:['temp',{mtn:40,barn:1}],la:['med',{mtn:170,mtnD:380,tr:{palm:.45,olive:.55},vine:0}],mia:['trop',{mtn:0,roll:2}],tor:['boreal',{mtn:30,farm:.6,barn:1,lakes:3}],
 mex:['arid',{gr:['#9aa060','#a8a066','#8f9458','#b0a46a'],mtn:200,snow:205}],rio:['trop',{mtn:170,mtnD:300}],sao:['trop',{mtn:70}],bue:['temp',{mtn:0,roll:4,farm:1}],
 col:['alpine',{snow:0,gr:['#4f9a48','#58a64e','#40883f','#66ad57'],tr:{broad:.6,palm:.4},mtn:260}],chl:['alpine',{}],
 lon:['brit',{}],man:['brit',{mtn:70}],par:['temp',{mtn:25,roll:7,vine:.4}],ber:['temp',{mtn:15,roll:6,tr:{conifer:.7,broad:.3},turb:1}],
 mad:['med',{gr:['#b4a466','#a8985c','#bfae70','#9c9456'],mtn:130}],bcn:['med',{mtn:110}],rom:['med',{mtn:110}],
 ams:['temp',{mtn:0,roll:1.2,mill:1,turb:1,forest:.12,tulip:1}],swe:['boreal',{turb:1}],irl:['brit',{mtn:90,roll:18}],
 lag:['trop',{mtn:0,roll:3}],jnb:['sav',{mtn:40}],cpt:['med',{mtn:110}],cai:['desert',{mtn:30}],ken:['sav',{}],mar:['arid',{mtn:230,mtnD:620,snow:205}],
 tyo:['asia',{}],osa:['asia',{mtn:170}],sel:['asia',{mtn:200,mtnD:360}],sha:['asia',{mtn:0,roll:2}],mum:['trop',{mtn:60,paddy:1}],dxb:['desert',{mtn:0}],
 bkk:['trop',{mtn:0,roll:2,paddy:1}],idn:['trop',{mtn:120,paddy:1}],
 syd:['med',{gr:['#7d9a58','#86a05e','#73904f','#80975a'],tr:{euc:1},mtn:110,vine:0}],mel:['med',{gr:['#8a9f5c','#93a464','#7f965a'],tr:{euc:.8,cypress:.2},mtn:60}],
 nzl:['brit',{gr:['#5aa04a','#66ad55','#4f9442','#60a650'],mtn:150,roll:24,tr:{conifer:.5,broad:.5}}]};
/* landmarks on the horizon: x,z in km from the middle of the town (north is -z; the arrival flight looks north-west) */
const PK={tyo:[{x:-.95,z:-.8,r:560,h:330,t:'cone',snow:.6}],osa:[{x:-.8,z:-.9,r:300,h:140,t:'cone'}],
 ken:[{x:-.55,z:-1.05,r:640,h:290,t:'cone',snow:.74,flat:.16}],cpt:[{x:.05,z:-.6,r:330,h:150,t:'mesa'},{x:-.32,z:-.52,r:120,h:105,t:'cone'}],
 rio:[{x:-.56,z:.17,r:72,h:120,t:'dome'},{x:-.42,z:-.5,r:170,h:170,t:'cone',statue:1}],idn:[{x:-.65,z:-.85,r:440,h:250,t:'cone',crater:1}],
 mex:[{x:-.75,z:-.95,r:470,h:270,t:'cone',snow:.68},{x:-.2,z:-1.15,r:380,h:200,t:'cone',snow:.8}],nzl:[{x:-.55,z:-.5,r:210,h:95,t:'cone',crater:1}],
 chl:[{x:-.3,z:-.95,r:420,h:380,t:'cone',snow:.45}],jnb:[{x:-.36,z:-.32,r:70,h:26,t:'mesa',c:'#d8c27a'},{x:.18,z:-.36,r:55,h:20,t:'mesa',c:'#e0cc88'},{x:-.05,z:-.45,r:60,h:24,t:'mesa',c:'#d2b870'}],
 mar:[{x:-.6,z:-1.1,r:500,h:300,t:'cone',snow:.62}]};
const TULIP=['#e8323a','#f4d23a','#e86ab0','#8a4ad0','#f4f0e8','#ff7a2a'];

/* ---------- small helpers ---------- */
const own=m=>{m.userData.dsOwn=1;if(m.geometry)m.geometry.userData.dsOwn=1;if(m.material&&m.material.userData)m.material.userData.dsOwn=1;return m};
/* xgCell buckets by 60 units; out here that would be thousands of meshes, so cells are merged into MERGE x MERGE tiles first */
function flushBig(G,par,mat){const T={c:{}};for(const k in G.c){const B=G.c[k];if(!B.I.length)continue;const p=k.split(','),K=Math.floor(+p[0]/MERGE)+','+Math.floor(+p[1]/MERGE),
 O=T.c[K]||(T.c[K]={P:[],N:[],C:[],I:[]}),off=O.P.length/3;for(let i=0;i<B.P.length;i++){O.P.push(B.P[i]);O.N.push(B.N[i]);O.C.push(B.C[i])}for(let i=0;i<B.I.length;i++)O.I.push(B.I[i]+off)}
 G.c={};let n=0;xgFlush(T,mat).forEach(m=>{scene.remove(m);own(m);m.material=mat;par.add(m);n++});return n}
/* quad on the ground through 4 points, turned to face up */
function gq(B,p,c){const ax=p[1][0]-p[0][0],ay=p[1][1]-p[0][1],az=p[1][2]-p[0][2],bx=p[3][0]-p[0][0],by=p[3][1]-p[0][1],bz=p[3][2]-p[0][2];if(az*bx-ax*bz<0)p=[p[3],p[2],p[1],p[0]];xgQuad(B,p,c)}
function snowPatch(m){try{const sh0=typeof SBM!='undefined'&&SBM.userData&&SBM.userData.xmsh,U=sh0&&sh0.uniforms&&sh0.uniforms.uSnow;m.userData.xms=1;if(!U)return;
 m.onBeforeCompile=function(sh){sh.uniforms.uSnow=U;sh.vertexShader='uniform float uSnow;\n'+sh.vertexShader.replace('#include <color_vertex>',`#include <color_vertex>
#ifdef USE_COLOR
 {vec3 c0=vColor;float water=step(.4,c0.b-c0.r);float top=smoothstep(.55,.85,normal.y);vColor=mix(c0,vec3(.94,.955,.975),top*(1.-water)*.9*uSnow);}
#endif`)};m.customProgramCacheKey=()=>'fwedge-snow'}catch(e){}}
function pickW(o,r){let t=0;for(const k in o)t+=o[k];let u=r*t;for(const k in o){u-=o[k];if(u<=0)return k}return Object.keys(o)[0]}

/* ---------- trees (y = ground height) ---------- */
function treeOf(G,kind,x,y,z,k,r,bi){const bx=(w,h,d,c,yy,ox,oz,ry)=>xgBox(G,w,h,d,c,x+(ox||0),y+yy,z+(oz||0),ry||0),j=c=>dk(c,.88+r*.24);
 switch(kind){
 case'conifer':{const c=j('#2f5a3a');bx(.45*k,1.4*k,.45*k,'#5a4030',.7*k);xgPrism(G,2.5*k,.2*k,3.4*k,6,c,x,y+1.1*k,z,{ph:r});xgPrism(G,2*k,.15*k,3*k,6,dk(c,1.08),x,y+3.1*k,z,{ph:r+.5});xgPrism(G,1.4*k,0,2.8*k,6,dk(c,1.15),x,y+5*k,z,{ph:r});return}
 case'birch':{bx(.35*k,3.4*k,.35*k,'#e8e4dc',1.7*k);bx(2.2*k,2.4*k,2.2*k,j('#7aa84a'),4.2*k);bx(1.4*k,1.2*k,1.4*k,j('#86b456'),5.8*k);return}
 case'palm':{const h=(5+r*3.5)*k,lean=(r-.5)*.5;for(let i=0;i<5;i++)bx(.42-i*.04,h/5+.05,.42-i*.04,i%2?'#8a6a42':'#7a5a38',h/10+i*h/5,lean*i*.35);
  const tx=lean*1.6,c=j('#4f8a3a');for(let i=0;i<6;i++){const a=i/6*Math.PI*2+r*3,ca=Math.cos(a),sa=Math.sin(a);xgBox(G,3.4*k,.22,.9*k,c,x+tx+ca*1.5*k,y+h+.1,z+sa*1.5*k,-a);xgBox(G,1.6*k,.22,.8*k,dk(c,.85),x+tx+ca*3.3*k,y+h-.5,z+sa*3.3*k,-a)}
  bx(.9,.7,.9,'#6a5a2a',h+.1,tx);return}
 case'acacia':{bx(.45*k,3*k,.45*k,'#5a4030',1.5*k);bx(.3*k,1.4*k,.3*k,'#5a4030',3.2*k,.6*k);const c=j('#6f8a3a');bx(6.4*k,.9*k,5.6*k,c,3.6*k,.3*k);bx(4.4*k,.6*k,3.8*k,dk(c,1.1),4.25*k,.3*k);return}
 case'cypress':{bx(.35*k,1*k,.35*k,'#5a4030',.5*k);xgPrism(G,1.05*k,.25*k,7.5*k,6,j('#2f4a2e'),x,y+.6*k,z,{ph:r});return}
 case'olive':{bx(.4*k,1.6*k,.4*k,'#6a5a48',.8*k);bx(2.8*k,1.6*k,2.8*k,j('#7f8f5a'),2.2*k);bx(1.8*k,.9*k,1.8*k,j('#8a9a66'),3.2*k,.2*k);return}
 case'pine':{bx(.4*k,5*k,.4*k,'#6a5040',2.5*k);bx(5.6*k,1.3*k,5.6*k,j('#3f6a3a'),5.4*k);bx(3.8*k,.8*k,3.8*k,j('#477540'),6.3*k);return}
 case'euc':{bx(.4*k,4.6*k,.4*k,'#cfc6b4',2.3*k);bx(3*k,2*k,2.6*k,j('#6f8a5a'),5*k,.4*k);bx(2*k,1.4*k,2.2*k,j('#7a9662'),6.4*k,-.5*k);return}
 case'cactus':{bx(.5,2.6*k,.5,'#4f8a45',1.3*k);bx(1.1,.35,.35,'#4f8a45',1.5*k);bx(.35,1*k,.35,'#4f8a45',2*k,.6);return}
 default:{const c=j(bi&&bi.tc||'#3f8a4a');bx(.45*k,1.9*k,.45*k,'#6a4a2a',.95*k);bx(3.2*k,2.4*k,3.2*k,c,2.9*k);bx(2.1*k,1.4*k,2.1*k,dk(c,1.1),4.6*k)}}}

/* ---------- build ---------- */
function build(C){const t0=performance.now(),s=C.s,W=C.W,zM=C.zMax,seed=(typeof fHash=='function'?fHash('edge-'+C.id):C.id.length*7919)|0;
 const id=C.id,row=ID[id]||[s.desert?'desert':s.snow?'alpine':s.palm?'trop':'temp',{}],bi=Object.assign({},B0[row[0]],row[1]);
 bi.tc=['#3f8a4a','#4a8f45','#3a7f42'][seed&3%3]||'#3f8a4a';
 let q=1;try{const g=gfxCur();q=g.crowd>=4?1:g.crowd>=2?.75:.5}catch(e){}
 const fx0=-178,fx1=W+178,fz0=-178,fz1=zM+178,cx0=W/2,cz0=zM/2,water=!!s.water,wz=C.wz,a=C.air||{z0:zM/2-26,z1:zM/2+26};
 const dOut=(x,z)=>Math.hypot(Math.max(0,fx0-x,x-fx1),Math.max(0,fz0-z,z-fz1));
 const coast=x=>{if(!water)return 1e9;const dx=Math.max(0,fx0-x,x-fx1);return wz+ss(0,260,dx)*(fbm(x/330,3.7,seed+9,3)*240+50)};
 const peaks=(PK[id]||[]).map(p=>Object.assign({},p,{x:cx0+p.x*1000,z:cz0+p.z*1000}));
 /* raw land (no sea, roads or lakes) */
 function land(x,z){const w=dOut(x,z)+48*fbm(x/170,z/170,seed+1,3);let m=ss(25,250,w)*(1-ss(ROOMX-260,ROOMX,x));if(m<=0)return 0;
  let h=bi.roll*(fbm(x/210,z/210,seed+2,3)*.5+.5);
  if(bi.dunes){const an=(x*.8+z*.6)/46+2.2*fbm(x/300,z/300,seed+3,2);h+=8*Math.pow(Math.abs(Math.sin(an)),.7)*(.6+.4*fbm(x/400,z/400,seed+4,2))}
  if(bi.mtn){const k=ss(bi.mtnD*.55,bi.mtnD*1.5,w);if(k>0){const r=1-Math.abs(fbm(x/520,z/520,seed+5,4));h+=bi.mtn*k*Math.pow(r,2.2)*(.55+.45*(fbm(x/900,z/900,seed+6,2)*.5+.5))}}
  h*=m;
  /* the planes climb out north over the end of the runway: keep that sky clear */
  if(z<fz0+40){const c=1-ss(110,260,Math.abs(x+96)),cap=20+(fz0+40-z)*.22;if(c>0&&h>cap)h-=c*(h-cap)}
  return h}
 let LP=null;/* the peak that shaped the last H0 call (for colours) */
 function H0(x,z){let h=FLAT+land(x,z);
  if(water){const sd=z-coast(x);if(sd>0)h=-.75-Math.min(9,sd*.05);else{const k=ss(0,170,-sd);h=FLAT+(h-FLAT)*k}}
  LP=null;for(const p of peaks){const d=Math.hypot(x-p.x,z-p.z);if(d>=p.r)continue;const u=d/p.r;let ph;
   if(p.t=='cone'){ph=p.h*Math.pow(1-u,1.55);if(p.flat&&u<p.flat)ph=p.h*Math.pow(1-p.flat,1.55);if(p.crater&&u<.09)ph-=(.09-u)*p.h*1.4}
   else if(p.t=='mesa'){ph=p.h*ss(1,.72,u)*(1+.02*vn(x/30,z/30,seed+31))}else ph=p.h*Math.sqrt(Math.max(0,1-u*u))*(u<.85?1:ss(1,.85,u)*1);
   ph*=1-ss(ROOMX-200,ROOMX,x);const t=FLAT+ph+(p.t=='dome'?0:3*fbm(x/60,z/60,seed+40,2)*(1-u));if(t>h){h=t;LP={p,u,ph}}}
  return h}
 /* ---------- highways ---------- */
 const gx0=Math.floor((cx0-EXT)/Q)*Q,gz0=Math.floor((cz0-EXT)/Q)*Q,gx1=Math.ceil(Math.min(cx0+EXT,XMAX)/Q)*Q,gz1=Math.ceil((cz0+EXT)/Q)*Q;
 const inG=(x,z)=>x>gx0+20&&x<gx1-20&&z>gz0+20&&z<gz1-20;
 const roads=[];
 function road(x,z,ang,k){const P=[[x,z]];let a=ang;for(let i=0;i<120;i++){const tgt=ang+.55*vn(i/8,k*3.1,seed+50);let best=null,bs=1e9;const h0=H0(x,z);
   for(const da of [-.3,-.15,0,.15,.3]){const b=a+da,nx=x+Math.cos(b)*16,nz=z+Math.sin(b)*16,hn=H0(nx,nz);let sc=Math.abs(hn-h0)*3+Math.abs(b-tgt)*5+Math.abs(da)*1.5;
    if(hn<-.15)sc+=1e6;if(nx>ROOMX-140)sc+=1e6;if(dOut(nx,nz)<dOut(x,z)-1&&i>2)sc+=40;if(sc<bs){bs=sc;best=[b,nx,nz]}}
   if(bs>=1e5)break;a=best[0];x=best[1];z=best[2];if(!inG(x,z))break;P.push([x,z])}
  if(P.length<6)return;const hp=P.map(p=>Math.max(FLAT,H0(p[0],p[1])));
  for(let pass=0;pass<4;pass++){const o=hp.slice();for(let i=0;i<hp.length;i++){let t=0,n=0;for(let j=-4;j<=4;j++){const k2=i+j;if(k2>=0&&k2<hp.length){t+=o[k2];n++}}hp[i]=t/n}}
  for(let i=0;i<Math.min(4,hp.length);i++)hp[i]=FLAT;const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  roads.push({P,hp,L})}
 road(C.cx+12,fz0+8,-Math.PI/2,1);road(fx1-50,fz0+8,-1.05,2);road(fx0+8,Math.min(fz0+60,a.z0-150),Math.PI,3);
 if(!water)road(C.cx+30,fz1-8,Math.PI/2,4);else road(fx0+8,Math.min(wz-50,fz1-60),Math.PI-.15,5);
 /* segment bins for distance queries */
 const BIN=96,bins={},segs=[];roads.forEach((R,ri)=>{for(let i=0;i<R.P.length-1;i++){const A=R.P[i],B=R.P[i+1],sg={ri,i,A,B};segs.push(sg);
  const kx0=Math.floor((Math.min(A[0],B[0])-40)/BIN),kx1=Math.floor((Math.max(A[0],B[0])+40)/BIN),kz0=Math.floor((Math.min(A[1],B[1])-40)/BIN),kz1=Math.floor((Math.max(A[1],B[1])+40)/BIN);
  for(let kx=kx0;kx<=kx1;kx++)for(let kz=kz0;kz<=kz1;kz++)(bins[kx+','+kz]=bins[kx+','+kz]||[]).push(sg)}});
 function nearRoad(x,z){const L=bins[Math.floor(x/BIN)+','+Math.floor(z/BIN)];let bd=1e9,bh=0;if(!L)return[bd,bh];
  for(const g of L){const ax=g.B[0]-g.A[0],az=g.B[1]-g.A[1],l2=ax*ax+az*az,t=Math.max(0,Math.min(1,((x-g.A[0])*ax+(z-g.A[1])*az)/l2)),px=g.A[0]+ax*t,pz=g.A[1]+az*t,d=Math.hypot(x-px,z-pz);
   if(d<bd){bd=d;const R=roads[g.ri];bh=R.hp[g.i]+(R.hp[g.i+1]-R.hp[g.i])*t}}return[bd,bh]}
 /* ---------- lakes and oases ---------- */
 const lakes=[];const rL=seedR(seed+70);
 for(let i=0;i<200&&lakes.length<(bi.lakes||0);i++){const an=rL()*Math.PI*2,dd=(bi.oasis?260:240)+rL()*560,x=cx0+Math.cos(an)*(dd+W/2),z=cz0+Math.sin(an)*(dd+zM/2),r=bi.oasis?18+rL()*14:32+rL()*46;
  if(!inG(x,z)||x>ROOMX-150-r||dOut(x,z)<120+r)continue;if(water&&z>coast(x)-r-60)continue;if(nearRoad(x,z)[0]<r*1.3+20)continue;if(lakes.some(l=>Math.hypot(l.x-x,l.z-z)<l.r+r+60))continue;
  let hi=-1e9,lo=1e9;for(let k=0;k<8;k++){const hh=H0(x+Math.cos(k)*r,z+Math.sin(k)*r);hi=Math.max(hi,hh);lo=Math.min(lo,hh)}if(hi-lo>r*.35)continue;
  const ph=rL()*7,rr=t=>r*(1+.22*Math.sin(t*3+ph)+.12*Math.sin(t*5+ph*2));lakes.push({x,z,r,rr,y:Math.max(FLAT,H0(x,z)-.4)})}
 function H(x,z){let h=H0(x,z);for(const l of lakes){const d=Math.hypot(x-l.x,z-l.z);if(d>l.r*1.6)continue;const R=l.rr(Math.atan2(z-l.z,x-l.x)),w=ss(R*.8,R*1.25,d);h=Math.min(h,l.y-1.6+(h-l.y+1.6)*w)}
  const nr=nearRoad(x,z);if(nr[0]<34){const w=ss(7,34,nr[0]);h=nr[1]+(h-nr[1])*w}return h}
 /* ---------- terrain grid ---------- */
 const nx=(gx1-gx0)/Q,nz=(gz1-gz0)/Q,HV=new Float32Array((nx+1)*(nz+1));
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)HV[j*(nx+1)+i]=H(gx0+i*Q,gz0+j*Q);
 const hv=(i,j)=>HV[j*(nx+1)+i];
 /* the ground under (x,z) on the same two triangles the mesh draws (diagonal from (x0,z1) to (x1,z0)) */
 function G(x,z){const fi=(x-gx0)/Q,fj=(z-gz0)/Q,i=Math.max(0,Math.min(nx-1,Math.floor(fi))),j=Math.max(0,Math.min(nz-1,Math.floor(fj))),u=fi-i,v=fj-j;
  if(u+v<=1)return hv(i,j)+(hv(i+1,j)-hv(i,j))*u+(hv(i,j+1)-hv(i,j))*v;return hv(i+1,j+1)+(hv(i,j+1)-hv(i+1,j+1))*(1-u)+(hv(i+1,j)-hv(i+1,j+1))*(1-v)}
 const forestM=(x,z)=>bi.forest?ss(.05,.32,fbm(x/280,z/280,seed+7,3)+(bi.forest-.5)*.7)*ss(70,170,dOut(x,z)):0;
 const cellT=new Uint8Array(nx*nz),cellK=new Int32Array(nx*nz);/* 0 grass 1 field 2 forest 3 rock/snow 4 water/beach 5 rows (vine, tulip) */
 const grC=bi.gr.map(c=>new THREE.Color(c)),gnd=new THREE.Color(s.ground),pos=new Float32Array(nx*nz*18),nrm=new Float32Array(nx*nz*18),colA=new Float32Array(nx*nz*18);
 let vi=0;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x0=gx0+i*Q,z0=gz0+j*Q,x1=x0+Q,z1=z0+Q,xc=x0+Q/2,zc=z0+Q/2,a00=hv(i,j),a10=hv(i+1,j),a01=hv(i,j+1),a11=hv(i+1,j+1),
  hm=(a00+a10+a01+a11)/4,sl=(Math.max(a00,a10,a01,a11)-Math.min(a00,a10,a01,a11))/Q,d=dOut(xc,zc),ci=j*nx+i,hr=h32(i,j,seed+3);
  H0(xc,zc);const lp=LP;let typ=0,key=0;
  const flat=Math.abs(a00-FLAT)<.01&&Math.abs(a10-FLAT)<.01&&Math.abs(a01-FLAT)<.01&&Math.abs(a11-FLAT)<.01&&d<1;
  if(flat&&!(water&&zc>wz)){TC.copy(gnd)}
  else{
   const v=fbm(xc/95,zc/95,seed+11,2)*.5+.5;TC.copy(grC[Math.min(grC.length-1,Math.floor(v*grC.length))]).lerp(grC[(Math.floor(v*grC.length)+1)%grC.length],(v*grC.length)%1*.5);
   const fo=forestM(xc,zc),bI=Math.floor(i/3),bJ=Math.floor(j/2),bh=h32(bI,bJ,seed+5);key=bI*7919+bJ;
   const farm=bi.fld&&bi.farm&&d>40&&d<880&&sl<.14&&fo<.35&&bh<bi.farm*(1-ss(500,880,d)*.7)&&!(lp&&lp.ph>8);
   if(farm){typ=1;const f=bi.paddy&&bh<.5?['#86bc50','#7fb8a0','#9cc85a','#6aa848'][Math.floor(h32(bI,bJ,seed+6)*4)]:bi.fld[Math.floor(h32(bI,bJ,seed+6)*bi.fld.length)];TC.set(f);
    if(bi.vine&&h32(bI,bJ,seed+8)<.22*bi.vine&&sl<.06){typ=5;TC.set('#8a6a48')}else if(bi.tulip&&h32(bI,bJ,seed+8)<.5&&sl<.06){typ=5;TC.set('#6a9a48')}}
   else if(fo>.5){typ=2;TC.multiplyScalar(.8)}
   if(bi.paddy&&!farm&&sl>.1&&sl<.5&&fo<.6&&d>60){const band=Math.floor(hm/2.6)%2;TC.set(band?'#86bc50':'#6fae48');typ=1}
   if(bi.dunes){const sh=.93+.1*Math.sin((xc*.8+zc*.6)/46*2+1.3);TC.multiplyScalar(sh)}
   if(sl>.45){TC2.set(bi.rock);TC.lerp(TC2,ss(.45,.95,sl));if(sl>.7)typ=3}
   if(bi.snow&&hm>bi.snow+30*vn(xc/80,zc/80,seed+12)){TC.set('#eef2f6');typ=3}
   if(lp){const p=lp.p;if(p.c&&lp.ph>4)TC.set(p.c).multiplyScalar(.92+.12*hr);else if(lp.ph>12&&!p.snow&&p.t!='mesa'&&sl>.3)TC.lerp(TC2.set(bi.rock),.4);
    if(p.snow&&lp.ph>p.h*p.snow+12*vn(xc/50,zc/50,seed+13)){TC.set('#f2f5f8');typ=3}if(p.t=='mesa'&&!p.c&&sl>.35)TC.set('#8a8a7e');if(p.t=='dome')TC.set(sl>.5?'#7a776e':'#4f7a45')}
   for(const l of lakes)if(Math.hypot(xc-l.x,zc-l.z)<l.r*1.15+Q){const R=l.rr(Math.atan2(zc-l.z,xc-l.x)),dd=Math.hypot(xc-l.x,zc-l.z);if(dd<R*1.1){TC.set(bi.oasis?'#c8b07a':'#6f8a5a');typ=4}else if(dd<R*1.25+12&&bi.oasis){TC.set('#5f9a48');typ=4}}
   if(water){const sd=zc-coast(xc);if(sd>-30&&hm<3.2){TC.set(sd>0?'#b8a878':'#e6d4a2');typ=4}}
   if(hm<-.2&&typ!=4){TC.set('#9a9a78');typ=4}
   const t=ss(0,150,d+40*vn(xc/120,zc/120,seed+14));if(t<1)TC.lerp(gnd,1-t)}
  cellT[ci]=typ;cellK[ci]=key;
  const jt=.96+.08*hr;TC.multiplyScalar(jt);
  /* two triangles: (x0,z1)(x1,z1)(x1,z0) and (x0,z1)(x1,z0)(x0,z0) */
  const tris=[[x0,a01,z1,x1,a11,z1,x1,a10,z0],[x0,a01,z1,x1,a10,z0,x0,a00,z0]];
  for(let ti=0;ti<2;ti++){const T=tris[ti],ux=T[3]-T[0],uy=T[4]-T[1],uz=T[5]-T[2],wx=T[6]-T[0],wy=T[7]-T[1],wz2=T[8]-T[2];let Nx=uy*wz2-uz*wy,Ny=uz*wx-ux*wz2,Nz=ux*wy-uy*wx;const l=Math.hypot(Nx,Ny,Nz)||1;
   if(Ny<0){Nx=-Nx;Ny=-Ny;Nz=-Nz}Nx/=l;Ny/=l;Nz/=l;const tk=ti?.985:1;
   for(let k=0;k<3;k++){pos[vi]=T[k*3];pos[vi+1]=T[k*3+1];pos[vi+2]=T[k*3+2];nrm[vi]=Nx;nrm[vi+1]=Ny;nrm[vi+2]=Nz;colA[vi]=TC.r*tk;colA[vi+1]=TC.g*tk;colA[vi+2]=TC.b*tk;vi+=3}}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nrm,3));geo.setAttribute('color',new THREE.BufferAttribute(colA,3));geo.computeBoundingSphere();
 const TM=new THREE.MeshLambertMaterial({vertexColors:true});snowPatch(TM);
 const ter=own(new THREE.Mesh(geo,TM));ter.name='fwEdgeTerrain';ter.receiveShadow=true;C.g.add(ter);
 /* the old flat plane goes, the sea gets big enough to reach the horizon */
 C.g.children.slice().forEach(m=>{const p=m.geometry&&m.geometry.type=='PlaneGeometry'&&m.geometry.parameters;if(!p)return;
  if(p.width==2600&&p.height==2600){C.g.remove(m);m.geometry.dispose();m.material.dispose()}
  else if(p.width==2400&&p.height==700&&water){const xa=W/2-2300,za=wz-260,w=XMAX-xa,h=3000;m.geometry.dispose();m.geometry=new THREE.PlaneGeometry(w,h);m.geometry.userData.dsOwn=1;m.position.x=xa+w/2;m.position.z=za+h/2;if(C.waterTx)C.waterTx.repeat.set(w/40,h/23)}});
 /* lake water */
 if(lakes.length){const LM=new THREE.MeshLambertMaterial({color:bi.oasis?'#3a9ab0':'#3f84b4'});snowPatch(LM);LM.userData.xms=1;
  lakes.forEach(l=>{const n=32,P=[l.x,l.y-.3,l.z];for(let k=0;k<n;k++){const t0=k/n*Math.PI*2,t1=(k+1)/n*Math.PI*2,R0=l.rr(t0)*1.02,R1=l.rr(t1)*1.02;P.push(l.x+Math.cos(t1)*R1,l.y-.3,l.z+Math.sin(t1)*R1,l.x+Math.cos(t0)*R0,l.y-.3,l.z+Math.sin(t0)*R0,l.x,l.y-.3,l.z)}
   P.length-=3;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();const m=own(new THREE.Mesh(g,LM));C.g.add(m)})}

 /* ---------- objects ---------- */
 const GS=xgNew(),R=seedR(seed+90),RR=(a2,b2)=>a2+R()*(b2-a2),pk=A=>A[Math.floor(R()*A.length)];
 const occ={},OC=10,isOcc=(x,z,r)=>{for(let i=Math.floor((x-r)/OC);i<=Math.floor((x+r)/OC);i++)for(let j=Math.floor((z-r)/OC);j<=Math.floor((z+r)/OC);j++)if(occ[i+','+j])return true;return false},
  take=(x,z,r)=>{for(let i=Math.floor((x-r)/OC);i<=Math.floor((x+r)/OC);i++)for(let j=Math.floor((z-r)/OC);j<=Math.floor((z+r)/OC);j++)occ[i+','+j]=1};
 const cellAt=(x,z)=>{const i=Math.floor((x-gx0)/Q),j=Math.floor((z-gz0)/Q);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
 const slopeAt=(x,z)=>{const e=4;return Math.max(Math.abs(G(x+e,z)-G(x-e,z)),Math.abs(G(x,z+e)-G(x,z-e)))/(2*e)};
 function bad(x,z,r,o){o=o||{};if(!inG(x,z)||x>ROOMX-110)return true;const d=dOut(x,z);if(d<(o.dmin==null?6:o.dmin)+r)return true;
  if(Math.abs(x+96)<70&&(z<fz0||z>fz1)&&d<500)return true;/* runway approach */
  if(water&&z>coast(x)-r-10)return true;const ci=cellAt(x,z);if(ci<0||cellT[ci]==4||(!o.rock&&cellT[ci]==3))return true;
  if(nearRoad(x,z)[0]<r+(o.road||6))return true;if(G(x,z)<FLAT-.1)return true;if(slopeAt(x,z)>(o.sl||.32))return true;return isOcc(x,z,r)}
 /* roads: asphalt, shoulders and centre dashes */
 roads.forEach(Rd=>{const P=Rd.P,hp=Rd.hp;for(let i=0;i<P.length-1;i++){const A=P[i],B=P[i+1],dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz),px=-dz/l,pz=dx/l,ya=hp[i]+.22,yb=hp[i+1]+.22,Bc=xgCell(GS,A[0],A[1]);
  const pts=(w,y0,y1)=>[[A[0]-px*w,y0,A[1]-pz*w],[A[0]+px*w,y0,A[1]+pz*w],[B[0]+px*w,y1,B[1]+pz*w],[B[0]-px*w,y1,B[1]-pz*w]];
  gq(Bc,pts(5.4,ya-.04,yb-.04),bi.dunes?'#c8b088':'#8a8a80');gq(Bc,pts(4.2,ya,yb),'#3a3c40');
  if(i%2==0){const ex=A[0]+dx*.6,ez=A[1]+dz*.6,ey=ya+(yb-ya)*.6+.02;gq(Bc,[[A[0]-px*.12,ya+.02,A[1]-pz*.12],[A[0]+px*.12,ya+.02,A[1]+pz*.12],[ex+px*.12,ey,ez+pz*.12],[ex-px*.12,ey,ez-pz*.12]],s.lang=='en'&&['nyc','la','mia','tor'].includes(id)?'#f2c418':'#f0f0e8')}
  /* reflector posts now and then */
  if(i%5==2)[-5.8,5.8].forEach(o=>xgBox(GS,.18,1,.18,'#e8e8e8',A[0]+px*o,ya+.4,A[1]+pz*o,0,'#e85a2a'))}
  for(let i=0;i<P.length;i++)take(P[i][0],P[i][1],5)});
 let nTree=0,nHouse=0;
 /* houses: walls and roofs per country */
 const roofs=s.terra||bi.vine?['#b8583a','#c8683a','#a84a2e']:row[0]=='asia'?['#3a4048','#464c56','#2f343c','#8a3a2a']:id=='swe'?['#3a3a3e','#4a3e36']:['#6a4a3a','#4a4e56','#8a3a2a','#5a5a60','#7a4a3a'];
 const walls=id=='swe'?['#9a2e24','#c88a3a','#a8322a','#e8dcc0']:row[0]=='trop'||row[0]=='arid'?s.walls.concat(['#f2ece0','#e8c8a0']):s.walls;
 const flatRoof=row[0]=='desert'||row[0]=='arid'||id=='mum'||id=='lag';
 function house(x,z,w,d,h,o){o=o||{};const y=Math.min(G(x-w/2,z-d/2),G(x+w/2,z-d/2),G(x-w/2,z+d/2),G(x+w/2,z+d/2),G(x,z))-.05,wall=o.wall||pk(walls);
  xgBox(GS,w,h+1.2,d,wall,x,y+(h+1.2)/2-1.2+.05,z,0,dk(wall,.8));const y1=y+h;
  if(o.flat||flatRoof){xgBox(GS,w+.3,.45,d+.3,dk(wall,.82),x,y1+.2,z)}else D.gable(GS,x-w/2-.3,z-d/2-.3,x+w/2+.3,z+d/2+.3,y1,Math.min(o.ridge||2.8,Math.min(w,d)*.36),o.roof||pk(roofs),wall,w>=d);
  const wc=dk(wall,.45),lit=R()<.3?'#ffd890':wc;
  if(!o.noWin){D.quadZ(GS,x-.6,x+.6,y+.05,y+2.1,z+d/2+.03,dk(wall,.55));for(let a2=x-w/2+1.2;a2<x+w/2-1;a2+=2.6){if(Math.abs(a2+.5-x)<1)continue;D.quadZ(GS,a2,a2+1,y+1.2,y+2.2,z+d/2+.03,R()<.3?lit:wc)}
   for(let zz=z-d/2+1.2;zz<z+d/2-1;zz+=2.6)D.quadX(GS,zz,zz+1,y+1.2,y+2.2,x+w/2+.03,R()<.25?lit:wc);
   if(h>6)for(let yy=y+4;yy<y1-1.2;yy+=3){D.quadZ(GS,x-w/2+.8,x+w/2-.8,yy,yy+1.3,z+d/2+.03,R()<.35?'#ffd890':wc);D.quadX(GS,z-d/2+.8,z+d/2-.8,yy,yy+1.3,x+w/2+.03,R()<.3?'#ffd890':wc)}}
  take(x,z,Math.max(w,d)/2+2);nHouse++}
 function block(x,z){const w=RR(10,16),d=RR(9,14),h=RR(10,26)*(.7+s.tall*.5),wall=pk(s.big&&R()<.4?s.glassC:s.walls);house(x,z,w,d,h,{flat:1,wall})}
 function barn(x,z){const y=G(x,z);house(x,z,10,14,5,{wall:'#a8322a',roof:'#5a5a5e',ridge:3.6,noWin:1});xgPrism(GS,2.2,2.2,11,10,'#c8ccd0',x+8.5,y-.5,z-3);xgPrism(GS,2.2,.2,2,10,'#9aa0a6',x+8.5,y+10.5,z-3);
  house(x-12,z+4,7,6,3.6,{});take(x,z,14)}
 function treeAt(x,z,kind,k){const y=G(x,z);treeOf(GS,kind,x,y-.05,z,k,R(),bi);take(x,z,1.5);nTree++}
 const kinds=bi.tr||{broad:1};
 /* 1. the ragged edge of town: houses and low blocks that thin out with distance from the suburbs */
 const per=2*((fx1-fx0)+(fz1-fz0));
 for(let i=0,n=0;i<2600&&n<230*q;i++){let t=R()*per,x,z,ox=0,oz=0;const dd=8+(-Math.log(1-R()*.995))*95;
  if(t<fx1-fx0){x=fx0+t;z=fz0;oz=-1}else if((t-=fx1-fx0)<fz1-fz0){x=fx1;z=fz0+t;ox=1}else if((t-=fz1-fz0)<fx1-fx0){x=fx1-t;z=fz1;oz=1}else{t-=fx1-fx0;x=fx0;z=fz1-t;ox=-1}
  x+=ox*dd+(ox?0:RR(-30,30)*(dd>40?1:0));z+=oz*dd+(oz?0:RR(-30,30)*(dd>40?1:0));
  if(R()>Math.exp(-dd/150)*(.75+.25*vn(x/60,z/60,seed+60)))continue;
  const big=s.big&&dd<110&&R()<.45,w=big?16:RR(6,10),dp=big?14:RR(5,8);if(bad(x,z,Math.max(w,dp)/2+1.5,{dmin:4}))continue;
  if(big)block(x,z);else house(x,z,w,dp,RR(3.2,4.8),{});n++;
  if(!big&&R()<.6){const tx=x+RR(-7,7),tz=z+RR(-7,7);if(!bad(tx,tz,1.2,{dmin:4}))treeAt(tx,tz,pickW(kinds,R()),RR(.8,1.1))}}
 /* 2. hamlets along the highways */
 roads.forEach(Rd=>{for(let v=0;v<3;v++){const k=Math.floor(Rd.P.length*(.25+v*.25+RR(-.06,.06)));if(k<4||k>=Rd.P.length-2)continue;const c=Rd.P[k];if(dOut(c[0],c[1])<160)continue;
  const n=Math.round(RR(7,16)*q);for(let i=0,m=0;i<n*8&&m<n;i++){const x=c[0]+RR(-70,70),z=c[1]+RR(-70,70),w=RR(6,10),dp=RR(5,8);if(bad(x,z,Math.max(w,dp)/2+1.5,{road:5}))continue;house(x,z,w,dp,RR(3.2,4.6),{});m++;
   if(R()<.5){const tx=x+RR(-6,6),tz=z+RR(-6,6);if(!bad(tx,tz,1.2))treeAt(tx,tz,pickW(kinds,R()),RR(.8,1.1))}}
  if(row[0]=='temp'||row[0]=='brit'||row[0]=='alpine'||id=='swe'){const x=c[0]+RR(-40,40),z=c[1]+RR(-40,40);if(!bad(x,z,5,{road:8})){const y=G(x,z);house(x,z,7,12,7,{wall:row[0]=='brit'?'#a8a090':'#e8e2d4',roof:'#4a4e56',noWin:1});xgBox(GS,3,9,3,row[0]=='brit'?'#a8a090':'#e8e2d4',x,y+9,z-4.5);xgPrism(GS,2.3,0,5,4,'#4a4e56',x,y+13.5,z-4.5,{ph:Math.PI/4})}}}});
 /* 3. farms in the fields */
 if(bi.farm)for(let i=0,n=0;i<600&&n<(bi.barn?22:14)*q;i++){const x=RR(gx0,gx1),z=RR(gz0,gz1),ci=cellAt(x,z);if(ci<0||cellT[ci]!=1||dOut(x,z)<120||Math.hypot(x-cx0,z-cz0)>1150)continue;if(bad(x,z,16))continue;
  if(row[0]=='temp'||row[0]=='brit'||id=='swe'||id=='tor'){barn(x,z);n++}else{house(x,z,RR(7,10),RR(6,8),RR(3.2,4),{});xgBox(GS,6,3,8,'#8a7a5a',x+9,G(x+9,z)+1.5,z);n++}}
 /* 4. pyramids (Cairo) */
 if(id=='cai')[[-560,-430,62],[-470,-520,56],[-390,-590,30]].forEach(([px,pz,r])=>{const x=cx0+px,z=cz0+pz,y=G(x,z)-.5;xgPrism(GS,r*1.414,0,r*1.27,4,'#d8bf88',x,y,z,{ph:Math.PI/4});xgPrism(GS,r*.25,0,r*.23,4,'#e8d8b0',x,y+r*1.04,z,{ph:Math.PI/4});take(x,z,r)});
 /* 5. a statue on the hill (Rio) */
 peaks.forEach(p=>{if(!p.statue)return;const y=G(p.x,p.z);xgBox(GS,3,4,3,'#d8d4c8',p.x,y+2,p.z);xgBox(GS,1.6,9,1.4,'#eeeae0',p.x,y+8.5,p.z);xgBox(GS,11,1.2,1.2,'#eeeae0',p.x,y+11.6,p.z);xgBox(GS,1.2,1.2,1.2,'#eeeae0',p.x,y+13.6,p.z)});
 /* 6. forests and lone trees */
 for(let i=0;i<9000&&nTree<1400*q;i++){const an=R()*Math.PI*2,rr=Math.sqrt(R())*1150,x=cx0+Math.cos(an)*rr,z=cz0+Math.sin(an)*rr,ci=cellAt(x,z);if(ci<0)continue;
  const fo=forestM(x,z),t=cellT[ci];let ok=t==2?R()<.9:t==0&&(R()<fo*.5||R()<(bi.lone||.025));if(t==1&&R()<.012)ok=true;if(!ok)continue;if(bad(x,z,1.2,{dmin:10,sl:.5}))continue;
  let kind=pickW(kinds,R());if(row[0]=='desert')kind=R()<.3?'cactus':null;if(!kind)continue;treeAt(x,z,kind,RR(.85,1.5)*(t==2?1.15:1))}
 /* oasis palms */
 if(bi.oasis)lakes.forEach(l=>{for(let k=0;k<22;k++){const t=R()*Math.PI*2,R0=l.rr(t)*RR(1.12,1.5),x=l.x+Math.cos(t)*R0,z=l.z+Math.sin(t)*R0;if(!isOcc(x,z,1))treeAt(x,z,'palm',RR(.9,1.3))}});
 /* 7. hedges between fields, and rows of vines or tulips */
 const rows=[];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const ci=j*nx+i,t=cellT[ci];if(t!=1&&t!=5)continue;const x0=gx0+i*Q,z0=gz0+j*Q,d=dOut(x0+Q/2,z0+Q/2);if(d>760)continue;
  if(t==5){const tc=bi.tulip?TULIP[Math.floor(h32(cellK[ci],1,seed)*TULIP.length)]:'#4f7a3a';for(let zr=z0+1.5;zr<z0+Q-1;zr+=3){const fz=(zr-z0)/Q,xm=x0+(1-fz)*Q,ym=G(xm,zr)+.12,ya=G(x0+.4,zr)+.12,yb=G(x0+Q-.4,zr)+.12,Bc=xgCell(GS,x0+Q/2,zr);
    gq(Bc,[[x0+.4,ya,zr],[xm,ym,zr],[xm,ym,zr+1.5],[x0+.4,ya,zr+1.5]],tc);gq(Bc,[[xm,ym,zr],[x0+Q-.4,yb,zr],[x0+Q-.4,yb,zr+1.5],[xm,ym,zr+1.5]],tc)}}
  if(!bi.hedge||R()>q)continue;const hc=dk('#3f6a36',.9+R()*.2);
  [[i+1,j,1],[i,j+1,0]].forEach(([i2,j2,vert])=>{if(i2>=nx||j2>=nz)return;const c2=j2*nx+i2;if((cellT[c2]==1||cellT[c2]==5)&&cellK[c2]==cellK[ci])return;
   for(let k=0;k<3;k++){const a2=(k+.5)*Q/3,x=vert?x0+Q:x0+a2,z=vert?z0+a2:z0+Q;if(nearRoad(x,z)[0]<8)continue;xgBox(GS,vert?1.2:Q/3,1.5,vert?Q/3:1.2,hc,x,G(x,z)+.55,z);if(R()<.12)treeOf(GS,'broad',x,G(x,z),z,RR(.8,1.1),R(),bi)}})}
 const nMesh=flushBig(GS,C.g,TM);
 /* ---------- moving parts: cars on the highways, turbines and windmills ---------- */
 const movers=[],carGeo=[];const BM=new THREE.MeshLambertMaterial({color:'#f0f2f4'});BM.userData.dsOwn=1;
 ['#d7262f','#f2f2f4','#2a6ad7','#3a3c40','#e8c040','#7a8a9a'].forEach(cc=>{const g0=xgNew();xgBox(g0,2,1,4.4,cc,0,.75,0);xgBox(g0,1.8,.8,2.2,dk(cc,.75),0,1.6,-.2,0,dk(cc,.6));xgBox(g0,2.1,.5,.7,'#1a1a1e',0,.25,1.4);xgBox(g0,2.1,.5,.7,'#1a1a1e',0,.25,-1.4);
  const ms=xgFlush(g0,TM);ms.forEach(m=>scene.remove(m));if(ms[0])carGeo.push(ms[0].geometry)});
 if(carGeo.length)roads.forEach((Rd,ri)=>{const tot=Rd.L[Rd.L.length-1];for(let k=0;k<Math.round(7*q);k++){const g=carGeo[(k+ri)%carGeo.length],m=own(new THREE.Mesh(g,TM));m.userData.dsOwn=1;C.g.add(m);
  movers.push({m,Rd,dir:k%2?1:-1,s0:R()*tot,v:RR(14,24),tot})}});
 const rot=[];function rotor(x,z,y,n,len,wid,col,spd,yaw){const parts=[];for(let k=0;k<n;k++){const b=new THREE.BoxGeometry(wid,len,.3);b.translate(0,len/2,0);b.rotateZ(k/n*Math.PI*2);parts.push(b.toNonIndexed())}
  const P=[],N=[];parts.forEach(b=>{P.push(...b.attributes.position.array);N.push(...b.attributes.normal.array);b.dispose()});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  const mt=col?new THREE.MeshLambertMaterial({color:col}):BM;const m=own(new THREE.Mesh(g,mt));const piv=new THREE.Group();piv.position.set(x,y,z);piv.rotation.y=yaw;m.position.z=0;piv.add(m);C.g.add(piv);rot.push({m,spd,ph:R()*6})}
 if(bi.turb)for(let i=0,n=0;i<400&&n<9;i++){const an=-Math.PI*RR(.15,.95),dd=RR(380,900),x=cx0+Math.cos(an)*dd,z=cz0+Math.sin(an)*dd*.9;if(bad(x,z,8,{sl:.2}))continue;const y=G(x,z);
  xgPrism(GS,1.3,.6,44,8,'#e8eaec',x,y-.5,z);xgBox(GS,2,2,5,'#e8eaec',x,y+44.5,z-.5);rotor(x,z+2.3,y+44.5,3,21,1.4,null,1.3,Math.PI/4*0);take(x,z,10);n++}
 if(bi.mill)for(let i=0,n=0;i<400&&n<6;i++){const an=-Math.PI*RR(.1,.9),dd=RR(260,700),x=cx0+Math.cos(an)*dd,z=cz0+Math.sin(an)*dd*.9;if(bad(x,z,6,{sl:.2}))continue;const y=G(x,z);
  xgPrism(GS,4.2,2.6,11,8,'#4a5a48',x,y-.3,z,{ph:Math.PI/8});xgPrism(GS,4.6,4.6,.5,8,'#6a5040',x,y+3.5,z,{ph:Math.PI/8});xgPrism(GS,2.8,.6,3,8,'#5a4a3a',x,y+10.7,z,{ph:Math.PI/8});rotor(x,z+3.2,y+11.4,4,10,1.8,'#e8e0d0',.5,0);take(x,z,8);n++}
 const n2=flushBig(GS,C.g,TM);
 const tmp=new THREE.Vector3();
 ter.onBeforeRender=function(){const t=performance.now()/1000;
  for(const c of movers){const Rd=c.Rd,L=Rd.L;let sp=(((c.s0+c.dir*c.v*t)%c.tot)+c.tot)%c.tot;let lo=0,hi=L.length-1;while(hi-lo>1){const md=(lo+hi)>>1;if(L[md]<=sp)lo=md;else hi=md}
   const A=Rd.P[lo],B=Rd.P[hi],u=(sp-L[lo])/((L[hi]-L[lo])||1),dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1,o=c.dir*2.1;
   c.m.position.set(A[0]+dx*u-dz/l*o,Rd.hp[lo]+(Rd.hp[hi]-Rd.hp[lo])*u+.22,A[1]+dz*u+dx/l*o);c.m.rotation.y=Math.atan2(dx*c.dir,dz*c.dir);c.m.updateMatrixWorld()}
  for(const r of rot){r.m.rotation.z=-(t*r.spd+r.ph);r.m.updateMatrixWorld()}};
 C.edge={H:G,roads,lakes,biome:row[0]};
 const st={id,biome:row[0],ms:Math.round(performance.now()-t0),cells:nx*nz,trees:nTree,houses:nHouse,roads:roads.map(r=>r.P.length),lakes:lakes.length,meshes:nMesh+n2,cars:movers.length,rotors:rot.length};
 window.FW_EDGES.last=st;return st}
function seedR(sd){let a=sd>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
window.FW_EDGES={H:(x,z)=>{const C=D.C;return C&&C.edge?C.edge.H(x,z):null},last:null,build};
D.cityHooks.push(C=>{try{build(C)}catch(e){console.error('country edges',e)}});
})();
