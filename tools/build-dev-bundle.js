#!/usr/bin/env node
/* Builds dev/bundle.json: every game script from index.html in one file (lightly minified), so the dev build loads in one request
   instead of ~190. Run by the Pages deploy workflow; not committed. The dev launcher (dev/index.html) checks the list below against
   the live index.html and falls back to the normal script tags if they differ or the bundle is missing, so it can never serve stale code.
   usage: node tools/build-dev-bundle.js   (needs `terser`: npm i terser; without it the scripts are bundled unminified) */
const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
let terser=null;try{terser=require('terser')}catch(e){try{terser=require(path.join(process.env.TERSER_DIR||'',"node_modules/terser"))}catch(e2){}}
(async()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const srcs=[...html.matchAll(/<script src="([^":]+)"[^>]*><\/script>/g)].map(m=>m[1]);
 const files=[];let raw=0,min=0;
 for(const s of srcs){
  const f=s.split('?')[0];let code=fs.readFileSync(path.join(root,f),'utf8');raw+=code.length;
  if(terser){try{const r=await terser.minify(code,{compress:{passes:1,toplevel:false},mangle:false,format:{comments:false}});if(r.code)code=r.code}catch(e){console.warn('not minified:',f,e.message)}}
  min+=code.length;files.push({s,c:code});
 }
 fs.writeFileSync(path.join(root,'dev','bundle.json'),JSON.stringify({list:srcs,files}));
 console.log('dev bundle:',files.length,'scripts',raw,'->',min,'bytes');
})();
