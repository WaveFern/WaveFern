/* ---------- v49.28.0: every shop menu dressed as its shop ----------
   The menu that opens at a counter (shopModal) used to be the same green-on-black box everywhere. Now it looks like the
   place you are in: a florist's pastel card with a striped awning, a bakery's paper bag, a café chalkboard, a diner's
   printed menu, neon for the arcade, karaoke, bar, cinema and record shop, a clean white pharmacy and laundromat, a
   black-and-white boutique and jeweller's, kraft paper for markets, bookshops and bike shops. Each row is one button
   with an icon for the item, what it does and a price tag; the whole row buys it.
   The kind comes from the room you are standing in (tour cities), else from the menu's title (home city, festival).
   Works with every caller of shopModal: smR is replaced, shopModal and smC are unchanged. */
(function(){
if(typeof smR!='function')return;

/* A title can name its shop with an empty <i data-k=KIND></i> (179-tour-shop-kinds.js does), used when the room does not say.
   family: the overall look; k: the small line above the name; i: the shop's pixel icon; then the colours */
const TH={
 flowers:{f:'pastel',k:'Florist · fresh today',i:'flower',bg:'#fff4f8',ink:'#4a2a3a',ac:'#e0558f',ac2:'#6fae6a',card:'#ffffff',aw:'#f7a8c8'},
 bakery:{f:'paper',k:'Bakery · baked this morning',i:'bread',bg:'#fbf1de',ink:'#4a2c14',ac:'#b8662e',ac2:'#e8c88a',card:'#fffaf0',aw:'#d98a4a'},
 food:{f:'paper',k:'Restaurant · menu',i:'plate',bg:'#fbf5e6',ink:'#2a1a12',ac:'#a8242f',ac2:'#e8c070',card:'#fffdf6',aw:'#a8242f'},
 cafe:{f:'chalk',k:'Café · on the board',i:'cup',bg:'#26332c',ink:'#f2efe4',ac:'#ffd27a',ac2:'#9ad0b8',card:'#2e3c34',aw:'#7a5232'},
 bar:{f:'neon',k:'Bar · tonight',i:'glass',bg:'#140c1c',ink:'#f4e8ff',ac:'#ff4fa8',ac2:'#4fd8ff',card:'#1e1428',aw:'#ff4fa8'},
 arcade:{f:'neon',k:'Arcade · insert coin',i:'joy',bg:'#0a0a1a',ink:'#e8f4ff',ac:'#3ad0ff',ac2:'#ff3a9a',card:'#141430',aw:'#3ad0ff'},
 karaoke:{f:'neon',k:'Karaoke · sing it loud',i:'mic',bg:'#160a22',ink:'#fbeaff',ac:'#ff6ad5',ac2:'#ffd23d',card:'#22102e',aw:'#ff6ad5'},
 cinema:{f:'neon',k:'Cinema · now showing',i:'popcorn',bg:'#1a0a10',ink:'#fff4e0',ac:'#ffd23d',ac2:'#e8343c',card:'#2a1018',aw:'#e8343c'},
 records:{f:'neon',k:'Record shop · local artists',i:'disc',bg:'#120e1c',ink:'#f2ecff',ac:'#b07aff',ac2:'#ffd23d',card:'#1e1830',aw:'#b07aff'},
 tech:{f:'clean',k:'Electronics · demo models on',i:'plug',bg:'#f2f5f9',ink:'#14202e',ac:'#2f7de1',ac2:'#14202e',card:'#ffffff',aw:'#2f7de1'},
 pharm:{f:'clean',k:'Pharmacy · open late',i:'cross',bg:'#f4fbf7',ink:'#16352a',ac:'#1fa060',ac2:'#e8f6ee',card:'#ffffff',aw:'#1fa060'},
 laundry:{f:'clean',k:'Laundromat · wash & dry',i:'bubble',bg:'#eef6fc',ink:'#173450',ac:'#3b82f6',ac2:'#cfe6fb',card:'#ffffff',aw:'#3b82f6'},
 conv:{f:'clean',k:'Corner shop · open 24 hours',i:'cart',bg:'#f6f7f9',ink:'#1e2226',ac:'#e8473a',ac2:'#ffd23d',card:'#ffffff',aw:'#e8473a'},
 sweets:{f:'pastel',k:'Sweet shop · treats',i:'cone',bg:'#fff0f6',ink:'#5a1f3e',ac:'#e84a8a',ac2:'#7ad0c8',card:'#ffffff',aw:'#ff9ac4'},
 beauty:{f:'pastel',k:'Beauty · testers are free',i:'spark',bg:'#fff3f7',ink:'#4a1a32',ac:'#c0397a',ac2:'#e8c040',card:'#ffffff',aw:'#f4b8d0'},
 spa:{f:'pastel',k:'Massage · relax',i:'leaf',bg:'#f6efe4',ink:'#3a2a1a',ac:'#a8743a',ac2:'#8aa88a',card:'#fffaf2',aw:'#c8a878'},
 cloth:{f:'boutique',k:'Boutique · new season',i:'shirt',bg:'#fafafa',ink:'#111111',ac:'#111111',ac2:'#c8a050',card:'#ffffff',aw:'#111111'},
 barber:{f:'boutique',k:'Barber · walk-ins welcome',i:'scissors',bg:'#f8f6f2',ink:'#1a1a1a',ac:'#c0392b',ac2:'#2f4a8a',card:'#ffffff',aw:'#c0392b'},
 jewel:{f:'boutique',k:'Jeweller · hand-polished',i:'gem',bg:'#14110c',ink:'#f6eedc',ac:'#d8b25a',ac2:'#f6eedc',card:'#1e1a12',aw:'#d8b25a',dark:1},
 market:{f:'kraft',k:'Market · all fresh today',i:'basket',bg:'#e9d7b4',ink:'#3a2410',ac:'#3a7a2a',ac2:'#e8473a',card:'#f6ead0',aw:'#3a7a2a'},
 souv:{f:'kraft',k:'Gifts & souvenirs',i:'gift',bg:'#e6cfa4',ink:'#3a2410',ac:'#c0392b',ac2:'#2f6fb5',card:'#fff6e4',aw:'#c0392b'},
 books:{f:'kraft',k:'Bookshop · local writers',i:'book',bg:'#efe2c8',ink:'#2a1c10',ac:'#7a1f2b',ac2:'#2a5a3a',card:'#fbf3e2',aw:'#7a1f2b'},
 bikes:{f:'kraft',k:'Bike shop · rentals',i:'bike',bg:'#e4e8de',ink:'#1a2a1a',ac:'#2a7a4a',ac2:'#ffd23d',card:'#f8faf4',aw:'#2a7a4a'},
 radio:{f:'neon',k:'On air',i:'radio',bg:'#101418',ink:'#eaf4ff',ac:'#ff4a3a',ac2:'#ffd23d',card:'#1a2028',aw:'#ff4a3a'},
 fest:{f:'paper',k:'Festival food · festival prices',i:'tent',bg:'#fff4d6',ink:'#3a2208',ac:'#e8541e',ac2:'#2a8acf',card:'#fffbee',aw:'#e8541e'},
 office:{f:'clean',k:'Lobby kiosk',i:'cup',bg:'#f2f2f4',ink:'#1e1e24',ac:'#3a3a48',ac2:'#c8a050',card:'#ffffff',aw:'#3a3a48'},
 shop:{f:'paper',k:'Shop',i:'bag',bg:'#f8f2e6',ink:'#2a2018',ac:'#2f6fb5',ac2:'#e8c070',card:'#fffdf8',aw:'#2f6fb5'}};

/* which theme: the tour city room you are in, then words in the title or the greeting */
const ROOMK={books:'books',cloth:'cloth',pharm:'pharm',conv:'conv',souv:'souv',records:'records',food:'food',cafe:'cafe',office:'office'};
function themeKey(t){const tt=String(t||'').replace(/<[^>]*>/g,' '),g=String(typeof GR=='string'?GR:'');
 try{const D=window.DCITY;if(D&&D.on&&D.room){const k=D.room.key;if(TH[k])return k;if(ROOMK[k])return ROOMK[k]}}catch(e){}
 const hk=String(t||'').match(/<i data-k=(\w+)><\/i>/);if(hk&&TH[hk[1]])return hk[1];
 const T=[[/festival prices/i,'fest'],[/jewel/i,'jewel'],[/radio|on the air/i,'radio'],[/corner shop|^store\b/i,'conv'],[/caf[eé]|coffee|☕/i,'cafe'],[/souvenir/i,'souv'],[/record/i,'records'],
  [/^\s*food\b|restaurant|🍽/i,'food'],[/💐|flower|florist/i,'flowers'],[/🥐|bakery|bagel/i,'bakery'],[/📚|book/i,'books'],[/💊|pharm/i,'pharm'],[/👕|👟|boutique|vintage|thrift|sneaker/i,'cloth'],[/🍿|cinema/i,'cinema'],[/🍹|\bbar\b/i,'bar'],[/🧺|market/i,'market'],[/🍨|🍬|🥤|ice cream|sweet|juice/i,'sweets'],[/🔌|electr/i,'tech'],[/💄|beauty/i,'beauty']];
 for(const[r,k]of T)if(r.test(tt))return k;for(const[r,k]of T)if(r.test(g))return k;return'shop'}

/* an icon for each item, from its name (a pixel sprite from 00-pixel-icons.js) */
const IC=[[/rose/i,'flower'],[/bouquet/i,'flower'],[/potted|plant|cactus/i,'flower'],[/tulip/i,'flower'],[/sunflower/i,'flower'],
 [/croissant|cornetto|pain au/i,'bread'],[/baguette|bread|loaf|roll|sourdough|naan|chapati|roti|focaccia|rye/i,'bread'],[/bagel|pretzel/i,'bread'],[/cake|castella|strudel|pie|tart|muffin|mooncake|lapis|princess/i,'cake'],[/bun|melon pan|anpan|cinnamon|cardamom|scone/i,'cake'],
 [/pizza|margherita|pepperoni/i,'plate'],[/taco|quesadilla|al pastor/i,'plate'],[/burger/i,'plate'],[/fries|chips/i,'plate'],[/hot dog/i,'plate'],[/sushi|nigiri|maki/i,'plate'],[/ramen|udon|noodle|pho|soup/i,'plate'],[/gyoza|dumpling|samosa|mandazi/i,'plate'],[/grill|skewer|meat|kebab|satay|chicken/i,'plate'],[/rice|bento/i,'plate'],[/salad/i,'plate'],[/sandwich|toastie|toast/i,'plate'],[/snack|crackers|nuts|nachos|knots/i,'plate'],[/popcorn/i,'popcorn'],
 [/churro|brownie|fudge|toffee|baklava|kunafa|jalebi|barfi|gulab|mochi|dorayaki|taiyaki|hotteok|brigadeiro|alfajor|turr|sweet/i,'candy'],[/ice cream|scoop|cone|gelato|sundae|bingsu/i,'cone'],[/milkshake|smoothie/i,'drink'],[/a[cç]a[ií]/i,'fruit'],[/coconut/i,'fruit'],[/mango/i,'fruit'],[/fruit|apple/i,'fruit'],[/cheese|fromage/i,'plate'],
 [/coffee|flat white|latte|espresso|kopi/i,'cup'],[/tea|chai|oolong|jasmine/i,'cup'],[/juice|lemonade|soda|horchata|drink|cola|water|mocktail/i,'drink'],[/energy|bolt bull/i,'bolt'],
 [/throat|tablet|vitamin|remedy|medicine/i,'cross'],[/book|poetry|novel/i,'book'],[/phrasebook|guide|map/i,'map'],[/notebook|lyric/i,'book'],
 [/adapter|charger|power bank/i,'plug'],[/earbud|headphone/i,'phones'],[/phone case|phone/i,'phone'],[/perfume|tester/i,'spark'],[/lip/i,'spark'],[/glitter/i,'spark'],
 [/postcard/i,'letter'],[/snow globe/i,'gift'],[/t-shirt|tee|shirt|top/i,'shirt'],[/magnet/i,'gift'],[/shoe|sneaker|boot|trainer/i,'shoe'],[/jacket|coat|hoodie/i,'shirt'],[/hat|cap|beanie/i,'hat'],[/jeans|trousers|pants|shorts|skirt/i,'shirt'],[/dress/i,'shirt'],
 [/ring/i,'ring'],[/chain|necklace|pendant/i,'ring'],[/watch/i,'ring'],[/grill|tooth|teeth/i,'gem'],[/earring|stud|diamond/i,'gem'],
 [/shout|slot|show|special|ad\b|tour/i,'mega'],[/sign copies|sign/i,'pen'],[/wash|dry/i,'bubble'],[/ticket|film/i,'ticket'],[/massage/i,'leaf']];
/* whole words only (with an optional plural), so "copies" is not a pie and "Phone" is not pho */
IC.forEach(p=>{p[0]=new RegExp('\\b(?:'+p[0].source+')(?:e?s)?(?![a-z])','i')});
IC.unshift(...[[/\b(?:throat|tablet|vitamin|remed|medicine)/i,'cross']]);
const icon=(n,d)=>{const t=String(n).replace(/<[^>]*>/g,'');for(const[r,e]of IC)if(r.test(t))return e;return d};

/* a quote from the greeting: Name: "words" */
function quote(g){const m=String(g||'').match(/^\s*([^":]{1,24}):\s*(".*")\s*$/);return m?{who:m[1],say:m[2]}:{who:'',say:String(g||'')}}
const STATUS=/^(Owned|Yours|Worn|Buy the earlier)/;

const fmt=n=>+n?$$(n):'Free';
smR=function(){const o=SM;if(!o)return;let it;try{it=o.mk()}catch(e){console.error('shop menu',e);it=[]}
 const key=themeKey(o.t),T=TH[key]||TH.shop,raw=String(o.t||''),em=raw.match(/^\s*(\p{Extended_Pictographic}️?)\s*/u),title=em?raw.slice(em[0].length):raw,ic=pxIcon(T.i),q=quote(GR);
 const old=document.querySelector('.shx .shx-list'),st=old?old.scrollTop:0;
 const vars=`--bg:${T.bg};--ink:${T.ink};--ac:${T.ac};--ac2:${T.ac2};--card:${T.card};--aw:${T.aw}`;
 $('ui').innerHTML=`<div class="modal shx shx-${T.f} shx-k-${key}${T.dark?' shx-dark':''}" style="${vars}" role=dialog>
 <div class=shx-aw></div>
 <div class=shx-hd><div class=shx-ic>${ic}</div><div class=shx-tt><div class=shx-kk>${T.k}</div><h2>${title}</h2></div><div class=shx-cash><small>Your money</small><b>${$$(S.money)}</b></div></div>
 ${q.say?`<div class=shx-say>${q.who?`<b>${q.who}</b>`:''}<i>${q.say}</i></div>`:''}
 <div class=shx-list>${it.map((x,i)=>{const sub=String(x[2]==null?'':x[2]),own=sub=='Owned',stat=STATUS.test(sub),poor=!own&&+x[1]>S.money;
  return`<button class="shx-it${own?' own':''}${poor?' poor':''}" ${own?'disabled':''} onclick="smC(${i})"><span class=shx-ii>${pxIcon(icon(x[0],T.i))}</span><span class=shx-n><b>${x[0]}</b>${sub?`<small class="${stat?'st':''}">${sub}</small>`:''}</span><span class=shx-dt></span><span class=shx-p>${own?'Owned ✓':fmt(x[1])}</span></button>`}).join('')}</div>
 <div class=shx-ft><span class=shx-tip>${it.length} on offer · tap a row to buy</span><button class=shx-x onclick="closeUI()">Leave</button></div></div>`;
 const nl=document.querySelector('.shx .shx-list');if(nl&&st)nl.scrollTop=st};

{const st=document.createElement('style');st.textContent=`
.shx{padding:0;width:min(470px,94vw);max-height:min(640px,90vh);display:flex;flex-direction:column;background:var(--bg);color:var(--ink);border:3px solid var(--ink);border-radius:12px;box-shadow:0 14px 40px #000a,0 0 0 4px #0003;overflow:hidden;font:14px/1.35 'Trebuchet MS',system-ui,sans-serif}
.shx *{box-sizing:border-box}
.shx .shx-aw{height:22px;flex-shrink:0;background:repeating-linear-gradient(90deg,var(--aw) 0 26px,#fff 26px 52px);border-bottom:3px solid var(--ink);position:relative}
.shx .shx-aw:after{content:'';position:absolute;left:0;right:0;bottom:-11px;height:10px;background:radial-gradient(circle at 13px 0,var(--aw) 9px,transparent 10px) 0 0/52px 10px repeat-x,radial-gradient(circle at 39px 0,#fff 9px,transparent 10px) 0 0/52px 10px repeat-x}
.shx .shx-hd{display:flex;align-items:center;gap:12px;padding:18px 16px 6px}
.shx .shx-ic{width:52px;height:52px;flex-shrink:0;display:grid;place-items:center;font-size:30px;background:var(--card);border:2px solid var(--ink);border-radius:50%;box-shadow:3px 3px 0 var(--ac)}
.shx .shx-tt{flex:1;min-width:0}.shx .shx-kk{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--ac);font-weight:700}
.shx h2{margin:2px 0 0;font:700 25px/1.1 Georgia,'Times New Roman',serif;color:var(--ink);text-shadow:none;letter-spacing:0;overflow:hidden;text-overflow:ellipsis}
.shx h2 small,.shx h2 .m{font:400 13px 'Trebuchet MS',sans-serif;color:inherit;opacity:.65}
.shx .shx-cash{text-align:right;flex-shrink:0;background:var(--card);border:2px solid var(--ink);border-radius:8px;padding:4px 9px}.shx .shx-cash small{display:block;font-size:9px;letter-spacing:1px;text-transform:uppercase;opacity:.65}.shx .shx-cash b{font-size:14px;color:var(--ink)}
.shx .shx-say{margin:6px 16px 8px;padding:9px 12px;background:var(--card);border:2px solid var(--ink);border-radius:12px 12px 12px 3px;position:relative;font-size:13px}
.shx .shx-say b{display:block;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--ac);margin-bottom:1px}.shx .shx-say i{opacity:.9}
.shx .shx-list{overflow:auto;padding:4px 14px 8px;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0}
.shx .shx-it{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;min-height:56px;cursor:pointer;background:var(--card);color:var(--ink);border:2px solid var(--ink);border-radius:10px;box-shadow:0 3px 0 var(--ink);transition:transform .08s,box-shadow .08s,background .12s;text-align:left;font:inherit}
.shx .shx-it:hover,.shx .shx-it:focus-visible{transform:translateY(-1px);box-shadow:0 4px 0 var(--ac);border-color:var(--ac)}
.shx .shx-it:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
.shx .shx-it.own{cursor:default;opacity:.62;box-shadow:none}.shx .shx-it.poor .shx-p{opacity:.5;filter:grayscale(1)}
.shx .shx-ii{width:40px;height:40px;flex-shrink:0;display:grid;place-items:center;font-size:23px;border-radius:9px;background:color-mix(in srgb,var(--ac2) 35%,var(--card));border:2px solid color-mix(in srgb,var(--ink) 25%,transparent)}
.shx .shx-n{display:flex;flex-direction:column;min-width:0;flex:0 1 auto}.shx .shx-n b{font-size:15px;font-weight:700}.shx .shx-n small{font-size:12px;opacity:.72}.shx .shx-n small.st{color:var(--ac);opacity:1;font-weight:700}
.shx .shx-dt{flex:1;min-width:8px;align-self:center;border-bottom:2px dotted color-mix(in srgb,var(--ink) 30%,transparent);margin-top:8px}
.shx .shx-p{flex-shrink:0;font-weight:700;font-size:14px;padding:5px 10px 5px 14px;background:var(--ac);color:#fff;border-radius:4px 8px 8px 4px;position:relative;clip-path:polygon(9px 0,100% 0,100% 100%,9px 100%,0 50%)}
.shx .shx-p:before{content:'';position:absolute;left:6px;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;background:var(--card)}
.shx .shx-ft{display:flex;align-items:center;gap:10px;padding:10px 16px 14px;border-top:2px dashed color-mix(in srgb,var(--ink) 30%,transparent);flex-shrink:0}
.shx .shx-tip{flex:1;font-size:11px;opacity:.6}
.shx .shx-x{all:unset;cursor:pointer;padding:8px 18px;min-height:20px;font-weight:700;background:var(--ink);color:var(--bg);border-radius:8px;border:2px solid var(--ink);font-family:inherit}.shx .shx-x:hover{background:var(--ac);border-color:var(--ac);color:#fff}
/* paper: printed menu, serif, double rule */
.shx-paper{background:var(--bg) radial-gradient(circle at 20% 10%,#fff8 0,transparent 60%);border-radius:6px}
.shx-paper .shx-aw{height:14px;background:repeating-linear-gradient(45deg,var(--aw) 0 8px,var(--ac2) 8px 16px)}.shx-paper .shx-aw:after{display:none}
.shx-paper .shx-hd{border-bottom:3px double var(--ink);margin:0 14px;padding:14px 2px 10px}.shx-paper .shx-say{border-style:dashed;border-radius:6px}
.shx-paper .shx-it{border-width:0 0 1px;border-style:solid;border-color:color-mix(in srgb,var(--ink) 25%,transparent);border-radius:0;box-shadow:none;background:transparent}.shx-paper .shx-it:hover{background:var(--card);box-shadow:none;transform:none}
.shx-paper .shx-n b{font-family:Georgia,serif;font-size:16px}.shx-paper .shx-p{background:none;color:var(--ac);clip-path:none;font-family:Georgia,serif;font-size:16px;padding:0}.shx-paper .shx-p:before{display:none}
/* chalk: blackboard in a wooden frame */
.shx-chalk{border:10px solid #7a5232;border-radius:6px;box-shadow:inset 0 0 0 2px #5a3a20,0 14px 40px #000a;background:var(--bg) radial-gradient(ellipse at 30% 20%,#ffffff10,transparent 70%)}
.shx-chalk .shx-aw{display:none}.shx-chalk h2,.shx-chalk .shx-n b{font-family:'Comic Sans MS','Chalkboard SE','Marker Felt',cursive;color:#fff}
.shx-chalk .shx-ic,.shx-chalk .shx-cash,.shx-chalk .shx-say{background:transparent;border:2px dashed #f2efe4aa;box-shadow:none}
.shx-chalk .shx-it{background:transparent;border:0;border-bottom:2px dashed #f2efe455;border-radius:0;box-shadow:none}.shx-chalk .shx-it:hover{background:#ffffff0d;box-shadow:none;transform:none}
.shx-chalk .shx-ii{background:transparent;border:0}.shx-chalk .shx-p{background:none;clip-path:none;color:var(--ac);font-family:'Comic Sans MS','Chalkboard SE',cursive;font-size:17px;padding:0}.shx-chalk .shx-p:before{display:none}
.shx-chalk .shx-x{background:#f2efe4;color:#26332c;border-color:#f2efe4}
/* neon: dark room, glowing tube border */
.shx-neon{border:2px solid var(--ac);box-shadow:0 0 0 2px #000,0 0 18px var(--ac),inset 0 0 22px color-mix(in srgb,var(--ac) 30%,transparent),0 14px 40px #000c;background:var(--bg) linear-gradient(180deg,color-mix(in srgb,var(--ac) 14%,transparent),transparent 40%)}
.shx-neon .shx-aw{height:6px;border:0;background:linear-gradient(90deg,var(--ac),var(--ac2),var(--ac));box-shadow:0 0 12px var(--ac)}.shx-neon .shx-aw:after{display:none}
.shx-neon h2{font-family:Silkscreen,ui-monospace,monospace;color:#fff;text-shadow:0 0 6px var(--ac),0 0 14px var(--ac);letter-spacing:1px}
.shx-neon .shx-ic,.shx-neon .shx-cash,.shx-neon .shx-say,.shx-neon .shx-it{border-color:color-mix(in srgb,var(--ac) 70%,transparent);box-shadow:none}
.shx-neon .shx-ic{box-shadow:0 0 10px var(--ac)}.shx-neon .shx-it{box-shadow:inset 0 0 0 1px #0006}.shx-neon .shx-it:hover{box-shadow:0 0 12px var(--ac);border-color:var(--ac)}
.shx-neon .shx-ii{background:#0006;border-color:color-mix(in srgb,var(--ac2) 60%,transparent)}.shx-neon .shx-p{background:var(--ac2);color:#111;box-shadow:0 0 8px var(--ac2)}
.shx-neon .shx-x{background:transparent;color:var(--ac);border-color:var(--ac)}.shx-neon .shx-x:hover{background:var(--ac);color:#111}
/* clean: white counter, a coloured stripe, rounded */
.shx-clean{border:0;border-radius:16px;box-shadow:0 14px 40px #000a,0 0 0 1px #0002}
.shx-clean .shx-aw{height:8px;border:0;background:var(--ac)}.shx-clean .shx-aw:after{display:none}
.shx-clean .shx-ic{border:0;background:var(--ac);box-shadow:none;border-radius:14px}.shx-clean h2{font-family:system-ui,'Segoe UI',sans-serif;font-weight:800}
.shx-clean .shx-cash,.shx-clean .shx-say{border:0;background:var(--card);box-shadow:0 1px 4px #0002}
.shx-clean .shx-it{border:1px solid #0001;box-shadow:0 1px 4px #0002}.shx-clean .shx-it:hover{border-color:var(--ac);box-shadow:0 3px 10px #0002}
.shx-clean .shx-p{clip-path:none;border-radius:999px;padding:5px 12px}.shx-clean .shx-p:before{display:none}.shx-clean .shx-x{background:var(--ac);border-color:var(--ac);color:#fff;border-radius:999px}
/* pastel: soft card, scalloped awning, rounded everything */
.shx-pastel{border-color:var(--ac);border-radius:20px}.shx-pastel .shx-aw{border-color:var(--ac)}.shx-pastel h2{font-family:Georgia,serif;font-style:italic;color:var(--ac)}
.shx-pastel .shx-ic{border-color:var(--ac);box-shadow:3px 3px 0 var(--ac2)}.shx-pastel .shx-say,.shx-pastel .shx-cash{border-color:color-mix(in srgb,var(--ac) 50%,transparent)}
.shx-pastel .shx-it{border-color:color-mix(in srgb,var(--ac) 45%,transparent);box-shadow:0 3px 0 color-mix(in srgb,var(--ac) 35%,transparent);border-radius:16px}
.shx-pastel .shx-ii{border-radius:50%}.shx-pastel .shx-p{border-radius:999px;clip-path:none;padding:5px 12px}.shx-pastel .shx-p:before{display:none}.shx-pastel .shx-x{background:var(--ac);border-color:var(--ac);color:#fff;border-radius:999px}
/* boutique: black and white, spaced capitals, gold */
.shx-boutique{border:1px solid var(--ink);border-radius:2px;outline:1px solid var(--ink);outline-offset:-7px}
.shx-boutique .shx-aw{height:4px;border:0;background:var(--ac)}.shx-boutique .shx-aw:after{display:none}
.shx-boutique h2{font:400 22px Georgia,serif;letter-spacing:5px;text-transform:uppercase}.shx-boutique .shx-ic{border-radius:2px;box-shadow:none;border-width:1px}
.shx-boutique .shx-cash,.shx-boutique .shx-say{border-width:1px;border-radius:2px}.shx-boutique .shx-it{border-width:1px;border-radius:2px;box-shadow:none}.shx-boutique .shx-it:hover{box-shadow:3px 3px 0 var(--ac2)}
.shx-boutique .shx-n b{letter-spacing:1px;text-transform:uppercase;font-size:13px}.shx-boutique .shx-p{background:var(--ink);color:var(--bg);clip-path:none;border-radius:0}.shx-boutique .shx-p:before{display:none}
.shx-boutique .shx-x{border-radius:0;letter-spacing:2px;text-transform:uppercase;font-size:12px}
.shx-dark .shx-p{background:var(--ac);color:#14110c}.shx-dark .shx-x{background:var(--ac);color:#14110c;border-color:var(--ac)}
/* kraft: brown paper, stamped, a little hand-made */
.shx-kraft{background:var(--bg) repeating-linear-gradient(0deg,#0000 0 3px,#00000008 3px 4px);border-radius:8px}
.shx-kraft h2{font-family:'Courier New',monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.shx-kraft .shx-ic{border-style:dashed}.shx-kraft .shx-it{border-style:dashed;box-shadow:none;transform:rotate(-.25deg)}.shx-kraft .shx-it:nth-child(even){transform:rotate(.25deg)}
.shx-kraft .shx-it:hover{box-shadow:3px 3px 0 var(--ac)}.shx-kraft .shx-p{background:#fff;color:var(--ink);border:2px solid var(--ink);clip-path:none;transform:rotate(3deg)}
@media (max-width:520px){.shx h2{font-size:20px}.shx .shx-hd{flex-wrap:wrap}.shx .shx-cash{order:3;margin-left:64px}.shx .shx-dt{display:none}.shx .shx-n{flex:1}.shx .shx-tip{display:none}}
`;document.head.appendChild(st)}
})();
