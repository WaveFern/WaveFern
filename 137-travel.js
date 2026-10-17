/* ===== v43.4.0: shared travel state (TRAVEL) =====
   One global object every travel feature uses: the flight app and airport (138-airport.js), the World Tour app and the
   destination cities. Saved in S.travel; old saves get the defaults below on first use.
   S.travel = {loc, tickets:[], nid, trips:[], seen:{}}
     loc      'home' or a WT_DEST id (135-destinations.js): where the player is right now
     tickets  {id, fl, from, to, dep, arr, hrs, gate, seat, price, st, bd, ck}
              from/to are 'home' or WT_DEST ids, dep/arr are absolute game minutes (TRAVEL.now()), bd the day it was booked,
              st: 'booked' | 'flown' | 'missed' | 'cancelled', ck = checked in
     trips    finished flights [{from,to,day}] (newest last, capped)
   Time: the game clock (clk(), S.t 0..600 = 06:00..06:00 next day) is home time. TRAVEL.now() is absolute minutes:
   S.day*1440 + clock minutes, where clock minutes run 360..1800 (after midnight is still the same game day).
   Events (TRAVEL.on(name, fn)):
     'arrive'      (id, ticket)  the player has just stepped off a plane at id. Return true if you placed the player
                                 (city build, cutscene); otherwise they stand in the arrivals hall of the terminal.
     'exitAirport' (id)          the player walked out of the terminal's front doors while abroad. Return true if you placed
                                 them outside your city's airport; otherwise they stay inside.
     'depart'      (ticket)      the player has boarded and the plane is taking off.
     'missed'      (ticket)      a ticket was lost because its gate closed.
     'restore'     (id)          a career was loaded while abroad. Return true if you placed the player; otherwise they wait in
                                 that place's terminal.
   Abroad, a city calls TRAVEL.enterAirport() from its airport doors to walk into the terminal (same terminal everywhere,
   signed with the city's name). */
(function(){
const H={},
 dest=id=>{try{return id&&id!='home'?wtDest(id):null}catch(e){return null}};
function st(){if(!S.travel||typeof S.travel!='object')S.travel={};const t=S.travel;
 if(typeof t.loc!='string'||(t.loc!='home'&&!dest(t.loc)))t.loc='home';
 if(!Array.isArray(t.tickets))t.tickets=[];t.tickets=t.tickets.filter(k=>k&&typeof k=='object'&&isFinite(+k.dep));
 if(!Array.isArray(t.trips))t.trips=[];if(!t.seen||typeof t.seen!='object')t.seen={};t.nid=Math.max(1,+t.nid||1);return t}
const clockMin=t=>t<300?360+t/300*840:1200+(t-300)/300*600;
const tOf=m=>m<1200?(m-360)/840*300:300+(m-1200)/600*300;
const now=()=>(+S.day||1)*1440+clockMin(Math.max(0,Math.min(600,+S.t||0)));
const hm=a=>{const m=((Math.floor(a)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const dayOf=a=>Math.floor((a-360)/1440);/* the game day a moment belongs to (a day runs 06:00 to 06:00) */
const left=a=>{let m=Math.max(0,Math.round(a-now()));const d=Math.floor(m/1440);m-=d*1440;const h=Math.floor(m/60);m-=h*60;
 return(d?d+'d ':'')+(d||h?h+'h ':'')+m+'m'};
const place=id=>{const d=dest(id);return d?wtPlace(d):'Home'};
const city=id=>{const d=dest(id);return d?(d.city||d.country):'Home'};
const tz=id=>{const d=dest(id);return d?+d.tz||0:0};
/* local wall-clock time at a place, for a moment in home time */
const local=(a,id)=>hm(a+tz(id)*60);
const T={
 st,now,hm,dayOf,left,place,city,dest,tz,local,clockMin,tOf,
 loc:()=>st().loc,
 abroad:()=>st().loc!='home',
 here:()=>dest(st().loc),
 tickets:()=>st().tickets,
 active:()=>st().tickets.filter(k=>k.st=='booked').sort((a,b)=>a.dep-b.dep),
 on(ev,fn){(H[ev]=H[ev]||[]).push(fn)},
 emit(ev,...a){let done=false;(H[ev]||[]).forEach(f=>{try{if(f(...a))done=true}catch(e){console.error('travel '+ev,e)}});return done},
 /* move the player's location (after a flight). Returns true when a listener placed the player. */
 arrive(id,tk){const t=st();t.loc=id&&dest(id)?id:'home';if(tk){t.trips.push({from:tk.from,to:t.loc,day:S.day});if(t.trips.length>200)t.trips=t.trips.slice(-200)}
  return T.emit('arrive',t.loc,tk)},
 enterAirport(){if(typeof window.apEnter=='function')window.apEnter('front')}
};
window.TRAVEL=T;
/* default for new careers (snapshotted with the other defaults at boot) */
if(!S.travel)S.travel={loc:'home',tickets:[],nid:1,trips:[],seen:{}};
})();
