import { defineStore } from 'pinia';

export interface HelmetStoreState {
    title?: string;
}

export const useHelmetStore = defineStore('helmet-store', {
    state: () =>
        ({
            title: 'Kuebiko',
        }) as HelmetStoreState,
});
