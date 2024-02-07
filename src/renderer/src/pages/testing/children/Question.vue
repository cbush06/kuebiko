<template>
    <div class="section content">
        <!-- prettier-ignore -->
        <MultipleChoice 
            v-if="questionDeliveryItem?.getType() === 'MULTIPLE'"
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
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { QuestionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/question-delivery-item';
import { onBeforeMount } from 'vue';
import MultipleChoice from '@renderer/components/question-renderers/MultipleChoice.vue';
import { AnswerType } from '@renderer/db/models/answer';
import ManyChoice from '@renderer/components/question-renderers/ManyChoice.vue';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local' });
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
    questionContent.value = questionDeliveryItem.value?.getContentText() ?? questionContentResource ?? t('noQuestionContent');

    const successFeedbackContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(newDeliveryItem?.getSuccessFeedbackRef() ?? 'nonce')
            .first()
    )?.data as string;
    successFeedbackContent.value = questionDeliveryItem.value?.getSuccessFeedbackText() ?? successFeedbackContentResource;

    const failureFeedbackContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(newDeliveryItem?.getFailureFeedbackRef() ?? 'nonce')
            .first()
    )?.data as string;
    failureFeedbackContent.value = questionDeliveryItem.value?.getFailureFeedbackText() ?? failureFeedbackContentResource;

    questionDeliveryItem.value = newDeliveryItem as QuestionDeliveryItem;
    selection.value = questionDeliveryItem.value.getModel().response;
};

onBeforeMount(() => updateQuestionDetails(testDeliveryStore.deliveryItem as QuestionDeliveryItem));
watch(() => testDeliveryStore.deliveryItem as QuestionDeliveryItem, updateQuestionDetails);
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

<i18n lang="json">
{
    "en": {
        "noQuestionContent": "Uh oh! There was no question content for this item."
    }
}
</i18n>
