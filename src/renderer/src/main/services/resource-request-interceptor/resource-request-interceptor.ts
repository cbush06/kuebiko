/// <reference lib="WebWorker" />

declare const self: ServiceWorkerGlobalScope;

import { KuebikoDb } from '@renderer/db/kuebiko-db';

const db = new KuebikoDb();

self.addEventListener('activate', () => {
    console.log('Resource Request Interceptor is active...');
});

self.addEventListener('fetch', (event) => {
    console.log(event);
    event.respondWith(fetch(event.request));
});
