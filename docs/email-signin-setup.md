# Email sign-in: setup (held, /dev only)

Email + password sign-in next to Google. No Firebase Blaze plan: a free Cloudflare Worker (`worker/`) holds the Resend key, makes the confirm/reset links with the Firebase Auth REST API and sends WaveFern-styled mail through Resend. Nothing is live for players: `FB_EMAIL` in `86-google-signin.js` is `!!window.FW_DEV`, so only `/dev/?devauth=1` shows it.

## What only James can do (in order)
1. **Resend:** Domains > Add `wavefern.com`, add the DNS records it shows, wait for "Verified". Create an API key (sending access, that domain only). Keep it private.
2. **Firebase console (project waveferndata):** Authentication > Sign-in method > enable **Email/Password** (Email link off). Keep "Link accounts that use the same email" on (default).
3. **Firebase/Google Cloud: a service account for the Worker.** Google Cloud console > IAM > Service accounts > Create, name `wavefern-mail`, give it **only** the role *Firebase Authentication Admin*. Keys tab > Add key > JSON. Keep the file private; never put it in the repo or chat.
4. **Publish the rules:** `firebase-rules/v56.0.4/firestore.rules` and `database.rules.json`. Safe to do first: Google players are unaffected.
5. **Cloudflare (free account):** on a computer, in the repo's `worker/` folder:
   - `npx wrangler login`
   - `npx wrangler kv namespace create RL`, paste the printed id into `wrangler.toml`
   - `npx wrangler secret put RESEND_API_KEY` (paste the key)
   - `npx wrangler secret put SA_JSON` (paste the whole service-account JSON)
   - `npx wrangler deploy`, copy the `https://wavefern-mail.<you>.workers.dev` address
6. Tell Claude that address; Claude sets `FB_MAIL_URL` in `86-google-signin.js`.
7. **Test on `/dev/?devauth=1`:** create an account, get the email, confirm, sign in; Forgot password; a Google account with the same address.
8. Tell Claude to merge. On release day Claude sets `FB_EMAIL=true`, adds the privacy-policy paragraph about email accounts and Resend, and a What's new line.

## How it works
- Sign-up: `createUserWithEmailAndPassword`, then the browser sends its Firebase ID token to the Worker `/verify`. The Worker checks the token's signature against Google's keys, makes the link, sends the mail. Until the link is opened the account is held out of the game (`FBP`, not `FBU`) and the rules refuse it (`acct()` needs `email_verified`).
- Reset: Worker `/reset {email}`. Always answers `{ok:true}`, so it never shows whether an address has an account. A Google-only player can use it to add a password.
- Same address with Google and email: Firebase merges them into one uid.
- Google players and admins are untouched: `admin()` is Google-only.

## Abuse limits (in `worker/index.js`)
Only `https://wavefern.com` pages may call it (CORS); confirm: 1/min and 5/day per account; reset: 1/min and 5/day per address; 30 mails/hour per IP; global daily cap 90 (Resend free = 100/day; raise `DAILY_CAP` after upgrading). Unconfirmed accounts can write nothing. Not done: App Check check inside the Worker, disposable-domain blocking. Delete stale unconfirmed users now and then in Authentication. Cloudflare free: 100k requests/day, KV 1000 writes/day (about 300 mails/day).
Offline test: `node worker/test.mjs`.
