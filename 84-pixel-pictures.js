/* ===== v26.82: your own pictures, in the game's pixel style =====
   Upload a picture for your Spotifly profile, your Instagrime profile, or as an Instagrime photo post.
   Every upload is cropped to fill the frame, shrunk to a small pixel grid (PXS) and cut down to 16 colours (median cut,
   no dithering), so it looks like the rest of the game's pixel art. It is shown scaled up with hard pixel edges.
   Storage: one short string per picture (pxEnc): base64 of [width, height, colour count, palette RGB, 4-bit pixels].
   A profile picture (32x32) is 563 bytes, about 750 characters; a photo post (48x36) is 915 bytes, about 1,220 characters.
   Only the PX_KEEP newest photo posts keep their photo; older ones fall back to the game's drawn picture. */
const PXS={sp:[32,32],ig:[32,32],post:[48,36]},PX_KEEP=40,PX_COLS=16;
/* ---- encode / decode ---- */
function pxQuant(px,n){/* px: Uint8ClampedArray RGBA. Median cut into at most n colours; returns {pal:[[r,g,b]],idx:Uint8Array} */
 const N=px.length/4,all=[];for(let i=0;i<N;i++)all.push(i);let boxes=[all];
 const rng=b=>{let lo=[255,255,255],hi=[0,0,0];b.forEach(i=>{for(let c=0;c<3;c++){const v=px[i*4+c];if(v<lo[c])lo[c]=v;if(v>hi[c])hi[c]=v}});const d=hi.map((h,c)=>h-lo[c]),c=d.indexOf(Math.max(...d));return[c,d[c]]};
 while(boxes.length<n){let bi=-1,bc=0,bd=0;boxes.forEach((b,i)=>{if(b.length<2)return;const[c,d]=rng(b);if(d>bd){bd=d;bi=i;bc=c}});if(bi<0||bd<=0)break;
  const b=boxes[bi].slice().sort((x,y)=>px[x*4+bc]-px[y*4+bc]),m=b.length>>1;boxes.splice(bi,1,b.slice(0,m),b.slice(m))}
 const pal=boxes.map(b=>{const s=[0,0,0];b.forEach(i=>{for(let c=0;c<3;c++)s[c]+=px[i*4+c]});return s.map(v=>Math.round(v/b.length))}),idx=new Uint8Array(N);
 for(let i=0;i<N;i++){let bd=1e9,bk=0;for(let k=0;k<pal.length;k++){const p=pal[k],dr=px[i*4]-p[0],dg=px[i*4+1]-p[1],db=px[i*4+2]-p[2],d=dr*dr*.3+dg*dg*.59+db*db*.11;if(d<bd){bd=d;bk=k}}idx[i]=bk}
 return{pal,idx}}
function pxEnc(w,h,q){const n=q.pal.length,len=3+n*3+Math.ceil(w*h/2),b=new Uint8Array(len);b[0]=w;b[1]=h;b[2]=n;q.pal.forEach((p,k)=>{b[3+k*3]=p[0];b[4+k*3]=p[1];b[5+k*3]=p[2]});
 const o=3+n*3;for(let i=0;i<w*h;i++)b[o+(i>>1)]|=(q.idx[i]&15)<<(i&1?0:4);let s='';b.forEach(v=>s+=String.fromCharCode(v));return btoa(s)}
const PXC={};
function pxURL(code,sc=4){if(!code)return null;const key=code+'@'+sc;if(PXC[key])return PXC[key];try{const s=atob(code),b=Uint8Array.from(s,c=>c.charCodeAt(0)),w=b[0],h=b[1],n=b[2],o=3+n*3;if(!w||!h||!n||b.length<o+Math.ceil(w*h/2))return null;
 const k=document.createElement('canvas');k.width=w*sc;k.height=h*sc;const x=k.getContext('2d');
 for(let i=0;i<w*h;i++){const v=(b[o+(i>>1)]>>(i&1?0:4))&15,p=3+Math.min(v,n-1)*3;x.fillStyle='rgb('+b[p]+','+b[p+1]+','+b[p+2]+')';x.fillRect((i%w)*sc,Math.floor(i/w)*sc,sc,sc)}
 return PXC[key]=k.toDataURL()}catch(e){return null}}
/* shrink an image to w x h (cropped to fill), with a little extra colour so it sits with the game's palette */
function pxFromImage(img,w,h){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,r=Math.max(w/iw,h/ih),cw=w/r,ch2=h/r,sx=(iw-cw)/2,sy=(ih-ch2)/2;
 let src=img,sw=iw,sh=ih,ssx=sx,ssy=sy,scw=cw,sch=ch2;
 /* step down by halves first so a big photo does not alias */
 while(scw>w*2.5&&sch>h*2.5){const k=document.createElement('canvas');k.width=Math.max(1,Math.round(sw/2));k.height=Math.max(1,Math.round(sh/2));const x=k.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(src,0,0,sw,sh,0,0,k.width,k.height);const f=k.width/sw;src=k;ssx*=f;ssy*=f;scw*=f;sch*=f;sw=k.width;sh=k.height}
 const k=document.createElement('canvas');k.width=w;k.height=h;const x=k.getContext('2d');x.imageSmoothingQuality='high';try{x.filter='saturate(1.2) contrast(1.08)'}catch(e){}x.drawImage(src,ssx,ssy,scw,sch,0,0,w,h);
 const d=x.getImageData(0,0,w,h).data;for(let i=3;i<d.length;i+=4)if(d[i]<255){const a=d[i]/255;for(let c=1;c<4;c++)d[i-c]=Math.round(d[i-c]*a+18*(1-a));d[i]=255}
 return pxEnc(w,h,pxQuant(d,PX_COLS))}
/* ---- picking a file ---- */
let PXIN=null;
function pxPick(kind,done){if(!PXIN){PXIN=document.createElement('input');PXIN.type='file';PXIN.accept='image/*';PXIN.style.display='none';document.body.appendChild(PXIN)}
 PXIN.value='';PXIN.onchange=()=>{const f=PXIN.files&&PXIN.files[0];if(!f)return;if(!/^image\//.test(f.type||'')){snd('err');return say('That file is not a picture.')}
  const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{let c=null;try{const[w,h]=PXS[kind];c=pxFromImage(im,w,h)}catch(e){console.error('picture',e)}URL.revokeObjectURL(u);if(!c){snd('err');return say('Could not read that picture.')}done(c)};
  im.onerror=()=>{URL.revokeObjectURL(u);snd('err');say('Could not read that picture.')};im.src=u};PXIN.click()}
function pxSetPfp(where){pxPick(where,c=>{S[where=='sp'?'pfpSp':'pfpIg']=c;updateVersion();snd('ping');say((where=='sp'?'Spotifly':'Instagrime')+' profile picture updated.');pcR()})}
function pxResetPfp(where){delete S[where=='sp'?'pfpSp':'pfpIg'];snd('pop');say('Back to your drawn profile picture.');pcR()}
/* ---- showing them: your drawn avatar is swapped for your upload after each render ---- */
const PXD={k:null,u:null},pxDef=()=>{const k=JSON.stringify(ch);if(PXD.k!==k){PXD.k=k;PXD.u=pfp(ch)}return PXD.u};
function pxSwap(){const pc=document.getElementById('pc');if(!pc)return;const u=app==1?pxURL(S.pfpSp):app=='ig'?pxURL(S.pfpIg):null;if(!u)return;const d=pxDef();pc.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===d)i.src=u})}
{const p0=pcR;pcR=function(){p0.apply(this,arguments);try{pxSwap()}catch(e){console.error('picture swap',e)}}}
const pxBtns=w=>`<span class=pxb><button onclick="pxSetPfp('${w}')">📷 ${S[w=='sp'?'pfpSp':'pfpIg']?'Change':'Upload'} picture</button>${S[w=='sp'?'pfpSp':'pfpIg']?`<button onclick="pxResetPfp('${w}')">Use drawn avatar</button>`:''}</span>`;
{const h0=PG.home;PG.home=function(){const h=h0.apply(this,arguments);return S.artist?h.replace(/(monthly listeners[^<]*<\/p>)/,'$1'+pxBtns('sp')):h}}
{const st=document.createElement('style');st.textContent='.pxb{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.pxb button{font-size:12px;padding:5px 9px}.pxpv{display:block;width:100%;max-width:384px;margin:0 auto;image-rendering:pixelated;border:1px solid #262626}.ig .pxf{padding:10px 14px;display:flex;flex-direction:column;gap:8px}.ig .pxf input{width:100%;padding:8px;background:#121212;color:#fff;border:1px solid #363636;border-radius:6px;box-sizing:border-box}';document.head.appendChild(st)}

/* ---- photo posts ---- */
let PXP=null;/* the photo waiting to be shared: {c, cap} (not saved) */
function pxPostPick(){if(S.lastPost==S.day){snd('err');return say('One post per day.')}pxPick('post',c=>{PXP={c,cap:pick(CAPS)};igv='pxnew';pcR()})}
function pxPostShare(){if(!PXP)return;if(S.lastPost==S.day){snd('err');PXP=null;igv='acct';pcR();return say('One post per day.')}
 const before=S.igPosts.length;mkPost();const p=S.igPosts[S.igPosts.length-1];if(S.igPosts.length>before&&p&&p.mine){p.img=PXP.c;const cap=String(PXP.cap||'').trim().slice(0,120);if(cap)p.cap=cap;delete PICS[p.id];pxTrim()}
 PXP=null;igv='acct';igt='posts';pcR()}
function pxTrim(){const L=S.igPosts.filter(p=>p.img);if(L.length>PX_KEEP)L.slice(0,L.length-PX_KEEP).forEach(p=>{delete p.img;delete PICS[p.id]})}
const pxOf=p=>{if(!p)return null;if(p.img)return p.img;if(p.mine){const q=S.igPosts.find(x=>x.id==p.id);return q&&q.img}return null};
{const pp0=postPic;postPic=function(p){const c=pxOf(p),u=c&&pxURL(c,4);return u||pp0.apply(this,arguments)}}
{const ig0=PA.ig;PA.ig=()=>{if(igv=='pxnew'){if(!PXP){igv='acct';return PA.ig()}const hd=`<div class=igh><span class=igl>Instagrime</span><span style="display:flex;gap:8px"><button onclick="PXP=null;igv='feed';pcR()">Feed</button><button class=go onclick="PXP=null;igv='acct';igt='posts';pcR()">Account</button></span></div>`;
  return`<div class=ig>${hd}<div class=pxf><b>New photo post</b><img class=pxpv src="${pxURL(PXP.c,8)}"><small style="color:#aaa">Your photo, pixelated to ${PXS.post[0]}x${PXS.post[1]} in 16 colours.</small><input maxlength=120 value="${esc(PXP.cap)}" oninput="PXP.cap=this.value" placeholder="Write a caption"><div style="display:flex;gap:8px"><button class=go onclick="pxPostShare()">Share</button><button onclick="pxPostPick()">Pick another</button><button onclick="PXP=null;igv='acct';pcR()">Cancel</button></div></div></div>`}
 const h=ig0();if(igv!='acct')return h;
 return h.replace(/(<button class=go [^>]*onclick="mkPost\(\)">New post<\/button>)/,`$1 <button class=go ${S.lastPost==S.day?'disabled':''} onclick="pxPostPick()">📷 Photo post</button>`).replace(/(<div style="color:#aaa">Fame [^<]*<\/div>)/,'$1'+pxBtns('ig'))}}
