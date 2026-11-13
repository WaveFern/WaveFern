/* ===== v26.113: record labels are coming soon. v50.9.0: Label HQ itself is open again (free) for brand deals and photoshoots (223/224); only the label team upgrades and label messages stay off ===== */
APPD.hq.d='Brand sponsorships and photoshoots, plus team upgrades once you sign with a record label.';
/* labels off: label messages (offers, welcome, login) and their contact threads move out of the Messages inbox into S.lbStash; switching LABELS_ENABLED back on puts them back. S.label and the rest of the save are left alone */
function lbMsgClean(){try{if(!Array.isArray(S.msgs))return;const names=LABELS.map(l=>l.n),isL=m=>m&&(m.lo||names.indexOf(m.from)>=0);
 if(LABELS_ENABLED){if(Array.isArray(S.lbStash)&&S.lbStash.length){S.msgs=S.msgs.concat(S.lbStash);S.lbStash=[];if(typeof pcR=='function')try{pcR()}catch(e){}}return}
 const out=S.msgs.filter(isL);if(!out.length)return;S.lbStash=(S.lbStash||[]).concat(out);S.msgs=S.msgs.filter(m=>!isL(m));
 if(out.some(m=>m.id===S.chat))S.chat=null;if(typeof pcR=='function')try{pcR()}catch(e){}}catch(e){}}
function hqSoonClean(){lbMsgClean()}
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);hqSoonClean();return r}}
{const lg=lbLegacy;lbLegacy=function(){const r=lg.apply(this,arguments);hqSoonClean();return r}}
{const u0=update;update=function(dt){u0(dt);if(S.lbStash||!LABELS_ENABLED)lbMsgClean()}}
hqSoonClean();
