// ============================================================================
// CYBER COURIER: PROGRESSIVE WEB APP SERVICE WORKER ENGINE (sw.js)
// ============================================================================

const CACHE_NAME = 'cyber-courier-v1';

// Static local assets asset pipeline files required for offline functionality
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './engine.js',
    './assets/player_run.svg',
    './assets/road_barrier.svg'
];

// 1. LIFECYCLE INSTALL COMPONENT: ALLOCATE LOCAL CACHE BUFFER STORAGE SPACE
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('[PWA SERVICE WORKER] Initializing cache allocation matrix...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => self.skipWaiting()) // Instantly force-activate the service worker context
    );
});

// 2. LIFECYCLE ACTIVATION COMPONENT: PURGE OBSOLETE STORAGE CODES
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[PWA SERVICE WORKER] Evicting outdated storage cache profile:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Immediately take control over open game client tabs
    );
});

// 3. PERSISTENT FETCH ROUTINES INTERACTION LAYER: NETWORK LAYER WITH CACHE FALLBACKS
self.addEventListener('fetch', (event) => {
    // Completely bypass interception rules for data mutations and administrative portals
    if (event.request.url.includes('/api/') || event.request.url.includes('/admin')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then((cachedResponse) => {
            if (cachedResponse) {
                // Asset found inside persistent memory; serve immediately
                return cachedResponse;
            }

            // Fallback to active network interfaces if client requests assets not inside cache arrays
            return fetch(event.request).then((networkResponse) => {
                // Ensure payload returns valid status vectors before committing data steps
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Clone stream pipeline to safely preserve references during concurrent storage loops
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Gracefully handle standard asset requests if connection state drops to completely offline
                console.warn('[PWA SERVICE WORKER] Client is detached from network streams. Rendering storage assets.');
            });
        })
    );
});

