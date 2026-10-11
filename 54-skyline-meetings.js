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
function meetLoc(m){if(!m||m.a===undefined)return'home';if(!m.loc||!MEETL[m.loc]){const a=ART[m.a];m.loc=a[7]?'skyline':(a[2]<=400?'home':'street');if(m.state!=1&&typeof MEETPOOL!='undefined'){const P0=MEETPOOL[a[7]?1:0];m.loc=P0[hs(a[0]+':'+m.id)%P0.length]}}return m.loc}
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

/* ===== v26.28.0: more places to meet =====
   Artists now pick where to meet (Skyline Tower, Pulse Records HQ, the City Cafe, the Music Store, the Radio Station,
   Central Park, outside your house or by the shops) and you can move the meeting from the chat. They really wait there. */
Object.assign(MEETL,{
 pulse:{n:'Pulse Records HQ, floor 3 (Mixing Suites)',p:'at Pulse Records HQ',t:'at Pulse Records HQ in the city, 3rd floor mixing suites (take the elevator)',tw:1,fl:3,sp:[[8.6,11.6],[13.4,11.6],[11,10.2],[6,12.4],[16,12.4]]},
 cafe:{n:'City Cafe',p:'at the City Cafe',t:'at the City Cafe in the city, inside by the tables',shop:3,sp:[[8.3,4.6],[1.7,4.5],[3.4,6.9]]},
 store:{n:'Music Store',p:'at the Music Store',t:'at the Music Store in the city, inside by the guitars',shop:4,sp:[[7.6,4.5],[3.8,6.7],[6.4,6.7]]},
 radio:{n:'Radio Station',p:'at the Radio Station',t:'at the Radio Station on your street, in the studio',shop:5,sp:[[7.8,5.6],[4.6,6.5],[8.6,4.2]]},
 park:{n:'Central Park',p:'in Central Park',t:'in Central Park, by the square in the middle',out:k=>parkSpot(k)}});
MEETL.skyline.p='at Skyline Tower';MEETL.home.p='outside my place';MEETL.street.p='by the shops on my street';
/* what each artist suggests: [smaller artists, big artists] */
const MEETPOOL=[['home','cafe','park','store','radio','street','cafe'],['skyline','pulse','cafe','radio','skyline','store']];
const MEETORD=['skyline','pulse','cafe','store','radio','park','home','street'];
function meetLocTxt(m){return MEETL[meetLoc(m)].t}
/* a free spot near the middle of Central Park (look for open ground instead of assuming the park's layout) */
let PARKS=null;
function parkSpot(k){if(!PARKS){PARKS=[];const p=POIS.find(q=>q[2]=='Central Park'),cx=p?p[0]:WX(95),cz=p?p[1]:WZ(-92),
  bad=(x,z)=>cols.some(c=>x+.7>c[0]&&x-.7<c[2]&&z+.7>c[1]&&z-.7<c[3])||ROADS.some(r=>x+3>r[0]&&x-3<r[2]&&z+3>r[1]&&z-3<r[3])||(LK&&x>LK[0]-1&&x<LK[2]+1&&z>LK[1]-1&&z<LK[3]+1)||(typeof CTD!='undefined'&&CTD.trees&&CTD.trees.some(t=>Math.hypot(t[0]-x,t[1]-z)<1.3))||PARKS.some(q=>Math.hypot(q[0]-x,q[1]-z)<2.2);
  for(let r=5.5;r<40&&PARKS.length<5;r+=.8)for(let a=0;a<24&&PARKS.length<5;a++){const x=cx+Math.cos(a*Math.PI/12+.4)*r,z=cz+Math.sin(a*Math.PI/12+.4)*r;if(!bad(x,z))PARKS.push([x,z])}
  if(!PARKS.length)PARKS.push([cx+4,cz+4])}return PARKS[k%PARKS.length]}
/* the City Cafe and the Music Store had no way in from the street: they get the ground floor of two city towers.
   twHook (22-v8...js) is called for every tower with its layout lot; the cafe takes the corner tower west of the plaza,
   the music store the tower on the main road at the west end of the city. */
const SHOPT={};
{const h0=twHook;twHook=function(x0,z0,cx,fz,w,h){h0(x0,z0,cx,fz,w,h);const c=CT[CT.length-1];if(x0==494&&z0==22&&!SHOPT.cafe)SHOPT.cafe=c;if(x0==494&&z0==-37&&!SHOPT.store)SHOPT.store=c}}
function shopDoors(){[['cafe',3,'CITY CAFE','City Cafe','#ffb070'],['store',4,'MUSIC STORE','Music Store','#c58cff']].forEach(([k,i,sg,nm,col])=>{const c=SHOPT[k];if(!c||c.door)return;c.door=1;const cx=(c.x0+c.x1)/2,fz=c.z1;
  /* the tower's own door box goes on the real facade (cdTower then fades it with the tower) */
  for(const q in SBC){const L=SBC[q];for(let j=L.length-1;j>=0;j--){const e=L[j];if(e[3]=='#2a1f1a'&&Math.abs(e[0]-2)<.01&&Math.abs(e[1]-1.8)<.01&&Math.abs(e[4]-cx)<1.5)L.splice(j,1)}}
  SB(2,1.8,.1,'#2a1f1a',cx,.9,fz+.05);c.sign=sg;
  const s=SHOPS[i];if(s&&s.name==nm){s.cx=cx;s.ez=fz+1.6}INT.push({x:cx,z:fz+1.4,r:1.6,l:'Enter '+nm,a:()=>enterShop(i)});POIS.push([cx,fz+5,nm,col])})}
{const f=flushSB;flushSB=function(){warpWorld();try{shopDoors()}catch(e){console.error('shopDoors',e)}f()}}
/* telling you who is waiting when you walk into a shop */
let MEETIN=null;
{const u0=update;update=function(dt){u0(dt);const k=IN?IN.i:null;if(k===MEETIN)return;MEETIN=k;if(k==null)return;ART_M.forEach(o=>{const D=MEETL[o.where];if(D&&D.shop===k)say(o.name+' is here waiting for you.')})}}
/* Messages: pick or change where you meet */
const MEETMV=['sure, see you {loc}.','ok, switching it up. see you {loc}.','works for me. see you {loc}.','done, I will be {loc}.'];
function setMeetLoc(id,v,quiet){const m=S.msgs.find(x=>x.id==id);if(!m||!MEETL[v]||m.a===undefined||m.blocked)return;if(meetLoc(m)==v)return;m.loc=v;const a=ART[m.a];
 if(!quiet)m.log.push({f:'me',t:'can we meet '+MEETL[v].p+' instead?',d:S.day});m.log.push({f:'a',t:deco(a,fill(pick(MEETMV),ctxOf(m))),d:S.day});if(m.state==1)syncArt();snd('pop');if(mode=='pc'&&typeof pcR=='function')pcR()}
{const pm=PA.msg;PA.msg=function(){const h=pm.apply(this,arguments);try{const m=S.msgs.find(x=>x.id==S.chat);if(typeof h!='string'||!m||m.a===undefined||m.blocked||!(m.state==1||(m.state==0&&m.stage>=1)))return h;const L=meetLoc(m);
  const bar=`<div class=mloc><span>Meet at</span><select onchange="setMeetLoc(${m.id},this.value)">${MEETORD.map(k=>`<option value="${k}" ${k==L?'selected':''}>${esc(MEETL[k].n)}</option>`).join('')}</select><small>${m.state==1?'booked':'their pick, change it if you like'}</small></div>`;
  let i=h.indexOf('<div class=cfm>');if(i<0)i=h.indexOf('<div class=cin>');return i<0?h:h.slice(0,i)+bar+h.slice(i)}catch(e){return h}}}
{const st=document.createElement('style');st.textContent='.mloc{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:6px 12px;border-top:1px solid #0002;font-size:13px}.mloc select{flex:1;min-width:160px;max-width:320px;background:#fff;color:#2a1a2e;border:2px solid #e7a5c9;border-radius:999px;padding:5px 12px;font:inherit;font-size:13px}.mloc span{font-weight:700}.mloc small{opacity:.7}';document.head.appendChild(st)}
/* ...or by just saying it in the chat ("can we meet at the cafe instead?") */
const MEETRX=[['skyline',/skyline/],['pulse',/pulse|records hq|label (hq|office|building)/],['radio',/radio/],['cafe',/caf[eé]|coffee/],['store',/music (store|shop)|guitar (store|shop)|instrument (store|shop)/],['park',/\bpark\b/],['street',/my street|the shops/],['home',/\bmy (house|place|door|front door|home)\b|outside my/],['studio',/studio/]];
{const r0=reply;reply=function(m,t){try{const n=String(t).toLowerCase();if(m&&m.a!==undefined&&!m.blocked&&(m.state==1||(m.state==0&&m.stage>=1))&&/\b(meet|meeting|see you|instead|how about|what about|lets|let'?s|can we|could we|go to|at the|in the|change|move|switch|rather|prefer|where)\b/.test(n)){
  let L=null;for(const[k,rx]of MEETRX)if(rx.test(n)){L=k;break}if(L=='studio')L=meetLoc(m)=='skyline'?'skyline':'pulse';
  if(L){TY=0;if(L==meetLoc(m)){m.log.push({f:'a',t:deco(ART[m.a],fill('yep, see you {loc}.',ctxOf(m))),d:S.day});return}setMeetLoc(m.id,L,1);return}}}catch(e){console.error('meet place',e)}return r0(m,t)}}
