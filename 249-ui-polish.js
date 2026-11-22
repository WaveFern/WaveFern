/* v55.21.0: UI polish pass (section 4 of the fix list). Loads after 161-multiplayer.js so it can wrap what earlier files built.
   1 Main menu: every in-game overlay (minimap, its label, the milestone bar, time chips, ...) is hidden while the menu is open (see `sweep`).
   2 The milestone bar (#hkbar) is also hidden whenever the pause menu is open.
   3 WaveFern app icon badge is a plain red dot, like the Messages one.
   4 Bar chart on the PC Stats page: each bar shows its day and streams on hover (data-t, see 06-computer.js).
   5 Messages scrollbar uses the app's own scrollbar colours; PC side-nav buttons get left padding.
   6 Instagrime: one look (WaveFern pixel frame + Instagram layout), same-size profile grid pictures, and a bottom dock
     (Feed, Promote, New post, Photo post, Account) instead of the Promote and New post blocks on the profile.
   7 App Barn looks like a store: search bar, hero, tile grid with icons and pill buttons.
   8 Graphics preset slider thumb stops line up with the labels under it. */
(function(){
 /* ---------- 1: main menu shows only the menu ---------- */
 const KEEP=/^(ui|c|fwmbg|fwdg-v|fwdg-b|fwmfade|annote|pzo|load|fatal|toast)$/;
 let wasT=false;
 /* v55.21.8: only the overlays that exist when the menu opens are hidden. Panels opened FROM the menu (profile #pfx, leaderboard, stats, ...) are added later and must stay visible. */
 function sweep(){try{
  const t=typeof TT!='undefined'&&TT.on&&typeof mode!='undefined'&&mode=='title';
  if(t==wasT)return;wasT=t;
  if(t){for(const e of document.body.children){if(/^(SCRIPT|STYLE|NOSCRIPT|LINK)$/.test(e.tagName)||KEEP.test(e.id))continue;e.classList.add('fwtth')}}
  else document.querySelectorAll('.fwtth').forEach(e=>e.classList.remove('fwtth'));
 }catch(e){}}
 try{const mo=new MutationObserver(sweep);mo.observe(document.body,{childList:true});const u=document.getElementById('ui');if(u)mo.observe(u,{childList:true});sweep()}catch(e){}

 /* ---------- 6: Instagrime dock ---------- */
 const spr=rows=>{const w=rows[0].length;let r='';rows.forEach((row,y)=>{for(let x=0;x<w;x++)if(row[x]=='#')r+=`<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`});return`<svg viewBox="0 0 ${w} ${rows.length}" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${r}</svg>`};
 const ICO={
  home:spr(['....##....','...####...','..######..','.########.','##########','.##....##.','.##.##.##.','.##.##.##.','.##.##.##.','.########.']),
  plus:spr(['...##...','...##...','...##...','########','########','...##...','...##...','...##...']),
  cam:spr(['..####....','##########','#........#','#..####..#','#.##..##.#','#.##..##.#','#..####..#','##########']),
  me:spr(['..####..','.######.','.######.','..####..','........','.######.','########','########']),
  mega:spr(['......##..','....####..','#######.#.','#######.#.','#######.#.','..###.###.','..##..###.','..##......'])};
 const dockBtn=(on,act,ico,t,cls,dis)=>`<button class="${on?'on ':''}${cls||''}" title="${t}" aria-label="${t}" ${dis?'disabled':''} onclick="${act}">${ico}</button>`;
 function dock(){
  const v=typeof igv=='string'?igv:'feed',posted=typeof S!='undefined'&&S.lastPost==S.day;
  return`<nav class=igdock>${dockBtn(v=='feed'||v=='post'&&!(igp&&igp.mine),"igv='feed';pcR()",ICO.home,'Feed')}${dockBtn(v=='promo',"igv='promo';pcR()",typeof pxIcon=='function'&&pxIcon('mega')||ICO.mega,'Promote your songs')}${dockBtn(0,'igcOpen()',ICO.plus,posted?'One post per day':'New post','igdp',posted)}${dockBtn(0,'pxPostPick()',ICO.cam,'Photo post','',posted)}${dockBtn(v=='acct'||v=='post'&&igp&&igp.mine,"igv='acct';igt='posts';pcR()",ICO.me,'Your account')}</nav>`}
 if(typeof PA!='undefined'&&PA.ig){const ig0=PA.ig;PA.ig=function(){let h=ig0.apply(this,arguments);try{
  if(typeof h!='string'||h.indexOf('class=ig>')<0||h.indexOf('class=igc')>=0)return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  const hs=R.querySelector('.igh>span:last-child');if(hs&&hs.querySelector('button'))hs.remove();
  if(typeof igv!='undefined'&&igv=='acct'){
   R.querySelectorAll('button').forEach(b=>{if(/^(igcOpen|pxPostPick)\(\)/.test(b.getAttribute('onclick')||''))b.remove()});
   R.querySelectorAll('button[onclick*="igv=\'promo\'"]').forEach(b=>{const k=b.closest('div[style*="border-top"]');if(k)k.remove()});
   R.querySelectorAll('div[style*="padding:0 14px 10px"]').forEach(d=>{if(!d.children.length&&!d.textContent.trim())d.remove()})}
  const root=R.querySelector('.ig');if(root)root.insertAdjacentHTML('beforeend',dock());
  const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error('ig dock',e)}return h}}

 /* ---------- 7: App Barn store look ---------- */
 const SQ=window.fwStoreQ=q=>{q=String(q||'').toLowerCase();document.querySelectorAll('#pc .site.st .card[data-pv]').forEach(c=>{c.style.display=!q||c.textContent.toLowerCase().includes(q)?'':'none'})};
 if(typeof PA!='undefined'&&PA.store){const s0=PA.store;PA.store=function(){let h=s0.apply(this,arguments);try{
  if(typeof h!='string'||h.indexOf('class="site st"')<0)return h;
  const keys=Object.keys(APPD),own=keys.filter(k=>S.apps[k]).length;
  h=h.replace(/<div class=sh>[\s\S]*?<\/div>/,`<div class=sh><span class=stlg><img src="${IC.store}" alt=""><b>App Barn</b></span><input class=stq type=search placeholder="Search apps" aria-label="Search apps" oninput="fwStoreQ(this.value)"><span class=stbal>${$$(S.money)}</span></div>`);
  h=h.replace(/<h1>[\s\S]*?<\/h1><p class=m>[\s\S]*?<\/p>/,`<div class=sthero><small>FOR YOUR LAPTOP</small><h2>Get the apps</h2><p>${own} of ${keys.length} installed. Apps cost real money here. Yee-haw.</p></div>`);
  h=h.replace(/(<div class=card data-pv="a:([a-z0-9_]+)"[^>]*>)/gi,(m,a,k)=>a+(IC[k]?`<img class=stic src="${IC[k]}" alt="">`:`<span class=stic>${esc((APPD[k]&&APPD[k].n||'?')[0])}</span>`));
  return h}catch(e){console.error('store look',e)}return h}}

 /* ---------- 8: graphics slider labels ---------- */
 if(typeof gfxSlider=='function'){const g0=gfxSlider;gfxSlider=function(){let h=g0.apply(this,arguments);
  return h.replace('<div class=so style="flex-wrap:wrap">','<div class="so gfxsl" style="flex-wrap:wrap">').replace('<div style="display:flex;justify-content:space-between;width:100%;font-size:11px;opacity:.75">','<div class=gfxl>')}}

 /* ---------- CSS ---------- */
 const st=document.createElement('style');st.textContent=`
.fwtth{display:none!important}
body:has(#pzo) #hkbar{display:none!important}
#ph .phi[onclick*="'sf'"] .bd{font-size:0!important;line-height:0!important;width:14px;height:14px;min-width:14px;padding:0!important;border-radius:50%!important;border:2px solid #000;box-sizing:border-box;top:-3px!important;right:8px!important}
.ch i{position:relative}
.ch i:hover,.ch i:focus{background:#fff;outline:0}
.ch i[data-t]:hover::after,.ch i[data-t]:focus::after{content:attr(data-t);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);white-space:nowrap;background:#000;color:#e8f3ec;border:2px solid var(--g);padding:3px 7px;font:11px Silkscreen,ui-monospace,monospace;z-index:5;pointer-events:none}
.ch i:first-child[data-t]:hover::after{left:0;transform:none}.ch i:last-child[data-t]:hover::after{left:auto;right:0;transform:none}
.msx{--sbw:10px}
.msx .cl,.msx .crs{--sbk:#1e1537;--sbt:#8a4dff;--sbh:#ff3d81;--sbe:#1e1537}
.msx .cv,.msx .cvb{--sbk:#fff7f0;--sbt:#c9a4ff;--sbh:#ff3d81;--sbe:#fff7f0}
.msx ::-webkit-scrollbar-track{box-shadow:none;border-left:0}
.msx ::-webkit-scrollbar-thumb{border-radius:8px;box-shadow:none}
.sb button{padding:8px 12px 8px 14px}
.gfxsl input[type=range]{display:block;width:calc(83.333% + 20px)!important;margin:6px 0 0 calc(8.333% - 10px)}
.gfxl{display:grid;grid-template-columns:repeat(6,1fr);width:100%;font-size:11px;opacity:.75;text-align:center}
.ig .grid img,.ig .grid>*{aspect-ratio:1/1;object-fit:cover;width:100%;height:100%;display:block;min-width:0}
.ig .grid p{aspect-ratio:auto;grid-column:1/-1}
/* Instagrime: WaveFern pixel frame, Instagram layout */
.ig{background:#0b0f0d;color:#e8f3ec;border:3px solid #000;border-radius:0;box-shadow:inset 0 0 0 2px #2a352e;display:flex;flex-direction:column;min-height:100%;font:14px/1.4 system-ui,sans-serif}
.ig>*{flex-shrink:0}
.ig .igh{border-bottom:2px solid #000;box-shadow:0 2px 0 #2a352e;padding:10px 14px}
.ig .igl{font:700 20px Silkscreen,monospace;letter-spacing:1px;background:linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2 70%,#2fe68a);-webkit-background-clip:text;background-clip:text;color:transparent}
.ig button{font-family:Silkscreen,ui-monospace,monospace;font-size:11px}
.ig .post{border-bottom:2px solid #1b241f;padding-bottom:10px}
.ig .ph{padding:8px 14px}.ig .ph .av,.ig .cm img{border:2px solid #000;box-shadow:0 0 0 2px #e91e63;border-radius:50%}
.ig .pic{border-top:2px solid #000;border-bottom:2px solid #000;image-rendering:pixelated}
.ig .acc .pf{border:3px solid #000;box-shadow:0 0 0 3px #e91e63,0 0 0 5px #f9a825;border-radius:50%;image-rendering:pixelated}
.ig .igm{padding:0;gap:0;border-top:2px solid #1b241f}
.ig .igm button{flex:1;border:0;border-bottom:3px solid transparent;background:none;box-shadow:none;color:#8aa094;padding:9px 4px;border-radius:0}
.ig .igm button.go{color:#fff;border-bottom-color:var(--g)}
.ig .grid{gap:2px;background:#000}
.ig .igst{border-bottom:2px solid #1b241f}
.igdock{position:sticky;bottom:0;margin-top:auto;display:flex;justify-content:space-around;align-items:center;gap:4px;background:#070a09;border-top:3px solid #000;box-shadow:inset 0 2px 0 #2a352e;padding:6px 10px 8px;z-index:4}
.igdock button{width:44px;height:38px;display:flex;align-items:center;justify-content:center;background:none;border:2px solid transparent;box-shadow:none;color:#8aa094;padding:0;cursor:pointer}
.igdock button svg{width:22px;height:22px}
.igdock button:hover{color:#fff}
.igdock button.on{color:var(--g);border-bottom-color:var(--g)}
.igdock button:disabled{opacity:.35;cursor:default}
.igdock button.igdp{width:52px;height:40px;background:linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2);color:#fff;border:2px solid #000;box-shadow:inset 0 -3px #0004,0 3px 0 #000}
.igdock button.igdp:hover{filter:brightness(1.12)}
/* App Barn: light theme for this app only, uniform card grid (v55.30.19) */
.site.st{background:#f3f6f9;color:#1a2530;font-family:system-ui,sans-serif;min-height:100%}
#pc:has(.site.st),#pc .site.st{background:#f3f6f9}
.site.st .sh{display:flex;align-items:center;gap:14px;padding:10px 24px;background:#fff;border-bottom:2px solid #1c2630;box-shadow:0 2px 0 #d5dde4}
.site.st .sh b{color:#1a2530;font:700 14px Silkscreen,monospace}
.site.st .stlg{display:flex;align-items:center;gap:8px}.site.st .stlg img{width:22px;image-rendering:pixelated}
.site.st .stq{flex:1;max-width:420px;margin:0 auto;background:#f3f6f9;color:#1a2530;border:2px solid #1c2630;box-shadow:none;border-radius:999px;padding:7px 16px;font:13px system-ui,sans-serif}
.site.st .stq:focus{outline:0;border-color:#1e9e5a}
.site.st .stbal{color:#17803f;font:700 12px Silkscreen,monospace}
.site.st .sb2{background:#f3f6f9;color:#1a2530;padding:20px 24px 28px;display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;align-content:start;align-items:stretch}
.site.st .sthero{grid-column:1/-1;padding:22px 24px;border:2px solid #1c2630;background:linear-gradient(120deg,#d8ecff,#e8defc 60%,#d3f5e3);margin-bottom:6px}
.site.st .sthero small{font:10px Silkscreen,monospace;letter-spacing:2px;color:#2a6aa0}
.site.st .sthero h2{margin:4px 0;font:700 26px Silkscreen,monospace;color:#1a2530}.site.st .sthero p{margin:0;color:#44566a}
.site.st .card{margin:0!important;padding:14px!important;background:#fff;border:2px solid #1c2630;box-shadow:0 3px 0 #c9d3dc;border-radius:14px;display:grid!important;grid-template-columns:48px minmax(0,1fr);grid-template-rows:1fr auto;column-gap:12px!important;row-gap:12px;align-items:start!important;min-height:150px;box-sizing:border-box}
.site.st .card:hover{border-color:#1e9e5a}
.site.st .card>div{min-width:0}
.site.st .card b{color:#1a2530!important;font-size:15px!important}.site.st .card .m{color:#5b6b78!important;font-size:12px;line-height:1.4}
.site.st .stic{width:48px;height:48px;flex:none;border-radius:12px;background:#e6edf3;border:2px solid #1c2630;padding:6px;box-sizing:border-box;image-rendering:pixelated;display:flex;align-items:center;justify-content:center;font:700 20px Silkscreen,monospace;color:#17803f}
.site.st .card button{grid-column:1/-1;align-self:end;width:100%;border-radius:999px;padding:7px 16px;white-space:normal;text-align:center;background:#e6edf3;color:#1a2530;border:2px solid #1c2630;font:700 12px Silkscreen,monospace;cursor:pointer}
.site.st .card button.go{background:#2fe68a;color:#06210f}
.site.st .card button:hover:not(:disabled){filter:brightness(.95)}
.site.st .card button:disabled{background:#eceff2;color:#77838e;border-color:#9aa6b1;cursor:default}
`;document.head.appendChild(st);
})();
