const CACHE_NAME = "cep-explorer-v1";
const STATIC_ASSETS = [
    "/CEP-Explorer/",
    "/CEP-Explorer/index.html",
    "/CEP-Explorer/css/style.css",
    "/CEP-Explorer/js/main.js",
    "/CEP-Explorer/js/services/viaCepService.js",
    "/CEP-Explorer/js/services/nominatimService.js",
    "/CEP-Explorer/js/services/ibgeService.js",
    "/CEP-Explorer/js/services/weatherService.js",
    "/CEP-Explorer/js/services/mapsService.js",
    "/CEP-Explorer/js/ui/theme.js",
    "/CEP-Explorer/js/ui/toast.js",
    "/CEP-Explorer/js/ui/history.js",
    "/CEP-Explorer/js/ui/favorites.js",
    "/CEP-Explorer/js/ui/app.js",
    "/CEP-Explorer/manifest.json"
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
                    cache.put(request, responseClone);
                });

                return response;
            });
        })
    );
});
