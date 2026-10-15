/* ===== v26.128: Spotifly "Browse artists" =====
   Every artist in the game plus ~130 more, famous and made-up (names only; songs and albums are invented). Search or filter by genre, open an artist's
   page to see monthly listeners, Popular songs with streams, albums and an album view, and play their music on the
   procedural beat system. Everything is worked out from the artist's name (a seed), so nothing is saved and the numbers
   never change on reload; they only creep up a little each game day. Read-only: no following or collabs from here. */
/* extra artists on top of everyone in the game's own ART list (Messages / collabs): [name, genre, monthly listeners] */
const BRX=[
 ['Taylor Swift','Pop',98e6],['Bad Bunny','Latin',80e6],['Bruno Mars','Pop',70e6],['Rihanna','Pop',62e6],['Ariana Grande','Pop',78e6],['Justin Bieber','Pop',66e6],['Dua Lipa','Pop',60e6],['Harry Styles','Pop',50e6],['Olivia Rodrigo','Pop',44e6],['Sabrina Carpenter','Pop',58e6],
 ['Post Malone','Hip-Hop',52e6],['Travis Scott','Hip-Hop',46e6],['J. Cole','Rap',34e6],['Eminem','Rap',72e6],['Kanye West','Hip-Hop',38e6],['Jay-Z','Rap',24e6],['Nicki Minaj','Hip-Hop',32e6],['Cardi B','Hip-Hop',27e6],['Future','Hip-Hop',30e6],['21 Savage','Rap',29e6],['Lil Wayne','Rap',26e6],['Snoop Dogg','Rap',22e6],['50 Cent','Rap',19e6],['Tyler, the Creator','Hip-Hop',25e6],['A$AP Rocky','Hip-Hop',18e6],['Doja Cat','Pop',45e6],['Megan Thee Stallion','Hip-Hop',20e6],
 ['Beyonce','R&B',48e6],['SZA','R&B',43e6],['Frank Ocean','R&B',21e6],['Usher','R&B',16e6],['Alicia Keys','R&B',15e6],['Brent Faiyaz','R&B',14e6],['Daniel Caesar','R&B',9e6],
 ['Coldplay','Rock',68e6],['Imagine Dragons','Rock',54e6],['Arctic Monkeys','Rock',40e6],['Foo Fighters','Rock',20e6],['Green Day','Rock',24e6],['Metallica','Rock',23e6],['Queen','Rock',50e6],['The Beatles','Rock',35e6],['Nirvana','Rock',28e6],['Red Hot Chili Peppers','Rock',36e6],['Linkin Park','Rock',33e6],['AC/DC','Rock',21e6],['Fleetwood Mac','Rock',19e6],
 ['Calvin Harris','Electronic',30e6],['David Guetta','Electronic',37e6],['Daft Punk','Electronic',17e6],['Skrillex','Electronic',12e6],['Marshmello','Electronic',23e6],['Avicii','Electronic',25e6],['Kygo','Electronic',16e6],['Deadmau5','Electronic',6e6],['Disclosure','Electronic',5e6],
 ['Morgan Wallen','Country',31e6],['Luke Combs','Country',20e6],['Chris Stapleton','Country',13e6],['Zach Bryan','Country',18e6],['Johnny Cash','Country',9e6],['Taylor Pardee','Country',2e6],
 ['Karol G','Latin',39e6],['Shakira','Latin',41e6],['J Balvin','Latin',35e6],['Rosalia','Latin',15e6],['Peso Pluma','Latin',22e6],
 ['Mac DeMarco','Indie',6e6],['Tame Impala','Indie',29e6],['Phoebe Bridgers','Indie',8e6],['Bon Iver','Folk',10e6],['Fleet Foxes','Folk',4e6],['Noah Kahan','Folk',21e6],['Hozier','Folk',24e6],['Adele','Pop',55e6],['Lana Del Rey','Pop',47e6],['Elton John','Pop',30e6],['Michael Jackson','Pop',49e6],['Stevie Wonder','R&B',11e6],['Nujabes','Lo-fi',4e6],['Jinsang','Lo-fi',1.2e6],
 /* made-up artists */
 ['Drayke Monroe','R&B',48e6],['Vex Valentine','Pop',14e6],['Kendall Lamarr','Rap',36e6],['Velvet Harbor','Lo-fi',3.9e6],['Saffron Bell','Country',2.7e6],['Marlow & The Static','Rock',17e6],['Cassidy Moon','R&B',8.1e6],
 ['Pixel Pete','Hip-Hop',1.2e6],['Ozzy Rainier','Rock',5.1e6],['DJ Quartz','Electronic',11e6],['Lumi Fields','Pop',7.3e6],['Hank Dusty','Country',4.8e6],['Sleepy Orchard','Lo-fi',2.4e6],
 ['Kid Kaboom','Hip-Hop',9.4e6],['Nyla Knox','R&B',6.2e6],['Rowdy Rae','Rock',3.1e6],['Big Mood Marcus','Rap',4.4e6],['Tito Thunder','Electronic',2.2e6],['Mina Marble','Lo-fi',1.6e6],['Jax Jetstream','Electronic',5.8e6],
 ['Juniper Vale','Folk',2.9e6],['Cobalt Kid','Hip-Hop',7.7e6],['Rue Sinclair','Indie',3.3e6],['Moxie Montoya','Latin',9.9e6],['Echo Valley','Indie',1.8e6],['Gus Gravel','Country',1.1e6],['Neon Sparrow','Electronic',4.1e6],['Ivy Starlight','Pop',12e6],['Tommy Two-Tone','Rap',2.6e6],['Dusty Rhodes Jr.','Rock',6.6e6],['Miso Soup','Lo-fi',900e3],['Blue Hour','R&B',5.3e6],['Captain Kettle','Folk',700e3],['Nova Nightly','Pop',15e6],['Bassline Betty','Electronic',3.6e6],['Wolfgang Wren','Rock',2.1e6],['Cinder Mae','Country',3.4e6],['Lil Marshmallow','Hip-Hop',8.8e6],['Sol Navarro','Latin',6.1e6],['Opal Rivers','R&B',2.2e6],['The Static Pigeons','Indie',1.4e6],['Yung Pickle','Rap',3.8e6],['Halo Hannigan','Pop',5.5e6]];
/* the whole roster: every artist in the game first (their real in-game face and listeners), then the extras with a face made from their name */
let BRAL=null;
function BRL(){if(BRAL)return BRAL;const seen=new Set(),L=[];
 const add=(n,g,ml,face)=>{const k=String(n).toLowerCase();if(seen.has(k))return;seen.add(k);L.push([n,g,ml,face])};
 try{ART.forEach(a=>add(a[0],a[1],Math.max(1,a[2]),a[4]))}catch(e){}
 try{if(typeof RVN!='undefined')RVN.forEach(n=>add(n,['Pop','Hip-Hop','R&B','Rock','Rap','Electronic','Lo-fi','Electronic'][RVN.indexOf(n)%8],(2+brHash(n)%90/10)*1e6))}catch(e){}
 BRX.forEach(x=>add(x[0],x[1],x[2],null));return BRAL=L}
const BRFC=new Map();
function brFace(i){if(BRFC.has(i))return BRFC.get(i);const x=BRL()[i];let u='';try{const cfg=x[3]||lk(x[0]);u=(typeof pf2=='function'?pf2(cfg):pfp(cfg))}catch(e){u=sfCover({id:-(i+1)*7,g:x[1]})}BRFC.set(i,u);return u}
const BRW={a:['Midnight','Golden','Broken','Neon','Paper','Velvet','Silent','Electric','Wild','Lazy','Burning','Cold','Sweet','Lost','Rolling','Crystal','Heavy','Summer'],
 b:['Roads','Hearts','Lights','Dreams','Waves','Skies','Rivers','Echoes','Streets','Moons','Fires','Letters','Games','Ghosts','Stars','Flowers','Cities','Seasons'],
 c:['Tonight','Again','Forever','Alone','Home','Gone','Tomorrow','Nowhere','Too Late','On Repeat','For You','In Blue','At Dawn','No More']};
const brHash=s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const brRng=seed=>{let h=seed>>>0||1;return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return(h>>>0)/4294967296}};
const BRC=new Map(),SFB={q:'',g:'All',a:null,al:null,all:0,Q:[]};
function brGrow(){return 1+.0012*(typeof S=='object'&&S?S.day||0:0)}
function brArtist(i){if(BRC.has(i))return BRC.get(i);const [name,g,ml]=BRL()[i],r=brRng(brHash('br|'+name)),T=[],used=new Set();
 const title=()=>{for(let k=0;k<20;k++){const f=r(),t=f<.4?BRW.a[r()*18|0]+' '+BRW.b[r()*18|0]:f<.7?BRW.b[r()*18|0].slice(0,-1)+' '+BRW.c[r()*14|0]:f<.85?BRW.a[r()*18|0]+' '+BRW.c[r()*14|0]:'Not '+BRW.a[r()*18|0];if(!used.has(t)){used.add(t);return t}}return'Untitled '+used.size};
 const n=18+(r()*7|0),w=[];for(let k=0;k<n;k++)w.push(Math.pow(r(),2.4)+.04);const sw=w.reduce((a,b)=>a+b,0);
 for(let k=0;k<n;k++)T.push({id:-(i*100+k+1),title:title(),g,genre:g,seed:brHash(name+'#'+k),an:name,base:ml*28*w[k]/sw,br:1,i,k});
 const A=[],ord=T.map((_,k)=>k).sort((a,b)=>a-b),na=2+(r()*3|0);let p=0;
 for(let a=0;a<na;a++){const cnt=a==na-1?n-p:Math.max(5,Math.min(10,Math.round(n/na)));const ids=ord.slice(p,p+cnt);p+=cnt;if(!ids.length)break;
  A.push({id:-(i*100+90+a),name:a==0&&r()<.4?name.split(' ')[0]:title(),yr:2015+(r()*10|0)+a,songs:ids,g,i,a})}
 const o={i,name,g,ml,T,A,acc:['#5a1414','#14385a','#3a145a','#14503a','#5a3a14','#5a1446'][brHash(name)%6]};BRC.set(i,o);return o}
const brStr=(s)=>Math.round(s.base*brGrow());
const brML=a=>Math.round(a.ml*brGrow());
const brPop=a=>a.T.slice().sort((x,y)=>y.base-x.base);
const brIc=o=>sfCover({id:o.id,g:o.g||'Pop'});
function brPlay(i,k){const a=brArtist(i),s=a.T[k];if(!s)return;const c=sfCur();if(c&&c.src===s)return sfToggle();
 SFB.Q=(SFB.al!=null?a.A[SFB.al].songs.map(j=>a.T[j]):brPop(a).slice(0,10)).map(x=>x.k);if(!SFB.Q.includes(k))SFB.Q.push(k);SFB.qi=i;sfStart(s,[])}
function brBig(i){const a=brArtist(i),c=sfCur();if(c&&c.src&&c.src.br&&c.src.i==i)return sfToggle();
 const L=SFB.al!=null?a.A[SFB.al].songs.map(j=>a.T[j]):brPop(a).slice(0,10);const s=SPQ.sh?L[Math.random()*L.length|0]:L[0];SFB.Q=L.map(x=>x.k);SFB.qi=i;sfStart(s,[])}
/* next / previous / auto-advance for artist songs (your own songs keep the original logic) */
{const s0=sfStep;sfStep=function(d,auto){const c=sfCur();if(!c||!c.src||!c.src.br)return s0.apply(this,arguments);const s=c.src,a=brArtist(s.i);
 if(d<0&&sfEl(c)>3)return sfStart(s);if(auto&&SPQ.rp)return sfStart(s);const Q=SFB.Q.length?SFB.Q:[s.k];let j=Q.indexOf(s.k);
 if(SPQ.sh&&Q.length>1){let n;do n=Math.floor(Math.random()*Q.length);while(n==j);j=n}else j+=d;
 if(j<0)j=0;if(j>=Q.length){if(auto){Beats.stop(.6);pcR();return}j=0}sfStart(a.T[Q[j]],[])}}
{const i0=sfInfo;sfInfo=function(c){const r=i0.apply(this,arguments);if(c&&c.src&&c.src.br){r.artist=esc(c.src.an)}return r}}
function brSet(k,v){SFB[k]=v;if(k=='a'){SFB.al=null;SFB.all=0}pcR();const m=document.querySelector('#pc .mn');if(m)m.scrollTop=0}
function brQ(v){SFB.q=v;const e=document.getElementById('brres');if(e)e.innerHTML=brResults()}
const brAcc=a=>a.acc;
function brResults(){const q=SFB.q.trim().toLowerCase(),L=[];BRL().forEach((x,i)=>{if((SFB.g=='All'||x[1]==SFB.g)&&(!q||x[0].toLowerCase().includes(q)||x[1].toLowerCase().includes(q)))L.push(i)});
 L.sort((a,b)=>BRL()[b][2]-BRL()[a][2]);if(!L.length)return'<p class=m>No artists match.</p>';
 return`<div class=brg>${L.map(i=>{const a=brArtist(i);return`<button class=brc onclick="brSet('a',${i})"><img class=brf2 src="${brFace(i)}" alt=""><b>${esc(a.name)}</b><small>${a.g} · ${brML(a).toLocaleString()} monthly listeners</small></button>`}).join('')}</div>`}
function brHome(){const gs=['All',...new Set(BRL().map(x=>x[1]))];
 return`<div class=brh><h1 class=sfh2 style="font-size:32px">Browse artists</h1><div class=brs><input class=brin type=search placeholder="Search artists or genres" aria-label="Search artists" value="${esc(SFB.q)}" oninput="brQ(this.value)"></div>
 <div class=brf>${gs.map(g=>`<button class="brp${SFB.g==g?' on':''}" onclick="brSet('g','${g}')">${g}</button>`).join('')}</div><div id=brres>${brResults()}</div></div>`}
function brRow(a,s,n,c){const on=!!(c&&c.src===s),pl=on&&!c.held;
 return`<div class="sfr brr${on?' on':''}" ondblclick="brPlay(${a.i},${s.k})"><span class=sfn><b>${on?(pl?'<i class=sfeq><i></i><i></i><i></i></i>':n):n}</b><button class=sfnb title="${pl?'Pause':'Play'}" aria-label="${pl?'Pause':'Play'} ${esc(s.title)}" onclick="brPlay(${a.i},${s.k})">${sfIco(pl?'pause':'play')}</button></span>
 <img class=sfrc src="${sfCover(s)}" alt=""><span class=sft><b>${esc(s.title)}</b><small>${esc(a.name)}</small></span><span class=sfs>${brStr(s).toLocaleString()}</span><span class=sfd>${sfTime(sfDur(s))}</span></div>`}
function brArtistPg(){const a=brArtist(SFB.a),c=sfCur(),mine=!!(c&&c.src&&c.src.br&&c.src.i==a.i),pl=mine&&!c.held;
 const back=`<button class=brb onclick="brSet('a',null)">‹ All artists</button>`;
 if(SFB.al!=null){const al=a.A[SFB.al],ss=al.songs.map(j=>a.T[j]),tot=ss.reduce((x,s)=>x+brStr(s),0),dur=ss.reduce((x,s)=>x+sfDur(s),0);
  return`<div class=sfhd style="--acc:${a.acc};height:240px"><img class=sfart src="${brIc(al)}" alt=""><div class=sfhi><button class=brb onclick="brSet('al',null)">‹ ${esc(a.name)}</button><h1 class=sfnm style="font-size:clamp(30px,5vw,60px)!important">${esc(al.name)}</h1>
  <p class=sfml>Album · ${esc(a.name)} · ${al.yr} · ${ss.length} songs, ${Math.round(dur/60)} min · ${tot.toLocaleString()} streams</p></div></div>
  <div class=sfbd style="--acc:${a.acc}"><div class=sfact><button class=sfgo aria-label="${pl?'Pause':'Play'}" onclick="brBig(${a.i})">${sfIco(pl?'pause':'play')}</button><button class="sfib${SPQ.sh?' on':''}" title="Shuffle" onclick="sfShuf()">${sfIco('shuf')}</button></div>
  ${ss.map((s,n)=>brRow(a,s,n+1,c)).join('')}</div>`}
 const P=brPop(a).slice(0,SFB.all?10:5);
 return`<div class=sfhd style="--acc:${a.acc}"><img class=sfart src="${brFace(a.i)}" alt=""><div class=sfhi>${back}<h1 class=sfnm>${esc(a.name)}</h1><div class=sfver>${sfIco('ver','sfvi')}<b>Verified by Spotifly</b></div><p class=sfml>${brML(a).toLocaleString()} monthly listeners · ${a.g}</p></div></div>
 <div class=sfbd style="--acc:${a.acc}"><div class=sfact><button class=sfgo aria-label="${pl?'Pause':'Play'}" onclick="brBig(${a.i})">${sfIco(pl?'pause':'play')}</button><button class="sfib${SPQ.sh?' on':''}" title="Shuffle ${SPQ.sh?'on':'off'}" onclick="sfShuf()">${sfIco('shuf')}</button></div>
 <h2 class=sfh2>Popular</h2>${P.map((s,n)=>brRow(a,s,n+1,c)).join('')}<button class=sfmore onclick="SFB.all=!SFB.all;pcR()">${SFB.all?'Show less':'See more'}</button>
 <h2 class=sfh2>Albums</h2><div class=brg>${a.A.map((al,n)=>`<button class=brc onclick="brSet('al',${n})"><img src="${brIc(al)}" alt=""><b>${esc(al.name)}</b><small>${al.yr} · Album · ${al.songs.length} songs</small></button>`).join('')}</div></div>`}
PG.browse=()=>SFB.a==null?brHome():brArtistPg();
/* sidebar entry */
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{if(app==1&&S.artist){const sb=document.querySelector('#pc .sb');if(sb&&!sb.querySelector('.brnav')){
 if(pg=='browse')sb.querySelectorAll('button.on').forEach(b=>b.classList.remove('on'));
 sb.insertAdjacentHTML('beforeend',`<button class="brnav${pg=='browse'?' on':''}" onclick="pg='browse';pcR()">Browse artists</button>`)}}}catch(e){console.error('spotifly browse',e)}return r}}
{const st=document.createElement('style');st.textContent=`
.brh{padding:26px 32px 30px;background:linear-gradient(#1a3a28,#121212 260px);min-height:100%}
.brs{margin:6px 0 14px}.brin{width:100%;max-width:420px;box-sizing:border-box;background:#242424;border:2px solid #000;color:#fff;border-radius:500px;padding:10px 18px;font:inherit;outline:none}.brin:focus{border-color:#1db954}
.brf{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}.brp{background:#2a2a2a;color:#fff;border:2px solid #000;box-shadow:none;border-radius:500px;padding:6px 16px;font-weight:700;font-size:13px;cursor:pointer}.brp:hover{background:#3a3a3a}.brp.on{background:#1db954;color:#000}
.brg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.brc{display:flex;flex-direction:column;gap:6px;text-align:left;background:#181818;border:0;box-shadow:none;border-radius:8px;padding:14px;color:#fff;cursor:pointer;min-width:0}.brc:hover{background:#282828}
.brc .brf2{border-radius:50%}.brc img{width:100%;aspect-ratio:1;image-rendering:pixelated;border:2px solid #000;border-radius:4px}.brc b{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.brc small{color:#b3b3b3;font-size:12px;line-height:1.3}
.brb{background:none;border:0;box-shadow:none;color:#fff;font-weight:700;cursor:pointer;padding:0 0 8px;opacity:.85}.brb:hover{opacity:1;text-decoration:underline}
.brr .sfs{text-align:right}.brnav.on{color:#1db954}
@media (max-width:760px){.brh{padding:18px}.brg{grid-template-columns:repeat(2,1fr)}}`;document.head.appendChild(st)}
