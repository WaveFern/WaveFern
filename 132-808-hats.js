/* ===== v43.0.0: pick the 808 and hi hat for a recording ===== */
/* The record menu gets two pickers under the diss track row. Auto lets the song's beat pick a recorded sample,
   Built-in keeps the old code-made sound, or pick one by name (picking plays it once). The choice is kept in S.bpick
   for the next recording and saved on the draft and the released song (s8, hh), so the song sounds the same later.
   Old songs have no pick and keep their old sound. */
(function(){
const cap=n=>n.charAt(0).toUpperCase()+n.slice(1);
const opts=(list,v)=>[['auto','Auto'],['','Built-in']].concat(list.map(n=>[n,cap(n)])).map(([k,l])=>`<option value="${k}"${k===v?' selected':''}>${l}</option>`).join('');
function row(lbl,kind,key,list){const pk=S.bpick||{},v=pk[key]!=null?pk[key]:'auto';
 return `<div class=r style="margin-top:8px"><span>${lbl}</span><select class=dsel data-k="${key}" data-kind="${kind}">${opts(list,v)}</select></div>`}
const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{if(mode!='menu'||typeof Beats=='undefined'||!Beats.drums)return r;
  const box=document.querySelector('#ui .box'),gen=box&&box.querySelector('.gen');if(!gen||box.querySelector('.dpk'))return r;
  const d=document.createElement('div');d.className='dpk';d.innerHTML=row('808','808','s8',Beats.drums.s808)+row('Hi hat','hat','hh',Beats.drums.hats);
  d.querySelectorAll('select').forEach(s=>s.onchange=()=>{S.bpick=Object.assign({},S.bpick,{[s.dataset.k]:s.value});if(s.value&&s.value!='auto')Beats.previewDrum(s.dataset.kind,s.value)});
  const p=box.querySelector('p.m');box.insertBefore(d,p||gen.nextSibling)}catch(e){console.error('drum picks',e)}return r};
})();
