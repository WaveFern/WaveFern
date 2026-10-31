/* ---------- v49.45.0: clothes look like clothes in the Threadz shop, and nine new detailed pieces ----------
   - Threadz showed every piece as a few floating coloured blocks. Each card now shows your own character wearing the
     piece in the chosen colour, framed on it (the same try-on picture the wardrobe uses), so every seam, print, zip
     and pocket is visible before you buy. Pictures are drawn a couple per frame and kept until your outfit changes.
   - Nine new pieces with lots of small parts: Cable Knit Sweater (cable columns, diamond, ribbed hem and cuffs),
     Western Shirt (pointed yokes with piping, pearl snaps, flap pockets), Racing Tee (chequered band, side stripes,
     sponsor patches), Utility Jacket (four flap pockets, buttons, belt, epaulettes), Rain Mac (toggles and loops,
     storm flap, belt, hood), Utility Cargo Pants (side pockets with flaps, knee panels, ankle straps, belt), Tartan
     Skirt (pleats and a woven check), Wool Beret (stalk, band, tilt) and Studio Headphones (band, padded cups, cable).
   They plug into the new-drop wrapper in 50-threadz-new-drop.js (XNEW plus the base style tables). */
(function(){
if(typeof GAR=='undefined'||typeof XNEW=='undefined'||typeof gA3!='function')return;
const GAR2=GAR.length;
[['Cable Knit Sweater',78,38,'#d9c8a0',,'vintage'],['Western Shirt',66,39,'#2f6fb5',0,'vintage'],['Racing Tee',42,40,'#c0392b',,'sport']].forEach(a=>gA3('top',a));
[['Utility Jacket',135,24,'#6b8e5a',0,'street'],['Rain Mac',115,25,'#f1c40f',,'street']].forEach(a=>gA3('jk',a));
[['Utility Cargo Pants',72,21,'#2c3e50',,'street'],['Tartan Skirt',58,22,'#c0392b',,'vintage']].forEach(a=>gA3('bt',a));
[['Wool Beret',36,21,'#1f3a6e',,'vintage']].forEach(a=>gA3('ht',a));
[['Studio Headphones',120,23,'#111111',0,'street']].forEach(a=>gA3('ac',a));
Object.assign(XTOPB,{38:8,39:8,40:0});Object.assign(XJKB,{24:0,25:2});Object.assign(XBTB,{21:0,22:1});
if(typeof XTSL!='undefined'){XTSL[38]=.5;XTSL[39]=.5;XTSL[40]=.25}
if(typeof XTNOHEM!='undefined')XTNOHEM.push(38);if(typeof XTNOCUFF!='undefined')XTNOCUFF.push(38,39);

/* ---- the new pieces on a character ---- */
XNEW.top[38]=(x,c)=>{const{g,w,d,arms}=x,t=xtone(c,.82),t2=xtone(c,.7),z=d/2+.006;
 xb(g,w+.014,.075,d+.014,t,0,.545,0);for(let i=0;i<9;i++)xb(g,.008,.075,d+.018,t2,-w/2+.03+i*(w-.06)/8,.545,0);
 xb(g,w*.42,.05,.03,t,0,1.08,d/2-.006);xb(g,w*.42,.05,d*.5,t,0,1.1,0);
 [-.3,0,.3].forEach(px=>{for(let j=0;j<7;j++)xb(g,.045,.045,.012,j%2?t:xlt(c,.12),px*w+(j%2?.014:-.014),.64+j*.058,z)});
 [-.15,.15].forEach(px=>xb(g,.012,.42,.01,t2,px*w,.82,z));xb(g,.07,.07,.012,t2,0,.79,z+.002,0,0,Math.PI/4);
 if(!x.jk)arms.forEach(a=>{xb(a,.186,.075,.236,t,0,-.462,0);[-.05,0,.05].forEach(o=>xb(a,.01,.36,.01,t2,o,-.24,.118))})};
XNEW.top[39]=(x,c)=>{const{g,w,d,arms}=x,t=xtone(c,.72),p=xlum(c)>.5?'#7a1f2b':'#f4f1e8',z=d/2+.006;
 [-1,1].forEach(s=>{xb(g,w*.52,.06,.012,t,s*w*.24,1.0,z,0,0,s*-.32);xb(g,w*.52,.012,.014,p,s*w*.24,.965,z+.002,0,0,s*-.32);
  xb(g,.13,.1,.012,t,s*w*.27,.86,z);xb(g,.14,.04,.016,t,s*w*.27,.91,z+.004);xs(g,.012,'~#f4f0e8',s*w*.27,.9,z+.014);
  xb(g,.11,.05,.03,c,s*.07,1.1,z-.006,0,0,s*.5);xb(g,.04,.42,d*.98,t,s*(w/2-.02),1.0,0,0,0,0)});
 xb(g,.045,.58,.012,t,0,.8,z);for(let i=0;i<6;i++)xs(g,.013,'~#f4f0e8',0,.6+i*.085,z+.01);
 xb(g,w+.012,.04,d+.012,t,0,.53,0);
 if(!x.jk)arms.forEach(a=>{xb(a,.186,.08,.236,t,0,-.455,0);xs(a,.011,'~#f4f0e8',.05,-.455,.12);xs(a,.011,'~#f4f0e8',-.03,-.455,.12);xb(a,.188,.012,.238,p,0,-.41,0)})};
XNEW.top[40]=(x,c)=>{const{g,w,d,arms}=x,t=xtone(c,.75),z=d/2+.006;
 for(let r=0;r<2;r++)for(let i=0;i<8;i++)xb(g,w/8,.05,.012,(i+r)%2?'#111111':'#f4f4f4',-w/2+w/16+i*w/8,.92+r*.05,z);
 [-1,1].forEach(s=>{xb(g,.012,.56,.06,'#f4f4f4',s*(w/2+.004),.8,0);xb(g,.014,.56,.025,'#111111',s*(w/2+.006),.8,0)});
 xb(g,.12,.06,.012,'#ffd23d',-w*.24,.75,z);xb(g,.08,.03,.014,'#111111',-w*.24,.75,z+.002);xb(g,.1,.07,.012,'#f4f4f4',w*.25,.74,z);xb(g,.05,.04,.014,'#2f6fb5',w*.25,.74,z+.002);
 xb(g,.14,.03,.012,'#111111',0,.63,z);xb(g,w*.38,.04,.02,t,0,1.08,d/2-.005);
 if(!x.jk)arms.forEach(a=>{xb(a,.182,.03,.232,'#111111',0,-.12,0);xb(a,.182,.03,.232,'#f4f4f4',0,-.16,0)})};
XNEW.jk[24]=(x,c)=>{const{g,w,d,arms}=x,t=xtone(c,.72),z=d/2+.052;
 [-1,1].forEach(s=>{xb(g,.13,.11,.012,t,s*w*.27,.93,z);xb(g,.14,.045,.018,c,s*w*.27,.99,z+.004);xs(g,.012,'#2a1d14',s*w*.27,.975,z+.016);
  xb(g,.15,.14,.012,t,s*w*.27,.7,z);xb(g,.16,.05,.018,c,s*w*.27,.78,z+.004);xs(g,.012,'#2a1d14',s*w*.27,.765,z+.016);
  xb(g,.12,.03,.05,t,s*w*.38,1.125,0);xs(g,.01,'#2a1d14',s*w*.3,1.14,0);xb(g,.12,.06,.03,c,s*.08,1.1,z-.01,0,0,s*.45)});
 for(let i=0;i<5;i++)xs(g,.013,'#2a1d14',w*.05,.62+i*.1,z+.006);
 xb(g,w+.1,.045,d+.1,'#3a2a1a',0,.6,0);xb(g,.07,.06,.012,'~#c8ccd0',0,.6,z+.012);
 arms.forEach(a=>{xb(a,.19,.05,.24,t,0,-.46,0);xs(a,.01,'#2a1d14',.06,-.46,.122)})};
XNEW.jk[25]=(x,c)=>{const{g,w,d,arms}=x,t=xtone(c,.72),z=d/2+.052;
 xb(g,.1,.66,.012,t,w*.06,.8,z);[0,1,2].forEach(i=>{const y=.68+i*.14;xb(g,.07,.02,.02,'#f4ecd8',w*.06,y,z+.008);xc(g,.012,.012,.07,'#5a3a22',w*.06,y,z+.018,0,0,Math.PI/2);xb(g,.006,.03,.022,'#f4ecd8',w*.06-.04,y,z+.008)});
 xb(g,w+.1,.05,d+.1,t,0,.62,0);xb(g,.06,.06,.014,'~#c8ccd0',-w*.2,.62,z+.01);
 xb(g,w*.78,.24,.14,c,0,1.14,-d/2-.06);xb(g,w*.8,.03,.15,t,0,1.03,-d/2-.06);
 [-1,1].forEach(s=>{xb(g,.14,.02,.012,t,s*w*.3,.52,z);xb(g,.012,.4,.014,t,s*(w/2+.052),.6,0)});
 arms.forEach(a=>{xb(a,.19,.05,.24,t,0,-.46,0);xb(a,.04,.02,.244,'#f4ecd8',0,-.43,0)})};
XNEW.bt[21]=(x,c)=>{const{g,w,d}=x,t=xtone(c,.72),z=d*.4+.006;
 legEach(x,(l,s)=>{const sx=s*(w*.21+.006);xb(l,.012,.13,.15,t,sx,-.22,0);xb(l,.016,.04,.16,c,sx+s*.002,-.15,0);xs(l,.01,'#c8ccd0',sx+s*.008,-.16,0);
  xb(l,w*.3,.09,.012,t,0,-.3,z);xb(l,w*.44,.03,d*.84,t,0,-.4,0);xb(l,.03,.034,.012,'~#c8ccd0',s*w*.12,-.4,d*.42+.004);xb(l,.006,.38,.016,t,sx+s*.004,-.21,.06)});
 xb(g,w+.012,.045,d+.012,'#1a1a1a',0,.505,0);xb(g,.06,.05,.012,'~#c8ccd0',0,.505,d/2+.01);[-1,1].forEach(s=>xb(g,.02,.06,.01,t,s*w*.3,.505,d/2+.008))};
XNEW.bt[22]=(x,c)=>{XNEW.bt[7](x,c);const{g,w,d}=x,k=xlum(c)>.5?'#1f3a6e':'#111111',y2=xlum(c)>.5?'#c0392b':'#f1c40f';
 [.34,.44].forEach(y=>[1,-1].forEach(f=>xb(g,w+.152,.025,.012,k,0,y,f*(d/2+.064))));[.39].forEach(y=>[1,-1].forEach(f=>xb(g,w+.152,.008,.013,y2,0,y,f*(d/2+.065))));
 [-.3,0,.3].forEach(px=>[1,-1].forEach(f=>xb(g,.025,.25,.012,k,px*w,.41,f*(d/2+.063))));xs(g,.022,'~#c8ccd0',w*.38,.47,d/2+.075)};
XNEW.ht[21]=(x,c)=>{const{h}=x,t=xtone(c,.75);xb(h,.66,.07,.66,t,0,.29,0);xb(h,.74,.12,.74,c,.03,.37,0,0,0,-.1);xb(h,.62,.05,.62,c,.04,.45,0,0,0,-.1);xb(h,.04,.05,.04,t,.05,.5,0)};
XNEW.ac[23]=(x,c)=>{const{h}=x,p='#2a2a2a';xb(h,.72,.05,.1,c,0,.5,0);xb(h,.5,.03,.08,'#555555',0,.53,0);
 [-1,1].forEach(s=>{xb(h,.05,.42,.08,c,s*.36,.28,0);xb(h,.08,.2,.2,c,s*.36,0,0);xb(h,.02,.16,.16,'#555555',s*.405,0,0);xb(h,.03,.17,.17,p,s*.31,0,0)});xb(h,.012,.3,.012,'#111111',.37,-.25,.04)};

/* simple shop pictures for the old box previews (try-on pictures replace them in Threadz and the wardrobe) */
const BASEOF={top:XTOPB,jk:XJKB,bt:XBTB};
{const clb0=clb;clb=function(k){const[id,col]=String(k).split('|'),g=GM[id];if(!g||GAR.indexOf(g)<GAR2)return clb0(k);const tb=BASEOF[g.slot];
 const b=GAR.find(o=>o.slot==g.slot&&o.st===(tb?tb[g.st]:0));return clb0((b||GAR[0]).id+'|'+(col||g.dc))}}

/* ---- Threadz pictures: your character wearing the piece ---- */
const TZC={},TZQ=[];let TZR=null;
function tzRender(key){const[id,col]=key.split('|');if(typeof tryOn!='function')return null;const m=tryOn(id,col||GM[id].dc);if(!m)return null;
 if(!PVR)pvInit();m.rotation.y=.7;PVS.add(m);PVR.render(PVS,PVC);PVS.remove(m);m.traverse(o=>{if(o.isMesh&&o.userData.hair3d)o.geometry.dispose()});return PVR.domElement.toDataURL()}
function tzPump(){TZR=null;let n=0;while(TZQ.length&&n<2){const k=TZQ.shift();if(TZC[k])continue;let u=null;try{u=tzRender(k)}catch(e){console.warn('threadz try-on',e)}n++;if(!u)continue;TZC[k]=u;
  document.querySelectorAll('img.thtry').forEach(im=>{if(im.dataset.k===k){im.src=u;im.classList.add('rdy')}})}
 if(TZQ.length)TZR=requestAnimationFrame(tzPump)}
{const iso1=isoP;isoP=function(t,key,sz=190){if(t!='k'||typeof tryOn!='function'||!GM[String(key).split('|')[0]])return iso1(t,key,sz);const u=TZC[key];
 if(!u){if(!TZQ.includes(key))TZQ.push(key);if(!TZR)TZR=requestAnimationFrame(tzPump)}
 return`<img class="thtry${u?' rdy':''}" data-k="${key}" src="${u||'data:image/gif;base64,R0lGODlhAQABAAAAACw='}" style="width:${sz}px;height:${sz}px;display:block;margin:0 auto">`}}
/* a different outfit means different pictures */
{const r0=refresh;refresh=function(){const r=r0.apply(this,arguments);Object.keys(TZC).forEach(k=>delete TZC[k]);return r}}
{const st=document.createElement('style');st.textContent='img.thtry{opacity:0;transition:opacity .2s;background:radial-gradient(circle,#fff 0,#efe8da 70%);border-radius:6px}img.thtry.rdy{opacity:1}';document.head.appendChild(st)}

/* ---- the pink line on every wardrobe picture ----
   A chain (or other extra) picked in the character creator was put on the body but never recorded as a wardrobe piece,
   so the Extras slot said "nothing", it could not be taken off, and it showed on every try-on picture (a pink chain
   for a pink accessory colour). Now every slot is matched to a wardrobe piece (a creator piece you don't own yet is
   given to you, as tops and bottoms already were), the match runs again whenever the wardrobe opens, and a stray extra
   left over in an older save is taken off once. */
if(typeof wnSync=='function'&&typeof XPSL!='undefined'){
 const sync0=wnSync;wnSync=function(){const r=sync0.apply(this,arguments);try{if(typeof S!='object'||!S||!Array.isArray(S.wr))return r;S.wn=S.wn||{};S.wc=S.wc||{};
  ['jk','sh','ht','ac'].forEach(sl=>{if(S.wn[sl]&&GM[S.wn[sl]])return;let st;try{st=XPSL[sl](ch)}catch(e){return}if(st==null)return;
   const m=GAR.filter(x=>x.slot==sl&&x.st===st).sort((a,b)=>a.p-b.p)[0];if(!m)return;if(!S.wr.includes(m.id))S.wr.push(m.id);S.wn[sl]=m.id;try{S.wc[m.id]=xSlotCol(ch,sl)}catch(e){}})}catch(e){console.warn('wardrobe sync',e)}return r};
 if(typeof wardrobe=='function'){const w0=wardrobe;wardrobe=function(){try{wnSync()}catch(e){}return w0.apply(this,arguments)}}
 let ft=0;const u0=update;update=function(dt){u0(dt);ft+=dt||0;if(ft<1)return;ft=0;try{if(typeof S!='object'||!S||S.wfix45||mode!='play')return;S.wfix45=1;
  if(ch.ac>=0&&!(S.wn&&S.wn.ac&&GM[S.wn.ac])){unq('ac');refresh();if(typeof autoSave=='function')autoSave()}wnSync()}catch(e){console.warn('wardrobe fix',e)}}}
})();
