<template>
    <div class="w-100 h-100">
        <div
            class="container is-max-widescreen mt-4 section is-flex is-flex-direction-column is-flex-gap-2"
        >
            <h1 class="title mb-1">{{ t('projects') }}</h1>
            <div class="box is-flex is-flex-gap-2 is-justify-content-flex-end p-2">
                <div class="file is-info">
                    <label class="file-label">
                        <input
                            class="file-input"
                            type="file"
                            @input="importTestPackage($event as InputEvent)"
                        />
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="fa-solid fa-upload"></i>
                            </span>
                            <span class="file-label"> Import a Project... </span>
                        </span>
                    </label>
                </div>
                <router-link to="/editor/edit" class="button is-primary">
                    <span class="icon">
                        <i class="fa-solid fa-plus"></i>
                    </span>
                    <span> Create New Project </span>
                </router-link>
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
                    <template #title="{ row }">
                        <router-link :to="`/test/${(row as Test).uuid}`" class="is-underlined">{{ (row as Test).title }}</router-link>
                    </template>
                    <template #tags="{ row }">
                        <span class="tag is-primary is-light mr-2" v-for="tag in (row as Test).tags?.slice(0, 5)">{{ tag }}</span>
                    </template>
                </TableVue>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TableVue, { TableColumn } from '@renderer/components/table/Table.vue';
import { Test } from '@renderer/db/models/test';
import { EditorTestsService } from '@renderer/services/editor-tests-service';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { BulmaToast, BulmaToastService } from '@renderer/vue-config/bulma-toast/bulma-toast';
import { useMemoize } from '@vueuse/core';
import { useObservable } from '@vueuse/rxjs';
import { computed, inject, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const helmetStore = useHelmetStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });

onBeforeMount(() => (helmetStore.title = t('title')));

const toast = inject<BulmaToastService>(BulmaToast)!;
const router = useRouter();

const data = useObservable(EditorTestsService.fetchAllTests());

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
                computed: useMemoize((v: Test) =>
                    v.sections.reduce((total, next) => total + next.questionRefs.length, 0),
                ),
            },
            {
                title: 'Version',
                key: 'version',
            },
            {
                title: 'Tags',
                key: 'tags',
            },
        ] as TableColumn<Test>[],
);

const importTestPackage = async (e: InputEvent) => {
    // const packageFile = (e.target as HTMLInputElement).files?.[0];
    // if (packageFile) {
    //     try {
    //         await TestPackageMarshaller.unmarshal(packageFile, KuebikoDb.INSTANCE);
    //     } catch (e) {
    //         toast.danger({ message: `Uh oh! An error occurred during import: ${e}` });
    //     }
    // }
    // (e.target as HTMLInputElement).value = '';
};

const handleTestSelection = async (test: Test) => {
    router.push(`/editor/${test.uuid}`);
};
</script>

<style scoped lang="scss"></style>

<i18n lang="json">
{
    "en": {
        "title": "Kuebiko :: Editor",
        "projects": "Projects"
    }
}
</i18n>
