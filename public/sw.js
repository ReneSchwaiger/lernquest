// LernQuest Service Worker: App-Shell offline, API immer übers Netz.
const VERSION = 'lq-1.0.0';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png',
  '/fonts/baloo-2-latin-500-normal.woff2', '/fonts/baloo-2-latin-700-normal.woff2', '/fonts/baloo-2-latin-800-normal.woff2',
  '/fonts/nunito-latin-400-normal.woff2', '/fonts/nunito-latin-600-normal.woff2', '/fonts/nunito-latin-700-normal.woff2', '/fonts/nunito-latin-800-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api') || url.pathname === '/healthz') return;
  // Network-first für die App-Shell (Updates sofort), Cache als Offline-Fallback
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
  );
});
