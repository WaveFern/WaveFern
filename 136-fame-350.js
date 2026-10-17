/* ===== v43.3.0: fame levels go up to 350 =====
   Fame Level 350 is the top. Levels 1-40 need 12% more monthly listeners than before (slightly harder start), then each level
   needs about 4% more listeners than the last, so Level 275 (World Tour) is around 60 million, Level 300 about 170 million and Level 350 is 1.3 billion.
   Gates that were set as fame levels on the old curve (Gramophone Awards, the bigger festival stages) are moved to the new level
   with the same listener count, so they open at the same point in a career. Test mode (the cheat) lands on Level 350. At the max the fame bar shows 100%. */
const FAME_MAX=350;
{const OLD=[0,1];const oldStart=n=>{while(OLD.length<=n){const k=OLD.length;OLD.push(OLD[k-1]+Math.round(10*Math.pow(1.1,k-2)))}return OLD[n]};
 const K=40,TOP=1.3e9,SK=Math.round(1.12*oldStart(K)),G=Math.pow(TOP/SK,1/(FAME_MAX-K)),NEW=[];
 fameStart=function(n){n=Math.max(0,Math.floor(n));
  /* past the max there is no next level: 351 always sits just above you, so the fame bar reads Level 350 · 100% */
  if(n==FAME_MAX+1){const a=fameStart(FAME_MAX);let v=0;try{v=fameVal()}catch(e){}return a+Math.max(1,(v-a)/.996)}
  if(n>FAME_MAX)return Infinity;
  if(NEW[n]===undefined)NEW[n]=n<=K?(n<=1?n:Math.round(1.12*oldStart(n))):Math.round(SK*Math.pow(G,n-K));return NEW[n]};
 const fl0=fameLevel;fameLevel=function(L){return Math.min(FAME_MAX,fl0(L))};
 FLC=[-1,0];FTLc=null;
 const moved=v=>v>K?fameLevel(oldStart(v)):v;
 try{AW.need=moved(AW.need)}catch(e){}
 try{FSTG.forEach(s=>s.req=moved(s.req))}catch(e){}
 const ch=cheat;cheat=function(){ch.apply(this,arguments);try{const need=Math.ceil(fameStart(FAME_MAX)/(1+.08*(S.bling||0)));if(S.listeners<need)S.listeners=need;FLC=[-1,0];refresh()}catch(e){}}}
