/* WaveFern dev: new careers start at home, Big Vee has no white speech box, pause menu music starts off. */
(function(){
 /* 2. Big Vee's white box with the one-liners ("That is the stuff.") is removed completely */
 try{if(typeof tutBub=='function'){tutBub=function(){const e=document.getElementById('tbub');if(e)e.remove()}}
  const s=document.createElement('style');s.textContent='#tbub{display:none!important}';document.head.appendChild(s)}catch(e){console.error('careerhome bub',e)}
 /* 3. pause menu music is off by default; applied once per browser so a later choice in Settings is kept */
 try{if(typeof OPT!='undefined'&&!localStorage.getItem('fw_pm0')){localStorage.setItem('fw_pm0','1');OPT.pauseMus=0;if(typeof svOpt=='function')svOpt();if(typeof menuSync=='function')menuSync()}}catch(e){console.error('careerhome music',e)}
 /* 4. a new career always starts at home, never in a city left over from an older career */
 function home(){
  try{
   if(typeof S=='undefined'||!S)return;
   if(S.travel&&S.travel.loc&&S.travel.loc!=='home')S.travel.loc='home';
   if(S.dcity)S.dcity.loc=null;
   const D=window.DCITY;if(D&&D.on&&typeof D.leave=='function')D.leave(true);
   if(typeof IN!='undefined'&&IN&&typeof exitShop=='function'){try{exitShop()}catch(e){}}
   P.x=8;P.z=14;P.rot=0;if(typeof camT!='undefined'){camT.x=P.x;camT.z=P.z}
   if(P.mesh)P.mesh.position.set(P.x,0,P.z);
   S.pos=null;
  }catch(e){console.error('careerhome',e)}
 }
 const fresh=()=>S&&!S.artist&&(S.day||1)<=1&&!(S.songs&&S.songs.length);
 if(typeof confirmChar=='function'){const c0=confirmChar;confirmChar=function(){const r=c0.apply(this,arguments);home();return r}}
 let done=0;
 if(typeof worldTick=='function'){const w0=worldTick;worldTick=function(){const r=w0.apply(this,arguments);if(!done&&mode=='play'&&fresh()){done=1;const away=(S.travel&&S.travel.loc&&S.travel.loc!=='home')||(window.DCITY&&DCITY.on);if(away)home()}return r}}
})();
