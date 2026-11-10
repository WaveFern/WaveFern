/* ---- v49.94.7: simplified "choose a name" and "Upload" screens ----
   One focused card each: no previews, step guides, tips or stat strips. Behaviour unchanged: setA() needs 2+ characters,
   upl()/uplAll() need a title, titles keep their (feat. NAME) tag. */
(function(){
if(typeof PG!='object'||!PG)return;
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.nmPrev=function(v){const b=$('nmgo');if(b)b.disabled=String(v==null?'':v).trim().length<2};
PG.setup=()=>`<div class=nmw><img class=nmlg src="${IC.fw}" alt=""><h1>Choose your artist name</h1>
<input id=an maxlength=24 autocomplete=off spellcheck=false placeholder="Artist name" oninput="nmPrev(this.value)" onkeydown="if(event.key=='Enter')setA()">
<button id=nmgo type=button class=go disabled onclick="setA()">Continue</button></div>`;
PG.upload=()=>{const D=S.drafts||[],ok=D.filter(d=>d.title.trim()).length;
 const head=`<div class=uphd><h1>Upload</h1>${D.length>1?`<button class=go ${ok?'':'disabled'} onclick="uplAll()">Upload all (${ok})</button>`:''}</div>`;
 if(!D.length)return`<div class=upw>${head}<p class="m upem">No songs yet. Record one in your studio and it will show up here.</p></div>`;
 return`<div class=upw>${head}<div class=udl>${D.map(d=>`<div class="ng udc">${sfDraftBtn(d)}<div class=udm><input value="${E(stripFt(d.title))}" maxlength=48 aria-label="Song title" placeholder="Song title" oninput="dTitle(${d.id},this.value)"><small class=m>${E(d.g)}${d.ft?' · feat. '+E(d.ft):''} · Quality ${Math.max(0,d.q||0)}</small></div><button class=go onclick="upl(${d.id})">Upload</button></div>`).join('')}</div></div>`};
const st=document.createElement('style');st.textContent=`
.nmw{max-width:380px;margin:8vh auto 0;padding:0 8px;text-align:center}.nmlg{width:48px;height:48px;image-rendering:pixelated}
.nmw h1{font-size:24px;margin:10px 0 18px}.nmw #an{width:100%;box-sizing:border-box;font-size:20px;padding:12px 14px;text-align:center;margin:0 0 12px}
.nmw .go{width:100%;padding:12px;font-size:15px}.nmw .go:disabled{opacity:.5}
.upw{max-width:760px;margin:0 auto;padding:6px 4px 18px}.uphd{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 0 16px}.uphd h1{font-size:26px;margin:0}
.udl{display:grid;gap:10px}.udc.ng{display:flex;align-items:center;gap:12px;margin:0;padding:12px}
.udc .bpl{flex:none}.udm{flex:1;min-width:0}.udm input{width:100%;box-sizing:border-box;margin:0 0 4px}
.udc>.go,.uphd .go{flex:none;padding:10px 16px}.upem{text-align:center;padding:40px 0}
@media (max-width:480px){.udc.ng{flex-wrap:wrap}.udm{flex-basis:calc(100% - 60px)}.udc>.go{width:100%}}`;
document.head.appendChild(st);
})();
