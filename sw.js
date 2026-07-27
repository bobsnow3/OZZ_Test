const CACHE_NAME = 'ozz-test-v16';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './screen-mobile.png',
  './screen-desktop.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Игнорируем запросы, которые не идут по HTTP/HTTPS (например, расширения Chrome, AdGuard)
  if (!e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      // Возвращаем кэш или делаем запрос в сеть.
      // Если сеть падает (из-за AdGuard), просто ничего не возвращаем, чтобы не крашить SW.
      return response || fetch(e.request).catch(() => {
          // Ошибка сети или блокировка
      });
    })
  );
});