/* WaveFern dev: no cars on the main menu / loading background. Only loaded on /dev/.
   While the menu is up, every car in the scene (parked, garage room, traffic, a driven car) is hidden; they come back when the game starts. */
(function(){
 if(!window.FW_FEAT)return;
 let hid=[];
 function cars(){
  const a=[];
  try{if(typeof PK!='undefined')PK.forEach(c=>c&&c.m&&a.push(c.m))}catch(e){}
  try{if(typeof TRAF!='undefined')TRAF.forEach(c=>c&&c.m&&a.push(c.m))}catch(e){}
  try{if(typeof GCM!='undefined')GCM.forEach(m=>m&&a.push(m))}catch(e){}
  try{if(typeof dr!='undefined'&&dr&&dr.m)a.push(dr.m)}catch(e){}
  return a;
 }
 function tick(){
  try{
   const menu=typeof mode!='undefined'&&(mode=='title'||mode=='load');
   if(menu){for(const m of cars())if(m.visible){m.visible=false;hid.push(m)}}
   else if(hid.length){hid.forEach(m=>{m.visible=true});hid=[]}
  }catch(e){}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
})();
