/* ===== v26.73: furniture models for Amazoom =====
   Each item keeps its base boxes from 22-v8 and gets extra parts for its kind: legs, cushions, handles, trim and
   small props. The parts are chunky and high-contrast, because the shop preview is a 64 pixel picture of the whole
   item: a part much smaller than a tenth of the item's largest side is lost at that size. The same boxes feed the
   shop preview, the item you hold (mkGhost) and the one you place (mkF), since they all read F[k].b. */
const AZX_LEGS=(hx,hz,s,h,c)=>[[s,h,s,c,hx,h/2,hz],[s,h,s,c,-hx,h/2,hz],[s,h,s,c,hx,h/2,-hz],[s,h,s,c,-hx,h/2,-hz]];
const AZX_DARK='#2a1d14',AZX_GOLD='#e6b422';
const AZX={
 arm:(c)=>[...AZX_LEGS(.34,.32,.14,.16,AZX_DARK),[.84,.14,.84,dk(c,1.3),0,.47,0],[.84,.46,.14,dk(c,1.3),0,.72,-.36],
   [.14,.16,.9,dk(c,.8),-.4,.62,0],[.14,.16,.9,dk(c,.8),.4,.62,0],[.08,.08,.04,AZX_GOLD,0,.72,-.28]],
 sofa2:(c)=>[...AZX_LEGS(1.1,.3,.14,.14,AZX_DARK),[1.06,.14,.8,dk(c,1.3),-.55,.5,.04],[1.06,.14,.8,dk(c,1.3),.55,.5,.04],
   [1.06,.44,.16,dk(c,1.1),-.55,.78,-.27],[1.06,.44,.16,dk(c,1.1),.55,.78,-.27],[.26,.28,.12,AZX_GOLD,-.9,.72,.12],[.26,.28,.12,'#c0392b',.9,.72,.12]],
 bed:(c)=>[[1.9,1,.14,'#4a3320',0,.6,-1.5],[1.9,.5,.12,'#4a3320',0,.3,1.5],[.7,.22,.42,'#fff',-.45,.74,-1.1],[.7,.22,.42,'#fff',.45,.74,-1.1],
   [1.84,.14,.3,dk(c,1.3),0,.86,.3],[.14,.12,.14,AZX_DARK,-.9,.06,1.4],[.14,.12,.14,AZX_DARK,.9,.06,1.4],[.14,.12,.14,AZX_DARK,-.9,.06,-1.4],[.14,.12,.14,AZX_DARK,.9,.06,-1.4]],
 desk:(c)=>[[.62,.6,.6,dk(c,.85),-.5,.38,0],[.56,.16,.02,dk(c,1.3),-.5,.2,.31],[.56,.16,.02,dk(c,1.3),-.5,.42,.31],[.56,.16,.02,dk(c,1.3),-.5,.6,.31],
   [.06,.06,.04,AZX_GOLD,-.5,.42,.33],[.06,.06,.04,AZX_GOLD,-.5,.6,.33],[.5,.36,.06,'#111',-.2,1.1,-.2],[.08,.2,.08,'#333',-.2,.86,-.2],[.2,.04,.2,'#333',-.2,.78,-.2]],
 cab:(c)=>[[.47,.9,.02,dk(c,1.25),-.25,.6,.26],[.47,.9,.02,dk(c,1.25),.25,.6,.26],[.06,.06,.04,AZX_GOLD,-.04,.7,.28],[.06,.06,.04,AZX_GOLD,.04,.7,.28],
   [1.06,.1,.56,dk(c,1.3),0,1.14,0],[.9,.12,.5,'#111',0,.06,0]],
 ward:(c)=>[[.56,1.7,.02,dk(c,1.25),-.29,1,.31],[.56,1.7,.02,dk(c,1.25),.29,1,.31],[.06,.3,.04,AZX_GOLD,-.06,1.02,.33],[.06,.3,.04,AZX_GOLD,.06,1.02,.33],
   [1.24,.14,.64,dk(c,1.3),0,2.07,0],[1.1,.2,.56,'#111',0,.1,0]],
 pot:(c)=>[[.5,.36,.5,'#a0522d',0,.18,0],[.56,.08,.56,'#c96b3a',0,.4,0],[.44,.06,.44,'#3b2a1a',0,.45,0]], cac:(c)=>[[.2,.5,.2,c,0,.5,0],[.14,.14,.14,'#ff5c8a',0,.86,0],[.16,.1,.1,c,.16,.5,0],[.1,.22,.1,c,.16,.66,0]],
 art:(c)=>[[1.22,.08,.08,AZX_GOLD,0,1.84,0],[1.22,.08,.08,AZX_GOLD,0,.96,0],[.08,.9,.08,AZX_GOLD,-.6,1.4,0],[.08,.9,.08,AZX_GOLD,.6,1.4,0],
   [.4,.5,.03,dk(c,1.3),-.22,1.4,.06],[.24,.24,.03,'#ffe066',.25,1.5,.06],[.02,.02,.02,'#222',0,1.84,0]],
 spk:(c)=>[[.5,.14,.4,dk(c,.9),0,1.0,0],[.36,.36,.04,'#444',0,.6,.21],[.2,.2,.05,'#9aa0a6',0,.6,.23],[.12,.12,.04,'#ddd',0,.9,.21],
   [.12,.2,.04,'#000',0,.2,.21],[.22,.04,.22,'#111',0,.02,0]],
 pno:(c)=>[[.12,.5,.12,'#111',-.7,.25,-.2],[.12,.5,.12,'#111',.7,.25,-.2],[.12,.04,.12,AZX_GOLD,-.22,.02,.3],[.12,.04,.12,AZX_GOLD,.22,.02,.3],
   [1.5,.12,.04,dk(c,.6),0,.4,.22],[1.5,.06,.14,'#111',0,.86,.04],[1.4,.04,.22,'#fff',0,.84,.14]],
 aqu:(c)=>[[1.3,.5,.02,'#2a6f9a',0,.8,-.27],[.06,.56,.06,'#cfeeff',-.66,.8,-.28],[.06,.56,.06,'#cfeeff',.66,.8,-.28],[.06,.56,.06,'#cfeeff',-.66,.8,.28],[.06,.56,.06,'#cfeeff',.66,.8,.28],[1.36,.06,.56,'#2b2f35',0,1.06,0],[.8,.04,.3,'*fff3c4',0,1.02,0],[.06,.5,.06,'#333',-.66,.27,-.27],[.06,.5,.06,'#333',.66,.27,-.27],[.06,.5,.06,'#333',-.66,.27,.27],[.06,.5,.06,'#333',.66,.27,.27]], ben:(c)=>[[1.4,.12,.5,dk(c,1.3),0,.52,0],[.14,.36,.4,AZX_DARK,-.6,.2,0],[.14,.36,.4,AZX_DARK,.6,.2,0],[1.2,.06,.04,dk(c,.7),0,.15,.22]],
 bean:(c)=>[[.84,.3,.84,c,0,.15,0],[.8,.1,.8,dk(c,1.12),0,.35,0],[.7,.12,.7,dk(c,1.2),0,.45,0],[.52,.1,.52,dk(c,1.3),0,.54,0],[.2,.14,.2,dk(c,1.25),0,.62,0]],
 mir:(c)=>[[.14,.12,.12,AZX_GOLD,-.24,.1,0],[.14,.12,.12,AZX_GOLD,.24,.1,0],[.06,1.2,.06,AZX_GOLD,-.36,.9,0],[.06,1.2,.06,AZX_GOLD,.36,.9,0],[.5,.14,.08,AZX_GOLD,0,1.7,0]],
 clk:(c)=>[[.8,.2,.5,dk(c,.7),0,.1,0],[.7,.14,.46,dk(c,1.3),0,2.8,0],[.46,1.6,.42,dk(c,1.2),0,1.35,0],[.3,.5,.02,'#222',0,.9,.23],[.3,.3,.04,'#f4f1e8',0,1.9,.23],[.02,.1,.02,'#111',0,1.95,.25],[.02,.13,.02,'#111',.05,1.92,.25]], bin:(c)=>[[.44,.05,.44,'#888',0,.02,0],[.44,.04,.44,dk(c,1.2),0,.52,0]],
 gch:(c)=>[[.1,.3,.1,'#111',-.35,.6,0],[.1,.3,.1,'#111',.35,.6,0],[.5,.08,.06,'#222',0,.36,.3],[.44,.14,.1,'#e03030',0,1.2,-.26]],
 tab:(c)=>[[.8,.08,.8,dk(c,1.3),0,.6,0],[.08,.56,.08,dk(c,.7),-.36,.3,-.36],[.08,.56,.08,dk(c,.7),.36,.3,.36]],
 lampt:(c)=>[[.08,.5,.08,'#222',0,.3,0],[.3,.06,.3,'#111',0,.03,0],[.34,.06,.34,AZX_GOLD,0,.66,0]],
 drum:(c)=>[[.4,.2,.4,'#ddd',.7,.2,.36],[.04,.9,.04,'#888',-.5,.45,-.4],[.04,.9,.04,'#888',.5,.45,-.4],[.7,.04,.04,'#888',0,.5,-.4],[.3,.1,.3,'#e6b422',.6,.9,-.2]],
 gst:(c)=>[[.1,.2,.04,'#8a5a36',0,1.2,.25],[.08,.6,.04,'#8a5a36',0,.9,.25],[.2,.2,.04,AZX_GOLD,0,.7,.26],[.1,.14,.04,AZX_GOLD,-.05,.5,.27]],
 rugr:(c)=>[[1.5,.035,.12,'#f4f1e8',0,.05,.4],[1.5,.035,.12,'#f4f1e8',0,.05,-.4],[1.2,.036,.6,dk(c,1.3),0,.05,0]]
};

/* ---- animated parts. fx(g) builds moving parts into the item's group and registers one updater.
   The updaters run on their own animation frame, so the shop preview (which redraws while the item is
   animated), the held item and the placed item all move. */
const FX_T=[];function fxAdd(g,f){FX_T.push({g,f,t0:performance.now()})}
/* updaters of models that have left the scene (a held item put down, say) are dropped after a few seconds */
function fxLoop(){requestAnimationFrame(fxLoop);const n=performance.now();for(let i=FX_T.length-1;i>=0;i--){const e=FX_T[i];if(!e.g.parent&&n-e.t0>5000){FX_T.splice(i,1);continue}e.f(n/1000)}}
fxLoop();
function pvAnim(k){const p=String(k).split(':');return p[0]=='f'&&F[p[1]]&&F[p[1]].fx?1:0}
const AZXFX={
 aqu:(g,c)=>{
   /* sand floor and rocks on the glass bottom (water y .52..1.04, z -.24..24) */
   B(g,1.24,.07,.46,'#e2c48a',0,.555,0);
   [[-.42,.62,.2],[.12,.63,.16],[.46,.62,.22],[-.1,.6,.12]].forEach(r=>B(g,r[2],r[2]*.75,r[2]*.8,'#7d7b78',r[0],r[1],0));
   /* two plants whose leaves sway */
   const pl=new THREE.Group();pl.position.set(-.34,.58,0);g.add(pl);
   B(pl,.05,.42,.05,'#3f7d3a',0,.2,0);B(pl,.22,.13,.08,'#3cb371',.12,.32,0);B(pl,.22,.13,.08,'#2e8b57',-.12,.44,.02);B(pl,.2,.12,.08,'#4fd18b',.06,.6,-.02);
   const pl2=new THREE.Group();pl2.position.set(.44,.58,0);g.add(pl2);
   B(pl2,.05,.52,.05,'#3f7d3a',0,.26,0);B(pl2,.24,.11,.08,'#2e8b57',-.1,.42,0);B(pl2,.24,.11,.08,'#3cb371',.1,.56,0);
   /* three fish: a body, a tail and an eye each, looping at their own speed and height */
   const fish=[[0,'#ff8a30',.0,.9,.4,.84],[.2,'#ffe066',.2,-.7,.5,.74],[.45,'#7fd0ff',.45,.6,.34,.92]].map(f=>{
     const fg=new THREE.Group();g.add(fg);B(fg,.4,.2,.14,f[1],0,0,0);B(fg,.16,.2,.1,f[1],-.28,0,0);B(fg,.07,.07,.05,'#111',.14,.04,.07);
     return{fg,ph:f[0]*6.28,sp:f[3],cx:f[2]*.4-.1,cz:f[2]*.1,r:f[4],y:f[5]}});
   /* bubbles rising from the sand */
   const bub=[0,1,2,3].map(i=>{const b=B(g,.05,.05,.05,'#cfeeff',.2+i*.14,.6,0);return{m:b,ph:i*.25}});
   const up=(t)=>{fish.forEach(f=>{const a=f.ph+t*f.sp*.5;f.fg.position.set(f.cx+f.r*Math.cos(a),f.y+.03*Math.sin(t*2+f.ph),f.cz+.1*Math.sin(a*2));f.fg.rotation.y=Math.atan2(-Math.sin(a)*f.sp,Math.cos(a)*f.sp)*(f.sp>0?1:-1)});
     pl.rotation.z=Math.sin(t*1.1)*.08;pl2.rotation.z=Math.sin(t*1.3+1)*.08;
     bub.forEach(b=>{const u=((t*.25+b.ph)%1);b.m.position.y=.6+u*.42;b.m.position.x=.2+(b.ph*.4)+.02*Math.sin(t*3+b.ph*9)})};
   fxAdd(g,up);
 },
 clk:(g,c)=>{
   /* the pendulum swings behind the glass door */
   const pv=new THREE.Group();pv.position.set(0,1.1,.2);g.add(pv);
   B(pv,.04,1.0,.02,'#c9a227',0,-.5,0);B(pv,.26,.26,.05,'#c9a227',0,-1.05,0);
   fxAdd(g,t=>{pv.rotation.z=Math.sin(t*2.4)*.32});
 },
 pot:(g,c)=>{
   /* the leaves sit on a stem and sway in the breeze */
   const lf=new THREE.Group();lf.position.set(0,.5,0);g.add(lf);
   B(lf,.06,.7,.06,'#5b3a1d',0,.35,0);
   B(lf,.42,.1,.2,'#3cb371',-.2,.7,0);B(lf,.42,.1,.2,'#2e8b57',.2,.9,0);B(lf,.2,.1,.42,'#2e8b57',0,.8,.2);B(lf,.2,.1,.42,'#3cb371',0,.82,-.2);B(lf,.2,.12,.2,'#4fd18b',0,1.05,0);
   fxAdd(g,t=>{lf.rotation.z=Math.sin(t*1.3)*.07;lf.rotation.x=Math.sin(t*1.1+1)*.05});
 }
};
NF.forEach(n=>{const f=F[n[0]],ex=AZX[n[6]];if(f&&ex&&!f.xd){f.b=[...F[n[0]].b.filter(a=>!(n[6]=='aqu'&&(String(a[3]).startsWith('*7fd0ff')||a[3]=='#ff8a30'))&&!(n[6]=='bean')),...ex(n[7])];f.xd=1;if(AZXFX[n[6]])f.fx=(g)=>AZXFX[n[6]](g,n[7])}});
