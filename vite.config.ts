///////////////////////////////////////////////////////////////////
//  This file is only here to get webstorm to recognize aliases  //
///////////////////////////////////////////////////////////////////

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { NodePackageImporter } from 'sass-embedded';
import { defineConfig, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
            {
                find: 'dexie',
                replacement: 'dexie/dist/dexie.mjs',
            },
        ],
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
                        resolve(__dirname, 'src/renderer/src/main/assets/webfonts'),
                    ),
                },
                {
                    src: normalizePath(
                        resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts/*'),
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
    css: {
        preprocessorOptions: {
            sass: {
                quietDeps: true,
                silenceDeprecations: ['legacy-js-api', 'color-functions'],
                importers: [new NodePackageImporter()],
            },
            scss: {
                quietDeps: true,
                silenceDeprecations: ['legacy-js-api', 'color-functions'],
                importers: [new NodePackageImporter()],
            },
        },
    },
});
