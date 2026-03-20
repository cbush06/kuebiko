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
            v-model="selection as string"
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
            v-model="selection as string[]"
            :reveal-answer="revealAnswer"
        />
        <HotSpot
            v-else-if="questionDeliveryItem?.getType() === 'HOTSPOT'"
            :question-ref="questionDeliveryItem.getModel().questionRef"
            :subject-image-data="subjectImageData"
            :subject-image-mime="subjectImageType"
            :question-content="questionContent"
            :hot-zones="(questionDeliveryItem?.getCorrectResponse() as Point[][]) ?? []"
            :success-feedback="successFeedbackContent"
            :failure-feedback="failureFeedbackContent"
            v-model="selection as Point[][]"
            :reveal-answer="revealAnswer"
        />
    </div>
</template>

<script setup lang="ts">
import ManyChoice from '@renderer/components/question-renderers/ManyChoice.vue';
import MultipleChoice from '@renderer/components/question-renderers/MultipleChoice.vue';
import { AnswerType } from '@renderer/db/models/answer';
import { QuestionDeliveryItem } from '@renderer/store/test-delivery-store/delivery-item/question-delivery-item';
import { useTestDeliveryStore } from '@renderer/store/test-delivery-store/test-delivery-store';
import { onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { DeliveryTestObjectProvider } from '@renderer/services/delivery-test-object-provider';
import HotSpot from '@renderer/components/question-renderers/HotSpot.vue';
import { Point } from '@renderer/db/models/point';
import { Resource } from '@renderer/db/models/resource';

const testDeliveryStore = useTestDeliveryStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });
const questionContent = ref(t('noQuestionContent'));
const successFeedbackContent = ref<string>();
const failureFeedbackContent = ref<string>();
const subjectImageData = ref<Uint8Array>();
const subjectImageType = ref<string>();
const selection = ref<AnswerType>();
const questionDeliveryItem = ref<QuestionDeliveryItem | undefined>();
const revealAnswer = ref(false);

const updateQuestionDetails = async (newDeliveryItem?: QuestionDeliveryItem) => {
    questionDeliveryItem.value = newDeliveryItem as QuestionDeliveryItem;
    selection.value = questionDeliveryItem.value?.getModel().response;

    const questionContentResource = (
        await DeliveryTestObjectProvider.fetchResource(newDeliveryItem?.getContentRef() ?? 'nonce')
    )?.data as string;
    questionContent.value = questionContentResource ?? t('noQuestionContent');

    const subjectImageResource = (await DeliveryTestObjectProvider.fetchResource(
        newDeliveryItem?.getSubjectImageRef() ?? 'nonce',
    )) as Resource | undefined;
    if (subjectImageResource) {
        subjectImageData.value = subjectImageResource.data as Uint8Array;
        subjectImageType.value = subjectImageResource.mime as string;
    }

    const successFeedbackContentResource = (
        await DeliveryTestObjectProvider.fetchResource(
            newDeliveryItem?.getSuccessFeedbackRef() ?? 'nonce',
        )
    )?.data as string;
    successFeedbackContent.value =
        questionDeliveryItem.value?.getSuccessFeedbackText() ?? successFeedbackContentResource;

    const failureFeedbackContentResource = (
        await DeliveryTestObjectProvider.fetchResource(
            newDeliveryItem?.getFailureFeedbackRef() ?? 'nonce',
        )
    )?.data as string;
    failureFeedbackContent.value =
        questionDeliveryItem.value?.getFailureFeedbackText() ?? failureFeedbackContentResource;
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
