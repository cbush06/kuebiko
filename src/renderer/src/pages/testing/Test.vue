<template>
    <nav class="navbar is-info is-fixed-top navbar-top-content">
        <div class="navbar-brand">
            <div class="navbar-item">
                <img src="../../assets/kuebiko_white.png" />
                <span class="is-size-4 has-text-weight-semibold ml-3">Kuebiko</span>
            </div>
        </div>
        <div class="test-title">
            <span class="title has-text-white">{{ test?.title }}</span>
        </div>
        <div class="navbar-item test-timer">
            <div class="level has-text-white">
                <i class="fa-solid fa-clock"></i>
                <span class="timer is-size-5 ml-2 has-text-weight-semibold">16:35</span>
            </div>
        </div>
    </nav>

    <nav class="navbar navbar-section-header is-primary" v-if="testDeliveryStore.section && !testDeliveryStore.section.default">
        <div class="navbar-item">
            <span class="subtitle has-text-white has-text-weight-semibold">{{ testDeliveryStore.section?.title }}</span>
        </div>
    </nav>

    <div class="container is-max-widescreen">
        <router-view />
    </div>

    <nav class="navbar is-info is-fixed-bottom navbar-bottom-content">
        <div class="prev-button-container">
            <div class="navbar-item">
                <div class="buttons">
                    <button
                        v-if="!testDeliveryStore.completed"
                        class="button is-link is-radiusless"
                        :disabled="!testDeliveryStore.canGoBackward"
                        @click="testDeliveryStore.backward()"
                    >
                        <i class="fas fa-arrow-left mr-2"></i> Prev
                    </button>
                </div>
            </div>
        </div>
        <div class="item-count-container">
            <span v-if="testDeliveryStore.currentQuestionNumber > 0 && !testDeliveryStore.completed" class="is-size-5 has-text-weight-semibold">
                <i class="fa-solid fa-hashtag"></i>
                {{ testDeliveryStore.currentQuestionNumber }}
                of
                {{ testDeliveryStore.totalQuestions }}
            </span>
        </div>
        <div class="next-button-container">
            <div class="navbar-item">
                <div class="buttons">
                    <button
                        v-if="testDeliveryStore.format === 'PREPARE' && testDeliveryStore.deliveryItem && !testDeliveryStore.deliveryItem?.isRevealed()"
                        class="button is-success is-radiusless"
                        @click="testDeliveryStore.deliveryItem?.setRevealed()"
                    >
                        Grade <i class="fa-solid fa-file-circle-check ml-2"></i>
                    </button>
                    <button v-else-if="testDeliveryStore.canGoForward" class="button is-link is-radiusless" @click="testDeliveryStore.forward()">
                        Next <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                    <button v-else-if="!testDeliveryStore.completed" class="button is-success is-radiusless" @click="finishTest()">
                        Finish <i class="fas fa-check ml-2"></i>
                    </button>
                    <button v-else="testDeliveryStore.completed" class="button is-success is-radiusless" @click="router.push('/')">
                        Go Home <i class="fas fa-house ml-2"></i>
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
import { inject, ref, toRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CannotNavigateError } from './errors/cannot-navigate-error';
import { onBeforeMount } from 'vue';
import { BulmaToastService, BulmaToast } from '@renderer/vue-config/bulma-toast/bulma-toast';
import { onUnmounted } from 'vue';

const router = useRouter();
const route = useRoute();
const testDeliveryStore = useTestDeliveryStore();
const test = ref<Test | undefined>();
const $toast = inject<BulmaToastService>(BulmaToast)!;

const updateTest = async (uuid: string) => {
    test.value = await KuebikoDb.INSTANCE.tests.where('uuid').equals(uuid).first();
};

onBeforeMount(async () => {
    await updateTest(route.params['testUuid'] as string);
    if (test) TestDeliveryStoreInitializer.initializeTestDeliveryStore(test.value!);
});

onUnmounted(() => (test.value = undefined));

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

const saveAttempt = async () => {
    if (!testDeliveryStore.attempt) {
        throw new Error('Uh oh! Something went wrong and your attempt results cannot be saved.');
    }
    testDeliveryStore.complete();
    await KuebikoDb.INSTANCE.attempts.add(toRaw(testDeliveryStore.attempt));
};

const finishTest = async () => {
    try {
        await saveAttempt();
        router.push(`/test/${route.params['testUuid']}/results`);
    } catch (e) {
        $toast.danger({ message: 'Uh oh! Something went wrong and your attempt results cannot be saved.' });
        console.error(e);
    }
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
