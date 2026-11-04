/* WaveFern dev: a row of social links under the main menu buttons (TikTok, Instagram, YouTube, Reddit). Only loaded on /dev/.
   The icons are pixel-art sprites drawn here as all-white SVG squares (no emoji, no image files, no outside requests).
   Add ?nosocial to the address to skip it. The row sits inside the menu column, so it never overlaps the buttons or the footer. */
(function(){
 if(!window.FW_DEV||/[?&]nosocial/.test(location.search))return;
 if(typeof titleUI!='function')return;
 window.FW_SOCIAL=1;
 /* 12 x 12 sprites: # is a white pixel */
 const SPR={
  tiktok:['.....###....','.....#####..','.....#..###.','.....#....##','.....#......','.....#......','..#####.....','.######.....','.######.....','.######.....','..####......','............'],
  instagram:['.##########.','#..........#','#.......##.#','#...####...#','#..#....#..#','#..#....#..#','#..#....#..#','#..#....#..#','#...####...#','#..........#','#..........#','.##########.'],
  youtube:['............','............','.##########.','####.#######','####..######','####...#####','####....####','####...#####','####..######','####.#######','.##########.','............'],
  reddit:['..........##','.......##.##','......#.#...','..#######...','.#########..','###.####.###','############','.##########.','..#..##..#..','...######...','............','............']
 };
 SPR.tiktok[1]='.....#####...';
 const LINKS=[
  ['tiktok','TikTok','@wavefern.com','https://www.tiktok.com/@wavefern.com'],
  ['instagram','Instagram','@waveferngame','https://www.instagram.com/waveferngame'],
  ['youtube','YouTube','@wavefern','https://www.youtube.com/@wavefern'],
  ['reddit','Reddit','r/wavefern','https://www.reddit.com/r/wavefern']
 ];
 function icon(k){
  let d='';SPR[k].forEach((r,y)=>{for(let x=0;x<12;x++)if(r[x]=='#')d+='M'+x+' '+y+'h1v1h-1z'});
  return '<svg viewBox="0 0 12 12" width="24" height="24" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><path fill="#fff" d="'+d+'"/></svg>'}
 /* the dev menu has extra buttons, so on a short phone in landscape it can be taller than the screen: let it scroll (safe centering) so the last buttons and this row can always be reached */
 const CSS='#ttl{overflow-y:auto;overscroll-behavior:contain}#ttl .ttm{margin:auto;padding-bottom:34px;box-sizing:content-box}#ttl .fwsoc{display:flex;justify-content:center;gap:10px;margin:14px 0 0;padding:0;list-style:none;width:100%}'+
  '#ttl .fwsoc a{display:flex;align-items:center;justify-content:center;width:44px;height:44px;box-sizing:border-box;background:#0b0f0de6;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,3px 3px 0 #000a;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .22s cubic-bezier(.65,0,.35,1),background .22s}'+
  '#ttl .fwsoc a svg{image-rendering:pixelated;display:block}'+
  '#ttl .fwsoc a:hover{transform:scale(1.1);background:#14301a}#ttl .fwsoc a:active{transform:scale(.95)}'+
  '#ttl .fwsoc a:focus-visible{outline:3px solid #fff;outline-offset:2px;background:#14301a}'+
  /* the dev menu is about 690px tall, so on a normal browser window (Edge on a Mac is often ~650px of page) the row used to sit below the fold with no sign it was there: tighten the dev menu on shorter windows so the whole menu, row included, fits on screen */
  '@media(max-height:780px){#ttl .ttm>.px{margin:8px 0 10px}#ttl .ttm h1{font-size:clamp(30px,6vw,44px)}#ttl .ttbx{gap:7px;padding:10px}#ttl .ttbx>button{padding:8px 12px;font-size:14px}#ttl .fwsoc{margin-top:10px}#ttl .ttm{padding-bottom:26px}}'+
  '@media(max-height:640px){#ttl .ttm>.px{margin:6px 0 8px;padding:3px 8px}#ttl .ttm h1{font-size:clamp(26px,5vw,34px)}#ttl .ttbx{gap:5px;padding:8px}#ttl .ttbx>button{padding:5px 10px;font-size:13px}#ttl .fwsoc{margin-top:8px}#ttl .fwsoc a{width:38px;height:38px}#ttl .fwsoc a svg{width:20px;height:20px}}'+
  '@media(max-height:560px){#ttl .fwsoc{margin-top:8px;gap:8px}#ttl .fwsoc a{width:38px;height:38px}#ttl .fwsoc a svg{width:20px;height:20px}}'+
  '@media(max-height:560px) and (pointer:coarse){#ttl .fwsoc a{width:44px;height:44px}}';
 function add(){
  const t=document.getElementById('ttl'),m=t&&t.querySelector('.ttm');
  if(!m||m.querySelector('.fwsoc'))return;
  if(!document.getElementById('fwsoc-css')){const s=document.createElement('style');s.id='fwsoc-css';s.textContent=CSS;document.head.appendChild(s)}
  const ul=document.createElement('ul');ul.className='fwsoc';ul.setAttribute('aria-label','WaveFern on social media');
  LINKS.forEach(l=>{
   const li=document.createElement('li');li.style.display='contents';
   const a=document.createElement('a');a.href=l[3];a.target='_blank';a.rel='noopener noreferrer';
   a.title=l[1]+' '+l[2];a.setAttribute('aria-label',l[1]+' '+l[2]+' (opens in a new tab)');a.innerHTML=icon(l[0]);
   li.appendChild(a);ul.appendChild(li)});
  m.appendChild(ul)}
 const t0=titleUI;titleUI=function(){const r=t0.apply(this,arguments);try{add()}catch(e){console.error('social',e)}return r};
})();
