/* ---------- v56.1: more Amazoom furniture, and a home page of best sellers ----------
   New: dining chairs and a dining set, bigger TVs (they switch on like the first TV, see isTV in 22f), more sofas and
   armchairs, school chairs, desks, lockers and a blackboard, office furniture. Each design is a function that returns
   boxes [w,h,d,colour,x,y,z] (y up from the floor, +z the front, '*' glows). Designs with colours become keys name_0, name_1 ...
   Reused: azAdd from 182 (adds the item to F and AZ), AZX_LEGS from 79, the shop page azPage (13) and HDEC from 263.
   The Amazoom home page shows only the best sellers; a search or a ticked category shows everything else. */
(function(){
if(typeof F=='undefined'||typeof AZ=='undefined'||typeof azAdd!='function')return;
const D_=(c,k)=>{try{return dk(c,k)}catch(e){return c}},DK='#2a1d14',GD='#d8b04a',ST='#8a8f99',WD='#8a5a36';
const fz=(b,dx,dz,flip)=>b.map(a=>{const o=a.slice();o[4]+=dx;o[6]=(flip?-a[6]:a[6])+dz;return o});

/* ---- seats ---- */
function sofa(W,D,c,o){o=o||{};const arm=o.arm||.22,ah=o.ah||.34,lh=o.lh==null?.14:o.lh,n=o.n||2,bh=o.bh||.5,lc=o.lc||DK,cw=(W-2*arm)/n,b=[];
 const hx=W/2-.1,hz=D/2-.1;b.push(...AZX_LEGS(hx,hz,o.ls||.08,lh,lc));
 b.push([W,.22,D,D_(c,.8),0,lh+.11,0]);
 for(let i=0;i<n;i++){const x=-W/2+arm+cw*(i+.5);b.push([cw-.02,.14,D-.2,c,x,lh+.29,.06],[cw-.02,bh*.7,.14,D_(c,1.1),x,lh+.22+bh*.45,-D/2+.27])}
 b.push([W,bh,.18,D_(c,.9),0,lh+.22+bh/2,-D/2+.09]);
 [-1,1].forEach(s=>b.push([arm,ah,D,D_(c,.85),s*(W/2-arm/2),lh+.22+ah/2-.05,0]));
 if(o.tuft)for(let r=0;r<2;r++)for(let i=0;i<=Math.round(W*3);i++)b.push([.05,.05,.03,'#1a120c',-W/2+arm+.12+i*((W-2*arm-.24)/Math.round(W*3)),lh+.4+r*.16,-D/2+.19]);
 if(o.pillow)b.push([.3,.28,.12,o.pillow,-W/2+arm+.2,lh+.55,-D/2+.34]);
 return b}
const loveseat=c=>sofa(1.7,.85,c,{n:2,arm:.2,ah:.34,lh:.12,pillow:'#e6b422'});
const chester=c=>sofa(2.4,.95,c,{n:3,arm:.3,ah:.62,bh:.62,lh:.1,tuft:1,ls:.1,lc:'#1a120c'});
const midc=c=>sofa(2.1,.85,c,{n:3,arm:.1,ah:.26,bh:.46,lh:.3,ls:.06,lc:'#c08a4a',pillow:'#e6b422'});
function corner(c){const lh=.12,b=[...AZX_LEGS(1.3,.4,.08,lh,DK),[.08,lh,.08,DK,1.3,lh/2,.9],[.08,lh,.08,DK,.65,lh/2,.9],
 [2.8,.22,.85,D_(c,.8),0,lh+.11,-.575],[.85,.22,1.15,D_(c,.8),.975,lh+.11,.425],
 [2.8,.5,.18,D_(c,.9),0,lh+.47,-.91],[.2,.34,.85,D_(c,.85),-1.3,lh+.28,-.575],[.15,.3,1.15,D_(c,.85),1.325,lh+.26,.425]];
 [-.85,0,.85].forEach(x=>{if(x<.6)b.push([.86,.14,.75,c,x-.1,lh+.29,-.5],[.84,.32,.14,D_(c,1.1),x-.1,lh+.5,-.78])});
 b.push([.8,.14,1.0,c,.975,lh+.29,.5],[.8,.14,.74,D_(c,1.1),.975,lh+.4,-.5]);return b}
function recliner(c){const b=[...AZX_LEGS(.34,.34,.08,.1,DK),[.9,.24,.95,D_(c,.8),0,.22,-.02],[.7,.16,.7,c,0,.42,.02],[.8,.7,.2,D_(c,.9),0,.77,-.4],[.62,.5,.1,D_(c,1.12),0,.78,-.28],
 [.16,.36,.9,D_(c,.85),-.4,.45,0],[.16,.36,.9,D_(c,.85),.4,.45,0],[.7,.1,.46,D_(c,.9),0,.32,.66],[.66,.08,.36,c,0,.4,.68],[.06,.2,.06,'#555',-.2,.2,.4],[.06,.2,.06,'#555',.2,.2,.4]];return b}
function wingback(c){return[...AZX_LEGS(.3,.3,.06,.2,'#5a3a22'),[.8,.2,.75,D_(c,.8),0,.3,0],[.62,.14,.6,c,0,.47,.04],[.7,.8,.14,D_(c,.9),0,.8,-.32],
 [.14,.5,.34,D_(c,.95),-.36,.8,-.12],[.14,.5,.34,D_(c,.95),.36,.8,-.12],[.12,.28,.68,D_(c,.85),-.36,.5,.02],[.12,.28,.68,D_(c,.85),.36,.5,.02],[.5,.1,.04,GD,0,1.0,-.24]]}
const ottoman=c=>[...AZX_LEGS(.28,.28,.07,.12,DK),[.7,.24,.7,c,0,.24,0],[.62,.08,.62,D_(c,1.15),0,.4,0],[.06,.04,.06,'#1a120c',0,.44,0]];

/* ---- dining chairs ---- */
const dchairW=c=>[...AZX_LEGS(.19,.19,.05,.45,c),[.44,.05,.44,c,0,.475,0],[.05,.45,.05,c,-.19,.725,-.19],[.05,.45,.05,c,.19,.725,-.19],[.34,.07,.03,D_(c,1.15),0,.84,-.19],[.34,.07,.03,D_(c,1.15),0,.68,-.19]];
const dchairU=c=>[...AZX_LEGS(.18,.18,.04,.42,DK),[.46,.06,.46,DK,0,.45,0],[.44,.1,.44,c,0,.53,0],[.48,.5,.04,DK,0,.78,-.2],[.42,.44,.07,c,0,.78,-.17]];
const dchairI=c=>[...AZX_LEGS(.19,.19,.03,.46,'#1c1c20'),[.4,.03,.03,'#1c1c20',0,.2,.19],[.4,.03,.03,'#1c1c20',0,.2,-.19],[.42,.05,.42,c,0,.48,0],[.03,.4,.03,'#1c1c20',-.2,.7,-.2],[.03,.4,.03,'#1c1c20',.2,.7,-.2],[.42,.05,.04,'#1c1c20',0,.93,-.2],[.4,.12,.03,c,0,.8,-.2]];
const dchairV=c=>[...AZX_LEGS(.17,.17,.04,.42,GD),[.44,.1,.44,c,0,.47,0],[.44,.48,.1,c,0,.76,-.19],[.34,.06,.02,D_(c,1.3),0,.9,-.14]];
const barchair=c=>[...AZX_LEGS(.18,.18,.04,.74,'#1c1c20'),[.4,.03,.03,'#1c1c20',0,.3,.18],[.4,.03,.03,'#1c1c20',0,.3,-.18],[.44,.07,.44,c,0,.78,0],[.4,.26,.05,c,0,1.0,-.2]];
const diningSet=()=>{const t=[...AZX_LEGS(.62,.36,.07,.7,DK),[1.4,.07,.9,WD,0,.74,0],[1.34,.03,.84,D_(WD,1.15),0,.785,0]];
 return[...t,...fz(dchairW(D_(WD,.9)),-.4,.82,0),...fz(dchairW(D_(WD,.9)),.4,.82,0),...fz(dchairW(D_(WD,.9)),-.4,-.82,1),...fz(dchairW(D_(WD,.9)),.4,-.82,1)]};
const roundTable=()=>[[1.5,.07,.9,WD,0,.74,0],[.9,.07,1.5,WD,0,.74,0],[1.28,.07,1.28,WD,0,.74,0],[.2,.7,.2,DK,0,.36,0],[.8,.06,.8,DK,0,.03,0],[.5,.04,.5,D_(WD,1.2),0,.79,0]];
const consoleT=()=>[...AZX_LEGS(.52,.12,.05,.78,DK),[1.2,.05,.34,WD,0,.8,0],[1.1,.04,.28,D_(WD,.85),0,.35,0]];

/* ---- school ---- */
const schoolChair=c=>[...AZX_LEGS(.17,.17,.04,.44,ST),[.4,.03,.03,ST,0,.2,.17],[.42,.05,.4,c,0,.46,0],[.03,.3,.03,ST,-.15,.63,-.19],[.03,.3,.03,ST,.15,.63,-.19],[.42,.28,.04,c,0,.76,-.19]];
const schoolDesk=()=>[...AZX_LEGS(.3,.2,.04,.7,ST),[.7,.05,.5,'#d8b98a',0,.72,0],[.7,.04,.03,'#8a6238',0,.745,.245],[.03,.04,.5,'#8a6238',.345,.745,0],[.03,.04,.5,'#8a6238',-.345,.745,0],
 [.58,.04,.36,ST,0,.42,0],[.3,.1,.24,'#c0392b',-.1,.49,0],[.2,.08,.22,'#2f6fb5',.12,.48,0],[.1,.02,.2,'#222',.24,.75,-.05]];
const schoolSet=()=>[...fz(schoolDesk(),0,-.3,0),...fz(schoolChair('#2f6fb5'),0,.42,1)];
function teacherDesk(){const b=[[1.5,.06,.75,'#7a5230',0,.76,0],[.5,.7,.7,'#8a5e38',-.5,.35,0],[.04,.7,.7,'#8a5e38',.72,.35,0],[1.0,.5,.02,'#6a4528',.2,.5,-.34]];
 [.12,.35,.58].forEach(y=>b.push([.42,.2,.02,D_('#8a5e38',1.2),-.5,y,.36],[.1,.03,.03,GD,-.5,y+.02,.38]));
 b.push([.1,.1,.1,'#c0392b',.45,.84,.1],[.3,.06,.22,'#2f6fb5',-.4,.82,-.1],[.3,.05,.22,'#e6b422',-.4,.87,-.1],[.08,.26,.08,'#333',.6,.92,-.2],[.2,.04,.2,'#333',.6,.8,-.2]);return b}
const blackboard=()=>[[.06,1.8,.06,'#6b4a2e',-.9,.9,-.1],[.06,1.8,.06,'#6b4a2e',.9,.9,-.1],[1.9,1.2,.06,WD,0,1.25,0],[1.8,1.1,.02,'#1f3a2c',0,1.25,.04],
 [1.1,.02,.01,'#e8e8e8',-.2,1.55,.052],[.8,.02,.01,'#e8e8e8',-.3,1.4,.052],[1.2,.02,.01,'#e8e8e8',-.1,1.25,.052],[.3,.3,.01,'#ffe066',.55,1.4,.052],[1.8,.06,.14,WD,0,.68,.07],[.1,.03,.04,'#f4f1e8',-.3,.72,.08],[.12,.05,.06,'#aaa',.4,.72,.08]];
function lockers(c){const b=[[1.2,1.8,.45,c,0,.9,0],[1.24,.06,.47,D_(c,.7),0,1.83,0],[1.1,.08,.4,'#1a1a20',0,.04,0]];
 [-.4,0,.4].forEach(x=>{b.push([.37,1.66,.02,D_(c,1.25),x,.9,.235],[.2,.03,.01,'#111',x,1.56,.248],[.2,.03,.01,'#111',x,1.5,.248],[.2,.03,.01,'#111',x,1.44,.248],[.03,.14,.03,GD,x+.13,1.0,.255],[.03,.03,.02,'#111',x-.1,.7,.25])});return b}
const globe=()=>[[.3,.04,.3,'#3a2a1c',0,.02,0],[.05,.5,.05,'#3a2a1c',0,.27,0],[.38,.38,.38,'#2f6fb5',0,.66,0],[.4,.2,.3,'#4aa35a',.01,.7,.05],[.2,.2,.4,'#4aa35a',-.1,.6,-.02],[.42,.06,.42,'#d8b04a',0,.66,0],[.1,.06,.1,'#f4f1e8',0,.88,0]];

/* ---- office ---- */
const officeDesk=()=>{const w='#e4dccb',b=[[1.6,.05,.8,w,0,.75,0],[.04,.72,.78,'#c8bfa8',-.78,.36,0],[1.0,.4,.02,'#c8bfa8',-.25,.5,-.38],[.5,.7,.74,'#d4cab4',.53,.36,0]];
 [.2,.42,.62].forEach(y=>b.push([.46,.2,.02,'#f2eadb',.53,y,.375],[.12,.03,.03,'#555',.53,y+.02,.39]));b.push([.04,.72,.04,'#c8bfa8',-.78,.36,.36]);return b}
const officeChair=()=>[[.6,.04,.06,'#222',0,.1,0],[.06,.04,.6,'#222',0,.1,0],[.07,.06,.07,'#111',.3,.04,0],[.07,.06,.07,'#111',-.3,.04,0],[.07,.06,.07,'#111',0,.04,.3],[.07,.06,.07,'#111',0,.04,-.3],
 [.06,.36,.06,'#555',0,.3,0],[.5,.09,.5,'#2a2d34',0,.5,0],[.48,.5,.07,'#2a2d34',0,.82,-.22],[.05,.05,.3,'#222',-.28,.62,-.02],[.05,.05,.3,'#222',.28,.62,-.02],[.1,.14,.04,'#555',0,.6,-.2]];

/* ---- TVs: stand, bezel, screen (the third box is the screen, 22f paints it) ---- */
const tv65=()=>[[1.9,.42,.5,'#2a2a30',0,.21,0],[1.8,1.05,.08,'#111',0,.97,0],[1.7,.93,.02,'*3a6a9a',0,.97,.05],[.5,.14,.2,'#333',0,.49,0],[1.1,.06,.04,'#444',0,.3,.26],[.1,.05,.02,'*3ad0ff',.7,.22,.26]];
const tv75=()=>[[2.7,.5,.5,'#3b2a1c',0,.25,0],[2.55,1.5,.08,'#0e0e10',0,1.3,0],[2.4,1.4,.02,'*3a6a9a',0,1.3,.05],[.6,.25,.2,'#222',0,.62,0],[1.5,.08,.1,'#222',0,.56,.16],
 [1.25,.4,.02,'#4e3a28',-.65,.25,.26],[1.25,.4,.02,'#4e3a28',.65,.25,.26],[.05,.12,.03,GD,-.06,.3,.28],[.05,.12,.03,GD,.06,.3,.28]];
const tv85=()=>[[3,.4,.45,'#111',0,.2,0],[2.95,1.7,.08,'#0a0a0c',0,1.3,0],[2.82,1.58,.02,'*5a8abf',0,1.3,.05],[2.9,.03,.02,'*3ad0ff',0,.43,.23],[.7,.12,.2,'#222',0,.46,0],[.5,.2,.04,'#222',-.9,.2,.24],[.5,.2,.04,'#222',.9,.2,.24]];
const tv32=()=>[[1,.4,.4,WD,0,.2,0],[.9,.55,.06,'#111',0,.7,0],[.82,.47,.02,'*3a6a9a',0,.7,.04],[.2,.06,.14,'#333',0,.43,0],[.4,.1,.02,D_(WD,.8),0,.2,.21]];
const crt=()=>[[.9,.45,.5,'#5a3a22',0,.225,0],[.9,.7,.5,WD,0,.8,0],[.62,.5,.02,'*3a6a9a',-.08,.82,.26],[.12,.5,.02,'#222',.33,.82,.26],[.08,.08,.03,'#ccc',.33,.96,.28],[.08,.08,.03,'#ccc',.33,.82,.28],
 [.03,.4,.03,'#aaa',-.12,1.35,0],[.03,.4,.03,'#aaa',.12,1.35,0],[.2,.04,.2,'#222',0,1.17,0]];

const PAL3=[['Rose','#c7788f'],['Teal','#2e7d7a'],['Mustard','#d4a017']],PAL2=[['Tan leather','#a0643a'],['Black leather','#26262a']],GREY=[['Grey','#7a8088'],['Navy','#2f4a7a'],['Cream','#e0d6c0']],
 BC=[['Blue','#2f6fb5'],['Orange','#e8742a'],['Green','#2e8b57']];
const SINGLES=[['dchair_w','Wooden dining chair',55,.5,.5,'Seating',dchairW(WD),'Slatted back, solid wood, stacks of dinner parties','Best Seller'],
 ['dchair_u','Upholstered dining chair',90,.5,.5,'Seating',dchairU('#e8dcc0'),'Padded seat and back, wipe clean'],
 ['dchair_i','Industrial dining chair',70,.5,.5,'Seating',dchairI('#8a5a36'),'Black metal frame, wooden seat'],
 ['dchair_v','Velvet dining chair',110,.5,.5,'Seating',dchairV('#2e7d5a'),'Emerald velvet with gold legs','New'],
 ['barchair','High bar chair',85,.5,.5,'Seating',barchair('#26262a'),'For the kitchen counter, tall'],
 ['dset','Dining table set for four',520,2.2,2,'Tables',diningSet(),'A table and four chairs, delivered ready to eat at'],
 ['rtable','Round dining table',290,1.5,1.5,'Tables',roundTable(),'Pedestal base, seats four, no corners'],
 ['console','Console table',170,1.2,.34,'Tables',consoleT(),'Hallway table with a shelf underneath'],
 ['odesk','Office desk with drawers',260,1.6,.8,'Tables',officeDesk(),'Three drawers and a cable gap'],
 ['ochair','Office swivel chair',150,.62,.62,'Seating',officeChair(),'Wheels, arms and a lumbar curve','Best Seller'],
 ['sdesk','School desk',55,.7,.5,'Tables',schoolDesk(),'Classroom desk with a book shelf underneath'],
 ['sset','School desk and chair set',90,.8,1.15,'Tables',schoolSet(),'The desk, the chair and a pencil'],
 ['tdesk','Teacher desk',270,1.5,.75,'Tables',teacherDesk(),'Three drawers and room for an apple','Amazoom\'s Choice'],
 ['bboard','Classroom blackboard',190,1.9,.3,'Decor',blackboard(),'Real chalk marks, tray included'],
 ['globe','Classroom globe',42,.45,.45,'Decor',globe(),'Spin it and point at somewhere'],
 ['tv32','Compact 32 inch TV',320,1,.4,'Electronics',tv32(),'Small screen, big on a bedroom cabinet'],
 ['tv65','Smart TV 65 inch + stand',1100,1.9,.5,'Electronics',tv65(),'4K, built in soundbar, press E to switch on','Best Seller'],
 ['tv75','Giant 75 inch TV + media unit',2000,2.7,.55,'Electronics',tv75(),'Cinema in the living room, walnut media unit','Amazoom\'s Choice'],
 ['tv85','Cinema 85 inch TV',3500,3,.5,'Electronics',tv85(),'The biggest screen Amazoom delivers','New'],
 ['crt','Retro CRT TV',130,.9,.5,'Electronics',crt(),'Wood panel, rabbit ears, a very warm picture']];
const DES=[['loveseat','Velvet loveseat sofa',330,1.7,.85,'Seating',loveseat,'Two seats and a gold cushion',PAL3,2],
 ['chester','Chesterfield sofa',650,2.4,.95,'Seating',chester,'Buttoned back and rolled arms',PAL2.concat([['Green velvet','#2e5a44']]),0],
 ['corner','L-shaped corner sofa',780,2.8,2,'Seating',corner,'Seats five, chaise on the end',GREY,0,'Best Seller'],
 ['midc','Mid-century sofa',520,2.1,.85,'Seating',midc,'Slim arms and walnut legs',PAL3,1],
 ['recl','Recliner armchair',380,.95,1.3,'Seating',recliner,'Footrest out, feet up',[['Brown','#6b4a2e'],['Charcoal','#40434a']],0],
 ['wing','Wingback armchair',300,.9,.85,'Seating',wingback,'Tall back with wings for reading',[['Burgundy','#7a2a3a'],['Forest','#2e5a44']],0],
 ['ottom','Footstool ottoman',90,.7,.7,'Seating',ottoman,'Footstool, extra seat or a coffee table',PAL3,0],
 ['schch','School chair',35,.46,.46,'Seating',schoolChair,'Hard-wearing plastic shell, steel legs',BC,0,'Best Seller'],
 ['lockr','School lockers',220,1.2,.45,'Storage',lockers,'Three doors with vents and a handle',[['Blue','#2f6fb5'],['Red','#b83a3a']],0]];
const LIST=SINGLES.slice();
DES.forEach(([k,n,p,w,d,cat,fn,line,pal,badgeIdx,bd])=>pal.forEach(([cn,hex],i)=>LIST.push([k+'_'+i,cn+' '+n,p+i*15,w,d,cat,fn(hex),line,i==badgeIdx&&bd?bd:''])));
azAdd(LIST);

/* ---- the Amazoom page: floors and wallpaper in, best sellers on the home page ---- */
const best=L=>{const rk=x=>/^Best/.test(x.bd||'')?0:1,bo=x=>['1K+','500+','200+','100+'].indexOf(x.bought);
 return L.filter(x=>/^(Best|Amazoom)/.test(x.bd||'')).sort((a,b)=>rk(a)-rk(b)||bo(a)-bo(b)).slice(0,36)};
{const az0=azPage;azPage=function(id,o){if(id=='amz')try{o.cats=o.cats.concat(['Flooring','Wallpaper'].filter(c=>!o.cats.includes(c)));if(window.HDEC)o.items=o.items.concat(HDEC.items());o.home=best;o.homeNote='The most popular things on Amazoom right now. Search for anything else, like dining chair, school desk, big TV, wallpaper or floor.'}catch(e){console.error('amazoom page',e)}return az0.call(this,id,o)}}
})();
