/* ===== v53.0.0: your own signature, and getting paid for every signing =====
   - The first time you open Label HQ you must draw your signature (signGame, 232-signature-game.js). It is saved in S.sig
     = {s: strokes normalised to the zone, a: [zone width px, zone height px], day}. "Redraw" in the Vinyl & CD tab replaces it.
   - Every later signGame session (street fans, festival and tour autographs, signing pressed vinyls/CDs) is scored against it:
     SIGNME.sim(strokes, zone) is 0..1, how close the drawn signature is to your saved one (size and position do not matter, the
     shape does). Each signed item pays fee x sim, fee = $10 x (1 + 0.35 x Fame Level). The result gets .sim, .paid, and every
     item .sim. Sessions started with noPay:true (the street, which already pays a tip in 14-world...js) are not paid here.
   - SIGNME.sim: both signatures are turned into a cloud of points in pixel proportions, centred and scaled to their own
     bounding box, then compared both ways by nearest-point distance (chamfer); a big difference in ink length lowers it too. */
(function(){
const ZONE={paper:[.74,.26],poster:[.6,.15],ticket:[.8,.3],cap:[.4,.28],album:[.8,.17],shirt:[.4,.22],vinyl:[.32,.32],cd:[.4,.4]};
const W=720,H=440,TOL=.04;
const fm=n=>'$'+Math.round(n).toLocaleString('en-US');
const zsize=(kind,z)=>z?[z.w*W,z.h*H]:[(ZONE[kind]||ZONE.paper)[0]*W,(ZONE[kind]||ZONE.paper)[1]*H];
function cloud(strokes,zw,zh){const P=[];let len=0;(strokes||[]).forEach(s=>{if(!s||!s.length)return;
  for(let i=0;i<s.length;i++){const x=s[i][0]*zw,y=s[i][1]*zh;if(i==0){P.push([x,y]);continue}
   const px=s[i-1][0]*zw,py=s[i-1][1]*zh,d=Math.hypot(x-px,y-py),n=Math.max(1,Math.ceil(d/2));len+=d;for(let k=1;k<=n;k++)P.push([px+(x-px)*k/n,py+(y-py)*k/n])}});
 if(!P.length)return{P:[],len:0};let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;P.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
 const sc=Math.max(x1-x0,y1-y0,1),cx=(x0+x1)/2,cy=(y0+y1)/2;/* a thin line is scaled by its length, so it still has a shape */
 const out=P.map(p=>[(p[0]-cx)/sc,(p[1]-cy)/sc]);return{P:out,len:len/sc}}
function thin(P,max){if(P.length<=max)return P;const o=[],k=P.length/max;for(let i=0;i<max;i++)o.push(P[Math.floor(i*k)]);return o}
const mean=(A,B)=>{let t=0;A.forEach(a=>{let m=1e9;for(let i=0;i<B.length;i++){const dx=a[0]-B[i][0],dy=a[1]-B[i][1],d=dx*dx+dy*dy;if(d<m)m=d}t+=Math.sqrt(m)});return t/A.length};
const SIGNME=window.SIGNME={};
/* how close a drawn signature (strokes in a zone of the given item kind) is to the saved one, 0..1 */
SIGNME.sim=function(strokes,kind,zone){const me=S.sig;if(!me||!me.s||!strokes||!strokes.length)return 0;
 const [zw,zh]=zsize(kind,zone),a=cloud(strokes,zw,zh),b=cloud(me.s,me.a[0],me.a[1]);if(!a.P.length||!b.P.length)return 0;
 const A=thin(a.P,260),B=thin(b.P,260),d=(mean(A,B)+mean(B,A))/2,lr=Math.min(a.len,b.len)/Math.max(a.len,b.len,1e-6);
 const s=Math.max(0,1-d/TOL)*(.4+.6*lr);return +Math.max(0,Math.min(1,s)).toFixed(3)};
SIGNME.fee=()=>{let L=0;try{L=fameLv()||0}catch(e){}return 10*(1+.35*L)};
SIGNME.setup=function(){if(typeof signGame!='function')return say('The signature game is not available.');
 signGame({title:'Your signature',noPay:true,skippable:false,intro:'Sign the way you will sign everything from now on. Enter = done, Backspace = clear.',
  items:[{kind:'paper',who:'WaveFern',ask:'Draw your signature. Every signature you give later is paid by how closely it matches this one.'}]}).then(r=>{
  try{const it=r&&r.items&&r.items[0];if(!r||r.cancelled||!it||!it.signed)return pcR();
   S.sig={s:it.strokes,a:zsize('paper'),day:S.day};try{updateVersion();snd('chime')}catch(e){}say('Signature saved. You are paid for each signing by how closely you match it.');pcR()}catch(e){console.error('signature setup',e)}})};
/* score and pay every signing session */
{const g0=signGame;window.signGame=function(o){o=o||{};const items=(o.items&&o.items.length)?o.items:null;
 return g0.apply(this,arguments).then(r=>{try{if(!r||r.cancelled||o.noPay||!S.sig)return r;let n=0,tot=0;
  (r.items||[]).forEach((it,i)=>{if(!it.signed)return;const src=items&&items[i]||{};it.sim=SIGNME.sim(it.strokes,it.kind,src.zone);n++;tot+=it.sim});
  r.sim=n?+(tot/n).toFixed(3):0;let pay=0;(r.items||[]).forEach(it=>{if(it.signed)pay+=SIGNME.fee()*it.sim});pay=+pay.toFixed(2);r.paid=pay;
  if(pay>0){S.money=+(S.money+pay).toFixed(2);S.earn=+((S.earn||0)+pay).toFixed(2);try{snd('cash')}catch(e){}}
  if(n)setTimeout(()=>say(pay>0?'Signatures paid '+fm(pay)+' ('+Math.round(r.sim*100)+'% like yours)':'Those did not look like your signature, so nothing was paid.'),700)}catch(e){console.error('signature pay',e)}return r})}}
/* Label HQ: you have to set your signature first */
{const h0=PA.hq;PA.hq=function(){if(S.sig)return h0.apply(this,arguments);
 return`<div class="bdw lhq"><header class=lh-top><div class=lh-in><nav class=lh-nav><button class=on>Label HQ</button></nav></div></header><main class=lh-main><div class=lh-in><header class=lh-ph><h1 class=lh-h1>Choose your signature</h1><p class=lh-lede>Before you use Label HQ, draw the signature you will sign everything with. Whenever you sign something later, from a fan on the street to a pressed vinyl, you are paid by how closely it matches this one.</p></header><button class="lh-btn pri" onclick="SIGNME.setup()">Draw my signature</button></div></main></div>`}}
/* the saved signature, shown on the Vinyl & CD tab with a Redraw button */
{const p0=BRD.press;BRD.press=function(){let card='';try{if(S.sig){const c=document.createElement('canvas');c.width=360;c.height=100;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,360,100);
  if(window.SIGN&&SIGN.stamp)SIGN.stamp(x,S.sig.s,10,8,340,84,'#111',2);
  card=`<section class=lh-sec><div class=lh-sh><h2 class=lh-h2>Your signature</h2><span class=lh-meta><button class=lh-lk onclick="SIGNME.setup()">Redraw</button></span></div><div style="display:flex;gap:24px;align-items:center;padding-top:16px;flex-wrap:wrap"><img src="${c.toDataURL()}" alt="Your signature" width=270 height=75 style="border:1px solid var(--ln)"><p class=lh-mut style="max-width:420px">Every signing is paid by how closely you match this: up to ${fm(SIGNME.fee())} each at your Fame Level.</p></div></section>`}}catch(e){console.error('signature card',e)}
 return p0.apply(this,arguments)+card}}
})();
