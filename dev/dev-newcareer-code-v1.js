/* WaveFern dev: enter a save code when starting a new career. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Adds "Enter save code" under "+ New career" on the career select screen. The code is checked with the game's own save code rules
   (scClean, scDecode, the FW4 seal check, the legacy cutoff, scClean2/scCheck). If it is good it goes into a career slot and the page
   reloads, so the game's normal boot loads it with its usual recovery (a code that fails to load is kept under Recovered backups).
   An empty slot is used first. A used slot is only replaced after a confirmation, and the career it replaces is kept under Recovered backups. */
(function(){
 if(!window.FW_DEV||/[?&]nosc/.test(location.search))return;
 if(typeof ttWorlds!='function'||typeof scDecode!='function')return;
 const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 /* returns {code,artist,day} or throws an Error with a message fit to show the player */
 function check(raw){
  const c=scClean(raw);
  if(!c)throw new Error('Paste a save code first.');
  if(c.toLowerCase()=='test')throw new Error('That is not a save code.');
  if(!/^FW[1234]-/i.test(c))throw new Error('That is not a WaveFern save code. It should start with FW4-, FW3-, FW2- or FW1-.');
  const sealed=c.slice(0,4).toUpperCase()=='FW4-';
  if(!sealed&&Date.now()>SEAL_LEGACY_UNTIL)throw new Error('This is an old unprotected save code and can not be loaded any more.');
  let d;
  try{d=scDecode(c)}catch(e){throw new Error(sealed?SEAL_BAD:'This save code is damaged or cut short. Copy the whole code again.')}
  if(!d||typeof d!='object'||!d.S||typeof d.S!='object')throw new Error('There is no career in this code.');
  try{scClean2(d);if(!sealed||d.x)scCheck(JSON.parse(JSON.stringify(d.S)),true)}catch(e){throw new Error('This save code did not pass the safety check.')}
  return{code:c,artist:String(d.S.artist||'').slice(0,40),day:Math.max(1,+d.S.day||1)};
 }
 function slots(){
  const a=curSlot(),o=[];
  for(let n=1;n<=SLOTS;n++){const i=n==a?(TT.game?{artist:S.artist||'',day:S.day||0}:slotInfo(n)):slotInfo(n);o.push({n,i})}
  return o;
 }
 function close(){const m=document.getElementById('ncsc');if(m)m.remove()}
 function msg(t,ok){const m=document.getElementById('ncscm');if(!m)return;m.textContent=t;m.style.color=ok?'var(--g)':'#ff6b6b';m.style.borderColor=ok?'var(--g)':'#ff6b6b';m.style.display=t?'block':'none'}
 function open(){
  snd('click');close();
  const sl=slots(),free=sl.find(x=>!x.i);
  const d=document.createElement('div');d.id='ncsc';
  d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000c';
  const opts=sl.map(x=>`<option value="${x.n}"${(free?free.n==x.n:x.n==1)?' selected':''}>Career ${x.n}: ${x.i?E(x.i.artist||'Unnamed artist')+' (Day '+(x.i.day||1)+'), will be replaced':'Empty slot'}</option>`).join('');
  d.innerHTML=`<div class="box modal" style="width:min(420px,92vw);position:relative;left:auto;top:auto;transform:none;max-height:94vh;overflow:auto"><h2>Enter save code</h2>
   <p class=m><small>Paste a WaveFern save code to start a career from it. Nothing is changed until the code checks out.</small></p>
   <textarea id=ncsct rows=4 spellcheck=false autocomplete=off placeholder="Paste your save code here (FW4-...)"></textarea>
   <p class=m style="margin:8px 0 2px"><small>Put it in:</small></p>
   <select id=ncscs style="width:100%;box-sizing:border-box;font:inherit;background:#0a0d0b;color:var(--t);border:2px solid #333;padding:6px">${opts}</select>
   <div id=ncscm style="display:none;margin-top:10px;padding:8px;border:2px solid;background:#000;font-size:13px;line-height:1.4"></div>
   <div class=row2 style="margin-top:12px"><button class=go id=ncscg>Load code</button><button id=ncscx>Cancel</button></div></div>`;
  document.body.appendChild(d);
  const t=document.getElementById('ncsct');setTimeout(()=>{try{t.focus()}catch(e){}},50);
  document.getElementById('ncscx').onclick=()=>{snd('click');close()};
  d.addEventListener('mousedown',e=>{if(e.target===d)close()});
  d.addEventListener('keydown',e=>{e.stopPropagation();if(e.key=='Escape')close()});
  d.addEventListener('keyup',e=>e.stopPropagation());
  document.getElementById('ncscg').onclick=()=>go();
 }
 function go(){
  const t=document.getElementById('ncsct'),s=document.getElementById('ncscs');if(!t||!s)return;
  let r;try{r=check(t.value)}catch(e){snd('err');return msg(e.message,0)}
  const n=+s.value,old=slots().find(x=>x.n==n);
  if(old&&old.i&&!confirm('Replace career '+n+(old.i.artist?' ('+old.i.artist+')':'')+' with the career from this code? The career it replaces is kept under Recovered backups.'))return msg('Cancelled. Nothing was changed.',0);
  /* keep what is in the slot before touching it */
  let prev=null;try{if(old&&old.i){if(n==curSlot()&&TT.game)autoSave();prev=localStorage.getItem(slotKey(n))}}catch(e){}
  if(prev&&prev!==r.code){let kept=false;try{kept=bakKeep(prev,'Replaced by a pasted save code')}catch(e){}if(!kept){snd('err');return msg('There is no room to back up the career in that slot, so nothing was changed. Delete a recovered backup first, or pick an empty slot.',0)}}
  wiping=true;
  try{
   localStorage.setItem(slotKey(n),r.code);localStorage.setItem(SLOT_K,n);
   sessionStorage.setItem('fw_go','1');sessionStorage.setItem('fw_msg','Loaded '+(r.artist||'your career')+' (Day '+r.day+') from your save code');
   if(typeof FBU!='undefined'&&FBU&&typeof CS_KEY!='undefined')localStorage.setItem(CS_KEY,JSON.stringify({uid:FBU.uid,t:CLD.t}));
  }catch(e){wiping=false;snd('err');return msg('Could not save on this device (no space?). Nothing was loaded.',0)}
  snd('chime');msg('Save code is good: '+(r.artist||'career')+', Day '+r.day+'. Loading...',1);
  document.getElementById('ncscg').disabled=true;
  setTimeout(()=>location.reload(),700);
 }
 window.NCSC={open,check};
 const w0=ttWorlds;
 ttWorlds=function(){
  const r=w0.apply(this,arguments);
  try{
   const w=document.querySelector('#ttl .ttw'),nc=w&&w.querySelector('.ttnc');
   if(nc&&!w.querySelector('.ncsc-b')){const b=document.createElement('button');b.className='ncsc-b';b.textContent='Enter save code';b.setAttribute('onclick','NCSC.open()');nc.insertAdjacentElement('afterend',b)}
  }catch(e){console.error('save code button',e)}
  return r;
 };
 if(document.getElementById('ttl')&&typeof TT=='object'&&TT.on&&TT.sel)ttWorlds();
})();
