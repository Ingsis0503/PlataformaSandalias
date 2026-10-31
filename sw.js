const CACHE_NAME = 'sandalias-v1';
const urlsToCache = [
    './',
    './index.html',
    './Estilo.css',
    './Control.js'
];

// Instalar el Service Worker y guardar los archivos en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

// Interceptar peticiones para que funcione sin conexión
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});