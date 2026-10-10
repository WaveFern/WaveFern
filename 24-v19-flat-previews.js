/* ---------- v19 flat previews ---------- */
const ISOC={};
function isoP(t,key,sz=190){const ck=t+':'+key;if(ISOC[ck])return ISOC[ck];let url='';try{const L=t=='h'?hseb(+key):clb(String(key));const q=[];L.forEach(a=>{let[w,h,d,c,x,y,z]=a;c=String(c||'#888').replace('*','');if(c[0]!='#')c='#888888';q.push({w,h,d,c,x,y,z})});
 const P=(X,Y,Z)=>[(X-Z)*.866,(X+Z)*.5-Y],polys=[];q.forEach(b=>{const x0=b.x-b.w/2,x1=b.x+b.w/2,y0=b.y-b.h/2,y1=b.y+b.h/2,z0=b.z-b.d/2,z1=b.z+b.d/2,k=(b.x+b.z)*.5+b.y*.7+(b.w+b.d)*.02;
  polys.push({k,c:'#'+new THREE.Color(b.c).lerp(new THREE.Color('#ffffff'),.14).getHexString(),p:[P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)]},{k:k+.001,c:dk(b.c,.82),p:[P(x1,y1,z1),P(x1,y1,z0),P(x1,y0,z0),P(x1,y0,z1)]},{k:k+.002,c:dk(b.c,.64),p:[P(x0,y1,z1),P(x1,y1,z1),P(x1,y0,z1),P(x0,y0,z1)]}) });
 let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;polys.forEach(o=>o.p.forEach(v=>{mnx=Math.min(mnx,v[0]);mxx=Math.max(mxx,v[0]);mny=Math.min(mny,v[1]);mxy=Math.max(mxy,v[1])}));
 const sc=(sz-24)/Math.max(mxx-mnx,mxy-mny,.01),cv=document.createElement('canvas');cv.width=cv.height=sz;const g=cv.getContext('2d');const ox=(sz-(mxx-mnx)*sc)/2-mnx*sc,oy=(sz-(mxy-mny)*sc)/2-mny*sc;
 g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(sz/2,sz-10,sz*.3,6,0,0,7);g.fill();
 polys.sort((a,b)=>a.k-b.k).forEach(o=>{g.beginPath();o.p.forEach((v,i)=>i?g.lineTo(v[0]*sc+ox,v[1]*sc+oy):g.moveTo(v[0]*sc+ox,v[1]*sc+oy));g.closePath();g.fillStyle=o.c;g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.7;g.stroke()});url=cv.toDataURL()}catch(e){url=''}
 return ISOC[ck]=`<img src="${url}" style="width:${sz}px;height:${sz}px;display:block;margin:0 auto">`}
{const st=document.createElement('style');st.textContent='.thz .m,.prr .m,.thc2 .m{color:#555!important}.thp{min-height:200px;display:flex;align-items:center;justify-content:center}.thz .thc2,.prr{box-shadow:4px 4px 0 #0006}';document.head.appendChild(st)}

{const st=document.createElement("style");st.textContent=".site{display:block;width:100%;max-width:none;border:0}";document.head.appendChild(st)}

