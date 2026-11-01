#!/usr/bin/env node
/* Mix calibration (v49.59.0): plays every instrument in every role (bass, chords, arp, lead, pad, pluck arp) and every style's drums on their own,
   measures how loud each is (the 90th percentile of 50 ms RMS, i.e. how loud it is when it plays) and prints the gain that brings it to the
   role's target level. The result is pasted into MIXT in 67-beats.js. Samples are measured separately because each one is already matched to
   the same loudness when it loads.
     python3 -m http.server 8099      then      node tools/mix-calibrate.js [http://127.0.0.1:8099/]   (about 5 minutes) */
const fs=require('fs'),path=require('path');let pw;for(const p of['playwright','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
const base=process.argv[2]||'http://127.0.0.1:8099/',src=fs.readFileSync(path.join(__dirname,'..','67-beats.js'),'utf8');
const TGT={dr:.115,bs:.125,ch:.06,pd:.045,ld:.075,ar:.045,pk:.04};
(async()=>{const br=await pw.chromium.launch(),pg0=await br.newPage();await pg0.goto(base+'robots.txt');await pg0.addScriptTag({content:src});
 const jobs=await pg0.evaluate(()=>{const {STY,LDX}=Beats._dbg,J=[],seen={};
  for(const g of Object.keys(STY))STY[g].forEach((st,si)=>{
   J.push({key:'dr:'+st.n,role:'dr',g,si,def:null});
   for(const role of['bs','ch','ar','ld']){const d=st[role];if(!d)continue;const L=[].concat(d.i);if(role=='ld')L.push(...(LDX[st.n]||[]),'lead','pluck');
    for(const i of L){const k=role+':'+i;if(seen[k])continue;seen[k]=1;J.push({key:k,role,g,si,def:Object.assign({},d,{i,p:[].concat(d.p||'')[0]}),smp:0})}}});
  /* sampled: one instrument that maps to each sample family, per role */
  const S=[['bs','bass','Hip-Hop',0],['ch','epiano','R&B',1],['ld','lead','Pop',0],['ar','pluck','Pop',1]];
  for(const[role,i,g,si]of S){const st=STY[g][si],d=st[role]||(role=='ar'?{p:'0120120120120121',r:1,o:64}:null);if(d)J.push({key:role+':smp',role,g,si,def:Object.assign({},d,{i,p:[].concat(d.p||'')[0]}),smp:1})}
  J.push({key:'pd:smp',role:'pd',g:'Pop',si:0,def:{i:'pad',x:7,o:58,sec:'hk pc br in'},smp:1},{key:'pd:pad',role:'pd',g:'Pop',si:0,def:{i:'pad',x:7,o:58,sec:'hk pc br in'},smp:0},
         {key:'pk:smp',role:'pk',g:'Pop',si:0,def:{i:'pluck',p:'0.2.1.2.0.2.1.2.',r:1,o:67,x:3,sec:'hk pc'},smp:1},{key:'pk:pluck',role:'pk',g:'Pop',si:0,def:{i:'pluck',p:'0.2.1.2.0.2.1.2.',r:1,o:67,x:3,sec:'hk pc'},smp:0});
  return J});
 console.error(jobs.length+' measurements');
 const out={};let n=0;
 await Promise.all([0,1,2,3].map(async w=>{const pg=await br.newPage();await pg.goto(base+'robots.txt');await pg.addScriptTag({content:src});
  while(n<jobs.length){const j=jobs[n++];
   try{const v=await pg.evaluate(async j=>{const SR=16000,secs=20,seed=4242,over={raw:1};
     if(!j.smp)over.sp={bass:'',key:'',lead:'',pad:'',pluck:''};
     if(j.def)over[j.role]=j.def;
     const o={sampleRate:SR,form:'live',solo:j.role,samples:!!j.smp};
     const b=await Beats.render({genre:j.g,style:j.si,seed,over},secs,o),d=b.getChannelData(0).subarray(SR*3),W=SR*.05|0,r=[];
     for(let i=0;i+W<=d.length;i+=W){let s=0;for(let k=i;k<i+W;k++)s+=d[k]*d[k];r.push(Math.sqrt(s/W))}r.sort((a,b)=>a-b);return r[r.length*.9|0]},j);
    out[j.key]=v}catch(e){console.error('fail',j.key,e.message)}
   if(n%10==0)console.error(n+'/'+jobs.length)}}));
 const M={};for(const k in out){const t=TGT[k.split(':')[0]],v=out[k];if(v>1e-4)M[k]=+Math.max(.12,Math.min(6,t/v)).toFixed(3);else console.error('silent',k)}
 console.log('const MIXT='+JSON.stringify(M)+';');await br.close()})();
