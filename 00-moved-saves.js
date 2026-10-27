/* ---------- saves from the old address (v48.8.0) ----------
   The game moved from wavefern.github.io/WaveFern to wavefern.com, and browsers keep saves per address.
   The first time a browser opens wavefern.com, hop to wavefern.github.io/move.html (repo WaveFern.github.io),
   which reads the fw_ and wk_ keys still stored there and comes straight back with them in #fwmove=.
   Keys this browser already has here are never overwritten. Runs before anything else reads a save. */
(function(){
 const H=location.hostname;if(H!=='wavefern.com'&&H!=='www.wavefern.com')return;
 let ls;try{ls=localStorage;ls.setItem('fw_moved_t','1');ls.removeItem('fw_moved_t')}catch(e){return}
 const here=location.origin+location.pathname+location.search;
 const m=/^#fwmove=(.*)$/.exec(location.hash);
 if(m){
  const h=m[1];
  if(!/^[gj]\./.test(h)){history.replaceState(null,'',here);return}
  window.stop();
  const bin=atob(h.slice(2).replace(/-/g,'+').replace(/_/g,'/')),u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const txt=h[0]=='g'?new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text():Promise.resolve(new TextDecoder().decode(u));
  txt.then(t=>{const d=JSON.parse(t);for(const k in d)if(/^(fw|wk)_/.test(k)&&ls.getItem(k)===null&&typeof d[k]=='string')ls.setItem(k,d[k])})
   .catch(()=>{}).then(()=>location.replace(here));
  return;
 }
 if(ls.getItem('fw_moved'))return;
 ls.setItem('fw_moved','1');
 for(let i=0;i<ls.length;i++)if(/^fw_(save|bak|u_)/.test(ls.key(i)))return;
 window.stop();
 location.replace('https://wavefern.github.io/move.html?back='+encodeURIComponent(here));
})();
