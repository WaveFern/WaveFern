/* ===== v26.39: Beats, a procedural beat engine (Web Audio; drums and most voices are made in code, melodic one-shots can be samples from audio/oneshots) =====
   Every song gets its own beat: the genre gives a list of beat styles (boom bap, trap, drill, house, punk...),
   and a seed from the song (its id, or the seed saved when it was recorded) picks the style, key, scale,
   tempo, chord progression, drum pattern variants, kit tuning and a hook melody. Same song = same beat.
   API:
     Beats.play(song | {genre, seed, style}, {owner, alive, form:'song'|'live'|'rec', intensity, fadeIn, pads})
     Beats.stop(fade)  Beats.setIntensity(0..1)  Beats.setVolume(0..1)  Beats.playing()  Beats.current()
     Beats.plan(song)  Beats.beat() (quarter-note position, -1 if idle)  Beats.bpm()  Beats.styles  Beats.render(song, seconds)
   Volume follows the Music slider (VOL, M mutes). Audio only starts after the player has clicked or pressed a key,
   pauses with the pause menu or a hidden tab, and stops when its owner (recording, festival set, Spotifly) ends. */
var Beats=(function(){
'use strict';
/* ---------- small helpers ---------- */
const hash=s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const mix32=h=>{h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);return(h^h>>>16)>>>0};
const rng=seed=>{let a=mix32((seed>>>0)+0x9E3779B9)||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const mtof=m=>440*Math.pow(2,(m-69)/12);
const SC={min:[0,2,3,5,7,8,10],maj:[0,2,4,5,7,9,11],dor:[0,2,3,5,7,9,10],mix:[0,2,4,5,7,9,10],hmin:[0,2,3,5,7,8,11],phr:[0,1,3,5,7,8,10]};
const SCN={min:'minor',maj:'major',dor:'dorian',mix:'mixolydian',hmin:'harmonic minor',phr:'phrygian'};
/* v26.98: songs only use the major and minor scales; the other modes a style lists fold into the nearer of the two */
const MM={min:'min',maj:'maj',dor:'min',phr:'min',hmin:'min',mix:'maj'};
const KEYN=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const semi=(sc,d)=>{const o=Math.floor(d/7),i=((d%7)+7)%7;return SC[sc][i]+12*o};

/* ---------- chord progressions (scale degrees, 0 = tonic) ---------- */
const PR={
 min:[[0,5,2,6],[0,3,5,4],[0,6,5,6],[0,3,0,4],[5,6,0,0],[0,5,3,4],[0,2,3,5]],
 mind:[[0,0,5,5],[0,3,0,3],[0,5,0,6],[0,6,0,5],[0,0,3,4]],
 maj:[[0,4,5,3],[5,3,0,4],[0,5,3,4],[3,0,4,5],[0,3,5,4],[0,3,0,4]],
 jazz:[[1,4,0,5],[0,5,1,4],[3,2,1,0],[1,4,0,0],[3,4,2,5]],
 dvamp:[[0,3,0,3],[0,1,0,1],[0,3,1,4],[0,6,3,0]],
 cty:[[0,3,4,0],[0,0,3,4],[0,3,0,4],[0,5,3,4],[0,4,3,0]],
 rock:[[0,6,3,0],[0,3,4,3],[0,5,3,4],[0,2,3,4],[0,3,6,3]],
 rmin:[[0,5,6,0],[0,2,6,3],[0,6,5,4],[0,0,5,6],[0,3,6,5]]};

/* ---------- drum kits (seed nudges every number a little) ---------- */
const KIT={
 dusty:{k:{f0:115,f1:46,pd:.06,dec:.42,cl:.18,dr:.35},s:{f:180,tn:.5,nf:1700,nq:.7,nz:.75,dec:.2,rv:.12},h:{f:6500,cd:.05,od:.3,v:.26},c:{f:1100,dec:.16}},
 b808:{k:{f0:140,f1:44,pd:.05,dec:.55,cl:.1,dr:0},s:{f:230,tn:.35,nf:2600,nq:.6,nz:.8,dec:.17,rv:.15},h:{f:8800,cd:.035,od:.32,v:.24},c:{f:1200,dec:.18}},
 trap:{k:{f0:160,f1:48,pd:.035,dec:.3,cl:.35,dr:.2},s:{f:240,tn:.3,nf:3000,nq:.5,nz:.9,dec:.15,rv:.18},h:{f:9500,cd:.03,od:.25,v:.22},c:{f:1300,dec:.2}},
 909:{k:{f0:190,f1:50,pd:.03,dec:.32,cl:.5,dr:.25},s:{f:200,tn:.4,nf:3500,nq:.4,nz:.9,dec:.2,rv:.18},h:{f:9000,cd:.04,od:.35,v:.22},c:{f:1150,dec:.22}},
 rock:{k:{f0:120,f1:56,pd:.03,dec:.26,cl:.7,dr:.1},s:{f:195,tn:.55,nf:2400,nq:.5,nz:1,dec:.24,rv:.32},h:{f:7200,cd:.07,od:.45,v:.28},c:{f:1100,dec:.2}},
 soft:{k:{f0:100,f1:48,pd:.06,dec:.36,cl:.08,dr:0,v:.85},s:{f:190,tn:.4,nf:2200,nq:.6,nz:.5,dec:.15,rv:.3},h:{f:8000,cd:.035,od:.25,v:.17},c:{f:1000,dec:.14}},
 lofi:{k:{f0:105,f1:45,pd:.07,dec:.38,cl:.05,dr:.4},s:{f:175,tn:.55,nf:1500,nq:.8,nz:.6,dec:.18,rv:.1},h:{f:6000,cd:.045,od:.25,v:.2},c:{f:900,dec:.14}},
 brush:{k:{f0:95,f1:50,pd:.05,dec:.3,cl:.05,dr:0,v:.8},s:{f:0,tn:0,nf:3800,nq:.4,nz:.5,dec:.13,rv:.15},h:{f:7000,cd:.04,od:.3,v:.17},c:{f:1000,dec:.14}},
 techno:{k:{f0:170,f1:45,pd:.04,dec:.45,cl:.4,dr:.5},s:{f:210,tn:.3,nf:2800,nq:.5,nz:.8,dec:.18,rv:.25},h:{f:9200,cd:.03,od:.22,v:.22},c:{f:1250,dec:.25}},
 dnb:{k:{f0:180,f1:55,pd:.025,dec:.22,cl:.6,dr:.2},s:{f:240,tn:.45,nf:3200,nq:.5,nz:.9,dec:.16,rv:.15},h:{f:9500,cd:.03,od:.25,v:.22},c:{f:1200,dec:.18}},
 gated:{k:{f0:150,f1:50,pd:.04,dec:.3,cl:.4,dr:.15},s:{f:185,tn:.5,nf:2000,nq:.5,nz:1,dec:.26,rv:.75},h:{f:8500,cd:.04,od:.3,v:.22},c:{f:1100,dec:.2}}};

/* ---------- instruments ----------
   t:'o' oscillator voice (o = partials [wave, ratio, cents, gain]), t:'fm' two-operator FM (keys, bells),
   t:'ks' plucked string (Karplus-Strong, ds = distorted guitar), t:'808' sliding sub, t:'cb' pitched cowbell */
const INS={
 bass:{t:'o',o:[['sawtooth',1,0,.6],['sine',1,0,1]],lp:520,le:2,ld:.15,q:2,a:.004,d:.3,s:.6,r:.06},
 round:{t:'o',o:[['sine',1,0,1],['triangle',1,0,.4]],lp:900,a:.006,d:.4,s:.7,r:.08},
 sub:{t:'o',o:[['sine',1,0,1],['triangle',2,0,.08]],lp:2000,a:.01,s:.95,r:.08},
 upright:{t:'o',o:[['triangle',1,0,1],['sine',1,0,.7]],lp:700,le:1.5,ld:.08,a:.005,d:.35,s:.25,r:.08},
 funk:{t:'o',o:[['square',1,0,.5],['sine',1,0,.9]],lp:600,le:3,ld:.12,q:4,a:.003,d:.2,s:.5,r:.05,gl:.05},
 pluckb:{t:'o',o:[['sawtooth',1,0,.7],['sine',.5,0,.8]],lp:450,le:4,ld:.1,q:3,a:.002,d:.18,s:.3,r:.05},
 pick:{t:'o',o:[['sawtooth',1,0,.6],['sine',1,0,.9]],lp:800,le:1.5,ld:.1,a:.003,d:.25,s:.5,r:.05},
 acid:{t:'o',o:[['sawtooth',1,0,1]],lp:280,le:7,ld:.18,q:13,a:.003,d:.25,s:.6,r:.04,gl:.06},
 reese:{t:'o',o:[['sawtooth',1,-14,.8],['sawtooth',1,14,.8],['sine',1,0,1]],lp:420,q:1.5,a:.01,s:1,r:.08},
 wob:{t:'o',o:[['sawtooth',1,-8,.8],['square',1,8,.5],['sine',1,0,1]],lp:280,q:6,a:.005,s:1,r:.05,wob:1},
 '808':{t:'808',dec:1.5,dr:2.2},
 epiano:{t:'fm',ra:1,ix:1.1,id:.5,ixs:.15,dec:2.4,r:.25,tr:1},
 piano:{t:'fm',ra:1,ix:1.9,id:.25,ixs:.1,dec:2.2,r:.2,p2:.18},
 bell:{t:'fm',ra:3.5,ix:2.6,id:.8,ixs:.1,dec:2.2,r:.6},
 pbell:{t:'fm',ra:2,ix:2,id:.35,ixs:.2,dec:1.3,r:.3},
 mbox:{t:'fm',ra:5,ix:1.4,id:.2,ixs:.1,dec:1.5,r:.5},
 marimba:{t:'fm',ra:4,ix:1.8,id:.04,ixs:.05,dec:.45,r:.1},
 organ:{t:'o',o:[['sine',1,0,1],['sine',2,0,.55],['sine',3,0,.35],['sine',4,0,.2]],lp:5000,a:.006,s:1,r:.05,vib:4},
 pad:{t:'o',o:[['sawtooth',1,-9,1],['sawtooth',1,0,1],['sawtooth',1,9,1]],lp:1500,a:.35,d:.5,s:.85,r:.7},
 strings:{t:'o',o:[['sawtooth',1,-12,1],['sawtooth',1,4,1],['sawtooth',2,12,.3]],lp:2600,a:.22,s:.9,r:.5,vib:6},
 choir:{t:'o',o:[['triangle',1,-7,1],['triangle',1,7,1],['sawtooth',1,0,.25]],lp:1100,q:3,a:.3,s:.9,r:.6,vib:8},
 super:{t:'o',o:[['sawtooth',1,-17,1],['sawtooth',1,0,.8],['sawtooth',1,17,1]],lp:5000,a:.006,d:.3,s:.75,r:.25},
 stab:{t:'o',o:[['sawtooth',1,-7,1],['sawtooth',1,7,1]],lp:2400,le:2,ld:.12,a:.003,d:.22,s:0,r:.08},
 brass:{t:'o',o:[['sawtooth',1,-5,1],['sawtooth',1,5,1]],lp:1100,le:2.2,ld:.18,a:.03,d:.3,s:.75,r:.12,vib:6},
 saw:{t:'o',o:[['sawtooth',1,-6,1],['sawtooth',1,6,1]],lp:3200,le:.8,ld:.2,a:.008,s:.75,r:.15,vib:10},
 square:{t:'o',o:[['square',1,0,1]],lp:2800,a:.006,s:.75,r:.1,vib:12},
 sine:{t:'o',o:[['sine',1,0,1],['triangle',2,0,.15]],lp:4000,a:.03,s:.9,r:.15,vib:10},
 flute:{t:'o',o:[['sine',1,0,1],['triangle',1,0,.3]],lp:3000,a:.07,s:.85,r:.12,vib:14},
 whine:{t:'o',o:[['sine',1,0,1],['sawtooth',1,0,.08]],lp:3000,a:.02,s:.9,r:.15,vib:25,gl:.09},
 steel:{t:'o',o:[['sine',1,0,1],['triangle',1,0,.5]],lp:2400,a:.02,d:.8,s:.5,r:.3,vib:18,gl:.12},
 fiddle:{t:'o',o:[['sawtooth',1,0,1]],lp:2600,q:2,a:.05,s:.85,r:.12,vib:22},
 lead:{t:'o',o:[['sawtooth',1,-5,1],['square',1,5,.6]],lp:2800,a:.01,s:.85,r:.15,vib:18,ds:1},
 pluck:{t:'o',o:[['sawtooth',1,-6,1],['square',1,6,.5]],lp:900,le:5,ld:.08,a:.002,d:.18,s:0,r:.1},
 cowbell:{t:'cb'},
 gtr:{t:'ks',dec:1.6,br:.22},
 nylon:{t:'ks',dec:1.3,br:.42},
 strum:{t:'ks',dec:1.4,br:.3,st:1},
 banjo:{t:'ks',dec:.55,br:.08},
 twang:{t:'ks',dec:1.1,br:.12},
 mute:{t:'ks',dec:.14,br:.35},
 dist:{t:'ks',dec:2.6,br:.18,ds:1},
 chug:{t:'ks',dec:.22,br:.25,ds:1}};

/* ---------- beat styles per genre ----------
   drum letters: k kick, s snare, c clap, n snap, h hat, o open hat, r rim, p shaker, b cowbell, y ride, t tom
   drum steps: . rest, x hit, X accent, g ghost, r hat roll. A list picks one per song; 32 characters = 2 bars.
   bass/chords: x root/chord, o octave, 5 fifth, 3 third, 7 seventh, b approach, u up-strum, - hold. bs.p 'k' follows the kick.
   arp (ar.p): digits pick chord tones (higher digits go up an octave). ld: hook melody (d density, all = also in verses). */
const BB='....X.......X...',HT='........X.......',H8='x.x.x.x.x.x.x.x.',HA='X.x.X.x.X.x.X.x.',FOUR='X...X...X...X...',OFF='..x...x...x...x.',G16='.g.g.g.g.g.g.g.g',SH='xgxgxgxgxgxgxgxg';
const STY={
'Hip-Hop':[
 {n:'Boom Bap',bpm:[86,94],sw:.16,sc:['min','dor'],kit:'dusty',dr:{k:['X.....x...x.....','X......x..x..x..','X.x.......x..x..X......x..x.....'],s:[BB,'....X..g....X...'],h:[HA,'X.xgX.x.X.xgX.x.']},bs:{i:'bass',p:'k',o:36},ch:{i:'piano',x:7,p:['x-----x-...x----','x--x---.x--x---.'],o:62},ld:{i:'brass',d:.22,o:72},fill:'sn',fx:{vinyl:.4,verb:.18}},
 {n:'Jazz Rap',bpm:[86,94],sw:.28,sc:'dor',pr:'dvamp',kit:'dusty',dr:{k:['X.........x.....','X.......x.x.....'],s:BB,y:'X...x.xgX...x.xg',h:'....x.......x...'},bs:{i:'upright',p:['x...5...o...3...','x.....x.5...x...'],o:36},ch:{i:'epiano',x:9,p:['x-------.....x--','x-----x-------..'],o:62},ld:{i:'flute',d:.25,o:72},fill:'sn',fx:{vinyl:.5,verb:.22}},
 {n:'G-Funk',bpm:[90,97],sw:.1,sc:['min','dor'],pr:['min','dvamp'],kit:'b808',dr:{k:['X..x....x.x.....','X..x..x...x..x..'],c:BB,h:'x.xxx.xxx.xxx.xx',o:'..............x.'},bs:{i:'funk',p:['x..x.o..x..x5...','x...x.oxx..x.5..'],o:34},ch:{i:'pad',x:7,p:'x---------------',o:60},ld:{i:'whine',d:.3,o:79},fill:'sn',fx:{verb:.25}},
 {n:'Soul Chop',bpm:[80,88],sw:.18,sc:'min',kit:'dusty',dr:{k:['X.x.......X..x..','X.x....x..X.....'],s:BB,h:H8,o:'..............x.'},bs:{i:'bass',p:'k',o:36},ch:{i:'stab',x:7,p:['x..x......x.x...','x.x...x..x..x...'],o:63},ld:{i:'strings',d:.18,o:72},fill:'sn',fx:{vinyl:.6,verb:.2,sat:2}},
 {n:'Southern Bounce',bpm:[96,104],sc:'min',pr:'mind',kit:'b808',dr:{k:['X..x..x.X..x....','X..x..x...x.x...'],c:BB,h:H8,b:['..x.....x.x.....','']},bs:{i:'808',p:'k',o:31,sl:.15},ch:{i:'organ',x:3,p:'x...x...x...x...',o:60},ld:{i:'square',d:.3,o:72},fill:'roll'},
 {n:'Breakbeat',bpm:[94,102],sw:.08,sc:['dor','min'],pr:'dvamp',kit:'rock',dr:{k:'X.x.......xX....X.x.......x.....',s:'....X..g.g..X..g....X..g.g..X...',h:H8,o:'..............x.'},bs:{i:'funk',p:'x.xo..x..x.5x...',o:36},ch:{i:'organ',x:7,p:['x-..x-..........','x--.....x--.....'],o:60},ld:{i:'brass',d:.25,o:72},fill:'tom'}],
'Rap':[
 {n:'Trap',bpm:[136,150],sc:['min','hmin','phr'],pr:'mind',cpb:.5,kit:'trap',dr:{k:['X......x..X.....','X.....x...x..x..X......x..x.....'],c:HT,h:['x.x.x.x.x.xrx.x.','x.x.x.xrx.x.x.x.x.x.xrx.x.rrx.x.'],o:['','..............x.']},bs:{i:'808',p:'k',o:30,sl:.3,oc:.15},ch:{i:'pad',x:3,p:'x---------------',o:62},ld:{i:'bell',d:.45,o:77,all:1},fill:'stop'},
 {n:'UK Drill',bpm:[140,145],sc:['hmin','min'],pr:'mind',cpb:.5,kit:'trap',dr:{k:['X.........X.....','X.........X.x...'],s:['........X.....x.........X.......','........X...............X.....x.'],h:['x..x..x.x..x..x.','x..x..x...x..x..x..x..x.x..rx.x.'],r:'...x......x.....'},bs:{i:'808',p:'x.....x...x.....x...x.....x.x...',o:30,sl:.75,oc:.2},ch:{i:'strings',x:3,p:'x---------------',o:62},ld:{i:'piano',d:.35,o:72,all:1},fill:'stop'},
 {n:'NY Drill',bpm:[140,146],sc:'hmin',pr:'mind',cpb:.5,kit:'trap',dr:{k:['X..x......x.....','X.........x..x..'],s:'........X.....x.........X.......',h:'x..x..x.x..x..x.',p:'..x...x...x...x.'},bs:{i:'808',p:'k',o:30,sl:.9,oc:.25},ch:{i:'choir',x:3,p:'x---------------',o:62},ld:{i:'bell',d:.3,o:77,all:1},fill:'stop'},
 {n:'Rage',bpm:[150,162],sc:'min',pr:'mind',kit:'trap',kv:{k:{dr:.6}},dr:{k:'X..x..x...x..x..',c:BB,h:['xxxxxxxxxxxxrxxx','x.xxx.xxx.xxrxxx']},bs:{i:'808',p:'k',o:30,sl:.2,dr:4},ch:{i:'pad',x:3,p:'x---------------',o:60},ld:{i:'super',d:.55,o:72,all:1},fill:'stop',fx:{sat:1.6}},
 {n:'Plugg',bpm:[140,155],sc:'maj',pr:'maj',cpb:.5,kit:'b808',dr:{k:'X.....x...X.....',c:HT,h:H8},bs:{i:'808',p:'k',o:31,sl:.2,dr:1.2},ch:{i:'pad',x:7,p:'x---------------',o:62},ld:{i:'pbell',d:.5,o:79,all:1},fill:'roll'},
 {n:'Phonk',bpm:[128,140],sc:'phr',pr:'mind',kit:'b808',kv:{k:{dr:.5}},dr:{k:'X..x..x...X..x..',c:BB,h:H8,o:OFF},bs:{i:'808',p:'k',o:31,sl:.25,dr:3.5},ld:{i:'cowbell',d:.65,o:72,all:1},fill:'roll',fx:{vinyl:.4,sat:2.5}}],
'Pop':[
 {n:'Dance Pop',bpm:[118,124],sc:['maj','min'],kit:'909',dr:{k:FOUR,c:BB,o:OFF,h:G16},bs:{i:'pluckb',p:['..x...x...x...x.','x.xo..x.x.xo..x.'],o:36},ch:{i:'super',x:3,p:['x..x..x...x..x..','x-..x-..x-..x-..'],o:64},ld:{i:'saw',d:.45,o:74},side:.6,crash:1,fill:'drop',fx:{dly:1,verb:.2}},
 {n:'Synth-pop',bpm:[108,118],sc:['min','maj'],kit:'gated',dr:{k:'X.......X.x.....',s:BB,h:H8},bs:{i:'pluckb',p:['x.x.x.x.x.x.x.x.','x.o.x.o.x.o.x.o.'],o:36},ch:{i:'pad',x:3,p:'x-------x-------',o:62},ar:{i:'pluck',p:'0120',r:1,o:67},ld:{i:'square',d:.4,o:74},crash:1,fill:'sn',fx:{dly:1,verb:.3}},
 {n:'Pop Ballad',bpm:[66,76],sc:'maj',kit:'soft',dr:{k:'X.......x.......',s:BB},bs:{i:'round',p:'x-------x-------',o:36},ch:{i:'strings',x:3,p:'x---------------',o:60},ar:{i:'piano',p:'01210121',r:2,o:62},ld:{i:'bell',d:.3,o:79},crash:1,fill:'sn',fx:{verb:.35,rt:2.6}},
 {n:'Tropical',bpm:[98,106],sc:'maj',kit:'soft',dr:{k:FOUR,c:BB,p:SH,o:OFF},bs:{i:'sub',p:['x.....x.x.......','x..x..x.x.......'],o:36},ch:{i:'marimba',x:3,p:['..x...x...x..xx.','x..x..x...x..x..'],o:64},ld:{i:'flute',d:.4,o:74},side:.4,fill:'drop',fx:{dly:1,verb:.25}},
 {n:'Bedroom Pop',bpm:[86,98],sw:.08,sc:'maj',kit:'soft',dr:{k:'X......x..X.....',s:BB,h:H8},bs:{i:'round',p:'x.....x.x.....x.',o:36},ch:{i:'gtr',x:7,p:['x.....x.x.....x.','x..x..x...x..x..'],o:60},ld:{i:'sine',d:.35,o:72},fill:'sn',fx:{lp:6500,wob:.5,verb:.3}},
 {n:'Disco Pop',bpm:[112,120],sc:['min','dor'],kit:'909',dr:{k:FOUR,c:BB,h:SH,o:OFF},bs:{i:'funk',p:'x.o.x.o.x.o.x.o.',o:36},ch:{i:'strings',x:7,p:'x-------x-------',o:62},ar:{i:'mute',p:'.0.2.1.2.0.2.1.2',r:1,o:64},ld:{i:'saw',d:.4,o:76},crash:1,fill:'sn',fx:{verb:.22}}],
'Rock':[
 {n:'Garage Rock',bpm:[130,145],sc:['mix','maj','min'],kit:'rock',dr:{k:['X.......X.x.....','X.x.....X.x.....'],s:BB,h:H8},bs:{i:'pick',p:H8,o:40},ch:{i:'dist',x:5,p:H8,o:47},ld:{i:'lead',d:.3,o:72},crash:1,fill:'tom'},
 {n:'Punk',bpm:[165,185],sc:'maj',kit:'rock',dr:{k:FOUR,s:'..X...X...X...X.',y:H8},bs:{i:'pick',p:H8,o:40},ch:{i:'dist',x:5,p:H8,o:47},crash:1,fill:'sn'},
 {n:'Arena Rock',bpm:[108,120],sc:['maj','mix'],kit:'rock',dr:{k:'X.......X.......',s:BB,h:H8},bs:{i:'pick',p:H8,o:40},ch:{i:'dist',x:5,p:'x-------x-------',o:47},ld:{i:'lead',d:.35,o:74},crash:1,fill:'tom',fx:{verb:.35}},
 {n:'Hard Rock Riff',bpm:[96,110],sc:['min','phr'],pr:'rmin',kit:'rock',dr:{k:'X.x.....X.x.x...',s:BB,h:H8},bs:{i:'pick',p:'x.xx.x.xx.x.x...',o:40},ch:{i:'chug',x:5,p:'x.xx.x.xx.x.x...',o:45},ld:{i:'lead',d:.25,o:72},crash:1,fill:'tom'},
 {n:'Indie Rock',bpm:[118,130],sc:'maj',kit:'rock',dr:{k:'X.....x.X.......',s:BB,h:H8},bs:{i:'pick',p:H8,o:40},ch:{i:'gtr',x:3,p:'x.......x.......',o:60},ar:{i:'gtr',p:['01232123','02130213'],r:2,o:64},fill:'sn'},
 {n:'Grunge',bpm:[88,100],sc:['min','phr'],pr:'rmin',kit:'rock',dr:{k:'X.....X.X.......',s:BB,h:H8},bs:{i:'pick',p:'x-x-x-x-x-x-x-x-',o:40},ch:{i:'dist',x:5,p:'x-----x-x-------',o:47},ld:{i:'lead',d:.2,o:72},crash:1,fill:'tom'}],
'R&B':[
 {n:'Slow Jam',bpm:[62,72],sw:.14,sc:['maj','dor'],pr:'jazz',kit:'soft',dr:{k:'X......x..X.....',n:BB,h:'..x...x...x.x.x.'},bs:{i:'sub',p:'x-----x...x-----',o:36},ch:{i:'epiano',x:9,p:'x-------x-------',o:62},ld:{i:'sine',d:.3,o:74},fx:{verb:.35,rt:2.4}},
 {n:'Neo-Soul',bpm:[80,92],sw:.3,sc:'dor',pr:['dvamp','jazz'],kit:'dusty',dr:{k:'X.....x...x..x..',s:'....X..g....X.g.',h:'x.xxx.xxx.xxx.xx'},bs:{i:'round',p:'x..x.5..x..o..3.',o:36},ch:{i:'epiano',x:9,p:['x...x..x.....x..','x-----x-..x-----'],o:62},ld:{i:'sine',d:.28,o:74},fill:'sn',fx:{verb:.3}},
 {n:'Trap Soul',bpm:[120,136],sc:['min','dor'],pr:'mind',cpb:.5,kit:'trap',kv:{k:{dec:1.2}},dr:{k:'X.........x.....',n:HT,h:'x.x.x.x.x.xrx.x.'},bs:{i:'808',p:'k',o:31,sl:.25,dr:1.2},ch:{i:'pad',x:9,p:'x---------------',o:62},ld:{i:'epiano',d:.3,o:72,all:1},fill:'roll',fx:{verb:.3}},
 {n:'New Jack Swing',bpm:[100,110],sw:.3,sc:'min',kit:'909',dr:{k:'X..x..x...X..x..',c:BB,h:SH},bs:{i:'funk',p:'x..x..x...x..x..',o:36},ch:{i:'stab',x:7,p:'...x..x....x..x.',o:64},ld:{i:'bell',d:.3,o:76},fill:'sn'},
 {n:'Alt R&B',bpm:[70,84],sc:'min',pr:['mind','min'],kit:'trap',kv:{k:{dec:1.1},s:{dec:.8}},dr:{k:'X.........X.....',r:BB,h:'..x.....x.x.....'},bs:{i:'808',p:'k',o:31,sl:.2,dr:1},ch:{i:'pad',x:9,p:'x---------------',o:62},ld:{i:'whine',d:.22,o:72},fx:{verb:.45,rt:3,dly:1}},
 {n:'Afro R&B',bpm:[100,110],sc:['maj','dor'],kit:'soft',dr:{k:'X.......X.......',r:'...x..x....x..x.',p:SH,t:'...........x..x.'},bs:{i:'sub',p:'x..x..x...x.....',o:36},ch:{i:'pad',x:7,p:'x---------------',o:60},ar:{i:'gtr',p:'0.1.2.1.0.1.2.3.',r:1,o:64},ld:{i:'flute',d:.4,o:74},fx:{dly:1,verb:.25}}],
'Lo-fi':[
 {n:'Chillhop',bpm:[78,88],sw:.22,sc:['dor','maj'],pr:['jazz','dvamp'],kit:'lofi',dr:{k:['X......x..x.....','X.........x..x..'],s:BB,h:'x.xgx.xgx.xgx.xg'},bs:{i:'round',p:'k',o:36},ch:{i:'epiano',x:9,p:'x-------x-------',o:60},ld:{i:'bell',d:.2,o:76},fill:'sn',fx:{vinyl:.9,lp:3400,wob:1,verb:.25}},
 {n:'Jazzhop',bpm:[84,92],sw:.28,sc:'dor',pr:['dvamp','jazz'],kit:'lofi',dr:{k:'X.........x.....',s:BB,y:'X...x.xgX...x.xg'},bs:{i:'upright',p:'x...5...3...o...',o:36},ch:{i:'piano',x:7,p:['x-----x-...x----','..x-......x-....'],o:62},ld:{i:'flute',d:.25,o:72},fx:{vinyl:.8,lp:4000,wob:.7,verb:.22}},
 {n:'Rainy Day',bpm:[68,76],sw:.15,sc:'maj',pr:['maj','jazz'],kit:'lofi',dr:{k:'X.......x.......',r:BB,h:'..x...x...x...x.'},bs:{i:'round',p:'x-------x-------',o:36},ch:{i:'pad',x:7,p:'x---------------',o:60},ar:{i:'nylon',p:'01232123',r:2,o:62},fx:{rain:1,lp:3000,vinyl:.4,wob:.5,verb:.3}},
 {n:'Lo-fi Bossa',bpm:[88,98],sw:.06,sc:['dor','maj'],pr:'jazz',kit:'lofi',dr:{k:'X..x....X..x....',r:'x..x..x...x.x...x..x..x...x.x...',p:SH},bs:{i:'upright',p:'x.....5.x.....5.',o:36},ch:{i:'nylon',x:7,p:'x..x..x...x..x..',o:60},ld:{i:'flute',d:.25,o:72},fx:{vinyl:.6,lp:4200,wob:.6,verb:.25}},
 {n:'Sleepy',bpm:[60,70],sw:.1,sc:'maj',pr:['maj','jazz'],kit:'lofi',kv:{k:{v:.75}},dr:{k:'X.........x.....',s:'............x...',h:'..x...x...x...x.'},bs:{i:'round',p:'x---------------',o:36},ch:{i:'epiano',x:9,p:'x-------x-------',o:60},ld:{i:'mbox',d:.3,o:79,all:1},fx:{vinyl:.9,lp:2800,wob:1.4,verb:.4}},
 {n:'Tape Beat',bpm:[86,94],sw:.2,sc:'min',kit:'dusty',kv:{k:{dr:.6}},dr:{k:'X.x.......X.....',s:BB,h:SH},bs:{i:'bass',p:'k',o:36},ch:{i:'organ',x:7,p:'x--.....x--.....',o:60},ld:{i:'flute',d:.3,o:72},fill:'sn',fx:{vinyl:.7,lp:3600,sat:3,wob:.5}}],
'Country':[
 {n:'Train Beat',bpm:[104,120],sc:['maj','mix'],pr:'cty',kit:'brush',dr:{k:'X.......X.......',s:'ggggXgggggggXggg'},bs:{i:'upright',p:'x.......5.......',o:36},ch:{i:'strum',x:3,p:'x.u.x.u.x.u.x.u.',o:60},ld:{i:'twang',d:.3,o:72},fill:'sn'},
 {n:'Honky Tonk',bpm:[140,160],sc:'maj',pr:'cty',kit:'soft',dr:{k:'X.......X.......',s:BB},bs:{i:'upright',p:'x.......5.......',o:36},ch:{i:'strum',x:3,p:'....x.......x...',o:60},ld:{i:'piano',d:.35,o:72},fill:'sn'},
 {n:'Country Ballad',bpm:[66,76],sc:'maj',pr:['cty','maj'],kit:'soft',dr:{k:'X.......X.......',r:BB},bs:{i:'round',p:'x-------5-------',o:36},ch:{i:'strings',x:3,p:'x---------------',o:60},ar:{i:'gtr',p:'01213121',r:2,o:60},ld:{i:'steel',d:.3,o:72},fx:{verb:.35}},
 {n:'Country Pop',bpm:[110,122],sc:'maj',pr:['cty','maj'],kit:'909',kv:{k:{v:.9}},dr:{k:'X.....x.X.......',c:BB,h:H8},bs:{i:'pick',p:'x...x...x...x...',o:40},ch:{i:'strum',x:3,p:'x.xux.xux.xux.xu',o:60},ar:{i:'banjo',p:'0241024102410241',r:1,o:62},ld:{i:'twang',d:.35,o:72},crash:1,fill:'sn'},
 {n:'Bluegrass',bpm:[120,140],sc:'maj',pr:'cty',kit:'brush',dr:{s:'....x.......x...'},bs:{i:'upright',p:'x.......5.......',o:36},ch:{i:'strum',x:3,p:'....x.......x...',o:60},ar:{i:'banjo',p:['0241024102410241','0240240240240241'],r:1,o:62},ld:{i:'fiddle',d:.3,o:74}},
 {n:'Country Trap',bpm:[134,142],sc:['maj','mix'],pr:'cty',cpb:.5,kit:'trap',dr:{k:'X......x..X.....',c:HT,h:'x.x.x.x.x.xrx.x.'},bs:{i:'808',p:'k',o:31,sl:.2},ch:{i:'pad',x:3,p:'x---------------',o:60},ar:{i:'banjo',p:'01213121',r:2,o:62},ld:{i:'twang',d:.3,o:72},fill:'stop'}],
'Electronic':[
 {n:'House',bpm:[120,126],sc:['min','dor','maj'],kit:'909',dr:{k:FOUR,c:BB,o:OFF,h:G16},bs:{i:'pluckb',p:OFF,o:36},ch:{i:['organ','piano'],x:7,p:['...x..x....x..x.','x..x..x...x..x..'],o:62},ld:{i:'piano',d:.25,o:72},side:.5,crash:1,fill:'drop',fx:{verb:.22}},
 {n:'Techno',bpm:[128,134],sc:['min','phr'],pr:'mind',cpb:.5,kit:'techno',dr:{k:FOUR,h:'ggxgggxgggxgggxg',o:OFF,c:['','....x.......x...'],r:'...x..x.......x.'},bs:{i:'acid',p:['x.xxo.x.x.xox.x.','xx.x.ox.x.xx.o.x'],o:36},ch:{i:'stab',x:3,p:'......x.........',o:60},fill:'drop',fx:{verb:.25,dly:1}},
 {n:'Trance',bpm:[136,140],sc:'min',kit:'909',dr:{k:FOUR,c:BB,o:OFF,h:G16},bs:{i:'pluckb',p:'.xxx.xxx.xxx.xxx',o:36},ch:{i:'super',x:3,p:'x---------------',o:62},ar:{i:'pluck',p:'0120120120120121',r:1,o:67},ld:{i:'super',d:.45,o:74},side:.6,crash:1,fill:'drop',fx:{dly:1,verb:.3}},
 {n:'Drum & Bass',bpm:[170,176],sc:'min',cpb:.5,kit:'dnb',dr:{k:['X.........X.....X.x.......x.....','X.........x.....'],s:BB,h:'x.xxx.x.x.xxx.x.'},bs:{i:'reese',p:'x-------x---x---',o:34},ch:{i:'pad',x:7,p:'x---------------',o:62},ld:{i:'bell',d:.25,o:76},fill:'sn',fx:{verb:.3}},
 {n:'Dubstep',bpm:[140,142],sc:['min','phr'],pr:'mind',cpb:.5,kit:'trap',dr:{k:'X.........x.....',s:HT,h:H8},bs:{i:'wob',p:['x---x-x-x---x---','x-x-x---x-----x-'],o:31},ch:{i:'pad',x:3,p:'x---------------',o:62},ld:{i:'square',d:.3,o:74},side:.3,fill:'drop'},
 {n:'Synthwave',bpm:[96,110],sc:'min',kit:'gated',dr:{k:'X.......X.......',s:BB,h:'gxgxgxgxgxgxgxgx'},bs:{i:'pluckb',p:'x.x.o.x.x.x.o.x.',o:36},ch:{i:'pad',x:3,p:'x---------------',o:62},ar:{i:'pluck',p:'0123',r:1,o:62},ld:{i:'saw',d:.4,o:74},crash:1,fill:'tom',fx:{dly:1,verb:.35,rt:2.6}},
 {n:'Future Bass',bpm:[140,150],sc:'maj',kit:'trap',dr:{k:'X.........x.....',c:HT,h:'x.x.x.x.x.xrx.x.'},bs:{i:'sub',p:'x-------x-----x-',o:36},ch:{i:'super',x:7,p:['x--.x--.x-.x-...','x-x-..x-x-..x-x-'],o:64},ld:{i:'pluck',d:.5,o:76},side:.8,fill:'drop',fx:{verb:.3}}]};
const GENRES=Object.keys(STY);
const GALIAS=[[/drill|trap|rage|plugg|phonk|^rap/,'Rap'],[/hip.?hop|boom|g.?funk/,'Hip-Hop'],[/r.?(and|&|n).?b|soul/,'R&B'],[/lo.?fi|chill/,'Lo-fi'],[/country|folk|bluegrass/,'Country'],[/edm|house|techno|trance|dance|electr|dub|dnb|drum/,'Electronic'],[/rock|punk|grunge|metal|indie/,'Rock'],[/pop/,'Pop']];
function normG(g){if(!g)return 'Pop';if(STY[g])return g;const s=String(g).toLowerCase();for(const[re,n]of GALIAS)if(re.test(s))return n;return GENRES[hash(s)%GENRES.length]}

/* ---------- pattern parsing ---------- */
const VEL={x:.8,X:1,g:.3,o:.55,r:-1};
const PC=new Map();
function dpat(s){if(PC.has('d'+s))return PC.get('d'+s);const a=[];for(const c of s)a.push(VEL[c]||0);PC.set('d'+s,a);return a}
/* tonal patterns: one event per attack with its length in steps */
function tpat(s){if(PC.has('t'+s))return PC.get('t'+s);const a=new Array(s.length).fill(null);for(let i=0;i<s.length;i++){const c=s[i];if(c=='.'||c=='-')continue;let l=1;while(s[i+l]=='-')l++;a[i]={c,l}}PC.set('t'+s,a);return a}

/* ---------- the plan: everything about a song's beat, worked out from its seed ---------- */
function seedOf(src){if(src.seed!=null)return typeof src.seed=='number'?src.seed>>>0:hash(src.seed);if(src.bs==null&&typeof songSeeds=='function')songSeeds();if(src.bs!=null)return src.bs>>>0;return hash(normG(src.genre||src.g)+'#'+(src.id!=null?src.id:src.title||''))}
function genMotif(r,d,bars){const out=[];let deg=[0,2,4][r()*3|0];
 for(let b=0;b<bars;b++){const row=new Array(16).fill(null),hits=[];for(let s=0;s<16;s++){const w=s%4==0?1:s%2==0?.6:.28;if(r()<d*w*1.35)hits.push(s)}if(!hits.length)hits.push(0);
  hits.forEach((s,j)=>{const strong=s%4==0;deg+=[-2,-1,-1,0,1,1,2,3,-3][r()*9|0];if(deg>9)deg-=4;if(deg<-3)deg+=4;if(strong&&(deg%2+2)%2)deg+=r()<.5?1:-1;
   const nx=j+1<hits.length?hits[j+1]:16+(r()<.5?2:0);row[s]={d:deg,l:Math.max(1,Math.min(6,nx-s)),v:strong?.95:.75}});out.push(row)}return out}
function plan(src){if(typeof src=='string')src={genre:src};src=src||{};const genre=normG(src.genre||src.g),seed=seedOf(src),r=rng(seed^0x5bd1e995),L=STY[genre];
 const pk=a=>Array.isArray(a)?a[r()*a.length|0]:a,si=src.style!=null?((src.style%L.length)+L.length)%L.length:r()*L.length|0,st=L[si];
 const bpm=Math.round(st.bpm[0]+r()*(st.bpm[1]-st.bpm[0])),key=r()*12|0,sc=MM[pk(st.sc)]||'min',fam=sc=='maj'||sc=='mix'?'maj':'min';
 let prs=st.pr?pk(st.pr):fam=='maj'?'maj':'min';if(typeof prs=='string')prs=PR[prs]||PR[fam];const prog=pk(prs);
 /* kit: copy and nudge */
 const kb=KIT[st.kit]||KIT.dusty,kit={};for(const p in kb){kit[p]={};for(const q in kb[p])kit[p][q]=kb[p][q]*(q=='v'?1:.9+r()*.2)}
 if(st.kv)for(const p in st.kv)for(const q in st.kv[p])kit[p]=Object.assign({},kit[p],{[q]:st.kv[p][q]});
 const dk=[];for(const k in st.dr){const s=pk(st.dr[k]);if(s)dk.push([k,dpat(s)])}
 const kp=dk.find(x=>x[0]=='k');
 const bs=st.bs?Object.assign({},st.bs,{p:pk(st.bs.p)}):null,ch=st.ch?Object.assign({},st.ch,{i:pk(st.ch.i),p:pk(st.ch.p)}):null,ar=st.ar?Object.assign({},st.ar,{p:pk(st.ar.p)}):null,ld=st.ld?Object.assign({},st.ld):null;
 const A=genMotif(r,ld?ld.d:.4,2),B=genMotif(r,ld?ld.d:.4,1),V=genMotif(r,(ld?ld.d:.4)*.6,2);
 const kr=((key+6)%12)-6;
 return{genre,style:st.n,si,count:L.length,seed,bpm,key,kr,sc,keyName:KEYN[key]+' '+SCN[sc],prog,cpb:st.cpb||1,sw:st.sw||0,kit,dk,kick:kp?kp[1]:null,bs,ch,ar,ld,
  s8:dPick(src.s8,N808,seed,0x808),hh:src.hh=='auto'&&!/^(trap|b808)$/.test(st.kit)?'':dPick(src.hh,DHAT,seed,0x4a7),
  hook:[A[0],A[1],A[0],B[0]],verse:V,fill:st.fill||'',crash:!!st.crash,side:st.side||0,fx:st.fx||{},mx:Object.assign({dr:1,bs:.6,ch:.3,ar:.2,ld:.24},st.mx||{})}}

/* ---------- audio building blocks ---------- */
function noiseBuf(c){if(c._bnb)return c._bnb;const r=rng(7),b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=r()*2-1;return c._bnb=b}
function curve(c,amt){c._bcv=c._bcv||{};const k=Math.round(amt*10);if(c._bcv[k])return c._bcv[k];const n=1024,a=new Float32Array(n),t=Math.tanh(amt);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;a[i]=Math.tanh(x*amt)/t}return c._bcv[k]=a}
function shaper(c,amt,os){const w=c.createWaveShaper();w.curve=curve(c,amt);w.oversample=os||'none';return w}
function irBuf(c,rt){c._bir=c._bir||{};const k=Math.round(rt*10);if(c._bir[k])return c._bir[k];const r=rng(k+3),L=Math.max(1,c.sampleRate*rt|0),b=c.createBuffer(2,L,c.sampleRate);
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<L;i++)d[i]=(r()*2-1)*Math.pow(1-i/L,3.2)*(i<c.sampleRate*.01?i/(c.sampleRate*.01):1)}return c._bir[k]=b}
function vinylBuf(c){if(c._bvn)return c._bvn;const r=rng(11),L=c.sampleRate*3,b=c.createBuffer(1,L,c.sampleRate),d=b.getChannelData(0);let k=0;
 for(let i=0;i<L;i++){if(r()<.0004)k=(r()<.5?-1:1)*(.3+r()*.7);d[i]=(r()*2-1)*.04+k;k*=.55}return c._bvn=b}
function ksBuf(c,f,dec,br){c._bks=c._bks||new Map();const key=Math.round(f*4)+'|'+dec+'|'+br;let b=c._bks.get(key);if(b)return b;if(c._bks.size>160)c._bks.clear();
 const sr=c.sampleRate,a=br,N=Math.max(2,Math.round(sr/f-a)),fb=Math.pow(.001,1/(f*dec)),len=Math.min(sr*3,Math.ceil(sr*(dec+.05))),d=new Float32Array(len),r=rng(Math.round(f*100));
 let m=0;for(let i=0;i<N&&i<len;i++){d[i]=r()*2-1;m+=d[i]}m/=N;for(let i=0;i<N&&i<len;i++)d[i]=(d[i]-m)*.7;
 for(let i=N;i<len;i++)d[i]=fb*((1-a)*d[i-N]+a*(i-N-1>=0?d[i-N-1]:0));
 b=c.createBuffer(1,len,sr);b.copyToChannel?b.copyToChannel(d,0):b.getChannelData(0).set(d);c._bks.set(key,b);return b}

/* drums */
/* drum filters are shared per engine (one biquad per sound, not per hit): filters are the expensive part of Web Audio */
function sf(E,type,f,q,out,send){const k=type+Math.round(f)+'|'+q+'|'+(out===E.dr?1:0)+'|'+(send||0);let n=E.fbk[k];if(n)return n;n=E.c.createBiquadFilter();n.type=type;n.frequency.value=f;n.Q.value=q;n.connect(out);
 if(send){const sg=E.c.createGain();sg.gain.value=send;n.connect(sg);sg.connect(E.rv)}return E.fbk[k]=n}
function nz(E,t,dur,v,type,f,q,out,send,f2,att){const c=E.c,s=c.createBufferSource(),g=c.createGain(),a=att||.002;s.buffer=E.nb;s.loop=true;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(0,t+a,dur/4);s.connect(g);
 if(f2){const fl=c.createBiquadFilter();fl.type=type;fl.Q.value=q;fl.frequency.setValueAtTime(f,t);fl.frequency.exponentialRampToValueAtTime(f2,t+dur);g.connect(fl);fl.connect(out);if(send){const sg=c.createGain();sg.gain.value=send;fl.connect(sg);sg.connect(E.rv)}}
 else g.connect(sf(E,type,f,q,out,send));s.start(t,(t*7.31)%1.5);s.stop(t+dur*1.3+a+.05);return g}
function tone(E,t,type,f0,f1,pd,dec,v,out){const c=E.c,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!=f0)o.frequency.exponentialRampToValueAtTime(f1,t+pd);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.002);g.gain.setTargetAtTime(0,t+.004,dec/3.5);o.connect(g);g.connect(out);o.start(t);o.stop(t+dec*1.5+.05);return g}
function kick(E,t,v){const K=E.P.kit.k,c=E.c,o=c.createOscillator(),g=c.createGain();v*=K.v||1;o.frequency.setValueAtTime(K.f0,t);o.frequency.exponentialRampToValueAtTime(K.f1,t+K.pd);o.frequency.exponentialRampToValueAtTime(K.f1*.85,t+K.dec);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.setTargetAtTime(0,t+.012,K.dec/3.5);o.connect(g);
 if(K.dr>.02){const w=shaper(c,1+K.dr*5),wg=c.createGain();wg.gain.value=.8;g.connect(w);w.connect(wg);wg.connect(E.dr)}else g.connect(E.dr);
 o.start(t);o.stop(t+K.dec*1.6+.05);if(K.cl)nz(E,t,.012,v*K.cl*.5,'highpass',2500,.7,E.dr);
 if(E.P.side&&E.pump){const p=E.pump.gain;p.cancelScheduledValues(t);p.setValueAtTime(p.value>0?p.value:1,t);p.linearRampToValueAtTime(1-E.P.side*.75,t+.01);p.setTargetAtTime(1,t+.03,E.sd*1.1)}}
function snare(E,t,v){const S=E.P.kit.s;if(S.tn&&S.f)tone(E,t,'triangle',S.f,S.f*.75,.05,.09,v*S.tn*.8,E.dr);nz(E,t,S.dec,v*S.nz*.7,'bandpass',S.nf,S.nq,E.dr,S.rv);nz(E,t,S.dec*.6,v*S.nz*.35,'highpass',5000,.5,E.dr)}
function clap(E,t,v){const C=E.P.kit.c,c=E.c,s=c.createBufferSource(),g=c.createGain();s.buffer=E.nb;s.loop=true;
 const G=g.gain;G.setValueAtTime(0,t);for(let i=0;i<3;i++){G.linearRampToValueAtTime(v*.9,t+i*.011+.001);G.linearRampToValueAtTime(v*.15,t+i*.011+.009)}G.linearRampToValueAtTime(v*.8,t+.034);G.setTargetAtTime(0,t+.035,C.dec/4);
 s.connect(g);g.connect(sf(E,'bandpass',C.f,1.4,E.dr,.25));s.start(t,(t*3.7)%1.5);s.stop(t+C.dec*1.4+.08)}
function hat(E,t,v,open){const H=E.P.kit.h,b=!open&&dBuf(E.c,'hat',E.P.hh);
 if(b){const s=E.c.createBufferSource(),g=E.c.createGain();s.buffer=b;g.gain.value=v*.4;s.connect(g);g.connect(E.dr);s.start(t);return}nz(E,t,open?H.od:H.cd,v*H.v*1.4,'highpass',H.f,.6,E.dr,open?.08:0)}
function drum(E,key,t,v){switch(key){
 case'k':return kick(E,t,v);case's':return snare(E,t,v);case'c':return clap(E,t,v);case'h':return hat(E,t,v,0);case'o':return hat(E,t,v,1);
 case'n':nz(E,t,.06,v*.55,'bandpass',2200,3.5,E.dr,.3);return tone(E,t,'sine',1800,900,.01,.015,v*.2,E.dr);
 case'r':tone(E,t,'triangle',1700,1650,.01,.03,v*.3,E.dr);return nz(E,t,.025,v*.3,'bandpass',2600,2,E.dr,.1);
 case'p':return nz(E,t,.07,v*.22,'bandpass',5500,1,E.dr,0,0,.012);
 case'b':{const c=E.c,g=c.createGain(),f=g;g.connect(sf(E,'bandpass',2600,1,E.dr));g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.18,t+.002);g.gain.setTargetAtTime(0,t+.01,.08);
  [587,845].forEach(fr=>{const o=c.createOscillator();o.type='square';o.frequency.value=fr;o.connect(f);o.start(t);o.stop(t+.4)});return}
 case'y':nz(E,t,.7,v*.13,'bandpass',7800,1.2,E.dr,.05);return nz(E,t,.25,v*.08,'highpass',9000,.5,E.dr);
 case'z':return nz(E,t,1.8,v*.3,'highpass',3500,.5,E.dr,.25);
 case't':return tone(E,t,'sine',E.tf||150,(E.tf||150)*.6,.3,.35,v*.7,E.dr)}}

/* tonal voices */
/* oscillator voices share their layer's low-pass filter (a filter per note is very costly in Web Audio and keeps running after the note);
   the filter envelope is played on the shared filter, which is fine because bass, arps and leads are one note at a time and chord notes start together */
function oscV(E,L,t,f,dur,v,I,x){const c=E.c,g=c.createGain(),end=t+dur,a=I.a||.005,r=I.r||.08,s=I.s==null?.8:I.s,d=I.d||.2,stop=end+r*2+.06,base=Math.min(15000,I.lp||6000);
 if(I.le&&L.f&&t>=(L.ft||0)){const F=L.f.frequency;L.ft=t;F.cancelScheduledValues(t);F.setValueAtTime(Math.min(18000,base*(1+I.le*(x&&x.acc?1.8:1))),t);F.exponentialRampToValueAtTime(base,t+(I.ld||.2))}
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(v*s,t+a,d/3);g.gain.setTargetAtTime(0,Math.max(end,t+a),r/3);
 let vg=null;if(I.vib){const lf=c.createOscillator();vg=c.createGain();lf.frequency.value=5.2;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(I.vib,t+Math.min(.35,dur));lf.connect(vg);lf.start(t);lf.stop(stop)}
 if(I.wob){const lf=c.createOscillator(),wg=c.createGain();lf.type='sine';lf.frequency.value=(x&&x.wr)||2/(E.sd*4);wg.gain.value=base*3;lf.connect(wg);if(L.f)wg.connect(L.f.frequency);lf.start(t);lf.stop(stop)}
 const n=I.o.length,norm=1/Math.sqrt(I.o.reduce((a,p)=>a+p[3]*p[3],0));
 for(const p of I.o){const o=c.createOscillator(),pg=c.createGain();o.type=p[0];o.detune.value=p[2];const fr=f*p[1];
  if(x&&x.from&&I.gl){o.frequency.setValueAtTime(x.from*p[1],t);o.frequency.exponentialRampToValueAtTime(fr,t+I.gl)}else o.frequency.setValueAtTime(fr,t);
  if(vg)vg.connect(o.detune);pg.gain.value=p[3]*norm;o.connect(pg);pg.connect(g);o.start(t);o.stop(stop)}
 g.connect(L.in)}
function fmV(E,L,t,f,dur,v,I){const c=E.c,car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain(),a=.003,rel=I.r||.3,end=Math.min(t+I.dec,t+dur+rel),stop=end+rel+.1;
 car.frequency.value=f;mod.frequency.value=f*I.ra;mg.gain.setValueAtTime(f*I.ix,t);mg.gain.setTargetAtTime(f*I.ix*(I.ixs||.08),t,I.id/3);mod.connect(mg);mg.connect(car.frequency);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(0,t+a,I.dec/4);if(dur+rel<I.dec)g.gain.setTargetAtTime(0,t+dur,rel/3);
 car.connect(g);if(I.p2){const o2=c.createOscillator(),g2=c.createGain();o2.frequency.value=f*2;g2.gain.value=I.p2;o2.connect(g2);g2.connect(g);o2.start(t);o2.stop(stop)}
 if(I.tr){const lf=c.createOscillator(),tg=c.createGain(),am=c.createGain();lf.frequency.value=4.5;tg.gain.value=.18;am.gain.value=.85;lf.connect(tg);tg.connect(am.gain);g.connect(am);am.connect(L.in);lf.start(t);lf.stop(stop)}else g.connect(L.in);
 car.start(t);mod.start(t);car.stop(stop);mod.stop(stop)}
function ksV(E,L,t,f,dur,v,I){const c=E.c,b=ksBuf(c,f,I.dec,I.br),s=c.createBufferSource(),g=c.createGain(),rel=I.ds?.04:.06;s.buffer=b;g.gain.setValueAtTime(v*(I.ds?1.2:3),t);if(dur<I.dec)g.gain.setTargetAtTime(0,t+dur,rel/3);
 s.connect(g);g.connect(L.in);s.start(t);s.stop(t+Math.min(b.duration,dur+rel*3)+.02)}
function b808(E,L,t,f,dur,v,I,x){const c=E.c,o=c.createOscillator(),g=c.createGain(),dec=I.dec||1.5,end=t+dur;o.type='sine';
 if(x&&x.from){o.frequency.setValueAtTime(x.from,t);o.frequency.exponentialRampToValueAtTime(f,t+.09)}else{o.frequency.setValueAtTime(f*2.2,t);o.frequency.exponentialRampToValueAtTime(f,t+.035)}
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.setTargetAtTime(0,t+.06,dec/3);g.gain.setTargetAtTime(0,end,.025);
 o.connect(g);const w=shaper(c,(x&&x.dr)||I.dr||2),wg=c.createGain();wg.gain.value=.75;g.connect(w);w.connect(wg);wg.connect(L.in);o.start(t);o.stop(end+.15)}
function cbV(E,L,t,f,dur,v){const c=E.c,g=c.createGain(),bp=c.createGain();bp.connect(g);g.connect(sf(E,'bandpass',Math.round(f*2),2,L.in));
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*1.5,t+.002);g.gain.setTargetAtTime(0,t+.01,.12);g.gain.setTargetAtTime(0,t+dur,.03);
 [1,1.48].forEach(m=>{const o=c.createOscillator();o.type='square';o.frequency.value=f*m;o.connect(bp);o.start(t);o.stop(t+Math.min(.7,dur+.1))})}
/* ---------- one-shot samples (audio/oneshots, listed in its manifest.json) ----------
   Recorded one-shots, each pitched to the note the beat plays. A family (bass, key, brass...) loads on the first beat
   that starts with a Web Audio context. Until a family has loaded, or if the files cannot be fetched (for example
   from a file:// page), the code-made voice for that instrument plays as before. */
const SMP={},SMP_OF={bass:'bass',round:'bass',upright:'bass',funk:'bass',pluckb:'bass',pick:'bass',acid:'bass',reese:'bass',wob:'bass',
 epiano:'key',piano:'piano',bell:'bell',pbell:'bell',brass:'brass',lead:'lead',pluck:'pluck',flute:'flute',strings:'string',super:'synth'};
const sampled=n=>{const f=SMP_OF[n];return !!(f&&SMP[f]&&SMP[f].length)};
let smpLoad=null;
function loadSamples(c){if(smpLoad||!c||typeof fetch!='function')return smpLoad;
 smpLoad=fetch('audio/oneshots/manifest.json').then(r=>r.ok?r.json():[]).then(list=>Promise.all(list.map(m=>fetch('audio/oneshots/'+m.f).then(r=>r.arrayBuffer()).then(b=>c.decodeAudioData(b)).then(buf=>{(SMP[m.c]=SMP[m.c]||[]).push({buf,root:m.root+(m.cents||0)/100})}).catch(()=>{})))).catch(()=>{});
 return smpLoad}
function smpV(E,L,t,m,dur,v,fam){let s=null,bd=1e9;for(const z of SMP[fam]){const d=Math.abs(m-z.root);if(d<bd){bd=d;s=z}}
 const c=E.c,src=c.createBufferSource(),g=c.createGain(),end=t+dur;
 src.buffer=s.buf;src.playbackRate.value=Math.pow(2,(m-s.root)/12);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.9,t+.004);g.gain.setValueAtTime(v*.9,end);g.gain.linearRampToValueAtTime(0,end+.08);
 src.connect(g);g.connect(L.in);src.start(t);src.stop(end+.1)}
/* ---------- v43.0.0: recorded 808s and hi hats (audio/drums, all 808s tuned to C1 plus the cents below) ----------
   A song can name one of each (s8, hh); 'auto' picks one from the song's seed (hats only for trap-style kits).
   Songs without a pick, and any beat played before its sample has loaded, keep the code-made 808 and hat. */
const D808={amen:-17,cactus:0,camp:5,daffy:-6,dime:0,episode:11,flo:2,glaze:0,grief:12,notebook:22,owl:12,robin:23,shiver:-1,shoe:11,snowhurt:0,thin:0,vessel:22},
 N808=Object.keys(D808),DHAT=['aisle','business','crusade','fin','guard','meta','rooftop','turkey','utter'];
function dPick(v,list,seed,salt){if(!v)return'';v=String(v).toLowerCase();if(v=='auto')return list[mix32((seed^salt)>>>0)%list.length];return list.includes(v)?v:''}
function dBuf(c,kind,n){if(!n||!c||typeof fetch!='function')return null;const B=c._bds||(c._bds={}),k=kind+n;if(k in B)return B[k];B[k]=null;
 fetch('audio/drums/'+kind+'-'+n+(kind=='hat'?'.wav':'.mp3')).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>c.decodeAudioData(b)).then(buf=>{B[k]=buf}).catch(()=>{});return null}
function s808(E,L,t,m,dur,v,b,x){const c=E.c,src=c.createBufferSource(),g=c.createGain(),root=24+D808[E.P.s8]/100,rt=n=>Math.pow(2,(n-root)/12),end=t+dur,R=src.playbackRate;src.buffer=b;
 if(x&&x.from){R.setValueAtTime(rt(69+12*Math.log2(x.from/440)),t);R.exponentialRampToValueAtTime(rt(m),t+.09)}else R.setValueAtTime(rt(m),t);
 g.gain.setValueAtTime(v*.85,t);g.gain.setTargetAtTime(0,end,.025);src.connect(g);g.connect(L.in);src.start(t);src.stop(end+.15)}
function note(E,lay,name,t,midi,dur,v,x){const I=INS[name]||INS.sine,L=E.lay[lay],f=mtof(midi);if(!L)return;
 if(name=='808'&&E.P.s8){const b=dBuf(E.c,'808',E.P.s8);if(b){s808(E,L,t,midi,dur,v,b,x);return}}
 if(sampled(name)){smpV(E,L,t,midi,dur,v,SMP_OF[name]);return}
 if(I.t=='o')oscV(E,L,t,f,dur,v,I,x);else if(I.t=='fm')fmV(E,L,t,f,dur,v,I);else if(I.t=='ks')ksV(E,L,t,f,dur,v,I);else if(I.t=='808')b808(E,L,t,f,dur,v,Object.assign({},I,x&&x.dr?{dr:x.dr}:{}),x);else cbV(E,L,t,f,dur,v)}

/* ---------- harmony ---------- */
const dm=(P,deg)=>P.kr+semi(P.sc,deg);
function voicing(P,root,x,center){if(x==5){let r=dm(P,root)+48;while(r<center-6)r+=12;while(r>=center+6)r-=12;return[r,r+7,r+12]}
 const ds=[0,2,4];if(x>=7)ds.push(6);if(x>=9)ds.push(8);const out=[];for(const d of ds){let m=dm(P,root+d)+60;while(m<center-7)m+=12;while(m>=center+6)m-=12;if(!out.includes(m))out.push(m)}return out.sort((a,b)=>a-b)}
const inWin=(m,lo)=>{while(m<lo)m+=12;while(m>=lo+12)m-=12;return m};
const chordAt=(P,n)=>P.prog[Math.floor(n/(16/P.cpb))%P.prog.length];

/* ---------- song forms: [section, bars]; after the first section the rest loops ---------- */
const FORMS={song:[['in',2],['vs',8],['hk',8],['vs',8],['hk',8],['br',4],['hk',8]],live:[['in',1],['hk',8],['vs',8],['hk',8],['br',4],['hk',8]],rec:[['vs',4],['hk',8],['vs',8],['hk',8]]};
function secAt(F,bar){if(bar<F[0][1])return{k:F[0][0],i:bar,n:F[0][1],nx:F[1][0]};let b=bar-F[0][1];const R=F.slice(1),tot=R.reduce((a,s)=>a+s[1],0);b%=tot;
 for(let j=0;j<R.length;j++){if(b<R[j][1])return{k:R[j][0],i:b,n:R[j][1],nx:R[(j+1)%R.length][0]};b-=R[j][1]}return{k:'vs',i:0,n:8,nx:'hk'}}

/* ---------- one step of the sequencer ---------- */
function sched(E,n,t){const P=E.P,sd=E.sd,bar=n>>4,s=n&15;
 if(E.rbBar!==bar){E.rbBar=bar;E.rb=rng((P.seed^Math.imul(bar+1,0x9E3779B1))>>>0);E.sec=secAt(E.F,bar)}
 const sec=E.sec,k=sec.k,I=E.I,rb=E.rb,main=k=='vs'||k=='hk',last=sec.i==sec.n-1&&k!='in',fill=last?P.fill:'',lvl=.55+.45*I;
 const silent=fill=='stop'&&s>=12||fill=='drop'&&s>=8&&sec.nx=='hk';
 /* drums */
 if(k=='hk'&&sec.i==0&&s==0&&(P.crash||P.fill=='drop'))drum(E,'z',t,.9*lvl);
 if(fill=='tom'&&s>=8){if(s%2==0||s>=12){E.tf=[200,170,140,115,95,80][Math.min(5,(s-8)>>1)];drum(E,'t',t,.8*lvl)}if(s==8)drum(E,'k',t,.9*lvl)}
 else for(const[key,pa]of P.dk){let v=pa[(bar*16+s)%pa.length];if(!v)continue;
  if(k=='in'&&!'hpyr'.includes(key))continue;if(k=='br'&&key=='k')continue;if(silent&&key!='h')continue;
  if(I<.2&&(key=='s'||key=='c'||key=='n'))continue;
  if(fill=='sn'&&s>=12&&(key=='h'||key=='o'))continue;
  v=v<0?-1:v*(.9+.1*rb())*lvl*(k=='in'?.6:k=='br'?.7:1);
  if(v<0||(fill=='roll'||fill=='stop')&&s>=12&&key=='h'){const m=[2,3,4][rb()*3|0],vv=.5*lvl;for(let j=0;j<m;j++)drum(E,key=='h'?'h':key,t+j*sd/m,vv*(.55+.45*j/m));continue}
  drum(E,key,t,v)}
 if(fill=='sn'&&s>=12)drum(E,'s',t,(.45+.15*(s-12))*lvl);
 if(fill=='drop'&&s>=8&&sec.nx=='hk'){drum(E,'s',t,(.25+.07*(s-8))*lvl);if(s%2)drum(E,'s',t+sd/2,(.25+.07*(s-8))*lvl)}
 if((fill=='drop'||k=='br'&&last)&&s==0&&sec.nx=='hk')riser(E,t,sd*16);
 /* bass */
 const root=chordAt(P,n),bs=P.bs;
 if(bs&&main&&I>=.45&&!silent){let ev=null;
  if(bs.p=='k'){if(P.kick){const L=P.kick.length,i=(bar*16+s)%L;if(P.kick[i]){let l=1;while(l<16&&!P.kick[(i+l)%L])l++;ev={c:'x',l}}}}
  else{const tp=tpat(bs.p);ev=tp[(bar*16+s)%tp.length]}
  if(ev){const rm=inWin(dm(P,root)+12,bs.o);let m=rm;
   if(ev.c=='o')m+=12;else if(ev.c=='5')m=rm+(dm(P,root+4)-dm(P,root));else if(ev.c=='3')m=rm+(dm(P,root+2)-dm(P,root));else if(ev.c=='7')m=rm+(dm(P,root+6)-dm(P,root));else if(ev.c=='b')m=rm-1;
   const x={};if(bs.i=='808'){if(E.lb&&rb()<(bs.sl||0)){x.from=mtof(E.lb)}if(rb()<(bs.oc||0))m+=rb()<.5?12:7;x.dr=bs.dr}
   if(bs.i=='acid'){x.acc=rb()<.3;if(E.lb&&rb()<.25)x.from=mtof(E.lb)}if(bs.i=='funk'&&E.lb&&rb()<.2)x.from=mtof(E.lb);if(bs.i=='wob')x.wr=[1,2,3,4][rb()*4|0]/(sd*4);
   const l=Math.min(ev.l,16-s+(bs.p=='k'?16:0));note(E,'bs',bs.i,t,m,l*sd*(bs.i=='808'?1:.92),.9*lvl,x);E.lb=m}}
 /* chords */
 const ch=P.ch;if(ch&&I>=.12&&!(silent&&fill=='stop')){const tp=tpat(ch.p),ev=tp[(bar*16+s)%tp.length];
  if(ev){const CL=16/P.cpb,rem=CL-(n%CL),l=Math.min(ev.l,rem),I0=INS[ch.i]||{},vs=voicing(P,root,ch.x||3,ch.o||60),dur=l*sd*.96,v=(ev.c=='X'?1:.8)*lvl*(k=='in'?.8:1);
   if(I0.st){const tn=[inWin(vs[0]-12,40)].concat(vs,[vs[0]+12]),up=ev.c=='u',ord=up?tn.slice(-4).reverse():tn;ord.forEach((m,i)=>note(E,'ch',ch.i,t+i*(up?.008:.012),m,dur,v*(up?.45:.65)/Math.sqrt(ord.length)*1.6))}
   else vs.forEach(m=>note(E,'ch',ch.i,t,m,dur,v*.9/Math.sqrt(vs.length)))}}
 /* arpeggio */
 const ar=P.ar;if(ar&&I>=.3&&!silent&&k!='br'){const r=ar.r||1;if(s%r==0){const c=ar.p[((n/r)|0)%ar.p.length];if(c>='0'&&c<='9'){const vs=voicing(P,root,ar.x||3,ar.o||64),i=+c,m=vs[i%vs.length]+12*Math.floor(i/vs.length);note(E,'ar',ar.i,t,m,sd*r*.9,.75*lvl*(k=='in'?.7:1))}}}
 /* hook melody */
 const ld=P.ld;if(ld&&I>=.7&&(k=='hk'||k=='br'||ld.all&&k=='vs')&&!silent){const row=(k=='vs'?P.verse[sec.i%2]:P.hook[sec.i%4]),nt=row&&row[s];
  if(nt){const r0=root>4?root-7:root;let m=dm(P,r0+nt.d)+12*Math.floor(ld.o/12);while(m>ld.o+12)m-=12;while(m<ld.o-12)m+=12;if(k=='br')m-=12;const x=E.ll?{from:mtof(E.ll)}:null;note(E,'ld',ld.i,t,m,nt.l*sd*.92,nt.v*lvl*(k=='vs'?.75:1),x);E.ll=m}}}
function riser(E,t,dur){nz(E,t,dur,.12*E.I,'bandpass',300,3,E.mix,.3,7000,dur*.9)}

/* ---------- an engine instance: one song playing into one context ---------- */
function mkE(c,dest,P,o){const E={c,P,fbk:{},sd:60/P.bpm/4,nb:noiseBuf(c),I:o.intensity!=null?o.intensity:1,F:FORMS[o.form]||FORMS.song,loops:[],owner:o.owner,alive:o.alive,onstop:o.onstop,step:0,src:o.src};
 E.out=c.createGain();E.mix=c.createGain();let n=E.mix;const fx=P.fx;
 if(fx.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=fx.lp;f.Q.value=.6;n.connect(f);n=f}
 if(fx.sat){const w=shaper(c,fx.sat),g=c.createGain();g.gain.value=.8;n.connect(w);w.connect(g);n=g}
 const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=28;n.connect(hp);hp.connect(E.out);E.out.connect(dest);
 E.rv=c.createGain();const cv=c.createConvolver();cv.buffer=irBuf(c,fx.rt||1.8);const rr=c.createGain();rr.gain.value=fx.verb!=null?fx.verb*1.4:.3;E.rv.connect(cv);cv.connect(rr);rr.connect(E.mix);
 if(fx.dly){E.dl=c.createGain();const d=c.createDelay(2),fb=c.createGain(),lp=c.createBiquadFilter(),w=c.createGain();d.delayTime.value=E.sd*3;fb.gain.value=.35;lp.type='lowpass';lp.frequency.value=3000;w.gain.value=.35;E.dl.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(w);w.connect(E.mix)}
 E.pump=c.createGain();E.pump.connect(E.mix);
 E.dr=c.createGain();E.dr.gain.value=P.mx.dr;E.dr.connect(E.mix);
 let wob=null;if(fx.wob){const l=c.createOscillator();l.frequency.value=.55;wob=c.createGain();wob.gain.value=.0011*fx.wob;l.connect(wob);l.start();E.loops.push(l)}
 E.lay={};const RVS={bs:0,ch:.3,ar:.35,ld:.35};
 for(const k of['bs','ch','ar','ld']){const def=P[k];if(!def)continue;const g=c.createGain(),Id=INS[def.i]||{},smp=sampled(def.i);g.gain.value=P.mx[k];let inp=g;
  let lf=null;if(Id.t=='o'){lf=c.createBiquadFilter();lf.type='lowpass';lf.frequency.value=smp?15000:Math.min(15000,Id.lp||6000);lf.Q.value=Id.q||.7;lf.connect(g);inp=lf}
  if(Id.ds&&!smp){const w=shaper(c,k=='ld'?6:9,'2x'),lp=c.createBiquadFilter(),h=c.createBiquadFilter(),wg=c.createGain();lp.type='lowpass';lp.frequency.value=3600;h.type='highpass';h.frequency.value=90;wg.gain.value=k=='ld'?.5:.6;w.connect(h);h.connect(lp);lp.connect(wg);wg.connect(g);if(lf){lf.disconnect();lf.connect(w)}else inp=w}
  if(wob&&k!='bs'){const d=c.createDelay(.05);d.delayTime.value=.006;wob.connect(d.delayTime);d.connect(inp);inp=d}
  g.connect(P.side&&k!='ld'?E.pump:E.mix);if(RVS[k]){const sg=c.createGain();sg.gain.value=RVS[k];g.connect(sg);sg.connect(E.rv)}if(k=='ld'&&E.dl)g.connect(E.dl);E.lay[k]={in:inp,g,f:lf}}
 if(fx.vinyl){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=vinylBuf(c);s.loop=true;f.type='highpass';f.frequency.value=700;g.gain.value=.22*fx.vinyl;s.connect(f);f.connect(g);g.connect(E.mix);s.start();E.loops.push(s)}
 if(fx.rain){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=E.nb;s.loop=true;f.type='lowpass';f.frequency.value=1400;g.gain.value=.05*fx.rain;s.connect(f);f.connect(g);g.connect(E.mix);s.start();E.loops.push(s)}
 return E}
const stepTime=(E,n)=>E.t0+n*E.sd+(n%2?E.P.sw*E.sd:0);

/* ---------- live output, scheduler, pause and the watchdog ---------- */
const BASE=.9;let G=null,cur=null,timer=0,held=0,uvol=1,savedPads=null;
function userOK(){try{if(navigator.userActivation)return navigator.userActivation.hasBeenActive}catch(e){}return typeof MU=='undefined'||!!MU.on}
function outChain(c){const vol=c.createGain(),comp=c.createDynamicsCompressor();comp.threshold.value=-8;comp.knee.value=6;comp.ratio.value=10;comp.attack.value=.003;comp.release.value=.2;const pre=c.createGain(),clip=shaper(c,1.4,'2x');pre.gain.value=.8;vol.connect(comp);comp.connect(pre);pre.connect(clip);clip.connect(c.destination);return{c,vol,comp}}
function ctx(){if(!userOK())return null;let c=null;try{if(typeof ac=='function')c=ac()}catch(e){}
 if(!c){if(G&&G.c.state!='closed')c=G.c;else{const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{c=new A()}catch(e){return null}}}
 if(c.state=='suspended')try{c.resume().catch(()=>{})}catch(e){}
 if(!G||G.c!==c)G=outChain(c);loadSamples(c);return c}
const musicVol=()=>((typeof VOL=='number'&&VOL>0?VOL:.5))*uvol*BASE;
const gamePaused=()=>typeof PAUSED!='undefined'&&!!PAUSED;
function holdBg(on){try{if(typeof MU=='undefined')return;if(on){MU.hold=1;held=1;const a=MU.a&&MU.a[MU.cur];if(MU.pl&&a&&!a.paused)a.pause()}
 else if(held){held=0;if(!gamePaused()){MU.hold=0;const a=MU.a&&MU.a[MU.cur];if(MU.pl&&a&&a.paused)a.play().catch(()=>{})}}}catch(e){}}
function setPads(P){try{if(typeof MG_NOTE=='undefined')return;if(!savedPads)savedPads=MG_NOTE.slice();[0,2,4,7].forEach((d,i)=>MG_NOTE[i]=Math.round(mtof(60+dm(P,d))))}catch(e){}}
function restorePads(){try{if(savedPads&&typeof MG_NOTE!='undefined')savedPads.forEach((f,i)=>MG_NOTE[i]=f);savedPads=null}catch(e){}}
function info(E){const P=E.P;return{genre:P.genre,style:P.style,variant:P.si+1,of:P.count,bpm:P.bpm,key:P.keyName,seed:P.seed}}
function end(E,fade){if(!E||E.dead)return;E.dead=1;const c=E.c,now=c.currentTime,f=Math.max(.02,fade==null?.4:fade);try{const g=E.out.gain;g.cancelScheduledValues(now);g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(0,now+f)}catch(e){}
 setTimeout(()=>{try{E.out.disconnect()}catch(e){}E.loops.forEach(l=>{try{l.stop()}catch(e){}})},f*1000+120);if(E.pads)restorePads();try{E.onstop&&E.onstop()}catch(e){}}
function play(src,o){o=o||{};if(o.owner=='sf')uvol=(typeof S=='object'&&S&&S.sfVol!=null)?Math.max(0,Math.min(1,+S.sfVol||0)):1;else if(o.owner!='car')uvol=1;let P;try{P=plan(src)}catch(e){console.error('beats plan',e);return null}const c=ctx();if(!c)return null;
 if(cur){end(cur,.25);cur=null}
 let E;try{E=mkE(c,G.vol,P,Object.assign({src},o))}catch(e){console.error('beats',e);return null}
 dBuf(c,'808',P.s8);dBuf(c,'hat',P.hh);
 const now=c.currentTime;E.t0=now+.08;E.next=E.t0;E.out.gain.setValueAtTime(0,now);E.gv=o.vol!=null?o.vol:1;E.out.gain.linearRampToValueAtTime(E.gv,now+(o.fadeIn||.06));
 if(o.pads){E.pads=1;setPads(P)}G.vol.gain.setValueAtTime(musicVol(),now);E.vv=musicVol();
 cur=E;holdBg(1);if(!timer)timer=setInterval(tick,25);tick();return info(E)}
function pause(E){if(E.paused)return;E.paused=1;const c=E.c,now=c.currentTime;E.pt=now;const g=E.out.gain;g.cancelScheduledValues(now);g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(0,now+.05)}
function resume(E){if(!E.paused)return;E.paused=0;const c=E.c,now=c.currentTime;E.step=Math.max(0,Math.ceil((E.pt-E.t0)/E.sd));E.t0=now+.08-E.step*E.sd;E.next=stepTime(E,E.step);
 const g=E.out.gain;g.cancelScheduledValues(now);g.setValueAtTime(0,now);g.linearRampToValueAtTime(E.gv||1,now+.2)}
function tick(){const E=cur;if(!E){clearInterval(timer);timer=0;return}const c=E.c;
 if(c.state=='closed'){cur=null;holdBg(0);return}
 const hide=gamePaused()||document.hidden||!!E.up;if(hide&&!E.paused)pause(E);else if(!hide&&E.paused)resume(E);
 if((!E.paused||E.up)&&E.alive&&(E.wd=(E.wd||0)+1)%6==0){let ok=1;try{ok=E.alive()}catch(e){ok=0}if(!ok){stop(.6);return}}
 const v=musicVol();if(Math.abs(v-E.vv)>.001){E.vv=v;G.vol.gain.setTargetAtTime(v,c.currentTime,.05)}
 if(!held||(typeof MU!='undefined'&&!MU.hold))holdBg(1);else if(typeof MU!='undefined'&&MU.pl){const a=MU.a&&MU.a[MU.cur];if(a&&!a.paused)a.pause()}
 if(E.paused||c.state!='running')return;const now=c.currentTime;
 if(E.next<now-.4){E.t0=now+.05-E.step*E.sd;E.next=stepTime(E,E.step)}
 let k=0;while(E.next<now+.6&&k++<96){try{sched(E,E.step,Math.max(E.next,now))}catch(e){if(!E.err){E.err=1;console.error('beats',e)}}E.step++;E.next=stepTime(E,E.step)}}
function stop(fade){const E=cur;if(!E)return;cur=null;end(E,fade);holdBg(0)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&cur)pause(cur);else if(cur)tick()});
addEventListener('pagehide',()=>stop(.02));

/* offline render (tests, previews): returns a Promise of an AudioBuffer */
function render(src,secs,o){o=o||{};const P=plan(src),sr=o.sampleRate||44100,OC=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new OC(2,Math.ceil(sr*secs),sr),out=outChain(c);
 out.vol.gain.value=(o.vol!=null?o.vol:.5)*BASE;const E=mkE(c,out.vol,P,o);E.t0=.02;if(o.solo){if(o.solo!='dr')E.dr.gain.value=0;for(const k in E.lay)if(k!=o.solo)E.lay[k].g.gain.value=0}for(let n=0;stepTime(E,n)<secs;n++)sched(E,n,stepTime(E,n));return c.startRendering()}

return{play,stop:f=>stop(f),setIntensity:x=>{if(cur)cur.I=Math.max(0,Math.min(1,+x||0))},setVolume:x=>{uvol=Math.max(0,Math.min(1,+x||0))},
 playing:()=>!!cur,current:()=>cur?Object.assign(info(cur),{owner:cur.owner,src:cur.src,paused:!!cur.paused,held:!!cur.up,intensity:cur.I}):null,
 /* v26.105: the player's own pause (Spotifly's pause buttons). hold(true) pauses the beat where it is, hold(false) carries on from there.
    The game's pause menu and a hidden tab still pause it on their own. songBeats() = quarter notes in one play-through of a song. */
 hold:on=>{if(cur){cur.up=!!on;tick()}},songBeats:()=>FORMS.song.reduce((a,s)=>a+s[1],0)*4,
 plan:src=>{const P=plan(src);return{genre:P.genre,style:P.style,variant:P.si+1,of:P.count,bpm:P.bpm,key:P.keyName,seed:P.seed}},
 beat:()=>{const E=cur;if(!E||E.t0==null)return-1;const t=E.paused?E.pt:E.c.currentTime-(E.c.outputLatency||0);return(t-E.t0)/(E.sd*4)},
 bpm:()=>cur?cur.P.bpm:0,
 /* v43.0.0: the recorded 808 and hi hat names, and a one-shot preview of one (kind '808' or 'hat') */
 drums:{s808:N808.slice(),hats:DHAT.slice()},
 previewDrum(kind,n){const c=ctx();if(!c||!n)return;let k=0;const go=()=>{const b=dBuf(c,kind,n);if(!b){if(k++<20)setTimeout(go,100);return}
  const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=musicVol()*.9;s.connect(g);g.connect(c.destination);s.start();if(kind=='808')s.stop(c.currentTime+1.2)};go()},samples:()=>Object.fromEntries(Object.entries(SMP).map(([k,v])=>[k,v.length])),_dbg:{STY,INS,KIT},styles:Object.fromEntries(GENRES.map(g=>[g,STY[g].map(s=>s.n)])),genres:GENRES.slice(),render,
 /* festival set: called every frame by festMusic; plays the beat of the song on stage (a new beat when the setlist moves on)
    and follows the crowd's hype. Returns false if audio is not available, so the old drum loop can play instead. */
 fest(set){if(!set||!set.song||set._bt==-1)return false;
  if(set._bs!==set.song){set._bs=set.song;const p=play(set.song,{owner:set,form:'live',pads:1,fadeIn:.3,alive:()=>typeof FEST!='undefined'&&FEST.set===set&&!set.end});if(!p){set._bt=-1;return false}}
  if(cur&&cur.owner===set)cur.I=Math.max(0,Math.min(1,.72+.28*(set.hype||0)));return true}};
})();

/* ---------- hooks into the game ---------- */
/* v26.98: every new song gets its own random beat seed (bs), so no two songs share a beat, collabs included.
   Before, a song without a recorded seed (collabs, gifts...) took its beat from its genre and id, and ids count up from the
   same number in every save, so two players' first collab with the same artist was the exact same song.
   S.bsFrom is the song id this started at: older songs without a seed keep their old beat, newer ones get a fresh seed. */
function newBeatSeed(){const used=new Set();[S.songs,S.drafts].forEach(L=>(L||[]).forEach(x=>{if(x&&x.bs!=null)used.add(x.bs>>>0)}));
 let b;do{b=(Math.random()*4294967296)>>>0;try{if(window.crypto&&crypto.getRandomValues)b=crypto.getRandomValues(new Uint32Array(1))[0]}catch(e){}}while(!b||used.has(b));return b}
function songSeeds(){try{if(typeof S=='undefined'||!S||S.nid==null)return;if(S.bsFrom==null)S.bsFrom=S.nid;
 const D=S.drafts||[];[D,S.songs||[]].forEach(L=>L.forEach(x=>{if(!x||x.bs!=null||x.id==null||x.id<S.bsFrom)return;const d=L!==D&&D.find(q=>q.id==x.id);x.bs=d&&d.bs!=null?d.bs:newBeatSeed()}))}catch(e){}}
if(typeof loadCode=='function'){const lc0=loadCode;loadCode=function(){const r=lc0.apply(this,arguments);songSeeds();return r}}
setInterval(songSeeds,500);
/* recording: the song's beat plays under all four steps; the Beat bar sweeps in time with it */
if(typeof startRec=='function'){const s0=startRec;startRec=function(i){s0.apply(this,arguments);try{if(rec&&mode=='rec'){rec.bs=(Math.random()*4294967296)>>>0;
 const pk=(typeof S=='object'&&S&&S.bpick)||{};rec.s8=pk.s8!=null?pk.s8:'auto';rec.hh=pk.hh!=null?pk.hh:'auto';
 rec.bp=!!Beats.play({genre:rec.g,seed:rec.bs,s8:rec.s8,hh:rec.hh},{owner:'rec',form:'rec',intensity:.8,pads:1,alive:()=>!!rec&&mode=='rec'})}}catch(e){console.error('beats rec',e)}}}
function beatsBarTick(dt){rec.t+=dt;rec.cd=Math.max(0,rec.cd-dt);rec.fl=Math.max(0,rec.fl-dt);
 const b=Math.max(0,Beats.beat()),spb=60/Beats.bpm(),T=1/(.9*Math.pow(1.05,rec.hits)),n=[1,2,4].reduce((a,c)=>Math.abs(Math.log(c*spb/T))<Math.abs(Math.log(a*spb/T))?c:a);
 if(rec.bb==null){rec.bn=n;rec.bb=Math.round(b+.5*n)}else if(n!=rec.bn){const k=Math.round((b-rec.bb)/rec.bn),bc=rec.bb+k*rec.bn;rec.bb=k%2?bc-n:bc;rec.bn=n}
 let ph=((b-rec.bb)/rec.bn+.5)%2;if(ph<0)ph+=2;rec.pos=ph<1?ph:2-ph;rec.dir=ph<1?1:-1}
if(typeof recTick=='function'){const t0=recTick;recTick=function(dt){if(rec&&rec.bp&&Beats.playing()){Beats.setIntensity(rec.st==1?.3:rec.st==2?.6:rec.st==3?1:.8);if(!rec.st)return beatsBarTick(dt)}return t0.apply(this,arguments)}}
/* the beat's seed goes with the draft and the uploaded song, so the released song sounds like the session */
if(typeof mgFinish=='function'){const f0=mgFinish;mgFinish=function(){const bs=rec&&rec.bs,s8=rec&&rec.s8,hh=rec&&rec.hh,n=S.drafts.length;const r=f0.apply(this,arguments);try{if(bs!=null&&S.drafts.length>n){const d=S.drafts[S.drafts.length-1];d.bs=bs;if(s8!=null){d.s8=s8;d.hh=hh}}const c=Beats.current();if(c&&c.owner=='rec')Beats.stop(1.5)}catch(e){}return r}}
if(typeof upl=='function'){const u0=upl;upl=function(id){const d=S.drafts.find(x=>x.id==id),bs=d&&d.bs;const r=u0.apply(this,arguments);try{if(bs!=null){const x=S.songs.find(q=>q.id==id);if(x&&x.bs==null)x.bs=bs;if(x&&d.s8!=null&&x.s8==null){x.s8=d.s8;x.hh=d.hh}}}catch(e){}return r}}

/* Spotifly: a play button on each song on your artist page */
{const st=document.createElement('style');st.textContent='.sr .bpl{width:24px;height:24px;padding:0;margin:0;border-radius:50%;border:0;background:#1db954;color:#000;font-size:10px;line-height:24px;cursor:pointer;box-shadow:none}.sr .bpl:hover{transform:scale(1.08)}.sr.bon{background:#1db95422}.sr.bon b{color:#1db954}';document.head.appendChild(st)}
function beatsSfRows(){if(typeof app=='undefined'||app!=1||pg!='home'||!S.artist)return;const rows=document.querySelectorAll('#pc .mn .sr');if(!rows.length)return;
 const L=S.songs.slice().sort((a,b)=>b.streams-a.streams||b.id-a.id),sh=(typeof SALL!='undefined'&&SALL)?L:L.slice(0,5),cu=Beats.current();
 rows.forEach((el,i)=>{const s=sh[i],sp=el.firstElementChild;if(!s||!sp)return;const on=!!(cu&&cu.owner=='sf'&&cu.src===s);el.classList.toggle('bon',on);
  sp.innerHTML='';const b=document.createElement('button');b.className='bpl';b.textContent=on?'❚❚':'▶';b.title=on?'Stop':'Play "'+s.title+'" ('+Beats.plan(s).style+')';
  b.onclick=e=>{e.stopPropagation();const c=Beats.current();if(c&&c.owner=='sf'&&c.src===s)Beats.stop(.3);else{const p=Beats.play(s,{owner:'sf',alive:()=>mode=='pc'});if(p&&typeof say=='function')say('Now playing "'+s.title+'" · '+p.style+' · '+p.bpm+' bpm · '+p.key)}beatsSfRows()};sp.appendChild(b)})}
if(typeof pcR=='function'){const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{beatsSfRows()}catch(e){}return r}}

/* Park Fields Festival: the set's music goes through festMusic(set,dt) (70-festival.js); play the song's own beat instead of the drum loop */
if(typeof festMusic=='function'){const fm0=festMusic;festMusic=function(set,dt){Beats.fest(set);set.songT=(set.songT||0)+dt}}
