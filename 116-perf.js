/* ===== v26.140: FPS. The 3D engine re-computes the matrix of every object in the scene each frame, even the ~15,000 inside hidden
   groups (shop interiors, far parts of the world, the tower floors). Hidden groups are now skipped, and refreshed in full
   the first frame they are shown again. Nothing about the scene or saves changes. ===== */
(()=>{const P=THREE.Object3D.prototype,u0=P.updateMatrixWorld;
 P.updateMatrixWorld=function(force){
  if(this.visible===false&&this._mwd&&this.parent){this._stale=1;return}
  if(this._stale){this._stale=0;force=true}
  this._mwd=1;return u0.call(this,force)}})();
