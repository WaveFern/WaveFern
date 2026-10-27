/* ---------- new address notice (v49.0.0) ----------
   Players who played at wavefern.github.io/WaveFern get one card, after loading, saying the game now lives at
   wavefern.com and their saves came along. 00-moved-saves.js sets fw_moved_note when it brings saves across. */
(function(){
 let on=0;try{on=localStorage.getItem('fw_moved_note')}catch(e){}
 if(!on)return;
 const go=()=>{const l=document.getElementById('load');if(l&&getComputedStyle(l).display!='none')return setTimeout(go,500);
  setTimeout(()=>{try{localStorage.removeItem('fw_moved_note')}catch(e){}
   try{snd('chime')}catch(e){}
   Pops.show('c|moved',e=>{e.className='pcard gl';e.innerHTML='<small>WE MOVED</small><h2>wavefern.com</h2><p>WaveFern has a new home. The old wavefern.github.io link now brings you here, and your careers, backups and settings came with you. Bookmark this address.</p>'},12000)},1200)};
 go();
})();
