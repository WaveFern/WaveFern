/* ---------- v49.71.0: Founder rewards ----------
   For everyone who played before the fresh start (see 12-reset.js). They can never be earned again: they are not sold anywhere,
   nothing in the game hands them out, and a career started after the cutover gets none. All of it is cosmetic.
   What a Founder has:
   1. The Founder mark: a small pixel emblem with a slow sheen, next to the name on the WaveFern artist page, in the pause menu,
      on the title screen and career select, in band panels and in band chat.
   2. The Founder title ("Founder", with the day they reached before the reset).
   3. The Founder Bomber: an ink-black jacket with a green foil fern on the back and a foil mark on the chest. The foil glows slowly.
   4. The Founder Cap: matching cap with the mark on the front.
   5. The Founder plaque and the Day One light: two studio pieces for the house (they arrive in Storage).
   Founder status is S.fdr on the career (set when the character is confirmed, from the Legacy store). Pieces are granted once each
   (S.fdr.g) so a Founder who sells or stores one does not get it again. A career without S.fdr has them taken out again. */
(function(){
if(typeof S!='object'||typeof GAR=='undefined'||typeof XNEW=='undefined'||typeof gA3!='function'||typeof F=='undefined')return;
const INK='#0b0f0d',INK2='#101814',FG='#2fe68a',FL='#7dffb8',FD='#14301a',STEEL='#8a948f';

/* ---- the mark: 13 x 13 pixels. # border, d fill, + frond ---- */
const MARK=[
 '  #########  ',
 ' #ddddddddd# ',
 '#ddddd+ddddd#',
 '#dddd+++dddd#',
 '#ddd++d++ddd#',
 '#dd+dd+dd+dd#',
 '#ddd+d+d+ddd#',
 '#dd++d+d++dd#',
 '#ddd+d+d+ddd#',
 '#dddd+++dddd#',
 '#ddddd+ddddd#',
 ' #ddddddddd# ',
 '  #########  '];
const MC={'#':FG,d:FD,'+':FL};
const fdMark=(px,cls)=>{const n=MARK.length;let r='';MARK.forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=MC[row[x]];if(c)r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`}});
 return `<span class="fdm${cls?' '+cls:''}" style="width:${px}px;height:${px}px" title="Founder"><svg viewBox="0 0 ${n} ${n}" width="${px}" height="${px}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg></span>`};
window.fdMark=fdMark;
const fdChip=()=>{const f=S.fdr;return `<span class=fdc>${fdMark(14)}<b>Founder</b>${f&&f.d?`<small>Day ${f.d|0} before the fresh start</small>`:''}</span>`};
const css=document.createElement('style');css.textContent=`
.fdm{display:inline-block;vertical-align:-2px;margin:0 4px;position:relative;overflow:hidden;line-height:0;flex:none}
.fdm svg{display:block}
.fdm::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.55) 50%,transparent 60%);transform:translateX(-120%);animation:fdsheen 7s ease-in-out infinite}
@keyframes fdsheen{0%,72%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.fdc{display:inline-flex;align-items:center;gap:6px;margin:6px 0 2px;padding:3px 9px 3px 5px;border:2px solid #2fe68a66;background:#0b0f0d;box-shadow:inset 0 0 0 1px #14301a}
.fdc .fdm{margin:0}
.fdc b{font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#2fe68a;text-transform:uppercase}
.fdc small{font-size:11px;color:#9bb0a4}
.fdmini{display:inline-flex;align-items:center}
@media (prefers-reduced-motion:reduce){.fdm::after{animation:none;opacity:0}}`;
document.head.appendChild(css);

/* ---- the foil: one shared material that breathes, so every Founder piece glows together ---- */
const FOIL=new THREE.MeshPhongMaterial({color:0x2fe68a,emissive:0x0d6a3a,emissiveIntensity:.5,shininess:95,specular:0xbfffe0}),
 GLOW=new THREE.MeshBasicMaterial({color:0x2fe68a});
const c1=new THREE.Color(0x2fe68a),c2=new THREE.Color(0x9dffcf);
let ft=0;const tick=t=>{requestAnimationFrame(tick);if(document.hidden)return;ft=t/1000;FOIL.emissiveIntensity=.42+.3*(.5+.5*Math.sin(ft*1.1));GLOW.color.copy(c1).lerp(c2,.5+.5*Math.sin(ft*1.1+.6))};
requestAnimationFrame(tick);

/* ---- the mark as small boxes on cloth: g is the group, (x,y) the centre on the surface at depth z, s the box size ---- */
const stamp=(g,x,y,z,s,flip)=>{MARK.forEach((row,j)=>{let i=0;while(i<row.length){const ch=row[i];if(ch==' '){i++;continue}let e=i;while(e+1<row.length&&row[e+1]==ch)e++;
  const k=ch=='#'?FOIL:ch=='+'?'*#9dffcf':'#0c1d12',n=e-i+1,cx=(i+e)/2-6;xb(g,s*n,s,s*.5,k,x+cx*s*(flip?-1:1),y-(j-6)*s,z);i=e+1}})};
/* a fern frond made of leaflet pairs along a spine: n pairs, from the bottom (0,0) up, len = bottom leaflet length */
const frond=(g,x,y,z,hgt,n,len,th,mat,flip)=>{xb(g,th,hgt,th,mat,x,y+hgt/2,z);
 for(let i=0;i<n;i++){const f=i/(n-1||1),ly=y+hgt*.14+f*hgt*.8,l=len*(1-f*.72);[-1,1].forEach(s=>xb(g,l,th*.9,th,mat,x+s*(l/2*.88+.004),ly+l*.2,z,0,0,s*(.5+f*.1)))}
 xb(g,th*1.4,th*1.8,th,mat,x,y+hgt+th,z)};

/* ---- 3. the Founder Bomber (jacket) ---- */
const GI=GAR.length;
gA3('jk',['Founder Bomber',0,1000,'#2f2f38',,'stage']);
gA3('ht',['Founder Cap',0,1001,'#2f2f38',,'stage']);
const GJ=GAR[GI],GH=GAR[GI+1];GJ.fdr=GH.fdr=1;GJ.dc=GH.dc='#2f2f38';
Object.assign(XJKB,{1000:0});
XNEW.jk[1000]=(x,c)=>{const{g,w,d,arms}=x,jm=M(c),lm=xm('!'+INK2),z=d/2+.052,zb=-(d/2+.052),rib='#0e2417';
 [g,...arms].forEach(o=>o.traverse(m=>{if(m.material===jm)m.material=lm}));
 /* hem, collar and cuffs in ribbed dark green, each with a foil line */
 xb(g,w+.1,.065,d+.1,rib,0,.54,0);xb(g,w+.104,.012,d+.104,FOIL,0,.575,0);xb(g,w+.104,.012,d+.104,FOIL,0,.56,0);
 xb(g,w*.78,.09,d*.62,rib,0,1.13,-.012);xb(g,w*.78,.012,d*.62+.004,FOIL,0,1.172,-.012);
 arms.forEach(a=>{xb(a,.2,.085,.25,rib,0,-.455,0);xb(a,.204,.012,.254,FOIL,0,-.41,0);xb(a,.204,.012,.254,FOIL,0,-.43,0)});
 /* zip, with a steel pull; welt pockets */
 xb(g,.018,.5,.01,'~'+STEEL,0,.83,z+.004);xb(g,.04,.05,.012,'~'+STEEL,0,.99,z+.008);
 [-1,1].forEach(s=>xb(g,.15,.014,.012,'#06100b',s*w*.27,.71,z+.002,0,0,-s*.18));
 /* the mark on the chest, small */
 stamp(g,w*.24,.99,z+.008,.0145);
 /* a fern in foil across the back */
 frond(g,0,.6,zb-.006,.5,7,.15,.012,FOIL);
 xb(g,w*.5,.012,.01,FOIL,0,.585,zb-.006)};
/* ---- 4. the Founder Cap ---- */
XNEW.ht[1001]=(x,c)=>{const{h}=x,rib='#0e2417';
 xb(h,.66,.16,.66,INK2,0,.37,0);xb(h,.62,.06,.62,INK2,0,.45,-.01);xb(h,.68,.05,.68,rib,0,.285,0);xb(h,.684,.01,.684,FOIL,0,.31,0);
 xb(h,.56,.028,.3,INK2,0,.275,.46,.16,0,0);xb(h,.56,.01,.012,FOIL,0,.255,.605,.16,0,0);
 xb(h,.05,.03,.05,FOIL,0,.485,-.01);
 stamp(h,0,.375,.335,.02)};
/* the shop never lists them, and only a Founder keeps them */
const hide=fn=>{if(typeof fn!='function')return fn;return function(){const k=[];for(let i=GAR.length-1;i>=0;i--)if(GAR[i].fdr)k.unshift(GAR.splice(i,1)[0]);try{return fn.apply(this,arguments)}finally{k.forEach(g=>GAR.push(g))}}};
if(typeof PA=='object'&&PA&&PA.clothes)PA.clothes=hide(PA.clothes);

/* ---- 5. studio pieces ---- */
const mat=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,shininess:40},o||{}));
const bx=(g,w,h,d,m,x,y,z,rx,ry,rz)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof m=='string'?mat(m):m);o.position.set(x,y,z);if(rx||ry||rz)o.rotation.set(rx||0,ry||0,rz||0);g.add(o);return o};
const PIECES=[
 ['fdr_plaque','Founder plaque',g=>{const ink=mat(INK2),steel=mat(STEEL,{shininess:90,specular:0xffffff}),pan=mat('#0c1d12');
  bx(g,.96,.07,.5,ink,0,.035,0);bx(g,.9,.02,.44,FOIL,0,.075,0);
  bx(g,.84,1.04,.07,ink,0,.64,-.04);bx(g,.76,.96,.03,pan,0,.64,-.005);
  [[0,1.1,.78,.03],[0,.18,.78,.03]].forEach(a=>bx(g,a[2],a[3],.045,FOIL,a[0],a[1],.012));[-.39,.39].forEach(x=>bx(g,.03,.96,.045,FOIL,x,.64,.012));
  /* the emblem: a fern in a ring of foil */
  frond(g,0,.5,.02,.42,8,.16,.016,FOIL);
  /* an engraved plate and a row of marks, one for each day of the first week */
  bx(g,.5,.1,.03,steel,0,.3,.02);for(let i=0;i<3;i++)bx(g,.38-i*.08,.012,.034,'#2b332f',0,.325-i*.022,.036);
  for(let i=0;i<7;i++)bx(g,.03,.03,.03,i<7?FOIL:ink,-.18+i*.06,.215,.02);
  /* stand legs */
  [-.34,.34].forEach(x=>bx(g,.05,.1,.3,ink,x,.12,-.04))},1,.6],
 ['fdr_light','Day One light',g=>{const ink=mat(INK2);
  bx(g,.62,.05,.62,ink,0,.025,0);bx(g,.58,.012,.58,FOIL,0,.056,0);bx(g,.07,1.7,.07,ink,0,.9,0);bx(g,.1,.1,.1,ink,0,.12,0);
  /* a fern of light: the spine and leaflet pairs are lit tubes, which breathe between two greens */
  const lit=GLOW;bx(g,.04,1.2,.04,lit,0,1.0,.05);
  for(let i=0;i<9;i++){const f=i/8,y=.52+f*1.0,l=.5*(1-f*.72);[-1,1].forEach(s=>bx(g,l,.03,.03,lit,s*(l/2*.88+.01),y+l*.24,.05,0,0,s*(.52+f*.1)))}
  bx(g,.07,.07,.07,lit,0,1.66,.05);bx(g,.3,.014,.06,FOIL,0,1.78,0);bx(g,.07,.14,.07,ink,0,1.75,0)},.8,.8]];
PIECES.forEach(([k,n,fx,w,d])=>Object.defineProperty(F,k,{value:{n,p:0,w,d,b:[],fx},enumerable:false,writable:true,configurable:true}));
const FIDS=[GJ.id,GH.id],PKS=PIECES.map(p=>p[0]);

/* ---- who is a Founder, and what they get ---- */
const isF=()=>!!(S&&S.fdr);
window.isFounder=isF;
window.founderSync=function(first){try{if(typeof S!='object'||!S)return;S.wr=Array.isArray(S.wr)?S.wr:[];
 if(window.__fdOff&&S.fdr)delete S.fdr; /* v49.93.0: founders/{uid}.f = 0 in Firebase takes Founder away (209-founder-cloud.js) */
 if(!S.fdr){if(S.wr.some(i=>FIDS.includes(i))){S.wr=S.wr.filter(i=>!FIDS.includes(i));if(S.wn)for(const k in S.wn)if(FIDS.includes(S.wn[k]))delete S.wn[k]}
  if(S.inv)PKS.forEach(k=>{if(S.inv[k])delete S.inv[k]});return}
 const g=S.fdr.g=S.fdr.g||{};let n=0;S.wc=S.wc||{};S.inv=S.inv||{};
 [GJ,GH].forEach(x=>{if(!g[x.id]){g[x.id]=1;n++;if(!S.wr.includes(x.id))S.wr.push(x.id);S.wc[x.id]=x.dc}});
 PIECES.forEach(([k])=>{if(!g[k]){g[k]=1;n++;S.inv[k]=(S.inv[k]||0)+1}});
 if(n&&first!==0){try{snd('chime');say('Founder rewards added: the Founder Bomber and Cap are in your wardrobe, the plaque and Day One light are in Storage.')}catch(e){}}}catch(e){console.warn('founder sync',e)}};
setInterval(()=>window.founderSync(0),4000);

/* ---- where the mark shows ---- */
/* WaveFern artist page, under "Verified by WaveFern" */
if(typeof PG=='object'&&PG&&PG.home){const h0=PG.home;PG.home=function(){const r=h0.apply(this,arguments);return isF()&&typeof r=='string'?r.replace('<p class=sfml>',fdChip()+'<p class=sfml>'):r}}
/* pause menu */
if(typeof pauseUI=='function'){const p0=pauseUI;pauseUI=function(){const r=p0.apply(this,arguments);try{if(isF()){const b=document.querySelector('#pzm .m');if(b)b.insertAdjacentHTML('afterend',fdChip())}}catch(e){}return r}}
/* title screen: no mark (the main menu shows only the profile icon); career select rows keep it */
if(typeof slotInfo=='function'){const s0=slotInfo;slotInfo=function(n){const r=s0.apply(this,arguments);if(r){try{const c=localStorage.getItem(slotKey(n));if(c&&scDecode(c).S.fdr)r.fd=1}catch(e){}}return r}}
if(typeof ttWorlds=='function'){const w0=ttWorlds;ttWorlds=function(){const r=w0.apply(this,arguments);try{const a=curSlot();document.querySelectorAll('#ttl .ttsl[data-slot]').forEach(el=>{const n=+el.dataset.slot,f=n==a&&typeof TT=='object'&&TT.game?isF():(slotInfo(n)||{}).fd;const b=el.querySelector('b');if(f&&b&&!el.querySelector('.fdm'))b.insertAdjacentHTML('afterend',fdMark(13))})}catch(e){}return r}}
/* band: shared with bandmates when they join, and shown next to the name in the band panel and in band chat */
window.fdFlag=()=>isF()?1:0;
})();
