/* ---------- v49.69.0: save vault, export / import, and safe moves between Firebase projects ----------
   Every career already lives in this browser (fw_save_N, or fw_u_{uid}_save_N for a Google account); the cloud is a second copy.
   This adds, all on this device:
   - fw_vault: a separate copy of each career with the one before it, refreshed every minute, when the tab hides and before any cloud load.
   - Settings > Save: Export save (one file with every career on this device) and Import save (kept as recovered backups, empty slots filled).
   - Firebase project move: fw_fbproj remembers which project this device last used. If the config changes, the careers of every account
     on this device are copied into the empty guest slots, and the first Google sign-in on the new project uploads that career by itself.
   Nothing here ever overwrites a career with an empty or unreadable one. */
const VT_K='fw_vault',VT_PROJ='fw_fbproj';
function vtOK(code){try{const d=scDecode(code);return!!(d&&d.S&&typeof d.S=='object')}catch(e){return false}}
function vtInfo(code){try{const s=scDecode(code).S;return{artist:s.artist||'',day:s.day||0}}catch(e){return null}}
function vtGet(){try{const v=JSON.parse(localStorage.getItem(VT_K));return v&&v.e?v:{e:{}}}catch(e){return{e:{}}}}
/* every career stored in this browser: guest and every account, slots 1-2, newest/furthest first */
function vtAll(){const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),m=/^fw_(u_(.+?)_)?save_([12])$/.exec(k);if(!m)continue;
  const c=localStorage.getItem(k),n=vtInfo(c);if(c&&n)out.push({k,scope:m[2]||'guest',slot:+m[3],code:c,artist:n.artist,day:n.day})}}catch(e){}
 return out.sort((a,b)=>b.day-a.day)}
function vtTouch(){if(typeof FW_TRL!='undefined'&&FW_TRL)return;try{const v=vtGet(),now=Date.now();let ch=0;
 vtAll().forEach(c=>{const e=v.e[c.k];if(e&&e.code===c.code)return;
  if(e&&e.code&&e.artist==c.artist&&c.day<e.day&&vtOK(e.code)){/* an earlier day of the same career is not allowed to replace the vault copy */return}
  const n={code:c.code,artist:c.artist,day:c.day,t:now,ver:typeof GAME_VERSION!='undefined'?GAME_VERSION:''};
  if(e&&e.code&&vtOK(e.code)&&(!e.prevT||now-e.prevT>6e5||e.artist!=c.artist)){n.prev=e.code;n.prevT=now}else if(e&&e.prev){n.prev=e.prev;n.prevT=e.prevT}
  v.e[c.k]=n;ch=1});
 if(!ch)return;v.t=now;v.v=1;
 try{localStorage.setItem(VT_K,JSON.stringify(v))}catch(x){for(const k in v.e)delete v.e[k].prev;try{localStorage.setItem(VT_K,JSON.stringify(v))}catch(y){}}}catch(e){}}
setInterval(()=>{try{if(typeof requestIdleCallback=='function')requestIdleCallback(vtTouch,{timeout:5000});else vtTouch()}catch(e){}},60000);
addEventListener('pagehide',vtTouch);document.addEventListener('visibilitychange',()=>{if(document.hidden)vtTouch()});
setTimeout(vtTouch,4000);

/* export / import */
function vtExport(){try{vtTouch();autoSave();const keys={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^fw_(u_.+?_)?(save_[12]|slot)$|^fw_bak_\d+$|^fw_bakw_\d+$|^fw_opt$/.test(k))keys[k]=localStorage.getItem(k)}
 const n=vtAll().length,lg=typeof rsGet=='function'?rsGet():null;if(!n&&!(lg&&lg.e.length)){say('Nothing to export yet.');return}
 const blob=new Blob([JSON.stringify({app:'wavefern',format:1,version:typeof GAME_VERSION!='undefined'?GAME_VERSION:'',exported:new Date().toISOString(),keys,legacy:lg&&lg.e.length?lg:undefined})],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wavefern-save-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();
 setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},2000);snd('chime');say('Save file downloaded ('+n+' career'+(n==1?'':'s')+(lg&&lg.e.length?', '+lg.e.length+' Legacy':'')+')')}catch(e){snd('err');say('Could not export your save.')}}
function vtImportPick(){snd('click');const f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.onchange=()=>{const x=f.files&&f.files[0];if(x)x.text().then(vtImport,()=>say('Could not read that file.'))};f.click()}
function vtImport(txt){try{const d=JSON.parse(txt);if(!d||d.app!='wavefern'||!d.keys||typeof d.keys!='object')throw 0;
 const inc=[];for(const k in d.keys){if(!/^fw_(u_.+?_)?save_[12]$|^fw_bak_\d+$/.test(k))continue;const c=d.keys[k];if(typeof c!='string'||!vtOK(c))continue;if(!inc.some(q=>q.code==c))inc.push({code:c,...vtInfo(c)})}
 const lgn=typeof rsMerge=='function'&&d.legacy?rsMerge(d.legacy):0;
 if(!inc.length){if(lgn){snd('chime');say('Added '+lgn+' Legacy career'+(lgn==1?'':'s')+'. See Settings > Save.');return}snd('err');say('No careers found in that file.');return}
 inc.sort((a,b)=>b.day-a.day);let filled=0,kept=0,skipped=0;
 for(const c of inc){let done=0;
  for(let n=1;n<=SLOTS&&!done;n++){const k=slotKey(n);if(!localStorage.getItem(k)&&n!=BOOT_SLOT||(!localStorage.getItem(k)&&n==BOOT_SLOT&&!TT.game)){localStorage.setItem(k,c.code);filled++;done=1}}
  if(!done){const have=vtAll().some(q=>q.code==c.code);if(have){skipped++;continue}if(bakKeep(c.code,'Imported from a save file'))kept++;else skipped++}}
 vtTouch();snd('chime');
 const m='Imported '+(filled+kept)+' career'+(filled+kept==1?'':'s')+(kept?'. '+kept+' in Recovered backups on the career select screen':'')+(skipped?'. '+skipped+' already here':'');
 if(filled){try{sessionStorage.setItem('fw_msg',m)}catch(e){}wiping=true;location.reload()}else say(m)}catch(e){snd('err');say('That is not a WaveFern save file.')}}
function vtRestore(){const e=vtGet().e[slotKey()];const c=e&&(e.code&&vtOK(e.code)?e:null);if(!c){say('No backup copy of this career yet.');return}
 if(!confirm('Load the backup copy of '+(c.artist||'this career')+' (Day '+c.day+', saved '+new Date(c.t).toLocaleString()+')? Your current career is kept in Recovered backups.'))return;
 try{bakKeep(saveCode(),'Kept before the backup copy loaded')}catch(x){}loadCode(c.code);autoSave()}
{const b0=stBody;stBody=function(){const h=b0.apply(this,arguments);if(STAB!='save')return h;
 const v=vtGet(),t=v.t?new Date(v.t).toLocaleString([],{dateStyle:'medium',timeStyle:'short'}):'not yet';
 return h+`<div class=row2 style="margin-top:10px"><button onclick="vtExport()">Export save</button><button onclick="vtImportPick()">Import save</button></div><div class=row2 style="margin-top:6px"><button onclick="vtRestore()">Load backup copy</button></div><p class=m><small>Export downloads a file with every career on this device. Import it on any browser or after WaveFern moves servers. Backup copy last updated: ${t}.</small></p>`}}
