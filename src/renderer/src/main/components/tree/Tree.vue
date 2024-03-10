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

function findNodeById(id: string, node: TreeNodeStruct): TreeNodeStruct | undefined {
    if (node.id === id) return node;
    for (const child of node.children ?? []) {
        const result = findNodeById(id, child);
        if (result) return result;
    }
    return undefined;
}

function onDrop(e: TreeNodeDropData) {
    const nodeBeingMoved = findNodeById(e.sourceId, props.rootNode);
    const newNodeParent = findNodeById(e.targetId, props.rootNode);
    const currNodeParent = findNodeById(e.parentId, props.rootNode);

    if (!(nodeBeingMoved && newNodeParent)) return;

    const newLocation = e.afterId
        ? newNodeParent.children!.findIndex((n) => n.id === e.afterId) + 1
        : e.beforeId
          ? newNodeParent.children!.findIndex((n) => n.id === e.beforeId)
          : 0;

    currNodeParent?.children?.splice(
        currNodeParent.children.findIndex((n) => n.id === nodeBeingMoved.id),
        1,
    );

    newNodeParent.children?.splice(newLocation, 0, nodeBeingMoved);

    emit('drop', e);
}
</script>

<style scoped>
.tree {
    width: fit-content;
}
</style>
