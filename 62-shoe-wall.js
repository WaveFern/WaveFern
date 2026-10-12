/* ---------- Threadz shoe wall: Timberland boots and 18 more shoes ----------
   Appended to GAR after the mega drop (older ids never change). Shoe styles 8-27 are drawn by XNEW.sh on each leg pivot
   (the plain base shoe is removed by the new-drop wrapper), with logos as canvas prints from 60-threadz-prints.js.
   Timberland is the real boot; every other brand mark here is made up. */
[['Timberland Boots',190,8,'#cf9a48',,'street'],['Black Timbs',190,8,'#1f1f22',,'street'],['Olive Timbs',190,8,'#5f6b3a',0,'street'],['Timbs Chukka',160,9,'#cf9a48',,'street'],
 ['Uptown Lows',110,10,'#f4f4f4',,'street'],['Canvas Hi-tops',55,11,'#c0392b',,'vintage'],['Flight Highs',220,12,'#c0392b',1,'sport'],['Cloud Runners',140,13,'#3498db',,'sport'],
 ['Logo Slides',35,14,'#111111',,'street'],['Foam Clogs',45,15,'#2ecc71',,'street'],['Combat Boots',160,16,'#111111',0,'stage'],['Puffy Skate Shoes',80,17,'#2c3e50',,'street'],
 ['Oxford Dress Shoes',240,18,'#111111',1,'designer'],['Chunky Dad Sneakers',420,19,'#bdc3c7',2,'designer'],['Platform Stage Boots',520,20,'#9b59b6',2,'stage'],['Knit Sock Sneakers',480,21,'#111111',2,'designer'],
 ['Retro Runners',90,22,'#2f6fb5',,'vintage'],['Velvet Slippers',360,23,'#800020',2,'designer'],['Flip-flops',12,24,'#e67e22',,'street'],['Glow Kicks',180,25,'#40e0d0',1,'stage'],
 ['Rain Boots',65,26,'#f1c40f',,'vintage'],['Tassel Loafers',290,27,'#5a3a22',1,'designer']].forEach(a=>gA3('sh',a));
/* base shoe kind for the colour table and the pixel portraits: 1 boot / high, 0 low */
Object.assign(XSHB,{8:1,9:1,10:0,11:1,12:1,13:0,14:0,15:0,16:1,17:0,18:0,19:0,20:1,21:1,22:0,23:0,24:0,25:0,26:1,27:0});

/* ---- shoe artwork ---- */
XPR.tree={s:[128,128],f:(x,W,H,c)=>{const ink=xlum(c)<.15?'#9a9a9a':dk(c,.5);x.strokeStyle=ink;x.fillStyle=ink;x.lineWidth=7;x.beginPath();x.arc(64,64,56,0,7);x.stroke();x.fillRect(58,60,12,40);
 x.beginPath();x.moveTo(38,104);x.lineTo(90,104);x.lineTo(84,96);x.lineTo(44,96);x.closePath();x.fill();[[64,38,22],[42,52,17],[86,52,17],[50,28,15],[78,28,15],[64,60,15]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill()});xpGrain(x,W,H,.1,2)}};
XPR.novaside={s:[160,64],f:(x,W,H,c)=>{const ink=xlum(c)>.55?'#1d1d22':xlum(c)<.2?'#f4f4f4':'#1d1d22';xpSpark(x,30,32,26,ink);xpT(x,'NOVA',104,34,40,'blk',ink,{mw:104})}};
XPR.novatab={s:[96,48],f:(x,W,H)=>{x.fillStyle='#1d1d22';xpRR(x,4,4,88,40,6);x.fill();xpSpark(x,24,24,14,'#f4f4f4');xpT(x,'NOVA',62,25,20,'blk','#f4f4f4',{mw:50})}};
XPR.wavepatch={s:[96,96],f:(x,W,H)=>{x.fillStyle='#f4f4f4';x.beginPath();x.arc(48,48,44,0,7);x.fill();x.strokeStyle='#1f3a6e';x.lineWidth=5;x.beginPath();x.arc(48,48,38,0,7);x.stroke();
 x.strokeStyle='#2f6fb5';x.lineWidth=6;x.beginPath();x.moveTo(20,56);x.quadraticCurveTo(34,40,48,56);x.quadraticCurveTo(62,72,76,56);x.stroke();xpT(x,'WAVE',48,34,18,'blk','#c0392b',{mw:60})}};
XPR.wings={s:[128,80],f:(x,W,H,c)=>{const ink=xlum(c)>.55?'#1d1d22':'#f4f4f4';x.fillStyle=ink;[-1,1].forEach(s=>{for(let i=0;i<4;i++){x.beginPath();x.ellipse(64+s*(22+i*9),30-i*3,14-i*2,5,s*(.5+i*.15),0,7);x.fill()}});xpStar(x,64,32,15,6,5,ink);xpT(x,'FLIGHT',64,64,18,'blk',ink,{mw:100})}};
XPR.grind={s:[160,80],f:(x,W,H,c)=>{const ink=xpInk(c);x.fillStyle='#ff6a2b';x.beginPath();x.moveTo(14,70);x.quadraticCurveTo(6,40,22,18);x.quadraticCurveTo(26,40,34,34);x.quadraticCurveTo(34,14,46,6);x.quadraticCurveTo(44,34,56,44);x.quadraticCurveTo(62,62,50,70);x.closePath();x.fill();
 x.fillStyle='#ffd27a';x.beginPath();x.moveTo(26,70);x.quadraticCurveTo(22,52,32,44);x.quadraticCurveTo(36,56,44,52);x.quadraticCurveTo(48,64,40,70);x.closePath();x.fill();xpT(x,'GRIND',108,42,34,'blk',ink,{mw:96})}};
XPR.vantaside={s:[160,64],f:(x,W,H,c)=>{const ink=xlum(c)>.55?'#1d1d22':'#f4f1e8';xpT(x,'VANTA',80,30,40,'ser',ink,{mw:140});x.fillStyle=ink;x.fillRect(30,52,100,3)}};
XPR.vantatab={s:[96,48],f:(x,W,H)=>{x.fillStyle='#cdb27a';xpRR(x,4,6,88,36,4);x.fill();xpT(x,'VANTA',48,25,20,'ser','#1d1d22',{mw:76})}};
XPR.knit={s:[64,64],f:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);x.strokeStyle=dk(c,.75);x.lineWidth=1.6;for(let j=0;j<8;j++)for(let i=0;i<8;i++){const px=i*8+4,py=j*8+2;x.beginPath();x.moveTo(px-3,py);x.lineTo(px,py+5);x.lineTo(px+3,py);x.stroke()}x.fillStyle=xlt(c,.18);for(let j=0;j<8;j++)x.fillRect(0,j*8,W,1)}};
XPR.retrow={s:[128,64],f:(x,W,H,c)=>{const ink=xlum(c)>.55?'#1f3a6e':'#f4f4f4';x.strokeStyle=ink;x.lineWidth=9;x.lineJoin='round';x.lineCap='round';x.beginPath();x.moveTo(14,16);x.lineTo(36,50);x.lineTo(60,22);x.lineTo(84,50);x.lineTo(114,10);x.stroke()}};
XPR.goldcrest={s:[96,96],f:(x,W,H)=>{x.fillStyle='#e6b422';x.beginPath();x.moveTo(18,70);x.lineTo(14,30);x.lineTo(32,48);x.lineTo(48,20);x.lineTo(64,48);x.lineTo(82,30);x.lineTo(78,70);x.closePath();x.fill();x.fillRect(18,74,60,8);
 [[14,28],[48,18],[82,28]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,5,0,7);x.fill()});x.fillStyle='#c0392b';x.beginPath();x.arc(48,58,6,0,7);x.fill();xpGrain(x,W,H,.15,8)}};
XPR.thzstrap={s:[256,96],f:(x,W,H,c)=>{const ink=xpInk(c);xpT(x,'THREADZ',128,52,66,'blk',ink,{mw:236,st:XTZ,lw:6})}};
XPR.puddle={s:[96,48],f:(x,W,H)=>{x.fillStyle='#1d1d22';xpRR(x,4,6,88,36,8);x.fill();x.strokeStyle='#f4f4f4';x.lineWidth=2;x.stroke();xpT(x,'PUDDLE',48,25,18,'blk','#f4f4f4',{mw:76})}};

/* ---- shoe helpers (leg pivot: ground at y -.5, toes toward +z) ---- */
const xToe=(l,sw,r,y,z,c)=>xc(l,r,r,sw,c,0,y,z,0,0,Math.PI/2,12);
/* laces across the top of a low shoe, n rows from z1 forward */
const xLaceTop=(l,n,y,z1,dz,w,c)=>{for(let i=0;i<n;i++)xb(l,w,.011,.016,c,0,y,z1+i*dz)};
/* laces criss-crossing up the front face of a boot shaft, with eyelets */
const xLaceUp=(l,n,y0,dy,zf,w,c,eye)=>{for(let i=0;i<n;i++){const y=y0+i*dy;[-1,1].forEach(k=>{xb(l,w*1.05,.01,.008,c,0,y+dy*.25,zf+.014,0,0,k*.3);if(eye)xc(l,.012,.012,.012,eye,k*w*.48,y,zf+.002,Math.PI/2,0,0,8)})}};
/* lug teeth along both sides of a sole */
const xLugs=(l,sw,sd,z0,c,n)=>{for(let i=0;i<n;i++){const zz=z0-sd/2+.03+i*(sd-.06)/(n-1);[-1,1].forEach(k=>xb(l,.012,.024,.035,c,k*(sw/2+.014),-.488,zz))}};
const xSidePrint=(l,s,n,c,w,y,z,sw)=>xprint(l,n,c,w,w*xpAsp(n),s*(sw/2+.004),y,z,s*Math.PI/2);
const xFoot=(l,x,sw,sd,z0)=>xb(l,sw*.8,.05,sd*.82,x.sk,0,-.44,z0);

/* Timberland boots: wheat nubuck, padded leather collar, lug sole, laces through brass eyelets, tree logo on the side */
/* the shaft is a touch wider and deeper than a trouser leg, so trousers tuck in and the collar and laces stay on show */
function xTimb(x,c,tall){const{sw,sd,z0}=shoeDims(x),dd=dk(c,.72),SW=sw+.03,SD=x.d*.8+.03,zs=0,zf=SD/2,top=tall?-.115:-.215,sh=top-(-.36),lc='#d9a441';legEach(x,(l,s)=>{
 xb(l,sw+.024,.05,sd+.03,'#5a3c26',0,-.475,z0+.005);xb(l,sw+.028,.012,sd+.034,'#7a5434',0,-.448,z0+.005);xLugs(l,sw,sd,z0,'#3a2618',6);xb(l,sw*.9,.012,.04,'#3a2618',0,-.49,z0+sd/2+.004);
 xb(l,sw+.01,.11,sd*.78,c,0,-.395,z0-.04);xToe(l,sw+.01,.065,-.405,z0+sd/2-.075,c);xb(l,SW,sh,SD,c,0,-.36+sh/2,zs);xb(l,sw+.016,.006,sd*.78+.006,dd,0,-.38,z0-.04);
 xb(l,SW+.022,.065,SD+.022,'!#4a2c1a',0,top+.02,zs);xb(l,SW+.024,.012,SD+.024,'!#3a2014',0,top+.05,zs);
 xb(l,.008,sh,.008,dd,0,-.36+sh/2,zs-SD/2-.004);xb(l,SW+.004,.006,SD+.004,dd,0,-.36,zs);
 xb(l,SW*.42,sh+.03,.02,c,0,-.36+sh/2+.01,zf+.005);xLaceUp(l,tall?5:3,-.33,.05,zf+.016,SW*.55,lc,'~#b8913a');xt(l,.024,.007,lc,-.03,top+.03,zf+.04);xt(l,.024,.007,lc,.03,top+.03,zf+.04);
 xb(l,.04,.05,.01,'!#4a2c1a',0,top,zs-SD/2-.008);xSidePrint(l,s,'tree',c,.085,tall?-.21:-.29,zs-.04,SW)})}
XNEW.sh[8]=(x,c)=>xTimb(x,c,1);
XNEW.sh[9]=(x,c)=>xTimb(x,c,0);
/* Uptown Lows: chunky white cupsole, leather upper, perforated toe, NOVA spark on the side */
XNEW.sh[10]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),up='!'+c,dd=xtone(c,.8);legEach(x,(l,s)=>{xb(l,sw+.02,.07,sd+.02,'#f4f4f4',0,-.465,z0);xb(l,sw+.024,.006,sd+.024,'#c8c8c8',0,-.448,z0);xb(l,sw+.022,.012,sd+.022,'#d8d8d8',0,-.494,z0);
 xb(l,sw,.085,sd*.82,up,0,-.388,z0-.04);xToe(l,sw,.05,-.395,z0+sd/2-.055,up);for(let i=0;i<3;i++)for(let j=0;j<2;j++)xb(l,.012,.006,.012,dd,(i-1)*.05,-.343,z0+sd/2-.07+j*.03);
 xb(l,sw*.98,.05,sd*.34,up,0,-.325,z0-sd*.31);xb(l,sw+.004,.016,sd*.36,dd,0,-.3,z0-sd*.31);xb(l,sw*.4,.06,.1,up,0,-.315,z0+.02);xprint(l,'novatab',c,.06,.03,0,-.305,z0+.0715);
 xLaceTop(l,4,-.343,z0+.08,.025,sw*.55,'#f4f4f4');xSidePrint(l,s,'novaside',c,.19,-.39,z0-.01,sw);xprint(l,'novatab',c,.07,.035,0,-.33,z0-sd/2-.004,Math.PI)})};
/* Canvas Hi-tops: rubber toe cap with ridges, canvas upper, white laces, round ankle patch */
XNEW.sh[11]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),zs=z0-.08,zf=zs+sd*.29;legEach(x,(l,s)=>{xb(l,sw+.016,.06,sd+.016,'#f4f4f4',0,-.47,z0);xb(l,sw+.02,.008,sd+.02,'#1f3a6e',0,-.462,z0);xb(l,sw+.018,.01,sd+.018,'#e8dcc4',0,-.497,z0);
 xb(l,sw,.08,sd*.85,c,0,-.4,z0-.02);xToe(l,sw+.008,.045,-.425,z0+sd/2-.045,'#f4f4f4');for(let i=0;i<3;i++)xb(l,sw*.6,.004,.006,'#c8c8c8',0,-.405+i*.012,z0+sd/2-.002);
 xb(l,sw*.98,.22,sd*.58,c,0,-.26,zs);xb(l,sw+.004,.018,sd*.6,dk(c,.8),0,-.15,zs);xb(l,sw*.4,.24,.016,c,0,-.27,zf+.004);xLaceUp(l,5,-.35,.045,zf+.005,sw*.5,'#f4f4f4','~#d0d0d0');xLaceTop(l,2,-.358,z0+.06,.035,sw*.5,'#f4f4f4');
 xSidePrint(l,s,'wavepatch',c,.09,-.24,zs,sw*.98);xb(l,.04,.12,.01,'#f4f4f4',0,-.37,z0-sd/2-.004)})};
/* Flight Highs: white leather with colour-blocked toe, heel, eyestays and collar, wings on the ankle */
XNEW.sh[12]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),k='!'+c,wh='!#f4f4f4',zs=z0-.08,zf=zs+sd*.29;legEach(x,(l,s)=>{xb(l,sw+.018,.045,sd+.018,'#f4f4f4',0,-.462,z0);xb(l,sw+.02,.016,sd+.02,c,0,-.492,z0);
 xb(l,sw,.085,sd*.85,wh,0,-.397,z0-.02);xToe(l,sw+.004,.048,-.402,z0+sd/2-.05,k);xb(l,sw+.004,.087,.08,k,0,-.397,z0+sd/2-.11);xb(l,sw+.004,.13,.09,k,0,-.375,z0-sd/2+.045);
 xb(l,sw*.98,.2,sd*.58,wh,0,-.26,zs);xb(l,sw+.01,.07,sd*.6+.01,k,0,-.165,zs);[-1,1].forEach(q=>xb(l,.035,.21,.012,k,q*sw*.24,-.26,zf+.003));xb(l,sw*.4,.22,.016,wh,0,-.26,zf+.004);
 xLaceUp(l,5,-.34,.045,zf+.006,sw*.48,'#f4f4f4');xSidePrint(l,s,'novaside','#f4f4f4',.17,-.36,z0-.02,sw);xSidePrint(l,s,'wings',c,.11,-.165,zs,sw*.98+.02)})};
/* Cloud Runners: thick foam midsole, knit mesh upper, reflective heel, pull loop */
XNEW.sh[13]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),km=xpSkinMat('knit',c),ac=xlt(c,.45);legEach(x,(l,s)=>{xb(l,sw+.02,.012,sd+.02,'#2a2a2a',0,-.494,z0);xb(l,sw+.024,.06,sd+.024,'#f4f4f4',0,-.458,z0);xb(l,sw+.026,.022,sd*.6,ac,0,-.44,z0-sd*.18);xb(l,sw+.024,.03,sd*.3,'#f4f4f4',0,-.415,z0-sd*.33);
 xb(l,sw,.08,sd*.84,c,0,-.388,z0-.03).material=km;xToe(l,sw,.042,-.39,z0+sd/2-.045,c).material=km;xb(l,sw*.98,.04,sd*.36,c,0,-.33,z0-sd*.3).material=km;
 xb(l,sw*.5,.02,.012,'*#e8f0f4',0,-.37,z0-sd/2-.004);xt(l,.028,.008,ac,0,-.31,z0-sd/2-.01,0,Math.PI/2,0);xLaceTop(l,4,-.347,z0+.02,.03,sw*.5,ac);xSidePrint(l,s,'novaside',xlum(c)>.55?'#f4f4f4':'#111111',.16,-.39,z0-.02,sw)})};
/* Logo Slides: contoured footbed, wide strap with the THREADZ print */
XNEW.sh[14]=(x,c)=>{const{sw,sd,z0}=shoeDims(x);legEach(x,l=>{xb(l,sw,.03,sd,'#2a2a2a',0,-.485,z0);for(let i=0;i<4;i++)xb(l,sw+.004,.004,sd+.004,'#444444',0,-.495+i*.008,z0);xb(l,sw*.94,.018,sd*.94,c,0,-.462,z0);xFoot(l,x,sw,sd,z0);
 xb(l,sw+.016,.09,sd*.3,c,0,-.43,z0+sd*.26);xprint(l,'thzstrap',c,sw*.8,sw*.3,0,-.43,z0+sd*.41+.004);xprint(l,'thzstrap',c,sw*.8,sw*.3,0,-.3845,z0+sd*.3,0,null,-Math.PI/2);xb(l,sw+.018,.008,sd*.3+.004,xtone(c,.75),0,-.473,z0+sd*.26)})};
/* Foam Clogs: rounded body with vent holes, heel strap with rivets and a few charms */
XNEW.sh[15]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),hc=dk(c,.5);legEach(x,(l,s)=>{xb(l,sw+.034,.02,sd*.92,dk(c,.8),0,-.49,z0);xb(l,sw+.03,.1,sd*.8,c,0,-.43,z0-.03);xToe(l,sw+.03,.07,-.43,z0+sd*.36,c);xb(l,sw*.75,.02,sd*.36,x.sk,0,-.375,z0-.07);
 for(let i=0;i<3;i++)for(let j=0;j<2;j++)xc(l,.014,.014,.006,hc,(i-1)*.07,-.36+j*.004,z0+sd*.3+j*.05,0,0,0,8);[-1,1].forEach(q=>xc(l,.011,.011,.006,hc,q*(sw/2+.016),-.42,z0+.05,0,0,Math.PI/2,8));
 xb(l,sw+.05,.03,.02,c,0,-.41,z0-sd/2+.005);[-1,1].forEach(q=>xc(l,.018,.018,.012,dk(c,.7),q*(sw/2+.024),-.41,z0-sd*.36,0,0,Math.PI/2,10));
 xs(l,.02,'!#f1c40f',.05,-.36,z0+sd*.18,8);xs(l,.018,'!#e84393',-.06,-.36,z0+sd*.24,8);xb(l,.03,.03,.012,'!#2f6fb5',0,-.356,z0+sd*.1)})};
/* Combat Boots: tall glossy leather, lug sole with yellow welt stitch, eight eyelets and speed hooks, heel loop */
XNEW.sh[16]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),k='!'+c,zs=z0-.07,zf=zs+sd*.31;legEach(x,(l,s)=>{xb(l,sw+.026,.06,sd+.03,'#1a1a1a',0,-.47,z0+.005);xb(l,sw+.03,.006,sd+.034,'#e6b422',0,-.444,z0+.005);xLugs(l,sw,sd,z0,'#111111',7);
 xb(l,sw,.11,sd*.78,k,0,-.39,z0-.04);xToe(l,sw,.062,-.4,z0+sd/2-.07,k);xb(l,sw*.98,.33,sd*.62,k,0,-.2,zs);xb(l,sw+.016,.04,sd*.64+.016,'!'+dk(c,.8),0,-.03,zs);
 xb(l,sw*.4,.34,.016,k,0,-.2,zf+.004);xLaceUp(l,6,-.34,.045,zf+.005,sw*.5,'#1d1d22','~#c0c0c0');[0,1].forEach(i=>[-1,1].forEach(q=>xb(l,.016,.02,.016,'~#c0c0c0',q*sw*.25,-.06+i*.035,zf+.008)));
 xb(l,.03,.06,.012,'#e6b422',0,-.01,zs-sd*.31-.006);xb(l,.012,.3,.008,'~#c0c0c0',s*(sw*.49+.004),-.22,zs-.03)})};
/* Puffy Skate Shoes: gum sole, fat padded tongue and collar, thick laces, flame logo */
XNEW.sh[17]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),w2=sw+.03,pd=xlt(c,.15);legEach(x,(l,s)=>{xb(l,w2+.016,.055,sd+.02,'#c49a6c',0,-.472,z0);xb(l,w2+.02,.01,sd+.024,'#f4f4f4',0,-.452,z0);
 xb(l,w2,.09,sd*.84,c,0,-.4,z0-.03);xToe(l,w2,.05,-.4,z0+sd/2-.05,c);xb(l,w2+.012,.07,sd*.4,pd,0,-.335,z0-sd*.28);xc(l,.035,.035,w2+.012,pd,0,-.3,z0-sd*.18,0,0,Math.PI/2,10);
 xb(l,sw*.55,.15,.05,pd,0,-.3,z0+.04,-.35,0,0);xprint(l,'grind',c,.09,.045,0,-.27,z0+.071,0,null,-.35);xLaceTop(l,4,-.352,z0+.075,.03,sw*.6,'#f4f4f4');xSidePrint(l,s,'grind',c,.16,-.4,z0-.02,w2)})};
/* Oxford Dress Shoes: glossy leather, toe cap with brogue holes, slim sole and stacked heel */
XNEW.sh[18]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),k='!'+c,s2=sw*.9;legEach(x,(l,s)=>{xb(l,s2+.012,.02,sd+.02,'#5a3a22',0,-.49,z0+.01);xb(l,s2+.012,.035,.1,'#2a1a10',0,-.48,z0-sd/2+.06);
 xb(l,s2,.07,sd*.84,k,0,-.445,z0-.02);xToe(l,s2,.035,-.445,z0+sd/2-.035,k);xb(l,s2+.004,.072,.006,dk(c,.6),0,-.445,z0+sd/2-.09);for(let i=0;i<5;i++)xb(l,.008,.006,.008,dk(c,.5),(i-2)*.045,-.408,z0+sd/2-.098);
 xb(l,s2*.45,.012,.12,'#1a1a1a',0,-.408,z0+.0);xLaceTop(l,3,-.404,z0-.03,.03,s2*.5,'#1a1a1a');xb(l,s2+.004,.012,sd*.3,dk(c,.7),0,-.405,z0-sd*.3)})};
/* Chunky Dad Sneakers: layered wavy sole, mesh, leather overlays, VANTA logo */
XNEW.sh[19]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),w2=sw+.03;legEach(x,(l,s)=>{xb(l,w2+.02,.04,sd+.04,'#f4f4f4',0,-.48,z0);xb(l,w2+.026,.03,sd*.7,'#bdc3c7',0,-.445,z0-sd*.1);xb(l,w2+.03,.025,sd*.4,c,0,-.42,z0-sd*.22);xb(l,w2+.022,.04,.1,'#f4f4f4',0,-.44,z0+sd/2-.03);
 xb(l,w2,.1,sd*.86,'#d6d9dc',0,-.4,z0-.02);xToe(l,w2,.05,-.405,z0+sd/2-.05,'#f4f4f4');xb(l,w2+.008,.06,sd*.4,c,0,-.41,z0+.04);xb(l,w2+.01,.08,sd*.3,'!#f4f4f4',0,-.38,z0-sd*.3);
 xb(l,w2*.5,.12,.03,'#d6d9dc',0,-.32,z0+.03);xprint(l,'vantatab',c,.08,.04,0,-.31,z0+.046);xLaceTop(l,4,-.348,z0+.07,.03,w2*.55,'#f4f4f4');xSidePrint(l,s,'vantaside','#f4f4f4',.17,-.4,z0-.06,w2+.016)})};
/* Platform Stage Boots: towering platform, sequin shaft, side zip */
XNEW.sh[20]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),sm=xpSkinMat('sequin',c,null,90),zs=z0-.06;legEach(x,(l,s)=>{xb(l,sw+.03,.12,sd+.03,'!#1d1d1f',0,-.44,z0);xb(l,sw+.034,.01,sd+.034,'~#d8d8d8',0,-.38,z0);
 xb(l,sw,.09,sd*.8,c,0,-.33,z0-.03).material=sm;xToe(l,sw,.05,-.335,z0+sd/2-.05,c).material=sm;xb(l,sw*.98,.3,sd*.62,c,0,-.16,zs).material=sm;xb(l,sw+.012,.03,sd*.64,'~#d8d8d8',0,-.005,zs);
 xb(l,.012,.3,.01,'~#e0e0e0',s*(sw*.49+.004),-.16,zs-.04);xb(l,.02,.03,.012,'~#e0e0e0',s*(sw*.49+.008),-.03,zs-.04)})};
/* Knit Sock Sneakers: chunky grooved sole, knit sock upper up the ankle, VANTA on the collar */
XNEW.sh[21]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),km=xpSkinMat('knit',c),zs=z0-.07;legEach(x,(l,s)=>{xb(l,sw+.024,.075,sd+.02,'#f4f4f4',0,-.462,z0);for(let i=0;i<5;i++)xb(l,sw+.028,.004,sd*.2,'#c8c8c8',0,-.47,z0-sd*.35+i*sd*.18);
 xb(l,sw,.08,sd*.84,c,0,-.385,z0-.03).material=km;xToe(l,sw,.045,-.385,z0+sd/2-.045,c).material=km;xb(l,sw*.88,.22,sd*.52,c,0,-.24,zs).material=km;xb(l,sw*.9,.03,sd*.54,dk(c,.8),0,-.13,zs);
 xSidePrint(l,s,'vantaside',c,.12,-.22,zs,sw*.88)})};
/* Retro Runners: suede and nylon, gum sole, wedge heel, wing W on the side */
XNEW.sh[22]=(x,c)=>{const{sw,sd,z0}=shoeDims(x);legEach(x,(l,s)=>{xb(l,sw+.016,.02,sd+.016,'#b98a5a',0,-.49,z0);xb(l,sw+.014,.035,sd*.9,'#f4f4f4',0,-.462,z0-.01);xb(l,sw+.014,.03,sd*.35,'#f4f4f4',0,-.43,z0-sd*.32);
 xb(l,sw,.08,sd*.84,'#d6d9dc',0,-.405,z0-.02);xToe(l,sw+.004,.042,-.41,z0+sd/2-.042,c);xb(l,sw+.004,.082,.1,c,0,-.405,z0+sd/2-.1);xb(l,sw+.004,.1,.09,c,0,-.39,z0-sd/2+.05);xb(l,sw*.4,.06,.04,c,0,-.35,z0+.02);
 xLaceTop(l,4,-.363,z0+.04,.025,sw*.5,'#f4f4f4');xSidePrint(l,s,'retrow',c,.14,-.405,z0,sw+.008)})};
/* Velvet Slippers: velvet upper with a gold embroidered crest, gold piping, thin sole */
XNEW.sh[23]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),s2=sw*.94;legEach(x,l=>{xb(l,s2+.01,.02,sd+.01,'#2a1a10',0,-.49,z0);xb(l,s2+.01,.03,.08,'#2a1a10',0,-.475,z0-sd/2+.05);xb(l,s2,.06,sd*.86,c,0,-.45,z0-.01);xToe(l,s2,.032,-.455,z0+sd/2-.032,c);
 xb(l,s2*.8,.012,sd*.42,x.sk,0,-.418,z0-.08);xb(l,s2+.004,.008,sd*.5,'~#d4af37',0,-.418,z0-.08);xprint(l,'goldcrest',c,.08,.08,0,-.4185,z0+sd*.36,0,null,-Math.PI/2)})};
/* Flip-flops: two-layer sole, Y strap with toe post */
XNEW.sh[24]=(x,c)=>{const{sw,sd,z0}=shoeDims(x);legEach(x,l=>{xb(l,sw,.02,sd,c,0,-.49,z0);xb(l,sw*.96,.012,sd*.96,xlt(c,.35),0,-.475,z0);xFoot(l,x,sw,sd,z0);
 [-1,1].forEach(q=>xb(l,.02,.015,sd*.36,xtone(c,.7),q*sw*.25,-.41,z0+sd*.14,0,q*.55,0));xb(l,.02,.03,.02,xtone(c,.7),0,-.43,z0+sd*.3)})};
/* Glow Kicks: light-up soles and laces that glow in the dark */
XNEW.sh[25]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),gl='*'+c;legEach(x,(l,s)=>{xb(l,sw+.02,.015,sd+.02,'#1d1d1f',0,-.493,z0);xb(l,sw+.024,.03,sd+.024,gl,0,-.47,z0);xb(l,sw+.02,.015,sd+.02,'#f4f4f4',0,-.448,z0);
 xb(l,sw,.085,sd*.84,'!#1d1d1f',0,-.398,z0-.02);xToe(l,sw,.045,-.4,z0+sd/2-.045,'!#1d1d1f');xb(l,sw*.98,.05,sd*.36,'!#1d1d1f',0,-.33,z0-sd*.3);xLaceTop(l,4,-.354,z0+.04,.03,sw*.55,gl);xSidePrint(l,s,'novaside','#111111',.16,-.4,z0-.02,sw)})};
/* Rain Boots: tall glossy rubber, tread, pull tabs and a badge */
XNEW.sh[26]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),k='!'+c,zs=z0-.06;legEach(x,(l,s)=>{xb(l,sw+.02,.03,sd+.02,'!'+dk(c,.6),0,-.485,z0);xLugs(l,sw,sd,z0,dk(c,.45),5);xb(l,sw+.004,.1,sd*.8,k,0,-.42,z0-.03);xToe(l,sw+.004,.055,-.42,z0+sd/2-.055,k);
 xb(l,sw*1.02,.36,sd*.66,k,0,-.21,zs);xb(l,sw*1.04,.02,sd*.68,'!'+dk(c,.8),0,-.035,zs);[-1,1].forEach(q=>xb(l,.012,.05,.04,k,q*(sw*.51+.006),-.02,zs));xprint(l,'puddle',c,.09,.045,0,-.2,zs+sd*.33+.002)})};
/* Tassel Loafers: glossy leather, raised apron seam, strap and tassels */
XNEW.sh[27]=(x,c)=>{const{sw,sd,z0}=shoeDims(x),k='!'+c,s2=sw*.92,dd='!'+dk(c,.7);legEach(x,l=>{xb(l,s2+.012,.02,sd+.02,'#3a2416',0,-.49,z0+.01);xb(l,s2+.012,.035,.1,'#2a1a10',0,-.48,z0-sd/2+.06);
 xb(l,s2,.075,sd*.84,k,0,-.44,z0-.02);xToe(l,s2,.036,-.443,z0+sd/2-.036,k);xb(l,s2*.7,.012,sd*.34,dd,0,-.4,z0+sd*.16);xb(l,s2*.7+.01,.008,.012,dd,0,-.4,z0+sd*.33);xb(l,s2+.004,.02,.03,dd,0,-.405,z0-.0);
 [-1,1].forEach(q=>{xb(l,.012,.05,.012,k,q*.03,-.43,z0+.03);xb(l,.022,.02,.02,'~#d4af37',q*.03,-.46,z0+.03)});xb(l,s2*.8,.012,sd*.2,x.sk,0,-.401,z0-sd*.22)})};

/* ---- shop and wardrobe previews for the shoe wall (a pair, right shoe shows its side print) ---- */
{const clb4=clb;clb=function(k){const[id,col]=String(k).split('|'),g=GM[id];if(!g||g.slot!='sh'||g.st<8)return clb4(k);try{const L=xclbS(g.st,col||g.dc);if(L&&L.length)return L}catch(e){console.warn('preview',e)}return clb4(k)}}
function xclbS(st,c){const a=[],P=(...q)=>a.push(q),side=(n,col,x,y,w,z)=>a.push([.01,w*xpAsp(n),w,'none',x,y,z||0,{p:n,col,f:'x'}]),sk=SKIN[2];
 [-1,1].forEach(s=>{const x=s*.25,R=s>0;
  if(st==8||st==9){const t=st==8,h=t?.5:.32;P(.44,.07,.7,'#5a3c26',x,.035,.05);P(.45,.015,.71,'#7a5434',x,.075,.05);P(.4,.16,.62,c,x,.15,.06);P(.39,h,.42,c,x,.07+h/2,-.06);P(.43,.08,.46,'#4a2c1a',x,.07+h,-.06);P(.16,h-.04,.02,c,x,.07+h/2,.155);
   for(let i=0;i<(t?5:3);i++){[-1,1].forEach(q=>P(.03,.03,.02,'#b8913a',x+q*.1,.2+i*.07,.165));P(.2,.015,.02,'#d9a441',x,.215+i*.07,.17)}if(R)side('tree',c,x+.201,.07+h*.62,.15,-.06)}
  else if(st==10){P(.44,.1,.69,'#f4f4f4',x,.05,.05);P(.4,.12,.62,c,x,.16,.04);P(.4,.08,.24,c,x,.26,-.15);P(.2,.02,.2,'#f4f4f4',x,.23,.17);if(R){side('novaside',c,x+.205,.15,.28,.03);}}
  else if(st==11){P(.44,.09,.69,'#f4f4f4',x,.045,.05);P(.45,.012,.7,'#1f3a6e',x,.06,.05);P(.42,.07,.12,'#f4f4f4',x,.12,.33);P(.4,.12,.58,c,x,.15,.02);P(.38,.32,.36,c,x,.3,-.08);P(.14,.32,.02,'#f4f4f4',x,.3,.105);if(R)side('wavepatch',c,x+.191,.34,.14,-.08)}
  else if(st==12){P(.44,.06,.69,'#f4f4f4',x,.04,.05);P(.45,.02,.7,c,x,.01,.05);P(.4,.13,.62,'#f4f4f4',x,.135,.04);P(.41,.13,.16,c,x,.135,.28);P(.41,.18,.13,c,x,.15,-.21);P(.38,.3,.36,'#f4f4f4',x,.32,-.08);P(.4,.1,.38,c,x,.5,-.08);
   if(R){side('novaside','#f4f4f4',x+.206,.14,.26,.04);side('wings',c,x+.201,.5,.16,-.08)}}
  else if(st==13){P(.44,.11,.69,'#f4f4f4',x,.055,.05);P(.45,.035,.42,xlt(c,.45),x,.09,-.05);P(.4,.13,.62,c,x,.17,.04,{p:'knit',col:c,f:'all'});P(.4,.06,.22,c,x,.26,-.16,{p:'knit',col:c,f:'all'});if(R)side('novaside',xlum(c)>.55?'#f4f4f4':'#111111',x+.205,.17,.25,.03)}
  else if(st==14){P(.42,.05,.67,'#2a2a2a',x,.025,.05);P(.32,.06,.5,sk,x,.08,.05);P(.45,.1,.26,c,x,.1,.16);a.push([.42,.01,.24,'none',x,.152,.16,{p:'thzstrap',col:c,f:'top'}])}
  else if(st==15){P(.48,.03,.66,dk(c,.8),x,.015,.05);P(.46,.17,.6,c,x,.1,.07);P(.3,.03,.26,sk,x,.19,-.06);[-1,0,1].forEach(q=>P(.05,.01,.05,dk(c,.5),x+q*.1,.19,.24));P(.5,.05,.04,c,x,.15,-.25);P(.04,.04,.04,'#f1c40f',x+.08,.2,.12)}
  else if(st==16){P(.45,.09,.7,'#1a1a1a',x,.045,.05);P(.46,.01,.71,'#e6b422',x,.085,.05);P(.4,.15,.62,c,x,.16,.06);P(.39,.58,.42,c,x,.38,-.06);P(.16,.58,.02,c,x,.38,.155);for(let i=0;i<7;i++)[-1,1].forEach(q=>P(.025,.025,.02,'#c0c0c0',x+q*.09,.17+i*.07,.165))}
  else if(st==17){P(.48,.08,.7,'#c49a6c',x,.04,.05);P(.49,.012,.71,'#f4f4f4',x,.075,.05);P(.46,.14,.62,c,x,.15,.04);P(.47,.11,.3,xlt(c,.15),x,.27,-.14);P(.24,.2,.06,xlt(c,.15),x,.3,.08);if(R)side('grind',c,x+.236,.15,.24,.03)}
  else if(st==18){P(.4,.03,.68,'#5a3a22',x,.015,.06);P(.4,.06,.14,'#2a1a10',x,.04,-.22);P(.36,.1,.62,c,x,.08,.05);P(.37,.102,.012,dk(c,.6),x,.08,.25);P(.16,.012,.18,'#1a1a1a',x,.135,.08)}
  else if(st==19){P(.5,.06,.72,'#f4f4f4',x,.03,.05);P(.51,.05,.5,'#bdc3c7',x,.08,0);P(.52,.04,.3,c,x,.12,-.05);P(.46,.14,.64,'#d6d9dc',x,.17,.04);P(.47,.09,.28,c,x,.15,.12);P(.47,.12,.2,'#f4f4f4',x,.22,-.14);if(R)side('vantaside','#f4f4f4',x+.237,.17,.24,.02)}
  else if(st==20){P(.45,.2,.7,'#1d1d1f',x,.1,.05);P(.46,.015,.71,'#d8d8d8',x,.2,.05);P(.4,.14,.62,c,x,.27,.05,{p:'sequin',col:c,f:'all'});P(.39,.5,.42,c,x,.55,-.06,{p:'sequin',col:c,f:'all'});P(.41,.05,.43,'#d8d8d8',x,.8,-.06)}
  else if(st==21){P(.44,.12,.69,'#f4f4f4',x,.06,.05);P(.4,.13,.62,c,x,.18,.04,{p:'knit',col:c,f:'all'});P(.35,.36,.34,c,x,.35,-.08,{p:'knit',col:c,f:'all'});if(R)side('vantaside',c,x+.176,.42,.18,-.08)}
  else if(st==22){P(.43,.03,.68,'#b98a5a',x,.015,.05);P(.43,.06,.64,'#f4f4f4',x,.06,.04);P(.4,.13,.62,'#d6d9dc',x,.15,.04);P(.41,.13,.16,c,x,.15,.28);P(.41,.16,.14,c,x,.16,-.2);if(R)side('retrow',c,x+.206,.15,.22,.04)}
  else if(st==23){P(.4,.03,.68,'#2a1a10',x,.015,.05);P(.38,.1,.62,c,x,.08,.05);P(.3,.012,.26,sk,x,.135,-.06);a.push([.18,.01,.18,'none',x,.136,.2,{p:'goldcrest',col:c,f:'top'}])}
  else if(st==24){P(.4,.04,.66,c,x,.02,.05);P(.38,.02,.62,xlt(c,.35),x,.05,.05);P(.32,.06,.5,sk,x,.09,.05);P(.04,.05,.24,xtone(c,.7),x-.08,.08,.12);P(.04,.05,.24,xtone(c,.7),x+.08,.08,.12)}
  else if(st==25){P(.44,.03,.69,'#1d1d1f',x,.015,.05);P(.45,.05,.7,c,x,.055,.05);P(.44,.03,.69,'#f4f4f4',x,.095,.05);P(.4,.13,.62,'#1d1d1f',x,.175,.04);P(.2,.02,.22,c,x,.25,.14);if(R)side('novaside','#111111',x+.205,.17,.25,.03)}
  else if(st==26){P(.44,.05,.68,dk(c,.6),x,.025,.05);P(.41,.18,.62,c,x,.14,.05);P(.42,.62,.46,c,x,.5,-.05);P(.43,.04,.47,dk(c,.8),x,.8,-.05);a.push([.16,.08,.01,'none',x,.5,.181,{p:'puddle',col:c}])}
  else{P(.38,.03,.68,'#3a2416',x,.015,.06);P(.38,.06,.14,'#2a1a10',x,.04,-.22);P(.35,.11,.62,c,x,.085,.05);P(.26,.012,.24,dk(c,.7),x,.145,.16);P(.04,.06,.04,'#d4af37',x-.04,.12,.3);P(.04,.06,.04,'#d4af37',x+.04,.12,.3)}});
 return a}
