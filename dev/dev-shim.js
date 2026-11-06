/* WaveFern dev slot shim. Runs before any game file, only on /dev/.
   1. Every localStorage key is stored as "dev:<key>", so test saves can never touch a real save.
   2. Network calls to the cloud (Firebase sign-in, cloud saves, rooms, analytics) are refused,
      so nothing from this page can write to real accounts or the live database.
   Local-only: Friends and band rooms need the cloud, so they cannot be played from here. */
(function(){
 window.FW_DEV=1;window.FW_DEV_BUILD='dev-2026.11.06.04-advent-simple-spin';
 const P='dev:',real=window.localStorage;
 const own=()=>{const a=[];for(let i=0;i<real.length;i++){const k=real.key(i);if(k.indexOf(P)===0)a.push(k.slice(P.length))}return a};
 const api={
  getItem:k=>real.getItem(P+k),
  setItem:(k,v)=>real.setItem(P+k,String(v)),
  removeItem:k=>real.removeItem(P+k),
  clear:()=>own().forEach(k=>real.removeItem(P+k)),
  key:i=>own()[i]===undefined?null:own()[i]
 };
 const ls=new Proxy(api,{
  get:(t,k)=>k==='length'?own().length:(k in t?t[k]:(typeof k==='string'?real.getItem(P+k):undefined)),
  set:(t,k,v)=>{real.setItem(P+k,String(v));return true},
  deleteProperty:(t,k)=>{real.removeItem(P+k);return true},
  has:(t,k)=>k in t||real.getItem(P+k)!==null,
  ownKeys:()=>own(),
  getOwnPropertyDescriptor:(t,k)=>real.getItem(P+k)===null?undefined:{value:real.getItem(P+k),enumerable:true,configurable:true,writable:true}
 });
 Object.defineProperty(window,'localStorage',{value:ls,configurable:true});
 window.FW_DEV_PREFIX=P;window.FW_DEV_REAL=real;
 /* skip the one-time hop to the old-address save importer */
 api.setItem('fw_moved','1');
 /* no cloud from here */
 const BAD=/(firestore|identitytoolkit|securetoken|firebaseinstallations|firebaseio|firebase\.googleapis|google-analytics|googletagmanager|analytics\.google)/i;
 const bad=u=>BAD.test(String(u&&u.url||u));
 const f=window.fetch;window.fetch=function(u,o){if(bad(u))return Promise.reject(new TypeError('Blocked in dev slot'));return f.apply(this,arguments)};
 const xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(bad(u))throw new Error('Blocked in dev slot');return xo.apply(this,arguments)};
 const WS=window.WebSocket;window.WebSocket=function(u,p){if(bad(u))throw new Error('Blocked in dev slot');return p===undefined?new WS(u):new WS(u,p)};
 window.WebSocket.prototype=WS.prototype;['CONNECTING','OPEN','CLOSING','CLOSED'].forEach(k=>window.WebSocket[k]=WS[k]);
 if(navigator.sendBeacon){const sb=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(u,d){return bad(u)?false:sb(u,d)}}
})();
