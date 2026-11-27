// node worker/test.mjs : offline test of token checks, limits, links and "no account enumeration" with faked Google/Resend servers
import { handle } from './index.js';
import { webcrypto as C } from 'node:crypto';
const ok = (n, c) => { console.log(c ? 'ok   ' : 'FAIL ', n); if (!c) process.exitCode = 1; };
const b64u = b => Buffer.from(b).toString('base64url');
const kp = await C.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...(await C.subtle.exportKey('jwk', kp.publicKey)), kid: 'k1' };
const pk8 = Buffer.from(await C.subtle.exportKey('pkcs8', kp.privateKey)).toString('base64');
const SA = JSON.stringify({ client_email: 'sa@x.iam', private_key: '-----BEGIN PRIVATE KEY-----\n' + pk8 + '\n-----END PRIVATE KEY-----\n' });
async function tok(o = {}, kid = 'k1') {
  const now = Math.floor(Date.now() / 1000), c = { aud: 'waveferndata', iss: 'https://securetoken.google.com/waveferndata', sub: 'u1', iat: now, exp: now + 600, email: 'a@b.co', email_verified: false, ...o };
  const h = b64u(JSON.stringify({ alg: 'RS256', kid })), p = b64u(JSON.stringify(c));
  return h + '.' + p + '.' + b64u(await C.subtle.sign('RSASSA-PKCS1-v1_5', kp.privateKey, new TextEncoder().encode(h + '.' + p)));
}
const kv = new Map(); const sent = []; let known = true;
const env = { PROJECT_ID: 'waveferndata', SITE: 'https://wavefern.com', MAIL_FROM: 'W <n@wavefern.com>', DAILY_CAP: '90', RESEND_API_KEY: 'rk', SA_JSON: SA,
  RL: { get: async k => kv.get(k) || null, put: async (k, v) => { kv.set(k, v); } } };
const fake = async (u, o) => {
  u = String(u);
  if (u.includes('jwk')) return new Response(JSON.stringify({ keys: [jwk] }));
  if (u.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'at', expires_in: 3600 }));
  if (u.includes('sendOobCode')) return known ? new Response(JSON.stringify({ oobCode: 'CODE/1' })) : new Response('{"error":{"message":"EMAIL_NOT_FOUND"}}', { status: 400 });
  if (u.includes('resend')) { sent.push(JSON.parse(o.body)); return new Response('{}'); }
  return new Response('?', { status: 500 });
};
const rq = (path, body, h = {}) => new Request('https://w.test' + path, { method: 'POST', headers: { Origin: 'https://wavefern.com', 'Content-Type': 'application/json', ...h }, body: JSON.stringify(body || {}) });
let r = await handle(rq('/verify', {}, { Authorization: 'Bearer ' + await tok() }), env, fake);
ok('verify sends mail', r.status === 200 && sent.length === 1 && sent[0].to[0] === 'a@b.co' && sent[0].html.includes('mode=verifyEmail&amp;oobCode=CODE%2F1') || sent[0]?.html.includes('oobCode=CODE%2F1'));
r = await handle(rq('/verify', {}, { Authorization: 'Bearer ' + await tok() }), env, fake); ok('second verify inside a minute refused (429)', r.status === 429 && sent.length === 1);
r = await handle(rq('/verify', {}, { Authorization: 'Bearer ' + (await tok({ sub: 'u2' })).slice(0, -4) + 'AAAA' }), env, fake); ok('bad signature refused (401)', r.status === 401);
r = await handle(rq('/verify', {}, { Authorization: 'Bearer ' + await tok({ sub: 'u3', aud: 'other' }) }), env, fake); ok('wrong project refused', r.status === 401);
r = await handle(rq('/verify', {}, { Authorization: 'Bearer ' + await tok({ sub: 'u4', exp: 1 }) }), env, fake); ok('expired refused', r.status === 401);
r = await handle(rq('/verify', {}, { Authorization: 'Bearer ' + await tok({ sub: 'u5', email_verified: true }) }), env, fake); ok('already verified: no mail', (await r.json()).done === true && sent.length === 1);
r = await handle(rq('/verify', {}), env, fake); ok('no token refused', r.status === 401);
r = await handle(rq('/reset', { email: 'x@y.co' }), env, fake); const a = await r.text(); ok('reset known address sends', sent.length === 2 && a === '{"ok":true}');
known = false; r = await handle(rq('/reset', { email: 'nobody@y.co' }), env, fake); ok('reset unknown address same answer, no mail', (await r.text()) === a && sent.length === 2);
r = await handle(rq('/reset', { email: 'x@y.co' }), env, fake); ok('reset cooldown still answers ok', (await r.text()) === a && sent.length === 2);
r = await handle(rq('/reset', { email: 'bad' }), env, fake); ok('bad email 400', r.status === 400);
r = await handle(rq('/reset', { email: 'x@y.co' }, { Origin: 'https://evil.com' }), env, fake); ok('other origin refused', r.status === 403);
r = await handle(new Request('https://w.test/reset', { method: 'GET', headers: { Origin: 'https://wavefern.com' } }), env, fake); ok('GET refused', r.status === 403);
