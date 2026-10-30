/* ---------- v49.28.0: tour city shops, outside and in, without the flicker ----------
   - Flicker: many shopfront and room parts were boxes whose faces sat exactly on another box's face (door posts on the
     step, window bars on the frames, bread on the shelves, the bike wheels...). Two faces in the same place fight and
     shimmer as the camera moves. While a city is being built every box is now grown by a different hair (2 to 11 mm), so
     no two faces ever share a plane.
   - Shopfronts: each shop gets a lit ledge under its windows showing what it sells, a door with a glass panel, a handle
     and an OPEN light, and a menu board, flower stand, fruit crate or bike on the pavement.
   - Rooms: wood, stone or checked floors, panelled lower walls with a rail, pendant lights and a rug by the door, so no
     room is a bare white box. (The florist's stand, fixed in 179, no longer piles its pots into each other.) */
(function(){
const D=window.DCITY;if(!D||typeof xgBox!='function')return;
const OX=D.OX,OZ=D.OZ;

/* ---------- 1. no two faces in the same place ---------- */
let INF=0;
{const xb0=xgBox;xgBox=function(G,w,h,d,col,x,y,z,ry,tc){if(INF){const e=((INF++%7)+1)*.0016;w+=e*2;h+=e*2;d+=e*2}return xb0.call(this,G,w,h,d,col,x,y,z,ry,tc)}}
{const a0=D.arrive;D.arrive=function(){INF=1;try{return a0.apply(this,arguments)}finally{INF=0}}}

/* ---------- small helpers ---------- */
const hsh=s=>{let h=7;for(const c of String(s))h=(h*31+c.codePointAt(0))>>>0;return h};
const rng=seed=>{let a=seed>>>0||1;return()=>{a^=a<<13;a>>>=0;a^=a>>17;a^=a<<5;a>>>=0;return a/4294967296}};
const DK=(c,k)=>{try{return dk(c,k)}catch(e){return c}};

/* what a shop sells, as coloured shapes for its window: [w,h,d,colour,dx,y] in the window's own frame */
const DISPLAY={
 bakery:r=>{const B=['#d9a441','#c98a5a','#e8c88a','#a8682b'];const o=[];for(let i=0;i<5;i++)o.push([.36,.16,.22,B[i%4],-1+i*.5,.95]);for(let i=0;i<4;i++)o.push([.3,.2,.2,B[(i+1)%4],-.75+i*.5,1.4]);o.push([.5,.3,.3,'#f4f0e8',.9,1.45],[.42,.12,.26,'#e86a8a',.9,1.66]);return o},
 flowers:r=>{const F=['#ff6ad5','#ffe066','#e03a3a','#b07aff','#ff8a30','#ffffff'];const o=[];for(let i=0;i<5;i++){const x=-1+i*.5;o.push([.3,.3,.3,'#8a9096',x,.95],[.05,.4,.05,'#3a8a4a',x,1.3],[.24,.18,.24,F[i%6],x,1.55])}return o},
 food:r=>[[.6,.04,.6,'#f4f0e8',-.6,.95],[.4,.08,.4,'#e8a040',-.6,1],[.6,.04,.6,'#f4f0e8',.6,.95],[.36,.1,.36,'#c0392b',.6,1.02],[.12,.4,.12,'#2a6a3a',0,1.1],[.14,.1,.14,'#c8ccd0',0,1.35]],
 cafe:r=>[[.24,.3,.24,'#f4f4f4',-.8,1.05],[.24,.3,.24,'#3a2414',-.4,1.05],[.5,.24,.4,'#8a5a32',.4,1],[.5,.08,.4,'#f4e8d0',.4,1.15],[.24,.2,.24,'#e86a8a',.9,1.02]],
 books:r=>{const C=['#c0392b','#2f6fb5','#2a8a4a','#e6b422','#8e44ad','#f4f0e8'];const o=[];for(let i=0;i<9;i++)o.push([.18,.5,.32,C[i%6],-1.1+i*.27,1.15]);o.push([.5,.6,.04,'#f4f0e8',.9,1.3]);return o},
 records:r=>{const C=['#ff3a9a','#3ad0ff','#ffd23d','#7aff6a','#b07aff'];const o=[];for(let i=0;i<5;i++)o.push([.5,.5,.04,C[i],-1.1+i*.55,1.2+(i%2)*.15]);o.push([.6,.06,.6,'#111',0,.95]);return o},
 pharm:r=>{const o=[];for(let i=0;i<6;i++)o.push([.2,.3,.2,['#f4f4f4','#3ab07a','#f4f4f4','#e84a3a','#3a8ae8','#f4f4f4'][i],-1+i*.4,1.05]);o.push([.5,.5,.04,'#2ecc71',.9,1.6],[.16,.4,.05,'#ffffff',.9,1.6],[.4,.16,.05,'#ffffff',.9,1.6]);return o},
 cloth:r=>[[.06,1.2,.06,'#c8ccd0',-.7,1.4],[.4,.5,.2,'#e84a6a',-.7,1.5],[.3,.5,.18,'#2a2a2a',-.7,.95],[.06,1.2,.06,'#c8ccd0',.7,1.4],[.4,.5,.2,'#3a6ab8',.7,1.5],[.3,.5,.18,'#d8c8a8',.7,.95],[.3,.12,.4,'#f4f4f4',0,.92],[.3,.12,.4,'#e8c040',0,1.06]],
 tech:r=>[[.9,.55,.06,'#111',-.5,1.35],[.82,.47,.02,'*6aa8e8',-.5,1.35],[.24,.4,.24,'#1a1a1e',.6,1.05],[.16,.16,.03,'#555',.6,1.1],[.26,.12,.1,'#2a2a2e',1,.95]],
 sweets:r=>{const C=['#f8c8d8','#fff0b0','#c8f0d8','#d8c8f8','#ffd8b0'];const o=[];for(let i=0;i<5;i++){o.push([.1,.26,.1,'#e8c88a',-1+i*.5,1.02],[.22,.22,.22,C[i],-1+i*.5,1.25])}return o},
 market:r=>{const P=['#e84a3a','#ffb030','#ffe066','#7ac84a','#8a3aa8'];const o=[];for(let i=0;i<4;i++){o.push([.5,.2,.4,'#c8a068',-.9+i*.6,.95]);for(let k=0;k<3;k++)o.push([.14,.12,.14,P[(i+k)%5],-1.04+i*.6+k*.14,1.1])}return o},
 souv:r=>[[.5,.36,.04,'#f4f0e6',-.8,1.4],[.26,.26,.26,'#cfe8f4',0,1.05],[.18,.06,.18,'#5a3a22',0,.92],[.4,.5,.06,'#e84a3a',.8,1.3]],
 conv:r=>{const C=['#e84a3a','#ffe066','#3a8ae8','#7ac84a','#ff8a30','#f4f4f4'];const o=[];for(let r2=0;r2<2;r2++)for(let i=0;i<6;i++)o.push([.24,.3,.2,C[(i+r2*2)%6],-1.1+i*.44,1.05+r2*.45]);return o},
 arcade:r=>[[.7,1.2,.4,'#1a1a26',-.5,1.4],[.56,.4,.02,'*ff3a9a',-.5,1.6],[.7,1.2,.4,'#1a1a26',.5,1.4],[.56,.4,.02,'*3ad0ff',.5,1.6]],
 beauty:r=>{const C=['#f8c8d8','#e8c040','#cfe8f4','#e84a6a','#b07aff'];const o=[[1.8,.06,.4,'#f8f0f4',0,1.2]];for(let i=0;i<5;i++)o.push([.14,.26,.14,C[i],-.8+i*.4,1.36]);return o},
 bikes:r=>[[.06,.6,.6,'#1a1a1a',-.5,1.25],[.06,.6,.6,'#1a1a1a',.5,1.25],[1,.06,.06,'#e84a3a',0,1.4],[.06,.4,.06,'#e84a3a',-.1,1.5]],
 spa:r=>[[.6,.12,.4,'#f4f4f4',-.6,.95],[.6,.12,.4,'#c8e0d8',-.6,1.08],[.1,.18,.1,'*ffb060',.3,1],[.1,.18,.1,'*ffb060',.6,1],[.5,.5,.5,'#3a8a4a',1,1.2]],
 laundry:r=>[[.7,.8,.5,'#e8ecf0',-.6,1.25],[.4,.4,.02,'#3a5a7a',-.6,1.25],[.7,.8,.5,'#e8ecf0',.4,1.25],[.4,.4,.02,'#3a5a7a',.4,1.25]],
 barber:r=>[[.5,.5,.5,'#c0392b',0,1.1],[.1,.3,.1,'#3a6ab8',-.8,1.05],[.1,.3,.1,'#e8c040',-.6,1.05],[.1,.3,.1,'#f4f4f4',.8,1.05]],
 bar:r=>{const o=[];for(let i=0;i<7;i++)o.push([.12,.4,.12,['#2a8a4a','#c8a040','#a83a3a','#e8e8e8','#3a6ab8'][i%5],-1+i*.33,1.1]);return o},
 cinema:r=>[[.8,1.1,.04,'#ffd23d',-.5,1.5],[.7,1,.02,'#1a2a6a',-.5,1.5],[.8,1.1,.04,'#ffd23d',.5,1.5],[.7,1,.02,'#6a1a2a',.5,1.5]],
 karaoke:r=>[[.12,.6,.12,'#c8ccd0',0,1.2],[.18,.22,.18,'#333',0,1.6],[.8,.5,.04,'*ff6ad5',0,2]],
 office:r=>[[.6,.6,.6,'#3a8a4a',-.8,1.2],[1,.3,.4,'#5a4a3a',.4,1]]};
const KIND_OF=sp=>{let k=sp&&sp.k;if(!k)return null;if(k=='rec')k='records';return DISPLAY[k]?k:null};

/* ---------- 2. shopfronts: window display, door and something on the pavement ---------- */
function front(C,G,Gw,dr,w){const k=KIND_OF(dr);if(!k)return;const fx=dr.face=='x',r=rng(hsh(C.id+'|'+dr.n+'|'+dr.x+'|'+dr.z));
 /* the door spot is 1.2 out from the shop wall; c is the wall, a runs along it */
 const c=fx?dr.x-1.2:dr.z-1.2,a=fx?dr.z:dr.x;
 /* T places a box in the shop's frame: along the wall (A), up (y) and out from the wall (O) */
 const T=(g,sa,sy,so,col,A,y,O)=>fx?xgBox(g,so,sy,sa,col,c+O,y,A):xgBox(g,sa,sy,so,col,A,y,c+O);
 /* a display ledge under each window, clear of the door posts and the planters, with the goods on it and a light above */
 const items=DISPLAY[k](r),i0=.85,i1=w/2-(w>=6?1.1:.5);
 if(i1-i0>.8)[-1,1].forEach(sg=>{const m=a+sg*(i0+i1)/2,len=i1-i0,sx=len/2.4;
  T(G,len,.7,.36,DK('#8a6a4a',1),m,.35,.3);T(G,len+.08,.06,.42,'#e8e0d0',m,.73,.3);T(Gw,len*.8,.04,.04,'#fff2c0',m,.75,.5);
  items.forEach(([iw,ih,id,col,dx,y])=>{const glow=String(col)[0]=='*',W=Math.min(iw*.8,len*.4);if(Math.abs(dx*sx)+W/2>len/2)return;
   T(glow?Gw:G,W,ih*.8,Math.min(id,.26),glow?col.slice(1):col,m+dx*sx,.76+(y-.9)*.8+ih*.4,.3)})});
 /* the door: a dark leaf with a glass panel, a brass handle, a kick plate and a lit OPEN sign */
 T(G,1.05,2.2,.05,'#3a2a20',a,1.1,.07);T(G,.8,1.25,.03,'#9ec8dc',a,1.5,.1);T(G,.06,.34,.06,'#d8c070',a+.36,1.1,.13);T(G,.9,.16,.03,'#a8a49c',a,.36,.1);
 T(Gw,.42,.14,.03,(C.s&&C.s.neon)||'#ff4f6a',a,1.98,.12);
 /* on the pavement, on one side of the door: an A-frame board for places to eat, a flower stand, a fruit crate, a bike */
 const pa=a+(r()<.5?-1:1)*1.25;
 if(/^(food|cafe|bakery|sweets|bar)$/.test(k)){T(G,.55,.8,.08,'#3a2414',pa,.42,1.62);T(G,.47,.6,.02,'#22302a',pa,.48,1.67);for(let l=0;l<3;l++)T(G,.34-l*.06,.03,.01,'#f4f1e8',pa,.66-l*.12,1.685);T(G,.55,.8,.08,'#3a2414',pa,.42,1.32)}
 else if(k=='flowers'){T(G,.9,.5,.5,'#8a5a32',pa,.25,1.45);['#ff6ad5','#ffe066','#e03a3a','#b07aff'].forEach((fc,j)=>{T(G,.18,.2,.18,'#8a9096',pa-.32+j*.21,.6,1.45);T(G,.16,.14,.16,fc,pa-.32+j*.21,.77,1.45)})}
 else if(k=='market'){T(G,.9,.4,.6,'#c8a068',pa,.2,1.5);['#e84a3a','#ffb030','#7ac84a'].forEach((fc,j)=>T(G,.22,.16,.22,fc,pa-.28+j*.28,.48,1.5))}
 else if(k=='bikes'){T(G,.06,.62,.62,'#1a1a1a',pa-.5,.32,1.5);T(G,.06,.62,.62,'#1a1a1a',pa+.5,.32,1.5);T(G,1,.06,.06,(C.s&&C.s.acc)||'#e84a3a',pa,.5,1.5);T(G,.3,.06,.12,'#2a2a2a',pa-.15,.82,1.5);T(G,.06,.4,.06,(C.s&&C.s.acc)||'#e84a3a',pa-.15,.64,1.5)}
}

/* the doors are listed by the city builder (C.doors); a shop's width is the gap to its neighbour on the same wall */
/* all the fronts of a city are merged into one set of meshes */
D.cityHooks.push(C=>{try{const drs=(C.doors||[]).filter(d=>d&&d.n),G=D.mkG(),Gw=D.mkG();
 drs.forEach(dr=>{try{if(!dr.k&&D.kindOf)dr.k=D.kindOf(C,dr);const fx=dr.face=='x',cw=fx?dr.x:dr.z,al=fx?dr.z:dr.x;
  let w=7;drs.forEach(o=>{if(o===dr||o.face!=dr.face)return;if(Math.abs((fx?o.x:o.z)-cw)>.05)return;const g=Math.abs((fx?o.z:o.x)-al);if(g>.5&&g<w)w=g});
  front(C,G,Gw,dr,w)}catch(e){console.error('shop front',e)}});
 const g=new THREE.Group();g.position.set(OX,0,OZ);scene.add(g);D.flushTo(G,g);D.flushTo(Gw,g,C.glowM);C.extra.push(g)}catch(e){console.error('shop fronts',e)}});

/* ---------- 3. rooms: floors, panelled walls, pendant lights and a rug ---------- */
/* floor: wood planks, stone tiles or nothing (carpets and checkers the room already has) */
const FLOOR={bakery:'wood',flowers:'wood',bar:'wood',market:'stone',books:'wood',records:'wood',cafe:'wood',food:'wood',souv:'wood',cloth:'wood',bikes:'stone',spa:'wood',office:'stone',barber:'check',laundry:'check'};
const RUG={bakery:'#a8543a',flowers:'#7a9a6a',books:'#7a1f2b',cafe:'#3a5a7a',souv:'#c0392b',cloth:'#2a2a3a',spa:'#c8a878',beauty:'#e8a8c4',office:'#3a3a40',tech:'#2a2e36',barber:'#2a2a2a',food:'#7a1f2b',records:'#3a1a4a',bikes:'#2a2a2a'};
const NOPANEL={arcade:1,karaoke:1,cinema:1};
function polishRoom(C,rm){const{x0,z0,w,d,key}=rm,o=rm.o||{},fl=o.floor||'#c8c4bc',wc=o.wall||'#e8e4dc',G=D.mkG(),Gw=D.mkG(),r=rng(hsh(C.id+key)),top=o.h||4;
 const box=(a,b,c2,col,x,y,z)=>xgBox(G,a,b,c2,col,x,y,z);
 /* floor pattern, just above the floor so it never fights it */
 const ft=FLOOR[key];
 if(ft=='wood'){const ln=DK(fl,.8),pw=.5;for(let z=z0+pw;z<z0+d-.05;z+=pw)D.quadY(G,x0,z-.015,x0+w,z+.015,.008,ln);
  let row=0;for(let z=z0;z<z0+d-.05;z+=pw,row++){const off=(row%3)*.9;for(let x=x0+off+.6;x<x0+w-.1;x+=2.7)D.quadY(G,x-.015,z,x+.015,Math.min(z+pw,z0+d),.009,ln)}}
 else if(ft=='stone'){const ln=DK(fl,.82);for(let x=x0+1;x<x0+w;x+=1)D.quadY(G,x-.02,z0,x+.02,z0+d,.008,ln);for(let z=z0+1;z<z0+d;z+=1)D.quadY(G,x0,z-.02,x0+w,z+.02,.009,ln)}
 else if(ft=='check'){for(let ix=0;ix<w;ix++)for(let iz=0;iz<d;iz++)if((ix+iz)%2)D.quadY(G,x0+ix+.03,z0+iz+.03,x0+ix+.97,z0+iz+.97,.007,DK(fl,.8))}
 /* panelled lower walls with a rail, on the back and left walls */
 if(!NOPANEL[key]){const pc=DK(wc,.9),rc=DK(wc,.72);box(w-.3,1,.03,pc,x0+w/2,.6,z0+.016);box(w-.3,.07,.07,rc,x0+w/2,1.12,z0+.035);box(.03,1,d-.3,pc,x0+.016,.6,z0+d/2);box(.07,.07,d-.3,rc,x0+.035,1.12,z0+d/2);
  for(let x=x0+1.2;x<x0+w-.6;x+=1.4)box(.05,.8,.02,rc,x,.62,z0+.04);for(let z=z0+1.2;z<z0+d-.6;z+=1.4)box(.02,.8,.05,rc,x0+.04,.62,z)}
 /* ceiling beams and pendant lights over the middle of the room */
 const n=Math.max(2,Math.round(w/4.5)),lamp=o.lamp||'#ffd890';
 for(let i=0;i<n;i++){const x=x0+w*(i+.5)/n,z=z0+d*.45;box(.03,.7,.03,'#2a2a2a',x,top-.35,z);box(.5,.22,.5,DK(o.dim||NOPANEL[key]?'#2a2a3a':'#3a3a3a',1),x,top-.8,z);xgBox(Gw,.34,.06,.34,lamp,x,top-.93,z)}
 /* a rug in front of the door */
 const rc2=RUG[key];if(rc2){const rw=Math.min(3.2,w*.3),rd=1.6,cx=x0+w/2,cz=z0+d-2.5;D.quadY(G,cx-rw/2,cz-rd/2,cx+rw/2,cz+rd/2,.011,rc2);D.quadY(G,cx-rw/2+.15,cz-rd/2+.15,cx+rw/2-.15,cz+rd/2-.15,.013,DK(rc2,1.3));D.quadY(G,cx-rw/2+.3,cz-rd/2+.3,cx+rw/2-.3,cz+rd/2-.3,.015,rc2)}
 const g=new THREE.Group();g.position.set(OX,0,OZ);scene.add(g);D.flushTo(G,g);D.flushTo(Gw,g,C.roomM||(C.roomM=new THREE.MeshBasicMaterial({vertexColors:true})));rm.extra.push(g)}
const SHOP_ROOMS=['bakery','laundry','barber','flowers','cinema','arcade','karaoke','bar','market','tech','sweets','spa','beauty','bikes','food','cafe','conv','souv','records','books','cloth','pharm','office'];
D.cityHooks.push(C=>{SHOP_ROOMS.forEach(k=>{const rm=C.rooms&&C.rooms[k];if(rm)try{polishRoom(C,rm)}catch(e){console.error('room polish '+k,e)}})});
})();
