/* Dev only: Browse artists / artist page pictures keep their 3D press shot once it has been drawn.
   Before, 190-pfp-styles.js only swapped the 3D picture in if the WaveFern app was on screen when it finished, its cache
   dropped old pictures after 400 entries, and one WebGL hiccup turned it off for good, so pictures could fall back to the
   old 16x16 faces. Now the first 3D picture for each artist is remembered for the session and every <img> still showing
   the old face is swapped as soon as it is ready. */
(function(){
if(typeof brFace!='function'||typeof BRFC=='undefined')return;
const bf=brFace,FIN=new Map(),PEND=new Map();
brFace=function(i){if(FIN.has(i))return FIN.get(i);const u=bf(i),old=BRFC.get(i);
 if(u&&old&&u!==old){FIN.set(i,u);PEND.delete(i);return u}if(old)PEND.set(i,old);return u};
setInterval(()=>{if(!PEND.size)return;let n=0;PEND.forEach((old,i)=>{if(n++>12)return;let u;try{u=bf(i)}catch(e){PEND.delete(i);return}
 if(u&&u!==old){FIN.set(i,u);PEND.delete(i);document.querySelectorAll('img').forEach(im=>{if(im.getAttribute('src')===old)im.src=u})}})},350);
})();
