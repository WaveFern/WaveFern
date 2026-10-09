/* ---------- music ---------- */
const TR=[{src:window.EMBEDDED_ASSETS.track1,fin:2,fout:3},{src:window.EMBEDDED_ASSETS.track2,fin:2,fout:0}];let VOL=.5,FX=.6,LAST=.5,SP='',AC,fs=0;try{const q=JSON.parse(localStorage.getItem('fw_set'));if(q){VOL=q.VOL;FX=q.FX}}catch(e){}
const MU={a:TR.map(t=>{const a=new Audio(t.src);a.preload='auto';a.onended=()=>{MU.pl=0;MU.gap=R(2.5,5)};return a}),cur:-1,pl:0,on:0,gap:1};
function musicOn(){MU.on=1}['pointerdown','keydown'].forEach(e=>addEventListener(e,musicOn));
setInterval(()=>{if(!MU.on||MU.hold)return;
 if(MU.pl){const a=MU.a[MU.cur],T=TR[MU.cur],t=a.currentTime,d=a.duration||0;let v=1;
  if(T.fin&&t<T.fin)v=Math.min(v,t/T.fin);if(T.fout&&d&&t>d-T.fout)v=Math.min(v,(d-t)/T.fout);a.volume=Math.max(0,Math.min(1,v))*VOL}
 else{MU.gap-=.05;if(MU.gap<=0){const n=MU.cur<0?RI(0,1):1-MU.cur,a=MU.a[n];a.currentTime=0;a.volume=0;MU.cur=n;MU.pl=1;a.play().catch(()=>{MU.pl=0;MU.gap=1})}}},50);

