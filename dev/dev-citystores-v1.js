/* WaveFern dev: Threadz and Gphones are real buildings on the highway again. The Browser app is gone, so the two shops that only
   existed as websites (Threadz clothes, Gphones phones) get their own shop buildings on the highway (Threadz west of Security, Gphones east of the Radio), each with a themed front,
   a sign, a room you can walk into and a keeper who opens the shop (the same shop screen the other city shops use).
   Only loaded on /dev/. Add ?nocitystores to skip it. */
(function(){
 if(!window.FW_DEV||/[?&]nocitystores/.test(location.search))return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev citystores '+t,e)}}};
 if(typeof mkShop!='function'||typeof SFTY=='undefined'||typeof sfRoom!='function'||typeof WORLD=='undefined')return;
 const STORES=[
  {cx:-56,k:'#2a2a34',name:'THREADZ',site:'clothes',a:'#e84393',
   T:{k:'r',c:'#2a2a34',a:'#e84393',kind:'cloth',cols:['#e84393','#f4f1ea','#7fe3ff','#ffe066','#1a1a1a','#b07aff'],kn:'Sasha (stylist)',say:['Every piece comes in 24 colours.']}},
  {cx:74,k:'#1f3a5f',name:'GPHONES',site:'phones',a:'#4aa8ff',
   T:{k:'r',c:'#1f3a5f',a:'#4aa8ff',kind:'box',cols:['#1a1a1a','#e8e8ec','#4aa8ff','#2ecc71','#ff7a3a','#b07aff'],kn:'Ben (tech seller)',say:['The camera on this one is unreal.']}}];
 STORES.forEach(s=>{SFTY[s.name]=s.T});
 /* the world is already built and widened when the dev add-ons load, so these are final (warped) coordinates and boxes go straight in */
 const SB=(w,h,d,c,x,y,z)=>B(WORLD,w,h,d,c,x,y,z);
 {
  STORES.forEach(s=>safe(()=>{
   const cx=s.cx,z=11.03,nm=s.name.charAt(0)+s.name.slice(1).toLowerCase();
   mkShop(cx,s.k,s.name,()=>{},'Visit '+nm);
   POIS.push([cx,8,nm,s.a]);
   /* front: awning, window displays and a roof sign */
   [-2.6,2.6].forEach(x=>{SB(2.2,.06,.9,s.a,cx+x,2.35,z+.45);for(let i=0;i<4;i++)SB(.55,.2,.04,i%2?'#f4f1ea':s.a,cx+x-.825+i*.55,2.24,z+.9)});
   if(s.site=='clothes'){
    [-2.6,2.6].forEach((x,k)=>{SB(.06,.9,.06,'#555',cx+x,.5,z+.5);SB(.46,.7,.26,k?'#e84393':'#7fe3ff',cx+x,1.1,z+.5);SB(.16,.22,.16,'#e8d9c0',cx+x,1.58,z+.5)});
    SB(1.4,.5,.4,'#8a5a36',cx-3.6,.25,z+1.2);for(let j=0;j<4;j++)SB(.3,.12,.14,['#f4f4f4','#e03a3a','#3b82f6','#e6b422'][j],cx-3.9+j*.22,.56,z+1.2);
   }else{
    [-2.6,2.6].forEach((x,k)=>{SB(.9,.05,.5,'#e8e8ec',cx+x,.45,z+.5);for(let j=0;j<3;j++){SB(.22,.4,.05,['#1a1a1a','#4aa8ff','#e8e8ec'][(j+k)%3],cx+x-.3+j*.3,.7,z+.5);SB(.18,.34,.01,'#7fd0ff',cx+x-.3+j*.3,.7,z+.53)}});
    SB(.06,.06,.9,'#2a2a30',cx+3.2,2.9,z+.45);SB(.06,.7,.4,'#1a1a1a',cx+3.2,2.45,z+.6);SB(.07,.6,.3,'#7fd0ff',cx+3.2,2.45,z+.6);
   }
   /* the room inside, and the keeper who opens the shop screen */
   SHOPS.push({name:nm,cx,ox:-2600-SHOPS.length*16,ez:12.9});const i=SHOPS.length-1,T=s.T;
   const kc=s.site=='clothes'?{hair:13,hc:5,eyes:6,mouth:4,top:5,tc:4,pc:6,skin:1,body:.4}:{hair:16,hc:0,eyes:5,mouth:3,top:2,tc:0,pc:4,skin:3,body:.5};
   interior(i,['#888','#777'],'#666',[],[],kc,T.kn,()=>{if(typeof devShop=='function')devShop(s.site);else{snd('pop');say(T.kn.split(' (')[0]+': "'+T.say[0]+'"')}});
   ixRoom(i,sfRoom(s.name));sfFloor(SHOPS[i].ox);
   const it=INT.find(q=>q.l=='Visit '+nm);if(it){it.l='Enter '+nm;it.a=()=>enterShop(i)}
  },'build '+s.name));
 }
})();
