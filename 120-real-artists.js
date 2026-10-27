/* ===== v41.3.0: more real artists, and real artists are 10x bigger =====
   1. The most-streamed real artists (spotifystats.com top artists, Oct 2026) join the game's own roster (ART), so they can DM you and
      collab. Appended at the end of ART: saves refer to artists by index, so old saves keep pointing at the same people.
      Names only: their songs and albums in Spotifly are made up. Looks come from the real-looks table (114-real-looks.js), with new rows here.
   2. Every real artist (ART rows with a[8] set, plus the real ones in Spotifly Browse) has 10x the monthly listeners, so the top of the
      ladder is much further away. Being featured with a real artist still brings the same fan streams as before (featLis is scaled back
      for them), so collabs do not pay 10x more. Fees barely move: they come from a[3], not the listener count. */
const REAL_X=10;
{const K='#1b1b1f',BR='#4a2c1a',BL='#e3c77a',GD='#e6b422',W='#f4f4f4';
 [['Lady Gaga',6,5,'#f0e0a0',0,{t:4,tc:'#2f2f38',ac:1}],['Katy Perry',6,5,K,0,{t:4,tc:'#e84393'}],['Maroon 5',0,11,'#3a2418',1,{t:1,tc:'#2f2f38'}],['Pitbull',1,1,K,1,{t:2,tc:W,ac:1}],
  ['Sia',6,31,BL,0,{t:4,tc:W}],['Black Eyed Peas',4,1,K,1,{t:1,tc:'#2f2f38',ac:2,acc:GD}],['Daddy Yankee',7,1,K,3,{t:1,tc:'#2f2f38',ac:2,acc:GD}],['Miley Cyrus',6,5,BL,0,{t:4,tc:'#c0392b'}],
  ['Justin Timberlake',6,11,'#8b6b3a',1,{t:2,tc:'#2f2f38'}],['Sean Paul',4,1,K,3,{t:0,tc:W,ac:1}],['Chris Brown',4,12,K,1,{t:1,tc:'#c0392b',ac:2,acc:GD}],['Shreya Ghoshal',7,6,K,0,{t:4,tc:'#c2185b'}],
  ['Shawn Mendes',1,15,BR,0,{t:0,tc:W}],['Madonna',6,5,BL,0,{t:4,tc:'#2f2f38',ac:2,acc:'#c0c0c8'}],['Sam Smith',6,11,BR,0,{t:2,tc:'#9c27b0'}],['Ellie Goulding',6,5,'#e8cf7a',0,{t:4,tc:'#6f9bd1'}],
  ['Halsey',6,6,K,0,{t:1,tc:'#2f2f38'}],['Rauw Alejandro',1,12,K,1,{t:1,tc:'#e8e8ec',ac:1}],['Zara Larsson',6,5,'#e3c77a',0,{t:4,tc:'#f48fb1'}],['sombr',6,23,K,0,{t:1,tc:'#2f2f38'}],
  ['Arijit Singh',7,11,K,4,{t:2,tc:'#e8e8ec'}],['Ozuna',2,12,K,1,{t:1,tc:'#2f2f38',ac:2,acc:GD}]].forEach(a=>{const o=a[5]||{},c={skin:a[1],eyes:o.e||0,mouth:0,hair:a[2],hc:0,hc_custom:a[3],top:o.t||0,tc:0,pc:4,body:.4,hgt:.5};
  if(o.tc)c.tc_custom=o.tc;if(o.pc)c.pc_custom=o.pc;if(o.ac!=null){c.ac=o.ac;c.acc=o.acc||'#222222'}if(a[4]){c.fh=a[4];c.fhc=a[3]}if(typeof RLK=='object')RLK[a[0].toLowerCase()]=c})}
/* [name, genre, real-world monthly listeners] (before the 10x) */
const REAL_NEW=[['Bruno Mars','Pop',129.6e6],['Rihanna','Pop',116.6e6],['Justin Bieber','Pop',112.3e6],['Taylor Swift','Pop',106.7e6],['Lady Gaga','Pop',100.5e6],['Coldplay','Rock',94.3e6],
 ['Ariana Grande','Pop',93.6e6],['Bad Bunny','Latin',92.4e6],['Shakira','Latin',90.5e6],['Katy Perry','Pop',88.2e6],['Michael Jackson','Pop',86.9e6],['David Guetta','Electronic',82.8e6],['Maroon 5','Pop',80.5e6],
 ['Pitbull','Latin',78.9e6],['Dua Lipa','Pop',77.1e6],['Calvin Harris','Electronic',74.4e6],['Eminem','Rap',73.3e6],['J Balvin','Latin',71.7e6],['Kanye West','Hip-Hop',70.4e6],['Sia','Pop',69.4e6],
 ['Karol G','Latin',69.2e6],['Lana Del Rey','Pop',67.6e6],['Olivia Rodrigo','Pop',67.6e6],['SZA','R&B',67.1e6],['Post Malone','Hip-Hop',65.1e6],['Black Eyed Peas','Hip-Hop',64.2e6],['Daddy Yankee','Latin',64.1e6],
 ['Beyonce','R&B',63.5e6],['Harry Styles','Pop',62.3e6],['Travis Scott','Hip-Hop',62.1e6],['Miley Cyrus','Pop',61.6e6],['Tame Impala','Indie',60.5e6],['Justin Timberlake','Pop',60.1e6],['Sean Paul','Hip-Hop',60e6],
 ['Adele','Pop',59.9e6],['Linkin Park','Rock',57.5e6],['Arctic Monkeys','Rock',57e6],['Chris Brown','R&B',56.4e6],['Shreya Ghoshal','Pop',56.3e6],['Shawn Mendes','Pop',56e6],['Doja Cat','Pop',55.9e6],
 ['Madonna','Pop',54.7e6],['Marshmello','Electronic',54.4e6],['Sam Smith','Pop',54.3e6],['Ellie Goulding','Electronic',54.2e6],['Halsey','Pop',54.2e6],['Rauw Alejandro','Latin',53.9e6],
 ['Sabrina Carpenter','Pop',53.7e6],['Alicia Keys','R&B',53.6e6],['Zara Larsson','Pop',53.6e6],['sombr','Indie',53.4e6],['Arijit Singh','Pop',53.4e6],['Ozuna','Latin',53.1e6],['Imagine Dragons','Rock',52.7e6],['Future','Hip-Hop',52.5e6]];
{const have=new Set(ART.map(a=>String(a[0]).toLowerCase())),M=['chill','hype','formal','shy','goofy'];
 REAL_NEW.forEach(([n,g,L])=>{if(have.has(n.toLowerCase()))return;const h=brHash('real|'+n),look=(typeof realLook=='function'&&realLook(n))||lk(n);
  /* fee like the existing stars: Drake charges 200,000 at 60M listeners, scaled by the square root of size */
  ART.push([n,g,Math.round(L),Math.round(200000*Math.sqrt(L/6e7)/1000)*1000,look,M[h%5],'',1,1,.5])})}
/* the 10x: every real artist in ART, and the real artists that only appear in Spotifly Browse (the rows before the made-up ones) */
const REAL_SET=new Set();
ART.forEach(a=>{if(a[8]){a[2]=Math.round(a[2]*REAL_X);REAL_SET.add(a[0])}});
{const k=BRX.findIndex(x=>x[0]=='Drayke Monroe');BRX.slice(0,k<0?0:k).forEach(x=>{if(x[0]!='Taylor Pardee')x[2]*=REAL_X})}
if(typeof MKT!='undefined')MKT=null;if(typeof BRAL!='undefined')BRAL=null;
/* featured fan streams from a real artist stay what they were before the 10x */
{const p0=planOf;planOf=function(s){if(!s||!s.ft||!REAL_SET.has(s.ft)||s.pd===S.day)return p0.apply(this,arguments);const k=PERF.featLis;PERF.featLis=k/REAL_X;try{return p0.apply(this,arguments)}finally{PERF.featLis=k}}}
/* collab odds and fees after the 10x: a real artist DMs you as if they were about 3x (sqrt of REAL_X) bigger than before, not 10x,
   so the stars are rarer than before but still reachable; they charge about 3x more when you message them;
   and what an artist pays you for your audience is priced from the roster as it was before the 10x */
const REAL_DM=Math.sqrt(REAL_X);
const realSize=(fn,f)=>{const c=[];ART.forEach(a=>{if(a[8]&&REAL_SET.has(a[0])){c.push([a,a[2]]);a[2]=Math.round(a[2]*f)}});try{return fn()}finally{c.forEach(([a,v])=>a[2]=v)}};
/* the who-may-DM gate (dmGateOK) is checked at their real size first, so the scaling never lets a megastar slip under DM_GAP */
{const w0=dmWeight;dmWeight=function(i){if(!dmGateOK(i))return 0;const t=this,g=arguments;return realSize(()=>w0.apply(t,g),REAL_DM/REAL_X)}}
let MKT_R=null;/* fee curve of the pre-10x roster, cached */
{const c0=collabFee;collabFee=function(i,dir,k){const a=ART[i],real=a&&a[8]&&REAL_SET.has(a[0]),t=this,g=arguments;
 const m0=MKT;MKT=MKT_R;let v;try{v=realSize(()=>c0.apply(t,g),1/REAL_X)}finally{MKT_R=MKT;MKT=m0}
 return real&&dir!='a'?Math.max(3,nr(v*REAL_DM)):v}}
