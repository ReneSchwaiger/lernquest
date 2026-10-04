'use strict';
// Verschlüsseltes HttpOnly-Session-Cookie (AES-256-GCM), Schlüssel aus SESSION_SECRET.
const crypto = require('crypto');

const COOKIE = 'lq_sess';
const MAX_AGE_DAYS = Number(process.env.SESSION_DAYS || 180);
const SECURE = process.env.COOKIE_SECURE !== '0';

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET fehlt oder ist zu kurz (min. 16 Zeichen).');
  return crypto.createHash('sha256').update('lernquest-session:' + s).digest();
}

function seal(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
}

function unseal(str) {
  try {
    const buf = Buffer.from(str, 'base64url');
    const d = crypto.createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    const obj = JSON.parse(Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8'));
    if (!obj || typeof obj.exp !== 'number' || obj.exp < Date.now()) return null;
    return obj;
  } catch { return null; }
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function middleware(req, res, next) {
  const raw = parseCookies(req.headers.cookie)[COOKIE];
  req.session = raw ? unseal(raw) : null;
  res.setSession = (data) => {
    const exp = Date.now() + MAX_AGE_DAYS * 864e5;
    const val = seal({ ...data, exp });
    res.append('Set-Cookie', `${COOKIE}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_DAYS * 86400}${SECURE ? '; Secure' : ''}`);
    req.session = { ...data, exp };
  };
  res.clearSession = () => {
    res.append('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${SECURE ? '; Secure' : ''}`);
    req.session = null;
  };
  next();
}

module.exports = { middleware };
