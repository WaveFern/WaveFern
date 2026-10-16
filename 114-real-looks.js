/* ===== v26.132: famous artists look like their real-life counterparts (stylised) =====
   A hand-made table of broad, public traits only (skin tone, hair style and colour, beard, glasses, signature clothes and accessories) built
   from the character creator's own parts, so they stay blocky pixel characters, never photo likenesses.
   Used for the game's artists in Messages / collabs (ART), the Spotifly Browse artists and their pictures. Made-up artists keep their generated look.
   New: facial hair (c.fh 1 stubble, 2 moustache, 3 goatee, 4 beard; c.fhc colour) drawn on the pixel portrait and the 3D head. Characters without it are unchanged. */
/* Look codes (v42.1.0): on the admin account the character creator shows a code like
   "skin=7 hair=1 hc=#1b1b1f eyes=0 mouth=0 top=1 tc=#2f2f38 pc=#2c3e50 body=40 hgt=50" (see 124-look-code.js).
   Keys are the creator's own fields: skin/hair/eyes/mouth/top are indexes (SKIN, NM.hair, NM.eyes, NM.mouth, NM.top), hc/tc/pc are hex colours,
   body/hgt are 0-100. Any extra keys (jk, ht, ac, acc, fh, fhc ...) are copied as is. To give an artist a pasted look, set its config with
   lookFromCode('<code>') (loaded later, so call it at runtime), e.g. in a later file: RLK['new rapper']=lookFromCode('skin=7 hair=1 ...');
   and for an ART entry a[4]=lookFromCode(...). */
const RLK={};
{/* [name, skin 0-7 (0 fair .. 5 deep, 6 pale, 7 medium brown), hair style, hair colour, facial hair, {t top, tc top colour, jk jacket, ht hat, e eyes (4 shades,5 glasses), ac accessory (0 headphones,1 shades,2 chain,3 scarf), acc colour, pc trouser colour}] */
const K='#1b1b1f',BR='#4a2c1a',BL='#e3c77a',GR='#9aa0a6',GD='#e6b422',W='#f4f4f4',BK='#17171c';
[['Taylor Swift',6,5,BL,0,{t:4,tc:'#c0392b'}],['Bad Bunny',2,1,K,1,{e:4,t:1,tc:'#2f2f38'}],['Bruno Mars',2,11,K,2,{t:2,tc:GD}],['Rihanna',4,6,K,0,{t:4,tc:'#e84393'}],['Ariana Grande',6,7,'#7b4a2a',0,{t:0,tc:'#e8a0c8'}],
['Justin Bieber',6,17,'#b8905a',1,{t:1,tc:'#e8e8ec'}],['Dua Lipa',1,5,K,0,{t:4,tc:'#2c3e50'}],['Harry Styles',0,31,'#5a3a22',1,{t:3,tc:'#e84393'}],['Olivia Rodrigo',2,5,'#3a2418',0,{t:1,tc:'#9c27b0'}],['Sabrina Carpenter',6,5,'#e8cf7a',0,{t:4,tc:'#f48fb1'}],
['Post Malone',6,5,'#8b6b3a',4,{t:0,tc:'#e8e8ec',ac:2,acc:GD}],['Travis Scott',7,19,K,3,{t:1,tc:'#6b3a1a',ac:2,acc:GD}],['J. Cole',7,16,K,4,{t:0,tc:W}],['Eminem',0,0,'#c9b98a',1,{t:1,tc:'#2f2f38'}],['Kanye West',7,1,K,4,{t:2,tc:'#8a7a5a',ac:1}],
['Jay-Z',7,1,K,3,{t:2,tc:'#2f2f38',ac:2,acc:GD}],['Nicki Minaj',2,6,'#ff4d6d',0,{t:4,tc:'#ff4d6d'}],['Cardi B',2,5,K,0,{t:4,tc:'#c0392b'}],['Future',7,12,K,4,{t:0,tc:'#2f2f38',ac:2,acc:GD}],['21 Savage',4,12,K,1,{t:1,tc:'#2f2f38'}],
['Lil Wayne',7,12,K,3,{t:4,tc:'#c0392b',ac:2,acc:GD}],['Snoop Dogg',7,14,K,3,{t:2,tc:'#2f6fb5'}],['50 Cent',4,1,K,1,{t:0,tc:W,ac:2,acc:'#c0c0c8'}],['Tyler, the Creator',4,1,K,0,{t:1,tc:'#e84393',ht:2,e:5}],['A$AP Rocky',7,14,K,1,{t:2,tc:'#3f8f5a',ac:2,acc:GD}],
['Doja Cat',2,6,'#ff9ec7',0,{t:4,tc:'#2c3e50'}],['Megan Thee Stallion',7,5,K,0,{t:4,tc:'#f1c40f'}],['Beyonce',7,31,'#e8c875',0,{t:4,tc:GD}],['SZA',4,15,'#8a4a22',0,{t:0,tc:'#2ecc71'}],['Frank Ocean',7,1,'#c9a24a',1,{t:0,tc:'#e8e8ec'}],
['Usher',4,1,K,1,{t:2,tc:'#2f2f38'}],['Alicia Keys',7,19,'#3a2418',0,{t:4,tc:'#e8e8ec'}],['Brent Faiyaz',4,12,K,4,{t:1,tc:'#2f2f38'}],['Daniel Caesar',7,9,K,4,{t:0,tc:'#8a5a36'}],
['Coldplay',0,2,'#6b4a2a',1,{t:3,tc:'#3498db'}],['Imagine Dragons',0,11,'#3a2418',1,{t:4,tc:'#2f2f38'}],['Arctic Monkeys',0,23,K,1,{jk:7}],['Foo Fighters',0,5,'#3a2418',4,{t:0,tc:'#2f2f38'}],['Green Day',0,3,K,0,{t:0,tc:BK,ac:2,acc:'#c0392b'}],
['Metallica',0,2,GR,3,{t:4,tc:BK}],['Queen',2,2,K,2,{t:2,tc:GD}],['The Beatles',0,6,'#3a2418',0,{t:2,tc:'#4a4a52'}],['Nirvana',0,5,'#d9c27a',1,{t:3,tc:'#6f9bd1'}],['Red Hot Chili Peppers',1,5,K,3,{t:4,tc:'#c0392b'}],
['Linkin Park',0,1,K,1,{t:0,tc:BK}],['AC/DC',0,2,BR,0,{t:0,tc:W,ht:4,pc:'#2c3e50'}],['Fleetwood Mac',0,5,'#d9c27a',0,{t:4,tc:BK,ac:3,acc:'#c9a0dc'}],
['Calvin Harris',0,11,'#3a2418',4,{t:0,tc:'#e8e8ec'}],['David Guetta',0,2,'#c9c9d0',1,{t:2,tc:'#2f2f38'}],['Daft Punk',6,1,'#c0c0c8',0,{e:4,jk:2}],['Skrillex',6,17,K,0,{t:1,tc:BK,e:5}],['Marshmello',6,1,W,0,{e:4,t:1,tc:W}],
['Avicii',0,17,'#e0c47a',0,{t:0,tc:'#e8e8ec'}],['Kygo',0,17,'#c8a46a',1,{t:0,tc:'#e8e8ec'}],['Deadmau5',6,0,K,0,{e:4,ac:0,acc:'#c0c0c8',t:0,tc:'#e8e8ec'}],['Disclosure',0,2,'#6b4a2a',1,{t:1,tc:'#2c3e50'}],
['Morgan Wallen',0,22,'#6b4a2a',1,{t:0,tc:'#3f6f4a'}],['Luke Combs',0,2,BR,4,{ht:0,t:3,tc:'#3f6f4a'}],['Chris Stapleton',0,5,BR,4,{t:3,tc:'#3f6f4a'}],['Zach Bryan',0,2,'#6b4a2a',1,{t:1,tc:'#8a5a36'}],['Johnny Cash',0,28,K,0,{t:2,tc:BK,pc:BK}],
['Karol G',2,5,'#4fc3f7',0,{t:4,tc:'#e84393'}],['Shakira',0,31,'#e8c24a',0,{t:4,tc:GD}],['J Balvin',2,11,'#ff6ad5',1,{t:1,tc:'#ff8a30'}],['Rosalia',2,7,K,0,{t:4,tc:'#c0392b'}],['Peso Pluma',2,6,K,1,{jk:7}],
['Mac DeMarco',0,17,'#6b4a2a',1,{ht:3,t:0,tc:'#6f9bd1'}],['Tame Impala',0,5,'#6b4a2a',4,{t:3,tc:'#e6b422'}],['Phoebe Bridgers',6,6,K,0,{t:0,tc:BK}],['Bon Iver',0,1,'#8b6b3a',4,{t:3,tc:'#c0392b'}],['Fleet Foxes',0,5,'#5a3a22',4,{t:3,tc:'#3f6f4a'}],
['Noah Kahan',0,15,BR,1,{t:1,tc:'#3f6f4a'}],['Hozier',0,5,'#3a2418',1,{jk:2}],['Adele',0,5,'#d9b66a',0,{t:4,tc:BK}],['Lana Del Rey',6,5,BR,0,{t:4,tc:W}],['Elton John',0,1,GR,0,{e:5,t:2,tc:'#e84393'}],
['Michael Jackson',1,5,K,0,{t:2,tc:BK}],['Stevie Wonder',4,14,K,0,{e:4,t:2,tc:'#3f6f4a'}],['Nujabes',1,1,K,0,{e:5,ht:1,t:1,tc:'#2c3e50'}],
['Lil Tecca',3,12,K,1,{t:1,tc:'#3498db'}],['Ed Sheeran',0,2,'#c0572a',4,{t:1,tc:'#34495e'}],['Kendrick Lamar',4,14,K,3,{t:0,tc:'#e8e8ec'}],['Drake',7,1,K,4,{t:1,tc:'#2f2f38',ac:2,acc:GD}],['Dolly Parton',0,9,'#f1d27a',0,{t:4,tc:'#e84393',ac:2,acc:GD}],
['Billie Eilish',6,5,'#9fdc3a',0,{t:1,tc:'#e8e8ec'}],['The Weeknd',7,3,K,1,{jk:3}]
].forEach(a=>{const o=a[5]||{},c={skin:a[1],eyes:o.e||0,mouth:0,hair:a[2],hc:0,hc_custom:a[3],top:o.t||0,tc:0,pc:4,body:.4,hgt:.5};
 if(o.tc)c.tc_custom=o.tc;if(o.pc)c.pc_custom=o.pc;if(o.jk!=null)c.jk=o.jk;if(o.ht!=null)c.ht=o.ht;if(o.ac!=null){c.ac=o.ac;c.acc=o.acc||'#222222'}if(a[4]){c.fh=a[4];c.fhc=a[3]}
 RLK[a[0].toLowerCase()]=c})}
const realLook=n=>{const c=RLK[String(n).toLowerCase()];return c?Object.assign({},c):null};
/* the game's own artists (Messages, collabs, 3D) */
try{ART.forEach(a=>{const c=realLook(a[0]);if(c)a[4]=c})}catch(e){console.error('real looks',e)}
/* Spotifly Browse artists and their pictures */
brFace=function(i){if(BRFC.has(i))return BRFC.get(i);const x=BRL()[i];let u='';try{const cfg=realLook(x[0])||x[3]||lk(x[0]);u=(typeof pf2=='function'?pf2(cfg):pfp(cfg))}catch(e){u=sfCover({id:-(i+1)*7,g:x[1]})}BRFC.set(i,u);return u};
/* facial hair: pixel portrait */
{const f0=fig;fig=function(x,c,ox,oy){f0.apply(this,arguments);try{if(!c||!c.fh)return;const hc=c.fhc||c.hc_custom||HAIRC[c.hc%HAIRC.length],sk=SKIN[c.skin%SKIN.length],a=c.fh,R_=(col,u,v,w,h)=>rc(x,col,ox+u,oy+v,w,h);
 if(a==1){x.save();x.globalAlpha=.4;R_(hc,3,4.5,6,2.5);x.restore()}else if(a==2){R_(hc,4,4.3,4,.7)}else if(a==3){R_(hc,4,4.3,4,.6);R_(hc,5,5.6,2,1.4)}else if(a==4){R_(hc,3,4.5,6,2.5);R_(hc,2.6,3,.4,3);R_(hc,9,3,.4,3);R_('#7a2b2b',5,5.1,2,.5)}}catch(e){}}}
/* facial hair: 3D head */
{const b0=buildChar;buildChar=function(c){const r=b0.apply(this,arguments);try{if(c&&c.fh){const h=xHead(r.g);if(h){const hc=c.fhc||c.hc_custom||HAIRC[c.hc%HAIRC.length],sk=SKIN[c.skin%SKIN.length],a=c.fh;
 if(a==1)B(h,.5,.2,.03,cvMix(sk,hc,.35),0,-.17,.278);else if(a==2)B(h,.2,.05,.04,hc,0,-.07,.285);else if(a==3){B(h,.2,.05,.04,hc,0,-.07,.285);B(h,.12,.14,.04,hc,0,-.2,.285)}
 else if(a==4){B(h,.52,.2,.04,hc,0,-.18,.28);B(h,.2,.05,.04,hc,0,-.07,.285);[-1,1].forEach(s=>B(h,.04,.3,.2,hc,s*.265,-.05,.17))}}}}catch(e){console.warn('facial hair',e)}return r}}
