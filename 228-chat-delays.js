/* ===== v51.5.0: realistic waits =====
   1. Replies from artists, agents and other contacts show "typing..." for a time that grows with the reply length (about 1-3 s).
      The reply is worked out the moment you send (so game state is the same as before); its message lines are held in S.typ
      and added to the chat when the time is up. S.typ is saved, so a save, quit or reload never loses a held reply.
   (While a reply is held, the chat's input and Send button are disabled; this is drawn from S.typ on every redraw so it cannot stick.)
   2. App Barn installs and the Download Label HQ link take 2-3 s with a progress bar. The payment happens at once; the app itself
      is held in S.dl (saved) and appears on the desktop when the bar fills, even if you left the screen or reloaded.
   Wraps sendMsg (16/76), inst (10/103/146), bdGetHQ (223), pcR. Loads after 227. Balance is untouched. */
(function(){
 const now=()=>Date.now();
 const typ=()=>Array.isArray(S.typ)?S.typ:(S.typ=[]),dl=()=>S.dl&&typeof S.dl=='object'?S.dl:(S.dl={});
 const chatOpen=id=>{try{return app=='msg'&&mode=='pc'&&S.chat==id}catch(e){return false}};
 /* ---- typing ---- */
 function typeMs(ent){let n=0;ent.forEach(x=>{n+=String(x&&x.t||'').length});return Math.max(900,Math.min(3200,650+n*28+RI(0,400)))}
 {const sm=sendMsg;sendMsg=function(){
  try{
   const m=S.msgs.find(x=>x.id==S.chat),i=$('cin'),t=i?i.value.trim():'';
   if(!m||m.a===undefined||m.g||!t||TY||typ().some(p=>p.id==m.id))return sm.apply(this,arguments);
   m.log.push({f:'me',t,d:S.day});i.value='';snd('pop');
   const n0=m.log.length;try{reply(m,t)}catch(e){console.error('reply',e)}
   const ent=Array.isArray(m.log)&&m.log.length>=n0?m.log.splice(n0):[];
   if(!ent.length){TY=0;pcR();return}
   typ().push({id:m.id,end:now()+typeMs(ent),ent});TY=m.id;pcR();
  }catch(e){console.error('typing',e);return sm.apply(this,arguments)}
 }}
 function deliver(p){
  const m=S.msgs.find(x=>x.id==p.id);
  if(m&&Array.isArray(m.log)){p.ent.forEach(x=>m.log.push(x));if(chatOpen(m.id)){snd('ping');pcR();try{const i=$('cin');if(i)i.focus()}catch(e){}}else m.unread=1}
  if(TY==p.id&&!typ().some(q=>q!==p&&q.id==p.id))TY=0;
 }
 /* ---- installs ---- */
 let hold=null;
 function startDl(k,ms,msg){dl()[k]={end:now()+ms,ms,msg:msg||''}}
 {const i0=inst;inst=function(k){
  const a=APPD[k];
  if(!a||!S.apps||S.apps[k]||dl()[k]||k=='store')return dl()[k]?undefined:i0.apply(this,arguments);
  const say0=say,cap=[];say=function(t){cap.push(t)};let r;
  try{r=i0.apply(this,arguments)}finally{say=say0}
  if(S.apps[k]){delete S.apps[k];startDl(k,1800+RI(0,1200),cap.length?cap[cap.length-1]:'Installed '+a.n);try{pcR()}catch(e){}}
  else cap.forEach(t=>say(t));
  return r}}
 if(typeof bdGetHQ=='function'||window.bdGetHQ){const g0=window.bdGetHQ;window.bdGetHQ=function(){
  if(S.apps&&S.apps.hq)return g0.apply(this,arguments);
  if(dl().hq)return;
  S.hqLink=1;snd('click');startDl('hq',2200+RI(0,800),'Label HQ downloaded. Find it on your desktop.');pcR()}}
 function finish(k){
  const d=dl()[k];delete dl()[k];if(!d)return;
  if(S.apps&&!S.apps[k]){S.apps[k]=1;snd('chime');say(d.msg||('Installed '+(APPD[k]?APPD[k].n:'app')));try{updateVersion()}catch(e){}}
  if(mode=='pc'){try{pcR()}catch(e){}}
 }
 /* ---- progress bar on the buttons (re-applied on every redraw; the CSS animation resumes at the right point) ---- */
 {const st=document.createElement('style');st.textContent='.cin input:disabled{opacity:.55;cursor:not-allowed}.cin button:disabled{opacity:.45;cursor:not-allowed}.dlbar{position:relative;min-width:120px;height:26px;border:2px solid #3c5a4a;background:#10201a;border-radius:4px;overflow:hidden;color:#cfe;font:10px Silkscreen,monospace;display:inline-flex;align-items:center;justify-content:center}.dlbar i{position:absolute;left:0;top:0;bottom:0;width:100%;background:#3fae6a;transform-origin:left;transform:scaleX(0);animation:dlfill linear forwards}.dlbar span{position:relative}@keyframes dlfill{to{transform:scaleX(1)}}';document.head.appendChild(st)}
 function bar(d){const el=document.createElement('div');el.className='dlbar';const left=Math.max(0,d.end-now()),i=document.createElement('i');i.style.animationDuration=(d.ms||left)+'ms';i.style.animationDelay='-'+Math.max(0,(d.ms||left)-left)+'ms';const s=document.createElement('span');s.textContent='Downloading...';el.appendChild(i);el.appendChild(s);return el}
 {const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{
  if(chatOpen(S.chat)&&typ().some(p=>p.id==S.chat)){const i=$('cin');if(i){i.disabled=true;i.placeholder='Waiting for a reply...';const b=i.parentNode&&i.parentNode.querySelector('button');if(b)b.disabled=true}}
  const D=dl();for(const k in D){if(S.apps&&S.apps[k])continue;
   document.querySelectorAll('#pc button[onclick="inst(\''+k+'\')"]'+(k=='hq'?',#pc button[onclick="bdGetHQ()"]':'')).forEach(b=>b.replaceWith(bar(D[k])))}
 }catch(e){}return r}}
 /* ---- one tick: finish anything due, including after a reload ---- */
 setInterval(()=>{try{
  if(!S)return;const t=now(),T=typ();
  for(let j=T.length-1;j>=0;j--){if(T[j].end<=t){const p=T.splice(j,1)[0];deliver(p)}}
  if(T.length&&!TY)TY=T[0].id;
  const D=dl();for(const k in D)if(D[k].end<=t)finish(k)
 }catch(e){console.error('delays',e)}},200);
})();
