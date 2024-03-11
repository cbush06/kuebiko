<template>
    <div class="columns h-100">
        <div class="column is-one-quarter">
            <div class="box h-100">
                <div class="level">
                    <button class="button is-small" :disabled="!selected?.isContainer">
                        <span class="icon">
                            <i class="fa-solid fa-folder-plus"></i>
                        </span>
                        <span>Section</span>
                    </button>
                    <button class="button is-small" :disabled="!selected?.isContainer">
                        <span class="icon">
                            <i class="fa-solid fa-file-circle-plus"></i>
                        </span>
                        <span>Add Question</span>
                    </button>
                </div>
                <div class="block">
                    <TreeVue
                        :root-node="rootNode"
                        :collapsible="true"
                        :reorderable="true"
                        @select="(e) => (selected = e)"
                    />
                </div>
            </div>
        </div>
        <div class="column"></div>
    </div>
</template>

<script setup lang="ts">
import TreeVue from '@renderer/components/tree/Tree.vue';
import { TreeNodeStruct } from '@renderer/components/tree/structures';
import { ref } from 'vue';

const selected = ref<TreeNodeStruct>();

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
</script>

<style scoped lang="scss"></style>
