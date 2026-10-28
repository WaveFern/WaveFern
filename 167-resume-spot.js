/* ===== v47.1.0: resume where you left off =====
   While you walk around the open world (not inside a shop or building, not driving, not sitting, not in a tour city) the game keeps
   S.pos = [x, z, facing]. It is saved with the career, so quitting and loading puts you back on the same spot on the map.
   Interiors, tour cities and multiplayer rooms keep their own spawn rules. unstick() still runs, so a spot that is blocked now is fixed.
   (v49.0.3: the one-off move of a glitched player into the Main Stage crowd is gone. It was keyed on a per-save flag, so it kept
   firing on every new or reloaded career and sent that player back to the Main Stage again and again.) */
(()=>{
const openWorld=()=>mode=='play'&&!IN&&!P.sit&&!(window.DCITY&&DCITY.on)&&!(typeof inC=='function'&&inC());
const put=(x,z,r)=>{P.x=x;P.z=z;if(r!=null)P.rot=r;camT.x=x;camT.z=z;if(P.mesh)P.mesh.position.set(x,0,z)};
let acc=0;
{const w0=worldTick;worldTick=function(dt){w0.apply(this,arguments);acc+=dt||0;if(acc<.5)return;acc=0;
 try{if(!openWorld())return;
  if(!hit(P.x,P.z,.28))S.pos=[+P.x.toFixed(2),+P.z.toFixed(2),+(P.rot||0).toFixed(2)]}catch(e){}}}
{const l0=loadCode;loadCode=function(c){l0.apply(this,arguments);
 try{const p=S.pos;if(mode=='play'&&Array.isArray(p)&&isFinite(p[0])&&isFinite(p[1])&&!(S.dcity&&S.dcity.loc)){put(+p[0],+p[1],+p[2]||0);unstick()}}catch(e){}}}
})();
