#!/usr/bin/env node
/* Graphics preset benchmark (v55.11.0): boots a new career in headless Chromium (software GL, so fill rate and draw calls dominate like on weak hardware),
   switches Settings > Graphics preset at runtime, and prints fps, draw calls, triangles and visible people/cars per preset.
   Also reloads once to confirm the preset persists (fw_gfx in localStorage).
   Serve the repo first (python3 -m http.server 8099), then: THREE_JS=<three@0.128.0 build/three.min.js> node tools/gfx-bench.js [url] [seconds] */
const fs=require('fs');
let pw;for(const p of ['playwright','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
if(!pw){console.error('Playwright is not installed.');process.exit(2)}
const URL=process.argv[2]||'http://127.0.0.1:8099/index.html',SECS=+process.argv[3]||6;
const click=re=>`(()=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&${re}.test(b.textContent));if(b[0])b[0].click();return !!b[0]})()`;
const PRESETS=['best','high','med','low','bat'];
(async()=>{
 const b=await pw.chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-frame-rate-limit','--disable-gpu-vsync']});
 const p=await b.newPage({viewport:{width:1280,height:720}});
 if(process.env.THREE_JS)await p.route(/three(\.js\/r128|@0\.128\.0)\/.*three\.min\.js/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.THREE_JS,'utf8')}));
 p.on('pageerror',e=>console.log('pageerror',e.message));
 await p.goto(URL);await p.waitForTimeout(12000);
 for(const s of [click('/^Single player$/'),click('/New career/'),click('/Confirm/'),click('/^Skip tutorial$/')]){await p.evaluate(s);await p.waitForTimeout(2500)}
 await p.waitForTimeout(3000);
 const meas=()=>p.evaluate(secs=>new Promise(res=>{let n=0,t0=0,calls=0,tris=0,k=0;const fr0=renderer.info.render.frame;const f=t=>{if(!t0)t0=t;n++;const i=renderer.info.render;calls+=i.calls;tris+=i.triangles;k++;if(t-t0<secs*1000)requestAnimationFrame(f);else{
  const vis=a=>a.filter(x=>x.m&&x.m.visible).length;
  res({fps:+((renderer.info.render.frame-fr0)*1000/(t-t0)).toFixed(1),calls:Math.round(calls/k),tris:Math.round(tris/k),npc:vis(NPC),traf:vis(TRAF),pxl:gfxPX,cv:renderer.domElement.width+'x'+renderer.domElement.height,shadow:renderer.shadowMap.enabled?1:0,mem:renderer.info.memory.geometries})}};requestAnimationFrame(f)}),SECS);
 const rows=[];
 for(const k of PRESETS){await p.evaluate(k=>gfxSet('p',k),k);await p.waitForTimeout(2500);const m=await meas();
  /* JS time spent inside renderer.render per frame (draw call submit + shadow pass): the CPU side of the 3D cost, independent of the headless page compositor */
  const rm=await p.evaluate(()=>new Promise(res=>{const r0=renderer.render;let t=0,n=0;renderer.render=function(a,c){const s=performance.now();const x=r0.call(this,a,c);t+=performance.now()-s;n++;return x};setTimeout(()=>{renderer.render=r0;res(+(t/Math.max(1,n)).toFixed(1))},3000)}));
  rows.push({preset:k,fps:m.fps,renderMs:rm,calls:m.calls,tris:m.tris,npc:m.npc,traf:m.traf,px:m.pxl,canvas:m.cv,shadow:m.shadow});}
 console.table(rows);
 const gp=await p.evaluate(()=>gfxSet('p','low')||GFX.p);await p.waitForTimeout(500);
 await p.reload();await p.waitForTimeout(12000);
 console.log('after reload: preset='+await p.evaluate(()=>GFX.p+' px='+gfxPX+' fw_gfx='+localStorage.getItem('fw_gfx')));
 await b.close()})();
