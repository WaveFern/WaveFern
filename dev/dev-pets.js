/* WaveFern dev pets pack. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   1. Four more pets with the same rigged, animated models as the first four: Bunny, Husky, Owl and Red Panda.
   2. Every pet now gives a small gameplay upgrade (Dog: faster, Cat: cheaper recording, Parrot: more streams, Fox: stamina,
      Bunny: stamina recovery, Husky: faster sprint, Owl: more followers, Red Panda: more song income). The first thing you see
      in the Pets app and in Upgrades. Each pet still adds +1 song quality; you can keep three.
   No glow, no bright lights: plain lit boxes only, like the rest of the pets (58-pets.js). Add ?nopets to the address to skip it.
   Saves: the pets list is the same list of numbers as before (0 to 3 are the old pets, 4 to 7 the new ones). */
(function(){
 if(!window.FW_FEAT)return;
 if(/[?&]nopets/.test(location.search))return;
 if(typeof PETS=='undefined'||typeof ptQuad=='undefined'||typeof ptSpecGet=='undefined')return;

 /* ---------- catalogue ---------- */
 PETS.push(['Bunny',350],['Husky',600],['Night Owl',750],['Red Panda',1200]);
 PETC.push('#cdb9a3','#6f7782','#8b6a47','#c4562a');
 const PERK=[
  ['Light paws','Recording a song costs 3 less energy.'],
  ['Walkies','You walk and run 12% faster.'],
  ['Chatterbox','+8% streams on every song.'],
  ['Quick feet','Sprinting uses 30% less stamina.'],
  ['Spring in your step','Stamina comes back 60% faster.'],
  ['Sled dog','You sprint 20% faster.'],
  ['Night shift','+15% new followers every day.'],
  ['Good company','+6% income from your songs.']
 ];
 window.PET_PERK=PERK;
 const has=i=>{try{return (S.pets||[]).includes(i)}catch(e){return false}};

 /* ---------- model parts ---------- */
 const mkPart=S=>(n,par,p,f,eye)=>{const L=[];f(L);S[n]={n,par,p,L,eye}};
 const sides=[[-1,1],[1,1],[-1,-1],[1,-1]];

 function bunny(){const S={},part=mkPart(S),c='#cdb9a3',dk='#9c8068',lt='#f6efe6',pk='#e7a0ae',ey='#2a1a14';
  part('body','R',[0,.3,0],L=>{pbx(L,c,.25,.23,.38,0,.3,.02);pbx(L,c,.3,.25,.22,0,.31,-.13);pbx(L,c,.22,.2,.14,0,.29,.2);
   pbx(L,lt,.17,.04,.34,0,.185,.02);pbx(L,lt,.14,.13,.03,0,.3,.275);pbx(L,dk,.12,.012,.34,0,.43,-.02);
   [-1,1].forEach(s=>pbx(L,dk,.012,.1,.16,s*.152,.33,-.13))});
  part('head','R',[0,.38,.22],L=>{pbx(L,c,.2,.18,.2,0,.47,.3);pbx(L,c,.22,.1,.14,0,.43,.3);pbx(L,lt,.14,.09,.09,0,.44,.4);pbx(L,lt,.2,.05,.1,0,.4,.34);
   ptp(L,pk,.04,.03,.02,0,.465,.447,.028,.015);pbx(L,'#6b3b3b',.004,.03,.006,0,.43,.45);pbx(L,'#6b3b3b',.05,.006,.006,0,.415,.45);
   [-1,1].forEach(s=>{pbx(L,'#fff',.1,.004,.004,s*.1,.45,.44,0,0,s*.12);pbx(L,'#fff',.1,.004,.004,s*.1,.43,.44,0,0,-s*.1)});
   pbx(L,dk,.05,.012,.1,0,.565,.3)});
  part('eyes','head',[0,.5,.395],L=>[-1,1].forEach(s=>{pbx(L,ey,.05,.055,.01,s*.082,.495,.397);pbx(L,'#fff',.016,.016,.01,s*.082+s*.01,.512,.402)}),1);
  [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.055,.55,.26],L=>{ptp(L,c,.075,.32,.03,s*.07,.72,.26,.055,.025,s*.01,0,0,0,s*.1);ptp(L,pk,.04,.24,.01,s*.07,.715,.276,.03,.008,s*.01,0,0,0,s*.1);pbx(L,dk,.06,.03,.032,s*.095,.88,.26,0,0,s*.1)}));
  part('tail0','R',[0,.34,-.26],L=>{pbx(L,lt,.11,.11,.09,0,.35,-.3);pbx(L,lt,.08,.08,.05,0,.36,-.36)});
  sides.forEach(([s,f],i)=>part('leg'+i,'R',[s*.075,.2,f*.14],L=>{const x=s*.075,z=f*.14;
   if(f>0){pbx(L,c,.06,.2,.06,x,.1,z);pbx(L,lt,.064,.05,.08,x,.025,z+.01)}else{pbx(L,c,.08,.07,.1,x,.22,z);pbx(L,c,.06,.04,.2,x,.02,z+.05);pbx(L,lt,.066,.04,.07,x,.02,z+.14)}}));
  return S}

 function husky(){const S={},part=mkPart(S),c='#6f7782',dk='#3d434b',wt='#f4f5f6',ey='#6ab4e8';
  part('body','R',[0,.42,0],L=>{pbx(L,c,.36,.3,.72,0,.42,0);pbx(L,c,.37,.32,.2,0,.43,.26);pbx(L,c,.37,.28,.2,0,.42,-.26);
   pbx(L,wt,.26,.04,.56,0,.268,0);pbx(L,wt,.24,.24,.03,0,.42,.371);pbx(L,dk,.375,.09,.62,0,.57,-.02);pbx(L,dk,.2,.012,.5,0,.62,-.02);
   pbx(L,c,.2,.18,.16,0,.58,.37);pbx(L,'#8a2b2b',.235,.05,.19,0,.6,.38);pbx(L,'#c9ced6',.03,.03,.02,0,.585,.478)});
  part('head','R',[0,.62,.42],L=>{pbx(L,dk,.28,.26,.26,0,.75,.5);pbx(L,dk,.3,.12,.2,0,.69,.5);
   pbx(L,wt,.2,.19,.03,0,.72,.64);pbx(L,wt,.15,.12,.19,0,.66,.69);pbx(L,wt,.24,.07,.1,0,.65,.6);
   ptp(L,'#1a1414',.08,.05,.04,0,.7,.79,.065,.035);[-1,1].forEach(s=>pbx(L,'#000',.012,.012,.006,s*.018,.69,.812));
   pbx(L,'#3a2a20',.004,.03,.008,0,.655,.782);pbx(L,'#3a2a20',.1,.008,.008,0,.64,.782);
   [-1,1].forEach(s=>{pbx(L,wt,.04,.025,.01,s*.075,.85,.64);pbx(L,wt,.012,.07,.1,s*.145,.69,.57)});pbx(L,wt,.04,.15,.01,0,.78,.64)});
  part('eyes','head',[0,.775,.642],L=>[-1,1].forEach(s=>{pbx(L,'#fff',.066,.052,.008,s*.075,.775,.642);pbx(L,ey,.052,.05,.01,s*.077,.775,.645);pbx(L,'#000',.024,.026,.01,s*.077,.775,.649);pbx(L,'#fff',.014,.014,.01,s*.077+s*.014,.789,.652)}),1);
  [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.1,.86,.5],L=>{ptp(L,dk,.1,.17,.05,s*.1,.945,.5,.012,.02,s*-.01,0);ptp(L,'#c9a9a4',.06,.12,.01,s*.1,.935,.522,.008,.01,s*-.006,0)}));
  part('tongue','head',[0,.64,.74],L=>{pbx(L,'#ef7b8f',.06,.012,.07,0,.625,.77,.5);pbx(L,'#d65a70',.008,.013,.05,0,.627,.77,.5)});
  part('tail0','R',[0,.55,-.36],L=>pseg(L,c,[0,.55,-.36],[0,.74,-.5],.11,.11));
  part('tail1','tail0',[0,.74,-.5],L=>{pseg(L,c,[0,.74,-.5],[0,.88,-.4],.11,.1);pseg(L,wt,[0,.86,-.42],[0,.92,-.34],.09,.05)});
  sides.forEach(([s,f],i)=>part('leg'+i,'R',[s*.11,.33,f*.24],L=>{const x=s*.11,z=f*.24;
   if(f<0)pbx(L,c,.13,.17,.19,x,.32,z);else pbx(L,c,.12,.12,.14,x,.34,z);pbx(L,c,.1,.3,.1,x,.17,z);pbx(L,wt,.104,.1,.104,x,.07,z);pbx(L,wt,.115,.05,.135,x,.025,z+.015);
   [-.02,.02].forEach(dx=>pbx(L,'#9aa0a8',.006,.022,.012,x+dx,.025,z+.083))}));
  return S}

 function owl(){const S={},part=mkPart(S),c='#8b6a47',dk='#5c4430',lt='#e9d8bb',fd='#f1e4cc',bk='#e0a93a';
  part('body','R',[0,.36,0],L=>{ptp(L,c,.34,.46,.3,0,.36,0,.3,.26,0,-.01);pbx(L,lt,.24,.34,.03,0,.34,.15);
   [.22,.3,.38,.46].forEach((yy,i)=>[-.07,0,.07].forEach(x=>pbx(L,dk,.04,.012,.01,x+(i%2?.035:0),yy-.04+.0,.168)));
   pbx(L,dk,.2,.3,.02,0,.36,-.14);[.2,.3,.4].forEach(yy=>pbx(L,c,.22,.02,.022,0,yy,-.152))});
  part('head','R',[0,.58,0],L=>{pbx(L,c,.34,.2,.28,0,.69,0);pbx(L,c,.3,.07,.24,0,.6,0);pbx(L,fd,.27,.17,.03,0,.69,.145);pbx(L,dk,.03,.1,.034,0,.66,.147);
   pseg(L,bk,[0,.69,.16],[0,.63,.215],.055,.012,.05,.012);pbx(L,'#a7761c',.012,.014,.02,0,.652,.2);
   [-1,1].forEach(s=>pbx(L,dk,.012,.1,.2,s*.173,.68,.0))});
  part('eyes','head',[0,.72,.15],L=>[-1,1].forEach(s=>{pbx(L,dk,.105,.105,.01,s*.078,.715,.152);pbx(L,'#f2c22a',.085,.085,.01,s*.078,.715,.156);pbx(L,'#111',.046,.05,.01,s*.078,.715,.16);pbx(L,'#fff',.015,.015,.01,s*.078+s*.014,.732,.164)}),1);
  [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.11,.78,0],L=>{ptp(L,dk,.07,.14,.05,s*.115,.86,0,.012,.03,s*.012,0,0,0,s*.12)}));
  [-1,1].forEach((s,i)=>part('wing'+i,'R',[s*.17,.54,-.01],L=>{const x=s*.185;ptp(L,dk,.05,.42,.2,x,.36,-.04,.04,.18,0,-.04);ptp(L,c,.054,.36,.16,x,.37,-.02,.04,.12,0,-.04);
   [.5,.4,.3,.2].forEach((yy,j)=>pbx(L,lt,.056,.012,.16-j*.01,x,yy,-.03-j*.012))}));
  part('tail0','R',[0,.2,-.13],L=>{pseg(L,c,[0,.22,-.13],[0,.06,-.26],.17,.12,.07,.05);[.17,.12,.08].forEach((yy,j)=>pbx(L,dk,.15-j*.02,.012,.04,0,yy,-.17-j*.035))});
  [-1,1].forEach((s,i)=>part('leg'+i,'R',[s*.075,.13,.02],L=>{const x=s*.075;pbx(L,'#d9a638',.04,.12,.04,x,.07,.03);
   [-1,0,1].forEach(t=>pbx(L,'#c99a30',.016,.02,.07,x+t*.018,.012,.07));pbx(L,lt,.1,.04,.1,x,.14,.02)}));
  return S}

 function panda(){const S={},part=mkPart(S),c='#c4562a',dk='#2d1f1a',wt='#fbf3e8',lc='#e0803f';
  part('body','R',[0,.3,0],L=>{pbx(L,c,.26,.22,.5,0,.3,0);pbx(L,c,.27,.22,.18,0,.31,-.16);pbx(L,c,.25,.2,.16,0,.3,.18);
   pbx(L,dk,.2,.04,.42,0,.19,0);pbx(L,dk,.2,.16,.03,0,.28,.265);pbx(L,lc,.14,.012,.44,0,.416,0);[-1,1].forEach(s=>pbx(L,lc,.012,.06,.4,s*.132,.37,0))});
  part('head','R',[0,.4,.24],L=>{pbx(L,c,.24,.2,.2,0,.5,.32);pbx(L,wt,.32,.09,.12,0,.46,.33);pbx(L,wt,.13,.09,.1,0,.46,.43);pbx(L,wt,.2,.03,.02,0,.58,.42);
   ptp(L,'#161010',.045,.035,.03,0,.485,.485,.03,.02);pbx(L,'#4a3030',.004,.025,.008,0,.455,.488);
   [-1,1].forEach(s=>{pbx(L,wt,.04,.03,.01,s*.075,.585,.422);pbx(L,dk,.014,.08,.01,s*.058,.5,.421,0,0,s*.1)})});
  part('eyes','head',[0,.53,.42],L=>[-1,1].forEach(s=>{pbx(L,'#111',.05,.055,.01,s*.07,.535,.423);pbx(L,'#fff',.014,.014,.01,s*.07+s*.01,.553,.428)}),1);
  [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.09,.6,.3],L=>{ptp(L,c,.1,.1,.05,s*.1,.67,.3,.07,.03,s*.012,0);ptp(L,wt,.07,.07,.01,s*.1,.665,.322,.045,.008,s*.01,0)}));
  part('tail0','R',[0,.32,-.24],L=>{pseg(L,c,[0,.32,-.24],[0,.44,-.46],.13,.17,.13,.17);pseg(L,dk,[0,.37,-.34],[0,.39,-.38],.18,.18,.18,.18)});
  part('tail1','tail0',[0,.44,-.46],L=>{pseg(L,c,[0,.44,-.46],[0,.46,-.7],.17,.17,.17,.17);pseg(L,dk,[0,.45,-.55],[0,.45,-.59],.18,.18,.18,.18);pseg(L,dk,[0,.46,-.66],[0,.46,-.7],.18,.18,.18,.18)});
  part('tail2','tail1',[0,.46,-.7],L=>{pseg(L,c,[0,.46,-.7],[0,.4,-.93],.17,.13,.17,.13);pseg(L,dk,[0,.44,-.78],[0,.43,-.82],.175,.17,.175,.17);pseg(L,dk,[0,.41,-.88],[0,.4,-.93],.14,.13,.14,.13)});
  sides.forEach(([s,f],i)=>part('leg'+i,'R',[s*.09,.2,f*.16],L=>{const x=s*.09,z=f*.16;pbx(L,dk,.09,.2,.09,x,.1,z);pbx(L,dk,.1,.04,.12,x,.02,z+.012);
   [-.025,0,.025].forEach(dx=>pbx(L,'#e8e0d0',.008,.014,.012,x+dx,.02,z+.075))}));
  return S}

 const NEW={4:bunny,5:husky,6:owl,7:panda};
 {const g0=ptSpecGet;ptSpecGet=function(k){if(!NEW[k])return g0(k);if(PTSP[k])return PTSP[k];const S=NEW[k]();for(const n in S){const s=S[n];s.L=s.L.filter(r=>r[4]>0);s.geo=ptGeo(s.L,s.p)}return PTSP[k]=S}}

 /* ---------- animation on top of the shared one ---------- */
 {const a0=petAnim;petAnim=function(g,dt){a0.apply(this,arguments);const r=g.userData.pr;if(!r||r.k<4)return;const P=r.P,t=r.t,m=r.mv,s=Math.sin(r.ph);
  if(r.k==4){/* hops with all four feet together */
   r.legs.forEach((l,i)=>l.rotation.x=(i<2?1:-1)*s*.55*m);r.R.position.y=Math.abs(Math.sin(r.ph))*.09*m;r.R.rotation.x=-Math.cos(r.ph)*.1*m;
   if(P.tail0)P.tail0.rotation.x=Math.sin(t*5+r.sd)*.04*(1-m)}
  else if(r.k==5){const w=Math.sin(t*(2.4+m*2)+r.sd)*(.18+.1*m);if(P.tail0)P.tail0.rotation.y=w;if(P.tail1)P.tail1.rotation.y=w*.7}
  else if(r.k==6){/* waddles, and turns its head a long way round */
   const q=(1-m);if(P.head){P.head.rotation.y=Math.sin(t*.28+r.sd)*1.1*q*Math.min(1,Math.abs(Math.sin(t*.28+r.sd))*3);P.head.rotation.z=Math.sin(t*.28+r.sd+1.2)*.12*q}
   r.R.rotation.z=s*.1*m;r.R.position.y=Math.abs(s)*.015*m;
   [P.leg0,P.leg1].forEach((l,i)=>{if(l)l.rotation.x=(i?-1:1)*s*.7*m});
   [P.wing0,P.wing1].forEach((w,i)=>{if(w)w.rotation.z=(i?1:-1)*(.04+Math.max(0,Math.sin(t*.4+r.sd*3)-.92)*3+Math.abs(s)*.06*m)})}
  else if(r.k==7){const w=Math.sin(t*1.3+r.sd)*.16+s*.1*m;if(P.tail0)P.tail0.rotation.y=w;if(P.tail1)P.tail1.rotation.y=w*.9;if(P.tail2)P.tail2.rotation.y=w*1.1}}}

 /* ---------- upgrades ---------- */
 /* walking and running speed: after the normal step, move a little further along the same line (and only if that spot is free) */
 const spdMul=()=>{let m=1;if(has(1))m+=.12;if(has(5)&&typeof P!='undefined'&&(P.sv||0)>4.5)m+=.2;return m};
 {const u0=update;update=function(){const x=P.x,z=P.z,s0=+S.stam;u0.apply(this,arguments);
  try{if(mode=='play'){
   const m=spdMul(),mx=P.x-x,mz=P.z-z;
   if(m>1&&(mx||mz)&&Math.hypot(mx,mz)<.6){const dx=mx*(m-1),dz=mz*(m-1);
    if(!hit(P.x+dx,P.z,.28)&&!dynB(P.x,P.z,P.x+dx,P.z))P.x+=dx;if(!hit(P.x,P.z+dz,.28)&&!dynB(P.x,P.z,P.x,P.z+dz))P.z+=dz}
   if(isFinite(s0)&&isFinite(+S.stam)){const d=+S.stam-s0;
    if(d<0&&has(3))S.stam=Math.min(100,+S.stam-d*.3);
    else if(d>0&&has(4))S.stam=Math.min(100,+S.stam+d*.6)}}}catch(e){}}}
 /* recording costs less energy */
 {const s0=startRec;startRec=function(){const e=S.energy;const r=s0.apply(this,arguments);try{if(has(0)&&S.energy<e)S.energy=Math.min(100,S.energy+3)}catch(x){}return r}}
 /* more streams on every song: a little extra on top of each stream tick (kept apart from the plan so the normal count is not disturbed) */
 {let carry=0;const a0=addSt;addSt=function(s,k){a0.apply(this,arguments);try{if(has(2)&&k>0){carry+=k*.08;const b=Math.floor(carry);if(b>0){carry-=b;s.streams+=b;s.today=(s.today||0)+b;S.streams+=b;S.monthStreams=(S.monthStreams||0)+b}}}catch(e){}}}
 /* a new day: more followers (Owl) and more song income (Red Panda) */
 {const w0=wakeUp;wakeUp=function(){const f=+S.followers||0,e=+S.earn||0,r=w0.apply(this,arguments);
  try{if(has(6)){const d=(+S.followers||0)-f;if(d>0)S.followers+=Math.round(d*.15)}
   if(has(7)){const d=(+S.earn||0)-e;if(d>0){const b=+(d*.06).toFixed(2);S.earn=+(S.earn+b).toFixed(2);S.money=+(S.money+b).toFixed(2)}}}catch(x){}return r}}

 /* ---------- screens ---------- */
 PA.pets=()=>`<h1>Pets</h1><p class=m>Balance ${$$(S.money)}. Pets follow you, add +1 song quality each and give an upgrade. You can keep three.</p><div class=cards>${PETS.map((c,i)=>cardOf('p:'+i,c[0],'<b style="color:var(--t)">'+PERK[i][0]+'</b><br>'+PERK[i][1],S.pets.includes(i)?'<small class=m>Adopted</small>':`<button class=go ${S.money<c[1]||S.pets.length>=3?'disabled':''} onclick="book('pet',${i})">Book · ${$$(c[1])}</button>`)).join('')}</div>`;
 {const b0=buyX;buyX=function(t,i){const n=S.pets.length,r=b0.apply(this,arguments);try{if(t=='pet'&&S.pets.length>n&&PERK[i])say(PETS[i][0]+' joined you. '+PERK[i][0]+': '+PERK[i][1])}catch(e){}return r}}
 if(typeof upgradesView=='function'){const v0=window.upgradesView;window.upgradesView=function(){const r=v0.apply(this,arguments);
  try{const l=document.querySelector('#ui .upgl');if(l&&S.pets.length)S.pets.forEach(i=>{if(!PERK[i])return;const d=document.createElement('div');d.className='upgr';
   d.innerHTML='<div><b>'+PETS[i][0]+'</b><small>Pet</small></div><p>'+PERK[i][0]+': '+PERK[i][1]+'</p>';l.appendChild(d)})}catch(e){}return r}}
})();
