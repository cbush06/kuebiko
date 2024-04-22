/// <reference lib="WebWorker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('activate', () => {
    console.log('Resource Request Interceptor is active...');
});

self.addEventListener('fetch', (event) => {
    console.log(event);
    event.respondWith(fetch(event.request));
});
