<template>
    <div class="section">
        <h1 class="title mb-1">{{ test?.title }}</h1>
        <div class="box">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { KuebikoDb } from '@renderer/db/kuebiko-db';
import { Test } from '@renderer/db/models/test';
import { AttemptsService } from '@renderer/services/attempts-service';
import { useHelmetStore } from '@renderer/store/helmet-store/helmet-store';
import { useObservable } from '@vueuse/rxjs';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

// see https://chartjs-plugin-datalabels.netlify.app/
import { ChartData, Chart as ChartJS, ChartOptions, Legend, LineController, LineElement, LinearScale, TimeScale, Tooltip } from 'chart.js';
import { DistributiveArray } from 'chart.js/dist/types/utils';
import 'chartjs-adapter-date-fns';
import { Line } from 'vue-chartjs';

import { differenceInSeconds } from 'date-fns';

const { t } = useI18n({ inheritLocale: true, useScope: 'local', fallbackRoot: true });
const route = useRoute();
const helmetStore = useHelmetStore();
const test = ref<Test>();

const attempts = useObservable(AttemptsService.fetchAttemptHistoryForTest(route.params['testUuid'] as string));

onBeforeMount(async () => {
    test.value = await KuebikoDb.INSTANCE.tests
        .where('uuid')
        .equals(route.params['testUuid'] as string)
        .first();
    helmetStore.title = `Kuebiko :: ${t('attemptsForTest', [test.value?.title])}`;
});

watch(attempts, (a) => {
    console.log(a);
});

ChartJS.register(LineController, LineElement, TimeScale, LinearScale, Tooltip, Legend);

const chartOptions = computed(
    () =>
        ({
            responsive: true,
            plugins: {
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
                            return `${item.dataset.label}: ${item.datasetIndex === 2 ? (item.parsed.y / 60).toFixed(2) : item.parsed.y.toString()}`;
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
                        minUnit: 'minute',
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
                        text: 'Score (%)',
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
                        callback: (tickValue: number) => {
                            return (tickValue / 60.0).toFixed(2);
                        },
                    },

                    // grid line settings
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
</script>

<style scoped></style>

<i18n lang="json">
{
    "en": {
        "attemptsForTest": "Attempts :: {0}"
    }
}
</i18n>
