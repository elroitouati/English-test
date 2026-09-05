const CACHE_NAME = 'vocab-trainer-v7';
const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/storage.js',
  './js/countdown.js',
  './js/flame-badge.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Network-first: תמיד מנסים לשלוף גרסה עדכנית מהרשת קודם, ורק אם אין רשת
// (אופליין) נופלים חזרה לגרסה השמורה. זה מבטיח שדחיפה חדשה תגיע מיד בפעם
// הבאה שיש חיבור, בלי תלות בזה שמישהו יזכור לעדכן את מספר גרסת המטמון.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request.url, { cache: 'no-store' }).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
