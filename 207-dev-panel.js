/* ---------- developer preview panel (v49.71.0) ----------
   Only exists when the game was opened through wavefern.com/dev (00-dev.js set FW_DEV). Nothing here runs for players. */
(function(){
if(!window.FW_DEV)return;
const CUT=RS.CUT,pad=n=>String(n).padStart(2,'0'),fmt=t=>{const d=new Date(t);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+' UTC'};
const css=document.createElement('style');css.textContent=`#devp{position:fixed;right:8px;bottom:8px;z-index:100001;font:12px/1.4 system-ui,sans-serif;color:#e9f5ee}
#devp>button.t{font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;background:#0b0f0d;color:#2fe68a;border:2px solid #2fe68a66;padding:6px 10px;cursor:pointer}
#devp .b{display:none;width:min(300px,86vw);max-height:78vh;overflow:auto;background:#0b0f0d;border:2px solid #26302a;padding:10px;margin-bottom:6px;box-shadow:6px 6px 0 #0009}
#devp.o .b{display:block}#devp h4{font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#2fe68a;margin:10px 0 4px;text-transform:uppercase}#devp h4:first-child{margin-top:0}
#devp button.a{display:block;width:100%;text-align:left;background:#14201a;color:#e9f5ee;border:1px solid #26302a;padding:6px 8px;margin:3px 0;cursor:pointer;font:12px system-ui,sans-serif}#devp button.a:hover{border-color:#2fe68a}
#devp pre{margin:0;white-space:pre-wrap;color:#9bb0a4;font:11px ui-monospace,monospace}`;
document.head.appendChild(css);
const el=document.createElement('div');el.id='devp';document.body.appendChild(el);
const old=(day,name,money)=>{const d=JSON.parse(S0);d.artist=name;d.day=day;d.money=money;d.followers=day*30000;d.listeners=day*20000;d.streams=day*900000;d.earn=money*3;
 d.songs=day>=2?[{id:1,title:'Old Song',g:GEN[0],q:20,day:1,streams:5e6,today:0}]:[];
 return 'FW3-'+scPack(JSON.stringify({S:d,ch,PL:[],VOL,FX}),SC_C,38)};
const put=(k,v)=>localStorage.setItem(k,v);
const act={
 clock:t=>{FW_CLOCK.set(t);location.reload()},
 live:()=>{const n=rsRun();say(n?'Moved '+n+' career(s) to Legacy':'Nothing to move');if(n){wiping=true;location.reload()}else draw()},
 old41:()=>{put('fw_save_1',old(41,'Test Artist',48250));put('fw_slot','1');location.reload()},
 old1:()=>{put('fw_save_1',old(1,'Day One Artist',100));put('fw_slot','1');location.reload()},
 bad:()=>{put('fw_save_1','FW3-'+'x'.repeat(1500));put('fw_slot','1');location.reload()},
 junk:()=>{put('fw_save_1','not a save');put('fw_slot','1');location.reload()},
 two:()=>{put('fw_save_1',old(41,'Test Artist',48250));put('fw_save_2',old(12,'Second Artist',3100));put('fw_slot','1');location.reload()},
 ann:()=>{localStorage.removeItem('fw_ann_seen');location.reload()},
 grant:()=>{if(!S.rv){S.rv=RS.V}S.fdr=S.fdr||{v:1,a:'Test Artist',d:41,g:{}};founderSync();say('Founder granted to this career');draw()},
 strip:()=>{delete S.fdr;founderSync();say('Founder removed from this career');draw()},
 save:()=>{autoSave();say('Saved to the sandbox');draw()},
 wipe:()=>{localStorage.clear();FW_CLOCK.set(null);location.reload()}
};
window.devAct=k=>act[k]();
function draw(){const open=el.classList.contains('o');
 const now=FW_CLOCK.now(),post=now>=CUT,lg=rsGet().e;
 let st=''+(typeof S=='object'&&S?'career: '+(S.artist||'(none)')+' · day '+S.day+' · rv '+(S.rv||0)+' · founder '+(S.fdr?'yes':'no'):'no career');
 el.innerHTML=`<div class=b><h4>Clock</h4><pre>${fmt(now)}\n${post?'AFTER the cutover':'BEFORE the cutover'} (${fmt(CUT)})</pre>
<button class=a onclick="devAct('clock')">Real time</button>
<button class=a onclick="FW_CLOCK.set(${CUT-864e5/2});location.reload()">12 hours before</button>
<button class=a onclick="FW_CLOCK.set(${CUT-45e3});location.reload()">45 seconds before (watch it happen)</button>
<button class=a onclick="FW_CLOCK.set(${CUT+36e5});location.reload()">1 hour after</button>
<h4>Make a test career</h4><button class=a onclick="devAct('old41')">Old career: Day 41, $48,250</button><button class=a onclick="devAct('two')">Two old careers</button><button class=a onclick="devAct('old1')">Old career: Day 1 (no Founder)</button><button class=a onclick="devAct('bad')">Corrupted save</button><button class=a onclick="devAct('junk')">Junk in the slot</button>
<h4>Fresh start</h4><button class=a onclick="devAct('live')">Run the reset pass now</button><button class=a onclick="devAct('ann')">Show the notice again</button>
<h4>Founder</h4><button class=a onclick="devAct('grant')">Make this career a Founder</button><button class=a onclick="devAct('strip')">Remove Founder from this career</button><button class=a onclick="devAct('save')">Save now</button>
<h4>State</h4><pre>${st}\nLegacy careers: ${lg.length}${lg.map(e=>'\n- '+(e.artist||'unreadable')+' day '+e.day+(e.fd?' founder':'')+(e.used?' (adopted)':'')).join('')}</pre>
<h4>Sandbox</h4><button class=a onclick="if(confirm('Delete everything in the dev sandbox?'))devAct('wipe')">Wipe the sandbox</button></div><button class=t onclick="this.parentNode.classList.toggle('o');devAct2()">DEV</button>`;
 if(open)el.classList.add('o')}
window.devAct2=()=>draw();
act.clock=()=>{FW_CLOCK.set(null);location.reload()};
draw();setInterval(()=>{if(el.classList.contains('o'))draw()},5000);
})();
