#!/usr/bin/env node
/* Production script bundle (loading-time stage 1). Run by the Pages deploy workflow AFTER the dev bundle; not committed.
   Reads index.html, takes every local <script src> that comes after the 3D library tag (assets.js ... the last dev/ file),
   minifies each one lightly (no renaming, so the shared global names stay the same) and writes them to fw-bundle.js,
   in the same order. fw-bundle.js runs each file as its own classic script, exactly like separate tags (an error in one file does not stop the rest).
   index.html then loads that one file instead of ~270 tags. The original page is kept as index-src.html (the dev launcher reads that).
   If fw-bundle.js is missing or fails to finish, an inline fallback writes the original tags (only the ones the bundle had not run yet), so the page can never end up without its code.
   usage: node tools/build-prod-bundle.js   (needs `terser`: npm i terser, or TERSER_DIR=<dir containing node_modules/terser>; without it files are bundled unminified) */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.join(__dirname,'..');
let terser=null;try{terser=require('terser')}catch(e){try{terser=require(path.join(process.env.TERSER_DIR||'','node_modules/terser'))}catch(e2){}}
(async()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 if(html.includes('fw-bundle.js')){console.log('index.html already uses the bundle; nothing to do');return}
 const re=/<script src="([^"]+)"[^>]*><\/script>/g,tags=[...html.matchAll(re)];
 const cdn=tags.findIndex(t=>/^https?:/.test(t[1]));
 if(cdn<0)throw new Error('3D library tag not found');
 const mine=tags.slice(cdn+1).filter(t=>!/^https?:/.test(t[1]));
 if(mine.length<20)throw new Error('too few scripts found: '+mine.length);
 const files=[];let raw=0,min=0;
 for(const t of mine){
  const f=t[1].split('?')[0];let code=fs.readFileSync(path.join(root,f),'utf8');raw+=code.length;
  if(terser){try{const r=await terser.minify(code,{compress:{passes:1,toplevel:false},mangle:false,format:{comments:false}});if(r.code)code=r.code}catch(e){console.warn('not minified:',f,e.message)}}
  min+=code.length;files.push([f,code]);
 }
 const body='(function(F){window.FWB_OK=0;window.FWB_N=0;for(var i=0;i<F.length;i++){var e=document.createElement("script");e.text=F[i][1]+"\\n//# sourceURL=/"+F[i][0];window.FWB_N=i+1;document.head.appendChild(e);e.remove()}window.FWB_OK=1})('+JSON.stringify(files).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+');\n';
 const hash=crypto.createHash('sha256').update(body).digest('hex').slice(0,10);
 fs.writeFileSync(path.join(root,'fw-bundle.js'),body);
 fs.writeFileSync(path.join(root,'index-src.html'),html);
 /* the bundle goes where the first bundled tag was; the other tags are removed */
 let out=html,first=true;
 for(const t of mine){
  if(first){out=out.replace(t[0],'<script src="fw-bundle.js?v='+hash+'"></script><script>window.FWB_OK||document.write('+JSON.stringify(mine.map(m=>m[0])).replace(/<\//g,'<\\/')+'.slice(window.FWB_N||0).join(\'\'))</script>');first=false}
  else out=out.replace(t[0],'');
 }
 fs.writeFileSync(path.join(root,'index.html'),out);
 console.log('prod bundle:',files.length,'scripts',raw,'->',min,'bytes, v='+hash);
})();
