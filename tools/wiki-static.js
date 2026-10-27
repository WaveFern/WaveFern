#!/usr/bin/env node
/* Static wiki pages (v49.0.0): the wiki builds its pages with JavaScript behind #/ links, which search engines and AI tools
   mostly cannot see. This opens the wiki headless, renders every page and writes a plain HTML copy of each one to
   wiki/<page-id>/index.html (no JavaScript needed to read it). It also writes sitemap.xml, llms-full.txt (every page as
   plain text) and the page list in llms.txt and in wiki/index.html.
   Run from the repo root:  node tools/wiki-static.js   (same CHROME option as tools/wiki-data.js)
   The deploy workflow runs it after tools/wiki-data.js; if it fails there, the committed copies are published. */
const fs=require('fs'),path=require('path'),http=require('http');
let pw;for(const p of ['playwright','playwright-core','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
if(!pw){console.error('Playwright is not installed (npm i playwright-core).');process.exit(2)}
const ROOT=path.resolve(__dirname,'..'),SITE='https://wavefern.com',WIKI=path.join(ROOT,'wiki');
const MIME={'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
function serve(){return new Promise(res=>{const s=http.createServer((rq,rs)=>{let p=decodeURIComponent(rq.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(ROOT,path.normalize(p));if(!f.startsWith(ROOT)){rs.writeHead(403);return rs.end()}
 fs.readFile(f,(e,b)=>{if(e){rs.writeHead(404);return rs.end()}rs.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});rs.end(b)})});
 s.listen(0,'127.0.0.1',()=>res(s))})}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=s=>s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();
const url=id=>id=='home'?'/wiki/':'/wiki/'+id+'/';

/* hash links become real page links; Source/History tabs and search stay in the interactive wiki */
function links(h){return h
 .replace(/href="#\/([a-z0-9-]+)\/(~[a-z]+)"/g,(m,i,t)=>`href="/wiki/#/${i}/${t}"`)
 .replace(/href="#\/search=([^"]*)"/g,'href="/wiki/#/search=$1"')
 .replace(/href="#\/([a-z0-9-]+)\/([^"]+)"/g,(m,i,s)=>`href="${url(i)}#${s}"`)
 .replace(/href="#\/([a-z0-9-]+)"/g,(m,i)=>`href="${url(i)}"`)
 .replace(/(src|href)="img\//g,'$1="/wiki/img/')
 .replace(/<a href="#" onclick="[^"]*">([^<]*)<\/a>/g,'$1')
 .replace(/ on[a-z]+="[^"]*"/g,'')
 .replace(/<button class="?tg"?[^>]*>[^<]*<\/button>/g,'')}

function shell(p,pages,cats,article,ver){const title=p.id=='home'?'WaveFern Wiki – WaveFern Records game guide':p.t+' – WaveFern Wiki',canon=SITE+url(p.id),
 desc=p.desc.length>300?p.desc.slice(0,297).replace(/\s+\S*$/,'')+'...':p.desc,
 side=`<div class=panel><h3>Navigation</h3><a href="/wiki/"${p.id=='home'?' class=on':''}>Main page</a><a href="/wiki/versions/">Recent changes</a><a href="/">Play the game</a>`+
  cats.map(c=>`<h3><a href="/wiki/cat-${c.id}/">${esc(c.t)}</a></h3>`+pages.filter(x=>x.cat==c.id&&!x.hide).map(x=>`<a href="${url(x.id)}"${x.id==p.id?' class=on':''}>${esc(x.t)}</a>`).join('')).join('')+'</div>',
 crumbs=[{n:'WaveFern Records',u:SITE+'/'},{n:'Wiki',u:SITE+'/wiki/'}];if(p.id!='home')crumbs.push({n:p.t,u:canon});
 const ld={'@context':'https://schema.org','@graph':[{'@type':'Article','headline':p.t,'description':desc,'url':canon,'inLanguage':'en','isPartOf':{'@type':'WebSite','name':'WaveFern Wiki','url':SITE+'/wiki/'},'about':{'@type':'VideoGame','name':'WaveFern Records','url':SITE+'/'},'image':p.img?SITE+p.img:SITE+'/og-image.png'},
  {'@type':'BreadcrumbList','itemListElement':crumbs.map((c,i)=>({'@type':'ListItem','position':i+1,'name':c.n,'item':c.u}))}]};
 return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<!-- Made by tools/wiki-static.js from the interactive wiki. Edit wiki/pages*.js, not this file. -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<meta property="og:type" content="article"><meta property="og:site_name" content="WaveFern Wiki"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canon}"><meta property="og:image" content="${SITE}${p.img||'/og-image.png'}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${SITE}${p.img||'/og-image.png'}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap">
<link rel="stylesheet" href="/wiki/wiki.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>
</head><body>
<header id="top">
 <button id="menu" aria-label="Pages" onclick="document.getElementById('side').classList.toggle('on')">☰</button>
 <a id="logo" href="/wiki/" class="px">WAVEFERN WIKI<small>The WaveFern Records guide</small></a>
 <a class="btn go play" href="/">Play</a>
</header>
<div id="wrap"><nav id="side" aria-label="Pages">${side}</nav><main id="main">${article}</main></div>
<footer>Written for WaveFern Records ${esc(ver)}. Tables are generated from the game's data. <a href="/wiki/#/${p.id}">Open this page in the interactive wiki</a></footer>
</body></html>
`}

(async()=>{const srv=await serve(),base='http://127.0.0.1:'+srv.address().port+'/wiki/index.html';
 const opt={};if(process.env.CHROME)opt.executablePath=process.env.CHROME;
 const b=await pw.chromium.launch(opt),pg=await b.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route(/googleapis|gstatic/,r=>r.abort());
 await pg.goto(base);await pg.waitForFunction(()=>typeof PAGES!='undefined'&&PAGES.length>5&&document.querySelector('#main h1')&&document.querySelector('#main h1').textContent!='Loading');
 const info=await pg.evaluate(()=>({ver:(typeof GAME_VERSION!='undefined'?GAME_VERSION:(WIKI_DATA||{}).version)||'',
  cats:CATS.map(c=>({id:c.id,t:c.t,d:c.d})),pages:PAGES.map(p=>({id:p.id,t:p.t,cat:p.cat,hide:!!p.hide,sum:p.sum||'',img:p.figs&&p.figs.length?'/wiki/img/'+p.figs[0][0]+'.webp':''}))}));
 const reserved=new Set(fs.readdirSync(WIKI).filter(f=>!fs.existsSync(path.join(WIKI,f,'index.html'))||fs.readFileSync(path.join(WIKI,f,'index.html'),'utf8').indexOf('tools/wiki-static.js')<0));
 const out=[];
 for(const p of info.pages){if(reserved.has(p.id))throw new Error('wiki page id "'+p.id+'" clashes with wiki/'+p.id);
  await pg.evaluate(id=>{location.hash='#/'+id},p.id);
  await pg.waitForFunction(id=>{const a=document.querySelector('#side a.on');return id.startsWith('cat-')||a&&a.getAttribute('href')=='#/'+id},p.id).catch(()=>{});
  const r=await pg.evaluate(()=>{const a=document.querySelector('#main article');a.querySelectorAll('nav.tabs,style').forEach(n=>n.remove());
   const html=a.outerHTML;a.querySelectorAll('nav.toc').forEach(n=>n.remove());const text=a.innerText,lead=a.querySelector('p.lead')||a.querySelector('p');return{html,text,lead:lead?lead.textContent:''}});
  p.desc=strip(p.sum&&p.sum.length>60?p.sum:(r.lead||p.sum||p.t));if(p.id=='home')p.desc='The WaveFern Records wiki: every mechanic of the free browser music career sim, from recording songs and streams to labels, festivals, the World Tour and multiplayer band rooms.';
  out.push(Object.assign(p,{html:links(r.html),text:r.text}))}
 await b.close();srv.close();
 if(errs.length)console.warn('page errors:',errs.slice(0,5));

 /* old generated folders for pages that no longer exist are removed */
 for(const f of fs.readdirSync(WIKI)){const ix=path.join(WIKI,f,'index.html');if(!reserved.has(f)&&fs.existsSync(ix)&&!out.find(p=>p.id==f)&&f!='home')fs.rmSync(path.join(WIKI,f),{recursive:true})}
 for(const p of out){if(p.id=='home')continue;fs.mkdirSync(path.join(WIKI,p.id),{recursive:true});fs.writeFileSync(path.join(WIKI,p.id,'index.html'),shell(p,out,info.cats,p.html,info.ver))}

 const listed=out.filter(p=>!p.hide);
 /* crawlable page list in the interactive wiki's noscript block */
 const wi=path.join(WIKI,'index.html'),ws=fs.readFileSync(wi,'utf8'),nav=`<!--pages--><noscript><nav style="padding:16px" aria-label="All wiki pages"><h2>All wiki pages</h2>`+
  info.cats.map(c=>`<h3><a href="/wiki/cat-${c.id}/">${esc(c.t)}</a></h3><ul>`+listed.filter(p=>p.cat==c.id).map(p=>`<li><a href="/wiki/${p.id}/">${esc(p.t)}</a>: ${esc(p.desc)}</li>`).join('')+'</ul>').join('')+`</nav></noscript><!--/pages-->`;
 fs.writeFileSync(wi,/<!--pages-->[\s\S]*<!--\/pages-->/.test(ws)?ws.replace(/<!--pages-->[\s\S]*<!--\/pages-->/,nav):ws.replace('</body>',nav+'\n</body>'));

 const day=new Date().toISOString().slice(0,10),u=(l,f,pr)=>` <url><loc>${SITE}${l}</loc><lastmod>${day}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`;
 fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  [u('/','weekly','1.0'),u('/wiki/','weekly','0.8'),u('/versions.html','weekly','0.4')].concat(out.filter(p=>p.id!='home').map(p=>u(url(p.id),'weekly',p.hide?'0.4':'0.6'))).join('\n')+'\n</urlset>\n');

 const lt=path.join(ROOT,'llms.txt'),ls=fs.readFileSync(lt,'utf8'),list=`<!-- wiki pages: made by tools/wiki-static.js -->\n## Wiki pages\n\n`+
  listed.map(p=>`- [${p.t}](${SITE}/wiki/${p.id}/): ${p.desc}`).join('\n')+'\n<!-- /wiki pages -->';
 fs.writeFileSync(lt,/<!-- wiki pages[\s\S]*<!-- \/wiki pages -->/.test(ls)?ls.replace(/<!-- wiki pages[\s\S]*<!-- \/wiki pages -->/,list):ls.trimEnd()+'\n\n'+list+'\n');

 fs.writeFileSync(path.join(ROOT,'llms-full.txt'),`# WaveFern Records: full wiki\n\n> Every page of the WaveFern Wiki (${SITE}/wiki/) as plain text, for game ${info.ver}. WaveFern Records is a free 3D open-world music career sim that runs in the browser at ${SITE}/.\n\n`+
  listed.map(p=>`---\n\nSource: ${SITE}/wiki/${p.id}/\n\n`+p.text.replace(/\n{3,}/g,'\n\n').trim()).join('\n\n')+'\n');
 console.log('wrote',out.length-1,'static wiki pages, sitemap.xml, llms.txt and llms-full.txt for',info.ver)})().catch(e=>{console.error(e);process.exit(1)});
