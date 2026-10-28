/* ---------- v49.1.0: a kinder start, milestone celebrations and helpful tips ----------
   - New artist buzz: up to +35% daily streams per song at Fame Level 0, fading to nothing by level 4, so the first
     days move faster (same shape as the Gphone buzz in 118: the song's cap still applies).
   - Milestones: monthly listeners, total streams and followers each get a card, chime and confetti the first time
     they pass 100 / 1k / 10k ... State S.ms={l,s,f} (highest step passed); old saves start where they are, silently.
   - Tips: one-time hints after the tutorial, shown when they are useful (no songs yet on day 2, first time outside,
     low energy, money for gear, the Quests app, first release). State S.tips={id:1}. */
(()=>{
const FL=()=>{try{return fameLevel()||0}catch(e){return 0}};
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;const m=.35*Math.max(0,1-FL()/4);if(!(m>0))return v;
 try{const x=(s.vx||0)+(s.fx||0),n=v-x,cap=songCap(s)-x;s.pv=x+Math.max(n,Math.min(Math.round(n*(1+m)),Math.round(cap)));return s.pv}catch(e){return v}}}

const MS={l:['monthly listeners',[100,1e3,1e4,1e5,1e6,1e7,1e8]],s:['total streams',[1e3,1e4,1e5,1e6,1e7,1e8,1e9]],f:['followers',[100,1e3,1e4,1e5,1e6,1e7]]};
const val={l:()=>+S.listeners||0,s:()=>+S.streams||0,f:()=>+S.followers||0};
const big=n=>n>=1e9?n/1e9+'B':n>=1e6?n/1e6+'M':n>=1e3?n/1e3+'K':String(n);
const live=()=>typeof S=='object'&&S&&S.day&&!document.getElementById('load')&&!(typeof TT!='undefined'&&TT.on)&&mode!='load';
const step=k=>MS[k][1].filter(t=>val[k]()>=t).length;
function msTick(){if(!live())return;if(!S.ms){S.ms={};for(const k in MS)S.ms[k]=step(k);return}
 if(PAUSED||mode=='pause'||document.getElementById('glr'))return;
 for(const k in MS){const n=step(k);if(S.ms[k]==null){S.ms[k]=n;continue}if(n>S.ms[k]){S.ms[k]=n;const t=MS[k][1][n-1];
  try{glCard('MILESTONE',big(t)+' '+MS[k][0],n>=4?'You are a star':n>=2?'People are noticing':'Your first fans are here');snd('chime');setTimeout(()=>snd('cash'),180);glBurst(20+n*8)}catch(e){}return}}}

const TIPS=[
 ['song',()=>S.day>=2&&!(S.songs||[]).length,'No songs out yet. Record one in your studio, then release it on Spotifly from your PC. Releases earn streams every night.'],
 ['out',()=>typeof P!='undefined'&&(P.x<0||P.x>16||P.z>12||P.z<0)&&mode=='play'&&!IN,'Press N for the city map: shops, venues and places to visit are all on it.'],
 ['tired',()=>(S.energy??100)<25,'Low energy. Eat something (Eats on your Gphone, or the kitchen) or sleep at your bed.'],
 ['quest',()=>S.day>=2,'Your PC has a Quests app: finish all three daily quests for a cash reward every day.'],
 ['ig',()=>(S.songs||[]).length>=1&&!(S.igPosts||[]).length,'Post on Instagrime (Gphone, press G) to turn listeners into followers.'],
 ['gear',()=>(+S.money||0)>=600&&(S.songs||[]).length>=1,'Better studio gear makes better songs. Open the Browser on your PC and visit the Gearshop.']];
function tip(t){const d=document.createElement('div');d.className='tipT';d.innerHTML='<b>Tip</b> '+esc(t);$('toast').appendChild(d);snd('ping');setTimeout(()=>d.remove(),8000)}
let lastTip=0;
function tipTick(){if(!live()||mode!='play'||PAUSED||(S.tut&&S.tut.on))return;const now=performance.now();if(now-lastTip<45000)return;S.tips=S.tips||{};
 for(const[id,ok,t]of TIPS){if(S.tips[id])continue;let y=false;try{y=ok()}catch(e){}if(y){S.tips[id]=1;lastTip=now;tip(t);return}}}
{const st=document.createElement('style');st.textContent='#toast .tipT{border-color:#ffd27a!important;max-width:min(420px,88vw)}#toast .tipT b{font:10px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:1px;margin-right:6px}';document.head.appendChild(st)}
setInterval(()=>{try{msTick()}catch(e){}try{tipTick()}catch(e){}},2000);
})();
