/* v49.50.0: game UI style. The generic game screens (menus, pause, settings, map, wake-up, HUD) are plain black with one accent colour
   the player picks in Settings > Game. Stored in OPT.accent (localStorage fw_opt, so the wiki reads it too). style.css turns --ga into the
   look; this file sets --ga, --gad (darker) and --gat (text on top of the accent), draws the picker and keeps the tab icon in the accent. */
const GA_PRESETS=[['Green','#2fe68a'],['Blue','#4aa3ff'],['Cyan','#2fd8e6'],['Purple','#a67bff'],['Pink','#ff6ab8'],['Red','#ff5a5a'],['Orange','#ff9a3d'],['Yellow','#ffd84a'],['White','#f2f2f2']];
function gaOK(c){return typeof c=='string'&&/^#[0-9a-fA-F]{6}$/.test(c)}
function gaMix(c,k){const n=parseInt(c.slice(1),16);return'#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*k).toString(16).padStart(2,'0')).join('')}
function gaLum(c){const n=parseInt(c.slice(1),16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255}
/* the W logo (same pixels as favicon.svg) on black in the accent colour, used as the tab icon */
function gaIcon(c){const P='5,2 4,3 5,3 3,4 4,4 6,4 1,5 3,5 4,5 6,5 7,5 1,6 2,6 3,6 7,6 8,6 2,7 8,7'.split(' ').map(p=>{const[a,b]=p.split(',');return`<rect x='${a}' y='${b}' width='1' height='1'/>`}).join('');
 return"data:image/svg+xml,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'><rect width='10' height='10' rx='2' fill='#000'/><g fill='${c}'>${P}</g></svg>`)}
function gaApply(c){if(!gaOK(c))c='#2fe68a';const r=document.documentElement.style;r.setProperty('--ga',c);r.setProperty('--gad',gaMix(c,.55));r.setProperty('--gat',gaLum(c)>.55?'#050505':'#fff');
 try{document.querySelectorAll('link[rel=icon]:not(#gaico)').forEach(l=>l.remove());let l=document.getElementById('gaico');if(!l){l=document.createElement('link');l.id='gaico';l.rel='icon';l.type='image/svg+xml';document.head.appendChild(l)}l.href=gaIcon(c)}catch(e){}}
function gaSet(c){if(!gaOK(c))return;OPT.accent=c;svOpt();gaApply(c);if(typeof stDraw=='function'&&$('stg'))stDraw()}
gaApply(OPT.accent);
{const b0=stBody;stBody=function(){const h=b0.apply(this,arguments);if(STAB!='game')return h;
 const cur=(OPT.accent||'').toLowerCase(),sw=GA_PRESETS.map(([n,c])=>`<i title="${n}" class="${cur==c?'on':''}" style="background:${c}" onclick="gaSet('${c}')"></i>`).join('')
  +`<input type=color title="Custom colour" value="${gaOK(OPT.accent)?OPT.accent:'#2fe68a'}" oninput="gaApply(this.value)" onchange="gaSet(this.value)">`;
 const t=`<div class=so style="display:block"><span style="display:block">Accent colour<small class=m>The menus are black. Pick the colour for buttons, bars and highlights.</small></span><div class=gaw>${sw}</div></div>`;
 return t+h}}
{const r0=stReset;stReset=function(){r0.apply(this,arguments);OPT.accent='#2fe68a';svOpt();gaApply(OPT.accent)}}
