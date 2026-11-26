/* ---------- v56.1: buyable floors and pixel wallpaper for every room at home ----------
   Amazoom sells floor styles (planks, herringbone, tiles, concrete, marble, carpet) and pixel wallpaper. A style is
   bought once and then yours: press E in any room at home, Decorate this room, and pick the floor, the wallpaper for
   the upper walls and a wallpaper for the lower walls (the low walls that sit under the window line).
   Reused: the paint system of 123 (PRM rooms, prWalls, prRecolour, paintUI for the Paint tab), azPage and pvModel (the
   spinning shop pictures), dynInt for the prompt. New: the textures, the floor overlay and the Decorate menu.
   Saved (S, defaults in 02-data): dcO owned styles {id:1}, rf floor {room:id}, rw upper wall {room:id}, rt lower wall {room:id}.
   Room keys are the PRM keys of 123 (g0..g3 downstairs, w0 w1 back rooms, u0..u3 upstairs). Old saves have none of these. */
(function(){
if(typeof PRM=='undefined'||typeof prWalls!='function'||typeof prRecolour!='function')return;
const hh=(x,y,s)=>{let h=(x*374761393+y*668265263+s*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)%100};
const BM={heart:['........','.##..##.','########','########','.######.','..####..','...##...','........'],
 star:['...##...','...##...','########','.######.','..####..','..####..','.##..##.','.#....#.'],
 note:['....###.','....#.##','....#...','....#...','..###...','.####...','.####...','..##....'],
 leaf:['......##','....####','...#####','..####.#','.####.#.','.###.#..','###.#...','#..#....'],
 cloud:['........','...##...','..####..','.######.','########','########','.######.','........'],
 invader:['..#..#..','...##...','..####..','.##..##.','########','#.####.#','#.#..#.#','...##...']};
const bit=(k,x,y,off)=>BM[k][y%8][(x+(off?(((y>>3)&1)*4):0))%8]=='#';
/* every kind returns a colour for pixel x,y of a 16 x 16 tile; c = [background, line or shape, accent or light] */
const KIND={
 planks:(x,y,c)=>{const r=y>>2;if(y%4==0||x==(r*5+3)%16)return c[1];return hh((x+r*5)>>3,r,7)<45?c[2]:c[0]},
 herring:(x,y,c)=>{const d=((x>>2)+(y>>2))&1,l=d?x&3:y&3;if(l==0)return c[1];return hh(x>>1,y>>1,3)<30?c[2]:c[0]},
 parquet:(x,y,c)=>{if(x%8==0||y%8==0)return c[1];const s=((x>>3)+(y>>3))&1,i=((s?x:y)&7)>>1;return i&1?c[2]:c[0]},
 tile:(x,y,c)=>x%8==0||y%8==0?c[1]:(x%8==1&&y%8==1?c[2]:c[0]),
 checker:(x,y,c)=>((x>>3)+(y>>3))&1?c[1]:c[0],
 diamondt:(x,y,c)=>{const a=Math.abs(x%8-3.5)+Math.abs(y%8-3.5);return a<1.6?c[2]:a<4?c[0]:c[1]},
 concrete:(x,y,c)=>{const h=hh(x,y,1);return h<8?c[1]:h<15?c[2]:c[0]},
 marble:(x,y,c)=>{const d=(x*2+y*3+hh(x>>2,y>>2,3)%3)%19;if(d<1)return c[1];return (x+y*2)%23==5||hh(x,y,9)<3?c[2]:c[0]},
 carpet:(x,y,c)=>{const h=hh(x,y,5);return h<30?c[2]:h<36?c[1]:c[0]},
 neon:(x,y,c)=>x%8==0&&y%8==0?c[2]:x%8==0||y%8==0?c[1]:c[0],
 stripe:(x,y,c)=>x%8<4?c[0]:c[1],
 pin:(x,y,c)=>x%8==0?c[1]:x%8==4?c[2]:c[0],
 check:(x,y,c)=>((x>>2)+(y>>2))&1?c[1]:c[0],
 dots:(x,y,c)=>(((x+(((y>>3)&1)*4))%8)<2&&y%8<2)?c[1]:c[0],
 diamond:(x,y,c)=>{const a=Math.abs(x%8-3.5)+Math.abs(y%8-3.5);return a<=2?c[1]:a<=3?c[2]:c[0]},
 brick:(x,y,c)=>{if(y%4==3)return c[1];if((x+((y>>2)&1)*4)%8==7)return c[1];return hh(x>>2,y>>2,2)<25?c[2]:c[0]},
 plaid:(x,y,c)=>{const v=x%8<2,h=y%8<2;return v&&h?c[2]:v||h?c[1]:c[0]},
 wave:(x,y,c)=>{const r=Math.round(2+1.6*Math.sin(x*Math.PI/4)),m=y%8;return m==r||m==r+1?c[1]:c[0]},
 zig:(x,y,c)=>(y+(x%8<4?x%8:7-x%8))%8<2?c[1]:c[0],
 grid:(x,y,c)=>x%8==0&&y%8==0?c[2]:x%8==0||y%8==0?c[1]:c[0],
 scallop:(x,y,c)=>{const d=Math.hypot(x%8-3.5,(y%8)-1);return d<3.6?c[1]:d<4.6?c[2]:c[0]}};
['heart','star','note','leaf','cloud','invader'].forEach(k=>KIND[k]=(x,y,c)=>bit(k,x,y,1)?c[1]:c[0]);

/* [id, name, price, kind, colours, tile size in metres, search words] */
const FLOORS=[
 ['fl_oak','Oak plank floor',360,'planks',['#b98b57','#8a6238','#c79d68'],1.5,'wood hardwood boards'],
 ['fl_walnut','Walnut plank floor',420,'planks',['#6b4a2e','#4a3020','#7d5a3a'],1.5,'wood dark hardwood'],
 ['fl_birch','Birch plank floor',360,'planks',['#e0c79a','#bfa070','#ecd8b0'],1.5,'wood light pale hardwood'],
 ['fl_ebony','Ebony plank floor',480,'planks',['#2e2926','#1a1715','#3c3632'],1.5,'wood black dark'],
 ['fl_wash','Grey-wash plank floor',380,'planks',['#9a9a94','#74746e','#aeaea8'],1.5,'wood grey gray scandi'],
 ['fl_bamboo','Bamboo plank floor',400,'planks',['#cdb36a','#9c8444','#dcc784'],1.5,'wood green eco'],
 ['fl_herr','Oak herringbone floor',720,'herring',['#b98b57','#7d5a34','#cfa26c'],1.5,'wood zigzag parquet'],
 ['fl_herrw','Walnut herringbone floor',760,'herring',['#6b4a2e','#3e2a1a','#835c3a'],1.5,'wood zigzag parquet dark'],
 ['fl_parq','Cherry parquet floor',640,'parquet',['#a0522d','#6a3418','#b8683e'],1.6,'wood squares red'],
 ['fl_tilew','White tile floor',420,'tile',['#eceae4','#b9b6ae','#ffffff'],1.2,'tiles ceramic kitchen bathroom'],
 ['fl_check','Black and white checker floor',460,'checker',['#f2f0ea','#1c1c20','#888888'],1.2,'tiles diner chess chequered'],
 ['fl_terra','Terracotta tile floor',440,'tile',['#c46a3c','#8f4524','#d7835a'],1.2,'tiles orange clay'],
 ['fl_slate','Slate tile floor',480,'tile',['#5d6a76','#3a444e','#7a8793'],1.2,'tiles stone grey blue'],
 ['fl_mint','Mint tile floor',440,'tile',['#a8d8c4','#78a896','#cdeede'],1.2,'tiles green retro'],
 ['fl_navy','Navy diamond tile floor',520,'diamondt',['#2f4a7a','#e8e4dc','#e6b422'],1.2,'tiles blue gold pattern'],
 ['fl_conc','Light concrete floor',320,'concrete',['#b6b6b2','#8e8e8a','#cacac6'],2,'cement industrial grey'],
 ['fl_concd','Dark concrete floor',340,'concrete',['#5a5c60','#3c3e42','#6c6e72'],2,'cement industrial polished'],
 ['fl_marw','White marble floor',880,'marble',['#ecebe8','#a9adb8','#f8f8f6'],2,'stone luxury'],
 ['fl_marb','Black marble floor',920,'marble',['#26262c','#c9a85a','#3a3a42'],2,'stone luxury gold'],
 ['fl_carg','Grey carpet',300,'carpet',['#8a8d92','#6f7277','#9ea1a6'],1.2,'soft rug cosy'],
 ['fl_carn','Navy carpet',320,'carpet',['#2c3f66','#1f2e4d','#3a5080'],1.2,'soft rug cosy blue'],
 ['fl_carr','Burgundy carpet',320,'carpet',['#7a2a3a','#5a1c2a','#8f3a4c'],1.2,'soft rug cosy red'],
 ['fl_carf','Forest carpet',320,'carpet',['#2e6b4f','#1f4a36','#3e805f'],1.2,'soft rug cosy green'],
 ['fl_carc','Cream carpet',300,'carpet',['#e4d9c0','#c8bb9c','#f0e8d4'],1.2,'soft rug cosy beige'],
 ['fl_carp','Pink carpet',320,'carpet',['#e8a8bc','#c88098','#f4c4d2'],1.2,'soft rug cosy'],
 ['fl_neon','Neon grid floor',560,'neon',['#14121c','#3a2a6a','#ff4fa8'],1.5,'synthwave disco dark']];
const WALLP=[
 ['wp_pinn','Navy pinstripe wallpaper',170,'pin',['#1f3a5f','#8fb0d8','#4a6a98'],'pinstripes lines blue'],
 ['wp_candy','Candy stripe wallpaper',170,'stripe',['#f4b6c8','#fff0f4'],'stripes pink'],
 ['wp_mints','Mint stripe wallpaper',170,'stripe',['#bfe3d0','#f4fff9'],'stripes green'],
 ['wp_sunny','Sunshine stripe wallpaper',170,'stripe',['#ffd166','#fff3c4'],'stripes yellow'],
 ['wp_retro','Retro diamond wallpaper',210,'diamond',['#3a2f5a','#e6b422','#7a5aa8'],'diamonds purple gold'],
 ['wp_sage','Sage polka dot wallpaper',190,'dots',['#cfe0c3','#fffdf2'],'polka dots spots green'],
 ['wp_blued','Blue polka dot wallpaper',190,'dots',['#2f4a7a','#e8f1ff'],'polka dots spots'],
 ['wp_chess','Black and cream checker wallpaper',200,'check',['#1c1c20','#f4f1e8'],'checkerboard chequered'],
 ['wp_brickr','Red brick wallpaper',230,'brick',['#a84a3a','#d9c3a5','#8f3a2c'],'bricks loft'],
 ['wp_brickw','White brick wallpaper',230,'brick',['#e8e4dc','#b8b2a6','#d8d2c6'],'bricks loft'],
 ['wp_night','Starry night wallpaper',220,'star',['#1d2a5a','#ffe066'],'stars space kids'],
 ['wp_heart','Pixel hearts wallpaper',210,'heart',['#f4b6c8','#d63a6a'],'hearts love pink'],
 ['wp_notes','Music notes wallpaper',230,'note',['#1c1c28','#ff4fa8'],'songs studio notes'],
 ['wp_tartan','Tartan wallpaper',220,'plaid',['#2e6b4f','#c0392b','#e6b422'],'plaid check'],
 ['wp_ocean','Ocean waves wallpaper',210,'wave',['#2f7fb5','#bfe6ff'],'sea water blue'],
 ['wp_chev','Zigzag chevron wallpaper',200,'zig',['#e8dcc0','#c4533a'],'zig zag chevrons'],
 ['wp_sky','Cloudy sky wallpaper',210,'cloud',['#9ad0f5','#ffffff'],'clouds sky blue kids'],
 ['wp_jungle','Jungle leaves wallpaper',220,'leaf',['#2e6b4f','#7fc47a'],'plants leaves green'],
 ['wp_graph','Graph paper wallpaper',180,'grid',['#f4f1e8','#9ec4ea','#6a9ad0'],'grid squared maths'],
 ['wp_scal','Scallop wallpaper',200,'scallop',['#d98ca0','#f9dfe6','#c0687e'],'scales pink'],
 ['wp_synth','Synthwave grid wallpaper',240,'grid',['#14121c','#ff4fa8','#3ad0ff'],'neon retro dark'],
 ['wp_alien','Pixel invaders wallpaper',240,'invader',['#14121c','#5cff7a'],'arcade game aliens retro']];
const DC={fl:{},wp:{}};
FLOORS.forEach(a=>DC.fl[a[0]]={id:a[0],n:a[1],p:a[2],k:a[3],c:a[4],T:a[5],w:a[6],cat:'Flooring'});
WALLP.forEach(a=>DC.wp[a[0]]={id:a[0],n:a[1],p:a[2],k:a[3],c:a[4],T:1.5,w:a[5],cat:'Wallpaper'});
const get=id=>DC.fl[id]||DC.wp[id];

/* ---- textures ---- */
function canvasOf(it){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d'),f=KIND[it.k];
 for(let j=0;j<16;j++)for(let i=0;i<16;i++){x.fillStyle=f(i,j,it.c);x.fillRect(i,j,1,1)}return c}
const TX={};
function texOf(it,fresh){if(!fresh&&TX[it.id])return TX[it.id];const t=new THREE.CanvasTexture(canvasOf(it));t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(!fresh)TX[it.id]=t;return t}
const MT={};
const matOf=it=>MT[it.id]||(MT[it.id]=new THREE.MeshLambertMaterial({map:texOf(it)}));
const URLS={};const swatch=it=>URLS[it.id]||(URLS[it.id]=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(canvasOf(it),0,0,64,64);return c.toDataURL()})());
/* a box's six faces carry the pattern at a fixed pixel size: scale each face's uv by its size in metres / tile size */
function boxUV(g,w,h,d,T){const uv=g.attributes.uv,f=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
 for(let i=0;i<24;i++){const q=f[i>>2];uv.setXY(i,uv.getX(i)*q[0]/T,uv.getY(i)*q[1]/T)}uv.needsUpdate=true;return g}

/* ---- owned styles ---- */
const owned=()=>S.dcO||(S.dcO={});
const nOwn=()=>Object.keys(S.dcO||{}).length;
window.buyDecor=function(id){const it=get(id);if(!it)return;if(owned()[id]){snd('pop');return say('You already own '+it.n+'. Press E in any room at home and pick Decorate this room.')}
 if(S.money<it.p)return snd('err');S.money=+(S.money-it.p).toFixed(2);owned()[id]=1;updateVersion();snd('cash');
 say(it.n+' bought. Press E in any room at home and pick Decorate this room.');pcR()};

/* ---- applying to the rooms ---- */
const OV=[],WL=[];
function restore(){OV.splice(0).forEach(m=>{if(m.parent)m.parent.remove(m);m.geometry.dispose()});
 WL.splice(0).forEach(m=>{const u=m.userData;if(u.dcG){m.geometry.dispose();m.geometry=u.dcG;m.material=u.dcM;delete u.dcG;delete u.dcM}})}
const rectMinus=(r,h)=>{const[a,b,c,d]=r,[e,f,g,i]=h;if(g<=a||e>=c||i<=b||f>=d)return[r];const o=[];
 if(e>a)o.push([a,b,e,d]);if(g<c)o.push([g,b,c,d]);const x0=Math.max(a,e),x1=Math.min(c,g);if(f>b)o.push([x0,b,x1,f]);if(i<d)o.push([x0,i,x1,d]);return o};
const groupOf=r=>r[0][0]=='g'?PRHG:r[0][0]=='w'?(typeof WIN!='undefined'?WIN:null):(typeof ANX!='undefined'&&ANX.idx!=null?IG[ANX.idx]:null);
function floorOf(r,it){const G=groupOf(r);if(!G)return;let rects=[[r[2],r[3],r[4],r[5]]];
 if(r[0][0]=='u'&&ANX.W&&ANX.D)rects=rectMinus(rects[0],[900+ANX.W-4.6,320+ANX.D-3.4,900+ANX.W-1.4,320+ANX.D-.8]);
 rects.forEach(q=>{const w=q[2]-q[0],d=q[3]-q[1];if(w<.05||d<.05)return;const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/it.T,uv.getY(i)*d/it.T);
  const m=new THREE.Mesh(g,matOf(it));m.position.set((q[0]+q[2])/2,.004,(q[1]+q[3])/2);m.receiveShadow=true;m.userData.dcFloor=1;G.add(m);OV.push(m)})}
/* each wall belongs to the room on its south or east side (prWalls), but its other face looks into the next room.
   The belonging face gets that room's style and the far face gets the neighbour's, so the walls you see from either
   room show that room's own choice. Faces without a style keep the paint colour. */
function paper(m,front,back,north){const p=m.geometry.parameters;if(!p||m.userData.dcG||(!front&&!back))return;const g=m.geometry.clone();g.parameters=Object.assign({},p);
 const w=p.width*m.scale.x,h=p.height*m.scale.y,d=p.depth*m.scale.z,T=(front||back).T,base=m.material,a=[base,base,base,base,base,base],fi=north?4:0,bi=north?5:1;
 boxUV(g,w,h,d,T);if(front)a[fi]=matOf(front);if(back)a[bi]=matOf(back);
 m.userData.dcG=m.geometry;m.userData.dcM=m.material;m.geometry=g;m.material=a;WL.push(m)}
const isTall=m=>m.geometry.parameters.height*m.scale.y>2;
function apply(){const rf=S.rf||{},rw=S.rw||{},rt=S.rt||{},rooms=PRM.filter(prHas);
 const sty=(r,tall)=>r?DC.wp[(tall?rw:rt)[r[0]]]:null;
 rooms.forEach(r=>{const f=DC.fl[rf[r[0]]];if(f)floorOf(r,f)});
 rooms.forEach(r=>prWalls(r).forEach(m=>{const p=m.geometry.parameters,tall=isTall(m),north=p.depth*m.scale.z<p.width*m.scale.x,
  X=m.position.x+(north?0:-.5),Z=m.position.z+(north?-.5:0),nb=rooms.find(q=>q!==r&&X>=q[2]&&X<q[4]&&Z>=q[3]&&Z<q[5]);
  paper(m,sty(r,tall),sty(nb,tall),north)}))}
{const pr0=prRecolour;prRecolour=function(){restore();const r=pr0.apply(this,arguments);try{apply()}catch(e){console.error('home decor',e)}return r}}
/* a loaded save, a new career or a rebuilt wing changes what the rooms should show */
{let sg='',n=0;const wt=worldTick;worldTick=function(dt){wt(dt);if(++n%15)return;try{const s=JSON.stringify([S.rf,S.rw,S.rt]);if(s!==sg){sg=s;PRSIG=''}}catch(e){}}}
/* painting a room covers its wallpaper */
{const po=paintOk;paintOk=function(){try{const k=PNT&&PNT.k;if(k&&S.tins>0){if(S.rw)delete S.rw[k];if(S.rt)delete S.rt[k]}}catch(e){}return po.apply(this,arguments)}}

/* ---- the Decorate menu: Paint tab is the paint menu of 123 ---- */
let DS=null;
const TABS=[['paint','Paint'],['wall','Wallpaper'],['low','Lower walls'],['floor','Floor']];
const slot=t=>t=='wall'?'rw':t=='low'?'rt':'rf';
function tabsHTML(){return`<div class=dct>${TABS.map(t=>`<button class="${DS.tab==t[0]?'go':''}" onclick="dcTab('${t[0]}')">${t[1]}</button>`).join('')}</div>`}
window.dcUI=function(r,tab){DS=DS&&DS.r==r?DS:{r,tab:'',all:false};dcTab(tab||DS.tab||(S.tins>0&&!nOwn()?'paint':nOwn()?'wall':'paint'))};
window.dcTab=function(t){const r=DS.r;DS.tab=t;mode='menu';
 if(t=='paint'){restore();PNT=null;if(S.tins>0){paintUI(r);const b=$('ui').querySelector('.pnt');if(b)b.insertAdjacentHTML('afterbegin',tabsHTML())}
  else $('ui').innerHTML=`<div class="box modal pnt" style="top:auto;bottom:12px;transform:translateX(-50%);width:min(520px,94vw)">${tabsHTML()}<h3 style="margin:0 0 6px">Paint the ${r[1].toLowerCase()}</h3><p class=m>You have no paint tins. Buy paint on Amazoom (search paint).</p><div class=row2><button class=go onclick="dcDone()">Done</button></div></div>`;return}
 if(PNT){PNT=null;PRSIG='';prRecolour()}
 const sl=slot(t),cur=(S[sl]||{})[r[0]],kind=t=='floor'?'fl':'wp',list=Object.keys(owned()).filter(id=>DC[kind][id]),nm=t=='floor'?'floor':t=='low'?'lower walls':'walls';
 $('ui').innerHTML=`<div class="box modal pnt" style="top:auto;bottom:12px;transform:translateX(-50%);width:min(560px,94vw)">${tabsHTML()}<h3 style="margin:0 0 6px">${r[1]}: ${nm}</h3>
 ${list.length?`<div class=dcs><i class="${cur?'':'on'}" title="${t=='floor'?'Original floor':'Plain (paint colour)'}" onclick="dcPick('')" style="background:#0006;display:flex;align-items:center;justify-content:center;font:11px Arial;color:#fff;text-align:center">${t=='floor'?'Original':'Plain'}</i>${list.map(id=>`<i class="${cur==id?'on':''}" title="${esc(DC[kind][id].n)}" style="background-image:url(${swatch(DC[kind][id])})" onclick="dcPick('${id}')"></i>`).join('')}</div>
 <label style="display:block;margin-top:8px"><input type=checkbox style="width:auto;margin-right:6px" ${DS.all?'checked':''} onchange="DS_all(this.checked)">Use it in every room at home</label>`
 :`<p class=m>You do not own any ${t=='floor'?'floor styles':'wallpaper'} yet. Search "${t=='floor'?'floor':'wallpaper'}" on Amazoom (laptop) to buy some.</p>`}
 <div class=row2 style="margin-top:8px"><button class=go onclick="dcDone()">Done</button></div></div>`};
window.DS_all=v=>{DS.all=!!v};
window.dcPick=function(id){const sl=slot(DS.tab),rooms=DS.all?PRM.filter(prHas):[DS.r];const o=S[sl]||(S[sl]={});
 rooms.forEach(r=>{if(id)o[r[0]]=id;else delete o[r[0]]});PRSIG='';updateVersion();snd('pop');prRecolour();dcTab(DS.tab)};
window.dcDone=function(){PNT=null;PRSIG='';DS=null;closeUI()};
{const di=dynInt;dynInt=function(){const a=di.apply(this,arguments);try{if(mode=='play'&&(S.tins>0||nOwn()>0)){const i=a.findIndex(e=>/^Paint this room/.test(e.l));if(i>=0)a.splice(i,1);
 const r=prRoomAt(P.x,P.z);if(r)a.push({x:P.x+1.45,z:P.z,r:1.5,l:'Decorate this room',a:()=>dcUI(r)})}}catch(e){}return a}}
{const st=document.createElement('style');st.textContent='.dct{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}.dct button{flex:1;min-width:70px}.dcs{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;max-height:34vh;overflow:auto}.dcs i{aspect-ratio:1;border:2px solid #000;cursor:pointer;min-height:36px;background-size:cover;image-rendering:pixelated}.dcs i.on{outline:3px solid #2fe68a;outline-offset:1px}@media(max-width:520px){.dcs{grid-template-columns:repeat(5,1fr)}}.azhero{background:#232f3e;color:#fff;padding:10px 16px;font:14px Arial,sans-serif}.azhero b{font-size:18px;color:#febd69;display:block}';document.head.appendChild(st)}

/* ---- shop pictures: key d:<id> is a floor slab or a wall panel, spun like the furniture ---- */
{const pm=pvModel;pvModel=function(k){if(typeof k!='string'||k.slice(0,2)!='d:')return pm.apply(this,arguments);if(PVM[k])return PVM[k];
 const it=get(k.slice(2)),w=new THREE.Group(),g=new THREE.Group();if(!it)return PVM[k]=w;
 const fl=it.cat=='Flooring',W=2,H=fl?.16:2,D=fl?2:.16,m=new THREE.Mesh(boxUV(new THREE.BoxGeometry(W,H,D),W,H,D,it.T),new THREE.MeshLambertMaterial({map:texOf(it,1)}));
 m.position.y=H/2;g.add(m);if(!fl){/* a dark frame behind the panel so pale patterns stay visible on the white card */const fr=new THREE.Mesh(new THREE.BoxGeometry(W+.2,H+.2,.12),new THREE.MeshLambertMaterial({color:'#4a4f55'}));fr.position.set(0,H/2,-.12);g.add(fr);const sk=new THREE.Mesh(new THREE.BoxGeometry(W,.3,.24),new THREE.MeshLambertMaterial({color:'#8a6238'}));sk.position.set(0,.15,.03);g.add(sk)}const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),z=bb.getSize(new THREE.Vector3());
 g.position.sub(c);w.add(g);w.scale.setScalar(1.6/Math.max(z.x,z.y,z.z));return PVM[k]=w}}

/* ---- Amazoom cards (264 adds them to the page) ---- */
const BEST={fl_oak:'Best Seller',fl_check:'Best Seller',fl_carg:"Amazoom's Choice",fl_marw:'New',fl_neon:'New',wp_candy:'Best Seller',wp_notes:'Best Seller',wp_alien:'New',wp_brickr:"Amazoom's Choice"};
window.HDEC={DC,items(){const hs2=typeof hs=='function'?hs:(s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)>>>0);
 return Object.keys(DC.fl).concat(Object.keys(DC.wp)).map(id=>{const it=get(id),h=hs2(id),fl=it.cat=='Flooring',own=!!(S.dcO&&S.dcO[id]);
  return{k:'d:'+id,t:((typeof BR!='undefined'&&BR[h%BR.length])||'Glowby')+' '+it.n,sub:(fl?'Flooring for any room. ':'Pixel wallpaper for the walls or the lower walls. ')+it.w,r:(4.1+(h%9)/10).toFixed(1),rc:(300+h%4000).toLocaleString(),
   bought:['100+','200+','500+','1K+'][h%4],rrp:h%3==0?Math.round(it.p*1.2):0,bd:BEST[id]||'',cat:it.cat,p:it.p,act:own?"snd('pop');say('You own this. Press E in a room at home and pick Decorate this room.')":`buyDecor('${id}')`,btn:own?'Owned':'Add to basket'}})}};
})();
