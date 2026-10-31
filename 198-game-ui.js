/* v49.52.0: game UI style, only on a few screens: the world map, pause menu, main menu, FPS counter, the HUD boxes (monthly listeners, money,
   energy and so on) and the waking-up card. They are plain black with one accent colour the player picks in Settings > Game. Every other
   screen keeps its own look. style.css turns --ga into the look; this file sets --ga, --gad (darker) and --gat (text on top of the accent)
   and draws the picker. The accent is saved in OPT.accent (localStorage fw_opt). */
const GA_PRESETS=[['Green','#2fe68a'],['Blue','#4aa3ff'],['Cyan','#2fd8e6'],['Purple','#a67bff'],['Pink','#ff6ab8'],['Red','#ff5a5a'],['Orange','#ff9a3d'],['Yellow','#ffd84a'],['White','#f2f2f2']];
function gaOK(c){return typeof c=='string'&&/^#[0-9a-fA-F]{6}$/.test(c)}
function gaMix(c,k){const n=parseInt(c.slice(1),16);return'#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*k).toString(16).padStart(2,'0')).join('')}
function gaLum(c){const n=parseInt(c.slice(1),16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255}
function gaApply(c){if(!gaOK(c))c='#2fe68a';const r=document.documentElement.style;r.setProperty('--ga',c);r.setProperty('--gad',gaMix(c,.55));r.setProperty('--gat',gaLum(c)>.55?'#050505':'#fff')}
function gaSet(c){if(!gaOK(c))return;OPT.accent=c;svOpt();gaApply(c);if(typeof stDraw=='function'&&$('stg'))stDraw()}
gaApply(OPT.accent);
{const b0=stBody;stBody=function(){const h=b0.apply(this,arguments);if(STAB!='game')return h;
 const cur=(OPT.accent||'').toLowerCase(),sw=GA_PRESETS.map(([n,c])=>`<i title="${n}" class="${cur==c?'on':''}" style="background:${c}" onclick="gaSet('${c}')"></i>`).join('')
  +`<input type=color title="Custom colour" value="${gaOK(OPT.accent)?OPT.accent:'#2fe68a'}" oninput="gaApply(this.value)" onchange="gaSet(this.value)">`;
 const t=`<div class=so style="display:block"><span style="display:block">Accent colour<small class=m>Colour for the map, pause menu, main menu, FPS counter, HUD boxes and the waking-up card.</small></span><div class=gaw>${sw}</div></div>`;
 return t+h}}
{const r0=stReset;stReset=function(){r0.apply(this,arguments);OPT.accent='#2fe68a';svOpt();gaApply(OPT.accent)}}
