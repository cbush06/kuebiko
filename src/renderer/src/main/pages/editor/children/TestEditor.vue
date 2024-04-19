<template>
    <div
        class="is-flex is-flex-direction-row is-justify-content-space-between is-flex-grow-0 is-flex-shrink-0 is-grey-lighter-border has-bottom-border-1 py-2"
    >
        <span class="is-size-3 pl-2">
            {{ testEditorStore.test.title.trim().length ? testEditorStore.test.title : 'Untitled' }}
        </span>
        <div class="is-flex is-flex-direction-row is-align-items-center is-flex-gap-2 pr-2">
            <button class="button"><i class="fa-solid fa-xmark pr-2"></i> Back</button>
            <button class="button is-primary">
                <i class="fa-solid fa-floppy-disk pr-2"></i> Save
            </button>
        </div>
    </div>
    <div class="is-flex-grow-1 m-0 is-flex is-overflow-hidden">
        <div
            class="is-flex is-flex-grow-0 is-flex-shrink-0 w-auto is-flex-direction-column is-align-items-center p-4 is-grey-lighter-border has-right-border-1"
        >
            <div
                class="is-flex is-flex-direction-row is-justify-content-space-between is-flex-gap-1 mb-4"
            >
                <button class="button is-small" @click="addSection">
                    <span class="icon is-small"><i class="fa-solid fa-folder-plus"></i></span>
                    <span>Add Section</span>
                </button>
                <button
                    class="button is-small"
                    :disabled="!selectedNavNode.isContainer || selectedNavNode.id === 'root'"
                    @click="addQuestion"
                >
                    <span class="icon is-small"><i class="fa-solid fa-file-circle-plus"></i></span>
                    <span>Add Question</span>
                </button>
            </div>
            <TreeVue
                :root-node="navigationTree"
                :collapsible="true"
                :reorderable="true"
                :selected="selectedNavNode"
                @select="(e) => (selectedNavNode = e)"
            />
        </div>
        <div class="is-flex-grow-1 is-flex-shrink-1 p-4 is-overflow-y-auto">
            <MilkdownProvider>
                <TestDetailsEditor />
            </MilkdownProvider>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue';
import TreeVue from '@renderer/components/tree/Tree.vue';
import { TreeNodeStruct } from '@renderer/components/tree/structures';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Test } from '@renderer/db/models/test';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { watchThrottled } from '@vueuse/core';
import { ref, watch } from 'vue';
import TestDetailsEditor from '../editors/TestDetailsEditor.vue';

const testEditorStore = useTestEditorStore();
const navigationTree = ref({
    id: 'root',
    label: 'Untitled Test',
    icon: 'fa-solid fa-flask has-text-primary',
    children: [],
} as TreeNodeStruct);
const selectedNavNode = ref<TreeNodeStruct>(navigationTree.value);

// #region Add/Remove sections
const addSection = () => {
    const test = testEditorStore.test;
    test.sections.push({
        uuid: globalThis.kuebikoAPI.randomUUID(),
        title: 'New Section',
        default: false,
        questionRefs: [],
    });
};

// If only 1 section exists, make it default; otherwise, none are default
watch(testEditorStore.test.sections, (s) => {
    if (s && s.length) {
        if (s.length > 1) {
            s.forEach((next) => (next.default = false));
            return;
        }
        s[0].default = true;
    }
});
// #endregion

// #region Add/Remove questions
const addQuestion = async () => {
    if (selectedNavNode.value.isContainer && selectedNavNode.value.id !== 'root') {
        const selectedSection = testEditorStore.test.sections.find(
            (s) => s.uuid === selectedNavNode.value.id,
        );
        const newQuestionUuid = await KuebikoDb.INSTANCE.questions.add({
            uuid: globalThis.kuebikoAPI.randomUUID(),
            type: 'MULTIPLE',
            options: [],
            categories: [],
        });
        selectedSection?.questionRefs.push(newQuestionUuid as string);
    }
};
// #endregion

// #region Synchronize navigation tree with test structure
const testIdPathSet = new Set<string>();
watchThrottled(
    testEditorStore.test,
    async (test) => {
        const currentIdPaths = buildTestElementIdPathList(test);
        const hasPathChanged = !(
            testIdPathSet.size === currentIdPaths.size &&
            Array.from(testIdPathSet.values()).every((v) => currentIdPaths.has(v))
        );
        if (hasPathChanged) {
            navigationTree.value = await convertTestToTree(test);
        }
    },
    { deep: true, throttle: 1000 },
);

const buildTestElementIdPathList = (test: Test) => {
    const idPathSet = new Set<string>();

    idPathSet.add(`${test.uuid}:${test.title}`);

    for (const s of test.sections) {
        idPathSet.add(`${test.uuid}:${s.uuid}:${s.title}`);

        //prettier-ignore
        s.questionRefs.map((q) => `${test.uuid}:${s.uuid}:${q}`)
            .forEach((q) => idPathSet.add(q));
    }

    return idPathSet;
};

const convertTestToTree = async (test: Test) => {
    const tree = {
        id: 'root',
        label: !!test.title ? test.title : 'Untitled Test',
        icon: 'fa-solid fa-flask has-text-primary',
        isContainer: true,
        children: [],
    } as TreeNodeStruct;

    for (const s of test.sections) {
        const sectionStruct = {
            id: s.uuid,
            label: s.title,
            isContainer: true,
            children: [],
        } as TreeNodeStruct;

        sectionStruct.children = (await KuebikoDb.INSTANCE.questions.bulkGet(s.questionRefs)).map(
            (q) =>
                ({
                    id: q?.uuid,
                    label: 'question',
                }) as TreeNodeStruct,
        );

        tree.children!.push(sectionStruct);
    }

    return tree;
};
// #endregion
</script>

<style scoped lang="scss"></style>
