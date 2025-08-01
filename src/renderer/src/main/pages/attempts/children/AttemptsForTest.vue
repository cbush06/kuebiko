<template>
    <div class="section">
        <h1 class="title mb-1">{{ test?.title }}</h1>
        <div class="box chart-box">
            <Line :data="chartData" :options="chartOptions" />
        </div>
        <div class="box">
            <!-- prettier-ignore -->
            <TableVue
                :data="attempts"
                :columns="columns"
                :hoverable="true"
                :clickable="true"
                :sort="{ key: 'completed', direction: 'desc' }"
            >
                <template #completed="{ row }">
                    <router-link :to="`/attempts/${(row as Attempt).testRef}/${(row as Attempt).uuid}`" class="is-underlined">
                        {{ format(row['completed'], 'MMM d, yyyy h:mm aa') }}
                    </router-link>
                </template>
                <template #format="{ row }">
                    <span v-if="row['format'] === 'PREPARE'" class="tag is-primary">
                        {{ t('prepare') }}
                    </span>
                    <span v-else-if="row['format'] === 'SIMULATE'" class="tag is-info">
                        {{ t('simulate') }}
                    </span>
                </template>
            </TableVue>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Test } from '@renderer/db/models/test';
import { AttemptsService } from '@renderer/services/attempts-service';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { useObservable } from '@vueuse/rxjs';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

// see https://chartjs-plugin-datalabels.netlify.app/
import {
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    TimeScale,
    Tooltip,
} from 'chart.js';
import { DistributiveArray } from 'chart.js/dist/types/utils';
import 'chartjs-adapter-date-fns';
import { Line } from 'vue-chartjs';

import TableVue, { TableColumn } from '@renderer/components/table/Table.vue';
import { Attempt } from '@renderer/db/models/attempt';
import { differenceInSeconds, format, intervalToDuration } from 'date-fns';
import { DeliveryTestObjectProvider } from '@renderer/services/delivery-test-object-provider';

const { t } = useI18n();
const route = useRoute();
const helmetStore = useHelmetStore();
const test = ref<Test>();

const attempts = useObservable(
    AttemptsService.fetchAttemptHistoryForTest(route.params['testUuid'] as string),
);

onBeforeMount(async () => {
    test.value = await DeliveryTestObjectProvider.fetchTest(route.params['testUuid'] as string);
    helmetStore.title = `Kuebiko :: ${t('attemptsForTest', [test.value?.title])}`;
});

ChartJS.register(
    LineController,
    LineElement,
    TimeScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
);
const formatDuration = (intervalMs: number) => {
    const duration = intervalToDuration({ start: 0, end: intervalMs });
    return duration.hours
        ? `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`
        : `${duration.minutes ?? 0}m ${duration.seconds ?? 0}s`;
};

const chartOptions = computed(
    () =>
        ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    display: false,
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        filter: (item) => {
                            return item.text !== 'Date';
                        },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (item) => {
                            if (item.datasetIndex === 1) {
                                return `${t('score')}: ${item.parsed.y}%`;
                            } else if (item.datasetIndex === 2) {
                                return `Duration: ${formatDuration(item.parsed.y * 1000)}`;
                            }
                            return item.dataset[item.dataIndex];
                        },
                    },
                },
            },
            scales: {
                x: {
                    type: 'time',
                    title: {
                        text: 'Date',
                        display: true,
                    },
                    time: {
                        displayFormats: {
                            second: 'h:mm aa',
                            miute: 'h:mm aa',
                            hour: 'h:mm aa',
                            day: 'MMM d',
                            month: 'MMM yyyy',
                        },
                    },
                    position: 'bottom',
                },
                y: {
                    type: 'linear',
                    title: {
                        text: `${t('score')} (%)`,
                        display: true,
                    },
                    position: 'left',
                },
                y1: {
                    type: 'linear',
                    title: {
                        text: 'Duration (min)',
                        display: true,
                    },
                    position: 'right',
                    ticks: {
                        callback: (tickValue: number) => formatDuration(tickValue * 1000),
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            },
        }) as ChartOptions<'line'>,
);

const chartData = computed(
    () =>
        ({
            datasets: [
                {
                    label: 'Date',
                    data: attempts.value?.map((a) => ({ x: a.completed!.toISOString() })) ?? [],
                    parsing: false,
                    xAxisID: 'x',
                },
                {
                    label: 'Score (%)',
                    data:
                        attempts.value?.map((a) => ({
                            x: a.completed?.toISOString(),
                            y: Math.round(a.score * 100),
                        })) ?? [],
                    borderColor: '#04D1B2',
                    backgroundColor: '#EAFFFC',
                    yAxisID: 'y',
                },
                {
                    label: 'Duration (mins)',
                    data:
                        attempts.value?.map((a) => ({
                            x: a.completed?.toISOString(),
                            y: differenceInSeconds(a.completed!, a.started!),
                        })) ?? [],
                    borderColor: '#B5B5B5',
                    backgroundColor: '#F5F5F5',
                    yAxisID: 'y1',
                },
            ],
        }) as ChartData<'line', DistributiveArray<any>>,
);

const columns = computed(
    () =>
        [
            {
                title: t('attempt'),
                key: 'completed',
                sortable: true,
            },
            {
                title: t('score'),
                key: 'score',
                sortable: true,
                formatter: (v) => Math.round(v * 100) + '%',
            },
            {
                title: 'Duration',
                key: 'duration',
                sortable: true,
                computed: (a) => {
                    const duration = intervalToDuration({
                        start: 0,
                        end: differenceInSeconds(a.completed!, a.started!) * 1000,
                    });
                    return (
                        (duration.hours ? `${duration.hours}:` : '') +
                        `${String(duration.minutes ?? 0).padStart(2, '0')}:${String(duration.seconds ?? 0).padStart(2, '0')}`
                    );
                },
            },
            {
                title: 'Correct',
                key: 'correct',
                sortable: true,
                computed: (a) => a.questionResponses.filter((q) => q.credit > 0).length,
            },
            {
                title: 'Incorrect',
                key: 'incorrect',
                sortable: true,
                computed: (a) =>
                    a.questionResponses.filter(
                        (q) =>
                            q.response !== undefined &&
                            (!Array.isArray(q.response) || q.response.length > 0) &&
                            q.credit < 1,
                    ).length,
            },
            {
                title: 'Skipped',
                key: 'skipped',
                sortable: true,
                computed: (a) =>
                    a.questionResponses.filter(
                        (q) =>
                            q.response === undefined ||
                            (Array.isArray(q.response) && q.response.length === 0),
                    ).length,
            },
            {
                title: 'Format',
                key: 'format',
                sortable: true,
            },
        ] as TableColumn<Attempt>[],
);
</script>

<style scoped>
.box.chart-box {
    min-height: 50vh;
}
</style>

<i18n lang="json">
{
    "en": {
        "attemptsForTest": "Attempts :: {0}"
    }
}
</i18n>
