/* ---------- v49.47.0: pop-ups that look like where they happen ----------
   The green-on-black box stays for WaveFern itself (settings, pause, saves, sign-in, stats, admin, band rooms, the
   song menu). Everything that happens in the world now has its own look, with no emoji:
   - robbery: a police incident report with a case number, place, time, what was taken and a THEFT stamp
   - meeting an artist to collab: a studio-lounge chat, their line in a speech bubble, your replies as your bubbles,
     and an opinion meter
   - the morning results: a newspaper, "The Morning Mix", with a masthead, the weather and an "around town" column
   - going to bed: a night sky with a moon and stars
   - your first home: an estate agent's key tag
   - gifts: wrapping paper and a ribbon
   - tower lifts: a brushed-steel lift panel
   - tour hotels: hotel stationery
   - tour box office, show planning and show results: a concert ticket
   - Park Fields Festival: a festival wristband
   - world and city maps: a folded paper map
   - airport information: a departures board
   Done by watching #ui: when a box appears it is matched by its id, class or heading and gets a theme class plus a
   few decorations, so the code that builds each box is unchanged. */
(function(){
const ui=document.getElementById('ui');if(!ui)return;
const EMO=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F900}-\u{1F9FF}]️?|️|‍/gu;
const KEEP=/[✓←-⇿•·]/;/* ticks, arrows and dots are text, not emoji */
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const ico=n=>{try{return pxIcon(n)}catch(e){return''}};
const h2=b=>{const h=b.querySelector('h2');return h?h.textContent.trim():''};
const txt=b=>b.textContent||'';

/* which theme a box gets (null: leave it as the WaveFern box) */
function kind(b){const t=h2(b),id=b.id||'',c=b.classList;
 if(id=='rob')return'rob';if(c.contains('mtg'))return'meet';if(id=='gift')return'gift';
 if(/^Day \d+$/.test(t)&&b.querySelector('.cards'))return'news';
 if(t=='Go to bed?')return'night';if(t=='Welcome home')return'keys';
 if(/Current floor:/.test(txt(b)))return'lift';
 if(/^World map$/.test(t)||b.querySelector('#bm,#dsmap'))return'atlas';
 if(/^i\s/.test(t)&&/Time now/.test(txt(b)))return'depart';
 if(/^Park Fields Festival/.test(t)||/^Stage \d+ ·/.test((b.querySelector('p.m')||{}).textContent||''))return'fest';
 if(/^(Box office|Plan the show) · /.test(t)||/crowd moments.*score \d+/.test((b.querySelector('p.m')||{}).textContent||''))return'ticket';
 try{const D=window.DCITY;if(D&&D.C&&D.C.spots&&D.C.spots.hotel&&t==D.C.spots.hotel.n)return'hotel'}catch(e){}
 if(/^Hotel$/.test(t))return'hotel';
 return null}

function noEmoji(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const v=n.nodeValue;if(EMO.test(v)){EMO.lastIndex=0;n.nodeValue=v.replace(EMO,m=>KEEP.test(m)?m:'').replace(/\s{2,}/g,' ')}EMO.lastIndex=0}}

const DECO={
 news(b){const wx=(()=>{try{return wxToday().n||''}catch(e){return''}})(),d=h2(b);
  const m=document.createElement('div');m.className='thmast';m.innerHTML=`<div class=thmt>The Morning Mix</div><div class=thmd><span>${E(d)}</span><span>${E(wx||'Fair skies')}</span><span>Price: free</span></div>`;
  b.insertBefore(m,b.firstChild);
  try{if(typeof popMorningHTML=='function'&&!b.querySelector('.popam')){const a=document.createElement('div');a.innerHTML=popMorningHTML();const btn=b.querySelector('button.go');const at=btn?btn.closest('.row2')||btn:null;if(a.firstChild)at?b.insertBefore(a.firstChild,at):b.appendChild(a.firstChild)}}catch(e){}},
 night(b){const s=document.createElement('div');s.className='thsky';s.innerHTML='<i class=moon></i>'+Array.from({length:18},(_,i)=>`<b style="left:${(i*37)%100}%;top:${(i*53)%90}%;animation-delay:${(i%5)*.4}s"></b>`).join('');b.insertBefore(s,b.firstChild)},
 keys(b){const k=document.createElement('div');k.className='thkey';k.innerHTML='<span>No. 1</span><i></i>';b.insertBefore(k,b.firstChild)},
 gift(b){const r=document.createElement('div');r.className='thbow';b.insertBefore(r,b.firstChild)},
 lift(b){const p=document.createElement('div');p.className='thlcd';const m=txt(b).match(/Current floor:\s*(\d+)/);p.innerHTML=`<span class=arr>${ico('pin')}</span><b>${m?m[1].padStart(2,'0'):'--'}</b>`;b.insertBefore(p,b.firstChild)},
 hotel(b){const c=document.createElement('div');c.className='thcrest';c.innerHTML='<i></i><span>Est. 1928 · Front desk</span>';b.insertBefore(c,b.firstChild)},
 ticket(b){const s=document.createElement('div');s.className='thstub';s.innerHTML=`<span>Admit one</span><b>No. ${String((S.day||1)*731%100000).padStart(5,'0')}</b>`;b.appendChild(s)},
 fest(b){const s=document.createElement('div');s.className='thband';s.innerHTML='<span>Park Fields</span><span>Artist</span><span>All areas</span>';b.insertBefore(s,b.firstChild)},
 depart(b){const s=document.createElement('div');s.className='thdep';s.innerHTML='<span>Departures</span><span class=clk></span>';try{s.querySelector('.clk').textContent=clk()}catch(e){}b.insertBefore(s,b.firstChild)},
 atlas(b){},meet(b){},rob(b){}
};

function theme(b){if(!b||b.dataset.th)return;const k=kind(b);if(!k)return;b.dataset.th=k;b.classList.add('th','th-'+k);try{(DECO[k]||(()=>{}))(b)}catch(e){console.error('theme',k,e)}noEmoji(b)}
function scan(){ui.querySelectorAll(':scope>.box,:scope>.box.modal,:scope>div>.box.modal').forEach(theme)}
new MutationObserver(()=>{try{scan()}catch(e){}}).observe(ui,{childList:true,subtree:true});

/* ---------- robbery: a full incident report ---------- */
if(typeof fanRob=='function'){const r0=fanRob;fanRob=function(n){const m0=S.money||0;const out=r0.apply(this,arguments);try{const b=$('rob');if(!b)return out;
 const took=Math.max(0,m0-(S.money||0)),g=S.gs=='follow'?S.guards|0:0,where=(()=>{try{return taxiSpot(P.x,P.z)}catch(e){return null}})()||'a street in the city',cn='WF-'+String(S.day).padStart(3,'0')+'-'+String(Math.floor(Math.random()*9000)+1000);
 const looks=['Hoodie up, grey trainers','Green cap, big smile, fast','Denim jacket, holding a phone','Tall, black puffer, ran east','Short, red scarf, very polite'][Math.floor(Math.random()*5)];
 b.innerHTML=`<div class=thtape></div><div class=thrh><span>City Police · Incident report</span><b>${cn}</b></div><h2>Theft from person</h2>
  <div class=thstamp>Theft</div>
  <dl><dt>Victim</dt><dd>${E(S.artist||'You')}</dd><dt>Where</dt><dd>${E(where)}</dd><dt>When</dt><dd>Day ${S.day}, ${(()=>{try{return clk()}catch(e){return''}})()}</dd>
  <dt>What happened</dt><dd>Posed as a fan and asked for an autograph. Took cash while you signed, then ran into the crowd.</dd>
  <dt>Suspect</dt><dd>${looks}</dd><dt>Taken</dt><dd class=red>${E($$(took))} (35% of the cash you carried)</dd><dt>Left on you</dt><dd>${E($$(S.money||0))}</dd>
  <dt>Bodyguards with you</dt><dd>${g}${g<3?' · more guards means fewer fake fans get close':''}</dd></dl>
  <p class=thsig>Officer on duty: <i>Sgt. M. Okoro</i></p><div class=row2><button class=go onclick="closeUI()">Sign the report</button></div>`}catch(e){console.error('rob report',e)}return out}}

/* ---------- collab meeting: opinion meter ---------- */
if(typeof meetR=='function'){const m0=meetR;meetR=function(){const out=m0.apply(this,arguments);try{const b=document.querySelector('#ui .mtg');if(!b||!MEET)return out;const op=MEET.op||0,h=b.querySelector('.mth');
 if(h&&!b.querySelector('.thop')){const d=document.createElement('div');d.className='thop';d.innerHTML=`<span>Vibe</span>${[-3,-2,-1,0,1,2,3].map(v=>`<i class="${v<0&&op<=v?'n':v>0&&op>=v?'p':v==0?'z':''}"></i>`).join('')}`;h.appendChild(d)}
 const k=b.querySelector('small.m:last-child');if(k&&/Exchange/.test(k.textContent))k.classList.add('thex')}catch(e){}return out}}

/* ---------- looks ---------- */
const st=document.createElement('style');st.id='thcss';st.textContent=`
#ui .box.th{--bg:#fff;--ink:#222;--mu:#666;--ac:#333;--aci:#fff;--bt:#eee;--bti:#222;--cd:#0000000d;--ln:#0003;
 background:var(--bg)!important;color:var(--ink);border:3px solid #111;box-shadow:6px 6px 0 #0009!important;padding:16px 18px}
#ui .box.th .m,#ui .box.th small.m,#ui .box.th p.m{color:var(--mu)}
#ui .box.th h2{color:var(--ink)}
#ui .box.th button{background:var(--bt);color:var(--bti);border:2px solid #111}
#ui .box.th button.go{background:var(--ac);color:var(--aci)}
#ui .box.th button:hover:not(:disabled){filter:brightness(1.08)}
#ui .box.th .card{background:var(--cd);border:1px solid var(--ln);border-radius:0;color:var(--ink)}
#ui .box.th .card b{color:var(--ac)}
/* police report */
#ui .box.th-rob{--bg:#f4f0e2;--ink:#1d2333;--mu:#5a6070;--ac:#1d2a4a;--aci:#f4f0e2;--bt:#e6e0cc;width:min(460px,94vw)!important;text-align:left!important;font-family:'Special Elite',ui-monospace,monospace;
 background-image:repeating-linear-gradient(#0000 0 25px,#3a5aa022 25px 26px)!important;position:relative;overflow:hidden}
#ui .box.th-rob .thtape{height:16px;margin:-16px -18px 10px;background:repeating-linear-gradient(-45deg,#ffd200 0 14px,#111 14px 28px)}
#ui .box.th-rob .thrh{display:flex;justify-content:space-between;font-size:11px;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #1d2333;padding-bottom:6px;margin-bottom:8px}
#ui .box.th-rob h2{font-family:'Special Elite',ui-monospace,monospace;font-size:24px}
#ui .box.th-rob .thstamp{position:absolute;right:18px;top:58px;transform:rotate(-12deg);border:4px double #c0262d;color:#c0262d;font:900 22px 'Bungee',Impact,sans-serif;padding:2px 10px;letter-spacing:.12em;text-transform:uppercase;opacity:.85}
#ui .box.th-rob dl{display:grid;grid-template-columns:120px 1fr;gap:5px 10px;margin:6px 0 10px;font-size:13px}#ui .box.th-rob dt{color:var(--mu);text-transform:uppercase;font-size:11px;padding-top:2px}#ui .box.th-rob dd{margin:0;border-bottom:1px dotted #1d233355}#ui .box.th-rob dd.red{color:#c0262d;font-weight:700}
#ui .box.th-rob .thsig{font-size:12px;color:var(--mu)}#ui .box.th-rob .thsig i{font-family:'Permanent Marker',cursive;color:#1d2a4a;font-size:16px}
/* collab meeting: studio lounge */
#ui .box.th-meet{--bg:#2a1f2e;--ink:#f7ecdf;--mu:#c8b4a8;--ac:#ffb35c;--aci:#2a1f2e;--bt:#3a2c40;--bti:#f7ecdf;
 background:linear-gradient(#3a2838,#22182a)!important;border-color:#000!important}
#ui .box.th-meet .mth{background:#00000040;margin:-16px -18px 12px;padding:12px 18px;border-bottom:3px solid #ffb35c;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
#ui .box.th-meet .mth img{border-radius:50%;border:3px solid #ffb35c}
#ui .box.th-meet .mtl{position:relative;background:#f7ecdf;color:#2a1f2e;padding:10px 14px;border-radius:14px 14px 14px 3px;margin:4px 40px 12px 0;font-size:15px}
#ui .box.th-meet .mto{display:block;width:100%;text-align:left;margin:6px 0;padding:9px 14px;border-radius:14px 14px 3px 14px!important;background:#ffb35c!important;color:#2a1f2e!important;border:2px solid #000;margin-left:auto;max-width:88%}
#ui .box.th-meet .mto:hover{background:#ffc883!important}
#ui .box.th-meet .thop{display:flex;align-items:center;gap:3px;margin-left:auto;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--mu)}#ui .box.th-meet .thop span{margin-right:5px}
#ui .box.th-meet .thop i{width:10px;height:14px;background:#00000060;border:1px solid #000}#ui .box.th-meet .thop i.z{background:#c8b4a8}#ui .box.th-meet .thop i.p{background:#7ad08a}#ui .box.th-meet .thop i.n{background:#ff6a6a}
/* morning paper */
#ui .box.th-news{--bg:#f3eee1;--ink:#1a1a1a;--mu:#555;--ac:#1a1a1a;--aci:#f3eee1;--bt:#e4ddca;--cd:#0000;--ln:#1a1a1a;font-family:Georgia,'Times New Roman',serif;width:min(560px,94vw)!important}
#ui .box.th-news>h2{display:none}
#ui .box.th-news .thmast{text-align:center;border-bottom:4px double #1a1a1a;margin-bottom:10px}
#ui .box.th-news .thmt{font:900 34px/1 'Playfair Display',Georgia,serif;letter-spacing:.01em;padding:2px 0 6px}
#ui .box.th-news .thmd{display:flex;justify-content:space-between;border-top:1px solid #1a1a1a;padding:3px 0;font-size:11px;text-transform:uppercase;letter-spacing:.1em}
#ui .box.th-news .cards{display:grid;grid-template-columns:1fr 1fr;gap:0}#ui .box.th-news .card{border:0;border-right:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;padding:8px 10px;font-family:Georgia,serif}
#ui .box.th-news .card:nth-child(2n){border-right:0}#ui .box.th-news .card b{font:700 22px 'Playfair Display',Georgia,serif;color:#1a1a1a}
#ui .box.th-news button.go{font-family:Georgia,serif;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
#ui .box.th-news .popam{border:1px solid #1a1a1a;border-left:6px solid #1a1a1a}#ui .box.th-news .popam b{font:700 15px 'Playfair Display',Georgia,serif}
/* night */
#ui .box.th-night{width:min(460px,92vw);--bg:#0e1638;--ink:#e8ecff;--mu:#a8b0d8;--ac:#f6e7a8;--aci:#0e1638;--bt:#1e2a5a;--bti:#e8ecff;
 background:linear-gradient(#060a20,#1a2458 80%,#2a2a5a)!important;position:relative;overflow:hidden}
#ui .box.th-night .thsky{position:absolute;inset:0;pointer-events:none}#ui .box.th-night .thsky b{position:absolute;width:2px;height:2px;background:#fff;box-shadow:0 0 3px #fff;animation:thtw 2s infinite alternate}
@keyframes thtw{to{opacity:.25}}
#ui .box.th-night .moon{position:absolute;right:18px;top:12px;width:34px;height:34px;border-radius:50%;box-shadow:-9px 4px 0 0 #f6e7a8}
#ui .box.th-night>*:not(.thsky){position:relative}#ui .box.th-night h2{font-family:'Playfair Display',Georgia,serif;font-size:26px}
/* key tag */
#ui .box.th-keys{--bg:#fbf6ea;--ink:#2c2418;--mu:#6c5e48;--ac:#2f6b4a;--aci:#fff;--bt:#efe6d2;position:relative;padding-top:20px}
#ui .box.th-keys h2{font-family:'Playfair Display',Georgia,serif;font-size:28px}
#ui .box.th-keys .thkey{position:absolute;right:16px;top:-14px;width:84px;height:44px;background:#e8c060;border:2px solid #2c2418;border-radius:6px 22px 22px 6px;transform:rotate(8deg);display:flex;align-items:center;justify-content:center;font:700 12px Georgia,serif;color:#2c2418}
#ui .box.th-keys .thkey i{position:absolute;right:10px;top:15px;width:10px;height:10px;border-radius:50%;background:#fbf6ea;border:2px solid #2c2418}
#ui .box.th-keys .thkey span{margin-right:16px}
/* gift */
#ui .box.th-gift{--bg:#c8283c;--ink:#fff;--mu:#ffd8de;--ac:#ffd84a;--aci:#5a0a16;--bt:#a01e30;--bti:#fff;--cd:#ffffff22;
 background:repeating-linear-gradient(45deg,#c8283c 0 16px,#b82034 16px 32px)!important;position:relative;padding-top:28px}
#ui .box.th-gift .thbow{position:absolute;left:0;right:0;top:0;height:18px;background:linear-gradient(90deg,#0000 calc(50% - 10px),#ffd84a calc(50% - 10px) calc(50% + 10px),#0000 0),linear-gradient(#ffd84a,#ffd84a) 0 50%/100% 6px no-repeat}
#ui .box.th-gift .thbow::before,#ui .box.th-gift .thbow::after{content:'';position:absolute;top:-6px;width:26px;height:18px;border:5px solid #ffd84a;border-radius:50%}#ui .box.th-gift .thbow::before{left:calc(50% - 32px)}#ui .box.th-gift .thbow::after{left:calc(50% + 2px)}
#ui .box.th-gift h2{font-family:'Playfair Display',Georgia,serif;font-size:26px;text-shadow:2px 2px 0 #5a0a16}
/* lift */
#ui .box.th-lift{width:min(520px,94vw);--bg:#b8bcc2;--ink:#1a1c20;--mu:#3a3e46;--ac:#1a1c20;--aci:#ffd84a;--bt:#d8dce2;--bti:#1a1c20;
 background:repeating-linear-gradient(90deg,#b4b8be 0 2px,#c0c4ca 2px 3px,#b8bcc2 3px 5px)!important;border-color:#55595f!important;position:relative}
#ui .box.th-lift .thlcd{display:flex;align-items:center;justify-content:center;gap:10px;background:#120a04;color:#ff8a2a;font:700 28px 'Bungee',monospace;padding:6px;margin:-4px 0 10px;border:3px solid #55595f;text-shadow:0 0 8px #ff6a00}
#ui .box.th-lift .thlcd .arr{font-size:18px}
#ui .box.th-lift button{border-radius:24px!important;background:radial-gradient(circle at 40% 35%,#f4f6f8,#c8ccd2)!important;border:2px solid #55595f!important;font-weight:700}
#ui .box.th-lift button:disabled{background:radial-gradient(circle,#ffe9a0,#ffb000)!important;opacity:1;box-shadow:0 0 10px #ffb000}
#ui .box.th-lift h2{font-family:'Bungee','Silkscreen',sans-serif;font-size:20px;letter-spacing:.04em}
/* hotel */
#ui .box.th-hotel{--bg:#fbf8f0;--ink:#2a2418;--mu:#7a6a4a;--ac:#8a6a2a;--aci:#fff;--bt:#f0e8d4;border:3px double #8a6a2a!important;font-family:Georgia,serif}
#ui .box.th-hotel .thcrest{text-align:center;color:#8a6a2a;font-size:11px;letter-spacing:.2em;text-transform:uppercase;border-bottom:1px solid #8a6a2a;padding-bottom:6px;margin-bottom:8px}
#ui .box.th-hotel .thcrest i{display:block;width:26px;height:26px;margin:0 auto 4px;border:2px solid #8a6a2a;transform:rotate(45deg)}
#ui .box.th-hotel h2{font:700 26px 'Playfair Display',Georgia,serif;text-align:center}
/* ticket */
#ui .box.th-ticket{--bg:#fff3d6;--ink:#2a0f2a;--mu:#7a4a6a;--ac:#e8343c;--aci:#fff;--bt:#ffe6b0;--cd:#ffffff80;--ln:#2a0f2a40;position:relative;padding-right:74px!important;
 background:radial-gradient(circle at 100% 50%,#0000 10px,#fff3d6 11px) right/58px 100% no-repeat,linear-gradient(#fff3d6,#fff3d6)!important;
 border-style:solid;border-image:none}
#ui .box.th-ticket h2{font:400 24px 'Bungee','Silkscreen',sans-serif;color:#e8343c}
#ui .box.th-ticket .thstub{position:absolute;right:0;top:0;bottom:0;width:56px;border-left:3px dashed #2a0f2a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#e8343c;color:#fff}
#ui .box.th-ticket .thstub span,#ui .box.th-ticket .thstub b{writing-mode:vertical-rl;font:400 12px 'Bungee',sans-serif;letter-spacing:.12em}
/* festival wristband */
#ui .box.th-fest{--bg:#1a0c2a;--ink:#fbeaff;--mu:#c8a8e0;--ac:#ff6ad5;--aci:#1a0c2a;--bt:#2e1648;--bti:#fbeaff;--cd:#ffffff10;--ln:#ff6ad540;
 background:linear-gradient(160deg,#2a0c3a,#140a24 60%,#0a1a2a)!important}
#ui .box.th-fest .thband{display:flex;justify-content:space-around;margin:-16px -18px 12px;padding:6px;background:repeating-linear-gradient(90deg,#ff6ad5 0 30px,#ffd23d 30px 60px,#3ad0ff 60px 90px);color:#1a0c2a;font:400 12px 'Bungee',sans-serif;letter-spacing:.1em;text-transform:uppercase}
#ui .box.th-fest h2{font:400 22px 'Bungee',sans-serif;color:#ffd23d;text-shadow:0 0 10px #ff6ad5}
/* paper map */
#ui .box.th-atlas{--bg:#efe4c8;--ink:#2e2614;--mu:#6a5a3a;--ac:#2e5a3a;--aci:#efe4c8;--bt:#e2d4b0;--bti:#2e2614;
 background:linear-gradient(90deg,#0000 0 33%,#0000000c 33% 33.4%,#0000 0 66%,#0000000c 66% 66.4%,#0000 0),#efe4c8!important}
#ui .box.th-atlas h2{font:700 24px 'Playfair Display',Georgia,serif}
#ui .box.th-atlas canvas{border:3px solid #2e2614!important;border-radius:0!important;box-shadow:3px 3px 0 #0004}
#ui .box.th-atlas #bmz{background:#efe4c8!important;color:#2e2614}
#ui .box.th-atlas .popl{background:#e2d4b0!important;border-color:#2e2614!important;color:#2e2614}#ui .box.th-atlas .popr{border-color:#2e261430!important}#ui .box.th-atlas .popr small{color:#6a5a3a!important}#ui .box.th-atlas .popr em{color:#a8341c!important}
/* departures board */
#ui .box.th-depart{--bg:#121418;--ink:#f2f2f2;--mu:#9aa0aa;--ac:#ffc21a;--aci:#121418;--bt:#23262c;--bti:#f2f2f2}
#ui .box.th-depart .thdep{display:flex;justify-content:space-between;margin:-16px -18px 12px;padding:8px 18px;background:#000;color:#ffc21a;font:400 16px 'Bungee',monospace;letter-spacing:.14em;text-transform:uppercase;border-bottom:3px solid #ffc21a}
#ui .box.th-depart h2{font:400 20px 'Bungee',sans-serif;color:#ffc21a}#ui .box.th-depart b{color:#ffc21a}
`;document.head.appendChild(st);
try{scan()}catch(e){}
})();
