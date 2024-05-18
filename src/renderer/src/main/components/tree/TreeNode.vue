<template>
    <div
        class="tree-node"
        :class="{
            root: !!props.isRoot,
            disabled: props.isDisabled,
            collapsed: !(isExpanded || props.isRoot),
        }"
        :data-testid="`tree-node-${props.id}`"
    >
        <div class="branch"></div>
        <label
            @click="select()"
            :class="{ selected: isSelected }"
            @dragstart="onDragStart"
            @dragover="(e) => e.preventDefault()"
            @dragenter="onDragEnter"
            @dragleave="onDragEndLeave"
            @dragend="onDragEndLeave"
            @drop="onDrop"
            :draggable="!props.isRoot && props.treeOptions?.reorderable"
            :data-testid="`tree-node-label-${props.id}`"
        >
            <i :class="iconClass" :data-testid="`tree-node-icon-${props.id}`"></i>
            <span class="label-text" :data-testid="`tree-node-text-${props.id}`">{{
                props.label
            }}</span>
        </label>
        <div
            v-if="props.children?.length && (props.isRoot || props.isContainer)"
            class="children"
            :class="{ 'is-hidden': !(isExpanded || isRoot) }"
            :data-testid="`tree-node-children-${props.id}`"
        >
            <div
                class="drop-line"
                @dragover="(e) => e.preventDefault()"
                @dragenter="onDragEnter"
                @dragleave="onDragEndLeave"
                @dragend="onDragEndLeave"
                @drop="onDropBefore"
                :data-testid="`tree-node-children-before-drop-line-${props.id}`"
            ></div>
            <TreeNode
                v-for="(node, index) in props.children"
                :key="node.id"
                :is-root="false"
                :id="node.id"
                :index="index"
                :parent="props"
                :label="node.label"
                :icon-class="node.iconClass ?? 'fa-regular fa-file has-text-primary'"
                :children="node.children"
                :is-container="node.isContainer"
                :isExpanded="node.isExpanded"
                :isDisabled="node.isDisabled"
                :tree-options="props.treeOptions"
                :selected-node="props.selectedNode"
                @select="(struct) => emit('select', struct)"
                @drop="onDropChild"
            />
        </div>
        <div
            class="drop-line"
            @dragover="(e) => e.preventDefault()"
            @dragenter="onDragEnter"
            @dragleave="onDragEndLeave"
            @dragend="onDragEndLeave"
            @drop="onDropAfter"
            :data-testid="`tree-node-children-after-drop-line-${props.id}`"
        ></div>
        <div
            v-if="!props.isRoot && props.isContainer && props.children?.length"
            :class="`expander ${props.treeOptions?.expanderClass ?? 'has-text-grey'}`"
            @click="isExpanded = !isExpanded"
            :data-testid="`tree-node-expander-${props.id}`"
        ></div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { TreeOptions } from './Tree.vue';
import { TreeNodeDragData, TreeNodeDropData, TreeNodeStruct } from './structures';

export interface TreeNodeOptions {
    isRoot?: boolean;
    treeOptions?: TreeOptions;
    selectedNode?: TreeNodeStruct;
    parent?: TreeNodeStruct;
}

export type TreeNodeProps = TreeNodeStruct & TreeNodeOptions;

export interface TreeNodeEvents {
    (e: 'select', payload: TreeNodeProps): void;
    (e: 'drop', payload: TreeNodeDropData): void;
}

const emit = defineEmits<TreeNodeEvents>();
const props = defineProps<TreeNodeProps>();

const isExpanded = ref(props.isExpanded ?? true);
const iconClass = computed(() => {
    if (!!props.isContainer && !props.isRoot) {
        return isExpanded.value
            ? props.treeOptions?.containerExpandedIcon ??
                  'fa-regular fa-folder-open has-text-primary'
            : props.treeOptions?.containerIcon ?? 'fa-solid fa-folder has-text-primary';
    }
    return props.iconClass;
});

const isSelected = computed(() => props.selectedNode?.id === props.id);

function select() {
    emit('select', props);
}

function onDragStart(e: DragEvent) {
    if (!e.dataTransfer) return;

    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData(
        'drag-data',
        JSON.stringify({
            sourceId: props.id,
            parentId: props.parent!.id,
        } as TreeNodeDragData),
    );
    e.dataTransfer.effectAllowed = 'move';
}

function onDrop(e: DragEvent, targetId?: string, afterId?: string, beforeId?: string) {
    if (!e.dataTransfer) return;

    const dragData = JSON.parse(e.dataTransfer.getData('drag-data')) as TreeNodeDragData;

    // Ensure it's a drop event we care about
    if (!dragData.sourceId) return;

    (e.target as HTMLElement).classList.remove('dragover');

    // You cannot drop it on itself
    if (dragData.sourceId === props.id) return;

    // If it was dropped directly on the parent container, add it to the end of the child list
    if (!afterId && !beforeId) {
        if (props.children?.length) {
            afterId = props.children[props.children.length - 1].id;
        }
    }

    emit('drop', {
        sourceId: dragData.sourceId,
        parentId: dragData.parentId,
        targetId: targetId ?? props.id,
        afterId,
        beforeId,
    } as TreeNodeDropData);
}

function onDropChild(e: TreeNodeDropData) {
    emit('drop', e);
}

function onDropBefore(e: DragEvent) {
    onDrop(e, props.id, undefined, props.children![0].id);
}

function onDropAfter(e: DragEvent) {
    if (!props.parent) return;
    onDrop(e, props.parent?.id, props.id);
}

function onDragEnter(e: DragEvent) {
    e.preventDefault();

    if (
        !props.treeOptions?.reorderable ||
        !(props.isContainer || (e.target as HTMLElement).classList.contains('drop-line'))
    )
        return;
    (e.target as HTMLElement).classList.add('dragover');
}

function onDragEndLeave(e: DragEvent) {
    e.preventDefault();

    if (
        !props.treeOptions?.reorderable ||
        !(props.isContainer || (e.target as HTMLElement).classList.contains('drop-line'))
    )
        return;
    (e.target as HTMLElement).classList.remove('dragover');
}
</script>

<style scoped lang="scss">
@import '~/bulma/bulma.sass';

.tree-node {
    position: relative;
    text-decoration: none;

    &:not(.root) {
        &:last-child {
            & > .branch {
                height: 0.8em !important;
                &::before {
                    top: unset !important;
                    bottom: 0px;
                }
            }
        }

        .branch {
            position: absolute;
            height: 100%;
            width: 1px;
            top: 0px;
            left: -0.7em;
            border-left: 1px solid $primary;

            &::before {
                content: ' ';
                position: absolute;
                top: 0.72em;
                width: 0.6em;
                height: 1px;
                background-color: $primary;
            }
        }

        .children {
            margin-left: 1.1em;
        }
    }

    label {
        display: block;
        width: fit-content;

        .label-text {
            margin-left: 0.2em;
            border-radius: 0.1em;
            padding: 0.1em 0.4em;

            &.dragover {
                border: 1px dashed $primary;
            }
        }

        &.selected {
            .label-text {
                @extend .has-background-grey-lighter;
            }
        }
    }

    .drop-line {
        width: 100%;
        margin-top: -0.2em;
        height: 0.5em;

        &.dragover {
            border-bottom: 1px solid black;
        }
    }

    // &:not(:first-child) > .branch + .drop-line,
    &:last-child > .drop-line {
        display: none;
    }

    .children {
        position: relative;
        margin-left: 1.2em;

        &::after {
            content: ' ';
            position: absolute;
            left: -0.7em;
            top: 0em;
            height: 0.5em;
            width: 1px;
            background-color: $primary;
        }
    }

    .expander {
        display: none;
    }
}

.tree.collapsible .tree-node {
    .children + .expander,
    .drop-line + .expander {
        display: block;

        &::before {
            position: absolute;
            top: 0.25em;
            left: -1.1em;

            cursor: pointer;

            font-size: 1em;
            line-height: 1em;

            background-color: #fff;

            font-family: 'Font Awesome 6 Free';
            font-weight: 900;
            content: '\f146';
        }
    }

    &.collapsed {
        .children {
            display: none;
        }

        .children + .expander::before,
        .drop-line + .expander::before {
            content: '\f0fe';
        }
    }
}
</style>
