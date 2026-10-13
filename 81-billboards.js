/* ---------- v26.61: billboards (v26.68: higher bars, most on the left) ----------
   Billboards stand beside the main city roads. They rotate every 10 seconds through roster artists with
   ROSTER_LIS+ monthly listeners (the famous ones, Panic Man Dan included). Once you reach PLAYER_LIS monthly
   listeners, your own name joins the rotation. Most sit on the right of the road's way of travel (about 4 in 5).
   The ad is drawn on a canvas, so nothing here is saved. */
const BB={MAX:6,ROAD_MIN:40,ROSTER_LIS:5000,PLAYER_LIS:10000,OTHER_EVERY:5,EVERY:10,list:[],t:0,k:0,mine:false};
/* the road helpers record each road segment as the city is built, so billboards can sit beside the longest ones */
const BB_ROADS=[];
{const h0=roadH;roadH=function(zr,x0,x1){BB_ROADS.push({h:1,zr,x0,x1});return h0.apply(this,arguments)}}
{const v0=roadV;roadV=function(xr,z0,z1){BB_ROADS.push({h:0,xr,z0,z1});return v0.apply(this,arguments)}}
function bbHue(n){let h=0;for(const c of String(n))h=(h*31+c.charCodeAt(0))>>>0;return`hsl(${h%360} 55% 26%)`}
function bbAds(){const ads=ART.filter(a=>a[2]>=BB.ROSTER_LIS).map(a=>({n:a[0],g:a[1],c:bbHue(a[0]),tag:'New music out now'}));
 if(S.listeners>=BB.PLAYER_LIS)ads.push({n:S.artist||'Your name',g:'Your music',c:'#1a6b4a',tag:S.listeners.toLocaleString()+' monthly listeners'});
 return ads}
function bbDraw(cv,ad){const x=cv.getContext('2d'),W=cv.width,H=cv.height,f=(sz,w)=>`${w?'bold ':''}${sz}px Arial,Helvetica,sans-serif`;
 const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,ad.c);g.addColorStop(1,'#0b0f0d');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';let fs=56;x.font=f(fs,1);while(fs>20&&x.measureText(ad.n).width>W-40){fs-=2;x.font=f(fs,1)}
 x.fillText(ad.n,W/2,H*.4);
 x.fillStyle='#e8f3ec';x.font=f(26);x.fillText(ad.g+(ad.tag?'  ·  '+ad.tag:''),W/2,H*.7);
 x.fillStyle='#2fe68a';x.font=f(22,1);x.fillText('ON SPOTIFLY',W/2,H*.88)}
function bbRefresh(){const ads=bbAds();if(!ads.length)return;BB.list.forEach((b,i)=>{const ad=ads[(BB.k+i*2)%ads.length];bbDraw(b.cv,ad);b.tex.needsUpdate=true})}
function bbBuild(spots){spots.forEach(p=>{const G=new THREE.Group();G.position.set(p.x,0,p.z);G.rotation.y=p.th;scene.add(G);
 B(G,.22,3.3,.22,'#4a4f57',-1.5,1.65,0);B(G,.22,3.3,.22,'#4a4f57',1.5,1.65,0);
 B(G,3.9,2.1,.14,'#101214',0,3.5,.02);
 const cv=document.createElement('canvas');cv.width=512;cv.height=256;const tex=new THREE.CanvasTexture(cv);
 const panel=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.8),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));panel.position.set(0,3.5,.11);G.add(panel);
 /* the posts are solid, so cars and people go round them */
 cols.push([p.x-.12,p.z-.12,p.x+.12,p.z+.12]);
 BB.list.push({cv,tex})});
 bbRefresh()}
/* a billboard spot beside road r at fraction f along it, on side sd (+1 or -1 across the road) */
function bbSpot(r,f,sd){let x,z,th;
 if(r.h){x=r.x0+(r.x1-r.x0)*f;z=r.zr+sd*7.6;th=sd>0?Math.PI:0}
 else{z=r.z0+(r.z1-r.z0)*f;x=r.xr+sd*7.6;th=sd>0?-Math.PI/2:Math.PI/2}
 return{x,z,th}}
/* the billboards go beside the longest roads, once per city build.
   A road runs towards +x (east-west roads) or +z (north-south roads). The right of that way of travel is +z or -x,
   so the right side is sd +1 for east-west and -1 for north-south. Most spots take the right side (every fifth one
   goes left), so drivers heading the usual way see them. Falls back to the other side when a spot is blocked. */
function bbPlace(){const len=r=>r.h?r.x1-r.x0:r.z1-r.z0;
 const roads=BB_ROADS.filter(r=>len(r)>=BB.ROAD_MIN).sort((a,b)=>len(b)-len(a)).slice(0,8),spots=[];let n=0;
 for(const r of roads)for(const f of[.35,.7]){
  if(spots.length>=BB.MAX)break;
  const R=r.h?1:-1,right=n++%BB.OTHER_EVERY!=BB.OTHER_EVERY-1,order=right?[R,-R]:[-R,R];
  for(const sd of order){const p=bbSpot(r,f,sd);
   if(hit(p.x,p.z,1.2)||spots.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<25))continue;
   spots.push(p);break}}
 if(spots.length)bbBuild(spots)}
{const bc0=buildCity;buildCity=function(){const r=bc0.apply(this,arguments);try{bbPlace()}catch(e){}return r}}
/* rotation: every 10 seconds, and straight away when you cross the listener threshold */
function bbTick(dt){if(!BB.list.length)return;BB.t+=dt;const mine=S.listeners>=BB.PLAYER_LIS;
 if(BB.t>=BB.EVERY||mine!==BB.mine){if(BB.t>=BB.EVERY){BB.t=0;BB.k++}BB.mine=mine;bbRefresh()}}
{const u=update;update=function(dt){u(dt);try{bbTick(dt)}catch(e){}}}
