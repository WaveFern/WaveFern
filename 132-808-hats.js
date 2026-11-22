/* v49.93.27: the 808 and hi hat pickers were removed from Extras (rows no longer drawn; old picks are dropped). Songs already made keep their saved sounds. */
/* ===== v43.0.0: pick the 808 and hi hat for a recording (v49.25.0: and the sub-genre) ===== */
/* The record menu gets two pickers under the diss track row. Auto lets the song's beat pick a recorded sample,
   Built-in keeps the old code-made sound, or pick one by name (picking plays it once). The choice is kept in S.bpick
   for the next recording and saved on the draft and the released song (s8, hh), so the song sounds the same later.
   Old songs have no pick and keep their old sound. */
(function(){
const cap=n=>n.charAt(0).toUpperCase()+n.slice(1);
const opts=(list,v)=>[['auto','Auto'],['','Built-in']].concat(list.map(n=>[n,cap(n)])).map(([k,l])=>`<option value="${k}"${k===v?' selected':''}>${l}</option>`).join('');
function row(lbl,kind,key,list){const pk=S.bpick||{},v=pk[key]!=null?pk[key]:'auto';
 return `<div class=r style="margin-top:8px"><span>${lbl}</span><select class=dsel data-k="${key}" data-kind="${kind}">${opts(list,v)}</select></div>`}
/* v49.25.0: Sub-genre. Each genre's beat styles (67-beats.js: Boom Bap, UK Drill, House...) can be picked by name, grouped
   by genre. The pick only applies when you record that genre (any other genre gets a surprise style, as before); it is kept
   in S.bpick.sg as 'Genre|index' and saved on the draft and song as style, so the song keeps that beat. */
const subPick=()=>{const v=(S.bpick||{}).sg,m=/^(.+)\|(\d+)$/.exec(v||''),L=m&&Beats.styles&&Beats.styles[m[1]];return L&&+m[2]<L.length?{g:m[1],i:+m[2],n:L[+m[2]]}:null};
window.subPick=subPick;
function subRow(){const p=subPick(),v=p?p.g+'|'+p.i:'auto',G=(typeof GEN!='undefined'?GEN:Object.keys(Beats.styles)).filter(g=>Beats.styles[g]);
 return `<div class=r style="margin-top:8px"><span>Sub-genre</span><select class=dsel data-k="sg"><option value="auto"${v=='auto'?' selected':''}>Surprise me</option>${G.map(g=>`<optgroup label="${esc(g)}">${Beats.styles[g].map((n,i)=>`<option value="${esc(g)}|${i}"${v==g+'|'+i?' selected':''}>${esc(n)}</option>`).join('')}</optgroup>`).join('')}</select></div>${p?`<div class=m style="font-size:12px;margin-top:2px">Record ${esc(p.g)} to use ${esc(p.n)}.</div>`:''}`}
/* v49.51.0: the recorded instrument samples (Bass, Keys, Lead, Pad, Pluck from audio/oneshots). Auto lets the song's seed pick one,
   Built-in keeps the code-made voice, or pick one by name (picking plays it once). Kept in S.bpick.smp and saved on the draft and
   the released song as sp. The list comes from the manifest, so the rows appear a moment after the menu if it was not loaded yet. */
const SMPL={bass:'Bass',key:'Keys',lead:'Lead',pad:'Pad',pluck:'Pluck'};
function smpRows(){const I=Beats.instruments,pk=(S.bpick||{}).smp||{};
 return I.families.map(f=>{const L=I.list(f).slice().sort((a,b)=>a.n<b.n?-1:1);if(!L.length)return'';const v=pk[f]!=null?pk[f]:'auto';
  const o=[['auto','Auto'],['','Built-in']].concat(L.map(q=>[q.f,q.n])).map(([k,l])=>`<option value="${esc(k)}"${k===v?' selected':''}>${esc(l)}</option>`).join('');
  return `<div class=r style="margin-top:8px"><span>${SMPL[f]||cap(f)}</span><select class=dsel data-k="smp_${f}" data-l="${SMPL[f]||cap(f)}" data-fam="${f}">${o}</select></div>`}).join('')}
function smpFill(d){if(!d.isConnected)return;const h=smpRows();if(!h)return;const w=d.querySelector('.dsmp');if(!w)return;w.innerHTML=h;
 w.querySelectorAll('select[data-fam]').forEach(s=>s.onchange=()=>{const smp=Object.assign({},(S.bpick||{}).smp,{[s.dataset.fam]:s.value});S.bpick=Object.assign({},S.bpick,{smp});if(s.value&&s.value!='auto')Beats.instruments.preview(s.dataset.fam,s.value)})}
const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{if(S.bpick&&(S.bpick.s8!=null||S.bpick.hh!=null)){const b=Object.assign({},S.bpick);delete b.s8;delete b.hh;S.bpick=b}}catch(e){}try{if(mode!='menu'||typeof Beats=='undefined'||!Beats.drums)return r;
  const box=document.querySelector('#ui .box'),gen=box&&box.querySelector('.gen');if(!gen||box.querySelector('.dpk'))return r;
  const d=document.createElement('div');d.className='dpk';d.innerHTML=subRow()+'<div class=dsmp></div>';
  if(Beats.instruments){const w=d;smpFill(w);Beats.instruments.load().then(()=>{smpFill(w)})}
  d.querySelectorAll('select[data-kind]').forEach(s=>s.onchange=()=>{S.bpick=Object.assign({},S.bpick,{[s.dataset.k]:s.value});if(s.value&&s.value!='auto')Beats.previewDrum(s.dataset.kind,s.value)});
  const sg=d.querySelector('select[data-k=sg]');if(sg)sg.onchange=()=>{S.bpick=Object.assign({},S.bpick,{sg:sg.value});try{snd('click')}catch(e){}recMenu()};
  const p=box.querySelector('p.m');box.insertBefore(d,p||gen.nextSibling)}catch(e){console.error('drum picks',e)}return r};
})();
