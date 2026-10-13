/* ===== collab fees and who messages you (v26.52.0) =====
   Artists DM you (popularity-weighted, see dmWeight) or you message them. Price talk happens in Messages (33-haggle.js, 19-...js).
   Once the price is agreed you press Confirm & pay (or Accept & get paid) in the chat and the collab happens right away:
   the money moves once, the artist waits at the meeting place (gold beacon) and walking up to them starts the session.
   Everything about the price comes from collabFee(); everything about who contacts you comes from dmWeight(). */

/* ---- 1. the fee function ---- */
let MKT=null;
/* the roster's normal fee for an artist of this size (log-log interpolation through the roster rows) */
function mktFee(size){if(!MKT)MKT=ART.map(a=>[Math.log(Math.max(1,a[2])),Math.log(a[3])]).sort((p,q)=>p[0]-q[0]);
 const x=Math.log(Math.max(1,size)),f=MKT[0],l=MKT[MKT.length-1];if(x<=f[0])return Math.exp(f[1]+(x-f[0])*.6);if(x>=l[0])return Math.exp(l[1]+(x-l[0])*.9);
 for(let j=1;j<MKT.length;j++)if(x<=MKT[j][0]){const[x0,y0]=MKT[j-1],[x1,y1]=MKT[j],t=x1==x0?0:(x-x0)/(x1-x0);return Math.exp(y0+(y1-y0)*t)}return l[1]}
/* small artists charge a fraction of the headline fee: ~18% at a handful of listeners, ~50% at 1,000, ~90% at 15,000 and up */
const smallK=A=>.18+.82*A/(A+1500);
/* collabFee(i, dir, k): the ONE price function.
   dir 'p' = what artist i charges the player (the player contacted them)
   dir 'a' = what artist i pays the player (they contacted the player)
   k       = optional multiplier (1.2 for a repeat session)
   'p': the artist's headline fee x smallK (fee scales with audience), x a seeded markup (0.92-1.12), x how much bigger they are than the
        player (a bigger audience is worth more to you: (A/L)^0.2, clamped 0.75-1.35), x 0.92 for artists you already worked with,
        x a small discount for a good reputation.
   'a': the market price of the player's own audience, 55% of it, never more than 80% of what the artist would charge themselves. */
function collabFee(i,dir,k){const a=ART[i];if(!a)return 5;const A=a[2],mk=artMK(i),L=Math.max(0,S.listeners||0),rep=Math.max(-5,Math.min(10,S.rep||0));
 const prev=S.msgs.some(m=>m.a===i&&m.state==3)?.92:1,rel=Math.min(1.35,Math.max(.75,Math.pow((A+5)/(L+5),.2)));
 const fee=a[3]*smallK(A)*mk*rel*prev*(1-rep*.01);
 let v;if(dir=='a'){const M=mktFee(Math.max(1,L))*smallK(Math.max(1,L));v=Math.min(M*.55*(.9+(mk-.92)),fee*.8)}else v=fee;
 return Math.max(3,nr(v*(k||1)))}

/* ---- 2. who messages you: popularity weights ---- */
const GENREL=[['Hip-Hop','Rap'],['Pop','R&B','Indie'],['Lo-fi','Electronic','Folk'],['Rock','Country','Folk','Indie'],['R&B','Latin','Pop']];
/* 0..1: how fast the player is growing (monthly listeners now vs a week ago) and how much interest their releases have */
function dmMomentum(){const h=S.mlHist||[],cur=h.length?h[h.length-1].ml:S.listeners||0,old=(h.filter(q=>q.day<=S.day-7).pop()||h[0]||{ml:cur}).ml,g=Math.max(0,Math.min(1,((cur+1)/(old+1)-1)));return Math.min(1,g*.7+(S.interest||0)*.3)}
function dmWeight(i,mo){const a=ART[i],A=a[2],L=Math.max(S.listeners||0,5),d=Math.log10(A/L),M=mo==null?dmMomentum():mo,rep=Math.max(-10,Math.min(15,S.rep||0));let w;
 if(Math.abs(d)<=.35)w=1;/* similar size: the most common */
 else if(d<0&&d>-.9)w=.7;/* a bit smaller: frequent */
 else if(d>0&&d<=1)w=.3*(1+2*M);/* a bit bigger: occasional, more when you are gaining momentum */
 else if(d<0){/* much smaller: rare unless there is a believable reason (a previous collab, or the same sound as your latest releases) */
  const rec=(S.songs||[]).slice(-5).map(s=>s.g);w=(rec.includes(a[1])||S.msgs.some(m=>m.a===i&&m.state==3))?.12:.015}
 else{/* much bigger: rare for an unknown, rising with your size, your reputation and your momentum */
  const rise=1+Math.min(4,Math.max(0,rep)*.15)+Math.min(3,Math.log10(L+1)*.5)+M*2;w=(d<=2.2?.02:.004*Math.pow(10,-(d-2.2)*.35))*rise}
 /* secondary: genre fit with your recent releases, reputation */
 const rec=(S.songs||[]).slice(-5).map(s=>s.g);if(rec.length){w*=rec.includes(a[1])?1.6:GENREL.some(g=>g.includes(a[1])&&rec.some(r=>g.includes(r)))?1.25:.85}
 return w*(1+.03*rep)*(a[9]||1)}  /* a[9]: optional per-artist DM weight, 1 = normal */
/* draw k artists (nobody who already has a thread) in proportion to their weight, with noise so it is never predictable */
function dmDraw(k){const mo=dmMomentum(),c=ART.map((a,i)=>i).filter(i=>!S.msgs.some(m=>m.a===i)&&!(typeof BLKI!='undefined'&&BLKI&&BLKI.has(i))),out=[];
 const w=c.map(i=>[i,dmWeight(i,mo)*(.5+Math.random())]);
 while(out.length<k&&w.length){const tot=w.reduce((p,q)=>p+q[1],0);if(tot<=0)break;let r=Math.random()*tot,j=0;for(;j<w.length-1;j++){if(r<w[j][1])break;r-=w[j][1]}out.push(w[j][0]);w.splice(j,1)}
 return out}
/* how many new DMs today: usually none or one, sometimes two */
function dmDaily(){const r=Math.random(),k=r<.3?0:r<.75?1:2,pend=S.msgs.filter(m=>m.a!==undefined&&!m.blocked&&m.state==0&&m.stage>=1&&m.unread).length,n=Math.max(0,Math.min(k,3-pend));
 const L=dmDraw(n);L.forEach(i=>newConv(i));return L.length}


/* a seeded markup (0.92 to 1.12) so each artist asks a slightly different price, the same in every save */
const artMK=i=>{const a=ART[i];return a?0.92+0.2*fRng(fHash('mk|'+a[0]))():1};
/* ---- 3. each artist's negotiation personality (33-haggle.js reads it): seeded from the name, so it is the same in every save ---- */
const NPW={flexible:22,stubborn:16,proud:12,greedy:14,generous:20,shrewd:16};
const ARTNP={};
function artNP(i){const a=ART[i];if(!a)return'shrewd';if(ARTNP[a[0]])return ARTNP[a[0]];
 const rnd=fRng(fHash('artx|'+a[0])),big=a[7]?1:0,A=a[2],w=Object.assign({},NPW);
 /* big names lean proud, small ones lean generous */
 w.proud+=big*20;w.stubborn+=big*6;w.generous-=big*10;w.flexible-=big*6;if(A<150){w.generous+=8;w.flexible+=6}
 let r=rnd()*Object.values(w).reduce((p,c)=>p+c,0),np='shrewd';for(const k in w){if(r<w[k]){np=k;break}r-=w[k]}
 return ARTNP[a[0]]=np}

/* ---- 4. first messages in a new career: same popularity weights, the two closest-to-you artists write first ---- */
firstDMs=function(){S.dm1=1;const k=RI(2,3),pool=dmDraw(k);
 pool.forEach((i,j)=>{const a=ART[i],w=j<2,m={id:S.nid++,a:i,state:0,stage:w?1:0,ex:0,neg:0,pay:collabFee(i,'a'),unread:1,log:[],rel:0,want:w?1:0,asked:w?1:0,init:'a'};
  m.log.push({f:'a',t:deco(a,pick(FDM[w?'w':'f'])),d:S.day});if(w)m.log.push({f:'a',t:deco(a,fill(pick(RB.ask),ctxOf(m))),d:S.day});S.msgs.push(m)});
 if(pool.length){snd('ping');say(pool.length+' artist'+(pool.length>1?'s':'')+' messaged you. Check Messages on your computer.')}updateVersion()};
/* the price an artist asks when you open a chat with them */
{const sc0=startChat;startChat=function(i){sc0(i);const m=S.msgs[S.msgs.length-1];if(m&&m.a===i){m.pay=collabFee(i,'p')}}}

/* ---- 5. older saves ----
   Saves from the calendar builds (v26.46 to v26.51) can hold S.cal, scheduled collabs (state 4) and the Calendar app. They are dropped here:
   a scheduled collab that never started goes back to agreed terms, with the usual Confirm or Accept button (any fee it had taken comes back);
   a session already under way stays a booking; the Calendar app is removed. Festival bookings (S.festBk) are kept as they are. */
function dropScheduling(){
 if(S.cal!==undefined)delete S.cal;
 if(S.apps)delete S.apps.cal;
 delete S.calApp;
 (S.msgs||[]).forEach(m=>{
  if(m.a===undefined)return;
  if(m.state==4){if(m.paid){S.money=+(S.money+m.paid).toFixed(2);m.paid=0}m.state=0;m.stage=2;m.ready=1}
  delete m.ev;delete m.pd;delete m.opt;delete m.alt;delete m.cool;
 });
}
{const lc=loadCode;loadCode=function(c){const r=lc(c);try{dropScheduling()}catch(e){console.error('older save',e)}return r}}
