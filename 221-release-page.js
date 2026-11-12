/* ---------- v50.0.0: the Upload page is a release page ----------
   Replaces PG.upload from 217-name-upload-ui.js (the empty state is still its guide). Same data and rules: drafts are S.drafts, titles are edited with dTitle,
   releasing calls upl() (06 and its wrappers) so streams, goals, band checks and release progression are unchanged. New: a release queue on the left,
   a release preview on the right (cover, title box, quality, status steps: Recorded, Titled, Live) and a short "going live" moment before upl() runs.
   Reuses the .upw purple theme and helpers (qCol-like colours, sfDraftBtn, stripFt, E). Loads after 217. */
(()=>{
const old=PG.upload,Q=q=>q>=70?'#c9a7ff':q>=45?'#a66bff':'#7d52c4',QW=q=>q>=80?'Hit potential':q>=60?'Strong':q>=40?'Solid':q>=25?'Decent':'Rough';
const esc_=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let SEL=null,BUSY=0;
const cover=d=>{const h=[...String(d.g)].reduce((a,c)=>a+c.charCodeAt(0),0)*37%60+250;return`linear-gradient(135deg,hsl(${h},70%,45%),hsl(${h+40},60%,22%))`};
const sel=()=>{const D=S.drafts||[];return D.find(d=>d.id===SEL)||D[0]};
const strip=t=>{try{return stripFt(t)}catch(e){return t}};
PG.upload=()=>{const D=S.drafts||[];if(!D.length)return old();const d=sel();SEL=d.id;
 const ok=D.filter(x=>x.title.trim()).length,q=Math.max(0,d.q||0),L=(S.songs||[]).slice(-3).reverse(),has=!!d.title.trim();
 const rows=D.map(x=>{const t=x.title.trim(),qq=Math.max(0,x.q||0);return`<div class="rlr${x.id===d.id?' on':''}" onclick="rlSel(${x.id})"><div class=rlcv style="background:${cover(x)}"></div><div class=rlrm><b>${t?esc_(t):'Untitled'}</b><small>${esc_(x.g)}${x.ft?' · feat. '+esc_(x.ft):''} · Q${qq}</small></div><span class="rlst ${t?'rd':''}">${t?'Ready':'Draft'}</span></div>`}).join('');
 const step=(l,on)=>`<span class="rlsp${on?' on':''}"><i></i>${l}</span>`;
 return`<div class="upw rlw"><div class=rlbar><div><small class=upk>WAVEFERN FOR ARTISTS</small><b>${S.artist?esc_(S.artist):'Your artist page'}</b></div><div class=rlnum><span><b>${D.length}</b> waiting</span><span><b>${(S.songs||[]).length}</b> live</span></div></div>
 <div class=rlgr><div class=rlq><div class=rlqh><b>Release queue</b><button ${ok?'':'disabled'} onclick="uplAll()">Release all (${ok})</button></div>${rows}</div>
 <div class=rlp id=rlp><div class=rlcv2 style="background:${cover(d)}"><span>♪</span>${sfDraftBtn(d)}</div><div class=rlinfo><small class=upk>${d.ft?'COLLAB SINGLE':'SINGLE'}</small>
 <input id=rlt value="${esc_(strip(d.title))}" maxlength=48 placeholder="Song title" aria-label="Song title" oninput="rlTitle(${d.id},this.value)">
 <div class=udtg><span class=udg>${esc_(d.g)}</span>${d.ft?`<span class="udg ft">feat. ${esc_(d.ft)}</span>`:''}<span class=udq style="color:${Q(q)}">Q${q} · ${QW(q)}</span></div><div class=udbar><i style="width:${Math.min(100,q)}%"></i></div></div>
 <div class=rlsteps>${step('Recorded',1)}${step('Titled',has)}${step('Live',0)}</div>
 <button class="go rlgo" id=rlgo ${has?'':'disabled'} onclick="rlGo(${d.id})">${has?'Release now':'Add a title to release'}</button></div></div>
 ${L.length?`<div class=rlfoot><small class=upk>LIVE ON WAVEFERN</small>${L.map(s=>`<span><b>${esc_(s.title)}</b> · ${esc_(s.g)}</span>`).join('')}</div>`:''}</div>`};
window.rlSel=id=>{SEL=id;pcR()};
window.rlTitle=(id,v)=>{dTitle(id,v);const h=!!v.trim(),b=document.getElementById('rlgo');if(b){b.disabled=!h;b.textContent=h?'Release now':'Add a title to release'}
 const p=document.getElementById('rlp');if(p){const s=p.querySelectorAll('.rlsp')[1];if(s)s.classList.toggle('on',h)}
 const r=document.querySelector('.rlr.on');if(r){r.querySelector('b').textContent=h?v.trim():'Untitled';const t=r.querySelector('.rlst');t.textContent=h?'Ready':'Draft';t.classList.toggle('rd',h)}};
/* going live: the Live step lights, the panel fills, then the normal release runs */
window.rlGo=id=>{if(BUSY)return;const d=S.drafts.find(x=>x.id==id);if(!d||!d.title.trim())return;BUSY=1;const p=document.getElementById('rlp'),b=document.getElementById('rlgo');
 if(p){p.classList.add('live');const s=p.querySelectorAll('.rlsp')[2];if(s)s.classList.add('on')}if(b){b.disabled=true;b.textContent='Going live...'}
 try{snd('levelup')}catch(e){}
 setTimeout(()=>{BUSY=0;SEL=null;try{upl(id)}catch(e){console.error('release',e);pcR()}},1000)};
const st=document.createElement('style');st.textContent=`.rlw{max-width:1040px}
.rlbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px;margin:0 0 14px;background:#171320;border:3px solid #000;border-bottom:3px solid var(--sp);box-shadow:inset 0 0 0 2px #2e2640}
.rlbar>div:first-child b{display:block;font:18px Silkscreen,ui-monospace,monospace;color:var(--t)}.rlnum{display:flex;gap:16px;color:var(--m);font-size:12px}.rlnum b{color:var(--sp);font:16px Silkscreen,ui-monospace,monospace;margin-right:4px}
.rlgr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:14px;align-items:start}
.rlq,.rlp{background:#171320;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640,4px 4px 0 #0008;padding:12px}
.rlqh{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 0 8px}.rlqh b{font:12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:var(--sp)}.rlqh button{padding:6px 10px;font-size:12px}
.rlr{display:flex;align-items:center;gap:10px;padding:8px;border:2px solid transparent;cursor:pointer}.rlr:hover{background:#1e1830}.rlr.on{background:#241d3a;border-color:var(--sp)}
.rlcv{flex:none;width:42px;height:42px;border:2px solid #000}.rlrm{flex:1;min-width:0}.rlrm b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rlrm small{color:var(--m);font-size:11px}
.rlst{font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:var(--m);border:2px solid #2e2640;padding:2px 6px}.rlst.rd{color:var(--sp);border-color:var(--sp)}
.rlp{position:relative}.rlcv2{position:relative;height:150px;border:3px solid #000;display:flex;align-items:center;justify-content:center;margin:0 0 12px}.rlcv2>span{font:56px Silkscreen,ui-monospace,monospace;color:#fff8}
.rlcv2 .bpl{position:absolute;right:8px;bottom:8px;width:36px;height:36px;background:var(--sp)!important;color:#fff!important;border:2px solid #000!important;border-radius:50%!important;padding:0}
.rlinfo input{width:100%;box-sizing:border-box;font-size:20px;padding:8px 10px;margin:4px 0 8px;background:#0d0b13}.rlinfo input:focus{outline:0;border-color:var(--sp)}
.rlsteps{display:flex;gap:6px;margin:12px 0}.rlsp{flex:1;display:flex;align-items:center;gap:6px;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:var(--m);padding:6px;border:2px solid #2e2640}.rlsp i{width:10px;height:10px;background:#0d0b13;border:2px solid #2e2640}.rlsp.on{color:var(--t);border-color:var(--sp)}.rlsp.on i{background:var(--sp);border-color:var(--sp)}
.rlgo{width:100%;padding:14px;font-size:16px}.rlp.live .rlcv2{animation:rllive 1s ease-out}.rlp.live .rlsp.on:last-child{background:var(--sp);color:#fff}
@keyframes rllive{0%{transform:scale(1)}40%{transform:scale(1.03);box-shadow:0 0 0 6px #a66bff55}100%{transform:scale(1)}}
.rlfoot{margin:14px 0 0;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:12px;color:var(--m)}.rlfoot b{color:var(--t)}
@media (max-width:820px){.rlgr{grid-template-columns:1fr}}`;document.head.appendChild(st);
})();
