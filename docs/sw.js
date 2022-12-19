const cacheName = `0.1.4`; // Change value to force update
const filesToCache = `["./","build/bundle.js","build/bundle.css","archive/banner.png","archive/birb.png","archive/poolygotchi_concept_art.png","archive/poolygotchi_project_proposal.pdf","assets/environments/0-living-room/environment.png","assets/species/0-pooly/crying.gif","assets/species/0-pooly/happy.gif","assets/species/0-pooly/neutral.gif","assets/species/0-pooly/sad.gif","assets/species/0-pooly/sleeping.gif","assets/species/0-pooly/walking.gif","build/bundle.js.map","CNAME","favicon.png","files/poolygotchi_project_proposal_v1.2.pdf","img/banner.png","img/banner.svg","img/icon.svg","img/logo.svg","img/logo_jp.png","img/logo_jp.svg","img/logo_jp_desktop.png","img/logo_jp_desktop.svg","img/pocket_pooly_logo.png","img/pocket_pooly_logo.svg","img/wc_logo.svg","index.html","manifest.json","scripts/ipfs.min.js","style/app.css","style/Comfortaa.ttf","style/icofont/fonts/icofont.woff","style/icofont/fonts/icofont.woff2","style/icofont/icofont.min.css"]`; // Generated filenames as string array

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
          if(response) cache.put(event.request, networkResponse.clone()); // only cache files previously in cache
					return networkResponse;
				}).catch(console.warn);
				return response ?? networkResponse;
			})
		)
	);
});