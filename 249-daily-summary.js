/* v55.21.0: economy and daily fixes (fix list section 6). Loads after 248-dev-tag.js; every change is a wrapper, so the earlier files stay as they are.
   - Morning summary: the Earned card includes the night's Label HQ vinyl and CD sales (window.FW_VIN, added in 231-label-press.js),
     and tapping Earned opens a breakdown under the cards: streams pay, vinyl and CD sales, streams by song.
   - Waking up: toasts raised while the wake chain runs are collapsed to two, plus one "+N more" line.
   - Amazoom: the Gphone block is not added to the shop page any more (Gphones are sold on the Gphone Store site). */
(function(){
/* 1. Morning summary: vinyl money and breakdown */
function morningVinyl(){
 const v=+window.FW_VIN||0;window.FW_VIN=0;
 const h=(S.hist||[])[S.hist.length-1];
 if(!h||h.d!==S.day-1)return;
 if(v>0){h.v=+v.toFixed(2);h.e=+((+h.e||0)+v).toFixed(2)}
 const ec=[...document.querySelectorAll('#ui .box .cards .card')].find(c=>/^Earned/.test(c.textContent));
 if(!ec||ec.dataset.bd)return;
 ec.dataset.bd=1;
 if(v>0){const b=ec.querySelector('b');if(b){const c=b.cloneNode(false);b.replaceWith(c);c.textContent=$$(h.e)}}
 /* last night's per-song streams: the day-history entry (kept up to date by 210-economy-rebalance.js), else today's counter */
 const dn=s=>{const e=(s.dh||[]).find(x=>x[0]===S.day-1);return e?+e[1]||0:(s.pd===S.day-1?+s.today||0:0)};
 const songs=(S.songs||[]).map(s=>({title:s.title,name:s.name,today:dn(s)})).filter(s=>s.today>0).sort((a,b)=>b.today-a.today);
 const rows=[['Streams pay',$$(+((+h.e||0)-(+h.v||0)).toFixed(2))],['Vinyl and CD sales',$$(+h.v||0)],['Total earned',$$(+h.e||0)]];
 const panel=document.createElement('div');panel.className='fwbd';panel.hidden=true;
 panel.innerHTML='<div class=fwbdt><b>Where it came from</b>'+rows.map(r=>'<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('')+'</div><div class=fwbds><b>Streams by song</b>'+(songs.length?songs.map(s=>'<div><span>'+esc(s.title||s.name||'Song')+'</span><b>+'+Math.round(s.today).toLocaleString()+'</b></div>').join(''):'<small class=m>No song streams last night.</small>')+'</div>';
 ec.parentElement.insertAdjacentElement('afterend',panel);
 ec.style.cursor='pointer';ec.setAttribute('role','button');ec.title='Tap for the breakdown';
 ec.insertAdjacentHTML('beforeend','<small class=fwbdh>Tap for breakdown</small>');
 ec.addEventListener('click',()=>{panel.hidden=!panel.hidden;snd('click')});
}
{const st=document.createElement('style');st.textContent='.fwbd{margin-top:10px;font-size:13px}.fwbd[hidden]{display:none}.fwbdt,.fwbds{background:#111a15;border:1px solid #2b3a33;border-radius:6px;padding:8px 10px;margin-bottom:8px}.fwbdt>div,.fwbds>div{display:flex;justify-content:space-between;gap:10px;padding:2px 0}.fwbdh{display:block;color:#7fd3a1;font-size:11px}';document.head.appendChild(st)}

/* 2. Waking up: fewer toasts */
let WAKING=0,QUEUE=[];
const say0=say;
say=function(t){if(WAKING){QUEUE.push(String(t));return}return say0.apply(this,arguments)};
function flushWake(){const q=QUEUE;QUEUE=[];if(!q.length)return;
 const shown=[...new Set(q)].slice(0,2);
 shown.forEach((t,i)=>setTimeout(()=>say0(t),700+i*350));
 const rest=q.length-shown.length;
 if(rest>0)setTimeout(()=>say0('+'+rest+' more update'+(rest>1?'s':'')+' this morning. Check Messages.'),700+shown.length*350)}
const w0=wakeUp;
wakeUp=function(auto){
 window.FW_VIN=0;WAKING++;let r;
 try{r=w0.apply(this,arguments)}finally{WAKING--}
 /* v55.30.7: this file loads BEFORE 210-economy-rebalance.js and 231-label-press.js, whose wakeUp wrappers run outside this one and change the night's earnings and per-song streams afterwards. Build the breakdown once the whole wake chain has finished (wakeUp is synchronous, so a 0 ms timer runs after it), so it shows the same final figures as the Earned card. */
 setTimeout(()=>{try{morningVinyl()}catch(e){console.error('morning vinyl',e)}},0)
 if(!WAKING)flushWake();
 return r};

/* 3. Amazoom: no phones (Gphones stay on the Gphone Store site) */
{const a0=PA.amz;
 PA.amz=function(){const h=a0.apply(this,arguments);
  if(typeof h!=='string')return h;
  const m='<div style="margin-top:12px;padding:10px;background:#fff;color:#111;border-radius:6px"><b style="font-size:16px">Gphones</b>';
  const i=h.indexOf(m);return i>=0?h.slice(0,i):h}}
})();
