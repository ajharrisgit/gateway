// One service worker for the whole suite.
//
// The three apps each shipped their own PWA that assumed it owned the domain
// root: start_url "/", precache lists naming "/index.html", caches called
// gsa-travel-rates-v6, travel-estimator-v2.5-fy2026 and tito-v3-fy2026. Three of
// those cannot coexist on one origin, because whichever registered last would
// claim the root scope and serve its own index for every navigation. This file
// replaces all three for the gateway deployment.
//
// CACHE_NAME is a fresh namespace, so it cannot collide with the three caches
// already live in people's browsers on the existing sites.
//
// **Bumping CACHE_NAME on release is the entire update mechanism.** `activate`
// deletes every cache that is not the current one and then claims open clients,
// so a bumped constant is what makes a returning visitor pick up a new build. A
// release that changes a page without bumping it serves the old page from cache
// indefinitely.
const CACHE_NAME = 'ajsu-travel-gateway-v2';

// Every path is relative. The three live sites use absolute paths, which is fine
// on Netlify and Cloudflare Pages but 404s on GitHub Pages subpath hosting.
// Relative costs nothing and keeps every host open.
const URLS_TO_CACHE = [
  './',
  './index.html',
  './index.js',
  './travel_gateway.html',
  './gateway.js',
  './gateway.css',
  './tata.html',
  './tito.html',
  './toto.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './vendor/runtime.js',
  './vendor/fonts/fonts.css',
  './vendor/fonts/Inter-normal.woff2',
  './vendor/fonts/JetBrainsMono-normal.woff2',
  './vendor/fonts/PlusJakartaSans-normal.woff2'
  // assets/zip-index.json (313 KB) is deliberately not precached. cache.addAll()
  // is atomic, so every extra file is another way for the whole install to fail
  // on a slow or filtered connection, and only toto asks for this one and only
  // when a ZIP is looked up. The fetch handler below caches it on first
  // successful request instead. The same reasoning kept the 15.9 MB source file
  // out of the original workers.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  // Cross-origin requests are left entirely alone. The pages make none in normal
  // use -- the runtime and typefaces are bundled -- but the Route Verifier deep
  // links and the admin import path must not be intercepted or cached.
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => {
        // A failed navigation falls back to the gateway rather than the redirect
        // stub, so an offline visitor lands on something usable.
        if (request.destination === 'document') {
          return caches.match('./travel_gateway.html');
        }
        return new Response('Network request failed and no cache available.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});
