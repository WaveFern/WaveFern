/* ===== v26.91: one taxi trip a day, there and back =====
   The taxi (world map, N) takes you to ONE destination a day, then once back to the spot it picked you up from.
   After the ride back it is gone until the next day. S.taxi = {d: day of the ride, go: 1 after the trip out,
   back: 1 after the ride back, fx/fz: where you were picked up, fl: a name for that spot, to: where you went}.
   It lives in S, so save codes, the browser autosave and cloud saves keep it; older saves get the default below. */
if(!S.taxi)S.taxi={d:0,go:0,back:0,fx:0,fz:0,fl:'',to:''};
function taxiDay(){const T=S.taxi||(S.taxi={});if(T.d!==S.day){T.d=S.day;T.go=0;T.back=0;T.fx=0;T.fz=0;T.fl='';T.to=''}return T}
/* a name for a spot: the nearest map place within 30 m, else "where it picked you up" */
function taxiSpot(x,z){let b=null,bd=30;POIS.forEach(p=>{const d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;b=p[2]}});return b}
{const t0=taxi;taxi=function(x,z){if(IN)return;const T=taxiDay();
 if(T.back){snd('err');return say('You already used your taxi today. A new one comes tomorrow.')}
 if(T.go){snd('err');return say('Today\'s taxi only takes you back'+(T.fl?' to '+T.fl:'')+' now.')}
 const px=P.x,pz=P.z;t0(x,z);
 if(P.x!==px||P.z!==pz){T.go=1;T.fx=px;T.fz=pz;T.fl=taxiSpot(px,pz)||'';T.to=taxiSpot(P.x,P.z)||'';say('Your taxi will wait to take you back once today.')}}}
function taxiBack(){if(IN)return;const T=taxiDay();if(!T.go||T.back)return;const c=Math.round(Math.hypot(P.x-T.fx,P.z-T.fz)*.06);
 if(S.money<c){snd('err');return say('The ride back costs $'+c)}S.money=+(S.money-c).toFixed(2);T.back=1;P.x=T.fx;P.z=T.fz;camT.x=P.x;camT.z=P.z;closeUI();snd('whoosh');say('Taxi fare $'+c+'. That was today\'s taxi.')}
/* the map: before the trip every destination, after it only the ride back, after that nothing until tomorrow */
{const b0=bigMap;bigMap=function(){b0();const r=document.querySelector('#ui .row2');if(!$('bm')||!r)return;const T=taxiDay(),tb=[...r.querySelectorAll('button')].filter(b=>/^Taxi/.test(b.textContent));
 const note=document.createElement('p');note.className='m';note.style.margin='6px 0 0';
 if(!T.go)note.textContent='Taxi: one trip a day. Pick one place, then you can ride back once.';
 else{tb.forEach(b=>b.remove());if(!T.back){const bt=document.createElement('button');bt.textContent='Taxi back'+(T.fl?' to '+T.fl:'');bt.onclick=taxiBack;r.insertBefore(bt,r.lastElementChild);note.textContent='Your taxi took you'+(T.to?' to '+T.to:'')+' today. It can take you back once.'}
  else note.textContent='You used your taxi today, there and back. A new one comes tomorrow.'}
 r.before(note)}}
