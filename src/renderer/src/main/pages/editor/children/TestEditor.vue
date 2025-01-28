<template>
    <div
        class="is-flex is-flex-direction-row is-justify-content-space-between is-flex-grow-0 is-flex-shrink-0 is-grey-lighter-border has-bottom-border-1 py-2"
    >
        <span class="is-size-3 pl-2">
            {{ testEditorStore.test.title.trim().length ? testEditorStore.test.title : 'Untitled' }}
        </span>
        <div class="is-flex is-flex-direction-row is-align-items-center is-flex-gap-2 pr-2">
            <button class="button is-link" @click="exportTest">
                <i class="fa-solid fa-download pr-2"></i> Export
            </button>
            <div
                class="is-grey-lighter-border has-left-border-1"
                style="height: 3rem; width: 1px"
            ></div>
            <button class="button" @click="back">
                <i class="fa-solid fa-xmark pr-2"></i> Back
            </button>
            <button class="button is-primary" @click="save">
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
                            :disabled="selectedNavNodeId === 'root'"
                            @click="addQuestionMenuShown = true"
                        >
                            <span class="icon is-small"
                                ><i class="fa-solid fa-file-circle-plus"></i
                            ></span>
                            <span>Add Question</span>
                            <span class="icon is-small">
                                <i class="fas fa-angle-down" aria-hidden="true"></i>
                            </span>
                        </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            <a class="dropdown-item" @click="() => addQuestion('MULTIPLE')">
                                <i class="fa-solid fa-list-ul mr-2"></i> Select One
                            </a>
                            <a class="dropdown-item" @click="() => addQuestion('MANY')">
                                <i class="fa-solid fa-list-check mr-2"></i> Select Many
                            </a>
                            <a class="dropdown-item" @click="() => addQuestion('HOTSPOT')">
                                <i class="fa-solid fa-arrows-to-circle mr-2"></i> Hot Spot
                            </a>
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

                <button
                    class="button is-small"
                    :disabled="!isDeleteButtonActive"
                    @click="deleteItem()"
                >
                    <span class="icon is-small"><i class="fa-solid fa-trash-can"></i></span>
                </button>
            </div>
            <TreeVue
                :root-node="navigationTree"
                :collapsible="true"
                :reorderable="true"
                :selectedId="selectedNavNodeId"
                @select="(e) => (selectedNavNodeId = e)"
                @drop="onDrop"
                :preventLeavesInRoot="true"
                :prevent-nested-containers="true"
                width="18rem"
            />
        </div>
        <div class="is-flex-grow-1 is-flex-shrink-1 p-4 is-overflow-y-auto">
            <TestDetailsEditor
                v-if="testEditorStore.testEditMode === 'test'"
                :key="testEditorStore.testEditPart.uuid"
            />
            <SectionDetailsEditor
                v-if="testEditorStore.testEditMode === 'section'"
                :key="testEditorStore.testEditPart.uuid"
            />
            <QuestionEditor
                v-if="testEditorStore.testEditMode === 'question'"
                :key="testEditorStore.testEditPart.uuid"
            />
        </div>
    </div>

    <BulmaModal ref="confirmLeaveWithoutSavingModal" :title="t('closeWithoutSaving')">
        <template #body>{{ t('closeWithoutSavingMsg') }}</template>
    </BulmaModal>
</template>

<script setup lang="ts">
import BulmaModal from '@renderer/components/bulma-modal/BulmaModal.vue';
import TreeVue from '@renderer/components/tree/Tree.vue';
import { TreeNodeDropData, TreeNodeStruct } from '@renderer/components/tree/structures';
import { Question, QuestionType } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { BulmaToast, BulmaToastService } from '@renderer/vue-config/bulma-toast/bulma-toast';
import { vOnClickOutside } from '@vueuse/components';
import { watchThrottled } from '@vueuse/core';
import { computed, inject, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import QuestionEditor from '../editors/QuestionEditor.vue';
import SectionDetailsEditor from '../editors/SectionDetailsEditor.vue';
import TestDetailsEditor from '../editors/TestDetailsEditor.vue';
import { TestPackageMarshaller } from '@renderer/services/test-package-service/test-package-marshaller';
import { EditorTestObjectProvider } from '@renderer/services/editor-test-object-provider';
import { EditorDbFacade } from '@renderer/services/editor-db-facade';

const toast = inject<BulmaToastService>(BulmaToast)!;

const addQuestionMenuShown = ref(false);
const testEditorStore = useTestEditorStore();
const confirmLeaveWithoutSavingModal = ref<InstanceType<typeof BulmaModal> | undefined>();
const { t } = useI18n();
const router = useRouter();

//region Initialize
onBeforeMount(() => {
    testEditorStore.testEditMode = 'test';
});
//endregion

//region Fetch/init test data and navigation tree
const route = useRoute();

EditorTestObjectProvider.fetchTest(route.params['testUuid'] as string).then((t) => {
    if (t) {
        testEditorStore.initializeForTest(route.params['testUuid'] as string);
    } else {
        testEditorStore.$reset();
    }
});

// Prepare the tree nav
const navigationTree = ref({
    id: 'root',
    label: 'Untitled Test',
    icon: 'fa-solid fa-flask has-text-primary',
    children: [],
} as TreeNodeStruct);
const selectedNavNodeId = ref<string>(navigationTree.value.id);
watch(selectedNavNodeId, (id) => testEditorStore.setTestEditPartFromTreeNode(id));
//endregion

//region Delete button
const isDeleteButtonActive = computed(
    () => !!selectedNavNodeId.value && selectedNavNodeId.value !== 'root',
);

const deleteItem = () => {
    // If it's a section...
    if (testEditorStore.isSectionUuid(selectedNavNodeId.value)) {
        // Delete the section
        testEditorStore.removeSection(selectedNavNodeId.value);

        // Select the first previous section
        if (navigationTree.value.children!.length > 1) {
            const newNodeIndex = navigationTree.value
                .children!.filter((c) => c.id !== selectedNavNodeId.value)
                .reduce((prev, _, idx) => Math.min(prev, idx), Number.MAX_VALUE);
            selectedNavNodeId.value = navigationTree.value.children![newNodeIndex].id;
        } else {
            selectedNavNodeId.value = navigationTree.value.id;
        }
    }

    // If it's a question...
    else {
        // Find the question's section
        const section = findTargetContainer(navigationTree.value);

        // Delete the question
        testEditorStore.removeQuestion(selectedNavNodeId.value);

        // Select the section
        selectedNavNodeId.value = section!.id;
    }
};
//endregion

//region Add section
const addSection = () => {
    selectedNavNodeId.value = testEditorStore.addSection().uuid;
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
//endregion

//region Add questions
const findTargetContainer: (node: TreeNodeStruct) => TreeNodeStruct | undefined = (
    node: TreeNodeStruct,
) => {
    for (const child of node.children ?? []) {
        if (child.id === selectedNavNodeId.value) return node;
        if (!child.isContainer) continue;

        const match = findTargetContainer(child);
        if (match) return match;
    }
    return undefined;
};

const addQuestion = async (type: QuestionType) => {
    if (selectedNavNodeId.value === 'root') return;

    const selectedSection = testEditorStore.isSectionUuid(selectedNavNodeId.value)
        ? testEditorStore.test.sections.find((s) => s.uuid === selectedNavNodeId.value)
        : testEditorStore.test.sections.find(
              (s) => s.uuid === findTargetContainer(navigationTree.value)?.id,
          );

    selectedNavNodeId.value = testEditorStore.addQuestion(selectedSection!, type).uuid;
    addQuestionMenuShown.value = false;
};
//endregion

//region Synchronize navigation tree with test structure
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
    HOTSPOT: 'fa-solid fa-arrows-to-circle',
} as Record<QuestionType, string>);

const convertTestToTree = async (test: Test) => {
    const tree = {
        id: 'root',
        label: test.title ? test.title : 'Untitled Test',
        icon: 'fa-solid fa-flask has-text-primary',
        isContainer: true,
        children: [],
    } as TreeNodeStruct;

    for (const s of test.sections) {
        const sectionStruct = {
            id: s.uuid,
            label: s.title ? s.title : 'Untitled Section',
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
//endregion

//region Handling drag-n-drop of questions
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
//endregion

//region Saving and navigating
const save = async () => {
    try {
        await testEditorStore.save();
        toast.success({ message: 'Changes saved!' });
    } catch (e) {
        console.error(e);
        toast.danger({ message: 'Uh oh! An error prevented saving your changes.' });
    }
};

const back = () => {
    if (testEditorStore.hasChangedWithoutSaving()) {
        confirmLeaveWithoutSavingModal.value?.show().subscribe((result) => {
            if (result === 'confirmed') router.push('/editor');
        });
    } else {
        router.push('/editor');
    }
};

const exportTest = async () => {
    try {
        await testEditorStore.save();
        const jszip = await new TestPackageMarshaller(EditorDbFacade).marshall(
            testEditorStore.test,
        );

        // @ts-expect-error - TS doesn't know about showSaveFilePicker
        const fileHandle: FileSystemFileHandle = await window.showSaveFilePicker({
            suggestedName: `${testEditorStore.test.title}.zip`,
        });

        const blob = await jszip.generateAsync({ type: 'blob' });

        const fileWriter = await fileHandle.createWritable();
        await fileWriter.write(blob);
        await fileWriter.close();

        toast.success({ message: `Test exported to [${fileHandle.name}]!` });
    } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.error(e);
        toast.danger({ message: 'Uh oh! An error prevented exporting your test.' });
    }
};
//endregion
</script>

<style scoped lang="scss"></style>

<i18n lang="json">
{
    "en": {
        "closeWithoutSaving": "Close Without Saving?",
        "closeWithoutSavingMsg": "You have unsaved changes. If you want to keep them, click \"Cancel\" and save you changes; otherwise, click \"Confirm.\""
    }
}
</i18n>
