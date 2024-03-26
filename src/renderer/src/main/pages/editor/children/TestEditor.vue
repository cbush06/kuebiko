<template>
    <div
        class="is-flex is-flex-direction-row stretch is-flex-grow-0 is-flex-shrink-0 is-grey-lighter-border has-bottom-border-1"
    >
        <div class="field has-addons pt-1 pb-1 is-flex is-flex-direction-row w-100">
            <div class="control is-flex-grow-1">
                <input type="text" class="input is-medium is-radiusless" placeholder="Test Title" />
            </div>
            <div class="control is-flex-grow-0">
                <button class="button is-success is-medium is-radiusless">
                    <span class="icon"><i class="fa-solid fa-check"></i></span>
                    <span>Save</span>
                </button>
            </div>
            <div class="control is-flex-grow-0">
                <button class="button is-danger is-outlined is-medium is-radiusless">
                    <span class="icon"><i class="fa-solid fa-xmark"></i></span>
                </button>
            </div>
        </div>
    </div>
    <div class="columns is-flex-grow-1 m-0">
        <div
            class="column is-flex is-flex-direction-column is-align-items-center is-two-fifths-tablet is-one-quarter-desktop pt-5 is-grey-lighter-border has-right-border-1"
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
        <div class="column">
            <MilkdownProvider>
                <TestDetails />
            </MilkdownProvider>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue';
import TreeVue from '@renderer/components/tree/Tree.vue';
import { TreeNodeStruct } from '@renderer/components/tree/structures';
import { ref } from 'vue';
import TestDetails from '../editors/TestDetails.vue';

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
</script>

<style scoped lang="scss"></style>
