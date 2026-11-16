#!/usr/bin/env node
/* Odds check for v55.9.0 rivals/events/viral (244-rivals-events.js). Boots the page, then runs N careers of D days through the REAL
   daily code (FW_RIVALS.daily): a daily poster whose listeners grow along a curve. Prints how many careers went viral by day 100/250/400/600,
   how many had 2+, the average event spacing and rank spread.   node tools/viral-sim.js http://127.0.0.1:8099/index.html [careers] [days]
   THREE_JS=/path/to/three.min.js serves the 3D library when the CDN is blocked. */
const fs=require('fs');let pw;for(const p of ['playwright','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
if(!pw){console.error('Playwright missing');process.exit(2)}
const URL=process.argv[2]||'http://127.0.0.1:8099/index.html',N=+process.argv[3]||2000,D=+process.argv[4]||600;
(async()=>{const b=await pw.chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}),p=await b.newPage();
 if(process.env.THREE_JS)await p.route(/three(\.js\/r128|@0\.128\.0)\/.*three\.min\.js/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.THREE_JS,'utf8')}));
 p.on('pageerror',e=>console.log('pageerror',e.message));await p.goto(URL);await p.waitForTimeout(12000);
 const out=await p.evaluate(([N,D])=>{const keep=JSON.stringify(S),R=FW_RIVALS,res={d100:0,d250:0,d400:0,d600:0,two:0,evs:0,days:0,never:0,rk:[0,0,0,0,0,0,0,0,0]},cards=document.createElement('div');
  const gc=window.glCard;window.glCard=()=>{};const snd0=window.snd;window.snd=()=>{};
  for(let c=0;c<N;c++){Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,JSON.parse(keep));S.artist='Sim';S.songs=[{id:1}];S.apps={ig:1};S.igPosts=[];S.hist=[{d:1,st:1e4,e:100}];S.msgs=[];S.nid=10;S.brands=null;
   const g=0.9+Math.random()*0.25; /* growth speed varies per career */
   let first=null,v=0;
   for(let d=2;d<=D;d++){S.day=d;S.lastPost=d-1;S.listeners=Math.round(2000*Math.pow(1+0.022*g,Math.min(d,380))); /* ~e8 by day 380 at g=1 */
    S.hist.push({d,st:S.listeners*3,e:S.listeners*.05});if(S.hist.length>10)S.hist.shift();R.daily();
    const n=S.rvl.vr.n;if(n>v){v=n;if(first==null)first=d}
    if(d==100&&v)res.d100++;if(d==250&&v)res.d250++;if(d==400&&v)res.d400++;if(d==D&&v)res.d600++;if(d==D&&v>1)res.two++}
   if(!v)res.never++;res.rk[S.rvl.rank]++}
  window.glCard=gc;window.snd=snd0;res.pct=k=>Math.round(res[k]/N*1000)/10;return{N,D,by100:res.d100/N,by250:res.d250/N,by400:res.d400/N,byEnd:res.d600/N,twoPlus:res.two/N,never:res.never/N,rank:res.rk}},[N,D]);
 console.log(JSON.stringify(out,null,1));await b.close()})();
