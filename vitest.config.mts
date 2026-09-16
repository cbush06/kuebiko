/// <reference types="vitest" />

import { mergeConfig } from 'vite';
import KuebikoViteConfig from './vite.config';

export default mergeConfig(
    KuebikoViteConfig,
    {
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/renderer/src/test/vitest-setup.ts'],
            deps: {
                optimizer: {
                    client: {
                        include: ['vitest-canvas-mock']
                    }
                }
            }
        },
        publicDir: 'public',
    }
);
