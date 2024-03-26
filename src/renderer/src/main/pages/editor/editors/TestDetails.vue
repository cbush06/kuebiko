<template>
    <div class="field is-horizontal">
        <div class="field-label">
            <label class="label">Description</label>
        </div>
        <div class="field-body is-block">
            <div class="field">
                <div id="description-div" class="control">
                    <MilkdownEditor />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import MilkdownEditor from '@renderer/components/milkdown-editor/MilkdownEditor.vue';
</script>

<style scoped></style>
