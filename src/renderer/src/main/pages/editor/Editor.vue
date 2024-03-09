<template>
    <NavVue />
    <div class="container is-max-widescreen mt-4">
        <router-view />
    </div>
</template>

<script setup lang="ts">
import NavVue from '@renderer/components/Nav.vue';
import { TableColumn } from '@renderer/components/Table.vue';
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

onBeforeMount(() => (helmetStore.title = t('homeTitle')));

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
        "homeTitle": "Kuebiko :: Home",
        "tests": "Tests"
    }
}
</i18n>
