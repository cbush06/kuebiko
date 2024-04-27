<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Options</label>
        </div>
        <div class="field-body is-justify-content-stretch">
            <div class="panel is-flex-grow-1">
                <div class="panel-block" v-for="o in props.question.options">
                    <div class="is-flex w-100">
                        <div class="is-flex-grow-0 pl-2">
                            <input
                                class="is-checkradio"
                                name="correctAnswer"
                                :id="o.uuid"
                                :value="o.uuid"
                                v-model="props.question.answer"
                                type="radio"
                            />
                            <label :for="o.uuid"></label>
                        </div>
                        <div class="is-flex-grow-1">
                            <ToggleTextEditor
                                :key="`option-rich-editor-${o.contentRef}`"
                                v-model="
                                    testEditorStore.resources.get(o.contentRef!)!.data as string
                                "
                                starting-height="8rem"
                            />
                        </div>
                    </div>
                </div>
                <div class="panel-block">
                    <button
                        class="button is-primary is-outlined is-fullwidth"
                        @click="testEditorStore.appendOption(props.question)"
                    >
                        <i class="fa-solid fa-plus mr-1"></i> Add Option
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ToggleTextEditor from '@renderer/components/toggle-text-editor/ToggleTextEditor.vue';
import { Question } from '@renderer/db/models/question';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';

interface MultipleChoiceEditorProps {
    question: Question;
}

const props = defineProps<MultipleChoiceEditorProps>();
const testEditorStore = useTestEditorStore();
</script>

<style scoped lang="scss"></style>
