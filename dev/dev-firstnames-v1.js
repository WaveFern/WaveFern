/* WaveFern dev: requested people show by first name only. Only loaded on /dev/. Saves refer to artists by index, so renaming in place is safe. */
(function(){
 const M={'Alex Arbuckle':'Alex','John Dodds':'John','Sochi Irukwu':'Sochi','Billy Butler':'Billy','Amir Suenu':'Amir','Henry Dodds':'Henry','Max You':'Max'};
 try{if(typeof ART==='undefined')return;
  const taken=new Set(ART.map(a=>a[0]));
  ART.forEach(a=>{const n=M[a[0]];if(n&&!taken.has(n)){a[0]=n}});
  if(typeof DM_FRIENDS!=='undefined'&&DM_FRIENDS.add)Object.values(M).forEach(n=>DM_FRIENDS.add(n));
  if(typeof DM_NEVER!=='undefined'&&DM_NEVER.add)Object.keys(M).forEach(k=>{if(DM_NEVER.has(k)){DM_NEVER.delete(k);DM_NEVER.add(M[k])}});
  const s0=window.say;if(typeof s0==='function')window.say=function(t){return s0.call(this,typeof t==='string'?t.replace(/Alex Arbuckle/g,'Alex'):t)};
 }catch(e){}
})();
