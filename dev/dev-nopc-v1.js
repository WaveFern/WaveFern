/* WaveFern dev: no PC items on Amazoom. Only loaded on /dev/ (see dev/index.html). Add ?nonopc to skip it.
   The RGB gaming PC setup is no longer sold: it is gone from the Amazoom list and cannot be bought or searched for.
   The furniture definition stays, so a PC already in storage or placed in a house still loads, shows and can be moved or stored.
   (The starter Desk + laptop is not an Amazoom item; it stays as the house's own desk.) */
(function(){
 if(!window.FW_FEAT||/[?&]nonopc/.test(location.search))return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev nopc '+t,e)}}};
 const NO=['gamingpc'];
 const isPC=k=>NO.indexOf(String(k).replace(/^f:/,''))>=0;
 /* the Amazoom list */
 safe(()=>{if(typeof azPage!='function')return;const a0=azPage;azPage=function(id,o){if(id=='amz'&&o&&Array.isArray(o.items))o=Object.assign({},o,{items:o.items.filter(x=>!isPC(x.k))});return a0.call(this,id,o)}},'list');
 /* no buying it by any other route (old pages, console, stale buttons) */
 safe(()=>{if(typeof buyF!='function')return;const b0=buyF;buyF=function(t){if(isPC(t))return typeof snd=='function'&&snd('err');return b0.apply(this,arguments)}},'buy');
})();
