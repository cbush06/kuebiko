<template>
    <NavVue />
    <div class="container is-max-widescreen mt-4">
        <!-- <router-view /> -->
        <TreeVue :root-node="rootNode" :collapsible="true" :reorderable="true" @drop="onDrop" />
    </div>
</template>

<script setup lang="ts">
import NavVue from '@renderer/components/nav/Nav.vue';
import TreeVue from '@renderer/components/tree/Tree.vue';
import { TreeNodeStruct } from '@renderer/components/tree/structures';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const helmetStore = useHelmetStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });

onBeforeMount(() => (helmetStore.title = t('homeTitle')));

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
                },
                {
                    id: 'node4',
                    label: 'Node4',
                },
            ],
        },
        {
            id: 'node3',
            label: 'Node3',
        },
    ],
} as TreeNodeStruct);
</script>

<style scoped lang="scss"></style>

<i18n lang="json">
{
    "en": {
        "homeTitle": "Kuebiko :: Home",
        "tests": "Tests"
    }
}
</i18n>
