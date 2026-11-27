/* WaveFern mail Worker (v56.0.4). Free Cloudflare Worker, no Firebase Blaze plan needed.
   POST /verify  (Authorization: Bearer <Firebase ID token>)  -> sends the "confirm your email" mail to that signed-in player.
   POST /reset   {email}                                       -> sends a password-reset mail if the address has an account; always answers {ok:true}.
   Secrets (wrangler secret put): RESEND_API_KEY, SA_JSON (service account JSON with ONLY the role "Firebase Authentication Admin").
   Vars (wrangler.toml): PROJECT_ID, MAIL_FROM, SITE, DAILY_CAP. KV binding RL = rate-limit counters.
   Nothing secret is ever sent to the browser. Only https://wavefern.com may call it from a page (CORS). */
import { verifyEmail, resetEmail } from './mail.js';

const JWK_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const enc = s => new TextEncoder().encode(s);
const json = (o, status, h) => new Response(JSON.stringify(o), { status: status || 200, headers: { 'Content-Type': 'application/json', ...(h || {}) } });

async function sha(s) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc(String(s))))].slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join(''); }

/* ---- Firebase ID token check (RS256 against Google's public keys) ---- */
let jwkCache = { t: 0, keys: [] };
async function jwks(fetchFn) {
  if (Date.now() - jwkCache.t < 3600000 && jwkCache.keys.length) return jwkCache.keys;
  const r = await fetchFn(JWK_URL); if (!r.ok) throw new Error('jwks');
  jwkCache = { t: Date.now(), keys: (await r.json()).keys || [] }; return jwkCache.keys;
}
export async function verifyIdToken(tok, env, fetchFn = fetch) {
  const p = String(tok || '').split('.'); if (p.length !== 3) return null;
  try {
    const head = JSON.parse(new TextDecoder().decode(unb64u(p[0]))), c = JSON.parse(new TextDecoder().decode(unb64u(p[1])));
    if (head.alg !== 'RS256') return null;
    const jwk = (await jwks(fetchFn)).find(k => k.kid === head.kid); if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, unb64u(p[2]), enc(p[0] + '.' + p[1])))) return null;
    const now = Date.now() / 1000;
    if (c.aud !== env.PROJECT_ID || c.iss !== 'https://securetoken.google.com/' + env.PROJECT_ID || !c.sub || c.exp < now || c.iat > now + 300) return null;
    return c;
  } catch (e) { return null; }
}

/* ---- Google OAuth token for the service account, then Firebase Auth REST (makes the link without sending Firebase's own mail) ---- */
let tokCache = { t: 0, v: '' };
async function accessToken(env, fetchFn) {
  if (Date.now() < tokCache.t) return tokCache.v;
  const sa = JSON.parse(env.SA_JSON), now = Math.floor(Date.now() / 1000);
  const head = b64u(enc(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const body = b64u(enc(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/identitytoolkit', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const key = await crypto.subtle.importKey('pkcs8', unb64u(pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = b64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc(head + '.' + body)));
  const r = await fetchFn('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + head + '.' + body + '.' + sig });
  if (!r.ok) throw new Error('oauth');
  const j = await r.json(); tokCache = { t: Date.now() + (j.expires_in - 120) * 1000, v: j.access_token }; return j.access_token;
}
async function makeLink(type, email, env, fetchFn) {
  const r = await fetchFn(`https://identitytoolkit.googleapis.com/v1/projects/${env.PROJECT_ID}/accounts:sendOobCode`, { method: 'POST',
    headers: { Authorization: 'Bearer ' + await accessToken(env, fetchFn), 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType: type, email, returnOobLink: true }) });
  if (!r.ok) { const t = await r.text(); const e = new Error(/EMAIL_NOT_FOUND/.test(t) ? 'nouser' : 'link'); throw e; }
  const code = (await r.json()).oobCode; if (!code) throw new Error('link');
  return `${env.SITE}/account/?mode=${type === 'VERIFY_EMAIL' ? 'verifyEmail' : 'resetPassword'}&oobCode=${encodeURIComponent(code)}`;
}

async function send(to, mail, env, fetchFn) {
  const r = await fetchFn('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject: mail.subject, html: mail.html, text: mail.text }) });
  if (!r.ok) throw new Error('resend ' + r.status);
}

/* one use of `key`; false when over `max` inside the window or inside the cooldown (KV is not atomic: good enough for a mail limiter) */
async function allow(env, key, { max, windowMs, cooldownMs = 0 }) {
  const now = Date.now(); let d = null; try { d = JSON.parse(await env.RL.get(key)); } catch (e) {}
  d = d || {}; const fresh = !d.w || now - d.w > windowMs, n = fresh ? 0 : d.n;
  if (n >= max || now - (d.last || 0) < cooldownMs) return false;
  await env.RL.put(key, JSON.stringify({ n: n + 1, w: fresh ? now : d.w, last: now }), { expirationTtl: Math.max(60, Math.ceil(windowMs / 1000)) });
  return true;
}

export async function handle(req, env, fetchFn = fetch) {
  const origin = req.headers.get('Origin') || '', okOrigin = origin === env.SITE;
  const cors = okOrigin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'POST', 'Vary': 'Origin' } : {};
  const url = new URL(req.url);
  if (req.method === 'OPTIONS') return new Response(null, { status: okOrigin ? 204 : 403, headers: cors });
  if (req.method !== 'POST' || !okOrigin) return json({ error: 'no' }, 403, cors);
  const ip = req.headers.get('CF-Connecting-IP') || '', day = new Date().toISOString().slice(0, 10), cap = +env.DAILY_CAP || 90;
  const overall = async () => (await allow(env, 'i-' + await sha(ip), { max: 30, windowMs: 3600000 })) && (await allow(env, 'g-' + day, { max: cap, windowMs: 86400000 }));
  try {
    if (url.pathname === '/verify') {
      const c = await verifyIdToken((req.headers.get('Authorization') || '').replace(/^Bearer /, ''), env, fetchFn);
      if (!c || !c.email) return json({ error: 'sign-in' }, 401, cors);
      if (c.email_verified) return json({ ok: true, done: true }, 200, cors);
      if (!(await allow(env, 'v-' + c.sub, { max: 5, windowMs: 86400000, cooldownMs: 60000 }))) return json({ error: 'wait' }, 429, cors);
      if (!(await overall())) return json({ error: 'busy' }, 429, cors);
      await send(c.email, verifyEmail(await makeLink('VERIFY_EMAIL', c.email, env, fetchFn)), env, fetchFn);
      return json({ ok: true }, 200, cors);
    }
    if (url.pathname === '/reset') {
      const b = await req.json().catch(() => ({})), email = String(b.email || '').trim().toLowerCase();
      if (!/^[^\s@<>"']{1,64}@[^\s@<>"']{1,255}$/.test(email) || email.length > 254) return json({ error: 'email' }, 400, cors);
      /* every outcome after this answers the same, so the reply never shows whether an account exists */
      if (!(await allow(env, 'r-' + await sha(email), { max: 5, windowMs: 86400000, cooldownMs: 60000 }))) return json({ ok: true }, 200, cors);
      if (!(await overall())) return json({ error: 'busy' }, 429, cors);
      try { await send(email, resetEmail(await makeLink('PASSWORD_RESET', email, env, fetchFn)), env, fetchFn); } catch (e) { if (e.message !== 'nouser') console.error('reset', e.message); }
      return json({ ok: true }, 200, cors);
    }
  } catch (e) { console.error(url.pathname, e.message); return json({ error: 'fail' }, 500, cors); }
  return json({ error: 'no' }, 404, cors);
}
export default { fetch: (req, env) => handle(req, env) };
