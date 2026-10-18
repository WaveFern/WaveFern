/* v44.4.1: closing the browser window stops music that was started from a website in it */
(()=>{
let fromWeb=0,wasOpen=0;
const s0=sfStart;
sfStart=function(){fromWeb=(typeof app!='undefined'&&app=='web')?1:0;return s0.apply(this,arguments)};
const p0=pcR;
pcR=function(){
 const open=!!(typeof OA!='undefined'&&OA&&OA.includes('web'));
 if(wasOpen&&!open&&fromWeb){try{const c=Beats.current();if(c&&c.owner=='sf')Beats.stop(.3)}catch(e){}fromWeb=0}
 wasOpen=open;
 return p0.apply(this,arguments)};
})();
