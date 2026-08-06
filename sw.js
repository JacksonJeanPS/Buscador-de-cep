const CACHE_NAME = "cep-explorer-v1";
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/main.js",
    "./js/services/viaCepService.js",
    "./js/services/nominatimService.js",
    "./js/services/ibgeService.js",
    "./js/services/weatherService.js",
    "./js/services/mapsService.js",
    "./js/ui/theme.js",
    "./js/ui/toast.js",
    "./js/ui/history.js",
    "./js/ui/favorites.js",
    "./js/ui/app.js",
    "./manifest.json"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    if (request.url.includes("/api/") || request.url.includes("viacep.com.br") || request.url.includes("openstreetmap.org") || request.url.includes("api.open-meteo.com") || request.url.includes("ibge.gov.br") || request.url.includes("nominatim.openstreetmap.org") || request.url.includes("qrserver.com")) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(JSON.stringify({ error: "Offline" }), {
                    headers: { "Content-Type": "application/json" }
                });
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseClone).catch(() => {});
                });

                return response;
            });
        })
    );
});
