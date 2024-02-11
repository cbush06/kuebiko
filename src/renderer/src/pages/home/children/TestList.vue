<template>
    <div class="is-flex is-flex-direction-column is-flex-gap-2">
        <div class="box is-flex is-justify-content-flex-end p-2">
            <div class="file is-info">
                <label class="file-label">
                    <input class="file-input" type="file" @input="importTestPackage($event as InputEvent)" />
                    <span class="file-cta">
                        <span class="file-icon">
                            <i class="fa-solid fa-upload"></i>
                        </span>
                        <span class="file-label"> Import a Test... </span>
                    </span>
                </label>
            </div>
        </div>
        <div class="box">
            <!-- prettier-ignore -->
            <TableVue 
                :data="data" 
                :columns="columns" 
                :hoverable="true" 
                :clickable="true"
                :sort="{key: 'title', direction: 'asc'}"
                @row-click="handleTestSelection($event)"
            >
                <template #tags="{ row }">
                    <span class="tag is-primary is-light mr-2" v-for="tag in (row as Test).tags?.slice(0, 5)">{{ tag }}</span>
                </template>
            </TableVue>
        </div>
    </div>
</template>

<script setup lang="ts">
import TableVue, { TableColumn } from '@renderer/components/Table.vue';
import { Test } from '@renderer/db/models/test';
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { TestPackageMarshaller } from '@renderer/services/test-package-service/test-package-marshaller';
import { BulmaToast, BulmaToastService } from '@renderer/vue-config/bulma-toast/bulma-toast';
import { from, useObservable } from '@vueuse/rxjs';

import { liveQuery } from 'dexie';
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useMemoize } from '@vueuse/core';

const $toast = inject<BulmaToastService>(BulmaToast)!;
const $router = useRouter();

const data = useObservable(from(liveQuery(async () => await KuebikoDb.INSTANCE.tests.toArray())));

const columns = computed(
    () =>
        [
            {
                title: 'Title',
                key: 'title',
                sortable: true,
            },
            {
                title: 'Questions',
                key: 'questions',
                sortable: true,
                computed: useMemoize((v: Test) => v.sections.reduce((total, next) => total + next.questionRefs.length, 0)),
            },
            {
                title: 'Tags',
                key: 'tags',
            },
        ] as TableColumn[],
);

const importTestPackage = async (e: InputEvent) => {
    const packageFile = (e.target as HTMLInputElement).files?.[0];

    if (packageFile) {
        try {
            await TestPackageMarshaller.unmarshal(packageFile, KuebikoDb.INSTANCE);
        } catch (e) {
            $toast.danger({ message: `Uh oh! An error occurred during import: ${e}` });
        }
    }

    (e.target as HTMLInputElement).value = '';
};

const handleTestSelection = async (test: Test) => {
    console.log(`/test/${test.uuid}`);
    $router.push(`/test/${test.uuid}`);
};
</script>

<style scoped lang="scss"></style>
@renderer/db/kuebiko-db
