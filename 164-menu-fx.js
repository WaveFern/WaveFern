/* ===== v46.7.0: menu button fill =====
   Main menu, career screens and pause menu buttons fill with colour from the point where the pointer comes in,
   and drain back towards where it leaves. The CSS (style.css, v46.7.0 block) grows a circle at --x/--y. */
(()=>{
const SEL='#ttl button,#pzm button';
function at(e){const b=e.target.closest&&e.target.closest(SEL);if(!b||b.contains(e.relatedTarget))return;
 const r=b.getBoundingClientRect();b.style.setProperty('--x',Math.round(e.clientX-r.left)+'px');b.style.setProperty('--y',Math.round(e.clientY-r.top)+'px')}
document.addEventListener('pointerover',e=>at(e));
document.addEventListener('pointerout',e=>at(e));
})();
