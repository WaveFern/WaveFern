/* ===== v52.6.0: festival backstage entrance and autographs =====
   1. Backstage entrance. Every festival stage now has a fenced backstage walkway beside its stairs, with a gate arch
      (BACKSTAGE, artists and staff only), a steward at the gate and a dressing-room cabin. The "play this stage" spot has
      moved from the foot of the stairs to the gate. When you start a booked set a steward walks you down the walkway and up
      the stairs, then the stage view starts. (Only when you start it yourself on foot: band members started by the
      multiplayer lead and the trailer recorder still go straight to the stage.) After the set you come out of the walkway.
   2. Autographs. After a festival set (the summary card in 70c-festival-set.js, festSumUI) and after a stadium or club show
      abroad (151-tour-shows.js) the fans at the barrier ask for autographs. It is unpaid and optional: a button on the summary
      starts the signature minigame (232-signature-game.js, signGame). Every signature adds followers (same unit as the
      summary's Followers figure) and a little fan interest, and the summary shows the signed count and how happy the fans are.
   Hooks: festBuildFest, festInts, festStageUse, festStartBooked, festLeave and update are wrapped; festSumUI and festSign are
   new globals; the tour show summary is found with a MutationObserver on #ui. Nothing is saved: no state fields added. */
(function(){
const BK={on:null,go:0,from:0};window.BKS=BK;
const GATE=6;/* gate distance east of the foot of the stairs */
/* ---- the walkway, gate and cabin (built once with the festival site, shown with it) ---- */
if(typeof festBuildFest=='function'){const b0=festBuildFest;festBuildFest=function(){const r=b0.apply(this,arguments);try{build()}catch(e){console.error('backstage build',e)}return r}}
function guard(grp,x,z,ry){const o=buildChar(Object.assign(fCfg(),{body:.5}));o.g.position.set(x,0,z);o.g.rotation.y=ry;
 B(o.g,.66,.46,.45,'#f2e030',0,.86,0);B(o.g,.67,.06,.46,'#222',0,.78,0);B(o.g,.62,.12,.62,'#15151a',0,1.72,0);B(o.g,.7,.04,.4,'#15151a',0,1.69,.3);grp.add(o.g);return o}
function build(){const grp=fGroup('fest'),G=fAll();
 FSTG.forEach(s=>{const iz=s.iz,x0=s.ix-.6,ex=s.ix+GATE;s.bkEx=ex;
  [-1,1].forEach(sd=>{const z=iz+sd*1.7;fBox(G,ex-x0,.08,.07,'#e0c020',(x0+ex)/2,.5,z);fBox(G,ex-x0,.08,.07,'#e0c020',(x0+ex)/2,1,z);for(let x=x0;x<=ex+.01;x+=1.5)fBox(G,.09,1.1,.09,'#2b2b33',x,.55,z);
   FEST.colsF.push([x0,z-.08,ex,z+.08])});
  /* the gate arch */
  [-1,1].forEach(sd=>fBox(G,.22,3.1,.22,'#2b2b33',ex,1.55,iz+sd*1.7,0,'#ff6ad5'));fBox(G,.3,.5,3.9,'#2b2b33',ex,3.15,iz,0,'#ff6ad5');
  [-1,1].forEach(sd=>fBox(G,.3,.5,.3,'#ff7a1a',ex+.7,.25,iz+sd*2.1));
  fPlane(fSignTex('BACKSTAGE','ARTISTS & STAFF ONLY','#14121a','#ff6ad5',512,128),3.5,.88,ex+.17,3.15,iz,Math.PI/2,grp);
  /* the dressing-room cabin south of the walkway; its door faces the walkway */
  const cx=s.ix+3.2,cz=iz+3.8;fBox(G,4.4,2.6,2.4,'#c9ced6',cx,1.3,cz);fBox(G,4.6,.14,2.6,'#8d939c',cx,2.67,cz);fBox(G,1,1.9,.06,'#3a3f47',cx-1,.95,cz-1.22);fBox(G,.9,.5,.06,'#9fd0ff',cx+1,1.5,cz-1.22);FEST.colsF.push([cx-2.2,cz-1.2,cx+2.2,cz+1.2]);
  fPlane(fSignTex('DRESSING ROOM',null,'#14121a','#fff',384,80),1.7,.36,cx-1,2.15,cz-1.27,Math.PI,grp);
  s.bkGuard=guard(grp,ex-.9,iz+1.15,Math.PI/2);s.bkPost={x:ex-.9,z:iz+1.15,r:Math.PI/2}});
 fMerge(G,grp,new THREE.MeshLambertMaterial({vertexColors:true}))}
/* the play-this-stage spot is at the gate now */
if(typeof festInts=='function'){const i0=festInts;festInts=function(){const a=i0.apply(this,arguments);try{FSTG.forEach(s=>{if(!s.bkEx)return;const o=a.find(q=>q.x===s.ix&&q.z===s.iz);if(o){o.x=s.bkEx+.9;o.r=2.4}})}catch(e){}return a}}

/* ---- the escort ---- */
{const u0=festStageUse;festStageUse=function(){BK.from=1;try{return u0.apply(this,arguments)}finally{BK.from=0}}}
{const s0=festStartBooked;festStartBooked=function(bk){const self=this,args=arguments;
 if(!BK.from||BK.go||mode!='play'||!bk||BK.on)return s0.apply(self,args);
 const s=fStage(bk.n),list=(bk.songs||[]).map(id=>S.songs.find(x=>x.id==id)).filter(Boolean);
 if(!s||!s.bkEx||!s.bkGuard||!list.length||S.energy<15)return s0.apply(self,args);/* the usual message for a missing setlist or no energy */
 escort(s,()=>{BK.go=1;try{s0.apply(self,args)}finally{BK.go=0}})}}
function escort(s,go){const iz=s.iz,pts=[[P.x,P.z],[s.bkEx-.3,iz],[s.ix+.2,iz],[s.x1+.45,iz]],seg=[];let L=0;
 for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);L+=d}
 mode='bkst';$('ui').innerHTML='';try{snd('pop')}catch(e){}
 BK.on={s,go,pts,seg,L,foot:seg[0]+seg[1],d:0,t:0,wt:0,fade:0,said:0,gx:s.bkPost.x,gz:s.bkPost.z};
 say('Steward: "Artists this way, I\'ll take you backstage."')}
function at(B,d){let i=0;while(i<B.seg.length-1&&d>B.seg[i]){d-=B.seg[i];i++}const k=B.seg[i]>0?Math.min(1,d/B.seg[i]):1,a=B.pts[i],b=B.pts[i+1];return{x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k,i,k}}
function fade(on){let e=$('bkfade');if(!e){if(!on)return;e=document.createElement('div');e.id='bkfade';document.body.appendChild(e);e.offsetWidth}e.style.opacity=on?1:0;if(!on)setTimeout(()=>{if(e.style.opacity=='0')e.remove()},500)}
function restore(B){const s=B.s,o=s.bkGuard;if(o){o.g.position.x=s.bkPost.x;o.g.position.z=s.bkPost.z;o.g.rotation.y=s.bkPost.r;o.legs[0].rotation.x=o.legs[1].rotation.x=0}}
function abort(){const B=BK.on;BK.on=null;if(B)restore(B);fade(0)}
function swing(o,t,m){if(!o)return;const k=Math.sin(t)*m;o.legs[0].rotation.x=k;o.legs[1].rotation.x=-k;o.arms[0].rotation.x=-k;o.arms[1].rotation.x=k}
function tick(dt){const B=BK.on;if(!B)return;if(mode!='bkst')return abort();B.t+=dt;const s=B.s,g=s.bkGuard;
 if(!B.fade){B.d=Math.min(B.L,B.d+dt*2.4);const p=at(B,B.d),q=at(B,B.d+.01);B.wt+=dt*9;
  const up=B.d>B.foot?(B.d-B.foot)/(B.L-B.foot):0,h=s.h*up,dx=q.x-p.x,dz=q.z-p.z;if(dx||dz)P.rot=Math.atan2(dx,dz);
  P.x=p.x;P.z=p.z;if(P.mesh){P.mesh.position.set(P.x,(typeof SY=='number'?SY:0)+h+Math.abs(Math.sin(B.wt))*.06,P.z);P.mesh.rotation.y=P.rot;swing(P,B.wt,.7)}
  /* the steward walks a little ahead, stops at the foot of the stairs and steps aside */
  if(g){const lead=at(B,Math.min(B.foot-.2,B.d+1.5)),tx=lead.x,tz=B.d>=B.foot-.4?s.ix-.1:lead.z,gx=tx-B.gx,gz=(B.d>=B.foot-.4?s.iz+1.15:tz)-B.gz,gd=Math.hypot(gx,gz),st=Math.min(gd,3.6*dt);
   if(gd>.03){B.gx+=gx/gd*st;B.gz+=gz/gd*st;g.g.rotation.y=Math.atan2(gx,gz);swing(g,B.wt,.6)}else{g.legs[0].rotation.x=g.legs[1].rotation.x=0;g.g.rotation.y=Math.atan2(s.ix-B.gx,0)}
   g.g.position.set(B.gx,Math.abs(Math.sin(B.wt))*.05*(gd>.03?1:0),B.gz)}
  if(!B.said&&B.d>B.foot-.3){B.said=1;say('Steward: "Mind the steps. Have a great set!"')}
  if(B.d>=B.L){B.fade=1;B.ft=0;fade(1)}}
 else{B.ft+=dt;if(B.ft>.45){const go=B.go;BK.on=null;restore(B);mode='play';try{go()}catch(e){console.error('backstage start',e)}if(mode=='fest')setTimeout(()=>fade(0),150);else fade(0)}}}
{const u0=update;update=function(dt){u0.apply(this,arguments);if(BK.on){try{tick(dt)}catch(e){console.error('backstage',e);abort();if(mode=='bkst')mode='play'}}}}
/* you come back out of the walkway after the set */
{const l0=festLeave;festLeave=function(){const set=FEST.set,r=l0.apply(this,arguments),s=set&&set.st;if(s&&s.bkEx){P.x=s.ix+1.4;P.z=s.iz;P.rot=Math.PI/2;if(typeof camT!='undefined'){camT.x=P.x;camT.z=P.z}}return r}}

/* ---- autographs ---- */
const fansFor=c=>Math.max(2,Math.min(6,Math.round(Math.log10(Math.max(10,c))*1.5)));
/* sign for the fans at the barrier. crowd = people at the show, mult = how big the stage is. cb gets {n, fol, hap, total} after the minigame.
   Followers use the same unit as the summary cards (the game divides them with FOLN as it credits them). */
function autograph(crowd,mult,cb){const total=fansFor(crowd);
 signGame({title:'Autographs · fans at the barrier',items:SIGN.random(total),intro:'Draw your signature in the red box. Enter = next, Backspace = clear, Esc = stop signing.'}).then(r=>{
  let fol=0,q=0;r.items.forEach(x=>{if(!x.signed)return;q+=x.q;fol+=Math.max(1,Math.round(crowd*.0012*(.5+x.q)))});
  if(fol){S.followers=(S.followers||0)+FOLN(fol)}if(r.signed)S.interest=Math.min(1,(S.interest||0)+.003*(mult||1)*q);
  cb({n:r.signed,fol,hap:r.signed?Math.round(r.avg*100):0,total})})}
window.festSign=function(){const set=FEST.set;if(!set||!set.end||set.sg||set.sgBusy||SIGN.busy())return;set.sgBusy=1;
 autograph(Math.round(set.C),set.st.mult,res=>{set.sgBusy=0;set.sg=res;set.fol+=res.fol;festSumUI(set)})};
/* stadium and club shows (151-tour-shows.js keeps its summary private): the summary is found when it appears in #ui */
function tourSummary(m){const D=window.DCITY,H=D&&D.show&&D.show();if(!H||!H.done||!H.done.length||m.dataset.sg)return;m.dataset.sg=1;
 const row=m.querySelector('.row2'),box=document.createElement('div');box.className='row2';box.style.marginBottom='6px';
 box.innerHTML='<button class=go>Sign autographs</button><span class=m style="margin-left:8px">Fans are waiting at the barrier. Unpaid.</span>';
 const btn=box.querySelector('button');btn.onclick=()=>{if(SIGN.busy()||btn.disabled)return;btn.disabled=true;
  autograph(H.att||500,1.5,res=>{const cards=m.querySelector('.cards');
   if(cards){const fc=[...cards.children].find(c=>/^Followers/.test(c.textContent)),b=fc&&fc.querySelector('b');if(b){const v=parseInt(b.textContent.replace(/[^0-9]/g,''))||0;b.textContent='+'+(v+res.fol).toLocaleString()}
    const c=document.createElement('div');c.className='card';c.innerHTML='Autographs<b>'+res.n+' signed</b><small>fans '+res.hap+'% happy'+(res.fol?' · +'+res.fol+' followers':'')+'</small>';cards.appendChild(c)}
   box.remove()})};
 if(row)row.parentNode.insertBefore(box,row);else m.appendChild(box)}
function watch(){const ui=document.getElementById('ui');if(!ui||typeof MutationObserver=='undefined')return;
 new MutationObserver(()=>{const m=ui.querySelector('.box.modal');if(m&&mode=='menu'&&/DCITY\.showLeave/.test(m.innerHTML))try{tourSummary(m)}catch(e){console.error('tour autographs',e)}}).observe(ui,{childList:true})}
watch();
{const st=document.createElement('style');st.textContent='#bkfade{position:fixed;inset:0;z-index:7;background:#000;opacity:0;transition:opacity .4s;pointer-events:none}';document.head.appendChild(st)}
})();
