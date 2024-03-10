<template>
    <div class="tree" :class="{ collapsible: props.collapsible, reorderable: props.reorderable }">
        <TreeNodeVue
            :id="props.rootNode.id"
            :label="props.rootNode.label"
            :icon-class="props.rootNode.iconClass ?? 'fa-solid fa-house has-text-primary'"
            :children="props.rootNode.children"
            :is-root="true"
            :isDisabled="false"
            :tree-options="props"
            :selected-node="selected"
            :is-container="true"
            @select="(struct) => (selected = struct)"
            @drop="onDrop"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TreeNodeVue from './TreeNode.vue';
import { TreeNodeDropData, TreeNodeStruct } from './structures';

export interface TreeOptions {
    reorderable?: boolean;
    collapsible?: boolean;
    expanderClass?: string;
    containerIcon?: string;
    containerExpandedIcon?: string;
}

interface TreeProps {
    rootNode: TreeNodeStruct;
}

const props = defineProps<TreeOptions & TreeProps>();
const emit = defineEmits(['drop']);
const selected = ref<TreeNodeStruct>();

watch(selected, (s) => console.log(s));

function onDrop(drop: TreeNodeDropData) {
    emit('drop', drop);
}
</script>

<style scoped>
.tree {
    width: fit-content;
}
</style>
