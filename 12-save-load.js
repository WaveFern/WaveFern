/* ---------- save / load ---------- */
/* save codes: FW2- = LZW-packed JSON with ASCII-escaped text and base-46 digits (same data, roughly 40-70% shorter); FW1- = old base64 JSON, still loads */
const SC_A=Array.from({length:94},(_,i)=>String.fromCharCode(33+i)).filter(c=>c!='"'&&c!='\\');
function scPack(s){s=s.replace(/[\u0080-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));const D=new Map(),o=[];let w='',nx=128;for(let i=0;i<s.length;i++){const c=s[i],wc=w+c;if(w&&D.has(wc)){w=wc;continue}if(w)o.push(w.length>1?D.get(w):w.charCodeAt(0));if(w)D.set(wc,nx++);w=c}if(w)o.push(w.length>1?D.get(w):w.charCodeAt(0));return o.map(n=>{let t='';do{const d=n%46;n=Math.floor(n/46);t=SC_A[(t?46:0)+d]+t}while(n);return t}).join('')}
function scUnpack(t){const C=[];let n=0;for(const ch of t){const v=SC_A.indexOf(ch);n=n*46+v%46;if(v<46){C.push(n);n=0}}const T=[];let out='',p=null;for(const k of C){const cur=k<128?String.fromCharCode(k):k-128<T.length?T[k-128]:p+p[0];out+=cur;if(p!==null)T.push(p+cur[0]);p=cur}return out}
function scDecode(c){return c.slice(0,4)=='FW2-'?JSON.parse(scUnpack(c.slice(4))):JSON.parse(decodeURIComponent(escape(atob(c.slice(4)))))}
function saveCode(){return'FW2-'+scPack(JSON.stringify({S,ch,PL:PL.map(q=>({t:q.t,x:q.x,z:q.z,r:q.r})),VOL,FX}))}
/* fresh-new-game defaults, snapshotted at boot (27-boot.js) before any save is applied */
let S0=null;function snapS(){S0=JSON.stringify(S)}
function resetState(){if(!S0)return;Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,JSON.parse(S0));rec=null;dr=null;hold=null}
function loadCode(c){try{c=c.trim();if(c.toLowerCase()=='test'){cheat();return}if(c.slice(0,4)!='FW1-'&&c.slice(0,4)!='FW2-')throw 0;const d=scDecode(c);resetState();Object.assign(S,d.S);ch=d.ch;PL.forEach(q=>scene.remove(q.m));PL=d.PL.map(q=>{const m=mkF(q.t);m.position.set(q.x,0,q.z);m.rotation.y=q.r*Math.PI/2;scene.add(m);return{...q,m}});buildStudio();refresh();parkCars();syncF();buildLots();syncArt();rec=null;dr=null;hold=null;clrGhost();SP='';mode='play';$('ui').innerHTML='';snd('chime');say('Loaded: Day '+S.day)}catch(e){snd('err');say('Invalid save code.')}}

/* autosave: keeps the game in the browser so a refresh doesn't reset it */
let wiping=false;
function autoSave(){if(wiping||mode=='creator'||mode=='load'||(typeof TT!='undefined'&&TT.on&&!TT.game))return;try{localStorage.setItem('fw_save',saveCode())}catch(e){}}
function restoreSave(){let c=null;try{c=localStorage.getItem('fw_save')}catch(e){}if(!c)return false;loadCode(c);if(mode=='play')return true;try{localStorage.removeItem('fw_save')}catch(e){}return false}
setInterval(autoSave,5000);
addEventListener('pagehide',autoSave);
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoSave()});
function wipeSave(){if(!confirm('Wipe your save and start a new game? This cannot be undone.'))return;wiping=true;try{localStorage.removeItem('fw_save')}catch(e){}location.reload()}
