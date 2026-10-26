#!/usr/bin/env node
/* Wiki data snapshot (v47.3.0): boots the game headless and copies its own tables (gear, artists, cars, homes, labels,
   festival stages, destinations, fame levels and more) into wiki/data.js, so the wiki's tables always match the game.
   Run from the repo root:  node tools/wiki-data.js
   It serves the repo itself on a free port. THREE_JS=/path/to/three.min.js serves three.js r128 locally when the CDN is
   blocked; CHROME=/path/to/chrome uses that browser instead of Playwright's own. The deploy workflow runs it before
   upload; if it fails there, the committed wiki/data.js is published as it is. */
const fs=require('fs'),path=require('path'),http=require('http'),vm=require('vm');
let pw;for(const p of ['playwright','playwright-core','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
if(!pw){console.error('Playwright is not installed (npm i playwright-core).');process.exit(2)}
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'wiki','data.js');
const MIME={'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.glb':'model/gltf-binary','.jpg':'image/jpeg','.webp':'image/webp','.ogg':'audio/ogg','.wav':'audio/wav'};

/* constants that live inside a file's own scope are not reachable from the page, so they are read from the source:
   the literal after "const NAME=" is cut out bracket by bracket and evaluated on its own */
function lit(file,name){const src=fs.readFileSync(path.join(ROOT,file),'utf8'),m=new RegExp('\\bconst '+name.replace('$','\\$')+'\\s*=').exec(src);
 if(!m)throw new Error(name+' not found in '+file);let i=m.index+m[0].length;while(/\s/.test(src[i]))i++;
 const st=i;let d=0,q=null;for(;i<src.length;i++){const c=src[i];
  if(q){if(c=='\\'){i++;continue}if(c==q)q=null;continue}
  if(c=='"'||c=="'"||c=='`'){q=c;continue}
  if('[{('.includes(c))d++;else if(']})'.includes(c)){d--;if(!d){i++;break}}}
 return vm.runInNewContext('('+src.slice(st,i)+')')}

function serve(){return new Promise(res=>{const s=http.createServer((rq,rs)=>{let p=decodeURIComponent(rq.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(ROOT,path.normalize(p));if(!f.startsWith(ROOT)){rs.writeHead(403);return rs.end()}
 fs.readFile(f,(e,b)=>{if(e){rs.writeHead(404);return rs.end()}rs.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});rs.end(b)})});
 s.listen(0,'127.0.0.1',()=>res(s))})}

/* runs inside the game page */
function collect(){
 const tryv=f=>{try{return f()}catch(e){return null}};
 const gear=Object.keys(GEAR).map(k=>{const g=GEAR[k];return{k,n:g.n,d:g.d,lv:g.lv,c:g.c,q:(typeof GQ!='undefined'&&GQ[k])||0,s:(typeof GSB!='undefined'&&GSB[k])||0,fl:g.fl||null}});
 /* real-artist stand-ins are left out of the wiki (only the game's own made-up artists, plus Panic Man Dan) */
 const art=ART.filter(a=>!a[8]||a[0]=='Panic Man Dan').map(a=>({n:a[0],g:a[1],l:a[2],fee:a[3]})),artN=ART.length;
 const fl=[];for(let n=1;n<=351;n++)fl.push(fameStart(n));
 return{
  genres:GEN.slice(),styles:Beats.styles,drums:{s808:Beats.drums.s808,hats:Beats.drums.hats},
  fam:GEN.map(g=>[g,tryv(()=>GFOCUS.famName(g))]),
  tune:TUNE,pace:PACE,perf:PERF,gear,gcat:null,mentors:MEN.map(m=>[m[0],'',m[2]]),
  fame:{starts:fl,ft:FT,ftl:FTL()},
  artists:art,artistCount:artN,dmStar:DM_STAR,dmLock:DM_LOCK,
  cars:CARS,props:PROPS,late:LATE,pets:PETS,jewels:JEW,apps:APPD,
  furniture:Object.keys(F).filter(k=>!/_\d+$/.test(k)).map(k=>({k,n:F[k].n,p:F[k].p,az:(AZ[k]||[])[7]||''})),
  furnitureVariants:Object.keys(F).filter(k=>/_\d+$/.test(k)).length,
  food:FOOD.map(f=>({n:f[0],p:f[1],e:f[2],d:f[3],cat:f[9]})),
  clothes:GAR.map(g=>({slot:g.slot,n:g.n,p:g.p})),colours:CPAL.length,
  hair:BARB_HAIR,paints:PAINTS,
  phones:Object.keys(GPH).map(k=>({m:+k,p:GPH[k][0],buzz:GP_BUZZ[k],post:GP_BON[k],perks:GPF[k]})),
  promos:PROMO_T,labels:LABELS,halo:HALO,
  stages:FSTG.map(s=>({n:s.name,req:s.req,mult:s.mult,base:s.base,cap:s.cap})),slots:FSLOT,
  fests:FFOOD.map(f=>({n:f[1],kind:f[6],menu:f[7]})),fmg:FMG,
  dest:WT_DEST.map(d=>({id:d.id,city:d.city,country:d.country,cont:d.cont,tz:d.tz,lang:d.lang,km:d.km,hrs:d.hrs,fare:d.fare,venue:d.venue,club:d.club})),
  weather:Object.keys(WTHR.kinds).map(k=>WTHR.kinds[k].n),
  awards:{need:AW.need,cool:AW.cool,pool:AW.pool.length,cats:AW.cats},
  pois:POIS.map(p=>String(p[2]).replace(/ ·.*| ✈/,"")),rivals:RVN,tutorial:TUT.map(t=>({c:t.c,n:t.n,o:t.o})),
  version:GAME_VERSION}}

(async()=>{const srv=await serve(),url='http://127.0.0.1:'+srv.address().port+'/index.html';
 const opt={args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};if(process.env.CHROME)opt.executablePath=process.env.CHROME;
 const b=await pw.chromium.launch(opt),p=await b.newPage(),errs=[];
 if(process.env.THREE_JS)await p.route(/three(\.js\/r128|@0\.128\.0)\/.*three\.min\.js/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.THREE_JS,'utf8')}));
 await p.route(/googleapis|gstatic|googletagmanager|firebase|peerjs|unpkg\.com\/peerjs/,r=>r.abort());
 p.on('pageerror',e=>errs.push(e.message));
 await p.goto(url);await p.waitForFunction(()=>typeof mode!='undefined'&&mode=='title',null,{timeout:60000});
 const d=await p.evaluate(collect);await b.close();srv.close();
 /* scoped constants, read from source */
 const G=lit('52-gear-shop-plus.js','GCAT');d.gcat=G;
 d.radio=lit('16-big-world-fame-chat-instagrime-v2.js','RS').map(r=>({n:r[0],p:r[1],interest:r[2],fol:r[3]}));
 d.prod=lit('151-tour-shows.js','PROD');
 d.streetFood=lit('150-tour-cities.js','DFOOD');
 d.instruments=lit('161-multiplayer.js','INS');d.emotes=lit('161-multiplayer.js','EMO').map(e=>({n:e.n,e:e.e}));
 const out='/* Generated by tools/wiki-data.js from the game itself. Do not edit by hand: run  node tools/wiki-data.js  */\nwindow.WIKI_DATA='+JSON.stringify(d)+';\n';
 fs.writeFileSync(OUT,out);console.log('wrote '+path.relative(ROOT,OUT)+' ('+(out.length/1024).toFixed(1)+' KB) for '+d.version+(errs.length?'; page errors: '+errs.slice(0,3).join(' | '):''))
})().catch(e=>{console.error(e);process.exit(1)});
