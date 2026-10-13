/* ===== v26.58: Amazoom product detail =====
   Every furniture and gear listing gets a specs line under its description: size, material, assembly and warranty.
   The numbers come from the item's category, with a small fixed variation per item, so a listing looks the same every visit. */
const AZ_BASE={Seating:[160,85,80],Tables:[110,60,45],Storage:[80,35,180],Decor:[60,40,120],Electronics:[120,70,8],Appliances:[60,60,170],Lighting:[30,30,160],Music:[60,45,90],Bedroom:[160,200,60],Pets:[60,40,45]};
const AZ_MAT={Seating:['Fabric upholstery, pine frame','Velvet-touch fabric, solid wood legs','Faux leather, steel frame'],Tables:['Oak-effect laminate, steel legs','Tempered glass top, powder-coated frame'],Storage:['Engineered wood, metal back panel','Solid pine, matt finish'],Decor:['Woven cotton, ceramic base','Faux foliage, plastic pot'],Electronics:['ABS plastic, aluminium trim'],Appliances:['Steel and plastic, energy class A'],Lighting:['Brushed steel, frosted glass'],Music:['Solid wood, brass fittings'],Bedroom:['Pine and MDF, soft-close hinges'],Pets:['Recycled fabric, washable']};
function azSpec(x){const cat=x&&x.cat||'Decor',k=String(x&&x.k||''),h=[...k].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
 const b=AZ_BASE[cat]||[80,50,60],v=i=>(0.9+((h>>(i*4))%21)/100),dims=b.map((n,i)=>Math.round(n*v(i)));
 const mats=AZ_MAT[cat]||['Engineered wood'],mat=mats[h%mats.length],wt=Math.round(dims[0]*dims[1]*dims[2]/40000*10)/10;
 return `Size ${dims[0]} × ${dims[1]} × ${dims[2]} cm · ${wt} kg · ${mat} · Assembly: ${cat=='Electronics'||cat=='Appliances'?'none, plug in':'about 20 min'} · 1 year warranty`}
/* ===== v26.69: richer Amazoom listings =====
   Each listing gets a longer description, three feature bullets, the finishes it comes in and one customer review.
   Every line is picked from a short pool by the item's key, so the same item always reads the same way. */
const AZ_LONG={Seating:['Deep seat with firm foam that keeps its shape for years.','Clean lines fit a small living room, a studio corner or a spare room.','Removable covers can go in the wash on a cool, gentle cycle.','Plastic glides on the feet protect wooden floors from scratches.','Sits two comfortably, or one person stretched out with a book.'],
Tables:['A sturdy top that wipes clean in seconds, so coffee rings are no problem.','Legs lock in with a twist and the frame stays steady on uneven floors.','Sits neatly under most sofas and beside a bed.','The surface resists scratches, but use a coaster for hot mugs.','Low enough for a sofa, tall enough for a laptop and a cup.'],
Storage:['Room for books, records, shoes and the odd plant.','A solid back panel stops the unit wobbling when it is full.','Anchor it to the wall with the fixings in the box (recommended).','Shelves move in 3 cm steps to fit tall or short items.','Stacks neatly with a second unit if you need more room.'],
Decor:['A finishing touch that makes a room feel lived in.','Light enough to move around the house by yourself.','No upkeep needed, just dust it now and then.','Looks good on its own or grouped with other pieces.'],
Electronics:['Bright panel with wide viewing angles, so the whole room can see it.','Works with the main streaming apps and a voice remote.','Wall-mount ready (bracket not included).','Two HDMI ports and one USB port for games and a sound bar.'],
Appliances:['Quiet motor, so it will not drown out your music.','Smart shelves and a crisper drawer help food last longer.','Fits a small kitchen corner with a 5 cm gap at the back for air.','Door alarm sounds if it is left open.'],
Lighting:['Warm bulb included, with a soft diffuser that does not glare.','Adjustable arm so you can point the light where you need it.','A simple switch on the cord, with no fiddly controls.','Weighted base so it stays put when you bump it.'],
Music:['Solid build with brass fittings that look good on a shelf.','Adds a warm, natural sound to any room.','Comes with the cable and a cloth for the finish.'],
Bedroom:['Soft-close hinges and a sturdy frame that will not creak at night.','Room for a duvet and pillows without taking over the room.','Flat-pack parts with clear pictures and every screw included.','Fixing kit included, so it stands safely against the wall.'],
Pets:['Washable cover that does not hold on to fur.','Raised edges and a non-slip base keep it in place.','Fits most crate and cage sizes up to a medium pet.']};
const AZ_FIN={Seating:['Oat','Charcoal','Sage','Navy'],Tables:['Oak effect','Walnut effect','White'],Storage:['White','Oak effect','Black'],Decor:['Natural','Sand','Forest green'],Electronics:['Graphite','Silver'],Appliances:['White','Stainless effect'],Lighting:['Brass','Matt black','Chrome'],Music:['Walnut','Ebony'],Bedroom:['Pine','Oak effect','White'],Pets:['Grey','Sand','Plum']};
const AZ_REV=['Arrived the next day and assembly took about twenty minutes. Happy with it.','Looks better in person than in the pictures. Would buy again.','Good value for the money, and the instructions were clear.','Solid enough. A couple of screws were tight but they went in fine.','Exactly what I needed for a small flat. Five stars from me.','Took a while to put together, but it feels sturdy now.','Does the job. The packaging was a bit much, though.','Fits the space perfectly. The colour matches the photos.'];
const azH=(k,n)=>{let h=7;for(const c of String(k))h=(h*31+c.charCodeAt(0))>>>0;return n?h%n:h};
function azDetail(x){const cat=x&&x.cat||'Decor',k=String(x&&x.k||''),h=azH(k),lines=AZ_LONG[cat]||AZ_LONG.Decor,fin=AZ_FIN[cat]||['Natural'];
 const i0=h%lines.length,ln=(j)=>lines[(i0+j)%lines.length],fins=[0,1,2].map(j=>fin[(h+j)%fin.length]).filter((v,j,a)=>a.indexOf(v)===j);
 const rev=AZ_REV[(h>>3)%AZ_REV.length],rv=x&&x.r?x.r:4;
 return `<div class=azx><div class=azsp>${azSpec(x)}</div>
 <div class=azdesc>${esc(ln(0))} ${esc(ln(1))}</div>
 <ul class=azul>${[2,3,4].map(j=>`<li>${esc(ln(j))}</li>`).join('')}</ul>
 <div class=azfin><b>Finishes:</b> ${fins.map(esc).join(', ')}</div>
 <div class=azrv><span class=st>${stars(rv)}</span> <span class=g>Top review · Verified buyer</span><div>&ldquo;${esc(rev)}&rdquo;</div></div></div>`}
{const st=document.createElement('style');st.textContent='.az .azx{margin-top:4px}.az .azsp{font-size:12px;color:#565959}.az .azdesc{font-size:12px;margin:4px 0;line-height:1.4}.az .azul{font-size:12px;margin:4px 0 4px 16px;padding:0;line-height:1.4}.az .azfin{font-size:12px;margin:4px 0}.az .azrv{font-size:12px;border-top:1px solid #e7e7e7;padding-top:4px;margin-top:4px;line-height:1.4}';document.head.appendChild(st)}
/* ===== v26.72: more detailed furniture models =====
   Each Amazoom item keeps its base boxes from 22-v8 and gets extra parts for its kind: legs, cushions, seams,
   handles, trim and small details, sized to the item's footprint. The same parts are used in the shop preview,
   the item you hold and the one you place in the house, since they all read F[k].b. */
const AZX_LEGS=(hx,hz,s,h,c)=>[[s,h,s,c,hx,h/2,hz],[s,h,s,c,-hx,h/2,hz],[s,h,s,c,hx,h/2,-hz],[s,h,s,c,-hx,h/2,-hz]];
const AZX={
 arm:(c)=>[...AZX_LEGS(.36,.34,.07,.12,'#2a1d14'),[.8,.1,.8,dk(c,1.12),0,.45,0],[.8,.04,.02,dk(c,.7),0,.5,.41],
   [.84,.5,.12,dk(c,.9),0,.66,-.4],[.1,.02,.84,dk(c,.7),-.4,.42,0],[.1,.02,.84,dk(c,.7),.4,.42,0],[.08,.08,.08,dk(c,.6),-.36,.84,-.4]],
 sofa2:(c)=>[...AZX_LEGS(1.1,.34,.07,.12,'#2a1d14'),[1.2,.1,.8,dk(c,1.12),-.62,.45,.03],[1.2,.1,.8,dk(c,1.12),.62,.45,.03],
   [1.2,.2,.1,dk(c,.9),-.62,.7,-.3],[1.2,.2,.1,dk(c,.9),.62,.7,-.3],[.02,.02,.82,dk(c,.7),0,.5,.03],[.14,.1,.84,dk(c,.9),-1.27,.58,0],[.14,.1,.84,dk(c,.9),1.27,.58,0]],
 bed:(c)=>[[.12,.9,.12,'#4a3320',-.9,.45,-1.5],[.12,.9,.12,'#4a3320',.9,.45,-1.5],[.8,.3,.5,'#fff',-.4,.7,-.9],[.8,.3,.5,'#fff',.4,.7,-.9],
   [1.8,.08,.9,dk(c,.9),0,.8,.6],[1.8,.02,.22,'#f6f2ea',0,.84,.2],[.12,.12,.12,'#2a1d14',-.9,.06,1.4],[.12,.12,.12,'#2a1d14',.9,.06,1.4],[.12,.12,.12,'#2a1d14',-.9,.06,-1.4],[.12,.12,.12,'#2a1d14',.9,.06,-1.4]],
 desk:(c)=>[[.7,.66,.6,dk(c,.9),-.45,.4,0],[.04,.14,.02,'#c9a227',-.45,.5,.31],[.6,.04,.02,dk(c,.6),-.9,.7,.05],[.4,.04,.4,'#1b1b1b',0,.85,-.05],
   [.5,.02,.3,'#222',.0,.9,.05],[.12,.12,.12,'#2a1d14',-.84,.06,.3],[.12,.12,.12,'#2a1d14',.84,.06,.3],[.04,.02,.5,'#333',.5,.82,-.2]],
 cab:(c)=>[[.46,.9,.02,dk(c,1.05),-.24,.6,.26],[.46,.9,.02,dk(c,1.05),.24,.6,.26],[.04,.12,.03,'#c9a227',-.05,.7,.28],[.04,.12,.03,'#c9a227',.05,.7,.28],
   [1.04,.06,.54,dk(c,.8),0,1.12,0],[.9,.1,.5,'#101010',0,.05,0],[.96,.04,.02,dk(c,.6),0,.2,.26]],
 ward:(c)=>[[.5,1.8,.02,dk(c,.9),-.28,1,.31],[.5,1.8,.02,dk(c,.9),.28,1,.31],[.04,.3,.03,'#c9a227',-.05,1.02,.33],[.04,.3,.03,'#c9a227',.05,1.02,.33],
   [1.24,.1,.64,dk(c,.8),0,2.05,0],[1.2,.08,.6,dk(c,.7),0,.05,0],[.9,.02,.02,dk(c,.6),0,.4,.32],[.9,.02,.02,dk(c,.6),0,1.5,.32]],
 pot:(c)=>[[.46,.04,.46,'#3b2a1a',0,.36,0],[.56,.08,.56,'#a0522d',0,.34,0],[.1,.12,.1,'#2d4a2d',0,.94,0],[.45,.04,.02,dk(c,.9),-.2,.7,.2],
   [.22,.05,.04,dk(c,1.1),-.2,.9,.22],[.22,.05,.04,dk(c,1.1),.25,1.05,-.1],[.18,.05,.04,dk(c,1.2),-.05,1.12,.18],[.2,.04,.04,dk(c,1.2),.18,.8,-.2]],
 cac:(c)=>[[.38,.04,.38,'#8a4a2a',0,.28,0],[.1,.16,.1,'#2e8b57',.1,.1,.1],[.04,.06,.04,'#eee',.13,.1,.1],[.04,.06,.04,'#eee',.07,.04,.13],
   [.06,.2,.06,dk(c,1.1),.1,.45,-.04],[.06,.2,.06,dk(c,1.1),-.08,.5,.06],[.04,.04,.04,'#eee',.1,.56,-.04],[.04,.04,.04,'#eee',-.08,.6,.06]],
 art:(c)=>[[.08,.04,.06,'#c9a227',-.56,1.84,0],[.08,.04,.06,'#c9a227',.56,1.84,0],[.08,.04,.06,'#c9a227',-.56,.96,0],[.08,.04,.06,'#c9a227',.56,.96,0],
   [.4,.5,.02,dk(c,.6),-.25,1.4,.06],[.3,.2,.02,'#2b6f9e',.25,1.5,.06],[.02,.02,.02,'#222',0,1.84,0]],
 spk:(c)=>[[.5,.14,.4,dk(c,.9),0,1.0,0],[.3,.3,.02,'#333',0,.52,.21],[.14,.14,.02,'#9aa0a6',0,.52,.22],[.22,.22,.02,'#222',0,.22,.21],[.08,.08,.02,'#9aa0a6',0,.22,.22],
   [.22,.04,.22,'#111',0,.02,0],[.06,.06,.06,'#ffb000',.2,.94,.2]],
 pno:(c)=>[[.08,.4,.08,'#111',-.7,.2,-.2],[.08,.4,.08,'#111',.7,.2,-.2],[.1,.2,.06,'#111',0,.1,.1],[1.5,.22,.02,dk(c,.6),0,.35,.22],
   [1.2,.02,.26,'#fff',0,.84,.14],[1.2,.1,.2,'#111',0,.8,.14],[.04,.16,.02,'#111',-.5,.9,.14],[.02,.14,.02,'#fff',0,.9,.14],[.02,.14,.02,'#fff',.3,.9,.14],[.9,.02,.1,'#fff',0,.88,.14]],
 aqu:(c)=>[[1.3,.04,.5,'#777',0,.02,0],[1.36,.03,.56,'#8a5a36',0,.5,0],[.06,.5,.06,'#333',-.66,.27,-.27],[.06,.5,.06,'#333',.66,.27,-.27],[.06,.5,.06,'#333',-.66,.27,.27],[.06,.5,.06,'#333',.66,.27,.27],
   [1.2,.1,.4,'#c9a35c',0,.1,0],[.18,.36,.18,'#2e8b57',-.3,.4,0],[.12,.22,.12,'#3cb371',.3,.36,.05],[.08,.08,.08,'#ffe066',.1,.6,.1]],
 ben:(c)=>[[.12,.3,.36,'#222',-.6,.2,0],[.12,.3,.36,'#222',.6,.2,0],[1.4,.04,.4,dk(c,.9),0,.42,0],[1.4,.04,.4,dk(c,.9),0,.5,0],[1.36,.12,.42,dk(c,1.1),0,.42,0],[1.2,.06,.04,dk(c,.7),0,.1,.22]],
 bean:(c)=>[[.7,.1,.7,dk(c,.9),0,.1,0],[.5,.06,.5,dk(c,1.1),0,.2,0],[.04,.04,.02,dk(c,.6),0,.22,.26]],
 mir:(c)=>[[.12,.1,.1,'#c9a227',-.22,.1,0],[.12,.1,.1,'#c9a227',.22,.1,0],[.06,1.2,.06,'#c9a227',-.36,.9,0],[.06,1.2,.06,'#c9a227',.36,.9,0],[.8,.06,.14,'#c9a227',0,1.65,0]],
 clk:(c)=>[[.8,.2,.5,dk(c,.7),0,.1,0],[.5,.3,.36,dk(c,.7),0,2.1,0],[.7,.14,.46,dk(c,.6),0,2.7,0],[.3,.3,.02,'#f4f1e8',0,2.1,.19],[.02,.14,.02,'#111',0,2.14,.2],[.02,.1,.02,'#111',.04,2.08,.2]],
 bin:(c)=>[[.36,.04,.36,dk(c,.7),0,.02,0],[.42,.04,.42,dk(c,.8),0,.5,0],[.4,.04,.02,dk(c,.6),0,.25,.2],[.04,.1,.04,'#999',0,.55,.2]],
 gch:(c)=>[[.6,.1,.6,'#222',0,.52,0],[.6,.06,.1,'#222',0,.9,-.25],[.08,.4,.08,'#333',0,.2,0],[.44,.06,.44,'#111',0,.02,0],[.5,.04,.04,'#222',-.3,.4,.3],[.5,.04,.04,'#222',.3,.4,.3],[.08,.2,.08,'#333',0,.42,-.22]],
 tab:(c)=>[[.76,.04,.76,dk(c,1.1),0,.6,0],[.04,.04,.04,'#222',0,.2,0],[.1,.56,.1,dk(c,.7),-.36,.3,-.36],[.1,.56,.1,dk(c,.7),.36,.3,.36],[.1,.56,.1,dk(c,.7),.36,.3,-.36],[.1,.56,.1,dk(c,.7),-.36,.3,.36]],
 lampt:(c)=>[[.02,.4,.02,'#777',.0,.25,0],[.1,.02,.1,'#111',0,.0,.0],[.12,.01,.1,'#111',0,.45,0]],
 drum:(c)=>[[.04,.9,.04,'#888',-.5,.45,-.4],[.04,.9,.04,'#888',.5,.45,-.4],[.7,.04,.04,'#888',0,.5,-.4],[.5,.04,.04,'#888',-.6,.9,.3],[.4,.1,.1,'#222',0,.15,-.5],[.08,.2,.08,'#ddd',.2,.2,.1]],
 gst:(c)=>[[.04,.9,.04,'#777',-.25,.45,0],[.04,.9,.04,'#777',.25,.45,0],[.52,.04,.04,'#777',0,.1,0],[.08,.04,.08,'#222',0,.7,.2],[.04,.4,.02,dk(c,.6),0,.85,.3]],
 rugr:(c)=>[[1.6,.03,.8,dk(c,1.15),0,.04,0],[.06,.04,1.2,'#f4f1e8',-.9,.05,0],[.06,.04,1.2,'#f4f1e8',.9,.05,0],[1.4,.04,.02,'#f4f1e8',0,.05,.6],[1.4,.04,.02,'#f4f1e8',0,.05,-.6]]
};
NF.forEach(n=>{const f=F[n[0]],ex=AZX[n[6]];if(f&&ex&&!f.xd){f.b=[...f.b,...ex(n[7])];f.xd=1}});
