/* ===== WaveFern dev: music v1 (dev only). A copy of the beat engine (67-beats.js) with these changes, loaded after the game so it replaces window.Beats:
   1. Recorded multi-sampled instruments (audio/inst): grand piano, Rhodes, guitars (nylon, steel, clean, overdriven, distorted), basses
      (upright, finger, pick, slap), sax, trumpet, trombone, brass, flute, violin, fiddle, strings, choir, organ, banjo, harmonica, harp,
      vibes, marimba, kalimba, glockenspiel, celesta, music box, pan flute, accordion, steel drums. Several notes per instrument, so a note is
      never pitched more than about two semitones from a real recording. The old code-made voice plays until they load.
   2. Recorded drum kits per genre (audio/kits): boom bap tape kit, lo-fi kit, trap and 909 drum machines, techno, synth (80s), acoustic rock,
      soft acoustic (ballads, country, R&B), drum and bass, and a distorted kit for rage and phonk. Recorded 808s and hats picked in Extras still win.
   3. The tune is no longer swapped for the generic Lead or Pluck one-shot in half the songs (that is why so much sounded like "lead music").
      Each style picks its tune from instruments that fit it (sax and vibes for jazz rap, bells, kalimba and piano for trap, fiddle and harmonica for country...).
   4. The lead is a short motif that repeats: one bar (rap, hip-hop, electronic, lo-fi, Latin) or two bars (pop, rock, R&B, country), the same notes
      every time, and only the last note of bars 4 and 8 changes. It plays in the chorus (and the intro of loop-based styles), sits out the
      pre-chorus and bridge, and in the verse only styles built on a loop keep it, every other bar and quieter. It is also mixed lower.
   Sources and licences: docs/MUSIC-CREDITS.md. */
/* ===== v26.39: Beats, a procedural beat engine (Web Audio; drums and most voices are made in code, melodic one-shots can be samples from audio/oneshots) =====
   Every song gets its own beat: the genre gives a list of beat styles (boom bap, trap, drill, house, punk...),
   and a seed from the song (its id, or the seed saved when it was recorded) picks the style, key, scale,
   tempo, a progression for each section (verse, pre-chorus, chorus, bridge), a song layout, drum pattern variants, kit tuning and a composed hook
   melody (v49.54.0). Same song = same beat.
   API:
     Beats.play(song | {genre, seed, style}, {owner, alive, form:'song'|'live'|'rec', intensity, fadeIn, pads})
     Beats.stop(fade)  Beats.setIntensity(0..1)  Beats.setVolume(0..1)  Beats.playing()  Beats.current()
     Beats.plan(song)  Beats.analyze(song) (chords and melody as text, for tests)  Beats.beat() (quarter-note position, -1 if idle)  Beats.bpm()  Beats.styles  Beats.render(song, seconds)
   Volume follows the Music slider (VOL, M mutes). Audio only starts after the player has clicked or pressed a key,
   pauses with the pause menu or a hidden tab, and stops when its owner (recording, festival set, WaveFern) ends. */
var Beats=(function(){
'use strict';
/* ---------- small helpers ---------- */
const hash=s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const mix32=h=>{h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);return(h^h>>>16)>>>0};
const rng=seed=>{let a=mix32((seed>>>0)+0x9E3779B9)||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const mtof=m=>440*Math.pow(2,(m-69)/12);
const SC={min:[0,2,3,5,7,8,10],maj:[0,2,4,5,7,9,11],dor:[0,2,3,5,7,9,10],mix:[0,2,4,5,7,9,10],hmin:[0,2,3,5,7,8,11],phr:[0,1,3,5,7,8,10],lyd:[0,2,4,6,7,9,11]};
const SCN={min:'minor',maj:'major',dor:'dorian',mix:'mixolydian',hmin:'harmonic minor',phr:'phrygian',lyd:'lydian'};
const KEYN=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const NOTEN=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const semi=(sc,d)=>{const o=Math.floor(d/7),i=((d%7)+7)%7;return SC[sc][i]+12*o};
const FM=m=>m=='maj'||m=='mix'||m=='lyd'?'M':'m';

/* ---------- chord progressions ----------
   v49.54.0: real chord symbols instead of scale degrees. Roman numerals: capitals are major, lower case minor, b = flat, then
   7 (dominant on a capital, minor 7 on a lower case), M7 (major 7), o (diminished), ø7 (half diminished), sus4.
   m = the mode the progression lives in (the melody uses it too), t = the pools a style can ask for (its pr).
   A song picks its mode first, then a progression from the pool that lives in that mode, so the key, the mode and the
   chords all come from the seed. */
const L_=(m,t,c)=>({m,t:t.split(' '),c});
const LIB=[
 /* major: pop, doo-wop, canon, royal road, country */
 L_('maj','maj pop','I V vi IV'),L_('maj','maj pop','vi IV I V'),L_('maj','maj cty','I vi IV V'),L_('maj','maj','I IV vi V'),L_('maj','maj','IV I V vi'),
 L_('maj','maj','I V vi iii IV I IV V'),L_('maj','maj cty','I iii IV V'),L_('maj','maj cty rock','I IV V IV'),L_('maj','maj','vi V IV V'),L_('maj','maj','I iii vi IV'),
 L_('maj','maj','IV V iii vi'),L_('maj','maj cty','I IV I V'),L_('maj','cty maj','I IV V I'),L_('maj','cty','I V IV I'),L_('maj','maj','I IV iv I'),L_('maj','maj rock','I bIII IV I'),
 L_('maj','maj rock','vi IV I V'),L_('maj','maj','I V vi IV'),L_('maj','maj cty','I vi ii V'),L_('maj','maj','I IV ii V'),L_('maj','maj','IV I vi V'),
 /* major, jazz */
 L_('maj','jazz','IM7 vi7 ii7 V7'),L_('maj','jazz','ii7 V7 IM7 IM7'),L_('maj','jazz','iii7 vi7 ii7 V7'),L_('maj','jazz','IM7 vi7 IVM7 V7'),L_('maj','jazz','IVM7 iii7 ii7 IM7'),L_('maj','jazz','ii7 V7 iii7 vi7'),L_('maj','jazz','IM7 IVM7 iii7 vi7'),
 /* mixolydian */
 L_('mix','maj rock cty pop','I bVII IV I'),L_('mix','maj rock','I IV bVII IV'),L_('mix','maj rock cty','I bVII I IV'),L_('mix','maj rock pop','I bVII IV V'),L_('mix','maj rock','I bVII IV bVII'),
 /* lydian: dreamy */
 L_('lyd','maj pop','I II I II'),L_('lyd','maj pop','I II vi V'),L_('lyd','maj','IM7 II IM7 V'),
 /* natural minor: pop, rock, loops */
 L_('min','min pop mind','i bVI bIII bVII'),L_('min','min mind','i bVII bVI bVII'),L_('min','min rmin','i iv bVII bIII'),L_('min','min','i bVI iv V'),L_('min','min mind','i bIII bVII bVI'),
 L_('min','min rmin mind','i bVII bVI V'),L_('min','min rmin','bVI bVII i i'),L_('min','min rmin','i bVI bVII i'),L_('min','min rmin','i iv bVI bVII'),L_('min','min','i v bVI bVII'),L_('min','min','iv bVI i V'),
 L_('min','min pop','i bIII iv bVII'),L_('min','min pop','bVI bVII i v'),L_('min','min rmin','i bVII bVI bVII'),L_('min','rmin','i bVI bIII bVII'),
 L_('min','mind','i i bVI bVI'),L_('min','mind','i iv i iv'),L_('min','mind','i bVI i bVII'),L_('min','mind','i bVII i bVI'),L_('min','mind','i i iv v'),L_('min','mind','i i bVII bVI'),L_('min','mind','i i bIII bVII'),L_('min','mind','i bVI bVII bVII'),L_('min','mind','i iv bVII bVII'),
 /* minor, jazz */
 L_('min','jazz','iiø7 V7 i7 i7'),L_('min','jazz','i7 iv7 bVII7 bIIIM7'),L_('min','jazz','i7 bVIM7 iiø7 V7'),L_('min','jazz','i7 bVIM7 bIIIM7 V7'),
 /* harmonic minor: the major V pulls home */
 L_('hmin','mind rmin min','i bVI V V'),L_('hmin','mind rmin min','i iv V i'),L_('hmin','mind','i i V V'),L_('hmin','min mind','i bVI V i'),L_('hmin','mind min','i V i V'),
 /* dorian: vamps and soul */
 L_('dor','dvamp mind min','i IV i IV'),L_('dor','dvamp jazz mind','i7 IV7 i7 IV7'),L_('dor','dvamp min pop','i IV i bVII'),L_('dor','dvamp min','i bVII IV i'),L_('dor','dvamp min pop','i IV bVII IV'),L_('dor','dvamp jazz','i7 IV7 bIIIM7 IV7'),L_('dor','dvamp mind','i i IV IV'),L_('dor','dvamp min','i ii bIII IV'),L_('dor','jazz min','ii7 V7 IM7 vi7'),
 /* phrygian: dark */
 L_('phr','mind rmin','i bII i bII'),L_('phr','mind rmin','i bII bIII bII'),L_('phr','mind rmin min','i bII bVII i'),L_('phr','mind','i i bII bII'),L_('phr','mind rmin','i bVII bVI bII')];
const RN={I:0,II:2,III:4,IV:5,V:7,VI:9,VII:11};
/* a chord: r = root (semitones above the key), iv = the triad, sv = its 7th, e7 = the symbol names the 7th */
function chord(tok){const m=/^([b#]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(M7|7|ø7|o7|o|sus4)?$/.exec(tok);if(!m)throw new Error('bad chord '+tok);
 const up=m[2]===m[2].toUpperCase(),r=((RN[m[2].toUpperCase()]+(m[1]=='b'?-1:m[1]=='#'?1:0))%12+12)%12,s=m[3]||'';let iv=up?[0,4,7]:[0,3,7],sv=up?(r==7?10:11):10,e7=0,q=up?'':'m';
 if(s=='M7'){sv=11;e7=1;q='maj7'}else if(s=='7'){sv=10;e7=1;q=up?'7':'m7'}else if(s=='ø7'){iv=[0,3,6];sv=10;e7=1;q='m7b5'}else if(s=='o'||s=='o7'){iv=[0,3,6];sv=9;q='dim';e7=s=='o7'}else if(s=='sus4'){iv=[0,5,7];q='sus4'}
 return{tok,r,iv,sv,e7,q}}
const parseProg=s=>s.split(' ').map(chord);
const rot=(a,k)=>a.slice(k%a.length).concat(a.slice(0,k%a.length));
const chordName=(P,c)=>NOTEN[(P.tn+c.r)%12]+c.q;

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
{const AL={sax:'brass',altosax:'brass',trumpet:'brass',tbone:'brass',vibes:'bell',kalimba:'marimba',harp:'nylon',harmonica:'whine',violin:'fiddle',panflute:'flute',accordion:'organ',steeldrum:'marimba',slap:'funk',cgtr:'twang'};
 for(const n in AL)INS[n]=Object.assign({},INS[AL[n]])}

/* ---------- beat styles per genre ----------
   drum letters: k kick, s snare, c clap, n snap, h hat, o open hat, r rim, p shaker, b cowbell, y ride, t tom
   drum steps: . rest, x hit, X accent, g ghost, r hat roll. A list picks one per song; 32 characters = 2 bars.
   bass/chords: x root/chord, o octave, 5 fifth, 3 third, 7 seventh, b approach, u up-strum, - hold. bs.p 'k' follows the kick.
   arp (ar.p): digits pick chord tones (higher digits go up an octave). ld: hook melody (d density, all = also in verses). */
const BB='....X.......X...',HT='........X.......',H8='x.x.x.x.x.x.x.x.',HA='X.x.X.x.X.x.X.x.',FOUR='X...X...X...X...',OFF='..x...x...x...x.',G16='.g.g.g.g.g.g.g.g',SH='xgxgxgxgxgxgxgxg';
const DEM='...x..x....x..x.',CLV='x.....x.....x.......x...x.......';
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
 {n:'Punk',bpm:[165,185],sc:'maj',kit:'rock',dr:{k:FOUR,s:'..X...X...X...X.',y:H8},bs:{i:'pick',p:H8,o:40},ch:{i:'dist',x:5,p:H8,o:47},ld:{i:'lead',d:.3,o:72},crash:1,fill:'sn'},
 {n:'Arena Rock',bpm:[108,120],sc:['maj','mix'],kit:'rock',dr:{k:'X.......X.......',s:BB,h:H8},bs:{i:'pick',p:H8,o:40},ch:{i:'dist',x:5,p:'x-------x-------',o:47},ld:{i:'lead',d:.35,o:74},crash:1,fill:'tom',fx:{verb:.35}},
 {n:'Hard Rock Riff',bpm:[96,110],sc:['min','phr'],pr:'rmin',kit:'rock',dr:{k:'X.x.....X.x.x...',s:BB,h:H8},bs:{i:'pick',p:'x.xx.x.xx.x.x...',o:40},ch:{i:'chug',x:5,p:'x.xx.x.xx.x.x...',o:45},ld:{i:'lead',d:.25,o:72},crash:1,fill:'tom'},
 {n:'Indie Rock',bpm:[118,130],sc:'maj',kit:'rock',dr:{k:'X.....x.X.......',s:BB,h:H8},bs:{i:'pick',p:H8,o:40},ch:{i:'gtr',x:3,p:'x.......x.......',o:60},ar:{i:'gtr',p:['01232123','02130213'],r:2,o:64},ld:{i:'lead',d:.28,o:76},fill:'sn'},
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
 {n:'Future Bass',bpm:[140,150],sc:'maj',kit:'trap',dr:{k:'X.........x.....',c:HT,h:'x.x.x.x.x.xrx.x.'},bs:{i:'sub',p:'x-------x-----x-',o:36},ch:{i:'super',x:7,p:['x--.x--.x-.x-...','x-x-..x-x-..x-x-'],o:64},ld:{i:'pluck',d:.5,o:76},side:.8,fill:'drop',fx:{verb:.3}}],
/* v47.0.0: Latin. DEM is the dembow snare (3+3+2), CLV a 3-2 son clave over two bars */
'Latin':[
 {n:'Reggaeton',bpm:[88,96],sc:['min','phr'],pr:'mind',kit:'trap',dr:{k:FOUR,s:DEM,h:H8,p:SH},bs:{i:'808',p:'k',o:31,sl:.1,dr:1},ch:{i:'pad',x:3,p:'x---------------',o:60},ld:{i:'pluck',d:.4,o:74,all:1},fill:'roll',fx:{verb:.18}},
 {n:'Latin Trap',bpm:[132,142],sc:['min','hmin'],pr:'mind',cpb:.5,kit:'trap',dr:{k:'X......x..X.....',s:'...x..x....x..x.',h:'x.x.x.xrx.x.x.x.'},bs:{i:'808',p:'k',o:30,sl:.3,oc:.1},ch:{i:'nylon',x:3,p:'x..x..x.x..x..x.',o:60},ld:{i:'whine',d:.3,o:72},fill:'stop'},
 {n:'Bachata',bpm:[122,132],sc:['min','maj'],pr:['min','maj'],kit:'brush',dr:{k:'X.......X.......',r:'..x...x...x.x.x.',p:SH},bs:{i:'upright',p:'x..x..x.x..x..x.',o:36},ch:{i:'strum',x:3,p:'x...x...x...x...',o:60},ar:{i:'nylon',p:'0123212301232123',r:2,o:64},ld:{i:'nylon',d:.35,o:72},fx:{verb:.22}},
 {n:'Salsa',bpm:[176,196],sc:['min','maj'],pr:['min','mind'],cpb:.5,kit:'soft',dr:{k:'X.......X.......',r:CLV,b:'X.x.X.x.X.x.X.x.',p:SH},bs:{i:'upright',p:'...x..x....x..x.',o:36},ch:{i:'piano',x:3,p:'x.xx.x.xx.x.x.x.',o:62},ld:{i:'brass',d:.35,o:72,all:1},fill:'tom',fx:{verb:.2}},
 {n:'Cumbia',bpm:[90,102],sc:['min','maj'],pr:['min','maj'],kit:'soft',dr:{k:'X.......X.......',r:'....x.......x...',p:SH},bs:{i:'round',p:'x...5...x...5...',o:36},ch:{i:'pluck',x:3,p:'..x...x...x...x.',o:62},ld:{i:'organ',d:.4,o:72,all:1},fx:{verb:.18}},
 {n:'Latin Pop',bpm:[94,104],sc:'maj',pr:'maj',kit:'909',dr:{k:FOUR,s:DEM,h:H8},bs:{i:'sub',p:'k',o:36},ch:{i:'strum',x:3,p:'x.xux.xux.xux.xu',o:60},ld:{i:'pluck',d:.45,o:76},side:.3,fill:'drop',fx:{verb:.2}}]};
const GENRES=Object.keys(STY);
const GALIAS=[[/latin|reggaet|salsa|bachata|cumbia|dembow|merengue|urbano/,'Latin'],[/drill|trap|rage|plugg|phonk|^rap/,'Rap'],[/hip.?hop|boom|g.?funk/,'Hip-Hop'],[/r.?(and|&|n).?b|soul/,'R&B'],[/lo.?fi|chill/,'Lo-fi'],[/country|folk|bluegrass/,'Country'],[/edm|house|techno|trance|dance|electr|dub|dnb|drum/,'Electronic'],[/rock|punk|grunge|metal|indie/,'Rock'],[/pop/,'Pop'],[/jazz/,'Lo-fi'],[/funk|afro|gospel/,'R&B'],[/grime/,'Rap']];
function normG(g){if(!g)return 'Pop';if(STY[g])return g;const s=String(g).toLowerCase();for(const[re,n]of GALIAS)if(re.test(s))return n;return 'Pop'}

/* ---------- pattern parsing ---------- */
const VEL={x:.8,X:1,g:.3,o:.55,r:-1};
const PC=new Map();
function dpat(s){if(PC.has('d'+s))return PC.get('d'+s);const a=[];for(const c of s)a.push(VEL[c]||0);PC.set('d'+s,a);return a}
/* tonal patterns: one event per attack with its length in steps */
function tpat(s){if(PC.has('t'+s))return PC.get('t'+s);const a=new Array(s.length).fill(null);for(let i=0;i<s.length;i++){const c=s[i];if(c=='.'||c=='-')continue;let l=1;while(s[i+l]=='-')l++;a[i]={c,l}}PC.set('t'+s,a);return a}

/* ---------- the lead melody ----------
   v49.54.0: a hook is built the way pop writers build one, not drawn at random.
   - Rhythm first: one bar of rhythm (a cell) is the signature. Bar 2 answers it (same start, new ending), bar 3 repeats it, bar 4 closes it.
   - Notes move mostly by step, sometimes repeat, sometimes leap, and a leap is followed by a step back the other way.
   - The first and third beat land on a note of the chord that is playing; the notes between can pass through the scale.
   - Phrases end like sentences: the first asks (ends off the root), the next answers (ends on the root and holds).
   - The chorus is A A' B A'': the motif twice, a higher contrasting phrase that climbs, then the motif again to finish.
   - A repeated bar uses the same random choices, so over the same chord it is the same melody, and over a new chord it is the same
     tune moved to fit (a sequence), which is how hooks stick. */
const CELLS={
 s:[[[0,6],[6,2],[8,8]],[[0,4],[4,4],[8,8]],[[2,6],[8,4],[12,4]],[[0,8],[8,4],[12,4]],[[0,3],[4,4],[10,6]],[[0,6],[8,6]],[[0,2],[4,4],[10,2],[12,4]]],
 m:[[[0,3],[3,3],[6,2],[8,4],[12,4]],[[0,2],[2,2],[4,4],[8,3],[11,5]],[[0,4],[4,2],[6,2],[8,4],[12,2],[14,2]],[[2,2],[4,2],[6,2],[8,6],[14,2]],[[0,3],[3,3],[6,3],[9,3],[12,4]],[[0,2],[3,2],[6,2],[8,4],[12,4]],[[0,4],[6,2],[8,2],[10,2],[12,4]]],
 d:[[[0,2],[2,2],[4,2],[6,2],[8,2],[10,2],[12,4]],[[0,1],[1,1],[2,2],[4,2],[6,1],[7,1],[8,4],[12,2],[14,2]],[[0,2],[2,1],[3,1],[4,2],[6,2],[8,2],[10,1],[11,1],[12,4]],[[0,2],[2,2],[4,2],[6,2],[8,2],[10,2],[12,2],[14,2]]]};
const cellPick=(r,d)=>{let c=d<.3?0:d<.5?1:2;const u=r();if(u<.18&&c>0)c--;else if(u>.84&&c<2)c++;const L=CELLS['smd'[c]];return L[r()*L.length|0]};
const respond=(R,r,d)=>{if(r()<.3)return R;const T=cellPick(r,d),a=R.filter(x=>x[0]<8),b=T.filter(x=>x[0]>=8);return a.length&&b.length?a.concat(b):R};
/* the steps between notes (in scale steps) for a phrase of n notes */
function moves(r,n,kind){const out=[0];let last=0;
 for(let j=1;j<n;j++){let dir=kind=='up'?1:kind=='down'?-1:kind=='arch'?(j<=n/2?1:-1):kind=='wave'?(j%2?1:-1):(r()<.5?1:-1),mv;
  if(r()>.76)dir=-dir;if(Math.abs(last)>=3)dir=-Math.sign(last);
  const p=r();mv=kind=='narrow'?(p<.45?0:1):Math.abs(last)>=3?1:p<.08?0:p<.68?1:p<.88?2:p<.96?3:4;
  last=mv*dir;out.push(last)}
 if(kind!='narrow'&&n>=4&&r()<.2){out[1]=0;out[2]=0;out[3]=(r()<.7?1:-1)*(2+(r()*3|0))}   /* the "da da da DAA" hook gesture */
 return out}
/* the notes you can play over a chord: the scale plus the chord's own notes, without the scale note a semitone below a chord note that is not in the scale */
function poolOf(P,cd){const k=cd.r+':'+cd.iv.join(),c=P.pl[k];if(c)return c;
 const ct=new Set(cd.iv.map(x=>(P.tn+cd.r+x)%12));if(cd.e7)ct.add((P.tn+cd.r+cd.sv)%12);const set=new Set(P.spc);
 ct.forEach(x=>{if(!set.has(x)){const lo=(x+11)%12;if(set.has(lo)&&!ct.has(lo))set.delete(lo);set.add(x)}});
 const o=P.ld.o,midi=[];for(let m=o-13;m<=o+15;m++)if(set.has(((m%12)+12)%12))midi.push(m);
 return P.pl[k]={midi,ct,isCT:i=>ct.has(((midi[i]%12)+12)%12)}}
const nearIdx=(M,x)=>{let b=0,d=1e9;for(let i=0;i<M.length;i++){const e=Math.abs(M[i]-x);if(e<d){d=e;b=i}}return b};
function ctNear(pl,i,dir,skipRoot,rootPc,avoid){const M=pl.midi;for(let d=0;d<M.length;d++){for(const s of dir>=0?[1,-1]:[-1,1]){const j=i+s*d;if(j>=0&&j<M.length&&pl.isCT(j)&&!(skipRoot&&((M[j]%12)+12)%12==rootPc)&&M[j]!=avoid)return j}}return avoid!=null?ctNear(pl,i,dir,skipRoot,rootPc):i}
/* one bar of melody: cell R, steps mv, chords from chAtS(step), starting near pitch `st`, in the range lo..hi */
function realize(P,seed,R,mv,chAtS,st,lo,hi,vel){const r=rng(seed),row=new Array(16).fill(null);let prev=st,p1=-1,p2=-2;
 for(let j=0;j<R.length;j++){const s=R[j][0],cd=chAtS(s),pl=poolOf(P,cd),M=pl.midi;let i=nearIdx(M,prev)+(j?mv[j]:0);i=Math.max(0,Math.min(M.length-1,i));
  while(i>0&&M[i]>hi)i--;while(i<M.length-1&&M[i]<lo)i++;
  const sn=s%8==0?.97:s%4==0?.62:0,u=r();if(sn&&u<sn&&(!pl.isCT(i)||(M[i]==prev&&mv[j]&&j>0))){i=ctNear(pl,i,mv[j]||1,0,0,mv[j]&&j>0?prev:null);while(i>0&&M[i]>hi)i--}
  if(j>=3&&mv[j]&&M[i]==p1&&p1==p2)i=Math.max(0,Math.min(M.length-1,i+(mv[j]>0?1:-1)));
  p2=p1;p1=M[i];prev=M[i];row[s]={m:prev,l:R[j][1],v:(s%4==0?.95:.74)*(vel||1)}}
 return row}
/* how a phrase ends: 'q' on a chord note that is not the root (still asking), 'a' on the root, held */
function finish(P,row,chAtS,kind){let s=15;while(s>=0&&!row[s])s--;if(s<0)return;const n=row[s],cd=chAtS(s),pl=poolOf(P,cd),M=pl.midi,rp=(P.tn+cd.r)%12,i=nearIdx(M,n.m);
 let j=kind=='a'?(()=>{for(let d=0;d<M.length;d++)for(const sg of[1,-1]){const q=i+sg*d;if(q>=0&&q<M.length&&((M[q]%12)+12)%12==rp)return q}return i})():ctNear(pl,i,-1,true,rp);
 n.m=M[j];n.l=Math.max(n.l,Math.min(kind=='a'?12:6,16-s));if(kind=='a')n.v=Math.max(n.v,.95)}
const LOOPG={'Rap':1,'Hip-Hop':1,'Electronic':1,'Lo-fi':1,'Latin':1};
/* a repeated bar over a new chord: the same notes, except a note outside the chord's scale moves to the nearest one,
   and a note on beat 1 or 3 that is not a chord note moves to a chord note a step away */
function fitRow(P,row,chAtS){return row.map((n,s)=>{if(!n)return null;const cd=chAtS(s),pl=poolOf(P,cd);let m=n.m;
 if(!pl.midi.includes(m))m=pl.midi[nearIdx(pl.midi,m)];
 else if(s%8==0&&!pl.ct.has(((m%12)+12)%12)){for(const d of[1,-1,2,-2])if(pl.ct.has((((m+d)%12)+12)%12)){m+=d;break}}
 return{m,l:n.l,v:n.v}})}
const lastM=(row,dft)=>{for(let s=15;s>=0;s--)if(row[s])return row[s].m;return dft};
function buildLead(P,seed){const ld=P.ld;if(!ld)return;const r=rng(seed),o=ld.o,loopy=!!(ld.all||LOOPG[P.genre]),sd=n=>(seed^Math.imul(n+1,0x9E3779B1))>>>0;
 const d=Math.min(ld.d,loopy?.4:.34),CA=(k,i,n)=>s=>chAt(P,k,i,n,s),n=P.nm.hk;
 /* the motif: one bar of rhythm and a simple shape, in a narrow range */
 const R1=cellPick(r,d),M1=moves(r,R1.length,['arch','down','wave','up'][r()*4|0]);
 const A=realize(P,sd(1),R1,M1,CA('hk',0,n),o,o-5,o+7);
 /* song-like styles get a two-bar idea: bar 2 starts like bar 1 and answers it */
 const two=!loopy,R2=two?respond(R1,r,d):null,B=two?realize(P,sd(2),R2,moves(r,R2.length,'down'),CA('hk',1,n),lastM(A,o),o-5,o+7):null;
 const hk=[];for(let b=0;b<n;b++){const ch=CA('hk',b,n),ph=b%8,row=fitRow(P,two&&b%2?B:A,ch);if(ph==3||ph==7)finish(P,row,ch,ph==7?'a':'q');hk.push(row)}
 P.mhk=hk;
 /* verse (only styles that keep a lead going): the same motif every other bar, quieter, so the vocal has room */
 const nv=P.nm.vs,vs=[];for(let b=0;b<nv;b++){if(b%2){vs.push(new Array(16).fill(null));continue}
  vs.push(fitRow(P,two&&(b>>1)%2?B:A,CA('vs',b,nv)).map(x=>x&&{m:x.m,l:x.l,v:x.v*.8}))}
 P.mvs=vs;P.mpc=[];P.mbr=[];
 /* loop-based styles open with the motif on its own */
 P.min=loopy?[fitRow(P,A,CA('in',0,2)),fitRow(P,A,CA('in',1,2))]:null}

/* ---------- the plan: everything about a song, worked out from its seed ---------- */
function seedOf(src){if(src.seed!=null)return typeof src.seed=='number'?src.seed>>>0:hash(src.seed);if(src.bs==null&&typeof songSeeds=='function')songSeeds();if(src.bs!=null)return src.bs>>>0;return hash(normG(src.genre||src.g)+'#'+(src.id!=null?src.id:src.title||''))}
/* major and minor are by far the most common; other modes are the occasional colour (about 1 song in 8). A style that lists a mode itself (drill: harmonic minor) keeps it 40% of the time. */
const FLAV={maj:[['mix',.06],['lyd',.025]],min:[['dor',.07],['phr',.02],['hmin',.025]]},FOLD={maj:'maj',min:'min',mix:'maj',lyd:'maj',dor:'min',phr:'min',hmin:'min'};
/* a style's own list of other lead sounds the seed can pick from */
const LDX={'Boom Bap':['brass','piano','flute','sax','vibes','strings'],'Jazz Rap':['sax','flute','vibes','epiano','trumpet'],'G-Funk':['whine','sine','square'],'Soul Chop':['strings','brass','piano','violin'],'Southern Bounce':['square','bell','brass'],'Breakbeat':['brass','organ','sax'],
 'Trap':['bell','piano','pbell','kalimba','harp','flute'],'UK Drill':['piano','strings','violin','harp','bell'],'NY Drill':['bell','piano','choir','violin'],'Rage':['super','saw','square'],'Plugg':['pbell','bell','kalimba','sine'],
 'Dance Pop':['saw','pluck','super','piano'],'Synth-pop':['square','saw','pluck','bell'],'Pop Ballad':['piano','bell','strings','harp'],'Tropical':['marimba','steeldrum','panflute','kalimba'],'Bedroom Pop':['cgtr','epiano','bell','sine','vibes'],'Disco Pop':['strings','brass','saw','cgtr'],
 'Garage Rock':['dist','twang','organ'],'Punk':['dist','twang'],'Arena Rock':['dist','twang','organ'],'Hard Rock Riff':['dist','twang'],'Indie Rock':['twang','gtr','organ','bell'],'Grunge':['dist','twang'],
 'Slow Jam':['epiano','sax','sine','strings'],'Neo-Soul':['epiano','sax','vibes','flute','cgtr'],'Trap Soul':['epiano','piano','bell','cgtr'],'New Jack Swing':['bell','brass','piano'],'Alt R&B':['whine','epiano','sine','cgtr'],'Afro R&B':['flute','kalimba','marimba','cgtr','steeldrum'],
 'Chillhop':['vibes','epiano','kalimba','flute','bell'],'Jazzhop':['sax','flute','vibes','piano','trumpet'],'Rainy Day':['nylon','piano','harp','kalimba'],'Lo-fi Bossa':['flute','nylon','vibes','sax'],'Sleepy':['mbox','kalimba','harp','bell'],'Tape Beat':['flute','vibes','epiano','sax'],
 'Train Beat':['twang','harmonica','fiddle'],'Honky Tonk':['piano','fiddle','twang','harmonica'],'Country Ballad':['steel','fiddle','piano','harmonica'],'Country Pop':['twang','banjo','fiddle'],'Bluegrass':['fiddle','banjo','harmonica'],'Country Trap':['twang','banjo','harmonica'],
 'House':['piano','organ','pluck','bell'],'Trance':['super','pluck','saw'],'Drum & Bass':['bell','piano','strings','sine'],'Dubstep':['square','saw','bell'],'Synthwave':['saw','square','lead'],'Future Bass':['pluck','super','bell','kalimba'],'Techno':['stab','bell','pluck'],
 'Reggaeton':['pluck','bell','nylon','whine'],'Latin Trap':['whine','nylon','piano','bell'],'Bachata':['nylon','cgtr'],'Salsa':['brass','trumpet','piano','tbone'],'Cumbia':['accordion','organ','flute'],'Latin Pop':['nylon','pluck','trumpet','flute']};
/* four ways to lay out a song, all 46 bars (the game counts a play-through from this): [section, bars]; in intro, vs verse, pc pre-chorus, hk chorus, br bridge */
const SONGF=[[['in',2],['vs',8],['hk',8],['vs',8],['hk',8],['br',4],['hk',8]],
 [['in',2],['vs',6],['pc',2],['hk',8],['vs',6],['pc',2],['hk',8],['br',4],['hk',8]],
 [['in',2],['hk',8],['vs',8],['hk',8],['br',4],['vs',8],['hk',8]],
 [['in',2],['vs',4],['pc',4],['hk',8],['vs',4],['pc',4],['hk',8],['br',4],['hk',8]]];
const SLD={'Pop':.5,'Electronic':.6,'Rap':.5,'Lo-fi':.55,'R&B':.55,'Hip-Hop':.5,'Latin':.45,'Country':.3,'Rock':.3},SLP={'Pop':.4,'Electronic':.4,'Rap':.45,'Latin':.45,'Lo-fi':.25,'R&B':.25,'Hip-Hop':.3,'Country':.5,'Rock':.2};
const SPD={'Pop':.8,'Electronic':.8,'Rap':.7,'Lo-fi':.8,'R&B':.9,'Hip-Hop':.7,'Latin':.6,'Country':.6,'Rock':.5},SPK={'Pop':.8,'Electronic':.8,'Rap':.7,'Latin':.6,'R&B':.55,'Lo-fi':.6,'Hip-Hop':.5,'Country':.3,'Rock':0};
const PKP=['0.2.1.2.0.2.1.2.','0120120120120121','0.1.2.3.2.1.0.1.','0.1.2.1.0.1.2.1.','.0.2.1.2.0.2.1.2','0.12.12.0.12.12.'];
const COMPH=['x---------------','x-------x-------'],COMPX=['x--x--x-x--x--x-','x---x--.x---x-x-','x-.x-.x-x-.x-.x-','..x...x...x..x..','x--.x--.x-.x----'],COMPI=['piano','epiano','super','stab','marimba','nylon','gtr','pluck','bell','pbell'];
function plan(src){if(typeof src=='string')src={genre:src};src=src||{};const genre=normG(src.genre||src.g),seed=seedOf(src),r=rng(seed^0x5bd1e995),L=STY[genre];
 const pk=a=>Array.isArray(a)?a[r()*a.length|0]:a,si=src.style!=null?((src.style%L.length)+L.length)%L.length:r()*L.length|0,st=L[si];
 const bpm=Math.round(st.bpm[0]+r()*(st.bpm[1]-st.bpm[0])),key=r()*12|0,kr=((key+6)%12)-6;
 /* mode: the style's own, or now and then a modal colour (dorian, mixolydian, lydian, phrygian...) */
 let sc=pk(st.sc)||'min';const own=sc!=FOLD[sc];if(own&&rng(seed^0xA11)()>=.4)sc=FOLD[sc];const basic=!own||sc==FOLD[sc],fl=FLAV[sc];
 const rH=rng(seed^0xC0FFEE);
 if(fl&&basic){const u=rH()*(genre=='Country'?2.5:genre=='Pop'?1.7:1);let a=0;for(const[m,p]of fl){a+=p;if(u<a){sc=m;break}}}
 /* chords: a progression from the style's pool that lives in that mode; verse, chorus, bridge, pre-chorus and intro each get their own */
 const pn=st.pr?pk(st.pr):FM(sc)=='M'?'maj':'min';
 let cand=LIB.filter(e=>e.m==sc&&e.t.includes(pn));if(!cand.length)cand=LIB.filter(e=>e.m==sc);if(!cand.length)cand=LIB.filter(e=>FM(e.m)==FM(sc)&&e.t.includes(pn));if(!cand.length)cand=LIB.filter(e=>FM(e.m)==FM(sc));
 const E0=cand[rH()*cand.length|0];sc=E0.m;const others=cand.filter(e=>e.c!=E0.c),oth=()=>parseProg(others[rH()*others.length|0].c);
 const loopy=pn=='mind'||pn=='dvamp',pA=parseProg(E0.c);let u=rH(),pB=loopy?(u<.55?pA:u<.8?rot(pA,2):others.length?oth():pA):(u<.2?pA:u<.55?rot(pA,2):others.length?oth():rot(pA,2));
 u=rH();const pC=u<.5&&others.length?oth():rot(pA,u<.75?1:3),fm=FM(sc);
 const pcs=fm=='M'?[['IV','V'],['ii','V'],['vi','V'],['IV','V']]:sc=='phr'?[['bVI','bVII'],['bII','bVII']]:[['bVI','V'],['iv','V'],['bVI','bVII'],['iv','bVII']];
 const pg={vs:pA,hk:pB,br:pC,pc:pcs[rH()*pcs.length|0].map(chord),in:(rH()<.5?pB:pA).slice(0,2)};
 const dom=chord('V'),cad=['maj','min','hmin'].includes(sc)&&['maj','min','jazz','rock','rmin','cty'].includes(pn)&&rH()<.75?dom:null;
 /* the song's shape */
 const rF=rng(seed^0xF0F0),fi=rF()*SONGF.length|0,fsong=SONGF[fi],nm={in:2,hk:8,br:4,pc:2,vs:8};fsong.forEach(s=>{if(s[0]=='vs'&&nm.vsSet==null){nm.vs=s[1];nm.vsSet=1}if(s[0]=='pc')nm.pc=s[1];if(s[0]=='br')nm.br=s[1]});
 /* kit: copy and nudge */
 const kb=KIT[st.kit]||KIT.dusty,kit={};for(const p in kb){kit[p]={};for(const q in kb[p])kit[p][q]=kb[p][q]*(q=='v'?1:.9+r()*.2)}
 if(st.kv)for(const p in st.kv)for(const q in st.kv[p])kit[p]=Object.assign({},kit[p],{[q]:st.kv[p][q]});
 const dk=[];for(const k in st.dr){const s=pk(st.dr[k]);if(s)dk.push([k,dpat(s)])}
 /* the seed also moves a kick or two, so two songs in one style do not share a groove (not four on the floor, not drum and bass) */
 const rD=rng(seed^0xD2D2),kd=dk.find(x=>x[0]=='k');
 if(kd&&st.bpm[0]<160){const pa=kd[1].slice(),cnt=pa.filter(Boolean).length/(pa.length/16);
  if(cnt<=3.2){const busy=k=>dk.some(x=>(x[0]=='s'||x[0]=='c'||x[0]=='n')&&x[1][k%x[1].length]);
   const add=rD()<.55?1+(rD()<.4?1:0):0;for(let a=0;a<add;a++){const c=[3,6,7,10,11,14][rD()*6|0]+(pa.length>16&&rD()<.5?16:0);if(!pa[c]&&!busy(c))pa[c]=.8}
   if(cnt>=2&&rD()<.22){const hs=pa.map((v,i)=>v&&i%16?i:-1).filter(i=>i>0);if(hs.length)pa[hs[rD()*hs.length|0]]=0}
   kd[1]=pa}}
 const kp=dk.find(x=>x[0]=='k');
 const comp=p=>COMPH.includes(p)&&COMPI.includes(st.ch&&st.ch.i)&&rD()<.4?COMPX[rD()*COMPX.length|0]:p;
 let bs=st.bs?Object.assign({},st.bs,{p:pk(st.bs.p)}):null,ch=st.ch?Object.assign({},st.ch,{i:pk(st.ch.i),p:comp(pk(st.ch.p))}):null,ar=st.ar?Object.assign({},st.ar,{p:pk(st.ar.p)}):null;
 let ld=st.ld?Object.assign({},st.ld):null;if(ld&&LDX[st.n])ld.i=pk((ld.i=='lead'&&genre!='Electronic'?[]:[ld.i]).concat(LDX[st.n]));
 /* the recorded Lead and Pluck samples play the tune in about half the songs */
 const rS=rng(seed^0x5A5A);rS();rS();
 /* a sustained pad under the chorus, bridge and pre-chorus, and a pluck arpeggio in the chorus: more of the recorded Pad and Pluck samples */
 const padish=st.ch&&['pad','strings','choir'].includes(st.ch.i),ROCKY=genre=='Rock'&&!/Arena|Indie/.test(st.n);
 const pd=!padish&&!ROCKY&&rS()<(SPD[genre]||.6)?{i:'pad',x:7,o:58}:null;
 /* every song has its own arrangement: the style's own arp is dropped in about 1 song in 3, the pluck arp and the pad are each in only some songs and in different sections, the verse chords may sit out, and the intro may have no drums */
 if(ar&&rS()<.3)ar=null;
 const pkp=!ar&&!ROCKY&&rS()<(SPK[genre]||.4)*.7?{i:'pluck',p:PKP[rS()*PKP.length|0],r:1,o:rS()<.5?67:72,x:3,sec:rS()<.5?'hk':'hk pc'}:null;
 if(pd)pd.sec=['hk','hk pc br','hk pc br in','hk br vs'][rS()*4|0];
 const arr={vsNoCh:rS()<.2,inDr:rS()<.5};
 const P={genre,style:st.n,si,count:L.length,seed,bpm,key,kr,tn:key,sc,keyName:KEYN[key]+' '+SCN[sc],pn,pg,cad:cad?{vs:cad,br:cad}:null,nm,fi,fm:{song:fsong,live:FORMS.live,rec:FORMS.rec},cpb:st.cpb||1,sw:st.sw||0,kit,dk,kick:kp?kp[1]:null,bs,ch,ar,ld,pd,pk:pkp,arr,
  spc:new Set(SC[sc].map(x=>(x+key)%12)),pl:{},
  sp:src.sp&&typeof src.sp=='object'?src.sp:{bass:'auto',key:'auto',lead:'auto',pad:'auto',pluck:'auto'},s8:dPick(src.s8,N808,seed,0x808),hh:src.hh=='auto'&&!/^(trap|b808)$/.test(st.kit)?'':dPick(src.hh,DHAT,seed,0x4a7),
  dkit:src.dk===''?'':(KITS_N[st.n]||KITM[st.kit]||''),dskip:KSKIP[st.kit]||'',kt:.97+rD()*.06,fill:st.fill||'',crash:!!st.crash,side:st.side||0,fx:st.fx||{},mx:Object.assign({dr:1,bs:.6,ch:.3,ar:.2,ld:.19,pd:.26,pk:.2},st.mx||{})};
 if(src.over)Object.assign(P,src.over);/* tools/mix-calibrate.js plays one layer at a time */
 buildLead(P,seed^0xBADA55);return P}

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
 pumpAt(E,t)}
function pumpAt(E,t){if(E.P.side&&E.pump){const p=E.pump.gain;p.cancelScheduledValues(t);p.setValueAtTime(p.value>0?p.value:1,t);p.linearRampToValueAtTime(1-E.P.side*.75,t+.01);p.setTargetAtTime(1,t+.03,E.sd*1.1)}}
function snare(E,t,v){const S=E.P.kit.s;if(S.tn&&S.f)tone(E,t,'triangle',S.f,S.f*.75,.05,.09,v*S.tn*.8,E.dr);nz(E,t,S.dec,v*S.nz*.7,'bandpass',S.nf,S.nq,E.dr,S.rv);nz(E,t,S.dec*.6,v*S.nz*.35,'highpass',5000,.5,E.dr)}
function clap(E,t,v){const C=E.P.kit.c,c=E.c,s=c.createBufferSource(),g=c.createGain();s.buffer=E.nb;s.loop=true;
 const G=g.gain;G.setValueAtTime(0,t);for(let i=0;i<3;i++){G.linearRampToValueAtTime(v*.9,t+i*.011+.001);G.linearRampToValueAtTime(v*.15,t+i*.011+.009)}G.linearRampToValueAtTime(v*.8,t+.034);G.setTargetAtTime(0,t+.035,C.dec/4);
 s.connect(g);g.connect(sf(E,'bandpass',C.f,1.4,E.dr,.25));s.start(t,(t*3.7)%1.5);s.stop(t+C.dec*1.4+.08)}
function hat(E,t,v,open){const H=E.P.kit.h,b=!open&&E.uh&&dBuf(E.c,'hat',E.P.hh);
 if(b){const s=E.c.createBufferSource(),g=E.c.createGain();s.buffer=b;g.gain.value=v*.4;s.connect(g);g.connect(E.dr);s.start(t);return}nz(E,t,open?H.od:H.cd,v*H.v*1.4,'highpass',H.f,.6,E.dr,open?.08:0)}
function drum(E,key,t,v){const ks=E.ks;if(ks){const z=ks[key=='t'?((E.tf||150)>150?'th':(E.tf||150)>110?'tm':'tl'):key];if(z&&!(key=='h'&&E.uh)){kitHit(E,key,z,t,v);if(key=='k')pumpAt(E,t);return}}
 switch(key){
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
   Recorded one-shots, each pitched to the note the beat plays. Only the small manifest loads up front; a song fetches just
   the one sample per instrument family it uses (v49.51.0: lazy, it used to fetch every file on the first beat). Until a
   sample has loaded, or if the files cannot be fetched (for example from a file:// page), the code-made voice for that
   instrument plays as before.
   v49.51.0: a song can name its sample per family (sp: {bass, key, lead, pad, pluck...}: 'auto' picks one from the song's seed,
   '' keeps the code-made voice, a file name picks that sample). Songs without sp are older ones: they keep the original
   sample set (the entries with no n in the manifest) and the original instrument-to-family map, so they sound as they did. */
const LAYS=['bs','ch','ar','ld','pd','pk'];
/* v49.59.0: per-instrument mix gains from tools/mix-calibrate.js (each instrument and each style's drums measured on their own and brought to a target level for their role) */
const LDG=.72;
/* loudness (dev music v1). The target is -14 LUFS integrated with peaks at or under -1 dBFS, measured at full Music volume (the Music slider
   then turns it down as before). The song's own output is K-weighted (ITU-R BS.1770: a +4 dB shelf above 1.5 kHz and a 38 Hz high-pass),
   cut into 400 ms blocks, gated (blocks under -70 LUFS, and 10 LU under the running average, are left out) and averaged since the song began;
   the song's gain then moves towards -14 LUFS at no more than 1 dB a second, between -6 and +12 dB, so it never pumps with the music.
   The mix bus is first trimmed so its peaks sit around -6 dBFS with no limiter on it (it used to run about 9 dB over full scale into the master compressor). The gain a style ended on is remembered and is where its next song starts. After the master compressor and soft clip, a final -1 dB gain
   means no sample can go over -1 dBFS (the soft clip's output never passes full scale). */
const BUS_TRIM=0.13,LUFS=-14,LV_CAP=Math.pow(10,-1/20);let LVM={};try{LVM=JSON.parse(localStorage.getItem('fw_lufs')||'{}')||{}}catch(e){}
const lvStart=P=>{const v=+LVM[P.style];return isFinite(v)?Math.max(-6,Math.min(12,v)):9};
function lvTick(E,now){const A=E.lva;if(!A||E.paused)return;A.getFloatTimeDomainData(E.lvb);let ms=0;const b=E.lvb;for(let i=0;i<b.length;i++)ms+=b[i]*b[i];ms/=b.length;
 E.lvs.push(ms);if(E.lvs.length<16)return;const blk=E.lvs.splice(0,E.lvs.length).reduce((a,x)=>a+x,0)/16;
 /* a block of ~400 ms (16 reads 25 ms apart); +3 dB because the analyser hears the stereo mix folded to mono */
 const L=-.691+10*Math.log10(blk+1e-12)+3.01;if(L<-70)return;E.lvB=E.lvB||[];E.lvB.push(blk);if(E.lvB.length>600)E.lvB.shift();
 const all=E.lvB,avg=a=>a.reduce((x,y)=>x+y,0)/a.length,lu=m=>-.691+10*Math.log10(m+1e-12)+3.01,rel=lu(avg(all))-10,g=all.filter(m=>lu(m)>=rel);
 const I=lu(avg(g.length?g:all)),want=Math.max(-6,Math.min(12,LUFS-I)),dt=Math.min(1,now-(E.lvt||now));E.lvt=now;
 const step=(all.length<8?3:1)*Math.max(dt,.4);E.lvdb+=Math.max(-step,Math.min(step,want-E.lvdb));
 E.lv.gain.setTargetAtTime(Math.pow(10,E.lvdb/20),now,.3);
 if(all.length%25==0){LVM[E.P.style]=+E.lvdb.toFixed(2);try{localStorage.setItem('fw_lufs',JSON.stringify(LVM))}catch(e){}}}
const MIXT={"bs:bass":0.71,"ch:piano":0.72,"ld:brass":1.38,"dr:Boom Bap":0.79,"ld:piano":1.21,"ld:flute":0.86,"ld:strings":1.29,"ld:lead":1.3,"ld:pluck":2.38,"bs:upright":0.85,"dr:Jazz Rap":0.87,"ch:epiano":0.87,"ld:bell":1.14,"ld:epiano":1.31,"dr:G-Funk":1.02,"bs:funk":0.67,"ch:pad":0.78,"ld:whine":0.88,"ld:saw":1.43,"ld:square":0.94,"dr:Soul Chop":0.75,"ch:stab":1.03,"dr:Southern Bounce":0.94,"bs:808":0.66,"dr:Breakbeat":1.31,"ch:organ":0.59,"dr:Trap":0.85,"ld:pbell":1.07,"dr:UK Drill":0.86,"ch:strings":0.77,"ch:choir":0.6,"dr:NY Drill":0.91,"dr:Rage":0.74,"ld:super":1.18,"dr:Plugg":0.88,"ld:sine":0.96,"dr:Phonk":0.72,"ld:cowbell":0.86,"dr:Dance Pop":0.82,"bs:pluckb":1.16,"dr:Pop Ballad":1.6,"ar:pluck":1.08,"dr:Synth-pop":0.92,"ch:super":0.97,"bs:round":0.68,"ar:piano":0.84,"bs:sub":0.86,"dr:Tropical":1.25,"ld:marimba":1.39,"ch:marimba":0.94,"ch:gtr":0.88,"dr:Bedroom Pop":1.28,"dr:Disco Pop":0.83,"ar:mute":1.43,"dr:Garage Rock":1.0,"bs:pick":0.76,"ch:dist":0.59,"dr:Arena Rock":1.17,"dr:Hard Rock Riff":1.03,"dr:Punk":0.93,"ch:chug":0.78,"dr:Indie Rock":1.05,"ar:gtr":0.93,"dr:Grunge":1.06,"dr:Slow Jam":1.45,"dr:Trap Soul":0.72,"dr:Neo-Soul":0.8,"dr:Alt R&B":0.75,"dr:New Jack Swing":0.83,"dr:Afro R&B":1.22,"dr:Rainy Day":0.87,"dr:Jazzhop":0.83,"dr:Chillhop":0.79,"ar:nylon":1.14,"dr:Sleepy":1.07,"dr:Lo-fi Bossa":0.77,"ld:mbox":1.13,"ch:nylon":0.89,"dr:Train Beat":1.6,"ch:strum":0.69,"dr:Tape Beat":0.71,"ld:twang":2.0,"dr:Honky Tonk":1.24,"dr:Country Ballad":1.6,"ld:steel":0.85,"ld:fiddle":1.39,"dr:Bluegrass":1.6,"dr:Country Pop":0.87,"dr:Country Trap":0.85,"ar:banjo":0.83,"dr:House":0.81,"dr:Techno":0.72,"bs:acid":1.28,"ld:organ":0.98,"dr:Drum & Bass":1.0,"bs:reese":0.61,"dr:Dubstep":0.95,"bs:wob":0.62,"dr:Trance":0.82,"dr:Synthwave":1.06,"dr:Reggaeton":0.91,"dr:Future Bass":0.92,"dr:Latin Trap":0.92,"ld:nylon":2.09,"dr:Cumbia":1.41,"dr:Bachata":1.41,"ch:pluck":1.2,"bs:smp":2.44,"dr:Latin Pop":0.86,"ld:smp":4.13,"ch:smp":3.45,"dr:Salsa":1.22,"ar:smp":1.82,"pd:smp":2.55,"pk:smp":1.6,"pd:pad":0.66,"pk:pluck":0.98};
const SMP={},SMP_OF={bass:'bass',round:'bass',upright:'bass',funk:'bass',pluckb:'bass',pick:'bass',acid:'bass',reese:'bass',wob:'bass',
 epiano:'key',piano:'piano',bell:'bell',pbell:'bell',brass:'brass',lead:'lead',pluck:'pluck',flute:'flute',strings:'string',super:'synth'},
 SMP_OF2=Object.assign({},SMP_OF,{pad:'pad',choir:'pad',organ:'key',saw:'lead',square:'lead',stab:'pluck'}),
 SMP_FAM=['bass','key','lead','pad','pluck'];
const TP={},famOf=(P,n)=>(P&&P.sp?SMP_OF2:SMP_OF)[n];
/* v49.54.0: when a song's sample is on Auto, it is picked from the ones that suit its genre (by how they sound: dark and soft for lo-fi and R&B,
   icy and short for trap and drill, bright and wide for pop and dance, woody and plain for rock, country and Latin). Bass: pure low sine/sub
   (Brox, Reel) for 808-style genres, round (Yawn, Zyadfav, Juah) for soul, hip-hop and lo-fi, bright synth bass (Travel, Umbrella) for pop and dance.
   Lead: sustained (Ken, Merch, Reap) for melody lines; Madagascar and Slarm swell in over a second so Auto never uses them.
   A sample you pick yourself, or a song made before v49.51.0, is not changed. */
const stemOf=f=>f.replace(/^[a-z]+-/,'').replace(/\.mp3$/,''),SLOW=['madagascar','slarm','usala'];
const GSM={
 'Hip-Hop':{bass:['brox','reel','yawn','zyadfav','juah','kite','morty'],key:['wib','wuzz','lolau','quilt','yahweh','dolap','samuel'],lead:['glow','magic','lezima','ken','sting'],pad:['psg','pink','mellow','zilla'],pluck:['toy','dof','tide','blanch','pond']},
 'Rap':{bass:['brox','reel','yawn','zyadfav'],key:['prenu','sun','dadah','flacko','future','twirl'],lead:['siren','bug','nova','ken'],pad:['psg','order','pink','zilla'],pluck:['beetle','delqi','circus','colegio','swirl']},
 'Pop':{bass:['travel','umbrella','morty','bowser','jacket','juah'],key:['prenu','sun','neo','twirl','housekeeper','worship','simone'],lead:['merch','ken','reap','bug','sting','nova'],pad:['order','mellow','psg','zilla','chance'],pluck:['beetle','delqi','circus','colegio','butter','nomination']},
 'Rock':{bass:['juah','kite','morty','bowser','jacket'],key:['mustard','blazz','housekeeper','worship'],lead:['reap','ken','sting','bug','nova'],pad:['psg','munich'],pluck:['nomination','butter','vango']},
 'R&B':{bass:['brox','reel','yawn','zyadfav','elafint'],key:['wib','wuzz','lolau','simone','dolap','wonder','worship'],lead:['glow','magic','ken','nova','lezima'],pad:['mellow','chance','munich','egypt','pink'],pluck:['toy','tide','blanch','dof','swirl']},
 'Lo-fi':{bass:['yawn','zyadfav','reel','juah','kite'],key:['wib','wuzz','lolau','quilt','dolap','yahweh','samuel','wonder'],lead:['glow','magic','lezima','sting'],pad:['mellow','pink','munich','chance','egypt'],pluck:['toy','dof','tide','blanch','pond','swirl']},
 'Country':{bass:['kite','morty','juah','elafint'],key:['mustard','quilt','samuel','simone'],lead:['ken','sting','nova'],pad:['munich','mellow','chance'],pluck:['nomination','vango','butter','babylon','blanch']},
 'Electronic':{bass:['travel','umbrella','bowser','jacket','morty','brox'],key:['prenu','sun','neo','twirl','future'],lead:['merch','reap','bug','ken','siren'],pad:['order','psg','chance','egypt','munich','zilla'],pluck:['beetle','delqi','circus','colegio','blitz','babylon','swirl']},
 'Latin':{bass:['morty','kite','juah','bowser','brox','reel'],key:['mustard','simone','housekeeper','flacko','samuel'],lead:['ken','sting','nova','bug'],pad:['mellow','psg','pink'],pluck:['nomination','vango','butter','swirl','pond','circus']}};
function pickS(P,fam){const A=SMP[fam];if(!fam||!A||!A.length)return null;const sp=P.sp,v=sp?sp[fam]:undefined;
 if(sp&&v==='')return null;
 if(sp){if(v&&v!=='auto'){const m=A.find(q=>q.f==v||q.f==v+'.mp3'||q.f==fam+'-'+v+'.mp3');if(m)return m}
  const G=GSM[P.genre]&&GSM[P.genre][fam],B=G&&A.filter(q=>G.includes(stemOf(q.f))),C=B&&B.length?B:A.filter(q=>!SLOW.includes(stemOf(q.f)));return(C.length?C:A)[mix32((P.seed^hash(fam))>>>0)%(C.length?C:A).length]}
 const L=A.filter(q=>!q.n).sort((a,b)=>a.f<b.f?-1:1);return L.length?L[mix32((P.seed^hash(fam))>>>0)%L.length]:null}
/* ---------- dev music v1: recorded multi-sampled instruments (audio/inst/<name>/<midi>.mp3, listed in audio/inst/manifest.json) ---------- */
const RIM={piano:'grand',epiano:'rhodes',flute:'flute',brass:'brass',strings:'strings',choir:'choir',organ:'organ',nylon:'nylon',gtr:'steelgtr',strum:'steelgtr',twang:'cleangtr',cgtr:'cleangtr',
 dist:'odgtr',chug:'distgtr',banjo:'banjo',fiddle:'fiddle',marimba:'marimba',mbox:'musicbox',bell:'celesta',pbell:'glock',upright:'upright',pick:'pickbass',round:'fingerbass',slap:'slapbass',
 sax:'sax',altosax:'altosax',trumpet:'trumpet',tbone:'tbone',vibes:'vibes',kalimba:'kalimba',harp:'harp',harmonica:'harmonica',violin:'violin',panflute:'panflute',accordion:'accordion',steeldrum:'steeldrum'};
/* how long a note takes to fade once it is let go (sustained instruments are let go, plucked and struck ones mostly ring out) */
const RIR={upright:.08,pick:.08,round:.08,slap:.06,strings:.35,choir:.4,organ:.1,flute:.14,brass:.14,sax:.14,altosax:.14,trumpet:.12,tbone:.14,violin:.2,fiddle:.15,harmonica:.14,accordion:.14,panflute:.14,dist:.12,chug:.06};
const RI={};let riLoad=null,riDone=0;
function riMan(){if(riLoad)return riLoad;if(typeof fetch!='function'){riDone=1;return null}
 riLoad=fetch('audio/inst/manifest.json').then(r=>r.ok?r.json():{}).then(m=>{for(const n in m)RI[n]=m[n].map(x=>({m:x,f:'audio/inst/'+n+'/'+x+'.mp3',buf:null}))}).catch(()=>{}).then(()=>{riDone=1});return riLoad}
function zBuf(c,z){if(z.buf)return z.buf;if(z.bad||z.ld||!c||typeof fetch!='function')return null;z.ld=1;
 fetch(z.f).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>c.decodeAudioData(b)).then(b=>{z.gain=gainOf(b);z.buf=b}).catch(()=>{z.bad=1});return null}
/* the recorded set for an instrument: every song uses it, old ones included (their beat is rebuilt from the seed each time they play) */
function riOf(P,n){const r=RIM[n];return r&&RI[r]&&RI[r].length?RI[r]:null}
function riUse(P){const U={};for(const k of LAYS){const d=P[k];if(!d||U[d.i])continue;const Z=riOf(P,d.i);if(Z)U[d.i]=Z}return U}
function riReady(c,P){let ok=true;const U=riUse(P);for(const n in U)for(const z of U[n])if(!zBuf(c,z)&&!z.bad)ok=false;return ok}
function riV(E,L,t,m,dur,v,Z,name){let z=Z[0];for(const q of Z)if(Math.abs(q.m-m)<Math.abs(z.m-m))z=q;
 const c=E.c,s=c.createBufferSource(),g=c.createGain(),rt=Math.pow(2,(m-z.m)/12),bl=z.buf.duration/rt,rel=RIR[name]!=null?RIR[name]:.3,end=t+dur;
 s.buffer=z.buf;s.playbackRate.value=rt;v*=(z.gain||1)*.9;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);
 if(end<t+bl){g.gain.setValueAtTime(v,end);g.gain.setTargetAtTime(0,end,rel/3)}
 s.connect(g);g.connect(L.in);s.start(t);s.stop(Math.min(t+bl,end+rel*2)+.05)}
/* ---------- dev music v1: recorded drum kits (audio/kits/<kit>/<piece>.mp3, listed in audio/kits/manifest.json) ---------- */
const KITM={dusty:'dusty',b808:'trap',trap:'trap','909':'x909',rock:'rock',soft:'soft',lofi:'lofi',brush:'soft',techno:'techno',dnb:'dnb',gated:'synth'},
 KITS_N={'Rage':'dist','Phonk':'dist','Breakbeat':'dusty','Country Pop':'rock'},KSKIP={brush:'s'};
/* levels per piece (each file is also matched to the same loudness when it loads) */
const KLV={k:1,s:.8,c:.72,h:.34,o:.3,y:.24,z:.32,r:.45,p:.24,b:.3,t:.7},KGK={"dusty":6.49,"trap":3.61,"x909":4.4,"rock":3.06,"soft":4.55,"lofi":4.41,"techno":3.08,"synth":2.17,"dnb":2.46,"dist":4.4};
const KS={};let ksLoad=null;
function ksMan(){if(ksLoad)return ksLoad;if(typeof fetch!='function')return null;
 ksLoad=fetch('audio/kits/manifest.json').then(r=>r.ok?r.json():{}).then(m=>{for(const k in m){KS[k]={};m[k].forEach(p=>KS[k][p]={f:'audio/kits/'+k+'/'+p+'.mp3',buf:null})}}).catch(()=>{});return ksLoad}
function kitOf(P){const K=P&&P.dkit&&KS[P.dkit];if(!K)return null;const o={};for(const p in K)if(!(P.dskip||'').includes(p))o[p]=K[p];return o}
function kitReady(c,P){const K=kitOf(P);if(!K)return true;let ok=true;for(const p in K){const z=K[p];if(!zBuf(c,z)&&!z.bad)ok=false}return ok}
function kitHit(E,key,z,t,v){const c=E.c,s=c.createBufferSource(),g=c.createGain();s.buffer=z.buf;s.playbackRate.value=key=='k'||key=='t'?E.P.kt||1:1;
 const vv=v*(KLV[key]||.5)*(KGK[E.P.dkit]||1)*Math.min(2.5,z.gain||1);g.gain.value=vv;s.connect(g);g.connect(E.dr);
 /* the snare and clap get the kit's room, like the code-made ones */
 const rv=key=='s'?E.P.kit.s.rv:key=='c'?.25:key=='r'?.1:0;if(rv&&E.rv){const sg=c.createGain();sg.gain.value=rv;g.connect(sg);sg.connect(E.rv)}
 /* a closed hat chokes the open one */
 if(key=='o')E.oh=g;else if(key=='h'&&E.oh){try{E.oh.gain.setTargetAtTime(0,t,.015)}catch(e){}E.oh=null}
 s.start(t);s.stop(t+z.buf.duration+.05)}
const sampled=(n,P)=>!!riOf(P||{},n)||!!pickS(P||{},famOf(P,n));
let smpLoad=null,smpDone=0;
function loadMan(){if(smpLoad)return smpLoad;if(typeof fetch!='function'){smpDone=1;return null}
 smpLoad=fetch('audio/oneshots/manifest.json').then(r=>r.ok?r.json():[]).then(list=>{list.forEach(m=>{(SMP[m.c]=SMP[m.c]||[]).push({f:m.f,n:m.n,root:m.root+(m.cents||0)/100,dur:m.dur,buf:null})});
  Object.keys(SMP).forEach(k=>SMP[k].sort((a,b)=>a.f<b.f?-1:1))}).catch(()=>{}).then(()=>{smpDone=1});return smpLoad}
function loadSamples(c){if(!c)return smpLoad;return loadMan()}
/* one file, fetched and decoded when first asked for; null until it is there, and s.bad if it never arrives */
/* v49.59.0: samples were recorded at very different levels, so each one is matched to the same loudness when it loads (RMS of the part that sounds) */
function gainOf(b){const d=b.getChannelData(0);let pk=0;for(let i=0;i<d.length;i+=4)pk=Math.max(pk,Math.abs(d[i]));if(pk<1e-4)return 1;let e=Math.min(d.length,b.sampleRate*1.5|0);while(e>1000&&Math.abs(d[e-1])<pk*.05)e--;let s=0;for(let i=0;i<e;i++)s+=d[i]*d[i];const r=Math.sqrt(s/e);return Math.max(.3,Math.min(3.5,.12/r))}
function sBuf(c,s){if(s.buf)return s.buf;if(s.bad||s.ld||!c||typeof fetch!='function'){if(!s.ld&&!s.buf)s.bad=1;return null}
 s.ld=1;fetch('audio/oneshots/'+s.f).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>c.decodeAudioData(b)).then(buf=>{s.gain=gainOf(buf);s.buf=buf}).catch(()=>{s.bad=1});return null}
/* the samples a song uses: instrument name -> entry, for the four parts of its beat */
function sUse(P){const U={};for(const k of LAYS){const d=P[k];if(!d||U[d.i])continue;const s=pickS(P,famOf(P,d.i));if(s)U[d.i]=s}return U}
function sReady(c,P){riMan();ksMan();let ok=riDone?riReady(c,P)&&kitReady(c,P):false;const U=sUse(P);for(const n in U){const s=U[n];if(!sBuf(c,s)&&!s.bad)ok=false}return ok}
/* v43.0.1: one sample per instrument per song, picked from the song's seed (it used to take the sample nearest each note,
   so the bass could change sound from note to note) */
function smpV(E,L,t,m,dur,v,s){
 const c=E.c,src=c.createBufferSource(),g=c.createGain(),end=t+dur;
 src.buffer=s.buf;src.playbackRate.value=Math.pow(2,(m-s.root)/12);
 v*=s.gain||1;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.9,t+.004);g.gain.setValueAtTime(v*.9,end);g.gain.linearRampToValueAtTime(0,end+.08);
 src.connect(g);g.connect(L.in);src.start(t);src.stop(end+.1)}
/* v49.51.0: the picker's list and a one-shot preview of a sample (played at a steady pitch so they compare) */
function previewSample(fam,f){const c=ctx();if(!c)return;const s=(SMP[fam]||[]).find(q=>q.f==f);if(!s)return;let k=0;const go=()=>{const b=sBuf(c,s);if(!b){if(!s.bad&&k++<40)setTimeout(go,100);return}
 const o=c.createBufferSource(),g=c.createGain(),t=c.currentTime,tgt=fam=='bass'?36:60;o.buffer=b;o.playbackRate.value=Math.pow(2,(tgt-s.root)/12);
 g.gain.setValueAtTime(musicVol()*.9,t);g.gain.setValueAtTime(musicVol()*.9,t+1.6);g.gain.linearRampToValueAtTime(0,t+2.2);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+2.3)};go()}
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
/* v43.0.1: whether a song uses samples or the code-made voices is settled once, when it starts (lockE), so nothing swaps mid-song */
function lockE(E){E.ri={};const RU=riUse(E.P);for(const n in RU){const Z=RU[n].filter(z=>z.buf);if(Z.length)E.ri[n]=Z}E.ks={};const K=kitOf(E.P);if(K)for(const p in K)if(K[p].buf)E.ks[p]=K[p];E.sm={};const U=sUse(E.P);for(const k of LAYS){const d=E.P[k];if(d&&(U[d.i]&&U[d.i].buf||E.ri[d.i])){if(U[d.i]&&U[d.i].buf)E.sm[d.i]=U[d.i];const L=E.lay[k];if(L&&L.f)L.f.frequency.value=15000}}
 E.u8=!!dBuf(E.c,'808',E.P.s8);E.uh=!!dBuf(E.c,'hat',E.P.hh)}
function note(E,lay,name,t,midi,dur,v,x){const I=INS[name]||INS.sine,L=E.lay[lay],f=mtof(midi);if(!L)return;
 if(name=='808'&&E.u8){s808(E,L,t,midi,dur,v,dBuf(E.c,'808',E.P.s8),x);return}
 if(E.ri&&E.ri[name]){riV(E,L,t,midi,dur,v,E.ri[name],name);return}
 if(E.sm&&E.sm[name]){smpV(E,L,t,midi,dur,v,E.sm[name]);return}
 if(I.t=='o')oscV(E,L,t,f,dur,v,I,x);else if(I.t=='fm')fmV(E,L,t,f,dur,v,I);else if(I.t=='ks')ksV(E,L,t,f,dur,v,I);else if(I.t=='808')b808(E,L,t,f,dur,v,Object.assign({},I,x&&x.dr?{dr:x.dr}:{}),x);else cbV(E,L,t,f,dur,v)}

/* ---------- harmony ---------- */
const dm=(P,deg)=>P.kr+semi(P.sc,deg);
/* v49.54.0: the chord playing at step s of bar i in a section of n bars (kind k). The verse, chorus, bridge, pre-chorus and intro each have their own
   progression, and the last bar of a verse or bridge turns to the dominant (the V chord) so the next section feels like an arrival. */
function chAt(P,k,i,n,s){const pg=P.pg[k]||P.pg.vs,cl=k=='pc'?16:16/P.cpb;
 if(P.cad&&P.cad[k]&&i==n-1&&n==P.nm[k]&&s>=8)return P.cad[k];
 return pg[Math.floor((i*16+s)/cl)%pg.length]}
const rootM=(P,c)=>P.kr+c.r;
function voicing(P,cd,x,center){const base=P.kr+cd.r;if(x==5){let r=base+48;while(r<center-6)r+=12;while(r>=center+6)r-=12;return[r,r+7,r+12]}
 const iv=cd.iv.slice();if(x>=7||cd.e7)iv.push(cd.sv);if(x>=9&&cd.iv[1]!=5)iv.push(14);const out=[];for(const d of iv){let m=base+d+60;while(m<center-7)m+=12;while(m>=center+6)m-=12;if(!out.includes(m))out.push(m)}return out.sort((a,b)=>a-b)}
const inWin=(m,lo)=>{while(m<lo)m+=12;while(m>=lo+12)m-=12;return m};

/* ---------- song forms: [section, bars]; after the first section the rest loops ----------
   (a song picks one of four layouts of the same length from its seed, see SONGF; pc is a short pre-chorus that builds into the chorus) */
const FORMS={song:SONGF[0],live:[['in',1],['hk',8],['vs',8],['hk',8],['br',4],['hk',8]],rec:[['vs',4],['hk',8],['vs',8],['hk',8]]};
/* oc = how many of this kind came before (0 is the first), fin = it is the last of its kind in the loop (the final chorus gets the harmony) */
function secAt(F,bar){if(bar<F[0][1])return{k:F[0][0],i:bar,n:F[0][1],nx:F[1][0],oc:0,fin:1};let b=bar-F[0][1];const R=F.slice(1),tot=R.reduce((a,s)=>a+s[1],0),cyc=Math.floor(b/tot),per={},c={};R.forEach(s=>per[s[0]]=(per[s[0]]||0)+1);b%=tot;
 for(let j=0;j<R.length;j++){const kk=R[j][0];if(b<R[j][1])return{k:kk,i:b,n:R[j][1],nx:R[(j+1)%R.length][0],oc:(c[kk]||0)+cyc*per[kk],fin:R.slice(j+1).every(q=>q[0]!=kk)?1:0};b-=R[j][1];c[kk]=(c[kk]||0)+1}return{k:'vs',i:0,n:8,nx:'hk',oc:0,fin:0}}

const APPR={bass:.35,upright:.4,funk:.3,pluckb:.25,pick:.3,round:.2,sub:.12};
/* ---------- one step of the sequencer ---------- */
function sched(E,n,t){const P=E.P,sd=E.sd,bar=n>>4,s=n&15;
 if(E.rbBar!==bar){E.rbBar=bar;E.rb=rng((P.seed^Math.imul(bar+1,0x9E3779B1))>>>0);E.sec=secAt(E.F,bar)}
 const sec=E.sec,k=sec.k,I=E.I,rb=E.rb,main=k=='vs'||k=='hk'||k=='pc',sg={in:.6,br:.7,vs:.93,pc:.98,hk:1.05}[k]||1,last=sec.i==sec.n-1&&k!='in',fill=last?P.fill:'',lvl=.55+.45*I;
 const silent=fill=='stop'&&s>=12||fill=='drop'&&s>=8&&sec.nx=='hk';
 /* drums */
 if(k=='hk'&&sec.i==0&&s==0&&(P.crash||P.fill=='drop'))drum(E,'z',t,.9*lvl);
 if(fill=='tom'&&s>=8){if(s%2==0||s>=12){E.tf=[200,170,140,115,95,80][Math.min(5,(s-8)>>1)];drum(E,'t',t,.8*lvl)}if(s==8)drum(E,'k',t,.9*lvl)}
 else for(const[key,pa]of P.dk){let v=pa[(bar*16+s)%pa.length];if(!v)continue;
  if(k=='in'&&!P.arr.inDr&&!'hpyr'.includes(key))continue;if(k=='br'&&key=='k')continue;if(silent&&key!='h')continue;
  if(I<.2&&(key=='s'||key=='c'||key=='n'))continue;
  if(fill=='sn'&&s>=12&&(key=='h'||key=='o'))continue;
  v=v<0?-1:v*(.9+.1*rb())*lvl*sg;
  if(v<0||(fill=='roll'||fill=='stop')&&s>=12&&key=='h'){const m=[2,3,4][rb()*3|0],vv=.5*lvl;for(let j=0;j<m;j++)drum(E,key=='h'?'h':key,t+j*sd/m,vv*(.55+.45*j/m));continue}
  drum(E,key,t,v)}
 if(fill=='sn'&&s>=12)drum(E,'s',t,(.45+.15*(s-12))*lvl);
 if(fill=='drop'&&s>=8&&sec.nx=='hk'){drum(E,'s',t,(.25+.07*(s-8))*lvl);if(s%2)drum(E,'s',t+sd/2,(.25+.07*(s-8))*lvl)}
 if((fill=='drop'||(k=='br'||k=='pc')&&last)&&s==0&&sec.nx=='hk')riser(E,t,sd*16);
 /* bass */
 const cd=chAt(P,k,sec.i,sec.n,s),bs=P.bs;
 if(bs&&main&&I>=.45&&!silent){let ev=null;
  if(bs.p=='k'){if(P.kick){const L=P.kick.length,i=(bar*16+s)%L;if(P.kick[i]){let l=1;while(l<16&&!P.kick[(i+l)%L])l++;ev={c:'x',l}}}}
  else{const tp=tpat(bs.p);ev=tp[(bar*16+s)%tp.length]}
  if(ev){const rm=inWin(rootM(P,cd)+12,bs.o);let m=rm;
   if(ev.c=='o')m+=12;else if(ev.c=='5')m=rm+cd.iv[2];else if(ev.c=='3')m=rm+cd.iv[1];else if(ev.c=='7')m=rm+cd.sv;else if(ev.c=='b')m=rm-1;
   /* a melodic bass walks to the next chord: on the last beat before it changes, now and then step in from a semitone away */
   const ap=APPR[bs.i];if(ap&&ev.c!='b'&&s>=8){const si=sec.i*16+s+4,nc=chAt(P,k,Math.floor(si/16),sec.n,si%16);
    if(nc!==cd&&(rb()<ap)){const nr=inWin(rootM(P,nc)+12,bs.o);m=nr+(rb()<.5?-1:1)}}
   const x={};if(bs.i=='808'){if(E.lb&&rb()<(bs.sl||0)){x.from=mtof(E.lb)}if(rb()<(bs.oc||0))m+=rb()<.5?12:7;x.dr=bs.dr}
   if(bs.i=='acid'){x.acc=rb()<.3;if(E.lb&&rb()<.25)x.from=mtof(E.lb)}if(bs.i=='funk'&&E.lb&&rb()<.2)x.from=mtof(E.lb);if(bs.i=='wob')x.wr=[1,2,3,4][rb()*4|0]/(sd*4);
   const l=Math.min(ev.l,16-s+(bs.p=='k'?16:0));note(E,'bs',bs.i,t,m,l*sd*(bs.i=='808'?1:.92),.9*lvl,x);E.lb=m}}
 /* chords */
 const ch=P.ch;if(ch&&I>=.12&&!(k=='vs'&&P.arr.vsNoCh)&&!(silent&&fill=='stop')){const tp=tpat(ch.p),ev=tp[(bar*16+s)%tp.length];
  if(ev){const CL=16/P.cpb,rem=CL-(n%CL),l=Math.min(ev.l,rem),I0=INS[ch.i]||{},vs=voicing(P,cd,ch.x||3,ch.o||60),dur=l*sd*.96,v=(ev.c=='X'?1:.8)*lvl*(k=='in'?.8:1);
   if(I0.st){const tn=[inWin(vs[0]-12,40)].concat(vs,[vs[0]+12]),up=ev.c=='u',ord=up?tn.slice(-4).reverse():tn;ord.forEach((m,i)=>note(E,'ch',ch.i,t+i*(up?.008:.012),m,dur,v*(up?.45:.65)/Math.sqrt(ord.length)*1.6))}
   else vs.forEach(m=>note(E,'ch',ch.i,t,m,dur,v*.9/Math.sqrt(vs.length)))}}
 /* arpeggio (ar is the style's own; pk is the plucked arpeggio the seed adds in the pre-chorus and chorus) */
 for(const al of['ar','pk']){const ar=P[al];if(!ar||I<.3||silent||k=='br'||(al=='pk'&&!ar.sec.split(' ').includes(k)))continue;const r=ar.r||1;if(s%r==0){const c=ar.p[((n/r)|0)%ar.p.length];if(c>='0'&&c<='9'){const vs=voicing(P,cd,ar.x||3,ar.o||64),i=+c,m=vs[i%vs.length]+12*Math.floor(i/vs.length);note(E,al,ar.i,t,m,sd*r*.9,(al=='pk'?.6:.75)*lvl*(k=='in'?.7:1))}}}
 /* pad: one long chord under the pre-chorus, chorus and bridge (softer in the intro and verse), started when the chord changes */
 const pd=P.pd;if(pd&&pd.sec.split(' ').includes(k)&&I>=.12&&!(silent&&fill=='stop')){const sp=sec.i*16+s,pv=sp?chAt(P,k,Math.floor((sp-1)/16),sec.n,(sp-1)%16):null;
  if(pv!==cd){let l=1;while(l<32&&chAt(P,k,Math.floor((sp+l)/16),sec.n,(sp+l)%16)===cd&&sp+l<sec.n*16)l++;const g=k=='hk'?1:k=='pc'||k=='br'?.9:k=='in'?.6:.45;
   voicing(P,cd,pd.x,pd.o).forEach(m=>note(E,'pd',pd.i,t,m,l*sd*.98,.55*g*lvl/Math.sqrt(4)))}}
 /* lead melody: the chorus hook, a quiet verse line (styles that keep a lead going), the pre-chorus climb and the bridge */
 const ld=P.ld;if(ld&&I>=.7&&!silent){const rows=k=='hk'?P.mhk:k=='br'?P.mbr:k=='pc'?P.mpc:k=='vs'&&ld.all?P.mvs:k=='in'?P.min:null,row=rows&&rows[sec.i%rows.length],nt=row&&row[s];
  if(nt){const x=E.ll?{from:mtof(E.ll)}:null,v=nt.v*lvl*(k=='vs'?.75:k=='hk'&&sec.fin?1.08:1);note(E,'ld',ld.i,t,nt.m,nt.l*sd*.92,v,x);E.ll=nt.m;
   /* the last chorus doubles the tune a third below */
   if(k=='hk'&&sec.fin&&sec.oc>0){const h=[4,3].map(q=>nt.m-q).find(q=>P.spc.has(((q%12)+12)%12));if(h!=null)note(E,'ld',ld.i,t+sd*.01,h,nt.l*sd*.92,v*.5)}}}}
function riser(E,t,dur){nz(E,t,dur,.12*E.I,'bandpass',300,3,E.mix,.3,7000,dur*.9)}

/* ---------- an engine instance: one song playing into one context ---------- */
function mkE(c,dest,P,o){const E={c,P,fbk:{},sd:60/P.bpm/4,nb:noiseBuf(c),I:o.intensity!=null?o.intensity:1,F:(P.fm&&P.fm[o.form])||FORMS[o.form]||FORMS.song,loops:[],owner:o.owner,alive:o.alive,onstop:o.onstop,step:0,src:o.src};
 E.out=c.createGain();E.mix=c.createGain();let n=E.mix;const fx=P.fx;
 if(fx.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=fx.lp;f.Q.value=.6;n.connect(f);n=f}
 if(fx.sat){const w=shaper(c,fx.sat),g=c.createGain();g.gain.value=.8;n.connect(w);w.connect(g);n=g}
 /* mud: a gentle dip around 300 Hz where bass, chords and pads pile up */
 const mud=c.createBiquadFilter();mud.type='peaking';mud.frequency.value=300;mud.Q.value=.8;mud.gain.value=-2.5;n.connect(mud);n=mud;
 const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=28;n.connect(hp);E.bt=c.createGain();E.bt.gain.value=BUS_TRIM;hp.connect(E.bt);E.bt.connect(E.out);E.lv=c.createGain();E.lv.gain.value=Math.pow(10,lvStart(P)/20);E.lvdb=lvStart(P);E.out.connect(E.lv);E.lv.connect(dest);if(c.createAnalyser&&!(c instanceof (window.OfflineAudioContext||Object))){const sh=c.createBiquadFilter(),hpk=c.createBiquadFilter();sh.type='highshelf';sh.frequency.value=1500;sh.gain.value=4;hpk.type='highpass';hpk.frequency.value=38;hpk.Q.value=.5;E.lva=c.createAnalyser();E.lva.fftSize=2048;E.out.connect(sh);sh.connect(hpk);hpk.connect(E.lva);E.lvb=new Float32Array(2048);E.lvs=[];E.lvt=0}
 E.rv=c.createGain();const cv=c.createConvolver();cv.buffer=irBuf(c,fx.rt||1.8);const rr=c.createGain();rr.gain.value=fx.verb!=null?fx.verb*1.4:.3;E.rv.connect(cv);cv.connect(rr);rr.connect(E.mix);
 if(fx.dly){E.dl=c.createGain();const d=c.createDelay(2),fb=c.createGain(),lp=c.createBiquadFilter(),w=c.createGain();d.delayTime.value=E.sd*3;fb.gain.value=.35;lp.type='lowpass';lp.frequency.value=3000;w.gain.value=.35;E.dl.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(w);w.connect(E.mix)}
 E.pump=c.createGain();E.pump.connect(E.mix);
 E.dr=c.createGain();E.dr.gain.value=P.raw?1:P.mx.dr*(MIXT['dr:'+P.style]||1);E.dr.connect(E.mix);
 let wob=null;if(fx.wob){const l=c.createOscillator();l.frequency.value=.55;wob=c.createGain();wob.gain.value=.0011*fx.wob;l.connect(wob);l.start();E.loops.push(l)}
 E.lay={};const RVS={bs:0,ch:.3,ar:.35,ld:.35,pd:.5,pk:.4},HPF={ch:150,ar:200,ld:180,pd:170,pk:240},PAN={bs:0,ch:-.22,ar:.3,ld:.08,pd:0,pk:-.3};
 for(const k of LAYS){const def=P[k];if(!def)continue;const g=c.createGain(),Id=INS[def.i]||{},smp=sampled(def.i,P);g.gain.value=(P.raw?1:MIXT[k+':'+(smp?'smp':def.i)]!=null?MIXT[k+':'+(smp?'smp':def.i)]:P.mx[k])*(k=='ld'&&!P.raw?LDG:1);let inp=g;
  let lf=null;if(Id.t=='o'){lf=c.createBiquadFilter();lf.type='lowpass';lf.frequency.value=smp?15000:Math.min(15000,Id.lp||6000);lf.Q.value=Id.q||.7;lf.connect(g);inp=lf}
  if(Id.ds&&!smp){const w=shaper(c,k=='ld'?6:9,'2x'),lp=c.createBiquadFilter(),h=c.createBiquadFilter(),wg=c.createGain();lp.type='lowpass';lp.frequency.value=3600;h.type='highpass';h.frequency.value=90;wg.gain.value=k=='ld'?.5:.6;w.connect(h);h.connect(lp);lp.connect(wg);wg.connect(g);if(lf){lf.disconnect();lf.connect(w)}else inp=w}
  if(wob&&k!='bs'){const d=c.createDelay(.05);d.delayTime.value=.006;wob.connect(d.delayTime);d.connect(inp);inp=d}
  let po=g;if(HPF[k]){po=c.createBiquadFilter();po.type='highpass';po.frequency.value=HPF[k];po.Q.value=.6;g.connect(po)}if(c.createStereoPanner&&PAN[k]){const pn=c.createStereoPanner();pn.pan.value=PAN[k];po.connect(pn);po=pn}po.connect(P.side&&k!='ld'?E.pump:E.mix);if(RVS[k]){const sg=c.createGain();sg.gain.value=RVS[k];g.connect(sg);sg.connect(E.rv)}if(k=='ld'&&E.dl)g.connect(E.dl);E.lay[k]={in:inp,g,f:lf}}
 if(fx.vinyl){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=vinylBuf(c);s.loop=true;f.type='highpass';f.frequency.value=700;g.gain.value=.22*fx.vinyl;s.connect(f);f.connect(g);g.connect(E.mix);s.start();E.loops.push(s)}
 if(fx.rain){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=E.nb;s.loop=true;f.type='lowpass';f.frequency.value=1400;g.gain.value=.05*fx.rain;s.connect(f);f.connect(g);g.connect(E.mix);s.start();E.loops.push(s)}
 return E}
const stepTime=(E,n)=>E.t0+n*E.sd+(n%2?E.P.sw*E.sd:0);

/* ---------- live output, scheduler, pause and the watchdog ---------- */
const BASE=.9;let G=null,cur=null,timer=0,held=0,uvol=1,savedPads=null;
function userOK(){try{if(navigator.userActivation)return navigator.userActivation.hasBeenActive}catch(e){}return typeof MU=='undefined'||!!MU.on}
function outChain(c){const vol=c.createGain(),comp=c.createDynamicsCompressor();comp.threshold.value=-2;comp.knee.value=0;comp.ratio.value=20;comp.attack.value=.002;comp.release.value=.1;const pre=c.createGain(),clip=shaper(c,1.4,'2x');pre.gain.value=.8;vol.connect(comp);comp.connect(pre);const cap=c.createGain();cap.gain.value=LV_CAP;pre.connect(clip);clip.connect(cap);cap.connect(c.destination);return{c,vol,comp}}
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
 dBuf(c,'808',P.s8);dBuf(c,'hat',P.hh);sReady(c,P);E.wt=c.currentTime+2;
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
 /* wait (up to 2 seconds) for this song's samples so it starts and stays on the same sounds */
 if(E.wt){if(now>E.wt||smpDone&&sReady(c,E.P)&&(!E.P.s8||dBuf(c,'808',E.P.s8))&&(!E.P.hh||dBuf(c,'hat',E.P.hh))){E.wt=0;lockE(E);E.step=0;E.t0=now+.05;E.next=E.t0}else return}
 lvTick(E,now);
 if(E.next<now-.4){E.t0=now+.05-E.step*E.sd;E.next=stepTime(E,E.step)}
 let k=0;while(E.next<now+.6&&k++<96){try{sched(E,E.step,Math.max(E.next,now))}catch(e){if(!E.err){E.err=1;console.error('beats',e)}}E.step++;E.next=stepTime(E,E.step)}}
function stop(fade){const E=cur;if(!E)return;cur=null;end(E,fade);holdBg(0)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&cur)pause(cur);else if(cur)tick()});
addEventListener('pagehide',()=>stop(.02));

/* offline render (tests, previews): returns a Promise of an AudioBuffer */
async function render(src,secs,o){o=o||{};const P=plan(src),sr=o.sampleRate||44100,OC=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new OC(2,Math.ceil(sr*secs),sr),out=o.bus?{vol:c.createGain()}:outChain(c);if(o.bus)out.vol.connect(c.destination);
 out.vol.gain.value=o.bus?1:(o.vol!=null?o.vol:.5)*BASE;const E=mkE(c,out.vol,P,o);
 if(o.samples!==false&&typeof fetch=='function'){try{await riMan();await ksMan();for(let k=0;k<100&&!(riReady(c,P)&&kitReady(c,P));k++)await new Promise(r=>setTimeout(r,50));await loadMan();const U=sUse(P);for(const n in U){for(let k=0;k<60&&!sBuf(c,U[n])&&!U[n].bad;k++)await new Promise(r=>setTimeout(r,50))}}catch(e){}}lockE(E);E.t0=.02;if(o.solo){if(o.solo!='dr')E.dr.gain.value=0;for(const k in E.lay)if(k!=o.solo)E.lay[k].g.gain.value=0}for(let n=0;stepTime(E,n)<secs;n++)sched(E,n,stepTime(E,n));return c.startRendering()}

return{play,stop:f=>stop(f),setIntensity:x=>{if(cur)cur.I=Math.max(0,Math.min(1,+x||0))},setVolume:x=>{uvol=Math.max(0,Math.min(1,+x||0))},
 playing:()=>!!cur,current:()=>cur?Object.assign(info(cur),{owner:cur.owner,src:cur.src,paused:!!cur.paused,held:!!cur.up,intensity:cur.I}):null,
 /* v26.105: the player's own pause (WaveFern's pause buttons). hold(true) pauses the beat where it is, hold(false) carries on from there.
    The game's pause menu and a hidden tab still pause it on their own. songBeats() = quarter notes in one play-through of a song. */
 hold:on=>{if(cur){cur.up=!!on;tick()}},songBeats:()=>FORMS.song.reduce((a,s)=>a+s[1],0)*4,
 /* v49.54.0: what a song is made of, for the wiki and tools/music-test.js: chords per section as symbols, the chorus melody as note names, and numbers about the melody */
 analyze:src=>{const P=plan(src),NN=m=>NOTEN[((m%12)+12)%12]+(Math.floor(m/12)-1),out={genre:P.genre,style:P.style,bpm:P.bpm,key:P.key,keyName:P.keyName,mode:SCN[P.sc],form:P.fi+1,lead:P.ld?P.ld.i:'',hasLead:!!P.ld,prog:{}};
  for(const k of['in','vs','pc','hk','br'])out.prog[k]=P.pg[k].map(c=>chordName(P,c)).join(' ');
  if(P.ld){const R=P.mhk,notes=[];R.forEach((row,b)=>row.forEach((n,s)=>{if(n)notes.push({b,s,m:n.m,l:n.l})}));
   out.hook=R.map(row=>row.map((n,s)=>n?NN(n.m)+(n.l>=4?'-':''):'').filter(Boolean).join(' '));
   const dl=notes.slice(1).map((n,i)=>n.m-notes[i].m),A=x=>Math.abs(x),ctOf=n=>{const cd=chAt(P,'hk',n.b,P.nm.hk,n.s),pc=((n.m%12)+12)%12,set=cd.iv.map(x=>(P.tn+cd.r+x)%12);if(cd.e7)set.push((P.tn+cd.r+cd.sv)%12);return set.includes(pc)},
    strong=notes.filter(n=>n.s%8==0),rhy=b=>R[b].map((n,s)=>n?s:'').join(','),endN=b=>{let s=15;while(!R[b][s])s--;return{b,s,m:R[b][s].m}},root=n=>{const cd=chAt(P,'hk',n.b,P.nm.hk,n.s);return((n.m%12)+12)%12==(P.tn+cd.r)%12},ms=notes.map(n=>n.m);
   out.hookShape=R.map((row,b)=>rhy(b)).join('/')+':'+dl.join(',');
   out.mel={stepwise:dl.filter(x=>A(x)>=1&&A(x)<=2).length/dl.length,leaps:dl.filter(x=>A(x)>=4).length/dl.length,repeats:dl.filter(x=>x==0).length/dl.length,strongCT:strong.filter(ctOf).length/Math.max(1,strong.length),range:Math.max(...ms)-Math.min(...ms),density:notes.length/R.length,
    motifRepeat:rhy(0)==rhy(2)?1:0,endsOnRoot:root(endN(R.length-1))?1:0,questionFirst:root(endN(1))?0:1,maxGap:Math.max(...dl.map(A))}}
  return out},
 plan:src=>{const P=plan(src);return{genre:P.genre,style:P.style,variant:P.si+1,of:P.count,bpm:P.bpm,key:P.keyName,seed:P.seed}},
 beat:()=>{const E=cur;if(!E||E.t0==null||E.wt)return-1;const t=E.paused?E.pt:E.c.currentTime-(E.c.outputLatency||0);return(t-E.t0)/(E.sd*4)},
 bpm:()=>cur?cur.P.bpm:0,
 /* dev: the loudness leveller's gain (dB) and how many 400 ms blocks it has measured */
 loudness:()=>cur?{gainDb:+(cur.lvdb||0).toFixed(2),blocks:(cur.lvB||[]).length,target:LUFS}:null,
 /* v43.0.0: the recorded 808 and hi hat names, and a one-shot preview of one (kind '808' or 'hat') */
 drums:{s808:N808.slice(),hats:DHAT.slice()},
 /* v49.51.0: the recorded instrument samples: families, [{f, n (name), old}] per family once the manifest is in, and a preview */
 instruments:{families:SMP_FAM.slice(),load:()=>loadMan()||Promise.resolve(),list:fam=>(SMP[fam]||[]).map(q=>({f:q.f,n:q.n||q.f.replace(/^[a-z]+-/,'').replace(/\.mp3$/,'').replace(/^./,x=>x.toUpperCase())})),preview:previewSample,
  /* a note for the band minigames (mgKey, mgBass...): the family's sample at pitch hz, or false while it has not loaded */
  tap(fam,hz,dur,vol){const c=ctx();if(!c||!G)return false;const A=SMP[fam];if(!A||!A.length)return false;const pk=(typeof S=='object'&&S&&S.bpick&&S.bpick.smp&&S.bpick.smp[fam])||'auto';
   let s=pk&&pk!='auto'?A.find(q=>q.f==pk):null;if(!s){s=TP[fam]||(TP[fam]=A[Math.floor(Math.random()*A.length)])}
   const b=sBuf(c,s);if(!b)return false;const o=c.createBufferSource(),g=c.createGain(),t=c.currentTime,m=69+12*Math.log2(hz/440);
   o.buffer=b;o.playbackRate.value=Math.pow(2,(m-s.root)/12);const v=(vol||.15)*musicVol()*3;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.setValueAtTime(v,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.12);
   o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.2);return true}},
 previewDrum(kind,n){const c=ctx();if(!c||!n)return;let k=0;const go=()=>{const b=dBuf(c,kind,n);if(!b){if(k++<20)setTimeout(go,100);return}
  const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=musicVol()*.9;s.connect(g);g.connect(c.destination);s.start();if(kind=='808')s.stop(c.currentTime+1.2)};go()},samples:()=>Object.fromEntries(Object.entries(SMP).map(([k,v])=>[k,v.length])),_dbg:{STY,INS,KIT,LDX},styles:Object.fromEntries(GENRES.map(g=>[g,STY[g].map(s=>s.n)])),genres:GENRES.slice(),render,
 /* festival set: called every frame by festMusic; plays the beat of the song on stage (a new beat when the setlist moves on)
    and follows the crowd's hype. Returns false if audio is not available, so the old drum loop can play instead. */
 fest(set){if(!set||!set.song||set._bt==-1)return false;
  if(set._bs!==set.song){set._bs=set.song;const p=play(set.song,{owner:set,form:'live',pads:1,fadeIn:.3,alive:()=>typeof FEST!='undefined'&&FEST.set===set&&!set.end});if(!p){set._bt=-1;return false}}
  if(cur&&cur.owner===set)cur.I=Math.max(0,Math.min(1,.72+.28*(set.hype||0)));return true}};
})();
