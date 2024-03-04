/// <reference types="vitest" />

////////////////////////////////////////////////
//  This file is only here to support vitest  //
////////////////////////////////////////////////

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    resolve: {
        alias: {
            '@renderer': resolve(__dirname, 'src/renderer/src/main'),
            '~': resolve(__dirname, 'node_modules'),
            'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
        },
    },
    plugins: [
        vue(),
        viteStaticCopy({
            targets: [
                {
                    src: normalizePath(
                        resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts/*'),
                    ),
                    dest: normalizePath(
                        resolve(__dirname, 'src/renderer/src/main/assets/public/webfonts'),
                    ),
                },
                {
                    src: normalizePath(
                        resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts/*'),
                    ),
                    dest: normalizePath(resolve(__dirname, 'out/renderer/assets/webfonts')),
                },
            ],
        }),
        VueI18nPlugin({
            include: 'json',
            jitCompilation: true,
            runtimeOnly: true,
            compositionOnly: true,
        }),
    ],
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'src/renderer/src/main/index.html'),
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/renderer/src/test/vitest-setup.ts'],
    },
    publicDir: 'public',
});
