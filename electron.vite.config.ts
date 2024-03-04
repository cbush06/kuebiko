import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';
import { normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
                            resolve(
                                __dirname,
                                'node_modules/@fortawesome/fontawesome-free/webfonts/*',
                            ),
                        ),
                        dest: normalizePath(
                            resolve(__dirname, 'src/renderer/src/main/assets/public/webfonts'),
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
    },
});
