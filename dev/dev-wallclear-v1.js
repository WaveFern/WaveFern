/* ===== dev only: new wall items no longer overlap the wall decor that comes with the house =====
   The house comes with a lot hanging on the walls (framed paintings, pictures, the studio foam row, trim). Anything you
   buy and place against a wall used to sit right on top of it. Now, whenever a placed item (a plaque, a neon sign, a vinyl shelf,
   anything) touches a piece of that decor, that piece is hidden, and it comes back when the item is moved or stored.
   Nothing is deleted and nothing in the save changes: this only toggles what is drawn. The studio's gear decor (posters, booth
   foam) is built into one merged mesh by the studio itself, so it is left alone. */
(function(){
 if(typeof THREE=='undefined'||typeof PL=='undefined'||typeof scene=='undefined')return;
 let cand=[],hidden=new Set(),sig='',kids=-1;
 const bx=new THREE.Box3(),sz=new THREE.Vector3();
 function collect(){
  cand=[];
  scene.traverse(o=>{
   if(!o.isMesh||o.userData.merged||!o.geometry||!o.geometry.parameters||!o.visible||!o.material||o.material.isMeshBasicMaterial)return;
   for(let p=o;p;p=p.parent)if(PL.some(q=>q.m===p))return;
   const b=new THREE.Box3().setFromObject(o);b.getSize(sz);
   /* thin decor hanging on a house wall, above the skirting/rail: not floors, not the walls themselves */
   const thinZ=sz.z<=.12&&b.min.z>-.3&&b.max.z<.35,thinX=sz.x<=.12&&b.min.x>-.3&&b.max.x<.35;
   if(!(thinZ||thinX)||b.min.y<1.1||sz.y>1.6||Math.max(sz.x,sz.z)>3.2||b.min.x<-.3||b.max.x>16.3)return;
   cand.push({o,b})})}
 function tick(){try{
  const s=PL.map(q=>q.t+q.x+','+q.z+','+q.r).join('|');
  if(s===sig&&scene.children.length===kids)return;sig=s;kids=scene.children.length;
  hidden.forEach(o=>{o.visible=true});hidden.clear();
  if(!PL.length)return;
  collect();
  const items=PL.filter(q=>q.m).map(q=>{const b=new THREE.Box3().setFromObject(q.m);b.expandByScalar(.01);return b});
  cand.forEach(c=>{if(items.some(b=>b.intersectsBox(c.b))){c.o.visible=false;hidden.add(c.o)}});
 }catch(e){console.warn('dev wall clear',e)}}
 setInterval(tick,500);
})();
