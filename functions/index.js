/* WaveFern email sign-in Cloud Functions (v56.0.4).
   fwSendVerify: signed-in email/password player asks for their "confirm your email" mail.
   fwSendReset:  anyone asks for a password-reset mail (also how a Google-only player adds a password).
   Links are made with the Admin SDK, rewritten to https://wavefern.com/account/ (our own branded page), and sent through Resend.
   The Resend key is a Firebase secret (RESEND_API_KEY), never in the repo. Both functions require App Check and are rate limited
   through Firestore docs in mailLimits/ (the Admin SDK ignores rules; players have no rule for that collection). */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString, defineInt } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { verifyEmail, resetEmail } = require('./mail');

admin.initializeApp();
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const MAIL_FROM = defineString('MAIL_FROM', { default: 'WaveFern <no-reply@wavefern.com>' });
const DAILY_CAP = defineInt('MAIL_DAILY_CAP', { default: 90 }); // Resend free plan = 100 mails/day; raise this after upgrading
const SITE = 'https://wavefern.com';
const OPTS = { region: 'europe-west1', secrets: [RESEND_API_KEY], enforceAppCheck: true, maxInstances: 5, timeoutSeconds: 30 };

const db = () => admin.firestore();
const sha = s => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 32);
const day = () => new Date().toISOString().slice(0, 10);

/* count one use of `key`; false when over `max` in the window or inside the cooldown. One Firestore transaction, so parallel calls cannot both pass. */
async function allow(key, { max, windowMs, cooldownMs = 0 }) {
  const ref = db().collection('mailLimits').doc(key);
  return db().runTransaction(async tx => {
    const now = Date.now(), d = (await tx.get(ref)).data() || {};
    const fresh = !d.w || now - d.w > windowMs;
    const n = fresh ? 0 : d.n, last = d.last || 0;
    if (n >= max || now - last < cooldownMs) return false;
    tx.set(ref, { n: n + 1, w: fresh ? now : d.w, last: now });
    return true;
  });
}
const globalOk = () => allow('g-' + day(), { max: DAILY_CAP.value(), windowMs: 86400000 });

async function send(to, { subject, html, text }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + RESEND_API_KEY.value(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: MAIL_FROM.value(), to: [to], subject, html, text }),
  });
  if (!r.ok) { console.error('resend failed', r.status, (await r.text()).slice(0, 300)); throw new Error('send'); }
}

/* Firebase's generated link points at its own plain page; keep only the one-time code and open ours instead. */
function ourLink(firebaseLink) {
  const u = new URL(firebaseLink);
  const mode = u.searchParams.get('mode'), code = u.searchParams.get('oobCode');
  if (!/^(verifyEmail|resetPassword)$/.test(mode || '') || !code) throw new Error('link');
  return `${SITE}/account/?mode=${mode}&oobCode=${encodeURIComponent(code)}`;
}

exports.fwSendVerify = onCall(OPTS, async req => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  const uid = req.auth.uid;
  const user = await admin.auth().getUser(uid);
  if (!user.email || user.emailVerified) return { ok: true, done: true };
  if (!(await allow('v-' + uid, { max: 5, windowMs: 86400000, cooldownMs: 60000 }))) throw new HttpsError('resource-exhausted', 'Wait a minute before asking for another email.');
  if (!(await allow('i-' + sha(req.rawRequest.ip), { max: 30, windowMs: 3600000 })) || !(await globalOk())) throw new HttpsError('resource-exhausted', 'Too many emails right now. Try again later.');
  try {
    const link = ourLink(await admin.auth().generateEmailVerificationLink(user.email));
    await send(user.email, verifyEmail(link));
  } catch (e) { console.error('fwSendVerify', e.message); throw new HttpsError('internal', 'Could not send the email. Try again.'); }
  return { ok: true };
});

exports.fwSendReset = onCall(OPTS, async req => {
  const email = String((req.data && req.data.email) || '').trim().toLowerCase();
  if (!/^[^\s@<>"']{1,64}@[^\s@<>"']{1,255}$/.test(email) || email.length > 254) throw new HttpsError('invalid-argument', 'Check the email address.');
  /* every outcome below returns the same { ok: true }, so the reply never reveals whether an account exists */
  if (!(await allow('r-' + sha(email), { max: 5, windowMs: 86400000, cooldownMs: 60000 }))) return { ok: true };
  if (!(await allow('i-' + sha(req.rawRequest.ip), { max: 30, windowMs: 3600000 })) || !(await globalOk())) throw new HttpsError('resource-exhausted', 'Too many emails right now. Try again later.');
  try {
    let user = null;
    try { user = await admin.auth().getUserByEmail(email); } catch (e) { if (e.code !== 'auth/user-not-found') throw e; }
    if (user) await send(email, resetEmail(ourLink(await admin.auth().generatePasswordResetLink(email))));
  } catch (e) { console.error('fwSendReset', e.message); }
  return { ok: true };
});
