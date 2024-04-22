<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Title</label>
        </div>
        <div class="field-body">
            <input type="text" class="input" placeholder="Untitled" v-model="question.title" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Question } from '@renderer/db/models/question';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { computed } from 'vue';

const testEditorStore = useTestEditorStore();
const question = computed(() => testEditorStore.testEditPart as Question);
</script>

<style scoped lang="scss"></style>
