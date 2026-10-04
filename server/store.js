'use strict';
// Einfacher JSON-Dateispeicher in DATA_DIR (/home/data auf Azure – bleibt bei Deploys erhalten).
// Schreibt atomar (tmp + rename) und serialisiert Schreibvorgänge pro Datei.
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || '/home/data/lernquest';
fs.mkdirSync(DATA_DIR, { recursive: true });

const cache = new Map();
const chains = new Map();

function file(name) { return path.join(DATA_DIR, name + '.json'); }

function read(name, def) {
  if (cache.has(name)) return cache.get(name);
  let v = def;
  try { v = JSON.parse(fs.readFileSync(file(name), 'utf8')); } catch (e) {
    if (e.code !== 'ENOENT') console.error(`[store] ${name}.json nicht lesbar:`, e.message);
  }
  cache.set(name, v);
  return v;
}

function write(name, value) {
  cache.set(name, value);
  const prev = chains.get(name) || Promise.resolve();
  const next = prev.then(async () => {
    const f = file(name), tmp = f + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(value, null, 1));
    await fs.promises.rename(tmp, f);
  }).catch(e => console.error(`[store] Schreiben ${name} fehlgeschlagen:`, e.message));
  chains.set(name, next);
  return next;
}

module.exports = { read, write, DATA_DIR };
