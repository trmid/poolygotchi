const cacheName = `$PACKAGE_VERSION`; // Change value to force update
const filesToCache = `$FILES_TO_CACHE`; // Generated filenames as string array

self.addEventListener("install", event => {
	// Kick out the old service worker
	self.skipWaiting();
	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll(JSON.parse(filesToCache));
		})
	);
});

self.addEventListener("activate", event => {
	// Delete any non-current cache
	event.waitUntil(
		caches.keys().then(keys => 
			Promise.all(
				keys.map(key => {
					if (![cacheName].includes(key)) {
						return caches.delete(key);
					}
				})
			)
		)
	);
});

// Get data on screen as quickly as possible, then update once the network has returned the latest data. 
self.addEventListener("fetch", event => {
	event.respondWith(
		caches.open(cacheName).then(cache => 
			cache.match(event.request).then(response => {
        const networkResponse = fetch(event.request).then(networkResponse => {
					cache.put(event.request, networkResponse.clone());
					return networkResponse;
				}).catch(console.warn);
				return response ?? networkResponse;
			})
		)
	);
});