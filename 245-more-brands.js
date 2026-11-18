/* ===== v55.11.0: 22 more parody brands =====
   Adds Vanz, Tacko Bell, Doritoz, Starbux Coffee, Gator-Aid, Maybe-Lyn, Rad Bull, Netflux, Boze, Pooma, Lulu Lemmon, Razzr Gaming,
   Microsoff, Sonny, Nintenda, North Fake, Fenti Beauty, Envidia, Tezla, Dysun, Ferrali and Rolix to the Brand Deals app.
   Everything is original pixel art in the style of 223-brand-deals.js (64x64 grid, no images fetched). A brand here is a row pushed
   into BRD.brands (id, n, t = fame tier index into BRD.tiers, cat, bg, c, p = logo painter) plus:
   - BRD.hq[id]: the world city of its HQ
   - BRD.hqPlan[id]: the HQ building (225-brand-hq.js reads it), built from five shapes (tower, wide, glass, drum, step)
   - BRD.hqKit.HD[id]: the room style of the HQ interiors (239-brand-hq-rooms.js); the showroom is the generic hall of 240
   - BRD.studios[id]: the photo studio (backdrop with the logo and props chosen by category)
   - BRD.postProducts[id]: three products for the brand's Instagrime ads (241-brand-posts.js)
   - the 3D product used in showrooms borrows the model of a similar older brand (LIKE)
   Loads after 241-brand-posts.js. Nothing is saved: brand ids are only stored inside deals (S.brands.list[].b). The directory, the
   auto-scrolling partner strip and the locked-and-blurred display read BRD.brands, so these show up there by themselves. */
(function(){
'use strict';
const BRD=window.BRD;
if(!BRD||!BRD.brands||!BRD.hq||!BRD.hqPlan||!BRD.studios||!BRD.hqKit||!BRD.hqKit.HD)return;
const D=window.DCITY;
const STAR=(x,cx,cy,r,ri)=>{x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?ri:r;x[i?'lineTo':'moveTo'](cx+Math.cos(a)*q,cy+Math.sin(a)*q)}x.closePath()};
const POLY=(x,pts)=>{x.beginPath();pts.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0],p[1]));x.closePath()};
const TXT=(x,t,cx,cy,font,col,ls)=>{x.font=font;x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';if(ls&&'letterSpacing' in x)x.letterSpacing=ls+'px';x.fillText(t,cx,cy);if('letterSpacing' in x)x.letterSpacing='0px'};
const AB='"Arial Black",Arial,sans-serif';
const LIT=['#ffd890','#ffe7b0','#ffcf80','#bfe0ff','#fff2d0'];

/* ---------- the brands: [id, name, tier, category, logo bg, accent, HQ city, HQ shape, building colour, roof/trim colour, logo painter] ---------- */
const bull=x=>{x.beginPath();x.ellipse(17,46,11,6,0,0,7);x.fill();x.beginPath();x.arc(27,40,4.5,0,7);x.fill();POLY(x,[[26,36],[24,29],[30,35]]);x.fill();x.fillRect(9,50,2.6,8);x.fillRect(22,50,2.6,8)};
const ROWS=[
['vanz','Vanz',0,'sneaker','#16161a','#e32934','syd','wide','#2a2a30','#e32934',x=>{x.fillStyle='#e32934';x.fillRect(6,22,52,20);for(let i=0;i<13;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#f4f4f4':'#16161a';x.fillRect(6+i*4,46+j*4,4,4);x.fillStyle=(i+j)%2?'#16161a':'#f4f4f4';x.fillRect(6+i*4,10+j*4,4,4)}TXT(x,'VANZ',32,32,'italic 900 17px '+AB,'#fff')}],
['tacko','Tacko Bell',0,'fastfood','#5b2a86','#f2c230','mex','wide','#7a3aa8','#f2c230',x=>{x.fillStyle='#f2c230';x.beginPath();x.moveTo(12,44);x.quadraticCurveTo(12,12,32,12);x.quadraticCurveTo(52,12,52,44);x.closePath();x.fill();x.fillRect(8,44,48,6);x.beginPath();x.arc(32,54,4,0,7);x.fill();TXT(x,'T',32,32,'900 20px '+AB,'#5b2a86')}],
['doritoz','Doritoz',0,'snack','#b3131b','#f58a1f','sao','step','#d4202c','#f58a1f',x=>{x.fillStyle='#f58a1f';POLY(x,[[32,6],[59,54],[5,54]]);x.fill();TXT(x,'DZ',32,42,'900 17px '+AB,'#fff')}],
['starbux','Starbux Coffee',0,'coffee','#0b6b3a','#00a862','ams','drum','#e8e2d2','#0b6b3a',x=>{x.fillStyle='#fff';x.beginPath();x.arc(32,32,27,0,7);x.fill();x.fillStyle='#0b6b3a';x.beginPath();x.arc(32,32,23,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(32,32,17,0,7);x.fill();x.fillStyle='#0b6b3a';STAR(x,32,33,13,5.4);x.fill()}],
['gator','Gator-Aid',0,'drink','#f58a1f','#1c5fd4','mia','tower','#e8e2d2','#1c5fd4',x=>{POLY(x,[[39,3],[13,37],[29,37],[21,61],[52,25],[35,25]]);x.fillStyle='#fff';x.fill();x.fillStyle='#1c5fd4';POLY(x,[[38,9],[18,35],[31,35],[25,55],[47,27],[33,27]]);x.fill()}],
['maybelyn','Maybe-Lyn',0,'cosmetics','#16161a','#ff4f9a','mum','glass','#ff4f9a','#16161a',x=>{x.fillStyle='#c9a24b';x.fillRect(24,38,16,20);x.fillStyle='#e8e8e8';x.fillRect(22,31,20,8);x.fillStyle='#ff4f9a';POLY(x,[[26,31],[26,15],[34,8],[38,14],[38,31]]);x.fill();STAR(x,50,14,6,2.4);x.fill();STAR(x,14,22,4,1.6);x.fill()}],
['radbull','Rad Bull',1,'drink','#0f2a6e','#e32934','dxb','tower','#0f2a6e','#e32934',x=>{x.fillStyle='#ffd400';x.beginPath();x.arc(32,26,15,0,7);x.fill();x.fillStyle='#e32934';bull(x);x.save();x.translate(64,0);x.scale(-1,1);bull(x);x.restore()}],
['netflux','Netflux',1,'streaming','#111111','#e5202c','mad','wide','#1a1a1e','#e5202c',x=>{x.fillStyle='#b3131b';x.fillRect(17,8,8,48);x.fillRect(39,8,8,48);x.fillStyle='#e5202c';POLY(x,[[17,8],[25,8],[47,56],[39,56]]);x.fill()}],
['boze','Boze',1,'audio','#16161a','#e8e8e8','man','glass','#2a2a30','#e8e8e8',x=>{x.strokeStyle='#e8e8e8';x.lineWidth=4;x.beginPath();x.arc(32,32,25,0,7);x.stroke();TXT(x,'BOZE',32,32,'900 14px '+AB,'#e8e8e8',1)}],
['pooma','Pooma',1,'sneaker','#f4f4f1','#16161a','bkk','step','#2a2a30','#e8e8e8',x=>{x.strokeStyle='#16161a';x.lineCap='round';x.lineWidth=6;x.beginPath();x.moveTo(10,40);x.quadraticCurveTo(26,20,44,28);x.stroke();x.lineWidth=4;x.beginPath();x.moveTo(44,28);x.lineTo(54,22);x.moveTo(14,42);x.lineTo(8,54);x.moveTo(24,34);x.lineTo(30,50);x.moveTo(42,30);x.lineTo(56,42);x.moveTo(10,40);x.quadraticCurveTo(2,30,10,18);x.stroke();x.fillStyle='#16161a';x.beginPath();x.arc(54,22,5,0,7);x.fill()}],
['lulu','Lulu Lemmon',1,'athleisure','#d4202c','#f2c230','cpt','glass','#d4202c','#f2c230',x=>{x.save();x.translate(32,34);x.rotate(-.5);x.fillStyle='#f2c230';x.beginPath();x.ellipse(0,0,21,14,0,0,7);x.fill();x.beginPath();x.moveTo(-26,0);x.lineTo(-19,-3);x.lineTo(-19,3);x.fill();x.beginPath();x.moveTo(26,0);x.lineTo(19,-3);x.lineTo(19,3);x.fill();x.fillStyle='#fff';x.globalAlpha=.55;x.beginPath();x.ellipse(-6,-5,8,3,0,0,7);x.fill();x.restore();x.fillStyle='#2e9a58';x.beginPath();x.ellipse(44,14,9,4,-.6,0,7);x.fill()}],
['razzr','Razzr Gaming',1,'gaming','#0b0b0b','#44d62c','lag','tower','#15171a','#44d62c',x=>{x.strokeStyle='#44d62c';x.lineWidth=5;x.lineJoin='round';POLY(x,[[32,7],[57,53],[7,53]]);x.stroke();x.fillStyle='#44d62c';POLY(x,[[32,24],[44,46],[20,46]]);x.fill()}],
['microsoff','Microsoff',2,'tech','#f2f2f4','#00a4ef','cai','glass','#2a3a5a','#00a4ef',x=>{[[8,8,'#f25022'],[34,12,'#7fba00'],[8,34,'#00a4ef'],[34,38,'#ffb900']].forEach(q=>{x.fillStyle=q[2];x.fillRect(q[0],q[1],22,22)})}],
['sonny','Sonny',2,'gaming','#1b1b22','#4a7bff','tyo','glass','#1b1b22','#4a7bff',x=>{x.lineWidth=3.5;x.lineJoin='round';x.strokeStyle='#2ac07a';POLY(x,[[20,10],[30,28],[10,28]]);x.stroke();x.strokeStyle='#e8484e';x.beginPath();x.arc(44,20,9,0,7);x.stroke();x.strokeStyle='#4a7bff';x.beginPath();x.moveTo(11,36);x.lineTo(29,54);x.moveTo(29,36);x.lineTo(11,54);x.stroke();x.strokeStyle='#e88ac8';x.strokeRect(35,36,18,18)}],
['nintenda','Nintenda',2,'gaming','#e60012','#ffd400','osa','wide','#e60012','#f4f4f4',x=>{x.fillStyle='#fff';x.beginPath();x.arc(14,32,10,0,7);x.arc(50,32,10,0,7);x.fill();x.fillRect(14,22,36,20);TXT(x,'Nintenda',32,32,'italic 900 10px '+AB,'#e60012')}],
['northfake','North Fake',2,'outdoor','#16161a','#d4202c','tor','step','#3a3d44','#d4202c',x=>{x.fillStyle='#f4f4f4';x.beginPath();x.arc(32,48,27,Math.PI,0);x.closePath();x.fill();x.strokeStyle='#16161a';x.lineWidth=3.5;[-14,0,14].forEach(o=>{x.beginPath();x.moveTo(32+o,48);x.quadraticCurveTo(32+o*.5,30,32+o*.3,22);x.stroke()});x.fillStyle='#d4202c';x.fillRect(5,50,54,6)}],
['fenti','Fenti Beauty',2,'cosmetics','#f3e4d8','#a8553a','mia','drum','#f3e4d8','#a8553a',x=>{TXT(x,'FENTI',32,28,'900 19px Georgia,serif','#16161a');TXT(x,'BEAUTY',32,44,'700 8px Arial,sans-serif','#a8553a',2);x.fillStyle='#a8553a';x.fillRect(12,52,40,2)}],
['envidia','Envidia',3,'tech','#0d0d0d','#76b900','sel','glass','#15171a','#76b900',x=>{x.fillStyle='#76b900';x.beginPath();x.moveTo(3,32);x.quadraticCurveTo(32,4,61,32);x.quadraticCurveTo(32,60,3,32);x.fill();x.fillStyle='#0d0d0d';x.beginPath();x.arc(32,32,12,0,7);x.fill();x.fillStyle='#76b900';x.beginPath();x.arc(32,32,6,0,7);x.fill()}],
['tezla','Tezla',3,'car','#f2f2f4','#cc0000','ber','wide','#e8e8ec','#cc0000',x=>{x.fillStyle='#cc0000';x.beginPath();x.moveTo(6,20);x.quadraticCurveTo(32,5,58,20);x.lineTo(53,26);x.quadraticCurveTo(32,16,11,26);x.closePath();x.fill();x.fillRect(29,24,6,32);x.beginPath();x.moveTo(23,18);x.quadraticCurveTo(32,22,41,18);x.lineTo(41,22);x.quadraticCurveTo(32,27,23,22);x.fill()}],
['dysun','Dysun',3,'tech','#f2f2f4','#6a2bd9','ams','drum','#6a2bd9','#ffd400',x=>{x.strokeStyle='#6a2bd9';x.lineWidth=8;x.beginPath();x.arc(32,32,21,0,7);x.stroke();x.fillStyle='#ffd400';x.beginPath();x.arc(32,32,7,0,7);x.fill();x.strokeStyle='#6a2bd9';x.lineWidth=3;for(let i=0;i<6;i++){const a=i*Math.PI/3;x.beginPath();x.moveTo(32+Math.cos(a)*9,32+Math.sin(a)*9);x.lineTo(32+Math.cos(a)*15,32+Math.sin(a)*15);x.stroke()}}],
['ferrali','Ferrali',4,'car','#f5d400','#d4202c','rom','wide','#d4202c','#16161a',x=>{x.fillStyle='#2ac07a';x.fillRect(12,6,14,5);x.fillStyle='#fff';x.fillRect(26,6,14,5);x.fillStyle='#d4202c';x.fillRect(40,6,14,5);x.strokeStyle='#16161a';x.lineCap='round';x.lineWidth=6;x.beginPath();x.moveTo(20,38);x.lineTo(40,38);x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(38,38);x.lineTo(44,22);x.lineTo(51,20);x.stroke();x.lineWidth=3.5;x.beginPath();x.moveTo(22,38);x.lineTo(15,56);x.moveTo(27,38);x.lineTo(29,56);x.moveTo(38,38);x.lineTo(49,47);x.moveTo(41,38);x.lineTo(54,40);x.moveTo(20,38);x.quadraticCurveTo(8,36,10,24);x.stroke()}],
['rolix','Rolix',4,'luxury','#0a5a32','#c9a24b','par','step','#0a5a32','#c9a24b',x=>{x.fillStyle='#c9a24b';POLY(x,[[12,38],[8,14],[22,26],[32,10],[42,26],[56,14],[52,38]]);x.fill();x.fillRect(12,40,40,6);[[8,14],[32,10],[56,14]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],3,0,7);x.fill()});TXT(x,'ROLIX',32,56,'800 9px Georgia,serif','#c9a24b',1)}]
];

/* ---------- what each brand posts on Instagrime: three products, [name, tagline] ---------- */
const PRODS={
 vanz:[['Old Skool Low','Skate it, wear it, wreck it'],['Slip-On Checker','The checkerboard that never dies'],['Half Cab Pro','Built for the ledge']],
 tacko:[['Crunchy Tacko Supreme','Run for the border, again'],['Nacho Fries Box','Back by popular demand'],['Baja Blast Freeze','Frozen and electric blue']],
 doritoz:[['Nacho Cheesier','Every finger gets orange'],['Cool Ranchero','Cool, loud, shareable'],['Blaze Edition','Hot enough to need milk']],
 starbux:[['Pumpkin Spiced Latte','Back for autumn'],['Cold Foam Cloud','Iced and fluffy'],['Mermaid Frappe','Limited, green and sparkly']],
 gator:[['Gator-Aid Orange Thunder','Fuel for the fourth quarter'],['Gator-Aid Zero Lime','All the sweat, no sugar'],['Frost Glacier Freeze','Cold blue recovery']],
 maybelyn:[['Lash Sensational','Lashes that need their own seat'],['SuperStay Lipstick','Kiss-proof for 24 hours'],['Fit Me Foundation','Your shade, no filter']],
 radbull:[['Rad Bull Original','Gives you wings, mostly'],['Rad Bull Sugarfree','Wings without the crash'],['Summer Edition Mango','Tropical lift-off']],
 netflux:[['Neon Heist, Season 4','Binge it before the weekend'],['Stranger Streets','The finale you waited for'],['Netflux Ad-Free Plan','Stream it without breaks']],
 boze:[['QuietComfort Studio','Silence, but louder'],['Sport Earbuds','Stay in your zone'],['SoundLink Mini','Big room in a small shell']],
 pooma:[['Pooma Speedcat','Low, fast, unmistakable'],['Suede Classic XXI','Same icon, softer step'],['RS-X Retro Run','Chunky and unapologetic']],
 lulu:[['Align Leggings','Second skin, first choice'],['Define Jacket','Zip up for the run'],['Everywhere Belt Bag','Hands free, all day']],
 razzr:[['Razzr BlackSnake V3','Latency is for losers'],['Kraken Headset','Hear them first'],['Huntsman Keyboard','Click faster than thought']],
 microsoff:[['Surfboard Laptop 6','Sleek, fast, Wi-Fi hungry'],['Xbocks Series Z','Power your next game'],['Doors 12','Windows, but cooler']],
 sonny:[['Playstasion 6','Play has no limits'],['Walkperson Headphones','Noise cancelling for the tour bus'],['Bravia Pro TV','The picture is the point']],
 nintenda:[['Switchy 2','Play anywhere, any time'],['Mario Cart Deluxe','Blue shell incoming'],['Zelda Tears of Fern','The adventure continues']],
 northfake:[['Nuptse Puffer','Stay warm, look expedition-ready'],['Base Camp Duffel','Pack for the summit'],['Denali Fleece','Soft as a cloud']],
 fenti:[['Pro Filter Foundation','40 shades, zero excuses'],['Gloss Bomb Universal','One gloss for every lip'],['Match Stix Shimmer','Glow like the main stage']],
 envidia:[['GeForz RTX 6090','Frame rates for days'],['DLSS 5 Update','Smoother. Sharper. Free.'],['Jetson Mini AI Kit','Tiny box, giant brain']],
 tezla:[['Model S Plaid','0 to 60 in a blink'],['Cybertruck 2','Armoured and unapologetic'],['Powerwall Home','Keep the lights on']],
 dysun:[['V15 Detect Vacuum','Dust has nowhere to hide'],['Airwrap Styler','Curls without the heat damage'],['Pure Cool Fan','Bladeless and breezy']],
 ferrali:[['296 GTB Roma','Italian thunder, now in red'],['SF90 Stradale','1000 horses, one pedal'],['Purosangue SUV','Prancing horse, family sized']],
 rolix:[['Submariner Date','Dive deep, look sharp'],['Daytonna Gold','The chronograph everyone wants'],['Datejust 36','Old money, new wrist']]
};
BRD.postProducts=BRD.postProducts||{};Object.assign(BRD.postProducts,PRODS);

/* ---------- the HQ buildings: five shapes, coloured per brand ---------- */
const DIM={tower:[18,16],wide:[30,16],glass:[24,18],drum:[20,20],step:[22,18]};
function plan(st,col,trim){
 return{w:DIM[st][0],d:DIM[st][1],f(c){
  const{x0,x1,zb,zf,mx,w,G,Gw}=c,cz=(zb+zf)/2,G2=c.G;
  const kk=(a,b,y0,y1,za,zb2,cl)=>xgBox(G,b-a,y1-y0,zb2-za,cl,(a+b)/2,(y0+y1)/2,(za+zb2)/2);
  const ws=(xa,xb,ya,yb,nx,ny,cl,z)=>{const pw=(xb-xa)/nx,ph=(yb-ya)/ny;for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)D.quadZ(Gw,xa+i*pw+pw*.18,xa+(i+1)*pw-pw*.18,ya+j*ph+ph*.2,ya+(j+1)*ph-ph*.2,z+.04,Array.isArray(cl)?cl[(i*7+j*3)%cl.length]:cl)};
  const we=(za,zb2,ya,yb,nz,ny,cl,x)=>{const pw=(zb2-za)/nz,ph=(yb-ya)/ny;for(let i=0;i<nz;i++)for(let j=0;j<ny;j++)D.quadX(Gw,za+i*pw+pw*.18,za+(i+1)*pw-pw*.18,ya+j*ph+ph*.2,ya+(j+1)*ph-ph*.2,x+.04,Array.isArray(cl)?cl[(i*5+j*3)%cl.length]:cl)};
  const sign=(bg,fg)=>c.sign(mx-5,mx+5,4.8,7.4,bg,fg,zf+.1);
  let H;
  if(st=='tower'){H=17;kk(x0,x1,0,H,zb,zf,col);kk(x0-.2,x1+.2,H,H+.5,zb-.2,zf+.2,trim);ws(x0+1.2,x1-1.2,8.4,H-1,5,3,LIT,zf);we(zb+1.2,zf-1.2,8.4,H-1,4,3,LIT,x1);ws(x0+1.2,mx-3.4,2,4.6,2,1,LIT,zf);ws(mx+3.4,x1-1.2,2,4.6,2,1,LIT,zf);kk(x0-.1,x1+.1,7.6,8,zb-.1,zf+.1,trim);sign('#16161a','#ffffff')}
  else if(st=='wide'){H=8.4;kk(x0,x1,0,H,zb,zf,col);kk(x0-.3,x1+.3,H,H+.5,zb-.3,zf+.3,trim);ws(x0+1,mx-3.4,1.4,3.8,4,1,LIT,zf);ws(mx+3.4,x1-1,1.4,3.8,4,1,LIT,zf);ws(x0+1,x1-1,7.5,8,10,1,LIT,zf);we(zb+1.5,zf-1.5,2,6,6,1,LIT,x1);kk(x0-.1,x1+.1,4.4,4.6,zb-.1,zf+.1,trim);sign('#16161a','#ffffff')}
  else if(st=='glass'){H=11;kk(x0,x1,0,H,zb,zf,col);kk(x0-.3,x1+.3,H,H+.6,zb-.3,zf+.3,trim);const GL=['#9fd0ec','#bfe0ff','#7fb8d8','#d6ecff'];ws(x0+1,mx-3.4,1.4,H-1,4,4,GL,zf);ws(mx+3.4,x1-1,1.4,H-1,4,4,GL,zf);ws(mx-3.4,mx+3.4,7.8,H-1,2,1,GL,zf);we(zb+1.5,zf-1.5,1.4,H-1,5,4,GL,x1);for(let i=0;i<=4;i++)kk(x0+1+i*((mx-3.4-x0-1)/4)-.12,x0+1+i*((mx-3.4-x0-1)/4)+.12,0,H,zf,zf+.12,trim);sign('#0f1216',trim==='#16161a'?'#ffffff':'#ffffff')}
  else if(st=='drum'){H=12;const r=Math.min(w,zf-zb)/2-1,hz=zb+r+.5;xgPrism(G,r,r,H,16,col,mx,0,hz);[3.4,6.6,9.8].forEach(y=>xgPrism(G,r+.15,r+.15,.35,16,trim,mx,y,hz));xgPrism(G,r+.5,r+.5,.5,16,trim,mx,H,hz);kk(mx-5,mx+5,0,5.4,zf-3.8,zf,col);kk(mx-5.4,mx+5.4,5.4,5.9,zf-4.2,zf+.4,trim);D.quadZ(Gw,mx-6,mx-3.6,1.6,4,zf+.04,LIT[3]);D.quadZ(Gw,mx+3.6,mx+6,1.6,4,zf+.04,LIT[3]);c.sign(mx-4.5,mx+4.5,5.9,8.4,'#16161a','#ffffff',zf+.1);c.ex=[mx-r-.4,mx+r+.4];c.zb2=zb}
  else{H=16;const H1=8,uw=w*.62,ud=(zf-zb)*.62;kk(x0,x1,0,H1,zb,zf,col);kk(x0-.3,x1+.3,H1,H1+.5,zb-.3,zf+.3,trim);kk(mx-uw/2,mx+uw/2,H1+.5,H,zb,zb+ud,col);kk(mx-uw/2-.2,mx+uw/2+.2,H,H+.5,zb-.2,zb+ud+.2,trim);ws(x0+1,mx-3.4,1.6,4.4,3,1,LIT,zf);ws(mx+3.4,x1-1,1.6,4.4,3,1,LIT,zf);ws(mx-uw/2+1,mx+uw/2-1,10,H-1,4,2,LIT,zb+ud);we(zb+1.2,zf-1.2,1.8,H1-1.2,5,1,LIT,x1);sign('#16161a','#ffffff')}
  c.door(mx,3,4,1);return H+.5}}}

/* ---------- interiors: floor, walls and cafe by category; the studio props by category ---------- */
const HDC={fastfood:['checker','panels','diner','cone'],snack:['tile','panels','juice','tube'],coffee:['wood','slats','coffee','globe'],drink:['concrete','panels','bar','tube'],cosmetics:['marble','marble','lounge','chand'],streaming:['carpet','glass','lounge','tube'],gaming:['carpet','glass','lounge','tube'],tech:['concrete','glass','lounge','tube'],audio:['carpet','panels','lounge','tube'],car:['concrete','glass','coffee','cone'],luxury:['marble','marble','lounge','chand'],sneaker:['rubber','panels','juice','tube'],athleisure:['rubber','slats','juice','tube'],outdoor:['wood','slats','coffee','globe']};
const KIND={sneaker:'shoe',drink:'can',snack:'food',fastfood:'food',coffee:'food',cosmetics:'beauty',streaming:'game',gaming:'game',tech:'tech',audio:'audio',car:'car',luxury:'fashion',athleisure:'fashion',outdoor:'fashion'};
const lum=h=>{const n=parseInt(String(h).replace('#','').padEnd(6,'0').slice(0,6),16);return(((n>>16)&255)*.3+((n>>8)&255)*.59+(n&255)*.11)/255};
function props(kind,col,col2){return R=>{const x=R.x0,z=R.z0;
 const base=()=>{R.plant(x+1.4,z+9);R.plant(x+23.6,z+9)};
 switch(kind){
  case'shoe':R.shoe(x+3,z+4,col,col2);R.shoe(x+5.2,z+4,col2,col);R.shoe(x+7.4,z+4,'#f4f4f4',col);R.rack(x+21,z+4.5,[col,col2,'#f4f4f4','#2a2a2a']);R.crate(x+3.4,z+8.6,'#8a6a42');R.crate(x+4.6,z+8.6,'#8a6a42');break;
  case'can':R.fridge(x+3,z+3.6,col);R.fridge(x+5.2,z+3.6,col);R.cans(x+21,z+4,col,col2);R.cans(x+23,z+4,col2,col);R.sofa(x+4,z+8.6,'#1a1a1e');R.neon(x+21,z+8,col,5);break;
  case'food':R.diner(x+5,z+4);R.cans(x+21,z+4,col,col2);R.table(x+22,z+8,'#c8a078',2.6);R.sofa(x+4,z+9,col);base();break;
  case'beauty':R.mirror(x+3,z+4);R.bag(x+6,z+4.4,col);R.shelf(x+21,z+4.5,[col,col2,'#f4f4f4']);R.sofa(x+5,z+9,col);R.plant(x+23.6,z+9);break;
  case'game':R.table(x+3.4,z+4,'#2a2a30',2.6);R.screen(x+3,z+4,col);R.screen(x+4,z+4,col2);R.table(x+7,z+4,'#2a2a30',2.6);R.screen(x+6.6,z+4,col);R.sofa(x+21,z+8.6,'#1a1a1e');R.neon(x+21,z+4,col,5);break;
  case'tech':R.table(x+3.4,z+4,'#c8a078',2.6);R.laptop(x+3,z+4);R.laptop(x+4,z+4);R.table(x+6.8,z+4,'#c8a078',2.6);R.laptop(x+6.4,z+4);R.table(x+22,z+4.4,'#c8a078',2.6);R.laptop(x+21.6,z+4.4);base();break;
  case'audio':R.spk(x+3,z+4);R.spk(x+5.4,z+4);R.spk(x+21,z+4);R.sofa(x+4,z+9,'#1a1a1e');R.neon(x+21,z+8,col,5);break;
  case'car':R.stripes(x+6,z+9,col);R.screen(x+3,z+4,col);R.crate(x+21,z+4,'#2a2a30');R.crate(x+22.2,z+4,'#2a2a30');R.sofa(x+5,z+8,'#1a1a1e');R.neon(x+21,z+8,col,5);break;
  default:R.rack(x+3.4,z+4,[col,col2,'#f4f4f4']);R.rack(x+6.6,z+4,[col2,col,'#2a2a2a']);R.bag(x+21,z+4.4,col);R.frame(x+23,z+3);R.sofa(x+5,z+9,col);R.chandelier(x+13,z+9)}}}

const rows=[];
ROWS.forEach(r=>{const[id,n,t,cat,bg,c,city,shape,col,trim,p]=r;
 if(BRD.brands.some(b=>b.id==id))return;
 BRD.brands.push({id,n,t,cat,bg,c,p});
 BRD.hq[id]=city;
 BRD.hqPlan[id]=plan(shape,col,trim);
 const hc=HDC[cat]||HDC.tech,dark=lum(bg)<.4,ac2=lum(c)>.6?'#16161a':'#f4f4f4';
 BRD.hqKit.HD[id]={fl:dark?'#26292e':'#d8d4cc',ff:hc[0],wl:dark?(lum(bg)<.08?'#15171a':bg):'#f0ece4',ac:c,ac2,ch:c,of:hc[1],cf:hc[2],lamp:hc[3],yr:String(1890+((id.length*37+t*11)%120))};
 BRD.studios[id]={fl:dark?'#2a2c30':'#d8d4cc',wl:dark?bg:'#f0ece4',nc:c,
  bk:(g,W,H)=>{const q=g.createLinearGradient(0,0,0,H);q.addColorStop(0,bg);q.addColorStop(1,dark?'#0b0b0e':'#dcd6c8');g.fillStyle=q;g.fillRect(0,0,W,H);g.fillStyle=c+'33';for(let i=0;i<W;i+=48)g.fillRect(i,0,20,H);const s=Math.min(W,H)*.62;BRD.paint(g,id,W/2-s/2,H*.45-s/2,s)},
  props:props(KIND[cat]||'fashion',c,ac2)};
 rows.push(id)});
/* the directory lists brands from the lowest fame tier up (the older 14 already are) */
BRD.brands.sort((a,b)=>a.t-b.t);

/* showroom product: borrow the 3D model of a similar older brand */
const LIKE={vanz:'converse',tacko:'cocacola',doritoz:'cocacola',starbux:'cocacola',gator:'cocacola',maybelyn:'gucci',radbull:'monster',netflux:'samsung',boze:'beats',pooma:'adidas',lulu:'levis',razzr:'beats',microsoff:'apple',sonny:'beats',nintenda:'samsung',northfake:'levis',fenti:'gucci',envidia:'apple',tezla:'lv',dysun:'apple',ferrali:'lv',rolix:'gucci'};
const pi=BRD.item3d;
if(typeof pi=='function')BRD.item3d=function(id){return pi.call(this,LIKE[id]||id)};
BRD.moreBrands=rows;
})();
