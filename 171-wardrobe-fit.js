/* ---------- v49.1.0: wardrobe colours, try-on previews and hats that fit over the hair ----------
   - The wardrobe now knows what you are wearing. A new career (and older saves) never recorded the outfit from the
     character creator in S.wn, so every slot read "nothing" and picking a colour on the clothes you had on only
     recoloured the card, never you. wnSync matches what the character wears to the pieces you own (and gives you the
     basic piece the creator dressed you in), so colours apply straight away.
   - Wardrobe cards show your own character wearing the piece in the chosen colour, framed on that piece, instead of
     a floating box. Built lazily (a couple per frame) and cached.
   - Hats (tagged userData.hat in 03, 50 and 60) are widened to sit over the 3D hair instead of the hair poking through. */
const WN_SL=['top','jk','bt','sh','ht','ac'];
function wnSync(){if(typeof S!='object'||!S||!Array.isArray(S.wr))return;S.wn=S.wn||{};S.wc=S.wc||{};
 WN_SL.forEach(sl=>{let st;try{st=XPSL[sl](ch)}catch(e){return}const cur=S.wn[sl],g=cur&&GM[cur];
  if(st==null||st===undefined){if(g&&sl!='top')delete S.wn[sl];return}
  if(g&&g.slot==sl&&g.st===st&&S.wr.includes(cur))return;
  const col=xSlotCol(ch,sl),fits=GAR.filter(x=>x.slot==sl&&x.st===st);let m=fits.filter(x=>S.wr.includes(x.id));m=m.find(x=>(S.wc[x.id]||x.dc)==col)||m[0];
  /* the outfit from the character creator: the cheapest piece of that style comes with it */
  if(!m&&!g&&(sl=='top'||sl=='bt')){m=fits.slice().sort((a,b)=>a.p-b.p)[0];if(m)S.wr.push(m.id)}
  if(m){S.wn[sl]=m.id;S.wc[m.id]=col}})}
{const sg0=starterG;starterG=function(){const r=sg0.apply(this,arguments);try{wnSync()}catch(e){console.warn('wardrobe sync',e)}return r}}

/* ---- try-on previews ---- */
const TRY=new Map(),TRYF={f:0,g:-1,n:0},TRYV={top:[.3,1.3],jk:[.1,1.32],bt:[-.04,1.0],sh:[-.06,.5],ht:[1.0,2.02],ac:[.55,1.98]};
function tryDrop(k){const m=TRY.get(k);TRY.delete(k);if(m)m.traverse(o=>{if(o.isMesh&&o.userData.hair3d)o.geometry.dispose()})}
function tryOn(id,col){const g=GM[id];if(!g)return null;const sv=Object.assign({},ch),wn=S.wn,wc=S.wc;let r;
 try{S.wn=Object.assign({},wn,{[g.slot]:id});S.wc=Object.assign({},wc,{[id]:col});if(g.slot=='top'){delete ch.jk;delete ch.jks;delete S.wn.jk}equip(id,col);r=buildChar(ch)}
 finally{for(const k in ch)if(!(k in sv))delete ch[k];Object.assign(ch,sv);S.wn=wn;S.wc=wc}
 const sy=r.g.scale.y,[y0,y1]=TRYV[g.slot]||[0,2],w=new THREE.Group();r.g.rotation.y=-.5;r.g.position.y=-(y0+y1)/2*sy;w.add(r.g);w.scale.setScalar(2.3/((y1-y0)*sy));return w}
{const pm=pvModel;pvModel=function(k){if(typeof k!='string'||k.slice(0,2)!='k:'||!document.querySelector('.wrd'))return pm(k);
 if(TRY.has(k))return TRY.get(k);if(TRYF.g!==TRYF.f){TRYF.g=TRYF.f;TRYF.n=0}if(TRYF.n>=2)return null;TRYF.n++;
 const[id,col]=k.slice(2).split('|');let m=null;try{m=tryOn(id,col||GM[id].dc)}catch(e){console.warn('try-on',e)}if(!m)return pm(k);
 TRY.set(k,m);if(TRY.size>80)tryDrop(TRY.keys().next().value);return m}}
(function tf(){TRYF.f++;requestAnimationFrame(tf)})();
/* the outfit changed: every try-on is out of date */
{const r0=refresh;refresh=function(){const r=r0.apply(this,arguments);[...TRY.keys()].forEach(tryDrop);return r}}
{const pi0=pvInit;pvInit=function(){const r=pi0.apply(this,arguments);try{PVR.setSize(256,256)}catch(e){}return r}}
{const wr0=wrR;wrR=function(){const r=wr0.apply(this,arguments);document.querySelectorAll('.wrg canvas.pv').forEach(c=>{c.width=c.height=256});return r}}
{const st=document.createElement('style');st.textContent='.wrg .thp canvas.pv{width:160px!important;height:160px!important;image-rendering:auto!important}';document.head.appendChild(st)}

/* ---- hats sit over the hair ---- */
const HFV=new THREE.Vector3();
function hatFit(h){const hats=[],hair=[];h.children.forEach(m=>{if(!m.isMesh||!m.visible)return;if(m.userData.hat)hats.push(m);else if(m.userData.hair)hair.push(m)});if(!hats.length||!hair.length)return;
 let y0=1e9,y1=-1e9,ax=0,ab=0;hats.forEach(m=>{const G=m.geometry;if(!G.boundingBox)G.computeBoundingBox();m.updateMatrix();const bb=G.boundingBox;
  for(let i=0;i<8;i++){HFV.set(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z).applyMatrix4(m.matrix);y0=Math.min(y0,HFV.y);y1=Math.max(y1,HFV.y);ax=Math.max(ax,Math.abs(HFV.x));ab=Math.max(ab,-HFV.z)}});
 if(ax<.05)return;let hx=0,hb=0;const T=[0,0,0].map(()=>new THREE.Vector3());
 hair.forEach(m=>{m.updateMatrix();const P=m.geometry.attributes.position,I=m.geometry.index,n=I?I.count:P.count;
  for(let t=0;t<n;t+=3){for(let j=0;j<3;j++)T[j].fromBufferAttribute(P,I?I.getX(t+j):t+j).applyMatrix4(m.matrix);
   const lo=Math.min(T[0].y,T[1].y,T[2].y),hi=Math.max(T[0].y,T[1].y,T[2].y);if(hi<y0+.01||lo>y1)continue;
   T.forEach(v=>{hx=Math.max(hx,Math.abs(v.x));hb=Math.max(hb,-v.z)})}});
 const s=Math.min(1.3,Math.max((hx+.015)/ax,ab>.05?(hb+.015)/ab:1));if(!(s>1.005))return;
 hats.forEach(m=>{m.position.x*=s;m.position.z*=s;m.scale.x*=s;m.scale.z*=s})}
{const b0=buildChar;buildChar=function(c){const r=b0.apply(this,arguments);try{if(c&&c.ht>=0){const h=xHead(r.g);if(h)hatFit(h)}}catch(e){console.warn('hat fit',e)}return r}}
