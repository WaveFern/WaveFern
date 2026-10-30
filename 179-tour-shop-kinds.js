/* ---------- v49.27.0: tour city shops are what their sign says ----------
   Every shopfront in a tour city used to open into one of nine rooms picked at random when its name was not in a short
   list, so a Laundry could be a corner shop, a sushi bar a souvenir shop and a music shop a bookshop. Now:
   - kindOf reads the name (in every language the cities use, plus the brand fronts) and picks the matching room; the same
     front always opens the same room
   - fourteen new rooms behind the fronts that had none: bakery, laundromat, barber, florist, cinema, arcade, karaoke,
     bar, market, electronics, ice cream / juice / sweets, massage, beauty and bike shop, each with its own goods
   - restaurants serve what the sign says (pizza, tacos, noodles, sushi, burgers, grill), cafés and tea houses differ,
     bookshops sell books, boutiques and shoe shops sell real clothes for your wardrobe, pharmacies sell remedies
   - the rooms sit on a dark floor instead of the city's grass, and the top-left label says where you are */
(function(){
const D=window.DCITY;if(!D||!D.RM)return;
const OX=4000,OZ=-4000,RM=D.RM;
Object.assign(RM,{bakery:[1300,-60,12,10],laundry:[1330,-60,12,10],barber:[1360,-60,12,10],flowers:[1390,-60,12,10],cinema:[1420,-60,16,12],arcade:[1450,-60,14,11],karaoke:[1480,-60,12,10],
 bar:[1300,-90,14,10],market:[1330,-90,14,11],tech:[1360,-90,12,10],sweets:[1390,-90,12,9],spa:[1420,-90,12,10],beauty:[1450,-90,12,10],bikes:[1480,-90,12,10]});
Object.assign(D.KN,{bakery:'the bakery',laundry:'the laundromat',barber:'the barber',flowers:'the florist',cinema:'the cinema',arcade:'the arcade',karaoke:'the karaoke bar',bar:'the bar',
 market:'the market',tech:'the electronics shop',sweets:'the sweet shop',spa:'the massage parlour',beauty:'the beauty shop',bikes:'the bike shop',office:'the office lobby'});

/* ---------- what is behind a name ---------- */
/* [pattern, room, sub-kind]; the first match wins, so the narrow ones come first */
const KINDS=[
 [/^(laundry|laverie|lavander[ií]a|lavanderia|wäscherei|wasserette|tvätt|コインランドリー|빨래방|洗衣)/i,'laundry'],
 [/^(barber|peluquer|barbear|friseur|kapper|fris[öo]r|kinyozi|coiffeur|barbiere|床屋|이발|理发)/i,'barber'],
 [/^(flowers|florist|flor[ie]|fleur|blumen|fiori|bloemen|blommor|花屋|꽃)/i,'flowers'],
 [/^(cinema|cin[eé](ma)?|kino|bioscoop|bio|सिनेमा|映画|영화|电影)$/i,'cinema'],
 [/^(arcade|ゲーム|게임|game|games)$/i,'arcade'],
 [/^(カラオケ|노래방|karaoke|ktv)$/i,'karaoke'],
 [/^(bar|kneipe|enoteca|pub|居酒屋|酒吧)$/i,'bar'],
 [/^(nuad|นวด|massage|spa)$/i,'spa'],
 [/^(화장품|عطور|luma|perfum|cosm)/i,'beauty'],
 [/^(fietsen|bikes?|cykel|bicic)/i,'bikes'],
 [/^(電気|fernphone|pixelcam|electr)/i,'tech'],
 [/^(juice bar|عصير|açaí|acai)$/i,'sweets','juice'],
 [/^(helader[ií]a|gelateria|sorveteria|glass|zing)$/i,'sweets','ice'],
 [/^(حلويات|मिठाई|ขนม|churrer[ií]a|sweets)$/i,'sweets','sweets'],
 [/^(bakery|boulangerie|panader[ií]a|padaria|bäckerei|panetteria|bakkerij|bageri|مخبز|mikate|パン|빵집|bagels|pâtisserie|pasticceria|pastelaria)$/i,'bakery'],
 [/^(fromagerie|kaas)$/i,'market','cheese'],
 [/^(frutería|matunda|फल|ผลไม้|buah|fruit)$/i,'market','fruit'],
 [/^(market|mercado|markt|mercato|torg|soko|pasar|ตลาด|बाज़ार|سوق|मसाले|spices?)$/i,'market','market'],
 [/^(pizza|pizzeria)$/i,'food','pizza'],[/^(tacos|taquer[ií]a)$/i,'food','tacos'],[/^(burgers?|diner)$/i,'food','burger'],[/^(寿司|sushi)$/i,'food','sushi'],
 [/^(noodles|ラーメン|うどん|面馆|ก๋วยเตี๋ยว|bakso)$/i,'food','noodle'],[/^(焼肉|고기|nyama choma|sate|치킨|döner|شاورما|فلافل)$/i,'food','grill'],
 [/^(chai|चाय|茶馆|teahouse|tea)$/i,'cafe','tea'],
 [/^(coffee|caf[eé]|caffè|kaf[eé]|fika|kopi|カフェ|喫茶|카페|咖啡|ร้านกาแฟ|مقهى|starbrew)$/i,'cafe'],
 [/^(records|discos|disquaire|plattenladen|platen|skivor|dischi|muziki|musik|音楽|음악|音乐|संगीत|เพลง|wavefern)$/i,'records'],
 [/^(books|librer[ií]a|livraria|librairie|buchhandlung|libreria|boekhandel|bokhandel|كتب|书店|書店|本屋|서점|किताबें|ร้านหนังสือ)$/i,'books'],
 [/^(pharmacy|farmacia|farmácia|pharmacie|apotheke|apotheek|apotek|dawa|दवाखाना|صيدلية|ร้านขายยา|薬局|약국|药店)$/i,'pharm'],
 [/^(sneakers|zapater[ií]a|जूते)$/i,'cloth','shoes'],[/^(vintage|thrift)$/i,'cloth','vintage'],
 [/^(ملابس|कपड़े|服装|batik|kiko|boutique|fashion|moda)$/i,'cloth'],
 [/^(コンビニ|편의점|超市|neomart|tienda|mercearia|épicerie|kiosk|späti|tabac|tabacchi|duka|toko|skycola|bolt bull|store|shop)$/i,'conv'],
 [/^(nova air)$/i,'office'],
 [/^(souvenir|gift|土産|기념품|纪念|craft|bazaar|souk)/i,'souv']];
/* the rest are places to eat: diners, delis, bistros, dhabas, warungs, izakaya-style grills and so on */
const EAT=/deli|bistro|brasserie|trattoria|imbiss|lanchonete|mkahawa|مطعم|ढाबा|warung|분식|crêperie|frites|饺子|火锅|点心|包子|ข้าวผัด|うどん|tacos|crêpe|churr/i;
function hsh(s){let h=7;for(const c of String(s))h=(h*31+c.codePointAt(0))>>>0;return h}
D.kindOf=function(C,dr){const n=String(dr.n||'').trim(),m=KINDS.find(([r])=>r.test(n));if(m){dr.sub=m[2]||'';return m[1]}
 dr.sub='';if(EAT.test(n))return'food';/* an unknown name: a tall building is an office lobby now and then, the rest are places to eat or drink */
 const h=hsh(C.id+'|'+n);if(dr.tall&&h%3==0)return'office';return['food','food','food','cafe'][h%4]};

/* ---------- small helpers ---------- */
const place=C=>C.d.city||C.d.country;
function daily(C,what){S.dcity=S.dcity||{};const k=what+'|'+C.id,d=S.dcity.dly=S.dcity.dly||{};if(d[k]===S.day)return false;d[k]=S.day;return true}
function fans(base,k){const f=Math.round(base+Math.sqrt(S.listeners||0)*(k||.2));S.followers=(S.followers||0)+f;return f}
function pay(p){if(S.money<p){snd('err');say('Not enough money for that.');return false}S.money=+(S.money-p).toFixed(2);return true}
function pass(units){S.t=Math.min(599,S.t+units)}
const HOUR=()=>S.t<300?21:30;
/* a menu of things to eat or drink: [name, price, energy, refills stamina] */
function eatMenu(title,greet,items){GR=greet;shopModal(title,()=>items.map(m=>[esc(m[0]),m[1],'+'+m[2]+' energy'+(m[3]?' · refills stamina':'')]),i=>{const m=items[i];if(!m[3]&&S.energy>=100){snd('err');return say('You are already full of energy.')}if(!pay(m[1]))return;
 S.energy=Math.min(100,S.energy+m[2]);if(m[3]){S.stam=100;S.exh=0}snd('eat');say('Yum! '+m[0]+' · +'+m[2]+' energy')})}
/* things to keep: [name, price, line]; they go on a list of things bought abroad */
function keepMenu(C,title,greet,items){GR=greet;S.dcity=S.dcity||{};const own=n=>(S.dcity.buys||[]).includes(C.id+':'+n);
 shopModal(title,()=>items.map(x=>[esc(x[0]),x[1],own(x[0])?'Owned':x[2]]),i=>{const x=items[i];if(own(x[0]))return snd('err');if(!pay(x[1]))return;(S.dcity.buys=S.dcity.buys||[]).push(C.id+':'+x[0]);snd('cash');say('Bought: '+x[0])})}
const shopName=(dr,def)=>(dr&&dr.n)||def;

/* ---------- menus that match the sign ---------- */
const CUISINE={pizza:[['Margherita slice',5,8],['Pepperoni pizza',12,16],['Garlic knots',4,5],['Lemon soda',3,3,1]],
 tacos:[['Tacos al pastor',8,12],['Quesadilla',6,9],['Churros',4,5],['Horchata',3,3,1]],
 burger:[['Cheeseburger',9,13],['Fries',4,6],['Hot dog',5,7],['Milkshake',5,5,1]],
 sushi:[['Salmon nigiri set',14,15],['Maki rolls',10,12],['Miso soup',4,5],['Green tea',3,3,1]],
 noodle:[['Bowl of ramen',12,16],['Udon',10,13],['Gyoza',6,7],['Iced tea',3,3,1]],
 grill:[['Grilled meat platter',16,20],['Skewers',8,10],['Flatbread',3,4],['Cold soft drink',3,3,1]]};
const BAKE={fr:['Croissant','Pain au chocolat','Baguette'],de:['Pretzel','Apple strudel','Rye roll'],it:['Cornetto','Focaccia','Cannolo'],es:['Churros','Pan dulce','Ensaimada'],pt:['Pão de queijo','Pastel de nata','Bread roll'],
 nl:['Stroopwafel','Apple pie slice','Krentenbol'],sv:['Cinnamon bun','Cardamom bun','Princess cake'],ja:['Melon pan','Anpan','Curry bun'],ko:['Red bean bread','Soboro bun','Castella'],zh:['Egg tart','Pineapple bun','Steamed bun'],
 hi:['Naan','Samosa','Nankhatai'],ar:["Ka'ak",'Baklava','Manakish'],th:['Coconut pastry','Pandan cake','Roti'],id:['Martabak','Roti bakar','Kue lapis'],sw:['Mandazi','Chapati','Sweet bun'],en:['Bagel','Blueberry muffin','Sourdough slice']};
const SWEET={ar:['Kunafa','Baklava','Basbousa'],hi:['Gulab jamun','Jalebi','Barfi'],th:['Mango sticky rice','Khanom krok','Thong yip'],es:['Churros','Turrón','Alfajor'],pt:['Brigadeiro','Pastel de nata','Quindim'],
 ja:['Mochi','Dorayaki','Taiyaki'],ko:['Hotteok','Bingsu','Yakgwa'],zh:['Mooncake','Tangyuan','Egg tart'],en:['Fudge','Toffee apple','Brownie']};
const TEA={zh:[['Oolong tea',4,4,1],['Jasmine tea',4,4,1],['Mooncake',5,6]],hi:[['Masala chai',2,3,1],['Ginger chai',2,3,1],['Samosa',3,5]],sw:[['Chai',2,3,1],['Mandazi',3,5],['Spiced tea',3,3,1]],en:[['Pot of tea',4,4,1],['Scone',4,5],['Iced tea',4,3,1]]};
D.menuFor=function(C,dr){const F=D.food(C.id),k=dr.k,sub=dr.sub;
 if(k=='food')return CUISINE[sub]||F;
 if(k=='cafe'){if(sub=='tea')return TEA[C.s.lang]||TEA.en;return[F[2],['Coffee',4,5,1],['Cake',6,8],['Toastie',6,8]].filter(Boolean)}
 return null};
{const s0=D.shop;D.shop=function(C,sp){try{const dr=D.door;if(sp&&dr&&(sp.k=='food'||sp.k=='cafe')){const m=D.menuFor(C,dr);if(m&&m!==D.food(C.id)){const cf=dr.k=='cafe';
   return eatMenu((cf?'☕ ':'🍽 ')+esc(dr.n)+' <small class=m>· '+esc(place(C))+'</small>','"'+D.words(C.s.lang).hi+'! '+(cf?'What can I get you?':'Take a seat, here is the menu.')+'"',m)}}
  if(sp&&sp.k=='books')return keepMenu(C,'📚 '+esc(shopName(dr,'Bookshop')),'"Have a look around. The local writers are on the front table."',[['Poetry from '+place(C),12,'A slim book of local poems'],['Phrasebook',6,'Say more than hello next time'],['City guide',9,'Every street of '+place(C)],['Songwriting notebook',8,'Blank pages for lyrics']]);
  if(sp&&sp.k=='cloth')return clothes(C,dr);
  if(sp&&sp.k=='pharm')return eatMenu('💊 '+esc(shopName(dr,'Pharmacy')),'"Hello! Singers always ask for the throat sweets."',[['Throat sweets',3,3,1],['Vitamin drink',4,6,1],['Energy tablets',6,10],['Bottle of water',2,2,1]])}catch(e){console.error('tour shop',e)}
 return s0.apply(this,arguments)}}
/* boutiques and shoe shops sell real clothes from the game's catalogue; they go to your wardrobe at home */
function clothes(C,dr){const sub=dr&&dr.sub,slots=sub=='shoes'?['sh']:sub=='vintage'?['jk','top','ht','bt']:['top','jk','ht','bt','sh'];
 const pool=(typeof GAR!='undefined'?GAR:[]).filter(g=>slots.includes(g.slot));if(!pool.length)return keepMenu(C,esc(shopName(dr,'Boutique')),'"Welcome!"',[['Local T-shirt',28,'A keepsake']]);
 const h=hsh(C.id+(dr&&dr.n)),it=[];for(let i=0;i<6&&it.length<Math.min(6,pool.length);i++){const g=pool[(h+i*37)%pool.length];if(!it.includes(g))it.push(g)}
 const off=sub=='vintage'?.6:1,price=g=>Math.max(5,Math.round(g.p*off));
 GR=sub=='shoes'?'"Fresh pairs in this week."':sub=='vintage'?'"Everything here has a story. And a lower price."':'"Hello! Everything is from local designers."';
 shopModal((sub=='shoes'?'👟 ':'👕 ')+esc(shopName(dr,'Boutique')),()=>it.map(g=>[esc(g.n),price(g),(S.wr||[]).includes(g.id)?'Owned':'Goes to your wardrobe at home']),i=>{const g=it[i];S.wr=S.wr||[];if(S.wr.includes(g.id))return snd('err');if(!pay(price(g)))return;
  S.wr.push(g.id);S.wc=S.wc||{};S.wc[g.id]=(typeof THC!='undefined'&&THC[g.id])||g.dc;snd('cash');say('Bought '+g.n+'. It is in your wardrobe at home.')})}

/* ---------- room kit ---------- */
function staff(rm,x,z,ry){let o;try{o=buildChar(fCfg())}catch(e){return}o.g.position.set(OX+x,0,OZ+z);o.g.rotation.y=ry||0;scene.add(o.g);rm.extra.push(o.g);rm.cols.push([x-.3,z-.3,x+.3,z+.3])}
function chair(rm,x,z,c,ry){const b=ry?-.32:.32;rm.box(.7,.08,.7,c,x,.5,z);if(ry)rm.box(.08,.7,.7,c,x+b,.85,z);else rm.box(.7,.7,.08,c,x,.85,z-b);[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([a,b2])=>rm.box(.06,.5,.06,'#333',x+a,.25,z+b2))}
function table(rm,x,z,w,d,c){rm.box(w,.08,d,c,x,.78,z,1);rm.box(.12,.74,.12,'#333',x,.37,z)}
function plant(rm,x,z){rm.box(.6,.6,.6,'#8a5a3a',x,.3,z,1);rm.box(.9,1,.9,'#3a8a4a',x,1.1,z);rm.box(.5,.6,.5,'#4a9a5a',x,1.8,z)}
function stool(rm,x,z,c){rm.box(.5,.1,.5,c,x,.8,z);rm.box(.08,.76,.08,'#2a2a2a',x,.38,z);rm.box(.4,.04,.4,'#2a2a2a',x,.3,z);rm.cols.push([x-.25,z-.25,x+.25,z+.25])}
/* walls, trim, ceiling lights, a clock, a window on the left wall, a name sign on the back wall and the mat at the door */
function kit(C,key,o){const[x0,z0,w,d]=RM[key],rm=D.mkRoom(key,x0,z0,w,d,Object.assign({h:4},o));if(!rm)return null;const wc=o.wall,tr=dk(wc,.75),back=z0+.2,cx=x0+w/2;
 rm.box(w,.2,.1,tr,cx,.1,back);rm.box(.1,.2,d,tr,x0+.2,.1,z0+d/2);rm.box(w,.14,.16,dk(wc,.9),cx,3.93,back);rm.box(.16,.14,d,dk(wc,.9),x0+.2,3.93,z0+d/2);
 if(!o.dim){for(let x=x0+2;x<x0+w-2;x+=3.6){rm.box(.3,.12,.14,dk(wc,.7),x,2.72,back+.08);rm.glow(.22,.4,.12,o.lamp||'#ffd890',x,2.95,back+.1)}for(let z=z0+3;z<z0+d-1;z+=4.2){rm.box(.14,.12,.3,dk(wc,.7),x0+.28,2.72,z);rm.glow(.12,.4,.22,o.lamp||'#ffd890',x0+.3,2.95,z)}}
 if(!o.nowin){const zc=z0+d*.55;rm.sign('x',x0+.08,zc-1.1,zc+1.1,1.2,3,160,128,(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,C.s.sky||'#8ec8ee');g.addColorStop(1,'#e4f2fb');c.fillStyle=g;c.fillRect(0,0,W,H);
  for(let i=0;i<10;i++){const ww=10+(i*37%18),hh=20+(i*53%60),xx=i*W/10;c.fillStyle=i%2?'#8a9aaa':'#6a7a8c';c.fillRect(xx,H-hh,ww,hh)}c.strokeStyle='#f4efe6';c.lineWidth=7;c.strokeRect(0,0,W,H);c.beginPath();c.moveTo(W/2,0);c.lineTo(W/2,H);c.stroke()},'kwin');
  rm.box(.12,.1,2.4,'#f4efe6',x0+.14,1.12,zc);rm.box(.12,.1,2.4,'#f4efe6',x0+.14,3.08,zc)}
 if(!o.noclock){rm.box(.55,.55,.06,'#3a2a1a',x0+w-1.6,3.3,back+.1);rm.box(.46,.46,.04,'#f8f6f0',x0+w-1.6,3.3,back+.13);rm.box(.04,.18,.03,'#111',x0+w-1.6,3.35,back+.16);rm.box(.14,.04,.03,'#111',x0+w-1.55,3.3,back+.16)}
 rm.title=(t,a,b,y0,y1,opt)=>rm.sign('z',back+.09,a,b,y0,y1,256,64,(c,W,H)=>D.signArt(c,W,H,t,opt||{bg:'#1a1426',fg:C.s.neon||'#ffd23d',neon:1}));
 rm.box(2,.05,1,'#7a3a2a',cx,.03,z0+d-.6);rm.int(cx,z0+d-.6,1.4,'Go back outside',()=>{const dr=D.door;if(!dr)return;D.goOut(dr.x+(dr.face=='x'?.6:0),dr.z+(dr.face=='x'?0:.6),dr.face=='x'?Math.PI/2:0)});
 Object.assign(rm,{x0,z0,w,d,cx,back,front:z0+d});return rm}
/* GN: the room's own name, for signs built once per city; NM: the name on the door you came through, for menus */
const GN=k=>D.KN[k].replace(/^the /,''),NM=k=>(D.door&&D.door.k==k&&D.door.n)||GN(k);

/* ---------- the new rooms ---------- */
const ROOMS={
 bakery(C,rm){const{x0,z0,w,d,cx,back}=rm,wd='#8a5a32',bread=['#d9a441','#c98a5a','#e8c88a','#a8682b','#f0d8a0'],L=BAKE[C.s.lang]||BAKE.en;
  /* bread wall: wooden shelves full of loaves */
  rm.box(w-4.5,2.6,.6,wd,x0+w/2-1,1.3,back+.35,1);for(let r=0;r<4;r++){rm.box(w-4.6,.06,.62,dk(wd,.8),x0+w/2-1,.45+r*.6,back+.4);for(let i=0;i<10;i++)rm.box(.5,.22,.3,bread[(i+r)%5],x0+2.6+i*(w-5.8)/9,.6+r*.6,back+.5)}
  /* oven in the corner */
  rm.box(2.2,2.4,1.6,'#a8543a',x0+w-1.5,1.2,back+.9,1);rm.box(1.2,.6,.1,'#2a1a14',x0+w-1.5,1.1,back+1.72);rm.glow(1,.4,.05,'#ff8a30',x0+w-1.5,1.05,back+1.75);rm.box(.5,1.6,.5,'#8a8e94',x0+w-1.5,3.2,back+.8);
  /* glass counter full of pastries, the baker behind it */
  rm.box(6,1,1,'#a87a4a',x0+4.6,.5,z0+3.2,1);rm.glow(5.8,.4,.04,'#fff6e0',x0+4.6,.75,z0+3.72);rm.box(6,.06,1.04,'#cfe8f4',x0+4.6,1.03,z0+3.2);
  for(let i=0;i<12;i++)rm.box(.34,.16,.3,bread[i%5],x0+2+(i%6)*.95,.7+(i>5?.25:0),z0+3.2+(i>5?-.2:.2));rm.box(.6,.5,.5,'#f4f0e8',x0+6.8,1.3,z0+3.1);rm.box(.5,.3,.4,'#e86a8a',x0+6.8,1.7,z0+3.1);rm.box(.5,.08,.5,'#f4f0e8',x0+6.8,1.06,z0+3.1);
  rm.box(.5,.4,.4,'#333',x0+2.2,1.25,z0+3.1);staff(rm,x0+4.6,z0+2.1,0);
  /* flour sacks, a chalk board and a table by the window */
  [0,1,2].forEach(i=>rm.box(.7,.8-i*.1,.5,'#f0e8d8',x0+.8,.4,z0+5.2+i*.6,1));rm.title(GN('bakery').toUpperCase(),x0+2,x0+w-4.5,3.05,3.75,{bg:'#3a2414',fg:'#ffd890'});
  rm.sign('z',back+.12,x0+w-4.2,x0+w-2.8,1.4,2.6,96,96,(c,W,H)=>{c.fillStyle='#22302a';c.fillRect(0,0,W,H);c.fillStyle='#f4f1e8';c.font='12px sans-serif';L.forEach((t,i)=>c.fillText(t.slice(0,12),6,24+i*22));c.strokeStyle='#7a5432';c.lineWidth=6;c.strokeRect(0,0,W,H)});
  table(rm,x0+2.2,z0+7.4,1.1,1.1,'#c8a878');chair(rm,x0+1.2,z0+7.4,'#7a4a2a',1);chair(rm,x0+3.2,z0+7.4,'#7a4a2a',1);plant(rm,x0+w-1,z0+d-2);
  rm.int(x0+4.6,z0+4.4,1.8,'Buy bread and pastries',()=>eatMenu('🥐 '+esc(NM('bakery')),'"'+D.words(C.s.lang).hi+'! Fresh out of the oven."',[[L[0],4,6],[L[1],5,7],[L[2],3,5],['Coffee',4,4,1]]))},
 laundry(C,rm){const{x0,z0,w,d,cx,back}=rm;
  /* a row of washers on the back wall, dryers stacked on the left */
  for(let i=0;i<6;i++){const x=x0+1.6+i*1.25;rm.box(1.1,1.2,.9,'#e8ecf0',x,.6,back+.55,1);rm.box(.7,.7,.04,'#9aa8b4',x,.62,back+1.02);rm.box(.5,.5,.04,'#3a5a7a',x,.62,back+1.05);rm.glow(.1,.06,.03,i%3?'#2ecc71':'#e8c040',x+.4,1.1,back+1.02);
   if(i%2==0)rm.box(.36,.36,.03,'#8ac8e8',x,.62,back+1.08)}
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){const z=z0+3+i*1.3;rm.box(.9,1.1,1.1,'#d8dce0',x0+.65,.55+j*1.12,z,1);rm.box(.04,.7,.7,'#3a3a40',x0+1.12,.6+j*1.12,z);rm.glow(.03,.5,.5,j?'#ffb060':'#5a6a7a',x0+1.15,.6+j*1.12,z)}
  /* folding table with piles of clothes, a basket on wheels, a soap machine and the waiting chairs */
  rm.box(3,.1,1.2,'#c8ccd0',x0+w-2.4,.9,z0+4,1);rm.box(.1,.85,1,'#8a8e94',x0+w-3.7,.45,z0+4);rm.box(.1,.85,1,'#8a8e94',x0+w-1.1,.45,z0+4);
  ['#e84a6a','#3a6ab8','#f4f4f4','#e8c040','#2a2a2a'].forEach((c,i)=>rm.box(.6,.12,.5,c,x0+w-3.4+(i%3)*.9,1.02+(i>2?.12:0),z0+4+(i>2?.2:-.2)));
  rm.box(.8,.7,.6,'#c8ccd0',x0+w-2.2,.55,z0+6.4,1);rm.box(.7,.2,.5,'#3a6ab8',x0+w-2.2,.95,z0+6.4);[[-.3,-.2],[.3,-.2],[-.3,.2],[.3,.2]].forEach(([a,b])=>rm.box(.08,.16,.08,'#333',x0+w-2.2+a,.08,z0+6.4+b));
  rm.box(.9,1.8,.7,'#3b82f6',x0+w-.6,.9,z0+2.4,1);rm.glow(.04,.5,.4,'#e8f6ff',x0+w-1.06,1.3,z0+2.4);for(let i=0;i<4;i++)rm.box(.04,.12,.08,['#e84a3a','#2ecc71','#e8c040','#f4f4f4'][i],x0+w-1.06,.9,z0+2.15+i*.16);
  for(let i=0;i<4;i++){rm.box(.55,.08,.55,'#e8c040',x0+2+i*.75,.5,z0+d-2.4);rm.box(.55,.5,.08,'#e8c040',x0+2+i*.75,.8,z0+d-2.1);rm.box(.06,.46,.06,'#555',x0+2+i*.75,.23,z0+d-2.4)}rm.cols.push([x0+1.6,z0+d-2.8,x0+4.8,z0+d-2]);
  rm.sign('z',back+.12,x0+w-2.4,x0+w-.8,1.8,2.8,96,64,(c,W,H)=>{c.fillStyle='#c8a878';c.fillRect(0,0,W,H);[['#f4f4f4',6,6],['#ffe066',40,10],['#a8e0ff',20,32],['#ffb0c0',58,34]].forEach(([k,x,y])=>{c.fillStyle=k;c.fillRect(x,y,28,22)})});
  rm.title(GN('laundry').toUpperCase(),x0+2,x0+8,3.1,3.75,{bg:'#e8f4ff',fg:'#3b82f6'});staff(rm,x0+w-2.4,z0+3,0);
  rm.int(x0+5,back+1.8,1.8,'Wash and dry your clothes',()=>{if(!pay(6))return;pass(10);S.energy=Math.min(100,S.energy+5);snd('pop');say('Washed and dried. Fresh clothes for the next show · +5 energy · '+clk())});
  rm.int(x0+3.2,z0+d-2.9,1.4,'Sit and wait',()=>{pass(HOUR()/2);S.energy=Math.min(100,S.energy+6);snd('pop');say('The machines hum. You rest for half an hour · +6 energy · '+clk())})},
 barber(C,rm){const{x0,z0,w,d,back}=rm;
  /* three chairs facing mirrors on the back wall */
  for(let i=0;i<3;i++){const x=x0+2+i*3;rm.box(2,1.6,.06,'#cfe0f0',x,2,back+.12);rm.box(2.2,1.8,.04,'#3a2a1a',x,2,back+.08);rm.box(2.4,.08,.5,'#e8e0d0',x,.95,back+.35);rm.box(2.4,.9,.45,'#6a4a3a',x,.47,back+.35,1);
   for(let k=0;k<4;k++)rm.box(.1,.22,.1,['#3a6ab8','#e8c040','#e84a3a','#f4f4f4'][k],x-.6+k*.35,1.1,back+.35);
   rm.box(.8,.18,.8,'#c0392b',x,.55,z0+2.2,1);rm.box(.8,.7,.15,'#c0392b',x,.95,z0+2.6);rm.box(.5,.4,.5,'#c8ccd0',x,.25,z0+2.2);rm.box(.15,.3,.6,'#c0392b',x-.4,.75,z0+2.2);rm.box(.15,.3,.6,'#c0392b',x+.4,.75,z0+2.2)}
  /* hair on the floor, a barber pole, the waiting bench and magazines */
  for(let i=0;i<9;i++)rm.box(.1,.01,.04,'#3a2a1a',x0+1.5+(i*1.7%7),.012,z0+1.6+(i*.53%1.4));
  rm.box(.3,1.6,.3,'#f4f4f4',x0+w-.5,1.6,back+.4);for(let k=0;k<5;k++)rm.box(.32,.14,.32,k%2?'#3a6ab8':'#e84a3a',x0+w-.5,1+k*.3,back+.4);
  rm.box(.7,.45,3,'#5a3a2a',x0+.8,.23,z0+6,1);rm.box(.2,.6,3,'#5a3a2a',x0+.4,.75,z0+6);table(rm,x0+.9,z0+8.2,.8,.8,'#8a6a4a');rm.box(.5,.04,.4,'#e84a6a',x0+.9,.84,z0+8.2);
  rm.box(1.8,1,.8,'#3a2a1a',x0+w-1.6,.5,z0+6,1);rm.box(.4,.3,.3,'#333',x0+w-1.6,1.15,z0+6);plant(rm,x0+w-1,z0+d-1.6);
  staff(rm,x0+3.2,z0+2.6,Math.PI);rm.title(GN('barber').toUpperCase(),x0+2,x0+9,3.05,3.75,{bg:'#f4f4f4',fg:'#c0392b'});
  rm.int(x0+5,z0+3.6,1.8,'Get a haircut',()=>{if(typeof barbOpen=='function'){mode='play';barbOpen()}else say('The barber is busy. Come back later.')})},
 flowers(C,rm){const{x0,z0,w,d,back}=rm,F=['#ff6ad5','#ffe066','#e03a3a','#b07aff','#ff8a30','#ffffff','#e84a6a'];
  const bucket=(x,z,c)=>{rm.box(.5,.5,.5,'#8a9096',x,.25,z);for(let k=0;k<5;k++){rm.box(.04,.6,.04,'#3a8a4a',x-.15+k*.08,.75,z);rm.box(.18,.16,.18,c,x-.15+k*.08,1.08+(k%2)*.08,z+(k%2?.06:-.06))}};
  for(let i=0;i<8;i++)bucket(x0+1.2+i*1.15,back+.5,F[i%F.length]);rm.cols.push([x0+.9,back+.2,x0+10.4,back+.8]);
  /* a stepped stand in the middle-left: three tiers going back and up, each with its own row of pots */
  [0,1,2].forEach(s=>{const z=z0+5.1-s*.5,h=.35+s*.35;rm.box(2.6,h,.5,s%2?'#7a4a2a':'#8a5a32',x0+3,h/2,z,s==0);rm.box(2.64,.05,.54,'#5a3a1e',x0+3,h+.02,z);
   for(let k=0;k<5;k++){const x=x0+2.05+k*.48;rm.box(.26,.24,.26,'#c86a3a',x,h+.17,z);rm.box(.3,.05,.3,'#a8542a',x,h+.31,z);rm.box(.05,.16,.05,'#3a8a4a',x,h+.42,z);rm.box(.24,.16,.24,F[(k*2+s)%7],x,h+.56,z);rm.box(.1,.1,.1,'#ffe066',x,h+.6,z+.08)}});
  rm.cols.push([x0+1.7,z0+3.8,x0+4.3,z0+5.4]);
  rm.box(.06,1.8,.06,'#3a8a4a',x0+.3,2.6,z0+7);for(let k=0;k<3;k++){const x=x0+1.6+k*2;rm.box(.03,.62,.03,'#555',x,3.69,z0+6);rm.box(.5,.32,.5,'#c86a3a',x,3.22,z0+6);rm.box(.56,.12,.56,'#4a9a5a',x,3.42,z0+6);[[-.3,0],[.3,0],[0,-.3],[0,.3]].forEach(([a,b])=>rm.box(.1,.42,.1,'#3a8a4a',x+a,3.05,z0+6+b));rm.box(.14,.14,.14,F[k+2],x,3.5,z0+6)}
  /* the counter with paper and ribbon */
  rm.box(2.6,1,.8,'#a87a4a',x0+w-2.2,.5,z0+5.6,1);rm.box(.8,.12,.8,'#f4e8d0',x0+w-2.8,1.06,z0+5.6);rm.box(.4,.06,.6,'#e84a6a',x0+w-1.8,1.03,z0+5.6);staff(rm,x0+w-2.2,z0+4.6,0);
  for(let i=0;i<4;i++){rm.box(.4,.4,.4,'#8a5a3a',x0+w-.6,.2,z0+7+i*.6);rm.box(.5,.5,.5,'#3a8a4a',x0+w-.6,.6,z0+7+i*.6)}rm.cols.push([x0+w-1,z0+6.6,x0+w,z0+9.4]);
  rm.title(GN('flowers').toUpperCase(),x0+2,x0+9,3.05,3.75,{bg:'#f4e8f0',fg:'#c0397a'});
  rm.int(x0+w-2.2,z0+6.8,1.6,'Buy flowers',()=>{GR='"Something for the fans at your next show?"';const it=[['A single rose',4,'Smells lovely'],['Bouquet for a fan',15,'Hand it to a fan outside · once a day here'],['Potted plant',18,'Brightens up a room']];
   shopModal('💐 '+esc(NM('flowers')),()=>it.map(x=>[x[0],x[1],x[2]]),i=>{const x=it[i];if(!pay(x[1]))return;snd('cash');if(i==1&&daily(C,'bouquet')){const f=fans(15,.15);return say('You hand the bouquet to a fan outside. They post about it · +'+f.toLocaleString()+' followers')}say('Bought: '+x[0])})})},
 cinema(C,rm){const{x0,z0,w,d,cx,back}=rm;
  /* carpet, the ticket desk, posters, the popcorn machine and the doors to the screens */
  D.quadY(rm.G,x0+1,z0+1,x0+w-1,z0+d-1.4,.012,'#5a1a2a');for(let x=x0+1.5;x<x0+w-1;x+=1.5)D.quadY(rm.G,x,z0+1,x+.08,z0+d-1.4,.016,'#e8c040');
  for(let i=0;i<4;i++){const a=x0+1.4+i*2.6;rm.box(2,2.6,.08,'#e8c040',a+.9,2,back+.08);rm.sign('z',back+.14,a,a+1.8,.8,3.2,96,140,(c,W,H)=>{const P=[['#1a2a6a','#ff4a6a'],['#2a1a1a','#ffb040'],['#0a3a2a','#7affc8'],['#3a0a3a','#ffd23d']][i];const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P[0]);g.addColorStop(1,'#000');c.fillStyle=g;c.fillRect(0,0,W,H);
   c.fillStyle=P[1];c.beginPath();c.arc(W/2,H*.4,W*.25,0,7);c.fill();c.fillStyle='#fff';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText(['STAR CITY','LAST BEAT','DEEP GREEN','NIGHT RUN'][i],W/2,H*.8);c.font='9px sans-serif';c.fillText('NOW SHOWING',W/2,H*.9)},'cin'+i)}
  rm.box(4,1.1,1,'#2a1a26',x0+w-3.2,.55,z0+4,1);rm.glow(4,.1,1.02,'#ffd23d',x0+w-3.2,1.12,z0+4);rm.box(.5,.4,.4,'#333',x0+w-4.4,1.3,z0+4);staff(rm,x0+w-3.2,z0+3,0);
  rm.box(1.2,1.4,.9,'#c0392b',x0+w-.8,1.5,z0+6.4,1);rm.box(1,.9,.8,'#f4e0a0',x0+w-.8,1.6,z0+6.4);rm.glow(.9,.5,.05,'#fff2b0',x0+w-.8,1.6,z0+6.82);rm.box(1.2,.8,.9,'#8a1a1a',x0+w-.8,.4,z0+6.4);
  for(let k=0;k<3;k++){rm.box(.12,.9,.12,'#c8a040',x0+3+k*2,.45,z0+6);rm.glow(.16,.1,.16,'#ffd890',x0+3+k*2,.95,z0+6)}rm.box(4,.08,.06,'#a81a2a',x0+5,.8,z0+6);
  rm.box(.2,3,2.2,'#2a1a26',x0+.12,1.5,z0+3.2);rm.sign('x',x0+.24,z0+2.4,z0+4,2.6,3.1,128,40,(c,W,H)=>D.signArt(c,W,H,'SCREEN 1',{bg:'#000',fg:'#ffd23d',neon:1}),'scr1');
  rm.title('NOW SHOWING',x0+4,x0+9,3.35,3.9,{bg:'#000',fg:'#ffd23d'});
  const films=['a space opera','a heist film','a romantic comedy','a horror film','a music biopic','an animated film'];
  rm.int(x0+w-3.2,z0+5.2,1.8,'Buy a ticket and watch a film',()=>{if(S.t>520){snd('err');return say('The last film has started. Come back tomorrow.')}if(!pay(12))return;D.fade(()=>{pass(HOUR()*2);S.energy=Math.min(100,S.energy+10)},()=>say('You watched '+pick(films)+' in '+place(C)+'. Two hours flew by · +10 energy · '+clk()),600)});
  rm.int(x0+w-1.6,z0+7.6,1.4,'Popcorn and drinks',()=>eatMenu('🍿 '+esc(NM('cinema')),'"Salted or sweet?"',[['Popcorn',6,6],['Nachos',7,8],['Soda',4,3,1]]))},
 arcade(C,rm){const{x0,z0,w,d,back}=rm,N=['#ff3a9a','#3ad0ff','#7aff6a','#ffd23d','#b07aff'];
  for(let i=0;i<6;i++){const x=x0+1.4+i*1.6,c=N[i%5];rm.box(1.2,2.4,1,'#1a1a26',x,1.2,back+.7,1);rm.glow(.9,.7,.04,c,x,1.7,back+1.22);rm.box(1.1,.2,.5,'#2a2a3a',x,1,back+1.3);rm.glow(.12,.08,.12,'#ff3a3a',x-.2,1.12,back+1.35);rm.glow(1.1,.18,.04,c,x,2.3,back+1.22)}
  for(let i=0;i<3;i++){const z=z0+3.6+i*1.6;rm.box(1,2.2,1.2,'#1a1a26',x0+.7,1.1,z,1);rm.glow(.04,.7,.9,N[(i+2)%5],x0+1.22,1.6,z)}
  /* claw machine, a dance machine, the prize counter */
  rm.box(1.4,.9,1.4,'#e84a8a',x0+w-1.2,.45,z0+4,1);rm.glow(1.3,1.3,1.3,'#ffe8f4',x0+w-1.2,1.6,z0+4);for(let k=0;k<6;k++)rm.box(.3,.3,.3,N[k%5],x0+w-1.6+(k%3)*.4,1.1,z0+3.8+(k>2?.4:0));rm.box(1.4,.2,1.4,'#e84a8a',x0+w-1.2,2.35,z0+4);
  rm.box(2,.15,2,'#2a2a3a',x0+w-4.4,.08,z0+d-3,0);[[0,-.5],[-.5,0],[.5,0],[0,.5]].forEach(([a,b],k)=>rm.glow(.4,.04,.4,N[k],x0+w-4.4+a,.17,z0+d-3+b));rm.box(2,2.4,.3,'#1a1a26',x0+w-4.4,1.2,z0+d-4.2,1);rm.glow(1.4,.9,.04,'#3ad0ff',x0+w-4.4,1.7,z0+d-4.04);
  rm.box(3,1,.8,'#3a2a5a',x0+3.4,.5,z0+d-2.6,1);for(let k=0;k<6;k++)rm.box(.3,.3,.3,N[k%5],x0+2.2+k*.48,1.15,z0+d-2.6);staff(rm,x0+3.4,z0+d-3.5,0);
  rm.title('ARCADE',x0+4,x0+9,3.25,3.85,{bg:'#0a0a1a',fg:'#ff3a9a'});
  rm.int(x0+5,back+2,1.8,'Play a game ($2)',()=>{if(!pay(2))return;const sc=Math.round(R(1000,99999));snd('pop');if(sc>80000&&daily(C,'hiscore')){const f=fans(10,.1);return say('🕹 New high score: '+sc.toLocaleString()+'! A crowd films it · +'+f+' followers')}say('🕹 You scored '+sc.toLocaleString()+'.')});
  rm.int(x0+w-1.2,z0+5.4,1.3,'Try the claw machine ($2)',()=>{if(!pay(2))return;snd('pop');say(Math.random()<.25?'🧸 You won a plush toy!':'The claw drops it at the last second. Typical.')});
  rm.int(x0+w-4.4,z0+d-2.2,1.3,'Dance machine ($3)',()=>{if(S.energy<5){snd('err');return say('Too tired to dance.')}if(!pay(3))return;S.energy=Math.max(0,S.energy-5);snd('pop');say('💃 '+pick(['Perfect combo!','Great!','You kept up with the arrows.'])+' -5 energy')})},
 karaoke(C,rm){const{x0,z0,w,d,cx,back}=rm,ac=C.s.neon||'#ff3a9a';
  D.quadY(rm.G,x0+.5,z0+.5,x0+w-.5,z0+d-1.4,.012,'#2a1a3a');
  rm.box(5,2.6,.12,'#111',cx,1.9,back+.1);rm.sign('z',back+.18,cx-2.3,cx+2.3,.8,3,256,128,(c,W,H)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1a2a6a');g.addColorStop(1,'#6a1a6a');c.fillStyle=g;c.fillRect(0,0,W,H);c.font='bold 20px sans-serif';c.textAlign='center';c.fillStyle='#ffd23d';c.fillText('♪ sing it loud ♪',W/2,H*.55);c.fillStyle='#fff';c.fillText('the whole night through',W/2,H*.78)},'kar');
  /* a U of sofas round a low table with microphones */
  rm.box(.9,.5,3.6,ac,x0+1.6,.25,z0+4.6,1);rm.box(.3,.8,3.6,ac,x0+1.2,.8,z0+4.6);rm.box(.9,.5,3.6,ac,x0+w-1.6,.25,z0+4.6,1);rm.box(.3,.8,3.6,ac,x0+w-1.2,.8,z0+4.6);rm.box(w-6,.5,.9,ac,cx,.25,z0+6.9,1);rm.box(w-6,.8,.3,ac,cx,.8,z0+7.3);
  rm.box(4,.5,1.6,'#2a2a2a',cx,.25,z0+4.8,1);[[-1,0],[1,0]].forEach(([a])=>{rm.box(.12,.12,.4,'#c8ccd0',cx+a,.56,z0+4.6);rm.box(.14,.14,.14,'#333',cx+a,.56,z0+4.4)});for(let k=0;k<5;k++)rm.box(.14,.2,.14,['#e84a3a','#e8c040','#3ad0ff','#7aff6a','#ff3a9a'][k],cx-1.4+k*.7,.6,z0+5.2);
  rm.box(.5,.5,.5,'#c8ccd0',cx,3.5,z0+4.8);rm.glow(.4,.4,.4,'#ffffff',cx,3.5,z0+4.8);[['#ff3a9a',2.5],['#3ad0ff',w-2.5]].forEach(([c,x])=>rm.glow(.3,.3,.3,c,x0+x,3.7,z0+2));
  rm.box(.7,.9,.6,'#1a1a1a',x0+1,.45,back+.6,1);rm.box(.7,.9,.6,'#1a1a1a',x0+w-1,.45,back+.6,1);rm.glow(.5,.5,.04,'#3a3a4a',x0+1,.5,back+.92);rm.glow(.5,.5,.04,'#3a3a4a',x0+w-1,.5,back+.92);
  staff(rm,x0+w-1.2,z0+d-2,-Math.PI*.6);staff(rm,x0+1.6,z0+3.4,Math.PI/2);
  rm.int(cx,z0+3.6,1.8,'Sing a song ($10)',()=>{if(!pay(10))return;snd('pop');try{chime()}catch(e){}if(daily(C,'karaoke')){const f=fans(20,.2);return say('🎤 You sang your own song. Someone filmed it and it is going round · +'+f.toLocaleString()+' followers')}say('🎤 The room cheers. Same time tomorrow?')})},
 bar(C,rm){const{x0,z0,w,d,back}=rm,N=['#ff3a9a','#3ad0ff','#ffd23d','#7aff6a'];
  rm.box(w-4,2.4,.4,'#3a2414',x0+w/2,1.6,back+.25);for(let r=0;r<3;r++){rm.box(w-4.2,.06,.4,'#5a3a20',x0+w/2,1.2+r*.6,back+.3);for(let i=0;i<14;i++)rm.box(.14,.4,.14,['#2a8a4a','#c8a040','#a83a3a','#e8e8e8','#3a6ab8'][(i+r)%5],x0+2.4+i*(w-5)/13,1.45+r*.6,back+.3)}
  rm.glow(w-4,.06,.1,'#ffd890',x0+w/2,3,back+.4);rm.box(w-4,1.1,.9,'#5a3a20',x0+w/2,.55,z0+2.6,1);rm.box(w-3.9,.08,1,'#2a1a10',x0+w/2,1.12,z0+2.6);for(let k=0;k<3;k++)rm.box(.1,.4,.1,'#c8ccd0',x0+4+k*.5,1.36,z0+2.4);
  for(let i=0;i<6;i++)stool(rm,x0+2.6+i*1.5,z0+3.6,'#a83a3a');staff(rm,x0+w/2,z0+1.5,0);
  /* booths on the left, a pool table, the jukebox */
  [z0+5.6,z0+8].forEach(z=>{rm.box(.8,.5,1.8,'#7a1a2a',x0+.7,.25,z,1);rm.box(.2,.7,1.8,'#7a1a2a',x0+.35,.85,z);table(rm,x0+1.8,z,.9,1.4,'#3a2414')});
  rm.box(3,.8,1.7,'#2a6a3a',x0+w-3.6,.55,z0+6.4,1);rm.box(3.2,.12,1.9,'#4a2a1a',x0+w-3.6,.95,z0+6.4);for(let k=0;k<6;k++)rm.box(.12,.12,.12,N[k%4],x0+w-4.6+k*.4,1.06,z0+6.2+(k%2)*.3);
  rm.box(.9,1.6,.6,'#c8402a',x0+w-.6,.8,z0+8.4,1);rm.glow(.6,.6,.04,'#ffd23d',x0+w-.6,1.2,z0+8.06);
  rm.sign('z',back+.48,x0+3,x0+7,3.1,3.8,256,64,(c,W,H)=>D.signArt(c,W,H,'BAR',{bg:'#000',fg:'#ff3a9a',neon:1}));
  rm.int(x0+w/2,z0+3.9,1.8,'Order at the bar',()=>eatMenu('🍹 '+esc(NM('bar')),'"What will it be? We do great mocktails."',[['Mocktail',6,4,1],['Lemonade',4,3,1],['Bar snacks',6,8],['Loaded fries',8,11]]));
  rm.int(x0+w-.6,z0+9.2,1.2,'Play the jukebox ($1)',()=>{if(!pay(1))return;snd('pop');say(S.songs&&S.songs.length&&Math.random()<.5?'The jukebox has one of your songs! A couple of people sing along.':'♪ An old favourite fills the bar.')})},
 market(C,rm){const{x0,z0,w,d,back}=rm,P=['#e84a3a','#ffb030','#ffe066','#7ac84a','#8a3aa8','#f48a3a','#f4d060'];
  /* three stalls with awnings and crates */
  for(let i=0;i<3;i++){const x=x0+2.3+i*4.2,z=back+1.4,aw=[C.s.acc||'#e84a3a','#2a8a4a','#3a6ab8'][i];rm.box(3.2,.9,1.4,'#8a5a32',x,.45,z,1);
   for(let c=0;c<4;c++){rm.box(.7,.25,1,'#c8a068',x-1.15+c*.77,1,z);for(let k=0;k<6;k++)rm.box(.18,.16,.18,P[(c+i)%P.length],x-1.35+c*.77+(k%3)*.18,1.2,z-.3+Math.floor(k/3)*.4)}
   [-1.5,1.5].forEach(o=>rm.box(.08,2.4,.08,'#555',x+o,1.2,z+.7));for(let s=0;s<6;s++)rm.box(.55,.06,1.4,s%2?'#f4f0e8':aw,x-1.38+s*.55,2.5,z+.2)}
  for(let k=0;k<12;k++)rm.glow(.12,.12,.12,'#ffe0a0',x0+1+k*1.05,3.4-Math.abs(k-5.5)*.04,z0+4.6);
  /* crates on the floor, baskets, a scale and the seller */
  for(let i=0;i<4;i++){rm.box(.9,.5,.7,'#a87a4a',x0+.8,.25,z0+4.6+i*.9,1);for(let k=0;k<3;k++)rm.box(.2,.18,.2,P[(i+k)%P.length],x0+.6+k*.22,.58,z0+4.6+i*.9)}
  rm.box(2.4,1,.9,'#8a5a32',x0+w-2,.5,z0+6.4,1);rm.box(.5,.1,.5,'#c8ccd0',x0+w-2.5,1.1,z0+6.4);rm.box(.1,.3,.1,'#333',x0+w-2.5,1.25,z0+6.4);staff(rm,x0+w-2,z0+5.5,0);staff(rm,x0+6.5,back+.4,0);
  for(let k=0;k<3;k++){rm.box(.6,.3,.6,'#c8a068',x0+4+k*1.2,.15,z0+d-2.4,1);rm.box(.5,.1,.5,P[k],x0+4+k*1.2,.33,z0+d-2.4)}
  rm.title(GN('market').toUpperCase(),x0+4,x0+10,3.3,3.9,{bg:'#2a3a1a',fg:'#ffe066'});
  const menu=()=>{const sub=(D.door&&D.door.k=='market'&&D.door.sub)||'market';return sub=='cheese'?[['Cheese tasting plate',9,10],['Wedge of local cheese',7,8],['Crackers',3,3],['Apple juice',3,3,1]]:sub=='fruit'?[['Bag of fresh fruit',4,6],['Fruit cup',3,4],['Fresh juice',4,3,1],['Coconut',4,3,1]]:[['Fresh fruit',3,4],['Bag of nuts',3,5],['Local snack',4,6],['Fresh juice',4,3,1]]};
  rm.int(x0+w-2,z0+7.6,1.6,'Buy from the market',()=>eatMenu('🧺 '+esc(NM('market')),'"'+D.words(C.s.lang).hi+'! All fresh today."',menu()))},
 tech(C,rm){const{x0,z0,w,d,back}=rm;
  /* a wall of screens, glass tables of phones and cameras, speakers and headphones */
  for(let r=0;r<2;r++)for(let i=0;i<4;i++){rm.box(2,1.15,.1,'#111',x0+1.8+i*2.4,1.3+r*1.3,back+.1);rm.glow(1.85,1,.04,['#3a8ae8','#e84a8a','#2ecc71','#ffd23d'][(i+r)%4],x0+1.8+i*2.4,1.3+r*1.3,back+.17)}
  for(let i=0;i<2;i++){const x=x0+3+i*4.4,z=z0+4.4;rm.box(2.6,.9,1.2,'#3a3e46',x,.45,z,1);rm.glow(2.5,.05,1.1,'#cfe8f4',x,.93,z);for(let k=0;k<5;k++){rm.box(.22,.04,.4,'#1a1a1e',x-1+k*.5,.97,z-.2);rm.glow(.18,.02,.34,'#6aa8e8',x-1+k*.5,1,z-.2)}
   for(let k=0;k<3;k++){rm.box(.36,.26,.24,'#2a2a2e',x-.8+k*.8,1.08,z+.3);rm.box(.14,.14,.14,'#555',x-.8+k*.8,1.1,z+.44)}}
  [x0+.8,x0+w-.8].forEach(x=>{rm.box(.7,1.6,.6,'#1a1a1e',x,.8,z0+7.4,1);rm.box(.4,.4,.04,'#3a3a40',x,1.15,z0+7.72);rm.box(.26,.26,.04,'#3a3a40',x,.55,z0+7.72)});
  rm.box(.1,1.4,.1,'#888',x0+w-2.4,.7,z0+7.4);rm.box(.4,.4,.2,'#1a1a1e',x0+w-2.4,1.5,z0+7.4);rm.cols.push([x0+w-2.7,z0+7.1,x0+w-2.1,z0+7.7]);
  rm.box(3,1,.8,'#2a2a2e',x0+w-2.2,.5,z0+d-3.2,1);rm.glow(3,.06,.82,'#6aa8e8',x0+w-2.2,1.02,z0+d-3.2);staff(rm,x0+w-2.2,z0+d-4,0);
  rm.title(GN('tech').toUpperCase(),x0+3,x0+9,3.3,3.9,{bg:'#111',fg:'#6aa8e8'});
  rm.int(x0+.8,z0+8.4,1.4,'Play your music on the demo speakers',()=>{snd('pop');if(!S.songs||!S.songs.length)return say('You have no songs out yet. Release one first!');if(daily(C,'speakers')){const f=fans(8,.1);return say('🔊 Your song booms through the shop. Shoppers ask who it is · +'+f+' followers')}say('🔊 Sounds great on these speakers.')});
  rm.int(x0+w-2.2,z0+d-2.2,1.6,'Buy a gadget',()=>keepMenu(C,'🔌 '+esc(NM('tech')),'"Need a charger for the trip?"',[['Travel adapter',12,'Fits every socket on tour'],['Wireless earbuds',35,'For the long flights'],['Phone case',15,'With a '+place(C)+' print'],['Power bank',20,'Never run out of battery']]))},
 sweets(C,rm){const{x0,z0,w,d,back}=rm,L=SWEET[C.s.lang]||SWEET.en,T=['#f8c8d8','#fff0b0','#c8f0d8','#d8c8f8','#ffd8b0','#8a5a3a','#f4f4f4','#e84a6a'];
  for(let ix=0;ix<w;ix++)for(let iz=0;iz<d;iz++)if((ix+iz)%2==0)D.quadY(rm.G,x0+ix,z0+iz,x0+ix+1,z0+iz+1,.012,'#d88aa8');
  /* the freezer counter of tubs (or fruit and blenders for a juice bar, trays of sweets for a sweet shop) */
  rm.box(7,1.1,1,'#e84a8a',x0+4.4,.55,z0+2.6,1);rm.box(7.1,.12,1.1,'#f4f4f4',x0+4.4,1.06,z0+2.6);rm.box(7,.06,1.04,'#cfe8f4',x0+4.4,1.14,z0+2.6);
  {for(let k=0;k<4;k++){rm.box(.3,.5,.3,'#cfe8f4',x0+2+k*.8,1.42,z0+2.4);rm.box(.26,.3,.26,['#ff8a30','#e84a6a','#7ac84a','#ffe066'][k],x0+2+k*.8,1.32,z0+2.4)}for(let k=0;k<10;k++)rm.box(.2,.2,.2,['#ff8a30','#ffe066','#7ac84a','#e84a3a'][k%4],x0+4.6+(k%5)*.4,1.27,z0+2.5+(k>4?.3:0))}
  for(let k=0;k<8;k++)rm.box(.45,.12,.4,T[k%T.length],x0+5.6+(k%4)*.5,1.05,z0+2.4+(k>3?.4:0));
  staff(rm,x0+4.4,z0+1.5,0);rm.sign('z',back+.1,x0+1.5,x0+6,2.2,3.6,256,96,(c,W,H)=>{c.fillStyle='#fff6f8';c.fillRect(0,0,W,H);c.strokeStyle='#e84a8a';c.lineWidth=6;c.strokeRect(0,0,W,H);c.fillStyle='#c0397a';c.font='bold 18px sans-serif';c.textAlign='center';
   c.fillText('ICE CREAM · JUICE',W/2,28);c.font='14px sans-serif';['Gelato','Fresh juice','Smoothies',L[0]].forEach((t,i)=>c.fillText(t,W/2,50+i*14))},'swt');
  /* pastel tables and stools */
  [[x0+3,z0+5.6],[x0+7,z0+5.6],[x0+w-2,z0+3.8]].forEach(([x,z],i)=>{table(rm,x,z,.9,.9,'#7ad0c8');stool(rm,x-.9,z,T[i]);stool(rm,x+.9,z,T[i+2])});
  rm.box(.6,1.8,.6,'#e84a8a',x0+w-.6,.9,z0+6.8,1);rm.box(.9,.9,.9,'#ffd8e8',x0+w-.6,2.2,z0+6.8);plant(rm,x0+.7,z0+d-2);
  rm.title(GN('sweets').toUpperCase(),x0+7,x0+w-1,3.1,3.75,{bg:'#fff0f6',fg:'#c0397a'});
  rm.int(x0+4.4,z0+3.8,1.8,'Order at the counter',()=>{const sub=(D.door&&D.door.k=='sweets'&&D.door.sub)||'ice',items=sub=='juice'?[['Fresh orange juice',4,3,1],['Mango smoothie',6,6,1],['Açaí bowl',8,9],['Green juice',5,4,1]]:sub=='sweets'?[[L[0],4,6],[L[1],4,5],[L[2],5,6],['Cold drink',3,3,1]]:[['Two scoops',5,5,1],['Cone',4,4,1],['Sundae',7,8],['Milkshake',5,5,1]];
   eatMenu((sub=='juice'?'🥤 ':sub=='sweets'?'🍬 ':'🍨 ')+esc(NM('sweets')),'"'+D.words(C.s.lang).hi+'! What would you like?"',items)})},
 spa(C,rm){const{x0,z0,w,d,back}=rm;
  D.quadY(rm.G,x0+.5,z0+.5,x0+w-.5,z0+d-1.4,.012,'#c8b89a');
  for(let i=0;i<2;i++){const x=x0+2.4+i*4;rm.box(2.2,.7,.9,'#f4f0e8',x,.35,z0+2.6,1);rm.box(2.2,.12,.9,'#e8dcc4',x,.76,z0+2.6);rm.box(.5,.1,.5,'#f4f4f4',x-.8,.86,z0+2.6);rm.box(.08,1.8,1.6,'#c8a878',x+1.5,.9,z0+2.6)}
  for(let k=0;k<5;k++)rm.glow(.1,.14,.1,'#ffb060',x0+1.2+k*.4,1.1,back+.3);rm.box(2.2,.9,.4,'#8a6a4a',x0+2,.45,back+.3,1);
  for(let k=0;k<4;k++)rm.box(.5,.16,.4,['#f4f4f4','#c8e0d8','#f4f4f4','#e8d8c8'][k],x0+w-1,.9+k*.18,back+.5);rm.box(.8,.8,.6,'#8a6a4a',x0+w-1,.4,back+.5,1);
  rm.box(2.4,1,.8,'#8a6a4a',x0+w-2.4,.5,z0+6.4,1);staff(rm,x0+w-2.4,z0+5.6,0);staff(rm,x0+3,z0+1.6,0);plant(rm,x0+.8,z0+d-2);plant(rm,x0+w-.8,z0+d-2);
  rm.title(GN('spa').toUpperCase(),x0+5,x0+10,3.2,3.8,{bg:'#3a2a1a',fg:'#ffd890'});
  rm.int(x0+w-2.4,z0+7.6,1.6,'Get a massage ($25)',()=>{if(!pay(25))return;D.fade(()=>{pass(HOUR());S.energy=Math.min(100,S.energy+30);S.stam=100;S.exh=0},()=>say('An hour of massage. You feel brand new · +30 energy · '+clk()),600)})},
 beauty(C,rm){const{x0,z0,w,d,back}=rm,G=['#f8c8d8','#e8c040','#cfe8f4','#e84a6a','#b07aff','#f4f4f4'];
  for(let i=0;i<3;i++){const x=x0+2+i*3.4;rm.box(2.6,2.2,.5,'#d890b0',x,1.1,back+.3,1);for(let r=0;r<3;r++)for(let k=0;k<6;k++)rm.box(.18,.26,.18,G[(k+r+i)%6],x-1+k*.4,.75+r*.55,back+.6);rm.glow(2.4,.06,.1,'#fff2f8',x,2.25,back+.6)}
  [x0+3,x0+7.6].forEach((x,i)=>{rm.box(2.6,1,1,'#e8a8c4',x,.5,z0+4.6,1);rm.box(2.7,.06,1.1,'#f8f0f4',x,1.03,z0+4.6);for(let k=0;k<6;k++)rm.box(.16,.3,.16,G[k],x-1+k*.4,1.2,z0+4.6)});
  rm.box(.1,1.6,1.2,'#cfe0f0',x0+.12,1.8,z0+7.2);rm.box(.6,.5,.6,'#e8c8d8',x0+.8,.25,z0+7.2,1);rm.box(2.2,1,.8,'#c0397a',x0+w-1.8,.5,z0+d-2.6,1);staff(rm,x0+w-1.8,z0+d-3.4,0);
  rm.title(GN('beauty').toUpperCase(),x0+3,x0+9,3.2,3.8,{bg:'#fff0f6',fg:'#c0397a'});
  rm.int(x0+w-1.8,z0+d-1.8,1.6,'Browse the counters',()=>keepMenu(C,'💄 '+esc(NM('beauty')),'"Try a sample, the testers are free."',[['Perfume tester',0,'A spritz on the wrist'],['Lip balm',5,'For dry stage lights'],['Stage glitter',9,'For the next show'],['Local perfume',45,'Smells like '+place(C)]]))},
 bikes(C,rm){const{x0,z0,w,d,back}=rm,BC=['#e84a3a','#3a6ab8','#2ecc71','#e8c040','#1a1a1a','#f4f4f4'];
  const bike=(x,z,c)=>{[[-.55,0],[.55,0]].forEach(([o])=>{rm.box(.06,.7,.7,'#1a1a1a',x+o,.38,z);rm.box(.04,.5,.5,'#c8ccd0',x+o,.38,z)});rm.box(1.1,.06,.06,c,x,.6,z);rm.box(.06,.5,.06,c,x-.15,.7,z);rm.box(.06,.6,.06,c,x+.5,.75,z);rm.box(.3,.06,.12,'#2a2a2a',x-.15,.98,z);rm.box(.06,.06,.5,'#888',x+.5,1.08,z)};
  for(let i=0;i<5;i++)bike(x0+1.6+i*1.9,back+1,BC[i]);rm.cols.push([x0+.8,back+.5,x0+10.6,back+1.5]);for(let i=0;i<3;i++)bike(x0+3+i*2.2,z0+4.8,BC[(i+3)%6]);rm.cols.push([x0+2.2,z0+4.4,x0+8.8,z0+5.2]);
  for(let k=0;k<4;k++){rm.box(.06,.8,.8,'#1a1a1a',x0+.15,2.4,z0+3+k*1.1)}rm.box(.1,1.4,.1,'#888',x0+w-1.5,.7,z0+5);rm.box(.6,.1,.1,'#888',x0+w-1.5,1.4,z0+5);bike(x0+w-1.5,z0+5,'#3a6ab8');rm.cols.push([x0+w-2.2,z0+4.6,x0+w-.8,z0+5.4]);
  rm.box(2.4,1,.8,'#5a4a3a',x0+2.2,.5,z0+d-2.6,1);staff(rm,x0+2.2,z0+d-3.4,0);rm.box(.8,.4,.4,'#c8402a',x0+w-1,.2,z0+d-2.4,1);
  rm.title(GN('bikes').toUpperCase(),x0+3,x0+9,3.2,3.8,{bg:'#1a3a2a',fg:'#ffe066'});
  rm.int(x0+2.2,z0+d-1.8,1.6,'Rent a bike to ride across town ($4)',()=>{const s=C.spots,to=s.land||s.hotel;if(!to)return;if(!pay(4))return;closeUI();D.fade(()=>{D.room=null;P.x=OX+to.x;P.z=OZ+to.z+2.4;P.rot=0;camT.x=P.x;camT.z=P.z;pass(6)},()=>say('🚲 A breezy ride across '+place(C)+'. You dock the bike by the '+(s.land?s.land.n:'hotel')+'.'))})}};

/* ---------- build them, then lay a dark floor round every room so they do not float in the city's grass ---------- */
const LOOK={bakery:{floor:'#d8c0a0',wall:'#f6ead4'},laundry:{floor:'#dfe6ea',wall:'#eaf4fb',tiles:1},barber:{floor:'#e8e4dc',wall:'#f4efe6',tiles:1},flowers:{floor:'#b89a72',wall:'#eef4e8'},cinema:{floor:'#2a1a20',wall:'#3a2030',dim:1,nowin:1,noclock:1},
 arcade:{floor:'#1a1a26',wall:'#24203a',nowin:1,noclock:1,lamp:'#b07aff'},karaoke:{floor:'#1a1426',wall:'#2a1a3a',nowin:1,noclock:1,lamp:'#ff6ad5'},bar:{floor:'#5a3a24',wall:'#3a2a24',nowin:1,lamp:'#ffd890'},market:{floor:'#b8a888',wall:'#efe4cc'},
 tech:{floor:'#b8bcc4',wall:'#eef0f4',tiles:1},sweets:{floor:'#f8e0ea',wall:'#ffe8f0'},spa:{floor:'#a88a6a',wall:'#efe4d4',lamp:'#ffd8a0'},beauty:{floor:'#e8c8d4',wall:'#fff0f6',tiles:1},bikes:{floor:'#8a8e94',wall:'#e8e4dc'}};
function backdrop(C){const rs=Object.values(C.rooms);if(!rs.length)return;const G=D.mkG(),xs=new Set(),zs=new Set(),pad=.2;let X0=1e9,X1=-1e9,Z0=1e9,Z1=-1e9;
 rs.forEach(r=>{const a=r.x0-pad,b=r.x0+r.w+pad,c=r.z0-pad,e=r.z0+r.d+pad;xs.add(a);xs.add(b);zs.add(c);zs.add(e);X0=Math.min(X0,a);X1=Math.max(X1,b);Z0=Math.min(Z0,c);Z1=Math.max(Z1,e)});
 X0-=60;X1+=60;Z0-=60;Z1+=60;[X0,X1].forEach(v=>xs.add(v));[Z0,Z1].forEach(v=>zs.add(v));const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
 const inside=(x,z)=>rs.some(r=>x>r.x0-pad&&x<r.x0+r.w+pad&&z>r.z0-pad&&z<r.z0+r.d+pad);
 for(let i=0;i<X.length-1;i++)for(let j=0;j<Z.length-1;j++){const mx=(X[i]+X[i+1])/2,mz=(Z[j]+Z[j+1])/2;if(!inside(mx,mz))D.quadY(G,X[i],Z[j],X[i+1],Z[j+1],.006,'#16161c')}
 const g=new THREE.Group();g.position.set(OX,0,OZ);scene.add(g);D.flushTo(G,g);C.extra.push(g)}
const GUESTS={bakery:[[3.2,4.6,Math.PI]],laundry:[[8,2.4,Math.PI]],cinema:[[3,2.2,Math.PI],[4.2,2.4,Math.PI]],arcade:[[4.6,2.2,Math.PI],[1.8,4.4,-Math.PI/2]],bar:[[6.35,3.75,Math.PI],[8.4,6.4,Math.PI/2]],
 market:[[2.6,2.8,Math.PI],[6.4,2.8,Math.PI]],tech:[[3,5.4,Math.PI]],sweets:[[3,6.5,Math.PI]],flowers:[[4.8,3.4,Math.PI/2]],bikes:[[5,6,Math.PI]],beauty:[[3,5.6,Math.PI]],barber:[[10.4,7.2,Math.PI]]};
D.cityHooks.push(C=>{Object.keys(ROOMS).forEach(k=>{try{const rm=kit(C,k,Object.assign({name:D.KN[k].replace(/^the /,'').replace(/^./,c=>c.toUpperCase())},LOOK[k]));if(!rm)return;ROOMS[k](C,rm);(GUESTS[k]||[]).forEach(([x,z,r])=>staff(rm,rm.x0+x,rm.z0+z,r));rm.done()}catch(e){console.error('dcity room '+k,e)}});try{backdrop(C)}catch(e){console.error('dcity backdrop',e)}});

/* where you are, for the top-left box */
D.where=function(){if(!D.on||!D.C)return'';const r=D.room;if(!r)return'Out in '+place(D.C);return(D.door&&D.door.k==r.key&&D.door.n)||r.o.name||D.KN[r.key]&&D.KN[r.key].replace(/^the /,'')||'Inside'};
})();
