/* ---------- v49.45.0: Amazoom furniture without parts clipping through each other ----------
   Some models still had two parts fighting over the same spot, so they flickered or one poked through the other:
   - the bookshelf was a solid block with its books and shelves buried inside it (only faint lines showed)
   - the extra wardrobe had its plinth showing as a black wedge, the dog house roof ridge cut through the roof,
     the cabinets and the sideboard had their hinges sunk into the doors, the popcorn machine hid its popcorn in a
     solid "glass" box
   Those six are rebuilt as clean models (same footprint). Then every item gets an automatic check: wherever two
   parts of different colours share a visible face, the smaller part is moved out by a few millimetres so it sits
   on top instead of flickering, and exact duplicate parts are dropped. tools: see FIT191.report() in the console.
   Boxes are [w,h,d,colour,x,y,z] in the item's own space (y up from the floor, +z the front); '*' makes a part glow. */
(function(){
if(typeof F=='undefined')return;
const D_=(c,k)=>{try{return dk(c,k)}catch(e){return c}};

/* a bookcase you can see into: back, sides, top, four shelves and rows of books */
function bookcase(){const W='#6b4a2e',DW='#4a3220',o=[[1.2,1.96,.03,'#3e2a1a',0,1,-.185],[.05,2,.4,W,-.575,1,0],[.05,2,.4,W,.575,1,0],[1.2,.05,.4,W,0,1.975,0],[1.1,.1,.38,DW,0,.05,-.01]];
 const lv=[.1,.6,1.1,1.55],BK=['#c8506a','#4aa3df','#e6b422','#2e8b57','#8e44ad','#e8e4dc','#c0392b','#2f4a8a','#d98a3a','#1c1c20'];
 lv.forEach((y,i)=>{if(i)o.push([1.1,.04,.37,DW,0,y-.02,-.005]);let x=-.52,k=i*3;const end=i==3?.12:.52;
  while(x<end-.05){const w=.05+((k*37)%4)*.012,h=(i==0?.36:.32)+((k*53)%5)*.018,c=BK[(k*7+i)%BK.length];
   if(i==1&&k%9==5){/* a book lying flat */o.push([.24,.05,.22,c,x+.12,y+.025,.0]);x+=.26;k++;continue}
   o.push([w-.008,h,.24,c,x+w/2,y+h/2,-.02],[w-.008,.02,.012,D_(c,1.3),x+w/2,y+h*.8,.104]);x+=w;k++}});
 /* top shelf: a small plant and a framed photo next to the books */
 o.push([.12,.1,.12,'#a0522d',.3,1.6,0],[.1,.16,.1,'#2e8b57',.3,1.73,0],[.04,.08,.04,'#3ab06a',.33,1.82,.02],[.2,.24,.03,'#2a1d14',.42,1.66,-.06],[.16,.2,.012,'#f4e6c8',.42,1.66,-.04]);
 return o}
function wardrobe2(){const C='#6e492d',T='#8d5e3a';
 return[[1.12,.1,.5,'#2a1d14',0,.05,-.02],[1.2,1.85,.56,C,0,1.025,-.02],[1.26,.1,.62,T,0,2.0,0],[.57,1.79,.03,T,-.293,1.025,.275],[.57,1.79,.03,T,.293,1.025,.275],
  [.4,1.4,.012,D_(T,.88),-.293,1.05,.296],[.4,1.4,.012,D_(T,.88),.293,1.05,.296],[.014,1.79,.016,'#2a1d14',0,1.025,.282],[.03,.3,.03,'#e6b422',-.05,1.05,.305],[.03,.3,.03,'#e6b422',.05,1.05,.305]]}
function doghouse(){const W='#a0522d',R='#7a3a1d';
 return[[1.1,.06,1.1,'#5a3a22',0,.03,0],[1.04,.74,1.04,W,0,.43,0],[.46,.5,.02,'#1a1008',0,.31,.53],[.56,.06,.04,'#c8823a',0,.59,.53],[.06,.5,.04,'#c8823a',-.26,.31,.53],[.06,.5,.04,'#c8823a',.26,.31,.53],
  [1.2,.08,1.2,R,0,.84,0],[.96,.1,1.2,D_(R,1.1),0,.93,0],[.68,.1,1.2,R,0,1.03,0],[.4,.1,1.2,D_(R,1.1),0,1.13,0],[.14,.08,1.22,'#c0392b',0,1.22,0],
  [.4,.1,.02,'#f4e1c1',0,.7,.53],[.06,.03,.022,'#c0392b',-.12,.7,.535]]}
function cabinet(body,door,top){return[[.92,.08,.44,'#111',0,.04,-.01],[1,1.04,.48,body,0,.6,-.01],[1.06,.06,.54,top,0,1.15,0],
  [.485,.96,.03,door,-.2475,.6,.245],[.485,.96,.03,door,.2475,.6,.245],[.36,.78,.012,D_(door,.9),-.25,.6,.266],[.36,.78,.012,D_(door,.9),.25,.6,.266],
  [.03,.16,.03,'#e6b422',-.04,.66,.275],[.03,.16,.03,'#e6b422',.04,.66,.275]]}
function popcorn(){const R='#c0392b',G='#c8ccd0',o=[[.6,.46,.5,R,0,.27,0],[.62,.06,.52,'#d8b04a',0,.53,0],[.3,.2,.012,'#f4f1e8',0,.28,.256],[.2,.08,.014,R,0,.3,.264],
  [.62,.08,.52,R,0,1.2,0],[.4,.16,.36,R,0,1.32,0],[.1,.1,.1,'#d8b04a',0,1.44,0],[.3,.12,.012,'*ffd23d',0,1.2,.265],
  [.5,.2,.4,'#ffe8a0',0,.66,0],[.14,.12,.14,G,.08,1.05,0],[.02,.08,.02,G,.08,1.13,0],[.08,.03,.06,'#ffe8a0',.08,1.11,0]];
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>o.push([.03,.6,.03,G,sx*.265,.86,sz*.215]));
 [-1,1].forEach(s=>{o.push([.56,.03,.03,G,0,.575,s*.215],[.56,.03,.03,G,0,1.145,s*.215],[.03,.03,.43,G,s*.265,1.145,0])});
 [[-.16,.08],[.05,-.1],[.18,.1],[-.05,.12],[.12,-.05]].forEach(([x,z],i)=>o.push([.08,.06,.08,i%2?'#fff4c8':'#ffe08a',x,.79,z]));
 [[.26,.2],[-.26,.2],[.26,-.2],[-.26,-.2]].forEach(([x,z])=>o.push([.06,.04,.06,'#222',x,.02,z]));return o}

const REB={shelf:bookcase,ward2:wardrobe2,dogh:doghouse,cab1:()=>cabinet('#6b4a2e','#855c39','#8b603b'),cab2:()=>cabinet('#d8c7a6','#fff8cf','#ffffd7'),popcorn};
Object.keys(REB).forEach(k=>{if(F[k])try{F[k].b=REB[k]()}catch(e){console.warn('amazoom rebuild '+k,e)}});
/* the arcade cabinet's screen and bezel were inside the cabinet, so its front looked blank */
try{const A=F.arcadecab&&F.arcadecab.b;if(A){const sc=A.find(a=>a[3]=='*3ad0ff'&&a[0]==.54),bz=A.find(a=>a[3]=='#111'&&a[0]==.62);if(bz){bz[2]=.02;bz[6]=.36}if(sc){sc[2]=.012;sc[6]=.376}}}catch(e){}

/* ---------- the automatic check ---------- */
const E=1e-3,PUSH=.008;
function box(a){return{x0:a[4]-a[0]/2,x1:a[4]+a[0]/2,y0:a[5]-a[1]/2,y1:a[5]+a[1]/2,z0:a[6]-a[2]/2,z1:a[6]+a[2]/2,v:a[0]*a[1]*a[2]}}
function fit(b){if(!Array.isArray(b))return 0;let n=0;
 /* exact duplicates */
 for(let i=b.length-1;i>0;i--)for(let j=0;j<i;j++)if(b[i].length==b[j].length&&b[i].every((v,q)=>v===b[j][q])){b.splice(i,1);n++;break}
 for(let pass=0;pass<2;pass++){const X=b.map(box);
  for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++){const A=X[i],Bx=X[j];if(String(b[i][3])==String(b[j][3]))continue;
   const ix=Math.min(A.x1,Bx.x1)-Math.max(A.x0,Bx.x0),iy=Math.min(A.y1,Bx.y1)-Math.max(A.y0,Bx.y0),iz=Math.min(A.z1,Bx.z1)-Math.max(A.z0,Bx.z0);
   if(ix<=E||iy<=E||iz<=E)continue;
   const s=A.v<=Bx.v?i:j,S2=X[s],o=s==i?Bx:A;
   [['x',0,4],['y',1,5],['z',2,6]].forEach(([ax,wi,ci])=>[[ax+'0',-1],[ax+'1',1]].forEach(([f,sg])=>{if(Math.abs(S2[f]-o[f])>E)return;if(ax=='y'&&sg<0&&S2[f]<.01)return;
    const a=b[s];a[wi]=+(a[wi]+PUSH).toFixed(4);a[ci]=+(a[ci]+sg*PUSH/2).toFixed(4);S2[f]+=sg*PUSH;n++}))}}
 return n}
const fixed={};
function runAll(){Object.keys(F).forEach(k=>{try{const n=fit(F[k].b);if(n)fixed[k]=n}catch(e){}});try{if(typeof PVM=='object')Object.keys(PVM).forEach(k=>{if(k.slice(0,2)=='f:')delete PVM[k]})}catch(e){}}
runAll();
window.FIT191={fit,fixed,report:()=>fixed};
})();
