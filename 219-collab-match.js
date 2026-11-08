/* ---------- v49.94.7: collab suggestions and incoming DMs are matched to your monthly listeners at every size ----------
   Before: the Suggested people list showed every artist at or below your size in roster order (at 20k that was a wall of tiny
   artists and nobody your size), and incoming DMs fell back to far-smaller or far-bigger artists when the roster was thin near you.
   Now, at any listener count (low, mid, high, very high):
   1. Suggested people = artists from 1/8x to 6x your size, closest first (padded with the nearest few if fewer than 5 fit).
      Searching by name still finds anyone up to 6x your size or smaller. Admins still see everyone.
   2. Incoming DMs: the 6 artists nearest your size (within 20x either way) always get at least a normal chance to write, so there is
      always someone comparable. The existing curve (dmWeight) still decides everyone else. Nothing is saved for this. */
function collabNear(){const L=Math.max(S.listeners||0,5),k=L+'|'+ART.length;if(collabNear.k===k)return collabNear.v;
 const v=ART.map((a,i)=>[i,Math.abs(Math.log10(Math.max(1,a[2])/L))]).sort((p,q)=>p[1]-q[1]);collabNear.k=k;return collabNear.v=v}
function collabSuggest(q){const L=Math.max(S.listeners||0,5),near=collabNear(),ok=i=>!S.msgs.some(m=>m.a===i);
 if(L>=1e12)return ART.map((a,i)=>i).filter(i=>ok(i)&&(!q||ART[i][0].toLowerCase().includes(q)));
 if(q)return near.map(p=>p[0]).filter(i=>ok(i)&&ART[i][0].toLowerCase().includes(q)&&(ART[i][2]<=L||ART[i][2]/L<=6));
 const band=near.filter(p=>ok(p[0])&&ART[p[0]][2]/L>=.125&&ART[p[0]][2]/L<=6).slice(0,12).map(p=>p[0]);
 if(band.length>=5)return band;
 near.forEach(p=>{if(band.length<5&&ok(p[0])&&!band.includes(p[0])&&ART[p[0]][2]/L<=25)band.push(p[0])});return band}
{const w0=dmWeight;dmWeight=function(i){const w=w0.apply(this,arguments);if(!(w>0)||!S)return w;
  const L=Math.max(S.listeners||0,5),a=ART[i];if(!a||a[2]/L>20||a[2]/L<.05)return w;
  const r=collabNear().filter(p=>ART[p[0]][2]/L<=20&&ART[p[0]][2]/L>=.05&&(typeof dmGateOK!='function'||dmGateOK(p[0]))&&(typeof dmTaste!='function'||dmTaste(p[0])>0)).slice(0,6).findIndex(p=>p[0]===i);
  return r>=0?Math.max(w,1):w}}
