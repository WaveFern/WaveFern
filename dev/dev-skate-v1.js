/* ===== dev only: Skate Park, a skateboarding minigame on the south side of the island (v55.17.0) =====
   Loaded after dev-fishing-v1.js. Add ?noskate to skip it. Nothing runs unless the island is on.
   PLACE   A concrete skate park (120 x 64 m) on the open grass south of the town, with a Board Shop hut (rent a board $10, buy decks and
           trucks that change how the board feels), a rack of boards, two quarter pipes, a half-pipe, a full pool bowl, a flat rail, a kinked
           rail, two manual pads, a funbox, a stair set with a handrail, a big gap with a kicker, a ledge line, a wallride wall, benches, bins,
           graffiti murals, floodlights that glow at dusk, a leaderboard, three NPC skaters and Rex the coach. Real metres, blocky, every static
           mesh is merged (vertex colours). Ramps are extruded profiles and the pool is a height field, drawn from the SAME analytic height
           function the board rides on (hH), so the board follows every surface exactly. On foot the ramps and props are solid (cols).
   PLAY    E at a board in the rack (or at the hut) opens the session menu: Free skate, 2 minute Score Run, S-K-A-T-E against Dex, Challenges.
           W push, A/D steer, S brake, hold SPACE and let go to ollie (longer hold = higher). In the air: J kickflip, K heelflip, L shove-it,
           Q/E spin (180 to 900), hold F (+ W/A/S/D) for grabs. Land on a rail to grind (A/D keep your balance), hold SHIFT for a manual (W/S
           keep your balance), jump at the wallride wall to run along it. Landings are clean, sketchy or a bail (a funny tumble, then you are up
           again in a second and a half). Tricks make a combo: points x multiplier, it banks when you roll for 1.4 s without a trick and is lost
           when you bail. Rex the coach teaches new tricks as you land the old ones. Esc pauses. After a bail or a run you get a slow-motion
           side-on replay of your best trick.
   PHYSICS The board is a particle on the height field: ground motion uses the true constrained equation a = -grad(H) (g + v.Hess(H).v)/(1+|grad H|^2),
           so a transition conserves energy (a bit of rolling drag and carving scrub only); the board leaves the surface when the normal force
           would go negative (a lip, an edge) and lands again by the same function. Cliffs (steps, walls) are detected against the predicted slope.
   STATE   S.skate={best,runs,tricks:{id:count},challenges:{id:done},deck,...} (lazy defaults in st(), saved like S.surf).
   HOOKS   FW_MASTERY.add('skate',..) per banked combo and at the end of a run (guarded). Test hook: window.FW_SKATE (bottom of the file).
   RIDER v55.28.0  The skater is a jointed rig (skRig/applyFrame): hip, torso and head plus two-bone IK legs and arms (thigh/shin, upper arm/forearm). Feet are
           planted on the deck (or the ground while pushing) by IK with knees bending forward, hands reach for the real grab spots on the board, a crouch
           spring absorbs landings and pops, the back foot pushes in a cycle, flips flick the feet, carves lean the body, and everything is eased from the
           same 24 number frames, so replays, Dex, Mika, Juno and Kai use it too. The old rig stays as applyFrame0 for any record without a hip.
   Mode is 'skate' while a session runs (capture-phase keys, own camera through a renderer.render wrapper, HUD #skhud). */
(function(){
if(!window.FW_ISLAND||/[?&]noskate/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined'||typeof renderer=='undefined'||typeof cam=='undefined'||typeof P=='undefined')return;
const FI=window.FW_ISLAND,GR=FI.grass;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rr=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1)),pk=a=>a[Math.floor(Math.random()*a.length)];
const PI=Math.PI,TAU=PI*2,sgn=v=>v<0?-1:1;
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const angd=a=>{a=(a+PI)%TAU;if(a<0)a+=TAU;return a-PI};/* wrap to -pi..pi */
const sn=k=>{try{snd(k)}catch(e){}},say2=t=>{try{say(t)}catch(e){}},sv=()=>{try{autoSave()}catch(e){}};
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};
const softSeen={};function soft(e,t){if(!softSeen[t]){softSeen[t]=1;console.error('skate '+t,e)}}
const dayNo=()=>Math.max(1,S.day||1);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const fmtN=n=>Math.round(n).toLocaleString('en-US');

/* ---------- saved state (lazy, old saves start empty) ---------- */
const st=()=>{let o=S.skate;if(!o||typeof o!='object')o=S.skate={};
 const d={best:0,runs:0,deck:0,trk:0,ownD:0,ownT:1,les:0,wins:0,losses:0,rent:0,bestCombo:0,bails:0,landed:0,sessions:0,secs:0,earn:0,bestAir:0,bestGrind:0};
 for(const k in d)if(typeof o[k]!=typeof d[k])o[k]=d[k];
 if(!o.tricks||typeof o.tricks!='object')o.tricks={};if(!o.challenges||typeof o.challenges!='object')o.challenges={};
 if(!(o.ownT&1))o.ownT|=1;if(o.deck<0||o.deck>=DECKS.length||(o.deck>0&&!(o.ownD>>o.deck&1)))o.deck=0;if(o.trk<0||o.trk>=TRUCKS.length||!(o.ownT>>o.trk&1))o.trk=0;
 if(o.les<0||o.les>LES.length)o.les=0;return o};

/* ---------- gear: decks and trucks change the feel ---------- */
const DECKS=[
 {n:'Rental Plank',price:0,pop:.9,spd:.93,spin:.9,stab:1.05,col:'#c9a35a',tape:'#2b2b2b',wh:'#f2c14e',tx:'Heavy, forgiving and a little slow. Comes with the $10 rental.'},
 {n:'Street 8.0',price:90,pop:1.05,spd:1,spin:1.05,stab:1,col:'#d9483b',tape:'#222',wh:'#f4f1e8',tx:'A proper all-rounder. Good pop, good feel.'},
 {n:'Cruiser Wave',price:160,pop:.95,spd:1.14,spin:.88,stab:1.12,col:'#2aa7a1',tape:'#1d2b2b',wh:'#ffd23d',tx:'Wide and fast with soft wheels. Stable on rails, slower to spin.'},
 {n:'Pro Popsicle',price:320,pop:1.24,spd:1.05,spin:1.2,stab:.92,col:'#3a7bd5',tape:'#111',wh:'#ff6f61',tx:'Light and snappy. Pops high and spins fast, but lands less forgiving.'},
 {n:'Gold Edition',price:800,pop:1.3,spd:1.18,spin:1.25,stab:1.04,col:'#e6b422',tape:'#2a1c0a',wh:'#fff3d9',tx:'Limited run. Fast, high and steady. The board the legends ride.'}];
const TRUCKS=[
 {n:'Stock Trucks',price:0,turn:1,bal:1,spd:1,tx:'The ones it came with.'},
 {n:'Loose Carvers',price:60,turn:1.26,bal:.9,spd:.96,tx:'Turn on a dime and carve the bowl. Wobblier on rails.'},
 {n:'Tight Grinders',price:120,turn:.84,bal:1.28,spd:1.04,tx:'Locked in: rails and manuals are far easier to balance.'},
 {n:'Pro Hollow',price:260,turn:1.1,bal:1.16,spd:1.1,tx:'Light, fast and steady. The best of both.'}];
const gear=()=>{const o=st(),d=DECKS[o.deck],t=TRUCKS[o.trk];return{d,t,pop:d.pop,spd:d.spd*t.spd,spin:d.spin,stab:d.stab,turn:t.turn,bal:t.bal*d.stab}};

/* ---------- tricks: id, name, base points, kind, difficulty (mastery weight), lesson needed ---------- */
const TR={
 ollie:{n:'Ollie',p:30,k:'o',d:.2,l:0},
 shove:{n:'Pop Shove-it',p:170,k:'f',d:.8,l:1},kick:{n:'Kickflip',p:240,k:'f',d:1,l:2},heel:{n:'Heelflip',p:260,k:'f',d:1.05,l:2},
 s180:{n:'180',p:110,k:'s',d:.5,l:1},s360:{n:'360',p:260,k:'s',d:1,l:3},s540:{n:'540',p:500,k:'s',d:1.6,l:4},s720:{n:'720',p:820,k:'s',d:2.2,l:4},s900:{n:'900',p:1250,k:'s',d:3,l:4},
 indy:{n:'Indy Grab',p:130,k:'g',d:.6,l:1},nose:{n:'Nosegrab',p:140,k:'g',d:.7,l:2},tail:{n:'Tailgrab',p:140,k:'g',d:.7,l:2},melon:{n:'Melon Grab',p:160,k:'g',d:.8,l:2},stale:{n:'Stalefish',p:170,k:'g',d:.9,l:2},
 g50:{n:'50-50 Grind',p:110,k:'r',d:.7,l:0},g5:{n:'5-0 Grind',p:130,k:'r',d:.9,l:3},gbs:{n:'Boardslide',p:150,k:'r',d:1,l:3},gnose:{n:'Nosegrind',p:170,k:'r',d:1.2,l:4},
 manual:{n:'Manual',p:70,k:'m',d:.7,l:1},wall:{n:'Wallride',p:150,k:'w',d:1.1,l:4}};
const TRK=Object.keys(TR);
const unlocked=id=>{const t=TR[id];return !t||t.l<=st().les};
const GRAB_DIR={'':'indy',w:'nose',s:'tail',a:'melon',d:'stale'};
const SPINS=[null,'s180','s360','s540','s720','s900'];
const GRAB_AIR=.55;/* seconds a grab is held at least before it counts */

/* ---------- coach lessons: land the tricks, Rex teaches the next ones ---------- */
const LES=[
 {n:'Rolling',tx:'Push, steer and pop. Land 3 ollies and I will show you shove-its, spins and the first grab.',need:{ollie:3},give:'Pop Shove-it, 180 spins, Indy grab, manuals',cash:25},
 {n:'Pop and spin',tx:'Now put some style in. A shove-it, a 180 and a manual (hold Shift).',need:{shove:1,s180:1,manual:1},give:'Kickflip, Heelflip, all the grabs',cash:40},
 {n:'Flip it',tx:'Flick the board. Two kickflips and a heelflip, then a 50-50 on a rail.',need:{kick:2,heel:1,g50:1},give:'360 spins, 5-0 grind, boardslide',cash:60},
 {n:'Rail rider',tx:'Rails are home. A 360, a boardslide and a 5-0, in the park, clean.',need:{s360:1,gbs:1,g5:1},give:'540 to 900 spins, nosegrind, wallride',cash:90}];
const lesProg=(i)=>{const L=LES[i],o=st();let tot=0,got=0;for(const k in L.need){tot+=L.need[k];got+=Math.min(L.need[k],o.tricks[k]|0)}return{got,tot,ok:got>=tot}};

/* ---------- challenges: unlock one after the other ---------- */
const CH=[
 {id:'gap',n:'Clear the Big Gap',tx:'Roll fast off the kicker, fly the gap and land clean on the far side.',cash:30,mp:1.2},
 {id:'rail',n:'Grind the Long Rail',tx:'Land on the long flat rail and grind at least 8 m of it without falling off.',cash:40,mp:1.4},
 {id:'combo',n:'5 Trick Combo',tx:'Chain 5 different tricks in one combo and bank it. Grinds and manuals count.',cash:60,mp:1.8},
 {id:'bowl',n:'540 in the Bowl',tx:'Fly out of the pool bowl, spin at least 540 and land back in it, clean.',cash:80,mp:2.2},
 {id:'stairs',n:'Kickflip the Stairs',tx:'Kickflip off the stair platform and land it clean below.',cash:100,mp:2.5}];
const chOpen=i=>i==0||!!st().challenges[CH[i-1].id];

/* ---------- time of day (same maths as the other island places) ---------- */
function nightK(){const t=S.t||0,f=t<240?0:t<300?(t-240)/60*.5:t<330?.5+(t-300)/30*.4:.9;return clamp((f-.1)/.62,0,1)}

/* ---------- the site: south of the town on open grass. Local frame: origin at the park centre, x east, z south, y up from the slab top ---------- */
const CX=236,CZ=162,SLAB=.06,HXM=60,HZM=32,BXL=59.2,BZL=31.2;/* park half sizes, and the board limits inside the fence */
const lw=(x,z)=>[CX+x,CZ+z];
const inPark=(x,z,m)=>{m=m||0;return Math.abs(x-CX)<HXM+m&&Math.abs(z-CZ)<HZM+m};

/* ---------- the height function. Every ridable surface is an extruded profile (ext) or the pool; hH(x,z) is the single truth ---------- */
const EXT=[];
function ext(o){const p=o.prof;o.U=p[p.length-1][0];const e1=o.u0,e2=o.u0+o.dir*o.U;
 if(o.ax=='x'){o.x0=Math.min(e1,e2);o.x1=Math.max(e1,e2);o.z0=o.a;o.z1=o.b}else{o.z0=Math.min(e1,e2);o.z1=Math.max(e1,e2);o.x0=o.a;o.x1=o.b}
 o.ent=!!o.ent;EXT.push(o);return o}
function profH(p,u){let h=-1;for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];if(u<a[0]-1e-9||u>b[0]+1e-9)continue;const du=b[0]-a[0];const v=du<1e-9?Math.max(a[1],b[1]):a[1]+(b[1]-a[1])*(u-a[0])/du;if(v>h)h=v}return h}
const arcP=(Hh,deg,n)=>{const th=deg*PI/180,R=Hh/(1-Math.cos(th)),pts=[];for(let i=0;i<=n;i++){const a=th*i/n;pts.push([R*Math.sin(a),R*(1-Math.cos(a))])}return{pts,R,L:R*Math.sin(th)}};
const qpProf=(Hh,deg,total)=>{const a=arcP(Hh,deg,16),p=a.pts.slice();p.push([total,Hh]);return p};
const boxExt=(id,x0,z0,x1,z1,h,o)=>ext(Object.assign({id,ax:'x',dir:1,u0:x0,a:z0,b:z1,prof:[[0,h],[x1-x0,h]],kind:'box'},o||{}));
/* the pool bowl (a rounded box, 12 x 8 m, 1.7 m deep): an analytic height field */
const POOL={cx:38,cz:16,a:6,b:4,r:3,D:1.7,th:75};
POOL.R=POOL.D/(1-Math.cos(POOL.th*PI/180));POOL.L=POOL.R*Math.sin(POOL.th*PI/180);
const PX0=POOL.cx-POOL.a,PX1=POOL.cx+POOL.a,PZ0=POOL.cz-POOL.b,PZ1=POOL.cz+POOL.b;
function poolD(x,z){/* distance in from the lip (negative outside) */const qx=Math.abs(x-POOL.cx)-(POOL.a-POOL.r),qz=Math.abs(z-POOL.cz)-(POOL.b-POOL.r);return -(Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-POOL.r)}
function poolH(x,z){const d=poolD(x,z);if(d<=0)return 0;if(d>=POOL.L)return-POOL.D;const u=POOL.L-d;return-POOL.D+POOL.R-Math.sqrt(Math.max(0,POOL.R*POOL.R-u*u))}
function hH(x,z){if(x>PX0&&x<PX1&&z>PZ0&&z<PZ1)return poolH(x,z);
 let h=0;for(let i=0;i<EXT.length;i++){const e=EXT[i];if(x<e.x0||x>e.x1||z<e.z0||z>e.z1)continue;const u=e.ax=='x'?(x-e.u0)*e.dir:(z-e.u0)*e.dir;if(u<0||u>e.U)continue;const v=profH(e.prof,u);if(v>h)h=v}return h}
const GE=.04;
function hG(x,z,o){o[0]=(hH(x+GE,z)-hH(x-GE,z))/(2*GE);o[1]=(hH(x,z+GE)-hH(x,z-GE))/(2*GE);return o}

/* ridable features (local metres). u runs along the ride axis from the foot of the ramp */
const QP1=ext({id:'qp1',ax:'x',dir:1,u0:54.5,a:-2.5,b:6.5,prof:qpProf(1.8,75,5.5),kind:'qp',lip:1.8});
const QP2=ext({id:'qp2',ax:'x',dir:-1,u0:-56.6,a:-14,b:-5,prof:qpProf(.9,75,3.4),kind:'qp',lip:.9});
const HP=(()=>{const A=arcP(1.5,75,16),p=[[0,1.5],[2,1.5]];for(let i=A.pts.length-1;i>=0;i--)p.push([2+A.L-A.pts[i][0],A.pts[i][1]]);const fl=6.09;p.push([2+A.L+fl,0]);A.pts.forEach(q=>p.push([2+A.L+fl+q[0],q[1]]));p.push([14,1.5]);return ext({id:'hp',ax:'x',dir:1,u0:-60,a:14,b:22,prof:p,kind:'hp',lip:1.5})})();
const FUN=ext({id:'fun',ax:'x',dir:1,u0:0,a:8,b:14,prof:[[0,0],[2,.8],[6,.8],[8,0]],kind:'fun'});
const KICK=(()=>{const A=arcP(1.1,40,12),p=A.pts.slice();p.push([A.L,0]);return ext({id:'kick',ax:'x',dir:1,u0:8,a:-18.5,b:-13.5,prof:p,kind:'kick',lip:1.1})})();
const GAPX0=8+KICK.U,GAPX1=14.4;/* the gap, local x (the kicker lip to the landing ramp) */
const LAND=ext({id:'land',ax:'x',dir:1,u0:GAPX1,a:-18.5,b:-13.5,prof:[[0,.4],[1.6,.4],[6.4,0]],kind:'land'});
const PLAT=boxExt('plat',52,-31,58,-24.5,1.4,{kind:'plat'});
const STEPS=ext({id:'steps',ax:'x',dir:-1,u0:52,a:-29.2,b:-24.5,prof:[[0,1.2],[.5,1.2],[.5,1],[1,1],[1,.8],[1.5,.8],[1.5,.6],[2,.6],[2,.4],[2.5,.4],[2.5,.2],[3,.2],[3,0],[3.5,0]],kind:'steps'});
const BANK=ext({id:'bank',ax:'z',dir:-1,u0:-14,a:53.5,b:57.5,prof:[[0,0],[2.5,.1],[7.5,1.3],[10,1.4]],kind:'bank'});
const PAD1=ext({id:'pad1',ax:'x',dir:1,u0:-18,a:8.2,b:9.8,prof:[[0,0],[.7,.26],[3.8,.26],[4.5,0]],kind:'pad'});
const PAD2=ext({id:'pad2',ax:'x',dir:1,u0:-8,a:10.2,b:11.8,prof:[[0,0],[.7,.26],[3.8,.26],[4.5,0]],kind:'pad'});
const LED=[boxExt('led1',-28,2.2,-22,2.8,.45,{kind:'ledge'}),boxExt('led2',-20,2.2,-14,2.8,.6,{kind:'ledge'}),boxExt('led3',-12,2.2,-6.5,2.8,.45,{kind:'ledge'})];
const WALLX=boxExt('wall',22,-8.3,34,-7.8,2.4,{kind:'wall'});
const HUTB=boxExt('hut',-58,-31.5,-46,-23.5,3.4,{kind:'hut'});
const RACKB=boxExt('rack',-44.2,-27.2,-38.2,-25.8,.9,{kind:'rack'});
const SOLIDS=[];/* extra solid props: [x0,z0,x1,z1,h] (benches, bins, poles, signs) */
function prop(x0,z0,x1,z1,h,id){SOLIDS.push([x0,z0,x1,z1,h]);return boxExt(id||'prop',x0,z0,x1,z1,h,{kind:'prop'})}
/* floodlight poles, benches, bins, the leaderboard (positions used by the builder too) */
const FLP=[[-48,-14],[-8,-27],[30,-27],[48,-9],[-24,26],[22,26]];
FLP.forEach(p=>prop(p[0]-.25,p[1]-.25,p[0]+.25,p[1]+.25,8,'fl'));
const BENCHES=[[-30,-29.3,0],[-22,-29.3,0],[0,-29.3,0],[10,-29.3,0],[-52,28.6,1],[0,28.6,1],[16,28.6,1],[-35,12,2]];/* x,z,facing (0 south, 1 north, 2 east) */
BENCHES.forEach(b=>{const al=b[2]==2;prop(b[0]-(al?.35:1),b[1]-(al?1:.35),b[0]+(al?.35:1),b[1]+(al?1:.35),.5,'bench')});
const BINS=[[-35,-30],[5,-30.5],[-12,28.5],[26,28.5],[50,27],[-38,-21]];
BINS.forEach(b=>prop(b[0]-.4,b[1]-.4,b[0]+.4,b[1]+.4,.95,'bin'));
const LBX=-34,LBZ=-30.6;/* leaderboard centre */
prop(LBX-2.6,LBZ-.25,LBX-2.3,LBZ+.25,3.4,'lb');prop(LBX+2.3,LBZ-.25,LBX+2.6,LBZ+.25,3.4,'lb');

/* ---------- rails: polylines [x,y,z] in local metres; s is the horizontal distance along ---------- */
const RAILS=[];
function rail(id,n,pts,o){const r=Object.assign({id,n,pts,cum:[0],len:0,seg:[]},o||{});for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz);r.len+=L;r.cum.push(r.len);r.seg.push({dx:dx/L,dz:dz/L,m:(b[1]-a[1])/L,L})}RAILS.push(r);return r}
const R_LONG=rail('long','Long rail',[[-30,.55,-6],[-18,.55,-6]],{posts:4});
const R_KINK=rail('kink','Kinked rail',[[-8,.5,-6],[-4.5,.5,-6],[-1.5,.9,-6],[2,.9,-6]],{posts:4});
const R_HAND=rail('hand','Stair handrail',[[52.2,2.1,-30.1],[48.5,.62,-30.1]],{posts:3});
const R_LED=LED.map((l,i)=>rail('led'+(i+1),'Ledge',[[l.x0+.05,l.prof[0][1],2.5],[l.x1-.05,l.prof[0][1],2.5]],{ledge:1}));
const R_COP=[[PX0+POOL.r,PZ0,PX1-POOL.r,PZ0],[PX0+POOL.r,PZ1,PX1-POOL.r,PZ1],[PX0,PZ0+POOL.r,PX0,PZ1-POOL.r],[PX1,PZ0+POOL.r,PX1,PZ1-POOL.r]].map((c,i)=>rail('cop'+i,'Pool coping',[[c[0],.06,c[1]],[c[2],.06,c[3]]],{coping:1}));
function railAt(r,s,o){s=clamp(s,0,r.len);let i=0;while(i<r.seg.length-1&&s>r.cum[i+1])i++;const g=r.seg[i],a=r.pts[i],t=s-r.cum[i];o.x=a[0]+g.dx*t;o.z=a[2]+g.dz*t;o.y=a[1]+g.m*t;o.dx=g.dx;o.dz=g.dz;o.m=g.m;return o}
/* wallride planes: the face is at coordinate c on axis ax (n = which way the face looks), along [a,b], up to top */
const WALLS=[{ax:'z',c:-7.8,n:1,a:22,b:34,top:2.4},{ax:'z',c:-8.3,n:-1,a:22,b:34,top:2.4}];
/* places the challenges look at */
const inBowl=(x,z)=>x>PX0&&x<PX1&&z>PZ0&&z<PZ1&&poolD(x,z)>.3;
const onLand=(x,z)=>x>GAPX1-.3&&x<GAPX1+8&&z>-18.6&&z<-13.4;
const onKickZ=(x,z)=>x>7.5&&x<GAPX0+.6&&z>-18.6&&z<-13.4;
const onStairs=(x,z)=>x>47&&x<52.6&&z>-29.4&&z<-24.3;
const wy=(h)=>SLAB+h;/* world height of a local height */

/* ---------- boxes, merged (same helper as the other island places) ---------- */
let BT=null,GB=null;const mkB=()=>({a:[],n:0});
function bx(w,h,d,c,x,y,z,ry,rx,rz){const b=BT;b.n++;const j=a=>1+(b.n*a%8)*.0004+.0002;b.a.push([w*j(7919),h*j(104729),d*j(1299709),c,x,y,z,ry||0,rx||0,rz||0])}
function flush(b,mat){const tpl=new THREE.BoxGeometry(1,1,1),tp=tpl.attributes.position.array,tn=tpl.attributes.normal.array,ti=tpl.index.array,N=b.a.length,pos=new Float32Array(N*72),nor=new Float32Array(N*72),col=new Float32Array(N*72),idx=new Uint32Array(N*36);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),v=new THREE.Vector3(),nm=new THREE.Matrix3(),cc=new THREE.Color();
 for(let k=0;k<N;k++){const o=b.a[k];e.set(o[8],o[7],o[9],'YXZ');q.setFromEuler(e);sc.set(o[0],o[1],o[2]);ps.set(o[4],o[5],o[6]);m.compose(ps,q,sc);nm.getNormalMatrix(m);cc.set(String(o[3]).slice(0,7));
  for(let i=0;i<24;i++){v.set(tp[i*3],tp[i*3+1],tp[i*3+2]).applyMatrix4(m);const p=(k*24+i)*3;pos[p]=v.x;pos[p+1]=v.y;pos[p+2]=v.z;v.set(tn[i*3],tn[i*3+1],tn[i*3+2]).applyMatrix3(nm).normalize();nor[p]=v.x;nor[p+1]=v.y;nor[p+2]=v.z;col[p]=cc.r;col[p+1]=cc.g;col[p+2]=cc.b}
  for(let i=0;i<36;i++)idx[k*36+i]=ti[i]+k*24}
 tpl.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));
 return new THREE.Mesh(g,mat||vmat())}
function vmat(o){const m=new THREE.MeshLambertMaterial(Object.assign({vertexColors:true},o||{}));m.userData.xms=1;return m}
const dk=(c,f)=>{const k=new THREE.Color(c);k.r=Math.min(1,k.r*f);k.g=Math.min(1,k.g*f);k.b=Math.min(1,k.b*f);return'#'+k.getHexString()};
const bmesh=fn=>{const o=BT;BT=mkB();try{fn();return flush(BT,vmat())}finally{BT=o}};
const COL={conc:'#8e949a',concL:'#a6abb1',concD:'#70757c',riser:'#7c8187',deck:'#858a90',steel:'#c7ccd2',iron:'#3a3f48',rust:'#8a4a2a',wood:'#9a6a3c',woodL:'#c99a5c',woodD:'#5a3a22',white:'#f3efe2',red:'#d9483b',yel:'#f2c14e',teal:'#2aa7a1',blue:'#3a7bd5',navy:'#22405e',pink:'#ff6ad5',green:'#3da35a',paint:'#e8e2d0'};
/* a solid height-field mesh from triangles with per-vertex normals and colours */
function soup(){return{p:[],n:[],c:[]}}
function sv3(s,x,y,z,nx,ny,nz,c){s.p.push(x,y,z);s.n.push(nx,ny,nz);s.c.push(c.r,c.g,c.b)}
function soupMesh(s,mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(s.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(s.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(s.c,3));return new THREE.Mesh(g,mat)}
const tcol=h=>new THREE.Color(h);
/* an extruded profile: top ribbon (smooth normals along arcs), the two side walls, the two end caps */
function extMesh(S2,e,cTop,cFlat,cRiser,cSide){const p=e.prof,n=p.length,ax=e.ax,dir=e.dir,u0=e.u0,a=e.a,b=e.b;
 const P=(u,h,w)=>ax=='x'?[u0+dir*u,h,w]:[w,h,u0+dir*u];
 const NN=(nu,nh)=>ax=='x'?[dir*nu,nh,0]:[0,nh,dir*nu];
 const sn=[];for(let i=0;i<n-1;i++){const du=p[i+1][0]-p[i][0],dh=p[i+1][1]-p[i][1],L=Math.hypot(du,dh)||1;sn.push([-dh/L,du/L,du<1e-6])}
 const vn=[];for(let i=0;i<n;i++){const A=sn[i-1],B=sn[i];vn.push([A&&B&&!A[2]&&!B[2]&&(A[0]*B[0]+A[1]*B[1])>.88?[(A[0]+B[0])/2,(A[1]+B[1])/2]:null])}
 const q=(v0,v1,v2,v3,n0,n1,n2,n3,c)=>{const V=[v0,v1,v2,v3],N=[n0,n1,n2,n3],e1=[v1[0]-v0[0],v1[1]-v0[1],v1[2]-v0[2]],e2=[v2[0]-v0[0],v2[1]-v0[1],v2[2]-v0[2]],cx=e1[1]*e2[2]-e1[2]*e2[1],cy=e1[2]*e2[0]-e1[0]*e2[2],cz=e1[0]*e2[1]-e1[1]*e2[0];
  const d=cx*(n0[0]+n1[0]+n2[0]+n3[0])+cy*(n0[1]+n1[1]+n2[1]+n3[1])+cz*(n0[2]+n1[2]+n2[2]+n3[2]);(d>=0?[0,1,2,0,2,3]:[0,2,1,0,3,2]).forEach(k=>sv3(S2,V[k][0],V[k][1],V[k][2],N[k][0],N[k][1],N[k][2],c))};
 for(let i=0;i<n-1;i++){const s=sn[i],nA=vn[i][0]||s,nB=vn[i+1][0]||s,c=s[2]?cRiser:(Math.abs(s[1])>.995?cFlat:cTop);
  const n0=NN(nA[0],nA[1]),n1=NN(nB[0],nB[1]);const A0=P(p[i][0],p[i][1],a),B0=P(p[i+1][0],p[i+1][1],a),B1=P(p[i+1][0],p[i+1][1],b),A1=P(p[i][0],p[i][1],b);
  q(A0,A1,B1,B0,n0,n0,n1,n1,c);
  if(s[2])continue;
  /* side walls down to just under the slab */
  [[a,-1],[b,1]].forEach(([w,sd])=>{const nn=ax=='x'?[0,0,sd]:[sd,0,0],lo=-.03;const T0=P(p[i][0],p[i][1],w),T1=P(p[i+1][0],p[i+1][1],w),L0=P(p[i][0],lo,w),L1=P(p[i+1][0],lo,w);
   q(L0,L1,T1,T0,nn,nn,nn,nn,cSide)})}
 /* end caps */
 [[0,-1],[n-1,1]].forEach(([i,sd])=>{const u=p[i][0],h=p[i][1];if(h<.02)return;const nn=NN(sd,0),A0=P(u,-.03,a),A1=P(u,-.03,b),B1=P(u,h,b),B0=P(u,h,a);
  q(A0,A1,B1,B0,nn,nn,nn,nn,cSide)})}
/* the pool as a height field over its bounding rectangle, 0.25 m cells; the plaza corners are at 0 */
function poolMesh(S2){const x0=PX0,z0=PZ0,nx=Math.round((PX1-PX0)/.25),nz=Math.round((PZ1-PZ0)/.25),g=[],e=.05;
 const col=(x,z,h)=>{if(h>=-.001)return tcol(COL.concL);const t=clamp(-h/POOL.D,0,1);if(h>-.5&&h<-.3)return tcol('#1f5f86');if(h>-.32+.0&&h<-.2)return tcol('#dff3f6');return tcol(dk('#4fb3cc',1-.55*t))};
 for(let j=0;j<=nz;j++){g.push([]);for(let i=0;i<=nx;i++){const x=x0+i*.25,z=z0+j*.25,h=poolH(x,z),gx=(poolH(x+e,z)-poolH(x-e,z))/(2*e),gz=(poolH(x,z+e)-poolH(x,z-e))/(2*e),l=Math.hypot(gx,1,gz);g[j].push([x,h,z,-gx/l,1/l,-gz/l,col(x,z,h)])}}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const A=g[j][i],B=g[j][i+1],C=g[j+1][i+1],D=g[j+1][i];[A,D,C,A,C,B].forEach(v=>sv3(S2,v[0],v[1],v[2],v[3],v[4],v[5],v[6]))}
 /* the pool shell below the slab edge so no gap shows at the lip */
}
const fmt2=n=>n;
/* canvas signs */
const FONT="'Silkscreen','Courier New',monospace";
function canvasSign(w,h,draw,px){const cv=document.createElement('canvas');cv.width=Math.round(w*(px||96));cv.height=Math.round(h*(px||96));const c=cv.getContext('2d');draw(c,cv.width,cv.height);const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;t.anisotropy=2;return{cv,c,t,w,h}}
const SIGNS=[];
function planeSign(g,sg,x,y,z,ry,rx){const m=new THREE.Mesh(new THREE.PlaneGeometry(sg.w,sg.h),new THREE.MeshBasicMaterial({map:sg.t,transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);g.add(m);SIGNS.push(m);return m}
const frame=(c,w,h,bg,fg,l)=>{l=l||6;c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle=fg;c.lineWidth=l;c.strokeRect(l,l,w-2*l,h-2*l)};
/* graffiti: block letters, drips, stars, a wave, a skater, all from a seed */
function mural(w,h,seed,words){return canvasSign(w,h,(c,W,H)=>{let q=seed;const r=()=>(q=(q*16807)%2147483647)/2147483647;
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2b3a67');g.addColorStop(1,'#d96c8a');c.fillStyle=g;c.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){c.fillStyle='rgba(255,255,255,'+(.05+r()*.12)+')';c.fillRect(r()*W,r()*H*.6,3+r()*6,3+r()*6)}
  c.fillStyle='#ffd23d';c.beginPath();c.arc(W*(.15+r()*.7),H*.28,H*.16,0,TAU);c.fill();
  c.fillStyle='#2aa7a1';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=W/40)c.lineTo(x,H*.78+Math.sin(x/W*14+seed)*H*.07);c.lineTo(W,H);c.fill();
  c.fillStyle='#177a7a';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=W/40)c.lineTo(x,H*.9+Math.sin(x/W*9+seed*2)*H*.05);c.lineTo(W,H);c.fill();
  const cols=['#ff4f81','#ffd23d','#7ff3ff','#9dffb6','#fff'];c.textAlign='center';c.textBaseline='middle';
  words.forEach((t,i)=>{const fs=Math.round(H*(i?.2:.42));c.font='bold '+fs+'px '+FONT;const x=W*(.22+.56*r()*(i?1:.3)+(i?0:.2)),y=H*(i?.18+.1*i:.46);c.lineWidth=fs*.16;c.strokeStyle='#14141c';c.strokeText(t,x,y);c.fillStyle=cols[i%cols.length];c.fillText(t,x,y);
   c.fillStyle=cols[i%cols.length];for(let k=0;k<5;k++){const dx=x+(r()-.5)*fs*t.length*.5;c.fillRect(dx,y+fs*.4,fs*.07,fs*(.1+r()*.45))}});
  c.strokeStyle='#14141c';c.lineWidth=6;c.strokeRect(3,3,W-6,H-6)},64)}

/* ---------- the world: one group at the park centre, everything in local metres ---------- */
const root=new THREE.Group();root.name='skatePark';root.position.set(CX,SLAB,CZ);WORLD.add(root);
const ANIM={halos:[],pools:[],lights:[],glMat:null,npcs:[],board:null,mesh:null};
let BUILT=false;
const SOL=[];
function solid(x0,z0,x1,z1){const q=[CX+x0,CZ+z0,CX+x1,CZ+z1];SOL.push(q);try{cols.push(q)}catch(e){}}
function solidC(x,z,hw,hd){solid(x-hw,z-(hd==null?hw:hd),x+hw,z+(hd==null?hw:hd))}
function railMesh(r){/* the bars, plates and posts of one rail */
 r.pts.forEach((p,i)=>{if(!i)return;const a=r.pts[i-1],dx=p[0]-a[0],dy=p[1]-a[1],dz=p[2]-a[2],L=Math.hypot(dx,dy,dz);const ry=Math.atan2(dx,dz),rx=-Math.asin(dy/L);
  bx(.07,.07,L+.04,COL.steel,(a[0]+p[0])/2,(a[1]+p[1])/2-.035,(a[2]+p[2])/2,ry,rx);bx(.045,.045,L,'#e6e9ee',(a[0]+p[0])/2,(a[1]+p[1])/2-.01,(a[2]+p[2])/2,ry,rx)});
 const n=Math.max(2,Math.round(r.len/2.6));for(let k=0;k<=n;k++){const t=k/n*r.len,o=railAt(r,t,{});const h=o.y-.04;bx(.07,h,.07,COL.iron,o.x,h/2,o.z);bx(.34,.03,.34,COL.iron,o.x,.015,o.z)}}
/* ---------- build everything ---------- */
function buildPark(){if(BUILT)return;BUILT=true;BT=mkB();GB=mkB();
 const T1=(f,n)=>{try{f()}catch(e){soft(e,n)}};
 T1(buildSlab,'slab');T1(buildFence,'fence');T1(buildRamps,'ramps');T1(buildRails,'rails');T1(buildHut,'hut');T1(buildProps,'props');T1(buildLights,'lights');T1(buildSigns,'signs');
 const m=flush(BT,vmat());m.name='skateStatic';root.add(m);ANIM.mesh=m;
 const gm=new THREE.MeshBasicMaterial({vertexColors:true});gm.userData.xms=1;ANIM.glMat=gm;const gmesh=flush(GB,gm);gmesh.name='skateLamps';root.add(gmesh);ANIM.gl=gmesh;
 BT=null;GB=null;T1(buildLightFx,'lightfx');drawBoard();carvePool()}
function buildSlab(){
 /* sub-base, then 4 m tiles with a hairline joint between them (the base shows through), a curb all round */
 {const X0=-HXM-.5,X1=HXM+.5,Z0=-HZM-.5,Z1=HZM+.5,sb=(a0,b0,a1,b1)=>bx(a1-a0,.5,b1-b0,COL.concD,(a0+a1)/2,-.27,(b0+b1)/2);sb(X0,Z0,PX0,Z1);sb(PX1,Z0,X1,Z1);sb(PX0,Z0,PX1,PZ0);sb(PX0,PZ1,PX1,Z1)}
 for(let i=0;i<30;i++)for(let j=0;j<16;j++){const x0=-60+i*4,z0=-32+j*4;if(x0>=PX0-.01&&x0+4<=PX1+.01&&z0>=PZ0-.01&&z0+4<=PZ1+.01)continue;
  const t=hash(i*13+j*7),c=t<.33?'#979ca2':t<.66?'#92979d':'#9ba0a6';bx(3.96,.5,3.96,c,x0+2,-.25,z0+2)}
 /* curb: a low raised border, with gaps at the two gates */
 const cb=(x0,z0,x1,z1)=>bx(x1-x0,.16,z1-z0,COL.concL,(x0+x1)/2,.06,(z0+z1)/2);
 cb(-60.4,-32.5,-6,-31.7);cb(6,-32.5,60.4,-31.7);cb(-60.4,31.7,18,32.5);cb(26,31.7,60.4,32.5);cb(-60.4,-32.5,-59.6,32.5);cb(59.6,-32.5,60.4,32.5);
 /* the grass skirt: a darker concrete apron outside the curb at the gates */
 bx(12,.1,3.2,COL.conc,0,.02,-34);bx(8,.1,3.2,COL.conc,22,.02,34);
 /* gate posts */
 [[-6,-32.1],[6,-32.1],[18,32.1],[26,32.1]].forEach(([x,z])=>{bx(.4,2.6,.4,COL.iron,x,1.3,z);bx(.5,.12,.5,COL.steel,x,2.65,z)});
 /* painted park markings: a lane line and arrows are canvas decals added in buildSigns */
}
function buildFence(){
 /* north wall, concrete with coping, murals added later. west wall too. south and east are chain-link on posts */
 const wall=(x0,z0,x1,z1,h)=>{const w=Math.abs(x1-x0),d=Math.abs(z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;bx(w,h,d,COL.deck,cx,h/2,cz);bx(w+.1,.14,d+.1,COL.concL,cx,h+.07,cz);
  const al=w>d,n=Math.floor((al?w:d)/6);for(let i=0;i<=n;i++){const o=-(al?w:d)/2+i*((al?w:d)/n);if(al)bx(.4,h,d+.14,COL.concD,cx+o,h/2,cz);else bx(w+.14,h,.4,COL.concD,cx,h/2,cz+o)}};
 wall(-60,-32.6,-6,-32,2.6);wall(6,-32.6,60,-32,2.6);wall(-60.6,-32.6,-60,32.6,2.6);
 solid(-60.8,-32.9,-5.8,-31.9);solid(5.8,-32.9,60.8,-31.9);solid(-60.8,-32.9,-59.8,32.9);
 /* chain link along the south and east sides: posts, top rail, a canvas mesh */
 const post=(x,z)=>{bx(.12,2.5,.12,COL.iron,x,1.25,z);bx(.2,.1,.2,COL.steel,x,2.55,z)};
 for(let x=-60;x<=60;x+=4)if(x<18||x>26)post(x,32.3);for(let z=-28;z<=32;z+=4)post(60.3,z);
 bx(78,.08,.08,COL.steel,-21,2.5,32.3);bx(34,.08,.08,COL.steel,43,2.5,32.3);bx(.08,.08,64,COL.steel,60.3,2.5,0);
 solid(-60,31.9,18,32.7);solid(26,31.9,60.6,32.7);solid(59.9,-32,60.7,32.7);
}
let fenceTex=null;
function fenceMat(){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.strokeStyle='rgba(190,198,208,.95)';c.lineWidth=2.4;for(let k=-64;k<=128;k+=16){c.beginPath();c.moveTo(k,0);c.lineTo(k+64,64);c.stroke();c.beginPath();c.moveTo(k+64,0);c.lineTo(k,64);c.stroke()}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;fenceTex=t;return t}
function buildFenceMeshes(){const t=fenceMat(),mk=(w,h,x,y,z,ry)=>{const tx=t.clone();tx.needsUpdate=true;tx.repeat.set(w/.6,h/.6);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,alphaTest:.35,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry||0;root.add(m);return m};
 mk(78,2.4,-21,1.25,32.3,0);mk(34,2.4,43,1.25,32.3,0);mk(64,2.4,60.3,1.25,0,PI/2)}
function buildRails(){RAILS.forEach(r=>{if(r.coping)return;railMesh(r)});
 /* ledge steel edges and coping on the pool */
 LED.forEach(l=>{const h=l.prof[0][1];bx(l.x1-l.x0,.05,.08,COL.steel,(l.x0+l.x1)/2,h+.025,2.2+.04);bx(l.x1-l.x0,.05,.08,COL.steel,(l.x0+l.x1)/2,h+.025,2.8-.04);bx(l.x1-l.x0,.02,.62,COL.concL,(l.x0+l.x1)/2,h+.001,2.5)});
 const cp=(x0,z0,x1,z1)=>bx(Math.abs(x1-x0)||.3,.1,Math.abs(z1-z0)||.3,COL.steel,(x0+x1)/2,.02,(z0+z1)/2);
 cp(PX0+POOL.r,PZ0-.15,PX1-POOL.r,PZ0+.15);cp(PX0+POOL.r,PZ1-.15,PX1-POOL.r,PZ1+.15);cp(PX0-.15,PZ0+POOL.r,PX0+.15,PZ1-POOL.r);cp(PX1-.15,PZ0+POOL.r,PX1+.15,PZ1-POOL.r);
 /* rounded corners of the coping: short boxes along the arc */
 [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([sx,sz])=>{const cx=POOL.cx+sx*(POOL.a-POOL.r),cz=POOL.cz+sz*(POOL.b-POOL.r);for(let k=1;k<6;k++){const a=k/6*PI/2,x=cx+sx*Math.cos(a)*POOL.r,z=cz+sz*Math.sin(a)*POOL.r;bx(.35,.1,.35,COL.steel,x,.02,z,-Math.atan2(sz*Math.sin(a),sx*Math.cos(a)))}})}
/* the island ground (grass, the snow lawn, the beach layers under it) is cut away under the WHOLE park, not just the pool pit (v55.28.0):
   a clip box (clipIntersection = only inside the box is cut) on every flat ground mesh that reaches under the slab. Before, only the pool was
   cut, so the grass only 12 cm under the concrete could show through it from a distance (depth precision, worst on phones and tablets), and
   the snow-day ground materials (swapped in later by the Christmas file) were never cut at all. carveTick re-checks every 2 s and cuts any
   material that was swapped onto those meshes since. */
let CARVED=[],CARVO=[];const CLIP=[];
function carvePool(){try{renderer.localClippingEnabled=true;const x0=CX-HXM-.42,x1=CX+HXM+.42,z0=CZ-HZM-.42,z1=CZ+HZM+.42;
 if(!CLIP.length)CLIP.push(new THREE.Plane(new THREE.Vector3(-1,0,0),x0),new THREE.Plane(new THREE.Vector3(1,0,0),-x1),new THREE.Plane(new THREE.Vector3(0,0,-1),z0),new THREE.Plane(new THREE.Vector3(0,0,1),-z1));
 carveScan();carveMats()}catch(e){soft(e,'carve')}}
/* v55.30.2: the scan updates world matrices first (a ground plane built on the same tick as the park still had its unrotated, upright
   matrix, so its box looked 100s of metres tall and it was skipped: the grass then filled the pool), and it runs again every 2 s for
   ground built or rebuilt after the park (each mesh is only measured once) */
const CARVSEEN=new WeakSet();const _cbx=new THREE.Box3(),_cbb=new THREE.Box3();
function carveScan(){_cbx.min.set(CX-HXM-.42,-3,CZ-HZM-.42);_cbx.max.set(CX+HXM+.42,.1,CZ+HZM+.42);
 scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.skate||CARVSEEN.has(o))return;for(let a=o.parent;a;a=a.parent)if(a===root)return;CARVSEEN.add(o);
  o.updateWorldMatrix(true,false);_cbb.setFromObject(o);if(_cbb.isEmpty()||_cbb.max.y>.2||!_cbb.intersectsBox(_cbx)||Math.max(_cbb.max.x-_cbb.min.x,_cbb.max.z-_cbb.min.z)<4)return;if(!CARVO.includes(o))CARVO.push(o)})}
function carveMats(){CARVO.forEach(o=>(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||m.clippingPlanes===CLIP)return;CARVED.push([m,m.clippingPlanes,m.clipIntersection]);m.clippingPlanes=CLIP;m.clipIntersection=true;m.needsUpdate=true}))}
let carveT=0;function carveTick(dt){if(!CLIP.length)return;carveT+=dt;if(carveT<2)return;carveT=0;try{renderer.localClippingEnabled=true;carveScan();carveMats()}catch(e){soft(e,'carve2')}}
function buildRamps(){
 const S2=soup(),cT=tcol('#b6bbc1'),cF=tcol('#9ea4aa'),cR=tcol('#8a8f96'),cS=tcol('#7e848b');
 EXT.forEach(e=>{if(e.kind=='hut'||e.kind=='rack'||e.kind=='prop'||e.kind=='box'&&e.id!='plat')return;
  const c=e.kind=='ledge'||e.kind=='wall'?null:1;if(!c)return;extMesh(S2,e,cT,cF,cR,cS)});
 /* ledges and the wall are plain concrete boxes in the batch */
 LED.forEach(l=>{const h=l.prof[0][1];bx(l.x1-l.x0,h,l.z1-l.z0,COL.deck,(l.x0+l.x1)/2,h/2,(l.z0+l.z1)/2);bx(l.x1-l.x0+.04,h*.3,l.z1-l.z0+.04,COL.concD,(l.x0+l.x1)/2,h*.15,(l.z0+l.z1)/2)});
 bx(12,2.4,.5,COL.deck,28,1.2,-8.05);bx(12.2,.12,.62,COL.concL,28,2.46,-8.05);for(let x=22;x<=34;x+=3)bx(.3,2.4,.56,COL.concD,x,1.2,-8.05);
 solid(22,-8.4,34,-7.7);
 const poolS=soup();poolMesh(poolS);
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});mat.userData.xms=1;
 const m=soupMesh(S2,mat);m.name='skateRamps';root.add(m);ANIM.ramps=m;
 const pm=soupMesh(poolS,new THREE.MeshLambertMaterial({vertexColors:true}));pm.material.userData.xms=1;pm.name='skatePool';pm.position.y=-.002;root.add(pm);ANIM.pool=pm;
 /* coping steel on every lip, kerb faces on the decks, and the footprints for walking */
 const lip=(x0,z0,x1,z1,h)=>bx(Math.abs(x1-x0)||.14,.1,Math.abs(z1-z0)||.14,COL.steel,(x0+x1)/2,h-.04,(z0+z1)/2);
 lip(54.5+QP1.U-3.2,-2.5,54.5+2.38,6.5,1.8);lip(-56.6-1.18,-14,-56.6-1.18,-5,.9);
 lip(-60+2,14,-60+2,22,1.5);lip(-60+12,14,-60+12,22,1.5);
 /* feet of every ramp, bank and the platform: solid on foot */
 [QP1,QP2,HP,FUN,KICK,LAND,PLAT,STEPS,BANK,PAD1,PAD2,WALLX,HUTB,RACKB].forEach(e=>{if(e===WALLX)return;solid(e.x0,e.z0,e.x1,e.z1)});
 solid(PX0-.2,PZ0-.2,PX1+.2,PZ1+.2);
 /* the stair platform gets a rail around its open sides and a mural wall */
 bx(.08,.08,6.5,COL.steel,57.9,1.4+.9,-27.75);bx(.08,.08,6,COL.steel,55,1.4+.9,-31.1);
 for(let z=-31;z<=-24.5;z+=2.1)bx(.07,.9,.07,COL.iron,57.9,1.85,z);for(let x=52;x<=58;x+=2)bx(.07,.9,.07,COL.iron,x,1.85,-31.1);
 solid(57.7,-31.3,58.1,-24.4);
 /* caution tape across the gap */
 [GAPX0+.4,GAPX1-.4].forEach(x=>{bx(.06,1.2,.06,COL.yel,x,.6,-18.9);bx(.06,1.2,.06,COL.yel,x,.6,-13.1)});
 const tape=canvasSign(5.2,.3,(c,w,h)=>{for(let i=0;i<40;i++){c.fillStyle=i%2?'#f2c14e':'#222';c.fillRect(i*w/40,0,w/40,h)}},40);
 planeSign(root,tape,(GAPX0+GAPX1)/2,.85,-18.95,0);planeSign(root,tape,(GAPX0+GAPX1)/2,.85,-13.05,PI);
 const gp=canvasSign(5.2,5.2,(c,w,h)=>{c.fillStyle='rgba(255,255,255,.0)';c.clearRect(0,0,w,h);c.fillStyle='rgba(242,193,78,.5)';for(let k=0;k<6;k++)c.fillRect(0,h*(.1+k*.15),w,h*.05);c.fillStyle='rgba(255,255,255,.85)';c.font='bold '+h*.3+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('GAP',w/2,h*.5)},40);
 const gm=planeSign(root,gp,(GAPX0+GAPX1)/2,.012,-16,0,-PI/2);gm.scale.set(1,1,1);gm.renderOrder=2;gm.geometry.dispose();gm.geometry=new THREE.PlaneGeometry(GAPX1-GAPX0,5);gm.material.depthWrite=false;
 buildFenceMeshes();
}

function buildHut(){
 const X0=-58,X1=-46,Z0=-31.5,Z1=-23.5,H=3.4,xm=(X0+X1)/2,zm=(Z0+Z1)/2;
 bx(X1-X0+.6,.3,Z1-Z0+.6,COL.concD,xm,.1,zm);
 const wall=(x,z,w,d,h,y,c)=>bx(w,h,d,c,x,y+h/2,z);
 /* walls: teal with planks, south face has the service window */
 wall(xm,Z0+.15,X1-X0,.3,H,0,COL.teal);wall(X0+.15,zm,.3,Z1-Z0,H,0,COL.teal);wall(X1-.15,zm,.3,Z1-Z0,H,0,COL.teal);
 const WX0=-55,WX1=-49,WY0=1.15,WY1=2.5;
 wall(xm,Z1-.15,X1-X0,.3,WY0,0,COL.teal);wall(xm,Z1-.15,X1-X0,.3,H-WY1,WY1,COL.teal);wall((X0+WX0)/2,Z1-.15,WX0-X0,.3,WY1-WY0,WY0,COL.teal);wall((WX1+X1)/2,Z1-.15,X1-WX1,.3,WY1-WY0,WY0,COL.teal);
 for(let x=X0+.5;x<X1;x+=1){bx(.05,H,.04,dk(COL.teal,.78),x,H/2,Z1+.01);bx(.05,H,.04,dk(COL.teal,.78),x,H/2,Z0-.01)}
 [[X0,Z0],[X0,Z1],[X1,Z0],[X1,Z1]].forEach(([x,z])=>bx(.36,H+.1,.36,COL.white,x,H/2,z));
 bx(WX1-WX0+.5,.14,.14,COL.white,xm,WY1+.07,Z1+.05);bx(.14,WY1-WY0+.14,.14,COL.white,WX0-.05,(WY0+WY1)/2,Z1+.05);bx(.14,WY1-WY0+.14,.14,COL.white,WX1+.05,(WY0+WY1)/2,Z1+.05);
 /* counter and things on it */
 bx(WX1-WX0+.6,.1,1.1,COL.woodL,xm,WY0,Z1+.5);bx(WX1-WX0+.4,WY0-.1,.2,COL.wood,xm,WY0/2,Z1+.95);for(let x=WX0;x<=WX1;x+=.5)bx(.05,WY0-.1,.05,COL.woodD,x,WY0/2,Z1+1.07);
 bx(.7,.05,.5,COL.iron,-52,WY0+.08,Z1+.5);bx(.3,.3,.3,'#ffd23d',-54.2,WY0+.2,Z1+.5);bx(.3,.3,.3,'#ff6ad5',-50,WY0+.2,Z1+.5);bx(.1,.7,.08,COL.steel,-51,WY0+.45,Z1+.5);
 /* roof with an overhang, an awning over the window, a sign */
 bx(X1-X0+1,.3,Z1-Z0+1,COL.iron,xm,H+.15,zm);bx(X1-X0+1.2,.12,Z1-Z0+1.2,COL.steel,xm,H+.36,zm);
 for(let i=0;i<6;i++)bx(1.1,.1,1.9,i%2?COL.red:COL.white,-56+i*2.2+.5-.5+(-.2),3.05,Z1+1.1+.4,0,-.45);
 [[WX0-.6],[WX1+.6]].forEach(([x])=>bx(.1,2.9,.1,COL.iron,x,1.45,Z1+1.85));
 /* a floor and an interior wall colour so the window shows a room, shelves of decks and wheels */
 bx(X1-X0-.6,.05,Z1-Z0-.6,'#c9b48a',xm,.28,zm);bx(X1-X0-.6,.9,.2,COL.wood,xm,.95,Z0+.5);
 for(let i=0;i<8;i++)bx(.28,.9,.05,[COL.red,COL.blue,COL.yel,COL.teal,COL.pink][i%5],-57+i*.55,1.8,Z0+.45);
 for(let i=0;i<6;i++)bx(.24,.24,.12,'#2b2b2b',-57+i*.7,2.9,Z0+.45);
 bx(.6,1.1,.5,COL.iron,-47.2,.85,-25);bx(2.4,.9,.9,COL.wood,-56.4,.8,-24.4);
 solidC(xm,zm,6,4);
 /* board rack: a stand with boards leaning in it */
 const rx=-41.2,rz=-26.5;bx(6.2,.12,1.5,COL.woodD,rx,.06,rz);bx(6,.08,.1,COL.wood,rx,.62,rz-.5);bx(6,.08,.1,COL.wood,rx,.3,rz+.5);
 for(let i=-3;i<=3;i+=1.5){bx(.1,1.0,.1,COL.woodD,rx+i,.5,rz-.62);bx(.1,.6,.1,COL.woodD,rx+i,.3,rz+.62)}
 for(let i=0;i<9;i++){const d=DECKS[i%5],x=rx-2.6+i*.65;bx(.04,.78,.2,d.col,x,.75,rz-.12,0,-.28);bx(.045,.18,.2,d.tape,x,.76,rz-.12,0,-.28);bx(.05,.6,.05,COL.steel,x+.03,.55,rz-.2,0,-.28)}
}
function buildProps(){
 BENCHES.forEach(b=>{const f=b[2],x=b[0],z=b[1],al=f==2,sw=al?.55:2,sd=al?2:.55;bx(sw,.08,sd,COL.woodL,x,.45,z);
  const bk=f==0?[x,z-.28,2,.1]:f==1?[x,z+.28,2,.1]:[x-.28,z,.1,2];bx(bk[2],.4,bk[3],COL.wood,bk[0],.78,bk[1]);
  [-1,1].forEach(a=>{const lx=al?x:x+a*.8,lz=al?z+a*.8:z;bx(al?.5:.1,.45,al?.1:.5,COL.iron,lx,.22,lz)})});
 BINS.forEach(b=>{bx(.7,.9,.7,'#4a5a52',b[0],.45,b[1]);bx(.76,.08,.76,COL.iron,b[0],.92,b[1]);bx(.4,.04,.4,'#111',b[0],.95,b[1]);bx(.08,.4,.02,COL.yel,b[0],.6,b[1]+.36)});
 /* cones around the gap and the entrance */
 [[7,-19.4],[7,-12.6],[GAPX1+.5,-19.4],[GAPX1+.5,-12.6],[-2,-33],[2,-33],[16,34],[28,34]].forEach(([x,z])=>{bx(.34,.08,.34,'#222',x,.04,z);bx(.24,.28,.24,'#ff7a1a',x,.22,z);bx(.14,.22,.14,'#ff7a1a',x,.46,z);bx(.2,.06,.2,'#fff',x,.34,z)});
 /* entrance arch over the north gate with a name board */
 bx(.4,3.6,.4,COL.iron,-6,1.8,-32.2);bx(.4,3.6,.4,COL.iron,6,1.8,-32.2);bx(12.8,.5,.5,COL.navy,0,3.4,-32.2);
 /* a tiny vendor cart by the south gate */
 bx(2,.9,1.1,COL.red,22,.5,36.2);bx(2.3,.1,1.4,COL.white,22,2.1,36.2);[-1,1].forEach(a=>{bx(.06,1.2,.06,COL.iron,22+a*1.05,1.5,36.2)});solidC(22,36.2,1.2,.7);
 /* skatestoppers on the curb edges of the ledges: little steel bolts */
 /* hubba-style planter boxes outside the east side */
 for(let i=0;i<3;i++){bx(2.4,.7,1,COL.concL,66,.35,-10+i*10);bx(2.2,.3,.8,'#3d7a3a',66,.78,-10+i*10)}
 BENCHES.forEach(b=>{const f=b[2],al=f==2;solidC(b[0],b[1],al?.35:1,al?1:.35)});BINS.forEach(b=>solidC(b[0],b[1],.4));FLP.forEach(p=>solidC(p[0],p[1],.25));
 solid(LBX-2.7,LBZ-.3,LBX-2.2,LBZ+.3);solid(LBX+2.2,LBZ-.3,LBX+2.7,LBZ+.3);
 /* the leaderboard frame */
 bx(.3,3.4,.3,COL.iron,LBX-2.45,1.7,LBZ);bx(.3,3.4,.3,COL.iron,LBX+2.45,1.7,LBZ);bx(5.6,.2,.4,COL.iron,LBX,3.5,LBZ);bx(5.2,2.6,.15,COL.navy,LBX,2.0,LBZ+.02);
 /* trees and palms outside the fence for a softer edge */
 [[-66,-8],[-66,14],[-66,26],[66,-24],[66,22],[-30,38],[0,38],[44,38]].forEach(([x,z])=>palm(x,z,1,.12,hash(x+z)*6))}
function palm(x,z,s,lean,rot){let px=x,py=-.06,pz=z;for(let i=0;i<7;i++){const w=.46*s-i*.03*s,h=1.05*s;bx(w,h*1.04,w,i%2?'#8a6a40':'#7d5f38',px,py+h/2,pz);px+=lean*s*Math.cos(rot);pz+=lean*s*Math.sin(rot);py+=h}
 bx(.6*s,.4*s,.6*s,'#5f4a2a',px,py+.05*s,pz);for(let i=0;i<9;i++){const a=i/9*TAU+rot,c1=i%2?'#2f8f4a':'#3da35a',ca=Math.cos(a),sa=Math.sin(a),l1=1.5*s;bx(l1,.09*s,.55*s,c1,px+ca*l1*.5*.97,py+.2*s-.22*l1*.5,pz+sa*l1*.5*.97,-a,0,-.22);
  bx(1.3*s,.09*s,.45*s,c1,px+ca*(l1*.97+.55*s),py+.2*s-.22*l1-.3*s,pz+sa*(l1*.97+.55*s),-a,0,-.62)}solidC(x,z,.3)}
function buildLights(){FLP.forEach(([x,z],i)=>{bx(.22,8,.22,COL.iron,x,4,z);bx(.3,.3,.3,COL.steel,x,.15,z);bx(2.4,.18,.22,COL.iron,x,8.1,z);
  [-.8,0,.8].forEach(d=>{bx(.6,.12,.4,COL.iron,x+d,8.28,z);const g=BT;BT=GB;bx(.5,.1,.34,'#fff3c8',x+d,8.2,z);BT=g});ANIM.lights.push([x,8.1,z,i])});
 /* lamps over the hut and the gates */
 [[-52,2.9,-22.3],[0,3.1,-31.8]].forEach(l=>{const g=BT;BT=GB;bx(.3,.16,.3,'#ffe2a0',l[0],l[1],l[2]);BT=g;ANIM.lights.push([l[0],l[1],l[2],-1])})}
function buildLightFx(){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(.4,'rgba(255,224,150,.45)');gr.addColorStop(1,'rgba(255,224,150,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);
 const tex=new THREE.CanvasTexture(cv);ANIM.glowTex=tex;
 ANIM.lights.forEach(([x,y,z,i])=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,fog:false}));s.position.set(x,y,z);s.scale.set(i<0?3:7,i<0?3:7,1);s.renderOrder=6;root.add(s);ANIM.halos.push(s);
  if(i>=0){const pm=new THREE.MeshBasicMaterial({map:tex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,fog:false}),p=new THREE.Mesh(new THREE.PlaneGeometry(20,20),pm);p.rotation.x=-PI/2;p.position.set(x,.016+(i%3)*.002,z);p.renderOrder=3;root.add(p);ANIM.pools.push(p)}})}
function lightsTick(){const k=nightK(),o=k;if(ANIM.glMat)ANIM.glMat.color.setScalar(.6+.4*k);ANIM.halos.forEach(h=>h.material.opacity=o*.9);ANIM.pools.forEach(p=>p.material.opacity=o*.55)}
function buildSigns(){
 const mk=(w,h,seed,words,x,y,z,ry)=>planeSign(root,mural(w,h,seed,words),x,y,z,ry);
 mk(16,2.1,3,['WAVE','FERN','SKATE'],-20,1.45,-31.96,0);mk(18,2.1,11,['SEND IT','ride'],24,1.45,-31.96,0);mk(12,2.1,7,['PARK','LIFE'],-59.96,1.45,0,PI/2);
 mk(11,2.1,17,['GRIND','WALL'],28,1.35,-7.78,0);mk(11,2.1,23,['NO','WALKING'],28,1.35,-8.32,PI);
 const arch=canvasSign(12,.5,(c,w,h)=>{c.fillStyle='#22405e';c.fillRect(0,0,w,h);c.fillStyle='#f2c14e';c.font='bold '+h*.62+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('WAVEFERN SKATE PARK',w/2,h*.54)},96);
 planeSign(root,arch,0,3.4,-31.93,0);planeSign(root,arch,0,3.4,-32.47,PI);
 const shop=canvasSign(6.4,.9,(c,w,h)=>{frame(c,w,h,'#22405e','#f2c14e',8);c.fillStyle='#f2c14e';c.font='bold '+h*.5+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('BOARD SHOP',w/2,h*.54)},100);planeSign(root,shop,-52,3.9,-22.97,0);
 const rent=canvasSign(1.9,.9,(c,w,h)=>{frame(c,w,h,'#f4ead0','#5a3a22',5);c.fillStyle='#17323a';c.font='bold '+h*.26+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('RENT $10',w/2,h*.32);c.fillStyle='#d94a33';c.fillText('DECKS',w/2,h*.62);c.fillStyle='#17323a';c.font=h*.17+'px '+FONT;c.fillText('TRUCKS',w/2,h*.85)},90);planeSign(root,rent,-47.4,1.9,-23.3,0);
 const rules=canvasSign(1.5,1.2,(c,w,h)=>{frame(c,w,h,'#fff3d9','#d94a33',5);c.fillStyle='#17323a';c.font='bold '+h*.14+'px '+FONT;c.textAlign='center';c.textBaseline='middle';['PARK RULES','BOARDS ONLY','INSIDE THE FENCE','HELMETS ARE COOL','BAILING IS FINE'].forEach((t,i)=>c.fillText(t,w/2,h*(.16+i*.17)))},100);planeSign(root,rules,8.6,1.6,-31.9,0);
 const ex=canvasSign(1.2,.5,(c,w,h)=>{c.fillStyle='#d94a33';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='bold '+h*.5+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('GATE',w/2,h*.55)},90);planeSign(root,ex,22,2.4,32.5,0);
 /* the leaderboard canvas */
 ANIM.board=canvasSign(5,2.5,()=>{},120);planeSign(root,ANIM.board,LBX,2.0,LBZ+.12,0);
 /* the quarter pipe names, painted on the decks */
}
let boardKey='';
function drawBoard(){const sg=ANIM.board;if(!sg)return;const o=st(),c=sg.c,W=sg.cv.width,H=sg.cv.height;boardKey=[o.best,o.runs,o.bestCombo,Object.keys(o.challenges).length,o.wins].join('|');
 frame(c,W,H,'#14233a','#f2c14e',8);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f2c14e';c.font='bold '+H*.1+'px '+FONT;c.fillText('LEADERBOARD',W/2,H*.1);c.fillStyle='#d94a33';c.fillRect(W*.06,H*.18,W*.88,H*.012);
 const rows=[['DEX',4800],['MIKA',3600],['YOU',o.best],['JUNO',2300],['REX',1500]].sort((a,b)=>b[1]-a[1]);c.textAlign='left';
 rows.forEach((r,i)=>{const y=H*(.27+i*.1),me=r[0]=='YOU';c.fillStyle=me?'#7ff3ff':'#fff';c.font=(me?'bold ':'')+H*.07+'px '+FONT;c.fillText((i+1)+'. '+r[0],W*.08,y);c.textAlign='right';c.fillText(fmtN(r[1]),W*.92,y);c.textAlign='left'});
 c.fillStyle='#9dffb6';c.font=H*.055+'px '+FONT;c.textAlign='center';c.fillText('BEST COMBO '+fmtN(o.bestCombo)+'  RUNS '+o.runs,W/2,H*.8);c.fillStyle='#ffd27a';c.fillText('CHALLENGES '+Object.keys(o.challenges).length+'/'+CH.length+'  S-K-A-T-E WINS '+o.wins,W/2,H*.9);
 sg.t.needsUpdate=true}

/* =====================================================================================================================
   THE SESSION: state, physics, tricks, grinds, manuals, wallrides, landings, combo and score
   ===================================================================================================================== */
const cam3=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.15,2600);
let G=null,B=null,hud=null,skCSS=null;
const GK={};let GKd={};
const keyName=e=>{const k=(e.key||'').toLowerCase();return k==' '||k=='spacebar'?' ':k};
const G9=9.81,SUB=1/240;
const VMAXG=24;/* a hard safety cap on speed (never reached in play) */
const _g2=[0,0];
function newBoard(x,z,yaw){return{x,z,y:hH(x,z),vx:0,vz:0,vy:0,yaw,st:'g',pop:0,popping:false,spin:0,spinTo:0,spinV:0,flip:null,flipA:0,shoveA:0,flipsDone:[],grab:0,grabId:null,grabT:0,grabHeld:0,
  man:false,mb:0,mv:0,manT:0,fakT:0,rev:null,wob:0,rail:null,rs:0,rv:0,rb:0,rbv:0,rT:0,rType:'',rDist:0,rs0:0,gcool:0,wall:null,wT:0,wv:0,A:null,tAir:0,pitch:0,roll:0,pad:0,gyaw:0,sprint:0,lastLand:0,recT:0,wallCool:0,popAnim:0,steerS:0}}
const noise=(t,k)=>Math.sin(t*(2.1+k)+k*7.3)*.55+Math.sin(t*(4.7+k*.6)+k*3.1)*.45;
/* ---- one air record, filled while the board is off the ground ---- */
function airStart(kind){const b=B;b.A={t:0,y0:b.y,maxH:0,kind,x0:b.x,z0:b.z,fromKick:onKickZ(b.x,b.z),fromPlat:b.x>51.8&&b.z<-24.4&&b.z>-31.1&&b.y>1.2,inBowl0:poolD(b.x,b.z)>-.8&&b.x>PX0-1&&b.x<PX1+1&&b.z>PZ0-1&&b.z<PZ1+1,pop:kind=='ollie',grabs:{},flips:[],maxSpin:0,wallT:0,railed:kind=='rail',tricks:[]};b.spin=0;b.spinTo=0;b.flipsDone=[];b.flip=null;b.flipA=0;b.shoveA=0;b.tAir=0;b.grabHeld=0;b.grabId=null}
function leaveGround(vy){const b=B;b.st='a';b.vy=vy;b.man=false;b.mb=0;if(!b.A)airStart('drop')}
/* ---- ground physics: the constrained particle on the height field ---- */
function stepGround(dt,I){const b=B,g=gear();
 let sp=Math.hypot(b.vx,b.vz);const hx=Math.sin(b.yaw),hz=Math.cos(b.yaw);let along=b.vx*hx+b.vz*hz;
 /* steering: slower at speed, the loose trucks turn more; revert (turn round) when rolling backwards */
 if(b.rev){b.rev.t+=dt;const k=clamp(b.rev.t/.28,0,1);b.yaw=b.rev.from+angd(b.rev.to-b.rev.from)*(k*k*(3-2*k));if(k>=1){b.rev=null}}
 else{b.yaw+=I.steer*(2.8*g.turn/(1+sp*.19))*dt*(b.man?.55:1)*(b.wob>0?.75:1);
  if(along<-.8&&sp>1.1){b.fakT+=dt;if(b.fakT>.1){b.rev={t:0,from:b.yaw,to:b.yaw+PI};b.fakT=0}}else b.fakT=0}
 const hx2=Math.sin(b.yaw),hz2=Math.cos(b.yaw);along=b.vx*hx2+b.vz*hz2;let lat=b.vx*hz2-b.vz*hx2;
 /* the trucks grip the line the board points along: the sideways part dies fast (this is the carving scrub) */
 lat*=Math.exp(-(b.rev?3:9)*dt);b.vx=hx2*along+hz2*lat;b.vz=hz2*along-hx2*lat;
 sp=Math.hypot(b.vx,b.vz);
 /* push and brake */
 if(I.push&&!b.man&&!b.rev&&along>-.5){const vmax=8.6*g.spd;if(along<vmax){const a=3.5*(1-Math.pow(clamp(along/vmax,0,1),2));b.vx+=hx2*a*dt;b.vz+=hz2*a*dt}b.sprint=Math.min(1,b.sprint+dt*3)}else b.sprint=Math.max(0,b.sprint-dt*4);
 if(I.brake&&sp>0){const d=Math.min(sp,(b.man?3:7.5)*dt),f=1-d/sp;b.vx*=f;b.vz*=f}
 /* rolling drag */
 sp=Math.hypot(b.vx,b.vz);if(sp>0){const d=(.04*sp+.002*sp*sp)*dt,f=Math.max(0,1-d/sp);b.vx*=f;b.vz*=f}
 /* slope: -grad H (g + v.Hess.v) / (1 + |grad H|^2) */
 const gr=hG(b.x,b.z,_g2);let gx=gr[0],gz=gr[1];{const gm=Math.hypot(gx,gz);if(gm>4){gx*=4/gm;gz*=4/gm}}sp=Math.hypot(b.vx,b.vz);let N=G9;
 if(sp>.3){const dx=b.vx/sp,dz=b.vz/sp,e=.12,hp=hH(b.x+dx*e,b.z+dz*e),hm=hH(b.x-dx*e,b.z-dz*e);if(Math.abs(hp-hm)<e*7&&Math.abs(hp-b.y)<e*7&&Math.abs(hm-b.y)<e*7){const c=(hp+hm-2*b.y)/(e*e);N=G9+sp*sp*c}}
 if(N<-2&&sp>.8){leaveGround(gx*b.vx+gz*b.vz);b.vy=clamp(b.vy,-12,14);if(b.A)b.A.fromLip=1;b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;return}
 const k=-N/(1+gx*gx+gz*gz);b.vx+=gx*k*dt;b.vz+=gz*k*dt;
 sp=Math.hypot(b.vx,b.vz);if(sp>VMAXG){b.vx*=VMAXG/sp;b.vz*=VMAXG/sp}
 /* move, with cliff tests against the slope predicted from the old position */
 let xn=b.x+b.vx*dt,zn=b.z+b.vz*dt;const Hn=hH(xn,zn),pred=b.y+gx*(xn-b.x)+gz*(zn-b.z),jump=Hn-pred;
 if(jump>.16){const jx=hH(xn,b.z)-(b.y+gx*(xn-b.x)),jz=hH(b.x,zn)-(b.y+gz*(zn-b.z));let bx2=jx>.16,bz2=jz>.16;if(!bx2&&!bz2){bx2=bz2=true}
  let imp=0;if(bx2){imp=Math.max(imp,Math.abs(b.vx));xn=b.x;b.vx*=-.12}if(bz2){imp=Math.max(imp,Math.abs(b.vz));zn=b.z;b.vz*=-.12}
  hitSound(imp);if(imp>4.8&&!b.man)return bail('Slammed into a wall');if(imp>3.2&&b.man)return bail('Slammed into a wall');
  b.x=xn;b.z=zn;b.y=hH(xn,zn);return}
 if(jump<-.16&&sp>.5){leaveGround(b.vy);b.x=xn;b.z=zn;b.y=pred;return}
 {const vy2=(Hn-b.y)/dt;b.x=xn;b.z=zn;b.y=Hn;b.vy=clamp(vy2,-30,30)}
 /* the park fence */
 bounds(false)}
function bounds(air){const b=B;let hit=0;
 if(b.x>BXL){b.x=BXL;if(b.vx>0){hit=Math.max(hit,b.vx);b.vx*=-.2}}else if(b.x<-BXL){b.x=-BXL;if(b.vx<0){hit=Math.max(hit,-b.vx);b.vx*=-.2}}
 if(b.z>BZL){b.z=BZL;if(b.vz>0){hit=Math.max(hit,b.vz);b.vz*=-.2}}else if(b.z<-BZL){b.z=-BZL;if(b.vz<0){hit=Math.max(hit,-b.vz);b.vz*=-.2}}
 if(hit>0){hitSound(hit);if(hit>7.5&&!air&&b.st=='g')bail('Hit the fence')}}
/* ---- ollie: charge on the ground, pop on release along the surface normal ---- */
function doOllie(pw){const b=B,g=gear();if(b.st!='g'||b.rev)return;const gr=hG(b.x,b.z,_g2),l=Math.hypot(gr[0],1,gr[1]),pv=(2.25+2.45*pw)*g.pop;
 b.vx+=-gr[0]/l*pv;b.vz+=-gr[1]/l*pv;b.vy=gr[0]*b.vx*0+ (gr[0]*(b.vx+gr[0]/l*pv)+gr[1]*(b.vz+gr[1]/l*pv))+pv/l;
 airStart('ollie');b.st='a';b.man=false;b.popAnim=.25;sfxPop(pw);spray(b.x,b.y,b.z,4,{sp:.8,vy:.8,c:'#cfd3d8',size:.05})}
/* ---- air: gravity, spins, flips, grabs, the lip pull-back, rails and walls ---- */
const LIPS=[[QP1,'x',1],[QP2,'x',-1],[HP,'x',0],[KICK,'x',0]];
function stepAir(dt,I){const b=B,g=gear(),A=b.A;b.tAir+=dt;A.t+=dt;
 b.vy-=G9*dt;const d=Math.exp(-.03*dt);b.vx*=d;b.vz*=d;
 /* lean back into the transition: over a ramp or the pool, fly back in instead of drifting to the deck */
 if(A.fromLip||A.pop){const pp=pipeIn(b.x,b.z);if(pp&&b.tAir<2.6){const vi=b.vx*pp[0]+b.vz*pp[1];if(vi<2){const a=Math.min(9,(2-vi)*8)*dt;b.vx+=pp[0]*a;b.vz+=pp[1]*a}}}
 /* spins and flips */
 const sdir=(I.spinL?1:0)-(I.spinR?1:0),rate=9.4*g.spin;
 if(sdir){b.spinV+=(sdir*rate-b.spinV)*Math.min(1,dt*14);b.spin+=b.spinV*dt;b.spinTo=Math.round(b.spin/PI)*PI+(Math.abs(b.spin-Math.round(b.spin/PI)*PI)>PI*.5?sdir*PI:0)}
 else{b.spinTo=Math.round(b.spin/PI)*PI;const dd=b.spinTo-b.spin,st2=Math.min(Math.abs(dd),8*g.spin*dt);b.spin+=Math.sign(dd)*st2;b.spinV*=.8}
 b.spin=clamp(b.spin,-5*PI,5*PI);A.maxSpin=Math.max(A.maxSpin,Math.abs(b.spin));
 if(I.flipReq&&!b.flip&&b.flipsDone.length<2){const k=I.flipReq;if(unlocked(k)&&!b.flipsDone.includes(k)){b.flip={k,t:0,dur:(k=='shove'?.52:.6)/(.85+.15*g.spin)}}else if(!unlocked(k))tip('Rex teaches that. Talk to him.')}
 if(b.flip){b.flip.t+=dt;const p=clamp(b.flip.t/b.flip.dur,0,1),e=p*p*(3-2*p);if(b.flip.k=='kick')b.flipA=e*TAU;else if(b.flip.k=='heel')b.flipA=-e*TAU;else b.shoveA=e*PI;
  if(p>=1){b.flipsDone.push(b.flip.k);if(b.flip.k=='shove'){b.shoveA=0}else b.flipA=0;flipDone(b.flip.k);b.flip=null}}
 if(I.grab&&b.tAir>.12){const id=GRAB_DIR[I.grabDir||''];if(unlocked(id)){if(b.grabId!=id){b.grabId=id;b.grabT=0}b.grabT+=dt;b.grab=Math.min(1,b.grab+dt*7)}else{if(b.grab<.1)tip('Rex teaches grabs. Talk to him.')}}
 else{b.grab=Math.max(0,b.grab-dt*8);if(b.grab<=0&&b.grabId){if(b.grabT>=GRAB_AIR)A.grabs[b.grabId]=(A.grabs[b.grabId]||0)+b.grabT;b.grabId=null;b.grabT=0}}
 b.gcool=Math.max(0,b.gcool-dt);
 if(b.gcool<=0&&tryRail(I))return;
 if(tryWall(I))return;
 /* integrate */
 let xn=b.x+b.vx*dt,zn=b.z+b.vz*dt,yn=b.y+b.vy*dt;const Hn=hH(xn,zn);
 b.maxH=Math.max(b.maxH||0,b.y-A.y0);A.maxH=Math.max(A.maxH,b.y-A.y0);
 if(yn<=Hn+1e-4){
  if(Hn-b.y>.3){const jx=hH(xn,b.z)-b.y>.3,jz=hH(b.x,zn)-b.y>.3;let imp=0;if(jx||!jz){imp=Math.max(imp,Math.abs(b.vx));xn=b.x;b.vx*=-.15}if(jz||!jx){imp=Math.max(imp,Math.abs(b.vz));zn=b.z;b.vz*=-.15}
   hitSound(imp);if(imp>5.2){b.x=xn;b.z=zn;return bail('Smacked into a wall')}b.x=xn;b.z=zn;b.y+=b.vy*dt;if(b.y<hH(b.x,b.z))b.y=hH(b.x,b.z);return}
  b.x=xn;b.z=zn;b.y=Hn;landing(I);return}
 b.x=xn;b.z=zn;b.y=yn;bounds(true)}
function pipeIn(x,z){/* unit vector (x,z) pointing from the lip back into the transition, when the board is over one */
 if(x>PX0-1.2&&x<PX1+1.2&&z>PZ0-1.2&&z<PZ1+1.2){const d=poolD(x,z);if(d>-1.2&&d<1.4){const e=.2,gx=poolD(x+e,z)-poolD(x-e,z),gz=poolD(x,z+e)-poolD(x,z-e),l=Math.hypot(gx,gz)||1;return[gx/l,gz/l]}}
 for(const e of [QP1,QP2,HP]){if(z<e.a-.6||z>e.b+.6||x<e.x0-.6||x>e.x1+.6)continue;const u=(x-e.u0)*e.dir;if(e===HP){if(u<3.6)return[e.dir,0];if(u>10.4)return[-e.dir,0];continue}const Lu=e.id=='qp1'?2.35:1.17;if(u>Lu-.8&&u<e.U+.4)return[-e.dir,0]}
 return null}
/* ---- rails ---- */
const _ro={};
function tryRail(I){const b=B;if(b.vy>1.8)return false;const sp=Math.hypot(b.vx,b.vz);if(sp<1.3)return false;
 for(const r of RAILS){if(r.coping&&b.y>.6)continue;
  /* closest point of the rail to the board (horizontal), then the height gap */
  let bs=-1,bd=9;for(let i=0;i<r.seg.length;i++){const a=r.pts[i],g=r.seg[i];let t=(b.x-a[0])*g.dx+(b.z-a[2])*g.dz;t=clamp(t,0,g.L);const px=a[0]+g.dx*t,pz=a[2]+g.dz*t,d=Math.hypot(b.x-px,b.z-pz);if(d<bd){bd=d;bs=r.cum[i]+t}}
  if(bd>.42)continue;railAt(r,bs,_ro);const dy=b.y-_ro.y;if(dy>.32||dy<-.14)continue;
  /* the angle between the board and the rail decides the grind */
  const yaw=b.yaw+b.spin,ry=Math.atan2(_ro.dx,_ro.dz);let a=angd(yaw-ry);if(a>PI/2)a-=PI;else if(a<-PI/2)a+=PI;const aa=Math.abs(a);
  let type=null;if(aa<.72)type=I.grabDir=='s'||I.keyS?'g5':I.keyW?'gnose':'g50';else if(aa>.9)type='gbs';else continue;
  if(!unlocked(type)){if(type!='g50'){type='g50';if(aa>.9)continue}}
  const al=b.vx*_ro.dx+b.vz*_ro.dz;let v=al;if(Math.abs(v)<1.4)v=1.4*(Math.cos(angd(yaw-ry))>=0?1:-1);
  if(!(sp>1.3))continue;
  b.st='r';b.rail=r;b.rs=bs;b.rs0=bs;b.rv=v;b.rType=type;b.rb=clamp(a*.2,-.3,.3);b.rbv=0;b.rT=0;b.rDist=0;b.x=_ro.x;b.z=_ro.z;b.y=_ro.y;b.vy=0;b.grab=0;b.flip=null;b.flipA=0;b.shoveA=0;b.rAng=type=='gbs'?(a>=0?PI/2:-PI/2):0;b.rMul=r.coping?1:1;
  b.railA=b.A;grindStart(type);return true}
 return false}
function stepRail(dt,I){const b=B,g=gear(),r=b.rail;b.rT+=dt;
 railAt(r,b.rs,_ro);const m=_ro.m;b.rv+=-G9*m/(1+m*m)*dt*(b.rv>=0?1:1);b.rv*=1-.2*dt;
 const sgnv=b.rv>=0?1:-1;b.rs+=b.rv*dt;b.rDist=Math.abs(b.rs-b.rs0);
 /* balance: it drifts, you hold it with A / D; it gets harder the longer you go */
 const inst=(1.7+.32*b.rT)/g.bal,inp=(I.left?-1:0)+(I.right?1:0);
 b.rbv+=(b.rb*inst*2.2+noise(b.rT,3)*1.5*inst/1.7)*dt-inp*(5.8*g.bal)*dt;b.rbv*=Math.exp(-1.5*dt);b.rb+=b.rbv*dt;
 if(Math.abs(b.rb)>=1)return bail('Slipped off the rail');
 railAt(r,b.rs,_ro);b.x=_ro.x;b.z=_ro.z;b.y=_ro.y;
 const ry=Math.atan2(_ro.dx*sgnv,_ro.dz*sgnv);b.yaw=ry;b.gyaw=b.rAng;
 const rate=({g50:100,g5:125,gnose:140,gbs:130})[b.rType]*(1+.12*b.rT)*(1-Math.abs(b.rb)*.35)*(r.coping?1.1:1);
 pendLive(b.rType,rate*dt);b.gPts=(b.gPts||0)+rate*dt;
 if(Math.random()<dt*28)spark(b.x,b.y,b.z);
 const end=b.rs>=r.len||b.rs<=0;
 if(end||I.ollieNow){railExit(end?'end':'ollie',sgnv)}
 else if(Math.abs(b.rv)<.55)railExit('slow',sgnv)}
function railExit(how,sgnv){const b=B,r=b.rail;railAt(r,clamp(b.rs,0,r.len),_ro);const v=Math.abs(b.rv)*sgnv,dx=_ro.dx*v,dz=_ro.dz*v;
 b.vx=dx;b.vz=dz;b.vy=how=='ollie'?3.3*gear().pop:Math.max(.5,_ro.m*v+.8);b.st='a';b.gcool=.4;b.x=_ro.x;b.z=_ro.z;b.y=_ro.y+.02;
 b.gyaw=0;b.yaw=Math.atan2(dx,dz);const done={type:b.rType,rail:r.id,dist:b.rDist,t:b.rT,pts:b.gPts||0,how};b.gPts=0;b.rail=null;
 airStart('rail');b.A.railed=true;grindEnd(done)}
/* ---- wallride ---- */
function tryWall(I){const b=B;if(!unlocked('wall')||b.y<.3||b.wallCool>0)return false;const sp=Math.hypot(b.vx,b.vz);if(sp<3.8)return false;
 for(const w of WALLS){const along=w.ax=='z'?b.x:b.z,perp=w.ax=='z'?b.z:b.x;if(along<w.a-.3||along>w.b+.3||b.y>w.top-.25)continue;const d=(perp-w.c)*w.n;if(d<-.05||d>.62)continue;
  const vn=(w.ax=='z'?b.vz:b.vx)*w.n,vt=w.ax=='z'?b.vx:b.vz;if(Math.abs(vt)<3||vn>1.2)continue;if(Math.atan2(-vn,Math.abs(vt))>1.08)continue;
  b.st='w';b.wall=w;b.wT=0;b.wv=vt;b.vy=Math.max(b.vy,1.4);b.A.wallT=0;wallStart();return true}
 return false}
function stepWall(dt,I){const b=B,w=b.wall;b.wT+=dt;b.vy-=G9*.32*dt;b.wv*=1-.16*dt;const along=(w.ax=='z'?b.x:b.z)+b.wv*dt;
 if(w.ax=='z'){b.x=along;b.z=w.c+w.n*.34;b.yaw=Math.atan2(b.wv,0)}else{b.z=along;b.x=w.c+w.n*.34;b.yaw=Math.atan2(0,b.wv)}
 b.y+=b.vy*dt;if(b.y<.15)b.y=.15;b.A.wallT+=dt;pendLive('wall',130*dt);b.gPts=(b.gPts||0)+130*dt;
 const out=along<w.a||along>w.b,top=b.y>w.top-.1;
 if(out||top||b.wT>1.5||Math.abs(b.wv)<2.2||I.ollieNow){const kick=(I.ollieNow?3.6:2.4);const nx=w.ax=='z'?0:w.n,nz=w.ax=='z'?w.n:0;
  b.vx=(w.ax=='z'?b.wv:0)+nx*kick;b.vz=(w.ax=='z'?0:b.wv)+nz*kick;b.vy=Math.max(b.vy,0)+(I.ollieNow?3.2:1.2);b.st='a';b.wallCool=.5;b.yaw=Math.atan2(b.vx,b.vz);const pts=b.gPts||0;b.gPts=0;b.wall=null;const A0=b.A;b.A.afterWall=true;wallEnd(pts,A0)}}
/* ---- manual ---- */
function stepManual(dt,I){const b=B,g=gear();const pad=onPad(b.x,b.z);b.pad=pad;const inst=(2.0+.22*b.manT)/(g.bal*(pad?1.7:1)),inp=(I.keyW?1:0)-(I.keyS?1:0);
 b.manT+=dt;b.mv+=(b.mb*inst*2.0+noise(b.manT,9)*1.4*inst/2)*dt+inp*(-5.2*g.bal)*dt;b.mv*=Math.exp(-1.4*dt);b.mb+=b.mv*dt;
 if(Math.abs(b.mb)>=1)return bail('Lost the manual');
 pendLive('manual',(60+14*Math.min(b.manT,6))*(pad?1.5:1)*dt);b.mPts=(b.mPts||0)+(60+14*Math.min(b.manT,6))*(pad?1.5:1)*dt}
const onPad=(x,z)=>(x>-18&&x<-13.5&&z>8.2&&z<9.8)||(x>-8&&x<-3.5&&z>10.2&&z<11.8)?1:0;
/* ---- landing: how clean was it? ---- */
function landing(I){const b=B,A=b.A,g=gear();const gr=hG(b.x,b.z,_g2),l=Math.hypot(gr[0],1,gr[1]),nx=-gr[0]/l,ny=1/l,nz=-gr[1]/l;
 const vn=b.vx*nx+b.vy*ny+b.vz*nz,imp=Math.max(0,-vn);const tx=b.vx-nx*vn,ty=b.vy-ny*vn,tz=b.vz-nz*vn;
 const sp=Math.hypot(b.vx,b.vz),yaw=b.yaw+b.spin;let err=0,fak=false;if(sp>1.2){const dp=angd(yaw-Math.atan2(tx,tz));err=Math.min(Math.abs(dp),PI-Math.abs(dp));fak=Math.abs(dp)>PI/2}
 let q='clean',why='';const bad=r=>{q='bail';why=why||r},sk=r=>{if(q=='clean'){q='sketchy';why=r}};
 if(b.flip){const p=b.flip.t/b.flip.dur;if(p<.8)bad('Under-rotated');else sk('Late flip')}
 if(Math.abs(b.spinTo-b.spin)>1.05)bad('Under-rotated');else if(Math.abs(b.spinTo-b.spin)>.45)sk('Short spin');
 if(err>.95)bad('Sideways landing');else if(err>.5)sk('Sketchy landing');
 if(imp>17*g.stab)bad('Slammed it');else if(imp>11*g.stab)sk('Hard landing');
 if(b.grab>.5&&I.grab)sk('Grabbing on landing');
 const perfect=q=='clean'&&err<.22&&imp<5&&(!b.flip);
 /* trick list for this air */
 if(b.grabId&&b.grabT>=GRAB_AIR)A.grabs[b.grabId]=(A.grabs[b.grabId]||0)+b.grabT;
 const air={A,q,why,perfect,imp,err,fak,spinN:Math.round(Math.abs(b.spin)/PI),flips:b.flipsDone.slice(),height:A.maxH,time:A.t,px:b.x,pz:b.z,py:b.y};
 b.vy=0;b.grab=0;b.grabId=null;b.grabT=0;b.flip=null;b.flipA=0;b.shoveA=0;
 if(q=='bail'){b.x=b.x;landSound(imp,true);return bail(why,air)}
 b.vx=tx;b.vz=tz;b.vy=ty;b.st='g';b.yaw=yaw;b.spin=0;b.spinTo=0;b.spinV=0;b.fakT=0;b.A=null;b.lastLand=G.t;
 if(q=='sketchy'){b.vx*=.8;b.vz*=.8;b.wob=.55}
 landSound(imp,false);spray(b.x,b.y,b.z,q=='clean'?5:9,{sp:1,vy:1,c:'#cfd3d8',size:.06});
 airLanded(air)}
/* ---- bail: tumble, then a quick recovery ---- */
const BAILS=['Ouch!','Not like that!','The ground says hi','Yard sale!','Board: 1, You: 0','Gravity wins','Smooth. Not.','Walk it off'];
function bail(why,air){const b=B;if(b.st=='b'||!G)return;const st0=b.st;
 const rv={x:b.x,y:b.y+.9,z:b.z,vx:b.vx*.75,vy:Math.max(b.vy*.6,0)+2.6,vz:b.vz*.75,rx:0,ry:b.yaw,rz:0,wx:rr(-6,6),wy:rr(-4,4),wz:rr(-7,7),t:0,stand:0};
 if(st0=='r'){rv.vx=b.rail?(Math.cos(0)*0):0}
 b.st='b';b.rail=null;b.wall=null;b.man=false;b.A=null;b.flip=null;b.flipA=0;b.shoveA=0;b.grab=0;b.spin=0;b.spinTo=0;b.rev=null;b.bail={t:0,rv,why:why||'',msg:pk(BAILS),done:false};b.vy=Math.max(b.vy,1.4);
 bailSound();bailCombo(why);spray(b.x,b.y+.3,b.z,10,{sp:2,vy:2.2,c:'#e8e8e8',size:.08})}
function stepBail(dt,I){const b=B,k=b.bail;k.t+=dt;const r=k.rv;
 /* the board slides on without you, spinning down */
 b.vx*=Math.exp(-1.5*dt);b.vz*=Math.exp(-1.5*dt);b.x+=b.vx*dt;b.z+=b.vz*dt;const hb=hH(b.x,b.z);b.vy-=G9*dt;b.y+=b.vy*dt;if(b.y<hb){b.y=hb;b.vy=Math.abs(b.vy)>1.2?-b.vy*.35:0}b.flipA+=dt*9*Math.exp(-k.t*2);b.yaw+=dt*3*Math.exp(-k.t*2);
 bounds(true);
 /* the rider: a falling, bouncing, sliding body (radius .5) */
 if(k.t<1.15){r.vy-=G9*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;r.z+=r.vz*dt;const hr=hH(r.x,r.z)+.42;if(r.y<hr){r.y=hr;if(r.vy<-2.5){r.vy=-r.vy*.32;spray(r.x,hr-.4,r.z,3,{sp:1,vy:1,c:'#cfd3d8',size:.05});if(!k.thud||G.t-k.thud>.25){k.thud=G.t;sn('pop')}}else r.vy=0;const f=Math.exp(-2.4*dt);r.vx*=f;r.vz*=f;r.wx*=1-dt*2;r.wy*=1-dt*2;r.wz*=1-dt*2}
  r.rx+=r.wx*dt;r.ry+=r.wy*dt;r.rz+=r.wz*dt;if(r.x>BXL){r.x=BXL;r.vx=0}if(r.x<-BXL){r.x=-BXL;r.vx=0}if(r.z>BZL){r.z=BZL;r.vz=0}if(r.z<-BZL){r.z=-BZL;r.vz=0}}
 else{r.stand=clamp((k.t-1.15)/.4,0,1);r.rx*=1-dt*8;r.rz*=1-dt*8;r.y=lerp(r.y,hH(r.x,r.z)+(.42+.0),.2)}
 if(k.t>1.55&&!k.done){k.done=true;
  /* board pops back to the rider's feet, standing on the ground */
  const hy=hH(r.x,r.z);b.x=r.x+Math.sin(r.ry)*.7;b.z=r.z+Math.cos(r.ry)*.7;if(hH(b.x,b.z)>hy+.3){b.x=r.x;b.z=r.z}b.y=hH(b.x,b.z);b.vx=b.vz=b.vy=0;b.yaw=r.ry;b.flipA=0;b.st='g';b.bail=null;b.wob=.4;b.pitch=0;b.roll=0;b.recT=.5;
  spray(b.x,b.y,b.z,8,{sp:1.2,vy:1.6,c:'#ffd23d',size:.07});sn('pop');bailEnd()}}

/* ---------- combo and score ---------- */
const newC=()=>({on:false,pend:[],pts:0,mult:1,seen:{},n:0,idle:0,live:{},t0:0,tricks:[]});
function pendLive(id,p){const c=G.C;c.live[id]=(c.live[id]||0)+p;c.idle=0;c.on=true}
function popup(txt,cls,sec){if(!G||!hud||G.phase=='results')return;const lp=G.pops[G.pops.length-1];if(lp&&lp.t==txt&&lp.c==(cls||'')){lp.l=sec||1.5}else G.pops.push({t:txt,c:cls||'',l:sec||1.5});if(G.pops.length>5)G.pops.shift();G.popDirty=1}
function tip(t){if(!G||G.tipT>0)return;G.tipT=3;popup(t,'tip',2.2)}
const mast=(pts,why)=>{try{if(typeof FW_MASTERY!='undefined'&&FW_MASTERY.add){const r=FW_MASTERY.add('skate',clamp(pts,0,6),why);if(G)G.mast+=+r||0;return+r||0}}catch(e){soft(e,'mast')}return 0};
const nameOf=ids=>{const a=ids.filter(i=>i!='ollie');if(!a.length)return TR.ollie.n;const fl=a.filter(i=>TR[i].k=='f').map(i=>TR[i].n),sp=a.filter(i=>TR[i].k=='s').map(i=>TR[i].n),gr=a.filter(i=>TR[i].k=='g').map(i=>TR[i].n);return[...fl,...sp,...gr].join(' + ')||TR[a[0]].n};
/* an air landed: score its tricks into the combo (clean full, sketchy half and no big multiplier, bail loses everything) */
function airLanded(air){const A=air.A,b=B,list=[];const o=st();
 if(A.pop||A.kind=='ollie'||air.height>.25)list.push({id:'ollie',pts:TR.ollie.p+Math.round(40*air.height)});
 air.flips.forEach(k=>list.push({id:k,pts:TR[k].p}));
 if(air.spinN>=1){const id=SPINS[Math.min(5,air.spinN)];if(unlocked(id)||true)list.push({id,pts:TR[id].p})}
 for(const id in A.grabs)list.push({id,pts:TR[id].p+Math.round(90*A.grabs[id])});
 const ids=list.map(l=>l.id);
 let bonus=0;const extra=[];
 if(air.height>=.8&&list.length>1||air.height>=1.6){const h=Math.round(45*air.height*air.height);bonus+=h;extra.push('Air '+air.height.toFixed(1)+' m')}
 if(A.fromKick&&onLand(air.px,air.pz)){bonus+=300;extra.push('GAP');air.gap=true}
 if(A.fromPlat&&onStairs(air.px,air.pz)||A.fromPlat&&air.px<52&&air.pz<-24&&air.pz>-31){bonus+=200;extra.push('Stairs');air.stairs=true}
 if(air.fak&&air.spinN%2==0)extra.push('');
 if(!list.length&&!bonus){return}
 const name=nameOf(ids);air.ids=ids;air.name=name;
 const C=G.C;let add=0,fresh=0;
 list.forEach(l=>{const rep=C.seen[l.id]|0;let v=l.pts*Math.pow(.62,rep)*(air.q=='sketchy'?.55:1);add+=v;if(l.id!='ollie'&&rep==0)fresh++;C.seen[l.id]=rep+1});
 add+=bonus*(air.q=='sketchy'?.55:1);if(air.perfect)add*=1.1;
 C.pts+=Math.round(add);C.mult=Math.min(8,C.mult+fresh*(air.q=='sketchy'?.25:.5));C.on=true;C.idle=0;ids.forEach(i=>{if(i!='ollie'&&!C.tricks.includes(i))C.tricks.push(i)});if(ids.includes('ollie')&&ids.length==1){}
 C.n=C.tricks.length;
 if(air.q=='clean'){ids.forEach(i=>{o.tricks[i]=(o.tricks[i]|0)+1});o.landed++;if(air.height>o.bestAir)o.bestAir=Math.round(air.height*100)/100}
 G.stats.landed++;if(air.q=='clean')G.stats.clean++;G.stats.tricks[name]=1;
 popup(name+'  +'+fmtN(add),air.q=='clean'?(air.perfect?'perf':'good'):'meh',1.7);if(extra.length)extra.filter(Boolean).forEach((x,i)=>setTimeout(()=>popup(x,'ex',1.2),120+i*140));
 popup(air.q=='clean'?(air.perfect?'PERFECT LANDING':'Clean'):'Sketchy','q'+air.q,1);
 trackBest(add*C.mult,name);modeLanded(air);lessonCheck()}
function trackBest(v,name){if(!G||v<=(G.bestT?G.bestT.v:0))return;const t1=G.t+.45;G.bestT={v:Math.round(v),name,t1}}
function flipDone(k){}
function grindStart(type){popup(TR[type].n,'ex',1.2);G.grindSnd=1;sn('pop')}
function grindEnd(d){const C=G.C,v=Math.round(C.live[d.type]||0);delete C.live[d.type];
 if(v<1)return;const rep=C.seen[d.type]|0,f=Math.pow(.62,rep);const add=Math.round(v*f);C.seen[d.type]=rep+1;C.pts+=add;if(rep==0){C.mult=Math.min(8,C.mult+.5)}
 if(!C.tricks.includes(d.type))C.tricks.push(d.type);C.n=C.tricks.length;C.on=true;C.idle=0;const o=st();o.tricks[d.type]=(o.tricks[d.type]|0)+1;if(d.dist>o.bestGrind)o.bestGrind=Math.round(d.dist*10)/10;G.stats.landed++;G.stats.clean++;G.stats.tricks[TR[d.type].n]=1;
 popup(TR[d.type].n+'  '+d.dist.toFixed(1)+' m  +'+fmtN(add),'good',1.6);trackBest(add*C.mult,TR[d.type].n);
 if(d.how=='ollie')popup('Grind out','ex',1);modeGrind(d);lessonCheck()}
function wallStart(){popup('Wallride','ex',1.1);sn('pop')}
function wallEnd(pts,A0){const C=G.C;pts=Math.round(C.live.wall||0);delete C.live.wall;if(pts<1)return;const rep=C.seen.wall|0,add=Math.round(pts*Math.pow(.62,rep));C.seen.wall=rep+1;C.pts+=add;if(rep==0)C.mult=Math.min(8,C.mult+.5);if(!C.tricks.includes('wall'))C.tricks.push('wall');C.n=C.tricks.length;C.on=true;C.idle=0;const o=st();o.tricks.wall=(o.tricks.wall|0)+1;G.stats.landed++;G.stats.clean++;G.stats.tricks.Wallride=1;popup('Wallride  +'+fmtN(add),'good',1.5);trackBest(add*C.mult,'Wallride');modeGrind({type:'wall',dist:0,rail:'wall'});lessonCheck()}
function manualStart(){}
function manualEnd(ok){const b=B,C=G.C,pts=Math.round(C.live.manual||0);delete C.live.manual;const t=b.manT;b.man=false;b.mb=0;b.mv=0;if(!ok||pts<1)return;
 const rep=C.seen.manual|0,add=Math.round(pts*Math.pow(.62,rep));C.seen.manual=rep+1;C.pts+=add;if(t>=1&&rep==0)C.mult=Math.min(8,C.mult+.5);
 if(t>=1){if(!C.tricks.includes('manual'))C.tricks.push('manual');const o=st();o.tricks.manual=(o.tricks.manual|0)+1;G.stats.landed++;G.stats.clean++;G.stats.tricks.Manual=1;if(t>=2)G.stats.longManual=Math.max(G.stats.longManual||0,t)}
 C.n=C.tricks.length;C.on=true;C.idle=0;popup('Manual '+t.toFixed(1)+' s  +'+fmtN(add),'good',1.4);trackBest(add*C.mult,'Manual');lessonCheck()}
function bailCombo(why){const C=G.C;let lost=C.pts*C.mult;for(const k in C.live)lost+=C.live[k];lost=Math.round(lost);const o=st();o.bails++;G.stats.bails++;
 popup('BAIL  '+(why||''),'bail',1.8);if(lost>50)popup('Combo lost  -'+fmtN(lost),'bail2',1.8);G.C=newC();G.bailAt=G.t;G.lostAt=lost;modeBail(why);
 /* replay the best trick so far after a hard fall (only once per best) */
 if(G.bestT&&G.bestT.v>=250&&G.bestT!==G.lastReplay&&G.mode!='skate'&&!G.noReplay)G.wantReplay=G.bestT}
function bailEnd(){if(G&&G.wantReplay&&G.phase=='ride'){const w=G.wantReplay;G.wantReplay=null;startReplay(w,false)}}
function bankCombo(why){const C=G.C;if(!C.on&&!C.pts){G.C=newC();return}const total=Math.round(C.pts*C.mult);if(total<=0){G.C=newC();return}
 G.score+=total;G.stats.combos++;G.stats.bestCombo=Math.max(G.stats.bestCombo,total);const o=st();if(total>o.bestCombo){o.bestCombo=total}
 popup('COMBO  '+fmtN(C.pts)+' x '+(Math.round(C.mult*10)/10)+'  =  '+fmtN(total),'bank',2);
 if(total>=250)mast(.18+.5*Math.sqrt(total/1500)+.1*Math.min(6,C.n)+(G.stats.bails?0:.1),'Combo '+fmtN(total));
 const n=C.n;G.C=newC();modeBank(total,n)}
/* ---------- coach lessons ---------- */
function lessonCheck(){const o=st();if(o.les>=LES.length)return;const p=lesProg(o.les);if(p.ok&&!G.lesAnn){G.lesAnn=o.les+1;popup('Lesson done! Talk to Rex to learn new tricks','tip',3)}}

/* ---------- audio: effects through the game's helpers, a rolling loop that follows speed and surface, a grind scrape ---------- */
const ROLL={a:null};
function audioOn(){if(ROLL.a||typeof FX=='undefined'||!FX)return;try{ac();if(typeof AC=='undefined'||!AC||!NB)return;const mk=(type,f,q)=>{const s=AC.createBufferSource();s.buffer=NB;s.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=AC.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(MG);s.start(0,Math.random()*.8);return{s,fl,g}};
 ROLL.a={roll:mk('lowpass',300,.7),scr:mk('bandpass',3200,3.2),rum:mk('lowpass',120,.5)}}catch(e){soft(e,'audio')}}
function audioOff(){if(!ROLL.a)return;try{for(const k in ROLL.a){const n=ROLL.a[k];n.g.gain.value=0;n.s.stop();n.s.disconnect();n.fl.disconnect();n.g.disconnect()}}catch(e){}ROLL.a=null}
function audioTick(dt){const a=ROLL.a;if(!a||!G||!B){return}try{const t=AC.currentTime,sp=Math.hypot(B.vx,B.vz),gr=B.st=='g'&&!G.paused,on=G.phase=='ride'||G.phase=='over';
  const surf=B.st=='g'?hH(B.x,B.z):0,onRamp=B.st=='g'&&(Math.abs(hG(B.x,B.z,_g2)[0])+Math.abs(_g2[1])>.15);
  const vol=(gr&&on&&!G.paused)?clamp(sp/9,0,1)*(B.man?.8:1):0,fr=180+sp*85+(onRamp?160:0);
  a.roll.g.gain.setTargetAtTime(vol*.2,t,.05);a.roll.fl.frequency.setTargetAtTime(fr,t,.05);a.rum.g.gain.setTargetAtTime(vol*.16*(onRamp?1.2:1),t,.06);a.rum.fl.frequency.setTargetAtTime(70+sp*14,t,.08);
  const sc=(B.st=='r'||B.st=='w')&&!G.paused&&on?clamp(Math.abs(B.rv||B.wv||0)/6,.25,1):0;a.scr.g.gain.setTargetAtTime(sc*.2,t,.03);a.scr.fl.frequency.setTargetAtTime(2400+Math.abs(B.rv||0)*220+(B.rb||0)*500,t,.04)}catch(e){}}
const spl=k=>{try{SND_ADD();snd(k)}catch(e){}};
const SND_ADD=()=>{try{if(typeof SND!='object'||SND.sk_pop)return;
 SND.sk_pop=()=>{sdHit(210,.11,.28,[[1,1,1],[2.6,.3,.4]],{bend:.6,jit:.04,lp:1200});sdNz(.04,2600,.1,{q:1.2})};
 SND.sk_land=()=>{sdHit(95,.18,.3,[[1,1,1]],{bend:.5,lp:500});sdNz(.09,1500,.14,{q:.7,f2:500})};
 SND.sk_hard=()=>{sdHit(70,.3,.4,[[1,1,1],[1.7,.3,.5]],{bend:.8,lp:420});sdNz(.18,900,.2,{q:.6,f2:240});sdNz(.05,3400,.08,{ty:'highpass'})};
 SND.sk_bail=()=>{sdHit(120,.4,.34,[[1,1,1],[1.5,.4,.5]],{bend:.9,lp:500});sdNz(.3,700,.22,{q:.6,f2:180});[0,.13,.26].forEach((d,i)=>sdHit(260-i*40,.2,.12,[[1,1,1]],{del:.15+d,bend:.3,lp:900}));sdHit(880,.5,.05,[[1,1,1]],{del:.5,rev:.2});sdHit(660,.5,.05,[[1,1,1]],{del:.62,rev:.2})};
 SND.sk_hit=()=>{sdHit(150,.1,.22,[[1,1,1]],{bend:.4,lp:700});sdNz(.05,1200,.14,{q:.8})};
 SND.sk_flip=()=>{sdNz(.12,2800,.08,{q:1.5,f2:1200,pan:rr(-.2,.2)})};
 SND.sk_chime=()=>{[1,1.25,1.5,2].forEach((r,i)=>sdHit(523*r,.5,.09,[[1,1,1],[2,.2,.4]],{del:i*.06,jit:.002,rev:.3,pan:(i-1.5)*.15}))};
 SND.sk_tick=()=>{sdHit(1500,.04,.07,[[1,1,1]],{jit:.01})};
 SND.sk_clap=()=>{for(let i=0;i<5;i++)sdNz(.05,2200+i*200,.06,{q:.8,del:i*.04})}}catch(e){}};
const sfxPop=pw=>{spl('sk_pop')},hitSound=imp=>{if(imp>1.2&&(!G||G.t-(G.hitT||-9)>.15)){if(G)G.hitT=G.t;spl('sk_hit')}},landSound=(imp,bad)=>{spl(imp>9||bad?'sk_hard':'sk_land')},bailSound=()=>spl('sk_bail');
/* ---------- particles (one instanced mesh of small boxes) ---------- */
const PN=160;let PART=null;
function partsOn(){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92}),PN);im.frustumCulled=false;im.renderOrder=5;
 const pt=[];for(let i=0;i<PN;i++){pt.push({l:0,m:1,x:0,y:0,z:0,vx:0,vy:0,vz:0,s:.1,g:9,c:new THREE.Color(1,1,1)});im.setColorAt(i,pt[i].c)}scene.add(im);PART={im,pt,n:0,m4:new THREE.Matrix4(),q:new THREE.Quaternion(),v:new THREE.Vector3(),sc:new THREE.Vector3()}}
function partsOff(){if(!PART)return;scene.remove(PART.im);PART.im.geometry.dispose();PART.im.material.dispose();PART.im.dispose();PART=null}
function spray(lx,ly,lz,n,o){if(!PART)return;o=o||{};for(let k=0;k<n;k++){const p=PART.pt[PART.n=(PART.n+1)%PN],a=rr(0,TAU),sp=rr(.3,1)*(o.sp||1.6);p.x=CX+lx+rr(-1,1)*.1;p.y=SLAB+ly+rr(0,.1);p.z=CZ+lz+rr(-1,1)*.1;p.vx=Math.cos(a)*sp;p.vz=Math.sin(a)*sp;p.vy=(o.vy||2)*rr(.5,1.2);p.s=(o.size||.08)*rr(.7,1.3);p.l=p.m=(o.life||.6)*rr(.7,1.2);p.g=o.g==null?9:o.g;p.c.set(o.c||'#fff')}}
function spark(lx,ly,lz){spray(lx,ly,lz,2,{sp:2.2,vy:1.6,c:Math.random()<.5?'#ffd27a':'#ffb347',size:.045,life:.45,g:12})}
function partsTick(dt){if(!PART)return;const im=PART.im,{m4,q,v,sc}=PART;for(let i=0;i<PN;i++){const p=PART.pt[i];if(p.l>0){p.l-=dt;p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<SLAB&&p.g>0){p.y=SLAB;p.vy=0;p.vx*=.3;p.vz*=.3;p.l=Math.min(p.l,.1)}}
  const k=p.l>0?Math.min(1,p.l/p.m*2.2)*p.s:0;v.set(p.x,p.y,p.z);sc.set(k,k,k);m4.compose(v,q,sc);im.setMatrixAt(i,m4);im.setColorAt(i,p.c)}im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}

/* ---------- the board and the rider ---------- */
function boardMesh(d,tr){return bmesh(()=>{const c=d.col,tp=d.tape;
 bx(.2,.025,.78,c,0,.19,0);bx(.2,.03,.14,c,0,.215,.43,0,.5);bx(.2,.03,.14,c,0,.215,-.43,0,-.5);bx(.2,.012,.76,tp,0,.208,0);bx(.14,.01,.1,dk(c,.8),0,.206,.3);bx(.014,.012,.5,'#fff',-.07,.2105,0);
 [-.26,.26].forEach(z=>{bx(.17,.03,.1,'#9aa2ab',0,.15,z);bx(.14,.05,.07,'#6c747d',0,.12,z);[-1,1].forEach(s=>{bx(.045,.12,.12,d.wh,s*.1,.06,z)})});
 bx(.05,.03,.02,tr==2?'#ffd23d':'#d9483b',0,.172,.43)})}
const _e=new THREE.Euler(0,0,0,'YXZ'),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_v=new THREE.Vector3(),_yq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-PI/2);
/* frame schema (a 24 number array): 0-2 board x y z (world), 3 yaw, 4 pitch, 5 roll, 6 flip, 7 shove, 8 crouch, 9 lean, 10 grab, 11 mode, 12 balance, 13 time, 14-16 rider pos, 17-19 rider rot, 20 stand, 21 push, 22 grab id, 23 speed */
const M_G=0,M_A=1,M_R=2,M_M=3,M_W=4,M_B=5;
function frameOf(){const b=B,mo=b.st=='g'?(b.man?M_M:M_G):b.st=='a'?M_A:b.st=='r'?M_R:b.st=='w'?M_W:M_B;let crouch=.14+b.sprint*.05,lean=0,bal=0;
 if(b.st=='g'){if(b.pop>0)crouch=.18+.7*b.pop;if(b.man){bal=b.mb;crouch=.25}if(b.wob>0)crouch+=.2*Math.sin(G.t*30)*b.wob;lean=clamp(-(hG(b.x,b.z,_g2)[0]*0)+(b.steerS||0)*.5,-.6,.6)}
 else if(b.st=='a'){crouch=.35+.45*b.grab+(b.spinV?.0:0);bal=0}else if(b.st=='r'){crouch=.35;bal=b.rb}else if(b.st=='w')crouch=.3;
 const gr=hG(b.x,b.z,_g2),hd=Math.sin(b.yaw)*gr[0]+Math.cos(b.yaw)*gr[1];let pitch=0,roll=0;
 if(b.st=='g'){pitch=-Math.atan(hd);roll=Math.atan(Math.cos(b.yaw)*gr[0]-Math.sin(b.yaw)*gr[1])*.0;if(b.man)pitch+=b.mb*.55+.18}
 else if(b.st=='a'){pitch=clamp(-b.vy*.03,-.3,.3)+(b.popAnim>0?.35*b.popAnim/.25:0)}else if(b.st=='r'){pitch=-Math.atan(b.rail?railAt(b.rail,b.rs,_ro).m*(b.rv>=0?1:-1):0)}
 else if(b.st=='w'){roll=b.wall?-b.wall.n*(b.wall.ax=='z'?1:1)*1.3*(b.wv>=0?1:-1)*(b.wall.ax=='z'?-1:1):0}
 const ry=b.st=='a'?b.yaw+b.spin:b.yaw+(b.st=='r'?b.gyaw:0);
 const f=[CX+b.x,SLAB+b.y,CZ+b.z,ry,pitch,roll,b.flipA,b.shoveA,crouch,lean,b.grab,mo,bal,G.t,0,0,0,0,0,0,0,b.sprint,GRAB_IDX[b.grabId]||0,Math.hypot(b.vx,b.vz)];
 if(mo==M_B&&b.bail){const r=b.bail.rv;f[14]=CX+r.x;f[15]=SLAB+r.y;f[16]=CZ+r.z;f[17]=r.rx;f[18]=r.ry;f[19]=r.rz;f[20]=r.stand}return f}
const GRAB_IDX={indy:1,nose:2,tail:3,melon:4,stale:5};
/* apply a frame to a character record R={g,arms,legs,board} */
const ref=new THREE.Object3D();
function applyFrame0(R,f,off){const bd=R.board,b0=ref,tt=f[13];
 bd.position.set(f[0],f[1]+.18*f[10],f[2]);bd.rotation.set(f[4],f[3]+f[7],f[5]+f[6],'YXZ');
 const mo=f[11],A=R.arms,L=R.legs,m=R.g;
 if(mo==M_B&&f[20]!=null&&(f[14]||f[15])){/* tumbling: the whole body is a flailing lump */
  m.position.set(f[14],f[15]-.42,f[16]);_e.set(f[17]*(1-f[20]),f[18],f[19]*(1-f[20]),'XYZ');m.quaternion.setFromEuler(_e);
  const fl=tt*14,k=1-f[20];A[0].rotation.set(Math.sin(fl)*2.2*k,0,-1.3*k);A[1].rotation.set(Math.sin(fl+2)*2.2*k,0,1.3*k);L[0].rotation.set(Math.sin(fl+1)*1.1*k,0,-.4*k);L[1].rotation.set(-Math.sin(fl+1)*1.1*k,0,.4*k);m.scale.setScalar(1);return}
 b0.position.set(f[0],f[1],f[2]);b0.rotation.set(f[4],f[3],f[5],'YXZ');b0.updateMatrix();b0.quaternion.setFromEuler(b0.rotation);
 const cr=clamp(f[8],0,1),a=.55+.3*cr,drop=.5*(1-Math.cos(a))+.0;
 _v.set(0,.2-drop-.03+(f[10]?0:0),0).applyQuaternion(b0.quaternion);m.position.set(f[0]+_v.x,f[1]+_v.y,f[2]+_v.z);
 _q.copy(b0.quaternion).multiply(_yq);if(mo==M_M||mo==M_G&&f[9]){_e.set(0,0,f[9]*.25);_q2.setFromEuler(_e);_q.multiply(_q2)}m.quaternion.copy(_q);
 const w=Math.sin(tt*2.2)*.08;
 L[0].rotation.set(0,0,-a);L[1].rotation.set(0,0,a);
 if(mo==M_A){const g=f[10];A[0].rotation.set(0,0,-1.25+g*.8);A[1].rotation.set(0,0,1.25-g*.3);if(g>.3){const id=f[22];A[1].rotation.set(0,0,.2+g*.2);A[0].rotation.set(id==2||id==4?-.2:0,0,-.5-(id==3?.5:0));L[1].rotation.set(0,0,a+.2*g)}}
 else if(mo==M_R){const bl=f[12];A[0].rotation.set(0,0,-1.0-bl*.8);A[1].rotation.set(0,0,1.0-bl*.8)}
 else if(mo==M_M){const bl=f[12];A[0].rotation.set(0,0,-.9+bl*.5);A[1].rotation.set(0,0,.9+bl*.5)}
 else if(mo==M_W){A[0].rotation.set(0,0,-1.1);A[1].rotation.set(0,0,1.1)}
 else{const push=f[21];A[0].rotation.set(-.2*cr,0,-.55-w-.3*cr);A[1].rotation.set(-.2*cr,0,.55+w+.3*cr)}
 m.scale.setScalar(1)}

/* ---------- RIDER v55.28.0: a jointed skater (thigh/shin/foot, upper arm/forearm/hand, hip, torso, head) ---------- */
const DECK=.214,LT=.22,LS=.19,ANK=.09,LUA=.25,LFA=.22,UPY=new THREE.Vector3(0,1,0);
const _ia=new THREE.Vector3(),_ib=new THREE.Vector3(),_ic=new THREE.Vector3(),_id=new THREE.Vector3(),_ie=new THREE.Vector3(),_if=new THREE.Vector3(),_iM=new THREE.Matrix4(),_iQ=new THREE.Quaternion();
const _qd=new THREE.Quaternion(),_qb=new THREE.Quaternion(),_qa=new THREE.Quaternion(),_qc=new THREE.Quaternion(),_m1=new THREE.Matrix4(),_m2=new THREE.Matrix4(),_pa=new THREE.Vector3(),_pb=new THREE.Vector3(),_pc=new THREE.Vector3(),_pd=new THREE.Vector3(),_pe=new THREE.Vector3();
const _pk=[new THREE.Vector3(-.25,-.1,1),new THREE.Vector3(.45,-.1,1)],_pkA=[new THREE.Vector3(-.5,-.2,-1),new THREE.Vector3(.5,-.2,-1)];
const _cc=new THREE.Vector3(0,.11,0);
function bq(q,y,pole){_ic.copy(pole).addScaledVector(y,-pole.dot(y));if(_ic.lengthSq()<1e-6){_ic.set(0,0,1).addScaledVector(y,-y.z);if(_ic.lengthSq()<1e-6)_ic.set(1,0,0)}_ic.normalize();_id.crossVectors(y,_ic);_iM.makeBasis(_id,y,_ic);q.setFromRotationMatrix(_iM)}
/* two-bone IK in the pivot's parent space: root, target, bone lengths, knee/elbow pole, upper pivot, lower pivot */
function ik2(root,tg,L1,L2,pole,up,lo){const d=_ia.subVectors(tg,root);let D=d.length();if(D<1e-5){d.set(0,-1,0);D=1}d.divideScalar(D);
 const Dc=clamp(D,Math.abs(L1-L2)+.02,L1+L2-.003),a=(L1*L1-L2*L2+Dc*Dc)/(2*Dc),h=Math.sqrt(Math.max(0,L1*L1-a*a));
 _ib.copy(pole).addScaledVector(d,-pole.dot(d));if(_ib.lengthSq()<1e-6)_ib.set(0,0,1).addScaledVector(d,-d.z);_ib.normalize();
 _ie.copy(d).multiplyScalar(a).addScaledVector(_ib,h).divideScalar(-L1);bq(up.quaternion,_ie,pole);
 _if.copy(d).multiplyScalar(Dc-a).addScaledVector(_ib,-h).divideScalar(-L2);bq(_iQ,_if,pole);
 lo.quaternion.copy(up.quaternion).invert().multiply(_iQ)}
function rbox(p,w,h,d,mat,x,y,z){const m=new THREE.Mesh(geo(w,h,d),mat);m.position.set(x,y,z);p.add(m);return m}
function skRig(f,board){const g=f.g,u=g.userData;if(u.skr){u.skr.board=board;return u.skr}
 const sc=g.scale.y||1;g.scale.setScalar(sc);
 const li=f.legs.map(l=>{const c=l.children,p=(c[0].geometry&&c[0].geometry.parameters)||{};return{x:l.position.x,pm:c[0].material,sm:c.length>=4?c[1].material:c[0].material,fm:c[c.length-1].material,w:p.width||.2,d:p.depth||.25}});
 const ai=f.arms.map(a=>{const c=a.children;return{p:a.position.clone().sub(new THREE.Vector3(0,.5,0)),sl:c.length>1?c[0].geometry.parameters.height:0,m1:c.length>1?c[0].material:null,sk:c[c.length-1].material}});
 const hip=new THREE.Group(),tor=new THREE.Group();tor.rotation.order='YXZ';hip.position.y=.5;g.add(hip);hip.add(tor);let head=null;
 g.children.slice().forEach(c=>{if(c===hip)return;if(f.legs.indexOf(c)>=0){c.visible=false;return}
  if(c.geometry&&c.geometry.type=='CircleGeometry'){c.visible=false;return}
  tor.add(c);c.position.y-=.5;if(f.arms.indexOf(c)>=0)c.visible=false;else if(!c.isMesh&&Math.abs(c.position.y-.9)<.06)head=c});
 if(!head)head=new THREE.Group();head.rotation.order='YXZ';
 const legs=li.map(q=>{const th=new THREE.Group();th.position.set(q.x,0,0);hip.add(th);rbox(th,q.w,LT+.01,q.d*.9,q.pm,0,-LT/2,0);
  const sh=new THREE.Group();sh.position.y=-LT;th.add(sh);rbox(sh,q.w*.86,LS+.01,q.d*.8,q.sm,0,-LS/2,0);
  const ft=new THREE.Group();ft.position.y=-LS;sh.add(ft);rbox(ft,q.w*.95,ANK-.02,.27,q.fm,0,-ANK/2+.01,.04);rbox(ft,q.w,.03,.29,'#f4f4f4'&&M('#f4f4f4'),0,-ANK+.015,.04);
  return{th,sh,ft}});
 const arms=ai.map(q=>{const up=new THREE.Group();up.position.copy(q.p);tor.add(up);
  rbox(up,.14,LUA+.01,.16,q.sl>.05&&q.m1?q.m1:q.sk,0,-LUA/2,0);const lo=new THREE.Group();lo.position.y=-LUA;up.add(lo);
  rbox(lo,.12,LFA+.01,.14,q.sl>.4&&q.m1?q.m1:q.sk,0,-LFA/2,0);rbox(lo,.1,.09,.12,q.sk,0,-LFA-.02,0);return{up,lo,p:q.p}});
 const V=()=>new THREE.Vector3(),s={t:0,fresh:1,c:.14,cv:0,pm:f.legs?0:0,py:0,pt:-9,avy:0,cr:0,rp:0,rr:0,pa:0,p:0,pw:0,tp:0,tw:0,tz:0,hx:0,hz:0,hd:0,bail:0,bt:0,bp:V(),bq:new THREE.Quaternion(),f:[V(),V()],fy:[0,0],h:[V(),V()],sh:null};
 return u.skr={g,arms:f.arms,legs:f.legs,board,hip,tor,head,rl:legs,ra:arms,s,sh:null}}
function skShadow(R,f){let sh=R.sh;if(!sh){sh=R.sh=new THREE.Mesh(new THREE.CircleGeometry(.5,14),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.28,depthWrite:false}));sh.rotation.x=-PI/2;sh.renderOrder=1;(R.g.parent||scene).add(sh)}
 const x=f[0],z=f[2],gy=R.own?SLAB+hH(clamp(x-CX,-HXM,HXM),clamp(z-CZ,-HZM,HZM)):hH(clamp(x,-HXM,HXM),clamp(z,-HZM,HZM)),h=Math.max(0,f[1]-gy),k=1/(1+h*.9);
 sh.position.set(x,gy+.04,z);sh.scale.set(1.5*k,1.5*k,1);sh.material.opacity=.3*k;sh.visible=R.g.visible}
function applyFrame(R,f){if(!R.hip)return applyFrame0(R,f);
 const s=R.s,g=R.g,hip=R.hip,tor=R.tor,bd=R.board,fr=s.fresh,now=performance.now(),dt=fr?0:clamp((now-s.t)/1000,0,.1);s.t=now;
 const kk=r=>fr?1:1-Math.exp(-r*dt),mo=f[11],air=mo==M_A,gnd=mo==M_G,tt=f[13];
 skShadow(R,f);
 /* board: spins about its own centre */
 s.cr+=((gnd?f[9]:0)-s.cr)*kk(10);const cz=s.cr*.16;
 _e.set(f[4],f[3],f[5]-cz,'YXZ');_qd.setFromEuler(_e);_e.set(f[4],f[3]+f[7],f[5]-cz+f[6],'YXZ');_qb.setFromEuler(_e);
 const lift=.18*f[10]+.12*Math.max(Math.abs(Math.sin(f[6]/2)),.7*Math.abs(Math.sin(f[7])));
 _pa.set(f[0],f[1]+lift,f[2]);_pb.copy(_cc).applyQuaternion(_qd);_pc.copy(_cc).applyQuaternion(_qb);bd.position.copy(_pa).add(_pb).sub(_pc);bd.quaternion.copy(_qb);
 const fl=Math.abs(Math.sin(f[6]/2)),sv=Math.abs(Math.sin(f[7])),R0=R.rl,A0=R.ra;
 if(mo==M_B&&(f[14]||f[15])){/* tumbling */
  const k=1-(f[20]||0);g.position.set(f[14],f[15]-.42,f[16]);_e.set(f[17]*k,f[18],f[19]*k,'XYZ');g.quaternion.setFromEuler(_e);
  hip.position.set(0,.47,0);hip.rotation.set(0,0,0);tor.rotation.set(0,0,0);R.head.rotation.set(0,0,0);
  for(let i=0;i<2;i++){const sn=Math.sin(tt*14+i*2),sg=i?1:-1;R0[i].th.rotation.set(-(.5+.5*sn)*k,0,0);R0[i].sh.rotation.set((.8+.4*sn)*k,0,0);R0[i].ft.rotation.set(0,0,0);
   A0[i].up.rotation.set(Math.sin(tt*14+i*2.6)*2*k,0,sg*(.8+.6*sn)*k);A0[i].lo.rotation.set(-.6*k,0,0)}
  s.bail=1;s.bp.copy(g.position);s.bq.copy(g.quaternion);s.pm=mo;s.fresh=0;return}
 if(s.bail){s.bail=0;s.bt=.35}
 /* crouch spring, landing absorb and pop */
 const ground=mo==M_G||mo==M_R||mo==M_M,pm=fr?mo:s.pm,ft=f[13]-s.pt;
 if(air){if(ft>1e-4&&ft<.2){s.avy+=((f[1]-s.py)/ft-s.avy)*Math.min(1,dt*10)}}else s.avy=0;
 if(ft>1e-4||fr){s.py=f[1];s.pt=f[13]}
 if(pm==M_A&&ground)s.cv+=clamp(-s.avy*.7,1.2,5);else if((pm==M_G||pm==M_M)&&air)s.cv-=1.6;
 /* push phase */
 const pushing=gnd&&!f[10]&&f[21]>.15;
 if(pushing){s.pa=1;s.p+=dt*1.3}else if(s.pa){const b=Math.floor(s.p);s.p+=dt*2.8;if(Math.floor(s.p)>b){s.pa=0;s.p=0}}
 s.pw+=((s.pa?1:0)-s.pw)*kk(8);const ph=s.p-Math.floor(s.p),pw=s.pw,pl=pw*sm(.2,.26,ph)*(1-sm(.68,.74,ph));
 const ct=f[8]+(gnd?.08:0)+.5*pl,n=Math.ceil(dt/.016),h=n?dt/n:0;if(fr)s.c=ct;
 for(let i=0;i<n;i++){s.cv+=(-160*(s.c-ct)-13.9*s.cv)*h;s.c+=s.cv*h}
 const c=clamp(s.c,-.3,1.1),hipY=.5*(.94-.44*c);
 /* rider root */
 const manX=mo==M_M?f[12]*.55+.18:0,kr=kk(air?5:14),rpT=(f[4]-manX)*(air?.35:1),rrT=f[5]*(mo==M_W?.7:1);
 if(fr){s.rp=rpT;s.rr=rrT}else{s.rp+=(rpT-s.rp)*kr;s.rr+=(rrT-s.rr)*kr}
 _e.set(s.rp,f[3],s.rr,'YXZ');g.quaternion.setFromEuler(_e).multiply(_yq);
 _pb.set(0,DECK,0).applyQuaternion(_qd);g.position.set(f[0]+_pb.x,f[1]+_pb.y,f[2]+_pb.z);
 if(s.bt>0){s.bt-=dt;const u=ease(1-clamp(s.bt/.35,0,1));g.position.lerpVectors(s.bp,g.position,u);_qa.copy(s.bq).slerp(g.quaternion,u);g.quaternion.copy(_qa)}
 /* hip and torso */
 const gid=f[22],gb=(gid>=1&&gid<=3?.25:.15)*f[10],kt=kk(10),man=mo==M_M,rail=mo==M_R;
 s.hx+=((pw*.05)-(man?.12+f[12]*.08:0)-s.hx)*kt;s.hz+=(-s.cr*.1-s.hz)*kt;hip.position.set(s.hx,hipY,s.hz);hip.rotation.set(0,0,0);
 s.tp+=(.12+.32*c+.15*pw+gb-s.tp)*kt;s.tw+=(.8*pw-s.tw)*kt;s.tz+=((man?.25-f[12]*.15:rail?-f[12]*.25:0)-s.tz)*kt;
 tor.rotation.set(s.tp-s.cr*.2,s.tw,s.tz);
 s.hd+=((rail?.7:.6)-s.tw-s.hd)*kt;R.head.rotation.set(.08-.8*Math.max(0,s.tp-.3),s.hd,0);
 g.updateMatrix();hip.updateMatrix();_m1.multiplyMatrices(g.matrix,hip.matrix);_m2.copy(_m1).invert();
 /* feet */
 const pf=ph<.22?0:ph<.72?1:2;
 for(let i=0;i<2;i++){const fv=s.f[i],front=i==1;let x=front?-.02:0,y=DECK+ANK,z=front?.2:-.27,yw=front?.35:.1;
  if(front){x=lerp(x,0,pw);z=lerp(z,.16,pw);yw=lerp(yw,1.1,pw)}
  else if(pw>.001){let px,py,pz;
   if(pf==0){const u=ease(ph/.22);px=lerp(0,-.26,u);pz=lerp(-.27,.12,u);py=lerp(DECK+ANK,ANK+.04,u)+.12*arc(u)}
   else if(pf==1){const u=(ph-.22)/.5;px=-.26;pz=lerp(.12,-.5,u);py=ANK+.04}
   else{const u=ease((ph-.72)/.28);px=lerp(-.26,0,u);pz=lerp(-.5,-.27,u);py=lerp(ANK+.04,DECK+ANK,u)+.15*arc(u)}
   x=lerp(x,px,pw);y=lerp(y,py,pw);z=lerp(z,pz,pw);yw=lerp(yw,.1,pw)}
  y+=.26*fl;if(front){z+=.06*fl;x+=(f[6]>0?-.12:.12)*fl}else y+=.2*sv;
  _pd.set(x,y,z);fv.lerp(_pd,kk(20));s.fy[i]+=(yw-s.fy[i])*kk(20);
  _pe.copy(fv).applyQuaternion(_qd).add(_pa).applyMatrix4(_m2);const L=R0[i];
  ik2(L.th.position,_pe,LT,LS,_pk[i],L.th,L.sh);
  _qa.setFromAxisAngle(UPY,s.fy[i]);_qc.copy(_qd).multiply(_yq).multiply(_qa);
  _qb.copy(g.quaternion).multiply(hip.quaternion).multiply(L.th.quaternion).multiply(L.sh.quaternion);L.ft.quaternion.copy(_qb.invert()).multiply(_qc)}
 /* hands */
 tor.updateMatrix();_m1.multiplyMatrices(_m1,tor.matrix);_m2.copy(_m1).invert();
 const flipping=air&&(Math.abs(f[6])>.15||Math.abs(f[7])>.15),gi=gid==2||gid==4?1:0,sw=Math.sin(Math.PI*2*ph)*pw;
 for(let i=0;i<2;i++){const sg=i?1:-1,A=R.ra[i],hv=s.h[i];let x=sg*.16,y=-.38,z=.08+.12*c+Math.sin(tt*2.2+i*3.1)*.03;
  if(pw>.001){z+=(i?-1:1)*.22*sw;y+=.04*pw}
  if(air||mo==M_B){x=sg*.32;y=-.22;z=.05;if(flipping){x=sg*.38;y=-.1;z=0}}
  else if(rail){x=sg*.45;y=-.12+f[12]*sg*.18;z=.04}else if(man){x=sg*.3;y=-.18;z=.2}else if(mo==M_W){x=sg*.35;y=-.15;z=0}
  _pd.set(x,y,z);hv.lerp(_pd,kk(12));_pe.copy(A.p).add(hv);
  if(f[10]>.01&&gid){const gr=f[10];if(i==gi||(gid==1||gid==3||gid==5)&&i==0){/* grabbing hand */
    const q=gid==1?[-.105,DECK+.04,-.05]:gid==2?[0,DECK+.06,.4]:gid==3?[0,DECK+.06,-.4]:gid==4?[.105,DECK+.04,.03]:[.105,DECK+.04,-.12];
    _pa.set(q[0],q[1],q[2]).applyQuaternion(bd.quaternion).add(bd.position);_pa.applyMatrix4(_m2);_pe.lerp(_pa,gr)}
   else{_pd.set(A.p.x+sg*.42,A.p.y-.05,-.05);_pe.lerp(_pd,gr)}}
  ik2(A.p,_pe,LUA,LFA,_pkA[i],A.up,A.lo)}
 s.pm=mo;s.fresh=0}

/* =====================================================================================================================
   start / stop, input, the sim tick, camera, replay
   ===================================================================================================================== */
let RG=null;/* the player's rig {g,arms,legs,board} */
function startSession(modeId,opt){opt=opt||{};if(G||away()||(mode!='play'&&mode!='menu'))return false;const o=st();if(!BUILT)buildPark();
 if(!(o.ownD>>1)){if(!opt.free&&(S.money||0)<10){say2('A board rental is $10.');return false}if(!opt.free){S.money=+((S.money||0)-10).toFixed(2);S.spent=(S.spent||0)+10;o.rent++}o.deck=0}
 try{closeUI()}catch(e){}o.sessions++;
 G={on:1,paused:0,mode:modeId,opt,phase:'ride',t:0,C:newC(),score:0,stats:{landed:0,clean:0,bails:0,combos:0,bestCombo:0,tricks:{},longManual:0},pops:[],popDirty:0,mast:0,left:modeId=='run'?120:0,tipT:0,hidden:[],rec:[],recT:0,bestT:null,fade:1,relSpace:0,buf:null,cam:{x:0,y:3,z:0,ch:PI/2,fov:62,lx:0,ly:1,lz:0,init:0,shake:0},acc:0,card:null,secs:0,end:false,ended:false};
 B=newBoard(-34,-17,PI/2);
 mode='skate';try{$('hud').style.display='none'}catch(e){}document.body.classList.add('fston');
 try{FOL.forEach(f=>{G.hidden.push([f,f.m.visible]);f.m.visible=false})}catch(e){}
 try{if(P.mesh){P.mesh.visible=true;G.sh=P.mesh.children[0]&&P.mesh.children[0].visible;if(P.mesh.children[0])P.mesh.children[0].visible=false}}catch(e){}
 const gg=gear(),bm=boardMesh(gg.d,2),bg=new THREE.Group();bg.add(bm);scene.add(bg);G.boardG=bg;G.boardM=bm;RG={g:P.mesh,arms:P.arms,legs:P.legs,board:bg};
 try{const rc=buildChar(ch);scene.add(rc.g);RG=skRig(rc,bg);RG.own=1;RG.rc=rc;if(P.mesh)P.mesh.visible=false}catch(e){soft(e,'rider')}
 partsOn();audioOn();hudOn();
 const sf=scene.fog;G.fog=sf&&sf.near!=null?[sf.near,sf.far,sf.color.clone()]:null;if(sf&&sf.near!=null){sf.near=140;sf.far=620;const bgc=scene.background;if(bgc&&bgc.isColor)sf.color.copy(bgc)}
 P.x=CX+B.x;P.z=CZ+B.z;SY=SLAB;
 if(modeId=='skate')skStart();if(modeId=='chal')popup(CH[opt.ch].n,'ex',2.6);
 popup(modeId=='run'?'Score Run: 2:00':modeId=='skate'?'S-K-A-T-E vs Dex':modeId=='chal'?'Challenge':'Free skate','ex',2);
 try{document.getElementById('c').focus()}catch(e){}return true}
function endSession(quit){if(!G||G.ended)return;G.ended=true;const o=st();bankCombo();o.secs+=Math.round(G.t);
 if(G.mode=='run'&&!quit){o.runs++;if(G.score>o.best){G.newBest=true;o.best=G.score}const pay=Math.min(150,Math.round(G.score/150));if(pay>0){S.money=+((S.money||0)+pay).toFixed(2);S.earn=(S.earn||0)+pay;o.earn+=pay;G.pay=pay}
  mast(.7+Math.min(2.4,G.score/4000)+.05*Object.keys(G.stats.tricks).length+(G.stats.bails<=2?.2:0),'Score run '+fmtN(G.score))}
 else if(G.stats.landed>=6)mast(.25+.04*G.stats.landed,'Skate session');
 if(G.score>o.best&&G.mode!='run'){}drawBoard();sv()}
function exitSession(){const g=G;if(!g)return;G=null;mode='play';try{$('hud').style.display=''}catch(e){}document.body.classList.remove('fston');
 try{g.hidden.forEach(a=>{a[0].m.visible=a[1]})}catch(e){}
 try{if(P.mesh){if(P.mesh.children[0])P.mesh.children[0].visible=g.sh!==false;P.mesh.rotation.set(0,0,0);P.mesh.quaternion.identity();P.mesh.scale.setScalar(1);[P.arms[0],P.arms[1],P.legs[0],P.legs[1]].forEach(x=>x.rotation.set(0,0,0))}}catch(e){}
 try{if(RG&&RG.own){if(RG.g.parent)RG.g.parent.remove(RG.g);if(RG.sh){if(RG.sh.parent)RG.sh.parent.remove(RG.sh);RG.sh.geometry.dispose();RG.sh.material.dispose()}if(P.mesh)P.mesh.visible=true}}catch(e){soft(e,'rider2')}
 try{scene.remove(g.boardG);g.boardM.geometry.dispose();g.boardM.material.dispose()}catch(e){soft(e,'dispose')}
 partsOff();audioOff();hudOff();
 try{const sf=scene.fog;if(g.fog&&sf){sf.near=g.fog[0];sf.far=g.fog[1];sf.color.copy(g.fog[2])}}catch(e){}
 for(const k in GK)delete GK[k];GKd={};RG=null;B=null;
 const w=lw(-41,-21);P.x=w[0];P.z=w[1];P.rot=0;SY=SLAB;sv()}
/* ---- input: capture phase so the game's own keys do not fire while skating ---- */
const guard=()=>G&&G.on;
addEventListener('keydown',e=>{if(!guard())return;if(e.ctrlKey||e.metaKey||/^f\d+$/i.test(e.key||''))return;const k=keyName(e);e.stopImmediatePropagation();
 if(k=='escape'){e.preventDefault();if(!e.repeat){if(G.phase=='replay')skipReplay();else pauseCard()}return}
 if(G.paused){if(k=='enter'&&!e.repeat)resumeCard();return}
 if(k==' '||k.startsWith('arrow')||k=='tab')e.preventDefault();
 if(G.phase=='replay'){if(!e.repeat&&(k==' '||k=='enter'))skipReplay();return}
 if(G.phase=='results'){if(!e.repeat&&k=='enter')skAgain();return}
 if(!e.repeat){GKd[k]=1;if(k=='j')bufFlip('kick');else if(k=='k')bufFlip('heel');else if(k=='l')bufFlip('shove');if(k=='x'&&G.mode=='free')skLeave()}
 GK[k]=1},true);
addEventListener('keyup',e=>{const k=keyName(e);if(!guard()&&!GK[k])return;if(GK[k]&&k==' '&&G)G.relSpace=1;delete GK[k];if(guard())e.stopImmediatePropagation()},true);
addEventListener('blur',()=>{for(const k in GK)delete GK[k];if(G&&G.on&&!G.paused&&G.phase=='ride')pauseCard()});
addEventListener('contextmenu',e=>{if(guard())e.preventDefault()},true);
function bufFlip(k){if(G)G.buf={k,t:.22}}
function readInput(){const k=GK,d=GKd;const I={left:!!(k.a||k.arrowleft),right:!!(k.d||k.arrowright),keyW:!!(k.w||k.arrowup),keyS:!!(k.s||k.arrowdown)};
 I.steer=(I.left?1:0)-(I.right?1:0);I.push=I.keyW;I.brake=I.keyS;I.popHeld=!!k[' '];I.popRel=!!G.relSpace;G.relSpace=0;I.ollieNow=!!d[' '];I.spinL=!!k.q;I.spinR=!!k.e;I.grab=!!k.f;I.grabDir=I.keyW?'w':I.keyS?'s':I.left?'a':I.right?'d':'';I.man=!!k.shift;I.flipReq=G.buf&&B.st=='a'?G.buf.k:null;
 if(I.flipReq&&B.flip)I.flipReq=null;GKd={};B.steerS=I.steer;return I}
/* ---- the sim ---- */
function phys(dt,I){const b=B;if(b.wob>0)b.wob-=dt;if(b.popAnim>0)b.popAnim-=dt;if(b.wallCool>0)b.wallCool-=dt;if(b.recT>0)b.recT-=dt;
 switch(b.st){
 case 'g':{if(I.popHeld&&!b.rev){b.popping=true;b.pop=Math.min(1,b.pop+dt/.38)}
  if(b.popping&&(I.popRel||!I.popHeld)){const pw=Math.max(.3,b.pop);b.pop=0;b.popping=false;if(b.man)manualEnd(true);doOllie(pw);return}
  const sp=Math.hypot(b.vx,b.vz);
  if(I.man&&!b.popping&&!b.man&&sp>1.6&&b.recT<=0&&G.t-b.lastLand>.06&&b.wob<.25&&!b.rev&&unlocked('manual')){b.man=true;b.mb=rr(-.12,.12);b.mv=0;b.manT=0;b.mPts=0}
  else if(I.man&&!unlocked('manual')&&!b.man){tip('Rex teaches manuals. Talk to him.')}
  if(b.man&&(!I.man||sp<.9))manualEnd(!(sp<.5&&b.manT<.5)||b.manT>=.5);
  if(b.man)stepManual(dt,I);if(b.st=='g')stepGround(dt,I);break}
 case 'a':stepAir(dt,I);break;case 'r':stepRail(dt,I);break;case 'w':stepWall(dt,I);break;case 'b':stepBail(dt,I);break}}
function simTick(dt){if(!G||!G.on)return;dt=Math.min(dt||.016,.05);
 audioTick(dt);partsTick(dt);
 if(G.paused)return;
 if(G.fade>0)G.fade=Math.max(0,G.fade-dt*2.2);
 G.pops.forEach(p=>p.l-=dt);if(G.pops.some(p=>p.l<=0)){G.pops=G.pops.filter(p=>p.l>0);G.popDirty=1}if(G.tipT>0)G.tipT-=dt;if(G.buf){G.buf.t-=dt;if(B.flip||G.buf.t<=0)G.buf=null}
 if(G.phase=='replay'){replayTick(dt);return}
 if(G.phase=='results'){return}
 const I=readInput();G.t+=dt;G.secs+=dt;G.acc+=dt;let first=true;
 while(G.acc>=SUB){phys(SUB,I);if(!G||!B)return;G.acc-=SUB;if(first){I.popRel=false;I.ollieNow=false;first=false}}
 const b=B,C=G.C;
 if(b.st=='g'&&!b.man&&C.on){C.idle+=dt;if(C.idle>1.4)bankCombo()}
 if(G.recT<=G.t){G.recT=G.t+1/30;G.rec.push([G.t,frameOf()]);while(G.rec.length&&G.rec[0][0]<G.t-9)G.rec.shift()}
 P.x=CX+b.x;P.z=CZ+b.z;
 if(G.mode=='run'&&!G.end){G.left-=dt;if(G.left<=0){G.left=0;G.end=true;G.endT=0}}
 if(G.end){G.endT+=dt;if(!G.ended&&(b.st=='g'&&G.endT>.5||G.endT>3.5))runOver()}
 if(G.mode=='skate')skTick(dt);if(G.mode=='chal'&&G.chDone){G.chDone-=dt;if(G.chDone<=0)chalFinish()}
 camUpdate(dt)}
/* ---- camera: smooth follow behind and above, wider with speed ---- */
function camUpdate(dt){const c=G.cam,b=B,sp=Math.hypot(b.vx,b.vz);let tx=b.x,ty=b.y,tz=b.z,th=b.yaw;
 if(b.st=='b'&&b.bail){const r=b.bail.rv;tx=r.x;ty=r.y-.4;tz=r.z;th=c.ch}else if(sp>1.4&&b.st!='r'&&b.st!='w')th=Math.atan2(b.vx,b.vz);else if(b.st=='r')th=b.yaw;else if(b.st=='w'&&b.wall)th=b.wall.ax=='z'?(b.wall.n>0?PI:0):(b.wall.n>0?-PI/2:PI/2);
 if(!c.init){c.ch=th;c.init=1;c.x=tx-Math.sin(th)*6;c.z=tz-Math.cos(th)*6;c.y=ty+2.4;c.lx=tx;c.ly=ty+1;c.lz=tz}
 const sl=b.st=='a'?1.4:b.st=='b'?.8:3;c.ch+=angd(th-c.ch)*Math.min(1,dt*sl);
 const dist=5.4+sp*.15+(b.st=='b'?2.5:0),hgt=2.0+sp*.05+(b.st=='b'?1.4:0),k=1-Math.exp(-dt*(b.st=='a'?4:7));
 const px=tx-Math.sin(c.ch)*dist,pz=tz-Math.cos(c.ch)*dist;let py=ty+hgt;
 c.x+=(px-c.x)*k;c.z+=(pz-c.z)*k;const ground=hH(clamp(c.x,-HXM,HXM),clamp(c.z,-HZM,HZM));c.y+=(Math.max(py,ground+1.1)-c.y)*k;if(c.y<ground+.9)c.y=ground+.9;
 const hold=1-Math.exp(-dt*9);c.lx+=(tx+b.vx*.12-c.lx)*hold;c.ly+=(ty+.85+(b.st=='a'?.0:.0)-c.ly)*hold;c.lz+=(tz+b.vz*.12-c.lz)*hold;
 const fv=60+Math.min(20,sp*1.7);c.fov+=(fv-c.fov)*Math.min(1,dt*3);if(c.shake>0)c.shake=Math.max(0,c.shake-dt*3)}
const _cp=new THREE.Vector3();
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(c===cam&&G&&G.on){cam3.aspect=innerWidth/innerHeight;if(Math.abs(cam3.fov-G.cam.fov)>.01)cam3.fov=G.cam.fov;cam3.updateProjectionMatrix();try{poseFrame()}catch(e){soft(e,'pose')}const sc0=sun.castShadow;sun.castShadow=false;try{return r0(sc,cam3)}finally{sun.castShadow=sc0}}return r0(sc,c)}}
function poseFrame(){if(!G||!B||!RG)return;let f;const c=G.cam;if(RG.own&&P.mesh)P.mesh.visible=false;
 if(G.phase=='replay'&&G.rp){f=G.rp.cur;if(!f)return;applyFrame(RG,f);const r=G.rp,a=r.ang,fx=f[0],fz=f[2],y=f[1];const px=fx+Math.cos(a)*6.2,pz=fz+Math.sin(a)*6.2;cam3.position.set(px,Math.max(y+1.4,SLAB+1.3),pz);cam3.lookAt(fx,y+.9,fz);cam3.fov=48;return}
 f=frameOf();applyFrame(RG,f);G.curF=f;
 const sh=c.shake*.06;cam3.position.set(CX+c.x+(sh?rr(-sh,sh):0),SLAB+c.y+(sh?rr(-sh,sh):0),CZ+c.z);cam3.lookAt(CX+c.lx,SLAB+c.ly,CZ+c.lz);if(G.camOv){const o=G.camOv;cam3.position.set(CX+o[0],SLAB+o[1],CZ+o[2]);cam3.lookAt(CX+o[3],SLAB+o[4],CZ+o[5])}}
/* ---- replay: the best trick again, slow motion, from the side ---- */
function startReplay(w,atEnd){if(!G||G.phase!='ride'&&!(atEnd&&G.phase=='over'))return false;const fr=G.rec.filter(r=>r[0]>=w.t1-3&&r[0]<=w.t1+.4).map(r=>r[1]);if(fr.length<12){return false}
 G.lastReplay=w;G.rp={fr,i:0,name:w.name,v:w.v,atEnd,ang:rr(0,TAU),cur:fr[0],dir:Math.random()<.5?1:-1};const yaw=fr[Math.floor(fr.length/2)][3];G.rp.ang=yaw+PI/2*G.rp.dir;G.phase='replay';hudReplay(true,w);return true}
function replayTick(dt){const r=G.rp;if(!r)return skipReplay();r.i+=dt*30*.42;r.ang+=dt*.16*r.dir;const i=Math.min(r.fr.length-1,Math.floor(r.i));r.cur=r.fr[i];if(r.i>=r.fr.length+8)skipReplay()}
function skipReplay(){if(!G)return;const r=G.rp;G.rp=null;hudReplay(false);if(r&&r.atEnd){showResults()}else{G.phase='ride';G.cam.init=0}}

/* =====================================================================================================================
   HUD, cards, session menu, shop, coach, challenges, S-K-A-T-E
   ===================================================================================================================== */
const $s=id=>document.getElementById(id);
const CSS=`#skhud{position:fixed;inset:0;z-index:7;pointer-events:none;display:none;font-family:Silkscreen,'Courier New',monospace;color:#fff;--c:#ffd27a;--t:#7ff3ff;--bg:rgba(14,16,34,.78);--ln:rgba(255,255,255,.22)}
#skhud *{box-sizing:border-box}#skhud .fp{position:absolute;background:var(--bg);border:2px solid var(--ln);box-shadow:0 4px 0 rgba(0,0,0,.35);padding:8px 12px}
#skhud small{display:block;font-size:10px;letter-spacing:.08em;opacity:.7}#skhud b{font-weight:normal}
#sk_tl{left:14px;top:14px;min-width:190px;font-size:11px;line-height:1.6}#sk_tl b.big{font-size:26px;color:var(--c);display:block;line-height:1.1}
#sk_tr{right:14px;top:14px;text-align:right;min-width:170px;font-size:11px;line-height:1.6}#sk_tr b.big{font-size:22px;color:var(--t);display:block}
#sk_pops{position:absolute;left:50%;top:15%;transform:translateX(-50%);text-align:center;width:min(640px,92vw)}
#sk_pops div{font-size:22px;margin:3px 0;text-shadow:0 3px 0 rgba(0,0,0,.6);animation:skpop .3s ease-out;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sk_pops .good{color:#9dffb6}#sk_pops .perf{color:#ffe45a;font-size:25px}#sk_pops .meh{color:#ffd27a}#sk_pops .bail{color:#ff8a7a;font-size:30px}#sk_pops .bail2{color:#ffb0a0;font-size:16px}#sk_pops .ex{color:#7ff3ff;font-size:17px}#sk_pops .tip{color:#fff;font-size:15px;background:var(--bg);display:inline-block;padding:4px 10px}#sk_pops .bank{color:#ffd23d;font-size:25px}#sk_pops .qclean,#sk_pops .qperf{color:#bfe;font-size:13px}#sk_pops .qsketchy{color:#ffd27a;font-size:13px}
@keyframes skpop{0%{transform:scale(1.5);opacity:0}100%{transform:scale(1);opacity:1}}
#sk_combo{position:absolute;right:14px;top:132px;text-align:right;display:none;text-shadow:0 3px 0 rgba(0,0,0,.6)}#sk_combo .n{font-size:34px;color:var(--c)}#sk_combo .m{font-size:20px;color:var(--t)}#sk_combo .s{font-size:11px;opacity:.8}
#sk_bal{position:absolute;left:50%;bottom:92px;transform:translateX(-50%);width:min(360px,80vw);display:none;text-align:center}#sk_bal .bar{position:relative;height:16px;background:rgba(14,16,34,.85);border:2px solid var(--ln)}
#sk_bal .ok{position:absolute;left:35%;width:30%;top:0;height:100%;background:rgba(120,255,160,.28)}#sk_bal i{position:absolute;top:-4px;width:8px;height:22px;background:#fff;margin-left:-4px;border:2px solid #14142a}#sk_bt{display:block;margin-top:5px;font-size:12px;text-shadow:0 2px 0 rgba(0,0,0,.6)}
#sk_pwr{position:absolute;left:50%;bottom:130px;transform:translateX(-50%);width:140px;height:10px;background:rgba(14,16,34,.8);border:2px solid var(--ln);display:none}#sk_pwr i{display:block;height:100%;background:linear-gradient(90deg,#7ff3ff,#ffd27a)}
#sk_keys{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);font-size:10px;white-space:nowrap;background:var(--bg);padding:6px 10px;border:2px solid var(--ln);max-width:98vw;overflow:hidden}
#sk_keys kbd{display:inline-block;min-width:18px;padding:1px 5px;margin:0 2px;background:#f6efe0;color:#2a1c0a;border-bottom:3px solid #a89268;font:inherit;font-size:10px;text-align:center}
#sk_modal{left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,92vw);display:none;pointer-events:auto;text-align:left;max-height:90vh;overflow:auto}
#sk_modal h2{font-weight:normal;font-size:26px;margin:0 0 8px;color:var(--c)}#sk_modal p{font-size:12px;line-height:1.7;margin:4px 0}#sk_modal .gr{display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;font-size:12px;margin:10px 0}#sk_modal .gr b{float:right;color:var(--c)}
#sk_modal .row{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}#sk_modal button{flex:1;font:inherit;font-size:13px;padding:9px 6px;background:#262a52;color:#fff;border:2px solid var(--c);cursor:pointer}#sk_modal button.go{background:var(--c);color:#2a1c0a}
#sk_bars{position:absolute;inset:0;display:none}#sk_bars u{position:absolute;left:0;right:0;height:11%;background:#000;text-decoration:none}#sk_bars u:first-child{top:0}#sk_bars u:last-child{bottom:0}
#sk_rep{position:absolute;left:50%;bottom:14%;transform:translateX(-50%);display:none;font-size:20px;text-align:center;text-shadow:0 3px 0 rgba(0,0,0,.7)}#sk_rep small{font-size:11px;opacity:.8}
#sk_fade{position:absolute;inset:0;background:#0e1022;opacity:0}
@media (max-width:640px){#sk_tl,#sk_tr{min-width:0;font-size:10px}#sk_pops div{font-size:16px}#sk_combo{top:110px}}`;
function hudOn(){if(!skCSS){skCSS=document.createElement('style');skCSS.id='skcss';skCSS.textContent=CSS;document.head.appendChild(skCSS)}
 hud=document.createElement('div');hud.id='skhud';hud.innerHTML=`<div id=sk_tl class=fp></div><div id=sk_tr class=fp></div><div id=sk_pops></div><div id=sk_combo></div><div id=sk_bal><div class=bar><div class=ok></div><i id=sk_bi></i></div><span id=sk_bt></span></div><div id=sk_pwr><i id=sk_pf></i></div><div id=sk_keys></div><div id=sk_modal class=fp></div><div id=sk_bars><u></u><u></u></div><div id=sk_rep></div><div id=sk_fade></div>`;
 document.body.appendChild(hud);hud.style.display='block';HC={}}
function hudOff(){if(hud){hud.remove();hud=null}HC={}}
let HC={};const setH=(id,t)=>{if(HC[id]!==t){HC[id]=t;const e=$s(id);if(e)e.innerHTML=t}};
function hudReplay(on,w){const b=$s('sk_bars'),r=$s('sk_rep');if(!b)return;b.style.display=on?'block':'none';r.style.display=on?'block':'none';if(on&&w)r.innerHTML='REPLAY<br>'+E(w.name)+'  '+fmtN(w.v)+'<br><small>Space to skip</small>'}
const kk=t=>`<kbd>${t}</kbd>`;
function hudTick(){const g=G;if(!hud||!g||!B)return;const o=st(),b=B,C=g.C,sp=Math.hypot(b.vx,b.vz);let live=0;for(const k in C.live)live+=C.live[k];
 const tm=g.mode=='run'?Math.ceil(g.left):0,clock=g.mode=='run'?Math.floor(tm/60)+':'+String(tm%60).padStart(2,'0'):'';
 const ml={free:'FREE SKATE',run:'SCORE RUN',skate:'S-K-A-T-E vs DEX',chal:'CHALLENGE'}[g.mode];
 setH('sk_tl',`<small>${ml}</small>${g.mode=='run'?`<b class=big>${clock}</b>`:g.mode=='chal'?`<b class=big style="font-size:15px">${E(CH[g.opt.ch].n)}</b>`:g.mode=='skate'?skHud():`<b class=big>${Math.round(sp*3.6)}</b>`}${g.mode=='run'?'':''}<span style="color:var(--t)">${Math.round(sp*3.6)} km/h</span> · ${E(gear().d.n)}`);
 setH('sk_tr',`<small>SCORE</small><b class=big>${fmtN(g.score)}</b>BEST ${fmtN(o.best)}<br>Combos ${g.stats.combos} · Bails ${g.stats.bails}`);
 const show=C.on||live>0||C.pts>0,e=$s('sk_combo');if(e){e.style.display=show?'block':'none';if(show)setH('sk_combo',`<div class=n>${fmtN(C.pts+live)}</div><div class=m>x ${(Math.round(C.mult*10)/10).toFixed(1)}</div><div class=s>${C.n} tricks · ${Math.max(0,1.4-C.idle).toFixed(1)}s</div>`)}
 if(g.popDirty){g.popDirty=0;setH('sk_pops',g.pops.map(p=>`<div class="${p.c}">${E(p.t)}</div>`).join(''))}
 const bl=$s('sk_bal');if(bl){const sh=b.st=='r'||b.st=='w'&&0||b.man;bl.style.display=sh?'block':'none';if(sh){const v=b.st=='r'?b.rb:b.mb,i=$s('sk_bi');if(i)i.style.left=(50+clamp(v,-1,1)*50)+'%';setH('sk_bt',b.st=='r'?(TR[b.rType].n+' '+b.rDist.toFixed(1)+' m · A / D to balance'):'Manual '+b.manT.toFixed(1)+' s · W / S to balance')}}
 const pw=$s('sk_pwr');if(pw){const s=b.st=='g'&&b.pop>0;pw.style.display=s?'block':'none';if(s)$s('sk_pf').style.width=(b.pop*100).toFixed(0)+'%'}
 const lk=o.les;setH('sk_keys',g.phase=='ride'?`${kk('W')} push ${kk('A')}${kk('D')} steer ${kk('S')} brake ${kk('SPACE')} hold+release ollie ${kk('J')}${kk('K')}${kk('L')} flips ${kk('Q')}${kk('E')} spin ${kk('F')}+dir grab ${kk('SHIFT')} manual ${kk('Esc')} pause`:'');
 const fd=$s('sk_fade');if(fd)fd.style.opacity=g.fadeOut?Math.min(1,g.fadeOut):g.fade}
/* ---- cards ---- */
function modal(h){const m=$s('sk_modal');if(!m)return;if(h){m.innerHTML=h;m.style.display='block'}else m.style.display='none'}
function pauseCard(){const g=G;if(!g||!g.on||g.phase=='results')return;g.paused=!g.paused;
 if(g.paused){for(const k in GK)delete GK[k];modal(`<h2>Paused</h2><p>${E(({free:'Free skate',run:'Score Run',skate:'S-K-A-T-E vs Dex',chal:'Challenge'})[g.mode])} · Score ${fmtN(g.score)} · ${g.stats.landed} landed, ${g.stats.bails} bails</p><p style="opacity:.8">W push, A/D steer, S brake. Hold SPACE and let go to ollie. In the air: J kickflip, K heelflip, L shove-it, Q / E spin, F plus a direction for grabs. Land on a rail to grind (A / D balance). Hold SHIFT for a manual (W / S balance). Jump at the wall to wallride.</p><div class=row><button onclick="skLeave()">LEAVE THE PARK</button><button class=go onclick="skResume()">RESUME</button></div>`)}else modal(null)}
function resumeCard(){if(G&&G.paused)pauseCard()}
window.skResume=resumeCard;
window.skLeave=function(){if(!G)return;const g=G;g.paused=false;modal(null);if(g.phase!='results')endSession(true);g.fadeOut=.01;const t0=performance.now();const iv=setInterval(()=>{if(G!==g){clearInterval(iv);return}g.fadeOut=Math.min(1,(performance.now()-t0)/400);if(g.fadeOut>=1){clearInterval(iv);try{exitSession()}catch(e){soft(e,'quit')}}},30)};
window.skAgainBtn=()=>skAgain();
function skAgain(){if(!G||G.phase!='results')return;const m=G.mode,op=Object.assign({},G.opt,{free:true});G.phase='x';modal(null);exitSession();setTimeout(()=>{try{startSession(m,op)}catch(e){soft(e,'again')}},60)}
window.skMenuBtn=()=>{const g=G;if(!g)return;window.skLeave();setTimeout(()=>{try{openMenu()}catch(e){}},700)};
function runOver(){if(!G||G.ended)return;G.phase='over';endSession(false);if(G.bestT&&G.bestT.v>=120&&startReplay(G.bestT,true))return;showResults()}
function showResults(){const g=G;if(!g)return;g.phase='results';g.pops=[];g.popDirty=0;try{setH('sk_pops','')}catch(e){}const o=st(),m=g.mode;let head='Run over',body='';const top=Object.keys(g.stats.tricks).slice(-0);
 if(m=='run'){head=g.newBest?'NEW BEST!':'Time!';body=`<div class=gr><span>Score<b>${fmtN(g.score)}</b></span><span>Best<b>${fmtN(o.best)}</b></span><span>Tricks landed<b>${g.stats.landed}</b></span><span>Bails<b>${g.stats.bails}</b></span><span>Best combo<b>${fmtN(g.stats.bestCombo)}</b></span><span>Different tricks<b>${Object.keys(g.stats.tricks).length}</b></span><span>Prize money<b>${money(g.pay||0)}</b></span><span>Mastery<b>+${g.mast.toFixed(1)}</b></span></div>${g.bestT?`<p>Best trick: <b style="color:var(--c)">${E(g.bestT.name)}</b> (${fmtN(g.bestT.v)})</p>`:''}`}
 else if(m=='skate'){head=g.sk.win?'YOU WIN!':'Dex wins';body=`<p>S-K-A-T-E: you ${g.sk.you} letters, Dex ${g.sk.npc}.</p><p>${g.sk.win?'Nice. Dex wants a rematch.':'Practice a few more tricks and come back.'}</p><div class=gr><span>Mastery<b>+${g.mast.toFixed(1)}</b></span><span>Wins<b>${o.wins}</b></span></div>`}
 else if(m=='chal'){const c=CH[g.opt.ch];head=g.chOk?'Challenge complete!':'Challenge';body=`<p><b style="color:var(--c)">${E(c.n)}</b></p><p>${g.chOk?'Cleared. Reward: '+money(c.cash)+'.':E(c.tx)}</p>`}
 modal(`<h2>${head}</h2>${body}<div class=row><button onclick="skMenuBtn()">MENU</button><button onclick="skLeave()">LEAVE</button><button class=go onclick="skAgainBtn()">${m=='chal'&&!g.chOk?'TRY AGAIN':'AGAIN'}</button></div>`)}
/* ---- S-K-A-T-E against Dex ---- */
const LET='SKATE';
const POOLT=()=>{const a=['g50'];for(const k of['shove','kick','heel','s180','s360','s540','indy','nose','tail','melon','stale','g5','gbs'])if(unlocked(k))a.push(k);return a};
function skStart(){G.sk={you:0,npc:0,setter:'you',target:null,phase:'set',wait:0,tries:0,timer:45,win:false,msg:'Land a trick for Dex to match'};popup('You set first: land a clean trick','tip',3)}
function skHud(){const s=G.sk;const L=n=>LET.split('').map((c,i)=>`<span style="color:${i<n?'#ff8a7a':'#6a6f9a'}">${c}</span>`).join('');return`<b class=big style="font-size:15px">YOU ${L(s.you)}<br>DEX ${L(s.npc)}</b><span style="color:var(--c)">${s.target?E(TR[s.target].n):'-'}</span> · ${E(s.msg)}<br>`}
function skSetMsg(m){G.sk.msg=m}
function skTick(dt){const s=G.sk;if(!s||s.phase=='over')return;if(s.wait>0){s.wait-=dt;if(s.wait<=0)skNext();return}
 if(s.phase=='set'||s.phase=='match'){s.timer-=dt;if(s.timer<=0){if(s.phase=='set'){popup('Out of time: Dex sets','tip',2);skDexSets()}else{skMiss()}}}}
function skNext(){const s=G.sk;if(s.phase=='npcTry')skDexTry();else if(s.phase=='dexSets')skDexSets();else if(s.phase=='toMatch'){s.phase='match';s.tries=2;s.timer=45;skSetMsg('Match it: 2 tries')}else if(s.phase=='toSet'){s.phase='set';s.timer=45;s.target=null;skSetMsg('Your turn to set')}else if(s.phase=='fin')skFinish()}
function skDexSets(){const s=G.sk,pool=POOLT();s.setter='npc';s.target=pk(pool);s.phase='toMatch';s.wait=2.4;skSetMsg('Dex sets '+TR[s.target].n);popup('Dex sets: '+TR[s.target].n,'ex',2.4);dexDemo(s.target,true)}
function skDexTry(){const s=G.sk,t=s.target,p=clamp(.86-TR[t].d*.13,.38,.9),ok=Math.random()<p;dexDemo(t,ok);
 if(ok){popup('Dex matches it!','ex',2);s.setter='npc';s.phase='dexSets';s.wait=2.6;skSetMsg('Dex matched. His turn to set')}else{s.npc++;popup('Dex bails! '+LET[s.npc-1],'good',2.4);skSetMsg('Dex gets a letter');s.phase=s.npc>=5?'fin':'toSet';s.wait=2.6;if(s.phase=='toSet')s.target=null;s.setter='you'}}
function skMiss(){const s=G.sk;s.you++;popup('Letter: '+LET[s.you-1],'bail',2);s.phase=s.you>=5?'fin':'dexSets';s.wait=2.2;skSetMsg('You got a letter');sn('pop')}
function skFinish(){const s=G.sk;s.phase='over';s.win=s.npc>=5;const o=st();if(s.win){o.wins++;S.money=+((S.money||0)+60).toFixed(2);S.earn=(S.earn||0)+60}else o.losses++;mast(s.win?1.6:.5,'S-K-A-T-E vs Dex');drawBoard();sv();G.ended=true;spl('sk_chime');showResults()}
function skTarget(ids){const pri=['gbs','gnose','g5','g50','s900','s720','s540','s360','heel','kick','shove','melon','stale','nose','tail','indy','s180'];for(const p of pri)if(ids.includes(p))return p;return null}
/* ---- what happens when you land things, per mode ---- */
function modeLanded(air){const g=G;if(g.mode=='chal'){const id=CH[g.opt.ch].id;if(id=='gap'&&air.gap&&air.q=='clean')chalDone();else if(id=='bowl'&&air.A.inBowl0&&inBowl(air.px,air.pz)&&air.spinN>=3&&air.q=='clean')chalDone();else if(id=='stairs'&&air.stairs&&air.flips.includes('kick')&&air.q=='clean')chalDone()}
 else if(g.mode=='skate'){const s=g.sk,ids=air.ids||[];if(air.q!='clean')return skLandFail();
  if(s.phase=='set'){const t=skTarget(ids);if(t&&s.wait<=0){s.target=t;s.phase='npcTry';s.wait=1.8;skSetMsg('You set '+TR[t].n);popup('You set: '+TR[t].n,'ex',2)}}
  else if(s.phase=='match'&&s.target&&ids.includes(s.target)&&s.wait<=0)skMatched()}}
function skLandFail(){}
function skMatched(){const s=G.sk;popup('Matched!','good',2);sn('pop');s.setter='you';s.phase='toSet';s.wait=2;s.target=null;skSetMsg('Matched! You set next')}
function modeGrind(d){const g=G;if(g.mode=='chal'&&CH[g.opt.ch].id=='rail'&&d.rail=='long'&&d.dist>=8)chalDone();
 if(g.mode=='skate'){const s=g.sk;if(s.wait>0)return;if(s.phase=='set'&&TR[d.type]&&TR[d.type].k=='r'){s.target=d.type;s.phase='npcTry';s.wait=1.8;skSetMsg('You set '+TR[d.type].n);popup('You set: '+TR[d.type].n,'ex',2)}else if(s.phase=='match'&&s.target==d.type)skMatched()}}
function modeBank(total,n){const g=G;if(g.mode=='chal'&&CH[g.opt.ch].id=='combo'&&n>=5)chalDone()}
function modeBail(why){const g=G;if(g.mode=='skate'){const s=g.sk;if(s.wait>0)return;if(s.phase=='set'){popup('Bailed: Dex sets','tip',2);s.setter='npc';s.wait=2.2;s.phase='dexSets';skSetMsg('You bailed. Dex sets next')}else if(s.phase=='match'){s.tries--;if(s.tries<=0)skMiss();else{popup('One more try','tip',1.8);skSetMsg('Match it: 1 try left')}}}}
function chalDone(){const g=G;if(!g||g.chOk)return;g.chOk=true;g.chDone=1.4;const c=CH[g.opt.ch],o=st();if(!o.challenges[c.id]){o.challenges[c.id]=1;S.money=+((S.money||0)+c.cash).toFixed(2);S.earn=(S.earn||0)+c.cash;mast(c.mp,'Challenge: '+c.n)}else mast(.2,'Challenge again');
 popup('CHALLENGE COMPLETE','bank',2.4);spl('sk_chime');drawBoard();sv()}
function chalFinish(){if(!G||G.phase!='ride')return;G.ended=false;endSession(false);showResults()}

/* ---------- the session menu, the shop and the coach (the game's own modal look) ---------- */
let MT='play';
const stat=(l,v,mx)=>`<span style="display:inline-block;width:92px;font-size:10px;opacity:.75">${l}</span><span style="display:inline-block;width:120px;height:7px;background:#2a2f55;vertical-align:middle"><i style="display:block;height:100%;width:${clamp(v/mx,0,1)*100}%;background:#ffd27a"></i></span> `;
function menuHTML(){const o=st(),tab=(id,n)=>`<button class="pesong" style="flex:1;text-align:center${MT==id?';background:#ffd27a;color:#2a1c0a':''}" onclick="skTab('${id}')">${n}</button>`;let body='';
 if(MT=='play'){const own=o.ownD>>1;body=`<p class=pebl>${own?'You own a '+E(DECKS[o.deck].n)+': skating is free.':'A rental board is $10 a session (a Rental Plank). Buy a deck at the shop to skate free.'} Your best score is ${fmtN(o.best)}.</p><div class=pelist>
  <button class=pesong onclick="skGo('free')"><b>Free skate <span style="float:right">no timer</span></b><small>Roll, practise, take your time. Press X to hop off.</small></button>
  <button class=pesong onclick="skGo('run')"><b>Score Run <span style="float:right">best ${fmtN(o.best)}</span></b><small>Two minutes. Chain tricks, grinds and manuals into big combos. Prize money for a good score.</small></button>
  <button class=pesong onclick="skGo('skate')"><b>S-K-A-T-E vs Dex <span style="float:right">${o.wins} wins</span></b><small>Set a trick, he matches it, or he sets one and you match it. Five letters and you are out.</small></button></div>`}
 else if(MT=='chal'){body=`<p class=pebl>Beat them in order. Each pays cash and counts towards your Skating mastery.</p><div class=pelist>${CH.map((c,i)=>{const open=chOpen(i),done=o.challenges[c.id];return`<button class=pesong ${open?`onclick="skGo('chal',${i})"`:'disabled style="opacity:.5"'}><b>${i+1}. ${E(c.n)} <span style="float:right;color:${done?'#9dffb6':open?'#ffd27a':'#8a8fb5'}">${done?'DONE':open?money(c.cash):'LOCKED'}</span></b><small>${open?E(c.tx):'Finish "'+E(CH[i-1].n)+'" first.'}</small></button>`}).join('')}</div>`}
 else if(MT=='coach'){const n=o.les,done=n>=LES.length,L=LES[Math.min(n,LES.length-1)],p=done?null:lesProg(n);
  body=`<p class=pebl>"${done?'You have the full bag. Now go and do it in the bowl.':E(L.tx)}"</p>${done?'':`<div class=pelist><div class=pesong><b>Lesson ${n+1}: ${E(L.n)} <span style="float:right">${p.got}/${p.tot}</span></b><small>${Object.keys(L.need).map(k=>E(TR[k].n)+' '+Math.min(L.need[k],o.tricks[k]|0)+'/'+L.need[k]).join(' · ')}<br>Unlocks: ${E(L.give)}</small></div>${p.ok?`<button class=pesong onclick="skLearn()"><b>Learn it! <span style="float:right">+${money(L.cash)}</span></b></button>`:''}</div>`}<p class=pebl style="opacity:.8">Tricks you know: ${TRK.filter(k=>unlocked(k)).map(k=>E(TR[k].n)).join(', ')}.</p>`}
 else{const gs=gear();body=`<p class=pebl>Decks change pop, speed, spin and how forgiving landings are. Trucks change turning and rail balance. You have ${money(S.money||0)}.</p><div class=pelist>${DECKS.map((d,i)=>{if(!i)return'';const own=o.ownD>>i&1,eq=o.deck==i;return`<button class=pesong onclick="${own?`skEq(${i})`:`skBuy(${i})`}" style="${eq?'outline:3px solid #ffd27a':''}"><b style="color:${d.col}">${E(d.n)} <span style="float:right;color:#fff">${eq?'EQUIPPED':own?'OWNED: equip':money(d.price)}</span></b><small>${stat('POP',d.pop,1.4)}${stat('SPEED',d.spd,1.2)}${stat('SPIN',d.spin,1.3)}${stat('STEADY',d.stab,1.2)}<br>${E(d.tx)}</small></button>`}).join('')}
  ${TRUCKS.map((t,i)=>{const own=o.ownT>>i&1,eq=o.trk==i;return`<button class=pesong onclick="${own?`skEqT(${i})`:`skBuyT(${i})`}" style="${eq?'outline:3px solid #ffd27a':''}"><b>${E(t.n)} <span style="float:right">${eq?'EQUIPPED':own?'OWNED: equip':money(t.price)}</span></b><small>${stat('TURN',t.turn,1.3)}${stat('BALANCE',t.bal,1.3)}<br>${E(t.tx)}</small></button>`}).join('')}</div>`}
 return`<div class="box modal pe" style="width:min(620px,95vw)"><div class=pehd><span class=pek>Skate Park</span><h2>${MT=='shop'?'Board Shop':MT=='coach'?'Rex the coach':'Wavefern Skate Park'}</h2></div><div class=pebd><div style="display:flex;gap:6px;margin-bottom:8px">${tab('play','Skate')}${tab('chal','Challenges')}${tab('coach','Coach')}${tab('shop','Shop')}</div>${body}<div class=row2 style="display:flex;gap:8px"><button onclick="closeUI()">Leave</button></div></div></div>`}
function openMenu(tab){if((mode!='play'&&mode!='menu')||away()||G)return;if(tab)MT=tab;mode='menu';try{$('ui').innerHTML=menuHTML()}catch(e){soft(e,'menu')}}
const reMenu=()=>{if(mode=='menu'&&$('ui')&&/Skate Park/.test($('ui').innerHTML))try{$('ui').innerHTML=menuHTML()}catch(e){}};
window.skTab=t=>{MT=t;reMenu()};
window.skGo=(m,ch)=>{if(m=='chal'&&!chOpen(ch))return;startSession(m,m=='chal'?{ch}:{})};
window.skBuy=i=>{const o=st(),d=DECKS[i];if(o.ownD>>i&1)return;if((S.money||0)<d.price){spl('err');return say2('The '+d.n+' costs '+money(d.price)+'.')}S.money=+((S.money||0)-d.price).toFixed(2);S.spent=(S.spent||0)+d.price;o.ownD|=1<<i;o.deck=i;sn('cash');sv();reMenu();say2(d.n+' is yours. You skate free now.')};
window.skEq=i=>{const o=st();if(!(o.ownD>>i&1))return;o.deck=i;sn('pop');sv();reMenu()};
window.skBuyT=i=>{const o=st(),t=TRUCKS[i];if(o.ownT>>i&1)return;if((S.money||0)<t.price){spl('err');return say2(t.n+' cost '+money(t.price)+'.')}S.money=+((S.money||0)-t.price).toFixed(2);S.spent=(S.spent||0)+t.price;o.ownT|=1<<i;o.trk=i;sn('cash');sv();reMenu()};
window.skEqT=i=>{const o=st();if(!(o.ownT>>i&1))return;o.trk=i;sn('pop');sv();reMenu()};
window.skLearn=()=>{const o=st();if(o.les>=LES.length||!lesProg(o.les).ok)return;const L=LES[o.les];o.les++;S.money=+((S.money||0)+L.cash).toFixed(2);S.earn=(S.earn||0)+L.cash;sn('cash');mast(.4,'Lesson: '+L.n);sv();reMenu();say2('Rex taught you: '+L.give+'.')};

/* ---------- people: Tina in the shop, Rex the coach, spectators and four NPC skaters (all buildChar) ---------- */
const NPC=[];let ppBuilt=false;
function person(x,z,ry,o){const i=NPC.length,r=n=>{let h=Math.sin((i+1)*61.7+n*13.3)*43758.5;return h-Math.floor(h)};
 const c={skin:Math.floor(r(1)*(typeof SKIN!='undefined'?SKIN.length:6)),eyes:o.eyes!=null?o.eyes:Math.floor(r(2)*4),mouth:Math.floor(r(3)*4),hair:o.hair!=null?o.hair:Math.floor(r(4)*12),hc:Math.floor(r(5)*(typeof HAIRC!='undefined'?HAIRC.length:12)),top:o.topT!=null?o.topT:0,tc:0,pc:0,tc_custom:o.top||'#ffd23d',pc_custom:o.pants||'#2b3a55',body:o.body!=null?o.body:r(6),bt:o.bt!=null?o.bt:2,hgt:o.hgt!=null?o.hgt:.5};
 if(o.hcc)c.hc_custom=o.hcc;const f=buildChar(c);f.g.position.set(x,o.y||0,z);f.g.rotation.y=ry;root.add(f.g);if(o.seat)f.legs.forEach(l=>l.rotation.x=-1.5);
 const p={f,k:o.k,x,z,ry,ph:i*1.7,nm:o.nm,t0:rr(0,20)};NPC.push(p);return p}
function skater(o){const p=person(0,0,0,o);const d=DECKS[o.deck%DECKS.length],bm=boardMesh(d,0),bg=new THREE.Group();bg.add(bm);root.add(bg);p.rig=skRig(p.f,bg);p.bm=bm;return p}
function buildPeople(){if(ppBuilt)return;ppBuilt=true;
 const tina=person(-52,-24.55,0,{k:'clerk',top:'#f3efe2',pants:'#22405e',y:.3,hair:5,bt:3,nm:'Tina',hcc:'#6a3a2a',topT:5});tina.f.arms[1].rotation.x=-.5;
 const rex=person(-39,-22.6,.6,{k:'coach',top:'#d9483b',pants:'#2b3a55',hair:1,bt:2,nm:'Rex',hcc:'#9a9a9a',topT:6,body:.7});rex.f.arms[1].rotation.set(-.6,0,.2);rex.f.arms[0].rotation.set(-.2,0,-.2);
 {const bg=new THREE.Group();bg.add(boardMesh(DECKS[3],0));bg.position.set(-.5,.95,.1);bg.rotation.set(.0,0,1.45);rex.f.g.add(bg);rex.hold=bg}
 const s1=person(-30.4,-28.75,PI,{k:'sit',top:'#2aa7a1',pants:'#4a4a5a',y:.55,hair:4,bt:2,nm:'Bea',seat:1,topT:7});s1.f.g.position.y=.12;
 const s2=person(0,-28.75,PI,{k:'sit',top:'#ff6ad5',pants:'#2b2b3a',y:.55,hair:6,bt:1,nm:'Lou',seat:1,topT:3});s2.f.g.position.y=.12;
 NPC.skaters=[skater({k:'dex',top:'#3a7bd5',pants:'#22223a',hair:3,nm:'Dex',deck:3,topT:0}),skater({k:'mika',top:'#ff6ad5',pants:'#2a2a40',hair:7,nm:'Mika',deck:1,topT:6,bt:1}),skater({k:'juno',top:'#ffd23d',pants:'#3a3a4a',hair:11,nm:'Juno',deck:2,topT:5}),skater({k:'kai',top:'#9dffb6',pants:'#2a3a4a',hair:1,nm:'Kai',deck:4,topT:3})];
 root.updateMatrixWorld(true)}
const mkF=(x,y,z,yaw,o)=>{o=o||{};return[x,y,z,yaw,o.pitch||0,o.roll||0,o.flip||0,o.shove||0,o.crouch==null?.2:o.crouch,o.lean||0,o.grab||0,o.mode||0,o.bal||0,o.t||0,0,0,0,0,0,0,0,o.push||0,o.gid||0,o.sp||4]};
const ease=p=>p*p*(3-2*p),arc=p=>4*p*(1-p);
function dexLoop(t){const cx=-16,cz=-17,r=7.5,sp=5.2,th=sp/r*t,x=cx+r*Math.cos(th),z=cz+r*Math.sin(th),yaw=Math.atan2(-Math.sin(th),Math.cos(th)),ph=t%3,idx=Math.floor(t/3)%3;let air=0,o={crouch:.2,t};
 if(t%3>1.3&&t%3<2.6)o.push=1;
 if(ph<.8){const a=ph/.8;air=.7*arc(a);o.crouch=.5;if(idx==0)o.flip=TAU*ease(a);else if(idx==1)o.shove=PI*ease(a);else{o.grab=sm(.15,.4,a)*(1-sm(.7,.9,a));o.gid=1}}
 return mkF(x,hH(x,z)+air,z,yaw,o)}
function mikaPipe(t){const cx=-53,cz=18,w=1.15,s=Math.sin(w*t),c=Math.cos(w*t),L=3.04+1.9,x=cx+L*s,z=cz+Math.sin(t*.37)*1.4,y=hH(x,z);const ex=Math.abs(s)>.93?arc(clamp((1-Math.abs(s))/.07,0,1)*.5+.0)*0+(1-clamp((1-Math.abs(s))/.07,0,1)):0;
 const yaw=PI/2*clamp(c*4,-1,1),pitch=-Math.atan((hH(x+.1,z)-hH(x-.1,z))/.2)*(c>=0?1:-1)*(c>=0?1:1);
 return mkF(x,y+ex*.9,z,yaw,{crouch:.25+.5*ex,grab:ex>.3?1:0,gid:4,pitch:c>=0?pitch:-pitch,t,flip:0})}
function junoBowl(t){const rx=3.6+1.9*Math.sin(.45*t),rz=2.2+1.1*Math.sin(.45*t+1),th=t*.95,x=POOL.cx+rx*Math.cos(th),z=POOL.cz+rz*Math.sin(th),dx=-rx*Math.sin(th),dz=rz*Math.cos(th),yaw=Math.atan2(dx,dz);return mkF(x,hH(x,z),z,yaw,{crouch:.35,lean:.7,roll:0,t,pitch:0})}
function kaiRail(t){const T=[1.7,.55,3.3,.55,1.3,3.6,1.3],tot=T.reduce((a,b)=>a+b,0);let u=t%tot,i=0;while(u>T[i]){u-=T[i];i++}const p=u/T[i];let x,z,y=0,o={crouch:.2,t},yaw=PI/2;
 switch(i){case 0:x=lerp(-37,-31.8,p);z=-6;o.push=1;break;case 1:x=lerp(-31.8,-29.8,p);z=-6;y=.55*ease(p)+.5*arc(p);o.crouch=.5;break;
  case 2:x=lerp(-29.8,-18.2,p);z=-6;y=.55;o.mode=M_R;o.bal=Math.sin(t*3.1)*.5;o.crouch=.3;break;case 3:x=lerp(-18.2,-16,p);z=-6;y=.55*(1-ease(p))+.45*arc(p);o.crouch=.5;o.flip=p>.4?TAU*ease((p-.4)/.6):0;break;
  case 4:{const a=ease(p);x=lerp(-16,-12,a);z=lerp(-6,-10,a);yaw=PI/2+(1-p)*0-.9*Math.sin(p*PI);break}
  case 5:x=lerp(-12,-37,p);z=-10;yaw=-PI/2;o.push=1;break;default:{const a=ease(p);x=lerp(-37,-37,a);z=lerp(-10,-6,a);yaw=-PI/2+PI*a;break}}
 if(i==1||i==3)o.flip=o.flip||0;return mkF(x,y+hH(x,z)*0,z,yaw,o)}
/* Dex doing a trick for S-K-A-T-E, on a clear stretch of plaza (or the long rail for grinds) */
function dexDemo(id,ok){const n=NPC.skaters&&NPC.skaters[0];if(!n)return;n.demo={id,ok,t:0}}
function dexDemoFrame(n,dt){const d=n.demo;d.t+=dt;const t=d.t,id=d.id,g=id[0]=='g'&&id!='gnose'?1:id=='gnose'?1:0;let f;
 if(g){const x=lerp(-35,-12,clamp(t/2.6,0,1)),on=x>-30&&x<-18;f=mkF(x,on?.55:0,-6,PI/2,{mode:on?M_R:0,bal:on?Math.sin(t*5)*.4:0,crouch:.3,t,flip:0});if(!d.ok&&t>1.5){return tumble(n,f,t-1.5)}if(t>2.7)n.demo=null;return f}
 const x=lerp(-28,-6,clamp(t/2.4,0,1)),a=clamp((t-.8)/.8,0,1),air=.8*arc(a),o={crouch:a>0&&a<1?.55:.2,t};
 if(id=='kick')o.flip=TAU*ease(a);else if(id=='heel')o.flip=-TAU*ease(a);else if(id=='shove')o.shove=PI*ease(a);else if(TR[id].k=='g'){o.grab=sm(.1,.3,a)*(1-sm(.7,.9,a));o.gid=GRAB_IDX[id]||1}
 let yaw=PI/2;if(TR[id].k=='s'){const nn={s180:1,s360:2,s540:3,s720:4,s900:5}[id]||1;yaw+=nn*PI*ease(a)}
 f=mkF(x,hH(x,-14)+air,-14,yaw,o);f[2]=-14;if(!d.ok&&t>1.7)return tumble(n,f,t-1.7);if(t>2.6)n.demo=null;return f}
function tumble(n,f,t){f[11]=M_B;f[14]=f[0]+t*1.5;f[15]=Math.max(.45,1.1-t*2.4+.1*Math.sin(t*14));f[16]=f[2];f[17]=t*7;f[18]=t*3;f[19]=t*5;f[20]=clamp((t-1)/.4,0,1);f[13]=t;if(t>1.5)n.demo=null;f[1]=0;return f}
function npcTick(dt,t){NPC.forEach(n=>{const g=n.f.g;
 if(n.k=='clerk'){n.f.arms[1].rotation.x=-.5+Math.sin(t*1.6+n.ph)*.1;g.rotation.y=Math.sin(t*.35)*.25}
 else if(n.k=='coach'){g.rotation.y=.6+Math.sin(t*.4)*.5;n.f.arms[0].rotation.x=-.2+Math.sin(t*.9)*.1;if(G&&G.on&&G.mode=='free'&&G.t<4)g.rotation.y=.9}
 else if(n.k=='sit'){g.rotation.y=PI+Math.sin(t*.3+n.ph)*.3;n.f.arms[1].rotation.x=-.3}});
 if(NPC.skaters){const act=!G||G.phase=='ride'||G.phase=='over'||true;NPC.skaters.forEach((n,i)=>{let f;const tt=t+n.t0;
  if(n.demo&&i==0)f=dexDemoFrame(n,dt);else f=[dexLoop,mikaPipe,junoBowl,kaiRail][i](tt);
  applyFrame(n.rig,f)})}}

/* ---------- the maps: the park from above, and the label ---------- */
try{if(!POIS.some(q=>q[2]=='Skate Park'))POIS.push([CX,CZ,'Skate Park','#ff6ad5'])}catch(e){}
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){const r=m0.apply(this,arguments);try{x.save();x.lineJoin='round';x.translate(sx(CX),sz(CZ));x.scale(kx,kz);const fine=kx>.25;
  const R=(cx,cz,w,d,col)=>{x.fillStyle=col;x.fillRect(cx-w/2,cz-d/2,w,d)},Q=(cx,cz,w,d,col)=>{R(cx+.5,cz+.5,w,d,'rgba(0,0,0,.25)');R(cx,cz,w,d,col)};
  Q(0,0,121,65,'#8d9298');R(0,0,119,63,'#a8adb2');
  EXT.forEach(e=>{if(e.kind=='hut')return;const col=e.kind=='qp'||e.kind=='hp'||e.kind=='kick'||e.kind=='land'?'#c6cbd0':e.kind=='steps'||e.kind=='plat'||e.kind=='bank'?'#b9bec4':e.kind=='fun'||e.kind=='pad'?'#d1d5d9':e.kind=='wall'?'#6a6f78':'#9aa0a6';if(e.kind=='prop'&&!fine)return;R((e.x0+e.x1)/2,(e.z0+e.z1)/2,e.x1-e.x0,e.z1-e.z0,col)});
  const pr=(a,b,c,d)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,c,d,POOL.r);else x.rect(a,b,c,d);x.fill()};x.fillStyle='#5aa9c4';pr(PX0,PZ0,PX1-PX0,PZ1-PZ0);x.fillStyle='#9ed3dc';pr(PX0+2.4,PZ0+2.4,PX1-PX0-4.8,PZ1-PZ0-4.8);
  Q(-52,-27.5,12,8,'#2aa7a1');R(-52,-27.5,12.8,1.2,'#d9483b');
  if(fine){x.strokeStyle='#e6e9ee';x.lineWidth=.5;RAILS.forEach(rl=>{if(rl.coping)return;x.beginPath();x.moveTo(rl.pts[0][0],rl.pts[0][2]);rl.pts.forEach(p=>x.lineTo(p[0],p[2]));x.stroke()});x.fillStyle='#ffd27a';ANIM.lights.forEach(l=>{x.beginPath();x.arc(l[0],l[2],.9,0,TAU);x.fill()})}
  x.restore()}catch(e){try{x.restore()}catch(e2){}}return r}}

/* ---------- glue: build when you come near, interactions, people, light, walking on the slab ---------- */
let intDone=false,HY2=0,ANT=0;
{const w1=worldTick;worldTick=function(dt){const r=w1.apply(this,arguments);try{
 if(mode=='title'||away())return r;dt=dt||.016;
 const dd=Math.hypot(P.x-CX,P.z-CZ);
 if(!BUILT&&dd<470&&typeof buildChar=='function')buildPark();
 if(!BUILT)return r;
 root.visible=dd<560||!!G;
 if(!intDone){intDone=true;const f=(x,z)=>lw(x,z);
  let p=f(-41.2,-24.2);INT.push({x:p[0],z:p[1],r:4.3,l:'Skate: pick a board and ride',a:()=>openMenu('play'),sk:1});
  p=f(-52,-21.4);INT.push({x:p[0],z:p[1],r:3.6,l:'Board Shop: rent, decks, trucks',a:()=>openMenu('shop'),sk:2});
  p=f(-39,-21.2);INT.push({x:p[0],z:p[1],r:2.6,l:'Talk to Rex the coach',a:()=>openMenu('coach'),sk:3});
  p=f(LBX,LBZ+2.6);INT.push({x:p[0],z:p[1],r:3,l:'Skate park leaderboard and challenges',a:()=>openMenu('chal'),sk:4})}
 if(root.visible){if(!ppBuilt&&dd<260)buildPeople();ANT+=dt;lightsTick();carveTick(dt);
  if(ppBuilt&&(dd<200||G))npcTick(dt,ANT);
  if(boardKey&&!G){const o=st();if(boardKey!==[o.best,o.runs,o.bestCombo,Object.keys(o.challenges).length,o.wins].join('|'))drawBoard()}}
 if(G&&G.on){if(!(window.FW_SKATE&&FW_SKATE.hold)){P.x=CX+B.x;P.z=CZ+B.z;SY=SLAB;simTick(dt)}hudTick()}
 else if(!window.IN&&P.mesh&&dd<120&&mode=='play'){const inside=inPark(P.x,P.z,.6),h=inside?SLAB:0;HY2+=(h-HY2)*Math.min(1,dt*10);SY=HY2;P.mesh.position.y=HY2}else if(Math.abs(HY2)>.01&&mode=='play'){HY2*=1-Math.min(1,dt*10);SY=HY2}
 }catch(e){soft(e,'glue')}return r}}
/* the weather only shows in 'play', so while skating it believes it is */
if(typeof wxTick=='function'){const x0=wxTick;wxTick=function(dt){if(G&&G.on&&mode=='skate'){const m=mode;mode='play';try{return x0.apply(this,arguments)}finally{mode=m}}return x0.apply(this,arguments)}}
/* the Mastery panel text said "coming soon" */
try{if(typeof FW_MASTERY!='undefined'&&FW_MASTERY.cats&&FW_MASTERY.cats.skate)FW_MASTERY.cats.skate.how='Land tricks, grinds and long combos at the Skate Park, win S-K-A-T-E and finish challenges.'}catch(e){}

window.FW_SKATE={hold:false,DECKS,TRUCKS,TR,LES,CH,SPINS,EXT,RAILS,WALLS,POOL,st,gear,hH,hG,poolH,poolD,railAt,unlocked,lesProg,root,ANIM,NPC,CX,CZ,SLAB,PX0,PX1,PZ0,PZ1,GAPX0,GAPX1,
 get G(){return G},get B(){return B},get built(){return BUILT},get P(){return PART},
 start:(m,o)=>startSession(m||'free',Object.assign({free:true},o||{})),exit:()=>{if(G){if(G.phase!='results')endSession(true);exitSession()}},
 key:(k,d)=>{if(!G)return;if(d){if(!GK[k]){GKd[k]=1;if(k=='j')bufFlip('kick');else if(k=='k')bufFlip('heel');else if(k=='l')bufFlip('shove')}GK[k]=1}else{if(GK[k]&&k==' ')G.relSpace=1;delete GK[k]}},
 tick:dt=>{if(G){simTick(dt);hudTick()}},poseFrame,frameOf,applyFrame,bankCombo,bail,buildPark,openMenu,startReplay,skipReplay,showResults,endSession,chalDone,drawBoard,
 tele:(x,z,yaw,sp,o)=>{if(!B)return;o=o||{};B.x=x;B.z=z;B.y=hH(x,z);B.yaw=yaw;B.vx=Math.sin(yaw)*sp;B.vz=Math.cos(yaw)*sp;B.vy=0;B.st='g';B.A=null;B.man=false;B.spin=0;B.flip=null;B.flipA=0;B.shoveA=0;B.rail=null;B.wall=null;B.bail=null;B.pop=0;B.popping=false;B.rev=null;B.wob=0;if(o.y!=null){B.y=o.y;B.st='a';airStart('ollie');B.vy=o.vy||0}},
 dexDemo,skNext,skTick,nightK,lightsTick,PART_N:()=>PART?PART.pt.length:0,SOL};
})();
