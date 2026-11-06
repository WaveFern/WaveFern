/* WaveFern dev panel. Only loaded on /dev/ after the password. Edits the DEV save only (see dev-shim.js). */
(function(){
 if(!window.FW_DEV)return;
 const css=document.createElement('style');
 css.textContent=`#fwdv{position:fixed;left:8px;bottom:8px;z-index:100001;font:12px ui-monospace,Menlo,Consolas,monospace;color:#e8f3ec}
#fwdv .t{background:#04120a;color:#2fe68a;border:2px solid #2fe68a;padding:6px 10px;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;cursor:pointer}
#fwdv .p{display:none;margin-bottom:6px;width:260px;max-height:70vh;overflow:auto;background:#0b0f0d;border:2px solid #2fe68a;padding:10px;box-shadow:6px 6px 0 #0008}
#fwdv.o .p{display:block}
#fwdv h4{margin:0 0 4px;font:12px Silkscreen,ui-monospace,monospace;color:#2fe68a;letter-spacing:1px}
#fwdv small{display:block;color:#8aa094;line-height:1.4;margin-bottom:8px}
#fwdv h5{margin:10px 0 4px;font:10px Silkscreen,ui-monospace,monospace;color:#8aa094;letter-spacing:1px}
#fwdv .p button{display:block;width:100%;text-align:left;margin:3px 0;padding:7px 8px;background:#161d19;color:#e8f3ec;border:1px solid #2a352e;font:inherit;cursor:pointer}
#fwdv .p button:hover{border-color:#2fe68a}
#fwdv .st{margin-top:8px;color:#2fe68a;min-height:14px}`;
 document.head.appendChild(css);
 const w=document.createElement('div');w.id='fwdv';
 w.innerHTML='<div class=p><h4>DEV SLOT</h4><small id=fwdvbn></small><small>Separate save. Cloud is switched off. Nothing here touches real saves or players.</small><div id=fwdvb></div><div class=st id=fwdvs></div></div><button class=t id=fwdvt>DEV</button>';
 document.body.appendChild(w);
 const bn=document.getElementById('fwdvbn');if(bn)bn.textContent='Build '+(window.FW_DEV_BUILD||'?')+(typeof GAME_VERSION!='undefined'?' on game '+GAME_VERSION:'');
 document.getElementById('fwdvt').textContent='DEV '+String(window.FW_DEV_BUILD||'').replace(/^dev-/,'');
 const say=t=>{document.getElementById('fwdvs').textContent=t};
 const g=f=>{try{return f()}catch(e){return undefined}};
 const ready=()=>g(()=>typeof S==='object'&&S&&S.day!==undefined);
 const sv=m=>{g(()=>refreshHud());g(()=>autoSave());say(m)};
 const need=fn=>()=>{if(!ready())return say('Start or load a career first.');try{fn()}catch(e){say('Failed: '+e.message)}};
 const jump=n=>need(()=>{S.day=Math.min(100000,(S.day||1)+n);S.t=0;sv('Day '+S.day)});
 const setWx=(k,n)=>{S.wx={d:S.day,k,said:1};sv(n+' today'+(FW_XMAS&&(k=='rain'||k=='storm')?' (Christmas turns it into snow)':''))};
 const setT=(t,n)=>{S.t=t;sv(n)};
 const popUp=(k,p)=>{g(()=>popToday());if(!S.pop||S.pop.d!==S.day)return say('Pop-ups are not ready yet.');S.pop.ev=S.pop.ev.filter(v=>v.k!==k);S.pop.ev.push({k,p,s:0,e:1800,done:0,an:0});sv('Pop-up open: '+k+'. Use the map (N) or Go to the nearest pop-up.')};
 const sections=[
  ['Reset and announcements',[
   ['Wipe dev save and restart',()=>{if(!confirm('Wipe the DEV save? Real saves are not touched.'))return;window.wiping=true;g(()=>{wiping=true});FW_DEV_REAL&&Object.keys(FW_DEV_REAL).filter(k=>k.indexOf('dev:')===0&&k!=='dev:fw_moved').forEach(k=>FW_DEV_REAL.removeItem(k));location.reload()}],
   ['Show fresh-start notice again',()=>{localStorage.removeItem('fw_ann_seen');Object.keys(FW_DEV_REAL).filter(k=>k.indexOf('dev:fw_ann_seen')===0).forEach(k=>FW_DEV_REAL.removeItem(k));say('Reload to see the notice.')}],
   ['Reload',()=>location.reload()]]],
  ['Founder',[
   ['Grant Founder status',need(()=>{S.rv=S.rv||1;S.fdr=S.fdr||{v:1,a:'Test',d:41,g:{}};founderSync();sv('Founder set on the dev save')})],
   ['Remove Founder status',need(()=>{delete S.fdr;founderSync();sv('Founder removed')})]]],
  ['Public profile (mockup)',[
   ['Open my profile',()=>FW_PROFILE.open('me')],
   ['Open a friend profile',()=>FW_PROFILE.open('marlo')],
   ['Open a stranger profile',()=>FW_PROFILE.open('dex')],
   ['Open mock Friends window',()=>FW_PROFILE.friendsWin()],
   ['Show mock band room panel',()=>FW_PROFILE.mockBand()]]],
  ['Weather',[
   ['Weather: clear',need(()=>setWx('sun','Clear'))],
   ['Weather: fog',need(()=>setWx('fog','Fog'))],
   ['Weather: snow (Christmas event)',need(()=>setWx('snow','Snow'))],
   ['Weather: rain (off in Christmas)',need(()=>setWx('rain','Rain'))],
   ['Weather: thunderstorm (off in Christmas)',need(()=>setWx('storm','Thunderstorm'))],
   ['Weather: roll a random day',need(()=>{S.wx=null;g(()=>wxToday());say('Rolled: '+g(()=>S.wx.k))})]]],
  ['Time of day',[
   ['Morning (06:00)',need(()=>setT(0,'Morning'))],['Midday (13:00)',need(()=>setT(150,'Midday'))],
   ['Evening (19:00)',need(()=>setT(270,'Evening'))],['Night (20:00)',need(()=>setT(300,'Night'))],
   ['Midnight (01:00)',need(()=>setT(450,'Midnight'))]]],
  ['Pop-up events (open all day)',[
   ['Block party',need(()=>popUp('party','meadow'))],['Record store signing',need(()=>popUp('signing','plaza'))],
   ['Radio roadshow',need(()=>popUp('radio','plaza'))],['Open mic',need(()=>popUp('openmic','fernm'))],
   ['Food truck rally',need(()=>popUp('food','meadow'))],['Street photo shoot',need(()=>popUp('shoot','avenue'))],
   ['Go to the nearest pop-up',need(()=>{const l=g(()=>popToday())||[];if(!l.length)return say('No pop-ups today.');l.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));const v=l[0],f=g(()=>popFree(v.x,v.z+4.2))||[v.x,v.z+4.2];P.x=f[0];P.z=f[1];P.rot=Math.PI;g(()=>{camT.x=P.x;camT.z=P.z});say('At '+v.name)})],
   ['Clear today\'s pop-ups',need(()=>{if(S.pop)S.pop.ev=[];sv('Pop-ups cleared for today')})]]],
  ['City crowds',[
   ['Crowd: always on (ignore fame)',()=>{FW_CROWD.force=!FW_CROWD.force;say('Forced crowd '+(FW_CROWD.force?'on':'off'))}],
   ['Crowd: switch off / on',()=>{FW_CROWD.off=!FW_CROWD.off;say('Crowd '+(FW_CROWD.off?'off':'on'))}],
   ['Crowd status',()=>say('Crowd '+FW_CROWD.n+' of '+FW_CROWD.want+', guards '+g(()=>S.guards))],
   ['Bodyguards with me: 0',need(()=>{S.guards=0;g(()=>syncF());sv('0 bodyguards')})],
   ['Bodyguards with me: 1',need(()=>{S.guards=1;S.gs='follow';g(()=>syncF());sv('1 bodyguard')})],
   ['Bodyguards with me: 3',need(()=>{S.guards=3;S.gs='follow';g(()=>syncF());sv('3 bodyguards')})]]],
  ['Time',[
   ['Skip 1 day',jump(1)],['Skip 7 days',jump(7)],['Skip 30 days',jump(30)],['Skip 100 days',jump(100)]]],
  ['Progress',[
   ['Add 1,000,000 money',need(()=>{S.money=+((S.money||0)+1e6).toFixed(2);sv('Money added')})],
   ['Refill energy',need(()=>{S.energy=100;S.stam=100;sv('Energy full')})],
   ['Unlock everything (test career)',need(()=>{cheat();sv('Test career applied')})]]]
 ];
 const box=document.getElementById('fwdvb');
 sections.forEach(([h,items])=>{const e=document.createElement('h5');e.textContent=h;box.appendChild(e);items.forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;box.appendChild(b)})});
 document.getElementById('fwdvt').onclick=()=>w.classList.toggle('o');
 addEventListener('keydown',e=>{if(e.key==='`'&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))w.classList.toggle('o')});
})();
