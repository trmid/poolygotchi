const cacheName = `$PACKAGE_VERSION`; // Change value to force update
const filesToCache = `$FILES_TO_CACHE`; // Generated filenames as string array

self.addEventListener("install", event => {

  // Delete any non-current cache
	event.waitUntil(
		caches.keys().then(keys => 
			Promise.all(
				keys.map(key => {
					if (![cacheName, 'ipfs'].includes(key)) {
						return caches.delete(key);
					}
				})
			)
		)
	);
  
	// Kick out the old service worker
	self.skipWaiting();
	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll(JSON.parse(filesToCache));
		})
	);
});

// Promise that waits # of seconds before resolving:
function wait(sec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, sec * 1000);
  });
}

// Get data on screen as quickly as possible, then update once the network has returned the latest data.
self.addEventListener("fetch", event => {
	const url = new URL(event.request.url);
  switch (url.origin) {
    // Our service worker only serves pages for its own page origin
    case location.origin: {
      const [,protocol] = url.pathname.split('/');
      switch (protocol) {
        // If requests are for `/ipfs/...` we respond with IPFS file
        case 'ipfs': {
          return event.respondWith(
            caches.open('ipfs').then(cache => 
							cache.match(event.request).then(response => {
                if(response) return response;
                let fetchedFromIPFS = false;
                const ipfsFetch = Promise.race([

                  // Fetch from IPFS:
                  fetchIPFSContent({ path: url.pathname, event }).then(res => { fetchedFromIPFS = true; return res; }),

                  // Wait 30 seconds before trying to serve from public gateway:
                  wait(30).then(() => { 
                    if(!fetchedFromIPFS) {
                      return fetch(gatewayURL(url.pathname))
                    } else {
                      return undefined;
                    }
                  })

                ]);
								const networkResponse = ipfsFetch.then(networkResponse => {
                  if(!networkResponse) return new Response({ status: 404, statusText: "not found" });
									if(networkResponse.status == 200) cache.put(event.request, networkResponse.clone()).catch(console.warn); // only cache if successful
									return networkResponse;
								}).catch(console.warn);
								return networkResponse;
							})
						)
          );
        }
        // Anything else might be for scripts, source maps etc.. we just fetch
        // those from network
        default: {
					return event.respondWith(
						caches.open(cacheName).then(cache => 
							cache.match(event.request).then(response => {
								const networkResponse = fetch(event.request).then(networkResponse => {
									if(response) cache.put(event.request, networkResponse.clone()).catch(console.warn); // only cache files previously in cache
									return networkResponse;
								}).catch(console.warn);
								return response ?? networkResponse;
							})
						)
					);
				}
      }
    }
    // Requests to other origins are fetched from the network.
    default: {
      return event.respondWith(fetch(event.request));
    }
  }
});

// IPFS Helpers:
let _ipfsPromise;
const ipfsClient = () => {
  if(!_ipfsPromise) {
    _ipfsPromise = IpfsCore.create({
      libp2p: {
        connectionManager: {
          autodial: false
        }
      }
    });
  }
  return _ipfsPromise;
};

// Public gateway rotator:
let gatewayIndex = 0;
const publicGateways = [
  'https://ipfs.io',
  'https://dweb.link',
];
function gatewayURL(path) {
  const url = publicGateways[gatewayIndex++] + path;
  if(gatewayIndex >= publicGateways.length) gatewayIndex = 0;
  return url;
}

// Fetch IPFS Content:
const fetchIPFSContent = async ({ event, path }) => {
  // Obtains IPFS instance
  const ipfs = await ipfsClient();
  try {
		console.log(path);
    const stat = await ipfs.files.stat(path);
		console.log(stat);
    switch (stat.type) {
      case 'file': {
        return await fetchIPFSFile(path)
      }
      case 'directory': {
        if (!path.endsWith('/')) {
          return Response.redirect(`${event.request.url}/`)
        } else {
          // try index.html file in this directory if there is such file
          // render it otherwise respond with 500
          const index = `${path}index.html`
          const stat = await ipfs.files.stat(index).catch(() => ({ type: null }))
          return stat.type === 'file'
            ? fetchIPFSFile(index)
            : new Response("cannot fetch directory", {
							statusText: "cannot fetch directory",
							status: 500
						})
        }
      }
      default: {
        // If non file redirect to ipld explorer
        return Response.redirect(`https://explore.ipld.io/#/explore${path}`)
      }
    }
  } catch (err) {
    console.error(err)
		if(err && err.message) {

			// If such link does not exists respond with 404
			if (err.message.startsWith('no link named') || err.message.includes('does not exist')) {
				return new Response(err.message, {
					statusText: err.message,
					status: 404
				})
			}

			// If problem with CID respond with 400
			if (err.message.includes('invalid')) {
				return new Response(err.message, {
					statusText: err.message,
					status: 400
				})
			}

			// Otherwise respond with 500
			return new Response(err.message, {
				statusText: err.message,
				status: 500
			})
		}
  }
}

const fetchIPFSFile = async (path) => {
	const ipfs = await ipfsClient();
	console.log(`fetching ${path}...`);
  const content = ipfs.cat(path);
  const body = toReadableStream(content);
	console.log(body);
  // Note: Browsers by default perform content sniffing to do a content type
  // decetion https://developer.mozilla.org/en-US/docs/Mozilla/How_Mozilla_determines_MIME_Types
  // but it is limited to web relevant content and seems to exclude svg.
  // Here we fix svg support that otherwise breaks many pages doing proper content
  // type detection is left as an excercise to the reader.
  const contentType = path.endsWith('.svg') ? { 'content-type': 'image/svg+xml' } : null;

  return new Response(body, {
    status: 200,
    headers: {
      ...contentType
    }
  });
}

const toReadableStream = (source) => {
  const iterator = source[Symbol.asyncIterator]()
  return new ReadableStream({
    /**
     * @param {ReadableStreamDefaultController} controller 
     */
    async pull(controller) {
      try {
        const chunk = await iterator.next()
        if (chunk.done) {
          controller.close()
        } else {
          controller.enqueue(chunk.value)
        }
      } catch(error) {
        controller.error(error)
      }
    },
    /**
     * @param {any} reason 
     */
    cancel(reason) {
      if (source.return) {
        source.return(reason)
      }
    }
  })
}