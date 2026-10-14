/* ===== v26.114: Settings > Music > "Music source": the soundtrack, or your own released songs looping outside the computer ===== */
/* The choice and the number of songs live in S (musSrc, musTop) so they travel with saves and save codes. */
const msrc=()=>S.musSrc=='songs'?'songs':'sound',mtop=()=>Math.max(1,Math.min(50,Math.round(+S.musTop)||3));
const mTopSongs=()=>(S.songs||[]).slice().sort((a,b)=>b.streams-a.streams||b.id-a.id).slice(0,mtop());
/* true when the player's songs are what plays: needs the setting on and at least one released song, else the soundtrack is the fallback */
const mSongsOn=()=>msrc()=='songs'&&mTopSongs().length>0;
const MSG={i:0,t:0,id:0,SEC:70};
{const nt=nextTrack;nextTrack=function(){return mSongsOn()?-1:nt.apply(this,arguments)}}
function mSetSrc(v){S.musSrc=v;MSG.id=0;if(v=='songs'&&mSongsOn())musSkip();else if(v!='songs'){const c=Beats.current();if(c&&c.owner=='mine')Beats.stop(.6)}
 if(typeof autosave=='function')try{autosave()}catch(e){}stDraw()}
function mSetTop(v){S.musTop=Math.max(1,Math.min(50,Math.round(+v)||3));MSG.id=0;MSG.i=0;const c=Beats.current();if(c&&c.owner=='mine')Beats.stop(.3);stDraw()}
setInterval(()=>{try{
 if(!MU.on||!mSongsOn()||(mode!='play'&&mode!='drive'))return;
 const c=Beats.current(),L=mTopSongs();
 if(c){if(c.owner!='mine')return;if(performance.now()-MSG.t>MSG.SEC*1000){MSG.i=(MSG.i+1)%L.length;Beats.stop(.8);MSG.t=performance.now()+1500}return}
 if(performance.now()<MSG.t&&MSG.t-performance.now()<2000)return;
 if(MSG.i>=L.length)MSG.i=0;const s=L[MSG.i];
 if(Beats.play(s,{owner:'mine',form:'song',alive:()=>mSongsOn()&&mode!='pc'&&mode!='rec',fadeIn:1.5})){MSG.t=performance.now();MSG.id=s.id}
}catch(e){}},1000);
{const sb=stBody;stBody=function(){const h=sb.apply(this,arguments);if(STAB!='music')return h;
 const n=(S.songs||[]).length,src=msrc();
 return`<h3>Music source</h3><div class=so><span>Play<small class=m>${src=='songs'&&!n?'You have no released songs yet, so the soundtrack plays':'Outside the computer'}</small></span><button class="${src=='sound'?'go':''}" onclick="mSetSrc('sound')">Soundtrack</button><button class="${src=='songs'?'go':''}" onclick="mSetSrc('songs')">My songs</button></div>`
 +`<div class=so><span>Top songs to loop<small class=m>Your most streamed songs, played one after another on loop (${n} released)</small></span><input type=number min=1 max=50 value=${mtop()} style="width:70px" onchange="mSetTop(this.value)"></div>`+h}}
