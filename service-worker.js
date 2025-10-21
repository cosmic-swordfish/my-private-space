const CACHE_NAME = 'my-private-space-v2'; // Updated cache name to force refresh
const ASSETS_TO_CACHE = [
  './index.html',
  './styles.css',
  './script.js',
  './manifest.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/chihiro036.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Check for updates in the background
        fetch(event.request).then((fetchResponse) => {
          if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
            });
          }
        }).catch(() => {});
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return fetchResponse;
      }).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.options.body,
      icon: event.data.options.icon,
      badge: event.data.options.badge
    });
  } else if (event.data.type === 'UPDATE_MANIFEST') {
    // Update cached manifest data if needed
    caches.open(CACHE_NAME).then((cache) => {
      cache.put('/manifest.json', new Response(JSON.stringify(event.data.manifest), {
        headers: { 'Content-Type': 'application/json' }
      }));
    });
  } else if (event.data.type === 'FORCE_UPDATE') {
    caches.open(CACHE_NAME).then((cache) => {
      ASSETS_TO_CACHE.forEach((asset) => {
        fetch(asset).then((response) => {
          if (response && response.status === 200) {
            cache.put(asset, response);
          }
        });
      });
    });
    self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'RELOAD' });
      });
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
