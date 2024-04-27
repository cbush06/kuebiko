import { createApp } from 'vue';
import './style.scss';

import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import routes from './routes';
import { BulmaToastPlugin } from './vue-config/bulma-toast/bulma-toast';

import ResourceRequestInterceptor from '@renderer/services/resource-request-interceptor/resource-request-interceptor?worker&url';
import { createPinia } from 'pinia';
import { HelmetStoreState, useHelmetStore } from './store/helmet-store/helmet-store';
import { VueI18n } from './vue-config/vuei18n/vuei18n';

import '~@milkdown/theme-nord/src/style.css';
import '~prosemirror-view/style/prosemirror.css';

// Register service worker
navigator.serviceWorker.register(ResourceRequestInterceptor, {
    type: 'module',
});

// Set up routing
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// Some pages need 100% height of body, html, #app, and #app > .container
// Others do not.
router.beforeEach((to, from) => {
    document.documentElement.classList.remove('is-full-height');
    if (to.meta.isFullHeight === true) {
        document.documentElement.classList.add('is-full-height');
    }
});

const pinia = createPinia();

createApp(App)
    .use(router)
    .use(BulmaToastPlugin)
    .use(pinia)
    .use(VueI18n)
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
