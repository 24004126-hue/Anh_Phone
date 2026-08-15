const CACHE_NAME = "phonestore-cache-v1";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/manifest.json"
];

// Install Event: Pre-cache static shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event: Network-first with Cache fallback
self.addEventListener("fetch", (event) => {
    // Only handle GET requests
    if (event.request.method !== "GET") return;

    // Do not cache API endpoints to prevent stale database data
    if (event.request.url.includes("/api/")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.headers.get("accept")?.includes("text/html")) {
                        return caches.match("/index.html");
                    }
                });
            })
    );
});
