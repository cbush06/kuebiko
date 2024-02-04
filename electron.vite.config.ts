import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/main/index.ts'),
                },
            },
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/preload/index.ts'),
                },
            },
        },
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
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
            VueI18nPlugin({
                include: 'json',
            }),
        ],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/renderer/index.html'),
                },
            },
        },
        test: {
            coverage: {
                reporter: ['lcov'],
            },
        },
    },
});
