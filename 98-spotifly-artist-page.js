/* ===== v26.105: Spotifly looks like a real artist page, with a song player =====
   Artist page: a big header (your picture as the artwork, your name, "Verified by Spotifly", monthly listeners),
   a play / shuffle row and a numbered Popular list (cover, title, streams, length). A Now playing panel sits on the
   right and a player bar along the bottom of the Spotifly window. Both have a pause button that really pauses the song
   (Beats.hold), and the bar also has previous / next, shuffle and repeat and a volume slider.
   Albums now boost the streams of their songs: track 1 the most, like a real album's lead single.
   Playing a song still does not count streams. */

/* ---------- album boost ----------
   Track 1 gets +60% streams, every other track +25%. In the first two weeks after the album comes out the boost is
   bigger (up to double, fading day by day). The extra streams come on top of the song's normal day, after its cap. */
const ALB_BOOST={first:.6,rest:.25,newDays:14};
function sfAlbumOf(id){const A=S.albums||[];for(let k=A.length-1;k>=0;k--){const i=(A[k].songs||[]).indexOf(id);if(i>=0)return{a:A[k],i}}return null}
function sfAlbBoost(a,i){const b=i==0?ALB_BOOST.first:ALB_BOOST.rest,age=Math.max(0,S.day-(a.day||0));return b*(1+Math.max(0,1-age/ALB_BOOST.newDays))}
{const po=planOf;planOf=function(s){const fresh=s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;const f=sfAlbumOf(s.id);if(!f)return v;
 const x=s.vx||0,n=v-x,m=sfAlbBoost(f.a,f.i);s.pv=x+Math.round(n*(1+m));return s.pv}}
const sfPct=m=>'+'+Math.round(m*100)+'%';

/* ---------- pixel icons: each letter X is one pixel, drawn in the text colour (G green, W white) ---------- */
const SPI={
 play:['X......','XXX....','XXXXX..','XXXXXXX','XXXXX..','XXX....','X......'],
 pause:['XX.XX','XX.XX','XX.XX','XX.XX','XX.XX','XX.XX','XX.XX'],
 next:['X....X','XX...X','XXX..X','XXXX.X','XXX..X','XX...X','X....X'],
 prev:['X....X','X...XX','X..XXX','X.XXXX','X..XXX','X...XX','X....X'],
 shuf:['.......X.','XX...XXXX','..X.X..X.','...X.....','..X.X..X.','XX...XXXX','.......X.'],
 rep:['......X..','.XXXXXXX.','X.....X..','X.......X','..X.....X','.XXXXXXX.','..X......'],
 vol:['...X.....','..XX..X..','XXXX...X.','XXXX...X.','XXXX...X.','..XX..X..','...X.....'],
 mute:['...X.....','..XX.....','XXXX.X.X.','XXXX..X..','XXXX.X.X.','..XX.....','...X.....'],
 ver:['..GGGGG..','.GGGGGGG.','GGGGGGGWG','GGGGGGWGG','GWGGGWGGG','GGWGWGGGG','GGGWGGGGG','.GGGGGGG.','..GGGGG..']};
const sfIco=(k,cls='')=>{const b=SPI[k],h=b.length,w=b[0].length;let r='';b.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!='.')r+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c=='G'?'#1db954':c=='W'?'#fff':'currentColor'}"/>`}));
 return`<svg class="sfi ${cls}" viewBox="0 0 ${w} ${h}" style="aspect-ratio:${w}/${h}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`};

/* ---------- covers: album songs use their album's cover; other songs get their own pixel cover from their id ---------- */
const SPC=new Map();
function sfCover(s){if(!s)return'';const f=s.id!=null&&S.songs.includes(s)?sfAlbumOf(s.id):null;if(f)try{return cover(f.a)}catch(e){}
 const key=(s.id||0)+'|'+(s.g||'');if(SPC.has(key))return SPC.get(key);
 let h=2166136261;for(const c of key)h=Math.imul(h^c.charCodeAt(0),16777619);const r=()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return(h>>>0)/4294967296};
 const P=[['#1f2a44','#f5c542','#ff6ad5'],['#3a1f44','#ff6ad5','#7fe3ff'],['#123d2a','#2fe68a','#f5c542'],['#44211f','#ff8a30','#ffe0a0'],['#1d3d52','#7fe3ff','#ffffff'],['#2a2a2a','#eeeeee','#1db954'],['#4a1030','#ff3b5c','#ffd166'],['#102a4a','#4dabff','#b388ff']][Math.floor(r()*8)];
 const k=document.createElement('canvas');k.width=k.height=16;const x=k.getContext('2d');x.fillStyle=P[0];x.fillRect(0,0,16,16);
 for(let y=1;y<15;y++)for(let X=1;X<8;X++){const v=r();if(v<.42){x.fillStyle=v<.12?P[2]:P[1];x.fillRect(X,y,1,1);x.fillRect(15-X,y,1,1)}}
 const u=k.toDataURL();SPC.set(key,u);return u}

/* ---------- player ---------- */
const SPQ={ids:[],sh:0,rp:0};
const sfOrder=()=>S.songs.slice().sort((a,b)=>b.streams-a.streams||b.id-a.id);
const sfCur=()=>{const c=typeof Beats!='undefined'&&Beats.current();return c&&c.owner=='sf'?c:null};
const sfIsSong=c=>!!c&&S.songs.includes(c.src);
const sfLenB=()=>Beats.songBeats?Beats.songBeats():184;
const SPBPM=new Map();
function sfBpm(s){const k=(s.id||0)+'|'+(s.bs==null?'':s.bs)+'|'+(s.g||'');if(!SPBPM.has(k)){let b=90;try{b=Beats.plan(s).bpm||90}catch(e){}SPBPM.set(k,b)}return SPBPM.get(k)}
const sfDur=s=>sfLenB()*60/sfBpm(s);
const sfTime=t=>{t=Math.max(0,Math.floor(t||0));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const sfEl=c=>c?Math.max(0,Math.min(sfLenB(),Beats.beat()))*60/(c.bpm||90):0;
function sfStart(s,ids){if(!s)return;if(ids)SPQ.ids=ids;try{Beats.setVolume(S.sfVol==null?1:S.sfVol)}catch(e){}
 const p=Beats.play(s,{owner:'sf',alive:()=>mode=='pc'});if(p&&typeof say=='function')say('Now playing "'+s.title+'" · '+p.style+' · '+p.bpm+' bpm · '+p.key);pcR()}
function sfPlayId(id){const s=S.songs.find(x=>x.id==id);if(!s)return;const c=sfCur();if(c&&c.src===s)return sfToggle();sfStart(s,sfOrder().map(x=>x.id))}
/* the pause buttons: pause or carry on with the song that is playing; with nothing playing, start your most popular song */
function sfToggle(){const c=sfCur();if(c){Beats.hold(!c.held);pcR();return}const L=sfOrder();if(L.length)sfStart(SPQ.sh?L[Math.floor(Math.random()*L.length)]:L[0],L.map(x=>x.id))}
function sfStep(d,auto){const c=sfCur();if(!c)return sfToggle();const s=c.src;
 if(!sfIsSong(c)){if(auto&&!SPQ.rp){Beats.stop(.3);pcR()}else sfStart(s);return}
 if(d<0&&sfEl(c)>3)return sfStart(s);if(auto&&SPQ.rp)return sfStart(s);
 const ids=(SPQ.ids.length?SPQ.ids:sfOrder().map(x=>x.id)).filter(id=>S.songs.some(x=>x.id==id));let i=ids.indexOf(s.id),j;
 if(SPQ.sh&&ids.length>1){do j=Math.floor(Math.random()*ids.length);while(j==i)}else j=i+d;
 if(j<0)j=0;if(j>=ids.length){if(auto){Beats.stop(.6);pcR();return}j=0}
 sfStart(S.songs.find(x=>x.id==ids[j]),ids)}
function sfShuf(){SPQ.sh=!SPQ.sh;snd('pop');pcR()}
function sfRep(){SPQ.rp=!SPQ.rp;snd('pop');pcR()}
function sfVol(v){S.sfVol=Math.max(0,Math.min(1,+v||0));try{Beats.setVolume(S.sfVol)}catch(e){}const b=document.querySelector('#pc .sfvb');if(b)b.innerHTML=sfIco(S.sfVol>0?'vol':'mute')}
function sfMute(){S.sfVol=(S.sfVol==null?1:S.sfVol)>0?0:1;sfVol(S.sfVol);pcR()}
/* big green play button on the artist page */
function sfBig(){const c=sfCur();if(c&&sfIsSong(c))return sfToggle();const L=sfOrder();if(!L.length)return;if(SPQ.sh)sfStart(L[Math.floor(Math.random()*L.length)],L.map(x=>x.id));else sfStart(L[0],L.map(x=>x.id))}

/* ---------- artist page ---------- */
const sfAcc=()=>{let h=0;for(const c of String(S.artist||''))h=(h*31+c.charCodeAt(0))>>>0;return['#5a1414','#14385a','#3a145a','#14503a','#5a3a14','#5a1446'][h%6]};
function sfRow(s,i,c){const on=!!(c&&c.src===s),pl=on&&!c.held,f=sfAlbumOf(s.id),lk=typeof luckTag=='function'?luckTag(s):'';
 return`<div class="sfr${on?' on':''}" ondblclick="sfPlayId(${s.id})"><span class=sfn><b>${on?(pl?'<i class=sfeq><i></i><i></i><i></i></i>':i):i}</b><button class=sfnb title="${pl?'Pause':'Play'}" aria-label="${pl?'Pause':'Play'} ${esc(s.title)}" onclick="sfPlayId(${s.id})">${sfIco(pl?'pause':'play')}</button></span>
 <img class=sfrc src="${sfCover(s)}" alt=""><span class=sft><b>${esc(s.title)}${lk}</b><small>${esc(s.g||'')}${f?` · <span class=sfab title="Album boost on this song's streams">${esc(f.a.name)} #${f.i+1} ${sfPct(sfAlbBoost(f.a,f.i))}</span>`:''} · +${(s.today||0).toLocaleString()} today</small></span>
 <span class=sfs>${s.streams.toLocaleString()}</span><span class=sfd>${sfTime(sfDur(s))}</span>${typeof sfBin=='function'?sfBin(s):''}</div>`}
function sfDisco(){const A=S.albums||[];if(!A.length)return'';return`<h2 class=sfh2>Discography</h2>${A.slice().reverse().map(a=>{const q=aStats(a);
 return`<div class=sfal><img class=cov src="${cover(a)}" alt=""><div class=sfai><small class=m>Album · Day ${a.day} · ${q.ss.length} songs</small><b class=sfan>${esc(a.name)}</b>
 ${q.ss.map((x,i)=>`<div class=sfat><span class=m>${i+1}</span><span class=sfatt>${esc(x.title)}</span><span class=sfab>${sfPct(sfAlbBoost(a,a.songs.indexOf(x.id)))}</span><span class=m>${x.streams.toLocaleString()}</span></div>`).join('')}
 <small class=m>${q.st.toLocaleString()} streams · ${$$(q.earn)} earned · Collaborators: ${Object.keys(q.cl).length?Object.keys(q.cl).map(n=>esc(n)).join(', '):'none'}</small></div></div>`}).join('')}
 <p class=m><small>Albums boost their songs' streams: track 1 gets ${sfPct(ALB_BOOST.first)}, the other tracks ${sfPct(ALB_BOOST.rest)}, and up to double that in the first ${ALB_BOOST.newDays} days after release.</small></p>`}
PG.home=()=>{const L=sfOrder(),sh=SALL?L:L.slice(0,5),c=sfCur(),pl=!!(c&&sfIsSong(c)&&!c.held);
 return`<div class=sfhd style="--acc:${sfAcc()}"><img class=sfart src="${pfp()}" alt=""><div class=sfhi><h1 class=sfnm>${esc(S.artist)}</h1>
 <div class=sfver>${sfIco('ver','sfvi')}<b>Verified by Spotifly</b></div><p class=sfml>${S.listeners.toLocaleString()} monthly listeners</p></div></div>
 <div class=sfbd style="--acc:${sfAcc()}"><div class=sfact><button class=sfgo title="${pl?'Pause':'Play'}" aria-label="${pl?'Pause':'Play'}" onclick="sfBig()" ${L.length?'':'disabled'}>${sfIco(pl?'pause':'play')}</button>
 <button class="sfib${SPQ.sh?' on':''}" title="Shuffle ${SPQ.sh?'on':'off'}" onclick="sfShuf()">${sfIco('shuf')}</button><span class=sfpill>${S.followers.toLocaleString()} followers</span><span class=sfpill>Fame ${fameStr()}</span></div>
 <h2 class=sfh2>Popular</h2>${L.length?sh.map((s,i)=>sfRow(s,i+1,c)).join('')+(L.length>5?`<button class=sfmore onclick="SALL=!SALL;pcR()">${SALL?'Show less':'See more ('+L.length+')'}</button>`:''):'<p class=m>No releases yet. Record a song in the studio, then upload it from the Upload tab.</p>'}
 ${sfDisco()}</div>`};
/* keep the "upload a picture" buttons under the monthly listeners line (84-pixel-pictures.js) */
{const h0=PG.home;PG.home=function(){const h=h0.apply(this,arguments);return S.artist&&typeof pxBtns=='function'?h.replace(/(monthly listeners[^<]*<\/p>)/,'$1'+pxBtns('sp')):h}}
{const a0=PG.albums;if(a0)PG.albums=function(){const h=a0.apply(this,arguments),k=h.lastIndexOf('<button class=go onclick="mkAlbum()">'),n=`<p class=m><small>Your album boosts its songs' streams. Track 1 gets the biggest boost (${sfPct(ALB_BOOST.first)}), every other track ${sfPct(ALB_BOOST.rest)}, doubled in the first ${ALB_BOOST.newDays} days. Put your strongest song first.</small></p>`;return k<0?h+n:h.slice(0,k)+n+h.slice(k)}}

/* ---------- Now playing panel and player bar (on every Spotifly page) ---------- */
function sfInfo(c){const s=c.src,song=sfIsSong(c),f=song?sfAlbumOf(s.id):null;
 return{s,song,f,artist:esc(S.artist)+(s.ft?', '+esc(s.ft):''),sub:esc(c.style)+' · '+c.bpm+' bpm · '+esc(c.key)}}
function sfPanel(){const c=sfCur();if(!c)return`<aside class=sfnp><small class=sfnpl>Now playing</small><div class=sfemp>${sfIco('play')}<p>Nothing playing.<br>Press play on a song.</p></div></aside>`;
 const I=sfInfo(c),pl=!c.held,d=sfLenB()*60/(c.bpm||90);
 return`<aside class=sfnp><small class=sfnpl>Now playing</small><img class=sfbig src="${sfCover(I.s)}" alt=""><div class=sfnt><b>${esc(I.s.title)}</b><span>${I.artist}</span></div>
 <div class=sfprog><i style="width:${Math.min(100,sfEl(c)/d*100).toFixed(2)}%"></i></div><div class=sftm><span class=sfel>${sfTime(sfEl(c))}</span><span>${sfTime(d)}</span></div>
 <div class=sfnc><button class=sfib title="Previous" onclick="sfStep(-1)">${sfIco('prev')}</button><button class=sfpp title="${pl?'Pause':'Play'}" aria-label="${pl?'Pause':'Play'}" onclick="sfToggle()">${sfIco(pl?'pause':'play')}</button><button class=sfib title="Next" onclick="sfStep(1)">${sfIco('next')}</button></div>
 <div class=sfabt><b>About this song</b><div><span>Beat</span><span>${I.sub}</span></div>${I.song?`<div><span>Streams</span><span>${I.s.streams.toLocaleString()} (+${(I.s.today||0).toLocaleString()} today)</span></div><div><span>Released</span><span>Day ${I.s.day}</span></div>${I.f?`<div><span>Album</span><span>${esc(I.f.a.name)}, track ${I.f.i+1} <b class=sfab>${sfPct(sfAlbBoost(I.f.a,I.f.i))}</b></span></div>`:''}`:'<div><span>Status</span><span>Unreleased draft, no streams</span></div>'}</div></aside>`}
function sfBar(){const c=sfCur(),I=c?sfInfo(c):null,pl=!!(c&&!c.held),d=c?sfLenB()*60/(c.bpm||90):0,v=S.sfVol==null?1:S.sfVol;
 return`<div class=sfpb><div class=sfpbl>${I?`<img src="${sfCover(I.s)}" alt=""><div><b>${esc(I.s.title)}</b><span>${I.artist}</span><small>${I.sub}</small></div>`:'<div><span>Nothing playing</span></div>'}</div>
 <div class=sfpbc><div class=sfnc><button class="sfib${SPQ.sh?' on':''}" title="Shuffle ${SPQ.sh?'on':'off'}" onclick="sfShuf()">${sfIco('shuf')}</button><button class=sfib title="Previous" onclick="sfStep(-1)">${sfIco('prev')}</button>
 <button class=sfpp title="${pl?'Pause':'Play'}" aria-label="${pl?'Pause':'Play'}" onclick="sfToggle()">${sfIco(pl?'pause':'play')}</button><button class=sfib title="Next" onclick="sfStep(1)">${sfIco('next')}</button><button class="sfib${SPQ.rp?' on':''}" title="Repeat ${SPQ.rp?'on':'off'}" onclick="sfRep()">${sfIco('rep')}</button></div>
 <div class=sfpr><span class=sfel>${sfTime(sfEl(c))}</span><div class=sfprog><i style="width:${c?Math.min(100,sfEl(c)/d*100).toFixed(2):0}%"></i></div><span>${sfTime(d)}</span></div></div>
 <div class=sfpbr><button class="sfib sfvb" title="Mute" onclick="sfMute()">${sfIco(v>0?'vol':'mute')}</button><input class=sfvs type=range min=0 max=1 step=.01 value="${v}" oninput="sfVol(this.value)" aria-label="Volume"></div></div>`}
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{if(app==1&&S.artist){const w=document.querySelector('#pc .win'),wb=w&&w.querySelector('.wb'),mn=wb&&wb.querySelector('.mn');if(wb&&!wb.querySelector('.sfnp')){
 w.classList.add('sfw');if(mn)mn.classList.add('sfm');wb.insertAdjacentHTML('beforeend',sfPanel());w.insertAdjacentHTML('beforeend',sfBar())}}}catch(e){console.error('spotifly player',e)}return r}}
/* every frame: move the progress bars and go to the next song when one ends */
{const u0=update;update=function(dt){u0(dt);try{const c=sfCur();if(!c)return;if(!c.held&&!c.paused&&Beats.beat()>=sfLenB()){sfStep(1,1);return}
 if(mode=='pc'&&app==1){const el=sfEl(c),d=sfLenB()*60/(c.bpm||90),w=Math.min(100,el/d*100).toFixed(2)+'%',t=sfTime(el);
  document.querySelectorAll('#pc .sfprog>i').forEach(i=>{if(i.style.width!=w)i.style.width=w});document.querySelectorAll('#pc .sfel').forEach(e=>{if(e.textContent!=t)e.textContent=t})}}catch(e){}}}

{const st=document.createElement('style');st.textContent=`
.win.sfw .wb{min-height:0}.mn.sfm{background:#121212;padding:0!important}
.sfi{height:14px;width:auto;display:block;image-rendering:pixelated}
.sfhd{position:relative;height:300px;background:#000;overflow:hidden;display:flex;align-items:flex-end;padding:0 32px 22px}
.sfhd::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 62% 40%,var(--acc) 0,transparent 55%);opacity:.55}
.sfart{position:absolute;right:12%;top:-6%;height:112%;aspect-ratio:1;image-rendering:pixelated;opacity:.7;-webkit-mask-image:radial-gradient(circle,#000 45%,transparent 72%);mask-image:radial-gradient(circle,#000 45%,transparent 72%)}
.sfhi{position:relative;z-index:1}
.sfnm{font-family:'Silkscreen',ui-monospace,monospace;font-size:clamp(40px,7vw,88px)!important;line-height:1;margin:0 0 12px;color:#fff;text-shadow:5px 5px 0 #000;letter-spacing:-1px;overflow-wrap:anywhere}
.sfver{display:flex;align-items:center;gap:8px;color:#fff;font-size:14px}.sfvi{height:22px}
.sfml{margin:8px 0 0;color:#fff;font-size:15px}.sfhd .pxb button{background:#0008;color:#fff;border:2px solid #fff4;box-shadow:none}
.sfbd{background:linear-gradient(color-mix(in srgb,var(--acc) 85%,#000),#121212 300px);padding:22px 32px 30px}
.sfact{display:flex;align-items:center;gap:18px;margin-bottom:22px}
.sfgo{width:58px;height:58px;padding:0;border-radius:50%;border:3px solid #000;background:#1db954;color:#000;display:flex;align-items:center;justify-content:center;box-shadow:4px 4px 0 #000;cursor:pointer}.sfgo .sfi{height:20px}
.sfgo:hover:not(:disabled){transform:scale(1.05);background:#3be477}.sfgo:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #000}
.sfib{background:none;border:0;box-shadow:none;padding:6px;color:#b3b3b3;cursor:pointer;position:relative}.sfib:hover{color:#fff}.sfib.on{color:#1db954}.sfib.on::after{content:'';position:absolute;left:50%;bottom:0;width:4px;height:4px;margin-left:-2px;background:#1db954}
.sfact .sfib .sfi{height:26px}
.sfpill{border:2px solid #ffffff88;border-radius:500px;padding:6px 16px;color:#fff;font-weight:700;font-size:13px}
.sfh2{font-family:'Silkscreen',ui-monospace,monospace;font-size:24px;margin:8px 0 14px;color:#fff}
.sfr{display:grid;grid-template-columns:34px 48px 1fr 130px 60px 36px;gap:14px;align-items:center;padding:6px 10px;border-radius:4px}
.sfr:hover{background:#ffffff14}.sfr.on .sft>b{color:#1db954}
.sfn{text-align:center;color:#b3b3b3;font-variant-numeric:tabular-nums;position:relative;display:flex;justify-content:center;align-items:center;height:30px}
.sfn>b{font-weight:400;font-size:16px}.sfr.on .sfn>b{color:#1db954}
.sfnb{display:none;background:none;border:0;box-shadow:none;padding:4px;color:#fff;cursor:pointer}.sfr:hover .sfn>b{display:none}.sfr:hover .sfnb{display:block}
.sfrc{width:44px;height:44px;image-rendering:pixelated;border-radius:2px;border:2px solid #000}
.sft{min-width:0}.sft>b{display:block;color:#fff;font-weight:500;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sft small{color:#b3b3b3;font-size:12px}
.sfs{text-align:right;color:#b3b3b3;font-variant-numeric:tabular-nums}.sfd{text-align:right;color:#b3b3b3;font-variant-numeric:tabular-nums}
.sfab{color:#1db954;font-weight:700}
.sfeq{display:inline-flex;gap:2px;align-items:flex-end;height:14px}.sfeq i{width:3px;background:#1db954;animation:sfeq .8s steps(4) infinite}.sfeq i:nth-child(2){animation-delay:-.3s}.sfeq i:nth-child(3){animation-delay:-.55s}
@keyframes sfeq{0%{height:3px}50%{height:14px}100%{height:6px}}
.sfmore{margin:10px 0 24px 10px;background:none;border:0;box-shadow:none;color:#b3b3b3;font-weight:700;cursor:pointer;padding:4px}.sfmore:hover{color:#fff}
.sfal{display:flex;gap:16px;background:#181818;border-radius:6px;padding:14px;margin:0 0 12px}.sfai{flex:1;min-width:0}.sfan{display:block;font-size:18px;color:#fff;margin:2px 0 8px}
.sfat{display:grid;grid-template-columns:24px 1fr 60px 110px;gap:8px;padding:3px 0;font-size:14px}.sfat>span:last-child{text-align:right}.sfatt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sfnp{width:300px;flex-shrink:0;background:#121212;border-left:3px solid #000;padding:16px;overflow:auto;display:flex;flex-direction:column;gap:12px}
.sfnpl{color:#fff;font-weight:700;font-family:'Silkscreen',ui-monospace,monospace;font-size:14px}
.sfbig{width:100%;aspect-ratio:1;image-rendering:pixelated;border:3px solid #000;box-shadow:4px 4px 0 #000;border-radius:4px}
.sfnt b{display:block;color:#fff;font-size:22px;overflow-wrap:anywhere}.sfnt span{color:#b3b3b3}
.sfnp .sfnc{justify-content:center}.sfnp .sfprog{flex:none;width:100%}
.sfabt{background:color-mix(in srgb,#1db954 22%,#181818);border-radius:8px;padding:14px;display:flex;flex-direction:column;gap:6px;font-size:13px}.sfabt>b{color:#fff;font-size:15px;margin-bottom:2px}
.sfabt>div{display:flex;justify-content:space-between;gap:10px}.sfabt>div>span:first-child{color:#b3b3b3}.sfabt>div>span:last-child{color:#fff;text-align:right}
.sfemp{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#727272;text-align:center}.sfemp .sfi{height:40px}
.sfprog{flex:1;height:6px;background:#4d4d4d;position:relative}.sfprog>i{position:absolute;left:0;top:0;bottom:0;background:#fff}
.sfpb:hover .sfprog>i,.sfnp:hover .sfprog>i{background:#1db954}
.sftm{display:flex;justify-content:space-between;color:#b3b3b3;font-size:12px;font-variant-numeric:tabular-nums;margin-top:-6px}
.sfnc{display:flex;align-items:center;gap:14px}
.sfpp{width:40px;height:40px;padding:0;border-radius:50%;border:2px solid #000;background:#fff;color:#000;display:flex;align-items:center;justify-content:center;box-shadow:3px 3px 0 #000;cursor:pointer}.sfpp:hover{transform:scale(1.06)}.sfpp:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #000}
.sfpb{display:grid;grid-template-columns:1fr 2fr 1fr;align-items:center;gap:16px;background:#000;border-top:3px solid #000;padding:8px 14px;height:76px;box-sizing:border-box;flex-shrink:0;color:#fff}
.sfpbl{display:flex;align-items:center;gap:12px;min-width:0}.sfpbl img{width:54px;height:54px;image-rendering:pixelated;border-radius:2px}.sfpbl>div{min-width:0;display:flex;flex-direction:column}
.sfpbl b,.sfpbl span,.sfpbl small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sfpbl b{font-size:14px}.sfpbl span{font-size:12px;color:#b3b3b3}.sfpbl small{font-size:11px;color:#1db954}
.sfpbc{display:flex;flex-direction:column;align-items:center;gap:6px}.sfpbc .sfpp{width:34px;height:34px}
.sfpr{display:flex;align-items:center;gap:10px;width:100%;max-width:600px;color:#b3b3b3;font-size:12px;font-variant-numeric:tabular-nums}.sfpr .sfprog{height:5px}
.sfpbr{display:flex;align-items:center;justify-content:flex-end;gap:8px}.sfpbr .sfvs{width:110px;height:auto;padding:0;margin:0;border:0;background:none;box-shadow:none;accent-color:#1db954}
@media (max-width:1100px){.sfnp{display:none}.sfr{grid-template-columns:30px 44px 1fr 100px 50px 32px;gap:10px}}
@media (max-width:760px){.sfpb{grid-template-columns:1fr auto}.sfpbr{display:none}.sfr{grid-template-columns:26px 40px 1fr 50px 32px}.sfs{display:none}.sfhd{padding:0 18px 18px}.sfbd{padding:18px}}`;document.head.appendChild(st)}
