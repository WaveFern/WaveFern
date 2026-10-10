/* ===== v26.19: Messages gets its own look ===== */
/* Plum sidebar, coral-to-violet header, a warm cream chat with bubbles that have tails, and rounded-square avatars with a gradient ring.
   Only the look changes: the wrapper adds a class and a brand bar to the HTML that PA.msg already builds. */
{const st=document.createElement('style');st.textContent=`
.chat.msx{--mx-pl:#1e1537;--mx-pl2:#2b1f4f;--mx-tx:#f3ecff;--mx-mu:#b7a7d8;--mx-cr:#fff7f0;--mx-ink:#2a2140;--mx-hd:linear-gradient(120deg,#ff7a59,#ff3d81 55%,#8a4dff);--mx-me:linear-gradient(135deg,#ff6a88,#8a4dff);--mx-co:#ff4f7b;
 background:var(--mx-cr);color:var(--mx-ink);font:14px "Trebuchet MS","Segoe UI",system-ui,sans-serif}
.msx .cl{background:var(--mx-pl);color:var(--mx-tx);border-right:0;box-shadow:2px 0 10px #1e153744;z-index:1}
.msx .msxb{display:flex;align-items:center;gap:10px;padding:14px 14px 10px;background:var(--mx-hd);color:#fff}
.msx .msxb b{font-size:19px;letter-spacing:.5px}.msx .msxb small{opacity:.85;font-size:11px;display:block}
.msx .msxl{width:30px;height:30px;border-radius:50% 50% 50% 8px;background:#fff;position:relative;flex-shrink:0;box-shadow:0 2px 6px #0003}
.msx .msxl:before,.msx .msxl:after{content:'';position:absolute;top:12px;width:5px;height:5px;border-radius:50%;background:#ff3d81;left:7px;box-shadow:7px 0 0 #b14dff}.msx .msxl:after{left:21px;background:#8a4dff;box-shadow:none}
.msx .cl h2{background:transparent;padding:10px 14px;font:700 12px "Trebuchet MS",system-ui,sans-serif;text-transform:uppercase;letter-spacing:1.5px;color:var(--mx-mu);border-bottom:1px solid #ffffff12}
.msx .cl h2 button{background:#ffffff1a;color:#fff;border:0;border-radius:14px;padding:3px 12px;box-shadow:none;font:700 12px "Trebuchet MS",system-ui,sans-serif;letter-spacing:0;text-transform:none}.msx .cl h2 button:hover{background:var(--mx-co)}
.msx .cr{border-bottom:0;margin:2px 8px;border-radius:12px;padding:9px 10px;align-items:center}
.msx .cr:hover{background:var(--mx-pl2)}.msx .cr.on{background:linear-gradient(90deg,#ff3d8155,#8a4dff33);box-shadow:inset 3px 0 0 var(--mx-co)}
.msx .cr small{color:var(--mx-mu)}
.msx .cr img,.msx .cvh img{border-radius:14px;padding:2px;background:linear-gradient(135deg,#ffb36b,#ff3d81,#8a4dff);box-sizing:border-box}
.msx .cdot{border-color:var(--mx-pl)}.msx .cvh .cdot{border-color:#fff}
.msx .ub{background:var(--mx-co);color:#fff;border-radius:10px;font-weight:700;text-transform:uppercase;font-size:10px;padding:1px 7px}
.msx .cv{background:var(--mx-cr) radial-gradient(#f2d9e6 1px,transparent 1.5px) 0 0/18px 18px}
.msx .cvh{background:#fff;color:var(--mx-ink);border-bottom:1px solid #f1e3ec;box-shadow:0 2px 8px #2a214012}
.msx .cvh small{color:#8f7a9a!important}
.msx .cvb{gap:8px;padding:16px 18px}
.msx .bb{position:relative;padding:8px 13px;line-height:1.4;max-width:68%}
.msx .bb.a{background:#fff;color:var(--mx-ink);border-radius:18px 18px 18px 4px;box-shadow:0 1px 3px #2a21401f}
.msx .bb.me{background:var(--mx-me);color:#fff;border-radius:18px 18px 4px 18px;box-shadow:0 2px 6px #8a4dff33}
.msx .bb.a:before,.msx .bb.me:before{content:'';position:absolute;bottom:0;width:10px;height:10px}
.msx .bb.a:before{left:-5px;background:radial-gradient(circle at 0 0,transparent 9px,#fff 10px)}
.msx .bb.me:before{right:-5px;background:radial-gradient(circle at 100% 0,transparent 9px,#a253f0 10px)}
.msx .bb small{color:#2a214066}.msx .bb.me small{color:#ffffffaa}
.msx .cin{background:#fff;border-top:1px solid #f1e3ec;align-items:center}
.msx .cin input{background:#f7eefb;color:var(--mx-ink);border:2px solid transparent;border-radius:22px}.msx .cin input:focus{outline:0;border-color:#ff3d8166}
.msx .cin button.go{background:var(--mx-me);color:#fff;border:0;border-radius:22px;box-shadow:0 2px 6px #ff3d8144;padding:8px 18px}
.msx .cfm{background:#fff0e6;color:var(--mx-ink);border-top:1px solid #f6d9c8}
.msx .cfm button{border:0;border-radius:18px;box-shadow:none;background:#efe3f2;color:var(--mx-ink)}.msx .cfm button.go{background:var(--mx-me);color:#fff}.msx .cfm button:disabled{opacity:.5}
.msx .cv>div:last-child{background:#fbeee6!important;color:#8f7a9a!important}
.win:has(.chat.msx){border-color:#1e1537;box-shadow:6px 6px 0 #8a4dff55}
.win:has(.chat.msx) .wt{background:linear-gradient(120deg,#ff7a59,#ff3d81 55%,#8a4dff);color:#fff}
.win:has(.chat.msx) .wt button{background:#ffffff33;border-color:#0000;box-shadow:none;color:#fff}`;document.head.appendChild(st)}
{const pm=PA.msg;PA.msg=function(){const h=pm.apply(this,arguments);if(typeof h!='string')return h;
 return h.replace('<div class=chat><div class=cl>','<div class="chat msx"><div class=cl><div class=msxb><span class=msxl></span><span><b>Messages</b><small>Chats with artists</small></span></div>')}}
