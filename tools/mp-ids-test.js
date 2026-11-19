/* Multiplayer id sanitising test (v55.28.2): `node tools/mp-ids-test.js`. Pulls cln/idOk/idc out of 161-multiplayer.js (current and the previous commit) and replays
   the prototype-pollution and onclick-breakout payloads. The NEW block must show 'no' on every attack line and 'YES' on the three normal-input lines. */
const fs=require('fs'),cp=require('child_process'),vm=require('vm');
function load(src){
 // pull the helper block out of 161-multiplayer.js (cln, plus idOk/idc when present)
 const m=src.match(/(?:const idOk=[^\n]*\n(?:const idc=[^\n]*\n)?)?function cln\(v,dp\)\{[\s\S]*?return null\}\n/);
 const ctx={};vm.createContext(ctx);vm.runInContext(m[0]+';this.cln=cln;this.idOk=typeof idOk!="undefined"?idOk:null;this.idc=typeof idc!="undefined"?idc:null;',ctx);return ctx}
const oldSrc=cp.execSync('git show HEAD:161-multiplayer.js',{encoding:'utf8',maxBuffer:1e8}),newSrc=fs.readFileSync('161-multiplayer.js','utf8');
for(const [label,src] of [['OLD (v55.28.0)',oldSrc],['NEW (v55.28.2)',newSrc]]){
 const c=load(src);let r=[];
 // 1. prototype pollution: member id "__proto__" in a roster / band-song id "__proto__"
 const MB={};const msg=c.cln(JSON.parse('{"t":"ros","mem":[{"id":"__proto__","nm":"x","polluted":"yes"}]}'));
 const mem=(msg.mem).filter(m=>m&&(c.idOk?c.idOk(m.id):true));
 mem.forEach(m=>{MB[m.id]=Object.assign(MB[m.id]||{},m)});
 r.push(['roster id "__proto__" pollutes Object.prototype',({}).polluted==='yes']);
 delete Object.prototype.polluted;delete Object.prototype.nm;
 const BQ={};const d=c.cln({t:'dn',bl:'__proto__',q:77});if(c.idc)d.bl=c.idc(d.bl,60);(BQ[d.bl]=BQ[d.bl]||{})['victimid']=d.q;
 r.push(['band-song id "__proto__" pollutes Object.prototype',({}).victimid===77]);delete Object.prototype.victimid;
 // 2. onclick breakout through band-song id
 let bl="x');window.PWNED=1;('";let d2=c.cln({t:'go',bl});if(c.idc)d2.bl=c.idc(d2.bl,60);
 const html=`<button onclick="mpNudge('abc','${d2.bl}')">`;
 r.push(['band-song id can break out of onclick quotes',/'\);window/.test(html)]);
 // 3. peer id check
 r.push(['peer id "__proto__" accepted by host',c.idOk?c.idOk('__proto__'):/^[A-Za-z0-9_-]{1,128}$/.test('__proto__')]);
 r.push(['normal ids still accepted (abc-DEF_12, fb-uid)',c.idOk?c.idOk('abc-DEF_12')&&c.idOk('fb-AbC123'):true]);
 r.push(['normal band id kept (ABCDE-lx2k9a)',(c.idc?c.idc('ABCDE-lx2k9a',60):'ABCDE-lx2k9a')==='ABCDE-lx2k9a']);
 r.push(['chat text with apostrophe kept',c.cln("it's fine")==="it's fine"]);
 console.log('\n'+label);r.forEach(([n,v])=>console.log(' ',v?'YES':'no ',n));
}
