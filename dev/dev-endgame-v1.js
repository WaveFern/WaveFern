/* WaveFern dev: ENDGAME - "Road to 4B" and the Legend era (4,000,000,000 monthly listeners). Only loaded on /dev/. ?noendgame skips it.
   Does not retune any base number: everything is gated on listeners >= 1M (road bar) or >= 4B (Legend era), and all prices/rewards scale
   from the player's own recent daily earnings, so it works at any economy. State is S.eg (saved with the career).
   1 Road to 4B: milestone ladder 2M -> 4B with cash rewards (3 days of earnings each), progress bar once the early ladder is done.
   2 Legend era at 4B: Legacy Points (LP) + the Legend Hall button (LEGACY, bottom-left).
   3 Chart Wars: rival superstars; pay to challenge, next morning your streams must beat their target. Endless rematches, harder each time.
   4 Empire projects: listener-gated (4B..10B), cash is only a secondary cost (sponsor suite ... space concert) that pay daily income and LP.
   5 World Records book: beat your own best day / peak listeners / richest day by 5% for LP and cash.
   6 Relics: collectibles bought with LP; full set = Immortal title.
   7 Ascend: spend LP to raise your Legacy Tier (endless): more empire income and bigger rival rewards. */
(function(){
 if(!window.FW_FEAT||/[?&]noendgame/.test(location.search))return;
 const GOAL=4e9,LAD=[2e6,5e6,1e7,2.5e7,5e7,1e8,2.5e8,5e8,1e9,2e9,3e9,4e9];
 const RIV=[['Nova Prime',1.0,3,3],['DJ Eclipse',1.1,4,5],['The Velvet Kings',1.25,5,8],['Oracle',1.5,7,14],['KING OF POP',2.0,10,30]]; /* name, target mult, LP, cash in days of earnings */
 const PRJ=[['Sponsor Suite',3,1,4e9],['Stadium Naming Rights',10,2,4.5e9],['Private Island Studio',30,3,5e9],['Record Label Takeover',75,5,6e9],['Fan Museum',200,8,8e9],['Space Concert Rocket',500,12,1e10]]; /* name, cost in days of earnings (cash is secondary), LP, listeners needed */
 const RQ=[4e9,4.5e9,5e9,6e9,8e9]; /* listeners needed to challenge each rival (cycles repeat at 1.25x) */
 const REL=[['Golden Disc',2],['Diamond Mic',2],['Platinum Vinyl',3],['Crown of Charts',3],['Neon Guitar',4],['Moonlit Piano',5],['Stage of Stars',6],['Eternal Spotlight',8],['Laurel of Legends',10],['The First Demo Tape',15]];
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev endgame '+t,e)}}};
 const live=()=>safe(()=>S&&S.artist&&!(typeof TRL!='undefined'&&TRL.on),'live');
 const fm=n=>n>=1e9?+(n/1e9).toFixed(2)+'B':n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(n>=1e5?0:1)+'K':Math.round(n).toLocaleString();
 const card=(k,t,s)=>safe(()=>glCard(k,t,s),'card');
 const cash=n=>{S.money=+((+S.money||0)+n).toFixed(0)};
 const eg=()=>{if(!S.eg)S.eg={ms:0,lp:0,tier:0,pj:{},rel:{},rec:{},wins:0,cy:0,rv:0,ch:null,leg:0};return S.eg};
 const L=()=>+S.listeners||0;
 /* one "day of earnings": average of the last 7 days (min $2k so early-cheat saves still get sane prices) */
 const day=()=>safe(()=>{const h=(S.hist||[]).slice(-7);const e=h.reduce((a,x)=>a+(+x.e||0),0)/Math.max(1,h.length);return Math.max(2000,e)},'day')||2000;
 const last=()=>(S.hist||[])[(S.hist||[]).length-1]||{};
 const income=()=>{const g=eg();let s=0;PRJ.forEach((p,i)=>{if(g.pj[i])s+=g.pj[i]*.005});return Math.round(s*(1+.25*g.tier))};
 const title=()=>{const g=eg();return REL.every((_,i)=>g.rel[i])?'Immortal':g.leg?'Legend'+(g.tier?' '+'I'.repeat(Math.min(g.tier,5))+(g.tier>5?'+':''):''):''};

 function ladder(){const g=eg();while(g.ms<LAD.length&&L()>=LAD[g.ms]){const r=Math.round(day()*3*(1+g.ms*.15));cash(r);g.ms++;
   card('ROAD TO 4B '+g.ms+'/'+LAD.length,fm(LAD[g.ms-1])+' monthly listeners','+$'+fm(r)+' bonus.'+(g.ms<LAD.length?' Next: '+fm(LAD[g.ms])+'.':' You made it. Open LEGACY.'));try{snd('ping')}catch(e){}}
  if(!g.leg&&L()>=GOAL){g.leg=1;g.lp+=10;card('LEGEND','4 BILLION LISTENERS','Welcome to the Legend era. +10 Legacy Points. Open LEGACY for Chart Wars, empire projects, records and relics.');try{snd('ping')}catch(e){}}}
 function records(){const g=eg();if(!g.leg)return;const h=last(),cur={st:+h.st||0,ml:L(),e:+h.e||0},nm={st:'best streaming day',ml:'peak listeners',e:'richest day'};
  Object.keys(cur).forEach(k=>{const o=g.rec[k]||0;if(cur[k]>o){g.rec[k]=cur[k];if(o>0&&cur[k]>=o*1.05){g.lp+=1;cash(day());card('NEW RECORD',nm[k]+': '+fm(cur[k]),'+1 Legacy Point and a bonus.')}}})}
 function settle(){const g=eg(),c=g.ch;if(!c||S.day<=c.day)return;const st=+last().st||0;g.ch=null;const R=RIV[c.i];
  if(st>=c.target){g.wins++;const lp=Math.round(R[2]*(1+.2*g.tier)),cs=Math.round(day()*R[3]*(1+.2*g.tier));g.lp+=lp;cash(cs);g.rv=Math.max(g.rv,c.i+1);if(g.rv>=RIV.length)g.cy=Math.max(g.cy,Math.floor(g.wins/RIV.length));
   card('CHART WAR WON','You beat '+R[0]+'!','Your '+fm(st)+' streams beat '+fm(c.target)+'. +'+lp+' LP, +$'+fm(cs)+'.')}
  else card('CHART WAR LOST',R[0]+' held the chart','You had '+fm(st)+' streams, they needed '+fm(c.target)+'. Release a song or a collab and try again.')}
 const rv=()=>{const g=eg(),i=g.rv%RIV.length,c=Math.floor(g.rv/RIV.length);return{req:RQ[i]*Math.pow(1.25,c),i,mult:RIV[i][1]*(1+.1*c),name:RIV[i][0]+(c?' (era '+(c+1)+')':'')}};
 function wake(){const g=eg();if(!live())return;safe(()=>{ladder();settle();if(g.leg){const n=income();if(n>0){cash(n);g.inc=(g.inc||0)+n}}records();bar()},'wake')}
 {const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);wake();return r}}

 /* UI */
 let bel=null,btn=null,pop=null;const css='font:11px Silkscreen,ui-monospace,monospace;color:#e8fff0;';
 function bar(){const g=eg(),show=live()&&typeof mode!='undefined'&&(mode=='play'||mode=='drive')&&L()>=1e6&&g.ms<LAD.length+1&&!g.leg;
  if(!show){if(bel)bel.style.display='none'}else{
   if(!bel){bel=document.createElement('div');bel.style.cssText='position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:30;pointer-events:none;width:min(300px,70vw);'+css+'text-shadow:1px 1px #000;text-align:center';
    bel.innerHTML='<div class="t"></div><div style="height:10px;border:2px solid #000;background:#0b0f0dcc;margin-top:2px"><i style="display:block;height:100%;width:0;background:#ffd27a;transition:width .6s"></i></div>';document.body.appendChild(bel)}
   const nx=LAD[g.ms]||GOAL,pv=g.ms?LAD[g.ms-1]:1e6,f=Math.max(0,Math.min(1,Math.log(L()/pv)/Math.log(nx/pv)));
   bel.style.display='';bel.querySelector('i').style.width=Math.round(f*100)+'%';bel.querySelector('.t').textContent='Road to 4B: '+fm(L())+' / '+fm(nx)+(f>=.8?' - so close!':'')}
  const sb=live()&&typeof mode!='undefined'&&(mode=='play'||mode=='drive')&&L()>=1e6;
  if(!btn){btn=document.createElement('button');btn.style.cssText='position:fixed;left:10px;bottom:10px;z-index:30;padding:5px 9px;background:#16241c;border:2px solid #ffd27a;cursor:pointer;'+css;btn.onclick=open;document.body.appendChild(btn)}
  btn.style.display=sb?'':'none';btn.textContent=eg().leg?'★ LEGACY '+eg().lp+' LP':'☆ LEGACY'}
 const B=(id,txt,ok)=>'<button data-a="'+id+'" '+(ok?'':'disabled ')+'style="'+css+'padding:3px 8px;margin-left:6px;background:'+(ok?'#2fe68a':'#333')+';color:'+(ok?'#04210f':'#888')+';border:2px solid #000;cursor:'+(ok?'pointer':'default')+'">'+txt+'</button>';
 const row=(a,b)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #ffffff22"><span>'+a+'</span><span style="white-space:nowrap">'+b+'</span></div>';
 const H=t=>'<h3 style="margin:14px 0 4px;color:#ffd27a;font-size:12px">'+t+'</h3>';
 function html(){const g=eg(),d=day(),$=n=>'$'+fm(n);let h='<div style="display:flex;justify-content:space-between"><b style="font-size:14px">'+(title()||'Road to 4B')+'</b><span>'+g.lp+' LP · Tier '+g.tier+'</span></div>';
  h+='<div style="margin:4px 0">Monthly listeners: '+fm(L())+' / '+fm(GOAL)+'</div>';
  if(!g.leg)return h+'<p>Reach <b>4 billion</b> monthly listeners to become a Legend. Then Chart Wars, empire projects, world records, relics and endless Ascensions unlock here. Every milestone on the way pays a bonus.</p>';
  const c=g.ch,r=rv();
  h+=H('CHART WARS')+(c?row('Challenge live vs '+RIV[c.i][0],'Beat '+fm(c.target)+' streams tomorrow'):row('Next rival: '+r.name,L()<r.req?'Needs '+fm(r.req)+' listeners':'Entry '+$(d*2)+B('ch','Challenge',(+S.money||0)>=d*2&&(S.songs||[]).length>0)))+'<small>Wins: '+g.wins+'. Your streams on the next day must beat the rival target. New songs and collabs help.</small>';
  h+=H('EMPIRE PROJECTS')+'<small>Daily income $'+fm(income())+' (+25% per tier)</small>';
  PRJ.forEach((p,i)=>{const cost=Math.round(d*p[1]);h+=row(p[0]+' <small>+'+p[2]+' LP</small>',g.pj[i]?'Owned · $'+fm(g.pj[i]*.005*(1+.25*g.tier))+'/day':$(cost)+B('pj'+i,'Build',(+S.money||0)>=cost))});
  const R=g.rec;h+=H('WORLD RECORDS')+row('Best streaming day',fm(R.st||0))+row('Peak listeners',fm(R.ml||0))+row('Richest day',$(R.e||0))+'<small>Beat a record by 5% for +1 LP and a bonus.</small>';
  h+=H('RELICS ('+Object.keys(g.rel).length+'/'+REL.length+')');REL.forEach((p,i)=>{h+=row(g.rel[i]?'★ '+p[0]:'? '+p[0],g.rel[i]?'Collected':p[1]+' LP'+B('rl'+i,'Get',g.lp>=p[1]))});
  const ac=8*(g.tier+1);h+=H('ASCEND')+row('Raise Legacy Tier to '+(g.tier+1)+' <small>more income, bigger rival rewards</small>',ac+' LP'+B('asc','Ascend',g.lp>=ac));return h}
 function open(){if(pop){pop.remove();pop=null;return}pop=document.createElement('div');pop.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;width:min(520px,94vw);max-height:84vh;overflow:auto;padding:12px 14px;background:#0f1a14;border:3px solid #ffd27a;'+css;
  const draw=()=>{pop.innerHTML='<div style="text-align:right"><button data-a="x" style="'+css+'background:#333;border:2px solid #000;cursor:pointer">X</button></div>'+html()};draw();
  pop.onclick=e=>safe(()=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;const g=eg(),d=day();
   if(a=='x'){open();return}
   if(a=='ch'&&!g.ch){const r=rv();if((+S.money||0)<d*2||L()<r.req)return;cash(-d*2);const h=(S.hist||[]).slice(-7),b=h.reduce((s,x)=>s+(+x.st||0),0)/Math.max(1,h.length);g.ch={i:r.i,day:S.day,target:Math.round(b*r.mult)}}
   else if(a.slice(0,2)=='pj'){const i=+a.slice(2),cost=Math.round(d*PRJ[i][1]);if(!g.pj[i]&&L()>=PRJ[i][3]&&(+S.money||0)>=cost){cash(-cost);g.pj[i]=cost;g.lp+=PRJ[i][2];card('PROJECT BUILT',PRJ[i][0],'+'+PRJ[i][2]+' LP and daily income.')}}
   else if(a.slice(0,2)=='rl'){const i=+a.slice(2);if(!g.rel[i]&&g.lp>=REL[i][1]){g.lp-=REL[i][1];g.rel[i]=1;card('RELIC',REL[i][0],REL.every((_,j)=>g.rel[j])?'Full set! You are Immortal.':'Added to your collection.')}}
   else if(a=='asc'){const ac=8*(g.tier+1);if(g.lp>=ac){g.lp-=ac;g.tier++;card('ASCENDED','Legacy Tier '+g.tier,'Income and rival rewards boosted.')}}
   draw();bar()},'click')};
 setInterval(()=>safe(()=>{if(!live())return;ladder();bar()},'tick'),2000);
 window.FW_ENDGAME={eg,day,title}; /* handy for the dev panel / testing */
})();
