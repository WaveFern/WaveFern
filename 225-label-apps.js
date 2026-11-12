/* ===== v51.0.2: every record label has its own app =====
   Signing with a label (101-economy-labels.js) adds that label's app to your computer: "<Label> HQ", with the old Label HQ
   team upgrades (82-label-hq.js: manager, producer, studio build-out, PR, marketing). No login is needed any more.
   Leaving the label deletes its app. None of these apps (or the brand-deals Label HQ, 223-brand-deals.js) show in the App Barn.
   Apps are S.apps['hq_'+labelId] (disc, flip, brick, north, merid, crown). The upgrade levels in S.hq belong to you and stay. */
(function(){
const COL={disc:['#e05252','#4a2a2a'],flip:['#ffb300','#3a3220'],brick:['#d2763f','#3a2a22'],north:['#5ac8fa','#223a4a'],merid:['#9c7bff','#2a2548'],crown:['#e6b422','#3a3466']};
const ROWS=['....GG....','...GGGG...','..NNNNNN..','..NWNNWN..','..NNNNNN..','..NWNNWN..','..NNNNNN..','..NWNNWN..','..NNDDNN..','KKKKDDKKKK'];
const key=id=>'hq_'+id;
function labelApp(id){const l=lbById(id);if(!S.label||S.label.id!=id||!l)return`<div class=hqx><div class=card style="max-width:380px"><b>You are not signed with ${l?esc(l.n):'this label'} any more.</b></div></div>`;
 HQAUTH=true;let h=BRD.teamPage?BRD.teamPage():'';
 return h.replace(/<button onclick="HQAUTH=false;pcR\(\)">Sign out<\/button> ?/,'').replace(/<h1><img src="[^"]*"([^>]*)> [^<]*<\/h1>/,(m,a)=>`<h1><img src="${IC[key(id)]}"${a}> ${esc(l.n)} HQ</h1>`)}
LABELS.forEach(l=>{const k=key(l.id),c=COL[l.id]||COL.north;
 APPD[k]={n:l.n+' HQ',p:0,d:'Your label\'s team and studio upgrades.',hide:1};
 IC[k]=mkIc(ROWS,{G:c[0],N:c[1],W:'#9ad0ff',D:c[0],K:'#1a1d2b'});
 if(typeof APPMOD!='undefined'&&APPMOD.hq)APPMOD[k]=APPMOD.hq;
 PA[k]=()=>labelApp(l.id)});
/* the app set always matches the label you are signed with */
function sync(){try{if(!S.apps)S.apps={};LABELS.forEach(l=>{const k=key(l.id),on=S.label&&S.label.id==l.id;if(on)S.apps[k]=1;else if(S.apps[k]){delete S.apps[k];if(app==k)app=0;try{OA=OA.filter(a=>a!=k)}catch(e){}}})}catch(e){}}
{const s0=lbSign;lbSign=function(mid){const had=S.label,hq=S.apps&&S.apps.hq;const say0=say;say=function(t){return say0.call(this,String(t).replace(' Login details are in Messages.',' Its app is on your computer.'))};let r;try{r=s0.apply(this,arguments)}finally{say=say0}
 try{if(!had&&S.label){const l=lbCur();if(!hq&&S.apps)delete S.apps.hq;sync();
  const w=S.msgs[S.msgs.length-1];if(w&&/Label HQ login/.test(w.body||''))w.body='Welcome to '+l.n+'! Your signing bonus of $'+l.adv.toLocaleString()+' has been paid. Your '+l.n+' HQ app is on your computer now: open it for your team and studio upgrades.';
  say(l.n+' HQ was added to your computer.');pcR()}}catch(e){console.error('label app',e)}return r}}
{const s0=lbLeave;lbLeave=function(){const had=S.label;const r=s0.apply(this,arguments);try{if(had&&!S.label){sync();say(lbById(had.id).n+' HQ was deleted from your computer.');pcR()}}catch(e){console.error('label app',e)}return r}}
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);sync();return r}}
{const st0=PA.store;PA.store=function(){return st0.apply(this,arguments).replace(/<div class=card data-pv="a:hq_[^"]*"[\s\S]*?<\/button><\/div>/g,'')}}
sync();
})();
