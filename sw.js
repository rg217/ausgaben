// Offline-Cache: die App startet auch ohne Internet. Deine Daten liegen nicht hier, sondern nur im Speicher deines Geräts.
var CACHE = 'ausgaben-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Zuerst aus dem Cache, im Hintergrund aktualisieren (Änderungen erscheinen beim nächsten Start)
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (cached) {
    var net = fetch(req).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); }
      return res;
    }).catch(function () { return cached || caches.match('./index.html'); });
    return cached || net;
  }));
});
