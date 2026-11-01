#!/usr/bin/env node
/* Mix check (v49.59.0): renders a few songs offline in headless Chromium (Playwright) with the real samples and prints how loud each layer is
   on its own (dB, relative to the drums) and how the whole mix is spread across low / low-mid / mid / high. Serve the repo first:
     python3 -m http.server 8099      then      node tools/mix-check.js [http://127.0.0.1:8099/] [seeds per genre]
   Healthy: bass about 0 to +4 dB over the drums, chords and pads -4 to 0, lead -3 to +1, arps below -6; low-mid (150-500 Hz) no louder than low (<150 Hz). */
const fs=require('fs'),path=require('path');let pw;for(const p of['playwright','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
const base=process.argv[2]||'http://127.0.0.1:8099/',per=+process.argv[3]||1,src=fs.readFileSync(path.join(__dirname,'..','67-beats.js'),'utf8');
(async()=>{const br=await pw.chromium.launch(),res=[];
 const run=async(g,seed)=>{const pg=await br.newPage();await pg.goto(base+'robots.txt');await pg.addScriptTag({content:src});
  const r=await pg.evaluate(async([g,seed])=>{const SR=16000,secs=28,rms=d=>{let s=0;for(const v of d)s+=v*v;return Math.sqrt(s/d.length)},o={sampleRate:SR,form:'live'},P=Beats.plan({genre:g,seed}),out={style:P.style,key:P.key,layers:{}};
   const full=(await Beats.render({genre:g,seed},secs,o)).getChannelData(0),from=SR*8|0,seg=full.subarray(from);out.full=rms(seg);
   const dr=rms((await Beats.render({genre:g,seed},secs,Object.assign({solo:'dr'},o))).getChannelData(0).subarray(from));out.dr=dr;
   for(const k of['bs','ch','ar','ld','pd','pk']){const b=await Beats.render({genre:g,seed},secs,Object.assign({solo:k},o)),r=rms(b.getChannelData(0).subarray(from));out.layers[k]=r}
   /* spectrum of the full mix */
   const N=2048,bands=[[20,150],[150,500],[500,2000],[2000,6000]],E=[0,0,0,0];let fr=0;
   for(let st=0;st+N<=seg.length&&fr<150;st+=Math.floor(seg.length/150)){fr++;const re=new Float64Array(N),im=new Float64Array(N);for(let i=0;i<N;i++)re[i]=seg[st+i]*(.5-.5*Math.cos(2*Math.PI*i/N));
    for(let i=1,j=0;i<N;i++){let b=N>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]]}}
    for(let l=2;l<=N;l<<=1){const a=-2*Math.PI/l;for(let i=0;i<N;i+=l)for(let k=0;k<l/2;k++){const c=Math.cos(a*k),s=Math.sin(a*k),xr=re[i+k+l/2]*c-im[i+k+l/2]*s,xi=re[i+k+l/2]*s+im[i+k+l/2]*c;re[i+k+l/2]=re[i+k]-xr;im[i+k+l/2]=im[i+k]-xi;re[i+k]+=xr;im[i+k]+=xi}}
    for(let k=1;k<N/2;k++){const f=k*SR/N,m=re[k]*re[k]+im[k]*im[k];bands.forEach((b,bi)=>{if(f>=b[0]&&f<b[1])E[bi]+=m})}}
   out.bands=E.map(e=>10*Math.log10(e/fr+1e-12));return out},[g,seed]);
  await pg.close();return r};
 const jobs=[];const genres=['Hip-Hop','Rap','Pop','Rock','R&B','Lo-fi','Country','Electronic','Latin'];
 for(const g of genres)for(let i=0;i<per;i++)jobs.push([g,(i*7919+g.length*131+5)>>>0]);
 let n=0;await Promise.all([0,1,2].map(async()=>{while(n<jobs.length){const j=jobs[n++];try{const r=await run(...j);res.push([j[0],r]);}catch(e){console.log('fail',j,e.message)}}}));
 const db=x=>(20*Math.log10(x+1e-9)).toFixed(1).padStart(6);
 console.log('genre / style'.padEnd(30),'full dBFS  drums'.padEnd(2),'  bass  chord   arp  lead   pad pluck | low  lowmid  mid  high (dB)');
 res.sort((a,b)=>a[0]<b[0]?-1:1).forEach(([g,r])=>{const L=r.layers,d=r.dr;console.log((g+' / '+r.style).padEnd(30),db(r.full),db(d),['bs','ch','ar','ld','pd','pk'].map(k=>L[k]>1e-5?db(L[k]/d):'     -').join(''),' |',r.bands.map(b=>b.toFixed(0).padStart(5)).join(''))});
 await br.close()})();
