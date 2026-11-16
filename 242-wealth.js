/* WaveFern WEALTH OFFICE (v55.7.0): late-game money. Unlocks at 10M monthly listeners (about day 200), when plain streaming
   cash stops being a challenge. Everything is priced in "days of earnings" (the 7-day average, same idea as 212-endgame.js), so it
   scales with any economy. State is S.wl (saved with the career, lazy, old saves start empty). ?nowealth skips this file.
   1 Businesses (earners): Club, Records label, Merch, Studios. 5 levels each, cost grows 1.9x a level, pays ~2.6% of what you put in per day
     (payback about 38 days), so money has to be spent to grow and keeps meaning something.
   2 Luxury (sinks): Mansion, Yacht, Private Jet, Art Collection, repeatable Charity Gala. They give Prestige; every Prestige adds 1% to
     business income (max +25%), and Prestige earns a title.
   3 Fern Fund: a risky fund. Daily return is drift +0.35% with swings and a rare crash; withdraw any time. Capped at 150 days of earnings.
   Daily payout happens in a wakeUp wrapper (so pause is respected). The button is bottom-left above LEGACY. */
(function(){
 if(/[?&]nowealth/.test(location.search))return;
 const UNLOCK=1e7;
 const BIZ=[['club','Fern Club','a live music venue',6],['label','Fern Records','a roster of signed acts',8],['merch','Fern Merch','a worldwide merch line',10],['studio','Fern Studios','studios you rent to other artists',12]]; /* id,name,what,level 1 cost in days of earnings */
 const MAXL=5,GROW=1.9,YIELD=.026;
 const LUX=[['mansion','Hillside Mansion',60,10],['yacht','Super Yacht',120,15],['jet','Private Jet',250,25],['art','Art Collection',40,6]]; /* id,name,days of earnings,prestige */
 const GALA=[15,3]; /* cost days, prestige; once per 30 days */
 const TITLES=[[0,'Comfortable'],[10,'Rich'],[25,'Mogul'],[45,'Tycoon'],[70,'Billionaire Legend']];
 const FUNDCAP=150,FUNDDRIFT=.0035;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('wealth '+t,e)}}};
 const live=()=>safe(()=>S&&S.artist&&!(typeof TRL!='undefined'&&TRL.on),'live');
 const fm=n=>n>=1e9?+(n/1e9).toFixed(2)+'B':n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(n>=1e5?0:1)+'K':Math.round(n).toLocaleString();
 const $=n=>'$'+fm(n);
 const card=(k,t,s)=>safe(()=>glCard(k,t,s),'card');
 const cash=n=>{S.money=+((+S.money||0)+n).toFixed(0)};
 const wl=()=>{if(!S.wl)S.wl={b:{},lx:{},pr:0,fund:0,fh:[],inc:0,gala:-99,run:0};return S.wl};
 const L=()=>+S.listeners||0;
 const day=()=>safe(()=>{const h=(S.hist||[]).slice(-7);const e=h.reduce((a,x)=>a+(+x.e||0),0)/Math.max(1,h.length);return Math.max(2000,e)},'day')||2000;
 const lvCost=(i,l)=>Math.round(day()*BIZ[i][3]*Math.pow(GROW,l)); /* price of level l+1 */
 const spent=(i,l)=>{let s=0;for(let k=0;k<l;k++)s+=lvCost(i,k);return s};
 const pbonus=()=>Math.min(.25,wl().pr*.01);
 /* income uses the price paid (saved per business), so a later change of earnings never changes what a level already earned */
 const bizInc=i=>{const w=wl();const paid=(w.b[BIZ[i][0]]||{}).paid||0;return Math.round(paid*YIELD*(1+pbonus()))};
 const income=()=>BIZ.reduce((a,_,i)=>a+bizInc(i),0);
 const title=()=>{const p=wl().pr;let t=TITLES[0][1];TITLES.forEach(x=>{if(p>=x[0])t=x[1]});return t};
 const gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=Math.random();return(u-3)/Math.sqrt(.5)};
 function fundDay(){const w=wl();if(!(w.fund>0))return;let r=FUNDDRIFT+gauss()*.014;if(Math.random()<.04)r=-.06-Math.random()*.05;r=Math.max(-.12,Math.min(.09,r));
  const d=Math.round(w.fund*r);w.fund=Math.max(0,w.fund+d);w.fh.push(+(r*100).toFixed(2));if(w.fh.length>14)w.fh.shift();w.fd=d;
  if(r<=-.05)card('FERN FUND CRASH','Down '+Math.abs(+(r*100).toFixed(1))+'% today','You lost '+$(Math.abs(d))+'. It can bounce back.')}
 function wake(){if(!live()||L()<UNLOCK)return;safe(()=>{const w=wl(),n=income();if(n>0){cash(n);w.inc+=n;w.last=n}fundDay();w.run=(w.run||0)+1;bar()},'wake')}
 {const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);wake();return r}}

 /* UI, same look as the Legacy panel */
 let btn=null,pop=null;const css='font:11px Silkscreen,ui-monospace,monospace;color:#e8fff0;';
 function bar(){const sb=live()&&typeof mode!='undefined'&&(mode=='play'||mode=='drive')&&(L()>=UNLOCK||!!S.wl&&S.wl.pr>0);
  if(!btn){btn=document.createElement('button');btn.style.cssText='position:fixed;left:10px;bottom:46px;z-index:30;padding:5px 9px;background:#16241c;border:2px solid #7ad7ff;cursor:pointer;'+css;btn.onclick=open;document.body.appendChild(btn)}
  btn.style.display=sb?'':'none';btn.textContent='$ WEALTH'+(S.wl&&income()?' +'+$(income())+'/day':'')}
 const B=(id,txt,ok)=>'<button data-a="'+id+'" '+(ok?'':'disabled ')+'style="'+css+'padding:3px 8px;margin-left:6px;background:'+(ok?'#7ad7ff':'#333')+';color:'+(ok?'#04141f':'#888')+';border:2px solid #000;cursor:'+(ok?'pointer':'default')+'">'+txt+'</button>';
 const row=(a,b)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #ffffff22;gap:8px"><span>'+a+'</span><span style="white-space:nowrap">'+b+'</span></div>';
 const H=t=>'<h3 style="margin:14px 0 4px;color:#7ad7ff;font-size:12px">'+t+'</h3>';
 function html(){const w=wl(),d=day(),m=+S.money||0;
  let h='<div style="display:flex;justify-content:space-between"><b style="font-size:14px">WEALTH OFFICE</b><span>'+title()+' · '+w.pr+' Prestige (+'+Math.round(pbonus()*100)+'% income)</span></div>';
  h+='<div style="margin:4px 0">Cash '+$(m)+' · Business income '+$(income())+'/day · earned so far '+$(w.inc)+'</div>';
  if(L()<UNLOCK)return h+'<p>Opens at <b>'+fm(UNLOCK)+'</b> monthly listeners.</p>';
  h+=H('BUSINESSES')+'<small>Each level pays about '+(YIELD*100).toFixed(1)+'% of its price every morning.</small>';
  BIZ.forEach((b,i)=>{const e=w.b[b[0]]||{l:0},c=lvCost(i,e.l);
   h+=row('<b>'+b[1]+'</b> <small>'+b[2]+' · level '+e.l+'/'+MAXL+(e.l?' · '+$(bizInc(i))+'/day':'')+'</small>',e.l>=MAXL?'MAX':$(c)+B('b'+i,e.l?'Upgrade':'Buy',m>=c))});
  h+=H('LUXURY')+'<small>Spends cash for Prestige. Every Prestige point adds 1% to business income, up to 25%.</small>';
  LUX.forEach((x,i)=>{const c=Math.round(d*x[2]);h+=row(x[1]+' <small>+'+x[3]+' Prestige</small>',w.lx[x[0]]?'Owned':$(c)+B('l'+i,'Buy',m>=c))});
  const gc=Math.round(d*GALA[0]),gok=S.day-w.gala>=30;
  h+=row('Charity Gala <small>+'+GALA[1]+' Prestige, once a month</small>',gok?$(gc)+B('gala','Host',m>=gc):'Next in '+(30-(S.day-w.gala))+' days');
  const cap=Math.round(d*FUNDCAP);
  h+=H('FERN FUND')+'<div>In the fund: <b>'+$(w.fund)+'</b>'+(w.fd?' <small>('+(w.fd>=0?'+':'-')+$(Math.abs(w.fd))+' yesterday)</small>':'')+'</div><small>Grows about 0.35% a day on average, but swings and can crash. Max '+$(cap)+'. Withdraw any time.</small>';
  const dep=Math.min(Math.round(m*.25),cap-w.fund);
  h+=row('Put in 25% of your cash',$(Math.max(0,dep))+B('dep',"Deposit",dep>0))+row('Take it all out',$(w.fund)+B('wd','Withdraw',w.fund>0));
  if(w.fh.length)h+='<small>Last days: '+w.fh.slice(-10).map(x=>(x>=0?'+':'')+x+'%').join(' ')+'</small>';
  return h}
 function open(){if(pop){pop.remove();pop=null;return}pop=document.createElement('div');pop.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;width:min(520px,94vw);max-height:84vh;overflow:auto;padding:12px 14px;background:#0f1a14;border:3px solid #7ad7ff;'+css;
  const draw=()=>{pop.innerHTML='<div style="text-align:right"><button data-a="x" style="'+css+'background:#333;border:2px solid #000;cursor:pointer">X</button></div>'+html()};draw();document.body.appendChild(pop);
  pop.onclick=e=>safe(()=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;const w=wl(),d=day(),m=+S.money||0;
   if(a=='x'){open();return}
   if(a[0]=='b'){const i=+a.slice(1),id=BIZ[i][0],e2=w.b[id]||(w.b[id]={l:0,paid:0}),c=lvCost(i,e2.l);if(e2.l<MAXL&&m>=c){cash(-c);e2.l++;e2.paid=(e2.paid||0)+c;card('BUSINESS',BIZ[i][1]+' level '+e2.l,'Now pays '+$(bizInc(i))+' a day.')}}
   else if(a[0]=='l'){const i=+a.slice(1),x=LUX[i],c=Math.round(d*x[2]);if(!w.lx[x[0]]&&m>=c){cash(-c);w.lx[x[0]]=1;w.pr+=x[3];card('LUXURY',x[1],'+'+x[3]+' Prestige. You are now: '+title()+'.')}}
   else if(a=='gala'){const c=Math.round(d*GALA[0]);if(S.day-w.gala>=30&&m>=c){cash(-c);w.gala=S.day;w.pr+=GALA[1];card('CHARITY GALA','Your name is everywhere','+'+GALA[1]+' Prestige.')}}
   else if(a=='dep'){const cap=Math.round(d*FUNDCAP),x=Math.min(Math.round(m*.25),cap-w.fund);if(x>0){cash(-x);w.fund+=x}}
   else if(a=='wd'){if(w.fund>0){cash(w.fund);w.fund=0}}
   draw();bar()},'click')};
 setInterval(()=>safe(()=>{if(live())bar()},'tick'),2000);
 window.FW_WEALTH={wl,day,income,title}; /* testing / dev panel */
})();
