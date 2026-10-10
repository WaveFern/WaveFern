/* ---------- Threadz new drop (34 more clothes, some gated by fame level) ----------
   New garments are appended to GAR, so the ids of older items (g0..g44) never change.
   New style numbers (tops 10+, jackets 4+, bottoms 4+, shoes 2+, hats 6+, extras 4+) are drawn here:
   buildChar is given a base style for the shared parts (sleeves, legs) and the rest is added on top. */

/* shared mesh helpers (also used by the studio and clothing detail files). Geometries and materials are cached. */
const XGC={},XMC={};
/* material from a colour string: '#abc' matte, '*abc' unlit/glowing, '!#abc' glossy (lacquer, leather), '~#abc' metal, '^#abc' glass */
function xm(c){if(typeof c!='string')return c;if(c[0]=='*')return MB(c.slice(1));const p=c[0];if(p=='!'||p=='~'||p=='^'){if(XMC[c])return XMC[c];const col=c.slice(1);
 return XMC[c]=p=='^'?new THREE.MeshPhongMaterial({color:col,shininess:90,specular:0xffffff,transparent:true,opacity:.35}):new THREE.MeshPhongMaterial({color:col,shininess:p=='~'?80:45,specular:p=='~'?0xb0b0b0:0x404040})}return M(c)}
function xput(m,g,x,y,z,rx,ry,rz){m.position.set(x,y,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m}
/* box */
function xb(g,w,h,d,c,x,y,z,rx,ry,rz){return xput(new THREE.Mesh(geo(+w.toFixed(4),+h.toFixed(4),+d.toFixed(4)),xm(c)),g,x,y,z,rx,ry,rz)}
/* cylinder (radius top, radius bottom, height), upright unless rotated */
function xc(g,rt,rb,h,c,x,y,z,rx,ry,rz,s){const k='c'+[rt,rb,h,s||10];return xput(new THREE.Mesh(XGC[k]||(XGC[k]=new THREE.CylinderGeometry(rt,rb,h,s||10)),xm(c)),g,x,y,z,rx,ry,rz)}
/* torus ring (radius, tube), lying in the XY plane unless rotated; arc in radians */
function xt(g,r,t,c,x,y,z,rx,ry,rz,arc){const k='t'+[r,t,arc||0];return xput(new THREE.Mesh(XGC[k]||(XGC[k]=new THREE.TorusGeometry(r,t,5,14,arc||Math.PI*2)),xm(c)),g,x,y,z,rx,ry,rz)}
/* sphere */
function xs(g,r,c,x,y,z,s){const k='s'+[r,s||8];return xput(new THREE.Mesh(XGC[k]||(XGC[k]=new THREE.SphereGeometry(r,s||8,Math.max(4,(s||8)*.75|0))),xm(c)),g,x,y,z)}
const xgrp=(g,x,y,z,ry)=>{const o=new THREE.Group();o.position.set(x,y,z);if(ry)o.rotation.y=ry;g.add(o);return o};
/* a trim tone that always shows: darker for light colours, lighter for very dark ones */
const xlum=c=>{const k=new THREE.Color(c);return .3*k.r+.59*k.g+.11*k.b};
const xtone=(c,f)=>xlum(c)<.12?'#'+new THREE.Color(c).lerp(new THREE.Color('#ffffff'),.18*(2-f)).getHexString():dk(c,f);
/* lighten by mixing with white (multiplying past 1 overflows THREE.Color.getHex) */
const xlt=(c,a)=>'#'+new THREE.Color(c).lerp(new THREE.Color('#ffffff'),a).getHexString();
const xcon=c=>xlum(c)>.55?'#1d1d22':'#f4f1e8';

/* ---- the new drop: [name, price, style, default colour, fame tier (index into FTL, optional)] ---- */
const GAR0=GAR.length,gA2=(slot,a)=>{gA(slot,a);if(a[4]!==undefined)GAR[GAR.length-1].ft=a[4]};
[['Button-up Shirt',48,10,'#f4f4f4'],['Graphic Tee',34,11,'#111111'],['Turtleneck',52,12,'#2c3e50'],['Baseball Tee',36,13,'#bdc3c7'],['Flannel Shirt',58,14,'#c0392b',0],['Crop Top',26,15,'#e84393']].forEach(a=>gA2('top',a));
[['Varsity Jacket',140,4,'#800020',0],['Leather Jacket',220,5,'#111111',1],['Windbreaker',75,6,'#1abc9c'],['Blazer',180,7,'#1f3a6e',1],['Sherpa Jacket',125,8,'#8d6e4a',0]].forEach(a=>gA2('jk',a));
[['Ripped Skinny Jeans',62,4,'#3498db'],['Track Pants',42,5,'#111111'],['Cargo Shorts',38,6,'#6b8e5a'],['Pleated Skirt',40,7,'#2c3e50'],['Overalls',70,8,'#2f6fb5',0]].forEach(a=>gA2('bt',a));
[['Slides',22,2,'#111111'],['Platform Sneakers',95,3,'#f4f4f4',0],['Loafers',110,4,'#5a3a22',1],['Basketball Hi-tops',130,5,'#e74c3c',0],['Cowboy Boots',150,6,'#8d6e4a',1],['Canvas Low-tops',35,7,'#2f6fb5']].forEach(a=>gA2('sh',a));
[['Trucker Cap',22,6,'#e67e22'],['Fedora',55,7,'#5a3a22',0],['Pom Beanie',24,8,'#e74c3c'],['Visor',16,9,'#f4f4f4'],['Cowboy Hat',85,10,'#d9c8a0',1],['Flat Cap',32,11,'#7f8c8d']].forEach(a=>gA2('ht',a));
[['Backpack',65,4,'#2c3e50'],['Crossbody Bag',48,5,'#111111'],['Wristwatch',260,6,'#f1c40f',2],['Hoop Earrings',45,7,'#f1c40f'],['Round Glasses',38,8,'#111111'],['Bandana',14,9,'#c0392b']].forEach(a=>gA2('ac',a));
GAR.slice(GAR0).forEach(g=>GM[g.id]=g);

/* fame gates */
const garLv=g=>g&&g.ft>=0?FTL()[g.ft]:0,garLock=g=>!!g&&g.ft>=0&&fameLevel()<garLv(g);
{const bg0=buyG;buyG=function(id){const g=GM[id];if(garLock(g)){snd('err');return say(g.n+' unlocks at Fame Level '+garLv(g)+'.')}return bg0(id)}}

/* the base style each new style borrows from buildChar (sleeves, leg shape, jacket shell) */
const XTOPB={10:8,11:0,12:8,13:8,14:8,15:0},XJKB={4:0,5:0,6:1,7:0,8:0},XBTB={4:0,5:0,6:1,7:1,8:0},XSHB={2:0,3:0,4:0,5:1,6:1,7:0};

/* shoes: equip keeps the base colour entry and remembers the real style in ch.shs */
{const eq1=equip;equip=function(id,col){const r=eq1(id,col),g=GM[id];if(g&&g.slot=='sh'){col=col||g.dc;ch.shs=g.st;if(g.st>=2)ch.sh=SHC.findIndex(x=>x[0]==col&&x[1]==XSHB[g.st]&&x[2]=='Custom')}return r}
 const uq0=unq;unq=function(sl){if(sl=='sh')delete ch.shs;return uq0(sl)}}

/* ---- drawing the new styles on a character ---- */
const XNEW={top:{},jk:{},bt:{},sh:{},ht:{},ac:{}};
/* ctx: {g (torso group), legs, arms, h (head), w, d, sk (skin), c (char)} */
XNEW.top[10]=(x,c)=>{const{g,w,d,arms}=x,t=xtone(c,.82);[-1,1].forEach(s=>xb(g,w*.3,.08,.07,t,s*w*.14,1.1,d/2-.005,0,0,s*.4));xb(g,w*.62,.09,d*.55,t,0,1.12,-d*.2);xb(g,.05,.58,.012,t,0,.8,d/2+.006);
 [1,.86,.72,.58].forEach(y=>xb(g,.035,.035,.012,'#ececec',0,y,d/2+.014));xb(g,.13,.13,.01,t,w*.24,.9,d/2+.006);xb(g,.14,.035,.012,dk(c,.7),w*.24,.97,d/2+.01);if(!x.jk)arms.forEach(a=>xb(a,.18,.06,.23,t,0,-.47,0))};
XNEW.top[11]=(x,c)=>{const{g,w,d}=x,b=xcon(c),z=d/2+.007;xb(g,w*.62,.36,.01,b,0,.82,z);xb(g,w*.62*.8,.15,.012,'#ff8a30',0,.88,z+.002);xb(g,w*.62*.55,.06,.013,'#ffd27a',0,.94,z+.004);
 [.72,.78].forEach((y,i)=>[-1,0,1].forEach(k=>xb(g,w*.15,.03,.014,i?'#1abc9c':'#3498db',k*w*.17+(i?w*.07:0),y,z+.005)));xb(g,w*.42,.05,.02,xtone(c,.8),0,1.08,d/2-.005)};
XNEW.top[12]=(x,c)=>{const{g,w,d}=x,t=xtone(c,.85);xc(g,.15,.16,.16,c,0,1.15,0,0,0,0,12);[1.1,1.15,1.2].forEach(y=>xc(g,.163,.163,.012,t,0,y,0,0,0,0,12));xb(g,w+.012,.06,d+.012,t,0,.53,0)};
XNEW.top[13]=(x,c)=>{const{g,w,d,arms}=x,b=xcon(c)=='#1d1d22'?'#2c3e50':'#f4f1e8',sl=xtone(c,.6);if(!x.jk)arms.forEach(a=>xb(a,.18,.42,.23,sl,0,-.21,0));[-1,1].forEach(s=>xb(g,.05,.34,.012,sl,s*w*.3,.97,d/2+.006,0,0,s*.75));xb(g,w*.42,.05,.02,sl,0,1.085,d/2-.005)};
XNEW.top[14]=(x,c)=>{const{g,w,d,arms}=x,dd=xtone(c,.55),li=xlt(c,.22);[.6,.76,.92].forEach(y=>xb(g,w+.008,.045,d+.008,dd,0,y,0));[.68,.84,1].forEach(y=>xb(g,w+.006,.015,d+.006,li,0,y,0));
 [-1,1].forEach(s=>[1,-1].forEach(f=>xb(g,.045,.6,.008,dd,s*w*.3,.8,f*(d/2+.005))));XNEW.top[10](x,c);if(!x.jk)arms.forEach(a=>[.14,.3].forEach(y=>xb(a,.176,.04,.226,dd,0,-y,0)))};
XNEW.top[15]=(x,c)=>{const{g,w,d,sk}=x;xb(g,w+.004,.13,d+.004,sk,0,.565,0);xb(g,w+.008,.025,d+.008,xtone(c,.8),0,.64,0)};
/* jackets (jacket colour is JKC[c.jk]) */
XNEW.jk[4]=(x,c)=>{const{g,w,d,arms}=x,cr='#efe6d0',t=xtone(c,.7);arms.forEach(a=>{xb(a,.185,.44,.235,cr,0,-.22,0);xb(a,.19,.06,.24,t,0,-.47,0);xb(a,.192,.015,.242,cr,0,-.465,0)});
 xb(g,w+.1,.07,d+.1,t,0,.54,0);xb(g,w+.105,.018,d+.105,cr,0,.55,0);const z=d/2+.055;xb(g,.15,.15,.01,cr,-w*.3,.92,z);xb(g,.03,.1,.012,c,-w*.3-.04,.92,z+.003);xb(g,.03,.1,.012,c,-w*.3+.04,.92,z+.003);xb(g,.1,.03,.012,c,-w*.3,.875,z+.003);
 [.62,.76,.9,1.02].forEach(y=>[-1,1].forEach(s=>xb(g,.03,.03,.012,'~#cfd3d8',s*w*.21,y,z)))};
XNEW.jk[5]=(x,c)=>{const{g,w,d,arms}=x,jm=M(c),lm=xm('!'+c),z=d/2+.05;[g,...arms].forEach(o=>o.traverse(m=>{if(m.material===jm)m.material=lm}));
 [-1,1].forEach(s=>xb(g,.11,.3,.016,'!'+dk(c,.85),s*w*.19,.94,z+.004,0,0,s*.28));xb(g,.018,.5,.01,'~#d0d0d0',w*.2,.78,z+.006);xb(g,.04,.06,.012,'~#d0d0d0',w*.2,1.0,z+.01);
 xb(g,w+.1,.06,d+.1,'!'+dk(c,.8),0,.54,0);xb(g,.07,.06,.012,'~#d0d0d0',-w*.26,.54,d/2+.057);[-1,1].forEach(s=>{xb(g,.14,.014,.01,'~#c0c0c0',s*w*.3,.68,z+.006,0,0,s*.5);xb(g,.15,.025,.06,'!'+c,s*w*.38,1.115,0)})};
XNEW.jk[6]=(x,c)=>{const{g,w,d,arms}=x,b=xcon(c)=='#1d1d22'?'#1f3a6e':'#f4f4f4',z=d/2+.052;xb(g,w*.42,.6,.012,c,0,.8,z);xb(g,w+.09,.14,d+.09,b,0,.98,0);xb(g,.02,.26,.01,'~#d0d0d0',0,.97,z+.008);xb(g,.04,.05,.012,'~#d0d0d0',0,.85,z+.012);
 xb(g,w*.55,.16,.012,xtone(c,.85),0,.65,z+.006);xb(g,w+.1,.035,d+.1,'#e8e8e8',0,.72,0);arms.forEach(a=>{xb(a,.18,.08,.23,b,0,-.12,0);xb(a,.18,.05,.23,xtone(c,.7),0,-.47,0)});[-1,1].forEach(s=>xs(g,.025,'#222',s*w*.3,.5,z+.01,6))};
XNEW.jk[7]=(x,c)=>{const{g,w,d,arms}=x,t=xtone(c,.78),z=d/2+.052;xb(g,w*.42,.28,.012,c,0,.64,z);[-1,1].forEach(s=>{xb(g,.09,.32,.012,t,s*w*.15,.94,z+.004,0,0,-s*.3);xb(g,.17,.02,.012,t,s*w*.29,.66,z+.002);xb(g,.17,.04,d*.6,c,s*w*.4,1.115,0)});
 [.72,.6].forEach(y=>xb(g,.035,.035,.012,'#1a1a1a',0,y,z+.006));xb(g,.05,.2,.01,'#8a1c2a',0,.9,z+.002);xb(g,.065,.05,.014,'#6e1622',0,1.0,z+.004);xb(g,.09,.035,.012,'#f4f4f4',w*.3,.95,z+.004);arms.forEach(a=>[.38,.42].forEach(y=>xb(a,.02,.02,.012,'#1a1a1a',0,-y,.117)))};
XNEW.jk[8]=(x,c)=>{const{g,w,d,arms}=x,cr='#efe6d0',z=d/2+.05;[-1,1].forEach(s=>xb(g,.12,.36,.02,cr,s*w*.2,.92,z+.004,0,0,s*.15));xb(g,w*.75,.13,d*.5,cr,0,1.12,-d*.22);xb(g,w+.1,.06,d+.1,cr,0,.53,0);
 arms.forEach(a=>xb(a,.2,.08,.25,cr,0,-.46,0));[.62,.76,.9].forEach(y=>xs(g,.022,'#5a3a22',w*.2,y,z+.01,6));[-1,1].forEach(s=>{xb(g,.16,.12,.012,xtone(c,.85),s*w*.3,.86,z+.002);xb(g,.17,.04,.014,xtone(c,.7),s*w*.3,.93,z+.004)})};
/* bottoms: drawn on each leg pivot (s is -1 left, 1 right) and on the torso */
const legEach=(x,f)=>x.legs.forEach((l,i)=>f(l,i?1:-1));
XNEW.bt[4]=(x,c)=>{const{w,d,sk}=x,z=d*.4+.006;legEach(x,(l,s)=>{xb(l,w*.22,.05,.01,sk,s*.01,-.24,z);[-.215,-.265].forEach(y=>xb(l,w*.26,.012,.012,'#e8eef5',s*.01,y,z+.001));xb(l,w*.12,.03,.01,sk,-s*.03,-.1,z);xb(l,.006,.4,.02,'#d9a441',s*(w*.21+.004),-.21,0)})};
XNEW.bt[5]=(x,c)=>{const{g,w,d}=x;legEach(x,(l,s)=>{[-.02,.02].forEach(o=>xb(l,.008,.42,.022,'#f4f4f4',s*(w*.21+.005),-.21,o));xb(l,w*.44,.05,d*.82,xtone(c,.7),0,-.4,0)});[-1,1].forEach(s=>xb(g,.015,.09,.01,'#f4f4f4',s*.035,.46,d*.4+.02))};
XNEW.bt[6]=(x,c)=>{const{w,d}=x;legEach(x,(l,s)=>{xb(l,.014,.12,.13,xtone(c,.85),s*(w*.21+.007),-.15,0);xb(l,.018,.035,.14,xtone(c,.7),s*(w*.21+.009),-.085,0);xb(l,.02,.02,.02,'#d9c8a0',s*(w*.21+.012),-.1,0)})};
XNEW.bt[7]=(x,c)=>{const{g,w,d}=x,t=xtone(c,.72);xb(g,w+.15,.26,d+.12,c,0,.41,0);xb(g,w+.16,.045,d+.13,t,0,.53,0);for(let i=0;i<7;i++){const px=-w*.45+i*w*.15;[1,-1].forEach(f=>xb(g,.02,.24,.01,t,px,.4,f*(d/2+.062)))}[-1,1].forEach(s=>xb(g,.01,.24,.02,t,s*(w/2+.075),.4,0))};
XNEW.bt[8]=(x,c)=>{const{g,w,d}=x,t=xtone(c,.82),z=d/2+.007;xb(g,w+.01,.12,d+.01,c,0,.55,0);xb(g,w*.55,.34,.014,c,0,.72,z);xb(g,w*.25,.12,.01,t,0,.74,z+.009);[-1,1].forEach(s=>{xb(g,.06,.12,.014,c,s*w*.22,.94,z);xb(g,.06,.016,d+.02,c,s*w*.22,1.106,0);xb(g,.06,.5,.014,c,s*w*.22,.85,-z);xb(g,.075,.05,.02,'~#e6b422',s*w*.22,.88,z+.01);xs(g,.02,'~#c0c0c0',s*(w/2+.006),.6,0,6)})};
/* shoes replace the plain base shoe: sw/sd are the shoe width and length, z0 its centre, all in the leg pivot */
const shoeDims=x=>({sw:x.w*.44,sd:x.d*.8+.12,z0:.05});
XNEW.sh[2]=(x,c)=>{const{sw,sd,z0}=shoeDims(x);legEach(x,l=>{xb(l,sw,.035,sd,'#e8e0d0',0,-.482,z0);xb(l,sw+.01,.02,sd+.01,xtone(c,.6),0,-.495,z0);xb(l,sw*.8,.05,sd*.82,x.sk,0,-.44,z0);xb(l,sw+.012,.06,sd*.42,c,0,-.43,z0+sd*.12);xb(l,sw*.5,.012,.03,'#f4f4f4',0,-.398,z0+sd*.12)})};
XNEW.sh[3]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),b=xcon(c);legEach(x,l=>{xb(l,sw+.02,.1,sd+.02,'#f4f4f4',0,-.45,z0);xb(l,sw+.025,.02,sd+.025,b,0,-.46,z0);xb(l,sw,.1,sd*.95,c,0,-.36,z0-.01);xb(l,sw*.9,.07,.08,c,0,-.37,z0+sd/2-.03);[0,1,2].forEach(i=>xb(l,sw*.6,.012,.02,'#f4f4f4',0,-.305,z0+.02+i*.05))})};
XNEW.sh[4]=(x,c)=>{const{sw,sd,z0}=shoeDims(x);legEach(x,l=>{xb(l,sw,.03,sd,'#2a1a10',0,-.485,z0);xb(l,sw*.95,.07,sd*.92,'!'+c,0,-.44,z0);xb(l,sw*.96,.02,.06,'!'+dk(c,.7),0,-.405,z0+sd*.2);xb(l,.04,.012,.03,'~#c9a227',0,-.395,z0+sd*.2);xb(l,sw*.9,.035,.1,'#2a1a10',0,-.49,z0-sd/2+.06)})};
XNEW.sh[5]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),t=xtone(c,.7);legEach(x,(l,s)=>{xb(l,sw+.01,.06,sd+.01,'#f4f4f4',0,-.47,z0);xb(l,sw,.12,sd,c,0,-.38,z0);xb(l,sw*.98,.16,sd*.7,c,0,-.25,z0-.04);xb(l,sw+.012,.04,sd*.72,t,0,-.25,z0-.04);
 [-1,1].forEach(k=>xb(l,.006,.03,sd*.55,'#f4f4f4',k*(sw/2+.004),-.37,z0,.25));[0,1,2,3].forEach(i=>xb(l,sw*.55,.012,.02,'#f4f4f4',0,-.31+i*.03,z0+sd*.3-i*.04));xb(l,sw*.92,.06,.07,'#f4f4f4',0,-.42,z0+sd/2-.03)})};
XNEW.sh[6]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),t=xlt(c,.22);legEach(x,l=>{xb(l,sw*.98,.32,sd*.62,c,0,-.3,z0-.07);xb(l,sw*.95,.1,sd,c,0,-.44,z0+.02);xb(l,sw*.55,.07,.09,c,0,-.455,z0+sd/2+.05);xb(l,sw*.7,.08,.1,dk(c,.55),0,-.47,z0-sd/2+.08);
 xb(l,.02,.16,.01,t,0,-.27,z0-.07+sd*.31+.003,0,0,.35);xb(l,.02,.16,.01,t,0,-.27,z0-.07+sd*.31+.003,0,0,-.35);xb(l,sw,.03,sd*.64,dk(c,.75),0,-.15,z0-.07)})};
XNEW.sh[7]=(x,c)=>{const{sw,sd,z0}=shoeDims(x);legEach(x,l=>{xb(l,sw+.01,.05,sd+.01,'#f4f4f4',0,-.475,z0);xb(l,sw+.015,.012,sd+.015,'#c0392b',0,-.47,z0);xb(l,sw,.07,sd*.95,c,0,-.415,z0-.01);xb(l,sw*.92,.05,.07,'#f4f4f4',0,-.43,z0+sd/2-.03);[0,1,2].forEach(i=>xb(l,sw*.6,.012,.02,'#f4f4f4',0,-.375,z0+.03+i*.045));xb(l,.05,.04,.01,'#f4f4f4',0,-.42,z0-sd/2+.03)})};
/* hats (head pivot; head is a .55 cube, top at y .275, face at z .275) */
XNEW.ht[6]=(x,c)=>{const{h}=x;xb(h,.62,.18,.62,c,0,.37,0);xb(h,.6,.17,.04,'#f4f4f4',0,.375,.31);xb(h,.18,.08,.01,c,0,.39,.335);xb(h,.62,.035,.32,c,0,.29,.43);xb(h,.06,.03,.06,c,0,.475,0);
 for(let i=0;i<4;i++)for(let j=0;j<2;j++)xb(h,.08,.05,.01,dk(c,.55),-.21+i*.14,.33+j*.08,-.315)};
XNEW.ht[7]=(x,c)=>{const{h}=x;xc(h,.24,.29,.22,c,0,.42,0,0,0,0,12);xb(h,.28,.03,.3,dk(c,.8),0,.525,0);xc(h,.5,.5,.03,c,0,.31,0,0,0,0,14);xc(h,.295,.295,.05,'#1a1a1a',0,.35,0,0,0,0,12);xb(h,.03,.12,.02,'#c0392b',.24,.4,.12,0,0,.4)};
XNEW.ht[8]=(x,c)=>{const{h}=x,t=xtone(c,.8);xb(h,.62,.24,.62,c,0,.38,0);xb(h,.66,.1,.66,t,0,.27,0);for(let i=0;i<6;i++)xb(h,.02,.1,.665,dk(t,.8),-.25+i*.1,.27,0);xs(h,.11,xlt(c,.3),0,.56,0);xb(h,.12,.06,.01,'#f4f4f4',0,.27,.335)};
XNEW.ht[9]=(x,c)=>{const{h}=x;xb(h,.6,.08,.6,c,0,.24,0);xb(h,.58,.03,.32,c,0,.21,.43);xb(h,.6,.02,.6,xtone(c,.7),0,.2,0)};
XNEW.ht[10]=(x,c)=>{const{h}=x;xb(h,.48,.24,.52,c,0,.44,0);xb(h,.14,.04,.4,dk(c,.85),0,.565,0);xb(h,1.05,.03,.85,c,0,.31,0);[-1,1].forEach(s=>xb(h,.14,.1,.85,c,s*.58,.35,0,0,0,s*.6));xb(h,.49,.05,.53,'#5a3a22',0,.34,0);xb(h,.06,.06,.01,'~#d0d0d0',0,.34,.27)};
XNEW.ht[11]=(x,c)=>{const{h}=x;xb(h,.62,.12,.66,c,0,.35,.02);xb(h,.6,.06,.22,c,0,.34,.3,.3,0,0);xb(h,.56,.025,.12,dk(c,.85),0,.295,.4);xb(h,.06,.03,.06,dk(c,.8),0,.42,.02);for(let i=0;i<5;i++)xb(h,.62,.008,.01,dk(c,.8),0,.32+i*.02,-.335)};
/* extras */
XNEW.ac[4]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2,t=xtone(c,.7);xb(g,w*.75,.5,.2,c,0,.82,-d/2-.1);xb(g,w*.55,.2,.06,xtone(c,.85),0,.68,-d/2-.22);xb(g,w*.5,.012,.01,'~#c0c0c0',0,.79,-d/2-.252);xb(g,.12,.04,.04,t,0,1.08,-d/2-.1);
 [-1,1].forEach(s=>{xb(g,.07,.016,d+.05,t,s*w*.25,1.11,-.015);xb(g,.07,.42,.012,t,s*w*.25,.88,d/2+.008);xb(g,.06,.04,.016,'#222',s*w*.25,.84,d/2+.016)})};
XNEW.ac[5]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2,L=Math.hypot(w,.62)+.05,a=Math.atan2(w,.62);xb(g,.05,L,.012,xtone(c,.8),0,.8,d/2+.008,0,0,a);xb(g,.05,L,.012,xtone(c,.8),0,.8,-d/2-.008,0,0,-a);
 const p=xgrp(g,w/2+.06,.5,.05);xb(p,.08,.18,.22,c,0,0,0);xb(p,.09,.08,.23,xtone(c,.75),0,.06,0);xb(p,.095,.03,.04,'~#d0d0d0',0,.03,.0)};
XNEW.ac[6]=(x,c)=>{const a=x.arms[0];xb(a,.186,.045,.236,'#1a1a1a',0,-.43,0);xb(a,.03,.08,.1,'~'+c,-.095,-.43,0);xb(a,.006,.06,.075,'#f4f4f4',-.112,-.43,0);xb(a,.004,.03,.006,'#111',-.116,-.42,0)};
XNEW.ac[7]=(x,c)=>{const{h}=x;[-1,1].forEach(s=>xt(h,.05,.012,'~'+c,s*.31,-.1,0,0,Math.PI/2,0))};
XNEW.ac[8]=(x,c)=>{const{h}=x;[-1,1].forEach(s=>{xt(h,.075,.014,c,s*.13,.04,.3);xb(h,.12,.12,.006,'^#cfe8ff',s*.13,.04,.296);xb(h,.014,.014,.3,c,s*.285,.06,.15)});xb(h,.07,.014,.014,c,0,.06,.3)};
XNEW.ac[9]=(x,c)=>{const{g,w}=x,d=x.d+x.o*2;xb(g,w*.62,.06,d*.75,c,0,1.09,0);xb(g,.22,.22,.012,c,0,.99,d/2+.012,0,0,Math.PI/4);[[-.04,1.02],[.05,.98],[0,.92],[-.05,.95]].forEach(([px,py])=>xb(g,.025,.025,.014,'#f4f4f4',px,py,d/2+.016))};

/* the wrapper: swap new styles for their base before the original builder runs, then draw the new parts */
const xHead=g=>g.children.find(o=>o.isGroup&&Math.abs(o.position.y-1.4)<1e-6&&o.position.x===0);
{const bc0=buildChar;buildChar=function(c){
 const sv={top:c.top,jks:c.jks,bt:c.bt,ht:c.ht,ac:c.ac},T=c.top,J=c.jk>=0?c.jks:undefined,Bt=c.bt,Sh=c.shs,Ht=c.ht>=0?c.hts:undefined,Ac=c.ac;
 const nT=XNEW.top[T],nJ=J!==undefined&&XNEW.jk[J],nB=XNEW.bt[Bt],nS=c.sh>=0&&XNEW.sh[Sh],nH=Ht!==undefined&&XNEW.ht[Ht],nA=c.ac>=0&&XNEW.ac[Ac];
 if(nT)c.top=XTOPB[T];if(nJ)c.jks=XJKB[J];if(nB)c.bt=XBTB[Bt];if(nH)c.ht=-1;if(nA)c.ac=-1;
 let r;try{r=bc0(c)}finally{Object.assign(c,sv);['top','jks','bt','ht','ac'].forEach(k=>{if(sv[k]===undefined)delete c[k]})}
 if(!(nT||nJ||nB||nS||nH||nA))return r;
 try{const x={g:r.g,legs:r.legs,arms:r.arms,h:xHead(r.g),w:.42+c.body*.5,d:.3+c.body*.28,sk:SKIN[c.skin],c,jk:c.jk>=0,o:c.jk>=0?.045:0};
  if(nT)nT(x,c.tc_custom||TOPC[c.tc]||'#888888');if(nB)nB(x,c.pc_custom||PANTC[c.pc]||'#888888');if(nJ)nJ(x,JKC[c.jk]||'#888888');
  if(nS){r.legs.forEach(l=>l.remove(l.children[l.children.length-1]));nS(x,(SHC[c.sh]||['#222222'])[0])}
  if(nH&&x.h)nH(x,(HTC[c.ht]||['#888888'])[0]);if(nA)nA(x,c.acc||'#222222')}catch(e){console.warn('clothes',e)}
 return r}}

/* ---- shop and wardrobe previews for the new styles (box lists, same frame as clb) ---- */
{const clb0=clb;clb=function(k){const[id,col]=String(k).split('|'),g=GM[id];if(!g||GAR.indexOf(g)<GAR0)return clb0(k);try{const L=xclb(g,col||g.dc);if(L&&L.length)return L}catch(e){}return clb0(k)}}
function xclb(g,c){const d=dk(c,.8),t=xtone(c,.75),sk=SKIN[2],st=g.st,a=[],P=(...q)=>a.push(q);
 if(g.slot=='top'){const lng=[10,12,13,14].includes(st),sl=lng?.8:.3;P(.9,st==15?.45:.7,.5,c,0,st==15?.62:.5,0);[-1,1].forEach(s=>P(.22,sl,.3,st==13?xtone(c,.6):c,s*.58,.8-sl/2,0));
  if(st==10||st==14){P(.2,.08,.16,t,-.12,.88,.2);P(.2,.08,.16,t,.12,.88,.2);P(.06,.66,.02,t,0,.5,.26);[.7,.5,.3].forEach(y=>P(.04,.04,.02,'#ececec',0,y,.27));P(.18,.18,.02,t,.24,.62,.26)}
  if(st==14){[.25,.5,.72].forEach(y=>P(.92,.05,.52,xtone(c,.55),0,y,0));[-.27,.27].forEach(x=>P(.05,.7,.52,xtone(c,.55),x,.5,0))}
  if(st==11){const b=xcon(c);P(.56,.4,.02,b,0,.5,.26);P(.44,.16,.02,'#ff8a30',0,.56,.27);P(.3,.06,.02,'#ffd27a',0,.63,.275);P(.5,.04,.02,'#3498db',0,.4,.27);P(.5,.04,.02,'#1abc9c',0,.34,.27)}
  if(st==12){P(.42,.22,.42,c,0,.95,0);P(.44,.03,.44,t,0,.9,0);P(.44,.03,.44,t,0,1,0)}
  if(st==13)P(.4,.06,.04,xtone(c,.6),0,.84,.24);if(st==15)P(.86,.25,.46,sk,0,.27,0);return a}
 if(g.slot=='jk'){P(.95,.75,.55,c,0,.5,0);[-1,1].forEach(s=>P(.24,.7,.35,st==4?'#efe6d0':c,s*.62,.5,0));if(st!=6)P(.35,.7,.02,'#f4f4f4',0,.5,.29);P(.6,.2,.3,d,0,.9,-.25);
  if(st==4){P(.97,.08,.57,t,0,.16,0);P(.16,.16,.02,'#efe6d0',-.27,.66,.3)}if(st==5){P(.12,.4,.03,dk(c,.85),-.2,.62,.3);P(.12,.4,.03,dk(c,.85),.2,.62,.3);P(.02,.6,.02,'#d0d0d0',.18,.48,.31);P(.97,.07,.57,dk(c,.8),0,.17,0)}
  if(st==6){P(.97,.18,.57,xcon(c)=='#1d1d22'?'#1f3a6e':'#f4f4f4',0,.7,0);P(.7,.3,.3,d,0,.95,-.3);P(.02,.3,.02,'#d0d0d0',0,.7,.29)}
  if(st==7){P(.1,.4,.03,t,-.13,.62,.3);P(.1,.4,.03,t,.13,.62,.3);P(.05,.05,.03,'#1a1a1a',0,.3,.3);P(.06,.25,.02,'#8a1c2a',0,.55,.3);P(.1,.04,.02,'#f4f4f4',.3,.7,.3)}
  if(st==8){P(.14,.5,.04,'#efe6d0',-.2,.6,.3);P(.14,.5,.04,'#efe6d0',.2,.6,.3);P(.97,.08,.57,'#efe6d0',0,.16,0)}return a}
 if(g.slot=='bt'){if(st==6||st==7){[-1,1].forEach(s=>{P(.4,.45,.4,c,s*.25,.75,0);P(.3,.4,.3,sk,s*.25,.3,0)});if(st==6)[-1,1].forEach(s=>{P(.03,.18,.2,t,s*.46,.7,0);P(.04,.05,.22,d,s*.47,.8,0)});if(st==7){P(1,.5,.55,c,0,.75,0);for(let i=0;i<6;i++)P(.03,.48,.02,t,-.4+i*.16,.74,.28)}return a}
  [-1,1].forEach(s=>P(.4,.9,.4,c,s*.25,.45,0));if(st==4)[-1,1].forEach(s=>{P(.2,.08,.02,sk,s*.25,.45,.21);P(.24,.02,.02,'#e8eef5',s*.25,.5,.215)});
  if(st==5)[-1,1].forEach(s=>{P(.02,.9,.04,'#f4f4f4',s*.455,.45,.04);P(.02,.9,.04,'#f4f4f4',s*.455,.45,-.04);P(.42,.06,.42,t,s*.25,.03,0)});
  if(st==8){P(.5,.45,.06,c,0,1.12,.12);P(.07,.25,.04,c,-.18,1.4,.12);P(.07,.25,.04,c,.18,1.4,.12);P(.09,.06,.06,'#e6b422',-.18,1.3,.15);P(.09,.06,.06,'#e6b422',.18,1.3,.15);P(.22,.14,.02,t,0,1.14,.16)}return a}
 if(g.slot=='sh'){[-1,1].forEach(s=>{const x=s*.25;if(st==2){P(.42,.05,.67,'#e8e0d0',x,.03,.05);P(.44,.08,.3,c,x,.09,.12)}else if(st==3){P(.44,.16,.69,'#f4f4f4',x,.08,.05);P(.42,.18,.62,c,x,.25,.03)}else if(st==4){P(.4,.05,.65,'#2a1a10',x,.03,.05);P(.38,.14,.6,c,x,.12,.05);P(.38,.03,.12,dk(c,.7),x,.2,.18)}
  else if(st==5){P(.42,.08,.67,'#f4f4f4',x,.04,.05);P(.4,.5,.6,c,x,.33,.03);P(.41,.06,.45,t,x,.5,-.03);P(.02,.06,.3,'#f4f4f4',x+s*.205,.25,.05)}else if(st==6){P(.38,.55,.4,c,x,.4,-.06);P(.38,.18,.65,c,x,.1,.05);P(.22,.12,.12,c,x,.08,.42);P(.3,.12,.14,dk(c,.55),x,.06,-.24)}
  else{P(.42,.06,.67,'#f4f4f4',x,.03,.05);P(.4,.14,.62,c,x,.13,.04);P(.38,.1,.1,'#f4f4f4',x,.08,.36)}});return a}
 if(g.slot=='ht'){if(st==6){P(.9,.3,.9,c,0,.3,0);P(.86,.28,.06,'#f4f4f4',0,.3,.45);P(.9,.06,.5,c,0,.15,.6)}else if(st==7){P(.75,.3,.75,c,0,.35,0);P(1.4,.05,1.4,c,0,.15,0);P(.77,.08,.77,'#1a1a1a',0,.24,0)}else if(st==8){P(.9,.4,.9,c,0,.3,0);P(.95,.14,.95,t,0,.1,0);P(.3,.3,.3,xlt(c,.3),0,.62,0)}
  else if(st==9){P(.9,.12,.9,c,0,.1,0);P(.9,.05,.5,c,0,.06,.6)}else if(st==10){P(.7,.4,.75,c,0,.38,0);P(1.6,.05,1.3,c,0,.15,0);P(.72,.08,.77,'#5a3a22',0,.22,0)}else{P(.9,.2,.95,c,0,.2,0);P(.85,.06,.3,dk(c,.85),0,.12,.55)}return a}
 if(st==4){P(.7,.8,.3,c,0,.5,0);P(.5,.35,.1,t,0,.3,.2)}else if(st==5){P(.06,1,.04,t,0,.6,0,0);P(.4,.3,.15,c,0,.1,0)}else if(st==6){P(.5,.12,.5,'#1a1a1a',0,.2,0);P(.3,.1,.3,c,0,.27,0);P(.22,.02,.22,'#f4f4f4',0,.33,0)}
 else if(st==7){P(.08,.4,.08,c,-.35,.3,0);P(.08,.4,.08,c,.35,.3,0);P(.3,.08,.08,c,-.35,.12,0);P(.3,.08,.08,c,.35,.12,0)}else if(st==8){P(.3,.3,.04,c,-.22,.4,0);P(.3,.3,.04,c,.22,.4,0);P(.2,.2,.05,'#cfe8ff',-.22,.4,0);P(.2,.2,.05,'#cfe8ff',.22,.4,0);P(.15,.05,.04,c,0,.45,0)}
 else{P(.9,.08,.12,c,0,.7,0);P(.5,.5,.06,c,0,.35,.05)}return a}

/* ---- Threadz shop: same layout as before, plus fame-level locks and a NEW tag on the drop ---- */
PA.clothes=()=>{const L=GAR.filter(g=>g.slot==CLT),nm=GAR.length,lv=fameLevel();return`<div class=thz><div class=hero><b>NEW DROP · ${nm} STYLES</b><span>${GAR.length-GAR0} fresh pieces just landed. Every piece comes in ${CPAL.length} colours. Choose yours, then buy. Some premium pieces unlock as your fame grows (you are Fame Level ${lv}).</span></div><div class=thh>${WSL2.map(t=>`<button class="${CLT==t[0]?'go':''}" onclick="CLT='${t[0]}';pcR()">${t[1]}</button>`).join('')}<span style="margin-left:auto">Balance <b>${$$(S.money)}</b></span></div><div class=thg>${L.map(g=>{const col=THC[g.id]||(S.wc||{})[g.id]||g.dc,own=S.wr.includes(g.id),lk=!own&&garLock(g),nw=GAR.indexOf(g)>=GAR0;return`<div class=thc2 ${lk?'style="opacity:.78"':''}><div class=thp style="--pvb:transparent">${isoP('k',g.id+'|'+col)}</div><div class=thn>${esc(g.n)}${nw?' <small class=thnew>NEW</small>':''}</div><div class=thr>${$$(g.p)}${g.ft>=0?` <small class=thlv>Fame Lv ${garLv(g)}</small>`:''}</div><div class=thsw>${CPAL.map(c=>`<i class="${c==col?'on':''}" style="background:${c}" onclick="THC['${g.id}']='${c}';pcR()"></i>`).join('')}</div>${own?`<button onclick="wearG('${g.id}','${col}');say('Wearing ${esc(g.n)}');pcR()">Owned · Wear this colour</button>`:lk?`<button disabled>🔒 Unlocks at Fame Level ${garLv(g)}</button>`:`<button class=go ${S.money<g.p?'disabled':''} onclick="buyG('${g.id}')">Buy</button>`}</div>`}).join('')}</div></div>`};
{const st=document.createElement('style');st.textContent='.thnew{background:#ff3d81;color:#fff;padding:1px 5px;font-size:10px;border-radius:3px;vertical-align:middle}.thlv{color:#8a5a00;font-size:11px;margin-left:4px}';document.head.appendChild(st)}
