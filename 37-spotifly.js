/* ===== v26.20: the streaming app is called Spotifly again (the game itself is still WaveFern Records) ===== */
/* logo next to the app's name in its sidebar and on its setup page */
{const st=document.createElement('style');st.textContent='.sfh{display:flex;align-items:center;gap:8px}.sb h3.sfh img{width:26px;height:26px}h1.sfh img{width:1.1em;height:1.1em}';document.head.appendChild(st)}
/* saves from v26.7.1 to v26.19 keep the old sender names in their message and news lists: show the new name */
function sfRename(){(S.msgs||[]).forEach(m=>{if(m&&m.from=='WaveFern Team')m.from='Spotifly Team'});(S.news||[]).forEach(n=>{if(n&&n.u=='WaveFern Music News')n.u='Spotifly Music News'})}
{const l0=loadCode;loadCode=function(){const r=l0.apply(this,arguments);try{sfRename()}catch(e){}return r}}
