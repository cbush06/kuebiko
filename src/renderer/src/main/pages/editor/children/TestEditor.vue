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

                <div
                    class="dropdown"
                    :class="{ 'is-active': addQuestionMenuShown }"
                    v-on-click-outside="() => (addQuestionMenuShown = false)"
                >
                    <div class="dropdown-trigger">
                        <button
                            class="button is-small"
                            :disabled="
                                !selectedNavNode.isContainer || selectedNavNode.id === 'root'
                            "
                            @click="addQuestionMenuShown = true"
                        >
                            <span class="icon is-small"
                                ><i class="fa-solid fa-file-circle-plus"></i
                            ></span>
                            <span>Add Question</span>
                        </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            <a class="dropdown-item" @click="() => addQuestion('MULTIPLE')"
                                ><i class="fa-solid fa-list-ul mr-2"></i> Select One</a
                            >
                            <a class="dropdown-item" @click="() => addQuestion('MANY')"
                                ><i class="fa-solid fa-list-check mr-2"></i> Select Many</a
                            >
                            <!--
                            <a
                                class="dropdown-item"
                                @click="
                                    (e) => {
                                        console.log(e);
                                        addQuestionMenuShown = false;
                                    }
                                "
                                ><i class="fa-solid fa-pen-to-square mr-2"></i> Fill-in-the-Blank</a
                            >
                            <a
                                class="dropdown-item"
                                @click="
                                    (e) => {
                                        console.log(e);
                                        addQuestionMenuShown = false;
                                    }
                                "
                                ><i class="fa-solid fa-object-group mr-2"></i> Drag-n-Drop</a
                            >
                            <a
                                class="dropdown-item"
                                @click="
                                    (e) => {
                                        console.log(e);
                                        addQuestionMenuShown = false;
                                    }
                                "
                                ><i class="fa-solid fa-circle-nodes mr-2"></i> Hot Area</a
                            >
                            -->
                        </div>
                    </div>
                </div>
            </div>
            <TreeVue
                :root-node="navigationTree"
                :collapsible="true"
                :reorderable="true"
                :selected="selectedNavNode"
                @select="(e) => (selectedNavNode = e)"
                @drop="onDrop"
                :preventLeavesInRoot="true"
                :prevent-nested-containers="true"
            />
        </div>
        <div class="is-flex-grow-1 is-flex-shrink-1 p-4 is-overflow-y-auto">
            <TestDetailsEditor v-if="testEditorStore.testEditMode === 'test'" />
            <SectionDetailsEditor v-else-if="testEditorStore.testEditMode === 'section'" />
            <QuestionEditor v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
import TreeVue from '@renderer/components/tree/Tree.vue';
import { TreeNodeDropData, TreeNodeStruct } from '@renderer/components/tree/structures';
import { Question, QuestionType } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { vOnClickOutside } from '@vueuse/components';
import { watchThrottled } from '@vueuse/core';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import QuestionEditor from '../editors/QuestionEditor.vue';
import SectionDetailsEditor from '../editors/SectionDetailsEditor.vue';
import TestDetailsEditor from '../editors/TestDetailsEditor.vue';

const addQuestionMenuShown = ref(false);
const testEditorStore = useTestEditorStore();

// Initialize the store for the current or new test
const route = useRoute();
if (route.params['testUuid']) {
    testEditorStore.initializeForTest(route.params['testUuid'] as string);
} else {
    testEditorStore.$reset();
}

// Prepare the tree nav
const navigationTree = ref({
    id: 'root',
    label: 'Untitled Test',
    icon: 'fa-solid fa-flask has-text-primary',
    children: [],
} as TreeNodeStruct);
const selectedNavNode = ref<TreeNodeStruct>(navigationTree.value);

// #region Handle navigation changes
watch(selectedNavNode, (node) => testEditorStore.setTestEditPartFromTreeNode(node));
// #endregion

// #region Add/Remove sections
const addSection = () => {
    testEditorStore.addSection();
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
const addQuestion = async (type: QuestionType) => {
    if (selectedNavNode.value.isContainer && selectedNavNode.value.id !== 'root') {
        const selectedSection = testEditorStore.test.sections.find(
            (s) => s.uuid === selectedNavNode.value.id,
        );
        testEditorStore.addQuestion(selectedSection!, type);
    }
    addQuestionMenuShown.value = false;
};
// #endregion

// #region Synchronize navigation tree with test structure
const testIdPathSet = new Set<string>();
watchThrottled(
    () => ({
        test: testEditorStore.test,
        questions: Array.from(testEditorStore.questions.values()),
    }),
    async ({ test, questions }) => {
        const currentIdPaths = buildTestElementIdPathList(test, questions);
        const hasPathChanged = !(
            testIdPathSet.size === currentIdPaths.size &&
            Array.from(testIdPathSet.values()).every((v) => currentIdPaths.has(v))
        );
        if (hasPathChanged) {
            navigationTree.value = await convertTestToTree(test);
        }
    },
    { deep: true, throttle: 500 },
);

const buildTestElementIdPathList = (test: Test, questions: Question[]) => {
    const idPathSet = new Set<string>();

    idPathSet.add(`${test.uuid}:${test.title}`);

    test.sections.forEach((s) => idPathSet.add(`${s.uuid}:${s.title}`));
    questions.forEach((q) => idPathSet.add(`${q.uuid}:${q.title}`));

    return idPathSet;
};

const QUESTION_TYPE_TO_ICON_MAP = Object.seal({
    MULTIPLE: 'fa-solid fa-list-ul',
    MANY: 'fa-solid fa-list-check',
} as Record<QuestionType, string>);

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
            label: !!s.title ? s.title : 'Untitled Section',
            isContainer: true,
            children: [],
        } as TreeNodeStruct;

        sectionStruct.children = s.questionRefs
            .map((qRef) => testEditorStore.questions.get(qRef)!)
            .map(
                (q) =>
                    ({
                        id: q.uuid,
                        label: q.title,
                        iconClass: QUESTION_TYPE_TO_ICON_MAP[q.type] + ' has-text-primary',
                    }) as TreeNodeStruct,
            );

        tree.children!.push(sectionStruct);
    }

    return tree;
};
// #endregion

// #region Handling drag-n-drop of questions
const onDrop = (e: TreeNodeDropData) => {
    console.log('onDrop');
    const question = e.sourceId;
    const originalParent = testEditorStore.test.sections.find((s) => s.uuid === e.parentId);
    const targetParent = testEditorStore.test.sections.find((s) => s.uuid === e.targetId);

    if (question && originalParent && targetParent) {
        // prettier-ignore
        originalParent.questionRefs.splice(
            originalParent.questionRefs.indexOf(question), 
            1
        );

        if (e.beforeId) {
            // prettier-ignore
            targetParent.questionRefs.splice(
                targetParent.questionRefs.indexOf(e.beforeId), 
                0, 
                question
            );
            return;
        }

        if (e.afterId) {
            // prettier-ignore
            targetParent.questionRefs.splice(
                targetParent.questionRefs.indexOf(e.afterId) + 1,
                0,
                question
            );
            return;
        }

        targetParent.questionRefs.push(question);
    }
};
// #endregion
</script>

<style scoped lang="scss"></style>
