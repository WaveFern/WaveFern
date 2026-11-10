/* ---- v49.94.7: polished "choose a name", "Upload" and finished-song screens ----
   Game pixel style: Silkscreen labels, dark panels with black borders and hard shadows, purple accent. Behaviour unchanged: setA() needs 2+ characters,
   upl()/uplAll() need a title, titles keep their (feat. NAME) tag. */
(function(){
if(typeof PG!='object'||!PG)return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const A1=['Neon','Velvet','Static','Midnight','Lunar','Golden','Echo','Rusty','Paper','Electric','Crimson','Hollow','Cosmic','Silver','Wild','Blue','Dusty','Sunset','Pixel','Fern'],A2=['Fox','Wave','Ghost','Tiger','Kid','Bloom','Raven','Drift','Pilgrim','Comet','Saint','Jackal','Orchid','Phantom','Riot','Harbor','Atlas','Moth','Hustle','Voltage'];
const pk=a=>a[Math.floor(Math.random()*a.length)];
window.nmPrev=function(v){v=String(v==null?'':v);const b=$('nmgo'),c=$('nmct');if(b)b.disabled=v.trim().length<2;if(c)c.textContent=v.length+'/24'};
window.nmRoll=function(){const i=$('an');if(!i)return;i.value=(pk(A1)+' '+pk(A2)).slice(0,24);nmPrev(i.value);i.focus()};
window.sgBar=q=>{q=Math.max(0,Math.min(100,q|0));const n=Math.max(q?1:0,Math.round(q/10));return'<span class=sgbar>'+Array.from({length:10},(_,i)=>`<i${i<n?' class=on':''}></i>`).join('')+'</span>'};
PG.setup=()=>`<div class=nmw><div class="nmp"><img class=nmlg src="${IC.fw}" alt=""><small class=nmk>NEW ARTIST</small><h1>Pick your name</h1>
<p class=m>This is what listeners will see.</p>
<div class=nmin><input id=an maxlength=24 autocomplete=off spellcheck=false placeholder="Artist name" oninput="nmPrev(this.value)" onkeydown="if(event.key=='Enter')setA()"><span id=nmct>0/24</span></div>
<div class=nmbt><button type=button onclick="nmRoll()">Random</button><button id=nmgo type=button class=go disabled onclick="setA()">Continue</button></div></div></div>`;
const row=d=>{const q=Math.max(0,d.q||0),hue=[...String(d.g)].reduce((a,c)=>a+c.charCodeAt(0),0)*37%60+250;
 return`<div class="ng udc"><div class=udcv style="background:linear-gradient(135deg,hsl(${hue},65%,42%),hsl(${hue+40},60%,20%))">${sfDraftBtn(d)}</div><div class=udm><input value="${E(stripFt(d.title))}" maxlength=48 aria-label="Song title" placeholder="Song title" oninput="dTitle(${d.id},this.value)"><div class=udtg><span class=udg>${E(d.g)}</span>${d.ft?`<span class=udg>FEAT ${E(d.ft)}</span>`:''}${sgBar(q)}<b class=udq>${q}</b></div></div><button class=go onclick="upl(${d.id})">Upload</button></div>`};
PG.upload=()=>{const D=S.drafts||[],ok=D.filter(d=>d.title.trim()).length;
 const head=`<div class=uphd><div><small class=nmk>YOUR MUSIC</small><h1>Upload</h1></div>${D.length>1?`<button class=go ${ok?'':'disabled'} onclick="uplAll()">Upload all (${ok})</button>`:''}</div>`;
 if(!D.length)return`<div class=upw>${head}<div class=upem><b>NO SONGS YET</b><p class=m>Record one in your studio and it lands here.</p></div></div>`;
 return`<div class=upw>${head}<div class=udl>${D.map(row).join('')}</div></div>`};
const st=document.createElement('style');st.textContent=`
.nmw,.upw,.sgm{--sp:#a66bff;--sf:Silkscreen,ui-monospace,monospace}
.nmk{display:block;font:10px var(--sf);letter-spacing:3px;color:var(--sp)}
.nmw button.go,.upw button.go,.sgm button.go{background:var(--sp);color:#fff;text-shadow:1px 1px 0 #0006}.nmw button.go:hover,.upw button.go:hover,.sgm button.go:hover{background:#b98aff}
.nmw button.go:disabled,.upw button.go:disabled{background:#3a2d57;color:#8f80b0}
.nmw{display:flex;justify-content:center;padding:7vh 10px 0}
.nmp{width:100%;max-width:400px;box-sizing:border-box;background:#171320;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640,6px 6px 0 #0008;padding:28px 26px;text-align:center}
.nmlg{width:44px;height:44px;image-rendering:pixelated;margin:0 0 10px}.nmp h1{font:22px var(--sf);margin:8px 0 6px}.nmp p{margin:0 0 20px;font-size:13px}
.nmin{position:relative;margin:0 0 14px}.nmin input{font-size:18px;padding:13px 52px 13px 14px;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640;background:#0d0b13;text-align:left}.nmin input:focus{outline:0;box-shadow:inset 0 0 0 2px var(--sp)}
.nmin span{position:absolute;right:12px;top:50%;transform:translateY(-50%);font:10px var(--sf);color:var(--m)}
.nmbt{display:flex;gap:10px}.nmbt button{padding:12px 14px;font-size:14px}.nmbt .go{flex:1}
.upw{max-width:780px;margin:0 auto;padding:6px 4px 18px}
.uphd{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin:0 0 16px;padding:0 0 14px;border-bottom:3px solid #000;box-shadow:0 2px 0 #2e2640}
.uphd h1{font:26px var(--sf);margin:4px 0 0}.uphd .go{padding:10px 16px}
.udl{display:grid;gap:12px}
.udc.ng{display:flex;align-items:center;gap:14px;margin:0;padding:12px;background:#171320;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640,4px 4px 0 #0008}
.udcv{position:relative;flex:none;width:64px;height:64px;border:3px solid #000;box-shadow:inset 0 0 0 2px #fff2;display:flex;align-items:center;justify-content:center}
.udc .bpl{background:var(--sp)!important;color:#fff!important;border:2px solid #000!important}
.udm{flex:1;min-width:0}.udm input{margin:0 0 8px;padding:8px 10px;font-size:15px;border:2px solid #000;box-shadow:inset 0 0 0 2px #2e2640;background:#0d0b13}.udm input:focus{outline:0;box-shadow:inset 0 0 0 2px var(--sp)}
.udtg{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.udg{font:9px var(--sf);letter-spacing:1px;padding:3px 6px;background:#251d3a;border:2px solid #000;color:#c9a7ff}
.udq{font:11px var(--sf);color:var(--m)}
.sgbar{display:inline-flex;gap:2px;margin-left:auto}.sgbar i{width:7px;height:10px;background:#0d0b13;border:1px solid #000}.sgbar i.on{background:var(--sp)}
.udc>.go{flex:none;padding:12px 16px}
.upem{text-align:center;background:#171320;border:3px dashed #2e2640;padding:44px 20px}.upem b{font:12px var(--sf);letter-spacing:2px;color:var(--sp)}.upem p{margin:8px 0 0}
.sgm{text-align:center;min-width:300px;max-width:360px;background:#171320!important;box-shadow:inset 0 0 0 2px #2e2640,6px 6px 0 #0008!important;padding:22px 22px 18px!important}
.sgm h2{font:20px var(--sf);margin:6px 0 10px}.sgm .sgbar{margin:0 0 6px}.sgm .sgbar i{width:12px;height:16px}
.sgm p{margin:0 0 12px;font-size:12px}.sgm input{margin:0 0 12px;padding:11px;font-size:16px;text-align:center;border:3px solid #000;box-shadow:inset 0 0 0 2px #2e2640;background:#0d0b13}.sgm input:focus{outline:0;box-shadow:inset 0 0 0 2px var(--sp)}
.sgm .row2{display:block}.sgm button.go{width:100%;padding:12px}
@media (max-width:480px){.udc.ng{flex-wrap:wrap}.udm{flex-basis:calc(100% - 80px)}.udc>.go{width:100%}.nmp{padding:22px 16px}}`;
document.head.appendChild(st);
})();
