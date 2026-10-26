/* ===== v47.0.0: genre focus =====
   Fans reward a steady sound. When a song is released, the five songs released before it set its focus:
   the same genre counts fully, a genre from the same family counts 0.8, anything else 0. A run of releases in one
   family adds a little more. The song keeps that multiplier (s.cf) on its daily streams for good:
     focus = 0.75 + 0.5 * share + 0.03 * run (run capped at 5)  →  about −25% (hopping) to +40% (steady)
   Families: Hip-Hop, Rap, R&B and Latin · Pop and Country · Lo-fi and Electronic · Rock.
   Songs released before this update keep their old streams (S.cfStart is the day the update first ran).
   The Make a song screen (165-song-menu.js) shows each genre's focus before you pick. */
(()=>{
const FAM={'Hip-Hop':'u','Rap':'u','R&B':'u','Latin':'u','Pop':'p','Country':'p','Lo-fi':'c','Electronic':'c','Rock':'r'};
const FAMN={u:'Hip-Hop, Rap, R&B and Latin',p:'Pop and Country',c:'Lo-fi and Electronic',r:'Rock'};
const fam=g=>FAM[g]||'x'+g;
function focus(prev,g){if(!prev.length)return 1;const f=fam(g);let sc=0;prev.forEach(p=>{sc+=p.g===g?1:fam(p.g)===f?.8:0});
 let run=0;for(let i=prev.length-1;i>=0&&fam(prev[i].g)===f;i--)run++;
 return Math.round((.75+.5*sc/prev.length+.03*Math.min(run,5))*100)/100}
const before=s=>{const i=S.songs.indexOf(s);return S.songs.slice(Math.max(0,(i<0?S.songs.length:i)-5),i<0?S.songs.length:i)};
function stamp(s){if(!s||s.cf!=null)return;if(S.cfStart==null)S.cfStart=S.day;s.cf=(s.day||0)>=S.cfStart?focus(before(s),s.g):1}
window.GFOCUS={fam,famName:g=>FAMN[FAM[g]]||g,next:g=>focus(S.songs.slice(-5),g)};
/* stamp on release and tell the player */
{const u0=upl;upl=function(id){const n0=S.songs.length,r=u0.apply(this,arguments);try{if(S.songs.length>n0){const s=S.songs[S.songs.length-1];stamp(s);
 const p=Math.round((s.cf-1)*100);if(p>=5)say('Genre focus: +'+p+'% streams on this song. Fans love your steady '+FAMN[FAM[s.g]]+' sound.');
 else if(p<=-5)say('Genre hop: '+p+'% streams on this song. Your fans expected more '+(()=>{const l=S.songs.slice(-6,-1);return l.length?FAMN[FAM[l[l.length-1].g]]||l[l.length-1].g:'of the same'})()+'.')}}catch(e){console.error('genre focus',e)}return r}}
/* every day's streams use the song's focus */
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;stamp(s);const m=s.cf;if(!(m>0)||m===1)return v;
 const x=(s.vx||0)+(s.fx||0),n=v-x;if(!(n>0))return v;
 s.pv=x+(m>1?Math.max(n,Math.min(Math.round(n*m),Math.round(songCap(s)-x))):Math.round(n*m));return s.pv}}
})();
