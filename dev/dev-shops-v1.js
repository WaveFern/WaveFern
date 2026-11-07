/* WaveFern dev: no browser on the computer. The city shops do what their website did: walk in and talk at the counter
   to open that shop (Motors, Pet Shop, Security, Property, and the Threadz and Gphones buildings from dev-citystores-v1.js). Buying there is instant,
   no appointment. Only loaded on /dev/. Add ?noshops to skip it. */
(function(){
 if(!window.FW_FEAT||/[?&]noshops/.test(location.search))return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev shops '+t,e)}}};
 const css=document.createElement('style');
 css.textContent=`body.fwk #pc .ico,body.fwk #pc .tb,body.fwk #pc .bwu,body.fwk #pc .bwb{display:none!important}
body:not(.fwk) #pc [ondblclick*="'web'"],body:not(.fwk) #pc [onclick*="'web'"]{display:none!important}
body.fwk #pc .win{left:3vw!important;top:3vh!important;right:auto!important;width:94vw!important;height:94vh!important;max-width:none!important;max-height:none!important}`;
 document.head.appendChild(css);
 /* the Browser app is gone: it is no longer in the computer's app list (desktop icons, Start menu). The window code stays only
    so the city shops can reuse it. */
 /* v49.93.10: the app list edit used eval, which the page's security policy refuses (console error on every load), so it never took effect on the live page either. Removed; the list is unchanged. */
 let K=0;
 window.devShop=function(k){if(typeof SITE=='undefined'||!SITE[k]||!PA[k])return;safe(()=>{openPC();K=1;document.body.classList.add('fwk');OA=['web'];app='web';bw=k;pcR()},'open')};
 const kOff=()=>{K=0;document.body.classList.remove('fwk')};
 {const c0=closeUI;closeUI=function(){if(K)kOff();return c0.apply(this,arguments)}}
 {const p0=pcR;let inR=0;pcR=function(){
  if(K&&mode=='pc'&&(app!=='web'||bw=='home')){kOff();return closePC()}
  if(!K&&mode=='pc'&&!inR){if(app=='web')app=0;if(Array.isArray(OA)&&OA.includes('web'))OA=OA.filter(k=>k!='web')}
  inR=1;let r;try{r=p0.apply(this,arguments)}finally{inR=0}
  if(!K)safe(()=>{const n=document.querySelectorAll(`#pc [ondblclick*="'web'"],#pc [onclick*="'web'"]`);n.forEach(e=>e.remove());if(n.length&&typeof pcLayout=='function')pcLayout()},'hide');
  return r}}
 /* in a shop you buy on the spot */
 if(typeof book=='function'){const b0=book;book=function(t,i){if(!K)return b0.apply(this,arguments);
  if(t=='car'&&!S.garage){snd('err');return say('You need a garage first. Buy one at the Property office.')}buyX(t,i);pcR()}}
 if(PA.cars){const c0=PA.cars;PA.cars=function(){return String(c0.apply(this,arguments)).replace('on the Property website','at the Property office')}}
 const TALK={'Rex (car dealer)':'cars','Poppy (pet keeper)':'pets','Viktor (security chief)':'guard','Mr. Okafor (agent)':'prop','Vera (sales agent)':'prop'};
 function shopInts(){if(typeof INT=='undefined')return;INT.forEach(o=>{if(o._dk||!o.l||o.l.indexOf('Talk to ')!==0)return;const k=TALK[o.l.slice(8)];if(!k||!SITE[k])return;
  o._dk=1;const nm=(typeof SITES!='undefined'&&SITES[k]&&SITES[k][1])||SITE[k][1];o.l='Shop '+nm;o.a=()=>devShop(k)})}
 setInterval(()=>safe(shopInts,'ints'),1000);
})();
