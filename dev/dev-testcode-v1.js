/* ---------- v51.8.0: type "test" as the save code to unlock everything (dev build only) ----------
   Only does anything when window.FW_DEV is set (the /dev/ page, see dev/dev-shim.js). On the real game "test" is just an invalid code.
   It uses the admin panel's own actions (88-admin.js ADMA) on the career that is open, so nothing is saved except what autosave keeps in the dev sandbox. */
(function(){
if(!window.FW_DEV||typeof loadCode!='function')return;
const l0=loadCode;
loadCode=function(c){
 if(String(c==null?'':c).trim().toLowerCase()!=='test')return l0.apply(this,arguments);
 try{
  if(mode=='title'&&!(typeof TT!='undefined'&&TT.game)||mode=='creator'||mode=='load'){snd('err');say('Start or continue a career first, then type test.');return}
  S.money=Math.max(+S.money||0,5e7);S.cheat=1;
  ['energy','gear','apps','furniture','cars','pets','clothes','home','contacts','tutoff'].forEach(k=>{try{ADMA[k]()}catch(e){console.warn('test unlock',k,e)}});
  try{S.followers=Math.max(S.followers||0,1e6);S.listeners=Math.max(S.listeners||0,1e7)}catch(e){}
  try{buildStudio();refresh();parkCars();syncF();buildLots();syncArt()}catch(e){}
  try{autoSave()}catch(e){}
  snd('chime');say('TEST: everything unlocked (dev build only)');
 }catch(e){console.error('test code',e);snd('err');say('That did not work.')}
};
})();
