/* WaveFern dev: a row of social links under the main menu buttons (TikTok, Instagram, YouTube, Reddit). Only loaded on /dev/.
   The icons are pixel-art sprites drawn here as all-white SVG squares (no emoji, no image files, no outside requests).
   Add ?nosocial to the address to skip it. The row sits inside the menu column, so it never overlaps the buttons or the footer. */
(function(){
 if(!window.FW_DEV||/[?&]nosocial/.test(location.search))return;
 if(typeof titleUI!='function')return;
 window.FW_SOCIAL=1;
 /* 24 x 24 sprites: # is a white pixel */
 const SPR={
  tiktok:['........................', '........................', '...........######.......', '...........#######......', '...........########.....', '...........#########....', '...........####..###....', '...........####..###....', '...........####.........', '...........####.........', '...........####.........', '........#######.........', '......#########.........', '.....##########.........', '.....##########.........', '....####...####.........', '....###....####.........', '....###....####.........', '.....###..####..........', '.....#########..........', '......#######...........', '........###.............', '........................', '........................'],
  instagram:['........................', '.....##############.....', '...##################...', '..####............####..', '..##................##..', '.###............###.###.', '.##........##...###..##.', '.##......######..##..##.', '.##.....########.....##.', '.##....###....###....##.', '.##....##......##....##.', '.##...###......###...##.', '.##...###......###...##.', '.##....##......##....##.', '.##....###....###....##.', '.##.....########.....##.', '.##......######......##.', '.##........##........##.', '.###................###.', '..##................##..', '..####............####..', '...##################...', '.....##############.....', '........................'],
  youtube:['........................', '........................', '........................', '........................', '...##################...', '..####################..', '.######################.', '.######################.', '#########..#############', '#########...############', '#########.....##########', '#########......#########', '#########......#########', '#########.....##########', '#########...############', '#########..#############', '.######################.', '.######################.', '..####################..', '...##################...', '........................', '........................', '........................', '........................'],
  reddit:['........................', '..................#.....', '.................###....', '................#####...', '................#####...', '...............##.##....', '..............##........', '.............##.........', '...........###..........', '..##...##########...##..', '.######################.', '.######################.', '.#######.######.#######.', '..#####...####...#####..', '..#####...####...#####..', '..#####...####...#####..', '..####################..', '...#####.######.#####...', '....####...##...####....', '.....#####....#####.....', '.......##########.......', '........................', '........................', '........................']
 };
 const LINKS=[
  ['tiktok','TikTok','@wavefern.com','https://www.tiktok.com/@wavefern.com'],
  ['instagram','Instagram','@waveferngame','https://www.instagram.com/waveferngame'],
  ['youtube','YouTube','@wavefern','https://www.youtube.com/@wavefern'],
  ['reddit','Reddit','r/wavefern','https://www.reddit.com/r/wavefern']
 ];
 function icon(k){
  let d='';SPR[k].forEach((r,y)=>{for(let x=0;x<24;x++)if(r[x]=='#')d+='M'+x+' '+y+'h1v1h-1z'});
  return '<svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><path fill="#fff" d="'+d+'"/></svg>'}
 /* the dev menu has extra buttons, so on a short phone in landscape it can be taller than the screen: let it scroll (safe centering) so the last buttons and this row can always be reached */
 const CSS='#ttl .fwsoc{position:fixed;right:max(4px,env(safe-area-inset-right));bottom:max(4px,env(safe-area-inset-bottom));display:flex;justify-content:flex-end;gap:5px;margin:0;padding:0;list-style:none;z-index:5}'+
  '#ttl .fwsoc a{display:flex;align-items:center;justify-content:center;width:26px;height:26px;box-sizing:border-box;background:#0b0f0de6;border:2px solid #000;box-shadow:inset 0 0 0 1px #2a352e,2px 2px 0 #000a;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .22s cubic-bezier(.65,0,.35,1),background .22s}'+
  '#ttl .fwsoc a svg{image-rendering:pixelated;display:block;width:16px;height:16px}'+
  '#ttl .fwsoc a:hover{transform:scale(1.15);background:#14301a}#ttl .fwsoc a:active{transform:scale(.95)}'+
  '#ttl .fwsoc a:focus-visible{outline:2px solid #fff;outline-offset:2px;background:#14301a}'+
  '@media(pointer:coarse){#ttl .fwsoc a{width:34px;height:34px}}'+
  /* on narrow screens the centred footer line would run under the icons, so lift it above them */
  '@media(max-width:760px){#ttl .ttft{bottom:calc(max(4px,env(safe-area-inset-bottom)) + 34px)}}@media(max-width:760px) and (pointer:coarse){#ttl .ttft{bottom:calc(max(4px,env(safe-area-inset-bottom)) + 42px)}}';
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
