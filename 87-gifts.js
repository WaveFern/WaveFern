/* ---------- v26.88: gifts for signed-in players ----------
   One-time gifts for a Google account (Firebase UID from Authentication > Users). Claimed the first time that
   player is in the game with their cloud save loaded; the gift id goes into S.gifts and is saved to the cloud
   straight away, so it is never given twice on any device. Add a new line with a new id for each gift. */
const GIFTS=[
 {id:'rowan-1000',uid:'vzad8zsSp6b1D1lxsM3UCmwc6cT2',money:1000,from:'Rowan'}
];
function giftCheck(){if(!FBU||!CLD.ok||mode!='play'||PAUSED)return;S.gifts=S.gifts||[];
 const g=GIFTS.find(x=>x.uid==FBU.uid&&!S.gifts.includes(x.id));if(!g)return;
 S.gifts.push(g.id);S.money=+(S.money+g.money).toFixed(2);autoSave();csPush(1);
 mode='menu';snd('chime');$('ui').innerHTML=`<div id=gift class="box modal" style="width:min(380px,92vw);text-align:center"><h2>🎁 A gift from ${esc(g.from)}!</h2><p><b>$${g.money.toLocaleString()}</b> has been added to your money.</p><button class=go onclick="closeUI()">Thanks!</button></div>`}
setInterval(giftCheck,1500);
