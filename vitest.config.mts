/// <reference types="vitest" />

////////////////////////////////////////////////
//  This file is only here to support vitest  //
////////////////////////////////////////////////

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
                    web: {
                        include: ['vitest-canvas-mock']
                    }
                }
            }
        },
        publicDir: 'public',
    }
);
