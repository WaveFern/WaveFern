/* ---------- more artists, and every save plays differently ----------
   1. Sixteen more fictional artists across genres and sizes, appended to the end of ART (saves refer to artists by index).
   2. Each save rolls its own DM personality per artist (S.dmSeed, made on first use, so older saves just get one):
      about 1 in 7 artists never DMs you in that save, the rest are anywhere from 0.3x to 3.3x as keen as normal.
      You can still message any of them yourself. The friends who DM early (John Dodds, Sochi, Gutch, Billy Butler, Amir, Alex) are left as they are.
   3. Some artists never DM anyone (DM_NEVER). */
[
 ['Polly Parade','Pop',90,'skin=1 hair=15 hc=#e8a33a eyes=0 mouth=3 top=1 tc=#f39ac2 pc=#2c3e50 body=20 hgt=45','goofy'],
 ['Tobi Lagos','Hip-Hop',700,'skin=6 hair=1 hc=#0f0f10 eyes=0 mouth=0 top=0 tc=#27ae60 pc=#1e1e24 body=40 hgt=55','hype'],
 ['Wren Holloway','Folk',3000,'skin=0 hair=19 hc=#8a4b22 eyes=5 mouth=0 top=2 tc=#7a5a3a pc=#3a3a40 body=25 hgt=60','shy'],
 ['Static Bloom','Electronic',11000,'skin=2 hair=13 hc=#6a3fd1 eyes=4 mouth=0 top=1 tc=#111114 pc=#111114 body=30 hgt=50','chill'],
 ['Rosa Quintero','Latin',35000,'skin=3 hair=19 hc=#1b1b1f eyes=0 mouth=3 top=0 tc=#c0392b pc=#111114 body=30 hgt=55','hype'],
 ['The Late Trains','Rock',90000,'skin=0 hair=2 hc=#3a2416 eyes=0 mouth=0 top=1 tc=#2f2f38 pc=#2c3e50 body=50 hgt=65','goofy'],
 ['Noor Haddad','R&B',250000,'skin=3 hair=19 hc=#151517 eyes=8 mouth=0 top=2 tc=#d4af37 pc=#1e1e24 body=20 hgt=60','formal'],
 ['Hank Calloway','Country',600000,'skin=0 hair=2 hc=#9a7a4a eyes=0 mouth=0 top=0 tc=#8b4513 pc=#2c3e50 body=65 hgt=75','chill'],
 ['Mila Sato','Lo-fi',1200000,'skin=1 hair=15 hc=#151517 eyes=5 mouth=0 top=1 tc=#a3c4f3 pc=#3a3a40 body=15 hgt=45','shy'],
 ['DJ Kova','Electronic',4000000,'skin=4 hair=1 hc=#0f0f10 eyes=4 mouth=0 top=1 tc=#111114 pc=#111114 body=45 hgt=65','hype'],
 ['Ivy Marchetti','Indie',9000000,'skin=0 hair=13 hc=#b5523b eyes=0 mouth=3 top=2 tc=#2e4a3a pc=#1e1e24 body=20 hgt=55','chill'],
 ['Zion Carter','R&B',30000000,'skin=5 hair=2 hc=#151517 eyes=0 mouth=0 top=2 tc=#ffffff pc=#1e1e24 body=45 hgt=70','formal'],
 ['Lola Vega','Latin',70000000,'skin=2 hair=19 hc=#3a2416 eyes=8 mouth=3 top=1 tc=#e84393 pc=#111114 body=20 hgt=55','hype'],
 ['Grey Harbour','Rock',140000000,'skin=0 hair=15 hc=#1b1b1f eyes=4 mouth=0 top=0 tc=#2f2f38 pc=#111114 body=40 hgt=70','shy'],
 ['Skyler Moss','Pop',260000000,'skin=1 hair=15 hc=#f0d27a eyes=0 mouth=3 top=1 tc=#74b9ff pc=#ffffff body=20 hgt=60','goofy'],
 ['Omari Steele','Hip-Hop',450000000,'skin=6 hair=17 hc=#0f0f10 eyes=5 mouth=0 top=2 tc=#111114 pc=#111114 body=55 hgt=75','formal']
].forEach(r=>{const L=r[2],fee=L>=1e6?Math.round(100000*Math.sqrt(L/15e6)/500)*500:Math.max(30,Math.round(6*Math.pow(L,.6)/10)*10);
 ART.push([r[0],r[1],L,fee,lookFromCode(r[3]),r[4],'',0,0,1])});
if(typeof MKT!='undefined')MKT=null;if(typeof MKT_R!='undefined')MKT_R=null;

const DM_NEVER=new Set(['Michael Jackson']),DM_FRIENDS=new Set(['John Dodds','Sochi Irukwu','Gutch','Billy Butler','Amir Suenu','Alex Arbuckle']);
function dmTaste(i){const a=ART[i];if(!a)return 1;if(DM_NEVER.has(a[0]))return 0;if(DM_FRIENDS.has(a[0])||!S)return 1;
 if(!S.dmSeed)S.dmSeed=(Math.random()*1e9|0)+1;const r=fRng(fHash('dm|'+S.dmSeed+'|'+a[0])),x=r();if(x<1/7)return 0;return Math.exp((r()-.5)*2.4)}
{const w0=dmWeight;dmWeight=function(i){const t=dmTaste(i);return t?w0.apply(this,arguments)*t:0}}
