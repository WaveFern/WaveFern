/* ---------- music ---------- */
const TR=[{src:window.EMBEDDED_ASSETS.track1,fin:2,fout:3},{src:window.EMBEDDED_ASSETS.track2,fin:2,fout:0},{src:window.EMBEDDED_ASSETS.track3,fin:2,fout:3}];let VOL=.5,FX=.6,LAST=.5,SP='',AC,fs=0;try{const q=JSON.parse(localStorage.getItem('fw_set'));if(q){VOL=q.VOL;FX=q.FX}}catch(e){}
/* v26.97: more settings, kept in their own browser key so old fw_set values still load: menu and pause music, which soundtrack tracks play and in what order, ambience level, car radios, footsteps, name tags */
const OPT_DEF={menuMus:1,pauseMus:1,tracks:[1,1,1],order:'shuffle',amb:1,cars:1,steps:1,tags:1};let OPT=JSON.parse(JSON.stringify(OPT_DEF));
try{const q=JSON.parse(localStorage.getItem('fw_opt'));if(q&&typeof q=='object'){for(const k in OPT_DEF)if(q[k]!=null&&typeof q[k]==typeof OPT_DEF[k])OPT[k]=q[k];if(!Array.isArray(OPT.tracks)||OPT.tracks.length!=TR.length)OPT.tracks=TR.map(()=>1)}}catch(e){}
const svOpt=()=>{try{localStorage.setItem('fw_opt',JSON.stringify(OPT))}catch(e){}};
/* the next soundtrack track: only tracks left on in Settings, shuffled (never the same one twice when another is on) or in order; -1 when every track is off */
function nextTrack(){const on=TR.map((t,i)=>i).filter(i=>OPT.tracks[i]);if(!on.length)return -1;
 if(OPT.order=='order'){for(let k=1;k<=TR.length;k++){const i=(MU.cur+k+TR.length)%TR.length;if(OPT.tracks[i])return i}return on[0]}
 const L=on.length>1?on.filter(i=>i!=MU.cur):on;return L[RI(0,L.length-1)]}
const MU={a:TR.map(t=>{const a=new Audio(t.src);a.preload='none';a.onended=()=>{MU.pl=0;MU.gap=R(2.5,5)};return a}),cur:-1,pl:0,on:0,gap:1};
/* the tracks only start buffering on the first click or key (music cannot play before that anyway), so they do not compete with the game files while it loads */
function musicOn(){if(!MU.on)MU.a.forEach(a=>{a.preload='auto';try{a.load()}catch(e){}});MU.on=1}['pointerdown','keydown'].forEach(e=>addEventListener(e,musicOn));
setInterval(()=>{if(!MU.on||MU.hold)return;
 if(MU.pl){const a=MU.a[MU.cur],T=TR[MU.cur],t=a.currentTime,d=a.duration||0;let v=1;
  if(T.fin&&t<T.fin)v=Math.min(v,t/T.fin);if(T.fout&&d&&t>d-T.fout)v=Math.min(v,(d-t)/T.fout);a.volume=Math.max(0,Math.min(1,v))*VOL*(window.MU_DIP==null?1:window.MU_DIP)}
 else{MU.gap-=.05;if(MU.gap<=0){const n=nextTrack();if(n<0){MU.gap=1;return}const a=MU.a[n];a.currentTime=0;a.volume=0;MU.cur=n;MU.pl=1;a.play().catch(()=>{MU.pl=0;MU.gap=1})}}},50);

