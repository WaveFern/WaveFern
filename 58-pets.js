/* ===== v26.42.0: detailed, animated pets ===== */
/* Pixel Cat, Good Boy Dog, Polly Parrot and Foxy get proper models: tabby stripes, saddle and blaze, feather layers,
   ears, eyes with highlights, noses, whiskers, tails, paws and collars. Each one is rigged (head, eyes, ears, tail chain,
   legs, wings) and animated: breathing, blinking, ear twitches, tail wags and a trotting walk cycle.
   The pet groups made by syncF / addNPC are kept (other code moves and scales them); only their children are replaced.
   The parrot keeps flying (35-parrot-flight.js): its wing pivots are handed over as g.userData.pw. */
const PTM=new THREE.MeshLambertMaterial({vertexColors:true}),PTE=new THREE.MeshBasicMaterial({vertexColors:true});
const PT_Q=new THREE.Quaternion(),PT_E=new THREE.Euler(),PT_V=new THREE.Vector3(),PT_U=new THREE.Vector3(0,1,0),PT_C=new THREE.Color();
/* record: [colour, cx,cy,cz, w0,h,d0, w1,d1, ox,oz, quaternion|null] - a box whose top face can be resized and shifted */
const ptR=(L,c,x,y,z,w,h,d,o)=>{o=o||{};L.push([c,x,y,z,w,h,d,o.w1==null?w:o.w1,o.d1==null?d:o.d1,o.ox||0,o.oz||0,o.q||((o.rx||o.ry||o.rz)?new THREE.Quaternion().setFromEuler(PT_E.set(o.rx||0,o.ry||0,o.rz||0)):null)])};
const pbx=(L,c,w,h,d,x,y,z,rx,ry,rz)=>ptR(L,c,x,y,z,w,h,d,{rx,ry,rz});
const ptp=(L,c,w,h,d,x,y,z,w1,d1,ox,oz,rx,ry,rz)=>ptR(L,c,x,y,z,w,h,d,{w1,d1,ox,oz,rx,ry,rz});
/* a tapered square limb from point A to point E (widths w0 at A, w1 at E) */
function pseg(L,c,A,E,w0,w1,d0,d1){const v=new THREE.Vector3(E[0]-A[0],E[1]-A[1],E[2]-A[2]),h=v.length();v.normalize();
 ptR(L,c,(A[0]+E[0])/2,(A[1]+E[1])/2,(A[2]+E[2])/2,w0,h,d0==null?w0:d0,{w1,d1:d1==null?w1:d1,q:new THREE.Quaternion().setFromUnitVectors(PT_U,v)})}
/* merge records into one geometry, all six faces (pets are seen from every side), positions relative to pivot p */
function ptGeo(L,p){const P=[],N=[],C=[],cn=[[-1,-1],[1,-1],[1,1],[-1,1]];
 L.forEach(r=>{const[c,x,y,z,w,h,d,w1,d1,ox,oz,q]=r;PT_C.set(c);const v=[];
  cn.forEach(k=>v.push(new THREE.Vector3(k[0]*w/2-ox/2,-h/2,k[1]*d/2-oz/2)));cn.forEach(k=>v.push(new THREE.Vector3(k[0]*w1/2+ox/2,h/2,k[1]*d1/2+oz/2)));
  v.forEach(a=>{if(q)a.applyQuaternion(q);a.x+=x-p[0];a.y+=y-p[1];a.z+=z-p[2]});
  const ce=new THREE.Vector3();v.forEach(a=>ce.add(a));ce.multiplyScalar(1/8);
  [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].forEach(f=>{let q4=f.map(i=>v[i]);const n=new THREE.Vector3(),fc=new THREE.Vector3();
   for(let i=0;i<4;i++){const a=q4[i],b=q4[(i+1)%4];n.x+=(a.y-b.y)*(a.z+b.z);n.y+=(a.z-b.z)*(a.x+b.x);n.z+=(a.x-b.x)*(a.y+b.y);fc.add(a)}
   if(n.lengthSq()<1e-12)return;fc.multiplyScalar(.25);if(n.dot(fc.sub(ce))<0){q4=q4.slice().reverse();n.negate()}n.normalize();
   [0,1,2,0,2,3].forEach(i=>{const a=q4[i];P.push(a.x,a.y,a.z);N.push(n.x,n.y,n.z);C.push(PT_C.r,PT_C.g,PT_C.b)})})});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeBoundingSphere();return g}

/* ---------- species specs: parts with an absolute rest-pose pivot p, parent name and boxes in model space ---------- */
/* model faces +z, feet on y=0, roughly the size of the old block pets (syncF scales them by .7, NPC owners by .6) */
function ptQuad(k){const S={},part=(n,par,p,f,eye)=>{const L=[];f(L);S[n]={n,par,p,L,eye}};
 const toes=(L,x,y,z,c)=>[-.02,.02].forEach(dx=>pbx(L,c,.006,.022,.012,x+dx,y,z));
 if(k==0){/* Pixel Cat: ginger tabby */
  const c='#e39b5b',dk='#b8682e',lt='#f8e6cc',pk='#f29aa8';
  part('body','R',[0,.37,0],L=>{pbx(L,c,.28,.26,.6,0,.37,0);pbx(L,c,.3,.23,.18,0,.36,-.2);pbx(L,c,.29,.25,.15,0,.38,.2);
   pbx(L,lt,.22,.04,.46,0,.235,.02);pbx(L,lt,.2,.17,.035,0,.37,.31);
   [[-.24,.156],[-.15,.156],[-.04,.146],[.06,.146],[.16,.151]].forEach(([z,hw])=>{pbx(L,dk,.2,.012,.05,0,.505,z);[-1,1].forEach(s=>pbx(L,dk,.012,.12,.045,s*hw,.44,z))});
   pbx(L,dk,.06,.012,.5,0,.507,-.04);
   pbx(L,c,.18,.15,.12,0,.5,.3);pbx(L,'#d6303a',.21,.045,.15,0,.51,.31);pbx(L,'#f5c542',.05,.05,.05,0,.465,.39);pbx(L,'#8a6a10',.04,.008,.01,0,.46,.416)});
  part('head','R',[0,.52,.3],L=>{pbx(L,c,.3,.24,.24,0,.64,.4);pbx(L,c,.34,.12,.17,0,.59,.4);pbx(L,lt,.15,.08,.06,0,.57,.53);pbx(L,lt,.09,.03,.05,0,.525,.51);
   ptp(L,pk,.05,.03,.03,0,.62,.555,.03,.02);pbx(L,'#7a3b2a',.004,.025,.008,0,.59,.563);pbx(L,'#7a3b2a',.05,.006,.008,0,.578,.563);
   [-.05,0,.05].forEach(x=>pbx(L,dk,.022,.012,.09,x,.765,.42));[-1,1].forEach(s=>{pbx(L,dk,.012,.03,.1,s*.171,.62,.38);pbx(L,dk,.012,.03,.08,s*.171,.57,.38)});
   [-1,1].forEach(s=>{pbx(L,'#fff',.2,.007,.007,s*.17,.585,.555,0,0,s*.14);pbx(L,'#fff',.2,.007,.007,s*.17,.565,.555,0,0,-s*.08)})});
  part('eyes','head',[0,.66,.522],L=>[-1,1].forEach(s=>{pbx(L,'#7bd35a',.072,.07,.01,s*.075,.66,.522);pbx(L,'#111',.018,.062,.01,s*.075,.66,.527);pbx(L,'#fff',.022,.022,.01,s*.075+s*.018,.682,.531)}),1);
  [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.1,.76,.4],L=>{ptp(L,c,.11,.13,.05,s*.1,.825,.4,.01,.02,s*.025,0);ptp(L,pk,.07,.09,.01,s*.1,.81,.426,.005,.01,s*.018,0);ptp(L,dk,.035,.03,.052,s*.12,.875,.4,.008,.02,s*.006,0)}));
  part('tail0','R',[0,.44,-.29],L=>{pseg(L,c,[0,.44,-.29],[0,.6,-.45],.075,.07);pseg(L,dk,[0,.52,-.37],[0,.55,-.4],.082,.08)});
  part('tail1','tail0',[0,.6,-.45],L=>{pseg(L,c,[0,.6,-.45],[0,.8,-.5],.07,.065);pseg(L,dk,[0,.68,-.47],[0,.71,-.48],.076,.073)});
  part('tail2','tail1',[0,.8,-.5],L=>{pseg(L,c,[0,.8,-.5],[0,.88,-.46],.065,.06);pseg(L,dk,[0,.88,-.46],[0,.94,-.4],.06,.045)});
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([s,f],i)=>part('leg'+i,'R',[s*.09,.3,f*.2],L=>{const x=s*.09,z=f*.2;
   if(f<0){pbx(L,c,.1,.14,.15,x,.27,z);pbx(L,dk,.102,.02,.152,x,.3,z)}pbx(L,c,.075,.24,.075,x,.13,z);pbx(L,lt,.08,.07,.08,x,.05,z);pbx(L,lt,.088,.04,.11,x,.02,z+.012);toes(L,x,.02,z+.068,'#a07850')}));
 }else if(k==1){/* Good Boy Dog: tan with dark saddle, cream blaze, floppy ears */
  const c='#b98a5a',dk='#6e4a2c',lt='#f3e2c4';
  part('body','R',[0,.42,0],L=>{pbx(L,c,.36,.3,.72,0,.42,0);pbx(L,c,.37,.32,.2,0,.43,.26);pbx(L,c,.37,.28,.2,0,.42,-.26);
   pbx(L,lt,.26,.04,.56,0,.268,0);pbx(L,lt,.24,.24,.03,0,.42,.371);pbx(L,dk,.385,.13,.46,0,.525,-.07);pbx(L,dk,.2,.012,.3,0,.597,-.05);
   pbx(L,c,.2,.18,.16,0,.58,.37);pbx(L,'#2f6fd6',.235,.05,.19,0,.6,.38);pbx(L,'#c9ced6',.03,.03,.02,0,.585,.478);pbx(L,'#f5c542',.055,.065,.012,0,.545,.478)});
  part('head','R',[0,.62,.42],L=>{pbx(L,c,.28,.26,.26,0,.75,.5);pbx(L,c,.3,.12,.2,0,.69,.5);pbx(L,lt,.17,.13,.19,0,.665,.68);pbx(L,lt,.12,.04,.15,0,.6,.66);
   pbx(L,lt,.05,.17,.012,0,.78,.635);pbx(L,lt,.05,.012,.12,0,.876,.56);
   ptp(L,'#1a1414',.085,.055,.045,0,.71,.783,.07,.04);pbx(L,'#6b6b6b',.03,.012,.006,-.012,.73,.807);[-1,1].forEach(s=>pbx(L,'#000',.014,.014,.006,s*.02,.7,.807));
   pbx(L,'#3a2a20',.005,.03,.01,0,.665,.776);pbx(L,'#3a2a20',.11,.01,.01,0,.648,.776);[-1,1].forEach(s=>pbx(L,dk,.012,.012,.012,s*.05,.68,.776));
   [-1,1].forEach(s=>pbx(L,lt,.045,.025,.012,s*.075,.835,.634))});
  part('eyes','head',[0,.775,.634],L=>[-1,1].forEach(s=>{pbx(L,'#fff',.07,.06,.008,s*.075,.775,.634);pbx(L,'#4a2a12',.055,.058,.01,s*.077,.775,.637);pbx(L,'#000',.03,.032,.01,s*.077,.775,.641);pbx(L,'#fff',.018,.018,.01,s*.077+s*.016,.79,.645)}),1);
  [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.15,.85,.5],L=>{ptp(L,dk,.045,.25,.12,s*.17,.73,.5,.05,.16,s*-.02,0,0,0,s*.12);ptp(L,'#5a3a20',.012,.2,.1,s*.15,.74,.5,.012,.13,s*-.016,0,0,0,s*.12)}));
  part('tongue','head',[0,.64,.74],L=>{pbx(L,'#ef7b8f',.06,.012,.07,0,.625,.77,.5);pbx(L,'#d65a70',.008,.013,.05,0,.627,.77,.5)});
  part('tail0','R',[0,.53,-.36],L=>pseg(L,c,[0,.53,-.36],[0,.68,-.5],.075,.065));
  part('tail1','tail0',[0,.68,-.5],L=>{pseg(L,c,[0,.68,-.5],[0,.82,-.56],.065,.05);pseg(L,lt,[0,.79,-.55],[0,.86,-.57],.055,.03)});
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([s,f],i)=>part('leg'+i,'R',[s*.11,.33,f*.24],L=>{const x=s*.11,z=f*.24;
   if(f<0)pbx(L,c,.13,.17,.19,x,.32,z);else pbx(L,c,.12,.12,.14,x,.34,z);pbx(L,c,.1,.3,.1,x,.17,z);pbx(L,lt,.104,.08,.104,x,.06,z);pbx(L,lt,.115,.05,.135,x,.025,z+.015);toes(L,x,.025,z+.083,'#8a6a4a')}));
 }else{/* Foxy: orange red fox, white bib and tail tip, black socks and ear tips */
  const c='#e8772e',dk='#b4531a',wt='#fbf4ea',bk='#1e1a18';
  part('body','R',[0,.4,0],L=>{pbx(L,c,.28,.26,.62,0,.4,0);pbx(L,c,.29,.24,.16,0,.39,-.2);pbx(L,wt,.2,.04,.48,0,.265,0);pbx(L,wt,.2,.21,.03,0,.41,.316);
   pbx(L,dk,.12,.012,.5,0,.536,-.02);[-1,1].forEach(s=>pbx(L,dk,.012,.06,.4,s*.141,.49,-.03));
   pbx(L,c,.18,.16,.12,0,.53,.32);pbx(L,wt,.14,.12,.02,0,.5,.385);pbx(L,'#8e44ad',.21,.045,.15,0,.55,.33);pbx(L,'#f5c542',.045,.055,.012,0,.505,.408)});
  part('head','R',[0,.56,.36],L=>{pbx(L,c,.28,.22,.22,0,.68,.44);[-1,1].forEach(s=>{pbx(L,wt,.012,.09,.15,s*.143,.62,.45);ptp(L,wt,.03,.06,.1,s*.15,.6,.47,.012,.06,s*.012,0)});pbx(L,wt,.2,.03,.12,0,.575,.48);
   pseg(L,c,[0,.645,.54],[0,.632,.76],.15,.06,.12,.05);pseg(L,wt,[0,.6,.54],[0,.61,.74],.13,.05,.08,.04);
   pbx(L,bk,.05,.04,.04,0,.635,.775);pbx(L,'#666',.02,.008,.006,-.008,.65,.796);pbx(L,'#3a2a20',.006,.025,.008,0,.605,.745);
   pbx(L,dk,.05,.012,.1,0,.796,.45)});
  part('eyes','head',[0,.705,.552],L=>[-1,1].forEach(s=>{pbx(L,'#f2b134',.07,.042,.01,s*.07,.705,.552,0,0,-s*.25);pbx(L,'#111',.018,.04,.01,s*.07,.705,.557);pbx(L,'#fff',.016,.016,.01,s*.07+s*.016,.716,.561)}),1);
  [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.09,.78,.42],L=>{ptp(L,c,.12,.2,.05,s*.1,.88,.42,.01,.02,s*.03,0);ptp(L,wt,.075,.14,.01,s*.1,.86,.446,.008,.01,s*.022,0);ptp(L,bk,.036,.05,.054,s*.124,.955,.42,.006,.02,s*.008,0)}));
  part('tail0','R',[0,.46,-.3],L=>pseg(L,c,[0,.46,-.3],[0,.5,-.52],.12,.17,.12,.16));
  part('tail1','tail0',[0,.5,-.52],L=>{pseg(L,c,[0,.5,-.52],[0,.45,-.74],.17,.15,.16,.15);pseg(L,dk,[0,.53,-.52],[0,.49,-.72],.1,.08,.14,.13)});
  part('tail2','tail1',[0,.45,-.74],L=>{pseg(L,c,[0,.45,-.74],[0,.41,-.8],.15,.14);pseg(L,wt,[0,.41,-.8],[0,.35,-.93],.14,.03)});
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([s,f],i)=>part('leg'+i,'R',[s*.09,.3,f*.2],L=>{const x=s*.09,z=f*.2;
   if(f<0)pbx(L,c,.1,.15,.15,x,.29,z);pbx(L,c,.08,.14,.08,x,.23,z);pbx(L,bk,.076,.17,.076,x,.09,z);pbx(L,bk,.086,.04,.1,x,.02,z+.012);toes(L,x,.02,z+.063,'#444')}));
 }
 return S}
function ptParrot(){const S={},part=(n,par,p,f,eye)=>{const L=[];f(L);S[n]={n,par,p,L,eye}};
 const g='#2ecc71',gl='#7fe3a6',gd='#1e9e55',r='#e74c3c',b='#3498db',bd='#1f5f99',y='#f1c40f',yd='#c99a0b',gr='#7f8c8d';
 part('body','R',[0,.43,0],L=>{ptp(L,g,.26,.46,.26,0,.43,0,.23,.22,0,.02);
  [.28,.36,.44,.52].forEach((yy,i)=>pbx(L,i%2?gl:'#62d98e',.19-i*.01,.05,.02,0,yy,.13+i*.005));pbx(L,gd,.02,.3,.02,0,.42,-.135);
  [-1,1].forEach(s=>{pbx(L,gr,.04,.11,.04,s*.06,.15,.02);pbx(L,'#5d6566',.03,.025,.1,s*.06,.0125,.04);pbx(L,'#5d6566',.03,.025,.05,s*.06,.0125,-.04);pbx(L,'#3d4344',.03,.02,.02,s*.06,.01,.095)});});
 part('head','R',[0,.64,.02],L=>{pbx(L,r,.24,.22,.24,0,.77,.04);pbx(L,r,.2,.06,.2,0,.665,.02);pbx(L,'#c0392b',.16,.02,.14,0,.885,.02);
  [-1,1].forEach(s=>{pbx(L,'#fbfbfb',.012,.1,.13,s*.121,.75,.09);[.73,.76].forEach(yy=>pbx(L,'#c0392b',.014,.006,.09,s*.122,yy,.1))});
  pbx(L,'#f4f0e0',.11,.085,.085,0,.755,.2);pseg(L,'#e8dfc4',[0,.765,.24],[0,.685,.29],.08,.02,.075,.03);pbx(L,'#2c2c2c',.085,.045,.06,0,.695,.185);pbx(L,'#111',.02,.012,.006,0,.785,.243);
  pseg(L,'#ff8a3d',[0,.87,.0],[0,.96,-.08],.05,.012);pseg(L,r,[-.04,.86,.0],[-.06,.93,-.07],.04,.01);pseg(L,r,[.04,.86,.0],[.06,.93,-.07],.04,.01)});
 part('eyes','head',[0,.775,.1],L=>[-1,1].forEach(s=>{pbx(L,'#f5e6a0',.01,.055,.055,s*.128,.775,.1);pbx(L,'#111',.01,.032,.032,s*.131,.775,.1);pbx(L,'#fff',.01,.014,.014,s*.134,.788,.112)}),1);
 [-1,1].forEach((s,i)=>part('wing'+i,'R',[s*.14,.62,-.01],L=>{const x=s*.15;ptp(L,g,.05,.2,.2,x,.52,-.02,.05,.22);[.58,.53,.48].forEach((yy,j)=>pbx(L,j%2?gd:gl,.054,.012,.2,x,yy,-.02));
  pbx(L,y,.054,.045,.2,x,.415,-.03);ptp(L,b,.046,.26,.08,x,.26,-.08,.05,.2,0,.06);[-.05,-.1].forEach(zz=>pbx(L,bd,.05,.2,.008,x,.27,zz));pbx(L,r,.05,.04,.06,x,.58,.07)}));
 part('tail0','R',[0,.24,-.1],L=>{pseg(L,b,[0,.26,-.1],[0,.0,-.42],.12,.05,.04,.02);[-1,1].forEach(s=>pseg(L,r,[s*.035,.25,-.09],[s*.055,.06,-.33],.05,.02,.03,.015));pseg(L,bd,[0,.2,-.17],[0,.03,-.39],.012,.008,.045,.025)});
 return S}
const PTSP={};
/* build (once) and cache the geometries for pet k */
function ptSpecGet(k){if(PTSP[k])return PTSP[k];const S=k==2?ptParrot():ptQuad(k);for(const n in S){const s=S[n];s.L=s.L.filter(r=>r[4]>0);s.geo=ptGeo(s.L,s.p)}return PTSP[k]=S}
/* fill group g with a rigged pet k (0 cat, 1 dog, 2 parrot, 3 fox) */
function petModel(k,g){return ptFill(g,k,ptSpecGet(k))}
function ptFill(g,k,S){for(let i=g.children.length-1;i>=0;i--)g.remove(g.children[i]);
 const R=new THREE.Group(),P={R};g.add(R);
 const mk=n=>{if(P[n])return P[n];const s=S[n],par=mk(s.par),pp=s.par=='R'?[0,0,0]:S[s.par].p,o=new THREE.Group();o.position.set(s.p[0]-pp[0],s.p[1]-pp[1],s.p[2]-pp[2]);
  const m=new THREE.Mesh(s.geo,s.eye?PTE:PTM);o.add(m);par.add(o);o.userData.y0=o.position.y;return P[n]=o};
 for(const n in S)mk(n);
 const legs=[0,1,2,3].map(i=>P['leg'+i]).filter(Boolean),tails=[0,1,2].map(i=>P['tail'+i]).filter(Boolean);
 const rig={k,R,P,legs,tails,t:Math.random()*20,sd:Math.random()*6,ph:0,v:0,mv:0,lx:null,lz:null,bl:1+Math.random()*3,bc:0,et:2+Math.random()*4,ec:0,ei:0};
 g.userData.pr=rig;g.userData.pet58=1;
 if(k==2){g.rotation.order='YXZ';g.userData.pw={pv:[P.wing0,P.wing1],ph:Math.random()*6,ph0:Math.random()*6,lx:null,lz:null,h:0};g.userData.np=1}else g.userData.np=0;
 return g}
/* ---------- animation ---------- */
function petAnim(g,dt){const r=g.userData.pr;if(!r)return;r.t+=dt;const t=r.t,P=r.P,p=g.position;
 const inst=r.lx==null||dt<=0?0:Math.hypot(p.x-r.lx,p.z-r.lz)/dt;r.lx=p.x;r.lz=p.z;r.v+=(Math.min(inst,6)-r.v)*Math.min(1,dt*8);
 const mv=Math.min(1,Math.max(0,(r.v-.15)/1.1));r.mv+=(mv-r.mv)*Math.min(1,dt*6);const m=r.mv;
 r.ph+=dt*(r.v*7+m*2);const s=Math.sin(r.ph),br=Math.sin(t*2.6+r.sd)*(1-m*.6);
 /* breathing: chest swells, head rides along */
 if(P.body)P.body.scale.set(1+br*.025,1+br*.03,1+br*.01);
 /* blink (sometimes twice) */
 r.bl-=dt;if(r.bl<0){r.bc=.13;r.bl=Math.random()<.2?.25:1.8+Math.random()*3.5}if(r.bc>0)r.bc-=dt;if(P.eyes)P.eyes.scale.y=r.bc>0?.12:1;
 /* head: looks around when idle, nods with the stride when walking */
 if(P.head){P.head.position.y=P.head.userData.y0+br*.006+(r.k==2?0:Math.abs(s)*.012*m);
  P.head.rotation.y=Math.sin(t*.45+r.sd)*.4*(1-m)+Math.sin(t*.17+r.sd*2)*.15*(1-m);P.head.rotation.x=Math.sin(t*.7+r.sd)*.06*(1-m)+Math.sin(r.ph*2)*.05*m;
  P.head.rotation.z=r.k==2?Math.max(0,Math.sin(t*.5+r.sd))*.35:Math.sin(t*.3+r.sd)*.05}
 /* ears: a quick twitch now and then, dog ears flop with each step */
 r.et-=dt;if(r.et<0){r.ec=.22;r.ei=Math.random()<.5?0:1;r.et=1.5+Math.random()*4}if(r.ec>0)r.ec-=dt;
 [P.ear0,P.ear1].forEach((e,i)=>{if(!e)return;const sg=i?1:-1,tw=r.ec>0&&r.ei==i?Math.sin((.22-r.ec)/.22*Math.PI)*.45:0;
  if(r.k==1){e.rotation.x=Math.sin(r.ph*2)*.25*m+Math.sin(t*1.3)*.04;e.rotation.z=sg*(Math.abs(s)*.25*m+tw*.4)}else{e.rotation.z=sg*tw;e.rotation.x=-tw*.3}});
 /* tail */
 const T=r.tails;if(T.length){if(r.k==1){const w=Math.sin(t*(13+m*4))*(.45+.25*m);T[0].rotation.y=w;T[0].rotation.z=-w*.35;if(T[1])T[1].rotation.y=w*.6}
  else if(r.k==0){T[0].rotation.y=Math.sin(t*1.2+r.sd)*.25;T[0].rotation.x=Math.sin(t*.9)*.08-m*.25;if(T[1]){T[1].rotation.y=Math.sin(t*1.2+r.sd-.6)*.35;T[1].rotation.x=Math.sin(t*1.1)*.15}if(T[2])T[2].rotation.y=Math.sin(t*1.2+r.sd-1.2)*.55}
  else if(r.k==3){const w=Math.sin(t*2+r.sd)*.22+Math.sin(r.ph)*.15*m;T[0].rotation.y=w;T[0].rotation.x=Math.sin(t*1.4)*.05+m*.12;if(T[1])T[1].rotation.y=w*.8;if(T[2])T[2].rotation.y=w*1.1}
  else{T[0].rotation.x=Math.sin(t*3+r.sd)*.08;T[0].rotation.y=Math.sin(t*1.7)*.06}}
 /* trotting walk: diagonal legs move together */
 if(r.legs.length==4){const a=.65*m;r.legs[0].rotation.x=s*a;r.legs[3].rotation.x=s*a;r.legs[1].rotation.x=-s*a;r.legs[2].rotation.x=-s*a;r.R.position.y=Math.abs(Math.cos(r.ph))*.025*m;r.R.rotation.x=Math.sin(r.ph*2)*.02*m}
 /* dog pants with its tongue out when it has been running */
 if(P.tongue){P.tongue.visible=m>.25||Math.sin(t*.21+r.sd)>.4;P.tongue.scale.y=1+Math.sin(t*12)*.5;P.tongue.rotation.x=Math.sin(t*12)*.06}}

/* which pet a block-model group is (from the old petb colours), or -1 */
function petKind(g){if(!g||!g.children||!g.children.length)return -1;const m=g.children[0].material;if(!m||!m.color)return -1;const h='#'+m.color.getHexString();return PETC.indexOf(h)}
function petUpgrade(g,k){if(!g||g.userData.pet58)return;if(k==null)k=petKind(g);if(k<0)return;petModel(k,g)}

/* companions: rebuild the models each time syncF runs (pets come first in FOL, in S.pets order) */
{const s0=syncF;syncF=function(){s0.apply(this,arguments);(S.pets||[]).forEach((pi,j)=>{const f=FOL[j];if(f&&f.m){f.m.userData.pet58=0;petModel(pi,f.m);if(pi==2)f.fly=1}})}}
/* shop / app preview */
{const pm0=pvModel;pvModel=function(k){if(PVM[k])return PVM[k];const p=String(k).split(':');if(p[0]!='p')return pm0(k);const i=+p[1],w=new THREE.Group(),g=new THREE.Group();petModel(i,g);
 const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),z=bb.getSize(new THREE.Vector3());g.position.sub(c);w.add(g);w.scale.setScalar(1.6/Math.max(z.x,z.y,z.z));return PVM[k]=w}}
/* every frame: swap any NPC owner's block pet for the detailed one, then animate the visible pets */
{const w0=worldTick;worldTick=function(dt){
 if(typeof NPC!='undefined')for(const n of NPC){const g=n.pet;if(g&&!g.userData.pet58)petUpgrade(g)}
 w0(dt);
 const d=Math.min(dt,.1);
 FOL.forEach(f=>{const g=f.m;if(g&&g.visible&&g.userData.pr)petAnim(g,d)});
 if(typeof NPC!='undefined')for(const n of NPC){const g=n.pet;if(g&&g.visible&&g.userData.pr)petAnim(g,d)}}}
