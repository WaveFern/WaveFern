/* v49.93.34: the "choose a name" and "upload a song" screens used to be a single input floating in a big empty page.
   - WaveFern (Spotifly) first-run page: a proper welcome card with a live profile preview, name ideas and what you get.
   - Upload tab: a summary strip, one card per recorded draft (play, title, genre, quality bar, upload) and a how-it-works empty state.
   - The "Song recorded! Give it a title" box (after recording): quality meter, live title preview and title ideas.
   Only markup and styling change; setA(), upl(), uplAll(), saveT() and every wrapper around them are untouched. */
(function(){
const e=s=>typeof esc=='function'?esc(s):String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st=document.createElement('style');st.textContent=`
.wnh{max-width:760px;margin:0 auto;padding:6px 0 18px}
.wnh .wnhero{display:flex;align-items:center;gap:16px;padding:18px;border:2px solid var(--g);background:var(--p);margin-bottom:14px}
.wnh .wnhero img{width:56px;height:56px;flex-shrink:0}
.wnh .wnhero h1{margin:0 0 4px;font-size:26px}.wnh .wnhero p{margin:0}
.wnh .wnrow{display:grid;grid-template-columns:1.25fr 1fr;gap:14px}
.wnh .wnc{border:2px solid #2a332e;background:var(--p);padding:14px}
.wnh .wnc h3{margin:0 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--m)}
.wnh .wnin{display:flex;gap:8px;align-items:stretch;margin:6px 0 10px}.wnh .wnin input{flex:1;min-width:0;font-size:18px;padding:12px}
.wnh .wnin button{padding:0 18px;white-space:nowrap}
.wnh .wnchips,.wnt .wnchips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 4px}
.wnh .wnchips button,.wnt .wnchips button{padding:6px 10px;font-size:13px}
.wnh .wnpv{display:flex;align-items:center;gap:12px}.wnh .wnpv img{width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0}
.wnh .wnpv b{display:block;font-size:20px;word-break:break-word}.wnh .wnpv small{color:var(--m)}
.wnh .wnstat{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;text-align:center}
.wnh .wnstat div{border:1px solid #2a332e;padding:8px 4px}.wnh .wnstat b{display:block;font-size:16px}.wnh .wnstat small{color:var(--m)}
.wnh .wnperks{list-style:none;margin:0;padding:0}.wnh .wnperks li{display:flex;gap:10px;align-items:flex-start;margin:0 0 10px}
.wnh .wnperks li i{flex-shrink:0;width:26px;height:26px;border:2px solid var(--g);color:var(--g);display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:700;font-size:13px}
.wnh .wnperks li span{font-size:14px}.wnh .wnperks li span b{display:block}
.wnh .wnerr{color:#ff7b7b;min-height:18px;font-size:13px}
.wnu{max-width:900px;margin:0 auto}
.wnu .wnsum{display:grid;grid-template-columns:repeat(3,1fr) auto;gap:10px;align-items:stretch;margin:6px 0 14px}
.wnu .wnsum div.s{border:2px solid #2a332e;background:var(--p);padding:10px 12px}.wnu .wnsum div.s b{display:block;font-size:22px}.wnu .wnsum div.s small{color:var(--m)}
.wnu .wnsum button{padding:0 20px;font-size:15px}
.wnu .wnd{display:grid;grid-template-columns:44px 1fr;gap:12px;border:2px solid #2a332e;background:var(--p);padding:12px;margin:0 0 10px;align-items:center}
.wnu .wnd:hover{border-color:var(--g)}
.wnu .wnd .bpl{width:44px;height:44px;padding:0;font-size:16px}
.wnu .wnd .wnmain{min-width:0}
.wnu .wnd input{width:100%;box-sizing:border-box;font-size:16px;padding:8px 10px;margin:0 0 8px}
.wnu .wnd .wnmeta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.wnu .wnd .wnbadge{border:1px solid var(--g);color:var(--g);padding:2px 8px;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
.wnu .wnd .wnbadge.ft{border-color:#e9c46a;color:#e9c46a}
.wnu .wnq{flex:1;min-width:120px;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--m)}
.wnu .wnq span.bar{flex:1;height:8px;background:#000;border:1px solid #2a332e}.wnu .wnq span.bar i{display:block;height:100%;background:var(--g)}
.wnu .wnd .wnup{padding:8px 16px}
.wnu .wnempty{border:2px dashed #2a332e;padding:22px 18px;text-align:center;margin:10px 0}
.wnu .wnempty h3{margin:0 0 6px;font-size:20px}
.wnu .wnsteps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;text-align:left}
.wnu .wnsteps div{border:1px solid #2a332e;padding:10px;font-size:14px}.wnu .wnsteps b{display:block;color:var(--g);margin-bottom:2px}
.wnu .wnnote{color:var(--m);font-size:13px;margin-top:6px}
.box.modal.wnt{width:min(480px,92vw);box-sizing:border-box;padding:22px 22px 18px}
.wnt .wnpvt{border:2px solid var(--g);background:#000;padding:12px 14px;margin:10px 0}
.wnt .wnpvt small{color:var(--m);display:block}.wnt .wnpvt b{display:block;font-size:22px;word-break:break-word;min-height:28px}
.wnt .wnqm{display:flex;align-items:center;gap:10px;margin:8px 0 12px;font-size:13px;color:var(--m)}
.wnt .wnqm .bar{flex:1;height:10px;background:#000;border:1px solid #2a332e}.wnt .wnqm .bar i{display:block;height:100%;background:var(--g)}
.wnt input#tin{width:100%;box-sizing:border-box;font-size:18px;padding:12px}
.wnt .row2{margin-top:12px}.wnt .row2 button{width:100%;padding:12px;font-size:16px}
@media(max-width:640px){
.wnh .wnrow{grid-template-columns:1fr}.wnh .wnhero{flex-direction:column;text-align:center}.wnh .wnin{flex-direction:column}.wnh .wnin button{padding:12px}
.wnu .wnsum{grid-template-columns:1fr 1fr}.wnu .wnsum button{grid-column:1/-1;padding:12px}
.wnu .wnsteps{grid-template-columns:1fr}.wnu .wnd{grid-template-columns:40px 1fr;padding:10px}.wnu .wnd .bpl{width:40px;height:40px}
}`;document.head.appendChild(st);

/* ---------- WaveFern first-run: choose your artist name ---------- */
const IDEAS=['Neon Static','Velvet Echo','Lil Fern','Midnight Dial','Paper Moon','Kid Halo','Golden Hour','Static Bloom'];
window.wnPick=function(n){const i=document.getElementById('an');if(i){i.value=n;i.focus();wnPv()}};
window.wnPv=function(){const i=document.getElementById('an'),n=document.getElementById('wnpn'),b=document.getElementById('wnbtn'),er=document.getElementById('wnerr');if(!i||!n)return;const v=i.value.trim();n.textContent=v||'Your artist name';if(b)b.disabled=v.length<2;if(er)er.textContent=v&&v.length<2?'Needs at least 2 characters.':''};
PG.setup=()=>{let pf='';try{pf=pfp()}catch(x){}
 return`<div class=wnh>
<div class=wnhero><img src="${IC.fw}" alt=""><div><h1>Welcome to Spotifly</h1><p class=m>Streaming for independent artists. Pick the name the world will know you by.</p></div></div>
<div class=wnrow>
<div class=wnc><h3>Choose your artist name</h3>
<div class=wnin><input id=an maxlength=24 placeholder="Artist name" autocomplete=off oninput="wnPv()" onkeydown="if(event.key=='Enter'&&this.value.trim().length>1)setA()"><button class=go id=wnbtn disabled onclick="setA()">Create profile</button></div>
<div class=wnerr id=wnerr></div>
<small class=m>Need ideas? Tap one:</small>
<div class=wnchips>${IDEAS.map(n=>`<button type=button onclick="wnPick('${n}')">${n}</button>`).join('')}</div>
<small class=m>2 to 24 characters. You can change it later in your profile.</small></div>
<div class=wnc><h3>Your profile</h3>
<div class=wnpv>${pf?`<img src="${pf}" alt="">`:''}<div><b id=wnpn>Your artist name</b><small>Artist · WaveFern</small></div></div>
<div class=wnstat><div><b>0</b><small>Monthly listeners</small></div><div><b>${S.songs.length}</b><small>Songs</small></div><div><b>${S.drafts.length}</b><small>Drafts ready</small></div></div></div>
</div>
<div class=wnc style="margin-top:14px"><h3>What you get</h3><ul class=wnperks>
<li><i>1</i><span><b>Upload your songs</b>Record in your studio, then release them here.</span></li>
<li><i>2</i><span><b>Earn from streams</b>Every listen pays. Interest and listeners grow as you release.</span></li>
<li><i>3</i><span><b>Climb the charts</b>Build albums, promote your hits and grow your fanbase.</span></li>
</ul></div></div>`};

/* ---------- Upload tab ---------- */
const sft=t=>{try{return stripFt(t)}catch(x){return t}};
const qpct=q=>Math.max(4,Math.min(100,Math.round(+q||0)));
PG.upload=()=>{const D=S.drafts,ok=D.filter(d=>d.title.trim()).length,best=D.reduce((m,d)=>Math.max(m,+d.q||0),0);
 const head=`<h1>Upload</h1>`;
 if(!D.length)return`<div class=wnu>${head}<div class=wnempty><h3>No recorded songs yet</h3><p class=m>Songs you record in your studio wait here until you release them.</p>
<div class=wnsteps><div><b>1. Record</b>Use the microphone in your studio.</div><div><b>2. Name it</b>Give your track a title you love.</div><div><b>3. Upload</b>Release it here and start earning streams.</div></div></div>
<p class=wnnote>You have ${S.songs.length} song${S.songs.length==1?'':'s'} released so far.</p></div>`;
 return`<div class=wnu>${head}
<div class=wnsum><div class=s><b>${D.length}</b><small>draft${D.length>1?'s':''} waiting</small></div><div class=s><b>${ok}</b><small>ready to upload</small></div><div class=s><b>Q${best}</b><small>best quality</small></div><button class=go ${ok?'':'disabled'} onclick="uplAll()">Upload all (${ok})</button></div>
${D.map(d=>`<div class=wnd>${typeof sfDraftBtn=='function'?sfDraftBtn(d):''}<div class=wnmain>
<input value="${e(sft(d.title))}" maxlength=48 placeholder="Song title" oninput="dTitle(${d.id},this.value)">
<div class=wnmeta><span class=wnbadge>${e(d.g)}</span>${d.ft?`<span class="wnbadge ft">feat. ${e(d.ft)}</span>`:''}
<span class=wnq><span>Q${d.q}</span><span class=bar><i style="width:${qpct(d.q)}%"></i></span></span>
<button class="go wnup" onclick="upl(${d.id})">Upload</button></div></div></div>`).join('')}
<p class=wnnote>Edit the title any time before uploading. Collab songs keep their (feat. NAME) tag. Playing a draft does not count streams.</p></div>`};

/* ---------- "Song recorded! Give it a title" ---------- */
const TA=['Midnight','Golden','Neon','Velvet','Paper','Lonely','Crimson','Hollow','Silver','Wild'],TB=['Dreams','Hours','Signals','Roads','Echoes','Summer','Skyline','Letters','Heat','Tides'];
window.wnTitle=function(v){const i=document.getElementById('tin');if(!i)return;i.value=v;i.focus();wnTP()};
window.wnTP=function(){const i=document.getElementById('tin'),p=document.getElementById('wntp');if(i&&p)p.textContent=i.value.trim()||'Untitled'};
function enhanceTitle(b){if(b.dataset.wnt)return;const i=b.querySelector('#tin');if(!i||!/^Song recorded/i.test((b.querySelector('h2')||{}).textContent||''))return;b.dataset.wnt=1;b.classList.add('wnt');
 try{const m=b.querySelector('p.m'),q=m&&(/mix quality (\d+)/.exec(m.textContent)||[])[1];
  const pv=document.createElement('div');pv.className='wnpvt';pv.innerHTML='<small>Title preview</small><b id=wntp></b>';
  const lbl=[...b.querySelectorAll('p')].find(p=>/give it a title/i.test(p.textContent));
  if(q){const qm=document.createElement('div');qm.className='wnqm';qm.innerHTML=`<span>Quality ${q}</span><span class=bar><i style="width:${qpct(q)}%"></i></span>`;(m.nextSibling?m.parentNode.insertBefore(qm,m.nextSibling):b.appendChild(qm))}
  (lbl||i).parentNode.insertBefore(pv,lbl||i);
  const ch=document.createElement('div');ch.className='wnchips';const rnd=a=>a[Math.random()*a.length|0];
  ch.innerHTML='<small class=m style="width:100%">Title ideas:</small>'+Array.from({length:4},()=>rnd(TA)+' '+rnd(TB)).map(n=>`<button type=button>${n}</button>`).join('');
  ch.querySelectorAll('button').forEach(x=>x.onclick=()=>wnTitle(x.textContent));
  i.after(ch);i.addEventListener('input',wnTP);wnTP()}catch(x){}}
const ui=document.getElementById('ui');
if(ui)new MutationObserver(()=>{try{ui.querySelectorAll('.box.modal:not(.wnt)').forEach(enhanceTitle)}catch(x){}}).observe(ui,{childList:true,subtree:true});
})();
