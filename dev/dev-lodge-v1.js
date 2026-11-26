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
const dk=(c,f)=>{const k=new THREE.Color(c);k.r=Math.min(1,k.r*f);k.g=Math.min(1,k.g*f);k.b=Math.min(1,k.b*f);return'#'+k.getHexString()};
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
 /* the sign at the bottom of the path */
 X('ext',.3,2.6,.3,C.logD,-3.4,1.3,HD+14.2);X('ext',.3,2.6,.3,C.logD,3.4,1.3,HD+14.2);X('ext',8.0,1.6,.3,C.log2,0,2.1,HD+14.2);X('ext',8.2,.2,.5,C.snow,0,3.0,HD+14.2);
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
function buildInside(){
 /* rugs: a big red round-ish rug in front of Santa with a white and gold border, and a runner from the door */
 const rugs=(w,d,x,z,c,c2,c3)=>{X('inn',w+.5,.04,d+.5,c3,x,.4,z);X('inn',w+.2,.05,d+.2,c2,x,.41,z);X('inn',w-.1,.06,d-.1,c,x,.42,z)};
 rugs(10.6,7.4,0,-3.9,C.red,C.white,C.gold);X('inn',8.4,.07,5.4,C.redD,0,.43,-3.9);X('inn',5.4,.08,3.8,C.red,0,.44,-3.9);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;X('inn',.5,.09,.5,i%2?C.gold:C.white,Math.cos(a)*2.6,.45,-3.9+Math.sin(a)*1.7,a)}
 rugs(3.4,6.4,0,4.5,C.green,C.white,C.red);for(let i=0;i<5;i++)X('inn',2.6,.07,.5,C.greenD,0,.43,2.2+i*1.1);
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
  solid(bxx-1.95,-HD+.3,bxx+1.95,-HD+1.4);
  X('inn',.9,.1,.9,C.wain,3.6,.45,-HD+1.1);X('inn',.2,.5,.2,C.wain,3.6,.7,-HD+1.1);X('inn',.9,.9,.9,'#3d6fa8',3.6,1.4,-HD+1.1);X('inn',.95,.04,.95,C.goldL,3.6,1.4,-HD+1.1);X('inn',.95,.95,.04,C.goldL,3.6,1.4,-HD+1.1);solidC(3.6,-HD+1.1,.6)}
 /* the clock */
 {const cx=11.0,cz=-HD+1.0;X('inn',1.3,4.6,1.0,C.wain,cx,2.6,cz);X('inn',1.5,.3,1.2,C.pineD,cx,5.0,cz);X('inn',.9,.9,.1,C.cream,cx,3.8,cz+.55);X('inn',.08,.4,.06,C.iron,cx,3.9,cz+.6);X('inn',.3,.06,.06,C.iron,cx+.1,3.8,cz+.6);X('inn',.6,1.6,.1,C.pineD,cx,2.0,cz+.55);X('inn',.2,.2,.1,C.goldL,cx,1.7,cz+.6);solid(cx-.8,-HD+.3,cx+.8,-HD+1.6)}
 /* wooden toy shelf + sack of toys on the east side, a work table with a half-painted rocking horse */
 {const sx=8.6,sz=-.5;X('inn',2.8,.2,1.6,C.pineD,sx,1.5,sz);for(const [a,b] of[[-1.2,-.6],[1.2,-.6],[-1.2,.6],[1.2,.6]])X('inn',.2,1.4,.2,C.wain,sx+a,.8,sz+b);X('inn',2.6,.12,1.4,C.wain,sx,.5,sz);
   X('inn',.5,.4,.5,C.red,sx-.9,1.8,sz);X('inn',.5,.4,.5,C.green,sx-.3,1.8,sz+.1);X('inn',.5,.7,.5,C.gold,sx+.4,1.95,sz-.1);X('inn',.3,.3,.3,'#fff',sx+1,1.75,sz+.1);
   X('inn',1.8,.4,.7,C.green,sx-.2,.8,sz-.1);X('inn',.5,.3,.7,C.red,sx+.2,1.1,sz-.1);X('inn',.3,.2,.3,C.iron,sx-.8,1.1,sz-.1);
   solid(sx-1.5,sz-.9,sx+1.5,sz+.9)}
 {const sx=10.2,sz=-6.2;X('inn',2.2,2.0,1.8,'#a87a3c',sx,1.35,sz);X('inn',1.6,.7,1.4,'#a87a3c',sx,2.7,sz);X('inn',1.0,.5,.9,'#8d6330',sx,3.15,sz);X('inn',1.7,.2,1.5,C.red,sx,2.45,sz);X('inn',.5,.3,.5,C.goldL,sx,3.5,sz);[[ -.6,2.9,.7,C.red],[.6,2.9,.6,C.green],[0,3.4,.7,'#3f6fd6']].forEach(([a,y,b,c])=>X('inn',.45,.45,.45,c,sx+a,y+.5,sz+b*.0));solid(sx-1.3,sz-1.1,sx+1.3,sz+1.1)}
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
 /* the sign at the bottom of the path */
 const sg2=canvasTex(8,1.5,(c,w,h)=>{c.fillStyle='#5b3418';c.fillRect(0,0,w,h);c.strokeStyle='#e6b422';c.lineWidth=6;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#f6f8fb';c.font='bold '+Math.round(h*.34)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText("SANTA'S LODGE",w/2,h*.38);c.fillStyle='#ffd75e';c.font=Math.round(h*.2)+'px '+FONT;c.fillText('Feed Santa: bring cookies & candy canes',w/2,h*.72)},50);
 stat.add(flat(sg2,8,1.5,0,2.1,HD+14.36,0));
 /* the sign is two-sided so it reads from the meadow side too */
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
const SK='#f0b48a',SKD='#d9966d',FUR='#f8fafc',REDC='#c8261f',REDD='#9a1d18',BLK='#1d1d22';
const SANTA=(()=>{
 const A={};const g=A.root=grp(dynG,SNX,.45,SNZ);const body=A.body=grp(g,0,0,0);
 /* boots and legs */
 [-1,1].forEach(s=>{part(body,.38,.3,.56,BLK,s*.23,.15,.06);part(body,.4,.07,.6,'#3a2414',s*.23,.035,.06);part(body,.4,.1,.4,FUR,s*.23,.32,0);part(body,.36,.5,.4,REDC,s*.23,.6,0)});
 /* belly: this is the part that swells */
 const belly=A.belly=grp(body,0,.82,0);
 part(belly,1.0,.82,.78,REDC,0,.4,0);part(belly,1.14,.56,.84,REDC,0,.4,.02);part(belly,.9,.5,.3,REDC,0,.34,.42);part(belly,.7,.4,.18,REDC,0,.3,.56);
 part(belly,.22,.86,.06,FUR,0,.4,.6);part(belly,1.18,.16,.9,FUR,0,.03,0);part(belly,.96,.1,.34,FUR,0,.06,.45);
 part(belly,1.2,.16,.92,BLK,0,.32,.0);part(belly,.34,.26,.06,'#e6b422',0,.32,.6);part(belly,.18,.12,.08,BLK,0,.32,.62);part(belly,.12,.12,.1,'#f6d56a',0,.32,.63);
 [-1,1].forEach(s=>{part(belly,.06,.18,.06,'#e6b422',s*.3,.58,.58);part(belly,.06,.18,.06,'#e6b422',s*.3,.74,.55)});
 /* chest and shoulders */
 const chest=A.chest=grp(body,0,1.6,0);part(chest,.94,.5,.68,REDC,0,.2,0);part(chest,1.2,.2,.64,REDD,0,.4,0);part(chest,.2,.5,.06,FUR,0,.2,.35);part(chest,.7,.1,.5,FUR,0,.48,0);
 /* arms: shoulder pivots */
 A.arm=[-1,1].map(s=>{const a=grp(body,s*.68,1.92,0);part(a,.28,.6,.32,REDC,0,-.3,0);part(a,.34,.14,.38,FUR,0,-.62,0);part(a,.3,.26,.34,BLK,0,-.8,0);part(a,.1,.2,.1,BLK,s*.0,-.92,.15);return a});
 /* head */
 const head=A.head=grp(body,0,1.92,0);part(head,.62,.6,.58,SK,0,.3,0);
 part(head,.14,.08,.02,'#ee8a80',-.2,.2,.3);part(head,.14,.08,.02,'#ee8a80',.2,.2,.3);part(head,.18,.18,.14,'#e98a80',0,.26,.35);part(head,.08,.14,.08,SKD,-.34,.3,0);part(head,.08,.14,.08,SKD,.34,.3,0);
 A.eye=[-1,1].map(s=>{const e=grp(head,s*.15,.38,.3);part(e,.1,.1,.03,'#fff',0,0,0);part(e,.07,.09,.03,BLK,0,0,.01);part(e,.025,.03,.03,'#fff',s*.015,.02,.02);part(head,.2,.09,.06,FUR,s*.15,.5,.31,{r:[0,0,-s*.2]});return e});
 /* beard, moustache, mouth, jaw */
 part(head,.7,.16,.56,FUR,0,.1,0);part(head,.66,.3,.12,FUR,-0,.2,.22);part(head,.5,.14,.16,FUR,0,.12,.36);part(head,.18,.12,.16,FUR,-.19,.1,.42,{r:[0,0,.25]});part(head,.18,.12,.16,FUR,.19,.1,.42,{r:[0,0,-.25]});
 A.mouth=part(head,.28,.06,.05,'#4a1414',0,.02,.47);A.tongue=part(head,.2,.04,.05,'#e06a78',0,-.02,.46);A.tongue.visible=false;
 const jaw=A.jaw=grp(head,0,.02,.18);
 part(jaw,.66,.26,.5,FUR,0,-.14,.1);part(jaw,.56,.3,.46,FUR,0,-.4,.1);part(jaw,.44,.26,.38,FUR,0,-.64,.08);part(jaw,.3,.2,.28,FUR,0,-.84,.06);part(jaw,.2,.16,.2,FUR,0,-1.0,.04);part(jaw,.22,.06,.1,'#e06a78',0,-.04,.2);
 /* hat: pivot at the brow so it can wobble */
 const hat=A.hat=grp(head,0,.6,0);part(hat,.8,.2,.74,FUR,0,.0,0);part(hat,.64,.26,.58,REDC,0,.22,-.02);part(hat,.52,.24,.5,REDC,0,.44,-.08);part(hat,.42,.22,.4,REDD,0,.62,-.2);part(hat,.32,.2,.32,REDD,0,.74,-.36);part(hat,.26,.22,.26,REDD,0,.7,-.56);A.pom=part(hat,.26,.26,.26,FUR,0,.52,-.68);
 /* nothing visible casts a hard shadow on the rug but the sun's; a soft round blob under him */
 A.blob=new THREE.Mesh(new THREE.CircleGeometry(.9,12),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.28,depthWrite:false}));A.blob.rotation.x=-Math.PI/2;A.blob.position.set(0,.02,.0);g.add(A.blob);
 A.g=1;A.bw=1;A.open=0;A.mood=0;A.tilt=0;A.look=0;A.blink=0;A.nextBlink=2;A.rumble=0;A.eyeW=1;A.hatLift=0;A.cheek=0;A.chew=0;A.step=0;
 return A})();
const SB=.74;/* base size: about 2.3 m tall, so the biggest stage still fits under the 5.2 m walls */
const STAGE=[1,1.16,1.34,1.56,1.8];/* body size after 0..4 treats; he swells a bit more in the belly */
const BELLY=[1,1.1,1.22,1.36,1.52];
function applySanta(){const A=SANTA,k=A.g*SB;A.root.scale.setScalar(k);A.belly.scale.set(A.bw,1+(A.bw-1)*.45,A.bw*.96);A.root.position.y=.45;A.arm.forEach((a,i)=>{a.position.x=(i?1:-1)*(.68+(A.bw-1)*.42)});
 A.jaw.rotation.x=A.open*.62;A.mouth.scale.set(.28+A.open*.14,.06+A.open*.42,.05);A.mouth.position.y=.02-A.open*.14;A.tongue.visible=A.open>.3;A.tongue.position.y=-.12-A.open*.1;A.tongue.scale.set(.2,.05+A.open*.1,.06);
 A.head.rotation.x=A.tilt;A.head.rotation.y=A.look;A.head.scale.setScalar(1+A.cheek*.12);A.hat.rotation.x=A.hatLift;A.eye.forEach(e=>{e.scale.set(A.eyeW,Math.max(.08,A.eyeW*(1-A.blink)),1)});
 A.blob.scale.set(A.g*1.05,A.g*1.05,1)}
SANTA.g=STAGE[0];SANTA.bw=BELLY[0];applySanta();
const santaHead=()=>{const A=SANTA,k=A.g*SB;return new THREE.Vector3(SNX,.45+k*(1.92+.1),SNZ+k*.3)};
const santaMouth=()=>{const A=SANTA,k=A.g*SB;return new THREE.Vector3(SNX,.45+k*(1.92+.02),SNZ+k*.55)};
function bellyBounce(a){const A=SANTA,b=A.bw;tween(.28,k=>{A.bw=b+Math.sin(k*Math.PI)*a*1.2;applySanta()},()=>{A.bw=b;applySanta()})}
function setStage(i,dur,ov){/* grow with a rubbery overshoot: belly first, then the whole of him */
 const A=SANTA,g0=A.g,b0=A.bw,g1=STAGE[clamp(i,0,4)],b1=BELLY[clamp(i,0,4)];
 return tween(dur||1,k=>{const e=easeOutElastic(k),f=ov?e:easeOutBack(k);A.g=lerp(g0,g1,f);A.bw=lerp(b0,b1,easeOutElastic(clamp(k*1.1,0,1)));A.hatLift=Math.sin(k*Math.PI*3)*.18*(1-k);applySanta()})}

/* idle behaviour: breathing, blinking, looking at you, swaying */
function santaIdle(dt){const A=SANTA,t=CLOCK;if(A.busy)return;
 A.nextBlink-=dt;if(A.nextBlink<0){A.nextBlink=2+Math.random()*3;tween(.18,k=>{A.blink=Math.sin(k*Math.PI);applySanta()})}
 const dx=P.x-(LX+SNX),dz=P.z-(LZ+SNZ),near=Math.hypot(dx,dz)<12&&inside(P.x,P.z);const want=near?clamp(Math.atan2(dx,dz),-.75,.75):0;A.look+=(want-A.look)*Math.min(1,dt*4);
 A.tilt=Math.sin(t*.7)*.025;A.arm.forEach((a,i)=>{a.rotation.x=A.armOv?A.armOv[i]:Math.sin(t*1.3+i*2)*.04;a.rotation.z=(i?-1:1)*(.07+Math.sin(t*1.3)*.015)+(A.armZ?A.armZ[i]:0)});
 A.root.rotation.z=Math.sin(t*.5)*.012;if(!A.fixBelly){A.belly.position.y=.82+Math.sin(t*1.6)*.006}applySanta()}

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
function presentBatch(body,lid,tint){
 const c1=tint||'#c0392b',c2=tint?dk(tint,.8):'#a3202f';
 bx(body,1,.74,1,c1,0,.37,0);bx(body,.2,.76,1.02,'#f6f8fb',0,.38,0);bx(body,1.02,.76,.2,'#f6f8fb',0,.38,0);
 bx(lid,1.12,.22,1.12,c2,0,.0,0);bx(lid,.22,.24,1.14,'#f6f8fb',0,0,0);bx(lid,1.14,.24,.22,'#f6f8fb',0,0,0);
 bx(lid,.38,.2,.22,'#f6f8fb',-.24,.2,0,0,0,.3);bx(lid,.38,.2,.22,'#f6f8fb',.24,.2,0,0,0,-.3);bx(lid,.22,.2,.38,'#f6f8fb',0,.2,-.24);bx(lid,.22,.2,.38,'#f6f8fb',0,.2,.24);bx(lid,.22,.18,.22,'#e6b422',0,.26,0)}
function bakeMesh2(fn){const b=mkB();fn(b);return flush(b,lam())}
const MODEL={};
function modelOf(k){if(MODEL[k])return MODEL[k];const g=new THREE.Group();
 if(k=='cookie')g.add(bakeMesh2(cookieBatch));else if(k=='cane'){const m=bakeMesh2(caneBatch);m.position.x=-.3;m.position.y=-.1;g.add(m)}
 else if(k=='present'){const bb=mkB(),lb=mkB();presentBatch(bb,lb);g.add(flush(bb,lam()));const lid=flush(lb,lam());lid.position.y=.84;lid.name='lid';g.add(lid)}
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
renderer.render=function(sc,c){if(c===cam){const n=performance.now(),dt=Math.min(.06,(n-lastT)/1000);lastT=n;if(!(typeof PAUSED!='undefined'&&PAUSED)){try{tick(dt)}catch(e){soft(e,'tick')}}}return r0(sc,c)};
let hudT=0;
function tick(dt){if(!away()){stepAnims(dt);const near=stepPlace(dt);stepSpots(dt);stepParts(dt);if(near){santaIdle(dt);stepPresent(dt);stepBubble(dt);camFx(dt)}}hudT-=dt;if(hudT<0){hudT=.3;hudSync();if(mode_()!='play'&&hud.style.display!='none')hud.style.display='none'}}

/* =====================================================================================================================
   SANTA TALKS, YOU FEED HIM, HE GROWS, HE BURPS, A PRESENT FLIES OUT
   ===================================================================================================================== */
const CINE={view:0,ox:0,oz:0,tx:0,tz:0};/* camera help: a zoom and a nudge toward Santa during the show */
let SHK=0;const shake=a=>{SHK=Math.max(SHK,a)};
function camFx(dt){const k=1-Math.exp(-dt*4);CINE.ox+=(CINE.tx-CINE.ox)*k;CINE.oz+=(CINE.tz-CINE.oz)*k;
 if(Math.abs(CINE.ox)<.002&&Math.abs(CINE.oz)<.002&&SHK<.002)return;
 SHK*=Math.pow(.03,dt);const sx=(Math.random()-.5)*SHK,sy=(Math.random()-.5)*SHK;
 cam.position.x+=CINE.ox;cam.position.z+=CINE.oz;cam.lookAt(camT.x+CINE.ox,.8,camT.z+CINE.oz);cam.translateX(sx);cam.translateY(sy)}

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
addEventListener('keydown',e=>{if(!DLG.open&&!(REV&&REV.on))return;
 if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();if(REV&&REV.on){if(REV.canClose)revClose(true);return}if(!SANTA.busy)closeDlg()}
 else if((e.key=='Enter'||e.key==' ')&&DLG.open&&!(REV&&REV.on)){e.preventDefault();e.stopImmediatePropagation();skipText()}},true);
setInterval(()=>{if((DLG.open||SANTA.busy)&&mode_()!='menu'&&!(REV&&REV.on)){/* paused or something else took over: end the scene cleanly */abortScene()}},400);
function abortScene(){if(DLG.open){DLG.open=false;DLG.token++;if(DLG.el)DLG.el.classList.remove('on')}CINE.tx=CINE.tz=0;CINE.view=0;TWN.length=0;SCH.length=0;SANTA.busy=0;SANTA.armOv=SANTA.armZ=null;SANTA.open=0;SANTA.blink=0;SANTA.eyeW=1;SANTA.cheek=0;SANTA.hatLift=0;SANTA.hat.position.y=.6;SANTA.root.position.x=SNX;syncSanta(true);if(REV&&REV.on)revClose(true)}

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
 floatText('+1  '+f+'/5','#ffd75e',false);lightPips(f);A.armOv=[-.9,-.9];
 const base=new THREE.Vector3(SNX,.5,SNZ);ring(base,'#ffd75e',3+f*.5,.9);emit(SNX,.6+A.g*1.5,SNZ+.3,28,{colors:['#ffd75e','#fff6c8','#ffffff','#ff7a7a'],speed:3.4,up:3.2,size:.15,life:1,grav:5,floor:-9,spread:.6});
 [0,1,2,3,4].forEach(i=>after(i*.07,()=>sparkSnd()));
 const lines=[["Mmm! I feel a little rounder already!","Ho ho ho!"],["Oh my, my belt is getting tight!","More, more!"],["Ho ho hold on, I'm getting BIGGER!","Is the ceiling getting lower?"],["Uh oh... I think I might... burp.","One more treat and WOW!"]][f-1];
 after(.9,()=>{A.armOv=null;laugh(2)});
 after(1.55,()=>{A.busy=0;if(!openDlg())return;menu(false,lines[0]+' '+lines[1])})}
/* a flat ring that spreads over the floor and fades (shockwaves, sparkle bursts) */
function ring(c,col,rad,dur){const m=new THREE.Mesh(new THREE.RingGeometry(.9,1,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(c.x,.5,c.z);root.add(m);
 tween(dur||.8,k=>{const s=.4+k*rad;m.scale.set(s,s,1);m.material.opacity=.8*(1-k)},()=>{root.remove(m);m.geometry.dispose();m.material.dispose()},easeOutSine)}

/* ---------- the big moment: 5th treat. He inhales, swells, shakes, holds his breath ... BURP ---------- */
const TIERN={2:'RARE',3:'EPIC',4:'LEGENDARY'};
function rollPrize(){/* the advent calendar's own crate roll, restricted to its top three tiers: Rare, Epic, Legendary (same pool, same odds ratio 13:6:1, same neighbouring-tier fallback) */
 const cr=window.FW_ADVENT.crate,od=[2,3,4].map(t=>cr.TIERS[t].odds),tot=od.reduce((a,b)=>a+b,0);let r=Math.random()*tot,t=2;for(let i=0;i<3;i++){if(r<od[i]){t=2+i;break}r-=od[i];t=2+i}
 for(let d=0;d<5;d++)for(const tt of[t-d,t+d]){if(tt<2||tt>4)continue;const c=cr.pool().filter(o=>o.tier==tt);if(c.length)return cr.prizeFrom(pk(c))}
 return cr.prizeFrom(pk(cr.pool()))}
const tierCol=t=>window.FW_ADVENT.crate.TIERS[clamp(t,0,4)].c;
function burp(){const s=st(),A=SANTA;
 /* decide the present now, and save it, so closing the tab can never lose or re-roll it */
 const pr=rollPrize();s.pr=Object.assign({},pr,{done:0});s.f=0;sv();
 const col=tierCol(pr.rar);A.busy=1;CINE.view=9.6;CINE.tx=(LX+SNX-P.x)*.9;CINE.tz=(LZ+SNZ-P.z)*.9;
 lightPips(5);
 /* 1. inhale: the belly swells, he goes wide-eyed, the hat starts to rattle */
 bubble('Uh oh...',1.6);rumble(1.2,.3,100);A.cheek=.5;
 const g0=A.g,b0=A.bw;
 tween(1.3,k=>{const e=sm(0,1,k);A.g=lerp(g0,2.0,e);A.bw=lerp(b0,2.0,e)+Math.sin(k*40)*.015*k;A.eyeW=1+.45*e;A.tilt=-.12*e;A.hatLift=Math.sin(k*60)*.1*k;A.cheek=.5+.5*e;A.armOv=[-.4*e,-.4*e];A.armZ=[.5*e,-.5*e];applySanta()});
 shake(.06);
 /* 2. second swell, louder, he trembles */
 after(1.3,()=>{bubble('Hold on...',1.4);rumble(1.2,.4,90);shake(.1);boing(3);
  const g1=A.g,b1=A.bw;tween(1.1,k=>{const e=sm(0,1,k),j=Math.sin(k*90)*.035*k;A.g=lerp(g1,2.12,e)+j;A.bw=lerp(b1,2.4,e)+j*2;A.root.position.x=SNX+Math.sin(k*70)*.05*k*SB*A.g;A.hatLift=Math.sin(k*70)*.18*k;A.eyeW=1.45+.25*k;A.cheek=1;applySanta()},()=>{A.root.position.x=SNX});
  [0,.2,.4,.6,.8,1.0].forEach(d=>after(d,()=>shake(.05+d*.06)))});
 /* 3. he holds his breath for a heartbeat, eyes squeezed shut */
 after(2.45,()=>{A.hatLift=0;A.blink=.9;A.tilt=-.34;applySanta();safe(()=>sdHit(60,.5,.25,[[1,1,1]],{jit:0}),'hb');shake(.02)});
 /* 4. BURP */
 after(2.9,()=>doBurp(pr,col))}
function doBurp(pr,col){const A=SANTA;const mo=santaMouth();
 burpSound(true);shake(.55);A.blink=0;A.eyeW=1.2;
 tween(.14,k=>{A.open=lerp(0,1,k);A.tilt=lerp(-.34,.22,easeOutSine(k));applySanta()});
 /* the air goes out of him in one squashed snap, then he settles at his last size */
 const g1=A.g,b1=A.bw;tween(.5,k=>{const e=easeOutBounce(k);A.bw=lerp(b1,BELLY[4]*.92,e)-Math.sin(Math.min(1,k*2.2)*Math.PI)*.35;A.g=lerp(g1,STAGE[4],e);A.cheek=lerp(1,0,k);A.armZ=[lerp(.5,0,k),lerp(-.5,0,k)];applySanta()});
 /* the hat pops up and wobbles back down */
 tween(1.0,k=>{A.hat.position.y=.6+Math.sin(Math.min(1,k*1.6)*Math.PI)*.9*(1-k*.4);A.hat.rotation.z=Math.sin(k*Math.PI*2)*.5*(1-k);applySanta()},()=>{A.hat.position.y=.6;A.hat.rotation.z=0});
 /* the cloud */
 emit(mo.x,mo.y,mo.z+.2,34,{colors:['#e8f7d4','#d7efbe','#f4ffe9','#ffffff','#b9e08a'],speed:3.4,up:.8,size:.5,life:1.4,dir:[0,1,.05],grav:-.5,floor:-9,fade:.35,spread:.3});
 emit(mo.x,mo.y,mo.z+.2,16,{colors:['#c8f07a','#ffffff'],speed:5,up:.6,size:.18,life:1,dir:[0,1,0],grav:4,floor:.45});
 ring({x:SNX,z:SNZ},'#d8f2b8',9,.9);ring({x:SNX,z:SNZ},'#ffffff',6,.6);
 flash('#ffffff',.5,.3);floatText('BUUURP!','#bff08a',true,santaHead().add(new THREE.Vector3(LX,.7,LZ+1.1)));
 /* the present shoots out */
 after(.12,()=>launchPresent(pr,col,mo));
 after(.15,()=>{boing(0);sn('pop')});
 /* mouth closes, he blushes, shrinks back with a long squeaky sigh */
 after(1.0,()=>{tween(.35,k=>{A.open=lerp(1,.1,k);A.tilt=lerp(.22,0,k);applySanta()});bubble('Excuse me!',1.8)});
 after(1.6,()=>{lightPips(0);laugh(3)});
 after(2.3,()=>deflate())}
function deflate(){const A=SANTA;safe(()=>{sdNz(1.0,2400,.2,{q:3,f2:500});},'air');const g0=A.g,b0=A.bw;
 tween(1.7,k=>{const e=1-Math.pow(1-k,3),w=Math.sin(k*22)*.025*(1-k);A.g=lerp(g0,STAGE[0],e)+w;A.bw=lerp(b0,BELLY[0],e)+w*1.5;applySanta()},()=>{A.g=STAGE[0];A.bw=BELLY[0];applySanta()})}

/* ---------- the present: flight, bounces, glow, and the opening ---------- */
const PRES={on:false,ready:false,g:new THREE.Group(),phase:'',t:0};
PRES.g.visible=false;dynG.add(PRES.g);
PRES.m=newModel('present');PRES.g.add(PRES.m);PRES.lid=PRES.m.getObjectByName('lid');
PRES.beam=[0,1].map(i=>{const b=new THREE.Mesh(beamGeo,beamMat.clone());b.material.userData.xms=1;b.position.y=2.6;b.rotation.y=i*Math.PI/2;PRES.g.add(b);return b});
PRES.glow=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));PRES.glow.rotation.x=-Math.PI/2;PRES.glow.position.y=.06;PRES.g.add(PRES.glow);PRES.glow.scale.setScalar(1.8);
PRES.body=PRES.m.children[0];
function tintPresent(col){PRES.beam.forEach(b=>{b.material.map=beamTex;b.material.color.set(col);b.material.needsUpdate=true});PRES.glow.material.color.set(col)}
const PREST=.45;/* floor height of the rug top */
function placePresent(rest,pr){PRES.on=true;PRES.g.visible=true;PRES.pr=pr;tintPresent(tierCol(pr.rar));PRES.g.position.set(PRES_AT[0],PREST,PRES_AT[1]);PRES.g.rotation.set(0,rest?.5:0,0);PRES.m.scale.setScalar(1);PRES.m.rotation.set(0,0,0);if(PRES.lid){PRES.lid.visible=true;PRES.lid.position.set(0,.84,0);PRES.lid.rotation.set(0,0,0)}
 PRES.phase=rest?'rest':'';PRES.ready=!!rest;PRES.beam.forEach(b=>{b.visible=!!rest;b.scale.y=1});PRES.glow.visible=!!rest}
function launchPresent(pr,col,mo){placePresent(false,pr);PRES.beam.forEach(b=>b.visible=false);PRES.glow.visible=false;PRES.ready=false;PRES.phase='fly';PRES.t=0;PRES.bounces=0;
 const T=.95,gv=17,x0=mo.x,y0=mo.y,z0=mo.z+.3,xL=PRES_AT[0],zL=PRES_AT[1],yL=PREST;
 PRES.vx=(xL-x0)/T;PRES.vz=(zL-z0)/T;PRES.vy=(yL-y0+.5*gv*T*T)/T;PRES.gv=gv;PRES.g.position.set(x0,y0-.35,z0);PRES.spin=new THREE.Vector3(7,9,4);PRES.m.scale.setScalar(.05);PRES.col=col;PRES.sq=0}
function stepPresent(dt){if(!PRES.on)return;const g=PRES.g;
 if(PRES.phase=='fly'){PRES.t+=dt;PRES.m.scale.setScalar(Math.min(1,PRES.m.scale.x+dt*7));PRES.vy-=PRES.gv*dt;g.position.x+=PRES.vx*dt;g.position.z+=PRES.vz*dt;g.position.y+=PRES.vy*dt;PRES.m.rotation.x+=PRES.spin.x*dt;PRES.m.rotation.y+=PRES.spin.y*dt;PRES.m.rotation.z+=PRES.spin.z*dt;
  if(Math.random()<.85)emit(g.position.x,g.position.y+.3,g.position.z,1,{colors:[PRES.col,'#ffffff','#fff6c8'],speed:.4,up:.2,grav:1,life:.7,size:.13,floor:-9});
  if(g.position.y<=PREST&&PRES.vy<0){g.position.y=PREST;const sp=-PRES.vy;PRES.bounces++;shake(Math.min(.3,sp*.02));sn('pop');safe(()=>sdHit(90+Math.random()*20,.25,.3,[[1,1,1],[2.4,.3,.4]],{bend:.5}),'thud');
   emit(g.position.x,PREST+.1,g.position.z,10,{colors:['#e9f0f6','#ffffff',PRES.col],speed:1.6,up:1.4,size:.12,life:.7,grav:9});PRES.sq=1;
   PRES.vy=sp*.44;PRES.vx*=.45;PRES.vz*=.45;PRES.spin.multiplyScalar(.45);if(PRES.bounces>=4||PRES.vy<1.6){PRES.vy=0;PRES.phase='settle';PRES.t=0}}}
 else if(PRES.phase=='settle'){PRES.t+=dt;const k=clamp(PRES.t/.5,0,1);PRES.m.rotation.x*=1-k*.4;PRES.m.rotation.z*=1-k*.4;PRES.m.rotation.y+=(Math.round(PRES.m.rotation.y/(Math.PI/2))*Math.PI/2-PRES.m.rotation.y)*Math.min(1,dt*8);g.position.x+=PRES.vx*dt;g.position.z+=PRES.vz*dt;PRES.vx*=.9;PRES.vz*=.9;
  if(k>=1){PRES.phase='rest';PRES.ready=true;PRES.m.rotation.set(0,0,0);g.rotation.y=PRES.m.rotation.y;PRES.beam.forEach(b=>{b.visible=true;b.scale.y=.01});PRES.glow.visible=true;chimeUp();floatText('A PRESENT!',PRES.col,false,new THREE.Vector3(LX+PRES_AT[0],2.2,LZ+PRES_AT[1]));
   after(.9,()=>{if(!DLG.open&&PRES.on&&PRES.phase=='rest'&&SANTA.busy)presentTalk()})}}
 else if(PRES.phase=='rest'){const t=CLOCK;PRES.beam.forEach(b=>{b.scale.y=Math.min(1,b.scale.y+dt*1.6);b.scale.x=.9+Math.sin(t*2.4)*.15});PRES.glow.scale.setScalar(1.8+Math.sin(t*3)*.18);PRES.m.scale.setScalar(1+Math.sin(t*2.8)*.025);if(Math.random()<dt*3)emit(PRES_AT[0],PREST+.8,PRES_AT[1],1,{colors:[PRES.col,'#ffffff'],speed:.5,up:1.2,grav:-.2,life:1.4,size:.1,floor:-9,spread:.8})}
 /* squash on landing */
 if(PRES.sq>0){PRES.sq=Math.max(0,PRES.sq-dt*5);const s=PRES.sq;PRES.body.scale.set(1+s*.28,1-s*.3,1+s*.28);if(PRES.lid)PRES.lid.position.y=.84-s*.22}else if(PRES.body.scale.y!=1){PRES.body.scale.set(1,1,1);if(PRES.lid&&PRES.phase!='opening')PRES.lid.position.y=.84}}
/* after he burps and the present has landed, Santa speaks and offers it */
function presentTalk(){const A=SANTA;A.busy=0;P.rot=Math.atan2(LX+PRES_AT[0]-P.x,LZ+PRES_AT[1]-P.z);if(!openDlg())return;const el=ensureDlg();el.querySelector('.lpips').innerHTML=pips();CINE.view=0;
 sayLines(["Ho ho ho! Pardon me! That one is for YOU.","Go on, open it! It's a special one, I can feel it in my belly."],null,bt=>{btn(bt,'OPEN THE PRESENT',()=>{closeDlg();openPresent()},'go');btn(bt,'LATER',()=>closeDlg())})}
function openPresent(){const s=st();if(!(s.pr&&!s.pr.done)||!PRES.on||!PRES.ready||SANTA.busy)return;if(!(mode_()=='play'||mode_()=='menu'))return;
 if(mode_()=='play'){try{$('ui').innerHTML=''}catch(e){}mode='menu'}SANTA.busy=1;PRES.phase='opening';PRES.ready=false;CINE.view=7;CINE.tx=(LX+PRES_AT[0]-P.x)*.5;CINE.tz=(LZ+PRES_AT[1]-P.z)*.5;P.rot=Math.atan2(LX+PRES_AT[0]-P.x,LZ+PRES_AT[1]-P.z);
 const pr=s.pr,col=tierCol(pr.rar),n=pr.rar-1;/* rare 1 ... legendary 3: how big the show is */
 /* wind-up: it rattles harder and the ticks climb */
 tween(1.15,k=>{PRES.m.rotation.z=Math.sin(k*70)*.12*k;PRES.m.rotation.x=Math.cos(k*61)*.1*k;PRES.m.position.y=Math.abs(Math.sin(k*30))*.06*k;PRES.beam.forEach(b=>{b.scale.y=1+k*.6;b.scale.x=1+k*.7});PRES.glow.scale.setScalar(1.8+k*1.4)});
 for(let i=0;i<7;i++)after(i*.16,()=>safe(()=>sdHit(520*Math.pow(1.12,i),.12,.16,[[1,1,1],[2,.2,.4]],{jit:0}),'tick'));shake(.04);
 after(1.2,()=>{/* pop: the lid flies off, a colour flash, rings, confetti */
  PRES.m.rotation.set(0,0,0);PRES.m.position.y=0;const lid=PRES.lid;let lv=new THREE.Vector3(1.2,6.5,-.8),lp=lid.position.clone();tween(1.1,k=>{lv.y-=16*(1/60);lp.add(lv.clone().multiplyScalar(1/60));lid.position.copy(lp);lid.rotation.x=k*9;lid.rotation.z=k*6},()=>{lid.visible=false});
  flash(col,.55,.4);shake(.2+n*.08);sn('whoosh');ring({x:PRES_AT[0],z:PRES_AT[1]},col,5+n*2,.9);ring({x:PRES_AT[0],z:PRES_AT[1]},'#ffffff',3,.6);
  emit(PRES_AT[0],PREST+.9,PRES_AT[1],50+n*30,{colors:[col,'#ffffff','#ffd75e','#ff7a7a','#7fe3a0','#5fb4ff'],speed:4.5,up:5.5,size:.17,life:1.8,grav:8,floor:PREST+.02});
  PRES.beam.forEach(b=>{b.scale.y=2.4;b.scale.x=2.4});
  if(pr.rar==2)chimeUp();else{chimeUp();after(.25,chimeUp)}if(pr.rar==4){safe(()=>sdHit(70,1.6,.4,[[1,1,1],[2,.5,.5]],{jit:0}),'boom');[0,1,2,3,4,5,6,7].forEach(i=>after(i*.1,()=>safe(()=>sdHit(523*[1,1.25,1.5,2,2.5,3,4,5][i],.7,.1,[[1,1,1],[2,.2,.4]],{rev:.4,jit:0}),'arp')))}
  banner(TIERN[pr.rar],col)});
 after(2.5,()=>revOpen(pr,col))}

/* ---------- on-screen bits: flash, banner, reveal card ---------- */
function flash(col,a,sec){const f=document.createElement('div');f.className='lodgeflash';f.style.background=col;document.body.appendChild(f);f.animate([{opacity:a},{opacity:0}],{duration:(sec||.4)*1000,easing:'ease-out'}).onfinish=()=>f.remove()}
function banner(txt,col){const b=document.createElement('div');b.className='lodgebanner';b.textContent=txt;b.style.setProperty('--c',col);document.body.appendChild(b);b.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.3)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.15)',offset:.25},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.7},{opacity:0,transform:'translate(-50%,-80%) scale(1)'}],{duration:2200,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>b.remove()}
const REV={on:false,canClose:false};
const CATN={f:'Furniture',k:'Clothing',w:'Car wrap',b:'Profile border',p:'Pet',c:'Car'};
function revOpen(pr,col){const o=document.createElement('div');o.id='lodgerev';REV.on=true;REV.canClose=false;REV.o=o;REV.pr=pr;
 o.innerHTML=`<div class=card style="--rc:${col}"><div class=rib>SANTA'S PRESENT</div><div class=stage><canvas aria-label="3D view. Drag to spin."></canvas><div class=hint>&#8596; DRAG TO SPIN</div></div>
  <div class=rarr style="color:${col};border-color:${col}">${TIERN[pr.rar]}</div><h3>${E(pr.n)}</h3><div class=cat>${CATN[pr.t]||'Item'}</div><p>${E(pr.note||'')}</p><button type=button class=cl>CLAIM</button></div>`;
 document.body.appendChild(o);const cv=o.querySelector('canvas');
 REV.v=safe(()=>window.FW_ADVENT.Viewer(cv,pr.k),'viewer');
 const cl=o.querySelector('.cl');cl.onclick=()=>revClaim(cl);setTimeout(()=>{REV.canClose=true},300);setTimeout(()=>cl.focus(),50)}
function revClaim(cl){if(REV.busy)return;REV.busy=1;const s=st(),pr=s.pr;let ok=false;try{ok=window.FW_ADVENT.crate.grant(pr)}catch(e){soft(e,'grant')}
 if(!ok){REV.busy=0;sn('err');cl.textContent='TRY AGAIN';return}
 s.pr.done=1;s.n++;sv();cl.disabled=true;cl.innerHTML='&#10003; CLAIMED!';sn('cash');setTimeout(()=>sn('chime'),120);
 const r=cl.getBoundingClientRect();for(let i=0;i<30;i++){const c=document.createElement('i');c.className='lodgecf';const a=-Math.PI/2+(Math.random()-.5)*2.2,v=160+Math.random()*260;Object.assign(c.style,{left:r.left+r.width/2+'px',top:r.top+'px',background:[tierCol(pr.rar),'#ffd75e','#46e083','#fff','#ff4b4b'][i%5]});document.body.appendChild(c);const dx=Math.cos(a)*v,dy=Math.sin(a)*v;c.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy}px)`,opacity:1,offset:.5},{transform:`translate(${dx*1.3}px,${dy+280}px)`,opacity:0}],{duration:1300+Math.random()*600,easing:'cubic-bezier(.15,.6,.4,1)'}).onfinish=()=>c.remove()}
 setTimeout(()=>revClose(false),1200)}
function revClose(abort){if(!REV.on)return;REV.on=false;if(REV.v){REV.v.dispose();REV.v=null}const o=REV.o;o.style.transition='opacity .3s';o.style.opacity='0';setTimeout(()=>o.remove(),320);REV.busy=0;
 const s=st();if(s.pr&&s.pr.done){/* the present goes: a puff, Santa laughs, back to the game */
  emit(PRES_AT[0],PREST+.5,PRES_AT[1],26,{colors:['#ffffff','#ffd75e',tierCol(s.pr.rar)],speed:3,up:3,size:.16,life:1,grav:5,floor:PREST});PRES.g.visible=false;PRES.on=false;s.pr=null;sv();
  SANTA.busy=0;CINE.view=0;CINE.tx=CINE.tz=0;if(mode_()=='menu')mode='play';laugh(3);bubble('Merry Christmas! Come back with more treats!',3.4);wave(1.6)}
 else{/* closed without claiming: it stays on the rug */PRES.phase='rest';PRES.ready=true;PRES.lid.visible=true;PRES.lid.position.y=.84;PRES.lid.rotation.set(0,0,0);SANTA.busy=0;CINE.view=0;CINE.tx=CINE.tz=0;if(mode_()=='menu')mode='play'}}
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
.lodgebanner{position:fixed;left:50%;top:34%;z-index:96;pointer-events:none;color:var(--c);font:700 clamp(40px,9vw,96px) Silkscreen,ui-monospace,monospace;letter-spacing:6px;text-shadow:5px 5px 0 #000,-4px -4px 0 #000,4px -4px 0 #000,-4px 4px 0 #000,0 0 30px var(--c)}
.lodgecf{position:fixed;z-index:99;width:8px;height:8px;pointer-events:none;will-change:transform,opacity}
#lodgerev{position:fixed;inset:0;z-index:97;display:flex;align-items:center;justify-content:center;background:#000d;font:14px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#e8f3ec;animation:lodgefade .25s ease-out}
@keyframes lodgefade{from{opacity:0}to{opacity:1}}@keyframes lodgepop{from{transform:translateY(14px) scale(.94);opacity:0}to{transform:none;opacity:1}}
#lodgerev .card{position:relative;width:min(500px,94vw);max-height:94vh;overflow:auto;padding:0 0 18px;box-sizing:border-box;text-align:center;background:#0c0c0c;border:3px solid #000;box-shadow:inset 0 0 0 2px var(--rc),0 0 50px -8px var(--rc),6px 6px 0 #000a;animation:lodgepop .3s ease-out}
#lodgerev .card:before{content:'';display:block;height:8px;background:repeating-linear-gradient(135deg,#c0392b 0 8px,#f4f4f4 8px 16px);border-bottom:3px solid #000}
#lodgerev .rib{margin:12px 0 0;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#ffd75e}
#lodgerev .stage{position:relative;margin:10px 14px 6px;height:min(320px,40vh);background:radial-gradient(circle at 50% 70%,color-mix(in srgb,var(--rc) 30%,#000),#000 70%);border:2px solid #000;box-shadow:inset 0 0 0 2px #1a1a1a;overflow:hidden}
#lodgerev .stage canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:none}
#lodgerev .hint{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);padding:3px 8px;background:#000;border:2px solid #26302a;color:#8aa094;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none;white-space:nowrap}
#lodgerev .rarr{display:inline-block;margin:6px 0 8px;padding:3px 12px;background:#000;border:2px solid;font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:3px}
#lodgerev h3{margin:2px 12px 5px;font:700 22px Silkscreen,ui-monospace,monospace;color:#fff}
#lodgerev .cat{display:inline-block;margin-bottom:8px;padding:2px 8px;background:#000;color:#2fe68a;border:2px solid #262626;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px}
#lodgerev p{margin:0 18px 8px;color:#8aa094;font-size:13px;line-height:1.45}
#lodgerev .cl{display:block;margin:10px auto 0;min-width:200px;padding:12px 30px;background:#2fe68a;color:#04120a;border:3px solid #000;box-shadow:inset 0 -4px #0007;font:700 16px Silkscreen,ui-monospace,monospace;letter-spacing:2px;cursor:pointer}
#lodgerev .cl:hover{background:#5cf0a6}#lodgerev .cl:disabled{background:#262626;color:#8aa094;cursor:default}
`;document.head.appendChild(css2);

/* ---------- start-up, save changes, test hook, dev panel ---------- */
let SPAWNED=false,lastS=null,sec1=0;
function sync(){syncSanta(true);const s=st();if(s.pr&&!s.pr.done)placePresent(true,s.pr);else{PRES.on=false;PRES.g.visible=false}}
{const t0=tick;tick=function(dt){if(S!==lastS&&S&&S.day!==undefined){lastS=S;safe(sync,'sync');safe(()=>{if(SPAWNED)spawnSpots()},'respawn')}
 if(!SPAWNED&&CLOCK>1.5&&lastS){SPAWNED=true;safe(spawnSpots,'spawn')}
 sec1-=dt;if(sec1<0){sec1=1;safe(refreshSpots,'refresh')}
 return t0(dt)}}
function testFeed(kind){const s=st();if((s.c[kind]||0)<1)s.c[kind]=1;feed(kind)}
Object.assign(window.FW_LODGE,{icon,newModel,applySanta,SANTA,PRES,ACTIVE:()=>ACTIVE,SPOTS,st,feed,testFeed,talk,openPresent,burp,deflate,setStage,syncSanta,collect,spawnSpots,rollPrize,inside,presentTalk,revOpen,
 give(n){const s=st();s.c.cookie+=n||5;s.c.cane+=n||5;sv();hudSync(1)},
 reset(){const s=st();s.f=0;s.pr=null;s.cd={};abortScene();sync();spawnSpots()},
 go(){P.x=LX;P.z=LZ+HD+4;P.rot=Math.PI},goIn(){P.x=LX+1;P.z=LZ+2.5},
 view:v=>{CINE.view=v},CINE,shake,emit,ring,tween,after,clock:()=>CLOCK});
/* dev panel buttons (same box the advent calendar uses) */
safe(()=>{const box=document.getElementById('fwdvb');if(!box)return;const msg=t=>{const e=document.getElementById('fwdvs');if(e)e.textContent=t};
 const h=document.createElement('h5');h.textContent="Santa's Lodge (cookies and candy canes, feed Santa)";box.appendChild(h);
 [['Walk to the lodge door',()=>{FW_LODGE.go();msg('At the lodge')}],['Give me 5 cookies + 5 candy canes',()=>{FW_LODGE.give(5);msg('Added 5 of each')}],['Respawn all treats on the map',()=>{const s=st();s.cd={};spawnSpots();msg('Treats respawned')}],['Reset Santa and presents',()=>{FW_LODGE.reset();msg('Santa reset')}]]
 .forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;box.appendChild(b)})},'panel');
/*END*/
})();
