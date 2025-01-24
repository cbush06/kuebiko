<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Title</label>
        </div>
        <div class="field-body">
            <input v-model="section.title" type="text" class="input" placeholder="Untitled" />
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Description</label>
        </div>
        <div class="field-body">
            <ToggleTextEditor v-model="description" starting-height="16rem" />
        </div>
    </div>
</template>

<script setup lang="ts">
import ToggleTextEditor from '@renderer/components/toggle-text-editor/ToggleTextEditor.vue';
import { Section } from '@renderer/db/models/section';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { watchDebounced } from '@vueuse/core';
import { computed, ref } from 'vue';

const testEditorStore = useTestEditorStore();
const section = computed(() => testEditorStore.testEditPart as Section);

const description = ref(
    (testEditorStore.resources.get(section.value.descriptionRef!)?.data as string) ?? '',
);

watchDebounced(
    description,
    () => {
        testEditorStore.updateResourceData(section.value.descriptionRef!, description.value);
    },
    { debounce: 500 },
);
</script>

<style scoped lang="scss"></style>
