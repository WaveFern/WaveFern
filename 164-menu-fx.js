/* ===== v46.7.2: menu buttons grow towards the pointer =====
   On the main menu, career screens and pause menu, a hovered button smoothly swells out towards the side the pointer
   came in from (its far side stays put). The direction is set once on entry. The CSS (style.css, v46.7.0 block)
   scales around --ox/--oy. */
(()=>{
const SEL='#ttl button,#pzm button';
document.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest(SEL);if(!b||b.disabled||b.contains(e.relatedTarget))return;
 const r=b.getBoundingClientRect(),fx=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),fy=Math.min(1,Math.max(0,(e.clientY-r.top)/r.height));
 b.style.setProperty('--ox',Math.round((1-fx)*100)+'%');b.style.setProperty('--oy',Math.round((1-fy)*100)+'%')});
})();
