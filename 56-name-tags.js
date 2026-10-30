/* ===== v26.32.0: clear name tags above people =====
   Name tags were sprites drawn into the 3D view, which renders at a third of the screen resolution and shrinks the text
   with nearest-pixel sampling, so names came out faded, broken up and hard to read. Tags above people (shopkeepers,
   tower staff, artists you meet) are now drawn as crisp page text on a dark pill with an outline, at the screen's full
   resolution and always the same size, always facing you, placed over the person's head every frame. Other floating
   labels (building and street signs) keep their place in the world but get a sharper, smoother texture. */

/* people: buildChar's group is marked so a label added to it is known to be a name tag */
{const b0=buildChar;buildChar=function(c){const r=b0(c);try{r.g.userData.ch=1}catch(e){}return r}}

/* every label made through lbl(): sharper canvas (2x), outlined text on a rounded dark plate, smooth filtering */
const NTL=[];/* labels not yet known to be a name tag or a sign */
{const l0=lbl;lbl=function(t,w=3){let s;try{const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');
  x.fillStyle='rgba(8,12,16,.72)';const r=22;x.beginPath();x.moveTo(r,4);x.arcTo(508,4,508,92,r);x.arcTo(508,92,4,92,r);x.arcTo(4,92,4,4,r);x.arcTo(4,4,508,4,r);x.fill();
  let fs=46;const F=()=>x.font='bold '+fs+'px "Trebuchet MS",Verdana,"DejaVu Sans",sans-serif';F();while(x.measureText(t).width>470&&fs>14){fs--;F()}
  x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=7;x.strokeStyle='#05080a';x.strokeText(t,256,50);x.fillStyle='#ffffff';x.fillText(t,256,50);
  const tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;tx.anisotropy=4;
  s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:false,transparent:true}));s.scale.set(w,w*48/256,1)}catch(e){s=l0(t,w)}
 s.userData.lt=String(t);NTL.push(s);return s}}

/* the page layer that holds the tags: above the 3D view, below the HUD, menus and toasts */
const NTAG={box:null,list:[]};
function ntBox(){if(NTAG.box)return NTAG.box;const d=document.createElement('div');d.id='ntags';const h=document.getElementById('hud');document.body.insertBefore(d,h||document.body.firstChild);return NTAG.box=d}
{const st=document.createElement('style');st.textContent=
 '#ntags{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}'+
 /* v49.33.0: in the game's own style (v49.33.1: bigger): the pixel font on a dark panel with a hard black edge and drop shadow, and a little pixel tail */
 '#ntags .nt{position:absolute;left:0;top:0;transform:translate(-50%,-100%);white-space:nowrap;font:400 18px/1 Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#e8f3ec;background:#0b0f0d;padding:6px 10px 5px;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,3px 3px 0 #0009;will-change:transform}'+
 '#ntags .nt:after{content:"";position:absolute;left:50%;bottom:-9px;margin-left:-4px;width:8px;height:6px;background:#000}'+
 '#ntags .nt.art{color:#ffd84a;box-shadow:inset 0 0 0 2px #ffd84a,3px 3px 0 #0009}'+
 '#ntags .nt.art:before{content:"";display:inline-block;width:7px;height:7px;background:#ffd84a;margin-right:7px;vertical-align:2px}';
 document.head.appendChild(st)}
const NTV=new THREE.Vector3();
/* attached to the scene and every parent visible (the label itself is hidden: its page tag is drawn instead) */
function ntShown(s){let o=s.parent;while(o){if(!o.visible)return false;if(o===scene)return true;o=o.parent}return false}
function ntTick(){
 /* sort new labels: on a person's group they become page tags, anywhere else they stay signs */
 for(let i=NTL.length-1;i>=0;i--){const s=NTL[i],p=s.parent;if(!p)continue;NTL.splice(i,1);if(!p.userData||!p.userData.ch)continue;
  const el=document.createElement('div');el.className='nt';el.textContent=s.userData.lt;ntBox().appendChild(el);s.visible=false;NTAG.list.push({s,el,on:false,gone:0})}
 const W=innerWidth,H=innerHeight,show=mode!='pc'&&mode!='sleep'&&mode!='load'&&mode!='creator';
 for(let i=NTAG.list.length-1;i>=0;i--){const t=NTAG.list[i],s=t.s;let on=false;
  if(show&&ntShown(s)){s.getWorldPosition(NTV);NTV.y+=.12;NTV.project(NTAG.cam||cam);if(NTV.x>-1.15&&NTV.x<1.15&&NTV.y>-1.15&&NTV.y<1.2){on=true;
   const x=Math.round((NTV.x+1)/2*W),y=Math.round((1-NTV.y)/2*H);if(t.x!==x||t.y!==y){t.x=x;t.y=y;t.el.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-100%)'}
   const art=typeof ART_M!='undefined'&&ART_M.some(o=>o.m===s.parent);if(art!==t.art){t.art=art;t.el.classList.toggle('art',art)}}}
  if(on!==t.on){t.on=on;t.el.style.display=on?'block':'none'}
  /* a person removed from the world for good (an artist after the session, a rebuilt list) drops its tag */
  let o=s.parent;while(o&&o!==scene)o=o.parent;if(!o){if(++t.gone>240){t.el.remove();NTAG.list.splice(i,1)}}else t.gone=0}}
/* after each frame is drawn, so the tags sit exactly on the camera the frame used */
{const r0=renderer.render.bind(renderer);renderer.render=function(s,c){r0(s,c);if(s===scene)try{NTAG.cam=c;ntTick()}catch(e){}}}
