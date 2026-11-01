/* ===== v49.58.0: record and download the trailer (wavefern.com/mtrailer, /vtrailer, /?trailer) =====
   The Ready card of every trailer page gets a "Record and download" button. It asks the browser to share this tab (the
   browser's own picker; pick "This tab"), then press Space or tap as usual: the recording starts as the trailer rolls and stops
   by itself when the trailer ends, and the video downloads as an .mp4 (or .webm where the browser cannot make mp4),
   ready to upload to YouTube. The sound is taken straight from the trailer's song, so there is nothing to tick in the picker.
   Nothing is sent anywhere: the recording is made and saved on this device. */
if(TRL.on){
const REC={st:0,rec:null,chunks:[],stream:null,ctx:null,mime:'',note:''};
const name=()=>window.MPT?'wavefern-multiplayer-trailer':/[?&]vert\b/.test(location.search)?'wavefern-vertical-trailer':'wavefern-trailer';
const pick=()=>{const L=['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
 try{return L.find(t=>MediaRecorder.isTypeSupported(t))||''}catch(e){return''}};
const css=document.createElement('style');css.textContent='body.trlon #trlh,body.trlon #trlh *,body.trlon #trlsv,body.trlon #trlsv *{cursor:default!important}body.trlon #trlh #trlrec:not(:disabled){cursor:pointer!important}#trlh #trlrec,#trlh #trldl{pointer-events:auto;margin-top:10px;cursor:pointer}#trlh #trlrec:disabled{opacity:.6;cursor:default}#trlh .recn{display:block;margin-top:6px}';document.head.appendChild(css);
/* the button's press must not count as the tap that starts the trailer (that listener is added later, so this one runs first) */
addEventListener('pointerdown',e=>{if(e.target&&e.target.closest&&e.target.closest('#trlrec,#trldl')){e.stopImmediatePropagation()}},true);
addEventListener('keydown',e=>{if(REC.st==1&&(e.key=='Enter'||e.key==' ')&&document.activeElement&&document.activeElement.id=='trlrec'){e.stopImmediatePropagation();e.preventDefault()}},true);
function say(t){const n=document.querySelector('#trlh .recn');if(n)n.innerHTML=t}
/* the song goes to the recording as well as to the speakers */
function audioTap(){const a=TRL.aud=TRL.aud||new Audio(TRL.SRC);const C=window.AudioContext;const c=new C();REC.ctx=c;
 const dest=c.createMediaStreamDestination(),src=c.createMediaElementSource(a);src.connect(dest);
 try{/* the trailer page mutes the game's own audio context; the song still goes to the real speakers */
  const real=Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'destination').get.call(c);src.connect(real)}catch(e){src.connect(c.destination)}
 c.resume().catch(()=>{});return dest.stream.getAudioTracks()}
async function arm(){if(REC.st)return;const b=$('trlrec');
 if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia||typeof MediaRecorder=='undefined'){say('This browser cannot record the page. Use Chrome or Edge on a computer, or screen record as before.');return}
 REC.mime=pick();let tracks=[];try{tracks=audioTap()}catch(e){console.error('trailer record audio',e)}
 let s;try{s=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30,width:{ideal:1920},height:{ideal:1080}},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude',monitorTypeSurfaces:'exclude'})}
 catch(e){say('Recording was not started. Press the button again and choose <b>This tab</b> (or Chrome Tab) to share.');return}
 REC.stream=new MediaStream([...s.getVideoTracks(),...tracks]);REC.st=1;
 s.getVideoTracks()[0].addEventListener('ended',()=>{if(REC.st==2)finish()});
 if(b){b.disabled=true;b.textContent='● Recording armed'}
 say('Now press <b>Space</b> or tap the screen. It starts with the trailer, stops when the trailer ends and then downloads the video.'+(tracks.length?'':'<br>No song sound could be captured.'))}
function begin(){if(REC.st!=1)return;REC.st=2;REC.chunks=[];
 try{REC.rec=new MediaRecorder(REC.stream,Object.assign({videoBitsPerSecond:12e6,audioBitsPerSecond:192e3},REC.mime?{mimeType:REC.mime}:{}))}
 catch(e){try{REC.rec=new MediaRecorder(REC.stream)}catch(x){console.error('trailer record',x);REC.st=0;return}}
 REC.rec.ondataavailable=e=>{if(e.data&&e.data.size)REC.chunks.push(e.data)};REC.rec.onstop=save;REC.rec.start(1000);
 /* stop when the trailer has ended (its last shot is the end card) */
 REC.t=setInterval(()=>{if(TRL.run&&TRL.T>=TRL.len+.4)finish()},200)}
function finish(){if(REC.st!=2)return;REC.st=3;clearInterval(REC.t);try{REC.rec.stop()}catch(e){save()}try{REC.stream.getTracks().forEach(t=>t.stop())}catch(e){}}
function save(){const type=(REC.rec&&REC.rec.mimeType)||REC.mime||'video/webm',ext=/mp4/.test(type)?'mp4':'webm',blob=new Blob(REC.chunks,{type:type.split(';')[0]});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name()+'.'+ext;document.body.appendChild(a);a.click();a.remove();
 /* the file is saved; this card stays so it can be saved again if the download was blocked */
 const o=$('trl'),d=document.createElement('div');d.className='qhint box';d.id='trlsv';d.style.pointerEvents='auto';d.innerHTML=`<b>Saved: ${name()}.${ext}</b> (${(blob.size/1048576).toFixed(0)} MB)<br><small class=m>Upload this file to YouTube.</small><br><a download="${name()}.${ext}" href="${u}" style="color:var(--g)">Download it again</a> · <a href="" style="color:var(--g)">Run it again</a>`;if(o)o.appendChild(d)}
/* the button on the Ready card, and the recorder starting as the trailer rolls */
{const p0=trlPlay;trlPlay=function(){const r=p0.apply(this,arguments);try{const h=$('trlh');if(h&&!$('trlrec')){
  h.insertAdjacentHTML('beforeend','<br><button class=go id="trlrec" type=button>⏺ Record and download video</button><small class="m recn">Saves the trailer as a video file to upload to YouTube. Pick <b>This tab</b> when your browser asks.</small>');
  /* the multiplayer trailer also has a finished video on the site, for downloading without watching or recording anything */
  if(window.MPT)$('trlrec').insertAdjacentHTML('afterend','<a class=go id="trldl" href="mtrailer/wavefern-multiplayer-trailer.mp4" download="wavefern-multiplayer-trailer.mp4" style="display:inline-block;margin:10px 0 0 8px;padding:6px 10px;border:2px solid #000;background:var(--g);color:#04120a;font-weight:700;text-decoration:none;pointer-events:auto">⬇ Download the video now</a>');
  $('trlrec').addEventListener('click',e=>{e.stopPropagation();arm()})}}catch(e){console.error('trailer record',e)}return r}}
{const r0=trlRoll;trlRoll=function(){const r=r0.apply(this,arguments);if(REC.st==1)setTimeout(begin,650);return r}}
}
