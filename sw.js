// Service Worker for Meeting Recorder PWA
// Strategy: cache-first for the app shell, network-only for Mistral API calls.
// Recordings live in IndexedDB (handled in app.js, not here).

const CACHE_NAME = 'meeting-recorder-v5';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './silent.mp3',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Always go to network for Mistral API + any non-same-origin POST
  if (url.hostname.includes('mistral.ai') || event.request.method !== 'GET') {
    return;  // let it pass through
  }
  // Same-origin GETs: cache-first, then network
  event.respondWith(
    caches.match(event.request).then(hit => {
      if (hit) return hit;
      return fetch(event.request).then(res => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
