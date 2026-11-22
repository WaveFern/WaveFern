/* ---------- v50.9.0: many more collab artists, fresher messages, and a steady flow of offers at every size ----------
   Problem: an artist who already has a thread never DMs you again as a new contact, and only 8 artists sat between 5k and 25k listeners,
   so around that size the pool ran dry and nobody wrote for a week or more.
   1. About 80 more fictional artists appended to the end of ART (saves refer to artists by index, so nothing moves). Most are between 1k and 100k
      listeners (about 30 between 5k and 25k); there are some from 100 to 1k and from 100k to 5M. Existing ids and saved chats are untouched.
   2. dmDaily (75-collab-fees-dms.js) is wrapped: a little more often 1 or 2 new messages, never more than 3 days without a new artist writing
      (S.dmLast = last day someone new wrote), a forced pick of someone near your size if the normal odds drew nobody, and room for 4 unread offers.
   3. More first-message, ask and check-in lines so the same artist text does not repeat as quickly. */
(function(){
const SK=['skin=0','skin=1','skin=2','skin=3','skin=4','skin=5','skin=6'],HR=[0,1,2,13,15,17,19],
 HC=['#0f0f10','#151517','#3a2416','#7a5a3a','#b5523b','#d9b36c','#e8a33a','#6a3fd1','#2b2b30','#9a7a4a'],
 TC=['#c0392b','#2e4a6a','#27ae60','#8e44ad','#d4af37','#111114','#e67e22','#74b9ff','#e84393','#2f2f38','#a3c4f3','#1e8449'],
 PC=['#111114','#2c3e50','#1e1e24','#3a3a40'],PS=['hype','goofy','chill','formal','shy'];
const POOL=[
/* 100 to 1,000 */
['Marlo Quinn','Folk',140],['Dizzy Pike','Hip-Hop',230],['Tess Abara','Pop',310],['Ollie Brandt','Lo-fi',420],['Kemi Dray','R&B',560],['Fin Delaney','Indie',680],['Jo Ramos','Latin',800],['Pixie Marsh','Electronic',950],
/* 1,000 to 5,000 */
['Bram Okafor','Hip-Hop',1300],['Lena Frost','Indie',1700],['Cass Mendez','Latin',2100],['Hollis Wade','Country',2500],['Ayla Verne','Pop',2900],['Rudy Tan','Rock',3400],['Mox Garrity','Electronic',3800],['Nell Sorensen','Folk',4200],['Dante Bliss','R&B',4600],['Kit Larkin','Lo-fi',4900],
/* 5,000 to 25,000 (the busy middle) */
['Sunny Okoro','Pop',5200],['Rex Holloway','Rock',5600],['Imani Cole','R&B',6000],['Dro Salinas','Latin',6400],['Piper Lang','Country',6800],['Zed Marlowe','Hip-Hop',7200],['Hana Whitlock','Indie',7600],['Cobra Jay','Hip-Hop',8100],
['Bea Fontaine','Folk',8600],['Tariq Neal','Electronic',9100],['June Calder','Lo-fi',9600],['Ravi Anand','Pop',10200],['Oksana Lind','Indie',10800],['Chase Bellamy','Country',11400],['Lux Ferreira','Latin',12000],['Moses Gray','R&B',12700],
['Tilda Brook','Folk',13400],['Vince Ocampo','Rock',14100],['Gigi Moreau','Pop',14800],['Slim Torrance','Hip-Hop',15600],['Ember Voss','Electronic',16400],['Calla Reyes','Latin',17200],['Hugo Pearce','Indie',18000],['Nadia Bloom','R&B',18900],
['Jett Rivera','Rock',19800],['Wyatt Cross','Country',20800],['Mina Okada','Lo-fi',21800],['Soren Vale','Electronic',22800],['Lani Kealoha','Pop',23800],['Big Dev','Hip-Hop',24500],
/* 25,000 to 100,000 */
['Priya Nair','Pop',28000],['Cole Hartman','Rock',33000],['Yara Haddad','R&B',38000],['Mateo Ruiz','Latin',44000],['Ash Penrose','Indie',51000],['Ty Sterling','Hip-Hop',58000],['Dolly Marsh','Country',66000],['Kaito Mori','Lo-fi',75000],['Esme Archer','Folk',85000],['Neon Tide','Electronic',95000],
/* 100,000 to 5,000,000 */
['Luca Bianchi','Pop',140000],['Sasha Wolfe','Rock',200000],['Kofi Mensah','Hip-Hop',300000],['Valentina Cruz','Latin',450000],['Jude Callahan','Country',650000],['Amara Diallo','R&B',900000],['Theo Lund','Indie',1500000],['Raya Sol','Electronic',2400000],['Marcus Greer','Hip-Hop',3600000]
];
POOL.forEach((r,j)=>{if(ART.some(a=>a[0]==r[0]))return;const L=r[2],rnd=fRng(fHash('pool|'+r[0])),pk=a=>a[Math.floor(rnd()*a.length)];
 const look=SK[Math.floor(rnd()*SK.length)]+' hair='+pk(HR)+' hc='+pk(HC)+' eyes='+pk([0,4,5,8])+' mouth='+pk([0,3])+' top='+pk([0,1,2])+' tc='+pk(TC)+' pc='+pk(PC)+' body='+(15+Math.floor(rnd()*50))+' hgt='+(45+Math.floor(rnd()*30)),
  fee=L>=1e6?Math.round(100000*Math.sqrt(L/15e6)/500)*500:Math.max(30,Math.round(6*Math.pow(L,.6)/10)*10);
 ART.push([r[0],r[1],L,fee,lookFromCode(look),pk(PS),'',0,0,1])});
if(typeof MKT!='undefined')MKT=null;if(typeof MKT_R!='undefined')MKT_R=null;

/* ---- more lines (the arrays are shared with the chat engine, so pushing is enough). Only {n} {g} {song} {lis} {pay} {loc} are filled in. ---- */
const add=(arr,l)=>{if(Array.isArray(arr))l.forEach(t=>{if(!arr.includes(t))arr.push(t)})};
{const i=BASE.intro.indexOf('I came across your page, {n}. you are doing something interesting.');if(i>=0)BASE.intro[i]='I came across your page and you are doing something interesting.'}
add(BASE.intro,['{lis} listeners and climbing. I have been watching your page for a while.','your last song, "{song}", showed up on my feed three times in one day. that is a sign.','a friend sent me "{song}" and I have not stopped playing it.','we are at about the same stage, so I figured I would say hello first.','your sound is what I have been missing in my own music.','I do {g} and you do your own thing, and I think the two would sit well together.','heard "{song}" in a cafe today and had to look up who made it.','just wanted to say the production on "{song}" is clean.','not sure if you read your messages, but your music deserves more ears.','I keep seeing your name next to artists I like. figured it was time to reach out.']);
add(BASE.ask,['I have half a {g} verse sitting around and it needs your voice. interested?','what do you think about a {g} track with both of us on it?','we could split the work on a {g} song. fancy it?','I have a {g} idea that would suit you. want to hear more?','how about a feature swap, one {g} track each?','no pressure, but a {g} collab could be good for both of us.']);
add(RB.ask,['I have a {g} idea that would fit your sound. want in?','think we should make a {g} song? I do.','would you jump on a {g} track with me?','the more I listen to your stuff the more I want a {g} collab. what do you say?']);
add(FDM.f,['hey, just found your page. rooting for you.','welcome! the first few weeks are the hardest. keep going.','saw you are new here. say hi any time.']);
add(FDM.w,['your page just popped up and I like the look of it. fancy making a track?','new in town? I know some good studio spots. want to make a song?','I have a spare beat and a feeling you would kill it. want it?']);
add(CI,['been working on a new {g} song all week. would love your ears on it.','random one: what are you listening to at the moment?','just played a small show. the crowd was louder than I expected.','my studio keyboard broke today. send help and snacks.','studio session ran until 3am. worth it.','your {lis} listeners are no accident. keep going.','that "{song}" line is stuck in my head again.','hope your week is going well, {n}.','finally finished a song I have been stuck on for a month.']);
add(CI2,['anyway, let me know if you fancy a {g} session some time.','also, I am free next week if you want to jam.','oh, and happy to talk about money if it helps.','by the way, I mean it about the collab.']);

/* ---- steady offers at every size ---- */
function peerPick(k){/* like dmDraw, but with no "maybe nobody" roll, so someone near your size always gets through */
 const mo=dmMomentum(),c=ART.map((a,i)=>i).filter(i=>!S.msgs.some(m=>m.a===i)&&!(typeof BLKI!='undefined'&&BLKI&&BLKI.has(i))),out=[];
 const w=c.map(i=>[i,dmWeight(i,mo)*(.5+Math.random())]).filter(q=>q[1]>0);
 while(out.length<k&&w.length){const tot=w.reduce((p,q)=>p+q[1],0);if(tot<=0)break;let r=Math.random()*tot,j=0;for(;j<w.length-1;j++){if(r<w[j][1])break;r-=w[j][1]}out.push(w[j][0]);w.splice(j,1)}
 return out}
dmDaily=function(){const r=Math.random(),gap=S.day-(S.dmLast||0);let k=r<.12?0:r<.5?1:2;if(gap>=3&&k<1)k=1;
 const pend=S.msgs.filter(m=>m.a!==undefined&&!m.blocked&&m.state==0&&m.stage>=1&&m.unread).length,n=Math.max(0,Math.min(k,4-pend));
 let L=dmDraw(n);if(!L.length&&n>0&&gap>=3)L=peerPick(1);
 L.forEach(i=>newConv(i));if(L.length)S.dmLast=S.day;return L.length};
})();
