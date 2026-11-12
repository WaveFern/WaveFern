/* ---------- data ---------- */
/* ---------- tuning: income and pacing knobs in one place ----------
   payRate: $ per stream, paid when you wake up (was $0.03). Now $0.05: about 300 streams a day pays about $15.
   gearCost: multiplier on every gear price (0.8 = 20% cheaper). Balances in saves are not touched. */
const TUNE={payRate:.04,gearCost:1.6};
const GEN=['Hip-Hop','Rap','Pop','Rock','R&B','Lo-fi','Country','Electronic','Latin'];
const GEAR={chair:{n:'Chair',d:'Better songs',lv:['Wobbly stool','Office chair','Ergonomic chair',"Producer's throne"],c:[200,650,1800]},
mic:{n:'Microphone',d:'Much better vocals',lv:['Karaoke mic','USB condenser','Studio condenser','Tube mic'],c:[280,850,2400]},
guitar:{n:'Guitar',d:'Richer sound',lv:['Pawn-shop guitar','Acoustic','Semi-hollow','Custom electric'],c:[240,750,2100]},
promo:{n:'Promo',d:'More listeners find you',lv:['No promo','Social posters','Playlist pitching','Street team'],c:[350,1000,2800]}};
Object.values(GEAR).forEach(g=>g.c=g.c.map(v=>Math.round(v*TUNE.gearCost)));
const S={day:1,money:100,energy:100,t:0,artist:'',songs:[],drafts:[],gear:{chair:0,mic:0,guitar:0,promo:0},hist:[],followers:0,folNerf:1,listeners:0,streams:0,earn:0,hype:{},nid:1,dmLast:0,version:1};
GEN.forEach(g=>S.hype[g]=1);S.apps={};S.inv={};S.ipos={};S.wp=10;Object.assign(S,{noPhone:1,stam:100,appt:[],garage:0,cars:[],home:0,pets:[],guards:0,bling:0,interest:0,fans:0,msgs:[{id:0,from:'WaveFern Team',body:'Welcome! Upload songs to build your career. Collaboration invites will show up here once you get famous.',state:9}]});Object.assign(S.gear,{keys:0,drums:0,booth:0,decks:0});
/* career pacing (v26.16.0: slower start). Was: base .8, interest +.22 per release, listener bonus sqrt/60,
   old-song floor .03, viral 2% x2-5, $0.05 per stream, artist pays 60% of fee (min $15), collab boost 1.1 + up to .6 */
const PACE={base:.36,interest:.06,lisBonus:200,floor:.015,viralP:.012,viralMin:1.5,viralMax:3,collabPay:.25,collabMin:8,featBase:1.05,featMax:.3},PAY_RATE=TUNE.payRate;
/* experience (v26.108): every song you record has its quality multiplied by expMin..1. The multiplier climbs along 1 - e^(-xp/expScale),
   where xp = songs you have recorded + expFame per fame level. A new player records at 30% of their
   gear-and-skill quality; 200 songs gets about 60% of the way up. Collab songs use it too (the artist's own help is only partly scaled).
   viralP is the chance per release at Q90 or better (0.03%, about 1 in 3,300), falling with the cube of quality below that. */
/* song performance (v26.79). All the knobs for quality, collabs, hits and viral songs.
   quality: streams also scale by (q/qRef)^qPow, clamped to qMin..qMax (q 50 = x1, q 20 = about x0.48, q 100 = about x1.74).
   collab: a feature multiplies streams by fm^collabPow (fm already holds the collaborator's popularity and your chemistry), then by 1 + collabQ * min(1.5, q/100).
   hit: rolled once when a song is released. Chance hitP * clamp(q/hitQRef, hitQMin, hitQMax) (about 8% on average). A hit gets hitMin..hitMax times its normal streams, for its whole life.
   viral: rolled once on release, very rare. Chance viralP * min(1, q/viralQBest)^viralQPow (0.3% at Q90+, 0.075% at Q45).
     A viral song gets viralMin streams plus monthly listeners x viralLisMin..viralLisMax on top of its normal streams,
     paid out over viralDays days: viralShare of what is left each day, the rest on the last day.
   featured artist's fans (v26.104): every artist has a set monthly-listener count (ART row, a[2]). A collab also earns
     featLis x that artist's listeners per day from their fans, x quality factor, x your chemistry, decaying like any song (x1.5 on release day, x hit size on a hit).
     These streams sit outside the song's normal stream cap, so a feature with a big artist pays off even while you are small. */
const PERF={qRef:50,qPow:.8,qMin:.45,qMax:2.5,collabPow:2,collabQ:.5,hitP:.08,hitQRef:60,hitQMin:.5,hitQMax:1.6,hitMin:1.5,hitMax:2.5,viralP:.0003,viralQBest:90,viralQPow:3,viralMin:1e5,viralLisMin:1.5,viralLisMax:4,viralShare:.06,viralDays:90,featLis:.0004,expMin:.3,expScale:200,expFame:6};
const updateVersion=()=>S.version++;

