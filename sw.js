// Изчисти всички стари кешове и се деактивирай
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

// Без кеширане — всичко директно от мрежата
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});
