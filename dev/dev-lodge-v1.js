/* WaveFern dev: SANTA'S LODGE (Christmas event). Only runs on /dev/ (window.FW_DEV). Add ?nolodge to skip it.

   PLACE     A log lodge in the meadow south of Central Park (centre 95,-27). Walk in through the front door: the roof lifts away and
             the front walls drop, like the game's other walk-in buildings, so you can see inside. Fireplace, tree, rugs, window, shelves.
   SANTA     A block-built Santa (his own rig: jaw, belly, arms, hat, blinking eyes, he looks at you). He talks to you about the cookies
             and candy canes the elves hid around the map.
   COLLECT   Cookies and candy canes float around the map (sparkle beams, minimap dots). Walk into one to pick it up. They come back
             after a few minutes. Press E next to Santa to feed him.
   FEEDING   Each treat flies into his mouth, he chomps, and he grows (belly first, then all of him). On the 5th he inhales, shakes, BURPS and
             a present shoots out of his mouth and bounces on the rug. Open it: it rolls Rare / Epic / Legendary with the advent calendar's
             own crate roll (FW_ADVENT.crate: same prize pool, same tier odds, same grant code). Then he shrinks back and is hungry again.
   STATE     S.lodge={f:feedings this round, t:total feedings, n:presents opened, c:{cookie,cane}, seen, cd:{spot:readyAt}, pr:prize waiting} (lazy).
   HOOK      window.FW_LODGE (test hook, bottom of file). */
(function(){
if(!window.FW_DEV||/[?&]nolodge/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined'||typeof renderer=='undefined'||typeof cam=='undefined'||typeof P=='undefined'||!window.FW_ADVENT||!window.FW_ADVENT.crate)return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,rr=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.floor(Math.random()*a.length)];
const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const easeOutBack=x=>{const c=1.70158,d=c+1;return 1+d*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const easeOutElastic=x=>x<=0?0:x>=1?1:Math.pow(2,-9*x)*Math.sin((x*10-.75)*(2*Math.PI/3))+1;
const easeOutBounce=x=>{const n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d)return n*(x-=1.5/d)*x+.75;if(x<2.5/d)return n*(x-=2.25/d)*x+.9375;return n*(x-=2.625/d)*x+.984375};
const softSeen={};const soft=(e,t)=>{if(!softSeen[t]){softSeen[t]=1;console.error('lodge '+t,e)}};
const safe=(f,t)=>{try{return f()}catch(e){soft(e,t||'x')}};
const sn=k=>{try{snd(k)}catch(e){}},sv=()=>{try{autoSave()}catch(e){}};
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};

/* ---------- where it stands (world metres; local x east, z south, 1 unit = 1 m) ---------- */
const LX=95,LZ=-27,HW=12,HD=9,WH=5.2,SNX=0,SNZ=-5.4;/* half width, half depth, wall height, Santa's spot */
const lw=(x,z)=>[LX+x,LZ+z];
const inside=(x,z)=>x>LX-HW+.4&&x<LX+HW-.4&&z>LZ-HD+.4&&z<LZ+HD-.4;

/* ---------- saved state (lazy) ---------- */
const st=()=>{let o=S.lodge;if(!o||typeof o!='object')o=S.lodge={};
 for(const k of['f','t','n','seen'])if(typeof o[k]!='number')o[k]=0;
 if(!o.c||typeof o.c!='object')o.c={};if(typeof o.c.cookie!='number')o.c.cookie=0;if(typeof o.c.cane!='number')o.c.cane=0;
 if(!o.cd||typeof o.cd!='object')o.cd={};if(o.pr&&typeof o.pr!='object')o.pr=null;return o};

/* ---------- boxes, merged into a few meshes (the game's vertex-coloured box batches) ---------- */
const mkB=()=>({a:[],n:0});
function bx(B,w,h,d,c,x,y,z,ry,rx,rz){B.n++;const j=a=>1+(B.n*a%8)*.0004+.0002;B.a.push([w*j(7919),h*j(104729),d*j(1299709),c,x,y,z,ry||0,rx||0,rz||0])}
function flush(B,mat){const tpl=new THREE.BoxGeometry(1,1,1),tp=tpl.attributes.position.array,tn=tpl.attributes.normal.array,ti=tpl.index.array,N=B.a.length,pos=new Float32Array(N*72),nor=new Float32Array(N*72),col=new Float32Array(N*72),idx=new Uint32Array(N*36);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),v=new THREE.Vector3(),nm=new THREE.Matrix3(),cc=new THREE.Color();
 for(let k=0;k<N;k++){const o=B.a[k];e.set(o[8],o[7],o[9],'YXZ');q.setFromEuler(e);sc.set(o[0],o[1],o[2]);ps.set(o[4],o[5],o[6]);m.compose(ps,q,sc);nm.getNormalMatrix(m);cc.set(String(o[3]).slice(0,7));
  for(let i=0;i<24;i++){v.set(tp[i*3],tp[i*3+1],tp[i*3+2]).applyMatrix4(m);const p=(k*24+i)*3;pos[p]=v.x;pos[p+1]=v.y;pos[p+2]=v.z;v.set(tn[i*3],tn[i*3+1],tn[i*3+2]).applyMatrix3(nm).normalize();nor[p]=v.x;nor[p+1]=v.y;nor[p+2]=v.z;col[p]=cc.r;col[p+1]=cc.g;col[p+2]=cc.b}
  for(let i=0;i<36;i++)idx[k*36+i]=ti[i]+k*24}
 tpl.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));
 g.computeBoundingSphere();return new THREE.Mesh(g,mat)}
const lam=()=>{const m=new THREE.MeshLambertMaterial({vertexColors:true});m.userData.xms=1;return m};
const glowMat=()=>{const m=new THREE.MeshBasicMaterial({vertexColors:true});m.userData.xms=1;return m};
/* palette: warm cabin wood, red and white Christmas trim, stone, snow */
const C={log1:'#8d5a34',log2:'#7c4d2c',log3:'#9a6a3e',logD:'#4a2c18',pine:'#c58f55',pineD:'#a8733f',wain:'#6d4527',plank:'#b98450',plankD:'#9d6c3c',stone:'#8e9399',stone2:'#7b8189',stone3:'#a4a9ae',
 red:'#c0392b',redD:'#8f2420',redL:'#e04b3c',white:'#f6f8fb',snow:'#eef4fa',snowD:'#cfdbe8',ice:'#cfeaff',gold:'#e6b422',goldL:'#ffd75e',green:'#2e8b4e',greenD:'#1f6b3a',greenL:'#47b369',iron:'#33373d',
 shingle1:'#a8302a',shingle2:'#8f2722',shingle3:'#b83a30',cream:'#f1e6c8',navy:'#22345c',brick:'#9b4a38'};

/* ---------- the world group ---------- */
const cutG=new THREE.Group(),roofG=new THREE.Group();
const root=new THREE.Group();root.name='santasLodge';root.position.set(LX,0,LZ);WORLD.add(root);
const stat=new THREE.Group(),dynG=new THREE.Group();root.add(stat);root.add(dynG);stat.add(cutG);stat.add(roofG);/* stat: never moves (zone culled); dynG: animated bits */
const SOL=[];function solid(x0,z0,x1,z1){const q=[LX+x0,LZ+z0,LX+x1,LZ+z1];SOL.push(q);try{cols.push(q)}catch(e){}}
const solidC=(x,z,hw,hd)=>solid(x-hw,z-(hd==null?hw:hd),x+hw,z+(hd==null?hw:hd));
const B={ext:mkB(),cut:mkB(),roof:mkB(),inn:mkB(),glow:mkB(),glowC:mkB(),yard:mkB()};
const X=(k,...a)=>bx(B[k],...a);
const LOGS=[C.log1,C.log2,C.log3];

/* ---------- walls: log siding outside, panelled pine inside; holes for the door and windows ---------- */
/* axis 'x': the wall runs along x at z=fixed (out = +1 faces +z). axis 'z': runs along z at x=fixed (out = +1 faces +x). */
function put(k,axis,fixed,a,y,c,len,h,thick,col){if(axis=='x')X(k,len,h,thick,col,a,y,fixed+c);else X(k,thick,h,len,col,fixed+c,y,a)}
function slab(k,axis,fixed,a0,a1,y0,y1,out,seed){
 const len=a1-a0,h=y1-y0,am=(a0+a1)/2,ym=(y0+y1)/2;if(len<.05||h<.05)return;
 put(k,axis,fixed,am,ym,0,len,h,.4,C.pine);
 /* inside: dark wainscot to 1.1 m, a rail, pine above with battens */
 const lo=Math.min(y1,1.1);if(y0<1.1){put(k,axis,fixed,am,(y0+lo)/2,-out*.22,len,lo-y0,.06,C.wain);put(k,axis,fixed,am,1.12,-out*.22,len,.1,.1,C.pineD)}
 if(y1>1.17){const b0=Math.max(y0,1.17);for(let a=Math.ceil((a0+.3)/1.2)*1.2;a<a1-.1;a+=1.2)put(k,axis,fixed,a,(b0+y1)/2,-out*.215,.1,y1-b0,.05,C.pineD)}
 if(y0<.2)put(k,axis,fixed,am,.1,-out*.24,len,.2,.1,C.logD);
 /* outside: log rows with a dark gap line between them, and stone footing under 0.7 m */
 const base=Math.max(y0,0);if(y0<.7){const top=Math.min(y1,.7);put(k,axis,fixed,am,(base+top)/2,out*.2,len,top-base,.34,C.stone);
  for(let a=a0+.5;a<a1;a+=1.1)put(k,axis,fixed,a,(base+top)/2,out*.38,.55,top-base-.06,.04,(Math.floor(a*3)%2)?C.stone2:C.stone3)}
 const r0=Math.max(y0,.7),rows=Math.max(1,Math.round((y1-r0)/.5)),rh=(y1-r0)/rows;
 if(y1>.7)for(let r=0;r<rows;r++){const y=r0+rh*(r+.5);put(k,axis,fixed,am,y,out*.22,len,rh-.04,.3,LOGS[(r*2+seed)%3]);if(r)put(k,axis,fixed,am,r0+rh*r,out*.2,len,.04,.34,C.logD)}}
function wallRun(k,axis,fixed,a0,a1,out,holes,seed){
 const hs=holes.slice().sort((p,q)=>p.a0-q.a0);let a=a0;
 hs.forEach(h=>{slab(k,axis,fixed,a,h.a0,0,WH,out,seed);if(h.y0>0)slab(k,axis,fixed,h.a0,h.a1,0,h.y0,out,seed);slab(k,axis,fixed,h.a0,h.a1,h.y1,WH,out,seed);a=h.a1});slab(k,axis,fixed,a,a1,0,WH,out,seed)}
/* a window: trim, mullions, glowing pane, shutters with a snow-capped flower box. Pane goes in the glow batch of the same piece. */
function windowAt(k,gk,axis,fixed,a,y0,y1,w,out){
 const h=y1-y0,ym=(y0+y1)/2;
 put(k,axis,fixed,a,ym,out*.0,w+.5,h+.5,.1,C.cream);/* thin back trim behind everything is skipped; frame below */
 put(k,axis,fixed,a,y0-.12,out*.4,w+.7,.24,.34,C.white);put(k,axis,fixed,a,y1+.12,out*.4,w+.7,.24,.3,C.white);
 [-1,1].forEach(s=>put(k,axis,fixed,a+s*(w/2+.12),ym,out*.38,.24,h+.5,.3,C.white));
 put(gk,axis,fixed,a,ym,out*.12,w,h,.12,'#ffe3a0');
 put(k,axis,fixed,a,ym,out*.2,.1,h,.1,C.white);put(k,axis,fixed,a,ym,out*.2,w,.1,.1,C.white);
 /* little curtains */
 [-1,1].forEach(s=>put(k,axis,fixed,a+s*w*.38,ym+.1,out*.05,w*.2,h*.86,.14,s<0?C.red:C.redD));
 /* shutters */
 [-1,1].forEach(s=>{put(k,axis,fixed,a+s*(w/2+.62),ym,out*.42,.7,h+.3,.12,C.red);for(let i=-2;i<=2;i++)put(k,axis,fixed,a+s*(w/2+.62),ym+i*(h+.3)/5.2,out*.5,.56,.07,.05,C.redD)});
 /* flower box with holly and a snow cap */
 put(k,axis,fixed,a,y0-.45,out*.62,w+.7,.36,.4,C.wain);put(k,axis,fixed,a,y0-.22,out*.62,w+.6,.1,.5,C.snow);
 for(let i=0;i<5;i++){const p=a-w/2+.1+i*(w-.2)/4;put(k,axis,fixed,p,y0-.1,out*.62,.34,.28,.34,i%2?C.green:C.greenD);put(k,axis,fixed,p+.05,y0+.08,out*.7,.1,.1,.1,C.redL)}
 /* snow on the head trim */
 put(k,axis,fixed,a,y1+.3,out*.4,w+.8,.1,.4,C.snow)}

/* ---------- build ---------- */
const WIN_S=[-8.2,-4.6,4.6,8.2],WIN_E=[-3.2,3.2],WIN_N=[-9.2,9.2];
function buildShell(){
 /* ground: a snowy yard with a stone path, a stepped foundation under the lodge */
 X('yard',HW*2+14,.12,HD*2+14,C.snow,0,.02,0);X('yard',HW*2+10,.1,HD*2+14,C.snow,0,.03,3);X('yard',HW*2+2,.12,HD*2+19,C.snow,0,.025,8);
 for(let i=0;i<26;i++){const a=i*2.4+.7,x=Math.cos(a)*(18+Math.sin(i*5)*2),z=Math.sin(a)*(14+Math.cos(i*3)*2)+3;X('yard',2.6+Math.sin(i)*.8,.28+Math.abs(Math.cos(i*2))*.2,2.2+Math.cos(i)*.7,i%3?C.snow:C.snowD,x,.12,z,i*.7)}
 X('yard',HW*2+1.2,.3,HD*2+1.2,C.stone2,0,.1,0);X('yard',HW*2+.6,.16,HD*2+.6,C.stone3,0,.3,0);
 /* floor planks, two tones, with a gap line */
 X('inn',HW*2-.6,.06,HD*2-.6,C.wain,0,.34,0);
 for(let z=-HD+.55;z<HD-.4;z+=.5)for(let s=0;s<3;s++){const x0=-HW+.8+((Math.floor((z+10)*2)+s)%3)*.4,len=7.6;const xs=-HW+.7+s*7.9;X('inn',len-.04,.04,.46,['#b57d46','#a9703d','#bf8850'][(Math.floor(z*2)+s*2)%3],xs+len/2-((Math.floor((z+10)*2))%3)*.4*0,.38,z)}
 /* walls: north and west always; south and east are the cutaway pieces */
 wallRun('ext','x',-HD,-HW,HW,-1,[],0);
 wallRun('ext','z',-HW,-HD,HD,-1,[],1);
 /* south (front) with the door gap, east with two windows */
 const sw=WIN_S.map(a=>({a0:a-1.15,a1:a+1.15,y0:1.5,y1:3.5}));
 wallRun('cut','x',HD,-HW,HW,1,[{a0:-1.7,a1:1.7,y0:0,y1:3.7}].concat(sw),2);
 wallRun('cut','z',HW,-HD,HD,1,WIN_E.map(a=>({a0:a-1.2,a1:a+1.2,y0:1.5,y1:3.5})),0);
 sw.forEach(h=>windowAt('cut','glowC','x',HD,(h.a0+h.a1)/2,1.5,3.5,2.3,1));
 WIN_E.forEach(a=>windowAt('cut','glowC','z',HW,a,1.5,3.5,2.4,1));
 /* corner posts (log ends poking out), wall plates */
 [[-HW,-HD,'ext'],[HW,-HD,'ext'],[-HW,HD,'cut'],[HW,HD,'cut']].forEach(([x,z,k])=>{X(k,.8,WH+.2,.8,C.logD,x,WH/2,z);for(let r=0;r<10;r++){const y=.9+r*.45;X(k,1.1+(r%2)*.3,.4,.5,LOGS[r%3],x,y,z+(z<0?-.1:.1));X(k,.5,.4,1.1+((r+1)%2)*.3,LOGS[(r+1)%3],x+(x<0?-.1:.1),y+.22,z)}});
 /* collision: walls with the door gap and no windows to walk through */
 solid(-HW-.4,-HD-.4,HW+.4,-HD+.4);solid(-HW-.4,-HD-.4,-HW+.4,HD+.4);solid(HW-.4,-HD-.4,HW+.4,HD+.4);solid(-HW-.4,HD-.4,-1.7,HD+.4);solid(1.7,HD-.4,HW+.4,HD+.4)}
buildShell();

/* ---------- roof: red shingles, a thick snow cap, icicles, a chimney and a front dormer. Lifts away when you are inside. ---------- */
const RUN=HD+1.3,RISE=4.4,TH=Math.atan2(RISE,RUN),RL=Math.hypot(RUN,RISE),RIDGE=WH+RISE;
function buildRoof(){
 [1,-1].forEach(s=>{
  /* base slab and shingle rows */
  const slabY=WH+RISE/2+.15,slabZ=s*RUN/2;
  X('roof',HW*2+2.6,.34,RL+.3,C.logD,0,slabY-.04,slabZ,0,s*TH);
  const rows=12;for(let r=0;r<rows;r++){const f=(r+.5)/rows,y=WH+RISE*f+.2,z=s*(RUN*(1-f));/* from the eave to the ridge */
   const cols3=[C.shingle1,C.shingle2,C.shingle3];
   /* each row is a run of shingle tiles, alternate offset */
   const nT=17,tw=(HW*2+2.6)/nT;if(f<.74)for(let i=0;i<nT;i++)X('roof',tw-.04,.16,RL/rows+.12,cols3[(i*5+r*3)%3],-HW-1.3+tw*(i+.5+(r%2?.5:0)),y+.12-(r%2)*.01,z,0,s*TH)
  }
  /* snow: a thick blanket from the ridge down 74% of the slope, ragged lower edge */
  const f0=.74,snowLen=RL*(1-f0)+.2,sy=WH+RISE*(1+f0)/2+.34,sz=s*RUN*(1-f0)/2;
  X('roof',HW*2+2.8,.38,snowLen,C.snow,0,sy,sz,0,s*TH);
  for(let i=0;i<22;i++){const x=-HW-1.1+i*(HW*2+2.2)/21,len=.6+((i*7)%5)*.28,fz=f0-len/RL;X('roof',(HW*2+2.2)/21+.05,.4,len,C.snow,x,WH+RISE*(f0+fz)/2+.37,s*RUN*(1-(f0+fz)/2)*1,0,s*TH)}
  /* eave: a fascia board and icicles */
  X('roof',HW*2+2.8,.34,.26,C.white,0,WH+.12,s*(RUN+.04),0,s*TH);
  for(let i=0;i<34;i++){const x=-HW-1.2+i*.75+((i*13)%5)*.05,len=.25+((i*17)%7)*.1;X('roof',.1,len,.1,C.ice,x,WH-len/2-.02,s*(RUN+.08))}
 });
 /* ridge cap and gable ends (the triangles above the east and west walls, in the same piece so they leave with the roof) */
 X('roof',HW*2+3,.5,1.0,C.snow,0,RIDGE+.34,0);X('roof',HW*2+3.1,.2,.24,C.white,0,RIDGE-.05,0);
 [-1,1].forEach(sx=>{const x=sx*(HW+.05);for(let r=0;r<9;r++){const f=(r+.5)/9,y=WH+RISE*f,w=2*(HD+.3)*(1-f)-.1;X('roof',.5,RISE/9+.01,Math.max(.1,w),LOGS[r%3],x,y,0)}
  /* gable round window with a star */
  X('roof',.1,1.5,1.5,C.cream,x+sx*.28,WH+1.7,0);X('roof',.1,1.1,1.1,'#ffe3a0',x+sx*.34,WH+1.7,0);X('roof',.12,.1,1.1,C.white,x+sx*.36,WH+1.7,0);X('roof',.12,1.1,.1,C.white,x+sx*.36,WH+1.7,0);
  X('roof',.3,1.1,.3,C.goldL,x+sx*.45,WH+3.1,0,0,0,.785);X('roof',.3,.4,.3,C.goldL,x+sx*.45,WH+3.1,0)});
 /* barge boards along both gable edges */
 [-1,1].forEach(sx=>[1,-1].forEach(s=>X('roof',.34,.3,RL+.4,C.white,sx*(HW+1.0),WH+RISE/2+.18,s*RUN/2,0,s*TH)));
 /* chimney on the north slope (stone, snow cap) */
 {const cx=6.5,cz=-3.6,cy=RIDGE-.4;X('roof',2.2,3.6,2.0,C.stone,cx,cy+1.4,cz);for(let i=0;i<4;i++)for(let j=0;j<5;j++)X('roof',2.25,.1,2.05,(i+j)%2?C.stone2:C.stone3,cx,cy+.2+j*.7,cz);X('roof',2.7,.3,2.5,C.stone3,cx,cy+3.3,cz);X('roof',2.4,.28,2.2,C.snow,cx,cy+3.6,cz);X('roof',1.1,.2,1.0,C.iron,cx,cy+3.45,cz)}
 /* dormer on the front slope: a box, its own little roof, a glowing window */
 {const dx=0,dz=5.4,dy=WH+RISE*(1-dz/RUN)+.5;X('roof',3.4,2.4,2.4,C.pine,dx,dy+.9,dz);for(let r=0;r<5;r++)X('roof',3.5,.4,2.5,LOGS[r%3],dx,dy-.1+r*.5,dz+.02);
  X('roof',2.0,1.5,.12,'#ffe3a0',dx,dy+1.1,dz+1.22);X('roof',2.3,.2,.2,C.white,dx,dy+1.9,dz+1.25);X('roof',2.3,.2,.2,C.white,dx,dy+.3,dz+1.25);[-1,1].forEach(s=>X('roof',.2,1.9,.2,C.white,dx+s*1.1,dy+1.1,dz+1.25));X('roof',.12,1.5,.14,C.white,dx,dy+1.1,dz+1.27);
  [-1,1].forEach(s=>{X('roof',4.0,.28,1.65,C.shingle1,dx,dy+2.4+.2,dz+.0+s*0,0,0,0)});
  /* little gable roof as two slabs */
  X('roof',3.9,.26,1.8,C.shingle2,dx,dy+2.35,dz+.65,0,.42);X('roof',3.9,.26,1.8,C.shingle3,dx,dy+2.35,dz-.65,0,-.42);X('roof',4.0,.2,.5,C.snow,dx,dy+2.95,dz);X('roof',3.9,.14,1.6,C.snow,dx,dy+2.55,dz+.7,0,.42);X('roof',3.9,.14,1.6,C.snow,dx,dy+2.55,dz-.7,0,-.42)}
}
buildRoof();

/* ---------- porch, sign, lamps, tree, sleigh, snowman, pines, the stone path ---------- */
function stripedPost(k,x,z,h){for(let i=0;i<Math.round(h/.3);i++)X(k,.34,.3,.34,i%2?C.white:C.red,x,.2+i*.3+.15,z);X(k,.5,.2,.5,C.gold,x,.3,z);X(k,.5,.2,.5,C.gold,x,h+.2,z)}
function lamp(k,gk,x,z,h){for(let i=0;i<Math.round(h/.3);i++)X(k,.18,.3,.18,i%2?C.white:C.red,x,.15+i*.3,z);
 /* hook at the top and a lantern */
 X(k,.18,.18,.8,C.red,x,h+.1,z-.35);X(k,.18,.3,.18,C.white,x,h+.0,z-.7);X(k,.36,.1,.36,C.iron,x,h-.1,z-.7);X(k,.3,.4,.3,'#ffe3a0',x,h-.4,z-.7);bx(B[gk],.28,.36,.28,'#ffd27a',x,h-.4,z-.7);X(k,.46,.1,.46,C.iron,x,h-.65,z-.7);X(k,.4,.1,.4,C.snow,x,h-.04,z-.7)}
function pine(k,x,z,s){s=s||1;X(k,.6*s,1.2*s,.6*s,C.logD,x,.6*s,z);for(let i=0;i<5;i++){const w=(3.4-i*.62)*s,y=(1.1+i*.95)*s;X(k,w,.9*s,w,i%2?C.green:C.greenD,x,y+.45*s,z);X(k,w*.82,.2*s,w*.82,C.snow,x,y+.95*s,z)}X(k,.5*s,.7*s,.5*s,C.green,x,6.1*s,z);X(k,.3*s,.3*s,.3*s,C.snow,x,6.5*s,z)}
function buildProps(){
 /* porch: deck, two striped posts, a shed roof with a snow cap, a bow wreath, a doormat */
 const PZ=HD+1.8;
 X('ext',9.0,.2,4.6,C.plank,0,.2,HD+2.3);for(let x=-4.3;x<4.4;x+=.55)X('ext',.04,.21,4.6,C.plankD,x,.2,HD+2.3);
 X('ext',9.4,.3,.4,C.logD,0,.15,HD+4.7);X('ext',3.2,.18,.9,C.stone3,0,.12,HD+5.3);X('ext',3.6,.18,1.0,C.stone2,0,.06,HD+6.1);
 stripedPost('cut',-3.9,HD+4.1,3.9);stripedPost('cut',3.9,HD+4.1,3.9);stripedPost('cut',-3.9,HD+.6,3.9);stripedPost('cut',3.9,HD+.6,3.9);
 X('cut',9.6,.5,.6,C.logD,0,4.35,HD+4.1);X('cut',9.6,.5,.6,C.logD,0,4.35,HD+.6);
 /* porch shed roof sloping away from the wall */
 X('roof',10.4,.3,5.4,C.shingle2,0,4.7,HD+2.4,0,.14);X('roof',10.4,.4,4.3,C.snow,0,4.98,HD+2.6,0,.14);for(let i=0;i<14;i++)X('roof',.1,.25+((i*7)%5)*.1,.1,C.ice,-4.9+i*.75,4.45,HD+5.0);
 solidC(-3.9,HD+4.1,.3);solidC(3.9,HD+4.1,.3);
 /* sign over the door: a hanging wooden board (lettering is a canvas plane added below) */
 X('cut',6.2,1.1,.3,C.logD,0,4.5,HD+.35);X('cut',6.4,.14,.4,C.snow,0,5.1,HD+.35);
 /* wreath and bow */
 {const wx=0,wy=3.15,wz=HD+.3;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;X('cut',.34,.34,.2,i%2?C.green:C.greenD,wx+Math.cos(a)*.62,wy+Math.sin(a)*.62,wz,0,0,a)}[[.5,.5],[-.5,-.4],[.2,-.65],[-.6,.35]].forEach(([a,b])=>X('cut',.14,.14,.1,C.redL,wx+a,wy+b,wz+.1));X('cut',.5,.3,.12,C.red,wx-.3,wy-.7,wz+.1,0,0,.4);X('cut',.5,.3,.12,C.red,wx+.3,wy-.7,wz+.1,0,0,-.4);X('cut',.24,.24,.14,C.redD,wx,wy-.72,wz+.12)}
 /* lanterns hanging from the porch beam, doormat, boots, firewood stack, shovel */
 lamp('cut','glowC',-2.4,HD+4.1,3.5);lamp('cut','glowC',2.4,HD+4.1,3.5);
 X('ext',2.6,.06,1.5,C.redD,0,.33,HD+1.6);X('ext',2.2,.07,1.1,C.red,0,.34,HD+1.6);
 X('ext',.34,.5,.2,C.iron,-1.8,.4,HD+.5);X('ext',.34,.5,.2,C.iron,-1.4,.4,HD+.5);
 for(let r=0;r<4;r++)for(let c=0;c<4-r;c++)X('ext',.5,.46,1.0,LOGS[(r+c)%3],-5.2-.0,.5+r*.46,HD+1.2+c*.5+r*.25,0);
 X('ext',3.0,.12,1.0,C.snow,-5.2,2.4,HD+2.0);
 /* stone path and candy-cane lamps down to the meadow */
 for(let i=0;i<7;i++)X('yard',2.6+((i*3)%3)*.2,.1,1.5,i%2?C.stone2:C.stone3,((i*5)%3-1)*.15,.16,HD+7.2+i*1.7,((i*7)%5-2)*.04);
 [[-3.2,HD+7.5],[3.2,HD+7.5],[-3.2,HD+12],[3.2,HD+12]].forEach(([x,z])=>lamp('ext','glow',x,z,3.1));
 /* pines around the back and sides */
 [[-17,-12,1.1],[-13,-15,1.3],[-6,-17,1],[1,-16,1.2],[8,-17,1.05],[14,-14,1.3],[18,-9,1.1],[-19,-3,1.2],[-18,5,1],[19,0,1.15],[20,8,1.0],[-20,12,1.1]].forEach(([x,z,s])=>{pine('ext',x,z,s);solidC(x,z,.7*s)});
 /* a decorated tree beside the porch: lights are glow boxes, baubles in colours, a gold star */
 {const tx=11.6,tz=HD+4.2,s=1.25;X('ext',.7,1,.7,C.logD,tx,.5,tz);for(let i=0;i<5;i++){const w=(3.2-i*.6)*s,y=(1+i*.9)*s;X('ext',w,.9*s,w,i%2?C.green:C.greenD,tx,y+.4*s,tz);X('ext',w*.8,.14,w*.8,C.snow,tx,y+.9*s,tz)}
  const cols5=[C.redL,C.goldL,'#4aa3ff','#ff7ab8','#ffffff'];for(let i=0;i<34;i++){const a=i*2.4,r=(1.6-i/34*1.4)*s,y=(1.2+i/34*3.6)*s;bx(B.glow,.2,.2,.2,cols5[i%5],tx+Math.cos(a)*r,y,tz+Math.sin(a)*r)}
  X('ext',.3,.7,.3,C.goldL,tx,6.4*1,tz);bx(B.glow,.5,.5,.5,C.goldL,tx,6.65,tz,.785,0,.785);solidC(tx,tz,.9);
  [[1.3,.9],[-1.2,1.1],[.4,-1.4],[1.9,-.3]].forEach(([a,b],i)=>{X('ext',.7,.6,.7,[C.red,C.green,'#3f6fd6','#c99a2a'][i],tx+a,.4,tz+b,i*.5);X('ext',.12,.62,.72,C.white,tx+a,.4,tz+b,i*.5);X('ext',.72,.62,.12,C.white,tx+a,.4,tz+b,i*.5)})}
 /* a snowman on the other side */
 {const sx=-11.8,sz=HD+4.4;X('ext',1.7,1.5,1.7,C.snow,sx,.8,sz);X('ext',1.3,1.1,1.3,C.snow,sx,2.1,sz);X('ext',.95,.95,.95,C.snow,sx,3.1,sz);X('ext',1.1,.14,1.1,C.iron,sx,3.65,sz);X('ext',.7,.5,.7,C.iron,sx,3.95,sz);X('ext',1.1,.14,1.1,C.red,sx,3.7,sz+.0);
   X('ext',.12,.12,.9,'#e8782a',sx,3.1,sz+.7);[-1,1].forEach(s=>X('ext',.12,.12,.08,C.iron,sx+s*.2,3.3,sz+.5));for(let i=0;i<4;i++)X('ext',.12,.12,.08,C.iron,sx+Math.sin(i-1.5)*.18,2.84,sz+.5);[-1,1].forEach(s=>{X('ext',1.2,.1,.1,C.logD,sx+s*1.0,2.5,sz,0,0,s*.5)});
   X('ext',1.1,.3,1.1,C.red,sx,2.6,sz+.1,0);X('ext',.28,.8,.2,C.red,sx+.3,2.2,sz+.7,0,0,.1);solidC(sx,sz,.9)}
 /* a sleigh at the left of the lodge: red body, gold runners, a sack of toys */
 {const sx=-16,sz=HD-1;X('ext',3.4,.14,.2,C.gold,sx,.25,sz-.8);X('ext',3.4,.14,.2,C.gold,sx,.25,sz+.8);X('ext',.4,.3,.2,C.gold,sx+1.9,.5,sz-.8,0,0,.5);X('ext',.4,.3,.2,C.gold,sx+1.9,.5,sz+.8,0,0,.5);
   X('ext',3.0,.5,1.6,C.red,sx,.65,sz);X('ext',3.1,.12,1.7,C.gold,sx,.95,sz);X('ext',.3,1.0,1.6,C.red,sx-1.4,1.0,sz);X('ext',.2,.8,1.4,C.redD,sx+1.2,.9,sz);X('ext',3.0,.1,1.5,C.snow,sx,1.04,sz);
   X('ext',1.1,1.1,1.1,'#9a6a3e',sx-.5,1.5,sz,0.3);X('ext',.9,.2,.9,C.red,sx-.5,2.15,sz,.3);[[.7,.7],[1.0,-.5]].forEach(([a,b],i)=>X('ext',.5,.5,.5,[C.green,'#3f6fd6'][i],sx+a,1.3,sz+b*.4,i));solidC(sx,sz,1.8,1.0)}
 /* two big wrapped presents by the path, a stack of three */
 [[-6.2,HD+5.6,1.2,C.red],[-5.2,HD+5.8,.9,C.green],[-6.0,HD+5.7,.0,'#3f6fd6']].forEach(([x,z,s,c],i)=>{if(!s)return;X('ext',s,s,s,c,x,.2+s/2,z,i*.3);X('ext',s+.02,s+.02,.18,C.white,x,.2+s/2,z,i*.3);X('ext',.18,s+.02,s+.02,C.white,x,.2+s/2,z,i*.3);X('ext',.4,.3,.4,C.goldL,x,.2+s+.15,z,i*.3)});
 /* firewood pile by the east wall and a chopping block with an axe */
 for(let r=0;r<3;r++)for(let c=0;c<5-r;c++)X('ext',1.0,.42,.5,LOGS[(r+c)%3],HW+1.1,.4+r*.42,-4+c*.52+r*.26);X('ext',2.8,.12,2.8,C.snow,HW+1.1,1.7,-3);
 X('ext',.9,.7,.9,C.log2,HW+1.8,.5,3.6);X('ext',.12,.12,1.0,C.iron,HW+1.8,.95,3.6,0,0,.3)
}
buildProps();

/* ---------- inside: rug, fireplace, tree, shelf, window, armchair, table, toys, garland ---------- */
const TRK={x:4.9,z:3.0,rx:2.3,rz:1.7};/* the toy train's oval track */
function buildInside(){
 /* Santa's round rug: stepped circles (gold rim, white ring, red field, a darker inner circle with a white snowflake), centred in front of him */
 const disc=(cx,cz,r,y,h,col,step)=>{step=step||.36;for(let z=-r+step/2;z<r;z+=step){const w=2*Math.sqrt(Math.max(0,r*r-z*z));if(w>.2)X('inn',Math.round(w/step)*step,h,step+.01,col,cx,y,cz+z)}};
 const RC=[0,-3.4];
 disc(RC[0],RC[1],4.5,.41,.04,C.gold);disc(RC[0],RC[1],4.2,.425,.05,C.white);disc(RC[0],RC[1],3.85,.44,.06,C.red);disc(RC[0],RC[1],2.5,.45,.05,C.redD);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;X('inn',.34,.07,.34,i%2?C.goldL:C.white,RC[0]+Math.cos(a)*3.25,.45,RC[1]+Math.sin(a)*3.25,a)}
 for(let i=0;i<6;i++){const a=i/6*Math.PI;X('inn',3.6,.06,.22,C.white,RC[0],.46,RC[1],a);X('inn',.5,.065,.5,C.white,RC[0]+Math.cos(a)*1.45,.46,RC[1]-Math.sin(a)*1.45,a+.785);X('inn',.5,.065,.5,C.white,RC[0]-Math.cos(a)*1.45,.46,RC[1]+Math.sin(a)*1.45,a+.785)}
 X('inn',.7,.07,.7,C.goldL,RC[0],.465,RC[1],.785);
 /* the runner from the door: red with white edges and gold diamonds */
 X('inn',2.6,.04,7.4,C.white,0,.41,4.9);X('inn',2.2,.05,7.4,C.red,0,.42,4.9);for(let i=0;i<6;i++)X('inn',.42,.055,.42,C.goldL,0,.425,1.9+i*1.2,.785);for(let i=0;i<12;i++)X('inn',.18,.055,.18,C.white,i%2?-.75:.75,.425,1.6+i*.6,.785);
 /* a white fur rug in front of the fire, with a sleeping cat on it */
 disc(-7.6,-1.5,1.7,.41,.05,'#e9eef4',.3);disc(-7.6,-1.5,1.4,.42,.05,C.white,.3);
 {const cx=-7.3,cz=-1.2;X('inn',.9,.36,.6,'#e08a3c',cx,.62,cz);X('inn',.5,.34,.48,'#e08a3c',cx+.55,.66,cz+.1);X('inn',.14,.14,.06,'#e08a3c',cx+.45,.88,cz+.1);X('inn',.14,.14,.06,'#e08a3c',cx+.68,.88,cz+.1);
  X('inn',.5,.12,.12,'#c26f28',cx-.4,.5,cz+.36,.5);X('inn',.2,.06,.04,'#3a2214',cx+.6,.68,cz+.35);X('inn',.5,.06,.6,'#c26f28',cx-.1,.82,cz);X('inn',.12,.1,.04,'#f2c7a0',cx+.55,.6,cz+.35)}
 /* fireplace on the west wall: stone breast, firebox, hearth, mantel, logs */
 const fx=-HW+.4;X('inn',1.8,5.2,5.0,C.stone,fx+.9,2.6,-1.5);for(let i=0;i<10;i++)for(let j=0;j<5;j++)X('inn',1.84,.5,1.0,(i+j)%3?C.stone3:C.stone2,fx+.9,.35+i*.5,-3.5+j*1.0+(i%2)*.5);
 X('inn',1.2,2.0,2.8,'#17181b',fx+1.4,1.5,-1.5);X('inn',.1,2.0,2.8,'#0e0f11',fx+.4,1.5,-1.5);X('inn',1.6,.3,3.4,C.stone3,fx+1.6,.5,-1.5);X('inn',2.4,.5,5.4,C.stone2,fx+1.6,.42,-1.5);
 X('inn',2.4,.5,5.4,C.wain,fx+1.55,2.75,-1.5);X('inn',2.5,.14,5.5,C.pineD,fx+1.55,3.05,-1.5);X('inn',.4,.5,.4,C.iron,fx+1.7,.8,-.4);X('inn',.4,.5,.4,C.iron,fx+1.7,.8,-2.6);X('inn',.2,.14,2.2,C.iron,fx+1.7,.62,-1.5);
 [[1.5,-.4,.5],[1.7,-1.7,-.0]].forEach(([x,z,r])=>X('inn',.5,.4,2.1,C.log2,fx+x,.8,z,r*.1));
 /* garland on the mantel with berries and a row of stockings */
 for(let i=0;i<14;i++){const z=-3.9+i*.4;X('inn',.5,.34,.46,i%2?C.green:C.greenD,fx+1.85,3.28+Math.abs(Math.sin(i*.45))*-.06,z);if(i%3==1)X('inn',.18,.18,.18,C.redL,fx+2.1,3.28,z)}
 [[-3.4,C.red],[-2.6,C.green],[-1.8,'#3f6fd6'],[-1.0,C.gold],[-.2,C.redL]].forEach(([z,c])=>{X('inn',.3,.8,.5,c,fx+2.15,2.5,z);X('inn',.34,.18,.5,C.white,fx+2.15,2.97,z);X('inn',.3,.3,.7,c,fx+2.15,2.15,z+.0,0,0,0);X('inn',.34,.18,.7,C.white,fx+2.15,2.05,z)});
 /* wall art over the mantel: a round clock and two frames */
 X('inn',.2,1.4,1.4,C.logD,fx+1.45+.5,4.0,-1.5);X('inn',.22,1.2,1.2,C.cream,fx+1.95,4.0,-1.5);X('inn',.24,.1,.5,C.iron,fx+2.0,4.0,-1.5,0,0,.6);X('inn',.24,.1,.7,C.iron,fx+2.0,4.0,-1.5,0,0,-.4);
 X('inn',.12,1.0,1.4,C.logD,fx+1.45+.5,3.9,-3.8);X('inn',.14,.8,1.2,'#3d5d8a',fx+1.95,3.9,-3.8);X('inn',.12,1.0,1.4,C.logD,fx+1.45+.5,3.9,.8);X('inn',.14,.8,1.2,'#8a4b3d',fx+1.95,3.9,.8);
 solid(-HW,-4.2,-HW+2.9,1.2);
 /* armchair in the corner by the fire (big red velvet with gold studs) and a side table with milk and a plate of cookies */
 {const ax=-8.6,az=3.2;X('inn',2.0,.6,2.0,C.redD,ax,.7,az);X('inn',2.0,1.6,.5,C.red,ax,1.3,az-.85);X('inn',.5,1.0,2.0,C.red,ax-.75,1.0,az);X('inn',.5,1.0,2.0,C.red,ax+.75,1.0,az);X('inn',1.4,.3,1.4,C.redL,ax,1.05,az+.1);X('inn',.2,.5,.2,C.wain,ax-.8,.5,az-.8);X('inn',.2,.5,.2,C.wain,ax+.8,.5,az-.8);X('inn',.2,.5,.2,C.wain,ax-.8,.5,az+.8);X('inn',.2,.5,.2,C.wain,ax+.8,.5,az+.8);for(let i=0;i<4;i++)X('inn',.1,.1,.1,C.goldL,ax-.55+i*.37,1.9,az-1.12);solid(ax-1.1,az-1.1,ax+1.1,az+1.1)}
 {const tx=-5.3,tz=5.8;X('inn',1.2,.12,1.2,C.pineD,tx,1.0,tz);X('inn',.18,.7,.18,C.wain,tx,.65,tz);X('inn',.8,.1,.8,C.wain,tx,.4,tz);X('inn',.5,.04,.5,C.white,tx-.2,1.08,tz);for(let i=0;i<3;i++){X('inn',.2,.06,.2,'#c98a45',tx-.2+((i%2)*.14-.07),1.14+i*.06,tz+((i%3)*.1-.1));X('inn',.06,.04,.06,'#3a2214',tx-.2+((i%2)*.14-.07),1.2+i*.06,tz+((i%3)*.1-.1))}
  X('inn',.26,.4,.26,C.white,tx+.3,1.26,tz+.1);X('inn',.22,.1,.22,'#e9f2ff',tx+.3,1.5,tz+.1);solidC(tx,tz,.6)}
 /* Christmas tree in the north-west corner, full size, with baubles, lights, garland, a star, presents under it */
 {const tx=-8.6,tz=-6.6,s=1.5;X('inn',.8,1.2,.8,C.logD,tx,.6,tz);X('inn',2.8,.3,2.8,C.red,tx,.5,tz);for(let i=0;i<6;i++){const w=(3.4-i*.52)*s,y=(.9+i*.75)*s;X('inn',w,.8*s,w,i%2?C.green:C.greenD,tx,y+.35*s,tz);}
  const cs=[C.redL,C.goldL,'#4aa3ff','#ff7ab8','#ffffff','#7fe3a0'];for(let i=0;i<60;i++){const a=i*2.39,f=i/60,r=(1.9-f*1.5)*s,y=(1.0+f*4.0)*s;bx(B.glow,.22,.22,.22,cs[i%6],tx+Math.cos(a)*r,y,tz+Math.sin(a)*r)}
  for(let i=0;i<24;i++){const a=i*2.7+.5,f=i/24,r=(1.95-f*1.5)*s,y=(.95+f*3.9)*s;X('inn',.3,.3,.3,['#d83a3a','#e6b422','#3f6fd6','#fff'][i%4],tx+Math.cos(a)*r,y,tz+Math.sin(a)*r)}
  for(let i=0;i<30;i++){const a=i*.9,f=i/30,r=(1.9-f*1.5)*s,y=(1.0+f*4.0)*s-.3;X('inn',.26,.1,.26,i%2?C.white:C.goldL,tx+Math.cos(a)*r,y,tz+Math.sin(a)*r,a)}
  X('inn',.4,.8,.4,C.goldL,tx,7.35,tz);bx(B.glow,.7,.7,.7,C.goldL,tx,7.55,tz,.785,0,.785);
  [[1.8,.4,.9,C.red],[-1.6,1.2,1.0,C.green],[.6,1.8,.8,'#3f6fd6'],[2.3,-1.0,.8,C.gold],[-2.0,-.2,.7,'#a63fb0']].forEach(([a,b,s2,c],i)=>{X('inn',s2,s2,s2,c,tx+a,.4+s2/2,tz+b,i*.4);X('inn',s2+.02,s2+.02,.16,C.white,tx+a,.4+s2/2,tz+b,i*.4);X('inn',.16,s2+.02,s2+.02,C.white,tx+a,.4+s2/2,tz+b,i*.4);X('inn',.34,.26,.34,C.goldL,tx+a,.4+s2+.12,tz+b,i*.4)});solidC(tx,tz,1.5)}
 /* bookshelf and a globe in the north-east, a grandfather clock, a toy shelf with a train and a rocking horse */
 {const bxx=7.4,bz=-HD+.9;X('inn',3.8,4.4,.8,C.wain,bxx,2.4,bz);for(let r=0;r<4;r++){X('inn',3.6,.12,.8,C.pineD,bxx,.8+r*1.05,bz+.02);let x=bxx-1.7;for(let i=0;i<9;i++){const w=.2+((i*7+r*3)%4)*.06,h=.6+((i*5+r)%4)*.14;X('inn',w,h,.55,['#c0392b','#2e6ea5','#e6b422','#2e8b4e','#7a3fb0','#e07a2c'][(i+r*2)%6],x+w/2,.86+r*1.05+h/2,bz+.05);x+=w+.03}}
  solid(bxx-1.95,-HD+.3,bxx+1.95,-HD+1.4);}
 /* the clock */
 {const cx=11.0,cz=-HD+1.0;X('inn',1.3,4.6,1.0,C.wain,cx,2.6,cz);X('inn',1.5,.3,1.2,C.pineD,cx,5.0,cz);X('inn',.9,.9,.1,C.cream,cx,3.8,cz+.55);X('inn',.08,.4,.06,C.iron,cx,3.9,cz+.6);X('inn',.3,.06,.06,C.iron,cx+.1,3.8,cz+.6);X('inn',.6,1.6,.1,C.pineD,cx,2.0,cz+.55);X('inn',.2,.2,.1,C.goldL,cx,1.7,cz+.6);solid(cx-.8,-HD+.3,cx+.8,-HD+1.6)}
 /* Santa's arch: two big candy-cane pillars and a garland swag of lights framing him and the picture window */
 {const px=4.7,pz=-7.9;[-1,1].forEach(s=>{for(let i=0;i<15;i++)X('inn',.6,.32,.6,i%2?C.white:C.red,s*px,.57+i*.31,pz,i*.12);X('inn',.8,.2,.8,C.gold,s*px,.5,pz);X('inn',.7,.16,.7,C.gold,s*px,5.0,pz);bx(B.glow,.5,.5,.5,C.goldL,s*px,5.3,pz,.785,.6,0);solidC(s*px,pz,.45)});
  for(let i=0;i<=20;i++){const f=i/20,x=lerp(-px,px,f),y=4.9-Math.sin(f*Math.PI)*.75+Math.sin(f*Math.PI*4)**2*-.12;X('inn',.62,.36,.44,i%2?C.green:C.greenD,x,y,pz+.1);if(i%2==0)bx(B.glow,.18,.24,.18,[C.redL,C.goldL,'#4aa3ff','#7fe3a0'][(i/2)%4],x,y-.3,pz+.3)}
  X('inn',.6,.6,.2,C.red,0,4.25,pz+.3);X('inn',.5,.3,.14,C.red,-.45,4.3,pz+.3,0,0,.4);X('inn',.5,.3,.14,C.red,.45,4.3,pz+.3,0,0,-.4);X('inn',.2,.5,.12,C.redD,-.18,3.85,pz+.32,0,0,.2);X('inn',.2,.5,.12,C.redD,.18,3.85,pz+.32,0,0,-.2);
  /* presents stacked inside the arch, either side of Santa */
  [[-3.4,-8.1],[3.4,-8.1]].forEach(([x,z],k)=>{[[0,0,1.0,k?C.green:C.red,C.goldL],[.15,1.0,.7,k?'#3f6fd6':C.gold,C.white],[-.05,1.7,.45,k?C.redL:'#a63fb0',C.goldL]].forEach(([dx,y,s2,c,rb],i)=>{X('inn',s2,s2,s2,c,x+dx,.41+y+s2/2,z,(i+k)*.35);X('inn',s2+.02,s2+.02,.14,rb,x+dx,.41+y+s2/2,z,(i+k)*.35);X('inn',.14,s2+.02,s2+.02,rb,x+dx,.41+y+s2/2,z,(i+k)*.35)});solidC(x,z,.6)})}
 /* the elves' workbench along the east wall: tools, paint pots, a toy soldier, a half-painted rocking horse, a lamp */
 {const bxx=10.7,bz=-.9,L=6.0;X('inn',1.6,.18,L,C.pine,bxx,1.45,bz);X('inn',1.5,.1,L-.2,C.pineD,bxx,.75,bz);[[-.65,-L/2+.2],[.65,-L/2+.2],[-.65,L/2-.2],[.65,L/2-.2]].forEach(([a,b])=>X('inn',.18,1.1,.18,C.wain,bxx+a,.95,bz+b));
  X('inn',.5,.24,.4,C.iron,bxx-.2,1.66,bz-2.5);X('inn',.12,.34,.12,C.iron,bxx-.2,1.86,bz-2.5);
  [[C.redL,-1.8],['#4aa3ff',-1.45],[C.goldL,-1.1],[C.greenL,-.75]].forEach(([c,z])=>{X('inn',.26,.3,.26,'#d9d9d9',bxx+.3,1.7,bz+z);X('inn',.22,.06,.22,c,bxx+.3,1.86,bz+z)});X('inn',.06,.5,.06,C.wain,bxx+.3,1.95,bz-1.45,0,0,.3);
  /* toy soldier */
  {const sx=bxx-.3,sz=bz+.2;X('inn',.24,.18,.18,C.navy,sx,1.63,sz);X('inn',.26,.3,.2,C.red,sx,1.87,sz);X('inn',.2,.2,.18,'#f0b48a',sx,2.12,sz);X('inn',.22,.3,.2,C.iron,sx,2.36,sz);X('inn',.06,.06,.06,C.goldL,sx,2.0,sz+.11)}
  /* rocking horse, half painted */
  {const hx=bxx-.1,hz=bz+1.6;X('inn',.2,.1,1.3,C.redD,hx,1.6,hz);X('inn',.34,.4,.9,C.white,hx,2.0,hz);X('inn',.34,.4,.4,C.cream,hx,2.0,hz+.25);X('inn',.3,.5,.3,C.white,hx,2.4,hz+.55);X('inn',.28,.26,.4,C.white,hx,2.6,hz+.75);X('inn',.12,.5,.12,C.red,hx,2.5,hz+.35);X('inn',.1,.4,.1,C.logD,hx,2.0,hz-.5);[[-.1,-.3],[-.1,.3]].forEach(([a,b])=>X('inn',.1,.3,.1,C.logD,hx+a,1.75,hz+b))}
  /* a lamp with a warm glow, a wooden mallet, scattered blocks */
  X('inn',.3,.06,.3,C.iron,bxx+.4,1.57,bz+2.5);X('inn',.06,.7,.06,C.iron,bxx+.4,1.9,bz+2.5);X('inn',.4,.24,.4,C.green,bxx+.25,2.25,bz+2.5);bx(B.glow,.24,.1,.24,'#ffe3a0',bxx+.25,2.12,bz+2.5);
  X('inn',.5,.16,.16,C.logD,bxx-.4,1.62,bz-.9,.4);X('inn',.06,.06,.5,C.wain,bxx-.25,1.6,bz-1.1,.4);
  [[C.red,-.3,.9],['#4aa3ff',.0,1.05],[C.goldL,-.15,1.15]].forEach(([c,a,y],i)=>X('inn',.22,.22,.22,c,bxx+a,1.65+i*.0+(i==2?.22:0),bz+.9+i*.18,i*.4));
  /* a stool in front of it */
  X('inn',.8,.14,.8,C.red,bxx-1.7,1.0,bz+.5);X('inn',.12,.6,.12,C.wain,bxx-1.95,.65,bz+.25);X('inn',.12,.6,.12,C.wain,bxx-1.45,.65,bz+.25);X('inn',.12,.6,.12,C.wain,bxx-1.95,.65,bz+.75);X('inn',.12,.6,.12,C.wain,bxx-1.45,.65,bz+.75);
  solid(bxx-.85,bz-L/2,bxx+.9,bz+L/2);solidC(bxx-1.7,bz+.5,.45)}
 /* the Naughty or Nice list: a lectern with a long scroll that unrolls across the floor */
 {const lx=6.4,lz=-4.6;X('inn',.9,.16,.7,C.wain,lx,.5,lz);X('inn',.24,1.4,.24,C.wain,lx,1.25,lz);X('inn',1.2,.12,.9,C.pineD,lx,2.0,lz,0,-.35);X('inn',1.1,.06,.8,C.cream,lx,2.08,lz,0,-.35);
  for(let i=0;i<5;i++)X('inn',.7,.03,.06,i==0?C.redD:'#6b5a48',lx,2.13,lz-.25+i*.12,0,-.35);
  X('inn',.9,.04,.3,C.cream,lx,1.7,lz+.5,0,.9);X('inn',.9,.04,2.6,C.cream,lx,.43,lz+1.75);X('inn',.95,.18,.18,'#e8dcc0',lx,.5,lz+3.1);for(let i=0;i<9;i++){X('inn',.5+((i*3)%4)*.06,.02,.05,'#6b5a48',lx-.08,.46,lz+.7+i*.24);X('inn',.08,.02,.08,i%3?C.green:C.redL,lx+.32,.46,lz+.7+i*.24)}
  solidC(lx,lz,.5)}
 /* Santa's sack, bulging with toys, and a pile of presents in the south-east corner */
 {const sx=9.6,sz=6.6;X('inn',2.0,1.2,1.8,'#a87a3c',sx,1.0,sz);X('inn',1.8,.7,1.6,'#a87a3c',sx,1.9,sz);X('inn',1.3,.4,1.2,'#956a32',sx,2.4,sz);X('inn',1.7,.14,1.5,C.red,sx,2.2,sz);for(let i=0;i<5;i++)X('inn',.22,.6,.22,'#956a32',sx-.8+i*.4,1.0,sz+.92);
  X('inn',.5,.5,.4,'#b5733a',sx-.2,2.8,sz);X('inn',.18,.18,.1,'#b5733a',sx-.38,3.1,sz);X('inn',.18,.18,.1,'#b5733a',sx-.02,3.1,sz);X('inn',.08,.08,.04,'#1d1d22',sx-.28,2.85,sz+.22);X('inn',.08,.08,.04,'#1d1d22',sx-.12,2.85,sz+.22);
  X('inn',.6,.4,.6,C.redL,sx+.4,2.75,sz-.1,.4);X('inn',.62,.06,.62,C.white,sx+.4,2.95,sz-.1,.4);for(let i=0;i<4;i++)X('inn',.12,.6,.12,i%2?C.white:C.red,sx-.6,2.7+i*.0,sz+.3,0,0,.4);
  [[-1.9,.3,.9,C.green],[-1.6,1.1,.7,C.gold],[1.5,.5,.8,'#3f6fd6'],[1.2,-1.2,.7,C.red],[-1.3,-1.0,.6,'#a63fb0']].forEach(([a,b,s2,c],i)=>{X('inn',s2,s2,s2,c,sx+a,.41+s2/2,sz+b,i*.5);X('inn',s2+.02,s2+.02,.14,C.white,sx+a,.41+s2/2,sz+b,i*.5);X('inn',.34,.24,.34,C.goldL,sx+a,.41+s2+.1,sz+b,i*.5)});
  solid(sx-2.5,sz-1.8,sx+2.2,sz+1.6)}
 /* coat rack by the door with Santa's spare coat and hat, and a pair of boots */
 {const cx=-4.0,cz=7.6;X('inn',.8,.12,.8,C.wain,cx,.47,cz);X('inn',.16,3.6,.16,C.wain,cx,2.2,cz);X('inn',1.0,.1,.1,C.wain,cx,3.8,cz,0,0,0);X('inn',.1,.1,1.0,C.wain,cx,3.8,cz);
  X('inn',.9,1.6,.5,C.red,cx+.3,2.8,cz);X('inn',.95,.18,.55,C.white,cx+.3,2.05,cz);X('inn',.2,1.5,.08,C.white,cx+.3,2.8,cz+.27);X('inn',.95,.14,.55,'#1d1d22',cx+.3,2.5,cz);
  X('inn',.6,.18,.6,C.white,cx-.35,3.95,cz);X('inn',.5,.4,.5,C.red,cx-.35,4.2,cz-.05);X('inn',.22,.22,.22,C.white,cx-.15,4.4,cz-.3);
  X('inn',.3,.4,.5,'#1d1d22',cx+1.0,.6,cz+.2);X('inn',.3,.4,.5,'#1d1d22',cx+1.4,.6,cz+.2);X('inn',.34,.1,.54,C.white,cx+1.0,.82,cz+.2);X('inn',.34,.1,.54,C.white,cx+1.4,.82,cz+.2);
  solidC(cx,cz,.45)}
 /* a basket of firewood beside the fireplace */
 {const fx=-10.6,fz=2.4;X('inn',1.2,.6,1.0,'#8d6330',fx,.7,fz);X('inn',1.25,.1,1.05,'#6e4a22',fx,1.0,fz);for(let i=0;i<5;i++)X('inn',.24,.24,1.1,LOGS[i%3],fx-.42+i*.21,1.12+(i%2)*.12,fz,0,0,0);solidC(fx,fz,.6)}
 /* the toy train's track: an oval of ties and rails on the floor (the train runs round it, see stepTrain) */
 for(let i=0;i<44;i++){const a=i/44*Math.PI*2,x=TRK.x+Math.cos(a)*TRK.rx,z=TRK.z+Math.sin(a)*TRK.rz,tx=-Math.sin(a)*TRK.rx,tz=Math.cos(a)*TRK.rz,tl=Math.hypot(tx,tz),nx=tz/tl,nz=-tx/tl;
  X('inn',.72,.04,.16,C.logD,x,.42,z,Math.atan2(-nz,nx));[-1,1].forEach(s=>X('inn',.5,.05,.06,C.iron,x+nx*.22*s,.45,z+nz*.22*s,Math.atan2(-tz,tx)))}
 /* garland swags and warm bulbs along the north wall, round the window, across the fireplace wall */
 for(let i=0;i<=24;i++){const x=-HW+1+i*(HW*2-2)/24,y=WH-.5-Math.sin(i/24*Math.PI*4)**2*.45;X('inn',1.0,.26,.34,i%2?C.green:C.greenD,x,y,-HD+.36);if(i%3==0)X('inn',.22,.22,.22,C.redL,x,y-.1,-HD+.55)}
 /* progress baubles: five big ornaments hang over Santa and light up one per feeding (gold) */
 for(let i=0;i<5;i++){X('inn',.1,.9+((i%2)*.3),.1,C.goldL,-4+i*2,WH-1.0,-HD+.5);}
}
buildInside();

/* the picture window behind Santa: moonlit pines and a few aurora bands, painted on a canvas (nearest-neighbour like the game's art) */
function paintWindow(c,w,h){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0b1236');g.addColorStop(.6,'#1d2a5e');g.addColorStop(1,'#3c4f8c');c.fillStyle=g;c.fillRect(0,0,w,h);
 let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<90;i++){c.fillStyle=`rgba(255,255,255,${.4+r()*.6})`;const z=r()<.15?3:2;c.fillRect(r()*w|0,r()*h*.6|0,z,z)}
 /* aurora */
 for(let i=0;i<5;i++){const ag=c.createLinearGradient(0,0,0,h*.5);ag.addColorStop(0,'rgba(80,255,170,0)');ag.addColorStop(.5,`rgba(${60+i*20},255,${160+i*10},.${3+i%3})`);ag.addColorStop(1,'rgba(80,255,170,0)');c.fillStyle=ag;c.beginPath();c.moveTo(0,h*.2);for(let x=0;x<=w;x+=8)c.lineTo(x,h*(.18+i*.04)+Math.sin(x*.02+i)*h*.06);for(let x=w;x>=0;x-=8)c.lineTo(x,h*(.34+i*.04)+Math.sin(x*.025+i*2)*h*.05);c.closePath();c.fill()}
 c.fillStyle='#f4f1d8';c.beginPath();c.arc(w*.78,h*.2,h*.09,0,7);c.fill();c.fillStyle='#d9d6b4';c.beginPath();c.arc(w*.755,h*.18,h*.02,0,7);c.fill();
 /* snowy hills and pines */
 c.fillStyle='#dfe9f5';c.beginPath();c.moveTo(0,h);c.lineTo(0,h*.78);for(let x=0;x<=w;x+=10)c.lineTo(x,h*.76+Math.sin(x*.012)*h*.04);c.lineTo(w,h);c.fill();
 for(let i=0;i<14;i++){const x=r()*w,hh=h*(.14+r()*.18),y=h*.8;c.fillStyle='#14301f';for(let t=0;t<4;t++){const tw=hh*.5*(1-t*.2);c.beginPath();c.moveTo(x-tw,y-t*hh*.22);c.lineTo(x,y-t*hh*.22-hh*.35);c.lineTo(x+tw,y-t*hh*.22);c.fill()}c.fillStyle='rgba(240,248,255,.8)';c.fillRect(x-1,y-hh*.9,2,2)}}
function canvasTex(w,h,draw,px){const cv=document.createElement('canvas');cv.width=Math.round(w*px);cv.height=Math.round(h*px);draw(cv.getContext('2d'),cv.width,cv.height);const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;return t}
const FONT="'Silkscreen','Courier New',monospace";
const flat=(tex,w,h,x,y,z,ry,extra)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial(Object.assign({map:tex,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},extra||{})));m.position.set(x,y,z);m.rotation.y=ry||0;return m};
{/* big window on the north wall: frame boxes + the painting */
 const wx=0,wy=3.0,ww=6.4,wh=3.4,z=-HD+.31;
 X('inn',ww+.8,.4,.3,C.white,wx,wy-wh/2-.2,z+.05);X('inn',ww+.8,.4,.3,C.white,wx,wy+wh/2+.2,z+.05);[-1,1].forEach(s=>X('inn',.4,wh+.8,.3,C.white,wx+s*(ww/2+.2),wy,z+.05));X('inn',.16,wh,.2,C.white,wx,wy,z+.1);X('inn',ww,.16,.2,C.white,wx,wy,z+.1);
 X('inn',ww+1.0,.2,.5,C.pineD,wx,wy-wh/2-.5,z+.15);[-1,1].forEach(s=>{X('inn',1.1,wh+.6,.2,C.red,wx+s*(ww/2+1.1),wy,z+.05);X('inn',1.1,.3,.22,C.white,wx+s*(ww/2+1.1),wy+wh/2+.2,z+.06)});
 const tex=canvasTex(ww,wh,paintWindow,40);stat.add(flat(tex,ww,wh,wx,wy,z-.02+.0,0));
 /* the sign over the front door: canvas lettering on the board */
 const sign=canvasTex(6,1,(c,w,h)=>{c.fillStyle='#6b3b1f';c.fillRect(0,0,w,h);c.fillStyle='#8a5530';for(let i=0;i<8;i++)c.fillRect(0,i*h/8,w,2);c.strokeStyle='#f1e6c8';c.lineWidth=6;c.strokeRect(5,5,w-10,h-10);
  c.fillStyle='#000a';c.font='bold '+Math.round(h*.46)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText("SANTA'S LODGE",w/2+3,h*.53+3);c.fillStyle='#f6f8fb';c.fillText("SANTA'S LODGE",w/2,h*.53);c.fillStyle='#e04b3c';c.fillRect(w*.1,h*.82,w*.8,3);c.fillStyle='#46d17a';c.fillRect(w*.1,h*.12,w*.8,3)},60);
 cutG.add(flat(sign,6,1,0,4.5,HD+.51,0));
}

/* ---------- flush the batches into meshes ---------- */
const MAT={ext:lam(),cut:lam(),roof:lam(),inn:lam(),yard:lam(),glow:glowMat(),glowC:glowMat()};
/* windows' panes are in the cut walls' own glow batch so they drop with the walls */
const M={};for(const k of Object.keys(B)){if(!B[k].a.length)continue;const mat=k=='glow'||k=='glowC'?MAT[k]:MAT[k];M[k]=flush(B[k],mat)}

stat.add(M.ext);stat.add(M.inn);stat.add(M.yard);stat.add(M.glow);cutG.add(M.cut);if(M.glowC)cutG.add(M.glowC);roofG.add(M.roof);
const roofMat=MAT.roof;roofMat.transparent=true;
window.FW_LODGE={root,cutG,roofG,LX,LZ,st,solid};

/* =====================================================================================================================
   RUNTIME: one tick per frame (hooked on the main camera's render), a tween list, a timeline, particles, sound
   ===================================================================================================================== */
const TWN=[],SCH=[];let CLOCK=0;
const tween=(dur,fn,done,ease)=>{const t={t:0,d:Math.max(.001,dur),fn,done,ease:ease||(x=>x)};TWN.push(t);fn(t.ease(0));return t};
const after=(sec,fn)=>{SCH.push({at:CLOCK+sec,fn})};
function stepAnims(dt){CLOCK+=dt;for(let i=TWN.length-1;i>=0;i--){const t=TWN[i];t.t+=dt;const k=Math.min(1,t.t/t.d);try{t.fn(t.ease(k))}catch(e){soft(e,'tween')}if(k>=1){TWN.splice(i,1);try{t.done&&t.done()}catch(e){soft(e,'tweenDone')}}}
 for(let i=SCH.length-1;i>=0;i--)if(CLOCK>=SCH[i].at){const f=SCH.splice(i,1)[0].fn;try{f()}catch(e){soft(e,'sched')}}}
/* particles: pooled little boxes, shrink to nothing when their life ends */
const PG=new THREE.BoxGeometry(1,1,1),PM={},PARTS=[];
const pmat=c=>PM[c]||(PM[c]=new THREE.MeshBasicMaterial({color:c}));
function emit(x,y,z,n,o){o=o||{};const cols=o.colors||['#ffffff'];for(let i=0;i<n;i++){const m=new THREE.Mesh(PG,pmat(pk(cols))),a=Math.random()*Math.PI*2,sp=(o.speed||2)*(.4+Math.random()*.9),up=o.up==null?2:o.up;
  const sz=(o.size||.12)*(.6+Math.random()*.8);m.position.set(x+(Math.random()-.5)*(o.spread||0),y+(Math.random()-.5)*(o.spread||0),z+(Math.random()-.5)*(o.spread||0));m.scale.setScalar(sz);m.rotation.set(Math.random()*3,Math.random()*3,0);
  const dirx=o.dir?o.dir[0]:0,dirz=o.dir?o.dir[1]:0;
  PARTS.push({m,vx:Math.cos(a)*sp*(o.dir?.4:1)+dirx*sp,vy:(o.dir?0:up)+Math.random()*up*(o.dir?.4:.8)+(o.dir?o.dir[2]*sp:0),vz:Math.sin(a)*sp*(o.dir?.4:1)+dirz*sp,g:o.grav==null?9:o.grav,life:(o.life||1)*(.7+Math.random()*.6),age:0,sz,spin:(Math.random()-.5)*8,fade:o.fade!=null?o.fade:.6,floor:o.floor==null?.45:o.floor});root.add(m)}}
function stepParts(dt){for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.age+=dt;const k=p.age/p.life;if(k>=1){root.remove(p.m);PARTS.splice(i,1);continue}
  p.vy-=p.g*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;if(p.m.position.y<p.floor&&p.g>0){p.m.position.y=p.floor;p.vy*=-.35;p.vx*=.6;p.vz*=.6}
  p.m.rotation.x+=p.spin*dt;p.m.rotation.y+=p.spin*dt*.7;p.m.scale.setScalar(p.sz*(k<p.fade?1:1-(k-p.fade)/(1-p.fade)))}}

/* ---------- sound: everything is synthesised with the game's own audio helpers ---------- */
const AUD=()=>{try{ac();return AC&&AC.state!='closed'}catch(e){return false}};
function voice(f,d,v,o){/* a soft vowel-ish blip: saw through a low-pass, for Santa's speech */
 if(typeof FX=='undefined'||!FX||!AUD())return;o=o||{};try{const t=AC.currentTime,s=AC.createOscillator(),g=AC.createGain(),l=AC.createBiquadFilter();s.type=o.ty||'sawtooth';s.frequency.setValueAtTime(f*(o.bend||1),t);s.frequency.exponentialRampToValueAtTime(f,t+d*.4);l.type='lowpass';l.frequency.value=o.lp||520;l.Q.value=2;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*FX,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(l);l.connect(g);g.connect(MG);s.start(t);s.stop(t+d+.03)}catch(e){}}
const hoho=n=>{for(let i=0;i<n;i++)voice(150+i*0,.28,.16,{bend:1.5,lp:480,ty:'sawtooth'}),0};
function laugh(n){n=n||3;for(let i=0;i<n;i++)after(i*.34,()=>{voice(135,.26,.2,{bend:1.55,lp:470});voice(270,.2,.07,{ty:'triangle',bend:1.4,lp:700});bellyBounce(.05+(i==n-1?.03:0))})}
function burpSound(big){if(typeof FX=='undefined'||!FX||!AUD())return;try{const t=AC.currentTime,d=big?1.35:.5,o=AC.createOscillator(),o2=AC.createOscillator(),lfo=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain(),l=AC.createBiquadFilter();
  o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(big?120:150,t);o.frequency.exponentialRampToValueAtTime(big?46:70,t+d);o2.frequency.setValueAtTime((big?120:150)*.5,t);o2.frequency.exponentialRampToValueAtTime(big?23:35,t+d);
  lfo.frequency.value=big?26:34;lg.gain.value=big?34:24;lfo.connect(lg);lg.connect(o.frequency);l.type='lowpass';l.frequency.setValueAtTime(big?900:700,t);l.frequency.exponentialRampToValueAtTime(180,t+d);l.Q.value=5;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(FX*(big?.55:.3),t+.06);g.gain.setValueAtTime(FX*(big?.5:.28),t+d*.55);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(l);o2.connect(l);l.connect(g);g.connect(MG);[o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+d+.05)})}catch(e){}
 if(big)safe(()=>sdNz(.6,300,.35,{q:1.2,f2:90}),'bn')}
function rumble(d,v,f){safe(()=>sdNz(d,f||110,v||.3,{q:3,f2:(f||110)*.7,sw:.8}),'rum');safe(()=>sdHit(48,d*.8,v*.5,[[1,1,1],[2,.3,.5]],{jit:0}),'rum2')}
const crunch=()=>{safe(()=>{sdNz(.07,2600,.3,{q:2,f2:900});sdHit(180,.1,.18,[[1,1,1],[2.6,.3,.5]],{bend:.3})},'cr')};
const boing=(k)=>safe(()=>sdHit(160+(k||0)*30,.5,.22,[[1,1,1],[2,.3,.5]],{bend:.9,rev:.15}),'bo');
const chimeUp=()=>{[0,1,2,3].forEach(i=>safe(()=>sdHit([523,659,784,1047][i],.6,.12,[[1,1,1],[2,.16,.45],[5.4,.05,.18]],{del:i*.08,rev:.25,jit:0}),'ch'))};
const sparkSnd=()=>safe(()=>sdHit(1568+Math.random()*400,.25,.07,[[1,1,1],[2,.16,.45]],{jit:0,rev:.2}),'sp');

/* ---------- player helpers ---------- */
const mode_=()=>typeof mode!='undefined'?mode:'';
const lodgeDist=()=>Math.hypot(P.x-LX,P.z-LZ);
const nightF=()=>{const t=S.t||0;return t<240?0:t<300?(t-240)/60*.5:t<330?.5+(t-300)/30*.4:.9};

/* ---------- Santa: a block rig. Everything about his body lives on this object. ---------- */
const GBX=new THREE.BoxGeometry(1,1,1),MC={};
const lm=c=>MC[c]||(MC[c]=new THREE.MeshLambertMaterial({color:c}));
function part(par,w,h,d,c,x,y,z,o){const m=new THREE.Mesh(GBX,lm(c));m.scale.set(w,h,d);m.position.set(x||0,y||0,z||0);if(o&&o.r)m.rotation.set(o.r[0],o.r[1],o.r[2]);m._gdyn=1;par.add(m);return m}
const grp=(par,x,y,z)=>{const g=new THREE.Group();g.position.set(x||0,y||0,z||0);par.add(g);return g};
const SK='#f3bd95',SKD='#dc9a72',FUR='#f8fafc',FURD='#dfe6ee',REDC='#cc2a22',REDD='#a01f19',REDL='#d6352c',BLK='#1d1d22',GLD='#e6b422';
/* Santa's feet stand on the top of the rug under him; every pose keeps them there (the body pivots at the soles) */
const FLOOR_S=.48,HATY=.7;
/* Santa: a chunky block figure in the game's style. Every moving piece hangs from its own pivot:
   body (squash and stretch at the soles) > belly (swells from its bottom) / chest / arms (shoulders) / head (neck) > jaw (beard) / hat > hat tip */
const SANTA=(()=>{
 const A={};const g=A.root=grp(dynG,SNX,FLOOR_S,SNZ);const body=A.body=grp(g,0,0,0);
 /* boots: sole, shaft, a rounded toe, fur cuff; then short red trousers */
 [-1,1].forEach(s=>{const x=s*.25;part(body,.42,.07,.7,'#3b2516',x,.035,.08);part(body,.38,.3,.56,BLK,x,.22,.03);part(body,.34,.18,.2,BLK,x,.16,.4);part(body,.36,.06,.06,'#3a3a44',x,.28,.5);
  part(body,.46,.13,.46,FUR,x,.42,0);part(body,.36,.36,.38,REDC,x,.66,0)});
 /* belly: the part that swells. Its pivot is at its own bottom, so it grows up and out, never down through the floor */
 const belly=A.belly=grp(body,0,.76,0);
 part(belly,1.18,.94,.88,REDC,0,.5,0);part(belly,.16,.74,.72,REDC,-.64,.5,0);part(belly,.16,.74,.72,REDC,.64,.5,0);
 part(belly,1.0,.78,.24,REDC,0,.5,.52);part(belly,.78,.58,.14,REDL,0,.52,.69);part(belly,.5,.36,.06,REDL,-.0,.58,.78);
 /* coat hem with fur that wraps the bulge */
 part(belly,1.26,.16,.94,FUR,0,.09,0);part(belly,1.06,.16,.3,FUR,0,.09,.52);part(belly,.84,.14,.18,FUR,0,.09,.68);part(belly,.2,.16,.78,FUR,-.66,.09,0);part(belly,.2,.16,.78,FUR,.66,.09,0);
 /* fur placket down the front, gold buttons */
 part(belly,.22,.62,.06,FUR,0,.68,.79);A.btn=[.62,.84].map(y=>part(belly,.1,.1,.05,GLD,0,y,.83));
 /* the belt, following every layer of the belly, and a big gold buckle */
 part(belly,1.22,.17,.92,BLK,0,.4,0);part(belly,1.04,.17,.28,BLK,0,.4,.52);part(belly,.82,.17,.18,BLK,0,.4,.69);part(belly,.2,.17,.76,BLK,-.65,.4,0);part(belly,.2,.17,.76,BLK,.65,.4,0);
 part(belly,.36,.27,.05,GLD,0,.4,.8);part(belly,.2,.12,.06,BLK,0,.4,.81);part(belly,.06,.12,.07,'#fff3b0',-.05,.4,.82);
 /* chest, shoulders and a fur collar */
 const chest=A.chest=grp(body,0,1.62,0);part(chest,1.0,.4,.76,REDC,0,0,0);part(chest,1.28,.24,.7,REDC,0,.1,0);part(chest,1.3,.06,.72,REDD,0,.23,0);part(chest,.9,.14,.7,FUR,0,.25,.02);
 /* arms: shoulder pivots; sleeve, elbow, fur cuff, mitten with a thumb */
 A.arm=[-1,1].map(s=>{const a=grp(body,s*.7,1.78,0);part(a,.32,.38,.36,REDC,0,-.16,0);part(a,.3,.34,.34,REDC,0,-.48,.03);part(a,.38,.14,.42,FUR,0,-.69,.03);
  part(a,.3,.26,.32,BLK,0,-.87,.04);part(a,.1,.15,.12,BLK,-s*.13,-.82,.18);return a});
 /* head: a big friendly face */
 const head=A.head=grp(body,0,1.86,.04);part(head,.8,.74,.74,SK,0,.37,0);
 part(head,.1,.2,.16,SKD,-.44,.36,0);part(head,.1,.2,.16,SKD,.44,.36,0);
 /* hair at the sides and back */
 part(head,.12,.34,.56,FUR,-.43,.32,-.06);part(head,.12,.34,.56,FUR,.43,.32,-.06);part(head,.84,.42,.14,FUR,0,.34,-.38);
 /* eyes with a glint, bushy brows, round nose, rosy cheeks */
 A.eye=[-1,1].map(s=>{const e=grp(head,s*.17,.44,.37);part(e,.13,.14,.03,'#fff',0,0,0);part(e,.08,.11,.03,BLK,s*.01,-.01,.01);part(e,.03,.035,.03,'#fff',s*.03,.03,.02);return e});
 A.brow=[-1,1].map(s=>part(head,.26,.09,.08,FUR,s*.18,.57,.38,{r:[0,0,-s*.16]}));
 part(head,.22,.2,.16,'#ec8d82',0,.31,.43);part(head,.12,.06,.04,'#f7b0a6',-.04,.37,.51);
 A.cheekM=[-1,1].map(s=>part(head,.16,.1,.03,'#f08c84',s*.27,.27,.375));
 /* mouth (dark) and tongue sit behind the moustache; the jaw opens below them */
 A.mouth=part(head,.28,.06,.05,'#4a1414',0,.11,.41);A.tongue=part(head,.2,.04,.05,'#e06a78',0,.07,.42);A.tongue.visible=false;
 /* moustache: two curled bunches */
 [-1,1].forEach(s=>{part(head,.3,.15,.16,FUR,s*.16,.2,.44,{r:[0,0,s*.22]});part(head,.14,.11,.13,FUR,s*.34,.13,.43,{r:[0,0,s*.5]})});
 /* upper beard round the cheeks (fixed) */
 part(head,.86,.24,.58,FUR,0,.1,.07);part(head,.14,.34,.5,FUR,-.42,.16,.06);part(head,.14,.34,.5,FUR,.42,.16,.06);
 /* the lower beard is the jaw: it drops open when he eats and burps, and it rides forward on a growing belly */
 const jaw=A.jaw=grp(head,0,.06,.16);
 /* it flows forward over the chest and rests on the belly */
 part(jaw,.86,.3,.5,FUR,0,-.12,.1);part(jaw,.8,.28,.64,FUR,0,-.38,.3);part(jaw,.66,.26,.52,FUR,0,-.6,.5);part(jaw,.48,.22,.38,FUR,0,-.8,.62);part(jaw,.28,.16,.24,FUR,0,-.95,.68);
 part(jaw,.3,.06,.04,FURD,-.14,-.36,.63);part(jaw,.24,.06,.04,FURD,.12,-.58,.77);part(jaw,.16,.05,.04,FURD,-.06,-.78,.82);part(jaw,.22,.05,.1,'#e06a78',0,-.0,.3);
 /* hat: fur brim, a red cone that flops back and to the side, a pom-pom on a wobbly tip */
 const hat=A.hat=grp(head,0,HATY,0);part(hat,.92,.22,.86,FUR,0,0,0);part(hat,.74,.26,.68,REDC,0,.22,-.02);part(hat,.62,.24,.56,REDC,0,.44,-.07);part(hat,.5,.22,.46,REDD,0,.63,-.13);
 const tip=A.tip=grp(hat,.02,.72,-.18);part(tip,.4,.2,.36,REDD,.04,.04,-.06);part(tip,.32,.18,.3,REDD,.12,.08,-.24);part(tip,.26,.18,.24,REDD,.2,.04,-.4);A.pom=part(tip,.3,.3,.3,FUR,.28,-.1,-.54);
 /* a soft round shadow under him */
 A.blob=new THREE.Mesh(new THREE.CircleGeometry(.9,14),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.28,depthWrite:false}));A.blob.rotation.x=-Math.PI/2;A.blob.position.set(0,.012,0);g.add(A.blob);
 A.g=1;A.bw=1;A.open=0;A.tilt=0;A.look=0;A.blink=0;A.nextBlink=2;A.eyeW=1;A.hatLift=0;A.cheek=0;A.sq=0;A.lean=0;A.breath=0;A.swing=[0,0];A.sway=0;A.brows=0;
 return A})();
const SB=.74;/* base size: about 2.4 m tall, so the biggest stage still fits under the 5.2 m walls */
const STAGE=[1,1.14,1.3,1.48,1.68];/* body size after 0..4 treats; he swells a bit more in the belly */
const BELLY=[1,1.12,1.26,1.42,1.6];
/* every frame (and every tween step) the animation numbers become joint angles. Nothing here can move the soles off the floor. */
function applySanta(){const A=SANTA,k=A.g*SB,b=A.bw;
 A.root.scale.setScalar(k);A.root.position.y=FLOOR_S;
 /* squash and stretch keep the volume and pivot at the soles */
 const sq=clamp(A.sq,-.5,.5);A.body.scale.set(1+sq*.14,1-sq*.16,1+sq*.14);A.body.rotation.x=A.lean;
 A.belly.scale.set(b*(1+A.breath*.015),1+(b-1)*.5+A.breath*.02,b*.96);
 /* a big belly pushes the chest and head up a little and the beard forward */
 const lift=(b-1)*.3;A.chest.position.y=1.62+lift;A.head.position.y=1.86+lift;A.head.position.z=.04+(b-1)*.14;A.jaw.position.z=.16+(b-1)*.6;
 A.arm.forEach((a,i)=>{const s=i?1:-1;a.position.x=s*(.7+(b-1)*.66);a.position.y=1.78+lift;
  a.rotation.x=A.armOv?A.armOv[i]:A.swing[i];a.rotation.z=s*(.06+(b-1)*.42)+(A.armZ?A.armZ[i]:0)});
 A.jaw.rotation.x=A.open*.6;A.mouth.scale.set(.28+A.open*.14,.06+A.open*.4,.05);A.mouth.position.y=.11-A.open*.13;A.tongue.visible=A.open>.3;A.tongue.position.y=.03-A.open*.12;A.tongue.scale.set(.2,.04+A.open*.08,.05);
 A.head.rotation.x=A.tilt;A.head.rotation.y=A.look;A.head.rotation.z=A.sway;A.head.scale.setScalar(1+A.cheek*.1);
 A.cheekM.forEach(c=>c.scale.set(.16+A.cheek*.08,.1+A.cheek*.06,.03));
 A.hat.rotation.x=A.hatLift;A.tip.rotation.x=-A.hatLift*1.6;
 A.eye.forEach(e=>{e.scale.set(A.eyeW,Math.max(.08,A.eyeW*(1-A.blink)),1)});A.brow.forEach((w,i)=>{w.position.y=.57+A.brows*.06});
 A.blob.scale.set(b*1.05*(1+sq*.14),b*.95*(1+sq*.14),1)}
SANTA.g=STAGE[0];SANTA.bw=BELLY[0];applySanta();
/* where his head and mouth are, in lodge space, read from the model itself so it is right at any size or pose */
const santaPt=(o,x,y,z)=>{SANTA.root.updateMatrixWorld(true);const v=o.localToWorld(new THREE.Vector3(x,y,z));return root.worldToLocal(v)};
const santaHead=()=>santaPt(SANTA.head,0,.4,0);
const santaMouth=()=>santaPt(SANTA.head,0,.08,.5);
function bellyBounce(a){const A=SANTA,b=A.bw;tween(.28,k=>{A.bw=b+Math.sin(k*Math.PI)*a*1.2;applySanta()},()=>{A.bw=b;applySanta()})}
const easeOutBackS=x=>{const c=1.2,d=c+1;return 1+d*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
function setStage(i,dur){/* grow: a quick crouch, then he stretches up into the new size with one soft overshoot; the belly leads */
 const A=SANTA,g0=A.g,b0=A.bw,g1=STAGE[clamp(i,0,4)],b1=BELLY[clamp(i,0,4)];dur=dur||1.1;
 return tween(dur,k=>{const c=sm(0,.18,k),gk=clamp((k-.12)/.88,0,1),bk=clamp((k-.06)/.8,0,1);
  A.sq=k<.18?c*.35:lerp(.35,0,sm(.18,.5,k))-Math.sin(sm(.18,.75,k)*Math.PI)*.22;
  A.g=lerp(g0,g1,easeOutBackS(gk));A.bw=lerp(b0,b1,easeOutBackS(bk));A.hatLift=Math.sin(sm(.15,1,k)*Math.PI*2)*.16*(1-k);applySanta()},()=>{A.sq=0;A.g=g1;A.bw=b1;A.hatLift=0;applySanta()})}

/* idle behaviour: breathing, blinking, looking at you, a gentle sway */
function santaIdle(dt){const A=SANTA,t=CLOCK;if(A.busy)return;
 A.nextBlink-=dt;if(A.nextBlink<0){A.nextBlink=2+Math.random()*3;tween(.16,k=>{A.blink=Math.sin(k*Math.PI);applySanta()},()=>{A.blink=0})}
 const dx=P.x-(LX+SNX),dz=P.z-(LZ+SNZ),near=Math.hypot(dx,dz)<12&&inside(P.x,P.z);const want=near?clamp(Math.atan2(dx,dz),-.75,.75):0;A.look+=(want-A.look)*Math.min(1,dt*4);
 A.tilt=Math.sin(t*.7)*.025;A.sway=Math.sin(t*.5)*.02;A.breath=Math.sin(t*1.6);A.swing=[Math.sin(t*1.3)*.05,Math.sin(t*1.3+2)*.05];A.tip.rotation.z=Math.sin(t*1.1)*.08;applySanta()}

/* ---------- collectible models: a chocolate-chip cookie and a candy cane, in the game's block style ---------- */
function bakeMesh(fn,mat){const b=mkB();fn(b);return flush(b,mat||lam())}
function cookieBatch(b){
 const R='#a8641f',T='#d99a48',TL='#ecb868',CH='#43230f';
 bx(b,1.0,.22,.62,R,0,.11,0);bx(b,.62,.22,1.0,R,0,.11,0);bx(b,.84,.22,.84,R,0,.11,0);bx(b,.9,.05,.5,'#8f5217',0,.02,0);
 bx(b,.82,.05,.5,T,0,.235,0);bx(b,.5,.05,.82,T,0,.235,0);bx(b,.66,.05,.66,TL,0,.25,0);
 [[-.22,.18],[.2,.24],[.04,-.04],[-.26,-.2],[.28,-.14],[.0,.34],[-.06,-.36]].forEach(([x,z],i)=>{bx(b,.15,.07,.15,CH,x,.29,z,i*.7);bx(b,.07,.03,.07,'#6b3a1c',x-.02,.33,z-.02,i*.7)});
 /* a little bite out of one edge: a notch of darker dough */
 bx(b,.26,.26,.26,'#8f5217',.42,.12,-.28,.4)}
function caneBatch(b){
 const seg=(x,y,rz,i)=>bx(b,.2,.22,.2,i%2?'#f8fafc':'#d8322c',x,y,0,0,0,rz);let n=0;
 for(let i=0;i<5;i++)seg(0,.1+i*.2,0,n++);
 const cx=.3,cy=1.1,r=.3;for(let i=0;i<=5;i++){const th=i/5*Math.PI;seg(cx-r*Math.cos(th),cy+r*Math.sin(th),-th,n++)}
 seg(cx+r,cy-.2,0,n++);seg(cx+r,cy-.4,0,n++);
 /* a ribbon bow where the hook meets the stem */
 bx(b,.2,.14,.2,'#2e8b4e',.06,.78,.12,0,0,.5);bx(b,.2,.14,.2,'#2e8b4e',-.06,.78,.12,0,0,-.5);bx(b,.1,.1,.1,'#c0392b',0,.78,.14)}
function bakeMesh2(fn){const b=mkB();fn(b);return flush(b,lam())}
const MODEL={};
function modelOf(k){if(MODEL[k])return MODEL[k];const g=new THREE.Group();
 if(k=='cookie')g.add(bakeMesh2(cookieBatch));else if(k=='cane'){const m=bakeMesh2(caneBatch);m.position.x=-.3;m.position.y=-.1;g.add(m)}
 return MODEL[k]=g}
const newModel=k=>modelOf(k).clone(true);
/* little pictures of them for the HUD and the buttons (rendered once with a tiny WebGL context) */
const ICON={};let TR=null,TS=null,TCm=null;
function icon(k){if(ICON[k])return ICON[k];return safe(()=>{if(!TR){TR=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});TR.setPixelRatio(1);TR.setSize(48,48);TS=new THREE.Scene();TS.add(new THREE.AmbientLight(0xfff4e6,.7));const l=new THREE.DirectionalLight(0xffe2b0,.8);l.position.set(3,6,5);TS.add(l);TCm=new THREE.PerspectiveCamera(30,1,.1,30)}
  const g=newModel(k);const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());g.position.set(-c.x,-c.y,-c.z);const w=new THREE.Group();w.add(g);w.rotation.set(k=='cookie'?.6:.12,-.55,0);TS.add(w);
  const rad=Math.max(sz.x,sz.y,sz.z);TCm.position.set(0,0,rad*2.7);TCm.lookAt(0,0,0);TR.render(TS,TCm);TS.remove(w);return ICON[k]=TR.domElement.toDataURL()},'icon')||''}

/* ---------- where the treats are hidden: hand-picked meadow, park, street and plaza spots, kept only if the spot is walkable ---------- */
const SPOTS=[
 [118,-22],[132,-33],[70,-30],[60,-18],[150,-20],[170,-34],[40,-24],[100,-12],[20,-30],[-8,-20],[-40,-28],[-70,-24],[190,-26],[220,-24],
 [95,-62],[60,-95],[130,-70],[20,-72],[165,-120],[30,-120],[80,-130],[150,-52],[102,-98],
 [10,-8],[30,-5],[64,-6],[132,-7],[172,-9],[210,-12],
 [-90,-10],[-110,4],[-60,-40],[240,-10],[270,-20],[250,-40],
 [575,30],[590,60],[620,48],[560,0],[640,40]
];
const COOLDOWN=150;/* seconds until a picked treat is back */
let ACTIVE=[];const COLL=new THREE.Group();COLL.name='lodgeTreats';WORLD.add(COLL);
const beamTex=(()=>{const cv=document.createElement('canvas');cv.width=8;cv.height=64;const c=cv.getContext('2d'),g=c.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(255,225,140,0)');g.addColorStop(.7,'rgba(255,225,140,.55)');g.addColorStop(1,'rgba(255,240,190,.9)');c.fillStyle=g;c.fillRect(0,0,8,64);return new THREE.CanvasTexture(cv)})();
const beamMat=new THREE.MeshBasicMaterial({map:beamTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});beamMat.userData.xms=1;
const beamGeo=new THREE.PlaneGeometry(1.1,5);
const ringGeo=new THREE.RingGeometry(.55,.72,16),ringMat=new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
const shGeo=new THREE.CircleGeometry(.5,10),shMat=new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.25,depthWrite:false});
function spawnSpots(){COLL.children.slice().forEach(o=>COLL.remove(o));ACTIVE=[];
 SPOTS.forEach((p,i)=>{let ok=true;try{ok=!hit(p[0],p[1],.7)}catch(e){}if(!ok)return;
  const kind=i%2?'cane':'cookie',g=new THREE.Group();g.position.set(p[0],0,p[1]);const it=new THREE.Group();it.add(newModel(kind));it.scale.setScalar(kind=='cookie'?1.5:1.35);g.add(it);
  const b1=new THREE.Mesh(beamGeo,beamMat),b2=new THREE.Mesh(beamGeo,beamMat);b1.position.y=2.6;b2.position.y=2.6;b2.rotation.y=Math.PI/2;g.add(b1);g.add(b2);
  const ring=new THREE.Mesh(ringGeo,ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=.06;g.add(ring);
  const sh=new THREE.Mesh(shGeo,shMat);sh.rotation.x=-Math.PI/2;sh.position.y=.03;g.add(sh);
  COLL.add(g);ACTIVE.push({id:i,kind,x:p[0],z:p[1],g,it,ring,sh,beams:[b1,b2],ph:Math.random()*6,state:'idle',t:0})});
 refreshSpots()}
function refreshSpots(){const s=st(),now=Date.now();ACTIVE.forEach(a=>{const rd=(s.cd[a.id]||0)<=now;if(rd&&a.state=='gone'){a.state='idle';a.g.visible=true;a.it.scale.setScalar(.01);a.t=0;a.pop=1;a.beams.forEach(b=>b.visible=true)}else if(!rd&&a.state=='idle'){a.state='gone';a.g.visible=false}})}
function collect(a){if(a.state!='idle')return;const s=st();a.state='fly';a.t=0;s.c[a.kind]=(s.c[a.kind]||0)+1;s.cd[a.id]=Date.now()+COOLDOWN*1000;sv();
 emit(a.x-LX,.9,a.z-LZ,16,{colors:a.kind=='cookie'?['#d99a48','#ecb868','#fff6c8']:['#ffffff','#d8322c','#fff6c8'],speed:2.6,up:3,size:.14,life:.8,floor:0});sn('chime');safe(()=>sdHit(1175,.3,.1,[[1,1,1],[2,.2,.4]],{del:.06,jit:0}),'pk');
 a.beams.forEach(b=>b.visible=false);toast(a.kind);hudSync(1)}
const NAMES={cookie:['Cookie','Cookies'],cane:['Candy cane','Candy canes']};
let TOASTE=null,TOASTT=0;
function toast(kind){const s=st(),e=TOASTE||(TOASTE=document.createElement('div'));e.id='lodgetoast';e.innerHTML=`<img src="${icon(kind)}" alt=""><span><b>+1 ${NAMES[kind][0]}</b><small>You have ${s.c.cookie} cookie${s.c.cookie==1?'':'s'} and ${s.c.cane} candy cane${s.c.cane==1?'':'s'}. Take them to Santa!</small></span>`;if(!e.parentNode)document.body.appendChild(e);e.classList.remove('on');void e.offsetWidth;e.classList.add('on');TOASTT=3.2}
function stepSpots(dt){let nd=1e9;
 for(const a of ACTIVE){const d=Math.hypot(P.x-a.x,P.z-a.z);
  if(a.state=='idle'){if(d>95&&!a.pop){a.g.visible=false;continue}a.g.visible=true;a.ph+=dt;
   if(a.pop){a.t+=dt;const k=clamp(a.t/.6,0,1),sc=(a.kind=='cookie'?1.5:1.35)*easeOutBack(k);a.it.scale.setScalar(Math.max(.01,sc));if(k>=1)a.pop=0}
   a.it.position.y=1.0+Math.sin(a.ph*2.2)*.16;a.it.rotation.y=a.ph*1.4;a.it.rotation.z=Math.sin(a.ph*1.7)*.12;a.ring.scale.setScalar(1+Math.sin(a.ph*3)*.12);a.sh.scale.setScalar(1-Math.sin(a.ph*2.2)*.12);
   a.beams.forEach((b,i)=>{b.scale.x=.8+Math.sin(a.ph*2+i)*.2});
   if(mode_()=='play'&&d<1.25&&!inside(P.x,P.z))collect(a);if(d<nd)nd=d}
  else if(a.state=='fly'){a.t+=dt;const k=clamp(a.t/.55,0,1);a.it.position.y=1.0+k*2.6;a.it.rotation.y+=dt*14;a.it.scale.setScalar(Math.max(.01,(a.kind=='cookie'?1.5:1.35)*(1-k)));if(k>=1){a.state='gone';a.g.visible=false}}
  else if(a.state=='gone'){a.cd=(a.cd||0)+dt;if(a.cd>1){a.cd=0;refreshSpots()}}}
 if(TOASTT>0){TOASTT-=dt;if(TOASTT<=0&&TOASTE)TOASTE.classList.remove('on')}}

/* ---------- HUD chip with what you carry ---------- */
const hud=document.createElement('div');hud.id='lodgehud';document.body.appendChild(hud);let hudK='';
function hudSync(force){const s=st(),n=s.c.cookie+s.c.cane,show=n>0&&mode_()=='play'&&!away(),k=show?s.c.cookie+'|'+s.c.cane:'';if(k==hudK&&!force)return;hudK=k;
 hud.style.display=show?'flex':'none';if(show)hud.innerHTML=`<span title="Cookies for Santa"><img src="${icon('cookie')}" alt="">${s.c.cookie}</span><span title="Candy canes for Santa"><img src="${icon('cane')}" alt="">${s.c.cane}</span><small>Take them to Santa's Lodge</small>`}

/* ---------- styles (the dialogue and reveal styles are added further down) ---------- */
const css=document.createElement('style');css.textContent=`
#lodgehud{position:fixed;right:10px;top:132px;z-index:60;display:none;align-items:center;gap:8px;padding:4px 8px;background:#000;color:#e8f3ec;border:2px solid #000;box-shadow:inset 0 -3px #0007,0 0 0 2px #2e8b4e;font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none}
#lodgehud span{display:flex;align-items:center;gap:3px}#lodgehud img{width:22px;height:22px;image-rendering:pixelated}#lodgehud small{font:9px Silkscreen,ui-monospace,monospace;color:#8aa094;max-width:90px;line-height:1.2}
#lodgetoast{position:fixed;left:50%;top:70px;z-index:61;display:flex;align-items:center;gap:10px;padding:8px 14px;background:#000;color:#fff;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e8b4e,4px 4px 0 #0008;opacity:0;transform:translate(-50%,-14px);transition:opacity .25s,transform .25s;pointer-events:none;font:12px ui-monospace,monospace}
#lodgetoast.on{opacity:1;transform:translate(-50%,0)}#lodgetoast img{width:34px;height:34px;image-rendering:pixelated}#lodgetoast b{display:block;font:700 13px Silkscreen,ui-monospace,monospace;color:#ffd75e;letter-spacing:1px}#lodgetoast small{color:#8aa094;font-size:11px}
`;document.head.appendChild(css);

/* ---------- twinkling string lights (four colours chasing), flames, smoke ---------- */
const BULBC=['#ff4b4b','#ffd23f','#46e083','#5fb4ff'],BULBM=BULBC.map(c=>new THREE.MeshBasicMaterial({color:c,transparent:true}));
{const set=()=>BULBC.map(()=>mkB());
 const strand=(arr,x0,y0,z0,x1,y1,z1,sag,step)=>{const L=Math.hypot(x1-x0,z1-z0),cnt=Math.max(2,Math.round(L/step));for(let i=0;i<=cnt;i++){const f=i/cnt,x=lerp(x0,x1,f),z=lerp(z0,z1,f),y=lerp(y0,y1,f)-Math.sin(f*Math.PI)*sag;bx(arr[i%4],.18,.22,.18,'#fff',x,y,z)}};
 const roofB=set(),inB=set(),porchB=set();
 for(const s of[-1,1])for(let i=0;i<4;i++){const a=-HW-1+i*(HW*2+2)/4,b=a+(HW*2+2)/4;strand(roofB,a,WH+.05,s*(RUN+.1),b,WH+.05,s*(RUN+.1),.45,.62)}
 for(let i=0;i<3;i++){const a=-HW+1.4+i*7.4;strand(inB,a,WH-.55,-HD+.55,a+7.4,WH-.55,-HD+.55,.7,.6)}
 strand(porchB,-4.7,4.1,HD+4.45,4.7,4.1,HD+4.45,.45,.6);
 const mk=(arr,par)=>arr.forEach((b,i)=>{if(b.a.length)par.add(flush(b,BULBM[i]))});mk(roofB,roofG);mk(inB,stat);mk(porchB,stat)}
/* flames in the fireplace and the glowing embers */
const FLM=[new THREE.MeshBasicMaterial({color:'#ff6a1a'}),new THREE.MeshBasicMaterial({color:'#ffb52e'}),new THREE.MeshBasicMaterial({color:'#fff0a0'})];
const FLAMES=[];{const fx=-HW+.4+1.2;[[-.9,.8],[-.2,1.1],[.5,.8],[1.0,.6]].forEach(([dz,h],i)=>{for(let l=0;l<3;l++){const f=new THREE.Mesh(GBX,FLM[l]);f.scale.set(.5-l*.12,h*(1-l*.22),.4-l*.08);f.position.set(fx,.7+h*(1-l*.22)/2,-1.5+dz);dynG.add(f);FLAMES.push({m:f,h:h*(1-l*.22),ph:i*1.7+l,l})}})}
const FIRE=new THREE.PointLight(0xffa24a,0,24,1.7);FIRE.position.set(LX-8.6,2.3,LZ-1.5);scene.add(FIRE);
let smokeT=0;

/* ---------- the place: roof lift, cut-away walls, light, camera zoom ---------- */
let inK=0,wasIn=false,GREETED=0;
const viewWant=()=>{const m=mode_();if(!(m=='play'||m=='menu'))return 0;if(DLG&&DLG.open)return 9.8;if(inK>.5)return 13;return 0};
{const v0=window.VIEWX;window.VIEWX=function(){const r=safe(viewWant,'view');if(r)return r;return typeof v0=='function'?v0():0}}
function stepPlace(dt){const d=lodgeDist();if(d>85){if(FIRE.intensity)FIRE.intensity=0;return false}
 const m=mode_(),here=(m=='play'||m=='menu')&&inside(P.x,P.z)&&!away();
 inK+=((here?1:0)-inK)*(1-Math.exp(-dt*(here?5:7)));if(Math.abs(inK-(here?1:0))<.003)inK=here?1:0;
 const ro=1-sm(.05,.8,inK);roofMat.opacity=ro;roofG.visible=ro>.02;roofG.position.y=sm(0,1,inK)*1.2;BULBM.forEach(b=>b.opacity=ro);
 cutG.scale.y=lerp(1,.2,sm(.1,.95,inK));cutG.visible=true;
 if(here&&!wasIn){if(!GREETED||CLOCK-GREETED>90){GREETED=CLOCK;greet()}safe(()=>sdHit(1047,.9,.1,[[1,1,1],[2.7,.25,.4],[5.1,.1,.2]],{rev:.4,jit:0}),'bell');safe(()=>sdHit(1319,.8,.08,[[1,1,1],[2.7,.25,.4]],{del:.12,rev:.4,jit:0}),'bell2')}
 wasIn=here;
 /* firelight: warm, flickers; stronger at night and when you are inside */
 const fl=.85+Math.sin(CLOCK*11)*.08+Math.sin(CLOCK*23+1)*.07,nk=nightF();FIRE.intensity=(.3+nk*.9)*fl*(.35+inK*.65)*(d<60?1:0);
 FLAMES.forEach(f=>{const k=.8+Math.sin(CLOCK*9+f.ph)*.18+Math.sin(CLOCK*17+f.ph*2)*.12;f.m.scale.y=f.h*k;f.m.position.y=.7+f.h*k/2});
 BULBM.forEach((mt,i)=>{const k=.55+.45*Math.sin(CLOCK*2.6+i*1.6);mt.color.set(BULBC[i]).multiplyScalar(.5+k*.6)});
 smokeT-=dt;if(smokeT<0&&d<60){smokeT=.45;emit(6.5,RIDGE+4.2,-3.6,1,{colors:['#f0f3f7','#dde3ea','#c9d1da'],speed:.15,up:.5,grav:-.3,life:4.5,size:.7,fade:.25,floor:-9,spread:.5})}
 return true}

/* ---------- map: a pin on the big map and a lodge on the minimap and the big map ---------- */
try{if(!POIS.some(q=>q[2]=="Santa's Lodge"))POIS.push([LX+2,LZ+14,"Santa's Lodge",'#e74c3c'])}catch(e){}
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){const r=m0.apply(this,arguments);try{if(away())return r;x.save();x.lineJoin='round';x.translate(sx(LX),sz(LZ));x.scale(kx,kz);const fine=kx>.25;
  const R=(cx,cz,w,d,col)=>{x.fillStyle=col;x.fillRect(cx-w/2,cz-d/2,w,d)};
  R(0,5,34,36,'#e9f0f6');R(.5,.5,25,19,'rgba(0,0,0,.25)');R(0,0,25,19,'#7c4d2c');R(0,-4.2,25,10.6,'#b83a30');R(0,4.2,25,10.6,'#a8302a');R(0,-4.2,25,3,'#f6f8fb');R(0,0,25,.6,'#f6f8fb');
  R(0,12,5,6,'#c58f55');R(0,17,3,10,'#8e9399');if(fine){R(-9,10,1.4,1.4,'#e04b3c');R(9,10,1.4,1.4,'#e04b3c');R(0,-17,1,1,'#2e8b4e')}
  [[-19,-14],[19,-14],[-21,-2],[21,4]].forEach(([a,b])=>{x.fillStyle='#2e8b4e';x.beginPath();x.arc(a,b,2.6,0,6.283);x.fill()});
  /* treats still out there, as little dots, on the minimap only */
  if(mini){x.setTransform(1,0,0,1,0,0);ACTIVE.forEach(a=>{if(a.state!='idle')return;const X=sx(a.x),Z=sz(a.z);if(X<4||Z<4||X>146||Z>146)return;x.fillStyle=a.kind=='cookie'?'#e6a24a':'#ffffff';x.strokeStyle='#000';x.lineWidth=1;x.beginPath();x.arc(X,Z,3,0,6.283);x.fill();x.stroke();if(a.kind=='cane'){x.fillStyle='#d8322c';x.fillRect(X-1,Z-1,2,2)}})}
  x.restore()}catch(e){try{x.restore()}catch(e2){}}return r}}

/* ---------- interactions: E near Santa; E on the present on the rug ---------- */
const PRES_AT=[SNX,SNZ+3.8];
INT.push({x:LX+SNX,z:LZ+SNZ+1.6,get r(){return mode_()=='play'&&!SANTA.busy&&inside(P.x,P.z)?4.6:0},get l(){const s=st();return s.pr&&!s.pr.done?'Santa has a present for you':'Talk to Santa'},a:()=>talk()});
INT.push({x:LX+PRES_AT[0],z:LZ+PRES_AT[1],get r(){return mode_()=='play'&&PRES.on&&PRES.ready&&!SANTA.busy?2.8:0},l:'Open the present',a:()=>openPresent()});
/* the main tick, run once per frame just before the main camera draws */
let lastT=performance.now();
const r0=renderer.render.bind(renderer);
renderer.render=function(sc,c){if(c===cam){const n=performance.now(),dt=Math.min(.06,(n-lastT)/1000);lastT=n;if(!(typeof PAUSED!='undefined'&&PAUSED)){try{tick(dt)}catch(e){soft(e,'tick')}}if(CUT.live)return filmRender(sc)}return r0(sc,c)};
/* ---------- the toy train: an engine and two little wagons chuffing round the oval track ---------- */
const TRAIN=(()=>{const cars=[];const mk=(i)=>{const g=grp(dynG,0,0,0);
  if(i==0){part(g,.5,.12,.9,'#1d1d22',0,.53,0);part(g,.4,.34,.5,REDC,0,.76,.12);part(g,.34,.34,.34,'#2e2e36',0,.76,.12);part(g,.36,.36,.4,'#2e2e36',0,.78,.18);part(g,.44,.48,.38,REDC,0,.84,-.24);part(g,.5,.08,.46,'#1d1d22',0,1.1,-.24);
   part(g,.12,.24,.12,'#1d1d22',0,1.06,.3);part(g,.18,.06,.18,'#1d1d22',0,1.2,.3);part(g,.38,.06,.06,GLD,0,.62,.47);part(g,.2,.16,.04,'#ffe3a0',0,.8,.4);part(g,.06,.12,.06,GLD,0,1.0,.06)}
  else{part(g,.48,.1,.74,'#1d1d22',0,.53,0);part(g,.46,.26,.7,i==1?'#2e8b4e':'#3f6fd6',0,.71,0);part(g,.5,.06,.74,GLD,0,.86,0);
   part(g,.26,.24,.26,i==1?REDC:GLD,-.06,.98,-.12);part(g,.28,.04,.06,'#f6f8fb',-.06,.98,-.12);part(g,.2,.2,.2,i==1?GLD:REDC,.08,.96,.18)}
  [-1,1].forEach(s=>[-.25,.25].forEach(z=>part(g,.06,.16,.16,'#1d1d22',s*.26,.5,z)));return g};
 for(let i=0;i<3;i++)cars.push(mk(i));return{cars,a:0,puff:0}})();
function stepTrain(dt){const T=TRAIN;T.a=(T.a+dt*.32)%(Math.PI*2);
 T.cars.forEach((g,i)=>{const a=T.a-i*.36,x=TRK.x+Math.cos(a)*TRK.rx,z=TRK.z+Math.sin(a)*TRK.rz,tx=-Math.sin(a)*TRK.rx,tz=Math.cos(a)*TRK.rz;
  g.position.set(x,Math.abs(Math.sin(CLOCK*14+i))*.012,z);g.rotation.y=Math.atan2(tx,tz)});
 T.puff-=dt;if(T.puff<0&&inK>.5){T.puff=.5;const g=T.cars[0],v=new THREE.Vector3(0,1.25,.3).applyMatrix4(g.matrixWorld);root.worldToLocal(v);emit(v.x,v.y,v.z,1,{colors:['#ffffff','#e8edf2'],speed:.2,up:.7,grav:-.4,life:1.3,size:.16,fade:.3,floor:-9,spread:.05})}}
/* the floor is solid: inside the lodge, on the porch and on the steps you walk on top of the boards and rugs, not through them.
   23-v18 sets SY (the player's height) to 0 every tick; this runs after it and lifts you to the surface under your feet, easing over each step. */
function floorAt(wx,wz){const x=wx-LX,z=wz-LZ,ax=Math.abs(x);
 if(ax<HW&&z>-HD&&z<HD+.45){if(z>HD-.45)return ax<1.8?.4:0;
  const rr=Math.hypot(x,z+3.4);if(rr<2.5)return .475;if(rr<3.85)return .47;if(rr<4.2)return .45;if(rr<4.5)return .43;
  if(ax<1.3&&z>1.2&&z<8.6)return .445;if(Math.hypot(x+7.6,z+1.5)<1.7)return .47;return .41}
 if(ax<4.5&&z>=HD+.45&&z<HD+4.75)return .3;if(ax<1.6&&z>=HD+4.75&&z<HD+5.7)return .21;if(ax<1.8&&z>=HD+5.7&&z<HD+6.6)return .15;return 0}
let FLY=0;
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{if(!away()&&!(P.sit)&&lodgeDist()<30){const h=floorAt(P.x,P.z);FLY+=(h-FLY)*Math.min(1,(dt||.016)*18);if(Math.abs(FLY-h)<.004)FLY=h;if(FLY>0||h>0)SY=FLY}else FLY=0}catch(e){soft(e,'floor')}return r}}
let hudT=0;
function tick(dt){if(!away()){TSC+=(CUT.ts-TSC)*Math.min(1,dt*12);const ds=dt*TSC;stepAnims(ds);const near=stepPlace(dt);stepSpots(dt);stepParts(ds);if(near){santaIdle(ds);stepPresent(ds);stepTrain(dt);stepBubble(dt);camFx(dt)}}hudT-=dt;if(hudT<0){hudT=.3;hudSync();if(mode_()!='play'&&hud.style.display!='none')hud.style.display='none'}}

/* =====================================================================================================================
   SANTA TALKS, YOU FEED HIM, HE GROWS, HE BURPS, A PRESENT FLIES OUT
   ===================================================================================================================== */
const CINE={view:0,ox:0,oz:0,tx:0,tz:0};/* camera help: a zoom and a nudge toward Santa during the show */
let SHK=0;const shake=a=>{SHK=Math.max(SHK,a)};
function camFx(dt){const k=1-Math.exp(-dt*4);CINE.ox+=(CINE.tx-CINE.ox)*k;CINE.oz+=(CINE.tz-CINE.oz)*k;
 if(CUT.on)return cutCam(dt);
 if(Math.abs(CINE.ox)<.002&&Math.abs(CINE.oz)<.002&&SHK<.002)return;
 SHK*=Math.pow(.03,dt);const sx=(Math.random()-.5)*SHK,sy=(Math.random()-.5)*SHK;
 cam.position.x+=CINE.ox;cam.position.z+=CINE.oz;cam.lookAt(camT.x+CINE.ox,.8,camT.z+CINE.oz);cam.translateX(sx);cam.translateY(sy)}

/* ---------- THE BURP CUTSCENE: the camera leaves the player and films it. Letterbox bars, a push-in on the inhale, a dolly zoom as he
   swells, an extreme close-up while he holds his breath (in slow motion), a low wide shot for the BURP with the present flying at the lens
   (slow motion again), then the camera follows the present to the rug and hands back to the player. Shots are in lodge space and aim at
   his head and mouth read from the model, so they frame him at any size. Time runs on the scene clock, so slow motion slows the shots too. */
let TSC=1;
const CUT={on:0,w:0,t:0,ts:1,hide:0,done:0,live:0};
/* the game camera is orthographic, so the film is shot on its own perspective camera; the bars slide in, then it cuts over */
const PCAM=new THREE.PerspectiveCamera(50,1,.1,240);
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),CQ=new THREE.Quaternion(),CP=new THREE.Vector3(),CO=new THREE.Object3D();
const bars=document.createElement('div');bars.id='lodgecut';bars.innerHTML='<i></i><b></b><s></s>';document.body.appendChild(bars);
function shotAt(t){const h=santaHead(),mo=santaMouth();
 if(t<1.3){const k=sm(0,1.3,t);return{p:V3(SNX+lerp(3.2,1.8,k),lerp(1.9,2.4,k),SNZ+lerp(8,6.2,k)),l:V3(SNX,h.y-.9,SNZ),f:lerp(50,44,k),r:0,hide:1}}
 if(t<2.45){const k=sm(1.3,2.45,t);return{p:V3(SNX-lerp(.3,.6,k),h.y+lerp(.1,.35,k),h.z+lerp(5,11,k)),l:V3(h.x,h.y-.15,h.z),f:lerp(50,20,k),r:.07*k,hide:1}}
 if(t<2.9){const k=sm(2.45,2.9,t);return{p:V3(SNX+.3,h.y+.4,h.z+lerp(7.5,6.8,k)),l:V3(h.x,h.y-.05,h.z),f:20,r:-.03,hide:1}}
 if(t<3.55||!PRES.on||PRES.phase=='fly'&&PRES.bounces<1){const k=sm(2.9,3.6,t);return{p:V3(SNX+lerp(1.4,2.0,k),lerp(.85,1.05,k),SNZ+lerp(6.4,7.0,k)),l:V3(mo.x*.6,mo.y-.6,mo.z),f:60,r:0,hide:1}}
 const g=PRES.g.position;return{p:V3(g.x+3.2,1.75,g.z+2.8),l:V3(g.x,g.y+.35,g.z),f:44,r:0,hide:0}}
/* slow motion: while he holds his breath, and for the first instant of the burp */
const slowAt=t=>t>2.45&&t<2.9?.42:t>=2.9&&t<3.3?.3:1;
/* world name labels are sprites drawn over everything: they are hidden just for the film frames */
let LBLS=null;const LBLV=[];
function filmRender(sc){if(!LBLS){LBLS=[];safe(()=>sc.traverse(o=>{if(o.isSprite&&o.material&&o.material.depthTest===false)LBLS.push(o)}),'sprites')}
 LBLS.forEach((o,i)=>{LBLV[i]=o.visible;o.visible=false});
 /* the film shows the lodge whole: walls up and the roof on, whatever the walk-in cut-away is doing for the game camera */
 const w0=[roofG.visible,roofG.position.y,roofMat.opacity,cutG.scale.y,BULBM.map(b=>b.opacity)];
 roofG.visible=true;roofG.position.y=0;roofMat.opacity=1;cutG.scale.y=1;BULBM.forEach(b=>b.opacity=1);
 try{return r0(sc,PCAM)}finally{LBLS.forEach((o,i)=>o.visible=LBLV[i]);roofG.visible=w0[0];roofG.position.y=w0[1];roofMat.opacity=w0[2];cutG.scale.y=w0[3];BULBM.forEach((b,i)=>b.opacity=w0[4][i])}}
function cutStart(){if(CUT.on)return;CUT.on=1;CUT.t=0;CUT.done=0;CUT.w=0;LBLS=null;bars.classList.add('on');document.body.classList.add('lodgefilm')}
function cutEnd(now){if(!CUT.on&&!now)return;CUT.on=0;CUT.ts=1;CUT.live=0;bars.classList.remove('on');if(now){TSC=1}cutRestore()}
function cutRestore(){try{if(P.mesh)P.mesh.visible=true}catch(e){}CUT.hide=0;document.body.classList.remove('lodgefilm')}
function cutCam(dt){
 if(!CUT.on){CUT.w=0;return}
 CUT.t+=dt*TSC;CUT.ts=slowAt(CUT.t);CUT.w+=dt;if(CUT.w>.4)CUT.live=1;
 /* the present is down and resting: hand the camera back */
 if(CUT.t>3.6&&PRES.phase=='rest'&&!CUT.done){CUT.done=1;after(.6,()=>cutEnd())}
 const S0=shotAt(CUT.t);
 PCAM.position.copy(S0.p).add(root.position);PCAM.up.set(0,1,0);PCAM.lookAt(S0.l.x+root.position.x,S0.l.y+root.position.y,S0.l.z+root.position.z);PCAM.rotateZ(S0.r);
 const asp=innerWidth/Math.max(1,innerHeight);if(PCAM.fov!==S0.f||PCAM.aspect!==asp){PCAM.fov=S0.f;PCAM.aspect=asp;PCAM.updateProjectionMatrix()}
 SHK*=Math.pow(.03,dt);if(SHK>.002){PCAM.translateX((Math.random()-.5)*SHK*1.4);PCAM.translateY((Math.random()-.5)*SHK*1.4)}
 const hide=CUT.on&&S0.hide;if(hide!==CUT.hide){CUT.hide=hide;try{if(P.mesh)P.mesh.visible=!hide}catch(e){}}
 bars.style.setProperty('--vg',(CUT.on&&CUT.t>1.3&&CUT.t<2.9?.55:.25).toFixed(2))}

/* ---------- speech bubble over his head (greetings, mutters) ---------- */
const bub=document.createElement('div');bub.id='lodgebub';document.body.appendChild(bub);let bubT=0;
function bubble(t,sec){bub.textContent=t;bub.classList.add('on');bubT=sec||3.2}
function toScreen(v3){const v=v3.clone();v.project(cam);return[(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight]}
function stepBubble(dt){if(bubT>0){bubT-=dt;if(bubT<=0)bub.classList.remove('on')}
 if(bub.classList.contains('on')){const h=santaHead().add(new THREE.Vector3(LX,.55*SANTA.g,LZ)),[x,y]=toScreen(h);bub.style.left=clamp(x,90,innerWidth-90)+'px';bub.style.top=Math.max(20,y-18)+'px'}
 if(FLOATS.length)stepFloats(dt)}
const FLOATS=[];
function floatText(txt,col,big,v3){const e=document.createElement('div');e.className='lodgefl'+(big?' big':'');e.textContent=txt;e.style.color=col||'#ffd75e';document.body.appendChild(e);FLOATS.push({e,t:0,d:big?1.5:1.2,v:v3?v3.clone():santaHead().add(new THREE.Vector3(LX,.4,LZ)),big})}
function stepFloats(dt){for(let i=FLOATS.length-1;i>=0;i--){const f=FLOATS[i];f.t+=dt;const k=f.t/f.d;if(k>=1){f.e.remove();FLOATS.splice(i,1);continue}const[x,y]=toScreen(f.v);f.e.style.left=x+'px';f.e.style.top=(y-k*(f.big?60:46))+'px';f.e.style.opacity=k<.7?1:1-(k-.7)/.3;f.e.style.transform=`translate(-50%,-50%) scale(${f.big?(k<.2?.4+k/.2*.9:1.3-k*.3):1})`}}
function greet(){const s=st(),a=SANTA;if(a.busy||DLG.open)return;
 bubble(s.pr&&!s.pr.done?"Ho ho! Your present is waiting on the rug!":s.f>=1?pk(["Back for more? Ho ho ho!","Ah, my favourite helper!","Mmm, I smell treats!"]):pk(["Ho ho ho! Come in, come in!","Welcome to my lodge!"]),3.4);
 wave(1.6);laugh(2)}
function wave(sec){const a=SANTA;a.armOv=[0,0];tween(sec,k=>{const up=sm(0,.15,k)*(1-sm(.85,1,k));a.armOv=[0,-2.5*up+Math.sin(k*28)*.3*up*(k<.9?1:0)];a.armZ=[0,-.25*up]},()=>{a.armOv=null;a.armZ=null})}

/* ---------- the dialogue box ---------- */
const DLG={open:false,el:null,text:'',n:0,full:false,btns:[],onDone:null,mode0:'play'};
const PORT=['................','.....RRRRRR.....','....RRRRRRRR..W.','...RRRRRRRRRR.WW','..WWWWWWWWWWWW..','..WSSSSSSSSSSW..','..WSWWSSSSWWSW..','..WSKKSSSSKKSW..','..WSSSSNNSSSSW..','..WSPSSNNSSPSW..','..WWWWWWWWWWWW..','..WWWWDDDDWWWW..','...WWWWWWWWWW...','....WWWWWWWW....','.....WWWWWW.....','......WWWW......'];
const PCOL={R:'#c8261f',W:'#f8fafc',S:'#f0b48a',K:'#1d1d22',N:'#e98a80',P:'#ee8a80',D:'#5a1818'};
function portrait(cv){const c=cv.getContext('2d');c.clearRect(0,0,16,16);PORT.forEach((r,y)=>[...r].forEach((ch,x)=>{if(PCOL[ch]){c.fillStyle=PCOL[ch];c.fillRect(x,y,1,1)}}))}
function pips(){const f=st().f;return Array.from({length:5},(_,i)=>`<i class="${i<f?'on':''}"></i>`).join('')}
function ensureDlg(){if(DLG.el)return DLG.el;const e=document.createElement('div');e.id='lodged';e.setAttribute('role','dialog');e.setAttribute('aria-label','Santa');
 e.innerHTML=`<div class=lcard><div class=lhd><canvas class=lpt width=16 height=16></canvas><div class=lnm><b>SANTA</b><small>Santa's Lodge</small></div><div class=lpips title="Treats fed this round">${pips()}</div></div><div class=ltx></div><div class=lbt></div><div class=lhint>Click or press Enter to continue &middot; Esc to leave</div></div>`;
 document.body.appendChild(e);portrait(e.querySelector('.lpt'));e.addEventListener('click',ev=>{if(ev.target.closest('button'))return;skipText()});return DLG.el=e}
function openDlg(){const m=mode_();if(!(m=='play'||m=='menu'))return false;if(m=='play'){DLG.mode0='play';try{$('ui').innerHTML=''}catch(e){}mode='menu'}ensureDlg();DLG.open=true;DLG.el.classList.add('on');DLG.el.querySelector('.lpips').innerHTML=pips();CINE.tx=(LX+SNX-P.x)*.35;CINE.tz=(LZ+SNZ-P.z)*.35;return true}
function closeDlg(keepMode){if(!DLG.open)return;DLG.open=false;DLG.token=(DLG.token||0)+1;if(DLG.el)DLG.el.classList.remove('on');SANTA.open=0;applySanta();if(!keepMode){CINE.tx=CINE.tz=0;if(mode_()=='menu')mode='play'}}
/* say lines one by one (a click moves on), each typed out with little voice blips and a flapping jaw; then call done */
function sayLines(lines,done,btnsFn){const tok=DLG.token=(DLG.token||0)+1;let i=0;const el=DLG.el,tx=el.querySelector('.ltx'),bt=el.querySelector('.lbt');bt.innerHTML='';
 const next=()=>{if(tok!=DLG.token||!DLG.open)return;if(i>=lines.length){DLG.advance=null;if(btnsFn)btnsFn(bt);else done&&done();return}typeLine(lines[i++],tx,el)};DLG.advance=next;next()}
function typeLine(text,tx,el){DLG.text=text;DLG.n=0;DLG.full=false;tx.textContent='';el.querySelector('.lhint').style.visibility='visible';const tok=DLG.token,A=SANTA;
 const step=()=>{if(tok!=DLG.token||!DLG.open)return;if(DLG.n>=text.length){DLG.full=true;A.open=0;applySanta();return}
  const ch=text[DLG.n++];tx.textContent=text.slice(0,DLG.n);if(/[a-z]/i.test(ch)&&DLG.n%2){voice(115+Math.random()*60,.09,.12,{bend:1.25,lp:420});A.open=.18+Math.random()*.25;applySanta()}else if(ch==' '){A.open=.05;applySanta()}
  DLG.timer=setTimeout(step,/[.!?]/.test(ch)?170:/,/.test(ch)?90:26)};step()}
function skipText(){if(!DLG.open)return;if(!DLG.full){clearTimeout(DLG.timer);DLG.n=DLG.text.length;DLG.el.querySelector('.ltx').textContent=DLG.text;DLG.full=true;SANTA.open=0;applySanta();return}if(DLG.advance)DLG.advance()}
function btn(bt,label,fn,cls,img,dis){const b=document.createElement('button');b.type='button';b.className=cls||'';b.disabled=!!dis;b.innerHTML=(img?`<img src="${img}" alt="">`:'')+label;b.onclick=()=>{sn('click');fn()};bt.appendChild(b);return b}
function menu(first,pre){const s=st(),f=s.f,el=ensureDlg(),carry=s.c.cookie+s.c.cane;el.querySelector('.lhint').style.visibility='hidden';el.querySelector('.lpips').innerHTML=pips();
 let line;if(pre)line=pre;else if(s.pr&&!s.pr.done)line="Your present is waiting for you on the rug! Go on, open it. Ho ho ho!";
 else if(first)line=f?pk(["Back again! Got something tasty for me?","Ho ho! You're back. Treats? Treats?","Mmm, I was just thinking about cookies."]):"Got any treats for me? The elves hid them everywhere!";
 else line=carry?"Ooh, what have you got? Feed me!":"No treats left in your pockets. Go find some more!";
 sayLines([line],null,bt=>{
  if(s.pr&&!s.pr.done){btn(bt,'OPEN THE PRESENT',()=>{closeDlg();openPresent()},'go');btn(bt,'LATER',()=>closeDlg())}
  else{btn(bt,`FEED A COOKIE <b>x${s.c.cookie}</b>`,()=>feed('cookie'),'go',icon('cookie'),s.c.cookie<1);btn(bt,`FEED A CANDY CANE <b>x${s.c.cane}</b>`,()=>feed('cane'),'go',icon('cane'),s.c.cane<1);btn(bt,'WHERE ARE THEY?',()=>where());btn(bt,'BYE',()=>{bubble(pk(['Ho ho ho! Merry Christmas!','Come back soon!','Bring me more treats!']),2.6);closeDlg()})}
  if(DLG.el)DLG.el.querySelector('.lhint').style.visibility='hidden'})}
function where(){const n=ACTIVE.filter(a=>a.state=='idle').length;sayLines(["Look for tall glowing sparkly beams out in the meadows, the park, along the streets and even in the city. My elves hid "+SPOTS.length+" treats.","Tiny dots on your little map show the ones near you. Pick one up by walking into it.","Picked ones come back after a few minutes. "+(n?n+" are out there right now!":"They're all taken just now. Give the elves a moment!")],()=>menu(),null);DLG.afterLines=1}
function talk(){const s=st();if(SANTA.busy||DLG.open)return;if(!inside(P.x,P.z))return;if(!openDlg())return;SANTA.open=0;
 if(!s.seen){s.seen=1;sv();sayLines(["Ho ho ho! Well, look who found my lodge!","I'm Santa, and I am SO hungry. My naughty elves hid cookies and candy canes all over town!","Find them out there, bring them back here and feed me. I'll gobble them up!","Feed me 5 treats and something special happens. Ho ho ho!"],()=>menu(true),null);DLG.el.querySelector('.lbt').innerHTML='';return}
 menu(true)}
addEventListener('keydown',e=>{if(!DLG.open)return;
 if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!SANTA.busy)closeDlg()}
 else if((e.key=='Enter'||e.key==' ')&&DLG.open){e.preventDefault();e.stopImmediatePropagation();skipText()}},true);
setInterval(()=>{if((DLG.open||SANTA.busy)&&mode_()!='menu'){/* paused or something else took over: end the scene cleanly */abortScene()}},400);
function abortScene(){cutEnd(1);if(DLG.open){DLG.open=false;DLG.token++;if(DLG.el)DLG.el.classList.remove('on')}CINE.tx=CINE.tz=0;CINE.view=0;TWN.length=0;SCH.length=0;SANTA.busy=0;SANTA.armOv=SANTA.armZ=null;SANTA.open=0;SANTA.blink=0;SANTA.eyeW=1;SANTA.cheek=0;SANTA.hatLift=0;SANTA.sq=0;SANTA.sway=0;SANTA.brows=0;SANTA.hat.position.y=HATY;SANTA.root.position.x=SNX;syncSanta(true);if(PRES.on&&PRES.phase=='opening')presentClosed()}

/* ---------- feeding ---------- */
function syncSanta(now){const n=clamp(st().f,0,4);SANTA.g=STAGE[n];SANTA.bw=BELLY[n];applySanta();lightPips(st().f)}
const PIPG=[];{for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.7,.7,.7),new THREE.MeshBasicMaterial({color:'#5b4630'}));m.position.set(-4+i*2,WH-1.95,-HD+.7);m.rotation.set(0,.78,.78);dynG.add(m);PIPG.push(m)}}
function lightPips(f){PIPG.forEach((m,i)=>{m.material.color.set(i<f?'#ffd75e':'#5b4630');m.userData.on=i<f})}
const mouthW=()=>santaMouth().add(new THREE.Vector3(0,0,0));
function feed(kind){const s=st();if(SANTA.busy||s.c[kind]<1)return;s.c[kind]--;s.f++;s.t++;const f=s.f;sv();hudSync(1);closeDlg(true);bubT=0;bub.classList.remove('on');
 const A=SANTA;A.busy=1;CINE.view=8.8;CINE.tx=(LX+SNX-P.x)*.5;CINE.tz=(LZ+SNZ-P.z)*.5;
 P.rot=Math.atan2(LX+SNX-P.x,LZ+SNZ-P.z);
 /* the throw: the item leaves your hand, arcs up and into his open mouth */
 const m=newModel(kind),it=new THREE.Group();it.add(m);root.add(it);const sc0=kind=='cookie'?.85:.75;it.scale.setScalar(sc0);
 const st0=new THREE.Vector3(P.x-LX,1.35,P.z-LZ),mouth0=santaMouth();
 A.open=0;tween(.5,k=>{A.open=sm(0,1,k)*.8;A.tilt=-.22*sm(0,1,k);A.eyeW=1+.25*sm(0,1,k);A.armOv=[-.5*sm(0,1,k),-.5*sm(0,1,k)];applySanta()});
 sn('whoosh');safe(()=>P.arms[1].rotation.x=-2.4,'arm');
 const T=.85;let trail=0;
 tween(T,k=>{const e=easeOutSine(k),mo=mouthW();const x=lerp(st0.x,mo.x,e),z=lerp(st0.z,mo.z,e),y=lerp(st0.y,mo.y,e)+Math.sin(k*Math.PI)*1.5;it.position.set(x,y,z);it.rotation.set(k*9,k*7,k*3);it.scale.setScalar(sc0*(1-k*.35));
  trail+=1;if(trail%3==0)emit(x,y,z,1,{colors:['#ffe9a0','#ffffff'],speed:.3,up:.2,grav:0,life:.5,size:.1,floor:-9});try{P.arms[1].rotation.x=lerp(-2.4,0,sm(.4,1,k))}catch(e){}},()=>{root.remove(it);chew(kind,f)},x=>x);
 return true}
const easeOutSine=x=>Math.sin(x*Math.PI/2);
function chew(kind,f){const A=SANTA,crumbs=kind=='cookie'?['#d99a48','#ecb868','#a8641f','#43230f']:['#ffffff','#d8322c','#ffffff','#f4a0a0'];
 const mo=()=>santaMouth();const bite=(n)=>{crunch();A.cheek=.8;tween(.2,k=>{A.open=lerp(.6,.04,easeOutSine(k))*(1-.0);A.cheek=lerp(.8,0,k);applySanta()});const p=mo();emit(p.x,p.y-.1,p.z+.1,10,{colors:crumbs,speed:1.8,up:1.6,size:.09,life:1.1,dir:[0,1,-.3],grav:9});shake(.03);belly(.04);boing(n)};
 bite(0);after(.34,()=>{A.open=.5;tween(.14,k=>{A.open=lerp(.5,.5,k);applySanta()})});after(.4,()=>bite(1));after(.78,()=>{A.open=.4});after(.84,()=>bite(2));
 /* mmm: rising happy hum */
 [0,.2,.4].forEach((d,i)=>after(.5+d,()=>voice(150+i*24,.2,.14,{bend:1.1,lp:460})));
 after(1.25,()=>{A.open=0;A.tilt=-.12;applySanta();/* the gulp */ safe(()=>sdHit(95,.2,.3,[[1,1,1]],{bend:.8}),'gulp');tween(.3,k=>{A.tilt=lerp(-.12,0,k);A.eyeW=lerp(1.25,1,k);applySanta()});
  if(f>=5)burp();else grow(f)})}
function belly(a){const A=SANTA,b=A.bw;tween(.22,k=>{A.bw=b*(1+Math.sin(k*Math.PI)*a);applySanta()},()=>{})}
function grow(f){const A=SANTA;
 sn('pop');boing(f);setStage(f,1.15,true);shake(.2);rumble(.4,.18,90);
 floatText('+1  '+f+'/5','#ffd75e',false);lightPips(f);const a0=(A.armOv||[0,0])[0];tween(.35,k=>{const v=lerp(a0,-1.15,easeOutSine(k));A.armOv=[v,v];A.brows=k;applySanta()});
 const base=new THREE.Vector3(SNX,.5,SNZ);ring(base,'#ffd75e',3+f*.5,.9);emit(SNX,.6+A.g*1.5,SNZ+.3,28,{colors:['#ffd75e','#fff6c8','#ffffff','#ff7a7a'],speed:3.4,up:3.2,size:.15,life:1,grav:5,floor:-9,spread:.6});
 [0,1,2,3,4].forEach(i=>after(i*.07,()=>sparkSnd()));
 const lines=[["Mmm! I feel a little rounder already!","Ho ho ho!"],["Oh my, my belt is getting tight!","More, more!"],["Ho ho hold on, I'm getting BIGGER!","Is the ceiling getting lower?"],["Uh oh... I think I might... burp.","One more treat and WOW!"]][f-1];
 after(.9,()=>{laugh(2);tween(.45,k=>{const v=lerp(-1.15,0,sm(0,1,k));A.armOv=[v,v];A.brows=1-k;applySanta()},()=>{A.armOv=null;A.brows=0;applySanta()})});
 after(1.55,()=>{A.busy=0;if(!openDlg())return;menu(false,lines[0]+' '+lines[1])})}
/* a flat ring that spreads over the floor and fades (shockwaves, sparkle bursts) */
function ring(c,col,rad,dur){const m=new THREE.Mesh(new THREE.RingGeometry(.9,1,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(c.x,.5,c.z);root.add(m);
 tween(dur||.8,k=>{const s=.4+k*rad;m.scale.set(s,s,1);m.material.opacity=.8*(1-k)},()=>{root.remove(m);m.geometry.dispose();m.material.dispose()},easeOutSine)}

/* ---------- the big moment: 5th treat. He inhales, swells, shakes, holds his breath ... BURP ---------- */
/* the prize: Rare, Epic or Legendary at the advent calendar's odds ratio for its top three tiers (13:6:1), then any of Santa's own prizes
   of that rarity (dev-lodge-items-v1.js). A car or the elf you already own is skipped; if you own all of them, a piece of furniture of that rarity. */
function prizeOf(o){const r={t:o.t,k:o.k,n:o.n,rar:o.tier};
 if(o.t=='f'){r.key=o.key;const have=(S.inv&&S.inv[o.key])||0;r.note=(have?'Another one for your collection. ':'')+'Delivered to your Storage. Press F at home to place it.'}
 if(o.t=='c'){r.i=o.i;r.note='Top speed '+((CARS[o.i]&&CARS[o.i].mph)||80)+' mph. It is parked outside your house: walk up to it and press E.'+(S.garage?'':' Your garage is unlocked too.')}
 if(o.t=='p'){r.i=o.i;r.note=(S.pets||[]).length<3?'He follows you around now, skipping along behind you, and adds +1 song quality.':'He joined your pets. Press P to put him in one of your three pet slots.'}
 return r}
function rollPrize(){
 const cr=window.FW_ADVENT.crate,LI=window.FW_LODGE_ITEMS,od=[2,3,4].map(t=>cr.TIERS[t].odds),tot=od.reduce((a,b)=>a+b,0);let r=Math.random()*tot,t=2;for(let i=0;i<3;i++){if(r<od[i]){t=2+i;break}r-=od[i];t=2+i}
 if(LI){const own=o=>o.t=='c'?(S.cars||[]).includes(o.i):o.t=='p'?((S.petOwn||[]).includes(o.i)||(S.pets||[]).includes(o.i)):false;
  let c=LI.byTier(t).filter(o=>!own(o));if(!c.length)c=LI.byTier(t).filter(o=>o.t=='f');if(c.length)return prizeOf(pk(c))}
 for(let d=0;d<5;d++)for(const tt of[t-d,t+d]){if(tt<2||tt>4)continue;const c=cr.pool().filter(o=>o.tier==tt);if(c.length)return cr.prizeFrom(pk(c))}
 return cr.prizeFrom(pk(cr.pool()))}
const tierCol=t=>window.FW_ADVENT.crate.TIERS[clamp(t,0,4)].c;
function burp(){const s=st(),A=SANTA;cutStart();
 /* decide the present now, and save it, so closing the tab can never lose or re-roll it */
 const pr=rollPrize();s.pr=Object.assign({},pr,{done:0});s.f=0;sv();
 const col='#ffd75e';/* gold for every tier: the advent spin is where you find out */A.busy=1;CINE.view=9.6;CINE.tx=(LX+SNX-P.x)*.9;CINE.tz=(LZ+SNZ-P.z)*.9;
 lightPips(5);
 /* 1. inhale: the belly swells, he goes wide-eyed, the hat starts to rattle */
 bubble('Uh oh...',1.6);rumble(1.2,.3,100);A.cheek=.5;
 const g0=A.g,b0=A.bw;
 tween(1.3,k=>{const e=sm(0,1,k);A.g=lerp(g0,1.92,e);A.bw=lerp(b0,1.95,e);A.sq=-.08*e;A.brows=e;A.eyeW=1+.45*e;A.tilt=-.12*e;A.hatLift=Math.sin(k*60)*.1*k;A.cheek=.5+.5*e;A.armOv=[-.4*e,-.4*e];A.armZ=[.5*e,-.5*e];applySanta()});
 shake(.06);
 /* 2. second swell, louder, he trembles */
 after(1.3,()=>{bubble('Hold on...',1.4);rumble(1.2,.4,90);shake(.1);boing(3);
  const g1=A.g,b1=A.bw;tween(1.1,k=>{const e=sm(0,1,k);A.g=lerp(g1,2.04,e);A.bw=lerp(b1,2.3,e);A.sq=-.08+Math.sin(k*38)*.05*k;A.sway=Math.sin(k*52)*.05*k;A.root.position.x=SNX+Math.sin(k*46)*.03*k;A.hatLift=Math.sin(k*70)*.18*k;A.eyeW=1.45+.25*k;A.cheek=1;applySanta()},()=>{A.root.position.x=SNX});
  [0,.2,.4,.6,.8,1.0].forEach(d=>after(d,()=>shake(.05+d*.06)));
  [.3,.6,.9].forEach(d=>after(d,()=>{const h=santaHead();emit(h.x,h.y+.1,h.z+.2,5,{colors:['#bfe6ff','#ffffff'],speed:2.2,up:2,size:.07,life:.7,grav:9,floor:-9,spread:.4})}))});
 /* 3. he holds his breath for a heartbeat, eyes squeezed shut */
 after(2.45,()=>{A.hatLift=0;A.blink=.9;A.tilt=-.34;applySanta();safe(()=>sdHit(60,.5,.25,[[1,1,1]],{jit:0}),'hb');shake(.02);flash('#3a0000',.25,.5)});
 after(2.68,()=>{safe(()=>sdHit(55,.5,.3,[[1,1,1]],{jit:0}),'hb2');flash('#3a0000',.3,.4)});
 /* 4. BURP */
 after(2.9,()=>doBurp(pr,col))}
function doBurp(pr,col){const A=SANTA;const mo=santaMouth();
 burpSound(true);shake(.55);A.blink=0;A.eyeW=1.2;
 tween(.14,k=>{A.open=lerp(0,1,k);A.tilt=lerp(-.34,.22,easeOutSine(k));applySanta()});
 /* the air goes out of him in one squashed snap, then he settles at his last size */
 const g1=A.g,b1=A.bw,ao=(A.armOv||[0,0])[0];tween(.6,k=>{const e=1-Math.pow(1-k,3);A.bw=lerp(b1,BELLY[4],e);A.g=lerp(g1,STAGE[4],e);A.sq=-Math.sin(Math.min(1,k*1.6)*Math.PI)*.32;A.sway=0;A.cheek=lerp(1,0,k);A.brows=1-k;A.armZ=[lerp(.5,-.35,e),lerp(-.5,.35,e)];const v=lerp(ao,-.5,e);A.armOv=[v,v];applySanta()},()=>{A.sq=0;applySanta()});
 /* the hat pops up and wobbles back down */
 tween(1.0,k=>{A.hat.position.y=HATY+Math.sin(Math.min(1,k*1.6)*Math.PI)*.9*(1-k*.4);A.hat.rotation.z=Math.sin(k*Math.PI*2)*.5*(1-k);applySanta()},()=>{A.hat.position.y=HATY;A.hat.rotation.z=0});
 /* the cloud */
 emit(mo.x,mo.y,mo.z+.2,34,{colors:['#e8f7d4','#d7efbe','#f4ffe9','#ffffff','#b9e08a'],speed:3.4,up:.8,size:.5,life:1.4,dir:[0,1,.05],grav:-.5,floor:-9,fade:.35,spread:.3});
 emit(mo.x,mo.y,mo.z+.2,16,{colors:['#c8f07a','#ffffff'],speed:5,up:.6,size:.18,life:1,dir:[0,1,0],grav:4,floor:.45});
 ring({x:SNX,z:SNZ},'#d8f2b8',9,.9);ring({x:SNX,z:SNZ},'#ffffff',6,.6);
 flash('#ffffff',.5,.3);floatText('BUUURP!','#bff08a',true,santaHead().add(new THREE.Vector3(LX,.7,LZ+1.1)));
 /* the present shoots out */
 after(.12,()=>launchPresent(pr,col,mo));
 after(.15,()=>{boing(0);sn('pop')});
 /* mouth closes, he blushes, shrinks back with a long squeaky sigh */
 after(1.0,()=>{tween(.35,k=>{A.open=lerp(1,.1,k);A.tilt=lerp(.22,0,k);const v=lerp(-.5,-2.1,sm(0,1,k));A.armOv=[v,-.5];A.armZ=[lerp(-.35,.35,k),.35];A.cheek=k;applySanta()});bubble('Excuse me!',1.8);
  after(1.0,()=>tween(.4,k=>{const v=lerp(-2.1,-.5,sm(0,1,k));A.armOv=[v,-.5];A.armZ=[lerp(.35,-.35,k),.35];A.cheek=1-k;applySanta()}))});
 after(1.6,()=>{lightPips(0);laugh(3)});
 after(2.3,()=>deflate())}
function deflate(){const A=SANTA;safe(()=>{sdNz(1.0,2400,.2,{q:3,f2:500});},'air');const g0=A.g,b0=A.bw;
 const z0=A.armZ?A.armZ[0]:0,o0=(A.armOv||[0,0])[0];
 tween(1.7,k=>{const e=1-Math.pow(1-k,3);A.g=lerp(g0,STAGE[0],e);A.bw=lerp(b0,BELLY[0],e);A.sq=Math.sin(k*16)*.1*(1-k);A.armZ=[lerp(z0,0,e),lerp(-z0,0,e)];const v=lerp(o0,0,e);A.armOv=[v,v];applySanta()},()=>{A.g=STAGE[0];A.bw=BELLY[0];A.sq=0;A.armOv=null;A.armZ=null;applySanta()})}

/* ---------- the present: flight, bounces, glow, and the opening ---------- */
const PRES={on:false,ready:false,g:new THREE.Group(),phase:'',t:0};
PRES.g.visible=false;dynG.add(PRES.g);
/* the advent calendar's present crate (same model as the calendar presents), sitting on the rug; its lid pieces get their own pivot */
PRES.m=new THREE.Group();PRES.g.add(PRES.m);PRES.body=new THREE.Group();PRES.m.add(PRES.body);
const LIDY=(()=>{const it=window.FW_ADVENT.itemModel('x:crate',1.3),raw=it.children[0],LY=.76,lid=new THREE.Group();lid.name='lid';lid.position.y=LY;
 raw.children.slice().forEach(c=>{if(c.position.y>=.8){raw.remove(c);c.position.y-=LY;lid.add(c)}});raw.add(lid);it.traverse(o=>{if(o.isMesh)o._gdyn=1});PRES.body.add(it);PRES.lid=lid;return LY})();
/* pivot the crate at its centre so tumbling never dips a corner through the floor */
const PC=(()=>{const bb=new THREE.Box3().setFromObject(PRES.body);return (bb.max.y+bb.min.y)/2})();PRES.body.position.y=-PC;PRES.m.position.y=PC;
const PBB=new THREE.Box3();function presLow(){PRES.g.updateMatrixWorld(true);PBB.setFromObject(PRES.m);return PBB.min.y-root.position.y}
PRES.beam=[0,1].map(i=>{const b=new THREE.Mesh(beamGeo,beamMat.clone());b.material.userData.xms=1;b.position.y=2.6;b.rotation.y=i*Math.PI/2;PRES.g.add(b);return b});
PRES.glow=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));PRES.glow.rotation.x=-Math.PI/2;PRES.glow.position.y=.06;PRES.g.add(PRES.glow);PRES.glow.scale.setScalar(1.8);
function tintPresent(col){PRES.beam.forEach(b=>{b.material.map=beamTex;b.material.color.set(col);b.material.needsUpdate=true});PRES.glow.material.color.set(col)}
const PREST=.48;/* floor height of the rug top under the present */
function placePresent(rest,pr){PRES.on=true;PRES.g.visible=true;PRES.pr=pr;tintPresent('#ffd75e');PRES.g.position.set(PRES_AT[0],PREST,PRES_AT[1]);PRES.g.rotation.set(0,rest?.5:0,0);PRES.m.scale.setScalar(1);PRES.m.rotation.set(0,0,0);PRES.m.position.y=PC;if(PRES.lid){PRES.lid.visible=true;PRES.lid.position.set(0,LIDY,0);PRES.lid.rotation.set(0,0,0)}
 PRES.phase=rest?'rest':'';PRES.ready=!!rest;PRES.beam.forEach(b=>{b.visible=!!rest;b.scale.y=1});PRES.glow.visible=!!rest}
function launchPresent(pr,col,mo){placePresent(false,pr);PRES.beam.forEach(b=>b.visible=false);PRES.glow.visible=false;PRES.ready=false;PRES.phase='fly';PRES.t=0;PRES.bounces=0;
 const T=.95,gv=17,x0=mo.x,y0=mo.y,z0=mo.z+.3,xL=PRES_AT[0],zL=PRES_AT[1],yL=PREST;
 PRES.vx=(xL-x0)/T;PRES.vz=(zL-z0)/T;PRES.vy=(yL-y0+.5*gv*T*T)/T;PRES.gv=gv;PRES.g.position.set(x0,y0-.35,z0);PRES.spin=new THREE.Vector3(7,9,4);PRES.m.scale.setScalar(.05);PRES.col=col;PRES.sq=0}
function stepPresent(dt){if(!PRES.on)return;const g=PRES.g;
 if(PRES.phase=='fly'){PRES.t+=dt;PRES.m.scale.setScalar(Math.min(1,PRES.m.scale.x+dt*7));PRES.vy-=PRES.gv*dt;g.position.x+=PRES.vx*dt;g.position.z+=PRES.vz*dt;g.position.y+=PRES.vy*dt;PRES.m.rotation.x+=PRES.spin.x*dt;PRES.m.rotation.y+=PRES.spin.y*dt;PRES.m.rotation.z+=PRES.spin.z*dt;
  if(Math.random()<.85)emit(g.position.x,g.position.y+.3,g.position.z,1,{colors:[PRES.col,'#ffffff','#fff6c8'],speed:.4,up:.2,grav:1,life:.7,size:.13,floor:-9});
  const low=presLow();if(low<PREST)g.position.y+=PREST-low;
  if(low<=PREST&&PRES.vy<0){const sp=-PRES.vy;PRES.bounces++;shake(Math.min(.3,sp*.02));sn('pop');safe(()=>sdHit(90+Math.random()*20,.25,.3,[[1,1,1],[2.4,.3,.4]],{bend:.5}),'thud');
   emit(g.position.x,PREST+.1,g.position.z,10,{colors:['#e9f0f6','#ffffff',PRES.col],speed:1.6,up:1.4,size:.12,life:.7,grav:9});PRES.sq=1;
   PRES.vy=sp*.44;PRES.vx*=.45;PRES.vz*=.45;PRES.spin.multiplyScalar(.45);if(PRES.bounces>=4||PRES.vy<1.6){PRES.vy=0;PRES.phase='settle';PRES.t=0}}}
 else if(PRES.phase=='settle'){PRES.t+=dt;const k=clamp(PRES.t/.5,0,1),fl=a=>a-Math.round(a/(Math.PI*2))*Math.PI*2,e=Math.min(1,dt*9);PRES.m.rotation.x=fl(PRES.m.rotation.x)*(1-e);PRES.m.rotation.z=fl(PRES.m.rotation.z)*(1-e);g.position.y+=(PREST-g.position.y)*e;{const low=presLow();if(low<PREST)g.position.y+=PREST-low}PRES.m.rotation.y+=(Math.round(PRES.m.rotation.y/(Math.PI/2))*Math.PI/2-PRES.m.rotation.y)*Math.min(1,dt*8);g.position.x+=PRES.vx*dt;g.position.z+=PRES.vz*dt;PRES.vx*=.9;PRES.vz*=.9;
  if(k>=1){PRES.phase='rest';PRES.ready=true;PRES.m.rotation.set(0,0,0);g.rotation.y=PRES.m.rotation.y;PRES.beam.forEach(b=>{b.visible=true;b.scale.y=.01});PRES.glow.visible=true;chimeUp();floatText('A PRESENT!',PRES.col,false,new THREE.Vector3(LX+PRES_AT[0],2.2,LZ+PRES_AT[1]));
   after(.9,()=>{if(!DLG.open&&PRES.on&&PRES.phase=='rest'&&SANTA.busy)presentTalk()})}}
 else if(PRES.phase=='rest'){const t=CLOCK;PRES.beam.forEach(b=>{b.scale.y=Math.min(1,b.scale.y+dt*1.6);b.scale.x=.9+Math.sin(t*2.4)*.15});PRES.glow.scale.setScalar(1.8+Math.sin(t*3)*.18);{const sc=1+Math.sin(t*2.8)*.025;PRES.m.scale.setScalar(sc);PRES.m.position.y=PC*sc}if(Math.random()<dt*3)emit(PRES_AT[0],PREST+.8,PRES_AT[1],1,{colors:[PRES.col,'#ffffff'],speed:.5,up:1.2,grav:-.2,life:1.4,size:.1,floor:-9,spread:.8})}
 /* squash on landing */
 if(PRES.sq>0){PRES.sq=Math.max(0,PRES.sq-dt*5);const s=PRES.sq;PRES.body.scale.set(1+s*.28,1-s*.3,1+s*.28);if(PRES.lid)PRES.lid.position.y=LIDY-s*.18}else if(PRES.body.scale.y!=1){PRES.body.scale.set(1,1,1);if(PRES.lid&&PRES.phase!='opening')PRES.lid.position.y=LIDY}}
/* after he burps and the present has landed, Santa speaks and offers it */
function presentTalk(){const A=SANTA;A.busy=0;P.rot=Math.atan2(LX+PRES_AT[0]-P.x,LZ+PRES_AT[1]-P.z);if(!openDlg())return;const el=ensureDlg();el.querySelector('.lpips').innerHTML=pips();CINE.view=0;
 sayLines(["Ho ho ho! Pardon me! That one is for YOU.","Go on, open it! It's a special one, I can feel it in my belly."],null,bt=>{btn(bt,'OPEN THE PRESENT',()=>{closeDlg();openPresent()},'go');btn(bt,'LATER',()=>closeDlg())})}
function openPresent(){const s=st();if(!(s.pr&&!s.pr.done)||!PRES.on||!PRES.ready||SANTA.busy)return;if(!(mode_()=='play'||mode_()=='menu'))return;
 const AD=window.FW_ADVENT;if(!AD||typeof AD.gift!='function')return;
 if(mode_()=='play'){try{$('ui').innerHTML=''}catch(e){}mode='menu'}/* menu while it plays out, so nothing else grabs the keys */
 SANTA.busy=1;PRES.phase='opening';PRES.ready=false;CINE.view=7;CINE.tx=(LX+PRES_AT[0]-P.x)*.5;CINE.tz=(LZ+PRES_AT[1]-P.z)*.5;P.rot=Math.atan2(LX+PRES_AT[0]-P.x,LZ+PRES_AT[1]-P.z);
 /* it rattles on the rug, the lid jumps, sparkles pop... then the advent calendar's present card takes over */
 tween(.75,k=>{const a=sm(0,1,k);PRES.m.rotation.z=Math.sin(k*62)*.1*a;PRES.m.rotation.x=Math.cos(k*55)*.07*a;PRES.m.position.y=PC+Math.abs(Math.sin(k*24))*.06*a;if(PRES.lid)PRES.lid.position.y=LIDY+Math.abs(Math.sin(k*31))*.08*a;PRES.glow.scale.setScalar(1.8+a*.8)},
  ()=>{PRES.m.rotation.set(0,0,0);PRES.m.position.y=PC;if(PRES.lid)PRES.lid.position.y=LIDY});
 for(let i=0;i<5;i++)after(i*.14,()=>safe(()=>sdHit(520*Math.pow(1.12,i),.12,.14,[[1,1,1],[2,.2,.4]],{jit:0}),'tick'));shake(.03);
 after(.8,()=>{emit(PRES_AT[0],PREST+.9,PRES_AT[1],26,{colors:['#ffd75e','#ffffff','#fff6c8'],speed:3,up:3.4,size:.14,life:1,grav:6,floor:PREST+.02});sn('pop');
  const ok=safe(()=>AD.gift({title:"SANTA'S PRESENT",name:"Santa's Present",prize:s.pr,
   note:"Santa burped this up just for you! The first spin shows how rare it is (Rare, Epic or Legendary), the second what is inside.",
   tierNames:{2:'Rare',3:'Epic',4:'Legendary'},rarity:{2:55,3:32,4:13},
   pool:t=>{const LI=window.FW_LODGE_ITEMS;return LI?LI.byTier(t).map(o=>({k:o.k,n:o.n,tier:o.tier})):window.FW_ADVENT.crate.pool().filter(o=>o.tier==t)},
   onClaim:()=>{const q=st();if(q.pr){q.pr.done=1;q.n++;sv()}},onClose:presentClosed}),'gift');
  if(!ok)presentClosed(false)})}
/* the present card closed: claimed, the present goes with a puff and Santa cheers; not yet, it waits on the rug */
function presentClosed(){const s=st();SANTA.busy=0;CINE.view=0;CINE.tx=CINE.tz=0;if(mode_()=='menu')mode='play';
 if(s.pr&&s.pr.done){emit(PRES_AT[0],PREST+.5,PRES_AT[1],26,{colors:['#ffffff','#ffd75e',tierCol(s.pr.rar)],speed:3,up:3,size:.16,life:1,grav:5,floor:PREST});PRES.g.visible=false;PRES.on=false;s.pr=null;sv();
  laugh(3);bubble('Merry Christmas! Come back with more treats!',3.4);wave(1.6)}
 else if(PRES.on){PRES.phase='rest';PRES.ready=true;PRES.m.rotation.set(0,0,0);PRES.m.position.y=PC;if(PRES.lid){PRES.lid.visible=true;PRES.lid.position.set(0,LIDY,0);PRES.lid.rotation.set(0,0,0)}}}

/* ---------- on-screen bits: a screen flash (the present card itself is the advent calendar's) ---------- */
function flash(col,a,sec){const f=document.createElement('div');f.className='lodgeflash';f.style.background=col;document.body.appendChild(f);f.animate([{opacity:a},{opacity:0}],{duration:(sec||.4)*1000,easing:'ease-out'}).onfinish=()=>f.remove()}
/* the camera zoom is also driven by the show */
{const vw=window.VIEWX;window.VIEWX=function(){if(CINE.view&&(mode_()=='menu'||mode_()=='play'))return CINE.view;return typeof vw=='function'?vw():0}}

/* ---------- styles ---------- */
const css2=document.createElement('style');css2.textContent=`
#lodged{position:fixed;left:50%;bottom:22px;z-index:90;width:min(720px,94vw);transform:translate(-50%,20px);opacity:0;pointer-events:none;transition:opacity .2s,transform .25s;font:14px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#e8f3ec}
#lodged.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
#lodged .lcard{position:relative;padding:16px 16px 10px;background:#0c0c0c;border:3px solid #000;box-shadow:inset 0 0 0 2px #262626,6px 6px 0 #000a}
#lodged .lcard:before{content:'';position:absolute;left:0;right:0;top:0;height:7px;background:repeating-linear-gradient(135deg,#c0392b 0 8px,#f4f4f4 8px 16px);border-bottom:3px solid #000}
#lodged .lhd{display:flex;align-items:center;gap:12px;margin:6px 0 8px}
#lodged .lpt{width:56px;height:56px;image-rendering:pixelated;background:#1b2a3f;border:3px solid #000;box-shadow:inset 0 0 0 2px #3d5a80}
#lodged .lnm{flex:1}#lodged .lnm b{display:block;font:700 15px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#ffd75e}#lodged .lnm small{color:#8aa094;font-size:11px}
#lodged .lpips{display:flex;gap:4px}#lodged .lpips i{width:14px;height:14px;background:#262626;border:2px solid #000;transform:rotate(45deg)}#lodged .lpips i.on{background:#ffd75e;box-shadow:0 0 6px #ffd75e}
#lodged .ltx{min-height:46px;font-size:15px;color:#fff}
#lodged .lbt{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
#lodged .lbt button{display:flex;align-items:center;gap:7px;padding:9px 14px;background:#1a1a1a;color:#e8f3ec;border:3px solid #000;box-shadow:inset 0 -3px #0008;font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;cursor:pointer}
#lodged .lbt button b{color:#ffd75e}#lodged .lbt button img{width:26px;height:26px;image-rendering:pixelated}
#lodged .lbt button.go{background:#2e8b4e;color:#fff}#lodged .lbt button:hover:not(:disabled){filter:brightness(1.25)}#lodged .lbt button:active:not(:disabled){transform:translateY(1px)}
#lodged .lbt button:disabled{opacity:.4;cursor:not-allowed}
#lodged .lhint{margin-top:8px;color:#5f7568;font-size:10px;text-align:right}
#lodgebub{position:fixed;z-index:62;max-width:220px;padding:6px 10px;background:#fff;color:#1a1a1a;border:3px solid #000;box-shadow:3px 3px 0 #0006;font:700 12px/1.3 Silkscreen,ui-monospace,monospace;text-align:center;opacity:0;pointer-events:none;transform:translate(-50%,-100%) scale(.85);transition:opacity .15s,transform .15s}
#lodgebub.on{opacity:1;transform:translate(-50%,-100%) scale(1)}
#lodgebub:after{content:'';position:absolute;left:50%;bottom:-11px;width:10px;height:10px;background:#fff;border-right:3px solid #000;border-bottom:3px solid #000;transform:translateX(-50%) rotate(45deg)}
.lodgefl{position:fixed;z-index:63;pointer-events:none;font:700 15px Silkscreen,ui-monospace,monospace;letter-spacing:2px;text-shadow:2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000;white-space:nowrap;transform:translate(-50%,-50%)}
.lodgefl.big{font-size:44px;letter-spacing:3px;text-shadow:4px 4px 0 #000,-3px -3px 0 #000,3px -3px 0 #000,-3px 3px 0 #000}
.lodgeflash{position:fixed;inset:0;z-index:95;pointer-events:none}
#lodgecut{position:fixed;inset:0;z-index:94;pointer-events:none;--vg:.25}
#lodgecut i,#lodgecut b{position:absolute;left:0;right:0;height:11vh;background:#000;transition:transform .55s cubic-bezier(.3,.7,.2,1)}
#lodgecut i{top:0;transform:translateY(-100%)}#lodgecut b{bottom:0;transform:translateY(100%)}
#lodgecut.on i,#lodgecut.on b{transform:none}
body.lodgefilm #hud,body.lodgefilm #fsgoal,body.lodgefilm #khint,body.lodgefilm #ntags,body.lodgefilm #lodgehud{visibility:hidden}
#lodgecut s{position:absolute;inset:0;opacity:0;transition:opacity .5s;background:radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,var(--vg)) 100%)}#lodgecut.on s{opacity:1}
@keyframes lodgefade{from{opacity:0}to{opacity:1}}@keyframes lodgepop{from{transform:translateY(14px) scale(.94);opacity:0}to{transform:none;opacity:1}}
`;document.head.appendChild(css2);

/* ---------- start-up, save changes, test hook, dev panel ---------- */
let SPAWNED=false,lastS=null,sec1=0;
function sync(){syncSanta(true);const s=st();if(s.pr&&!s.pr.done)placePresent(true,s.pr);else{PRES.on=false;PRES.g.visible=false}}
{const t0=tick;tick=function(dt){if(S!==lastS&&S&&S.day!==undefined){lastS=S;safe(sync,'sync');safe(()=>{if(SPAWNED)spawnSpots()},'respawn')}
 if(!SPAWNED&&CLOCK>1.5&&lastS){SPAWNED=true;safe(spawnSpots,'spawn')}
 sec1-=dt;if(sec1<0){sec1=1;safe(refreshSpots,'refresh')}
 return t0(dt)}}
function testFeed(kind){const s=st();if((s.c[kind]||0)<1)s.c[kind]=1;feed(kind)}
Object.assign(window.FW_LODGE,{icon,newModel,applySanta,SANTA,PRES,ACTIVE:()=>ACTIVE,SPOTS,st,feed,testFeed,talk,openPresent,burp,deflate,setStage,syncSanta,collect,spawnSpots,rollPrize,inside,presentTalk,presentClosed,floorAt,sync,
 give(n){const s=st();s.c.cookie+=n||5;s.c.cane+=n||5;sv();hudSync(1)},
 reset(){const s=st();s.f=0;s.pr=null;s.cd={};abortScene();sync();spawnSpots()},
 go(){P.x=LX;P.z=LZ+HD+4;P.rot=Math.PI},goIn(){P.x=LX+1;P.z=LZ+2.5},
 view:v=>{CINE.view=v},CINE,shake,emit,ring,tween,after,clock:()=>CLOCK});
/* dev panel buttons (same box the advent calendar uses) */
safe(()=>{const box=document.getElementById('fwdvb');if(!box)return;const msg=t=>{const e=document.getElementById('fwdvs');if(e)e.textContent=t};
 const h=document.createElement('h5');h.textContent="Santa's Lodge (cookies and candy canes, feed Santa)";box.appendChild(h);
 [['Walk to the lodge door',()=>{FW_LODGE.go();msg('At the lodge')}],['Give me 5 cookies + 5 candy canes',()=>{FW_LODGE.give(5);msg('Added 5 of each')}],['Respawn all treats on the map',()=>{const s=st();s.cd={};spawnSpots();msg('Treats respawned')}],['Reset Santa and presents',()=>{FW_LODGE.reset();msg('Santa reset')}]]
 .forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;box.appendChild(b)})},'panel');
/* /dev/ only (this whole file is): every save owns all of Santa's prizes, once, so they can be tried out. Placing or selling them later
   does not bring them back; the dev panel button gives the full set again. Flag S.lodge.all. */
function giveAll(){const LI=window.FW_LODGE_ITEMS,g=window.FW_ADVENT.crate.grant;if(!LI||typeof S=='undefined'||!S)return 0;let n=0;
 LI.list.forEach(o=>{const r={t:o.t,k:o.k,n:o.n,rar:o.tier};if(o.t=='f')r.key=o.key;else r.i=o.i;if(safe(()=>g(r),'giveAll'))n++});st().all=1;sv();return n}
setInterval(()=>{try{if(mode_()=='play'&&typeof S!='undefined'&&S&&!st().all)giveAll()}catch(e){soft(e,'giveAll')}},2000);
safe(()=>{const box=document.getElementById('fwdvb');if(!box)return;const b=document.createElement('button');b.textContent="Give me all of Santa's prizes";
 b.onclick=()=>{const n=giveAll(),e=document.getElementById('fwdvs');if(e)e.textContent=n+" Santa prizes given (cars by your house, Pip in your pets, the rest in Storage)"};box.appendChild(b)},'panel2');
window.FW_LODGE.giveAll=giveAll;
/*END*/
})();
