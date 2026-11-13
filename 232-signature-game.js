/* ===== v52.6.0: signature minigame (reusable) =====
   You draw your own signature, with the mouse, a finger or a stylus, on a series of items: lined paper, a poster,
   a ticket, a cap, an album, a vinyl record, a CD, a shirt. Nothing here is saved and no state fields are added.
   Used by 233-festival-backstage.js (autographs after a festival set or a tour show). The vinyl/CD printing work
   can call it too, to sign printed records.

   API (all global, safe to call from any later file; nothing happens in the background):
     signGame({ items, title, intro, skippable, onDone })  -> Promise<result>, and calls onDone(result)
       items: array of { kind, who, ask, ink, art, zone, draw }
         kind  'paper' | 'poster' | 'ticket' | 'cap' | 'album' | 'shirt' | 'vinyl' | 'cd'  (see SIGN.kinds)
         who   the fan's name, shown in the header ("for Maya")
         ask   what the fan says (default: a line that fits the kind)
         ink   pen colour (default: black, or silver/white on dark items)
         art   { title, artist, col } printed on album/vinyl/cd/poster (default: your artist name and the song title)
         zone  {x,y,w,h} fractions 0..1 of the item where the signature belongs (default: the kind's own spot)
         draw  (ctx,W,H) custom drawing of the item (W x H = 720 x 440); then give a zone too
       result: { signed, skipped, total, cancelled, avg, items:[{kind,who,signed,q,strokes}] }
         q is the quality 0..1 (stays in the signing spot, a real signature size, not a scribble); avg is the mean of the signed ones.
         strokes are the points of the signature, normalised to the zone (x,y in 0..1, new stroke = new array), so another
         screen can stamp it: SIGN.stamp(ctx, strokes, x, y, w, h, colour, lineWidth).
     SIGN.item(kind, extra)   builds an item object (same as writing it by hand)
     SIGN.random(n, extra)    n random items, no kind twice in a row
     SIGN.busy()              true while the overlay is open
   One session at a time: a second call while one is open resolves at once with cancelled:true. */
(function(){
const W=720,H=440,SIGN=window.SIGN={W,H,kinds:['paper','poster','ticket','cap','album','shirt','vinyl','cd'],busy:()=>!!SIGN.cur};
const NAMES=['Maya','Jordan','Priya','Leo','Sam','Aiko','Diego','Zoe','Kai','Nia','Theo','Ruby','Omar','Ella','Finn','Luna'];
const ASK={paper:'Could you sign my notebook?',poster:'Please sign my poster!',ticket:'Can you sign my ticket?',cap:'Sign my cap, please!',album:'Could you sign my album?',shirt:'Can you sign my shirt?',vinyl:'Sign my vinyl, please!',cd:'Could you sign my CD?'};
/* where the signature goes (fractions of the item) and the pen that shows up on it */
const ZONE={paper:{x:.14,y:.62,w:.74,h:.26},poster:{x:.2,y:.8,w:.6,h:.15},ticket:{x:.1,y:.58,w:.8,h:.3},cap:{x:.3,y:.3,w:.4,h:.28},album:{x:.1,y:.74,w:.8,h:.17},shirt:{x:.3,y:.34,w:.4,h:.22},vinyl:{x:.34,y:.34,w:.32,h:.32},cd:{x:.3,y:.3,w:.4,h:.4}};
const INK={paper:'#1b2a6b',poster:'#111',ticket:'#111',cap:'#111',album:'#111',shirt:'#111',vinyl:'#111',cd:'#111'};
SIGN.item=(kind,x)=>Object.assign({kind},x||{});
SIGN.random=(n,x)=>{const o=[];let last='';for(let i=0;i<n;i++){let k;do k=SIGN.kinds[(Math.random()*SIGN.kinds.length)|0];while(k==last&&SIGN.kinds.length>1);last=k;o.push(SIGN.item(k,x))}return o};
/* stamp a signature (normalised strokes) onto any canvas context, into the box x,y,w,h */
SIGN.stamp=(c,strokes,x,y,w,h,col,lw)=>{c.save();c.strokeStyle=col||'#111';c.lineWidth=lw||2;c.lineCap=c.lineJoin='round';
 strokes.forEach(s=>{if(!s.length)return;c.beginPath();s.forEach((p,i)=>i?c.lineTo(x+p[0]*w,y+p[1]*h):c.moveTo(x+p[0]*w,y+p[1]*h));if(s.length==1)c.lineTo(x+s[0][0]*w+.1,y+s[0][1]*h);c.stroke()});c.restore()};

/* ---- the items (720 x 440). Each draws its look and ends with a faint "sign here" mark that the zone lies on ---- */
const rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
const txt=(c,t,x,y,sz,col,al,fw)=>{c.fillStyle=col;c.font=(fw||'bold')+' '+sz+'px Silkscreen,ui-monospace,monospace';c.textAlign=al||'center';c.textBaseline='middle';
 let s=sz;while(c.measureText(t).width>W*.84&&s>10){s-=2;c.font=(fw||'bold')+' '+s+'px Silkscreen,ui-monospace,monospace'}c.fillText(t,x,y)};
function table(c){const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#6b5233');g.addColorStop(1,'#4a3622');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#0003';c.lineWidth=2;for(let y=30;y<H;y+=46){c.beginPath();c.moveTo(0,y);c.lineTo(W,y+8);c.stroke()}}
const DRAW={
 paper(c){table(c);c.save();c.translate(W/2,H/2);c.rotate(-.025);c.fillStyle='#0004';c.fillRect(-300,-190,612,392);c.fillStyle='#fbf6e6';c.fillRect(-306,-196,612,392);
  c.strokeStyle='#8fb4e0';c.lineWidth=1.5;for(let y=-150;y<190;y+=34){c.beginPath();c.moveTo(-306,y);c.lineTo(306,y);c.stroke()}
  c.strokeStyle='#e0707a';c.lineWidth=2;c.beginPath();c.moveTo(-246,-196);c.lineTo(-246,196);c.stroke();
  c.fillStyle='#4a3622';[-120,0,120].forEach(y=>{c.beginPath();c.arc(-280,y,9,0,7);c.fill()});
  c.fillStyle='#6a6a78';c.font='22px cursive,serif';c.textAlign='left';c.fillText('Best night ever!!',-220,-120);c.fillText('autograph from',-220,-86);c.restore()},
 poster(c,o){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,o.art.col||'#7a2ae0');g.addColorStop(1,'#14082a');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='#fff2';for(let i=0;i<9;i++){c.beginPath();c.moveTo(W/2,150);c.lineTo(W/2-420+i*105,-20);c.lineTo(W/2-420+(i+.5)*105,-20);c.fill()}
  txt(c,(o.art.artist||'').toUpperCase(),W/2,110,64,'#fff');txt(c,'LIVE · '+(o.art.title||'ON TOUR').toUpperCase(),W/2,185,26,'#ffe066');
  c.strokeStyle='#fff8';c.lineWidth=4;c.strokeRect(14,14,W-28,H-28);c.fillStyle='#f6f0ff';rr(c,130,H*.74,W-260,H*.2,10);c.fill()},
 ticket(c,o){table(c);c.save();c.translate(W/2,H/2);c.rotate(.03);c.fillStyle='#0005';rr(c,-318,-166,640,336,18);c.fill();const g=c.createLinearGradient(-320,0,320,0);g.addColorStop(0,'#ff6ad5');g.addColorStop(1,'#ffb347');c.fillStyle=g;rr(c,-322,-170,640,336,18);c.fill();
  c.fillStyle='#0003';[...Array(8)].forEach((_,i)=>{c.beginPath();c.arc(-322,-140+i*40,9,0,7);c.fill();c.beginPath();c.arc(318,-140+i*40,9,0,7);c.fill()});
  c.restore();txt(c,'ADMIT ONE · '+(o.art.artist||'').toUpperCase(),W/2,H/2-122,30,'#fff');txt(c,'PARK FIELDS FESTIVAL',W/2,H/2-84,18,'#fff','center');
  c.fillStyle='#fff9';rr(c,62,H*.56,W-124,H*.34,12);c.fill()},
 cap(c){table(c);c.save();c.translate(W/2,H/2+20);c.fillStyle='#0005';c.beginPath();c.ellipse(8,150,250,40,0,0,7);c.fill();
  c.fillStyle='#e8e4dc';c.beginPath();c.moveTo(-230,120);c.bezierCurveTo(-240,-180,240,-180,230,120);c.closePath();c.fill();
  c.fillStyle='#d8d4cc';c.beginPath();c.ellipse(0,120,300,70,0,0,Math.PI);c.fill();c.fillStyle='#2a2a30';c.beginPath();c.ellipse(0,114,300,28,0,0,7);c.fill();
  c.strokeStyle='#bbb6aa';c.lineWidth=2;c.beginPath();c.moveTo(0,-150);c.lineTo(0,112);c.stroke();c.fillStyle='#2a2a30';c.beginPath();c.arc(0,-150,10,0,7);c.fill();c.restore()},
 album(c,o){table(c);c.fillStyle='#0005';c.fillRect(150,28,432,404);const g=c.createLinearGradient(140,10,140,H);g.addColorStop(0,o.art.col||'#2fae8a');g.addColorStop(1,'#10202a');c.fillStyle=g;c.fillRect(138,14,432,404);
  c.fillStyle='#fff3';c.beginPath();c.arc(354,150,92,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(354,150,54,0,7);c.fill();c.fillStyle='#0003';c.beginPath();c.arc(354,150,12,0,7);c.fill();
  txt(c,(o.art.title||'').toUpperCase(),354,282,28,'#fff');txt(c,(o.art.artist||'').toUpperCase(),354,320,18,'#ffe066');c.fillStyle='#f6f6ee';rr(c,168,H*.74,W-336,H*.17,6);c.fill()},
 shirt(c,o){table(c);c.fillStyle='#0004';c.save();c.translate(W/2+8,H/2+10);c.beginPath();c.moveTo(-140,-170);c.lineTo(-300,-80);c.lineTo(-240,-10);c.lineTo(-170,-60);c.lineTo(-170,190);c.lineTo(170,190);c.lineTo(170,-60);c.lineTo(240,-10);c.lineTo(300,-80);c.lineTo(140,-170);c.quadraticCurveTo(0,-110,-140,-170);c.fill();c.restore();
  c.save();c.translate(W/2,H/2);c.fillStyle='#f4f4f0';c.beginPath();c.moveTo(-140,-170);c.lineTo(-300,-80);c.lineTo(-240,-10);c.lineTo(-170,-60);c.lineTo(-170,190);c.lineTo(170,190);c.lineTo(170,-60);c.lineTo(240,-10);c.lineTo(300,-80);c.lineTo(140,-170);c.quadraticCurveTo(0,-110,-140,-170);c.fill();
  c.strokeStyle='#d6d6d0';c.lineWidth=3;c.stroke();c.restore();txt(c,(o.art.artist||'').toUpperCase(),W/2,H*.27,26,o.art.col||'#7a2ae0')},
 vinyl(c,o){table(c);c.fillStyle='#0005';c.beginPath();c.arc(W/2+8,H/2+10,206,0,7);c.fill();c.fillStyle='#0c0c10';c.beginPath();c.arc(W/2,H/2,206,0,7);c.fill();
  c.strokeStyle='#ffffff14';c.lineWidth=1;for(let r=96;r<200;r+=5){c.beginPath();c.arc(W/2,H/2,r,0,7);c.stroke()}
  c.fillStyle='#ffffff10';c.beginPath();c.moveTo(W/2,H/2);c.arc(W/2,H/2,200,-.9,-.4);c.fill();c.beginPath();c.moveTo(W/2,H/2);c.arc(W/2,H/2,200,2.2,2.7);c.fill();
  c.fillStyle=o.art.col||'#ffe066';c.beginPath();c.arc(W/2,H/2,86,0,7);c.fill();c.fillStyle='#f6f2e0';c.beginPath();c.arc(W/2,H/2,70,0,7);c.fill();c.fillStyle='#0c0c10';c.beginPath();c.arc(W/2,H/2,6,0,7);c.fill();
  txt(c,(o.art.title||'').toUpperCase(),W/2,H/2-48,13,'#222');txt(c,(o.art.artist||'').toUpperCase(),W/2,H/2+50,13,'#222')},
 cd(c,o){table(c);c.fillStyle='#0005';c.beginPath();c.arc(W/2+8,H/2+10,200,0,7);c.fill();const g=c.createConicGradient?c.createConicGradient(0,W/2,H/2):null;
  if(g){['#e8e8ee','#b9bcc8','#f6f6fa','#a8aebe','#e8e8ee','#c8ccd8','#f2f2f6','#e8e8ee'].forEach((k,i,a)=>g.addColorStop(i/(a.length-1),k));c.fillStyle=g}else c.fillStyle='#d4d6de';
  c.beginPath();c.arc(W/2,H/2,200,0,7);c.fill();c.fillStyle='#fff6';c.beginPath();c.arc(W/2,H/2,64,0,7);c.fill();c.fillStyle='#0004';c.beginPath();c.arc(W/2,H/2,18,0,7);c.fill();
  c.strokeStyle='#0002';c.lineWidth=2;c.beginPath();c.arc(W/2,H/2,198,0,7);c.stroke();txt(c,(o.art.artist||'').toUpperCase()+' · '+(o.art.title||'').toUpperCase(),W/2,H/2-112,15,'#334')}};

/* ---- scoring: a signature that stays in its spot, has a real size and is not just a scribble ---- */
function score(st,z){let len=0,inn=0,pts=0,x0=9,x1=-9,y0=9,y1=-9;
 st.forEach(s=>s.forEach((p,i)=>{pts++;if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];if(i){const d=Math.hypot((p[0]-s[i-1][0])*z.w*W,(p[1]-s[i-1][1])*z.h*H);len+=d;if(p[0]>=-.08&&p[0]<=1.08&&p[1]>=-.12&&p[1]<=1.12)inn+=d}}));
 const zw=z.w*W,ok=len>=zw*.7&&pts>6;if(!ok)return{ok:0,q:0};
 const stay=inn/len,size=Math.min(1,(x1-x0)*.5+.35+(y1-y0)*.4),scr=len>zw*10?Math.max(.45,1-(len-zw*10)/(zw*14)):1,strk=st.length>1?1:.92;
 return{ok:1,q:Math.max(.12,Math.min(1,Math.pow(stay,1.6)*size*scr*strk*1.05))}}
const LINES=[[.85,'Amazing! Thank you so much!'],[.6,'Thank you! That looks great.'],[.35,'Um... thanks! I think.'],[0,'Is that... a squiggle? Thanks anyway.']];

window.signGame=function(o){o=o||{};return new Promise(res=>{
 const items=(o.items&&o.items.length?o.items:SIGN.random(3)).map((it,i)=>{const a=Object.assign({},it);a.who=a.who||NAMES[(Math.random()*NAMES.length)|0];a.ask=a.ask||ASK[a.kind]||'Could you sign this?';
  const nm=(typeof S!='undefined'&&S&&S.artist)||'You';a.art=Object.assign({artist:nm,title:(typeof S!='undefined'&&S&&S.songs&&S.songs.length?S.songs[S.songs.length-1].title:'')||'Live',col:null},a.art||{});
  a.zone=a.zone||ZONE[a.kind]||ZONE.paper;a.ink=a.ink||INK[a.kind]||'#111';return a});
 if(SIGN.cur){const r={signed:0,skipped:0,total:items.length,cancelled:true,avg:0,items:[]};if(o.onDone)try{o.onDone(r)}catch(e){console.error(e)}return res(r)}
 const R={signed:0,skipped:0,total:items.length,cancelled:false,avg:0,items:[]},ov=document.createElement('div');ov.id='sgov';SIGN.cur=ov;
 ov.innerHTML=`<div class=sgb><div class=sgh><b id=sgt></b><span id=sgp></span></div><div id=sgq></div><div class=sgc><canvas id=sgbg width=${W} height=${H}></canvas><canvas id=sgin width=${W} height=${H}></canvas><div id=sgr></div></div>
  <div class=sgbt><button id=sgcl>Clear</button>${o.skippable===false?'':'<button id=sgsk>Skip</button>'}<button id=sgok class=go>Next</button></div><div id=sgm></div></div>`;
 document.body.appendChild(ov);const $q=i=>ov.querySelector('#'+i),bg=$q('sgbg').getContext('2d'),cv=$q('sgin'),ink=cv.getContext('2d');
 let i=-1,strokes=[],cur=null,lock=1,lw=3,last=null;
 const zr=()=>{const z=items[i].zone;return{x:z.x*W,y:z.y*H,w:z.w*W,h:z.h*H}};
 const norm=(p,z)=>[(p[0]-z.x)/z.w,(p[1]-z.y)/z.h];
 function paint(){const it=items[i],z=zr();ink.clearRect(0,0,W,H);ink.lineCap=ink.lineJoin='round';ink.strokeStyle=it.ink;ink.fillStyle=it.ink;
  strokes.forEach(s=>{if(!s.length)return;ink.lineWidth=lw+1.2;ink.beginPath();s.forEach((p,k)=>{const x=z.x+p[0]*z.w,y=z.y+p[1]*z.h;k?ink.lineTo(x,y):ink.moveTo(x,y)});if(s.length==1)ink.lineTo(z.x+s[0][0]*z.w+.1,z.y+s[0][1]*z.h);ink.stroke()})}
 function hint(){const it=items[i],z=zr();bg.save();bg.setLineDash([8,7]);bg.strokeStyle='#e03a3acc';bg.lineWidth=2;rr(bg,z.x,z.y,z.w,z.h,8);bg.stroke();bg.setLineDash([]);bg.fillStyle='#e03a3acc';bg.font='bold 22px sans-serif';bg.textAlign='left';bg.textBaseline='middle';bg.fillText('×',z.x+8,z.y+z.h*.78);bg.restore()}
 function show(n){i=n;strokes=[];cur=null;lock=0;const it=items[i];bg.clearRect(0,0,W,H);(it.draw||DRAW[it.kind]||DRAW.paper)(bg,it);hint();ink.clearRect(0,0,W,H);
  $q('sgt').textContent=(o.title||'Autographs');$q('sgp').textContent='Item '+(i+1)+' of '+items.length;$q('sgq').innerHTML='<b>'+esc(it.who)+':</b> “'+esc(it.ask)+'”';$q('sgm').textContent='';$q('sgr').textContent='';$q('sgok').textContent=i==items.length-1?'Finish':'Next';
  $q('sgm').className='';}
 function done(cancel){if(!SIGN.cur)return;SIGN.cur=null;removeEventListener('keydown',kd,true);ov.remove();R.cancelled=!!cancel;const s=R.items.filter(x=>x.signed);R.signed=s.length;R.skipped=items.length-s.length;R.avg=s.length?s.reduce((a,x)=>a+x.q,0)/s.length:0;if(o.onDone)try{o.onDone(R)}catch(e){console.error(e)}res(R)}
 function next(rec){R.items.push(rec);lock=1;if(i>=items.length-1)return setTimeout(()=>done(0),rec.signed?650:150);setTimeout(()=>show(i+1),rec.signed?850:120)}
 function ok(){if(lock)return;const it=items[i],sc=score(strokes,it.zone);
  if(!sc.ok){const m=$q('sgm');m.textContent='Sign inside the red box first, or skip this one.';m.className='sgw';try{snd('err')}catch(e){}return}
  lock=1;const q=sc.q,l=LINES.find(a=>q>=a[0])[1];$q('sgr').textContent=l;$q('sgr').className=q>=.6?'sgg':'';try{snd('pop')}catch(e){}
  next({kind:it.kind,who:it.who,signed:1,q,strokes:strokes.map(s=>s.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]))})}
 function skip(){if(lock)return;next({kind:items[i].kind,who:items[i].who,signed:0,q:0,strokes:[]})}
 const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
 cv.addEventListener('pointerdown',e=>{if(lock)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}const z=zr(),p=pos(e);cur=[norm(p,z)];strokes.push(cur);last={p,t:e.timeStamp};lw=3;$q('sgm').textContent=''});
 cv.addEventListener('pointermove',e=>{if(!cur||lock)return;e.preventDefault();const z=zr(),ev=e.getCoalescedEvents?e.getCoalescedEvents():[e];(ev.length?ev:[e]).forEach(q=>{const p=pos(q),d=Math.hypot(p[0]-last.p[0],p[1]-last.p[1]);if(d<1.5)return;
  const sp=d/Math.max(4,e.timeStamp-last.t);lw+=(Math.max(1.6,Math.min(4.6,4.8-sp*1.6))-lw)*.3;
  ink.strokeStyle=items[i].ink;ink.lineWidth=lw+1.2;ink.lineCap='round';ink.beginPath();ink.moveTo(last.p[0],last.p[1]);ink.lineTo(p[0],p[1]);ink.stroke();cur.push(norm(p,z));last={p,t:e.timeStamp}})});
 const up=e=>{if(cur&&cur.length==1&&!lock){paint()}cur=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 $q('sgcl').onclick=()=>{if(lock)return;strokes=[];cur=null;paint();$q('sgm').textContent=''};$q('sgok').onclick=ok;const sk=$q('sgsk');if(sk)sk.onclick=skip;
 function kd(e){if(/INPUT|TEXTAREA/.test(e.target.tagName))return;e.stopImmediatePropagation();if(e.key=='Enter'){e.preventDefault();ok()}else if(e.key=='Escape'){e.preventDefault();if(o.skippable===false)return;done(1)}else if(e.key=='Backspace'||e.key=='Delete'){e.preventDefault();$q('sgcl').click()}}
 addEventListener('keydown',kd,true);ov.addEventListener('keyup',e=>e.stopPropagation());
 if(o.intro){const m=$q('sgm');m.textContent=o.intro}
 show(0);if(o.intro)$q('sgm').textContent=o.intro;
 SIGN.cancel=()=>done(1)})};
{const st=document.createElement('style');st.textContent=`#sgov{position:fixed;inset:0;z-index:99990;background:#050806ee;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;font:13px Silkscreen,ui-monospace,monospace;color:#fff;user-select:none;-webkit-user-select:none}
#sgov .sgb{width:min(96vw,740px);max-height:100%;display:flex;flex-direction:column;gap:8px}
#sgov .sgh{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:14px}#sgov #sgp{color:#9fb3a8;font-size:12px}
#sgov #sgq{font-size:14px;line-height:1.35;color:#ffe9a8;min-height:20px}
#sgov .sgc{position:relative;width:100%;aspect-ratio:${W}/${H};max-height:62vh;margin:0 auto;border:3px solid #000;background:#222;box-shadow:0 0 0 2px #ffffff22}
#sgov canvas{position:absolute;inset:0;width:100%;height:100%;display:block}#sgin{cursor:crosshair;touch-action:none}
#sgov #sgr{position:absolute;left:0;right:0;bottom:8px;text-align:center;pointer-events:none;font-size:15px;color:#fff;text-shadow:0 2px 0 #000,0 0 8px #000}#sgov #sgr.sgg{color:#7dffb0}
#sgov .sgbt{display:flex;gap:8px;justify-content:flex-end}#sgov button{font:inherit;padding:8px 14px;background:#1d2622;color:#fff;border:2px solid #000;cursor:pointer}#sgov button.go{background:#2fe68a;color:#04210f}
#sgov #sgm{min-height:16px;font-size:12px;color:#9fb3a8}#sgov #sgm.sgw{color:#ff9a8a}`;document.head.appendChild(st)}
})();
