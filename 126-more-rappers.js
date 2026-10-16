/* ---------- more fictional rappers, filling the listener gaps between the indie artists (up to ~350k) and the real stars ----------
   Appended to the end of ART (saves refer to artists by index). Fee scales like Rowan's: 100,000 at 15M, by the square root of size. */
[
 ['Kezzy Vane','Rap',800000,'skin=4 hair=13 hc=#151517 eyes=0 mouth=0 top=1 tc=#c0392b pc=#1e1e24 body=45 hgt=50','hype'],
 ['Lil Brickz','Hip-Hop',1500000,'skin=3 hair=17 hc=#1b1b1f eyes=4 mouth=3 top=0 tc=#f4f4f4 pc=#3f6fa8 body=30 hgt=40','goofy'],
 ['Marcus Flint','Rap',3000000,'skin=5 hair=1 hc=#0f0f10 eyes=0 mouth=0 top=2 tc=#2f2f38 pc=#2c3e50 body=60 hgt=70','formal'],
 ['Yung Halo','Hip-Hop',6000000,'skin=1 hair=15 hc=#e8d27a eyes=8 mouth=0 top=1 tc=#8e44ad pc=#111114 body=20 hgt=55','chill'],
 ['Cass Rivers','Rap',22000000,'skin=2 hair=19 hc=#3a2416 eyes=0 mouth=3 top=0 tc=#16a085 pc=#1e1e24 body=25 hgt=65','shy'],
 ['Jaylo Banks','Hip-Hop',50000000,'skin=4 hair=2 hc=#151517 eyes=5 mouth=0 top=1 tc=#d4af37 pc=#111114 body=50 hgt=60','hype'],
 ['King Oduya','Rap',110000000,'skin=6 hair=1 hc=#0f0f10 eyes=0 mouth=0 top=2 tc=#7b1f2b pc=#1e1e24 body=55 hgt=75','formal'],
 ['Sable Knox','Rap',220000000,'skin=0 hair=13 hc=#111114 eyes=4 mouth=0 top=0 tc=#111114 pc=#2f2f38 body=35 hgt=60','chill'],
 ['Rhyme Dalton','Hip-Hop',400000000,'skin=3 hair=2 hc=#2a1a10 eyes=8 mouth=3 top=1 tc=#ffffff pc=#1e1e24 body=40 hgt=70','goofy']
].forEach(r=>ART.push([r[0],r[1],r[2],Math.round(100000*Math.sqrt(r[2]/15e6)/500)*500,lookFromCode(r[3]),r[4],'',0,0,1]));
if(typeof MKT!='undefined')MKT=null;if(typeof MKT_R!='undefined')MKT_R=null;
