/* ===== v42.1.0: look code in the character creator (dev/admin account only, isAdmin() from 88-admin.js) =====
   A short plain-text code of every look option, e.g. "skin=7 hair=1 hc=#1b1b1f eyes=0 mouth=0 top=1 tc=#2f2f38 pc=#2c3e50 body=40 hgt=50".
   James pastes these so new NPC artists can wear his designs. Format and how to use it: see the comment above RLK in 114-real-looks.js. */
const LKC_COL={hc:()=>HAIRC,tc:()=>TOPC,pc:()=>PANTC},LKC_K=['skin','hair','hc','eyes','mouth','top','tc','pc','body','hgt'];
function lookCode(c){c=c||ch;const ks=LKC_K.concat(Object.keys(c).filter(k=>!LKC_K.includes(k)&&!/_custom$/.test(k)));
 return ks.map(k=>{let v=c[k];if(LKC_COL[k])v=c[k+'_custom']||LKC_COL[k]()[v||0];else if(k=='body'||k=='hgt')v=Math.round((v??.5)*100);
  if(v==null||typeof v=='object'||typeof v=='function')return '';return k+'='+String(v).replace(/\s+/g,'_')}).filter(Boolean).join(' ')}
/* code -> look config for buildChar / pf2 / RLK / ART entries. Missing keys fall back to defaults. */
function lookFromCode(s){const c={skin:0,eyes:0,mouth:0,hair:0,hc:0,top:0,tc:0,pc:0,body:.4,hgt:.5};
 String(s||'').trim().split(/[\s,;]+/).forEach(p=>{const i=p.indexOf('=');if(i<1)return;const k=p.slice(0,i),v=p.slice(i+1);
  if(LKC_COL[k]&&v[0]=='#')c[k+'_custom']=v;else if(k=='body'||k=='hgt')c[k]=Math.max(0,Math.min(1,(+v||0)/100));else c[k]=(v[0]=='#'||v===''||isNaN(+v))?v:+v});return c}
function lkcCopy(){const t=lookCode(),ok=()=>say('Look code copied'),fb=()=>{const el=$('lkct');if(el){el.select();try{document.execCommand('copy');ok()}catch(e){say('Select the code and copy it.')}}};
 try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}}
{const c0=creatorUI;creatorUI=function(){c0.apply(this,arguments);try{if(typeof isAdmin!='function'||!isAdmin())return;const cre=$('cre'),r2=cre&&cre.querySelector('.row2');if(!r2)return;
  const d=document.createElement('div');d.className='r';d.id='lkc';d.innerHTML=`<span>Look code</span><input id=lkct readonly onclick="this.select()" style="flex:1;min-width:0;font:11px monospace;padding:4px"><button onclick="lkcCopy()">Copy</button>`;
  cre.insertBefore(d,r2);$('lkct').value=lookCode()}catch(e){console.warn('look code',e)}}}
{const r0=refresh;refresh=function(){const r=r0.apply(this,arguments);try{const el=$('lkct');if(el)el.value=lookCode()}catch(e){}return r}}
{const f0=fbRedraw;fbRedraw=function(){f0.apply(this,arguments);try{if(mode=='creator'&&$('cre')&&!$('lkc')&&isAdmin())creatorUI()}catch(e){}}}
