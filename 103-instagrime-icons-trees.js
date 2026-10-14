/* ===== v26.110: Instagrime fixes, new Spotifly icon, one blocky tree style =====
   Instagrime: a new account starts with no posts; no food posts; per-song analytics that update live; percentages are capped.
   Trees: blkTree() builds every tree from boxes (shaded layers, a few shapes) for the streets, house, park and festival. */

/* ---- Spotifly icon: an original pixel-art paper-wing fly (not the green circle logo) ---- */
{const ic=mkIc(['.TTTTTTTT.','TTTTTTTTTT','TWWTTTTWWT','TWLWTTWLWT','TTWWWYWWWT','TTTWWYWWTT','TTWWWYWWWT','TWLWTYTWLT','TWWTTYTTWT','.TTTTYYTT.'],{T:'#0f6b4a',W:'#d9fff0',L:'#7ff0c0',Y:'#ffd23f'});IC.fw=ic}

/* ---- Instagrime ---- */
{const i0=inst;inst=function(k){const had=S.apps&&S.apps.ig;const r=i0.apply(this,arguments);if(k=='ig'&&!had&&S.apps&&S.apps.ig&&!S.igInit){S.igInit=1;S.igPosts=[];S.likedP=[];S.savedP=[];S.igF=0;S.lastPost=0}return r}}
{const ci=KINDS.indexOf('food');if(ci>=0)KINDS.splice(ci,1)}
{const bad=/soup|snack|food|cereal|biscuit|pancake|sandwich|toast|waffle|noodle|cake|pizza|burger|coffee|crouton|grocery|banana|napkin|fridge|dishwasher|chip/i;if(Array.isArray(CAPS)){for(let i=CAPS.length-1;i>=0;i--)if(bad.test(CAPS[i]))CAPS.splice(i,1)}
 for(const k in KC)if(Array.isArray(KC[k])&&k!='food')for(let i=KC[k].length-1;i>=0;i--)if(/soup|snack|pancake|waffle|pizza|burger|crouton|noodle/i.test(KC[k][i]))KC[k].splice(i,1)}
{const k0=kindOf;kindOf=function(p){const k=k0(p);return k=='food'?'studio':k}}
/* feed posts already generated or saved as food posts */
{const g0=genFeed;genFeed=function(){g0.apply(this,arguments);IGF=IGF.filter(p=>p.kind!='food')}}

/* per-song history so analytics are exact: one entry per finished day */
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{S.songs.forEach(s=>{s.dh=s.dh||[];const d=S.day-1;if(!s.dh.some(e=>e[0]==d)){s.dh.push([d,s.pd===d?Math.round(s.today||0):0]);if(s.dh.length>60)s.dh.shift()}})}catch(e){}return r}}
const songDay=(s,d)=>{if(s.pd===d&&d===S.day)return Math.round(s.today||0);const e=(s.dh||[]).find(x=>x[0]==d);return e?e[1]:0};
const songSum=(s,d0,d1)=>{let t=0;for(let d=d0;d<=d1;d++)t+=songDay(s,d);return t};
const pctTxt=(a,b)=>{if(!(b>0))return a>0?'new':'–';const v=Math.round((a-b)/b*100);return v>=999?'999%+':(v>0?'+':'')+Math.max(-100,v)+'%'};
function ianHtml(){const s=S.songs.find(x=>x.id==PRS);if(!s)return'';const D=S.day,tod=songDay(s,D),yest=songDay(s,D-1),w=songSum(s,D-6,D),pw=songSum(s,D-13,D-7),m30=songSum(s,D-29,D);
 const all30=S.songs.reduce((q,x)=>q+songSum(x,D-29,D),0),share=all30>0?Math.min(1,m30/all30):0,ml=Math.min(S.listeners||0,Math.round((S.listeners||0)*share));
 const cell=(a,b)=>`<div class=card><small>${a}</small><b>${b}</b></div>`;
 return`<h3>Analytics: ${esc(s.title)}</h3><div class=cards style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))!important;gap:8px">${cell('Total streams',(s.streams||0).toLocaleString())}${cell('Today so far',tod.toLocaleString())}${cell('Yesterday',yest.toLocaleString())}${cell('Last 7 days',w.toLocaleString()+'<br><small>'+pctTxt(w,pw)+' vs the week before</small>')}${cell('Listeners from this song',ml.toLocaleString()+'<br><small>'+Math.round(share*100)+'% of your '+(S.listeners||0).toLocaleString()+' monthly listeners</small>')}</div>`}
{const p0=prPage;prPage=function(){let h=p0.apply(this,arguments);const s=S.songs.find(x=>x.id==PRS);
  const list=s?S.promos.filter(p=>p.s==s.id).slice().reverse():[];
  const tail=`<div id=ian>${ianHtml()}</div><h3>Promotions for this song</h3>${list.length?list.map(prCard).join(''):'<p class=pmn>No promotions for this song yet.</p>'}</div>`;
  const i=h.indexOf('<h3>Your promotions</h3>');return i<0?h:h.slice(0,i)+tail}}
{const u0=update;update=function(dt){u0(dt);if(mode=='pc'&&!PAUSED&&app=='ig'&&igv=='promo'){IAN_T=(IAN_T||0)+dt;if(IAN_T>1.2){IAN_T=0;const e=document.getElementById('ian');if(e)e.innerHTML=ianHtml()}}}}
let IAN_T=0;

/* ---- trees: blocky pixel-art, shaded layers, three shapes ---- */
const ltc=(c,f)=>'#'+new THREE.Color(c).lerp(new THREE.Color('#ffffff'),f).getHexString();
function blkTree(box,x,z,s,seed,col){s=s||1;const r=Math.abs(Math.sin(x*12.9898+z*78.233+(seed||0))*43758.5453)%1,k=r<.5?0:r<.8?1:2,
 pal=col||[['#2c6a34','#3b8a43','#55a850'],['#3a7a3c','#4c9444','#66b058'],['#2a5e38','#3a7a46','#4f9456'],['#4b7a2c','#5f9638','#79b248']][Math.floor(r*40)%4],
 b=(w,h,d,c,px,py,pz)=>box(w*s,h*s,d*s,c,x+px*s,py*s,z+pz*s),T='#6b4a2e',T2='#573b24';
 if(k==1){/* pine */
  b(.34,1.2,.34,T,0,.6,0);b(.12,1.2,.34,T2,.11,.6,0);
  [[1.8,.7,.55],[1.4,.7,1.2],[1.0,.7,1.85],[.6,.7,2.5]].forEach((l,i)=>{b(l[0],l[1],l[0],pal[Math.min(2,i)],0,l[2]+.35,0);b(l[0]*.45,l[1]*.9,l[0]*.45,ltc(pal[2],.12),-l[0]*.28,l[2]+.4,l[0]*.28)});
  b(.3,.35,.3,ltc(pal[2],.25),0,3.0,0)}
 else if(k==2){/* tall oak */
  b(.4,1.7,.4,T,0,.85,0);b(.14,1.7,.4,T2,.14,.85,0);b(.9,.12,.12,T,.4,1.3,0);
  b(2.0,.9,2.0,pal[0],0,2.0,0);b(1.6,.9,1.6,pal[1],0,2.85,.05);b(1.0,.8,1.0,pal[2],0,3.6,0);
  b(.7,.7,.7,pal[1],1.1,2.1,.3);b(.7,.7,.7,pal[0],-1.1,1.9,-.3);b(.6,.6,.6,pal[2],-.5,3.1,.8);b(.5,.5,.5,ltc(pal[2],.2),.3,4.1,-.1)}
 else{/* round */
  b(.34,1.1,.34,T,0,.55,0);b(.12,1.1,.34,T2,.11,.55,0);
  b(1.8,.75,1.8,pal[0],0,1.35,0);b(1.45,.75,1.45,pal[1],0,2.05,0);b(.95,.65,.95,pal[2],0,2.7,0);
  b(.55,.55,.55,pal[1],.95,1.2,.5);b(.55,.55,.55,pal[0],-.95,1.3,-.5);b(.45,.45,.45,ltc(pal[2],.22),.25,3.15,-.2)}}
tree=function(x,z,s=1){if(typeof CTD!='undefined')CTD.tree.push([x,z]);blkTree(SB,x,z,s,0)};
pkTree=function(G,x,z,k,s){s=s||1;CPARK.trees.push([x,z,k,s]);const box=(w,h,d,c,px,py,pz)=>xgBox(G,w,h,d,c,px,py,pz);
 if(k=='pine'||k=='poplar')return blkTree(box,x,z,s*(k=='poplar'?.9:1),3,['#2f5d3a','#3a7048','#4a8a56']);
 if(k=='birch'){box(.22*s,2.1*s,.22*s,'#eeeae0',x,1.05*s,z);[.5,1.1,1.6].forEach(y=>box(.24*s,.1*s,.24*s,'#3a3a3a',x+.02*s,y*s,z));const c=pick(['#8cc65a','#9ccf62','#7fbf52']);box(1.3*s,.7*s,1.3*s,dk(c,.88),x,2.0*s,z);box(1.0*s,.7*s,1.0*s,c,x,2.7*s,z);box(.6*s,.5*s,.6*s,ltc(c,.18),x,3.25*s,z);return}
 if(k=='willow'){blkTree(box,x,z,s*1.1,5,['#6f9a40','#82ae4c','#98c25a']);const c='#7fa94a';for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=1.15*s,h=R(.9,1.6)*s;box(.3*s,h,.3*s,pick([dk(c,.88),c,ltc(c,.08)]),x+Math.cos(a)*r,1.9*s-h/2,z+Math.sin(a)*r)}return}
 const c=k=='cherry'?pick(['#e58aae','#ec9cbd','#de7fa6']):k=='maple'?pick(['#d9772b','#c95a2a','#e39a2f','#b8442a']):pick(CPKC);
 blkTree(box,x,z,s,7,[dk(c,.8),c,ltc(c,.14)])};

/* "Back to feed" used to stay on the same page when you had opened a post from your account (igb was 'acct'): the account and
   profile pages always go back to the feed, and a post goes back to wherever you opened it from */
{const ig0=PA.ig;PA.ig=function(){let h=ig0.apply(this,arguments);if(igv=='post'){const t=igb=='acct'?'‹ Back to account':igb=='prof'?'‹ Back to profile':'‹ Back to feed';h=h.replace('‹ Back to feed',t)}
  else h=h.replace(/onclick="igv=igb&&igb!='post'\?igb:'feed';pcR\(\)">‹ Back to feed/,`onclick="igv='feed';pcR()">‹ Back to feed`);return h}}
