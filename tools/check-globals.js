#!/usr/bin/env node
/* Global-variable check for WaveFern (v41.1.0).
   The game is many classic <script> files sharing one global scope, loaded in index.html order.
   This parses every local script in that order and reports:
   - CLASH: a top-level let/const/class name declared again in a later file (or a var/function with the same
     name as an earlier let/const). Browsers throw "Identifier has already been declared" and skip the WHOLE
     later file, which is the most common way one file silently breaks the game.
   - EARLY: a global read while a file is loading (top level or an IIFE) before the file that defines it has loaded.
   - IMPLICIT: assignment to a name that is never declared anywhere (an accidental global; throws in strict code).
   - UNDEFINED: a name read that no file defines and the browser does not provide (a typo or a missing file).
   - SYNTAX: a parse error, or syntax newer than ES2020 (older iPhone/iPad Safari would skip the whole file).
   - REDEF (only with --all): a function/var defined again by a later file. This is the normal patching style,
     so it is listed only on request.
   Usage: node tools/check-globals.js [--all] [--known]    Exit code 1 if any problem other than REDEF.
   Needs acorn and eslint-scope (npm i acorn eslint-scope, or a global install). */
const fs=require('fs'),path=require('path');
function need(m){for(const p of [m,'/opt/node-tools/node_modules/'+m,path.join(process.execPath,'../../lib/node_modules',m)])try{return require(p)}catch(e){}
 console.error('Missing '+m+'. Run: npm i '+m);process.exit(2)}
const acorn=need('acorn'),escope=need('eslint-scope');
const ROOT=path.join(__dirname,'..'),ALL=process.argv.includes('--all');
const BROWSER=new Set(require('./browser-globals.json'));
/* names that exist only in some browsers or are created by external scripts (the 3D library, Firebase, Google) */
['THREE','firebase','google','gtag','dataLayer','webkitAudioContext','webkitRequestAnimationFrame','mozRequestAnimationFrame',
 'InstallTrigger','safari','opera','chrome','netscape','globalThis','undefined','NaN','Infinity','arguments'].forEach(n=>BROWSER.add(n));

/* UNDEFINED reports that were investigated (v50.0.1) and are harmless. Key is "file:name". They are not counted as problems;
   run with --known to list them. Do NOT add a new entry to silence a regression: fix it instead.
   Most are names that live inside a closure (161-multiplayer, 139-airport, 150-tour-cities, 169-popups, 176-game-feel) and are
   read from another file behind a typeof guard, try/catch or gp()/g() wrapper, so the guarded branch simply never runs
   (latent dead code, kept to preserve behaviour). The rest are local variables the scope analysis cannot see. */
const KNOWN={
 '161-multiplayer.js:Peer':'PeerJS global, injected at runtime from a CDN by lib()',
 '213-public-profile.js:MPS':'closure-local in 161-multiplayer.js; read inside gp(()=>...), so the band badge is never sent (latent)',
 '213-public-profile.js:iName':'closure-local in 161-multiplayer.js; read inside gp(()=>...) (latent)',
 'dev/dev-profile-v3.js:MPS':'closure-local in 161; inside g(()=>...) guard (latent)',
 'dev/dev-profile-v3.js:iName':'closure-local in 161; inside g(()=>...) guard (latent)',
 'dev/dev-profile-v3.js:list':'closure-local in 161; inside g(()=>...) guard (latent)',
 '214-guide-markers.js:inCity':'closure-local in 150-tour-cities.js (exposed as DCITY.inCity); inside try{}, so the "you are abroad" taxi message never shows (latent)',
 '210-economy-rebalance.js:countUp':'closure-local in 176-game-feel.js; guarded by typeof, so the code takes the no-animation branch',
 '218-parked-cars.js:D':'read right after a typeof D guard in the same && chain; D is not a global (DCITY is)',
 'dev/dev-island-v1.js:D':'same typeof-guard pattern as 218-parked-cars.js',
 'dev/dev-perf.js:toast':'toast lives in the 169-popups.js closure; inside try{}, the graphics notice is skipped (latent)',
 'dev/dev-garage-v1.js:fade':'fade is closure-local in 139-airport.js; guarded by typeof, falls back to go()',
 'dev/dev-menu-friends-v1.js:frDraw':'closure-local in 161; guarded by typeof',
 '216-friends-hub.js:needLogin':'closure-local in 161; guarded by typeof',
 '216-friends-hub.js:frStart':'closure-local in 161; inside try{}',
 '216-friends-hub.js:MPS':'closure-local in 161; guarded by typeof',
 'dev/dev-careerhome-v1.js:exitShop':'no such function exists; guarded by typeof',
 'dev/dev-parkedcars-v1.js:AP':'AP is closure-local in 139-airport.js; inside try{}'
};

const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const files=[...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m=>m[1].split("?")[0]).filter(s=>!/^https?:/.test(s));

const known=[];const lexical=new Map(),varlike=new Map(),firstDef=new Map(),issues=[],redefs=[];
const parsed=[];
files.forEach((f,i)=>{
 const src=fs.readFileSync(path.join(ROOT,f),'utf8');
 let ast;try{ast=acorn.parse(src,{ecmaVersion:2020,sourceType:'script',locations:true,ranges:true,allowHashBang:true})}
 catch(e){issues.push(['SYNTAX',f,e.loc?e.loc.line:0,e.message+' (invalid, or syntax newer than ES2020 that older Safari/iPad cannot run)']);return}
 const sm=escope.analyze(ast,{ecmaVersion:2022,sourceType:'script'});
 const g=sm.globalScope;
 parsed.push({f,i,ast,sm,g});
 for(const v of g.variables){
  const d=v.defs[0];if(!d)continue;
  const kind=d.type==='Variable'?d.parent.kind:d.type==='FunctionName'?'function':d.type==='ClassName'?'class':'other';
  const lex=kind==='let'||kind==='const'||kind==='class';const line=d.name.loc.start.line;
  if(lexical.has(v.name))issues.push(['CLASH',f,line,`${kind} ${v.name} already declared by ${lexical.get(v.name)}`]);
  else if(lex&&varlike.has(v.name))issues.push(['CLASH',f,line,`${kind} ${v.name} already declared as var/function by ${varlike.get(v.name)}`]);
  else if(!lex&&varlike.has(v.name))redefs.push(['REDEF',f,line,`${v.name} (first in ${varlike.get(v.name)})`]);
  if(lex)lexical.set(v.name,lexical.get(v.name)||f);else varlike.set(v.name,varlike.get(v.name)||f);
  if(!firstDef.has(v.name))firstDef.set(v.name,i);
 }
});
/* window.X= / globalThis.X= / self.X= also define globals */
const acornWalk=need('acorn-walk');
for(const p of parsed)acornWalk.simple(p.ast,{AssignmentExpression(n){const l=n.left;
 if(l.type==='MemberExpression'&&!l.computed&&l.object.type==='Identifier'&&/^(window|globalThis|self)$/.test(l.object.name)){
  const nm=l.property.name;if(!firstDef.has(nm)||firstDef.get(nm)>p.i)firstDef.set(nm,p.i)}}});

/* does this reference run while the file loads? (not inside a function, unless that function is an IIFE) */
function atLoad(scope){for(let s=scope;s&&s.type!=='global';s=s.upper){
 if(s.type==='function'){const b=s.block,par=b&&b.parent;if(!(par&&par.type==='CallExpression'&&par.callee===b))return false}}return true}
function parents(ast){acornWalk.full(ast,(n)=>{for(const k in n){const c=n[k];if(c&&typeof c==='object'){if(Array.isArray(c))c.forEach(x=>x&&x.type&&(x.parent=n));else if(c.type)c.parent=n}}})}
function inTypeof(id){const p=id.parent;return p&&p.type==='UnaryExpression'&&p.operator==='typeof'}
const seen=new Set();
for(const p of parsed){parents(p.ast);
 for(const r of p.g.through){const nm=r.identifier.name;if(BROWSER.has(nm))continue;
  const line=r.identifier.loc.start.line,key=p.f+':'+nm;
  if(!firstDef.has(nm)){
   if(r.isWrite()&&!r.isRead()){if(!seen.has('I'+key)){seen.add('I'+key);issues.push(['IMPLICIT',p.f,line,nm+' is assigned but never declared'])}}
   else if(!inTypeof(r.identifier)&&!seen.has('U'+key)){seen.add('U'+key);if(KNOWN[key])known.push(['KNOWN',p.f,line,nm+': '+KNOWN[key]]);else issues.push(['UNDEFINED',p.f,line,nm+' is used but nothing defines it'])}
   continue}
  const d=firstDef.get(nm);
  if(d>p.i&&r.isRead()&&atLoad(r.from)&&!inTypeof(r.identifier)&&!seen.has('E'+key)){seen.add('E'+key);issues.push(['EARLY',p.f,line,nm+' is used while loading, but is defined later by '+files[d]])}
 }
}
if(process.argv.includes('--known'))known.forEach(([k,f,l,m])=>console.log(`${k.padEnd(9)} ${f}:${l}  ${m}`));
const out=ALL?issues.concat(redefs):issues;
out.forEach(([k,f,l,m])=>console.log(`${k.padEnd(9)} ${f}:${l}  ${m}`));
console.log(`\n${files.length} scripts checked: ${issues.length} problem(s) (${known.length} known, see --known)${ALL?', '+redefs.length+' redefinition(s)':''}.`);
process.exit(issues.length?1:0);
