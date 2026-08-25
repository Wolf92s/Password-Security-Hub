// Define a name for the current cache version
const CACHE_NAME = 'passwordsecurityhub-v2';

// List all the files and resources the app needs to function offline
const URLS_TO_CACHE = [
  './',
  'index.html',
  'generator.html',
  'news.html',
  'passkeys.html',
  '2fa.html',
  'managers.html',
  'support.html',
  'contact.html',
  'tos.html',
  'styles.css',
  'shared.js',
  'generator.js',
  'manifest.json',
  'favicon.ico',
  'favicon.svg',
  'favicon-96x96.png',
  'apple-touch-icon.png',
  'web-app-manifest-192x192.png',
  'web-app-manifest-512x512.png',
  'tailwind4.css',
  'crypto-js.min.js'
];

// The 'install' event is fired when the service worker is first installed.
self.addEventListener('install', event => {
  // We use event.waitUntil to ensure the service worker doesn't
  // finish installing until the cache is populated.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all the specified URLs to the cache.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// The 'activate' event is fired when the service worker becomes active.
// This is a good time to clean up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache's name is different from our current CACHE_NAME, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// The 'fetch' event is fired for every network request the page makes.
// We intercept these requests to serve cached files when offline.
self.addEventListener('fetch', event => {
  event.respondWith(
    // First, try to find a matching response in the cache.
    caches.match(event.request)
      .then(response => {
        // If a cached response is found, return it.
        if (response) {
          return response;
        }
        // If no cached response is found, fetch it from the network.
        return fetch(event.request);
      }
    )
  );
});