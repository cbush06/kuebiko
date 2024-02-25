<template>
    <div class="section">
        <h1 class="title mb-1">{{ t('attempts') }}</h1>
        <div class="box">
            <TableVue
                :data="attempts"
                :columns="columns"
                :hoverable="true"
                :clickable="true"
                :sort="{ key: 'testTitle', direction: 'asc' }"
                @row-click="handleSelection($event)"
            >
                <template #testTitle="{ row }">
                    <router-link :to="`/attempts/${(row as AttemptTestRollup).testUuid}`" class="is-underlined">
                        {{ (row as AttemptTestRollup).testTitle }}
                    </router-link>
                </template>
            </TableVue>
        </div>
    </div>
</template>

<script setup lang="ts">
import TableVue, { TableColumn } from '@renderer/components/Table.vue';
import { AttemptTestRollup, AttemptsService } from '@renderer/services/attempts-service';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { useObservable } from '@vueuse/rxjs';
import { format } from 'date-fns';
import { computed, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const helmetStore = useHelmetStore();
const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });

onBeforeMount(() => (helmetStore.title = `Kuebiko :: ${t('attempts')}`));

const attempts = useObservable(AttemptsService.fetchAttemptRollupByTest());
const columns = computed(
    () =>
        [
            {
                title: 'Test',
                key: 'testTitle',
                sortable: true,
            },
            {
                title: 'Last Attempt',
                key: 'lastAttempt',
                sortable: true,
                computed: (v) => format(v.lastAttempt, 'MMM d, yyyy h:mm aa'),
            },
            {
                title: 'Last Score',
                key: 'lastScore',
                sortable: true,
                computed: (v) => `${Math.round(v.lastScore * 100)}%`,
            },
            {
                title: '# of Attempts',
                key: 'attemptCount',
                sortable: true,
            },
        ] as TableColumn<AttemptTestRollup>[],
);

const handleSelection = (selection: AttemptTestRollup) => {
    router.push(`/attempts/${selection.testUuid}`);
};
</script>

<style scoped></style>

<i18n lang="json">
{
    "en": {
        "attempts": "Attempts"
    }
}
</i18n>
@renderer/services/attempts-service@renderer/store/helmet-store/helmet-store
