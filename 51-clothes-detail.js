/* ---------- clothes detail: seams, collars, cuffs, pockets, laces, logos and better materials on your character ----------
   Only your own character gets the extra pieces (NPCs stay light), so the city keeps its frame rate.
   Works on top of buildChar and the Threadz new-drop styles; reads the worn item names from S.wn for per-item touches. */
const XDN=sl=>{const id=(S.wn||{})[sl],g=id&&GM[id];return g?g.n:''};
/* pants box per bottom style: width, depth, length below the hip pivot */
const xLegBox=(bt,w,d)=>({0:[w*.42,d*.8,.42],1:[w*.42,d*.8,.24],2:[w*.44,d*.84,.34],3:[w*.58,d*.97,.42],4:[w*.42,d*.8,.42],5:[w*.42,d*.8,.42],6:[w*.42,d*.8,.24],8:[w*.42,d*.8,.42]})[bt||0];
/* a pixel digit (3x5) drawn from boxes, for jersey numbers */
const XDIG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001001001','111101111101111','111101111001111'];
function xDigit(g,n,x0,y0,z,px,c,back){const p=XDIG[n];for(let i=0;i<15;i++)if(p[i]=='1'){const cx=i%3,cy=i/3|0;xb(g,px,px,.01,c,x0+(back?-1:1)*(cx-1)*px,y0-(cy-2)*px,z)}}

function xDetailTop(x,c){const{g,w,d,arms}=x,T=c.top,tc=c.tc_custom||TOPC[c.tc]||'#888888',t=xtone(tc,.78),z=d/2+.006,jk=c.jk>=0;if(jk)return;
 const sl=[.25,.5,.5,.3,0,.25,.5,.3,.5,0,.5,.25,.5,.5,.5,.25][T]??.25;
 /* side seams, shoulder seams and hem on every top */
 [-1,1].forEach(s=>{xb(g,.008,.56,.014,t,s*(w/2+.004),.8,0);if(T!=4&&T!=9)xb(g,.014,.008,d+.006,t,s*w*.36,1.103,0)});if(![6,9,12,14,15].includes(T))xb(g,w+.008,.025,d+.008,t,0,.525,0);
 /* sleeve hems and cuffs */
 if(sl>0&&![10,13,14].includes(T))arms.forEach(a=>xb(a,.178,.03,.228,t,0,-sl+.016,0));
 /* crew neck on tees and long sleeves */
 if([0,3,7,8].includes(T)){xb(g,w*.38,.035,.012,t,0,1.08,z);xb(g,w*.38,.012,d*.45,t,0,1.105,0)}
 if(T==0&&XDN('top')=='Classic Tee'){xb(g,.07,.022,.01,xlt(tc,.5),-w*.22,.95,z+.002);xb(g,.04,.022,.01,xlt(tc,.5),-w*.22+.035,.972,z+.002)}
 if(T==1){[-1,1].forEach(s=>{xb(g,.014,.15,.012,'#f4f4f4',s*.05,.98,z+.004);xb(g,.02,.03,.016,'#cfd3d8',s*.05,.9,z+.006);xb(g,.012,.16,.012,t,s*w*.3,.64,d/2+.016,0,0,s*.35)});xb(g,w+.012,.06,d+.012,t,0,.53,0);arms.forEach(a=>xb(a,.18,.06,.23,t,0,-.47,0));xb(g,.012,.2,.24,t,0,1.18,-d/2-.02)}
 if(T==2){xb(g,.05,.04,.016,'~#cfd3d8',0,1.06,z+.006);for(let i=0;i<8;i++)xb(g,.03,.008,.014,'#9aa0a6',0,.56+i*.065,z+.004);[-1,1].forEach(s=>xb(g,.13,.012,.012,t,s*w*.28,.66,z))}
 if(T==5){[-1,1].forEach(s=>xb(g,w*.2,.06,.016,'#f4f4f4',s*w*.1,1.06,z+.006,0,0,s*.3));[1.0,.93].forEach(y=>xb(g,.025,.025,.016,'#e8e8e8',0,y,z+.008));xb(g,.035,.045,.012,xcon(tc),-w*.24,.96,z+.002)}
 if(T==6){for(let i=0;i<3;i++){const px=(i-1)*w*.26;for(let j=0;j<5;j++)xb(g,.05,.06,.014,xlt(tc,.12),px+(j%2?.012:-.012),.62+j*.1,z+.002)}arms.forEach(a=>xb(a,.18,.07,.23,t,0,-.465,0))}
 if(T==7){const n=23,bz=-d/2-.008,px=.035;xDigit(g,2,.07,.84,bz,px,'#f4f4f4',1);xDigit(g,3,-.07,.84,bz,px,'#f4f4f4',1);xDigit(g,2,-w*.22-.03,.95,z+.004,.016,'#f4f4f4');xDigit(g,3,-w*.22+.03,.95,z+.004,.016,'#f4f4f4')}
 if(T==8)arms.forEach(a=>xb(a,.18,.05,.23,t,0,-.47,0));
 if(T==9){xb(g,.02,.6,.012,'~#cfd3d8',0,.8,d/2+.034);xb(g,w*.55,.09,d*.8,dk(tc,.85),0,1.12,0);[-1,1].forEach(s=>xb(g,.02,.3,d*.7,t,s*(w/2+.035),.98,0))}}

function xDetailJacket(x,c){const{g,w,d,arms}=x,jc=JKC[c.jk]||'#888888',t=xtone(jc,.72),z=d/2+.045,st=c.jks||0,nm=XDN('jk'),tc=c.tc_custom||TOPC[c.tc]||'#f4f4f4';
 /* the open front shows the top you are wearing instead of plain white */
 if(st!=6){const wm=M('#f4f4f4');g.children.forEach(m=>{if(m.isMesh&&m.material===wm&&Math.abs(m.position.z-(d/2+.05))<1e-6&&Math.abs(m.position.y-.8)<1e-6)m.material=M(tc)})}
 if(st>=4)return;
 [-1,1].forEach(s=>{xb(g,.014,.6,.012,'~#b8bcc2',s*w*.2,.8,z+.008);xb(g,.15,.022,.012,t,s*w*.32,.66,z)});xb(g,.04,.05,.014,'~#d0d0d0',w*.2,1.04,z+.012);
 arms.forEach(a=>xb(a,.18,.06,.232,t,0,-.47,0));if(st!=2)xb(g,w+.095,.05,d+.095,t,0,.525,0);
 if(nm=='Denim Jacket'){[-1,1].forEach(s=>{xb(g,.15,.12,.012,dk(jc,.88),s*w*.3,.95,z+.002);xb(g,.16,.04,.014,dk(jc,.75),s*w*.3,1.0,z+.004);xs(g,.018,'~#b87333',s*w*.3,.99,z+.012,6);xb(g,.006,.56,.014,'#d9a441',s*w*.12,.8,z+.002)});xb(g,w+.1,.006,d+.1,'#d9a441',0,.9,0)}
 if(nm=='Bomber Jacket'){const a=arms[0];xb(a,.03,.1,.08,t,-.09,-.15,0);xb(a,.034,.012,.06,'~#cfd3d8',-.092,-.11,0);[-1,1].forEach(s=>xb(g,.17,.06,d*.5,t,s*w*.12,1.1,d*.1))}
 if(nm=='Parka'||nm=='Zip Hoodie Jacket'){const fur=nm=='Parka';xb(g,w*.85,.06,.34,fur?'#d9c8a0':t,0,1.22,-d/2-.04);[-1,1].forEach(s=>xb(g,.06,.24,.3,fur?'#d9c8a0':t,s*w*.42,1.1,-d/2-.04))}
 if(nm=='Trench Coat'||nm=='Long Coat'){[-1,1].forEach(s=>[.95,.8,.65].forEach(y=>xs(g,.02,'#2a1a10',s*w*.27,y,z+.008,6)));if(nm=='Trench Coat'){xb(g,w+.11,.05,d+.11,dk(jc,.85),0,.62,0);xb(g,.07,.06,.014,'~#c9a227',0,.62,d/2+.06)}[-1,1].forEach(s=>xb(g,.1,.32,.012,t,s*w*.15,.94,z+.006,0,0,-s*.3))}
 if(st==3)[-1,1].forEach(s=>xb(g,.012,.6,d+.1,t,s*w*.25,.8,0))}

function xDetailBottoms(x,c){const{g,w,d,legs}=x,bt=c.bt||0,pc=c.pc_custom||PANTC[c.pc]||'#888888';if(bt==7)return;const B=xLegBox(bt,w,d);if(!B)return;const[lw,ld,lh]=B,nm=XDN('bt'),jean=/Jeans|Denim/.test(nm),st=jean?'#d9a441':xtone(pc,.72),z=ld/2+.005;
 legEach(x,(l,s)=>{xb(l,lw+.006,.045,ld+.006,xtone(pc,.8),0,-.03,0);xb(l,.006,lh-.02,.014,st,s*(lw/2+.003),-lh/2,0);
  if(bt!=5){xb(l,.012,.11,.01,st,s*lw*.32,-.1,z,0,0,s*.6);xb(l,lw*.5,.11,.01,xtone(pc,.85),0,-.12,-z);xb(l,lw*.52,.008,.012,st,0,-.068,-z-.002)}
  if(lh>=.4&&bt!=3)xb(l,lw+.006,.03,ld+.006,xtone(pc,.85),0,-lh+.03,0);
  [-.33,.33].forEach(k=>xb(l,.02,.06,.012,xtone(pc,.75),k*lw,-.04,z+.002));xb(l,.006,.16,.012,st,-s*lw*.42,-.1,z+.001)});
 if(bt!=5&&bt!=8){xb(g,w*.6,.035,d*.82,'#2a1a10',0,.49,0);xb(g,.075,.05,.016,'~#cfd3d8',0,.49,d*.41+.006);xb(g,.04,.03,.018,'#2a1a10',0,.49,d*.41+.01)}}

function xDetailShoes(x,c){const{w,d,legs}=x,sh=c.shs;if(sh>=2)return;const col=(c.sh>=0?SHC[c.sh]:null)||['#1d1d22',0],boot=col[1]==1,k=col[0],nm=c===ch?XDN('sh'):'',sw=w*.42,sd=d*.8+.1,z0=.05,con=xcon(k);
 legEach(x,(l,s)=>{const base=xShoe(l);
  if(!boot){const sole=nm=='Skate Shoes'?'#c49a6c':'#f4f4f4',top=-.4;xb(l,sw+.012,.03,sd+.012,sole,0,-.485,z0);xb(l,sw+.016,.008,sd+.016,dk(sole,.75),0,-.47,z0);
   [0,1].forEach(i=>xb(l,sw*.5,.012,.018,'#f4f4f4',0,top+.002,d*.4+.025+i*.035));xb(l,sw*.38,.02,.08,k,0,top+.01,z0-.08);xb(l,.006,.022,sd*.5,con,s*(sw/2+.003),-.455,z0+.01,.35);xb(l,sw*.5,.05,.012,xtone(k,.75),0,-.43,z0-sd/2-.004);
   if(nm=='Hi-tops'){xb(l,sw+.006,.13,sd*.62,k,0,-.34,z0-.06);xb(l,sw+.01,.03,sd*.64,'#f4f4f4',0,-.28,z0-.06);xc(l,.03,.03,.008,'#f4f4f4',s*(sw/2+.004),-.33,z0-.06,0,0,Math.PI/2,10)}
   if(nm=='Runners'){xb(l,sw+.014,.05,sd+.014,'#f4f4f4',0,-.48,z0);xb(l,sw*.7,.014,sd*.5,xlt(k,.35),0,-.398,z0+.02);xb(l,.008,.03,sd*.4,'#ffd27a',s*(sw/2+.004),-.44,z0,-.4)}}
  else{xb(l,sw+.016,.035,sd+.016,nm=='Fluffy Boots'?'#e8e0d0':'#2a1a10',0,-.49,z0);if(base)base.material=xm('!'+k);
   if(nm=='Fluffy Boots'){xb(l,sw+.04,.07,sd*.8,'#efe6d0',0,-.22,z0-.02);for(let i=0;i<3;i++)xb(l,sw+.045,.012,sd*.82,'#ddd2bd',0,-.24+i*.02,z0-.02)}
   else if(nm=='Chelsea Boots'){[-1,1].forEach(q=>xb(l,.008,.2,sd*.25,'#1a1a1a',q*(sw/2+.004),-.32,z0-.02));xb(l,.06,.06,.012,dk(k,.7),0,-.2,z0-sd/2+.01)}
   else{for(let i=0;i<4;i++)xb(l,sw*.5,.012,.02,nm=='Work Boots'?'#e6b422':'#f4f4f4',0,-.28-i*.045,z0+sd*.36-i*.01);if(nm=='Work Boots'){xb(l,sw+.004,.07,.1,dk(k,.75),0,-.45,z0+sd/2-.05);xb(l,sw+.02,.02,sd+.02,'#e6b422',0,-.465,z0)}
    xb(l,sw+.006,.03,sd*.65,dk(k,.8),0,-.225,z0-.05)}}})}

function xDetailHat(x,c){const{h}=x;if(!h||!(c.ht>=0))return;const sy=c.hts!==undefined?c.hts:[0,1,2,0,3,1,2][c.ht]??0;if(sy>=6)return;const k=(HTC[c.ht]||['#888888'])[0],t=xtone(k,.75),con=xcon(k);
 if(sy==0||sy==3){xb(h,.06,.03,.06,k,0,.455,0);xb(h,.012,.012,.645,t,0,.441,0);xb(h,.645,.012,.012,t,0,.441,0);[-1,1].forEach(s=>xs(h,.012,t,s*.2,.4,.22,4));
  xb(h,.17,.075,.01,sy==3?con:t,0,.37,.322);if(sy==3){xc(h,.045,.045,.006,'~#d4af37',.12,.322,.47,0,0,0,10);xb(h,.3,.05,.012,'#1a1a1a',0,.34,-.326)}else xb(h,.62,.012,.3,t,0,.276,.43)}
 if(sy==1){for(let i=0;i<7;i++)xb(h,.018,.1,.665,t,-.27+i*.09,.27,0);xb(h,.12,.06,.012,con,0,.27,.334)}
 if(sy==2){xb(h,.952,.008,.952,t,0,.322,0);xb(h,.8,.008,.8,t,0,.322,0);[-1,1].forEach(s=>xs(h,.014,'~#cfd3d8',s*.305,.4,0,4))}
 if(sy==4)xb(h,.1,.05,.01,con,0,.3,.325);
 if(sy==5)xb(h,.4,.02,.4,t,.06,.505,.0)}

function xDetailExtra(x,c){const{g,h,w,d}=x;if(!(c.ac>=0)||c.ac>=4)return;const k=c.acc||'#222222',t=xtone(k,.7),o=c.jk>=0?.045:0;
 if(c.ac==0&&h){[-1,1].forEach(s=>{xb(h,.04,.18,.18,'#1a1a1a',s*.305,.02,0);xc(h,.07,.07,.012,t,s*.405,.02,0,0,0,Math.PI/2,12);xb(h,.06,.1,.03,'~#b8bcc2',s*.33,.22,0)});xb(h,.5,.03,.08,'#1a1a1a',0,.385,0)}
 if(c.ac==2){for(let i=0;i<9;i++){const a=(i-4)*.2;xb(g,.035,.025,.012,'~'+k,Math.sin(a)*w*.32,1.03-Math.abs(i-4)*.012,d/2+o+.022)}xb(g,.06,.06,.012,'~'+k,0,.92,d/2+o+.024);xb(g,.03,.03,.014,'~#ffffff',0,.92,d/2+o+.03)}
 if(c.ac==3){[0,1,2].forEach(i=>xb(g,.13,.012,.055,t,.14,.86-i*.06,d/2+o+.04));for(let i=0;i<4;i++)xb(g,.02,.05,.04,k,.09+i*.033,.72,d/2+o+.04)}}

{const bc1=buildChar;buildChar=function(c){const r=bc1(c);if(c!==ch&&!c.hd)return r;
 try{const x={g:r.g,legs:r.legs,arms:r.arms,h:xHead(r.g),w:.42+c.body*.5,d:.3+c.body*.28,sk:SKIN[c.skin],c,jk:c.jk>=0,o:c.jk>=0?.045:0};
  xDetailTop(x,c);if(c.jk>=0)xDetailJacket(x,c);xDetailBottoms(x,c);xDetailShoes(x,c);xDetailHat(x,c);xDetailExtra(x,c);
 }catch(e){console.warn('clothes detail',e)}return r}}
