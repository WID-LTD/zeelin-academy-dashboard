/* Zeelin Academy — Enterprise auth token (hard-coded ZEELIN, 30m sliding, HMAC) */
const crypto = require('crypto');

const PASSWORD = 'ZEELIN';
const SESSION_SECRET = 'zeelin-academy-enterprise-v1-8f3a9c2e7b1d4e6f5a9c0b2d3e4f6a7b';
const TTL_MS = 30 * 60 * 1000;
const RENEW_WINDOW_MS = 15 * 60 * 1000; // renew when <15m left

function b64urlEncode(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function sign(payloadB64) {
  return b64urlEncode(crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest());
}

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ab, bb); } catch { return false; }
}

function createToken() {
  const now = Date.now();
  const payload = { iat: now, exp: now + TTL_MS, jti: crypto.randomBytes(12).toString('hex') };
  const pB64 = b64urlEncode(JSON.stringify(payload));
  const sig = sign(pB64);
  return pB64 + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const dot = token.lastIndexOf('.');
  const pB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(pB64);
  if (!timingSafeEqualStr(sig, expected)) return null;
  let payload;
  try { payload = JSON.parse(b64urlDecode(pB64)); } catch { return null; }
  if (!payload || typeof payload.exp !== 'number' || typeof payload.iat !== 'number') return null;
  if (Date.now() > payload.exp) return null; // expired
  if (payload.exp - payload.iat > TTL_MS + 1000) return null; // tampered
  return payload;
}

function shouldRenew(payload) {
  if (!payload) return false;
  return (payload.exp - Date.now()) < RENEW_WINDOW_MS;
}

function verifyPassword(input) {
  // timing safe, hard-coded ZEELIN
  return timingSafeEqualStr(String(input || ''), PASSWORD);
}

module.exports = { PASSWORD, TTL_MS, createToken, verifyToken, shouldRenew, verifyPassword, b64urlEncode, b64urlDecode };
