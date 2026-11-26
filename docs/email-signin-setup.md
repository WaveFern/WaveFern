# Email sign-in: setup (v2.xxx, held, /dev only)

Email + password sign-in next to Google. Emails (confirm address, reset password) are sent by a Cloud Function through Resend. Nothing here is live for players: `FB_EMAIL` in `86-google-signin.js` is `!!window.FW_DEV`, so only `/dev/?devauth=1` shows it.

## What only James can do (in order)
1. **Resend: verify the domain `wavefern.com`.** Resend > Domains > Add `wavefern.com`, add the DNS records it shows at your domain provider (keep your existing records), wait for "Verified".
2. **Resend: create an API key** (Sending access, that domain only). Keep it private; do not paste it in chat or the repo.
3. **Firebase: Blaze plan.** Cloud Functions need it (the free Spark plan cannot deploy them). Set a billing budget alert. Expected cost for this game: about zero.
4. **Firebase > Authentication > Sign-in method:** enable **Email/Password** (leave "Email link" off). Under Settings > User account linking keep **"Link accounts that use the same email"** (the default) so Google + email on one address = one account.
5. **Publish the rules:** `firebase-rules/v56.0.4/firestore.rules` and `database.rules.json` in the Firebase console (Firestore > Rules, Realtime Database > Rules). Safe to publish before anything else: Google players are unaffected.
6. **Deploy the function** from a computer with the Firebase CLI (`npm i -g firebase-tools`, `firebase login`), in the repo root:
   - `cd functions && npm install && cd ..`
   - `firebase functions:secrets:set RESEND_API_KEY --project waveferndata` (paste the key when asked)
   - `firebase deploy --only functions --project waveferndata` (it asks for `MAIL_FROM`; default `WaveFern <no-reply@wavefern.com>`)
7. **App Check:** in Firebase > App Check, make sure the web app is registered with reCAPTCHA Enterprise (already used by the game) and add a debug token only if you test from `localhost`.
8. **Test on `/dev/?devauth=1`:** create an account, get the email, confirm, sign in; try Forgot password; try a Google account with the same address.
9. Tell Claude to merge, and on release day to open it for everyone (set `FB_EMAIL=true`, add the privacy-policy paragraph about email accounts and Resend, add a What's new line).

## How it works
- Sign-up: `createUserWithEmailAndPassword`, then the callable `fwSendVerify` (Admin SDK makes the link, rewritten to `wavefern.com/account/`, sent with Resend). Until the link is opened the account is held out of the game (`FBP`, not `FBU`) and the rules refuse it (`acct()` needs `email_verified`).
- Reset: callable `fwSendReset` (always answers "ok", so it never reveals whether an address has an account). A Google-only player can use it to add a password.
- Same address with Google and email: Firebase merges them into one uid, so one profile and one cloud save.
- Google players and admins are untouched: `admin()` is still Google-only.

## Abuse limits (all in `functions/index.js`)
App Check required; one confirm email per account per minute (5/day); one reset per address per minute (5/day); 30 mails per IP per hour; a global daily cap (`MAIL_DAILY_CAP`, default 90 because Resend free is 100/day). Unconfirmed accounts can write nothing, so fake sign-ups cost nothing but a row in Authentication. Not done: blocking disposable domains, and a Firebase Auth sign-up quota per IP (needs Identity Platform). Delete stale unconfirmed users now and then in Authentication.
