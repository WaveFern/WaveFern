#!/usr/bin/env node
/* Version helper. One command does what CLAUDE.md used to ask by hand, and it re-runs safely after a merge.
   Usage (from the repo root):
     node tools/bump.js patch "What changed"   next patch: v55.52.0 -> v55.52.1 (fixes, small tweaks, dev-only work)
     node tools/bump.js drop  "Headline"       release day: v55.52.1 -> v56.0.0 (only for the weekly drop)
     node tools/bump.js check                  verify version.js, the history top entry and index.html ?v= tags agree
     node tools/bump.js trial [branch]         dry-run merge of origin/main into the branch; lists conflicting files, changes nothing
     node tools/bump.js renumber               inside a conflicted `git merge origin/main`: take main's version lines, re-apply this branch's
                                               own entry on top (only when version.js / index.html conflict on version lines alone)
   Tags: every changed script or stylesheet that index.html loads with ?v= gets ?v=<new version> (changed = differs from origin/main). */
const fs=require('fs'),cp=require('child_process');
const sh=c=>cp.execSync(c,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const tryS=c=>{try{return sh(c)}catch(e){return null}};
const VJ='version.js',IX='index.html';
const verOf=t=>(t.match(/GAME_VERSION='v(\d+)\.(\d+)\.(\d+)'/)||[]).slice(1).map(Number);
const fmt=v=>v.join('.');
function shown(vj){const ids=[...vj.matchAll(/^ \{v:'([^']+)'/gm)].map(x=>x[1]),r=ids.indexOf((vj.match(/FW_RESET_BUILD\s*=\s*'([^']+)'/)||[])[1]);return r<0?'?':'2.'+r}
function next(cur,kind){return kind=='drop'?[cur[0]+1,0,0]:[cur[0],cur[1],cur[2]+1]}
function changedFiles(){const a=tryS('git diff --name-only origin/main...HEAD')||'',b=tryS('git diff --name-only HEAD')||'',c=tryS('git ls-files -o --exclude-standard')||'';
 return new Set((a+b+c).split('\n').filter(Boolean))}
function apply(kind,note,src){
 let vj=src!=null?src:fs.readFileSync(VJ,'utf8');const cur=verOf(vj);if(cur.length!=3)throw new Error('GAME_VERSION not found in version.js');
 const nv=next(cur,kind),s=fmt(nv);
 vj=vj.replace(/GAME_VERSION='v[\d.]+'/,"GAME_VERSION='v"+s+"'");
 if(!/const VERSION_HISTORY=\[\n/.test(vj))throw new Error('VERSION_HISTORY header not found');
 vj=vj.replace(/const VERSION_HISTORY=\[\n/,m=>m+" {v:'v"+s+"',n:'"+note.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'},\n");
 fs.writeFileSync(VJ,vj);
 let ix=fs.readFileSync(IX,'utf8'),n=0;const ch=changedFiles();ch.add(VJ);
 ix=ix.replace(/(<(?:script|link)[^>]*?\s(?:src|href)=")([^"?]+)\?v=([^"]+)(")/g,(m,a,f,v,z)=>{if(!ch.has(f))return m;n++;return a+f+'?v='+s+z});
 fs.writeFileSync(IX,ix);
 console.log('v'+s+' written to version.js, '+n+' ?v= tag(s) in index.html set to '+s+'\nPlayers see v'+shown(vj)+' (the build id is internal; use this number when talking to James and in PR titles)'+(kind=='drop'?'\nRelease day: also add the top entry to news-data.js (WF_NEWS) and bump its ?v=.':''));
}
function check(){
 const vj=fs.readFileSync(VJ,'utf8'),ix=fs.readFileSync(IX,'utf8'),cur=fmt(verOf(vj));let bad=0;
 const top=(vj.match(/const VERSION_HISTORY=\[\n\s*\{v:'v([\d.]+)'/)||[])[1];
 if(top!=cur){console.log('FAIL history top is v'+top+' but GAME_VERSION is v'+cur);bad++}
 const tag=(ix.match(/version\.js\?v=([\d.]+)/)||[])[1];
 if(tag!=cur){console.log('FAIL index.html loads version.js?v='+tag+' but GAME_VERSION is v'+cur);bad++}
 const base=tryS('git show origin/main:index.html');
 if(base){const old={};for(const m of base.matchAll(/(?:src|href)="([^"?]+)\?v=([^"]+)"/g))old[m[1]]=m[2];
  const ch=changedFiles();
  for(const m of ix.matchAll(/(?:src|href)="([^"?]+)\?v=([^"]+)"/g))if(ch.has(m[1])&&old[m[1]]===m[2]){console.log('FAIL '+m[1]+' changed but its ?v='+m[2]+' was not bumped (browsers would keep the cached copy)');bad++}}
 const mv=tryS('git show origin/main:version.js');if(mv){const a=verOf(mv),b=verOf(vj);
  if(a.join()!==b.join()&&(b[0]<a[0]||(b[0]==a[0]&&(b[1]<a[1]||(b[1]==a[1]&&b[2]<=a[2])))))console.log('WARN branch version v'+cur+' is not newer than main v'+fmt(a)+': run renumber / bump again')}
 console.log(bad?bad+' problem(s)':'version check OK (v'+cur+')');
 if(!bad&&new Date().getUTCDay()!==4)console.log('NOTE: today is not Thursday (release day). A big feature (not a bug fix) must not merge to main now without asking James "really merge this now?" first.');
 process.exit(bad?1:0)}
function trial(branch){
 branch=branch||'HEAD';const r=tryS('git merge-tree --write-tree --name-only origin/main '+branch);
 if(r!==null){console.log('Clean: origin/main merges into '+branch+' with no conflicts.');return}
 let out='';try{sh('git merge-tree --write-tree --name-only origin/main '+branch)}catch(e){out=String(e.stdout||'')}
 const files=out.split('\n').slice(1).filter(l=>l&&!/^(Auto-merging|CONFLICT)/.test(l)&&!/^\s*$/.test(l));
 console.log('CONFLICTS merging origin/main into '+branch+':\n'+[...new Set(files)].map(f=>'  '+f).join('\n'));
 console.log(files.every(f=>f==VJ||f==IX||f=='docs/progress.md')?'Only version lines / notes: `node tools/bump.js renumber` fixes these.':'Real code overlaps: resolve by hand.');process.exit(1)}
function renumber(){
 const un=(tryS('git diff --name-only --diff-filter=U')||'').split('\n').filter(Boolean);
 const stage=(n,f)=>tryS('git show :'+n+':'+f);
 if(!un.length){console.log('No conflicted files. Nothing to renumber (run `check`).');return}
 const other=un.filter(f=>f!=VJ&&f!=IX&&f!='docs/progress.md');
 if(other.length){console.log('Other files conflict, resolve these by hand first:\n  '+other.join('\n  '));process.exit(1)}
 const strip=t=>t.replace(/\?v=[\d.a-z]+/g,'?v=');
 if(un.includes(IX)){const base=stage(1,IX),ours=stage(2,IX);
  if(base==null||ours==null||strip(base)!==strip(ours)){console.log('index.html has your own structural change (not just ?v= numbers): merge it by hand, then run `node tools/bump.js patch ...`.');process.exit(1)}
  fs.writeFileSync(IX,stage(3,IX));tryS('git add '+IX)}
 let note='';
 if(un.includes(VJ)){const ours=stage(2,VJ),base=stage(1,VJ);
  const ent=t=>[...t.matchAll(/^ \{v:'(v[\d.]+)',n:'((?:[^'\\]|\\.)*)'\},?$/gm)].map(m=>m[1]+'\u0001'+m[2]);
  const mine=ent(ours).filter(e=>!ent(base||'').includes(e));
  if(mine.length!=1){console.log('Expected exactly one history entry of yours, found '+mine.length+'. Resolve version.js by hand.');process.exit(1)}
  note=mine[0].split('\u0001')[1].replace(/\\'/g,"'").replace(/\\\\/g,'\\');
  fs.writeFileSync(VJ,stage(3,VJ));
  apply(/^v\d+\.0\.0$/.test(mine[0].split('\u0001')[0])?'drop':'patch',note);
  tryS('git add '+VJ+' '+IX)}
 console.log('Done. Review `git diff --cached`, run `node tools/bump.js check`, then `git commit`.')}
const [,,cmd,...rest]=process.argv;
if(cmd=='patch'||cmd=='drop'){if(!rest[0]){console.log('Give a one line note: node tools/bump.js '+cmd+' "what changed"');process.exit(1)}apply(cmd,rest.join(' '))}
else if(cmd=='check')check();else if(cmd=='trial')trial(rest[0]);else if(cmd=='renumber')renumber();
else{console.log(fs.readFileSync(__filename,'utf8').split('*/')[0].replace(/^\/\*\s*/,''));process.exit(cmd?1:0)}
