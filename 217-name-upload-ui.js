/* ---------- v49.94.0: WaveFern "choose your artist name" and "Upload" screens redesigned ----------
   Both pages used to be a heading and one thin row in a big empty window. They now fill the window in the game's pixel style
   (Silkscreen headings, dark panels, WaveFern green):
   - Choose a name: a two-column page. Left: step badge, name box with a live counter and "roll a name" / idea chips. Right: a live
     profile preview that updates as you type, plus the three steps of a music career.
   - Upload: a summary strip (waiting, ready, best quality) and one card per draft with a play button, genre tag, quality meter,
     title box and Upload button. With no drafts it shows a how-to-record guide instead of one line of text.
   Behaviour is unchanged: setA() still needs 2+ characters, upl()/uplAll() still need a title, titles still keep their (feat. NAME) tag. */
(function(){
if(typeof PG!='object'||!PG)return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const A1=['Neon','Velvet','Static','Midnight','Lunar','Golden','Echo','Rusty','Paper','Electric','Crimson','Hollow','Cosmic','Silver','Wild','Blue','Dusty','Sunset','Pixel','Fern'];
const A2=['Fox','Wave','Ghost','Tiger','Kid','Bloom','Raven','Drift','Pilgrim','Comet','Saint','Jackal','Orchid','Phantom','Riot','Harbor','Atlas','Moth','Hustle','Voltage'];
const roll=()=>{const a=A1[Math.floor(Math.random()*A1.length)],b=A2[Math.floor(Math.random()*A2.length)];return(a+' '+b).slice(0,24)};
let IDEAS=[];const ideas=()=>{if(!IDEAS.length)for(let i=0;i<4;i++){const n=roll();if(!IDEAS.includes(n))IDEAS.push(n)}return IDEAS};

/* ---- choose a name ---- */
window.nmPrev=function(v){
 v=String(v==null?'':v);const t=v.trim(),ok=t.length>=2,n=$('nmpv'),c=$('nmct'),h=$('nmhint'),b=$('nmgo');
 if(n)n.textContent=t||'Your name';if(n)n.classList.toggle('mt',!t);
 if(c)c.textContent=v.length+' / 24';
 if(h){h.textContent=ok?'Looks good. You can start your career with this name.':t?'One more character to go.':'Use 2 to 24 characters. Anything goes.';h.className='nmh'+(ok?' ok':'')}
 if(b)b.classList.toggle('rdy',ok)};
window.nmFill=function(v){const i=$('an');if(!i)return;i.value=String(v).slice(0,24);nmPrev(i.value);i.focus()};
window.nmRoll=function(){IDEAS=[];ideas();const box=$('nmidea');if(box)box.innerHTML=ideaHTML();nmFill(IDEAS[0])};
const ideaHTML=()=>ideas().map(n=>`<button type=button class=nmchip onclick="nmFill(this.dataset.n)" data-n="${E(n)}">${E(n)}</button>`).join('');
PG.setup=()=>{const step=(n,t,d)=>`<div class=nmst><i>${n}</i><span><b>${t}</b><small>${d}</small></span></div>`;
 return`<div class=nmw>
<div class=nmhd><span class=nmbadge>STEP 1 OF 3</span><h1 class=sfh><img src="${IC.fw}" alt="">Welcome to WaveFern</h1><p class=m>Streaming for independent artists. Pick the name the world will hear, then record, upload and watch the streams roll in.</p></div>
<div class=nmgr>
<div class=nmcard><h3>Choose your artist name</h3>
<label class=nmlb for=an>ARTIST NAME</label>
<input id=an maxlength=24 autocomplete=off spellcheck=false placeholder="Type a name..." oninput="nmPrev(this.value)" onkeydown="if(event.key=='Enter')setA()">
<div class=nmrow><span id=nmhint class=nmh>Use 2 to 24 characters. Anything goes.</span><span id=nmct class=nmct>0 / 24</span></div>
<div class=nmlb style="margin-top:14px">NEED IDEAS?</div>
<div id=nmidea class=nmchips>${ideaHTML()}</div>
<div class=nmact><button type=button onclick="nmRoll()">Roll a name</button><button id=nmgo type=button class=go onclick="setA()">Create profile</button></div>
</div>
<div class=nmside>
<div class="nmcard nmpv"><div class=nmlb>YOUR PROFILE PREVIEW</div>
<div class=nmpvb><img class=pf src="${pfp()}" alt=""><div><small class=m>ARTIST</small><h2 id=nmpv class=mt>Your name</h2><p class=m>0 monthly listeners · 0 followers</p></div></div>
<div class=nmbars><i style="width:8%"></i></div><small class=m>Every new artist starts at the bottom. Your first release changes that.</small></div>
<div class=nmcard><div class=nmlb>HOW A CAREER GOES</div>
${step(1,'Record','Use the microphone in your studio at home.')}
${step(2,'Upload','Give the song a title and release it here.')}
${step(3,'Grow','Sleep, and wake up to streams, money and fans.')}
</div></div></div>
<p class="m nmft"><small>You can see your name on your artist page, in the band room and to your friends. Pick one you will still like in a month.</small></p></div>`};

/* ---- upload ---- */
const qCol=q=>q>=70?'#c9a7ff':q>=45?'#a66bff':'#7d52c4';
const qWord=q=>q>=80?'Hit potential':q>=60?'Strong':q>=40?'Solid':q>=25?'Decent':'Rough';
PG.upload=()=>{const D=S.drafts||[],ok=D.filter(d=>d.title.trim()).length,best=D.reduce((m,d)=>Math.max(m,d.q||0),0);
 const tip=(h,t)=>`<div class=upt><b>${h}</b><small>${t}</small></div>`;
 const head=`<div class=uphd><div><small class=upk>WAVEFERN FOR ARTISTS</small><h1>Upload</h1><p>Release your recorded songs and start collecting streams.</p></div>${D.length?`<button class=go ${ok?'':'disabled'} onclick="uplAll()">Upload all (${ok})</button>`:''}</div>`;
 const tips=`<div class=uptips>${tip('Titles','Edit the title any time before uploading.')}${tip('Collabs','Collab songs keep their (feat. NAME) tag.')}${tip('Quality','A better studio makes better songs. Gear, home and pets all help.')}</div>`;
 if(!D.length)return`<div class=upw>${head}<div class=upem><div class=upmic><svg viewBox="0 0 16 16" width="64" height="64" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true"><path d="M6 1h4v1h1v6h-1v1H6V8H5V2h1zM3 7h1v2h1v1h6V9h1V7h1v2h-1v2h-2v1H9v2h2v1H5v-1h2v-2H5v-1H3z"/></svg></div>
 <h3>No songs waiting</h3><p class=m>Everything you record shows up here, ready to release.</p>
 <div class=upst><div class=nmst><i>1</i><span><b>Go to your studio</b><small>Walk to the microphone at home.</small></span></div><div class=nmst><i>2</i><span><b>Record a song</b><small>Pick a genre and hit the notes.</small></span></div><div class=nmst><i>3</i><span><b>Come back here</b><small>Title it and press Upload.</small></span></div></div></div>${tips}</div>`;
 const cards=D.map(d=>{const q=Math.max(0,d.q||0),w=Math.min(100,q),has=d.title.trim();
  const hue=[...String(d.g)].reduce((a,c)=>a+c.charCodeAt(0),0)*37%60+250;
  return`<div class="ng udc"><div class=udcv style="background:linear-gradient(135deg,hsl(${hue},70%,45%),hsl(${hue+40},60%,22%))"><span>♪</span>${sfDraftBtn(d)}</div><div class=udm><input value="${E(stripFt(d.title))}" maxlength=48 aria-label="Song title" placeholder="Song title" oninput="dTitle(${d.id},this.value)">
<div class=udtg><span class=udg>${E(d.g)}</span>${d.ft?`<span class="udg ft">feat. ${E(d.ft)}</span>`:''}<span class=udq style="color:${qCol(q)}">Q${q} · ${qWord(q)}</span></div>
<div class=udbar><i style="width:${w}%;background:${qCol(q)}"></i></div></div><button class=go onclick="upl(${d.id})">Upload</button></div>`}).join('');
 return`<div class=upw>${head}<div class=upsum><div><b>${D.length}</b><small>Waiting</small></div><div><b>${ok}</b><small>Ready</small></div><div><b>${best}</b><small>Best quality</small></div><div><b>${(S.songs||[]).length}</b><small>Released</small></div></div><div class=udl>${cards}</div>${tips}</div>`};

/* ---- the look ---- */
const st=document.createElement('style');st.textContent=`
.nmw,.upw{max-width:1040px;margin:0 auto;padding:6px 4px 18px}
.nmhd{margin:0 0 18px}.nmhd h1{font-size:30px;margin:8px 0 6px}.nmhd p{margin:0;max-width:640px;font-size:15px;line-height:1.5}
.nmbadge{display:inline-block;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#fff;background:var(--sp);padding:3px 8px;border:2px solid #000;box-shadow:2px 2px 0 #000}
.nmgr{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:start}
.nmside{display:grid;gap:18px}
.nmcard{background:#171320;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640,4px 4px 0 #0008;padding:20px}
.nmcard h3{font-size:20px;margin:0 0 14px}
.nmlb{display:block;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:var(--m);margin:0 0 6px}
#an{font-size:22px;padding:12px 14px;border:3px solid #2e2640;background:#0d0b13}#an:focus{outline:0;border-color:var(--sp)}
.nmrow{display:flex;justify-content:space-between;gap:10px;margin-top:6px;font-size:12px}
.nmh{color:var(--m)}.nmh.ok{color:var(--sp)}.nmct{color:var(--m);white-space:nowrap}
.nmchips{display:flex;flex-wrap:wrap;gap:8px}
.nmchip{background:#1a1626;border:2px solid #2e2640;box-shadow:none;padding:7px 12px;font-size:13px}.nmchip:hover{border-color:var(--sp);background:#251d3a}
.nmact{display:flex;gap:10px;margin-top:20px}.nmact button{padding:12px 16px;font-size:14px}.nmact .go{flex:1}
.nmact .go:not(.rdy){opacity:.75}
.nmpvb{display:flex;gap:16px;align-items:center;margin:10px 0 14px;padding:14px;background:linear-gradient(135deg,#3a1f6e,#121212 75%);border:2px solid #000}
.nmpvb .pf{width:84px;height:84px;image-rendering:pixelated;border:3px solid #000;flex:none}
.nmpvb h2{font-size:24px;margin:2px 0 4px;word-break:break-word}.nmpvb h2.mt{color:var(--m)}.nmpvb p{margin:0;font-size:13px}
.nmbars{height:10px;background:#000;border:2px solid #000;margin:0 0 8px}.nmbars i{display:block;height:100%;background:var(--sp)}
.nmst{display:flex;gap:12px;align-items:center;padding:9px 0;border-top:2px solid #241d33}.nmst:first-of-type{border-top:0}
.nmst i{flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font:700 14px Silkscreen,ui-monospace,monospace;font-style:normal;color:#fff;background:var(--sp);border:2px solid #000}
.nmst span{display:flex;flex-direction:column;gap:2px}.nmst small{color:var(--m);font-size:12px}
.nmft{margin:16px 0 0;text-align:center}
.uphd{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;margin:0 0 16px;flex-wrap:wrap}.uphd h1{font-size:30px;margin:0 0 4px}.uphd p{margin:0}
.uphd .go{padding:12px 18px;font-size:14px}
.upsum{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 16px}
.upsum div,.upt{background:#171320;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640;padding:12px 14px}
.upsum b{display:block;font:24px Silkscreen,ui-monospace,monospace;color:var(--sp)}.upsum small,.upt small{color:var(--m);font-size:12px}
.udl{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px;margin:0 0 16px}
.udc.ng{display:flex;align-items:center;gap:14px;margin:0;padding:14px;background:#171320;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640,4px 4px 0 #0008}
.udc .bpl{flex:none;border-radius:50%!important;font-size:12px;line-height:1;padding:0}
.udm{flex:1;min-width:0}.udm input{font-size:16px;padding:9px 10px;margin:0 0 8px}.udm input:focus{outline:0;border-color:var(--sp)}
.udtg{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 6px}
.udg{font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;padding:3px 7px;background:#251d3a;border:2px solid #2e2640;color:var(--t)}.udg.ft{color:#a66bff;border-color:#4a3a6a}
.udq{font-size:12px;font-weight:700;margin-left:auto}
.udbar{height:8px;background:#000;border:2px solid #000}.udbar i{display:block;height:100%}
.udc>.go{flex:none;padding:12px 16px}
.uptips{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.upt b{display:block;font:12px Silkscreen,ui-monospace,monospace;color:var(--sp);margin-bottom:4px;letter-spacing:1px}
.upem{text-align:center;background:#171320;border:3px dashed #2e2640;padding:34px 20px;margin:0 0 16px}
.upem h3{font-size:22px;margin:10px 0 4px}.upmic{color:var(--sp);display:inline-block}
.upst{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:22px auto 0;max-width:760px;text-align:left}
.upst .nmst{border:2px solid #241d33;padding:12px;background:#121212}.upst .nmst:first-of-type{border-top:2px solid #241d33}
@media (max-width:820px){.nmgr{grid-template-columns:1fr}.nmhd h1{font-size:24px}.upsum{grid-template-columns:repeat(2,minmax(0,1fr))}.udl{grid-template-columns:1fr}}
@media (max-width:480px){.nmcard{padding:14px}.nmact{flex-direction:column}.nmpvb .pf{width:64px;height:64px}.udc.ng{flex-wrap:wrap}.udm{flex-basis:calc(100% - 60px)}.udc>.go{width:100%}.uphd .go{width:100%}}
.nmw,.upw{--sp:#a66bff;--spd:#6d3fc7}
.nmw button.go,.upw button.go{background:var(--sp);color:#fff;border-color:#000;text-shadow:1px 1px 0 #0006}.nmw button.go:hover,.upw button.go:hover{background:#b98aff}
.nmw button.go:disabled,.upw button.go:disabled{background:#3a2d57;color:#8f80b0}
.nmchip:hover{background:#251d3a}
.uphd{padding:22px 24px;background:radial-gradient(circle at 85% 20%,#6d3fc7 0,transparent 55%),linear-gradient(135deg,#2a1650,#121212);border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640}
.upk{font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#c9a7ff}.uphd p{color:#d8c8f5}
.udcv{position:relative;flex:none;width:76px;height:76px;display:flex;align-items:center;justify-content:center;border:3px solid #000;box-shadow:inset 0 0 0 2px #fff2}
.udcv>span{font:34px Silkscreen,ui-monospace,monospace;color:#fff9}.udcv .bpl{position:absolute;right:-8px;bottom:-8px;width:32px;height:32px;background:var(--sp)!important;color:#fff!important;border:2px solid #000!important}
.udc .bpl{background:var(--sp);color:#fff}
.udm input,#an{background:#0d0b13}.udg.ft{color:#c9a7ff;border-color:#5a3f93}
.udbar i{background-image:linear-gradient(90deg,#6d3fc7,#c9a7ff)!important}
.upsum div:first-child b{color:#c9a7ff}
@media (max-width:480px){.udcv{width:60px;height:60px}.udm{flex-basis:calc(100% - 80px)}}
body.pcsmall .nmgr{grid-template-columns:1fr}body.pcsmall .udl{grid-template-columns:1fr}`;
document.head.appendChild(st);
})();
