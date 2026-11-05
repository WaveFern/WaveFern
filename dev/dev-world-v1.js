/* WaveFern dev: destination cities (other countries).
   1. Trees are green: the tree helper was handed a colour string where blkTree wants a palette, which turned them brown; jacaranda / maple looks no longer tint trees purple or orange.
   2. The open land around each town is filled with houses and blocks of flats.
   3. No hanging chandelier in the hotel lobby.
   4. Every country's hotel (lobby and room) has its own furniture colours.
   Only loaded on /dev/. */
(function(){
 if(!window.FW_DEV)return;
 /* 1. green trees */
 try{if(typeof blkTree=='function'){const b0=blkTree;blkTree=function(box,x,z,s,seed,col){return b0.call(this,box,x,z,s,seed,Array.isArray(col)?col:null)}}}catch(e){console.warn('world trees',e)}
 try{if(typeof WT_DEST!='undefined')WT_DEST.forEach(d=>{if(d&&d.look)d.look=d.look.replace(/jacaranda|maple/gi,'green')})}catch(e){}

 /* 4. furniture colours: one scheme per country, spread round the colour wheel */
 const hsl=(h,s,l)=>{h=((h%360)+360)%360/360;s/=100;l/=100;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);const c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(c*255).toString(16).padStart(2,'0')};return'#'+f(0)+f(8)+f(4)};
 let order=null;
 function scheme(C){
  if(!order){const seen=[];try{WT_DEST.forEach(d=>{if(seen.indexOf(d.country)<0)seen.push(d.country)})}catch(e){}order=seen}
  let i=order.indexOf(C.d.country);if(i<0)i=(typeof fHash=='function'?fHash(C.id):0)%order.length;
  const h=i*137.508,w=(i%3)*14;
  return{fab:hsl(h,48,38),wood:hsl(h+150,30,30+w/3),dark:hsl(h+150,32,20+w/4),light:hsl(h+150,28,42),rug:hsl(h+180,40,30),sofa:hsl(h+60,42,34)}}
 const MAP={
  lobby:{'#7a2a3a':'rug','#5a3a2a':'wood','#4a2a1a':'dark','#3a5a6a':'fab'},
  room:{'#6a4a3a':'wood','#4a3226':'dark','#8a6a4a':'light','#7a5a46':'wood','#3a2a20':'dark'}};
 function wrap(D){
  const m0=D.mkRoom;if(!m0||m0._w)return;
  D.mkRoom=function(key,x0,z0,w,d,o){
   const rm=m0.apply(this,arguments);if(!rm)return rm;
   const C=D.building||D.C;
   if(key=='lobby'||key=='room'){try{
    const sc=scheme(C),mp=MAP[key],b0=rm.box;
    rm.box=function(w2,h,d2,c,x,y,z,cl){const t=typeof c=='string'&&mp[c.toLowerCase()];return b0.call(this,w2,h,d2,t?sc[t]:c,x,y,z,cl)};
    if(key=='lobby'){/* no hanging lights over the lobby: the glow boxes up at the ceiling */
     const g0=rm.glow;rm.glow=function(w2,h,d2,c,x,y,z){if(y>=3.9)return;return g0.apply(this,arguments)}}
    if(key=='room'){/* the room's soft furnishings take their colour from the country's accent */
     const keep=C.s.acc;C.s.acc=sc.fab;const dn=rm.done;rm.done=function(){C.s.acc=keep;return dn.apply(this,arguments)}}
   }catch(e){console.warn('world furniture',e)}}
   return rm}
  D.mkRoom._w=1}
 if(window.DCITY)wrap(window.DCITY);else{let n=0;const t=setInterval(()=>{if(window.DCITY){clearInterval(t);wrap(window.DCITY)}else if(++n>200)clearInterval(t)},100)}

 /* 2. fill the open land around the town with buildings */
 function fill(C){
  const s=C.s,r=fRng(fHash('fill-'+C.id)),RR=(a,b)=>a+r()*(b-a),W=C.W,zM=C.zMax,st=C.st,pl=C.plaza,D=window.DCITY;
  const G=xgNew();G.all=1;
  const ok=m=>(x,z)=>{if(x>-4-m&&x<W+4+m&&z>-4-m&&z<zM+4+m)return false;if(x<34+m)return false;/* the airport side stays clear */
   if(s.water&&z>C.wz-18-m)return false;if(st&&Math.abs(x-st.x)<st.a+16+m&&Math.abs(z-st.z)<st.b+16+m)return false;if(pl&&x>pl.x0-12-m&&x<pl.x1+12+m&&z>pl.z0-12-m&&z<pl.z1+12+m)return false;return true};
  const placed=[],okp=ok(8),want=s.big?170:110,wallPick=a=>a[(r()*a.length)|0];
  for(let i=0,n=0;i<4000&&n<want;i++){
   const x=RR(-10,W+120),z=RR(-120,zM+120),far=Math.max(-x,x-W,-z,z-zM);
   if(far<9||far>115||!okp(x,z))continue;
   const w=RR(6,12),d=RR(6,12);
   if(placed.some(p=>Math.abs(p[0]-x)<(p[2]+w)/2+3&&Math.abs(p[1]-z)<(p[3]+d)/2+3))continue;
   placed.push([x,z,w,d]);n++;
   const wall=wallPick(s.big&&far<60?s.glassC:s.walls);
   if(s.big&&far<60){const h=RR(12,46)*(.5+s.tall*.5);xgBox(G,w,h,d,wall,x,h/2,z,0,dk(wall,.8));xgBox(G,w+.3,.5,d+.3,dk(wall,.7),x,h+.25,z);
    for(let y=4;y<h-1;y+=3.2)xgQuad(xgCell(G,x,z+d/2),[[x-w/2+.8,y,z+d/2+.03],[x+w/2-.8,y,z+d/2+.03],[x+w/2-.8,y+1.5,z+d/2+.03],[x-w/2+.8,y+1.5,z+d/2+.03]],r()<.4?'#ffd890':dk(wall,.55))}
   else{const h=RR(4.2,8);xgBox(G,w,h,d,wall,x,h/2,z,0,dk(wall,.8));
    if(s.desert)xgBox(G,w+.2,.5,d+.2,dk(wall,.85),x,h+.25,z);
    else{const m=(x),rc=s.terra?'#b8583a':['#6a4a3a','#4a4e56','#8a3a2a'][(r()*3)|0],B=xgCell(G,x,z),x0=x-w/2-.3,x1=x+w/2+.3,z0=z-d/2-.3,z1=z+d/2+.3,gh=Math.min(2.6,d*.3),zm=(z0+z1)/2;
     xgQuad(B,[[x0,h,z1],[x1,h,z1],[x1,h+gh,zm],[x0,h+gh,zm]],rc);xgQuad(B,[[x1,h,z0],[x0,h,z0],[x0,h+gh,zm],[x1,h+gh,zm]],rc);xgTri(B,[x1,h,z1],[x1,h,z0],[x1,h+gh,zm],wall);xgTri(B,[x0,h,z0],[x0,h,z1],[x0,h+gh,zm],wall)}
    for(let a=x-w/2+1.4;a<x+w/2-1;a+=2.6)xgQuad(xgCell(G,a,z+d/2),[[a-.5,2.2,z+d/2+.03],[a+.5,2.2,z+d/2+.03],[a+.5,3.4,z+d/2+.03],[a-.5,3.4,z+d/2+.03]],dk(wall,.5))}
  }
  /* trees in the gaps */
  for(let i=0,n=0;i<1500&&n<(s.big?60:90);i++){const x=RR(-10,W+120),z=RR(-120,zM+120),far=Math.max(-x,x-W,-z,z-zM);if(far<7||far>115||!ok(5)(x,z))continue;
   if(placed.some(p=>Math.abs(p[0]-x)<p[2]/2+2&&Math.abs(p[1]-z)<p[3]/2+2))continue;n++;
   if(s.palm&&D.palm)D.palm(G,x,z,RR(5,8));else D.tree(G,x,z,s.tree,RR(.9,1.4))}
  xgFlush(G).forEach(m=>{scene.remove(m);m.userData.dsOwn=1;if(m.geometry)m.geometry.userData.dsOwn=1;C.g.add(m)})}
 try{const D=window.DCITY;if(D){D.cityHooks=D.cityHooks||[];D.cityHooks.push(C=>{try{fill(C)}catch(e){console.warn('world fill',e)}})}}catch(e){}
})();
