/* ===== v52.8.0: street autographs use the signature game; signature items follow what you published =====
   A fan on the street who asks for an autograph ("Sign autograph", dynInt in 14-world...js) used to be signed with one key press.
   Now the signature minigame (232-signature-game.js, signGame) opens with one random item for that fan. The old sign(n) (and the
   fan-robbery wrapper of 92-fan-robbery.js) still runs afterwards, so the tip, the fan count and the thief chance work as before;
   the tip is scaled by how good the signature was (x0.6 for a scribble, up to x1.4 for a neat one). On the street the item is always something flat (SIGN.street): lined paper, a poster, a ticket, an album, or a vinyl/CD you have pressed. Skipping the item sends the
   fan away with no tip. Movement is frozen (mode 'menu') while the game is open. No saved state. */
(function(){
/* items follow what you have published: a vinyl or CD only shows up once you have pressed that format (231-label-press.js),
   an album only once you have one */
{const have=k=>{try{if(k=='album')return (S.albums||[]).length>0;if(k=='vinyl'||k=='cd')return ((S.press&&S.press.runs)||[]).some(r=>r.fmt==k&&S.day>=r.ready);return true}catch(e){return true}};
 const pick=(n,x,pool)=>{const ks=SIGN.kinds.filter(k=>have(k)&&(!pool||pool.includes(k))),o=[];let last='';for(let i=0;i<n;i++){let k,t=0;do k=ks[(Math.random()*ks.length)|0];while(k==last&&ks.length>1&&++t<20);last=k;o.push(SIGN.item(k,x))}return o};
 SIGN.random=(n,x)=>pick(n,x);
 /* on the street fans only hand you flat things (lined paper, a poster, a ticket, an album, a record): no caps or shirts */
 SIGN.street=n=>pick(n,null,['paper','poster','ticket','album','vinyl','cd'])}
/* v55.21: each fan is decided once (the first time they are asked about): about half want an autograph, the rest just tip you */
const wantsSig=n=>{if(!S.sig)return false;/* no signature set up in Label HQ yet: fans only tip */if(n.sgm===undefined)n.sgm=Math.random()<.5;return n.sgm};
{const d0=dynInt;dynInt=function(){const a=d0.apply(this,arguments);try{a.forEach(i=>{if(i.l=='Sign autograph'){const n=NPC.find(q=>q.x===i.x&&q.z===i.z);if(n&&!wantsSig(n))i.l='Accept fan tip'}})}catch(e){}return a}}
{const s0=sign;sign=function(n){
 if(n&&n.fan&&!wantsSig(n)){return s0.apply(this,arguments)}
 if(!n||typeof signGame!='function'||typeof SIGN=='undefined'||SIGN.busy()||mode!='play')return s0.apply(this,arguments);
 mode='menu';let it;try{it=SIGN.street(1)}catch(e){it=null}
 signGame({noPay:true,title:'Autograph · a fan on the street',items:it||undefined,intro:'Draw your signature in the red box. Enter = next, Backspace = clear, Esc = skip.'}).then(r=>{
  try{if(mode=='menu')mode='play';if(!r||r.cancelled)return;
   if(!r.signed){n.st=2;n.cool=25;n.fan=false;say('You skipped the fan.');return}
   const m0=+S.money||0,q=r.sim!=null&&S.sig?.35+.9*r.sim:+r.avg||0;
   /* v55.45.1: sign() toasts 'Autograph signed! Fan tipped $t' with the unscaled tip; hold it back so only the final amount shows */
   const say0=say;say=function(t){if(!/^Autograph signed!/.test(String(t)))return say0.apply(this,arguments)};try{s0.call(this,n)}finally{say=say0}
   const d=(+S.money||0)-m0;
   if(d>0){const k=.6+.8*q,tip=Math.round(d*k),adj=tip-d;/* whole dollars: credited = shown */S.money=+(S.money+adj).toFixed(2);say('Fan tipped $'+tip+(q>=.8?' for a lovely signature':''))}}
  catch(e){console.error('street autograph',e);if(mode=='menu')mode='play'}});
}}
})();
