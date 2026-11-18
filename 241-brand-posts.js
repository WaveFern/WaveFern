/* 241-brand-posts.js (v53.8.0): the brands post on Instagrime too.
   Every brand in BRD.brands has an official account (logo avatar) that posts product ads in the feed.
   Each brand has a few products and "launches" the next one every ~10 days: for 4 days after a launch
   its NEW DROP post shows near the top of the feed, plus one rotating ad a day. Nothing here is saved:
   posts are rebuilt from S.day each time the feed is generated, so old saves just work.
   Loaded after 240 (the last brand file) and after 189 (it wraps genFeed). Needs BRD, IGF, UPR, pfp, igxPortrait, postPic, uposts. */
(function(){
'use strict';
/* three products per brand: [name, tagline] */
const PR={
 converse:[['Chuck 70 High','Canvas that outlasts the tour bus'],['Star Platform','Two extra inches, zero apologies'],['One Star Low','Suede, simple, sold out before']],
 monster:[['Monstar Mango Loco','Pure mango chaos in a can'],['Monstar Zero Ultra','All the buzz, none of the sugar'],['Monstar Midnight Edition','For the 3 AM studio session']],
 rayban:[['Wayfarer Classic','Look cool, see cooler'],['Aviator Gold','Pilot approved, stage approved'],['Clubmaster Bam','Retro frames, modern attitude']],
 supreme:[['Box Logo Hoodie','Drops once. Gone in a minute'],['Camp Cap','The cap everyone queues for'],['Skate Deck Series 9','Art you can ride']],
 levis:[['501 Original Jeans','Since forever, still the one'],['Trucker Jacket','Gets better every wash'],['Sherpa Denim','Warm denim for cold cities']],
 beats:[['Studio Pro Headphones','Hear every layer of your mix'],['Flex Earbuds','Pocket sized bass'],['Pill Speaker','Party in your pocket']],
 pepsi:[['Pepzi Cherry','New flavour, same fizz'],['Pepzi Max Zero','Zero sugar, full taste'],['Pepzi Vanilla Float','Dessert in a can']],
 adidas:[['Adadas Samba OG','The terrace classic is back'],['UltraRun 5','Cloud soft, built for 10k'],['Tracksuit Heritage','Three stripes, one legend']],
 cocacola:[['Koka-Cola Zero Cherry','Taste the new feeling'],['Koka Winter Bottle','Limited glass, limited time'],['Koka Mini Cans','Small can, big smile']],
 samsung:[['Galaxie S Ultra','The camera that sees in the dark'],['Galaxie Buds Live','Wire-free, worry-free'],['Galaxie Fold Z','Two screens, one pocket']],
 nike:[['Nyke Air Max 1','Air under every step'],['Dunk Low Panda','The one everyone wants'],['Tech Fleece Set','Built for the cold']],
 gucci:[['Guchi Marmont Bag','Gold hardware, quiet flex'],['Guchi Horsebit Loafer','Walk into the room'],['Guchi Green Stripe Belt','The detail that matters']],
 apple:[['Appel Phone 20 Pro','Our best camera, ever'],['Appel Pods Max','Spatial audio for your mix'],['Appel Book Air','Thin, light, runs all day']],
 lv:[['Lewis Vitton Speedy 30','The icon, in new colours'],['Lewis Vitton Trunk','Travel like a legend'],['Lewis Vitton Sneaker','Luxury you can run in']]};
BRD.postProducts=PR; /* v55.11.0: 245-more-brands.js adds its brands' products here */
const P=10,WIN=4; /* launch every P days (shifted per brand), new for WIN days */
const hdl=b=>b.n.toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'')+'.official';
const prods=b=>PR[b.id]||[[b.n+' Classic','Now in stores'],[b.n+' Limited','Limited drop'],[b.n+' Essentials','Everyday favourites']];
const idx=b=>BRD.brands.indexOf(b);
/* which product is live for a brand on a day, and how many days since its launch */
function cur(b,day){const i=idx(b),sh=(i*3)%P,n=Math.floor((day+sh)/P);return{pi:((n%3)+3)%3,age:(day+sh)%P}}
const fol=b=>Math.round(2.5e6*(1+b.t*2.2)+idx(b)*3e5);
function mk(b,day,pi,launch,k){const pr=prods(b)[pi],i=idx(b);
 const cap=launch?['NEW DROP: '+pr[0]+' is out now. '+pr[1]+'. Link in bio.','JUST LANDED: '+pr[0]+'. '+pr[1]+'. Tap to shop.','It is here. '+pr[0]+'. '+pr[1]+'.'][(day+i)%3]
  :[pr[0]+'. '+pr[1]+'.','Spotted in the wild: '+pr[0]+'. '+pr[1]+'.','Have you tried '+pr[0]+' yet? '+pr[1]+'.','Paid partnership. '+pr[0]+': '+pr[1]+'.'][(day*2+i+k)%4];
 return{id:4e7+i*1e6+(day%1000)*10+k,u:hdl(b),cap,kind:'brand',l:Math.round(fol(b)*(.006+((day*7+i*13+k*5)%9)/1000)),cfg:{brandLogo:b.id},cfg2:null,inf:1,brandAd:b.id,prod:pi,launch:launch?1:0}}
function todays(){const day=S.day||0,L=[],R=[];
 BRD.brands.forEach((b,i)=>{const c=cur(b,day);if(c.age<WIN)L.push(mk(b,day,c.pi,1,0))});
 /* one rotating regular ad: a brand whose launch is not on, showing its current product */
 const rot=BRD.brands.filter(b=>cur(b,day).age>=WIN);if(rot.length){const b=rot[(day*5)%rot.length];R.push(mk(b,day,cur(b,day).pi,0,1))}
 if(rot.length>3){const b=rot[(day*5+7)%rot.length];if(!R.some(p=>p.brandAd==b.id))R.push(mk(b,day,cur(b,day).pi,0,2))}
 return{L:L.slice(0,3),R}}
/* mix them into the feed: launches near the top, ads spread lower down */
{const g0=genFeed;genFeed=function(){g0.apply(this,arguments);try{const t=todays(),F=IGF.slice(),pos=[1,5,9,3,7];let n=0;
 [...t.L,...t.R].forEach(p=>{F.splice(Math.min(pos[n++%pos.length],F.length),0,p)});IGF=F}catch(e){console.warn('brand posts',e)}}}
/* profile pages of the brands: their current and past products */
{const u0=uposts;uposts=function(u,cfg){const b=BRD.brands.find(x=>hdl(x)==u);if(!b)return u0.apply(this,arguments);
 if(UPR[u])return UPR[u];const day=S.day||0;return UPR[u]=[0,1,2,3,4,5].map(i=>{const p=mk(b,Math.max(0,day-i*3),i%3,i==0&&cur(b,day).age<WIN?1:0,3+i);p.id+=5e5;return p})}}
/* logo avatar instead of a pixel face (also in the realistic portrait swap) */
{const p0=pfp;pfp=function(c){if(c&&c.brandLogo){try{return BRD.logo(c.brandLogo,32)}catch(e){}}return p0.apply(this,arguments)}}
{const q0=igxPortrait;igxPortrait=function(c){if(c&&c.brandLogo){try{return BRD.logo(c.brandLogo,64)}catch(e){}}return q0.apply(this,arguments)}}
/* the ad picture: brand colours, the logo, a product drawing and a NEW badge */
const RND=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
const ICON={
 sneaker(x,c,d){x.fillStyle=c;x.beginPath();x.moveTo(-26,6);x.lineTo(-26,-8);x.quadraticCurveTo(-8,-10,-2,-20);x.lineTo(6,-18);x.quadraticCurveTo(10,-4,28,0);x.lineTo(28,6);x.closePath();x.fill();x.fillStyle=d;x.fillRect(-28,6,58,5)},
 drink(x,c,d){x.fillStyle=c;RND(x,-11,-26,22,50,4);x.fill();x.fillStyle=d;x.fillRect(-11,-14,22,16);x.fillStyle='#fff';x.fillRect(-11,-26,22,5)},
 eyewear(x,c,d){x.fillStyle=c;[-14,14].forEach(cx=>{x.beginPath();x.ellipse(cx,0,12,9,0,0,7);x.fill()});x.fillRect(-4,-4,8,3);x.fillStyle=d;[-14,14].forEach(cx=>{x.beginPath();x.ellipse(cx,0,8,5.5,0,0,7);x.fill()})},
 streetwear(x,c,d){x.fillStyle=c;x.beginPath();x.moveTo(-14,-24);x.lineTo(14,-24);x.lineTo(30,-8);x.lineTo(22,0);x.lineTo(16,-6);x.lineTo(16,24);x.lineTo(-16,24);x.lineTo(-16,-6);x.lineTo(-22,0);x.lineTo(-30,-8);x.closePath();x.fill();x.fillStyle=d;x.fillRect(-9,0,18,8)},
 denim(x,c,d){x.fillStyle=c;x.beginPath();x.moveTo(-16,-26);x.lineTo(16,-26);x.lineTo(20,26);x.lineTo(3,26);x.lineTo(0,-6);x.lineTo(-3,26);x.lineTo(-20,26);x.closePath();x.fill();x.fillStyle=d;x.fillRect(-16,-26,32,5)},
 audio(x,c,d){x.strokeStyle=c;x.lineWidth=5;x.beginPath();x.arc(0,2,20,Math.PI,0);x.stroke();x.fillStyle=c;RND(x,-27,0,12,22,4);x.fill();RND(x,15,0,12,22,4);x.fill();x.fillStyle=d;x.fillRect(-24,5,6,12);x.fillRect(18,5,6,12)},
 sportswear(x,c,d){ICON.sneaker(x,c,d)},
 tech(x,c,d){x.fillStyle=c;RND(x,-14,-26,28,52,5);x.fill();x.fillStyle=d;RND(x,-11,-22,22,40,2);x.fill();x.fillStyle=c;x.fillRect(-4,-24,8,2)},
 luxury(x,c,d){x.fillStyle=c;RND(x,-22,-8,44,32,4);x.fill();x.strokeStyle=c;x.lineWidth=3.5;x.beginPath();x.arc(0,-8,11,Math.PI,0);x.stroke();x.fillStyle=d;x.fillRect(-4,2,8,6)}};
const PIC=p=>{const b=BRD.by(p.brandAd),pr=prods(b)[p.prod|0],k=document.createElement('canvas');k.width=160;k.height=120;const x=k.getContext('2d');
 const g=x.createLinearGradient(0,0,160,120);g.addColorStop(0,b.bg);g.addColorStop(1,b.c);x.fillStyle=g;x.fillRect(0,0,160,120);
 x.fillStyle='#ffffff22';for(let i=-2;i<8;i++){x.beginPath();x.moveTo(i*30,120);x.lineTo(i*30+40,0);x.lineTo(i*30+55,0);x.lineTo(i*30+15,120);x.fill()}
 x.fillStyle='#00000030';x.beginPath();x.ellipse(80,88,38,6,0,0,7);x.fill();
 x.save();x.translate(80,60);x.scale(1.25,1.25);(ICON[b.cat]||ICON.tech)(x,b.c=='#111'?'#2a2a2a':b.c,b.bg);x.restore();
 try{x.save();x.translate(5,5);x.scale(26/64,26/64);x.fillStyle=b.bg;RND(x,0,0,64,64,10);x.fill();x.clip();b.p(x);x.restore()}catch(e){x.restore()}
 x.fillStyle='#000000b0';x.fillRect(0,100,160,20);x.fillStyle='#fff';x.font='700 10px Arial,sans-serif';x.textBaseline='middle';x.fillText(pr[0],6,110);
 if(p.launch){x.fillStyle='#ff2d55';RND(x,112,6,42,16,4);x.fill();x.fillStyle='#fff';x.font='800 10px Arial,sans-serif';x.textAlign='center';x.fillText('NEW',133,14);x.textAlign='left'}
 return k.toDataURL()};
{const pp0=postPic;postPic=function(p){if(p&&p.brandAd){try{if(PICS[p.id])return PICS[p.id];return PICS[p.id]=PIC(p)}catch(e){console.warn('brand ad pic',e)}}return pp0.apply(this,arguments)}}
BRD.postsToday=todays;BRD.handle=hdl;BRD.products=prods;
})();
