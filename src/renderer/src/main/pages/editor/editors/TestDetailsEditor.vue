<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Title</label>
        </div>
        <div class="field-body">
            <input
                type="text"
                class="input"
                placeholder="Untitled"
                v-model="testEditorStore.test.title"
            />
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Description</label>
        </div>
        <div class="field-body">
            <div class="field">
                <div id="description-div" class="control">
                    <MilkdownEditor v-model="description" />
                </div>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Authors</label>
        </div>
        <div class="field-body">
            <!-- prettier-ignore -->
            <TableVue
                :data="testEditorStore.test.authors"
                :columns="authorColumns"
                mode="edit"
            >
                <template #controls="{ row }">
                    <button class="button is-rounded is-danger" @click="testEditorStore.removeAuthor(row)" title="Delete">
                        <span class="icon is-small">
                            <i class="fa fa-trash fa-sm"></i>
                        </span>
                    </button>
                </template>
                <template #footer>
                    <button class="button is-rounded is-success" @click="testEditorStore.addAuthor({ name: '', email: '' })" title="Add Author">
                        <span class="icon is-small">
                            <i class="fa fa-plus fa-sm"></i>
                        </span>
                        <span>Add Author</span>
                    </button>
                </template>
            </TableVue>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Tags</label>
        </div>
        <div class="field-body">
            <vue-tags-input
                v-model="tag"
                :tags="tags"
                @tags-changed="(newTags) => (tags = newTags)"
            />
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Passing %</label>
        </div>
        <div class="field-body">
            <div class="field is-grouped">
                <div class="control is-expanded">
                    <input
                        data-testid="max-questions"
                        type="range"
                        class="slider is-fullwidth is-primary"
                        min="0"
                        :value="testEditorStore.test.passingPercentage"
                        @input="
                            passingPercentage = parseInt(($event.target! as HTMLInputElement).value)
                        "
                        step="5"
                        :max="100"
                    />
                </div>
                <div
                    class="control is-flex is-flex-direction-row is-align-items-center"
                    style="width: 5rem"
                >
                    <input
                        data-testid="max-questions-value"
                        type="text"
                        class="input has-text-white has-background-dark has-text-centered is-unselectable"
                        :value="testEditorStore.test.passingPercentage + '%'"
                        disabled
                    />
                </div>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Allowed Time</label>
        </div>
        <div class="field-body">
            <div class="control has-icons-left">
                <span class="icon is-small is-left">
                    <i class="fa-solid fa-stopwatch"></i>
                </span>
                <VueMask
                    v-model="allowedTime"
                    :mask="durationMask"
                    style="width: 8rem"
                    class="input is-inline"
                    :class="{ 'is-danger': !allowedTime }"
                    @accept="clearTestEditorAllowedTime"
                    @complete="updateTestEditorAllowedTime"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import MilkdownEditor from '@renderer/components/milkdown-editor/MilkdownEditor.vue';
import TableVue, { TableColumn } from '@renderer/components/table/Table.vue';
import { Author } from '@renderer/db/models/author';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import {
    clockFormatToDuration,
    durationMask,
    durationToClockFormat,
} from '@renderer/utils/datetime-utils';
import VueTagsInput from '@sipec/vue3-tags-input/dist/vue-tags-input';
import { watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { IMaskComponent as VueMask } from 'vue-imask';

const testEditorStore = useTestEditorStore();

const authorColumns = computed(
    () =>
        [
            {
                title: 'Name',
                key: 'name',
                editable: true,
            },
            {
                title: 'E-mail',
                key: 'email',
                editable: true,
            },
        ] as TableColumn<Author>[],
);

const passingPercentage = ref(75);

const allowedTime = ref<string>(
    durationToClockFormat(testEditorStore.test.allowedTime ?? 3_600_000),
);
const clearTestEditorAllowedTime = () => (testEditorStore.test.allowedTime = undefined);
const updateTestEditorAllowedTime = (v: string) =>
    (testEditorStore.test.allowedTime = clockFormatToDuration(v));

const description = ref<string>('');

const tag = ref('');
const tags = ref<{ text: string }[]>(testEditorStore.test.tags.map((t) => ({ text: t })));

// prettier-ignore
watch(tags, (t) => {
    testEditorStore.test.tags.splice(
        0,
        testEditorStore.test.tags.length,
        ...t.map((t) => t.text)
    );
});

watchDebounced(
    description,
    (d) => {
        if (d.length) {
            if (!testEditorStore.test.descriptionRef) {
                testEditorStore.test.descriptionRef = testEditorStore.addResource(
                    'description.md',
                    'MARKDOWN',
                    'text/markdown',
                    d,
                );
            } else {
                testEditorStore.updateResourceData(testEditorStore.test.descriptionRef, d);
            }
            return;
        }

        // Description was cleared, so remove the resource
        if (testEditorStore.test.descriptionRef) {
            testEditorStore.removeResource(testEditorStore.test.descriptionRef);
            testEditorStore.test.descriptionRef = undefined;
        }
    },
    { debounce: 500 },
);
</script>

<style scoped lang="scss">
input[type='range'].slider {
    margin: 0.5rem 0;
}
</style>
