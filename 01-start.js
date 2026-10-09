
const $=id=>document.getElementById(id),R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),pick=a=>a[RI(0,a.length-1)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PX=3,renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:false}),scene=new THREE.Scene();scene.background=new THREE.Color(0x10161a);
const cam=new THREE.OrthographicCamera(-1,1,1,-1,-20,90);let viewH=9,viewT=9,camT={x:4,z:4};
const amb=new THREE.AmbientLight(0xfff2e0,.75),sun=new THREE.DirectionalLight(0xfff2e0,.8);sun.position.set(6,12,9);scene.add(amb,sun);
const MC={},MBC={},GC={};
const M=c=>MC[c]||(MC[c]=new THREE.MeshLambertMaterial({color:c})),MB=c=>MBC[c]||(MBC[c]=new THREE.MeshBasicMaterial({color:/^[0-9a-f]{6}$/i.test(c)?'#'+c:c}));
const geo=(w,h,d)=>GC[[w,h,d]]||(GC[[w,h,d]]=new THREE.BoxGeometry(w,h,d));
let BN=0,SBN=0;function B(g,w,h,d,c,x,y,z){const m=new THREE.Mesh(geo(w,h,d),c[0]=='*'?MB(c.slice(1)):M(c));m.position.set(x,y,z);BN++;m.scale.set(1+(BN*7919%8)*.0004+.0002,1+(BN*104729%8)*.0004+.0002,1+(BN*1299709%8)*.0004+.0002);g.add(m);return m}
const dk=(c,f)=>'#'+new THREE.Color(c).multiplyScalar(f).getHexString();
function tex(a,b,w,d){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.fillStyle=a;x.fillRect(0,0,16,16);x.fillStyle=b;for(let i=0;i<16;i+=4)x.fillRect(0,i,16,1);for(let i=0;i<12;i++)x.fillRect(RI(0,15),RI(0,15),2,1);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/1.5,d/1.5);return new THREE.MeshLambertMaterial({map:t})}
function resize(){renderer.setSize(Math.ceil(innerWidth/PX),Math.ceil(innerHeight/PX),false)}addEventListener('resize',resize);resize();

