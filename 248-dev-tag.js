/* ---------- WaveFern dev badge (v55.20.0) ----------
   Two accounts are WaveFern developers. They get a gold DEV tag on the leaderboard and on public profiles. It replaces the Founder tag.
   A dev friend request is shown to the recipient as "A WaveFern dev wants to be your friend" with a gold card (216-friends-hub, 161-multiplayer).
   Tamper-proof: the tag is decided only by the account's Firebase UID, a fixed list in this file. The UID comes from the Firestore document id
   (leaderboard/{uid}, profiles/{uid}) or the Realtime Database key (f/q/{to}/{from}); the rules only let an account write its own, so nobody else
   can carry a dev UID. No profile or leaderboard field is read, so there is nothing a player can write to claim DEV. No rules change is needed.
   Globals: fwIsDev(uid) -> bool, fwDevTag() -> HTML for the small gold tag. */
(function(){
 const DEVS=Object.freeze({P6BuoHkZCjgnDFS9pL05KEeSQ4n2:1,zqzQC5RlT4MW4QDQXBIXyvrIq9z1:1});
 window.fwIsDev=uid=>typeof uid=='string'&&Object.prototype.hasOwnProperty.call(DEVS,uid);
 window.fwDevTag=()=>'<span class=fwdevtag title="WaveFern developer">DEV</span>';
 const c=document.createElement('style');c.id='fwdevcss';
 c.textContent=`.fwdevtag{display:inline-block;margin-left:5px;padding:1px 5px;background:#ffd84a;color:#1a1200;border:2px solid #000;box-shadow:0 0 8px #ffd84acc;font:10px/12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;vertical-align:middle}
@keyframes fwdevGlow{0%,100%{box-shadow:0 0 0 2px #000,0 0 10px #ffd84a66}50%{box-shadow:0 0 0 2px #000,0 0 18px #ffd84acc}}
.fhrow.fhdev,.frr.fhdev{border-color:#ffd84a!important;background:linear-gradient(90deg,#ffd84a22,#0b0f0d 70%);animation:fwdevGlow 2.4s ease-in-out infinite}
.fhdev .fhav{background:#ffd84a;color:#1a1200;border-color:#000}.fhdev small{color:#ffd84a!important}
#pfx .fwpc.dvo{border-color:#ffd84a;box-shadow:0 0 0 2px #000,0 0 0 4px #ffd84a66,0 0 22px #ffd84a88,6px 6px 0 #0008}
#pubpf .pp.dvo{border-color:#ffd84a;box-shadow:0 0 0 2px #000,0 0 0 4px #ffd84a66,0 0 22px #ffd84a88}
#pfx .pf-tag.dev{background:#ffd84a;border-color:#ffd84a;color:#1a1200}
#pubpf .pg .dv{background:#ffd84a;color:#1a1200;border:1px solid #ffd84a}`;
 (document.head||document.documentElement).appendChild(c);
})();
