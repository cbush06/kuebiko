import { defineStore } from 'pinia';
import { TestEngineOptions } from '../test-delivery-store/test-delivery-store-initializer';

export const useTestConfigurationStore = defineStore('test-configuration', {
    state: () =>
        ({
            format: 'SIMULATE',
            order: 'ORIGINAL',
            filter: undefined,
            duration: 0,
            maxQuestions: undefined,
        }) as Partial<TestEngineOptions>,
    getters: {},
    actions: {
        reset() {
            this.format = 'SIMULATE';
            this.order = 'ORIGINAL';
            this.filter = undefined;
            this.maxQuestions = undefined;
            this.duration = 0;
        },
    },
});
