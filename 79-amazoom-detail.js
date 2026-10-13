/* ===== v26.58: Amazoom product detail =====
   Every furniture and gear listing gets a specs line under its description: size, material, assembly and warranty.
   The numbers come from the item's category, with a small fixed variation per item, so a listing looks the same every visit. */
const AZ_BASE={Seating:[160,85,80],Tables:[110,60,45],Storage:[80,35,180],Decor:[60,40,120],Electronics:[120,70,8],Appliances:[60,60,170],Lighting:[30,30,160],Music:[60,45,90],Bedroom:[160,200,60],Pets:[60,40,45]};
const AZ_MAT={Seating:['Fabric upholstery, pine frame','Velvet-touch fabric, solid wood legs','Faux leather, steel frame'],Tables:['Oak-effect laminate, steel legs','Tempered glass top, powder-coated frame'],Storage:['Engineered wood, metal back panel','Solid pine, matt finish'],Decor:['Woven cotton, ceramic base','Faux foliage, plastic pot'],Electronics:['ABS plastic, aluminium trim'],Appliances:['Steel and plastic, energy class A'],Lighting:['Brushed steel, frosted glass'],Music:['Solid wood, brass fittings'],Bedroom:['Pine and MDF, soft-close hinges'],Pets:['Recycled fabric, washable']};
function azSpec(x){const cat=x&&x.cat||'Decor',k=String(x&&x.k||''),h=[...k].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
 const b=AZ_BASE[cat]||[80,50,60],v=i=>(0.9+((h>>(i*4))%21)/100),dims=b.map((n,i)=>Math.round(n*v(i)));
 const mats=AZ_MAT[cat]||['Engineered wood'],mat=mats[h%mats.length],wt=Math.round(dims[0]*dims[1]*dims[2]/40000*10)/10;
 return `Size ${dims[0]} × ${dims[1]} × ${dims[2]} cm · ${wt} kg · ${mat} · Assembly: ${cat=='Electronics'||cat=='Appliances'?'none, plug in':'about 20 min'} · 1 year warranty`}
