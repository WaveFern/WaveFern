/* ---------- v49.80.0: public profile, tied to the username chosen in 208-onboarding.js ----------
   The username is reserved in the Realtime Database (f/n/HANDLE = uid, one owner per name, enforced by the rules) and the same name is copied to the
   public profile in Firestore (profiles/{uid}: a artist name, h username, bio, fame, lis listeners, t). Any signed-in player can open a profile by username;
   only the owner writes theirs. Open one with fwProfileOpen('name') (Friends has a Profile button). */
(function(){
if(typeof FW_ACCT=='undefined'||!FW_ACCT||typeof FW_TRL!='undefined'&&FW_TRL)return;
const cl=(v,m)=>Math.max(0,Math.min(m,Math.floor(+v||0)));
const live=()=>typeof FBU!='undefined'&&FBU&&typeof FBF!='undefined'&&FBF&&typeof FBD!='undefined'&&FBD;
let lastSig='',lastAt=0,busy=0,ownF=0;
const enc=u=>new Promise(r=>{const done=v=>{window.__pfPdU=u;window.__pfPd=v;r()};try{if(localStorage.getItem('fw_pd_off')==u)return done('');const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.drawImage(im,0,0,64,64);const v=c.toDataURL('image/jpeg',.7);done(v.length<=12000?v:'')}catch(e){done('')}};im.onerror=()=>{try{localStorage.setItem('fw_pd_off',u)}catch(e){}done('')};/* Google sometimes sends the photo without CORS headers; remember that so the console error is not repeated */im.src=u}catch(e){done('')}setTimeout(()=>{if(window.__pfPdU!==u)done('')},8000)});
window.fwProfileSync=function(force){try{
 const h=typeof fwUsername=='function'?fwUsername():'';if(busy||!live()||!h||typeof S!='object'||!S||!S.artist||mode=='creator')return Promise.resolve(0);
 const a=String((typeof fwDisplayName=='function'&&fwDisplayName())||S.artist).replace(/[<>"]/g,'').slice(0,24);if(!a)return Promise.resolve(0);
 const gp=f=>{try{return f()}catch(e){return undefined}};
 const ph=gp(()=>JSON.parse(localStorage.getItem('fw_prof_mock')).gphoto)===0?'':String(gp(()=>FBU.photoURL)||'');const sgs=((S.songs)||[]).slice().sort((x,y)=>(y.streams||0)-(x.streams||0)).slice(0,5).map(x=>String(x.title||'Song').replace(/[<>"|]/g,'').slice(0,40)+'|'+cl(x.streams,1e13));
 const ts=cl(S.songs&&S.songs.reduce((q,x)=>q+(x.streams||0),0),1e13),fl=cl(gp(()=>fameLevel()),1000),lq=cl(S.listeners,1e12),ns=(S.songs||[]).length;
 const ac=[ns>=1,ns>=10,lq>=1e5,lq>=1e6,fl>=25,fl>=50,!!gp(()=>MPS&&MPS.band),ts>=1e9].reduce((q,v,i)=>q|(v?1<<i:0),0);
 const mb=gp(()=>MPS&&MPS.band)?String(MPS.band).replace(/[<>"]/g,'').slice(0,24):'';
 if(ph&&!busy&&window.__pfPdU!==ph){busy=1;return enc(ph).then(()=>{busy=0;return fwProfileSync(force)})}
 const d={a,h,bio:'',pd:ph&&window.__pfPd||'',fame:fl,lis:lq,p:/^https:\/\/[a-z0-9.-]*googleusercontent\.com\//.test(ph)&&ph.length<=300?ph:'',j:cl(Date.parse(gp(()=>FBU.metadata.creationTime)||''),4e12)||Date.now(),sg:sgs,bn:mb,bi:mb?String(gp(()=>iName(MPS.inst))||'').slice(0,12):'',bm:mb?cl(gp(()=>Object.keys(MB).length)||1,50):0,ac},sig=JSON.stringify(d)+FBU.uid,n=Date.now();
 if(!force&&sig==lastSig&&n-lastAt<900000)return Promise.resolve(0);busy=1;
 return FBF.getDoc(FBF.doc(FBD,'profiles',FBU.uid)).then(x=>{if(x.exists()&&typeof x.data().bio=='string')d.bio=x.data().bio.slice(0,160);
   /* v49.93.0: profiles/{uid}.founder (number, 1 = Founder, 0 = not) is set by the admin in the console and is kept as it is. Only a Founder with no f yet is written as 1 */
   const ef=x.exists()?x.data().founder:undefined;ownF=0;if(ef===1||ef===0||ef===true||ef===false){d.founder=+ef;ownF=1;return}
   /* the rules only accept founder = 1 when the admin has listed this account in founders/{uid}, so ask for that entry instead of trusting the local Founder badge */
   return FBF.getDoc(FBF.doc(FBD,'founders',FBU.uid)).then(f=>{if(f.exists()){const v=f.data().f;if(v===undefined||v===null||v===true||+v===1)d.founder=1}},()=>{})},()=>{})
  .then(()=>{const core=Object.assign({},d,{t:Date.now()}),rf=FBF.doc(FBD,'profiles',FBU.uid);return FBF.setDoc(rf,core).catch(e0=>{window.__pfErr=(e0&&e0.code)||'error';const c2={a:core.a,h:core.h,bio:core.bio,fame:core.fame,lis:core.lis,t:core.t};/* the Founder flag is only repeated when the stored profile already has it; a new flag the rules refuse (no founders/ entry yet) must not stop the rest of the profile saving */if(ownF&&(core.founder===0||core.founder===1))c2.founder=core.founder;console.warn('[profile] full write refused ('+((e0&&e0.code)||'error')+'), saved the basic profile');return FBF.setDoc(rf,c2)})}).then(()=>{lastSig=sig;lastAt=n;return 1},e=>{console.warn('[profile] write',e&&e.code);window.__pfErr=window.__pfErr||((e&&e.code)||'error');return 0}).finally(()=>{busy=0})}catch(e){return Promise.resolve(0)}};
setInterval(()=>{try{if(mode=='play'||mode=='pause')fwProfileSync()}catch(e){}},20000);
setTimeout(()=>{try{if(mode=='play'||mode=='pause')fwProfileSync(1)}catch(e){}},8000);setInterval(()=>{try{if(mode=='play'||mode=='pause'){const k=live()?FBU.uid:'';if(k&&k!==window.__pfU){window.__pfU=k;fwProfileSync(1)}}}catch(e){}},5000);
const num=n=>Math.round(+n||0).toLocaleString();

const ACH=[['First release','Released a first song'],['Ten songs','Released 10 songs'],['100K listeners','Reached 100,000 monthly listeners'],['1M listeners','Reached 1,000,000 monthly listeners'],['Fame level 25','Reached fame level 25'],['Fame level 50','Reached fame level 50'],['Joined a band','Played in a band'],['One billion streams','Passed 1,000,000,000 total streams']];
const NI='<svg viewBox="0 0 8 8" width="96" height="96" style="image-rendering:pixelated;display:block"><rect width="8" height="8" fill="#0a0d0b"/><g fill="#2fe68a"><rect x="2" y="1" width="4" height="1"/><rect x="1" y="2" width="6" height="3"/><rect x="2" y="5" width="4" height="1"/></g></svg>';
if(!document.getElementById('pubpfcss')){const c=document.createElement('style');c.id='pubpfcss';c.textContent=`#pubpf .pp{width:min(520px,100%);max-height:92vh;overflow:auto;background:#000;border:3px solid #2e2e2e;color:#e8f3ec;font:14px ui-monospace,Menlo,Consolas,monospace}
#pubpf .pp.fdo{border-color:#2fe68a;box-shadow:0 0 0 2px #000,0 0 0 4px #2fe68a66,0 0 22px #2fe68a88}
#pubpf .pp *{box-sizing:border-box}#pubpf .pt{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:2px solid #2e2e2e;font:11px Silkscreen,monospace;letter-spacing:1px;color:#8aa094}
#pubpf .ph{display:flex;gap:16px;padding:20px 16px 16px}#pubpf .pa{flex:none;width:96px;height:96px;border:2px solid #2fe68a;background:#0a0d0b;overflow:hidden}#pubpf .pa img{width:100%;height:100%;object-fit:cover;display:block}
#pubpf .pn{margin:0;font:700 22px/1.15 Silkscreen,monospace;word-break:break-word}#pubpf .pu{margin:4px 0 0;color:#8aa094}
#pubpf .pg{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}#pubpf .pg span{padding:2px 6px;border:1px solid #2e2e2e;color:#8aa094;font:10px Silkscreen,monospace;line-height:14px}#pubpf .pg span.g{border-color:#2fe68a;color:#2fe68a}
#pubpf .pb{margin:0;padding:0 16px 16px;line-height:1.5}#pubpf .pb.e{color:#8aa094}
#pubpf .ps{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid #2e2e2e;border-bottom:2px solid #2e2e2e}#pubpf .ps div{padding:12px 16px;border-right:2px solid #2e2e2e;min-width:0}#pubpf .ps div:last-child{border:0}
#pubpf .ps small{display:block;color:#8aa094;font:10px Silkscreen,monospace;margin-bottom:4px}#pubpf .ps b{font-size:15px}
#pubpf .pc{padding:16px;border-bottom:2px solid #2e2e2e}#pubpf .pc h3{margin:0 0 10px;font:11px Silkscreen,monospace;letter-spacing:1px;color:#2fe68a}
#pubpf .pr{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #1c221e}#pubpf .pr:last-child{border:0}#pubpf .pr .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#pubpf .pr .v,#pubpf .pr .i{color:#8aa094}
#pubpf .pk{display:grid;grid-template-columns:auto 1fr;gap:6px 16px}#pubpf .pk span{color:#8aa094}
#pubpf .pl{display:grid;grid-template-columns:1fr 1fr;gap:8px}#pubpf .pl div{border:1px solid #2e2e2e;padding:8px 10px}#pubpf .pl div.lk{opacity:.4}#pubpf .pl small{display:block;color:#8aa094;margin-top:2px}
#pubpf .px{padding:14px 16px}@media(max-width:480px){#pubpf .ph{flex-direction:column}#pubpf .pl{grid-template-columns:1fr}}`;document.head.appendChild(c)}
const pic=u=>/^https:\/\/[a-z0-9.-]*googleusercontent\.com\//.test(u||'')?'<img src="'+esc(u)+'" referrerpolicy=no-referrer alt="" onerror="this.outerHTML=\''+NI.replace(/'/g,"\\'").replace(/"/g,'&quot;')+'\'">':NI;
const fd=ts=>ts>0?new Date(ts).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Unknown';
function ppHtml(p,handle,me){
 const sg=(Array.isArray(p.sg)?p.sg:[]).slice(0,5).map(x=>String(x).split('|')),ac=+p.ac||0;
 const n=Math.round(+p.fame||0);
 let h='<div class="pp'+(p.founder?' fdo':'')+'"><div class=pt><span>'+(me?'YOUR PROFILE':'PLAYER PROFILE')+'</span><button onclick="document.getElementById(\'pubpf\').remove()">Close</button></div>';
 h+='<div class=ph><div class=pa>'+pic(p.p)+'</div><div style="min-width:0;flex:1"><h2 class=pn>'+esc(p.a||'')+'</h2><p class=pu>@'+esc(handle)+'</p><div class=pg>'+(p.founder?'<span class=g>FOUNDER</span>':'')+'<span>FAME LEVEL '+n+'</span></div></div></div>';
 h+=p.bio?'<p class=pb>'+esc(p.bio)+'</p>':'<p class="pb e">No bio.</p>';
 h+='<div class=ps><div><small>FAME LEVEL</small><b>'+n+'</b></div><div><small>MONTHLY LISTENERS</small><b>'+num(p.lis)+'</b></div><div><small>JOINED</small><b>'+fd(+p.j)+'</b></div></div>';
 h+='<div class=pc><h3>TOP SONGS</h3>'+(sg.map((s,i)=>'<div class=pr><span class=i>'+(i+1)+'</span><span class=n>'+esc(s[0])+'</span><span class=v>'+num(s[1])+'</span></div>').join('')||'<span class=pu>No songs yet.</span>')+'</div>';
 if(p.bn)h+='<div class=pc><h3>BAND</h3><div class=pk><span>Band</span><b>'+esc(p.bn)+'</b>'+(p.bi?'<span>Plays</span><div>'+esc(p.bi)+'</div>':'')+(p.bm?'<span>Members</span><div>'+num(p.bm)+'</div>':'')+'</div></div>';
 const got=ACH.filter((_,i)=>ac>>i&1).length;
 h+='<div class=pc><h3>ACHIEVEMENTS ('+got+'/'+ACH.length+')</h3><div class=pl>'+ACH.map((a,i)=>'<div class="'+(ac>>i&1?'':'lk')+'"><b>'+a[0]+'</b><small>'+a[1]+'</small></div>').join('')+'</div></div></div>';
 return h}
window.fwProfileOpen=async function(handle,byUid){
 try{fwProfileSync(1)}catch(e){}
 handle=String(handle||'').replace(/^@/,'').toLowerCase();if(!byUid&&!/^[a-z0-9_]{3,16}$/.test(handle))return;
 const X=window.FRX,F=X&&X.FR;if(!F||!F.r||!live())return say('Profiles need you signed in and online.');
 document.getElementById('pubpf')?.remove();
 const o=document.createElement('div');o.id='pubpf';o.style.cssText='position:fixed;inset:0;z-index:99995;background:#000a;display:flex;align-items:center;justify-content:center;padding:12px';o.onclick=e=>{if(e.target===o)o.remove()};
 const box=h=>{o.innerHTML='<div class="box modal" style="width:min(380px,94vw)">'+h+'<div class=row2 style="margin-top:10px"><button onclick="document.getElementById(\'pubpf\').remove()">Close</button></div></div>'};
 const full=(p,handle,me,uid)=>{const P=window.FW_PROFILE;if(P&&P.open&&me){o.remove();P.open('me');return}if(P&&P.openData&&!me){o.remove();const sg=(Array.isArray(p.sg)?p.sg:[]).slice(0,5).map(x=>String(x).split('|')).map(x=>[x[0],+x[1]||0,0]);
  const ac=+p.ac||0;const pd=/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(p.pd||'')?p.pd:'';P.openData({uid:uid||'',artist:p.a||'',user:handle,founder:p.founder?1:0,fame:Math.round(+p.fame||0),listeners:+p.lis||0,joined:+p.j||0,bio:p.bio||'',songs:sg,band:p.bn?{name:p.bn,inst:p.bi||'',members:+p.bm||1}:null,ach:ACH.map((_,i)=>i).filter(i=>ac>>i&1),photo:pd||/^https:\/\/[a-z0-9.-]*googleusercontent\.com\//.test(p.p||'')?p.p:''});return}
  o.innerHTML=ppHtml(p,handle,me)};
 box('<p class=m>Loading…</p>');document.body.appendChild(o);
 try{const{R,db}=F.r,uid=byUid||(await R.get(R.ref(db,'f/n/'+handle))).val();
  if(!uid){box('<h2>@'+esc(handle)+'</h2><p class=m>No player has that username.</p>');return}
  const [d,lb]=await Promise.all([FBF.getDoc(FBF.doc(FBD,'profiles',uid)),FBF.getDoc(FBF.doc(FBD,'leaderboard',uid)).catch(()=>null)]);let p=d.exists()?d.data():null;
  /* v49.91.0: the leaderboard row is the single source of truth for the numbers, so a profile always shows what the board shows */
  const L=lb&&lb.exists&&lb.exists()?lb.data():null;
  if(L){if(!p)p={a:L.a||'',h:handle,bio:'',fame:L.fame,lis:L.lis,founder:!!L.f};else p=Object.assign({},p,{fame:L.fame,lis:L.lis})}
  if(!p){box('<h2>'+(handle?'@'+esc(handle):'Player')+'</h2><p class=m>This player has not opened the game since profiles started, so there is nothing to show yet.</p>');return}
  if(byUid&&p.h)handle=p.h;const me=uid==FBU.uid;
  full(p,handle,me,uid)
 }catch(e){console.warn('[profile]',e);box('<h2>@'+esc(handle)+'</h2><p class=m>Could not load this profile.</p>')}};
})();
