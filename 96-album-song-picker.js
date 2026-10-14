/* ===== v26.102: Create album picks songs like the festival setlist =====
   The old "Choose songs" list was a checkbox per song (the checkboxes floated above the titles) and a separate
   "Track order" list. Now it is two columns like FestivalApp's setlist: your track list on the left (move up/down,
   remove), your unused released songs on the right with + Add. Spotifly colours, and no limit on the number of songs.
   The "Put my face on the cover" checkbox sits next to its text again. A collab whose title already says "(feat. X)" no longer shows "feat. X" a second time. */
const alFt=x=>x.ft&&!String(x.title||'').toLowerCase().includes(String(x.ft).toLowerCase())?` <small class=alft>feat. ${esc(x.ft)}</small>`:'';
function alAddAll(){const used=S.albums.flatMap(a=>a.songs);S.songs.forEach(x=>{if(!used.includes(x.id)&&!AL.sel.includes(x.id))AL.sel.push(x.id)});snd('pop');pcR()}
function alClear(){AL.sel=[];pcR()}
function alPicker(){const used=S.albums.flatMap(a=>a.songs),av=S.songs.filter(x=>!used.includes(x.id)).sort((a,b)=>(b.streams||0)-(a.streams||0));
 AL.sel=AL.sel.filter(id=>av.some(x=>x.id==id));const L=AL.sel,n=L.length,left=av.filter(x=>!L.includes(x.id)).length;
 const row=(x,i)=>`<div class=alr><span class=aln>${i+1}</span><span class=alt>${esc(x.title)}${alFt(x)}</span><button class=alb onclick="alMv(${i},-1)" ${i?'':'disabled'} title="Move up">▲</button><button class=alb onclick="alMv(${i},1)" ${i<n-1?'':'disabled'} title="Move down">▼</button><button class=alb onclick="alTog(${x.id})" title="Remove">✕</button></div>`;
 return`<div class=al2><div class=alc><div class=alh><h3>Track list</h3><span class=alk>${n} song${n==1?'':'s'}</span>${n?'<button class=alx onclick="alClear()">Clear</button>':''}</div>
  ${n?L.map(id=>S.songs.find(x=>x.id==id)).map(row).join(''):'<p class=m>Empty. Add songs from the right (at least 2).</p>'}</div>
 <div class=alc><div class=alh><h3>Your songs</h3>${left>1?'<button class=alx onclick="alAddAll()">+ Add all</button>':''}</div><div class=all>
  ${av.length?av.map(x=>{const inn=L.includes(x.id);return`<div class="alr${inn?' in':''}"><span class=alt>${esc(x.title)}${alFt(x)}<br><small class=m>${esc(x.g||'')} · q${x.q||0}</small></span><button class="alp${inn?' on':''}" onclick="alTog(${x.id})">${inn?'Added':'+ Add'}</button></div>`}).join(''):'<p class=m>No unused released songs. Upload more first.</p>'}</div></div></div>`}
{const p0=PG.albums;PG.albums=()=>{const h=p0(),a=h.indexOf('<h3>Choose songs</h3>'),b=h.indexOf('<button class=go onclick="mkAlbum()">');return a<0||b<a?h:h.slice(0,a)+alPicker()+h.slice(b)}}
{const st=document.createElement('style');st.textContent=`.al2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:12px 0 16px}
.alc{background:#181818;border-radius:8px;padding:12px 14px;min-width:0}.alh{display:flex;align-items:center;gap:10px;margin-bottom:6px}.alh h3{margin:0;flex:1;font-size:16px}
.alk{color:#b3b3b3;font-size:13px}.all{max-height:46vh;overflow:auto}
.alr{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:4px}.alr:hover{background:#ffffff12}.alr.in{opacity:.5}
.aln{width:20px;text-align:right;color:#b3b3b3;font-variant-numeric:tabular-nums}.alt{flex:1;min-width:0;overflow-wrap:anywhere}.alft{color:#1db954}
.alb{width:30px;height:30px;padding:0;border:0;border-radius:50%;background:transparent;color:#b3b3b3;box-shadow:none;cursor:pointer}.alb:hover:not(:disabled){background:#ffffff1a;color:#fff}.alb:disabled{opacity:.3;cursor:default}
.alp{border:1px solid #727272;background:transparent;color:#fff;border-radius:500px;padding:5px 14px;font-weight:700;box-shadow:none;cursor:pointer;white-space:nowrap}.alp:hover{border-color:#fff;transform:scale(1.04)}.alp.on{border-color:#1db954;color:#1db954}
.alx{border:0;background:transparent;color:#b3b3b3;font-weight:700;box-shadow:none;cursor:pointer;padding:4px 8px}.alx:hover{color:#fff}
.mn label>input[type=checkbox]{width:auto;margin:0 6px 0 0;vertical-align:middle;accent-color:#1db954}
@media (max-width:760px){.al2{grid-template-columns:1fr}}`;document.head.appendChild(st)}
