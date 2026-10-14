/* ---------- data ---------- */
/* ---------- tuning: income and pacing knobs in one place ----------
   payRate: $ per stream, paid when you wake up (was $0.03). At $0.10 a day of about 300 streams pays about $30.
   gearCost: multiplier on every gear price (0.8 = 20% cheaper). Balances in saves are not touched. */
const TUNE={payRate:.10,gearCost:.8};
const GEN=['Hip-Hop','Rap','Pop','Rock','R&B','Lo-fi','Country','Electronic'];
const GEAR={chair:{n:'Chair',d:'Better songs',lv:['Wobbly stool','Office chair','Ergonomic chair',"Producer's throne"],c:[200,650,1800]},
mic:{n:'Microphone',d:'Much better vocals',lv:['Karaoke mic','USB condenser','Studio condenser','Tube mic'],c:[280,850,2400]},
guitar:{n:'Guitar',d:'Richer sound',lv:['Pawn-shop guitar','Acoustic','Semi-hollow','Custom electric'],c:[240,750,2100]},
promo:{n:'Promo',d:'More listeners find you',lv:['No promo','Social posters','Playlist pitching','Street team'],c:[350,1000,2800]}};
Object.values(GEAR).forEach(g=>g.c=g.c.map(v=>Math.round(v*TUNE.gearCost)));
const MEN=[[10,'Michael Jackson','Perfectionism and showmanship: rehearse until it feels effortless.'],[40,'Prince','Own your sound: learn every instrument in the room.'],[120,'Dolly Parton','Write honest songs. A plain story lands harder than a fancy one.'],[400,'Dr. Dre','Obsess over the mix. Details make the record.'],[1000,'Jimi Hendrix','Experiment fearlessly with tone and texture.']];
const S={day:1,money:100,energy:100,t:0,artist:'',songs:[],drafts:[],gear:{chair:0,mic:0,guitar:0,promo:0},hist:[],followers:0,listeners:0,streams:0,earn:0,hype:{},nid:1,version:1};
GEN.forEach(g=>S.hype[g]=1);S.apps={};S.inv={};S.ipos={};S.wp=10;Object.assign(S,{stam:100,appt:[],garage:0,cars:[],home:0,pets:[],guards:0,bling:0,interest:0,fans:0,msgs:[{id:0,from:'Spotifly Team',body:'Welcome! Upload songs to build your career. Collaboration invites will show up here once you get famous.',state:9}]});Object.assign(S.gear,{keys:0,drums:0,booth:0,decks:0});
/* career pacing (v26.16.0: slower start). Was: base .8, interest +.22 per release, listener bonus sqrt/60,
   old-song floor .03, viral 2% x2-5, $0.05 per stream, artist pays 60% of fee (min $15), collab boost 1.1 + up to .6 */
const PACE={base:.36,interest:.06,lisBonus:200,floor:.015,viralP:.012,viralMin:1.5,viralMax:3,collabPay:.25,collabMin:8,featBase:1.05,featMax:.3},PAY_RATE=TUNE.payRate;
/* song performance (v26.79). All the knobs for quality, collabs, hits and viral songs.
   quality: streams also scale by (q/qRef)^qPow, clamped to qMin..qMax (q 50 = x1, q 20 = about x0.48, q 100 = about x1.74).
   collab: a feature multiplies streams by fm^collabPow (fm already holds the collaborator's popularity and your chemistry), then by 1 + collabQ * min(1.5, q/100).
   hit: rolled once when a song is released. Chance hitP * clamp(q/hitQRef, hitQMin, hitQMax) (about 8% on average). A hit gets hitMin..hitMax times its normal streams, for its whole life.
   viral: rolled once on release, very rare. Chance viralP * min(1, q/viralQBest)^viralQPow (0.3% at Q90+, 0.075% at Q45).
     A viral song gets viralMin streams plus monthly listeners x viralLisMin..viralLisMax on top of its normal streams,
     paid out over viralDays days: viralShare of what is left each day, the rest on the last day. */
const PERF={qRef:50,qPow:.8,qMin:.3,qMax:2.5,collabPow:2,collabQ:.5,hitP:.08,hitQRef:60,hitQMin:.5,hitQMax:1.6,hitMin:3,hitMax:6,viralP:.003,viralQBest:90,viralQPow:2,viralMin:5e6,viralLisMin:20,viralLisMax:50,viralShare:.3,viralDays:14};
const mentors=()=>MEN.filter(m=>S.listeners>=m[0]).length;
const updateVersion=()=>S.version++;

