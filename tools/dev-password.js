/* Sets (or changes) the password for the private dev test page (/dev/).
   Usage:   DEV_PASSWORD='something long and unique' node tools/dev-password.js
            node tools/dev-password.js --random        (makes a strong one and prints it once)
   It writes only a salted PBKDF2 hash to dev/gate-data.json. The password itself is never stored.
   Commit dev/gate-data.json to publish the change. Anyone with the OLD password stops working at once. */
const crypto=require('crypto'),fs=require('fs'),path=require('path');
const ITER=600000;
let pw=process.env.DEV_PASSWORD||'';
if(process.argv.includes('--random')){
 const A='abcdefghjkmnpqrstuvwxyz23456789';let s='';
 for(const b of crypto.randomBytes(20))s+=A[b%A.length];
 pw=s.slice(0,5)+'-'+s.slice(5,10)+'-'+s.slice(10,15)+'-'+s.slice(15,20);
 console.log('New dev password (shown once, not saved anywhere):\n  '+pw);
}
if(pw.length<14){console.error('Password must be at least 14 characters. Use --random if unsure.');process.exit(1)}
const salt=crypto.randomBytes(16);
const hash=crypto.pbkdf2Sync(pw,salt,ITER,32,'sha256');
fs.writeFileSync(path.join(__dirname,'..','dev','gate-data.json'),JSON.stringify({iter:ITER,salt:salt.toString('hex'),hash:hash.toString('hex')},null,1)+'\n');
console.log('Wrote dev/gate-data.json. Commit it to change the password.');
