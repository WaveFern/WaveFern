/* v55.31.0: save worker. Packing + sealing a big save is ~100-250 ms of pure CPU; on the main thread that froze the game on every pause,
   cloud sync and autosave. This worker runs the same scPack + seal (imported from 12-save-seal.js, the one implementation) off the main thread.
   The page sends {id, json}; the worker answers {id, code}. Loaded by saveCodeAsync() in 12-save-load.js (?v= = GAME_VERSION). */
const _v=(location.search.match(/[?&]v=([^&]+)/)||[])[1]||'';
importScripts('12-save-seal.js'+(_v?'?v='+_v:''));
onmessage=e=>{const m=e.data;try{postMessage({id:m.id,code:seal(scPack(m.json,SC_C,38))})}catch(x){postMessage({id:m.id,err:String(x&&x.message||x)})}};
