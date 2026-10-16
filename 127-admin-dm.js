/* ---------- admin accounts (isAdmin() from 88-admin.js) can start a chat with any artist in the game ----------
   The suggested-people list only shows artists the player's monthly listeners have reached; for an admin it lists everyone.
   Done by lifting the listener count only while Messages draws, so nothing else in the save changes. */
{const pm=PA.msg;PA.msg=function(){if(typeof isAdmin!='function'||!isAdmin()||!S)return pm.apply(this,arguments);
 const L=S.listeners;S.listeners=Number.MAX_SAFE_INTEGER;try{return pm.apply(this,arguments)}finally{S.listeners=L}}}
