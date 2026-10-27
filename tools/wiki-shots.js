#!/usr/bin/env node
/* Wiki screenshots: plays a fresh career in a headless browser and saves screenshots into wiki/img/ as small .webp files.
   Run from the repo root:  node tools/wiki-shots.js   (same THREE_JS and CHROME options as tools/wiki-data.js)
   It only uses a normal new career (no test mode, no admin, nobody signed in). Before each picture it checks the page text
   for the names of the game's real-artist stand-ins and skips the picture if one shows up. The captions live in
   wiki/pages3.js (FIGS), so a picture the script could not take just shows nothing. */
const fs=require('fs'),path=require('path'),http=require('http');
let pw;for(const p of ['playwright','playwright-core','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
if(!pw){console.error('Playwright is not installed (npm i playwright-core).');process.exit(2)}
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'wiki','img'),W=960,Q=.8;
const MIME={'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.glb':'model/gltf-binary','.jpg':'image/jpeg','.webp':'image/webp','.ogg':'audio/ogg','.wav':'audio/wav'};
function serve(){return new Promise(res=>{const s=http.createServer((rq,rs)=>{let p=decodeURIComponent(rq.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(ROOT,path.normalize(p));if(!f.startsWith(ROOT)){rs.writeHead(403);return rs.end()}
 fs.readFile(f,(e,b)=>{if(e){rs.writeHead(404);return rs.end()}rs.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});rs.end(b)})});
 s.listen(0,'127.0.0.1',()=>res(s))})}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{fs.mkdirSync(OUT,{recursive:true});const srv=await serve(),url='http://127.0.0.1:'+srv.address().port+'/index.html';
 const opt={args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};if(process.env.CHROME)opt.executablePath=process.env.CHROME;
 const b=await pw.chromium.launch(opt),p=await b.newPage({viewport:{width:1280,height:720}}),done=[],skipped=[];
 if(process.env.THREE_JS)await p.route(/three(\.js\/r128|@0\.128\.0)\/.*three\.min\.js/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.THREE_JS,'utf8')}));
 await p.route(/googleapis|gstatic|googletagmanager|firebase|peerjs|unpkg\.com\/peerjs/,r=>r.abort());
 await p.goto(url);await p.waitForFunction(()=>typeof mode!='undefined'&&mode=='title',null,{timeout:60000});
 const js=(f,a)=>p.evaluate(f,a),key=k=>p.keyboard.press(k);
 /* helpers inside the page */
 await js(()=>{window.WS={
  act(l){const t=INT.find(t=>t.l==l);if(t)t.a();return !!t},
  at(l){const t=INT.find(t=>t.l==l);return t?[t.x,t.z]:null},
  tp(x,z){P.x=x;P.z=z;camT.x=x;camT.z=z},
  clean(){const t=document.getElementById('toast');if(t)t.innerHTML='';['tdlg','annote','glr'].forEach(i=>{const e=document.getElementById(i);if(e)e.remove()})},
  vx:window.VIEWX,zoom(z){window.VIEWX=z?()=>z:WS.vx},
  shop(n){closeUI();if(IN)leaveShop();const a=WS.at('Enter '+n);if(!a)return false;WS.tp(a[0],a[1]);return WS.act('Enter '+n)},
  btn(re){const b=[...document.querySelectorAll('button')].find(b=>re.test(b.textContent.trim()));if(b)b.click();return !!b},
  real(){const t=document.body.innerText;return ART.filter(a=>a[8]&&a[0]!='Panic Man Dan').map(a=>a[0]).filter(n=>t.includes(n))}}});
 const shot=async(name,wait=900)=>{await sleep(wait);await js(()=>WS.clean());const bad=await js(()=>WS.real());
  if(bad.length){skipped.push(name+' (shows '+bad.join(', ')+')');return}
  const png=(await p.screenshot()).toString('base64');
  const webp=await js(async([d,w,q])=>{const i=new Image();i.src='data:image/png;base64,'+d;await i.decode();const c=document.createElement('canvas');c.width=w;c.height=Math.round(i.height*w/i.width);
   const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(i,0,0,c.width,c.height);return c.toDataURL('image/webp',q).split(',')[1]},[png,W,Q]);
  fs.writeFileSync(path.join(OUT,name+'.webp'),Buffer.from(webp,'base64'));done.push(name)};
 const step=async(name,f)=>{try{await f()}catch(e){skipped.push(name+' ('+e.message.split('\n')[0]+')');try{await js(()=>{try{closeUI()}catch(e){}})}catch(e){}}};

 await step('title',async()=>{await js(()=>WS.btn(/^OK$/));await shot('title',1500)});
 /* a new career */
 await step('creator',async()=>{await js(()=>{ttSlot(1)});await shot('creator',1500)});
 await step('bedroom',async()=>{await js(()=>{confirmChar()});await sleep(1500);await js(()=>{try{tutEnd()}catch(e){}});await shot('bedroom',1200)});
  await js(()=>{openPC();app='1';smo=0;pcR();const i=[...document.querySelectorAll('input')].find(x=>x.placeholder=='Artist name');i.value='Fern Wave';WS.btn(/^Create profile$/);closePC();closeUI()});
 /* recording: the menu and the three minigames, then the song goes up on Spotifly */
 const record=async(g,title,shots)=>{
  await js(()=>{closeUI();WS.act('Record a song')});if(shots)await shot('song-menu',700);
  await js(g=>WS.btn(new RegExp('^'+g+'$')),g);await sleep(4000);if(shots)await shot('minigame-beat',300);
  await js(()=>{rec.hits=4;mgStage(1)});await sleep(800);await key('Space');await sleep(3600);if(shots)await shot('minigame-lyrics',300);
  await js(()=>{mgStage(2)});await sleep(800);await key('Space');await sleep(3600);await p.keyboard.down('Space');await sleep(700);if(shots)await shot('minigame-mix',0);await p.keyboard.up('Space');
  await p.waitForFunction(()=>mode!='rec',null,{timeout:20000});await sleep(500);
  await js(t=>{const i=document.getElementById('tin');if(i)i.value=t;WS.btn(/Save to drafts/);const d=S.drafts.find(d=>d.title==t);if(d)upl(d.id);closeUI()},title)};
 await step('recording',()=>record('Hip-Hop','Night Bus',1));
 /* computer apps */
 for(const [a,n] of [['1','spotifly'],['msg','messages'],['gear','gearshop'],['store','app-barn'],['fest','festivalapp'],['sw','swiftwing'],['quests','quests']])
  await step(n,async()=>{await js(a=>{if(mode!='pc')openPC();app=a;smo=0;pcR()},a);await shot(n)});
 await js(()=>{closePC();closeUI()});
 /* the town */
 for(const [n,x,z] of [['street',34,16],['home-outside',8,16],['awards-outside',717,16],['airport-outside',-330,20]])
  await step(n,async()=>{await js(([x,z])=>{if(IN)leaveShop();WS.tp(x,z)},[x,z]);await shot(n,2600)});
 for(const [s,n,talk] of [['Music Store','music-store'],['Motors','motors'],['Pet Shop','pet-shop'],['Security','security'],['Barbershop','barbershop','Sal (barber)'],['Jewellery','jewellery','Mara (shopkeeper)'],['Corner shop','corner-shop','Gus (shopkeeper)']])
  await step(n,async()=>{if(!await js(s=>WS.shop(s),s))throw new Error('no door');await sleep(1500);if(talk){await js(t=>WS.act('Talk to '+t),talk);await sleep(800)}await shot(n,1000)});
 await js(()=>{closeUI();if(IN)leaveShop();WS.tp(34,16)});await sleep(1500);
 await step('gphone',async()=>{await js(()=>{S.phone=S.phone||8;delete S.noPhone});await key('g');await shot('gphone',1500);await key('g')});
 await step('map',async()=>{await js(()=>closeUI());await key('n');await shot('map',1000);await js(()=>closeUI())});
 await step('settings',async()=>{await js(()=>{closeUI();mode='play'});await key('Escape');await sleep(500);await js(()=>WS.btn(/^Settings$/));await sleep(500);
  await js(()=>{const g=document.querySelector('[data-t=gfx]');if(g)g.click()});await shot('settings',700);await js(()=>{closeUI();try{resumeGame()}catch(e){}mode='play'})});
 /* a festival day */
 await step('festival',async()=>{await js(()=>{S.day=7;festSync();WS.zoom(17);WS.tp(306,-50)});await shot('festival',3000);await js(()=>WS.zoom(0))});
 await b.close();srv.close();
 console.log('saved '+done.length+' screenshots to wiki/img: '+done.join(', '));if(skipped.length)console.log('skipped: '+skipped.join('; '))
})().catch(e=>{console.error(e);process.exit(1)});
