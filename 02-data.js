/* ---------- data ---------- */
const GEN=['Hip-Hop','Rap','Pop','Rock','R&B','Lo-fi','Country','Electronic'];
const GEAR={chair:{n:'Chair',d:'Better songs',lv:['Wobbly stool','Office chair','Ergonomic chair',"Producer's throne"],c:[200,650,1800]},
mic:{n:'Microphone',d:'Much better vocals',lv:['Karaoke mic','USB condenser','Studio condenser','Tube mic'],c:[280,850,2400]},
guitar:{n:'Guitar',d:'Richer sound',lv:['Pawn-shop guitar','Acoustic','Semi-hollow','Custom electric'],c:[240,750,2100]},
promo:{n:'Promo',d:'More listeners find you',lv:['No promo','Social posters','Playlist pitching','Street team'],c:[350,1000,2800]}};
const MEN=[[10,'Michael Jackson','Perfectionism and showmanship: rehearse until it feels effortless.'],[40,'Prince','Own your sound: learn every instrument in the room.'],[120,'Dolly Parton','Write honest songs. A plain story lands harder than a fancy one.'],[400,'Dr. Dre','Obsess over the mix. Details make the record.'],[1000,'Jimi Hendrix','Experiment fearlessly with tone and texture.']];
const S={day:1,money:100,energy:100,t:0,artist:'',songs:[],drafts:[],gear:{chair:0,mic:0,guitar:0,promo:0},hist:[],followers:0,listeners:0,streams:0,earn:0,hype:{},nid:1,version:1};
GEN.forEach(g=>S.hype[g]=1);S.apps={};S.inv={};S.ipos={};S.wp=10;Object.assign(S,{stam:100,appt:[],garage:0,cars:[],home:0,pets:[],guards:0,bling:0,interest:0,fans:0,msgs:[{id:0,from:'WaveFern Team',body:'Welcome! Upload songs to build your career. Collaboration invites will show up here once you get famous.',state:9}]});Object.assign(S.gear,{keys:0,drums:0,booth:0,decks:0});
const mentors=()=>MEN.filter(m=>S.listeners>=m[0]).length;
const updateVersion=()=>S.version++;

