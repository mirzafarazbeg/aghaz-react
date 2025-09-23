importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
importScripts('/precache-manifest.js');

const OFFLINE_FALLBACK_PAGE = '/offline.html';

workbox.setConfig({ debug: false });
workbox.core.setCacheNameDetails({
  prefix: 'aghazurdu',
  precache: 'precache',
  runtime: 'runtime',
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();

const precacheManifest = Array.isArray(self.__PRECACHE_MANIFEST)
  ? self.__PRECACHE_MANIFEST
  : [];

workbox.precaching.precacheAndRoute(precacheManifest);
workbox.precaching.cleanupOutdatedCaches();

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'aghazurdu-pages',
    networkTimeoutSeconds: 5,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    return caches.match(OFFLINE_FALLBACK_PAGE, { ignoreSearch: true });
  }
  return Response.error();
});

workbox.routing.registerRoute(
  ({ request }) =>
    ['style', 'script', 'worker', 'font', 'image'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'aghazurdu-static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);
