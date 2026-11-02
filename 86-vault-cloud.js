/* v49.69.0: the cloud half of the save vault (see 12-save-vault.js). Loads right after 86-google-signin.js. */
/* Firebase project move: runs now, before the game reads its career */
(function(){try{if(FW_TRL)return;const cur=(typeof FB_CFG!='undefined'&&FB_CFG.projectId)||'',old=localStorage.getItem(VT_PROJ);
 if(!cur)return;if(old===null){localStorage.setItem(VT_PROJ,cur);return}if(old===cur)return;
 vtTouch();
 /* the project changed: old account ids mean nothing on the new one. Copy the best careers into the empty guest slots so the player still has them */
 if(!FW_ACCT){const all=vtAll().filter(c=>c.scope!='guest');let moved=0;
  for(let n=1;n<=SLOTS;n++){if(localStorage.getItem('fw_save_'+n))continue;const seen=new Set(vtAll().filter(c=>c.scope=='guest').map(c=>c.artist));
   const b=all.find(c=>!seen.has(c.artist));if(!b)break;localStorage.setItem('fw_save_'+n,b.code);all.splice(all.indexOf(b),1);moved++}
  /* anything left over is kept as a recoverable backup */
  all.forEach(c=>bakKeep(c.code,'Career from an account on this device'));
  if(moved){localStorage.setItem('fw_fbmig','1');sessionStorage.setItem('fw_msg','WaveFern moved to a new cloud. Your career was kept on this device. Sign in with Google to put it back in the cloud.')}}
 localStorage.setItem(VT_PROJ,cur)}catch(e){console.warn('vault project move',e)}})();

/* the first Google sign-in after a move uploads the career from this device without asking */
{const a0=csAsk;csAsk=function(){let g=null;try{g=localStorage.getItem('fw_fbmig')=='1'?csGuestCode():null}catch(e){}
 if(g){try{localStorage.removeItem('fw_fbmig')}catch(e){}return csPick(1)}return a0.apply(this,arguments)}}
/* take the best career on this device when this account has none, not only a guest one */
{const g0=csGuestCode;csGuestCode=function(){return g0.apply(this,arguments)||(()=>{const b=vtAll().find(c=>c.scope!=FW_ACCT);return b?b.code:null})()}}
/* a cloud save that is empty or cannot be read is never loaded: this device keeps its career and uploads it instead */
{const l0=csLoad;csLoad=function(c){vtTouch();if(!c||!c.code||typeof c.code!='string'||!vtOK(c.code)){
  if(FBU){CLD.ok=1;csSetMark(c&&c.t||0);fbRedraw();setTimeout(()=>csPush(1),50)}return}
 return l0.apply(this,arguments)}}
{const p0=csPush;csPush=function(){vtTouch();return p0.apply(this,arguments)}}

/* the cloud copy: an old one is archived on this device and left alone until the new career is saved over it */
{const l0=csLoad;csLoad=function(c){if(c&&typeof c.code=='string'&&rsOn()&&rsIsOld(c.code)){
  rsArchive(c.code,FW_ACCT||'guest',0,'Cloud save before the fresh start');
  if(typeof FBU!='undefined'&&FBU){CLD.ok=1;csSetMark(c.t||0);if(typeof fbRedraw=='function')fbRedraw();
   try{if(rsNow()>=RS.CUT&&!sessionStorage.getItem('fw_rscl')){sessionStorage.setItem('fw_rscl','1');sessionStorage.setItem('fw_msg','Your old cloud career is kept as a Legacy career. Start a new career to begin again.')}}catch(e){}}
  return}return l0.apply(this,arguments)}}

