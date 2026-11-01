#!/usr/bin/env node
/* Music variety test (v49.54.0): loads the beat engine (67-beats.js) without a browser and checks that different seeds give clearly different
   songs, and that the lead melodies follow the rules that make hooks stick.
     node tools/music-test.js            summary + failures (exit code 1 if a check fails)
     node tools/music-test.js --show     also prints example songs: chords and melody per section
     node tools/music-test.js --render   also renders a few songs with headless Chromium (Playwright) to check the audio engine runs */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const noop=()=>{},el=()=>({style:{},appendChild:noop,classList:{toggle:noop,add:noop},addEventListener:noop,setAttribute:noop});
const ctx={console,setInterval:()=>0,clearInterval:noop,setTimeout:()=>0,addEventListener:noop,document:{createElement:el,head:{appendChild:noop},addEventListener:noop,hidden:false,querySelectorAll:()=>[]},navigator:{},fetch:undefined,Math,Object,Array,Set,Map,Float32Array,Uint32Array,Number,String,JSON,Error,RegExp,Date};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'67-beats.js'),'utf8')+';this.Beats=Beats',ctx,{filename:'67-beats.js'});
const B=ctx.Beats,args=process.argv.slice(2);
let fails=0;const check=(ok,msg)=>{if(!ok){fails++;console.log('  FAIL  '+msg)}else console.log('  ok    '+msg)};
const N=60,genres=B.genres;
const rows=[];
for(const g of genres)for(let i=0;i<N;i++)rows.push(B.analyze({genre:g,seed:(i*2654435761+g.length*977+i*i*131)>>>0}));
const uniq=a=>new Set(a).size;
console.log('\n'+rows.length+' songs ('+N+' seeds in each of '+genres.length+' genres)');
console.log('\nPer genre: distinct sub-styles / keys / modes / progressions / hook melodies / forms (out of '+N+')');
for(const g of genres){const R=rows.filter(x=>x.genre==g);
 console.log('  '+g.padEnd(11),String(uniq(R.map(x=>x.style))).padStart(2),String(uniq(R.map(x=>x.key))).padStart(2),String(uniq(R.map(x=>x.mode))).padStart(2),String(uniq(R.map(x=>x.prog.hk+'|'+x.prog.vs))).padStart(3),String(uniq(R.map(x=>x.hookShape))).padStart(3),String(uniq(R.map(x=>x.form))).padStart(2),' bpm',Math.min(...R.map(x=>x.bpm)),'-',Math.max(...R.map(x=>x.bpm)))}
/* overall */
const sig=x=>x.mode+'|'+x.prog.vs+'|'+x.prog.hk;
console.log('\nOverall');
check(uniq(rows.map(sig))>rows.length*.55,'distinct (mode, verse chords, chorus chords): '+uniq(rows.map(sig))+' of '+rows.length);
check(uniq(rows.map(x=>x.hookShape))>rows.length*.9,'distinct hook melodies (intervals+rhythm): '+uniq(rows.map(x=>x.hookShape))+' of '+rows.length);
check(uniq(rows.map(x=>x.mode))>=6,'modes used: '+[...new Set(rows.map(x=>x.mode))].join(', '));
check(uniq(rows.map(x=>x.key))==12,'all 12 keys used');
check(uniq(rows.map(x=>x.form))==4,'all 4 song layouts used');
/* same style, different seeds: how alike are they */
let same=0,pairs=0;for(const g of genres){const R=rows.filter(x=>x.genre==g);for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){if(R[i].style!=R[j].style)continue;pairs++;if(R[i].prog.hk==R[j].prog.hk&&R[i].key==R[j].key&&R[i].mode==R[j].mode)same++}}
check(same/pairs<.02,'same sub-style + same key + same mode + same chorus chords: '+(same/pairs*100).toFixed(2)+'% of '+pairs+' pairs');
/* chords */
const nChords=uniq(rows.flatMap(x=>[x.prog.vs,x.prog.hk,x.prog.br,x.prog.pc]));
check(nChords>=100,'distinct section progressions: '+nChords);
const qual=new Set(rows.flatMap(x=>Object.values(x.prog).join(' ').split(' ').map(c=>c.replace(/^[A-G][b#]?/,'')||'maj')));
check(['m','7','maj7','m7','dim','m7b5','sus4'].filter(q=>!qual.has(q)).length<=2,'chord qualities used: '+[...qual].join(' '));
check(rows.every(x=>x.prog.vs&&x.prog.hk&&x.prog.br&&x.prog.pc&&x.prog['in']),'every song has verse, chorus, bridge, pre-chorus and intro chords');
const bothDiff=rows.filter(x=>x.prog.hk!=x.prog.vs).length/rows.length;
check(bothDiff>.5,'chorus chords differ from verse chords in '+(bothDiff*100|0)+'% of songs (rest are loop-based styles)');
/* melody quality */
const H=rows.filter(x=>x.hasLead);
const m=k=>H.reduce((a,x)=>a+x.mel[k],0)/H.length;
console.log('\nHook melody over '+H.length+' songs with a lead');
const st=m('stepwise'),lp=m('leaps'),rp=m('repeats'),ct=m('strongCT'),rg=m('range'),dn=m('density');
check(st>.38&&st<.8,'stepwise motion '+(st*100|0)+'% (steps of 1-2 semitones)');
check(lp>.03&&lp<.35,'leaps (4+ semitones) '+(lp*100|0)+'%');
check(rp>.04&&rp<.4,'repeated notes '+(rp*100|0)+'%');
check(ct>.9,'notes on beat 1 and 3 that are a note of the chord playing: '+(ct*100|0)+'%');
check(rg>=7&&rg<=17.5,'average range of the chorus '+rg.toFixed(1)+' semitones');
check(m('motifRepeat')>.9,'bar 3 repeats the rhythm of bar 1 in '+(m('motifRepeat')*100|0)+'% of hooks');
check(m('endsOnRoot')>.8,'the chorus ends on the root note in '+(m('endsOnRoot')*100|0)+'% of hooks');
check(m('questionFirst')>.7,'the first phrase asks (does not end on the root) in '+(m('questionFirst')*100|0)+'% of hooks');
check(m('maxGap')<=17,'largest jump in a hook: avg '+m('maxGap').toFixed(1)+' semitones');
console.log('  (density '+dn.toFixed(1)+' notes per chorus bar)');
if(args.includes('--show')){const pick=[['Pop',11],['Pop',12],['Pop',13],['Hip-Hop',3],['Hip-Hop',4],['Rap',5],['Rap',6],['R&B',7],['Lo-fi',8],['Rock',9],['Rock',10],['Country',2],['Electronic',14],['Latin',15]];
 console.log('\nExamples');for(const[g,i]of pick){const a=B.analyze({genre:g,seed:(i*2654435761+g.length*977+i*i*131)>>>0});
  console.log('\n'+g+' / '+a.style+'  '+a.bpm+' bpm  '+a.keyName+'  layout '+a.form+'  lead: '+a.lead);
  for(const k of['in','vs','pc','hk','br'])console.log('  '+k.padEnd(3),a.prog[k]);
  console.log('  chorus melody:');a.hook.forEach((b,j)=>console.log('    bar '+(j+1)+'  '+b))}}
if(args.includes('--render')){let pw;for(const p of['playwright','/opt/node-tools/node_modules/playwright'])try{pw=require(p);break}catch(e){}
 if(!pw){console.log('\n(--render needs Playwright)')}else(async()=>{const br=await pw.chromium.launch(),pg=await br.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.setContent('<html><body></body></html>');await pg.addScriptTag({content:fs.readFileSync(path.join(root,'67-beats.js'),'utf8')});
  const out=await pg.evaluate(async([gs,secs])=>{const res=[];for(const[g,seed]of gs){const b=await Beats.render({genre:g,seed},secs,{sampleRate:8000,form:'song'});const d=b.getChannelData(0);let s=0,pk=0;for(const v of d){s+=v*v;pk=Math.max(pk,Math.abs(v))}let s2=0;for(let i=d.length*.8|0;i<d.length;i++)s2+=d[i]*d[i];res.push([g,seed,Beats.plan({genre:g,seed}).bpm+'bpm',Math.sqrt(s/d.length).toFixed(3),pk.toFixed(2),'last fifth rms '+Math.sqrt(s2/(d.length*.2)).toFixed(3)])}return res},[[['Pop',1],['Pop',2],['Hip-Hop',3],['Rap',4],['R&B',5],['Lo-fi',6],['Rock',7],['Country',8],['Electronic',9],['Latin',10]],150]);
  console.log('\nRendered 150 s of 10 songs (rms / peak):');out.forEach(x=>console.log('  '+x.join('  ')));console.log(errs.length?'page errors: '+errs.join('; '):'no page errors');
  const bad=out.filter(x=>+x[3]<.01);if(bad.length||errs.length)process.exitCode=1;await br.close()})()}
console.log(fails?'\n'+fails+' check(s) failed':'\nall checks passed');process.exitCode=process.exitCode||(fails?1:0);
