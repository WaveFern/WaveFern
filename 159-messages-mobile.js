/* ===== v44.7.0: Messages on the computer, laid out like the Gphone one when a phone is held upright =====
   On a phone or tablet held upright the computer's Messages app shows one column at a time: the chat list, or the open chat
   with a back button and the message bar at the bottom. Desktop and landscape are unchanged. PCMV is not saved. Wrapped in an IIFE. */
(function(){
window.PCMV='list';
const st=document.createElement('style');st.textContent=`
.chat .cvh .mcbk{display:none}
@media (orientation:portrait) and (max-width:760px){
body.pcsmall .win:has(.chat) .mn{padding:0!important;overflow:hidden!important;position:relative}
body.pcsmall .win .chat{position:absolute;inset:0;font-size:13px;display:flex}
body.pcsmall .win .chat .cl{width:auto!important;flex:1 1 auto;min-width:0;box-shadow:none}
body.pcsmall .win .chat.gpl .cv{display:none}body.pcsmall .win .chat.gpc .cl{display:none}body.pcsmall .win .chat .cv{flex:1;min-width:0}
body.pcsmall .win .chat .crs{overflow-x:hidden}body.pcsmall .win .chat .cr{min-width:0}body.pcsmall .win .chat .cr .t{min-width:0;flex:1}
body.pcsmall .win .chat .cr .t b,body.pcsmall .win .chat .cr .t small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
body.pcsmall .win .chat .cvh{gap:8px;flex-wrap:wrap}
body.pcsmall .win .chat .cvh .mcbk{display:block;flex:none;width:36px;height:36px;padding:0;border-radius:50%;border:0;background:#f7eefb;color:#2a2140;box-shadow:none;font-size:13px}
body.pcsmall .win .chat .cvh>div:not(.cva){flex:1;min-width:0}body.pcsmall .win .chat .cva{flex-wrap:wrap}
body.pcsmall .win .chat .cin input{min-width:0}
}
`;document.head.appendChild(st);
{const o0=openChat;openChat=function(){if(mode=='pc')PCMV='chat';return o0.apply(this,arguments)}}
{const r0=pcR;pcR=function(){if(typeof app!='undefined'&&app!='msg')PCMV='list';return r0.apply(this,arguments)}}
{const pm=PA.msg;PA.msg=function(){const h=pm.apply(this,arguments);if(typeof h!='string'||mode!='pc')return h;
 const list=PCMV!='chat'||!!ncv;
 return h.replace(/<div class="?chat( msx)?"?>/,(m,x)=>`<div class="chat${x||''} ${list?'gpl':'gpc'}">`)
  .replace(/<div class=cvh>/,'<div class=cvh><button class=mcbk title="Chats" onclick="PCMV=\'list\';pcR()">◀</button>')}}
})();
