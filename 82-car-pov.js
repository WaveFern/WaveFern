/* ---------- v26.62: first-person car view ----------
   While driving you sit in the driver's seat: a windscreen view of the road, A-pillars, a wing mirror on each side,
   a rear-view mirror, the dashboard and instrument cluster, and a steering wheel with both hands on it that turns with A / D.
   The car's own body is hidden from inside. The speed box, the target speed and the Exit key work as before.
   Nothing here is saved. */
const POV={ang:0,el:null};
const POVC=new THREE.PerspectiveCamera(72,1,.05,600);
{const st=document.createElement('style');st.textContent=`
#pov{position:fixed;inset:0;z-index:2;pointer-events:none;display:none}
#pov svg{width:100%;height:100%;display:block}
#pov .pw{transform-box:view-box;transform-origin:800px 905px}`;document.head.appendChild(st)}
function povBuild(){const d=document.createElement('div');d.id='pov';
 const hands=`<g fill="#c08a68" stroke="#7a4d33" stroke-width="3">
   <path d="M560 640 Q598 620 612 660 L650 830 Q640 860 606 862 Q586 856 580 828 Z"/>
   <path d="M1040 640 Q1002 620 988 660 L950 830 Q960 860 994 862 Q1014 856 1020 828 Z"/></g>
   <g fill="#2a2f35"><path d="M575 826 L612 828 L620 905 L580 905 Z"/><path d="M1025 826 L988 828 L980 905 L1020 905 Z"/></g>`;
 d.innerHTML=`<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
  <defs>
   <linearGradient id=povdash x1=0 y1=0 x2=0 y2=1><stop offset=0 stop-color="#262c33"/><stop offset=1 stop-color="#101418"/></linearGradient>
   <linearGradient id=povmir x1=0 y1=0 x2=1 y2=1><stop offset=0 stop-color="#8a9aa6"/><stop offset=.5 stop-color="#4b5963"/><stop offset=1 stop-color="#1a2127"/></linearGradient>
   <linearGradient id=povrim x1=0 y1=0 x2=0 y2=1><stop offset=0 stop-color="#4a525b"/><stop offset=1 stop-color="#1b1f24"/></linearGradient>
   <radialGradient id=povdial cx=.5 cy=.5 r=.5><stop offset=0 stop-color="#11161b"/><stop offset=1 stop-color="#050607"/></radialGradient>
  </defs>
  <!-- frame around the windscreen: the opening lets the 3D road show through -->
  <path fill="#0b0e11" fill-rule="evenodd" d="M0 0H1600V900H0Z M330 0H1270L1470 610H130Z"/>
  <!-- A-pillar edges -->
  <path d="M330 0 L130 610 L100 600 L300 0 Z" fill="#20252b"/><path d="M1270 0 L1470 610 L1500 600 L1300 0 Z" fill="#20252b"/>
  <!-- side windows: a faint tint over the outside world -->
  <path d="M0 0 H300 L110 600 H0Z" fill="#ffffff08"/><path d="M1300 0 H1600 V600 H1490Z" fill="#ffffff08"/>
  <!-- rear-view mirror -->
  <path d="M1190 6 Q1200 0 1215 0 H1545 Q1562 0 1566 16 L1572 120 Q1572 150 1540 152 H1218 Q1190 150 1190 120Z" fill="#121517"/>
  <rect x=1212 y=16 width=336 height=118 rx=18 fill="url(#povmir)"/>
  <path d="M1240 110 L1300 40 L1332 40 L1270 110Z" fill="#ffffff1c"/>
  <!-- left wing mirror -->
  <path d="M-10 448 Q40 418 120 430 Q180 436 210 480 L210 590 Q170 620 100 618 L-10 618Z" fill="#14181c" stroke="#2a3036" stroke-width="3"/>
  <path d="M14 462 Q60 440 118 452 L118 600 Q60 606 14 590Z" fill="url(#povmir)"/>
  <path d="M30 520 L70 486 L92 486 L50 530Z" fill="#ffffff1a"/>
  <!-- dashboard -->
  <path d="M0 640 Q800 596 1600 640 L1600 900 L0 900Z" fill="url(#povdash)"/>
  <path d="M0 640 Q800 596 1600 640" fill=none stroke="#3b444d" stroke-width=3 />
  <g fill="#0a0c0e"><circle cx=500 cy=700 r="26"/><circle cx=1100 cy=700 r="26"/></g>
  <g fill="#2e353c"><circle cx=500 cy=700 r="18"/><circle cx=1100 cy=700 r="18"/></g>
  <!-- instrument cluster: hood, two dials, a centre screen -->
  <path d="M560 612 Q800 586 1040 612 L1060 706 Q800 720 540 706Z" fill="#0c0f12"/>
  <circle cx=640 cy=672 r=68 fill="url(#povdial)" stroke="#2b3238" stroke-width="3"/>
  <circle cx=960 cy=672 r=68 fill="url(#povdial)" stroke="#2b3238" stroke-width="3"/>
  <g id=povsp stroke="#e8f3ec" stroke-width=3 fill=none><path d="M600 690 A46 46 0 0 1 680 660" stroke="#2fe68a"/></g>
  <line x1=640 y1=672 x2=672 y2=630 stroke="#ff5a5a" stroke-width=3 stroke-linecap="round"/>
  <line x1=960 y1=672 x2=986 y2=634 stroke="#f5c542" stroke-width=3 stroke-linecap="round"/>
  <rect x=728 y=634 width=144 height=60 rx=8 fill="#0a1510" stroke="#1d3a2b" stroke-width="2"/>
  <text x=800 y=672 text-anchor=middle font-family="ui-monospace,Menlo,monospace" font-size=20 fill="#2fe68a">FW·DRIVE</text>
  <!-- air vents and centre console -->
  <g fill=none stroke="#3a434c" stroke-width=6><circle cx=300 cy=680 r="34"/><circle cx=1300 cy=680 r="34"/></g>
  <path d="M1190 720 L1420 720 L1420 900 L1200 900Z" fill="#101316" stroke="#2a3138" stroke-width="3"/>
  <rect x=1222 y=738 width=168 height=92 rx=8 fill="#05070a" stroke="#1f2a33" stroke-width="2"/>
  <path d="M1244 800 L1270 770 L1298 790 L1330 760 L1366 786" stroke="#2fe68a" stroke-width=3 fill=none opacity=".8"/>
  <!-- steering wheel: turns with A / D; the hands turn with it -->
  <g id=povwheel class=pw>
   <circle cx=800 cy=905 r=262 fill=none stroke="url(#povrim)" stroke-width="44"/>
   <circle cx=800 cy=905 r=240 fill=none stroke="#3b4148" stroke-width=2 opacity=".7"/>
   <path d="M560 880 L1040 880 L1040 930 L560 930Z" fill="#171b20"/>
   <circle cx=800 cy=905 r=86 fill="#15191d" stroke="#2c323a" stroke-width="4"/>
   <ellipse cx="800" cy="905" rx="42" ry="24" fill="#2a3038" stroke="#6b7480" stroke-width="3"/>
    <g>${hands}</g>
  </g>
 </svg>`;
 document.body.appendChild(d);POV.el=d}
/* the first-person camera: eye height about 1.2 m, just ahead of the car's centre, looking down the bonnet */
function povPlace(){const h=dr.h,fx=Math.sin(h),fz=Math.cos(h),ex=dr.x+fx*.25,ez=dr.z+fz*.25;
 POVC.position.set(ex,1.2,ez);POVC.lookAt(ex+fx*40,1.0,ez+fz*40)}
function povTurn(){const steer=(keys.a||keys.arrowleft?1:0)-(keys.d||keys.arrowright?1:0),want=-steer*35;POV.ang+=(want-POV.ang)*.18;
 if(POV.el){const w=POV.el.querySelector('#povwheel');if(w)w.setAttribute('transform',`rotate(${POV.ang.toFixed(1)} 800 905)`)}}
/* while driving, render from the driver's seat (the car's own body is hidden from inside); otherwise the usual camera */
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){
 const on=mode=='drive'&&!!dr&&dr.m&&!PAUSED;
 if(!POV.el&&on)povBuild();
 if(POV.el)POV.el.style.display=on?'block':'none';
 if(!on)return r0(sc,c);
 POVC.aspect=innerWidth/innerHeight;POVC.updateProjectionMatrix();
 const vis=dr.m.visible;dr.m.visible=false;povPlace();povTurn();r0(sc,POVC);dr.m.visible=vis}}
