///////////////////////////////////////////////////////////////////
//  This file is only here to get webstorm to recognize aliases  //
///////////////////////////////////////////////////////////////////

import { defineConfig, normalizePath } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: '@renderer',
                replacement: resolve(__dirname, 'src/renderer/src/main'),
            },
            {
                find: /~(.+)/,
                replacement: resolve(__dirname, 'node_modules') + '/$1',
            },
            {
                find: 'vue-i18n',
                replacement: 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
            },
        ],
    },
    plugins: [
        vue(),
        viteStaticCopy({
            targets: [
                {
                    src: normalizePath(
                        resolve(
                            __dirname,
                            'node_modules/@fortawesome/fontawesome-free/webfonts/*',
                        ),
                    ),
                    dest: normalizePath(
                        resolve(__dirname, 'src/renderer/src/main/assets/webfonts'),
                    ),
                },
                {
                    src: normalizePath(
                        resolve(
                            __dirname,
                            'node_modules/@fortawesome/fontawesome-free/webfonts/*',
                        ),
                    ),
                    dest: normalizePath(resolve(__dirname, 'out/renderer/assets/webfonts')),
                },
                {
                    src: normalizePath(resolve(__dirname, 'node_modules/@mdi/font/fonts/*')),
                    dest: normalizePath(
                        resolve(__dirname, 'src/renderer/src/main/assets/webfonts'),
                    ),
                },
                {
                    src: normalizePath(resolve(__dirname, 'node_modules/@mdi/font/fonts/*')),
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
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'src/renderer/index.html'),
            },
        },
    },
});
