/* ===== v26.39.0: Park Fields Festival bookings (FestivalApp), other acts, crowd shouts and smoke flares =====
   Design note: "For the festival you have to book yourself at a stage you desire ... book the time slot 2 days in advance on a
   free app on your computer called FestivalApp ... max 4 in-game hours of songs ... you can perform albums as well."
   - time slots: every stage has 4 slots on a festival day, 10:00-14:00, 14:00-18:00, 18:00-22:00 and 22:00-02:00. NPC
     artists have already taken some of them (big names from ART on stages 1 and 2, made-up acts on 3 and 4); at least
     one slot per stage is left free. Free slots nobody books get a DJ or a local act on the day.
   - FestivalApp (free in App Barn, installed for you): pick a festival, a stage and a free slot. You can only book a
     stage your Fame Level allows, and only while the festival is at least 2 days away. Booking is free. You build a
     setlist from your released songs and albums (an album adds all its tracks); each song lasts festDur(song) = 30-55
     in-game minutes, so 4 to 8 songs fill a slot, and the setlist can't go over 4 hours. You can edit the setlist or
     cancel (free while the festival is 2+ days away, -2 reputation after that).
   - on the day: be at the steps of your stage during your slot (70-festival.js plays the set). Miss the slot and it is
     given away, with -3 reputation. Bookings are saved in S.festBk (old saves start with none).
   - vibe: the other stages have their acts on stage (singer, guitarist, drummer, or a DJ), their own crowds and light
     beams; crowds shout ("LET'S GOOO", "ONE MORE SONG", your name), and now and then someone lets off a coloured smoke
     flare in the crowd. */
const FSLOT=[[600,840],[840,1080],[1080,1320],[1320,1560]];/* minutes since midnight of the festival day */
const FSET_MAX=240;/* in-game minutes in a slot, and the longest setlist */
/* the game clock (clk()): S.t 0-300 is 06:00-20:00 (2.8 min per step), 300-600 is 20:00-06:00 (2 min per step) */
function festMins(t){t=t==null?S.t||0:t;return t<300?360+t*2.8:1200+(t-300)*2}
const fHM=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const fDurS=m=>{m=Math.max(0,Math.round(m));const h=Math.floor(m/60),r=m%60;return h?h+'h '+String(r).padStart(2,'0')+'m':r+' min'};
function festSlotAt(m){m=m==null?festMins():m;return FSLOT.findIndex(s=>m>=s[0]&&m<s[1])}
/* how long a song lasts on stage, in in-game minutes: 30-55, fixed per song */
function festDur(song){return 30+fHash('d'+song.id)%26}
const festSetMins=ids=>ids.reduce((a,id)=>{const s=S.songs.find(x=>x.id==id);return a+(s?festDur(s):0)},0);
const FFILL=['DJ Fernwave','Open Mic Hour','The Warm-Up Club','DJ Lowtide','Silent Disco Crew','Local Heroes','DJ Soft Serve','The Busk Stop'];

/* ---- 1. bookings ---- */
const fBk=()=>Array.isArray(S.festBk)?S.festBk:(S.festBk=[]);
const festBkOn=(day,n)=>fBk().find(b=>b.day==day&&b.n==n&&b.st!=2);
/* which slots NPC artists have taken (fixed per festival day and stage), at least one left free */
function festSlotTaken(day,n){const h=FSLOT.map((_,k)=>fRng(fHash('slot'+day+':'+n+':'+k))()),t=h.map(x=>x<.55);if(t.every(Boolean))t[h.indexOf(Math.min(...h))]=false;return t}
function festSlotAct(day,n,k){const b=festBkOn(day,n);if(b&&b.slot==k)return{you:1,name:S.artist||'You',bk:b};/* names step through the lists from a per-stage start, so a stage never repeats an act on the same day */
 const h=(fRng(fHash('act'+day+':'+n))()*1e6)|0,h2=(fRng(fHash('fill'+day+':'+n))()*1e6)|0;
 if(festSlotTaken(day,n)[k]){if(n<=2&&typeof ART!='undefined'&&ART.length){const i=(h+k*7)%ART.length;return{name:ART[i][0],art:i,taken:1}}return{name:FACTS[(h+k*5)%FACTS.length],taken:1}}
 return{name:FFILL[(h2+k*3)%FFILL.length],fill:1}}
/* the next few festival days */
function festUpcoming(n){const a=[];let d=festNext(S.day);while(a.length<(n||3)){a.push(d);d+=FEST_EVERY}return a}
/* why a slot can't be booked ('' if it can) */
function festCanBook(day,n,k){const s=fStage(n),lv=festLv();
 if(!s||festPhaseOf(day)!='fest')return 'There is no festival on Day '+day+'.';
 if(day-S.day<2)return 'Too late: bookings for Day '+day+' closed 2 days before the festival.';
 if(lv<s.req)return 'Stage '+n+' ('+s.name+') needs Fame Level '+s.req+'. You are Level '+lv+'.';
 if(festBkOn(day,n))return 'You already have a slot on Stage '+n+' at this festival.';
 if(fBk().some(b=>b.day==day&&b.slot==k&&b.st!=2))return 'You are already playing another stage at that time.';
 if(festSlotTaken(day,n)[k])return 'That slot is taken by '+festSlotAct(day,n,k).name+'.';
 return ''}
/* missed slots, reminders (checked twice a second) */
function festBkCheck(){if(!S||!S.artist||mode=='load'||mode=='creator')return;const m=festMins();
 fBk().forEach(b=>{if(b.st)return;const s=fStage(b.n),sl=FSLOT[b.slot],now=FEST.set&&FEST.set.bk===b;
  if(!now&&(S.day>b.day||S.day==b.day&&m>=sl[1]-1)){b.st=2;S.rep=(S.rep||0)-3;updateVersion();snd('err');say('You missed your slot on '+s.name+' (Day '+b.day+', '+fHM(sl[0])+'). The festival gave it away. Reputation -3.');try{festBoardDraw()}catch(e){}return}
  if(S.day==b.day&&!b.rem&&m>=sl[0]-60&&m<sl[0]){b.rem=1;say('Your set on Stage '+b.n+' ('+s.name+') starts at '+fHM(sl[0])+'. Head to the steps of the stage!')}});
 /* keep the list short: pending ones and the last 8 finished ones */
 const L=fBk(),old=L.filter(b=>b.st);if(old.length>8){const drop=new Set(old.slice(0,old.length-8));S.festBk=L.filter(b=>!drop.has(b))}}
/* the label at the steps of a stage */
function festStageLabel(s){const bk=festBkOn(S.day,s.n);
 if(bk&&bk.st==1)return 'Stage '+s.n+' · you played here today';
 if(bk){const m=festMins(),a=FSLOT[bk.slot][0];return m<a?'Your set on Stage '+s.n+' starts in '+fDurS(a-m)+' ('+fHM(a)+')':'Start your set on Stage '+s.n+' · '+bk.songs.length+' song'+(bk.songs.length==1?'':'s')}
 const a=festAct(s);return 'Stage '+s.n+' · '+(a?'now: '+a:s.name)+' · book on FestivalApp'}

/* ---- 2. FestivalApp ---- */
APPD.fest={n:'FestivalApp',p:0,d:'Free! Book your own slot at Park Fields Festival (at least 2 days ahead) and plan your setlist.'};
if(typeof APPMOD!='undefined')APPMOD.fest=[[.9,.45,.9,'#2b1240',0,.22,0],[.96,.1,.96,'#ff6ad5',0,.5,0],[.5,.45,.06,'#ffe066',0,.8,0]];
IC.fest=(typeof mkIc=='function'?mkIc:(r,p)=>IC.store)(['....PP....','...PPPP...','..PPYYPP..','.PPYYYYPP.','PPPPPPPPPP','.W.W..W.W.','.W.WKKW.W.','.W.WKKW.W.','.W.WKKW.W.','WWWWWWWWWW'],{P:'#ff6ad5',Y:'#ffe066',W:'#f4f0ff',K:'#2b1240'});
{const s0=PA.store;PA.store=()=>s0().replace(/(onclick="inst\('fest'\)">)[^<]*</,'$1Get · Free<')}
let FAPP={v:'home'};
PA.fest=()=>{try{return fappPage()}catch(e){console.error('FestivalApp',e);return '<p>FestivalApp hit a snag. Close it and try again.</p>'}};
function fappErr(t){snd('err');FAPP.msg=t;if(mode!='pc')say(t);pcR()}
function fappGo(v,d){FAPP={v,d:d==null?FAPP.d:d};snd('pop');pcR()}
function fappPage(){const lv=festLv();if(FAPP.v=='set'&&FAPP.d<S.day)FAPP={v:'home'};
 const hd=`<h1 style="margin:0 0 2px"><img src="${IC.fest}" style="width:32px;image-rendering:pixelated;vertical-align:middle"> FestivalApp</h1><p class=m style="margin-top:0">Park Fields Festival · every ${FEST_EVERY} days · today is Day ${S.day}, ${clk()} · you are Fame Level ${lv}</p>`+(FAPP.msg?`<p class=fa-err>${esc(FAPP.msg)}</p>`:'');
 return '<div class=fa>'+hd+(FAPP.v=='fest'?fappFest():FAPP.v=='set'?fappSet():fappHome())+'</div>'}
const fSlotS=k=>fHM(FSLOT[k][0])+'-'+fHM(FSLOT[k][1]);
function fappHome(){const L=fBk(),up=L.filter(b=>!b.st).sort((a,b)=>a.day-b.day||a.slot-b.slot),past=L.filter(b=>b.st).slice(-4).reverse();
 const bk=b=>{const s=fStage(b.n),ids=b.songs,cx=FAPP.cx==b.id;return`<div class="card fa-b"><div style="flex:1"><b style="color:${s.col}">Day ${b.day} · Stage ${b.n} · ${s.name}</b><br><span class=m>${fSlotS(b.slot)} · ${ids.length} song${ids.length==1?'':'s'} · ${fDurS(festSetMins(ids))}${b.day==S.day?' · <b style="color:#2fe68a">TODAY</b>':' · in '+(b.day-S.day)+' day'+(b.day-S.day==1?'':'s')}</span></div>
  ${cx?`<span class=m>${b.day-S.day<2?'Late cancel: -2 reputation. ':''}Sure?</span><button class=go onclick="fappCancel(${b.id},1)">Yes, cancel</button><button onclick="FAPP.cx=0;pcR()">Keep it</button>`:`<button onclick="fappEdit(${b.id})">Setlist</button><button onclick="fappCancel(${b.id})">Cancel</button>`}</div>`};
 const pb=b=>{const s=fStage(b.n);return`<div class=m style="margin:3px 0">Day ${b.day} · Stage ${b.n} ${s.name} · ${b.st==2?'<span style="color:#ff6a6a">missed</span>':b.res?'played '+b.res.n+' song'+(b.res.n==1?'':'s')+' to '+b.res.c.toLocaleString()+' people · '+$$(b.res.pay):'played'}</div>`};
 const fe=festUpcoming(3).map(d=>{const dd=d-S.day,open=dd>=2,mine=L.filter(b=>b.day==d&&b.st!=2).length;return`<div class="card fa-b"><div style="flex:1"><b>Day ${d}</b> <span class=m>· ${dd==0?'today':dd==1?'tomorrow':'in '+dd+' days'}${mine?' · you have '+mine+' slot'+(mine==1?'':'s'):''}</span><br>
  <span class=m style="color:${open?'#2fe68a':'#ff9a6a'}">${open?'Bookings open':'Bookings closed (less than 2 days to go)'}</span></div><button class=${open?'go':''} onclick="fappGo('fest',${d})">${open?'Line-up & book':'Line-up'}</button></div>`}).join('');
 return`<h3>Your bookings</h3>${up.length?up.map(bk).join(''):'<p class=m>No bookings yet. Pick a festival below.</p>'}${past.length?'<details><summary class=m>Past slots</summary>'+past.map(pb).join('')+'</details>':''}
  <h3>Upcoming festivals</h3>${fe}
  <details class=m style="font-size:12px;margin-top:10px"><summary>How it works</summary>book a free slot on a stage your Fame Level allows, at least 2 days before the festival. A slot is 4 in-game hours; fill it with up to 4 hours of songs (each song lasts 30-55 min) or whole albums. On the day, be at the steps of the stage during your slot. You're paid ${$$(FSONG_PAY)} x the stage multiplier for every person in the crowd after each song. Miss your slot and you lose 3 reputation.</details>`}
function fappFest(){const d=FAPP.d,lv=festLv(),dd=d-S.day;
 const rows=FSTG.map(s=>{const ok=lv>=s.req;return`<div class=fa-h><b style="color:${s.col}">Stage ${s.n}</b><br>${s.name}<br><small class=m>Fame Lv ${s.req} · pay x${s.mult}<br>${ok?'crowd about '+festC0(s).toLocaleString():'locked for you'}</small></div>`+FSLOT.map((sl,k)=>{const a=festSlotAct(d,s.n,k),e=festCanBook(d,s.n,k);
  if(a.you)return`<div class="fa-c you"><b>YOU</b><br>${a.bk.songs.length} songs · ${fDurS(festSetMins(a.bk.songs))}<br><button onclick="fappEdit(${a.bk.id})">Setlist</button></div>`;
  if(a.taken)return`<div class="fa-c tk"><small class=m>${fSlotS(k)}</small><br><b>${esc(a.name)}</b><br><small class=m>taken</small></div>`;
  return`<div class="fa-c free"><small>${fSlotS(k)}</small><br><b>Free</b><br>${e?`<small style="opacity:.75">${!ok?'Fame Lv '+s.req:dd<2?'closed':festBkOn(d,s.n)?'1 slot per stage':'you play elsewhere'}</small> <button onclick="fappPick(${d},${s.n},${k})">Book</button>`:`<button class=go onclick="fappPick(${d},${s.n},${k})">Book</button>`}</div>`}).join('')}).join('');
 return`<p><button onclick="fappGo('home')">◀ Back</button> <b style="font-size:16px">Day ${d} line-up</b> <span class=m>· ${dd==0?'today':dd==1?'tomorrow':'in '+dd+' days'}${dd<2?' · bookings closed':''}</span></p>
  <div class=fa-grid><div></div>${FSLOT.map(sl=>`<div class=fa-t>${fHM(sl[0])}-${fHM(sl[1])}</div>`).join('')}${rows}</div>`}
function fappPick(d,n,k){const e=festCanBook(d,n,k);if(e)return fappErr(e);FAPP={v:'set',d,n,k,songs:[],edit:0};snd('pop');pcR()}
function fappEdit(id){const b=fBk().find(x=>x.id==id);if(!b||b.st)return;if(FEST.set&&FEST.set.bk===b)return fappErr('You are playing that set right now!');FAPP={v:'set',d:b.day,n:b.n,k:b.slot,songs:b.songs.filter(i=>S.songs.some(x=>x.id==i)),edit:id};snd('pop');pcR()}
function fappAdd(id){const s=S.songs.find(x=>x.id==id),L=FAPP.songs;if(!s||!L)return;if(L.includes(id))return fappErr('"'+s.title+'" is already in your setlist.');
 
 const t=festSetMins(L)+festDur(s);if(t>FSET_MAX)return fappErr('Adding "'+s.title+'" ('+festDur(s)+' min) would make your set '+fDurS(t)+'. The limit is 4 hours.');L.push(id);FAPP.msg='';snd('pop');pcR()}
function fappAddAl(id){const a=(S.albums||[]).find(x=>x.id==id),L=FAPP.songs;if(!a||!L)return;const ids=a.songs.filter(i=>S.songs.some(x=>x.id==i)&&!L.includes(i));
 if(!ids.length)return fappErr('All of "'+a.name+'" is already in your setlist.');
 const t=festSetMins(L)+festSetMins(ids);
 if(t>FSET_MAX)return fappErr('The album "'+a.name+'" ('+ids.length+' songs, '+fDurS(festSetMins(ids))+') would make your set '+fDurS(t)+'. The limit is 4 hours.');L.push(...ids);FAPP.msg='';snd('pop');pcR()}
function fappDel(i){FAPP.songs.splice(i,1);FAPP.msg='';pcR()}
function fappUp(i){const L=FAPP.songs;if(i>0){[L[i-1],L[i]]=[L[i],L[i-1]];pcR()}}
function fappSet(){const s=fStage(FAPP.n),L=FAPP.songs,tot=festSetMins(L),left=FSET_MAX-tot,sg=S.songs.slice().sort((a,b)=>(b.streams||0)-(a.streams||0)),al=(S.albums||[]).filter(a=>a.songs.some(i=>S.songs.some(x=>x.id==i)));
 const row=(x,i)=>`<div class=fa-r><span style="flex:1">${i+1}. ${esc(x.title)}${x.ft?` <small style="color:#f5c542">feat. ${esc(x.ft)}</small>`:''}</span><small class=m>${festDur(x)} min</small><button onclick="fappUp(${i})" ${i?'':'disabled'}>▲</button><button onclick="fappDel(${i})">✕</button></div>`;
 return`<p><button onclick="fappGo(${FAPP.edit?"'home'":"'fest'"})">◀ Back</button> <b style="font-size:16px">${FAPP.edit?'Edit setlist':'New booking'}: Day ${FAPP.d} · Stage ${s.n} ${s.name} · ${fSlotS(FAPP.k)}</b></p>
  <div class=fa-two><div><h3 style="margin:4px 0">Setlist · <span id=fatot style="color:${left<30?'#ffb04a':'#2fe68a'}">${fDurS(tot)}</span> / 4h 00m</h3><div class=fa-tot><i style="width:${Math.min(100,tot/FSET_MAX*100)}%"></i></div>
   ${L.length?L.map(id=>S.songs.find(x=>x.id==id)).filter(Boolean).map(row).join(''):'<p class=m>Empty. Add songs or albums from the right.</p>'}
   <p class=m style="font-size:12px">${left>0?fDurS(left)+' left in the slot. ':'Slot full. '}If the setlist is shorter than the slot, you're done when the last song ends. Collabs bring the featured artist on stage for that song.</p>
   <button class=go onclick="fappConfirm()">${FAPP.edit?'Save setlist':'Confirm booking (free)'}</button></div>
  <div><h3 style="margin:4px 0">Your songs</h3><div class=fa-l>${sg.length?sg.map(x=>{const inn=L.includes(x.id),over=!inn&&festDur(x)>left;return`<div class=fa-r style="${inn||over?'opacity:.5':''}"><span style="flex:1">${esc(x.title)}${x.ft?` <small style="color:#f5c542">feat. ${esc(x.ft)}</small>`:''}<br><small class=m>${esc(x.g||'')} · q${x.q||0} · ${festDur(x)} min</small></span><button onclick="fappAdd(${x.id})">${inn?'Added':'+ Add'}</button></div>`}).join(''):'<p class=m>Release some songs first.</p>'}</div>
   ${al.length?`<h3 style="margin:8px 0 4px">Albums</h3><div class=fa-l>${al.map(a=>{const ids=a.songs.filter(i=>S.songs.some(x=>x.id==i));return`<div class=fa-r><span style="flex:1">${esc(a.name)}<br><small class=m>${ids.length} songs · ${fDurS(festSetMins(ids))}</small></span><button onclick="fappAddAl(${a.id})">+ Album</button></div>`}).join('')}</div>`:''}</div></div>`}
function fappConfirm(){const L=FAPP.songs;if(!L||!L.length)return fappErr('Add at least one song to your setlist.');const tot=festSetMins(L);if(tot>FSET_MAX)return fappErr('Your setlist is '+fDurS(tot)+'. The limit is 4 hours.');const s=fStage(FAPP.n);
 
 if(FAPP.edit){const b=fBk().find(x=>x.id==FAPP.edit);if(!b||b.st)return fappErr('That booking is no longer open.');if(FEST.set&&FEST.set.bk===b)return fappErr('You are playing that set right now!');b.songs=L.slice();say('Setlist saved: '+L.length+' songs, '+fDurS(tot)+'.')}
 else{const e=festCanBook(FAPP.d,FAPP.n,FAPP.k);if(e)return fappErr(e);fBk().push({id:S.nid++,day:FAPP.d,n:FAPP.n,slot:FAPP.k,songs:L.slice(),st:0,bd:S.day});say('Booked! Stage '+s.n+' ('+s.name+'), Day '+FAPP.d+' at '+fHM(FSLOT[FAPP.k][0])+'. '+L.length+' songs, '+fDurS(tot)+'.')}
 updateVersion();chime();FAPP={v:'home'};pcR();try{festBoardDraw()}catch(e){}}
function fappCancel(id,yes){const b=fBk().find(x=>x.id==id);if(!b||b.st)return;if(!yes){FAPP.cx=id;return pcR()}
 const late=b.day-S.day<2;S.festBk=fBk().filter(x=>x!==b);if(late)S.rep=(S.rep||0)-2;updateVersion();snd('pop');say('Booking cancelled'+(late?' (late, reputation -2).':'.'));FAPP={v:'home'};pcR();try{festBoardDraw()}catch(e){}}
{const st=document.createElement('style');st.textContent=`.fa h3{font-size:15px;margin:12px 0 6px}.fa-err{background:#5a1a1a;color:#fff;padding:6px 8px;border-radius:4px}.fa-b{display:flex;gap:8px;align-items:center;margin:6px 0}
.fa-grid{display:grid;grid-template-columns:minmax(110px,1.1fr) repeat(4,1fr);gap:5px;margin:8px 0}.fa-t{font-weight:bold;text-align:center;font-size:12px;opacity:.8}.fa-h{font-size:12px;padding:4px}
.fa-c{border-radius:6px;padding:6px;font-size:12px;background:#0002;border:2px solid #0003;min-height:58px}.fa-c.you{background:#1f6a42;color:#fff;border-color:#2fe68a}.fa-c.tk{opacity:.65}.fa-c.free{background:#2b1240;color:#fff;border-color:#ff6ad5}.fa-c button{margin-top:3px;padding:2px 8px}
.fa-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}.fa-l{max-height:34vh;overflow:auto}.fa-r{display:flex;gap:6px;align-items:center;padding:3px 0;border-bottom:1px solid #0002}.fa-r button{padding:2px 8px}
.fa-tot{height:12px;background:#0004;border-radius:6px;overflow:hidden;margin:4px 0 8px}.fa-tot i{display:block;height:100%;background:linear-gradient(90deg,#2fe68a,#ffe066)}
@media (max-width:760px){.fa-grid{grid-template-columns:1fr 1fr}.fa-two{grid-template-columns:1fr}}
#fshc{position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden}.fsh{position:absolute;transform:translate(-50%,-100%) rotate(var(--r));font:900 16px ${FFONT};white-space:nowrap;text-shadow:2px 2px 0 #000,-1px -1px 0 #000,1px -1px 0 #000;animation:fshp 1.7s ease-out forwards}
@keyframes fshp{0%{opacity:0;margin-top:12px;font-size:10px}14%{opacity:1;font-size:18px}70%{opacity:1}100%{opacity:0;margin-top:-48px;font-size:16px}}
#fbk{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:4;pointer-events:none;padding:5px 12px;font-size:14px;white-space:nowrap}body.fston #fbk{display:none}
@media (max-width:600px){#fbk{top:auto;bottom:86px;font-size:12px}}`;document.head.appendChild(st)}

/* ---- 3. the acts on the other stages: a band (or a DJ), light beams, their own crowd ---- */
function festNpcBuild(s,act){const g=new THREE.Group(),rnd=fRng(fHash('band'+act.name)),RI2=n=>(rnd()*n)|0,cfg=()=>({skin:RI2(6),eyes:RI2(5),mouth:RI2(4),hair:RI2(12),hc:RI2(12),top:RI2(5),tc:RI2(10),pc:RI2(8),body:rnd()}),band=[];
 const put=(o,x,y,z,ry,job)=>{o.g.position.set(x,y,z);o.g.rotation.y=ry||0;g.add(o.g);band.push({o,job,y,ph:rnd()*6})};
 if(act.fill){/* a DJ behind a booth with two decks */B(g,2,1,.8,'#15151a',s.cx,s.h+.5,s.zf-2.3);B(g,2.02,.12,.82,s.col,s.cx,s.h+.95,s.zf-2.3);B(g,.5,.05,.5,'#333',s.cx-.5,s.h+1.03,s.zf-2.4);B(g,.5,.05,.5,'#333',s.cx+.5,s.h+1.03,s.zf-2.4);
  put(buildChar(cfg()),s.cx,s.h,s.zf-3.1,0,'dj')}
 else{const lead=buildChar(act.art!=null&&ART[act.art]?Object.assign({},ART[act.art][4]):cfg());put(lead,s.cx,s.h,s.zf-1.9,0,'sing');g.add(festMic(s.cx,s.h,s.zf-1.18,0));
  const gt=buildChar(cfg());B(gt.g,.55,.62,.12,pick(['#c0392b','#2f6fd0','#f5c542','#1d1d22']),.08,.92,.26);B(gt.g,.85,.07,.07,'#5a3a20',-.5,1.12,.26);put(gt,s.cx+s.w*.27,s.h,s.zf-2.8,-.35,'gtr');
  const dr=buildChar(cfg());put(dr,s.cx,s.h+.45,s.zb+1.75,0,'drum')}
 g.userData.band=band;return g}
function festNpcBeams(s){const g=new THREE.Group(),C=['#ff4a9a','#6ad5ff','#ffe066','#b07aff'],n=s.n<=2?6:4;s.nb=[];
 for(let i=0;i<n;i++){const geo=new THREE.CylinderGeometry(.1,s.n<=2?2.6:1.6,s.n<=2?26:14,8,1,true);geo.translate(0,-(s.n<=2?13:7),0);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:C[i%C.length],transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.position.set(s.x0+(i+.5)*s.w/n,s.tent?s.H-.4:s.H-.95,s.zf+.6);m.userData.ph=i*1.3+s.n;g.add(m);s.nb.push(m)}
 g.visible=false;fGroup('fest').add(g);return g}
function festNpcTick(dt,t){const k=festSlotAt();FSTG.forEach(s=>{if(!s.cr)return;const me=FEST.set&&FEST.set.st===s,act=k<0?null:festSlotAct(S.day,s.n,k),key=S.day+':'+k+':'+(act?act.name:'')+':'+(me?1:0);
  if(s.npcK!==key){s.npcK=key;if(s.npc){s.npc.parent&&s.npc.parent.remove(s.npc);s.npc.traverse(o=>{if(o.geometry)o.geometry.dispose()})}s.npc=null;
   if(act&&!act.you&&!me){s.npc=festNpcBuild(s,act);fGroup('fest').add(s.npc)}
   if(!me){s.cr.C=festAmbient(s);s.cr.shown=-1;s.cr.hb=act&&!act.you?.5+fRng(fHash(key))()*.3:.15}
   s.scrK='';festScreens();festBoardDraw()}
  if(!s.nfx)s.nfx=festNpcBeams(s);const lit=!!act&&!me&&(!act.you);s.nfx.visible=lit&&!FEST.view;
  const d=Math.hypot(P.x-s.cx,P.z-s.zf-15);if(!me&&s.cr.hb!=null)s.cr.hype=s.cr.hb+.12*Math.sin(t*.23+s.n*2);
  if(lit&&!FEST.view&&d<110)s.nb.forEach(m=>{const p=m.userData.ph;m.rotation.set(-.55+Math.sin(t*.8+p)*.45,0,Math.sin(t*1.1+p)*.6);m.material.opacity=.07+.05*Math.sin(t*2.5+p)});
  if(s.npc&&d<90){const bp=t*1.6*Math.PI;s.npc.userData.band.forEach(b=>{const o=b.o,a=o.arms,l=o.legs;o.g.position.y=b.y+Math.max(0,Math.sin(bp+b.ph*.2))*.05;
   if(b.job=='sing'){a[1].rotation.x=-2.2+Math.sin(t*4+b.ph)*.12;a[0].rotation.x=Math.sin(t*.6+b.ph)>.3?-2.9:-.4+Math.sin(bp)*.3;o.g.rotation.y=Math.sin(t*.7+b.ph)*.3}
   else if(b.job=='gtr'){a[0].rotation.x=-1.1+Math.sin(t*9+b.ph)*.35;a[1].rotation.x=-1.3;o.g.rotation.y=-.35+Math.sin(t*1.1)*.15}
   else if(b.job=='drum'){a[0].rotation.x=-1.3+Math.sin(t*12)*.4;a[1].rotation.x=-1.3+Math.sin(t*12+Math.PI)*.4}
   else{a[0].rotation.x=-1.2+Math.sin(t*3)*.1;a[1].rotation.x=Math.sin(t*.9)>0?-2.9+Math.sin(bp)*.2:-1.2;o.g.rotation.y=Math.sin(bp*.5)*.15}
   if(l)l[0].rotation.x=l[1].rotation.x=0})}})}

/* ---- 4. crowd shouts: little text pops over the crowd and a short yell (festShoutSfx can be swapped for samples) ---- */
const FSH=['LET\'S GOOO!','ONE MORE SONG!','WE LOVE YOU!','TUUUNE!','LOUDER!','WOOOO!','BANGER!','HANDS UP!','AAAAH!','THIS IS MY SONG!','ENCORE!','SO GOOD!','I\'M CRYING!','BEST DAY EVER!','YESSS!'],FSHCOL=['#ffffff','#ffe066','#ff9ad8','#8ae0ff','#9dffb0','#ffb04a'];
const FV2=new THREE.Vector3();let FSHC=null,FSH_T=3;
function festShoutTxt(name,song){const r=Math.random();if(name&&r<.2){const n=name.toUpperCase();return n+'! '+n+'!'}if(song&&r<.28)return 'PLAY "'+song.toUpperCase()+'"!';return pick(FSH)}
function festShoutSfx(txt,vol){if(!vol)return;const f=240+Math.random()*200;sfx(f,.22,'sawtooth',.016*vol,f*1.4,0,0);nz(.32,1000+Math.random()*700,.05*vol,.9,'bandpass')}
function festPop(txt,x,y){if(!FSHC){FSHC=document.createElement('div');FSHC.id='fshc';document.body.appendChild(FSHC)}if(FSHC.childElementCount>7)FSHC.firstChild.remove();
 const d=document.createElement('div');d.className='fsh';d.textContent=txt;d.style.left=Math.round(x)+'px';d.style.top=Math.round(y)+'px';d.style.color=pick(FSHCOL);d.style.setProperty('--r',(Math.random()*14-7).toFixed(1)+'deg');FSHC.appendChild(d);setTimeout(()=>d.remove(),1750)}
function festShout(txt,vol,s){s=s||FEST.set&&FEST.set.st;if(!s||!s.cr)return 0;const cr=s.cr,n=Math.min(cr.shown,FEST.view?260:cr.shown),c=FEST.view&&FEST.view3?FEST.view3.cam:cam;if(n<1)return 0;
 for(let tr=0;tr<5;tr++){const p=cr.f[(Math.random()*n)|0];FV2.set(p.x,2.3,p.z).project(c);if(FV2.z>1||FV2.z<-1||Math.abs(FV2.x)>.92||FV2.y>.8||FV2.y<-.9)continue;
  festPop(txt,(FV2.x+1)/2*innerWidth,(1-FV2.y)/2*innerHeight);festShoutSfx(txt,vol);return 1}return 0}
function festShoutTick(dt){if(mode!='fest'&&mode!='play')return;FSH_T-=dt;if(FSH_T>0)return;const set=FEST.set;
 if(set&&!set.end){FSH_T=R(1.1,3.2)/(.4+set.hype);festShout(festShoutTxt(S.artist,set.song.title),1)}
 else if(!FEST.view){FSH_T=R(2,5);const s=FSTG.find(q=>festAct(q)&&Math.hypot(P.x-q.cx,P.z-(q.oz+12))<42);if(s)festShout(festShoutTxt(festAct(s)),.45,s)}}

/* ---- 5. smoke flares: a bright flare held up in the crowd and a column of coloured smoke (a small sprite pool) ---- */
const FFL={L:[],g:null,next:6},FFLC=['#ff3b5c','#ff6ad5','#2fe68a','#3a8ee0','#ffe066','#ff8a30','#b07aff'];
function festFlareInit(){if(FFL.g)return;FFL.g=new THREE.Group();scene.add(FFL.g);const tex=fTex(64,64,(x)=>{const g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.45,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
 for(let i=0;i<4;i++){const f={t:-1,p:[],c:new THREE.Color(),head:new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}))};f.head.visible=false;FFL.g.add(f.head);
  for(let k=0;k<14;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0}));sp.visible=false;FFL.g.add(sp);f.p.push(sp)}FFL.L.push(f)}}
function festFlare(x,z,col){festFlareInit();const f=FFL.L.find(q=>q.t<0);if(!f)return 0;f.t=0;f.x=x;f.z=z;f.dx=R(-.35,.35);f.dz=R(-.25,.25);f.c.set(col);
 f.head.material.color.copy(f.c).lerp(new THREE.Color('#ffffff'),.4);f.p.forEach(sp=>sp.material.color.copy(f.c).lerp(new THREE.Color('#ffffff'),.2));
 if(FEST.set||Math.hypot(P.x-x,P.z-z)<40)nz(1.4,3800,.025,.4,'highpass');return 1}
function festFlareTick(dt){if(!FFL.g)return;FFL.L.forEach(f=>{if(f.t<0)return;f.t+=dt;const T=f.t,burn=6.5,n=f.p.length;let alive=T<burn;
 f.head.visible=alive;if(alive){const fl=.75+Math.random()*.5;f.head.position.set(f.x+.25,2.2,f.z);f.head.scale.set(fl,fl,1)}
 f.p.forEach((sp,k)=>{const a=T-k*burn/n;if(a<0||a>4){sp.visible=false;return}alive=true;sp.visible=true;sp.position.set(f.x+.25+f.dx*a*1.6+Math.sin(a*1.3+k)*.3,2.4+a*1.3,f.z+f.dz*a*1.6);const sc=.7+a*1.35;sp.scale.set(sc,sc,1);sp.material.opacity=.62*(1-a/4)*Math.min(1,a*3)});
 if(!alive){f.t=-1;f.head.visible=false}})}
function festFlareSpawnTick(dt){FFL.next-=dt;if(FFL.next>0)return;const set=FEST.set;let s=null;
 if(set&&!set.end){s=set.st;FFL.next=R(9,20)/(.5+set.hype)}else if(!FEST.view){FFL.next=R(12,30);s=FSTG.find(q=>festAct(q)&&Math.hypot(P.x-q.cx,P.z-(q.oz+14))<60)}else FFL.next=5;
 if(!s||!s.cr||s.cr.shown<10)return;const cr=s.cr,p=cr.f[(Math.random()*Math.min(cr.shown,set?320:cr.shown))|0];festFlare(p.x,p.z,pick(FFLC))}
/* a perfect crowd moment sets off a flare and a cheer */
{const d0=festMgDone;festMgDone=function(sc){const set=FEST.set,m=set&&set.mg,pre=m&&m.sc==null;d0(sc);if(pre&&m.sc>=.9&&set.st.cr){const cr=set.st.cr,p=cr.f[(Math.random()*Math.min(cr.shown,260))|0];if(p)festFlare(p.x,p.z,pick(FFLC));festShout(pick(['LET\'S GOOO!','YESSS!',(S.artist||'YOU').toUpperCase()+'!']),1)}}}

/* ---- 6. the booking chip on the festival day, and the per-frame hook ---- */
function festBkChip(){let el=$('fbk');const b=FEST.ph=='fest'&&mode=='play'&&!FEST.set?fBk().find(q=>q.day==S.day&&!q.st):null;if(!b){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='fbk';el.className='hb';document.body.appendChild(el)}const m=festMins(),sl=FSLOT[b.slot],s=fStage(b.n);
 const h=m<sl[0]?`Your set: <b style="color:${s.col}">Stage ${b.n}</b> at ${fHM(sl[0])} · in ${fDurS(sl[0]-m)}`:`<b>You're on now!</b> Go to the steps of <b style="color:${s.col}">Stage ${b.n}</b> · slot ends ${fHM(sl[1])}`;if(el.dataset.h!=h){el.dataset.h=h;el.innerHTML=h}}
let FBT=0;
function festBookTick(dt){FBT-=dt;if(FBT<=0){FBT=.5;festBkCheck();festBkChip();if(S&&S.artist&&S.apps&&!S.apps.fest&&!S.festApp){S.apps.fest=1;S.festApp=1}}
 if(FEST.ph=='fest'&&FEST.grp.fest&&FEST.grp.fest.visible){festNpcTick(dt,FEST.t);festShoutTick(dt);festFlareSpawnTick(dt)}festFlareTick(dt);
 if(FFL.g)FFL.g.visible=FEST.ph=='fest'}
{const u0=update;update=function(dt){u0(dt);try{festBookTick(dt)}catch(e){if(!FEST.err2){FEST.err2=1;console.error('festival bookings',e)}}}}

/* ===== v26.71: FestivalApp look: a neon festival poster. Layout rules above stay as they are; this only restyles .fa. */
{const st=document.createElement('style');st.textContent=`.fa{font-family:Impact,'Haettenschweiler','Arial Narrow Bold',sans-serif;text-transform:uppercase;letter-spacing:.6px;color:#f6f0ff;background:radial-gradient(circle at 92% -8%,#ff2e8838,transparent 45%),radial-gradient(circle at -8% 108%,#c6ff3d26,transparent 40%),#100b1c;padding:14px 14px 16px;border-radius:6px}
.fa h1,.fa h3{font-family:Impact,'Haettenschweiler','Arial Narrow Bold',sans-serif}
.fa h1{font-size:36px;line-height:1;letter-spacing:2px;margin:0 0 6px;background:linear-gradient(90deg,#ff2e88,#ffb13b 55%,#c6ff3d);-webkit-background-clip:text;background-clip:text;color:transparent}
.fa h1 img{filter:drop-shadow(0 0 4px #ff2e88)}
.fa h3{font-size:19px;letter-spacing:1.5px;color:#c6ff3d;border-bottom:2px solid #c6ff3d55;padding-bottom:2px}
.fa p.m{color:#b9a8dc;font-family:'Arial Narrow',Arial,sans-serif;text-transform:none;font-size:13px;letter-spacing:0}
.fa .card{background:#1d1435;border:2px dashed #ff2e88;border-radius:6px;box-shadow:0 0 0 3px #100b1c,0 0 0 5px #c6ff3d44;padding:10px 12px}
.fa button{background:#ff2e88;color:#100b1c;border:0;border-radius:2px;font:inherit;font-weight:700;letter-spacing:1px;padding:6px 12px;cursor:pointer;text-transform:uppercase}
.fa button:hover{background:#ff58a3}
.fa button.go{background:#c6ff3d}
.fa button.go:hover{background:#d8ff6e}
.fa button[disabled]{background:#3a2f55;color:#8a7db0;opacity:1}
.fa .fa-err{background:#ff2e88;color:#100b1c;font-weight:700;border-radius:2px;text-transform:none}
.fa .fa-r{border-bottom:1px dashed #ff2e8866}
.fa .fa-tot{background:#2a1f44;border-radius:0;height:14px}
.fa .fa-tot i{background:linear-gradient(90deg,#ff2e88,#ffb13b,#c6ff3d)}
.fa .fa-c{border-radius:2px;border:2px dashed #ff2e8866;background:#1d1435}
.fa .fa-c.you{background:#c6ff3d;color:#100b1c;border:2px solid #fff}
.fa .fa-c.free{background:#ff2e88;color:#100b1c;border:2px solid #100b1c}
.fa .fa-t{color:#ffb13b;font-size:13px;letter-spacing:1px}
.fa .fa-h{font-size:13px;letter-spacing:.4px}
@media (max-width:760px){.fa h1{font-size:28px}}`;document.head.appendChild(st)}
