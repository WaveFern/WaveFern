/* Money guard (v55.18.1, v55.19.0): waking up must never lower your cash, and cash can never turn into "not a number".
   v55.18.1: if anything in the morning chain leaves you with less than you went to bed with, cash is put back to
   (cash before sleeping) + (the "Earned" figure the summary showed).
   v55.19.0: the root of the "$0 after sleep" reports. Two places zero cash that is not a finite number: the new-day code in
   29-v26.js (`if(!isFinite(S.money))S.money=0`) and the save check scCheck (12-save-seal.js). So one bad write during the day
   (money + undefined = NaN) shows as $0 in the HUD and is saved as $0 at the next sleep. Now S.money is an accessor:
   - a write that is not a finite number is refused (the last good value stays) and logged with its call stack;
   - a numeric string is stored as a number (so a later S.money+x never concatenates);
   - while the wake summary is up (mode 'sleep') a write that would drop a positive balance to $0 or less is refused;
   - every refused write and every fall to $0 or less is kept in FW_MONEY.log and localStorage fw_mlog (last 20) for debugging.
   The accessor is enumerable, so saves (JSON) are unchanged; it is configurable, so resetState() can delete it, and arm() puts
   it back within a second (and at every wake). The wake guard is applied again on window load so it is the OUTERMOST wakeUp
   wrapper (some wrappers in later files, e.g. 223, 231, dev-pets, dev-island-places, used to sit outside it). */
(function(){
const LOG=[];let good=null,WTR=null; /* WTR: every money write during a wake (v55.20.1) */
const stk=()=>{try{return(new Error().stack||'').split('\n').slice(4,10).map(s=>s.trim().replace(/^at /,'')).join(' < ')}catch(e){return''}};
function note(kind,from,to){
 const e={k:kind,from,to:String(to),day:(S&&S.day)||0,mode:typeof mode!='undefined'?mode:'',t:Date.now(),v:typeof GAME_VERSION!='undefined'?GAME_VERSION:'',s:stk()};
 LOG.push(e);if(LOG.length>20)LOG.shift();console.warn('money guard: '+kind,from,'->',to,e.s);
 try{localStorage.setItem('fw_mlog',JSON.stringify(LOG))}catch(x){}}
function arm(){try{
 if(typeof S!='object'||!S)return;const d=Object.getOwnPropertyDescriptor(S,'money');if(d&&d.get&&d.get._fw)return;
 let v=d?d.value:0;if(typeof v=='string'&&v.trim()!==''&&isFinite(+v))v=+v;
 if(typeof v!='number'||!isFinite(v)){note('bad value found',null,v);v=0}
 const get=function(){return v};get._fw=1;
 Object.defineProperty(S,'money',{configurable:true,enumerable:true,get,set(n){
  let x=n;if(typeof x=='string'&&x.trim()!==''&&isFinite(+x))x=+x;
  if(typeof x!='number'||!isFinite(x)){note('refused '+(typeof n=='number'?String(n):typeof n),v,n);return}
  if(v>.5&&x<=0&&!S.cheat){if(typeof mode!='undefined'&&mode=='sleep'){note('refused fall on wake',v,x);return}note('fell to '+x,v,x)}
  if(WTR&&x!==v){WTR.push({from:v,to:x,s:stk()});if(WTR.length>60)WTR.shift()}
  v=x;good=x}});
 good=v}catch(e){console.error('money guard arm',e)}}
try{const old=JSON.parse(localStorage.getItem('fw_mlog')||'[]');if(Array.isArray(old))old.slice(-20).forEach(e=>LOG.push(e))}catch(e){}
arm();setInterval(arm,1000);
window.FW_MONEY={get log(){return LOG.slice()},arm,get good(){return good}};
function guard(){
 if(typeof wakeUp!='function'||wakeUp._mg)return;
 const w0=wakeUp;
 wakeUp=function(){
  arm();WTR=[];let m0=null;try{m0=+S.money}catch(e){}
  const r=w0.apply(this,arguments);
  try{if(m0!==null&&isFinite(m0)&&!S.cheat){const h=(S.hist||[])[S.hist.length-1],e=h&&h.d===S.day-1?Math.max(0,+h.e||0):0,ok=+S.money;
   if(!isFinite(ok)||ok<m0-.005){const fix=+(m0+(isFinite(e)?e:0)).toFixed(2);note('cash fell on wake, restored to '+fix,m0,ok);
    try{const dn=WTR.filter(w=>w.to<w.from);console.error('WAKE MONEY BUG: cash fell from '+m0+' to '+ok+' (restored to '+fix+', summary Earned '+e+', day '+S.day+', mode '+mode+'). Writes that lowered it, newest last:',dn.length?dn:'none seen (a write bypassed the guard)');dn.forEach(w=>console.error('  '+w.from+' -> '+w.to+' from '+w.s))}catch(x){}
    S.money=fix}}}catch(x){console.error('money guard',x)}
  WTR=null;return r};
 wakeUp._mg=1}
guard();addEventListener('load',guard);
})();
