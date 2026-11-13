/* ===== v52.8.0: street autographs use the signature game =====
   A fan on the street who asks for an autograph ("Sign autograph", dynInt in 14-world...js) used to be signed with one key press.
   Now the signature minigame (232-signature-game.js, signGame) opens with one random item for that fan. The old sign(n) (and the
   fan-robbery wrapper of 92-fan-robbery.js) still runs afterwards, so the tip, the fan count and the thief chance work as before;
   the tip is scaled by how good the signature was (x0.6 for a scribble, up to x1.4 for a neat one). Skipping the item sends the
   fan away with no tip. Movement is frozen (mode 'menu') while the game is open. No saved state. */
(function(){
{const s0=sign;sign=function(n){
 if(!n||typeof signGame!='function'||typeof SIGN=='undefined'||SIGN.busy()||mode!='play')return s0.apply(this,arguments);
 mode='menu';let it;try{it=SIGN.random(1)}catch(e){it=null}
 signGame({title:'Autograph · a fan on the street',items:it||undefined,intro:'Draw your signature in the red box. Enter = next, Backspace = clear, Esc = skip.'}).then(r=>{
  try{if(mode=='menu')mode='play';if(!r||r.cancelled)return;
   if(!r.signed){n.st=2;n.cool=25;n.fan=false;say('You skipped the fan.');return}
   const m0=+S.money||0,q=+r.avg||0;s0.call(this,n);const d=(+S.money||0)-m0;
   if(d>0){const k=.6+.8*q,adj=+(d*k-d).toFixed(2);S.money=+(S.money+adj).toFixed(2);say('Fan tipped '+$$(d*k)+(q>=.8?' for a lovely signature':''))}}
  catch(e){console.error('street autograph',e);if(mode=='menu')mode='play'}});
}}
})();
