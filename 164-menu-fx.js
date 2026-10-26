/* ===== v46.7.1: menu buttons grow towards the pointer =====
   On the main menu, career screens and pause menu, a hovered button swells from its far side towards wherever the
   pointer is and leans a few pixels after it. The CSS (style.css, v46.7.0 block) scales around --ox/--oy and shifts by --tx/--ty. */
(()=>{
const SEL='#ttl button,#pzm button';
function lean(e){const b=e.target.closest&&e.target.closest(SEL);if(!b||b.disabled)return;
 const r=b.getBoundingClientRect(),fx=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),fy=Math.min(1,Math.max(0,(e.clientY-r.top)/r.height)),st=b.style;
 st.setProperty('--ox',Math.round((1-fx)*100)+'%');st.setProperty('--oy',Math.round((1-fy)*100)+'%');
 st.setProperty('--tx',((fx-.5)*6).toFixed(1)+'px');st.setProperty('--ty',((fy-.5)*4).toFixed(1)+'px')}
document.addEventListener('pointerover',lean);
document.addEventListener('pointermove',lean);
})();
