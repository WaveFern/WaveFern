/* ===== v26.131: Create album gets many more options =====
   New in the creator: a name generator and title suffix, release type (Album, EP, Deluxe, Mixtape, Live...), genre and mood tags, format,
   liner note, 10 composed art styles (with re-roll), 12 more colour pairs plus your own two colours, a filter, 8 borders, a sticker,
   and one-tap track ordering (best first, best last, newest, A to Z, shuffle, peak in the middle, group by genre...).
   Everything new is stored on the album (type, ag, md, fmt, note, tpl, seed, cc, flt, stk); albums without those fields show as before. */
const AOT=['Album','EP','Deluxe','Mixtape','Live album','Compilation','Soundtrack','Acoustic','Remix album','Anniversary edition','Greatest hits'],
 AOS=['None','(Deluxe)','(Deluxe Edition)','(Expanded)','(Live)','(Acoustic)','(Remixed)','(Special Edition)','(Anniversary Edition)','(Platinum Edition)','Vol. 2','Part II','(The Extended Cut)','(Bonus Tracks)','(Slowed + Reverb)','(Instrumentals)'],
 AOG=['Auto','Pop','Hip-Hop','Rap','R&B','Rock','Electronic','Lo-fi','Country','Folk','Indie','Latin','Jazz','Metal','Soul','Funk','Punk','Reggae','Gospel','Classical','Ambient','House','Trap','Drill','Afrobeats','K-Pop','Synthwave','Blues','Disco','Grime'],
 AOM=['None','Chill','Hype','Dark','Dreamy','Romantic','Angry','Happy','Nostalgic','Late night','Summer','Heartbreak'],
 AOF=['Digital','Vinyl','Cassette','CD','Picture disc'],AOL=['None','Warm','Cool','Black & white','Vignette','Film grain','High contrast'],
 AOB=['None','Thin','Thick','Double','Polaroid','Black','Film strip','Gold'],AOK=['None','Explicit','Gold star','New ribbon','Barcode'],
 AON1=['Midnight','Golden','Broken','Neon','Paper','Velvet','Silent','Electric','Wild','Lazy','Burning','Cold','Sweet','Lost','Rolling','Crystal','Heavy','Summer','Faded','Hollow','Bright','Low','Pale','Wasted','Honey','Static'],
 AON2=['Roads','Hearts','Lights','Dreams','Waves','Skies','Rivers','Echoes','Streets','Moons','Fires','Letters','Games','Ghosts','Stars','Flowers','Cities','Seasons','Tapes','Mornings','Rooms','Maps','Sundays','Colours','Pictures','Voices'];
function aoInit(){const d={tpl:99,seed:1+Math.floor(Math.random()*1e6),ty:0,sf:0,ag:0,md:0,fm:0,flt:0,stk:0,note:'',ccOn:0,c0:'#1f2a44',c1:'#f5c542'};for(const k in d)if(AL[k]===undefined)AL[k]=d[k];if(AL.brd===undefined)AL.brd=0}
const aoPick=a=>a[Math.floor(Math.random()*a.length)];
function aoName(){AL.name=(Math.random()<.5?aoPick(AON1)+' '+aoPick(AON2):aoPick(AON2).slice(0,-1)+' '+aoPick(['Tonight','Again','Forever','Alone','Home','Gone','Tomorrow','Nowhere','No More','In Blue','At Dawn','On Repeat'])).slice(0,32);pcR()}
function aoSort(m){const L=AL.sel.map(id=>S.songs.find(x=>x.id==id)).filter(Boolean),st=x=>x.streams||0,cmp={best:(a,b)=>st(b)-st(a),last:(a,b)=>st(a)-st(b),new:(a,b)=>b.id-a.id,old:(a,b)=>a.id-b.id,az:(a,b)=>String(a.title).localeCompare(b.title),q:(a,b)=>(b.q||0)-(a.q||0),genre:(a,b)=>String(a.g).localeCompare(b.g)||st(b)-st(a)};
 let R;if(m=='rev')R=L.slice().reverse();else if(m=='shuf'){R=L.slice();for(let i=R.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[R[i],R[j]]=[R[j],R[i]]}}
 else if(m=='peak'){const s=L.slice().sort(cmp.best),f=[],b=[];s.forEach((x,i)=>(i%2?b:f).push(x));R=[...f.reverse(),...b]}
 else if(m=='mix'){const s=L.slice().sort(cmp.best),h=Math.ceil(s.length/2);R=[];for(let i=0;i<h;i++){R.push(s[i]);if(s[s.length-1-i]&&s[s.length-1-i]!==s[i])R.push(s[s.length-1-i])}}
 else R=L.slice().sort(cmp[m]);AL.sel=R.map(x=>x.id);snd('pop');pcR()}
const aoB=(arr,key)=>arr.map((n,i)=>`<button class="${AL[key]==i?'go':''}" onclick="AL.${key}=${i};pcR()">${n}</button>`).join('');
const aoRow=(t,h)=>`<b style="display:block;margin-top:10px">${t}</b><div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0">${h}</div>`;
function aoDetails(){const sn=AL.sf>0?AOS[AL.sf]:'';return`<h3>Details</h3><div class=ng><button onclick="aoName()">🎲 Random name</button><span class=m style="margin-left:8px">${esc((AL.name||'').trim()+(sn?' '+sn:''))||'Your title'} · ${AOT[AL.ty]}</span></div>
 ${aoRow('Release type',aoB(AOT,'ty'))}${aoRow('Title ending',aoB(AOS,'sf'))}${aoRow('Genre',aoB(AOG,'ag'))}${aoRow('Mood',aoB(AOM,'md'))}${aoRow('Format',aoB(AOF,'fm'))}
 <b style="display:block;margin-top:10px">Liner note</b><div class=ng><input placeholder="One line about the record (optional)" maxlength=80 value="${esc(AL.note)}" oninput="AL.note=this.value"></div>`}
function aoStyle(){const T=['Classic symbol',...CVT],cov=i=>i==0?cover({pal:AL.pal,sym:AL.sym,bg:0,brd:0,face:0}):genCover({seed:AL.seed,tpl:i,pal:AL.pal,cc:AL.ccOn?[AL.c0,AL.c1]:null,g:AOG[AL.ag]=='Auto'?(AL.sel.length&&S.songs.find(x=>x.id==AL.sel[0])||{}).g||'Pop':AOG[AL.ag],title:AL.name,cfg:i==8?ch:null});
 const th=(i,l,u)=>`<span style="text-align:center;font-size:11px"><img title="${l}" src="${u}" style="width:56px;height:56px;image-rendering:pixelated;cursor:pointer;display:block;border:3px solid ${AL.tpl==i?'var(--g)':'#000'}" onclick="AL.tpl=${i};pcR()">${l}</span>`;
 return`<b style="display:block;margin-top:10px">Art style</b><div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0">${th(0,T[0],cov(0))}${th(99,'Auto',cov(99>10?(AL.seed%10)+1:99))}${CVT.map((n,i)=>th(i+1,n,cov(i+1))).join('')}</div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0"><button onclick="AL.seed=1+Math.floor(Math.random()*1e6);pcR()">🎲 Re-roll the picture</button><label><input type=checkbox ${AL.ccOn?'checked':''} onchange="AL.ccOn=this.checked?1:0;pcR()"> My own colours</label>${AL.ccOn?`<input type=color value="${AL.c0}" onchange="AL.c0=this.value;pcR()"><input type=color value="${AL.c1}" onchange="AL.c1=this.value;pcR()">`:''}</div>
 ${AL.tpl>0?aoRow('Filter',aoB(AOL,'flt'))+aoRow('Sticker',aoB(AOK,'stk')):'<small class=m>Pick an art style other than Classic to use filters and stickers.</small>'}`}
const aoSortBar=()=>`<b style="display:block;margin-top:6px">Order tracks</b><div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px">${[['best','Best first'],['last','Best last'],['peak','Peak in the middle'],['mix','Hit, deep cut, hit'],['new','Newest first'],['old','Oldest first'],['q','Highest quality'],['genre','Group by genre'],['az','A to Z'],['rev','Reverse'],['shuf','Shuffle']].map(a=>`<button onclick="aoSort('${a[0]}')">${a[1]}</button>`).join('')}</div>`;
{const p0=PG.albums;PG.albums=function(){aoInit();let h=p0.apply(this,arguments);
 const i=h.indexOf('<h3>Cover art</h3>');if(i>=0)h=h.slice(0,i)+aoDetails()+h.slice(i);
 h=h.replace(/<b>Border<\/b><div>[\s\S]*?<\/div>/,'<b>Border</b><div>'+aoB(AOB,'brd')+'</div>');
 const j=h.indexOf('<b>Symbol or object</b>');if(j>=0)h=h.slice(0,j)+aoStyle()+h.slice(j);
 const k=h.indexOf('<div class=al2>');if(k>=0)h=h.slice(0,k)+aoSortBar()+h.slice(k);return h}}
{const m0=mkAlbum;mkAlbum=function(){aoInit();const n=S.albums.length,nm=AL.name,sf=AL.sf>0?AOS[AL.sf]:'';if(sf&&nm.trim().length>=2)AL.name=nm.trim()+' '+sf;
 m0.apply(this,arguments);
 if(S.albums.length>n){const a=S.albums[S.albums.length-1],g=AOG[AL.ag]=='Auto'?(()=>{const c={};a.songs.forEach(id=>{const x=S.songs.find(q=>q.id==id);if(x&&x.g)c[x.g]=(c[x.g]||0)+1});return Object.keys(c).sort((p,q)=>c[q]-c[p])[0]||'Pop'})():AOG[AL.ag];
  Object.assign(a,{type:AOT[AL.ty],ag:g,md:AL.md>0?AOM[AL.md]:'',fmt:AOF[AL.fm],note:String(AL.note||'').trim().slice(0,80),tpl:AL.tpl,seed:AL.seed,flt:AL.tpl>0?AL.flt:0,stk:AL.tpl>0?AL.stk:0});if(AL.ccOn)a.cc=[AL.c0,AL.c1];
  AL.seed=1+Math.floor(Math.random()*1e6);AL.note='';AL.sf=0;AL.ty=0;AL.ccOn=0}else AL.name=nm}}
const aoMeta=a=>[a.type,a.ag,a.md,a.fmt&&a.fmt!='Digital'?a.fmt:''].filter(Boolean).join(' · ');
{const h0=PG.home;PG.home=function(){let h=h0.apply(this,arguments);(S.albums||[]).forEach(a=>{if(!a.type)return;const t=`<b style="font-size:17px;color:var(--t)">${esc(a.name)}</b>`,i=h.indexOf(t);if(i<0)return;h=h.slice(0,i+t.length)+`<br><small class=m>${esc(aoMeta(a))}</small>`+(a.note?`<br><small class=m><i>${esc(a.note)}</i></small>`:'')+h.slice(i+t.length)});return h}}
{const d0=sfDisco;sfDisco=function(){let h=d0.apply(this,arguments);const A=(S.albums||[]).slice().reverse();let n=0;return h.replace(/Album · Day/g,()=>{const a=A[n++];return a&&a.type?esc(a.type)+(a.ag?' · '+esc(a.ag):'')+' · Day':'Album · Day'})}}
