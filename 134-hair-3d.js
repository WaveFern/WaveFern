/* ===== v43.2.0: more realistic 3D hair for the 19 classic styles =====
   The classic styles (NM.hair 1-19: Buzz to Long braids) are rebuilt here for the 3D character (buildChar): rounded
   domes instead of one flat slab, layers, strands, highlights and shadows in the hair colour, and real 3D locs, twists,
   braids and curls that hang and splay from the scalp. Dreads are ropes of twisted segments with banding, lighter tips
   and a few gold cuffs. The pixel portraits and small avatars are unchanged, the style index in ch.hair is unchanged,
   so saves keep their hair. Hats still tuck the hair (tuckHair runs on the pieces), then the pieces are merged into
   one mesh per colour, so a head of hair costs a few draw calls instead of dozens.
   Head space: the head is a .55 box centred on 0 (top .275, face at z .275, eyes at y .04, ears at x +-.3), the top of
   the torso is at y -.3 and its back is no further than z -.29. */
(()=>{
const V=THREE.Vector3,UP=new V(0,1,0),Q=new THREE.Quaternion(),Q2=new THREE.Quaternion(),TV=new V();
const r3=v=>Math.round(v*1000)/1000,hsh=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
function hairMk(h,c){
 const hc=c.hc_custom||HAIRC[c.hc%HAIRC.length],C={b:hc,m:dk(hc,.84),hl:dk(hc,1.45),sh:dk(hc,1.85),hd:dk(hc,.68),dd:dk(hc,.5)};
 const H=(w,y,d,x,yy,z,k,rx,ry,rz)=>{const m=B(h,r3(w),r3(y),r3(d),k||hc,x,yy,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);return m};
 /* one box from point a to point b, t thick, turned tw around its own length (alternating turns read as a twist) */
 const seg=(a,b,t,k,tw)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1e-3;
  const m=B(h,r3(t),r3(L+t*.3),r3(t),k||hc,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
  Q.setFromUnitVectors(UP,TV.set(dx/L,dy/L,dz/L));Q2.setFromAxisAngle(UP,tw||0);m.quaternion.copy(Q).multiply(Q2);return m};
 /* a rope through points, thickness from t0 to t1, colours cycling, every other piece turned 45 degrees */
 const rope=(P,t0,t1,ks,tip)=>{for(let i=0;i<P.length-1;i++){const f=i/Math.max(1,P.length-2),last=i==P.length-2;seg(P[i],P[i+1],t0+(t1-t0)*f,last&&tip?tip:ks[i%ks.length],i%2?Math.PI/4:0)}};
 /* a rounded scalp: a slab, a smaller slab on top and thin side and back shells */
 const dome=(k,y0,back,side)=>{H(.6,.12,.6,0,y0,0,k);H(.5,.05,.5,0,y0+.075,0,k);if(back)H(.6,back,.1,0,y0-.05-back/2+.06,-.28,k);if(side)[-1,1].forEach(s=>H(.07,side,.44,s*.3,y0-side/2+.05,-.04,k))};
 /* points round a rounded mass (a fibonacci sphere), skipping the face and underneath */
 const curls=(n,cx,cy,cz,rx,ry,rz,sz,skip)=>{for(let i=0;i<n;i++){const yv=1-2*(i+.5)/n,r=Math.sqrt(1-yv*yv),th=i*2.39996,x=cx+Math.cos(th)*r*rx,y=cy+yv*ry,z=cz+Math.sin(th)*r*rz;
  if(yv<-.4||(skip&&skip(x,y,z)))continue;const s=sz*(.85+hsh(i)*.35);H(s,s*.9,s,x,y,z,[C.b,C.hd,C.b,C.hl,C.m][i%5],hsh(i+7)*.8,hsh(i+3)*1.6,hsh(i+5)*.8)}};
 return{hc,C,H,seg,rope,dome,curls}}

const HR={
 1:({C,H})=>{/* buzz: a close shell that follows the head, darker at the sides, a crisp hairline */
  H(.58,.05,.58,0,.3,0);H(.48,.03,.48,0,.33,0);[-1,1].forEach(s=>H(.02,.2,.5,s*.286,.17,-.02,C.hd));H(.56,.3,.02,0,.12,-.286,C.hd);H(.5,.03,.02,0,.27,.286,C.dd);
  for(let i=0;i<8;i++)H(.04,.012,.04,-.2+hsh(i)*.4,.348,-.2+hsh(i+9)*.4,C.hl)},
 2:({C,H,dome})=>{/* short: rounded top, textured chunks, tapered back and a soft broken fringe */
  dome(C.b,.31,.3,.22);H(.58,.12,.08,0,.02,-.28,C.hd);[-1,1].forEach(s=>H(.03,.14,.06,s*.31,.08,.15,C.hd));
  for(let i=0;i<7;i++){const x=-.2+(i%4)*.13+(i>3?.065:0),z=-.15+(i>3?.16:0);H(.14,.07,.16,x,.395,z,i%3?C.b:C.m,-.25,hsh(i)*1.2,x*.8)}
  [-.2,-.1,0,.1,.2].forEach((x,i)=>H(.11,.1+(i*3%4)*.02,.06,x,.235-(i*3%4)*.01,.29,i%2?C.m:C.b,0,0,x*.6));H(.26,.02,.22,-.06,.43,-.02,C.hl);H(.02,.02,.3,.12,.42,0,C.hl)},
 3:({C,H,dome,seg})=>{/* spiky: short sides and sharp tapered spikes that lean out and forward */
  dome(C.b,.31,.28,.2);[[-.18,-.16],[0,-.18],[.18,-.16],[-.2,0],[0,0],[.2,0],[-.16,.16],[0,.18],[.16,.16],[-.08,.08],[.08,-.08]].forEach((q,i)=>{const[x,z]=q,l=.17+hsh(i)*.07,dx=x*1.5,dz=z*1.1+.12,n=Math.hypot(dx,1,dz);
   const a=[x,.36,z],m=[x+dx/n*l*.55,.36+l*.55/n,z+dz/n*l*.55],e=[x+dx/n*l,.36+l/n,z+dz/n*l];seg(a,m,.13,i%2?C.m:C.b);seg(m,e,.065,C.hl)});
  [-.2,-.07,.07,.2].forEach((x,i)=>H(.1,.09,.06,x,.24,.29,i%2?C.m:C.b,0,0,-x))},
 4:({C,H,seg})=>{/* mohawk: shaved sides and a tall ridge of blades that rises to the front */
  H(.58,.04,.58,0,.295,0,C.dd);[-1,1].forEach(s=>H(.02,.22,.5,s*.285,.16,-.02,C.dd));H(.56,.3,.02,0,.12,-.286,C.dd);
  for(let k=0;k<7;k++){const z=-.28+k*.093,hh=.14+k*.025,a=[0,.31,z],b=[0,.31+hh,z+.06];seg(a,b,.12-k*.003,k%2?C.m:C.b,.0001);seg(b,[0,.33+hh*1.25,z+.11],.06,C.hl,.0001)}
  H(.14,.24,.06,0,.12,-.3,C.b);H(.04,.02,.6,0,.33,0,C.hl)},
 5:({C,H,dome})=>{/* long: centre part, face-framing lengths to the shoulders, layered lengths down the back */
  dome(C.b,.31,0,0);H(.02,.02,.32,0,.385,.1,C.dd);[-1,1].forEach(s=>{H(.17,.06,.05,s*.13,.26,.29,C.b,0,0,s*.35);H(.08,.18,.06,s*.27,.15,.28,C.b);
   for(let i=0;i<4;i++){const y=.18-i*.14;H(.075,.16,.42-i*.03,s*(.31+i*.006),y,-.04-i*.01,i%2?C.m:C.b)}H(.07,.12,.12,s*.31,-.33,.14,C.m);H(.02,.6,.02,s*.35,-.05,.12,C.hl);H(.02,.5,.02,s*.35,-.02,-.16,C.hd)});
  for(let i=0;i<6;i++)H(.62+(i%2)*.02,.17,.13,0,.18-i*.15,-.3-(i%2)*.012,i%2?C.m:C.b);
  for(let i=0;i<7;i++){const x=-.26+i*.087,l=.08+hsh(i)*.1;H(.08,l,.1,x,-.72-l/2+.04,-.31,i%2?C.hd:C.b)}[-.2,-.06,.08,.21].forEach((x,i)=>H(.03,.7,.02,x,-.25,-.37,i%2?C.hl:C.hd))},
 6:({C,H,dome})=>{/* bob: rounded crown, blunt fringe, sides to the jaw that curve under at the ends */
  dome(C.b,.31,0,0);H(.52,.12,.06,0,.21,.29,C.b);H(.5,.02,.02,0,.15,.32,C.hd);[-1,1].forEach(s=>{H(.08,.4,.46,s*.31,.06,-.02,C.b);H(.09,.08,.44,s*.33,-.16,-.02,C.m,0,0,s*.25);H(.06,.14,.08,s*.26,.17,.27,C.b);H(.02,.34,.02,s*.355,.04,.12,C.hl)});
  H(.62,.42,.13,0,.06,-.3,C.b);H(.66,.09,.16,0,-.16,-.31,C.m);[-.18,0,.18].forEach((x,i)=>H(.03,.36,.02,x,.04,-.37,i%2?C.hl:C.hd));H(.3,.02,.3,0,.44,0,C.hl)},
 7:({C,H,dome,rope})=>{/* ponytail: hair combed back with comb lines, a tie, a full tail that tapers down the back */
  dome(C.b,.31,.3,.2);[-.16,-.05,.06,.17].forEach(x=>H(.02,.02,.56,x,.395,-.02,C.hd));H(.5,.06,.05,0,.27,.29,C.b);H(.16,.06,.06,0,.13,-.33,'#2a2a2a');
  rope([[0,.15,-.34],[0,.1,-.43],[0,-.04,-.46],[0,-.2,-.44],[0,-.36,-.4],[0,-.5,-.37]],.17,.07,[C.b,C.m],C.hl);H(.02,.4,.02,.04,-.12,-.53,C.hl)},
 8:({C,H,dome})=>{/* bun: hair combed up into a round coiled bun with a tie */
  dome(C.b,.31,.3,.2);[-.16,-.05,.06,.17].forEach(x=>H(.02,.02,.56,x,.395,-.02,C.hd));H(.5,.06,.05,0,.27,.29,C.b);
  H(.22,.04,.22,0,.42,-.06,'#2a2a2a');H(.28,.18,.28,0,.53,-.06,C.b);H(.2,.26,.2,0,.54,-.06,C.m);H(.32,.1,.18,0,.53,-.06,C.b);H(.18,.1,.32,0,.53,-.06,C.b);H(.12,.04,.12,0,.67,-.06,C.hl);H(.2,.03,.04,.02,.58,.08,C.hl,0,0,-.3)},
 9:({C,H,curls})=>{/* afro: a big round mass of tight curls, open over the face */
  H(.86,.36,.86,0,.42,-.02);H(.7,.5,.7,0,.42,-.02);H(.96,.26,.72,0,.36,-.04);H(.72,.26,.96,0,.36,-.06);H(.86,.5,.36,0,.14,-.25);[-1,1].forEach(s=>H(.14,.5,.5,s*.37,.12,-.05));
  curls(64,0,.36,-.03,.47,.36,.47,.15,(x,y,z)=>z>.16&&y<.22)},
 10:({C,H,dome,rope})=>{/* pigtails: centre part, two ties and two full tails that swing out and down */
  dome(C.b,.31,.3,.22);H(.02,.02,.56,0,.385,0,C.dd);[-1,1].forEach(s=>{H(.22,.06,.05,s*.12,.26,.29,C.b,0,0,s*.3);H(.08,.09,.09,s*.33,.1,-.05,'#e84a8a');
   rope([[s*.34,.11,-.05],[s*.43,.04,-.06],[s*.47,-.1,-.06],[s*.46,-.24,-.05],[s*.43,-.36,-.04]],.15,.07,[C.b,C.m],C.hl)})},
 11:({C,H})=>{/* quiff: faded sides and a big swept-up front */
  H(.58,.1,.58,0,.3,-.02,C.hd);[-1,1].forEach(s=>{H(.03,.1,.48,s*.286,.24,-.02,C.hd);H(.025,.14,.48,s*.284,.12,-.02,C.dd)});H(.56,.3,.03,0,.12,-.285,C.dd);
  H(.46,.1,.42,0,.37,-.06,C.b);H(.46,.16,.2,0,.43,.12,C.b,-.45);H(.42,.12,.16,0,.5,.21,C.m,-.75);H(.36,.06,.1,.02,.56,.26,C.hl,-.9);[-.14,0,.14].forEach(x=>H(.02,.02,.4,x,.425,-.02,C.hd));H(.2,.02,.3,-.06,.43,-.04,C.hl)},
 12:({C,H,seg,rope})=>{/* dreads: knotted roots on a sectioned scalp and thick twisted locs that fall over the sides and down the back */
  H(.6,.1,.6,0,.31,0,C.hd);H(.5,.05,.5,0,.37,0,C.hd);[-1,1].forEach(s=>H(.06,.24,.46,s*.29,.18,-.03,C.hd));H(.58,.32,.08,0,.14,-.27,C.hd);H(.5,.04,.04,0,.27,.285,C.dd);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=-.18+i*.12,z=-.18+j*.12;H(.1,.06,.1,x,.405,z,(i+j)%2?C.b:C.m,0,.78,0)}
  const cuff=new Set([3,9,16]);let n=0;
  const loc=(a,len,t)=>{const i=n++,ca=Math.sin(a),cz=Math.cos(a),R=.33/Math.max(Math.abs(ca),Math.abs(cz))+.02,sw=(hsh(i)-.5)*.05,top=[ca*.2,.39,cz*.2],edge=[ca*R,.3,cz*R],P=[top,edge];
   const st=4;for(let k=1;k<=st;k++){const f=k/st,y=.3-len*f,sp=.025*f;P.push([ca*(R+sp)+sw*f*cz,y,cz*(R+sp)-sw*f*ca])}
   rope(P,t,t*.8,[C.b,C.m,C.b,C.hd],C.hl);if(cuff.has(i)){const q=P[3],p=P[4];seg([q[0],q[1]-.02,q[2]],[p[0],q[1]-.08,p[2]],t+.025,'#d4af37',Math.PI/4)}};
  [.8,-.8,1.05,-1.05].forEach((a,i)=>loc(a,.5+(i%2)*.03,.085));/* framing the face, ending on the jaw */
  [1.35,-1.35,1.65,-1.65,1.95,-1.95].forEach((a,i)=>loc(a,.58+hsh(i+20)*.04,.09));/* the sides, resting on the shoulders */
  [2.25,-2.25,2.5,-2.5,2.75,-2.75,3.0,-3.0,Math.PI].forEach((a,i)=>loc(a,.85+hsh(i+40)*.16,.092));/* the back, longer */
  [[-.12,.1],[.12,.12],[0,-.05]].forEach((q,i)=>seg([q[0],.4,q[1]],[q[0]*1.4,.44,q[1]-.12],.09,i%2?C.m:C.b,Math.PI/4))},
 13:({C,H,seg})=>{/* twists: short two-strand twists standing up all over the top, tapered sides */
  H(.58,.08,.58,0,.3,0,C.hd);[-1,1].forEach(s=>H(.05,.2,.44,s*.29,.16,-.03,C.hd));H(.58,.26,.07,0,.12,-.27,C.hd);H(.5,.03,.04,0,.27,.285,C.dd);
  let i=0;for(let a=-.21;a<=.22;a+=.105)for(let b=-.21;b<=.22;b+=.105){const x=a+(hsh(i)-.5)*.02,z=b,dx=x*1.1,dz=z*.9+.05,n=Math.hypot(dx,1,dz),l=.15+hsh(i+5)*.06,p0=[x,.34,z],p1=[x+dx/n*l*.5,.34+l*.5/n,z+dz/n*l*.5],p2=[x+dx/n*l,.34+l/n,z+dz/n*l];
   seg(p0,p1,.075,i%2?C.b:C.m,0);seg(p1,p2,.066,C.hl,Math.PI/4);i++}
  [-.2,0,.2].forEach((x,k)=>seg([x,.28,-.28],[x*1.1,.24,-.36],.07,k%2?C.b:C.m,Math.PI/4))},
 14:({C,H})=>{/* cornrows: neat braided rows from the hairline over the top and down the back, short braid ends at the nape */
  H(.58,.05,.58,0,.3,0,C.dd);[-1,1].forEach(s=>H(.02,.22,.48,s*.286,.16,-.02,C.dd));H(.56,.32,.02,0,.12,-.286,C.dd);
  [-.21,-.105,0,.105,.21].forEach((x,r)=>{for(let k=0;k<7;k++){const z=.25-k*.083,o=k%2?.012:-.012;H(.07,.05,.07,x+o,.335,z,k%2?C.b:C.m,0,k%2?.55:-.55,0)}
   for(let k=0;k<5;k++){const y=.27-k*.08,o=k%2?.012:-.012;H(.07,.07,.05,x+o,y,-.305,k%2?C.b:C.m,0,0,k%2?.55:-.55)}
   for(let k=0;k<3;k++)H(.05,.06,.05,x*.9+(k%2?.008:-.008),-.14-k*.055,-.31,k%2?C.m:C.b,0,0,k%2?.5:-.5);H(.045,.03,.045,x*.9,-.31,-.31,C.hl)});
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)H(.05,.06,.07,s*.295,.27-k*.075,.12-k*.09,k%2?C.b:C.m,k%2?.5:-.5,0,0)})},
 15:({C,H,curls})=>{/* curly puff: a round cloud of curls on top, short curls at the sides and back */
  H(.58,.1,.58,0,.31,0,C.hd);[-1,1].forEach(s=>H(.06,.22,.44,s*.29,.16,-.03,C.hd));H(.58,.28,.08,0,.13,-.27,C.hd);H(.6,.22,.6,0,.44,-.02);H(.5,.34,.5,0,.48,-.02);
  curls(40,0,.47,-.02,.36,.22,.36,.14,(x,y,z)=>z>.2&&y<.33);[[-.29,.1],[.29,.1],[-.2,-.29],[0,-.3],[.2,-.29]].forEach((q,i)=>H(.1,.1,.1,q[0],.08+(i%2)*.06,q[1],i%2?C.b:C.m,.4,.6,.2))},
 16:({C,H})=>{/* fade: a short textured top over sides that fade from hair to skin, with a sharp line-up */
  H(.54,.12,.54,0,.33,0);H(.46,.04,.46,0,.405,0,C.m);for(let i=0;i<6;i++)H(.12,.04,.12,-.17+(i%3)*.17,.42,-.1+(i>2?.17:0),i%2?C.b:C.hl,0,hsh(i)*1.4,0);
  [-1,1].forEach(s=>{H(.03,.08,.48,s*.284,.26,-.02,C.b);H(.025,.08,.48,s*.282,.18,-.02,C.hd);H(.02,.08,.48,s*.28,.1,-.02,C.dd)});H(.56,.08,.03,0,.26,-.284,C.b);H(.56,.08,.025,0,.18,-.282,C.hd);H(.56,.08,.02,0,.1,-.28,C.dd);
  H(.5,.04,.03,0,.28,.285,C.dd);[-1,1].forEach(s=>H(.03,.08,.03,s*.24,.24,.285,C.dd))},
 17:({C,H,dome})=>{/* side sweep: a deep side part, the top swept over to one side and a fringe sweeping across the forehead */
  dome(C.b,.31,.28,.2);H(.02,.02,.36,-.14,.385,.06,C.dd);H(.34,.1,.5,.06,.4,-.02,C.b,0,0,-.12);H(.28,.06,.42,.1,.45,0,C.m,0,0,-.18);H(.2,.03,.34,.08,.48,.02,C.hl,0,0,-.2);
  H(.44,.11,.07,.03,.25,.29,C.b,0,0,-.22);H(.2,.08,.06,.2,.2,.29,C.m,0,0,-.35);H(.12,.08,.05,-.2,.28,.29,C.b);[-1,1].forEach(s=>H(.03,.12,.06,s*.31,.08,.14,C.hd));
  H(.58,.12,.08,0,.02,-.28,C.hd);[-.08,.06,.18].forEach(x=>H(.02,.02,.44,x,.455,-.02,C.hd))},
 18:({C,H,dome})=>{/* twin buns: centre part and two round coiled buns with ties */
  dome(C.b,.31,.3,.2);H(.02,.02,.56,0,.385,0,C.dd);H(.5,.06,.05,0,.27,.29,C.b);
  [-1,1].forEach(s=>{const x=s*.21;H(.18,.04,.18,x,.42,-.02,'#2a2a2a');H(.24,.16,.24,x,.52,-.02,C.b);H(.17,.24,.17,x,.53,-.02,C.m);H(.26,.09,.15,x,.52,-.02,C.b);H(.15,.09,.26,x,.52,-.02,C.b);H(.1,.03,.1,x,.65,-.02,C.hl)})},
 19:({C,H,dome})=>{/* long braids: centre part, hair gathered into two long braids down the back with ties */
  dome(C.b,.31,.32,.22);H(.02,.02,.56,0,.385,0,C.dd);[-1,1].forEach(s=>{H(.22,.06,.05,s*.12,.26,.29,C.b,0,0,s*.3);const x=s*.2;
   for(let k=0;k<11;k++)H(.11,.085,.09,x+(k%2?.016:-.016),.12-k*.07,-.33,k%2?C.b:C.m,0,0,k%2?.5:-.5);H(.09,.05,.09,x,-.67,-.33,'#2a2a2a');H(.07,.09,.07,x,-.74,-.33,C.hl)})}};

function hairMerge(h,ms){const by={};ms.forEach(m=>{h.remove(m);if(!m.visible)return;m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);(by[m.material.uuid]=by[m.material.uuid]||{mat:m.material,gs:[]}).gs.push(g)});
 for(const k in by){const{mat,gs}=by[k];let n=0;gs.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3);let o=0;
  gs.forEach(g=>{P.set(g.attributes.position.array,o);N.set(g.attributes.normal.array,o);o+=g.attributes.position.count*3;g.dispose()});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.computeBoundingSphere();G.computeBoundingBox();
  const m=new THREE.Mesh(G,mat);m.userData.hair=1;m.userData.hair3d=1;h.add(m)}}

const bc=buildChar;buildChar=function(c){const hs=c&&c.hair;if(!(hs>=1&&hs<=19&&HR[hs]))return bc.apply(this,arguments);let r;c.hair=0;try{r=bc.apply(this,arguments)}finally{c.hair=hs}
 try{const h=xHead(r.g);if(h){const n0=h.children.length;HR[hs](hairMk(h,c));const ms=h.children.slice(n0);ms.forEach(m=>m.userData.hair=1);
  const b=typeof hatBrim=='function'?hatBrim(c):null;if(b!=null)tuckHair(h,b);hairMerge(h,ms)}}catch(e){console.warn('3d hair',e)}return r}
})();
