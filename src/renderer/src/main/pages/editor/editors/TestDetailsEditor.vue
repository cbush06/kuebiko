<template>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Title</label>
        </div>
        <div class="field-body">
            <input type="text" class="input" placeholder="Untitled" />
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Description</label>
        </div>
        <div class="field-body">
            <div class="field">
                <div id="description-div" class="control">
                    <MilkdownEditor />
                </div>
            </div>
        </div>
    </div>
    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Authors</label>
        </div>
        <div class="field-body">
            <!-- prettier-ignore -->
            <TableVue 
                :data="authors" 
                :columns="authorColumns"
                mode="edit"
            >
            </TableVue>
        </div>
    </div>
</template>

<script setup lang="ts">
import MilkdownEditor from '@renderer/components/milkdown-editor/MilkdownEditor.vue';
import TableVue, { TableColumn } from '@renderer/components/table/Table.vue';
import { Author } from '@renderer/db/models/author';
import { Test } from '@renderer/db/models/test';
import { computed, ref } from 'vue';

export interface TestDetailsEditorProps {
    test?: Test;
}

const authors = ref<Author[]>([
    { name: 'Bob', email: 'bob@bob.com' },
    { name: 'Fred', email: 'fred@fred.com' },
]);

const authorColumns = computed(
    () =>
        [
            {
                title: 'Name',
                key: 'name',
                editable: true,
            },
            {
                title: 'E-mail',
                key: 'email',
                editable: true,
            },
        ] as TableColumn<Author>[],
);
</script>

<style scoped></style>
