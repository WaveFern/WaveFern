/* ===== v55.21.0: Calendar app (phone + computer) =====
   Everything dated in the career shows up here on its own: Swiftwing flights, brand deal offers and photoshoot deadlines,
   festival bookings and Sunset Beach Club gigs. The player can also add their own events.
   Past items are copied into S.cal.log as they appear (the source lists get trimmed over time), so the history stays.
   State (lazy, old saves start empty): S.cal={ev:[{id,d,t,tm}],log:{key:{k,d,tm,t,s}},nid}
   Look: a wall calendar in the game's dark green, 28-day months (4 weeks), hard-edged pixel tags per kind. */
(function(){
const TY={fl:['Flight','#3fa0ff'],br:['Brand','#ff3d81'],fe:['Festival','#2fe68a'],bc:['Beach club','#ffb000'],me:['Mine','#f4efe2']},
 WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],ML=28;
const C={m:0,sel:null,msg:''};
const st=()=>{if(!S.cal||typeof S.cal!='object')S.cal={ev:[],log:{},nid:1};if(!Array.isArray(S.cal.ev))S.cal.ev=[];if(!S.cal.log||typeof S.cal.log!='object')S.cal.log={};if(!(S.cal.nid>0))S.cal.nid=1;return S.cal};
const hm=m=>{m=Math.round(m);const h=Math.floor(m/60)%24,n=m%60;return(h<10?'0':'')+h+':'+(n<10?'0':'')+n};
function derived(){const o=[],T=window.TRAVEL;
 try{if(T)T.st().tickets.forEach(k=>{const s=k.st=='booked'?'':k.st=='flown'?'done':k.st=='missed'?'missed':k.st=='cancelled'?'cancelled':'';if(s=='cancelled')return;
  o.push({key:'fl'+k.id,k:'fl',d:T.dayOf(k.dep),tm:hm(((k.dep%1440)+1440)%1440),t:k.fl+' to '+T.city(k.to),s})})}catch(e){}
 try{(S.brands&&S.brands.list||[]).forEach(b=>{const br=(window.BRD&&BRD.brands||[]).find(x=>x.id==b.b),n=br?br.n||br.name||b.b:b.b;
  if(b.st==0)o.push({key:'bo'+b.id,k:'br',d:b.exp,t:n+' offer runs out',s:S.day>b.exp?'missed':''});
  if(b.st==1)o.push({key:'bd'+b.id,k:'br',d:b.due,t:n+' photoshoot due',s:''});
  if(b.st==3)o.push({key:'bd'+b.id,k:'br',d:b.due||S.day,t:n+' photoshoot done',s:'done'});
  if(b.st==5)o.push({key:'bd'+b.id,k:'br',d:b.due||S.day,t:n+' deal lost',s:'missed'})})}catch(e){}
 try{(S.festBk||[]).forEach(b=>{o.push({key:'fe'+b.id,k:'fe',d:b.day,tm:hm([600,840,1080,1320][b.slot]||600),t:'Festival set, stage '+b.n,s:b.st?'done':''})})}catch(e){}
 try{((S.bcg&&S.bcg.list)||[]).forEach(b=>{if(b.st==1||b.st==3||b.st==5)o.push({key:'bc'+b.id,k:'bc',d:b.day,t:'Sunset Beach Club gig',s:b.st==3?'done':b.st==5?'missed':''})})}catch(e){}
 return o}
function all(){const c=st(),d=derived();d.forEach(e=>{if(e.d<S.day||e.s){c.log[e.key]=e}});
 const ks=Object.keys(c.log);if(ks.length>150){ks.sort((a,b)=>c.log[a].d-c.log[b].d).slice(0,ks.length-150).forEach(k=>delete c.log[k])}
 const m=new Map();Object.keys(c.log).forEach(k=>m.set(k,c.log[k]));d.forEach(e=>m.set(e.key,e));
 const L=[...m.values()];c.ev.forEach(e=>L.push({key:'me'+e.id,id:e.id,k:'me',d:e.d,tm:e.tm||'',t:e.t,s:'',own:1}));return L}
function css(){if(document.getElementById('calcss'))return;const s=document.createElement('style');s.id='calcss';s.textContent=`
.mn.calmn{padding:0!important;background:#14201b}
.cal{min-height:100%;box-sizing:border-box;background:#14201b;color:#efe9de;font:14px/1.35 "Trebuchet MS","Segoe UI",Arial,sans-serif;padding:14px 16px 24px}
.cal *{box-sizing:border-box}
.cal .ch{display:flex;align-items:center;gap:10px;margin-bottom:12px}.cal .ch h1{margin:0;font:700 22px "Trebuchet MS",Arial,sans-serif;color:#efe9de}.cal .ch small{display:block;color:#8fa79a;font-size:12px}
.cal .ch img{width:34px;height:34px;image-rendering:pixelated;box-shadow:3px 3px 0 #0008}
.cal .nav{margin-left:auto;display:flex;gap:6px}
.cal button{all:unset;cursor:pointer;background:#263a31;color:#efe9de;padding:7px 12px;font-weight:700;font-size:13px;border-radius:2px;box-shadow:3px 3px 0 #0008}
.cal button:hover{background:#31493d}.cal button:active{box-shadow:1px 1px 0 #0008;transform:translate(2px,2px)}
.cal button.go{background:#ff3d81;color:#fff}.cal button.go:hover{background:#ff5c96}.cal button.x{padding:3px 8px;box-shadow:none;color:#8fa79a}
.cal .wd,.cal .gr{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal .wd span{font-size:12px;color:#8fa79a;padding:0 4px 4px}
.cal .dy{min-height:68px;background:#1d2a24;border:2px solid #1d2a24;padding:4px 5px;cursor:pointer;display:flex;flex-direction:column;gap:3px;border-radius:2px}
.cal .dy:hover{background:#263a31}.cal .dy.sel{border-color:#efe9de}.cal .dy.now{border-color:#ff3d81}
.cal .dy.past{opacity:.6}
.cal .dy b{font:700 13px ui-monospace,Menlo,monospace;color:#efe9de;font-variant-numeric:tabular-nums}
.cal .dy.now b{color:#ff3d81}
.cal .dy .st{display:flex;flex-wrap:wrap;gap:3px}.cal .dy .st i{width:8px;height:8px;border-radius:1px;box-shadow:1px 1px 0 #0009}
.cal .dy .st em{font:700 10px ui-monospace,monospace;color:#8fa79a;font-style:normal;line-height:8px}
.cal .pn{margin-top:14px;background:#1d2a24;padding:12px 14px;border-radius:2px;box-shadow:4px 4px 0 #0008}
.cal .pn h3{margin:0 0 8px;font:700 15px "Trebuchet MS",Arial,sans-serif;color:#efe9de}
.cal .ev{display:flex;align-items:center;gap:10px;padding:6px 8px 6px 0;border-bottom:1px solid #efe9de14}
.cal .ev:last-of-type{border-bottom:0}
.cal .tag{font:700 11px ui-monospace,monospace;color:#14201b;padding:2px 6px;border-radius:2px;box-shadow:2px 2px 0 #0009;white-space:nowrap}
.cal .ev .tm{font:12px ui-monospace,monospace;color:#8fa79a;min-width:40px}
.cal .ev .tt{flex:1}.cal .ev.done .tt{color:#8fa79a;text-decoration:line-through}.cal .ev.missed .tt{color:#e5484d}
.cal .m2{color:#8fa79a;font-size:12px}
.cal .add{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.cal input{font:inherit;background:#14201b;color:#efe9de;border:2px solid #31493d;padding:6px 8px;border-radius:2px;min-width:0}
.cal input:focus{outline:0;border-color:#ff3d81}.cal input.t{flex:1;min-width:140px}.cal input.tm{width:92px}
.cal .lg{display:flex;gap:12px;flex-wrap:wrap;margin:10px 2px 0;font-size:12px;color:#8fa79a}.cal .lg i{display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:1px}
@media(max-width:560px){.cal .dy{min-height:52px}.cal .dy .st i{width:6px;height:6px}}`;document.head.appendChild(s)}
function page(ctx){css();C.ctx=ctx;const L=all(),by={},td=S.day,m=C.m!=null?C.m:0;if(C.init!==1){C.init=1;C.m=Math.floor((td-1)/ML)}
 L.forEach(e=>(by[e.d]=by[e.d]||[]).push(e));const s0=C.m*ML+1,sel=C.sel==null?td:C.sel;
 const cells=[];for(let i=0;i<ML;i++){const d=s0+i,es=(by[d]||[]),tys=[...new Set(es.map(e=>e.k))];
  cells.push(`<div class="dy${d==td?' now':''}${d==sel?' sel':''}${d<td?' past':''}" onclick="calSel(${d})"><b>${d}</b><div class=st>${tys.map(k=>`<i style="background:${TY[k][1]}"></i>`).join('')}${es.length>1?`<em>${es.length}</em>`:''}</div></div>`)}
 const es=(by[sel]||[]).slice().sort((a,b)=>(a.tm||'99').localeCompare(b.tm||'99'));
 const wdn=WD[((sel-1)%7+7)%7];
 return`<div class=cal><div class=ch><img src="${IC.cal}" alt=""><div><h1>Calendar</h1><small>Month ${C.m+1} · days ${s0}–${s0+ML-1} · today is day ${td}</small></div>
  <div class=nav><button onclick="calMo(-1)" title="Previous month">‹</button><button onclick="calMo(0)">Today</button><button onclick="calMo(1)" title="Next month">›</button></div></div>
  <div class=wd>${WD.map(w=>`<span>${w}</span>`).join('')}</div><div class=gr>${cells.join('')}</div>
  <div class=lg>${Object.keys(TY).map(k=>`<span><i style="background:${TY[k][1]}"></i>${TY[k][0]}</span>`).join('')}</div>
  <div class=pn><h3>${wdn}, day ${sel}${sel==td?' (today)':''}</h3>
  ${es.length?es.map(e=>`<div class="ev ${e.s||''}"><span class=tag style="background:${TY[e.k][1]}">${TY[e.k][0]}</span><span class=tm>${e.tm||''}</span><span class=tt>${esc(e.t)}</span>${e.own?`<button class=x onclick="calDel(${e.id})">Delete</button>`:''}</div>`).join(''):'<div class=m2>Nothing planned.</div>'}
  <div class=add><input class=t id=calt maxlength=60 placeholder="Add an event on day ${sel}"><input class=tm id=calm type=time><button class=go onclick="calAdd(${sel})">Add</button></div>${C.msg?`<div class=m2 style="margin-top:6px">${esc(C.msg)}</div>`:''}</div></div>`}
function rr(){if(C.ctx=='ph'&&$('ph')&&typeof phR=='function')phR();else if(typeof mode!='undefined'&&mode=='pc'&&app=='cal')pcR()}
window.calSel=d=>{C.sel=d;C.msg='';rr()};
window.calMo=d=>{if(!d){C.m=Math.floor((S.day-1)/ML);C.sel=S.day}else{C.m=Math.max(0,C.m+d);C.sel=C.m*ML+1}C.msg='';rr()};
window.calAdd=d=>{const t=($('calt')||{}).value||'',tm=($('calm')||{}).value||'';if(!t.trim()){C.msg='Type a name first';return rr()}
 const c=st();if(c.ev.length>=200){C.msg='That is a lot of events. Delete some first.';return rr()}c.ev.push({id:c.nid++,d,t:t.trim().slice(0,60),tm});C.msg='';try{snd('pop')}catch(e){}rr()};
window.calDel=id=>{const c=st();c.ev=c.ev.filter(e=>e.id!=id);try{snd('click')}catch(e){}rr()};
APPD.cal={n:'Calendar',p:0,d:'Preinstalled. Flights, brand deals, festival and beach club bookings fill in by themselves. Add your own events too.'};
try{IC.cal=mkIc(['..........','.R..RR..R.','.R..RR..R.','CCCCCCCCCC','CWWCWWCWWC','CWWCWWCWWC','CCCCCCCCCC','CWWCWWCWWC','CWWCWWCPPC','CCCCCCCCCC'].map(r=>r.replace(/\./g,'C')),{C:'#1d2a24',R:'#ff3d81',W:'#efe9de',P:'#ff3d81'})}catch(e){IC.cal=IC.store}
setInterval(()=>{try{if(S&&S.artist&&S.apps&&!S.apps.cal)S.apps.cal=1}catch(e){}},1000);
PA.cal=()=>page('pc');
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{const m=document.querySelector('#pc .mn');if(m)m.classList.toggle('calmn',app=='cal'&&!!m.querySelector('.cal'))}catch(e){}return r}}
try{if(typeof GP_APPS!='undefined'&&!GP_APPS.some(a=>a[0]=='cal')){GP_APPS.push(['cal','Calendar',()=>IC.cal,'#ff3d81']);if(typeof GP_TITLE!='undefined')GP_TITLE.cal='Calendar'}
 if(typeof phBody=='function'){const b0=phBody;phBody=function(){if(typeof PH!='undefined'&&PH.app=='cal')return`<div class=phx>${page('ph')}</div>`;return b0.apply(this,arguments)}}}catch(e){console.error('calendar phone',e)}
window.CAL={all,derived,st};
})();
