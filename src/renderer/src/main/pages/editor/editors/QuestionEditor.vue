<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Title</label>
        </div>
        <div class="field-body">
            <input type="text" class="input" placeholder="Untitled" v-model="question.title" />
        </div>
    </div>
    <MultipleChoiceEditor v-if="question.type === 'MULTIPLE'" :question="question" />
    <div v-else>Question type not recognized</div>
</template>

<script setup lang="ts">
import { Question } from '@renderer/db/models/question';
import { useTestEditorStore } from '@renderer/store/test-editor-store/test-editor-store';
import { computed } from 'vue';
import MultipleChoiceEditor from './question-editors/MultipleChoiceEditor.vue';

const testEditorStore = useTestEditorStore();
const question = computed(() => testEditorStore.testEditPart as Question);
</script>

<style scoped lang="scss"></style>
