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
const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{if(mode!='menu'||typeof Beats=='undefined'||!Beats.drums)return r;
  const box=document.querySelector('#ui .box'),gen=box&&box.querySelector('.gen');if(!gen||box.querySelector('.dpk'))return r;
  const d=document.createElement('div');d.className='dpk';d.innerHTML=subRow()+row('808','808','s8',Beats.drums.s808)+row('Hi hat','hat','hh',Beats.drums.hats);
  d.querySelectorAll('select[data-kind]').forEach(s=>s.onchange=()=>{S.bpick=Object.assign({},S.bpick,{[s.dataset.k]:s.value});if(s.value&&s.value!='auto')Beats.previewDrum(s.dataset.kind,s.value)});
  const sg=d.querySelector('select[data-k=sg]');if(sg)sg.onchange=()=>{S.bpick=Object.assign({},S.bpick,{sg:sg.value});try{snd('click')}catch(e){}recMenu()};
  const p=box.querySelector('p.m');box.insertBefore(d,p||gen.nextSibling)}catch(e){console.error('drum picks',e)}return r};
})();
