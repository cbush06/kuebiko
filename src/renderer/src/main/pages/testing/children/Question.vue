<template>
    <div class="section content">
        <!-- prettier-ignore -->
        <MultipleChoice 
            v-if="questionDeliveryItem?.getType() === 'MULTIPLE'"
            :question-ref="questionDeliveryItem.getModel().questionRef"
            :question-content="questionContent" 
            :options="questionDeliveryItem?.getOptions() ?? []"
            :correct-response="questionDeliveryItem?.getCorrectResponse() as string ?? ''"
            :success-feedback="successFeedbackContent"
            :failure-feedback="failureFeedbackContent"
            v-model="selection"
            :reveal-answer="revealAnswer"
        />
        <ManyChoice
            v-else-if="questionDeliveryItem?.getType() === 'MANY'"
            :question-ref="questionDeliveryItem.getModel().questionRef"
            :question-content="questionContent"
            :options="questionDeliveryItem?.getOptions() ?? []"
            :correct-response="(questionDeliveryItem?.getCorrectResponse() as string[]) ?? []"
            :success-feedback="successFeedbackContent"
            :failure-feedback="failureFeedbackContent"
            v-model="selection"
            :reveal-answer="revealAnswer"
        />
    </div>
</template>

<script setup lang="ts">
import ManyChoice from '@renderer/components/question-renderers/ManyChoice.vue';
import MultipleChoice from '@renderer/components/question-renderers/MultipleChoice.vue';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { AnswerType } from '@renderer/db/models/answer';
import { QuestionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/question-delivery-item';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });
const questionContent = ref(t('noQuestionContent'));
const successFeedbackContent = ref<string>();
const failureFeedbackContent = ref<string>();
const selection = ref<AnswerType>();
const questionDeliveryItem = ref<QuestionDeliveryItem | undefined>();
const revealAnswer = ref(false);

const updateQuestionDetails = async (newDeliveryItem?: QuestionDeliveryItem) => {
    const questionContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(newDeliveryItem?.getContentRef() ?? 'nonce')
            .first()
    )?.data as string;
    questionContent.value =
        questionDeliveryItem.value?.getContentText() ??
        questionContentResource ??
        t('noQuestionContent');

    const successFeedbackContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(newDeliveryItem?.getSuccessFeedbackRef() ?? 'nonce')
            .first()
    )?.data as string;
    successFeedbackContent.value =
        questionDeliveryItem.value?.getSuccessFeedbackText() ?? successFeedbackContentResource;

    const failureFeedbackContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(newDeliveryItem?.getFailureFeedbackRef() ?? 'nonce')
            .first()
    )?.data as string;
    failureFeedbackContent.value =
        questionDeliveryItem.value?.getFailureFeedbackText() ?? failureFeedbackContentResource;

    questionDeliveryItem.value = newDeliveryItem as QuestionDeliveryItem;
    selection.value = questionDeliveryItem.value?.getModel().response;
};

onBeforeMount(() => updateQuestionDetails(testDeliveryStore.deliveryItem as QuestionDeliveryItem));
watch(
    () => testDeliveryStore.deliveryItem as QuestionDeliveryItem,
    (newDeliveryItem) =>
        testDeliveryStore.deliveryItem instanceof QuestionDeliveryItem &&
        updateQuestionDetails(newDeliveryItem),
);
watch(
    () => testDeliveryStore.deliveryItem?.isRevealed(),
    (newRevealed) => {
        revealAnswer.value = !!newRevealed;
    },
);
watch(selection, () => {
    if (questionDeliveryItem.value) {
        questionDeliveryItem.value.getModel().response = selection.value;
    }
});

testDeliveryStore.deliveryItem?.visit();
</script>

<style scoped></style>

<i18n lang="json"></i18n>
@renderer/db/kuebiko-db@renderer/db/models/answer@renderer/store/test-delivery-store/delivery-item/question-delivery-item@renderer/store/test-delivery-store/test-delivery-store
