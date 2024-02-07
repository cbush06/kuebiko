/// <reference types="vitest" />

////////////////////////////////////////////////
//  This file is only here to support vitest  //
////////////////////////////////////////////////

import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@renderer': resolve('src/renderer/src'),
            '~': resolve('node_modules'),
        },
    },
    plugins: [
        vue(),
        viteStaticCopy({
            targets: [
                {
                    src: normalizePath(resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts/*')),
                    dest: normalizePath(resolve(__dirname, 'src/renderer/src/assets/public/webfonts')),
                },
                {
                    src: normalizePath(resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts/*')),
                    dest: normalizePath(resolve(__dirname, 'out/renderer/assets/webfonts')),
                },
            ],
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'src/renderer/index.html'),
            },
        },
    },
    publicDir: 'public',
});
