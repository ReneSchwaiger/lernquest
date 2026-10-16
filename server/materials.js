'use strict';
// Hochgeladener Schularbeitsstoff (Fotos/PDFs) pro Schularbeit.
// Dateien liegen unter DATA_DIR/uploads/<fileId>, Metadaten in materials.json.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./store');

const DIR = path.join(store.DATA_DIR, 'uploads');
fs.mkdirSync(DIR, { recursive: true });

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };
const MAX_FILES = 10;
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_PDF = 15 * 1024 * 1024;

const all = () => store.read('materials', {});
const key = (kid, examId) => `${kid}:${examId}`;
const validExamId = id => /^[a-z0-9]{4,20}$/.test(String(id || ''));
const validFileId = id => /^[a-f0-9]{32}$/.test(String(id || ''));

function list(kid) {
  const out = {};
  for (const [k, v] of Object.entries(all())) if (k.startsWith(kid + ':')) out[k.slice(kid.length + 1)] = v;
  return out;
}
function get(kid, examId) { return all()[key(kid, examId)] || null; }

async function addFile(kid, examId, { type, name, data }) {
  if (!TYPES[type]) { const e = new Error('Dateityp nicht erlaubt'); e.code = 'bad_type'; throw e; }
  if (data.length > (type === 'application/pdf' ? MAX_PDF : MAX_IMAGE)) { const e = new Error('Datei zu groß'); e.code = 'too_large'; throw e; }
  const m = all();
  const cur = m[key(kid, examId)] || { kid, examId, files: [], summary: null, status: 'empty' };
  if (cur.files.length >= MAX_FILES) { const e = new Error('Zu viele Dateien'); e.code = 'too_many'; throw e; }
  const id = crypto.randomBytes(16).toString('hex');
  await fs.promises.writeFile(path.join(DIR, id), data);
  cur.files.push({ id, type, name: String(name || 'Datei').replace(/[^\p{L}\p{N} ._()-]/gu, '').slice(0, 80) || 'Datei', size: data.length, created: new Date().toISOString() });
  cur.status = 'pending';
  store.write('materials', { ...m, [key(kid, examId)]: cur });
  return cur;
}

function findFile(fileId) {
  for (const v of Object.values(all())) { const f = v.files.find(x => x.id === fileId); if (f) return { mat: v, file: f }; }
  return null;
}
const filePath = id => path.join(DIR, id);

async function removeFile(fileId) {
  const m = all();
  for (const [k, v] of Object.entries(m)) {
    const i = v.files.findIndex(x => x.id === fileId);
    if (i >= 0) {
      const files = v.files.filter(x => x.id !== fileId);
      await fs.promises.unlink(filePath(fileId)).catch(() => {});
      const next = { ...m };
      if (files.length) next[k] = { ...v, files, status: 'pending' }; else delete next[k];
      store.write('materials', next);
      return next[k] || null;
    }
  }
  return null;
}

async function removeExam(kid, examId) {
  const m = all(); const v = m[key(kid, examId)];
  if (!v) return;
  for (const f of v.files) await fs.promises.unlink(filePath(f.id)).catch(() => {});
  const next = { ...m }; delete next[key(kid, examId)];
  store.write('materials', next);
}

async function readFiles(kid, examId) {
  const v = get(kid, examId); if (!v) return [];
  const out = [];
  for (const f of v.files) out.push({ ...f, data: await fs.promises.readFile(filePath(f.id)) });
  return out;
}

function setSummary(kid, examId, patch) {
  const m = all(); const v = m[key(kid, examId)]; if (!v) return null;
  const next = { ...v, ...patch };
  store.write('materials', { ...m, [key(kid, examId)]: next });
  return next;
}

module.exports = { list, get, addFile, findFile, filePath, removeFile, removeExam, readFiles, setSummary, validExamId, validFileId, TYPES };
