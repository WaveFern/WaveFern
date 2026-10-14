/* ===== v26.113: Label HQ is coming soon: shown in the App Barn but not installable, and taken off every account/save ===== */
APPD.hq.soon=1;APPD.hq.d='Sign with labels.';
function hqSoonClean(){try{if(S.apps)delete S.apps.hq;if(app=='hq')app=null}catch(e){}}
{const sp=PA.store;PA.store=function(){let h=sp.apply(this,arguments);const a=APPD.hq,k='hq';
 const re=new RegExp('(<b style="font-size:16px;color:var\\(--t\\)">'+a.n+'</b>[\\s\\S]*?)<button[^>]*>[^<]*</button>');
 return h.replace(re,'$1<button disabled style="opacity:.7">Coming soon</button>')}}
{const i0=inst;inst=function(k){if(k=='hq'){snd('err');return say('Label HQ is coming soon.')}return i0.apply(this,arguments)}}
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);hqSoonClean();return r}}
{const lg=lbLegacy;lbLegacy=function(){const r=lg.apply(this,arguments);hqSoonClean();return r}}
{const u0=update;update=function(dt){u0(dt);if(S.apps&&S.apps.hq)hqSoonClean()}}
hqSoonClean();
