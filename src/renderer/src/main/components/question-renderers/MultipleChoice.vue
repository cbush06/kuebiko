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
        <div v-for="opt in options" class="block">
            <div
                class="field exam-field"
                :data-testid="`field-${opt.uuid}`"
                :class="{
                    'has-background-success-light':
                        props.revealAnswer &&
                        MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(
                            props.correctResponse,
                            opt.uuid,
                        ),
                    'has-background-danger-light':
                        props.revealAnswer &&
                        !MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(
                            props.correctResponse,
                            opt.uuid,
                        ),
                }"
            >
                <input
                    :id="opt.uuid"
                    :key="opt.uuid"
                    class="is-checkradio is-flex-grow-0"
                    :data-testid="`radio-${opt.uuid}`"
                    type="radio"
                    :name="`${props.questionRef}-option`"
                    :value="opt.uuid"
                    v-model="model"
                    :disabled="props.revealAnswer"
                />
                <label
                    :for="opt.uuid"
                    class="exam-choice"
                    :data-testid="`label-${opt.uuid}`"
                    :class="{
                        'has-text-success-dark':
                            props.revealAnswer &&
                            MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(
                                props.correctResponse,
                                opt.uuid,
                            ),
                        'has-text-danger-dark':
                            props.revealAnswer &&
                            !MULTIPLE_CHOICE_EVALUATOR.isSingleResponseCorrect(
                                props.correctResponse,
                                opt.uuid,
                            ),
                    }"
                >
                    <!-- prettier-ignore -->
                    <MdPreview 
                        :modelValue="opt.content" 
                        noMermaid 
                        noKatex 
                        noHighlight 
                        noIconfont 
                    />
                </label>
            </div>
            <div class="has-background-info-light p-2" v-if="props.revealAnswer && opt.explanation">
                <div class="columns">
                    <div
                        class="column is-1 is-flex is-flex-direction-row is-justify-content-center is-align-items-center has-text-info-dark is-size-4"
                    >
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
        v-if="
            props.revealAnswer &&
            props.successFeedback &&
            MULTIPLE_CHOICE_EVALUATOR.evaluate(props.correctResponse, model as string) === 1
        "
        data-testid="successFeedback"
    >
        <div class="message-body">
            <MdPreview
                :modelValue="props.successFeedback"
                noMermaid
                noKatex
                noHighlight
                noIconfont
            />
        </div>
    </div>
    <div
        class="message is-danger"
        v-if="
            props.revealAnswer &&
            props.failureFeedback &&
            MULTIPLE_CHOICE_EVALUATOR.evaluate(props.correctResponse, model as string) !== 1
        "
        data-testid="failureFeedback"
    >
        <div class="message-body">
            <MdPreview
                :modelValue="props.failureFeedback"
                noMermaid
                noKatex
                noHighlight
                noIconfont
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Option } from '@renderer/db/models/option';
import { ResourcesService } from '@renderer/services/resources-service';
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
            if (o.contentText)
                return {
                    uuid: o.uuid,
                    content: o.contentText,
                    explanation: o.explanation,
                } as MultipleChoiceOption;
            else
                return {
                    uuid: o.uuid,
                    content: (await ResourcesService.fetchResource(o.contentRef ?? 'nonce'))
                        ?.data as string,
                    explanation: o.explanation,
                } as MultipleChoiceOption;
        }),
    );
};
watch(props, updateOptions);

onBeforeMount(() => updateOptions(props));
</script>

<style scoped lang="scss">
@import '~/bulma/bulma.sass';
@import '@renderer/scss/bulma-customizations.scss';

.exam-field {
    @extend .p-0, .m-0, .is-flex, .is-flex-direction-row, .is-align-items-center;

    .is-checkradio[type='radio'] {
        & + label {
            @extend .has-border-1, .is-grey-darker-border;
        }

        &:not([disabled]) + label:hover {
            @extend .is-primary-border, .has-text-primary;
        }
    }
}

.exam-choice {
    @extend .is-flex-grow-1, .pr-3, .pt-3, .pb-3, .m-0, .pl-6;

    &::before {
        left: 0.75rem !important;
        top: 50% !important;
        transform: translateY(-50%);
    }

    &::after {
        left: 0.75rem !important;
        top: 50% !important;
        transform: scale(0.5) translateY(-50%) !important;
        transform-origin: center top;
    }
}
</style>
