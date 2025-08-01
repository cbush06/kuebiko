import { VueI18n } from '@renderer/vue-config/vuei18n/vuei18n';
import * as matchers from '@testing-library/jest-dom/matchers';
import { config } from '@vue/test-utils';
import 'vitest-canvas-mock';
import { createTestingPinia } from '@pinia/testing';

expect.extend(matchers);

config.global.plugins = [VueI18n, createTestingPinia()];
