'use strict';
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('./session');
const store = require('./store');
const ai = require('./ai');
const { KIDS, SUBJ, DEFAULT_BOOKS } = require('./kids');
const VERSION = require('../package.json').version;

const PORT = process.env.PORT || 8080;
const FAMILY_PASSWORD = process.env.FAMILY_PASSWORD || '';
const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 15);
const PARENT_MINUTES = Number(process.env.PARENT_MINUTES || 60);
if (!FAMILY_PASSWORD) console.warn('[warn] FAMILY_PASSWORD ist nicht gesetzt – Anmeldung ist nicht möglich.');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '400kb' }));
app.use(session.middleware);

app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  next();
});

/* ---------- Hilfen ---------- */
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Vienna' });
const hash = (s, salt) => crypto.scryptSync(String(s), salt, 32).toString('hex');
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

function settings() {
  let s = store.read('settings', null);
  if (!s) {
    const salt = crypto.randomBytes(16).toString('hex');
    s = { pinSalt: salt, pinHash: hash(process.env.PARENT_PIN || '1234', salt), pinIsDefault: !process.env.PARENT_PIN, books: DEFAULT_BOOKS };
    store.write('settings', s);
  }
  return s;
}
function kidsDoc() { return store.read('kids', {}); }

/* ---------- Brute-Force-Schutz ---------- */
const fails = new Map();
function tooMany(key) {
  const f = fails.get(key);
  if (!f) return false;
  if (Date.now() - f.first > 15 * 60e3) { fails.delete(key); return false; }
  return f.n >= 10;
}
function fail(key) { const f = fails.get(key); if (!f || Date.now() - f.first > 15 * 60e3) fails.set(key, { n: 1, first: Date.now() }); else f.n++; }

/* ---------- Auth ---------- */
const needFamily = (req, res, next) => req.session?.fam ? next() : res.status(401).json({ error: 'not_logged_in' });
const needParent = (req, res, next) => req.session?.fam && req.session.parentUntil > Date.now() ? next() : res.status(403).json({ error: 'parent_required' });

app.get('/healthz', (req, res) => res.json({ status: 'ok', version: VERSION, ai: ai.enabled() }));

app.post('/api/login', (req, res) => {
  const key = 'login:' + req.ip;
  if (tooMany(key)) return res.status(429).json({ error: 'too_many_attempts' });
  if (!FAMILY_PASSWORD || !safeEq(hash(req.body?.password || '', 'fam'), hash(FAMILY_PASSWORD, 'fam'))) { fail(key); return res.status(401).json({ error: 'wrong_password' }); }
  fails.delete(key);
  res.setSession({ fam: true, parentUntil: 0 });
  res.json({ ok: true });
});
app.post('/api/logout', (req, res) => { res.clearSession(); res.json({ ok: true }); });
app.get('/api/me', (req, res) => res.json({ loggedIn: !!req.session?.fam, parent: !!(req.session?.parentUntil > Date.now()), version: VERSION }));

app.post('/api/parent/unlock', needFamily, (req, res) => {
  const key = 'pin:' + req.ip;
  if (tooMany(key)) return res.status(429).json({ error: 'too_many_attempts' });
  const s = settings();
  if (!safeEq(hash(req.body?.pin || '', s.pinSalt), s.pinHash)) { fail(key); return res.status(401).json({ error: 'wrong_pin' }); }
  fails.delete(key);
  res.setSession({ ...req.session, parentUntil: Date.now() + PARENT_MINUTES * 60e3 });
  res.json({ ok: true });
});
app.post('/api/parent/lock', needFamily, (req, res) => { res.setSession({ ...req.session, parentUntil: 0 }); res.json({ ok: true }); });

/* ---------- Daten ---------- */
app.get('/api/state', needFamily, (req, res) => {
  const s = settings(), k = kidsDoc();
  const kids = {};
  for (const id of Object.keys(KIDS)) kids[id] = k[id] || { rev: 0, data: null };
  res.json({ kids, settings: { books: s.books || DEFAULT_BOOKS, pinIsDefault: !!s.pinIsDefault }, ai: { enabled: ai.enabled(), limit: AI_DAILY_LIMIT, used: usage() } });
});

app.put('/api/kids/:id', needFamily, (req, res) => {
  const id = req.params.id;
  if (!KIDS[id]) return res.status(404).json({ error: 'unknown_kid' });
  const { baseRev, data } = req.body || {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'bad_data' });
  if (JSON.stringify(data).length > 300_000) return res.status(413).json({ error: 'too_large' });
  const k = kidsDoc();
  const cur = k[id] || { rev: 0, data: null };
  if (typeof baseRev === 'number' && baseRev !== cur.rev) return res.status(409).json({ error: 'conflict', current: cur });
  const next = { rev: cur.rev + 1, data, updated: new Date().toISOString() };
  store.write('kids', { ...k, [id]: next });
  res.json({ rev: next.rev });
});

app.put('/api/settings', needParent, (req, res) => {
  const s = { ...settings() };
  const { books, pin } = req.body || {};
  if (books && typeof books === 'object') {
    const nb = {};
    for (const id of Object.keys(KIDS)) { nb[id] = {}; for (const sub of Object.keys(SUBJ)) nb[id][sub] = clip(books?.[id]?.[sub] ?? s.books?.[id]?.[sub] ?? '', 150); }
    s.books = nb;
  }
  if (pin !== undefined) {
    if (!/^\d{4}$/.test(String(pin))) return res.status(400).json({ error: 'pin_format' });
    s.pinSalt = crypto.randomBytes(16).toString('hex'); s.pinHash = hash(pin, s.pinSalt); s.pinIsDefault = false;
  }
  store.write('settings', s);
  res.json({ ok: true, books: s.books, pinIsDefault: s.pinIsDefault });
});

app.post('/api/kids/:id/reset', needParent, (req, res) => {
  const id = req.params.id;
  if (!KIDS[id]) return res.status(404).json({ error: 'unknown_kid' });
  const k = kidsDoc(); const cur = k[id] || { rev: 0 };
  store.write('kids', { ...k, [id]: { rev: cur.rev + 1, data: null, updated: new Date().toISOString() } });
  res.json({ rev: cur.rev + 1 });
});

/* ---------- KI ---------- */
function usage() { const u = store.read('ai-usage', {}); return u.day === today() ? (u.counts || {}) : {}; }
function countUse(kid) {
  const u = store.read('ai-usage', {});
  const counts = u.day === today() ? { ...(u.counts || {}) } : {};
  counts[kid] = (counts[kid] || 0) + 1;
  store.write('ai-usage', { day: today(), counts });
}

app.post('/api/ai/questions', needFamily, async (req, res) => {
  if (!ai.enabled()) return res.status(503).json({ error: 'ai_disabled' });
  const b = req.body || {};
  if (!KIDS[b.kid] || !SUBJ[b.subj]) return res.status(400).json({ error: 'bad_request' });
  if ((usage()[b.kid] || 0) >= AI_DAILY_LIMIT) return res.status(429).json({ error: 'daily_limit', limit: AI_DAILY_LIMIT });
  const exam = !!b.exam;
  const s = settings();
  const params = {
    kid: b.kid, subj: b.subj, exam,
    topicTitle: clip(b.topicTitle, 300), free: clip(b.free, 120), examNote: clip(b.examNote, 300),
    diff: ['leicht', 'mittel', 'schwer'].includes(b.diff) ? b.diff : 'mittel',
    n: exam ? 12 : 8,
    book: clip(s.books?.[b.kid]?.[b.subj], 150),
  };
  if (!params.exam && !params.topicTitle && !params.free) return res.status(400).json({ error: 'no_topic' });
  try {
    const questions = await ai.generate(params);
    if (questions.length < 3) return res.status(502).json({ error: 'bad_output' });
    countUse(b.kid);
    res.json({ questions, used: (usage()[b.kid] || 0), limit: AI_DAILY_LIMIT });
  } catch (e) {
    console.error('[ai]', e.message);
    res.status(e.status === 429 ? 429 : 502).json({ error: e.status === 429 ? 'rate_limited' : 'ai_failed' });
  }
});

/* ---------- Frontend ---------- */
const pub = path.join(__dirname, '..', 'public');
app.get(['/sw.js', '/manifest.webmanifest'], (req, res, next) => { res.set('Cache-Control', 'no-cache'); next(); });
app.use(express.static(pub, {
  setHeaders(res, p) { if (/\.(woff2|png)$/.test(p)) res.set('Cache-Control', 'public, max-age=31536000, immutable'); else res.set('Cache-Control', 'no-cache'); },
}));
app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));
app.get('*', (req, res) => res.sendFile(path.join(pub, 'index.html')));

app.listen(PORT, () => console.log(`LernQuest ${VERSION} läuft auf Port ${PORT} · Daten: ${store.DATA_DIR} · KI: ${ai.enabled() ? ai.MODEL : 'aus'}`));
