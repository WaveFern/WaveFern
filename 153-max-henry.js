/* ---------- v43.9.0: two more collaborators, Max You and Henry Dodds ----------
   Appended to the end of ART (saves refer to artists by index), same fee scaling as 128-dm-variety.js. */
[
 ['Max You','Pop',2500,'skin=0 hair=2 hc=#e0662a eyes=0 mouth=3 top=0 tc=#ffffff pc=#f2f2f2 body=35 hgt=55','goofy'],
 ['Henry Dodds','Indie',20000,'skin=1 hair=13 hc=#5a3a22 eyes=0 mouth=0 top=2 tc=#2e4a6a pc=#3a3a40 body=40 hgt=65','chill']
].forEach(r=>{const L=r[2],fee=L>=1e6?Math.round(100000*Math.sqrt(L/15e6)/500)*500:Math.max(30,Math.round(6*Math.pow(L,.6)/10)*10);
 ART.push([r[0],r[1],L,fee,lookFromCode(r[3]),r[4],'',0,0,1])});
if(typeof MKT!='undefined')MKT=null;if(typeof MKT_R!='undefined')MKT_R=null;
