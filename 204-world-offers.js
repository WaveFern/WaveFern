/* ===== v49.65.0: rare worldwide concert offers =====
   Once you are famous, promoters and venues from real cities around the world write to you (Messages, plus a WaveFern alert):
   - who: Fame Level 120 or more. A city's club can ask once you reach the club's fame, its stadium once you reach the stadium's.
   - how rare: each morning a 1.3% chance (about one offer every 2 to 3 months), never within 45 days of the last one, never
     two at once. One in four offers is a stadium (when you are famous enough), the rest are clubs and halls.
   - pay: a multiple of your last 30 days of streaming income. Clubs pay 5 to 8 times a month, stadiums 9 to 15 times,
     rounded, with a floor ($5,000 club, $20,000 stadium) so an early fame level still gets a real fee.
   - time: the offer stands for 3 days. Accept and the show is booked 4 to 8 days ahead; the promoter pays flights and hotel.
     On show day you fly out, play and fly back (a long flight means more jet lag): the fee lands in your account, you gain
     followers, and your energy drops to 40 or less. Decline and nothing happens (they may write again, much later).
   State: S.cgo = {last:day, list:[{id,d:destId,k:'club'|'venue',pay,exp,day,st:0 offer|1 booked|2 declined|3 done|4 expired}]}. */
(function(){
const MIN_FAME=120,CHANCE=.013,COOL=45,EXPIRE=3,STAD=.25;
const fm=n=>'$'+Math.round(n).toLocaleString('en-US');
const fl=()=>{try{return fameLevel()||0}catch(e){return 0}};
function st(){if(!S.cgo||typeof S.cgo!='object')S.cgo={last:-999,list:[]};if(!Array.isArray(S.cgo.list))S.cgo.list=[];return S.cgo}
/* streaming income over the last 30 days */
function monthly(){const h=Array.isArray(S.hist)?S.hist:[];let t=0;for(let i=h.length-1;i>=0&&h[i].d>S.day-31;i--)t+=+h[i].e||0;return t}
const FROMS=['Live Nation','Booking Office','Promotions','Events Team'];
function pickOffer(){const L=fl();if(typeof WT_DEST=='undefined'||!Array.isArray(WT_DEST))return null;
 const c=[];WT_DEST.forEach(d=>{if(d.club&&d.club.fame<=L)c.push([d,'club']);if(d.venue&&d.venue.fame<=L)c.push([d,'venue'])});
 if(!c.length)return null;const v=c.filter(x=>x[1]=='venue'),b=c.filter(x=>x[1]=='club'),pool=(v.length&&(!b.length||Math.random()<STAD))?v:(b.length?b:v);
 return pool[Math.floor(Math.random()*pool.length)]}
function feeFor(k){const m=Math.max(monthly(),1),r=k=='venue'?9+Math.random()*6:5+Math.random()*3,floor=k=='venue'?20000:5000;
 return Math.max(floor,Math.round(m*r/100)*100)}
function mk(){const s=st(),p=pickOffer();if(!p)return;const d=p[0],k=p[1],v=d[k],pay=feeFor(k),place=(typeof wtPlace=='function'?wtPlace(d):d.country);
 const o={id:S.nid++,d:d.id,k,pay,exp:S.day+EXPIRE,day:0,st:0};s.list.push(o);s.last=S.day;if(s.list.length>12)s.list=s.list.slice(-12);
 const days=Math.max(1,Math.ceil(2*(d.hrs||8)/24));
 S.msgs.push({id:S.nid++,from:v.n+' '+FROMS[Math.floor(Math.random()*FROMS.length)],state:9,unread:1,day:S.day,cg:o.id,
  body:'Hello '+(S.artist||'there')+'. We run '+v.n+' in '+place+' (capacity '+v.cap.toLocaleString()+'). We would like you to headline a show with us. Fee: '+fm(pay)+', paid in full when you come off stage. We cover your flights and hotel ('+(d.hrs||8)+' hours in the air each way, about '+days+' day'+(days==1?'':'s')+' away in all). The date would be 4 to 8 days from now. This offer stands until Day '+o.exp+'.'});
 try{snd('ping');say(v.n+' ('+place+') offered you a '+fm(pay)+' show. Check Messages.')}catch(e){}
 try{updateVersion()}catch(e){}}
const find=id=>st().list.find(o=>o.id===id);
window.cgAccept=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.cg);if(!o||o.st!=0)return;if(S.day>o.exp){o.st=4;return pcR()}
 if(st().list.some(x=>x.st==1)){snd('err');return say('You already have a booked show. Finish it first.')}
 o.st=1;o.day=S.day+4+Math.floor(Math.random()*5);const d=wtDest(o.d),v=d[o.k];
 S.msgs.push({id:S.nid++,from:m.from,state:9,unread:1,day:S.day,body:'Confirmed. Your show at '+v.n+' is on Day '+o.day+'. A car takes you to the airport that morning and we fly you back after the show. See you there.'});
 snd('chime');say('Show booked: '+v.n+' on Day '+o.day+'.');try{updateVersion()}catch(e){}pcR()};
window.cgDecline=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.cg);if(!o||o.st!=0)return;o.st=2;snd('pop');pcR()};
/* the show happens overnight on its day: fee, followers, jet lag */
function daily(){const s=st();
 s.list.forEach(o=>{if(o.st==0&&S.day>o.exp)o.st=4;
  if(o.st==1&&S.day>=o.day){o.st=3;const d=wtDest(o.d);if(!d)return;const v=d[o.k],place=wtPlace(d),fol=Math.round(v.cap*(o.k=='venue'?.02:.05)*(.8+Math.random()*.4));
   S.money=+(S.money+o.pay).toFixed(2);S.earn=(S.earn||0)+o.pay;S.followers=(S.followers||0)+FOLN(fol);S.energy=Math.min(S.energy,40);
   S.msgs.push({id:S.nid++,from:v.n,state:9,unread:1,day:S.day,body:'What a night. '+Math.round(v.cap*(.9+Math.random()*.1)).toLocaleString()+' people at '+v.n+' in '+place+'. Your fee of '+fm(o.pay)+' has been paid. You flew home and are very tired.'});
   try{snd('cash');say('You played '+v.n+' in '+place+' and earned '+fm(o.pay)+'. You are tired from the trip.')}catch(e){}}});
 if(!(S.artist&&fl()>=MIN_FAME&&S.songs&&S.songs.length))return;
 if(s.list.some(o=>o.st==0||o.st==1)||S.day-s.last<COOL||Math.random()>CHANCE)return;mk()}
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{daily()}catch(e){console.error('world offers',e)}return r}}
/* Accept / Decline buttons in Messages */
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);const m=S.msgs.find(x=>x.id==S.chat);
 if(m&&m.cg!=null){const o=find(m.cg);
  if(o&&o.st==0&&S.day<=o.exp)h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="cgAccept(${m.id})">Accept ${fm(o.pay)} show</button><button onclick="cgDecline(${m.id})">Decline</button></div>`);
  else if(o)h=h.replace(/Official account\. No replies\./,o.st==2?'You declined this offer.':o.st==1||o.st==3?'You accepted this offer.':'This offer has expired.')}
 return h}}
})();
