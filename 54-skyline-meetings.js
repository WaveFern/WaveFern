/* ===== v26.26.2: Skyline Tower's door stood on the pavement, away from the building =====
   Skyline Tower is built in layout coordinates (21-v7...js buildTower). The road warp (31-wide-roads.js) first trims its front
   back to the pavement edge (the lot poked into the pavement of the road in front) and then widens the roads. The door, the
   SKYLINE TOWER sign and the way in are thin pieces that only slide with the warp, so after v26.11.0 they ended up about 2 m in
   front of the facade, with the entrance out on the road. Once the warp has run, they are put back on the real facade. */
const skyTower=()=>{const X=WX(597);return CT.find(c=>c.h==40&&c.x0<X&&c.x1>X)};
function skyDoorFix(){const c=skyTower();if(!c||c.door)return;const cx=(c.x0+c.x1)/2,fz=c.z1;c.door=1;
 /* the old door box (2.4 x 2.6) out on the pavement */
 for(const k in SBC){const L=SBC[k];for(let j=L.length-1;j>=0;j--){const e=L[j];if(e[3]=='#2a1f1a'&&Math.abs(e[0]-2.4)<.01&&Math.abs(e[1]-2.6)<.01&&Math.abs(e[4]-cx)<1.5)L.splice(j,1)}}
 /* a door on the facade, under the shop-front canopy; 38-city-detail.js cdTower picks it up so it fades with the tower */
 SB(2.2,1.9,.1,'#2a1f1a',cx,.95,fz+.05);c.sign='ENTRANCE';
 WORLD.children.forEach(o=>{if(o.isSprite&&Math.abs(o.position.x-cx)<1.5&&Math.abs(o.position.y-4)<.01&&o.position.z>fz-1&&o.position.z<fz+6)o.position.z=fz+.3});
 INT.forEach(q=>{if(q.l=='Enter Skyline Tower'){q.x=cx;q.z=fz+1.4}});
 const s=SHOPS[7];if(s&&s.name=='Skyline Tower'){s.cx=cx;s.ez=fz+1.6}
 POIS.forEach(p=>{if(p[2]=='Skyline Tower'){p[0]=cx;p[1]=fz+4}})}
/* a tower can carry its own shop-front sign (c.sign) instead of a random one */
if(typeof cdTower=='function'){const c0=cdTower;cdTower=function(c){const n=SGN.q.length;c0(c);if(c.sign&&SGN.q.length>n){const q=SGN.q[SGN.q.length-1];q[0]=sgnRow(c.sign);q[5]=sgnW(c.sign,q[6])}}}
{const f=flushSB;flushSB=function(){warpWorld();try{skyDoorFix()}catch(e){console.error('skyDoorFix',e)}f()}}

/* ===== v26.26.3: artists were missing at Skyline Tower meetings =====
   22-v8...js stands big artists on floor 5 of Skyline Tower (inside the tower's floor group), but 31-wide-roads.js then sent
   every artist through the road warp as if they stood outside. That pushed them about 40 m off the floor, into empty space,
   together with their "Record with" spot, so nobody was there and the meeting never started. Artists are now placed last,
   from where the meeting is booked, and only outdoor spots use warped coordinates. */
/* meeting places: tw = TOWERS index and fl = floor (spots in floor coordinates), or out = an outdoor spot function (world coordinates) */
const MEETL={
 skyline:{n:'Skyline Tower, floor 5',t:'inside Skyline Tower in the city centre, 5th floor recording floor (take the elevator), by the sofas',tw:0,fl:5,sp:[[9,13.4],[11,14.6],[13,13.4],[15,14.6],[7,14.6]]},
 home:{n:'Outside your front door',t:'right outside your front door',out:k=>[WX(19+k*2.4),WZ(13.2)]},
 street:{n:'By the shops on your street',t:'on the sidewalk by the shops, just east of your place',out:k=>[WX(40+k*2.4),WZ(13.2)]}};
/* where a booked chat meets; chats from before v26.27 have no m.loc and keep the place the artist already named */
function meetLoc(m){if(!m||m.a===undefined)return'home';if(!m.loc||!MEETL[m.loc]){const a=ART[m.a];m.loc=a[7]?'skyline':(a[2]<=400?'home':'street')}return m.loc}
/* world spot for the k-th artist (0-based) meeting at place L: [x, z, parent] */
function meetSpot(L,k){const D=MEETL[L];
 if(D.out){const[x,z]=D.out(k);return[x,z,scene]}
 if(D.tw!=null){const T=TOWERS[D.tw],t0=TW;if(!T.groups)buildTF(T);TW=t0;const s=D.sp[k%D.sp.length],o=T.base+(D.fl-1)*26;return[o+s[0],320+s[1]+Math.floor(k/D.sp.length)*.01,T.groups[D.fl-1]]}
 const s=D.sp[k%D.sp.length],ox=SHOPS[D.shop].ox;return[ox+s[0],320+s[1],D.g?D.g():scene]}
/* indoors the 7 m gold beacon pokes through the ceiling view: swap it for a glowing ring on the floor */
function meetBeacon(o,inside){const g=o.m;let b=g.userData.bcn;if(!b){b=g.children.find(c=>c.isMesh&&c.geometry&&c.geometry.parameters&&c.geometry.parameters.height==7);g.userData.bcn=b||1}
 let r=g.userData.ring;if(!r){r=g.userData.ring=new THREE.Group();[[1.5,.12,0,-.7],[1.5,.12,0,.7],[.12,1.5,-.7,0],[.12,1.5,.7,0]].forEach(q=>B(r,q[0],.03,q[1],'*ffe066',q[2],.02,q[3]));g.add(r)}
 if(b&&b!==1)b.visible=!inside;r.visible=!!inside}
function placeArt(){const n={},t0=TW;ART_M.forEach(o=>{const m=S.msgs.find(x=>x.a===o.i&&x.state==1),L=meetLoc(m),k=n[L]=(n[L]||0);n[L]++;
  const[x,z,par]=meetSpot(L,k);if(o.m.parent!==par){if(o.m.parent)o.m.parent.remove(o.m);par.add(o.m)}o.m.position.set(x,0,z);o.x=x;o.z=z;o.wp=1;o.where=L;meetBeacon(o,!outdoor(z))});TW=t0}
{const s0=syncArt;syncArt=function(){const t0=TW;s0();TW=t0;try{placeArt()}catch(e){console.error('placeArt',e)}}}
/* walking up to the artist starts the meeting chat (once per visit; E works too) */
{const u0=update;update=function(dt){u0(dt);if(mode!='play'||MEET||PAUSED)return;ART_M.forEach(o=>{if(!o.m.parent)return;const d=Math.hypot(P.x-o.x,P.z-o.z);if(d>4)o.hi=0;else if(d<1.7&&!o.hi){o.hi=1;collab(o)}})}}
/* stepping into a tower lobby tells you which floor your artist is waiting on */
{const sf=setFloor;setFloor=function(n,arr){sf(n,arr);if(!arr||n!=1||!TW)return;const ti=TOWERS.indexOf(TW);ART_M.forEach(o=>{const D=MEETL[o.where];if(D&&D.tw===ti)say(o.name+' is waiting for you on floor '+D.fl+' ('+TW.names[D.fl-1]+'). Take the elevator.')})}}
