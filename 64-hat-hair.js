/* ---------- v26.37: hats hide the hair under them ----------
   buildChar (03-character.js) tags every hair mesh with userData.hair. When a hat is worn, this last wrapper
   tucks the hair under it: hair that sits wholly above the hat's brim line is hidden, hair that crosses the
   brim line is cut off at it, and hair below the brim (long hair at the back, pigtails, braids, side locks,
   the fringe under a cap) stays as it was. Open hats (headband, visor, sweatband) leave the hair alone.
   HAT_BRIM is the height in head space (the head is a .55 box centred on 0, so its top is at .275) where each
   hat style meets the head, by hat style (c.hts, or the old default style for each colour). */
const HAT_BRIM={0:.28,1:.22,2:.29,3:.29,4:null,5:.3,6:.28,7:.3,8:.22,9:null,10:.3,11:.29,12:.285,13:.24,14:.28,15:.31,16:.255,17:.285,18:.28,19:null,20:.28};
const hatStyle=c=>c&&c.ht>=0?(c.hts!==undefined?c.hts:[0,1,2,0,3,1,2][c.ht]??0):null;
function hatBrim(c){const s=hatStyle(c);if(s==null)return null;return s in HAT_BRIM?HAT_BRIM[s]:.28}
/* pixel portraits (fig0 in 22-v8...js): the row the hat's crown ends on, hair above it is clipped */
function hatClip2D(c){const s=hatStyle(c);if(s==null||s==4||s==9||s==19)return null;return[4,4,4,3][s]??1}
const HHV=new THREE.Vector3();
function tuckHair(h,brim){h.children.forEach(m=>{if(!m.isMesh||!m.userData.hair||!m.geometry)return;const G=m.geometry;if(!G.boundingBox)G.computeBoundingBox();const bb=G.boundingBox;
 m.updateMatrix();let lo=1e9,hi=-1e9;for(let i=0;i<8;i++){HHV.set(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z).applyMatrix4(m.matrix);lo=Math.min(lo,HHV.y);hi=Math.max(hi,HHV.y)}
 if(hi<=brim+.002)return;
 if(lo>=brim-.012){m.visible=false;return}
 const flat=Math.abs(m.rotation.x)<1e-4&&Math.abs(m.rotation.z)<1e-4;
 if(!flat){if((lo+hi)/2>brim)m.visible=false;return}
 const gh=bb.max.y-bb.min.y;if(gh<=0)return;const sy=(brim-lo)/gh;m.scale.y=sy;m.position.y=lo-bb.min.y*sy;m.updateMatrix()})}
{const bc9=buildChar;buildChar=function(c){const r=bc9(c);try{const b=hatBrim(c);if(b!=null){const h=xHead(r.g);if(h)tuckHair(h,b)}}catch(e){console.warn('hat hair',e)}return r}}
