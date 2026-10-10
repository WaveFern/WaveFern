/* ---------- save / load ---------- */
function saveCode(){return'FW1-'+btoa(unescape(encodeURIComponent(JSON.stringify({S,ch,PL:PL.map(q=>({t:q.t,x:q.x,z:q.z,r:q.r})),VOL,FX}))))}
/* fresh-new-game defaults, snapshotted at boot (27-boot.js) before any save is applied */
let S0=null;function snapS(){S0=JSON.stringify(S)}
function resetState(){if(!S0)return;Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,JSON.parse(S0));rec=null;dr=null;hold=null}
function loadCode(c){try{c=c.trim();if(c.toLowerCase()=='test'){cheat();return}if(c.slice(0,4)!='FW1-')throw 0;const d=JSON.parse(decodeURIComponent(escape(atob(c.slice(4)))));resetState();Object.assign(S,d.S);ch=d.ch;PL.forEach(q=>scene.remove(q.m));PL=d.PL.map(q=>{const m=mkF(q.t);m.position.set(q.x,0,q.z);m.rotation.y=q.r*Math.PI/2;scene.add(m);return{...q,m}});buildStudio();refresh();parkCars();syncF();buildLots();syncArt();rec=null;dr=null;hold=null;clrGhost();SP='';mode='play';$('ui').innerHTML='';snd('chime');say('Loaded: Day '+S.day)}catch(e){snd('err');say('Invalid save code.')}}

/* autosave: keeps the game in the browser so a refresh doesn't reset it */
let wiping=false;
function autoSave(){if(wiping||mode=='creator'||mode=='load')return;try{localStorage.setItem('fw_save',saveCode())}catch(e){}}
function restoreSave(){let c=null;try{c=localStorage.getItem('fw_save')}catch(e){}if(!c)return false;loadCode(c);if(mode=='play')return true;try{localStorage.removeItem('fw_save')}catch(e){}return false}
setInterval(autoSave,5000);
addEventListener('pagehide',autoSave);
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoSave()});
function wipeSave(){if(!confirm('Wipe your save and start a new game? This cannot be undone.'))return;wiping=true;try{localStorage.removeItem('fw_save')}catch(e){}location.reload()}
