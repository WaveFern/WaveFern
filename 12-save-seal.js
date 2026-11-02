/* ---------- v49.71.0: sealed save codes (FW4-) and load-time sanity checks ----------
   Loads right before 12-save-load.js, which uses these.
   FW4- = the same packed save, but encrypted and authenticated, so a code (or a copy of fw_save_N in localStorage) that was edited,
   cut short or made up cannot be read as a save: SHA-256 keystream cipher over the 76-character chat-safe alphabet (same length as
   FW3-), then an HMAC-SHA-256 tag (encrypt-then-MAC). The IV is derived from the content, so the same career always gives the same
   code (the game compares codes to know if anything changed). Everything here is synchronous, so nothing else had to change.
   HONEST LIMIT: the game runs in the player's browser, so the key is in the page's code. This stops editing a code or localStorage by hand,
   forged codes and corrupted codes, which is how nearly all save cheating happens. Someone who reads and reimplements this file can still
   forge a code. Values that really must be trusted (gifts, friends, rooms) are protected by the Firebase rules instead (docs/security/). */
const SEAL_PRE='FW4-',SEAL_IV=16,SEAL_TAG=20;
/* legacy (unsigned FW1-/FW2-/FW3-) codes keep loading until this date, then are refused (kept as a recovered backup instead of loaded).
   Every game that loads one re-saves it as FW4- straight away, so after the date only a save nobody has opened since the update is affected. */
const SEAL_LEGACY_UNTIL=Date.UTC(2027,2,1);
const sha256=(()=>{const K=new Uint32Array(64);{let n=2,c=0;while(c<64){let p=1;for(let i=2;i*i<=n;i++)if(n%i==0){p=0;break}if(p){K[c++]=Math.floor((Math.cbrt(n)%1)*4294967296)}n++}}
 const H0=(()=>{const h=new Uint32Array(8);let n=2,c=0;while(c<8){let p=1;for(let i=2;i*i<=n;i++)if(n%i==0){p=0;break}if(p){h[c++]=Math.floor((Math.sqrt(n)%1)*4294967296)}n++}return h})();
 const W=new Uint32Array(64);
 return function(m){const L=m.length,pl=((L+9+63)>>6)<<6,b=new Uint8Array(pl);b.set(m);b[L]=128;const dv=new DataView(b.buffer);dv.setUint32(pl-8,Math.floor(L/536870912));dv.setUint32(pl-4,(L<<3)>>>0);
  const h=H0.slice();
  for(let o=0;o<pl;o+=64){for(let i=0;i<16;i++)W[i]=dv.getUint32(o+i*4);
   for(let i=16;i<64;i++){const a=W[i-15],c=W[i-2],s0=((a>>>7)|(a<<25))^((a>>>18)|(a<<14))^(a>>>3),s1=((c>>>17)|(c<<15))^((c>>>19)|(c<<13))^(c>>>10);W[i]=(W[i-16]+s0+W[i-7]+s1)|0}
   let a=h[0],bb=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
   for(let i=0;i<64;i++){const S1=((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7)),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K[i]+W[i])|0,S0=((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10)),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;
    hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
   h[0]=(h[0]+a)|0;h[1]=(h[1]+bb)|0;h[2]=(h[2]+c)|0;h[3]=(h[3]+d)|0;h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0}
  const out=new Uint8Array(32),ov=new DataView(out.buffer);for(let i=0;i<8;i++)ov.setUint32(i*4,h[i]);return out}})();
const sealCat=(...a)=>{const o=new Uint8Array(a.reduce((n,x)=>n+x.length,0));let p=0;for(const x of a){o.set(x,p);p+=x.length}return o};
const sealTxt=s=>{const o=new Uint8Array(s.length);for(let i=0;i<s.length;i++)o[i]=s.charCodeAt(i)&255;return o};
function sealHmac(key,msg){const k=new Uint8Array(64);k.set(key.length>64?sha256(key):key);const i=k.map(x=>x^0x36),o=k.map(x=>x^0x5c);return sha256(sealCat(o,sha256(sealCat(i,msg))))}
/* the key is split up and mixed so it is not one searchable string; see the honest limit above */
const SEAL_KEY=(()=>{const p=['7f3a9c21','e84b1d56','a2c07f93','5d6e18b4','c9140ae7','3b8f52d0','61a7e4c8','d205b93f'],m=[3,6,1,0,7,2,5,4];let s='';m.forEach((_,i)=>{s+=p[m.indexOf(i)]});const o=new Uint8Array(32);for(let i=0;i<32;i++)o[i]=parseInt(s.substr(i*2,2),16)^(i*37+11&255);return sha256(sealCat(sealTxt('wavefern/save/v4'),o))})();
const SEAL_E=sealHmac(SEAL_KEY,sealTxt('enc')),SEAL_M=sealHmac(SEAL_KEY,sealTxt('mac')),SEAL_I=sealHmac(SEAL_KEY,sealTxt('iv'));
function sealStream(iv,n){const o=new Uint8Array(n);let c=0,j=0,blk=null,p=32;const ctr=new Uint8Array(4),dv=new DataView(ctr.buffer);
 while(j<n){if(p>=32){dv.setUint32(0,c++);blk=sha256(sealCat(SEAL_E,iv,ctr));p=0}const v=blk[p++];if(v<228)o[j++]=v%76}return o}
/* alphabet is SC_C (declared in 12-save-load.js and used only when these functions run) */
function seal(text){const n=text.length,idx=new Uint8Array(n);for(let i=0;i<n;i++){const v=SC_C.indexOf(text[i]);if(v<0)throw new Error('seal: bad symbol');idx[i]=v}
 const h=sealHmac(SEAL_I,idx),iv=new Uint8Array(SEAL_IV);for(let i=0;i<SEAL_IV;i++)iv[i]=h[i]%76;
 const ks=sealStream(iv,n),ct=new Uint8Array(n);for(let i=0;i<n;i++)ct[i]=(idx[i]+ks[i])%76;
 const tg=sealHmac(SEAL_M,sealCat(sealTxt(SEAL_PRE),iv,ct));let tag='';for(let i=0;i<SEAL_TAG;i++)tag+=SC_C[tg[i]%76];
 let s=SEAL_PRE;for(let i=0;i<SEAL_IV;i++)s+=SC_C[iv[i]];let b='';for(let i=0;i<n;i++)b+=SC_C[ct[i]];return s+b+tag}
/* returns the packed text, or throws 'tampered' */
const SEAL_BAD='This save was edited or damaged, so it was not loaded.';
function unseal(code){const body=code.slice(SEAL_PRE.length),n=body.length-SEAL_IV-SEAL_TAG;if(n<1)throw new Error(SEAL_BAD);
 const sy=s=>{const o=new Uint8Array(s.length);for(let i=0;i<s.length;i++){const v=SC_C.indexOf(s[i]);if(v<0)throw new Error(SEAL_BAD);o[i]=v}return o};
 const iv=sy(body.slice(0,SEAL_IV)),ct=sy(body.slice(SEAL_IV,SEAL_IV+n)),tg=sy(body.slice(SEAL_IV+n)),w=sealHmac(SEAL_M,sealCat(sealTxt(SEAL_PRE),iv,ct));
 let bad=0;for(let i=0;i<SEAL_TAG;i++)bad|=(w[i]%76)^tg[i];if(bad)throw new Error(SEAL_BAD);
 const ks=sealStream(iv,n);let t='';for(let i=0;i<n;i++)t+=SC_C[(ct[i]+76-ks[i])%76];return t}

/* ---------- sanity checks ----------
   scCheck(S, fix): lists what is impossible in a career. With fix=true it also repairs it (clamps numbers, cuts runaway lists, strips < > from text
   so a shared code can not carry markup). The limits are far above anything a real career reaches, so a normal player never sees this. */
const SAN={
 num:{day:[1,1e5,1],energy:[0,1e3],stam:[0,1e3],t:[0,1e5],followers:[0,1e10],listeners:[0,1e10],fans:[0,1e10],streams:[0,1e14],monthStreams:[0,1e13],earn:[0,1e14],igF:[0,1e10],bling:[0,1e3],home:[0,1e3],garage:[0,1e3],guards:[0,1e3]},
 list:{songs:10000,drafts:1000,msgs:20000,hist:20000,pets:100,cars:300,appt:1000,gifts:5000},
 inv:9999};
function scMoneyMax(s){return Math.max(1e8,50*Math.max(0,+s.earn||0)+1e7)+10*Math.max(0,+s.gm||0)}
function scCheck(s,fix){const bad=[];if(!s||typeof s!='object')return['career'];
 const num=(k,lo,hi,int)=>{let v=s[k];if(v===undefined||v===null)return;if(typeof v!='number'||!isFinite(v)){bad.push(k);if(fix)s[k]=lo;return}
  if(v<lo||v>hi){bad.push(k);if(fix)s[k]=Math.min(hi,Math.max(lo,v))}if(fix&&int)s[k]=Math.floor(s[k])};
 for(const k in SAN.num){const r=SAN.num[k];num(k,r[0],r[1],r[2])}
 if(s.money!==undefined){const hi=scMoneyMax(s);if(typeof s.money!='number'||!isFinite(s.money)){bad.push('money');if(fix)s.money=0}else if(s.money>hi||s.money<-1e9){bad.push('money');if(fix)s.money=Math.min(hi,Math.max(-1e9,s.money))}}
 for(const k in SAN.list)if(s[k]!==undefined&&(!Array.isArray(s[k])||s[k].length>SAN.list[k])){bad.push(k);if(fix)s[k]=Array.isArray(s[k])?s[k].slice(-SAN.list[k]):[]}
 if(s.artist!==undefined&&(typeof s.artist!='string'||s.artist.length>64)){bad.push('artist');if(fix)s.artist=String(s.artist).slice(0,64)}
 for(const k of ['inv','gear']){const o=s[k];if(o&&typeof o=='object'&&!Array.isArray(o))for(const x in o){const v=o[x],mx=k=='gear'?(typeof GMAX!='undefined'?GMAX:99):SAN.inv;if(typeof v!='number'||!isFinite(v)||v<0||v>mx){bad.push(k+'.'+x);if(fix)o[x]=typeof v=='number'&&isFinite(v)?Math.min(mx,Math.max(0,v)):0}}}
 if(s.songs&&Array.isArray(s.songs))s.songs.forEach(q=>{if(!q||typeof q!='object')return;for(const k of ['streams','fs']){const v=q[k];if(v!==undefined&&(typeof v!='number'||!isFinite(v)||v<0||v>1e13)){bad.push('song.'+k);if(fix)q[k]=typeof v=='number'&&isFinite(v)?Math.min(1e13,Math.max(0,v)):0}}});
 return bad}
/* text from a shared code must not carry markup into the page */
function scClean2(v,dp){dp=dp||0;if(typeof v=='string')return/[<>]/.test(v)?v.replace(/</g,'‹').replace(/>/g,'›'):v;if(!v||typeof v!='object'||dp>12)return v;
 if(Array.isArray(v)){for(let i=0;i<v.length;i++)v[i]=scClean2(v[i],dp+1);return v}
 for(const k in v){if(k=='__proto__'||k=='constructor'||k=='prototype'){delete v[k];continue}v[k]=scClean2(v[k],dp+1)}return v}
