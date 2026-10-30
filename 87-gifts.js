/* ---------- v26.88: gifts for signed-in players ----------
   v26.88: one-time gifts written into GIFTS below (kept so already-sent ones still arrive).
   v26.90: gifts sent from the admin panel live in Firestore at gifts/{id} = {to, from, msg, money, streams, listeners, t, claimed}.
   Only the admin account can create them (docs/firestore.rules); a player can only read their own and flip claimed to true.
   A gift is claimed the first time that player is playing with their cloud save loaded; its id goes into S.gifts and the
   save is pushed to the cloud straight away, so it is never given twice on any device. */
const GIFTS=[
 {id:'rowan-1000',uid:'vzad8zsSp6b1D1lxsM3UCmwc6cT2',money:1000,from:'Rowan'}
];
const GFT={busy:0,next:0};
const gNum=v=>Math.max(0,Math.min(1e12,Math.floor(+v||0)));
function giftApply(g){const m=gNum(g.money),st=gNum(g.streams),ls=gNum(g.listeners);
 if(m)S.money=+(S.money+m).toFixed(2);
 if(st||ls){try{if(typeof mlInit=='function')mlInit()}catch(e){}}
 if(st){S.streams=(S.streams||0)+st;S.monthStreams=(S.monthStreams||0)+st}
 if(ls){S.monthStreams=(S.monthStreams||0)+ls*(S.mlDiv||3);S.listeners=(S.listeners||0)+ls}
 const p=[];if(m)p.push('<b>$'+m.toLocaleString()+'</b>');if(st)p.push('<b>+'+st.toLocaleString()+'</b> streams');if(ls)p.push('<b>+'+ls.toLocaleString()+'</b> monthly listeners');
 return`<div style="margin:8px 0"><h3>A gift from ${esc(g.from||'WaveFern')}!</h3>${g.msg?`<p>“${esc(g.msg)}”</p>`:''}<p>${p.join(' · ')||'A little something'}</p></div>`}
function giftShow(html){mode='menu';snd('chime');$('ui').innerHTML=`<div id=gift class="box modal" style="width:min(400px,92vw);text-align:center;max-height:80vh;overflow:auto">${html}<button class=go onclick="closeUI()">Thanks!</button></div>`}
function giftCheck(){if(typeof FBU=='undefined'||typeof CLD=='undefined'||!FBU||!CLD.ok||mode!='play'||PAUSED||GFT.busy)return;S.gifts=S.gifts||[];const uid=FBU.uid;
 const g=GIFTS.find(x=>x.uid==uid&&!S.gifts.includes(x.id));
 if(g){S.gifts.push(g.id);const h=giftApply(g);autoSave();csPush(1);return giftShow(h)}
 if(Date.now()<GFT.next||!FBF)return;GFT.next=Date.now()+30000;GFT.busy=1;
 FBF.getDocs(FBF.query(FBF.collection(FBD,'gifts'),FBF.where('to','==',uid),FBF.where('claimed','==',false))).then(r=>{
  if(!FBU||FBU.uid!=uid)return;const got=r.docs.filter(d=>!S.gifts.includes('fs:'+d.id));
  r.docs.forEach(d=>{if(S.gifts.includes('fs:'+d.id))FBF.updateDoc(d.ref,{claimed:true}).catch(()=>{})});
  if(!got.length)return;if(mode!='play'||PAUSED){GFT.next=0;return}
  const h=got.map(d=>{S.gifts.push('fs:'+d.id);return giftApply(d.data())}).join('');autoSave();
  csPush(1).then(()=>got.forEach(d=>FBF.updateDoc(d.ref,{claimed:true}).catch(()=>{})));giftShow(h)}).catch(()=>{}).finally(()=>{GFT.busy=0})}
setInterval(giftCheck,1500);
