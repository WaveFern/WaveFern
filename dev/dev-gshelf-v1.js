/* WaveFern dev: Gramophone shelves and stream awards. Only loaded on /dev/ (see dev/index.html). Add ?nogshelf to skip it.
   1. Plaques only from 100M streams on a song: Platinum at 100M, Diamond at 1B (the old Gold / 10M tiers no longer fire).
   2. Big awards for your total streams: 1B, 10B and 100B. Each is a showpiece with a spinning, glowing centrepiece,
      delivered to Storage like a plaque.
   3. Amazoom sells a Gramophone Shelf. It only holds Gramophone trophies (6 per shelf): walk up to it at home and press E. */
(function(){
 if(!window.FW_DEV||/[?&]nogshelf/.test(location.search))return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev polish '+t,e)}}};
 const fmt=n=>Math.round(n).toLocaleString();
 const mail=b=>safe(()=>{if(Array.isArray(S.msgs))S.msgs.push({id:S.nid++,from:'WaveFern Team',body:b,state:9,unread:1,day:S.day})},'mail');
 const live=()=>typeof S=='object'&&S&&S.artist&&Array.isArray(S.songs)&&mode!='load'&&mode!='menu';
 const phong=(c,e,ei)=>new THREE.MeshPhongMaterial({color:c,emissive:e||0,emissiveIntensity:ei||0,shininess:120,specular:0xffffff});
 /* ===== 1 & 2. plaques and big awards ===== */
 const PQ2=[[1e8,'Platinum','#d8dde3'],[1e9,'Diamond','#9be7ff']];
 const AWD={
  awd_t1b:{n:'Billion Streams Award',p:0,w:.9,d:.9,b:[[.9,.18,.9,'#111',0,.09,0],[.8,.06,.8,'#c9a227',0,.21,0],[.7,.7,.7,'#1a1a1f',0,.59,0],[.74,.05,.74,'#c9a227',0,.96,0],[.1,.5,.1,'#e6c35a',0,1.23,0]],
   fx:g=>{const s=new THREE.Group();s.position.y=1.75;s.name='spin';g.add(s);
    const d=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.04,40),phong('#d4af37','#6b4f10',.6));d.rotation.x=Math.PI/2;s.add(d);
    const r=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.05,24),phong('#1ed760','#0d6b30',1));r.rotation.x=Math.PI/2;s.add(r);
    const h=new THREE.Mesh(new THREE.TorusGeometry(.5,.025,8,48),phong('#fff2b0','#c9a227',.8));s.add(h)}},
  awd_t10b:{n:'Ten Billion Streams Award',p:0,w:.9,d:.9,b:[[.9,.2,.9,'#e8e8ec',0,.1,0],[.7,.9,.7,'#22283a',0,.65,0],[.76,.06,.76,'#9be7ff',0,1.13,0],[.02,.9,.02,'#cfeeff',.34,1.6,.34],[.02,.9,.02,'#cfeeff',-.34,1.6,.34],[.02,.9,.02,'#cfeeff',.34,1.6,-.34],[.02,.9,.02,'#cfeeff',-.34,1.6,-.34],[.72,.04,.72,'#cfeeff',0,2.06,0]],
   fx:g=>{const s=new THREE.Group();s.position.y=1.6;s.name='spin';g.add(s);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.26),phong('#9be7ff','#2a7fa8',.9));gem.scale.y=1.4;s.add(gem);
    for(let i=0;i<6;i++){const q=new THREE.Mesh(new THREE.OctahedronGeometry(.05),phong('#ffffff','#9be7ff',1));const a=i/6*Math.PI*2;q.position.set(Math.cos(a)*.3,Math.sin(a*2)*.08,Math.sin(a)*.3);s.add(q)}
    const glass=new THREE.Mesh(new THREE.BoxGeometry(.68,.9,.68),new THREE.MeshPhongMaterial({color:0xdff6ff,transparent:true,opacity:.18,shininess:150,depthWrite:false}));glass.position.y=1.6;g.add(glass)}},
  awd_t100b:{n:'Hundred Billion Monument',p:0,w:1.2,d:1.2,b:[[1.2,.2,1.2,'#141018',0,.1,0],[1,.2,1,'#2a1f3a',0,.3,0],[.8,.9,.8,'#1a1424',0,.85,0],[.86,.06,.86,'#e6b422',0,1.33,0],[.84,.04,.84,'#b377ff',0,.42,0]],
   fx:g=>{const s=new THREE.Group();s.position.y=2.05;s.name='spin';g.add(s);
    s.add(new THREE.Mesh(new THREE.SphereGeometry(.34,28,20),phong('#e6b422','#7a4f00',.7)));
    [[.55,0],[.62,1.1],[.7,-1.1]].forEach(q=>{const t=new THREE.Mesh(new THREE.TorusGeometry(q[0],.022,8,64),phong('#d6b4ff','#8a3dff',1));t.rotation.x=Math.PI/2+q[1]*.5;t.rotation.y=q[1];s.add(t)});
    const st=new THREE.Mesh(new THREE.OctahedronGeometry(.09),phong('#ffffff','#ffffff',1));st.position.set(0,.5,0);s.add(st);
    const pl=new THREE.PointLight(0xb377ff,.7,4);pl.position.y=2;g.add(pl)}}};
 Object.keys(AWD).forEach(k=>{if(!(k in F))Object.defineProperty(F,k,{value:AWD[k],enumerable:false,configurable:true,writable:true})});

 const give=(k,msg)=>{S.inv=S.inv||{};S.inv[k]=(S.inv[k]||0)+1;mail(msg);safe(()=>{snd('cash');say(F[k].n+' delivered to your Storage!')},'say')};
 const TIERS=[[1e9,'t1b','1,000,000,000'],[1e10,'t10b','10,000,000,000'],[1e11,'t100b','100,000,000,000']];
 function plaques(){
  S.plq=Array.isArray(S.plq)?S.plq:[];const first=!S.pqv2;
  for(const s of S.songs){
   s.pq=4;/* the old 1M / 10M tiers never fire on dev */
   const st=s.streams||0,n=PQ2.filter(p=>st>=p[0]).length;
   if(s.pq2===undefined)s.pq2=first?n:0;
   if(n>s.pq2){const p=PQ2[s.pq2];s.pq2++;S.plq.push({s:s.title,t:p[1],c:p[2],n:p[0],d:S.day});S.inv=S.inv||{};S.inv['plq_'+(S.plq.length-1)]=1;
    mail('Congratulations! "'+s.title+'" passed '+fmt(p[0])+' streams. Your '+p[1]+' plaque has arrived in your Storage. Press F at home to hang it.');
    safe(()=>{snd('cash');say(p[1]+' plaque for "'+s.title+'" is in your Storage')},'say');return}}
  S.pqv2=1;const A=S.dvaw=S.dvaw||{},T=S.streams||0;
  for(const[v,k,txt]of TIERS)if(T>=v&&!A[k]){A[k]=1;return give('awd_'+k,'You passed '+txt+' streams in total. Your '+F['awd_'+k].n+' is in your Storage. Press F at home to place it.')}}

 /* ===== 2. the Gramophone Shelf (Amazoom): holds trophies only ===== */
 const CAP=6;
 F.gshelf={n:'Gramophone Shelf',p:3500,w:2,d:.5,b:[[2,.08,.5,'#3a2412',0,.04,0],[.08,2,.5,'#3a2412',-.96,1,0],[.08,2,.5,'#3a2412',.96,1,0],[2,.06,.5,'#5a3a22',0,.9,0],[2,.06,.5,'#5a3a22',0,1.75,0],[2,.08,.5,'#3a2412',0,2,0],[1.84,2,.04,'#1f1410',0,1,-.23],[1.84,.03,.06,'#e6b422',0,.94,.23],[1.84,.03,.06,'#e6b422',0,1.79,.23],[.7,.14,.03,'#e6b422',0,2.16,.2]],xd:1};
 if(typeof AZ=='object'&&!AZ.gshelf)AZ.gshelf=['Tomeheap Gramophone Display Shelf','Walnut, gold trim. Holds up to 6 Gramophone trophies and nothing else',4.9,'1.2K','500+',4200,'New','Decor'];
 const shelves=()=>(typeof PL!='undefined'?PL:[]).filter(q=>q.t=='gshelf');
 function shelfDraw(){const L=shelves();let left=S.gsh||0;
  /* a shelf that was put back in Storage hands its trophies back */
  const cap=L.length*CAP;if(left>cap){S.inv=S.inv||{};S.inv.trophy=(S.inv.trophy||0)+(left-cap);S.gsh=left=cap}
  L.forEach(q=>{if(!q.m)return;const n=Math.min(CAP,left);left-=n;if(q.m.userData.gn===n)return;q.m.userData.gn=n;
   const old=q.m.getObjectByName('gtro');if(old)q.m.remove(old);const g=new THREE.Group();g.name='gtro';q.m.add(g);
   for(let i=0;i<n;i++){let t;if(typeof awTrophy=='function')t=awTrophy(.42);else{t=new THREE.Group();F.trophy.b.forEach(p=>B(t,p[0],p[1],p[2],p[3],p[4],p[5],p[6]));t.scale.setScalar(.42)}
    t.position.set(-.6+(i%3)*.6,i<3?.93:1.78,0);g.add(t)}})}
 window.devShelf=function(a){const L=shelves();S.inv=S.inv||{};
  if(a==1){if(!(S.inv.trophy>0)){snd('err');return say('You have no Gramophone trophies in Storage. Win one at the Gramophone Awards.')}
   if((S.gsh||0)>=L.length*CAP){snd('err');return say('Your shelves are full. Buy another Gramophone Shelf on Amazoom.')}
   S.inv.trophy--;S.gsh=(S.gsh||0)+1;snd('pop');say('Trophy on the shelf.')}
  else if(a==2){if(!(S.gsh>0))return;S.gsh--;S.inv.trophy=(S.inv.trophy||0)+1;snd('pop');say('Trophy back in Storage.')}
  shelfDraw();shelfUI()};
 function shelfUI(){mode='menu';const n=S.gsh||0,cap=shelves().length*CAP,inv=(S.inv&&S.inv.trophy)||0;
  $('ui').innerHTML=`<div class="box modal"><h2>Gramophone Shelf</h2><p class=m>${n} of ${cap} spaces used · ${inv} trophy${inv==1?'':'s'} in Storage</p><p>Only Gramophone trophies go on this shelf.</p>
  <div class=row2><button class=go onclick="devShelf(1)" ${inv&&n<cap?'':'disabled'}>Put a trophy on</button><button onclick="devShelf(2)" ${n?'':'disabled'}>Take one off</button><button onclick="closeUI()">Close</button></div></div>`}
 if(typeof dynInt=='function'){const d0=dynInt;dynInt=function(){const a=d0.apply(this,arguments);
  safe(()=>{if(HIN&&!IN)shelves().forEach(q=>{if(Math.hypot(P.x-q.x,P.z-q.z)<2.6)a.push({x:q.x,z:q.z,r:2.6,l:'Gramophone Shelf',a:shelfUI})})},'shelf int');return a}}

 /* ===== per frame ===== */
 let t1=0;
 {const u0=update;update=function(dt){u0(dt);
  safe(()=>{if(typeof PL!='undefined')PL.forEach(q=>{if(q.m&&/^awd_/.test(q.t)){const s=q.m.getObjectByName('spin');if(s)s.rotation.y+=dt*.8}})},'spin');
  t1+=dt;if(t1<1)return;t1=0;
  if(live()){safe(plaques,'plaques');if(mode=='play')safe(shelfDraw,'shelf')}}}
})();
