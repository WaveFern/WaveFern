/* ===== v49.35.0: Spotifly Team messages live in the Spotifly app, with notifications =====
   - Messages from the Spotifly Team (welcome, Fresh Finds, hits, viral songs, catalogue boosts, plaques and so on) no
     longer land in Messages. They move into a Notifications page inside Spotifly (a sidebar button on the computer, a
     tab in the Gphone app), drawn in Spotifly's dark green and black.
   - A new one pops a Spotifly-style notification card in the top right corner; click it to open the page. The Spotifly
     desktop icon, taskbar button and Gphone tile show how many are unread.
   - Old saves: their Spotifly Team messages move over quietly when the save loads.
   State: S.sfN (list of {id,body,day,unread}). Wrapped in an IIFE. */
(function(){
const FROM=['Spotifly Team','WaveFern Team'];
if(!Array.isArray(S.sfN))S.sfN=[];
const isSf=m=>m&&m.a===undefined&&FROM.includes(m.from);
const unread=()=>(Array.isArray(S.sfN)?S.sfN:[]).filter(n=>n.unread).length;
window.sfUnread=unread;
const short=t=>{t=String(t||'');return t.length>110?t.slice(0,107).replace(/\s+\S*$/,'')+'...':t};
/* move Spotifly Team messages out of Messages; quiet=1 for loads and new games */
function sweep(quiet){try{if(!Array.isArray(S.msgs))return;if(!Array.isArray(S.sfN))S.sfN=[];
 const got=S.msgs.filter(isSf);if(!got.length)return;S.msgs=S.msgs.filter(m=>!isSf(m));
 got.forEach(m=>S.sfN.push({id:m.id,body:String(m.body==null?'':m.body),day:m.day==null?S.day:m.day,unread:quiet?(m.unread?1:0):1}));
 if(S.sfN.length>80)S.sfN=S.sfN.slice(-80);
 if(!quiet)got.slice(-3).forEach(m=>pop(m.body));
 if(typeof updateVersion=='function'&&!quiet)try{updateVersion()}catch(e){}}catch(e){console.error('spotifly inbox',e)}}
window.sfSweep=sweep;
/* the pop-up card */
let box=null;
function pop(body){try{if(!box||!document.body.contains(box)){box=document.createElement('div');box.id='sfincb';document.body.appendChild(box)}
 const d=document.createElement('button');d.className='sfinc';d.type='button';
 d.innerHTML=`<img src="${IC.fw}" alt=""><span><b>Spotifly</b><small>now</small><br>${esc(short(body))}</span>`;
 d.onclick=()=>{d.remove();sfOpenN()};box.appendChild(d);while(box.children.length>3)box.firstChild.remove();
 requestAnimationFrame(()=>d.classList.add('in'));setTimeout(()=>{d.classList.remove('in');setTimeout(()=>d.remove(),300)},7000)}catch(e){}}
window.sfOpenN=function(){try{if(mode=='pc'){app=1;smo=0;pg='notif';pcR();return}if(mode=='phone'){PH.app='sf';PH.view=null;PH.sft='nt';phR();return}say('Open Spotifly on your laptop or Gphone to read it.')}catch(e){}};
/* the list, used by both the computer page and the phone tab */
function list(ph){const L=(S.sfN||[]).slice().reverse();
 const h=L.length?L.map(n=>`<div class="sfnr${n.unread?' nw':''}"><img src="${IC.fw}" alt=""><div><div class=sfnh><b>Spotifly Team</b><small>Day ${n.day||1}</small></div><p>${esc(n.body)}</p></div></div>`).join(''):`<p class=sfne>Nothing yet. News about your songs from the Spotifly Team shows up here.</p>`;
 (S.sfN||[]).forEach(n=>n.unread=0);
 return`<div class="sfinp${ph?' ph':''}"><h1>Notifications</h1>${h}</div>`}
PG.notif=()=>list(0);
/* computer: sidebar button and badges */
{const p0=pcR;pcR=function(){sweep();const u=unread(),r=p0.apply(this,arguments);try{
 if(app==1&&S.artist){const sb=document.querySelector('#pc .sb');if(sb&&!sb.querySelector('.sfnnav')){
  if(pg=='notif')sb.querySelectorAll('button.on').forEach(b=>b.classList.remove('on'));
  sb.insertAdjacentHTML('beforeend',`<button class="sfnnav${pg=='notif'?' on':''}" onclick="pg='notif';pcR()">Notifications${u&&pg!='notif'?` <span class=sfbd2>${u}</span>`:''}</button>`)}}
 const n=unread();if(n){document.querySelectorAll('#pc .ico').forEach(i=>{const im=i.querySelector('img');if(im&&im.getAttribute('src')===IC.fw&&!i.querySelector('.sfbd2'))i.insertAdjacentHTML('beforeend',`<span class="sfbd2 ib">${n}</span>`)});
  document.querySelectorAll('#pc .tb button').forEach(b=>{if(b.textContent=='Spotifly'&&!(app==1&&pg=='notif'))b.insertAdjacentHTML('beforeend',` <span class=sfbd2>${n}</span>`)})}
 }catch(e){console.error('spotifly inbox nav',e)}return r}}
/* Gphone: a tab in the Spotifly app and a badge on its tile */
{const g0=gpSf;gpSf=function(){sweep();const nt=PH.sft=='nt',u=unread();let h=g0.apply(this,arguments);if(!S.artist)return h;
 h=h.replace(/(<div class=gstb>[\s\S]*?)(<\/div><div class=gsb>)/,(_,a,b)=>a+`<button class="${nt?'on':''}" onclick="PH.sft='nt';phR()">Alerts${u&&!nt?' ('+u+')':''}</button>`+b);
 if(nt)h=h.replace(/<div class=gsb>[\s\S]*<\/div><\/div>$/,`<div class=gsb>${list(1)}</div></div>`);return h}}
{const r0=phR;phR=function(){sweep();const r=r0.apply(this,arguments);try{const n=unread();if(n&&PH.app=='home')document.querySelectorAll('#ph .phi').forEach(b=>{const o=b.getAttribute('onclick')||'';if(o.includes("'sf'")&&!b.querySelector('.bd'))b.insertAdjacentHTML('beforeend',`<span class=bd>${n}</span>`)})}catch(e){}return r}}
/* loads and new games move things over quietly */
{const l0=loadCode;loadCode=function(){const r=l0.apply(this,arguments);sweep(1);return r}}
{const r0=resetState;resetState=function(){const r=r0.apply(this,arguments);if(!Array.isArray(S.sfN))S.sfN=[];sweep(1);return r}}
sweep(1);
setInterval(()=>sweep(),700);
const st=document.createElement('style');st.textContent=`
#sfincb{position:fixed;top:14px;right:14px;z-index:9000;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none}
.sfinc{pointer-events:auto;display:flex;gap:10px;align-items:flex-start;width:300px;max-width:calc(100vw - 28px);box-sizing:border-box;text-align:left;padding:10px 12px;background:#121212;color:#fff;border:2px solid #000;border-left:5px solid #1db954;border-radius:8px;box-shadow:4px 4px 0 #0008;font-family:inherit;font-size:13px;line-height:1.35;cursor:pointer;transform:translateX(120%);opacity:0;transition:transform .25s,opacity .25s}
.sfinc.in{transform:none;opacity:1}.sfinc:hover{background:#1c1c1c}
.sfinc>span{flex:1;min-width:0}.sfinc img{width:28px;height:28px;flex:none;image-rendering:pixelated}.sfinc b{color:#1db954;font-size:14px}.sfinc small{color:#b3b3b3;margin-left:6px}
.sfinp{flex:1;width:100%;align-self:stretch;text-align:left;padding:26px 32px 30px;min-height:100%;box-sizing:border-box;background:linear-gradient(#1a3a28,#121212 220px);color:#fff}
.sfinp h1{margin:0 0 18px;font-size:30px}
.sfnr{width:100%;box-sizing:border-box;display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin-bottom:8px;background:#181818;border:2px solid #000;border-radius:8px}
.sfnr.nw{background:#1f2b23;border-left:4px solid #1db954}
.sfnr img{width:34px;height:34px;flex:none;image-rendering:pixelated}.sfnr>div{flex:1;min-width:0}
.sfnh{display:flex;justify-content:space-between;gap:8px}.sfnh b{color:#1db954}.sfnh small{color:#b3b3b3}
.sfnr p{margin:4px 0 0;color:#e8e8e8;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}
.sfne{color:#b3b3b3}
.sfinp.ph{padding:4px 0 10px;background:none}.sfinp.ph h1{display:none}.sfinp.ph .sfnr{padding:9px 10px;font-size:12px}.sfinp.ph .sfnr img{width:26px;height:26px}
.sfbd2{display:inline-block;min-width:18px;padding:0 5px;box-sizing:border-box;border-radius:9px;background:#1db954;color:#000;font-size:11px;font-weight:700;line-height:18px;text-align:center}
.sfbd2.ib{position:absolute;top:0;right:12px;border:2px solid #000}
.sfnnav.on{color:#1db954}
@media (max-width:760px){.sfinp{padding:18px}}`;document.head.appendChild(st);
})();
