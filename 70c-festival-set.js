/* Part 3 of 3 of the old 70-festival.js: performing a booked set, per-frame update, maps, taxi and morning card. */
/* ---- 9. performing a booked set (v26.39.0) ----
   Walk to the steps of your booked stage during your slot. The set plays the setlist song by song; each song lasts
   festDur(song) in-game minutes (30-55) and the game clock keeps running at its normal speed, so a full 4-hour slot is
   about 1.7 real minutes by day and 2.4 after 20:00. After each song you are paid FSONG_PAY x stage multiplier x the
   people in the crowd, and the crowd streams that song. The set ends when the last song ends, when the slot is over
   (the last song is paid for the part you played), or when you leave the stage. */
const FSONG_PAY=.08;
function festStageUse(n){const s=fStage(n),bk=festBkOn(S.day,n);
 if(bk&&bk.st==1){snd('pop');return say('You already played '+s.name+' today. Book your next slot on FestivalApp.')}
 if(!bk||bk.st){snd('pop');const a=festAct(s);return say((a?'On stage now: '+a+'. ':'')+'Want to play '+s.name+'? Book a slot on FestivalApp on your computer, at least 2 days before a festival.')}
 const m=festMins(),sl=FSLOT[bk.slot];
 if(m<sl[0]){snd('err');return say('Stage manager: "You\'re on at '+fHM(sl[0])+'. That\'s '+fDurS(sl[0]-m)+' from now. Grab a drink!"')}
 festStartBooked(bk)}
function festStartBooked(bk){const s=fStage(bk.n),list=bk.songs.map(id=>S.songs.find(x=>x.id==id)).filter(Boolean);
 if(!list.length){snd('err');return say('Your setlist is empty (those songs are gone). Edit it on FestivalApp.')}
 if(S.energy<15){snd('err');return say('Too tired to perform. Grab some food first (15 energy needed).')}
 S.energy-=15;$('ui').innerHTML='';const C0=festC0(s,list[0]);
 FEST.set={st:s,bk,list,i:0,song:list[0],sm:0,dur:festDur(list[0]),C0,C:C0*.45,T:C0*.6,start:Math.round(C0*.45),t:0,mg:null,next:R(4,6.5),sc:[],ss:[],last:'',beat:0,bt:0,songT:0,hype:.45,end:0,peak:0,
  pay:0,str:0,fol:0,done:[],fin:0,m0:festMins()};
 mode='fest';P.rot=0;festViewOn(s);festSongStart();snd('whoosh');setTimeout(()=>nz(2.2,900,.16,.6,'bandpass'),200)}
/* the next song in the setlist: the featured artist of a collab comes on for that song only */
function festSongStart(){const set=FEST.set,s=set.st,song=set.list[set.i];set.song=song;set.sm=0;set.ms0=festMins();set.ss=[];set.songT=0;set.dur=festDur(song);
 const c=festC0(s,song);set.T=Math.max(c*.15,set.T+(c-set.C0)*.6);set.C0=c;festStagePeople();s.scrK='';festScreens();
 if(set.i>0){nz(1.8,1000,.14,.5,'bandpass');if(typeof festShout=='function')festShout(pick(['ONE MORE SONG!','TUUUNE!','I LOVE THIS ONE!',(S.artist||'YOU').toUpperCase()+'!']),1)}}
function festSongDone(fr){const set=FEST.set,s=set.st,song=set.song,c=Math.round(set.C),mean=a=>a.reduce((x,y)=>x+y,0)/a.length,avg=set.ss.length?mean(set.ss):set.sc.length?mean(set.sc):.5,f=fr==null?1:fr;
 const pay=+(FSONG_PAY*s.mult*c*f).toFixed(2),st=Math.round(c*.1*(.5+avg)*f),fol=Math.round(c*.015*(.5+avg)*f);
 S.money=+(S.money+pay).toFixed(2);S.earn=(S.earn||0)+pay;S.followers=(S.followers||0)+FOLN(fol);S.interest=Math.min(1,(S.interest||0)+.004*s.mult*avg*f);
 /* the crowd streams the song afterwards: counted in today's streams (paid tomorrow morning) and this month's listeners */
 try{if(typeof planOf=='function')planOf(song);if(typeof mlInit=='function')mlInit();song.streams=(song.streams||0)+st;song.today=(song.today||0)+st;S.streams+=st;S.monthStreams=(S.monthStreams||0)+st}catch(e){console.error('fest streams',e)}
 set.pay=+(set.pay+pay).toFixed(2);set.str+=st;set.fol+=fol;set.done.push({t:song.title,c,pay,f,sc:Math.round(avg*100)});
 if(f>=1){snd('cash');nz(1.8,1100,.16,.5,'bandpass');setTimeout(()=>nz(1.4,1600,.1,.6,'bandpass'),300)}}
/* in-game minutes and real seconds left in the set (setlist or slot, whichever ends first) */
function festSetLeft(set){let m=set.dur-set.sm;for(let i=set.i+1;i<set.list.length;i++)m+=festDur(set.list[i]);m=Math.min(m,FSLOT[set.bk.slot][1]-festMins());
 return{m,s:m/((S.t<300?2.8:2)*(typeof DAYK!='undefined'?DAYK:1))}}
/* the performer, mic stands and the featured artist */
function festMic(x,y,z,ry){const g=new THREE.Group();B(g,.6,.05,.07,'#1a1a1a',0,.03,0);B(g,.07,.05,.6,'#1a1a1a',0,.03,0);B(g,.06,1.5,.06,'#b8bcc2',0,.76,0);B(g,.05,.05,.46,'#b8bcc2',0,1.5,-.2);B(g,.1,.22,.1,'#111',0,1.52,-.44);B(g,.13,.13,.13,'#9a9a9a',0,1.67,-.44);g.position.set(x,y,z);g.rotation.y=ry||0;return g}
function festStagePeople(){const v=festView3(),set=FEST.set,s=set.st,ft=set.song.ft;v.stageG.clear();set.ft=null;P.x=s.cx-(ft?.85:0);P.z=s.zf-1.9;
 const camX=s.cx-(ft?0:1.6),mic=x=>{const o=x<camX-.01?.45:-.45;v.stageG.add(festMic(x+o,s.h,s.zf-1.18,Math.atan2(o,.72)))};mic(P.x);
 if(ft){const a=ART.find(q=>q[0]==ft),o=buildChar(Object.assign({},a?a[4]:fCfg()));o.g.position.set(s.cx+.85,s.h,s.zf-1.9);v.stageG.add(o.g);mic(s.cx+.85);set.ft=o}}
function festViewOn(s){const v=festView3(),set=FEST.set;FEST.view=s;document.body.classList.add('fston');v.camX=null;
 v.sky.visible=v.back.visible=v.fx.visible=true;FEST.lg.visible=false;
 /* bubbles in front of the stage, light beams on the truss, the fans' banner */
 const b=v.bub.geometry.attributes.position;for(let i=0;i<b.count;i++)b.setXYZ(i,s.cx+R(-s.w*.9,s.w*.9),R(1.5,s.H+6),s.zf+R(1,s.n<3?60:30));b.needsUpdate=true;
 v.beams.forEach((m,i)=>{m.position.set(s.x0+(i+.5)*s.w/v.beams.length,s.H-1,s.zf+.6)});
 const cr=s.cr,k=Math.min(cr.f.length-1,Math.floor(Math.min(cr.f.length,set.C0)*.3)),p=cr.f[k];v.banner.position.set(p.x,2.4,p.z+.6);v.banner.rotation.y=Math.PI+Math.atan2(s.cx-p.x,s.oz-p.z)*.4;
 const tx=v.banner.userData.tex,x=tx.userData.x;x.fillStyle='#fff8e8';x.fillRect(0,0,512,128);x.fillStyle=s.col;x.textAlign='center';x.textBaseline='middle';fFit(x,'WE ♥ '+(S.artist||'YOU').toUpperCase(),0,70,480);x.fillText('WE ♥ '+(S.artist||'YOU').toUpperCase(),256,66);tx.needsUpdate=true;
 scene.fog.color.copy(v.hz);scene.fog.near=60;scene.fog.far=230;cr.C=set.C;cr.shown=-1;festScreens()}
function festViewOff(){const v=FEST.view3;FEST.view=null;document.body.classList.remove('fston');if(!v)return;v.sky.visible=v.back.visible=v.fx.visible=false;v.stageG.clear();FEST.lg.visible=FEST.ph=='fest';scene.fog.near=1e6;scene.fog.far=2e6}
/* stage-view only: perspective camera, sky dome, hazy tree line and hills that hide the town behind, bubbles, beams, banner */
function festView3(){if(FEST.view3)return FEST.view3;const v=FEST.view3={cam:new THREE.PerspectiveCamera(55,1,.1,330),stageG:new THREE.Group(),hz:new THREE.Color('#f1dfc0')};scene.add(v.stageG);
 const sg=new THREE.SphereGeometry(300,24,14),cA=[],P0=sg.attributes.position;for(let i=0;i<P0.count;i++)cA.push(1,1,1);sg.setAttribute('color',new THREE.Float32BufferAttribute(cA,3));
 v.sky=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));v.sky.renderOrder=-10;v.sky.frustumCulled=false;v.sky.visible=false;scene.add(v.sky);
 const G=fAll(),rnd=fRng(77),RR=(a,b)=>a+rnd()*(b-a),tree=(x,z,h)=>blkTree((w,hh,d,c,cx,cy,cz)=>xgBox(G,w,hh,d,c,cx,cy,cz),x,z,h/3.4,1);
 for(let x=140;x<470;x+=RR(2.5,4.5))tree(x,RR(-2,1),RR(8,13));for(let x=150;x<470;x+=RR(5,9))tree(x,RR(10,30),RR(12,18));
 for(let z=-150;z<0;z+=RR(3,5)){tree(RR(410,416),z,RR(8,13));tree(RR(208,212),z,RR(7,11))}for(let x=200;x<420;x+=RR(3,5))tree(x,RR(-132,-128),RR(8,13));
 for(let i=0;i<9;i++)xgPrism(G,RR(40,70),RR(10,25),RR(14,24),10,'#5e8a52',150+i*42,0,RR(60,110));
 v.back=new THREE.Group();fMerge(G,v.back);v.back.visible=false;scene.add(v.back);
 v.fx=new THREE.Group();v.fx.visible=false;scene.add(v.fx);
 const bt=fTex(32,32,(x)=>{const g=x.createRadialGradient(16,16,2,16,16,15);g.addColorStop(0,'rgba(255,255,255,.15)');g.addColorStop(.75,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32)});
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(260*3),3));v.bub=new THREE.Points(bg,new THREE.PointsMaterial({size:.45,map:bt,transparent:true,depthWrite:false,color:'#ffffff'}));v.bub.frustumCulled=false;v.fx.add(v.bub);v.bubV=[];for(let i=0;i<260;i++)v.bubV.push([R(-.3,.3),R(.15,.5),R(-.3,.3),R(0,6)]);
 v.beams=[];for(let i=0;i<6;i++){const g=new THREE.CylinderGeometry(.15,3.2,48,10,1,true);g.translate(0,-24,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:['#ff4a9a','#6ad5ff','#ffe066','#b07aff','#6ad5ff','#ff4a9a'][i],transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.userData.ph=i*1.1;v.beams.push(m);v.fx.add(m)}
 const tx=fTex(512,128,()=>{}),ban=new THREE.Group();const cl=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.9),new THREE.MeshLambertMaterial({map:tx,side:THREE.DoubleSide}));cl.position.y=.6;ban.add(cl);B(ban,.06,2.6,.06,'#888',-1.85,-.3,0);B(ban,.06,2.6,.06,'#888',1.85,-.3,0);ban.userData.tex=tx;v.banner=ban;v.fx.add(ban);
 return v}
function festSkyColours(v){const f=S.t<240?0:S.t<300?(S.t-240)/60*.5:S.t<330?.5+(S.t-300)/30*.4:.9,top=new THREE.Color('#79b6e6').lerp(new THREE.Color('#0a0f22'),f),hz=new THREE.Color('#f3dfbd').lerp(new THREE.Color('#3a2a5a'),f);
 if(v.f===Math.round(f*50))return;v.f=Math.round(f*50);v.hz.copy(hz);const g=v.sky.geometry,P0=g.attributes.position,C=g.attributes.color,c=new THREE.Color();
 for(let i=0;i<P0.count;i++){const y=P0.getY(i)/300,k=Math.min(1,Math.max(0,y*2.2));c.copy(hz).lerp(top,Math.pow(k,.7));C.setXYZ(i,c.r,c.g,c.b)}C.needsUpdate=true;scene.fog.color.copy(hz)}
/* render through the stage camera while you play */
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(FEST.view&&c===cam&&FEST.view3){const v=FEST.view3;v.cam.aspect=innerWidth/innerHeight;v.cam.updateProjectionMatrix();return r0(sc,v.cam)}return r0(sc,c)}}
scene.fog=new THREE.Fog(0xf1dfc0,1e6,2e6);
{const st=document.createElement('style');st.textContent=`body.fston #hud,body.fston #ntags{display:none}
#fst{position:fixed;left:50%;top:12px;transform:translateX(-50%);width:min(560px,94vw);z-index:4;text-align:center;pointer-events:none}#fst .bar{width:100%;height:8px;margin-top:6px}
#fcr{position:fixed;right:14px;top:12px;z-index:4;text-align:right;pointer-events:none;min-width:150px}#fcr b{font-size:28px;display:block;color:#fff}#fcr .d{font-size:14px;font-weight:700}
#fsg{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);width:min(460px,92vw);z-index:5;text-align:center}
#fsg .hm{height:22px;background:#000;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e;position:relative;margin:10px 0}#fsg .hm i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff4a9a,#ffe066)}
#fsg .big{font-size:26px;margin:4px 0}#fsg .ok{color:#2fe68a}#fsg .no{color:#ff6a6a}#fend{position:fixed;left:14px;bottom:14px;z-index:4}
@media (max-width:600px){#fcr b{font-size:20px}#fst{top:58px}}`;document.head.appendChild(st)}
/* ---- the set: crowd, beat, minigames that pop up at random gaps ---- */
const FMG={hype:'Hype the crowd!',drop:'Hit the drop!',call:'Call and response!',lyric:'Finish the line!',hold:'Hold the note!'};
const FMG_HOW={hype:'Mash SPACE (or tap) to fill the meter before time runs out',drop:'Press SPACE (or tap) when the marker is in the green. 3 tries',call:'Watch the pads, then play them back with keys 1-4 or tap',lyric:'Pick the word that rhymes, keys 1-3 or tap',hold:'Hold SPACE (or hold click) to keep the level in the green band'};
function festMgStart(){const set=FEST.set,ks=Object.keys(FMG).filter(k=>k!=set.last),k=pick(ks);set.last=k;const m={k,t:-1.1,sc:null,fb:0};
 if(k=='hype')Object.assign(m,{lv:0,best:0,lim:4.5});
 else if(k=='drop')Object.assign(m,{pos:0,dir:1,sp:1.1,z0:R(.25,.6),zw:.16,hits:0,tries:0,lim:9,fl:0});
 else if(k=='call')Object.assign(m,{seq:Array.from({length:4},()=>Math.random()*4|0),ph:'show',i:0,ok:0,lit:-1,lt:0,lim:7,st:-1});
 else if(k=='lyric'){const g=mgShuf(MG_RH.slice()).slice(0,2);Object.assign(m,{i:0,ok:0,lim:5.5,pk:-1,lt:0,items:g.map(w=>{const ok=w.filter(x=>!MG_NEAR[x]),base=ok[0],right=pick(ok.slice(1)),pool=MG_RH.filter(o=>o!==w).flat().filter(x=>!MG_NEAR[x]);return{base,right,opts:mgShuf([right,...mgShuf(pool).slice(0,2)])}})})}
 else Object.assign(m,{dur:4.5,lv:.2,c:.5,in:0});
 set.mg=m;snd('pop');FEST.mgK=''}
function festMgPress(p){const set=FEST.set;if(!set||!set.mg||set.mg.sc!=null||set.mg.t<0)return;const m=set.mg;
 if(m.k=='hype'&&p==-1){m.lv=Math.min(1.05,m.lv+.075);sdNz(.09,500+m.lv*1400,.05,{q:1.4,pan:R(-.3,.3)})}
 else if(m.k=='drop'&&p==-1){m.tries++;const ok=m.pos>m.z0&&m.pos<m.z0+m.zw;if(ok){m.hits++;snd('cash');sfx(60,.25,'sine',.35,35,0,0)}else snd('err');m.fl=ok?.35:-.35;m.z0=R(.15,.7);if(m.tries>=3)festMgDone(m.hits/3)}
 else if(m.k=='call'&&p>=0&&m.ph=='input'){m.lit=p;m.lt=.25;mgPad(MG_NOTE[p]);if(p==m.seq[m.i]){m.i++;m.ok++;if(m.i>=m.seq.length)festMgDone(1)}else{snd('err');festMgDone(m.ok/m.seq.length)}}
 else if(m.k=='lyric'&&p>=0&&!(m.lt>0)){const it=m.items[m.i];m.pk=p;m.lt=.6;if(it.opts[p]==it.right){m.ok++;snd('cash')}else snd('err')}}
function festMgDone(sc){const set=FEST.set,m=set.mg;if(!m||m.sc!=null)return;m.sc=Math.max(0,Math.min(1,sc));m.fb=1.5;set.sc.push(m.sc);if(set.ss)set.ss.push(m.sc);const C0=set.C0;let d;
 if(m.sc>=.75)d=C0*(.1+.12*(m.sc-.75)/.25);else if(m.sc>=.5)d=C0*.04*(m.sc-.5)/.25;else d=-C0*(.05+.12*(.5-m.sc)/.5);
 set.T=Math.max(C0*.15,Math.min(Math.max(C0*1.6,40),set.T+d));m.d=Math.round(d);set.hype=Math.max(.1,Math.min(1,set.hype+(m.sc-.5)*.6));
 if(m.sc>=.5){nz(1.6,1100,.14+.1*m.sc,.5,'bandpass');setTimeout(()=>nz(1.2,1600,.1,.6,'bandpass'),250)}else nz(.8,400,.08,.5,'lowpass')}
function festMgTick(dt){const set=FEST.set,m=set.mg;m.t+=dt;if(m.sc!=null){m.fb-=dt;if(m.fb<=0){set.mg=null;set.next=set.t+R(3.5,9)}return}if(m.t<0)return;
 if(m.k=='hype'){m.lv=Math.max(0,m.lv-.32*dt);m.best=Math.max(m.best,m.lv);if(m.lv>=1)festMgDone(1);else if(m.t>=m.lim)festMgDone(m.best)}
 else if(m.k=='drop'){m.pos+=m.dir*m.sp*dt;if(m.pos>1){m.pos=1;m.dir=-1}if(m.pos<0){m.pos=0;m.dir=1}m.fl*=.9;if(m.t>=m.lim)festMgDone(m.hits/3)}
 else if(m.k=='call'){m.lt=Math.max(0,m.lt-dt);if(m.lt<=0)m.lit=-1;if(m.ph=='show'){const k=Math.floor(m.t/.6);if(k!=m.st&&k<m.seq.length){m.st=k;m.lit=m.seq[k];m.lt=.3;mgPad(MG_NOTE[m.lit])}if(m.t>m.seq.length*.6+.2){m.ph='input';m.t=0}}else if(m.t>=m.lim)festMgDone(m.ok/m.seq.length)}
 else if(m.k=='lyric'){if(m.lt>0){m.lt-=dt;if(m.lt<=0){m.pk=-1;m.t=0;if(++m.i>=m.items.length)festMgDone(m.ok/m.items.length)}}else if(m.t>=m.lim){m.pk=-1;m.lt=.6}}
 else{const hold=keys[' ']||keys.e||keys.enter||MGH;m.lv=Math.max(0,Math.min(1,m.lv+(hold?1.1:-.9)*dt));m.c=Math.max(.15,Math.min(.85,.5+.28*Math.sin(m.t*1.1)+.1*Math.sin(m.t*2.4+1)));if(Math.abs(m.lv-m.c)<.11)m.in+=dt;if(m.t>=m.dur)festMgDone(m.in/m.dur*1.15)}}
function festMgDraw(){const set=FEST.set;let el=$('fsg');const m=set&&set.mg;if(!m){if(el)el.remove();FEST.mgK='';return}
 if(!el){el=document.createElement('div');el.id='fsg';el.className='box';document.body.appendChild(el);el.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-p]');festMgPress(b?+b.dataset.p:-1)})}
 const key=m.k+(m.sc!=null?'done':m.t<0?'intro':'')+(m.k=='lyric'?m.i:'')+(m.k=='call'?m.ph:'');
 if(key!=FEST.mgK){FEST.mgK=key;const t=`<b class=px>${FMG[m.k]}</b><div class=m style="font-size:12px;margin-top:3px">${FMG_HOW[m.k]}</div>`;
  if(m.sc!=null){const good=m.sc>=.5;el.innerHTML=`<div class="big ${good?'ok':'no'}">${m.sc>=.9?'Perfect!':m.sc>=.75?'Great!':m.sc>=.5?'Nice':m.sc>=.25?'Shaky…':'Ouch!'}</div><div class="${m.d>=0?'ok':'no'}"><b>${m.d>=0?'+':''}${m.d.toLocaleString()} fans</b> ${m.d>=0?'joined the crowd':'walked off'}</div>`}
  else if(m.t<0)el.innerHTML=t+'<div class=big>Get ready…</div>';
  else if(m.k=='hype')el.innerHTML=t+'<div class=hm><i id=fmv></i></div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>';
  else if(m.k=='drop')el.innerHTML=t+'<div class=tbar><div class=tg id=fmz></div><div class=ti id=fmk></div></div><small class=m id=fmh></small><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>';
  else if(m.k=='call')el.innerHTML=t+`<div class=mgpads>${MG_PADC.map((c,i)=>`<button class=mgp data-p=${i} style="--c:${c}">${i+1}</button>`).join('')}</div><small class=m id=fmh></small>`;
  else if(m.k=='lyric'){const it=m.items[m.i];el.innerHTML=t+`<div class=m style="margin-top:6px">Line ${m.i+1}/${m.items.length}: rhymes with</div><div class="mgw px">"${esc(it.base)}"</div><div class=mgo>${it.opts.map((o,i)=>`<button data-p=${i}>${i+1}. ${esc(o)}</button>`).join('')}</div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>`}
  else el.innerHTML=t+'<div class=tbar><div class=tg id=fmz style="width:22%"></div><div class=ti id=fmk></div></div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>'}
 if(m.sc!=null||m.t<0)return;const tm=$('fmt');
 if(m.k=='hype'){const v=$('fmv');if(v)v.style.width=Math.min(100,m.lv*100)+'%';if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%'}
 else if(m.k=='drop'){const z=$('fmz'),k=$('fmk'),h=$('fmh');if(z){z.style.left=m.z0*100+'%';z.style.width=m.zw*100+'%'}if(k){k.style.left=m.pos*100+'%';k.style.background=m.fl>.05?'#2fe68a':m.fl<-.05?'#ff4455':'#fff'}if(h)h.textContent=m.hits+' hit · '+(3-m.tries)+' tries left';if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%'}
 else if(m.k=='call'){el.querySelectorAll('.mgp').forEach((b,i)=>b.classList.toggle('on',m.lit==i));const h=$('fmh');if(h)h.textContent=m.ph=='show'?'Watch and listen…':'Your turn: '+m.i+'/'+m.seq.length}
 else if(m.k=='lyric'){const it=m.items[m.i];if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%';el.querySelectorAll('.mgo button').forEach((b,i)=>{b.classList.toggle('ok',m.lt>0&&it.opts[i]==it.right);b.classList.toggle('no',m.lt>0&&i==m.pk&&it.opts[i]!=it.right)})}
 else{const z=$('fmz'),k=$('fmk');if(z)z.style.left=(m.c-.11)*100+'%';if(k){k.style.left=m.lv*100+'%';k.style.background=Math.abs(m.lv-m.c)<.11?'#2fe68a':'#fff'}if(tm)tm.style.width=Math.max(0,100-m.t/m.dur*100)+'%'}}
addEventListener('keydown',e=>{if(FEST.set&&FEST.set.end&&e.key=='Escape'){e.stopImmediatePropagation();return festLeave()}if(mode!='fest'||!FEST.set||/INPUT|TEXTAREA/.test(e.target.tagName))return;const k=e.key;
 if(k=='Escape'){e.stopImmediatePropagation();if(!e.repeat)pauseGame();return}if(e.repeat)return;if(k==' '||k=='Enter'||k.toLowerCase()=='e'){e.preventDefault();festMgPress(-1)}else{const n=parseInt(k);if(n>=1&&n<=4)festMgPress(n-1)}},true);
function festHud(){const set=FEST.set;let a=$('fst'),b=$('fcr');if(!set||set.end){if(a)a.remove();if(b)b.remove();const e=$('fend');if(e)e.remove();return}
 if(!a){a=document.createElement('div');a.id='fst';a.className='hb';document.body.appendChild(a);b=document.createElement('div');b.id='fcr';b.className='hb';document.body.appendChild(b);
  const e=document.createElement('button');e.id='fend';e.className='hb';e.textContent='Leave stage';e.onclick=()=>festEnd(1);document.body.appendChild(e)}
 const s=set.st,nx=set.list[set.i+1],end=FSLOT[set.bk.slot][1],h=`<b class=px style="color:${s.col}">STAGE ${s.n} · ${esc(s.name.toUpperCase())}</b><br><small>Now playing ${set.i+1}/${set.list.length}: <b>"${esc(set.song.title)}"</b>${set.song.ft?' feat. '+esc(set.song.ft):''}</small><div class=bar><i style="width:${Math.min(100,Math.round(set.sm/set.dur*100))}%"></i></div>
  <small class=m>${fDurS(Math.max(0,set.dur-set.sm))} left · ${nx?'next: "'+esc(nx.title)+'"':'last song!'} · ${clk()} · slot ends ${fHM(end)}</small>`;if(a.dataset.h!=h){a.dataset.h=h;a.innerHTML=h}
 const c=Math.round(set.C),dd=c-set.start,g=`<small class=m>CROWD</small><b>${c.toLocaleString()}</b><span class=d style="color:${dd>=0?'#2fe68a':'#ff6a6a'}">${dd>=0?'▲ +':'▼ '}${dd.toLocaleString()}</span><br><small class=m>Earned ${$$(set.pay)} · next song pays ${$$(FSONG_PAY*s.mult*c)}</small>`;if(b.dataset.h!=g){b.dataset.h=g;b.innerHTML=g}}
/* the music under the set: one call per frame, so the audio code can swap it for genre beats. set.song is the song
   playing, set.songT the seconds since it started, set.hype the crowd's hype (0-1) */
function festMusic(set,dt){set.songT+=dt;
 /* the beat: kick, snare and hats at about 126 bpm, a chord stab every bar */
 set.bt+=dt;if(set.bt>=.476){set.bt-=.476;set.beat++;const b=set.beat%4;sfx(110,.16,'sine',.32,42,0,0);if(b==1||b==3)nz(.12,1900,.12,1,'bandpass');nz(.03,8000,.05,1,'highpass',.238);
  if(b==0){const r=[[262,330,392],[220,262,330],[175,220,262],[196,247,294]][(set.beat>>2)%4];r.forEach(f=>sfx(f,.4,'sawtooth',.025,0,0,.4))}}}
function festSetTick(dt){const set=FEST.set,s=set.st;if(set.end||PAUSED)return;set.t+=dt;if(S.t<599)S.t=Math.min(599,S.t+dt*(typeof DAYK!="undefined"?DAYK:1));if(!set.fin)set.sm=Math.max(0,festMins()-set.ms0);
 if(set.t<16)set.T=Math.min(set.C0*1.6,set.T+set.C0*.012*dt);
 set.C+=(set.T-set.C)*Math.min(1,dt*1.3);set.peak=Math.max(set.peak,set.C);s.cr.C=set.C;s.cr.hype+=(set.hype-s.cr.hype)*Math.min(1,dt*2);
 if(set.mg)festMgTick(dt);else if(!set.fin&&set.t>=set.next&&festSetLeft(set).s>9)festMgStart();
 const slotEnd=FSLOT[set.bk.slot][1];
 if(!set.fin&&set.sm>=set.dur){festSongDone();if(set.i+1<set.list.length&&festMins()<slotEnd-1){set.i++;festSongStart()}else set.fin=1}
 if(!set.fin&&festMins()>=slotEnd){set.fin=2;festSongDone(Math.min(1,set.sm/set.dur))}
 if(set.fin&&!set.mg)festEnd(0);
 festMusic(set,dt)}
function festEnd(quit){const set=FEST.set;if(!set||set.end)return;set.end=1;const s=set.st,m=$('fsg');if(m)m.remove();
 if(quit&&!set.fin){const fr=Math.min(1,set.sm/set.dur);if(fr>.05)festSongDone(fr)}
 const c=Math.round(set.C),avg=set.sc.length?set.sc.reduce((a,b)=>a+b,0)/set.sc.length:.5,gain=c-set.start,full=set.done.filter(d=>d.f>=1).length,F=festS();
 set.bk.st=1;set.bk.res={c,pay:set.pay,n:full,str:set.str};
 F.p[s.n]={c,pay:set.pay,sc:Math.round(avg*100),song:set.list[0].title,n:full,d:S.day};
 
 updateVersion();festBoardDraw();chime();
 const lis=Math.round(set.str/(S.mlDiv||3.5)),grade=avg>=.85?'Legendary set':avg>=.65?'Great show':avg>=.45?'Decent set':'Tough crowd',ttl=quit?'You left the stage early':set.fin==2&&full<set.list.length?'Time\'s up! '+grade:grade;mode='menu';
 $('ui').innerHTML=`<div class="box modal"><h2>${ttl}</h2><p class=m>Stage ${s.n} · ${s.name} · ${full} of ${set.list.length} songs played${set.sc.length?' · '+set.sc.length+' crowd moments, '+Math.round(avg*100)+'% average':''}</p>
  <div class=cards><div class=card>Crowd<b>${c.toLocaleString()}</b><small>${gain>=0?'+':''}${gain.toLocaleString()} during your set</small></div><div class=card>Paid<b>${$$(set.pay)}</b><small>$${FSONG_PAY.toFixed(2)} x ${s.mult} x crowd, per song</small></div><div class=card>Streams<b>+${set.str.toLocaleString()}</b><small>about +${lis.toLocaleString()} monthly listeners tomorrow</small></div><div class=card>Followers<b>+${set.fol.toLocaleString()}</b></div></div>
  <div style="max-height:22vh;overflow:auto;margin:6px 0">${set.done.map((d,i)=>`<div class=ng><span style="flex:1">${i+1}. "${esc(d.t)}"${d.f<1?' <small class=m>(cut short, '+Math.round(d.f*100)+'%)</small>':''}</span><small class=m>${d.c.toLocaleString()} people · ${$$(d.pay)}</small></div>`).join('')}</div>
  <div class=row2><button class=go onclick="festLeave()">Leave the stage</button></div></div>`}
function festLeave(){const set=FEST.set;FEST.set=null;festViewOff();festHud();const s=set&&set.st;if(s){P.x=s.ix;P.z=s.iz+1.2;P.rot=0;camT.x=P.x;camT.z=P.z;s.cr.hype=.4;s.cr.C=festAmbient(s);s.cr.shown=-1}closeUI();festScreens()}

/* ---- 10. every frame ---- */
function festTick(dt){festSync();if(FEST.set&&FEST.set.end&&mode=='play')festLeave();const ph=FEST.ph;FEST.t+=dt;const t=FEST.t;
 const near=!IN&&!HIN&&P.x>FEST.X0-90&&P.x<FEST.X1+90&&P.z>FEST.Z0-90&&P.z<FEST.Z1+70;
 if(ph=='fest'&&FEST.grp.fest){FEST.grp.fest.visible=near||!!FEST.view;
  if(FEST.set){festSetTick(dt);const s=FEST.set&&FEST.set.st;if(s&&P.mesh&&FEST.view){const b=Math.max(0,Math.sin(t*2.1*Math.PI))*.05;P.mesh.position.set(P.x,s.h+b,P.z);P.mesh.rotation.y=Math.sin(t*.9)*.15;
    P.arms[1].rotation.x=-2.2+Math.sin(t*4)*.12;P.arms[0].rotation.x=(FEST.set.hype>.7&&Math.sin(t*.7)>.2)?-2.9:-.3+Math.sin(t*2.1*Math.PI)*.3;P.legs[0].rotation.x=Math.sin(t*2.1*Math.PI)*.12;P.legs[1].rotation.x=-P.legs[0].rotation.x;
    if(FEST.set.ft){const o=FEST.set.ft;o.g.rotation.y=Math.sin(t*.8+1)*.2;o.g.position.y=s.h+Math.max(0,Math.sin(t*2.1*Math.PI+.5))*.05;o.arms[0].rotation.x=-2.2+Math.sin(t*4+1)*.12;o.arms[1].rotation.x=(FEST.set.hype>.6&&Math.sin(t*.6+2)>.3)?-2.9:-.4}}}
  if(FEST.grp.fest.visible){/* crowds: the one you play to every frame, the others nearby at a lower rate */
   FEST.crowd.forEach(cr=>{const live=FEST.view===cr.s,s=cr.s,d=Math.hypot(P.x-s.cx,P.z-(s.area[1]+s.area[3])/2);cr.grp.visible=live||!FEST.view&&d<110||!!FEST.view;
    if(!cr.grp.visible)return;cr.ft+=dt;if(live||cr.ft>(d<45?.033:.1)||cr.shown<0){festCrowdPose(cr,t,cr.shown<0,FEST.view?FEST.view3.cam:cam);cr.ft=0}});
   FEST.walk.forEach(w=>{w.o.g.visible=!FEST.view;if(FEST.view)return;w.p+=w.dir*w.sp*dt;if(w.p>w.b){w.p=w.b;w.dir=-1}if(w.p<w.a){w.p=w.a;w.dir=1}w.t+=dt*7;
    if(w.ax){w.o.g.position.set(w.p,0,w.c);w.o.g.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2}else{w.o.g.position.set(w.c,0,w.p);w.o.g.rotation.y=w.dir>0?0:Math.PI}
    const s=Math.sin(w.t)*.6;w.o.legs[0].rotation.x=s;w.o.legs[1].rotation.x=-s;w.o.arms[0].rotation.x=-s;w.o.arms[1].rotation.x=s});
   if((FEST.scrT=(FEST.scrT||0)+dt)>1){FEST.scrT=0;festScreens()}}}
 else if((ph=='build'||ph=='down')&&FEST.grp[ph]){FEST.grp[ph].visible=near;if(near)(FEST['work_'+ph]||[]).forEach(w=>{const a=w.o.arms,k=t*(w.job=='hammer'?7:3)+w.ph;
   if(w.job=='hammer'){a[1].rotation.x=-1.6+Math.sin(k)*.9;a[0].rotation.x=-.5}else if(w.job=='lift'){a[0].rotation.x=a[1].rotation.x=-2.9+Math.sin(k)*.1}else{a[0].rotation.x=a[1].rotation.x=-1.3;w.o.legs[0].rotation.x=Math.sin(k*2)*.5;w.o.legs[1].rotation.x=-Math.sin(k*2)*.5}})}
 if(FEST.view&&FEST.view3){const v=FEST.view3,s=FEST.view,c=v.cam;festSkyColours(v);v.sky.position.copy(c.position);
  /* the camera glides sideways when a featured artist comes on or goes off for a collab song */
  const ft=FEST.set&&FEST.set.song.ft?1:0;v.camX=v.camX==null?ft:v.camX+(ft-v.camX)*Math.min(1,dt*1.5);const sw=Math.sin(t*.37)*.3,px=s.cx-1.6*(1-v.camX);
  c.position.set(px+sw,s.h+2.75+Math.sin(t*.5)*.05,s.zf-Math.min(7.4,s.d-1));c.lookAt(s.cx-.6*(1-v.camX)+sw*.4,s.h+.1,s.zf+30);
  if(amb.intensity<.6){amb.intensity=.6;amb.color.set('#c8b0ff')}
  const b=v.bub.geometry.attributes.position;for(let i=0;i<b.count;i++){const q=v.bubV[i];let y=b.getY(i)+q[1]*dt,x=b.getX(i)+Math.sin(t*.8+q[3])*.25*dt+q[0]*dt;if(y>s.H+8){y=1.6;x=s.cx+R(-s.w*.9,s.w*.9)}b.setXY(i,x,y)}b.needsUpdate=true;
  v.beams.forEach((m,i)=>{const p=m.userData.ph;m.rotation.set(-1.25+Math.sin(t*.7+p)*.35,0,Math.sin(t*.9+p)*.6);m.material.opacity=(FEST.set?.05+.09*FEST.set.hype:.06)*(.6+.4*Math.sin(t*2+p))})}
 festFade(dt);festHud();if(FEST.set&&!FEST.set.end)festMgDraw()}
{const u0=update;update=function(dt){u0(dt);try{festTick(dt)}catch(e){if(!FEST.err){FEST.err=1;console.error('festival',e)}}}}

/* ---- 11. maps, taxi, morning card ---- */
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){m0(x,sx,sz,kx,kz,mini);const{X0,X1,Z0,Z1,GZ}=FEST,W=x.canvas.width,H=x.canvas.height;if(sx(X1)<-10||sx(X0)>W+10||sz(Z1)<-10||sz(Z0)>H+10)return;
 const rect=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(sx(a),sz(b),(c-a)*kx,(d-b)*kz)},ph=FEST.ph,k=(kx+kz)/2;
 rect(X0,Z0,X1,Z1,ph=='fest'?'#6f9a4c':ph?'#7e9a58':'#5a9a52');x.strokeStyle=ph=='fest'?'#c8ccd2':ph?'#e0a020':'#3f7a45';x.lineWidth=Math.max(1,.6*k);x.setLineDash(ph?[]:[4,3]);x.strokeRect(sx(X0),sz(Z0),(X1-X0)*kx,(Z1-Z0)*kz);x.setLineDash([]);
 if(ph=='fest'){FSTG.forEach(s=>{const[a,b,c,d]=s.area;rect(a,b,c,d,'#a08a5a');const n=Math.min(1,(s.cr?s.cr.C:s.base)/(s.figs+(s.cr?s.cr.cells||0:0)*7.4));rect(a,b,c,b+(d-b)*Math.max(.15,n),'#c49a6a')});
  rect(X0,GZ-3.5,322,GZ+3.5,'#9aa098');rect(225,-118,236,-8,'#9aa098');rect(317.5,-112,322,-8,'#9aa098');
  FSTG.forEach(s=>{rect(s.x0,s.zb,s.x1,s.zf,'#1d1d22');rect(s.x0,s.zf-.6,s.x1,s.zf,s.col)});FFOOD.forEach(f=>{const[,,fx,fz,,col,kind]=f;const r=kind=='bar'?[fx-4,fz-5,fx+1,fz+5]:kind=='van'?[fx-1,fz-2.2,fx+1,fz+3.4]:[fx-.7,fz-1.1,fx+.7,fz+1.1];rect(r[0],r[1],r[2],r[3],col)});
  if(!mini&&k>.9){x.font='bold 9px monospace';x.fillStyle='#fff';FSTG.forEach(s=>x.fillText(String(s.n),sx(s.cx)-3,sz(s.zf)+(s.d*kz>14?-3:9)))}}
 else if(ph){FSTG.forEach(s=>{x.strokeStyle='#d0d0d0';x.lineWidth=1;x.strokeRect(sx(s.x0),sz(s.zb),s.w*kx,s.d*kz)});rect(229,GZ-13.4,235,GZ-10.6,'#e8e8ec')}}}
{const b0=bigMap;bigMap=function(){b0();if(!FEST.ph||!$('bm'))return;const r=document.querySelector('#ui .row2');if(!r)return;const bt=document.createElement('button');bt.textContent=FEST.ph=='fest'?'Taxi to Festival':'Taxi to Festival';bt.onclick=()=>taxi(FEST.X0-3.5,FEST.GZ);r.insertBefore(bt,r.lastElementChild)}}
{const w0=wakeUp;wakeUp=function(auto){w0(auto);try{const ph=festPhaseOf(S.day),bx=document.querySelector('#ui .box');if(!ph||!bx)return;const h=bx.querySelector('h2');
 const bk=fBk().filter(b=>b.day==S.day&&!b.st),mine=bk.map(b=>'Stage '+b.n+' at '+fHM(FSLOT[b.slot][0])).join(' and ');
 const t=ph=='fest'?'<b>Park Fields Festival is on today</b>, east of Park Avenue. '+(mine?'<b>You play '+mine+'.</b> Be at the steps of the stage in time!':'Book a slot on FestivalApp (on your computer) at least 2 days before a festival to play. Grab some food.'):ph=='build'?'A crew is building <b>Park Fields Festival</b> east of Park Avenue. It opens tomorrow.':'The festival crew is taking Park Fields down today. Next festival: Day '+festNext(S.day)+'.';
 const p=document.createElement('p');p.style.cssText='background:#2b1240;border:2px solid #ff6ad5;padding:6px 8px;margin:6px 0';p.innerHTML=t;h?h.after(p):bx.prepend(p);FEST.seen[S.day]=1}catch(e){}}}
