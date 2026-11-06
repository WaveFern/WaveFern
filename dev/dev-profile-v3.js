/* WaveFern dev: public profile MOCKUP. Only loaded on /dev/ after the password.
   Everything here is fake or read from the DEV save. No network calls, nothing is written outside the "dev:" storage keys.
   Entry point: the avatar icon in the top right of the main menu. The DEV panel has test shortcuts. */
(function(){
 if(!window.FW_DEV)return;
 const g=f=>{try{return f()}catch(e){return undefined}};
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=n=>Math.round(+n||0).toLocaleString();
 const KEY='fw_prof_mock';

 /* ---------- mock data ---------- */
 const NOW=Date.now(),DAY=864e5;
 const ACH=[['First release','Released a first song'],['Ten songs','Released 10 songs'],['100K listeners','Reached 100,000 monthly listeners'],['Sold-out stage','Sold out a festival stage'],['World tour','Played a show on every continent'],['Gramophone win','Won a Gramophone Award'],['One billion streams','Passed 1,000,000,000 total streams'],['Band streak 30','Kept a 30 day band streak']];
 const PEOPLE={
  marlo:{id:'marlo',artist:'Marlo Vance',user:'marlovance',seed:11,founder:1,fame:64,listeners:3820000,joined:NOW-212*DAY,bio:'Bedroom pop turned arena. Mostly nights, mostly synths.',
   songs:[['Paper Satellites',182400000,1],['Low Tide Radio',96700000,0],['Glasshouse',41200000,0],['Ninth Floor',2300000,2]],band:{name:'Static Orchard',inst:'Keys',members:4,streak:23},ach:[0,1,2,3,5],online:'In a band room',rel:'friend'},
  juno:{id:'juno',artist:'Juno Reyes',user:'junoreyes',seed:27,founder:1,fame:38,listeners:910000,joined:NOW-160*DAY,bio:'Drums first, songs second.',
   songs:[['Hold the Door',48800000,0],['Salt and Static',22100000,0],['Backstreet Tempo',900000,2]],band:{name:'Static Orchard',inst:'Drums',members:4,streak:23},ach:[0,1,2],online:'In a band room',rel:'friend'},
  dex:{id:'dex',artist:'Dex Okoro',user:'dexokoro',seed:5,founder:0,fame:12,listeners:41200,joined:NOW-31*DAY,bio:'',
   songs:[['Late Bus',410000,0],['Porch Light',88000,0]],band:null,ach:[0],online:'Offline',rel:'none'},
  ines:{id:'ines',artist:'Ines Halloran',user:'ineshalloran',seed:42,founder:0,fame:27,listeners:268000,joined:NOW-77*DAY,bio:'Guitar, loops, and one very loud amp.',
   songs:[['Copper Wire',9700000,2],['Slow Fuse',6400000,0],['Postcards',1800000,0]],band:{name:'Night Shift',inst:'Guitar',members:3,streak:6},ach:[0,1],online:'Online, playing solo',rel:'requested'},
  tobias:{id:'tobias',artist:'Tobias Lind',user:'tobiaslind',seed:63,founder:1,fame:81,listeners:7140000,joined:NOW-304*DAY,bio:'Producer. Ask before you sample.',
   songs:[['Concrete Garden',512000000,1],['Afterimage',233000000,0],['Wide Open',118000000,0],['Ghost Light',31000000,2]],band:null,ach:[0,1,2,3,4,5,6],online:'Offline',rel:'none'}
 };
 const FRIENDS=['marlo','juno'],REQUESTS=['dex'],OTHERS=['ines','tobias'];

 /* ---------- my profile: dev save where it exists, sample values otherwise ---------- */
 /* careers the player can show: the one they are in, plus the other saved slots. Which one is public is the player's choice. */
 function careers(){
  const out=[],seen={};
  const cur=g(()=>S&&S.artist&&S);if(cur){out.push({k:'cur',S:cur,label:cur.artist+' (current)'});seen[cur.artist]=1}
  for(let n=1;n<=(g(()=>SLOTS)||2);n++){const o=g(()=>scDecode(localStorage.getItem(slotKey(n))).S);if(o&&o.artist&&!seen[o.artist]){seen[o.artist]=1;out.push({k:'slot'+n,S:o,label:o.artist+' (save slot '+n+')'})}}
  return out;
 }
 const fameOf=o=>{const s0=g(()=>S);if(o===s0)return g(()=>fameLevel())||0;try{S=o;return fameLevel()||0}catch(e){return 0}finally{try{S=s0}catch(e){}}};
 /* Real-world join date (not the in-game day). Best source first: the Google account creation time; otherwise the first time this device opened the profile, remembered as `first` in the profile storage. Nothing is invented: the fallback is a real timestamp, just a late one for old players. */
 function realJoin(st){
  const ct=Date.parse(g(()=>FBU.metadata.creationTime)||'');if(ct>0)return ct;
  if(+st.first>0)return +st.first;
  const o=load();o.first=Date.now();save(o);return o.first;
 }
 const mine=()=>{
  const st0=load(),L=careers(),ch=L.find(c=>c.k===st0.career)||L[0],D=ch?ch.S:null,has=!!D;
  const songs=((D&&D.songs)||[]).slice().sort((a,b)=>(b.streams||0)-(a.streams||0)).slice(0,5).map(s=>[s.title,s.streams||0,(s.streams||0)>=1e6?1:((s.today||0)>5e4?2:0)]);
  const sk=(D&&D.mp&&D.mp.sk&&D.mp.sk.n)||0;
  const st=load();
  return{id:'me',me:1,sample:!has,artist:has?D.artist:'Your Artist Name',user:st.user,seed:3,founder:has?!!g(()=>S.founder):1,
   fame:has?fameOf(D):7,listeners:has?(D.listeners||0):18400,joined:realJoin(st),
   bio:st.bio,songs:songs.length?songs:[['Sample Song One',120400,2],['Sample Song Two',8800,0]],
   band:ch&&ch.k==='cur'&&g(()=>MPS&&MPS.band)?{name:MPS.band,inst:g(()=>iName(MPS.inst))||'Band',members:g(()=>list().length)||1,streak:sk}:{name:'The Ferns',inst:'Vocals',members:3,streak:sk||4},
   ach:has?[0,1,2].filter((_,i)=>i<1+Math.floor(((D.songs||[]).length)/3)):[0],online:'Online',rel:'self'};
 };
 const defaults={user:'yourname',bio:'',show:{listeners:1,songs:1,band:1,streak:1,ach:1,joined:1,status:1},req:'everyone',pfp:3,career:'cur',userAt:0};
 function load(){let o={};try{o=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}return Object.assign({},defaults,o,{show:Object.assign({},defaults.show,o.show||{})})}
 function save(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}

 /* ---------- avatars: deterministic 8x8 mirrored pixel face, drawn to a canvas ---------- */
 function avatar(seed,px){
  const k=document.createElement('canvas');k.width=k.height=8;const x=k.getContext('2d');
  let s=(seed*2654435761)>>>0;const r=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296};
  const pal=['#2fe68a','#1fa866','#8aa094','#e8f3ec','#6a7d71'],c1=pal[Math.floor(r()*3)],c2=pal[3+Math.floor(r()*2)];
  x.fillStyle='#0a0d0b';x.fillRect(0,0,8,8);
  for(let j=1;j<7;j++)for(let i=0;i<4;i++){if(r()>.46){x.fillStyle=r()>.78?c2:c1;x.fillRect(i,j,1,1);x.fillRect(7-i,j,1,1)}}
  const im=document.createElement('img');im.src=k.toDataURL();im.width=im.height=px;im.alt='';im.style.imageRendering='pixelated';return im.outerHTML;
 }
 const tag=(t,cls)=>`<span class="pf-tag ${cls||''}">${t}</span>`;
 const fmtDate=ts=>new Date(ts).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
 const rel=ts=>{const d=Math.max(1,Math.round((NOW-ts)/DAY));return d<60?d+' days ago':d<700?Math.round(d/30)+' months ago':Math.round(d/365)+' years ago'};

 /* ---------- styles ---------- */
 const css=document.createElement('style');
 css.textContent=`#pfx{position:fixed;inset:0;z-index:9995;display:flex;align-items:center;justify-content:center;background:#000b;padding:12px;font:14px ui-monospace,Menlo,Consolas,monospace;color:#e8f3ec}
#pfx *{box-sizing:border-box}
#pfx .fwpc{height:auto;border-radius:0;width:min(520px,100%);max-height:92vh;overflow:auto;background:#000;border:3px solid #2e2e2e;box-shadow:6px 6px 0 #0008;display:flex;flex-direction:column}
#pfx .pf-top{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:2px solid #2e2e2e;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#8aa094}
#pfx .pf-top button{padding:5px 10px;font-size:12px}
#pfx .pf-head{display:flex;gap:16px;padding:20px 16px 16px;align-items:flex-start}
#pfx .pf-av{flex:none;width:96px;height:96px;border:2px solid #2fe68a;background:#0a0d0b;display:block}
#pfx .pf-av img{display:block;width:100%;height:100%}
#pfx .pf-id{min-width:0;flex:1}
#pfx .pf-name{margin:0;font:700 22px/1.15 Silkscreen,ui-monospace,monospace;color:#e8f3ec;word-break:break-word}
#pfx .pf-user{margin:4px 0 0;color:#8aa094}
#pfx .pf-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
#pfx .pf-tag{display:inline-block;padding:2px 6px;border:1px solid #2e2e2e;color:#8aa094;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;line-height:14px}
#pfx .pf-tag.g{border-color:#2fe68a;color:#2fe68a}
#pfx .pf-tag.s{background:#2fe68a;border-color:#2fe68a;color:#04120a}
#pfx .pf-bio{margin:0;padding:0 16px 16px;line-height:1.5;color:#e8f3ec}
#pfx .pf-bio.e{color:#8aa094}
#pfx .pf-stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid #2e2e2e;border-bottom:2px solid #2e2e2e}
#pfx .pf-stats div{padding:12px 16px;border-right:2px solid #2e2e2e;min-width:0}
#pfx .pf-stats div:last-child{border-right:0}
#pfx .pf-stats small{display:block;color:#8aa094;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;margin-bottom:4px}
#pfx .pf-stats b{font-size:17px;font-weight:700}
#pfx .pf-sec{padding:16px;border-bottom:2px solid #2e2e2e}
#pfx .pf-sec:last-of-type{border-bottom:0}
#pfx h3{margin:0 0 10px;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#2fe68a}
#pfx .pf-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #1c221e}
#pfx .pf-row:last-child{border-bottom:0}
#pfx .pf-row .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pfx .pf-row .v{color:#8aa094;font-variant-numeric:tabular-nums}
#pfx .pf-row .i{width:18px;color:#8aa094;font-variant-numeric:tabular-nums}
#pfx .pf-kv{display:grid;grid-template-columns:auto 1fr;gap:6px 16px}
#pfx .pf-kv span{color:#8aa094}
#pfx .pf-ach{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#pfx .pf-ach div{border:1px solid #2e2e2e;padding:8px 10px;min-width:0}
#pfx .pf-ach b{display:block;font-size:13px}#pfx .pf-ach small{color:#8aa094;line-height:1.35;display:block;margin-top:2px}
#pfx .pf-ach div.lk{opacity:.4}
#pfx .pf-acts{display:flex;gap:8px;flex-wrap:wrap;padding:16px;border-top:2px solid #2e2e2e;background:#0b0f0d}
#pfx .pf-acts button{padding:9px 14px}
#pfx .pf-acts .sp{flex:1}
#pfx .pf-note{color:#8aa094;font-size:12px;line-height:1.45;margin:0;padding:0 16px 16px}
#pfx .pf-priv{color:#8aa094;font-size:12px;padding:12px 16px;border-top:2px solid #2e2e2e;margin:0}
#pfx label.pf-sw{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #1c221e;cursor:pointer}
#pfx label.pf-sw:last-child{border-bottom:0}
#pfx label.pf-sw span{flex:1}
#pfx label.pf-sw input{appearance:none;width:34px;height:18px;border:2px solid #2e2e2e;background:#0a0d0b;position:relative;margin:0;cursor:pointer;padding:0}
#pfx label.pf-sw input::after{content:"";position:absolute;top:2px;left:2px;width:10px;height:10px;background:#8aa094}
#pfx label.pf-sw input:checked{border-color:#2fe68a}#pfx label.pf-sw input:checked::after{left:18px;background:#2fe68a}
#pfx .pf-f{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
#pfx .pf-f label{color:#8aa094;font-size:12px}
#pfx .pf-f input,#pfx .pf-f textarea,#pfx .pf-f select{width:100%;font:inherit;padding:8px 10px;background:#0a0d0b;color:#e8f3ec;border:2px solid #333;outline:none}
#pfx .pf-f input:focus,#pfx .pf-f textarea:focus,#pfx .pf-f select:focus{border-color:#2fe68a}
#pfx .pf-f textarea{resize:none;height:64px}
#pfx .pf-f small{color:#8aa094}#pfx .pf-f small.er{color:#ff7a7a}
#pfx .pf-av-pick{display:flex;gap:8px;flex-wrap:wrap}
#pfx .pf-av-pick button{padding:0;width:48px;height:48px;border:2px solid #333;background:#0a0d0b}
#pfx .pf-av-pick button.on{border-color:#2fe68a}
#pfx .pf-av-pick img{display:block;width:100%;height:100%}
#pfx .pf-seg{display:inline-flex;border:2px solid #333}
#pfx .pf-seg button{border:0;border-radius:0;padding:5px 10px;background:#0a0d0b;color:#8aa094;font-size:12px;box-shadow:none}
#pfx .pf-seg button.on{background:#2fe68a;color:#04120a}
#pfx .pf-list .pf-row{cursor:pointer;padding:10px 0}
#pfx .pf-list .pf-row:hover .n b{color:#2fe68a}
#pfx .pf-list .pf-row img{flex:none;width:32px;height:32px;border:1px solid #2e2e2e}
#pfx .pf-list small{display:block;color:#8aa094}
.fwpf-ic{padding:0!important;width:36px;height:36px;flex:none;border:2px solid #2a352e!important;background:#0a0d0b!important;box-shadow:none!important;cursor:pointer;display:block;border-radius:0!important}.fwpf-ic:hover{border-color:#2fe68a!important}.fwpf-ic img,.fwpf-ic i{display:block;width:100%!important;height:100%!important;border:0!important;margin:0}
#mpb .mpr span b.fwpf-n,.fwpf-n{text-decoration:underline dotted #2fe68a;text-underline-offset:3px;cursor:pointer}
@media(max-width:480px){#pfx .pf-head{flex-direction:column}#pfx .pf-stats b{font-size:14px}#pfx .pf-ach{grid-template-columns:1fr}}`;
 document.head.appendChild(css);

 /* ---------- render ---------- */
 let V={id:'me',visitor:0,mode:'view',stack:[],msg:''};
 const el=()=>document.getElementById('pfx');
 function open(id,opts){
  if(typeof id!=='string')id='me';
  const o=Object.assign({visitor:0,from:null},opts||{});
  
  V=Object.assign(V,{id,visitor:id==='me'?o.visitor:0,mode:'view',msg:''});
  if(!el()){V.stack=[];const d=document.createElement('div');d.id='pfx';d.onmousedown=e=>{if(e.target===d)close()};document.body.appendChild(d)}
  el().dataset.on='1';draw();try{snd('click')}catch(e){}
 }
 function close(){const d=el();if(d)d.remove();V.stack=[]}
 function person(id){return id==='me'?mine():PEOPLE[id]}
 function stateFor(p){
  if(p.me)return V.visitor?'visitor':'self';
  if(p.id in REL)return REL[p.id];return p.rel;
 }
 const REL={};
 const SECS={listeners:'Monthly listeners',songs:'Top songs',band:'Band',streak:'Band streak',ach:'Achievements',joined:'Join date',status:'Online status'};
 function songTag(k){return k===1?tag('HIT','g'):k===2?tag('VIRAL','s'):''}

 function view(p){
  const st=load(),hide=p.me&&V.visitor?k=>!st.show[k]:p.me?()=>false:()=>false,mineView=p.me&&!V.visitor;
  const sh=k=>mineView||!p.me||st.show[k];
  const dim=(k,html)=>mineView&&!st.show[k]?html.replace('class="pf-sec"','class="pf-sec" style="opacity:.55"').replace('</h3>',' '+tag('HIDDEN FROM OTHERS')+'</h3>'):html;
  const state=stateFor(p);
  let h=`<div class=fwpc><div class=pf-top><span>${p.me?(V.visitor?'VIEWING AS A VISITOR':'YOUR PROFILE'):'PLAYER PROFILE'}</span><span>${V.stack.length?`<button data-pf=back>Back</button> `:''}<button data-pf=close>Close</button></span></div>`;
  h+=`<div class=pf-head><div class=pf-av>${avatar(p.me?st.pfp:p.seed,96)}</div><div class=pf-id><h2 class=pf-name>${esc(p.artist)}</h2><p class=pf-user>@${esc(p.user)}</p><div class=pf-tags>${p.founder?tag('FOUNDER','g'):''}${tag('FAME LEVEL '+p.fame)}${sh('status')&&p.online?tag(esc(p.online).toUpperCase()):''}</div></div></div>`;
  h+=p.bio?`<p class=pf-bio>${esc(p.bio)}</p>`:`<p class="pf-bio e">${p.me&&!V.visitor?'No bio yet. Add one in Edit profile.':'No bio.'}</p>`;
  const cells=[['FAME LEVEL',String(p.fame)]];
  if(sh('listeners'))cells.push(['MONTHLY LISTENERS',num(p.listeners)]);else cells.push(['MONTHLY LISTENERS','Private']);
  if(sh('joined'))cells.push(['JOINED',fmtDate(p.joined)]);else cells.push(['JOINED','Private']);
  h+=`<div class=pf-stats>${cells.map(c=>`<div><small>${c[0]}</small><b>${esc(c[1])}</b></div>`).join('')}</div>`;
  if(sh('songs'))h+=dim('songs',`<div class="pf-sec"><h3>TOP SONGS</h3>${p.songs.map((s,i)=>`<div class=pf-row><span class=i>${i+1}</span><span class=n>${esc(s[0])}</span>${songTag(s[2])}<span class=v>${num(s[1])}</span></div>`).join('')||'<span class=pf-user>No songs yet.</span>'}</div>`);
  if(sh('band')&&p.band)h+=dim('band',`<div class="pf-sec"><h3>BAND</h3><div class=pf-kv><span>Band</span><b>${esc(p.band.name)}</b><span>Plays</span><div>${esc(p.band.inst)}</div><span>Members</span><div>${p.band.members}</div>${sh('streak')?`<span>Streak</span><div>${p.band.streak} day${p.band.streak==1?'':'s'}</div>`:''}</div></div>`);
  else if(!p.band&&sh('band'))h+=`<div class=pf-sec><h3>BAND</h3><span class=pf-user>Not in a band.</span></div>`;
  if(sh('ach'))h+=dim('ach',`<div class="pf-sec"><h3>ACHIEVEMENTS (${p.ach.length}/${ACH.length})</h3><div class=pf-ach>${ACH.map((a,i)=>`<div class="${p.ach.includes(i)?'':'lk'}"><b>${esc(a[0])}</b><small>${esc(a[1])}</small></div>`).join('')}</div></div>`);
  if(p.me&&!V.visitor)h+=`<p class=pf-priv>Visitors see ${Object.keys(SECS).filter(k=>st.show[k]).length} of ${Object.keys(SECS).length} sections. Your artist name, username, avatar, Founder badge and fame level are always public.</p>`;
  h+='<div class=pf-acts>';
  if(p.me&&!V.visitor)h+=`<button class=go data-pf=edit>Edit profile</button><button data-pf=priv>Privacy</button><button data-pf=visitor>View as visitor</button>`;
  else if(p.me)h+=`<button class=go data-pf=visitor>Back to my view</button>`;
  else{
   h+=state=='friend'?`<button disabled>Friends</button>`:state=='requested'?`<button data-pf=cancel>Request sent. Cancel</button>`:`<button class=go data-pf=add>Add friend</button>`;
   h+=`<button data-pf=invite ${state=='blocked'?'disabled':''}>Invite to band</button><span class=sp></span><button data-pf=report>Report</button><button data-pf=block>${state=='blocked'?'Unblock':'Block'}</button>`;
  }
  h+='</div>';
  if(V.msg)h+=`<p class=pf-note style="padding-top:12px">${esc(V.msg)}</p>`;
  return h+'</div>';
 }
 function privacy(){
  const st=load();
  return`<div class=fwpc><div class=pf-top><span>PRIVACY</span><button data-pf=done>Done</button></div><div class=pf-sec><h3>SHOW ON YOUR PROFILE</h3>${Object.keys(SECS).map(k=>`<label class=pf-sw><span>${SECS[k]}</span><input type=checkbox data-sw="${k}" ${st.show[k]?'checked':''}></label>`).join('')}</div>
  <div class=pf-sec><h3>FRIEND REQUESTS</h3><div class=pf-seg>${[['everyone','Everyone'],['band','Band members'],['nobody','Nobody']].map(o=>`<button data-req="${o[0]}" class="${st.req==o[0]?'on':''}">${o[1]}</button>`).join('')}</div></div>
  <p class=pf-note style="padding-top:12px">Your artist name, username, avatar, Founder badge and fame level are always public. They are what lets friends find you.</p></div>`;
 }
 function edit(){
  const st=load(),bad=V.err||'';
  return`<div class=fwpc><div class=pf-top><span>EDIT PROFILE</span><button data-pf=done>Cancel</button></div><div class=pf-sec>
  <div class=pf-f><label>Avatar</label><div class=pf-av-pick>${[3,8,14,21,34,55].map(s=>`<button data-av="${s}" class="${st.pfp==s?'on':''}">${avatar(s,44)}</button>`).join('')}</div></div>
  <div class=pf-f><label for=pf-user>Username (letters, numbers and underscore, 3 to 16)</label><input id=pf-user maxlength=16 value="${esc(st.user)}" autocomplete=off spellcheck=false ${left(st)?'disabled':''}><small>${left(st)?'You changed your username recently. You can change it again in '+left(st)+' day'+(left(st)==1?'':'s')+'.':'You can change your username once every 30 days. Friends find you by it.'}</small></div>
  <div class=pf-f><label for=pf-bio>Bio</label><textarea id=pf-bio maxlength=80>${esc(st.bio)}</textarea><small class="${bad?'er':''}">${bad||'Up to 80 characters. Bios and usernames are checked before they show to other players.'}</small></div>
  <div class=pf-f><label for=pf-car>Career shown on your profile</label><select id=pf-car>${(careers().length?careers():[{k:'cur',label:'Sample career'}]).map(c=>`<option value="${c.k}" ${(mine().career||st.career)==c.k||st.career==c.k?'selected':''}>${esc(c.label)}</option>`).join('')}</select><small>Visitors see this career's artist name, fame level, listeners, songs and band. Your friends can still find you by username.</small></div></div>
  <div class=pf-acts><button class=go data-pf=savee>Save</button><button data-pf=done>Cancel</button></div></div>`;
 }
 /* placeholder filter so the error path can be seen. The real one would run on the server. */
 const COOL=30*DAY,RESERVED=/^(admin|mod|moderator|staff|support|wavefern|official|system|null|undefined)$/;
 const left=st=>Math.max(0,Math.ceil((st.userAt+COOL-Date.now())/DAY));
 const BLOCK=/(fuck|shit|nigg|fag|http|www\.|\.com|discord|@\w+\.)/i;

 function draw(){
  const d=el();if(!d)return;const p=person(V.id);
  const keep=d.firstElementChild?d.firstElementChild.scrollTop:0;
  d.innerHTML=V.mode=='priv'?privacy():V.mode=='edit'?edit():view(p);
  if(d.firstElementChild)d.firstElementChild.scrollTop=V.mode=='view'?keep:0;
 }
 document.addEventListener('click',e=>{
  const d=el();
  const t=e.target.closest&&e.target.closest('[data-pf],[data-req],[data-av],[data-pfopen]');if(!t)return;
  const k=t.dataset.pf,p=person(V.id);
  if(t.dataset.pfopen){e.preventDefault();e.stopPropagation();return open(t.dataset.pfopen)}
  if(!d||!d.contains(t))return;
  if(t.dataset.req){const s=load();s.req=t.dataset.req;save(s);return draw()}
  if(t.dataset.av){const s=load();s.pfp=+t.dataset.av;save(s);return draw()}
  if(k=='close')close();
  else if(k=='back'){V.id=V.stack.pop()||'me';V.mode='view';V.msg='';draw()}
  else if(k=='edit'){V.mode='edit';V.err='';draw()}
  else if(k=='priv'){V.mode='priv';draw()}
  else if(k=='done'){V.mode='view';draw()}
  else if(k=='visitor'){V.visitor=V.visitor?0:1;draw()}
  else if(k=='savee'){
   const ue=document.getElementById('pf-user'),be=document.getElementById('pf-bio'),s0=load();
   const u=(s0.userAt&&left(s0)?s0.user:ue.value.trim().toLowerCase()),b=be.value.trim().replace(/\s+/g,' ');
   if(!/^[a-z0-9_]{3,16}$/.test(u)){V.err='Username must be 3 to 16 characters: letters, numbers or underscore. No spaces or symbols.';return draw()}
   if(/^_|_$|__/.test(u)||/^\d+$/.test(u)){V.err='Username cannot start or end with an underscore, repeat underscores, or be only numbers.';return draw()}
   if(RESERVED.test(u)){V.err='That username is reserved.';return draw()}
   if(b.length>80){V.err='Bio is over 80 characters.';return draw()}
   if(/[<>{}\[\]\\|^~`]/.test(b)||/[\u0300-\u036f\u200b-\u200f\u202a-\u202e]/.test(b)){V.err='Bio has characters that are not allowed.';return draw()}
   if(BLOCK.test(b)||BLOCK.test(u)){V.err='That text is not allowed. Remove links and rude words.';return draw()}
   const s=load();if(u!==s.user){s.user=u;s.userAt=Date.now()}s.bio=b;const cs=document.getElementById('pf-car');if(cs)s.career=cs.value;save(s);V.err='';V.mode='view';V.msg='Saved to the dev save.';draw()}
  else if(k=='add'){REL[p.id]='requested';V.msg='Friend request sent to @'+p.user+'. (Mock: nothing was sent.)';draw()}
  else if(k=='cancel'){REL[p.id]='none';V.msg='Request cancelled.';draw()}
  else if(k=='invite'){V.msg=p.rel=='friend'||REL[p.id]=='friend'?'Invite sent to @'+p.user+'. (Mock: nothing was sent.)':'You can invite friends only. Add them first.';draw()}
  else if(k=='block'){REL[p.id]=stateFor(p)=='blocked'?'none':'blocked';V.msg=REL[p.id]=='blocked'?'Blocked. They cannot send you requests or invites.':'Unblocked.';draw()}
  else if(k=='report'){V.msg='Report sent. (Mock: a real report would flag the name, bio and avatar for review.)';draw()}
 });
 document.addEventListener('change',e=>{const s=e.target.dataset&&e.target.dataset.sw;if(!s)return;const o=load();o.show[s]=e.target.checked?1:0;save(o)});
 document.addEventListener('keydown',e=>{if(e.key=='Escape'&&el()){e.stopImmediatePropagation();close()}},true);

 /* ---------- mock Friends window (the real one needs the cloud) ---------- */
 function friendsWin(){
  const old=document.getElementById('pfx');if(old)old.remove();
  const d=document.createElement('div');d.id='pfx';d.onmousedown=e=>{if(e.target===d)d.remove()};
  const row=id=>{const p=PEOPLE[id];return`<div class=pf-row data-pfopen="${id}">${avatar(p.seed,32)}<span class=n><b>@${esc(p.user)}</b><small>${esc(p.artist)} · ${esc(p.online)}</small></span>${id in REL&&REL[id]=='requested'?tag('REQUESTED'):''}</div>`};
  d.innerHTML=`<div class=fwpc><div class=pf-top><span>FRIENDS (MOCK)</span><button data-pffc>Close</button></div>
  <div class=pf-sec><div class=pf-row data-pfopen="me" style="cursor:pointer">${avatar(load().pfp,32)}<span class=n><b>My profile</b><small>@${esc(load().user)}</small></span></div></div>
  <div class="pf-sec pf-list"><h3>REQUESTS</h3>${REQUESTS.map(row).join('')}</div>
  <div class="pf-sec pf-list"><h3>FRIENDS</h3>${FRIENDS.map(row).join('')}</div>
  <div class="pf-sec pf-list"><h3>SUGGESTED</h3>${OTHERS.map(row).join('')}</div>
  <p class=pf-note>Sample list. The real Friends window needs the cloud, which is switched off in the dev build. Tap a name to open the profile.</p></div>`;
  d.addEventListener('click',e=>{if(e.target.closest('[data-pffc]'))d.remove()});
  document.body.appendChild(d);
 }

 /* ---------- entry points ---------- */
 const pfBtn=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.className='fwpf-b';b.onclick=fn;return b};
 /* The only way in: the avatar in the top right of the main menu, next to the account chip. */
 g(()=>{const t0=titleUI;titleUI=function(){const r=t0.apply(this,arguments);try{
  const t=document.getElementById('ttl');if(!t||t.querySelector('.fwpf-ic'))return r;
  let c=t.querySelector('.ttpf');if(!c){c=document.createElement('div');c.className='ttpf';t.insertBefore(c,t.firstChild)}
  const old=c.querySelector('img,i');const b=document.createElement('button');b.type='button';b.className='fwpf-ic';b.title='Your profile';b.setAttribute('aria-label','Open your profile');
  b.innerHTML=old&&old.tagName=='IMG'?old.outerHTML:avatar(load().pfp,32);b.onclick=()=>open('me');
  if(old)old.replaceWith(b);else c.insertBefore(b,c.firstChild)}catch(e){}return r}});
 /* Friends window: replace with the mock one */
 /* ---------- DEV panel hooks ---------- */
 window.FW_PROFILE={open,friendsWin,mockBand(){
  let el2=document.getElementById('mpb');if(!el2){el2=document.createElement('div');el2.id='mpb';el2.className='hb';document.body.appendChild(el2)}
  el2.style.display='';el2.innerHTML='<div class=mph><span><b>Static Orchard</b> <small class=m>Room MOCK1</small></span></div>'+[['You (Keys)','me'],['Marlo','marlo'],['Juno','juno'],['Ines','ines']].map(n=>`<div class=mpr><span><b class=fwpf-n data-pfopen="${n[1]}">${n[0]}</b></span></div>`).join('');
 }};
})();
