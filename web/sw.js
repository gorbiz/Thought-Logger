self.addEventListener('install', function (event) {
  // Skip waiting to activate this service worker immediately without waiting for the next reload.
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  // Claim clients immediately to control any open clients without waiting for them to reload.
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      // Attempt to fetch from the network, and fall back to the cache only if the network fails.
      return caches.match(event.request)
    })
  )
})
