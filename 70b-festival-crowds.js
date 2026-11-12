/* Part 2 of 3 of the old 70-festival.js: info board, crowds, festival-goers and crew, phase switching, interactions. */
/* ---- 4. the information board: today's line-up and what you can play ---- */
function festBoardDraw(){const t=FEST.board;if(!t)return;const x=t.userData.x,W=512,H=320,lv=festLv(),F=festS();x.fillStyle='#14121c';x.fillRect(0,0,W,H);x.fillStyle='#ffe066';x.textAlign='left';x.textBaseline='alphabetic';
 x.font='bold 30px '+FFONT;x.fillText('LINE-UP · DAY '+S.day,18,40);x.font='bold 19px '+FFONT;
 const k=festSlotAt(),m=festMins();
 FSTG.slice().reverse().forEach((s,i)=>{const y=86+i*56,p=F.p[s.n],bk=festBkOn(S.day,s.n),a=festAct(s),nk=k<0?(m<FSLOT[0][0]?0:-1):k+1<FSLOT.length?k+1:-1,na=nk>=0?festSlotAct(S.day,s.n,nk):null;
  x.fillStyle=s.col;x.fillRect(18,y-22,10,40);x.fillStyle='#fff';x.fillText('Stage '+s.n+' · '+s.name,38,y-4);x.font='15px '+FFONT;x.fillStyle='#c8c8d8';
  const t2=p?'You played '+(p.n||1)+' song'+((p.n||1)==1?'':'s')+' to '+p.c.toLocaleString()+' people, $'+p.pay.toFixed(2):bk&&!bk.st?'YOU play at '+fHM(FSLOT[bk.slot][0])+(a?' · now: '+a:''):
   (a?'Now: '+a:'Quiet')+(na?' · '+fHM(FSLOT[nk][0])+' '+(na.you?'YOU':na.name):'');
  fFit(x,t2,0,15,W-56);x.fillText(t2,38,y+16);x.font='bold 19px '+FFONT});
 x.font='13px '+FFONT;x.fillStyle='#ff9ad8';x.fillText('Want a slot? Book on FestivalApp, 2+ days ahead.',18,H-12);
 t.needsUpdate=true}
/* who is on each stage right now: your set, or the act booked for the current slot (null outside the slots) */
function festAct(s){if(FEST.set&&FEST.set.st===s)return S.artist||'You';const k=festSlotAt();if(k<0)return null;const a=festSlotAct(S.day,s.n,k);return a.you?S.artist||'You':a.name}
function festScreens(){FSTG.forEach(s=>{if(!s.scr)return;const a=festAct(s),me=FEST.set&&FEST.set.st===s,k=a+'|'+(me?FEST.set.song.title:'');if(s.scrK===k)return;s.scrK=k;const x=s.scr.userData.x,W=256,H=148;
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,dk(s.col,.5));g.addColorStop(1,'#08080c');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle=a?'#ff3b5c':'#555';x.fillRect(10,10,52,22);x.fillStyle='#fff';x.font='bold 15px '+FFONT;x.textAlign='left';x.fillText(a?'LIVE':'NEXT',18,27);
  const nk=festSlotAt()<0&&festMins()<FSLOT[0][0]?0:-1,n0=nk>=0?festSlotAct(S.day,s.n,0):null,big=a||(n0?(n0.you?S.artist||'You':n0.name):s.name);
  x.textAlign='center';x.textBaseline='middle';fFit(x,big,0,34,W-24);x.fillText(big,W/2,H*.52);const sub=me?'"'+FEST.set.song.title+'"':a?s.name:n0?'on at '+fHM(FSLOT[0][0]):'see you next festival';fFit(x,sub,0,16,W-24);x.fillStyle='#ffe066';x.fillText(sub,W/2,H*.8);x.textBaseline='alphabetic';s.scr.needsUpdate=true})}

/* ---- 5. crowds: instanced figures fanned out from the barrier, a carpet of heads behind them, flags ---- */
const FCR={};
function festCrowdGeo(){if(FCR.top)return;const mk=(fn)=>{const D=xgNew();D.all=1;const B=xgCell(D,30,30);fn((w,h,d,c,x,y,z)=>xgBox(D,w,h,d,c,x+30,y,z+30));return xgGeo(B).translate(-30,0,-30)};
 /* figures face -z (towards their stage) */
 FCR.top=mk(b=>b(.6,.6,.4,'#ffffff',0,.82,0));
 FCR.skin=mk(b=>{b(.52,.53,.3,'#3c4766',0,.26,0);b(.52,.52,.5,'#ffffff',0,1.38,0);b(.56,.34,.36,'#4a3020',0,1.56,.1)});
 FCR.arms=mk(b=>{b(.16,.5,.2,'#ffffff',-.39,-.25,0);b(.16,.5,.2,'#ffffff',.39,-.25,0)});
 FCR.flag=mk(b=>{b(.06,4.6,.06,'#9a9a9a',0,2.3,0);b(1.3,.85,.03,'#ffffff',.68,4.1,0)});
 FCR.mat=new THREE.MeshLambertMaterial({vertexColors:true});
 /* the packed crowd further back: a texture of heads and shoulders */
 FCR.ctex=fTex(64,64,(x)=>{x.fillStyle='#2a2430';x.fillRect(0,0,64,64);const C=['#f2c09a','#e0a878','#c68642','#8d5524','#5a3a24','#ffdbac'],T=['#ffffff','#e03a3a','#2f6fd0','#ffe066','#1d1d22','#2fae5a','#ff7ac8','#888888','#ff8a30'];
  for(let i=0;i<150;i++){const a=RI(0,62),b=RI(0,62);x.fillStyle=pick(T);x.fillRect(a,b+1,3,2);x.fillStyle=pick(C);x.fillRect(a+.5|0,b,2,2)}});
 FCR.ctex.magFilter=FCR.ctex.minFilter=THREE.NearestFilter;FCR.ctex.wrapS=FCR.ctex.wrapT=THREE.RepeatWrapping;FCR.cmat=new THREE.MeshLambertMaterial({map:FCR.ctex})}
const FSHIRT=['#ffffff','#ffffff','#1d1d22','#e03a3a','#2f6fd0','#ffe066','#2fae5a','#ff7ac8','#888888','#ff8a30','#6ad5ff','#b07aff','#f4e1c1','#5a3a24'],FSKIN=['#ffdbac','#f2c09a','#e0a878','#c68642','#8d5524','#5a3a24'];
function festCrowdBuild(s){festCrowdGeo();const rnd=fRng(fHash('crowd'+s.n)),J=(a)=>(rnd()-.5)*a,[ax0,az0,ax1,az1]=s.area,ox=s.cx,oz=s.oz,f=[],inEx=(x,z,m)=>s.ex.some(e=>x>e[0]-m&&x<e[2]+m&&z>e[1]-m&&z<e[3]+m);
 for(let r=1.2;f.length<s.figs&&r<180;r+=.74*(1+r/45)){const n=Math.max(3,Math.floor(Math.PI*r/(.74*(1+r/45))));for(let k=0;k<n&&f.length<s.figs;k++){const a=(k+.5+J(.5))/n*Math.PI,rr=r+J(.3),x=ox+Math.cos(a)*rr,z=oz+Math.sin(a)*rr;
  if(x<ax0+.4||x>ax1-.4||z<az0||z>az1-.4||inEx(x,z,.5))continue;f.push({x,z,r:rr,ry:Math.atan2(-(ox-x),-(oz-z))+J(.5),s:.88+rnd()*.2,ph:rnd()*6.28,arm:rnd()<.45?2.6+J(.6):J(.3),up:rnd(),dn:(rnd()*4)|0})}}
 f.sort((a,b)=>a.r-b.r);
 /* figures are split into 20 m tiles, each with its own instanced meshes and bounding sphere, so the normal camera
    only draws (and the tick only animates) the tiles in view; inside a tile figures keep the crowd order (nearest first) */
 const cr={s,f,tiles:[],grp:new THREE.Group(),C:0,shown:-1,hype:.4,ft:0},TS=20,tm={},col=new THREE.Color();
 f.forEach((p,i)=>{const k=Math.floor((p.x-ax0)/TS)+','+Math.floor((p.z-az0)/TS);(tm[k]=tm[k]||[]).push(i)});
 Object.keys(tm).forEach(k=>{const ids=tm[k];let cx=0,cz=0,rr=0;ids.forEach(i=>{cx+=f[i].x;cz+=f[i].z});cx/=ids.length;cz/=ids.length;ids.forEach(i=>{rr=Math.max(rr,Math.hypot(f[i].x-cx,f[i].z-cz))});
  const bs=new THREE.Sphere(new THREE.Vector3(cx,1,cz),rr+2.5),gq=g=>{const q=g.clone();q.boundingSphere=bs.clone();return q},
   T={ids,bs,k:-1,top:new THREE.InstancedMesh(gq(FCR.top),FCR.mat,ids.length),skin:new THREE.InstancedMesh(gq(FCR.skin),FCR.mat,ids.length),arms:new THREE.InstancedMesh(gq(FCR.arms),FCR.mat,ids.length)};
  ids.forEach((i,j)=>{col.set(FSHIRT[(rnd()*FSHIRT.length)|0]);T.top.setColorAt(j,col);T.arms.setColorAt(j,col);col.set(FSKIN[(rnd()*FSKIN.length)|0]);T.skin.setColorAt(j,col)});
  [T.top,T.skin,T.arms].forEach(m=>{m.frustumCulled=true;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.count=0;cr.grp.add(m)});cr.tiles.push(T)});
 /* carpet cells (2 x 2 m) beyond the last figure, nearest first; the draw range shows as many as the crowd needs */
 const rMax=f.length?f[f.length-1].r:0,cells=[];for(let x=ax0+1;x<ax1;x+=2)for(let z=az0+1;z<az1;z+=2){const r=Math.hypot(x-ox,z-oz);if(r>rMax-.5&&!inEx(x,z,1))cells.push([x,z,r])}cells.sort((a,b)=>a[2]-b[2]);
 const Pp=[],U=[],N=[],I=[];cells.forEach((c,i)=>{const y=1.45,u=(rnd()*4|0)*.25,v=(rnd()*4|0)*.25;Pp.push(c[0]-1,y,c[1]-1,c[0]+1,y,c[1]-1,c[0]+1,y,c[1]+1,c[0]-1,y,c[1]+1);U.push(u,v+.5,u+.5,v+.5,u+.5,v,u,v);N.push(0,1,0,0,1,0,0,1,0,0,1,0);const k=i*4;I.push(k,k+2,k+1,k,k+3,k+2)});
 if(cells.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);g.computeBoundingSphere();
  cr.carpet=new THREE.Mesh(g,FCR.cmat);cr.carpet.frustumCulled=false;cr.grp.add(cr.carpet);cr.cells=cells.length}
 /* a few flags held up in the crowd (not too many) */
 const nf=s.n==1?11:s.n==2?8:s.n==3?5:3;cr.flag=new THREE.InstancedMesh(FCR.flag,FCR.mat,nf);cr.flag.frustumCulled=false;cr.fl=[];
 for(let k=0;k<nf;k++){const idx=Math.min(f.length-1,Math.floor(f.length*(.12+.8*(k+.5)/nf))),p=f[idx];cr.fl.push({i:idx,x:p.x+.3,z:p.z,ph:rnd()*6,ry:rnd()*6});col.set(['#ff4a6a','#ffe066','#6ad5ff','#b07aff','#2fe68a','#ff8a30','#ffffff','#2f6fd0'][k%8]);cr.flag.setColorAt(k,col)}
 cr.grp.add(cr.flag);cr.carpetY=0;fGroup('fest').add(cr.grp);FEST.crowd.push(cr);s.cr=cr;cr.C=festAmbient(s);festCrowdPose(cr,0,1)}
/* people at a stage when you are not playing there */
function festAmbient(s){const k=festSlotAt(),r=fRng(fHash('amb'+S.day+':'+s.n+':'+k))();return Math.round(s.base*(.5+r*.35)*(k<0?.2:1))}
const FQ=new THREE.Quaternion(),FQ2=new THREE.Quaternion(),FV=new THREE.Vector3(),FSV=new THREE.Vector3(),FMX=new THREE.Matrix4(),FAX=new THREE.Vector3(1,0,0),FAY=new THREE.Vector3(0,1,0),FQ3=new THREE.Quaternion(),FAZ=new THREE.Vector3(0,0,1);
const FFR=new THREE.Frustum(),FPM=new THREE.Matrix4();
function festCrowdPose(cr,t,force,camr){const f=cr.f,n=Math.min(f.length,Math.max(0,Math.round(cr.C))),hy=cr.hype,live=FEST.set&&FEST.set.st===cr.s,bpm=live?2.1:1.6;
 if(n!==cr.shown){cr.shown=n;force=1;cr.tiles.forEach(T=>{let k=0;while(k<T.ids.length&&T.ids[k]<n)k++;T.k=k;T.top.count=T.skin.count=T.arms.count=k;T.top.visible=T.skin.visible=T.arms.visible=k>0});
  let k=0;cr.fl.forEach((q,j)=>{if(q.i<n){FV.set(q.x,0,q.z);FQ.setFromAxisAngle(FAY,q.ry);FSV.set(1,1,1);FMX.compose(FV,FQ,FSV);cr.flag.setMatrixAt(k,FMX);k++}});cr.flag.count=k;cr.flag.instanceMatrix.needsUpdate=true}
 if(cr.carpet){const need=Math.min(cr.cells,Math.max(0,Math.ceil((cr.C-f.length)/7.4)));if(need!==cr.need){cr.need=need;cr.carpet.geometry.setDrawRange(0,need*6)}cr.carpet.visible=need>0&&!!FEST.view}
 if(cr.carpet&&cr.carpet.visible){const y=Math.max(0,Math.sin(t*bpm*Math.PI))*.05*hy;if(Math.abs(y-cr.carpetY)>.004){cr.carpet.position.y=y;cr.carpetY=y}}
 if(camr){camr.updateMatrixWorld();FPM.multiplyMatrices(camr.projectionMatrix,camr.matrixWorldInverse);FFR.setFromProjectionMatrix(FPM)}
 cr.tiles.forEach(T=>{if(!T.k||!force&&camr&&!FFR.intersectsSphere(T.bs))return;
  /* v26.39.0: four dance styles (jumpers, swayers, arm-wavers, head-boppers), all livelier as the hype goes up; the
     whole crowd jumps together on the beat when it is really going off */
  for(let j=0;j<T.k;j++){const p=f[T.ids[j]],e=hy*(p.up<hy?1:.35),bt=t*bpm*Math.PI+p.ph*(live?.25:1),bo=Math.sin(bt),dn=p.dn;let jump,ry=p.ry,x=p.x,az=0,
    arm=p.up<hy*.9?2.75+Math.sin(t*3+p.ph)*.25:p.arm*(hy>.3?1:.4);
   if(dn==1){const sw=Math.sin(bt*.5);jump=Math.abs(bo)*.05*(.3+e);ry+=sw*.4*(.3+e);x+=sw*.1*e}
   else if(dn==2){jump=Math.max(0,bo)*(.03+.12*e);if(hy>.3){arm=2.85;az=Math.sin(t*2.2+p.ph)*.55*(.4+e)}}
   else if(dn==3){jump=Math.max(0,bo)*.05+(hy>.7&&bo>.85?.12:0)}
   else jump=Math.max(0,bo)*(.04+.26*e);
   if(hy>.8&&live)jump=Math.max(jump,Math.max(0,Math.sin(t*bpm*Math.PI))*.3);
   FQ.setFromAxisAngle(FAY,ry);FSV.set(p.s,p.s,p.s);FV.set(x,jump,p.z);FMX.compose(FV,FQ,FSV);T.top.setMatrixAt(j,FMX);T.skin.setMatrixAt(j,FMX);
   FQ2.setFromAxisAngle(FAX,arm);if(az){FQ3.setFromAxisAngle(FAZ,az);FQ2.premultiply(FQ3)}FQ2.premultiply(FQ);FV.y=jump+1.04*p.s;FMX.compose(FV,FQ2,FSV);T.arms.setMatrixAt(j,FMX)}
  T.top.instanceMatrix.needsUpdate=T.skin.instanceMatrix.needsUpdate=T.arms.instanceMatrix.needsUpdate=true;
  if(force&&T.top.instanceColor)T.top.instanceColor.needsUpdate=T.skin.instanceColor.needsUpdate=T.arms.instanceColor.needsUpdate=true});
 if(cr.flag.count){let k=0;cr.fl.forEach(q=>{if(q.i<n){FQ.setFromAxisAngle(FAY,q.ry+Math.sin(t*1.3+q.ph)*.5);FSV.set(1,1,1);FV.set(q.x,Math.max(0,Math.sin(t*bpm*Math.PI+q.ph))*.15*hy,q.z);FMX.compose(FV,FQ,FSV);cr.flag.setMatrixAt(k++,FMX)}});cr.flag.instanceMatrix.needsUpdate=true}}

/* ---- 6. festival-goers walking about, and the crew on build / take-down days ---- */
const fCfg=()=>({skin:RI(0,5),eyes:RI(0,4),mouth:RI(0,3),hair:RI(0,11),hc:RI(0,11),top:RI(0,4),tc:RI(0,9),pc:RI(0,7),body:Math.random()});
function festWalkers(){const grp=fGroup('fest'),L=[[1,FEST.GZ-1.5,220,316],[1,FEST.GZ+1.5,220,316],[1,FEST.GZ,230,316],[0,229,-116,-10],[0,232,-116,-10],[0,230.5,-70,-12],[0,320,-110,-10],[0,319,-108,-12],[1,FEST.GZ-2.5,236,316],[0,233,-112,-70]];
 L.forEach(([ax,c,a,b])=>{const o=buildChar(fCfg());grp.add(o.g);FEST.walk.push({o,ax,c,a,b,p:R(a,b),dir:Math.random()<.5?1:-1,sp:R(.9,1.4),t:R(0,6)})})}
function festWorker(grp,x,z,ry,job){const o=buildChar(Object.assign(fCfg(),{body:.5}));o.g.position.set(x,0,z);o.g.rotation.y=ry;
 B(o.g,.66,.46,.45,'#ff8c1a',0,.86,0);B(o.g,.67,.06,.46,'#e8e8e8',0,.78,0);B(o.g,.67,.06,.46,'#e8e8e8',0,.98,0);B(o.g,.62,.15,.62,job=='lift'?'#ffffff':'#ffd21a',0,1.77,0);B(o.g,.72,.04,.72,job=='lift'?'#ffffff':'#ffd21a',0,1.7,.04);
 if(job=='hammer')B(o.arms[1],.08,.08,.5,'#6b4a2e',0,-.55,.22);grp.add(o.g);FEST.work.push({o,job,ph:R(0,6)})}
function festBuildWorks(kind){const grp=fGroup(kind),G=fAll(),Gl=fAll(),{X0,X1,Z0,Z1,GZ}=FEST,rnd=fRng(fHash('works'+kind)),RR=(a,b)=>a+rnd()*(b-a),cols=[];
 FSTG.forEach(s=>{const Gs=fAll(),U=festFadeU(kind,festStageBoxes(s).slice(0,1));festStageGeo(Gs,Gl,grp,s,kind);if(kind=='build'&&s.n==1)U.boxes.push([s.cx-10,s.zf+5,s.cx+12,s.zf+9,4]);festFadeMerge(U,Gs,null,grp)});
 FSTG.forEach(s=>cols.push([s.x0-.7,s.zb-.3,s.x1+.7,s.zf+.75]));
 if(kind=='down')FSTG.forEach(s=>{const[a,b,c,d]=s.area;fBox(G,c-a+4,.01,d-b+3,'#8a8a50',(a+c)/2,.006,(b+d)/2-1);for(let i=0;i<14;i++)xgPrism(G,RR(1.5,4),RR(1.5,4),.012,9,'#7a6038',RR(a,c),.008,RR(b,d))});
 /* fence: on build day it is going up from the gate, on take-down day most panels are stacked */
 const pan=(x,z,ax)=>{if(ax=='x'){fBox(G,3.3,1.7,.02,'#aeb4ba',x,1.1,z);fBox(G,3.4,.08,.08,'#c8ccd2',x,1.95,z);fBox(G,.5,.18,.3,'#7d7d7d',x-1.7,.09,z)}else{fBox(G,.02,1.7,3.3,'#aeb4ba',x,1.1,z);fBox(G,.08,.08,3.4,'#c8ccd2',x,1.95,z);fBox(G,.3,.18,.5,'#7d7d7d',x,.09,z-1.7)}};
 const frac=kind=='build'?.55:.25;for(let x=X0+1.7;x<X0+(X1-X0)*frac;x+=3.4)pan(x,Z1,'x');for(let z=Z1-1.7;z>Z1-(Z1-Z0)*frac;z-=3.4)if(z<GZ-5||z>GZ+5)pan(X0,z,'z');
 const stack=(x,z)=>{for(let i=0;i<8;i++)fBox(G,3.4,.06,2,i%2?'#aeb4ba':'#c8ccd2',x,.15+i*.07,z);fBox(G,3.5,.12,1.2,'#a07a48',x,.06,z)};
 [[240,GZ-8],[300,-118],[330,-8],[380,-60],[260,-8]].forEach(p=>{stack(p[0],p[1]);cols.push([p[0]-1.8,p[1]-1.1,p[0]+1.8,p[1]+1.1])});
 /* trucks (articulated lorries), a forklift, a cherry picker or skips, cones, cable drums, pallets, portaloos for the crew */
 const truck=(x,z,ry,col,load)=>{fObj(G,x,z,ry,[[2.5,2.8,2.4,col,0,1.9,5.6,dk(col,.85)],[2.3,1,.05,'#bfe3f5',0,2.6,6.81],[2.6,3.2,11,'#e8e8ec',0,2.3,-1.2,'#d8d8de'],[2.62,.5,11,dk(col,.9),0,.6,-1.2],
   [.9,.9,.4,'#151515',1.2,.45,5.4],[.9,.9,.4,'#151515',-1.2,.45,5.4],[.9,.9,.4,'#151515',1.2,.45,-5],[.9,.9,.4,'#151515',-1.2,.45,-5],[.9,.9,.4,'#151515',1.2,.45,-3.8],[.9,.9,.4,'#151515',-1.2,.45,-3.8]]);
  const c=Math.cos(ry),s=Math.sin(ry);cols.push([x-Math.abs(c)*1.4-Math.abs(s)*6.8,z-Math.abs(s)*1.4-Math.abs(c)*6.8,x+Math.abs(c)*1.4+Math.abs(s)*6.8,z+Math.abs(s)*1.4+Math.abs(c)*6.8])};
 truck(300,GZ,Math.PI/2,'#d8462b');truck(352,-92,0,'#2f6fd0');truck(258,-92,0,'#2fae5a');truck(290,-30,Math.PI,'#f5b915');
 /* tail-lift text on each trailer */
 [[300,GZ,Math.PI/2],[352,-92,0],[258,-92,0],[290,-30,Math.PI]].forEach(([x,z,ry])=>{const t=fSignTex('STAGECRAFT',kind=='build'?'festival build crew':'load-out crew','#e8e8ec','#c0392b',512,128);const c=Math.cos(ry),s=Math.sin(ry);fPlane(t,7,1.7,x+c*1.32,2.4,z-s*1.32,ry+Math.PI/2,grp)});
 fObj(G,330,-70,.4,[[1.4,1.2,2.2,'#f5c400',0,.9,0,'#d9ad00'],[.1,3,.1,'#333',.5,1.5,1.1],[.1,3,.1,'#333',-.5,1.5,1.1],[1.2,.08,1,'#a07a48',0,.9,1.8],[.6,.6,.25,'#151515',.6,.3,-.6],[.6,.6,.25,'#151515',-.6,.3,-.6]]);cols.push([328.8,-71.6,331.2,-68.4]);
 if(kind=='build'){/* a mobile crane lifting the main stage truss */
  fObj(G,386,-100,0,[[3,1.6,7,'#f5c400',0,1.4,0,'#d9ad00'],[2.4,1.6,2,'#f5c400',0,2.8,-1.5]]);xgBoxR(G,.6,20,.6,'#f5c400',383,10,-102,.45,0,.35);fBox(G,.05,9,.05,'#222',378,10.5,-106);cols.push([384.4,-103.6,387.6,-96.4])}
 else for(let i=0;i<3;i++){const x=250+i*50,z=-12;fObj(G,x,z,0,[[4,1.4,2,'#e0a020',0,.9,0],[4.2,.1,2.2,'#c08010',0,1.62,0]]);for(let k=0;k<9;k++)xgPrism(G,.35,.2,.55,6,pick(['#1d1d22','#2a2a2a','#3a5a3a']),x+RR(-1.6,1.6),1.5,z+RR(-.7,.7));cols.push([x-2.1,z-1.1,x+2.1,z+1.1])}
 for(let i=0;i<46;i++){const x=i<20?222+i*4.8:RR(250,400),z=i<20?GZ+(i%2?3.8:-3.8):RR(-110,-10);if(festInStage(x,z,2))continue;xgPrism(G,.24,.03,.6,8,'#ff6a1a',x,0,z);fBox(G,.42,.04,.42,'#222',x,.02,z);xgPrism(G,.16,.12,.1,8,'#f0f0f0',x,.28,z)}
 for(let i=0;i<6;i++){const x=RR(250,390),z=RR(-100,-20);if(festInStage(x,z,2))continue;fObj(G,x,z,RR(0,3),[[.2,1.3,1.3,'#7a5a38',-.5,.65,0],[.2,1.3,1.3,'#7a5a38',.5,.65,0],[.85,.95,.95,'#1d1d22',0,.65,0]])}
 for(let i=0;i<10;i++){const x=RR(235,400),z=RR(-112,-12);if(festInStage(x,z,2))continue;fBox(G,1.2,.15,1,'#b08a58',x,.08,z);if(rnd()<.6)fBox(G,1.1,RR(.3,.9),.9,pick(['#2b2b33','#555','#c0392b','#e8e8e8']),x,.5,z)}
 for(let i=0;i<3;i++){const z=-24+i*2.2,x=240;fObj(G,x,z,0,[[1.4,2.4,1.3,'#2f6fd0',0,1.2,0,'#e8e8e8']]);cols.push([x-.7,z-.65,x+.7,z+.65])}
 /* site office cabin with a sign */
 fObj(G,232,GZ-12,0,[[6,2.6,2.6,'#e8e8ec',0,1.4,0,'#c8c8d0'],[1,1.9,.05,'#2a6fd0',1.5,1.1,1.31],[1.6,.9,.05,'#bfe3f5',-1.3,1.6,1.31],[6.2,.2,2.8,'#9a9aa2',0,.1,0]]);cols.push([228.9,GZ-13.4,235.1,GZ-10.6]);
 const so=fSignTex(kind=='build'?'SITE OFFICE':'SITE OFFICE',kind=='build'?'festival opens tomorrow':'load-out in progress','#ffe066','#14121a',512,128);fPlane(so,3,.75,232,2.4,GZ-10.66,0,grp);
 const gs=fSignTex(kind=='build'?'PARK FIELDS FESTIVAL':'THANKS FOR COMING!',kind=='build'?'opens tomorrow · Day '+festNext(S.day):'next festival · Day '+festNext(S.day),'#2b1240','#ffe066',768,160);FEST.workSign=FEST.workSign||{};
 fBox(G,.3,3,.3,'#555',X0-1,1.5,GZ-3);fBox(G,.3,3,.3,'#555',X0-1,1.5,GZ+3);FEST.workSign[kind]=fPlane(gs,6,1.25,X0-1.2,2.6,GZ,-Math.PI/2,grp);fPlane(gs,6,1.25,X0-.8,2.6,GZ,Math.PI/2,grp);
 fMerge(G,grp);fMerge(Gl,grp,new THREE.MeshBasicMaterial({vertexColors:true}));
 /* the crew */
 const W=kind=='build'?[[350,-104,0,'hammer'],[372,-104,0,'hammer'],[363,-98,Math.PI,'lift'],[274,-106,0,'hammer'],[286,-106,.3,'carry'],[296,-48,Math.PI,'hammer'],[258,-48,Math.PI,'carry'],[300,GZ+3,Math.PI,'lift'],[226,GZ+2,1.5,'hammer'],[235,GZ-9,0,'lift'],[352,-82,Math.PI,'carry'],[330,-67,Math.PI,'carry']]
  :[[352,-104,0,'carry'],[376,-104,0,'hammer'],[363,-98,Math.PI,'lift'],[278,-106,0,'carry'],[296,-48,Math.PI,'hammer'],[262,-46,Math.PI,'carry'],[300,GZ+3,Math.PI,'lift'],[235,GZ-9,0,'lift'],[252,-14,Math.PI,'carry'],[300,-14,Math.PI,'carry']];
 FEST['work_'+kind]=[];const w0=FEST.work.length;W.forEach(w=>festWorker(grp,w[0],w[1],w[2],w[3]));FEST['work_'+kind]=FEST.work.slice(w0);
 FEST['cols_'+kind]=cols}
const festInStage=(x,z,m)=>FSTG.some(s=>x>s.x0-3-m&&x<s.x1+3+m&&z>s.zb-1-m&&z<s.zf+3+m);

/* ---- 7. which phase is showing: groups, colliders, interactions, map marker ---- */
function festApply(ph){FEST.ph=ph;FEST.day=S.day;
 if(ph=='fest'&&!FEST.grp.fest)festBuildFest();if((ph=='build'||ph=='down')&&!FEST['cols_'+ph])festBuildWorks(ph);
 ['fest','build','down'].forEach(k=>{if(FEST.grp[k])FEST.grp[k].visible=k==ph});FEST.lg.visible=ph=='fest';
 FEST.cols.forEach(c=>{const i=cols.indexOf(c);if(i>=0)cols.splice(i,1)});FEST.cols=ph=='fest'?FEST.colsF.slice():ph?FEST['cols_'+ph].slice():[];FEST.cols.forEach(c=>cols.push(c));
 if(ph=='fest'){FSTG.forEach(s=>{if(s.cr){s.cr.C=festAmbient(s);s.cr.shown=-1}});festBoardDraw()}
 if(ph&&FEST.workSign&&FEST.workSign[ph]){/* the gate sign names the right day */const m=FEST.workSign[ph];const t=fSignTex(ph=='build'?'PARK FIELDS FESTIVAL':'THANKS FOR COMING!',ph=='build'?'opens tomorrow · Day '+festNext(S.day):'next festival · Day '+festNext(S.day),'#2b1240','#ffe066',768,160);m.material.map.dispose();m.material.map=t;m.material.needsUpdate=true}
 festPoi()}
function festPoi(){let p=POIS.find(q=>q.fest);if(!p){p=[FEST.X0+14,FEST.GZ-2,'',"#ff6ad5"];p.fest=1;POIS.push(p)}const ph=FEST.ph;
 p[2]=ph=='fest'?'Festival · ON TODAY':ph=='build'?'Festival · opens tomorrow':ph=='down'?'Festival ground':'Festival ground · Day '+festNext(S.day)}
/* one check per frame: did the day change? */
function festSync(){if(!FEST.lg){FEST.lg=new THREE.Group();scene.add(FEST.lg)}const ph=festPhase();if(ph!==FEST.ph||S.day!==FEST.day){festApply(ph);festNotice()}}
function festNotice(){if(FEST.seen[S.day]||mode=='load'||mode=='creator'||!S.artist)return;FEST.seen[S.day]=1;const ph=FEST.ph;
 if(ph=='fest'){const b=fBk().find(q=>q.day==S.day&&!q.st);setTimeout(()=>say('Park Fields Festival is on today, east of Park Avenue!'+(b?' You play Stage '+b.n+' at '+fHM(FSLOT[b.slot][0])+'.':' 4 stages, food and a bar.')),1200)}
 else if(ph=='build')setTimeout(()=>say('A crew is building Park Fields Festival east of Park Avenue. It opens tomorrow (Day '+festNext(S.day)+').'),1200)}

/* ---- 8. interactions ---- */
function festInts(){const a=[],ph=FEST.ph;if(!ph||IN||HIN)return a;if(P.x<FEST.X0-12||P.x>FEST.X1+6||P.z<FEST.Z0-6||P.z>FEST.Z1+6)return a;
 if(ph=='fest'){FSTG.forEach(s=>{a.push({x:s.ix,z:s.iz,r:2.2,l:festStageLabel(s),a:()=>festStageUse(s.n)})});
  FFOOD.forEach(f=>{const[k,name,x,z,fc,,kind]=f;a.push({x:kind=='bar'?x+2.4:x+fc*(kind=='van'?2.4:1.6),z:kind=='van'?z-.3:z,r:kind=='bar'?3:2,l:(kind=='bar'?'Order at ':'Buy at ')+name,a:()=>festShop(k)})});
  a.push({x:220.5,z:FEST.GZ-4.6,r:2,l:'Read the line-up board',a:festInfo})}
 else a.push({x:232,z:FEST.GZ-9.4,r:2.4,l:'Talk to the site manager',a:()=>{snd('pop');say(ph=='build'?'Site manager: "Stages go up today. Gates open tomorrow, Day '+festNext(S.day)+'. Bring your best songs!"':'Site manager: "That\'s a wrap! Taking it all down. Next festival is Day '+festNext(S.day)+'."')}});
 return a}
{const d0=dynInt;dynInt=function(){const a=d0();try{return a.concat(festInts())}catch(e){return a}}}
function festShop(k){const f=FFOOD.find(q=>q[0]==k);if(!f)return;GR=f[1]+': '+FGREET[k];
 shopModal(f[1]+' <small class=m>· festival prices</small>',()=>f[7].map(m=>[m[0],m[1],'+'+m[2]+' energy'+(m[3]?' · refills stamina':'')+' <span style="opacity:.6">· about $'+Math.round(m[1]/1.4)+' in town</span>']),i=>{const m=f[7][i];
  if(S.money<m[1]){snd('err');return say('Not enough money for that.')}if(!m[3]&&S.energy>=100){snd('err');return say('You are already full of energy.')}
  S.money=+(S.money-m[1]).toFixed(2);S.energy=Math.min(100,S.energy+m[2]);if(m[3]){S.stam=100;S.exh=0}updateVersion();snd('eat');say((m[3]?'Refreshing! ':'Yum! ')+m[0]+' · +'+m[2]+' energy')})}
function festInfo(){snd('pop');mode='menu';const lv=festLv(),F=festS(),k=festSlotAt();
 $('ui').innerHTML=`<div class="box modal"><h2>Park Fields Festival · Day ${S.day}</h2><p class=m>You are Fame Level ${lv}. ${clk()} now. To play, book a slot on <b>FestivalApp</b> (free, on your computer) at least 2 days before a festival.</p>
  <div style="max-height:52vh;overflow:auto">${FSTG.slice().reverse().map(s=>{const p=F.p[s.n];
  return`<div class=ng style="display:block"><b style="color:${s.col}">Stage ${s.n}</b> · ${s.name} <small class=m>· Fame Level ${s.req} · pay x${s.mult}${p?' · you played to '+p.c.toLocaleString()+' people for '+$$(p.pay):''}</small><br>
   <small>${FSLOT.map((sl,i)=>{const a=festSlotAct(S.day,s.n,i),now=i==k;return`<span style="display:inline-block;margin:2px 10px 0 0;${now?'color:#ffe066;font-weight:bold':a.you?'color:#2fe68a;font-weight:bold':'opacity:.8'}">${fHM(sl[0])} ${esc(a.you?'YOU':a.name)}${now?' (now)':''}</span>`}).join('')}</small></div>`}).join('')}</div>
  <p class=m><small>Food and drinks are about 1.4x the usual price. Performing takes 15 energy.</small></p><button onclick="closeUI()">Close</button></div>`}
