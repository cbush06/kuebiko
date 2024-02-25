import { createApp } from 'vue';
import './style.scss';

import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import routes from './routes';
import { BulmaToastPlugin } from './vue-config/bulma-toast/bulma-toast';

import ResourceRequestInterceptor from '@renderer/services/resource-request-interceptor/resource-request-interceptor?worker&url';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import en from './localization/en';
import { HelmetStoreState, useHelmetStore } from './store/helmet-store/helmet-store';

// Register service worker
navigator.serviceWorker.register(ResourceRequestInterceptor, {
    type: 'module',
});

// Set up routing
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const pinia = createPinia();

createApp(App)
    .use(router)
    .use(BulmaToastPlugin)
    .use(pinia)
    .use(createI18n({ locale: 'en', messages: { en }, fallbackWarn: false, missingWarn: false }))
    .mount('#app')
    .$nextTick(() => {
        // Remove Preload scripts loading
        postMessage({ payload: 'removeLoading' }, '*');

        // Watch the Helmet store and update HEAD as required
        useHelmetStore().$subscribe((_, helmetState: HelmetStoreState) => {
            document.title = helmetState.title ?? 'Kuebiko';
        });

        // Use contextBridge
        (window as any).electron.ipcRenderer.on('main-process-message', (_event, message) => {
            console.log(message);
        });
    });
