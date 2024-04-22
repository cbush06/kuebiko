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
                :class="{
                    'has-background-success-light':
                        props.revealAnswer &&
                        MANY_CHOICE_EVALUATOR.isSingleResponseCorrect(
                            props.correctResponse,
                            opt.uuid,
                        ),
                    'has-background-danger-light':
                        props.revealAnswer &&
                        !MANY_CHOICE_EVALUATOR.isSingleResponseCorrect(
                            props.correctResponse,
                            opt.uuid,
                        ),
                }"
                :data-testid="`field-${opt.uuid}`"
            >
                <input
                    :id="opt.uuid"
                    :key="opt.uuid"
                    :data-testid="`checkbox-${opt.uuid}`"
                    class="is-checkradio"
                    type="checkbox"
                    :name="opt.uuid"
                    :value="opt.uuid"
                    v-model="model"
                    :disabled="props.revealAnswer"
                />
                <label
                    :for="opt.uuid"
                    :data-testid="`label-${opt.uuid}`"
                    class="exam-choice"
                    :class="{
                        'has-text-success-dark':
                            props.revealAnswer &&
                            MANY_CHOICE_EVALUATOR.isSingleResponseCorrect(
                                props.correctResponse,
                                opt.uuid,
                            ),
                        'has-text-danger-dark':
                            props.revealAnswer &&
                            !MANY_CHOICE_EVALUATOR.isSingleResponseCorrect(
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
            MANY_CHOICE_EVALUATOR.evaluate(props.correctResponse, model) === 1
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
            MANY_CHOICE_EVALUATOR.evaluate(props.correctResponse, model) !== 1
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
import { MANY_CHOICE_EVALUATOR } from '@renderer/store/test-delivery-store/question-evaluators/many-choice-evaluator';
import { MdPreview } from 'md-editor-v3';
import { onBeforeMount, ref, watch } from 'vue';
import { RendererBaseProps } from './renderer-base-props';

export interface ManyChoiceProps extends RendererBaseProps {
    correctResponse: string[];
    options: Array<Option>;
}

const somefunc = () => 'testme';

export interface ManyChoiceOption {
    uuid: string;
    content: string;
    explanation?: string;
}

const props = defineProps<ManyChoiceProps>();
const model = defineModel({ default: new Array<string>() });

const options = ref<Array<ManyChoiceOption>>([]);
const updateOptions = async (newProps: ManyChoiceProps) => {
    options.value = await Promise.all(
        newProps.options.map(
            async (o) =>
                ({
                    uuid: o.uuid,
                    content: (await ResourcesService.fetchResource(o.contentRef ?? 'nonce'))
                        ?.data as string,
                    explanation: o.explanation,
                }) as ManyChoiceOption,
        ),
    );
};
watch(props, updateOptions);

onBeforeMount(async () => await updateOptions(props));
</script>

<style scoped lang="scss">
@import '~/bulma/bulma.sass';
@import '@renderer/scss/bulma-customizations.scss';

.exam-field {
    @extend .p-0, .m-0, .is-flex, .is-flex-direction-row, .is-align-items-center;

    .is-checkradio[type='checkbox'] {
        & + label {
            @extend .has-border-1, .is-grey-darker-border;
        }

        &:not([disabled]) + label:hover {
            @extend .is-primary-border, .has-text-primary;
        }
    }
}

.exam-choice {
    @extend .content, .is-flex-grow-1, .pr-3, .pt-3, .pb-3, .m-0, .pl-6;

    &::before {
        left: 0.75rem !important;
        top: 50% !important;
        transform: translateY(-50%);
    }

    &::after {
        left: 1.3rem !important;
        top: 48% !important;
        transform: rotate(45deg) translateY(-50%) !important;
        transform-origin: center top;
    }
}
</style>
