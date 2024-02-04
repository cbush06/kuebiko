<template>
    <nav class="navbar is-info is-fixed-top navbar-top-content">
        <div class="navbar-brand">
            <div class="navbar-item">
                <img src="../../assets/kuebiko_white.png" />
                <span class="is-size-4 has-text-weight-semibold ml-3">Kuebiko</span>
            </div>
        </div>
        <div class="test-title"><span class="title has-text-white">Some centered content</span></div>
        <div class="navbar-item test-timer">
            <div class="level has-text-white">
                <i class="fa-solid fa-clock"></i>
                <span class="timer is-size-5 ml-2 has-text-weight-semibold">16:35</span>
            </div>
        </div>
    </nav>

    <nav class="navbar navbar-section-header is-primary" v-if="testDeliveryStore.section && !testDeliveryStore.section.default">
        <div class="navbar-item">
            <span class="subtitle has-text-white has-text-weight-semibold">Hello</span>
        </div>
    </nav>

    <div class="container is-max-widescreen">
        <router-view />
    </div>

    <nav class="navbar is-info is-fixed-bottom navbar-bottom-content">
        <div class="prev-button-container">
            <div class="navbar-item">
                <div class="buttons">
                    <button class="button is-primary is-squared" :disabled="!testDeliveryStore.canGoBackward" @click="testDeliveryStore.backward()">
                        <i class="fas fa-arrow-left mr-2"></i> Prev
                    </button>
                </div>
            </div>
        </div>
        <div class="item-count-container">
            <span class="is-size-4 has-text-weight-semibold">
                <i class="fa-solid fa-hashtag"></i>
                1 of 50
            </span>
        </div>
        <div class="next-button-container">
            <div class="navbar-item">
                <div class="buttons">
                    <button class="button is-primary is-squared" :disabled="!testDeliveryStore.canGoForward" @click="testDeliveryStore.forward()">
                        Next <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { Test } from '@renderer/db/models/test';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { QuestionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/question-delivery-item';
import { SectionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/section-delivery-item';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { TestDeliveryStoreInitializer } from '@renderer/store/test-delivery-store/test-delivery-store-initializer';
import { useObservable, from } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CannotNavigateError } from './errors/cannot-navigate-error';

const router = useRouter();
const route = useRoute();
const testDeliveryStore = useTestDeliveryStore();

const test = useObservable(
    from(liveQuery<Test | undefined>(async () => await KuebikoDb.INSTANCE.tests.where('uuid').equals(route.params['testUuid']).first())),
);

watch(test, () => TestDeliveryStoreInitializer.initializeTestDeliveryStore(test.value!));

watch(
    () => testDeliveryStore.deliveryItem,
    () => {
        const item = testDeliveryStore.deliveryItem;
        if (item instanceof QuestionDeliveryItem) {
            handleQuestion(item);
        } else if (item instanceof SectionDeliveryItem) {
            handleSection(item);
        }
    },
);

const handleSection = (sdi: SectionDeliveryItem) => {
    const section = sdi.getModel();
    if (section.default) {
        if (!testDeliveryStore.canGoForward) throw new CannotNavigateError('forward');
        testDeliveryStore.forward();
        return;
    }
    router.push(sdi.getPath());
};

const handleQuestion = (qdi: QuestionDeliveryItem) => {
    router.push(qdi.getPath());
};
</script>

<style scoped lang="scss">
.navbar-top-content {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    .test-title {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .test-timer {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
    }
}

.navbar-section-header {
    height: 2.5rem !important;
    min-height: 2.5rem !important;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.navbar-bottom-content {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    .prev-button-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .item-count-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .next-button-container {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
    }
}
</style>
