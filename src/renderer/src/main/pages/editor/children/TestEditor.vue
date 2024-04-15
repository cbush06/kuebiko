<template>
    <div
        class="is-flex is-flex-direction-row stretch is-flex-grow-0 is-flex-shrink-0 is-grey-lighter-border has-bottom-border-1"
    >
        <span class="is-size-3 pl-2">{{
            testEditorStore.test.title.trim().length ? testEditorStore.test.title : 'Untitled'
        }}</span>
    </div>
    <div class="is-flex-grow-1 m-0 is-flex is-overflow-hidden">
        <div
            class="is-flex is-flex-grow-0 is-flex-shrink-0 w-auto is-flex-direction-column is-align-items-center p-4 is-grey-lighter-border has-right-border-1"
        >
            <div
                class="is-flex is-flex-direction-row is-justify-content-space-between is-flex-gap-1 mb-4"
            >
                <button class="button is-small">
                    <span class="icon is-small"><i class="fa-solid fa-folder-plus"></i></span>
                    <span>Add Section</span>
                </button>
                <button class="button is-small">
                    <span class="icon is-small"><i class="fa-solid fa-file-circle-plus"></i></span>
                    <span>Add Question</span>
                </button>
            </div>
            <TreeVue
                :root-node="rootNode"
                :collapsible="true"
                :reorderable="true"
                :selected="selected"
                @select="(e) => (selected = e)"
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
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { ref } from 'vue';
import TestDetailsEditor from '../editors/TestDetailsEditor.vue';

const rootNode = ref({
    id: 'tree',
    label: 'Tree',
    iconClass: 'fa-solid fa-flask has-text-primary',
    children: [
        {
            id: 'node1',
            label: 'Node1',
            isContainer: true,
            children: [
                {
                    id: 'node2',
                    label: 'Node2',
                    iconClass: 'fa-solid fa-check-double has-text-primary',
                },
                {
                    id: 'node4',
                    label: 'Node4',
                    iconClass: 'fa-solid fa-square-check has-text-primary',
                },
            ],
        },
        {
            id: 'node3',
            label: 'Node3',
            iconClass: 'fa-solid fa-check-double has-text-primary',
        },
    ],
} as TreeNodeStruct);

const selected = ref<TreeNodeStruct>(rootNode.value);

const testEditorStore = useTestEditorStore();
</script>

<style scoped lang="scss"></style>
