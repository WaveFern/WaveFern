/* WaveFern dev: trees in foreign cities are normal green. Only loaded on /dev/.
   The destination cities passed one colour string where the tree builder expects a 3-shade palette, so the leaves came out brown/black.
   Trees now always use the normal green palettes (and the lighter shades), whatever colour the city asked for. */
(function(){if(!window.FW_FEAT)return;
 const go=()=>{if(typeof blkTree!='function'||blkTree.__green)return;const o=blkTree;
  const f=function(box,x,z,s,seed,col){return o(box,x,z,s,seed,Array.isArray(col)?col:undefined)};f.__green=1;blkTree=f};
 try{go()}catch(e){console.warn('green trees',e)}})();
