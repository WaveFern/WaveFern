/* ===== v55.12.0: everything in the house can be moved and stored (except the desk) =====
   The bedroom dressing (wardrobe, wall poster, pictures, wall clock, fairy lights, plants) and the studio gear (chair, mic,
   speakers, guitar and amp, keys, drums, decks, table with its gear, pedals, bass, vocal booth, synth, ring light, posters and
   foam panels) used to be built into the house. They are now ordinary placed furniture, like the bed: hover outline, E to
   store, click to move, Storage lists them. Types are hm_* and, like the starter bed, are hidden from Amazoom (non-enumerable).
   No new saved field: PL / S.inv already hold them. A piece that exists nowhere (an old save, new gear just bought) is
   created at its old spot (or in Storage when that spot is taken). Gear pieces redraw when their level goes up.
   Still fixed: the desk (and the mixing desk of the Desk gear line), the room treatment panels and the window with curtains.
   Needs the mic to be placed to leave Storage (you record at it), like the bed rule.
   Loads before 27-boot so the first buildStudio already skips the gear. */
(()=>{
const GL=k=>Math.min(3,((typeof S!='undefined'&&S.gear&&S.gear[k])||0));
const MOVED=['chair','mic','guitar','promo','keys','drums','decks','booth','pedals','bass','vocal','synth','content','phones','iface','monitors','sampler'];
/* floor pieces: [type, name, w, d, centre x, centre z, rotation, has(), signature, builder(g)] ; origin of the model = footprint centre */
const XS=(g,k,l,x,y,z,ry)=>XSTP(g,k,l,x,y,z,ry);
const tblOn=()=>['phones','iface','monitors','sampler'].some(k=>GL(k))||GL('desk')==1;
const DEF=[
 {t:'hm_chair',n:'Studio chair',w:.6,d:.6,x:13.6,z:2.8,r:0,has:()=>1,sig:()=>GL('chair'),b:g=>XS(g,'chair',GL('chair'),0,0,0,0)},
 {t:'hm_mic',n:'Studio mic',w:.6,d:.6,x:12.2,z:1.5,r:0,has:()=>1,sig:()=>GL('mic'),b:g=>XS(g,'mic',GL('mic'),0,0,-.2,0)},
 {t:'hm_spk',n:'Studio speaker',w:.5,d:.5,x:10.3,z:.55,r:0,has:()=>GL('mic')>=2,sig:()=>'s',b:g=>XS(g,'speaker',0,0,0,0,0)},
 {t:'hm_spk',n:'Studio speaker',w:.5,d:.5,x:14.2,z:.55,r:0,has:()=>GL('mic')>=2,sig:()=>'s',b:g=>XS(g,'speaker',0,0,0,0,0)},
 {t:'hm_gtr',n:'Guitar stand',w:.7,d:.7,x:14.75,z:1.15,r:0,has:()=>1,sig:()=>GL('guitar'),b:g=>XS(g,'guitar',GL('guitar'),-.05,0,.05,0)},
 {t:'hm_amp',n:'Guitar amp',w:.8,d:.4,x:15.4,z:2.6,r:0,has:()=>GL('guitar')>=1,sig:()=>GL('guitar'),b:g=>XS(g,'amp',GL('guitar'),0,0,0,0)},
 {t:'hm_keys',n:'Keyboard',w:1.5,d:.6,x:10.25,z:4.8,r:0,has:()=>GL('keys')>=1,sig:()=>GL('keys'),b:g=>XS(g,'keys',GL('keys'),-.05,0,0,0)},
 {t:'hm_drums',n:'Drum kit',w:1.4,d:.8,x:10.8,z:2.3,r:0,has:()=>GL('drums')>=1,sig:()=>GL('drums'),b:g=>XS(g,'drums',GL('drums'),0,0,0,0)},
 {t:'hm_decks',n:'DJ decks',w:1.4,d:.8,x:13.8,z:4.9,r:0,has:()=>GL('decks')>=1,sig:()=>GL('decks'),b:g=>XS(g,'decks',GL('decks'),0,0,0,0)},
 {t:'hm_table',n:'Producer table',w:1.4,d:.7,x:9.05,z:.55,r:0,has:tblOn,sig:()=>['phones','iface','monitors','sampler'].map(GL).join('')+(GL('desk')==1?'d':''),b:g=>{
   xTable(g);const ty=.775;if(GL('monitors'))XS(g,'monitors',GL('monitors'),0,ty,-.2,0);if(GL('iface'))XS(g,'iface',GL('iface'),-.52,ty,.16,.1);if(GL('sampler'))XS(g,'sampler',GL('sampler'),.52,ty,.17,-.1);
   if(GL('phones')){xb(g,.05,.03,.06,'#1a1a1a',.72,.68,.1);xPhonesHead(xgrp(g,.76,.5,.1,Math.PI/2),GL('phones'))}if(GL('desk')==1)XS(g,'desk',1,0,ty,.2,0)}},
 {t:'hm_pedals',n:'Pedal board',w:.7,d:.4,x:14.85,z:3.15,r:0,f:1,has:()=>GL('pedals')>=1,sig:()=>GL('pedals'),b:g=>XS(g,'pedals',GL('pedals'),0,0,0,-.2)},
 {t:'hm_bass',n:'Bass guitar',w:.5,d:.4,x:15.35,z:1.15,r:0,has:()=>GL('bass')>=1,sig:()=>GL('bass'),b:g=>XS(g,'bass',GL('bass'),0,0,0,-.25)},
 {t:'hm_vocal',n:'Vocal booth',w:.46,d:.4,x:11.5,z:.75,r:0,has:()=>GL('vocal')>=1,sig:()=>GL('vocal'),b:g=>XS(g,'vocal',GL('vocal'),0,0,0,.15)},
 {t:'hm_synth',n:'Synth',w:1.1,d:.56,x:8.95,z:5.2,r:0,has:()=>GL('synth')>=1,sig:()=>GL('synth'),b:g=>XS(g,'synth',GL('synth'),0,0,0,0)},
 {t:'hm_ring',n:'Ring light rig',w:.5,d:.5,x:8.4,z:1.45,r:0,has:()=>GL('content')>=1,sig:()=>GL('content'),b:g=>XS(g,'content',GL('content'),0,0,0,Math.PI/4)},
 /* wall pieces: back flat on a wall, local z -d/2 is the back */
 {t:'hm_promo',n:'Studio posters',w:2.4,d:.12,x:11.35,z:.21,r:0,wall:1,has:()=>GL('promo')>=1,sig:()=>GL('promo'),b:g=>{const o=xgrp(g,10.55-11.35,1.8,.05-.21);GB.promo(o,GL('promo'))}},
 {t:'hm_booth',n:'Foam panels',w:3.1,d:.16,x:14.1,z:.23,r:0,wall:1,has:()=>GL('booth')>=1,sig:()=>GL('booth'),b:g=>{const o=xgrp(g,15.2-14.1,1.3,.02-.23);GB.booth(o,GL('booth'))}}
];
/* bedroom pieces, plain box lists */
const WB=[ /* wardrobe against the west wall: model built facing +z, placed turned (r=1) so the doors face the room; the item sits against the wall collision strip (x .15), the model reaches back to the wall */
 [1.4,2.1,.62,'#8a5a36',0,1.05,-.19],[1.48,.08,.68,'#5a3d25',0,2.14,-.19],[1.44,.1,.66,'#4d3320',0,.05,-.19],
 [.66,1.9,.03,'#a0693f',.34,1.05,.13],[.66,1.9,.03,'#a0693f',-.34,1.05,.13],[.46,1.6,.04,'#8a5a36',.34,1.05,.145],[.46,1.6,.04,'#8a5a36',-.34,1.05,.145],
 [.04,.2,.05,'#e6b422',.04,1.05,.16],[.04,.2,.05,'#e6b422',-.04,1.05,.16]];
/* wall pieces: the collision strip of a wall reaches .15 into the room, so the item (d .1) sits at wall+.15 and its model reaches back to the wall: local z = real z - .2 */
const PIC1=[[.7,.52,.04,'#2b2b2b',0,2.05,-.17],[.6,.42,.03,'#4aa3df',0,2.05,-.15],[.3,.18,.03,'#e6b422',0,2.02,-.135]];
const PIC2=[[.46,.6,.04,'#2b2b2b',0,1.95,-.17],[.38,.52,.03,'#e8a0b4',0,1.95,-.15],[.14,.14,.03,'#fff',0,2.02,-.135]];
const CLK=[[.38,.38,.05,'#2b2b2b',0,2.3,-.17],[.3,.3,.04,'#f4f1ea',0,2.3,-.145],[.02,.12,.02,'#222',0,2.34,-.12],[.1,.02,.02,'#222',.04,2.3,-.12]];
const POSTER=[[.9,1.2,.05,'#c8506a',0,1.9,-.16],[.7,.2,.06,'#ffd27a',0,2.2,-.15]];
const PLB=(()=>{const a=[],s=1,P=(w,h,d,c,x,y,z)=>a.push([w,h,d,c,x,y,z]);P(.3*s,.28*s,.3*s,'#b5482a',0,.14*s,0);P(.34*s,.05*s,.34*s,'#8a3a22',0,.29*s,0);P(.26*s,.03*s,.26*s,'#4a3320',0,.3*s,0);
 [[0,.55,0,.07],[-.1,.45,.04,.06],[.1,.5,-.05,.06],[.04,.7,.08,.05]].forEach(b=>P(b[3]*s*1.4,(.3+b[1]*.5)*s,b[3]*s*1.4,'#3a6b3a',b[0]*s,(.3+b[1]*.25)*s+.15*s,b[2]*s));
 [[-.18,.62,.02],[.18,.58,-.04],[0,.82,0],[-.08,.7,.14],[.1,.72,.12]].forEach(b=>P(.2*s,.1*s,.2*s,'#4f9a4f',b[0]*s,b[1]*s+.2*s,b[2]*s));return a})();
const FAIRY=g=>{for(let i=0;i<10;i++){const x=.35+i*.3-1.85;B(g,.3,.015,.015,'#444',x+.15,2.62-.05*Math.sin((i+.5)/10*Math.PI*2)*.5,-.17);B(g,.06,.08,.06,'*'+['ffd27a','ff9ab8','9ad8ff','b8ff9a'][i%4],x,2.56-.05*Math.sin(i/9*Math.PI),-.15)}};
const BED=[
 {t:'hm_ward',n:'Wardrobe',w:1.5,d:.7,x:.5,z:4.4,r:1,b:WB,has:()=>1},
 {t:'hm_poster',n:'Wall poster',w:.9,d:.1,x:3.8,z:.2,r:0,wall:1,b:POSTER,has:()=>1},
 {t:'hm_pic1',n:'Picture (blue)',w:.7,d:.1,x:.9,z:.2,r:0,wall:1,b:PIC1,has:()=>1},
 {t:'hm_pic2',n:'Picture (pink)',w:.46,d:.1,x:1.8,z:.2,r:0,wall:1,b:PIC2,has:()=>1},
 {t:'hm_clock',n:'Wall clock',w:.38,d:.1,x:2.7,z:.2,r:0,wall:1,b:CLK,has:()=>1},
 {t:'hm_fairy',n:'Fairy lights',w:3.0,d:.1,x:1.85,z:.2,r:0,wall:1,fx:FAIRY,has:()=>1},
 {t:'hm_plant',n:'House plant',w:.4,d:.4,x:7.65,z:.5,r:0,b:PLB,has:()=>1},
 {t:'hm_plant',n:'House plant',w:.4,d:.4,x:7.6,z:5.5,r:0,b:PLB,has:()=>1}];
const ALL=BED.concat(DEF);
/* register the F types once (hidden from shops and "give everything" loops) */
const seen={};ALL.forEach(a=>{if(seen[a.t])return;seen[a.t]=1;
 const f={n:a.n,p:0,w:a.w,d:a.d,b:a.b&&Array.isArray(a.b)?a.b:[],xd:1};if(a.wall)f.wall=1;if(a.f)f.f=1;
 if(DEF.includes(a)){f.b=[];f.fx=g=>{a.b(g);xMerge(g)}}else if(a.fx)f.fx=a.fx;
 Object.defineProperty(F,a.t,{value:f,enumerable:false,writable:true,configurable:true})});
const isGear=t=>DEF.some(a=>a.t==t);
/* ---- creating missing pieces ---- */
const cnt=t=>PL.filter(q=>q.t==t).length+(S.inv&&S.inv[t]>0?S.inv[t]:0)+(hold==t?1:0);
function overlapFree(t,x,z,r){const e=.02,c0=fb(t,x,z,r),c=[c0[0]+e,c0[1]+e,c0[2]-e,c0[3]-e],f=F[t],o=q=>c[0]<q[2]&&c[2]>q[0]&&c[1]<q[3]&&c[3]>q[1];
 if(f.wall)return true;if(f.f)return true;
 return !(cols.some(o)||dyn.some(o)||PL.some(q=>!F[q.t].f&&!F[q.t].wall&&o(fb(q.t,q.x,q.z,q.r))))}
function addPiece(t,x,z,r){const m=mkF(t);m.position.set(x,0,z);m.rotation.y=r*Math.PI/2;scene.add(m);const q={t,x,z,r,m};PL.push(q);return q}
let busy=0;
function sync(){if(busy||typeof PL=='undefined'||!scene||!S||!S.sp||!S.gear||mode=='load'||mode=='creator'||mode=='build'||hold)return;busy=1;
 try{S.inv=S.inv||{};const need={};ALL.forEach(a=>{if(a.has())(need[a.t]=need[a.t]||[]).push(a)});
  Object.keys(need).forEach(t=>{const have=cnt(t);if(have>=need[t].length)return;const list=need[t];
   /* create the missing ones: first the defaults that nothing placed there yet */
   for(let i=have;i<list.length;i++){const a=list[i];if(overlapFree(t,a.x,a.z,a.r))addPiece(t,a.x,a.z,a.r);else S.inv[t]=(S.inv[t]||0)+1}});
  /* redraw gear pieces whose level changed */
  PL.forEach(q=>{if(!isGear(q.t))return;const a=DEF.find(d=>d.t==q.t),sg=String(a.sig());if(q.hs===sg)return;q.hs=sg;if(!q.m)return;
   scene.remove(q.m);const m=mkF(q.t);m.position.set(q.x,0,q.z);m.rotation.y=q.r*Math.PI/2;scene.add(m);q.m=m})}
 catch(e){console.warn('movable house',e)}finally{busy=0}}
/* the studio keeps only what is not movable: it is built with the movable gear switched off */
{const bs0=buildStudio;buildStudio=function(){const g0=S.gear,keep=Object.assign({},g0);
  MOVED.forEach(k=>{keep[k]=0});if(keep.desk==1)keep.desk=0;S.gear=keep;const hold0={};const gbk=['chair','mic','guitar'];gbk.forEach(k=>{hold0[k]=GB[k];GB[k]=null});
  try{bs0.apply(this,arguments)}finally{S.gear=g0;gbk.forEach(k=>{GB[k]=hold0[k]})}
  /* the three rectangles the original always adds for chair, mic and guitar */
  const bad=['11.9,1.2,12.5,1.8','13.3,2.5,13.9,3.1','14.4,.8,15.1,1.5'].map(s=>s.split(',').map(Number).join());dyn=dyn.filter(r=>!bad.includes(r.join()));
  sync()}}
{const b0=buildTick;let n=0;buildTick=function(){if(++n%20==0)sync();return b0.apply(this,arguments)}}
/* sleeping/recording spots follow their pieces */
spFollow(INT[2],'hm_mic',0,.7);spFollow(INT[3],'hm_gtr',-.55,.75);spFollow(INT[4],'hm_chair',0,.6);
/* wardrobe, bass, synth and ring light are usable where they stand */
{const di0=dynInt;dynInt=function(){let a=di0();if(!(HIN&&!IN))return a;
  const fix=[['Play bass',15.2,1.6],['Jam on the synth',8.95,4.5],['Film a clip',8.9,2.1]];a=a.filter(o=>!fix.some(f=>o.l==f[0]&&o.x==f[1]&&o.z==f[2]));
  const add=(t,ox,oz,l,fn)=>{const q=PL.find(q=>q.t==t);if(!q)return;const o=spRot(ox,oz,q.r),x=q.x+o[0],z=q.z+o[1];if(Math.hypot(P.x-x,P.z-z)<(t=='hm_ward'?3.2:1.5))a.push({x,z,r:t=='hm_ward'?1.3:1.2,l,a:fn})};
  add('hm_ward',0,1.55,'Open wardrobe',()=>wardrobe());
  add('hm_bass',-.15,.45,'Play bass',()=>say(pick(['You lock into a groove with the kick drum.','A deep note rattles the window.','You slap a funky line and grin.'])));
  add('hm_synth',0,-.7,'Jam on the synth',()=>say(pick(['You twist the filter and the room goes all warm.','An arpeggio loops while you hum a hook.','You find a patch that sounds like the future.'])));
  add('hm_ring',.5,.65,'Film a clip',()=>say(pick(['You film a quick studio clip for your fans.','The ring light makes everything look expensive.','One more take... got it.'])));
  return a}}
/* tall and wall pieces: a click on the piece itself picks it (the floor point behind a wardrobe or a picture is not its footprint) */
{const h0=hovFind;hovFind=function(){try{if(mode=='build'&&PL.some(q=>/^hm_/.test(q.t))){RC.setFromCamera(mouse,cam);
  const ms=[];PL.forEach((q,i)=>{if(/^hm_/.test(q.t)&&q.m)ms.push([q.m,i])});const hit=RC.intersectObjects(ms.map(a=>a[0]),true)[0];
  if(hit){let o=hit.object;while(o&&!ms.some(a=>a[0]===o))o=o.parent;const e=ms.find(a=>a[0]===o);if(e)return e[1]}}}catch(e){}return h0.apply(this,arguments)}}
/* you record at the mic: it has to be placed before you leave Storage */
{const e0=exitBuild;exitBuild=function(){if(mode=='build'&&!PL.some(q=>q.t=='hm_mic')){snd('err');if(typeof SGT!='undefined')SGT='f';buildUI();return say('Place your studio mic before you leave Storage. You record at it.')}
  return e0.apply(this,arguments)}}
/* v55.12.4: the bed can never be lost. If no bed is placed, stored or in your hands (an old save that lost it while you were
   moving it), it comes back: from Storage if there is one, otherwise a new bed. It goes to its old spot, or stays in Storage if that spot is taken. */
let bedMsg=0;
function ensureBed(){if(busy||typeof PL=='undefined'||!scene||!S||!S.sp||mode=='load'||mode=='creator'||mode=='build'||hold||IN)return;
 try{if(hasBed())return;S.inv=S.inv||{};let t=Object.keys(S.inv).find(k=>isBed(k)&&S.inv[k]>0)||'bed';
  const[x,z,r]=STRD.bed,have=S.inv[t]>0;
  if(overlapFree(t,x,z,r)){if(have)S.inv[t]--;if(S.inv[t]<=0)delete S.inv[t];addPiece(t,x,z,r)}else if(!have)S.inv[t]=1;
  if(!bedMsg){bedMsg=1;say(PL.some(q=>isBed(q.t))?'Your bed was missing, so it is back in the bedroom.':'Your bed is back in Storage. Press F at home to place it.')}}
 catch(e){console.warn('bed repair',e)}}
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{ensureBed()}catch(e){}return r}}
{const b0=buildTick;let n=0;buildTick=function(){if(++n%30==0)ensureBed();return b0.apply(this,arguments)}}
window.FW_HOUSE={ALL,DEF,BED,sync,cnt};
if(typeof studio!='undefined'&&studio&&S&&S.gear)try{buildStudio()}catch(e){}
})();
