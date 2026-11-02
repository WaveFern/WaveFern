/* ---------- test clock (v49.72.0) ----------
   Only does anything on the password-protected /dev/ page (dev/dev-shim.js sets window.FW_DEV there). Lets a tester move the game's
   clock to just before or after the fresh start (12-reset.js reads it through rsNow). On the real site FW_CLOCK is plain Date.now. */
(function(){
 const rd=()=>{try{return window.FW_DEV?JSON.parse(sessionStorage.getItem('fw_dev_clock')):null}catch(e){return null}};
 window.FW_CLOCK={now:()=>{const c=rd();return c&&c.f?c.f+(Date.now()-c.at):Date.now()},
  set:f=>{try{if(f)sessionStorage.setItem('fw_dev_clock',JSON.stringify({f,at:Date.now()}));else sessionStorage.removeItem('fw_dev_clock')}catch(e){}}};
})();
