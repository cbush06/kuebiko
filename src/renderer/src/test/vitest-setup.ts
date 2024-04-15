import { createTestingPinia } from '@pinia/testing';
import { VueI18n } from '@renderer/vue-config/vuei18n/vuei18n';
import * as matchers from '@testing-library/jest-dom/matchers';
import { config } from '@vue/test-utils';
import { expect } from 'vitest';
import 'vitest-canvas-mock';

expect.extend(matchers);

config.global.plugins = [VueI18n, createTestingPinia()];
