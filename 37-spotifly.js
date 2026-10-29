/* ===== v26.20: the streaming app is called Spotifly again (the game itself is still WaveFern) ===== */
/* logo next to the app's name in its sidebar and on its setup page */
{const st=document.createElement('style');st.textContent='.sfh{display:flex;align-items:center;gap:8px}.sb h3.sfh img{width:26px;height:26px}h1.sfh img{width:1.1em;height:1.1em}';document.head.appendChild(st)}
/* saves from v26.7.1 to v26.19 keep the old sender names in their message and news lists: show the new name */
function sfRename(){(S.msgs||[]).forEach(m=>{if(m&&m.from=='WaveFern Team')m.from='Spotifly Team'});(S.news||[]).forEach(n=>{if(n&&n.u=='WaveFern Music News')n.u='Spotifly Music News'})}
{const l0=loadCode;loadCode=function(){const r=l0.apply(this,arguments);try{sfRename()}catch(e){}return r}}

/* ===== v26.56: delete a song from Spotifly. It leaves your artist page, its album track list and the top songs. ===== */
function delSong(id){const s=S.songs.find(x=>x.id==id);if(!s)return;if(!confirm('Delete "'+s.title+'" from Spotifly? It stops earning and cannot be undone.'))return;
 S.songs=S.songs.filter(x=>x.id!=id);(S.albums||[]).forEach(a=>{if(Array.isArray(a.songs))a.songs=a.songs.filter(q=>q!=id)});
 snd('pop');say('Deleted "'+s.title+'" from Spotifly.');pcR()}

/* v26.78: the delete button is a bin icon on the song's own row (it still asks first). */
{const st=document.createElement('style');st.textContent='.sr.sd{grid-template-columns:30px 1fr 110px 70px 36px}.bin{width:32px;height:32px;padding:0;display:inline-flex;align-items:center;justify-content:center;color:var(--m)}.bin:hover{color:var(--t)}.bin svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.ng .bpl{width:32px;height:32px;padding:0;margin:0;border-radius:50%;border:0;background:#1db954;color:#000;font-size:12px;line-height:32px;cursor:pointer;box-shadow:none;flex:none}.ng .bpl:hover{transform:scale(1.08)}';document.head.appendChild(st)}
const sfBin=s=>`<button class=bin title="Delete song" aria-label="Delete ${esc(s.title)}" onclick="delSong(${s.id})"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M3.8 4l.8 9.5h6.8l.8-9.5M6.6 6.5v5M9.4 6.5v5"/></svg></button>`;

/* v26.78: unreleased drafts on the Upload tab can be played back. Playing a draft does not count streams or earnings. */
function sfDraftPlay(id){const d=S.drafts.find(x=>x.id==id);if(!d)return;const c=Beats.current();
 if(c&&c.owner=='sf'&&c.src===d)Beats.stop(.3);
 else{const p=Beats.play(d,{owner:'sf',alive:()=>mode=='pc'});if(p&&typeof say=='function')say('Now playing "'+d.title+'" · '+p.style+' · '+p.bpm+' bpm · '+p.key+'. Not released, no streams.')}
 pcR()}
const sfDraftBtn=d=>{const c=Beats.current(),on=!!(c&&c.owner=='sf'&&c.src===d);return`<button class=bpl title="${on?'Stop':'Play'} this draft" aria-label="${on?'Stop':'Play'} ${esc(d.title)}" onclick="sfDraftPlay(${d.id})">${on?'❚❚':'▶'}</button>`};
