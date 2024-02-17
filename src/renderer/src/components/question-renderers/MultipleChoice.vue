<template>
    <div class="content block">
        <!-- prettier-ignore -->
        <MdPreview 
            :modelValue="props.questionContent" 
            noMermaid 
            noKatex 
            noHighlight 
            noIconfont 
        />
    </div>
    <div class="block">
        <div v-for="opt in options" class="block has-border-1 is-grey-darker-border">
            <div
                class="field p-2 m-0"
                :class="{
                    'has-background-success-light': props.revealAnswer && MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(props.correctResponse, opt.uuid),
                    'has-background-danger-light': props.revealAnswer && !MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(props.correctResponse, opt.uuid),
                }"
            >
                <input
                    :id="opt.uuid"
                    :key="opt.uuid"
                    class="is-checkradio"
                    type="radio"
                    :name="`${props.questionRef}-option`"
                    :value="opt.uuid"
                    v-model="model"
                    :disabled="props.revealAnswer"
                />
                <label
                    :for="opt.uuid"
                    :class="{
                        'has-text-success-dark': props.revealAnswer && MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(props.correctResponse, opt.uuid),
                        'has-text-danger-dark': props.revealAnswer && !MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(props.correctResponse, opt.uuid),
                    }"
                >
                    {{ opt.content }}
                </label>
            </div>
            <div class="has-background-info-light p-2" v-if="props.revealAnswer && opt.explanation">
                <div class="columns">
                    <div class="column is-1 is-flex is-flex-direction-row is-justify-content-center is-align-items-center has-text-info-dark is-size-4">
                        <i class="fa-solid fa-circle-info"></i>
                    </div>
                    <div class="column is-11 has-text-info-dark">
                        {{ opt.explanation }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div
        class="message is-success"
        v-if="props.revealAnswer && props.successFeedback && MULTIPLE_CHOICE_EVALUATOR.evaluate(props.correctResponse, model as string) === 1"
    >
        <div class="message-body">
            <MdPreview :modelValue="props.successFeedback" noMermaid noKatex noHighlight noIconfont />
        </div>
    </div>
    <div
        class="message is-danger"
        v-if="props.revealAnswer && props.failureFeedback && MULTIPLE_CHOICE_EVALUATOR.evaluate(props.correctResponse, model as string) !== 1"
    >
        <div class="message-body">
            <MdPreview :modelValue="props.failureFeedback" noMermaid noKatex noHighlight noIconfont />
        </div>
    </div>
</template>

<script setup lang="ts">
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Option } from '@renderer/db/models/option';
import { MULTIPLE_CHOICE_EVALUATOR } from '@renderer/store/test-delivery-store/question-evaluators/multiple-choice-evaluator';
import { MdPreview } from 'md-editor-v3';
import { onBeforeMount, ref, watch } from 'vue';
import { RendererBaseProps } from './renderer-base-props';

export interface MultipleChoiceProps extends RendererBaseProps {
    correctResponse: string;
    options: Array<Option>;
}

export interface MultipleChoiceOption {
    uuid: string;
    content: string;
    explanation?: string;
}

const props = defineProps<MultipleChoiceProps>();
const model = defineModel({ default: '' });

const options = ref<Array<MultipleChoiceOption>>([]);
const updateOptions = async (newProps: MultipleChoiceProps) => {
    options.value = await Promise.all(
        newProps.options.map(async (o) => {
            if (o.contentText) return Promise.resolve({ uuid: o.uuid, content: o.contentText, explanation: o.explanation } as MultipleChoiceOption);
            else
                return {
                    uuid: o.uuid,
                    content: (
                        await KuebikoDb.INSTANCE.resources
                            .where('uuid')
                            .equals(o.contentRef ?? 'nonce')
                            .first()
                    )?.data as string,
                    explanation: o.explanation,
                };
        }),
    );
};
watch(props, updateOptions);

onBeforeMount(() => updateOptions(props));
</script>

<style scoped></style>
