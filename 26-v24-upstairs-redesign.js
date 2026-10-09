/* ---------- v24 upstairs redesign ---------- */
function buildAnnex(){const L=Math.min(4,S.home||1);if(ANX.lv==L)return;ANX.lv=L;if(ANX.idx==null){SHOPS.push({name:'Upstairs',cx:3,ox:900,ez:10});ANX.idx=SHOPS.length-1}
 ANX.ints.forEach(o=>{const i=INT.indexOf(o);if(i>=0)INT.splice(i,1)});ANX.ints=[];ANX.pets=[];ANX.tvs=[];
 (ANX.cw||[]).forEach(e=>{const i=wc.indexOf(e);if(i>=0)wc.splice(i,1)});ANX.cw=[];
 let G=IG[ANX.idx];if(!G){G=IG[ANX.idx]=new THREE.Group();WORLD.add(G)}G.clear();
 const W=ANX.W=[0,14,18,22,26][L],D=ANX.D=[0,11,13,15,16][L],o=900,g=G,b=(w,h,d,c,x,y,z)=>B(g,w,h,d,c,o+x,y,320+z),cl=(a,c,e,f)=>{const q=[o+a,320+c,o+e,320+f];wc.push(q);ANX.cw.push(q)},add=a=>{INT.push(a);ANX.ints.push(a)};
 const WC='#d6cbb5',PC='#cbbf9f',fl=(x,z,w,d,c1,c2)=>{const m=new THREE.Mesh(geo(w,.2,d),tex(c1,c2,w,d));m.position.set(o+x+w/2,-.1,320+z+d/2);g.add(m)};
 const pw=(x0,z0,x1,z1)=>{if(z0==z1){b(x1-x0,1.1,.24,PC,(x0+x1)/2,.55,z0);b(x1-x0,.06,.3,'#8a7a62',(x0+x1)/2,1.13,z0);cl(x0,z0-.12,x1,z0+.12)}else{b(.24,1.1,z1-z0,PC,x0,.55,(z0+z1)/2);b(.3,.06,z1-z0,'#8a7a62',x0,1.13,(z0+z1)/2);cl(x0-.12,z0,x0+.12,z1)}};
 const seat=(x,z,r)=>add({x:o+x,z:320+z,r:1.7,l:'Sit down',a:()=>sitOn(o+x,320+z,r)}),tvAt=(x,z,w)=>{const sc=b(w,.75,.06,'#14181d',x,1.7,z+.06);sc.on=false;ANX.tvs.push(sc);b(w+.2,.9,.12,'#111111',x,1.7,z);b(w,.5,.5,'#2a2a2a',x,.25,z);cl(x-w/2,z-.3,x+w/2,z+.3);add({x:o+x,z:320+z+2.3,r:2.4,l:'Turn TV on/off',a:()=>{sc.on=!sc.on;snd('pop')}})};
 const sofa=(x,z,c)=>{b(2.4,.45,.9,c,x,.25,z);b(2.4,.55,.22,dk(c,.85),x,.7,z+.35);b(.25,.6,.9,dk(c,.8),x-1.12,.4,z);b(.25,.6,.9,dk(c,.8),x+1.12,.4,z);cl(x-1.25,z-.5,x+1.25,z+.5);seat(x,z,2)};
 const plant=(x,z)=>{b(.5,.4,.5,'#8a5a36',x,.2,z);b(.6,.7,.6,'#2e8b57',x,.75,z);b(.4,.5,.4,'#3fa66a',x,1.2,z)};
 const win=(x,z,alongX)=>{if(alongX){b(2.2,1.6,.05,'*cfe8fa',x,1.8,z+.03);b(2.3,.08,.08,'#555555',x,2.65,z+.06);b(2.3,.08,.08,'#555555',x,.95,z+.06)}else{b(.05,1.6,2.2,'*cfe8fa',x+.03,1.8,z);b(.08,.08,2.3,'#555555',x+.06,2.65,z);b(.08,.08,2.3,'#555555',x+.06,.95,z)}};
 /* outer walls: full north/west, low front walls so you can see in */
 b(W,3.4,.3,WC,W/2,1.7,-.15);b(.3,3.4,D,WC,-.15,1.7,D/2);b(W,1.1,.2,WC,W/2,.55,D+.1);b(.2,1.1,D,WC,W+.1,.55,D/2);b(W,.06,.3,'#8a7a62',W/2,1.13,D+.1);b(.3,.06,D,'#8a7a62',W+.1,1.13,D/2);cl(-.3,0,0,D);cl(0,-.3,W,0);
 const tw=[[7,7],[6,6,6],[5.5,5.5,5.5,5.5],[6.5,6.5,6.5,6.5]][L-1],kinds=['guest','pet','study','gym'],fc={guest:['#b8a0b8','#a58aa5'],pet:['#c9b8a0','#b5a38b'],study:['#a89070','#93795c'],gym:['#6a7078','#585e66']};
 const cin=[0,9,10,10][L-1],lo=L==4?[10,19]:null,stx=W-4.4;
 fl(0,6,W,D-6,'#c2ab88','#ad9672');
 let rx=0;const gaps=[];
 tw.forEach((rw,i)=>{const k=kinds[i];fl(rx,0,rw,6,fc[k][0],fc[k][1]);win(rx+rw/2,0,true);gaps.push([rx+rw/2-.9,rx+rw/2+.9]);if(i>0)pw(rx,0,rx,4.2);
  if(k=='guest'){b(2,.4,3.1,'#6b4a2e',rx+1.5,.2,2);b(1.8,.25,2.9,'#e8e0f0',rx+1.5,.5,2);b(1.4,.12,.5,'#ffffff',rx+1.5,.7,.8);cl(rx+.5,.4,rx+2.5,3.5);b(.6,.6,.6,'#6b4a2e',rx+3.1,.3,.8);b(.3,.3,.3,'*ffe9a8',rx+3.1,.75,.8);cl(rx+2.8,.5,rx+3.4,1.1);b(1.2,2.2,.6,'#7b5233',rx+rw-1,1.1,.5);cl(rx+rw-1.6,.2,rx+rw-.4,.8);b(rw-2,.03,1.8,'#8a6a8a',rx+rw/2,.02,4.3);plant(rx+rw-.6,5.4)}
  if(k=='pet'){[['petbed',rx+1.2,1.5],['petbed',rx+2.6,1.5],['cattree',rx+rw-1.2,1.3],['perch',rx+rw-1.2,4.4],['pbowl',rx+1.4,4.6],['ptoy',rx+2.8,4.4]].forEach(q=>{if(F[q[0]])F[q[0]].b.forEach(a=>b(a[0],a[1],a[2],a[3],q[1]+a[4],a[5],q[2]+a[6]))});ANX.pets=[[rx+1.2,1.6,'lie'],[rx+rw-1.2,1.3,'top'],[rx+2.8,4.2,'play']]}
  if(k=='study'){b(1.8,.1,.8,'#6b4a2e',rx+rw/2,.8,1.1);b(.1,.8,.7,'#4a3320',rx+rw/2-.8,.4,1.1);b(.1,.8,.7,'#4a3320',rx+rw/2+.8,.4,1.1);b(.5,.5,.5,'#2f6fb5',rx+rw/2,.3,2.1);b(.6,.4,.05,'#222222',rx+rw/2,1.1,.9);cl(rx+rw/2-1,.6,rx+rw/2+1,1.6);[0,1].forEach(j=>{b(1.2,2,.4,'#5a3a22',rx+.9+j*1.3,1,.3);for(let q=0;q<5;q++)b(.18,.4,.3,['#c0392b','#2f6fb5','#e6b422','#2a8a4a','#8e44ad'][q],rx+.5+j*1.3+q*.2,.7+(q%2)*.8,.55)});cl(rx+.2,.1,rx+2.9,.6);b(rw-2,.03,1.8,'#5a6a8a',rx+rw/2,.02,4);add({x:o+rx+rw/2,z:320+3,r:1.8,l:'Read a book',a:()=>say(['You read a chapter and feel smarter.','A good book. Ideas for lyrics flow.'][RI(0,1)])})}
  if(k=='gym'){[0,1].forEach(j=>{b(.9,.3,1.8,'#222222',rx+1.2+j*1.7,.2,1.6);b(.1,1,.1,'#444444',rx+.9+j*1.7,.8,.8);b(.1,1,.1,'#444444',rx+1.5+j*1.7,.8,.8);b(.7,.3,.15,'#111111',rx+1.2+j*1.7,1.35,.8);cl(rx+.7+j*1.7,.6,rx+1.7+j*1.7,2.5)});b(1.6,.4,.6,'#555555',rx+rw-1.5,.2,3.8);b(2,1.4,.4,'#3a3a44',rx+rw-1.4,.7,.5);cl(rx+rw-2.4,.2,rx+rw-.4,.8);b(rw-2,.03,1.6,'#2a2a34',rx+rw/2,.02,4.6);add({x:o+rx+rw/2,z:320+3.4,r:2,l:'Work out (restores stamina)',a:()=>{S.stam=100;snd('chime');say('Good workout! Stamina restored.')}})}
  rx+=rw});
 /* wall between top rooms and the landing, with a doorway for each room */
 let cx0=0;gaps.sort((a,c)=>a[0]-c[0]).forEach(q=>{if(q[0]>cx0)pw(cx0,6,q[0],6);cx0=q[1]});if(cx0<W)pw(cx0,6,W,6);
 /* cinema room */
 if(cin){fl(0,6.1,cin,D-6.1,'#3a2a5a','#2e2048');pw(cin,6.1,cin,8);pw(cin,9.8,cin,D);b(cin-1.5,.03,3.4,'#5a3a7a',cin/2,.02,D-3.2);tvAt(cin/2,6.8,3.4);sofa(cin/2-1.4,D-1.3,'#7a1f3a');sofa(cin/2+1.5,D-1.3,'#2a4a7a');b(1,.5,.8,'#3a2a1a',cin/2,.25,D-3.4);b(.3,.3,.3,'#f1c40f',cin/2,.6,D-3.4);cl(cin/2-.5,D-3.8,cin/2+.5,D-3)}
 /* lounge (top floor of the mansion) */
 if(lo){fl(lo[0],6.1,lo[1]-lo[0],D-6.1,'#a8896a','#93745a');pw(lo[1],6.1,lo[1],8);pw(lo[1],9.8,lo[1],D);const lx=(lo[0]+lo[1])/2;b(5,1,.7,'#4a3320',lx,.5,6.8);b(5.2,.08,.9,'#222222',lx,1.04,6.8);cl(lx-2.6,6.4,lx+2.6,7.2);[-1.6,0,1.6].forEach(q=>b(.5,.7,.5,'#8a1f1f',lx+q,.35,8));b(4,.03,2.6,'#7a3b4a',lx,.02,D-3.4);sofa(lx,D-1.3,'#3a2a5a');b(1.4,.4,.8,'#3a2a1a',lx,.2,D-3.4);plant(lo[0]+.7,D-.8);add({x:o+lx,z:320+8.6,r:2,l:'Grab a drink (restores energy)',a:()=>{S.energy=Math.min(100,S.energy+10);snd('pop');say('Refreshing.')}})}
 /* landing with the stairs down */
 for(let i=0;i<5;i++)b(.6,.22*(5-i),2.2,'#9a8a74',W-1.2-i*.6,.11*(5-i),D-2.2);b(.1,1.4,2.3,'#6b4a2e',W-4.3,.9,D-2.2);add({x:o+W-5.2,z:320+D-2.2,r:1.7,l:'Go downstairs',a:goDown});cl(W-4.2,D-3.4,W-.2,D-1);
 const lx0=lo?lo[1]+.8:cin?cin+.8:.8;b(2.4,.4,.7,'#6b4a2e',lx0+1.6,.2,D-.9);b(2.6,.03,2,'#8a4a3a',stx-1.8,.02,D-3);plant(lx0,6.8);plant(W-.8,6.8);
 const sdx=W-6;if(sdx>lx0+1){b(1,.5,.8,'#6b4a2e',sdx-1,.25,7.2)}
}

