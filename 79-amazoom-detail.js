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
