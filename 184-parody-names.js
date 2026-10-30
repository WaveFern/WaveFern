/* ===== v49.32.0: real artists become parodies =====
   Every real artist in the game (the Messages/collab roster ART, Spotifly Browse, mentors and the awards pool) gets a parody name you can still recognise.
   This runs last, so looks, listener numbers and seeds worked out from the old names at load stay exactly the same.
   The real-looks table also answers to the parody name, and saves made before this have the old names swapped when they load. */
const PARODY={'Lil Tecca':'Lil Decka','Ed Sheeran':'Ed Shearin','Kendrick Lamar':'Kenrick Llamar','Dolly Parton':'Dolly Partin','Billie Eilish':'Billie Eyelash','Drake':'Drakeo','The Weeknd':'The Weekdayz',
 'Bruno Mars':'Bruno Marz','Rihanna':'Rihanya','Justin Bieber':'Justin Beaver','Taylor Swift':'Taylor Swiff','Lady Gaga':'Lady Googoo','Coldplay':'Coldpay','Ariana Grande':'Ariana Grandé','Bad Bunny':'Bad Bunnie',
 'Shakira':'Shakeera','Katy Perry':'Katy Peary','Michael Jackson':'Michael Jaxon','David Guetta':'David Ghetto','Maroon 5':'Maroon 6','Pitbull':'Pitbill','Dua Lipa':'Dua Leepa','Calvin Harris':'Kelvin Harriss',
 'Eminem':'M&Em','J Balvin':'J Balvino','Kanye West':'Kanya East','Sia':'Seea','Karol G':'Carol Gee','Lana Del Rey':'Lana Del Ray-Ban','Olivia Rodrigo':'Olivia Rodrigoh','SZA':'SZZA','Post Malone':'Toast Malone',
 'Black Eyed Peas':'Black Eyed Beans','Daddy Yankee':'Daddy Yanky','Beyonce':'Beyonsay','Harry Styles':'Hairy Styles','Travis Scott':'Travis Scotch','Miley Cyrus':'Smiley Cyrus','Tame Impala':'Tame Impalla',
 'Justin Timberlake':'Justin Timberlane','Sean Paul':'Shaun Pall','Adele':'Adelle','Linkin Park':'Linkin Parked','Arctic Monkeys':'Arctic Donkeys','Chris Brown':'Chris Browne','Shreya Ghoshal':'Shreya Ghoshel',
 'Shawn Mendes':'Shawn Mendez','Doja Cat':'Doja Dog','Madonna':'Madonnah','Marshmello':'Marshmellow','Sam Smith':'Sam Smyth','Ellie Goulding':'Ellie Golding','Halsey':'Halsea','Rauw Alejandro':'Raw Alejandro',
 'Sabrina Carpenter':'Sabrina Woodworker','Alicia Keys':'Alicia Kees','Zara Larsson':'Zara Larson','sombr':'sombrr','Arijit Singh':'Arijeet Singh','Ozuna':'Ozoona','Imagine Dragons':'Imagine Wagons','Future':'Futur',
 'J. Cole':'J. Kohl','Jay-Z':'Jay-Zee','Nicki Minaj':'Nikki Menage','Cardi B':'Cardi Bee','21 Savage':'22 Savage','Lil Wayne':'Lil Wane','Snoop Dogg':'Snoop Hogg','50 Cent':'51 Cent','Tyler, the Creator':'Tyler, the Curator',
 'A$AP Rocky':'A$AP Rockie','Megan Thee Stallion':'Megan Thee Pony','Frank Ocean':'Frank Lake','Usher':'Ushur','Brent Faiyaz':'Brent Fayaz','Daniel Caesar':'Daniel Salad','Foo Fighters':'Foo Fightaz',
 'Green Day':'Green Daze','Metallica':'Metallicka','Queen':'Qween','The Beatles':'The Beetles','Nirvana':'Nirvanna','Red Hot Chili Peppers':'Red Hot Chilli Pepperz','AC/DC':'AC/BC','Fleetwood Mac':'Fleetwood Snack',
 'Daft Punk':'Daft Punck','Skrillex':'Skrillax','Avicii':'Aviccy','Kygo':'Kyygo','Deadmau5':'Deadmaus6','Disclosure':'Dysclosure','Morgan Wallen':'Morgan Wallin','Luke Combs':'Luke Brushes','Chris Stapleton':'Chris Staplegun',
 'Zach Bryan':'Zack Brian','Johnny Cash':'Johnny Credit','Rosalia':'Rozalia','Peso Pluma':'Peso Plumber','Mac DeMarco':'Mac DeMarko','Phoebe Bridgers':'Phoebe Fridgers','Bon Iver':'Bon Ivor','Fleet Foxes':'Fleet Boxes',
 'Noah Kahan':'Noah Kahn','Hozier':'Hozyer','Elton John':'Elton Jon','Stevie Wonder':'Stevie Wondah','Nujabes':'Nujabbs','Jinsang':'Jinsong',
 'Beyoncé':'Beyonsay','Prince':'Princely','Dr. Dre':'Dr. Drey','Jimi Hendrix':'Jimmy Hendrikz'};
try{ART.forEach(a=>{const p=PARODY[a[0]];if(p)a[0]=p});if(typeof BRX!='undefined')BRX.forEach(x=>{const p=PARODY[x[0]];if(p)x[0]=p});
 if(typeof MEN!='undefined')MEN.forEach(m=>{const p=PARODY[m[1]];if(p)m[1]=p});if(typeof AW!='undefined'&&AW.pool)AW.pool.forEach(x=>{const p=PARODY[x[0]];if(p)x[0]=p});
 if(typeof RLK!='undefined')for(const k in PARODY){const c=RLK[k.toLowerCase()];if(c)RLK[PARODY[k].toLowerCase()]=c}
 if(typeof REAL_SET!='undefined')[...REAL_SET].forEach(n=>{if(PARODY[n])REAL_SET.add(PARODY[n])});}catch(e){console.error('parody names',e)}
/* old saves: swap real names in every string (whole words, case sensitive) */
const PARODY_RX=new RegExp('(^|[^A-Za-z0-9$À-ÿ])('+Object.keys(PARODY).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')).join('|')+')(?![A-Za-z0-9À-ÿ])','g');
function parodyFix(v){if(typeof v=='string')return v.replace(PARODY_RX,(m,b,n)=>b+PARODY[n]);if(Array.isArray(v)){for(let i=0;i<v.length;i++)v[i]=parodyFix(v[i]);return v}
 if(v&&typeof v=='object'){for(const k in v)v[k]=parodyFix(v[k]);return v}return v}
if(typeof scDecode=='function'){const d0=scDecode;scDecode=function(){return parodyFix(d0.apply(this,arguments))}}
try{if(typeof S!='undefined'&&S)parodyFix(S)}catch(e){}
