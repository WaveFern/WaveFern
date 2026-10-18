/* ===== v43.4.0: destination cities (streets, airport, hotel, arrival cutscene) =====
   Every place in WT_DEST (135-destinations.js) becomes a city you can walk around once your flight lands there. Cities are built
   when you arrive, far away from the home city (local frame at OX,OZ), and taken down again when you fly home.
   - style: each row's palette (pal = sky, street, accent, neon), language (lang) and look line drive the city: building colours
     and shapes (brick, stone, glass towers, gables, mansard or tiled roofs, domes), glowing signs written in the local
     language, billboards, trees, water fronts, hills, trams, cabs, buses and tuk-tuks, and which side of the road cars drive on.
     Rows with a city name get a big city (towers downtown); country-level rows (city:null) get a smaller town.
   - layout (local x east, z south): airport on the far left (runway, parked planes, terminal, control tower, car park), a grid
     of streets with shops, a park, the hotel near the airport, the club in the middle and the stadium plaza on the far right.
     The camera looks from +x +z, so every entrance is on a south (+z) or east (+x) face.
   - buildings are merged one per building (body, windows, signs) so they can fade out when they hide you from the camera, like
     the home towers. Windows and neon light up at dusk.
   - arrival: an aerial cutscene sweeps over the skyline while the city name fades in big with the country under it
     (Tokyo / Japan), then you stand outside the arrivals hall. Click, Space or Esc skips it.
   - the stadium, club and shows live in 138-tour-shows.js; flights and tickets belong to the airport/flight app (TRAVEL).
   Public API: DCITY.arrive(id,{quiet}), DCITY.leave(home), DCITY.on, DCITY.id, DCITY.C (the city being shown). */
(()=>{
const OX=4000,OZ=-4000;
const D=window.DCITY=window.DCITY||{};
Object.assign(D,{OX,OZ,on:0,id:null,C:null,room:null,view:null,hooks:[],cityHooks:[]});

/* ---------- local words ---------- */
const DW={
 en:{shop:['Pharmacy','Deli','Diner','Books','Records','Pizza','Coffee','Barber','Bakery','Laundry','Tacos','Noodles','Burgers','Flowers','Vintage','Sneakers','Bagels','Juice Bar','Market','Cinema','Arcade','Thrift'],air:'Airport',hi:'Hello',ty:'Thank you',wel:'Welcome to',hotel:'Hotel'},
 es:{shop:['Panadería','Farmacia','Café','Tienda','Mercado','Librería','Taquería','Heladería','Zapatería','Frutería','Peluquería','Bar','Discos','Floristería','Churrería','Cine'],air:'Aeropuerto',hi:'¡Hola',ty:'¡Gracias',wel:'Bienvenidos a',hotel:'Hotel'},
 pt:{shop:['Padaria','Farmácia','Lanchonete','Mercado','Livraria','Açaí','Sorveteria','Café','Discos','Barbearia','Floricultura','Pastelaria','Bar','Cinema'],air:'Aeroporto',hi:'Olá',ty:'Obrigado',wel:'Bem-vindos a',hotel:'Hotel'},
 fr:{shop:['Boulangerie','Café','Pharmacie','Librairie','Fromagerie','Tabac','Bistro','Fleuriste','Pâtisserie','Disquaire','Crêperie','Épicerie','Brasserie','Cinéma'],air:'Aéroport',hi:'Bonsoir',ty:'Merci',wel:'Bienvenue à',hotel:'Hôtel'},
 de:{shop:['Bäckerei','Apotheke','Buchhandlung','Kneipe','Imbiss','Späti','Kiosk','Café','Plattenladen','Blumen','Döner','Friseur','Markt','Kino'],air:'Flughafen',hi:'Guten Abend',ty:'Danke',wel:'Willkommen in',hotel:'Hotel'},
 it:{shop:['Panetteria','Farmacia','Gelateria','Pizzeria','Caffè','Libreria','Trattoria','Pasticceria','Tabacchi','Fiori','Dischi','Enoteca','Mercato','Cinema'],air:'Aeroporto',hi:'Buonasera',ty:'Grazie',wel:'Benvenuti a',hotel:'Albergo'},
 nl:{shop:['Bakkerij','Apotheek','Boekhandel','Café','Kaas','Bloemen','Fietsen','Frites','Platen','Markt','Kapper','Bioscoop'],air:'Luchthaven',hi:'Goedenavond',ty:'Dank je',wel:'Welkom in',hotel:'Hotel'},
 sv:{shop:['Bageri','Apotek','Bokhandel','Kafé','Fika','Blommor','Skivor','Torg','Frisör','Bio','Glass','Kiosk'],air:'Flygplats',hi:'Hej',ty:'Tack',wel:'Välkommen till',hotel:'Hotell'},
 ar:{shop:['مقهى','صيدلية','مخبز','سوق','مطعم','حلويات','عصير','كتب','عطور','ملابس','شاورما','فلافل'],air:'مطار',hi:'مرحبا',ty:'شكرا',wel:'أهلا بكم في',hotel:'فندق'},
 sw:{shop:['Duka','Mkahawa','Dawa','Soko','Chai','Nyama Choma','Kinyozi','Muziki','Mikate','Matunda'],air:'Uwanja wa Ndege',hi:'Habari',ty:'Asante',wel:'Karibu',hotel:'Hoteli'},
 ja:{shop:['ラーメン','カラオケ','寿司','カフェ','書店','薬局','コンビニ','ゲーム','音楽','居酒屋','電気','本屋','焼肉','うどん','パン','花屋'],air:'空港',hi:'こんばんは',ty:'ありがとう',wel:'ようこそ',hotel:'ホテル'},
 ko:{shop:['카페','노래방','치킨','편의점','음악','약국','빵집','분식','서점','고기','화장품','게임'],air:'공항',hi:'안녕하세요',ty:'감사합니다',wel:'환영합니다',hotel:'호텔'},
 zh:{shop:['茶馆','面馆','药店','书店','咖啡','饺子','火锅','超市','音乐','服装','包子','点心'],air:'机场',hi:'你好',ty:'谢谢',wel:'欢迎来到',hotel:'酒店'},
 hi:{shop:['चाय','दवाखाना','मिठाई','बाज़ार','कपड़े','संगीत','ढाबा','किताबें','फल','मसाले','जूते','सिनेमा'],air:'हवाई अड्डा',hi:'नमस्ते',ty:'धन्यवाद',wel:'स्वागत है',hotel:'होटल'},
 th:{shop:['ร้านกาแฟ','ร้านขายยา','ตลาด','ก๋วยเตี๋ยว','ข้าวผัด','ร้านหนังสือ','เพลง','ผลไม้','นวด','ขนม'],air:'สนามบิน',hi:'สวัสดี',ty:'ขอบคุณ',wel:'ยินดีต้อนรับ',hotel:'โรงแรม'},
 id:{shop:['Warung','Kopi','Apotek','Pasar','Toko','Bakso','Sate','Buah','Musik','Batik'],air:'Bandara',hi:'Halo',ty:'Terima kasih',wel:'Selamat datang di',hotel:'Hotel'}};
const dw=l=>DW[l]||DW.en;D.words=dw;
const DLOC={tyo:'東京',osa:'大阪',sel:'서울',sha:'上海',mum:'मुंबई',dxb:'دبي',bkk:'กรุงเทพฯ',cai:'القاهرة'};
const BRANDS=['NEOMART','SKYCOLA','FERNPHONE','PIXELCAM','NOVA AIR','BOLT BULL','WAVEFERN','LUMA','ZING','KIKO'];
/* street food: [name, price, energy, refills stamina] */
const DFOOD={ja:[['Ramen',14,18],['Takoyaki',9,11],['Iced green tea',4,4,1]],ko:[['Tteokbokki',10,12],['Fried chicken',14,18],['Banana milk',3,3,1]],zh:[['Soup dumplings',12,15],['Hand-pulled noodles',10,13],['Bubble tea',5,4,1]],
 hi:[['Vada pav',5,8],['Thali',12,18],['Masala chai',3,4,1]],th:[['Pad thai',8,12],['Mango sticky rice',6,8],['Thai iced tea',4,4,1]],ar:[['Falafel wrap',6,9],['Koshari',7,11],['Mint tea',3,3,1]],
 fr:[['Croissant',4,5],['Crêpe',8,10],['Café au lait',4,4,1]],de:[['Currywurst',7,10],['Pretzel',4,5],['Apfelschorle',4,3,1]],it:[['Pizza slice',6,9],['Gelato',5,5],['Espresso',3,3,1]],
 es:[['Churros',5,6],['Empanadas',6,8],['Agua fresca',3,3,1]],pt:[['Pão de queijo',4,5],['Açaí bowl',8,9],['Fresh coconut',4,3,1]],nl:[['Stroopwafel',4,5],['Frites',5,7],['Iced coffee',4,4,1]],
 sv:[['Cinnamon bun',4,5],['Meatballs',12,16],['Lingonberry soda',4,3,1]],sw:[['Nyama choma',10,15],['Mandazi',3,5],['Chai',2,3,1]],id:[['Nasi goreng',6,10],['Satay',7,9],['Es teh',2,3,1]],
 en:[['Hot dog',5,7],['Pizza slice',5,8],['Iced coffee',5,4,1]]};
const DFOODID={mex:[['Tacos al pastor',8,12],['Elote',4,5],['Horchata',3,3,1]],lon:[['Fish and chips',12,16],['Sausage roll',4,6],['Cup of tea',3,3,1]],man:[['Pie and chips',9,13],['Bacon butty',5,7],['Cup of tea',3,3,1]],
 nyc:[['Bagel with cream cheese',5,7],['Pizza slice',4,7],['Iced coffee',5,4,1]],syd:[['Meat pie',7,10],['Fish tacos',12,14],['Flat white',5,4,1]],mel:[['Meat pie',7,10],['Avocado toast',12,14],['Flat white',5,4,1]],
 lag:[['Jollof rice',6,12],['Suya',5,8],['Zobo',2,3,1]],jnb:[['Bunny chow',7,12],['Boerewors roll',6,9],['Rooibos tea',3,3,1]],cpt:[['Bunny chow',7,12],['Koeksister',3,5],['Rooibos tea',3,3,1]],
 rio:[['Coxinha',4,6],['Açaí bowl',8,9],['Fresh coconut',4,3,1]],irl:[['Stew',9,14],['Soda bread',3,5],['Cup of tea',3,3,1]],tor:[['Poutine',8,12],['Peameal sandwich',8,10],['Iced coffee',4,4,1]],
 mia:[['Cuban sandwich',9,13],['Empanadas',6,8],['Café cubano',3,4,1]],la:[['Street tacos',8,11],['Smoothie bowl',11,10],['Cold brew',5,4,1]]};
D.food=id=>{const d=wtDest(id);return DFOODID[id]||DFOOD[d&&d.lang]||DFOOD.en};
const LEFT=['lon','man','irl','tyo','osa','syd','mel','nzl','jnb','cpt','ken','mum','bkk','idn'];

/* ---------- style from a destination row ---------- */
function dsStyle(d){const L=(d.look||'').toLowerCase(),has=r=>r.test(L),big=!!d.city,pal=d.pal||['#9bb7d4','#55575a','#ffcc33','#ff3a9a'];
 const s={id:d.id,big,lang:d.lang||'en',sky:pal[0],street:pal[1],acc:pal[2],neon:pal[3],look:L,
  tall:big?(has(/super tall|endless|skyline|dense|high-rise/)?1:has(/tower/)?.75:.45):.12,
  neonK:has(/glowing|neon|signs/)?1:big?.4:.18,bill:has(/billboard|glowing|signs/)?1:big?.5:.2,
  palm:has(/palm/),beach:has(/beach/),canal:has(/canal/),
  water:has(/harbour|lake|river|sea|lagoon|bay|beach|canal|port|water|corniche|ferr|island/),
  hills:has(/hill|mountain|volcan/),snow:has(/snow/),flatTop:has(/flat-topped/),
  brick:has(/brick/),stone:has(/stone|sandstone|ochre|terracotta|clay|sand|stucco|limestone|cream/),glass:has(/glass/),
  gable:has(/gable|narrow|canal houses/),mansard:has(/grey roofs|iron balconies/),terra:has(/terracotta|clay|tiled|ochre/),wood:has(/wooden/),
  temple:has(/temple/),minaret:has(/minaret/),hanok:has(/hanok/),gate:has(/stone gates/),ruins:has(/ruins/),
  lantern:has(/lantern/),vend:has(/vending/),mural:has(/graffiti|mural|street art/),picado:has(/papel picado/),fire:has(/fire escape/),
  heli:has(/helipad/),gold:has(/gold/),
  tram:has(/tram|streetcar/),cab:has(/yellow cab/)?'#f2c418':has(/black cab/)?'#1c1c22':null,bus:has(/double deck/)?'#d7262f':has(/minibus/)?'#f2c418':null,
  tuk:has(/tuk|rickshaw/),bike:has(/bike/),scooter:has(/scooter/),desert:has(/desert|sand/)&&!has(/sandstone/),colour:has(/colourful|colorful|bright|painted|pastel/),
  tree:has(/jacaranda/)?'#a77ee0':has(/maple/)?'#c8532a':has(/pine/)?'#2f5a3a':has(/acacia/)?'#7a9a3a':has(/rice/)?'#6aa83a':'#3f8a4a',
  left:LEFT.includes(d.id)};
 /* building palettes */
 const P=[];if(s.brick)P.push('#8a3f2e','#9c4a34','#7a3a2c','#a8553a','#6e3326');
 if(s.stone)P.push('#e3d6bd','#d8c8a8','#cdb994','#e8dcc4');if(s.terra)P.push('#d39b6a','#c8813f','#e0a868','#b8683a');
 if(s.colour)P.push('#ff8a6a','#ffd36a','#7ad0e8','#9ae07a','#e88ad0','#f4efe4','#6ab0ff');if(s.desert)P.push('#e8d2a0','#d9c08a','#f0e0b8');
 if(s.wood)P.push('#c8742a','#a83a2a','#e8c26a','#f2efe6');if(!P.length)P.push('#c8c4bc','#a8a49c','#8e949a','#d8d4cc','#b8b0a4');
 s.walls=P;s.glassC=s.gold?['#c8a860','#8a7a5a','#6f8aa6']:['#6f8aa6','#4a5a6e','#8aa4bc','#3a4656','#7a8a9a'];
 s.ground=s.desert?'#d9c08a':s.snow?'#8aa070':'#5f8f50';s.walk=pal[1];s.asph='#34363c';
 return s}
D.style=dsStyle;

/* ---------- geometry helpers (all in the city's local frame) ---------- */
const own=m=>{m.userData.dsOwn=1;if(m.geometry)m.geometry.userData.dsOwn=1;return m};
const mkG=()=>{const G=xgNew();G.all=1;return G};
const bx=(G,w,h,d,c,x,y,z,ry,tc)=>xgBox(G,w,h,d,c,x,y,z,ry,tc);
function flushTo(G,par,mat){return xgFlush(G,mat).forEach(m=>{scene.remove(m);own(m);par.add(m)})}
function quadY(G,x0,z0,x1,z1,y,c){xgQuad(xgCell(G,(x0+x1)/2,(z0+z1)/2),[[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],c)}
/* faces seen by the camera: +z (south) and +x (east) */
function quadZ(G,x0,x1,y0,y1,z,c){xgQuad(xgCell(G,(x0+x1)/2,z),[[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],c)}
function quadX(G,z0,z1,y0,y1,x,c){xgQuad(xgCell(G,x,(z0+z1)/2),[[x,y0,z1],[x,y0,z0],[x,y1,z0],[x,y1,z1]],c)}
function gable(G,x0,z0,x1,z1,y,h,col,wall,alongX){const B=xgCell(G,(x0+x1)/2,(z0+z1)/2);
 if(alongX){const m=(z0+z1)/2;xgQuad(B,[[x0,y,z1],[x1,y,z1],[x1,y+h,m],[x0,y+h,m]],col);xgQuad(B,[[x1,y,z0],[x0,y,z0],[x0,y+h,m],[x1,y+h,m]],col);xgTri(B,[x1,y,z1],[x1,y,z0],[x1,y+h,m],wall);xgTri(B,[x0,y,z0],[x0,y,z1],[x0,y+h,m],wall)}
 else{const m=(x0+x1)/2;xgQuad(B,[[x1,y,z1],[x1,y,z0],[m,y+h,z0],[m,y+h,z1]],col);xgQuad(B,[[x0,y,z0],[x0,y,z1],[m,y+h,z1],[m,y+h,z0]],col);xgTri(B,[x0,y,z1],[x1,y,z1],[m,y+h,z1],wall);xgTri(B,[x1,y,z0],[x0,y,z0],[m,y+h,z0],wall)}}
function dome(G,r,x,y,z,col,tip){xgPrism(G,r,r*.92,r*.35,14,col,x,y,z,{cap:false});xgPrism(G,r*.92,r*.68,r*.35,14,col,x,y+r*.35,z,{cap:false});xgPrism(G,r*.68,r*.3,r*.3,14,col,x,y+r*.7,z,{cap:false});xgPrism(G,r*.3,0,r*.2,14,col,x,y+r,z);if(tip)xgPrism(G,.12,0,r*.6,6,tip,x,y+r*1.15,z)}
function tree(G,x,z,col,k){k=k||1;const t=(w,h,d,c,cx,cy,cz)=>xgBox(G,w,h,d,c,cx,cy,cz);if(typeof blkTree=='function'){try{return blkTree(t,x,z,.75*k,3,col)}catch(e){}}
 bx(G,.3,1.6*k,.3,'#6a4a2a',x,.8*k,z);bx(G,1.8*k,1.4*k,1.8*k,col,x,2.1*k,z);bx(G,1.2*k,.9*k,1.2*k,col,x,3*k,z)}
function palm(G,x,z,h){h=h||6;for(let i=0;i<6;i++)bx(G,.34-i*.02,h/6+.02,.34-i*.02,i%2?'#8a6a42':'#7a5a38',x+Math.sin(i*.5)*.18*i,h/12+i*h/6,z);const tx=x+Math.sin(2.5)*.9,ty=h+.1;
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2;xgBox(G,2.6,.12,.5,i%2?'#3f8a3a':'#4a9a42',tx+Math.cos(a)*1.1,ty-.25,z+Math.sin(a)*1.1,-a)}bx(G,.5,.5,.5,'#6a5a2a',tx,ty,z)}
/* canvas atlas for signs, billboards and murals: rects are packed in shelves, uv = [u0,v0,u1,v1] */
function mkAtlas(){const S=2048,SW=4096,c=document.createElement('canvas');c.width=SW;c.height=S;const x=c.getContext('2d');
 /* shelf packing: one shelf per sign height, so short shop signs don't waste the height of tall ones */
 const A={c,x,S,cy:0,sh:[],tex:null,K:{},add(w,h,fn,key){if(key&&A.K[key])return A.K[key];let sf=A.sh.find(q=>q.h==h&&q.cx+w<=SW);if(!sf){if(A.cy+h>S){A.miss=(A.miss||0)+1;return A.blank||null}sf={y:A.cy,h,cx:0};A.sh.push(sf);A.cy+=h+2}
  const r={x:sf.cx,y:sf.y,w,h};sf.cx+=w+2;
  x.save();x.translate(r.x,r.y);x.beginPath();x.rect(0,0,w,h);x.clip();try{fn(x,w,h)}catch(e){}x.restore();r.uv=[r.x/SW,1-(r.y+h)/S,(r.x+w)/SW,1-r.y/S];if(key)A.K[key]=r;return r},
  done(){const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;A.tex=t;return t}};
 return A}
const QB=()=>({P:[],U:[],I:[]});
function qAdd(q,pts,uv){const k=q.P.length/3;pts.forEach(p=>q.P.push(p[0],p[1],p[2]));const[u0,v0,u1,v1]=uv;q.U.push(u0,v0,u1,v0,u1,v1,u0,v1);q.I.push(k,k+1,k+2,k,k+2,k+3)}
function qFace(q,f,c,a,b,y0,y1,uv){if(!uv)return;if(f=='z')qAdd(q,[[a,y0,c],[b,y0,c],[b,y1,c],[a,y1,c]],uv);else qAdd(q,[[c,y0,b],[c,y0,a],[c,y1,a],[c,y1,b]],uv)}
function qMesh(q,mat){if(!q.I.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(q.P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(q.U,2));g.setIndex(q.I);g.computeBoundingSphere();return own(new THREE.Mesh(g,mat))}
/* window / neon / lamp material: glass colour by day, its own vertex colour (lit or dark) at night */
const WU={uN:{value:0},uDay:{value:new THREE.Color('#8fa6bc')}};
function winMat(){const m=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true});m.onBeforeCompile=sh=>{sh.uniforms.uN=WU.uN;sh.uniforms.uDay=WU.uDay;
 sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform float uN;uniform vec3 uDay;\nvoid main() {').replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb=mix(uDay*(.62+.38*vColor.g),vColor,uN);')};
 m.customProgramCacheKey=()=>'dswin';return m}
D.winMat=winMat;D.WU=WU;D.mkG=mkG;D.own=own;D.flushTo=flushTo;D.quadY=quadY;D.quadZ=quadZ;D.quadX=quadX;D.gable=gable;D.dome=dome;D.QB=QB;D.qFace=qFace;D.qAdd=qAdd;D.qMesh=qMesh;D.signArt=(...a)=>signArt(...a);D.posterArt=(...a)=>posterArt(...a);D.fitF=(...a)=>fitF(...a);

/* ---------- sign painting ---------- */
const CJK=l=>l=='ja'||l=='zh'||l=='ko';
const SFONT='"Trebuchet MS","Noto Sans","Noto Sans CJK JP","Hiragino Sans","Microsoft YaHei","Malgun Gothic",Arial,sans-serif';
function fitF(x,t,size,w,bold){let s=size;x.font=(bold===false?'':'bold ')+s+'px '+SFONT;while(x.measureText(t).width>w&&s>8){s--;x.font=(bold===false?'':'bold ')+s+'px '+SFONT}return s}
function signArt(x,W,H,t,o){o=o||{};const bg=o.bg||'#14121a',fg=o.fg||'#fff';x.fillStyle=bg;x.fillRect(0,0,W,H);
 if(o.neon){x.strokeStyle=fg;x.lineWidth=4;x.shadowColor=fg;x.shadowBlur=14;x.strokeRect(6,6,W-12,H-12)}else{x.fillStyle=o.trim||'rgba(255,255,255,.18)';x.fillRect(0,H-6,W,6)}
 x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';if(o.neon){x.shadowColor=fg;x.shadowBlur=18}
 fitF(x,t,Math.round(H*.6),W-24);x.fillText(t,W/2,H/2+2);x.shadowBlur=0}
function vSignArt(x,W,H,t,o){o=o||{};x.fillStyle=o.bg||'#120e1c';x.fillRect(0,0,W,H);x.strokeStyle=o.fg;x.lineWidth=4;x.shadowColor=o.fg;x.shadowBlur=12;x.strokeRect(4,4,W-8,H-8);
 const ch=[...t].slice(0,5),cs=Math.min(W*.7,(H-20)/ch.length*.9);x.font='bold '+Math.round(cs)+'px '+SFONT;x.fillStyle=o.fg;x.textAlign='center';x.textBaseline='middle';
 ch.forEach((c,i)=>x.fillText(c,W/2,14+(i+.5)*(H-28)/ch.length));x.shadowBlur=0}
function billArt(x,W,H,k,s,r){const g=x.createLinearGradient(0,0,W,H),A=[s.acc,s.neon,'#ff3a7a','#3ad0ff','#ffd23d','#7a4aff'];g.addColorStop(0,A[k%6]);g.addColorStop(1,A[(k+2)%6]);x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<6;i++){x.beginPath();x.arc(r()*W,r()*H,20+r()*80,0,7);x.fill()}
 const b=BRANDS[k%BRANDS.length],w=dw(s.lang).shop,loc=s.lang=='en'?'':w[(k*3)%w.length];
 x.fillStyle='rgba(0,0,0,.25)';if(k%3==0){x.fillRect(W*.68,H*.15,W*.16,H*.72);x.fillStyle='#fff';x.fillRect(W*.7,H*.2,W*.12,H*.6)}else if(k%3==1){x.beginPath();x.arc(W*.78,H*.5,H*.32,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(W*.78,H*.5,H*.2,0,7);x.fill()}else{x.fillRect(W*.66,H*.25,W*.24,H*.5)}
 x.fillStyle='#fff';x.textAlign='left';x.textBaseline='middle';x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=6;fitF(x,b,Math.round(H*.3),W*.58);x.fillText(b,W*.05,H*.38);
 if(loc){fitF(x,loc,Math.round(H*.2),W*.58,false);x.fillText(loc,W*.05,H*.7)}else{fitF(x,['NEW','NOW ON','TRY IT','#1'][k%4],Math.round(H*.16),W*.5,false);x.fillText(['NEW','NOW ON','TRY IT','#1'][k%4],W*.05,H*.7)}x.shadowBlur=0}
function posterArt(x,W,H,s,d){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0618');g.addColorStop(1,s.acc);x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<9;i++){x.strokeStyle=i%2?s.neon:'#ffffff';x.globalAlpha=.25;x.lineWidth=3;x.beginPath();x.moveTo(W/2,H*1.1);x.lineTo(i*W/8,0);x.stroke()}x.globalAlpha=1;
 x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.shadowColor=s.neon;x.shadowBlur=16;const n=(typeof S!='undefined'&&S.artist?S.artist:'Your name').toUpperCase();
 fitF(x,n,Math.round(H*.32),W-30);x.fillText(n,W/2,H*.36);x.shadowBlur=0;fitF(x,'LIVE · '+(d.venue?d.venue.n:'Stadium').toUpperCase(),Math.round(H*.14),W-30);x.fillStyle=s.neon;x.fillText('LIVE · '+(d.venue?d.venue.n:'Stadium').toUpperCase(),W/2,H*.66);
 x.fillStyle='#fff';fitF(x,wtPlace(d).toUpperCase(),Math.round(H*.1),W-30,false);x.fillText(wtPlace(d).toUpperCase(),W/2,H*.84)}
function muralArt(x,W,H,s,r){x.fillStyle=pick(['#f4efe4','#1d1a2a','#2a6a8a',s.acc]);x.fillRect(0,0,W,H);const A=[s.acc,s.neon,'#ff3a7a','#3ad0ff','#ffd23d','#2fe68a','#7a4aff','#ff8a2a'];
 for(let i=0;i<14;i++){x.fillStyle=A[(r()*A.length)|0];x.beginPath();if(r()<.5)x.arc(r()*W,r()*H,10+r()*50,0,7);else{x.moveTo(r()*W,r()*H);x.lineTo(r()*W,r()*H);x.lineTo(r()*W,r()*H)}x.fill()}
 x.strokeStyle='#111';x.lineWidth=5;x.beginPath();x.arc(W*.5,H*.5,H*.28,0,7);x.stroke();x.fillStyle='#111';x.fillRect(W*.42,H*.42,8,8);x.fillRect(W*.55,H*.42,8,8)}

/* ---------- the city ---------- */
function dsLayout(C){const s=C.s,r=C.r,RR=(a,b)=>a+r()*(b-a);
 C.W=s.big?440:260;C.Dz=s.big?290:200;const W=C.W;C.hr=4;C.sw=3.2;
 const rx=[86];while(rx[rx.length-1]<W-(s.big?128:110))rx.push(rx[rx.length-1]+Math.round(s.big?RR(42,50):RR(36,44)));C.rx=rx;C.sx0=rx[rx.length-1];
 C.wz=s.water?C.Dz-30:C.Dz+40;/* water starts here (south) */
 const rz=[18];while(rz[rz.length-1]<(s.water?C.wz-26:C.Dz-24))rz.push(rz[rz.length-1]+Math.round(s.big?RR(34,40):RR(30,36)));C.rz=rz;
 C.zMax=s.water?C.wz-1:C.Dz;C.cz=Math.round((rz[0]+rz[rz.length-1])/2);C.mid=rz.reduce((a,z)=>Math.abs(z-C.cz)<Math.abs(a-C.cz)?z:a,rz[0]);
 C.cx=(rx[0]+C.sx0)/2;C.canalZ=null;if(s.canal&&rz.length>3){C.canalZ=rz[1]}
 /* blocks */
 C.blocks=[];for(let i=0;i<rx.length-1;i++)for(let j=0;j<rz.length-1;j++){const e=C.hr+C.sw;C.blocks.push({i,j,x0:rx[i]+e,x1:rx[i+1]-e,z0:rz[j]+e,z1:rz[j+1]-e})}
 /* the plaza of the stadium, the airport and the hotel */
 C.plaza={x0:C.sx0+C.hr+1,x1:W-3,z0:rz[0]-2,z1:rz[rz.length-1]+2};
 const pa=Math.min(46,(C.plaza.x1-C.plaza.x0)/2-5);C.st={x:(C.plaza.x0+C.plaza.x1)/2,a:pa,b:pa*.8};C.st.z=C.plaza.z0+C.st.b+4;
 if(C.st.z+C.st.b+16>C.plaza.z1){C.st.b=Math.max(22,(C.plaza.z1-C.plaza.z0-22)/2);C.st.z=C.plaza.z0+C.st.b+3}
 C.air={x0:22,x1:66,z0:C.mid-26,z1:C.mid+26};
 const inner=C.blocks.filter(b=>b.i>0&&b.i<rx.length-2&&b.j>0&&b.j<rz.length-2&&C.canalZ==null);
 C.park=inner.length?inner[(r()*inner.length)|0]:C.blocks[Math.min(C.blocks.length-1,(rx.length-1)+1)];if(C.park)C.park.park=1;
 const hb=C.blocks.filter(b=>b.i==0&&b.z1<=C.mid+1&&b.z0>=C.mid-40).pop()||C.blocks.find(b=>b.i==0);if(hb){hb.hotel=1;C.hotelB=hb}
 const cb=C.blocks.filter(b=>!b.park&&!b.hotel&&b.i==Math.floor((rx.length-1)/2));C.clubB=cb[Math.floor(cb.length/2)]||C.blocks.find(b=>!b.park&&!b.hotel);if(C.clubB)C.clubB.club=1;
 C.landB=null;{const lb=C.blocks.filter(b=>!b.park&&!b.hotel&&!b.club&&b.i>0&&b!==C.park).sort((a,b)=>Math.hypot((a.x0+a.x1)/2-C.cx,(a.z0+a.z1)/2-C.cz)-Math.hypot((b.x0+b.x1)/2-C.cx,(b.z0+b.z1)/2-C.cz));C.landB=lb[0]||null;if(C.landB)C.landB.land=1}}

/* colliders and interaction points live in local coords */
const col=(C,x0,z0,x1,z1)=>C.cols.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);
function addInt(C,x,z,r,l,a,room){const o={x:OX+x,z:OZ+z,r,l,a,ds:1};C.ints.push(o);return o}
D.addInt=(x,z,r,l,a)=>{if(D.building)return addInt(D.building,x,z,r,l,a);if(!D.C)return null;const o=addInt(D.C,x,z,r,l,a);INT.push(o);return o};D.col=(x0,z0,x1,z1)=>{const C=D.building||D.C;return C&&col(C,x0,z0,x1,z1)};

function dsGround(C){const s=C.s,G=mkG(),W=C.W,Dz=C.Dz,hr=C.hr;
 const gm=own(new THREE.Mesh(new THREE.PlaneGeometry(2600,2600),new THREE.MeshLambertMaterial({color:s.ground})));gm.rotation.x=-Math.PI/2;gm.position.set(W/2,-.06,Dz/2-200);C.g.add(gm);
 quadY(G,0,0,W,C.zMax,0,s.walk);/* paving everywhere, roads on top */
 const asph=(x0,z0,x1,z1)=>quadY(G,x0,z0,x1,z1,.02,s.asph),mark=(x0,z0,x1,z1,c)=>quadY(G,x0,z0,x1,z1,.035,c||'#e8e4d8');
 const zA=C.rz[0],zB=C.rz[C.rz.length-1],xA=C.rx[0],xB=C.sx0;
 C.rx.forEach(x=>{asph(x-hr,zA-hr,x+hr,zB+hr);for(let z=zA+hr+1;z<zB-hr;z+=5)mark(x-.08,z,x+.08,z+2.4);quadY(G,x-hr-.25,zA-hr,x-hr,zB+hr,.05,'#8a8a86');quadY(G,x+hr,zA-hr,x+hr+.25,zB+hr,.05,'#8a8a86')});
 C.rz.forEach(z=>{if(z===C.canalZ)return;const x1=z===C.mid?C.plaza.x0+6:xB+hr,x0=z===C.mid?66:xA-hr;asph(x0,z-hr,x1,z+hr);for(let x=x0+2;x<x1-2;x+=5){if(C.rx.some(rx=>Math.abs(x+1.2-rx)<hr+1))continue;mark(x,z-.08,x+2.4,z+.08)}
  quadY(G,x0,z-hr-.25,x1,z-hr,.05,'#8a8a86');quadY(G,x0,z+hr,x1,z+hr+.25,.05,'#8a8a86')});
 /* paving slabs along the kerbs and manhole covers in the road */
 const jn=dk(s.walk,.86),sw=3.2;C.rx.forEach(x=>{[-1,1].forEach(sd=>{const a=x+sd*(hr+.25),b=x+sd*(hr+.25+sw),lo=Math.min(a,b),hi=Math.max(a,b);quadY(G,lo,zA-hr,hi,zB+hr,.004,dk(s.walk,.96));quadY(G,(a+b)/2-.04,zA-hr,(a+b)/2+.04,zB+hr,.008,jn);for(let z=zA-hr;z<zB+hr;z+=1.6)quadY(G,lo,z,hi,z+.08,.008,jn)});for(let z=zA+11;z<zB-6;z+=23)quadY(G,x+hr*.35-.45,z-.45,x+hr*.35+.45,z+.45,.03,'#3a3a3a')});
 C.rz.forEach(z=>{if(z===C.canalZ)return;const x1=z===C.mid?C.plaza.x0+6:xB+hr,x0=z===C.mid?66:xA-hr;[-1,1].forEach(sd=>{const a=z+sd*(hr+.25),b=z+sd*(hr+.25+sw),lo=Math.min(a,b),hi=Math.max(a,b);quadY(G,x0,lo,x1,hi,.004,dk(s.walk,.96));quadY(G,x0,(a+b)/2-.04,x1,(a+b)/2+.04,.008,jn);for(let x=x0;x<x1;x+=1.6)quadY(G,x,lo,x+.08,hi,.008,jn)});for(let x=x0+13;x<x1-6;x+=23){if(C.rx.some(rx=>Math.abs(x-rx)<hr+2))continue;quadY(G,x-.45,z-hr*.35-.45,x+.45,z-hr*.35+.45,.03,'#3a3a3a')}});
 /* zebra crossings at every junction */
 C.rx.forEach(x=>C.rz.forEach(z=>{if(z===C.canalZ)return;for(let k=-3;k<=3;k++){mark(x+k*1.05-.35,z+hr+.4,x+k*1.05+.35,z+hr+2.6);mark(x+hr+.4,z+k*1.05-.35,x+hr+2.6,z+k*1.05+.35)}}));
 /* airport forecourt road and drop-off */
 asph(66,C.air.z0-6,xA-hr,C.air.z1+6);quadY(G,66.5,C.air.z0,67.2,C.air.z1,.05,'#d8d8d0');
 /* water, quay or beach */
 if(s.water){const wm=new THREE.MeshLambertMaterial({color:'#2f7fb8',transparent:true,opacity:.92});C.waterM=wm;
  const tx=fTex(64,64,(x)=>{x.fillStyle='#3a8ac4';x.fillRect(0,0,64,64);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;for(let i=0;i<7;i++){x.beginPath();x.moveTo((i*19)%64,(i*23)%64);x.quadraticCurveTo((i*19)%64+6,(i*23)%64-4,(i*19)%64+12,(i*23)%64);x.stroke()}});
  tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(60,30);wm.map=tx;C.waterTx=tx;
  const w=own(new THREE.Mesh(new THREE.PlaneGeometry(2400,700),wm));w.rotation.x=-Math.PI/2;w.position.set(W/2,-.25,C.wz+350);C.g.add(w);
  if(s.beach){quadY(G,0,C.wz-12,W,C.wz+14,.01,'#ecd8a6');for(let x=8;x<W;x+=16){bx(G,.1,2.2,.1,'#ddd',x,1.1,C.wz-4);xgPrism(G,1.6,0,.6,8,pick([s.acc,s.neon,'#ff5a5a','#3ad0ff']),x,2.1,C.wz-4)}col(C,0,C.wz+8,W,C.wz+40)}
  else{bx(G,W,.5,1,'#8a8a86',W/2,.0,C.wz+.5);for(let x=4;x<W;x+=6)bx(G,.12,1,.12,'#3a3a3a',x,.5,C.wz-.2);bx(G,W,.08,.12,'#3a3a3a',W/2,1,C.wz-.2);col(C,0,C.wz,W,C.wz+40)}}
 if(C.canalZ!=null){const z=C.canalZ,wm=C.waterM||new THREE.MeshLambertMaterial({color:'#2f6f98'});const cm=own(new THREE.Mesh(new THREE.PlaneGeometry(C.sx0-C.rx[0]+2*hr,hr*2-1),wm));cm.rotation.x=-Math.PI/2;cm.position.set((C.rx[0]+C.sx0)/2,-.2,z);C.g.add(cm);
  quadY(G,C.rx[0]-hr,z-hr,C.sx0+hr,z+hr,-.4,'#2a5a78');bx(G,C.sx0-C.rx[0]+2*hr,.4,.4,'#8a7a6a',(C.rx[0]+C.sx0)/2,.1,z-hr+.2);bx(G,C.sx0-C.rx[0]+2*hr,.4,.4,'#8a7a6a',(C.rx[0]+C.sx0)/2,.1,z+hr-.2);
  let x0=C.rx[0]-hr;C.rx.forEach(x=>{col(C,x0,z-hr+.4,x-hr,z+hr-.4);x0=x+hr;bx(G,hr*2,.25,hr*2+.6,'#9a8a7a',x,.05,z);bx(G,.2,.8,hr*2+.6,'#6a5a4a',x-hr,.4,z);bx(G,.2,.8,hr*2+.6,'#6a5a4a',x+hr,.4,z)});col(C,x0,z-hr+.4,C.sx0+hr,z+hr-.4);
  for(let x=C.rx[0]+8;x<C.sx0;x+=22){if(C.rx.some(rx=>Math.abs(x-rx)<hr+3))continue;const b=new THREE.Group();B(b,1.6,.5,5,pick(['#2a4a6a','#6a2a2a','#2a5a3a']),0,.1,0);B(b,1.2,.6,1.8,'#e8e4d8',0,.6,.6);b.position.set(OX+x,-.15,OZ+z+R(-1,1));scene.add(b);C.extra.push(b)}}
 flushTo(G,C.g)}

/* one building = body + windows + signs, faded as one */
function dsUnit(C,G,Gw,q,b){const body=new THREE.MeshLambertMaterial({vertexColors:true}),win=winMat(),U={mats:[body,win],b,o:1};
 flushTo(G,C.g,body);flushTo(Gw,C.g,win);if(q&&q.I.length){const sm=new THREE.MeshBasicMaterial({map:C.A.tex,transparent:true,side:THREE.DoubleSide});C.signM.push(sm);U.mats.push(sm);C.signQ.push([q,sm,U])}
 C.fades.push(U);return U}
/* windows on the two faces the camera sees */
function winBands(C,Gw,x0,z0,x1,z1,y0,y1,fh,lit){const r=C.r;const LIT=['#ffd890','#ffe7b0','#ffcf80','#bfe0ff','#fff2d0'],OFF='#1a1e26';
 for(let y=y0;y+fh*.55<=y1;y+=fh){const yb=y+fh*.3,yt=y+fh*.85;
  for(let face=0;face<2;face++){const a0=face?z0:x0,a1=face?z1:x1;let a=a0+.45;while(a<a1-.6){const L=Math.min(a1-.45-a,1+r()*2.6),c=r()<lit?LIT[(r()*5)|0]:OFF;
   if(face)quadX(Gw,a,a+L,yb,yt,x1+.03,c);else quadZ(Gw,a,a+L,yb,yt,z1+.03,c);a+=L+.35}}}}
function shopFront(C,G,Gw,q,face,x0,z0,x1,z1,name,awn){/* ground floor: glass, door, awning, sign above */
 const s=C.s,c=face=='z'?z1:x1,a0=face=='z'?x0:z0,a1=face=='z'?x1:z1,w=a1-a0;if(w<3)return null;
 const glass=(A,Bv,y0,y1,col)=>face=='z'?quadZ(Gw,A,Bv,y0,y1,c+.04,col):quadX(Gw,A,Bv,y0,y1,c+.04,col);
 glass(a0+.4,a1-.4,.15,2.5,pick(['#ffe2a8','#fff0cc','#d8f0ff']));glass((a0+a1)/2-.6,(a0+a1)/2+.6,0,2.4,'#2a2420');
 const ac=awn||pick([s.acc,'#c0392b','#2f6fb5','#2a8a4a','#e6b422','#8e44ad']);
 if(face=='z')for(let i=0;i<Math.floor(w/1.2);i++)xgBox(G,1.2,.12,1.1,i%2?ac:'#f4f0e8',a0+.6+i*1.2,2.85,c+.55,0);else for(let i=0;i<Math.floor(w/1.2);i++)xgBox(G,1.1,.12,1.2,i%2?ac:'#f4f0e8',c+.55,2.85,a1-.6-i*1.2,0);
 const neon=C.r()<C.s.neonK*.8,so=neon?{bg:'#120e1c',fg:pick([s.neon,s.acc,'#ff4fa8','#4fd8ff','#ffe14d']),neon:1}:{bg:ac,fg:'#fff'},uv=C.A.add(224,56,(x,W,H)=>signArt(x,W,H,name,so),'s'+name+so.bg+so.fg);
 const sw=Math.min(w-.6,5);qFace(q,face,c+.08,(a0+a1)/2-sw/2,(a0+a1)/2+sw/2,3.05,3.05+sw/4,uv&&uv.uv);
 return{x:face=='z'?(a0+a1)/2:c+1.2,z:face=='z'?c+1.2:(a0+a1)/2}}

function dsBuildings(C){const s=C.s,r=C.r,RR=(a,b)=>a+r()*(b-a),words=dw(s.lang).shop,cx=C.cx,cz=C.cz,maxD=Math.hypot(C.sx0-cx,C.Dz/2);
 C.blocks.forEach(bk=>{if(bk.park){dsPark(C,bk);return}if(bk.land){let ok=false;if(D.landmark)try{ok=D.landmark(C,bk)}catch(e){console.error('landmark',e)}if(!ok)dsLandmark(C,bk);return}
  /* split the block into lots: one or two rows deep, 8-18 wide */
  const lots=[],deep=bk.z1-bk.z0>15,back=deep&&!bk.hotel&&r()<.45,rows=back?[[bk.z0,(bk.z0+bk.z1)/2-1.5],[(bk.z0+bk.z1)/2+1.5,bk.z1]]:deep?[[(bk.z0+bk.z1)/2-1,bk.z1]]:[[bk.z0,bk.z1]];
  if(deep&&!back)dsYard(C,bk,bk.z0,(bk.z0+bk.z1)/2-2);
  rows.forEach(([z0,z1],ri)=>{let x=bk.x0;while(x<bk.x1-4){let w=Math.min(bk.x1-x,s.gable?RR(5,8):s.big?RR(9,16):RR(8,14));if(bk.x1-x-w<6)w=bk.x1-x;
   const front=ri==rows.length-1,gap=!bk.hotel&&!bk.club&&lots.length&&r()<(front?.16:.3)&&w<bk.x1-bk.x0-6;
   if(gap)dsGap(C,x+.4,z0,x+w-.8,z1,front);else lots.push({x0:x,x1:x+w-.8,z0,z1,fz:front,fx:x+w>=bk.x1-.01});x+=w}});
  lots.forEach((L,li)=>{const d=Math.hypot((L.x0+L.x1)/2-cx,(L.z0+L.z1)/2-cz)/maxD,cl=Math.max(0,1-d*1.25);
   let h;if(s.big)h=(7+Math.pow(cl,1.6)*80*s.tall)*RR(.55,1.2)+RR(0,5);else h=RR(4.5,10)*(1+cl*.35);h=Math.max(4.2,h);if(!L.fz&&h>30)h*=.7;
   if(bk.hotel&&li==lots.length-1){L.kind='hotel';h=Math.max(h,s.big?34:16)}if(bk.club&&!C.clubSpot&&L.fz){L.kind='club';h=Math.min(h,12)}
   dsBuilding(C,L,h,words,li)})});
 C.signQ.forEach(([q,sm])=>{})}

function dsBuilding(C,L,h,words,li){const s=C.s,r=C.r,RR=(a,b)=>a+r()*(b-a),G=mkG(),Gw=mkG(),q=QB();
 const x0=L.x0,x1=L.x1,z0=L.z0,z1=L.z1,w=x1-x0,dz=z1-z0,mx=(x0+x1)/2,mz=(z0+z1)/2,tall=h>26,low=h<11;C.curTall=tall;
 const wall=tall&&(s.glass||s.tall>.6||r()<.5)?pick(s.glassC):pick(s.walls),dark=dk(wall,.78),fh=2.8,lit=.35+r()*.4;
 col(C,x0,z0,x1,z1);(C.foot=C.foot||[]).push([x0,z0,x1,z1,wall,h]);
 if(tall){/* tower: podium, shaft, setback, crown */
  const pod=Math.min(h,7);bx(G,w,pod,dz,pick(s.walls),mx,pod/2,mz,0,dark);
  const ins=Math.min(1.2,w*.08),h2=r()<.55&&h>40?h*RR(.55,.75):h;bx(G,w-ins*2,h2-pod,dz-ins*2,wall,mx,pod+(h2-pod)/2,mz,0,dk(wall,.9));
  winBands(C,Gw,x0+ins,z0+ins,x1-ins,z1-ins,pod,h2,fh,lit);
  let top=h2;if(h2<h){const i2=ins+Math.min(2.4,w*.14);bx(G,w-i2*2,h-h2,dz-i2*2,dk(wall,1.06),mx,h2+(h-h2)/2,mz);winBands(C,Gw,x0+i2,z0+i2,x1-i2,z1-i2,h2,h,fh,lit);top=h}
  bx(G,w-ins*2+.3,.6,dz-ins*2+.3,dk(wall,.7),mx,top+.3,mz);
  const cr=r();if(s.heli&&cr<.5){xgPrism(G,Math.min(w,dz)*.32,Math.min(w,dz)*.32,.2,12,'#3a3a3a',mx,top+.6,mz);quadY(Gw,mx-1,mz-.15,mx+1,mz+.15,top+.85,'#ffe14d');quadY(Gw,mx-1,mz-1.2,mx-.7,mz+1.2,top+.85,'#ffe14d');quadY(Gw,mx+.7,mz-1.2,mx+1,mz+1.2,top+.85,'#ffe14d')}
  else if(cr<.35){xgPrism(G,.25,.04,RR(6,14),6,'#c8ccd2',mx,top+.6,mz);bx(Gw,.4,.4,.4,'#ff3030',mx,top+.6+10,mz)}else if(cr<.6&&s.gold){xgPrism(G,Math.min(w,dz)*.35,0,RR(6,12),4,'#d8b860',mx,top+.6,mz,{ph:Math.PI/4})}
  else{bx(G,w*.3,2,dz*.3,'#8a8e94',mx-w*.15,top+1.6,mz-dz*.1);bx(G,w*.2,1.4,dz*.25,'#9aa0a6',mx+w*.2,top+1.3,mz+dz*.15)}
  if(s.neonK>.7)quadZ(Gw,x0+ins,x1-ins,top-.25,top+.05,z1-ins+.04,pick([s.neon,s.acc]));
  if(L.kind=='hotel')hotelFront(C,G,Gw,q,L,pod+.6);else{if(L.fz)shopRow(C,G,Gw,q,'z',x0,z0,x1,z1,words);if(L.fx)shopRow(C,G,Gw,q,'x',x0,z0,x1,z1,words)}
  /* billboard high on the tower */
  if(r()<Math.min(.95,s.bill*1.1+.15)){const fz=r()<.5,fw=Math.min((fz?w:dz)-2,12),fhh=fw*.42,y=pod+RR(2,Math.max(3,h2-pod-fhh-2)),k=(r()*30)|0;
   const uv=C.A.add(256,108,(x,W,H)=>billArt(x,W,H,k,s,r),'bill'+k);if(fz)qFace(q,'z',z1-ins+.12,mx-fw/2,mx+fw/2,y,y+fhh,uv&&uv.uv);else qFace(q,'x',x1-ins+.12,mz-fw/2,mz+fw/2,y,y+fhh,uv&&uv.uv);
   if(fz)bx(G,fw+.4,fhh+.4,.15,'#1a1a1e',mx,y+fhh/2,z1-ins+.04);else bx(G,.15,fhh+.4,fw+.4,'#1a1a1e',x1-ins+.04,y+fhh/2,mz);neonFrame(Gw,fz?'z':'x',fz?z1-ins+.14:x1-ins+.14,fz?mx:mz,fw,y,fhh,pick([s.neon,s.acc,'#ff4fa8','#4fd8ff']))}}
 else if(L.kind=='hotel'||!low){/* mid-rise block */
  bx(G,w,h,dz,wall,mx,h/2,mz,0,dark);winBands(C,Gw,x0,z0,x1,z1,3.4,h-.8,fh,lit);
  bx(G,w+.3,.5,dz+.3,dk(wall,.82),mx,h+.25,mz);bx(G,w+.2,.25,dz+.2,dk(wall,.86),mx,3.5,mz);
  if(s.mansard){bx(G,w-.6,2.2,dz-.6,'#5c6370',mx,h+1.35,mz,0,'#4a505a');for(let a=x0+1.2;a<x1-1;a+=2.4){bx(G,.9,1.1,.5,'#e8e2d4',a,h+1.5,z1-.3);quadZ(Gw,a-.3,a+.3,h+1.1,h+1.8,z1-.04,'#ffd890')}
   for(let y=6.2;y<h-1;y+=fh)bx(G,w-.4,.08,.5,'#1d1d22',mx,y,z1+.25)}
  else if(s.terra){gable(G,x0-.3,z0-.3,x1+.3,z1+.3,h,Math.min(3,dz*.25),'#b8583a',wall,1)}
  else{bx(G,w*.25,1.4,dz*.2,'#8a8e94',x0+w*.3,h+.9,mz);if(s.fire&&r()<.7){xgPrism(G,1.1,1.1,2.2,10,'#6a4a2a',x0+w*.75,h+2.6,mz-dz*.2);xgPrism(G,1.2,0,.8,10,'#4a3a2a',x0+w*.75,h+3.7,mz-dz*.2);for(let i=0;i<4;i++)bx(G,.1,1.6,.1,'#333',x0+w*.75+(i%2?.8:-.8),h+.8,mz-dz*.2+(i<2?.8:-.8))}}
  if(s.fire&&w>6){for(let y=4.4;y<h-1;y+=fh){bx(G,3,.1,1,'#1d1d22',mx,y,z1+.5);bx(G,3,.6,.06,'#1d1d22',mx,y+.35,z1+1)}xgBox(G,.1,h-4,.1,'#1d1d22',mx-1.45,h/2+1.2,z1+1)}
  if(s.mural&&r()<.35&&dz>6){const uv=C.A.add(192,192,(x,W,H)=>muralArt(x,W,H,s,r),'m'+((r()*8)|0));qFace(q,'x',x1+.05,z0+.6,Math.min(z1-.6,z0+.6+Math.min(dz-1.2,h-4)),3.6,3.6+Math.min(dz-1.2,h-4),uv&&uv.uv)}
  if(L.kind=='hotel')hotelFront(C,G,Gw,q,L,h);else if(L.kind=='club')clubFront(C,G,Gw,q,L,h);else{if(L.fz)shopRow(C,G,Gw,q,'z',x0,z0,x1,z1,words);if(L.fx)shopRow(C,G,Gw,q,'x',x0,z0,x1,z1,words)}
  if(CJK(s.lang)&&r()<Math.min(.95,s.neonK*1.1)&&h>8){const t=pick(words),fg=pick([s.neon,s.acc,'#ff4fa8','#4fd8ff','#ffe14d']),uv=C.A.add(64,256,(x,W,H)=>vSignArt(x,W,H,t,{fg}),'v'+t+fg);const xs=x1-.5,y=4;
   qAdd(q,[[xs,y,z1+1.3],[xs,y,z1+.1],[xs,y+5,z1+.1],[xs,y+5,z1+1.3]],uv?uv.uv:[0,0,0,0]);bx(G,.12,5.2,1.3,'#111',xs-.08,y+2.5,z1+.7)}
  if(r()<Math.min(.8,s.bill*.8+.12)&&h>9){const fw=Math.min(w-1,9),fhh=fw*.42,k=(r()*30)|0,uv=C.A.add(256,108,(x,W,H)=>billArt(x,W,H,k,s,r),'bill'+k);bx(G,.15,fhh+.6,.15,'#333',mx-fw/3,h+fhh/2,mz);bx(G,.15,fhh+.6,.15,'#333',mx+fw/3,h+fhh/2,mz);bx(G,fw+.3,fhh+.3,.2,'#1a1a1e',mx,h+.9+fhh/2,mz);qFace(q,'z',mz+.12,mx-fw/2,mx+fw/2,h+.9,h+.9+fhh,uv&&uv.uv);neonFrame(Gw,'z',mz+.14,mx,fw,h+.9,fhh,pick([s.neon,s.acc,'#ff4fa8','#4fd8ff']));for(let i=0;i<4;i++)bx(Gw,.25,.25,.5,'#fff2c0',mx-fw/2+fw*(i+.5)/4,h+.75,mz+.5)}}
 else{/* low houses and shops */
  bx(G,w,h,dz,wall,mx,h/2,mz,0,dark);winBands(C,Gw,x0,z0,x1,z1,3.4,h-.5,fh,lit*.8);
  if(s.gable){const st=4,sw=w/st;for(let i=0;i<st;i++){const hh=(st-Math.abs(i-(st-1)/2)*1.4)*.7;bx(G,sw*(1-i*0)+.01,hh,.6,wall,x0+sw*(i+.5),h+hh/2,z1-.3)}bx(G,w,.25,dz,dk(wall,.7),mx,h+.12,mz)}
  else if(s.terra||s.wood||(!s.desert&&r()<.5))gable(G,x0-.3,z0-.3,x1+.3,z1+.3,h,Math.min(2.6,dz*.3),s.terra?'#b8583a':s.wood?'#4a4a4a':pick(['#6a4a3a','#4a4e56','#8a3a2a']),wall,w>=dz);
  else{bx(G,w+.2,.5,dz+.2,dk(wall,.85),mx,h+.25,mz);if(s.desert&&r()<.3)dome(G,Math.min(w,dz)*.28,mx,h+.5,mz,'#f0e8d8')}
  if(L.kind=='club')clubFront(C,G,Gw,q,L,h);else{if(L.fz)shopRow(C,G,Gw,q,'z',x0,z0,x1,z1,words);if(L.fx)shopRow(C,G,Gw,q,'x',x0,z0,x1,z1,words)}}
 dsUnit(C,G,Gw,q,[x0,z0,x1,z1,h+(tall?6:2)])}
/* glowing frame around a sign (lit by the night glow material) */
function neonFrame(Gw,f,c,m,w,y,h,col){const t=.14;if(f=='z'){bx(Gw,w+.5,t,.06,col,m,y-.2,c);bx(Gw,w+.5,t,.06,col,m,y+h+.2,c);bx(Gw,t,h+.5,.06,col,m-w/2-.2,y+h/2,c);bx(Gw,t,h+.5,.06,col,m+w/2+.2,y+h/2,c)}
 else{bx(Gw,.06,t,w+.5,col,c,y-.2,m);bx(Gw,.06,t,w+.5,col,c,y+h+.2,m);bx(Gw,.06,h+.5,t,col,c,y+h/2,m-w/2-.2);bx(Gw,.06,h+.5,t,col,c,y+h/2,m+w/2+.2)}}
/* an empty lot: a pocket square with trees and benches, a small car park or a food stall corner */
function dsGap(C,x0,z0,x1,z1,front){const s=C.s,G=mkG(),r=C.r,mx=(x0+x1)/2,mz=(z0+z1)/2,k=r();
 if(k<.45){quadY(G,x0,z0,x1,z1,.04,s.desert?'#c8b080':'#5a9a4a');quadY(G,mx-.8,z0,mx+.8,z1,.06,dk(s.walk,1.1));
  [[x0+1.6,z0+1.8],[x1-1.6,z0+1.8],[x0+1.6,z1-2.2],[x1-1.6,z1-2.2]].forEach(([x,z])=>{if(x1-x0<5)return;if(s.palm)palm(G,x,z,5);else tree(G,x,z,r()<.3&&CJK(s.lang)?'#f4a8c8':s.tree,.9);col(C,x-.3,z-.3,x+.3,z+.3)});
  if(front){bx(G,2,.12,.6,'#8a5a32',mx-2.4,.5,z1-1.6);bx(G,2,.5,.1,'#8a5a32',mx-2.4,.75,z1-1.9);col(C,mx-3.4,z1-1.9,mx-1.4,z1-1.3)}}
 else if(k<.75){quadY(G,x0,z0,x1,z1,.04,'#4a4c52');for(let x=x0+1;x<x1-1.5;x+=2.6)quadY(G,x,z0+1,x+.1,z0+5,.06,'#e8e8e8');
  for(let x=x0+1.4;x<x1-2;x+=2.6)if(r()<.6){const m=mkS(carb(RI(0,4),pick(['#e6b422','#3b82f6','#2f8f5a','#c0392b','#e8e8ec','#1a1a1a','#9aa0a6'])));m.scale.setScalar(1.3);m.position.set(OX+x+1.2,0,OZ+z0+3);scene.add(m);C.extra.push(m);col(C,x+.3,z0+.9,x+2.1,z0+5.1)}
  bx(G,x1-x0,.9,.2,'#6a6c72',mx,.45,z0+.1)}
 else{quadY(G,x0,z0,x1,z1,.04,dk(s.walk,1.12));const n=Math.max(1,Math.floor((x1-x0)/4));for(let i=0;i<n;i++){const x=x0+2+i*4;if(x>x1-1.5)break;bx(G,2.6,1,1.4,pick(['#c8a868','#a85a3a','#3a6a8a']),x,.5,z1-2.6);bx(G,2.8,.1,1.8,pick([s.acc,'#c0392b','#2a8a4a','#e6b422']),x,2.3,z1-2.6);[-1.3,1.3].forEach(o=>bx(G,.08,1.3,.08,'#333',x+o,1.65,z1-1.8));bx(G,.3,.3,.3,'#ffd890',x,2.1,z1-1.9);col(C,x-1.3,z1-3.3,x+1.3,z1-1.9)}}
 flushTo(G,C.g)}
function dsYard(C,bk,z0,z1){const s=C.s,G=mkG(),r=C.r;quadY(G,bk.x0,z0,bk.x1,z1,.04,s.desert?'#c8b48a':'#6a9a5a');for(let x=bk.x0+3;x<bk.x1-2;x+=r()*5+4){const z=z0+1.5+r()*Math.max(.1,z1-z0-3);if(s.palm)palm(G,x,z,4+r()*2);else tree(G,x,z,s.tree,.8);col(C,x-.3,z-.3,x+.3,z+.3)}flushTo(G,C.g)}
function shopRow(C,G,Gw,q,face,x0,z0,x1,z1,words){const len=face=='z'?x1-x0:z1-z0,n=Math.max(1,Math.round(len/7)),seg=len/n;
 for(let i=0;i<n;i++){const a=(face=='z'?x0:z0)+i*seg,b=a+seg,nm=C.r()<(C.s.lang=='en'?.15:.22)?pick(BRANDS):pick(words);
  const sp=face=='z'?shopFront(C,G,Gw,q,'z',a,z0,b,z1,nm):shopFront(C,G,Gw,q,'x',x0,a,x1,b,nm);
  if(!sp)continue;const door={x:sp.x,z:sp.z,n:nm,k:pick(['food','food','cafe','souv','conv','records']),face,tall:z1-z0>0&&C.curTall};(C.doors=C.doors||[]).push(door);if(C.r()<.16&&C.shops.length<14)C.shops.push(door)}}
function hotelFront(C,G,Gw,q,L,h){const s=C.s,mx=(L.x0+L.x1)/2,z1=L.z1;bx(G,8,.3,3,'#c8b88a',mx,3.2,z1+1.5);[-3.6,3.6].forEach(o=>bx(G,.25,3.2,.25,'#c8b88a',mx+o,1.6,z1+2.8));quadZ(Gw,mx-1.5,mx+1.5,0,2.6,z1+.04,'#ffe2a8');
 const nm=dw(s.lang).hotel,t=(s.lang=='en'?'':nm+' ')+'HOTEL '+(C.d.city||C.d.country).toUpperCase(),uv=C.A.add(512,96,(x,W,H)=>signArt(x,W,H,t,{bg:'#1a1426',fg:'#ffd890',neon:1}));
 qFace(q,'z',z1+.1,mx-Math.min(7,(L.x1-L.x0)/2-.3),mx+Math.min(7,(L.x1-L.x0)/2-.3),h-3,h-3+Math.min(14,L.x1-L.x0-.6)/5.3,uv&&uv.uv);
 C.spots.hotel={x:mx,z:z1+2.4,n:t}}
function clubFront(C,G,Gw,q,L,h){const s=C.s,mx=(L.x0+L.x1)/2,z1=L.z1,cn=(C.d.club&&C.d.club.n)||'Club';bx(G,Math.min(9,L.x1-L.x0),.4,2.2,'#1a1a1e',mx,3.4,z1+1.1);quadZ(Gw,mx-4,mx+4,3.2,3.6,z1+2.22,s.neon);
 quadZ(Gw,mx-1.2,mx+1.2,0,2.6,z1+.04,'#3a1a4a');const uv=C.A.add(512,96,(x,W,H)=>signArt(x,W,H,cn.toUpperCase(),{bg:'#0e0a18',fg:s.neon,neon:1}));qFace(q,'z',z1+.1,mx-4,mx+4,3.8,5.3,uv&&uv.uv);
 const uv2=C.A.add(320,134,(x,W,H)=>posterArt(x,W,H,s,{venue:C.d.club,city:C.d.city,country:C.d.country}));qFace(q,'z',z1+.06,L.x0+.4,L.x0+2.6,.6,1.52,uv2&&uv2.uv);
 C.spots.club={x:mx,z:z1+2.6,n:cn};C.clubSpot=1}
function dsPark(C,bk){const s=C.s,G=mkG(),r=C.r,mx=(bk.x0+bk.x1)/2,mz=(bk.z0+bk.z1)/2;quadY(G,bk.x0,bk.z0,bk.x1,bk.z1,.03,s.desert?'#c8b080':'#5a9a4a');
 quadY(G,bk.x0,mz-1.2,bk.x1,mz+1.2,.05,s.walk);quadY(G,mx-1.2,bk.z0,mx+1.2,bk.z1,.05,s.walk);
 dsFountain(C,G,mx,mz,3.2);
 for(let i=0;i<26;i++){const x=bk.x0+1.5+r()*(bk.x1-bk.x0-3),z=bk.z0+1.5+r()*(bk.z1-bk.z0-3);if(Math.abs(x-mx)<3||Math.abs(z-mz)<3)continue;if(s.palm)palm(G,x,z,5+r()*3);else tree(G,x,z,r()<.25&&CJK(s.lang)?'#f4a8c8':s.tree);col(C,x-.3,z-.3,x+.3,z+.3)}
 [[mx-5,mz+2.2],[mx+5,mz+2.2],[mx-5,mz-2.2],[mx+5,mz-2.2]].forEach(([x,z])=>{bx(G,2,.12,.6,'#8a5a32',x,.5,z);bx(G,2,.5,.1,'#8a5a32',x,.75,z-.3);bx(G,.1,.5,.5,'#333',x-.9,.25,z);bx(G,.1,.5,.5,'#333',x+.9,.25,z)});
 if(s.lang=='ja'){bx(G,.4,4,.4,'#c8282a',mx-2,2,bk.z1-1);bx(G,.4,4,.4,'#c8282a',mx+2,2,bk.z1-1);bx(G,5.6,.35,.5,'#c8282a',mx,3.9,bk.z1-1);bx(G,6.2,.3,.6,'#1a1a1a',mx,4.25,bk.z1-1);bx(G,4.8,.25,.4,'#c8282a',mx,3.2,bk.z1-1);col(C,mx-2.2,bk.z1-1.2,mx-1.8,bk.z1-.8);col(C,mx+1.8,bk.z1-1.2,mx+2.2,bk.z1-.8)}
 C.spots.park={x:mx,z:mz+4};flushTo(G,C.g)}
/* the same two-bowl fountain as the parks back home (ftnBuild in 40-city-fixes.js), with its moving water (41-fountains.js) */
function dsFountain(C,G,x,z,R,o){o=o||{};const st=o.stone||'#c9c1b0',sd=dk(st,.82),n=20,f={x:OX+x,z:OZ+z,R,wy:.54,bowls:[]};
 xgPrism(G,R+.75,R+.75,.1,n,dk(st,.9),x,0,z,{top:dk(st,.95)});xgPrism(G,R,R,.55,n,st,x,.1,z,{cap:false});xgRing(G,R-.35,R,.65,n,dk(st,1.08),x,z);xgPrism(G,R-.35,R-.35,.5,n,sd,x,.15,z,{inv:1});xgPrism(G,R-.35,R-.35,.02,n,'#2f6f8f',x,.13,z);
 const b1=R>2.6?1.7:1.25;xgPrism(G,.5,.38,1.05,10,st,x,.15,z);xgPrism(G,.45,b1,.4,14,st,x,1.15,z,{cap:false});xgRing(G,b1-.12,b1,1.55,14,dk(st,1.08),x,z);xgPrism(G,b1-.12,b1-.12,.25,14,sd,x,1.3,z,{inv:1});f.bowls.push({y:1.5,r:b1});
 xgPrism(G,.2,.16,.7,8,st,x,1.5,z);xgPrism(G,.2,.75,.24,12,st,x,2.15,z,{cap:false});xgRing(G,.65,.75,2.39,12,dk(st,1.08),x,z);xgPrism(G,.65,.65,.15,12,sd,x,2.24,z,{inv:1});f.bowls.push({y:2.35,r:.75});xgPrism(G,.14,.06,.32,6,st,x,2.3,z);f.top=2.62;
 col(C,x-R*.82,z-R*.82,x+R*.82,z+R*.82);
 if(typeof ftnWater=='function'&&typeof FTX=='object'){const had=new Set(scene.children),n0=FTX.L.length;try{ftnWater(f)}catch(e){}scene.children.filter(m=>!had.has(m)).forEach(m=>C.extra.push(m));(C.ftn=C.ftn||[]).push(...FTX.L.slice(n0))}
 return f}
D.fountain=(G,x,z,R,o)=>{const C=D.building||D.C;return C?dsFountain(C,G,x,z,R,o):null};
function dsLandmark(C,bk){const s=C.s,G=mkG(),mx=(bk.x0+bk.x1)/2,mz=(bk.z0+bk.z1)/2,w=bk.x1-bk.x0,dz=bk.z1-bk.z0;quadY(G,bk.x0,bk.z0,bk.x1,bk.z1,.03,dk(s.walk,1.08));
 if(s.temple){bx(G,w*.6,1.2,dz*.6,'#f4f0e8',mx,.6,mz);for(let i=0;i<3;i++){const k=1-i*.22;gable(G,mx-w*.3*k,mz-dz*.3*k,mx+w*.3*k,mz+dz*.3*k,1.2+i*2.4,2.6,i%2?'#2a7a4a':'#c8382a','#e8c060',0)}
  xgPrism(G,.3,0,4,6,'#e8c060',mx,8.4,mz);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>xgPrism(G,.6,0,5,8,'#e8c060',mx+a*w*.26,1.2,mz+b*dz*.26));col(C,mx-w*.3,mz-dz*.3,mx+w*.3,mz+dz*.3)}
 else if(s.minaret){bx(G,w*.5,6,dz*.5,'#e8d8b8',mx,3,mz);dome(G,Math.min(w,dz)*.18,mx,6,mz,'#d8c8a0','#c8a840');[[-1,-1],[1,1]].forEach(([a,b])=>{const x=mx+a*w*.34,z=mz+b*dz*.34;xgPrism(G,.9,.8,16,10,'#e8d8b8',x,0,z);xgRing(G,.8,1.3,10,12,'#c8b890',x,z);xgPrism(G,.8,.7,3,10,'#e8d8b8',x,10,z);xgPrism(G,.7,0,2,10,'#3a8a6a',x,13,z);col(C,x-.9,z-.9,x+.9,z+.9)});col(C,mx-w*.25,mz-dz*.25,mx+w*.25,mz+dz*.25)}
 else if(s.hanok){for(let i=0;i<3;i++){const x=bk.x0+3+i*(w-6)/2.2,z=mz+(i%2?-4:4);bx(G,7,2.6,5,'#e8dcc4',x+3.5,1.3,z);bx(G,7.2,.3,5.2,'#6a4a2a',x+3.5,2.6,z);gable(G,x-.8,z-3.4,x+7.8,z+3.4,2.7,1.8,'#2a2e36','#2a2e36',1);col(C,x,z-2.5,x+7,z+2.5)}}
 else if(s.gate){[-1,1].forEach(a=>{for(let i=0;i<5;i++)bx(G,2.6-i*.4,1.6,2.6-i*.4,i%2?'#6a6258':'#7a7064',mx+a*2.4,.8+i*1.6,bk.z1-3);col(C,mx+a*2.4-1.3,bk.z1-4.3,mx+a*2.4+1.3,bk.z1-1.7)});tree(G,mx-6,mz,s.tree);tree(G,mx+6,mz-3,s.tree)}
 else if(s.ruins){for(let i=0;i<9;i++){const x=bk.x0+3+i*(w-6)/8,hh=i%3==1?2:5.5;xgPrism(G,.55,.5,hh,10,'#e0d2b4',x,0,mz-3);if(i%3!=1)bx(G,1.4,.5,1.4,'#d4c4a4',x,hh,mz-3);col(C,x-.6,mz-3.6,x+.6,mz-2.4)}bx(G,w-6,.8,1.4,'#d4c4a4',mx,5.9,mz-3);
  for(let a=0;a<3;a++){const x=bk.x0+6+a*(w-12)/2;bx(G,1,4,1.6,'#d8b890',x-1.4,2,mz+4);bx(G,1,4,1.6,'#d8b890',x+1.4,2,mz+4);bx(G,3.8,1,1.6,'#d8b890',x,4.5,mz+4);col(C,x-1.9,mz+3.2,x+1.9,mz+4.8)}}
 C.spots.land={x:mx,z:bk.z1+1};flushTo(G,C.g)}

/* street furniture along the pavements: lamps, trees, benches, bins, local bits */
function dsStreets(C){const s=C.s,G=mkG(),Gw=mkG(),r=C.r,hr=C.hr,e=hr+.7,wv=hr+C.sw-.45;/* kerb-side furniture at e, wall-side at wv, people walk between */
 const lamp=(x,z)=>{bx(G,.14,4.2,.14,'#2a2a2e',x,2.1,z);bx(G,.9,.1,.1,'#2a2a2e',x+.4,4.2,z);bx(Gw,.4,.18,.3,'#fff0b8',x+.75,4.1,z);col(C,x-.12,z-.12,x+.12,z+.12)};
 C.rz.forEach(z=>{if(z===C.canalZ)return;for(let x=C.rx[0]+8;x<C.sx0-4;x+=14){if(C.rx.some(rx=>Math.abs(x-rx)<e+2))continue;lamp(x,z+e);
   if(r()<.5){const tx=x+7;if(!C.rx.some(rx=>Math.abs(tx-rx)<e+2)){if(s.palm)palm(G,tx,z+e,5+r()*2);else tree(G,tx,z+e,s.tree,.8);col(C,tx-.3,z+e-.3,tx+.3,z+e+.3)}}
   if(r()<.18){bx(G,.5,.8,.5,'#3a4a3a',x+3,.4,z-e);col(C,x+2.7,z-e-.3,x+3.3,z-e+.3)}
   if(s.vend&&r()<.35){bx(G,1,1.9,.7,pick(['#e8e8ec','#c8282a','#2a6ab8']),x+4.5,.95,z-wv);quadZ(Gw,x+4.1,x+4.9,.9,1.7,z-wv+.36,'#e8f4ff');col(C,x+4,z-wv-.35,x+5,z-wv+.35)}
   if(s.cab=='#f2c418'&&r()<.25){bx(G,.35,.6,.35,'#c8282a',x+5,.3,z+e+.3);col(C,x+4.8,z+e+.1,x+5.2,z+e+.5)}
   if(s.bus=='#d7262f'&&r()<.12){bx(G,.9,2.4,.9,'#c8202a',x+5,1.2,z-e);quadZ(Gw,x+4.6,x+5.4,1.2,2.1,z-e+.46,'#ffe8b0');col(C,x+4.5,z-e-.5,x+5.5,z-e+.5)}
   if(s.lantern&&r()<.6){bx(G,.04,.5,.04,'#222',x+2,4.3,z+hr);bx(Gw,.5,.6,.5,pick(['#ff4a2a','#ffb02a']),x+2,3.8,z+hr)}
   if(s.bike&&r()<.4){for(let k=0;k<3;k++){const b=new THREE.Group();B(b,.06,.6,1.4,'#222',0,.4,0);B(b,.08,.7,.08,'#222',0,.7,.4);B(b,.5,.06,.06,'#222',0,1,.4);b.position.set(OX+x+5+k*.5,0,OZ+z-e-.2);scene.add(b);C.extra.push(b)}}}
  if(s.picado&&r()<.6){const x0=C.rx[0]+hr,x1=C.sx0-hr;for(let x=x0;x<x1;x+=1.2)bx(G,.8,.7,.02,pick([s.acc,s.neon,'#ffd23d','#3ad0ff','#ff6a2a','#9a4aff']),x,5.2+Math.sin((x-x0)/(x1-x0)*Math.PI*3)*.3,z)}});
 C.rx.forEach(x=>{for(let z=C.rz[0]+8;z<C.rz[C.rz.length-1]-4;z+=14){if(C.rz.some(rz=>Math.abs(z-rz)<e+2))continue;lamp(x+e,z);if(r()<.45&&!s.palm)tree(G,x-e,z+7,s.tree,.8),col(C,x-e-.3,z+6.7,x-e+.3,z+7.3);else if(r()<.45&&s.palm)palm(G,x-e,z+7,5+r()*2),col(C,x-e-.3,z+6.7,x-e+.3,z+7.3)}});
 /* hills, mountains and a distant skyline around the city, mostly for the arrival flight */
 const R2=C.r;if(s.hills||s.snow||s.flatTop){for(let i=0;i<10;i++){const x=-80+i*(C.W+160)/9+R2()*20,z=-90-R2()*80,rr=50+R2()*50,hh=s.flatTop&&i==4?60:30+R2()*50;
   if(s.flatTop&&i==4){xgPrism(G,rr*1.6,rr*1.1,hh,12,'#6a6a5a',x,0,z,{sx:2,sz:.6})}else{xgPrism(G,rr,0,hh,9,s.desert?'#c8a868':'#5e8a52',x,0,z,{ph:R2()});if(s.snow)xgPrism(G,rr*.28,0,hh*.28,9,'#f4f8ff',x,hh*.72,z,{ph:0})}
   if(s.colour&&s.hills&&i%3==1)for(let k=0;k<30;k++){const a=R2()*Math.PI*2,d=R2()*rr*.6,hx=x+Math.cos(a)*d,hz=z+Math.abs(Math.sin(a))*d+rr*.25,y=hh*(1-d/rr)*.7;bx(G,2,1.6,2,pick(s.walls),hx,y+.8,hz)}}}
 if(s.big){const ring=(x0,x1,z0,z1)=>{for(let i=0;i<40;i++){const x=x0+R2()*(x1-x0),z=z0+R2()*(z1-z0),h=10+R2()*R2()*70*s.tall+10,w=6+R2()*10,c=R2()<.5?pick(s.glassC):pick(s.walls);bx(G,w,h,w,c,x,h/2,z);winBands(C,Gw,x-w/2,z-w/2,x+w/2,z+w/2,3,h,3.2,.4)}};
  ring(C.rx[0],C.W,-110,-30);ring(C.W+30,C.W+150,-60,C.zMax)}
 flushTo(G,C.g);flushTo(Gw,C.g,C.glowM)}

/* ---------- airport ---------- */
function dsPlaneModel(liv){const g=new THREE.Group(),m=c=>new THREE.MeshLambertMaterial({color:c}),wh=m('#f4f6f8'),ac=m(liv||'#2fe68a'),gr=m('#9aa0a8'),dkm=m('#22262c');
 const fus=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,24,14),wh);fus.rotation.z=Math.PI/2;g.add(fus);
 const nose=new THREE.Mesh(new THREE.SphereGeometry(1.7,14,10,0,Math.PI*2,0,Math.PI/2),wh);nose.rotation.z=-Math.PI/2;nose.position.x=12;nose.scale.y=1.6;g.add(nose);
 const tail=new THREE.Mesh(new THREE.CylinderGeometry(1.7,.5,7,14),wh);tail.rotation.z=Math.PI/2;tail.position.set(-15.5,.5,0);g.add(tail);
 const st=new THREE.Mesh(new THREE.BoxGeometry(30,.5,.05),ac);st.position.set(-1,.2,1.71);g.add(st);const st2=st.clone();st2.position.z=-1.71;g.add(st2);
 const win=new THREE.Mesh(new THREE.BoxGeometry(20,.3,3.46),dkm);win.position.set(1,.75,0);g.add(win);const ck=new THREE.Mesh(new THREE.BoxGeometry(1.2,.5,2.4),dkm);ck.position.set(12.2,.9,0);g.add(ck);
 [-1,1].forEach(sg=>{const w=new THREE.Mesh(new THREE.BoxGeometry(5,.35,13),wh);w.position.set(-1,-.6,sg*7.5);w.rotation.y=sg*.32;g.add(w);
  const e=new THREE.Mesh(new THREE.CylinderGeometry(.85,.75,3.4,12),gr);e.rotation.z=Math.PI/2;e.position.set(.6,-1.5,sg*5.2);g.add(e);
  const hs=new THREE.Mesh(new THREE.BoxGeometry(2.6,.25,4.4),wh);hs.position.set(-17,.8,sg*2.3);hs.rotation.y=sg*.3;g.add(hs);
  const gearM=new THREE.Mesh(new THREE.BoxGeometry(.6,1.2,.6),dkm);gearM.position.set(-1,-2.1,sg*1.4);g.add(gearM)});
 const fin=new THREE.Mesh(new THREE.BoxGeometry(4,5,.3),ac);fin.position.set(-16.5,3.4,0);fin.rotation.z=-.35;g.add(fin);const ng=new THREE.Mesh(new THREE.BoxGeometry(.5,1.2,.5),dkm);ng.position.set(9.5,-2.1,0);g.add(ng);
 g.traverse(o=>{if(o.isMesh){o.userData.dsOwn=1;o.geometry.userData.dsOwn=1;o.material.userData={dsOwn:1}}});g.scale.setScalar(.75);return g}
D.planeModel=dsPlaneModel;D.tree=tree;D.palm=palm;D.bx=bx;D.CJK=CJK;D.unit=(C,G,Gw,q,b)=>dsUnit(C,G,Gw,q,b);D.shop=(C,sp)=>dsShop(C,sp);D.shopLabel=shopLabel;D.landmarkOld=dsLandmark;
function dsAirport(C){const s=C.s,G=mkG(),Gw=mkG(),q=QB(),a=C.air,mz=(a.z0+a.z1)/2,W=dw(s.lang);
 /* runway, taxiway and apron (airside, behind the terminal) */
 const rwX=-96,z0=a.z0-120,z1=a.z1+120;quadY(G,-140,z0-20,20,z1+20,.005,s.desert?'#cdb688':'#6f9a5a');quadY(G,rwX-14,z0,rwX+14,z1,.02,'#3a3c40');
 for(let z=z0+30;z<z1-30;z+=14)quadY(G,rwX-.3,z,rwX+.3,z+7,.03,'#f4f4f0');for(let k=-5;k<=5;k++){if(!k)continue;quadY(G,rwX+k*2.2-.6,z0+3,rwX+k*2.2+.6,z0+18,.03,'#f4f4f0');quadY(G,rwX+k*2.2-.6,z1-18,rwX+k*2.2+.6,z1-3,.03,'#f4f4f0')}
 quadY(G,rwX+14,mz-6,-60,mz+6,.02,'#44464a');quadY(G,-60,a.z0-40,20,a.z1+40,.02,'#9a9c9e');for(let z=a.z0-30;z<a.z1+40;z+=24)quadY(G,-40,z,10,z+.3,.03,'#ffd23d');
 for(let z=z0;z<z1;z+=30)[rwX-15,rwX+15].forEach(x=>bx(Gw,.4,.3,.4,'#7ab8ff',x,.15,z));
 /* terminal: glass hall, steel roof, canopy over the doors */
 const hx=(a.x0+a.x1)/2,hh=12;bx(G,a.x1-a.x0,1,a.z1-a.z0,'#c8ccd2',hx,.5,mz);bx(G,a.x1-a.x0-1,hh-1,a.z1-a.z0-1,'#8aa8c4',hx,hh/2,mz);
 for(let z=a.z0+1;z<a.z1;z+=3)bx(G,.25,hh,.25,'#e8ecf0',a.x1-.4,hh/2,z);for(let y=3;y<hh;y+=3)bx(G,.2,.18,a.z1-a.z0,'#e8ecf0',a.x1-.35,y,mz);
 quadX(Gw,a.z0+.6,a.z1-.6,.6,hh-.6,a.x1-.3,'#ffe8c0');bx(G,a.x1-a.x0+6,.8,a.z1-a.z0+4,'#e8ecf0',hx+2,hh+.4,mz,0,'#d0d4da');bx(G,7,.4,a.z1-a.z0-6,'#e8ecf0',a.x1+3.5,4.2,mz);for(let z=a.z0+4;z<a.z1-3;z+=7)bx(G,.3,4.2,.3,'#c8ccd2',a.x1+6.5,2.1,z);
 const t1=W.air+(s.lang=='en'?'':' · AIRPORT'),t2=(C.d.city||C.d.country).toUpperCase();const uv=C.A.add(640,120,(x,W2,H)=>{x.fillStyle='#10202e';x.fillRect(0,0,W2,H);x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';fitF(x,t2+' '+t1,58,W2-30);x.fillText(t2+' '+t1,W2/2,H/2-6);x.fillStyle='#ffd23d';x.fillRect(W2*.2,H-16,W2*.6,5)});
 qFace(q,'x',a.x1+.2,mz-14,mz+14,hh-3.4,hh-.4,uv&&uv.uv);const uv2=C.A.add(256,64,(x,W2,H)=>signArt(x,W2,H,'✈ ARRIVALS · DEPARTURES',{bg:'#ffd23d',fg:'#10202e'}));qFace(q,'x',a.x1+7.25,mz-6,mz+6,4.45,5.6,uv2&&uv2.uv);
 bx(G,.2,.35,12.2,'#1a1a1e',a.x1+7.2,5,mz);quadX(Gw,mz-2,mz+2,.05,3.2,a.x1+.06,'#e8f8ff');
 /* control tower */
 const tx=a.x0+8,tz=a.z0-10;xgPrism(G,2,1.6,30,10,'#d8dce0',tx,0,tz);xgPrism(G,4.2,4.6,3,10,'#2a4a6a',tx,30,tz);xgPrism(G,4.8,4.8,.6,10,'#e8ecf0',tx,33,tz);xgPrism(G,.15,.05,5,6,'#c8ccd2',tx,33.6,tz);bx(Gw,.6,.6,.6,'#ff3030',tx,38.6,tz);col(C,tx-2,tz-2,tx+2,tz+2);
 /* car park south of the terminal */
 quadY(G,a.x0,a.z1+6,a.x1,a.z1+44,.025,'#4a4c52');for(let x=a.x0+2;x<a.x1;x+=3)for(let z of[a.z1+9,a.z1+22,a.z1+35]){quadY(G,x,z,x+.12,z+5,.035,'#e8e8e0');if(C.r()<.6&&x+3<a.x1){const cm=mkS(carb(RI(0,4),pick(['#e6b422','#3b82f6','#e8e8ec','#c0392b','#2f8f5a','#1a1a1a'])));cm.scale.setScalar(1.25);cm.position.set(OX+x+1.5,0,OZ+z+2.5);scene.add(cm);C.extra.push(cm)}}
 col(C,a.x0,a.z0,a.x1,a.z1);col(C,14,-200,20,C.zMax+60);col(C,a.x0-6,a.z0-30,a.x0,a.z1+50);
 /* jet bridges and parked planes */
 const liv=[s.acc,'#2fe68a',s.neon,'#d7262f'];[-1.5,-.5,.5,1.5].forEach((k,i)=>{const z=mz+k*12;bx(G,10,2.2,2.2,'#c8ccd2',a.x0-5,4,z);bx(G,.5,4,.5,'#8a8e94',a.x0-9,2,z);
  const p=dsPlaneModel(liv[i%4]);p.position.set(OX+a.x0-24,2.1,OZ+z);p.rotation.y=0;scene.add(p);C.extra.push(p)});
 for(let i=0;i<5;i++){const b=new THREE.Group();B(b,1.4,1,2.4,i%2?'#ffd23d':'#e8e8ec',0,.6,0);B(b,1.3,.5,1,'#334',0,1.3,-.5);b.position.set(OX-30+i*7,0,OZ+mz+R(-30,30));scene.add(b);C.extra.push(b);C.tugs.push({m:b,z0:b.position.z,p:R(0,6)})}
 const fly=dsPlaneModel(s.acc);fly.position.set(OX+rwX,2.1,OZ+z1-30);fly.rotation.y=Math.PI/2;scene.add(fly);C.extra.push(fly);C.fly={m:fly,t:R(0,20),x:rwX,z0:z1-30,z1:z0};
 dsUnit(C,G,Gw,q,[a.x0,a.z0,a.x1+7,a.z1,hh+1]);
 C.spots.air={x:a.x1+9,z:mz,n:(C.d.city||C.d.country)+' '+W.air};addInt(C,a.x1+1.6,mz,2.4,'Enter '+(C.d.city||C.d.country)+' Airport',()=>{if(typeof TRAVEL=='object'&&typeof window.apEnter=='function'){TRAVEL.enterAirport()}else{snd('err');say('The terminal doors are locked right now.')}})}

/* ---------- traffic and people ---------- */
function vehicle(C,kind){const s=C.s;let m;if(kind=='bus'){const c=s.bus;m=mkS([[2.4,s.bus=='#d7262f'?4:2.4,9,c,0,s.bus=='#d7262f'?2.2:1.5,0],[2.42,.7,8.4,'*1a2a3a',0,1.8,.2],...(s.bus=='#d7262f'?[[2.42,.7,8.4,'*1a2a3a',0,3.3,.2]]:[]),[2.5,.5,1,'#1a1a1a',0,.35,3],[2.5,.5,1,'#1a1a1a',0,.35,-3]])}
 else if(kind=='tram'){m=mkS([[2.4,2.6,15,s.acc=='#e8323c'?'#e8323c':'#e8e4d8',0,1.7,0],[2.42,.8,14,'*1a2a3a',0,2.1,0],[.1,1.2,.1,'#222',0,3.6,0],[1.4,.08,.1,'#222',0,4.2,0],[2.2,.4,15,'#3a3a3a',0,.4,0]])}
 else if(kind=='tuk'){m=mkS([[1.3,1.1,2.2,pick(['#2fa84a','#ffd23d','#2a6ab8']),0,.9,0],[1.35,.1,2.3,'#1a1a1a',0,1.75,0],[1.1,.6,.1,'*bfe3ff',0,1.4,.95],[.3,.4,.4,'#111',0,.25,.9],[.3,.4,.4,'#111',.5,.25,-.8],[.3,.4,.4,'#111',-.5,.25,-.8]])}
 else{const cab=s.cab&&C.r()<.45;m=mkS(carb(RI(0,4),cab?s.cab:pick(['#e6b422','#3b82f6','#2f8f5a','#c0392b','#e8e8ec','#ff8a30','#8e44ad','#1a1a1a','#9aa0a6']),cab));m.scale.setScalar(1.45)}
 scene.add(m);C.extra.push(m);return m}
function dsTraffic(C){const s=C.s,r=C.r,n=s.big?30:16,lanes=[];const lft=s.left?-1:1;
 C.rz.forEach(z=>{if(z===C.canalZ)return;const x0=z===C.mid?72:C.rx[0],x1=z===C.mid?C.plaza.x0+4:C.sx0;lanes.push({ax:'x',c:z+2*lft,dir:1,lo:x0,hi:x1},{ax:'x',c:z-2*lft,dir:-1,lo:x0,hi:x1})});
 C.rx.forEach(x=>{const z0=C.rz[0],z1=C.rz[C.rz.length-1];lanes.push({ax:'z',c:x-2*lft,dir:1,lo:z0,hi:z1},{ax:'z',c:x+2*lft,dir:-1,lo:z0,hi:z1})});
 C.lanes=lanes;lanes.forEach(L=>L.cars=[]);
 for(let i=0;i<n;i++){const L=lanes[i%lanes.length],kind=s.tram&&i%9==0&&L.ax=='x'?'tram':s.bus&&i%6==1?'bus':s.tuk&&i%3==2?'tuk':'car',m=vehicle(C,kind);
  const v={m,L,p:L.lo+r()*(L.hi-L.lo),sp:kind=='tram'?5:kind=='bus'?6:R(7,11),len:kind=='tram'?16:kind=='bus'?10:4.6,v:0};L.cars.push(v);C.cars.push(v)}
 lanes.forEach(L=>{L.cars.sort((a,b)=>a.p-b.p);for(let i=1;i<L.cars.length;i++)if(L.cars[i].p-L.cars[i-1].p<14)L.cars[i].p=L.cars[i-1].p+14;L.cars=L.cars.filter(c=>c.p<L.hi||((c.m.visible=false),0))})}
function dsPeople(C){const s=C.s,r=C.r,n=s.big?44:28,e=C.hr+2,paths=[];
 C.rz.forEach(z=>{if(z===C.canalZ)return;for(let i=0;i<C.rx.length-1;i++){paths.push({ax:'x',c:z+e,a:C.rx[i]+e,b:C.rx[i+1]-e},{ax:'x',c:z-e,a:C.rx[i]+e,b:C.rx[i+1]-e})}});
 C.rx.forEach(x=>{for(let j=0;j<C.rz.length-1;j++)paths.push({ax:'z',c:x+e,a:C.rz[j]+e,b:C.rz[j+1]-e},{ax:'z',c:x-e,a:C.rz[j]+e,b:C.rz[j+1]-e})});
 for(let i=0;i<n;i++){const P0=paths[(r()*paths.length)|0];let o;try{o=buildChar(fCfg())}catch(e){continue}scene.add(o.g);C.extra.push(o.g);C.peds.push({o,P:P0,p:P0.a+r()*(P0.b-P0.a),dir:r()<.5?1:-1,sp:R(1.1,1.7),t:r()*6})}
 /* fans waiting on the stadium plaza */
 for(let i=0;i<(s.big?26:14);i++){let o;try{o=buildChar(fCfg())}catch(e){continue}const a=-Math.PI*.15-r()*Math.PI*.7,rr=1.15+r()*.35;o.g.position.set(OX+C.st.x+Math.cos(a)*C.st.a*rr*.95,0,OZ+C.st.z-Math.sin(a)*C.st.b*rr);o.g.rotation.y=Math.atan2(C.st.x-(o.g.position.x-OX),C.st.z-(o.g.position.z-OZ));
  scene.add(o.g);C.extra.push(o.g);C.fans.push({o,t:r()*6,k:r()})}}

/* ---------- build / tear down ---------- */
const FOFF=[0,-1.4,1.4];
function dsBuild(id){const d=wtDest(id);if(!d)return null;const s=dsStyle(d),C={id,d,s,r:fRng(fHash('city-'+id)),g:new THREE.Group(),cols:[],ints:[],fades:[],peds:[],cars:[],fans:[],tugs:[],extra:[],shops:[],spots:{},signM:[],signQ:[],rooms:{}};
 C.g.position.set(OX,0,OZ);scene.add(C.g);C.A=mkAtlas();C.A.blank=C.A.add(8,8,(x)=>{x.fillStyle='#111';x.fillRect(0,0,8,8)});C.glowM=winMat();
 WU.uDay.value.set(s.sky).lerp(new THREE.Color('#6a7a8a'),.55);
 dsLayout(C);dsGround(C);dsBuildings(C);dsStreets(C);dsAirport(C);
 D.building=C;D.cityHooks.forEach(f=>{try{f(C)}catch(e){console.error("city hook",e)}});D.building=null;
 C.A.done();C.signM.forEach(m=>{m.map=C.A.tex;m.needsUpdate=true});/* sign materials are made before the atlas texture exists */C.signQ.forEach(([q,sm,U])=>{const m=qMesh(q,sm);if(m)C.g.add(m)});
 dsTraffic(C);dsPeople(C);
 D.building=C;try{if(D.doorInt)(C.doors||[]).forEach(dr=>D.doorInt(C,dr));else C.shops.forEach(sp=>addInt(C,sp.x,sp.z,1.5,shopLabel(sp),()=>dsShop(C,sp)));
 if(C.spots.hotel){if(D.hotelInt)D.hotelInt(C);else addInt(C,C.spots.hotel.x,C.spots.hotel.z,2,'Hotel: rest or sleep',()=>dsHotel(C))}}finally{D.building=null}
 return C}
function dsDispose(C){if(!C)return;if(C.ftn&&typeof FTX=='object')FTX.L=FTX.L.filter(F=>!C.ftn.includes(F));scene.remove(C.g);const kill=o=>{o.traverse(m=>{if(m.geometry&&m.geometry.userData&&m.geometry.userData.dsOwn)m.geometry.dispose();const mt=m.material;if(mt&&(m.userData.dsOwn||mt.userData&&mt.userData.dsOwn)){(Array.isArray(mt)?mt:[mt]).forEach(x=>x.dispose())}})};
 kill(C.g);C.extra.forEach(o=>{scene.remove(o);kill(o)});C.fades.forEach(U=>U.mats.forEach(m=>m.dispose()));if(C.A.tex)C.A.tex.dispose();if(C.waterTx)C.waterTx.dispose();
 for(let i=INT.length-1;i>=0;i--)if(INT[i].ds)INT.splice(i,1);Object.values(C.rooms).forEach(rm=>{if(rm.g){scene.remove(rm.g);kill(rm.g)}(rm.extra||[]).forEach(o=>{scene.remove(o);kill(o)})})}

/* ---------- rooms (terminal, stadium concourse, dressing room): roofless boxes far east of the city ----------
   x0,z0 is the back-left corner (tall walls on the back z0 and left x0, low walls on the front and right, like home interiors) */
function mkRoom(C,key,x0,z0,w,d,o){o=o||{};const g=new THREE.Group();g.position.set(OX,0,OZ);scene.add(g);const G=mkG(),Gw=mkG();
 const rm={key,x0,z0,w,d,g,G,Gw,cols:[],q:QB(),extra:[],o};C.rooms[key]=rm;
 quadY(G,x0,z0,x0+w,z0+d,0,o.floor||'#c8c4bc');const wh=o.h||4.2,wc=o.wall||'#e8e4dc';
 bx(G,w+.6,wh,.3,wc,x0+w/2,wh/2,z0-.15);bx(G,.3,wh,d+.6,dk(wc,.92),x0-.15,wh/2,z0+d/2);bx(G,w+.6,.6,.3,dk(wc,.85),x0+w/2,.3,z0+d+.15);bx(G,.3,.6,d+.6,dk(wc,.85),x0+w+.15,.3,z0+d/2);
 if(o.tiles){for(let x=x0;x<x0+w;x+=2)quadY(G,x,z0,x+.05,z0+d,.01,dk(o.floor||'#c8c4bc',.9));for(let z=z0;z<z0+d;z+=2)quadY(G,x0,z,x0+w,z+.05,.01,dk(o.floor||'#c8c4bc',.9))}
 rm.box=(w2,h,d2,c,x,y,z,cl)=>{bx(G,w2,h,d2,c,x,y,z);if(cl)rm.cols.push([x-w2/2,z-d2/2,x+w2/2,z+d2/2])};
 rm.glow=(w2,h,d2,c,x,y,z)=>bx(Gw,w2,h,d2,c,x,y,z);rm.G=G;rm.Gw=Gw;rm.int=(x,z,r,l,a)=>addInt(C,x,z,r,l,a);
 rm.sign=(face,c,a,b,y0,y1,w2,h2,fn)=>{const uv=C.A.add(w2,h2,fn);qFace(rm.q,face,c,a,b,y0,y1,uv&&uv.uv)};
 rm.done=()=>{flushTo(G,g);flushTo(Gw,g,C.roomM||(C.roomM=new THREE.MeshBasicMaterial({vertexColors:true})));if(rm.q.I.length){const sm=new THREE.MeshBasicMaterial({map:C.A.tex,transparent:true,side:THREE.DoubleSide});C.signM.push(sm);const m=qMesh(rm.q,sm);m.material.userData={dsOwn:1};m.userData.dsOwn=1;g.add(m)}};
 return rm}
D.mkRoom=(key,x0,z0,w,d,o)=>{const C=D.building||D.C;return C?mkRoom(C,key,x0,z0,w,d,o):null};
function inRoom(rm,lx,lz){return lx>rm.x0-.5&&lx<rm.x0+rm.w+.5&&lz>rm.z0-.5&&lz<rm.z0+rm.d+.5}
D.goRoom=(key,lx,lz,rot)=>{const C=D.C,rm=C&&C.rooms[key];if(!rm)return;D.room=rm;P.x=OX+lx;P.z=OZ+lz;P.rot=rot||0;camT.x=P.x;camT.z=P.z;snd('whoosh')};
D.goOut=(lx,lz,rot)=>{D.room=null;P.x=OX+lx;P.z=OZ+lz;P.rot=rot==null?0:rot;camT.x=P.x;camT.z=P.z;snd('whoosh')};

/* ---------- shops, hotel, taxi ---------- */
function shopLabel(sp){return{food:'Eat at '+sp.n,cafe:'Café: '+sp.n,souv:'Souvenirs: '+sp.n,conv:'Shop: '+sp.n,records:'Record shop: '+sp.n}[sp.k]||sp.n}
function dsShop(C,sp){const d=C.d,F=D.food(C.id),place=d.city||d.country;
 if(sp.k=='souv'){GR=sp.n+': "A little something from '+place+'?"';const it=[['Postcard of '+place,4],['Snow globe',18],['Local T-shirt',28],['Fridge magnet',6]];
  return shopModal('Souvenirs · '+esc(place),()=>it.map(x=>{const have=(S.dcity.souv||[]).includes(C.id+':'+x[0]);return[x[0],x[1],have?'Owned':'A keepsake from '+place]}),i=>{const x=it[i],k=C.id+':'+x[0];S.dcity.souv=S.dcity.souv||[];if(S.dcity.souv.includes(k))return snd('err');if(S.money<x[1]){snd('err');return say('Not enough money.')}S.money=+(S.money-x[1]).toFixed(2);S.dcity.souv.push(k);snd('cash');say('Bought: '+x[0])})}
 if(sp.k=='records'){GR=sp.n+': "We stock local artists. Want to sign some copies?"';const day=S.dcity.sign||{};const done=day[C.id]===S.day;
  return shopModal('Record shop · '+esc(sp.n),()=>[['Sign copies of your music for fans',0,done?'Owned':'Once a day here · a few new followers']],()=>{if((S.dcity.sign||{})[C.id]===S.day)return snd('err');S.dcity.sign=Object.assign({},S.dcity.sign,{[C.id]:S.day});const f=Math.round(20+Math.sqrt(S.listeners||0)*.4);S.followers=(S.followers||0)+f;snd('cash');say('You signed a stack of copies · +'+f.toLocaleString()+' followers')})}
 const menu=sp.k=='cafe'?[F[2],['Coffee',4,5,1],['Cake',6,8]]:sp.k=='conv'?[['Water',2,2,1],['Snack',3,5],['Rice ball / sandwich',4,7]]:F;GR=sp.n+': "'+dw(C.s.lang).hi+'!"';
 shopModal(esc(sp.n)+' <small class=m>· '+esc(place)+'</small>',()=>menu.map(m=>[m[0],m[1],'+'+m[2]+' energy'+(m[3]?' · refills stamina':'')]),i=>{const m=menu[i];if(S.money<m[1]){snd('err');return say('Not enough money for that.')}if(!m[3]&&S.energy>=100){snd('err');return say('You are already full of energy.')}
  S.money=+(S.money-m[1]).toFixed(2);S.energy=Math.min(100,S.energy+m[2]);if(m[3]){S.stam=100;S.exh=0}snd('eat');say('Yum! '+m[0]+' · +'+m[2]+' energy')})}
function dsHotel(C){const price=Math.round(60+(C.d.venue?C.d.venue.tix:60)*1.2);mode='menu';
 $('ui').innerHTML=`<div class="box modal"><h2>🏨 ${esc(C.spots.hotel.n)}</h2><p class=m>${clk()} · You have ${$$(S.money)}.</p><p>Rest in the lobby for an hour (+15 energy), or take a room for the night and sleep until morning. You wake up here, in ${esc(C.d.city||C.d.country)}.</p>
 <div class=row2><button onclick="DCITY.hotelRest()">Rest 1 hour (free)</button><button class=go onclick="DCITY.hotelSleep(${price})">Sleep here · ${$$(price)}</button><button onclick="closeUI()">Leave</button></div></div>`}
D.hotelRest=()=>{closeUI();S.t=Math.min(599,S.t+(S.t<300?21:30));S.energy=Math.min(100,S.energy+15);snd('pop');say('You rested in the lobby · +15 energy · '+clk())};
D.hotelSleep=p=>{if(S.money<p){snd('err');return say('Not enough money for a room.')}S.money=+(S.money-p).toFixed(2);closeUI();sleepNow(0)};
function dsTaxi(lx,lz,label){const C=D.C;if(!C)return;const dist=Math.hypot(P.x-OX-lx,P.z-OZ-lz),c=Math.max(5,Math.round(dist*.08));if(S.money<c){snd('err');return say('The taxi costs $'+c)}
 S.money=+(S.money-c).toFixed(2);closeUI();dsFade(()=>{D.room=null;P.x=OX+lx;P.z=OZ+lz;P.rot=0;camT.x=P.x;camT.z=P.z},()=>say('Taxi to '+label+' · $'+c))}
D.taxi=dsTaxi;
function dsFade(mid,end,hold){dsCutCSS();let f=$('dsfade');if(!f){f=document.createElement('div');f.id='dsfade';document.body.appendChild(f)}f.style.opacity=1;setTimeout(()=>{try{mid&&mid()}catch(e){console.error(e)}setTimeout(()=>{f.style.opacity=0;try{end&&end()}catch(e){}},hold||250)},420)}
D.fade=dsFade;

/* ---------- maps ---------- */
function dsMapPaint(x,sx,sz,k,mini){const C=D.C;if(!C)return;const s=C.s,R0=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(sx(a),sz(b),(c-a)*k,(d-b)*k)};
 R0(-140,-60,C.W+20,C.zMax+60,s.ground);R0(0,0,C.W,C.zMax,s.walk);if(s.water)R0(-140,C.wz,C.W+40,C.wz+300,'#3a8ac4');
 R0(-110,C.air.z0-120,-82,C.air.z1+120,'#3a3c40');R0(-60,C.air.z0-40,20,C.air.z1+40,'#9a9c9e');
 C.rx.forEach(xx=>R0(xx-C.hr,C.rz[0]-C.hr,xx+C.hr,C.rz[C.rz.length-1]+C.hr,'#3a3c40'));C.rz.forEach(z=>{if(z===C.canalZ)return R0(C.rx[0]-C.hr,z-C.hr,C.sx0+C.hr,z+C.hr,'#3a8ac4');R0(z===C.mid?66:C.rx[0]-C.hr,z-C.hr,z===C.mid?C.plaza.x0+6:C.sx0+C.hr,z+C.hr,'#3a3c40')});
 C.blocks.forEach(b=>R0(b.x0,b.z0,b.x1,b.z1,b.park?'#5a9a4a':b.land?'#d8c08a':dk(s.walk,1.05)));(C.foot||[]).forEach(f=>R0(f[0],f[1],f[2],f[3],f[5]>26?'#6a7080':'#8a8e98'));if(C.spots.land&&C.landB){const b=C.landB;x.strokeStyle='#ffd23d';x.lineWidth=2;x.strokeRect(sx(b.x0),sz(b.z0),(b.x1-b.x0)*k,(b.z1-b.z0)*k)}
 R0(C.air.x0,C.air.z0,C.air.x1,C.air.z1,'#c8d4e0');R0(C.plaza.x0,C.plaza.z0,C.plaza.x1,C.plaza.z1,'#b8b0a0');
 x.fillStyle='#e8e4dc';x.beginPath();x.ellipse(sx(C.st.x),sz(C.st.z),C.st.a*k,C.st.b*k,0,0,7);x.fill();x.fillStyle='#4a9a4a';x.beginPath();x.ellipse(sx(C.st.x),sz(C.st.z),C.st.a*.55*k,C.st.b*.55*k,0,0,7);x.fill();
 const pin=(p,col,t)=>{if(!p)return;const X=sx(p.x),Z=sz(p.z);x.fillStyle=col;x.fillRect(X-4,Z-4,8,8);x.strokeStyle='#000';x.lineWidth=1;x.strokeRect(X-4,Z-4,8,8);if(!mini&&t){x.font='bold 11px monospace';x.fillStyle='#fff';x.textAlign='left';x.fillText(t,X+7,Z+4)}};
 pin(C.spots.air,'#5aa9ff','✈ Airport');pin({x:C.st.x,z:C.st.z+C.st.b+2},'#ff4f9a','🏟 '+((C.d.venue&&C.d.venue.n)||'Stadium'));pin(C.spots.hotel,'#ffd23d','Hotel');pin(C.spots.club,'#b07aff','♪ '+((C.d.club&&C.d.club.n)||'Club'));if(C.spots.land)pin(C.spots.land,'#ffd23d','★ '+(C.spots.land.n||'Landmark'));if(!mini)C.shops.forEach(sp=>pin(sp,'#2fe68a',''))}
D.mapPaint=dsMapPaint;
function dsBigMap(){const C=D.C;mode='menu';const d=C.d;
 $('ui').innerHTML=`<div class="box modal" style="width:min(780px,96vw)"><h2>🗺 ${esc(wtPlace(d))}</h2><canvas id=dsmap width=760 height=420 style="width:100%;display:block;border:2px solid #000;image-rendering:pixelated"></canvas>
 <p class=m>You are the white arrow. ${D.hint?esc(D.hint()):''}</p><div class=row2><button onclick="DCITY.taxi(${C.spots.air.x},${C.spots.air.z},'the airport')">Taxi to the airport</button><button onclick="DCITY.taxi(${C.st.x},${C.st.z+C.st.b+4},'the stadium')">Taxi to ${esc((d.venue&&d.venue.n)||'the stadium')}</button>${C.spots.club?`<button onclick="DCITY.taxi(${C.spots.club.x},${C.spots.club.z+1},'the club')">Taxi to ${esc((d.club&&d.club.n)||'the club')}</button>`:''}${C.spots.hotel?`<button onclick="DCITY.taxi(${C.spots.hotel.x},${C.spots.hotel.z+1},'the hotel')">Taxi to the hotel</button>`:''}<button onclick="closeUI()">Close</button></div></div>`;
 const c=$('dsmap'),x=c.getContext('2d'),k=Math.min(760/(C.W+150),420/(C.zMax+80)),ox=(760-(C.W+150)*k)/2+120*k,oz=40*k;x.fillStyle='#223';x.fillRect(0,0,760,420);
 dsMapPaint(x,v=>ox+v*k,v=>oz+v*k,k,false);const px=ox+(P.x-OX)*k,pz=oz+(P.z-OZ)*k;x.fillStyle='#fff';x.strokeStyle='#000';x.beginPath();x.arc(px,pz,5,0,7);x.fill();x.stroke()}

/* ---------- arrival cutscene ---------- */
function dsCutCSS(){if($('dscss'))return;const st=document.createElement('style');st.id='dscss';st.textContent=`
#dsfade{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .4s;z-index:60}
body.dscut #hud,body.dscut #ntags,body.dscut #toast{display:none}
#dscut{position:fixed;inset:0;z-index:55;pointer-events:auto;cursor:pointer}
#dscut .lb{position:absolute;left:0;right:0;height:0;background:#000;transition:height 1.2s cubic-bezier(.2,.8,.2,1)}#dscut .lb.t{top:0}#dscut .lb.b{bottom:0}#dscut.on .lb{height:11vh}
#dscut .vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,transparent 45%,rgba(0,0,0,.55));pointer-events:none}
#dscut .ttl{position:absolute;left:0;right:0;top:38%;text-align:center;color:#fff;pointer-events:none}
#dscut .loc{font:600 clamp(14px,2.2vw,22px) ${SFONT};letter-spacing:.3em;opacity:0;transform:translateY(8px);transition:all 1.4s ease .2s;text-shadow:0 2px 12px #000a}
#dscut .city{font-family:Silkscreen,ui-monospace,monospace;font-size:clamp(40px,9vw,112px);line-height:1;letter-spacing:.6em;opacity:0;filter:blur(8px);transition:letter-spacing 3.2s cubic-bezier(.2,.8,.2,1),opacity 1.6s,filter 1.6s;text-shadow:0 4px 30px rgba(0,0,0,.6),0 0 40px var(--glow)}
#dscut .line{height:2px;width:0;margin:14px auto 12px;background:linear-gradient(90deg,transparent,var(--glow),#fff,var(--glow),transparent);transition:width 1.6s ease .9s}
#dscut .ctry{font:700 clamp(16px,2.6vw,28px) ui-monospace,Menlo,Consolas,monospace;letter-spacing:.45em;text-transform:uppercase;opacity:0;transform:translateY(10px);transition:all 1.4s ease 1.2s;text-shadow:0 2px 12px #000a}
#dscut .sub{font:12px ui-monospace,monospace;letter-spacing:.25em;opacity:0;transition:opacity 1.2s ease 2s;margin-top:10px;color:#ffffffcc}
#dscut.txt .city{opacity:1;filter:none;letter-spacing:.14em}#dscut.txt .line{width:min(520px,70vw)}#dscut.txt .ctry,#dscut.txt .loc{opacity:1;transform:none}#dscut.txt .sub{opacity:1}
#dscut.out .ttl{opacity:0;transition:opacity 1s}
#dscut .skip{position:absolute;right:18px;bottom:calc(11vh + 12px);pointer-events:auto}
#dshud{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:3;text-align:center;max-width:min(400px,36vw);pointer-events:none}
#dshud small{display:block}
@media (max-width:700px){#dshud{top:auto;bottom:64px;max-width:92vw}}`;document.head.appendChild(st)}
function dsSky(){const v={};const sg=new THREE.SphereGeometry(900,24,14),cA=[];for(let i=0;i<sg.attributes.position.count;i++)cA.push(1,1,1);sg.setAttribute('color',new THREE.Float32BufferAttribute(cA,3));
 v.sky=own(new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false})));v.sky.renderOrder=-10;v.sky.frustumCulled=false;v.sky.material.userData={dsOwn:1};return v}
function dsSkyCol(sky,s){const f=S.t<240?0:S.t<300?(S.t-240)/60*.5:S.t<330?.5+(S.t-300)/30*.4:.9,dusk=Math.max(0,1-Math.abs(f-.45)/.3);
 const top=new THREE.Color(s.sky).lerp(new THREE.Color('#3a6aa8'),.35).lerp(new THREE.Color('#0a0f26'),f),hz=new THREE.Color('#f2dcc0').lerp(new THREE.Color('#ff9a6a'),dusk*.7).lerp(new THREE.Color('#2a2050'),Math.max(0,f-.5)*1.6);
 const g=sky.geometry,P0=g.attributes.position,Cc=g.attributes.color,c=new THREE.Color();for(let i=0;i<P0.count;i++){const y=P0.getY(i)/900,k=Math.min(1,Math.max(0,y*2.4));c.copy(hz).lerp(top,Math.pow(k,.6));Cc.setXYZ(i,c.r,c.g,c.b)}Cc.needsUpdate=true;return hz}
function dsCutscene(done){const C=D.C,s=C.s,d=C.d;dsCutCSS();document.body.classList.add('dscut');mode='dcut';
 const cam3=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,2000),sv=dsSky();scene.add(sv.sky);const hz=dsSkyCol(sv.sky,s);
 const fog0={c:scene.fog.color.clone(),n:scene.fog.near,f:scene.fog.far};scene.fog.color.copy(hz);scene.fog.near=180;scene.fog.far=1100;
 const W=C.W,Dz=C.zMax,cx=C.cx,cz=C.cz,L=(x,y,z)=>new THREE.Vector3(OX+x,y,OZ+z);
 const path=new THREE.CatmullRomCurve3([L(W+170,150,Dz+230),L(W*.8,95,Dz+120),L(cx+20,62,Dz*.8),L(cx-40,40,cz+40),L(100,22,C.mid+34),L(C.air.x1+16,9,C.mid+15)]);
 const look=new THREE.CatmullRomCurve3([L(cx,18,cz-20),L(cx,14,cz-30),L(cx-30,10,cz-40),L(70,6,C.mid-10),L(C.air.x1+2,2,C.mid),L(C.air.x1+3,1,C.mid)]);
 const el=document.createElement('div');el.id='dscut';const loc=DLOC[C.id]||'',big=d.city||d.country,small=d.city?d.country:(WT_CONT[d.cont]?WT_CONT[d.cont].n:'');
 el.style.setProperty('--glow',s.neon);el.innerHTML=`<div class=vig></div><div class="lb t"></div><div class="lb b"></div><div class=ttl>${loc?`<div class=loc>${esc(loc)}</div>`:''}<div class=city>${esc(big)}</div><div class=line></div><div class=ctry>${esc(small)}</div><div class=sub>${esc(dw(s.lang).wel+' '+big)}</div></div><button class="hb skip">Skip ▸</button>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
 const T=12.5,V={cam:cam3,t:0,tick(dt){V.t+=dt;const u=Math.min(1,V.t/T),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;cam3.position.copy(path.getPointAt(e));cam3.lookAt(look.getPointAt(Math.min(1,e*1.02)));cam3.aspect=innerWidth/innerHeight;cam3.updateProjectionMatrix();sv.sky.position.copy(cam3.position);
  if(V.t>1.3&&!V.tx){V.tx=1;el.classList.add('txt');try{snd('whoosh')}catch(e){}}if(V.t>T-3.2&&!V.ot){V.ot=1;el.classList.add('out')}if(V.t>=T)V.end()},
  end(){if(V.done)return;V.done=1;dsFade(()=>{D.view=null;scene.remove(sv.sky);sv.sky.geometry.dispose();sv.sky.material.dispose();scene.fog.color.copy(fog0.c);scene.fog.near=fog0.n;scene.fog.far=fog0.f;el.remove();document.body.classList.remove('dscut');mode='play';removeEventListener('keydown',kd,true)},()=>{done&&done()},350)}};
 const kd=e=>{if(mode!='dcut')return;if(e.key=='Escape'||e.key==' '||e.key=='Enter'){e.preventDefault();e.stopImmediatePropagation();V.end()}};addEventListener('keydown',kd,true);
 el.addEventListener('click',()=>V.end());D.view=V;V.tick(0)}

/* ---------- arrive / leave ---------- */
function dsPlace(lx,lz,rot){P.x=OX+lx;P.z=OZ+lz;P.rot=rot==null?Math.PI/2:rot;camT.x=P.x;camT.z=P.z}
D.arrive=function(id,o){o=o||{};dsCutCSS();if(!wtDest(id))return false;if(D.on&&D.id!==id)dsTear();
 if(!D.on){try{IN=null}catch(e){}if(typeof mode!='undefined'&&mode=='drive'&&typeof exitDrive=='function')try{exitDrive()}catch(e){}
  const C=dsBuild(id);if(!C)return false;D.C=C;D.id=id;D.on=1;D.room=null;C.ints.forEach(x=>INT.push(x));
  D.hooks.forEach(f=>{try{f('arrive',C)}catch(e){console.error('dcity hook',e)}});C.ints.forEach(x=>{if(!INT.includes(x))INT.push(x)})}
 S.dcity=S.dcity||{};S.dcity.loc=id;S.dcity.seen=S.dcity.seen||{};const first=!S.dcity.seen[id];S.dcity.seen[id]=1;
 if(o.at=='hotel'&&D.C.spots.hotel)dsPlace(D.C.spots.hotel.x,D.C.spots.hotel.z+1,0);else dsPlace(D.C.air.x1+10,D.C.mid+1.5,Math.PI/2);
 if(!o.quiet){dsCutscene(()=>{say((first?dw(D.C.s.lang).wel+' ':'Back in ')+wtPlace(D.C.d)+'! Press N for the city map.')})}
 return true};
function dsTear(){const C=D.C;D.hooks.forEach(f=>{try{f('leave',C)}catch(e){}});dsDispose(C);D.C=null;D.on=0;D.id=null;D.room=null;D.view=null;const h=$('dshud');if(h)h.remove()}
D.leave=function(home){if(D.on)dsTear();if(S.dcity)S.dcity.loc=null;if(home){P.x=8;P.z=14;P.rot=0;camT.x=P.x;camT.z=P.z}return true};

/* ---------- hooks into the game ---------- */
/* the player is in this city's frame (not in the shared airport terminal or anywhere else in the home world) */
const inCity=()=>D.on&&P.x>OX-600&&P.x<OX+3000&&Math.abs(P.z-OZ)<1600;D.inCity=inCity;
{const h0=hit;hit=function(x,z,r){if(!D.on||IN||!(x>OX-600&&x<OX+3000&&Math.abs(z-OZ)<1600))return h0(x,z,r);const lx=x-OX,lz=z-OZ,C=D.C,rm=D.room,ov=c=>lx+r>c[0]&&lx-r<c[2]&&lz+r>c[1]&&lz-r<c[3];
 if(rm){if(lx<rm.x0+.35||lx>rm.x0+rm.w-.35||lz<rm.z0+.35||lz>rm.z0+rm.d-.35)return 1;return rm.cols.some(ov)}
 if(lx<2||lx>C.W-2||lz<2||lz>C.zMax-.5)return 1;if(C.cars.some(v=>{if(v.x==null)return false;const hl=v.len/2,hw=v.len>8?1.35:1.2,ex=(v.L.ax=='x'?hl:hw)+r,ez=(v.L.ax=='x'?hw:hl)+r;return Math.abs(lx-v.x)<ex&&Math.abs(lz-v.z)<ez&&!(Math.abs(P.x-OX-v.x)<ex&&Math.abs(P.z-OZ-v.z)<ez)}))return 1;/* solid cars; never trap you inside one */return C.cols.some(ov)}}
/* the cutaway: a building between you and the camera fades out completely, signs and all, so nothing is left blocking the view */
function dsCut(U,tg,dt){const want=tg?1:0;if(U.o===want)return;
 if(U.o>=1&&!tg){U.mats.forEach(m=>{if(m.b0==null)m.b0=m.transparent;m.transparent=true;m.needsUpdate=true})}
 U.o+=(want-U.o)*Math.min(1,dt*12);if(Math.abs(want-U.o)<.03)U.o=want;
 U.mats.forEach(m=>{m.opacity=U.o;m.visible=U.o>0});
 if(U.o>=1){U.mats.forEach(m=>{m.transparent=!!m.b0;m.needsUpdate=true})}}
/* wait at a crossing while a car on the other road is in it */
function yieldAt(C,L,v){const xs=L.ax=='x'?C.rx:C.rz,reach=v.len/2+C.hr+2.5;let c=null;for(const q of xs){const d=(q-v.p)*L.dir;if(d>C.hr-.5&&d<reach){c=q;break}}if(c==null)return false;
 const cx=L.ax=='x'?c:L.c,cz=L.ax=='x'?L.c:c,b=C.hr+1.2;return C.cars.some(o=>o!==v&&o.L.ax!==L.ax&&o.x!=null&&Math.abs(o.x-cx)<b+(o.L.ax=='x'?o.len/2:1)&&Math.abs(o.z-cz)<b+(o.L.ax=='z'?o.len/2:1))}
function dsTick(dt){const C=D.C;if(!C)return;const t=performance.now()/1000,px=P.x-OX,pz=P.z-OZ;
 const f=S.t<240?0:S.t<300?(S.t-240)/60*.5:S.t<330?.5+(S.t-300)/30*.4:.9;WU.uN.value=Math.max(0,Math.min(1,(f-.18)/.5));
 if(C.waterTx){C.waterTx.offset.x=(t*.01)%1;C.waterTx.offset.y=(t*.006)%1}
 const near=(x,z,r)=>Math.abs(x-px)<r&&Math.abs(z-pz)<r,cut=!!D.view;
 /* traffic: keep a gap, stop for the player */
 C.lanes&&C.lanes.forEach(L=>{const cs=L.cars;for(let i=0;i<cs.length;i++){const v=cs[i];let want=v.sp;const ahead=L.dir>0?cs[(i+1)%cs.length]:cs[(i-1+cs.length)%cs.length];
  if(ahead&&ahead!==v){let gap=(ahead.p-v.p)*L.dir;if(gap<0)gap+=L.hi-L.lo;if(gap<v.len/2+ahead.len/2+3)want=0;else if(gap<v.len+10)want=Math.min(want,ahead.v)}
  const lx=L.ax=='x'?v.p:L.c,lz=L.ax=='x'?L.c:v.p,ah=L.ax=='x'?(px-lx)*L.dir:(pz-lz)*L.dir,lat=L.ax=='x'?Math.abs(pz-lz):Math.abs(px-lx);if(!D.room&&ah>0&&ah<v.len/2+3&&lat<1.9)want=0;
  if(want>0&&yieldAt(C,L,v))want=0;
  v.v+=(want-v.v)*Math.min(1,dt*(want<v.v?4:1.2));v.p+=v.v*L.dir*dt;if(v.p>L.hi)v.p=L.lo;if(v.p<L.lo)v.p=L.hi;v.x=L.ax=='x'?v.p:L.c;v.z=L.ax=='x'?L.c:v.p;
  const vis=cut||near(lx,lz,80);v.m.visible=vis;if(vis){v.m.position.set(OX+lx,0,OZ+lz);v.m.rotation.y=L.ax=='x'?(L.dir>0?Math.PI/2:-Math.PI/2):(L.dir>0?0:Math.PI)}}});
 C.peds.forEach(p=>{const lx=p.P.ax=='x'?p.p:p.P.c,lz=p.P.ax=='x'?p.P.c:p.p,vis=cut||near(lx,lz,48);p.o.g.visible=vis;if(!vis)return;
  const blocked=!D.room&&Math.hypot(lx-px,lz-pz)<.9;if(!blocked){p.p+=p.dir*p.sp*dt;if(p.p>p.P.b){p.p=p.P.b;p.dir=-1}if(p.p<p.P.a){p.p=p.P.a;p.dir=1}p.t+=dt*7}
  p.o.g.position.set(OX+(p.P.ax=='x'?p.p:p.P.c),0,OZ+(p.P.ax=='x'?p.P.c:p.p));p.o.g.rotation.y=p.P.ax=='x'?(p.dir>0?Math.PI/2:-Math.PI/2):(p.dir>0?0:Math.PI);const sw=blocked?0:Math.sin(p.t)*.6;p.o.legs[0].rotation.x=sw;p.o.legs[1].rotation.x=-sw;p.o.arms[0].rotation.x=-sw;p.o.arms[1].rotation.x=sw});
 C.fans.forEach(fn=>{const vis=cut||near(fn.o.g.position.x-OX,fn.o.g.position.z-OZ,50);fn.o.g.visible=vis;if(!vis)return;const k=t*3+fn.t;fn.o.arms[0].rotation.x=fn.k<.5?-2.6+Math.sin(k)*.4:-.2;fn.o.arms[1].rotation.x=-2.6+Math.sin(k+1)*.4;fn.o.g.position.y=Math.max(0,Math.sin(k*1.6))*.12});
 C.tugs.forEach(g=>{g.p+=dt;g.m.position.z=g.z0+Math.sin(g.p*.3)*14;g.m.rotation.y=Math.cos(g.p*.3)>0?0:Math.PI});
 if(C.fly){const F=C.fly;F.t+=dt;const T=F.t%46;let z,y=2.1,pitch=0;if(T<6){z=F.z0}else if(T<26){const u=(T-6)/20;z=F.z0+(F.z1-F.z0)*u*u*.9;if(u>.62){const k=(u-.62)/.38;y=2.1+k*k*40;pitch=k*.25}}else{z=F.z1-(T-26)*60;y=40+(T-26)*14;pitch=.25}
  F.m.position.set(OX+F.x,y,OZ+z);F.m.rotation.set(0,Math.PI/2,0);F.m.rotateZ(pitch);F.m.visible=T<40}
 /* fade buildings between you and the camera (three rays across your body) */
 const on=!cut&&!D.room&&mode!='pc'&&inCity();C.fades.forEach(U=>{const b=U.b;let tg=1;if(on&&Math.abs((b[0]+b[2])/2-px)<70&&Math.abs((b[1]+b[3])/2-pz)<70){for(const o of FOFF){let lo=0,hi=1e9;const ff=(p,a,c)=>{const t1=(a-p)/16,t2=(c-p)/16;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2))};ff(px+o,b[0]-.5,b[2]+.5);ff(pz-o,b[1]-.5,b[3]+.5);hi=Math.min(hi,(b[4]+.5)/13);if(lo<hi){tg=0;break}}}
  dsCut(U,tg,dt)});
 if(D.view&&D.view.tick)D.view.tick(dt);
 dsHud()}
function dsHud(){let h=$('dshud');const show=inCity()&&(mode=='play')&&!D.view;if(!show){if(h)h.style.display='none';return}if(!h){h=document.createElement('div');h.id='dshud';h.className='hb';document.body.appendChild(h)}h.style.display='';
 const C=D.C,where=D.room?(D.room.o.name||''):'',t=`<b class=px>📍 ${esc(wtPlace(C.d))}</b>${where?' · '+esc(where):''} · ${clk()}<small class=m>${esc(D.hint?D.hint():'Press N for the city map.')}</small>`;if(h.dataset.h!=t){h.dataset.h=t;h.innerHTML=t}}
{const u0=update;update=function(dt){u0(dt);if(D.on){try{dsTick(dt)}catch(e){if(!D.err){D.err=1;console.error('tour city',e)}}}else{const h=$('dshud');if(h)h.style.display='none'}}}
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(D.view&&D.view.cam&&c===cam)return r0(sc,D.view.cam);return r0(sc,c)}}
{const m0=mmDraw;mmDraw=function(){if(!inCity())return m0();const show=['play','build'].includes(mode);mm.style.display=ml.style.display=show&&!D.room?'block':'none';if(!show||D.room)return;
 const x=mm.getContext('2d'),Sc=.9,lx=P.x-OX,lz=P.z-OZ;x.fillStyle='#223';x.fillRect(0,0,150,150);dsMapPaint(x,v=>75+(v-lx)*Sc,v=>75+(v-lz)*Sc,Sc,true);const hd=P.rot;
 x.fillStyle='#fff';x.strokeStyle='#000';x.beginPath();x.moveTo(75+Math.sin(hd)*7,75+Math.cos(hd)*7);x.lineTo(75+Math.sin(hd+2.5)*6,75+Math.cos(hd+2.5)*6);x.lineTo(75+Math.sin(hd-2.5)*6,75+Math.cos(hd-2.5)*6);x.closePath();x.fill();x.stroke();
 if(ml.textContent!=(D.C.d.city||D.C.d.country))ml.textContent=D.C.d.city||D.C.d.country}}
{const b0=bigMap;bigMap=function(){if(!inCity())return b0();if(mode!='play'||D.room)return;dsBigMap()}}
/* taxis and the home map never run abroad */
{const t0=taxi;taxi=function(x,z){if(inCity())return say('You are abroad. Use the city map (N) for a local taxi.');return t0(x,z)}}
/* waking up abroad: stay in the city (at the hotel if you slept there) */
{const w0=wakeUp;wakeUp=function(auto){w0(auto);try{if(D.on&&D.C){IN=null;if(D.hotelWake&&D.hotelWake(auto))return;const hs=D.C.spots.hotel;D.room=null;if(hs)dsPlace(hs.x,hs.z+1,0);else dsPlace(D.C.air.x1+10,D.C.mid+1.5,Math.PI/2)}}catch(e){console.error('dcity wake',e)}}}
/* saves: keep where you are; rebuild the city quietly after loading a save made abroad */
function dsLocNow(){try{if(typeof TRAVEL=='object'&&TRAVEL&&typeof TRAVEL.loc=='function'){const w=TRAVEL.loc();return w&&w!=='home'?w:null}}catch(e){}return S.dcity&&S.dcity.loc||null}
D.locNow=dsLocNow;D.SFONT=SFONT;D.sky=dsSky;D.skyCol=dsSkyCol;D.place=dsPlace;
function dsAfterLoad(){S.dcity=Object.assign({loc:null,shows:[],seen:{}},S.dcity||{});if(!Array.isArray(S.dcity.shows))S.dcity.shows=[];const id=dsLocNow();
 if(id&&wtDest(id)){if(D.on&&D.id===id)return;if(D.on)dsTear();D.arrive(id,{quiet:1,at:'hotel'})}else if(D.on){dsTear();P.x=8;P.z=14;camT.x=P.x;camT.z=P.z}}
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);try{dsAfterLoad()}catch(e){console.error('tour city load',e)}return r}}
if(typeof resetState=='function'){const rs=resetState;resetState=function(){if(D.on)try{dsTear()}catch(e){}return rs.apply(this,arguments)}}
D.afterLoad=dsAfterLoad;
/* 139-airport.js calls these through its DCITY bridge: arrive on landing, outside when you leave the terminal, restore when a save loads abroad */
D.outside=function(id){if(!id||id=='home'||!wtDest(id))return false;if(!D.on||D.id!==id)D.arrive(id,{quiet:1});else{D.room=null;dsPlace(D.C.air.x1+3,D.C.mid,Math.PI/2)}return true};
D.restore=function(id){if(!id||id=='home'||!wtDest(id))return false;if(!D.on||D.id!==id)D.arrive(id,{quiet:1,at:'hotel'});return !!D.on};
if(typeof TRAVEL=='object'&&TRAVEL&&TRAVEL.on)TRAVEL.on('arrive',id=>{if(!id||id=='home'){if(D.on)dsTear();if(S.dcity)S.dcity.loc=null}return false});
})();
