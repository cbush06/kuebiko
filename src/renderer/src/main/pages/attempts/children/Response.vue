<template>
    <div class="block has-ribbon-left response-container">
        <div
            class="ribbon is-large is-wide"
            :class="{
                'is-success': props.response?.credit === 1,
                'is-danger': (props.response?.credit ?? 0) < 1 && props.response?.response,
                'is-grey-dark has-text-white': (props.response?.credit ?? 0) < 1 && !props.response?.response,
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
                    v-model="answer"
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
                    v-model="answer"
                    :options="question.options ?? []"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ManyChoice from '@renderer/components/question-renderers/ManyChoice.vue';
import MultipleChoice from '@renderer/components/question-renderers/MultipleChoice.vue';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { AnswerType } from '@renderer/db/models/answer';
import { Question } from '@renderer/db/models/question';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

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
    const questionContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(props.question?.contentRef ?? 'nonce')
            .first()
    )?.data as string;
    questionContent.value = props.question?.contentText ?? questionContentResource ?? t('noQuestionContent');

    const successFeedbackContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(props.question?.successFeedbackRef ?? 'nonce')
            .first()
    )?.data as string;
    successFeedback.value = props.question?.successFeedbackText ?? successFeedbackContentResource;

    const failureFeedbackContentResource = (
        await KuebikoDb.INSTANCE.resources
            .where('uuid')
            .equals(props.question?.failureFeedbackRef ?? 'nonce')
            .first()
    )?.data as string;
    failureFeedback.value = props.question?.failureFeedbackText ?? failureFeedbackContentResource;
});
</script>

<style scoped lang="scss">
.response-container {
    min-height: 4rem;
}
</style>
@renderer/db/kuebiko-db@renderer/db/models/answer@renderer/db/models/question@renderer/db/models/question-response
