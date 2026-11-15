/* ===== v53.8.0: photoshoot guide for new players =====
   The brand photoshoot (223 deals, 224/225/239 HQ, 238 3D shoot) had no guidance. This file adds, without touching those files' logic:
   - BRD.obj(): the current objective as text, from the deal state (offer waiting, flight booked, abroad, HQ lobby, studio, shoot, flight home)
   - an objective chip at the top of the screen with that text (always, for any offer / booked shoot)
   - a guide beacon + line (the blue one of 214-guide-markers.js, via tutTgt) to the airport, the HQ front door, the studio door and the camera
   - step-by-step popups for the FIRST shoot only (until S.brands.done > 0, each shown once, remembered in S.brands.gd), and a
     "How it works" card for the 3D shoot panel (? button). BRD.guide() re-opens the overview any time (Brand Deals page button).
   Loads after 240 and after 214 (it wraps tutTgt again). */
(function(){
const BRD=window.BRD,D=window.DCITY;if(!BRD||!D)return;
const OX=D.OX,OZ=D.OZ;
const T=()=>window.TRAVEL,esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const first=()=>{const b=S.brands;return !(b&&b.done>0)};
const seen=k=>!!(S.brands&&S.brands.gd&&S.brands.gd[k]);
const mark=k=>{if(!S.brands)return;S.brands.gd=S.brands.gd||{};S.brands.gd[k]=1};
const act=()=>{try{return BRD.active()}catch(e){return null}};
const roomIs=k=>{try{return !!(D.on&&D.room&&D.C&&D.C.rooms&&D.room===D.C.rooms[k])}catch(e){return false}};
const here=o=>{try{return !!(T()&&T().loc()==o.d&&D.on&&D.id==o.d&&D.C)}catch(e){return false}};
const bookedTk=o=>{try{return T().st().tickets.find(q=>q.id===o.tk)||null}catch(e){return null}};
/* the ticket home the brand books after the shoot (co = brand id) */
const homeTk=()=>{try{if(!T()||!T().abroad())return null;return T().st().tickets.find(q=>q.co&&q.to=='home'&&q.st=='booked')||null}catch(e){return null}};
const findInt=re=>{try{return D.C.ints.find(q=>re.test(q.l||''))||null}catch(e){return null}};

/* ---------- the objective ---------- */
BRD.obj=function(){
 try{if(!S||!S.artist||!S.brands||!T())return null;
  if(BRD.shootOn)return{t:'Match the brief: pick a pose, face and light, press Shoot 4 times, choose your best frame, then Wrap and post to get paid.'};
  const o=act();
  if(!o){
   const h=homeTk();if(h)return{t:'Shoot done. Fly home: board '+h.fl+' (boards '+T().hm(h.dep-120)+', gate closes '+T().hm(h.dep-10)+'). The company car in the HQ lobby takes you to the airport.'};
   const f=BRD.open();if(f.length)return{t:'A brand wants to hire you. Open Messages on your phone, read the offer and tap Accept (or use Label HQ > Brand Deals).'};
   return null}
  const b=BRD.by(o.b),tk=bookedTk(o),ap=typeof window.apWhere=='function'?window.apWhere():'';
  if(here(o)){
   if(roomIs('brand'))return{t:'You are in the photo studio. Walk to the camera by the lights and press the action button on "Start the photoshoot".',tgt:()=>findInt(/^Start the photoshoot/)};
   if(roomIs('hq_lobby'))return{t:'You are in the '+b.n+' lobby. The photo studio is the door on the left: go through "Go to Photo studio".',tgt:()=>findInt(/^Go to Photo studio/)};
   if(D.room)return{t:'Go back to the lobby, then take the Photo studio door.',tgt:()=>findInt(/^(Go to Lobby|Back to the lobby)/)};
   if(ap)return{t:'Leave the airport through the main doors. The '+b.n+' HQ is the next stop.'};
   return{t:'Walk to the '+b.n+' HQ (the light beam shows the way) and go through the front door. You can also take the company car from the airport.',tgt:()=>({x:OX+D.C.hq.x,z:OZ+D.C.hq.z+1.7})}}
  if(T().loc()==o.d)return{t:'You landed. Leave the airport to reach the '+b.n+' HQ.'};
  if(tk&&tk.st=='booked'){
   const m='Go to the airport and board flight '+tk.fl+' to '+BRD.place(o)+' (boards '+T().hm(tk.dep-120)+', gate closes '+T().hm(tk.dep-10)+', '+BRD.dayWord({dep:tk.dep})+'). The brand paid, your ticket is already checked in.';
   if(ap)return{t:'Go to the gate and board flight '+tk.fl+' (gate '+tk.gate+', boards '+T().hm(tk.dep-120)+', closes '+T().hm(tk.dep-10)+'). Do not miss it or the shoot is lost.'};
   return{t:m,tgt:()=>(typeof IN!='undefined'&&IN)||(D.on)?null:{x:-328.4,z:20}}}
  return{t:'Your '+b.n+' shoot is booked. Fly to '+BRD.place(o)+'.'}
 }catch(e){return null}};

/* ---------- guide beacon + line: reuses the blue guide of 214 ---------- */
{const t1=tutTgt;tutTgt=function(){const r=t1.apply(this,arguments);if(r)return r;
 try{if(IN||(mode!='play'&&mode!='drive')||BRD.shootOn)return null;const q=BRD.obj();if(!q||!q.tgt)return null;const g=q.tgt();if(!g)return null;GDON=1;return{x:g.x,z:g.z}}catch(e){return null}}}

/* ---------- objective chip ---------- */
let chip=null,lastT='';
function mkChip(){const st=document.createElement('style');st.textContent='#bdobj{position:fixed;left:50%;top:44px;transform:translateX(-50%);z-index:3;max-width:min(520px,92vw);background:rgba(10,18,32,.86);color:#fff;border:2px solid #5aa8ff;border-radius:10px;padding:7px 12px;font:600 13px/1.35 system-ui,sans-serif;text-align:left;pointer-events:none;display:none}#bdobj b{display:block;font-size:10px;letter-spacing:.8px;color:#9fd0ff;margin-bottom:2px}@media(max-width:700px){#bdobj{top:auto;bottom:112px;font-size:12px}}'+
 '#bgbox{max-width:480px}#bgbox ol{margin:10px 0 10px 18px;padding:0;text-align:left}#bgbox li{margin:6px 0;line-height:1.4}#bgbox .bgk{color:#ffd84a;font-weight:700}'+
 '#b3gd{position:absolute;inset:0;z-index:20;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:14px}#b3gd>div{background:#14171a;color:#fff;border:2px solid #2ee59d;border-radius:12px;max-width:440px;padding:16px 18px;text-align:left;font:14px/1.45 system-ui,sans-serif}#b3gd h3{margin:0 0 8px;font-size:17px}#b3gd ol{margin:8px 0 12px 18px;padding:0}#b3gd li{margin:6px 0}#b3gd button{width:100%;padding:10px;border:0;border-radius:8px;background:#2ee59d;color:#04120a;font:700 14px system-ui,sans-serif;cursor:pointer}#b3q{margin-left:auto;width:28px;height:28px;border-radius:50%;border:1px solid #333a40;background:#20252a;color:#fff;font-weight:700;cursor:pointer}';
 document.head.appendChild(st);chip=document.createElement('div');chip.id='bdobj';document.body.appendChild(chip)}
setInterval(()=>{try{if(!chip){if(!document.body)return;mkChip()}
 const q=(mode=='play'||mode=='drive')&&!BRD.shootOn?BRD.obj():null;
 if(!q){chip.style.display='none';return}const t=q.t;if(t!==lastT){lastT=t;chip.innerHTML='<b>OBJECTIVE · BRAND PHOTOSHOOT</b>'+esc2(t)}chip.style.display='block'}catch(e){}},500);

/* ---------- popups ---------- */
const modal=h=>{mode='menu';$('ui').innerHTML=h};
const card=(title,sub,steps,btn)=>`<div class="box modal" id=bgbox><h2>${title}${sub?` <small>${sub}</small>`:''}</h2><ol>${steps.map(s=>`<li>${s}</li>`).join('')}</ol><div class=row2><button class=go onclick="closeUI()">${btn||'Got it'}</button></div></div>`;
const OVER=['<span class=bgk>Accept</span> the offer: Messages on your phone (the brand\'s chat) or Label HQ > Brand Deals. The brand then books and pays your flight, a company car and the flight home.',
 '<span class=bgk>Fly</span> to the brand\'s HQ in another country: go to the airport, board the checked-in flight on time (the objective at the top of the screen and a light beam show the way).',
 '<span class=bgk>Walk</span> to the HQ: take the company car or follow the beam to the front door, then the photo studio door in the lobby.',
 '<span class=bgk>Shoot</span> in the studio: use the camera, match the brief (mood and light), take 4 frames, wrap and post. The better the match, the bigger your fee.']
BRD.guide=function(){try{closeUI()}catch(e){}modal(card('How a brand photoshoot works','',OVER,'Close'))};
const POP=[
 ['offer',()=>BRD.open().length&&!act(),()=>card('A brand wants you!','Brand deal',OVER)],
 ['booked',()=>{const o=act();return o&&T()&&!T().abroad()&&!here(o)},()=>{const o=act(),tk=bookedTk(o);return card('Deal accepted. Next: the airport','Step 2 of 4',['Your flight'+(tk?' '+esc2(tk.fl)+' leaves at '+T().hm(tk.dep)+', gate '+tk.gate:'')+' is already booked and checked in. The brand pays for everything.','Walk to the <span class=bgk>airport</span> (blue light beam and line, or open the map). Board by '+(tk?T().hm(tk.dep-120):'the boarding time')+'; the gate closes '+(tk?T().hm(tk.dep-10):'10 minutes before departure')+'.','The objective at the top of the screen always tells you what to do next.'])}],
 ['hq',()=>{const o=act();return o&&here(o)&&!D.room&&!(typeof window.apWhere=='function'&&window.apWhere())},()=>card('You landed. Next: the brand HQ','Step 3 of 4',['Follow the <span class=bgk>blue light beam</span> to the HQ front door, or take the company car when it is offered.','Go through the door (press the action button at "Enter ... HQ"). The photo studio is the door on the left of the lobby.'])],
 ['lobby',()=>roomIs('hq_lobby')&&act(),()=>card('The HQ lobby','Step 3 of 4',['The <span class=bgk>photo studio</span> is the door on the left. Walk to "Go to Photo studio" (marked with the beam) and press the action button.','Ask reception if you get lost.'])],
 ['studio',()=>roomIs('brand')&&act()&&!BRD.shootOn,()=>card('The photo studio','Step 4 of 4',['Walk to the camera by the lights: the <span class=bgk>"Start the photoshoot"</span> prompt (marked with the beam).','Press the action button on it. A 3D studio opens where you pose, light and shoot the campaign.'])]
];
setInterval(()=>{try{if(!first()||mode!='play'||(typeof IN!='undefined'&&IN)||BRD.shootOn||!S.brands)return;
 const p=POP.find(q=>!seen(q[0])&&q[1]());if(!p)return;mark(p[0]);try{snd('ping')}catch(e){}modal(p[2]())}catch(e){}},1200);

/* ---------- inside the 3D shoot ---------- */
const SHOOT=()=>{const o=act();const b=o?BRD.by(o.b):null;return card('Your first photoshoot','Brief: '+(o?esc2(o.brief.mood)+' mood, '+esc2(o.brief.light)+' light':''),[
 'Read the <span class=bgk>brief</span> at the top right: it asks for a mood and a light.',
 'Tabs <span class=bgk>Pose, Face, Light</span>: pick options with a <span class=bgk>★</span>, they match the brief. Wear or hold the '+(b?esc2(b.n):'brand')+' product.',
 'Press <span class=bgk>Shoot</span> to take a frame (4 frames in total). The score shows under the picture and on the picture.',
 'Click your best frame, then <span class=bgk>Wrap and post</span>: you are paid and the photo goes on Instagrime.'],'Start shooting')};
function overlay(){const r=document.getElementById('b3');if(!r||r.querySelector('#b3gd'))return;
 const d=document.createElement('div');d.id='b3gd';
 d.innerHTML='<div><h3>Your first photoshoot</h3><ol>'+(SHOOT().match(/<li>[\s\S]*?<\/li>/g)||[]).join('')+'</ol><button id=b3gdok>Start shooting</button></div>';
 r.appendChild(d);d.querySelector('#b3gdok').onclick=()=>d.remove()}
{const b0=BRD.begin;BRD.begin=function(o){const r=b0.apply(this,arguments);
 try{setTimeout(()=>{const hd=document.querySelector('#b3 .b3hd');if(hd&&!hd.querySelector('#b3q')){const q=document.createElement('button');q.id='b3q';q.textContent='?';q.title='How it works';q.onclick=overlay;hd.appendChild(q)}
  if(first()&&!seen('shoot')){mark('shoot');overlay()}},60)}catch(e){}return r}}
})();
