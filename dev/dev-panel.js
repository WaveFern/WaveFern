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
 w.innerHTML='<div class=p><h4>DEV SLOT</h4><small>Separate save. Cloud is switched off. Nothing here touches real saves or players.</small><div id=fwdvb></div><div class=st id=fwdvs></div></div><button class=t id=fwdvt>DEV</button>';
 document.body.appendChild(w);
 const say=t=>{document.getElementById('fwdvs').textContent=t};
 const g=f=>{try{return f()}catch(e){return undefined}};
 const ready=()=>g(()=>typeof S==='object'&&S&&S.day!==undefined);
 const sv=m=>{g(()=>refreshHud());g(()=>autoSave());say(m)};
 const need=fn=>()=>{if(!ready())return say('Start or load a career first.');try{fn()}catch(e){say('Failed: '+e.message)}};
 const jump=n=>need(()=>{S.day=Math.min(100000,(S.day||1)+n);S.t=0;sv('Day '+S.day)});
 const sections=[
  ['Reset and announcements',[
   ['Wipe dev save and restart',()=>{if(!confirm('Wipe the DEV save? Real saves are not touched.'))return;window.wiping=true;g(()=>{wiping=true});FW_DEV_REAL&&Object.keys(FW_DEV_REAL).filter(k=>k.indexOf('dev:')===0&&k!=='dev:fw_moved').forEach(k=>FW_DEV_REAL.removeItem(k));location.reload()}],
   ['Show fresh-start notice again',()=>{localStorage.removeItem('fw_ann_seen');Object.keys(FW_DEV_REAL).filter(k=>k.indexOf('dev:fw_ann_seen')===0).forEach(k=>FW_DEV_REAL.removeItem(k));say('Reload to see the notice.')}],
   ['Reload',()=>location.reload()]]],
  ['Founder',[
   ['Grant Founder status',need(()=>{S.founder=1;S.founderAt=S.founderAt||Date.now();sv('Founder set on the dev save')})],
   ['Remove Founder status',need(()=>{delete S.founder;delete S.founderAt;sv('Founder removed')})]]],
  ['Public profile (mockup)',[
   ['Open my profile',()=>FW_PROFILE.open('me')],
   ['Open a friend profile',()=>FW_PROFILE.open('marlo')],
   ['Open a stranger profile',()=>FW_PROFILE.open('dex')],
   ['Open mock Friends window',()=>FW_PROFILE.friendsWin()],
   ['Show mock band room panel',()=>FW_PROFILE.mockBand()]]],
 ['Time',[
   ['Skip 1 day',jump(1)],['Skip 7 days',jump(7)],['Skip 30 days',jump(30)],['Skip 100 days',jump(100)],
   ['Set time to morning',need(()=>{S.t=0;sv('Morning')})]]],
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
