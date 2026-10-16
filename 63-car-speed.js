/* ---------- v26.36: car speed control ----------
   Every car gets a top speed in mph by price: the dearest 120, then 80, 65, 35 and the cheapest 20.
   While driving, a speedometer box sits in the bottom-right corner: it shows the current speed and lets you
   type a target speed from 1 to the car's top speed (or nudge it with - / +). Holding W drives at the target,
   letting go coasts, S brakes and then reverses. The car eases up to and down to the target speed.
   The target is remembered per car in S.cspd.

   mph to world units (1 unit = 1 m, walking 3.3 m/s, sprinting 6.5 m/s): true scale up to 35 mph
   (1 mph = 0.447 m/s), then each mph above 35 counts for 60%, so 20 mph = 8.9 m/s, 35 = 15.6, 65 = 23.7,
   80 = 27.7 and 120 = 38.4 m/s (about the old Phantom GT top speed). A literal 120 mph (53.6 m/s) crosses
   a city block in about a second and is not drivable in this camera. The camera also zooms out a little
   as you go faster. */
const CAR_MPH=[120,80,65,35,20];
CARS.map((c,i)=>i).sort((a,b)=>CARS[b].p-CARS[a].p).forEach((i,r)=>{CARS[i].mph=CAR_MPH[Math.min(r,CAR_MPH.length-1)]});
const MPH_MS=.44704,MPH_KNEE=35,MPH_HI=.6;
const mphW=m=>m<=MPH_KNEE?m*MPH_MS:(MPH_KNEE+(m-MPH_KNEE)*MPH_HI)*MPH_MS;
const wMph=v=>{const k=MPH_KNEE*MPH_MS;return v<=k?v/MPH_MS:MPH_KNEE+(v/MPH_MS-MPH_KNEE)/MPH_HI};
const carMax=i=>(CARS[i]&&CARS[i].mph)||20;
function carTgt(i){S.cspd=S.cspd||{};const m=carMax(i),v=+S.cspd[i];return v>=1?Math.min(m,Math.round(v)):m}
function setCarTgt(i,v){S.cspd=S.cspd||{};v=String(v).trim()===''?NaN:Math.round(+v);if(isNaN(v))v=carTgt(i);v=Math.max(1,Math.min(carMax(i),v));S.cspd[i]=v;return v}

/* called from the drive block in worldTick (14-world...js) instead of the old accelerate-and-drag step */
function drvV(dr,C,ac,dt){const mx=mphW(carMax(dr.i)),tg=mphW(carTgt(dr.i)),A=3+mx*.35,v=dr.v;let n=v;
 if(ac>0){if(v<0)n=Math.min(0,v+22*dt);else if(v<tg)n=Math.min(tg,v+A*(1-.45*v/mx)*dt);else n=Math.max(tg,v-9*dt)}
 else if(ac<0){if(v>.3)n=Math.max(0,v-22*dt);else{const rv=-Math.min(tg,mphW(12));n=v>rv?Math.max(rv,v-A*.6*dt):Math.min(rv,v+9*dt)}}
 else n=v>0?Math.max(0,v-(2.5+v*.35)*dt):Math.min(0,v+(2.5-v*.35)*dt);
 dr.v=n}
/* camera height while driving: 11 as before at town speeds, up to 17 at full speed */
function drvView(){const v=dr?Math.abs(dr.v):0;return 11+Math.max(0,Math.min(6,(v-10)*.22))}

/* ---- the speedometer box ---- */
{const st=document.createElement('style');st.textContent=`
#spdbox{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));z-index:3;width:212px;padding:10px 12px 10px;
 background:#0b0f0dd9;border:3px solid #000;box-shadow:4px 4px 0 #0008;color:#e8f3ec;font:12px/1.2 ui-monospace,Menlo,Consolas,monospace;
 pointer-events:auto;user-select:none;display:none}
#spdbox .sg{position:relative;height:114px}
#spdbox svg{position:absolute;left:0;top:0;width:184px;height:120px;overflow:visible}
#spdbox .sn{position:absolute;left:0;right:0;top:50px;text-align:center}
#spdbox .sn b{display:block;font:700 30px/1 Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#2fe68a}
#spdbox .sn small{font:10px Silkscreen,ui-monospace,monospace;letter-spacing:3px;color:#8aa094}
#spdbox .sc{display:flex;align-items:center;gap:6px;margin-top:10px}
#spdbox .sl{font:10px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#8aa094;flex:1}
#spdbox button{width:28px;height:28px;border:2px solid #000;background:#26302a;box-shadow:inset 0 -3px 0 #0006;color:#e8f3ec;font:700 16px/1 ui-monospace,monospace;cursor:pointer;padding:0}
#spdbox button:hover{background:#364439}#spdbox button:active{transform:translateY(1px)}
#spdbox input{width:54px;height:28px;box-sizing:border-box;border:2px solid #333;background:#0a0d0b;color:#e8f3ec;text-align:center;font:700 15px ui-monospace,Menlo,monospace;
 user-select:text;-moz-appearance:textfield;appearance:textfield;outline:none}
#spdbox input:focus{border-color:#2fe68a}
#spdbox input::-webkit-outer-spin-button,#spdbox input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
#spdbox .sf{display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:#8aa094}
#spdbox .sf b{color:#2fe68a;font-weight:700}
@media (max-width:1000px){body.spd-on #hud .pr{left:10px;transform:none;bottom:58px;max-width:calc(100vw - 260px)}}
@media (max-width:420px){#spdbox{width:184px;padding:10px 10px}#spdbox svg{width:164px;height:107px}#spdbox .sg{height:102px}#spdbox .sn{top:44px}#spdbox .sn b{font-size:28px}}`;
 document.head.appendChild(st)}
const SPD={el:null,car:-1,cur:-1,tg:-1,mx:-1};
function spdBuild(){const d=document.createElement('div');d.id='spdbox';
 /* 240-degree arc from -210 to 30 degrees, centre (92,76), radius 68 */
 const cx=92,cy=76,R=68,a0=-210,a1=30,pt=(a,r)=>[cx+Math.cos(a*Math.PI/180)*r,cy+Math.sin(a*Math.PI/180)*r],arc=(r,f)=>{const[x0,y0]=pt(a0,r),[x1,y1]=pt(a0+(a1-a0)*f,r);return`M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${(a1-a0)*f>180?1:0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`};
 let ticks='';for(let i=0;i<=12;i++){const a=a0+(a1-a0)*i/12,[x0,y0]=pt(a,R-9),[x1,y1]=pt(a,R-(i%3?4:1));ticks+=`<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${i%3?'#4d5f56':'#8aa094'}" stroke-width="${i%3?1.5:2}"/>`}
 d.innerHTML=`<div class=sg><svg viewBox="0 0 184 120"><defs><linearGradient id=spdgr x1=0 x2=1><stop offset=0 stop-color="#2fe68a"/><stop offset=".7" stop-color="#f5c542"/><stop offset="1" stop-color="#ff5a5a"/></linearGradient></defs>
  <path d="${arc(R,1)}" fill=none stroke="#26302a" stroke-width=8 stroke-linecap=butt /><path id=spdarc d="${arc(R,1)}" fill=none stroke="url(#spdgr)" stroke-width=8 stroke-linecap=butt pathLength=100 stroke-dasharray="0 100"/>
  ${ticks}<g id=spdtg><circle r=4 fill="#fff" stroke="#000" stroke-width=2 /></g></svg>
  <div class=sn><b id=spdnum>0</b><small>MPH</small></div></div>
  <div class=sc><span class=sl>TARGET</span><button id=spdm title="Slower (5 mph)">−</button><input id=spdin type=number inputmode=numeric min=1 step=1 aria-label="Target speed in mph"><button id=spdp title="Faster (5 mph)">+</button></div>
  <div class=sf><span id=spdcar></span><span>max <b id=spdmx>0</b> mph</span></div>`;
 document.body.appendChild(d);SPD.el=d;SPD.arcR=R;SPD.pt=pt;SPD.a0=a0;SPD.a1=a1;
 const inp=d.querySelector('#spdin'),apply=()=>{if(!dr)return;const v=setCarTgt(dr.i,inp.value);inp.value=v;SPD.tg=-1},
  nudge=s=>{if(!dr)return;const v=setCarTgt(dr.i,carTgt(dr.i)+s);inp.value=v;SPD.tg=-1;snd('click')};
 inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key=='Enter'){apply();inp.blur()}else if(e.key=='Escape'){inp.value=dr?carTgt(dr.i):'';inp.blur()}
  else if(e.key.length==1&&!/[0-9]/.test(e.key)&&!e.ctrlKey&&!e.metaKey)e.preventDefault()});
 inp.addEventListener('keyup',e=>e.stopPropagation());
 inp.addEventListener('input',()=>{const m=dr?carMax(dr.i):999;if(+inp.value>m)inp.value=m});
 inp.addEventListener('change',apply);inp.addEventListener('blur',apply);
 /* clicking into the box lets go of held driving keys, so the car does not keep accelerating while you type */
 inp.addEventListener('focus',()=>{for(const k in keys)delete keys[k];inp.select()});
 d.querySelector('#spdm').addEventListener('click',e=>{nudge(e.shiftKey?-1:-5);e.currentTarget.blur()});
 d.querySelector('#spdp').addEventListener('click',e=>{nudge(e.shiftKey?1:5);e.currentTarget.blur()});
 d.addEventListener('pointerdown',e=>e.stopPropagation());d.addEventListener('wheel',e=>e.stopPropagation(),{passive:true})}
function spdTick(){const on=mode=='drive'&&!!dr&&!PAUSED;if(!SPD.el){if(!on)return;spdBuild()}const d=SPD.el;
 if(!on){if(d.style.display!='none'){d.style.display='none';document.body.classList.remove('spd-on');const ae=document.activeElement;if(ae&&ae.id=='spdin')ae.blur()}SPD.car=-1;return}
 if(d.style.display!='block'){d.style.display='block';document.body.classList.add('spd-on')}
 const i=dr.i,mx=carMax(i),tg=carTgt(i),inp=d.querySelector('#spdin'),focus=document.activeElement===inp;
 if(SPD.car!==i){SPD.car=i;SPD.tg=-1;SPD.cur=-1;d.querySelector('#spdcar').textContent=CARS[i].n;d.querySelector('#spdmx').textContent=mx;inp.max=mx}
 if(SPD.tg!==tg&&!focus){SPD.tg=tg;inp.value=tg;const a=SPD.a0+(SPD.a1-SPD.a0)*tg/mx,[x,y]=SPD.pt(a,SPD.arcR);d.querySelector('#spdtg').setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`)}
 const cur=Math.round(wMph(Math.abs(dr.v)));if(cur!==SPD.cur){SPD.cur=cur;d.querySelector('#spdnum').textContent=cur;d.querySelector('#spdarc').setAttribute('stroke-dasharray',`${Math.min(100,cur/mx*100).toFixed(1)} 100`)}}
{const u=update;update=function(dt){u(dt);try{spdTick()}catch(e){}}}
/* the pause menu stops update(), so hide the box when the game pauses */
{const p0=pauseGame;pauseGame=function(){p0.apply(this,arguments);try{spdTick()}catch(e){}}}

/* ---- v26.145: forgiving car collisions ----
   Car-shaped hitbox (was a 2.6 m square), slide along walls instead of braking to a stop, and if the car ever ends up
   inside a wall or prop it is nudged out to the nearest free spot so reversing always works. */
/* the hitbox is the car's real length x width (CSPEC, times the model scale) as a row of overlapping circles along its heading */
function drvBox(){const S=(typeof CSPEC!='undefined'&&CSPEC[dr.i])||{L:2.4,W:1},k=(dr.m&&dr.m.scale&&dr.m.scale.x)||1.5;return{hl:S.L*k/2,hw:S.W*k/2*.88}}
function drvFree(x,z,h){const{hl,hw}=drvBox(),sx=Math.sin(h===undefined?dr.h:h),cz=Math.cos(h===undefined?dr.h:h),e=hl-hw,n=Math.max(1,Math.ceil(e/(hw*.9)));
 for(let k=-n;k<=n;k++){const o=e*k/n;if(hit(x+sx*o,z+cz*o,hw))return false}return true}
function drvUnstick(){if(drvFree(dr.x,dr.z))return;
 for(let r=.25;r<=3.5;r+=.25)for(let k=0;k<16;k++){const a=k*Math.PI/8,x=dr.x+Math.cos(a)*r,z=dr.z+Math.sin(a)*r;if(drvFree(x,z)){dr.x=x;dr.z=z;dr.v*=.5;return}}}
function drvMove(dt){drvUnstick();
 const ns=Math.max(1,Math.ceil(Math.abs(dr.v)*dt/.4));let bump=0;
 for(let q=0;q<ns;q++){const sx=Math.sin(dr.h)*dr.v*dt/ns,sz=Math.cos(dr.h)*dr.v*dt/ns,nx=dr.x+sx,nz=dr.z+sz;
  if(drvFree(nx,dr.z)&&!tcB(dr.x,dr.z,nx,dr.z))dr.x=nx;else if(sx)bump=Math.max(bump,Math.abs(sx)/(Math.abs(sx)+Math.abs(sz)||1));
  if(drvFree(dr.x,nz)&&!tcB(dr.x,dr.z,dr.x,nz))dr.z=nz;else if(sz)bump=Math.max(bump,Math.abs(sz)/(Math.abs(sx)+Math.abs(sz)||1))}
 /* only lose speed in proportion to how head-on the hit was, so glancing walls slide */
 if(bump)dr.v*=1-Math.min(.6,bump*6*dt)}
