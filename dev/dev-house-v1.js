/* ===== v49.74.0: house craft pass =====
   - The living room staircase gets a proper banister: wood treads with painted risers, a sloped hand rail with a cap, a baluster
     under every step, newel posts at both ends and a side stringer.
   - The upstairs stairwell gets a matching banister on its three open sides instead of one plain wood slab.
   - Upstairs windows get white frames, a cross bar, a sill and curtains on a rod.
   - Expanding the house no longer leaves windows that look straight into the new back rooms. The two back-wall windows
     (bedroom and studio) become framed sunset paintings, and the poster that hung in the new doorway moves onto the wall.
   - The back rooms are dressed to match: skirting boards, a rug in each room, a runner through the new doorway, and
     framed windows with curtains.
   Everything is added as plain boxes in the existing groups; nothing here changes collisions or saves. */
const HI_WOOD='#6b4a2e',HI_DARK='#5a3d26',HI_CREAM='#e8e0d0',HI_TRIM='#f4efe6';
/* a box that tilts around z so it follows the stairs (rising towards -x) */
const hiSlope=(g,len,h,d,c,x,y,z,ang)=>{const m=B(g,len,h,d,c,x,y,z);m.rotation.z=ang;return m};

/* ---- living room staircase ---- */
function hiStairs(){
 const S0=STAIRS,run=.6,rise=.22,ang=-Math.atan(rise/run),L=3/Math.cos(ang),top=x=>rise*((3.1-x)/run+1),zc=10.6,zn=9.5;
 S0.clear();
 for(let i=0;i<5;i++){const cx=3.1-i*run,t=rise*(i+1);
  B(S0,run,t,2.2,HI_CREAM,cx,t/2,zc);                                   /* painted block and riser */
  B(S0,run+.04,.04,2.24,i%2?'#a37a4e':'#b08a5c',cx-.01,t+.02,zc);       /* wood tread, a little proud at the front */
  B(S0,.04,.05,2.24,'#8a6a45',cx+run/2+.01,t-.02,zc)}                   /* nosing shadow line */
 /* side stringer on the open (north) face, under the treads */
 hiSlope(S0,L,.3,.05,HI_CREAM,1.9,top(1.9)-.16,zn-.02,ang);
 /* newel posts with caps: foot of the stairs and the landing */
 [[3.5,0,1.2],[.45,1.1,1.1]].forEach(([x,y0,h])=>{B(S0,.14,h,.14,HI_DARK,x,y0+h/2,zn-.07);B(S0,.2,.05,.2,HI_WOOD,x,y0+h+.02,zn-.07)});
 /* a baluster at every step, 0.9 m above the tread */
 for(let i=0;i<5;i++){const x=3.1-i*run,t=rise*(i+1);B(S0,.045,.9,.045,HI_CREAM,x,t+.45,zn-.07)}
 /* hand rail: sloped wood with a thinner lighter cap, and a bottom rail */
 hiSlope(S0,L,.07,.1,HI_WOOD,1.97,top(1.97)+.93,zn-.07,ang);
 hiSlope(S0,L,.025,.13,'#8a6a45',1.97,top(1.97)+.975,zn-.07,ang);
 hiSlope(S0,L,.04,.04,HI_CREAM,1.97,top(1.97)+.12,zn-.07,ang);
}

/* ---- framed window for a wall facing +z (side='z') or +x (side='x'); c is the centre along the wall, y the centre height */
function hiWindow(g,side,wx,wz,w,h,curtain){
 const f=.07,d=.06,t=(ww,hh,dd,c,dx,dy,dz)=>B(g,side=='z'?ww:dd,hh,side=='z'?dd:ww,c,wx+(side=='x'?dz:dx),dy,wz+(side=='z'?dz:dx));
 const y=1.8,z0=.05;
 t(w+2*f,f,d,HI_TRIM,0,y+h/2+f/2,z0);t(w+2*f,f,d,HI_TRIM,0,y-h/2-f/2,z0);
 t(f,h,d,HI_TRIM,-w/2-f/2,y,z0);t(f,h,d,HI_TRIM,w/2+f/2,y,z0);
 t(.05,h,.04,HI_TRIM,0,y,z0-.01);t(w,.05,.04,HI_TRIM,0,y,z0-.01);                      /* cross bar */
 t(w+.3,.05,.2,'#fffaf0',0,y-h/2-f-.02,z0+.06);                                         /* sill */
 if(curtain){const rod=y+h/2+.22;
  t(w+.9,.035,.035,HI_WOOD,0,rod,z0+.1);
  [-1,1].forEach(s=>{t(.4,h+.45,.05,curtain,s*(w/2+.2),y+.05,z0+.1);t(.1,h+.45,.06,dk(curtain,.88),s*(w/2+.35),y+.05,z0+.11);
   t(.06,.06,.06,HI_DARK,s*(w/2+.47),rod,z0+.1)})}
}

/* ---- upstairs: banister on the stairwell and dressed windows ---- */
function hiAnnex(){
 const G=IG[ANX.idx];if(!G||ANX.lv<1||G.userData.hi)return;G.userData.hi=1;
 const o=900,zb=320,sx0=ANX.W-4.6,sx1=ANX.W-1.4,sz0=ANX.D-3.4,sz1=ANX.D-.8,ph=.95;
 /* the old wood slab on the north edge of the well makes way for the rails */
 G.children.slice().forEach(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;if(p&&Math.abs(p.width-(sx1-sx0))<.05&&Math.abs(p.height-.9)<.02&&p.depth<.1)G.remove(m)});
 const post=(x,z)=>{B(G,.13,ph+.06,.13,HI_DARK,o+x,(ph+.06)/2,zb+z);B(G,.19,.05,.19,HI_WOOD,o+x,ph+.085,zb+z)};
 const run=(ax,a0,a1,f)=>{const L=a1-a0,n=Math.max(1,Math.round(L/.22)),m=(a0+a1)/2;
  const bx=(ww,hh,dd,c,u,y)=>ax=='x'?B(G,ww,hh,dd,c,o+u,y,zb+f):B(G,dd,hh,ww,c,o+f,y,zb+u);
  bx(L,.07,.1,HI_WOOD,m,ph);bx(L,.025,.13,'#8a6a45',m,ph+.045);bx(L,.04,.05,HI_CREAM,m,.14);
  for(let i=1;i<n;i++)bx(.045,ph-.1,.045,HI_CREAM,a0+L*i/n,(ph-.1)/2+.1)};
 run('x',sx0,sx1,sz0);run('z',sz0,sz1,sx1);run('x',sx0,sx1,sz1);
 post(sx0,sz0);post(sx1,sz0);post(sx1,sz1);post(sx0,sz1);post((sx0+sx1)/2,sz0);post(sx1,(sz0+sz1)/2);post((sx0+sx1)/2,sz1);
 /* the open west side gets a post each side of the way down */
 /* windows: swap the bare panes for framed, curtained ones */
 const cur=['#c8a38a','#b9a58f'];let k=0;
 G.children.slice().forEach(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;if(!p||p.height!=1.1||!m.material.isMeshBasicMaterial)return;
  if(Math.abs(p.width-1.8)<.01&&p.depth<.15&&Math.abs(m.position.z-(zb-.02))<.05){hiWindow(G,'z',m.position.x,zb,1.8,1.1,cur[k++%2])}
  else if(p.width<.15&&Math.abs(p.depth-1.8)<.01&&Math.abs(m.position.x-(o+.02))<.05){hiWindow(G,'x',o,m.position.z,1.8,1.1,cur[k++%2])}});
}

/* ---- sunset painting for walls facing +z ---- */
function hiArt(g,x,y,z,w,h,pal){
 B(g,w+.14,h+.14,.05,HI_DARK,x,y,z);B(g,w+.04,h+.04,.055,HI_CREAM,x,y,z+.003);
 const bh=h*.8/3,bw=w*.82;pal.forEach((c,i)=>B(g,bw,bh,.06,c,x,y+h*.4-bh*(i+.5)-.02+.02,z+.006));
 B(g,bw*.25,bh*.9,.065,'#e9c27a',x+bw*.18,y+h*.4-bh*1.15,z+.01)}                     /* low sun */

/* ---- expansion: windows that would now look into a room, plus dressing for the back rooms ---- */
function hiWing(){
 if(!WIN||!NWM.length||WIN.userData.hi||(typeof WK=='undefined'||WK<1))return;WIN.userData.hi=1;
 const H=NWM[0][0].parent,seen=[];
 H.children.slice().forEach(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;if(!p||Math.abs(m.position.z-.02)>.06&&Math.abs(m.position.z-.04)>.03&&Math.abs(m.position.z-.05)>.03)return;
  const hex=m.material.color.getHexString();
  if(hex=='8fd0ff'&&p.height==1.2&&m.position.y>1.7)seen.push(m.position.x),m.visible=false;                 /* window onto the new room */
  else if(Math.abs(m.position.x-3.8)<.05&&(hex=='c8506a'||hex=='ffd27a')){m.visible=false;seen.push('poster')}}); /* poster in the doorway */
 const g=WIN;
 hiArt(g,1.2,1.8,.05,1.4,1.0,['#e0a67c','#c4767f','#4d4b66']);hiArt(g,9.4,1.8,.05,1.4,1.0,['#c98f8a','#a96b7a','#45455e']);
 HI_SKIPWIN=1;if(typeof studio!='undefined'&&studio)try{buildStudio()}catch(e){console.error('studio window',e)}
 if(seen.includes('poster')){B(g,.9,1.2,.05,'#c8506a',6.4,1.9,.04);B(g,.7,.2,.06,'#ffd27a',6.4,2.2,.05)}
 /* back rooms: windows on the north wall get frames and curtains, floors get rugs and skirting */
 const zs=-6,zN=zs,cur=['#b9a58f','#c8a38a'];
 [4,12].forEach((x,i)=>hiWindow(g,'z',x,zs,1.8,1.1,cur[i]));
 const sk=(w,d,x,z)=>B(g,w,.14,d,'#efe7d6',x,.07,z);
 sk(16,.05,8,zN+.04);sk(.05,6,.04,-3);sk(.05,2.6,7.88,zs+1.3);sk(.05,1.8,7.88,-.9);sk(.05,2.6,8.12,zs+1.3);sk(.05,1.8,8.12,-.9);
 [[4,-3,'#c9b79e','#b09a7e'],[12,-3,'#b3b7a6','#9aa08c']].forEach(([x,z,a,b])=>{B(g,4.4,.02,3.2,a,x,.025,z);B(g,4.0,.025,2.8,b,x,.03,z);B(g,3.4,.03,2.2,a,x,.035,z)});
 B(g,1.2,.02,3.2,'#b38f6a',3.95,.025,-.4);B(g,1.0,.025,3.0,'#c9a982',3.95,.03,-.4);                 /* runner through the new doorway */
}

/* the studio window is built by the studio itself (53-studio-gear-detail.js): once the house is expanded, leave it out */
let HI_SKIPWIN=0;
{const xb0=xb;xb=function(g,w,h,d,c,x,y,z){if(HI_SKIPWIN&&g===studio&&x>8.4&&x<10.4&&z<.2&&y>1&&y<2.6&&(w>1.5||h>1.1||w<.1&&h>1.1))return null;return xb0.apply(this,arguments)}}
/* ---- hooks ---- */
try{hiStairs()}catch(e){console.error('stairs',e)}
{const ba=buildAnnex;buildAnnex=function(){const lv=ANX.lv,r=ba.apply(this,arguments);try{if(ANX.lv!==lv&&IG[ANX.idx])IG[ANX.idx].userData.hi=0;hiAnnex()}catch(e){console.error('annex dressing',e)}return r}}
{const bw=buildWing;buildWing=function(){const r=bw.apply(this,arguments);try{hiWing()}catch(e){console.error('wing dressing',e)}return r}}
