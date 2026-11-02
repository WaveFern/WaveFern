#!/usr/bin/env node
/* Unit test for 12-save-seal.js: sealing, tamper detection, speed, sanity checks. Run: node tools/seal-test.js */
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const base=require('path').join(__dirname,'..')+'/';
let src=fs.readFileSync(base+'12-save-load.js','utf8');
// only the codec part (up to resetState area)
const cut=src.indexOf('/* fresh-new-game defaults');
const codec=src.slice(0,cut);
const ctx={console,Map,Uint8Array,Uint32Array,DataView,Math,JSON,Date,Error,String,Array,Object,isFinite,parseInt};
vm.createContext(ctx);
const seal=fs.readFileSync(base+'12-save-seal.js','utf8');
// codec first for SC_C; seal needs it only at call time
vm.runInContext(seal.replace(/\bconst /g,'var ').replace(/\blet /g,'var ')+'\n'+codec.replace(/\bconst /g,'var ').replace(/\blet /g,'var ')+'\nvar S={day:5,money:100,earn:50,artist:"A<b>",songs:[],inv:{a:1}},ch={},PL=[],VOL=1,FX=2;',ctx);
const T=(n,f)=>{try{const r=f();console.log(r===true||r===undefined?'ok  ':'FAIL',n,r===true||r===undefined?'':r)}catch(e){console.log('FAIL',n,e.message)}};
T('sha256 vs node',()=>{for(const n of [0,1,55,56,63,64,65,1000,100000]){const b=crypto.randomBytes(n);const a=Buffer.from(ctx.sha256(new Uint8Array(b))).toString('hex');if(a!==crypto.createHash('sha256').update(b).digest('hex'))return 'mismatch '+n}return true});
T('hmac vs node',()=>{const k=crypto.randomBytes(32),m=crypto.randomBytes(300);return Buffer.from(ctx.sealHmac(new Uint8Array(k),new Uint8Array(m))).toString('hex')===crypto.createHmac('sha256',k).update(m).digest('hex')||'bad'});
const code=vm.runInContext('saveCode()',ctx);
console.log('code',code.slice(0,40),code.length);
T('prefix',()=>code.startsWith('FW4-'));
T('deterministic',()=>vm.runInContext('saveCode()',ctx)===code);
T('roundtrip',()=>{ctx.c=code;const d=vm.runInContext('scDecode(c)',ctx);return d.S.day===5&&d.S.artist==='A<b>'||'bad'});
T('tamper any char rejected',()=>{let bad=0;for(let i=4;i<code.length;i+=3){const ch=code[i]===ctx.SC_C[0]?ctx.SC_C[1]:ctx.SC_C[0];ctx.c=code.slice(0,i)+ch+code.slice(i+1);try{vm.runInContext('SCC.clear();scDecode(c)',ctx);bad++}catch(e){}}return bad?bad+' accepted':true});
T('truncated rejected',()=>{ctx.c=code.slice(0,-3);try{vm.runInContext('scDecode(c)',ctx);return 'accepted'}catch(e){return true}});
T('chat damage (spaces/newlines)',()=>{ctx.c=code.slice(0,30)+'\n '+code.slice(30);return vm.runInContext('scDecode(c).S.day',ctx)===5||'bad'});
T('big save speed',()=>{vm.runInContext('S.songs=Array.from({length:3000},(_,i)=>({id:i,title:"Song number "+i,streams:i*1234,q:50+i%50}))',ctx);const t=Date.now();const c=vm.runInContext('saveCode()',ctx);const t1=Date.now()-t;ctx.c=c;const t2=Date.now();vm.runInContext('SCC.clear();scDecode(c)',ctx);console.log('   len',c.length,'seal+pack',t1,'ms open+unpack',Date.now()-t2,'ms');return true});
T('legacy FW3 still decodes',()=>{ctx.j=JSON.stringify({S:{day:9}});const c='FW3-'+vm.runInContext('scPack(j,SC_C,38)',ctx);ctx.c=c;return vm.runInContext('scDecode(c).S.day',ctx)===9||'bad'});
T('scCheck money',()=>{ctx.s={money:1e12,earn:10,day:3,songs:[],inv:{x:1e9}};const b=vm.runInContext('scCheck(s,true)',ctx);return (b.includes('money')&&ctx.s.money<=1e8&&ctx.s.inv.x===9999)||JSON.stringify(ctx.s)});
T('scCheck clean ok',()=>vm.runInContext('scCheck({day:400,money:5e6,earn:2e6,followers:1e6,songs:[{streams:5}]})',ctx).length===0);
T('scClean2 markup+proto',()=>{ctx.o=JSON.parse('{"a":"<img onerror=x>","__proto__":{"p":1},"b":["<"]}');vm.runInContext('scClean2(o)',ctx);return (ctx.o.a.indexOf('<')<0&&!Object.prototype.hasOwnProperty.call(ctx.o,'__proto__')&&ctx.o.b[0]=='‹')||JSON.stringify(ctx.o)});
