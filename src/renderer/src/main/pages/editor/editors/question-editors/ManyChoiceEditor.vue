<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Options</label>
        </div>
        <div class="field-body is-justify-content-stretch">
            <draggable
                v-model="props.question.options"
                item-key="uuid"
                class="panel is-flex-grow-1"
                handle=".is-draggable"
                drag-class="dragged"
            >
                <template #item="{ element }">
                    <div
                        class="panel-block m-0 p-0"
                        :class="{ 'is-active': props.question.answer?.includes(element.uuid) }"
                    >
                        <div class="is-flex w-100">
                            <div
                                class="is-flex-grow-0"
                                :class="{
                                    'has-background-grey-lighter': !props.question.answer?.includes(
                                        element.uuid,
                                    ),
                                    'has-background-primary': props.question.answer?.includes(
                                        element.uuid,
                                    ),
                                }"
                                style="width: 8px"
                            ></div>
                            <div
                                class="is-flex-grow-0 is-flex is-flex-direction-column is-justify-content-space-between is-align-items-center px-3 py-2"
                            >
                                <div>
                                    <i
                                        class="fa-solid fa-grip-vertical fa-lg has-text-grey-lighter is-draggable"
                                    ></i>
                                </div>
                                <div>
                                    <input
                                        class="is-checkradio"
                                        :name="`${element.uuid}-correctAnswer`"
                                        :id="element.uuid"
                                        :value="element.uuid"
                                        v-model="props.question.answer as string[]"
                                        type="checkbox"
                                    />
                                    <label :for="element.uuid" class="pr-0 pl-4"></label>
                                </div>
                                <div>
                                    <button
                                        class="button is-circle is-white"
                                        @click="() => deleteOption(element)"
                                    >
                                        <i
                                            class="fa-solid fa-trash fa-lg has-text-grey-lighter"
                                        ></i>
                                    </button>
                                </div>
                            </div>
                            <div class="is-flex-grow-1 py-3 pr-3">
                                <ToggleTextEditor
                                    :key="`option-rich-editor-${element.contentRef}`"
                                    v-model="
                                        testEditorStore.resources.get(element.contentRef!)!
                                            .data as string
                                    "
                                    starting-height="8rem"
                                />
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <div class="panel-block">
                        <button
                            class="button is-primary is-outlined is-fullwidth"
                            @click="testEditorStore.appendOption(props.question)"
                        >
                            <i class="fa-solid fa-plus mr-1"></i> Add Option
                        </button>
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>

<script setup lang="ts">
import ToggleTextEditor from '@renderer/components/toggle-text-editor/ToggleTextEditor.vue';
import { Option } from '@renderer/db/models/option';
import { Question } from '@renderer/db/models/question';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import draggable from 'vuedraggable';

interface ManyChoiceEditorProps {
    question: Question;
}

const props = defineProps<ManyChoiceEditorProps>();
const testEditorStore = useTestEditorStore();

const deleteOption = (option: Option) => {
    const idx = props.question.options.findIndex((o) => o.uuid === option.uuid);

    if (idx < 0) return;

    props.question.options.splice(idx, 1);

    const answer = props.question.answer as string[] | undefined;
    if (answer?.includes(option.uuid)) {
        answer?.splice(answer.indexOf(option.uuid), 1);
    }
};
</script>

<style scoped lang="scss">
.dragged {
    background-color: #fff;
    opacity: 0.05 !important;
}
</style>
