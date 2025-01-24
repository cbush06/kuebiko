<template>
    <div class="block has-ribbon-left response-container">
        <div
            class="ribbon is-large is-wide"
            :class="{
                'is-success': props.response?.credit === 1,
                'is-danger': (props.response?.credit ?? 0) < 1 && props.response?.response,
                'is-grey-dark has-text-white':
                    (props.response?.credit ?? 0) < 1 && !props.response?.response,
            }"
        >
            {{ props.questionNumber }}
        </div>
        <div class="columns pr-5 pb-4 pt-1">
            <div class="column pl-6 is-11 is-offset-1">
                <MultipleChoice
                    v-if="question?.type === 'MULTIPLE'"
                    :question-ref="props.question?.uuid ?? ''"
                    :question-content="questionContent"
                    :correct-response="(correctResponse as string) ?? ''"
                    :success-feedback="successFeedback"
                    :failure-feedback="failureFeedback"
                    :reveal-answer="true"
                    v-model="answer as string"
                    :options="props.question?.options ?? []"
                />
                <ManyChoice
                    v-else-if="question?.type === 'MANY'"
                    :question-ref="props.question?.uuid ?? ''"
                    :question-content="questionContent"
                    :correct-response="(correctResponse as string[]) ?? []"
                    :success-feedback="successFeedback"
                    :failure-feedback="failureFeedback"
                    :reveal-answer="true"
                    v-model="answer as string[]"
                    :options="question.options ?? []"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ManyChoice from '@renderer/components/question-renderers/ManyChoice.vue';
import MultipleChoice from '@renderer/components/question-renderers/MultipleChoice.vue';
import { AnswerType } from '@renderer/db/models/answer';
import { Question } from '@renderer/db/models/question';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { DeliveryTestObjectProvider } from '@renderer/services/delivery-test-object-provider';

interface ResponseProps {
    questionNumber: number;
    response?: QuestionResponse;
    question?: Question;
}

const { t } = useI18n();

const props = defineProps<ResponseProps>();

const questionContent = ref<string>('');
const correctResponse = computed(() => props.question?.answer);
const successFeedback = ref<string>();
const failureFeedback = ref<string>();
const answer = ref<AnswerType | undefined>(props.response?.response);

watchEffect(async () => {
    try {
        const questionContentResource = (
            await DeliveryTestObjectProvider.fetchResource(props.question?.contentRef ?? 'nonce')
        )?.data as string;
        questionContent.value = questionContentResource ?? t('noQuestionContent');

        const successFeedbackContentResource = (
            await DeliveryTestObjectProvider.fetchResource(
                props.question?.successFeedbackRef ?? 'nonce',
            )
        )?.data as string;
        successFeedback.value =
            props.question?.successFeedbackText ?? successFeedbackContentResource;

        const failureFeedbackContentResource = (
            await DeliveryTestObjectProvider.fetchResource(
                props.question?.failureFeedbackRef ?? 'nonce',
            )
        )?.data as string;
        failureFeedback.value =
            props.question?.failureFeedbackText ?? failureFeedbackContentResource;
    } catch (e) {
        console.log(e);
    }
});
</script>

<style scoped lang="scss">
.response-container {
    min-height: 4rem;
}
</style>
