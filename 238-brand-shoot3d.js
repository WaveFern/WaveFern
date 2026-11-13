/* ===== v53.5.0: the 3D brand photoshoot =====
   Replaces the pixel-photo studio of 224-brand-studio.js (BRD.begin). The shoot is now a real 3D fashion studio seen from a low
   front angle: a seamless cyc wall, a big black umbrella softbox on a stand, stands, sandbags and gaffer tape. You are your own
   3D character and you wear or hold the brand's product (sneakers, can, glasses, hoodie, phone, bag ...).
   A side panel changes everything live: Pose (13), Face (8 expressions), Light (4 looks, key side and height, brightness, fill,
   rim colour), Set (5 backdrops, props, product on/off) and Camera (turn, height, distance, drag to orbit, wheel to zoom).
   Scoring (100): 30 base + 25 pose mood + 25 lighting look + 10 product on + 5 logo in frame + 3 face + 0-2.
   The best frame is posted on Instagrime. A post stores its setup as p.s3 (short keys, see DEF) and is drawn again from that
   by BRD.render3d on every load. Wrap/payout is BRD.wrapShoot in 224-brand-studio.js.
   Also exports BRD.item3d(brandId): a standalone 3D model of the brand's product (used by the HQ rooms, 239-brand-hq-rooms.js). */
(function(){
const BRD=window.BRD;if(!BRD||typeof igxChar!='function'||!BRD.wrapShoot)return;
const $e=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),MOODS=BRD.mood,LIGHTS=BRD.light;
const pcol=id=>{const b=BRD.by(id);return b.c==b.bg||/^#f/i.test(b.c)?'#3a3a48':b.c};
let own=null;const reg=o=>{if(own)own.push(o);return o};
const killList=l=>{l.forEach(o=>{try{o.dispose&&o.dispose()}catch(e){}});l.length=0};
const lam=(c,o)=>reg(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
const bas=(c,o)=>reg(new THREE.MeshBasicMaterial(Object.assign({color:c},o||{})));
const ctex=(w,h,fn,near)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=reg(new THREE.CanvasTexture(c));if(near)t.magFilter=THREE.NearestFilter;return t};
const mesh=(geo,mat,x,y,z,par)=>{reg(geo);const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(par)par.add(m);return m};
const cyl=(r0,r1,h,n,mat,x,y,z,par)=>mesh(new THREE.CylinderGeometry(r0,r1,h,n),mat,x,y,z,par);
const rnd=a=>{let s=a|0||7;return()=>{s=(s*1103515245+12345)>>>0;return s/4294967296}};

/* ---------- settings ---------- */
const DEF={p:0,e:0,l:0,ks:2,kh:1,ki:100,fi:50,rc:0,g:0,pr:1,pp:0,cy:-8,ch:.8,cd:5.4};
const LP=[{amb:'#ffe2bd',ai:.6,key:'#ffd9a0',ki:1.05,rim:'#ffb070',fill:'#ffcf9a'},{amb:'#cfe4ff',ai:.6,key:'#e6f1ff',ki:1.05,rim:'#7ab8ff',fill:'#aacaff'},
 {amb:'#d8c4ff',ai:.5,key:'#ff9de6',ki:1.1,rim:'#4ff0ff',fill:'#7a5cff'},{amb:'#dcdcdc',ai:.42,key:'#ffffff',ki:1.3,rim:'#ffffff',fill:'#bbbbbb',mono:1}];
const RIMS=[null,'#ff3b6b','#3bd1ff','#ffd23f','#7dff6a','#ffffff'],BGN=['Brand wall','White cyc','Black cyc','Colour sweep','City skyline'],PPN=['None','Stool','Plants','Neon logo'];
const EXN=['Smile','Laugh','Smirk','Serious','Cool','Surprised','Wink','Pout'],
 EXM=[['Confident','Playful','Candid','Hero'],['Playful','Candid'],['Confident','Cool'],['Cool','Hero','Confident'],['Cool'],['Playful','Candid'],['Playful','Cool'],['Cool','Playful']];
const KSN=['Left','Front','Right'],KHN=['Low','Mid','High'];
/* poses: m mood, L/R arm directions, lg=[x0,z0,x1,z1] leg turns, ry body turn, hx/hy/hz head, y lift, lean, sit, fg=fingers */
const POSES=[
 {n:'Stand',m:'Candid',L:[-.15,-1,.05],R:[.15,-1,.05]},
 {n:'Hands on hips',m:'Confident',L:[-.72,-.6,-.12],R:[.72,-.6,-.12],hx:-.07,hy:.06},
 {n:'Arms crossed',m:'Cool',L:[.5,-.5,.85],R:[-.5,-.45,.9],hy:-.12,hz:.05},
 {n:'Power stance',m:'Confident',L:[.5,-.5,.85],R:[-.5,-.45,.9],lg:[0,-.22,0,.22],hx:-.08},
 {n:'Peace',m:'Playful',L:[-.25,-.95,.1],R:[.28,.9,.35],hz:-.1,ry:-.2,fg:1},
 {n:'Wave',m:'Playful',L:[-.15,-1,.05],R:[.55,.85,.1],hz:.08,ry:-.15},
 {n:'Walking',m:'Candid',L:[-.1,-.8,.6],R:[.1,-.8,-.6],lg:[.5,0,-.5,0],ry:.35,hy:-.25},
 {n:'Hero',m:'Hero',L:[-.65,-.7,0],R:[.45,.95,.2],lg:[0,-.15,0,.15],hx:-.14,hz:-.06},
 {n:'Lean',m:'Cool',L:[-.2,-.95,.1],R:[.35,-.85,.45],lg:[0,0,.35,.05],ry:-.5,hy:.4,lean:.08},
 {n:'Jump',m:'Playful',L:[-.5,.9,.2],R:[.5,.9,.2],lg:[-.6,-.3,.3,.3],y:.4,hx:-.1},
 {n:'Seated',m:'Cool',L:[-.2,-.5,.8],R:[.2,-.5,.8],lg:[-1.5,0,-1.5,0],sit:1,ry:-.3,hy:.15},
 {n:'Over shoulder',m:'Candid',L:[-.15,-1,.05],R:[.15,-1,.05],ry:2.3,hy:-1.7},
 {n:'Strut',m:'Confident',L:[-.72,-.6,-.12],R:[.2,-.8,-.55],lg:[.35,0,-.35,0],ry:.25,hy:-.1},
 {n:'Point',m:'Hero',L:[-.72,-.6,-.12],R:[.15,.05,1],hz:.06}];

/* ---------- the product ---------- */
function canTex(id,body,fn){return ctex(256,128,(x,W,H)=>{x.fillStyle=body;x.fillRect(0,0,W,H);fn(x,W,H);BRD.paint(x,id,W/2-34,H/2-34,68)},1)}
const gold='#c9a24b';
function canItem(id){const g=new THREE.Group(),b=BRD.by(id);
 const tx=canTex(id,id=='monster'?'#0b0b0b':id=='pepsi'?'#f6f8fb':'#e41e2b',(x,W,H)=>{if(id=='monster'){x.fillStyle='#95d600';for(let i=0;i<3;i++){x.beginPath();x.moveTo(30+i*18,0);x.lineTo(46+i*18,0);x.lineTo(30+i*18-30,H);x.lineTo(14+i*18-30,H);x.fill()}x.fillRect(0,H-14,W,14)}else{x.fillStyle='#e32934';x.fillRect(0,0,W,H*.45);x.fillStyle='#0a4a96';x.fillRect(0,H*.55,W,H*.45)}});
 const m=cyl(.065,.065,.22,16,[lam('#ffffff',{map:tx}),lam('#c8ccd2'),lam('#c8ccd2')],0,0,0,g);m.material=[lam('#ffffff',{map:tx}),lam('#c8ccd2'),lam('#9aa0a8')];m.rotation.y=Math.PI;
 cyl(.055,.065,.02,16,lam('#c8ccd2'),0,.12,0,g);return g}
function bottleItem(){const g=new THREE.Group(),pts=[[0,0],[.045,0],[.06,.06],[.052,.12],[.032,.2],[.034,.26],[.026,.28],[0,.28]].map(p=>new THREE.Vector2(p[0],p[1]));
 const tx=ctex(128,64,(x,W,H)=>{x.fillStyle='#4a0d0d';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.fillRect(0,H*.42,W,H*.2);x.fillStyle='#e41e2b';x.font='italic bold 20px Georgia';x.textAlign='center';x.fillText('Koka-Cola',W/2,H*.58)},1);
 mesh(new THREE.LatheGeometry(pts,16),lam('#ffffff',{map:tx}),0,-.14,0,g).rotation.y=Math.PI;cyl(.028,.028,.02,10,lam('#e41e2b'),0,.15,0,g);return g}
function phoneItem(){const g=new THREE.Group();mesh(new THREE.BoxGeometry(.13,.27,.02),lam('#16181e'),0,0,0,g);
 mesh(new THREE.PlaneGeometry(.115,.25),bas('#fff',{map:ctex(64,128,(x,W,H)=>{const q=x.createLinearGradient(0,0,W,H);q.addColorStop(0,'#1428a0');q.addColorStop(1,'#6aa0ff');x.fillStyle=q;x.fillRect(0,0,W,H);x.fillStyle='#fff';x.font='bold 11px Arial';x.textAlign='center';x.fillText('SAMSONG',W/2,24);x.fillStyle='#ffffff30';x.beginPath();x.arc(W/2,H*.6,22,0,7);x.fill()})}),0,0,.0115,g);return g}
function laptopItem(){const g=new THREE.Group();mesh(new THREE.BoxGeometry(.44,.3,.025),lam('#cfd2d8'),0,0,0,g);
 mesh(new THREE.PlaneGeometry(.12,.12),bas('#fff',{map:ctex(64,64,(x)=>{x.fillStyle='#cfd2d8';x.fillRect(0,0,64,64);BRD.paint(x,'apple',8,8,48)},1)}),0,0,.0135,g);return g}
function bagItem(id){const g=new THREE.Group(),lv=id=='lv',tx=ctex(128,96,(x,W,H)=>{if(lv){x.fillStyle='#5a3a22';x.fillRect(0,0,W,H);x.fillStyle='#d8b45e';x.font='bold 14px Georgia';for(let i=0;i<7;i++)for(let j=0;j<5;j++)x.fillText(j%2?'LW':'*',10+i*20+(j%2)*8,12+j*20)}else{x.fillStyle='#14683f';x.fillRect(0,0,W,H);x.fillStyle='#c8202c';x.fillRect(0,H*.4,W,H*.1);x.fillStyle='#14683f';x.fillRect(0,H*.5,W,H*.1);x.fillStyle='#c8202c';x.fillRect(0,H*.6,W,H*.1);x.strokeStyle='#e2c06a';x.lineWidth=2;for(let i=0;i<5;i++){x.beginPath();x.arc(14+i*26,16,8,0,7);x.stroke()}x.fillStyle='#e2c06a';x.font='bold 12px Georgia';x.textAlign='center';x.fillText('GUCHI',W/2,H*.88)}},1);
 mesh(new THREE.BoxGeometry(.34,.24,.14),lam('#ffffff',{map:tx}),0,-.14,0,g);mesh(new THREE.BoxGeometry(.35,.04,.15),lam(lv?'#c8a078':'#e2c06a'),0,-.04,0,g);
 const h=mesh(new THREE.TorusGeometry(.085,.012,6,12,Math.PI),lam(lv?'#c8a078':gold),0,0,0,g);mesh(new THREE.BoxGeometry(.06,.05,.012),lam(gold),0,-.1,.075,g);return g}
function sneakerItem(col,sole,acc,swoosh){const g=new THREE.Group(),b=(w,h,d,c,x,y,z)=>{const m=mesh(new THREE.BoxGeometry(w,h,d),lam(c),x,y,z,g);return m};
 b(.13,.04,.34,sole,0,0,.02);b(.12,.09,.28,col,0,.065,0);b(.12,.08,.1,col,0,.11,-.1);b(.11,.05,.1,acc,0,.05,.12);b(.1,.02,.06,'#fff',0,.1,.04);if(swoosh){const m=b(.01,.025,.14,'#16161a',.063,.07,0);m.rotation.x=.35;const m2=m.clone();m2.position.x=-.063;g.add(m2)}return g}
function glassesItem(c){const g=new THREE.Group(),b=(w,h,d,col,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),lam(col),x,y,z,g);b(.34,.03,.02,c,0,.03,0);[-.09,.09].forEach(x=>{b(.12,.08,.02,'#101014',x,0,0);b(.13,.01,.03,c,x,.045,0)});b(.02,.02,.14,c,-.17,.03,-.07);b(.02,.02,.14,c,.17,.03,-.07);return g}
function phonesItem(c){const g=new THREE.Group(),b=(w,h,d,col,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),lam(col),x,y,z,g);b(.34,.025,.06,'#1d1d22',0,.14,0);[-1,1].forEach(q=>{b(.06,.17,.15,c,q*.17,.04,0);b(.02,.1,.1,'#fff',q*.2,.04,0);b(.025,.14,.025,'#1d1d22',q*.16,.11,0)});return g}
function clothItem(col,id,txt){const g=new THREE.Group();mesh(new THREE.BoxGeometry(.4,.06,.32),lam(col),0,0,0,g);mesh(new THREE.BoxGeometry(.4,.05,.3),lam(col),0,.055,0,g);
 mesh(new THREE.PlaneGeometry(.2,.1),bas('#fff',{map:ctex(128,64,(x,W,H)=>{x.fillStyle=id=='supreme'?'#d4202c':col;x.fillRect(0,0,W,H);x.fillStyle='#fff';x.font='italic bold 26px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(txt||'',W/2,H/2)})}),0,.083,.02,g).rotation.x=-Math.PI/2;return g}
function jeansItem(){const g=new THREE.Group();[-1,1].forEach(q=>{mesh(new THREE.BoxGeometry(.18,.07,.38),lam('#3a64a8'),q*.1,0,0,g);mesh(new THREE.BoxGeometry(.18,.02,.04),lam('#c8d8f0'),q*.1,.04,.18,g)});mesh(new THREE.BoxGeometry(.4,.04,.08),lam('#2f5a9a'),0,.05,-.14,g);mesh(new THREE.BoxGeometry(.04,.03,.01),lam('#e8a020'),.14,.05,-.1,g);return g}
BRD.item3d=function(id){try{switch(id){
 case'converse':return sneakerItem('#d4202c','#f4f1ea','#f4f1ea');case'monster':case'pepsi':return canItem(id);case'cocacola':return bottleItem();
 case'rayban':return glassesItem('#d71920');case'supreme':return clothItem('#d4202c','supreme','Supremo');case'levis':return jeansItem();case'beats':return phonesItem('#6a2bd9');
 case'adidas':return sneakerItem('#f4f4f4','#16161a','#16161a');case'samsung':return phoneItem();case'nike':return sneakerItem('#ff6a00','#f4f4f1','#16161a',1);
 case'gucci':case'lv':return bagItem(id);case'apple':return laptopItem()}}catch(e){console.warn('item3d',e)}return new THREE.Group()};

/* what you wear (wear) or hold in the right hand (hold: arm direction and where the hand is) */
const lgs=o=>o.legs||[];
function shoes(o,x,col,sole,acc,sw){const{w,d}=x;lgs(o).forEach((p,i)=>{const s=i?1:-1;B(p,w*.5,.27,d*.9+.16,col,0,-.36,.06);B(p,w*.53,.05,d*.95+.2,sole,0,-.475,.06);B(p,w*.4,.1,.12,acc,0,-.42,d*.45+.1);if(sw){const m=B(p,.02,.04,.2,'#16161a',s*w*.26,-.36,0);m.rotation.x=.4}else B(p,.02,.1,.1,acc,s*w*.26,-.34,0)})}
function cap(x,col,vis){const h=x.hd;if(!h)return;B(h,.64,.16,.64,col,0,.36,0);B(h,.64,.04,.34,vis||dk(col,.8),0,.3,.42)}
function chest(x,id,bg,size,y,xo){const t=ctex(64,64,(c)=>{c.fillStyle=bg;c.fillRect(0,0,64,64);BRD.paint(c,id,4,4,56)},1),m=mesh(new THREE.PlaneGeometry(size,size),bas('#fff',{map:t}),xo||0,y||.88,x.d/2+.03,x.g);return m}
function jacket(o,x,col,stripe){const{w,d,g}=x;B(g,w+.06,.6,d+.06,col,0,.8,0);if(stripe)[-1,1].forEach(s=>B(g,.03,.6,d+.08,stripe,s*(w/2-.04),.8,0));(o.arms||[]).forEach((p,i)=>{B(p,.2,.26,.25,col,0,-.13,0);if(stripe)B(p,.02,.26,.26,stripe,(i?1:-1)*.1,-.13,0)})}
const PR={
 converse:{k:'wear',n:'Hi-top sneakers',f:(o,x)=>shoes(o,x,'#d4202c','#f4f1ea','#f4f1ea')},
 monster:{k:'hold',n:'Monstar can',item:canItem,dir:[.3,.55,.78],off:[0,-.5,.02]},
 rayban:{k:'wear',n:'Ray-Bam sunglasses',f:(o,x)=>{const h=x.hd;if(!h)return;B(h,.62,.05,.03,'#d71920',0,.1,.3);[-1,1].forEach(s=>{B(h,.17,.11,.03,'#101014',s*.13,.05,.3);B(h,.19,.02,.035,'#d71920',s*.13,.11,.3);B(h,.03,.04,.3,'#d71920',s*.31,.08,.15)})}},
 supreme:{k:'wear',n:'Box-logo hoodie and cap',f:(o,x)=>{const{w,d,g}=x;jacket(o,x,'#d4202c');B(g,w*.8,.18,.22,'#b01822',0,1.12,-d/2);cap(x,'#d4202c');const t=ctex(128,48,(c,W,H)=>{c.fillStyle='#d4202c';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font='italic bold 28px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('Supremo',W/2,H/2)});mesh(new THREE.PlaneGeometry(.3,.11),bas('#fff',{map:t}),0,.85,d/2+.04,g)}},
 levis:{k:'wear',n:'Leevi\'s jeans and jacket',f:(o,x)=>{const{w,d,g}=x,dn=lam('#3a64a8');lgs(o).forEach((p,i)=>{if(p.children[0]&&p.children[0].material)p.children[0].material=dn;B(p,w*.44,.04,d*.82,'#c8d8f0',0,-.4,0);B(p,.03,.06,.02,'#e8a020',(i?-1:1)*w*.18,-.05,d*.4+.01)});B(g,w+.08,.5,d+.08,'#3a64a8',0,.85,0);B(g,w*.5,.06,.02,'#e8c060',0,.62,d/2+.05);(o.arms||[]).forEach(p=>B(p,.2,.28,.25,'#3a64a8',0,-.14,0))}},
 beats:{k:'wear',n:'Beatz headphones',f:(o,x)=>{const h=x.hd;if(!h)return;B(h,.64,.07,.14,'#1d1d22',0,.34,0);[-1,1].forEach(s=>{B(h,.1,.24,.24,'#6a2bd9',s*.33,.02,0);B(h,.03,.16,.16,'#fff',s*.39,.02,0)})}},
 pepsi:{k:'hold',n:'Pepzi can',item:canItem,dir:[.3,.55,.78],off:[0,-.5,.02]},
 adidas:{k:'wear',n:'Adadas tracksuit',f:(o,x)=>{jacket(o,x,'#16161a','#ffffff');lgs(o).forEach((p,i)=>{B(p,.03,.42,x.d*.84,'#fff',(i?1:-1)*x.w*.22,-.21,0)});shoes(o,x,'#f4f4f4','#16161a','#16161a');chest(x,'adidas','#16161a',.16,.98,.15)}},
 cocacola:{k:'hold',n:'Koka-Cola bottle',item:bottleItem,dir:[.3,.7,.6],off:[0,-.5,.02]},
 samsung:{k:'hold',n:'Samsong phone',item:phoneItem,dir:[.18,.3,.95],off:[0,-.5,.08]},
 nike:{k:'wear',n:'Nyke shoes and tee',f:(o,x)=>{shoes(o,x,'#ff6a00','#f4f4f1','#16161a',1);chest(x,'nike','#f4f4f1',.2,.9);const h=x.hd;if(h)B(h,.58,.07,.58,'#ff6a00',0,.2,0)}},
 gucci:{k:'hold',n:'Guchi handbag',item:()=>bagItem('gucci'),dir:[.25,-.75,.6],off:[0,-.52,0]},
 apple:{k:'hold',n:'Appel laptop',item:laptopItem,dir:[.5,-.2,.8],off:[.04,-.5,.12]},
 lv:{k:'hold',n:'Lewis Vitton bag',item:()=>bagItem('lv'),dir:[.25,-.75,.6],off:[0,-.52,0]}};
BRD.shootProduct=id=>PR[id];

/* ---------- the face ---------- */
function applyFace(hd,cfg,e){if(!hd)return;const sk=SKIN[cfg.skin%SKIN.length]||'#d99a6c',mc='#7a2b2b',dr='#4a1010',bc='#2a1a10';
 hd.children.slice().forEach(m=>{const p=m.position;if(p.z>.274&&p.z<.292&&p.y<-.08&&p.y>-.21&&Math.abs(p.x)<.25)m.visible=false});
 const F=(w,h,x,y,c,z)=>B(hd,w,h,.02,c,x,y,z||.29),br=(x,y,r)=>{const m=B(hd,.15,.03,.02,bc,x,y,.293);m.rotation.z=r};
 const smile=()=>{F(.2,.04,0,-.15,mc);F(.04,.04,-.12,-.12,mc);F(.04,.04,.12,-.12,mc)};
 if(e==0){smile();br(-.13,.15,0);br(.13,.15,0)}
 else if(e==1){F(.2,.12,0,-.15,dr);F(.2,.035,0,-.1,'#fff',.295);F(.1,.04,0,-.19,'#e56',.295);[-1,1].forEach(s=>{F(.16,.07,s*.13,.08,sk,.3);F(.15,.025,s*.13,.045,'#111',.305);F(.08,.05,s*.2,-.06,'#ff9a9a',.29);br(s*.13,.18,-s*.15)})}
 else if(e==2){F(.15,.04,.03,-.14,mc);F(.04,.05,.12,-.11,mc);br(-.13,.14,0);br(.13,.19,.2)}
 else if(e==3){F(.16,.03,0,-.15,mc);br(-.13,.15,-.3);br(.13,.15,.3)}
 else if(e==4){[-1,1].forEach(s=>F(.16,.06,s*.13,.075,sk,.3));F(.15,.04,0,-.15,mc);F(.04,.04,.1,-.13,mc);br(-.13,.13,0);br(.13,.13,0)}
 else if(e==5){F(.09,.13,0,-.17,dr);br(-.13,.2,.12);br(.13,.2,-.12)}
 else if(e==6){smile();F(.17,.13,.13,.04,sk,.3);F(.15,.03,.13,.03,'#111',.305);br(-.13,.15,0);br(.13,.19,-.1)}
 else{F(.08,.07,0,-.15,'#c0504d');[-1,1].forEach(s=>{F(.08,.05,s*.2,-.07,'#ff9a9a');br(s*.13,.15,0)})}}

/* ---------- the pose ---------- */
function applyPose(o,pp,hold){const g=o.g,hd=igxHead(g),Lm=o.arms[0],Rm=o.arms[1],q=pp.lg||[0,0,0,0];
 igxAim(Lm,pp.L);igxAim(Rm,hold?hold.dir:pp.R);o.legs[0].rotation.set(q[0],0,q[1]);o.legs[1].rotation.set(q[2],0,q[3]);
 g.rotation.set(0,pp.ry||0,pp.lean||0);if(hd)hd.rotation.set(pp.hx||0,pp.hy||0,pp.hz||0);
 const mx=Math.max(Math.abs(q[0]),Math.abs(q[1]),Math.abs(q[2]),Math.abs(q[3]));g.position.y=(pp.y||0)-(pp.sit?0:.5*(1-Math.cos(mx)));
 if(pp.fg&&!hold){const sk=SKIN[0],S2=SKIN[cfgSkin%SKIN.length];[-1,1].forEach(s=>{const f=B(Rm,.035,.13,.035,S2,s*.03,-.62,0);f.rotation.z=-s*.25})}}
let cfgSkin=0;
function holdPlace(o,prod,spec){const R=o.arms[1],qa=new THREE.Quaternion(),qd=new THREE.Quaternion();o.g.updateMatrixWorld(true);R.getWorldQuaternion(qa);R.add(prod);prod.position.set(spec.off[0],spec.off[1],spec.off[2]);prod.quaternion.copy(qa).invert().multiply(qd)}

/* ---------- the studio ---------- */
function cycGeo(){const rows=[];for(let z=9;z>=-3;z-=2)rows.push([0,z]);for(let a=10;a<=90;a+=10){const r=a*Math.PI/180;rows.push([2.6-Math.cos(r)*2.6,-3-Math.sin(r)*2.6])}rows.push([9,-5.6]);
 const hw=11,pos=[],idx=[];rows.forEach(r=>pos.push(-hw,r[0],r[1],hw,r[0],r[1]));for(let i=0;i<rows.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
function skyTex(){return ctex(512,320,(x,W,H)=>{const q=x.createLinearGradient(0,0,0,H);q.addColorStop(0,'#0a1030');q.addColorStop(1,'#6a3f88');x.fillStyle=q;x.fillRect(0,0,W,H);const r=rnd(5);for(let i=0;i<60;i++){x.fillStyle=r()<.5?'#fff':'#ffffff80';x.fillRect(r()*W,r()*H*.5,2,2)}let cx=0;while(cx<W){const w=24+r()*40,h=60+r()*150;x.fillStyle='#15182e';x.fillRect(cx,H-h,w,h);for(let yy=H-h+8;yy<H-6;yy+=12)for(let xx=cx+5;xx<cx+w-6;xx+=10)if(r()<.5){x.fillStyle=r()<.8?'#ffd98a':'#9ad0ff';x.fillRect(xx,yy,5,6)}cx+=w+2}x.fillStyle='#101218';x.fillRect(0,0,W,8);x.fillRect(0,H-8,W,8);x.fillRect(0,0,8,H);x.fillRect(W-8,0,8,H);x.fillRect(W/2-4,0,8,H);x.fillRect(0,H*.45,W,6)})}
function wallTex(id,b){const c=pcol(id);return ctex(1024,640,(x,W,H)=>{x.fillStyle=igxMix(c,'#ffffff',.55);x.fillRect(0,0,W,H);x.globalAlpha=.16;for(let j=0;j<4;j++)for(let i=0;i<7;i++)BRD.paint(x,id,i*150+(j%2)*75-20,j*170+10,110);x.globalAlpha=1;x.fillStyle='#ffffffe6';x.fillRect(W/2-200,60,400,400);BRD.paint(x,id,W/2-180,80,360);
  x.fillStyle=c;x.fillRect(0,H-120,W,120);x.fillStyle='#fff';let fs=72;x.font='bold '+fs+'px Arial';while(x.measureText(b.n.toUpperCase()).width>W-60&&fs>20){fs-=4;x.font='bold '+fs+'px Arial'}x.textAlign='center';x.textBaseline='middle';x.fillText(b.n.toUpperCase(),W/2,H-58)},1)}
function neonTex(id,b){const c=pcol(id);return ctex(256,160,(x,W,H)=>{x.fillStyle='#0c0c10';x.fillRect(0,0,W,H);x.strokeStyle=c;x.lineWidth=6;x.shadowColor=c;x.shadowBlur=14;x.strokeRect(12,12,W-24,H-24);x.shadowBlur=0;BRD.paint(x,id,W/2-44,18,88);x.fillStyle=c;x.font='bold 22px Arial';x.textAlign='center';x.fillText(b.n.toUpperCase(),W/2,H-24)},1)}
function umbrella(par,kx,ky,kz,col){const st=new THREE.Group();st.position.set(kx,0,kz);par.add(st);const mt=lam('#222226');
 cyl(.025,.025,ky,6,mt,0,ky/2,0,st);for(let i=0;i<3;i++){const a=i*2.094+.5,l=mesh(new THREE.BoxGeometry(.04,.04,.9),mt,Math.sin(a)*.4,.18,Math.cos(a)*.4,st);l.rotation.y=a;l.rotation.x=-.35*0}
 const u=new THREE.Group();u.position.set(0,ky,0);st.add(u);u.lookAt(new THREE.Vector3(-kx,1.1-ky,-kz).add(u.position).add(st.position));
 const c1=mesh(new THREE.ConeGeometry(.95,.5,16,1,true),lam('#0e0e10',{side:THREE.FrontSide}),0,0,-.25,u);c1.rotation.x=-Math.PI/2;
 const c2=mesh(new THREE.ConeGeometry(.92,.48,16,1,true),bas(col,{side:THREE.BackSide}),0,0,-.25,u);c2.rotation.x=-Math.PI/2;cyl(.02,.02,.5,6,mt,0,0,-.7,u).rotation.x=Math.PI/2}
function makeStudio(S3,P,id,b){
 const W=S3.gW;killList(S3.ownW);own=S3.ownW;while(W.children.length)W.remove(W.children[0]);
 const bg=P.g,c=pcol(id),cyc=bg==0?igxMix(c,'#ffffff',.6):bg==1?'#e8e8ea':bg==2?'#18181b':bg==3?c:'#1b1d33';
 const cm=mesh(cycGeo(),lam(cyc,{side:THREE.DoubleSide}),0,0,0,W);cm.receiveShadow=true;
 if(bg==0)mesh(new THREE.PlaneGeometry(5.8,3.6),bas('#fff',{map:wallTex(id,b)}),0,4.5,-5.52,W);
 if(bg==4){mesh(new THREE.PlaneGeometry(8,5),bas('#fff',{map:skyTex()}),0,5.1,-5.5,W)}
 if(bg==3||bg==2){mesh(new THREE.PlaneGeometry(2.6,2.6),bas('#fff',{map:ctex(64,64,x=>{x.fillStyle=bg==2?'#18181b':c;x.fillRect(0,0,64,64);BRD.paint(x,id,4,4,56)},1)}),0,4.3,-5.5,W)}
 /* gaffer tape marks under the feet, stands, sandbags and boxes */
 [[0,0,.5,.03],[0,0,.03,.5]].forEach(q=>mesh(new THREE.BoxGeometry(q[2],.005,q[3]),bas('#ffd84a'),q[0],.003,q[1]+.0,W));
 const g1=(w,h,d,col,x,y,z)=>{const m=mesh(new THREE.BoxGeometry(w,h,d),lam(col),x,y,z,W);m.castShadow=true;return m};
 const fx=P.ks==0?3.6:-3.6;cyl(.02,.02,2.2,6,lam('#222'),fx,1.1,-1,W);const rf=cyl(.8,.8,.03,20,lam('#f2f2f2'),fx,2.0,-1,W);rf.rotation.x=Math.PI/2;rf.rotation.z=.3;rf.rotation.y=fx>0?-.7:.7;rf.castShadow=true;
 g1(.5,.18,.3,'#2a2a2e',2.6,.09,-2.2);g1(.5,.18,.3,'#2a2a2e',2.1,.09,-2.4);g1(.7,.6,.5,'#c9a46a',-2.8,.3,-2.6);g1(.7,.4,.5,'#c9a46a',-2.8,.8,-2.6);
 g1(.4,.03,3,'#111',1.2,.015,1.2);g1(.4,.03,2,'#111',-1.8,.015,-.2).rotation.y=.4;
 const mn=g1(.55,.34,.05,'#111',-3.4,1.25,-2.0);cyl(.015,.015,1.2,6,lam('#222'),-3.4,.6,-2.0,W);mesh(new THREE.PlaneGeometry(.5,.3),bas('#7ab8ff'),-3.4,1.25,-1.97,W);
 if(P.pp==1||POSES[P.p].sit){cyl(.3,.3,.04,16,lam('#222226'),0,.48,0,W);cyl(.04,.04,.46,6,lam('#888'),0,.23,0,W);cyl(.22,.26,.03,16,lam('#888'),0,.02,0,W).castShadow=true}
 if(P.pp==2)[[-2.4,.6],[2.5,.2]].forEach(q=>{cyl(.3,.24,.45,10,lam('#8a5a3a'),q[0],.22,q[1],W);[0,1,2,3,4].forEach(i=>{const l=mesh(new THREE.SphereGeometry(.28,6,5),lam(['#2f7a4a','#3fa66a','#4a9a5a'][i%3]),q[0]+Math.sin(i*1.9)*.2,.8+i*.17,q[1]+Math.cos(i*1.9)*.2,W);l.scale.set(1,1.3,1);l.castShadow=true})});
 if(P.pp==3)mesh(new THREE.PlaneGeometry(1.6,1),bas('#fff',{map:neonTex(id,b)}),-2.7,3.4,-5.45,W);
 own=null}
function makeGear(S3,P,id){killList(S3.ownG);own=S3.ownG;const G=S3.gG;while(G.children.length)G.remove(G.children[0]);
 const L=LP[P.l],kx=[-1.7,.9,1.7][P.ks],kz=[-.9,3.2,-.9][P.ks],ky=[1.7,2.6,3.5][P.kh];umbrella(G,kx,ky,kz,L.key);own=null;S3.kpos=new THREE.Vector3(kx,ky,kz+(P.ks==1?0:2.8))}
function makeChar(S3,P,cfg,id){killList(S3.ownC);own=S3.ownC;const G=S3.gC;while(G.children.length)G.remove(G.children[0]);cfgSkin=cfg.skin|0;
 const o=igxChar(cfg,true),pp=POSES[P.p%POSES.length],pr=PR[id],use=P.pr&&pr,w=.42+(cfg.body||0)*.5,d=.3+(cfg.body||0)*.28,hd=igxHead(o.g),x={w,d,hd,g:o.g,id};
 applyFace(hd,cfg,P.e);if(use&&pr.k=='wear')try{pr.f(o,x)}catch(e){console.warn('wear',e)}
 applyPose(o,pp,use&&pr.k=='hold'?pr:null);
 if(use&&pr.k=='hold'){const it=pr.item(id);it.traverse(m=>{if(m.isMesh)m.castShadow=true});holdPlace(o,it,pr)}
 G.add(o.g);o.g.traverse(m=>{if(m.isMesh)m.castShadow=true});const bb=new THREE.Box3().setFromObject(o.g);S3.top=Math.max(1.2,bb.max.y);own=null}
function applyLights(S3,P){const L=LP[P.l],k=P.ki/100,f=P.fi/100;S3.amb.color.set(L.amb);S3.amb.intensity=L.ai*(.55+f*.7);S3.key.color.set(L.key);S3.key.intensity=L.ki*k;S3.key.position.copy(S3.kpos);S3.key.target.position.set(0,1,0);
 S3.fill.color.set(L.fill);S3.fill.intensity=.2+f*.55;S3.fill.position.set(P.ks==0?3.5:-3.5,1.8,3);S3.rim.color.set(RIMS[P.rc]||L.rim);S3.rim.intensity=.9;S3.rim.position.set(P.ks==0?2:-2,2.6,-3.5)}
function applyCam(S3,P){const a=P.cy*Math.PI/180,d=P.cd,gy=S3.top||1.7,tg=gy*(.55+.23*clamp((5.4-d)/3,0,1));S3.cam.position.set(Math.sin(a)*d,P.ch,Math.cos(a)*d);S3.cam.lookAt(0,tg,0)}
function newScene(P,cfg,id){const b=BRD.by(id),sc=new THREE.Scene(),S3={sc,id,b,ownW:[],ownG:[],ownC:[],top:1.7};
 S3.cam=new THREE.PerspectiveCamera(32,4/5,.1,60);S3.gW=new THREE.Group();S3.gG=new THREE.Group();S3.gC=new THREE.Group();sc.add(S3.gW,S3.gG,S3.gC);
 S3.amb=new THREE.AmbientLight(0xffffff,.6);S3.key=new THREE.DirectionalLight(0xffffff,1);S3.key.castShadow=true;S3.key.shadow.mapSize.set(1024,1024);const sc2=S3.key.shadow.camera;sc2.left=-3.5;sc2.right=3.5;sc2.top=4;sc2.bottom=-2;sc2.near=.5;sc2.far=14;S3.key.shadow.bias=-.001;
 S3.fill=new THREE.DirectionalLight(0xffffff,.4);S3.rim=new THREE.DirectionalLight(0xffffff,.8);sc.add(S3.amb,S3.key,S3.key.target,S3.fill,S3.rim);
 makeGear(S3,P,id);makeStudio(S3,P,id,b);makeChar(S3,P,cfg,id);applyLights(S3,P);applyCam(S3,P);return S3}
function killScene(S3){killList(S3.ownW);killList(S3.ownG);killList(S3.ownC)}
function mkRenderer(w,h,keep){const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(w,h,false);r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;return r}
/* grade a rendered frame: mono, neon split tone, vignette, grain */
function grade(src,W,H,li,seed){const k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d');x.drawImage(src,0,0,W,H);
 if(li==3){const d=x.getImageData(0,0,W,H),a=d.data;for(let i=0;i<a.length;i+=4){let v=.3*a[i]+.59*a[i+1]+.11*a[i+2];v=clamp((v-128)*1.12+128,0,255);a[i]=a[i+1]=a[i+2]=v}x.putImageData(d,0,0)}
 else if(li==2){const q=x.createLinearGradient(0,0,W,0);q.addColorStop(0,'rgba(255,79,216,.16)');q.addColorStop(1,'rgba(79,240,255,.16)');x.fillStyle=q;x.fillRect(0,0,W,H)}
 const v=x.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=v;x.fillRect(0,0,W,H);
 const r=rnd(seed||3);for(let i=0;i<W*H/60;i++){x.fillStyle=r()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)';x.fillRect(r()*W,r()*H,1.5,1.5)}return k}
let OFF=null;
/* a shot drawn again from its saved setup (used for Instagrime posts and the final frame) */
BRD.render3d=function(s3,cfg,W,H){W=W||480;H=H||600;const P=Object.assign({},DEF,s3),id=s3.b||P.b;let S3=null;
 try{if(!OFF||OFF.r.getContext().isContextLost()){OFF={r:mkRenderer(W,H)}}OFF.r.setSize(W,H,false);S3=newScene(P,cfg||ch,id);S3.cam.aspect=W/H;S3.cam.updateProjectionMatrix();OFF.r.render(S3.sc,S3.cam);
  const u=grade(OFF.r.domElement,W,H,P.l,P.seed).toDataURL('image/jpeg',.88);return u}
 finally{if(S3)killScene(S3)}};

/* ---------- the session ---------- */
let SH=null;
const css=document.createElement('style');css.textContent=`#b3{position:fixed;inset:0;z-index:9980;background:#0b0c0f;display:flex;color:#e8ebe9;font:13px system-ui,Segoe UI,sans-serif}#b3 *{box-sizing:border-box}
#b3 .b3s{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;padding:10px;background:radial-gradient(circle at 50% 40%,#23262c,#0b0c0f)}
#b3 .b3f{position:relative;height:min(100%,calc((100vw - 340px)*1.25));aspect-ratio:4/5;max-width:100%;border:3px solid #000;box-shadow:0 8px 40px #000a;background:#000;overflow:hidden;touch-action:none;cursor:grab}
#b3 canvas{width:100%;height:100%;display:block}#b3 .mono canvas{filter:grayscale(1) contrast(1.12)}#b3 .b3v{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 50%,#0000 55%,#0006 100%)}
#b3 .b3fl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}#b3 .b3fl.on{animation:b3fl .45s ease-out}@keyframes b3fl{0%{opacity:.95}100%{opacity:0}}
#b3 .b3t{position:absolute;left:8px;top:8px;background:#000a;border-radius:6px;padding:4px 9px;font-size:12px;pointer-events:none}#b3 .b3h{position:absolute;left:8px;right:8px;bottom:8px;background:#000b;border-radius:6px;padding:6px 9px;font-size:12px;min-height:30px;pointer-events:none}
#b3 .b3p{width:340px;max-width:100%;background:#14171a;border-left:2px solid #000;display:flex;flex-direction:column;min-height:0}#b3 .b3hd{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #2a2e33}#b3 .b3hd img{width:34px;height:34px;border-radius:50%;border:2px solid #000;image-rendering:pixelated}
#b3 .b3hd b{display:block;font-size:14px}#b3 .b3hd small{color:#9aa39f;font-size:11px}#b3 .b3tb{display:flex;border-bottom:1px solid #2a2e33}#b3 .b3tb button{flex:1;padding:8px 2px;background:none;border:0;color:#9aa39f;cursor:pointer;font:inherit;border-bottom:2px solid transparent}#b3 .b3tb button.on{color:#fff;border-bottom-color:var(--g,#2ee59d)}
#b3 .b3b{flex:1;overflow:auto;padding:10px 12px;min-height:0}#b3 .b3l{font-size:11px;color:#9aa39f;margin:10px 0 5px;text-transform:uppercase;letter-spacing:.5px}#b3 .b3l:first-child{margin-top:0}#b3 .b3c{display:flex;flex-wrap:wrap;gap:5px}
#b3 .b3c button{padding:5px 8px;background:#20252a;border:1px solid #333a40;border-radius:5px;color:#e8ebe9;cursor:pointer;font:inherit}#b3 .b3c button.on{background:var(--g,#2ee59d);color:#04120a;font-weight:700;border-color:transparent}#b3 .b3c button i{font-style:normal;color:#ffd84a;margin-left:3px}#b3 .b3c button.on i{color:#04120a}
#b3 input[type=range]{width:100%}#b3 .b3r{display:flex;align-items:center;gap:8px;margin:4px 0}#b3 .b3r span{width:78px;color:#9aa39f;font-size:12px}#b3 .b3f2{padding:10px 12px;border-top:1px solid #2a2e33}#b3 .b3th{display:flex;gap:6px;margin-bottom:8px}#b3 .b3th div{flex:1;aspect-ratio:4/5;border:2px solid #000;border-radius:4px;background:#0b0c0f;position:relative;overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#555}#b3 .b3th div.on{box-shadow:0 0 0 2px var(--g,#2ee59d)}#b3 .b3th img{width:100%;height:100%;object-fit:cover}#b3 .b3th b{position:absolute;left:3px;bottom:1px;font-size:10px;color:#ffd84a;text-shadow:1px 1px #000}
#b3 .b3a{display:flex;gap:6px}#b3 .b3a button{flex:1;padding:9px 4px;background:#20252a;border:1px solid #333a40;border-radius:6px;color:#fff;cursor:pointer;font:inherit}#b3 .b3a button.go{background:var(--g,#2ee59d);color:#04120a;font-weight:700}#b3 .b3a button:disabled{opacity:.4;cursor:default}
@media(max-width:760px){#b3{flex-direction:column}#b3 .b3s{flex:none;height:54vh;padding:6px}#b3 .b3f{height:100%}#b3 .b3p{width:100%;flex:1;border-left:0;border-top:2px solid #000}}`;document.head.appendChild(css);
const chip=(a,v,t,on,star)=>`<button data-a="${a}" data-v="${v}" class="${on?'on':''}">${t}${star?'<i>★</i>':''}</button>`;
const slider=(k,l,mn,mx,v)=>`<div class=b3r><span>${l}</span><input type=range data-s="${k}" min="${mn}" max="${mx}" value="${v}"></div>`;
function panel(){const P=SH.P,o=SH.o,b=BRD.by(o.b),pr=PR[o.b],t=SH.tab;let h='';
 if(t=='pose')h=`<div class=b3l>Pose · brief wants ${o.brief.mood}</div><div class=b3c>${POSES.map((q,i)=>chip('p',i,q.n,P.p==i,q.m==o.brief.mood)).join('')}</div>
  <div class=b3l>Your product</div><div class=b3c>${chip('pr',1,(pr?pr.k=='wear'?'Wear':'Hold':'')+': '+(pr?pr.n:'none'),P.pr)}${chip('pr',0,'No product',!P.pr)}</div>
  <div class=b3l style="text-transform:none">${b.n} wants to see its ${pr?pr.n.toLowerCase():'product'} in the frame.</div>`;
 else if(t=='face')h=`<div class=b3l>Expression</div><div class=b3c>${EXN.map((q,i)=>chip('e',i,q,P.e==i,EXM[i].includes(o.brief.mood))).join('')}</div><div class=b3l style="text-transform:none">A ★ means it suits the ${o.brief.mood} mood.</div>`;
 else if(t=='light')h=`<div class=b3l>Look · brief wants ${o.brief.light}</div><div class=b3c>${LIGHTS.map((q,i)=>chip('l',i,q,P.l==i,q==o.brief.light)).join('')}</div>
  <div class=b3l>Umbrella softbox</div><div class=b3c>${KSN.map((q,i)=>chip('ks',i,q,P.ks==i)).join('')}</div><div class=b3c style="margin-top:5px">${KHN.map((q,i)=>chip('kh',i,q,P.kh==i)).join('')}</div>
  <div class=b3l>Strength</div>${slider('ki','Key light',30,160,P.ki)}${slider('fi','Fill light',0,100,P.fi)}
  <div class=b3l>Rim light colour</div><div class=b3c>${RIMS.map((c,i)=>`<button data-a="rc" data-v="${i}" class="${P.rc==i?'on':''}" style="${c?'background:'+c+';color:#000':''}">${c?'&nbsp;&nbsp;':'Auto'}</button>`).join('')}</div>`;
 else if(t=='set')h=`<div class=b3l>Backdrop</div><div class=b3c>${BGN.map((q,i)=>chip('g',i,q,P.g==i)).join('')}</div><div class=b3l>Props</div><div class=b3c>${PPN.map((q,i)=>chip('pp',i,q,P.pp==i)).join('')}</div>
  <div class=b3l style="text-transform:none">The ${b.n} wall, the black or colour backdrops and the neon sign all put the logo in the frame.</div>`;
 else h=`<div class=b3l>Camera</div>${slider('cy','Turn',-70,70,P.cy)}${slider('ch','Height',15,300,Math.round(P.ch*100))}${slider('cd','Distance',24,95,Math.round(P.cd*10))}
  <div class=b3l>Quick framing</div><div class=b3c>${chip('cam','full','Full length')}${chip('cam','waist','Waist up')}${chip('cam','close','Close up')}</div><div class=b3c style="margin-top:5px">${chip('cam','low','Low angle')}${chip('cam','eye','Eye level')}${chip('cam','high','High angle')}</div>
  <div class=b3l style="text-transform:none">Drag the picture to orbit, scroll to zoom.</div>`;
 return h}
function mount(){const o=SH.o,b=BRD.by(o.b),d=document.createElement('div');d.id='b3';
 d.innerHTML=`<div class=b3s><div class=b3f id=b3f><canvas id=b3c></canvas><div class=b3v></div><div class=b3fl id=b3fl></div><div class=b3t id=b3t></div><div class=b3h id=b3h></div></div></div>
 <div class=b3p><div class=b3hd><img src="${BRD.logo(o.b,64)}"><div><b>${esc(b.n)} · campaign shoot</b><small>Brief: <span style="color:#ffd84a">${o.brief.mood}</span> mood, <span style="color:#ffd84a">${o.brief.light}</span> look · fee base $${o.pay.toLocaleString('en-US')}</small></div></div>
 <div class=b3tb id=b3tb>${[['pose','Pose'],['face','Face'],['light','Light'],['set','Set'],['cam','Camera']].map(q=>`<button data-a="tab" data-v="${q[0]}">${q[1]}</button>`).join('')}</div><div class=b3b id=b3b></div>
 <div class=b3f2><div class=b3th id=b3th></div><div class=b3a><button class=go id=b3go data-a="shoot">Shoot</button><button id=b3wr data-a="wrap" disabled>Wrap and post</button><button data-a="leave">Leave</button></div></div></div>`;
 document.body.appendChild(d);SH.root=d;
 d.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t||!SH)return;act(t.dataset.a,t.dataset.v)});
 d.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.s;if(!k||!SH)return;const v=+e.target.value,P=SH.P;if(k=='ki')P.ki=v;else if(k=='fi')P.fi=v;else if(k=='cy')P.cy=v;else if(k=='ch')P.ch=v/100;else if(k=='cd')P.cd=v/10;SH.dirty=1;if(k=='ki'||k=='fi')applyLights(SH.S3,P);else applyCam(SH.S3,P);hint()});
 const f=$e('b3f');let dr=null;
 f.addEventListener('pointerdown',e=>{dr={x:e.clientX,y:e.clientY};try{f.setPointerCapture(e.pointerId)}catch(_){}f.style.cursor='grabbing'});
 f.addEventListener('pointermove',e=>{if(!dr||!SH)return;const P=SH.P;P.cy=clamp(P.cy+(e.clientX-dr.x)*.3,-70,70);P.ch=clamp(P.ch-(e.clientY-dr.y)*.012,.15,3);dr={x:e.clientX,y:e.clientY};applyCam(SH.S3,P);SH.dirty=1;syncRanges()});
 f.addEventListener('pointerup',()=>{dr=null;f.style.cursor=''});f.addEventListener('wheel',e=>{if(!SH)return;e.preventDefault();const P=SH.P;P.cd=clamp(P.cd+e.deltaY*.004,2.4,9.5);applyCam(SH.S3,P);SH.dirty=1;syncRanges()},{passive:false});
 const r=mkRenderer(400,500);SH.r=r;r.domElement.id='b3c';f.replaceChild(r.domElement,$e('b3c'));
 const fit=()=>{if(!SH)return;const w=f.clientWidth,h=f.clientHeight,pr=Math.min(window.devicePixelRatio||1,1.5);r.setPixelRatio(pr);r.setSize(w,h,false);SH.dirty=1};
 SH.fit=fit;if(window.ResizeObserver){SH.ro=new ResizeObserver(fit);SH.ro.observe(f)}else window.addEventListener('resize',fit);fit()}
function syncRanges(){const P=SH.P,b=$e('b3b');if(!b)return;[['cy',P.cy],['ch',P.ch*100],['cd',P.cd*10]].forEach(([k,v])=>{const i=b.querySelector('[data-s='+k+']');if(i)i.value=v})}
function hint(){const P=SH.P,o=SH.o,t=$e('b3t'),h=$e('b3h');if(!t)return;const m=POSES[P.p].m==o.brief.mood,l=LIGHTS[P.l]==o.brief.light;
 t.textContent='Frame '+Math.min(4,SH.shots.length+1)+' of 4 · '+POSES[P.p].n+' · '+EXN[P.e]+' · '+LIGHTS[P.l]+' light';
 h.textContent=SH.msg||((m?'✔ Pose matches the brief. ':'✘ Pose mood is '+POSES[P.p].m+', brief wants '+o.brief.mood+'. ')+(l?'✔ Light matches. ':'✘ Light is '+LIGHTS[P.l]+', brief wants '+o.brief.light+'. ')+(P.pr?'✔ Product in frame.':'✘ No product.'))}
function draw(){const b=$e('b3b'),tb=$e('b3tb'),f=$e('b3f');if(!b)return;b.innerHTML=panel();tb.querySelectorAll('button').forEach(q=>q.classList.toggle('on',q.dataset.v==SH.tab));f.classList.toggle('mono',SH.P.l==3);thumbs();hint()}
function thumbs(){const t=$e('b3th');if(!t)return;let h='';for(let i=0;i<4;i++){const s=SH.shots[i];h+=s?`<div class="${i==SH.sel?'on':''}" data-a="sel" data-v="${i}"><img src="${s.u}"><b>${'★'.repeat(Math.max(1,Math.round(s.sc/20)))}</b></div>`:`<div>${i+1}</div>`}t.innerHTML=h;
 $e('b3go').disabled=SH.shots.length>=4;$e('b3wr').disabled=!SH.shots.length}
function rebuild(what){const S3=SH.S3,P=SH.P,id=SH.o.b;if(what=='char')makeChar(S3,P,ch,id);else if(what=='world'){makeStudio(S3,P,id,S3.b);makeChar(S3,P,ch,id)}else if(what=='gear'){makeGear(S3,P,id);applyLights(S3,P)}
 applyLights(S3,P);applyCam(S3,P);SH.msg='';SH.dirty=1;draw()}
const CAMS={full:{cd:5.4,ch:.8},waist:{cd:3.7,ch:1.0},close:{cd:2.7,ch:1.3},low:{ch:.3},eye:{ch:1.3},high:{ch:2.4}};
function act(a,v){const P=SH.P;v=isNaN(+v)?v:+v;try{snd('pop')}catch(e){}
 if(a=='tab'){SH.tab=v;draw()}
 else if(a=='p'){P.p=v;rebuild(POSES[v].sit&&P.pp==0?'world':'char')}
 else if(a=='pr'){P.pr=v;rebuild('char')}
 else if(a=='e'){P.e=v;rebuild('char')}
 else if(a=='l'){P.l=v;rebuild('gear')}
 else if(a=='ks'||a=='kh'){P[a]=v;rebuild(a=='ks'?'world':'gear');if(a=='ks')rebuild('gear')}
 else if(a=='rc'){P.rc=v;applyLights(SH.S3,P);SH.dirty=1;draw()}
 else if(a=='g'||a=='pp'){P[a]=v;rebuild('world')}
 else if(a=='cam'){Object.assign(P,CAMS[v]);applyCam(SH.S3,P);SH.dirty=1;draw()}
 else if(a=='sel'){SH.sel=v;SH.msg='Frame '+(v+1)+': '+SH.shots[v].msg+' ('+SH.shots[v].sc+'/100)';thumbs();hint()}
 else if(a=='shoot')shoot();else if(a=='wrap')wrap();else if(a=='leave')leave()}
function shoot(){if(!SH||SH.shots.length>=4)return;const P=SH.P,o=SH.o,pp=POSES[P.p],pr=PR[o.b];
 const mm=pp.m==o.brief.mood,lm=LIGHTS[P.l]==o.brief.light,ex=EXM[P.e].includes(o.brief.mood),prd=!!(P.pr&&pr),logo=P.g==0||P.g==2||P.g==3||P.pp==3;
 const sc=Math.min(100,30+(mm?25:0)+(lm?25:0)+(prd?10:0)+(logo?5:0)+(ex?3:0)+Math.floor(Math.random()*3)),bad=[];
 if(!mm)bad.push('pose mood is '+pp.m.toLowerCase()+' not '+o.brief.mood.toLowerCase());if(!lm)bad.push('lighting is '+LIGHTS[P.l].toLowerCase()+' not '+o.brief.light.toLowerCase());if(!prd)bad.push('the product is not in the shot');if(!logo)bad.push('the logo is not in the frame');
 const msg=bad.length?'Off-brief: '+bad.join(', ')+'.':'That is exactly the brief. Great frame.';
 SH.r.render(SH.S3.sc,SH.S3.cam);const k=document.createElement('canvas');k.width=200;k.height=250;k.getContext('2d').drawImage(grade(SH.r.domElement,200,250,P.l,SH.seed+SH.shots.length),0,0);
 const s3=Object.assign({},P,{b:o.b,seed:SH.seed+SH.shots.length*7});SH.shots.push({sc,u:k.toDataURL('image/jpeg',.8),msg,s3});SH.sel=SH.shots.length-1;SH.msg='Frame '+SH.shots.length+': '+msg+' ('+sc+'/100)';
 const f=$e('b3fl');if(f){f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}try{snd('chime')}catch(e){}thumbs();hint()}
function wrap(){if(!SH||!SH.shots.length)return;const o=SH.o,sh=SH.shots,sel=SH.sel;leave(1);BRD.wrapShoot(o,sh,sel)}
function leave(keep){if(!SH)return;const S=SH;SH=null;S.stop=1;try{S.ro&&S.ro.disconnect()}catch(e){}try{window.removeEventListener('resize',S.fit)}catch(e){}try{killScene(S.S3);S.r.dispose();S.r.forceContextLoss&&S.r.forceContextLoss()}catch(e){}if(S.root)S.root.remove();BRD.shootOn=0;if(!keep)closeUI()}
function loop(){if(!SH||SH.stop)return;if(SH.dirty){SH.dirty=0;try{SH.r.render(SH.S3.sc,SH.S3.cam)}catch(e){console.error('shoot render',e)}}requestAnimationFrame(loop)}
BRD.begin=function(o){if(!o||o.st!=1||SH)return;BRD.shootOn=1;mode='menu';try{$('ui').innerHTML=''}catch(e){}
 const P=Object.assign({},DEF);if(!PR[o.b])P.pr=0;SH={o,P,tab:'pose',shots:[],sel:0,seed:(Math.random()*1e6)|0,dirty:1,msg:''};
 try{mount();SH.S3=newScene(P,ch,o.b);draw();SH.dirty=1;loop();snd('chime')}catch(e){console.error('3D shoot',e);leave();say('The studio lights failed. Try again.')}};
{const c0=closeUI;closeUI=function(){if(SH)leave(1);return c0.apply(this,arguments)}}

/* Instagrime shows brand posts from their saved 3D setup */
{const pp0=postPic;postPic=function(p){try{if(p&&p.brand&&p.s3){if(PICS[p.id])return PICS[p.id];return PICS[p.id]=BRD.render3d(Object.assign({b:p.brand},p.s3),p.cfg||ch,480,600)}}catch(e){console.warn('brand 3d post',e)}return pp0.apply(this,arguments)}}
})();
