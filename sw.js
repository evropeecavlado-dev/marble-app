// Мрежа първо — винаги зарежда най-новото от GitHub
// Кешът служи само като резервно при проблем с мрежата

var CACHE = 'mramor-v1';
var ASSETS = [
  '/marble-app/',
  '/marble-app/index.html',
  '/marble-app/manifest.json',
  '/marble-app/icon-192.png',
  '/marble-app/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Firebase и външни заявки — само мрежа
  if (e.request.url.indexOf('firebase') !== -1 ||
      e.request.url.indexOf('gstatic') !== -1 ||
      e.request.url.indexOf('googleapis') !== -1) {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response('', { status: 503 });
    }));
    return;
  }
  // Мрежа първо — при успех обнови кеша
  // При грешка (офлайн) — използвай кеша
  e.respondWith(
    fetch(e.request).then(function(resp) {
      if (resp && resp.status === 200) {
        var clone = resp.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      }
      return resp;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('/marble-app/index.html');
      });
    })
  );
});
