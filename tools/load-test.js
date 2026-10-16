#!/usr/bin/env node
/* Headless load test (v41.1.0): boots the game in every installed Playwright browser, starts a new career,
   walks a few steps, opens each phone app and saves, then prints any page errors.
   Serve the repo first, e.g.  npx http-server -p 8080 -c-1 .   then  node tools/load-test.js [url]
   THREE_JS=/path/to/three.min.js serves three.js r128 locally when the CDN is blocked.
   BREAK=97-weather.js replaces that file with one that throws, to check one broken file doesn't stop the game. */
const fs=require('fs');
let pw;for(const p of ['playwright','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
if(!pw){console.error('Playwright is not installed (npm i playwright).');process.exit(2)}
const URL=process.argv[2]||'http://127.0.0.1:8080/index.html';
const click=re=>`(()=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&${re}.test(b.textContent));if(b[0])b[0].click();return !!b[0]})()`;
const steps=[click('/^Play$/'),click('/New career/'),click('/Confirm/'),click('/^Skip tutorial$/'),
 `(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'w',code:'KeyW'}));return mode})()`,
 `(()=>{dispatchEvent(new KeyboardEvent('keyup',{key:'w',code:'KeyW'}));return mode})()`,
 `(()=>{openPhone();const r=[];for(const a of ['msg','ig','pho','home','fest','shop','spot','food'])try{phApp(a)}catch(e){r.push(a+': '+e.message)}closePhone();return r})()`,
 `(()=>{autoSave();return Object.keys(localStorage).filter(k=>/^fw_save/.test(k))})()`];
(async()=>{let fails=0;
 for(const name of ['chromium','firefox','webkit']){
  let b;try{b=await pw[name].launch({args:name=='chromium'?['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']:[]})}
  catch(e){console.log(name+': not installed, skipped');continue}
  const p=await b.newPage({viewport:{width:1280,height:800}}),errs=[];
  if(process.env.THREE_JS)await p.route(/three(\.js\/r128|@0\.128\.0)\/.*three\.min\.js/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.THREE_JS,'utf8')}));
  if(process.env.BREAK)await p.route('**/'+process.env.BREAK,r=>r.fulfill({contentType:'application/javascript',body:'throw new Error("BREAK test")'}));
  p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()=='error'&&!/Failed to load resource|GL Driver/.test(m.text()))errs.push(m.text())});
  await p.goto(URL);await p.waitForTimeout(12000);
  const st=await p.evaluate(()=>({stuck:!!document.getElementById('load'),fatal:!!document.getElementById('fatal'),mode:typeof mode!='undefined'?mode:null}));
  console.log(name+': boot '+JSON.stringify(st));
  if(!st.stuck&&!st.fatal)for(const s of steps){try{await p.evaluate(s)}catch(e){errs.push('step: '+e.message.split('\n')[0])}await p.waitForTimeout(2500)}
  const uniq=[...new Set(errs)];uniq.forEach(e=>console.log('  '+e.slice(0,300)));
  if(st.stuck||st.fatal||uniq.length)fails++;
  await b.close()}
 process.exit(fails?1:0)})();
