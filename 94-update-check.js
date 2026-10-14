/* ---------- update notice ----------
   Every 30 seconds (and when the tab comes back into view) checks version.js on the server.
   If GAME_VERSION there differs from the running one, a small notice offers to update.
   Update saves the game (and to the cloud when signed in), refreshes the cached game files, then reloads. */
const UPD={seen:null,busy:0};
function updCheck(){if(UPD.busy||location.protocol=='file:')return;
 fetch('version.js?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{const m=t.match(/GAME_VERSION\s*=\s*'([^']+)'/);
  if(m&&m[1]!=GAME_VERSION&&m[1]!=UPD.seen)updShow(m[1])}).catch(()=>{})}
function updShow(v){UPD.seen=v;let d=document.getElementById('upd');if(!d){d=document.createElement('div');d.id='upd';document.body.appendChild(d)}
 d.style.cssText='position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:99999;display:flex;align-items:center;gap:10px;max-width:calc(100% - 24px);padding:8px 10px 8px 14px;background:var(--p);color:var(--t);border:2px solid var(--g);border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,.5);font-size:13px';
 d.innerHTML=`<span>New version <b style="color:var(--g)">${v}</b> is out</span><button id=updGo class=go style="margin:0;padding:5px 12px">Update</button><button title="Later" onclick="document.getElementById('upd').remove()" style="margin:0;padding:5px 8px;background:none;border:none;color:var(--m)">✕</button>`;
 document.getElementById('updGo').onclick=updGo}
function updGo(){if(UPD.busy)return;UPD.busy=1;const b=document.getElementById('updGo');if(b){b.textContent='Saving…';b.disabled=true}
 try{autoSave()}catch(e){}
 const wait=(p,ms)=>Promise.race([Promise.resolve(p).catch(()=>{}),new Promise(r=>setTimeout(r,ms))]);
 const cloud=typeof csPush=='function'&&typeof FBU!='undefined'&&FBU?wait(csPush(1),5000):null;
 /* pull fresh copies of the page, scripts and styles into the browser cache so the reload runs the new version */
 const files=[location.pathname,...[...document.querySelectorAll('script[src],link[rel=stylesheet][href]')].map(e=>e.src||e.href).filter(u=>u.startsWith(location.origin))];
 const fresh=wait(Promise.all(files.map(u=>fetch(u,{cache:'reload'}).catch(()=>{}))),6000);
 Promise.all([cloud,fresh]).then(()=>{if(b)b.textContent='Updating…';location.reload()})}
setTimeout(updCheck,5000);setInterval(updCheck,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updCheck()});
