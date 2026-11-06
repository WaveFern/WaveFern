/* WaveFern dev: you can also diss artists who blocked you. Only loaded on /dev/.
   The diss track picker only offered the three fictional rivals of the day. Artists who blocked you in Messages are now
   listed under them (Blocked you), and picking one works exactly like picking a rival: the diss song, the news, the
   Instagrime drama and their response track all use the name. Add ?nodissblocked to the address to turn it off. */
(function(){
 if(!window.FW_FEAT||/[?&]nodissblocked/.test(location.search))return;
 if(typeof recMenu!='function')return;
 const esc1=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 function blockedList(){
  const out=[],seen={};
  try{(S.msgs||[]).forEach(m=>{if(!m||!m.blocked||m.a===undefined||!ART[m.a])return;const n=ART[m.a][0];if(seen[n])return;seen[n]=1;out.push({n:n,l:Number(ART[m.a][2])})})}catch(e){}
  return out;
 }
 function add(){
  if(typeof DON=='undefined'||!DON)return;
  const first=document.querySelector('#ui .gen button[onclick^="DT="]');
  if(!first||document.querySelector('#ui .dissblk'))return;
  const list=blockedList();if(!list.length)return;
  const grid=first.parentNode;
  const h='<div class="m dissblk" style="margin-top:8px">Or pick someone who blocked you:</div><div class="gen dissblk">'+list.map(r=>{
   const q=r.n.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
   return '<button class="'+(DT==r.n?'go':'')+'" onclick="DT=\''+esc1(q)+'\';recMenu()">'+esc1(r.n)+'<br><small>Blocked you'+(r.l>1000?' · ~'+Math.round(r.l).toLocaleString()+' listeners':'')+'</small></button>'}).join('')+'</div>';
  grid.insertAdjacentHTML('afterend',h);
 }
 const r0=recMenu;
 recMenu=function(){const r=r0.apply(this,arguments);try{add()}catch(e){console.error('diss blocked',e)}return r};
})();
