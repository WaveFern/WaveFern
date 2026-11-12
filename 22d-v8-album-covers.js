/* ---------- v11: album cover art (split out of 22-v8-clothes-wardrobe-big-catalogues-pixel.js, unchanged code) ---------- */
/* v11 album covers */
PALS.push(['#0b132b','#5bc0be'],['#2d1b3d','#f7b267'],['#10002b','#9d4edd'],['#003049','#fcbf49'],['#3d0000','#ff6b6b'],['#14213d','#fca311'],['#1b4332','#95d5b2'],['#590d22','#ffb3c1'],['#212529','#ff9f1c'],['#023e8a','#caf0f8'],['#3c096c','#ffd60a'],['#264653','#e9c46a'],['#6a040f','#ffba08'],['#e5e5e5','#14213d']);
Object.assign(AL,{bg:0,brd:0,face:0});
const SYMN=['Circle','Triangle','Diamond','Stripes','Cross','Wave','Star','Heart','Skull','Crown','Flame','Moon','Sun','Note','Mic','Headphones','Car','Cat','Orb','Cloud','Gem','Bolt','Vinyl','Camera','Ghost','Rocket','Eye','Flower','Palm','None'];
const CSPR=[['.....#.....','.....#.....','....###....','###########','.#########.','..#######..','..#######..','.####.####.','.###...###.','.##.....##.','...........'],
['..###.###..','.#########.','###########','###########','###########','.#########.','..#######..','...#####...','....###....','.....#.....','...........'],
['..#######..','.#########.','###########','##..###..##','##..###..##','###########','.####.####.','..#######..','..#.#.#.#..','..#######..','...........'],
['#....#....#','##..###..##','###.###.###','###########','###########','###########','.#########.','...........','...........','...........','...........'],
['.....#.....','....##.....','....###..#.','...####.##.','..#######..','.#########.','.#########.','.#########.','..#######..','...#####...','...........'],
['...####....','..###......','.###.......','.###.......','.###.......','.###.......','.####......','..#####..##','...########','....#####..','...........'],
['.....#.....','.#...#...#.','..#.###.#..','...#####...','.#.#####.#.','#..#####..#','.#.#####.#.','...#####...','..#.###.#..','.#...#...#.','.....#.....'],
['....#######','....#######','....#.....#','....#.....#','....#.....#','....#.....#','..###...###','.####..####','..##....##.','...........','...........'],
['...#####...','..#######..','..#######..','..#######..','..#######..','...#####...','.#..###..#.','.#.#####.#.','..#######..','.....#.....','...#####...'],
['..#######..','.##.....##.','##.......##','#.........#','#.........#','###.....###','###.....###','###.....###','###.....###','...........','...........'],
['...........','...#####...','..#.#.#.#..','.#########.','###########','###########','###########','##.#####.##','.###...###.','..#.....#..','...........'],
['#.........#','##.......##','###########','###########','##.##.##.##','###########','####.#.####','###########','.#########.','..#######..','...........'],
['....###....','..#######..','.#########.','.#########.','###########','###########','.#########.','.#########.','..#######..','....###....','...........'],
['...........','....###....','..#######..','.#########.','###########','###########','.#########.','...........','...........','...........','...........'],
['...........','..#######..','.#########.','###########','.#########.','..#######..','...#####...','....###....','.....#.....','...........','...........'],
['.....####..','....####...','...####....','..####.....','.#########.','....####...','...####....','..###......','..##.......','.#.........','...........'],
['...#####...','..#######..','.####.####.','###########','####...####','###.....###','####...####','###########','.####.####.','..#######..','...#####...'],
['...........','..###......','##########.','#........#.','#..####..#.','#.######.#.','#.######.#.','#..####..#.','#........#.','##########.','...........'],
['..#######..','.#########.','###########','##.#####.##','##.#####.##','###########','###########','###########','###########','##.##.##.##','#..##.##..#'],
['.....#.....','....###....','....###....','...#####...','...#####...','...#####...','..#######..','.#########.','.##.###.##.','....###....','.....#.....'],
['...........','....###....','..#######..','.####.####.','####...####','.####.####.','..#######..','....###....','...........','...........','...........'],
['....###....','...#####...','.##.###.##.','####.#.####','.##.###.##.','...#####...','....###....','.....#.....','.....#.....','...###.....','...........'],
['..##.###...','.####.###..','##..###.##.','.....#.....','.....#.....','.....#.....','.....#.....','.....#.....','....###....','...........','...........']];
const COVC={},CSPR2=[];
function cover(a){const key=[a.pal,a.sym,a.bg,a.brd,a.face,a.face?JSON.stringify(a.cfg||ch):''].join('|');if(COVC[key])return COVC[key];
 const k=document.createElement('canvas');k.width=k.height=96;const x=k.getContext('2d');x.imageSmoothingEnabled=false;x.scale(2,2);
 const c=PALS[(a.pal||0)%PALS.length],f=c[1],b0=c[0],bg=a.bg||0,sy=a.sym==null?0:a.sym,R_=(col,u,v,w,h)=>{x.fillStyle=col;x.fillRect(u,v,w,h)},d1=dk(b0,.7),l1=dk(b0,1.5);
 R_(b0,0,0,48,48);
 if(bg==1){for(let y=0;y<48;y+=4)R_(dk(b0,1.4-y/48*.9),0,y,48,4)}
 else if(bg==2){for(let i=-48;i<48;i+=8)for(let y=0;y<48;y++)R_(d1,i+y,y,4,1)}
 else if(bg==3){for(let y=0;y<48;y+=6)for(let u=0;u<48;u+=6)if((y+u)/6%2==0)R_(d1,u,y,6,6)}
 else if(bg==4){for(let y=2;y<48;y+=6)for(let u=2;u<48;u+=6)R_(l1,u,y,2,2)}
 else if(bg==5){for(let i=0;i<48;i+=6){R_(d1,i,0,1,48);R_(d1,0,i,48,1)}}
 else if(bg==6){for(let q=0;q<24;q+=2){const an=q/24*Math.PI*2;for(let r=3;r<36;r++)R_(d1,24+Math.cos(an)*r|0,24+Math.sin(an)*r|0,2,2)}}
 else if(bg==7){R_(l1,0,0,48,28);for(let u=0;u<48;u+=4)R_(d1,u,28,2,20);R_(f,0,28,48,1)}
 else if(bg==8){for(let y=0;y<48;y++)R_(d1,0,y,y+1,1)}
 else if(bg==9){for(let v=0;v<48;v++)for(let u=0;u<48;u++)if(Math.floor(Math.hypot(u-24,v-24)/4)%2)R_(d1,u,v,1,1)}
 else if(bg==10){for(let y=0;y<48;y+=8)for(let u=0;u<48;u++)R_(d1,u,y+Math.abs((u%8)-4),1,2)}
 else if(bg==11){for(let i=0;i<14;i++){const u=(i*17+5)%44+2,v=(i*29+7)%44+2;R_(l1,u,v-1,1,3);R_(l1,u-1,v,3,1)}}
 else if(bg==12){for(let i=0;i<48;i+=12){R_(d1,i,0,6,48);R_(d1,0,i,48,6);R_(l1,i+8,0,1,48);R_(l1,0,i+8,48,1)}}
 else if(bg==13){for(let y=4;y<48;y+=6)for(let u=0;u<48;u++)R_(d1,u,y+Math.round(Math.sin(u/3)*2),1,2)}
 else if(bg==14){for(let v=0;v<48;v+=2)for(let u=0;u<48;u+=2){const d=Math.hypot(u-24,v-18);if(d<26)R_(dk(b0,1+(26-d)/26*.9),u,v,2,2)}}
 else if(bg==15){for(let ty=0;ty<6;ty++)for(let tx=0;tx<6;tx++)if((tx+ty)%2==0)for(let k=0;k<8;k++)R_(d1,tx*8+4-((k/2)|0),ty*8+k,1+((k/2)|0)*2,1)}
 else if(bg==16){for(let j=0;j<8;j++){const y=j*6;R_(d1,0,y,48,1);for(let u=(j%2)*6;u<48;u+=12)R_(d1,u,y,1,6)}}
 else if(bg==17){for(let v=1;v<48;v+=4)for(let u=1;u<48;u+=4){const z=1+((v/16)|0);R_(l1,u,v,z,z)}}
 else if(bg==18){for(let v=0;v<48;v+=2)for(let u=0;u<48;u+=2){const d=Math.hypot(u-24,v-24);R_(dk(b0,.55+Math.max(0,1-d/34)*.95),u,v,2,2)}}
 else if(bg==19){for(let i=0;i<34;i++)R_([f,l1,d1][i%3],(i*29)%46,(i*13+i*i)%46,2,2)}
 const spr=(i,u0,v0,sc,col)=>{(i>=30?CSPR2[i-30]:CSPR[i-6]).forEach((row,r)=>{for(let q=0;q<row.length;q++)if(row[q]=='#')R_(col,u0+q*sc,v0+r*sc,sc,sc)})};
 if(!a.face&&sy<6){x.save();x.scale(2,2);x.fillStyle=f;if(sy==0){for(let y=0;y<24;y++)for(let X=0;X<24;X++)if((X-12)**2+(y-12)**2<64)x.fillRect(X,y,1,1)}else if(sy==1){for(let y=4;y<20;y++)x.fillRect(12-((y-4)>>1),y,y-3,1)}else if(sy==2){for(let y=0;y<16;y++){const m=Math.min(y,15-y);x.fillRect(12-m,4+y,2*m+1,1)}}else if(sy==3){for(let y=2;y<24;y+=4)x.fillRect(0,y,24,2)}else if(sy==4){x.fillRect(10,2,4,20);x.fillRect(2,10,20,4)}else{for(let X=0;X<24;X++)x.fillRect(X,12+Math.round(Math.sin(X/2)*4),1,3)}x.restore()}
 else if((sy>=6&&sy<29)||(sy>=30&&CSPR2[sy-30])){if(a.face){x.globalAlpha=.4;spr(sy,2,2,4,f);x.globalAlpha=1}else{spr(sy,8,8,3,d1);spr(sy,7,7,3,f)}}
 if(a.face){x.save();x.scale(5,5);const cfg=Object.assign({},a.cfg||ch);fig(x,cfg,-1.2,1.3);x.restore()}
 const br=a.brd||0;if(br==1){R_(f,1,1,46,1);R_(f,1,46,46,1);R_(f,1,1,1,46);R_(f,46,1,1,46)}else if(br==2){R_(f,0,0,48,3);R_(f,0,45,48,3);R_(f,0,0,3,48);R_(f,45,0,3,48)}else if(br==3){R_(f,1,1,46,1);R_(f,1,46,46,1);R_(f,1,1,1,46);R_(f,46,1,1,46);R_(f,4,4,40,1);R_(f,4,43,40,1);R_(f,4,4,1,40);R_(f,43,4,1,40)}else if(br==4){R_('#f4f4f4',0,0,48,4);R_('#f4f4f4',0,0,4,48);R_('#f4f4f4',44,0,4,48);R_('#f4f4f4',0,40,48,8)}
 else if(br==5){R_('#111',0,0,48,3);R_('#111',0,45,48,3);R_('#111',0,0,3,48);R_('#111',45,0,3,48)}else if(br==6){R_('#111',0,0,48,6);R_('#111',0,42,48,6);for(let q=1;q<48;q+=4){R_('#f4f4f4',q,2,2,2);R_('#f4f4f4',q,44,2,2)}}
 else if(br==7){R_('#e6b422',0,0,48,2);R_('#e6b422',0,46,48,2);R_('#e6b422',0,0,2,48);R_('#e6b422',46,0,2,48);R_('#fff3b0',2,2,44,1);R_('#8a6a10',3,3,42,1);R_('#8a6a10',3,44,42,1);R_('#8a6a10',3,3,1,42);R_('#8a6a10',44,3,1,42)}
 else if(br==8){for(let q=1;q<48;q+=4){R_(f,q,1,2,2);R_(f,q,45,2,2);R_(f,1,q,2,2);R_(f,45,q,2,2)}}
 else if(br==9){for(const[a,b]of[[1,1],[39,1],[1,39],[39,39]]){R_(f,a,b<20?b:b+7,9,2);R_(f,a<20?a:a+7,b,2,9)}}
 else if(br==10){for(let y=0;y<6;y++){R_('#000',0,y,6-y,1);R_('#000',48-(6-y),y,6-y,1);R_('#000',0,47-y,6-y,1);R_('#000',48-(6-y),47-y,6-y,1)}R_(f,6,0,36,1);R_(f,6,47,36,1);R_(f,0,6,1,36);R_(f,47,6,1,36)}
 else if(br==11){R_('#f4f4f4',0,0,48,5);R_('#f4f4f4',0,43,48,5);R_('#f4f4f4',0,0,5,48);R_('#f4f4f4',43,0,5,48)}
 else if(br==12){for(let i=0;i<48;i+=4){const c1=(i/4)%2?f:'#111',c2=(i/4)%2?'#111':f;R_(c1,i,0,4,4);R_(c2,i,44,4,4);R_(c2,0,i,4,4);R_(c1,44,i,4,4)}}
 else if(br==13){R_('#fff',1,1,46,1);R_('#fff',1,46,46,1);R_('#fff',1,1,1,46);R_('#fff',46,1,1,46);R_(f,2,2,44,2);R_(f,2,44,44,2);R_(f,2,2,2,44);R_(f,44,2,2,44);R_('#fff',4,4,40,1);R_('#fff',4,43,40,1);R_('#fff',4,4,1,40);R_('#fff',43,4,1,40)}
 R_('rgba(255,255,255,.08)',0,0,48,14);R_('rgba(0,0,0,.12)',0,40,48,8);
 return COVC[key]=k.toDataURL()}
function mkAlbum(){if(AL.name.trim().length<2)return say('Name your album first.');if(AL.sel.length<2)return say('Pick at least 2 released songs.');S.albums.push({id:S.nid++,name:AL.name.trim(),pal:AL.pal,sym:AL.sym,bg:AL.bg,brd:AL.brd,face:AL.face,cfg:{...ch},songs:[...AL.sel],day:S.day});S.interest=Math.min(1,(S.interest||0)+.2);AL.name='';AL.sel=[];snd('chime');say('Album released!');pg='home';pcR()}
PG.albums=()=>{const used=S.albums.flatMap(a=>a.songs),av=S.songs.filter(x=>!used.includes(x.id)),B_=(arr,key)=>arr.map((n,i)=>`<button class="${AL[key]==i?'go':''}" onclick="AL.${key}=${i};pcR()">${n}</button>`).join('');return`<h1>Create album</h1><div class=ng><input placeholder="Album name" maxlength=32 value="${esc(AL.name)}" oninput="AL.name=this.value"></div><h3>Cover art</h3><div style="display:flex;gap:18px;flex-wrap:wrap"><img class=cov src="${cover(AL)}" style="width:192px;height:192px;image-rendering:pixelated"><div style="flex:1;min-width:260px"><b>Colours</b><div>${PALS.map((c,i)=>`<i class="asw ${AL.pal==i?'on':''}" style="background:linear-gradient(135deg,${c[0]} 50%,${c[1]} 50%)" onclick="AL.pal=${i};pcR()"></i>`).join('')}</div><b>Background</b><div>${B_(['Solid','Fade','Stripes','Checker','Dots','Grid','Burst','Horizon','Diagonal','Rings','Zigzag','Stars','Plaid','Waves','Spotlight','Triangles','Bricks','Halftone','Glow','Confetti'],'bg')}</div><b>Border</b><div>${B_(['None','Thin','Thick','Double','Polaroid','Black','Film strip','Gold','Dashed','Corners','Rounded','White frame','Checker','Neon'],'brd')}</div><label style="display:block;margin-top:8px"><input type=checkbox ${AL.face?'checked':''} onchange="AL.face=this.checked?1:0;pcR()"> Put my face on the cover (pick a symbol too: it goes behind you)</label></div></div><b>Symbol or object</b><div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 12px">${SYMN.map((n,i)=>`<img title="${n}" src="${cover({pal:AL.pal,sym:i,bg:0,brd:0,face:0})}" style="width:44px;height:44px;image-rendering:pixelated;cursor:pointer;border:3px solid ${AL.sym==i?'var(--g)':'#000'}" onclick="AL.sym=${i};pcR()">`).join('')}</div><h3>Choose songs</h3>${av.map(x=>`<div class=ng><label><input type=checkbox ${AL.sel.includes(x.id)?'checked':''} onchange="alTog(${x.id})"> ${esc(x.title)} ${x.ft?'<small class=m>feat. '+esc(x.ft)+'</small>':''}</label></div>`).join('')||'<p class=m>No unused released songs. Upload more first.</p>'}<h3>Track order</h3>${AL.sel.map((id,i)=>{const x=S.songs.find(q=>q.id==id);return`<div class=ng><span style="flex:1">${i+1}. ${esc(x.title)}</span><button onclick="alMv(${i},-1)">Up</button><button onclick="alMv(${i},1)">Down</button></div>`}).join('')||'<p class=m>None picked.</p>'}<button class=go onclick="mkAlbum()">Release album</button>`};
{const st=document.createElement('style');st.textContent='.asw{display:inline-block;width:24px;height:24px;border:2px solid #000;margin:2px;cursor:pointer;vertical-align:middle}.asw.on{outline:3px solid var(--g)}';document.head.appendChild(st)}

